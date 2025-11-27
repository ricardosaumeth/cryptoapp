import { useSelector } from "react-redux"
import Tickers from "./Tickers"
import { getVisibleCurrencyPairTickers } from "../../selectors"

const TickersContainer = () => {
  const { currencyPairs, selectedCurrencyPairIndex } = useSelector(getVisibleCurrencyPairTickers)

  return (
    <Tickers currencyPairs={currencyPairs} selectedCurrencyPairIndex={selectedCurrencyPairIndex} />
  )
}

export default TickersContainer
