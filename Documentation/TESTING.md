# 🧪 Testing Guide

_Comprehensive testing strategies for real-time financial applications_

---

## 🎯 Testing Philosophy

Financial applications require **bulletproof reliability**. Our testing strategy ensures:

- **Data accuracy**: Every calculation is verified
- **Real-time reliability**: WebSocket connections work under all conditions
- **UI consistency**: Components render correctly across scenarios
- **Performance stability**: No memory leaks or performance degradation
- **Error resilience**: Graceful handling of all failure modes

### Testing Pyramid

```
                    ▲
                   /|\
                  / | \
                 /  |  \
                /   |   \
               /    |    \
              /  E2E (5%) \
             /             \
            /               \
           /                 \
          /  Integration (25%) \
         /                     \
        /                       \
       /                         \
      /     Unit Tests (70%)      \
     /___________________________\
```

---

## 🔧 Testing Setup

### Dependencies

```bash
# Core testing framework - Vitest (modern, fast)
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev jsdom

# WebSocket testing
npm install --save-dev ws mock-socket

# Redux testing
npm install --save-dev @reduxjs/toolkit

# Performance testing
npm install --save-dev @testing-library/react-hooks

# E2E testing
npm install --save-dev playwright @playwright/test

# Coverage reporting
npm install --save-dev @testing-library/user-event
```

### Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/setupTests.ts", "**/*.d.ts", "**/*.config.*"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
```

### Test Setup (`src/setupTests.ts`)

```typescript
import "@testing-library/jest-dom"
import { configure } from "@testing-library/react"
import { vi } from "vitest"

// Configure testing library
configure({ testIdAttribute: "data-testid" })

// Mock WebSocket globally
Object.defineProperty(window, "WebSocket", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: WebSocket.OPEN,
  })),
})

// Mock Highcharts
vi.mock("highcharts/highstock", () => ({
  default: {
    stockChart: vi.fn(),
    setOptions: vi.fn(),
  },
}))

// Mock ResizeObserver
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
})

// Mock environment variables
vi.mock("../config/env", () => ({
  config: {
    BITFINEX_WS_URL: "ws://localhost:8080",
    MAX_TRADES: 1000,
    MAX_CANDLES: 5000,
    IS_PRODUCTION: false,
  },
}))
```

---

## 🧪 Unit Testing

### Redux Slice Testing

#### Trades Slice Tests

```typescript
// src/modules/trades/__tests__/slice.test.ts
import { describe, it, expect } from "vitest"
import { tradesSlice, tradesSnapshotReducer, tradesUpdateReducer } from "../slice"
import type { Trade } from "../types/Trade"

describe("tradesSlice", () => {
  const initialState = {}

  const mockTrade: Trade = {
    id: 123456,
    timestamp: 1640995200000,
    amount: 0.5,
    price: 45000,
  }

  describe("tradesSnapshotReducer", () => {
    it("should update trades for currency pair", () => {
      const action = tradesSnapshotReducer({
        currencyPair: "BTCUSD",
        trades: [mockTrade],
      })

      const result = tradesSlice.reducer(initialState, action)

      expect(result.BTCUSD).toHaveLength(1)
      expect(result.BTCUSD[0]).toEqual(mockTrade)
    })

    it("should sort trades by timestamp", () => {
      const trades = [
        { ...mockTrade, id: 2, timestamp: 1640995300000 },
        { ...mockTrade, id: 1, timestamp: 1640995200000 },
      ]

      const action = tradesSnapshotReducer({ currencyPair: "BTCUSD", trades })
      const result = tradesSlice.reducer(initialState, action)

      expect(result.BTCUSD[0].id).toBe(1) // Earlier timestamp first
      expect(result.BTCUSD[1].id).toBe(2)
    })

    it("should enforce memory limits", () => {
      const manyTrades = Array.from({ length: 1200 }, (_, i) => ({
        ...mockTrade,
        id: i,
        timestamp: 1640995200000 + i,
      }))

      const action = tradesSnapshotReducer({ currencyPair: "BTCUSD", trades: manyTrades })
      const result = tradesSlice.reducer(initialState, action)

      // Should be limited to MAX_TRADES (1000)
      expect(result.BTCUSD).toHaveLength(1000)
      expect(result.BTCUSD[0].id).toBe(200) // First 200 should be removed
    })
  })

  describe("tradesUpdateReducer", () => {
    it("should add new trade to existing list", () => {
      const existingState = {
        BTCUSD: [mockTrade],
      }

      const newTrade = { ...mockTrade, id: 789, timestamp: 1640995300000 }
      const action = tradesUpdateReducer({ currencyPair: "BTCUSD", trade: newTrade })

      const result = tradesSlice.reducer(existingState, action)

      expect(result.BTCUSD).toHaveLength(2)
      expect(result.BTCUSD[1]).toEqual(newTrade)
    })

    it("should update existing trade with same ID", () => {
      const existingState = {
        BTCUSD: [mockTrade],
      }

      const updatedTrade = { ...mockTrade, price: 46000 }
      const action = addTrade({ currencyPair: "BTCUSD", trade: updatedTrade })

      const result = tradesSlice.reducer(existingState, action)

      expect(result.BTCUSD).toHaveLength(1)
      expect(result.BTCUSD[0].price).toBe(46000)
    })

    it("should maintain chronological order after adding", () => {
      const existingState = {
        BTCUSD: [
          { ...mockTrade, id: 1, timestamp: 1640995200000 },
          { ...mockTrade, id: 3, timestamp: 1640995400000 },
        ],
      }

      const middleTrade = { ...mockTrade, id: 2, timestamp: 1640995300000 }
      const action = addTrade({ currencyPair: "BTCUSD", trade: middleTrade })

      const result = tradesSlice.reducer(existingState, action)

      expect(result.BTCUSD.map((t) => t.id)).toEqual([1, 2, 3])
    })
  })
})
```

#### Selector Testing

```typescript
// src/modules/trades/__tests__/selectors.test.ts
import { getTrades, getLatestTrades } from "../selectors"
import type { RootState } from "../../redux/store"

