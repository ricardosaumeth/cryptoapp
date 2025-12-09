import { createSelector } from "reselect"
import { type RootState } from "../../modules/redux/store"
import { Channel } from "./types/Channels"

const subscriptionsSelector = (state: RootState) => state.subscriptions

export const getSubscriptionId = createSelector(
  [
    subscriptionsSelector,
    (_: RootState, channel: Channel) => channel,
    (_: RootState, _channel: Channel, symbol?: string) => symbol,
  ],
  (subscriptions, channel, symbol) => {
    const channelIds = Object.keys(subscriptions)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)

    return channelIds.find((id) => {
      const sub = subscriptions[id]
      if (sub?.channel !== channel) return false
      if (symbol) {
        const targetSymbol = `t${symbol}`
        if (sub?.request?.symbol !== targetSymbol && !sub?.request?.key?.includes(targetSymbol)) {
          return false
        }
      }
      return true
    })
  }
)

export const getIsSubscriptionStale = createSelector(
  [subscriptionsSelector, (_: RootState, subscriptionId: number) => subscriptionId],
  (subscriptions, subscriptionId) => Boolean(subscriptions[subscriptionId]?.isStale)
)
