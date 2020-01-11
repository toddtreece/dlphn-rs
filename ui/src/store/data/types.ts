import { Data } from '../../client';

export enum DataActionTypes {
  FETCH_REQUEST = '@@data/FETCH_REQUEST',
  FETCH_SUCCESS = '@@data/FETCH_SUCCESS',
  FETCH_ERROR = '@@data/FETCH_ERROR'
}

export interface DataState {
  readonly key: string;
  readonly loading: boolean;
  readonly data: Data[];
  readonly errors?: string;
}
