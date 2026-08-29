
export class VitalsEngine {
  static evaluateVitals(vitals = {}) {
    const analysis = {
      bloodPressure: { status: 'NORMAL', label: 'Normal BP' },
      pulse: { status: 'NORMAL', label: 'Normal Heart Rate' },
      spo2: { status: 'NORMAL', label: 'Normal Oxygen Saturation' },
      temperature: { status: 'NORMAL', label: 'Afebrile' },
      bloodGlucose: { status: 'NORMAL', label: 'Normal Blood Sugar' },
      hasAbnormality: false,
      alerts: []
    };

    if (vitals.systolic && vitals.diastolic) {
      if (vitals.systolic >= 180 || vitals.diastolic >= 110) {
        analysis.bloodPressure = { status: 'CRITICAL', label: 'Hypertensive Crisis (>= 180/110)' };
        analysis.alerts.push('🚨 Blood Pressure critically high');
        analysis.hasAbnormality = true;
      } else if (vitals.systolic >= 140 || vitals.diastolic >= 90) {
        analysis.bloodPressure = { status: 'WARNING', label: 'Stage 2 Hypertension' };
        analysis.alerts.push('⚠️ Elevated Blood Pressure');
        analysis.hasAbnormality = true;
      } else if (vitals.systolic < 90 || vitals.diastolic < 60) {
        analysis.bloodPressure = { status: 'WARNING', label: 'Hypotension (< 90/60)' };
        analysis.alerts.push('⚠️ Low Blood Pressure');
        analysis.hasAbnormality = true;
      }
    }

    if (vitals.spo2) {
      if (vitals.spo2 < 90) {
        analysis.spo2 = { status: 'CRITICAL', label: 'Severe Hypoxemia (< 90%)' };
        analysis.alerts.push('🚨 Severe low SpO2 (<90%)');
        analysis.hasAbnormality = true;
      } else if (vitals.spo2 < 95) {
        analysis.spo2 = { status: 'WARNING', label: 'Mild Hypoxia (90-94%)' };
        analysis.alerts.push('⚠️ Mild low oxygen level');
        analysis.hasAbnormality = true;
      }
    }

    if (vitals.pulse) {
      if (vitals.pulse > 120) {
        analysis.pulse = { status: 'WARNING', label: 'Tachycardia (> 120 bpm)' };
        analysis.alerts.push('⚠️ Rapid pulse');
        analysis.hasAbnormality = true;
      } else if (vitals.pulse < 50) {
        analysis.pulse = { status: 'WARNING', label: 'Bradycardia (< 50 bpm)' };
        analysis.alerts.push('⚠️ Slow pulse');
        analysis.hasAbnormality = true;
      }
    }

    return analysis;
  }
}
