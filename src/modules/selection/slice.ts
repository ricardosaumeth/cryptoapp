import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  tradeSubscribeToSymbol,
  bookSubscribeToSymbol,
  unsubscribeFromTradesAndBook,
} from "../../core/transport/slice"
import { SUBSCRIPTION_TIMEOUT_IN_MS } from "../app/slice"
import type { RootState } from "../redux/store"
import { Channel } from "../../core/transport/types/Channels"

interface CurrencyPairState {
  currencyPair: string
}

const initialState: CurrencyPairState = {
  currencyPair: "",
}

export const selectCurrencyPair = createAsyncThunk(
  "selection/selectCurrencyPair",
  async ({ currencyPair }: { currencyPair: string }, { dispatch, getState }) => {
    const state = getState() as RootState
    const previousPair = state.selection.currencyPair

    if (previousPair) {
      const unsubPromises = Object.entries(state.subscriptions)
        .filter(([chanId]) => {
          const sub = state.subscriptions[Number(chanId)]
          return sub?.channel === Channel.TRADES || sub?.channel === Channel.BOOK
        })
        .map(([chanId]) => {
          return dispatch(unsubscribeFromTradesAndBook(chanId)).unwrap()
        })

      await Promise.all(unsubPromises)
    }

    setTimeout(() => {
      dispatch(tradeSubscribeToSymbol({ symbol: currencyPair }))
      dispatch(bookSubscribeToSymbol({ symbol: currencyPair, prec: "R0" }))
    }, SUBSCRIPTION_TIMEOUT_IN_MS)
    return currencyPair
  }
)

export const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(selectCurrencyPair.fulfilled, (state, action) => {
      state.currencyPair = action.payload
    })
  },
})

export default selectionSlice.reducer
