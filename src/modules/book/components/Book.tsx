import { AgGridReact } from "ag-grid-react"
import { type ColDef } from "ag-grid-community"
import { Container, Header } from "./Book.styled"
import { formatCurrencyPair } from "../../reference-data/utils"
import { type Order } from "../types/Order"
import Palette from "../../../theme/style"

export interface Props {
  currencyPair?: string
  orders: { bid: Order; ask: Order }[]
}

const Book = ({ orders, currencyPair }: Props) => {
  const columnDefs: ColDef[] = [
    {
      headerName: "Bid Amount",
      field: "bid.amount",

      cellStyle: () => ({
        color: Palette.Bid,
      }),
    },
    {
      headerName: "Bid Price",
      field: "bid.price",
      cellStyle: () => ({
        color: Palette.Bid,
      }),
    },
    {
      headerName: "Ask Price",
      field: "ask.price",
      cellStyle: () => ({
        color: Palette.Ask,
      }),
    },
    {
      headerName: "Ask Amount",
      field: "ask.amount",
      cellStyle: () => ({
        color: Palette.Ask,
      }),
      valueFormatter: (params) => (params.value ? Math.abs(params.value).toString() : ""),
    },
  ]

  return (
    <Container className="ag-theme-quartz-dark">
      <Header>
        <span>Book - {currencyPair && formatCurrencyPair(currencyPair)}</span>
      </Header>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={orders}
        getRowId={(params) => [params.data.bid?.id, params.data.ask?.id].join("#")}
      />
    </Container>
  )
}

export default Book
