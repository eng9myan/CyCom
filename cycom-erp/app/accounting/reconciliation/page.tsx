'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, ShieldCheck, Play, HelpCircle } from 'lucide-react';

const STATEMENTS = [
  { id: 'STMT-0201', date: 'Jun 14, 2026', label: 'POS register Amman HQ settlement receipt', amount: 'JOD 4,200.00', matchTarget: 'BNK-0012 Receipt Log', confidence: '100% Match', status: 'Unmatched' },
  { id: 'STMT-0202', date: 'Jun 14, 2026', label: 'Arab Bank transfer ref #1928374', amount: 'JOD 8,910.00', matchTarget: 'INV-2026-004 Wholesale Invoice', confidence: '98% Match', status: 'Unmatched' },
  { id: 'STMT-0203', date: 'Jun 12, 2026', label: 'Supplier payout olive oil batch delivery', amount: '-JOD 12,400.00', matchTarget: 'BILL-2026-009 Vendor Bill', confidence: '99% Match', status: 'Unmatched' },
];

export default function BankReconciliation() {
  const [items, setItems] = useState(STATEMENTS);
  const [reconciling, setReconciling] = useState(false);

  const triggerMassReconcile = () => {
    setReconciling(true);
    setTimeout(() => {
      setItems(prev => prev.map(item => ({ ...item, status: 'Reconciled' })));
      setReconciling(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Mass Bank Reconciliation</h1>
          <p className="page-subtitle">Verify, match, and reconcile bank statement lines against internal ledger invoices recursively (mass_reconciliation).</p>
        </div>
        <button 
          onClick={triggerMassReconcile}
          disabled={reconciling}
          className="btn-primary flex items-center gap-2"
        >
          {reconciling ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {reconciling ? 'Running Reconciliation...' : 'Run Auto-Reconciliation'}
        </button>
      </div>

      {/* Info Rules Box */}
      <div className="glass-card p-6 border-cyan-500/20 bg-cyan-950/10 text-xs">
        <h3 className="text-sm font-bold text-white mb-2">Mass Reconciliation Engine</h3>
        <p className="text-slate-400 leading-relaxed mb-4">
          <strong>mass_reconciliation:</strong> Automatically processes hundreds of bank statements and matches them against open invoices 
          using date thresholds, exact amount matching, and string similarity matching on statement labels.
        </p>
      </div>

      {/* Statements Queue */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Statement Lines Queue</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Statement Date</th>
                <th>Statement Label</th>
                <th>Bank Value</th>
                <th>Calculated Target Match</th>
                <th>Confidence Score</th>
                <th>Reconciled Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td className="font-semibold text-slate-200">{item.label}</td>
                  <td className="font-mono text-xs text-slate-300">{item.amount}</td>
                  <td className="font-semibold text-slate-400">{item.matchTarget}</td>
                  <td>
                    <span className="badge badge-purple">{item.confidence}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Reconciled' ? 'badge-green' : 'badge-yellow'
                    }`}>{item.status}</span>
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
