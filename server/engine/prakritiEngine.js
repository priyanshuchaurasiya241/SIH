
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PrakritiEngine {
  static getQuestions() {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'prakriti_questions.json'), 'utf8');
    return JSON.parse(raw);
  }

  /**
   * Evaluates Prakriti questionnaire answers and computes Dosha % + Constitution
   * @param {Array} responses - [{ questionId, selectedDosha, score }]
   */
  static calculatePrakriti(responses = []) {
    let vataScore = 0;
    let pittaScore = 0;
    let kaphaScore = 0;

    responses.forEach(r => {
      const dosha = (r.selectedDosha || r.dosha || '').toLowerCase();
      const score = Number(r.score) || 3;
      if (dosha === 'vata') vataScore += score;
      else if (dosha === 'pitta') pittaScore += score;
      else if (dosha === 'kapha') kaphaScore += score;
    });

    const totalScore = Math.max(vataScore + pittaScore + kaphaScore, 1);
    const vataPercent = Math.round((vataScore / totalScore) * 100);
    const pittaPercent = Math.round((pittaScore / totalScore) * 100);
    const kaphaPercent = Math.round((kaphaScore / totalScore) * 100);

    // Sort to determine dominant doshas
    const doshaMap = [
      { name: 'Vata', percent: vataPercent, score: vataScore },
      { name: 'Pitta', percent: pittaPercent, score: pittaScore },
      { name: 'Kapha', percent: kaphaPercent, score: kaphaScore }
    ].sort((a, b) => b.percent - a.percent);

    let constitutionType = '';
    let category = '';
    let description = '';

    const diffTopTwo = doshaMap[0].percent - doshaMap[1].percent;
    const diffTopThree = doshaMap[0].percent - doshaMap[2].percent;

    if (diffTopThree <= 10) {
      constitutionType = 'Sama Prakriti / Tridoshaja (वात-पित्त-कफ सम)';
      category = 'TRIDOSHAJA';
      description = 'Balanced constitution with harmonious distribution of all three biological humors. Excellent baseline resistance (Vyadhikshamatva).';
    } else if (diffTopTwo <= 12) {
      constitutionType = `${doshaMap[0].name}-${doshaMap[1].name}aja (${doshaMap[0].name.toLowerCase()}-${doshaMap[1].name.toLowerCase()} द्विदोषज)`;
      category = 'DVIDOSHAJA';
      description = `Dual-dosha dominant constitution where ${doshaMap[0].name} and ${doshaMap[1].name} properties co-exist.`;
    } else {
      constitutionType = `${doshaMap[0].name}aja Pradhana (${doshaMap[0].name} प्रधान एकदोषज)`;
      category = 'EKADOSHAJA';
      description = `Strong predominance of ${doshaMap[0].name} dosha in bodily and mental constitution.`;
    }

    // Lifestyle & Diet Guidance (Ahara-Vihara)
    const recommendations = this.getRecommendations(doshaMap[0].name, doshaMap[1].name);

    return {
      scores: {
        vata: vataScore,
        pitta: pittaScore,
        kapha: kaphaScore
      },
      percentages: {
        vata: vataPercent,
        pitta: pittaPercent,
        kapha: kaphaPercent
      },
      dominantDosha: doshaMap[0].name,
      secondaryDosha: doshaMap[1].name,
      constitutionType,
      category,
      description,
      recommendations,
      algorithm: 'CCRAS 30-Parameter Ayurvedic Standard Classification Matrix'
    };
  }

  static getRecommendations(primary, secondary) {
    const ahara = [];
    const vihara = [];
    const herbs = [];

    if (primary === 'Vata' || secondary === 'Vata') {
      ahara.push('Warm, unctuous (Snigdha), easily digestible foods, ghee, sweet, sour and salty tastes (Madhura, Amla, Lavana). Avoid cold, dry foods.');
      vihara.push('Regular daily routine, Abhyanga (warm sesame oil massage), adequate restful sleep, gentle yoga and Pranayama.');
      herbs.push('Ashwagandha, Dashamoola, Bala, Shatavari.');
    }
    if (primary === 'Pitta' || secondary === 'Pitta') {
      ahara.push('Cooling foods, sweet, bitter and astringent tastes (Madhura, Tikta, Kashaya). Avoid excessively spicy, sour, salty, and deep-fried foods.');
      vihara.push('Avoid direct midday sun, keep a cool environment, Shitala Pranayama, meditation, moderate exercise.');
      herbs.push('Amalaki, Brahmi, Guduchi, Chandana, Shatavari.');
    }
    if (primary === 'Kapha' || secondary === 'Kapha') {
      ahara.push('Light, warm, dry foods, pungent, bitter and astringent tastes (Katu, Tikta, Kashaya), ginger, honey. Avoid excess dairy, sweets, and oily food.');
      vihara.push('Active physical exercise, vigorous movement, early morning rising (avoid daytime sleep / Diva-svapna), dry powder massage (Udvartana).');
      herbs.push('Trikatu, Guggulu, Tulsi, Punarnava, Triphala.');
    }

    return {
      diet: ahara,
      lifestyle: vihara,
      supportiveHerbs: herbs
    };
  }
}
