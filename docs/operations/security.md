# Security Model

Private keys stay in the user's wallet. The UI is untrusted presentation; the Soroban contract enforces authorization, status, allocation totals, governance, and replay protection. The API must validate every request and must not claim an unconfirmed transaction succeeded.

Report vulnerabilities through GitHub's private security advisory flow. Do not include secrets, private keys, or exploit details in a public issue.
