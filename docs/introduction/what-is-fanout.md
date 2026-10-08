# What is Fanout?

Fanout is a Stellar revenue-sharing platform. A team defines recipient addresses and allocations once, then a Soroban agreement contract splits each payment atomically according to that configuration.

The application repository contains the web experience, API, TypeScript client, shared UI, persistence adapter, and event-indexing service. The on-chain source of truth lives in the separate `fanout-contracts` repository.
