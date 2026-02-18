import { createAction } from "@reduxjs/toolkit";

export const fetchCitiesRequested = createAction("FETCH_CITIES_REQUEST");
export const fetchCitiesSuccessed = createAction("FETCH_CITIES_SUCCESS");
export const fetchCitiesFailed = createAction("FETCH_CITIES_FAILURE");

export const trainsListRequested = createAction("TRAINS_LIST_REQUEST");
export const trainsListSuccessed = createAction("TRAINS_LIST_SUCCESS");
export const trainsListFailed = createAction("TRAINS_LIST_FAILURE");

export const trainSeatsRequested = createAction("TRAIN_SEATS_REQUEST");
export const trainSeatsSuccessed = createAction("TRAIN_SEATS_SUCCESS");
export const trainSeatsFailed = createAction("TRAIN_SEATS_FAILURE");

export const fetchLastRoutesRequested = createAction("FETCH_LAST_ROUTES_REQUEST");
export const fetchLastRoutesSuccessed = createAction("FETCH_LAST_ROUTES_SUCCESS");
export const fetchLastRoutesFailed = createAction("FETCH_LAST_ROUTES_FAILURE");

export const sendOrderRequested = createAction("SEND_ORDER_REQUEST");
export const sendOrderSuccessed = createAction("SEND_ORDER_SUCCESS");
export const sendOrderFailed = createAction("SEND_ORDER_FAILURE");

export const sendSubscribeRequested = createAction("SEND_SUBSCRIBE_REQUEST");
export const sendSubscribeSuccessed = createAction("SEND_SUBSCRIBE_SUCCESS");
export const sendSubscribeFailed = createAction("SEND_SUBSCRIBE_FAILURE");

export const clearCities = createAction("cities/clear");