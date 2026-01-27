import { useState, useEffect, memo } from "react"
import { useDispatch } from "react-redux"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridApi, IRowNode } from "ag-grid-community"
import { priceFormatter, volumeFormatter } from "../../../ag-grid/formatter"
import { type Ticker } from "../../types/Ticker"
import { selectCurrencyPair } from "../../../selection/slice"
import PriceChartRenderer from "./PriceChartRenderer"
import { formatCurrencyPair } from "../../../reference-data/utils"
import Loading from "../../../../core/components/Loading"
import { useGridResize } from "../../../../core/hooks/useGridResize"
import { useRenderTracker } from "../../../../core/hooks/useRenderTracker"
import PriceRenderer from "./PriceRenderer"
import { Container } from "./Market.styled"
import Palette from "../../../../theme/style"
import type { AppDispatch } from "src/modules/redux/store"

export interface Props {
  tickers: (Ticker & { currencyPair: string; prices: number[] })[]
  selectedCurrencyPair?: string
}

const Market = memo(
  ({ tickers, selectedCurrencyPair }: Props) => {
    useRenderTracker("Market")
    const dispatch = useDispatch<AppDispatch>()
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
        width: 95,
        cellStyle: () => ({
          color: Palette.Bid,
          display: "flex",
          justifiedContent: "flex-end",
        }),
        type: "numericColumn",
        valueFormatter: priceFormatter,
        cellRenderer: "priceRenderer",
      },
      {
        headerName: "Ask Price",
        field: "ask",
        width: 95,
        cellStyle: () => ({
          color: Palette.Ask,
        }),
        valueFormatter: priceFormatter,
        cellRenderer: "priceRenderer",
      },
      {
        headerName: "Volume",
        field: "volume",
        width: 95,
        valueFormatter: volumeFormatter,
      },
      {
        headerName: "",
        field: "prices",
        cellRenderer: "priceChartRenderer",
        valueFormatter: () => "",
        width: 66,
        cellStyle: () => ({
          paddingLeft: 0,
          paddingRight: 0,
        }),
      },
    ]

    useEffect(() => {
      if (gridApi) {
        const nodesToRefresh: IRowNode[] = []
        gridApi.forEachNode(function (node) {
          const shouldSelect = node.data.currencyPair === selectedCurrencyPair
          if (node.isSelected() || shouldSelect) {
            nodesToRefresh.push(node)
          }
          node.setSelected(shouldSelect)
        })
        gridApi.redrawRows({
          rowNodes: nodesToRefresh,
        })
      }
    }, [gridApi, selectedCurrencyPair])

    useGridResize(gridApi)

    const rowClassRules = {
      "selected-row": (params: any) => params.data.currencyPair === selectedCurrencyPair,
      "stale-row": (params: any) => params.data.isStale,
    }

    return (
      <Container className="ag-theme-quartz-dark">
        <AgGridReact
          columnDefs={columnDefs}
          rowData={tickers}
          rowClassRules={rowClassRules}
          getRowId={(params) => params.data.currencyPair}
          suppressHorizontalScroll={true}
          suppressAnimationFrame={false}
          onGridReady={(event) => {
            setGridApi(event.api)
          }}
          onRowClicked={(event) => {
            dispatch(selectCurrencyPair({ currencyPair: event.data.currencyPair }))
          }}
          noRowsOverlayComponent={"customLoadingOverlay"}
          components={{
            priceChartRenderer: PriceChartRenderer,
            priceRenderer: PriceRenderer,
            customLoadingOverlay: Loading,
          }}
        ></AgGridReact>
      </Container>
    )
  },
  (prevProps, nextProps) => {
    if (prevProps.selectedCurrencyPair !== nextProps.selectedCurrencyPair) {
      return false
    }

    if (prevProps.tickers.length !== nextProps.tickers.length) {
      return false
    }

    // Only check if ticker data actually changed (not prices array reference)
    for (let i = 0; i < prevProps.tickers.length; i++) {
      const prev = prevProps.tickers[i]
      const next = nextProps.tickers[i]

      if (
        prev!.currencyPair !== next!.currencyPair ||
        prev!.bid !== next!.bid ||
        prev!.ask !== next!.ask ||
        prev!.volume !== next!.volume
      ) {
        return false
      }
    }

    return true
  }
)

Market.displayName = "Market"

export default Market
