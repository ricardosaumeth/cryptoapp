import { createAsyncThunk } from "@reduxjs/toolkit"
import { refDataLoad } from "../reference-data/slice"
import { tradeSubscribeToSymbol } from "../../core/transport/slice"
import type { Connection } from "../../core/transport/Connection"
import { tickerSubscribeToSymbol } from "../../core/transport/slice"
import type { RootState } from "../redux/store"
import { ConnectionStatus } from "../../core/transport/types/ConnectionStatus"

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

    // Subscribe to trades for first currency pair
    setTimeout(() => {
      dispatch(tradeSubscribeToSymbol({ symbol: `t${currencyPairs[0]}` }))
    }, 2000)

    // Subscribe to ticker for all currency pairs with delays
    currencyPairs.forEach((currencyPair: string, index: number) => {
      setTimeout(
        () => {
          dispatch(tickerSubscribeToSymbol({ symbol: `t${currencyPair}` }))
        },
        (index + 1) * 2000
      )
    })
  }
)
