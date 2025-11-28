# 📚 CryptoApp Tutorial: Step-by-Step Guide

A comprehensive guide to building a real-time cryptocurrency trading dashboard from scratch.

## 🎯 What You'll Build

- Real-time crypto price dashboard with Bitfinex API
- Redux Thunk async subscription management
- Interactive candlestick charts
- Order book and depth chart
- Live trade feeds
- Modern dark UI with animations

## 📋 Prerequisites

- Node.js 18+
- Basic React/TypeScript knowledge
- Understanding of Redux concepts

## 🚀 Step 1: Project Setup

### 1.1 Create Vite React Project

```bash
npm create vite@latest cryptoapp -- --template react-ts
cd cryptoapp
npm install
```

### 1.2 Install Dependencies

```bash
# Core dependencies
npm install @reduxjs/toolkit react-redux styled-components

# Chart libraries
npm install highcharts highcharts-react-official

# Additional utilities
npm install lodash luxon numeral
npm install --save-dev @types/lodash @types/luxon @types/numeral

# Data grid
npm install ag-grid-community ag-grid-react
```

### 1.3 Setup Project Structure

```
src/
├── core/
│   ├── components/
│   └── transport/
├── modules/
│   ├── app/
│   ├── redux/
│   ├── book/
│   ├── candles/
│   ├── common/
│   ├── ping/
│   ├── reference-data/
│   ├── selection/
│   ├── tickers/
│   └── trades/
└── theme/
```

## 🎨 Step 2: Theme & Styling

### 2.1 Create Theme (`src/theme/style.ts`)

```typescript
export default {
  BackgroundColor: "#1b1e2b",
  White: "#ffffff",
  Positive: "#00d4aa",
  Negative: "#ff6b6b",
  Border: "#3a4042",
}
```

### 2.2 Global Styles (`src/index.css`)

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: "IBM Plex Sans", "-apple-system", "BlinkMacSystemFont", sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

### 2.3 Add Material Icons (`index.html`)

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
```

## 🏗️ Step 3: Redux Store Setup

### 3.1 Create Store (`src/modules/redux/store.ts`)

```typescript
import { configureStore } from "@reduxjs/toolkit"
import { Connection } from "../../core/transport/Connection"
import { SocketIOConnectionProxy } from "../../core/transport/SocketIOConnectionProxy"

const connectionProxy = new WsConnectionProxy("wss://api-pub.bitfinex.com/ws/2")
export const connection = new Connection(connectionProxy)

const createStore = () => {
  const store = configureStore({
    reducer: {
      // Add reducers here
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { connection },
        },
      }),
  })
  return store
}

export default createStore
export type RootState = ReturnType<ReturnType<typeof createStore>["getState"]>
export type AppDispatch = ReturnType<typeof createStore>["dispatch"]
```

## 🔌 Step 4: WebSocket Connection

### 4.1 Connection Interface (`src/core/transport/types/ConnectionProxy.ts`)

```typescript
export interface ConnectionProxy {
  start(): void
  stop(): void
  send(message: any): void
  onConnect(callback: () => void): void
  onReceived(callback: (data: any) => void): void
  onError(callback: (error: any) => void): void
}
```

### 4.2 WebSocket Implementation (`src/core/transport/WsConnectionProxy.ts`)

```typescript
import type { ConnectionProxy } from "./types/ConnectionProxy"

export class WsConnectionProxy implements ConnectionProxy {
  private socket?: WebSocket
  private onConnectFn?: () => void
  private onReceivedFn?: (data: any) => void
  private onErrorFn?: (error: any) => void
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private shouldReconnect = true

  constructor(private realm: string) {}

  start(): void {
    this.shouldReconnect = true
    this.connect()
  }

