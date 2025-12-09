import { useSelector } from "react-redux"
import { createSelector } from "@reduxjs/toolkit"
import Trades from "./Trades"
import { getSelectedCurrencyPair } from "../../selection/selectors"
import type { RootState } from "../../redux/store"
import type { Trade } from "../types/Trade"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../core/transport/selectors"
import { Channel } from "../../../core/transport/types/Channels"

const emptyTrades: Trade[] = []

const getTradesForSelectedPair = createSelector(
  [(state: RootState) => state.trades, getSelectedCurrencyPair],
  (trades, selectedCurrencyPair) => {
    if (!selectedCurrencyPair) return emptyTrades
    const result = trades[selectedCurrencyPair]
    return result !== undefined ? result : emptyTrades
  }
)

const TradesContainer = () => {
  const trades = useSelector(getTradesForSelectedPair)
  const subscriptionId = useSelector((state: RootState) => getSubscriptionId(state, Channel.TRADES))
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state, subscriptionId) : false
  )

  return <Trades trades={trades} isStale={isStale} />
}

export default TradesContainer
