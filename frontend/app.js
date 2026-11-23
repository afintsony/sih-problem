/**
 * CogniNER - AI-Powered Cognitive Companion for Dementia Care (NER Context)
 * Smart India Hackathon 2026 - Problem Statement #26003
 * Offline-first, Multilingual, Voice-Assisted Cognitive Games & Caregiver Dashboard
 */

// --- Global State ---
const state = {
  currentView: 'patient',
  currentLang: 'en',
  currentDifficulty: 'Medium',
  autoAdapt: true,
  isOnline: navigator.onLine,
  patientData: null,
  routines: [],
  memories: [],
  offlineQueue: JSON.parse(localStorage.getItem('cogniner_offline_queue') || '[]'),
  activeGame: null,
  activeGameTimer: null,
  activeGameStartTime: 0,
  chartInstance: null
};

// --- Multilingual Dictionary (English, Assamese, Bengali, Hindi) ---
const I18N = {
  en: {
    tagline: "AI Cognitive Companion for North East Region Elders",
    patientWelcome: "Namaste, Bhaben Dadu!",
    patientWelcomeSub: "Let's do today's fun brain activities from Assam and North East.",
    aiLevel: "AI Dynamic Tier:",
    listen: "Listen",
    voiceHelp: "Voice Help",
    nextRoutine: "Next Daily Routine:",
    routineDone: "I Took It",
    gamesTitle: "Daily Cognitive Exercises",
    gamesSub: "Choose any activity below. Take your time, there is no hurry!",
    tagGame1: "NER Cultural Recall",
    titleGame1: "Assam Heritage Match",
    descGame1: "Find matching pairs of familiar icons: Kaziranga Rhino, Bihu Dhol, Tea Leaves & Jaapi.",
    playNow: "Play Now ➔",
    tagGame2: "Routine & Orientation",
    titleGame2: "Daily Routine Timeline",
    descGame2: "Arrange morning tea, medicine, garden walk, and dinner in the right order.",
    tagGame3: "\"Memory of Me\"",
    titleGame3: "Family & Hometown Recall",
    descGame3: "Recall dear family members (Ananya, Pranab) and beloved spots like Majuli & Guwahati.",
    tagGame4: "Speed of Processing",
    titleGame4: "Bihu Dhol Tap Challenge",
    descGame4: "Tap the musical instrument when it lights up. Keeps your reflexes sharp and active.",
    moves: "Moves:",
    timer: "Timer:",
    instructionsRead: "Read Instructions Aloud",
    finishReturn: "Finish & Return",
    celebrateTitle: "Shabash, Dadu! Outstanding Work!",
    celebrateSub: "You completed this session with great focus and memory accuracy.",
    continueHome: "Continue to Home",
    voiceListening: "Listening... speak now",
    voiceStopped: "Voice Help"
  },
  as: {
    tagline: "অসম আৰু উত্তৰ-পূৰ্বাঞ্চলৰ বয়োজ্যেষ্ঠসকলৰ বাবে AI মগজুৰ সহযোগী",
    patientWelcome: "নমস্কাৰ, ভবেন দাদু!",
    patientWelcomeSub: "আহক, আজি অসম আৰু উত্তৰ-পূৰ্বাঞ্চলৰ আমোদজনক মগজুৰ খেলসমূহ খেলো।",
    aiLevel: "AI স্তৰ:",
    listen: "শুনি লওক",
    voiceHelp: "মাতৰ সহায়",
    nextRoutine: "পৰৱৰ্তী দৈনন্দিন কাম:",
    routineDone: "মই ঔষধ খালোঁ",
    gamesTitle: "দৈনন্দিন স্মৃতি আৰু মগজুৰ খেল",
    gamesSub: "তলৰ যিকোনো খেল বাছক। লাহে-ধীৰে খেলক, কোনো খৰখেদা নাই!",
    tagGame1: "সাংস্কৃতিক স্মৃতি",
    titleGame1: "কাজিৰঙা আৰু অসমীয়া স্মৃতি খেল",
    descGame1: "পৰিচিত প্ৰতীকসমূহ মিলাওক: কাজিৰঙাৰ গঁড়, বিহু ঢোল, চাহ পাত আৰু জাপি।",
    playNow: "এতিয়া খেলক ➔",
    tagGame2: "দৈনন্দিন অভ্যাস",
    titleGame2: "দৈনন্দিন ক্ৰম সজোৱা খেল",
    descGame2: "ৰাতিপুৱাৰ চাহ, ঔষধ, খোজ কঢ়া আৰু নিশাৰ আহাৰ ক্ৰম অনুসৰি সজাওক।",
    tagGame3: "\"মোৰ আপোন মানুহ\"",
    titleGame3: "পৰিয়াল আৰু আপোন গাঁৱৰ স্মৃতি",
    descGame3: "মৰমৰ অনন্যা, প্ৰণৱ আৰু মাজুলী-গুৱাহাটীৰ চিনাকি ঘাটৰ কথা মনত পেলাওক।",
    tagGame4: "মনোযোগ আৰু ক্ষিপ্ৰতা",
    titleGame4: "বিহু ঢোল স্পৰ্শ প্ৰত্যাহ্বান",
    descGame4: "বিহু ঢোল জ্বলি উঠিলে স্পৰ্শ কৰক। ই আপোনাৰ মগজু সক্ৰিয় ৰাখে।",
    moves: "বাৰ:",
    timer: "সময়:",
    instructionsRead: "নিৰ্দেশনা শুনক",
    finishReturn: "সমাপ্ত কৰি ঘূৰি যাওক",
    celebrateTitle: "চাব্বাচ, দাদু! বৰ ধুনীয়া খেল হৈছে!",
    celebrateSub: "আপুনি অতি মনোযোগ আৰু সঠিকভাৱে খেল সমাপ্ত কৰিলে।",
    continueHome: "মূল পৃষ্ঠালৈ যাওক",
    voiceListening: "শুনি আছোঁ... কওক",
    voiceStopped: "মাতৰ সহায়"
  },
  bn: {
    tagline: "উত্তর-পূর্বাঞ্চলের প্রবীণদের জন্য এআই কগনিটিভ সঙ্গী",
    patientWelcome: "নমস্কার, ভবেন দাদু!",
    patientWelcomeSub: "আসুন, আজকের প্রিয় স্মৃতি ও মস্তিষ্কের খেলাগুলো শুরু করি।",
    aiLevel: "এআই স্তর:",
    listen: "শুনুন",
    voiceHelp: "কণ্ঠ সহায়তা",
    nextRoutine: "পরবর্তী দৈনন্দিন কাজ:",
    routineDone: "আমি ওষুধ খেয়েছি",
    gamesTitle: "দৈনিক স্মৃতি ও মানসিক ব্যায়াম",
    gamesSub: "নিচের যেকোনো খেলা বেছে নিন। তাড়াহুড়োর কোনো প্রয়োজন নেই!",
    tagGame1: "সাংস্কৃতিক স্মৃতি",
    titleGame1: "আসাম ঐতিহ্য স্মৃতির খেলা",
    descGame1: "জোড়া মেলান: কাজিরাঙার গন্ডার, বিহু ঢোল, চা পাতা ও জাপি।",
    playNow: "এখন খেলুন ➔",
    tagGame2: "দৈনন্দিন নিয়ম",
    titleGame2: "দৈনন্দিন কাজের সময়রেখা",
    descGame2: "সকালের চা, ওষুধ, হাঁটা ও রাতের খাবার ক্রমানুসারে সাজান।",
    tagGame3: "\"আমার আপনজন\"",
    titleGame3: "পরিবার ও স্মৃতি রোমন্থন",
    descGame3: "অনন্যা, প্রণব ও মাজুলী দ্বীপের স্মৃতি মনে করুন।",
    tagGame4: "মনোযোগ ও দ্রুততা",
    titleGame4: "বিহু ঢোল স্পর্শ চ্যালেঞ্জ",
    descGame4: "ঢোলের আলো জ্বললেই স্পর্শ করুন। মস্তিষ্ক সতেজ থাকবে।",
    moves: "চাল:",
    timer: "সময়:",
    instructionsRead: "নির্দেশনা শুনুন",
    finishReturn: "ফিরে যান",
    celebrateTitle: "দারুণ, দাদু! চমৎকার খেলেছেন!",
    celebrateSub: "আপনি অত্যন্ত মনোযোগ সহকারে এই পর্বটি শেষ করেছেন।",
    continueHome: "হোমে ফিরে যান",
    voiceListening: "শুনছি... বলুন",
    voiceStopped: "কণ্ঠ সহায়তা"
  },
  hi: {
    tagline: "पूर्वोत्तर भारत के वरिष्ठ नागरिकों के लिए एआई संज्ञानात्मक साथी",
    patientWelcome: "नमस्ते, भवेन दादू!",
    patientWelcomeSub: "आइए आज असम और पूर्वोत्तर के प्रिय स्मृति खेल खेलें।",
    aiLevel: "एआई स्तर:",
    listen: "सुनें",
    voiceHelp: "आवाज सहायता",
    nextRoutine: "अगली दैनिक दिनचर्या:",
    routineDone: "मैंने दवा ले ली",
    gamesTitle: "दैनिक मस्तिष्क अभ्यास",
    gamesSub: "कोई भी खेल चुनें। आराम से खेलें, कोई जल्दबाजी नहीं है!",
    tagGame1: "सांस्कृतिक स्मृति",
    titleGame1: "काजीरंगा और पूर्वोत्तर स्मृति मिलान",
    descGame1: "समान जोड़े खोजें: काजीरंगा गैंडा, बिहू ढोल, चाय की पत्ती और जापी।",
    playNow: "अब खेलें ➔",
    tagGame2: "दिनचर्या अनुक्रम",
    titleGame2: "दैनिक दिनचर्या समयरेखा",
    descGame2: "सुबह की चाय, दवा, शाम की सैर और रात का भोजन सही क्रम में लगाएं।",
    tagGame3: "\"मेरी पहचान\"",
    titleGame3: "परिवार और गृहनगर स्मृति",
    descGame3: "पोती अनन्या, बेटे प्रणब और माजुली द्वीप की यादें ताजा करें।",
    tagGame4: "प्रतिक्रिया गति",
    titleGame4: "बिहू ढोल टैप चुनौती",
    descGame4: "जब बिहू ढोल चमके, तुरंत टैप करें। यह आपकी सजगता बढ़ाता है।",
    moves: "प्रयास:",
    timer: "समय:",
    instructionsRead: "निर्देश सुनें",
    finishReturn: "वापस जाएं",
    celebrateTitle: "शाबाश, दादू! बहुत बढ़िया प्रदर्शन!",
    celebrateSub: "आपने बहुत ध्यान और सटीकता से यह खेल पूरा किया।",
    continueHome: "मुख्य पृष्ठ पर जाएं",
    voiceListening: "सुन रहा हूँ... बोलिए",
    voiceStopped: "आवाज सहायता"
  }
};

