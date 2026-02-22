import { call, put, takeLatest } from "redux-saga/effects";
import { sendSubscribe } from "../../api/API";
import { sendSubscribeRequested, sendSubscribeSuccessed, sendSubscribeFailed } from "../actions";

function* handleSendSubscribe(action) {
  try {
    const response = yield call(sendSubscribe, action.payload);
    if (response.success || response.status === true) {
      yield put(sendSubscribeSuccessed(response));
    } else {
      yield put(sendSubscribeFailed(response.error || "Unknown error"));
    }
  } catch (error) {
    yield put(sendSubscribeFailed(error.message || "Network error"));
  }
}

export function* subscribeSaga() {
  yield takeLatest(sendSubscribeRequested.type, handleSendSubscribe);
}