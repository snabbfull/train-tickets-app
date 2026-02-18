import { all } from "redux-saga/effects";
import { watchFetchCities } from "./cities/citiesSaga";
import { watchFetchLastRoutes } from "./lastRoutes/lastRoutesSaga";
import { watchFetchTrainSeats } from "./trainSeats/trainSeatsSaga";
import { watchFetchTrainsList } from "./trainsList/trainsListSaga";
import { subscribeSaga } from "./subscribe/subscribeSaga";
import { orderSaga } from "./order/orderSaga";

export function* rootSaga() {
  yield all([
    watchFetchCities(),
    watchFetchLastRoutes(),
    watchFetchTrainSeats(),
    watchFetchTrainsList(),
    orderSaga(),
    subscribeSaga(),
  ]);
}

//Объединяем все саги в rootSaga для передачи в store