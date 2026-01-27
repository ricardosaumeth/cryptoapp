import { range } from "lodash"
import { createSelector } from "@reduxjs/toolkit"
import { type RootState } from "../redux/store"
import { type Ticker } from "./types/Ticker"
import { getCurrencyPairs } from "../reference-data/selectors"
import { getSelectedCurrencyPair } from "../selection/selectors"
import { candlesSelector } from "../candles/selectors"
import { getValueAt } from "../../core/utils"
import { getLookupKey } from "../candles/utils"
import { DEFAULT_TIMEFRAME } from "../app/slice"
import { ChannelTypeEnum } from "../../types/avro-types"

const tickerSelector = (state: RootState) => state.ticker

export const getTicker = createSelector(
  tickerSelector,
  (ticker) => (symbol: string) => ticker[symbol]
)

export const getTickers = createSelector(
  getCurrencyPairs,
  tickerSelector,
  (currencyPairs, ticker) =>
    currencyPairs
      .map((currencyPair) => ({
        currencyPair,
        ...ticker[currencyPair],
      }))
      .filter(
        (item): item is Ticker & { currencyPair: string } =>
          item.lastPrice !== undefined &&
          item.dailyChange !== undefined &&
          item.dailyChangeRelative !== undefined
      )
)

export const getVisibleCurrencyPairTickers = createSelector(
  getCurrencyPairs,
  getSelectedCurrencyPair,
  (allCurrencyPairs, selectedCurrencyPair) => {
    let currencyPairs: string[] = []

    const selectedCurrencyPairIndex = allCurrencyPairs.indexOf(selectedCurrencyPair || "")

    // Pick a few currency pairs on each side of the selected one
    if (selectedCurrencyPairIndex >= 0) {
      currencyPairs = range(selectedCurrencyPairIndex - 2, selectedCurrencyPairIndex + 3)
        .map((index) => getValueAt(allCurrencyPairs)(index))
        .filter((pair): pair is string => pair !== undefined)
    }

    return {
      currencyPairs,
      selectedCurrencyPairIndex,
    }
  }
)

// Memoized price data selector to prevent recalculation
const getPriceData = createSelector(candlesSelector, (candles) => {
  const priceCache = new Map<string, number[]>()

  Object.keys(candles).forEach((lookupKey) => {
    const candleData = candles[lookupKey]
    if (candleData && candleData.length > 0) {
      // Only take last 20 candles for mini chart performance
      const prices = candleData.slice(-20).map((candle) => candle.close)
      priceCache.set(lookupKey, prices)
    }
  })

  return priceCache
})

export const getTickersWithPrices = createSelector(
  getTickers,
  getPriceData,
  (state: RootState) => state.subscriptions,
  (tickers, priceCache, subscriptions) => {
    return tickers.map((ticker) => {
      const channelId = Object.keys(subscriptions)
        .map(Number)
        .find((id) => {
          const sub = subscriptions[id]
          return (
            sub?.channel === ChannelTypeEnum.TICKER &&
            sub?.request?.symbol === `t${ticker.currencyPair}`
          )
        })

      const lookupKey = getLookupKey(ticker.currencyPair, DEFAULT_TIMEFRAME)
      const prices = priceCache.get(lookupKey) || []

      return {
        ...ticker,
        prices,
        isStale: channelId ? subscriptions[channelId]?.isStale : false,
      }
    })
  }
)
