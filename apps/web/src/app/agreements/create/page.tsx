'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { stellarClient } from '@fanout/stellar';

export default function CreateAgreementPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [asset, setAsset] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [requiredApprovals, setRequiredApprovals] = useState(2);
  const [beneficiaries, setBeneficiaries] = useState<Array<{ address: string; percentage: number }>>([
    { address: '', percentage: 50 },
    { address: '', percentage: 50 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalPercentage = beneficiaries.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);
  const isValidPercentage = Math.abs(totalPercentage - 100) < 0.001;

  const handleAddBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { address: '', percentage: 0 }]);
  };

  const handleRemoveBeneficiary = (idx: number) => {
    if (beneficiaries.length <= 1) return;
    setBeneficiaries(beneficiaries.filter((_, i) => i !== idx));
  };

  const handlePercentageChange = (idx: number, val: number) => {
    const updated = [...beneficiaries];
    updated[idx].percentage = val;
    setBeneficiaries(updated);
  };

  const handleAddressChange = (idx: number, val: string) => {
    const updated = [...beneficiaries];
    updated[idx].address = val;
    setBeneficiaries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter an agreement name");
      return;
    }
    if (!isValidPercentage) {
      setErrorMsg(`Total percentage must equal 100.00%, current total is ${totalPercentage}%`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const walletState = await stellarClient.requestWalletConnect();
      if (!walletState.address) throw new Error('Freighter did not return an account address.');
      const response = await fetch('/api/v1/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        contractAddress,
        name,
        creatorAddress: walletState.address,
        acceptedAsset: asset,
        requiredApprovals: Number(requiredApprovals) || 1,
        beneficiaries: beneficiaries.map(b => ({
          address: b.address,
          allocationBps: Math.round(b.percentage * 100)
        })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not register agreement');
      const created = payload.data;

      router.push(`/agreements/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Revenue Sharing Agreement</h1>
        <p className="text-xs text-slate-400">Register a deployed Soroban agreement so Fanout can track and operate it</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 glass-card p-8 rounded-2xl border border-slate-800">
        {/* Step 1: Basic Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">1. Agreement Configuration</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deployed Soroban Contract ID</label>
            <input type="text" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} placeholder="C..." className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Agreement Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core Maintenance Revenue Split"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Accepted Asset (Stellar Contract Address)</label>
            <input
              type="text"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="Stellar asset contract ID (C...)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Step 2: Beneficiaries & Allocation */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-white text-base">2. Beneficiaries & Allocations</h3>
            <span className={`text-xs font-bold ${isValidPercentage ? 'text-emerald-400' : 'text-rose-400'}`}>
              Total: {totalPercentage.toFixed(2)}% {isValidPercentage ? '(100.00% Verified)' : '(Must equal 100%)'}
            </span>
          </div>

          <div className="space-y-3">
            {beneficiaries.map((b, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder="Stellar Wallet Address (G...)"
                  value={b.address}
                  onChange={(e) => handleAddressChange(idx, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
                <div className="flex items-center gap-1 w-28">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    value={b.percentage}
                    onChange={(e) => handlePercentageChange(idx, parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-white text-center focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBeneficiary(idx)}
                  className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddBeneficiary}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Recipient
          </button>
        </div>

        {/* Step 3: Governance Quorum */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">3. Governance & Security</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Required Approvals for Agreement Updates</label>
            <input
              type="number"
              min="1"
              max={beneficiaries.length}
              value={requiredApprovals}
              onChange={(e) => setRequiredApprovals(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">Number of beneficiary signatures required to execute share percentage changes.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValidPercentage || isSubmitting}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <span>Registering agreement...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" /> Register Agreement
            </>
          )}
        </button>
      </form>
    </div>
  );
}
