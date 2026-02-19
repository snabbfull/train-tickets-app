import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  date_start: null,
  date_start_arrival: null,
  // Типы вагонов
  have_first_class: false,      // Люкс
  have_second_class: false,     // Купе
  have_third_class: false,      // Плацкарт
  have_fourth_class: false,     // Сидячий

  // Доп. опции
  have_wifi: false,
  have_express: false,

  // Цена
  price_from: null,
  price_to: null,

  // Время "Туда"
  forward_departure_from: 0,
  forward_departure_to: 24,
  forward_arrival_from: 0,
  forward_arrival_to: 24,

  // Время "Обратно"
  back_departure_from: 0,
  back_departure_to: 24,
  back_arrival_from: 0,
  back_arrival_to: 24,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setDateFilter(state, action) {
      const { date_start, date_start_arrival } = action.payload;
      state.date_start = date_start;
      state.date_start_arrival = date_start_arrival;
    },
    toggleFilter(state, action) {
      const { filterName } = action.payload;
      state[filterName] = !state[filterName];
    },
    setPriceFilter(state, action) {
      const { price_from, price_to } = action.payload;
      state.price_from = price_from;
      state.price_to = price_to;
    },
    setTimeFilter(state, action) {
      const updates = action.payload || {};
      Object.keys(updates).forEach((key) => {
        if (key in state) {
          state[key] = updates[key];
        }
      });
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setDateFilter,
  toggleFilter,
  setPriceFilter,
  setTimeFilter,
  resetFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;
