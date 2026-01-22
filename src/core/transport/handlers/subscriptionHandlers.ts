import {
  subscribeToChannelAck,
  unSubscribeToChannelAck,
  type requestSubscribeToChannelAck,
} from "../slice"
import { ChannelTypeEnum } from "../../../types/avro-types"

export const handleSubscriptionAck = (parsedData: any, store: any) => {
  const { chanId: channelId, channel, event, symbol, key, prec } = parsedData

  const request: requestSubscribeToChannelAck = {
    event,
    channel,
  }

  switch (channel) {
    case ChannelTypeEnum.CANDLES:
      request.key = key
      break

    case ChannelTypeEnum.BOOK:
      request.prec = prec
      request.symbol = symbol
      delete request.event
      break

    case ChannelTypeEnum.TRADES:
    case ChannelTypeEnum.TICKER:
      request.symbol = symbol
      break

    default:
      console.warn("Unhandled channel:", channel)
  }

  store.dispatch(
    subscribeToChannelAck({
      channelId,
      channel,
      request,
    })
  )
}

export const handleUnSubscriptionAck = (parsedData: any, store: any) => {
  const { chanId: channelId } = parsedData
  store.dispatch(unSubscribeToChannelAck({ channelId }))
}
