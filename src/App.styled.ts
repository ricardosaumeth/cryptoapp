import styled from "styled-components"
import Palette from "./theme/style"

export const Container = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${Palette.BackgroundColor};
  display: grid;
  grid-template-rows: 100px 100px 1fr 1fr;
  grid-template-columns: 400px 1fr 1fr;
  grid-template-areas:
    "header header header"
    "ticker ticker ticker"
    "trades candles candles"
    "trades depth book";
  padding: 10px;
  box-sizing: border-box;
`

export const Header = styled.div`
  grid-area: header;
  color: ${Palette.White};
`

export const TickersPanel = styled.div`
  grid-area: ticker;
`

export const TradesPanel = styled.div`
  grid-area: trades;
`

export const CandlesPanel = styled.div`
  grid-area: candles;
`

export const ChartPanel = styled.div`
  grid-area: chart;
`

export const DepthPanel = styled.div`
  grid-area: depth;
`

export const BookPanel = styled.div`
  grid-area: book;
`