// --- Authentic NER Cultural Assets ---
const NER_SYMBOLS = [
  { id: 'rhino', icon: '🦏', name_en: 'Kaziranga Rhino', name_as: 'এশিঙীয়া গঁড়', name_bn: 'একশৃঙ্গ গণ্ডার', name_hi: 'काजीरंगा गैंडा' },
  { id: 'dhol', icon: '🥁', name_en: 'Bihu Dhol', name_as: 'বিহু ঢোল', name_bn: 'বিহু ঢোল', name_hi: 'बिहू ढोल' },
  { id: 'tea', icon: '🍵', name_en: 'Assam CTC Tea', name_as: 'অসমীয়া চাহ', name_bn: 'আসাম চা', name_hi: 'असम की चाय' },
  { id: 'jaapi', icon: '👒', name_en: 'Assam Jaapi', name_as: 'অসমীয়া জাপি', name_bn: 'আসামি জাপি', name_hi: 'असम जापी' },
  { id: 'silk', icon: '🧵', name_en: 'Muga Silk', name_as: 'মুগা কাপোৰ', name_bn: 'মুগা রেশম', name_hi: 'मूगा रेशम' },
  { id: 'mask', icon: '🎭', name_en: 'Majuli Mask', name_as: 'মাজুলীৰ মুখা', name_bn: 'মাজুলীর মুখোশ', name_hi: 'माजुली मुखौटा' },
  { id: 'hornbill', icon: '🦜', name_en: 'Hornbill Bird', name_as: 'ধনেশ পক্ষী', name_bn: 'ধনেশ পাখি', name_hi: 'हॉर्नबिल पक्षी' },
  { id: 'turmeric', icon: '🌾', name_en: 'Lakadong Spice', name_as: 'লাকাডং হালধি', name_bn: 'লাকাডং হলুদ', name_hi: 'लाकाडोंग हल्दी' }
];

