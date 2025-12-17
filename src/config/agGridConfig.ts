import {
  ClientSideRowModelModule,
  ValidationModule,
  CellStyleModule,
  RowStyleModule,
  ColumnAutoSizeModule,
  RowApiModule,
  LocaleModule,
  ModuleRegistry,
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
