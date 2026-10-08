'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@fanout/database';
import { AllocationBar } from '@fanout/ui';
import { Wallet, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { stellarClient } from '@fanout/stellar';

export default function PublicPaymentPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const agreement = db.getAgreementById(id) || db.getAgreements()[0];

  const [amount, setAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);

  if (!agreement) {
    return <div className="text-center py-12 text-slate-400">Payment agreement not found</div>;
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setSuccessTxHash(null);

    try {
      const walletState = await stellarClient.requestWalletConnect();
      if (!walletState.address) throw new Error('Freighter did not return an account address.');
      const baseUnits = stellarClient.formatBaseUnits(amount);
      const paymentRef = `PAY_${Date.now().toString(36).toUpperCase()}`;
      const txHash = await stellarClient.distribute(
        agreement.contractAddress,
        walletState.address,
        baseUnits,
        paymentRef
      );
      setSuccessTxHash(txHash);
    } catch (err: any) {
      alert(err.message || 'Payment execution failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const allocations = agreement.beneficiaries.map((b, idx) => ({
    label: `Recip. ${idx + 1}`,
    bps: b.allocationBps
  }));

  const numAmount = parseFloat(amount) || 0;

  return (
    <div className="max-w-xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-blue-500/30 text-xs font-semibold text-blue-400">
          Official Fanout Payment Checkout
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{agreement.name}</h1>
        <p className="text-xs text-slate-400 font-mono">Contract: {agreement.contractAddress}</p>
      </div>

      {successTxHash ? (
        <div className="glass-card p-8 rounded-2xl border border-emerald-500/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Payment Distributed Successfully!</h3>
            <p className="text-xs text-slate-300">
              {amount} USDC was atomically split and transferred to all {agreement.beneficiaries.length} recipient wallets on Stellar Testnet.
            </p>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 break-all space-y-1">
            <div className="text-slate-500 text-left">Transaction Hash:</div>
            <div>{successTxHash}</div>
          </div>

          <a
            href={stellarClient.getExplorerTxUrl(successTxHash)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all"
          >
            View on Stellar Expert Explorer <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <form onSubmit={handlePay} className="glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Payment Amount (USDC)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xl font-bold text-white focus:outline-none focus:border-blue-500"
                required
              />
              <span className="absolute right-4 top-4 text-sm font-bold text-blue-400">USDC</span>
            </div>
          </div>

          {/* Allocation Split Preview */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Automatic Revenue Split Breakdown</span>
              <span>100.00%</span>
            </div>
            
            <AllocationBar allocations={allocations} />

            <div className="space-y-2 pt-2">
              {agreement.beneficiaries.map((b, idx) => {
                const calculated = ((numAmount * b.allocationBps) / 10000).toFixed(2);
                return (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-800">
                    <span className="font-mono text-slate-400">
                      {b.address.slice(0, 6)}...{b.address.slice(-4)} ({(b.allocationBps / 100).toFixed(1)}%)
                    </span>
                    <span className="font-bold text-emerald-400">+{calculated} USDC</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Executing Soroban Transfer...</span>
            ) : (
              <>
                <Wallet className="w-5 h-5" /> Pay {amount} USDC Now <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
