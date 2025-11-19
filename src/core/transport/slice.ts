import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { connection } from '../../../src/modules/redux/store';

export interface SubscriptionState {
  [channelId: number]: {
    channel: string;
    request: { channel: string; event: string; symbol: string };
  };
}

const initialState: SubscriptionState = {};

export const subscribeToSymbol = createAsyncThunk(
  'trades/subscribeToSymbol',
  async ({ symbol }: { symbol: string }) => {
    const msg = {
      event: 'subscribe',
      channel: 'trades',
      symbol,
    };

    connection.send(JSON.stringify(msg));
    return symbol;
  }
);

export const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    subscribeToChannelAck: (
      state,
      action: PayloadAction<{
        channelId: number;
        channel: string;
        request: { channel: string; event: string; symbol: string };
      }>
    ) => {
      const { channelId, channel, request } = action.payload;
      state[channelId] = { channel, request };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(subscribeToSymbol.fulfilled, (state, action) => {
      console.log(`Subscribed to ${action.payload}`);
    });
  },
});

export const { subscribeToChannelAck } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
