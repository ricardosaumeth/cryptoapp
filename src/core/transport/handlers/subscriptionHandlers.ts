import { subscribeToChannelAck, unSubscribeToChannelAck, type requestSubscribeToChannelAck } from '../slice'
import { Channel } from '../types/Channels'

export const handleSubscriptionAck = (parsedData: any, store: any) => {
  const { chanId: channelId, channel, event, symbol, key, prec } = parsedData

  const request: requestSubscribeToChannelAck = {
    event,
    channel,
  }

  switch (channel) {
    case Channel.CANDLES:
      request.key = key
      break

    case Channel.BOOK:
      request.prec = prec
      request.symbol = symbol
      delete request.event
      break

    case Channel.TRADES:
    case Channel.TICKER:
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