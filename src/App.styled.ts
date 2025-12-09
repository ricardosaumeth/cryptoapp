import styled from "styled-components"
import Palette from "./theme/style"

export const Container = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${Palette.BackgroundColor};
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`

export const Content = styled.div`
  display: grid;
  grid-gap: 5px;
  padding: 5px 10px;
  width: 100%;
  height: 100%;
  overflow: hidden;

  @media only screen and (min-width: 1200px) {
    grid-template-rows: 40px 70px 1fr 250px 30px;
    grid-template-columns: 450px 1fr 1fr;
    grid-template-areas:
      "header header header"
      "tickers tickers tickers"
      "market candles candles"
      "trades book depth"
      "footer footer footer";
  }

  @media only screen and (min-width: 600px) and (max-width: 1200px) {
    grid-template-rows: 40px 70px 1fr 1fr 30px;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "header header"
      "market book"
      "market book"
      "trades depth"
      "footer footer";

    .tickers,
    .candles-chart {
      display: none;
    }
  }

  @media only screen and (max-width: 600px) {
    grid-template-rows: 40px calc(100% - 90px) 30px;
    grid-template-columns: calc(100% - 20px);
    grid-template-areas:
      "header"
      "market"
      "footer";

    .candles-chart {
      display: none;
    }
  }
`

export const Header = styled.div`
  background-color: ${Palette.SteelBlue};
  grid-area: header;
  color: ${Palette.White};
  position: relative;
  overflow: hidden; // keeps animation inside this component
  font-family: FiraSans-MediumItalic;
  padding: 0 0 0 10px;
  font-size: 28px;

  display: flex;
  justify-content: start;
  align-items: center;

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
  grid-area: tickers;
  overflow: hidden;
  font-family: FiraSans-Medium;
`

export const MarketPanel = styled.div`
  grid-area: market;
  font-family: FiraSans-Medium;
`

export const TradesPanel = styled.div`
  grid-area: trades;
  font-family: FiraSans-Medium;
`

export const CandlesPanel = styled.div`
  grid-area: candles;
  font-family: FiraSans-Medium;
`

export const BookPanel = styled.div`
  grid-area: book;
  font-family: FiraSans-Medium;
`

export const DepthPanel = styled.div`
  grid-area: depth;
  font-family: FiraSans-Medium;
`

export const Footer = styled.div`
  grid-area: footer;
  font-family: FiraSans-Medium;
  padding: 0 10px;
  display: flex;
  justify-content: flex-end;
`
