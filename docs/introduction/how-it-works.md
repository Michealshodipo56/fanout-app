# How It Works

1. A creator deploys and initializes an agreement with an accepted Stellar asset, beneficiaries, allocations, and governance quorum.
2. A payer connects Freighter and submits `distribute` with an amount and unique payment reference.
3. The contract validates the agreement and atomically transfers the asset to every beneficiary.
4. Contract events are indexed for the dashboard and API.
5. Participants propose and approve allocation changes on-chain; the active configuration is versioned.

Amounts use the asset's base unit. Allocations use basis points and must total 10,000.
