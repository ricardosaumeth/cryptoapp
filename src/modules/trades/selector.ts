import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../redux/store"
import type { Trade } from "./types/Trade"
import { getSelectedCurrencyPair } from "../selection/selectors"

const emptyTrades: Trade[] = []

export const getTradesForSelectedPair = createSelector(
  [(state: RootState) => state.trades, getSelectedCurrencyPair],
  (trades, selectedCurrencyPair) => {
    if (!selectedCurrencyPair) return emptyTrades
    const result = trades[selectedCurrencyPair]
    return result !== undefined ? result : emptyTrades
  }
)
