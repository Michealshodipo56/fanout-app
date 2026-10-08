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
});
