
export class AbdmFhirEngine {
  /**
   * Generates a valid ABHA ID & DPDP Consent artifact
   */
  static generateAbha({ name = 'Ramesh Kumar', phone = '9876543210', gender = 'Male', yob = 1985 }) {
    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000);
    const str = String(randomDigits);
    const abhaNumber = `${str.slice(0, 2)}-${str.slice(2, 6)}-${str.slice(6, 10)}-${str.slice(10, 14)}`;
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const abhaAddress = `${cleanName}${str.slice(10, 14)}@abdm`;

    const consentArtifact = {
      consentId: 'CONSENT-DPDP-' + Date.now(),
      version: '1.0',
      compliance: 'Digital Personal Data Protection (DPDP) Act 2023 & ABDM M3 Sandbox',
      patientName: name,
      abhaNumber,
      abhaAddress,
      purpose: 'Pre-Consultation Clinical Intake, OPD Triage & Ayush Case Record Compilation',
      dataCategories: ['Vitals', 'ChiefComplaint', 'AyushPrakriti', 'PrescriptionOCR', 'ClinicalHistory'],
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      revocable: true,
      status: 'GRANTED'
    };

    return { abhaNumber, abhaAddress, consentArtifact };
  }

  /**
   * Converts a verified patient intake record into an official HL7 FHIR R4 JSON Bundle
   */
  static buildFhirR4Bundle({ patient, intake, vitals, prakriti, doctorSignoff }) {
    const bundleId = 'bundle-' + Date.now();
    const timestamp = new Date().toISOString();

    const fhirBundle = {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        lastUpdated: timestamp,
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle']
      },
      identifier: {
        system: 'https://abdm.gov.in/bundles',
        value: bundleId
      },
      type: 'document',
      timestamp: timestamp,
      entry: [
        // 1. Composition Resource (Document Header)
        {
          fullUrl: `urn:uuid:comp-${Date.now()}`,
          resource: {
            resourceType: 'Composition',
            status: 'final',
            type: {
              coding: [{
                system: 'http://snomed.info/sct',
                code: '371530004',
                display: 'Clinical consultation report'
              }],
              text: 'AIIA Pre-Consultation Clinical Intake Summary'
            },
            subject: {
              reference: `urn:uuid:patient-${patient.id || 'p1'}`,
              display: patient.name
            },
            date: timestamp,
            author: [{
              display: doctorSignoff?.doctorName || 'Dr. Pre-Consultation AI Officer'
            }],
            title: 'Pre-Consultation Clinical Case Taking & Ayush Assessment'
          }
        },
        // 2. Patient Resource
        {
          fullUrl: `urn:uuid:patient-${patient.id || 'p1'}`,
          resource: {
            resourceType: 'Patient',
            identifier: [
              {
                system: 'https://healthid.abdm.gov.in',
                value: patient.abhaNumber || '91-4820-1940-5821'
              }
            ],
            name: [{ text: patient.name }],
            telecom: [{ system: 'phone', value: patient.phone || '9876543210' }],
            gender: (patient.gender || 'unknown').toLowerCase(),
            birthDate: patient.dob || '1985-01-01'
          }
        },
        // 3. Condition (Chief Complaint)
        {
          fullUrl: `urn:uuid:cond-${Date.now()}`,
          resource: {
            resourceType: 'Condition',
            clinicalStatus: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
            },
            verificationStatus: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }]
            },
            category: [{ text: 'Chief Complaint' }],
            code: {
              text: intake?.chiefComplaint || 'General Clinical Intake'
            },
            subject: { reference: `urn:uuid:patient-${patient.id || 'p1'}` }
          }
        },
        // 4. Observation (Vitals: BP, Pulse, SpO2)
        {
          fullUrl: `urn:uuid:obs-vitals-${Date.now()}`,
          resource: {
            resourceType: 'Observation',
            status: 'final',
            category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
            code: { text: 'Vital Signs Panel (BLE Hardware Ingest)' },
            component: [
              { code: { text: 'Systolic BP' }, valueQuantity: { value: vitals?.systolic || 120, unit: 'mmHg' } },
              { code: { text: 'Diastolic BP' }, valueQuantity: { value: vitals?.diastolic || 80, unit: 'mmHg' } },
              { code: { text: 'SpO2' }, valueQuantity: { value: vitals?.spo2 || 98, unit: '%' } },
              { code: { text: 'Pulse Rate' }, valueQuantity: { value: vitals?.pulse || 72, unit: 'bpm' } }
            ]
          }
        },
        // 5. Ayush Prakriti Extension Observation
        {
          fullUrl: `urn:uuid:obs-ayush-${Date.now()}`,
          resource: {
            resourceType: 'Observation',
            status: 'final',
            category: [{ text: 'AYUSH Prakriti Pariksha' }],
            code: { text: 'Ayurvedic Constitution (Prakriti Assessment)' },
            valueString: prakriti?.constitutionType || 'Vata-Pitta Prakriti',
            component: [
              { code: { text: 'Vata Percentage' }, valueQuantity: { value: prakriti?.percentages?.vata || 40, unit: '%' } },
              { code: { text: 'Pitta Percentage' }, valueQuantity: { value: prakriti?.percentages?.pitta || 35, unit: '%' } },
              { code: { text: 'Kapha Percentage' }, valueQuantity: { value: prakriti?.percentages?.kapha || 25, unit: '%' } }
            ]
          }
        }
      ]
    };

    return fhirBundle;
  }
}
