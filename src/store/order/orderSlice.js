import { createSlice } from "@reduxjs/toolkit";
import { sendOrderRequested, sendOrderSuccessed, sendOrderFailed } from "../actions";

const initialState = {
  data: {
    user: {
      first_name: "",
      last_name: "",
      patronymic: "",
      phone: "",
      email: "",
      payment_method: "card",
    },
    departure: {
      route_direction_id: "",
      seats: [], // [{ coach_id, person_info, seat_number, is_child, include_children_seat }]
    },
    arrival: null,
  },
  // Временные данные для навигации
  selectedSeats: [],
  selectedSeatNumbers: [],
  // Доп. опции ФПК, выбранные клиентом: [{ coach_id, option_key, price, label? }]
  fpkOptions: [],
  // Сводка поезда для сайдбара (Туда / Обратно): { departure, arrival? }
  trainSummary: null,
  // Полный объект поезда для карточки на OrderPage
  lastSelectedTrain: null,
  // Поисковый запрос для возврата на TrainsListPage
  lastRoutesSearch: "",
  orderNumber: null,
  loading: false,
  error: null,
  success: false,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // Сохранить выбранные места (туда и опционально обратно)
    setSelectedSeats: (state, action) => {
      const {
        seatNumbers,
        routeId,
        coach_id,
        selectedSeats,
        arrivalRouteId,
        arrivalSeats,
      } = action.payload;
      const normalizedSelectedSeats = Array.isArray(selectedSeats)
        ? selectedSeats
        : (seatNumbers || []).map((seatNum) => ({
            coach_id: coach_id || "",
            seat_number: parseInt(seatNum, 10),
          }));

      state.selectedSeats = normalizedSelectedSeats;
      state.selectedSeatNumbers = normalizedSelectedSeats.map((s) => s.seat_number);
      state.data.departure.route_direction_id = routeId;

      state.data.departure.seats = normalizedSelectedSeats.map((seat) => ({
        coach_id: seat.coach_id || "",
        person_info: {
          is_adult: seat.is_child !== true,
          first_name: "",
          last_name: "",
          patronymic: "",
          gender: true,
          birthday: "",
          document_type: "паспорт",
          document_data: "",
        },
        seat_number: parseInt(seat.seat_number, 10),
        is_child: seat.is_child === true,
        include_children_seat: false,
        seat_price: typeof seat.seat_price === "number" ? seat.seat_price : 0,
      }));

      if (arrivalRouteId && Array.isArray(arrivalSeats) && arrivalSeats.length > 0) {
        state.data.arrival = {
          route_direction_id: arrivalRouteId,
          seats: arrivalSeats.map((seat) => ({
            coach_id: seat.coach_id || "",
            person_info: {
              is_adult: seat.is_child !== true,
              first_name: "",
              last_name: "",
              patronymic: "",
              gender: true,
              birthday: "",
              document_type: "паспорт",
              document_data: "",
            },
            seat_number: parseInt(seat.seat_number, 10),
            is_child: seat.is_child === true,
            include_children_seat: false,
            seat_price: typeof seat.seat_price === "number" ? seat.seat_price : 0,
          })),
        };
      } else {
        state.data.arrival = null;
      }
    },

    // Обновить данные пассажира (при смене is_adult синхронизируется is_child у места)
    setPassengerInfo: (state, action) => {
      const { seatIndex, personInfo, include_children_seat } = action.payload;
      const seat = state.data.departure.seats[seatIndex];
      if (seat) {
        if (personInfo) seat.person_info = personInfo;
        if (typeof personInfo?.is_adult === "boolean") seat.is_child = !personInfo.is_adult;
        if (typeof include_children_seat === "boolean") seat.include_children_seat = include_children_seat;
      }
    },

    // Обновить данные пользователя (покупателя)
    setUserInfo: (state, action) => {
      state.data.user = { ...state.data.user, ...action.payload };
    },

    // Обновить метод оплаты
    setPaymentMethod: (state, action) => {
      state.data.user.payment_method = action.payload;
    },

    // Сохранить выбранные доп. опции ФПК (с ценами)
    setFpkOptions: (state, action) => {
      state.fpkOptions = Array.isArray(action.payload) ? action.payload : [];
    },

    // Сводка поезда для сайдбара: { departure: { from, to, trainName, trainNumber, ... }, arrival? }
    setOrderTrainSummary: (state, action) => {
      state.trainSummary = action.payload;
    },

    setLastRoutesSearch: (state, action) => {
      state.lastRoutesSearch = action.payload || "";
    },

    setLastSelectedTrain: (state, action) => {
      state.lastSelectedTrain = action.payload || null;
    },

    removeDepartureSeat: (state, action) => {
      const index = action.payload;
      if (index < 0 || index >= state.data.departure.seats.length) return;
      state.data.departure.seats.splice(index, 1);
      state.selectedSeats = state.data.departure.seats.map((s) => ({
        coach_id: s.coach_id,
        seat_number: s.seat_number,
      }));
      state.selectedSeatNumbers = state.selectedSeats.map((s) => s.seat_number);
    },

    addDepartureSeat: (state) => {
      const seats = state.data.departure.seats;
      const first = seats[0];
      const coach_id = first?.coach_id ?? "";
      const seat_price = typeof first?.seat_price === "number" ? first.seat_price : 0;
      const maxSeatNumber = seats.length
        ? Math.max(...seats.map((s) => parseInt(s.seat_number, 10) || 0))
        : 0;
      state.data.departure.seats.push({
        coach_id,
        person_info: {
          is_adult: true,
          first_name: "",
          last_name: "",
          patronymic: "",
          gender: true,
          birthday: "",
          document_type: "паспорт",
          document_data: "",
        },
        seat_number: maxSeatNumber + 1,
        is_child: false,
        include_children_seat: false,
        seat_price,
      });
      state.selectedSeats = state.data.departure.seats.map((s) => ({
        coach_id: s.coach_id,
        seat_number: s.seat_number,
      }));
      state.selectedSeatNumbers = state.selectedSeats.map((s) => s.seat_number);
    },

    resetOrder: (state) => {
      state.data = { ...initialState.data };
      state.selectedSeats = [];
      state.selectedSeatNumbers = [];
      state.fpkOptions = [];
      state.trainSummary = null;
      state.lastSelectedTrain = null;
      state.lastRoutesSearch = "";
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOrderRequested, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendOrderSuccessed, (state, action) => {
        state.loading = false;
        state.success = true;
        const data = action.payload?.data ?? action.payload;
        state.orderNumber = data?.order_uid || data?.id || action.payload?.order_uid || action.payload?.id;
      })
      .addCase(sendOrderFailed, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  setSelectedSeats,
  setPassengerInfo,
  setUserInfo,
  setPaymentMethod,
  setFpkOptions,
  setOrderTrainSummary,
  setLastRoutesSearch,
  setLastSelectedTrain,
  removeDepartureSeat,
  addDepartureSeat,
  resetOrder,
} = orderSlice.actions;

/** Сумма за выбранные доп. опции ФПК */
export const selectFpkTotalPrice = (state) =>
  (state.order.fpkOptions || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
export default orderSlice.reducer;
