import { createSelector } from "@reduxjs/toolkit"
import { type RootState } from "../redux/store"
import type { Order } from "./types/Order"
import { uniq } from "lodash"

const bookSelector = (state: RootState) => state.book

export const getRawBook = createSelector(bookSelector, (book) => (symbol: string) => book[symbol])

export const getBook = createSelector(bookSelector, (book) => (symbol: string) => {
  const rawBook = book[symbol] || []

  const bids = rawBook.filter((order) => order.amount > 0).sort((a, b) => b.price - a.price)

  const asks = rawBook.filter((order) => order.amount < 0).sort((a, b) => a.price - b.price)

  const maxDepth = Math.max(bids.length, asks.length)

  // [
  //     { bid: { price: 100 }, ask: { price: 101 }, depth: 0 },
  //     { bid: { price: 99 }, ask: { price: 102 }, depth: 1 },
  //     { bid: { price: 98 }, ask: undefined, depth: 2 }
  // ]

  return Array.from({ length: maxDepth }, (_, depth) => ({
    bid: bids[depth],
    ask: asks[depth],
    depth,
  })).filter((row) => row.bid && row.ask) as { bid: Order; ask: Order; depth: number }[]
})

const getPricePoints = (orders: Order[]) =>
  uniq(orders.map((order) => order.price)).sort((a, b) => a - b)

const computeDepth = (orders: Order[]) => {
  return (pricePoints: number[], orderFilter: (order: Order, pricePoint: number) => boolean) => {
    return pricePoints.map((price) => {
      const depth = orders
        .filter((order) => orderFilter(order, price))
        .reduce((acc, order) => {
          return (acc += Math.abs(order.amount))
        }, 0)
      return {
        price,
        depth,
      }
    })
  }
}

export const getDepth = createSelector(bookSelector, (book) => (symbol: string) => {
  const rawBook = book[symbol] || []

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
})
