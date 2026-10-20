/* =========================================================
   引擎模組 1：競技場地圖設定、物理碰撞與遊戲主邏輯
   ========================================================= */
const stageEl = document.getElementById('arenaStage');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ARENA = { w: 1200, h: 660 };
const SAFE_ZONE = { x: 115, y: 330, r: 78 };

let obstacles = [];

const PORTALS = [
  { x: 225, y: 145, r: 28, color: '#38bdf8', targetIdx: 1 },
  { x: 1010, y: 515, r: 28, color: '#38bdf8', targetIdx: 0 },
  { x: 225, y: 515, r: 28, color: '#a855f7', targetIdx: 3 },
  { x: 1010, y: 145, r: 28, color: '#a855f7', targetIdx: 2 }
];

const SPEED_PADS = [
  { x: 460, y: 330, r: 26 },
  { x: 740, y: 330, r: 26 }
];

function generateRandomObstacles() {
  obstacles = [];
  const zones = [
    { minX: 290, maxX: 370, minY: 155, maxY: 220 },
    { minX: 290, maxX: 370, minY: 380, maxY: 460 },
    { minX: 530, maxX: 610, minY: 210, maxY: 340 },
    { minX: 760, maxX: 840, minY: 155, maxY: 220 },
    { minX: 760, maxX: 840, minY: 380, maxY: 460 }
  ];
  zones.forEach(z => {
    const w = 70 + Math.floor(Math.random() * 28);
    const h = 85 + Math.floor(Math.random() * 40);
    const x = z.minX + Math.floor(Math.random() * (z.maxX - z.minX));
    const y = z.minY + Math.floor(Math.random() * (z.maxY - z.minY));
    obstacles.push({ x, y, w, h });
  });
}

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  return Math.hypot(cx - nx, cy - ny) < cr;
}

function flashDamageScreen() {
  const el = document.getElementById('damageFlash');
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 220);
}

function applyWrongLetterPenalty(reasonText, x, y) {
  sfx('bad');
  flashDamageScreen();
  const WRONG_DMG = 15;
  player.hp = Math.max(0, player.hp - WRONG_DMG);
  spawnParticles(player.x, player.y, '#f43f5e', 14);
  addText(x || player.x, (y || player.y) - 28, `${reasonText} 💔-${WRONG_DMG} HP!`, '#f43f5e');

  if (player.hp <= 0) {
    if (config.armorId === 'phoenix' && !player.reviveUsed) {
      player.reviveUsed = true;
      player.hp = 100;
      sfx('portal');
      spawnParticles(player.x, player.y, '#facc15', 25);
      addText(player.x, player.y - 40, '🔥 鳳凰核心觸發！滿血復活！', '#facc15');
    } else {
      finishRound(false);
    }
  }
}

function triggerDeathLootDrop() {
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI * 2 * i) / 6;
    round.droppedLoot.push({
      x: player.x, y: player.y,
      vx: Math.cos(ang) * (3 + Math.random() * 3),
      vy: Math.sin(ang) * (3 + Math.random() * 3),
      icon: i % 2 === 0 ? '💰' : '📦'
    });
  }
  if (config.coins > 0) {
    const lostCoins = Math.min(config.coins, 8 + Math.floor(Math.random() * 10));
    config.coins -= lostCoins;
    saveProfileData();
    updateTopHUD();
    return `💀 陣亡掉落金錢：噴掉了 -${lostCoins} 金幣 💰！`;
  }
  return `💀 陣亡！`;
}

function togglePause() {
  if (!match.active) return;
  match.paused = !match.paused;
  if (typeof firingHeld !== 'undefined') firingHeld = false;
  syncVoiceControlsUI();
  document.getElementById('pauseModal').classList.toggle('hidden', !match.paused);
  sfx('good');
}

function restartCurrentRound() {
  match.paused = false;
  document.getElementById('pauseModal').classList.add('hidden');
  initRound();
}

function quitToLobbyFromPause() {
  match.paused = false;
  document.getElementById('pauseModal').classList.add('hidden');
  openLobby();
}

