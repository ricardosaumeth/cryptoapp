import { candlesSnapshotReducer, candlesUpdateReducer } from "../../../modules/candles/slice"
import { getLookupKey } from "../../../modules/candles/utils"

export const handleCandlesData = (parsedData: any[], subscription: any, dispatch: any) => {
  const { key } = subscription.request
  const [, timeframe, symbol] = key.split(":")
  const currencyPair = symbol.slice(1)
  const lookupKey = getLookupKey(currencyPair, timeframe)

  if (Array.isArray(parsedData[1][0])) {
    // Snapshot
    const [, candles] = parsedData
    dispatch(candlesSnapshotReducer({ lookupKey, candles }))
  } else {
    // Single candle update
    const [, candle] = parsedData
    dispatch(candlesUpdateReducer({ lookupKey, candle }))
  }
}
