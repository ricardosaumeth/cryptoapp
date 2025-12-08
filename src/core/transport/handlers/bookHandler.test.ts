import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { handleBookData } from "./bookHandler"

vi.mock("../../../modules/book/slice", () => ({
  bookSnapshotReducer: vi.fn((payload) => ({ type: "book/snapshot", payload })),
  bookUpdateReducer: vi.fn((payload) => ({ type: "book/update", payload })),
}))

describe("handleBookData", () => {
  const mockDispatch = vi.fn()
  const mockSubscription = {
    request: {
      symbol: "tBTCUSD",
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runAllTimers()
    vi.useRealTimers()
  })

  it("should handle book snapshot data", () => {
    const snapshotData = [
      12345, // channelId
      [
        [45000, 2, 1.5], // order 1
        [44999, 1, 0.8], // order 2
      ],
    ]

    handleBookData(snapshotData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "book/snapshot",
      payload: {
        currencyPair: "BTCUSD",
        orders: [
          [45000, 2, 1.5],
          [44999, 1, 0.8],
        ],
      },
    })
  })

  it("should batch single order updates", () => {
    const updateData = [
      12345, // channelId
      [45000, 1, 0.5], // single order
    ]

    handleBookData(updateData, mockSubscription, mockDispatch)
    expect(mockDispatch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "book/update",
      payload: {
        currencyPair: "BTCUSD",
        order: [45000, 1, 0.5],
      },
    })
  })

  it("should batch multiple updates for same currency pair", () => {
    handleBookData([12345, [45000, 1, 0.5]], mockSubscription, mockDispatch)
    handleBookData([12345, [44999, 1, 0.3]], mockSubscription, mockDispatch)
    handleBookData([12345, [44998, 1, 0.2]], mockSubscription, mockDispatch)

    expect(mockDispatch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)

    expect(mockDispatch).toHaveBeenCalledTimes(3)
  })

  it("should flush pending updates before snapshot", () => {
    handleBookData([12345, [45000, 1, 0.5]], mockSubscription, mockDispatch)

    const snapshotData = [
      12345,
      [
        [45000, 2, 1.5],
        [44999, 1, 0.8],
      ],
    ]
    handleBookData(snapshotData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "book/update",
      payload: { currencyPair: "BTCUSD", order: [45000, 1, 0.5] },
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "book/snapshot",
      payload: {
        currencyPair: "BTCUSD",
        orders: [
          [45000, 2, 1.5],
          [44999, 1, 0.8],
        ],
      },
    })
  })

  it("should handle multiple currency pairs independently", () => {
    const btcSubscription = { request: { symbol: "tBTCUSD" } }
    const ethSubscription = { request: { symbol: "tETHUSD" } }

    handleBookData([1, [45000, 1, 0.5]], btcSubscription, mockDispatch)
    handleBookData([2, [3000, 1, 0.3]], ethSubscription, mockDispatch)

    vi.advanceTimersByTime(50)

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: expect.objectContaining({ currencyPair: "BTCUSD" }) })
    )
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: expect.objectContaining({ currencyPair: "ETHUSD" }) })
    )
  })
})
