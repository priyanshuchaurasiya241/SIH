
const { useState, useEffect, useRef } = React;

// 1. Embedded Icons
function Icon({ name, className = "w-5 h-5", ...props }) {
  const icons = {
    HeartPulse: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>,
    Leaf: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
    Activity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/></svg>,
    FileText: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>,
    Stethoscope: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
    ShieldCheck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>,
    Mic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>,
    MicOff: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>,
    Send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
    AlertTriangle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
    Volume2: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>,
    VolumeX: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>,
    Sparkles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
    UploadCloud: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>,
    Check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polyline points="20 6 9 17 4 12"/></svg>,
    X: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
    Edit3: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
    Download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
    Bluetooth: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>,
    Languages: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>,
    CheckCircle2: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
    Image: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  };
  return icons[name] || <span className={className}>●</span>;
}

// 2. Voice Helper
class VoiceManager {
  static speak(text, lang = 'hi') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { hi: 'hi-IN', mr: 'mr-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', gu: 'gu-IN', en: 'en-IN' };
    utterance.lang = langMap[lang] || 'hi-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
}

// 3. Main Application Component
function App() {
  const [activeTab, setActiveTab] = useState('intake');
  const [language, setLanguage] = useState('hi');
  const [activeIntake, setActiveIntake] = useState(null);
  const [showConsent, setShowConsent] = useState(true);

  const isHi = language === 'hi';

  const bhashiniLanguages = [
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'en', name: 'English' }
  ];

  useEffect(() => {
    fetch('/api/intake/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rameshwar Lal (रामेश्वर लाल)',
        age: 54,
        gender: 'Male',
        phone: '9811234567',
        preferredLanguage: language
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setActiveIntake(d.intake);
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-white px-4 py-2 text-xs flex flex-wrap justify-between items-center border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded text-[10px]">SIH 2026 #26047</span>
          <span className="font-semibold tracking-wide">आयुष मंत्रालय | Ministry of Ayush & AIIA — Pre-Consultation Intake System</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-900/70 border border-emerald-600/50 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
            <Icon name="Languages" className="w-3.5 h-3.5" /> Bhashini AI Multilingual Pipeline Active
          </span>
          <span className="bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-300">
            AES-256-GCM Encrypted
          </span>
        </div>
      </div>

      {/* Main Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('intake')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
                <Icon name="Leaf" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                  AIIA MediKiosk
                </h1>
                <p className="text-[11px] text-slate-500">
                  {isHi ? 'रोगी केस-टेकिंग व प्री-कंसल्टेशन डॉक्टर ब्रीफिंग' : 'AI Clinical Intake & Pre-Consultation Doctor Briefing'}
                </p>
              </div>
            </div>

            {/* Desktop Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { id: 'intake', label: isHi ? 'रोगी साक्षात्कार' : 'Patient Intake', icon: 'HeartPulse' },
                { id: 'ayush', label: isHi ? 'आयुष प्रकृति' : 'AYUSH Prakriti', icon: 'Leaf' },
                { id: 'vitals', label: isHi ? 'वाइटल्स (IoT/BLE)' : 'Vitals (BLE)', icon: 'Activity' },
                { id: 'ocr', label: isHi ? 'पर्चा OCR' : 'Prescription OCR', icon: 'FileText' },
                { id: 'doctor', label: isHi ? 'डॉक्टर पोर्टल' : 'Doctor Portal', icon: 'Stethoscope' },
                { id: 'security', label: isHi ? 'सुरक्षा व ऑडिट' : 'Security & Audit', icon: 'ShieldCheck' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon name={tab.icon} className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Language Selector (Bhashini Multi-Indic) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs">
                <Icon name="Languages" className="w-3.5 h-3.5 text-emerald-700" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
                >
                  {bhashiniLanguages.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>

              {activeIntake && (
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
                  <span className="font-semibold text-emerald-950">{activeIntake.patient?.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
            {[
              { id: 'intake', label: isHi ? 'साक्षात्कार' : 'Intake', icon: 'HeartPulse' },
              { id: 'ayush', label: isHi ? 'प्रकृति' : 'Prakriti', icon: 'Leaf' },
              { id: 'vitals', label: isHi ? 'वाइटल्स' : 'Vitals', icon: 'Activity' },
              { id: 'ocr', label: isHi ? 'OCR' : 'OCR', icon: 'FileText' },
              { id: 'doctor', label: isHi ? 'डॉक्टर' : 'Doctor', icon: 'Stethoscope' },
              { id: 'security', label: isHi ? 'सुरक्षा' : 'Security', icon: 'ShieldCheck' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon name={tab.icon} className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main View Router */}
      <main className="flex-1 pb-10">
        {activeTab === 'intake' && (
          <IntakeView
            activeIntake={activeIntake}
            setActiveIntake={setActiveIntake}
            language={language}
            onGoDoctor={() => setActiveTab('doctor')}
          />
        )}
        {activeTab === 'ayush' && (
          <PrakritiView
            activeIntake={activeIntake}
            setActiveIntake={setActiveIntake}
            language={language}
          />
        )}
        {activeTab === 'vitals' && (
          <VitalsView
            activeIntake={activeIntake}
            setActiveIntake={setActiveIntake}
            language={language}
          />
        )}
        {activeTab === 'ocr' && (
          <OcrView
            activeIntake={activeIntake}
            setActiveIntake={setActiveIntake}
            language={language}
          />
        )}
        {activeTab === 'doctor' && (
          <DoctorView language={language} />
        )}
        {activeTab === 'security' && (
          <SecurityView language={language} />
        )}
      </main>

      {/* Consent Popup */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Icon name="ShieldCheck" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHi ? 'डिजिटल स्वास्थ्य डेटा सहमति (DPDP Act 2023)' : 'Digital Health Consent (DPDP Act 2023)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isHi ? 'आयुष्मान भारत डिजिटल मिशन (ABDM) व आयुष प्री-कंसल्टेशन' : 'ABDM M3 & Ayush Pre-Consultation Compliance'}
                </p>
              </div>
            </div>

            <div className="my-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
              <p className="font-semibold text-slate-800">
                {isHi ? 'नमस्ते! यह सॉफ्टवेयर डॉक्टर से मिलने से पहले आपकी प्राथमिक स्वास्थ्य जानकारी व पुरानी पर्ची दर्ज करने के लिए है ताकि डॉक्टर का समय बच सके।' : 'Welcome! This pre-intake assistant gathers structured symptoms and past prescriptions to save doctor time during consultation.'}
              </p>
              <p>
                {isHi 
                  ? '🔒 आपका समस्त डेटा सरकारी मानक AES-256-GCM द्वारा सुरक्षित है। चिकित्सक समीक्षा (Physician-in-the-loop) के बाद ही जानकारी अंतिम मानी जाएगी।'
                  : '🔒 All data is protected with AES-256-GCM government encryption. Every field is verified by the attending physician.'}
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowConsent(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
                {isHi ? 'रद्द करें' : 'Close'}
              </button>
              <button onClick={() => setShowConsent(false)} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20">
                {isHi ? 'मैं सहमति देता/देती हूँ' : 'I Agree & Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-3 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-1">
          <span>SIH 2026 Problem Statement #26047 • Ministry of Ayush & AIIA</span>
          <span className="text-[11px] text-slate-500">AES-256-GCM Encrypted Storage • ABDM FHIR R4 Ready</span>
        </div>
      </footer>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 1: PATIENT INTAKE WITH DIRECT FILE MANAGER UPLOADER
// -------------------------------------------------------------
function IntakeView({ activeIntake, setActiveIntake, language, onGoDoctor }) {
  const [messages, setMessages] = useState([
    {
      sender: 'AI',
      text: language === 'hi' 
        ? 'नमस्ते रामेश्वर जी! कृपया बताएं कि आपको मुख्य रूप से क्या समस्या है? आप नीचे दिए गए चित्रों को छूकर या बोलकर बता सकते हैं।'
        : 'Welcome! Please describe what main symptom you are experiencing. You can tap the icons below or speak.',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState({
    stage: 'STAGE_1_CHIEF_COMPLAINT',
    question: 'कृपया अपनी मुख्य समस्या बताएं / Select your main symptom',
    type: 'symptom_picker'
  });
  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [redFlagAlert, setRedFlagAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [ocrScanning, setOcrScanning] = useState(false);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const isHi = language === 'hi';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stagesList = [
    { id: 'STAGE_1_CHIEF_COMPLAINT', labelHi: '1. मुख्य लक्षण', labelEn: '1. Symptom' },
    { id: 'STAGE_2_ONSET_DURATION', labelHi: '2. समय व शुरुआत', labelEn: '2. Onset' },
    { id: 'STAGE_3_CHARACTER_SEVERITY', labelHi: '3. तीव्रता (1-10)', labelEn: '3. Severity' },
    { id: 'STAGE_4_RADIATION_ASSOCIATED', labelHi: '4. फैलाव व पसीना', labelEn: '4. Radiation' },
    { id: 'STAGE_5_GIS_WEATHER', labelHi: '5. मौसम संदर्भ', labelEn: '5. Weather' },
    { id: 'STAGE_6_DOCUMENTS_MEDS', labelHi: '6. पर्चा व दवाएं', labelEn: '6. Documents' },
    { id: 'STAGE_7_COMPLETE', labelHi: '7. सारांश तैयार', labelEn: '7. Doctor Ready' }
  ];

  const visualSymptoms = [
    { id: 'chest_pain', titleHi: 'सीने में दर्द (छाती)', titleEn: 'Chest Pain', icon: 'HeartPulse', color: 'from-red-500 to-rose-600', badge: 'URGENT' },
    { id: 'breathlessness', titleHi: 'सांस फूलना', titleEn: 'Shortness of Breath', icon: 'Activity', color: 'from-amber-500 to-orange-600', badge: 'URGENT' },
    { id: 'cough', titleHi: 'खांसी / कफ', titleEn: 'Cough / Phlegm', icon: 'Activity', color: 'from-blue-500 to-cyan-600' },
    { id: 'fever', titleHi: 'बुखार / तपन', titleEn: 'Fever / Chills', icon: 'Activity', color: 'from-orange-500 to-red-600' },
    { id: 'stomach_pain', titleHi: 'पेट दर्द / गैस', titleEn: 'Stomach Pain', icon: 'Activity', color: 'from-emerald-500 to-teal-600' },
    { id: 'joint_pain', titleHi: 'जोड़ों में दर्द', titleEn: 'Joint / Knee Pain', icon: 'Activity', color: 'from-yellow-600 to-amber-700' }
  ];

  // Open native OS File Manager Window
  const openFileManager = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle selected file from OS File Manager
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFilePreview(event.target.result);
      // Run OCR processing on chosen prescription file
      processChosenFile(file.name);
    };
    reader.readAsDataURL(file);
  };

  const processChosenFile = async (fileName) => {
    setOcrScanning(true);
    // Standard realistic prescription content parsed by OCR engine
    const simulatedOcrText = `ALL INDIA INSTITUTE OF AYURVEDA (AIIA)
Date: 12/05/2025  BP: 148/92 mmHg  Pulse: 84
Rx:
1. Tab. Amoxyclav 625mg  1-0-1 (BD) x 5 days
2. Tab. Ecosprin 75mg OD
3. Sudarshan Vati  2 tab BD with warm water
4. Sitopaladi Churna 3g with honey TDS`;

    await handleSend(null, null, simulatedOcrText, fileName);
    setOcrScanning(false);
  };

  const handleSend = async (customText, symId = null, docText = null, fileName = null) => {
    const text = customText || inputVal;
    if (!text && !symId && !docText) return;

    const displayMsg = docText 
      ? (isHi ? `📄 पर्चा स्कैन किया गया: ${fileName || selectedFileName || 'Prescription.jpg'}` : `📄 Uploaded Document: ${fileName || selectedFileName || 'Prescription.jpg'}`)
      : (text || `Selected: ${symId}`);

    setMessages(prev => [...prev, {
      sender: 'USER',
      text: displayMsg,
      time: new Date().toLocaleTimeString()
    }]);

    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/intake/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeId: activeIntake?.id,
          userSpeechText: text,
          selectedSymptomId: symId,
          uploadedDocText: docText,
          uploadedFileName: fileName || selectedFileName || 'Prescription_Upload.jpg'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveIntake(data.intake);
        if (data.redFlagCheck?.isRedFlag) {
          setRedFlagAlert(data.redFlagCheck);
        }
        setCurrentQuestion(data.nextQuestion);

        const aiReply = data.replyText;
        setMessages(prev => [...prev, {
          sender: 'AI',
          text: aiReply,
          time: new Date().toLocaleTimeString(),
          isRedFlag: data.redFlagCheck?.isRedFlag
        }]);

        if (ttsEnabled) VoiceManager.speak(aiReply, language);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported on this browser.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputVal(transcript);
      handleSend(transcript);
      setIsRecording(false);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
  };

  const currentStageIndex = stagesList.findIndex(s => s.id === (activeIntake?.currentStage || 'STAGE_1_CHIEF_COMPLAINT'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hidden Native File Input for OS File Manager */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.png,.jpg,.jpeg,.pdf"
        className="hidden"
      />

      {/* Patient & GIS Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold">{activeIntake?.patient?.name || 'Rameshwar Lal'}</h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded border border-emerald-500/40 font-mono">
              ABHA: {activeIntake?.patient?.abhaNumber || '91-4820-1940-5821'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">54 Yrs • Male • AIIA OPD Pre-Intake</p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-700">
          <span className="text-blue-300">🌧️ Rain (88% Hum)</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300">💨 AQI: 185</span>
          <span className="text-slate-600">|</span>
          <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-bold">Bhashini Voice Active</span>
        </div>
      </div>

      {/* Progress Step Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
        {stagesList.map((st, idx) => {
          const isDone = activeIntake?.completedStages?.includes(st.id);
          const isCurrent = (activeIntake?.currentStage || 'STAGE_1_CHIEF_COMPLAINT') === st.id;
          return (
            <div
              key={st.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isCurrent 
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400' 
                  : isDone
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              {isDone ? <Icon name="CheckCircle2" className="w-3.5 h-3.5 text-emerald-600" /> : <span>{idx + 1}.</span>}
              <span>{isHi ? st.labelHi : st.labelEn}</span>
            </div>
          );
        })}
      </div>

      {/* Red Flag Alert Banner */}
      {redFlagAlert?.isRedFlag && (
        <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-4 text-red-950 animate-pulse-slow shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <Icon name="AlertTriangle" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-red-700">
                🚨 RED FLAG DETECTED ({redFlagAlert.severity}) — Diverting to Emergency Triage
              </h3>
              <p className="text-xs text-red-900 font-semibold mt-0.5">{redFlagAlert.priorityAlert}</p>
              <p className="text-[11px] text-red-700 mt-1">Recommended Action: {redFlagAlert.recommendedAction}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Selector + Direct File Uploader */}
        <div className="lg:col-span-6 space-y-4">
          {/* Visual Picker for Stage 1 */}
          {(!activeIntake?.chiefComplaint || activeIntake?.currentStage === 'STAGE_1_CHIEF_COMPLAINT') && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🖼️</span> {isHi ? 'चित्र छूकर अपनी तकलीफ बताएं (Select Symptom)' : 'Touch/Visual Symptom Selector'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {visualSymptoms.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSend(`मुझे ${isHi ? s.titleHi : s.titleEn} की शिकायत है`, s.id)}
                    className="relative flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-center group"
                  >
                    {s.badge && <span className="absolute top-1.5 right-1.5 bg-red-500 text-white font-bold text-[8px] px-1 rounded">{s.badge}</span>}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-xs mb-1.5`}>
                      <Icon name={s.icon} className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xs text-slate-800 leading-tight">{isHi ? s.titleHi : s.titleEn}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Question Touch Options Pad */}
          {currentQuestion && currentQuestion.options && (
            <div className="bg-emerald-50/90 rounded-2xl p-5 border border-emerald-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  ✨ {isHi ? 'त्वरित उत्तर विकल्प (Quick Tap Options)' : 'Quick Tap Options'}
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  Step {currentStageIndex + 1}/6
                </span>
              </div>

              <p className="text-xs font-bold text-slate-800">{currentQuestion.question}</p>

              <div className="space-y-2">
                {currentQuestion.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSend(opt.text)}
                    className="w-full text-left p-3 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-800 border border-emerald-100 font-semibold text-xs shadow-xs transition-all flex items-center justify-between"
                  >
                    <span>{opt.text}</span>
                    <span className="text-[10px] opacity-70">➔</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct Native Document & File Upload Area */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="UploadCloud" className="w-4 h-4 text-teal-600" />
                {isHi ? 'पुरानी पर्ची / रिपोर्ट अपलोड करें' : 'Upload Past Prescriptions / Reports'}
              </h3>
              <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {activeIntake?.ocrDocuments?.length || 0} Analyzed
              </span>
            </div>

            {/* Clickable Dropzone that directly triggers OS File Picker */}
            <div
              onClick={openFileManager}
              className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 rounded-xl p-5 text-center cursor-pointer transition-all space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center">
                <Icon name="UploadCloud" className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-950 block">
                  {isHi ? 'कंप्यूटर/मोबाइल से पर्चा चुनें (Choose Prescription File)' : 'Browse from Device / Open File Manager'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {isHi ? 'JPG, PNG या PDF फोटो चुनें' : 'Click to open File Manager (JPG, PNG, PDF)'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openFileManager(); }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-xs inline-flex items-center gap-1"
              >
                <Icon name="UploadCloud" className="w-3.5 h-3.5" />
                {isHi ? 'फाइल चुनें (Open File Manager)' : 'Select Document File'}
              </button>
            </div>

            {/* File Upload / OCR Status */}
            {ocrScanning && (
              <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-teal-900 animate-pulse">
                <Icon name="Sparkles" className="w-4 h-4 text-teal-600" />
                <span>Scanning document text & matching against CDSCO / AYUSH Formulary...</span>
              </div>
            )}

            {/* Uploaded Documents List */}
            {activeIntake?.ocrDocuments && activeIntake.ocrDocuments.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-slate-700 uppercase block">Extracted Active Medications:</span>
                {activeIntake.ocrDocuments.flatMap(d => d.extractedMedications || []).map((m, i) => (
                  <div key={i} className="flex justify-between items-center bg-white p-1.5 px-2 rounded border border-slate-100 text-[11px]">
                    <span className="font-bold text-slate-900">{m.matchedStandardName}</span>
                    <span className="text-slate-500">{m.dosage} ({m.frequency})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Conversational AI Intake Chatbot */}
        <div className="lg:col-span-6 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-[500px]">
          <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-900">
                {isHi ? 'AI साक्षात्कार वार्तालाप (Bhashini)' : 'Bhashini AI Intake Assistant'}
              </span>
            </div>
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1"
            >
              <Icon name={ttsEnabled ? 'Volume2' : 'VolumeX'} className="w-3 h-3" />
              {ttsEnabled ? 'Voice ON' : 'Muted'}
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px] bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.sender === 'AI' ? 'items-start' : 'items-end'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-xs leading-relaxed ${
                  m.sender === 'AI'
                    ? m.isRedFlag ? 'bg-red-600 text-white font-bold' : 'bg-white text-slate-800 border border-slate-200'
                    : 'bg-emerald-600 text-white font-medium'
                }`}>
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.time}</span>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400 animate-pulse">Bhashini NLP processing...</div>}
            <div ref={chatEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2.5 rounded-xl border ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}
                title="Bhashini Speech-to-Text"
              >
                <Icon name={isRecording ? 'MicOff' : 'Mic'} className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={isHi ? 'समस्या लिखें या माइक दबाकर बोलें...' : 'Type symptoms or tap microphone...'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700">
                <Icon name="Send" className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 2: AYUSH PRAKRITI PARIKSHA
// -------------------------------------------------------------
function PrakritiView({ activeIntake, setActiveIntake, language }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(activeIntake?.prakriti || null);
  const [loading, setLoading] = useState(false);
  const isHi = language === 'hi';

  useEffect(() => {
    fetch('/api/ayush/questions')
      .then(r => r.json())
      .then(d => { if (d.success) setQuestions(d.questions); });
  }, []);

  const calculate = async () => {
    setLoading(true);
    const responses = Object.keys(answers).map(k => ({ questionId: k, dosha: answers[k].dosha, score: answers[k].score }));
    try {
      const res = await fetch('/api/ayush/prakriti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeId: activeIntake?.id, responses })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.evaluation);
        if (activeIntake) setActiveIntake({ ...activeIntake, prakriti: data.evaluation });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-gradient-to-r from-emerald-950 to-teal-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <Icon name="Leaf" className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {isHi ? 'आयुष प्रकृति परीक्षण (CCRAS Prakriti Assessment)' : 'AYUSH Prakriti Pariksha (CCRAS Standard)'}
            </h2>
            <p className="text-xs text-emerald-200">
              {isHi ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA) त्रिदोष व धातु मूल्यांकन' : 'AIIA Tridosha Profiler (Vata, Pitta, Kapha Analysis)'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Q{idx + 1}: {q.category}</span>
                <h4 className="text-xs font-bold text-slate-900">{isHi ? q.questionHi : q.questionEn}</h4>
                <div className="space-y-1.5">
                  {q.options.map((opt, oIdx) => {
                    const sel = answers[q.id]?.text === opt.text;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`w-full text-left p-2 rounded-lg text-xs font-medium border flex justify-between items-center ${
                          sel ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{opt.text}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sel ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {opt.dosha}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={calculate}
              disabled={Object.keys(answers).length === 0 || loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md"
            >
              {isHi ? 'प्रकृति गणना करें (Calculate Prakriti)' : 'Evaluate Prakriti Constitution'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">CCRAS Classified</span>
              <h3 className="text-base font-bold text-slate-900 font-serif">{result.constitutionType}</h3>
              <p className="text-xs text-slate-600">{result.description}</p>

              <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-blue-700">
                    <span>Vata (वात)</span>
                    <span>{result.percentages.vata}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${result.percentages.vata}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-red-600">
                    <span>Pitta (पित्त)</span>
                    <span>{result.percentages.pitta}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${result.percentages.pitta}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-emerald-700">
                    <span>Kapha (कफ)</span>
                    <span>{result.percentages.kapha}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${result.percentages.kapha}%` }}></div>
                  </div>
                </div>
              </div>

              {result.recommendations && (
                <div className="space-y-2 text-xs">
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-950">
                    <strong>🥗 Ahara (Diet):</strong> <p>{result.recommendations.diet?.[0]}</p>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-950">
                    <strong>🧘 Vihara (Lifestyle):</strong> <p>{result.recommendations.lifestyle?.[0]}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
              Complete the questionnaire on the left to view the Tri-Dosha breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 3: HARDWARE & BLE VITALS
// -------------------------------------------------------------
function VitalsView({ activeIntake, setActiveIntake, language }) {
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [pulse, setPulse] = useState(74);
  const [spo2, setSpo2] = useState(98);
  const [temp, setTemp] = useState(98.4);
  const [ble, setBle] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const isHi = language === 'hi';

  const sync = async () => {
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
          source: ble ? 'BLE Omron/Contec Monitor' : 'Simulated Ingest'
        })
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        if (activeIntake) setActiveIntake({ ...activeIntake, vitals: data.vitals, vitalsAnalysis: data.analysis });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">{isHi ? 'चिकित्सीय उपकरण वाइटल्स (BLE / IoT)' : 'Medical Device Ingest (BLE / IoT)'}</h2>
          <p className="text-xs text-blue-200">Blood Pressure, Pulse Oximeter, & Temperature Ingest</p>
        </div>
        <button
          onClick={() => setBle(!ble)}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${ble ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}
        >
          <Icon name="Bluetooth" className="w-4 h-4" />
          {ble ? 'BLE Device Paired' : 'Pair Bluetooth'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-700">Blood Pressure (mmHg)</span>
          <div className="flex gap-2">
            <input type="number" value={systolic} onChange={e => setSystolic(Number(e.target.value))} className="w-1/2 p-2 bg-slate-50 rounded-lg font-bold border" />
            <input type="number" value={diastolic} onChange={e => setDiastolic(Number(e.target.value))} className="w-1/2 p-2 bg-slate-50 rounded-lg font-bold border" />
          </div>
          <span className="text-xs text-slate-500 block text-center font-black">{systolic}/{diastolic} mmHg</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-700">SpO2 Oxygen & Pulse</span>
          <div className="flex gap-2">
            <input type="number" value={spo2} onChange={e => setSpo2(Number(e.target.value))} className="w-1/2 p-2 bg-slate-50 rounded-lg font-bold border" />
            <input type="number" value={pulse} onChange={e => setPulse(Number(e.target.value))} className="w-1/2 p-2 bg-slate-50 rounded-lg font-bold border" />
          </div>
          <span className="text-xs text-slate-500 block text-center font-black">{spo2}% • {pulse} BPM</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-700">Body Temp (°F)</span>
          <input type="number" step="0.1" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full p-2 bg-slate-50 rounded-lg font-bold border" />
          <span className="text-xs text-slate-500 block text-center font-black">{temp} °F</span>
        </div>
      </div>

      <div className="text-center">
        <button onClick={sync} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md">
          {isHi ? 'वाइटल्स सिंक करें व नैदानिक जांच करें' : 'Sync Vitals & Evaluate Ranges'}
        </button>
      </div>

      {analysis && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs flex gap-4">
          <span className="font-bold">BP: {analysis.bloodPressure.label}</span>
          <span className="font-bold">SpO2: {analysis.spo2.label}</span>
          <span className="font-bold">Pulse: {analysis.pulse.label}</span>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 4: OCR PRESCRIPTION SCANNER WITH DIRECT FILE EXPLORER
// -------------------------------------------------------------
function OcrView({ activeIntake, setActiveIntake, language }) {
  const [raw, setRaw] = useState(`ALL INDIA INSTITUTE OF AYURVEDA (AIIA), NEW DELHI
OPD PRESCRIPTION
Date: 12/05/2025  BP: 148/92 mmHg  Pulse: 84
Rx:
1. Tab. Amoxyclav 625mg  1-0-1 (BD) x 5 days
2. Tab. Paracetamol 650mg SOS for fever
3. Sudarshan Vati  2 tab BD with warm water
4. Sitopaladi Churna 3g with honey TDS`);
  const [ocr, setOcr] = useState(null);
  const fileInputRef = useRef(null);
  const isHi = language === 'hi';

  const processOcr = async (textToProcess = null, fileName = null) => {
    try {
      const res = await fetch('/api/ocr/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeId: activeIntake?.id,
          rawText: textToProcess || raw,
          fileName: fileName || 'Uploaded_Prescription.jpg'
        })
      });
      const data = await res.json();
      if (data.success) {
        setOcr(data.ocrResult);
        if (activeIntake) setActiveIntake({ ...activeIntake, ocrDocuments: [data.ocrResult] });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processOcr(raw, file.name);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.png,.jpg,.jpeg,.pdf"
        className="hidden"
      />

      <div className="bg-gradient-to-r from-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-teal-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">{isHi ? 'दवा पर्चा OCR व फार्मूलरी मिलान' : 'Prescription OCR & Drug Formulary Matcher'}</h2>
          <p className="text-xs text-teal-200">CDSCO & AYUSH Formulary Cross-Verification Layer</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5"
        >
          <Icon name="UploadCloud" className="w-4 h-4" />
          {isHi ? 'फाइल मैनेजर से पर्चा चुनें' : 'Browse File Manager'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <label className="text-xs font-bold text-slate-800 block">Raw Prescription Stream / OCR Scan:</label>
          <textarea rows={8} value={raw} onChange={e => setRaw(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border text-xs font-mono" />
          <button onClick={() => processOcr()} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md">
            Execute Multi-Pass Drug Verification
          </button>
        </div>

        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Matched & Verified Medications</h3>
          {ocr?.extractedMedications ? (
            <div className="space-y-2">
              {ocr.extractedMedications.map((m, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">{m.matchedStandardName}</h4>
                    <span className="text-[10px] text-slate-500">{m.dosage} • {m.frequency}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {Math.round(m.confidence * 100)}% Confidence
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-10">Click verify or choose file to process OCR stream.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 5: DOCTOR PRE-CONSULTATION PORTAL & CLINICAL BRIEFING
// -------------------------------------------------------------
function DoctorView({ language }) {
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('Patient clinical intake validated. Proceed with diagnostic workup.');
  const [prescribedDrugs, setPrescribedDrugs] = useState(['Tab. Ecosprin 75mg OD', 'Sudarshan Vati 2 tab BD', 'Sitopaladi Churna 3g TDS']);
  const [newDrug, setNewDrug] = useState('');
  const [fhir, setFhir] = useState(null);
  const isHi = language === 'hi';

  const loadQueue = async () => {
    try {
      const res = await fetch('/api/doctor/queue');
      const data = await res.json();
      if (data.success) {
        setQueue(data.queue);
        if (data.queue.length > 0 && !selected) {
          loadDetails(data.queue[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDetails = async (id) => {
    try {
      const res = await fetch(`/api/doctor/intake/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelected(data.intake);
        setFhir(data.intake.fhirBundle || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadQueue(); }, []);

  const handleField = async (fieldId, action, val) => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/doctor/review/${selected.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldId, action, editedValue: val, doctorName: 'Dr. S. K. Sharma (MD Ayush, AIIA)' })
      });
      const data = await res.json();
      if (data.success) setSelected(data.intake);
    } catch (e) {
      console.error(e);
    }
  };

  const signoff = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/doctor/signoff/${selected.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: 'Dr. S. K. Sharma (MD Ayush, AIIA)',
          clinicalNotes: notes,
          prescriptionMedicines: prescribedDrugs
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.intake);
        setFhir(data.fhirBundle);
        loadQueue();
        alert('Case verified & ABDM FHIR R4 Bundle Generated with Doctor Prescription!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const downloadFhir = () => {
    if (!fhir) return;
    const blob = new Blob([JSON.stringify(fhir, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_R4_${selected?.patient?.abhaNumber || 'Record'}.json`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">{isHi ? 'चिकित्सक प्री-कंसल्टेशन डैशबोर्ड' : 'Physician Pre-Consultation Portal'}</h2>
          <p className="text-xs text-emerald-200">"We don't replace the doctor — we prepare the doctor" • AI Briefing & Prescription Pad</p>
        </div>
        <span className="bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 text-xs px-3 py-1.5 rounded-xl font-bold">
          Queue: {queue.length} Patients
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
          {queue.map(q => (
            <button
              key={q.id}
              onClick={() => loadDetails(q.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all relative ${
                selected?.id === q.id ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-2 ring-emerald-500' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              {q.redFlag?.isRedFlag && (
                <span className="absolute top-2 right-2 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full">
                  RED FLAG
                </span>
              )}
              <h4 className="font-bold text-xs text-slate-900">{q.patientName}</h4>
              <span className="text-[10px] text-slate-500 font-mono block">ABHA: {q.abhaNumber}</span>
              <span className="text-[11px] font-semibold text-slate-700 block truncate mt-1">CC: {q.chiefComplaint || 'General Intake'}</span>
            </button>
          ))}
        </div>

        {/* Right: Summary & AI Clinical Briefing */}
        <div className="lg:col-span-8 space-y-4">
          {selected && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selected.patient.name} ({selected.patient.age}y / {selected.patient.gender})</h3>
                  <span className="text-xs text-slate-500 font-mono">ABHA: {selected.patient.abhaNumber} • Consent: Active (DPDP 2023)</span>
                </div>
                {selected.redFlagStatus?.isRedFlag && (
                  <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-xl">🚨 EMERGENCY TRIAGE</span>
                )}
              </div>

              {/* AI Clinical Briefing Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl border border-slate-700 space-y-2.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Icon name="Sparkles" className="w-4 h-4" />
                  <span>AI Pre-Consultation Synthesis (Doctor Briefing)</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {selected.doctorAnalysisBriefing?.summaryText || 'Clinical summary synthesized from interview.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-slate-800/90 p-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Past Meds from Prescription OCR:</span>
                    <span className="text-emerald-300 font-semibold">{selected.doctorAnalysisBriefing?.activeMedicationsFromOcr?.join(', ')}</span>
                  </div>
                  <div className="bg-slate-800/90 p-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Ayurvedic Constitution (Prakriti):</span>
                    <span className="text-teal-300 font-semibold">{selected.doctorAnalysisBriefing?.ayushAssessment}</span>
                  </div>
                </div>

                {selected.doctorAnalysisBriefing?.differentialPoints && (
                  <div className="bg-red-950/60 border border-red-800/60 p-2.5 rounded-lg text-xs text-red-200 space-y-1">
                    <strong className="block text-red-300">Differential Considerations:</strong>
                    {selected.doctorAnalysisBriefing.differentialPoints.map((dp, i) => (
                      <p key={i}>• {dp}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Vitals Summary */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border text-center text-xs">
                <div><span className="text-[10px] text-slate-400 block">BP</span><strong>{selected.vitals?.systolic}/{selected.vitals?.diastolic} mmHg</strong></div>
                <div><span className="text-[10px] text-slate-400 block">Pulse</span><strong>{selected.vitals?.pulse} bpm</strong></div>
                <div><span className="text-[10px] text-slate-400 block">SpO2</span><strong>{selected.vitals?.spo2}%</strong></div>
                <div><span className="text-[10px] text-slate-400 block">Temp</span><strong>{selected.vitals?.temp}°F</strong></div>
              </div>

              {/* Physician Evidence Verification Controls */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase block">Physician-in-the-Loop Field Verification:</span>
                {(selected.evidenceLinks || []).map((ev, i) => {
                  const rev = selected.doctorReview?.reviewedFields?.[ev.field];
                  return (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <strong>{ev.field}:</strong> <span>{rev?.value || ev.value}</span>
                        <span className="text-[10px] text-slate-400 block">🔗 Source: {ev.source}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleField(ev.field, 'ACCEPT', ev.value)} className={`px-2 py-1 rounded text-[11px] font-bold ${rev?.action === 'ACCEPT' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'}`}>Accept</button>
                        <button onClick={() => { const v = prompt('Edit value:', ev.value); if (v) handleField(ev.field, 'EDIT', v); }} className="px-2 py-1 rounded text-[11px] font-bold bg-white border text-slate-700">Edit</button>
                        <button onClick={() => handleField(ev.field, 'REJECT')} className={`px-2 py-1 rounded text-[11px] font-bold ${rev?.action === 'REJECT' ? 'bg-red-600 text-white' : 'bg-white border text-slate-700'}`}>Reject</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Doctor Prescription Pad */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="Stethoscope" className="w-4 h-4 text-emerald-700" />
                  Doctor's Electronic Prescription Pad:
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDrug}
                    onChange={(e) => setNewDrug(e.target.value)}
                    placeholder="Add medicine (e.g. Tab. Telmisartan 40mg OD / Arogyavardhini Vati 1 BD)..."
                    className="flex-1 p-2 bg-white border border-emerald-200 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => {
                      if (newDrug.trim()) {
                        setPrescribedDrugs([...prescribedDrugs, newDrug.trim()]);
                        setNewDrug('');
                      }
                    }}
                    className="px-3 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg"
                  >
                    + Add Drug
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {prescribedDrugs.map((d, idx) => (
                    <span key={idx} className="bg-white border border-emerald-300 text-emerald-950 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                      <span>{d}</span>
                      <button onClick={() => setPrescribedDrugs(prescribedDrugs.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sign-off & Export */}
              <div className="space-y-2 pt-2 border-t">
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-xl text-xs" placeholder="Doctor's clinical findings..." />
                <div className="flex gap-2">
                  <button onClick={signoff} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md">
                    Doctor Clinical Sign-Off & Generate ABDM FHIR R4 Record
                  </button>
                  {fhir && (
                    <button onClick={downloadFhir} className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
                      Download FHIR JSON
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 6: SECURITY & AUDIT EXPLORER
// -------------------------------------------------------------
function SecurityView({ language }) {
  const [sec, setSec] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/security/inspect').then(r => r.json()).then(d => setSec(d));
    fetch('/api/audit/logs').then(r => r.json()).then(d => setLogs(d.logs || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-zinc-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <h2 className="text-lg font-bold">Government Grade AES-256-GCM Security & Audit Explorer</h2>
        <p className="text-xs text-slate-300">DPDP Act 2023 Tamper-Evident Logs & Encrypted File At Rest</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase">On-Disk Raw Encrypted Envelope (intakes.enc.json):</h3>
          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-[10px] font-mono overflow-x-auto max-h-[350px]">
            {JSON.stringify(sec?.onDiskEncryptedFile?.encryptedEnvelope, null, 2)}
          </pre>
        </div>

        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase">DPDP 2023 Tamper-Evident Audit Trails:</h3>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {logs.map((l, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{l.action}</span>
                  <span className="text-[10px] text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className="text-[11px] text-emerald-700 block">{l.actor}</span>
                <span className="text-[9px] text-slate-400 font-mono block truncate">HMAC: {l.signature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mount React Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
