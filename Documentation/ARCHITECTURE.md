# 🏗️ Architecture Documentation

_Deep dive into CryptoApp's system design, patterns, and architectural decisions_

---

## 🎯 Architecture Overview

CryptoApp follows a **modular, event-driven architecture** designed for real-time financial data processing. The system prioritizes **performance**, **reliability**, and **maintainability** while handling high-frequency market data updates.

### Core Principles

- **Redux Toolkit + Thunk**: Modern Redux with async subscription management
- **Handler-Based Processing**: Modular WebSocket message handlers for maintainability
- **Bitfinex API Integration**: Direct WebSocket API v2 integration with staggered subscriptions
- **Memory Management**: Configurable limits preventing memory leaks
- **Separation of Concerns**: Each module has a single responsibility
- **Unidirectional Data Flow**: Redux ensures predictable state changes
- **Real-time First**: Architecture optimized for live data streams
- **Type Safety**: Enhanced TypeScript strict mode prevents runtime errors
- **Testing First**: Comprehensive Vitest testing strategy
- **Production Ready**: Environment configuration and error handling

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
├─────────────────────────────────────────────────────────────┤
│  React Components  │  Styled Components  │  Highcharts     │
│  - CandlesChart    │  - Theme System     │  - Interactive  │
│  - Ticker          │  - Responsive Grid  │  - Real-time    │
│  - TradesPanel     │  - Animations       │  - Professional │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│     Redux Store     │    Selectors      │   Middleware     │
│  - Centralized      │  - Memoized       │  - WebSocket     │
│  - Immutable        │  - Optimized      │  - Logging       │
│  - Time-travel      │  - Composable     │  - Error Handle  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Transport Layer                           │
├─────────────────────────────────────────────────────────────┤
│   WebSocket Proxy   │  Connection Mgmt  │  Message Parser  │
│  - Auto-reconnect   │  - Health Check   │  - Validation    │
│  - Exponential      │  - Circuit Break  │  - Transformation│
│  - Rate Limiting    │  - Status Track   │  - Error Handle  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
├─────────────────────────────────────────────────────────────┤
│    Bitfinex API     │   Market Data     │   Price Feeds    │
│  - WebSocket v2     │  - Real-time      │  - Historical    │
│  - REST API         │  - High-frequency │  - Aggregated    │
│  - Rate Limited     │  - Multi-symbol   │  - Normalized    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Module Architecture

### 1. Core Module (`src/core/`)

**Purpose**: Shared utilities and foundational components

```
core/
├── components/           # Reusable UI components
│   ├── AnimatedCube/     # 3D loading animations
│   ├── Diagnostics/      # Connection monitoring
│   ├── LineChart/        # Mini price charts
│   ├── Loading/          # Loading states
│   ├── Stale/            # Stale data indicators
│   ├── TrendIndicator/   # Up/down arrows
│   ├── UpdateHighlight/  # Value change animations
│   └── Widget/           # Container components
├── transport/           # WebSocket management
│   ├── handlers/        # Modular message handlers
│   │   ├── bookHandler.ts
│   │   ├── candlesHandler.ts
│   │   ├── subscriptionHandlers.ts
│   │   ├── tickerHandler.ts
│   │   └── tradesHandler.ts
│   ├── Connection.ts    # Main connection class
│   ├── WsConnectionProxy.ts  # WebSocket implementation
│   ├── wsMiddleware.ts  # Redux middleware with handlers
│   └── types/          # Transport interfaces
└── hooks/              # Custom React hooks
    ├── useGridResize.ts
    ├── useLatest.ts
    ├── usePrevious.ts
    └── useThrottle.ts
```

**Key Responsibilities**:

- WebSocket connection management with auto-reconnection
- Reusable UI components with consistent styling
- Utility functions for data processing and formatting
- Type definitions for cross-module interfaces

**Design Patterns**:

- **Proxy Pattern**: `ConnectionProxy` abstracts WebSocket implementation
- **Observer Pattern**: Event-driven connection state management
- **Strategy Pattern**: Pluggable reconnection strategies

### 2. Redux Module (`src/modules/redux/`)

**Purpose**: Centralized state management and configuration

```
redux/
├── store.ts            # Store configuration
├── hooks.ts           # Typed Redux hooks
└── middleware/        # Custom middleware
    ├── logger.ts      # Development logging
    └── persistence.ts # State persistence
```

**Store Configuration**:

