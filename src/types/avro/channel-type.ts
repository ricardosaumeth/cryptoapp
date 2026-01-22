export enum ChannelTypeEnum {
  TRADES = "trades",
  TICKER = "ticker",
  BOOK = "book",
  CANDLES = "candles",
}

// Auto-generated TypeScript types from Avro schema

/* eslint-disable @typescript-eslint/no-namespace */

export type ChannelType = ComCryptoApiTypes.ChannelType

export namespace ComCryptoApiTypes {
  export const ChannelTypeSchema =
    '{"type":"enum","name":"ChannelType","namespace":"com.crypto.api.types","symbols":["TRADES","TICKER","BOOK","CANDLES"]}'
  export const ChannelTypeName = "com.crypto.api.types.ChannelType"
  export type ChannelType = "TRADES" | "TICKER" | "BOOK" | "CANDLES"
}
