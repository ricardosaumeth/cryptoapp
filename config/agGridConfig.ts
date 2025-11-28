import { ModuleRegistry } from "ag-grid-community"
import {
  ClientSideRowModelModule,
  ValidationModule,
  CellStyleModule,
  RowStyleModule,
  ColumnAutoSizeModule,
  RowApiModule,
  LocaleModule,
} from "ag-grid-community"

const AG_GRID_MODULES = [
  ClientSideRowModelModule,
  ValidationModule,
  CellStyleModule,
  RowStyleModule,
  ColumnAutoSizeModule,
  RowApiModule,
  LocaleModule,
]

export const initializeAgGrid = () => {
  ModuleRegistry.registerModules(AG_GRID_MODULES)
}

initializeAgGrid()
