'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, CheckCircle, XCircle, ArrowRight, Plus, 
  HelpCircle, Sparkles, Clipboard, AlertCircle, ShoppingBag
} from 'lucide-react';

interface PurchaseStage {
  code: string;
  name: string;
  approverRole: string;
}

interface PurchaseOrder {
  id: string;
  vendorName: string;
  date: string;
  total: number;
  purchaseType: string;
  currentStageIdx: number;
  stages: PurchaseStage[];
  status: 'Draft' | 'Waiting Approval' | 'Confirmed' | 'Declined';
  pendingUserRole: string;
}

const STAGES_LIST = {
  standard: [
    { code: 'inv_mgr', name: 'Inventory Manager', approverRole: 'Inventory Manager' }
  ],
  intermediate: [
    { code: 'inv_mgr', name: 'Inventory Manager', approverRole: 'Inventory Manager' },
    { code: 'fin_dir', name: 'Finance Director', approverRole: 'Finance Director' }
  ],
  major: [
    { code: 'inv_mgr', name: 'Inventory Manager', approverRole: 'Inventory Manager' },
    { code: 'fin_dir', name: 'Finance Director', approverRole: 'Finance Director' },
    { code: 'ceo_exec', name: 'Executive CEO', approverRole: 'Executive CEO' }
  ]
};

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'PO-2026-0089',
    vendorName: 'Zaid Food Dist.',
    date: '2026-06-14',
    total: 850,
    purchaseType: 'Standard Purchase (<1K JOD)',
    currentStageIdx: 0,
    stages: STAGES_LIST.standard,
    status: 'Waiting Approval',
    pendingUserRole: 'Inventory Manager'
  },
  {
    id: 'PO-2026-0090',
    vendorName: 'Amman Packaging Co.',
    date: '2026-06-13',
    total: 3400,
    purchaseType: 'Intermediate Purchase (1K-5K JOD)',
    currentStageIdx: 0,
    stages: STAGES_LIST.intermediate,
    status: 'Waiting Approval',
    pendingUserRole: 'Inventory Manager'
  },
  {
    id: 'PO-2026-0091',
    vendorName: 'Saida Olive Oil Ltd.',
    date: '2026-06-12',
    total: 8200,
    purchaseType: 'Major Procurement (>5K JOD)',
    currentStageIdx: 1, // Approved by Inventory Mgr already
    stages: STAGES_LIST.major,
    status: 'Waiting Approval',
    pendingUserRole: 'Finance Director'
  },
  {
    id: 'PO-2026-0088',
    vendorName: 'General Importers',
    date: '2026-06-11',
    total: 450,
    purchaseType: 'Standard Purchase (<1K JOD)',
    currentStageIdx: 0,
    stages: STAGES_LIST.standard,
    status: 'Confirmed',
    pendingUserRole: 'None'
  }
];

