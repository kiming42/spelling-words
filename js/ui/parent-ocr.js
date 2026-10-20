/* =========================================================
   UI 模組 3：家長題庫管理、備份還原與相片智能 OCR
   ========================================================= */
let rawUploadedImage = null;
let currentRotationDeg = 0;

function clearWordListContent() {
  if (!confirm(`🧹 確定要清空【${config.playerName}】目前的題庫文字框嗎？`)) return;
  const textarea = document.getElementById('wordInput');
  textarea.value = `[Unit 1]\n`;
  textarea.focus();
  document.getElementById('ocrStatusText').textContent = '✨ 已清空！請直接貼上新英文生字。';
  sfx('good');
}

function restorePlayerDefaultWords() {
  if (!confirm(`🔄 確定要還原【${config.playerName}】的預設專屬題庫嗎？`)) return;
  const def = INITIAL_PROFILE_WORDS[config.playerName] || INITIAL_PROFILE_WORDS.JUSTIN;
  document.getElementById('wordInput').value = def;
  document.getElementById('ocrStatusText').textContent = `✅ 已載入預設題庫，請按下方「💾 儲存題庫與設定」。`;
  sfx('good');
}

function exportFullSaveBackup() {
  saveProfileData(true);
  const fullData = {
    prof: config.playerName,
    keys: config.keys,
    coins: config.coins,
    streak: config.streak,
    uw: WEAPONS.filter(w => w.unlocked).map(w => w.id),
    ua: ARMORS.filter(a => a.unlocked).map(a => a.id),
    words: document.getElementById('wordInput').value.trim()
  };
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(fullData))));
  navigator.clipboard.writeText(code).then(() => {
    sfx('good');
    alert(`✅ 已複製【${config.playerName}】的完整進度備份碼！`);
  }).catch(() => {
    prompt('請複製以下備份碼保存：', code);
  });
}

function importFullSaveBackup() {
  const code = prompt('請貼上之前匯出的「完整進度備份碼」：');
  if (!code || !code.trim()) return;
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    config.keys = data.keys ?? config.keys;
    config.coins = data.coins ?? config.coins;
    config.streak = data.streak ?? config.streak;
    if (Array.isArray(data.uw)) WEAPONS.forEach(w => { w.unlocked = (w.id === 'cyber') || data.uw.includes(w.id); });
    if (Array.isArray(data.ua)) ARMORS.forEach(a => { a.unlocked = (a.id === 'shield') || data.ua.includes(a.id); });
    if (data.words) {
      localStorage.setItem(getProfKey('words'), data.words);
      document.getElementById('wordInput').value = data.words;
      parseUnitsFromText(data.words);
    }
    saveProfileData();
    renderUnitSelectorBar();
    renderGearLists();
    updateTopHUD();
    sfx('portal');
    alert(`🎉 成功還原【${config.playerName}】的進度與題庫！`);
  } catch (e) {
    sfx('bad');
    alert('❌ 備份碼格式不正確！');
  }
}

function parentAddBonusKeys() {
  config.keys += 2;
  config.coins += 50;
  saveProfileData();
  updateTopHUD();
  renderGearLists();
  sfx('portal');
  alert(`🎁 已為【${config.playerName}】補發 +2 把鎖匙 🔑 及 +50 金幣 💰！`);
}

