import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Candle, CandleTuple } from "./types/Candle"

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

      // Keep only recent candles to prevent memory issues
      if (state[lookupKey]!.length > MAX_CANDLES) {
        state[lookupKey] = state[lookupKey]!.slice(-MAX_CANDLES)
      }
    },
  },
})

export const { candlesSnapshotReducer, candlesUpdateReducer } = candleSlice.actions
export default candleSlice.reducer
