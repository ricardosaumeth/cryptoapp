import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { ConnectionStatus } from "./types/ConnectionStatus"
import type { Connection } from "./Connection"
import { type ChannelTypes, Channel } from "./types/Channels"
import { SubscriptionActionType, type SubscriptionActionTypes } from "./types/ActionTypes"

export interface SubscriptionState {
  [channelId: number]: {
    channel: string
    request:
      | { channel: ChannelTypes; event: string; symbol: string }
      | { channel: ChannelTypes; event: string; key: string }
  }
  wsConnectionStatus: ConnectionStatus
}

const initialState: SubscriptionState = {
  wsConnectionStatus: ConnectionStatus.Disconnected,
}

interface SubscribePayload {
  symbol: string
  timeframe?: string
}

const createSubscribeThunk = (channel: ChannelTypes, actionType: SubscriptionActionTypes) =>
  createAsyncThunk(actionType, async ({ symbol, timeframe }: SubscribePayload, { extra }) => {
    const { connection } = extra as { connection: Connection }

    const msg = timeframe
      ? {
          event: "subscribe",
          channel,
          key: `trade:${timeframe}:t${symbol}`,
        }
      : {
          event: "subscribe",
          channel,
          symbol: `t${symbol}`,
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

export const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    wsConnectionStatusChanged: (state, action: PayloadAction<ConnectionStatus>) => {
      state.wsConnectionStatus = action.payload
    },
    subscribeToChannelAck: (
      state,
      action: PayloadAction<{
        channelId: number
        channel: ChannelTypes
        request:
          | { channel: ChannelTypes; event: string; symbol: string }
          | { channel: ChannelTypes; event: string; key: string }
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
  },
})

export const { wsConnectionStatusChanged, subscribeToChannelAck } = subscriptionsSlice.actions
export default subscriptionsSlice.reducer
