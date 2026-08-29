
export class VoiceService {
  static isSpeechSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  static createRecognition(lang = 'hi-IN', onResult, onEnd, onError) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({ finalTranscript, interimTranscript });
      }
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition event:', e.error);
      if (onError) onError(e.error);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    return recognition;
  }

  static speak(text, lang = 'hi-IN') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // cancel prior speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95; // comfortable pace for patients
    utterance.pitch = 1.0;

    // Try to find an Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes(lang.slice(0, 2)));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  }

  static stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
