import { AgGridReact } from "ag-grid-react"
import type { ColDef } from "ag-grid-community"
import { priceFormatter, volumeFormatter } from "../../../ag-grid/formatter"
import { type Ticker } from "../../types/Ticker"
import PriceChartRenderer from "./PriceChartRenderer"
import { formatCurrencyPair } from "../../../reference-data/utils"
import PriceRenderer from "./PriceRenderer"
import { Container } from "./Market.styled"
import Palette from "../../../../theme/style"

export interface StateProps {
  tickers: (Ticker & { currencyPair: string; prices: number[] })[]
  selectedCurrencyPair?: string
}

export interface DispatchProps {
  onClick: (currencyPair: string) => void
}

export type Props = StateProps & DispatchProps

const Market = ({ tickers, selectedCurrencyPair, onClick }: Props) => {
  const columnDefs: ColDef[] = [
    {
      headerName: "Ccy",
      field: "currencyPair",
      width: 100,
      valueFormatter: (params) => formatCurrencyPair(params.value),
    },
    {
      headerName: "Bid Price",
      field: "bid",
      width: 95,
      cellStyle: () => ({
        color: Palette.Bid,
        display: "flex",
        "justify-content": "flex-end",
      }),
      type: "numericColumn",
      valueFormatter: priceFormatter,
      cellRenderer: "priceRenderer",
    },
    {
      headerName: "Ask Price",
      field: "ask",
      width: 95,
      cellStyle: () => ({
        color: Palette.Ask,
      }),
      valueFormatter: priceFormatter,
      cellRenderer: "priceRenderer",
    },
    {
      headerName: "Volume",
      field: "volume",
      width: 95,
      valueFormatter: volumeFormatter,
    },
    {
      headerName: "",
      field: "prices",
      cellRenderer: "priceChartRenderer",
      width: 66,
      cellStyle: () => ({
        paddingLeft: 0,
        paddingRight: 0,
      }),
    },
  ]

  const rowClassRules = {
    "selected-row": (params: any) => params.data.currencyPair === selectedCurrencyPair,
  }

  return (
    <Container className="ag-theme-quartz-dark">
      <AgGridReact
        columnDefs={columnDefs}
        rowData={tickers}
        rowClassRules={rowClassRules}
        getRowId={(params) => params.data.currencyPair}
        suppressHorizontalScroll={true}
        onGridReady={(event) => {
          event.api.sizeColumnsToFit()
        }}
        onRowClicked={(event) => {
          onClick(event.data.currencyPair)
        }}
        components={{
          priceChartRenderer: PriceChartRenderer,
          priceRenderer: PriceRenderer,
        }}
      ></AgGridReact>
    </Container>
  )
}

export default Market
