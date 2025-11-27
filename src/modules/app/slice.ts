import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { refDataLoad } from "../reference-data/slice"
import { candlesSubscribeToSymbol, tickerSubscribeToSymbol } from "../../core/transport/slice"
import type { Connection } from "../../core/transport/Connection"
import type { RootState } from "../redux/store"
import { ConnectionStatus } from "../../core/transport/types/ConnectionStatus"
import { selectCurrencyPair } from "../selection/slice"
import { parseCurrencyPair } from "../reference-data/utils"

export const DEFAULT_TIMEFRAME = "1m"
export const SUBSCRIPTION_TIMEOUT_IN_MS = 2000
const CHECK_CONNECTION_TIMEOUT_IN_MS = 100

const waitForConnection = (getState: () => RootState): Promise<void> => {
  return new Promise((resolve) => {
    const checkConnection = () => {
      if (getState().subscriptions.wsConnectionStatus === ConnectionStatus.Connected) {
        resolve()
      } else {
        setTimeout(checkConnection, CHECK_CONNECTION_TIMEOUT_IN_MS)
      }
    }
    checkConnection()
  })
}

export const bootstrapApp = createAsyncThunk(
  "app/bootstrap",
  async (_, { dispatch, getState, extra }) => {
    const { connection } = extra as { connection: Connection }

    connection.connect()
    await waitForConnection(getState as () => RootState)

    const currencyPairs = await dispatch(refDataLoad()).unwrap()

    dispatch(selectCurrencyPair({ currencyPair: currencyPairs[0] }))

    // Subscribe to ticker and candles for all currency pairs with delays
    currencyPairs.forEach((currencyPair: string, index: number) => {
      setTimeout(
        () => {
          dispatch(tickerSubscribeToSymbol({ symbol: currencyPair }))
          dispatch(candlesSubscribeToSymbol({ symbol: currencyPair, timeframe: DEFAULT_TIMEFRAME }))
        },
        (index + 1) * SUBSCRIPTION_TIMEOUT_IN_MS
      )
    })

    return currencyPairs[0]
  }
)

export const appBootstrapSlice = createSlice({
  name: "app/bootstrap",
  initialState: {},
  reducers: {
    updateTitle: (_state, action: PayloadAction<{ currencyPair: string; lastPrice: number }>) => {
      const { currencyPair, lastPrice } = action.payload
      const [, counter] = parseCurrencyPair(currencyPair)
      document.title = `(${lastPrice?.toFixed(2)} ${counter}) Crypto App`
    },
  },
  extraReducers: (builder) => {
    builder.addCase(bootstrapApp.fulfilled, (_state, _action) => {
      console.log(`Bootstrap App successfully`)
    })
  },
})

export const { updateTitle } = appBootstrapSlice.actions
export default appBootstrapSlice.reducer
