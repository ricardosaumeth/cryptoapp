import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "../config/agGridConfig"
import "ag-grid-community/styles/ag-theme-quartz.css"
import "./theme/fonts.css"

const container = document.getElementById("root")!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
