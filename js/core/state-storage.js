/* =========================================================
   核心服務 1：全域狀態、LocalStorage 讀寫與題庫解析器
   ========================================================= */
let deferredInstallPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update();
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window.location.reload();
          }
        });
      });
    }).catch(() => {});

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
});

async function installPWAApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') deferredInstallPrompt = null;
  } else {
    alert('📲 安裝全螢幕 APP 方法：\n\n• Android Chrome：請點選右上角「⋮」➔ 選擇「安裝應用程式」或「加到主畫面」。\n• iPad / iPhone Safari：請點選「分享」按鈕 ➔ 選擇「加入主畫面」。');
  }
}

// 首次預載與版本無損升級題庫
(function seedProfileWordsAndUpgrades() {
  if (!localStorage.getItem('rv9_fixed_seeded')) {
    ['JUSTIN', 'FUNG', 'MARCUS'].forEach(prof => {
      localStorage.setItem(`rv8_${prof}_words`, INITIAL_PROFILE_WORDS[prof]);
      localStorage.setItem(`rv8_${prof}_sel_units`, '["ALL"]');
    });
    localStorage.setItem('rv9_fixed_seeded', 'true');
  }
  if (!localStorage.getItem('rv10_4_0_seeded')) {
    localStorage.setItem('rv8_JUSTIN_words', INITIAL_PROFILE_WORDS.JUSTIN);
    localStorage.setItem('rv10_4_0_seeded', 'true');
  }
})();

let config = {
  playerName: localStorage.getItem('rv8_active_prof') || 'JUSTIN',
  mode: 'mix',
  diff: 'progressive',
  wordOrder: localStorage.getItem('rv8_word_order') || 'random',
  seqIndex: 0,
  voiceName: localStorage.getItem('rv94_voice_name') || 'en-GB-SoniaNeural',
  voiceRate: localStorage.getItem('rv94_voice_rate') || '-15%',
  parentPin: localStorage.getItem('rv8_parent_pin') || '1234',
  geminiKey: localStorage.getItem('rv7_gemini_key') || '',
  weaponId: 'cyber',
  armorId: 'shield',
  keys: 0,
  coins: 30,
  streak: 0,
  selectedUnits: ['ALL'],
  unitsMap: {}
};

let studyState = {
  mode: 'learn',
  currentUnit: null,
  idx: 0,
  syllables: [],
  buildStep: 0,
  isBlending: false
};

let match = {
  active: false,
  paused: false,
  round: 1,
  you: 0,
  totalWords: 0,
  bot: 0,
  queue: []
};

let round = {
  mode: 'sniper',
  diff: 'blanks',
  wordObj: null,
  slots: [],
  totalToFill: 1,
  filledCount: 0,
  nextIdx: 0,
  missingChunk: '',
  questionAnswered: false,
  cypherPhase: 'pick',
  laserEffect: 0,
  orbs: [],
  crates: [],
  medkits: [],
  bullets: [],
  particles: [],
  droppedLoot: [],
  texts: [],
  hintHighlightChar: null
};

let player = {
  x: 115, y: 330, r: 25,
  hp: 100, maxHp: 100,
  shield: 0, maxShield: 45,
  spawnProtected: true,
  inSafeZone: true,
  reviveUsed: false,
  droneTimer: 150,
  speed: 4.5,
  vx: 0, vy: 0,
  angle: 0,
  ammo: 0,
  portalCd: 0,
  speedBuff: 0,
  dashCd: 0
};

let rival = {
  x: 1060, y: 330, r: 27,
  hp: 100, maxHp: 100,
  speed: 2.2,
  angle: Math.PI,
  shielded: false,
  stun: 0,
  fireCd: 60,
  wp: { x: 900, y: 200 },
  stuckFrames: 0,
  enragedBoost: 0,
  profile: BOSS_PROFILES[0]
};

function getProfKey(suffix) {
  return `rv8_${config.playerName}_${suffix}`;
}

