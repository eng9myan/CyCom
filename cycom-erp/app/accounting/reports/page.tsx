'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Scale, ChevronRight,
  Calendar, Download, RefreshCw, CheckCircle2, AlertTriangle,
  Play, Database, Code
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

type ReportType = 'trial-balance' | 'profit-loss' | 'balance-sheet' | 'ap-aging' | 'ar-aging' | 'custom-query';

// ── Demo Report Data ──────────────────────────────────────────────────────────

const TRIAL_BALANCE = [
  { code: '1100', name: 'Cash & Cash Equivalents', type: 'asset',     debit: 182400, credit: 0 },
  { code: '1200', name: 'Accounts Receivable',     type: 'asset',     debit: 83640,  credit: 0 },
  { code: '1500', name: 'Inventory — Finished Goods', type: 'asset',  debit: 94200,  credit: 0 },
  { code: '1800', name: 'Property, Plant & Equipment', type: 'asset', debit: 320000, credit: 0 },
  { code: '2100', name: 'Accounts Payable',         type: 'liability', debit: 0,      credit: 42750 },
  { code: '2300', name: 'VAT Payable',              type: 'liability', debit: 0,      credit: 18420 },
  { code: '3000', name: 'Share Capital',            type: 'equity',    debit: 0,      credit: 500000 },
  { code: '4100', name: 'Sales Revenue',            type: 'income',    debit: 0,      credit: 284700 },
  { code: '4200', name: 'Service Revenue',          type: 'income',    debit: 0,      credit: 52800 },
  { code: '5100', name: 'Cost of Goods Sold',       type: 'expense',   debit: 168300, credit: 0 },
  { code: '5200', name: 'Salaries & Wages',         type: 'expense',   debit: 84000,  credit: 0 },
  { code: '5300', name: 'Rent & Utilities',         type: 'expense',   debit: 24000,  credit: 0 },
  { code: '5400', name: 'Depreciation',             type: 'expense',   debit: 12000,  credit: 0 },
  { code: '5500', name: 'Bank Charges & Fees',      type: 'expense',   debit: 1830,   credit: 0 },
  { code: '5600', name: 'Other Operating Expenses', type: 'expense',   debit: 28300,  credit: 0 },
];

const PL_DATA = {
  revenue: [
    { name: 'Sales Revenue',    amount: 284700 },
    { name: 'Service Revenue',  amount: 52800 },
  ],
  expenses: [
    { name: 'Cost of Goods Sold',       amount: 168300 },
    { name: 'Salaries & Wages',         amount: 84000 },
    { name: 'Rent & Utilities',         amount: 24000 },
    { name: 'Depreciation',             amount: 12000 },
    { name: 'Bank Charges',             amount: 1830 },
    { name: 'Other Operating Expenses', amount: 28300 },
  ],
};

const BS_DATA = {
  assets: [
    { name: 'Cash & Cash Equivalents',  amount: 182400 },
    { name: 'Accounts Receivable',       amount: 83640 },
    { name: 'Inventory',                 amount: 94200 },
    { name: 'Property, Plant & Equipment', amount: 320000 },
  ],
  liabilities: [
    { name: 'Accounts Payable',          amount: 42750 },
    { name: 'VAT Payable',               amount: 18420 },
    { name: 'Long-term Debt',            amount: 120000 },
  ],
  equity: [
    { name: 'Share Capital',             amount: 500000 },
    { name: 'Retained Earnings',         amount: -1070 },
  ],
};