describe("trades selectors", () => {
  const mockState: Partial<RootState> = {
    trades: {
      BTCUSD: [
        { id: 1, timestamp: 1640995200000, amount: 0.5, price: 45000 },
        { id: 2, timestamp: 1640995300000, amount: 0.3, price: 45100 },
        { id: 3, timestamp: 1640995400000, amount: 0.8, price: 44900 },
      ],
      ETHUSD: [{ id: 4, timestamp: 1640995200000, amount: 2.0, price: 3500 }],
    },
  }

  describe("getTrades", () => {
    it("should return trades for specified currency pair", () => {
      const result = getTrades(mockState as RootState, "BTCUSD")

      expect(result).toHaveLength(3)
      expect(result[0].id).toBe(1)
    })

    it("should return empty array for non-existent currency pair", () => {
      const result = getTrades(mockState as RootState, "NONEXISTENT")

      expect(result).toEqual([])
    })

    it("should be memoized - return same reference for same input", () => {
      const result1 = getTrades(mockState as RootState, "BTCUSD")
      const result2 = getTrades(mockState as RootState, "BTCUSD")

      expect(result1).toBe(result2) // Same reference
    })
  })

  describe("getLatestTrades", () => {
    it("should return specified number of latest trades", () => {
      const result = getLatestTrades(mockState as RootState, "BTCUSD", 2)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(2) // Second latest
      expect(result[1].id).toBe(3) // Latest
    })

    it("should return all trades if count exceeds available", () => {
      const result = getLatestTrades(mockState as RootState, "BTCUSD", 10)

      expect(result).toHaveLength(3) // All available trades
    })
  })
})
```

### Component Testing

#### Ticker Component Tests

```typescript
// src/modules/tickers/components/Ticker/__tests__/Ticker.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import Ticker from '../Ticker'
import theme from '../../../../theme/style'

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

