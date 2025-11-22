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
  grid-gap: 5px;
  padding: 10px;
  box-sizing: border-box;
`

export const Header = styled.div`
  background-color: #4682b4;
  padding: 0 10px;
  grid-area: header;
  color: ${Palette.White};
  position: relative;
  overflow: hidden;
  font-family: FiraSans-MediumItalic;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 70%
    );
    animation: shine 4s infinite;
    pointer-events: none;
  }

  @keyframes shine {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }
`

export const TickersPanel = styled.div`
  grid-area: ticker;
  font-family: FiraSans-MediumItalic;
`

export const TradesPanel = styled.div`
  grid-area: trades;
  font-family: FiraSans-MediumItalic;
`

export const CandlesPanel = styled.div`
  grid-area: candles;
  font-family: FiraSans-MediumItalic;
`

export const ChartPanel = styled.div`
  grid-area: chart;
  font-family: FiraSans-MediumItalic;
`

export const DepthPanel = styled.div`
  grid-area: depth;
  font-family: FiraSans-MediumItalic;
`

export const BookPanel = styled.div`
  grid-area: book;
  font-family: FiraSans-MediumItalic;
`
