import { useSelector } from "react-redux"
import { useMemo } from "react"
import { createSelector } from "@reduxjs/toolkit"
import Book from "./Book"
import { getBook } from "../../selectors"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import { type RootState } from "../../../redux/store"

const BookContainer = () => {
  const currencyPair = useSelector(getSelectedCurrencyPair)

  const selectOrders = useMemo(
    () =>
      createSelector([(state: RootState) => state, () => currencyPair], (state, pair) =>
        pair ? getBook(state)(pair) : []
      ),
    [currencyPair]
  )

  const orders = useSelector(selectOrders)

  return <Book orders={orders} />
}

export default BookContainer
