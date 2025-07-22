import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import toastReducer from "./toastSlice";
import vendorReducer from "./vendorSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    vendors: vendorReducer,
  },
});

export default store;
