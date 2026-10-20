/* =========================================================
   UI 模組 1：主大廳、軍械庫商店、語音控制與家長密碼鎖
   ========================================================= */
let enteredPin = '';
let pinTargetAction = '';

function switchDashTab(tabName) {
  document.getElementById('tabBtnPlay').classList.toggle('active', tabName === 'play');
  document.getElementById('tabBtnArmory').classList.toggle('active', tabName === 'armory');
  document.getElementById('tabBtnPhonics').classList.toggle('active', tabName === 'phonics');
  document.getElementById('tabBtnParent').classList.toggle('active', tabName === 'parent');

  document.getElementById('tabContentPlay').classList.toggle('hidden', tabName !== 'play');
  document.getElementById('tabContentArmory').classList.toggle('hidden', tabName !== 'armory');
  document.getElementById('tabContentPhonics').classList.toggle('hidden', tabName !== 'phonics');
  document.getElementById('tabContentParent').classList.toggle('hidden', tabName !== 'parent');

  if (tabName === 'phonics') {
    renderStudyMode();
  }
  if (tabName === 'parent') {
    document.getElementById('parentProfName').textContent = config.playerName;
    const def = INITIAL_PROFILE_WORDS[config.playerName] || INITIAL_PROFILE_WORDS.JUSTIN;
    document.getElementById('wordInput').value = localStorage.getItem(getProfKey('words')) || def;
    document.getElementById('geminiKeyInput').value = config.geminiKey;
    document.getElementById('parentPinInput').value = config.parentPin;
  }
}

function requestParentPin(action) {
  pinTargetAction = action;
  enteredPin = '';
  updatePinDots();
  document.getElementById('pinModal').classList.remove('hidden');
}

function closePinModal() {
  document.getElementById('pinModal').classList.add('hidden');
}

function tapPin(digit) {
  if (enteredPin.length < 4) {
    enteredPin += digit;
    sfx('good');
    updatePinDots();
    if (enteredPin.length === 4) setTimeout(verifyPin, 120);
  }
}

function clearPin() {
  enteredPin = '';
  updatePinDots();
}

function updatePinDots() {
  document.querySelectorAll('#pinDots .pin-dot').forEach((d, idx) => {
    d.classList.toggle('filled', idx < enteredPin.length);
  });
}

function verifyPin() {
  if (enteredPin === config.parentPin) {
    sfx('portal');
    closePinModal();
    if (pinTargetAction === 'parentTab') switchDashTab('parent');
  } else {
    sfx('bad');
    enteredPin = '';
    updatePinDots();
    alert('❌ 家長密碼錯誤！(預設密碼為 1234)');
  }
}

function setWordOrder(order) {
  config.wordOrder = order;
  config.seqIndex = 0;
  localStorage.setItem('rv8_word_order', order);
  updateWordOrderUI();
  sfx('good');
}

function updateWordOrderUI() {
  document.getElementById('orderBtnRandom').classList.toggle('active', config.wordOrder === 'random');
  document.getElementById('orderBtnSeq').classList.toggle('active', config.wordOrder === 'sequential');
}

function getActiveWordPool() {
  const unitNames = Object.keys(config.unitsMap);
  if (config.selectedUnits.includes('ALL') || config.selectedUnits.length === 0) {
    return unitNames.flatMap(u => config.unitsMap[u]);
  }
  let pool = [];
  config.selectedUnits.forEach(u => {
    if (config.unitsMap[u]) pool = pool.concat(config.unitsMap[u]);
  });
  return pool.length > 0 ? pool : unitNames.flatMap(u => config.unitsMap[u]);
}

function renderUnitSelectorBar() {
  const bar = document.getElementById('unitSelectBar');
  if (!bar) return;
  bar.innerHTML = '';
  const unitNames = Object.keys(config.unitsMap);

  const allChip = document.createElement('div');
  const isAll = config.selectedUnits.includes('ALL');
  allChip.className = 'unit-chip' + (isAll ? ' active' : '');
  const totalWords = unitNames.reduce((acc, u) => acc + config.unitsMap[u].length, 0);
  allChip.textContent = `🌟 全部課題 (${totalWords}題)`;
  allChip.onclick = () => {
    config.selectedUnits = ['ALL'];
    config.seqIndex = 0;
    saveProfileData();
    renderUnitSelectorBar();
    sfx('good');
  };
  bar.appendChild(allChip);

  unitNames.forEach(uName => {
    const chip = document.createElement('div');
    const active = !isAll && config.selectedUnits.includes(uName);
    chip.className = 'unit-chip' + (active ? ' active' : '');
    chip.textContent = `📘 ${uName.split(':')[0]} (${config.unitsMap[uName].length}題)`;
    chip.onclick = () => {
      if (config.selectedUnits.includes('ALL')) {
        config.selectedUnits = [uName];
      } else {
        const idx = config.selectedUnits.indexOf(uName);
        if (idx >= 0) {
          config.selectedUnits.splice(idx, 1);
          if (config.selectedUnits.length === 0) config.selectedUnits = ['ALL'];
        } else {
          config.selectedUnits.push(uName);
        }
      }
      config.seqIndex = 0;
      saveProfileData();
      renderUnitSelectorBar();
      sfx('good');
    };
    bar.appendChild(chip);
  });

  const activePool = getActiveWordPool();
  document.getElementById('activePoolCountText').textContent = `目標：完成全部 ${activePool.length} 題即通關`;
  const startBtn = document.getElementById('btnStartChallenge');
  if (startBtn) {
    startBtn.textContent = `🚀 開始挑戰所選題庫 (共 ${activePool.length} 題)`;
  }
}

