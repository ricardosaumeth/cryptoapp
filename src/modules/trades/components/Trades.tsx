import { useMemo, memo } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef } from "ag-grid-community"
import { DateTime } from "luxon"
import type { Trade } from "../types/Trade"
import { Container, Header } from "./Trades.styled"
import Palette from "../../../theme/style"
import { formatCurrencyPair } from "../../reference-data/utils"

export interface Props {
  trades: Trade[]
  currencyPair?: string
}

const Trades = memo(({ trades, currencyPair }: Props) => {
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Id",
        field: "id",
        hide: true,
      },
      {
        headerName: "Amount",
        field: "amount",
        width: 120,
        valueFormatter: (params) => Math.abs(params.value).toString(),
        cellStyle: (params) => {
          return {
            color: params.value < 0 ? Palette.Ask : Palette.Bid,
          }
        },
      },
      {
        headerName: "Price",
        field: "price",
      },
      {
        headerName: "Time",
        field: "timestamp",
        sort: "desc",
        width: 90,
        valueFormatter: (params) =>
          DateTime.fromMillis(params.value).toLocaleString(DateTime.TIME_24_WITH_SECONDS),
        cellStyle: () => ({
          color: "rgba(245, 245, 245, 0.64)",
        }),
      },
    ],
    []
  )

  const getRowId = useMemo(() => (params: any) => `${params.data.id}`, [])

  return (
    <Container className="ag-theme-quartz-dark">
      <Header>
        <span>Trades - </span>
        {currencyPair && formatCurrencyPair(currencyPair)}
      </Header>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={trades}
        getRowId={getRowId}
        animateRows={false}
      />
    </Container>
  )
})

export default Trades
