'use strict';
/* ============================================================
   SCALE OR DIE AI — main loop & wiring
   ============================================================ */

(function () {

  UI.init();
  const offline = G.load();
  G.stats = G.calc();

  /* ------------------- the dev key ------------------- */
  const die = UI.els.die;

  const PRESS_COOLDOWN_MS = 80; // caps mash/autorepeat at ~12 presses/sec
  let lastPress = 0;

  function press(clientX, clientY) {
    const now = performance.now();
    if (now - lastPress < PRESS_COOLDOWN_MS) return;
    lastPress = now;
    const gain = G.click();
    die.classList.remove('pulse'); void die.offsetWidth; die.classList.add('pulse');
    die.classList.add('hot');
    clearTimeout(press._hotT);
    press._hotT = setTimeout(() => die.classList.remove('hot'), 1500);
    UI.floatNum('+' + G.fmtMoney(gain), clientX, clientY);
    UI.typeSnippet();
    if (G.state.clicks === 1)   UI.logSys('FIRST LINE OF CODE COMPILED. IT EVEN RAN.');
    if (G.state.clicks === 100) UI.logSys('100 KEYPRESSES. YOUR FINGERS ARE NOW INFRASTRUCTURE.');
    UI.renderMeters();
  }

  die.addEventListener('click', e => press(e.clientX, e.clientY));
  die.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (e.repeat) return; // holding the key down is not typing
      die.classList.add('pressed');
      press();
    }
  });
  die.addEventListener('keyup', () => die.classList.remove('pressed'));

  /* ------------------- shop tabs ------------------- */
  document.querySelectorAll('#shop-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#shop-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      UI.activeTab = btn.dataset.tab;
      UI.renderShop(true);
    });
  });

  /* ------------------- footer controls ------------------- */
  const saveState = UI.els.saveState;
  function save() {
    G.save();
    saveState.textContent = 'SAVED ' + new Date().toLocaleTimeString();
    clearTimeout(save._t);
    save._t = setTimeout(() => saveState.textContent = 'AUTOSAVE ON', 2500);
  }
  document.getElementById('save-btn').addEventListener('click', () => {
    save();
    UI.logSys('STATE WRITTEN TO NON-VOLATILE STORAGE. (THAT MEANS DISK.)');
  });
  document.getElementById('wipe-btn').addEventListener('click', () => {
    if (!confirm('WIPE ALL PROGRESS? Research points too. This cannot be undone.')) return;
    G.wipe();
    location.reload();
  });
  document.getElementById('units-btn').addEventListener('click', () => {
    G.state.binaryUnits = !G.state.binaryUnits;
    UI.renderUnitsBtn();
    UI.logSys(G.state.binaryUnits
      ? 'BINARY UNITS: 1 KiB = 1024 BYTES. HOW MEMORY ACTUALLY WORKS.'
      : 'DECIMAL UNITS: 1 KB = 1000 BYTES. HOW DRIVES ARE MARKETED.');
    UI.renderProjects(); UI.renderResources(); UI.renderShop(true);
  });
  setInterval(save, 15000);
  window.addEventListener('beforeunload', () => G.save());

  /* ------------------- main loop ------------------- */
  let lastTick = performance.now();
  let lastScale = '';

  setInterval(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTick) / 1000, 5);
    lastTick = now;

    G.expireEvents().forEach(ev => UI.logSys(`${ev.name} RESOLVED. BACK TO NOMINAL.`));
    G.stats = G.calc();
    G.earn(G.stats.incomePerSec * dt);

    UI.renderMeters();
    UI.refreshAfford();
    UI.renderEvents();

    // unit ladder milestones
    G.checkMilestones().forEach(m => {
      UI.logOk(`<b style="color:var(--phos-bright)">UNIT UNLOCKED: ${m.unit}</b> — ${m.flavor}`);
    });

    // scale tier announcements
    const sc = G.scaleName();
    if (lastScale && sc !== lastScale) UI.logOk(`FACILITY UPGRADED: <b style="color:var(--phos-bright)">${sc}</b>`);
    lastScale = sc;
  }, 100);

  // slower UI passes (project list, bars, facility, shop reveals)
  setInterval(() => {
    UI.renderProjects();
    UI.renderResources();
    UI.renderFacility();
    UI.renderShop();
  }, 1000);

  // random events
  setInterval(() => {
    const ev = G.maybeFireEvent();
    if (!ev) return;
    if (ev.grant) {
      UI.logOk(`${ev.name}: ${ev.log} <b style="color:var(--phos-bright)">+${G.fmtMoney(ev.bonus)}</b>`);
    } else if (ev.bad) {
      UI.logWarn(`${ev.name}: ${ev.log}`);
    } else {
      UI.logOk(`${ev.name}: ${ev.log}`);
    }
  }, 20000);

  // ambient log chatter
  setInterval(() => {
    if (Math.random() < 0.4) UI.logSys(DATA.chatter[Math.floor(Math.random() * DATA.chatter.length)]);
  }, 18000);

  /* ------------------- boot sequence ------------------- */
  const bootEl = document.getElementById('boot');
  const bootLines = document.getElementById('boot-lines');
  let bootDone = false;

  function finishBoot() {
    if (bootDone) return;
    bootDone = true;
    UI.applyTheme(); // saved game may resume on a themed project
    bootEl.classList.add('done');
    document.getElementById('app').classList.add('on');
    UI.logSys('TERMINAL ONLINE. WELCOME, OPERATOR.');
    if (offline > 1) {
      UI.logOk(`UNATTENDED OPERATION EARNED <b style="color:var(--phos-bright)">${G.fmtMoney(offline)}</b> (50% EFFICIENCY WHILE YOU SLEPT)`);
    }
    UI.logSys('PRESS THE DEV KEY TO WRITE CODE. CODE EARNS MONEY. MONEY BUYS HARDWARE.');
    UI.renderMeters(); UI.renderProjects(); UI.renderResources();
    UI.renderFacility(); UI.renderShop(true); UI.renderUnitsBtn();
    lastScale = G.scaleName();
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  DATA.bootLines.forEach((line, i) => {
    const d = document.createElement('div');
    d.className = 'bline';
    d.innerHTML = line || ' ';
    bootLines.appendChild(d);
    setTimeout(() => d.classList.add('show'), reduced ? 0 : 140 * i + Math.random() * 80);
  });
  setTimeout(finishBoot, reduced ? 300 : 140 * DATA.bootLines.length + 700);
  bootEl.addEventListener('click', finishBoot);

})();