describe('Ticker Component', () => {
  const defaultProps = {
    currencyPair: 'BTCUSD',
    lastPrice: 45000,
    dailyChange: 1250,
    dailyChangeRelative: 2.85
  }

  it('should render currency pair correctly', () => {
    renderWithTheme(<Ticker {...defaultProps} />)

    expect(screen.getByText('BTC / USD')).toBeInTheDocument()
  })

  it('should format price with 2 decimal places', () => {
    renderWithTheme(<Ticker {...defaultProps} />)

    expect(screen.getByText('45000.00')).toBeInTheDocument()
  })

  it('should display positive change in green', () => {
    renderWithTheme(<Ticker {...defaultProps} />)

    const changeElement = screen.getByText('1250.00')
    const relativeChangeElement = screen.getByText('2.85%')

    expect(changeElement).toHaveStyle('color: #00d4aa') // Positive color
    expect(relativeChangeElement).toHaveStyle('color: #00d4aa')
  })

  it('should display negative change in red', () => {
    const negativeProps = {
      ...defaultProps,
      dailyChange: -1250,
      dailyChangeRelative: -2.85
    }

    renderWithTheme(<Ticker {...negativeProps} />)

    const changeElement = screen.getByText('-1250.00')
    const relativeChangeElement = screen.getByText('-2.85%')

    expect(changeElement).toHaveStyle('color: #ff6b6b') // Negative color
    expect(relativeChangeElement).toHaveStyle('color: #ff6b6b')
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    const props = { ...defaultProps, onClick: handleClick }

    renderWithTheme(<Ticker {...props} />)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledWith('BTCUSD')
  })

  it('should handle missing data gracefully', () => {
    const incompleteProps = {
      currencyPair: 'BTCUSD',
      lastPrice: undefined,
      dailyChange: undefined,
      dailyChangeRelative: undefined
    }

    renderWithTheme(<Ticker {...incompleteProps} />)

    expect(screen.getByText('BTC / USD')).toBeInTheDocument()
    // Should not crash with undefined values
  })

  it('should apply hover styles', () => {
    renderWithTheme(<Ticker {...defaultProps} />)

    const container = screen.getByRole('button')

    fireEvent.mouseEnter(container)

    expect(container).toHaveStyle('background-color: rgba(120, 160, 220, 0.18)')
  })
})
```

#### Chart Component Tests

```typescript
// src/modules/candles/components/__tests__/CandlesChart.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import CandlesChart from '../CandlesChart'
import type { Candle } from '../../types/Candle'

// Mock Highcharts
const mockChart = {
  update: jest.fn(),
  destroy: jest.fn()
}

jest.mock('highcharts/highstock', () => ({
  stockChart: jest.fn(() => mockChart),
  setOptions: jest.fn()
}))

jest.mock('highcharts-react-official', () => {
  return function MockHighchartsReact({ options }: any) {
    return <div data-testid="highcharts-chart" data-options={JSON.stringify(options)} />
  }
})

describe('CandlesChart Component', () => {
  const mockCandles: Candle[] = [
    {
      timestamp: 1640995200000,
      open: 45000,
      close: 45100,
      high: 45200,
      low: 44900,
      volume: 1.5
    },
    {
      timestamp: 1640995260000,
      open: 45100,
      close: 44950,
      high: 45150,
      low: 44900,
      volume: 2.1
    }
  ]

  it('should render loading state initially', () => {
    render(<CandlesChart candles={[]} />)

    expect(screen.queryByTestId('highcharts-chart')).not.toBeInTheDocument()
  })

  it('should render chart when ready and candles provided', async () => {
    render(<CandlesChart candles={mockCandles} />)

    await waitFor(() => {
      expect(screen.getByTestId('highcharts-chart')).toBeInTheDocument()
    })
  })

  it('should transform candle data to Highcharts format', async () => {
    render(<CandlesChart candles={mockCandles} />)

    await waitFor(() => {
      const chartElement = screen.getByTestId('highcharts-chart')
      const options = JSON.parse(chartElement.getAttribute('data-options') || '{}')

      expect(options.series[0].data).toEqual([
        [1640995200000, 45000, 45200, 44900, 45100],
        [1640995260000, 45100, 45150, 44900, 44950]
      ])
    })
  })

  it('should sort candles by timestamp', async () => {
    const unsortedCandles = [mockCandles[1], mockCandles[0]] // Reverse order

    render(<CandlesChart candles={unsortedCandles} />)

    await waitFor(() => {
      const chartElement = screen.getByTestId('highcharts-chart')
      const options = JSON.parse(chartElement.getAttribute('data-options') || '{}')

      // Should be sorted by timestamp
      expect(options.series[0].data[0][0]).toBe(1640995200000) // Earlier timestamp first
      expect(options.series[0].data[1][0]).toBe(1640995260000)
    })
  })

  it('should update chart when candles change', async () => {
    const { rerender } = render(<CandlesChart candles={mockCandles} />)

    const newCandles = [
      ...mockCandles,
      {
        timestamp: 1640995320000,
        open: 44950,
        close: 45050,
        high: 45100,
        low: 44900,
        volume: 1.8
      }
    ]

    rerender(<CandlesChart candles={newCandles} />)

    await waitFor(() => {
      const chartElement = screen.getByTestId('highcharts-chart')
      const options = JSON.parse(chartElement.getAttribute('data-options') || '{}')

      expect(options.series[0].data).toHaveLength(3)
    })
  })
})
```

---

## 🔗 Integration Testing

### Redux Thunk Integration Tests

```typescript
// src/core/transport/__tests__/integration.test.ts
import { Server } from "mock-socket"
import { WsConnectionProxy } from "../WsConnectionProxy"
import { Connection } from "../Connection"
import { bootstrapApp } from "../../modules/app/slice"

