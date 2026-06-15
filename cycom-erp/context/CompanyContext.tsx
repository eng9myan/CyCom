'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Company {
  id: string;
  name: string;
  shortName: string;
  type: 'retail' | 'commercial' | 'factory';
  currency: string;
  branches?: string[];
  color: string;
  icon: string;
}

export const COMPANIES: Company[] = [
  {
    id: 'COM-001',
    name: 'Cycom Retail Co.',
    shortName: 'Retail',
    type: 'retail',
    currency: 'JOD',
    branches: [
      'Store 01 — Abdali Mall', 'Store 02 — Mecca Mall', 'Store 03 — City Mall',
      'Store 04 — Taj Mall', 'Store 05 — Galleria', 'Store 06 — Al-Baraka',
      'Store 07 — Zarqa Central', 'Store 08 — Irbid Branch', 'Store 09 — Aqaba Branch',
      'Store 10 — Salt Branch', 'Store 11 — Madaba Branch', 'Store 12 — Karak Branch',
      'Store 13 — Mafraq Branch', 'Store 14 — Jerash Branch', 'Store 15 — Ajloun Branch',
      'Store 16 — Tafila Branch', 'Store 17 — Maan Branch', 'Store 18 — Al-Balqa',
      'Store 19 — Sweileh Branch', 'Store 20 — Marj Al-Hamam', 'Store 21 — Abu Nseir',
      'Store 22 — Tabarbour', 'Store 23 — Al-Hashmi'
    ],
    color: '#EF4444',
    icon: '🏪'
  },
  {
    id: 'COM-002',
    name: 'Cycom Commercial & HQ',
    shortName: 'Head Office',
    type: 'commercial',
    currency: 'JOD',
    color: '#3B82F6',
    icon: '🏢'
  },
  {
    id: 'COM-003',
    name: 'Cycom Manufacturing Co.',
    shortName: 'Factory',
    type: 'factory',
    currency: 'JOD',
    color: '#10B981',
    icon: '🏭'
  }
];

interface CompanyContextValue {
  activeCompany: Company;
  setActiveCompany: (company: Company) => void;
  allCompanies: Company[];
  activeBranch: string | null;
  setActiveBranch: (branch: string | null) => void;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [activeCompany, setActiveCompany] = useState<Company>(COMPANIES[1]); // Default to HQ
  const [activeBranch, setActiveBranch] = useState<string | null>(null);

  return (
    <CompanyContext.Provider value={{
      activeCompany,
      setActiveCompany,
      allCompanies: COMPANIES,
      activeBranch,
      setActiveBranch,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return ctx;
}
