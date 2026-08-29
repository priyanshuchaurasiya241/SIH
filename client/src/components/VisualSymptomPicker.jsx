
import React from 'react';
import { 
  HeartPulse, 
  Wind, 
  Activity, 
  Thermometer, 
  ShieldAlert, 
  Brain, 
  Bone, 
  Sparkles, 
  ZapOff, 
  Flame 
} from 'lucide-react';

export default function VisualSymptomPicker({ onSelectSymptom, selectedSymptoms = [], language = 'hi' }) {
  const isHi = language === 'hi';

  const symptoms = [
    {
      id: 'chest_pain',
      titleHi: 'सीने / छाती में दर्द',
      titleEn: 'Chest Pain',
      descHi: 'भारीपन, जलन या खिंचाव',
      descEn: 'Pressure, tightness, ache',
      icon: HeartPulse,
      color: 'from-red-500 to-rose-600',
      bgLight: 'bg-red-50 hover:bg-red-100/80 border-red-200',
      badge: 'URGENT'
    },
    {
      id: 'breathlessness',
      titleHi: 'सांस फूलना / तकलीफ',
      titleEn: 'Shortness of Breath',
      descHi: 'सांस लेने में भारीपन',
      descEn: 'Difficulty breathing',
      icon: Wind,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
      badge: 'URGENT'
    },
    {
      id: 'cough',
      titleHi: 'खांसी / कफ',
      titleEn: 'Cough / Phlegm',
      descHi: 'सूखी या बलगम वाली खांसी',
      descEn: 'Dry or productive cough',
      icon: Activity,
      color: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200'
    },
    {
      id: 'fever',
      titleHi: 'बुखार / तपन',
      titleEn: 'Fever / Chills',
      descHi: 'ठंड लगना या शरीर तपना',
      descEn: 'High temp with shivering',
      icon: Thermometer,
      color: 'from-orange-500 to-red-600',
      bgLight: 'bg-orange-50 hover:bg-orange-100/80 border-orange-200'
    },
    {
      id: 'stomach_pain',
      titleHi: 'पेट दर्द / मरोड़',
      titleEn: 'Stomach Pain',
      descHi: 'उदर शूल, गैस या ऐंठन',
      descEn: 'Cramps or sharp pain',
      icon: ShieldAlert,
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200'
    },
    {
      id: 'headache',
      titleHi: 'सिर दर्द / चक्कर',
      titleEn: 'Headache / Migraine',
      descHi: 'आधा सिर या भारीपन',
      descEn: 'Throbbing head ache',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50 hover:bg-purple-100/80 border-purple-200'
    },
    {
      id: 'joint_pain',
      titleHi: 'जोड़ों / घुटने में दर्द',
      titleEn: 'Joint / Knee Pain',
      descHi: 'संधिशूल, सूजन, उठने में दर्द',
      descEn: 'Stiffness & swelling',
      icon: Bone,
      color: 'from-yellow-600 to-amber-700',
      bgLight: 'bg-yellow-50 hover:bg-yellow-100/80 border-yellow-200'
    },
    {
      id: 'skin_rash',
      titleHi: 'त्वचा / खुजली / दाने',
      titleEn: 'Skin Rash / Itching',
      descHi: 'लाल चकत्ते, एलर्जी',
      descEn: 'Redness, hives or sores',
      icon: Sparkles,
      color: 'from-pink-500 to-rose-600',
      bgLight: 'bg-pink-50 hover:bg-pink-100/80 border-pink-200'
    },
    {
      id: 'digestive_issue',
      titleHi: 'कब्ज / अपच / गैस',
      titleEn: 'Indigestion / Acidity',
      descHi: 'अग्निमांद्य, खट्टी डकार',
      descEn: 'Acid reflux, bloating',
      icon: Flame,
      color: 'from-teal-600 to-emerald-700',
      bgLight: 'bg-teal-50 hover:bg-teal-100/80 border-teal-200'
    },
    {
      id: 'weakness',
      titleHi: 'कमजोरी / थकान',
      titleEn: 'General Fatigue',
      descHi: 'सुस्ती व बदन टूटना',
      descEn: 'Exhaustion & malaise',
      icon: ZapOff,
      color: 'from-slate-600 to-zinc-700',
      bgLight: 'bg-slate-100 hover:bg-slate-200/80 border-slate-300'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>🖼️</span>
            {isHi ? 'चित्र छूकर अपनी तकलीफ बताएं (Select Problem)' : 'Visual Symptom Selector (Touch / Tap)'}
          </h3>
          <p className="text-xs text-slate-500">
            {isHi ? 'ग्रामीण व बुजुर्ग मरीजों के लिए आसान स्पर्श चयन' : 'Designed for high accessibility & low-literacy users'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {symptoms.map((s) => {
          const Icon = s.icon;
          const isSelected = selectedSymptoms.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onSelectSymptom(s.id, isHi ? s.titleHi : s.titleEn)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 group ${
                isSelected
                  ? 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-400 shadow-md scale-[1.02]'
                  : `${s.bgLight} border shadow-sm hover:scale-[1.01]`
              }`}
            >
              {s.badge && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white font-bold text-[8px] px-1 rounded">
                  {s.badge}
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md mb-2 group-hover:rotate-3 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-slate-800 leading-tight">
                {isHi ? s.titleHi : s.titleEn}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {isHi ? s.descHi : s.descEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
