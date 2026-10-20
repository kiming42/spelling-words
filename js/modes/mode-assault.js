/* =========================================================
   戰鬥模式 2：⚡ Assault 裝彈追擊戰 & 頂部快速串字鍵盤
   ========================================================= */
function renderQuickSpellDock() {
  const container = document.getElementById('dockTiles');
  if (!container) return;
  container.innerHTML = '';
  if (round.nextIdx === -1) {
    buildSlots(round.wordObj.word, round.mode, round.diff);
    updateWordHUD();
  }
  const needed = round.slots[round.nextIdx].char;
  const choices = [needed];
  round.slots.forEach(s => {
    if (!s.filled && s.char !== ' ' && !choices.includes(s.char) && choices.length < 4) {
      choices.push(s.char);
    }
  });
  const alpha = 'abcdefghijklmnopqrstuvwxyz';
  while (choices.length < 6) {
    const c = alpha[Math.floor(Math.random() * 26)];
    if (!choices.includes(c)) choices.push(c);
  }
  choices.sort(() => Math.random() - 0.5);

  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'quick-tile';
    btn.textContent = ch;
    btn.onpointerdown = (e) => {
      e.stopPropagation();
      handleQuickTileTap(ch, btn);
    };
    container.appendChild(btn);
  });
}

function handleQuickTileTap(ch, btn) {
  if (!match.active || match.paused || round.nextIdx === -1) return;
  const expected = round.slots[round.nextIdx].char;
  if (ch === expected) {
    sfx('good');
    addCoins(3);
    round.slots[round.nextIdx].filled = true;

    const more = findNextSlot();
    updateWordHUD();

    // 若在 Cypher 次元駭客戰的第二階段（解碼階段）
    if (round.mode === 'cypher') {
      if (!more) {
        triggerCypherLaserKill();
      } else {
        addText(player.x, player.y - 30, `⚡ 駭入解碼中...`, '#38bdf8');
        renderQuickSpellDock();
      }
      return;
    }

    // Assault 模式：減少獲發彈藥 (+2 每字母，完成全字 +10)
    player.ammo += 2;
    if (!more) {
      round.questionAnswered = true;
      addCoins(10);
      player.ammo += 10;
      player.speedBuff = 150;
      rival.enragedBoost = 190;
      pickNewRivalWaypoint();
      document.getElementById('ammoLabel').textContent = `彈藥:${player.ammo}`;
      addText(player.x, player.y - 42, `⚡ 答題完成！獲發限量彈藥 (共 ${player.ammo} 發)！準確開火！`, '#facc15');
      speakCurrentWord();
    } else {
      document.getElementById('ammoLabel').textContent = round.questionAnswered ? `彈藥:${player.ammo}` : `先答題(${player.ammo})`;
      addText(player.x, player.y - 30, `✅ 正確! (完成全字解鎖射擊)`, '#22c55e');
    }
    renderQuickSpellDock();
  } else {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 250);
    applyWrongLetterPenalty(`❌ 篤錯字母 (${ch.toUpperCase()})`, player.x, player.y);
  }
}
