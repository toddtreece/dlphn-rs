import { all, call, fork, put, takeEvery, take, cancel } from 'redux-saga/effects';
import { eventChannel, EventChannel } from 'redux-saga';

import { DataActionTypes } from './types';
import { fetchError, fetchSuccess, fetchRequest, newMessage } from './actions';
import { DataApi, Configuration } from '../../client';
import { debug } from '../../utils/logger';

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

function createSubscription(key: string) {
  return new EventSource(`/api/v1/streams/${key}/subscribe`);
}

function createSubscriptionChannel(subscription: EventSource) {
  return eventChannel(emit => {
    subscription.onmessage = event => emit(event.data);
    return () => {
      return subscription.close();
    };
  });
}

function* handleMessages(channel: EventChannel<unknown>, key: string) {
  try {
    while (true) {
      const message = yield take(channel);
      try {
        const data = {
          payload: JSON.parse(message),
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        };
        debug(`/streams/${key}/subscription ->`, message);
        yield put(newMessage(data));
      } catch (err) {
        debug(`/streams/${key}/subscription ->`, message);
      }
    }
  } finally {
    debug(`/streams/${key}/subscription -> closing`);
    channel.close();
  }
}

function* watchMessages() {
  while (true) {
    const { payload: key } = yield take(DataActionTypes.START_SUBSCRIPTION);
    const subscription = yield call(createSubscription, key);

    const channel = yield call(createSubscriptionChannel, subscription);
    const handleMessagesTask = yield fork(handleMessages, channel, key);

    yield take(DataActionTypes.END_SUBSCRIPTION);
    yield cancel(handleMessagesTask);
  }
}

function* watchFetchRequest() {
  yield takeEvery(DataActionTypes.FETCH_REQUEST, handleFetch);
}

function* dataSaga() {
  yield all([fork(watchFetchRequest), fork(watchMessages)]);
}

export default dataSaga;
