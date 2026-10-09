import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { splitAmount } from './indexer';

describe('indexer allocation math', () => {
  it('preserves every base unit when division has a remainder', () => {
    const result = splitAmount(10n, [
      { address: 'first', allocationBps: 3333 },
      { address: 'second', allocationBps: 3333 },
      { address: 'third', allocationBps: 3334 }
    ]);
    assert.deepEqual(result.map(item => item.amount), ['3', '3', '4']);
    assert.equal(result.reduce((sum, item) => sum + BigInt(item.amount), 0n), 10n);
  });

  it('breaks equal remainders in beneficiary order', () => {
    const result = splitAmount(1n, [
      { address: 'first', allocationBps: 5000 },
      { address: 'second', allocationBps: 5000 }
    ]);
    assert.deepEqual(result.map(item => item.amount), ['1', '0']);
  });
});
