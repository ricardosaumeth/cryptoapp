import { useSelector } from "react-redux"
import Trades from "./Trades"
import type { RootState } from "../../redux/store"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../core/transport/selectors"
import { ChannelTypeEnum } from "../../../types/avro-types"
import { getTradesForSelectedPair } from "../selector"
import { getSelectedCurrencyPair } from "../../selection/selectors"

const TradesContainer = () => {
  const trades = useSelector(getTradesForSelectedPair)
  const selectedCurrencyPair = useSelector(getSelectedCurrencyPair)
  const subscriptionId = useSelector(
    selectedCurrencyPair
      ? getSubscriptionId(ChannelTypeEnum.TRADES, { symbol: `t${selectedCurrencyPair}` })
      : () => undefined
  )
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state, subscriptionId) : false
  )

  return <Trades trades={trades} isStale={isStale} />
}

export default TradesContainer
