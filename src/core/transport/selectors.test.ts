import { describe, it, expect } from "vitest"
import { getSubscriptionId, getIsSubscriptionStale } from "./selectors"
import { Channel } from "./types/Channels"
import { ConnectionStatus } from "./types/ConnectionStatus"
import type { RootState } from "../../modules/redux/store"

describe("transport selectors", () => {
  const mockState: Partial<RootState> = {
    subscriptions: {
      12345: {
        channel: Channel.TRADES,
        request: { channel: "trades", symbol: "tBTCUSD" },
        isStale: true,
      },
      12346: {
        channel: Channel.TICKER,
        request: { channel: "ticker", symbol: "tETHUSD" },
        isStale: false,
      },
      12347: {
        channel: Channel.CANDLES,
        request: { channel: "candles", key: "trade:1m:tBTCUSD" },
        isStale: true,
      },
      wsConnectionStatus: ConnectionStatus.Connected,
    },
  }

  describe("getSubscriptionId", () => {
    it("should return subscription ID for existing channel", () => {
      const result = getSubscriptionId(mockState as RootState, Channel.TRADES)
      expect(result).toBe(12345)
    })

    it("should return subscription ID for ticker channel", () => {
      const result = getSubscriptionId(mockState as RootState, Channel.TICKER)
      expect(result).toBe(12346)
    })

    it("should return subscription ID for candles channel", () => {
      const result = getSubscriptionId(mockState as RootState, Channel.CANDLES)
      expect(result).toBe(12347)
    })

    it("should return undefined for non-existent channel", () => {
      const result = getSubscriptionId(mockState as RootState, Channel.BOOK)
      expect(result).toBeUndefined()
    })

    it("should handle empty subscriptions", () => {
      const emptyState = {
        subscriptions: { wsConnectionStatus: ConnectionStatus.Disconnected },
      }
      const result = getSubscriptionId(emptyState as RootState, Channel.TRADES)
      expect(result).toBeUndefined()
    })
  })

  describe("getIsSubscriptionStale", () => {
    it("should return true for stale subscription", () => {
      const result = getIsSubscriptionStale(mockState as RootState, 12345)
      expect(result).toBe(true)
    })

    it("should return false for fresh subscription", () => {
      const result = getIsSubscriptionStale(mockState as RootState, 12346)
      expect(result).toBe(false)
    })

    it("should return false for non-existent subscription", () => {
      const result = getIsSubscriptionStale(mockState as RootState, 99999)
      expect(result).toBe(false)
    })

    it("should be memoized - return same reference for same input", () => {
      const result1 = getIsSubscriptionStale(mockState as RootState, 12345)
      const result2 = getIsSubscriptionStale(mockState as RootState, 12345)
      expect(result1).toBe(result2)
    })
  })
})
