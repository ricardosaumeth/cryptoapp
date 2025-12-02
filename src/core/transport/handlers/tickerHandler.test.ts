import { describe, it, expect, vi, beforeEach } from "vitest"
import { handleTickerData } from "./tickerHandler"

vi.mock("../../../modules/tickers/slice", () => ({
  updateTicker: vi.fn((payload) => ({ type: "ticker/update", payload })),
}))

describe("handleTickerData", () => {
  const mockDispatch = vi.fn()
  const mockSubscription = {
    request: { symbol: "tBTCUSD" },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should dispatch ticker update with correct data", () => {
    const tickerData = [
      12345,
      [7364.9, 7365, 7364.8, 7365.1, -45.1, -0.0061, 7364.9, 1234.5, 7400, 7300],
    ]

    handleTickerData(tickerData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "ticker/update",
      payload: {
        symbol: "tBTCUSD",
        data: tickerData,
      },
    })
  })
})
