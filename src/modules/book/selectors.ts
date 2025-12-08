import { createSelector } from "@reduxjs/toolkit"
import { type RootState } from "../redux/store"
import type { Order } from "./types/Order"

const MAX_LEVELS = 5

const bookSelector = (state: RootState) => state.book

export const getRawBook = createSelector(
  [bookSelector, (_: RootState, symbol: string) => symbol],
  (book, symbol) => book[symbol]
)

// [
//     { bid: { price: 100 }, ask: { price: 101 }, depth: 0 },
//     { bid: { price: 99 }, ask: { price: 102 }, depth: 1 },
//     { bid: { price: 98 }, ask: undefined, depth: 2 }
// ]
export const getBook = createSelector(
  [bookSelector, (_: RootState, symbol: string) => symbol],
  (book, symbol) => {
    const rawBook = book[symbol]
    if (!rawBook?.length) return []

    const bids: Order[] = []
    const asks: Order[] = []

    for (const order of rawBook) {
      if (order.amount > 0) {
        bids.push(order)
      } else {
        asks.push(order)
      }
    }

    bids.sort((a, b) => b.price - a.price)
    asks.sort((a, b) => a.price - b.price)

    const limitedBids = bids.slice(0, MAX_LEVELS)
    const limitedAsks = asks.slice(0, MAX_LEVELS)

    const maxBidDepth = limitedBids.reduce((sum, o) => sum + o.amount, 0)
    const maxAskDepth = limitedAsks.reduce((sum, o) => sum + Math.abs(o.amount), 0)

    const maxDepth = maxBidDepth + maxAskDepth
    const levels = Math.max(limitedBids.length, limitedAsks.length)
    const result = new Array(levels)

    let bidDepth = 0
    let askDepth = 0

    for (let i = 0; i < levels; i++) {
      const bid = limitedBids[i]
      const ask = limitedAsks[i]

      if (bid) bidDepth += bid.amount
      if (ask) askDepth += Math.abs(ask.amount)

      result[i] = { bid, ask, bidDepth, askDepth, maxDepth }
    }

    return result
  }
)

export const getDepth = createSelector(
  [bookSelector, (_: RootState, symbol: string) => symbol],
  (book, symbol) => {
    const rawBook = book[symbol]
    if (!rawBook?.length) return { bids: [], asks: [] }

    const bids = rawBook.filter((o) => o.amount > 0)
    const asks = rawBook.filter((o) => o.amount < 0)

    const bidPrices = [...new Set(bids.map((o) => o.price))].sort((a, b) => a - b)
    const askPrices = [...new Set(asks.map((o) => o.price))].sort((a, b) => a - b)

    const bidDepth = bidPrices.map((price) => ({
      price,
      depth: bids.filter((o) => o.price >= price).reduce((sum, o) => sum + Math.abs(o.amount), 0),
    }))

    const askDepth = askPrices.map((price) => ({
      price,
      depth: asks.filter((o) => o.price <= price).reduce((sum, o) => sum + Math.abs(o.amount), 0),
    }))

    return { bids: bidDepth, asks: askDepth }
  }
)
