# 📖 API Reference Guide

_Complete reference for all APIs, components, and interfaces in CryptoApp_

---

## 🎯 Quick Navigation

- [Redux Store API](#redux-store-api)
- [Component API](#component-api)
- [WebSocket API](#websocket-api)
- [Configuration API](#configuration-api)
- [Testing API](#testing-api)
- [Type Definitions](#type-definitions)

---

## 🏪 Redux Store API

### State Structure

```typescript
interface RootState {
  app: AppState
  trades: TradesState
  ticker: TickerState
  candles: CandlesState
  subscriptions: SubscriptionState
  refData: RefDataState
  selection: SelectionState
  book: BookState
}
```

### Store Configuration

```typescript
// src/modules/redux/store.ts
const store = configureStore({
  reducer: {
    app: appBootstrapSlice.reducer,
    trades: tradesSlice.reducer,
    subscriptions: subscriptionsSlice.reducer,
    refData: refDataSlice.reducer,
    ticker: tickerSlice.reducer,
    candles: candleSlice.reducer,
    selection: selectionSlice.reducer,
    book: bookSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { connection }, // Dependency injection
      },
    }).concat(createWsMiddleware(connection)),
})
```

### Trades Module

#### State Interface

```typescript
interface TradesState {
  [currencyPair: string]: Trade[]
}

interface Trade {
  id: number
  timestamp: number
  amount: number
  price: number
}
```

#### Actions

```typescript
// Snapshot of trades for a currency pair (initial load)
tradesSnapshotReducer(payload: { currencyPair: string; trades: Trade[] })

// Update single trade (real-time update)
tradesUpdateReducer(payload: { currencyPair: string; trade: Trade })

// Memory management with configurable limits
// Automatically limits trades to MAX_TRADES (default: 1000)
```

#### Memory Management

```typescript
// Configurable via environment variables
MAX_TRADES = Number(import.meta.env["VITE_MAX_TRADES"]) || 1000

// Automatic cleanup in reducers
if (trades.length > MAX_TRADES) {
  trades.splice(0, trades.length - MAX_TRADES)
}
```

#### Selectors

```typescript
// Get all trades for a currency pair
getTrades(state: RootState, currencyPair: string): Trade[]

// Get latest N trades
getLatestTrades(state: RootState, currencyPair: string, count: number): Trade[]

// Get trades in time range
getTradesInRange(state: RootState, currencyPair: string, startTime: number, endTime: number): Trade[]
```

**Usage Example:**

```typescript
// In component
const trades = useSelector((state: RootState) => getTrades(state, "BTCUSD"))

// Dispatch action
dispatch(
  addTrade({
    currencyPair: "BTCUSD",
    trade: { id: 123, timestamp: Date.now(), amount: 0.5, price: 45000 },
  })
)
```

### Tickers Module

#### State Interface

```typescript
interface TickerState {
  [symbol: string]: TickerData
}

interface TickerData {
  lastPrice: number
  dailyChange: number
  dailyChangeRelative: number
  volume?: number
  high?: number
  low?: number
}
```

#### Actions

```typescript
// Update ticker data
updateTicker(payload: { symbol: string; data: number[] })

// Bitfinex ticker data format: [CHANNEL_ID, [BID, BID_SIZE, ASK, ASK_SIZE,
//                               DAILY_CHANGE, DAILY_CHANGE_RELATIVE, LAST_PRICE,
//                               VOLUME, HIGH, LOW]]
```

#### Selectors

```typescript
// Get ticker for symbol
getTicker(state: RootState, symbol: string): TickerData | undefined

// Get all tickers
getAllTickers(state: RootState): TickerState

// Get positive/negative performers
getPositivePerformers(state: RootState): TickerData[]
getNegativePerformers(state: RootState): TickerData[]
```

### Candles Module

#### State Interface

```typescript
interface CandlesState {
  [currencyPair: string]: Candle[]
}

interface Candle {
  timestamp: number
  open: number
  close: number
  high: number
  low: number
  volume: number
}

type CandleTuple = [number, number, number, number, number, number]
// [timestamp, open, close, high, low, volume]
```

#### Actions

```typescript
// Load initial candle data (snapshot)
candlesSnapshotReducer(payload: { lookupKey: string; candles: CandleTuple[] })

// Update single candle (real-time update)
candlesUpdateReducer(payload: { lookupKey: string; candle: CandleTuple })
```

#### Selectors

```typescript
// Get all candles for currency pair
getCandles(state: RootState, currencyPair: string): Candle[]

// Get candles in time range
getCandlesInRange(state: RootState, currencyPair: string, startTime: number, endTime: number): Candle[]

// Get latest N candles
getLatestCandles(state: RootState, currencyPair: string, count: number): Candle[]
```

### Subscriptions Module

#### State Interface

```typescript
interface SubscriptionState {
  [channelId: number]: {
    channel: string
    request: SubscriptionRequest
    isStale: boolean
    lastUpdate?: number
  }
  wsConnectionStatus: ConnectionStatus
}

type SubscriptionRequest =
  | { channel: string; event: string; symbol: string }
  | { channel: string; event: string; key: string }

enum ConnectionStatus {
  Disconnected = "DISCONNECTED",
  Connecting = "CONNECTING",
  Connected = "CONNECTED",
  Error = "ERROR",
}
```

#### Actions

```typescript
// Update connection status
changeConnectionStatus(payload: ConnectionStatus)

// Handle subscription acknowledgment
subscribeToChannelAck(payload: {
  channelId: number
  channel: string
  request: SubscriptionRequest
})

// Update stale subscription (reset on heartbeat)
updateStaleSubscription(payload: { channelId: number })

// Mark subscription as stale (no heartbeat for 20s)
markSubscriptionStale(payload: { channelId: number })
```

#### Stale Detection

```typescript
// Stale monitor configuration
const STALE_TIMEOUT_MS = 20000 // 20 seconds without heartbeat
const STALE_CHECK_INTERVAL_MS = 5000 // Check every 5 seconds

// Start monitoring for stale subscriptions
startStaleMonitor(getState: () => RootState, dispatch: AppDispatch): () => void

// Heartbeat handling in middleware
if (Array.isArray(parsedData) && parsedData[1] === "hb") {
  const [channelId] = parsedData
  const subscription = store.getState().subscriptions[channelId]
  if (subscription?.isStale) {
    store.dispatch(updateStaleSubscription({ channelId }))
  }
  return
}
```

#### Selectors

```typescript
// Get subscription ID by channel and symbol
getSubscriptionId(state: RootState, channel: Channel, symbol?: string): number | undefined

// Check if subscription is stale
getIsSubscriptionStale(state: RootState, subscriptionId: number): boolean
```

#### Async Thunks

```typescript
// Bootstrap application with staggered subscriptions
bootstrapApp(): AsyncThunk

// Subscribe to ticker (Redux Thunk)
tickerSubscribeToSymbol(payload: { symbol: string }): AsyncThunk

// Subscribe to candles (Redux Thunk)
candlesSubscribeToSymbol(payload: { symbol: string; timeframe?: string }): AsyncThunk

// Subscribe to order book (Redux Thunk)
bookSubscribeToSymbol(payload: { symbol: string; prec?: string }): AsyncThunk

// Load reference data
refDataLoad(): AsyncThunk
```

### Bootstrap Flow

```typescript
// Staggered subscription management
export const bootstrapApp = createAsyncThunk(
  "app/bootstrap",
  async (_, { dispatch, getState, extra }) => {
    const { connection } = extra as { connection: Connection }

    connection.connect()
    await waitForConnection(getState as () => RootState)

    const currencyPairs = await dispatch(refDataLoad()).unwrap()

    // Staggered subscriptions to prevent server overload
    currencyPairs.forEach((currencyPair: string, index: number) => {
      setTimeout(
        () => {
          dispatch(tickerSubscribeToSymbol({ symbol: currencyPair }))
          dispatch(candlesSubscribeToSymbol({ symbol: currencyPair, timeframe: "1m" }))
        },
        (index + 1) * 2000 // 2-second intervals
      )
    })
  }
)
```

---

## 🧩 Component API

### CandlesChart Component

#### Props Interface

```typescript
interface Props {
  candles: Candle[]
  height?: number
  theme?: "light" | "dark"
  onRangeChange?: (start: number, end: number) => void
}
```

#### Usage

```typescript
<CandlesChart
  candles={candles}
  height={400}
  theme="dark"
  onRangeChange={(start, end) => console.log('Range changed:', start, end)}
/>
```

#### Features

- **Interactive zoom**: Mouse wheel and drag to zoom
- **Range selector**: Predefined time ranges (1d, 1w, 1m, All)
- **Navigator**: Mini chart for quick navigation
- **Responsive**: Adapts to container size
- **Dark theme**: Automatic dark theme integration

### Ticker Component

#### Props Interface

```typescript
interface Props {
  currencyPair: string
  lastPrice?: number
  dailyChange?: number
  dailyChangeRelative?: number
  onClick?: (currencyPair: string) => void
}
```

#### Usage

```typescript
<Ticker
  currencyPair="BTCUSD"
  lastPrice={45000}
  dailyChange={1250}
  dailyChangeRelative={2.85}
  onClick={(pair) => console.log('Clicked:', pair)}
/>
```

#### Features

- **Color coding**: Green for positive, red for negative changes
- **Hover effects**: Subtle blue overlay on hover
- **Responsive grid**: Adapts to different screen sizes
- **Click handling**: Optional click callback

### TradesPanel Component

#### Props Interface

```typescript
interface Props {
  trades: Trade[]
  maxItems?: number
  showHeader?: boolean
  onTradeClick?: (trade: Trade) => void
}
```

#### Usage

```typescript
<TradesPanel
  trades={trades}
  maxItems={50}
  showHeader={true}
  onTradeClick={(trade) => console.log('Trade clicked:', trade)}
/>
```

#### Features

- **Real-time updates**: Automatically scrolls to new trades
- **Virtualization**: Efficient rendering of large lists
- **Color coding**: Buy/sell indication
- **Sorting**: Chronological order (newest first)

### UpdateHighlight Component

#### Props Interface

```typescript
interface Props {
  value: string | number
  duration?: number
  highlightColor?: string
  children?: React.ReactNode
}
```

#### Usage

```typescript
<UpdateHighlight value={lastPrice} duration={1000} highlightColor="#00d4aa">
  ${lastPrice.toFixed(2)}
</UpdateHighlight>
```

#### Features

- **Flash animation**: Highlights when value changes
- **Customizable duration**: Control animation length
- **Color options**: Different colors for different types of changes

---

## 🔌 WebSocket API

### Connection Management

#### SocketIOConnectionProxy Class

```typescript
class SocketIOConnectionProxy implements ConnectionProxy {
  constructor(realm: string)

  // Connection control
  start(): void
  stop(): void
  send(message: any): void

  // Event handlers
  onConnect(callback: () => void): void
  onReceived(callback: (data: any) => void): void
  onError(callback: (error: any) => void): void
}
```

#### Connection Class

```typescript
class Connection {
  constructor(proxy: ConnectionProxy)

  connect(): void
  disconnect(): void
  send(message: string): void
  onReceive(callback: (data: string) => void): void
  isConnected(): boolean
}
```

### Message Formats

#### Subscription Messages

```typescript
// Subscribe to trades
{
  "event": "subscribe",
  "channel": "trades",
  "symbol": "tBTCUSD"
}

// Subscribe to ticker
{
  "event": "subscribe",
  "channel": "ticker",
  "symbol": "tBTCUSD"
}

// Subscribe to candles
{
  "event": "subscribe",
  "channel": "candles",
  "key": "trade:1M:tBTCUSD"
}
```

#### Response Messages

```typescript
// Subscription acknowledgment
{
  "event": "subscribed",
  "channel": "trades",
  "chanId": 12345,
  "symbol": "tBTCUSD"
}

// Trade data
[
  12345,  // Channel ID
  [       // Trade array
    [419251686, 1574694478806, 0.005, 7364.9],  // [ID, timestamp, amount, price]
    [419251687, 1574694478806, -0.005, 7364.9]
  ]
]

// Ticker data
[
  12346,  // Channel ID
  [7364.9, 7365, 7364.8, 7365.1, -45.1, -0.0061, 7364.9, 1234.5, 7400, 7300]
  // [BID, BID_SIZE, ASK, ASK_SIZE, DAILY_CHANGE, DAILY_CHANGE_PERC, LAST_PRICE, VOLUME, HIGH, LOW]
]

// Candle data
[
  12347,  // Channel ID
  [1574694480000, 7364.9, 7365.1, 7364.8, 7365, 12.34]
  // [timestamp, open, close, high, low, volume]
]
```

#### Error Handling

```typescript
// Connection error
{
  "event": "error",
  "msg": "subscribe: invalid symbol",
  "code": 10300
}

// Heartbeat (keep-alive)
[12345, "hb"]  // [channelId, "hb"]
```

---

## ⚙️ Configuration API

### Environment Configuration

```typescript
// src/config/env.ts
export const config = {
  BITFINEX_WS_URL: import.meta.env["VITE_BITFINEX_WS_URL"] || "wss://api-pub.bitfinex.com/ws/2",
  IS_PRODUCTION: import.meta.env.PROD,
  MAX_TRADES: Number(import.meta.env["VITE_MAX_TRADES"]) || 1000,
  MAX_CANDLES: Number(import.meta.env["VITE_MAX_CANDLES"]) || 5000,
}
```

### Environment Variables

```bash
# .env configuration
VITE_BITFINEX_WS_URL=wss://api-pub.bitfinex.com/ws/2
VITE_MAX_TRADES=1000
VITE_MAX_CANDLES=5000
VITE_LOG_LEVEL=info
```

---

## 🧪 Testing API

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
})
```

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Testing Utilities

```typescript
// Example test structure
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"

describe("Component Tests", () => {
  it("should render correctly", () => {
    // Test implementation
  })
})
```

---

## 🛠️ Utility Functions

### Date/Time Utilities

```typescript
// Format timestamp for display
formatTimestamp(timestamp: number, format?: string): string

// Get time range for charts
getTimeRange(period: '1d' | '1w' | '1m' | '3m' | '1y'): { start: number; end: number }

// Check if timestamp is within business hours
isBusinessHours(timestamp: number, timezone?: string): boolean
```

### Number Formatting

```typescript
// Format price with appropriate decimals
formatPrice(price: number, currencyPair: string): string

// Format percentage change
formatPercentage(value: number, decimals?: number): string

// Format large numbers (1K, 1M, 1B)
formatLargeNumber(value: number): string

// Calculate percentage change
calculatePercentageChange(oldValue: number, newValue: number): number

// AG Grid formatters with null/NaN safety
priceFormatter(params: { value: number }): string {
  if (!params || params.value == null || isNaN(params.value)) return "-"
  return formatPrice(params.value)
}

amountFormatter(params: { value: number }): string {
  if (!params || params.value == null || isNaN(params.value)) return "-"
  return formatAmount(params.value)
}

volumeFormatter(params: { value: number }): string {
  if (!params || params.value == null || isNaN(params.value)) return "-"
  return formatVolume(params.value)
}

timeFormatter(params: { value: number }): string {
  if (!params || params.value == null || isNaN(params.value)) return "-"
  return formatTime(params.value)
}
```

### Data Processing

```typescript
// Sort trades by timestamp
sortTradesByTime(trades: Trade[]): Trade[]

// Group trades by time intervals
groupTradesByInterval(trades: Trade[], intervalMs: number): Trade[][]

// Calculate OHLC from trades
calculateOHLC(trades: Trade[], intervalMs: number): Candle[]

// Merge overlapping candles
mergeCandles(candles: Candle[]): Candle[]
```

### Validation Utilities

```typescript
// Validate currency pair format
isValidCurrencyPair(pair: string): boolean

// Validate trade data
isValidTrade(trade: any): trade is Trade

// Validate candle data
isValidCandle(candle: any): candle is Candle

// Sanitize user input
sanitizeInput(input: string): string
```

---

## 📝 Type Definitions

### Core Types

```typescript
// Currency pair identifier
type CurrencyPair = string // e.g., "BTCUSD", "ETHUSD"

// Symbol with exchange prefix
type Symbol = string // e.g., "tBTCUSD", "tETHUSD"

// Timestamp in milliseconds
type Timestamp = number

// Price in base currency
type Price = number

// Volume/amount
type Volume = number
```

### API Response Types

```typescript
// Bitfinex trade response
type TradeResponse = [number, number, number, number] // [ID, timestamp, amount, price]

// Bitfinex ticker response
type TickerResponse = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

// Bitfinex candle response
type CandleResponse = [number, number, number, number, number, number] // [timestamp, open, close, high, low, volume]
```

### Component Props Types

```typescript
// Common container props
interface ContainerProps {
  currencyPair: string
  className?: string
  style?: React.CSSProperties
}

// Chart configuration
interface ChartConfig {
  height?: number
  theme?: "light" | "dark"
  showNavigator?: boolean
  showRangeSelector?: boolean
  timeframe?: string
}

// Event handler types
type TradeClickHandler = (trade: Trade) => void
type CurrencyPairClickHandler = (pair: string) => void
type RangeChangeHandler = (start: number, end: number) => void
```

### Error Types

```typescript
// WebSocket errors
interface WebSocketError {
  code: number
  message: string
  timestamp: number
}

// API errors
interface APIError {
  type: "NETWORK" | "VALIDATION" | "SERVER" | "TIMEOUT"
  message: string
  details?: any
}

// Application errors
interface AppError {
  component: string
  action: string
  error: Error
  timestamp: number
}
```

---

## 🔍 Usage Examples

### Complete Application Bootstrap

```typescript
// Main App.tsx
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { useAppDispatch } from './modules/redux/hooks'
import { bootstrapApp } from './modules/app/slice'
import { getStore } from './modules/redux/store'

const store = getStore()

const AppContent = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(bootstrapApp()) // Handles all subscriptions
  }, [dispatch])

  return (
    <Container>
      <Header>🚀 CryptoApp</Header>
      <TickersContainer />
      <TradesContainer />
      <CandlesContainer />
      <BookContainer />
    </Container>
  )
}

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
)
```

### WebSocket Handler Integration

```typescript
// Handler-based message processing
export const createWsMiddleware = (connection: Connection): Middleware => {
  return (store) => (next) => (action) => {
    connection.onReceive((data) => {
      const parsedData = JSON.parse(data)

      if (parsedData.event === "subscribed") {
        handleSubscriptionAck(parsedData, store)
      } else if (Array.isArray(parsedData)) {
        const [channelId] = parsedData
        const subscription = store.getState().subscriptions[channelId]

        switch (subscription?.channel) {
          case Channel.TRADES:
            handleTradesData(parsedData, subscription, store.dispatch)
            break
          case Channel.TICKER:
            handleTickerData(parsedData, subscription, store.dispatch)
            break
          case Channel.CANDLES:
            handleCandlesData(parsedData, subscription, store.dispatch)
            break
          case Channel.BOOK:
            handleBookData(parsedData, subscription, store.dispatch)
            break
        }
      }
    })

    return next(action)
  }
}
```

### TypeScript Configuration

```typescript
// tsconfig.app.json - Enhanced strict mode
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### Handler Pattern Example

