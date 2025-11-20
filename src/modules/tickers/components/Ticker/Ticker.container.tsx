import { useSelector } from "react-redux"
import { getTicker } from "./../../selectors"

import Ticker from "./Ticker"

export interface ContainerProps {
  currencyPair: string
}

const TickerContainer = ({ currencyPair }: ContainerProps) => {
  const ticker = useSelector(getTicker)(currencyPair)
  return <Ticker currencyPair={currencyPair} lastPrice={ticker?.lastPrice!} />
}

export default TickerContainer
