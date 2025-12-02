import { describe, it, expect, vi, beforeEach } from "vitest"
import { createWsMiddleware } from "./wsMiddleware"
import { Channel } from "./types/Channels"

// Mock all dependencies
vi.mock("./slice", () => ({
  updateStaleSubscription: vi.fn((payload) => ({ type: "subscriptions/updateStale", payload })),
}))

vi.mock("../../modules/ping/slice", () => ({
  handlePong: vi.fn(() => ({ type: "ping/pong" })),
}))

import * as handlers from "./handlers"

vi.mock("./handlers", () => ({
  handleSubscriptionAck: vi.fn(),
  handleUnSubscriptionAck: vi.fn(),
  handleTradesData: vi.fn(),
  handleTickerData: vi.fn(),
  handleCandlesData: vi.fn(),
  handleBookData: vi.fn(),
}))

describe("wsMiddleware", () => {
  let mockConnection: any
  let mockStore: any
  let mockNext: any
  let middleware: any
  let onReceiveCallback: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockConnection = {
      onReceive: vi.fn((callback) => {
        onReceiveCallback = callback
      }),
    }

    mockStore = {
      dispatch: vi.fn(),
      getState: vi.fn(() => ({
        subscriptions: {
          12345: { channel: Channel.TRADES },
          12346: { channel: Channel.TICKER },
          12347: { channel: Channel.CANDLES },
          12348: { channel: Channel.BOOK },
        },
      })),
    }

    mockNext = vi.fn()

    const wsMiddleware = createWsMiddleware(mockConnection)
    middleware = wsMiddleware(mockStore)(mockNext)
  })

  it("should setup onReceive callback", () => {
    const action = { type: "test" }
    middleware(action)

    expect(mockConnection.onReceive).toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalledWith(action)
  })

  it("should handle subscription acknowledgment", () => {
    middleware({ type: "test" })

    const subscriptionData = JSON.stringify({ event: "subscribed", chanId: 12345 })
    onReceiveCallback(subscriptionData)

    expect(handlers.handleSubscriptionAck).toHaveBeenCalledWith(
      { event: "subscribed", chanId: 12345 },
      mockStore
    )
  })

  it("should handle unsubscription acknowledgment", () => {
    middleware({ type: "test" })

    const unsubscriptionData = JSON.stringify({ event: "unsubscribed", chanId: 12345 })
    onReceiveCallback(unsubscriptionData)

    expect(handlers.handleUnSubscriptionAck).toHaveBeenCalledWith(
      { event: "unsubscribed", chanId: 12345 },
      mockStore
    )
  })

  it("should handle pong event", () => {
    middleware({ type: "test" })

    const pongData = JSON.stringify({ event: "pong" })
    onReceiveCallback(pongData)

    expect(mockStore.dispatch).toHaveBeenCalledWith({ type: "ping/pong" })
  })

  it("should ignore heartbeat messages", () => {
    middleware({ type: "test" })

    const heartbeatData = JSON.stringify([12345, "hb"])
    onReceiveCallback(heartbeatData)

    expect(mockStore.dispatch).not.toHaveBeenCalled()
  })

  it("should handle trades data", () => {
    middleware({ type: "test" })

    const tradesData = JSON.stringify([12345, [[1, 1640995200000, 0.5, 45000]]])
    onReceiveCallback(tradesData)

    expect(mockStore.dispatch).toHaveBeenCalledWith({
      type: "subscriptions/updateStale",
      payload: { channelId: 12345 },
    })
    expect(handlers.handleTradesData).toHaveBeenCalledWith(
      [12345, [[1, 1640995200000, 0.5, 45000]]],
      { channel: Channel.TRADES },
      mockStore.dispatch
    )
  })

  it("should handle ticker data", () => {
    middleware({ type: "test" })

    const tickerData = JSON.stringify([12346, [7364.9, 7365, 7364.8]])
    onReceiveCallback(tickerData)

    expect(handlers.handleTickerData).toHaveBeenCalledWith(
      [12346, [7364.9, 7365, 7364.8]],
      { channel: Channel.TICKER },
      mockStore.dispatch
    )
  })

  it("should handle candles data", () => {
    middleware({ type: "test" })

    const candlesData = JSON.stringify([12347, [1640995200000, 45000, 45100, 45200, 44900, 1.5]])
    onReceiveCallback(candlesData)

    expect(handlers.handleCandlesData).toHaveBeenCalledWith(
      [12347, [1640995200000, 45000, 45100, 45200, 44900, 1.5]],
      { channel: Channel.CANDLES },
      mockStore.dispatch
    )
  })

  it("should handle book data", () => {
    middleware({ type: "test" })

    const bookData = JSON.stringify([12348, [[45000, 2, 1.5]]])
    onReceiveCallback(bookData)

    expect(handlers.handleBookData).toHaveBeenCalledWith(
      [12348, [[45000, 2, 1.5]]],
      { channel: Channel.BOOK },
      mockStore.dispatch
    )
  })

  it("should warn for unhandled channels", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    mockStore.getState = vi.fn(() => ({
      subscriptions: {
        12349: { channel: "unknown" },
      },
    }))

    middleware({ type: "test" })

    const unknownData = JSON.stringify([12349, ["some", "data"]])
    onReceiveCallback(unknownData)

    expect(consoleSpy).toHaveBeenCalledWith("Unhandled channel:", "unknown")
    consoleSpy.mockRestore()
  })
})
