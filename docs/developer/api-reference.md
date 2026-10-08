# API Reference

All application endpoints are under `/api/v1`. `GET /health` is intended for health checks. Agreement endpoints provide indexed agreement data. Payment-request endpoints create shareable links; they do not move assets. Payment history and analytics are derived from confirmed indexed events.

Clients must treat non-2xx responses as failures and should use an idempotency key for write requests. API data is a convenience read model; verify high-value state against Stellar RPC.
