'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Folder, FileText, ChevronRight, ChevronDown, 
  Edit3, Save, Eye, Plus, Trash2, Check, Sparkles 
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: string;
  updatedBy: string;
}

const INITIAL_ARTICLES: Article[] = [
  {
    id: 'employee-handbook',
    title: 'Employee Handbook & Code of Conduct',
    category: 'Company Policies',
    lastUpdated: '2026-06-10 14:30',
    updatedBy: 'Sara Haddad',
    content: `## Cycom Employee Code of Conduct

Welcome to the official Cycom ERP organizational handbook. This document outlines key parameters regarding attendance, leaves, and workplace conduct.

### 1. Attendance & Punching Rules
All staff must register their presence using the active **ZK Biometric reader** nodes located at the entrance.
- **Geofence Range**: Employees using the portal check-in must match the GPS range allowed within our warehouse or headquarters.
- **Late Policy**: Punch-ins after 08:30 AM are logged as tardy and subject to lateness deductions unless a correction request is submitted and approved by the HR coordinator.

### 2. Allowances & Deductions
Our current payroll utilizes standard allowances for transport, housing, and social security. Overtime is computed on a weekly basis, with double rate applied on weekend rosters.`
  },
  {
    id: 'medical-insurance',
    title: 'Medical Insurance Policy & Coverages',
    category: 'Company Policies',
    lastUpdated: '2026-06-12 09:12',
    updatedBy: 'Sara Haddad',
    content: `## Corporate Medical Insurance Scheme (Jordanian Health Networks)

Cycom provides comprehensive medical insurance for all active employees and their dependents.

### 1. Network Grades
- **Grade A**: Executive level. 95% coverage on inpatient, 90% on outpatient.
- **Grade B**: Managers and key operators. 85% inpatient, 80% outpatient.
- **Grade C**: Frontline, POS staff, and warehouse workers. 75% coverage.

### 2. Claims & Approvals
For treatments outside the immediate network provider list, employees must upload the receipt files via the **Expenses Claims** module on Cycom ERP. Maximum reimbursement response is 3 working days.`
  },
  {
    id: 'zk-reader-config',
    title: 'ZK Reader Hardware configuration',
    category: 'Operations & Logistics',
    lastUpdated: '2026-05-20 16:40',
    updatedBy: 'Admin User',
    content: `## Biometric Reader (ZK Device Interface) Manual

Guide for system administrators to check biometric communication links.

### 1. Network Parameters
- **IP Address range**: \`192.168.10.200\` through \`205\`
- **UDP Port**: \`4370\` (default ZK protocol)
- **Heartbeat Interval**: 30 seconds

### 2. Troubleshooting Sync Failures
If the Attendance module logs a "ZK Reader Timeout" error:
1. Verify device ping via local server command terminal.
2. Confirm the biometric data sync bridge service is running.
3. If necessary, execute a manual pull of logs from the backup memory buffer.`
  },
  {
    id: 'pos-rounding-standard',
    title: 'POS Cash Rounding Standards (JOD)',
    category: 'Operations & Logistics',
    lastUpdated: '2026-06-05 11:00',
    updatedBy: 'Lina Qudah',
    content: `## POS Cash Register Rounding Regulations

This policy dictates rules for Point of Sale transactions within Jordan.

### 1. Rounding Rules
To optimize customer checkout speeds, the POS register rounding is configured as follows:
- Transactions matching fractional prices are rounded to the nearest **0.05 JOD** or **0.10 JOD** based on register settings.
- Difference totals are recorded in the general ledger under the "Rounding Variance" account automatically during session closures.`
  },
  {
    id: 'mass-invoice-auto',
    title: 'Mass Invoice Auto-matching & Reconciliation',
    category: 'Accounting & Finance',
    lastUpdated: '2026-06-08 17:15',
    updatedBy: 'Lina Qudah',
    content: `## Automated Ledger Move Reconciliation Rules

The reconciliation engine matches customer payments against invoices using the following steps:

### 1. Reconciliation Priorities
1. **Invoice Number Match**: Matches payments stating the exact invoice ID.
2. **Customer Balance Match**: Matches payments matching the exact outstanding debt balance.
3. **FIFO Match**: Matches payment to oldest invoice first for that partner.

### 2. Approval Safeguards
Reconciliations with matching confidence below **90%** are held in draft state and flagged for verification on the Accounting dashboard.`
  }
];

