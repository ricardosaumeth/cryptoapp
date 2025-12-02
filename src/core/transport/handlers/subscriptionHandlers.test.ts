import { describe, it, expect, vi, beforeEach } from "vitest"
import { handleSubscriptionAck, handleUnSubscriptionAck } from "./subscriptionHandlers"

vi.mock("../slice", () => ({
  subscribeToChannelAck: vi.fn((payload) => ({ type: "subscriptions/ack", payload })),
  unSubscribeToChannelAck: vi.fn((payload) => ({ type: "subscriptions/unack", payload })),
}))

vi.mock("../types/Channels", () => ({
  Channel: {
    TRADES: "trades",
    TICKER: "ticker",
    CANDLES: "candles",
    BOOK: "book",
  },
}))

describe("subscriptionHandlers", () => {
  const mockStore = {
    dispatch: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("handleSubscriptionAck", () => {
    it("should handle trades subscription ack", () => {
      const ackData = {
        chanId: 12345,
        channel: "trades",
        event: "subscribed",
        symbol: "tBTCUSD",
      }

      handleSubscriptionAck(ackData, mockStore)

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: "subscriptions/ack",
        payload: {
          channelId: 12345,
          channel: "trades",
          request: {
            event: "subscribed",
            channel: "trades",
            symbol: "tBTCUSD",
          },
        },
      })
    })

    it("should handle candles subscription ack", () => {
      const ackData = {
        chanId: 12346,
        channel: "candles",
        event: "subscribed",
        key: "trade:1m:tBTCUSD",
      }

      handleSubscriptionAck(ackData, mockStore)

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: "subscriptions/ack",
        payload: {
          channelId: 12346,
          channel: "candles",
          request: {
            event: "subscribed",
            channel: "candles",
            key: "trade:1m:tBTCUSD",
          },
        },
      })
    })

    it("should handle book subscription ack", () => {
      const ackData = {
        chanId: 12347,
        channel: "book",
        event: "subscribed",
        symbol: "tBTCUSD",
        prec: "R0",
      }

      handleSubscriptionAck(ackData, mockStore)

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: "subscriptions/ack",
        payload: {
          channelId: 12347,
          channel: "book",
          request: {
            channel: "book",
            symbol: "tBTCUSD",
            prec: "R0",
          },
        },
      })
    })
  })

  describe("handleUnSubscriptionAck", () => {
    it("should handle unsubscription ack", () => {
      const unackData = { chanId: 12345 }

      handleUnSubscriptionAck(unackData, mockStore)

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: "subscriptions/unack",
        payload: { channelId: 12345 },
      })
    })
  })
})
