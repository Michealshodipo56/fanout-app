'use client';

import React, { useState } from 'react';
import { Badge } from '@fanout/ui';
import { CheckCircle2, UserCheck } from 'lucide-react';

export default function GovernancePage() {
  const [proposals] = useState<Array<{ id: string; proposalOnchainId: number; proposerAddress: string; newBeneficiaries: Array<{address: string; allocationBps: number}>; approvals: string[]; requiredApprovals: number; status: string }>>([]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Proposal Governance</h1>
        <p className="text-xs text-slate-400">Review and vote on proposed allocation updates to protect participant revenue shares</p>
      </div>

      <div className="space-y-6">
        {proposals.length === 0 && <div className="glass-card p-10 rounded-2xl border border-slate-800 text-center text-sm text-slate-400">No on-chain governance proposals found.</div>}
        {proposals.map((p) => (
          <div key={p.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-white text-lg">Proposal #{p.proposalOnchainId}</h3>
                  <Badge status={p.status} />
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Proposer: {p.proposerAddress.slice(0, 8)}...{p.proposerAddress.slice(-6)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Approvals Progress</div>
                <div className="text-sm font-bold text-blue-400">
                  {p.approvals.length} / {p.requiredApprovals} Signatures
                </div>
              </div>
            </div>

            {/* Proposed Split Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Proposed New Allocation Split:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {p.newBeneficiaries.map((b, idx) => (
                  <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="font-mono text-slate-400 truncate">{b.address}</div>
                    <div className="font-bold text-white mt-1">{(b.allocationBps / 100).toFixed(1)}% ({b.allocationBps} BPS)</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              {p.status === 'Pending' && (
                <button
                  disabled
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" /> Sign Approval
                </button>
              )}

              {p.status === 'Approved' && (
                <button
                  disabled
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Execute Proposal
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