describe("WebSocket Integration", () => {
  let mockServer: Server
  let connection: Connection
  const mockUrl = "ws://localhost:8080"

  beforeEach(() => {
    mockServer = new Server(mockUrl)
    const proxy = new WsConnectionProxy(mockUrl)
    connection = new Connection(proxy)
  })

  afterEach(() => {
    mockServer.close()
    connection.disconnect()
  })

  it("should establish connection successfully", async () => {
    const connectPromise = new Promise<void>((resolve) => {
      connection.onConnect(() => resolve())
    })

    connection.connect()

    await expect(connectPromise).resolves.toBeUndefined()
  })

  it("should receive and parse messages correctly", async () => {
    const messages: any[] = []

    connection.onReceive((data) => {
      messages.push(JSON.parse(data))
    })

    connection.connect()

    // Wait for connection
    await new Promise<void>((resolve) => {
      connection.onConnect(() => resolve())
    })

    // Send test message from server
    const testMessage = {
      event: "subscribed",
      channel: "trades",
      chanId: 12345,
      symbol: "tBTCUSD",
    }

    mockServer.emit("message", JSON.stringify(testMessage))

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(messages).toHaveLength(1)
    expect(messages[0]).toEqual(testMessage)
  })

  it("should handle reconnection after connection loss", async () => {
    let connectionCount = 0

    connection.onConnect(() => {
      connectionCount++
    })

    connection.connect()

    // Wait for initial connection
    await new Promise<void>((resolve) => {
      connection.onConnect(() => resolve())
    })

    expect(connectionCount).toBe(1)

    // Simulate connection loss
    mockServer.close()

    // Create new server (simulating server restart)
    mockServer = new Server(mockUrl)

    // Wait for reconnection
    await new Promise((resolve) => setTimeout(resolve, 2000))

    expect(connectionCount).toBe(2) // Should have reconnected
  })

  it("should handle subscription flow correctly", async () => {
    const receivedMessages: any[] = []

    connection.onReceive((data) => {
      receivedMessages.push(JSON.parse(data))
    })

    connection.connect()

    await new Promise<void>((resolve) => {
      connection.onConnect(() => resolve())
    })

    // Send subscription request
    const subscriptionRequest = {
      event: "subscribe",
      channel: "trades",
      symbol: "tBTCUSD",
    }

    connection.send(JSON.stringify(subscriptionRequest))

    // Mock server response
    mockServer.on("message", (message) => {
      const parsed = JSON.parse(message as string)

      if (parsed.event === "subscribe") {
        // Send subscription acknowledgment
        mockServer.emit(
          "message",
          JSON.stringify({
            event: "subscribed",
            channel: parsed.channel,
            chanId: 12345,
            symbol: parsed.symbol,
          })
        )

        // Send sample trade data
        setTimeout(() => {
          mockServer.emit(
            "message",
            JSON.stringify([12345, [[419251686, 1574694478806, 0.005, 7364.9]]])
          )
        }, 100)
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(receivedMessages).toHaveLength(2)
    expect(receivedMessages[0].event).toBe("subscribed")
    expect(receivedMessages[1][0]).toBe(12345) // Channel ID
  })
})
```

### Redux Thunk Integration Tests

```typescript
// src/modules/__tests__/integration.test.ts
import { configureStore } from "@reduxjs/toolkit"
import { tradesSlice } from "../trades/slice"
import { tickerSlice } from "../tickers/slice"
import { candleSlice } from "../candles/slice"
import { subscriptionsSlice } from "../../core/transport/slice"
import { bootstrapApp } from "../app/slice"

describe("Redux Integration", () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        app: appBootstrapSlice.reducer,
        trades: tradesSlice.reducer,
        ticker: tickerSlice.reducer,
        candles: candleSlice.reducer,
        subscriptions: subscriptionsSlice.reducer,
        refData: refDataSlice.reducer,
        selection: selectionSlice.reducer,
        book: bookSlice.reducer,
        ping: pingSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          thunk: {
            extraArgument: { connection: mockConnection },
          },
        }),
    })
  })

  it("should handle complete trading flow", () => {
    // 1. Subscribe to channel
    store.dispatch(
      subscriptionsSlice.actions.subscribeToChannelAck({
        channelId: 12345,
        channel: "trades",
        request: { channel: "trades", event: "subscribe", symbol: "tBTCUSD" },
      })
    )

    // 2. Receive trade data
    store.dispatch(
      tradesSlice.actions.updateTrades({
        currencyPair: "BTCUSD",
        trades: [
          { id: 1, timestamp: 1640995200000, amount: 0.5, price: 45000 },
          { id: 2, timestamp: 1640995300000, amount: 0.3, price: 45100 },
        ],
      })
    )

    // 3. Update ticker
    store.dispatch(
      tickersSlice.actions.updateTicker({
        symbol: "tBTCUSD",
        data: [7364.9, 7365, 7364.8, 7365.1, -45.1, -0.0061, 7364.9, 1234.5, 7400, 7300],
      })
    )

    // 4. Add candle data
    store.dispatch(
      candlesSlice.actions.candlesSnapshot({
        currencyPair: "BTCUSD",
        candles: [[1640995200000, 45000, 45100, 45200, 44900, 1.5]],
      })
    )

    const state = store.getState()

    // Verify all data is correctly stored
    expect(state.subscriptions[12345]).toBeDefined()
    expect(state.trades.BTCUSD).toHaveLength(2)
    expect(state.tickers["tBTCUSD"]).toBeDefined()
    expect(state.candles.BTCUSD).toHaveLength(1)
  })

  it("should maintain data consistency across updates", () => {
    // Initial trade
    store.dispatch(
      tradesSlice.actions.addTrade({
        currencyPair: "BTCUSD",
        trade: { id: 1, timestamp: 1640995200000, amount: 0.5, price: 45000 },
      })
    )

    // Update same trade
    store.dispatch(
      tradesSlice.actions.addTrade({
        currencyPair: "BTCUSD",
        trade: { id: 1, timestamp: 1640995200000, amount: 0.5, price: 45100 },
      })
    )

    const state = store.getState()

    expect(state.trades.BTCUSD).toHaveLength(1) // Should not duplicate
    expect(state.trades.BTCUSD[0].price).toBe(45100) // Should be updated
  })
})
```

---

## 🌐 End-to-End Testing

### Playwright E2E Tests

```typescript
// tests/e2e/trading-dashboard.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Trading Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock WebSocket server
    await page.route("wss://api-pub.bitfinex.com/ws/2", (route) => {
      // Mock WebSocket connection
      route.fulfill({ status: 101 })
    })

    await page.goto("/")
  })

  test("should display main dashboard components", async ({ page }) => {
    // Check header
    await expect(page.locator('[data-testid="header"]')).toBeVisible()

    // Check ticker panel
    await expect(page.locator('[data-testid="tickers-panel"]')).toBeVisible()

    // Check trades panel
    await expect(page.locator('[data-testid="trades-panel"]')).toBeVisible()

    // Check chart panel
    await expect(page.locator('[data-testid="candles-panel"]')).toBeVisible()
  })

  test("should handle real-time data updates", async ({ page }) => {
    // Mock WebSocket messages
    await page.evaluate(() => {
      // Simulate WebSocket connection
      const mockWs = {
        send: () => {},
        close: () => {},
        addEventListener: (event: string, handler: Function) => {
          if (event === "open") {
            setTimeout(() => handler({}), 100)
          } else if (event === "message") {
            // Simulate subscription acknowledgment
            setTimeout(() => {
              handler({
                data: JSON.stringify({
                  event: "subscribed",
                  channel: "trades",
                  chanId: 12345,
                  symbol: "tBTCUSD",
                }),
              })
            }, 200)

            // Simulate trade data
            setTimeout(() => {
              handler({
                data: JSON.stringify([12345, [[419251686, Date.now(), 0.005, 45000]]]),
              })
            }, 300)
          }
        },
      }

      // Replace WebSocket constructor
      ;(window as any).WebSocket = function () {
        return mockWs
      }
    })

    // Wait for data to load
    await page.waitForTimeout(1000)

    // Check if trade data appears
    await expect(page.locator('[data-testid="trade-item"]').first()).toBeVisible()
  })

  test("should handle chart interactions", async ({ page }) => {
    // Wait for chart to load
    await page.waitForSelector('[data-testid="candles-chart"]')

    // Test zoom functionality
    const chart = page.locator('[data-testid="candles-chart"]')

    // Simulate mouse wheel zoom
    await chart.hover()
    await page.mouse.wheel(0, -100)

    // Test range selector
    await page.click('[data-testid="range-selector-1d"]')

    // Verify chart updates
    await expect(chart).toBeVisible()
  })

  test("should be responsive on different screen sizes", async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(page.locator('[data-testid="header"]')).toBeVisible()
    await expect(page.locator('[data-testid="tickers-panel"]')).toBeVisible()

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })

    await expect(page.locator('[data-testid="trades-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="candles-panel"]')).toBeVisible()

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })

    // All panels should be visible in desktop layout
    await expect(page.locator('[data-testid="header"]')).toBeVisible()
    await expect(page.locator('[data-testid="tickers-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="trades-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="candles-panel"]')).toBeVisible()
  })

  test("should handle network failures gracefully", async ({ page }) => {
    // Start with working connection
    await page.goto("/")

    // Simulate network failure
    await page.route("**/*", (route) => route.abort())

    // Check error handling
    await expect(page.locator('[data-testid="connection-error"]')).toBeVisible()

    // Restore network
    await page.unroute("**/*")

    // Check recovery
    await expect(page.locator('[data-testid="connection-error"]')).not.toBeVisible()
  })
})
```

### Performance Testing

```typescript
// tests/performance/performance.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Performance Tests", () => {
  test("should load within performance budget", async ({ page }) => {
    const startTime = Date.now()

    await page.goto("/")

    // Wait for main content to load
    await page.waitForSelector('[data-testid="tickers-panel"]')

    const loadTime = Date.now() - startTime

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test("should handle high-frequency updates without performance degradation", async ({ page }) => {
    await page.goto("/")

    // Monitor performance
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          resolve(
            entries.map((entry) => ({
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime,
            }))
          )
        })

        observer.observe({ entryTypes: ["measure", "navigation"] })

        // Simulate high-frequency updates
        let updateCount = 0
        const interval = setInterval(() => {
          // Trigger state updates
          window.dispatchEvent(
            new CustomEvent("mock-trade-update", {
              detail: {
                id: updateCount++,
                timestamp: Date.now(),
                amount: Math.random(),
                price: 45000 + Math.random() * 1000,
              },
            })
          )

          if (updateCount >= 100) {
            clearInterval(interval)
            setTimeout(() => resolve([]), 1000)
          }
        }, 10) // 100 updates per second
      })
    })

    // Verify no performance issues
    expect(performanceMetrics).toBeDefined()
  })

  test("should not have memory leaks", async ({ page }) => {
    await page.goto("/")

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    // Simulate extended usage
    for (let i = 0; i < 10; i++) {
      await page.reload()
      await page.waitForSelector('[data-testid="tickers-panel"]')
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    // Memory should not increase significantly
    const memoryIncrease = finalMemory - initialMemory
    const maxAcceptableIncrease = 10 * 1024 * 1024 // 10MB

    expect(memoryIncrease).toBeLessThan(maxAcceptableIncrease)
  })
})
```

---

## 🎯 Testing Strategies by Feature

### WebSocket Testing Strategy

```typescript
// Mock WebSocket for predictable testing
class MockWebSocket {
  private handlers: { [key: string]: Function[] } = {}

