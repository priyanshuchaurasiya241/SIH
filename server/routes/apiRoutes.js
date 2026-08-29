
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { SecureStorage } from '../crypto/storage.js';
import { RedFlagEngine } from '../engine/redFlagEngine.js';
import { DialogueManager } from '../engine/dialogueManager.js';
import { PrakritiEngine } from '../engine/prakritiEngine.js';
import { RagEngine } from '../engine/ragEngine.js';
import { OcrEngine } from '../engine/ocrEngine.js';
import { VitalsEngine } from '../engine/vitalsEngine.js';
import { AbdmFhirEngine } from '../engine/abdmFhirEngine.js';
import { BhashiniEngine } from '../engine/bhashiniEngine.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INTAKES_FILE = path.join(__dirname, '..', 'data', 'intakes.enc.json');

function getAllIntakes() {
  const intakes = SecureStorage.readEncryptedFile(INTAKES_FILE, []);
  return Array.isArray(intakes) ? intakes : [];
}

function saveIntakes(intakes) {
  return SecureStorage.writeEncryptedFile(INTAKES_FILE, intakes);
}

// 1. Auth & Session
router.post('/auth/login', (req, res) => {
  const { role = 'patient', name = 'Anonymous Patient', phone = '9876543210' } = req.body;
  const sessionUser = {
    id: 'USR-' + Date.now(),
    name,
    phone,
    role: role.toLowerCase(),
    loginAt: new Date().toISOString()
  };

  SecureStorage.logAudit({
    actor: `${sessionUser.role.toUpperCase()}: ${sessionUser.name}`,
    action: 'USER_LOGIN',
    resource: '/api/auth/login',
    details: { phone, role: sessionUser.role }
  });

  res.json({ success: true, user: sessionUser });
});

// 2. Start Pre-Consultation Intake
router.post('/intake/start', (req, res) => {
  const {
    name = 'Rameshwar Lal (रामेश्वर लाल)',
    age = 54,
    gender = 'Male',
    phone = '9811234567',
    preferredLanguage = 'hi',
    location = { city: 'New Delhi', district: 'South Delhi', type: 'Urban' },
    weather = { condition: 'rain', isRaining: true, temp: 28, humidity: 88, aqi: 185 }
  } = req.body;

  const abha = AbdmFhirEngine.generateAbha({ name, phone, gender, yob: new Date().getFullYear() - age });
  
  const newIntake = {
    id: 'INTK-' + Date.now(),
    status: 'IN_PROGRESS',
    createdAt: new Date().toISOString(),
    patient: {
      id: 'PAT-' + Date.now(),
      name,
      age,
      gender,
      phone,
      abhaNumber: abha.abhaNumber,
      abhaAddress: abha.abhaAddress,
      consent: abha.consentArtifact
    },
    language: preferredLanguage,
    location,
    weather,
    chiefComplaint: '',
    selectedSymptoms: [],
    currentStage: 'STAGE_1_CHIEF_COMPLAINT',
    completedStages: [],
    structuredHistory: {},
    conversationTurns: [],
    redFlagStatus: { isRedFlag: false, severity: 'ROUTINE' },
    vitals: { systolic: 120, diastolic: 80, pulse: 74, spo2: 98, temp: 98.4 },
    prakriti: null,
    ocrDocuments: [],
    evidenceLinks: [],
    doctorAnalysisBriefing: null,
    doctorReview: null
  };

  // Generate initial greeting
  const initialQuestion = DialogueManager.getQuestionForStage('STAGE_1_CHIEF_COMPLAINT', newIntake, preferredLanguage);
  newIntake.doctorAnalysisBriefing = DialogueManager.generateDoctorBriefing(newIntake);

  const all = getAllIntakes();
  all.unshift(newIntake);
  saveIntakes(all);

  SecureStorage.logAudit({
    actor: `PATIENT: ${name}`,
    action: 'INITIATE_CASE_TAKING',
    resource: `/api/intake/${newIntake.id}`,
    details: { abhaNumber: abha.abhaNumber, consentId: abha.consentArtifact.consentId }
  });

  res.json({
    success: true,
    intakeId: newIntake.id,
    intake: newIntake,
    initialQuestion,
    initialMessage: initialQuestion.question,
    bhashiniConfig: BhashiniEngine.getPipelineConfig(preferredLanguage)
  });
});

