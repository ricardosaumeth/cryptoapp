import { useMemo } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import Trades from "./Trades"
import { createSelector } from "@reduxjs/toolkit"
import type { Trade } from "../types/Trade"

// - makeSelectTradesBySymbol(symbol) returns a memoized selector scoped to that symbol.
// - useMemo ensures the selector instance is stable across renders unless symbol changes.
// - useSelector now receives a stable, memoized selector — avoiding the warning and unnecessary re-renders.

export const makeSelectTradesBySymbol = (symbol: string) =>
  createSelector([(state: RootState) => state.trades], (trades): Trade[] => trades[symbol] || [])

export interface ContainerProps {
  symbol: string
}

const TradesContainer = ({ symbol }: ContainerProps) => {
  const selectTrades = useMemo(() => makeSelectTradesBySymbol(symbol), [symbol])
  const trades = useSelector(selectTrades)

  return <Trades trades={trades} />
}

export default TradesContainer
