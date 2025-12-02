import { describe, it, expect, vi, beforeEach } from "vitest"
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

  it("should handle single order update", () => {
    const updateData = [
      12345, // channelId
      [45000, 1, 0.5], // single order
    ]

    handleBookData(updateData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "book/update",
      payload: {
        currencyPair: "BTCUSD",
        order: [45000, 1, 0.5],
      },
    })
  })

  it("should extract currency pair from symbol", () => {
    const testData = [12345, [45000, 1, 0.5]]

    handleBookData(testData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          currencyPair: "BTCUSD",
        }),
      })
    )
  })
})
