import { action } from 'typesafe-actions';
import { DataActionTypes } from './types';
import { Stream } from '../../client';

export const fetchRequest = (key: string) => action(DataActionTypes.FETCH_REQUEST, key);
export const fetchSuccess = (data: Stream[]) => action(DataActionTypes.FETCH_SUCCESS, data);
export const fetchError = (message: string) => action(DataActionTypes.FETCH_ERROR, message);