  private connect(): void {
    this.socket = new WebSocket(this.realm)

    this.socket.onopen = () => {
      this.reconnectAttempts = 0
      this.onConnectFn?.()
    }

    this.socket.onmessage = ({ data }) => {
      this.onReceivedFn?.(data)
    }

    this.socket.onerror = (error) => {
      this.onErrorFn?.(error)
    }

    this.socket.onclose = () => {
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
        setTimeout(() => this.connect(), delay)
      }
    }
  }

  stop(): void {
    this.shouldReconnect = false
    this.socket?.close()
  }

  send(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message)
    }
  }

  onConnect(callback: () => void): void {
    this.onConnectFn = callback
  }
  onReceived(callback: (data: any) => void): void {
    this.onReceivedFn = callback
  }
  onError(callback: (error: any) => void): void {
    this.onErrorFn = callback
  }
}
```

## 📊 Step 5: Data Slices

### 5.1 Trades Slice (`src/modules/trades/slice.ts`)

```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Trade {
  id: number
  timestamp: number
  amount: number
  price: number
}

export interface TradesState {
  [currencyPair: string]: Trade[]
}

const initialState: TradesState = {}

export const tradesSlice = createSlice({
  name: "trades",
  initialState,
  reducers: {
    tradesSnapshotReducer: (state, action: PayloadAction<{ currencyPair: string; trades: Trade[] }>) => {
      const { currencyPair, trades } = action.payload
      state[currencyPair] = trades
    },
    tradesUpdateReducer: (state, action: PayloadAction<{ currencyPair: string; trade: Trade }>) => {
      const { currencyPair, trade } = action.payload
      const trades = state[currencyPair] ?? (state[currencyPair] = [])
      const existingIndex = trades.findIndex((t) => t.id === trade.id)

      if (existingIndex >= 0) {
        trades[existingIndex] = trade
      } else {
        trades.push(trade)
        trades.sort((a, b) => a.timestamp - b.timestamp)
      }
    },
  },
})

export const { tradesSnapshotReducer, tradesUpdateReducer } = tradesSlice.actions
export default tradesSlice.reducer
```

### 5.2 Tickers Slice (`src/modules/tickers/slice.ts`)

```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface TickerData {
  lastPrice: number
  dailyChange: number
  dailyChangeRelative: number
}

export interface TickerState {
  [symbol: string]: TickerData
}

const initialState: TickerState = {}

export const tickerSlice = createSlice({
  name: "ticker",
  initialState,
  reducers: {
    updateTicker: (state, action: PayloadAction<{ symbol: string; data: any[] }>) => {
      const { symbol, data } = action.payload
      const [, , , , , , lastPrice, , , dailyChange, dailyChangeRelative] = data

      state[symbol] = {
        lastPrice,
        dailyChange,
        dailyChangeRelative,
      }
    },
  },
})

