import { useEffect } from "react"
import { flushSync } from "react-dom"
import { Provider, useDispatch, useSelector } from "react-redux"
import { getStore, type AppDispatch } from "./modules/redux/store"
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
import { bootstrapApp } from "./modules/app/slice"
import Book from "./modules/book/components/Book"
import { getSelectedCurrencyPair } from "./modules/selection/selectors"
import { getTicker } from "./modules/tickers/selectors"
import { GithubLink } from "./GithubLink"
import Widget from "./core/components/Widget"
import Diagnostics from "./core/components/Diagnostics"
import Latency from "./modules/ping/components/Latency"
import AnimatedContent from "./modules/common/AnimatedContent"
import { parseCurrencyPair } from "./modules/reference-data/utils"

const store = getStore()

function AppContent() {
  const link = "https://github.com/ricardosaumeth/cryptoapp"
  const dispatch = useDispatch<AppDispatch>()
  const currencyPair = useSelector(getSelectedCurrencyPair)
  const tickerLastPrice = useSelector(getTicker)(currencyPair)?.lastPrice

  useEffect(() => {
    dispatch(bootstrapApp())
  }, [dispatch])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        flushSync(() => {
          dispatch({ type: "@@VISIBILITY_CHANGE" })
        })
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            dispatch({ type: "@@FORCE_RENDER" })
          })
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [dispatch])

  useEffect(() => {
    if (currencyPair && tickerLastPrice) {
      const [, counter] = parseCurrencyPair(currencyPair)
      document.title = `(${tickerLastPrice?.toFixed(2)} ${counter}) Crypto App`
    }
  }, [currencyPair, tickerLastPrice])

  return (
    <Container>
      <Content>
        <GithubLink href={link} />
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
            <AnimatedContent>
              <Trades />
            </AnimatedContent>
          </Widget>
        </TradesPanel>
        <CandlesPanel>
          <CandlesChart />
        </CandlesPanel>
        <BookPanel>
          <Widget title={"Book"}>
            <AnimatedContent>
              <Book />
            </AnimatedContent>
          </Widget>
        </BookPanel>
        <DepthPanel>
          <Widget title={"Depth"}>
            <AnimatedContent>
              <DepthChart />
            </AnimatedContent>
          </Widget>
        </DepthPanel>
        <Footer>
          <Latency />
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
