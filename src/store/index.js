import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import toastReducer from "./toastSlice";
import vendorReducer from "./vendorSlice";
import usersReducer from "./userSlice";
import auctionReducer from "./auctionSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    vendors: vendorReducer,
    users: usersReducer,
    auctions: auctionReducer,
  },
});

export default store;
