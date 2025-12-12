import { useMemo, memo, useState, useCallback } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridApi } from "ag-grid-community"
import type { Trade } from "../types/Trade"
import { Container } from "./Trades.styled"
import Palette from "../../../theme/style"
import { useThrottle } from "../../../core/hooks/useThrottle"
import Stale from "../../../core/components/Stale"
import { useGridResize } from "../../../core/hooks/useGridResize"
import Loading from "../../../core/components/Loading"
import { amountFormatter, priceFormatter, timeFormatter } from "../../ag-grid/formatter"

export interface Props {
  trades: Trade[]
  isStale: boolean
}

const Trades = memo(({ trades, isStale }: Props) => {
  const throttledTrades = useThrottle<Trade[]>(trades, 500)
  const [gridApi, setGridApi] = useState<GridApi | undefined>()
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
        width: 160,
        valueFormatter: (params) => amountFormatter({ value: Math.abs(params.value) }),
      },
      {
        headerName: "Price",
        field: "price",
        width: 160,
        cellStyle: (params) => {
          return {
            color: params.value < 0 ? Palette.Ask : Palette.Bid,
          }
        },
        valueFormatter: priceFormatter,
      },
      {
        headerName: "Time",
        field: "timestamp",
        width: 160,
        valueFormatter: timeFormatter,
        cellStyle: () => ({
          color: Palette.LightGray,
        }),
      },
    ],
    []
  )

  useGridResize(gridApi)

  const getRowId = useCallback((params: any) => `${params.data.id}`, [])

  return (
    <Container className="ag-theme-quartz-dark">
      {isStale && <Stale />}
      <AgGridReact
        columnDefs={columnDefs}
        rowData={throttledTrades}
        getRowId={getRowId}
        suppressHorizontalScroll={true}
        gridOptions={{ localeText: { noRowsToShow: "Loading..." } }}
        noRowsOverlayComponent={"customLoadingOverlay"}
        components={{
          customLoadingOverlay: Loading,
        }}
        onGridReady={(event) => {
          setGridApi(event.api)
        }}
      ></AgGridReact>
    </Container>
  )
})

export default Trades
