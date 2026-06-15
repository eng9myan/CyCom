'use client';

import React, { useState } from 'react';
import { ShoppingBag, DollarSign, AlertTriangle, ShieldCheck, Plus } from 'lucide-react';

const ORDER_ITEMS = [
  { id: 'ITM-901', name: 'Al-Ghazal Tea 500g', listPrice: 4.50, minPrice: 4.00, customPrice: 4.20, qty: 100, error: false },
  { id: 'ITM-902', name: 'Cycom Premium Halawa 1kg', listPrice: 6.00, minPrice: 5.50, customPrice: 5.20, qty: 50, error: true },
];

export default function SalesOrderCreation() {
  const [items, setItems] = useState(ORDER_ITEMS);
  const [customer, setCustomer] = useState('Cycom Trading Est');

  const updatePrice = (id: string, priceVal: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const hasError = priceVal < item.minPrice;
        return { ...item, customPrice: priceVal, error: hasError };
      }
      return item;
    }));
  };

  const total = items.reduce((acc, curr) => acc + (curr.customPrice * curr.qty), 0);
  const hasValidationExceptions = items.some(item => item.error);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Create Wholesale Sales Order</h1>
          <p className="page-subtitle">Compile wholesale distributions, edit order line prices, and evaluate pricing margin guards (cycom_sale_pricing_control).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns - Cart lines */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Order Lines</h2>
              <span className="badge badge-purple">{customer}</span>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-bold text-slate-200">{item.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500">SKU: {item.id} • List Price: JOD {item.listPrice.toFixed(2)}</span>
                    </div>
                    <span className="badge badge-cyan">Qty: {item.qty} units</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Override Unit Price (JOD)</label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="input-field font-mono"
                        value={item.customPrice}
                        onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-center text-xs">
                      {item.error ? (
                        <div className="text-rose-400 flex items-center gap-1.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>Price falls below minimum floor of <strong>JOD {item.minPrice.toFixed(2)}</strong>. Requires GM approval.</span>
                        </div>
                      ) : (
                        <div className="text-emerald-400 flex items-center gap-1.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                          <span>Line price is within approved bounds.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Summary */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Sales Order Checkout</h3>
            
            <div className="space-y-2 text-sm border-b border-white/5 pb-4 text-slate-400">
              <div className="flex justify-between">
                <span>Total Lines</span>
                <span className="text-white font-bold">{items.length} items</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated Total</span>
                <span className="text-white font-bold">JOD {total.toFixed(2)}</span>
              </div>
            </div>

            {hasValidationExceptions && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Validation Exceptions</span>
                </div>
                <p className="leading-relaxed">
                  One or more items in the order lines violate the minimum floor margin. 
                  Submitting will flag this order for Manager review (ag_sale_line_approval).
                </p>
              </div>
            )}

            <button className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm">
              <ShoppingBag className="w-5 h-5" /> 
              {hasValidationExceptions ? 'Submit for Line Approval' : 'Confirm & Disburse Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
