import { updateTicker } from "../../../modules/tickers/slice"

export const handleTickerData = (parsedData: any[], subscription: any, dispatch: any) => {
  dispatch(updateTicker({ symbol: subscription.request.symbol, data: parsedData }))
}
