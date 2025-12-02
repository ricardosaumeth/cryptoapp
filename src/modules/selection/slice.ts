import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
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
  async ({ currencyPair }: { currencyPair: string }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const previousPair = state.selection.currencyPair

      if (previousPair && previousPair !== currencyPair) {
        const unsubPromises = Object.entries(state.subscriptions)
          .filter(([chanId]) => {
            const sub = state.subscriptions[Number(chanId)]
            return sub?.channel === Channel.TRADES || sub?.channel === Channel.BOOK
          })
          .map(async ([chanId]) => {
            try {
              return await dispatch(unsubscribeFromTradesAndBook(chanId)).unwrap()
            } catch (error) {
              console.warn(`Failed to unsubscribe from channel ${chanId}:`, error)
              return null
            }
          })
        // Promise.allSettled waits for all operations to complete regardless of
        // individual failures, ensuring cleanup always happens.
        await Promise.allSettled(unsubPromises)
      }

      dispatch(selectionSlice.actions.setCurrencyPair({ currencyPair }))

      // The original code returned immediately while setTimeout was still pending,
      // creating a race condition. The new version properly waits for the timeout
      // to complete before resolving.
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          dispatch(tradeSubscribeToSymbol({ symbol: currencyPair }))
          dispatch(bookSubscribeToSymbol({ symbol: currencyPair, prec: "R0" }))
          resolve(currencyPair)
        }, SUBSCRIPTION_TIMEOUT_IN_MS)
      })
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error")
    }
  }
)

export const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    setCurrencyPair: (state, action: PayloadAction<{ currencyPair: string }>) => {
      const { currencyPair } = action.payload
      state.currencyPair = currencyPair
    },
  },
})

export default selectionSlice.reducer
