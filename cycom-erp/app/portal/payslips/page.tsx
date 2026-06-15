'use client';

import React from 'react';
import { FileDown, FileText, Calendar } from 'lucide-react';

const MY_PAYSLIPS = [
  { id: 'PAY-0982', period: 'June 2026', basic: 'JOD 1,400.00', allowance: 'JOD 150.00', deduction: 'JOD 0.00', net: 'JOD 1,550.00', status: 'Pending Approval' },
  { id: 'PAY-0881', period: 'May 2026', basic: 'JOD 1,400.00', allowance: 'JOD 120.00', deduction: 'JOD 10.00', net: 'JOD 1,510.00', status: 'Released' },
  { id: 'PAY-0780', period: 'April 2026', basic: 'JOD 1,400.00', allowance: 'JOD 90.00', deduction: 'JOD 5.00', net: 'JOD 1,485.00', status: 'Released' },
];

export default function MyPayslipsPortal() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">My Payslips</h1>
          <p className="page-subtitle">View and download your official monthly payslips (portal_employee_payslip).</p>
        </div>
      </div>

      {/* Ledger */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Payslip History</h2>
        <div className="space-y-4">
          {MY_PAYSLIPS.map((p) => (
            <div key={p.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{p.period}</h3>
                  <span className="text-[10px] font-mono text-slate-500">ID: {p.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 text-xs text-left">
                <div>
                  <span className="text-slate-500 block">Basic</span>
                  <span className="font-semibold text-slate-200">{p.basic}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Allowances</span>
                  <span className="font-semibold text-emerald-400">{p.allowance}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Deductions</span>
                  <span className="font-semibold text-rose-400">{p.deduction}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Net Payable</span>
                  <span className="font-black text-white">{p.net}</span>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <span className={`badge ${p.status === 'Released' ? 'badge-green' : 'badge-yellow'}`}>
                  {p.status}
                </span>
                {p.status === 'Released' && (
                  <button className="p-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <FileDown className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
