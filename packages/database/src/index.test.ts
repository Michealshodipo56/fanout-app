import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { db } from './index';

describe('development database adapter', () => {
  it('starts empty and filters unknown IDs', async () => {
    assert.equal((await db.getAgreements()).length, 0);
    assert.equal(await db.getAgreementById('missing'), undefined);
  });

  it('returns defensive payment list arrays', async () => {
    const first = await db.getRecentPayments();
    first.push({} as never);
    assert.equal((await db.getRecentPayments()).length, 0);
  });
});
