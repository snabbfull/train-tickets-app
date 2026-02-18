import { call, put, takeLatest } from "redux-saga/effects";
import { trainsListRequested, trainsListSuccessed, trainsListFailed } from "../actions";
import { fetchTrainsList } from "../../api/API";

function* fetchTrainsSaga(action) {
  try {
    const response = yield call(fetchTrainsList, action.payload);
    yield put(trainsListSuccessed(response));
  } catch (error) {
    yield put(trainsListFailed(error.message || "Ошибка загрузки поездов"));
  }
}

export function* watchFetchTrainsList() {
  yield takeLatest(trainsListRequested.type, fetchTrainsSaga);
}
