import { Reducer } from 'redux';
import { StreamsActionTypes, StreamsState } from './types';

export const initialState: StreamsState = {
  data: [],
  errors: undefined,
  loading: false
};

const reducer: Reducer<StreamsState> = (state = initialState, action) => {
  switch (action.type) {
    case StreamsActionTypes.FETCH_REQUEST: {
      return { ...state, loading: true };
    }
    case StreamsActionTypes.FETCH_SUCCESS: {
      return { ...state, loading: false, data: action.payload };
    }
    case StreamsActionTypes.FETCH_ERROR: {
      return { ...state, loading: false, errors: action.payload };
    }
    default: {
      return state;
    }
  }
};

export { reducer as streamsReducer };
