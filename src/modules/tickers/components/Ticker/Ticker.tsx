import { Container, CurrencyPair, Price } from "./Ticker.styled"
import UpdateHighlight from "../../../../core/components/update-highlight/UpdateHighlight"

export interface Props {
  currencyPair: string
  lastPrice: number
}

const Ticker = ({ currencyPair, lastPrice }: Props) => {
  return (
    <Container>
      <CurrencyPair>{currencyPair}</CurrencyPair>
      <Price>
        <UpdateHighlight value={lastPrice?.toString()} />
      </Price>
    </Container>
  )
}

export default Ticker
