import { useMemo } from "react"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { type AppDispatch, type RootState } from "../../../../modules/redux/store"
import { getTicker } from "./../../selectors"
import { selectCurrencyPair } from "../../../selection/slice"
import { getSelectedCurrencyPair } from "../../../selection/selectors"
import Ticker from "./Ticker"
import { getIsSubscriptionStale, getSubscriptionId } from "../../../../core/transport/selectors"
import { Channel } from "../../../../core/transport/types/Channels"

export interface ContainerProps {
  currencyPair: string
}

const TickerContainer = ({ currencyPair }: ContainerProps) => {
  const dispatch = useDispatch<AppDispatch>()

  const ticker = useSelector(getTicker)(currencyPair)
  const { lastPrice, dailyChange, dailyChangeRelative } = ticker || {}
  const selectCurrencyPairMemo = useMemo(() => getSelectedCurrencyPair, [])

  const selectedCurrencyPair = useSelector(selectCurrencyPairMemo)
  const subscriptionId = useSelector((state: RootState) => getSubscriptionId(state, Channel.TICKER))
  const isStale = useSelector((state: RootState) =>
    subscriptionId ? getIsSubscriptionStale(state, subscriptionId) : false
  )

  return (
    <Ticker
      currencyPair={currencyPair}
      lastPrice={lastPrice!}
      dailyChange={dailyChange!}
      dailyChangeRelative={dailyChangeRelative!}
      onClick={() => dispatch(selectCurrencyPair({ currencyPair }))}
      isActive={selectedCurrencyPair === currencyPair}
      isStale={isStale}
    />
  )
}

export default TickerContainer
