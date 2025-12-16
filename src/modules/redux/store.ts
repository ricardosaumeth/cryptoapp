import { configureStore, combineReducers, createAction } from "@reduxjs/toolkit"
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
import { startStaleMonitor } from "../../core/transport/staleMonitor"

const RESET_STATE = "RESET_STATE"
export const resetStore = createAction(RESET_STATE)

const connectionProxy = new WsConnectionProxy(
  import.meta.env["VITE_BITFINEX_WS_URL"] || "wss://api-pub.bitfinex.com/ws/2"
)
const connection = new Connection(connectionProxy)

const combinedReducer = combineReducers({
  app: appBootstrapSlice.reducer,
  trades: tradesSlice.reducer,
  subscriptions: subscriptionsSlice.reducer,
  refData: refDataSlice.reducer,
  ticker: tickerSlice.reducer,
  candles: candleSlice.reducer,
  selection: selectionSlice.reducer,
  book: bookSlice.reducer,
  ping: pingSlice.reducer,
})

type RootState = ReturnType<typeof combinedReducer>

let storeInstance: ReturnType<typeof createStore> | null = null

function createStore() {
  const rootReducer: (
    state: RootState | undefined,
    action: { type: string; [key: string]: any }
  ) => RootState = (state, action) => {
    if (action.type === RESET_STATE) {
      const selection = state?.selection
      state = {
        selection,
        app: undefined,
        trades: undefined,
        subscriptions: undefined,
        refData: undefined,
        ticker: undefined,
        candles: undefined,
        book: undefined,
        ping: undefined,
      } as unknown as RootState
    }
    return combinedReducer(state, action)
  }

  const store = configureStore({
    reducer: rootReducer,
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
    store.dispatch(resetStore())
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

export type { RootState }
export type AppDispatch = ReturnType<typeof createStore>["dispatch"]
