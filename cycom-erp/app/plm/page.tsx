'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Plus, Trash2, CheckCircle2, Calculator, 
  Settings2, Activity, ShieldAlert, AlertTriangle, FileText,
  Clock, GitBranch, ShieldCheck, ChevronRight, Play, CheckCircle
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BomNode {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  costPrice: number;
  scrapPct: number;
  subComponents?: BomNode[];
}

interface ManufacturingOrder {
  id: string;
  reference: string;
  productName: string;
  quantity: number;
  datePlanned: string;
  status: 'Draft' | 'Confirmed' | 'In Progress' | 'Done';
}

interface WorkOrder {
  id: string;
  operation: string;
  workCenter: string;
  durationPlanned: number;
  durationActual: number;
  status: 'Ready' | 'In Progress' | 'Paused' | 'Finished';
}

interface QualityCheck {
  id: string;
  moRef: string;
  operation: string;
  inspector: string;
  result: 'Pending' | 'Passed' | 'Failed';
}

// ── Seed Data ────────────────────────────────────────────────────────────────

const SEED_BOM: BomNode = {
  id: 'BOM-101',
  name: 'CyberCom Falcon SUV (Model S)',
  sku: 'VEH-FLC-SUV',
  quantity: 1,
  costPrice: 18500,
  scrapPct: 0,
  subComponents: [
    {
      id: 'COMP-101',
      name: 'SUV Steel Chassis Assembly',
      sku: 'CHA-STL-002',
      quantity: 1,
      costPrice: 4200,
      scrapPct: 2,
      subComponents: [
        { id: 'RAW-101', name: 'Structural Steel Beams H-Grade', sku: 'RAW-STL-H', quantity: 8, costPrice: 250, scrapPct: 5 },
        { id: 'RAW-102', name: 'Anti-Rust Coating Primer', sku: 'RAW-CHM-RST', quantity: 2, costPrice: 110, scrapPct: 10 },
      ]
    },
    {
      id: 'COMP-102',
      name: 'CyberDrive V6 Electric Powertrain',
      sku: 'DRV-V6-ELE',
      quantity: 1,
      costPrice: 6500,
      scrapPct: 0.5,
      subComponents: [
        { id: 'RAW-103', name: 'Neodymium Permanent Magnets', sku: 'RAW-MAG-NEO', quantity: 24, costPrice: 90, scrapPct: 0 },
        { id: 'RAW-104', name: 'High-Purity Copper Windings', sku: 'RAW-COP-WND', quantity: 15, costPrice: 45, scrapPct: 3 },
        { id: 'RAW-105', name: 'Silicon Carbide Inverter Mod', sku: 'INV-SIC-90', quantity: 1, costPrice: 1200, scrapPct: 0 },
      ]
    },
    {
      id: 'COMP-103',
      name: 'Falcon 90kWh Battery Pack',
      sku: 'BAT-FAL-90',
      quantity: 1,
      costPrice: 5800,
      scrapPct: 0,
      subComponents: [
        { id: 'RAW-106', name: 'Lithium-Ion Cylindrical Cells 2170', sku: 'CEL-LI-2170', quantity: 4800, costPrice: 0.90, scrapPct: 1 },
        { id: 'RAW-107', name: 'Battery Thermal Liquid Manifold', sku: 'BAT-TMS-LQR', quantity: 1, costPrice: 680, scrapPct: 2 },
      ]
    },
  ]
};

const SEED_MO: ManufacturingOrder[] = [
  { id: '1', reference: 'MO/2026/07/0001', productName: 'CyberCom Falcon SUV (Model S)', quantity: 12, datePlanned: '2026-07-20', status: 'In Progress' },
  { id: '2', reference: 'MO/2026/07/0002', productName: 'CyberDrive V6 Electric Powertrain', quantity: 24, datePlanned: '2026-07-22', status: 'Confirmed' },
  { id: '3', reference: 'MO/2026/07/0003', productName: 'Falcon 90kWh Battery Pack', quantity: 30, datePlanned: '2026-07-24', status: 'Draft' },
];

const SEED_WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-101', operation: 'Chassis Weld & Alignment', workCenter: 'WC-01 (Weld Shop)', durationPlanned: 120, durationActual: 95, status: 'Finished' },
  { id: 'WO-102', operation: 'Powertrain Mount & Integration', workCenter: 'WC-03 (Assembly Line A)', durationPlanned: 180, durationActual: 180, status: 'In Progress' },
  { id: 'WO-103', operation: 'Battery Pack Fitting & Connection', workCenter: 'WC-03 (Assembly Line A)', durationPlanned: 90, durationActual: 0, status: 'Ready' },
  { id: 'WO-104', operation: 'Final Calibrations & Quality Roll', workCenter: 'WC-05 (Inspection Gate)', durationPlanned: 60, durationActual: 0, status: 'Ready' },
];

