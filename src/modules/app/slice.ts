import { createAsyncThunk } from "@reduxjs/toolkit"
import { refDataLoad } from "../reference-data/slice"
import { tickerSubscribeToSymbol } from "../../core/transport/slice"
import type { Connection } from "../../core/transport/Connection"
import type { RootState } from "../redux/store"
import { ConnectionStatus } from "../../core/transport/types/ConnectionStatus"
import { selectCurrencyPair } from "../selection/slice"

const waitForConnection = (getState: () => RootState): Promise<void> => {
  return new Promise((resolve) => {
    const checkConnection = () => {
      if (getState().subscriptions.wsConnectionStatus === ConnectionStatus.Connected) {
        resolve()
      } else {
        setTimeout(checkConnection, 100)
      }
    }
    checkConnection()
  })
}

export const bootstrapApp = createAsyncThunk(
  "app/bootstrap",
  async (_, { dispatch, getState, extra }) => {
    console.log("Bootstrap App")

    const { connection } = extra as { connection: Connection }

    connection.connect()
    await waitForConnection(getState as () => RootState)

    const currencyPairs = await dispatch(refDataLoad()).unwrap()

    dispatch(selectCurrencyPair({ currencyPair: currencyPairs[0] }))

    // Subscribe to ticker for all currency pairs with delays
    currencyPairs.forEach((currencyPair: string, index: number) => {
      setTimeout(
        () => {
          dispatch(tickerSubscribeToSymbol({ symbol: currencyPair }))
        },
        (index + 1) * 2000
      )
    })
  }
)
