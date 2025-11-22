import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import toastReducer from "./toastSlice";
import vendorReducer from "./vendorSlice";
import usersReducer from "./userSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    vendors: vendorReducer,
    users: usersReducer,
  },
});

export default store;
