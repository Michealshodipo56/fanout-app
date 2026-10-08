# Local Setup

Requirements: Node.js 20 or newer, pnpm 9, PostgreSQL 15 or newer, and a Freighter wallet configured for Stellar Testnet.

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm build
pnpm test
pnpm dev
```

The web app uses port 3000 and the API defaults to port 4000.
