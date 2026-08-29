
import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

export default function ConsentModal({ isOpen, onClose, onAccept, patientName = 'Patient', language = 'hi' }) {
  if (!isOpen) return null;
  const isHi = language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isHi ? 'डिजिटल स्वास्थ्य डेटा सहमति (DPDP Act 2023)' : 'Digital Health Consent (DPDP Act 2023)'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHi ? 'आयुष्मान भारत डिजिटल मिशन (ABDM) अनुपालन' : 'ABDM & Ayush OPD Clinical Compliance'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="my-4 space-y-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60 max-h-64 overflow-y-auto">
          <p className="font-semibold text-slate-800">
            {isHi ? `नमस्ते ${patientName} जी,` : `Dear ${patientName},`}
          </p>
          <p>
            {isHi 
              ? 'यह सॉफ्टवेयर डॉक्टर से मिलने से पहले आपकी प्राथमिक स्वास्थ्य जानकारी, लक्षण, वाइटल्स व पुरानी पर्ची को व्यवस्थित करने के लिए है। यह डॉक्टर का विकल्प नहीं है।'
              : 'This AI-assisted intake system collects and structures your clinical symptoms, vitals, and past reports before your doctor consultation. It prepares the physician and does not replace medical advice.'}
          </p>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{isHi ? 'डेटा एन्क्रिप्शन: आपका सारा डेटा AES-256-GCM सुरक्षा के साथ सुरक्षित रहता है।' : 'AES-256-GCM Government Grade Encryption at rest & transit.'}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{isHi ? 'चिकित्सक समीक्षा: हर एक जानकारी डॉक्टर द्वारा स्वीकृत होने के बाद ही दर्ज होगी।' : 'Physician-in-the-loop: Every detail is verified and approved by the doctor.'}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{isHi ? 'सहमति वापसी: आप कभी भी अपनी सहमति वापस ले सकते हैं।' : 'Right to revoke consent anytime under DPDP Act 2023.'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            {isHi ? 'रद्द करें' : 'Decline'}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            {isHi ? 'मैं सहमति देता/देती हूँ' : 'I Agree & Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}
