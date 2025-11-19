import { useMemo } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef } from "ag-grid-community"
import { DateTime } from "luxon"
import type { Trade } from "../types/Trade"
import { Container } from "./Trades.styled"
import theme from "../../../theme/style"

export interface Props {
  trades: Trade[]
}

const Trades = ({ trades }: Props) => {
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
            color: params.value < 0 ? theme.SELL : theme.BUY,
          }
        },
      },
      {
        headerName: "Time",
        field: "timestamp",
        sort: "desc",
        width: 90,
        valueFormatter: (params) =>
          DateTime.fromMillis(params.value).toLocaleString(DateTime.TIME_24_WITH_SECONDS),
      },
      {
        headerName: "Price",
        field: "price",
      },
    ],
    []
  )

  return (
    <Container className="ag-theme-quartz-dark" style={{ height: 400, width: "100%" }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={trades}
        getRowId={(params) => `${params.data.id}`}
      />
    </Container>
  )
}

export default Trades
