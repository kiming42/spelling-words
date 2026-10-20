/* =========================================================
   引擎模組 2：Canvas 2D 視覺渲染引擎
   ========================================================= */
let scale = 1, offX = 0, offY = 0;

function resize() {
  if (!stageEl || !canvas) return;
  const rect = stageEl.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  scale = Math.min(canvas.width / ARENA.w, canvas.height / ARENA.h);
  offX = (canvas.width - ARENA.w * scale) / 2;
  offY = (canvas.height - ARENA.h * scale) / 2;
}
window.addEventListener('resize', resize);
setTimeout(resize, 50);

function drawSafeSanctuaryZone() {
  ctx.save();
  ctx.translate(SAFE_ZONE.x, SAFE_ZONE.y);
  const pulse = Math.sin(performance.now() * 0.005) * 4;
  ctx.beginPath();
  ctx.arc(0, 0, SAFE_ZONE.r + pulse, 0, Math.PI * 2);
  ctx.fillStyle = player.inSafeZone ? 'rgba(34, 197, 94, 0.22)' : 'rgba(34, 197, 94, 0.1)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = player.inSafeZone ? '#4ade80' : 'rgba(74, 222, 128, 0.55)';
  ctx.setLineDash([12, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = player.inSafeZone ? '#86efac' : 'rgba(134, 239, 172, 0.7)';
  ctx.font = '900 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🛡️ 休息思考保護區', 0, -SAFE_ZONE.r - 10);
  ctx.font = '700 12px sans-serif';
  ctx.fillText('(站入內擋子彈 + 慢速回血)', 0, SAFE_ZONE.r + 18);
  ctx.restore();
}

function drawHeartMedkit(x, y) {
  ctx.save();
  const beat = 1 + Math.sin(performance.now() * 0.008) * 0.1;
  ctx.translate(x, y);
  ctx.scale(beat, beat);
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
  ctx.fill();
  ctx.fillStyle = '#f43f5e';
  ctx.strokeStyle = '#fda4af';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(0, 3, -5, -12, -14, -12);
  ctx.bezierCurveTo(-24, -12, -24, 2, -24, 2);
  ctx.bezierCurveTo(-24, 11, -12, 19, 0, 26);
  ctx.bezierCurveTo(12, 19, 24, 11, 24, 2);
  ctx.bezierCurveTo(24, 2, 24, -12, 14, -12);
  ctx.bezierCurveTo(5, -12, 0, 3, 0, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.arc(-11, -4, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRobloxHero(x, y, angle, hp, maxHp, shield, maxShield, spawnProtected) {
  ctx.save();
  ctx.translate(x, y);
  if (spawnProtected || player.inSafeZone) {
    const pulse = 42 + Math.sin(performance.now() * 0.01) * 3;
    ctx.beginPath();
    ctx.arc(0, 0, pulse, 0, Math.PI * 2);
    ctx.fillStyle = player.inSafeZone ? 'rgba(34, 197, 94, 0.2)' : 'rgba(250, 204, 21, 0.22)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = player.inSafeZone ? '#4ade80' : '#facc15';
    ctx.setLineDash([8, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = player.inSafeZone ? '#86efac' : '#fef08a';
    ctx.font = '900 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.inSafeZone ? '🛡️ 思考保護中 (走出圈外開火)' : '🛡️ 開場無敵保護罩', 0, 52);
  }
  if (shield > 0) {
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
  }
  const flap = Math.sin(performance.now() * 0.008) * 4;
  ctx.fillStyle = '#0284c7';
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -4); ctx.lineTo(-42, -24 + flap); ctx.lineTo(-34, -4); ctx.lineTo(-46, 12 + flap); ctx.lineTo(-12, 8);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, -4); ctx.lineTo(42, -24 + flap); ctx.lineTo(34, -4); ctx.lineTo(46, 12 + flap); ctx.lineTo(12, 8);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = 'rgba(14, 165, 233, 0.75)';
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1.5;
  ctx.fillRect(-34, 12 - flap * 0.5, 16, 11);
  ctx.strokeRect(-34, 12 - flap * 0.5, 16, 11);
  ctx.fillRect(18, 12 + flap * 0.5, 16, 11);
  ctx.strokeRect(18, 12 + flap * 0.5, 16, 11);

  if (config.armorId === 'drone') {
    const dx = Math.cos(performance.now() * 0.005) * 38;
    const dy = Math.sin(performance.now() * 0.005) * 38;
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(dx, dy, 7, 0, Math.PI * 2); ctx.fill();
  }

  ctx.save();
  ctx.rotate(angle);
  const wObj = WEAPONS.find(w => w.id === config.weaponId) || WEAPONS[0];
  ctx.fillStyle = wObj.color;
  ctx.fillRect(12, -5, 24, 10);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(12, -5, 24, 10);
  ctx.restore();

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-21, -8, 8, 20);
  ctx.fillRect(13, -8, 8, 20);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-13, -10, 26, 22);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-5, -4, 10, 10);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-6, 6, 12, 3);

  ctx.fillStyle = '#facc15';
  ctx.beginPath(); ctx.roundRect(-11, -24, 22, 16, 4); ctx.fill();
  ctx.fillStyle = '#090d16';
  ctx.fillRect(-9, -18, 8, 5);
  ctx.fillRect(1, -18, 8, 5);
  ctx.fillRect(-1, -17, 2, 2);

  ctx.fillStyle = '#1d4ed8';
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, -23, 16, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(-10, -31, 20, 9);
  ctx.strokeRect(-10, -31, 20, 9);

  const bw = 56;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(-bw / 2, -46, bw, 11);
  if (shield > 0) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-bw / 2, -46, bw * (shield / maxShield), 4);
  }
  ctx.fillStyle = hp > 35 ? '#22c55e' : '#ef4444';
  ctx.fillRect(-bw / 2, -41, bw * (hp / maxHp), 6);

  ctx.fillStyle = '#bae6fd';
  ctx.font = '900 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(config.playerName, 0, -50);
  ctx.restore();
}

