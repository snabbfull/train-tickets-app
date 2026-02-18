import { call, put, takeLatest } from 'redux-saga/effects';
import { sendOrder } from '../../api/API';
import { sendOrderRequested, sendOrderSuccessed, sendOrderFailed } from '../actions';

function* handleSendOrder(action) {
  try {
    const response = yield call(sendOrder, action.payload);
    if (response.success) {
      yield put(sendOrderSuccessed(response));
    } else {
      yield put(sendOrderFailed(response.error || 'Unknown error'));
    }
  } catch (error) {
    yield put(sendOrderFailed(error.message || 'Network error'));
  }
}

export function* orderSaga() {
  yield takeLatest(sendOrderRequested.type, handleSendOrder);
}