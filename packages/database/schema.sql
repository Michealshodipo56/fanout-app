-- PostgreSQL Database Schema for Fanout Platform

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_wallets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(56) NOT NULL UNIQUE,
    network VARCHAR(32) NOT NULL DEFAULT 'testnet',
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agreements (
    id VARCHAR(64) PRIMARY KEY,
    contract_address VARCHAR(56) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    creator_address VARCHAR(56) NOT NULL,
    accepted_asset VARCHAR(56) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    version INT NOT NULL DEFAULT 1,
    required_approvals INT NOT NULL DEFAULT 1,
    total_distributed NUMERIC(38, 0) DEFAULT 0,
    transaction_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agreement_beneficiaries (
    id VARCHAR(64) PRIMARY KEY,
    agreement_id VARCHAR(64) REFERENCES agreements(id) ON DELETE CASCADE,
    beneficiary_address VARCHAR(56) NOT NULL,
    allocation_bps INT NOT NULL,
    config_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_bps CHECK (allocation_bps > 0 AND allocation_bps <= 10000)
);

CREATE TABLE IF NOT EXISTS agreement_versions (
    id VARCHAR(64) PRIMARY KEY,
    agreement_id VARCHAR(64) REFERENCES agreements(id) ON DELETE CASCADE,
    version INT NOT NULL,
    beneficiaries_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    payment_ref VARCHAR(64) NOT NULL UNIQUE,
    agreement_id VARCHAR(64) REFERENCES agreements(id) ON DELETE CASCADE,
    payer_address VARCHAR(56) NOT NULL,
    amount NUMERIC(38, 0) NOT NULL,
    asset_address VARCHAR(56) NOT NULL,
    tx_hash VARCHAR(64) NOT NULL UNIQUE,
    ledger_sequence BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Succeeded',
    config_version INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_distributions (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
    beneficiary_address VARCHAR(56) NOT NULL,
    amount NUMERIC(38, 0) NOT NULL,
    allocation_bps INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS governance_proposals (
    id VARCHAR(64) PRIMARY KEY,
    proposal_onchain_id BIGINT NOT NULL,
    agreement_id VARCHAR(64) REFERENCES agreements(id) ON DELETE CASCADE,
    proposer_address VARCHAR(56) NOT NULL,
    new_beneficiaries_json JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending',
    config_version INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS governance_approvals (
    id VARCHAR(64) PRIMARY KEY,
    proposal_id VARCHAR(64) REFERENCES governance_proposals(id) ON DELETE CASCADE,
    approver_address VARCHAR(56) NOT NULL,
    tx_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS indexer_checkpoints (
    id VARCHAR(64) PRIMARY KEY,
    contract_address VARCHAR(56) NOT NULL UNIQUE,
    last_indexed_ledger BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(128) NOT NULL UNIQUE,
    key_prefix VARCHAR(16) NOT NULL,
    name VARCHAR(128) NOT NULL,
    rate_limit_per_min INT DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_agreements_creator ON agreements(creator_address);
CREATE INDEX IF NOT EXISTS idx_payments_agreement ON payments(agreement_id);
CREATE INDEX IF NOT EXISTS idx_distributions_beneficiary ON payment_distributions(beneficiary_address);
