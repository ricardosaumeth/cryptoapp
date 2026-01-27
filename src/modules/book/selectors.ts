import { createSelector } from "@reduxjs/toolkit"
import { type RootState } from "../redux/store"
import type { Order } from "./types/Order"

const MAX_LEVELS = 25
const MAX_DEPTH_LEVELS = 15

const bookSelector = (state: RootState) => state.book

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

    let bidDepth = 0
    let askDepth = 0
    const maxBidDepth = limitedBids.reduce((sum, o) => sum + o.amount, 0)
    const maxAskDepth = limitedAsks.reduce((sum, o) => sum + Math.abs(o.amount), 0)
    const maxDepth = maxBidDepth + maxAskDepth

    const result = new Array(MAX_LEVELS)
    for (let i = 0; i < MAX_LEVELS; i++) {
      const bid = limitedBids[i] || null
      const ask = limitedAsks[i] || null

      if (bid) bidDepth += bid.amount
      if (ask) askDepth += Math.abs(ask.amount)

      result[i] = {
        id: i,
        bid,
        ask,
        bidDepth,
        askDepth,
        maxDepth,
      }
    }

    return result
  }
)

export const getDepth = createSelector(
  [bookSelector, (_: RootState, symbol: string) => symbol],
  (book, symbol) => {
    const rawBook = book[symbol]
    if (!rawBook?.length) return { bids: [], asks: [] }

    const bids = rawBook.filter((order) => order.amount > 0).slice(0, MAX_DEPTH_LEVELS)
    const asks = rawBook.filter((order) => order.amount < 0).slice(0, MAX_DEPTH_LEVELS)

    bids.sort((a, b) => b.price - a.price)
    asks.sort((a, b) => a.price - b.price)

    // Calculate cumulative depth properly for depth chart
    const bidDepth = bids.map((order, index) => {
      const depth = bids.slice(index).reduce((sum, o) => sum + o.amount, 0)
      return { price: order.price, depth }
    })

    const askDepth = asks.map((order, index) => {
      const depth = asks.slice(0, index + 1).reduce((sum, o) => sum + Math.abs(o.amount), 0)
      return { price: order.price, depth }
    })

    return { bids: bidDepth, asks: askDepth }
  }
)
