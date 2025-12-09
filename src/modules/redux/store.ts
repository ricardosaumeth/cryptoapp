import { configureStore } from "@reduxjs/toolkit"
import { appBootstrapSlice } from "../app/slice"
import { tradesSlice } from "../trades/slice"
import { subscriptionsSlice, changeConnectionStatus } from "../../core/transport/slice"
import { refDataSlice } from "../reference-data/slice"
import { tickerSlice } from "../tickers/slice"
import { candleSlice } from "../candles/slice"
import { selectCurrencyPair, selectionSlice } from "../selection/slice"
import { bookSlice } from "../book/slice"
import { pingSlice, startPing, stopPing } from "../ping/slice"
import { WsConnectionProxy } from "../../core/transport/WsConnectionProxy"
import { Connection } from "../../core/transport/Connection"
import { createWsMiddleware } from "../../core/transport/wsMiddleware"
import { ConnectionStatus } from "../../core/transport/types/ConnectionStatus"
import { config } from "../../config/env"
import { startStaleMonitor } from "../../core/transport/staleMonitor"

const connectionProxy = new WsConnectionProxy(config.BITFINEX_WS_URL)
export const connection = new Connection(connectionProxy)

let storeInstance: ReturnType<typeof createStore> | null = null

function createStore() {
  const store = configureStore({
    reducer: {
      app: appBootstrapSlice.reducer,
      trades: tradesSlice.reducer,
      subscriptions: subscriptionsSlice.reducer,
      refData: refDataSlice.reducer,
      ticker: tickerSlice.reducer,
      candles: candleSlice.reducer,
      selection: selectionSlice.reducer,
      book: bookSlice.reducer,
      ping: pingSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { connection },
        },
        serializableCheck: false,
        immutableCheck: false,
      }).concat(createWsMiddleware(connection)),
  })

  connection.onConnect(() => {
    store.dispatch(changeConnectionStatus(ConnectionStatus.Connected))
    store.dispatch(startPing())
    console.log("Connected")

    const { currencyPair } = store.getState().selection
    if (currencyPair) {
      store.dispatch(selectCurrencyPair({ currencyPair }))
    }
  })

  connection.onClose(() => {
    store.dispatch(changeConnectionStatus(ConnectionStatus.Disconnected))
    store.dispatch(stopPing())
    console.log("Disconnected - will auto-reconnect")
  })

  startStaleMonitor(store.getState, store.dispatch)

  return store
}

export const getStore = () => {
  if (!storeInstance) {
    storeInstance = createStore()
  }
  return storeInstance
}

export default getStore

export type RootState = ReturnType<ReturnType<typeof createStore>["getState"]>
export type AppDispatch = ReturnType<typeof createStore>["dispatch"]
