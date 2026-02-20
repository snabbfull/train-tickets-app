import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './rootSaga';
import rootReducer from './rootReducer';
import { loadOrderFromStorage, saveOrderToStorage } from './order/orderStorage';

const sagaMiddleware = createSagaMiddleware();

const preloadedState = rootReducer(undefined, { type: '@@init' });
const savedOrder = loadOrderFromStorage();
if (savedOrder) preloadedState.order = savedOrder;

const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      thunk: false,
    }).concat(sagaMiddleware),
});

store.subscribe(() => {
  saveOrderToStorage(store.getState().order);
});

sagaMiddleware.run(rootSaga);

export default store;