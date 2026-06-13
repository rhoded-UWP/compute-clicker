'use strict';
/* ============================================================
   SCALE OR DIE AI — UI rendering
   Reads G.state / G.stats, writes DOM. Rebuilds list DOM only
   when the visible set changes (signature check) so hover,
   press, and focus state survive the refresh tick.
   ============================================================ */

const UI = {};

const $ = id => document.getElementById(id);

UI.els = {};
UI.activeTab = 'hw';

UI.init = function () {
  UI.els = {
    money: $('m-money'), income: $('m-income'), code: $('m-code'), scale: $('m-scale'),
    clickVal: $('click-val'), codeStream: $('code-stream'),
    projects: $('project-list'), resBars: $('res-bars'), facility: $('facility-stats'),
    eventBanner: $('event-banner'),
    shopList: $('shop-list'), log: $('log'),
    die: $('die'), corePanel: $('core-panel'),
    saveState: $('save-state'), unitsBtn: $('units-btn'),
    ledTmp: $('led-tmp'),
  };
};

/* ------------------- per-project themes ------------------- */
/* The active project may carry theme:'name' (data.js); we set
   <body data-theme> and css/themes.css does the rest. Swap is
   a slow cross-fade via #app opacity — never a hard flash. */
UI.DIE_LABELS = { myspace: '< >' }; // per-theme dev-key glyph; default is { }

UI.applyTheme = function () {
  const proj = DATA.projects.find(p => p.id === G.state.activeProject);
  const theme = (proj && proj.theme) || '';
  if ((document.body.dataset.theme || '') === theme) return;
  const app = $('app');
  const set = () => {
    if (theme) document.body.dataset.theme = theme;
    else delete document.body.dataset.theme;
    $('die-label').textContent = UI.DIE_LABELS[theme] || '{ }';
  };
  if (!app.classList.contains('on')) { set(); return; } // pre-boot: no fade needed
  app.classList.add('theme-swap');
  setTimeout(() => { set(); app.classList.remove('theme-swap'); }, 420);
};

/* ------------------- log ------------------- */
UI.log = function (msg, color) {
  const d = document.createElement('div');
  d.className = 'ln';
  const t = new Date();
  const ts = [t.getHours(), t.getMinutes(), t.getSeconds()].map(x => String(x).padStart(2, '0')).join(':');
  d.innerHTML = `<b style="color:${color || 'var(--phos-dim)'}">[${ts}]</b> ${msg}`;
  UI.els.log.appendChild(d);
  while (UI.els.log.children.length > 7) UI.els.log.removeChild(UI.els.log.firstChild);
};
UI.logSys  = msg => UI.log(`<b style="color:var(--phos-bright)">[SYS]</b> ${msg}`);
UI.logOk   = msg => UI.log(`<b style="color:var(--ok)">[OK]</b> ${msg}`);
UI.logWarn = msg => UI.log(`<b style="color:var(--warn)">[ALERT]</b> ${msg}`);

/* ------------------- header meters ------------------- */
UI.renderMeters = function () {
  const st = G.stats;
  UI.els.money.textContent = G.fmtMoney(G.state.money);
  UI.els.income.innerHTML = (st.incomePerSec < 0 ? '-' : '') + G.fmtMoney(Math.abs(st.incomePerSec)) + ' <span class="unit">/s</span>';
  UI.els.income.classList.toggle('neg', st.incomePerSec < 0);
  UI.els.code.innerHTML = G.fmtNum(st.autoCode) + ' <span class="unit">LOC/s</span>';
  UI.els.scale.textContent = G.scaleName();
  UI.els.clickVal.textContent = `+${G.fmtNum(st.clickCode)} LOC → ${G.fmtMoney(st.clickValue)} / press`;
  UI.els.ledTmp.classList.toggle('on', st.powerFactor < 1);
  UI.els.ledTmp.classList.toggle('red', st.powerFactor < 1);
};