async function autoTranslateMissingChinese() {
  const textarea = document.getElementById('wordInput');
  const lines = textarea.value.split('\n');
  const btn = document.getElementById('btnAutoTrans');
  btn.textContent = '⏳ 翻譯中...';
  btn.disabled = true;

  const updatedLines = [];
  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line || (line.startsWith('[') && line.endsWith(']'))) {
      updatedLines.push(rawLine);
      continue;
    }
    let hasComma = false;
    let pDepth = 0;
    for (let c of line) {
      if (c === '(') pDepth++;
      else if (c === ')') pDepth = Math.max(0, pDepth - 1);
      else if (pDepth === 0 && (c === ',' || c === '，')) hasComma = true;
    }

    if (!hasComma) {
      const cleanQuery = line.replace(/\.\.\./g, ' ').trim();
      if (BUILTIN_DICT[cleanQuery.toLowerCase()]) {
        updatedLines.push(`${line}, ${BUILTIN_DICT[cleanQuery.toLowerCase()]}`);
      } else {
        try {
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-TW&dt=t&q=${encodeURIComponent(cleanQuery)}`);
          const data = await res.json();
          const trans = (data && data[0] && data[0][0] && data[0][0][0]) ? data[0][0][0] : '生字/片語';
          updatedLines.push(`${line}, ${trans}`);
        } catch (e) {
          updatedLines.push(`${line}, (聽讀音串字)`);
        }
      }
    } else {
      updatedLines.push(rawLine);
    }
  }

  textarea.value = updatedLines.join('\n');
  btn.textContent = '✅ 已補全中文！';
  setTimeout(() => {
    btn.textContent = '🌐 自動補全中文';
    btn.disabled = false;
  }, 1800);
  sfx('good');
}

function insertNewUnitTemplate() {
  const textarea = document.getElementById('wordInput');
  const count = (textarea.value.match(/\[Unit/gi) || []).length + 1;
  textarea.value += `\n\n[Unit ${count}]\n`;
  textarea.scrollTop = textarea.scrollHeight;
}

function executeFullReset() {
  if (!confirm(`⚠️ 確定要清除【${config.playerName}】的所有連勝、鎖匙、金幣與已解鎖裝備嗎？`)) return;
  sfx('portal');
  config.keys = 0; config.coins = 30; config.streak = 0;
  config.weaponId = 'cyber'; config.armorId = 'shield';
  WEAPONS.forEach(w => { w.unlocked = (w.id === 'cyber'); });
  ARMORS.forEach(a => { a.unlocked = (a.id === 'shield'); });
  saveProfileData();
  updateTopHUD();
  renderGearLists();
  alert(`✅ 已重設【${config.playerName}】的所有戰績與裝備！`);
}

function saveSettings() {
  const def = INITIAL_PROFILE_WORDS[config.playerName] || INITIAL_PROFILE_WORDS.JUSTIN;
  const raw = document.getElementById('wordInput').value.trim() || def;
  localStorage.setItem(getProfKey('words'), raw);
  parseUnitsFromText(raw);
  config.selectedUnits = ['ALL'];
  config.seqIndex = 0;
  studyState.currentUnit = Object.keys(config.unitsMap)[0] || 'Unit 1';
  studyState.idx = 0;
  renderUnitSelectorBar();

  config.geminiKey = document.getElementById('geminiKeyInput').value.trim();
  config.parentPin = document.getElementById('parentPinInput').value.trim() || '1234';

  localStorage.setItem('rv7_gemini_key', config.geminiKey);
  localStorage.setItem('rv8_parent_pin', config.parentPin);

  saveProfileData();
  switchDashTab('play');
  sfx('good');
}

function triggerPhotoInput() {
  document.getElementById('ocrFileInput').click();
}

function openPhotoRotateModal(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      rawUploadedImage = img;
      currentRotationDeg = 0;
      renderRotatedPreview();
      document.getElementById('modalOcrProgress').textContent = '請確認上方文字是「打橫正常方向」，然後撳開始識別';
      document.getElementById('photoRotateModal').classList.remove('hidden');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function closePhotoRotateModal() {
  document.getElementById('photoRotateModal').classList.add('hidden');
}

function rotatePreviewImage(deltaDeg) {
  currentRotationDeg = (currentRotationDeg + deltaDeg + 360) % 360;
  renderRotatedPreview();
  sfx('good');
}

function renderRotatedPreview() {
  if (!rawUploadedImage) return;
  const pCanvas = document.getElementById('ocrPreviewCanvas');
  const pCtx = pCanvas.getContext('2d');
  const maxDim = 1200;
  let w = rawUploadedImage.width, h = rawUploadedImage.height;
  if (Math.max(w, h) > maxDim) {
    const r = maxDim / Math.max(w, h);
    w = Math.round(w * r); h = Math.round(h * r);
  }
  if (currentRotationDeg === 90 || currentRotationDeg === 270) {
    pCanvas.width = h; pCanvas.height = w;
  } else {
    pCanvas.width = w; pCanvas.height = h;
  }
  pCtx.save();
  pCtx.fillStyle = '#ffffff';
  pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
  pCtx.translate(pCanvas.width / 2, pCanvas.height / 2);
  pCtx.rotate((currentRotationDeg * Math.PI) / 180);
  pCtx.drawImage(rawUploadedImage, -w / 2, -h / 2, w, h);
  pCtx.restore();
}

function getPreprocessedCanvasForOCR() {
  const srcCanvas = document.getElementById('ocrPreviewCanvas');
  const outCanvas = document.createElement('canvas');
  outCanvas.width = srcCanvas.width; outCanvas.height = srcCanvas.height;
  const oCtx = outCanvas.getContext('2d');
  oCtx.drawImage(srcCanvas, 0, 0);
  const imgData = oCtx.getImageData(0, 0, outCanvas.width, outCanvas.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = gray < 145 ? 0 : 255;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  oCtx.putImageData(imgData, 0, 0);
  return outCanvas;
}

async function runSmartOCR() {
  const progEl = document.getElementById('modalOcrProgress');
  const btn = document.getElementById('btnRunOCR');
  btn.disabled = true;
  const pCanvas = document.getElementById('ocrPreviewCanvas');
  const gemKey = document.getElementById('geminiKeyInput').value.trim() || config.geminiKey;
  try {
    let extractedWords = [];
    if (gemKey) {
      progEl.textContent = '🌟 正在使用 Gemini AI 視覺引擎識別表格生字...';
      const base64Data = pCanvas.toDataURL('image/jpeg', 0.85).split(',')[1];
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${gemKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Extract all vocabulary words or phrases from this worksheet. Return ONLY lines in format: english_word_or_phrase, 繁體中文解釋.' },
              { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
            ]
          }]
        })
      });
      if (resp.ok) {
        const json = await resp.json();
        const aiText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (aiText.trim()) {
          appendRecognizedBlock(aiText.trim(), 'AI 相片匯入');
          btn.disabled = false;
          closePhotoRotateModal();
          return;
        }
      }
    }
    progEl.textContent = '🌐 正在透過雲端表格 OCR 引擎識別生字 (1/2)...';
    try {
      const base64Img = pCanvas.toDataURL('image/jpeg', 0.82);
      const formData = new FormData();
      formData.append('base64Image', base64Img);
      formData.append('language', 'eng');
      formData.append('isTable', 'true');
      formData.append('OCREngine', '2');
      const ocrRes = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: { 'apikey': 'helloworld' },
        body: formData
      });
      if (ocrRes.ok) {
        const ocrJson = await ocrRes.json();
        const parsedTxt = ocrJson?.ParsedResults?.[0]?.ParsedText || '';
        extractedWords = filterValidEnglishWords(parsedTxt);
      }
    } catch (cloudErr) {}
    if (extractedWords.length < 3) {
      progEl.textContent = '🔍 正在使用本地高對比增強引擎識別生字 (2/2)...';
      const cleanCanvas = getPreprocessedCanvasForOCR();
      const res = await Tesseract.recognize(cleanCanvas, 'eng');
      const localWords = filterValidEnglishWords(res.data.text || '');
      extractedWords = [...new Set([...extractedWords, ...localWords])];
    }
    if (extractedWords.length === 0) {
      progEl.textContent = '⚠️ 未能識別文字，請檢查相片是否已撳「↻ 右轉 90°」擺正！';
      btn.disabled = false;
      return;
    }
    progEl.textContent = `✅ 成功識別 ${extractedWords.length} 個生字！正在自動配對中文解釋...`;
    appendRecognizedBlock(extractedWords.join('\n'), `相片匯入 (${extractedWords.length}字)`);
    await autoTranslateMissingChinese();
    closePhotoRotateModal();
  } catch (err) {
    progEl.textContent = '❌ 識別發生錯誤，請重試。';
  }
  btn.disabled = false;
}

function filterValidEnglishWords(rawText) {
  const stopWords = new Set([
    'you', 'are', 'not', 'required', 'spell', 'the', 'words', 'wsr', 'wwsr',
    'and', 'for', 'but', 'all', 'can', 'her', 'was', 'one', 'our', 'out',
    'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
    'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say',
    'she', 'too', 'use', 'unit', 'page', 'name', 'class', 'date', 'module'
  ]);
  const matches = rawText.match(/[a-zA-Z]+(?:-[a-zA-Z]+)?/g) || [];
  const unique = [];
  matches.forEach(w => {
    const clean = w.toLowerCase();
    if (clean.length >= 3 && clean.length <= 18 && !stopWords.has(clean) && !unique.includes(clean)) {
      unique.push(clean);
    }
  });
  return unique;
}

function appendRecognizedBlock(linesText, titleLabel) {
  const textarea = document.getElementById('wordInput');
  const unitNum = (textarea.value.match(/\[Unit/gi) || []).length + 1;
  textarea.value = textarea.value.trim() + `\n\n[Unit ${unitNum}: ${titleLabel}]\n` + linesText;
  document.getElementById('ocrStatusText').textContent = `🎉 已匯入 Unit ${unitNum}！請按下方「💾 儲存題庫」。`;
  sfx('portal');
}