export const { updateTicker } = tickerSlice.actions
export default tickerSlice.reducer
```

## 📈 Step 6: Candlestick Charts

### 6.1 Candles Slice (`src/modules/candles/slice.ts`)

```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Candle {
  timestamp: number
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export interface CandlesState {
  [currencyPair: string]: Candle[]
}

const initialState: CandlesState = {}

export const candlesSlice = createSlice({
  name: "candles",
  initialState,
  reducers: {
    candlesSnapshot: (state, action: PayloadAction<{ currencyPair: string; candles: any[] }>) => {
      const { currencyPair, candles } = action.payload
      state[currencyPair] = candles
        .map(([timestamp, open, close, high, low, volume]) => ({
          timestamp,
          open,
          close,
          high,
          low,
          volume,
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
    },
    candlesUpdate: (state, action: PayloadAction<{ currencyPair: string; candle: any[] }>) => {
      const { currencyPair, candle } = action.payload
      const [timestamp, open, close, high, low, volume] = candle
      const candleIndex = state[currencyPair]?.findIndex((c) => c.timestamp === timestamp) ?? -1
      const newCandle = { timestamp, open, close, high, low, volume }

      if (candleIndex >= 0) {
        state[currencyPair]![candleIndex] = newCandle
      } else {
        if (!state[currencyPair]) state[currencyPair] = []
        state[currencyPair].push(newCandle)
        state[currencyPair].sort((a, b) => a.timestamp - b.timestamp)
      }
    },
  },
})

export const { candlesSnapshot, candlesUpdate } = candlesSlice.actions
export default candlesSlice.reducer
```

### 6.2 Chart Component (`src/modules/candles/components/CandlesChart.tsx`)

```typescript
import { useEffect, useState } from "react"
import { Container } from "./CandlesChart.styled"
import * as Highcharts from "highcharts/highstock"
import HighchartsReact from "highcharts-react-official"
import { type Candle } from "../types/Candle"

export interface Props {
  candles: Candle[]
}

const CandlesChart = ({ candles }: Props) => {
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
    series: [{ type: "candlestick", data: [] }]
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (candles && candles.length > 0) {
      const sortedCandles = [...candles].sort((a, b) => a.timestamp - b.timestamp)
      const chartData = sortedCandles.map(({ timestamp, open, high, low, close }) => [
        timestamp, open, high, low, close
      ])

      setChartOptions({
        title: { text: 'Candlestick Chart' },
        rangeSelector: { enabled: true },
        navigator: { enabled: true },
        series: [{ type: "candlestick", name: "Price", data: chartData }]
      })
    }
  }, [candles])

  useEffect(() => {
    import('highcharts/themes/dark-unica')
    setReady(true)
  }, [])

  return (
    <Container>
      {ready && (
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          constructorType={"stockChart"}
        />
      )}
    </Container>
  )
}

export default CandlesChart
```

## 🎛️ Step 7: Layout & Components

### 7.1 Main Layout (`src/App.styled.ts`)

```typescript
import styled from "styled-components"
import Palette from "./theme/style"

export const Container = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${Palette.BackgroundColor};
  display: grid;
  grid-template-rows: 100px 100px 1fr 1fr;
  grid-template-columns: 400px 1fr 1fr;
  grid-template-areas:
    "header header header"
    "ticker ticker ticker"
    "trades candles candles"
    "trades depth book";
  padding: 10px;
  box-sizing: border-box;
`

export const Header = styled.div`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  padding: 0 10px;
  grid-area: header;
  color: ${Palette.White};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 70%
    );
    animation: shine 4s infinite;
    pointer-events: none;
  }

  @keyframes shine {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }
`
```

### 7.2 Ticker Component (`src/modules/tickers/components/Ticker/Ticker.tsx`)

```typescript
import { Container, CurrencyPair, Price, RelativeChange, Change } from "./Ticker.styled"

export interface Props {
  currencyPair: string
  lastPrice: number
  dailyChange: number
  dailyChangeRelative: number
}

const Ticker = ({ currencyPair, lastPrice, dailyChange, dailyChangeRelative }: Props) => {
  const base = currencyPair.slice(0, 3)
  const counter = currencyPair.slice(3)

  return (
    <Container>
      <CurrencyPair>{[base, counter].join(" / ")}</CurrencyPair>
      <Price>{lastPrice?.toFixed(2)}</Price>
      <RelativeChange $isPositive={dailyChangeRelative > 0}>
        {dailyChangeRelative}%
      </RelativeChange>
      <Change $isPositive={dailyChangeRelative > 0}>
        {dailyChange?.toFixed(2)}
      </Change>
    </Container>
  )
}

export default Ticker
```

## 🔄 Step 8: WebSocket Middleware

### 8.1 Create Middleware (`src/core/transport/wsMiddleware.ts`)