let toastTimer = null;
function showAutoSaveToast() {
  const t = document.getElementById('autoSaveToast');
  if (!t) return;
  t.style.opacity = '1';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 1200);
}

function loadProfileData(profName) {
  config.playerName = profName;
  config.seqIndex = 0;
  localStorage.setItem('rv8_active_prof', profName);

  document.querySelectorAll('.prof-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === profName);
  });
  const profLbl = document.getElementById('lobbyProfLabel');
  if (profLbl) profLbl.textContent = profName;

  config.keys = parseInt(localStorage.getItem(getProfKey('keys')) || '0', 10);
  config.coins = parseInt(localStorage.getItem(getProfKey('coins')) || '30', 10);
  config.streak = parseInt(localStorage.getItem(getProfKey('streak')) || '0', 10);
  config.weaponId = localStorage.getItem(getProfKey('weapon')) || 'cyber';
  config.armorId = localStorage.getItem(getProfKey('armor')) || 'shield';

  try {
    const uw = JSON.parse(localStorage.getItem(getProfKey('uw')) || '["cyber"]');
    WEAPONS.forEach(w => { w.unlocked = (w.id === 'cyber') || uw.includes(w.id); });
    const ua = JSON.parse(localStorage.getItem(getProfKey('ua')) || '["shield"]');
    ARMORS.forEach(a => { a.unlocked = (a.id === 'shield') || ua.includes(a.id); });
  } catch (e) {}

  const defaultForProf = INITIAL_PROFILE_WORDS[profName] || INITIAL_PROFILE_WORDS.JUSTIN;
  let rawWords = localStorage.getItem(getProfKey('words'));
  if (!rawWords || !rawWords.trim()) {
    rawWords = defaultForProf;
    localStorage.setItem(getProfKey('words'), rawWords);
  }
  parseUnitsFromText(rawWords);

  try {
    config.selectedUnits = JSON.parse(localStorage.getItem(getProfKey('sel_units')) || '["ALL"]');
  } catch (e) { config.selectedUnits = ['ALL']; }

  const firstUnit = Object.keys(config.unitsMap)[0] || 'Unit 1';
  studyState.currentUnit = firstUnit;
  studyState.idx = 0;

  if (typeof renderUnitSelectorBar === 'function') renderUnitSelectorBar();
  if (typeof renderGearLists === 'function') renderGearLists();
  if (typeof updateTopHUD === 'function') updateTopHUD();
  if (typeof updateWordOrderUI === 'function') updateWordOrderUI();
  if (typeof syncVoiceControlsUI === 'function') syncVoiceControlsUI();
  if (typeof renderStudyMode === 'function') renderStudyMode();
}

function saveProfileData(silent = false) {
  try {
    localStorage.setItem('rv8_active_prof', config.playerName);
    localStorage.setItem(getProfKey('uw'), JSON.stringify(WEAPONS.filter(w => w.unlocked).map(w => w.id)));
    localStorage.setItem(getProfKey('ua'), JSON.stringify(ARMORS.filter(a => a.unlocked).map(a => a.id)));
    localStorage.setItem(getProfKey('weapon'), config.weaponId);
    localStorage.setItem(getProfKey('armor'), config.armorId);
    localStorage.setItem(getProfKey('keys'), String(config.keys));
    localStorage.setItem(getProfKey('coins'), String(config.coins));
    localStorage.setItem(getProfKey('streak'), String(config.streak));
    localStorage.setItem(getProfKey('sel_units'), JSON.stringify(config.selectedUnits));
    if (!silent) showAutoSaveToast();
  } catch (e) {}
}

window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveProfileData(true); });
window.addEventListener('pagehide', () => saveProfileData(true));
window.addEventListener('beforeunload', () => saveProfileData(true));

function addCoins(amount) {
  const mult = config.armorId === 'coinchip' ? 2 : 1;
  config.coins += amount * mult;
  saveProfileData(true);
  if (typeof updateTopHUD === 'function') updateTopHUD();
}

