import { action } from 'typesafe-actions';
import { DataActionTypes } from './types';
import { Data } from '../../client';

export const fetchRequest = (key: string) => action(DataActionTypes.FETCH_REQUEST, key);
export const fetchSuccess = (data: Data[]) => action(DataActionTypes.FETCH_SUCCESS, data);
export const fetchError = (message: string) => action(DataActionTypes.FETCH_ERROR, message);
export const startSubscription = (key: string) => action(DataActionTypes.START_SUBSCRIPTION, key);
export const endSubscription = (key: string) => action(DataActionTypes.END_SUBSCRIPTION, key);
export const newMessage = (data: Data) => action(DataActionTypes.NEW_MESSAGE, data);
