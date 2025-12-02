import { describe, it, expect, vi, beforeEach } from "vitest"
import { handleTradesData } from "./tradesHandler"

vi.mock("../../../modules/trades/slice", () => ({
  tradesSnapshotReducer: vi.fn((payload) => ({ type: "trades/snapshot", payload })),
  tradesUpdateReducer: vi.fn((payload) => ({ type: "trades/update", payload })),
}))

describe("handleTradesData", () => {
  const mockDispatch = vi.fn()
  const mockSubscription = {
    request: { symbol: "tBTCUSD" },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should handle trades snapshot", () => {
    const snapshotData = [
      12345,
      [
        [1, 1640995200000, 0.5, 45000],
        [2, 1640995300000, -0.3, 45100],
      ],
    ]

    handleTradesData(snapshotData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "trades/snapshot",
      payload: {
        currencyPair: "BTCUSD",
        trades: [
          { id: 2, timestamp: 1640995300000, amount: -0.3, price: 45100 },
          { id: 1, timestamp: 1640995200000, amount: 0.5, price: 45000 },
        ],
      },
    })
  })

  it("should handle single trade update", () => {
    const updateData = [12345, "tu", [3, 1640995400000, 0.8, 45200]]

    handleTradesData(updateData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "trades/update",
      payload: {
        currencyPair: "BTCUSD",
        trade: { id: 3, timestamp: 1640995400000, amount: 0.8, price: 45200 },
      },
    })
  })
})
