'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, Plus, Trash2, CheckCircle2, ShieldCheck, 
  UserPlus, User, Clock, AlertTriangle, ShieldAlert, CheckCircle
} from 'lucide-react';

interface HelpTicket {
  id: string;
  customerName: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedAgent: string;
  slaMinutes: number; // SLA timer countdown
  status: 'New' | 'In Progress' | 'Resolved';
}

const INITIAL_TICKETS: HelpTicket[] = [
  { id: 'TKT-501', customerName: 'Zaid Food Dist.', subject: 'Invoice JOD mismatch at checkin', priority: 'High', assignedAgent: 'Ahmad Masri', slaMinutes: 42, status: 'In Progress' },
  { id: 'TKT-502', customerName: 'Farah Markets', subject: 'ZK reader device connection timed out', priority: 'Medium', assignedAgent: 'Khaled Jaber', slaMinutes: 120, status: 'New' },
  { id: 'TKT-503', customerName: 'Jordan Hypermarkets', subject: 'Pricing margin lock bypass request', priority: 'High', assignedAgent: 'Sara Haddad', slaMinutes: 0, status: 'Resolved' },
  { id: 'TKT-504', customerName: 'General Importers', subject: 'BOM Cost Rollup calculation error', priority: 'Low', assignedAgent: 'None', slaMinutes: 300, status: 'New' },
];

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<HelpTicket[]>(INITIAL_TICKETS);

  // SLA countdown simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets(prev => prev.map(t => {
        if (t.status !== 'Resolved' && t.slaMinutes > 0) {
          return { ...t, slaMinutes: t.slaMinutes - 1 };
        }
        return t;
      }));
    }, 60000); // every minute
    return () => clearInterval(timer);
  }, []);

  // New ticket states
  const [subject, setSubject] = useState('');
  const [customer, setCustomer] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [desc, setDesc] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !customer) return;

    const newTkt: HelpTicket = {
      id: `TKT-${Math.floor(505 + Math.random() * 200)}`,
      customerName: customer,
      subject: subject,
      priority: priority,
      assignedAgent: 'None',
      slaMinutes: priority === 'High' ? 60 : priority === 'Medium' ? 180 : 360,
      status: 'New'
    };

    setTickets([newTkt, ...tickets]);
    setSubject('');
    setCustomer('');
    setDesc('');
  };

  const handleAssignTicket = (id: string, agent: string) => {
    setTickets(tickets.map(t => {
      if (t.id === id) {
        return {
          ...t,
          assignedAgent: agent,
          status: t.status === 'New' ? 'In Progress' : t.status
        };
      }
      return t;
    }));
  };

  const handleResolveTicket = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
  };

  const handleDeleteTicket = (id: string) => {
    setTickets(tickets.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Helpdesk Support Desk</h1>
          <p className="page-subtitle">Track incoming operator support tickets, monitor SLA timers, and allocate technical staff assignments.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Tickets</span>
            <p className="text-2xl font-black text-white">
              {tickets.filter(t => t.status !== 'Resolved').length} tickets
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Critical (SLA Alert)</span>
            <p className="text-2xl font-black text-[#EF4444]">
              {tickets.filter(t => t.status !== 'Resolved' && t.priority === 'High' && t.slaMinutes < 45).length} tickets
            </p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unassigned Tasks</span>
            <p className="text-2xl font-black text-[#F59E0B]">
              {tickets.filter(t => t.assignedAgent === 'None' && t.status !== 'Resolved').length} tickets
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resolved Tickets</span>
            <p className="text-2xl font-black text-[#10B981]">{tickets.filter(t => t.status === 'Resolved').length} closed</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Form */}
        <div className="glass-card p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Create Support Ticket</h2>
            <Plus className="w-4 h-4 text-[#A855F7]" />
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Customer Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Irbid Outlet Depot" 
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Ticket Subject</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Printer offline error" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Priority Category</label>
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value as any)}
                className="input-field font-semibold"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority (SLA 1hr)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Issue Description</label>
              <input 
                type="text" 
                placeholder="Enter details on issue..." 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2">
              Generate Ticket
            </button>
          </form>
        </div>

        {/* Right Column - Tickets Grid */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-3">Active Tickets Queue</h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>SLA Timer</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs">{t.id}</td>
                    <td className="font-bold text-slate-300">{t.customerName}</td>
                    <td>{t.subject}</td>
                    <td>
                      <span className={`badge text-[9px] ${
                        t.priority === 'High' ? 'badge-red' :
                        t.priority === 'Medium' ? 'badge-orange' : 'badge-blue'
                      }`}>{t.priority}</span>
                    </td>
                    <td>
                      <select 
                        value={t.assignedAgent} 
                        onChange={e => handleAssignTicket(t.id, e.target.value)}
                        className="bg-transparent border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-slate-300 outline-none"
                      >
                        <option value="None">Unassigned</option>
                        <option value="Ahmad Masri">Ahmad Masri</option>
                        <option value="Sara Haddad">Sara Haddad</option>
                        <option value="Khaled Jaber">Khaled Jaber</option>
                      </select>
                    </td>
                    <td className="font-mono">
                      {t.status === 'Resolved' ? (
                        <span className="text-slate-500">-</span>
                      ) : t.slaMinutes <= 0 ? (
                        <span className="text-red-400 font-bold">Lapsed</span>
                      ) : (
                        <span className={`flex items-center gap-1 font-bold ${t.slaMinutes < 30 ? 'text-red-400' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3" /> {t.slaMinutes}m
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge text-[9px] ${
                        t.status === 'Resolved' ? 'badge-green' :
                        t.status === 'In Progress' ? 'badge-blue' : 'badge-yellow'
                      }`}>{t.status}</span>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        {t.status !== 'Resolved' && (
                          <button 
                            onClick={() => handleResolveTicket(t.id)}
                            className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981] text-[10px] font-bold"
                          >
                            Resolve
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteTicket(t.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-[#EF4444]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