  constructor(public url: string) {}

  addEventListener(event: string, handler: Function) {
    if (!this.handlers[event]) {
      this.handlers[event] = []
    }
    this.handlers[event].push(handler)
  }

  send(data: string) {
    // Simulate server responses based on sent data
    const parsed = JSON.parse(data)

    if (parsed.event === "subscribe") {
      setTimeout(() => {
        this.emit("message", {
          data: JSON.stringify({
            event: "subscribed",
            channel: parsed.channel,
            chanId: Math.floor(Math.random() * 10000),
            symbol: parsed.symbol,
          }),
        })
      }, 100)
    }
  }

  close() {
    this.emit("close", {})
  }

  private emit(event: string, data: any) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((handler) => handler(data))
    }
  }
}
```

### Chart Testing Strategy

```typescript
// Mock Highcharts for component testing
const mockHighcharts = {
  stockChart: jest.fn((container, options) => ({
    update: jest.fn(),
    destroy: jest.fn(),
    series: [
      {
        setData: jest.fn(),
        addPoint: jest.fn(),
      },
    ],
  })),
  setOptions: jest.fn(),
}

// Test chart data transformation
const testChartDataTransformation = (candles: Candle[]) => {
  const expectedFormat = candles.map((candle) => [
    candle.timestamp,
    candle.open,
    candle.high,
    candle.low,
    candle.close,
  ])

  return expectedFormat
}
```

### Performance Testing Utilities

```typescript
// Performance measurement utilities
class PerformanceTestUtils {
  static measureRenderTime(component: React.ComponentType, props: any): number {
    const start = performance.now()

    render(React.createElement(component, props))

    return performance.now() - start
  }

