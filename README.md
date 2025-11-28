# 🚀 CryptoApp

A comprehensive real-time cryptocurrency trading dashboard built with React, TypeScript, and Redux Toolkit.

![Logo](./public/crypto-app.png)

## ✨ Features

- **Bitfinex API Integration**: Real-time cryptocurrency data via Bitfinex WebSocket API v2
- **Redux Thunk Async Operations**: Efficient async subscription management and data fetching
- **Interactive Charts**: Candlestick charts with Highcharts for technical analysis
- **Order Book**: Real-time order book with bid/ask visualization
- **Depth Chart**: Market depth visualization with interactive charts
- **Market Overview**: Comprehensive ticker displays with price changes and trends
- **Trade History**: Real-time trade feed with animated updates
- **Performance Monitoring**: Connection latency and diagnostics
- **Responsive Design**: Modern dark theme with smooth animations
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **State Management**: Redux Toolkit with Redux Thunk for async operations
- **API Integration**: Bitfinex WebSocket API v2 (wss://api-pub.bitfinex.com/ws/2)
- **Styling**: Styled Components with custom theme
- **Charts**: Highcharts & Highcharts React
- **Async Operations**: Redux Thunk for subscription management and data streaming
- **Data Grid**: AG Grid Community
- **Utilities**: Lodash, Luxon, Numeral

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cryptoapp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── core/                 # Core utilities and components
│   ├── components/       # Reusable UI components
│   │   ├── AnimatedCube/ # 3D animated loading cube
│   │   ├── Diagnostics/  # Connection diagnostics
│   │   ├── LineChart/    # Mini line charts
│   │   ├── Loading/      # Loading states
│   │   ├── TrendIndicator/ # Price trend arrows
│   │   └── Widget/       # Container components
│   ├── hooks/           # Custom React hooks
│   ├── transport/       # WebSocket connection management
│   └── utils.ts         # Utility functions
├── modules/             # Feature modules
│   ├── app/            # App initialization and state
│   ├── book/           # Order book and depth chart
│   ├── candles/        # Candlestick chart functionality
│   ├── common/         # Shared animated components
│   ├── ping/           # Connection latency monitoring
│   ├── redux/          # Store configuration
│   ├── reference-data/ # Currency pairs data
│   ├── selection/      # Selected pair state
│   ├── tickers/        # Price ticker components
│   └── trades/         # Trade history
├── theme/              # Global styling, fonts, and theme
└── App.tsx             # Main application component
```

## 🎨 Features Overview

### Bitfinex API Integration

- Direct integration with Bitfinex WebSocket API v2
- Redux Thunk async actions for channel subscriptions (trades, tickers, candles, book)
- Automatic reconnection with exponential backoff
- Efficient state management with Redux Toolkit
- Real-time data streaming for trades, order book, and market data

### Interactive Charts

- Candlestick charts with zoom and navigation
- Market depth visualization
- Mini price trend charts in tickers
- Dark theme integration with custom styling

### Order Book & Trading

- Real-time order book with bid/ask spreads
- Market depth chart visualization
- Price level aggregation
- Color-coded buy/sell orders

### Performance & Monitoring

- Connection latency monitoring
- WebSocket diagnostics panel
- Animated loading states
- Update highlighting for price changes

### Modern UI/UX

- Comprehensive grid-based layout
- Smooth animations and transitions
- Custom styled components
- Responsive design patterns

## 🔧 Configuration

### Bitfinex API Configuration

The app uses Redux Thunk for async Bitfinex API operations:

```typescript
// Bitfinex WebSocket API v2
wss://api-pub.bitfinex.com/ws/2

// Redux Thunk async subscription example
export const tradeSubscribeToSymbol = createAsyncThunk(
  'SUBSCRIBE_TO_TRADES',
  async ({ symbol }: SubscribePayload, { extra }) => {
    const { connection } = extra as { connection: Connection }
    const msg = {
      event: 'subscribe',
      channel: 'trades',
      symbol: `t${symbol}`
    }
    connection.send(JSON.stringify(msg))
    return msg
  }
)
```

### Theme Customization

Modify colors in `src/theme/style.ts`:

```typescript
const Palette = {
  BackgroundColor: "#1f2936",
  White: "#FFF",
  Positive: "#00AD08",
  Negative: "#FF264D",
  Bid: "#00AD08",
  Ask: "#FF264D",
  Orange: "#FFA41B",
}
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🌟 Key Components

- **CandlesChart**: Interactive candlestick charts with Highcharts
- **Market**: Comprehensive market data display
- **Tickers**: Grid of currency pairs with mini charts
- **Trades**: Real-time trade feed with animations
- **Book**: Order book with bid/ask visualization
- **DepthChart**: Market depth visualization
- **Diagnostics**: Connection monitoring and latency display
- **AnimatedContent**: Smooth content transitions

## 🔮 Future Enhancements

- [ ] Portfolio tracking and management
- [ ] Price alerts and notifications
- [ ] Multiple exchange support
- [ ] Advanced technical indicators
- [ ] Trading interface
- [ ] Historical data analysis
- [ ] Mobile app version

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using modern web technologies
