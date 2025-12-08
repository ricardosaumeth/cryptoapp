import { useMemo } from "react"
import { useSelector } from "react-redux"
import DepthChart from "./DepthChart"
import { getDepth } from "../../selectors"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import type { RootState } from "../../../redux/store"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../../core/transport/selectors"
import { Channel } from "../../../../core/transport/types/Channels"

const DepthContainer = () => {
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)

  const emptyDepth = useMemo(() => ({ bids: [], asks: [] }), [])

  const depth = useSelector((state: RootState) =>
    selectedCurrencyPair ? getDepth(state, selectedCurrencyPair) : emptyDepth
  )

  const subscriptionId = useSelector((state: RootState) => getSubscriptionId(state, Channel.BOOK))
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state, subscriptionId) : false
  )

  return <DepthChart depth={depth} isStale={isStale} />
}

export default DepthContainer
