/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as pgTypes from 'pg';
import * as pgPoolTypes from 'pg-pool';
import type * as api from '@opentelemetry/api';
import { InstrumentationConfig } from '@opentelemetry/instrumentation';

export interface PgResponseHookInformation {
  data: pgTypes.QueryResult | pgTypes.QueryArrayResult;
}

export interface PgInstrumentationExecutionResponseHook {
  (span: api.Span, responseInfo: PgResponseHookInformation): void;
}

export interface QueryContext {
  span: api.Span;
  query?: string;
  config?: NormalizedQueryConfig;
  params?: unknown[];
}

export interface PgPostQueryHookFunction {
  (ctx: QueryContext): void;
}

export interface PgInstrumentationConfig extends InstrumentationConfig {
  /**
   * If true, additional information about query parameters will be attached (as `attributes`) to spans representing
   */
  enhancedDatabaseReporting?: boolean;

  /**
   * Function for adding custom attributes before the query is resolved
   */
  postQueryHook?: PgPostQueryHookFunction;

  /**
   * Hook that allows adding custom span attributes based on the data
   * returned from "query" Pg actions.
   *
   * @default undefined
   */
  responseHook?: PgInstrumentationExecutionResponseHook;
}

export type PostgresCallback = (err: Error, res: object) => unknown;

// These are not included in @types/pg, so manually define them.
// https://github.com/brianc/node-postgres/blob/fde5ec586e49258dfc4a2fcd861fcdecb4794fc3/lib/client.js#L25
export interface PgClientConnectionParams {
  database: string;
  host: string;
  port: number;
  user: string;
}

export interface PgClientExtended extends pgTypes.Client {
  connectionParameters: PgClientConnectionParams;
}

// Interface name based on original driver implementation
// https://github.com/brianc/node-postgres/blob/2ef55503738eb2cbb6326744381a92c0bc0439ab/packages/pg/lib/utils.js#L157
export interface NormalizedQueryConfig extends pgTypes.QueryConfig {
  callback?: PostgresCallback;
}

export type PgPoolCallback = (
  err: Error,
  client: any,
  done: (release?: any) => void
) => void;

export interface PgPoolOptionsParams {
  database: string;
  host: string;
  port: number;
  user: string;
  idleTimeoutMillis: number; // the minimum amount of time that an object may sit idle in the pool before it is eligible for eviction due to idle time
  maxClient: number; // maximum size of the pool
}

export interface PgPoolExtended extends pgPoolTypes<pgTypes.Client> {
  options: PgPoolOptionsParams;
}
