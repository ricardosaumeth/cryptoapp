import { useState, useMemo, useCallback } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridApi } from "ag-grid-community"
import { priceFormatter, amountFormatter } from "../../../ag-grid/formatter"
import { Container } from "./Book.styled"
import Loading from "../../../../core/components/Loading"
import { type Order } from "../../types/Order"
import Palette from "../../../../theme/style"
import { bidAmountRenderer, askAmountRenderer } from "./renderers"
import Stale from "../../../../core/components/Stale"
import { useGridResize } from "../../../../core/hooks/useGridResize"

export interface Props {
  orders: { bid: Order; ask: Order }[]
  isStale?: boolean
}

const Book = ({ orders, isStale }: Props) => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>()
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Bid Amount",
        field: "bid.amount",
        width: 145,
        valueFormatter: amountFormatter,
        cellRenderer: bidAmountRenderer,
      },
      {
        headerName: "Bid Price",
        field: "bid.price",
        width: 125,
        cellStyle: () => ({
          color: Palette.Bid,
        }),
        type: "numericColumn",
        valueFormatter: priceFormatter,
      },
      {
        headerName: "Ask Price",
        field: "ask.price",
        width: 125,
        cellStyle: () => ({
          color: Palette.Ask,
        }),
        valueFormatter: priceFormatter,
      },
      {
        headerName: "Ask Amount",
        field: "ask.amount",
        width: 145,
        valueFormatter: (params) => amountFormatter({ value: Math.abs(params.value) }),
        cellRenderer: askAmountRenderer,
      },
    ],
    []
  )

  useGridResize(gridApi)

  const getRowId = useCallback(({ data }: any) => `${data.id}`, [])

  return (
    <Container className="ag-theme-quartz-dark">
      {isStale && <Stale />}
      <AgGridReact
        columnDefs={columnDefs}
        rowData={orders}
        getRowId={getRowId}
        suppressHorizontalScroll={true}
        gridOptions={{ localeText: { noRowsToShow: "Loading..." } }}
        onGridReady={(event) => {
          setGridApi(event.api)
        }}
        noRowsOverlayComponent={"customLoadingOverlay"}
        components={{
          customLoadingOverlay: Loading,
        }}
      ></AgGridReact>
    </Container>
  )
}

export default Book
