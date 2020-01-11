import { all, call, fork, put, takeLatest } from 'redux-saga/effects';

import { DataActionTypes } from './types';
import { fetchError, fetchSuccess, fetchRequest } from './actions';
import { DataApi, Configuration } from '../../client';

const api = new DataApi(new Configuration({ basePath: '/api/v1' }));

function* handleFetch({ payload }: ReturnType<typeof fetchRequest>) {
  try {
    const res = yield call([api, 'listData'], { key: payload });
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
  yield takeLatest(DataActionTypes.FETCH_REQUEST, handleFetch);
}

function* dataSaga() {
  yield all([fork(watchFetchRequest)]);
}

export default dataSaga;