const AP_AGING = { '0-30': 8200, '31-60': 15420, '61-90': 11000, '90+': 8130 };
const AR_AGING = { '0-30': 27800, '31-60': 42100, '61-90': 9200, '90+': 4540 };

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => `JOD ${Math.abs(n).toLocaleString('en', { minimumFractionDigits: 2 })}`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('profit-loss');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-07-14');

  // Custom SQL states
  const [queryText, setQueryText] = useState('SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action;');
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  const REPORTS = [
    { id: 'profit-loss',    label: 'Profit & Loss',   icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'balance-sheet',  label: 'Balance Sheet',   icon: <Scale className="w-4 h-4" /> },
    { id: 'trial-balance',  label: 'Trial Balance',   icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'ap-aging',       label: 'AP Aging',        icon: <TrendingDown className="w-4 h-4" /> },
    { id: 'ar-aging',       label: 'AR Aging',        icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'custom-query',   label: 'BI Custom Query', icon: <Database className="w-4 h-4" /> },
  ] as const;

  // Totals
  const totalRevenue = PL_DATA.revenue.reduce((a, r) => a + r.amount, 0);
  const totalExpenses = PL_DATA.expenses.reduce((a, r) => a + r.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalAssets = BS_DATA.assets.reduce((a, r) => a + r.amount, 0);
  const totalLiabilities = BS_DATA.liabilities.reduce((a, r) => a + r.amount, 0);
  const totalEquity = BS_DATA.equity.reduce((a, r) => a + r.amount, 0);
  const tbDebit = TRIAL_BALANCE.reduce((a, r) => a + r.debit, 0);
  const tbCredit = TRIAL_BALANCE.reduce((a, r) => a + r.credit, 0);

  const handleExecuteQuery = async () => {
    setExecuting(true);
    setQueryError(null);
    try {
      const res = await fetch('/api/cycom/bi/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });
      const data = await res.json();
      if (res.ok) {
        setQueryResult(data);
      } else {
        setQueryError(data.error || 'Failed to execute query');
      }
    } catch (err: any) {
      setQueryError(err.message || 'Connection error');
    } finally {
      setExecuting(false);
    }
  };

  // Convert query rows for recharts visualization
  const getChartData = () => {
    if (!queryResult || queryResult.rows.length === 0) return [];
    const valKey = queryResult.columns.find(c => typeof queryResult.rows[0][c] === 'number') || queryResult.columns[1];
    const nameKey = queryResult.columns[0];
    
    return queryResult.rows.map(row => ({
      name: String(row[nameKey]),
      value: Number(row[valKey]) || 0
    }));
  };

  return (
    <div className="space-y-6 text-xs md:text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial & BI Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Run standard trial balances, P&L statements, or write custom SQL BI queries.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-transparent text-xs text-slate-300 outline-none" />
            <span className="text-slate-500">–</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-transparent text-xs text-slate-300 outline-none" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 hover:bg-white/10 transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 flex-wrap">
        {REPORTS.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeReport === r.id
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {r.icon}{r.label}
          </button>
        ))}
      </div>

      {/* Report Body */}
      <AnimatePresence mode="wait">
        {/* ── Profit & Loss ─────────────────────────────────────── */}
        {activeReport === 'profit-loss' && (
          <motion.div key="pl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Revenue',   value: fmt(totalRevenue),   color: 'text-emerald-400' },
                { label: 'Total Expenses',  value: fmt(totalExpenses),  color: 'text-red-400' },
                { label: 'Net Profit',      value: fmt(netProfit),      color: netProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
              ].map(c => (
                <div key={c.label} className="glass-card p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                  <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-white/5 pb-2">Revenue</h3>
                {PL_DATA.revenue.map(r => (
                  <div key={r.name} className="flex justify-between text-xs">
                    <span className="text-slate-300">{r.name}</span>
                    <span className="text-emerald-400 font-semibold">{fmt(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold pt-2 border-t border-white/5">
                  <span className="text-white">TOTAL REVENUE</span>
                  <span className="text-emerald-400">{fmt(totalRevenue)}</span>
                </div>
              </div>
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider border-b border-white/5 pb-2">Expenses</h3>
                {PL_DATA.expenses.map(r => (
                  <div key={r.name} className="flex justify-between text-xs">
                    <span className="text-slate-300">{r.name}</span>
                    <span className="text-red-400 font-semibold">{fmt(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold pt-2 border-t border-white/5">
                  <span className="text-white">TOTAL EXPENSES</span>
                  <span className="text-red-400">{fmt(totalExpenses)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Balance Sheet ─────────────────────────────────────── */}
        {activeReport === 'balance-sheet' && (
          <motion.div key="bs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Assets',      value: fmt(totalAssets),      color: 'text-blue-400' },
                { label: 'Total Liabilities', value: fmt(totalLiabilities), color: 'text-orange-400' },
                { label: 'Total Equity',      value: fmt(totalEquity),      color: 'text-purple-400' },
              ].map(c => (
                <div key={c.label} className="glass-card p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                  <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { title: 'Assets', color: 'text-blue-400', items: BS_DATA.assets, total: totalAssets },
                { title: 'Liabilities', color: 'text-orange-400', items: BS_DATA.liabilities, total: totalLiabilities },
                { title: 'Equity', color: 'text-purple-400', items: BS_DATA.equity, total: totalEquity },
              ].map(section => (
                <div key={section.title} className="glass-card p-4 space-y-2">
                  <h3 className={`text-xs font-bold uppercase tracking-wider border-b border-white/5 pb-2 ${section.color}`}>{section.title}</h3>
                  {section.items.map(item => (
                    <div key={item.name} className="flex justify-between text-xs">
                      <span className="text-slate-300">{item.name}</span>
                      <span className={`font-semibold ${section.color}`}>{fmt(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-bold pt-2 border-t border-white/5">
                    <span className="text-white">TOTAL</span>
                    <span className={section.color}>{fmt(section.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Trial Balance ─────────────────────────────────────── */}
        {activeReport === 'trial-balance' && (
          <motion.div key="tb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="text-left px-4 py-3 font-semibold">Code</th>
                    <th className="text-left px-4 py-3 font-semibold">Account Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Type</th>
                    <th className="text-right px-4 py-3 font-semibold">Debit</th>
                    <th className="text-right px-4 py-3 font-semibold">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {TRIAL_BALANCE.map(row => (
                    <tr key={row.code} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-purple-300">{row.code}</td>
                      <td className="px-4 py-2.5 text-white">{row.name}</td>
                      <td className="px-4 py-2.5 text-slate-400 capitalize">{row.type}</td>
                      <td className="px-4 py-2.5 text-right text-blue-300">{row.debit ? fmt(row.debit) : '—'}</td>
                      <td className="px-4 py-2.5 text-right text-orange-300">{row.credit ? fmt(row.credit) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── AP / AR Aging ─────────────────────────────────────── */}
        {(activeReport === 'ap-aging' || activeReport === 'ar-aging') && (
          <motion.div key="aging" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {(['ap-aging', 'ar-aging'] as const).map(agingType => {
              const data = agingType === 'ap-aging' ? AP_AGING : AR_AGING;
              const label = agingType === 'ap-aging' ? 'AP Aging — Vendor Bills' : 'AR Aging — Customer Invoices';
              const color = agingType === 'ap-aging' ? 'text-orange-400' : 'text-blue-400';
              const total = Object.values(data).reduce((a, b) => a + b, 0);
              return (
                <div key={agingType} className="glass-card p-4 space-y-3">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${color}`}>{label}</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(data).map(([bucket, amount]) => (
                      <div key={bucket} className="text-center">
                        <p className="text-xs text-slate-400 mb-1">{bucket} days</p>
                        <p className={`text-lg font-bold ${color}`}>{fmt(amount)}</p>
                        <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-current opacity-60 ${color}`} style={{ width: `${(amount / total) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── BI Custom SQL Report Builder ──────────────────────── */}
        {activeReport === 'custom-query' && (
          <motion.div key="query" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Query Builder Console */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Code className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">SQL BI Query Builder</h3>
                </div>
                <textarea
                  value={queryText}
                  onChange={e => setQueryText(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 font-mono text-xs text-white focus:border-purple-500 outline-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">Only SELECT statements are permitted for read operations.</span>
                  <button
                    onClick={handleExecuteQuery}
                    disabled={executing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Execute SQL
                  </button>
                </div>
              </div>

              {queryError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {queryError}
                </div>
              )}

              {/* Query Output Result Table */}
              {queryResult && (
                <div className="glass-card p-5 space-y-3 overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Query Results</h4>
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                          {queryResult.columns.map(col => (
                            <th key={col} className="py-2 px-3">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {queryResult.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/1">
                            {queryResult.columns.map(col => (
                              <td key={col} className="py-2 px-3 font-mono text-slate-300">{String(row[col])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Schema Reference & Chart Visualization */}
            <div className="space-y-6">
              {/* Chart Visualizer */}
              {queryResult && queryResult.rows.length > 0 && (
                <div className="glass-card p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Query Visual Chart</h3>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 10 }} />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* DB Schema Directory */}
              <div className="glass-card p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Directory</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto text-[11px] pr-1">
                  {[
                    { name: 'products', desc: 'SKU, prices, and catalog info' },
                    { name: 'warehouses', desc: 'Warehouses and retail showroom definitions' },
                    { name: 'stock_levels', desc: 'Current quantities per warehouse' },
                    { name: 'audit_logs', desc: 'Security actions with hash chain links' },
                    { name: 'mrp_production', desc: 'Active factory manufacturing orders' },
                    { name: 'employees', desc: 'HR registers and contract templates' },
                  ].map(tbl => (
                    <div key={tbl.name} className="p-2 rounded-lg bg-white/3 border border-white/5">
                      <p className="font-bold font-mono text-purple-300">{tbl.name}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{tbl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
