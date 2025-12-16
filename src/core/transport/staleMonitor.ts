import type { AppDispatch, RootState } from "../../modules/redux/store"
import { markSubscriptionStale } from "./slice"

const STALE_TIMEOUT_MS = 90000 // 90 seconds without heartbeat = stale
const STALE_CHECK_INTERVAL_MS = 30000 // Check every 30 seconds

export const startStaleMonitor = (getState: () => RootState, dispatch: AppDispatch) => {
  const intervalId = setInterval(() => {
    const state = getState()
    const now = Date.now()

    Object.keys(state.subscriptions).forEach((key) => {
      const channelId = Number(key)
      if (isNaN(channelId)) return

      const subscription = state.subscriptions[channelId]
      if (!subscription) return

      const { lastUpdate, isStale } = subscription

      if (lastUpdate && !isStale && now - lastUpdate > STALE_TIMEOUT_MS) {
        dispatch(markSubscriptionStale({ channelId }))
      }
    })
  }, STALE_CHECK_INTERVAL_MS)

  return () => clearInterval(intervalId)
}
