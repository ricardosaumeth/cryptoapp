import type { Middleware } from "@reduxjs/toolkit"
import { Connection } from "./Connection"
import { updateStaleSubscription, type SubscriptionEntry } from "./slice"
import { performanceMetrics } from "../../services/performanceMetrics"
import { performanceTracker } from "../../services/performanceTracker"
import { handleSubscriptionAck, handleUnSubscriptionAck, handlers } from "./handlers"

export const createWsMiddleware = (connection: Connection): Middleware => {
  return (store) => {
    connection.onReceive((data) => {
      const parsedData = JSON.parse(data)
      console.log(parsedData)
      if (parsedData.event === "subscribed") {
        handleSubscriptionAck(parsedData, store)
        return
      } else if (parsedData.event === "unsubscribed") {
        handleUnSubscriptionAck(parsedData, store)
        return
      }

      if (Array.isArray(parsedData)) {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId] as SubscriptionEntry

        if (!subscription) {
          return
        }

        if (parsedData[1] === "hb") {
          if (subscription.isStale) {
            store.dispatch(updateStaleSubscription({ channelId }))
          }
          return
        }

        // Clear stale for current channel
        store.dispatch(updateStaleSubscription({ channelId }))

        // Track performance metrics
        performanceMetrics.trackUpdate(subscription.channel)

        // Clear stale for ALL subscriptions since WebSocket is active
        const allSubscriptions = store.getState().subscriptions
        Object.keys(allSubscriptions).forEach((key) => {
          const channelId = Number(key)
          if (!isNaN(channelId) && allSubscriptions[channelId]?.isStale) {
            store.dispatch(updateStaleSubscription({ channelId }))
          }
        })

        const handler = handlers[subscription.channel]
        if (!handler) return

        const start = performance.now()
        handler(parsedData, subscription, store.dispatch)
        const latency = performance.now() - start
        performanceTracker.updateLatency(subscription.channel, latency)
      }
    })

    return (next) => (action) => next(action)
  }
}