// 3. Conversational Response & Step-by-Step Adaptive Questioning
router.post('/intake/respond', (req, res) => {
  const { intakeId, userSpeechText, selectedSymptomId, uploadedDocText, uploadedFileName } = req.body;
  const all = getAllIntakes();
  const index = all.findIndex(i => i.id === intakeId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Intake session not found' });
  }

  const intake = all[index];
  const lang = intake.language || 'hi';

  // Process Document Upload if attached
  let processedDoc = null;
  if (uploadedDocText) {
    processedDoc = OcrEngine.processPrescriptionText(uploadedDocText, uploadedFileName || 'Prescription_Upload.jpg');
  }

  // Record user conversational turn
  if (userSpeechText) {
    intake.conversationTurns.push({
      turnId: intake.conversationTurns.length + 1,
      sender: 'PATIENT',
      text: userSpeechText,
      stage: intake.currentStage,
      timestamp: new Date().toISOString(),
      source: 'patient_voice_or_touch'
    });
  }

  // Run Sequential Dialogue State Machine
  const turnResult = DialogueManager.processTurn({
    intake,
    userText: userSpeechText,
    selectedSymptomId,
    uploadedDoc: processedDoc,
    language: lang
  });

  // Evaluate Deterministic Red Flags
  const redFlagCheck = RedFlagEngine.evaluate(
    intake.selectedSymptoms,
    { chiefComplaint: intake.chiefComplaint, description: userSpeechText || '' },
    intake.vitals
  );

  intake.redFlagStatus = redFlagCheck;
  if (redFlagCheck.isRedFlag && redFlagCheck.severity === 'CRITICAL') {
    intake.status = 'RED_FLAG_ALERT';
  } else if (turnResult.isCompleted) {
    intake.status = 'COMPLETED';
  }

  // Update RAG Grounding Evidence
  const grounding = RagEngine.groundClinicalIntake({
    chiefComplaint: intake.chiefComplaint || 'Clinical Consultation',
    socratesAnswers: intake.conversationTurns,
    vitals: intake.vitals,
    prakriti: intake.prakriti,
    ocrDocs: intake.ocrDocuments
  });
  intake.evidenceLinks = grounding.evidenceLinks;

  all[index] = intake;
  saveIntakes(all);

  res.json({
    success: true,
    intake,
    turnResult,
    redFlagCheck,
    replyText: turnResult.replyText,
    nextQuestion: turnResult.nextQuestion,
    isCompleted: turnResult.isCompleted,
    doctorAnalysisBriefing: intake.doctorAnalysisBriefing
  });
});

// 4. Bhashini Multilingual Endpoints
router.get('/bhashini/languages', (req, res) => {
  res.json({
    success: true,
    languages: BhashiniEngine.SUPPORTED_LANGUAGES,
    pipeline: 'NLTM Bhashini Central Inference Pipeline'
  });
});

router.post('/bhashini/translate', async (req, res) => {
  const { text, targetLang = 'hi', sourceLang = 'en' } = req.body;
  const translated = await BhashiniEngine.translate(text, targetLang, sourceLang);
  res.json({ success: true, original: text, translated, targetLang });
});

// 5. Prakriti Assessment (Ayurvedic Engine)
router.get('/ayush/questions', (req, res) => {
  const questions = PrakritiEngine.getQuestions();
  res.json({ success: true, questions });
});

router.post('/ayush/prakriti', (req, res) => {
  const { intakeId, responses = [] } = req.body;
  const evaluation = PrakritiEngine.calculatePrakriti(responses);

  if (intakeId) {
    const all = getAllIntakes();
    const idx = all.findIndex(i => i.id === intakeId);
    if (idx !== -1) {
      all[idx].prakriti = evaluation;
      all[idx].doctorAnalysisBriefing = DialogueManager.generateDoctorBriefing(all[idx]);
      saveIntakes(all);

      SecureStorage.logAudit({
        actor: `PATIENT: ${all[idx].patient.name}`,
        action: 'PRAKRITI_ASSESSMENT_COMPLETED',
        resource: `/api/intake/${intakeId}`,
        details: { constitution: evaluation.constitutionType }
      });
    }
  }

  res.json({ success: true, evaluation });
});

