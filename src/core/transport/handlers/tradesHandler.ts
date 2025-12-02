import { tradesSnapshotReducer, tradesUpdateReducer } from '../../../modules/trades/slice'
import type { RawTrade, Trade } from '../../../modules/trades/types/Trade'

export const handleTradesData = (parsedData: any[], subscription: any, dispatch: any) => {
  const currencyPair = subscription.request.symbol.slice(1)

  if (Array.isArray(parsedData[1])) {
    // Snapshot
    const [, rawTrades] = parsedData
    const trades: Trade[] = rawTrades
      .sort((a: RawTrade, b: RawTrade) => b[1] - a[1])
      .map(([id, timestamp, amount, price]: RawTrade) => ({
        id,
        timestamp,
        amount,
        price,
      }))
    dispatch(tradesSnapshotReducer({ currencyPair, trades }))
  } else {
    // Single trade update
    const [, , trade] = parsedData
    const [id, timestamp, amount, price] = trade
    dispatch(tradesUpdateReducer({ currencyPair, trade: { id, timestamp, amount, price } }))
  }
}