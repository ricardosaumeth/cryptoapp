import { useState, useEffect } from "react"
import { usePrevious } from "../../../../core/hooks/usePrevious"
import { Container, TickerWrapper, type ScrollDirection } from "./Tickers.styled"
import Ticker from "../Ticker"

export interface Props {
  currencyPairs: string[]
  selectedCurrencyPairIndex?: number
}

const Tickers = ({ currencyPairs, selectedCurrencyPairIndex }: Props) => {
  const [direction, setDirection] = useState<ScrollDirection>("left")
  const previousSelectedCurrencyPairIndex = usePrevious(selectedCurrencyPairIndex)

  useEffect(() => {
    const direction =
      Number(previousSelectedCurrencyPairIndex || 0) > Number(selectedCurrencyPairIndex || 0)
        ? "right"
        : "left"
    setDirection(direction)
  }, [selectedCurrencyPairIndex])

  return (
    <Container $itemCount={currencyPairs.length} className="tickers">
      {currencyPairs.map((currencyPair, index) => (
        <TickerWrapper
          $index={index}
          $itemCount={currencyPairs.length}
          $direction={direction}
          key={currencyPair}
        >
          <Ticker currencyPair={currencyPair} />
        </TickerWrapper>
      ))}
    </Container>
  )
}

export default Tickers
