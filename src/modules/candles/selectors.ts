import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../redux/store"
import { getLookupKey } from "./utils"
import type { Candle } from "./types/Candle"

const DEFAULT_CANDLES: Candle[] = []

export const candlesSelector = (state: RootState) => state.candles

export const getCandles = createSelector(
  candlesSelector,
  (candles) => (currencyPair: string, timeframe: string) =>
    candles[getLookupKey(currencyPair, timeframe)] || DEFAULT_CANDLES
)
