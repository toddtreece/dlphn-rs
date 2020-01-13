import { Reducer } from 'redux';
import { DataActionTypes, DataState } from './types';

export const initialState: DataState = {
  key: '',
  data: [],
  errors: undefined,
  loading: false
};

const reducer: Reducer<DataState> = (state = initialState, action) => {
  switch (action.type) {
    case DataActionTypes.FETCH_REQUEST: {
      return { ...state, loading: true, key: action.payload };
    }
    case DataActionTypes.FETCH_SUCCESS: {
      return { ...state, loading: false, data: action.payload };
    }
    case DataActionTypes.FETCH_ERROR: {
      return { ...state, loading: false, errors: action.payload };
    }
    case DataActionTypes.NEW_MESSAGE: {
      return { ...state, data: [action.payload, ...state.data] };
    }
    case DataActionTypes.START_SUBSCRIPTION: {
      return state;
    }
    case DataActionTypes.END_SUBSCRIPTION: {
      return state;
    }
    default: {
      return state;
    }
  }
};

export { reducer as dataReducer };
