import { useSelector } from "react-redux"
import Trades from "./Trades"
import { getCurrencyPairs } from "../../reference-data/selectors"
import { getTrades } from "./selector"

const TradesContainer = () => {
  const currencyPairs = useSelector(getCurrencyPairs)
  const currencyPair = currencyPairs[0] || ""
  const trades = useSelector(getTrades(currencyPair))
  return <Trades trades={trades} currencyPair={currencyPair} />
}

export default TradesContainer
