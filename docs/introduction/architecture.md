# System Architecture

The browser signs Soroban transactions with Freighter. It never sends a secret key to Fanout. The API serves indexed, non-authoritative read models and payment links. The indexer consumes events from configured agreement contracts and writes idempotently to PostgreSQL. The agreement contract remains the authority for recipients, status, governance, replay protection, and transfers.

Production deployments must run the API and indexer as separate processes, use PostgreSQL with backups, restrict CORS, terminate TLS at the edge, and configure explicit contract IDs and Stellar network values.
