import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Trade } from "./types/Trade"

interface TradesState {
  [currencyPair: string]: Trade[]
}

const initialState: TradesState = {}

export const tradesSlice = createSlice({
  name: "trades",
  initialState,
  reducers: {
    updateTrades: (state, action: PayloadAction<{ currencyPair: string; trades: Trade[] }>) => {
      const { currencyPair, trades } = action.payload
      state[currencyPair] = trades
    },
    addTrade: (state, action: PayloadAction<{ currencyPair: string; trade: Trade }>) => {
      const { currencyPair, trade } = action.payload
      const trades = state[currencyPair] ?? (state[currencyPair] = [])
      const existingIndex = trades.findIndex((t) => t.id === trade.id)

      if (existingIndex >= 0) {
        trades[existingIndex] = trade
      } else {
        trades.push(trade)
      }
    },
  },
})

export const { updateTrades, addTrade } = tradesSlice.actions
