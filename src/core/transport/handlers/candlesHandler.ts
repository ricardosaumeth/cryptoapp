import { candlesSnapshotReducer, candlesUpdateReducer } from "../../../modules/candles/slice"
import { getLookupKey } from "../../../modules/candles/utils"
import { performanceTracker } from "../../../services/performanceTracker"
import { Channel } from "../types/Channels"

export const handleCandlesData = (parsedData: any[], subscription: any, dispatch: any) => {
  const startTime = performance.now()

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

  const processingTime = performance.now() - startTime
  performanceTracker.updateLatency(Channel.CANDLES, processingTime)
}
