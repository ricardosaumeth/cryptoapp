import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Order, OrderTuple } from "./types/Order"

type SymbolState = Order[]

export interface BookState {
  [currencyPair: string]: SymbolState
}

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
        if (orders.length > MAX_BOOK_ORDERS) {
          orders.splice(0, orders.length - MAX_BOOK_ORDERS)
        }
      }
    },
  },
})

export const { bookSnapshotReducer, bookUpdateReducer } = bookSlice.actions
export default bookSlice.reducer
