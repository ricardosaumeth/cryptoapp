import { useMemo } from "react"
import { useSelector } from "react-redux"
import Trades from "./Trades"
import { getSelectedCurrencyPair } from "../../selection/selectors"
import { getTrades } from "../selector"
import type { RootState } from "../../redux/store"
import type { Trade } from "../types/Trade"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../core/transport/selectors"
import { Channel } from "../../../core/transport/types/Channels"

const TradesContainer = () => {
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)
  const emptyTrades: Trade[] = []
  const selectTradesMemo = useMemo(
    () => (state: RootState) =>
      selectedCurrencyPair ? (getTrades(selectedCurrencyPair)(state) ?? emptyTrades) : emptyTrades,
    [selectedCurrencyPair]
  )

  const trades = useSelector(selectTradesMemo)
  const subscriptionId = useSelector((state: RootState) => getSubscriptionId(state, Channel.BOOK))
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state, subscriptionId) : false
  )

  return <Trades trades={trades} isStale={isStale} />
}

export default TradesContainer
