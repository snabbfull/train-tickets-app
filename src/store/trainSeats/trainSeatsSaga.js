import { call, put, takeLatest } from "redux-saga/effects";
import { fetchSeats } from "../../api/API";
import { trainSeatsRequested, trainSeatsSuccessed, trainSeatsFailed } from "../actions";

function* fetchTrainSeatsSaga(action) {
  try {
    const seats = yield call(fetchSeats, action.payload);
    yield put(trainSeatsSuccessed(seats));
  } catch (error) {
    yield put(trainSeatsFailed(error.message || "Ошибка загрузки"));
    console.error("Error fetching train seats:", error);
  }
}

export function* watchFetchTrainSeats() {
  yield takeLatest(trainSeatsRequested, fetchTrainSeatsSaga);
}