export default function KnowledgePage() {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [activeArticleId, setActiveArticleId] = useState<string>('employee-handbook');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<boolean>(false);
  
  // Sidebar folder expansion
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'Company Policies': true,
    'Operations & Logistics': true,
    'Accounting & Finance': true
  });

  const activeArticle = articles.find(a => a.id === activeArticleId) || articles[0];

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedContent(activeArticle.content);
    setEditedTitle(activeArticle.title);
  };

  const handleSaveClick = () => {
    setArticles(prev => prev.map(art => {
      if (art.id === activeArticleId) {
        return {
          ...art,
          title: editedTitle,
          content: editedContent,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
          updatedBy: 'Admin User'
        };
      }
      return art;
    }));
    setIsEditing(false);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const categories = Array.from(new Set(articles.map(a => a.category)));

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title text-white">Knowledge Base & Wiki</h1>
          <p className="page-subtitle">Standard operating procedures, policies, and system administration manuals.</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              Article Saved Successfully
            </motion.div>
          )}
        </div>
      </div>

      {/* Wiki Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch min-h-[550px]">
        
        {/* Directory Sidebar */}
        <div className="glass-card p-4 md:col-span-1 space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DOCUMENTS DIR</span>
            <button className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {categories.map(cat => {
              const catArticles = articles.filter(a => a.category === cat);
              const isExpanded = expandedFolders[cat];

              return (
                <div key={cat} className="space-y-1">
                  <button
                    onClick={() => toggleFolder(cat)}
                    className="w-full flex items-center justify-between text-slate-400 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider px-1 py-1"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Folder className="w-3.5 h-3.5 text-orange-400" />
                      <span className="truncate">{cat}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-3 space-y-0.5"
                      >
                        {catArticles.map(art => (
                          <button
                            key={art.id}
                            onClick={() => {
                              setActiveArticleId(art.id);
                              setIsEditing(false);
                            }}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors border ${
                              activeArticleId === art.id
                                ? 'bg-orange-500/10 border-orange-500/20 text-[#E67E22] font-semibold'
                                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/3'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate text-left">{art.title}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Article Viewer / Editor */}
        <div className="glass-card p-6 md:col-span-3 flex flex-col h-full">
          
          {/* Article Header Toolbar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{activeArticle.category}</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-lg font-bold text-white w-full max-w-md outline-none focus:border-orange-500/50"
                />
              ) : (
                <h2 className="text-lg font-bold text-white">{activeArticle.title}</h2>
              )}
              <p className="text-[10px] text-slate-500">
                Last modified: <span className="text-slate-400 font-semibold">{activeArticle.lastUpdated}</span> by <span className="text-[#5DADE2] font-semibold">{activeArticle.updatedBy}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors border border-white/10"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E67E22] hover:bg-orange-600 text-white text-xs font-semibold transition-all shadow-md shadow-orange-500/10"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors border border-white/10"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#E67E22]" />
                  Edit Page
                </button>
              )}
            </div>
          </div>

          {/* Article Content Display / Editor Body */}
          <div className="flex-1 overflow-y-auto min-h-[350px]">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full bg-white/3 border border-white/8 rounded-xl p-4 text-xs font-mono text-slate-300 outline-none focus:border-orange-500/40 resize-none min-h-[300px]"
                placeholder="Write article content in Markdown format..."
              />
            ) : (
              <div className="prose prose-invert prose-xs max-w-none text-slate-300 space-y-4 select-text">
                {/* Basic Markdown Parser for headings/lists */}
                {activeArticle.content.split('\n').map((line, index) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-base font-extrabold text-white mt-4 border-b border-white/5 pb-1">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xs font-black text-slate-200 mt-3">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4 list-disc text-xs leading-relaxed mt-1">{line.replace('- ', '')}</li>;
                  }
                  if (line.trim() === '') {
                    return <div key={index} className="h-2" />;
                  }
                  return <p key={index} className="text-xs leading-relaxed">{line}</p>;
                })}
              </div>
            )}
          </div>

          {/* Editor Footer Advice */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
            <span>Knowledge system integrated with Cycom ERP document store.</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E67E22] animate-bounce" />
              <span>Auto-save locks enabled</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
