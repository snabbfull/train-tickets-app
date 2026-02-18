import { createSlice } from "@reduxjs/toolkit";
import { fetchCitiesRequested, fetchCitiesSuccessed, fetchCitiesFailed, clearCities } from "../actions";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCitiesRequested, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCitiesSuccessed, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCitiesFailed, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearCities, (state) => {
        state.items = [];
      });
  },
});

export default citiesSlice.reducer;