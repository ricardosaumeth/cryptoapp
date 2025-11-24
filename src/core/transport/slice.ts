import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { ConnectionStatus } from "./types/ConnectionStatus"
import type { Connection } from "./Connection"
import { type ChannelTypes, Channel } from "./types/Channels"
import { SubscriptionActionType, type SubscriptionActionTypes } from "./types/ActionTypes"
import type { SubscribeMsg } from "./types/SubscribeMsg"

export type requestSubscribeToChannelAck = {
  channel: string
  event?: string
  symbol?: string
  key?: string
  prec?: string
}

export interface SubscriptionState {
  [channelId: number]: {
    channel: string
    request: requestSubscribeToChannelAck
  }
  wsConnectionStatus: ConnectionStatus
}

const initialState: SubscriptionState = {
  wsConnectionStatus: ConnectionStatus.Disconnected,
}

interface SubscribePayload {
  symbol: string
  timeframe?: string
  prec?: string
}

const createSubscribeThunk = (channel: ChannelTypes, actionType: SubscriptionActionTypes) =>
  createAsyncThunk(actionType, async ({ symbol, timeframe, prec }: SubscribePayload, { extra }) => {
    const { connection } = extra as { connection: Connection }

    const msg: SubscribeMsg = {
      event: "subscribe",
      channel,
    }

    switch (channel) {
      case Channel.CANDLES:
        msg.key = `trade:${timeframe}:t${symbol}`
        break

      case Channel.BOOK:
        msg.prec = prec
        msg.symbol = `t${symbol}`
        break

      case Channel.TRADES:
      case Channel.TICKER:
        msg.symbol = `t${symbol}`
        break

      default:
        console.warn("Unhandled channel:", channel)
    }

    connection.send(JSON.stringify(msg))
    return symbol
  })

export const tradeSubscribeToSymbol = createSubscribeThunk(
  Channel.TRADES,
  SubscriptionActionType.SUBSCRIBE_TO_TRADES
)

export const tickerSubscribeToSymbol = createSubscribeThunk(
  Channel.TICKER,
  SubscriptionActionType.SUBSCRIBE_TO_TICKER
)

export const candlesSubscribeToSymbol = createSubscribeThunk(
  Channel.CANDLES,
  SubscriptionActionType.SUBSCRIBE_TO_CANDLES
)

export const bookSubscribeToSymbol = createSubscribeThunk(
  Channel.BOOK,
  SubscriptionActionType.SUBSCRIBE_TO_BOOK
)

export const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    changeConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.wsConnectionStatus = action.payload
    },
    subscribeToChannelAck: (
      state,
      action: PayloadAction<{
        channelId: number
        channel: ChannelTypes
        request: requestSubscribeToChannelAck
      }>
    ) => {
      const { channelId, channel, request } = action.payload
      state[channelId] = { channel, request }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(tradeSubscribeToSymbol.fulfilled, (_state, action) => {
        console.log(`Subscribed to trade ${action.payload}`)
      })
      .addCase(tickerSubscribeToSymbol.fulfilled, (_state, action) => {
        console.log(`Subscribed to ticker ${action.payload}`)
      })
      .addCase(candlesSubscribeToSymbol.fulfilled, (_state, action) => {
        console.log(`Subscribed to candle ${action.payload}`)
      })
      .addCase(bookSubscribeToSymbol.fulfilled, (_state, action) => {
        console.log(`Subscribed to book ${action.payload}`)
      })
  },
})

export const { changeConnectionStatus, subscribeToChannelAck } = subscriptionsSlice.actions
export default subscriptionsSlice.reducer
