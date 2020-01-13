import { Data } from '../../client';

export enum DataActionTypes {
  FETCH_REQUEST = '@@data/FETCH_REQUEST',
  FETCH_SUCCESS = '@@data/FETCH_SUCCESS',
  FETCH_ERROR = '@@data/FETCH_ERROR',
  NEW_MESSAGE = '@@data/NEW_MESSAGE',
  START_SUBSCRIPTION = '@@data/START_SUBSCRIPTION',
  END_SUBSCRIPTION = '@@data/END_SUBSCRIPTION'
}

export interface DataState {
  readonly key: string;
  readonly loading: boolean;
  readonly data: Data[];
  readonly errors?: string;
}
