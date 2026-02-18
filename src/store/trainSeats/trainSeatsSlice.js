import { createSlice } from "@reduxjs/toolkit";
import { trainSeatsRequested, trainSeatsSuccessed, trainSeatsFailed } from "../actions";

const initialState = {
  trainSeats: [],
  loading: false,
  error: null,
};

const trainSeatsSlice = createSlice({
  name: "trainSeats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(trainSeatsRequested, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trainSeatsSuccessed, (state, action) => {
        state.loading = false;
        state.trainSeats = action.payload;
      })
      .addCase(trainSeatsFailed, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default trainSeatsSlice.reducer;