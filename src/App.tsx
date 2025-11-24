import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
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
import { bootstrapApp } from "./modules/app/slice"
import Book from "./modules/book/components/Book"

const store = createStore()

function AppContent() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(bootstrapApp())
  }, [dispatch])

  return (
    <Container>
      <Content>
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
