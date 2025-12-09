import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Trade } from "./types/Trade"

export const MAX_TRADES = import.meta.env["VITE_MAX_TRADES"]

interface TradesState {
  [currencyPair: string]: Trade[]
}

const initialState: TradesState = {}

export const tradesSlice = createSlice({
  name: "trades",
  initialState,
  reducers: {
    tradesSnapshotReducer: (
      state,
      action: PayloadAction<{ currencyPair: string; trades: Trade[] }>
    ) => {
      const { currencyPair, trades } = action.payload
      state[currencyPair] = trades
    },
    tradesUpdateReducer: (state, action: PayloadAction<{ currencyPair: string; trade: Trade }>) => {
      const { currencyPair, trade } = action.payload
      const trades = state[currencyPair] ?? (state[currencyPair] = [])
      const existingIndex = trades.findIndex((t) => t.id === trade.id)

      if (existingIndex >= 0) {
        trades[existingIndex] = trade
      } else {
        trades.push(trade)
        // Sort to maintain chronological order
        trades.sort((a, b) => a.timestamp - b.timestamp)
      }

      // Keep only recent trades to prevent memory issues
      if (trades.length > MAX_TRADES) {
        trades.splice(0, trades.length - MAX_TRADES)
      }
    },
  },
})

export const { tradesSnapshotReducer, tradesUpdateReducer } = tradesSlice.actions
