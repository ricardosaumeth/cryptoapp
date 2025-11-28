import { useSelector } from "react-redux"
import { useMemo } from "react"
import { createSelector } from "@reduxjs/toolkit"
import { getBook } from "../../selectors"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import { type RootState } from "../../../redux/store"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../../core/transport/selectors"
import { Channel } from "../../../../core/transport/types/Channels"
import Book from "./Book"

const BookContainer = () => {
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)

  const selectOrders = useMemo(
    () =>
      createSelector([(state: RootState) => state, () => selectedCurrencyPair], (state, pair) =>
        pair ? getBook(state)(pair) : []
      ),
    [selectedCurrencyPair]
  )

  const orders = useSelector(selectOrders)
  const subscriptionId = useSelector((state: RootState) => getSubscriptionId(state)(Channel.BOOK))
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state)(subscriptionId) : false
  )

  return <Book orders={orders} isStale={isStale} />
}

export default BookContainer
