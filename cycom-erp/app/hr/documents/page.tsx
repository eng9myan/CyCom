'use client';

import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, Bell, Search, Filter } from 'lucide-react';

const DOCUMENTS = [
  { id: 'DOC-9082', employee: 'Khaled Jaber', type: 'Passport', number: 'P-9827361', expiry: 'Jun 19, 2026', daysLeft: 5, status: 'Critical', dept: 'Logistics' },
  { id: 'DOC-9081', employee: 'Lina Qudah', type: 'Residency Permit (Iqama)', number: 'R-7728394', expiry: 'Jun 26, 2026', daysLeft: 12, status: 'Warning', dept: 'Finance & Accounting' },
  { id: 'DOC-9080', employee: 'Yousef Ali', type: 'Driving License', number: 'D-1192837', expiry: 'Jul 12, 2026', daysLeft: 28, status: 'Attention', dept: 'Operations & Logistics' },
  { id: 'DOC-9079', employee: 'Sara Haddad', type: 'Work Permit', number: 'W-0028376', expiry: 'Aug 30, 2026', daysLeft: 77, status: 'Active', dept: 'Human Resources' },
  { id: 'DOC-9078', employee: 'Ahmad Masri', type: 'Passport', number: 'P-1283748', expiry: 'Dec 15, 2026', daysLeft: 184, status: 'Active', dept: 'Logistics' },
];

export default function DocumentExpiry() {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Critical' | 'Warning' | 'Active'>('All');

  const filteredDocs = DOCUMENTS.filter(doc => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Critical') return doc.status === 'Critical';
    if (filterStatus === 'Warning') return doc.status === 'Warning' || doc.status === 'Attention';
    if (filterStatus === 'Active') return doc.status === 'Active';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Document Expiry Tracking</h1>
          <p className="page-subtitle">Monitor employee IDs, passports, residencies, and work permits with proactive warnings (employee_document_expiry).</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Bell className="w-4 h-4" /> Trigger Alerts
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-between items-center bg-[#0B0F19] p-1.5 rounded-lg border border-white/5 max-w-md">
        {(['All', 'Critical', 'Warning', 'Active'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
              filterStatus === tab 
                ? 'bg-white/10 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'Warning' ? 'Warnings' : tab}
          </button>
        ))}
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 border-red-500/20 bg-red-500/5 flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-white">Critical Expirations</h3>
            <p className="text-2xl font-black text-white mt-1">1</p>
            <p className="text-xs text-slate-400 mt-1">Documents expiring within 7 days. Urgent action is needed.</p>
          </div>
        </div>
        <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
          <Clock className="w-8 h-8 text-amber-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-white">Pending Warning</h3>
            <p className="text-2xl font-black text-white mt-1">2</p>
            <p className="text-xs text-slate-400 mt-1">Documents expiring within 30 days. Renewal process should start.</p>
          </div>
        </div>
        <div className="glass-card p-5 border-emerald-500/20 bg-emerald-500/5 flex items-start gap-4">
          <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-white">Valid & Verified</h3>
            <p className="text-2xl font-black text-white mt-1">339</p>
            <p className="text-xs text-slate-400 mt-1">All other documents are valid with no upcoming expiration.</p>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Doc Type</th>
                <th>Doc Number</th>
                <th>Expiration Date</th>
                <th>Days Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="font-semibold text-slate-100">{doc.employee}</div>
                    <div className="text-[10px] text-slate-500">{doc.dept}</div>
                  </td>
                  <td>{doc.type}</td>
                  <td className="font-mono text-xs text-slate-300">{doc.number}</td>
                  <td>{doc.expiry}</td>
                  <td>
                    <span className="font-bold text-slate-200">{doc.daysLeft} days</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      doc.status === 'Critical' ? 'badge-red' :
                      doc.status === 'Warning' ? 'badge-orange' :
                      doc.status === 'Attention' ? 'badge-yellow' :
                      'badge-green'
                    }`}>{doc.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
