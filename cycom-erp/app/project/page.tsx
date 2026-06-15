'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Plus, Trash2, ArrowRight, ArrowLeft, Clock, 
  CheckCircle, Play, FileText, CheckCircle2, User
} from 'lucide-react';

interface ProjectTask {
  id: string;
  title: string;
  project: string;
  assignee: string;
  estHours: number;
  loggedHours: number;
  stage: 'Backlog' | 'In Progress' | 'Review' | 'Done';
}

const INITIAL_TASKS: ProjectTask[] = [
  { id: 'TSK-201', title: 'Implement ZK Devices Log Parser', project: 'Biometrics Sync Integration', assignee: 'Ahmad Masri', estHours: 12, loggedHours: 8, stage: 'In Progress' },
  { id: 'TSK-202', title: 'Audit Medical Insurance Schema', project: 'HR Enhancements', assignee: 'Sara Haddad', estHours: 6, loggedHours: 6, stage: 'Done' },
  { id: 'TSK-203', title: 'Design POS Rounding Rules', project: 'POS Upgrade', assignee: 'Rami Khasawneh', estHours: 8, loggedHours: 0, stage: 'Backlog' },
  { id: 'TSK-204', title: 'Build Mass Reconciliation matching', project: 'Accounting Core', assignee: 'Khaled Jaber', estHours: 16, loggedHours: 14, stage: 'Review' },
];

const STAGES: Array<'Backlog' | 'In Progress' | 'Review' | 'Done'> = [
  'Backlog', 'In Progress', 'Review', 'Done'
];

const STAGE_COLORS = {
  Backlog: 'border-slate-500/20 bg-slate-500/2',
  'In Progress': 'border-cyan-500/20 bg-cyan-500/2',
  Review: 'border-purple-500/20 bg-purple-500/2',
  Done: 'border-emerald-500/20 bg-emerald-500/2',
};