function renderGearLists() {
  const wBox = document.getElementById('weaponList');
  if (!wBox) return;
  wBox.innerHTML = '';
  WEAPONS.forEach(w => {
    const d = document.createElement('div');
    d.className = 'gear-card' + (config.weaponId === w.id ? ' active' : '');
    const priceTag = w.unlocked ? '✅ 已裝備/擁有' : `🔒 需要 🔑${w.costKey}`;
    d.innerHTML = `<div class="g-name">${w.name}</div>
      <div class="g-desc">${w.desc}</div>
      <div class="g-cost" style="color:${w.unlocked ? '#22c55e' : '#facc15'};">${priceTag}</div>`;
    d.onclick = () => {
      if (w.unlocked) {
        config.weaponId = w.id; saveProfileData(); renderGearLists(); sfx('good');
      } else if (config.keys >= w.costKey) {
        config.keys -= w.costKey; w.unlocked = true; config.weaponId = w.id;
        saveProfileData(); updateTopHUD(); renderGearLists(); sfx('portal');
      } else {
        sfx('bad');
      }
    };
    wBox.appendChild(d);
  });

  const aBox = document.getElementById('armorList');
  if (!aBox) return;
  aBox.innerHTML = '';
  ARMORS.forEach(a => {
    const d = document.createElement('div');
    d.className = 'gear-card' + (config.armorId === a.id ? ' active' : '');
    const priceTag = a.unlocked ? '✅ 已裝備/擁有' : `🔒 需要 🔑${a.costKey}`;
    d.innerHTML = `<div class="g-name">${a.name}</div>
      <div class="g-desc">${a.desc}</div>
      <div class="g-cost" style="color:${a.unlocked ? '#22c55e' : '#facc15'};">${priceTag}</div>`;
    d.onclick = () => {
      if (a.unlocked) {
        config.armorId = a.id; saveProfileData(); renderGearLists(); sfx('good');
      } else if (config.keys >= a.costKey) {
        config.keys -= a.costKey; a.unlocked = true; config.armorId = a.id;
        saveProfileData(); updateTopHUD(); renderGearLists(); sfx('portal');
      } else {
        sfx('bad');
      }
    };
    aBox.appendChild(d);
  });
}

function setMode(m, el) {
  config.mode = m;
  document.querySelectorAll('#modeRow .mode-card').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  sfx('good');
}

function setDiff(d, el) {
  config.diff = d;
  document.querySelectorAll('#diffRow .seg-btn').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  sfx('good');
}

function changeVoice(newVoice) {
  config.voiceName = newVoice;
  localStorage.setItem('rv94_voice_name', newVoice);
  syncVoiceControlsUI();
  previewVoiceSample();
}

function setVoiceSpeed(newRate) {
  config.voiceRate = newRate;
  localStorage.setItem('rv94_voice_rate', newRate);
  syncVoiceControlsUI();
  previewVoiceSample();
}

function syncVoiceControlsUI() {
  const lv = document.getElementById('lobbyVoiceSelect');
  const pv = document.getElementById('pauseVoiceSelect');
  if (lv) lv.value = config.voiceName;
  if (pv) pv.value = config.voiceName;

  document.querySelectorAll('#lobbySpeedGroup .seg-btn, #pauseSpeedGroup .seg-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-spd') === config.voiceRate);
  });
}

function previewVoiceSample() {
  const samplePool = getActiveWordPool();
  const sampleWord = (round.wordObj && match.active)
    ? (round.wordObj.ttsText || round.wordObj.word)
    : (samplePool[0] ? samplePool[0].ttsText : 'Welcome to Rivals Word Arena');
  speakText(sampleWord);
}

function switchProfile(profName) {
  saveProfileData(true);
  sfx('good');
  loadProfileData(profName);
  document.getElementById('parentProfName').textContent = config.playerName;
  const def = INITIAL_PROFILE_WORDS[profName] || INITIAL_PROFILE_WORDS.JUSTIN;
  document.getElementById('wordInput').value = localStorage.getItem(getProfKey('words')) || def;
}

function openLobby() {
  match.active = false;
  match.paused = false;
  saveProfileData(true);
  switchDashTab('play');
  updateTopHUD();
  renderUnitSelectorBar();
  renderGearLists();
  syncVoiceControlsUI();
  document.getElementById('pauseModal').classList.add('hidden');
  document.getElementById('lobbyModal').classList.remove('hidden');
}
