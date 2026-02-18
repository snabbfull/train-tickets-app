import { call, put, takeLatest } from "redux-saga/effects";
import { fetchCities } from "../../api/API";
import { fetchCitiesRequested, fetchCitiesSuccessed, fetchCitiesFailed } from "../actions";

function* fetchCitiesSaga(action) {
  try {
    const cities = yield call(fetchCities, action.payload);
    yield put(fetchCitiesSuccessed(cities));
  } catch (error) {
    yield put(fetchCitiesFailed(error.message || "Ошибка загрузки"));
    console.error("Error fetching cities:", error);}
}

export function* watchFetchCities() {
  yield takeLatest(fetchCitiesRequested, fetchCitiesSaga);
}