function startMatch() {
  saveProfileData(true);
  document.getElementById('lobbyModal').classList.add('hidden');
  document.getElementById('pauseModal').classList.add('hidden');
  resize();

  const pool = [...getActiveWordPool()];
  if (config.wordOrder === 'random') {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }

  match.queue = pool;
  match.totalWords = pool.length;
  match.you = 0;
  match.bot = 0;
  match.round = 1;
  match.active = true;
  match.paused = false;

  updateTopHUD();
  initRound();
}

function pickNewRivalWaypoint() {
  for (let tries = 0; tries < 15; tries++) {
    const tx = 380 + Math.random() * 740;
    const ty = 70 + Math.random() * (ARENA.h - 140);
    let insideOb = false;
    for (const ob of obstacles) {
      if (circleRect(tx, ty, rival.r + 15, ob.x, ob.y, ob.w, ob.h)) {
        insideOb = true; break;
      }
    }
    if (!insideOb) {
      rival.wp = { x: tx, y: ty };
      return;
    }
  }
  rival.wp = { x: 920, y: 330 };
}

function initRound() {
  generateRandomObstacles();

  const modes = ['sniper', 'assault', 'cypher'];
  round.mode = config.mode === 'mix' ? modes[(match.round - 1) % 3] : config.mode;
  round.diff = config.diff === 'progressive'
    ? ((match.you >= Math.ceil(match.totalWords / 2)) ? 'full' : 'blanks')
    : config.diff;

  round.wordObj = match.queue[0] || getActiveWordPool()[0];
  rival.profile = BOSS_PROFILES[Math.floor(Math.random() * BOSS_PROFILES.length)];
  round.hintHighlightChar = null;
  round.laserEffect = 0;

  player.x = SAFE_ZONE.x;
  player.y = SAFE_ZONE.y;
  player.vx = 0; player.vy = 0;
  player.hp = 100;
  player.spawnProtected = true;
  player.inSafeZone = true;
  player.reviveUsed = false;
  player.droneTimer = 150;
  player.shield = config.armorId === 'shield' ? 45 : 15;
  player.maxShield = Math.max(45, player.shield);
  player.speed = config.armorId === 'boots' ? 5.7 : 4.4;
  player.portalCd = 0; player.speedBuff = 0;

  const stageScale = Math.min(12, match.you);
  rival.x = 1060; rival.y = 330;
  rival.maxHp = round.mode === 'assault' ? (100 + stageScale * 8) : 100;
  rival.hp = rival.maxHp;
  rival.stun = 0;
  rival.fireCd = Math.max(38, 72 - stageScale * 3);
  rival.speed = Math.min(4.2, 2.2 + stageScale * 0.14);
  rival.enragedBoost = 0;
  pickNewRivalWaypoint();

  round.bullets = []; round.orbs = []; round.crates = [];
  round.particles = []; round.droppedLoot = []; round.texts = [];
  round.medkits = [
    { x: 600, y: 95, r: 22, active: true },
    { x: 600, y: 565, r: 22, active: true }
  ];

  const dock = document.getElementById('quickSpellDock');
  const ammoLbl = document.getElementById('ammoLabel');
  const hintEl = document.querySelector('#quickSpellDock .dock-hint');

  if (round.mode === 'sniper') {
    rival.shielded = false;
    player.ammo = 999;
    round.questionAnswered = true;
    buildSlots(round.wordObj.word, round.mode, round.diff);
    dock.classList.add('hidden');
    ammoLbl.textContent = '射字母靶';
    spawnSniperOrbs();
  } else if (round.mode === 'assault') {
    rival.shielded = false;
    player.ammo = 0;
    round.questionAnswered = false;
    buildSlots(round.wordObj.word, round.mode, round.diff);
    if (hintEl) hintEl.textContent = '⚡ 篤字補彈:';
    dock.classList.remove('hidden');
    ammoLbl.textContent = `先答題解鎖`;
    renderQuickSpellDock();
  } else if (round.mode === 'cypher') {
    rival.shielded = true;
    player.ammo = 0;
    round.cypherPhase = 'pick';
    round.questionAnswered = false;
    buildSlots(round.wordObj.word, round.mode, round.diff);
    dock.classList.add('hidden');
    ammoLbl.textContent = '走位拾取核心';
    spawnCypherCores();
  }

  updateWordHUD();
  setTimeout(resize, 20);
  announceRound();
  if (round.mode !== 'cypher' && !round.wordObj.isSentence) {
    setTimeout(() => speakCurrentWord(), 550);
  }
}

