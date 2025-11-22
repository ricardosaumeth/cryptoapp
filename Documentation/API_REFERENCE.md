# 📖 API Reference Guide

_Complete reference for all APIs, components, and interfaces in CryptoApp_

---

## 🎯 Quick Navigation

- [Redux Store API](#redux-store-api)
- [Component API](#component-api)
- [WebSocket API](#websocket-api)
- [Utility Functions](#utility-functions)
- [Type Definitions](#type-definitions)

---

## 🏪 Redux Store API

### State Structure

```typescript
interface RootState {
  trades: TradesState
  tickers: TickerState
  candles: CandlesState
  subscriptions: SubscriptionState
  refData: RefDataState
}
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
// Update entire trade list for a currency pair
updateTrades(payload: { currencyPair: string; trades: Trade[] })

// Add or update single trade
addTrade(payload: { currencyPair: string; trade: Trade })
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

// Bitfinex data format: [BID, BID_SIZE, ASK, ASK_SIZE, DAILY_CHANGE,
//                        DAILY_CHANGE_RELATIVE, LAST_PRICE, VOLUME, HIGH, LOW]
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
candlesSnapshot(payload: { currencyPair: string; candles: CandleTuple[] })

// Update single candle (real-time update)
candlesUpdate(payload: { currencyPair: string; candle: CandleTuple })
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
wsConnectionStatusChanged(payload: ConnectionStatus)

// Handle subscription acknowledgment
subscribeToChannelAck(payload: {
  channelId: number
  channel: string
  request: SubscriptionRequest
})
```

#### Async Thunks

```typescript
// Subscribe to trades
tradeSubscribeToSymbol(payload: { symbol: string }): AsyncThunk

// Subscribe to ticker
tickerSubscribeToSymbol(payload: { symbol: string }): AsyncThunk

// Subscribe to candles
candleSubscribeToSymbol(payload: { symbol: string; timeframe?: string }): AsyncThunk
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

### Complete Component Integration

```typescript
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTrades, getCandles, getTicker } from './selectors'
import { tradeSubscribeToSymbol } from './actions'
import { CandlesChart, Ticker, TradesPanel } from './components'

const TradingDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const currencyPair = 'BTCUSD'

  // Get data from store
  const trades = useSelector((state: RootState) => getTrades(state, currencyPair))
  const candles = useSelector((state: RootState) => getCandles(state, currencyPair))
  const ticker = useSelector((state: RootState) => getTicker(state, `t${currencyPair}`))

  // Subscribe to data on mount
  React.useEffect(() => {
    dispatch(tradeSubscribeToSymbol({ symbol: `t${currencyPair}` }))
  }, [dispatch, currencyPair])

  return (
    <div className="trading-dashboard">
      <Ticker
        currencyPair={currencyPair}
        lastPrice={ticker?.lastPrice}
        dailyChange={ticker?.dailyChange}
        dailyChangeRelative={ticker?.dailyChangeRelative}
      />

      <CandlesChart
        candles={candles}
        height={400}
        theme="dark"
      />

      <TradesPanel
        trades={trades}
        maxItems={50}
        showHeader={true}
      />
    </div>
  )
}
```

### Custom Hook Example

```typescript
// Custom hook for managing currency pair data
function useCurrencyPairData(currencyPair: string) {
  const dispatch = useDispatch()

  const trades = useSelector((state: RootState) => getTrades(state, currencyPair))
  const candles = useSelector((state: RootState) => getCandles(state, currencyPair))
  const ticker = useSelector((state: RootState) => getTicker(state, `t${currencyPair}`))

  const subscribe = React.useCallback(() => {
    dispatch(tradeSubscribeToSymbol({ symbol: `t${currencyPair}` }))
    dispatch(tickerSubscribeToSymbol({ symbol: `t${currencyPair}` }))
    dispatch(candleSubscribeToSymbol({ symbol: `t${currencyPair}`, timeframe: "1M" }))
  }, [dispatch, currencyPair])

  return {
    trades,
    candles,
    ticker,
    subscribe,
    isLoading: !trades.length && !candles.length,
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
