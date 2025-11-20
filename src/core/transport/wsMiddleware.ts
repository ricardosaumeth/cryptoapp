import { Connection } from "./Connection"
import { updateTrades, addTrade } from "../../modules/trades/slice"
import { updateTicker } from "../../modules/tickers/slice"
import type { Middleware } from "@reduxjs/toolkit"
import { subscribeToChannelAck } from "./slice"

export const createWsMiddleware = (connection: Connection): Middleware => {
  return (store) => (next) => (action) => {
    connection.onReceive((data) => {
      const parsedData = JSON.parse(data)
      console.log("parsedData", parsedData)

      // Handle subscription acknowledgment
      if (parsedData.event === "subscribed") {
        store.dispatch(
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

        return
      }

      // Handle heartbeat
      if (Array.isArray(parsedData) && parsedData[1] === "hb") {
        return
      }

      // Handle channel data
      if (Array.isArray(parsedData)) {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId]

        if (subscription?.channel === "trades") {
          const { request } = subscription
          const { symbol } = request
          const currencyPair = symbol.slice(1)

          if (Array.isArray(parsedData[1])) {
            // Snapshot
            const [, rawTrades] = parsedData
            const trades = rawTrades.map(([id, timestamp, amount, price]) => ({
              id,
              timestamp,
              amount,
              price,
            }))
            store.dispatch(updateTrades({ currencyPair, trades }))
          } else {
            // Single trade update
            const [, , trade] = parsedData
            const [id, timestamp, amount, price] = trade
            const formattedTrade = { id, timestamp, amount, price }
            store.dispatch(addTrade({ currencyPair, trade: formattedTrade }))
          }
        } else if (subscription?.channel === "ticker") {
          const { request } = subscription
          const { symbol } = request

          store.dispatch(updateTicker({ symbol, data: parsedData }))
        }
      }
    })

    return next(action)
  }
}