const SEED_QUALITY: QualityCheck[] = [
  { id: 'QC-101', moRef: 'MO/2026/07/0001', operation: 'Chassis Weld & Alignment', inspector: 'Samer Khoury', result: 'Passed' },
  { id: 'QC-102', moRef: 'MO/2026/07/0001', operation: 'Powertrain Mount & Integration', inspector: 'Lina Al-Hasan', result: 'Pending' },
  { id: 'QC-103', moRef: 'MO/2026/07/0002', operation: 'Battery Pack Cell Integration', inspector: 'Samer Khoury', result: 'Passed' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PLMPage() {
  const [bom, setBom] = useState<BomNode>(SEED_BOM);
  const [mos, setMos] = useState<ManufacturingOrder[]>(SEED_MO);
  const [wos, setWos] = useState<WorkOrder[]>(SEED_WORK_ORDERS);
  const [qcs, setQcs] = useState<QualityCheck[]>(SEED_QUALITY);

  // Form states for creating MO
  const [moQty, setMoQty] = useState('10');
  const [moDate, setMoDate] = useState('2026-07-25');

  // Rollup calculator
  const rollupCost = useMemo(() => {
    const sumNode = (node: BomNode): number => {
      if (!node.subComponents || node.subComponents.length === 0) {
        return node.costPrice * (1 + node.scrapPct / 100);
      }
      return node.subComponents.reduce((acc, sub) => acc + (sub.quantity * sumNode(sub)), 0);
    };
    return sumNode(bom);
  }, [bom]);

  const handleCreateMO = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(moQty);
    if (isNaN(qty) || qty <= 0) return;

    const newMo: ManufacturingOrder = {
      id: String(mos.length + 1),
      reference: `MO/2026/07/${String(mos.length + 1).padStart(4, '0')}`,
      productName: bom.name,
      quantity: qty,
      datePlanned: moDate,
      status: 'Draft'
    };
    setMos([...mos, newMo]);
    setMoQty('10');
  };

  const handleStartWO = (id: string) => {
    setWos(prev => prev.map(wo => wo.id === id ? { ...wo, status: 'In Progress' } : wo));
  };

  const handleFinishWO = (id: string) => {
    setWos(prev => prev.map(wo => wo.id === id ? { ...wo, status: 'Finished', durationActual: wo.durationPlanned } : wo));
  };

  // Recursive Tree Node Renderer
  const RenderTreeNode = ({ node, depth = 0 }: { node: BomNode; depth: number }) => {
    const hasChildren = node.subComponents && node.subComponents.length > 0;
    return (
      <div className="space-y-1">
        <div 
          className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5 hover:bg-white/5 transition-colors"
          style={{ marginLeft: `${depth * 16}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <GitBranch className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{node.name}</p>
              <p className="text-[9px] text-slate-500">SKU: {node.sku} • Qty: {node.quantity}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold text-amber-400">JOD {(node.costPrice * node.quantity).toLocaleString()}</p>
            {node.scrapPct > 0 && <p className="text-[9px] text-red-400">Scrap: {node.scrapPct}%</p>}
          </div>
        </div>
        {hasChildren && node.subComponents?.map(child => (
          <RenderTreeNode key={child.id} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-xs md:text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500" /> PLM & Manufacturing Command
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure multi-level BOM trees, rollup costs recursively, and track routing shop floors.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Multi-Level BOM & Cost Rollup Tree */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Level Bill of Materials</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Recursive structure of {bom.name}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Cost Rollup</span>
                <span className="text-lg font-black text-amber-400">JOD {rollupCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              <RenderTreeNode node={bom} depth={0} />
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button 
                onClick={() => alert("BOM cost rolling completed successfully!")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-all"
              >
                <Calculator className="w-3.5 h-3.5" /> Force Cost Rollup
              </button>
            </div>
          </div>

          {/* Shop Floor Work Center Routings */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Routing Operations & Work Center Load</h2>
            <div className="space-y-3">
              {wos.map((wo, idx) => (
                <div key={wo.id} className="flex items-center justify-between bg-white/3 border border-white/3 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center font-bold text-slate-400">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{wo.operation}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{wo.workCenter} • Planned: {wo.durationPlanned} mins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      wo.status === 'Finished' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      wo.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {wo.status}
                    </span>
                    <div className="flex gap-2">
                      {wo.status === 'Ready' && (
                        <button onClick={() => handleStartWO(wo.id)} className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {wo.status === 'In Progress' && (
                        <button onClick={() => handleFinishWO(wo.id)} className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Manufacturing Orders & Quality Checks */}
        <div className="space-y-6">

          {/* Create MO Form */}
          <div className="glass-card p-4 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-500" /> Plan Production (MO)
            </h2>
            <form onSubmit={handleCreateMO} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Product</label>
                <div className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-semibold">
                  {bom.name}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quantity</label>
                  <input type="number" value={moQty} onChange={e => setMoQty(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Planned Date</label>
                  <input type="date" value={moDate} onChange={e => setMoDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none text-xs" />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-all">
                Confirm Manufacturing Order
              </button>
            </form>
          </div>

          {/* Active MO List */}
          <div className="glass-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Manufacturing Orders</h2>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {mos.map(mo => (
                <div key={mo.id} className="bg-white/3 border border-white/3 p-2.5 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-mono text-purple-300 font-semibold">{mo.reference}</p>
                    <p className="text-[9px] text-slate-400">{mo.productName} • Qty: {mo.quantity}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    mo.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400' :
                    mo.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 animate-pulse' :
                    mo.status === 'Confirmed' ? 'bg-indigo-500/10 text-indigo-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {mo.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Control Inspections */}
          <div className="glass-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Quality Control (QC)
            </h2>
            <div className="space-y-2">
              {qcs.map(qc => (
                <div key={qc.id} className="bg-white/3 border border-white/3 p-2.5 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-white">{qc.operation}</p>
                    <p className="text-[9px] text-slate-400">Order: {qc.moRef} • Insp: {qc.inspector}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    qc.result === 'Passed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    qc.result === 'Failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {qc.result}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
