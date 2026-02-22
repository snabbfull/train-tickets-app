import { createSlice } from "@reduxjs/toolkit";
import {
  sendSubscribeRequested,
  sendSubscribeSuccessed,
  sendSubscribeFailed,
} from "../actions";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const subscribeSlice = createSlice({
  name: "subscribe",
  initialState,
  reducers: {
    resetSubscribe: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendSubscribeRequested, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(sendSubscribeSuccessed, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(sendSubscribeFailed, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetSubscribe } = subscribeSlice.actions;
export default subscribeSlice.reducer;
