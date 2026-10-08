import React from 'react';

export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Developer Documentation</h1>
        <p className="text-xs text-slate-400">Integrate Fanout revenue sharing into your app, SDK, or backend API</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-xl font-bold text-white">TypeScript SDK (`@fanout/sdk`)</h3>
        <p className="text-xs text-slate-400">Install the official Fanout client for Node.js and browser apps:</p>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
          pnpm add @fanout/sdk
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-purple-400">import &#123; FanoutClient &#125; from '@fanout/sdk';</div>
          <div className="text-blue-400">const client = new FanoutClient(&#123; baseUrl: 'https://api.fanout.network' &#125;);</div>
          <div className="text-slate-500">// Fetch agreement info</div>
          <div>const agreement = await client.getAgreement('agr_your_id');</div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-xl font-bold text-white">REST API Endpoints</h3>
        <div className="space-y-3 text-xs">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">GET</span>
              <span className="font-mono text-white">/api/v1/agreements</span>
            </div>
            <p className="text-slate-400">List all active agreements on the platform.</p>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">POST</span>
              <span className="font-mono text-white">/api/v1/payments/requests</span>
            </div>
            <p className="text-slate-400">Create a managed payment link request for an agreement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