```typescript
// src/modules/redux/store.ts - Production-ready store
const connectionProxy = new WsConnectionProxy(config.BITFINEX_WS_URL)
export const connection = new Connection(connectionProxy)

function createStore() {
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
      ping: pingSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { connection }, // Dependency injection
        },
      }).concat(createWsMiddleware(connection)),
  })

  // Connection event handlers
  connection.onConnect(() => {
    store.dispatch(changeConnectionStatus(ConnectionStatus.Connected))
    store.dispatch(startPing())
  })

  connection.onClose(() => {
    store.dispatch(changeConnectionStatus(ConnectionStatus.Disconnected))
  })

  return store
}
```

**Architecture Benefits**:

- **Single Source of Truth**: All application state in one place
- **Time Travel Debugging**: Redux DevTools integration
- **Predictable Updates**: Immutable state changes
- **Middleware Pipeline**: Extensible processing chain

### 3. Trades Module (`src/modules/trades/`)

**Purpose**: Real-time trade data management

```
trades/
├── slice.ts              # Redux slice
├── selectors.ts          # Memoized selectors
├── types/               # Type definitions
│   └── Trade.ts
└── components/          # Trade-related UI
    ├── TradesPanel.tsx
    ├── TradesPanel.styled.ts
    └── TradesPanel.container.tsx
```

**Redux Thunk Data Flow**:

```
User Action → Redux Thunk → Bitfinex API → WebSocket → Middleware → Reducer → Selector → Component
     │            │             │            │           │            │          │         │
     │            │             │            │           │            │          │         └─ UI Update
     │            │             │            │           │            │          └─ Memoized Access
     │            │             │            │           │            └─ Immutable Update
     │            │             │            │           └─ Message Parsing
     │            │             │            └─ Real-time Data
     │            │             └─ Subscription Request
     │            └─ Async Operation
     └─ Component Interaction
```

**Performance Optimizations**:

- **Memoized Selectors**: Prevent unnecessary re-renders
- **Sorted Insertion**: Maintain chronological order efficiently
- **Batch Updates**: Group multiple trades in single action
- **Memory Management**: Limit stored trade history

### 4. Tickers Module (`src/modules/tickers/`)

**Purpose**: Price ticker display and management

```
tickers/
├── slice.ts              # Redux slice
├── selectors.ts          # Price calculations
└── components/
    ├── Ticker/          # Individual ticker
    │   ├── Ticker.tsx
    │   ├── Ticker.styled.ts
    │   └── Ticker.container.tsx
    └── Tickers/         # Ticker grid
        ├── Tickers.tsx
        ├── Tickers.styled.ts
        └── Tickers.container.tsx
```

**State Normalization**:

```typescript
// Normalized state structure for O(1) lookups
interface TickerState {
  [symbol: string]: {
    lastPrice: number
    dailyChange: number
    dailyChangeRelative: number
    volume: number
    high: number
    low: number
    timestamp: number
  }
}
```

**UI Patterns**:

- **Container/Presenter**: Separation of data and presentation logic
- **Compound Components**: Flexible ticker composition
- **Responsive Grid**: CSS Grid with dynamic columns
- **Color Coding**: Semantic colors for market movements

### 5. Candles Module (`src/modules/candles/`)

**Purpose**: Candlestick chart data and visualization

```
candles/
├── slice.ts              # OHLC data management
├── selectors.ts          # Chart data preparation
├── types/
│   └── Candle.ts
└── components/
    ├── CandlesChart.tsx         # Highcharts integration
    ├── CandlesChart.styled.ts   # Chart styling
    └── CandlesChart.container.tsx
```

**Chart Integration Architecture**:

```typescript
// Highcharts integration with React lifecycle
useEffect(() => {
  const chartData = candles.map(transformToHighchartsFormat)

  setChartOptions({
    series: [
      {
        type: "candlestick",
        data: chartData,
      },
    ],
    // Professional trading chart configuration
    rangeSelector: { enabled: true },
    navigator: { enabled: true },
    scrollbar: { enabled: true },
  })
}, [candles])
```

**Data Transformation Pipeline**:

```
Bitfinex Format → Normalized Candle → Highcharts Format → Chart Render
[ts,o,c,h,l,v]  →  {timestamp,open,  →  [ts,o,h,l,c]  →  Visual Chart
                    close,high,low,
                    volume}
```

### 6. Transport Module (`src/core/transport/`)

**Purpose**: WebSocket communication and message handling

