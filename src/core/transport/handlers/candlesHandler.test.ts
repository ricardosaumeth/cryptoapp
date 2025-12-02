import { describe, it, expect, vi, beforeEach } from "vitest"
import { handleCandlesData } from "./candlesHandler"

vi.mock("../../../modules/candles/slice", () => ({
  candlesSnapshotReducer: vi.fn((payload) => ({ type: "candles/snapshot", payload })),
  candlesUpdateReducer: vi.fn((payload) => ({ type: "candles/update", payload })),
}))

vi.mock("../../../modules/candles/utils", () => ({
  getLookupKey: vi.fn((pair, timeframe) => `${pair}_${timeframe}`),
}))

describe("handleCandlesData", () => {
  const mockDispatch = vi.fn()
  const mockSubscription = {
    request: { key: "trade:1m:tBTCUSD" },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should handle candles snapshot", () => {
    const snapshotData = [12345, [[1640995200000, 45000, 45100, 45200, 44900, 1.5]]]

    handleCandlesData(snapshotData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "candles/snapshot",
      payload: {
        lookupKey: "BTCUSD_1m",
        candles: [[1640995200000, 45000, 45100, 45200, 44900, 1.5]],
      },
    })
  })

  it("should handle single candle update", () => {
    const updateData = [12345, [1640995260000, 45100, 45150, 45200, 45050, 2.0]]

    handleCandlesData(updateData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "candles/update",
      payload: {
        lookupKey: "BTCUSD_1m",
        candle: [1640995260000, 45100, 45150, 45200, 45050, 2.0],
      },
    })
  })
})