function drawRivalBoss(x, y, angle, hp, maxHp, shielded, profile) {
  ctx.save();
  ctx.translate(x, y);
  if (shielded) {
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c084fc';
    ctx.stroke();
  }
  const flap = Math.cos(performance.now() * 0.009) * 5;
  ctx.fillStyle = profile.wingColor;
  if (profile.style === 'kraken') {
    for (let t = -1; t <= 1; t += 2) {
      ctx.beginPath(); ctx.arc(t * 26, flap, 14, 0, Math.PI * 2); ctx.fill();
    }
  } else if (profile.style === 'frost') {
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-45, -18 + flap); ctx.lineTo(-32, 16); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(45, -18 + flap); ctx.lineTo(32, 16); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-42, -22 + flap); ctx.lineTo(-30, 12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(42, -22 + flap); ctx.lineTo(30, 12); ctx.closePath(); ctx.fill();
  }
  ctx.save();
  ctx.rotate(angle);
  ctx.fillStyle = profile.wingColor;
  ctx.fillRect(12, -6, 26, 12);
  ctx.restore();

  ctx.fillStyle = profile.bodyColor;
  ctx.strokeStyle = profile.wingColor;
  ctx.lineWidth = 2;
  ctx.fillRect(-15, -12, 30, 24);
  ctx.strokeRect(-15, -12, 30, 24);

  if (profile.style === 'skull') {
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath(); ctx.roundRect(-12, -27, 24, 17, 5); ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.beginPath(); ctx.arc(-5, -19, 3.5, 0, Math.PI * 2); ctx.arc(5, -19, 3.5, 0, Math.PI * 2); ctx.fill();
  } else if (profile.style === 'ninja') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12, -26, 24, 15);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-13, -24, 26, 4);
    ctx.fillStyle = profile.visor;
    ctx.fillRect(-8, -19, 16, 4);
  } else if (profile.style === 'frost' || profile.style === 'pharaoh') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, -26, 24, 15);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-12, -26); ctx.lineTo(-8, -36); ctx.lineTo(0, -29); ctx.lineTo(8, -36); ctx.lineTo(12, -26);
    ctx.fill();
    ctx.fillStyle = profile.visor;
    ctx.fillRect(-9, -21, 18, 5);
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, -26, 24, 15);
    ctx.fillStyle = profile.visor;
    ctx.fillRect(-9, -21, 18, 5);
    ctx.fillStyle = profile.wingColor;
    ctx.beginPath();
    ctx.moveTo(-11, -26); ctx.lineTo(-19, -37); ctx.lineTo(-4, -26);
    ctx.moveTo(11, -26); ctx.lineTo(19, -37); ctx.lineTo(4, -26);
    ctx.fill();
  }
  const bw = 60;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(-bw / 2, -46, bw, 7);
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(-bw / 2, -46, bw * (hp / maxHp), 7);
  ctx.fillStyle = '#fda4af';
  ctx.font = '900 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(profile.name, 0, -51);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offX, offY);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, ARENA.w, ARENA.h);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= ARENA.w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ARENA.h); ctx.stroke(); }
  for (let y = 0; y <= ARENA.h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA.w, y); ctx.stroke(); }
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, ARENA.w - 4, ARENA.h - 4);

  drawSafeSanctuaryZone();

  const spin = performance.now() * 0.004;
  for (const p of PORTALS) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(spin);
    ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color === '#38bdf8' ? 'rgba(56,189,248,0.2)' : 'rgba(168,85,247,0.2)';
    ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = p.color; ctx.setLineDash([10, 6]); ctx.stroke();
    ctx.restore();
  }

  for (const sp of SPEED_PADS) {
    ctx.save();
    ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.18)'; ctx.fill();
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#facc15'; ctx.font = '900 18px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('⚡', sp.x, sp.y);
    ctx.restore();
  }

  for (const mk of round.medkits) {
    if (mk.active) drawHeartMedkit(mk.x, mk.y);
  }

  for (const ob of obstacles) {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(ob.x, ob.y, ob.w, ob.h, 10);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.fillRect(ob.x + 8, ob.y + 8, ob.w - 16, ob.h - 16);
  }

  for (const o of round.orbs) {
    const isHinted = round.hintHighlightChar && o.char === round.hintHighlightChar;
    ctx.beginPath();
    ctx.arc(o.x, o.y, isHinted ? o.r + 7 : o.r, 0, Math.PI * 2);
    ctx.fillStyle = isHinted ? 'rgba(250, 204, 21, 0.45)' : 'rgba(14, 165, 233, 0.35)';
    ctx.fill();
    ctx.lineWidth = isHinted ? 4 : 3;
    ctx.strokeStyle = isHinted ? '#facc15' : '#38bdf8';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '900 25px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(o.char, o.x, o.y);
  }

  for (const c of round.crates) {
    const bw = c.w || 135;
    const bh = c.h || 52;
    const pulse = Math.sin(performance.now() * 0.006) * 4;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
    ctx.beginPath();
    ctx.roundRect(-bw / 2 - pulse, -bh / 2 - pulse, bw + pulse * 2, bh + pulse * 2, 24);
    ctx.fill();
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c084fc';
    ctx.font = '800 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌀 DATA CORE (走近觸碰)', 0, -bh / 2 - 7);
    ctx.fillStyle = '#facc15';
    ctx.font = c.text.length > 15 ? '900 16px sans-serif' : '900 19px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.text, 0, 1);
    ctx.restore();
  }

  if (round.laserEffect > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.fillRect(rival.x - 36, 0, 72, rival.y + 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rival.x - 16, 0, 32, rival.y + 20);
    ctx.restore();
  }

  for (const dl of round.droppedLoot) {
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dl.icon, dl.x, dl.y);
  }

  if (player.hp > 0) {
    drawRobloxHero(player.x, player.y, player.angle, player.hp, player.maxHp, player.shield, player.maxShield, player.spawnProtected);
  }
  drawRivalBoss(rival.x, rival.y, rival.angle, rival.hp, rival.maxHp, rival.shielded, rival.profile);

  for (const b of round.bullets) {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color; ctx.fill();
  }
  for (const p of round.particles) {
    ctx.fillStyle = p.color; ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
  }
  for (const t of round.texts) {
    ctx.fillStyle = t.color; ctx.font = '900 19px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
  }

  ctx.restore();
  if (typeof drawJoystickUI === 'function') drawJoystickUI();
}
