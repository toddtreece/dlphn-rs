import { all, call, fork, put, takeEvery } from 'redux-saga/effects';

import { StreamsActionTypes } from './types';
import { fetchError, fetchSuccess } from './actions';
import { StreamsApi, Configuration } from '../../client';

const api = new StreamsApi(new Configuration({ basePath: '/api/v1' }));

function* handleFetch() {
  try {
    const res = yield call([api, 'listStreams']);
    yield put(fetchSuccess(res));
  } catch (err) {
    if (err instanceof Error && err.stack) {
      yield put(fetchError(err.message));
    } else {
      yield put(fetchError('An unknown error occured.'));
    }
  }
}

function* watchFetchRequest() {
  yield takeEvery(StreamsActionTypes.FETCH_REQUEST, handleFetch);
}

function* streamsSaga() {
  yield all([fork(watchFetchRequest)]);
}

export default streamsSaga;
