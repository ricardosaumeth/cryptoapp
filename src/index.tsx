import React from "react"
import { createRoot } from "react-dom/client"
import "ag-grid-community/styles/ag-theme-quartz.css"
import "./config/agGridConfig"
import App from "./App"
import "./theme/fonts.css"

const container = document.getElementById("root")!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