/* ------------------- mission control ------------------- */
UI.projSig = '';
UI.renderProjects = function () {
  const vis = G.visibleProjects();
  const sig = vis.map(x => x.p.id + (x.revealed ? 1 : 0)).join() + '|' + G.state.activeProject;
  if (sig !== UI.projSig) {
    UI.projSig = sig;
    UI.els.projects.innerHTML = '';
    vis.forEach(({ p, revealed }) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.dataset.proj = p.id;
      el.className = 'proj' + (p.id === G.state.activeProject ? ' active' : '') + (revealed ? '' : ' locked');
      el.disabled = !revealed;
      if (!revealed) {
        el.innerHTML = `<div class="proj-top"><span class="proj-name">▓▓▓ CLASSIFIED ▓▓▓</span><span class="proj-val">×???</span></div>
          <div class="proj-eff">Earn more to reveal this contract.</div>`;
        el.setAttribute('aria-label', 'Classified project. Earn more to reveal.');
      } else {
        el.setAttribute('aria-label', `Run project ${p.name}, value times ${G.fmtNum(p.value)}`);
        el.innerHTML = `<div class="proj-top"><span class="proj-name">${p.name}</span><span class="proj-val">×${G.fmtNum(p.value)}</span></div>
          <div class="chips"></div><div class="proj-eff"></div>`;
        el.addEventListener('click', () => {
          if (G.state.activeProject !== p.id) {
            G.state.activeProject = p.id;
            UI.projSig = '';
            UI.applyTheme();
            UI.logSys(`PROJECT SWITCHED: <b style="color:var(--phos-bright)">${p.name}</b> — "${p.flavor}"`);
          }
        });
      }
      UI.els.projects.appendChild(el);
    });
  }
  // live data: requirement chips + efficiency on each revealed row
  const st = G.stats;
  vis.forEach(({ p, revealed }, i) => {
    if (!revealed) return;
    const el = UI.els.projects.children[i];
    if (!el) return;
    const chips = el.querySelector('.chips');
    const effEl = el.querySelector('.proj-eff');
    if (!chips) return;
    const reqs = UI.reqChips(p);
    chips.innerHTML = reqs.html;
    if (p.id === G.state.activeProject) {
      const bn = st.bottleneck && st.efficiency < 0.999
        ? ` — BOTTLENECK: <span class="bn">${st.bottleneck.key}</span>` : '';
      effEl.innerHTML = `RUNNING AT <b>${(st.efficiency * 100).toFixed(st.efficiency < 0.1 ? 2 : 0)}%</b> EFFICIENCY${bn}`;
    } else {
      effEl.innerHTML = reqs.allMet ? 'READY — FULL SPEED' : 'RUNS SLOWLY UNTIL REQUIREMENTS MET';
    }
  });
};

UI.reqChips = function (p) {
  const st = G.stats, r = p.req;
  const dsMult = Math.pow(0.85, G.state.research.datastruct || 0);
  const items = [
    ['STG', st.storCap, r.stor, G.fmtBytes],
    ['RAM', st.ramCap, (r.ram || 0) * dsMult, G.fmtBytes],
    ['CPU', st.compute, r.compute, G.fmtNum],
  ];
  if (r.gpus) items.push(['GPU', st.gpus, r.gpus, G.fmtNum]);
  if (r.vram) items.push(['VRAM', st.vramCap, r.vram, G.fmtBytes]);
  let allMet = true, html = '';
  for (const [label, have, need, fmt] of items) {
    if (!need) continue;
    const met = have >= need;
    if (!met) allMet = false;
    html += `<span class="chip ${met ? 'met' : 'unmet'}">${label} ${fmt(need)} ${met ? '✓' : '✗'}</span>`;
  }
  return { html, allMet };
};

UI.BAR_DEFS = [
  { key: 'STORAGE', have: st => st.storCap,  need: st => st.proj.req.stor, fmt: G => G.fmtBytes },
  { key: 'RAM',     have: st => st.ramCap,   need: st => st.proj.req.ram || 0, fmt: G => G.fmtBytes },
  { key: 'COMPUTE', have: st => st.compute,  need: st => st.proj.req.compute, fmt: G => G.fmtNum },
  { key: 'VRAM',    have: st => st.vramCap,  need: st => st.proj.req.vram || 0, fmt: G => G.fmtBytes },
];

