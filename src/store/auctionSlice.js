import { createSlice } from "@reduxjs/toolkit";

const auctionSlice = createSlice({
  name: "auctions",
  initialState: {
    list: [], // all auctions
    byId: {}, // quick lookup
  },
  reducers: {
    setAuctions(state, action) {
      state.list = action.payload;
      state.byId = action.payload.reduce((acc, auction) => {
        acc[auction.id] = auction;
        return acc;
      }, {});
    },
  },
});

export const { setAuctions } = auctionSlice.actions;
export default auctionSlice.reducer;
