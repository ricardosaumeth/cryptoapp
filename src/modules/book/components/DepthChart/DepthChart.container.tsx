import { useMemo } from "react"
import { useSelector } from "react-redux"
import DepthChart from "./DepthChart"
import { getDepth } from "../../selectors"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import type { RootState } from "../../../redux/store"
import { createSelector } from "@reduxjs/toolkit"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../../core/transport/selectors"
import { Channel } from "../../../../core/transport/types/Channels"

const DepthContainer = () => {
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)

  const emptyDepth = useMemo(() => ({ bids: [], asks: [] }), [])

  const selectDepth = createSelector(
    [(state: RootState) => state, (_: RootState, pair: string | undefined) => pair],
    (state, pair) => (pair ? getDepth(state)(pair) : emptyDepth)
  )

  const selectDepthMemo = useMemo(
    () => (state: RootState) => selectDepth(state, selectedCurrencyPair),
    [selectedCurrencyPair]
  )

  const depth = useSelector(selectDepthMemo)
  const subscriptionId = useSelector((state: RootState) => getSubscriptionId(state)(Channel.BOOK))
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state)(subscriptionId) : false
  )

  return <DepthChart depth={depth} isStale={isStale} />
}

export default DepthContainer
