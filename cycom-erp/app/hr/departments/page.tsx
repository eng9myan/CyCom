'use client';

import React from 'react';
import { Building2, Users, ChevronRight, CornerDownRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DEPARTMENTS = [
  {
    name: 'Executive Office',
    head: 'Tareq Cycom',
    directEmployees: 4,
    childEmployees: 338,
    totalEmployees: 342,
    subDepartments: [
      {
        name: 'Finance & Accounting',
        head: 'Wajih Masri',
        directEmployees: 8,
        childEmployees: 0,
        totalEmployees: 8,
      },
      {
        name: 'Human Resources',
        head: 'Rania Haddad',
        directEmployees: 6,
        childEmployees: 0,
        totalEmployees: 6,
      },
      {
        name: 'Operations & Logistics',
        head: 'Khaled Jaber',
        directEmployees: 12,
        childEmployees: 312,
        totalEmployees: 324,
        subDepartments: [
          {
            name: 'Warehouse Irbid',
            head: 'Yousef Ali',
            directEmployees: 45,
            childEmployees: 0,
            totalEmployees: 45,
          },
          {
            name: 'Warehouse Zarqa',
            head: 'Ahmad Masri',
            directEmployees: 68,
            childEmployees: 0,
            totalEmployees: 68,
          },
          {
            name: 'POS & Retail Sales',
            head: 'Rami Khasawneh',
            directEmployees: 199,
            childEmployees: 0,
            totalEmployees: 199,
          }
        ]
      }
    ]
  }
];

export default function DepartmentHierarchy() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Department Hierarchy</h1>
          <p className="page-subtitle">Understand company structure and dynamic child employee metrics propagated down departments (hr_department_child_employee_count).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns - Hierarchy Tree */}
        <div className="glass-card p-6 lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Organizational Tree</h2>
          <div className="space-y-4">
            {DEPARTMENTS.map((dept, i) => (
              <div key={dept.name} className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">{dept.name}</h3>
                      <p className="text-xs text-slate-400">Head: {dept.head}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Direct / Child</span>
                      <span className="text-sm font-bold text-slate-200">{dept.directEmployees} / {dept.childEmployees}</span>
                    </div>
                    <span className="badge badge-cyan">{dept.totalEmployees} Total</span>
                  </div>
                </div>

                {/* Sub-departments level 1 */}
                <div className="pl-6 space-y-4 border-l border-white/5">
                  {dept.subDepartments.map((sub) => (
                    <div key={sub.name} className="space-y-4">
                      <div className="flex items-center justify-between p-3.5 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2">
                          <CornerDownRight className="w-4 h-4 text-slate-500" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">{sub.name}</h4>
                            <p className="text-xs text-slate-400">Head: {sub.head}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Direct / Child</span>
                            <span className="text-xs font-semibold text-slate-300">{sub.directEmployees} / {sub.childEmployees}</span>
                          </div>
                          <span className="badge badge-purple">{sub.totalEmployees} Total</span>
                        </div>
                      </div>

                      {/* Sub-departments level 2 */}
                      {sub.subDepartments && (
                        <div className="pl-8 space-y-2 border-l border-white/5">
                          {sub.subDepartments.map((sub2) => (
                            <div key={sub2.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-[#E67E22]/20 transition-colors">
                              <div className="flex items-center gap-2">
                                <CornerDownRight className="w-4 h-4 text-slate-600" />
                                <div>
                                  <h5 className="text-xs font-bold text-slate-300">{sub2.name}</h5>
                                  <p className="text-[10px] text-slate-500">Head: {sub2.head}</p>
                                </div>
                              </div>
                              <div className="flex gap-4 items-center">
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 block">Direct</span>
                                  <span className="text-xs font-semibold text-slate-400">{sub2.directEmployees}</span>
                                </div>
                                <span className="badge badge-orange">{sub2.totalEmployees} Total</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column - Summary statistics */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Rollup Stats</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-slate-400">Total Departments</span>
                <span className="text-white font-bold">12</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-slate-400">Deepest Branch Level</span>
                <span className="text-white font-bold">3 Levels</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-slate-400">Retail Distribution</span>
                <span className="text-white font-bold">58.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Headcount in Irbid/Zarqa</span>
                <span className="text-white font-bold">113 employees</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-cyan-500/20">
            <h3 className="text-sm font-bold text-white mb-2">Automated Count Logic</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Under Odoo, department headcount is calculated dynamically by summarizing the active child departments recursively. 
              The Next.js framework exposes this hierarchy using cached database summaries.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold cursor-pointer hover:underline">
              Read Odoo Module Specification <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
