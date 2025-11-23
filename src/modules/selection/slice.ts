import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { candlesSubscribeToSymbol, tradeSubscribeToSymbol } from "../../core/transport/slice"

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
    }, 2000)
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
