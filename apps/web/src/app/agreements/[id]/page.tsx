'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@fanout/database';
import { Badge, AllocationBar } from '@fanout/ui';
import { Copy, Check, ExternalLink, ShieldCheck, Share2, Wallet } from 'lucide-react';
import { stellarClient } from '@fanout/stellar';

export default function AgreementDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const agreement = db.getAgreementById(id) || db.getAgreements()[0];

  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedPayLink, setCopiedPayLink] = useState(false);

  if (!agreement) {
    return <div className="text-center py-12 text-slate-400">Agreement not found</div>;
  }

  const handleCopyContract = () => {
    navigator.clipboard.writeText(agreement.contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleCopyPayLink = () => {
    const url = `${window.location.origin}/pay/${agreement.id}`;
    navigator.clipboard.writeText(url);
    setCopiedPayLink(true);
    setTimeout(() => setCopiedPayLink(false), 2000);
  };

  const allocations = agreement.beneficiaries.map((b, idx) => ({
    label: `Beneficiary ${idx + 1} (${b.address.slice(0, 4)}...${b.address.slice(-4)})`,
    bps: b.allocationBps
  }));

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{agreement.name}</h1>
            <Badge status={agreement.status} />
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Contract:</span>
            <span className="text-slate-200">{agreement.contractAddress}</span>
            <button onClick={handleCopyContract} className="p-1 hover:text-white">
              {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={stellarClient.getExplorerContractUrl(agreement.contractAddress)}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <button
          onClick={handleCopyPayLink}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
        >
          {copiedPayLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
          {copiedPayLink ? 'Payment Link Copied!' : 'Share Payment Link'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Distributed</div>
          <div className="text-2xl font-black text-emerald-400">
            {(Number(agreement.totalDistributed) / 1000000).toFixed(2)} USDC
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Config Version</div>
          <div className="text-2xl font-black text-white">v{agreement.version}</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Quorum Required</div>
          <div className="text-2xl font-black text-blue-400">
            {agreement.requiredApprovals} of {agreement.beneficiaries.length} Signatures
          </div>
        </div>
      </div>

      {/* Beneficiaries Breakdown */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="font-bold text-white text-lg">Beneficiary Revenue Allocations</h3>

        <AllocationBar allocations={allocations} />

        <div className="space-y-3 pt-2">
          {agreement.beneficiaries.map((b, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </div>
                <div>
                  <div className="font-mono text-xs text-white">{b.address}</div>
                  <div className="text-xs text-slate-400">Basis Points: {b.allocationBps} BPS</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-blue-400">{(b.allocationBps / 100).toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
