import { useSelector } from "react-redux"
import Trades from "./Trades"
import { getSelectedCurrencyPair } from "../../selection/selectors"
import { getTrades } from "./selector"

const TradesContainer = () => {
  const currencyPair = useSelector(getSelectedCurrencyPair)
  const trades = useSelector(getTrades(currencyPair))
  return <Trades trades={trades} />
}

export default TradesContainer
