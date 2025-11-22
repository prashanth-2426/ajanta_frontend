// src/store/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch users
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axios.get("/apis/users", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("USERTOKEN")}`,
    },
  });
  return response.data;
});

const usersSlice = createSlice({
  name: "users",
  initialState: {
    data: [],
    loading: false,
    error: null,
    loadedOnce: false,
  },
  reducers: {
    clearUsers: (state) => {
      state.data = [];
      state.loadedOnce = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.loadedOnce = true;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearUsers } = usersSlice.actions;
export default usersSlice.reducer;
