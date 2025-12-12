import { bookSnapshotReducer, bookUpdateReducer } from "../../../modules/book/slice"
import type { AppDispatch } from "../../../modules/redux/store"

// Redux Version
// Every dispatch triggers reducers - Each bookUpdateReducer call creates
// a new state object

// React re-renders immediately - Every state change triggers component
// re-renders

// AG Grid can't keep up - Hundreds of updates per second overwhelm the
// grid's rendering

// Why the 50ms Batching Works
// // Without batching: 100 updates/sec = 100 Redux dispatches = 100 re-renders
// dispatch(bookUpdateReducer({ currencyPair, order })) // Called 100 times

// With batching: 100 updates/sec = 20 Redux dispatches = 20 re-renders
// batch(() => {
//   updateQueue.forEach(({ currencyPair, order }) => {
//     dispatch(bookUpdateReducer({ currencyPair, order }))
//   })
// })

// Copy
// The batch() ensures React only re-renders once per 50ms instead of on
// every single order update.

const updateQueues = new Map<string, any[]>()
const batchTimeouts = new Map<string, NodeJS.Timeout>()

const flushUpdates = (currencyPair: string, dispatch: AppDispatch) => {
  const queue = updateQueues.get(currencyPair)
  if (queue && queue.length > 0) {
    // Batch all updates into single dispatch
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
    // Immediate update - no batching
    const [, order] = parsedData
    dispatch(bookUpdateReducer({ currencyPair, order }))
  }
}
