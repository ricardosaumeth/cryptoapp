import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Order, OrderTuple } from "./types/Order"

type SymbolState = Order[]

export interface BookState {
  [currencyPair: string]: SymbolState
}

/**
 * MEMORY-BOUNDED ARRAY CONFIGURATION FOR ORDER BOOK
 *
 * Order books are SNAPSHOTS of current market state, not historical data.
 * Unlike trades/candles, we don't need deep history—just current depth.
 *
 * Why 100 orders?
 * - Order books show top bids and asks
 * - Top 50 bids + top 50 asks = complete market depth
 * - Depth charts only visualize top levels
 * - More than 100 is visual noise
 * - Keeps AG Grid responsive for real-time updates
 *
 * Note: Order books update 10-60 times per second.
 * Without bounds, even snapshots can accumulate if not properly managed.
 */
const MAX_BOOK_ORDERS = 100
const initialState: BookState = {}

export const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    bookSnapshotReducer: (
      state,
      action: PayloadAction<{ currencyPair: string; orders: OrderTuple[] }>
    ) => {
      const { currencyPair, orders } = action.payload
      state[currencyPair] = orders.map(([id, price, amount]: OrderTuple) => ({
        id,
        price,
        amount,
      }))
    },
    bookUpdateReducer: (
      state,
      action: PayloadAction<{ currencyPair: string; order: OrderTuple }>
    ) => {
      const { currencyPair, order } = action.payload
      const [id, price, amount] = order
      const orders = state[currencyPair] ?? (state[currencyPair] = [])
      const orderIndex = orders.findIndex((o) => o.id === id)

      if (price === 0 && orderIndex >= 0) {
        // remove
        orders.splice(orderIndex, 1)
      } else if (orderIndex >= 0) {
        // update
        orders[orderIndex] = { id, price, amount }
      } else {
        // add
        orders.push({ id, price, amount })

        /**
         * 🔥 CRITICAL: MEMORY-BOUNDED ARRAY FOR ORDER BOOK
         *
         * Order books are current market snapshots, not historical records.
         * We only need the top N orders for:
         * - Depth chart visualization
         * - Bid/ask spread analysis
         * - Market depth display
         *
         * Why bound order books?
         * - Updates arrive 10-60 times per second
         * - Without bounds, arrays can still grow from edge cases
         * - AG Grid performance degrades with large datasets
         * - 100 orders is more than enough for visualization
         *
         * Real-world: Most exchanges only show top 20-50 levels anyway.
         */
        if (orders.length > MAX_BOOK_ORDERS) {
          orders.splice(0, orders.length - MAX_BOOK_ORDERS)
        }
      }
    },
  },
})

export const { bookSnapshotReducer, bookUpdateReducer } = bookSlice.actions
export default bookSlice.reducer
