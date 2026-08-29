
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  AlertOctagon, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CloudRain, 
  Wind, 
  MapPin,
  ShieldCheck,
  User,
  HeartPulse,
  Flame,
  FileCheck
} from 'lucide-react';
import VisualSymptomPicker from '../components/VisualSymptomPicker';
import { VoiceService } from '../components/VoiceService';

export default function PatientIntakeView({ activeIntake, setActiveIntake, language, setLanguage, onCompleteIntake }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [adaptiveQuestions, setAdaptiveQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [redFlagAlert, setRedFlagAlert] = useState(null);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const isHi = language === 'hi';

  // Initialize intake session if none exists
  useEffect(() => {
    setVoiceSupported(VoiceService.isSpeechSupported());
    if (!activeIntake) {
      startNewIntake('Ramesh Kumar', 48, 'Male', '9876543210');
    } else {
      // Load existing session messages
      const initialGreeting = isHi
        ? `नमस्ते ${activeIntake.patient.name} जी! कृपया बताएं कि आपको क्या शारीरिक कष्ट है? आप नीचे दिए गए चित्रों को छूकर या बोलकर बता सकते हैं।`
        : `Welcome ${activeIntake.patient.name}! Please describe what medical problem you are facing today. You can speak or tap the visual symptom icons below.`;
      
      const loadedMsgs = [
        { sender: 'AI', text: initialGreeting, timestamp: new Date().toLocaleTimeString() }
      ];

      (activeIntake.conversationTurns || []).forEach(turn => {
        loadedMsgs.push({
          sender: turn.sender === 'PATIENT' ? 'USER' : 'AI',
          text: turn.text,
          timestamp: new Date(turn.timestamp).toLocaleTimeString()
        });
      });

      setMessages(loadedMsgs);
      if (activeIntake.redFlagStatus?.isRedFlag) {
        setRedFlagAlert(activeIntake.redFlagStatus);
      }
    }
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewIntake = async (name, age, gender, phone) => {
    setLoading(true);
    try {
      const res = await fetch('/api/intake/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age,
          gender,
          phone,
          preferredLanguage: language,
          location: { city: 'New Delhi', district: 'South Delhi', type: 'Urban' },
          weather: { condition: 'rain', isRaining: true, temp: 28, humidity: 88, aqi: 185 }
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveIntake(data.intake);
        setMessages([
          { sender: 'AI', text: data.initialMessage, timestamp: new Date().toLocaleTimeString() }
        ]);
        if (ttsEnabled) {
          VoiceService.speak(data.initialMessage, language);
        }
      }
    } catch (err) {
      console.error('Failed to start intake:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend, symptomId = null) => {
    const text = textToSend || inputVal;
    if (!text && !symptomId) return;

    const userMsg = {
      sender: 'USER',
      text: text || (symptomId ? `Selected symptom: ${symptomId}` : ''),
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/intake/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeId: activeIntake?.id,
          userSpeechText: text,
          selectedSymptomId: symptomId,
          answers: []
        })
      });

      const data = await res.json();
      if (data.success) {
        setActiveIntake(data.intake);

        // Check Red Flags
        if (data.redFlagCheck?.isRedFlag) {
          setRedFlagAlert(data.redFlagCheck);
        }

        // Set Adaptive Questions
        setAdaptiveQuestions(data.adaptiveQuestions || []);

        // AI Response construction
        let aiReply = '';
        if (data.redFlagCheck?.isRedFlag && data.redFlagCheck?.severity === 'CRITICAL') {
          aiReply = isHi
            ? `🚨 चेतावनी: आपके बताए लक्षण (जैसे सीने में तेज दर्द/सांस में तकलीफ) आपातकालीन स्थिति के संकेत हो सकते हैं। कृपया घबराएं नहीं, हमारे सिस्टम ने डॉक्टर व आपातकालीन ट्रायज को तुरंत अलर्ट भेज दिया है।`
            : `🚨 PRIORITY ALERT: Your described symptoms indicate a potential emergency. The system has automatically alerted the on-duty emergency triage doctor.`;
        } else if (data.adaptiveQuestions && data.adaptiveQuestions.length > 0) {
          aiReply = data.adaptiveQuestions[0].question;
        } else {
          aiReply = isHi
            ? 'धन्यवाद, आपकी जानकारी सुरक्षित दर्ज कर ली गई है। क्या आप कोई पुरानी पर्ची अपलोड करना चाहते हैं या आयुष प्रकृति जांच करना चाहते हैं?'
            : 'Thank you, your clinical history has been securely recorded. Would you like to check your AYUSH Prakriti or upload past prescriptions?';
        }

        setMessages(prev => [...prev, {
          sender: 'AI',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString(),
          isRedFlag: data.redFlagCheck?.isRedFlag
        }]);

        if (ttsEnabled) {
          VoiceService.speak(aiReply, language);
        }
      }
    } catch (err) {
      console.error('Error sending response:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!voiceSupported) {
      alert('Speech Recognition is not supported on this browser. Please use text input or Chrome/Edge.');
      return;
    }

    const recognition = VoiceService.createRecognition(
      language,
      ({ finalTranscript, interimTranscript }) => {
        if (finalTranscript) {
          setInputVal(finalTranscript);
          handleSendMessage(finalTranscript);
          setIsRecording(false);
        } else if (interimTranscript) {
          setInputVal(interimTranscript);
        }
      },
      () => setIsRecording(false),
      (err) => {
        console.error('Speech error:', err);
        setIsRecording(false);
      }
    );

    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Patient & Weather Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold text-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold">
                {activeIntake?.patient?.name || 'Ramesh Kumar'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded border border-emerald-500/40 font-mono">
                ABHA: {activeIntake?.patient?.abhaNumber || '91-4820-1940-5821'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{activeIntake?.patient?.age || 48} Yrs • {activeIntake?.patient?.gender || 'Male'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3 h-3 text-red-400" /> New Delhi OPD (Kiosk #3)
              </span>
            </p>
          </div>
        </div>

        {/* GIS & Weather Live Context */}
        <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
          <div className="flex items-center gap-1.5 text-blue-300">
            <CloudRain className="w-4 h-4 text-blue-400" />
            <span>Rain (88% Hum)</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-amber-300">
            <Wind className="w-4 h-4 text-amber-400" />
            <span>AQI: 185 (Moderate)</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-400/30">
            🌧️ GIS Context Active
          </span>
        </div>
      </div>

      {/* Critical Red Flag Banner if triggered */}
      {redFlagAlert?.isRedFlag && (
        <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-4 sm:p-5 text-red-950 animate-pulse-slow shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
              <AlertOctagon className="w-6 h-6 animate-spin-slow" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-red-700 flex items-center gap-2">
                  <span>🚨 RED FLAG DETECTED (प्राथमिक आपातकालीन ट्रायज)</span>
                  <span className="bg-red-600 text-white text-[10px] uppercase px-2 py-0.5 rounded-full font-extrabold">
                    {redFlagAlert.severity}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-red-900 font-semibold mt-1">
                {redFlagAlert.priorityAlert}
              </p>
              <div className="mt-2 text-xs bg-white/80 p-2.5 rounded-lg border border-red-200 text-red-800 space-y-1">
                <p><strong>Clinical Protocol:</strong> {redFlagAlert.recommendedAction}</p>
                <p className="text-[11px] text-red-600"><strong>Source Rule:</strong> {redFlagAlert.matchedRules?.[0]?.title || 'WHO ETAT Emergency Guidelines'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Visual Picker on Top, Chat & Adaptive Flow below */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Selector & Adaptive Questions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Visual Picker */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <VisualSymptomPicker
              onSelectSymptom={(symId, label) => {
                handleSendMessage(`मुझे ${label} की शिकायत है`, symId);
              }}
              selectedSymptoms={activeIntake?.selectedSymptoms || []}
              language={language}
            />
          </div>

          {/* Adaptive Questions Panel */}
          {adaptiveQuestions.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {isHi ? 'अनुकूली नैदानिक प्रश्न (Adaptive Follow-ups)' : 'Adaptive Clinical Follow-up'}
                </h4>
                <span className="text-[10px] bg-emerald-200/60 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  AI SOCRATES Engine
                </span>
              </div>

              <div className="space-y-3">
                {adaptiveQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-white rounded-xl p-3.5 border border-emerald-100 shadow-xs space-y-2">
                    {q.tag && (
                      <span className="inline-block bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded">
                        {q.tag}
                      </span>
                    )}
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      {q.question}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(q.options || []).map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSendMessage(opt.text)}
                          className="text-xs bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-medium transition-all text-left"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Conversational AI Intake Chatbot */}
        <div className="lg:col-span-6 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          {/* Chat Header */}
          <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {isHi ? 'इंटरैक्टिव नैदानिक साक्षात्कार' : 'Interactive Clinical Intake Assistant'}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {isHi ? 'आवाज व पाठ आधारित द्विभाषी वार्तालाप' : 'Multilingual Voice & Touch Conversational AI'}
                </p>
              </div>
            </div>
            
            {/* Audio Toggle */}
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              title={ttsEnabled ? 'Disable Voice Playback' : 'Enable Voice Playback'}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                ttsEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-semibold">{ttsEnabled ? 'Voice ON' : 'Muted'}</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px] bg-slate-50/50">
            {messages.map((msg, idx) => {
              const isAi = msg.sender === 'AI';
              return (
                <div key={idx} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                      isAi
                        ? msg.isRedFlag
                          ? 'bg-red-600 text-white rounded-tl-none font-medium'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                        : 'bg-emerald-600 text-white rounded-tr-none font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></div>
                <span>{isHi ? 'AI विश्लेषण कर रहा है...' : 'AI processing response...'}</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-md shadow-red-500/30'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                }`}
                title={isHi ? 'बोलकर बताएं (Microphone)' : 'Speak via Voice'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={isHi ? 'अपनी समस्या लिखें या माइक दबाकर बोलें...' : 'Type symptoms or tap the microphone to speak...'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputVal.trim() && !loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-slate-500">
              <span>🗣️ {isHi ? 'हिन्दी व स्थानीय भाषा समर्थित' : 'Hindi & Indic Voice ASR Active'}</span>
              <span>🔒 {isHi ? 'AES-256 सुरक्षित' : 'AES-256 Encrypted Draft'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
