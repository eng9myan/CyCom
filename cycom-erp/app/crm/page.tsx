'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Plus, ArrowRight, ArrowLeft, Trash2, 
  Sparkles, Star, ShieldAlert, Award, FileText
} from 'lucide-react';

interface LeadCard {
  id: string;
  clientName: string;
  expectedRevenue: number;
  probability: number; // percentage
  stage: 'New' | 'Qualified' | 'Proposition' | 'Won' | 'Lost';
  contact: string;
}

const INITIAL_LEADS: LeadCard[] = [
  { id: 'LD-101', clientName: 'Jordan Hypermarkets Corp.', expectedRevenue: 8500, probability: 70, stage: 'Proposition', contact: 'zaid@jordanhyper.com' },
  { id: 'LD-102', clientName: 'Zarqa Retail Dist.', expectedRevenue: 4200, probability: 40, stage: 'Qualified', contact: 'sales@zarqadist.com' },
  { id: 'LD-103', clientName: 'Irbid Cooperative', expectedRevenue: 1200, probability: 10, stage: 'New', contact: 'coop.irbid@info.jo' },
  { id: 'LD-104', clientName: 'Ramtha Trading House', expectedRevenue: 6000, probability: 95, stage: 'Won', contact: 'hassan@ramthatrade.com' },
  { id: 'LD-105', clientName: 'Amman Airport Stores', expectedRevenue: 9500, probability: 0, stage: 'Lost', contact: 'procurement@ammanair.com' },
];

const STAGES: Array<'New' | 'Qualified' | 'Proposition' | 'Won' | 'Lost'> = [
  'New', 'Qualified', 'Proposition', 'Won', 'Lost'
];

const STAGE_BG_STYLES = {
  New: 'border-slate-500/25 bg-slate-500/3',
  Qualified: 'border-cyan-500/25 bg-cyan-500/3',
  Proposition: 'border-purple-500/25 bg-purple-500/3',
  Won: 'border-emerald-500/25 bg-emerald-500/3',
  Lost: 'border-red-500/25 bg-red-500/3',
};

const STAGE_BORDER_HOVER = {
  New: 'hover:border-slate-500/40',
  Qualified: 'hover:border-cyan-500/40',
  Proposition: 'hover:border-purple-500/40',
  Won: 'hover:border-emerald-500/40',
  Lost: 'hover:border-red-500/40',
};

