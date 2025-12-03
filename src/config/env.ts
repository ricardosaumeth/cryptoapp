export const config = {
  BITFINEX_WS_URL: import.meta.env["VITE_BITFINEX_WS_URL"] || "wss://api-pub.bitfinex.com/ws/2",
  IS_PRODUCTION: import.meta.env.PROD,
  MAX_TRADES: Number(import.meta.env["VITE_MAX_TRADES"]) || 1000,
  MAX_CANDLES: Number(import.meta.env["VITE_MAX_CANDLES"]) || 5000,
}
