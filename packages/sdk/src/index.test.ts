import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import { FanoutClient } from './index';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
  mock.restoreAll();
});

describe('FanoutClient', () => {
  it('unwraps API response envelopes', async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, data: { id: 'agr_1', name: 'Core team' } })
    } as Response));
    const agreement = await new FanoutClient({ baseUrl: 'https://example.test' }).getAgreement('agr_1');
    assert.equal(agreement.id, 'agr_1');
  });

  it('throws on non-success HTTP responses', async () => {
    globalThis.fetch = mock.fn(async () => ({ ok: false, statusText: 'Not Found' } as Response));
    await assert.rejects(new FanoutClient().getAgreement('missing'), /Not Found/);
  });

  it('uses same-origin API paths when no base URL is configured', async () => {
    const previousUrl = process.env.FANOUT_API_URL;
    delete process.env.FANOUT_API_URL;
    const fetchMock = mock.fn(async (_input: string | URL | Request) => ({
      ok: true,
      json: async () => ({ success: true, data: { id: 'agr_1' } })
    } as Response));
    globalThis.fetch = fetchMock;

    await new FanoutClient().getAgreement('agr_1');
    assert.equal(fetchMock.mock.calls[0].arguments[0], '/api/v1/agreements/agr_1');

    if (previousUrl) process.env.FANOUT_API_URL = previousUrl;
  });

  it('uses the internal service binding for server-side calls', async () => {
    const previousUrl = process.env.FANOUT_API_URL;
    process.env.FANOUT_API_URL = 'http://api.internal/';
    const fetchMock = mock.fn(async (_input: string | URL | Request) => ({
      ok: true,
      json: async () => ({ success: true, data: { id: 'agr_1' } })
    } as Response));
    globalThis.fetch = fetchMock;

    await new FanoutClient().getAgreement('agr_1');
    assert.equal(fetchMock.mock.calls[0].arguments[0], 'http://api.internal/api/v1/agreements/agr_1');

    if (previousUrl) process.env.FANOUT_API_URL = previousUrl;
    else delete process.env.FANOUT_API_URL;
  });
});