function buildSlots(word, mode, diff) {
  round.slots = [];
  const chars = word.split('');

  if (mode === 'cypher' && round.cypherPhase === 'pick') {
    for (let i = 0; i < 5; i++) {
      round.slots.push({ char: '?', isSpace: false, filled: false });
    }
    round.nextIdx = 0;
    round.totalToFill = 1;
    round.filledCount = 0;
    return;
  }

  const letterIndices = [];
  chars.forEach((c, idx) => { if (c !== ' ') letterIndices.push(idx); });

  if (diff === 'full') {
    chars.forEach(c => {
      round.slots.push({ char: c, isSpace: c === ' ', filled: c === ' ' });
    });
  } else {
    const blanksCount = Math.max(2, Math.min(6, Math.ceil(letterIndices.length * 0.45)));
    const picks = [];
    while (picks.length < blanksCount && picks.length < letterIndices.length) {
      const rIdx = letterIndices[Math.floor(Math.random() * letterIndices.length)];
      if (!picks.includes(rIdx)) picks.push(rIdx);
    }
    chars.forEach((c, i) => {
      round.slots.push({
        char: c,
        isSpace: c === ' ',
        filled: c === ' ' ? true : !picks.includes(i)
      });
    });
  }
  round.totalToFill = round.slots.filter(s => !s.filled).length;
  round.filledCount = 0;
  findNextSlot();
}

function findNextSlot() {
  for (let i = 0; i < round.slots.length; i++) {
    if (!round.slots[i].filled) { round.nextIdx = i; return true; }
  }
  round.nextIdx = -1;
  return false;
}

function useHint() {
  if (!match.active || match.paused || round.nextIdx === -1) return;
  const HINT_COST = 15;
  if (config.coins < HINT_COST) {
    sfx('bad');
    addText(player.x, player.y - 35, `💰 金幣不足！(需要 ${HINT_COST}💰)`, '#f43f5e');
    return;
  }
  config.coins -= HINT_COST;
  saveProfileData();
  updateTopHUD();
  sfx('portal');

  if (round.mode === 'sniper') {
    const needed = round.slots[round.nextIdx].char;
    round.hintHighlightChar = needed;
    addText(player.x, player.y - 40, `💡 提示：射擊金色閃光字母【 ${needed.toUpperCase()} 】!`, '#facc15');
  } else if (round.mode === 'assault') {
    const needed = round.slots[round.nextIdx].char;
    round.slots[round.nextIdx].filled = true;
    const more = findNextSlot();
    updateWordHUD();
    if (!more) {
      round.questionAnswered = true;
      player.ammo += 12;
      document.getElementById('ammoLabel').textContent = `彈藥:${player.ammo}`;
      addText(player.x, player.y - 40, `💡 提示完成串字！武器已解鎖 (+12 彈藥)!`, '#facc15');
      speakCurrentWord();
    } else {
      player.ammo += 2;
      document.getElementById('ammoLabel').textContent = round.questionAnswered ? `彈藥:${player.ammo}` : `先答題(${player.ammo})`;
      addText(player.x, player.y - 40, `💡 提示自動填入：【 ${needed.toUpperCase()} 】(完成全字解鎖射擊)`, '#facc15');
    }
    renderQuickSpellDock();
  } else if (round.mode === 'cypher') {
    if (round.cypherPhase === 'pick') {
      const wrongIdx = round.crates.findIndex(c => !c.isCorrect);
      if (wrongIdx !== -1) {
        const removed = round.crates.splice(wrongIdx, 1)[0];
        spawnParticles(removed.x, removed.y, '#facc15', 14);
        addText(player.x, player.y - 40, `💡 已幫你消除一個假數據核心！`, '#facc15');
      } else {
        addText(player.x, player.y - 40, `💡 快走去拾取【 ${round.wordObj.word} 】核心!`, '#facc15');
      }
    } else {
      const needed = round.slots[round.nextIdx].char;
      round.slots[round.nextIdx].filled = true;
      const more = findNextSlot();
      updateWordHUD();
      if (!more) {
        triggerCypherLaserKill();
      } else {
        addText(player.x, player.y - 40, `💡 自動解碼字母：【 ${needed.toUpperCase()} 】`, '#facc15');
        renderQuickSpellDock();
      }
    }
  }
}