function parseUnitsFromText(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const map = {};
  let currentUnit = 'Unit 1';

  for (const line of lines) {
    if (line.startsWith('[') && line.endsWith(']')) {
      currentUnit = line.slice(1, -1).trim() || 'Unit 1';
      if (!map[currentUnit]) map[currentUnit] = [];
      continue;
    }

    let splitIdx = -1;
    let parenDepth = 0;
    let bracketDepth = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '(' || line[i] === '（') parenDepth++;
      else if (line[i] === ')' || line[i] === '）') parenDepth = Math.max(0, parenDepth - 1);
      else if (line[i] === '[') bracketDepth++;
      else if (line[i] === ']') bracketDepth = Math.max(0, bracketDepth - 1);
      else if (parenDepth === 0 && bracketDepth === 0 && (line[i] === ',' || line[i] === '，' || line[i] === '\t')) {
        splitIdx = i;
        break;
      }
    }

    let rawEng = splitIdx !== -1 ? line.slice(0, splitIdx).trim() : line.trim();
    let meaning = splitIdx !== -1 ? line.slice(splitIdx + 1).trim() : '';
    let isSentenceBlank = false;
    let customSentence = '';

    const bracketMatch = rawEng.match(/\[([^\]]+)\]/);
    if (bracketMatch) {
      const ans = bracketMatch[1].trim();
      customSentence = rawEng.replace(/\[[^\]]+\]/g, '___').replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '').trim();
      rawEng = ans;
      isSentenceBlank = true;
    } else if (meaning.includes('___') || meaning.includes('____')) {
      customSentence = meaning.replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '').trim();
      meaning = customSentence;
      isSentenceBlank = true;
    }

    let parenNotes = [];
    let spellTarget = rawEng.replace(/\(([^)]+)\)/g, (_, inner) => {
      parenNotes.push(`(${inner})`);
      return '';
    });

    spellTarget = spellTarget.toLowerCase()
      .replace(/[\/\.]+/g, ' ')
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const pureLetters = spellTarget.replace(/[^a-z]/g, '');
    if (pureLetters.length >= 2) {
      if (!meaning) {
        meaning = BUILTIN_DICT[rawEng.toLowerCase()] || BUILTIN_DICT[pureLetters] || '（點擊🔊聽讀音）';
      }
      if (!isSentenceBlank && parenNotes.length > 0 && !meaning.includes('(')) {
        meaning += ' ' + parenNotes.join(' ');
      }

      const wordTts = rawEng.replace(/\([^)]*\)/g, '').replace(/\.\.\./g, '').replace(/\//g, ' or ').replace(/\s+/g, ' ').trim();
      const sentencePrompt = customSentence || SENTENCES_DB[spellTarget] || `Please choose the correct answer: ___.`;
      const sentenceTts = sentencePrompt
        .replace(/_{2,}/g, ' blank ')
        .replace(/\([^)]*\)/g, '')
        .replace(/（[^）]*）/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!map[currentUnit]) map[currentUnit] = [];
      map[currentUnit].push({
        word: spellTarget,
        pureWord: pureLetters,
        ttsText: isSentenceBlank ? sentenceTts : wordTts,
        wordTts: wordTts,
        sentencePrompt: sentencePrompt,
        sentenceTts: sentenceTts,
        meaning,
        isSentence: isSentenceBlank,
        unit: currentUnit
      });
    }
  }

  if (Object.keys(map).length === 0) {
    map['Unit 1'] = [{
      word: 'apple', pureWord: 'apple', ttsText: 'apple', wordTts: 'apple',
      sentencePrompt: 'An ___ a day keeps the doctor away.',
      sentenceTts: 'An blank a day keeps the doctor away.',
      meaning: '蘋果 (n.)', isSentence: false, unit: 'Unit 1'
    }];
  }
  config.unitsMap = map;
}
