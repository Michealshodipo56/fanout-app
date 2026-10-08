import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Lock, RefreshCw, Code, CheckCircle } from 'lucide-react';
import { AllocationBar } from '@fanout/ui';

export default function LandingPage() {
  const exampleAllocations = [
    { label: 'Developer A', bps: 5000, color: '#3b82f6' },
    { label: 'Developer B', bps: 3000, color: '#10b981' },
    { label: 'Developer C', bps: 2000, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-blue-500/30 text-xs font-semibold text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>Powered by Stellar & Soroban Smart Contracts</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          One payment. <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
            Everyone gets their share.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Establish programmable revenue-sharing agreements on Stellar. Automatically split incoming USDC, XLM, or custom asset payments among team members, co-founders, and creators in real time.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/agreements/create"
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-xl shadow-blue-600/25 hover:scale-105 transition-all flex items-center gap-2"
          >
            Create Agreement <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl glass-card hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 hover:border-slate-600 transition-all"
          >
            Launch Dashboard
          </Link>
        </div>
      </section>

      {/* Real Live Revenue Distribution Interactive Card */}
      <section className="glass-card p-8 rounded-2xl border border-slate-800 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Interactive Distribution Example</h3>
            <p className="text-xs text-slate-400">Incoming payment split in a single atomic transaction</p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Incoming: 100.00 USDC
          </span>
        </div>

        <AllocationBar allocations={exampleAllocations} />

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Developer A (50%)</div>
            <div className="text-lg font-bold text-blue-400">50.00 USDC</div>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Developer B (30%)</div>
            <div className="text-lg font-bold text-emerald-400">30.00 USDC</div>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Developer C (20%)</div>
            <div className="text-lg font-bold text-amber-400">20.00 USDC</div>
          </div>
        </div>
      </section>

      {/* Core Principles & Benefits */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white">Why Teams Trust Fanout</h2>
          <p className="text-sm text-slate-400">Built for accuracy, transparency, and non-custodial financial security</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic Math</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Uses integer basis points (10,000 BPS = 100.00%) and the Largest Remainder Algorithm. Zero token truncation or lost funds.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Proposal Governance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Beneficiaries must approve allocation updates. Agreement creators cannot unilaterally alter share percentages without quorum.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Replay Protection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every payment reference is tracked on-chain. Duplicate submissions or retries cannot cause accidental multi-payouts.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="glass-card p-10 rounded-3xl border border-slate-800 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">How Fanout Works</h2>
          <p className="text-sm text-slate-400">Four steps from agreement to automated distributions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 1</div>
            <h4 className="font-bold text-white">Create Agreement</h4>
            <p className="text-xs text-slate-400">Define accepted Stellar asset, add recipient wallet addresses, and set allocation percentages.</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 2</div>
            <h4 className="font-bold text-white">Deploy on Soroban</h4>
            <p className="text-xs text-slate-400">Sign transaction with Freighter to initialize contract state on Stellar blockchain.</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 3</div>
            <h4 className="font-bold text-white">Share Payment Link</h4>
            <p className="text-xs text-slate-400">Provide customers or apps with your agreement payment URL or integrate via Developer API.</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 4</div>
            <h4 className="font-bold text-white">Instant Distribution</h4>
            <p className="text-xs text-slate-400">Each payment triggers immediate atomic transfer to all beneficiary wallets automatically.</p>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
            <Code className="w-4 h-4" /> Developer-First Architecture
          </div>
          <h2 className="text-3xl font-bold text-white">Integrate Fanout in 3 Lines of Code</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Use `@fanout/sdk` to query agreement status, create payment links, and inspect real-time distributions directly inside your app or backend service.
          </p>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Type-safe TypeScript SDK
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> REST API with rate-limited API Keys
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Soroban event indexer integration
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 font-mono text-xs text-slate-200 space-y-3 overflow-x-auto">
          <div className="text-slate-500">// Install SDK</div>
          <div className="text-emerald-400">pnpm add @fanout/sdk</div>
          <div className="text-slate-500 pt-2">// Create payment request</div>
          <div><span className="text-purple-400">import</span> &#123; FanoutClient &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">'@fanout/sdk'</span>;</div>
          <div><span className="text-blue-400">const</span> client = <span className="text-purple-400">new</span> FanoutClient(&#123; apiKey: <span className="text-emerald-300">'fo_live_...'</span> &#125;);</div>
          <div><span className="text-blue-400">const</span> req = <span className="text-purple-400">await</span> client.createPaymentRequest(&#123;</div>
          <div className="pl-4">agreementId: <span className="text-emerald-300">'agr_demo_1'</span>,</div>
          <div className="pl-4">amount: <span className="text-emerald-300">'100.00'</span>,</div>
          <div className="pl-4">payerAddress: <span className="text-emerald-300">'GBX73...'</span></div>
          <div>&#125;);</div>
        </div>
      </section>
    </div>
  );
}
