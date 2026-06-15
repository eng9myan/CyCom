'use client';

import React, { useState } from 'react';
import { Package, ArrowRightLeft, ShieldAlert, CheckCircle2, FileDown, Plus } from 'lucide-react';

const TRANSFERS = [
  { id: 'TRANS-9012', from: 'Amman HQ Warehouse', to: 'Zarqa Branch Warehouse', date: 'Jun 14, 2026', itemsCount: 4, status: 'Draft', packingList: 'Not Printed' },
  { id: 'TRANS-9011', from: 'Zarqa Branch Warehouse', to: 'Irbid Warehouse', date: 'Jun 12, 2026', itemsCount: 12, status: 'Completed', packingList: 'Printed' },
  { id: 'TRANS-9010', from: 'Amman HQ Warehouse', to: 'Aqaba Branch Warehouse', date: 'Jun 10, 2026', itemsCount: 8, status: 'Shipped', packingList: 'Printed' },
];

export default function StockTransfers() {
  const [transfers, setTransfers] = useState(TRANSFERS);

  const printPackingList = (id: string) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, packingList: 'Printed' };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Stock Transfers</h1>
          <p className="page-subtitle">Initiate internal warehouse transfers, verify negative stock block rules, and generate Excel packing list reports (stock_picking_catalog).</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Stock Transfer
        </button>
      </div>

      {/* Info Rules Box */}
      <div className="glass-card p-6 border-emerald-500/20 bg-emerald-950/10 text-xs">
        <h3 className="text-sm font-bold text-white mb-2">Stock Transfer Rules</h3>
        <p className="text-slate-400 leading-relaxed mb-4">
          <strong>stock_location_negative_block:</strong> Validates stock levels at source location before confirming transfer. 
          If request exceeds local bin levels, submission is blocked.
          <strong>cycom_packing_list:</strong> Prints a custom cargo delivery sheet.
        </p>
      </div>

      {/* Transfers Table */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Transfer Register</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>Source Location</th>
                <th>Destination Location</th>
                <th>Total Items</th>
                <th>Departure Date</th>
                <th>Packing list</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs font-bold text-slate-400">{t.id}</td>
                  <td className="font-semibold text-slate-200">{t.from}</td>
                  <td className="font-semibold text-slate-200">{t.to}</td>
                  <td>{t.itemsCount} unique products</td>
                  <td>{t.date}</td>
                  <td>
                    <span className={`badge ${t.packingList === 'Printed' ? 'badge-green' : 'badge-yellow'}`}>
                      {t.packingList}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      t.status === 'Completed' ? 'badge-green' :
                      t.status === 'Shipped' ? 'badge-blue' :
                      'badge-cyan'
                    }`}>{t.status}</span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => printPackingList(t.id)}
                        className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Print Packing Sheet
                      </button>
                    </div>
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
