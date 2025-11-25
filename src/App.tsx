import { useEffect } from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import createStore, { type AppDispatch } from "./modules/redux/store"
import Trades from "./modules/trades/components"
import Tickers from "./modules/tickers/components/Tickers"
import Market from "./modules/tickers/components/Market"
import CandlesChart from "./modules/candles/components"
import DepthChart from "./modules/book/components/DepthChart"
import {
  Container,
  Content,
  Header,
  TickersPanel,
  MarketPanel,
  TradesPanel,
  CandlesPanel,
  BookPanel,
  DepthPanel,
  Footer,
} from "./App.styled"
import { bootstrapApp, updateTitle } from "./modules/app/slice"
import Book from "./modules/book/components/Book"
import { getSelectedCurrencyPair } from "./modules/selection/selectors"
import { getTicker } from "./modules/tickers/selectors"
import { GithubCorner } from "./GithubCorner"
import Widget from "./core/components/Widget"
import Diagnostics from "./core/components/Diagnostics"

const store = createStore()

function AppContent() {
  const link = "https://github.com/ricardosaumeth/cryptoapp"
  const dispatch = useDispatch<AppDispatch>()
  const currencyPair = useSelector(getSelectedCurrencyPair)
  const ticker = useSelector(getTicker)(currencyPair)

  useEffect(() => {
    dispatch(bootstrapApp())
  }, [dispatch])

  useEffect(() => {
    if (currencyPair && ticker) {
      dispatch(updateTitle({ currencyPair, lastPrice: ticker.lastPrice! }))
    }
  }, [currencyPair, ticker])

  return (
    <Container>
      <Content>
        <GithubCorner href={link} />
        <Header>Crypto Trader</Header>
        <TickersPanel>
          <Tickers />
        </TickersPanel>
        <MarketPanel>
          <Widget title={"Market"}>
            <Market />
          </Widget>
        </MarketPanel>
        <TradesPanel>
          <Widget title={"Trades"}>
            <Trades />
          </Widget>
        </TradesPanel>
        <CandlesPanel>
          <CandlesChart />
        </CandlesPanel>
        <BookPanel>
          <Widget title={"Book"}>
            <Book />
          </Widget>
        </BookPanel>
        <DepthPanel>
          <Widget title={"Depth"}>
            <DepthChart />
          </Widget>
        </DepthPanel>
        <Footer>
          <Diagnostics />
        </Footer>
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
