import { performanceTracker } from "../../../services/performanceTracker"
import { bookSnapshotReducer, bookUpdateReducer } from "../../../modules/book/slice"
import { ChannelTypeEnum } from "../../../types/avro-types"

export const handleBookData = (parsedData: any[], subscription: any, dispatch: any) => {
  const startTime = performance.now()

  const currencyPair = subscription.request.symbol.slice(1)
  if (Array.isArray(parsedData[1][0])) {
    // Snapshot
    const [, orders] = parsedData
    dispatch(bookSnapshotReducer({ currencyPair, orders }))
  } else {
    // Single order update
    const [, order] = parsedData
    dispatch(bookUpdateReducer({ currencyPair, order }))
  }

  const processingTime = performance.now() - startTime
  performanceTracker.updateLatency(ChannelTypeEnum.BOOK, processingTime)
}
