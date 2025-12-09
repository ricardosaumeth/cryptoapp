import { useMemo } from "react"
import { useSelector } from "react-redux"
import { getBook } from "../../selectors"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import { type RootState } from "../../../redux/store"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../../core/transport/selectors"
import { Channel } from "../../../../core/transport/types/Channels"
import Book from "./Book"

const BookContainer = () => {
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)
  const emptyOrders = useMemo(() => [], [])

  const orders = useSelector((state: RootState) =>
    selectedCurrencyPair ? getBook(state, selectedCurrencyPair) : emptyOrders
  )
  const subscriptionId = useSelector((state: RootState) =>
    selectedCurrencyPair ? getSubscriptionId(state, Channel.BOOK, selectedCurrencyPair) : undefined
  )
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state, subscriptionId) : false
  )

  return <Book orders={orders} isStale={isStale} />
}

export default BookContainer
