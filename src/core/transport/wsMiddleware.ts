import type { Middleware } from "@reduxjs/toolkit"
import { Connection } from "./Connection"
import { tradesSnapshotReducer, tradesUpdateReducer } from "../../modules/trades/slice"
import { updateTicker } from "../../modules/tickers/slice"
import {
  subscribeToChannelAck,
  unSubscribeToChannelAck,
  type requestSubscribeToChannelAck,
} from "./slice"
import { candlesSnapshotReducer, candlesUpdateReducer } from "../../modules/candles/slice"
import { bookSnapshotReducer, bookUpdateReducer } from "../../modules/book/slice"
import { Channel } from "./types/Channels"
import type { RawTrade, Trade } from "../../modules/trades/types/Trade"
import { getLookupKey } from "../../modules/candles/utils"

const handleSubscriptionAck = (parsedData: any, store: any) => {
  const { chanId: channelId, channel, event, symbol, key, prec } = parsedData

  const request: requestSubscribeToChannelAck = {
    event,
    channel,
  }

  switch (channel) {
    case Channel.CANDLES:
      request.key = key
      break

    case Channel.BOOK:
      request.prec = prec
      request.symbol = symbol
      delete request.event
      break

    case Channel.TRADES:
    case Channel.TICKER:
      request.symbol = symbol
      break

    default:
      console.warn("Unhandled channel:", channel)
  }

  store.dispatch(
    subscribeToChannelAck({
      channelId,
      channel,
      request,
    })
  )
}

const handleUnSubscriptionAck = (parsedData: any, store: any) => {
  const { chanId: channelId } = parsedData
  store.dispatch(unSubscribeToChannelAck({ channelId }))
}

const handleTradesData = (parsedData: any[], subscription: any, dispatch: any) => {
  const currencyPair = subscription.request.symbol.slice(1)

  if (Array.isArray(parsedData[1])) {
    // Snapshot
    const [, rawTrades] = parsedData
    const trades: Trade[] = rawTrades
      .sort((a: RawTrade, b: RawTrade) => b[1] - a[1])
      .map(([id, timestamp, amount, price]: RawTrade) => ({
        id,
        timestamp,
        amount,
        price,
      }))
    dispatch(tradesSnapshotReducer({ currencyPair, trades }))
  } else {
    // Single trade update
    const [, , trade] = parsedData
    const [id, timestamp, amount, price] = trade
    dispatch(tradesUpdateReducer({ currencyPair, trade: { id, timestamp, amount, price } }))
  }
}

const handleTickerData = (parsedData: any[], subscription: any, dispatch: any) => {
  dispatch(updateTicker({ symbol: subscription.request.symbol, data: parsedData }))
}

const handleCandlesData = (parsedData: any[], subscription: any, dispatch: any) => {
  const { key } = subscription.request
  const [, timeframe, symbol] = key.split(":")
  const currencyPair = symbol.slice(1)
  const lookupKey = getLookupKey(currencyPair, timeframe)

  if (Array.isArray(parsedData[1][0])) {
    // Snapshot
    const [, candles] = parsedData
    dispatch(candlesSnapshotReducer({ lookupKey, candles }))
  } else {
    // Single candle update
    const [, candle] = parsedData
    dispatch(candlesUpdateReducer({ lookupKey, candle }))
  }
}

const handleBookData = (parsedData: any[], subscription: any, dispatch: any) => {
  const currencyPair = subscription.request.symbol.slice(1)
  if (Array.isArray(parsedData[1][0])) {
    // Snapshot
    const [, orders] = parsedData
    dispatch(bookSnapshotReducer({ currencyPair, orders }))
  } else {
    // Single candle update
    const [, order] = parsedData
    dispatch(bookUpdateReducer({ currencyPair, order }))
  }
}

export const createWsMiddleware = (connection: Connection): Middleware => {
  return (store) => (next) => (action) => {
    connection.onReceive((data) => {
      const parsedData = JSON.parse(data)
      //console.log("parsedData", parsedData)

      if (parsedData.event === "subscribed") {
        handleSubscriptionAck(parsedData, store)
        return
      } else if (parsedData.event === "unsubscribed") {
        handleUnSubscriptionAck(parsedData, store)
        return
      }

      if (Array.isArray(parsedData) && parsedData[1] === "hb") {
        return
      }

      if (Array.isArray(parsedData)) {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId]

        switch (subscription?.channel) {
          case Channel.TRADES:
            handleTradesData(parsedData, subscription, store.dispatch)
            break

          case Channel.TICKER:
            handleTickerData(parsedData, subscription, store.dispatch)
            break

          case Channel.CANDLES:
            handleCandlesData(parsedData, subscription, store.dispatch)
            break

          case Channel.BOOK:
            handleBookData(parsedData, subscription, store.dispatch)
            break

          default:
            console.warn("Unhandled channel:", subscription?.channel)
            break
        }
      }
    })

    return next(action)
  }
}
