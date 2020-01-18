import { Reducer } from 'redux';
import { DataActionTypes, DataState, DataPayload } from './types';
import { Data } from '../../client';

export const initialState: DataState = {
  key: '',
  columns: [],
  chart: [],
  data: [],
  errors: undefined,
  loading: false
};

const formatColumns = (data: Data[]) => {
  const columns = data.map(({ payload }) => Object.keys(payload || {})).flat();
  const sortedUniqueColumns = [...new Set(columns)].sort();
  return ['created', ...sortedUniqueColumns];
};

const formatPayloads = (data: Data[]) => {
  const columns = formatColumns(data);
  const [_, ...payloadColumns] = columns;
  const defaultPayload = payloadColumns.reduce((p: DataPayload, c: string) => ({ ...p, [c]: '' }), {});

  const formattedData = data.reduce(
    (acc: { data: Data[]; chart: DataPayload[] }, datum: Data) => {
      const payload = {
        ...defaultPayload,
        ...datum.payload
      };

      acc.data.push({
        ...datum,
        payload
      });

      acc.chart.push({
        ...payload,
        created: new Date(datum.created || Date.now()).getTime()
      });

      return acc;
    },
    { data: [], chart: [] }
  );

  return {
    columns,
    ...formattedData
  };
};

const reducer: Reducer<DataState> = (state = initialState, action) => {
  switch (action.type) {
    case DataActionTypes.FETCH_REQUEST: {
      return { ...state, loading: true, key: action.payload };
    }
    case DataActionTypes.FETCH_SUCCESS: {
      return { ...state, loading: false, ...formatPayloads(action.payload) };
    }
    case DataActionTypes.FETCH_ERROR: {
      return { ...state, loading: false, errors: action.payload };
    }
    case DataActionTypes.NEW_MESSAGE: {
      const data = [action.payload, ...state.data];
      return { ...state, ...formatPayloads(data) };
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
