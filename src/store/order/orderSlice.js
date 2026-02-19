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
      payment_method: "cash",
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
  orderNumber: null,
  loading: false,
  error: null,
  success: false,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // Сохранить выбранные места
    setSelectedSeats: (state, action) => {
      const { seatNumbers, routeId, coach_id, selectedSeats } = action.payload;
      const normalizedSelectedSeats = Array.isArray(selectedSeats)
        ? selectedSeats
        : (seatNumbers || []).map((seatNum) => ({
            coach_id: coach_id || "",
            seat_number: parseInt(seatNum, 10),
          }));

      state.selectedSeats = normalizedSelectedSeats;
      state.selectedSeatNumbers = normalizedSelectedSeats.map((s) => s.seat_number);
      state.data.departure.route_direction_id = routeId;

      // Инициализировать пассажиров для всех выбранных мест (в т.ч. из разных вагонов)
      state.data.departure.seats = normalizedSelectedSeats.map((seat) => ({
        coach_id: seat.coach_id || "",
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
        seat_number: parseInt(seat.seat_number, 10),
        is_child: false,
        include_children_seat: false,
      }));
    },

    // Обновить данные пассажира
    setPassengerInfo: (state, action) => {
      const { seatIndex, personInfo } = action.payload;
      if (state.data.departure.seats[seatIndex]) {
        state.data.departure.seats[seatIndex].person_info = personInfo;
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

    resetOrder: (state) => {
      state.data = { ...initialState.data };
      state.selectedSeats = [];
      state.selectedSeatNumbers = [];
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
        state.orderNumber = action.payload?.order_uid || action.payload?.id;
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
  resetOrder,
} = orderSlice.actions;
export default orderSlice.reducer;