export default function CRMPage() {
  const [leads, setLeads] = useState<LeadCard[]>(INITIAL_LEADS);

  // New lead form
  const [client, setClient] = useState('');
  const [revenue, setRevenue] = useState('');
  const [prob, setProb] = useState('50');
  const [contact, setContact] = useState('');

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !revenue) return;

    const newLead: LeadCard = {
      id: `LD-${Math.floor(106 + Math.random() * 200)}`,
      clientName: client,
      expectedRevenue: parseFloat(revenue),
      probability: parseFloat(prob),
      stage: 'New',
      contact: contact || 'no-reply@lead.com'
    };

    setLeads([...leads, newLead]);
    setClient('');
    setRevenue('');
    setContact('');
  };

  const promoteLead = (id: string) => {
    setLeads(leads.map(ld => {
      if (ld.id === id) {
        const currIdx = STAGES.indexOf(ld.stage);
        const nextIdx = Math.min(currIdx + 1, STAGES.length - 1);
        // Automatically adjust probability based on stage
        let newProb = ld.probability;
        if (STAGES[nextIdx] === 'Won') newProb = 100;
        if (STAGES[nextIdx] === 'Lost') newProb = 0;
        if (STAGES[nextIdx] === 'Proposition') newProb = 75;
        return { ...ld, stage: STAGES[nextIdx], probability: newProb };
      }
      return ld;
    }));
  };

  const demoteLead = (id: string) => {
    setLeads(leads.map(ld => {
      if (ld.id === id) {
        const currIdx = STAGES.indexOf(ld.stage);
        const nextIdx = Math.max(currIdx - 1, 0);
        let newProb = ld.probability;
        if (STAGES[nextIdx] === 'New') newProb = 10;
        if (STAGES[nextIdx] === 'Qualified') newProb = 40;
        return { ...ld, stage: STAGES[nextIdx], probability: newProb };
      }
      return ld;
    }));
  };

  const deleteLead = (id: string) => {
    setLeads(leads.filter(l => l.id !== id));
  };

  // Calculate stats
  const totalPipeline = leads.filter(l => l.stage !== 'Lost').reduce((acc, curr) => acc + curr.expectedRevenue, 0);
  const weightedPipeline = leads.filter(l => l.stage !== 'Lost').reduce((acc, curr) => acc + (curr.expectedRevenue * (curr.probability / 100)), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">CRM & Opportunity Pipeline</h1>
          <p className="page-subtitle">Standard Odoo CRM sales pipeline. Drag/Promote opportunities, adjust probabilities, and evaluate pipeline values.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Pipeline Value</span>
            <p className="text-2xl font-black text-white">JOD {totalPipeline.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Weighted Forecast</span>
            <p className="text-2xl font-black text-[#10B981]">JOD {weightedPipeline.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Open Opportunities</span>
            <p className="text-2xl font-black text-[#F59E0B]">{leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').length} leads</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Star className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Won Deals</span>
            <p className="text-2xl font-black text-[#10B981]">{leads.filter(l => l.stage === 'Won').length} closed</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Creator form */}
        <div className="glass-card p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Add New Lead Opportunity</h2>
            <Plus className="w-4 h-4 text-[#A855F7]" />
          </div>

          <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Opportunity / Customer</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Zarqa Outlet Store" 
                value={client}
                onChange={e => setClient(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Expected JOD</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 5000" 
                  value={revenue}
                  onChange={e => setRevenue(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Prob %</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={prob}
                  onChange={e => setProb(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Email</label>
              <input 
                type="email" 
                placeholder="e.g. client@domain.jo" 
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2">
              Insert into Pipeline
            </button>
          </form>
        </div>

        {/* Kanban Board columns */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage);
            const stageRevenueSum = stageLeads.reduce((acc, curr) => acc + curr.expectedRevenue, 0);

            return (
              <div key={stage} className={`p-3 rounded-2xl border ${STAGE_BG_STYLES[stage]} space-y-3 min-h-[460px] flex flex-col`}>
                {/* Column header */}
                <div className="border-b border-white/5 pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-white uppercase">{stage}</span>
                    <span className="text-[9px] bg-white/5 px-2 py-0.2 rounded font-mono font-bold text-slate-400">{stageLeads.length}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-bold">JOD {stageRevenueSum.toLocaleString()}</p>
                </div>

                {/* Cards stack */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {stageLeads.map(ld => (
                    <div 
                      key={ld.id}
                      className={`p-3 rounded-xl bg-[#0B0F19]/90 border border-white/5 hover:border-white/12 shadow-sm space-y-2 group transition-all`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-white group-hover:text-[#E67E22] transition-colors leading-normal break-words max-w-[80%]">{ld.clientName}</span>
                        <button 
                          onClick={() => deleteLead(ld.id)}
                          className="p-0.5 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>JOD {ld.expectedRevenue}</span>
                        <span className="font-bold">{ld.probability}%</span>
                      </div>
                      
                      <div className="text-[9px] text-slate-500 truncate">{ld.contact}</div>

                      {/* Promotion arrows */}
                      <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                        {STAGES.indexOf(stage) > 0 ? (
                          <button 
                            onClick={() => demoteLead(ld.id)}
                            className="p-1 rounded bg-white/3 hover:bg-white/8 text-slate-400"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>
                        ) : <div />}
                        {STAGES.indexOf(stage) < STAGES.length - 1 ? (
                          <button 
                            onClick={() => promoteLead(ld.id)}
                            className="p-1 rounded bg-white/3 hover:bg-white/8 text-slate-400"
                          >
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ) : <div />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
