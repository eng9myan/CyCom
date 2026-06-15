'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2, Calculator, DollarSign, Package, ShoppingCart, TrendingUp,
  ShoppingBag, Factory, Users, Shield, ArrowRight, Sparkles,
} from 'lucide-react';

type WizardCard = {
  key: string;
  href: string | null;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'ready' | 'soon';
};

const WIZARDS: WizardCard[] = [
  {
    key: 'company',
    href: '/setup/company',
    title: 'Company Setup',
    description: 'Create your tenant — legal entity, industry, currency, branches. Prerequisite for every other wizard.',
    icon: Building2,
    status: 'ready',
  },
  {
    key: 'coa',
    href: '/setup/coa',
    title: 'Chart of Accounts',
    description: 'Country-tuned COA + tax structure + journal config in one guided flow.',
    icon: Calculator,
    status: 'ready',
  },
  {
    key: 'payroll',
    href: '/setup/payroll',
    title: 'Payroll Structure',
    description: 'Country labor law, pay frequency, overtime rules. Auto-generated salary rules.',
    icon: DollarSign,
    status: 'ready',
  },
  {
    key: 'warehouse',
    href: '/setup/warehouse',
    title: 'Warehouse & Locations',
    description: 'Warehouse + putaway + routes + reordering rules from a single business questionnaire.',
    icon: Package,
    status: 'ready',
  },
  {
    key: 'pos',
    href: '/setup/pos',
    title: 'POS Configuration',
    description: 'Sessions, pricelists, payment methods, discount policy — wired to your sites in one click.',
    icon: ShoppingCart,
    status: 'ready',
  },
  {
    key: 'sales',
    href: '/setup/sales',
    title: 'Sales Pipeline',
    description: 'Stages, teams, commission, approval thresholds. Industry-tuned defaults.',
    icon: TrendingUp,
    status: 'ready',
  },
  {
    key: 'procurement',
    href: '/setup/procurement',
    title: 'Procurement',
    description: 'Vendor list, RFQ flow, approval matrix, replenishment rules.',
    icon: ShoppingBag,
    status: 'ready',
  },
  {
    key: 'manufacturing',
    href: '/setup/manufacturing',
    title: 'Manufacturing',
    description: 'BOM, routings, work centers, costing method — guided by your manufacturing type.',
    icon: Factory,
    status: 'ready',
  },
  {
    key: 'hr',
    href: '/setup/hr',
    title: 'HR Structure',
    description: 'Departments, positions, competency, onboarding flow. Org-size templates.',
    icon: Users,
    status: 'ready',
  },
  {
    key: 'permissions',
    href: '/setup/permissions',
    title: 'Permissions & Roles',
    description: 'RBAC matrix per module, generated from department list and sensitivity policy.',
    icon: Shield,
    status: 'ready',
  },
];

export default function SetupHub() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Setup Hub</h1>
          <p className="page-subtitle">
            Guided wizards that turn weeks of ERP consulting into minutes of business questions.
          </p>
        </div>
        <span className="badge badge-purple flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Cycom Setup Experience
        </span>
      </div>

      {/* Doctrine reminder, in-line */}
      <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5">
        <p className="text-xs text-purple-200/90 leading-relaxed">
          Every Cycom wizard reduces a typical ERP-consultant configuration into a handful of business
          questions. Industry templates pre-fill defaults. The AI Recommendation panel explains every
          choice. A <strong className="text-white">Configure manually</strong> escape hatch is always one
          click away. Power is preserved; complexity is hidden by default.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {WIZARDS.map((w) => {
          const Icon = w.icon;
          const inner = (
            <div
              className={
                'glass-card p-5 h-full flex flex-col gap-4 transition-all border ' +
                (w.status === 'ready'
                  ? 'border-white/8 hover:border-orange-500/40 cursor-pointer'
                  : 'border-white/5 opacity-60 cursor-not-allowed')
              }
            >
              <div className="flex items-start justify-between">
                <div
                  className={
                    'w-11 h-11 rounded-xl flex items-center justify-center border ' +
                    (w.status === 'ready'
                      ? 'bg-gradient-to-br from-orange-500/15 to-blue-500/10 border-orange-500/30 text-[#E67E22]'
                      : 'bg-white/5 border-white/10 text-slate-500')
                  }
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={
                    'text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ' +
                    (w.status === 'ready'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/10 bg-white/5 text-slate-500')
                  }
                >
                  {w.status === 'ready' ? 'Ready' : 'Coming soon'}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-1">{w.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{w.description}</p>
              </div>

              {w.status === 'ready' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#E67E22]">
                  Start <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
          return w.href ? (
            <Link key={w.key} href={w.href}>{inner}</Link>
          ) : (
            <div key={w.key}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
