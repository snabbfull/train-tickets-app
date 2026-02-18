import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  date_start: null,
  date_end: null,
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
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setDateFilter(state, action) {
      const { date_start, date_end } = action.payload;
      state.date_start = date_start;
      state.date_end = date_end;
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
    resetFilters() {
      return initialState;
    },
  },
});

export const { setDateFilter, toggleFilter, setPriceFilter, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
