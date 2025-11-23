import { useSelector } from "react-redux"
import { useMemo } from "react"
import { createSelector } from "@reduxjs/toolkit"
import Book from "./Book"
import { getBook } from "../selectors"
import { getCurrencyPair } from "../../selection/selectors"
import { type RootState } from "../../redux/store"

const BookContainer = () => {
  const currencyPair = useSelector(getCurrencyPair)
  
  const selectOrders = useMemo(
    () => createSelector(
      [(state: RootState) => state, () => currencyPair],
      (state, pair) => pair ? getBook(state)(pair) : []
    ),
    [currencyPair]
  )
  
  const orders = useSelector(selectOrders)

  return <Book currencyPair={currencyPair} orders={orders} />
}

export default BookContainer
