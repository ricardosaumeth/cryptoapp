import { useSelector } from "react-redux"
import { getCurrencyPairs } from "../../../reference-data/selectors"
import Tickers from "./Tickers"

const TickersContainer = () => {
  const currencyPairs = useSelector(getCurrencyPairs)

  return <Tickers currencyPairs={currencyPairs} />
}

export default TickersContainer
