import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          vendor: ["react", "react-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          charts: ["highcharts", "highcharts-react-official"],
          grid: ["ag-grid-community", "ag-grid-react"],
          utils: ["lodash", "luxon", "numeral"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
