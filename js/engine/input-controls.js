/* =========================================================
   引擎模組 3：虛擬搖桿、鍵盤觸控、開火邏輯與主迴圈啟動
   ========================================================= */
let keys = {};
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === 'Space') triggerDash();
  if (e.key.toLowerCase() === 'p') togglePause();
});
window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

let joy = { active: false, id: null, sx: 0, sy: 0, dx: 0, dy: 0 };
const joyZone = document.getElementById('joyZone');

joyZone.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  const r = joyZone.getBoundingClientRect();
  joy.active = true; joy.id = t.identifier;
  joy.sx = r.left + r.width / 2; joy.sy = r.top + r.height / 2;
  moveJoy(t.clientX, t.clientY);
}, { passive: false });

joyZone.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier === joy.id) moveJoy(t.clientX, t.clientY);
  }
}, { passive: false });

joyZone.addEventListener('touchend', e => {
  for (const t of e.changedTouches) {
    if (t.identifier === joy.id) {
      joy.active = false; joy.dx = 0; joy.dy = 0;
    }
  }
});

function moveJoy(cx, cy) {
  let vx = cx - joy.sx, vy = cy - joy.sy;
  const d = Math.hypot(vx, vy), max = 42;
  if (d > max) { vx = (vx / d) * max; vy = (vy / d) * max; }
  joy.dx = vx / max; joy.dy = vy / max;
}

let joyDomKnob = null;
function initDomJoystickVisual() {
  joyZone.style.borderRadius = '50%';
  joyZone.style.background = 'rgba(255, 255, 255, 0.08)';
  joyZone.style.border = '2px solid rgba(255, 255, 255, 0.3)';
  joyZone.style.display = 'flex';
  joyZone.style.alignItems = 'center';
  joyZone.style.justifyContent = 'center';

  joyDomKnob = document.createElement('div');
  joyDomKnob.style.width = '40px';
  joyDomKnob.style.height = '40px';
  joyDomKnob.style.borderRadius = '50%';
  joyDomKnob.style.background = 'rgba(56, 189, 248, 0.85)';
  joyDomKnob.style.boxShadow = '0 0 12px rgba(56, 189, 248, 0.6)';
  joyDomKnob.style.pointerEvents = 'none';
  joyZone.appendChild(joyDomKnob);
}
initDomJoystickVisual();

function drawJoystickUI() {
  if (joyDomKnob) {
    joyDomKnob.style.transform = `translate(${joy.dx * 34}px, ${joy.dy * 34}px)`;
  }
}

let firingHeld = false, fireCd = 0;
const btnFire = document.getElementById('btnFire');
btnFire.addEventListener('touchstart', e => { e.preventDefault(); firingHeld = true; shoot(); }, { passive: false });
btnFire.addEventListener('touchend', () => { firingHeld = false; });
btnFire.addEventListener('mousedown', () => { firingHeld = true; shoot(); });
window.addEventListener('mouseup', () => { firingHeld = false; });

canvas.addEventListener('pointerdown', e => {
  if (!match.active || match.paused) return;
  const rect = canvas.getBoundingClientRect();
  const wx = (e.clientX - rect.left - offX) / scale;
  const wy = (e.clientY - rect.top - offY) / scale;
  player.angle = Math.atan2(wy - player.y, wx - player.x);
  shoot(true);
});

function shoot(manualAim = false) {
  if (!match.active || match.paused || fireCd > 0) return;

  if (player.inSafeZone) {
    if (fireCd <= 0) {
      fireCd = 20;
      addText(player.x, player.y - 36, '🛡️ 請先走出綠色保護區再開火！', '#4ade80');
    }
    return;
  }

  if (round.mode === 'cypher') {
    sfx('bad');
    fireCd = 20;
    addText(player.x, player.y - 35, '🌀 此模式請走近觸碰「數據核心」並串字召喚雷擊！', '#c084fc');
    return;
  }

  if (round.mode === 'assault' && !round.questionAnswered) {
    sfx('bad');
    fireCd = 20;
    addText(player.x, player.y - 35, '🔒 請先在頂部完成串字答題，才可解鎖射擊！', '#facc15');
    return;
  }

  if (round.mode === 'assault' && player.ammo <= 0) {
    sfx('bad');
    if (round.nextIdx === -1) {
      round.questionAnswered = false;
      buildSlots(round.wordObj.word, 'assault', round.diff);
      updateWordHUD();
      renderQuickSpellDock();
    }
    addText(player.x, player.y - 30, '⚡ 彈藥耗盡！請再串一次生字補充彈藥！', '#facc15');
    return;
  }

  if (!manualAim) {
    let tgt = rival;
    if (round.mode === 'sniper' && round.orbs.length) {
      let best = Infinity;
      round.orbs.forEach(o => {
        const d = Math.hypot(o.x - player.x, o.y - player.y);
        if (d < best) { best = d; tgt = o; }
      });
    }
    player.angle = Math.atan2(tgt.y - player.y, tgt.x - player.x);
  }

  if (round.mode === 'assault') {
    player.ammo--;
    document.getElementById('ammoLabel').textContent = `彈藥:${player.ammo}`;
    if (player.ammo <= 0 && rival.hp > 0) {
      round.questionAnswered = false;
      buildSlots(round.wordObj.word, 'assault', round.diff);
      updateWordHUD();
      renderQuickSpellDock();
      document.getElementById('ammoLabel').textContent = `再答題補彈`;
    }
  }

  const w = WEAPONS.find(x => x.id === config.weaponId) || WEAPONS[0];
  fireCd = w.rapid ? 7 : 11;
  sfx('shoot');

  const spd = w.fastBullet ? 19 : 14;
  if (w.dual) {
    [-8, 8].forEach(offset => {
      round.bullets.push({
        x: player.x + Math.cos(player.angle + Math.PI / 2) * offset,
        y: player.y + Math.sin(player.angle + Math.PI / 2) * offset,
        vx: Math.cos(player.angle) * spd,
        vy: Math.sin(player.angle) * spd,
        r: 5, color: w.color, fromPlayer: true, dmg: w.dmg
      });
    });
  } else {
    const angles = w.spread ? [player.angle - 0.14, player.angle, player.angle + 0.14] : [player.angle];
    angles.forEach(ang => {
      round.bullets.push({
        x: player.x + Math.cos(ang) * 26,
        y: player.y + Math.sin(ang) * 26,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: w.big ? 9 : 6,
        color: w.color,
        fromPlayer: true,
        dmg: w.dmg
      });
    });
  }
}

function triggerDash() {
  if (!match.active || match.paused || player.dashCd > 0) return;
  player.spawnProtected = false;
  player.dashCd = 50;
  const ang = (joy.dx || joy.dy) ? Math.atan2(joy.dy, joy.dx) : player.angle;
  player.vx = Math.cos(ang) * 14;
  player.vy = Math.sin(ang) * 14;
  spawnParticles(player.x, player.y, '#38bdf8', 10);
}

// 啟動遊戲與載入玩家資料
generateRandomObstacles();
loadProfileData(config.playerName);

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
