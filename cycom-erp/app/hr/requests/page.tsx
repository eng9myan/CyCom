'use client';

import React, { useState } from 'react';
import { Shield, CheckCircle2, XCircle, Clock, Calendar, Plus, MessageSquare } from 'lucide-react';

const REQUESTS = [
  { id: 'REQ-1092', employee: 'Ahmad Masri', type: 'Annual Leave', details: '8 days (Jun 15 - Jun 22)', submitted: 'Jun 14, 2026', status: 'Pending', fallbackApplied: false, notes: 'Family vacation in Aqaba' },
  { id: 'REQ-1091', employee: 'Sara Haddad', type: 'Salary Certificate', details: 'Official letter for bank loan purpose', submitted: 'Jun 14, 2026', status: 'Approved', fallbackApplied: false, notes: 'Sent directly to employee email portal' },
  { id: 'REQ-1090', employee: 'Rami Khasawneh', type: 'Insurance Upgrade', details: 'Upgrade spouse to Grade A plan', submitted: 'Jun 13, 2026', status: 'Approved', fallbackApplied: false, notes: 'Grade B contract limit exceeded; overridden by GM' },
  { id: 'REQ-1089', employee: 'Noor Al-Fayegh', type: 'Sick Leave', details: '2 days (Jun 12 - Jun 13)', submitted: 'Jun 12, 2026', status: 'Rejected', fallbackApplied: true, notes: 'Medical certificate missing; fell back to Unpaid Leave balance' },
  { id: 'REQ-1088', employee: 'Lina Qudah', type: 'Maternity Leave', details: '90 days (Jul 01 - Sep 30)', submitted: 'Jun 10, 2026', status: 'Pending', fallbackApplied: false, notes: 'Official medical reports attached' },
];

export default function EmployeeRequests() {
  const [list, setList] = useState(REQUESTS);

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setList(prev => prev.map(req => {
      if (req.id === id) {
        let fallback = req.fallbackApplied;
        if (action === 'Rejected' && req.type.includes('Leave')) {
          fallback = true; // Auto-trigger fallback unpaid leave if rejected
        }
        return { ...req, status: action, fallbackApplied: fallback };
      }
      return req;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Employee Requests</h1>
          <p className="page-subtitle">Track, approve, or reject employee requests for leaves, salary letters, and insurance upgrades (employee_request & hr_leave_fallback).</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Incoming Requests Queue</h2>
          <div className="space-y-4">
            {list.map((req) => (
              <div key={req.id} className="glass-card p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded">
                      {req.id}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{req.employee}</h3>
                    <p className="text-xs text-[#E67E22] font-semibold">{req.type}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`badge ${
                      req.status === 'Approved' ? 'badge-green' :
                      req.status === 'Rejected' ? 'badge-red' :
                      'badge-yellow'
                    }`}>
                      {req.status === 'Pending' ? 'Pending Review' : req.status}
                    </span>
                    <span className="text-[10px] text-slate-500">Submitted {req.submitted}</span>
                  </div>
                </div>

                <div className="bg-black/35 p-3 rounded-lg border border-white/5 space-y-2">
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Details</span>
                    {req.details}
                  </div>
                  {req.notes && (
                    <div className="text-xs text-slate-400 italic flex items-start gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span>"{req.notes}"</span>
                    </div>
                  )}
                </div>

                {req.fallbackApplied && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span><strong>HR Fallback Active:</strong> System automatically reverted this request to unpaid/fallback balances.</span>
                  </div>
                )}

                {req.status === 'Pending' && (
                  <div className="flex gap-2 pt-2 justify-end border-t border-white/5">
                    <button 
                      onClick={() => handleAction(req.id, 'Rejected')}
                      className="px-3 py-1.5 text-xs font-bold border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      Reject Request
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'Approved')}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors"
                    >
                      Approve Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info & Settings Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Fallback Rules</h2>
            <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
              <p>
                <strong>hr_leave_fallback:</strong> When an employee requests a leave but has insufficient balance, 
                the system falls back to secondary leave accounts (e.g. sick leave falls back to unpaid leave) according to company settings.
              </p>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-[11px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Annual Leave Fallback</span>
                  <span className="font-mono text-cyan-400 font-bold">Unpaid Leave</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Sick Leave Fallback</span>
                  <span className="font-mono text-cyan-400 font-bold">Unpaid Leave</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Compassionate Leave Fallback</span>
                  <span className="font-mono text-cyan-400 font-bold">Annual Balance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
