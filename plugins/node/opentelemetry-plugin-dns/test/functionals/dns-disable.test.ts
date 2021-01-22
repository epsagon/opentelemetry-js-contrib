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

import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import { NoopLogger, context } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/node';
import { plugin } from '../../src/dns';
import * as sinon from 'sinon';
import * as dns from 'dns';

const memoryExporter = new InMemorySpanExporter();
const logger = new NoopLogger();
const provider = new NodeTracerProvider({ logger });
const tracer = provider.getTracer('default');
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

describe('DnsPlugin', () => {
  before(() => {
    plugin.enable(dns, provider, tracer.logger);
    assert.strictEqual(dns.lookup.__wrapped, true);
  });

  beforeEach(() => {
    sinon.spy(tracer, 'startSpan');
    sinon.spy(context, 'with');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('unpatch()', () => {
    it('should not call tracer methods for creating span', done => {
      plugin.disable();
      const hostname = 'localhost';

      dns.lookup(hostname, (err, address, family) => {
        assert.ok(address);
        assert.ok(family);

        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 0);

        assert.strictEqual(dns.lookup.__wrapped, undefined);
        assert.strictEqual((context.with as sinon.SinonSpy).called, false);
        done();
      });
    });
  });
});
