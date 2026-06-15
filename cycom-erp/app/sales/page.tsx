'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, ShieldAlert, CheckCircle, XCircle, 
  HelpCircle, DollarSign, ArrowUpRight, Lock, Unlock, AlertTriangle
} from 'lucide-react';

interface SalesOrder {
  id: string;
  clientName: string;
  date: string;
  total: number;
  status: 'Draft' | 'Confirmed' | 'Pending Approval';
}

interface PriceViolationItem {
  sku: string;
  name: string;
  category: string;
  minAllowedMargin: number; // percentage
  offeredMargin: number; // percentage
  baseCost: number;
  offeredPrice: number;
}

interface ExceptionOrder {
  id: string;
  clientName: string;
  itemName: string;
  standardPrice: number;
  offeredPrice: number;
  discountPct: number;
  allowedLimitPct: number;
  status: 'pending' | 'approved' | 'rejected';
}

const INITIAL_ORDERS: SalesOrder[] = [
  { id: 'SO-1011', clientName: 'Jordan Hypermarkets', date: '2026-06-14', total: 4200, status: 'Pending Approval' },
  { id: 'SO-1012', clientName: 'Samer Wholesale Est.', date: '2026-06-13', total: 1250, status: 'Confirmed' },
  { id: 'SO-1013', clientName: 'Aqaba General Supply', date: '2026-06-13', total: 6800, status: 'Draft' },
  { id: 'SO-1014', clientName: 'Rami Retail Stores', date: '2026-06-12', total: 850, status: 'Pending Approval' },
];

const INITIAL_VIOLATIONS: PriceViolationItem[] = [
  { sku: 'MILK-POW-400G', name: 'Cycom Milk Powder 400g', category: 'Dairy', minAllowedMargin: 15, offeredMargin: 11.2, baseCost: 4.80, offeredPrice: 5.40 },
  { sku: 'OLIVE-OIL-1L', name: 'Premium Olive Oil 1L', category: 'Oils', minAllowedMargin: 20, offeredMargin: 17.5, baseCost: 6.20, offeredPrice: 7.50 },
];

const INITIAL_EXCEPTIONS: ExceptionOrder[] = [
  { id: 'SO-1011', clientName: 'Jordan Hypermarkets', itemName: 'Cycom Milk Powder 400g (Bulk)', standardPrice: 6.00, offeredPrice: 4.50, discountPct: 25, allowedLimitPct: 15, status: 'pending' },
  { id: 'SO-1014', clientName: 'Rami Retail Stores', itemName: 'Premium Olive Oil 1L (Carton)', standardPrice: 8.50, offeredPrice: 7.00, discountPct: 17.6, allowedLimitPct: 10, status: 'pending' },
  { id: 'SO-1009', clientName: 'Ajloun General Foods', itemName: 'Canned Hummus 24-Pack', standardPrice: 15.00, offeredPrice: 12.00, discountPct: 20, allowedLimitPct: 12, status: 'approved' },
];

