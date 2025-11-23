import { createSelector } from "@reduxjs/toolkit"
import { type RootState } from "../redux/store"
import type { Order } from "./types/Order"

const bookSelector = (state: RootState) => state.book

export const getRawBook = createSelector(bookSelector, (book) => (symbol: string) => book[symbol])

export const getBook = createSelector(bookSelector, (book) => (symbol: string) => {
  const rawBook = book[symbol] || []

  const bids = rawBook.filter((order) => order.amount > 0).sort((a, b) => b.price - a.price)

  const asks = rawBook.filter((order) => order.amount < 0).sort((a, b) => a.price - b.price)

  const depth = Math.max(bids.length, asks.length)

  // [
  //     { bid: { price: 100 }, ask: { price: 101 }, depth: 0 },
  //     { bid: { price: 99 }, ask: { price: 102 }, depth: 1 },
  //     { bid: { price: 98 }, ask: undefined, depth: 2 }
  // ]

  return Array.from({ length: depth }, (_, depth) => ({
    bid: bids[depth],
    ask: asks[depth],
    depth,
  })).filter((row) => row.bid && row.ask) as { bid: Order; ask: Order; depth: number }[]
})
