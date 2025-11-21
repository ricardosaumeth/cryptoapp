import { createSelector } from "reselect"
import type { RootState } from "../redux/store"

const candlesSelector = (state: RootState) => state.candles

export const getCandles = createSelector(
  candlesSelector,
  (candles) => (symbol: string) => candles[symbol]
)
