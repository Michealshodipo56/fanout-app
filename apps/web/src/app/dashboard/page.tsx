'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@fanout/database';
import { Badge } from '@fanout/ui';
import { ExternalLink, PlusCircle, Copy, Check } from 'lucide-react';
import { stellarClient } from '@fanout/stellar';

export default function DashboardPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const agreements = db.getAgreements();
  const recentPayments = db.getRecentPayments();

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400">Overview of your active revenue-sharing agreements and payment history</p>
        </div>

        <Link
          href="/agreements/create"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Create Agreement
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Distributed</div>
          <div className="text-2xl font-black text-white">15,000.00 <span className="text-xs text-blue-400 font-normal">USDC</span></div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Active Agreements</div>
          <div className="text-2xl font-black text-emerald-400">{agreements.filter(a => a.status === 'Active').length}</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Transactions</div>
          <div className="text-2xl font-black text-white">42</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Network</div>
          <div className="text-lg font-bold text-sky-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            Stellar Testnet
          </div>
        </div>
      </div>

      {/* Agreements Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">Active Agreements</h3>
          <span className="text-xs text-slate-400">{agreements.length} total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Agreement Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Beneficiaries</th>
                <th className="px-4 py-3">Total Distributed</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {agreements.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-white">
                    <Link href={`/agreements/${a.id}`} className="hover:text-blue-400">
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge status={a.status} />
                  </td>
                  <td className="px-4 py-3.5">{a.beneficiaries.length} Recipients</td>
                  <td className="px-4 py-3.5 font-mono text-emerald-400">
                    {(Number(a.totalDistributed) / 1000000).toFixed(2)} USDC
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleCopyLink(a.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 inline-flex items-center gap-1 text-xs"
                    >
                      {copiedId === a.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId === a.id ? 'Copied' : 'Pay Link'}
                    </button>
                    <Link
                      href={`/agreements/${a.id}`}
                      className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 inline-flex items-center gap-1 text-xs"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