UI.renderResources = function () {
  const st = G.stats;
  const dsMult = Math.pow(0.85, G.state.research.datastruct || 0);
  let html = '';
  for (const def of UI.BAR_DEFS) {
    let need = def.need(st);
    if (def.key === 'RAM') need *= dsMult;
    if (!need && def.key === 'VRAM' && st.vramCap === 0) continue;
    const have = def.have(st);
    const ratio = need > 0 ? Math.min(1, have / need) : 1;
    const fmt = def.fmt(G);
    html += `<div class="rbar ${ratio >= 1 ? 'met' : 'unmet'}">
      <div class="rrow"><span>${def.key}</span><b>${fmt(have)}${need ? ' / ' + fmt(need) : ''}</b></div>
      <div class="track"><div class="fill" style="width:${(ratio * 100).toFixed(1)}%"></div></div>
    </div>`;
  }
  // power bar: usage vs capacity (full bar = at capacity = bad)
  if (st.powerUseKW > 0.01) {
    const ratio = Math.min(1, st.powerUseKW / st.powerCapKW);
    html += `<div class="rbar ${ratio < 1 ? 'met' : 'unmet'}">
      <div class="rrow"><span>POWER DRAW</span><b>${G.fmtPower(st.powerUseKW)} / ${G.fmtPower(st.powerCapKW)}</b></div>
      <div class="track"><div class="fill" style="width:${(ratio * 100).toFixed(1)}%"></div></div>
    </div>`;
  }
  UI.els.resBars.innerHTML = html;
};

UI.renderFacility = function () {
  const st = G.stats;
  const ninesLabel = { '0.95': 'one wobbly nine', '0.99': 'two nines', '0.999': 'three nines', '0.9999': 'four nines' }[String(st.uptime)] || '';
  let html = `
    <div class="row"><span>SERVER SLOTS</span><b>${st.serversOwned} / ${st.slots} USED</b></div>
    <div class="row"><span>UPTIME</span><b>${(st.uptime * 100).toFixed(st.uptime >= 0.999 ? 2 : 1)}%${ninesLabel ? ' (' + ninesLabel + ')' : ''}</b></div>`;
  if (st.powerUseKW > 0.01) {
    html += `<div class="row"><span>POWER FACTOR</span><b class="${st.powerFactor < 1 ? 'bad' : ''}">${(st.powerFactor * 100).toFixed(0)}%</b></div>
    <div class="row"><span>COOLING OVERHEAD</span><b>+${(st.coolingRatio * 100).toFixed(0)}% of IT power</b></div>
    <div class="row"><span>ELECTRIC BILL</span><b class="${st.elecPerDay > 0 ? '' : ''}">${G.fmtMoney(st.elecPerDay)}/day</b></div>`;
  }
  if (G.state.papers > 0) {
    html += `<div class="row"><span>PAPERS PUBLISHED</span><b>${G.state.papers}</b></div>
    <div class="row"><span>RESEARCH POINTS</span><b>${G.state.rp} RP</b></div>`;
  }
  UI.els.facility.innerHTML = html;
};

UI.renderEvents = function () {
  const b = UI.els.eventBanner;
  if (!G.activeEvents.length) { b.hidden = true; return; }
  const ev = G.activeEvents[0];
  const left = Math.max(0, Math.ceil((ev.until - Date.now()) / 1000));
  b.hidden = false;
  b.className = ev.bad ? '' : 'good';
  b.textContent = `⚠ ${ev.name} — ${left}s`;
};

