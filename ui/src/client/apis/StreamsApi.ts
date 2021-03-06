/* tslint:disable */
/* eslint-disable */
/**
 * dlphn-rs
 * A simple data logging server written in Rust.
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import {
    Stream,
    StreamFromJSON,
    StreamToJSON,
} from '../models';

/**
 * no description
 */
export class StreamsApi extends runtime.BaseAPI {

    /**
     * List streams
     */
    async listStreamsRaw(): Promise<runtime.ApiResponse<Array<Stream>>> {
        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/streams`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(StreamFromJSON));
    }

    /**
     * List streams
     */
    async listStreams(): Promise<Array<Stream>> {
        const response = await this.listStreamsRaw();
        return await response.value();
    }

}