```
transport/
├── Connection.ts              # High-level connection API
├── SocketIOConnectionProxy.ts # WebSocket implementation
├── wsMiddleware.ts           # Redux integration
├── slice.ts                  # Subscription management
└── types/
    ├── ConnectionProxy.ts    # Interface definitions
    └── ConnectionStatus.ts   # Status enumeration
```

**Connection State Machine**:

```
Disconnected ──connect()──→ Connecting ──success──→ Connected
     ↑                           │                      │
     │                           │                      │
     └──────── disconnect() ←────┴──── error/close ────┘
                                 │                      │
                                 ▼                      ▼
                              Error ←── retry limit ── Reconnecting
                                                          ↑
                                                          │
                                                    exponential
                                                     backoff
```

**Message Processing Pipeline**:

```typescript
// Middleware processes all WebSocket messages
const wsMiddleware: Middleware = (store) => (next) => (action) => {
  connection.onReceive((data) => {
    const parsed = JSON.parse(data)

    // Route messages based on channel type
    if (parsed.event === "subscribed") {
      store.dispatch(subscribeToChannelAck(parsed))
    } else if (Array.isArray(parsed)) {
      const [channelId, payload] = parsed
      const subscription = store.getState().subscriptions[channelId]

      // Dispatch to appropriate module
      switch (subscription?.channel) {
        case "trades":
          store.dispatch(updateTrades({ currencyPair, trades: payload }))
          break
        case "ticker":
          store.dispatch(updateTicker({ symbol, data: payload }))
          break
        case "candles":
          store.dispatch(candlesUpdate({ currencyPair, candle: payload }))
          break
      }
    }
  })

  return next(action)
}
```

---

## 🔄 Data Flow Architecture

### Redux Thunk Subscription Flow

```
User Action → Component → Redux Thunk → Bitfinex API → WebSocket Send → Server Response
    │             │           │             │              │              │
    │             │           │             │              │              └─ Subscription Ack
    │             │           │             │              └─ Channel Subscribe
    │             │           │             └─ Message Format
    │             │           └─ Async Operation
    │             └─ Event Handler
    └─ UI Interaction
```

### Response Flow (Data Updates)

```
WebSocket Receive → Middleware → Parse → Validate → Route → Reducer → Selector → Component
       │               │          │        │         │        │          │         │
       │               │          │        │         │        │          │         └─ UI Update
       │               │          │        │         │        │          └─ Memoized Access
       │               │          │        │         │        └─ Immutable Update
       │               │          │        │         └─ Channel Routing
       │               │          │        └─ Data Validation
       │               │          └─ JSON Parsing
       │               └─ Message Interception
       └─ Raw Server Data
```

### Error Flow (Failure Handling)

```
Error Occurrence → Error Boundary → Log → Retry Logic → Fallback UI
       │               │            │        │            │
       │               │            │        │            └─ Graceful Degradation
       │               │            │        └─ Exponential Backoff
       │               │            └─ Error Reporting
       │               └─ Component Recovery
       └─ Network/Parse/Validation Error
```

---

## 🎨 UI Architecture

### Component Hierarchy

```
App
├── Header (Sparkling animation)
├── TickersPanel
│   └── Tickers
│       └── Ticker[] (Grid layout)
├── TradesPanel
│   └── TradesGrid (Virtualized list)
└── CandlesPanel
    └── CandlesChart (Highcharts integration)
```

### Styling Architecture

```
Theme System
├── Global Styles (index.css)
│   ├── CSS Reset
│   ├── Typography (IBM Plex Sans)
│   └── Layout Utilities
├── Theme Provider (Styled Components)
│   ├── Color Palette
│   ├── Spacing Scale
│   └── Animation Timings
└── Component Styles
    ├── Styled Components
    ├── CSS-in-JS
    └── Responsive Breakpoints
```

**Design System**:

```typescript
// Centralized theme configuration
const theme = {
  colors: {
    background: "#1b1e2b",
    surface: "#252837",
    primary: "#00d4aa",
    danger: "#ff6b6b",
    text: "#ffffff",
    textSecondary: "#c4c7c9",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  animations: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
}
```

### Responsive Strategy

```css
/* Mobile-first responsive design */
.container {
  /* Base: Mobile layout */
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "ticker"
    "trades"
    "candles";
}

@media (min-width: 768px) {
  /* Tablet: Side-by-side */
  .container {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "header header"
      "ticker ticker"
      "trades candles";
  }
}

@media (min-width: 1024px) {
  /* Desktop: Full layout */
  .container {
    grid-template-columns: 400px 1fr 1fr;
    grid-template-areas:
      "header header header"
      "ticker ticker ticker"
      "trades candles candles";
  }
}
```

