import { useState, useMemo, useCallback, memo } from "react"
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
import { useThrottle } from "../../../../core/hooks/useThrottle"
import { useRenderTracker } from "../../../../core/hooks/useRenderTracker"
import { ChannelTypeEnum } from "../../../../types/avro-types"

export interface Props {
  orders: { bid: Order; ask: Order }[]
  isStale?: boolean
}

const Book = memo(
  ({ orders, isStale }: Props) => {
    useRenderTracker(ChannelTypeEnum.BOOK)
    const throttledOrders = useThrottle<{ bid: Order; ask: Order }[]>(orders, 100)
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
          rowData={throttledOrders}
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
  },
  (prevProps, nextProps) => {
    // Skip re-render if stale status is the same and orders data is equivalent
    if (prevProps.isStale !== nextProps.isStale) return false
    if (prevProps.orders.length !== nextProps.orders.length) return false

    // Compare first few orders for meaningful changes (price/amount)
    for (let i = 0; i < Math.min(10, prevProps.orders.length); i++) {
      const prev = prevProps.orders[i]
      const next = nextProps.orders[i]

      if (
        prev?.bid?.price !== next?.bid?.price ||
        prev?.bid?.amount !== next?.bid?.amount ||
        prev?.ask?.price !== next?.ask?.price ||
        prev?.ask?.amount !== next?.ask?.amount
      ) {
        return false
      }
    }

    return true // Skip re-render
  }
)

export default Book
