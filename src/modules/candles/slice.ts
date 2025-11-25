import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Candle, CandleTuple } from "./types/Candle"

const MAX_CANDLES = 1000

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
      action: PayloadAction<{ currencyPair: string; candles: CandleTuple[] }>
    ) => {
      const { currencyPair, candles } = action.payload
      state[currencyPair] = candles
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
      action: PayloadAction<{ currencyPair: string; candle: CandleTuple }>
    ) => {
      const { currencyPair, candle } = action.payload
      const [timestamp, open, close, high, low, volume] = candle
      const candleIndex = state[currencyPair]?.findIndex((c) => c.timestamp === timestamp) ?? -1
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
        state[currencyPair]![candleIndex] = newOrUpdatedCandle
      } else {
        // Add new candle
        if (!state[currencyPair]) {
          state[currencyPair] = []
        }
        state[currencyPair]!.push(newOrUpdatedCandle)
        // Sort to maintain chronological order
        state[currencyPair]!.sort((a, b) => a.timestamp - b.timestamp)
      }

      if (!state[currencyPair]) {
        state[currencyPair] = []
      }

      state[currencyPair] = state[currencyPair]!.slice(0, MAX_CANDLES) // restrict number of candles so we don't eventully fill up the memory
    },
  },
})

export const { candlesSnapshotReducer, candlesUpdateReducer } = candleSlice.actions
export default candleSlice.reducer
