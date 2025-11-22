import type { Middleware } from "@reduxjs/toolkit"
import { Connection } from "./Connection"
import { tradesSnapshotReducer, tradesUpdateReducer } from "../../modules/trades/slice"
import { updateTicker } from "../../modules/tickers/slice"
import { subscribeToChannelAck } from "./slice"
import { candlesSnapshotReducer, candlesUpdateReducer } from "../../modules/candles/slice"
import { Channel } from "./types/Channels"

const handleSubscriptionAck = (parsedData: any, store: any) => {
  const { chanId: channelId, channel, event, symbol, key } = parsedData

  store.dispatch(
    subscribeToChannelAck({
      channelId,
      channel,
      request: key ? { channel, event, key } : { channel, event, symbol },
    })
  )
}

const handleTradesData = (parsedData: any[], subscription: any, dispatch: any) => {
  const currencyPair = subscription.request.symbol.slice(1)

  if (Array.isArray(parsedData[1])) {
    // Snapshot
    const [, rawTrades] = parsedData
    const trades = rawTrades.map(([id, timestamp, amount, price]: any[]) => ({
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
  const [, , symbol] = key.split(":")
  const currencyPair = symbol.slice(1)

  if (Array.isArray(parsedData[1][0])) {
    // Snapshot
    const [, candles] = parsedData
    dispatch(candlesSnapshotReducer({ currencyPair, candles }))
  } else {
    // Single candle update
    const [, candle] = parsedData
    dispatch(candlesUpdateReducer({ currencyPair, candle }))
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
      }

      if (Array.isArray(parsedData) && parsedData[1] === "hb") {
        return
      }

      if (Array.isArray(parsedData)) {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId]

        if (subscription?.channel === Channel.TRADES) {
          handleTradesData(parsedData, subscription, store.dispatch)
        } else if (subscription?.channel === Channel.TICKER) {
          handleTickerData(parsedData, subscription, store.dispatch)
        } else if (subscription?.channel === Channel.CANDLES) {
          handleCandlesData(parsedData, subscription, store.dispatch)
        }
      }
    })

    return next(action)
  }
}
