// Auto-generated TypeScript types from Avro schema

/* eslint-disable @typescript-eslint/no-namespace */

export type AvroType =
  | ComCryptoApiTypes.ChannelType
  | ComCryptoApiWebsocket.SubscribeRequest
  | ComCryptoApiWebsocket.SubscribeResponse
  | ComCryptoApiData.TradeData
  | ComCryptoApiData.TickerData

export namespace ComCryptoApiTypes {
  export const ChannelTypeSchema =
    '{"type":"enum","name":"ChannelType","namespace":"com.crypto.api.types","symbols":["TRADES","TICKER","BOOK","CANDLES"]}'
  export const ChannelTypeName = "com.crypto.api.types.ChannelType"
  export type ChannelType = "TRADES" | "TICKER" | "BOOK" | "CANDLES"
}

export namespace ComCryptoApiWebsocket {
  export const SubscribeRequestSchema =
    '{"type":"record","name":"SubscribeRequest","namespace":"com.crypto.api.websocket","fields":[{"name":"event","type":"string","default":"subscribe"},{"name":"channel","type":"string"},{"name":"symbol","type":["null","string"],"default":null},{"name":"key","type":["null","string"],"default":null},{"name":"prec","type":["null","string"],"default":null}]}'
  export const SubscribeRequestName = "com.crypto.api.websocket.SubscribeRequest"
  export interface SubscribeRequest {
    /**
     * Default: "subscribe"
     */
    event: string
    channel: string
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
  export const SubscribeResponseSchema =
    '{"type":"record","name":"SubscribeResponse","namespace":"com.crypto.api.websocket","fields":[{"name":"event","type":"string","default":"subscribed"},{"name":"channel","type":"string"},{"name":"chanId","type":"int"},{"name":"symbol","type":["null","string"],"default":null},{"name":"key","type":["null","string"],"default":null},{"name":"prec","type":["null","string"],"default":null}]}'
  export const SubscribeResponseName = "com.crypto.api.websocket.SubscribeResponse"
  export interface SubscribeResponse {
    /**
     * Default: "subscribed"
     */
    event: string
    channel: string
    chanId: number
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

export namespace ComCryptoApiData {
  export const TradeDataSchema =
    '{"type":"record","name":"TradeData","namespace":"com.crypto.api.data","fields":[{"name":"channel_id","type":"int"},{"name":"event_type","type":"string","default":"te"},{"name":"trade_id","type":"int"},{"name":"timestamp","type":"long"},{"name":"amount","type":"double"},{"name":"price","type":"double"}]}'
  export const TradeDataName = "com.crypto.api.data.TradeData"
  export interface TradeData {
    channel_id: number
    /**
     * Default: "te"
     */
    event_type: string
    trade_id: number
    timestamp: number
    amount: number
    price: number
  }
  export const TickerDataSchema =
    '{"type":"record","name":"TickerData","namespace":"com.crypto.api.data","fields":[{"name":"channel_id","type":"int"},{"name":"bid","type":"double"},{"name":"bid_size","type":"double"},{"name":"ask","type":"double"},{"name":"ask_size","type":"double"},{"name":"daily_change","type":"double"},{"name":"daily_change_rel","type":"double"},{"name":"last_price","type":"double"},{"name":"volume","type":"double"},{"name":"high","type":"double"},{"name":"low","type":"double"}]}'
  export const TickerDataName = "com.crypto.api.data.TickerData"
  export interface TickerData {
    channel_id: number
    bid: number
    bid_size: number
    ask: number
    ask_size: number
    daily_change: number
    daily_change_rel: number
    last_price: number
    volume: number
    high: number
    low: number
  }
}
