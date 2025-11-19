import { configureStore } from '@reduxjs/toolkit';
import { tradesSlice } from '../trades/slice';
import { subscriptionsSlice } from '../../core/transport/slice';
import { WsConnectionProxy } from '../../core/transport/WsConnectionProxy';
import { Connection } from '../../core/transport/Connection';
import { createWsMiddleware } from '../../core/transport/wsMiddleware';

const connectionProxy = new WsConnectionProxy('wss://api-pub.bitfinex.com/ws/2');
export const connection = new Connection(connectionProxy);

export default function createStore() {
  const store = configureStore({
    reducer: {
      trades: tradesSlice.reducer,
      subscriptions: subscriptionsSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { connection },
        },
      }).concat(createWsMiddleware(connection)),
  });

  connection.onConnect(() => console.log('Connected'));
  connection.connect();

  return store;
}

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];
