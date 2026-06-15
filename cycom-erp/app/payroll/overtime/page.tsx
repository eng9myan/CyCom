'use client';

import React, { useState } from 'react';
import { Clock, CheckCircle2, ShieldAlert, Award, FileSpreadsheet, Plus } from 'lucide-react';

const OVERTIME_ENTRIES = [
  { id: 'OT-8821', employee: 'Ahmad Masri', date: 'Jun 12, 2026', normalHours: 4, holidayHours: 0, multiplierNormal: '1.25x', multiplierHoliday: '1.50x', totalCalculated: 'JOD 45.00', status: 'Approved' },
  { id: 'OT-8822', employee: 'Rami Khasawneh', date: 'Jun 13, 2026', normalHours: 2, holidayHours: 3, multiplierNormal: '1.25x', multiplierHoliday: '1.50x', totalCalculated: 'JOD 95.00', status: 'Pending Approval' },
  { id: 'OT-8823', employee: 'Noor Al-Fayegh', date: 'Jun 10, 2026', normalHours: 4, holidayHours: 0, multiplierNormal: '1.25x', multiplierHoliday: '1.50x', totalCalculated: 'JOD 45.00', status: 'Approved' },
  { id: 'OT-8824', employee: 'Yousef Ali', date: 'Jun 08, 2026', normalHours: 0, holidayHours: 6, multiplierNormal: '1.25x', multiplierHoliday: '1.50x', totalCalculated: 'JOD 120.00', status: 'Approved' },
];

export default function OvertimePayroll() {
  const [entries, setEntries] = useState(OVERTIME_ENTRIES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Overtime Compensation</h1>
          <p className="page-subtitle">Track overtime hours synched from attendance, calculate compensations using custom multipliers, and process approvals (cycom_payroll_overtime).</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Overtime
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Overtime Hours</span>
          <p className="text-3xl font-black text-white">19 Hours</p>
          <span className="text-xs text-slate-400">Recorded this period</span>
        </div>
        <div className="glass-card p-5 space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">Calculated Outflow</span>
          <p className="text-3xl font-black text-white">JOD 305.00</p>
          <span className="text-xs text-slate-400">Total approved OT payout</span>
        </div>
        <div className="glass-card p-5 space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase">Rate Config</span>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mt-2">
            <span>Normal Rate:</span>
            <span className="text-cyan-400 font-mono">1.25x</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Holiday Rate:</span>
            <span className="text-purple-400 font-mono">1.50x</span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Overtime Ledger</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Entry</th>
                <th>Employee Name</th>
                <th>Date</th>
                <th>Normal Hours</th>
                <th>Holiday Hours</th>
                <th>Calculation</th>
                <th>Total Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="font-mono text-xs font-bold text-slate-400">{entry.id}</td>
                  <td className="font-semibold text-slate-200">{entry.employee}</td>
                  <td>{entry.date}</td>
                  <td>{entry.normalHours} hr ({entry.multiplierNormal})</td>
                  <td>{entry.holidayHours} hr ({entry.multiplierHoliday})</td>
                  <td className="text-xs text-slate-400">Normal + Holiday multipliers</td>
                  <td className="font-bold text-cyan-400">{entry.totalCalculated}</td>
                  <td>
                    <span className={`badge ${
                      entry.status === 'Approved' ? 'badge-green' : 'badge-yellow'
                    }`}>{entry.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