function update() {
  for (let i = round.droppedLoot.length - 1; i >= 0; i--) {
    const dl = round.droppedLoot[i];
    dl.x += dl.vx; dl.y += dl.vy;
    dl.vx *= 0.92; dl.vy *= 0.92;
  }

  if (!match.active || match.paused) return;

  if (fireCd > 0) fireCd--;
  if (player.dashCd > 0) player.dashCd--;
  if (player.portalCd > 0) player.portalCd--;
  if (player.speedBuff > 0) player.speedBuff--;
  if (rival.enragedBoost > 0) rival.enragedBoost--;
  if (firingHeld) shoot();

  if (config.armorId === 'drone') {
    player.droneTimer--;
    if (player.droneTimer <= 0) {
      player.droneTimer = 170;
      if (!rival.shielded && rival.hp > 20) {
        rival.hp = Math.max(15, rival.hp - 8);
        spawnParticles(rival.x, rival.y, '#facc15', 10);
        addText(rival.x, rival.y - 30, '🛸 無人機電擊 -8', '#facc15');
      }
    }
  }

  let mx = joy.dx, my = joy.dy;
  if (keys['w'] || keys['arrowup']) my -= 1;
  if (keys['s'] || keys['arrowdown']) my += 1;
  if (keys['a'] || keys['arrowleft']) mx -= 1;
  if (keys['d'] || keys['arrowright']) mx += 1;
  const m = Math.hypot(mx, my);
  if (m > 1) { mx /= m; my /= m; }

  if (player.spawnProtected && m > 0.08) {
    player.spawnProtected = false;
  }

  const spd = player.speed * (player.speedBuff > 0 ? 1.45 : 1);
  const nx = player.x + mx * spd + player.vx;
  const ny = player.y + my * spd + player.vy;
  player.vx *= 0.82; player.vy *= 0.82;

  let okX = nx > player.r && nx < ARENA.w - player.r;
  let okY = ny > player.r + 12 && ny < ARENA.h - player.r;
  for (const ob of obstacles) {
    if (circleRect(nx, player.y, player.r, ob.x, ob.y, ob.w, ob.h)) okX = false;
    if (circleRect(player.x, ny, player.r, ob.x, ob.y, ob.w, ob.h)) okY = false;
  }
  if (okX) player.x = nx;
  if (okY) player.y = ny;

  const distToSafe = Math.hypot(player.x - SAFE_ZONE.x, player.y - SAFE_ZONE.y);
  player.inSafeZone = distToSafe < SAFE_ZONE.r;
  if (player.inSafeZone && player.hp < player.maxHp && Math.random() < 0.04) {
    player.hp = Math.min(player.maxHp, player.hp + 1);
  }

  if (player.portalCd <= 0) {
    for (const p of PORTALS) {
      if (Math.hypot(player.x - p.x, player.y - p.y) < player.r + p.r - 6) {
        const dest = PORTALS[p.targetIdx];
        player.x = dest.x; player.y = dest.y;
        player.portalCd = 75;
        sfx('portal');
        spawnParticles(player.x, player.y, p.color, 16);
        addText(player.x, player.y - 30, '🌀 空間傳送!', p.color);
        break;
      }
    }
  }

  for (const sp of SPEED_PADS) {
    if (Math.hypot(player.x - sp.x, player.y - sp.y) < player.r + sp.r) {
      if (player.speedBuff <= 10) addText(player.x, player.y - 30, '⚡ 極速推進!', '#facc15');
      player.speedBuff = 110;
    }
  }

  const pickRadius = config.armorId === 'magnet' ? 75 : 0;
  for (const mk of round.medkits) {
    if (mk.active && Math.hypot(player.x - mk.x, player.y - mk.y) < player.r + mk.r + pickRadius) {
      mk.active = false;
      player.hp = Math.min(player.maxHp, player.hp + 35);
      sfx('good');
      spawnParticles(mk.x, mk.y, '#f43f5e', 14);
      addText(player.x, player.y - 30, '❤️ +35 HP 回血!', '#f43f5e');
      setTimeout(() => { mk.active = true; }, 9000);
    }
  }

  updateSniperOrbsPhysics();
  updateCypherCoresPhysics();

  if (rival.stun > 0) {
    rival.stun--;
  } else {
    if (Math.hypot(rival.wp.x - rival.x, rival.wp.y - rival.y) < 35) {
      pickNewRivalWaypoint();
    }
    const stageScale = Math.min(12, match.you);
    const aiSpd = rival.speed * (rival.enragedBoost > 0 ? 1.32 : 1) * (round.mode === 'assault' ? (1.1 + stageScale * 0.04) : 1);
    const ang = Math.atan2(rival.wp.y - rival.y, rival.wp.x - rival.x);
    const rx = rival.x + Math.cos(ang) * aiSpd;
    const ry = rival.y + Math.sin(ang) * aiSpd;

    let rOkX = rx > rival.r + 300 && rx < ARENA.w - rival.r;
    let rOkY = ry > rival.r + 45 && ry < ARENA.h - rival.r;
    for (const ob of obstacles) {
      if (circleRect(rx, rival.y, rival.r + 4, ob.x, ob.y, ob.w, ob.h)) rOkX = false;
      if (circleRect(rival.x, ry, rival.r + 4, ob.x, ob.y, ob.w, ob.h)) rOkY = false;
    }
    if (rOkX) rival.x = rx;
    if (rOkY) rival.y = ry;

    if (!rOkX || !rOkY) {
      rival.stuckFrames++;
      if (rival.stuckFrames > 6) {
        pickNewRivalWaypoint();
        rival.stuckFrames = 0;
      }
    } else {
      rival.stuckFrames = 0;
    }

    rival.angle = Math.atan2(player.y - rival.y, player.x - rival.x);
    rival.fireCd--;
    if (rival.fireCd <= 0 && !player.inSafeZone) {
      rival.fireCd = Math.max(28, 72 - config.streak * 3 - stageScale * 3);
      const bSpd = 7.6 + stageScale * 0.35;
      const bDmg = 9 + Math.floor(stageScale / 2);
      round.bullets.push({
        x: rival.x + Math.cos(rival.angle) * 28,
        y: rival.y + Math.sin(rival.angle) * 28,
        vx: Math.cos(rival.angle) * bSpd,
        vy: Math.sin(rival.angle) * bSpd,
        r: 6, color: '#f43f5e', fromPlayer: false, dmg: bDmg
      });
    }
  }

  for (let i = round.bullets.length - 1; i >= 0; i--) {
    const b = round.bullets[i];
    b.x += b.vx; b.y += b.vy;
    if (b.x < 0 || b.x > ARENA.w || b.y < 0 || b.y > ARENA.h) {
      round.bullets.splice(i, 1); continue;
    }
    let wall = false;
    for (const ob of obstacles) {
      if (circleRect(b.x, b.y, b.r, ob.x, ob.y, ob.w, ob.h)) {
        spawnParticles(b.x, b.y, '#94a3b8', 4);
        round.bullets.splice(i, 1); wall = true; break;
      }
    }
    if (wall) continue;

    if (!b.fromPlayer && Math.hypot(b.x - SAFE_ZONE.x, b.y - SAFE_ZONE.y) < SAFE_ZONE.r + b.r) {
      spawnParticles(b.x, b.y, '#4ade80', 5);
      round.bullets.splice(i, 1);
      continue;
    }

    if (b.fromPlayer) {
      if (round.mode === 'sniper') {
        let hitO = false;
        for (let j = round.orbs.length - 1; j >= 0; j--) {
          const o = round.orbs[j];
          if (Math.hypot(b.x - o.x, b.y - o.y) < b.r + o.r) {
            hitSniperOrb(o);
            round.bullets.splice(i, 1); hitO = true; break;
          }
        }
        if (hitO) continue;
      }
      if (Math.hypot(b.x - rival.x, b.y - rival.y) < b.r + rival.r) {
        round.bullets.splice(i, 1);
        if (round.mode === 'sniper') {
          addText(rival.x, rival.y - 30, '🎯 請按順序射擊場上的字母球！', '#38bdf8');
        } else if (round.mode === 'cypher') {
          sfx('bad');
          addText(rival.x, rival.y - 30, '🌀 絕對防禦！請走去拾取正確「數據核心」並串字召喚雷擊！', '#c084fc');
        } else {
          sfx('good');
          rival.hp = Math.max(0, rival.hp - b.dmg);
          if (config.armorId === 'vamp') player.hp = Math.min(player.maxHp, player.hp + 4);
          spawnParticles(b.x, b.y, b.color, 8);
          addText(rival.x, rival.y - 28, `-${b.dmg}`, '#facc15');
          if (rival.hp <= 0) finishRound(true);
        }
        continue;
      }
    } else {
      if (Math.hypot(b.x - player.x, b.y - player.y) < b.r + player.r) {
        round.bullets.splice(i, 1);
        if (player.spawnProtected || player.inSafeZone) {
          spawnParticles(b.x, b.y, '#4ade80', 6);
          addText(player.x, player.y - 32, '🛡️ 保護中!', '#4ade80');
          continue;
        }
        if (config.armorId === 'thorn' && !rival.shielded && rival.hp > 20) {
          rival.hp = Math.max(15, rival.hp - 8);
        }
        if (player.shield > 0) {
          player.shield = Math.max(0, player.shield - b.dmg);
          addText(player.x, player.y - 28, `🛡️-${b.dmg}`, '#38bdf8');
        } else {
          flashDamageScreen();
          player.hp = Math.max(0, player.hp - b.dmg);
          addText(player.x, player.y - 28, `-${b.dmg}`, '#f43f5e');
        }
        spawnParticles(b.x, b.y, '#f43f5e', 6);
        if (player.hp <= 0) {
          if (config.armorId === 'phoenix' && !player.reviveUsed) {
            player.reviveUsed = true;
            player.hp = 100;
            sfx('portal');
            spawnParticles(player.x, player.y, '#facc15', 25);
            addText(player.x, player.y - 40, '🔥 鳳凰核心觸發！滿血復活！', '#facc15');
          } else {
            finishRound(false);
          }
        }
      }
    }
  }

  for (let i = round.particles.length - 1; i >= 0; i--) {
    const p = round.particles[i];
    p.x += p.vx; p.y += p.vy; p.life--;
    if (p.life <= 0) round.particles.splice(i, 1);
  }
  for (let i = round.texts.length - 1; i >= 0; i--) {
    const t = round.texts[i];
    t.y -= 1.1; t.life--;
    if (t.life <= 0) round.texts.splice(i, 1);
  }
}

