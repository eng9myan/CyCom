'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSignature, Plus, CheckCircle2, XCircle, Trash2, 
  DollarSign, Clipboard, AlertCircle, Sparkles, FileText, CheckCircle
} from 'lucide-react';

interface ExpenseClaim {
  id: string;
  employeeName: string;
  item: string;
  category: 'Travel' | 'Meals' | 'Supplies' | 'Other';
  amount: number;
  date: string;
  description: string;
  status: 'Submitted' | 'Approved' | 'Reimbursed' | 'Declined';
}

const INITIAL_EXPENSES: ExpenseClaim[] = [
  { id: 'EXP-801', employeeName: 'Ahmad Masri', item: 'Fuel for transport truck', category: 'Travel', amount: 45, date: '2026-06-12', description: 'Fuel replenishment for delivery trip to Irbid Depot.', status: 'Submitted' },
  { id: 'EXP-802', employeeName: 'Sara Haddad', item: 'Client Lunch meeting', category: 'Meals', amount: 35, date: '2026-06-11', description: 'Business lunch with Jordan Hypermarket representatives.', status: 'Approved' },
  { id: 'EXP-803', employeeName: 'Rami Khasawneh', item: 'Printer ink supplies', category: 'Supplies', amount: 88, date: '2026-06-08', description: 'Printer cartridges for Amman Store warehouse office.', status: 'Reimbursed' },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(INITIAL_EXPENSES);
  const [currentUserRole, setCurrentUserRole] = useState('Finance Manager'); // toggle role

  // Expense form states
  const [empName, setEmpName] = useState('Ahmad Masri');
  const [item, setItem] = useState('');
  const [category, setCategory] = useState<'Travel' | 'Meals' | 'Supplies' | 'Other'>('Travel');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !amount) return;

    const newClaim: ExpenseClaim = {
      id: `EXP-${Math.floor(804 + Math.random() * 200)}`,
      employeeName: empName,
      item: item,
      category: category,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      description: desc || 'Business expenses.',
      status: 'Submitted'
    };

    setExpenses([newClaim, ...expenses]);
    setItem('');
    setAmount('');
    setDesc('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, status: 'Approved' } : exp));
  };

  const handleDeclineExpense = (id: string) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, status: 'Declined' } : exp));
  };

  const handleReimburseExpense = (id: string) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, status: 'Reimbursed' } : exp));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Expenses & Reimbursements</h1>
          <p className="page-subtitle">Track operational expenditures, submit travel/meals receipts, and approve staff payment claims.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-slate-500 self-center">Approval Access:</span>
          <select 
            value={currentUserRole}
            onChange={e => setCurrentUserRole(e.target.value)}
            className="input-field py-1 text-xs font-bold text-white border-white/10"
            style={{ width: '160px' }}
          >
            <option value="Employee Portal">Employee view</option>
            <option value="Finance Manager">Finance Manager</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Submitted claims</span>
            <p className="text-2xl font-black text-white">
              JOD {expenses.filter(e => e.status === 'Submitted').reduce((acc, curr) => acc + curr.amount, 0)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Clipboard className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Approved & Awaiting Pay</span>
            <p className="text-2xl font-black text-[#F59E0B]">
              JOD {expenses.filter(e => e.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reimbursed Year-to-Date</span>
            <p className="text-2xl font-black text-[#10B981]">
              JOD {expenses.filter(e => e.status === 'Reimbursed').reduce((acc, curr) => acc + curr.amount, 0)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Claims logged</span>
            <p className="text-2xl font-black text-[#5DADE2]">{expenses.length} claims</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Submission form */}
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Log Expense Claim</h2>
              <FileSignature className="w-4 h-4 text-[#EC4899]" />
            </div>

            {successMsg ? (
              <div className="h-[180px] flex flex-col items-center justify-center text-center space-y-3 text-xs text-emerald-400">
                <CheckCircle className="w-10 h-10 animate-bounce" />
                <div>
                  <p className="font-bold">Expense Claim Logged</p>
                  <p className="text-[10px] text-slate-500 mt-1">Receipt uploaded. Awaiting finance department confirmation.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitExpense} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Employee</label>
                  <select value={empName} onChange={e => setEmpName(e.target.value)} className="input-field">
                    <option value="Ahmad Masri">Ahmad Masri (EMP-029)</option>
                    <option value="Sara Haddad">Sara Haddad (EMP-034)</option>
                    <option value="Rami Khasawneh">Rami Khasawneh (EMP-088)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Expense Item / Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Courier service fees" 
                    value={item}
                    onChange={e => setItem(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value as any)}
                      className="input-field"
                    >
                      <option value="Travel">Travel & Fuel</option>
                      <option value="Meals">Meals & Client dinner</option>
                      <option value="Supplies">Office Supplies</option>
                      <option value="Other">Other Expenses</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Cost Amount (JOD)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="e.g. 50" 
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Reason Details</label>
                  <input 
                    type="text" 
                    placeholder="Enter short description..." 
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Attachment</label>
                  <div className="border border-dashed border-white/10 rounded-lg p-3 text-center text-slate-500 cursor-pointer hover:border-white/20 transition-colors">
                    Click to simulate receipt image upload
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-2">
                  Submit Claim to Finance
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column - Approvals console & ledger */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Finance Approval Queue */}
          {currentUserRole === 'Finance Manager' && (
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Finance Approvals Queue</h2>
                <span className="badge badge-cyan text-[8px]">Odoo hr_expense workflow</span>
              </div>

              <div className="space-y-3">
                {expenses.filter(e => e.status === 'Submitted' || e.status === 'Approved').length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">No expense claims pending actions at this time.</p>
                ) : (
                  expenses.filter(e => e.status === 'Submitted' || e.status === 'Approved').map(exp => (
                    <div key={exp.id} className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{exp.id}</span>
                          <span className="text-[10px] text-slate-500">{exp.date}</span>
                          <span className="text-[9px] bg-[#EC4899]/10 border border-[#EC4899]/20 text-[#EC4899] px-2 py-0.2 rounded font-bold uppercase">{exp.category}</span>
                        </div>
                        <p className="text-xs text-slate-200 font-bold">{exp.item}</p>
                        <p className="text-[11px] text-slate-400">Claimant: <strong>{exp.employeeName}</strong> · Description: {exp.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="font-mono font-bold text-white text-sm">JOD {exp.amount}</span>
                        <div className="flex gap-1">
                          {exp.status === 'Submitted' && (
                            <>
                              <button 
                                onClick={() => handleApproveExpense(exp.id)}
                                className="p-1 px-2 text-[10px] font-bold rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-[#10B981] flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button 
                                onClick={() => handleDeclineExpense(exp.id)}
                                className="p-1 px-2 text-[10px] font-bold rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-[#EF4444] flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Decline
                              </button>
                            </>
                          )}
                          {exp.status === 'Approved' && (
                            <button 
                              onClick={() => handleReimburseExpense(exp.id)}
                              className="p-1 px-2 text-[10px] font-bold rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-[#00F0FF] flex items-center gap-1"
                            >
                              <DollarSign className="w-3.5 h-3.5" /> Reimburse Paid
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Expenses Ledger */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-3">Expenses Record Ledger</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Employee Name</th>
                    <th>Expense Item</th>
                    <th>Category</th>
                    <th>Cost Value</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td className="font-mono text-xs">{exp.id}</td>
                      <td className="font-bold text-slate-300">{exp.employeeName}</td>
                      <td>{exp.item}</td>
                      <td>
                        <span className={`badge text-[9px] ${
                          exp.category === 'Travel' ? 'badge-blue' :
                          exp.category === 'Meals' ? 'badge-orange' :
                          exp.category === 'Supplies' ? 'badge-green' : 'badge-purple'
                        }`}>{exp.category}</span>
                      </td>
                      <td className="font-mono font-bold text-white">JOD {exp.amount}</td>
                      <td>{exp.date}</td>
                      <td>
                        <span className={`badge text-[9px] ${
                          exp.status === 'Reimbursed' ? 'badge-green' :
                          exp.status === 'Approved' ? 'badge-blue' :
                          exp.status === 'Declined' ? 'badge-red' : 'badge-yellow'
                        }`}>{exp.status}</span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-[#EF4444]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