// --- Audio Synthesizer (Web Audio API) for gentle tactile sound feedback ---
const SoundFX = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
  },
  playTone(freq, type = 'sine', duration = 0.15) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  },
  flip() { this.playTone(480, 'sine', 0.12); },
  match() {
    this.playTone(523.25, 'triangle', 0.15);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.25), 120);
  },
  celebrate() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.22), i * 140);
    });
  }
};

// --- Web Speech API (TTS & Speech Recognition) ---
const VoiceEngine = {
  synth: window.speechSynthesis,
  recognition: null,
  isListening: false,

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        const btn = document.getElementById('voice-assistant-btn');
        if (btn) btn.classList.add('listening');
        const lbl = document.getElementById('voice-btn-label');
        if (lbl) lbl.innerText = I18N[state.currentLang].voiceListening;
      };

      this.recognition.onend = () => {
        this.isListening = false;
        const btn = document.getElementById('voice-assistant-btn');
        if (btn) btn.classList.remove('listening');
        const lbl = document.getElementById('voice-btn-label');
        if (lbl) lbl.innerText = I18N[state.currentLang].voiceStopped;
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Voice transcript received:", transcript);
        this.handleVoiceCommand(transcript);
      };
    }
  },

  speak(text) {
    if (!this.synth) return;
    this.synth.cancel(); // stop previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Adjust speech rate for seniors
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    // Pick voice if regional language requested
    const langMap = { en: 'en-IN', as: 'as-IN', bn: 'bn-IN', hi: 'hi-IN' };
    utterance.lang = langMap[state.currentLang] || 'en-IN';

    this.synth.speak(utterance);
  },

  toggleListen() {
    if (!this.recognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (this.isListening) {
      this.recognition.stop();
    } else {
      const langMap = { en: 'en-IN', as: 'as-IN', bn: 'bn-IN', hi: 'hi-IN' };
      this.recognition.lang = langMap[state.currentLang] || 'en-IN';
      try {
        this.recognition.start();
      } catch (e) {
        console.warn("Speech recognition error", e);
      }
    }
  },

  handleVoiceCommand(transcript) {
    if (transcript.includes("game") || transcript.includes("match") || transcript.includes("play") || transcript.includes("খেল")) {
      this.speak("Starting Assam Heritage Match game now!");
      startCulturalGame();
    } else if (transcript.includes("medicine") || transcript.includes("routine") || transcript.includes("task") || transcript.includes("ঔষধ")) {
      handleRoutineCompletion();
      this.speak("Marked your daily routine as completed!");
    } else if (transcript.includes("family") || transcript.includes("memory") || transcript.includes("ananya")) {
      this.speak("Opening family and hometown recall game!");
      startFaceRecallGame();
    } else {
      this.speak("I heard: " + transcript + ". You can say 'Play game' or 'Take medicine'.");
    }
  }
};

// --- Initialization on Load ---
document.addEventListener('DOMContentLoaded', () => {
  VoiceEngine.init();
  initEventListeners();
  checkNetworkStatus();
  fetchPatientData();
  fetchRoutines();
  fetchMemories();
  fetchCaregiverAnalytics();

  // Background sync retry every 15s if connected
  setInterval(() => {
    if (state.isOnline && state.offlineQueue.length > 0) {
      flushOfflineQueue();
    }
  }, 15000);
});

function initEventListeners() {
  // Language selector
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }

  // Voice Assistant button
  const voiceBtn = document.getElementById('voice-assistant-btn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => VoiceEngine.toggleListen());
  }

  // Greeting speak button
  const speakGreetingBtn = document.getElementById('tts-speak-greeting');
  if (speakGreetingBtn) {
    speakGreetingBtn.addEventListener('click', () => {
      const text = `${I18N[state.currentLang].patientWelcome}. ${I18N[state.currentLang].patientWelcomeSub}`;
      VoiceEngine.speak(text);
    });
  }

  // Routine check button
  const routineBtn = document.getElementById('btn-confirm-routine');
  if (routineBtn) {
    routineBtn.addEventListener('click', handleRoutineCompletion);
  }

  // Window online/offline events
  window.addEventListener('online', () => {
    state.isOnline = true;
    updateSyncBadge();
    flushOfflineQueue();
  });

  window.addEventListener('offline', () => {
    state.isOnline = false;
    updateSyncBadge();
  });
}

// --- Demo User Switching ---
async function handleUserSwitch(userId) {
  try {
    const res = await fetch('/api/auth/demo-users');
    if (res.ok) {
      const data = await res.json();
      const user = data.users.find(u => u.id === userId);
      if (user) {
        if (user.role === 'caregiver' || user.role === 'clinician') {
          switchView('caregiver');
          VoiceEngine.speak(`Logged in as ${user.name}, ${user.role_label}.`);
        } else {
          switchView('patient');
          const welcomeTitle = document.getElementById('patient-welcome-title');
          if (welcomeTitle) {
            welcomeTitle.innerText = `Namaste, ${user.name}!`;
          }
          VoiceEngine.speak(`Switched to ${user.name}'s cognitive companion.`);
        }
      }
    }
  } catch (err) {
    console.warn("User switch error", err);
  }
}

