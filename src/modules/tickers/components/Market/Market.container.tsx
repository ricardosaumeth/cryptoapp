import { useSelector } from "react-redux"
import { getTickersWithPrices } from "../../selectors"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import Market from "./Market"

const MarketContainer = () => {
  const tickers = useSelector(getTickersWithPrices)
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)

  return <Market tickers={tickers} selectedCurrencyPair={selectedCurrencyPair} />
}

export default MarketContainer
