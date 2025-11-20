import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "modules/redux/store"
import type { Trade } from "../types/Trade"

export const getTrades = (currencyPair: string) =>
  createSelector(
    [(state: RootState) => state.trades],
    (trades): Trade[] => trades[currencyPair] || []
  )
