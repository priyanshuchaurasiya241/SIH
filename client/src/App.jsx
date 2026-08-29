
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ConsentModal from './components/ConsentModal';
import PatientIntakeView from './views/PatientIntakeView';
import AyushPrakritiView from './views/AyushPrakritiView';
import HardwareVitalsView from './views/HardwareVitalsView';
import OcrPrescriptionView from './views/OcrPrescriptionView';
import DoctorPortalView from './views/DoctorPortalView';
import SecurityAuditView from './views/SecurityAuditView';

export default function App() {
  const [activeTab, setActiveTab] = useState('intake');
  const [language, setLanguage] = useState('hi');
  const [activeIntake, setActiveIntake] = useState(null);
  const [showConsent, setShowConsent] = useState(true);

  const isRedFlag = activeIntake?.redFlagStatus?.isRedFlag;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        activeIntake={activeIntake}
        isRedFlag={isRedFlag}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'intake' && (
          <PatientIntakeView
            activeIntake={activeIntake}
            setActiveIntake={setActiveIntake}
            language={language}
            setLanguage={setLanguage}
            onCompleteIntake={() => setActiveTab('doctor')}
          />
        )}
        {activeTab === 'ayush' && (
          <AyushPrakritiView
            activeIntake={activeIntake}
            setActiveIntake={setActiveIntake}
            language={language}
          />
        )}
        {activeTab === 'vitals' && (
          <HardwareVitalsView
            activeIntake={activeIntake}
            setActiveIntake={setActiveIntake}
            language={language}
          />
        )}
        {activeTab === 'ocr' && (
          <OcrPrescriptionView
            activeIntake={activeIntake}
            setActiveIntake={setActiveIntake}
            language={language}
          />
        )}
        {activeTab === 'doctor' && (
          <DoctorPortalView language={language} />
        )}
        {activeTab === 'security' && (
          <SecurityAuditView language={language} />
        )}
      </main>

      {/* Consent Modal on load */}
      <ConsentModal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onAccept={() => setShowConsent(false)}
        patientName={activeIntake?.patient?.name || 'Ramesh Kumar'}
        language={language}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>SIH 2026 Problem Statement #26047 • Ministry of Ayush & AIIA</span>
          <span className="text-[11px] text-slate-500">Government Grade AES-256-GCM • ABDM FHIR R4 Ready</span>
        </div>
      </footer>
    </div>
  );
}