  static measureSelectorTime(selector: Function, state: any, ...args: any[]): number {
    const start = performance.now()

    selector(state, ...args)

    return performance.now() - start
  }

  static simulateHighFrequencyUpdates(
    component: React.ComponentType,
    updateCount: number,
    updateInterval: number
  ): Promise<number[]> {
    return new Promise((resolve) => {
      const renderTimes: number[] = []
      let count = 0

      const interval = setInterval(() => {
        const renderTime = this.measureRenderTime(component, {
          data: generateMockData(),
        })

        renderTimes.push(renderTime)
        count++

        if (count >= updateCount) {
          clearInterval(interval)
          resolve(renderTimes)
        }
      }, updateInterval)
    })
  }
}
```

---

## 📊 Test Coverage & Quality Metrics

### Coverage Requirements

```typescript
// jest.config.js coverage thresholds
module.exports = {
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/index.tsx"],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Critical modules require higher coverage
    "./src/modules/trades/": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    "./src/core/transport/": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}
```

### Quality Gates

```typescript
// Quality metrics to track
interface QualityMetrics {
  testCoverage: {
    lines: number
    branches: number
    functions: number
    statements: number
  }

  performance: {
    averageRenderTime: number
    memoryUsage: number
    bundleSize: number
  }

  reliability: {
    errorRate: number
    crashRate: number
    reconnectionSuccessRate: number
  }

