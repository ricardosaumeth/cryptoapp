import { createSelector } from "reselect"
import { type RootState } from "../../modules/redux/store"
import { ChannelTypeEnum } from "../../types/avro-types"
import type { requestSubscribeToChannelAck } from "./slice"

const subscriptionsSelector = (state: RootState) => state.subscriptions

export const getSubscriptions = subscriptionsSelector

export const getSubscriptionId = (
  channel: ChannelTypeEnum,
  request: { [key: string]: string } = {}
) =>
  createSelector(getSubscriptions, (subscriptions) => {
    const channelIds = Object.keys(subscriptions)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)

    const matchingChannels = channelIds.filter((channelId) => {
      const sub = subscriptions[channelId]
      return (
        sub?.channel === channel &&
        Object.keys(request).every(
          (key) => request[key] === sub?.request?.[key as keyof requestSubscribeToChannelAck]
        )
      )
    })

    // Return the most recent (highest ID) subscription
    return matchingChannels.length > 0 ? Math.max(...matchingChannels) : undefined
  })

export const getIsSubscriptionStale = createSelector(
  [subscriptionsSelector, (_: RootState, subscriptionId: number) => subscriptionId],
  (subscriptions, subscriptionId) => Boolean(subscriptions[subscriptionId]?.isStale)
)
