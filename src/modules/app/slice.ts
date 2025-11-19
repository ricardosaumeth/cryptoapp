import { createAsyncThunk } from "@reduxjs/toolkit"
import { connection } from "../redux/store"

export const bootstrapApp = createAsyncThunk("app/bootstrap", async (_, { dispatch }) => {
  console.log("Bootstrap App")
  connection.connect()
  // Dispatch refDataLoad action here when you create it
  // dispatch(refDataLoad())
})

// if needed add it to the store
// const appSlice = createSlice({
//   name: 'app',
//   initialState: {
//     isBootstrapped: false,
//     loading: false,
//   },
//   reducers: {},
// })

//export default appSlice
