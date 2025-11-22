# 🚀 CryptoApp

A modern, real-time cryptocurrency trading dashboard built with React, TypeScript, and Redux Toolkit.

## ✨ Features

- **Real-time Data**: Live cryptocurrency prices, trades, and market data via WebSocket
- **Interactive Charts**: Candlestick charts with Highcharts for technical analysis
- **Market Overview**: Ticker displays with price changes and trends
- **Trade History**: Real-time trade feed with updates
- **Responsive Design**: Modern dark theme with smooth animations
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Styled Components with custom theme
- **Charts**: Highcharts & Highcharts React
- **WebSocket**: Custom connection management
- **Icons**: Material Icons
- **Data Grid**: AG Grid (Quartz Dark theme)

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
│   └── transport/        # WebSocket connection management
├── modules/              # Feature modules
│   ├── app/             # App initialization
│   ├── candles/         # Candlestick chart functionality
│   ├── redux/           # Store configuration
│   ├── reference-data/  # Currency pairs data
│   ├── tickers/         # Price ticker components
│   └── trades/          # Trade history
├── theme/               # Global styling and theme
└── App.tsx              # Main application component
```

## 🎨 Features Overview

### Real-time Market Data

- Live price updates from Bitfinex WebSocket API
- Automatic reconnection with exponential backoff
- Efficient state management with Redux Toolkit

### Interactive Charts

- Candlestick charts with zoom and navigation
- Dark theme integration
- Historical data visualization
- Responsive design

### Modern UI/UX

- Dark theme with sparkling header effects
- Smooth hover animations
- Grid-based layout
- Material Design icons

## 🔧 Configuration

### WebSocket Connection

The app connects to Bitfinex WebSocket API:

```typescript
// Default endpoint
wss://api-pub.bitfinex.com/ws/2
```

### Theme Customization

Modify colors in `src/theme/style.ts`:

```typescript
export default {
  BackgroundColor: "#1b1e2b",
  White: "#ffffff",
  Positive: "#00d4aa",
  Negative: "#ff6b6b",
}
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Components

- **CandlesChart**: Interactive candlestick charts
- **Ticker**: Real-time price display with trend indicators
- **TradesPanel**: Live trade feed
- **Connection Management**: Robust WebSocket handling

## 🔮 Future Enhancements

- [ ] Order book visualization
- [ ] Portfolio tracking
- [ ] Price alerts
- [ ] Multiple exchange support
- [ ] Mobile responsive improvements

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
