import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { db } from './index';

describe('development database adapter', () => {
  it('retrieves the seeded agreement and filters unknown IDs', () => {
    assert.equal(db.getAgreementById('agr_demo_1')?.status, 'Active');
    assert.equal(db.getAgreementById('missing'), undefined);
  });

  it('returns defensive payment list arrays', () => {
    const first = db.getRecentPayments();
    first.push({} as never);
    assert.equal(db.getRecentPayments().length, 0);
  });
});
