import { describe, it, expect, vi, beforeEach } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import {
  subscriptionsSlice,
  tradeSubscribeToSymbol,
  tickerSubscribeToSymbol,
  candlesSubscribeToSymbol,
  bookSubscribeToSymbol,
  unsubscribeFromTradesAndBook,
  changeConnectionStatus,
  subscribeToChannelAck,
  unSubscribeToChannelAck,
  updateStaleSubscription,
} from "./slice"
import { ConnectionStatus } from "./types/ConnectionStatus"

describe("subscriptionsSlice", () => {
  const initialState = {
    wsConnectionStatus: ConnectionStatus.Disconnected,
  }

  describe("reducers", () => {
    it("should change connection status", () => {
      const action = changeConnectionStatus(ConnectionStatus.Connected)
      const result = subscriptionsSlice.reducer(initialState, action)

      expect(result.wsConnectionStatus).toBe(ConnectionStatus.Connected)
    })

    it("should handle subscription acknowledgment", () => {
      const action = subscribeToChannelAck({
        channelId: 12345,
        channel: "trades",
        request: { channel: "trades", symbol: "tBTCUSD" },
      })

      const result = subscriptionsSlice.reducer(initialState, action)

      expect(result[12345]).toEqual({
        channel: "trades",
        request: { channel: "trades", symbol: "tBTCUSD" },
        isStale: true,
      })
    })

    it("should handle unsubscription acknowledgment", () => {
      const stateWithSubscription = {
        ...initialState,
        12345: {
          channel: "trades",
          request: { channel: "trades", symbol: "tBTCUSD" },
          isStale: false,
        },
      }

      const action = unSubscribeToChannelAck({ channelId: 12345 })
      const result = subscriptionsSlice.reducer(stateWithSubscription, action)

      expect(result[12345]).toBeUndefined()
    })

    it("should update stale subscription", () => {
      const stateWithStaleSubscription = {
        ...initialState,
        12345: {
          channel: "trades",
          request: { channel: "trades", symbol: "tBTCUSD" },
          isStale: true,
        },
      }

      const action = updateStaleSubscription({ channelId: 12345 })
      const result = subscriptionsSlice.reducer(stateWithStaleSubscription, action)

      expect(result[12345]!.isStale).toBe(false)
    })

    it("should ignore update for non-existent subscription", () => {
      const action = updateStaleSubscription({ channelId: 99999 })
      const result = subscriptionsSlice.reducer(initialState, action)

      expect(result).toEqual(initialState)
    })
  })

  describe("async thunks", () => {
    let store: any
    const mockConnection = {
      send: vi.fn(),
    }

    beforeEach(() => {
      vi.clearAllMocks()

      store = configureStore({
        reducer: {
          subscriptions: subscriptionsSlice.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            thunk: {
              extraArgument: { connection: mockConnection },
            },
          }),
      })
    })

    it("should dispatch trade subscription", async () => {
      await store.dispatch(tradeSubscribeToSymbol({ symbol: "BTCUSD" }))

      expect(mockConnection.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: "subscribe",
          channel: "trades",
          symbol: "tBTCUSD",
        })
      )
    })

    it("should dispatch ticker subscription", async () => {
      await store.dispatch(tickerSubscribeToSymbol({ symbol: "ETHUSD" }))

      expect(mockConnection.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: "subscribe",
          channel: "ticker",
          symbol: "tETHUSD",
        })
      )
    })

    it("should dispatch candles subscription with timeframe", async () => {
      await store.dispatch(
        candlesSubscribeToSymbol({
          symbol: "BTCUSD",
          timeframe: "5m",
        })
      )

      expect(mockConnection.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: "subscribe",
          channel: "candles",
          key: "trade:5m:tBTCUSD",
        })
      )
    })

    it("should dispatch book subscription with precision", async () => {
      await store.dispatch(
        bookSubscribeToSymbol({
          symbol: "BTCUSD",
          prec: "P0",
        })
      )

      expect(mockConnection.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: "subscribe",
          channel: "book",
          prec: "P0",
          symbol: "tBTCUSD",
        })
      )
    })

    it("should dispatch unsubscribe request", async () => {
      await store.dispatch(unsubscribeFromTradesAndBook("12345"))

      expect(mockConnection.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: "unsubscribe",
          chanId: "12345",
        })
      )
    })

    it("should handle fulfilled subscription actions", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

      await store.dispatch(tradeSubscribeToSymbol({ symbol: "BTCUSD" }))

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Subscribed to trade"))

      consoleSpy.mockRestore()
    })
  })
})
