import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toast: {},
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    toastSuccess: (state, action) => {
      state.toast = {
        severity: "success",
        summary: "Success",
        detail: "Success",
        life: 3000,
        ...action.payload,
      };
    },
    toastError: (state, action) => {
      state.toast = {
        severity: "error",
        summary: "Error",
        detail: "Failed",
        life: 3000,
        ...action.payload,
      };
    },
    toastInfo: (state, action) => {
      state.toast = {
        severity: "info",
        summary: "Info",
        detail: "Info",
        life: 3000,
        ...action.payload,
      };
    },
    toastWarn: (state, action) => {
      state.toast = {
        severity: "warn",
        summary: "Warn",
        detail: "Warn",
        life: 3000,
        ...action.payload,
      };
    },
  },
});

export const { toastSuccess, toastError, toastInfo, toastWarn } =
  toastSlice.actions;

export default toastSlice.reducer;
