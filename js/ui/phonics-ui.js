/* =========================================================
   UI 模組 2：Phonics 音節拆字溫習室互動邏輯
   ========================================================= */
function getStudyUnitWordList() {
  const unitNames = Object.keys(config.unitsMap);
  if (!studyState.currentUnit || !config.unitsMap[studyState.currentUnit]) {
    studyState.currentUnit = unitNames[0] || 'Unit 1';
  }
  return config.unitsMap[studyState.currentUnit] || [];
}

function renderStudyUnitBar() {
  const bar = document.getElementById('studyUnitBar');
  if (!bar) return;
  bar.innerHTML = '';
  const unitNames = Object.keys(config.unitsMap);

  if (!studyState.currentUnit || !config.unitsMap[studyState.currentUnit]) {
    studyState.currentUnit = unitNames[0];
  }

  unitNames.forEach(uName => {
    const chip = document.createElement('div');
    const isAct = (studyState.currentUnit === uName);
    chip.className = 'unit-chip' + (isAct ? ' active' : '');
    chip.textContent = `📘 ${uName.split(':')[0]} (${config.unitsMap[uName].length}題)`;
    chip.onclick = () => {
      studyState.currentUnit = uName;
      studyState.idx = 0;
      sfx('good');
      renderStudyMode();
      speakStudyWord('-12%');
    };
    bar.appendChild(chip);
  });

  const lbl = document.getElementById('studyUnitLabel');
  if (lbl && studyState.currentUnit) {
    lbl.textContent = `${studyState.currentUnit.split(':')[0]} (共 ${getStudyUnitWordList().length} 題)`;
  }
}

function renderStudyMode() {
  renderStudyUnitBar();
  const unitWords = getStudyUnitWordList();
  if (studyState.idx >= unitWords.length) studyState.idx = 0;
  const item = unitWords[studyState.idx] || unitWords[0];
  if (!item) return;

  studyState.syllables = getWordSyllableObjects(item.word);

  document.getElementById('studyIdxText').textContent = `${studyState.idx + 1} / ${unitWords.length}`;
  document.getElementById('studyWordMeaning').textContent = item.meaning;

  const wholePreview = document.getElementById('studyWholeWord');
  if (studyState.mode === 'build') {
    wholePreview.innerHTML = `<span style="color:var(--gold); font-size:22px;">🔊 點擊聽讀音 (隱藏生字)</span>`;
  } else {
    wholePreview.innerHTML = studyState.syllables.map((sylObj, i) => {
      const coloredSpan = `<span style="color:${COLOR_HEX[i % 5]};">${sylObj.t}</span>`;
      return sylObj.spaceAfter ? coloredSpan + `<span style="display:inline-block; width:14px;">&nbsp;</span>` : coloredSpan;
    }).join('');
  }

  const box = document.getElementById('studySyllablesBox');
  box.innerHTML = '';
  studyState.syllables.forEach((sylObj, i) => {
    const cIdx = i % 5;
    const block = document.createElement('div');
    block.className = `syl-block syl-c${cIdx}`;
    block.innerHTML = `
      <span>${sylObj.t}</span>
      <span class="syl-ipa-tag">🔊 /${sylObj.ipa || sylObj.t}/</span>
    `;
    block.onpointerdown = (e) => {
      e.preventDefault();
      speakSingleSyllable(sylObj, block);
    };
    box.appendChild(block);

    if (i < studyState.syllables.length - 1) {
      if (sylObj.spaceAfter) {
        const gap = document.createElement('div');
        gap.className = 'syl-word-gap';
        gap.title = '單字空格 (Space)';
        box.appendChild(gap);
      } else {
        const dot = document.createElement('span');
        dot.className = 'syl-dot';
        dot.textContent = '•';
        box.appendChild(dot);
      }
    }
  });

  if (studyState.mode === 'build') {
    initStudyBuildChallenge();
  }

  renderStudyChips(unitWords);
}

function initStudyBuildChallenge() {
  studyState.buildStep = 0;
  const slotsBox = document.getElementById('studyBuildSlots');
  const poolBox = document.getElementById('studyBuildPool');
  slotsBox.innerHTML = '';
  poolBox.innerHTML = '';

  studyState.syllables.forEach((s, i) => {
    const slot = document.createElement('div');
    slot.className = 'build-slot-empty';
    slot.textContent = `第 ${i + 1} 節`;
    if (s.spaceAfter) slot.style.marginRight = '14px';
    slotsBox.appendChild(slot);
  });

  const shuffled = studyState.syllables.map((sylObj, origIdx) => ({ sylObj, origIdx }))
    .sort(() => Math.random() - 0.5);

  shuffled.forEach(item => {
    const cIdx = item.origIdx % 5;
    const btn = document.createElement('div');
    btn.className = `syl-block syl-c${cIdx}`;
    btn.style.fontSize = '26px';
    btn.style.padding = '10px 16px';
    btn.textContent = item.sylObj.t;
    btn.onpointerdown = (e) => {
      e.preventDefault();
      handleStudyBuildTap(item, btn);
    };
    poolBox.appendChild(btn);
  });
}

