
import React, { useState } from 'react';
import { Activity, Bluetooth, RefreshCw, AlertTriangle, CheckCircle2, Heart, Thermometer, Droplet } from 'lucide-react';

export default function HardwareVitalsView({ activeIntake, setActiveIntake, language }) {
  const [systolic, setSystolic] = useState(activeIntake?.vitals?.systolic || 120);
  const [diastolic, setDiastolic] = useState(activeIntake?.vitals?.diastolic || 80);
  const [pulse, setPulse] = useState(activeIntake?.vitals?.pulse || 74);
  const [spo2, setSpo2] = useState(activeIntake?.vitals?.spo2 || 98);
  const [temp, setTemp] = useState(activeIntake?.vitals?.temp || 98.4);
  const [glucose, setGlucose] = useState(110);
  const [bleConnected, setBleConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [analysis, setAnalysis] = useState(activeIntake?.vitalsAnalysis || null);

  const isHi = language === 'hi';

  const handleConnectBle = async () => {
    if (navigator.bluetooth) {
      try {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['heart_rate', 'health_thermometer', 'blood_pressure'] }]
        });
        setBleConnected(true);
        alert(`Connected to BLE Device: ${device.name || 'Medical Monitor'}`);
      } catch (err) {
        console.warn('Web Bluetooth simulated mode active:', err);
        setBleConnected(true);
      }
    } else {
      setBleConnected(true);
    }
  };

  const handleSyncVitals = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/vitals/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeId: activeIntake?.id,
          systolic,
          diastolic,
          pulse,
          spo2,
          temp,
          bloodGlucose: glucose,
          source: bleConnected ? 'BLE Hardware Monitor (Omron/Contec)' : 'Simulated IoT Ingest'
        })
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        if (activeIntake) {
          setActiveIntake({
            ...activeIntake,
            vitals: data.vitals,
            vitalsAnalysis: data.analysis
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {isHi ? 'चिकित्सीय उपकरण एकीकरण (Hardware & Vitals IoT)' : 'Medical Device Integration (BLE / IoT Vitals)'}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {isHi ? 'ब्लूटूथ बीपी मशीन, ऑक्सीमीटर व थर्मामीटर डेटा संग्रह' : 'IEEE 11073 & HL7 FHIR Standard BLE Medical Monitor Ingest'}
              </p>
            </div>
          </div>

          <button
            onClick={handleConnectBle}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
              bleConnected
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
            }`}
          >
            <Bluetooth className={`w-4 h-4 ${bleConnected ? 'animate-pulse' : ''}`} />
            {bleConnected ? 'BLE Device Connected' : 'Scan Bluetooth (BLE)'}
          </button>
        </div>
      </div>

      {/* Vitals Ingest Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Blood Pressure Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-xs text-slate-800 uppercase">Blood Pressure (BP)</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">mmHg</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Systolic</label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Diastolic</label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-2xl font-black text-slate-900">{systolic}/{diastolic}</span>
            <span className="text-[10px] text-slate-500 block">Standard Target: 120/80</span>
          </div>
        </div>

        {/* SpO2 & Pulse Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-xs text-slate-800 uppercase">Pulse Oximeter</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">% / BPM</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">SpO2 Oxygen (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Pulse (bpm)</label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-2xl font-black text-blue-900">{spo2}%</span>
            <span className="text-[10px] text-slate-500 block">Pulse: {pulse} BPM</span>
          </div>
        </div>

        {/* Temperature & Glucose Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-xs text-slate-800 uppercase">Temp & Glucose</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">°F / mg/dL</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Body Temp (°F)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Blood Sugar (FBS)</label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-2xl font-black text-orange-950">{temp}°F</span>
            <span className="text-[10px] text-slate-500 block">Glucose: {glucose} mg/dL</span>
          </div>
        </div>
      </div>

      {/* Sync Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSyncVitals}
          disabled={syncing}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {isHi ? 'वाइटल्स सिंक करें व नैदानिक जांच करें' : 'Sync Hardware Vitals & Evaluate Risks'}
        </button>
      </div>

      {/* Vitals Evaluation Output */}
      {analysis && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Clinical Anomaly Check Result
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border text-xs ${
              analysis.bloodPressure.status === 'NORMAL' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'
            }`}>
              <strong>Blood Pressure:</strong> {analysis.bloodPressure.label}
            </div>
            <div className={`p-3 rounded-xl border text-xs ${
              analysis.spo2.status === 'NORMAL' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'
            }`}>
              <strong>Oxygen Saturation:</strong> {analysis.spo2.label}
            </div>
            <div className={`p-3 rounded-xl border text-xs ${
              analysis.pulse.status === 'NORMAL' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <strong>Heart Rate:</strong> {analysis.pulse.label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
