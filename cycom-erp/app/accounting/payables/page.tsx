'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Plus, DollarSign,
  Search, Filter, ChevronDown, CreditCard, Banknote, ArrowUpRight,
  ReceiptText, X
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BillLine {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
}

interface VendorBill {
  id: string;
  reference: string;
  vendor: string;
  invoiceDate: string;
  dueDate: string;
  status: 'Draft' | 'Approved' | 'Paid' | 'Overdue' | 'Cancelled';
  subtotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
}

// ── Demo Seed Data ────────────────────────────────────────────────────────────

const SEED_BILLS: VendorBill[] = [
  { id: '1', reference: 'BILL/2026/06/0001', vendor: 'Al-Rashid Supplies Ltd.', invoiceDate: '2026-06-01', dueDate: '2026-07-01', status: 'Overdue', subtotal: 4200, taxTotal: 672, total: 4872, amountPaid: 0, amountDue: 4872 },
  { id: '2', reference: 'BILL/2026/06/0002', vendor: 'Jordan Industrial Plastics', invoiceDate: '2026-06-10', dueDate: '2026-07-10', status: 'Approved', subtotal: 1850, taxTotal: 296, total: 2146, amountPaid: 0, amountDue: 2146 },
  { id: '3', reference: 'BILL/2026/06/0003', vendor: 'Delta Freight & Logistics', invoiceDate: '2026-06-15', dueDate: '2026-07-15', status: 'Paid', subtotal: 700, taxTotal: 112, total: 812, amountPaid: 812, amountDue: 0 },
  { id: '4', reference: 'BILL/2026/07/0001', vendor: 'Global Packaging Co.', invoiceDate: '2026-07-01', dueDate: '2026-07-30', status: 'Draft', subtotal: 3300, taxTotal: 528, total: 3828, amountPaid: 0, amountDue: 3828 },
  { id: '5', reference: 'BILL/2026/07/0002', vendor: 'Tech Components FZCO', invoiceDate: '2026-07-05', dueDate: '2026-08-05', status: 'Approved', subtotal: 9200, taxTotal: 1472, total: 10672, amountPaid: 5000, amountDue: 5672 },
];

const STATUS_CFG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  Draft:     { color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', icon: <FileText className="w-3 h-3" />, label: 'Draft' },
  Approved:  { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',   icon: <CheckCircle2 className="w-3 h-3" />, label: 'Approved' },
  Paid:      { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Paid' },
  Overdue:   { color: 'text-red-400 bg-red-400/10 border-red-400/20',      icon: <AlertTriangle className="w-3 h-3" />, label: 'Overdue' },
  Cancelled: { color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', icon: <X className="w-3 h-3" />, label: 'Cancelled' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PayablesPage() {
  const [bills, setBills] = useState<VendorBill[]>(SEED_BILLS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showNewForm, setShowNewForm] = useState(false);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // KPIs
  const totalDue = bills.filter(b => b.status !== 'Paid' && b.status !== 'Cancelled').reduce((a, b) => a + b.amountDue, 0);
  const overdueDue = bills.filter(b => b.status === 'Overdue').reduce((a, b) => a + b.amountDue, 0);
  const paidThisMonth = bills.filter(b => b.status === 'Paid').reduce((a, b) => a + b.amountPaid, 0);
  const draftCount = bills.filter(b => b.status === 'Draft').length;

  const filtered = useMemo(() => {
    return bills.filter(b => {
      const matchSearch = !search || b.vendor.toLowerCase().includes(search.toLowerCase()) || b.reference.includes(search);
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bills, search, statusFilter]);

  const handleApprove = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Approved' } : b));
  };

  const handlePay = (id: string) => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    setBills(prev => prev.map(b => {
      if (b.id !== id) return b;
      const newPaid = b.amountPaid + amount;
      const newDue = Math.max(0, b.total - newPaid);
      return { ...b, amountPaid: newPaid, amountDue: newDue, status: newDue === 0 ? 'Paid' : b.status };
    }));
    setShowPayModal(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts Payable</h1>
          <p className="text-xs text-slate-400 mt-1">Vendor bills, approvals, and payment management</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> New Bill
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Outstanding', value: `JOD ${totalDue.toLocaleString('en', { minimumFractionDigits: 2 })}`, sub: 'pending payment', color: 'text-orange-400', icon: <DollarSign className="w-5 h-5" /> },
          { label: 'Overdue', value: `JOD ${overdueDue.toLocaleString('en', { minimumFractionDigits: 2 })}`, sub: 'past due date', color: 'text-red-400', icon: <AlertTriangle className="w-5 h-5" /> },
          { label: 'Paid This Period', value: `JOD ${paidThisMonth.toLocaleString('en', { minimumFractionDigits: 2 })}`, sub: 'settled', color: 'text-emerald-400', icon: <CheckCircle2 className="w-5 h-5" /> },
          { label: 'Draft Bills', value: draftCount.toString(), sub: 'awaiting approval', color: 'text-blue-400', icon: <FileText className="w-5 h-5" /> },
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
            type="text" placeholder="Search vendor or reference..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white outline-none w-full placeholder-slate-500"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Draft', 'Approved', 'Overdue', 'Paid'].map(s => (
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

      {/* Bills Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 text-slate-400">
              <th className="text-left px-4 py-3 font-semibold">Reference</th>
              <th className="text-left px-4 py-3 font-semibold">Vendor</th>
              <th className="text-left px-4 py-3 font-semibold">Invoice Date</th>
              <th className="text-left px-4 py-3 font-semibold">Due Date</th>
              <th className="text-right px-4 py-3 font-semibold">Total</th>
              <th className="text-right px-4 py-3 font-semibold">Amount Due</th>
              <th className="text-center px-4 py-3 font-semibold">Status</th>
              <th className="text-center px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map(bill => {
                const cfg = STATUS_CFG[bill.status];
                return (
                  <motion.tr
                    key={bill.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="border-b border-white/3 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-purple-300">{bill.reference}</td>
                    <td className="px-4 py-3 text-white font-medium">{bill.vendor}</td>
                    <td className="px-4 py-3 text-slate-300">{bill.invoiceDate}</td>
                    <td className="px-4 py-3 text-slate-300">{bill.dueDate}</td>
                    <td className="px-4 py-3 text-right text-white font-semibold">JOD {bill.total.toLocaleString('en', { minimumFractionDigits: 2 })}</td>
                    <td className={`px-4 py-3 text-right font-bold ${bill.amountDue > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                      JOD {bill.amountDue.toLocaleString('en', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${cfg.color}`}>
                        {cfg.icon}{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {bill.status === 'Draft' && (
                          <button onClick={() => handleApprove(bill.id)} className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold hover:bg-blue-500/20 transition-colors">
                            Approve
                          </button>
                        )}
                        {(bill.status === 'Approved' || bill.status === 'Overdue') && bill.amountDue > 0 && (
                          <button onClick={() => { setShowPayModal(bill.id); setPayAmount(String(bill.amountDue)); }} className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors">
                            Pay
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
          <div className="text-center py-12 text-slate-500 text-sm">No bills match your filters.</div>
        )}
      </div>

      {/* Pay Modal */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="glass-card w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2"><Banknote className="w-4 h-4 text-emerald-400" /> Register Payment</h3>
                <button onClick={() => setShowPayModal(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Payment Amount (JOD)</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500/40" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowPayModal(null)} className="flex-1 py-3 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/5 transition-all">Cancel</button>
                  <button onClick={() => handlePay(showPayModal!)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all">
                    Confirm Payment
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
