# 🟦 Market Orders vs Limit Orders — Real-Time UI State Mutations

_How order types fundamentally change your trading system's architecture_

Most explanations stop at "market = instant, limit = conditional." But if you're building real-time trading UIs, the critical difference is **how each order type mutates application state over time**.

## 🔵 Market Order: Atomic State Mutation

```typescript
// Market order lifecycle - single atomic operation
interface MarketOrderExecution {
  type: "MARKET_FILL"
  orderId: string
  symbol: string
  quantity: number
  price: number // Actual fill price (unknown until execution)
  timestamp: number
  side: "BUY" | "SELL"
}

// UI State Changes (all happen within ~100ms)
const handleMarketOrderFill = (execution: MarketOrderExecution) => {
  // 1. Order book liquidity consumed
  dispatch(
    removeBookLiquidity({
      symbol: execution.symbol,
      side: execution.side,
      quantity: execution.quantity,
    })
  )

  // 2. Trade prints on tape
  dispatch(
    addTrade({
      price: execution.price,
      quantity: execution.quantity,
      timestamp: execution.timestamp,
    })
  )

  // 3. Position updated
  dispatch(
    updatePosition({
      symbol: execution.symbol,
      quantity: execution.side === "BUY" ? execution.quantity : -execution.quantity,
    })
  )

  // 4. Order disappears (no persistent state)
  // No ongoing tracking needed
}
```

**Market Order Characteristics:**

- **Lifecycle**: Create → Execute → Destroy (< 1 second)
- **State Pattern**: Fire-and-forget event
- **UI Updates**: Burst of synchronized mutations
- **Tracking**: None required after execution

## 🔵 Limit Order: Persistent Reactive Entity

```typescript
// Limit order - long-lived state machine
interface LimitOrder {
  orderId: string
  symbol: string
  side: "BUY" | "SELL"
  originalQuantity: number
  remainingQuantity: number
  limitPrice: number
  status: "PENDING" | "PARTIAL" | "FILLED" | "CANCELLED"
  fills: OrderFill[]
  createdAt: number
  lastUpdated: number
}

// State machine with multiple possible transitions
const limitOrderReducer = (state: LimitOrder, action: OrderAction) => {
  switch (action.type) {
    case "PARTIAL_FILL":
      return {
        ...state,
        remainingQuantity: state.remainingQuantity - action.fillQuantity,
        status: state.remainingQuantity === action.fillQuantity ? "FILLED" : "PARTIAL",
        fills: [...state.fills, action.fill],
        lastUpdated: Date.now(),
      }

    case "PRICE_BECAME_MARKETABLE":
      // Order price now crosses spread - likely to fill soon
      return { ...state, isMarketable: true }

    case "BOOK_LEVEL_UPDATED":
      // Recalculate queue position
      return { ...state, queuePosition: calculateQueuePosition(state, action.bookUpdate) }

    case "CANCEL_REQUESTED":
      return { ...state, status: "CANCELLED" }
  }
}
```

**Limit Order Characteristics:**

- **Lifecycle**: Create → Monitor → React → (Eventually) Destroy
- **State Pattern**: Long-lived reactive entity
- **UI Updates**: Continuous state synchronization
- **Tracking**: Persistent subscription required

## 🟦 Real-Time UI Architecture Implications

### Market Orders: Event-Driven Updates

```typescript
// Simple event handler - no state persistence
const MarketOrderHandler = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubscribe = wsConnection.subscribe("executions", (execution) => {
      if (execution.orderType === "MARKET") {
        // Apply all state changes atomically
        dispatch(processMarketExecution(execution))
        // No further tracking needed
      }
    })

    return unsubscribe
  }, [])
}
```

### Limit Orders: Stateful Component Subscriptions

```typescript
// Complex state management with multiple subscriptions
const LimitOrderTracker = ({ orderId }: { orderId: string }) => {
  const order = useAppSelector(state => selectLimitOrder(state, orderId))
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Subscribe to order-specific updates
    const orderSub = wsConnection.subscribe(`order.${orderId}`, (update) => {
      dispatch(updateLimitOrder({ orderId, update }))
    })

    // Subscribe to book updates that affect this order
    const bookSub = wsConnection.subscribe(`book.${order.symbol}`, (bookUpdate) => {
      dispatch(recalculateOrderPosition({ orderId, bookUpdate }))
    })

    // Subscribe to trade tape for fill detection
    const tradeSub = wsConnection.subscribe(`trades.${order.symbol}`, (trade) => {
      if (trade.price === order.limitPrice) {
        dispatch(checkPotentialFill({ orderId, trade }))
      }
    })

    return () => {
      orderSub.unsubscribe()
      bookSub.unsubscribe()
      tradeSub.unsubscribe()
    }
  }, [orderId, order.symbol])

  return (
    <OrderRow
      order={order}
      isMarketable={order.limitPrice >= bestAsk} // Real-time calculation
      queuePosition={order.queuePosition}
      estimatedFillTime={calculateFillTime(order)}
    />
  )
}
```

