import { call, put, takeLatest } from "redux-saga/effects";
import { fetchLastRoutes } from "../../api/API";
import { fetchLastRoutesRequested, fetchLastRoutesSuccessed, fetchLastRoutesFailed } from "../actions";

function* fetchLastRoutesSaga() {
  try {
    const lastRoutes = yield call(fetchLastRoutes);
    yield put(fetchLastRoutesSuccessed(lastRoutes));
  } catch (error) {
    yield put(fetchLastRoutesFailed(error.message || "Ошибка загрузки"));
    console.error("Error fetching last routes:", error);
  }
}

export function* watchFetchLastRoutes() {
  yield takeLatest(fetchLastRoutesRequested, fetchLastRoutesSaga);
}