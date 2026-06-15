'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, Plus, Trash2, ArrowRight, ArrowLeft, 
  Star, Briefcase, FileText, CheckCircle2, ShieldCheck
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  rating: number; // 1-5 stars
  stage: 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Hired';
  dateApplied: string;
}

const INITIAL_CANDIDATES: Candidate[] = [
  { id: 'CAN-301', name: 'Tareq Al-Jaber', email: 'tareq.j@mail.jo', position: 'Senior Accountant', rating: 4, stage: 'Interview', dateApplied: '2026-06-10' },
  { id: 'CAN-302', name: 'Maya Khasawneh', email: 'maya.k@gmail.com', position: 'Warehouse Operator', rating: 3, stage: 'Applied', dateApplied: '2026-06-12' },
  { id: 'CAN-303', name: 'Zaid Haddad', email: 'zaid.h@outlook.com', position: 'Sales Specialist', rating: 5, stage: 'Offer', dateApplied: '2026-06-08' },
  { id: 'CAN-304', name: 'Lina Masri', email: 'lina.m@web.jo', position: 'Finance Manager', rating: 4, stage: 'Phone Screen', dateApplied: '2026-06-11' },
];

const STAGES: Array<'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Hired'> = [
  'Applied', 'Phone Screen', 'Interview', 'Offer', 'Hired'
];

const STAGE_COLORS = {
  Applied: 'border-slate-500/20 bg-slate-500/2',
  'Phone Screen': 'border-cyan-500/20 bg-cyan-500/2',
  Interview: 'border-purple-500/20 bg-purple-500/2',
  Offer: 'border-amber-500/20 bg-amber-500/2',
  Hired: 'border-emerald-500/20 bg-emerald-500/2',
};

export default function RecruitmentPage() {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);

  // New Candidate Form states
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPosition, setCandPosition] = useState('Senior Accountant');
  const [candRating, setCandRating] = useState('3');

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !candEmail) return;

    const newCand: Candidate = {
      id: `CAN-${Math.floor(305 + Math.random() * 200)}`,
      name: candName,
      email: candEmail,
      position: candPosition,
      rating: parseInt(candRating) || 3,
      stage: 'Applied',
      dateApplied: new Date().toISOString().split('T')[0]
    };

    setCandidates([...candidates, newCand]);
    setCandName('');
    setCandEmail('');
  };

  const promoteCandidate = (id: string) => {
    setCandidates(candidates.map(can => {
      if (can.id === id) {
        const idx = STAGES.indexOf(can.stage);
        const next = Math.min(idx + 1, STAGES.length - 1);
        return { ...can, stage: STAGES[next] };
      }
      return can;
    }));
  };

  const demoteCandidate = (id: string) => {
    setCandidates(candidates.map(can => {
      if (can.id === id) {
        const idx = STAGES.indexOf(can.stage);
        const prev = Math.max(idx - 1, 0);
        return { ...can, stage: STAGES[prev] };
      }
      return can;
    }));
  };

  const deleteCandidate = (id: string) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Recruitment & Hiring</h1>
          <p className="page-subtitle">Track job candidate applications, manage interviews timeline, and promote applicants through recruitment funnel.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Applicants</span>
            <p className="text-2xl font-black text-white">{candidates.length} candidates</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Star className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Interviews Schedule</span>
            <p className="text-2xl font-black text-white">
              {candidates.filter(c => c.stage === 'Interview').length} scheduled
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offers Out</span>
            <p className="text-2xl font-black text-[#F59E0B]">
              {candidates.filter(c => c.stage === 'Offer').length} pending
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hired this Month</span>
            <p className="text-2xl font-black text-[#10B981]">{candidates.filter(c => c.stage === 'Hired').length} onboarded</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column - Applicant Form */}
        <div className="glass-card p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Register Candidate Profile</h2>
            <Plus className="w-4 h-4 text-[#3B82F6]" />
          </div>

          <form onSubmit={handleAddCandidate} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Applicant Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Tareq Jaber" 
                value={candName}
                onChange={e => setCandName(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Email</label>
              <input 
                type="email" 
                required 
                placeholder="e.g. tareq@mail.jo" 
                value={candEmail}
                onChange={e => setCandEmail(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Job</label>
                <select 
                  value={candPosition} 
                  onChange={e => setCandPosition(e.target.value)}
                  className="input-field font-semibold"
                >
                  <option value="Senior Accountant">Senior Accountant</option>
                  <option value="Warehouse Operator">Warehouse Operator</option>
                  <option value="Sales Specialist">Sales Specialist</option>
                  <option value="Finance Manager">Finance Manager</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Init Rating</label>
                <select 
                  value={candRating} 
                  onChange={e => setCandRating(e.target.value)}
                  className="input-field"
                >
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Resume File</label>
              <div className="border border-dashed border-white/10 rounded-lg p-2.5 text-center text-slate-500 cursor-pointer hover:border-white/20 transition-all text-[10px]">
                Simulate Resume PDF Upload
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-2">
              Submit Candidate Application
            </button>
          </form>
        </div>

        {/* Right Column - Kanban Funnel */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
          {STAGES.map(stage => {
            const stageCands = candidates.filter(c => c.stage === stage);
            return (
              <div key={stage} className={`p-3 rounded-2xl border ${STAGE_COLORS[stage]} min-h-[460px] flex flex-col space-y-3`}>
                <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-white uppercase">{stage}</span>
                  <span className="text-[10px] bg-white/5 px-2 py-0.2 rounded font-mono text-slate-400 font-bold">{stageCands.length}</span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {stageCands.map(can => (
                    <div key={can.id} className="p-3.5 rounded-xl bg-[#0B0F19]/90 border border-white/5 hover:border-white/10 group transition-all space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-100 leading-snug">{can.name}</span>
                        <button 
                          onClick={() => deleteCandidate(can.id)}
                          className="p-0.5 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="text-[10px] text-[#5DADE2] font-semibold">{can.position}</div>
                      <div className="text-[9px] text-slate-500 truncate">{can.email}</div>

                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <div className="flex gap-0.5 text-[#F59E0B]">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-3 h-3 ${idx < can.rating ? 'fill-current' : 'opacity-20'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">{can.dateApplied}</span>
                      </div>

                      {/* Controls */}
                      <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                        {STAGES.indexOf(stage) > 0 ? (
                          <button 
                            onClick={() => demoteCandidate(can.id)}
                            className="p-1 rounded bg-white/3 hover:bg-white/8 text-slate-400"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>
                        ) : <div />}
                        {STAGES.indexOf(stage) < STAGES.length - 1 ? (
                          <button 
                            onClick={() => promoteCandidate(can.id)}
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
