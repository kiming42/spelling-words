/* =========================================================
   核心服務 2：Azure TTS 語音合成、快取與 WebAudio 音效
   ========================================================= */
const EMBEDDED_AZURE_KEY = '7rqTKvFwVlRmh84vQ8bQDNgPZjitlh44KMkom9ZMOAFYMWASiWngJQQJ99CIAC3pKaRXJ3w3AAAYACOGJ8DS';
const EMBEDDED_AZURE_REGION = 'eastasia';

const sharedAudioPlayer = new Audio();
const ttsAudioCache = new Map();

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;

window.addEventListener('pointerdown', () => {
  try {
    if (actx && actx.state === 'suspended') actx.resume();
  } catch (e) {}
}, { passive: true });

function speakWebSpeechFallback(text, rateStr = '-15%') {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const activeVoice = config.voiceName || 'en-GB-SoniaNeural';
      u.lang = activeVoice.startsWith('en-GB') ? 'en-GB' : 'en-US';
      const rateMap = { '-38%': 0.6, '-35%': 0.62, '-20%': 0.78, '-18%': 0.8, '-5%': 0.94, '+10%': 1.1 };
      u.rate = rateMap[rateStr] || 0.85;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    } else {
      resolve();
    }
  });
}

function speakAzureSSML(innerSSML, rate = '-15%', fallbackText = '') {
  const activeVoice = config.voiceName || 'en-GB-SoniaNeural';
  const xmlLang = activeVoice.startsWith('en-GB') ? 'en-GB' : 'en-US';
  const cacheKey = `${activeVoice}|${rate}|${innerSSML}`;

  return new Promise(async (resolve) => {
    try {
      sharedAudioPlayer.pause();

      if (ttsAudioCache.has(cacheKey)) {
        sharedAudioPlayer.src = ttsAudioCache.get(cacheKey);
        sharedAudioPlayer.onended = () => resolve();
        sharedAudioPlayer.onerror = () => resolve();
        await sharedAudioPlayer.play();
        return;
      }

      const ssml = `<speak version='1.0' xml:lang='${xmlLang}'><voice name='${activeVoice}'><prosody rate='${rate}'>${innerSSML}</prosody></voice></speak>`;
      const res = await fetch(`https://${EMBEDDED_AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': EMBEDDED_AZURE_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 100) {
          const objUrl = URL.createObjectURL(blob);
          ttsAudioCache.set(cacheKey, objUrl);
          sharedAudioPlayer.src = objUrl;
          sharedAudioPlayer.onended = () => resolve();
          sharedAudioPlayer.onerror = () => resolve();
          await sharedAudioPlayer.play();
          return;
        }
      }
    } catch (e) {}

    const plain = fallbackText || innerSSML.replace(/<[^>]+>/g, '');
    await speakWebSpeechFallback(plain, rate);
    resolve();
  });
}

async function speakText(text, customRate = null) {
  if (!text) return;
  const activeRate = customRate || config.voiceRate || '-15%';
  await speakAzureSSML(text, activeRate, text);
}

function speakCurrentWord(overrideRate = null) {
  if (!round.wordObj) return;
  if ((round.mode === 'cypher' || round.wordObj.isSentence) && round.nextIdx !== -1) {
    speakText(round.wordObj.sentenceTts || round.wordObj.ttsText, overrideRate);
  } else {
    speakText(round.wordObj.wordTts || round.wordObj.word, overrideRate);
  }
}

function sfx(type) {
  try {
    if (!actx) actx = new AudioCtx();
    if (actx.state === 'suspended') actx.resume();
    const osc = actx.createOscillator();
    const g = actx.createGain();
    osc.connect(g); g.connect(actx.destination);
    const now = actx.currentTime;
    if (type === 'shoot') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
      g.gain.setValueAtTime(0.14, now);
      g.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'good') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.setValueAtTime(920, now + 0.06);
      g.gain.setValueAtTime(0.22, now);
      g.gain.linearRampToValueAtTime(0.01, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
    } else if (type === 'bad') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(95, now + 0.18);
      g.gain.setValueAtTime(0.26, now);
      g.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'portal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.22);
      g.gain.setValueAtTime(0.2, now);
      g.gain.linearRampToValueAtTime(0.01, now + 0.22);
      osc.start(now); osc.stop(now + 0.22);
    }
  } catch (e) {}
}
