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
import { Channel } from "../../core/transport/types/Channels"

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

export const getTickersWithPrices = createSelector(
  getTickers,
  candlesSelector,
  (state: RootState) => state.subscriptions,
  (tickers, candles, subscriptions) => {
    return tickers.map((ticker) => {
      const channelId = Object.keys(subscriptions)
        .map(Number)
        .find((id) => {
          const sub = subscriptions[id]
          return (
            sub?.channel === Channel.TICKER && sub?.request?.symbol === `t${ticker.currencyPair}`
          )
        })

      return {
        ...ticker,
        prices: (candles[getLookupKey(ticker.currencyPair, DEFAULT_TIMEFRAME)] || []).map(
          (candle) => candle.close
        ),
        isStale: channelId ? subscriptions[channelId]?.isStale : false,
      }
    })
  }
)
