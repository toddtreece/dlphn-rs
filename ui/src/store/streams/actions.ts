import { action } from 'typesafe-actions';
import { StreamsActionTypes } from './types';
import { Stream } from '../../client';

export const fetchRequest = () => action(StreamsActionTypes.FETCH_REQUEST);
export const fetchSuccess = (data: Stream[]) => action(StreamsActionTypes.FETCH_SUCCESS, data);
export const fetchError = (message: string) => action(StreamsActionTypes.FETCH_ERROR, message);
