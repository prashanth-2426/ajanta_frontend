import { createSlice } from "@reduxjs/toolkit";
import { provideUserInfo, setLoginInfo, clearLoginInfo } from "../utils/local";

const initialState = {
  user: provideUserInfo(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      let userObj = action.payload;
      state.user = userObj;
      setLoginInfo(action.payload);
    },
    removeCredentials: (state, action) => {
      state.user = null;
      clearLoginInfo();
    },
  },
});

export const { setCredentials, removeCredentials } = authSlice.actions;

export default authSlice.reducer;
