
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

function calculateSimilarity(str1, str2) {
  const s1 = (str1 || '').trim().toLowerCase();
  const s2 = (str2 || '').trim().toLowerCase();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshtein(s1, s2);
  return Math.max(0, 1 - distance / maxLen);
}

export class OcrEngine {
  static getDatabases() {
    const drugs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'drug_database.json'), 'utf8'));
    const ayush = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ayush_formulary.json'), 'utf8'));
    return { drugs, ayush };
  }

  /**
   * Parses raw extracted OCR text and matches against CDSCO drug list and Ayurvedic formulary
   */
  static processPrescriptionText(rawText = '', fileName = 'uploaded_prescription.jpg') {
    const { drugs, ayush } = this.getDatabases();
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    const extractedMedications = [];
    const extractedVitals = {};
    const clinicalNotes = [];

    // Common patterns
    const bpMatch = rawText.match(/BP[:\s]+([0-9]{2,3})\/([0-9]{2,3})/i);
    if (bpMatch) {
      extractedVitals.systolic = parseInt(bpMatch[1], 10);
      extractedVitals.diastolic = parseInt(bpMatch[2], 10);
    }
    const pulseMatch = rawText.match(/(?:Pulse|HR|PR)[:\s]+([0-9]{2,3})/i);
    if (pulseMatch) extractedVitals.pulse = parseInt(pulseMatch[1], 10);

    const fbsMatch = rawText.match(/(?:FBS|Sugar|Glucose)[:\s]+([0-9]{2,3})/i);
    if (fbsMatch) extractedVitals.bloodGlucose = parseInt(fbsMatch[1], 10);

    // Match candidate medicine tokens against databases
    const allKnown = [
      ...drugs.map(d => ({ ...d, dbType: 'Allopathic (CDSCO)' })),
      ...ayush.map(a => ({ ...a, dbType: 'Ayurvedic (AYUSH Formulary)' }))
    ];

    lines.forEach(line => {
      // Look for medicine tokens in line
      allKnown.forEach(known => {
        const words = line.split(/[\s,;\-]+/);
        let bestMatchScore = 0;
        let matchedWord = '';

        words.forEach(w => {
          if (w.length < 3) return;
          const score = calculateSimilarity(w, known.name.split(' ')[0]);
          if (score > bestMatchScore) {
            bestMatchScore = score;
            matchedWord = w;
          }
        });

        // Also test full name similarity
        const lineScore = calculateSimilarity(line.substring(0, 30), known.name);
        const finalScore = Math.max(bestMatchScore, lineScore);

        if (finalScore >= 0.65) {
          // Extract dosage or frequency from line
          const doseMatch = line.match(/([0-9]+(?:\.[0-9]+)?\s*(?:mg|mcg|g|ml|tablet|tab|cap|puffs|चूर्ण|वटी))/i);
          const freqMatch = line.match(/(?:OD|BD|TDS|QID|1-0-1|1-1-1|1-0-0|0-0-1|सुबह-शाम|दिन में दो बार)/i);

          const alreadyAdded = extractedMedications.some(m => m.matchedStandardName === known.name);
          if (!alreadyAdded) {
            extractedMedications.push({
              rawExtractedText: line,
              matchedStandardName: known.name,
              dbType: known.dbType,
              category: known.category || known.indication,
              confidence: parseFloat((finalScore * 0.95).toFixed(2)),
              dosage: doseMatch ? doseMatch[0] : (known.commonDoses ? known.commonDoses[0] : 'Standard dose'),
              frequency: freqMatch ? freqMatch[0] : 'As advised (1-0-1)',
              verificationStatus: finalScore >= 0.85 ? 'HIGH_CONFIDENCE' : 'UNCERTAIN_NEEDS_DOCTOR_REVIEW'
            });
          }
        }
      });
    });

    return {
      fileName,
      processedAt: new Date().toISOString(),
      rawLineCount: lines.length,
      extractedMedications,
      extractedVitals,
      clinicalNotes,
      status: extractedMedications.length > 0 ? 'SUCCESS_EXTRACTED' : 'PARTIAL_EXTRACTION'
    };
  }
}
