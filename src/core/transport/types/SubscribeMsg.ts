import { ChannelTypeEnum } from "../../../types/avro-types"

export type SubscribeMsg = {
  event: string
  channel: ChannelTypeEnum
  symbol?: string
  prec?: string
  key?: string
}
