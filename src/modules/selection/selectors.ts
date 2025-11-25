import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../redux/store"

const selectionSelector = (state: RootState) => state.selection

export const getSelectedCurrencyPair = createSelector(
  selectionSelector,
  (selection) => selection.currencyPair
)
