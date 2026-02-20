import { createSlice } from "@reduxjs/toolkit";
import { trainSeatsRequested, trainSeatsSuccessed, trainSeatsFailed } from "../actions";

const initialState = {
  /** Данные по местам по routeId: { [routeId]: coaches } — для туда и обратно */
  dataByRoute: {},
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
        const { routeId, data } = action.payload;
        if (routeId != null) {
          state.dataByRoute[routeId] = data;
        }
      })
      .addCase(trainSeatsFailed, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default trainSeatsSlice.reducer;