// --- View Switching ---
function switchView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

  if (viewName === 'patient') {
    document.getElementById('patient-view').classList.add('active');
    document.getElementById('tab-patient').classList.add('active');
  } else {
    document.getElementById('caregiver-view').classList.add('active');
    document.getElementById('tab-caregiver').classList.add('active');
    fetchCaregiverAnalytics();
  }
}

// --- Language Setting ---
function setLanguage(lang) {
  if (!I18N[lang]) return;
  state.currentLang = lang;
  document.body.className = `lang-${lang} theme-warm`;

  const dict = I18N[lang];
  document.getElementById('hdr-tagline').innerText = dict.tagline;
  document.getElementById('patient-welcome-title').innerText = dict.patientWelcome;
  document.getElementById('patient-welcome-sub').innerText = dict.patientWelcomeSub;
  document.getElementById('lbl-ai-level').innerText = dict.aiLevel;
  document.getElementById('lbl-listen-prompt').innerText = dict.listen;
  document.getElementById('voice-btn-label').innerText = dict.voiceHelp;
  document.getElementById('lbl-next-routine').innerText = dict.nextRoutine;
  document.getElementById('lbl-routine-done').innerText = dict.routineDone;
  document.getElementById('hdr-games-title').innerText = dict.gamesTitle;
  document.getElementById('hdr-games-sub').innerText = dict.gamesSub;

  // Games cards
  document.getElementById('tag-game1').innerText = dict.tagGame1;
  document.getElementById('title-game1').innerText = dict.titleGame1;
  document.getElementById('desc-game1').innerText = dict.descGame1;
  document.getElementById('btn-play-game1').innerText = dict.playNow;

  document.getElementById('tag-game2').innerText = dict.tagGame2;
  document.getElementById('title-game2').innerText = dict.titleGame2;
  document.getElementById('desc-game2').innerText = dict.descGame2;
  document.getElementById('btn-play-game2').innerText = dict.playNow;

  document.getElementById('tag-game3').innerText = dict.tagGame3;
  document.getElementById('title-game3').innerText = dict.titleGame3;
  document.getElementById('desc-game3').innerText = dict.descGame3;
  document.getElementById('btn-play-game3').innerText = dict.playNow;

  document.getElementById('tag-game4').innerText = dict.tagGame4;
  document.getElementById('title-game4').innerText = dict.titleGame4;
  document.getElementById('desc-game4').innerText = dict.descGame4;
  document.getElementById('btn-play-game4').innerText = dict.playNow;

  renderActiveRoutine();
}

// --- Offline & Sync Status ---
function checkNetworkStatus() {
  state.isOnline = navigator.onLine;
  updateSyncBadge();
}

function updateSyncBadge() {
  const badge = document.getElementById('sync-status');
  const txt = document.getElementById('sync-text');
  if (!badge || !txt) return;

  if (state.isOnline) {
    if (state.offlineQueue.length > 0) {
      badge.className = 'status-badge offline';
      txt.innerText = `Online • Syncing (${state.offlineQueue.length} queued)`;
    } else {
      badge.className = 'status-badge online';
      txt.innerText = 'Online • Synced';
    }
  } else {
    badge.className = 'status-badge offline';
    txt.innerText = `Offline • Local Cache (${state.offlineQueue.length} queued)`;
  }
}

// --- API Interactions ---
async function fetchPatientData() {
  try {
    const res = await fetch('/api/patient');
    if (res.ok) {
      const data = await res.json();
      state.patientData = data;
      state.currentDifficulty = data.current_difficulty || 'Medium';
      state.autoAdapt = Boolean(data.auto_adapt_difficulty);

      updateDifficultyUI();
    }
  } catch (err) {
    console.warn("Unable to fetch patient profile, using cached state.", err);
  }
}

function updateDifficultyUI() {
  const badge = document.getElementById('patient-tier-badge');
  if (badge) {
    badge.innerText = state.currentDifficulty;
    badge.className = `tier-badge ${state.currentDifficulty.toLowerCase()}`;
  }

  const cgDiffTag = document.getElementById('cg-current-difficulty');
  if (cgDiffTag) {
    const adaptLabel = state.autoAdapt ? 'AI Auto-Adapt' : 'Manual Lock';
    cgDiffTag.innerText = `Active Difficulty: ${state.currentDifficulty} (${adaptLabel})`;
  }

  // Caregiver toggle & buttons
  const chk = document.getElementById('chk-auto-adapt');
  if (chk) chk.checked = state.autoAdapt;

  ['easy', 'medium', 'hard'].forEach(t => {
    const btn = document.getElementById(`btn-tier-${t}`);
    if (btn) {
      btn.classList.toggle('active', t.toLowerCase() === state.currentDifficulty.toLowerCase());
    }
  });
}

async function fetchRoutines() {
  try {
    const res = await fetch('/api/routines');
    if (res.ok) {
      state.routines = await res.json();
      renderActiveRoutine();
      renderCaregiverRoutines();
    }
  } catch (e) {
    console.warn("Routines load failed", e);
  }
}

function renderActiveRoutine() {
  const pending = state.routines.filter(r => r.status === 'pending');
  const active = pending.length > 0 ? pending[0] : null;
  const box = document.getElementById('active-reminder-box');
  if (!box) return;

  if (!active) {
    box.style.display = 'none';
    return;
  }

  box.style.display = 'flex';
  const titleEl = document.getElementById('reminder-title');
  const timeEl = document.getElementById('reminder-time-dose');

  let title = active.title;
  if (state.currentLang === 'as' && active.title_as) title = active.title_as;
  else if (state.currentLang === 'bn' && active.title_bn) title = active.title_bn;
  else if (state.currentLang === 'hi' && active.title_hi) title = active.title_hi;

  titleEl.innerText = title;
  timeEl.innerHTML = `Time: <strong>${active.time_str}</strong> • ${active.dosage || 'Daily Routine'}`;
  box.dataset.routineId = active.id;
}

