import type { ChannelTypes } from "./Channels"

export type SubscribeMsg = {
  event: string
  channel: ChannelTypes
  symbol?: string
  prec?: string
  key?: string
}
