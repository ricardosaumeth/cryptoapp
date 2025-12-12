import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type Ticker } from "./types/Ticker"

export interface TickerState {
  [symbol: string]: Ticker
}

const initialState: TickerState = {}

export interface TickerUpdatePayload {
  symbol: string
  data: any[]
}

export const tickerSlice = createSlice({
  name: "ticker",
  initialState,
  reducers: {
    updateTicker: (state, action: PayloadAction<TickerUpdatePayload>) => {
      const { symbol, data } = action.payload
      const currencyPair = symbol.slice(1)
      const [
        ,
        [
          bid,
          bidSize,
          ask,
          askSize,
          dailyChange,
          dailyChangeRelative,
          lastPrice,
          volume,
          high,
          low,
        ],
      ] = data

      state[currencyPair] = {
        currencyPair,
        bid,
        bidSize,
        ask,
        askSize,
        dailyChange,
        dailyChangeRelative,
        lastPrice,
        volume,
        high,
        low,
      }
    },
  },
})

export const { updateTicker } = tickerSlice.actions
export default tickerSlice.reducer
