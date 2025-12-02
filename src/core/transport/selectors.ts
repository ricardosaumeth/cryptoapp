import { createSelector } from "reselect"
import { type RootState } from "../../modules/redux/store"
import { Channel } from "./types/Channels"

const subscriptionsSelector = (state: RootState) => state.subscriptions

export const getSubscriptionId = createSelector(
  [subscriptionsSelector, (_: RootState, channel: Channel) => channel],
  (subscriptions, channel) => {
    const channelIds = Object.keys(subscriptions)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)

    return channelIds.find((id) => subscriptions[id]?.channel === channel)
  }
)

export const getIsSubscriptionStale = createSelector(
  [subscriptionsSelector, (_: RootState, subscriptionId: number) => subscriptionId],
  (subscriptions, subscriptionId) => Boolean(subscriptions[subscriptionId]?.isStale)
)