---

## 🔧 Performance Architecture

### Rendering Optimization

```typescript
// Component memoization strategy
const MemoizedTicker = React.memo(Ticker, (prev, next) => {
  // Custom comparison for financial data
  return (
    prev.lastPrice === next.lastPrice &&
    prev.dailyChange === next.dailyChange &&
    prev.dailyChangeRelative === next.dailyChangeRelative
  )
})

// Selector memoization
const getTradesForSymbol = createSelector(
  [getTradesState, getSymbolParam],
  (trades, symbol) => trades[symbol] || [],
  {
    // Custom equality check for arrays
    memoizeOptions: {
      equalityCheck: (a, b) => a.length === b.length && a.every((item, i) => item.id === b[i].id),
    },
  }
)
```

### Memory Management

```typescript
// Bounded data storage
const MAX_TRADES_PER_SYMBOL = 1000
const MAX_CANDLES_PER_SYMBOL = 5000

// Automatic cleanup in reducers
addTrade: (state, action) => {
  const trades = state[currencyPair]
  trades.push(newTrade)

  // Keep only recent trades
  if (trades.length > MAX_TRADES_PER_SYMBOL) {
    trades.splice(0, trades.length - MAX_TRADES_PER_SYMBOL)
  }
}
```

### Network Optimization

```typescript
// Connection pooling and rate limiting
class ConnectionManager {
  private connections = new Map<string, Connection>()
  private subscriptionQueue: SubscriptionRequest[] = []
  private readonly SUBSCRIPTION_RATE_LIMIT = 5 // per second

  async subscribe(request: SubscriptionRequest) {
    // Queue subscriptions to respect rate limits
    this.subscriptionQueue.push(request)
    this.processQueue()
  }

  private processQueue() {
    // Process subscriptions with rate limiting
    const batch = this.subscriptionQueue.splice(0, this.SUBSCRIPTION_RATE_LIMIT)
    batch.forEach((request) => this.sendSubscription(request))

    if (this.subscriptionQueue.length > 0) {
      setTimeout(() => this.processQueue(), 1000)
    }
  }
}
```

---

## 🛡️ Security Architecture

### Input Validation

```typescript
// Multi-layer validation
const validateTrade = (data: unknown): data is Trade => {
  return (
    isObject(data) &&
    isNumber(data.id) &&
    data.id > 0 &&
    isNumber(data.timestamp) &&
    data.timestamp > 0 &&
    isNumber(data.amount) &&
    isFinite(data.amount) &&
    isNumber(data.price) &&
    data.price > 0
  )
}

// Sanitization pipeline
const sanitizeMessage = (message: string): string => {
  return message
    .replace(/[<>]/g, "") // Remove HTML tags
    .slice(0, 1000) // Limit length
    .trim() // Remove whitespace
}
```

### WebSocket Security

```typescript
// Secure connection configuration
const connection = new WebSocket(url, {
  // Security headers
  headers: {
    "User-Agent": "CryptoApp/1.0",
    Origin: window.location.origin,
  },
  // Connection limits
  handshakeTimeout: 10000,
  maxPayload: 1024 * 1024, // 1MB limit
})

// Message validation
connection.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data)

    // Validate message structure
    if (!isValidMessage(data)) {
      console.warn("Invalid message received:", data)
      return
    }

    processMessage(data)
  } catch (error) {
    console.error("Message parsing failed:", error)
  }
}
```

### Error Boundaries

```typescript
// Component-level error isolation
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    logError('Component Error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now()
    })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
```

---

## 📊 Monitoring Architecture

### Performance Monitoring

```typescript
// Performance metrics collection
class PerformanceMonitor {
  private metrics = new Map<string, number[]>()

  measureRenderTime(componentName: string, renderFn: () => void) {
    const start = performance.now()
    renderFn()
    const end = performance.now()

    this.recordMetric(`render.${componentName}`, end - start)
  }

  measureSelectorTime(selectorName: string, selectorFn: () => any) {
    const start = performance.now()
    const result = selectorFn()
    const end = performance.now()

    this.recordMetric(`selector.${selectorName}`, end - start)
    return result
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const values = this.metrics.get(name)!
    values.push(value)

    // Keep only recent measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || []
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }
}
```

### Error Tracking