async function handleRoutineCompletion() {
  const box = document.getElementById('active-reminder-box');
  const routineId = box ? box.dataset.routineId : null;
  if (!routineId) return;

  SoundFX.match();

  // Optimistic UI update
  const routine = state.routines.find(r => r.id == routineId);
  if (routine) routine.status = 'completed';
  renderActiveRoutine();
  renderCaregiverRoutines();

  // Read congratulatory speech
  const msg = state.currentLang === 'as' ? "বহুত ভাল! আপোনাৰ কাম সম্পন্ন হ'ল।" : "Wonderful! Marked as completed.";
  VoiceEngine.speak(msg);

  try {
    await fetch(`/api/routines/${routineId}/complete`, { method: 'POST' });
  } catch (err) {
    console.warn("Offline: routine completion saved locally.");
  }
}

async function fetchMemories() {
  try {
    const res = await fetch('/api/memories');
    if (res.ok) {
      state.memories = await res.json();
      renderCaregiverMemories();
    }
  } catch (e) {
    console.warn("Memories fetch error", e);
  }
}

// --- Offline-First Sync Queue ---
function queueGameSession(sessionData) {
  state.offlineQueue.push(sessionData);
  localStorage.setItem('cogniner_offline_queue', JSON.stringify(state.offlineQueue));
  updateSyncBadge();

  if (state.isOnline) {
    flushOfflineQueue();
  }
}

async function flushOfflineQueue() {
  if (state.offlineQueue.length === 0) return;

  const payload = { sessions: [...state.offlineQueue] };
  try {
    const res = await fetch('/api/sessions/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      state.offlineQueue = [];
      localStorage.removeItem('cogniner_offline_queue');
      updateSyncBadge();

      if (data.current_difficulty) {
        state.currentDifficulty = data.current_difficulty;
        updateDifficultyUI();
      }
      console.log("Successfully synced offline sessions:", data);
    }
  } catch (err) {
    console.warn("Background sync failed; remaining in offline queue.", err);
  }
}

// =========================================================
// COGNITIVE GAMES SUITE (Localized to NER Context)
// =========================================================

function openGameArena(title, instruction, icon) {
  document.getElementById('arena-title').innerText = title;
  document.getElementById('arena-instruction').innerText = instruction;
  document.getElementById('arena-icon').innerText = icon;
  document.getElementById('arena-moves').innerText = '0';
  document.getElementById('arena-timer').innerText = '0s';

  const container = document.getElementById('game-arena-container');
  container.classList.remove('hidden');

  // Start timer
  state.activeGameStartTime = Date.now();
  clearInterval(state.activeGameTimer);
  state.activeGameTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.activeGameStartTime) / 1000);
    document.getElementById('arena-timer').innerText = `${elapsed}s`;
  }, 1000);

  // Setup voice hint button
  const hintBtn = document.getElementById('arena-voice-hint');
  hintBtn.onclick = () => VoiceEngine.speak(instruction);
}

function closeGameArena() {
  clearInterval(state.activeGameTimer);
  document.getElementById('game-arena-container').classList.add('hidden');
}

