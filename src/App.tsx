import { useEffect } from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import createStore, { type AppDispatch } from "./modules/redux/store"
import Trades from "./modules/trades/components"
import Tickers from "./modules/tickers/components/Tickers"
import CandlesChart from "./modules/candles/components"
import DepthChart from "./modules/book/components/DepthChart"
import {
  Container,
  Content,
  Header,
  TickersPanel,
  TradesPanel,
  CandlesPanel,
  BookPanel,
  DepthPanel,
} from "./App.styled"
import { bootstrapApp, updateTitle } from "./modules/app/slice"
import Book from "./modules/book/components/Book"
import { getCurrencyPair } from "./modules/selection/selectors"
import { getTicker } from "./modules/tickers/selectors"
import { GithubCorner } from "./GithubCorner"

const store = createStore()

function AppContent() {
  const link = "https://github.com/ricardosaumeth/cryptoapp"
  const dispatch = useDispatch<AppDispatch>()
  const currencyPair = useSelector(getCurrencyPair)
  const ticker = useSelector(getTicker)(currencyPair)

  useEffect(() => {
    dispatch(bootstrapApp())
  }, [dispatch])

  useEffect(() => {
    if (currencyPair && ticker) {
      dispatch(updateTitle({ currencyPair, lastPrice: ticker.lastPrice }))
    }
  }, [currencyPair, ticker])

  return (
    <Container>
      <Content>
        <GithubCorner href={link} />
        <Header>Crypto App</Header>
        <TickersPanel>
          <Tickers />
        </TickersPanel>
        <TradesPanel>
          <Trades />
        </TradesPanel>
        <CandlesPanel>
          <CandlesChart />
        </CandlesPanel>
        <BookPanel>
          <Book />
        </BookPanel>
        <DepthPanel>
          <DepthChart />
        </DepthPanel>
      </Content>
    </Container>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