export default function ProjectPage() {
  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_TASKS);
  
  // Task Creator Form
  const [taskTitle, setTaskTitle] = useState('');
  const [projName, setProjName] = useState('POS Upgrade');
  const [assignee, setAssignee] = useState('Ahmad Masri');
  const [estHours, setEstHours] = useState('8');

  // Log Hours Form
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [hoursToLog, setHoursToLog] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const newTask: ProjectTask = {
      id: `TSK-${Math.floor(205 + Math.random() * 200)}`,
      title: taskTitle,
      project: projName,
      assignee: assignee,
      estHours: parseFloat(estHours) || 8,
      loggedHours: 0,
      stage: 'Backlog'
    };

    setTasks([...tasks, newTask]);
    setTaskTitle('');
    setEstHours('8');
  };

  const promoteTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const idx = STAGES.indexOf(t.stage);
        const next = Math.min(idx + 1, STAGES.length - 1);
        return { ...t, stage: STAGES[next] };
      }
      return t;
    }));
  };

  const demoteTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const idx = STAGES.indexOf(t.stage);
        const prev = Math.max(idx - 1, 0);
        return { ...t, stage: STAGES[prev] };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleLogHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !hoursToLog) return;
    const added = parseFloat(hoursToLog) || 0;

    setTasks(tasks.map(t => {
      if (t.id === selectedTaskId) {
        return {
          ...t,
          loggedHours: t.loggedHours + added
        };
      }
      return t;
    }));

    setHoursToLog('');
    setSelectedTaskId(null);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Project Tasks & Timesheets</h1>
          <p className="page-subtitle">Track project tasks, assign team roles, drag tasks across Kanban stages, and log operational timesheets.</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Projects</span>
            <p className="text-2xl font-black text-white">4 Active</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logged timesheets</span>
            <p className="text-2xl font-black text-white">{tasks.reduce((acc, curr) => acc + curr.loggedHours, 0)} hrs</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Review Stage</span>
            <p className="text-2xl font-black text-[#F59E0B]">{tasks.filter(t => t.stage === 'Review').length} tasks</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Play className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed tasks</span>
            <p className="text-2xl font-black text-[#10B981]">{tasks.filter(t => t.stage === 'Done').length} tasks</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column - Creator form & Hours Logger */}
        <div className="space-y-6">
          
          {/* Create Task */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Add New Project Task</h2>
              <Plus className="w-4 h-4 text-[#3B82F6]" />
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Task Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Design pricing exceptions" 
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Project Category</label>
                <select 
                  value={projName} 
                  onChange={e => setProjName(e.target.value)}
                  className="input-field"
                >
                  <option value="Biometrics Sync Integration">Biometrics Sync Integration</option>
                  <option value="HR Enhancements">HR Enhancements</option>
                  <option value="POS Upgrade">POS Upgrade</option>
                  <option value="Accounting Core">Accounting Core</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Assignee</label>
                  <select 
                    value={assignee} 
                    onChange={e => setAssignee(e.target.value)}
                    className="input-field"
                  >
                    <option value="Ahmad Masri">Ahmad Masri</option>
                    <option value="Sara Haddad">Sara Haddad</option>
                    <option value="Rami Khasawneh">Rami Khasawneh</option>
                    <option value="Khaled Jaber">Khaled Jaber</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Est Hours</label>
                  <input 
                    type="number" 
                    value={estHours} 
                    onChange={e => setEstHours(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-2">
                Create Project Task
              </button>
            </form>
          </div>

          {/* Log Hours Box */}
          {selectedTaskId && selectedTask && (
            <div className="glass-card p-5 bg-[#3B82F6]/5 border-[#3B82F6]/20 space-y-3 text-xs animate-slide-up">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-[#3B82F6]">Timesheet logger</span>
                <button onClick={() => setSelectedTaskId(null)} className="text-slate-500">Cancel</button>
              </div>
              <p className="text-slate-400">Log hours worked on task:<br /><strong>{selectedTask.title}</strong></p>
              <form onSubmit={handleLogHours} className="flex gap-2">
                <input 
                  type="number" 
                  required 
                  step="0.5"
                  placeholder="Hours (e.g. 2.5)" 
                  value={hoursToLog}
                  onChange={e => setHoursToLog(e.target.value)}
                  className="input-field py-1 font-mono"
                />
                <button type="submit" className="btn-primary py-1.5 px-3">Log</button>
              </form>
            </div>
          )}

        </div>

        {/* Right Column - Kanban board */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          {STAGES.map(stage => {
            const stageTasks = tasks.filter(t => t.stage === stage);
            return (
              <div key={stage} className={`p-3 rounded-2xl border ${STAGE_COLORS[stage]} min-h-[460px] flex flex-col space-y-3`}>
                <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-white uppercase">{stage}</span>
                  <span className="text-[10px] bg-white/5 px-2 py-0.2 rounded font-mono text-slate-400 font-bold">{stageTasks.length}</span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {stageTasks.map(t => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-[#0B0F19]/90 border border-white/5 hover:border-white/10 group transition-all space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-bold text-slate-100 leading-snug">{t.title}</span>
                        <button 
                          onClick={() => deleteTask(t.id)}
                          className="p-0.5 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 font-semibold">{t.project}</div>
                      
                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className="text-slate-400 flex items-center gap-1 font-bold">
                          <User className="w-3 h-3 text-slate-500" /> {t.assignee.split(' ')[0]}
                        </span>
                        <button 
                          onClick={() => setSelectedTaskId(t.id)}
                          className="flex items-center gap-1 text-[9px] bg-white/5 border border-white/10 hover:border-white/20 px-1.5 py-0.5 rounded font-mono text-slate-400 hover:text-white"
                        >
                          <Clock className="w-2.5 h-2.5" /> {t.loggedHours}/{t.estHours}h
                        </button>
                      </div>

                      {/* Direction controls */}
                      <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                        {STAGES.indexOf(stage) > 0 ? (
                          <button 
                            onClick={() => demoteTask(t.id)}
                            className="p-1 rounded bg-white/3 hover:bg-white/8 text-slate-400"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>
                        ) : <div />}
                        {STAGES.indexOf(stage) < STAGES.length - 1 ? (
                          <button 
                            onClick={() => promoteTask(t.id)}
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
