import { createAsyncThunk } from "@reduxjs/toolkit"
import { refDataLoad } from "../reference-data/slice"
//import { subscribeToSymbol } from "../ticker/slice"
import { subscribeToSymbol } from "../../core/transport/slice"

import type { Connection } from "../../core/transport/Connection"
import { tickerSubscribeToSymbol } from "../../modules/tickers/slice"

export const bootstrapApp = createAsyncThunk("app/bootstrap", async (_, { dispatch, extra }) => {
  console.log("Bootstrap App")

  const { connection } = extra as { connection: Connection }

  connection.connect()

  const currencyPairs = await dispatch(refDataLoad()).unwrap()

  // Subscribe to ticker for all currency pairs
  const tickerPromises = currencyPairs.map(
    (currencyPair: any, index: number) =>
      new Promise(
        (resolve) =>
          setTimeout(() => {
            dispatch(tickerSubscribeToSymbol({ symbol: `t${currencyPair}` }))
            resolve(null)
          }, index * 2000) // 2000ms delay between subscriptions
      )
  )

  // Subscribe to trades for first currency pair
  setTimeout(async () => {
    dispatch(subscribeToSymbol({ symbol: `t${currencyPairs[0]}` }))
  }, 2000)

  await Promise.all(tickerPromises)
})
