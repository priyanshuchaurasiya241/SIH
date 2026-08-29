
import { BhashiniEngine } from './bhashiniEngine.js';

export class DialogueManager {
  // Ordered clinical intake stages
  static STAGES = [
    'STAGE_1_CHIEF_COMPLAINT',
    'STAGE_2_ONSET_DURATION',
    'STAGE_3_CHARACTER_SEVERITY',
    'STAGE_4_RADIATION_ASSOCIATED',
    'STAGE_5_GIS_WEATHER',
    'STAGE_6_DOCUMENTS_MEDS',
    'STAGE_7_COMPLETE'
  ];

  /**
   * Evaluates patient message, extracts clinical facts, advances state machine, and returns NEXT question
   */
  static processTurn({ intake, userText = '', selectedSymptomId = null, uploadedDoc = null, language = 'hi' }) {
    intake.structuredHistory = intake.structuredHistory || {};
    intake.completedStages = intake.completedStages || [];
    intake.selectedSymptoms = intake.selectedSymptoms || [];

    const isHi = language === 'hi';
    const langKey = language || 'hi';

    // If user uploaded a document, record it and add context
    if (uploadedDoc) {
      intake.ocrDocuments = intake.ocrDocuments || [];
      intake.ocrDocuments.push(uploadedDoc);
      intake.structuredHistory['STAGE_6_DOCUMENTS_MEDS'] = {
        hasDocuments: true,
        documentCount: intake.ocrDocuments.length,
        extractedDrugs: uploadedDoc.extractedMedications?.map(m => m.matchedStandardName) || []
      };
      if (!intake.completedStages.includes('STAGE_6_DOCUMENTS_MEDS')) {
        intake.completedStages.push('STAGE_6_DOCUMENTS_MEDS');
      }
    }

    // Process selected symptom
    if (selectedSymptomId && !intake.selectedSymptoms.includes(selectedSymptomId)) {
      intake.selectedSymptoms.push(selectedSymptomId);
      intake.chiefComplaint = selectedSymptomId.replace(/_/g, ' ').toUpperCase();
      intake.structuredHistory['STAGE_1_CHIEF_COMPLAINT'] = {
        symptom: selectedSymptomId,
        statedAt: new Date().toISOString()
      };
      if (!intake.completedStages.includes('STAGE_1_CHIEF_COMPLAINT')) {
        intake.completedStages.push('STAGE_1_CHIEF_COMPLAINT');
      }
    }

    // If patient gave text / voice response, extract structured facts for the CURRENT stage
    const currentStage = intake.currentStage || 'STAGE_1_CHIEF_COMPLAINT';
    if (userText && userText.trim()) {
      intake.structuredHistory[currentStage] = {
        rawAnswer: userText,
        answeredAt: new Date().toISOString()
      };
      if (!intake.completedStages.includes(currentStage)) {
        intake.completedStages.push(currentStage);
      }

      // If we were on stage 1 and user typed symptom text directly
      if (currentStage === 'STAGE_1_CHIEF_COMPLAINT' && !intake.chiefComplaint) {
        intake.chiefComplaint = userText.slice(0, 40);
      }
    }

    // Determine the NEXT uncompleted stage in order
    let nextStage = 'STAGE_7_COMPLETE';
    for (const stage of this.STAGES) {
      // Check if GIS stage is relevant
      if (stage === 'STAGE_5_GIS_WEATHER') {
        const isWeatherRelevant = intake.weather?.isRaining || intake.weather?.condition === 'rain' || (intake.weather?.humidity || 0) > 80 || (intake.weather?.aqi || 0) > 200;
        if (!isWeatherRelevant) {
          intake.completedStages.push('STAGE_5_GIS_WEATHER'); // skip if weather normal
          continue;
        }
      }

      if (!intake.completedStages.includes(stage)) {
        nextStage = stage;
        break;
      }
    }

    intake.currentStage = nextStage;

    // Generate the specific single question and options for the next stage
    const questionObj = this.getQuestionForStage(nextStage, intake, language);

    // Build the AI's natural conversational reply
    let replyText = '';
    if (questionObj) {
      // Add brief contextual acknowledgment
      let ack = '';
      if (userText && currentStage !== 'STAGE_1_CHIEF_COMPLAINT') {
        ack = isHi ? 'जानकारी दर्ज कर ली गई है। ' : 'Noted. ';
      }
      replyText = ack + questionObj.question;
    } else {
      replyText = isHi
        ? 'धन्यवाद! आपकी संपूर्ण प्राथमिक जानकारी, लक्षण व पुरानी पर्ची का विश्लेषण कर लिया गया है। डॉक्टर पोर्टल पर आपका केस तैयार है।'
        : 'Thank you! Your clinical intake and prescription analysis are complete. Your case summary is now ready for the doctor to review and prescribe.';
    }

    // Update overall Doctor Analysis Briefing
    intake.doctorAnalysisBriefing = this.generateDoctorBriefing(intake);

    return {
      nextStage,
      replyText,
      nextQuestion: questionObj,
      isCompleted: nextStage === 'STAGE_7_COMPLETE',
      doctorAnalysisBriefing: intake.doctorAnalysisBriefing
    };
  }