export default function PurchasePage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [currentUserRole, setCurrentUserRole] = useState('Inventory Manager'); // toggle role to simulate approvals

  // RFQ Creator Form
  const [vendor, setVendor] = useState('');
  const [totalVal, setTotalVal] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  // Auto-route helper
  const determineStagesAndType = (amount: number) => {
    if (amount < 1000) {
      return { type: 'Standard Purchase (<1K JOD)', stages: STAGES_LIST.standard };
    } else if (amount <= 5000) {
      return { type: 'Intermediate Purchase (1K-5K JOD)', stages: STAGES_LIST.intermediate };
    } else {
      return { type: 'Major Procurement (>5K JOD)', stages: STAGES_LIST.major };
    }
  };

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !totalVal) return;
    const amount = parseFloat(totalVal);
    const { type, stages } = determineStagesAndType(amount);

    const newPO: PurchaseOrder = {
      id: `PO-2026-00${purchaseOrders.length + 90}`,
      vendorName: vendor,
      date: new Date().toISOString().split('T')[0],
      total: amount,
      purchaseType: type,
      currentStageIdx: 0,
      stages: stages,
      status: 'Draft',
      pendingUserRole: 'None'
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    setVendor('');
    setTotalVal('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleConfirmDraft = (id: string) => {
    setPurchaseOrders(purchaseOrders.map(po => {
      if (po.id === id) {
        return {
          ...po,
          status: 'Waiting Approval',
          pendingUserRole: po.stages[0].approverRole
        };
      }
      return po;
    }));
  };

  const handleApprovePO = (id: string) => {
    setPurchaseOrders(purchaseOrders.map(po => {
      if (po.id === id) {
        const nextIdx = po.currentStageIdx + 1;
        if (nextIdx >= po.stages.length) {
          // Final stage reached
          return {
            ...po,
            currentStageIdx: nextIdx,
            status: 'Confirmed',
            pendingUserRole: 'None'
          };
        } else {
          // Advance to next stage
          return {
            ...po,
            currentStageIdx: nextIdx,
            pendingUserRole: po.stages[nextIdx].approverRole
          };
        }
      }
      return po;
    }));
  };

  const handleDeclinePO = (id: string) => {
    setPurchaseOrders(purchaseOrders.map(po => {
      if (po.id === id) {
        return {
          ...po,
          status: 'Declined',
          pendingUserRole: 'None'
        };
      }
      return po;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Purchase & RFQ Approvals</h1>
          <p className="page-subtitle">Standard Odoo Purchase workflows integrated with Al-Tanmya Multi-Stage threshold approvals.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-slate-500 self-center">Current Approver Persona:</span>
          <select 
            value={currentUserRole}
            onChange={e => setCurrentUserRole(e.target.value)}
            className="input-field py-1 text-xs font-bold text-white border-white/10"
            style={{ width: '180px' }}
          >
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Finance Director">Finance Director</option>
            <option value="Executive CEO">Executive CEO (CEO)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Creator form */}
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Request for Quotation (RFQ)</h2>
              <ShoppingBag className="w-4 h-4 text-[#2DD4BF]" />
            </div>

            {successMsg ? (
              <div className="h-[180px] flex flex-col items-center justify-center text-center space-y-3 text-xs text-emerald-400">
                <CheckCircle className="w-10 h-10 animate-bounce" />
                <div>
                  <p className="font-bold">RFQ Draft Created Successfully</p>
                  <p className="text-[10px] text-slate-500 mt-1">Check the ledger below and click 'Confirm' to submit to approvals flow.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateRFQ} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Supplier / Vendor</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Amman Packaging Co." 
                    value={vendor}
                    onChange={e => setVendor(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Estimated Total Cost (JOD)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 1500" 
                    value={totalVal}
                    onChange={e => setTotalVal(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-2 text-[10px] leading-relaxed text-slate-400">
                  <p className="font-bold text-slate-300">Tanmya Flow Rules:</p>
                  <ul className="list-disc pl-3.5 space-y-0.5">
                    <li>&lt; JOD 1,000: <strong>1 stage</strong> (Inventory Mgr)</li>
                    <li>JOD 1,000 - 5,000: <strong>2 stages</strong> (Inventory Mgr ➔ Finance)</li>
                    <li>&gt; JOD 5,000: <strong>3 stages</strong> (Inventory Mgr ➔ Finance ➔ CEO)</li>
                  </ul>
                </div>

                <button type="submit" className="btn-primary w-full py-2">
                  Create RFQ Draft
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column - Approval queue & registry */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Approvals Queue */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">My Approvals Inbox</h2>
              <span className="badge badge-cyan text-[8px]">ALTANMYA_Purchase_Extension</span>
            </div>

            <div className="space-y-3">
              {purchaseOrders.filter(po => po.status === 'Waiting Approval' && po.pendingUserRole === currentUserRole).length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No purchase orders awaiting your approval at this time.</p>
              ) : (
                purchaseOrders.filter(po => po.status === 'Waiting Approval' && po.pendingUserRole === currentUserRole).map(po => (
                  <div key={po.id} className="p-4 rounded-xl bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{po.id}</span>
                        <span className="text-[10px] text-slate-500">{po.date}</span>
                        <span className="text-[9px] bg-white/5 px-2 py-0.2 rounded border border-white/10 text-slate-400 font-bold uppercase">{po.purchaseType}</span>
                      </div>
                      <p className="text-xs text-slate-300">Supplier: <strong>{po.vendorName}</strong> · Total Value: <strong className="text-emerald-400">JOD {po.total}</strong></p>
                      
                      {/* Stage indicator progress */}
                      <div className="flex gap-2 items-center text-[10px] pt-1">
                        <span className="text-slate-500">Routing stages:</span>
                        {po.stages.map((stg, sIdx) => (
                          <React.Fragment key={stg.code}>
                            <span className={sIdx === po.currentStageIdx ? 'text-[#2DD4BF] font-black' : sIdx < po.currentStageIdx ? 'text-slate-500 line-through' : 'text-slate-600'}>
                              {stg.name}
                            </span>
                            {sIdx < po.stages.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-slate-600" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprovePO(po.id)}
                        className="btn-primary py-1.5 px-3 flex items-center gap-1.5 text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleDeclinePO(po.id)}
                        className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PO Ledger */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-3">Purchase Order Registry</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>Vendor</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Approval Flow</th>
                    <th>Pending Action</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map(po => (
                    <tr key={po.id}>
                      <td className="font-mono text-xs">{po.id}</td>
                      <td className="font-bold text-slate-300">{po.vendorName}</td>
                      <td>{po.date}</td>
                      <td className="font-black">JOD {po.total}</td>
                      <td className="text-xs text-slate-500">{po.purchaseType.split(' ')[0]}</td>
                      <td className="font-bold text-slate-400">{po.pendingUserRole}</td>
                      <td>
                        <span className={`badge text-[9px] ${
                          po.status === 'Confirmed' ? 'badge-green' :
                          po.status === 'Draft' ? 'badge-blue' :
                          po.status === 'Declined' ? 'badge-red' : 'badge-yellow'
                        }`}>{po.status}</span>
                      </td>
                      <td className="text-right">
                        {po.status === 'Draft' && (
                          <button 
                            onClick={() => handleConfirmDraft(po.id)}
                            className="p-1 px-2 text-[10px] font-bold rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-[#00F0FF]"
                          >
                            Confirm RFQ
                          </button>
                        )}
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
