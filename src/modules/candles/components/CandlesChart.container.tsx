import { useSelector } from "react-redux"
import CandlesChart from "./CandlesChart"
import { getSelectedCurrencyPair } from "../../selection/selectors"
import { getCandles } from "../selectors"
import type { RootState } from "../../redux/store"
import type { Candle } from "../types/Candle"

const CandlesChartContainer = () => {
  const currencyPair = useSelector(getSelectedCurrencyPair)
  const candles: Candle[] = useSelector((state: RootState) => getCandles(state)(currencyPair)) || []

  return <CandlesChart candles={candles} currencyPair={currencyPair} />
}

export default CandlesChartContainer
