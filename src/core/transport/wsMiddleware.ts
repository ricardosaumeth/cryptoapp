import { Connection } from "./Connection"
import { updateTrades, addTrade } from "../../modules/trades/slice"
import { updateTicker } from "../../modules/tickers/slice"
import type { Middleware } from "@reduxjs/toolkit"
import { subscribeToChannelAck } from "./slice"

const handleSubscriptionAck = (parsedData: any, dispatch: any) => {
  dispatch(
    subscribeToChannelAck({
      channelId: parsedData.chanId,
      channel: parsedData.channel,
      request: {
        channel: parsedData.channel,
        event: parsedData.event,
        symbol: parsedData.symbol,
      },
    })
  )
}

const handleTradesData = (parsedData: any[], subscription: any, dispatch: any) => {
  const currencyPair = subscription.request.symbol.slice(1)

  if (Array.isArray(parsedData[1])) {
    const [, rawTrades] = parsedData
    const trades = rawTrades.map(([id, timestamp, amount, price]: any[]) => ({
      id,
      timestamp,
      amount,
      price,
    }))
    dispatch(updateTrades({ currencyPair, trades }))
  } else {
    const [, , trade] = parsedData
    const [id, timestamp, amount, price] = trade
    dispatch(addTrade({ currencyPair, trade: { id, timestamp, amount, price } }))
  }
}

const handleTickerData = (parsedData: any[], subscription: any, dispatch: any) => {
  dispatch(updateTicker({ symbol: subscription.request.symbol, data: parsedData }))
}

export const createWsMiddleware = (connection: Connection): Middleware => {
  return (store) => (next) => (action) => {
    connection.onReceive((data) => {
      const parsedData = JSON.parse(data)
      console.log("parsedData", parsedData)

      if (parsedData.event === "subscribed") {
        handleSubscriptionAck(parsedData, store.dispatch)
        return
      }

      if (Array.isArray(parsedData) && parsedData[1] === "hb") {
        return
      }

      if (Array.isArray(parsedData)) {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId]

        if (subscription?.channel === "trades") {
          handleTradesData(parsedData, subscription, store.dispatch)
        } else if (subscription?.channel === "ticker") {
          handleTickerData(parsedData, subscription, store.dispatch)
        }
      }
    })

    return next(action)
  }
}
