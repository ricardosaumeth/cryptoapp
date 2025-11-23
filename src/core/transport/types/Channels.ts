export enum Channel {
  TRADES = "trades",
  CANDLES = "candles",
  TICKER = "ticker",
  BOOK = "book",
}

export type ChannelTypes = `${Channel}`
export type TradesChannel = typeof Channel.TRADES
export type CandlesChannel = typeof Channel.CANDLES
export type TickerChannel = typeof Channel.TICKER
export type BookChannel = typeof Channel.BOOK
