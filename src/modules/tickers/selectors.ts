import { range } from "lodash"
import { createSelector } from "@reduxjs/toolkit"
import { type RootState } from "../redux/store"
import { type Ticker } from "./types/Ticker"
import { getCurrencyPairs } from "../reference-data/selectors"
import { getSelectedCurrencyPair } from "../selection/selectors"
import { candlesSelector } from "../candles/selectors"
import { getSubscriptionId, getSubscriptions } from "../../core/transport/selectors"
import { getValueAt } from "../../core/utils"
import { getLookupKey } from "../candles/utils"
import { Channel } from "../../core/transport/types/Channels"
import { DEFAULT_TIMEFRAME } from "../app/slice"

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

// export const getVisibleCurrencyPairTickers = createSelector(
//   getCurrencyPairs,
//   getSelectedCurrencyPair,
//   (allCurrencyPairs, selectedCurrencyPair) => {
//     let currencyPairs: string[] = []

//     const selectedCurrencyPairIndex = allCurrencyPairs.indexOf(selectedCurrencyPair || "")

//     // Pick a few currency pairs on each side of the selected one
//     if (selectedCurrencyPairIndex >= 0) {
//       currencyPairs = range(selectedCurrencyPairIndex - 2, selectedCurrencyPairIndex + 3).map(
//         (index) => getValueAt(allCurrencyPairs)(index)
//       )
//     }

//     return {
//       currencyPairs,
//       selectedCurrencyPairIndex,
//     }
//   }
// )

// export const getTickersWithPrices = createSelector(
//   getTickers,
//   candlesSelector,
//   getSubscriptionId,
//   getSubscriptions,
//   (tickers, candles, subscribeIdGetter, subscriptions) => {
//     return tickers.map((ticker: { currencyPair: any; }) => {
//       const subscriptionId = subscribeIdGetter(Channel.TICKER, {
//         symbol: `t${ticker.currencyPair}`,
//       });

//       return {
//         ...ticker,
//         prices: (candles[getLookupKey(ticker.currencyPair, "5m")] || []).map(
//           (ticker: { close: any; }) => ticker.close
//         ),
//         isStale: Boolean(
//           subscriptionId ? subscriptions[subscriptionId]!.isStale : false
//         ),
//       };
//     });
//   }
// );

export const getVisibleCurrencyPairTickers = createSelector(
  getCurrencyPairs,
  getSelectedCurrencyPair,
  (allCurrencyPairs, selectedCurrencyPair) => {
    let currencyPairs: string[] = []

    const selectedCurrencyPairIndex = allCurrencyPairs.indexOf(selectedCurrencyPair || "")

    // Pick a few currency pairs on each side of the selected one
    if (selectedCurrencyPairIndex >= 0) {
      currencyPairs = range(selectedCurrencyPairIndex - 2, selectedCurrencyPairIndex + 3).map(
        (index) => getValueAt(allCurrencyPairs)(index)
      )
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
  (tickers, candles) => {
    return tickers.map((ticker) => ({
      ...ticker,
      prices: (candles[getLookupKey(ticker.currencyPair, DEFAULT_TIMEFRAME)] || []).map(
        (ticker) => ticker.close
      ),
    }))
  }
)
