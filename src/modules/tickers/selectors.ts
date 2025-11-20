import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../redux/store"

const tickerSelector = (state: RootState) => state.ticker

export const getTicker = createSelector(
  tickerSelector,
  (ticker) => (symbol: string) => ticker[symbol]
)