function finishGameSession(gameType, accuracy, errorsCount, totalMoves, customFeedback = null) {
  clearInterval(state.activeGameTimer);
  const durationSeconds = Math.max(12, Math.round((Date.now() - state.activeGameStartTime) / 1000));
  
  // Calculate average reaction time per move
  const reactionTimeMs = Math.round((durationSeconds * 1000) / Math.max(1, totalMoves));

  // Compute composite score on client (matches server scoring engine formula)
  const speedScore = Math.max(20, Math.min(100, 100 - ((reactionTimeMs - 1500) / 4500) * 70));
  const consistencyScore = Math.max(20, 100 - (errorsCount * 15));
  const compositeScore = Math.round((0.40 * accuracy) + (0.30 * speedScore) + (0.20 * consistencyScore) + 10);

  // Queue session for sync
  const sessionRecord = {
    session_id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    game_type: gameType,
    difficulty: state.currentDifficulty,
    accuracy: accuracy,
    reaction_time_ms: reactionTimeMs,
    errors_count: errorsCount,
    duration_seconds: durationSeconds,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  queueGameSession(sessionRecord);

  // Sound and celebrate
  SoundFX.celebrate();
  closeGameArena();

  // Show celebration modal
  document.getElementById('res-score').innerText = compositeScore;
  document.getElementById('res-acc').innerText = `${accuracy}%`;
  document.getElementById('res-rt').innerText = `${(reactionTimeMs / 1000).toFixed(1)}s`;

  const aiNoteEl = document.getElementById('res-ai-note');
  if (customFeedback) {
    aiNoteEl.innerHTML = `🤖 <strong>AI Adaptive Note:</strong> ${customFeedback}`;
  } else if (compositeScore >= 85) {
    aiNoteEl.innerHTML = `🤖 <strong>AI Adaptive Note:</strong> Exceptional recall and reaction speed! Ready for more complex cultural pairs.`;
  } else {
    aiNoteEl.innerHTML = `🤖 <strong>AI Adaptive Note:</strong> Calm and steady pace. Difficulty kept comfortable to reinforce positive recall.`;
  }

  document.getElementById('game-result-modal').classList.remove('hidden');

  // Speak congratulations
  const celebText = state.currentLang === 'as' 
    ? "চাব্বাচ, দাদু! আপোনাৰ খেল অতি উৎকৃষ্ট হৈছে।" 
    : "Shabash, Dadu! Outstanding work on today's memory drill.";
  VoiceEngine.speak(celebText);
}

function closeResultModal() {
  document.getElementById('game-result-modal').classList.add('hidden');
}

// ---------------------------------------------------------
// GAME 1: NER Cultural Memory Match
// ---------------------------------------------------------
function startCulturalGame() {
  const dict = I18N[state.currentLang];
  openGameArena(dict.titleGame1, dict.descGame1, '🦏');

  const board = document.getElementById('arena-board');
  board.innerHTML = '';

  // Determine pair count based on difficulty
  let pairCount = 3; // Medium default
  if (state.currentDifficulty === 'Easy') pairCount = 2;
  else if (state.currentDifficulty === 'Hard') pairCount = 4;

  const selectedSymbols = NER_SYMBOLS.slice(0, pairCount);
  let cardDeck = [];
  selectedSymbols.forEach(sym => {
    cardDeck.push({ ...sym, cardId: `${sym.id}_1` });
    cardDeck.push({ ...sym, cardId: `${sym.id}_2` });
  });

  // Shuffle deck
  cardDeck.sort(() => 0.5 - Math.random());

  const grid = document.createElement('div');
  grid.className = `memory-grid grid-${cardDeck.length}`;

  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let errors = 0;

  cardDeck.forEach(card => {
    const btn = document.createElement('button');
    btn.className = 'memory-card-btn';
    btn.dataset.symbolId = card.id;
    btn.dataset.cardId = card.cardId;
    btn.innerHTML = `<span class="card-back">❓</span>`;

    btn.onclick = () => {
      if (btn.classList.contains('flipped') || btn.classList.contains('matched') || flippedCards.length >= 2) {
        return;
      }

      SoundFX.flip();
      btn.classList.add('flipped');

      // Localized name
      let localName = card.name_en;
      if (state.currentLang === 'as') localName = card.name_as;
      else if (state.currentLang === 'bn') localName = card.name_bn;
      else if (state.currentLang === 'hi') localName = card.name_hi;

      btn.innerHTML = `<span>${card.icon}</span><span class="card-label">${localName}</span>`;
      flippedCards.push(btn);

      if (flippedCards.length === 2) {
        moves++;
        document.getElementById('arena-moves').innerText = moves;

        const [c1, c2] = flippedCards;
        if (c1.dataset.symbolId === c2.dataset.symbolId) {
          SoundFX.match();
          c1.classList.add('matched');
          c2.classList.add('matched');
          flippedCards = [];
          matchedPairs++;

          if (matchedPairs === pairCount) {
            setTimeout(() => {
              const accuracy = Math.round((pairCount / Math.max(pairCount, moves)) * 100);
              finishGameSession('ner_cultural_match', accuracy, errors, moves);
            }, 600);
          }
        } else {
          errors++;
          setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            c1.innerHTML = `<span class="card-back">❓</span>`;
            c2.innerHTML = `<span class="card-back">❓</span>`;
            flippedCards = [];
          }, 900);
        }
      }
    };

    grid.appendChild(btn);
  });

  board.appendChild(grid);
}

// ---------------------------------------------------------
// GAME 2: Daily Routine Timeline Sequencer
// ---------------------------------------------------------
function startRoutineGame() {
  const dict = I18N[state.currentLang];
  openGameArena(dict.titleGame2, dict.descGame2, '☀️');

  const board = document.getElementById('arena-board');
  board.innerHTML = '';

  const activities = [
    { id: 'tea', step: 1, label_en: '1. Morning Assam Chai', label_as: '১. ৰাতিপুৱাৰ লাল চাহ', icon: '🍵' },
    { id: 'meds', step: 2, label_en: '2. Morning BP Medicine', label_as: '২. ৰাতিপুৱাৰ ঔষধ', icon: '💊' },
    { id: 'walk', step: 3, label_en: '3. Evening Garden Walk', label_as: '৩. সন্ধিয়া ফুলনিত খোজ কঢ়া', icon: '🌿' },
    { id: 'call', step: 4, label_en: '4. Night Family Call', label_as: '৪. ৰাতি পৰিয়ালৰ সৈতে কথা পতা', icon: '📞' }
  ];

  let currentSequence = [];
  const targetSlots = activities.length;

  const wrapper = document.createElement('div');
  wrapper.className = 'timeline-board';

  // Instructions prompt
  const inst = document.createElement('p');
  inst.style.textAlign = 'center';
  inst.style.fontSize = '1.15rem';
  inst.style.fontWeight = '700';
  inst.innerText = state.currentLang === 'as' 
    ? "ৰাতিপুৱাৰ পৰা ৰাতিলৈকে কামসমূহ ক্ৰম অনুসৰি স্পৰ্শ কৰক:" 
    : "Tap the activities in chronological order from morning to night:";
  wrapper.appendChild(inst);

  // Slots
  const slotsRow = document.createElement('div');
  slotsRow.className = 'timeline-target-slots';
  for (let i = 1; i <= targetSlots; i++) {
    const slot = document.createElement('div');
    slot.className = 'timeline-slot';
    slot.id = `timeline-slot-${i}`;
    slot.innerHTML = `<span class="timeline-slot-hdr">Step ${i}</span><span class="slot-content">---</span>`;
    slotsRow.appendChild(slot);
  }
  wrapper.appendChild(slotsRow);

  // Shuffled pool
  const chipsPool = document.createElement('div');
  chipsPool.className = 'timeline-chips-pool';
  const shuffled = [...activities].sort(() => 0.5 - Math.random());

  let moves = 0;
  let errors = 0;

  shuffled.forEach(act => {
    const chip = document.createElement('button');
    chip.className = 'timeline-chip';
    const lbl = state.currentLang === 'as' ? act.label_as : act.label_en;
    chip.innerHTML = `<span>${act.icon}</span> <span>${lbl}</span>`;

    chip.onclick = () => {
      moves++;
      document.getElementById('arena-moves').innerText = moves;

      const expectedStep = currentSequence.length + 1;
      if (act.step === expectedStep) {
        SoundFX.match();
        currentSequence.push(act);
        chip.disabled = true;
        chip.style.opacity = '0.4';

        const slot = document.getElementById(`timeline-slot-${expectedStep}`);
        slot.style.background = '#EAFAF1';
        slot.style.borderColor = '#27AE60';
        slot.innerHTML = `<strong>${act.icon} ${lbl}</strong>`;

        if (currentSequence.length === targetSlots) {
          setTimeout(() => {
            const accuracy = Math.round((targetSlots / Math.max(targetSlots, moves)) * 100);
            finishGameSession('routine_sequencer', accuracy, errors, moves);
          }, 600);
        }
      } else {
        errors++;
        SoundFX.flip();
        chip.style.background = '#FADBD8';
        setTimeout(() => {
          chip.style.background = '#FFFFFF';
        }, 500);
      }
    };

    chipsPool.appendChild(chip);
  });

  wrapper.appendChild(chipsPool);
  board.appendChild(wrapper);
}

