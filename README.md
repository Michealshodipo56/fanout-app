# Fanout Application Monorepo

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Stellar](https://img.shields.io/badge/Stellar-Testnet-purple)
![CI](https://github.com/fanout-web/fanout-app/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-green)

> One payment. Everyone gets their share.

Fanout is a non-custodial revenue-sharing platform for teams, creators, open-source projects, and internet businesses on Stellar. A team defines beneficiary wallets and percentage allocations once; each payment is then split atomically by a Soroban agreement contract.

This repository contains the web application, REST API, TypeScript SDK, shared design system, database package, Stellar client, and event-indexing service. The on-chain agreement lives in [`fanout-contracts`](https://github.com/fanout-web/fanout-contracts).

> **Release status:** `v0.1.0` is a Stellar Testnet submission release. Checkout transactions are real and RPC-confirmed. API persistence and event ingestion remain development adapters and must be replaced before mainnet use.

## Why Fanout?

Manual revenue sharing requires a central wallet, off-chain calculations, and several transfers. That creates custody risk, rounding errors, weak auditability, and uncertainty about which split was followed. Fanout makes the allocation executable:

- recipient shares are stored in a Soroban agreement;
- allocations use integer basis points totaling exactly 10,000;
- every recipient transfer succeeds or fails atomically;
- unique payment references prevent replay;
- participant governance controls configuration changes;
- contract events provide an auditable activity source.

## Product Capabilities

- Agreement creation and allocation previews
- Freighter wallet connection and network detection
- Contract-backed public payment checkout
- Confirmed transaction state and Stellar Explorer links
- Agreement dashboard, history, and analytics interfaces
- Governance proposal interfaces
- Versioned REST API and TypeScript SDK
- Soroban event-indexing architecture
- Shared React component library

## How It Works

1. A creator deploys an agreement with an accepted Stellar asset, beneficiaries, allocations, and approval threshold.
2. A payer opens its checkout and connects Freighter.
3. Fanout builds the `distribute` invocation and asks the wallet to sign it.
4. The contract validates lifecycle state, authorization, amount, and reference uniqueness.
5. It transfers the asset to every beneficiary in one atomic transaction.
6. Fanout waits for Stellar RPC confirmation before displaying success.
7. The indexer consumes contract events for API and dashboard read models.

## Architecture

```text
Freighter wallet
      │ signed Soroban transaction
      ▼
Next.js web app ───────────────► Stellar RPC
      │                              │
      │ indexed reads                ▼
      ▼                       Agreement contract
Express API ◄── PostgreSQL ◄── Event indexer
```

The contract is authoritative for payment and governance state. API/database records are derived read models and are not proof of payment without a confirmed Stellar transaction.

## Repository Structure

```text
fanout-app/
├── apps/
│   ├── web/                 # Landing, dashboard, checkout, governance, analytics
│   └── api/                 # Express REST API
├── packages/
│   ├── database/            # Types, development adapter, PostgreSQL schema
│   ├── sdk/                 # @fanout/sdk API client
│   ├── stellar/             # RPC, Freighter, transaction, amount helpers
│   └── ui/                  # Shared React design system
├── services/indexer/        # Soroban event ingestion service
├── scripts/                 # Operational helpers
├── .github/                 # CI, templates, dependency updates
├── .env.example             # Supported configuration
└── pnpm-workspace.yaml
```

## Technology Stack

- Next.js 14, React 18, and TypeScript 5.6
- Express 4
- Stellar SDK, Soroban RPC, and Freighter
- PostgreSQL schema with a development in-memory adapter
- pnpm workspaces
- GitHub Actions and Dependabot

## Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm 9
- Freighter configured for Stellar Testnet
- PostgreSQL 15 or newer for persistent infrastructure
- A deployed agreement contract and accepted token contract

### Install and configure

```bash
git clone https://github.com/fanout-web/fanout-app.git
cd fanout-app
pnpm install --frozen-lockfile
cp .env.example .env
```

Review `.env` before starting. Variables prefixed with `NEXT_PUBLIC_` are included in browser bundles and must never contain credentials or private keys.

### Run locally

```bash
pnpm dev
```

The web app defaults to `http://localhost:3000`; the API defaults to `http://localhost:4000`.

### Verify a change

```bash
pnpm test
pnpm build
```

Pull requests must pass the same checks in GitHub Actions.

## Configuration

Use [`.env.example`](.env.example) as the authoritative template. It covers the public API and Stellar network, server port, CORS origins, PostgreSQL URL, agreement allowlist, RPC URL, and network passphrase. Mainnet deployments must explicitly replace every Testnet value.

### Vercel Services

The root [`vercel.json`](vercel.json) deploys the Express API and Next.js web app as one Vercel project. Public `/api/*` traffic is routed to the `api` service and all other paths to `web`. Vercel also injects the API's internal URL into the web service as `FANOUT_API_URL`; do not create or override that environment variable in project settings.

Run both services locally with Vercel CLI 47.0.5 or newer:

```bash
vercel dev -L
```

The background indexer is intentionally excluded because its continuous polling loop is not a request-driven Vercel Function. Deploy it on a worker-capable platform or redesign it around scheduled/queued execution.

## API Overview

- `GET /health` — process health
- `GET /api/v1/agreements` — indexed agreements
- `GET /api/v1/agreements/:id` — one agreement
- `POST /api/v1/agreements` — create an agreement record
- `POST /api/v1/payments/requests` — create a payment link
- `GET /api/v1/payments/history` — indexed history
- `GET /api/v1/analytics/summary` — aggregate activity

Payment requests do not move assets. Only a confirmed contract transaction represents a completed payment.

## SDK Example

```ts
import { FanoutClient } from '@fanout/sdk';

const fanout = new FanoutClient({ baseUrl: 'https://api.example.com' });
const agreement = await fanout.getAgreement('agr_example');
const request = await fanout.createPaymentRequest({
  agreementId: agreement.id,
  amount: '25.00',
  payerAddress: 'G...'
});
```

## Security

- Fanout never needs a recovery phrase or private key.
- Freighter signs locally after showing the invocation.
- Success appears only after RPC confirmation.
- The contract enforces auth, allocations, lifecycle state, and replay protection.
- High-value state should be verified directly against Stellar RPC.
- Report vulnerabilities privately according to [SECURITY.md](SECURITY.md).

## Production Readiness

Before mainnet, replace the development database and event adapters, validate configuration at startup, add migrations and backup procedures, restrict CORS, add rate limits and telemetry, rehearse rollback, and complete an independent contract audit. Open issues track this work transparently.

## Releases

Releases use semantic version tags and must identify compatible contract versions, network assumptions, migrations, and verification results. See the [latest release](https://github.com/fanout-web/fanout-app/releases/latest).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), select an open issue, and use a focused `feat/`, `fix/`, `docs/`, or `test/` branch. Use Conventional Commits and include tests for behavioral changes.

## License

Fanout is available under the [MIT License](LICENSE).
