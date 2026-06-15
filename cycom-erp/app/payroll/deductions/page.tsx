'use client';

import React, { useState } from 'react';
import { Percent, Clock, AlertTriangle, ShieldCheck, Settings, Plus } from 'lucide-react';

const DEDUCTIONS = [
  { id: 'DED-5021', employee: 'Sara Haddad', date: 'Jun 10, 2026', delayMinutes: 45, calculation: '1.5x Hourly Rate', deduction: 'JOD 15.00', status: 'Applied' },
  { id: 'DED-5022', employee: 'Rami Khasawneh', date: 'Jun 11, 2026', delayMinutes: 120, calculation: '2.0x Hourly Rate', deduction: 'JOD 40.00', status: 'Applied' },
  { id: 'DED-5023', employee: 'Noor Al-Fayegh', date: 'Jun 12, 2026', delayMinutes: 30, calculation: '1.0x Hourly Rate', deduction: 'JOD 10.00', status: 'Pending Review' },
  { id: 'DED-5024', employee: 'Ahmad Masri', date: 'Jun 13, 2026', delayMinutes: 15, calculation: 'Within Grace Period', deduction: 'JOD 0.00', status: 'Excused' },
];

export default function LatenessDeductions() {
  const [list, setList] = useState(DEDUCTIONS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Lateness & Deductions</h1>
          <p className="page-subtitle">Track employee delay logs synched from ZK biometric devices, and calculate deductions based on company grace configurations (latness_deduction).</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Settings className="w-4 h-4" /> Grace Settings
        </button>
      </div>

      {/* Settings Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold uppercase">Grace Period</span>
            <span className="badge badge-cyan">Active</span>
          </div>
          <p className="text-2xl font-black text-white">15 Minutes</p>
          <p className="text-xs text-slate-400">Delays under 15 mins incur no penalty up to 3 times/month.</p>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold uppercase">Lateness Multiplier</span>
            <span className="badge badge-purple">Standard</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>First 15-30m delay:</span>
              <span className="font-mono font-bold text-white">1.0x Hourly</span>
            </div>
            <div className="flex justify-between">
              <span>30-60m delay:</span>
              <span className="font-mono font-bold text-white">1.5x Hourly</span>
            </div>
            <div className="flex justify-between">
              <span>&gt;60m delay:</span>
              <span className="font-mono font-bold text-white">2.0x Hourly</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold uppercase">Total deductions</span>
            <span className="badge badge-red">This Cycle</span>
          </div>
          <p className="text-2xl font-black text-white">JOD 65.00</p>
          <p className="text-xs text-slate-400">Total processed deduction deductions applied to salary bills.</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Deductions Ledger</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Entry</th>
                <th>Employee Name</th>
                <th>Infraction Date</th>
                <th>Delay Duration</th>
                <th>Formula Applied</th>
                <th>Deduction Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td className="font-mono text-xs font-bold text-slate-400">{d.id}</td>
                  <td className="font-semibold text-slate-200">{d.employee}</td>
                  <td>{d.date}</td>
                  <td>{d.delayMinutes} mins</td>
                  <td>{d.calculation}</td>
                  <td className={d.deduction !== 'JOD 0.00' ? 'font-bold text-rose-400' : 'text-slate-400'}>{d.deduction}</td>
                  <td>
                    <span className={`badge ${
                      d.status === 'Applied' ? 'badge-red' :
                      d.status === 'Pending Review' ? 'badge-yellow' :
                      'badge-green'
                    }`}>{d.status}</span>
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
