import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Trade } from "./types/Trade"

export const MAX_TRADES = 100

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

      trades.slice(0, MAX_TRADES) // only keep the top x trades, so we don't eventually fill up the memory
    },
  },
})

export const { tradesSnapshotReducer, tradesUpdateReducer } = tradesSlice.actions