async function handleStudyBuildTap(item, btnEl) {
  const expectedObj = studyState.syllables[studyState.buildStep];
  if (item.sylObj.t === expectedObj.t) {
    speakSingleSyllable(item.sylObj, null);
    btnEl.style.visibility = 'hidden';

    const slotEls = document.getElementById('studyBuildSlots').children;
    const targetSlot = slotEls[studyState.buildStep];
    const cIdx = studyState.buildStep % 5;
    targetSlot.className = `syl-block syl-c${cIdx}`;
    targetSlot.style.fontSize = '26px';
    targetSlot.style.padding = '8px 16px';
    targetSlot.style.minWidth = '68px';
    targetSlot.textContent = item.sylObj.t;

    studyState.buildStep++;
    if (studyState.buildStep >= studyState.syllables.length) {
      const wholePreview = document.getElementById('studyWholeWord');
      wholePreview.innerHTML = studyState.syllables.map((sylObj, i) => {
        const coloredSpan = `<span style="color:${COLOR_HEX[i % 5]};">${sylObj.t}</span>`;
        return sylObj.spaceAfter ? coloredSpan + `<span style="display:inline-block; width:14px;">&nbsp;</span>` : coloredSpan;
      }).join('');
      setTimeout(() => speakStudyWord('-10%'), 450);
    }
  } else {
    sfx('bad');
    btnEl.style.transform = 'translateX(-6px)';
    setTimeout(() => btnEl.style.transform = 'translateX(6px)', 80);
    setTimeout(() => btnEl.style.transform = 'none', 160);
  }
}

function setStudyMode(m) {
  studyState.mode = m;
  document.getElementById('tabStudy').classList.toggle('active', m === 'learn');
  document.getElementById('tabBuild').classList.toggle('active', m === 'build');
  document.getElementById('studyLearnArea').classList.toggle('hidden', m !== 'learn');
  document.getElementById('studyBuildArea').classList.toggle('hidden', m !== 'build');
  renderStudyMode();
}

function prevStudyWord() {
  const unitWords = getStudyUnitWordList();
  studyState.idx = (studyState.idx - 1 + unitWords.length) % unitWords.length;
  renderStudyMode();
  speakStudyWord('-12%');
}

function nextStudyWord() {
  const unitWords = getStudyUnitWordList();
  studyState.idx = (studyState.idx + 1) % unitWords.length;
  renderStudyMode();
  speakStudyWord('-12%');
}

function renderStudyChips(unitWords) {
  const grid = document.getElementById('studyWordChips');
  grid.innerHTML = '';
  unitWords.forEach((item, i) => {
    const chip = document.createElement('div');
    chip.className = 'w-chip' + (i === studyState.idx ? ' active' : '');
    chip.textContent = studyState.mode === 'build' ? `第 ${i + 1} 題` : item.word;
    chip.onclick = () => {
      studyState.idx = i;
      renderStudyMode();
      speakStudyWord('-12%');
    };
    grid.appendChild(chip);
  });
}

async function speakSingleSyllable(sylObj, blockEl) {
  if (blockEl) {
    document.querySelectorAll('#studySyllablesBox .syl-block').forEach(b => b.classList.remove('speaking'));
    blockEl.classList.add('speaking');
    setTimeout(() => blockEl.classList.remove('speaking'), 550);
  }
  const ssmlContent = sylObj.ipa
    ? `<phoneme alphabet="ipa" ph="${sylObj.ipa}">${sylObj.t}</phoneme>`
    : (sylObj.ph || sylObj.t);
  await speakAzureSSML(ssmlContent, '-18%', sylObj.ph || sylObj.t);
}

async function speakStudyWord(rate = '-12%') {
  const unitWords = getStudyUnitWordList();
  const item = unitWords[studyState.idx] || unitWords[0];
  if (!item) return;
  const blocks = document.querySelectorAll('#studySyllablesBox .syl-block');
  blocks.forEach(b => b.classList.add('speaking'));
  await speakText(item.wordTts || item.word, rate);
  blocks.forEach(b => b.classList.remove('speaking'));
}

async function playStudyBlend() {
  if (studyState.isBlending) return;
  studyState.isBlending = true;

  const blocks = document.querySelectorAll('#studySyllablesBox .syl-block');
  for (let i = 0; i < studyState.syllables.length; i++) {
    const sylObj = studyState.syllables[i];
    const el = blocks[i];
    if (el) el.classList.add('speaking');

    const ssmlContent = sylObj.ipa
      ? `<phoneme alphabet="ipa" ph="${sylObj.ipa}">${sylObj.t}</phoneme>`
      : (sylObj.ph || sylObj.t);
    await speakAzureSSML(ssmlContent, '-18%', sylObj.ph || sylObj.t);
    await new Promise(r => setTimeout(r, 150));
    if (el) el.classList.remove('speaking');
  }

  await new Promise(r => setTimeout(r, 200));
  await speakStudyWord('-12%');
  studyState.isBlending = false;
}