  /**
   * Generates question configuration for a specific stage
   */
  static getQuestionForStage(stage, intake, language = 'hi') {
    const isHi = language === 'hi';
    const primarySymptom = intake.selectedSymptoms?.[0] || 'general';

    switch (stage) {
      case 'STAGE_1_CHIEF_COMPLAINT':
        return {
          stage,
          question: isHi 
            ? 'नमस्ते! कृपया बताएं कि आपको मुख्य रूप से क्या समस्या है? आप नीचे दिए गए चित्रों पर स्पर्श करके या बोलकर बता सकते हैं।'
            : 'Welcome! Please describe what main symptom you are experiencing. You can tap the icons or speak.',
          type: 'symptom_picker'
        };

      case 'STAGE_2_ONSET_DURATION':
        return {
          stage,
          question: isHi
            ? `यह समस्या (${intake.chiefComplaint || 'तकलीफ'}) कब से शुरू हुई? क्या यह अचानक हुई या कुछ दिनों से है?`
            : `When did this (${intake.chiefComplaint || 'symptom'}) start? Was it sudden or gradual over a few days?`,
          type: 'choice',
          options: [
            { text: isHi ? 'अचानक आज से / कुछ घंटों से (Sudden, today)' : 'Sudden, within hours', value: 'acute_hours' },
            { text: isHi ? '2 से 3 दिनों से (2-3 days ago)' : '2-3 days ago', value: 'subacute_days' },
            { text: isHi ? '1 सप्ताह से अधिक समय से (Chronic > 1 week)' : 'More than a week', value: 'chronic' }
          ]
        };

      case 'STAGE_3_CHARACTER_SEVERITY':
        return {
          stage,
          question: isHi
            ? 'तकलीफ का स्वरूप कैसा है — तेज चुभन, भारीपन, जलन या लगातार हल्का दर्द? और दर्द की तीव्रता (1-10) कितनी है?'
            : 'What is the nature of discomfort — sharp, heavy pressure, burning, or dull ache? How severe is it (1-10)?',
          type: 'choice',
          options: [
            { text: isHi ? 'भारीपन व दबाव (Severe Heavy Pressure / 8-10)' : 'Heavy Constricting Pressure (8-10)', value: 'heavy_pressure', redFlag: true },
            { text: isHi ? 'तेज जलन या चुभन (Sharp / Burning / 5-7)' : 'Sharp / Burning (5-7)', value: 'sharp_burning' },
            { text: isHi ? 'हल्का या मध्यम दर्द (Mild to Moderate / 2-4)' : 'Mild to Moderate Ache (2-4)', value: 'mild_moderate' }
          ]
        };

      case 'STAGE_4_RADIATION_ASSOCIATED':
        return {
          stage,
          question: isHi
            ? 'क्या दर्द बाएं हाथ, जबड़े या पीठ की तरफ फैलता है? और क्या साथ में ठंडा पसीना, सांस फूलना या चक्कर हैं?'
            : 'Does the pain spread to your left arm, jaw, or back? Are you experiencing sweating, breathlessness, or dizziness?',
          type: 'choice',
          options: [
            { text: isHi ? 'हाँ, बाएं हाथ में जाता है + पसीना / सांस में भारीपन' : 'Yes, radiates to arm/jaw + cold sweat / breathlessness', value: 'radiating_sweat', redFlag: true },
            { text: isHi ? 'साथ में केवल बुखार व बदन दर्द है' : 'Associated with fever and body ache only', value: 'fever_bodyache' },
            { text: isHi ? 'नहीं, केवल उसी जगह दर्द है, अन्य कोई लक्षण नहीं' : 'No radiation or sweating, localized only', value: 'localized_only' }
          ]
        };

      case 'STAGE_5_GIS_WEATHER':
        return {
          stage,
          isGis: true,
          question: isHi
            ? '🌧️ मौसम संदर्भ: आपके इलाके में हाल ही में बारिश हुई है। क्या आप बारिश में भीगे हैं या गंदे पानी के संपर्क में आए हैं?'
            : '🌧️ Weather Alert: Rainfall recorded in your district. Were you exposed to rain or waterlogging before symptoms started?',
          type: 'choice',
          options: [
            { text: isHi ? 'हाँ, बारिश में भीगने के बाद से तकलीफ बढ़ी है' : 'Yes, symptoms worsened after rain exposure', value: 'rain_exposed' },
            { text: isHi ? 'नहीं, बारिश से कोई संबंध नहीं है' : 'No relation to weather exposure', value: 'no_rain_exposure' }
          ]
        };

      case 'STAGE_6_DOCUMENTS_MEDS':
        return {
          stage,
          question: isHi
            ? 'क्या आपके पास कोई पुरानी डॉक्टर की पर्ची या रिपोर्ट है? कृपया नीचे दिए गए "पर्चा अपलोड करें" बटन से फोटो खींचकर अपलोड करें।'
            : 'Do you have any past doctor prescription or report? Please upload the document photo below for instant AI verification.',
          type: 'document_upload'
        };

      default:
        return null;
    }
  }

