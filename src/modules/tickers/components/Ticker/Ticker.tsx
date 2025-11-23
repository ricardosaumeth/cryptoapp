import { Container, CurrencyPair, Price, RelativeChange, Change } from "./Ticker.styled"
import UpdateHighlight from "../../../../core/components/update-highlight/UpdateHighlight"
import { formatCurrencyPair } from "../../../reference-data/utils"
import TrendIndicator from "../../../../core/components/trend-indicator"

export interface Props {
  currencyPair: string
  lastPrice: number
  dailyChange: number
  dailyChangeRelative: number
  onClick: () => void
}

const Ticker = ({ currencyPair, lastPrice, dailyChange, dailyChangeRelative, onClick }: Props) => {
  const isPositiveChange = dailyChange > 0
  const percentChange = dailyChangeRelative ? dailyChangeRelative * 100 : undefined

  return (
    <Container onClick={onClick}>
      <CurrencyPair>{formatCurrencyPair(currencyPair)}</CurrencyPair>
      <Price>
        <UpdateHighlight value={lastPrice?.toFixed(2)} />
      </Price>
      <RelativeChange $isPositive={isPositiveChange}>
        <TrendIndicator value={dailyChangeRelative} />
        <UpdateHighlight value={percentChange?.toFixed(2)} />
        {percentChange && "%"}
      </RelativeChange>
      <Change $isPositive={isPositiveChange}>
        <UpdateHighlight value={dailyChange?.toFixed(2)} />
      </Change>
    </Container>
  )
}

export default Ticker
