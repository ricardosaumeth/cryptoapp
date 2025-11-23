export enum SubscriptionActionType {
  SUBSCRIBE_TO_TRADES = "trades/subscribeToSymbol",
  SUBSCRIBE_TO_TICKER = "ticker/subscribeToSymbol",
  SUBSCRIBE_TO_CANDLES = "candles/subscribeToSymbol",
  SUBSCRIBE_TO_BOOK = "book/subscribeToSymbol",
}

export type SubscriptionActionTypes = `${SubscriptionActionType}`
export type TradesSubscriptionAction = typeof SubscriptionActionType.SUBSCRIBE_TO_TRADES
export type TickerSubscriptionAction = typeof SubscriptionActionType.SUBSCRIBE_TO_TICKER
export type CandlesSubscriptionAction = typeof SubscriptionActionType.SUBSCRIBE_TO_CANDLES
export type BookSubscriptionAction = typeof SubscriptionActionType.SUBSCRIBE_TO_BOOK
