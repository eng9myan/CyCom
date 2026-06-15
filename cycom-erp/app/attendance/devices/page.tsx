'use client';

import React, { useState } from 'react';
import { Cpu, RefreshCw, Radio, MapPin, Plus, Play } from 'lucide-react';

const DEVICES = [
  { id: 'DEV-001', name: 'Zarqa Warehouse Entrance', type: 'ZK Teco Fingerprint', ip: '192.168.10.45', port: '4370', status: 'Online', lastSync: '10 mins ago', recordsCount: '4,102 logs' },
  { id: 'DEV-002', name: 'Amman HQ Main Gate', type: 'STTL Face Recognition', ip: '192.168.1.112', port: '5005', status: 'Online', lastSync: '2 mins ago', recordsCount: '19,281 logs' },
  { id: 'DEV-003', name: 'Irbid Warehouse Gate', type: 'ZK Teco Fingerprint', ip: '192.168.20.15', port: '4370', status: 'Online', lastSync: '1 hr ago', recordsCount: '3,890 logs' },
  { id: 'DEV-004', name: 'Zarqa Retail Shop Gate', type: 'ZK Teco Fingerprint', ip: '192.168.30.22', port: '4370', status: 'Offline', lastSync: '1 day ago', recordsCount: '1,204 logs' },
];

export default function BiometricDevices() {
  const [devices, setDevices] = useState(DEVICES);

  const syncDevice = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, lastSync: 'Just now', recordsCount: 'Synced successfully' };
      }
      return d;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Biometric Devices</h1>
          <p className="page-subtitle">Configure, ping, and trigger synchronization routines for local ZK network machines and Face Recognition portals (hs_zk_attendance).</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" /> Ping All Devices
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      {/* Geofence Configuration Section */}
      <div className="glass-card p-6 border-cyan-500/20 bg-cyan-950/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/10">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Mobile Check-in Geofence Config</h3>
              <span className="badge badge-cyan">Enabled</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              <strong>hr_attendance_geofence_config:</strong> Configure physical latitude, longitude, and permitted radius (meters) 
              for mobile portals. Employees are blocked from checking in if outside coordinates.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
              <div>
                <span className="text-slate-500 block">Amman HQ Coordinates</span>
                <span className="text-slate-200 font-mono">31.9522° N, 35.9106° E (100m radius)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Zarqa Warehouse Coordinates</span>
                <span className="text-slate-200 font-mono">32.0608° N, 36.0942° E (150m radius)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Irbid Warehouse Coordinates</span>
                <span className="text-slate-200 font-mono">32.5568° N, 35.8469° E (120m radius)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Device Fingerprint Locks</span>
                <span className="text-[#10B981] font-semibold">Single-Device Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Devices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((d) => (
          <div key={d.id} className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg border ${
                  d.status === 'Online' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{d.name}</h3>
                  <p className="text-xs text-slate-400">{d.type}</p>
                </div>
              </div>
              <span className={`badge ${d.status === 'Online' ? 'badge-green' : 'badge-red'}`}>
                {d.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-black/35 p-3 rounded-lg border border-white/5 font-mono">
              <div>
                <span className="text-slate-500 block">IP Address</span>
                <span className="text-slate-300">{d.ip}:{d.port}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Record count</span>
                <span className="text-slate-300">{d.recordsCount}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Last synchronized</span>
                <span className="text-slate-300">{d.lastSync}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Connection Protocol</span>
                <span className="text-slate-300">TCP/IP SDK</span>
              </div>
            </div>

            {d.status === 'Online' && (
              <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                <button 
                  onClick={() => syncDevice(d.id)}
                  className="btn-secondary py-1 px-3 text-xs flex items-center gap-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Pull Records
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
