export enum Channel {
  TRADES = "trades",
  CANDLES = "candles",
  TICKER = "ticker",
}

export type ChannelTypes = `${Channel}`
export type TradesChannel = typeof Channel.TRADES
export type CandlesChannel = typeof Channel.CANDLES
export type TickerChannel = typeof Channel.TICKER
