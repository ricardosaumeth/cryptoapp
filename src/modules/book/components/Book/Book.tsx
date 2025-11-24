import { AgGridReact } from "ag-grid-react"
import { type ColDef } from "ag-grid-community"
import { Container } from "./Book.styled"
import { type Order } from "../../types/Order"
import Palette from "../../../../theme/style"

export interface Props {
  orders: { bid: Order; ask: Order }[]
}

const Book = ({ orders }: Props) => {
  const columnDefs: ColDef[] = [
    {
      headerName: "Bid Amount",
      field: "bid.amount",
      width: 100,
      cellStyle: () => ({
        color: Palette.Bid,
      }),
    },
    {
      headerName: "Bid Price",
      field: "bid.price",
      width: 100,
      cellStyle: () => ({
        color: Palette.Bid,
      }),
    },
    {
      headerName: "Ask Price",
      field: "ask.price",
      width: 100,
      cellStyle: () => ({
        color: Palette.Ask,
      }),
    },
    {
      headerName: "Ask Amount",
      field: "ask.amount",
      width: 100,
      cellStyle: () => ({
        color: Palette.Ask,
      }),
      valueFormatter: (params) => (params.value ? Math.abs(params.value).toString() : ""),
    },
  ]

  return (
    <Container className="ag-theme-quartz-dark">
      <AgGridReact
        columnDefs={columnDefs}
        rowData={orders}
        getRowId={(params) => `${params.data.bid.id}-${params.data.ask.id}`}
      />
    </Container>
  )
}

export default Book
