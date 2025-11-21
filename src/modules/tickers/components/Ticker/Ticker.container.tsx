import { useSelector } from "react-redux"
import { getTicker } from "./../../selectors"

import Ticker from "./Ticker"

export interface ContainerProps {
  currencyPair: string
}

const TickerContainer = ({ currencyPair }: ContainerProps) => {
  const ticker = useSelector(getTicker)(currencyPair)
  const { lastPrice, dailyChange, dailyChangeRelative } = ticker || {}

  return (
    <Ticker
      currencyPair={currencyPair}
      lastPrice={lastPrice!}
      dailyChange={dailyChange!}
      dailyChangeRelative={dailyChangeRelative!}
    />
  )
}

export default TickerContainer
