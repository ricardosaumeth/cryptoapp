import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Candle, CandleTuple } from "./types/Candle"

/**
 * MEMORY-BOUNDED ARRAY CONFIGURATION FOR CANDLES
 *
 * Candles are time-series data that accumulate continuously.
 * 1-minute candles: 1,440 per day, 10,080 per week, 43,200 per month
 *
 * Without limits:
 * - 30 days = 43,200 candles per pair
 * - 10 pairs = 432,000 candles
 * - Highcharts becomes unresponsive
 * - Memory usage grows unbounded
 *
 * MAX_CANDLES = 5000 provides:
 * - 1-minute candles: ~3.5 days of history
 * - 5-minute candles: ~17 days of history
 * - 15-minute candles: ~52 days of history
 * - Sufficient for technical analysis (moving averages, Bollinger Bands)
 * - Smooth Highcharts rendering
 * - Stable memory footprint
 */
const MAX_CANDLES = import.meta.env["VITE_MAX_CANDLES"]

type SymbolState = Candle[]

export interface CandlesState {
  [currencyPair: string]: SymbolState
}

const initialState: CandlesState = {}

export const candleSlice = createSlice({
  name: "candles",
  initialState,
  reducers: {
    candlesSnapshotReducer: (
      state,
      action: PayloadAction<{ lookupKey: string; candles: CandleTuple[] }>
    ) => {
      const { lookupKey, candles } = action.payload
      state[lookupKey] = candles
        .map(([timestamp, open, close, high, low, volume]) => ({
          timestamp,
          open,
          close,
          high,
          low,
          volume,
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
    },
    candlesUpdateReducer: (
      state,
      action: PayloadAction<{ lookupKey: string; candle: CandleTuple }>
    ) => {
      const { lookupKey, candle } = action.payload
      const [timestamp, open, close, high, low, volume] = candle
      const candleIndex = state[lookupKey]?.findIndex((c) => c.timestamp === timestamp) ?? -1
      const newOrUpdatedCandle = {
        timestamp,
        open,
        close,
        high,
        low,
        volume,
      }

      if (candleIndex >= 0) {
        // Update existing candle
        state[lookupKey]![candleIndex] = newOrUpdatedCandle
      } else {
        // Add new candle
        if (!state[lookupKey]) {
          state[lookupKey] = []
        }
        state[lookupKey]!.push(newOrUpdatedCandle)
        // Sort to maintain chronological order
        state[lookupKey]!.sort((a, b) => a.timestamp - b.timestamp)
      }

      if (!state[lookupKey]) {
        state[lookupKey] = []
      }

      /**
       * 🔥 CRITICAL: MEMORY-BOUNDED ARRAY FOR TIME-SERIES DATA
       *
       * Candles accumulate over time and will grow indefinitely without bounds.
       *
       * Why slice(-MAX_CANDLES) instead of splice()?
       * - Creates new array with only the last N candles
       * - Simpler than calculating splice offset
       * - Redux Toolkit's Immer handles this efficiently
       *
       * Impact:
       * - Without: 43,200 candles after 30 days (4.3MB per pair)
       * - With: 5,000 candles always (500KB per pair)
       *
       * This keeps Highcharts responsive and memory usage predictable.
       */
      if (state[lookupKey]!.length > MAX_CANDLES) {
        state[lookupKey] = state[lookupKey]!.slice(-MAX_CANDLES)
      }
    },
  },
})

export const { candlesSnapshotReducer, candlesUpdateReducer } = candleSlice.actions
export default candleSlice.reducer
