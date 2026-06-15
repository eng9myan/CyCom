'use client';

import React, { useState } from 'react';
import { Check, X, Clock, HelpCircle, ShieldCheck } from 'lucide-react';

const REQS = [
  { id: 'OT-REQ-1002', employee: 'Ahmad Masri', week: 'Week 24 (Jun 07 - Jun 13)', overtimeHours: 4.5, eligibility: 'Eligible', rateType: '1.25x (Normal)', reason: 'Warehouse inventory reconciliation backlog' },
  { id: 'OT-REQ-1003', employee: 'Rami Khasawneh', week: 'Week 24 (Jun 07 - Jun 13)', overtimeHours: 6.0, eligibility: 'Requires Review', rateType: '1.50x (Holiday)', reason: 'POS system migration deployment support' },
  { id: 'OT-REQ-1004', employee: 'Noor Al-Fayegh', week: 'Week 24 (Jun 07 - Jun 13)', overtimeHours: 3.0, eligibility: 'Eligible', rateType: '1.25x (Normal)', reason: 'Unloading urgent branch shipments' },
];

export default function OvertimeApprovalFlow() {
  const [requests, setRequests] = useState(REQS);

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Overtime Approvals</h1>
          <p className="page-subtitle">Verify, validate, and authorize overtime entries before payroll injection (hr_attendance_overtime_approval_bridge).</p>
        </div>
      </div>

      {/* Info Rules Box */}
      <div className="glass-card p-6 border-cyan-500/20 bg-cyan-950/10 text-xs">
        <h3 className="text-sm font-bold text-white mb-2">Weekly Overtime Eligibility Rules</h3>
        <p className="text-slate-400 leading-relaxed mb-4">
          <strong>hr_attendance_weekly_overtime_eligibility:</strong> To be eligible for overtime payout, 
          an employee must complete their full weekly scheduled hours (e.g. 40 or 48 hours). 
          Any shortfalls in regular attendance are deducted from overtime accruals before approval.
        </p>
        <div className="flex gap-4 font-mono text-[11px] text-slate-300">
          <div>
            <span className="text-slate-500 block">HQ Regular Hours</span>
            <span className="font-bold">40 Hours / Week</span>
          </div>
          <div>
            <span className="text-slate-500 block">Warehouse Regular Hours</span>
            <span className="font-bold">48 Hours / Week</span>
          </div>
          <div>
            <span className="text-slate-500 block">Eligibility Check</span>
            <span className="text-emerald-400 font-semibold">Automatic before approval</span>
          </div>
        </div>
      </div>

      {/* Requests Queue */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Pending Approvals Queue</h2>
        {requests.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-500 text-xs font-semibold">
            All overtime requests have been processed. Clean queue.
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded">
                    {r.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{r.employee}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{r.week}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className={`badge ${
                    r.eligibility === 'Eligible' ? 'badge-green' : 'badge-yellow'
                  }`}>{r.eligibility}</span>
                  <span className="text-xs text-[#E67E22] font-semibold block">{r.rateType}</span>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-xs text-slate-300">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Reason / Purpose</span>
                "{r.reason}"
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-xs text-slate-400">Proposed: <strong className="text-white">{r.overtimeHours} Hours</strong></span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(r.id, 'Rejected')}
                    className="p-1.5 text-xs font-bold border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Deny
                  </button>
                  <button 
                    onClick={() => handleAction(r.id, 'Approved')}
                    className="p-1.5 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