```typescript
// Modular message handlers
export const handleTradesData = (parsedData: any[], subscription: any, dispatch: AppDispatch) => {
  const currencyPair = subscription.request.symbol.slice(1)

  if (Array.isArray(parsedData[1])) {
    // Snapshot data
    const trades = parsedData[1].map(transformTrade)
    dispatch(tradesSnapshotReducer({ currencyPair, trades }))
  } else {
    // Single trade update
    const trade = transformTrade(parsedData[1])
    dispatch(tradesUpdateReducer({ currencyPair, trade }))
  }
}
```

---

## 🚨 Error Handling

### Common Error Scenarios

```typescript
// WebSocket connection errors
try {
  connection.connect()
} catch (error) {
  console.error("Connection failed:", error)
  // Implement retry logic
}

// Invalid data handling
const isValidTrade = (data: any): data is Trade => {
  return (
    data &&
    typeof data.id === "number" &&
    typeof data.timestamp === "number" &&
    typeof data.amount === "number" &&
    typeof data.price === "number"
  )
}

// Component error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Component error:", error, errorInfo)
    // Log to error reporting service
  }
}
```

---

## 📊 Performance Considerations

### Memory Management

```typescript
// Configurable limits prevent memory leaks
const MAX_TRADES = config.MAX_TRADES // 1000 by default
const MAX_CANDLES = config.MAX_CANDLES // 5000 by default

// Automatic cleanup in reducers
if (state[currencyPair].length > MAX_TRADES) {
  state[currencyPair].splice(0, state[currencyPair].length - MAX_TRADES)
}
```

