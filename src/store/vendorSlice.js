// src/store/vendorSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch vendors
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async () => {
    const response = await axios.get("/apis/vendors", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("USERTOKEN")}`,
      },
    });
    return response.data;
  }
);

const vendorSlice = createSlice({
  name: "vendors",
  initialState: {
    data: [],
    loading: false,
    error: null,
    loadedOnce: false,
  },
  reducers: {
    clearVendors: (state) => {
      state.data = [];
      state.loadedOnce = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.loadedOnce = true;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearVendors } = vendorSlice.actions;
export default vendorSlice.reducer;