// 6. Vitals Ingestion (BLE / Hardware Simulator)
router.post('/vitals/ingest', (req, res) => {
  const { intakeId, systolic, diastolic, pulse, spo2, temp, bloodGlucose, source = 'BLE_DEVICE' } = req.body;
  
  const rawVitals = {
    systolic: Number(systolic) || 120,
    diastolic: Number(diastolic) || 80,
    pulse: Number(pulse) || 72,
    spo2: Number(spo2) || 98,
    temp: Number(temp) || 98.4,
    bloodGlucose: bloodGlucose ? Number(bloodGlucose) : null,
    source,
    measuredAt: new Date().toISOString()
  };

  const analysis = VitalsEngine.evaluateVitals(rawVitals);

  if (intakeId) {
    const all = getAllIntakes();
    const idx = all.findIndex(i => i.id === intakeId);
    if (idx !== -1) {
      all[idx].vitals = rawVitals;
      all[idx].vitalsAnalysis = analysis;

      const rf = RedFlagEngine.evaluate(all[idx].selectedSymptoms, { chiefComplaint: all[idx].chiefComplaint }, rawVitals);
      all[idx].redFlagStatus = rf;
      if (rf.isRedFlag && rf.severity === 'CRITICAL') {
        all[idx].status = 'RED_FLAG_ALERT';
      }

      all[idx].doctorAnalysisBriefing = DialogueManager.generateDoctorBriefing(all[idx]);
      saveIntakes(all);
    }
  }

  res.json({ success: true, vitals: rawVitals, analysis });
});

// 7. Medical Document & Prescription OCR Scanner (Direct Ingest)
router.post('/ocr/upload', (req, res) => {
  const { intakeId, fileName = 'Prescription_Scan_01.jpg', rawText } = req.body;

  const sampleText = rawText || `
ALL INDIA INSTITUTE OF AYURVEDA (AIIA), NEW DELHI
OPD PRESCRIPTION
Date: 12/05/2025  BP: 148/92 mmHg  Pulse: 84
Rx:
1. Tab. Amoxyclav 625mg  1-0-1 (BD) x 5 days
2. Tab. Paracetamol 650mg SOS for fever
3. Sudarshan Vati  2 tab BD with warm water
4. Sitopaladi Churna 3g with honey TDS
Adv: Avoid cold foods, rest for 3 days.
  `.trim();

  const ocrResult = OcrEngine.processPrescriptionText(sampleText, fileName);

  if (intakeId) {
    const all = getAllIntakes();
    const idx = all.findIndex(i => i.id === intakeId);
    if (idx !== -1) {
      all[idx].ocrDocuments = all[idx].ocrDocuments || [];
      all[idx].ocrDocuments.push(ocrResult);
      if (ocrResult.extractedVitals.systolic) {
        all[idx].vitals = { ...all[idx].vitals, ...ocrResult.extractedVitals };
      }
      all[idx].doctorAnalysisBriefing = DialogueManager.generateDoctorBriefing(all[idx]);
      saveIntakes(all);

      SecureStorage.logAudit({
        actor: `SYSTEM_OCR: ${fileName}`,
        action: 'PRESCRIPTION_EXTRACTED',
        resource: `/api/intake/${intakeId}`,
        details: { extractedMedsCount: ocrResult.extractedMedications.length }
      });
    }
  }

  res.json({ success: true, ocrResult });
});

// 8. Doctor Queue & Review Dashboard
router.get('/doctor/queue', (req, res) => {
  const all = getAllIntakes();
  const summaryQueue = all.map(item => ({
    id: item.id,
    patientName: item.patient.name,
    age: item.patient.age,
    gender: item.patient.gender,
    abhaNumber: item.patient.abhaNumber,
    chiefComplaint: item.chiefComplaint,
    createdAt: item.createdAt,
    status: item.status,
    redFlag: item.redFlagStatus,
    vitals: item.vitals,
    prakriti: item.prakriti?.constitutionType,
    hasOcr: (item.ocrDocuments || []).length > 0,
    doctorAnalysisBriefing: item.doctorAnalysisBriefing
  }));

  res.json({ success: true, queue: summaryQueue, total: summaryQueue.length });
});

