'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, AlertTriangle, Plus, DollarSign,
  Search, X, Banknote, Send, ReceiptText
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CustomerInvoice {
  id: string;
  reference: string;
  customer: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  status: 'Draft' | 'Posted' | 'Paid' | 'Overdue' | 'Cancelled';
  subtotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
}

// ── Demo Seed Data ────────────────────────────────────────────────────────────

const SEED_INVOICES: CustomerInvoice[] = [
  { id: '1', reference: 'INV/2026/06/0001', customer: 'Jordan Hypermarkets Co.', invoiceDate: '2026-06-01', dueDate: '2026-07-01', paymentTerms: 'Net30', status: 'Overdue', subtotal: 12000, taxTotal: 1920, total: 13920, amountPaid: 0, amountDue: 13920 },
  { id: '2', reference: 'INV/2026/06/0002', customer: 'Al-Mansoor Trading Group', invoiceDate: '2026-06-10', dueDate: '2026-07-10', paymentTerms: 'Net30', status: 'Posted', subtotal: 6800, taxTotal: 1088, total: 7888, amountPaid: 0, amountDue: 7888 },
  { id: '3', reference: 'INV/2026/06/0003', customer: 'Delta Retail Solutions', invoiceDate: '2026-06-15', dueDate: '2026-07-15', paymentTerms: 'Net30', status: 'Paid', subtotal: 2200, taxTotal: 352, total: 2552, amountPaid: 2552, amountDue: 0 },
  { id: '4', reference: 'INV/2026/07/0001', customer: 'CyberCom Group (HQ)', invoiceDate: '2026-07-01', dueDate: '2026-07-31', paymentTerms: 'Net30', status: 'Draft', subtotal: 45000, taxTotal: 7200, total: 52200, amountPaid: 0, amountDue: 52200 },
  { id: '5', reference: 'INV/2026/07/0002', customer: 'Samer Wholesale Est.', invoiceDate: '2026-07-05', dueDate: '2026-08-05', paymentTerms: 'Net30', status: 'Posted', subtotal: 3750, taxTotal: 600, total: 4350, amountPaid: 2000, amountDue: 2350 },
];

const STATUS_CFG: Record<string, { color: string; icon: React.ReactNode }> = {
  Draft:     { color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', icon: <FileText className="w-3 h-3" /> },
  Posted:    { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: <Send className="w-3 h-3" /> },
  Paid:      { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  Overdue:   { color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <AlertTriangle className="w-3 h-3" /> },
  Cancelled: { color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', icon: <X className="w-3 h-3" /> },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReceivablesPage() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>(SEED_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // KPIs
  const totalReceivable = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((a, i) => a + i.amountDue, 0);
  const overdueAmount = invoices.filter(i => i.status === 'Overdue').reduce((a, i) => a + i.amountDue, 0);
  const collectedThisMonth = invoices.filter(i => i.status === 'Paid').reduce((a, i) => a + i.amountPaid, 0);
  const draftCount = invoices.filter(i => i.status === 'Draft').length;

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = !search || inv.customer.toLowerCase().includes(search.toLowerCase()) || inv.reference.includes(search);
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const handlePost = (id: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'Posted' } : i));
  };

  const handleReceivePayment = (id: string) => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const newPaid = inv.amountPaid + amount;
      const newDue = Math.max(0, inv.total - newPaid);
      return { ...inv, amountPaid: newPaid, amountDue: newDue, status: newDue === 0 ? 'Paid' : inv.status };
    }));
    setShowPayModal(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts Receivable</h1>
          <p className="text-xs text-slate-400 mt-1">Customer invoices, collections, and aging management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Receivable', value: `JOD ${totalReceivable.toLocaleString('en', { minimumFractionDigits: 2 })}`, sub: 'outstanding', color: 'text-blue-400', icon: <DollarSign className="w-5 h-5" /> },
          { label: 'Overdue', value: `JOD ${overdueAmount.toLocaleString('en', { minimumFractionDigits: 2 })}`, sub: 'past due', color: 'text-red-400', icon: <AlertTriangle className="w-5 h-5" /> },
          { label: 'Collected', value: `JOD ${collectedThisMonth.toLocaleString('en', { minimumFractionDigits: 2 })}`, sub: 'this period', color: 'text-emerald-400', icon: <CheckCircle2 className="w-5 h-5" /> },
          { label: 'Drafts', value: draftCount.toString(), sub: 'not yet sent', color: 'text-slate-400', icon: <FileText className="w-5 h-5" /> },
        ].map(card => (
          <div key={card.label} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">{card.label}</span>
              <span className={card.color}>{card.icon}</span>
            </div>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text" placeholder="Search customer or invoice number..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white outline-none w-full placeholder-slate-500"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Draft', 'Posted', 'Overdue', 'Paid'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 text-slate-400">
              <th className="text-left px-4 py-3 font-semibold">Reference</th>
              <th className="text-left px-4 py-3 font-semibold">Customer</th>
              <th className="text-left px-4 py-3 font-semibold">Invoice Date</th>
              <th className="text-left px-4 py-3 font-semibold">Due Date</th>
              <th className="text-left px-4 py-3 font-semibold">Terms</th>
              <th className="text-right px-4 py-3 font-semibold">Total</th>
              <th className="text-right px-4 py-3 font-semibold">Amount Due</th>
              <th className="text-center px-4 py-3 font-semibold">Status</th>
              <th className="text-center px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map(inv => {
                const cfg = STATUS_CFG[inv.status];
                return (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-white/3 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-purple-300">{inv.reference}</td>
                    <td className="px-4 py-3 text-white font-medium">{inv.customer}</td>
                    <td className="px-4 py-3 text-slate-300">{inv.invoiceDate}</td>
                    <td className="px-4 py-3 text-slate-300">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-slate-400">{inv.paymentTerms}</td>
                    <td className="px-4 py-3 text-right text-white font-semibold">JOD {inv.total.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                    <td className={`px-4 py-3 text-right font-bold ${inv.amountDue > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                      JOD {inv.amountDue.toLocaleString('en', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${cfg.color}`}>
                        {cfg.icon}{inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {inv.status === 'Draft' && (
                          <button onClick={() => handlePost(inv.id)} className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold hover:bg-blue-500/20 transition-colors">
                            Post
                          </button>
                        )}
                        {(inv.status === 'Posted' || inv.status === 'Overdue') && inv.amountDue > 0 && (
                          <button onClick={() => { setShowPayModal(inv.id); setPayAmount(String(inv.amountDue)); }} className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors">
                            Receive
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">No invoices match your filters.</div>
        )}
      </div>

      {/* Receive Payment Modal */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="glass-card w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2"><Banknote className="w-4 h-4 text-emerald-400" /> Register Payment Received</h3>
                <button onClick={() => setShowPayModal(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Amount Received (JOD)</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500/40" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowPayModal(null)} className="flex-1 py-3 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/5">Cancel</button>
                  <button onClick={() => handleReceivePayment(showPayModal!)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all">
                    Confirm Receipt
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