/* ------------------- shop ------------------- */
UI.shopSig = '';
UI.renderShop = function (force) {
  const tab = UI.activeTab;
  let sig = tab + ':';
  if (tab === 'hw') sig += G.visibleProducers().map(p => p.id + (G.state.owned[p.id] || 0)).join();
  else if (tab === 'up') sig += G.visibleUpgrades().map(x => x.u.id + (x.ready ? 1 : 0)).join();
  else sig += DATA.research.map(r => r.id + (G.state.research[r.id] || 0)).join() + '|' + G.state.rp + '|' + G.pendingRP() + '|' + G.prestigeUnlocked();

  if (!force && sig === UI.shopSig) { UI.refreshAfford(); return; }
  UI.shopSig = sig;
  const list = UI.els.shopList;
  list.innerHTML = '';

  if (tab === 'hw') {
    G.visibleProducers().forEach(p => {
      const owned = G.state.owned[p.id] || 0;
      const cost = G.producerCost(p);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'item' + (G.canBuyProducer(p) ? ' afford' : '');
      let extra = '';
      if (p.capRam)  extra = ` <span class="fx">NEXT: +${G.fmtBytes(G.capacityNext(p.capRam, owned))} RAM</span>`;
      if (p.capStor) extra = ` <span class="fx">NEXT: +${G.fmtBytes(G.capacityNext(p.capStor, owned))}</span>`;
      let slotNote = '';
      if (p.needsSlot && G.stats && G.stats.serversOwned >= G.stats.slots) {
        slotNote = ' <span style="color:var(--warn)">NO RACK SPACE — BUY A RACK</span>';
      }
      el.setAttribute('aria-label', `Buy ${p.name}, costs ${G.fmtMoney(cost)}, owned ${owned}`);
      el.innerHTML = `
        <div class="glyph" aria-hidden="true">${p.glyph}</div>
        <div>
          <div class="name">${p.name}</div>
          <div class="desc">${p.desc}${extra}${slotNote}</div>
          <div class="vocab">TEACHES: ${p.vocab}</div>
        </div>
        <div><div class="cost">${G.fmtMoney(cost)}</div><div class="owned">×${owned}</div></div>`;
      el.addEventListener('click', () => {
        if (!G.buyProducer(p)) return;
        el.classList.remove('bought-flash'); void el.offsetWidth; el.classList.add('bought-flash');
        UI.logOk(`${p.name} ×${G.state.owned[p.id]} ONLINE.`);
        UI.shopSig = ''; UI.renderShop();
        UI.renderMeters();
      });
      list.appendChild(el);
    });
  } else if (tab === 'up') {
    const ups = G.visibleUpgrades();
    if (!ups.length) {
      list.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--phos-faint);font-family:var(--display);font-size:18px;letter-spacing:.2em">NOTHING ON THE SHELF — YET</div>';
      return;
    }
    ups.forEach(({ u, ready }) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'item' + (ready && G.state.money >= u.cost ? ' afford' : '') + (ready ? '' : ' locked');
      el.disabled = !ready;
      el.setAttribute('aria-label', ready ? `Buy upgrade ${u.name}, costs ${G.fmtMoney(u.cost)}` : 'Locked upgrade');
      el.innerHTML = `
        <div class="glyph" aria-hidden="true">⚙</div>
        <div>
          <div class="name">${ready ? u.name : '▓▓▓ ENCRYPTED ▓▓▓'}</div>
          <div class="desc">${ready ? u.desc : 'Keep building to decrypt this.'}</div>
          ${ready ? `<div class="vocab">TEACHES: ${u.vocab}</div>` : ''}
        </div>
        <div><div class="cost">${ready ? G.fmtMoney(u.cost) : '???'}</div></div>`;
      if (ready) el.addEventListener('click', () => {
        if (!G.buyUpgrade(u)) return;
        UI.logOk(`UPGRADE INSTALLED: ${u.name}`);
        UI.shopSig = ''; UI.renderShop();
        UI.renderMeters();
      });
      list.appendChild(el);
    });
  } else {
    UI.renderResearchTab(list);
  }
};

