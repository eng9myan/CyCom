'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCycomList } from '@/lib/cycomModels';
import { 
  ArrowLeft, ShieldCheck, Lock, RefreshCw, Key, ShieldAlert,
  Server, Play, HelpCircle, FileText
} from 'lucide-react';

interface AuditLogRecord {
  id: number;
  user_email: string;
  action: string;
  model: string;
  created_at: string;
  current_hash: string;
  prev_hash: string;
}

export default function SecuritySettings() {
  const router = useRouter();
  
  // SSO Integrations State
  const [ssoActive, setSsoActive] = useState(false);
  const [ssoProvider, setSsoProvider] = useState('okta');

  // Real Audit logs list
  const { rows: liveLogs, loading: loadingLogs, reload: refreshLogs } = useCycomList<any, AuditLogRecord>(
    'audit.log',
    [],
    ['user_id', 'action', 'entity_type', 'created_at', 'hash', 'previous_hash'],
    (r) => ({
      id: r.id,
      user_email: r.user_email || 'system@cycom.com',
      action: r.action,
      model: r.model || 'general',
      created_at: r.created_at,
      current_hash: r.current_hash,
      prev_hash: r.prev_hash
    }),
    { limit: 20 }
  );

  // Verification & Tampering States
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    is_valid: boolean;
    verified_count: number;
    errors: any[];
  } | null>(null);

  // Initialize/rebuild all hashes
  const handleRebuildHashes = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/cycom/enterprise/audit/rebuild-hashes', { method: 'POST' });
      if (res.ok) {
        alert("SHA-256 integrity hashes successfully built/rebuilt for all ledger logs.");
        refreshLogs();
      } else {
        alert("Failed to rebuild hashes.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  // Verify Audit Chain
  const handleVerifyChain = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await fetch('/api/cycom/enterprise/audit/verify', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setVerificationResult({
          is_valid: data.is_valid,
          verified_count: data.verified_count,
          errors: data.errors || []
        });
      }
    } catch {
      alert('Verification request failed.');
    } finally {
      setVerifying(false);
    }
  };

  // Simulates db tamper using the latest log ID
  const handleSimulateTamper = async () => {
    if (!liveLogs || liveLogs.length === 0) {
      alert("No logs available to tamper. Please perform some system action first.");
      return;
    }
    const targetLog = liveLogs[0]; // latest log row
    setVerifying(true);
    try {
      const res = await fetch('/api/cycom/enterprise/audit/tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log_id: targetLog.id,
          action: "UNAUTHORIZED_MODIFICATION"
        })
      });
      if (res.ok) {
        alert(`Bypassed hash calculation and tampered with audit record ID #${targetLog.id}. Ready to run integrity verification check!`);
        refreshLogs();
      }
    } catch {
      alert('Tamper simulation failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 text-xs md:text-sm">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/settings')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Enterprise Security & Cryptographic Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage single sign-on constraints and verify ledger records via SHA-256 tamper-evident chains.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side Settings Forms */}
        <div className="lg:col-span-1 space-y-6">
          {/* SSO Card */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <Key className="w-4 h-4 text-blue-400" /> SSO Authentication Gate
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">Enforce SAML/OIDC Gate</span>
                  <p className="text-[9px] text-slate-500 mt-0.5">Enforce login exclusively through corporate identity profiles.</p>
                </div>
                <button 
                  onClick={() => setSsoActive(!ssoActive)}
                  className={`w-10 h-5.5 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    ssoActive ? 'bg-blue-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    ssoActive ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {ssoActive && (
                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  <label className="text-slate-400 text-[10px]">SSO Provider Profile</label>
                  <select 
                    value={ssoProvider} onChange={e => setSsoProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none text-xs"
                  >
                    <option value="okta">Okta Identity Cloud</option>
                    <option value="azure">Microsoft Azure AD (OIDC)</option>
                    <option value="google">Google Workspace Enterprise</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Audit Chain Controls */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Integrity Verification
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verify database rows cryptographic linkage. Cycom hashes audit logs sequentially. Any alteration breaks the hash alignment.
            </p>

            <div className="space-y-2">
              <button 
                onClick={handleVerifyChain}
                disabled={verifying}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Run Integrity Check
              </button>
              <button 
                onClick={handleRebuildHashes}
                disabled={verifying}
                className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition"
              >
                Rebuild Ledger Hashes
              </button>
              <button 
                onClick={handleSimulateTamper}
                disabled={verifying}
                className="w-full py-2 bg-red-950/20 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" /> Simulate Tamper Test
              </button>
            </div>

            {verificationResult && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                verificationResult.is_valid 
                  ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-950/40 border-red-500/20 text-red-400'
              }`}>
                {verificationResult.is_valid ? (
                  <>
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <h5 className="font-bold">Ledger Integrity Secure</h5>
                      <p className="text-[10px] text-emerald-500/80 mt-0.5">
                        Verified {verificationResult.verified_count} blocks successfully. All SHA-256 signatures match.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5 animate-pulse" />
                    <div>
                      <h5 className="font-bold">Tampering Detected!</h5>
                      <p className="text-[10px] text-red-400/80 mt-0.5">
                        Cryptographic mismatch found at block #{verificationResult.errors[0]?.log_id}. Linkage broken!
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Ledger Records */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cryptographic Ledger Log (SHA-256 Chain)</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Recent system actions secured with linkage hashes.</p>
              </div>
              <button 
                onClick={() => refreshLogs()}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
              {loadingLogs ? (
                <div className="text-center py-8 text-slate-500">Loading audit records...</div>
              ) : liveLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No logs found. Perform some actions to populate.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-2">Log ID</th>
                      <th className="py-2">User</th>
                      <th className="py-2">Action</th>
                      <th className="py-2">Model</th>
                      <th className="py-2">Previous Hash</th>
                      <th className="py-2">Current Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {liveLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/1">
                        <td className="py-2.5 font-mono text-purple-300 font-bold">#{log.id}</td>
                        <td className="py-2.5 text-slate-300 truncate max-w-[120px]" title={log.user_email}>{log.user_email}</td>
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            log.action === 'UNAUTHORIZED_MODIFICATION' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            log.action === 'create' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400 font-mono">{log.model}</td>
                        <td className="py-2.5 text-[9px] font-mono text-slate-600 truncate max-w-[90px]" title={log.prev_hash}>{log.prev_hash}</td>
                        <td className="py-2.5 text-[9px] font-mono text-amber-500/80 truncate max-w-[90px]" title={log.current_hash}>{log.current_hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