  /**
   * Generates Comprehensive Pre-Consultation Clinical Analysis Briefing for the Doctor
   */
  static generateDoctorBriefing(intake) {
    const chief = intake.chiefComplaint || 'General Clinical Consultation';
    const symptoms = intake.selectedSymptoms || [];
    const history = intake.structuredHistory || {};
    const ocrDocs = intake.ocrDocuments || [];
    const vitals = intake.vitals || {};
    const prakriti = intake.prakriti || {};
    const rf = intake.redFlagStatus || {};

    const extractedMedNames = [];
    ocrDocs.forEach(d => {
      (d.extractedMedications || []).forEach(m => {
        extractedMedNames.push(`${m.matchedStandardName} (${m.dosage || 'Std dose'}, ${m.frequency || 'N/A'})`);
      });
    });

    const onset = history['STAGE_2_ONSET_DURATION']?.rawAnswer || 'Reported during intake';
    const character = history['STAGE_3_CHARACTER_SEVERITY']?.rawAnswer || 'Under evaluation';
    const associated = history['STAGE_4_RADIATION_ASSOCIATED']?.rawAnswer || 'None reported';
    const weatherFactor = history['STAGE_5_GIS_WEATHER']?.rawAnswer || 'No adverse exposure';

    // Differential Considerations & Physician Focus
    const differentialPoints = [];
    if (rf.isRedFlag && rf.category === 'CARDIAC_EMERGENCY') {
      differentialPoints.push('🚨 Urgent: Acute Coronary Syndrome (ACS / Angina / MI) — Immediate 12-lead ECG & cardiac biomarkers recommended.');
      differentialPoints.push('Differential: Gastroesophageal Reflux Disease (GERD / Amlapitta), Costochondritis, Cervical Radiculopathy.');
    } else if (symptoms.includes('fever') || symptoms.includes('cough')) {
      differentialPoints.push('Acute Upper/Lower Respiratory Tract Infection (Vata-Kaphaja Jwara / Kasa).');
      differentialPoints.push('Rule out Dengue / Viral Bronchitis given seasonal rainfall context.');
    } else {
      differentialPoints.push('Symptomatic clinical evaluation indicated.');
    }

    return {
      generatedAt: new Date().toISOString(),
      patientName: intake.patient?.name,
      abhaNumber: intake.patient?.abhaNumber,
      summaryText: `Patient presents with ${chief}. Onset: ${onset}. Quality: ${character}. Associated symptoms: ${associated}. Environmental context: ${weatherFactor}.`,
      vitalsReview: `BP: ${vitals.systolic || 120}/${vitals.diastolic || 80} mmHg, Pulse: ${vitals.pulse || 72} bpm, SpO2: ${vitals.spo2 || 98}%, Temp: ${vitals.temp || 98.4}°F`,
      ayushAssessment: prakriti.constitutionType ? `Prakriti: ${prakriti.constitutionType} (V: ${prakriti.percentages?.vata}%, P: ${prakriti.percentages?.pitta}%, K: ${prakriti.percentages?.kapha}%)` : 'Prakriti assessment pending',
      activeMedicationsFromOcr: extractedMedNames.length > 0 ? extractedMedNames : ['No active prescription uploaded'],
      redFlagTriage: {
        isEmergency: rf.isRedFlag || false,
        severity: rf.severity || 'ROUTINE',
        priorityAlert: rf.priorityAlert || 'Routine OPD Case'
      },
      differentialPoints,
      recommendedPrescriptionAreas: [
        'Confirm chief complaint duration and radiation',
        'Verify past medication tolerance (especially anti-platelets / antibiotics if present in OCR)',
        'Recommend appropriate Ayurvedic Shamana Chikitsa / modern pharmacological intervention'
      ]
    };
  }
}
