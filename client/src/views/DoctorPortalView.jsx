
import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  AlertTriangle, 
  Check, 
  X, 
  Edit3, 
  Download, 
  ShieldCheck, 
  User, 
  Activity, 
  HeartPulse, 
  Leaf, 
  ExternalLink,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function DoctorPortalView({ language }) {
  const [queue, setQueue] = useState([]);
  const [selectedIntake, setSelectedIntake] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('Patient clinical intake validated. Proceed with physical examination.');
  const [signoffResult, setSignoffResult] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editVal, setEditVal] = useState('');

  const isHi = language === 'hi';

  const loadQueue = async () => {
    try {
      const res = await fetch('/api/doctor/queue');
      const data = await res.json();
      if (data.success) {
        setQueue(data.queue);
        if (data.queue.length > 0 && !selectedIntake) {
          loadIntakeDetails(data.queue[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadIntakeDetails = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctor/intake/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedIntake(data.intake);
        setSignoffResult(data.intake.fhirBundle || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleFieldAction = async (fieldId, action, value = null) => {
    if (!selectedIntake) return;
    try {
      const res = await fetch(`/api/doctor/review/${selectedIntake.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId,
          action,
          editedValue: value,
          doctorName: 'Dr. S. K. Sharma (MD Ayush, AIIA)'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIntake(data.intake);
        setEditingField(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignoffAndFhirExport = async () => {
    if (!selectedIntake) return;
    try {
      const res = await fetch(`/api/doctor/signoff/${selectedIntake.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: 'Dr. S. K. Sharma (MD Ayush, AIIA)',
          clinicalNotes: doctorNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIntake(data.intake);
        setSignoffResult(data.fhirBundle);
        loadQueue();
        alert('Case officially verified! ABDM FHIR R4 Bundle generated successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadFhirJson = () => {
    if (!signoffResult) return;
    const blob = new Blob([JSON.stringify(signoffResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ABDM_FHIR_R4_${selectedIntake?.patient?.abhaNumber || 'Record'}.json`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              {isHi ? 'चिकित्सक प्री-कंसल्टेशन डैशबोर्ड' : 'Physician Pre-Consultation Portal'}
            </h2>
            <p className="text-xs text-emerald-200 mt-0.5">
              "We don't replace the doctor — we prepare the doctor" • Physician-in-the-Loop Verification
            </p>
          </div>
        </div>

        <span className="bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 text-xs px-3 py-1.5 rounded-xl font-semibold">
          Active OPD Queue: {queue.length} Patients
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Triage Queue */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Pre-Intake Patient Queue
          </h3>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {queue.map((item) => {
              const isSelected = selectedIntake?.id === item.id;
              const isRed = item.redFlag?.isRedFlag;
              return (
                <button
                  key={item.id}
                  onClick={() => loadIntakeDetails(item.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all relative ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isRed && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> RED FLAG
                    </span>
                  )}

                  <h4 className="font-bold text-xs text-slate-900">{item.patientName}</h4>
                  <span className="text-[10px] text-slate-500 font-mono block">ABHA: {item.abhaNumber}</span>
                  <span className="text-[11px] font-semibold text-slate-700 mt-1 block truncate">
                    CC: {item.chiefComplaint || 'General Intake'}
                  </span>

                  <div className="flex items-center gap-2 mt-2 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      item.status === 'DOCTOR_VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-slate-400">BP: {item.vitals?.systolic}/{item.vitals?.diastolic}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Taking Summary & Verification Controls */}
        <div className="lg:col-span-8 space-y-5">
          {selectedIntake ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              {/* Patient Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedIntake.patient.name}</span>
                    <span className="text-xs font-normal text-slate-500">
                      ({selectedIntake.patient.age}y / {selectedIntake.patient.gender})
                    </span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    ABHA ID: {selectedIntake.patient.abhaNumber} • DPDP Consent: {selectedIntake.patient.consent?.status || 'Active'}
                  </span>
                </div>

                {selectedIntake.redFlagStatus?.isRedFlag && (
                  <div className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-red-500/20">
                    <AlertTriangle className="w-4 h-4" />
                    EMERGENCY TRIAGE ALERT
                  </div>
                )}
              </div>

              {/* Vitals Panel */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Pre-Consultation Vitals (BLE Ingest)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                    <span className="font-bold text-slate-900">{selectedIntake.vitals?.systolic}/{selectedIntake.vitals?.diastolic} mmHg</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Pulse Rate</span>
                    <span className="font-bold text-slate-900">{selectedIntake.vitals?.pulse || 72} bpm</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">SpO2 Oxygen</span>
                    <span className="font-bold text-blue-900">{selectedIntake.vitals?.spo2 || 98}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Temperature</span>
                    <span className="font-bold text-orange-900">{selectedIntake.vitals?.temp || 98.4}°F</span>
                  </div>
                </div>
              </div>

              {/* AYUSH Prakriti Summary */}
              {selectedIntake.prakriti && (
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
                  <strong className="flex items-center gap-1 text-emerald-900 font-serif text-sm">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    Ayurvedic Constitution (प्रकृति): {selectedIntake.prakriti.constitutionType}
                  </strong>
                  <p className="text-[11px] text-emerald-800">
                    Vata: {selectedIntake.prakriti.percentages?.vata}% | Pitta: {selectedIntake.prakriti.percentages?.pitta}% | Kapha: {selectedIntake.prakriti.percentages?.kapha}%
                  </p>
                </div>
              )}

              {/* Evidence-Linked Draft Fields (Physician-in-the-Loop Controls) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Evidence-Linked Clinical Summary (Draft Fields)
                  </h4>
                  <span className="text-[10px] text-slate-500 italic">
                    Physician must Accept / Edit / Reject every field
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(selectedIntake.evidenceLinks || []).map((ev, idx) => {
                    const fieldReview = selectedIntake.doctorReview?.reviewedFields?.[ev.field];
                    const isAccepted = fieldReview?.action === 'ACCEPT';
                    const isRejected = fieldReview?.action === 'REJECT';

                    return (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{ev.field}:</span>
                            <span className="text-xs text-slate-700 font-semibold">{fieldReview?.value || ev.value}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            🔗 Source: {ev.source} (Confidence: {Math.round(ev.confidence * 100)}%)
                          </span>
                        </div>

                        {/* Accept / Edit / Reject Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleFieldAction(ev.field, 'ACCEPT', ev.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              isAccepted ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => {
                              const newVal = prompt('Edit field value:', ev.value);
                              if (newVal !== null) handleFieldAction(ev.field, 'EDIT', newVal);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleFieldAction(ev.field, 'REJECT')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              isRejected ? 'bg-red-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-red-50'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Doctor Clinical Notes & Official Sign-off */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 block">
                  Physician Final Assessment & Prescription Directive:
                </label>
                <textarea
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSignoffAndFhirExport}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Doctor Clinical Sign-Off & Generate ABDM FHIR R4 Record
                  </button>

                  {signoffResult && (
                    <button
                      onClick={downloadFhirJson}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download FHIR JSON
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500">
              Select a patient intake from the queue on the left to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
