'use client';

import React from 'react';
import { Settings, Shield, Cpu, Sliders } from 'lucide-react';

export default function SettingsAdminPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">System Settings & Administration</h1>
          <p className="page-subtitle">Configure global parameters, developer whitelists, database triggers, and Cycom connector bridges.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - General Parameters */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Company Profile</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Organization Name</span>
              <span className="text-slate-200 font-semibold">Cycom Co.</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">ERP Identity Brand</span>
              <span className="text-slate-200 font-semibold">CYCOM ERP</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Local Currency Settings</span>
              <span className="text-slate-200 font-semibold">Jordanian Dinar (JOD)</span>
            </div>
          </div>
        </div>

        {/* Right Column - Dev bridges */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Cycom Core Bridges</h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-slate-400">Active Biometric API Bridge</span>
              <span className="text-[#10B981] font-semibold">Healthy</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-slate-400">Sales Pricing Margin Verifier</span>
              <span className="text-[#10B981] font-semibold">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Accounting Move Draft Lock</span>
              <span className="text-[#10B981] font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
