import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { ConnectionStatus } from "./types/ConnectionStatus"
import type { Connection } from "./Connection"

export interface SubscriptionState {
  [channelId: number]: {
    channel: string
    request:
      | { channel: string; event: string; symbol: string }
      | { channel: string; event: string; key: string }
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

const createSubscribeThunk = (channel: string, actionType: string) =>
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

export const tradeSubscribeToSymbol = createSubscribeThunk("trades", "trades/subscribeToSymbol")
export const tickerSubscribeToSymbol = createSubscribeThunk("ticker", "ticker/subscribeToSymbol")
export const candlesSubscribeToSymbol = createSubscribeThunk("candles", "candles/subscribeToSymbol")

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
        channel: string
        request:
          | { channel: string; event: string; symbol: string }
          | { channel: string; event: string; key: string }
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
