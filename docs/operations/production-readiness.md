# Production Readiness

Before a production deployment:

- replace all development stores and simulated event sources with PostgreSQL and Stellar RPC;
- require explicit mainnet configuration and an agreement-contract allowlist;
- confirm transactions from RPC before presenting success;
- apply schema migrations, backups, retention, and restore tests;
- enforce TLS, restrictive CORS, rate limits, request size limits, and structured logs;
- monitor API health, indexer lag, failed transactions, and database saturation;
- complete an independent contract security review and rehearse rollback procedures.

The tagged `v0.1.0` release is a testnet submission release, not a mainnet security certification.
