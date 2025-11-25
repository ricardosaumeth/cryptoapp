import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

interface RefDataState {
  currencyPairs: string[]
}

const initialState: RefDataState = {
  currencyPairs: [],
}

export const refDataLoad = createAsyncThunk("refData/load", async () => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/currencyPairs.json`)
  if (!response.ok) {
    throw new Error("Failed to load currency pairs")
  }
  return response.json()
})

export const refDataSlice = createSlice({
  name: "refData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(refDataLoad.fulfilled, (state, action) => {
      state.currencyPairs = action.payload
    })
  },
})

export default refDataSlice.reducer
