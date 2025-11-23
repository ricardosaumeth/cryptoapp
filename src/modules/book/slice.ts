import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Order } from "./types/Order"

type SymbolState = Order[]
type OrderTuple = [number, number, number]

export interface BookState {
  [currencyPair: string]: SymbolState
}

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
      const orderIndex = state[currencyPair]?.findIndex((o) => o.id === id) ?? -1
      const newOrUpdatedOrder = {
        id,
        price,
        amount,
      }
      if (price === 0 && orderIndex >= 0) {
        // remove
        const updatedState = state[currencyPair]?.slice()
        updatedState!.splice(orderIndex, 1)
      } else if (orderIndex >= 0) {
        // update
        const updatedState = state[currencyPair]?.slice()
        updatedState!.splice(orderIndex, 1, newOrUpdatedOrder)
      } else {
        // add
        state[currencyPair]?.push(newOrUpdatedOrder)
      }
    },
  },
})

export const { bookSnapshotReducer, bookUpdateReducer } = bookSlice.actions
export default bookSlice.reducer
