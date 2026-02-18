import { createSlice } from "@reduxjs/toolkit";
import {
  trainsListRequested,
  trainsListSuccessed,
  trainsListFailed,
} from "../actions";

const initialState = {
  data: {
    total_count: 0,
    items: [],
  },
  loading: false,
  error: null,
  currentPage: 1,
  sortBy: "date",
  sortDirection: "desc",
  limit: 5,
};

// Вспомогательная функция для получения времени суток (часы:минуты) в соответимом формате
const getTimeOfDay = (datetime) => {
  if (typeof datetime === "number") {
    // UNIX timestamp - конвертируем в Date и берем часы:минуты
    const date = new Date(datetime * 1000); // умножаем на 1000 для миллисекунд
    return date.getHours() * 60 + date.getMinutes();
  }
  if (typeof datetime === "string") {
    if (datetime.includes(":")) {
      // Формат "HH:MM"
      const [hours, minutes] = datetime.split(":").map(Number);
      return hours * 60 + minutes;
    }
    // ISO дата
    const date = new Date(datetime);
    return date.getHours() * 60 + date.getMinutes();
  }
  return 0;
};

// Вспомогательная функция для сортировки
const sortItems = (items, sortBy, sortDirection) => {
  return items.sort((a, b) => {
    switch (sortBy) {
      case "price": {
        const aPrice = a.min_price || 0;
        const bPrice = b.min_price || 0;
        return sortDirection === "desc" ? bPrice - aPrice : aPrice - bPrice;
      }
      case "duration":
        return sortDirection === "desc" ? b.departure.duration - a.departure.duration : a.departure.duration - b.departure.duration;
      case "date":
      default: {
        const aTime = getTimeOfDay(a.departure.from.datetime);
        const bTime = getTimeOfDay(b.departure.from.datetime);
        return sortDirection === "desc" ? bTime - aTime : aTime - bTime;
      }
    }
  });
};

const trainsListSlice = createSlice({
  name: "trainsList",
  initialState,
  reducers: {
    changePage(state, action) {
      state.currentPage = action.payload;
    },
    changeSort(state, action) {
      state.sortBy = action.payload;
      state.currentPage = 1; // Сброс на первую страницу при изменении сортировки
      // Пересортировка
      if (state.data.items) {
        sortItems(state.data.items, state.sortBy, state.sortDirection);
      }
    },
    changeSortDirection(state, action) {
      state.sortDirection = action.payload;
      state.currentPage = 1; // Сброс на первую страницу при изменении направления
      // Пересортировка
      if (state.data.items) {
        sortItems(state.data.items, state.sortBy, state.sortDirection);
      }
    },
    setLimit(state, action) {
      state.limit = action.payload;
      state.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(trainsListRequested, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trainsListSuccessed, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        // Сортировка по параметру и направлению сортировки
        if (state.data.items) {
          sortItems(state.data.items, state.sortBy, state.sortDirection);
        }
      })
      .addCase(trainsListFailed, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { changePage, changeSort, changeSortDirection, setLimit } = trainsListSlice.actions;
export default trainsListSlice.reducer;