## 🟦 State Management Patterns

### Market Orders: Stateless Processing

```typescript
// No persistent order state - just process and forget
const marketOrderSlice = createSlice({
  name: "marketOrders",
  initialState: {
    recentExecutions: [] as MarketOrderExecution[], // For UI feedback only
  },
  reducers: {
    processExecution: (state, action) => {
      // Add to recent executions for UI feedback
      state.recentExecutions.unshift(action.payload)
      // Keep only last 10 for performance
      state.recentExecutions = state.recentExecutions.slice(0, 10)

      // All other state changes happen in other slices:
      // - Book slice removes liquidity
      // - Trades slice adds new trade
      // - Position slice updates holdings
      // - PnL slice recalculates
    },
  },
})
```

### Limit Orders: Stateful Entity Management

```typescript
// Complex state with lifecycle management
const limitOrdersSlice = createSlice({
  name: "limitOrders",
  initialState: {
    orders: {} as Record<string, LimitOrder>,
    ordersBySymbol: {} as Record<string, string[]>,
    pendingCancellations: new Set<string>(),
  },
  reducers: {
    createOrder: (state, action) => {
      const order = action.payload
      state.orders[order.orderId] = order

      if (!state.ordersBySymbol[order.symbol]) {
        state.ordersBySymbol[order.symbol] = []
      }
      state.ordersBySymbol[order.symbol].push(order.orderId)
    },

    updateOrder: (state, action) => {
      const { orderId, update } = action.payload
      if (state.orders[orderId]) {
        state.orders[orderId] = { ...state.orders[orderId], ...update }
      }
    },

    removeOrder: (state, action) => {
      const { orderId } = action.payload
      const order = state.orders[orderId]

      if (order) {
        delete state.orders[orderId]
        state.ordersBySymbol[order.symbol] = state.ordersBySymbol[order.symbol].filter(
          (id) => id !== orderId
        )
      }
    },
  },
})
```

## 🟦 Performance Implications

### Market Orders: Minimal Overhead

- **Memory**: No persistent state after execution
- **CPU**: Single burst of updates
- **Network**: One-time WebSocket messages
- **Rendering**: Atomic UI refresh

### Limit Orders: Continuous Overhead

- **Memory**: Persistent order objects + subscription state
- **CPU**: Continuous state reconciliation
- **Network**: Multiple WebSocket subscriptions per order
- **Rendering**: Reactive updates on every book/trade change

## 🟦 Error Handling Patterns

### Market Orders: Simple Error Recovery

```typescript
const handleMarketOrderError = (error: OrderError) => {
  // Simple: show error, no cleanup needed
  dispatch(
    showNotification({
      type: "error",
      message: `Market order failed: ${error.message}`,
    })
  )
  // No persistent state to clean up
}
```

### Limit Orders: Complex State Reconciliation

```typescript
const handleLimitOrderError = (orderId: string, error: OrderError) => {
  const order = getState().limitOrders.orders[orderId]

  switch (error.type) {
    case "INSUFFICIENT_BALANCE":
      // Mark order as rejected but keep for user reference
      dispatch(updateOrder({ orderId, status: "REJECTED", error }))
      break

    case "PRICE_OUT_OF_RANGE":
      // Allow user to modify and resubmit
      dispatch(updateOrder({ orderId, status: "PENDING_MODIFICATION" }))
      break

    case "CONNECTION_LOST":
      // Mark as unknown state - need reconciliation
      dispatch(updateOrder({ orderId, status: "UNKNOWN" }))
      // Trigger state reconciliation on reconnect
      dispatch(scheduleOrderReconciliation(orderId))
      break
  }
}
```

## 🟦 Key Takeaways for Trading UI Engineers

1. **Market Orders** = Stateless event processing
   - Design for atomic operations
   - Optimize for burst performance
   - Minimal error handling needed

2. **Limit Orders** = Stateful entity management
   - Design for long-lived subscriptions
   - Optimize for continuous updates
   - Complex error recovery required

3. **Architecture Decision**: Choose your state management pattern based on order lifecycle, not just order type

4. **Performance**: Market orders scale with execution frequency; limit orders scale with active order count

The fundamental difference isn't just execution speed—it's whether you're building an **event processor** or an **entity manager**.

Get this architectural distinction right, and your trading UI will handle both order types efficiently at scale.