```typescript
import { Connection } from "./Connection"
import { updateTrades, addTrade } from "../../modules/trades/slice"
import { updateTicker } from "../../modules/tickers/slice"
import { candlesSnapshot, candlesUpdate } from "../../modules/candles/slice"
import type { Middleware } from "@reduxjs/toolkit"

export const createWsMiddleware = (connection: Connection): Middleware => {
  return (store) => (next) => (action) => {
    connection.onReceive((data) => {
      const parsedData = JSON.parse(data)

      if (parsedData.event === "subscribed") {
        // Handle subscription acknowledgment
        return
      }

      if (Array.isArray(parsedData) && parsedData[1] === "hb") {
        // Handle heartbeat
        return
      }

      if (Array.isArray(parsedData)) {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId]

        if (subscription?.channel === "trades") {
          // Handle trades data
          const currencyPair = subscription.request.symbol.slice(1)
          if (Array.isArray(parsedData[1])) {
            const trades = parsedData[1].map(([id, timestamp, amount, price]) => ({
              id,
              timestamp,
              amount,
              price,
            }))
            store.dispatch(updateTrades({ currencyPair, trades }))
          }
        } else if (subscription?.channel === "ticker") {
          // Handle ticker data
          store.dispatch(updateTicker({ symbol: subscription.request.symbol, data: parsedData }))
        } else if (subscription?.channel === "candles") {
          // Handle candles data
          const currencyPair = subscription.request.key.split(":")[2].slice(1)
          if (Array.isArray(parsedData[1])) {
            store.dispatch(candlesSnapshot({ currencyPair, candles: parsedData[1] }))
          } else {
            store.dispatch(candlesUpdate({ currencyPair, candle: parsedData[1] }))
          }
        }
      }
    })

    return next(action)
  }
}
```

## 🚀 Step 9: App Bootstrap

### 9.1 Bootstrap Logic (`src/modules/app/slice.ts`)

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit"
import {
  tradeSubscribeToSymbol,
  tickerSubscribeToSymbol,
  candleSubscribeToSymbol,
} from "../transport/slice"
import type { Connection } from "../../core/transport/Connection"
import type { RootState } from "../redux/store"

export const bootstrapApp = createAsyncThunk(
  "app/bootstrap",
  async (_, { dispatch, getState, extra }) => {
    const { connection } = extra as { connection: Connection }

    connection.connect()

    // Wait for connection
    await new Promise((resolve) => {
      const checkConnection = () => {
        if (connection.isConnected()) {
          resolve(null)
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })

    // Subscribe to data feeds
    const currencyPairs = ["BTCUSD", "ETHUSD", "LTCUSD"]

    currencyPairs.forEach((pair, index) => {
      setTimeout(() => {
        dispatch(tickerSubscribeToSymbol({ symbol: `t${pair}` }))
        dispatch(candleSubscribeToSymbol({ symbol: `t${pair}`, timeframe: "1M" }))
      }, index * 200)
    })

    setTimeout(() => {
      dispatch(tradeSubscribeToSymbol({ symbol: `t${currencyPairs[0]}` }))
    }, 200)
  }
)
```

## 🎯 Step 10: Final Assembly

### 10.1 Main App Component (`src/App.tsx`)

```typescript
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { useAppDispatch } from './modules/redux/hooks'
import { bootstrapApp } from './modules/app/slice'
import createStore from './modules/redux/store'
import { Container, Header, TickersPanel, TradesPanel, CandlesPanel } from './App.styled'
import TickersContainer from './modules/tickers/components/Tickers.container'
import TradesContainer from './modules/trades/components/Trades.container'
import CandlesContainer from './modules/candles/components/CandlesChart.container'

const store = createStore()

const AppContent = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(bootstrapApp())
  }, [dispatch])

  return (
    <Container>
      <Header>
        <h1>🚀 CryptoApp</h1>
      </Header>
      <TickersPanel>
        <TickersContainer />
      </TickersPanel>
      <TradesPanel>
        <TradesContainer currencyPair="BTCUSD" />
      </TradesPanel>
      <CandlesPanel>
        <CandlesContainer currencyPair="BTCUSD" />
      </CandlesPanel>
    </Container>
  )
}

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
)

export default App
```

## 🎉 Congratulations!

You've built a complete real-time cryptocurrency trading dashboard!

### What You've Learned:

- ✅ WebSocket connections with auto-reconnection
- ✅ Redux Toolkit with async thunks
- ✅ Real-time data visualization
- ✅ Styled Components with themes
- ✅ TypeScript best practices
- ✅ Modern React patterns

### Next Steps:

- Add more chart types
- Implement order book
- Add portfolio tracking
- Create mobile responsive design
- Add unit tests

Happy coding! 🚀
