/* =========================================================
   戰鬥模式 3：🌀 Cypher 次元駭客戰 (走位奪取句子核心 + 雷霆轟炸)
   ========================================================= */
function spawnCypherCores() {
  round.crates = [];
  const correct = round.wordObj.word;
  const pool = getActiveWordPool().map(w => w.word).filter(w => w !== correct);
  const shuffledPool = [...new Set(pool)].sort(() => Math.random() - 0.5);

  const distractors = shuffledPool.slice(0, 3);
  const fallbacks = ['arrive early', 'speak politely', 'a round face', 'go jogging'];
  for (const fb of fallbacks) {
    if (distractors.length >= 3) break;
    if (fb !== correct && !distractors.includes(fb)) distractors.push(fb);
  }

  const opts = [correct, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
  const pos = [
    { x: 430, y: 140 },
    { x: 430, y: 520 },
    { x: 730, y: 140 },
    { x: 730, y: 520 }
  ];
  opts.forEach((txt, i) => {
    const boxW = Math.max(135, txt.length * 11 + 36);
    round.crates.push({
      x: pos[i].x,
      y: pos[i].y,
      vx: (Math.random() - 0.5) * 1.1,
      vy: (Math.random() - 0.5) * 1.1,
      w: boxW,
      h: 52,
      r: 40,
      text: txt,
      isCorrect: txt === correct
    });
  });
}

function updateCypherCoresPhysics() {
  if (round.mode === 'cypher' && round.cypherPhase === 'pick') {
    for (let i = round.crates.length - 1; i >= 0; i--) {
      const c = round.crates[i];
      c.x += c.vx || 0;
      c.y += c.vy || 0;
      if (c.x < 330) { c.x = 330; c.vx = Math.abs(c.vx); }
      if (c.x > 880) { c.x = 880; c.vx = -Math.abs(c.vx); }
      if (c.y < 85) { c.y = 85; c.vy = Math.abs(c.vy); }
      if (c.y > ARENA.h - 85) { c.y = ARENA.h - 85; c.vy = -Math.abs(c.vy); }

      if (circleRect(player.x, player.y, player.r + 8, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h)) {
        hitCypherCore(c, i);
        break;
      }
    }
  }
  if (round.laserEffect > 0) round.laserEffect--;
}

function hitCypherCore(core, idx) {
  if (!match.active || round.cypherPhase !== 'pick') return;
  if (core.isCorrect) {
    sfx('portal');
    addCoins(8);
    round.cypherPhase = 'spell';
    round.crates = [];
    rival.stun = 180;
    buildSlots(round.wordObj.word, 'cypher', round.diff);
    updateWordHUD();
    const dock = document.getElementById('quickSpellDock');
    dock.classList.remove('hidden');
    const hintEl = document.querySelector('#quickSpellDock .dock-hint');
    if (hintEl) hintEl.textContent = '🌀 駭入解碼:';
    document.getElementById('ammoLabel').textContent = '頂部串字雷擊';
    renderQuickSpellDock();
    spawnParticles(player.x, player.y, '#22c55e', 24);
    addText(player.x, player.y - 42, '🌀 成功奪取核心！快在頂部完成串字召喚雷霆秒殺！', '#22c55e');
  } else {
    round.crates.splice(idx, 1);
    applyWrongLetterPenalty(`❌ 假數據核心 (${core.text})`, core.x, core.y);
  }
}

function triggerCypherLaserKill() {
  sfx('portal');
  addCoins(15);
  round.laserEffect = 35;
  rival.shielded = false;
  rival.hp = 0;
  document.getElementById('quickSpellDock').classList.add('hidden');
  spawnParticles(rival.x, rival.y, '#38bdf8', 32);
  spawnParticles(rival.x, rival.y, '#facc15', 24);
  addText(rival.x, rival.y - 45, '⚡ 次元雷霆轟炸！OVERDRIVE 秒殺！', '#38bdf8');
  speakCurrentWord();
  finishRound(true);
}
