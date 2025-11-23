import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import createStore, { type AppDispatch } from "./modules/redux/store"
import Trades from "./modules/trades/components"
import Tickers from "./modules/tickers/components/Tickers"
import CandlesChart from "./modules/candles/components"
import { Container, Header, TickersPanel, TradesPanel, CandlesPanel, BookPanel } from "./App.styled"
import { bootstrapApp } from "./modules/app/slice"
import Book from "./modules/book/components"

const store = createStore()

function AppContent() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(bootstrapApp())
  }, [dispatch])

  return (
    <Container>
      <Header>
        <h1>Crypto App</h1>
      </Header>
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