export default function SalesDashboard() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_ORDERS);
  const [exceptions, setExceptions] = useState<ExceptionOrder[]>(INITIAL_EXCEPTIONS);
  const [pricingLock, setPricingLock] = useState(true);

  // New sales order form state
  const [clientName, setClientName] = useState('');
  const [orderTotal, setOrderTotal] = useState('');

  // Discount exception requester form
  const [reqClient, setReqClient] = useState('Jordan Hypermarkets');
  const [reqItem, setReqItem] = useState('');
  const [reqStdPrice, setReqStdPrice] = useState('');
  const [reqOffPrice, setReqOffPrice] = useState('');
  const [reqLimit, setReqLimit] = useState('10');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !orderTotal) return;
    
    // Check if total is suspiciously low / discount triggers
    const requiresApproval = parseFloat(orderTotal) > 3000;

    const newOrder: SalesOrder = {
      id: `SO-${Math.floor(1015 + Math.random() * 500)}`,
      clientName: clientName,
      date: new Date().toISOString().split('T')[0],
      total: parseFloat(orderTotal),
      status: requiresApproval ? 'Pending Approval' : 'Draft'
    };

    setSalesOrders([newOrder, ...salesOrders]);
    setClientName('');
    setOrderTotal('');
  };

  const handleApproveException = (id: string, client: string) => {
    setExceptions(exceptions.map(exc => exc.id === id && exc.clientName === client ? { ...exc, status: 'approved' } : exc));
    
    // Update matching sales order to confirmed
    setSalesOrders(salesOrders.map(so => so.id === id ? { ...so, status: 'Confirmed' } : so));
  };

  const handleRejectException = (id: string, client: string) => {
    setExceptions(exceptions.map(exc => exc.id === id && exc.clientName === client ? { ...exc, status: 'rejected' } : exc));
    
    // Update matching sales order to draft / cancelled
    setSalesOrders(salesOrders.map(so => so.id === id ? { ...so, status: 'Draft' } : so));
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqItem || !reqStdPrice || !reqOffPrice) return;
    const std = parseFloat(reqStdPrice);
    const off = parseFloat(reqOffPrice);
    const disc = ((std - off) / std) * 100;

    const newExc: ExceptionOrder = {
      id: `SO-${Math.floor(1015 + Math.random() * 500)}`,
      clientName: reqClient,
      itemName: reqItem,
      standardPrice: std,
      offeredPrice: off,
      discountPct: parseFloat(disc.toFixed(1)),
      allowedLimitPct: parseFloat(reqLimit),
      status: 'pending'
    };

    setExceptions([newExc, ...exceptions]);
    setReqItem('');
    setReqStdPrice('');
    setReqOffPrice('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Sales & Pricing Command</h1>
          <p className="page-subtitle">Track wholesale distributor contracts, audit cost-margins, enforce minimum pricing limits, and approve discount exceptions.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setPricingLock(!pricingLock)}
            className={`btn-${pricingLock ? 'primary' : 'secondary'} flex items-center gap-2`}
          >
            {pricingLock ? (
              <>
                <Lock className="w-4 h-4 text-emerald-400" /> Margin Limit Locked
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-red-400" /> Margin Limit Unlocked
              </>
            )}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Pipeline JOD</span>
            <p className="text-2xl font-black text-white">JOD {salesOrders.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending exceptions</span>
            <p className="text-2xl font-black text-[#F59E0B]">
              {exceptions.filter(e => e.status === 'pending').length} lines
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pricing Control</span>
            <p className="text-xl font-black text-[#EF4444] mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
              {pricingLock ? 'Active Enforce' : 'Warning Only'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Distributors</span>
            <p className="text-2xl font-black text-[#10B981]">12 Wholesalers</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main workspace grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Pricing control violations & Lock Status */}
        <div className="space-y-6">
          
          {/* Price Violations (Cost Blocked) */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Pricing Margin Audit</h2>
              <span className="text-[10px] bg-red-500/20 text-[#EF4444] border border-red-500/30 px-2 py-0.5 rounded font-bold">
                cycom_sale_pricing_control
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-normal">
                  {pricingLock ? (
                    <span><strong>Active block mode:</strong> Orders containing items below minimum margin limits cannot be processed. Raise margins or submit exception.</span>
                  ) : (
                    <span><strong>Warning mode:</strong> Margin check active but not blocking order entry. Violations logged to audit journal.</span>
                  )}
                </p>
              </div>

              {INITIAL_VIOLATIONS.map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/3 border border-white/5 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-white">{item.name}</p>
                      <p className="text-[9px] font-mono text-slate-500">{item.sku} · {item.category}</p>
                    </div>
                    <span className="badge text-[8px] badge-red">margin violation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] border-t border-white/5 pt-2 font-mono">
                    <div>
                      <p className="text-slate-500">Base Cost</p>
                      <p className="text-slate-300">JOD {item.baseCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Offered</p>
                      <p className="text-red-400 font-bold">JOD {item.offeredPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500">Margin</p>
                      <p className="text-red-400 font-bold">{item.offeredMargin}% <span className="text-slate-500">/{item.minAllowedMargin}%</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Sales Order Form */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">Record New Sales Draft</h3>
            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Client / Wholesaler</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Zarqa Retail Group" 
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Total Order Value (JOD)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 1500" 
                  value={orderTotal}
                  onChange={e => setOrderTotal(e.target.value)}
                  className="input-field font-mono"
                />
                <p className="text-[9px] text-slate-500 pt-0.5">Note: Orders exceeding JOD 3,000 will automatically route to Sales Manager for validation check.</p>
              </div>
              <button type="submit" className="btn-primary w-full py-2">
                Create Sales Order
              </button>
            </form>
          </div>

        </div>

        {/* Right Column - Discount exceptions & Sales Lines approvals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Discount Exception Queue */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Discount Exception Approval Queue</h2>
              <span className="text-[10px] bg-amber-500/20 text-[#F59E0B] border border-[#F59E0B]/30 px-2 py-0.5 rounded font-bold">
                ag_sale_line_approval
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Client Name</th>
                    <th>Product Line Item</th>
                    <th>Std Price</th>
                    <th>Offered</th>
                    <th>Discount</th>
                    <th>Limit</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map((exc, i) => (
                    <tr key={i}>
                      <td className="font-mono text-xs">{exc.id}</td>
                      <td className="font-semibold text-slate-300">{exc.clientName}</td>
                      <td>{exc.itemName}</td>
                      <td className="font-mono">JOD {exc.standardPrice.toFixed(2)}</td>
                      <td className="font-mono font-bold text-white">JOD {exc.offeredPrice.toFixed(2)}</td>
                      <td className="text-red-400 font-bold">{exc.discountPct}%</td>
                      <td className="text-slate-500">{exc.allowedLimitPct}%</td>
                      <td>
                        <span className={`badge text-[9px] ${
                          exc.status === 'approved' ? 'badge-green' :
                          exc.status === 'rejected' ? 'badge-red' : 'badge-yellow'
                        }`}>{exc.status}</span>
                      </td>
                      <td className="text-right">
                        {exc.status === 'pending' && (
                          <div className="flex gap-1 justify-end">
                            <button 
                              onClick={() => handleApproveException(exc.id, exc.clientName)}
                              className="p-1 rounded hover:bg-emerald-500/20 text-[#10B981]"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleRejectException(exc.id, exc.clientName)}
                              className="p-1 rounded hover:bg-red-500/20 text-[#EF4444]"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exception Request Simulator */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Request Discount Exception Line</h2>
              <span className="text-[10px] bg-blue-500/20 text-[#5DADE2] border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                sale_discount_exception_approval
              </span>
            </div>

            <form onSubmit={handleCreateRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Wholesale Client</label>
                  <select 
                    value={reqClient} 
                    onChange={e => setReqClient(e.target.value)}
                    className="input-field"
                  >
                    <option value="Jordan Hypermarkets">Jordan Hypermarkets</option>
                    <option value="Rami Retail Stores">Rami Retail Stores</option>
                    <option value="Aqaba General Supply">Aqaba General Supply</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Product Line Description</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Premium Basmati Rice 10kg" 
                    value={reqItem}
                    onChange={e => setReqItem(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Std Price</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      placeholder="12.00" 
                      value={reqStdPrice}
                      onChange={e => setReqStdPrice(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Offered</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      placeholder="9.00" 
                      value={reqOffPrice}
                      onChange={e => setReqOffPrice(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Limit %</label>
                    <select 
                      value={reqLimit} 
                      onChange={e => setReqLimit(e.target.value)}
                      className="input-field"
                    >
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                      <option value="20">20%</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-end h-full">
                  <button type="submit" className="btn-primary w-full py-2">
                    Submit Discount Request Line
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sales Orders Draft List */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-3">Sales Orders Ledger</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Client / Wholesaler</th>
                    <th>Creation Date</th>
                    <th>Total Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesOrders.map(so => (
                    <tr key={so.id}>
                      <td className="font-mono text-xs">{so.id}</td>
                      <td className="font-bold text-slate-300">{so.clientName}</td>
                      <td>{so.date}</td>
                      <td className="font-bold text-white">JOD {so.total.toLocaleString()}</td>
                      <td>
                        <span className={`badge text-[9px] ${
                          so.status === 'Confirmed' ? 'badge-green' :
                          so.status === 'Pending Approval' ? 'badge-yellow' : 'badge-blue'
                        }`}>{so.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
