
import React, { useState } from 'react';
import { FileText, Upload, Sparkles, AlertTriangle, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function OcrPrescriptionView({ activeIntake, setActiveIntake, language }) {
  const [rawText, setRawText] = useState(`ALL INDIA INSTITUTE OF AYURVEDA (AIIA), NEW DELHI
OPD PRESCRIPTION
Date: 12/05/2025  BP: 148/92 mmHg  Pulse: 84
Rx:
1. Tab. Amoxyclav 625mg  1-0-1 (BD) x 5 days
2. Tab. Paracetamol 650mg SOS for fever
3. Sudarshan Vati  2 tab BD with warm water
4. Sitopaladi Churna 3g with honey TDS
Adv: Avoid cold foods, rest for 3 days.`);

  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const isHi = language === 'hi';

  const handleProcessOcr = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ocr/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeId: activeIntake?.id,
          fileName: 'Doctor_Prescription_Scan_01.jpg',
          rawText
        })
      });
      const data = await res.json();
      if (data.success) {
        setOcrResult(data.ocrResult);
        if (activeIntake) {
          setActiveIntake({
            ...activeIntake,
            ocrDocuments: [...(activeIntake.ocrDocuments || []), data.ocrResult]
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-teal-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              {isHi ? 'दवा पर्चा व लैब रिपोर्ट OCR स्कैनर' : 'Prescription & Report OCR Intelligence'}
            </h2>
            <p className="text-xs text-teal-200 mt-0.5">
              {isHi ? 'डॉक्टर की हस्तलिखित पर्चियों की पहचान व CDSCO / आयुष फार्मूलरी सत्यापन' : 'CDSCO Drug Database & AYUSH Formulary Fuzzy Verification Layer'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Raw OCR text */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-700 block">
                {isHi ? 'पर्चे की फोटो अपलोड करें (Upload Prescription Photo)' : 'Upload Prescription Scan or Photo'}
              </span>
              <span className="text-[10px] text-slate-400">Supports JPG, PNG, PDF</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {isHi ? 'OCR से प्राप्त कच्चा टेक्स्ट (Raw OCR Text Stream):' : 'Raw Extracted Document Stream:'}
              </label>
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleProcessOcr}
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isHi ? 'दवाओं का मिलान व सत्यापन करें' : 'Execute Multi-Pass Drug Verification'}
            </button>
          </div>
        </div>

        {/* Right Column: Structured Extracted Medicines with Confidence */}
        <div className="lg:col-span-6 space-y-4">
          {ocrResult ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Extracted & Verified Medications
                  </h3>
                  <span className="text-[10px] text-slate-500">{ocrResult.extractedMedications?.length} matched</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  CDSCO & AYUSH Grounded
                </span>
              </div>

              <div className="space-y-3">
                {ocrResult.extractedMedications?.map((med, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{med.matchedStandardName}</h4>
                        <span className="text-[10px] text-slate-500 block">{med.category} • {med.dbType}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        med.confidence >= 0.85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Confidence: {Math.round(med.confidence * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                      <span>Dose: {med.dosage}</span>
                      <span>Freq: {med.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                <strong>⚠️ Physician Safety Rule:</strong>
                <p>AI OCR extractions are treated as draft recommendations. Doctor verification is mandatory before clinical entry.</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-3">
              <FileText className="w-12 h-12 mx-auto text-slate-400" />
              <h4 className="text-xs font-bold text-slate-700">No Document Processed</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click 'Execute Multi-Pass Drug Verification' to extract and cross-reference medicines against Indian Pharmacopoeia & AYUSH Formularies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
