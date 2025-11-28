import { createSelector } from "reselect"
import { type RootState } from "../../modules/redux/store"
import { Channel } from "./types/Channels"

const subscriptionsSelector = (state: RootState) => state.subscriptions

export const getSubscriptions = createSelector(
  subscriptionsSelector,
  (subscriptions) => subscriptions
)

export const getSubscriptionId = createSelector(
  getSubscriptions,
  (subscriptions) => (channel: Channel) => {
    if (Object.keys(subscriptions).length === 1) {
      return 0.0
    }

    const channelIds = Object.keys(subscriptions)
      .filter((key) => !isNaN(Number(key))) // avoid NaN from wsConnectionStatus
      .map(Number)

    return channelIds.find((channelId) => {
      const sub = subscriptions[channelId]
      return sub?.channel === channel
    })
  }
)

export const getIsSubscriptionStale = createSelector(
  getSubscriptions,
  (subscriptions) => (subscriptionId: number) => Boolean(subscriptions[subscriptionId]?.isStale)
)
