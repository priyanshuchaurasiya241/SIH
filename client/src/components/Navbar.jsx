
import React from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  Leaf, 
  Activity, 
  FileText, 
  ShieldCheck, 
  Globe, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, language, setLanguage, activeIntake, isRedFlag }) {
  const tabs = [
    { id: 'intake', label: language === 'hi' ? 'रोगी साक्षात्कार' : 'Patient Intake', icon: HeartPulse },
    { id: 'ayush', label: language === 'hi' ? 'आयुष प्रकृति' : 'AYUSH Prakriti', icon: Leaf },
    { id: 'vitals', label: language === 'hi' ? 'वाइटल्स (IoT/BLE)' : 'Vitals (BLE)', icon: Activity },
    { id: 'ocr', label: language === 'hi' ? 'पर्चा OCR' : 'Prescription OCR', icon: FileText },
    { id: 'doctor', label: language === 'hi' ? 'डॉक्टर पोर्टल' : 'Doctor Portal', icon: Stethoscope },
    { id: 'security', label: language === 'hi' ? 'सुरक्षा व ऑडिट' : 'Security & Audit', icon: ShieldCheck },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Govt Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white px-4 py-1.5 text-xs flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">SIH 2026 #26047</span>
          <span className="font-semibold tracking-wide">आयुष मंत्रालय | Ministry of Ayush & All India Institute of Ayurveda (AIIA)</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-1 text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            ABDM Sandbox Connected (FHIR R4)
          </span>
          <span className="bg-emerald-900/60 border border-emerald-600/40 px-2 py-0.5 rounded text-[11px] font-mono">
            AES-256-GCM Encrypted
          </span>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('intake')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                  AIIA Pre-Consultation System
                </h1>
                {isRedFlag && (
                  <span className="bg-red-500 text-white font-bold text-[11px] px-2 py-0.5 rounded-full animate-bounce flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> RED FLAG
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'रोगी केस-टेकिंग व क्लिनिकल ट्रायज सॉफ्टवेयर' : 'AI Multilingual Clinical Intake & Triage'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Lang + Active Patient */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  language === 'hi' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-slate-600'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  language === 'en' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-slate-600'
                }`}
              >
                English
              </button>
            </div>

            {/* Active Patient Indicator */}
            {activeIntake && (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <div className="text-left">
                  <span className="font-semibold text-emerald-950 block max-w-[120px] truncate">{activeIntake.patient.name}</span>
                  <span className="text-[10px] text-emerald-700 font-mono">{activeIntake.patient.abhaNumber.slice(0, 7)}...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
