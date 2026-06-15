'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Plus, Trash2, CheckCircle2, Clipboard, 
  DollarSign, RefreshCw, Key, Info, MapPin
} from 'lucide-react';

interface FleetVehicle {
  id: string;
  plateNumber: string;
  model: string;
  driver: string;
  odometer: number; // km
  status: 'Active' | 'In Service' | 'Retired';
}

interface FleetFuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  odometer: number;
  date: string;
}

interface FleetServiceLog {
  id: string;
  vehicleId: string;
  type: string;
  cost: number;
  date: string;
}

const INITIAL_VEHICLES: FleetVehicle[] = [
  { id: 'VEH-01', plateNumber: 'JO-89-29381', model: 'Hyundai Porter II (Delivery)', driver: 'Rami Khasawneh', odometer: 124500, status: 'Active' },
  { id: 'VEH-02', plateNumber: 'JO-12-10928', model: 'Mitsubishi L200 Pick-up', driver: 'Khaled Jaber', odometer: 88400, status: 'Active' },
  { id: 'VEH-03', plateNumber: 'JO-77-93821', model: 'Toyota HiAce Van', driver: 'Ahmad Masri', odometer: 195200, status: 'In Service' },
];

const INITIAL_FUEL_LOGS: FleetFuelLog[] = [
  { id: 'FUEL-101', vehicleId: 'VEH-01', liters: 45, cost: 38.5, odometer: 124320, date: '2026-06-12' },
  { id: 'FUEL-102', vehicleId: 'VEH-02', liters: 30, cost: 26.0, odometer: 88350, date: '2026-06-13' },
];

