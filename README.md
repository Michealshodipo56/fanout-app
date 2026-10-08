# Fanout Application Monorepo (`fanout-app`)

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Stellar](https://img.shields.io/badge/Stellar-Testnet-purple)
![License](https://img.shields.io/badge/License-MIT-green)

`fanout-app` is the primary full-stack monorepo for **Fanout**, providing the web dashboard, REST API backend, developer SDK, PostgreSQL database schemas, and Soroban RPC event indexer daemon.

---

## 🏗️ Monorepo Architecture

```
fanout-app/
├── apps/
│   ├── web/                # Next.js 14 Web Application (Landing, Dashboard, Agreement Creator, Checkout, Governance, Analytics)
│   └── api/                # Express REST API Server (/api/v1/agreements, /api/v1/payments, /api/v1/analytics)
├── packages/
│   ├── ui/                 # Shared React component primitives & design system
│   ├── stellar/            # Soroban RPC client & Freighter wallet integration helpers
│   ├── sdk/                # @fanout/sdk Developer TypeScript Client
│   └── database/           # PostgreSQL DDL schema & in-memory data store
├── services/
│   └── indexer/            # Background Soroban RPC event indexer daemon
├── pnpm-workspace.yaml
├── package.json
├── CONTRIBUTING.md
├── SECURITY.md
└── LICENSE
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js `v20.x+`
- `pnpm` `v9.x+`

### Installation & Build

```bash
# Install all dependencies across monorepo workspace
pnpm install

# Build all packages and applications
pnpm build
```

### Running Development Servers

```bash
# Run web dashboard, API server, and event indexer concurrently
pnpm dev
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
