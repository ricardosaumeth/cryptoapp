import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  candlesSubscribeToSymbol,
  tradeSubscribeToSymbol,
  bookSubscribeToSymbol,
} from "../../core/transport/slice"
import { SUBSCRIPTION_TIMEOUT_IN_MS } from "../app/slice"

interface CurrencyPairState {
  currencyPair: string
}

const initialState: CurrencyPairState = {
  currencyPair: "",
}

export const selectCurrencyPair = createAsyncThunk(
  "selection/selectCurrencyPair",
  async ({ currencyPair }: { currencyPair: string }, { dispatch }) => {
    setTimeout(() => {
      dispatch(tradeSubscribeToSymbol({ symbol: currencyPair }))
      dispatch(candlesSubscribeToSymbol({ symbol: currencyPair, timeframe: "1m" }))
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
