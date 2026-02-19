import { combineReducers } from 'redux';
import citiesReducer from './cities/citiesSlice';
import lastRoutesReducer from './lastRoutes/lastRoutesSlice';
import trainsListReducer from './trainsList/trainsListSlice';
import trainSeatsReducer from './trainSeats/trainSeatsSlice';
import filtersReducer from './filters/filtersSlice';
import orderReducer from './order/orderSlice';

const rootReducer = combineReducers({
  cities: citiesReducer,
  lastRoutes: lastRoutesReducer,
  trainsList: trainsListReducer,
  trainSeats: trainSeatsReducer,
  filters: filtersReducer,
  order: orderReducer,
});

export default rootReducer;