import { createSlice } from "@reduxjs/toolkit";
import { fetchLastRoutesRequested, fetchLastRoutesSuccessed, fetchLastRoutesFailed } from "../actions";

const initialState = {
  lastRoutes: [],
  loading: false,
  error: null,
};

const lastRoutesSlice = createSlice({
  name: "lastRoutes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLastRoutesRequested, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLastRoutesSuccessed, (state, action) => {
        state.loading = false;
        state.lastRoutes = action.payload;
      })
      .addCase(fetchLastRoutesFailed, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default lastRoutesSlice.reducer;