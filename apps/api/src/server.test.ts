import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from './server';

const contractAddress = `C${'A'.repeat(55)}`;
const assetAddress = `C${'B'.repeat(55)}`;
const creatorAddress = `G${'C'.repeat(55)}`;
const beneficiaryAddress = `G${'D'.repeat(55)}`;

describe('Fanout REST API', () => {
  let server: Server;
  let baseUrl: string;
  let agreementId: string;

  before(async () => {
    server = app.listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  });

  it('reports service health without exposing framework details', async () => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-powered-by'), null);
    const body = await response.json() as { status: string; storage: string };
    assert.deepEqual(body, { ...body, status: 'ok', storage: 'memory' });
  });

  it('rejects malformed agreements', async () => {
    const response = await fetch(`${baseUrl}/api/v1/agreements`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'invalid' })
    });
    assert.equal(response.status, 400);
  });

  it('creates and retrieves a valid agreement', async () => {
    const response = await fetch(`${baseUrl}/api/v1/agreements`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contractAddress,
        acceptedAsset: assetAddress,
        creatorAddress,
        name: 'Submission test agreement',
        requiredApprovals: 1,
        beneficiaries: [{ address: beneficiaryAddress, allocationBps: 10000 }]
      })
    });
    assert.equal(response.status, 201);
    const body = await response.json() as { data: { id: string } };
    agreementId = body.data.id;

    const getResponse = await fetch(`${baseUrl}/api/v1/agreements/${agreementId}`);
    assert.equal(getResponse.status, 200);
    const fetched = await getResponse.json() as { data: { contractAddress: string } };
    assert.equal(fetched.data.contractAddress, contractAddress);
  });

  it('creates a payment request without moving assets', async () => {
    const response = await fetch(`${baseUrl}/api/v1/payments/requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ agreementId, amount: '12.5000000', payerAddress: creatorAddress, reference: 'DEMO_001' })
    });
    assert.equal(response.status, 200);
    const body = await response.json() as { data: { paymentRef: string; paymentUrl: string } };
    assert.equal(body.data.paymentRef, 'DEMO_001');
    assert.match(body.data.paymentUrl, /^\/pay\//);
  });

  it('returns a deterministic analytics summary', async () => {
    const response = await fetch(`${baseUrl}/api/v1/analytics/summary`);
    assert.equal(response.status, 200);
    const body = await response.json() as { data: { activeAgreements: number; totalDistributed: string } };
    assert.equal(body.data.activeAgreements, 1);
    assert.equal(body.data.totalDistributed, '0');
  });
});
