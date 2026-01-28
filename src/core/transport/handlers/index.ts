import { ChannelTypeEnum } from "../../../types/avro-types"

import { handleTradesData } from "./tradesHandler"
import { handleTickerData } from "./tickerHandler"
import { handleCandlesData } from "./candlesHandler"
import { handleBookData } from "./bookHandler"

export { handleSubscriptionAck, handleUnSubscriptionAck } from "./subscriptionHandlers"
export { handleTradesData } from "./tradesHandler"
export { handleTickerData } from "./tickerHandler"
export { handleCandlesData } from "./candlesHandler"
export { handleBookData } from "./bookHandler"

export const handlers = {
  [ChannelTypeEnum.TRADES]: handleTradesData,
  [ChannelTypeEnum.TICKER]: handleTickerData,
  [ChannelTypeEnum.BOOK]: handleBookData,
  [ChannelTypeEnum.CANDLES]: handleCandlesData,
}