router.get('/doctor/intake/:id', (req, res) => {
  const all = getAllIntakes();
  const intake = all.find(i => i.id === req.params.id);
  if (!intake) return res.status(404).json({ success: false, message: 'Intake not found' });
  
  if (!intake.doctorAnalysisBriefing) {
    intake.doctorAnalysisBriefing = DialogueManager.generateDoctorBriefing(intake);
  }

  res.json({ success: true, intake });
});

// 9. Physician-In-The-Loop: Accept / Edit / Reject Field
router.post('/doctor/review/:id', (req, res) => {
  const { fieldId, action, editedValue, doctorName = 'Dr. S. K. Sharma (MD Ayush, AIIA)' } = req.body;
  const all = getAllIntakes();
  const idx = all.findIndex(i => i.id === req.params.id);

  if (idx === -1) return res.status(404).json({ success: false, message: 'Intake not found' });

  all[idx].doctorReview = all[idx].doctorReview || { reviewedFields: {}, signedOff: false };
  all[idx].doctorReview.reviewedFields[fieldId] = {
    action,
    value: editedValue,
    reviewedBy: doctorName,
    reviewedAt: new Date().toISOString()
  };

  saveIntakes(all);

  SecureStorage.logAudit({
    actor: `DOCTOR: ${doctorName}`,
    action: `FIELD_${action}`,
    resource: `/api/doctor/review/${req.params.id}`,
    details: { fieldId, action, editedValue }
  });

  res.json({ success: true, intake: all[idx] });
});

// 10. Doctor Sign-Off & ABDM FHIR R4 Bundle Export
router.post('/doctor/signoff/:id', (req, res) => {
  const { doctorName = 'Dr. S. K. Sharma (MD Ayush, AIIA)', clinicalNotes = 'Patient case validated. Proceed with diagnostic workup.', prescriptionMedicines = [] } = req.body;
  const all = getAllIntakes();
  const idx = all.findIndex(i => i.id === req.params.id);

  if (idx === -1) return res.status(404).json({ success: false, message: 'Intake not found' });

  const intake = all[idx];
  intake.status = 'DOCTOR_VERIFIED';
  intake.doctorSignoff = {
    doctorName,
    clinicalNotes,
    prescribedMedicines: prescriptionMedicines,
    signedAt: new Date().toISOString(),
    status: 'OFFICIALLY_SIGNED'
  };

  const fhirBundle = AbdmFhirEngine.buildFhirR4Bundle({
    patient: intake.patient,
    intake,
    vitals: intake.vitals,
    prakriti: intake.prakriti,
    doctorSignoff: intake.doctorSignoff
  });

  intake.fhirBundle = fhirBundle;
  saveIntakes(all);

  SecureStorage.logAudit({
    actor: `DOCTOR: ${doctorName}`,
    action: 'CLINICAL_SIGNOFF_AND_FHIR_EXPORT',
    resource: `/api/intake/${intake.id}`,
    details: { fhirBundleId: fhirBundle.id, abha: intake.patient.abhaNumber }
  });

  res.json({ success: true, intake, fhirBundle });
});

// 11. Security & Encryption Inspector
router.get('/security/inspect', (req, res) => {
  const rawDiskData = SecureStorage.inspectRawFile(INTAKES_FILE);
  const decryptedData = getAllIntakes();
  res.json({
    success: true,
    algorithm: 'AES-256-GCM',
    keyLength: '256 bits',
    compliance: 'Digital Information Security in Healthcare & DPDP Act 2023',
    onDiskEncryptedFile: rawDiskData,
    decryptedAuthorizedRecordCount: decryptedData.length,
    timestamp: new Date().toISOString()
  });
});

// 12. Tamper-Evident Audit Logs
router.get('/audit/logs', (req, res) => {
  const logs = SecureStorage.getAuditLogs();
  res.json({ success: true, logs, total: logs.length });
});

export default router;
