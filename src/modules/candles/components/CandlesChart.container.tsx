import { useSelector } from "react-redux"
import CandlesChart from "./CandlesChart"
import { getCurrencyPairs } from "../../reference-data/selectors"
import { getCandles } from "../selectors"
import type { RootState } from "../../redux/store"
import type { Candle } from "../types/Candle"

const CandlesChartContainer = () => {
  const currencyPairs = useSelector(getCurrencyPairs)
  const currencyPair = currencyPairs[0] || ""
  const candles: Candle[] = useSelector((state: RootState) => getCandles(state)(currencyPair)) || [] // TODO - store selection

  return <CandlesChart candles={candles} currencyPair={currencyPair} />
}

export default CandlesChartContainer