function finishRound(won) {
  if (!match.active) return;
  match.active = false;

  let dropMsg = '';
  let milestoneMsg = '';

  if (won) {
    sfx('good');
    match.you++;
    addCoins(10);
    match.queue.shift();

    if (match.you % 5 === 0 && match.queue.length > 0) {
      config.keys += 1;
      milestoneMsg = '🎁 達成 5 題里程碑：即時獲得 +1 把鎖匙 🔑！ ';
    }
  } else {
    sfx('bad');
    match.bot++;
    dropMsg = triggerDeathLootDrop();
    if (match.queue.length > 1) {
      const failedWord = match.queue.shift();
      match.queue.push(failedWord);
    }
  }
  saveProfileData();
  updateTopHUD();

  if (match.queue.length === 0) {
    config.streak++;
    const clearKeys = Math.max(1, Math.ceil(match.totalWords / 8));
    config.keys += clearKeys;
    addCoins(35);
    saveProfileData();
    updateTopHUD();

    announceRound(
      `🏆 恭喜 ${config.playerName} 完成全部 ${match.totalWords} 題！`,
      `通關大獎：+${clearKeys} 把鎖匙 🔑 & +35 金幣 💰 | 連勝 🔥${config.streak}`
    );
    setTimeout(() => openLobby(), 3200);
  } else {
    match.round++;
    announceRound(
      won ? `✅ STAGE CLEAR! (${round.wordObj.word})` : `❌ 挑戰失敗，稍後重考! (${round.wordObj.word})`,
      won
        ? `${milestoneMsg}進度：已完成 ${match.you} / ${match.totalWords} 題 (剩餘 ${match.queue.length} 題)`
        : `${dropMsg} | 本題已排入隊尾重溫 (剩餘 ${match.queue.length} 題)`
    );
    setTimeout(() => { match.active = true; initRound(); }, 2500);
  }
}

