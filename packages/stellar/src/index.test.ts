import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { StellarClient } from './index';

describe('StellarClient', () => {
  const client = new StellarClient();

  it('converts decimal asset values without floating-point rounding', () => {
    assert.equal(client.formatBaseUnits('1.2345678'), '12345678');
    assert.equal(client.formatBaseUnits('100'), '1000000000');
  });

  it('rejects invalid, zero, and over-precision values', () => {
    assert.throws(() => client.formatBaseUnits('0'));
    assert.throws(() => client.formatBaseUnits('-1'));
    assert.throws(() => client.formatBaseUnits('1.00000001'));
  });

  it('requires allocations to total exactly 10,000 basis points', () => {
    assert.deepEqual(client.calculateBasisPoints([50, 30, 20]), [5000, 3000, 2000]);
    assert.throws(() => client.calculateBasisPoints([50, 40]));
  });
});
