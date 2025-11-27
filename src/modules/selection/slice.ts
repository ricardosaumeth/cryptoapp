import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  candlesSubscribeToSymbol,
  tradeSubscribeToSymbol,
  bookSubscribeToSymbol,
  unsubscribeFromTrades,
  unsubscribeFromBook,
} from "../../core/transport/slice"
import { DEFAULT_TIMEFRAME, SUBSCRIPTION_TIMEOUT_IN_MS } from "../app/slice"
import type { RootState } from "../redux/store"

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
        .filter(([chanId]) => chanId !== "wsConnectionStatus")
        .map(([chanId]) => {
          dispatch(unsubscribeFromTrades(chanId))
          dispatch(unsubscribeFromBook(chanId))
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