```typescript
// Centralized error logging
interface ErrorLog {
  timestamp: number
  level: "error" | "warn" | "info"
  message: string
  context: {
    component?: string
    action?: string
    userId?: string
    sessionId: string
  }
  stack?: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []

  logError(message: string, context: Partial<ErrorLog["context"]> = {}) {
    const log: ErrorLog = {
      timestamp: Date.now(),
      level: "error",
      message,
      context: {
        sessionId: this.getSessionId(),
        ...context,
      },
      stack: new Error().stack,
    }

    this.logs.push(log)

    // Send to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoringService(log)
    }
  }
}
```

---

## 🔮 Scalability Architecture

### Horizontal Scaling Considerations

```typescript
// Multi-instance coordination
interface ScalingStrategy {
  // Connection distribution
  connectionSharding: {
    strategy: "round-robin" | "least-connections" | "geographic"
    maxConnectionsPerInstance: number
  }

  // Data synchronization
  stateSynchronization: {
    method: "websocket" | "polling" | "event-sourcing"
    syncInterval: number
  }

  // Load balancing
  loadBalancing: {
    algorithm: "weighted" | "random" | "hash-based"
    healthCheckInterval: number
  }
}
```

### Microservices Integration

```typescript
// Service communication patterns
interface ServiceArchitecture {
  // API Gateway pattern
  gateway: {
    routing: Map<string, string>
    rateLimit: number
    authentication: boolean
  }

  // Event-driven communication
  eventBus: {
    topics: string[]
    partitioning: "symbol" | "user" | "geographic"
    retention: number
  }

  // Circuit breaker pattern
  circuitBreaker: {
    failureThreshold: number
    timeout: number
    fallbackStrategy: "cache" | "default" | "error"
  }
}
```

---

## 🎯 Design Decisions & Trade-offs

### Technology Choices

#### Redux Toolkit vs. Zustand

**Decision**: Redux Toolkit
**Reasoning**:

- ✅ Better DevTools integration for financial debugging
- ✅ Mature ecosystem with middleware support
- ✅ Time-travel debugging for trade analysis
- ❌ More boilerplate than Zustand
- ❌ Steeper learning curve

#### Styled Components vs. CSS Modules

**Decision**: Styled Components
**Reasoning**:

- ✅ Dynamic theming based on market conditions
- ✅ Component co-location
- ✅ TypeScript integration
- ❌ Runtime CSS generation overhead
- ❌ Larger bundle size

#### Highcharts vs. D3.js

**Decision**: Highcharts
**Reasoning**:

- ✅ Professional financial chart features out-of-the-box
- ✅ Better performance for real-time updates
- ✅ Extensive documentation and examples
- ❌ Commercial license required for production
- ❌ Less customization flexibility than D3

### Architectural Trade-offs

#### Normalization vs. Denormalization

**Decision**: Normalized state with memoized selectors
**Trade-offs**:

- ✅ Consistent data updates
- ✅ Memory efficiency
- ✅ Easier debugging
- ❌ More complex selectors
- ❌ Potential performance overhead

#### Real-time vs. Polling

**Decision**: WebSocket real-time updates
**Trade-offs**:

- ✅ Sub-second latency
- ✅ Server push efficiency
- ✅ Better user experience
- ❌ Connection complexity
- ❌ Harder to debug

#### Client-side vs. Server-side Calculations

**Decision**: Client-side with server validation
**Trade-offs**:

- ✅ Reduced server load
- ✅ Immediate UI feedback
- ✅ Offline capability
- ❌ Potential inconsistencies
- ❌ Client resource usage

---

## 🚀 Future Architecture Evolution

### Planned Enhancements

1. **Micro-frontend Architecture**: Split into independently deployable modules
2. **Service Worker Integration**: Offline-first capabilities
3. **WebRTC Data Channels**: Peer-to-peer price sharing
4. **GraphQL Subscriptions**: More efficient data fetching
5. **Web Assembly**: High-performance calculations

### Migration Strategies

```typescript
// Gradual migration approach
interface MigrationPlan {
  phase1: {
    target: "Service Worker Integration"
    timeline: "2 weeks"
    riskLevel: "low"
  }

  phase2: {
    target: "GraphQL Layer"
    timeline: "4 weeks"
    riskLevel: "medium"
  }

  phase3: {
    target: "Micro-frontend Split"
    timeline: "8 weeks"
    riskLevel: "high"
  }
}
```

---

_This architecture documentation serves as the blueprint for CryptoApp's technical implementation. For specific implementation details, see the [API Reference](API_REFERENCE.md). For deployment considerations, see [Deployment Guide](DEPLOYMENT.md)._
