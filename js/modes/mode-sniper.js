/* =========================================================
   戰鬥模式 1：🎯 Sniper 字母狙擊手模式
   ========================================================= */
function spawnSniperOrbs() {
  round.orbs = [];
  round.hintHighlightChar = null;
  if (round.nextIdx === -1) return;
  const targetChar = round.slots[round.nextIdx].char;
  const pool = [targetChar];
  for (let i = round.nextIdx + 1; i < round.slots.length; i++) {
    const ch = round.slots[i].char;
    if (!round.slots[i].filled && ch !== ' ' && !pool.includes(ch) && pool.length < 3) {
      pool.push(ch);
    }
  }
  const alpha = 'abcdefghijklmnopqrstuvwxyz';
  while (pool.length < 5) {
    const c = alpha[Math.floor(Math.random() * 26)];
    if (!pool.includes(c)) pool.push(c);
  }
  pool.forEach((ch, i) => {
    round.orbs.push({
      x: 430 + (i % 3) * 155,
      y: 120 + Math.floor(i / 3) * 380 + (Math.random() * 30 - 15),
      vx: (Math.random() - 0.5) * 2.3,
      vy: (Math.random() - 0.5) * 2.3,
      r: 26,
      char: ch
    });
  });
}

function updateSniperOrbsPhysics() {
  if (round.mode !== 'sniper') return;
  for (const o of round.orbs) {
    o.x += o.vx;
    o.y += o.vy;
    if (o.x < 340) { o.x = 340; o.vx = Math.abs(o.vx); }
    if (o.x > ARENA.w - 70) { o.x = ARENA.w - 70; o.vx = -Math.abs(o.vx); }
    if (o.y < o.r + 25) { o.y = o.r + 25; o.vy = Math.abs(o.vy); }
    if (o.y > ARENA.h - 60) { o.y = ARENA.h - 60; o.vy = -Math.abs(o.vy); }
  }
}

function hitSniperOrb(orb) {
  if (!match.active || round.nextIdx === -1) return;
  const expected = round.slots[round.nextIdx].char;
  if (orb.char === expected) {
    sfx('good');
    addCoins(4);
    round.slots[round.nextIdx].filled = true;
    round.filledCount++;

    const hasMoreLetters = findNextSlot();
    updateWordHUD();

    if (!hasMoreLetters) {
      addCoins(12);
      rival.hp = 0;
      spawnParticles(rival.x, rival.y, '#facc15', 24);
      addText(rival.x, rival.y - 38, '💥 完成串字！終極爆頭秒殺！', '#facc15');
      speakCurrentWord();
      finishRound(true);
    } else {
      const stepDmg = Math.floor(80 / Math.max(1, round.totalToFill));
      rival.hp = Math.max(15, rival.hp - stepDmg);
      spawnParticles(rival.x, rival.y, '#38bdf8', 14);
      addText(rival.x, rival.y - 34, `🎯 命中字母 (${orb.char.toUpperCase()}) -${stepDmg}`, '#38bdf8');
      spawnSniperOrbs();
    }
  } else {
    applyWrongLetterPenalty(`❌ 射錯字母 (${orb.char.toUpperCase()})`, orb.x, orb.y);
  }
}
