import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { connection } from "../../../src/modules/redux/store"

export interface SubscriptionState {
  [channelId: number]: {
    channel: string
    request: { channel: string; event: string; symbol: string }
  }
}

const initialState: SubscriptionState = {}

const createSubscribeThunk = (channel: string, actionType: string) =>
  createAsyncThunk(
    actionType,
    async ({ symbol }: { symbol: string }) => {
      const msg = {
        event: "subscribe",
        channel,
        symbol,
      }

      connection.send(JSON.stringify(msg))
      return symbol
    }
  )

export const tradeSubscribeToSymbol = createSubscribeThunk("trades", "trades/subscribeToSymbol")
export const tickerSubscribeToSymbol = createSubscribeThunk("ticker", "ticker/subscribeToSymbol")

export const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    subscribeToChannelAck: (
      state,
      action: PayloadAction<{
        channelId: number
        channel: string
        request: { channel: string; event: string; symbol: string }
      }>
    ) => {
      const { channelId, channel, request } = action.payload
      state[channelId] = { channel, request }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(tradeSubscribeToSymbol.fulfilled, (_state, action) => {
      console.log(`Subscribed to trade ${action.payload}`)
    }),
    builder.addCase(tickerSubscribeToSymbol.fulfilled, (_state, action) => {
      console.log(`Subscribed to ticker ${action.payload}`)
    })
  },
})

export const { subscribeToChannelAck } = subscriptionsSlice.actions
export default subscriptionsSlice.reducer