const INITIAL_SERVICES: FleetServiceLog[] = [
  { id: 'SRV-101', vehicleId: 'VEH-03', type: 'Engine Oil & Filter Change', cost: 65, date: '2026-06-14' },
  { id: 'SRV-102', vehicleId: 'VEH-01', type: 'Brake pad replacement', cost: 120, date: '2026-06-08' },
];

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(INITIAL_VEHICLES);
  const [fuelLogs, setFuelLogs] = useState<FleetFuelLog[]>(INITIAL_FUEL_LOGS);
  const [services, setServices] = useState<FleetServiceLog[]>(INITIAL_SERVICES);

  // New vehicle form states
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [driver, setDriver] = useState('Rami Khasawneh');
  const [odo, setOdo] = useState('');

  // Fuel log form states
  const [fuelVehId, setFuelVehId] = useState('VEH-01');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelOdo, setFuelOdo] = useState('');

  // Service log form states
  const [srvVehId, setSrvVehId] = useState('VEH-01');
  const [srvType, setSrvType] = useState('Oil & Filter Change');
  const [srvCost, setSrvCost] = useState('');

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !model || !odo) return;

    const newVeh: FleetVehicle = {
      id: `VEH-0${vehicles.length + 1}`,
      plateNumber: plate,
      model: model,
      driver: driver,
      odometer: parseInt(odo) || 0,
      status: 'Active'
    };

    setVehicles([...vehicles, newVeh]);
    setPlate('');
    setModel('');
    setOdo('');
  };

  const handleAddFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelLiters || !fuelCost || !fuelOdo) return;
    const odoVal = parseInt(fuelOdo);

    const newLog: FleetFuelLog = {
      id: `FUEL-${Math.floor(103 + Math.random() * 90)}`,
      vehicleId: fuelVehId,
      liters: parseFloat(fuelLiters),
      cost: parseFloat(fuelCost),
      odometer: odoVal,
      date: new Date().toISOString().split('T')[0]
    };

    setFuelLogs([newLog, ...fuelLogs]);

    // Update vehicle odometer
    setVehicles(vehicles.map(v => {
      if (v.id === fuelVehId && odoVal > v.odometer) {
        return { ...v, odometer: odoVal };
      }
      return v;
    }));

    setFuelLiters('');
    setFuelCost('');
    setFuelOdo('');
  };

  const handleAddServiceLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvCost || !srvType) return;

    const newSrv: FleetServiceLog = {
      id: `SRV-${Math.floor(103 + Math.random() * 90)}`,
      vehicleId: srvVehId,
      type: srvType,
      cost: parseFloat(srvCost),
      date: new Date().toISOString().split('T')[0]
    };

    setServices([newSrv, ...services]);
    setSrvCost('');
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-white">Fleet Management</h1>
          <p className="page-subtitle">Standard Odoo Fleet operations. Register commercial trucks, track fuel odometer values, and log repair events.</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Vehicles</span>
            <p className="text-2xl font-black text-white">{vehicles.filter(v => v.status === 'Active').length} units</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Car className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fuel Expenses YTD</span>
            <p className="text-2xl font-black text-white">JOD {fuelLogs.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#10B981]/10 text-[#10B981]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Expenses</span>
            <p className="text-2xl font-black text-white">JOD {services.reduce((acc, curr) => acc + curr.cost, 0)}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
            <Key className="w-5 h-5" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Odometer Sum</span>
            <p className="text-2xl font-black text-[#5DADE2]">{vehicles.reduce((acc, curr) => acc + curr.odometer, 0).toLocaleString()} km</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Forms */}
        <div className="space-y-6">
          
          {/* Register Vehicle */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">Register Fleet Vehicle</h3>
            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">License Plate</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="JO-XX-XXXXX" 
                    value={plate}
                    onChange={e => setPlate(e.target.value)}
                    className="input-field py-1 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Driver Assigned</label>
                  <select value={driver} onChange={e => setDriver(e.target.value)} className="input-field py-1">
                    <option value="Rami Khasawneh">Rami Khasawneh</option>
                    <option value="Khaled Jaber">Khaled Jaber</option>
                    <option value="Ahmad Masri">Ahmad Masri</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Model Brand</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Toyota Van" 
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="input-field py-1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Start Odometer (km)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 50000" 
                    value={odo}
                    onChange={e => setOdo(e.target.value)}
                    className="input-field py-1 font-mono"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-1.5 mt-2">
                Register Vehicle
              </button>
            </form>
          </div>

          {/* Log Fuel Purchase */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">Log Fuel Purchase</h3>
            <form onSubmit={handleAddFuelLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Select Vehicle</label>
                  <select value={fuelVehId} onChange={e => setFuelVehId(e.target.value)} className="input-field py-1 font-mono">
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} ({v.plateNumber})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Liters</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 45" 
                    value={fuelLiters}
                    onChange={e => setFuelLiters(e.target.value)}
                    className="input-field py-1 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Cost (JOD)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 38" 
                    value={fuelCost}
                    onChange={e => setFuelCost(e.target.value)}
                    className="input-field py-1 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Odometer Counter (km)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 124600" 
                    value={fuelOdo}
                    onChange={e => setFuelOdo(e.target.value)}
                    className="input-field py-1 font-mono"
                  />
                </div>
              </div>
              <button type="submit" className="btn-secondary w-full py-1.5 mt-2">
                Log Fuel Entry
              </button>
            </form>
          </div>

        </div>

        {/* Right Column - Fleet Vehicle Grid & Service Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Vehicles Grid */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-3">Fleet Vehicles Registry</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle ID</th>
                    <th>License Plate</th>
                    <th>Model Brand</th>
                    <th>Driver Assigned</th>
                    <th>Odometer (km)</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v.id}>
                      <td className="font-mono text-xs">{v.id}</td>
                      <td className="font-mono font-bold text-white">{v.plateNumber}</td>
                      <td>{v.model}</td>
                      <td>{v.driver}</td>
                      <td className="font-mono">{v.odometer.toLocaleString()} km</td>
                      <td>
                        <span className={`badge text-[9px] ${
                          v.status === 'Active' ? 'badge-green' :
                          v.status === 'In Service' ? 'badge-cyan' : 'badge-red'
                        }`}>{v.status}</span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => handleDeleteVehicle(v.id)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fuel Purchase logs */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-3">Fuel Purchase Log</h3>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {fuelLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">Ref: {log.id}</p>
                      <p className="text-[10px] text-slate-500">Vehicle: <strong className="text-slate-300 font-mono">{log.vehicleId}</strong> · {log.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">JOD {log.cost}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{log.liters} Liters · {log.odometer} km</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service & Repair logs */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-3">Service & Repair Logs</h3>
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                {services.map(srv => (
                  <div key={srv.id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{srv.type}</p>
                      <p className="text-[10px] text-slate-500">Vehicle: <strong className="text-slate-300 font-mono">{srv.vehicleId}</strong> · {srv.date}</p>
                    </div>
                    <p className="font-bold text-white flex-shrink-0">JOD {srv.cost}</p>
                  </div>
                ))}
              </div>

              {/* Add Service form */}
              <form onSubmit={handleAddServiceLog} className="grid grid-cols-2 gap-2 text-[10px] border-t border-white/5 pt-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-500 uppercase">Service Type</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Brake pad change" 
                    value={srvType}
                    onChange={e => setSrvType(e.target.value)}
                    className="input-field py-1"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="space-y-1 flex-1">
                    <label className="text-[8px] font-bold text-slate-500 uppercase">Cost (JOD)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="e.g. 50" 
                      value={srvCost}
                      onChange={e => setSrvCost(e.target.value)}
                      className="input-field py-1 font-mono"
                    />
                  </div>
                  <button type="submit" className="btn-primary py-1 px-3">Add</button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
