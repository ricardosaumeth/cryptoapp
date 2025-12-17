import { useSelector } from "react-redux"
import Trades from "./Trades"
import type { RootState } from "../../redux/store"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../core/transport/selectors"
import { Channel } from "../../../core/transport/types/Channels"
import { getTradesForSelectedPair } from "../selector"

const TradesContainer = () => {
  const trades = useSelector(getTradesForSelectedPair)
  const subscriptionId = useSelector((state: RootState) => getSubscriptionId(state, Channel.TRADES))
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state, subscriptionId) : false
  )

  return <Trades trades={trades} isStale={isStale} />
}

export default TradesContainer