function spawnParticles(x, y, color, cnt) {
  for (let i = 0; i < cnt; i++) {
    const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 4.5;
    round.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color, life: 18 });
  }
}

function addText(x, y, text, color) {
  round.texts.push({ x, y, text, color, life: 48 });
}

function updateWordHUD() {
  const names = { sniper: '🎯 SNIPER', assault: '⚡ ASSAULT', cypher: '🌀 CYPHER' };
  document.getElementById('hudModeBadge').textContent = names[round.mode];
  document.getElementById('hudUnitBadge').textContent = round.wordObj ? round.wordObj.unit.split(':')[0] : 'Unit';
  const meaningEl = document.getElementById('hudMeaning');
  if (round.wordObj) {
    const isSent = (round.mode === 'cypher') || round.wordObj.isSentence || round.wordObj.meaning.includes('___');
    meaningEl.classList.toggle('is-sentence', isSent);
    if (isSent) {
      const rawSent = (round.mode === 'cypher' ? round.wordObj.sentencePrompt : round.wordObj.meaning)
        .replace(/\([^)]*\)/g, '')
        .replace(/（[^）]*）/g, '')
        .trim();
      const safeHtml = rawSent
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/_{2,}/g, '<span class="blank-tag"> ___ </span>');
      meaningEl.innerHTML = `📝 ${safeHtml}`;
    } else {
      meaningEl.textContent = round.wordObj.meaning;
    }
  } else {
    meaningEl.textContent = '';
  }

  const box = document.getElementById('hudSlots');
  box.innerHTML = '';
  box.classList.toggle('compact', round.slots.length > 12);

  round.slots.forEach((s, i) => {
    const d = document.createElement('div');
    if (s.isSpace) {
      d.className = 'slot space-slot';
      d.textContent = '␣';
    } else {
      d.className = 'slot' + (s.filled ? ' filled' : '') + (i === round.nextIdx ? ' target' : '');
      d.textContent = s.filled ? s.char : '_';
    }
    box.appendChild(d);
  });
}

