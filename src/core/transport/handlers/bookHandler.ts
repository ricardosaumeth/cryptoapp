import { bookSnapshotReducer, bookUpdateReducer } from "../../../modules/book/slice"
import type { AppDispatch } from "../../../modules/redux/store"

const updateQueues = new Map<string, any[]>()
const batchTimeouts = new Map<string, NodeJS.Timeout>()
const BATCH_DELAY_MS = 50

const flushUpdates = (currencyPair: string, dispatch: AppDispatch) => {
  const queue = updateQueues.get(currencyPair)
  if (queue && queue.length > 0) {
    queue.forEach((order) => {
      dispatch(bookUpdateReducer({ currencyPair, order }))
    })
    updateQueues.set(currencyPair, [])
  }
  batchTimeouts.delete(currencyPair)
}

export const handleBookData = (parsedData: any[], subscription: any, dispatch: AppDispatch) => {
  const currencyPair = subscription.request.symbol.slice(1)

  if (Array.isArray(parsedData[1][0])) {
    // Snapshot - flush pending updates first
    const timeout = batchTimeouts.get(currencyPair)
    if (timeout) {
      clearTimeout(timeout)
      flushUpdates(currencyPair, dispatch)
    }
    const [, orders] = parsedData
    dispatch(bookSnapshotReducer({ currencyPair, orders }))
  } else {
    // Queue update
    const [, order] = parsedData
    const queue = updateQueues.get(currencyPair) || []
    queue.push(order)
    updateQueues.set(currencyPair, queue)

    if (!batchTimeouts.has(currencyPair)) {
      const timeout = setTimeout(() => flushUpdates(currencyPair, dispatch), BATCH_DELAY_MS)
      batchTimeouts.set(currencyPair, timeout)
    }
  }
}
