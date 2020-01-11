import { Stream } from "../../client";

export enum StreamsActionTypes {
  FETCH_REQUEST = "@@streams/FETCH_REQUEST",
  FETCH_SUCCESS = "@@streams/FETCH_SUCCESS",
  FETCH_ERROR = "@@streams/FETCH_ERROR"
}

export interface StreamsState {
  readonly loading: boolean;
  readonly data: Stream[];
  readonly errors?: string;
}
