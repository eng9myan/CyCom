'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Search, CheckCircle2, ChevronRight, FileDown, Plus } from 'lucide-react';

const BATCHES = [
  { id: 'BATCH-202606', name: 'June 2026 General Payroll', count: 342, status: 'Draft', totalGross: 'JOD 248,910.00', date: 'Jun 30, 2026' },
  { id: 'BATCH-202605', name: 'May 2026 General Payroll', count: 338, status: 'Completed', totalGross: 'JOD 244,120.00', date: 'May 31, 2026' },
  { id: 'BATCH-202604', name: 'April 2026 General Payroll', count: 335, status: 'Completed', totalGross: 'JOD 239,870.00', date: 'Apr 30, 2026' },
];

export default function PayslipBatches() {
  const [batches, setBatches] = useState(BATCHES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Payslip Batches</h1>
          <p className="page-subtitle">Compile individual employee payslips into bulk cycles and generate XLSX spreadsheets (cycom_payslip_xlsx).</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Batch
        </button>
      </div>

      {/* Batches list */}
      <div className="space-y-4">
        {batches.map((b) => (
          <div key={b.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/10">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded">
                  {b.id}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{b.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pay Date: {b.date} • {b.count} Employees included</p>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-2 text-right">
              <div>
                <span className="text-xs text-slate-500 block">Gross Rollup</span>
                <span className="text-lg font-black text-white">{b.totalGross}</span>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${b.status === 'Completed' ? 'badge-green' : 'badge-yellow'} self-center`}>
                  {b.status}
                </span>
                <button className="btn-secondary py-1 px-3 text-xs flex items-center gap-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors">
                  <FileDown className="w-3.5 h-3.5" /> Export XLSX
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-3">Odoo Excel Mapping Standard</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Under Cycom accounting policies, the generated Excel sheets map all salary items dynamically: 
          Base Salary, Allowances (Transport, Housing), Overtime Hours & Valuations, Lateness Deductions, Health Copays, and Net Payable.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-slate-500 block">Bank Output</span>
            <span className="text-slate-200 font-semibold">Standard CSV</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-slate-500 block">File Format</span>
            <span className="text-slate-200 font-semibold">Excel (xlsx)</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-slate-500 block">Deduction Hooks</span>
            <span className="text-slate-200 font-semibold">Automatic</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-slate-500 block">Workflow Stage</span>
            <span className="text-slate-200 font-semibold">Draft {"->"} Post</span>
          </div>
        </div>
      </div>
    </div>
  );
}
