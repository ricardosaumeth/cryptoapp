import { useMemo } from "react"
import { useSelector } from "react-redux"
import Trades from "./Trades"
import { getSelectedCurrencyPair } from "../../selection/selectors"
import { getTrades } from "./selector"
import type { RootState } from "../../redux/store"
import type { Trade } from "../types/Trade"

const TradesContainer = () => {
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)
  const emptyTrades: Trade[] = []
  const selectTradesMemo = useMemo(
    () => (state: RootState) =>
      selectedCurrencyPair ? (getTrades(selectedCurrencyPair)(state) ?? emptyTrades) : emptyTrades,
    [selectedCurrencyPair]
  )

  const trades = useSelector(selectTradesMemo)

  return <Trades trades={trades} />
}

export default TradesContainer
