import { createSelector } from "@reduxjs/toolkit"
import { type RootState } from "../redux/store"
import type { Order } from "./types/Order"

const MAX_LEVELS = 25

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

    const maxBidDepth = limitedBids.reduce((sum, o) => sum + o.amount, 0)
    const maxAskDepth = limitedAsks.reduce((sum, o) => sum + Math.abs(o.amount), 0)

    const maxDepth = maxBidDepth + maxAskDepth

    // Always return exactly MAX_LEVELS rows for stability
    const result = new Array(MAX_LEVELS)
    let bidDepth = 0
    let askDepth = 0

    for (let i = 0; i < MAX_LEVELS; i++) {
      const bid = limitedBids[i] || null
      const ask = limitedAsks[i] || null

      if (bid) bidDepth += bid.amount
      if (ask) askDepth += Math.abs(ask.amount)

      result[i] = {
        id: i, // Stable row ID for React rendering.
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

const getPricePoints = (orders: Order[]) => {
  const prices = orders.map((order) => order.price)
  return [...new Set(prices)].sort((a, b) => a - b)
}

const computeDepth = (orders: Order[]) => {
  return (pricePoints: number[], orderFilter: (order: Order, pricePoint: number) => boolean) => {
    return pricePoints.map((price) => {
      const depth = orders
        .filter((order) => orderFilter(order, price))
        .reduce((acc, order) => {
          return acc + Math.abs(order.amount)
        }, 0)
      return {
        price,
        depth,
      }
    })
  }
}

export const getDepth = createSelector(
  [bookSelector, (_: RootState, symbol: string) => symbol],
  (book, symbol) => {
    const rawBook = book[symbol]
    if (!rawBook?.length) return { bids: [], asks: [] }

    const bids = rawBook.filter((order) => order.amount > 0)
    const asks = rawBook.filter((order) => order.amount < 0)

    const bidPrices = getPricePoints(bids)
    const askPrices = getPricePoints(asks)

    const bidDepth = computeDepth(bids)(bidPrices, (order, pricePoint) => order.price >= pricePoint)
    const askDepth = computeDepth(asks)(askPrices, (order, pricePoint) => order.price <= pricePoint)

    return {
      bids: bidDepth,
      asks: askDepth,
    }
  }
)
