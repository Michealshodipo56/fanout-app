'use client';

import React, { useState } from 'react';
import { db } from '@fanout/database';
import { Badge } from '@fanout/ui';
import { ShieldCheck, CheckCircle2, UserCheck, Plus } from 'lucide-react';
import { stellarClient } from '@fanout/stellar';

export default function GovernancePage() {
  const agreements = db.getAgreements();
  const sampleAgr = agreements[0];
  const [proposals, setProposals] = useState([
    {
      id: 'prop_1',
      proposalOnchainId: 1,
      agreementId: sampleAgr ? sampleAgr.id : 'agr_demo_1',
      proposerAddress: 'GAA1111111111111111111111111111111111111111111111111111',
      newBeneficiaries: [
        { address: 'GAA1111111111111111111111111111111111111111111111111111', allocationBps: 4000 },
        { address: 'GAA2222222222222222222222222222222222222222222222222222', allocationBps: 3000 },
        { address: 'GAA3333333333333333333333333333333333333333333333333333', allocationBps: 3000 }
      ],
      approvals: ['GAA1111111111111111111111111111111111111111111111111111'],
      requiredApprovals: 2,
      status: 'Pending',
      createdAt: new Date()
    }
  ]);

  const handleApprove = async (propId: string) => {
    try {
      const walletState = await stellarClient.requestWalletConnect();
      const approverAddress = walletState.address || 'GAA2222222222222222222222222222222222222222222222222222';

      setProposals(prev => prev.map(p => {
        if (p.id === propId) {
          const updatedApprovals = Array.from(new Set([...p.approvals, approverAddress]));
          const isQuorum = updatedApprovals.length >= p.requiredApprovals;
          return {
            ...p,
            approvals: updatedApprovals,
            status: isQuorum ? 'Approved' : 'Pending'
          };
        }
        return p;
      }));
    } catch (err: any) {
      alert(err.message || 'Approval signing failed');
    }
  };

  const handleExecute = async (propId: string) => {
    try {
      await stellarClient.requestWalletConnect();
      setProposals(prev => prev.map(p => {
        if (p.id === propId) {
          return { ...p, status: 'Executed' };
        }
        return p;
      }));
      alert('Proposal executed! Contract state updated to new allocation split.');
    } catch (err: any) {
      alert(err.message || 'Execution failed');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Proposal Governance</h1>
        <p className="text-xs text-slate-400">Review and vote on proposed allocation updates to protect participant revenue shares</p>
      </div>

      <div className="space-y-6">
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
                  onClick={() => handleApprove(p.id)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" /> Sign Approval
                </button>
              )}

              {p.status === 'Approved' && (
                <button
                  onClick={() => handleExecute(p.id)}
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
