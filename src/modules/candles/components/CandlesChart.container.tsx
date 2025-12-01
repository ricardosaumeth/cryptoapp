import { useMemo } from "react"
import { useSelector } from "react-redux"
import CandlesChart from "./CandlesChart"
import { getSelectedCurrencyPair } from "../../selection/selectors"
import { getCandles } from "../selectors"
import type { Candle } from "../types/Candle"
import type { RootState } from "../../redux/store"
import { DEFAULT_TIMEFRAME } from "../../app/slice"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../core/transport/selectors"
import { Channel } from "../../../core/transport/types/Channels"

const CandlesChartContainer = () => {
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)
  const emptyCandles: Candle[] = []
  const selectCandles = useMemo(
    () => (state: RootState) =>
      selectedCurrencyPair
        ? (getCandles(state)(selectedCurrencyPair, DEFAULT_TIMEFRAME) ?? emptyCandles)
        : emptyCandles,
    [selectedCurrencyPair]
  )

  const candles = useSelector(selectCandles)
  const subscriptionId = useSelector((state: RootState) => getSubscriptionId(state)(Channel.Candle))
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state)(subscriptionId) : false
  )

  return <CandlesChart candles={candles} currencyPair={selectedCurrencyPair} isStale={isStale} />
}

export default CandlesChartContainer
