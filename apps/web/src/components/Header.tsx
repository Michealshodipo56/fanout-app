'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { stellarClient } from '@fanout/stellar';

export const Header: React.FC = () => {
  const [wallet, setWallet] = useState<{ isConnected: boolean; address?: string }>({ isConnected: false });

  const handleConnect = async () => {
    try {
      const state = await stellarClient.requestWalletConnect();
      setWallet(state);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-500/30">
            F
          </div>
          <span>Fanout</span>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-normal border border-blue-500/20">Testnet</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link href="/agreements/create" className="hover:text-blue-400 transition-colors">New Agreement</Link>
          <Link href="/governance" className="hover:text-blue-400 transition-colors">Governance</Link>
          <Link href="/analytics" className="hover:text-blue-400 transition-colors">Analytics</Link>
          <Link href="/docs" className="hover:text-blue-400 transition-colors">Docs</Link>
        </nav>

        <div className="flex items-center gap-3">
          {wallet.isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
