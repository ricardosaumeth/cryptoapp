import { useEffect, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridApi } from "ag-grid-community"
import { priceFormatter, volumeFormatter } from "../../../ag-grid/formatter"
import { type Ticker } from "../../types/Ticker"
import { formatCurrencyPair } from "../../../reference-data/utils"
import { Container } from "./Market.styled"
import Palette from "../../../../theme/style"

export interface StateProps {
  tickers: (Ticker & { currencyPair: string })[]
  selectedCurrencyPair?: string
}

export interface DispatchProps {
  onClick: (currencyPair: string) => void
}

export type Props = StateProps & DispatchProps

const Market = ({ tickers, selectedCurrencyPair, onClick }: Props) => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>()

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
      width: 90,
      cellStyle: () => ({
        color: Palette.Bid,
      }),
      type: "numericColumn",
      valueFormatter: priceFormatter,
    },
    {
      headerName: "Ask Price",
      field: "ask",
      width: 90,
      cellStyle: () => ({
        color: Palette.Ask,
      }),
      valueFormatter: priceFormatter,
    },
    {
      headerName: "Volume",
      field: "volume",
      width: 90,
      valueFormatter: volumeFormatter,
    },
  ]

  const rowClassRules = {
    "selected-row": (params: any) => params.node.isSelected(),
  }

  useEffect(() => {
    if (gridApi) {
      gridApi.forEachNode(function (node) {
        node.setSelected(node.data.currencyPair === selectedCurrencyPair)
      })
      gridApi.redrawRows()
    }
  }, [gridApi, selectedCurrencyPair])

  return (
    <Container className="ag-theme-quartz-dark">
      <AgGridReact
        columnDefs={columnDefs}
        rowData={tickers}
        rowClassRules={rowClassRules}
        getRowId={(params) => params.data.currencyPair}
        onGridReady={(event) => {
          setGridApi(event.api)
          event.api.sizeColumnsToFit()
        }}
        rowSelection={"single"}
        onRowClicked={(event) => {
          onClick(event.data.currencyPair)
        }}
      ></AgGridReact>
    </Container>
  )
}

export default Market
