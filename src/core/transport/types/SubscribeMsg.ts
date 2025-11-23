import type { ChannelTypes } from "./Channels"

export type SubscribeMsg = {
  event: "subscribe"
  channel: ChannelTypes
  symbol?: string
  prec?: string
  key?: string
}
