import { configureStore } from "@reduxjs/toolkit"
import { tradesSlice } from "../trades/slice"
import { subscriptionsSlice, changeConnectionStatus } from "../../core/transport/slice"
import { refDataSlice } from "../reference-data/slice"
import { tickerSlice } from "../tickers/slice"
import { candleSlice } from "../candles/slice"
import { selectionSlice } from "../selection/slice"
import { bookSlice } from "../book/slice"
import { WsConnectionProxy } from "../../core/transport/WsConnectionProxy"
import { Connection } from "../../core/transport/Connection"
import { createWsMiddleware } from "../../core/transport/wsMiddleware"
import { ConnectionStatus } from "../../core/transport/types/ConnectionStatus"

const connectionProxy = new WsConnectionProxy("wss://api-pub.bitfinex.com/ws/2")
export const connection = new Connection(connectionProxy)

export default function createStore() {
  const store = configureStore({
    reducer: {
      trades: tradesSlice.reducer,
      subscriptions: subscriptionsSlice.reducer,
      refData: refDataSlice.reducer,
      ticker: tickerSlice.reducer,
      candles: candleSlice.reducer,
      selection: selectionSlice.reducer,
      book: bookSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { connection },
        },
      }).concat(createWsMiddleware(connection)),
  })

  connection.onConnect(() => {
    store.dispatch(changeConnectionStatus(ConnectionStatus.Connected))
    console.log("Connected")
  })

  return store
}

export type RootState = ReturnType<ReturnType<typeof createStore>["getState"]>
export type AppDispatch = ReturnType<typeof createStore>["dispatch"]
