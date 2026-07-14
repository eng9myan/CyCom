'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, Plus, Search, Trash2, ArrowRightLeft, Calendar,
  Globe2, CheckCircle2, TrendingUp, Sparkles, RefreshCw, X
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Currency {
  id: string;
  name: string;
  symbol: string;
  rateToJod: number;
  isActive: boolean;
}

interface RateHistory {
  currency: string;
  date: string;
  rate: number;
}

// ── Seed Data ────────────────────────────────────────────────────────────────

const INITIAL_CURRENCIES: Currency[] = [
  { id: '1', name: 'JOD', symbol: 'د.أ', rateToJod: 1.0, isActive: true },
  { id: '2', name: 'USD', symbol: '$', rateToJod: 0.709, isActive: true },
  { id: '3', name: 'EUR', symbol: '€', rateToJod: 0.772, isActive: true },
  { id: '4', name: 'GBP', symbol: '£', rateToJod: 0.915, isActive: true },
  { id: '5', name: 'SAR', symbol: 'ر.س', rateToJod: 0.189, isActive: true },
  { id: '6', name: 'AED', symbol: 'د.إ', rateToJod: 0.193, isActive: true },
];

const INITIAL_HISTORY: RateHistory[] = [
  { currency: 'USD', date: '2026-07-14', rate: 0.7090 },
  { currency: 'EUR', date: '2026-07-14', rate: 0.7720 },
  { currency: 'GBP', date: '2026-07-14', rate: 0.9150 },
  { currency: 'SAR', date: '2026-07-13', rate: 0.1891 },
  { currency: 'AED', date: '2026-07-13', rate: 0.1931 },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CurrencySettingsPage() {
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [history, setHistory] = useState<RateHistory[]>(INITIAL_HISTORY);
  const [search, setSearch] = useState('');

  // Add Currency Form States
  const [newCode, setNewCode] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newRate, setNewRate] = useState('');

  // Update Rate Form States
  const [selectedCurrencyId, setSelectedCurrencyId] = useState('');
  const [updateRateVal, setUpdateRateVal] = useState('');

  // Convert States
  const [convFrom, setConvFrom] = useState('USD');
  const [convTo, setConvTo] = useState('JOD');
  const [convAmount, setConvAmount] = useState('100');

  // Computed conversion
  const conversionResult = useMemo(() => {
    const fromCurr = currencies.find(c => c.name === convFrom);
    const toCurr = currencies.find(c => c.name === convTo);
    const amt = parseFloat(convAmount);
    if (!fromCurr || !toCurr || isNaN(amt)) return 0;
    // convert from -> JOD
    const amtJod = amt * fromCurr.rateToJod;
    // convert JOD -> to
    return amtJod / toCurr.rateToJod;
  }, [convFrom, convTo, convAmount, currencies]);

  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newSymbol || !newRate) return;
    const rateVal = parseFloat(newRate);
    if (isNaN(rateVal) || rateVal <= 0) return;

    const newCurr: Currency = {
      id: String(currencies.length + 1),
      name: newCode.toUpperCase(),
      symbol: newSymbol,
      rateToJod: rateVal,
      isActive: true
    };
    setCurrencies([...currencies, newCurr]);

    // Also add to history
    const histEntry: RateHistory = {
      currency: newCode.toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      rate: rateVal
    };
    setHistory([histEntry, ...history]);

    setNewCode('');
    setNewSymbol('');
    setNewRate('');
  };

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCurrencyId || !updateRateVal) return;
    const newRateNum = parseFloat(updateRateVal);
    if (isNaN(newRateNum) || newRateNum <= 0) return;

    const targetCurr = currencies.find(c => c.id === selectedCurrencyId);
    if (!targetCurr) return;

    setCurrencies(currencies.map(c => c.id === selectedCurrencyId ? { ...c, rateToJod: newRateNum } : c));

    // add to history
    const histEntry: RateHistory = {
      currency: targetCurr.name,
      date: new Date().toISOString().split('T')[0],
      rate: newRateNum
    };
    setHistory([histEntry, ...history]);

    setSelectedCurrencyId('');
    setUpdateRateVal('');
  };

  const filteredCurrencies = currencies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs md:text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-400" /> Multi-Currency & Rates
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure active currencies, exchange rate histories, and live conversions.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Currencies Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Currencies</h2>
              <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-2 py-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" placeholder="Search currency..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none w-28 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="text-left py-2 font-semibold">Currency Code</th>
                    <th className="text-left py-2 font-semibold">Symbol</th>
                    <th className="text-right py-2 font-semibold">Rate to JOD (Base)</th>
                    <th className="text-center py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCurrencies.map(c => (
                    <tr key={c.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                      <td className="py-2.5 font-bold text-white">{c.name}</td>
                      <td className="py-2.5 text-slate-300 font-mono">{c.symbol}</td>
                      <td className="py-2.5 text-right font-semibold text-amber-400">
                        {c.rateToJod.toFixed(4)} <span className="text-[10px] text-slate-500">JOD</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rate Update History */}
          <div className="glass-card p-4 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Exchange Rate Logs</h2>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {history.map((hist, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/3 p-2 rounded-lg border border-white/3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300">{hist.date}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{hist.currency}</span>
                  <span className="text-amber-400 font-semibold">{hist.rate.toFixed(4)} JOD</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configurations Forms Column */}
        <div className="space-y-6">
          
          {/* Quick Rate Update */}
          <div className="glass-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Update Rate
            </h2>
            <form onSubmit={handleUpdateRate} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Select Currency</label>
                <select 
                  value={selectedCurrencyId} onChange={e => setSelectedCurrencyId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/40"
                >
                  <option value="" className="bg-slate-900 text-slate-400">-- Choose --</option>
                  {currencies.filter(c => c.name !== 'JOD').map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name} ({c.symbol})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">New Rate to JOD</label>
                <input 
                  type="number" step="any" placeholder="e.g. 0.7090"
                  value={updateRateVal} onChange={e => setUpdateRateVal(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500/40"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all"
              >
                Apply Exchange Rate
              </button>
            </form>
          </div>

          {/* Quick Converter Bridge (Dry Run Tool) */}
          <div className="glass-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-purple-400" /> Conversion Calculator
            </h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">From</label>
                  <select 
                    value={convFrom} onChange={e => setConvFrom(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {currencies.map(c => <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end justify-center pb-2">
                  <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">To</label>
                  <select 
                    value={convTo} onChange={e => setConvTo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {currencies.map(c => <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Amount</label>
                <input 
                  type="number" value={convAmount} onChange={e => setConvAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="bg-white/3 border border-white/5 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Converted Value</span>
                <span className="text-lg font-black text-white">
                  {convTo} {conversionResult.toLocaleString('en', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                </span>
              </div>
            </div>
          </div>

          {/* Add New Currency */}
          <div className="glass-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Add Currency
            </h2>
            <form onSubmit={handleAddCurrency} className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Code</label>
                  <input 
                    type="text" placeholder="e.g. KWD" maxLength={3}
                    value={newCode} onChange={e => setNewCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Symbol</label>
                  <input 
                    type="text" placeholder="e.g. د.ك"
                    value={newSymbol} onChange={e => setNewSymbol(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Rate to JOD</label>
                <input 
                  type="number" step="any" placeholder="e.g. 2.30"
                  value={newRate} onChange={e => setNewRate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-all"
              >
                Register Currency
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
