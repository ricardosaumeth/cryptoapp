import { bookSnapshotReducer, bookUpdateReducer } from "../../../modules/book/slice"

export const handleBookData = (parsedData: any[], subscription: any, dispatch: any) => {
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
}
