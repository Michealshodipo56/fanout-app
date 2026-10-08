import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-slate-400">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-black">F</div>
            Fanout
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Programmable revenue sharing and payment distribution powered by Stellar & Soroban smart contracts.
          </p>
          <p className="text-xs text-slate-500">"One payment. Everyone gets their share."</p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
            <li><Link href="/agreements/create" className="hover:text-white">Create Agreement</Link></li>
            <li><Link href="/governance" className="hover:text-white">Proposal Governance</Link></li>
            <li><Link href="/analytics" className="hover:text-white">Revenue Analytics</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Developers</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-white">Stellar Network</a></li>
            <li><a href="https://soroban.stellar.org" target="_blank" rel="noreferrer" className="hover:text-white">Soroban Docs</a></li>
            <li><Link href="/docs" className="hover:text-white">SDK & API Reference</Link></li>
            <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white">GitHub Monorepo</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Security & Compliance</h4>
          <ul className="space-y-2 text-xs">
            <li><span className="text-emerald-400 font-mono">Verified Deterministic Math</span></li>
            <li><span className="text-slate-400">SEP-41 Token Compliant</span></li>
            <li><span className="text-slate-400">Stellar Testnet Deployment</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-slate-900 text-center text-xs text-slate-500">
        © 2026 Fanout Network. Built for Stellar Drips Wave Program. All rights reserved.
      </div>
    </footer>
  );
};
