'use client';

import React, { useEffect, useState } from 'react';
import type { AgreementRecord, PaymentRecord } from '@fanout/database';
import { Download, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const [agreements, setAgreements] = useState<AgreementRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  useEffect(() => {
    Promise.all([fetch('/api/v1/agreements').then(r => r.json()), fetch('/api/v1/payments/history').then(r => r.json())])
      .then(([a, p]) => { setAgreements(a.data || []); setPayments(p.data || []); }).catch(() => undefined);
  }, []);
  const total = agreements.reduce((sum, agreement) => sum + Number(agreement.totalDistributed), 0) / 1_000_000;
  const average = payments.length ? total / payments.length : 0;

  const handleExportCSV = () => {
    const rows = [
      ['Agreement ID', 'Name', 'Status', 'Total Distributed (USDC)', 'Recipients Count'],
      ...agreements.map(a => [a.id, a.name, a.status, (Number(a.totalDistributed)/1000000).toFixed(2), a.beneficiaries.length])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fanout_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Revenue Analytics</h1>
          <p className="text-xs text-slate-400">Insights into payout distributions across all registered Fanout agreements</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Gross Platform Revenue
          </div>
          <div className="text-3xl font-black text-white">{total.toFixed(2)} USDC</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Average Transaction Size
          </div>
          <div className="text-3xl font-black text-blue-400">{average.toFixed(2)} USDC</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Activity className="w-4 h-4 text-purple-400" /> On-Chain Success Rate
          </div>
          <div className="text-3xl font-black text-purple-400">{payments.length ? `${Math.round((payments.filter(p => p.status === 'Succeeded').length / payments.length) * 100)}%` : '—'}</div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-lg">Top Beneficiaries Distribution Summary</h3>
        <div className="space-y-3">
          {agreements.length === 0 && <div className="p-6 text-center text-xs text-slate-400">No on-chain distribution records are available yet.</div>}
          {agreements.flatMap(a => a.beneficiaries.map(b => ({ ...b, amount: total * b.allocationBps / 10000 }))).map((b, index) => (
            <div key={`${b.address}-${index}`} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="font-mono text-slate-300">{b.address}</div>
              <div className="font-bold text-emerald-400 text-sm">{b.amount.toFixed(2)} USDC ({(b.allocationBps / 100).toFixed(2)}%)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
