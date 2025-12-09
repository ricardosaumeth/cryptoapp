import type { Middleware } from "@reduxjs/toolkit"
import { Connection } from "./Connection"
import { updateStaleSubscription } from "./slice"
import { Channel } from "./types/Channels"
import { handlePong } from "../../modules/ping/slice"
import {
  handleSubscriptionAck,
  handleUnSubscriptionAck,
  handleTradesData,
  handleTickerData,
  handleCandlesData,
  handleBookData,
} from "./handlers"

export const createWsMiddleware = (connection: Connection): Middleware => {
  return (store) => {
    // Register handler only once when middleware is created
    connection.onReceive((data) => {
      const parsedData = JSON.parse(data)
      //console.log("parsedData", parsedData)

      if (parsedData.event === "subscribed") {
        handleSubscriptionAck(parsedData, store)
        return
      } else if (parsedData.event === "unsubscribed") {
        handleUnSubscriptionAck(parsedData, store)
        return
      } else if (parsedData.event === "pong") {
        store.dispatch(handlePong())
        return
      }

      if (Array.isArray(parsedData) && parsedData[1] === "hb") {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId]
        if (subscription?.isStale) {
          store.dispatch(updateStaleSubscription({ channelId }))
        }
        return
      }

      if (Array.isArray(parsedData)) {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId]

        if (!subscription) {
          return
        }

        switch (subscription.channel) {
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
            console.warn("Unhandled channel:", subscription.channel)
            break
        }
      }
    })

    return (next) => (action) => next(action)
  }
}
