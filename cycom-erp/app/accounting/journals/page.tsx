'use client';

import React, { useState } from 'react';
import { FileText, ArrowRightLeft, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

const ENTRIES = [
  { id: 'MOVE-0982', journal: 'Customer Invoices (INV-2026-004)', date: 'Jun 14, 2026', partner: 'Jordan Food Co', account: '101000 Bank Account', amount: 'JOD 8,910.00', status: 'Posted', selected: false },
  { id: 'MOVE-0980', journal: 'Vendor Bills (BILL-2026-009)', date: 'Jun 12, 2026', partner: 'Olive Oil Supply', account: '201000 Accounts Payable', amount: 'JOD 12,400.00', status: 'Posted', selected: false },
  { id: 'MOVE-0979', journal: 'Bank Receipts (BNK-0012)', date: 'Jun 10, 2026', partner: 'POS Amman HQ Daily', account: '101000 Bank Account', amount: 'JOD 4,200.00', status: 'Draft', selected: false },
];

export default function JournalEntries() {
  const [list, setList] = useState(ENTRIES);

  const toggleSelect = (id: string) => {
    setList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    }));
  };

  const handleBulkDraft = () => {
    setList(prev => prev.map(item => {
      if (item.selected) {
        return { ...item, status: 'Draft', selected: false };
      }
      return item;
    }));
  };

  const selectedCount = list.filter(item => item.selected).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Journal Entries Ledger</h1>
          <p className="page-subtitle">Post or audit accounting moves, verify cash/bank account restrictions, and perform bulk draft overrides (account_move_bulk_set_draft).</p>
        </div>
        <div className="flex gap-3">
          {selectedCount > 0 && (
            <button 
              onClick={handleBulkDraft}
              className="px-3 py-2 text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-md transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Reset ({selectedCount}) to Draft
            </button>
          )}
        </div>
      </div>

      {/* Info warning */}
      <div className="glass-card p-6 border-cyan-500/20 bg-cyan-950/10 text-xs">
        <h3 className="text-sm font-bold text-white mb-2">Journal Domain Restrictions</h3>
        <p className="text-slate-400 leading-relaxed mb-4">
          <strong>custom_cash_bank_journal_account_domain:</strong> resticts cash and bank journal account selection 
          to predefined chart of accounts domains (e.g. cash journals can only post to Cash-in-Hand accounts, and bank journals to Liquid Bank assets). 
          Prevents ledger accounting errors.
        </p>
      </div>

      {/* Entries Table */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Journal Entries Register</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">Select</th>
                <th>Entry Code</th>
                <th>Journal Code</th>
                <th>Partner</th>
                <th>G/L Account</th>
                <th>Total Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="font-mono text-xs font-bold text-slate-400">{item.id}</td>
                  <td className="font-semibold text-slate-200">{item.journal}</td>
                  <td>{item.partner}</td>
                  <td className="font-mono text-xs text-slate-400">{item.account}</td>
                  <td className="font-bold text-white">{item.amount}</td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Posted' ? 'badge-green' : 'badge-yellow'
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
