import { performanceTracker } from "../../../services/performanceTracker"
import { updateTicker } from "../../../modules/tickers/slice"
import { Channel } from "../types/Channels"

export const handleTickerData = (parsedData: any[], subscription: any, dispatch: any) => {
  const startTime = performance.now()
  dispatch(updateTicker({ symbol: subscription.request.symbol, data: parsedData }))
  const processingTime = performance.now() - startTime
  performanceTracker.updateLatency(Channel.TICKER, processingTime)
}
