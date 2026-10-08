# Environment Variables

Copy `.env.example` and change values for the target environment. `DATABASE_URL`, the network passphrase, RPC URL, allowed CORS origins, and the contract allowlist are server settings. Values prefixed with `NEXT_PUBLIC_` are included in browser bundles and must never contain secrets.

Mainnet deployments must change all network values together and use mainnet contract IDs. Fail startup when required production values are absent; do not silently fall back to testnet.
