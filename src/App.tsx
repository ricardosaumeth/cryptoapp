import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import createStore, { type AppDispatch } from "./modules/redux/store"
import Trades from "./modules/trades/components"
import Tickers from "./modules/tickers/components/Tickers"
import { Container, Header, TickersPanel, TradesPanel } from "./App.styled"
import { bootstrapApp } from "./modules/app/slice"

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
