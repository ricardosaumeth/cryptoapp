import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  ValidationModule,
  CellStyleModule,
} from "ag-grid-community"
import "ag-grid-community/styles/ag-theme-quartz.css"
import "./theme/fonts.css"

ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule, CellStyleModule])

const container = document.getElementById("root")!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
