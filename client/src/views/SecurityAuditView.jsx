
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Key, Database, RefreshCw, CheckCircle2, FileText } from 'lucide-react';

export default function SecurityAuditView({ language }) {
  const [securityData, setSecurityData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const isHi = language === 'hi';

  const loadSecurity = async () => {
    setLoading(true);
    try {
      const [secRes, audRes] = await Promise.all([
        fetch('/api/security/inspect'),
        fetch('/api/audit/logs')
      ]);
      const sec = await secRes.json();
      const aud = await audRes.json();
      if (sec.success) setSecurityData(sec);
      if (aud.success) setAuditLogs(aud.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurity();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              {isHi ? 'सरकारी सुरक्षा व ऑडिट अनुपालन' : 'Government-Grade AES-256 Security & Audit Explorer'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              DPDP Act 2023 & Indian Government Health Data Security Compliance
            </p>
          </div>
        </div>

        <button
          onClick={loadSecurity}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <Lock className="w-4 h-4" />
            <span>Encryption-at-Rest</span>
          </div>
          <p className="text-slate-600">AES-256-GCM with 96-bit unique IV & 128-bit authentication tag per file write.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-blue-700 font-bold">
            <Key className="w-4 h-4" />
            <span>Key Management</span>
          </div>
          <p className="text-slate-600">SHA-256 master key derivation with KMS mock & environment isolation.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-purple-700 font-bold">
            <Database className="w-4 h-4" />
            <span>Tamper-Evident Auditing</span>
          </div>
          <p className="text-slate-600">HMAC-SHA256 signed audit trails recording who accessed what data, when, and why.</p>
        </div>
      </div>

      {/* Live Cipher Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Encrypted Disk Representation */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-red-600" />
              On-Disk Raw Encrypted Envelope (intakes.enc.json)
            </h3>
            <span className="text-[10px] bg-red-100 text-red-800 font-mono font-bold px-2 py-0.5 rounded">
              AES-256-GCM
            </span>
          </div>

          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-[10px] font-mono overflow-x-auto max-h-[350px]">
            {JSON.stringify(securityData?.onDiskEncryptedFile?.encryptedEnvelope, null, 2)}
          </pre>
        </div>

        {/* Audit Log Stream */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            DPDP Act 2023 Tamper-Evident Audit Trail
          </h3>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.auditId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className="text-[11px] text-emerald-700 block font-semibold">{log.actor}</span>
                <span className="text-[9px] text-slate-500 font-mono block truncate">
                  HMAC: {log.signature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
