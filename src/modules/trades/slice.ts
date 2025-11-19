import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Trade } from './types/Trade';

interface TradesState {
  [symbol: string]: Trade[];
}

const initialState: TradesState = {};

export const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    updateTrades: (state, action: PayloadAction<{ symbol: string; trades: Trade[] }>) => {
      const { symbol, trades } = action.payload;
      state[symbol] = trades;
    },
    addTrade: (state, action: PayloadAction<{ symbol: string; trade: Trade }>) => {
      const { symbol, trade } = action.payload;
      const trades = state[symbol] ?? (state[symbol] = []);
      const existingIndex = trades.findIndex((t) => t.id === trade.id);

      if (existingIndex >= 0) {
        trades[existingIndex] = trade;
      } else {
        trades.push(trade);
      }
    },
  },
});

export const { updateTrades, addTrade } = tradesSlice.actions;
