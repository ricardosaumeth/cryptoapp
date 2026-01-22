// Auto-generated TypeScript types from Avro schema

/* eslint-disable @typescript-eslint/no-namespace */

export type SubscribeRequest = ComCryptoApiWebsocket.SubscribeRequest

export namespace ComCryptoApiWebsocket {
  export const ChannelTypeSchema =
    '{"type":"enum","name":"ChannelType","symbols":["TRADES","TICKER","BOOK","CANDLES"]}'
  export const ChannelTypeName = "com.crypto.api.websocket.ChannelType"
  export type ChannelType = "TRADES" | "TICKER" | "BOOK" | "CANDLES"
  export const SubscribeRequestSchema =
    '{"type":"record","name":"SubscribeRequest","namespace":"com.crypto.api.websocket","fields":[{"name":"event","type":"string","default":"subscribe"},{"name":"channel","type":{"type":"enum","name":"ChannelType","symbols":["TRADES","TICKER","BOOK","CANDLES"]}},{"name":"symbol","type":["null","string"],"default":null},{"name":"key","type":["null","string"],"default":null},{"name":"prec","type":["null","string"],"default":null}]}'
  export const SubscribeRequestName = "com.crypto.api.websocket.SubscribeRequest"
  export interface SubscribeRequest {
    /**
     * Default: "subscribe"
     */
    event: string
    channel: ComCryptoApiWebsocket.ChannelType
    /**
     * Default: null
     */
    symbol: null | string
    /**
     * Default: null
     */
    key: null | string
    /**
     * Default: null
     */
    prec: null | string
  }
}
