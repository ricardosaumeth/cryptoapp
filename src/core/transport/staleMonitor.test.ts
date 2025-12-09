import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { startStaleMonitor } from "./staleMonitor"

vi.mock("./slice", () => ({
  markSubscriptionStale: vi.fn((payload) => ({ type: "subscriptions/markStale", payload })),
}))

describe("staleMonitor", () => {
  let mockGetState: any
  let mockDispatch: any
  let cleanup: () => void

  beforeEach(() => {
    vi.useFakeTimers()
    mockDispatch = vi.fn()
  })

  afterEach(() => {
    if (cleanup) cleanup()
    vi.useRealTimers()
  })

  it("should mark subscription as stale after 20 seconds without update", () => {
    const now = Date.now()
    mockGetState = vi.fn(
      () =>
        ({
          subscriptions: {
            12345: {
              channel: "trades",
              isStale: false,
              lastUpdate: now - 21000, // 21 seconds ago
            },
          },
        }) as any
    )

    cleanup = startStaleMonitor(mockGetState, mockDispatch)

    vi.advanceTimersByTime(5000)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "subscriptions/markStale",
      payload: { channelId: 12345 },
    })
  })

  it("should not mark subscription as stale if updated recently", () => {
    const now = Date.now()
    mockGetState = vi.fn(
      () =>
        ({
          subscriptions: {
            12345: {
              channel: "trades",
              isStale: false,
              lastUpdate: now - 5000, // 5 seconds ago
            },
          },
        }) as any
    )

    cleanup = startStaleMonitor(mockGetState, mockDispatch)

    vi.advanceTimersByTime(5000)

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it("should not mark subscription as stale if already stale", () => {
    const now = Date.now()
    mockGetState = vi.fn(
      () =>
        ({
          subscriptions: {
            12345: {
              channel: "trades",
              isStale: true,
              lastUpdate: now - 30000, // 30 seconds ago
            },
          },
        }) as any
    )

    cleanup = startStaleMonitor(mockGetState, mockDispatch)

    vi.advanceTimersByTime(5000)

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it("should not mark subscription as stale if no lastUpdate", () => {
    mockGetState = vi.fn(
      () =>
        ({
          subscriptions: {
            12345: {
              channel: "trades",
              isStale: false,
            },
          },
        }) as any
    )

    cleanup = startStaleMonitor(mockGetState, mockDispatch)

    vi.advanceTimersByTime(5000)

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it("should handle multiple subscriptions", () => {
    const now = Date.now()
    mockGetState = vi.fn(
      () =>
        ({
          subscriptions: {
            12345: {
              channel: "trades",
              isStale: false,
              lastUpdate: now - 25000, // stale
            },
            12346: {
              channel: "ticker",
              isStale: false,
              lastUpdate: now - 5000, // fresh
            },
            12347: {
              channel: "book",
              isStale: false,
              lastUpdate: now - 30000, // stale
            },
          },
        }) as any
    )

    cleanup = startStaleMonitor(mockGetState, mockDispatch)

    vi.advanceTimersByTime(5000)

    expect(mockDispatch).toHaveBeenCalledTimes(2)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "subscriptions/markStale",
      payload: { channelId: 12345 },
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "subscriptions/markStale",
      payload: { channelId: 12347 },
    })
  })

  it("should cleanup interval on return function call", () => {
    mockGetState = vi.fn(() => ({ subscriptions: {} }) as any)

    cleanup = startStaleMonitor(mockGetState, mockDispatch)
    cleanup()

    vi.advanceTimersByTime(10000)

    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
