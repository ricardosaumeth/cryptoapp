import { useEffect, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import { debounce } from "lodash"
import type { ColDef, GridApi } from "ag-grid-community"
import { useThrottle } from "../../../../core/hooks/useThrottle"
import { priceFormatter, amountFormatter } from "../../../ag-grid/formatter"
import { Container } from "./Book.styled"
import Loading from "../../../../core/components/Loading"
import { type Order } from "../../types/Order"
import Palette from "../../../../theme/style"
import { bidAmountRenderer, askAmountRenderer } from "./renderers"
import Stale from "../../../../core/components/Stale"

const DEBOUNCE_RESIZE_IN_MS = 200

export interface Props {
  orders: { bid: Order; ask: Order }[]
  isStale?: boolean
}

const Book = ({ orders, isStale }: Props) => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>()

  const throttledOrders = useThrottle<{ bid: Order; ask: Order }[]>(orders, 100)
  const columnDefs: ColDef[] = [
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
  ]

  useEffect(() => {
    if (gridApi) {
      gridApi.sizeColumnsToFit()
    }

    const handleResize = debounce(() => {
      if (gridApi) {
        gridApi.sizeColumnsToFit()
      }
    }, DEBOUNCE_RESIZE_IN_MS)

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [gridApi])

  //useGridResize(gridApi);

  return (
    <Container className="ag-theme-quartz-dark">
      {isStale && <Stale />}
      <AgGridReact
        columnDefs={columnDefs}
        rowData={throttledOrders}
        getRowId={({ data }) => [data.bid?.id, data.ask?.id].join("#")}
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
