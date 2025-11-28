import { Container, CurrencyPair, Price, RelativeChange, Change } from "./Ticker.styled"
import UpdateHighlight from "../../../../core/components/UpdateHighlight/UpdateHighlight"
import { formatCurrencyPair, formatPrice } from "../../../reference-data/utils"
import TrendIndicator from "../../../../core/components/TrenIndicator"

export interface Props {
  currencyPair: string
  lastPrice: number
  dailyChange: number
  dailyChangeRelative: number
  onClick: () => void
  isActive: boolean
}

const Ticker = ({
  currencyPair,
  lastPrice,
  dailyChange,
  dailyChangeRelative,
  onClick,
  isActive,
}: Props) => {
  const isPositiveChange = dailyChange > 0
  const percentChange = dailyChangeRelative ? dailyChangeRelative * 100 : undefined

  return (
    <Container onClick={onClick} $isActive={!!isActive}>
      <CurrencyPair>{formatCurrencyPair(currencyPair)}</CurrencyPair>
      <Price>
        <UpdateHighlight value={formatPrice(lastPrice)} effect="zoom" />
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
