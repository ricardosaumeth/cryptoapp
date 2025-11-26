import { useSelector } from "react-redux"
import { getCurrencyPairs } from "../../../reference-data/selectors"
import Tickers from "./Tickers"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import { range } from "lodash"
import { getValueAt } from "../../../../core/utils"

const TickersContainer = () => {
  const allCurrencyPairs = useSelector(getCurrencyPairs)
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)
  const selectedCurrencyPairIndex = allCurrencyPairs.indexOf(selectedCurrencyPair || "")
  let currencyPairs: string[] = []
  // Pick a few currency pairs on each side of the selected one
  if (selectedCurrencyPairIndex >= 0) {
    currencyPairs = range(selectedCurrencyPairIndex - 2, selectedCurrencyPairIndex + 3).map(
      (index) => getValueAt(allCurrencyPairs)(index)
    )
  }

  return (
    <Tickers currencyPairs={currencyPairs} selectedCurrencyPairIndex={selectedCurrencyPairIndex} />
  )
}

export default TickersContainer
