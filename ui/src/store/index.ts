import { combineReducers } from 'redux';
import { all, fork } from 'redux-saga/effects';
import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';

import dataSaga from './data/sagas';
import { dataReducer } from './data/reducer';
import { DataState } from './data/types';

import streamsSaga from './streams/sagas';
import { streamsReducer } from './streams/reducer';
import { StreamsState } from './streams/types';

export interface ApplicationState {
  data: DataState;
  streams: StreamsState;
  router: RouterState;
}

export const createRootReducer = (history: History) =>
  combineReducers({
    data: dataReducer,
    streams: streamsReducer,
    router: connectRouter(history)
  });

export function* rootSaga() {
  yield all([fork(streamsSaga), fork(dataSaga)]);
}
