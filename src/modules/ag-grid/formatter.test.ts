import { describe, it, expect, vi } from "vitest"
import { priceFormatter, amountFormatter, volumeFormatter, timeFormatter } from "./formatter"

// Mock the utility functions
vi.mock("../reference-data/utils", () => ({
  formatPrice: vi.fn((value) => `$${value}`),
  formatAmount: vi.fn((value) => `${value} BTC`),
  formatVolume: vi.fn((value) => `${value}M`),
  formatTime: vi.fn((value) => `${value}ms`),
}))

describe("AG Grid Formatters", () => {
  describe("priceFormatter", () => {
    it("should format valid price", () => {
      expect(priceFormatter({ value: 45000 })).toBe("$45000")
    })

    it("should return dash for null value", () => {
      expect(priceFormatter({ value: null as any })).toBe("-")
    })

    it("should return dash for undefined value", () => {
      expect(priceFormatter({ value: undefined as any })).toBe("-")
    })

    it("should return dash for null params", () => {
      expect(priceFormatter(null as any)).toBe("-")
    })
  })

  describe("amountFormatter", () => {
    it("should format valid amount", () => {
      expect(amountFormatter({ value: 1.5 })).toBe("1.5 BTC")
    })

    it("should return dash for null value", () => {
      expect(amountFormatter({ value: null as any })).toBe("-")
    })
  })

  describe("volumeFormatter", () => {
    it("should format valid volume", () => {
      expect(volumeFormatter({ value: 100 })).toBe("100M")
    })

    it("should return dash for null value", () => {
      expect(volumeFormatter({ value: null as any })).toBe("-")
    })
  })

  describe("timeFormatter", () => {
    it("should format valid time", () => {
      expect(timeFormatter({ value: 1640995200000 })).toBe("1640995200000ms")
    })

    it("should return dash for null value", () => {
      expect(timeFormatter({ value: null as any })).toBe("-")
    })
  })
})