// ---------------------------------------------------------
// GAME 3: Faces & Places "Memory of Me" Digital Twin
// ---------------------------------------------------------
function startFaceRecallGame() {
  const dict = I18N[state.currentLang];
  openGameArena(dict.titleGame3, dict.descGame3, '🏡');

  const board = document.getElementById('arena-board');
  board.innerHTML = '';

  if (state.memories.length === 0) {
    board.innerHTML = '<p>Loading memories...</p>';
    return;
  }

  // Pick one memory card at random
  const memory = state.memories[Math.floor(Math.random() * state.memories.length)];

  const wrapper = document.createElement('div');
  wrapper.className = 'face-recall-board';

  // Story & presentation
  const card = document.createElement('div');
  card.className = 'face-presentation-card';

  let storyText = memory.story_prompt;
  let relationText = memory.relation;
  if (state.currentLang === 'as' && memory.story_prompt_as) {
    storyText = memory.story_prompt_as;
    relationText = memory.relation_as || memory.relation;
  }

  card.innerHTML = `
    <div class="face-avatar-large" style="background: ${memory.avatar_color || '#4A90E2'}; color: #fff;">
      ${memory.name.charAt(0)}
    </div>
    <span class="face-town-badge">📍 ${memory.hometown || 'Assam'}</span>
    <p class="face-story-quote">"${storyText}"</p>
  `;
  wrapper.appendChild(card);

  // Speak the story prompt automatically
  VoiceEngine.speak(storyText);

  // Question prompt
  const qPrompt = document.createElement('p');
  qPrompt.style.fontWeight = '800';
  qPrompt.style.fontSize = '1.2rem';
  qPrompt.innerText = state.currentLang === 'as' 
    ? "এই চিনাকি ব্যক্তিসত্তা বা স্থান কোন হয়?" 
    : "Who or what familiar memory is this?";
  wrapper.appendChild(qPrompt);

  // Multiple Choice Options (Correct + 3 Distractors)
  const optionsGrid = document.createElement('div');
  optionsGrid.className = 'face-options-grid';

  const correctOption = memory.name;
  const distractorPool = ["Rohan Sarma", "Dr. Bhupen Hazarika Ghat", "Diphu Hill Cottage", "Cotton College Green", "Kamrup Tea Estate"]
    .filter(n => n !== correctOption);
  
  const choices = [correctOption, distractorPool[0], distractorPool[1], distractorPool[2]]
    .sort(() => 0.5 - Math.random());

  let moves = 0;
  let errors = 0;

  choices.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'face-opt-btn';
    btn.innerText = opt;

    btn.onclick = () => {
      moves++;
      document.getElementById('arena-moves').innerText = moves;

      if (opt === correctOption) {
        SoundFX.match();
        btn.style.background = '#D4EFDF';
        btn.style.borderColor = '#27AE60';
        setTimeout(() => {
          const accuracy = errors === 0 ? 100 : 75;
          finishGameSession('face_place_recall', accuracy, errors, moves);
        }, 600);
      } else {
        errors++;
        SoundFX.flip();
        btn.style.background = '#FADBD8';
        btn.disabled = true;
      }
    };

    optionsGrid.appendChild(btn);
  });

  wrapper.appendChild(optionsGrid);
  board.appendChild(wrapper);
}

// ---------------------------------------------------------
// GAME 4: Speed of Attention & Processing Focus Drill
// ---------------------------------------------------------
function startAttentionGame() {
  const dict = I18N[state.currentLang];
  openGameArena(dict.titleGame4, dict.descGame4, '🥁');

  const board = document.getElementById('arena-board');
  board.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'attention-board';

  const cueBox = document.createElement('div');
  cueBox.className = 'attention-cue-box';
  cueBox.innerText = state.currentLang === 'as' 
    ? "লক্ষ্য: যেতিয়াই 'বিহু ঢোল' (🥁) জ্বলি উঠিব, লগে লগে স্পৰ্শ কৰক!" 
    : "Target: Tap the 'Bihu Dhol' (🥁) as fast as you spot it!";
  wrapper.appendChild(cueBox);

  VoiceEngine.speak(cueBox.innerText);

  const grid = document.createElement('div');
  grid.className = 'attention-target-grid';

  const cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.className = 'attention-cell';
    cell.dataset.index = i;
    cell.innerHTML = '🌿';
    grid.appendChild(cell);
    cells.push(cell);
  }
  wrapper.appendChild(grid);
  board.appendChild(wrapper);

  let targetIndex = -1;
  let moves = 0;
  let hits = 0;
  let misses = 0;
  const targetHitsNeeded = 5;

  function spawnTarget() {
    cells.forEach(c => {
      c.innerHTML = '🌿';
      c.classList.remove('active-target');
    });

    targetIndex = Math.floor(Math.random() * cells.length);
    cells[targetIndex].innerHTML = '🥁';
    cells[targetIndex].classList.add('active-target');
    SoundFX.flip();
  }

  cells.forEach(cell => {
    cell.onclick = () => {
      moves++;
      document.getElementById('arena-moves').innerText = moves;

      if (parseInt(cell.dataset.index) === targetIndex) {
        SoundFX.match();
        hits++;
        cell.classList.remove('active-target');

        if (hits >= targetHitsNeeded) {
          setTimeout(() => {
            const accuracy = Math.round((hits / Math.max(hits, moves)) * 100);
            finishGameSession('speed_attention_drill', accuracy, misses, moves);
          }, 400);
        } else {
          setTimeout(spawnTarget, 400);
        }
      } else {
        misses++;
        SoundFX.playTone(280, 'sine', 0.1);
      }
    };
  });

  // Spawn first target
  setTimeout(spawnTarget, 800);
}

