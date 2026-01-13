# 🚀 Building Real-Time UIs: The Complete Guide

_From Theory to Production with CryptoApp_

---

## Table of Contents

1. [Why Real-Time UIs Matter Today](#why-real-time-uis-matter-today)
2. [Core Principles of Real-Time UI Design](#core-principles-of-real-time-ui-design)
3. [Data Synchronisation Patterns](#data-synchronisation-patterns)
4. [State Management for Real-Time Apps](#state-management-for-real-time-apps)
5. [UI Rendering Patterns](#ui-rendering-patterns)
6. [Error Handling & Resilience](#error-handling-resilience)
7. [Performance Techniques](#performance-techniques)
8. [Putting It All Together](#putting-it-all-together)
9. [Conclusion](#conclusion)

---

## Why Real-Time UIs Matter Today

### The Real-Time Revolution

We live in an era where users expect instant feedback. The days of clicking "refresh" to see updates are over. Modern applications must deliver information as it happens, creating experiences that feel alive and responsive.

### Market Trends Driving Real-Time Adoption

**The Numbers Don't Lie:**

- 73% of users expect real-time updates in financial applications
- Real-time features increase user engagement by 40-60%
- Applications with sub-second response times see 25% higher conversion rates
- 89% of users abandon apps that feel slow or unresponsive

**Technology Enablers:**

- WebSocket adoption has grown 300% since 2020
- 5G networks enable ultra-low latency connections
- Edge computing brings data processing closer to users
- Modern browsers support advanced real-time APIs

### Critical Use Cases

#### 1. Fintech & Trading

```typescript
// Real-time price updates are mission-critical
const PriceDisplay = ({ symbol }) => {
  const price = useRealTimePrice(symbol)

  return (
    <div className={price.change > 0 ? 'positive' : 'negative'}>
      ${price.value.toFixed(2)}
      <TrendIndicator change={price.change} />
    </div>
  )
}
```

**Why it matters:** In trading, milliseconds can mean thousands of dollars. Users need instant price updates, order confirmations, and portfolio changes.

#### 2. SaaS Dashboards & Analytics

```typescript
// Live metrics that update without refresh
const MetricsDashboard = () => {
  const metrics = useRealTimeMetrics()

  return (
    <Grid>
      <MetricCard title="Active Users" value={metrics.activeUsers} />
      <MetricCard title="Revenue" value={metrics.revenue} />
      <LiveChart data={metrics.chartData} />
    </Grid>
  )
}
```

**Why it matters:** Business decisions require up-to-date information. Stale data leads to poor decisions and lost opportunities.

#### 3. Gaming & Interactive Experiences

```typescript
// Multiplayer game state synchronization
const GameBoard = () => {
  const gameState = useGameSync()

  return (
    <Board>
      {gameState.players.map(player => (
        <Player key={player.id} position={player.position} />
      ))}
    </Board>
  )
}
```

**Why it matters:** Gaming requires perfect synchronization between players. Any lag destroys the experience.

#### 4. Collaborative Tools

```typescript
// Real-time document collaboration
const CollaborativeEditor = () => {
  const { content, cursors } = useCollaboration()

  return (
    <Editor>
      <Content value={content} />
      {cursors.map(cursor => (
        <Cursor key={cursor.userId} position={cursor.position} />
      ))}
    </Editor>
  )
}
```

**Why it matters:** Teams need to see changes instantly to collaborate effectively without conflicts.

---

## Core Principles of Real-Time UI Design

### 1. Latency: The Silent Killer

**The Human Perception Threshold:**

- **0-16ms**: Imperceptible (60 FPS)
- **16-100ms**: Feels instant
- **100-300ms**: Noticeable delay
- **300ms+**: Feels broken

```typescript
// Measuring and optimizing latency
const useLatencyTracking = () => {
  const [latency, setLatency] = useState(0)

  useEffect(() => {
    const measureLatency = () => {
      const start = performance.now()

      // Simulate data processing
      processData().then(() => {
        const end = performance.now()
        setLatency(end - start)

        if (end - start > 100) {
          console.warn("High latency detected:", end - start, "ms")
        }
      })
    }

    const interval = setInterval(measureLatency, 1000)
    return () => clearInterval(interval)
  }, [])

  return latency
}
```

### 2. Consistency: Predictable Behavior

Users must trust that your application behaves predictably. Inconsistent updates create confusion and erode confidence.

```typescript
// Consistent update patterns
const useConsistentUpdates = (data) => {
  const [displayData, setDisplayData] = useState(data)

  useEffect(() => {
    // Always update in the same order
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp)

    // Batch updates to prevent flickering
    const timeoutId = setTimeout(() => {
      setDisplayData(sortedData)
    }, 16) // Next frame

    return () => clearTimeout(timeoutId)
  }, [data])

  return displayData
}
```

### 3. Predictability: Meeting User Expectations

Users develop mental models of how your application works. Breaking these models creates friction.

```typescript
// Predictable loading states
const DataComponent = () => {
  const { data, isLoading, error } = useRealTimeData()

  if (error) return <ErrorState />
  if (isLoading) return <SkeletonLoader />

  return <DataDisplay data={data} />
}
```

### 4. User Trust: The Foundation

Trust is built through reliability, transparency, and graceful error handling.

```typescript
// Building trust through transparency
const ConnectionStatus = () => {
  const { status, lastUpdate } = useConnectionHealth()

  return (
    <StatusIndicator>
      <StatusDot color={status === 'connected' ? 'green' : 'red'} />
      <StatusText>
        {status === 'connected'
          ? `Live • Updated ${formatTime(lastUpdate)}`
          : 'Reconnecting...'
        }
      </StatusText>
    </StatusIndicator>
  )
}
```

---

## Data Synchronisation Patterns

### 1. Polling: The Simple Approach

**When to use:** Simple data that doesn't change frequently, legacy systems, or when WebSockets aren't available.

```typescript
// Smart polling with exponential backoff
const usePolling = (url, interval = 5000) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let timeoutId
    let currentInterval = interval

    const poll = async () => {
      try {
        const response = await fetch(url)
        const newData = await response.json()
        setData(newData)
        setError(null)
        currentInterval = interval // Reset on success
      } catch (err) {
        setError(err)
        currentInterval = Math.min(currentInterval * 2, 30000) // Exponential backoff
      }

      timeoutId = setTimeout(poll, currentInterval)
    }

    poll()
    return () => clearTimeout(timeoutId)
  }, [url, interval])

  return { data, error }
}
```

**Pros:** Simple, works everywhere, easy to debug
**Cons:** Inefficient, higher latency, server load

### 2. WebSockets: The Real-Time Champion

**When to use:** High-frequency updates, bidirectional communication, real-time applications.

```typescript
// Production-ready WebSocket hook
const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState("Disconnected")
  const [messageHistory, setMessageHistory] = useState([])

  useEffect(() => {
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const connect = () => {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        setConnectionStatus("Connected")
        setSocket(ws)
        reconnectAttempts = 0
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        setMessageHistory((prev) => [...prev.slice(-99), message]) // Keep last 100
      }

      ws.onclose = () => {
        setConnectionStatus("Disconnected")

        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts) * 1000
          setTimeout(connect, delay)
          reconnectAttempts++
        }
      }

      ws.onerror = () => {
        setConnectionStatus("Error")
      }
    }

    connect()

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [url])

  const sendMessage = useCallback(
    (message) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message))
      }
    },
    [socket]
  )

  return { connectionStatus, messageHistory, sendMessage }
}
```

**Pros:** Low latency, bidirectional, efficient
**Cons:** More complex, connection management, firewall issues

### 3. Server-Sent Events: The Middle Ground

**When to use:** One-way updates from server, simpler than WebSockets, better browser support.

```typescript
// Server-Sent Events implementation
const useServerSentEvents = (url) => {
  const [data, setData] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState("Disconnected")

  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.onopen = () => {
      setConnectionStatus("Connected")
    }

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data)
      setData(newData)
    }

    eventSource.onerror = () => {
      setConnectionStatus("Error")
    }

    return () => {
      eventSource.close()
    }
  }, [url])

  return { data, connectionStatus }
}
```

**Pros:** Simple, automatic reconnection, HTTP-friendly
**Cons:** One-way only, limited browser support for custom headers

### 4. GraphQL Subscriptions: The Modern Approach

**When to use:** Complex data requirements, existing GraphQL infrastructure, type safety needs.

```typescript
// GraphQL subscription with Apollo Client
const PRICE_SUBSCRIPTION = gql`
  subscription PriceUpdates($symbol: String!) {
    priceUpdates(symbol: $symbol) {
      symbol
      price
      change
      timestamp
    }
  }
`

const PriceTracker = ({ symbol }) => {
  const { data, loading, error } = useSubscription(PRICE_SUBSCRIPTION, {
    variables: { symbol }
  })

  if (loading) return <SkeletonLoader />
  if (error) return <ErrorMessage error={error} />

  return (
    <PriceDisplay
      price={data.priceUpdates.price}
      change={data.priceUpdates.change}
    />
  )
}
```

**Pros:** Type safety, complex queries, caching
**Cons:** GraphQL overhead, learning curve, infrastructure requirements

### Decision Matrix

| Pattern    | Latency | Complexity | Scalability | Use Case       |
| ---------- | ------- | ---------- | ----------- | -------------- |
| Polling    | High    | Low        | Poor        | Simple updates |
| WebSockets | Low     | High       | Excellent   | Real-time apps |
| SSE        | Medium  | Medium     | Good        | Live feeds     |
| GraphQL    | Medium  | High       | Good        | Complex data   |

---

## State Management for Real-Time Apps

### Local State vs Global State

**The Golden Rule:** Keep state as local as possible, but global when necessary.

```typescript
// Local state for component-specific data
const PriceWidget = ({ symbol }) => {
  const [isExpanded, setIsExpanded] = useState(false) // Local
  const price = useGlobalPrice(symbol) // Global

  return (
    <Widget>
      <PriceDisplay price={price} />
      {isExpanded && <PriceHistory symbol={symbol} />}
      <ExpandButton onClick={() => setIsExpanded(!isExpanded)} />
    </Widget>
  )
}
```

### TanStack Query Patterns

TanStack Query excels at managing server state with built-in caching, background updates, and optimistic updates.

```typescript
// Real-time data with TanStack Query
const useLivePrices = (symbols) => {
  return useQuery({
    queryKey: ["prices", symbols],
    queryFn: () => fetchPrices(symbols),
    refetchInterval: 1000, // Poll every second
    staleTime: 500, // Consider data stale after 500ms
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}

// Optimistic updates for user actions
const useTradeOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitOrder,
    onMutate: async (newOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orders"] })

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(["orders"])

      // Optimistically update
      queryClient.setQueryData(["orders"], (old) => [...old, newOrder])

      return { previousOrders }
    },
    onError: (err, newOrder, context) => {
      // Rollback on error
      queryClient.setQueryData(["orders"], context.previousOrders)
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
```

### Redux Toolkit Patterns

Redux Toolkit with RTK Query provides powerful real-time capabilities through subscriptions and caching.

```typescript
// RTK Query API slice with subscriptions
const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getPrices: builder.query({
      query: (symbols) => `prices?symbols=${symbols.join(",")}`,
      providesTags: ["Price"],
      // Transform response for consistent format
      transformResponse: (response) =>
        response.map((price) => ({
          ...price,
          timestamp: Date.now(),
        })),
    }),

    // WebSocket subscription
    subscribeToPrices: builder.query({
      queryFn: () => ({ data: null }),
      async onCacheEntryAdded(symbols, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const ws = new WebSocket("wss://api.example.com/prices")

        try {
          await cacheDataLoaded

          ws.addEventListener("message", (event) => {
            const data = JSON.parse(event.data)

            updateCachedData((draft) => {
              const index = draft.findIndex((p) => p.symbol === data.symbol)
              if (index !== -1) {
                draft[index] = data
              } else {
                draft.push(data)
              }
            })
          })
        } catch {
          // Handle errors
        }

        await cacheEntryRemoved
        ws.close()
      },
    }),
  }),
})
```

### Handling Stale Data

Stale data is the enemy of real-time UIs. Here's how to detect and handle it:

```typescript
// Stale data detection hook
const useStaleDetection = (data, maxAge = 30000) => {
  const [isStale, setIsStale] = useState(false)

  useEffect(() => {
    if (!data?.timestamp) return

    const checkStale = () => {
      const age = Date.now() - data.timestamp
      setIsStale(age > maxAge)
    }

    checkStale()
    const interval = setInterval(checkStale, 1000)

    return () => clearInterval(interval)
  }, [data?.timestamp, maxAge])

  return isStale
}

// Usage in component
const PriceDisplay = ({ priceData }) => {
  const isStale = useStaleDetection(priceData, 10000) // 10 seconds

  return (
    <div className={isStale ? 'stale' : 'fresh'}>
      <Price value={priceData.price} />
      {isStale && <StaleIndicator />}
    </div>
  )
}
```

---

## UI Rendering Patterns

### 1. Optimistic Updates

Show the result immediately, then handle failures gracefully.

```typescript
// Optimistic update pattern
const useLikePost = (postId) => {
  const [optimisticLikes, setOptimisticLikes] = useState(0)
  const [isOptimistic, setIsOptimistic] = useState(false)

  const likePost = async () => {
    // Immediate UI update
    setOptimisticLikes((prev) => prev + 1)
    setIsOptimistic(true)

    try {
      const result = await api.likePost(postId)
      // Update with server response
      setOptimisticLikes(result.likes)
    } catch (error) {
      // Rollback on failure
      setOptimisticLikes((prev) => prev - 1)
      showError("Failed to like post")
    } finally {
      setIsOptimistic(false)
    }
  }

  return { optimisticLikes, isOptimistic, likePost }
}
```

### 2. Skeleton Loading

Provide visual structure while data loads.

```typescript
// Skeleton component system
const Skeleton = ({ width, height, className }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height }}
  />
)

const PriceSkeleton = () => (
  <div className="price-card">
    <Skeleton width="60px" height="20px" /> {/* Symbol */}
    <Skeleton width="80px" height="24px" /> {/* Price */}
    <Skeleton width="50px" height="16px" /> {/* Change */}
  </div>
)

// Usage with suspense-like pattern
const PriceCard = ({ symbol }) => {
  const { data, isLoading } = usePriceData(symbol)

  if (isLoading) return <PriceSkeleton />

  return (
    <div className="price-card">
      <Symbol>{symbol}</Symbol>
      <Price>{data.price}</Price>
      <Change positive={data.change > 0}>{data.change}</Change>
    </div>
  )
}
```

### 3. Partial Updates

Update only what changed to minimize re-renders.

```typescript
// Partial update with React.memo
const PriceRow = React.memo(({ symbol, price, change }) => {
  return (
    <tr>
      <td>{symbol}</td>
      <td>{price}</td>
      <td className={change > 0 ? 'positive' : 'negative'}>
        {change}
      </td>
    </tr>
  )
}, (prevProps, nextProps) => {
  // Only re-render if price or change actually changed
  return prevProps.price === nextProps.price &&
         prevProps.change === nextProps.change
})

// Efficient list updates
const PriceTable = ({ prices }) => {
  return (
    <table>
      <tbody>
        {prices.map(price => (
          <PriceRow
            key={price.symbol}
            symbol={price.symbol}
            price={price.price}
            change={price.change}
          />
        ))}
      </tbody>
    </table>
  )
}
```

### 4. Virtualisation

Handle large datasets efficiently by rendering only visible items.

```typescript
// Virtual list for large datasets
import { FixedSizeList as List } from 'react-window'

const VirtualizedTradeList = ({ trades }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TradeItem trade={trades[index]} />
    </div>
  )

  return (
    <List
      height={400}
      itemCount={trades.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### 5. Debouncing & Throttling

Control update frequency to prevent UI overload.

```typescript
// Throttling for high-frequency updates
const useThrottledValue = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return throttledValue
}

// Usage for price updates
const PriceDisplay = ({ realTimePrice }) => {
  const displayPrice = useThrottledValue(realTimePrice, 100) // Update max 10 times per second

  return <div>${displayPrice.toFixed(2)}</div>
}

// Debouncing for user input
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

---

## Error Handling & Resilience

### Retry Strategies

Different scenarios require different retry approaches.

```typescript
// Exponential backoff retry
const useRetry = (fn, maxAttempts = 3) => {
  const [attempts, setAttempts] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const retry = async (...args) => {
    setIsRetrying(true)

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await fn(...args)
        setAttempts(0)
        setIsRetrying(false)
        return result
      } catch (error) {
        setAttempts(attempt + 1)

        if (attempt === maxAttempts - 1) {
          setIsRetrying(false)
          throw error
        }

        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  return { retry, attempts, isRetrying }
}
```

### Backoff Patterns

```typescript
// Smart backoff with jitter
class BackoffManager {
  constructor(initialDelay = 1000, maxDelay = 30000, factor = 2) {
    this.initialDelay = initialDelay
    this.maxDelay = maxDelay
    this.factor = factor
    this.currentDelay = initialDelay
  }

  getNextDelay() {
    const delay = this.currentDelay
    this.currentDelay = Math.min(this.currentDelay * this.factor, this.maxDelay)

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay
    return delay + jitter
  }

  reset() {
    this.currentDelay = this.initialDelay
  }
}

// Usage in WebSocket reconnection
const useWebSocketWithBackoff = (url) => {
  const backoff = useRef(new BackoffManager())
  const [connectionState, setConnectionState] = useState("disconnected")

  const connect = useCallback(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      setConnectionState("connected")
      backoff.current.reset()
    }

    ws.onclose = () => {
      setConnectionState("disconnected")

      const delay = backoff.current.getNextDelay()
      setTimeout(connect, delay)
    }

    return ws
  }, [url])

  return { connect, connectionState }
}
```

### Offline-First Patterns

```typescript
// Offline-first data management
const useOfflineFirst = (key, fetcher) => {
  const [data, setData] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // Load from localStorage first
    const cached = localStorage.getItem(key)
    if (cached) {
      setData(JSON.parse(cached))
    }

    // Then fetch fresh data if online
    if (isOnline) {
      fetcher().then((freshData) => {
        setData(freshData)
        localStorage.setItem(key, JSON.stringify(freshData))
      })
    }
  }, [key, fetcher, isOnline])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return { data, isOnline }
}
```

### Graceful Degradation

```typescript
// Feature detection and fallbacks
const useRealTimeFeatures = () => {
  const [features, setFeatures] = useState({
    webSocket: false,
    serverSentEvents: false,
    webWorkers: false,
  })

  useEffect(() => {
    setFeatures({
      webSocket: "WebSocket" in window,
      serverSentEvents: "EventSource" in window,
      webWorkers: "Worker" in window,
    })
  }, [])

  return features
}

// Adaptive data fetching
const useAdaptiveDataFetching = (url) => {
  const features = useRealTimeFeatures()

  if (features.webSocket) {
    return useWebSocket(url)
  } else if (features.serverSentEvents) {
    return useServerSentEvents(url)
  } else {
    return usePolling(url, 5000) // Fallback to polling
  }
}
```

---

## Performance Techniques

### Batching Updates

Group multiple updates to reduce render cycles.

```typescript
// React 18 automatic batching
const BatchedUpdates = () => {
  const [count, setCount] = useState(0)
  const [flag, setFlag] = useState(false)

  const handleClick = () => {
    // These are automatically batched in React 18
    setCount(c => c + 1)
    setFlag(f => !f)
    // Only one re-render occurs
  }

  return <button onClick={handleClick}>Count: {count}</button>
}

// Manual batching for complex scenarios
const useBatchedUpdates = (delay = 16) => {
  const [updates, setUpdates] = useState([])
  const timeoutRef = useRef()

  const addUpdate = useCallback((update) => {
    setUpdates(prev => [...prev, update])

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setUpdates([])
    }, delay)
  }, [delay])

  return { updates, addUpdate }
}
```

### Memoisation Strategies

```typescript
// Expensive calculation memoization
const ExpensiveComponent = ({ data, filters }) => {
  const processedData = useMemo(() => {
    return data
      .filter(item => filters.includes(item.category))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100)
  }, [data, filters])

  return (
    <div>
      {processedData.map(item => (
        <DataItem key={item.id} item={item} />
      ))}
    </div>
  )
}

// Callback memoization
const ParentComponent = () => {
  const [filter, setFilter] = useState('')

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter)
  }, [])

  return (
    <div>
      <FilterInput onChange={handleFilterChange} />
      <DataList filter={filter} />
    </div>
  )
}
```

### Avoiding Unnecessary Re-renders

```typescript
// Component splitting for better performance
const OptimizedPriceCard = ({ symbol, price, volume, change }) => {
  return (
    <div className="price-card">
      <Symbol value={symbol} />
      <PriceDisplay price={price} change={change} />
      <VolumeDisplay volume={volume} />
    </div>
  )
}

// Separate components that update at different frequencies
const PriceDisplay = React.memo(({ price, change }) => (
  <div>
    <span className="price">{price}</span>
    <span className={`change ${change > 0 ? 'positive' : 'negative'}`}>
      {change}
    </span>
  </div>
))

const VolumeDisplay = React.memo(({ volume }) => (
  <span className="volume">{volume}</span>
))
```

### Web Workers for Heavy Processing

```typescript
// Web Worker for data processing
// worker.js
self.onmessage = function (e) {
  const { data, operation } = e.data

  let result
  switch (operation) {
    case "calculateTechnicalIndicators":
      result = calculateIndicators(data)
      break
    case "processLargeDataset":
      result = processData(data)
      break
    default:
      result = null
  }

  self.postMessage(result)
}

// React hook for Web Worker
const useWebWorker = (workerScript) => {
  const workerRef = useRef()
  const [result, setResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    workerRef.current = new Worker(workerScript)

    workerRef.current.onmessage = (e) => {
      setResult(e.data)
      setIsProcessing(false)
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [workerScript])

  const processData = useCallback((data, operation) => {
    setIsProcessing(true)
    workerRef.current.postMessage({ data, operation })
  }, [])

  return { result, isProcessing, processData }
}
```

---

## Putting It All Together

### A Real-World Architecture Example

Let's build a simplified version of our CryptoApp to demonstrate all these concepts working together.

```typescript
// 1. Data Layer - WebSocket connection with resilience
const useCryptoWebSocket = () => {
  const [connectionState, setConnectionState] = useState('disconnected')
  const [priceData, setPriceData] = useState({})
  const reconnectAttempts = useRef(0)
  const wsRef = useRef()

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket('wss://api-pub.bitfinex.com/ws/2')
    wsRef.current = ws

    ws.onopen = () => {
      setConnectionState('connected')
      reconnectAttempts.current = 0

      // Subscribe to Bitcoin price updates
      ws.send(JSON.stringify({
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tBTCUSD'
      }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (Array.isArray(data) && data.length > 1) {
        const [channelId, priceArray] = data
        if (Array.isArray(priceArray)) {
          const [bid, bidSize, ask, askSize, dailyChange, dailyChangePerc, lastPrice] = priceArray

          setPriceData(prev => ({
            ...prev,
            BTCUSD: {
              price: lastPrice,
              change: dailyChange,
              changePercent: dailyChangePerc,
              timestamp: Date.now()
            }
          }))
        }
      }
    }

    ws.onclose = () => {
      setConnectionState('disconnected')

      // Exponential backoff reconnection
      if (reconnectAttempts.current < 5) {
        const delay = Math.pow(2, reconnectAttempts.current) * 1000
        setTimeout(connect, delay)
        reconnectAttempts.current++
      }
    }

    ws.onerror = () => {
      setConnectionState('error')
    }
  }, [])

  useEffect(() => {
    connect()
    return () => wsRef.current?.close()
  }, [connect])

  return { connectionState, priceData, reconnect: connect }
}

// 2. State Management - Global state with local optimizations
const PriceContext = createContext()

const PriceProvider = ({ children }) => {
  const { connectionState, priceData, reconnect } = useCryptoWebSocket()

  // Throttle updates to prevent excessive re-renders
  const throttledPriceData = useThrottledValue(priceData, 100)

  const value = {
    prices: throttledPriceData,
    connectionState,
    reconnect
  }

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  )
}

// 3. UI Components - Optimized rendering patterns
const PriceCard = React.memo(({ symbol }) => {
  const { prices, connectionState } = useContext(PriceContext)
  const priceData = prices[symbol]
  const isStale = useStaleDetection(priceData, 10000)

  if (!priceData) {
    return <PriceSkeleton />
  }

  return (
    <Card className={isStale ? 'stale' : 'fresh'}>
      <Symbol>{symbol}</Symbol>
      <Price>${priceData.price?.toFixed(2)}</Price>
      <Change positive={priceData.change > 0}>
        {priceData.change > 0 ? '+' : ''}{priceData.change?.toFixed(2)}
        ({priceData.changePercent?.toFixed(2)}%)
      </Change>
      <ConnectionIndicator status={connectionState} />
      {isStale && <StaleWarning />}
    </Card>
  )
})

// 4. Error Boundaries - Graceful error handling
class PriceErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Price component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorCard>
          <ErrorMessage>Unable to load price data</ErrorMessage>
          <RetryButton onClick={() => this.setState({ hasError: false })}>
            Try Again
          </RetryButton>
        </ErrorCard>
      )
    }

    return this.props.children
  }
}

// 5. Main Application - Putting it all together
const CryptoApp = () => {
  return (
    <PriceProvider>
      <AppContainer>
        <Header>
          <Title>Real-Time Crypto Prices</Title>
          <ConnectionStatus />
        </Header>

        <PriceGrid>
          <PriceErrorBoundary>
            <PriceCard symbol="BTCUSD" />
          </PriceErrorBoundary>
        </PriceGrid>
      </AppContainer>
    </PriceProvider>
  )
}
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Real-Time UI Architecture                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   UI Layer  │    │ State Layer │    │ Data Layer  │     │
│  │             │    │             │    │             │     │
│  │ • Components│◄──►│ • Context   │◄──►│ • WebSocket │     │
│  │ • Memoization│    │ • Throttling│    │ • Retry     │     │
│  │ • Error Bounds│   │ • Batching  │    │ • Backoff   │     │
│  │ • Skeletons │    │ • Caching   │    │ • Heartbeat │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Performance Layer                     │   │
│  │ • Virtualization • Web Workers • Debouncing        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Implementation Highlights

1. **Resilient Connection**: Automatic reconnection with exponential backoff
2. **Performance Optimized**: Throttled updates and memoized components
3. **Error Resilient**: Error boundaries and graceful degradation
4. **User Feedback**: Loading states, connection status, and stale indicators
5. **Scalable Architecture**: Separation of concerns and modular design

---

## Conclusion

Building real-time UIs is both an art and a science. It requires understanding user psychology, mastering technical patterns, and balancing performance with functionality.

### Key Takeaways

1. **Latency Matters**: Every millisecond counts in user perception
2. **Resilience is Critical**: Networks fail, plan for it
3. **Performance is a Feature**: Smooth UIs build user trust
4. **Feedback is Essential**: Users need to understand what's happening
5. **Start Simple**: Begin with polling, evolve to WebSockets when needed

### The Real-Time Future

Real-time UIs are becoming the standard, not the exception. Users expect instant feedback, live collaboration, and seamless experiences. The patterns and techniques in this guide will help you build applications that meet these expectations.

### Ready to Level Up Your Real-Time Skills?

If you found this guide valuable, I'd love to help you take your real-time development skills to the next level.

**🎓 Join My Complete Real-Time Development Course**

- 40+ hours of hands-on video content
- Build 5 production-ready real-time applications
- Master WebSockets, GraphQL subscriptions, and more
- Get access to exclusive Discord community
- Lifetime updates and new content

[**Enroll Now - Early Bird 50% Off**](https://your-course-link.com)

**🤝 Connect With Me**

- Follow me on [LinkedIn](https://linkedin.com/in/yourprofile) for daily real-time development tips
- Star the [GitHub repository](https://github.com/yourusername/realtime-ui-guide) for the complete code examples
- Subscribe to my newsletter for weekly real-time development insights

**🎁 Free Bonus Resources**

- Download the complete CryptoApp source code
- Get my Real-Time UI Component Library (React + TypeScript)
- Access my WebSocket debugging toolkit

[**Claim Your Free Resources**](https://your-resources-link.com)

---

_Built with ❤️ for developers who want to create amazing real-time experiences_

**Ready to build the future of user interfaces? Let's make it happen together.**
