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
  grid-template-rows: 40px 70px 1fr 250px;
  grid-template-columns: 400px 1fr 400px;
  grid-template-areas:
    "header header header"
    "tickers tickers tickers"
    "market candles candles"
    "trades book depth"
    "footer footer footer";
  grid-gap: 5px;
  padding: 5px 10px;
  box-sizing: border-box;

  @media only screen and (min-width: 1200px) {
    grid-template-rows: 40px 70px 1fr 250px 50px;
    grid-template-columns: 400px 400px 1fr;
    grid-template-areas:
      "header header header"
      "tickers tickers tickers"
      "market candles candles"
      "trades book depth"
      "footer footer footer";
  }

  @media only screen and (min-width: 600px) and (max-width: 1200px) {
    grid-template-rows: 40px 70px 1fr 250px 50px;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "header header"
      "tickers tickers"
      "trades book"
      "trades depth"
      "footer footer";

    .candles-chart {
      display: none;
    }
  }

  @media only screen and (max-width: 600px) {
    grid-template-rows: 40px calc(100% - 90px) 50px;
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "tickers"
      "footer";

    .candles-chart {
      display: none;
    }
  }
`

export const Header = styled.div`
  background-color: #4682b4;
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
  overflow: auto;
`

export const MarketPanel = styled.div`
  grid-area: market;
`

export const TradesPanel = styled.div`
  grid-area: trades;
`

export const CandlesPanel = styled.div`
  grid-area: candles;
`

export const BookPanel = styled.div`
  grid-area: book;
`

export const DepthPanel = styled.div`
  grid-area: depth;
`

export const Footer = styled.div`
  grid-area: footer;
`
