import { useSelector } from "react-redux"
import Trades from "./Trades"
import { getCurrencyPair } from "../../selection/selectors"
import { getTrades } from "./selector"

const TradesContainer = () => {
  const currencyPair = useSelector(getCurrencyPair)
  const trades = useSelector(getTrades(currencyPair))
  return <Trades trades={trades} currencyPair={currencyPair} />
}

export default TradesContainer
