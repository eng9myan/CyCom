'use client';

import React, { useState } from 'react';
import { ShieldAlert, Check, X, Percent, HelpCircle } from 'lucide-react';

const EXCEPTIONS = [
  { id: 'SO-1091', customer: 'Jordan Food Co', submittedBy: 'Samir Halabi (Sales Rep)', requestedDiscount: '18%', limitDiscount: '10%', totalAmount: 'JOD 8,910.00', status: 'Pending Review', reason: 'High-volume contract negotiations' },
  { id: 'SO-1093', customer: 'Zarqa Coop Supermarket', submittedBy: 'Rami Khasawneh (POS Lead)', requestedDiscount: '15%', limitDiscount: '5%', totalAmount: 'JOD 1,420.00', status: 'Pending Review', reason: 'Promotional bundle clearing' },
];

export default function SalesApprovalsFlow() {
  const [list, setList] = useState(EXCEPTIONS);

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Sales Approvals</h1>
          <p className="page-subtitle">Process discount overrides and sales lines below wholesale minimum threshold limits (sale_discount_exception_approval).</p>
        </div>
      </div>

      {/* Exception explanation */}
      <div className="glass-card p-6 border-cyan-500/20 bg-cyan-950/10 text-xs">
        <h3 className="text-sm font-bold text-white mb-2">Discount Exception Approval Workflows</h3>
        <p className="text-slate-400 leading-relaxed mb-4">
          <strong>sale_discount_exception_approval:</strong> In wholesale sales, reps can request discounts. 
          If the requested discount rate exceeds the designated customer pricelist limit, 
          the system flags the quotation draft and requires manager validation before posting.
        </p>
      </div>

      {/* List Queue */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Exceptions Queue</h2>
        {list.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-500 text-xs font-semibold">
            All discount overrides have been approved or rejected. Clean queue.
          </div>
        ) : (
          list.map((item) => (
            <div key={item.id} className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded">
                    {item.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{item.customer}</h3>
                  <span className="text-xs text-slate-500 block mt-0.5">Submitted by: {item.submittedBy}</span>
                </div>
                <div className="text-right">
                  <span className="badge badge-red flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Exception Flagged
                  </span>
                  <span className="text-xs text-slate-400 block mt-1.5">Value: <strong className="text-white">{item.totalAmount}</strong></span>
                </div>
              </div>

              {/* Multiplier Details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-black/30 p-3 rounded-lg border border-white/5 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Requested Discount</span>
                  <span className="text-rose-400 font-bold text-sm">{item.requestedDiscount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Allowed Limit</span>
                  <span className="text-slate-300 font-bold text-sm">{item.limitDiscount}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/5">
                  <span className="text-slate-500 block font-sans">Rep Reason Note</span>
                  <span className="font-sans text-slate-300 italic">"{item.reason}"</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button 
                  onClick={() => handleAction(item.id, 'Rejected')}
                  className="p-1.5 text-xs font-bold border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Deny Override
                </button>
                <button 
                  onClick={() => handleAction(item.id, 'Approved')}
                  className="p-1.5 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Approve Override
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
