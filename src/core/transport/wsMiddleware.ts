import { Connection } from "./Connection"
import { updateTrades, addTrade } from "../../modules/trades/slice"
import type { Middleware } from "@reduxjs/toolkit"
import { subscribeToChannelAck } from "./slice"

export const createWsMiddleware = (connection: Connection): Middleware => {
  return (store) => (next) => (action) => {
    connection.onReceive((data) => {
      const parsedData = JSON.parse(data)

      // Handle subscription acknowledgment
      if (parsedData.event === "subscribed" && parsedData.channel === "trades") {
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

      // Handle trade data
      if (Array.isArray(parsedData)) {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId]

        if (subscription?.channel === "trades") {
          const { request } = subscription
          const { symbol } = request

          if (Array.isArray(parsedData[1])) {
            // Snapshot
            const [, trades] = parsedData
            const formattedTrades = trades.map((t) => {
              const [id, timestamp, amount, price] = t as [number, number, number, number]
              return { id, timestamp, amount, price }
            })

            store.dispatch(updateTrades({ symbol, trades: formattedTrades }))
          } else {
            // Single trade update
            const [, , trade] = parsedData
            const [id, timestamp, amount, price] = trade
            const formattedTrade = { id, timestamp, amount, price }
            store.dispatch(addTrade({ symbol, trade: formattedTrade }))
          }
        }
      }
    })

    return next(action)
  }
}