function updateTopHUD() {
  document.getElementById('scoreYou').textContent = match.you;
  document.getElementById('scoreTotal').textContent = match.totalWords || getActiveWordPool().length;
  document.getElementById('streakNum').textContent = config.streak;
  document.getElementById('keysNum').textContent = config.keys;
  document.getElementById('coinsNum').textContent = config.coins;
  document.getElementById('lobbyStreak').textContent = config.streak;
  document.getElementById('lobbyKeys').textContent = config.keys;
  document.getElementById('lobbyCoins').textContent = config.coins;
  document.getElementById('armoryKeysNum').textContent = config.keys;
}

function announceRound(t, s) {
  const b = document.getElementById('centerBanner');
  const subs = {
    sniper: '順序射擊正確字母球！(可隨時回左邊綠色保護區思考)',
    assault: '先在頂部完成串字獲取限量彈藥 ➔ 走出綠圈精準追擊敵人！',
    cypher: '睇頂部英文句子 ➔ 走位觸碰正確「數據核心」➔ 串字召喚雷霆秒殺！'
  };
  document.getElementById('bannerTitle').textContent = t || `STAGE ${match.you + 1} / ${match.totalWords} vs ${rival.profile.title}`;
  document.getElementById('bannerSub').textContent = s || subs[round.mode];
  b.classList.remove('hidden');
  setTimeout(() => b.classList.add('hidden'), 2300);
}
