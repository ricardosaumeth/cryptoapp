import { useMemo } from "react"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { type AppDispatch } from "../../../redux/store"
import { getTickersWithPrices } from "../../selectors"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import { selectCurrencyPair } from "../../../selection/slice"
import Market from "./Market"

const MarketContainer = () => {
  const dispatch = useDispatch<AppDispatch>()

  const tickers = useSelector(getTickersWithPrices)
  const selectCurrencyPairMemo = useMemo(() => getSelectedCurrencyPair, [])

  const selectedCurrencyPair = useSelector(selectCurrencyPairMemo)

  return (
    <Market
      tickers={tickers}
      selectedCurrencyPair={selectedCurrencyPair}
      onClick={(currencyPair: string) => dispatch(selectCurrencyPair({ currencyPair }))}
    />
  )
}

export default MarketContainer