UI.renderResearchTab = function (list) {
  const box = document.createElement('div');
  box.id = 'prestige-box';
  const pending = G.pendingRP();
  if (!G.prestigeUnlocked()) {
    box.innerHTML = `<div class="ttl">RESEARCH DIVISION</div>
      <div class="sub">Reach <b style="color:var(--phos-bright)">$100M lifetime earnings</b> to publish your first breakthrough paper.<br>
      Publishing resets your hardware but grants permanent Research Points.</div>`;
  } else {
    box.innerHTML = `<div class="ttl">PUBLISH BREAKTHROUGH PAPER</div>
      <div class="sub">Resets ALL hardware, upgrades, and funds.<br>
      Research and its bonuses are <b style="color:var(--ok)">permanent</b>.<br>
      Unspent RP: <b style="color:var(--phos-bright)">${G.state.rp}</b> · Pending on publish: <b style="color:var(--ok)">+${pending} RP</b></div>
      <button type="button" id="prestige-btn" ${pending <= 0 ? 'disabled' : ''}>⟪ PUBLISH (+${pending} RP) ⟫</button>`;
  }
  list.appendChild(box);
  const btn = box.querySelector('#prestige-btn');
  if (btn) btn.addEventListener('click', () => {
    if (!confirm(`Publish a breakthrough paper for +${G.pendingRP()} Research Points?\n\nThis resets your hardware, upgrades, and money. Research is permanent.`)) return;
    const gained = G.prestige();
    UI.shopSig = ''; UI.projSig = '';
    UI.applyTheme(); // prestige resets the active project, and with it the look
    UI.renderShop(true); UI.renderProjects();
    UI.logOk(`PAPER PUBLISHED! +${gained} RP. The hardware is gone. The knowledge is forever.`);
  });

  DATA.research.forEach(r => {
    const lvl = G.state.research[r.id] || 0;
    const cost = G.researchCost(lvl);
    const maxed = lvl >= r.max;
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'item' + (!maxed && G.state.rp >= cost ? ' afford' : '') + (maxed ? ' locked' : '');
    el.disabled = maxed;
    const pips = Array.from({ length: r.max }, (_, i) => `<span class="${i < lvl ? '' : 'off'}">●</span>`).join('');
    el.setAttribute('aria-label', `Research ${r.name}, level ${lvl} of ${r.max}${maxed ? ', maxed' : ', costs ' + cost + ' research points'}`);
    el.innerHTML = `
      <div class="glyph" aria-hidden="true">✎</div>
      <div>
        <div class="name">${r.name}</div>
        <div class="desc">${r.desc}</div>
        <div class="vocab pips">${pips}</div>
      </div>
      <div><div class="cost">${maxed ? 'MAX' : cost + ' RP'}</div></div>`;
    if (!maxed) el.addEventListener('click', () => {
      if (!G.buyResearch(r)) return;
      UI.logOk(`RESEARCH ADVANCED: ${r.name} LV.${G.state.research[r.id]}`);
      UI.shopSig = ''; UI.renderShop();
    });
    list.appendChild(el);
  });
};

UI.refreshAfford = function () {
  const items = UI.els.shopList.querySelectorAll('.item');
  let idx = 0;
  if (UI.activeTab === 'hw') {
    G.visibleProducers().forEach(p => {
      const el = items[idx++];
      if (el) el.classList.toggle('afford', G.canBuyProducer(p));
    });
  } else if (UI.activeTab === 'up') {
    G.visibleUpgrades().forEach(({ u, ready }) => {
      const el = items[idx++];
      if (el && ready) el.classList.toggle('afford', G.state.money >= u.cost);
    });
  } else {
    DATA.research.forEach(r => {
      const el = items[idx++];
      const lvl = G.state.research[r.id] || 0;
      if (el && lvl < r.max) el.classList.toggle('afford', G.state.rp >= G.researchCost(lvl));
    });
  }
};

/* ------------------- click feedback ------------------- */
UI.floatNum = function (text, clientX, clientY) {
  const r = UI.els.corePanel.getBoundingClientRect();
  if (clientX === undefined) {
    const d = UI.els.die.getBoundingClientRect();
    clientX = d.left + d.width / 2;
    clientY = d.top + d.height / 4;
  }
  const f = document.createElement('div');
  f.className = 'float-num';
  f.textContent = text;
  f.style.left = (clientX - r.left + (Math.random() * 40 - 20)) + 'px';
  f.style.top = (clientY - r.top - 16) + 'px';
  UI.els.corePanel.appendChild(f);
  setTimeout(() => f.remove(), 1000);
};

UI.typeSnippet = function () {
  const s = DATA.codeSnippets[Math.floor(Math.random() * DATA.codeSnippets.length)];
  UI.els.codeStream.textContent = '> ' + s;
};

UI.renderUnitsBtn = function () {
  UI.els.unitsBtn.textContent = G.state.binaryUnits ? 'UNITS: KiB (×1024)' : 'UNITS: KB (×1000)';
};
