import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { type AppDispatch } from "../../../redux/store"
import { getTickers } from "../../selectors"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import { selectCurrencyPair } from "../../../selection/slice"
import Market from "./Market"

const MarketContainer = () => {
  const dispatch = useDispatch<AppDispatch>()

  const tickers = useSelector(getTickers)
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)

  return (
    <Market
      tickers={tickers}
      selectedCurrencyPair={selectedCurrencyPair}
      onClick={(currencyPair: string) => dispatch(selectCurrencyPair({ currencyPair }))}
    />
  )
}

export default MarketContainer
