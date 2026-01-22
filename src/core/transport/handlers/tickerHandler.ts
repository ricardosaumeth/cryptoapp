import { performanceTracker } from "../../../services/performanceTracker"
import { updateTicker } from "../../../modules/tickers/slice"
import { ChannelTypeEnum } from "../../../types/avro-types"

export const handleTickerData = (parsedData: any[], subscription: any, dispatch: any) => {
  const startTime = performance.now()
  dispatch(updateTicker({ symbol: subscription.request.symbol, data: parsedData }))
  const processingTime = performance.now() - startTime
  performanceTracker.updateLatency(ChannelTypeEnum.TICKER, processingTime)
}
