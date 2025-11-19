import { createAsyncThunk } from "@reduxjs/toolkit"
import { connection } from "../redux/store"
import { refDataLoad } from "../reference-data/slice"

export const bootstrapApp = createAsyncThunk("app/bootstrap", async (_, { dispatch }) => {
  console.log("Bootstrap App")
  connection.connect()
  dispatch(refDataLoad())
})