// =========================================================
// CAREGIVER & CLINICAL DASHBOARD TELEMETRY
// =========================================================

async function fetchCaregiverAnalytics() {
  try {
    const res = await fetch('/api/caregiver/analytics');
    if (res.ok) {
      const data = await res.json();
      renderKPIs(data);
      renderTrendChart(data.trend_chart);
      renderAlerts(data.alerts);
      renderCaregiverRoutines();
      renderCaregiverMemories();
    }
  } catch (err) {
    console.warn("Analytics fetch failed", err);
  }
}

function renderKPIs(data) {
  document.getElementById('kpi-composite').innerText = data.composite_score;
  document.getElementById('kpi-accuracy').innerText = `${data.accuracy}%`;
  document.getElementById('kpi-reaction-time').innerText = (data.avg_reaction_time_ms / 1000).toFixed(1);
  document.getElementById('kpi-adherence').innerText = `${data.adherence_percentage}%`;
  document.getElementById('kpi-adherence-ratio').innerText = `${data.completed_routines} of ${data.total_routines} completed`;
}

function renderTrendChart(chartData) {
  const ctx = document.getElementById('cognitiveTrendChart');
  if (!ctx || !chartData) return;

  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  state.chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Composite Score',
          data: chartData.scores,
          borderColor: '#1E5B8E',
          backgroundColor: 'rgba(30, 91, 142, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 5
        },
        {
          label: 'Memory Accuracy (%)',
          data: chartData.accuracy,
          borderColor: '#27AE60',
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: 'Reaction Speed Index',
          data: chartData.speed,
          borderColor: '#E67E22',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 40,
          max: 100,
          ticks: { font: { family: 'Plus Jakarta Sans', size: 12 } }
        },
        x: {
          ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
        }
      }
    }
  });
}

function renderAlerts(alerts) {
  const container = document.getElementById('alerts-container');
  if (!container) return;

  if (!alerts || alerts.length === 0) {
    container.innerHTML = '<p class="text-muted">No active clinical alerts.</p>';
    return;
  }

  container.innerHTML = alerts.map(a => `
    <div class="alert-item ${a.severity}">
      <div class="alert-hdr">
        <span>${a.alert_type}</span>
        <span class="alert-time">${a.timestamp}</span>
      </div>
      <div>${a.message}</div>
    </div>
  `).join('');
}

function renderCaregiverRoutines() {
  const tbody = document.getElementById('caregiver-routine-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.routines.map(r => `
    <tr>
      <td><strong>${r.time_str}</strong></td>
      <td>
        <div>${r.title}</div>
        <small style="color:#7F8C8D;">${r.dosage || ''}</small>
      </td>
      <td><span style="text-transform: capitalize;">${r.category}</span></td>
      <td>
        <span class="badge-pill ${r.status}">
          ${r.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
        </span>
      </td>
    </tr>
  `).join('');
}

function renderCaregiverMemories() {
  const container = document.getElementById('memory-cards-container');
  if (!container) return;

  container.innerHTML = state.memories.map(m => `
    <div class="memory-item-card">
      <div class="mem-avatar-mini" style="background: ${m.avatar_color || '#3498DB'}; color: #fff;">
        ${m.name.charAt(0)}
      </div>
      <div class="mem-info" style="flex-grow:1;">
        <div style="display:flex; justify-content:space-between;">
          <h4>${m.name}</h4>
          <span class="rel-tag">${m.relation}</span>
        </div>
        <small style="color:#117A65; font-weight:700;">📍 ${m.hometown || 'NER'}</small>
        <p>${m.story_prompt}</p>
      </div>
    </div>
  `).join('');
}

// --- Caregiver Difficulty Control Handlers ---
async function toggleAutoAdapt() {
  const chk = document.getElementById('chk-auto-adapt');
  state.autoAdapt = chk.checked;
  document.getElementById('lbl-auto-adapt-status').innerHTML = `Auto-Adaptation: <strong>${state.autoAdapt ? 'ON' : 'OFF'}</strong>`;
  
  await saveDifficultySetting(state.currentDifficulty, state.autoAdapt);
}

async function setManualDifficulty(diff) {
  state.currentDifficulty = diff;
  updateDifficultyUI();
  await saveDifficultySetting(diff, state.autoAdapt);
}

async function saveDifficultySetting(difficulty, autoAdapt) {
  try {
    await fetch('/api/caregiver/difficulty-override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty, auto_adapt: autoAdapt })
    });
    fetchCaregiverAnalytics();
  } catch (err) {
    console.warn("Failed to persist caregiver difficulty override", err);
  }
}

// --- Memory Modal ---
function openMemoryModal() {
  document.getElementById('add-memory-modal').classList.remove('hidden');
}

function closeMemoryModal() {
  document.getElementById('add-memory-modal').classList.add('hidden');
}

async function handleMemorySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('mem-name').value;
  const relation = document.getElementById('mem-relation').value;
  const hometown = document.getElementById('mem-town').value;
  const story = document.getElementById('mem-story').value;
  const hintsRaw = document.getElementById('mem-hints').value;
  const hints = hintsRaw ? hintsRaw.split(',').map(s => s.trim()) : [];

  const payload = {
    name,
    relation,
    hometown,
    story_prompt: story,
    hints,
    avatar_color: '#8E44AD'
  };

  try {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeMemoryModal();
      document.getElementById('form-add-memory').reset();
      fetchMemories();
    }
  } catch (err) {
    alert("Could not save memory card while offline.");
  }
}
