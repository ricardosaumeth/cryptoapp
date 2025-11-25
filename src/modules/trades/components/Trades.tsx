import { useMemo, memo } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef } from "ag-grid-community"
import type { Trade } from "../types/Trade"
import { Container } from "./Trades.styled"
import Palette from "../../../theme/style"
import { useThrottle } from "../../../core/hooks/useThrottle"
// import { useGridResize } from "../../../core/hooks/useGridResize";
// import Loading from "../../../core/components/Loading";
import { amountFormatter, priceFormatter, timeFormatter } from "../../ag-grid/formatter"

export interface Props {
  trades: Trade[]
}

const Trades = memo(({ trades }: Props) => {
  const throttledTrades = useThrottle<Trade[]>(trades, 500)
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
        valueFormatter: (params) => amountFormatter({ value: Math.abs(params.value) }),
      },
      {
        headerName: "Price",
        field: "price",
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
        valueFormatter: timeFormatter,
        cellStyle: () => ({
          color: Palette.LightGray,
        }),
      },
    ],
    []
  )

  //useGridResize(gridApi);

  const getRowId = useMemo(() => (params: any) => `${params.data.id}`, [])

  return (
    <Container className="ag-theme-quartz-dark">
      {/* <AgGridReact
        columnDefs={columnDefs}
        rowData={throttledTrades}
        getRowId={getRowId}
        animateRows={false}
        onGridReady={event => event.api.sizeColumnsToFit()}
      /> */}
      {/* {isStale && <Stale />} */}
      <AgGridReact
        columnDefs={columnDefs}
        rowData={throttledTrades}
        getRowId={getRowId}
        onGridReady={(event) => {
          //setGridApi(event.api);
        }}
        noRowsOverlayComponent={"customLoadingOverlay"}
        //frameworkComponents={{
        //customLoadingOverlay: Loading,
        //}}
      ></AgGridReact>
    </Container>
  )
})

export default Trades
