
/**
 * Deterministic Clinical Safety & Red Flag Rule Engine
 * Follows WHO Emergency Triage Assessment & Treatment (ETAT) and AIIA Clinical Guidelines
 */
export class RedFlagEngine {
  static evaluate(symptoms = [], history = {}, vitals = {}) {
    const matchedRules = [];
    let severity = 'ROUTINE'; // ROUTINE | URGENT | CRITICAL
    let category = null;
    let priorityAlert = null;
    let recommendedAction = null;

    const lowerSymptoms = symptoms.map(s => (typeof s === 'string' ? s.toLowerCase() : (s.id || '').toLowerCase()));
    const description = ((history.description || '') + ' ' + (history.chiefComplaint || '')).toLowerCase();

    // 1. CARDIAC EMERGENCY RULES
    const hasChestPain = lowerSymptoms.includes('chest_pain') || 
      description.includes('chest') || 
      description.includes('छाती') || 
      description.includes('सीने') || 
      description.includes('सीना') || 
      description.includes('हृदय') ||
      description.includes('cardiac');

    const hasRadiation = description.includes('arm') || 
      description.includes('jaw') || 
      description.includes('neck') || 
      description.includes('बाएं हाथ') || 
      description.includes('हाथ') || 
      description.includes('haath') ||
      description.includes('baaye') ||
      description.includes('bayen') ||
      description.includes('gardan') ||
      description.includes('जबड़ा');

    const hasSweating = description.includes('sweat') || 
      description.includes('पसीना') || 
      description.includes('paseena') || 
      description.includes('pasina') ||
      lowerSymptoms.includes('diaphoresis');

    const hasDyspnea = lowerSymptoms.includes('breathlessness') || 
      description.includes('saans') || 
      description.includes('sans') || 
      description.includes('breath') || 
      description.includes('सांस') || 
      description.includes('दम');

    if (hasChestPain && (hasRadiation || hasSweating || hasDyspnea || description.includes('tez') || description.includes('severe') || description.includes('तेज'))) {
      severity = 'CRITICAL';
      category = 'CARDIAC_EMERGENCY';
      matchedRules.push({
        code: 'RF-CARD-01',
        title: 'Suspected Acute Coronary Syndrome (ACS / MI)',
        rationale: 'Chest pain accompanied by radiation to arm/jaw, diaphoresis, or severe dyspnea.',
        protocol: 'Immediate 12-lead ECG, Oxygen supplementation, Sublingual Nitrate/Aspirin protocol as per physician directive.',
        source: 'WHO ETAT / ACC-AHA Emergency Triage Guidelines'
      });
      priorityAlert = '🚨 CRITICAL RED FLAG: Suspected Cardiac Event — Divert from OPD queue to Emergency Triage immediately.';
      recommendedAction = 'Alert Senior Medical Officer, prepare crash cart, perform immediate ECG.';
    }

    // 2. SEVERE RESPIRATORY DISTRESS
    const isSpO2Critical = vitals.spo2 && vitals.spo2 < 90;
    const isPulseRapid = vitals.pulse && vitals.pulse > 130;

    if ((hasDyspnea && isSpO2Critical) || (lowerSymptoms.includes('breathlessness') && (description.includes('stridor') || description.includes('wheeze') || description.includes('सांस उखड़ रही') || description.includes('dikkat')))) {
      if (severity !== 'CRITICAL') {
        severity = isSpO2Critical ? 'CRITICAL' : 'URGENT';
        category = 'RESPIRATORY_DISTRESS';
        matchedRules.push({
          code: 'RF-RESP-01',
          title: 'Acute Respiratory Distress / Hypoxemia Risk',
          rationale: `Dyspnea with SpO2: ${vitals.spo2 || 'reported severe'}.`,
          protocol: 'Supplemental Oxygen support, Nebulization as prescribed, Peak flow monitoring.',
          source: 'National Clinical Protocol for Acute Respiratory Distress'
        });
        priorityAlert = priorityAlert || '⚠️ URGENT RED FLAG: Respiratory Distress — Priority triage required.';
        recommendedAction = recommendedAction || 'Oxygen supplementation, emergency bronchodilator protocol.';
      }
    }

    // 3. STROKE / NEUROLOGICAL EMERGENCY (FAST Criteria)
    const hasStrokeSigns = description.includes('slurred') || 
      description.includes('facial droop') || 
      description.includes('weakness in one side') || 
      description.includes('लकवा') || 
      description.includes('मुंह टेढ़ा') || 
      description.includes('thunderclap') ||
      description.includes('ek taraf kamzori');

    if (hasStrokeSigns) {
      severity = 'CRITICAL';
      category = 'STROKE_NEURO_EMERGENCY';
      matchedRules.push({
        code: 'RF-NEURO-01',
        title: 'Suspected Acute Ischemic Stroke / Intracranial Hemorrhage',
        rationale: 'Acute focal neurological deficit (FAST criteria positive) or sudden thunderclap headache.',
        protocol: 'Immediate non-contrast CT Brain, maintain airway, assess for thrombolysis window (<4.5 hrs).',
        source: 'Indian Stroke Association Guidelines'
      });
      priorityAlert = '🚨 CRITICAL RED FLAG: Suspected Acute Stroke — Golden hour protocol active.';
      recommendedAction = 'Immediate CT Brain scan, alert on-duty Neurologist/Physician.';
    }

    // 4. HYPERTENSIVE CRISIS
    if (vitals.systolic >= 180 || vitals.diastolic >= 110) {
      severity = severity === 'CRITICAL' ? 'CRITICAL' : 'URGENT';
      matchedRules.push({
        code: 'RF-VIT-01',
        title: 'Hypertensive Urgency / Crisis',
        rationale: `Blood pressure severely elevated: ${vitals.systolic}/${vitals.diastolic} mmHg.`,
        protocol: 'Rest in quiet room, re-check in 5 mins, physician assessment for end-organ damage.',
        source: 'Indian Guidelines on Hypertension (I-GH-IV)'
      });
      priorityAlert = priorityAlert || '⚠️ URGENT ALERT: Hypertensive Emergency / Urgency (BP >= 180/110).';
    }

    return {
      isRedFlag: matchedRules.length > 0,
      severity,
      category,
      priorityAlert,
      recommendedAction,
      matchedRules,
      timestamp: new Date().toISOString()
    };
  }
}