### Order Book Batching

```typescript
// Batch high-frequency order book updates (50ms delay)
const BATCH_DELAY_MS = 50
const updateQueues = new Map<string, any[]>()
const batchTimeouts = new Map<string, NodeJS.Timeout>()

const flushUpdates = (currencyPair: string, dispatch: AppDispatch) => {
  const queue = updateQueues.get(currencyPair)
  if (queue && queue.length > 0) {
    queue.forEach((order) => {
      dispatch(bookUpdateReducer({ currencyPair, order }))
    })
    updateQueues.set(currencyPair, [])
  }
  batchTimeouts.delete(currencyPair)
}

// Queue updates instead of immediate dispatch
const queue = updateQueues.get(currencyPair) || []
queue.push(order)
updateQueues.set(currencyPair, queue)

if (!batchTimeouts.has(currencyPair)) {
  const timeout = setTimeout(() => flushUpdates(currencyPair, dispatch), BATCH_DELAY_MS)
  batchTimeouts.set(currencyPair, timeout)
}
```

### Staggered Subscriptions

```typescript
// Prevents server overload with timed subscriptions
currencyPairs.forEach((currencyPair: string, index: number) => {
  setTimeout(
    () => {
      dispatch(tickerSubscribeToSymbol({ symbol: currencyPair }))
      dispatch(candlesSubscribeToSymbol({ symbol: currencyPair, timeframe: "1m" }))
    },
    (index + 1) * 2000 // 2-second intervals
  )
})
```

### Selector Optimization

```typescript
// ✅ Good: Memoized selector
const getTradesForSymbol = createSelector(
  [(state: RootState) => state.trades, (_, symbol: string) => symbol],
  (trades, symbol) => trades[symbol] || []
)

// ❌ Bad: Non-memoized selector
const getTradesForSymbol = (state: RootState, symbol: string) => state.trades[symbol] || [] // Runs on every render
```

### Component Optimization

```typescript
// ✅ Good: Memoized component
const MemoizedTicker = React.memo(Ticker, (prevProps, nextProps) => {
  return (
    prevProps.lastPrice === nextProps.lastPrice && prevProps.dailyChange === nextProps.dailyChange
  )
})

// ✅ Good: Stable callback
const handleTradeClick = React.useCallback((trade: Trade) => {
  console.log("Trade clicked:", trade)
}, [])
```

---

_This API reference is your complete guide to integrating with CryptoApp. For implementation examples, see the [Tutorial](TUTORIAL.md). For architectural decisions, see [Architecture](ARCHITECTURE.md)._