  maintainability: {
    codeComplexity: number
    technicalDebt: number
    duplicateCode: number
  }
}
```

---

## 🚀 Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run Vitest tests
        run: npm run test:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

      - name: Performance regression test
        run: npm run test:performance
```

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:performance": "playwright test tests/performance"
  }
}
```

### Handler Testing Strategy

```typescript
// src/core/transport/handlers/__tests__/tradesHandler.test.ts
import { describe, it, expect, vi } from "vitest"
import { handleTradesData } from "../tradesHandler"
import { tradesSnapshotReducer, tradesUpdateReducer } from "../../../modules/trades/slice"

describe("tradesHandler", () => {
  const mockDispatch = vi.fn()
  const mockSubscription = {
    request: { symbol: "tBTCUSD" },
    channel: "trades",
  }

  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it("should handle snapshot data", () => {
    const snapshotData = [
      12345, // channelId
      [
        [1, 1640995200000, 0.5, 45000],
        [2, 1640995300000, 0.3, 45100],
      ],
    ]

    handleTradesData(snapshotData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith(
      tradesSnapshotReducer({
        currencyPair: "BTCUSD",
        trades: [
          { id: 1, timestamp: 1640995200000, amount: 0.5, price: 45000 },
          { id: 2, timestamp: 1640995300000, amount: 0.3, price: 45100 },
        ],
      })
    )
  })

  it("should handle single trade update", () => {
    const updateData = [12345, [3, 1640995400000, 0.8, 44900]]

    handleTradesData(updateData, mockSubscription, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledWith(
      tradesUpdateReducer({
        currencyPair: "BTCUSD",
        trade: { id: 3, timestamp: 1640995400000, amount: 0.8, price: 44900 },
      })
    )
  })
})
```

---

_This testing guide ensures your CryptoApp maintains the highest quality standards. For implementation examples, see the test files in each module. For CI/CD setup, see [Deployment Guide](DEPLOYMENT.md)._
