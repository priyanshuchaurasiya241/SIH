
import React, { useState, useEffect } from 'react';
import { Leaf, Sparkles, CheckCircle2, RotateCcw, Flame, Wind, Droplets, BookOpen } from 'lucide-react';

export default function AyushPrakritiView({ activeIntake, setActiveIntake, language }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const isHi = language === 'hi';

  useEffect(() => {
    fetch('/api/ayush/questions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions);
        }
      })
      .catch(err => console.error(err));

    if (activeIntake?.prakriti) {
      setResult(activeIntake.prakriti);
    }
  }, [activeIntake]);

  const handleSelectOption = (qId, option) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const calculatePrakriti = async () => {
    setLoading(true);
    const responses = Object.keys(answers).map(qId => ({
      questionId: qId,
      dosha: answers[qId].dosha,
      score: answers[qId].score
    }));

    try {
      const res = await fetch('/api/ayush/prakriti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeId: activeIntake?.id,
          responses
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.evaluation);
        if (activeIntake) {
          setActiveIntake({ ...activeIntake, prakriti: data.evaluation });
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
      {/* AYUSH Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
            <Leaf className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif">
              {isHi ? 'आयुष प्रकृति परीक्षण (CCRAS Prakriti Assessment)' : 'AYUSH Prakriti Pariksha (CCRAS Standard)'}
            </h2>
            <p className="text-xs text-emerald-200 mt-0.5">
              {isHi ? 'अखिल भारतीय आयुर्वेद संस्थान (AIIA) 30-पैरामीटर त्रिदोष मूल्यांकन' : 'All India Institute of Ayurveda Tridosha & Constitution Profiler'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Questionnaire Left, Dosha Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Questions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                {isHi ? 'प्रश्नावली (Questionnaire)' : 'Standardized Questions'}
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {Object.keys(answers).length} / {questions.length} Answered
              </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">{q.category}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {isHi ? q.questionHi : q.questionEn}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-1.5 pl-7">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = answers[q.id]?.text === opt.text;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt.text}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {opt.dosha}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={calculatePrakriti}
                disabled={Object.keys(answers).length === 0 || loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isHi ? 'प्रकृति व त्रिदोष गणना करें (Calculate Prakriti)' : 'Evaluate Prakriti Constitution'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tri-Dosha Radar & Result */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">CCRAS Classified</span>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {result.constitutionType}
                </h3>
                <p className="text-xs text-slate-600 mt-1">{result.description}</p>
              </div>

              {/* Dosha Breakdown Gauges */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isHi ? 'त्रिदोष अनुपात (Dosha Proportions)' : 'Tridosha Percentages'}
                </h4>

                {/* Vata */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1 text-blue-700">
                      <Wind className="w-3.5 h-3.5" /> Vata (वात)
                    </span>
                    <span className="text-blue-900">{result.percentages.vata}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${result.percentages.vata}%` }}></div>
                  </div>
                </div>

                {/* Pitta */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1 text-red-600">
                      <Flame className="w-3.5 h-3.5" /> Pitta (पित्त)
                    </span>
                    <span className="text-red-900">{result.percentages.pitta}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${result.percentages.pitta}%` }}></div>
                  </div>
                </div>

                {/* Kapha */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Droplets className="w-3.5 h-3.5" /> Kapha (कफ)
                    </span>
                    <span className="text-emerald-900">{result.percentages.kapha}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${result.percentages.kapha}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Ahara & Vihara Guidance */}
              {result.recommendations && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isHi ? 'आहार व विहार मार्गदर्शन (Diet & Lifestyle)' : 'Personalized Ayurvedic Guidance'}
                  </h4>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                    <strong className="block text-amber-900">🥗 Ahara (Diet):</strong>
                    <p>{result.recommendations.diet?.[0]}</p>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <strong className="block text-emerald-900">🧘 Vihara (Lifestyle):</strong>
                    <p>{result.recommendations.lifestyle?.[0]}</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1">
                    <strong className="block text-purple-900">🌿 Supportive Herbs:</strong>
                    <p>{result.recommendations.supportiveHerbs?.[0]}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-3">
              <Leaf className="w-12 h-12 mx-auto text-slate-400" />
              <h4 className="text-xs font-bold text-slate-700">No Assessment Completed Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Answer the questionnaire on the left to calculate the patient's Tri-Dosha balance and Prakriti type.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
