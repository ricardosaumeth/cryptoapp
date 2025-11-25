import { ModuleRegistry } from "ag-grid-community"
import {
  ClientSideRowModelModule,
  ValidationModule,
  CellStyleModule,
  RowSelectionModule,
  RowStyleModule,
  ColumnAutoSizeModule,
  RowApiModule,
} from "ag-grid-community"

const AG_GRID_MODULES = [
  ClientSideRowModelModule,
  ValidationModule,
  CellStyleModule,
  RowSelectionModule,
  RowStyleModule,
  ColumnAutoSizeModule,
  RowApiModule,
]

export const initializeAgGrid = () => {
  ModuleRegistry.registerModules(AG_GRID_MODULES)
}

initializeAgGrid()
