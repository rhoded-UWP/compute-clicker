'use strict';
/* ============================================================
   SCALE OR DIE AI — engine
   Pure game state + math. No DOM in this file (ui.js renders).
   Core formula, from economy.md:
     money/sec = code/sec × code_value × project_value
                 × bottleneck_efficiency × uptime × multipliers
                 − electricity cost
     bottleneck_efficiency = min(1, have/need) across resources
   ============================================================ */

const G = {};

G.SAVE_KEY = 'compute-clicker-v2';

/* ------------------- state ------------------- */
G.freshState = function () {
  return {
    money: 0,
    lifetime: 0,          // lifetime money earned (this run + previous, for prestige)
    runLifetime: 0,       // lifetime money this run (controls reveals)
    clicks: 0,
    codeTyped: 0,
    owned: {},            // producer id -> count
    upgrades: {},         // upgrade id -> true
    research: {},         // research id -> level (SURVIVES prestige)
    rp: 0,                // unspent research points
    rpEarned: 0,          // total RP ever granted (prestige bookkeeping)
    papers: 0,            // times prestiged
    activeProject: 'hello',
    milestones: { KB: true }, // unit-ladder flags (survive prestige); starter laptop already has KBs
    binaryUnits: false,   // false: KB=1000B (decimal), true: KiB=1024B
    lastSeen: Date.now(),
  };
};

G.state = G.freshState();
G.activeEvents = [];      // [{id, name, bad, until(ms), mods}]
G.stats = null;           // cache, recomputed each tick by G.calc()

/* ------------------- formatting ------------------- */
G.NUM_SUFFIX = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];

G.fmtNum = function (n) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + G.fmtNum(-n);
  if (n < 1000) return n < 10 && n % 1 !== 0 ? n.toFixed(1) : Math.floor(n).toString();
  let t = Math.min(Math.floor(Math.log10(n) / 3), G.NUM_SUFFIX.length - 1);
  const v = n / Math.pow(10, t * 3);
  if (t === G.NUM_SUFFIX.length - 1 && v >= 1000) return n.toExponential(2).replace('+', '');
  return (v >= 100 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '')) + G.NUM_SUFFIX[t];
};

G.fmtMoney = n => '$' + G.fmtNum(n);

G.BYTE_DEC = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
G.BYTE_BIN = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB'];

G.fmtBytes = function (n) {
  const bin = G.state.binaryUnits;
  const base = bin ? 1024 : 1000;
  const units = bin ? G.BYTE_BIN : G.BYTE_DEC;
  if (n < 1) return '0 B';
  let t = Math.min(Math.floor(Math.log(n) / Math.log(base)), units.length - 1);
  const v = n / Math.pow(base, t);
  return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2).replace(/0$/, '')) + ' ' + units[t];
};

G.fmtPower = function (kW) {
  if (kW < 1) return Math.round(kW * 1000) + ' W';
  if (kW < 1000) return (kW >= 100 ? kW.toFixed(0) : kW.toFixed(1)) + ' kW';
  if (kW < 1e6) return (kW / 1000).toFixed(1).replace(/\.0$/, '') + ' MW';
  return (kW / 1e6).toFixed(2) + ' GW';
};

/* ------------------- costs ------------------- */
G.producerCost = function (p) {
  return Math.ceil(p.baseCost * Math.pow(p.growth, G.state.owned[p.id] || 0));
};

// capacity producers double each purchase: total = base * (2^owned - 1)
G.capacityTotal = (base, owned) => owned > 0 ? base * (Math.pow(2, owned) - 1) : 0;
G.capacityNext  = (base, owned) => base * Math.pow(2, owned);

G.researchCost = lvl => lvl + 1; // RP for next level

/* ------------------- event modifiers ------------------- */
G.eventMod = function (key) {
  let m = 1;
  for (const ev of G.activeEvents) if (ev.mods && ev.mods[key]) m *= ev.mods[key];
  return m;
};

/* ------------------- the big derived-stats pass ------------------- */
G.calc = function () {
  const s = G.state, own = id => s.owned[id] || 0, up = id => !!s.upgrades[id];
  const rs = id => s.research[id] || 0;

  // ---- one-time upgrade multipliers
  let codeValue = 1, clickMult = 1, allMult = 1, cpuMult = 1, gpuMult = 1,
      serverMult = 1, ramMult = 1, storMult = 1, vramMult = 1, aiMult = 1,
      coolingRatio = 0.8, uptimeFloor = 0.95, elecMult = 1, eventCalm = 0;
  for (const u of DATA.upgrades) {
    if (!up(u.id)) continue;
    const f = u.fx;
    if (f.codeValue)  codeValue  *= f.codeValue;
    if (f.clickMult)  clickMult  *= f.clickMult;
    if (f.allMult)    allMult    *= f.allMult;
    if (f.cpuMult)    cpuMult    *= f.cpuMult;
    if (f.gpuMult)    gpuMult    *= f.gpuMult;
    if (f.serverMult) serverMult *= f.serverMult;
    if (f.ramMult)    ramMult    *= f.ramMult;
    if (f.storMult)   storMult   *= f.storMult;
    if (f.vramMult)   vramMult   *= f.vramMult;
    if (f.aiMult)     aiMult     *= f.aiMult;
    if (f.coolingDelta) coolingRatio -= f.coolingDelta;
    if (f.uptime)     uptimeFloor = Math.max(uptimeFloor, f.uptime);
    if (f.elecMult)   elecMult   *= f.elecMult;
    if (f.eventCalm)  eventCalm  += f.eventCalm;
  }
  coolingRatio = Math.max(0.15, coolingRatio);

  // ---- research multipliers (survive prestige)
  allMult    *= Math.pow(1.25, rs('algorithms'));
  const ramReqMult = Math.pow(0.85, rs('datastruct'));
  const osMult     = Math.pow(1.15, rs('os'));
  serverMult *= Math.pow(1.15, rs('networking'));
  aiMult     *= Math.pow(1.2,  rs('ml'));
  const sustain = Math.pow(0.85, rs('sustain'));

  // ---- event modifiers (temporary)
  cpuMult  *= G.eventMod('cpuMult');
  gpuMult  *= G.eventMod('gpuMult');
  ramMult  *= G.eventMod('ramMult');
  storMult *= G.eventMod('storMult');
  clickMult *= G.eventMod('clickMult');
  elecMult  *= G.eventMod('elecMult');
  const powerCapMult = G.eventMod('powerCapMult');

  // ---- sum producers (starting from the trusty old laptop:
  //      1 compute, 4 MB RAM, 100 KB free disk — enough for Hello World)
  let clickCode = 1, autoCode = 0, compute = 1, gpus = 0,
      ramCap = 4e6, storCap = 100e3, vramCap = 0,
      slots = 4, serversOwned = own('server'),   // 4 free "closet" slots before racks
      powerUseKW = 0, powerCapKW = 3;            // 3 kW wall outlet to start
  let infraMult = 1;
  for (const p of DATA.producers) {
    const n = own(p.id);
    if (!n) continue;
    let unitMult = 1;
    if (p.id === 'cpu') unitMult = cpuMult;
    if (p.id === 'gpu' || p.id === 'cluster') unitMult = gpuMult;
    if (p.id === 'server') unitMult = serverMult;
    if (p.clickCode)   clickCode += p.clickCode * n;
    if (p.autoCode)    autoCode  += p.autoCode * n * unitMult * (p.id === 'scriptbot' ? osMult : 1);
    if (p.compute)     compute   += p.compute * n * unitMult;
    if (p.gpus)        gpus      += p.gpus * n;
    if (p.vram)        vramCap   += p.vram * n;
    if (p.capRam)      ramCap    += G.capacityTotal(p.capRam, n);
    if (p.capStor)     storCap   += G.capacityTotal(p.capStor, n);
    if (p.slots)       slots     += p.slots * n;
    if (p.powerKW)     powerUseKW += p.powerKW * n;
    if (p.capPowerKW)  powerCapKW += p.capPowerKW * n;
    if (p.multAll)     infraMult *= Math.pow(p.multAll, n);
  }
  ramCap  *= ramMult;
  storCap *= storMult;
  vramCap *= vramMult;
  allMult *= infraMult;

  // ---- power & cooling (economy.md level 7+)
  const itKW = powerUseKW * sustain;
  const coolingKW = itKW * coolingRatio;
  const totalKW = itKW + coolingKW;
  const capKW = powerCapKW * powerCapMult;
  const powerFactor = totalKW > 0 ? Math.min(1, capKW / totalKW) : 1;

  // electricity bill: $0.12/kWh game rate
  const elecPerSec = totalKW * 0.12 * elecMult / 3600;

  // ---- uptime
  const uptime = uptimeFloor;

  // ---- active project + bottleneck efficiency
  const proj = DATA.projects.find(p => p.id === s.activeProject) || DATA.projects[0];
  const req = proj.req;
  const terms = [
    { key: 'STORAGE', have: storCap,  need: req.stor },
    { key: 'RAM',     have: ramCap,   need: (req.ram || 0) * ramReqMult },
    { key: 'COMPUTE', have: compute,  need: req.compute },
  ];
  if (req.gpus) terms.push({ key: 'GPUS', have: gpus,    need: req.gpus });
  if (req.vram) terms.push({ key: 'VRAM', have: vramCap, need: req.vram });

  let efficiency = 1, bottleneck = null, bnRatio = 1;
  for (const t of terms) {
    const r = t.need > 0 ? Math.min(1, t.have / t.need) : 1;
    t.ratio = r;
    efficiency *= r;
    if (r < bnRatio) { bnRatio = r; bottleneck = t; }
  }
  efficiency *= powerFactor;
  if (powerFactor < bnRatio) { bnRatio = powerFactor; bottleneck = { key: 'POWER', have: capKW, need: totalKW, power: true }; }

  const projValue = proj.value * (proj.ai ? aiMult : 1);

  // ---- final rates
  const moneyPerCode = codeValue * projValue * efficiency * uptime * allMult;
  const clickValue   = clickCode * clickMult * moneyPerCode;
  const grossPerSec  = autoCode * moneyPerCode;
  const incomePerSec = grossPerSec - elecPerSec;

  return {
    clickCode, autoCode, compute, gpus, ramCap, storCap, vramCap,
    slots, serversOwned,
    powerUseKW: totalKW, powerCapKW: capKW, coolingKW, powerFactor, coolingRatio,
    uptime, elecPerSec, elecPerDay: elecPerSec * 86400,
    proj, terms, efficiency, bottleneck,
    codeValue, projValue, allMult,
    clickValue, grossPerSec, incomePerSec,
    eventCalm,
  };
};

/* ------------------- actions ------------------- */
G.canBuyProducer = function (p) {
  const st = G.stats;
  if (G.state.money < G.producerCost(p)) return false;
  if (p.needsSlot && st && st.serversOwned >= st.slots) return false;
  return true;
};

G.buyProducer = function (p) {
  if (!G.canBuyProducer(p)) return false;
  G.state.money -= G.producerCost(p);
  G.state.owned[p.id] = (G.state.owned[p.id] || 0) + 1;
  return true;
};

G.buyUpgrade = function (u) {
  if (G.state.upgrades[u.id] || G.state.money < u.cost) return false;
  G.state.money -= u.cost;
  G.state.upgrades[u.id] = true;
  return true;
};

G.buyResearch = function (r) {
  const lvl = G.state.research[r.id] || 0;
  const cost = G.researchCost(lvl);
  if (lvl >= r.max || G.state.rp < cost) return false;
  G.state.rp -= cost;
  G.state.research[r.id] = lvl + 1;
  return true;
};

G.click = function () {
  const st = G.stats || G.calc();
  const gain = st.clickValue;
  G.earn(gain);
  G.state.clicks++;
  G.state.codeTyped += st.clickCode;
  return gain;
};

G.earn = function (amount) {
  G.state.money += amount;
  if (amount > 0) { G.state.lifetime += amount; G.state.runLifetime += amount; }
  if (G.state.money < 0) G.state.money = 0;
};

/* ------------------- visibility gates ------------------- */
G.unlockMet = function (unlock) {
  if (!unlock) return true;
  if (unlock.lifetime && G.state.runLifetime < unlock.lifetime) return false;
  if (unlock.producer) {
    const [id, n] = unlock.producer;
    if ((G.state.owned[id] || 0) < n) return false;
  }
  return true;
};

G.visibleProducers = function () {
  return DATA.producers.filter(p =>
    (G.state.owned[p.id] || 0) > 0 ||
    (G.unlockMet(p.unlock) && G.state.runLifetime >= p.baseCost * 0.15) ||
    (!p.unlock && G.state.runLifetime >= p.baseCost * 0.15) ||
    p.baseCost <= 50
  );
};

G.visibleUpgrades = function () {
  return DATA.upgrades
    .filter(u => !G.state.upgrades[u.id])
    .map(u => ({ u, ready: G.unlockMet(u.unlock) && G.state.runLifetime >= u.cost * 0.2 }))
    .filter(x => x.ready || G.state.runLifetime >= x.u.cost * 0.05);
};

G.visibleProjects = function () {
  return DATA.projects.map(p => ({ p, revealed: G.state.runLifetime >= p.reveal }));
};

/* ------------------- prestige ------------------- */
// research_points = scaled log of lifetime earnings (economy.md uses log10)
G.pendingRP = function () {
  const lt = Math.max(G.state.lifetime, 1);
  const total = Math.max(0, Math.floor(3 * (Math.log10(lt) - 7)));
  return Math.max(0, total - G.state.rpEarned);
};

G.prestigeUnlocked = () => G.state.lifetime >= 1e8 || G.state.papers > 0;

G.prestige = function () {
  const gain = G.pendingRP();
  if (gain <= 0) return 0;
  const keep = G.state;
  const fresh = G.freshState();
  fresh.research   = keep.research;
  fresh.rp         = keep.rp + gain;
  fresh.rpEarned   = keep.rpEarned + gain;
  fresh.papers     = keep.papers + 1;
  fresh.lifetime   = keep.lifetime;
  fresh.milestones = keep.milestones;
  fresh.binaryUnits = keep.binaryUnits;
  G.state = fresh;
  G.activeEvents = [];
  G.save();
  return gain;
};

/* ------------------- random events ------------------- */
G.maybeFireEvent = function () {
  const s = G.state;
  if (s.runLifetime < 10e3) return null;            // calm early game
  if (G.activeEvents.length >= 2) return null;
  const st = G.stats || G.calc();
  const calmMult = Math.pow(0.5, st.eventCalm) * Math.pow(0.7, s.research.cybersec || 0);
  const pool = DATA.events.filter(e => {
    if (G.activeEvents.some(a => a.id === e.id)) return false;
    if ((e.id === 'coolfail' || e.id === 'spike') && st.powerUseKW < 1) return false;
    if (e.id === 'driverup' && (s.owned.gpu || 0) === 0) return false;
    return true;
  });
  if (!pool.length) return null;
  const e = pool[Math.floor(Math.random() * pool.length)];
  const chance = e.bad ? 0.30 * calmMult : 0.30;
  if (Math.random() > chance) return null;

  if (e.grant) {
    const bonus = Math.max(100, st.grossPerSec * 60);
    G.earn(bonus);
    return { ...e, bonus };
  }
  let mods = e.mods;
  let suffix = '';
  if (e.coinflip) {
    const good = Math.random() < 0.5;
    mods = { gpuMult: good ? 2 : 0.5 };
    suffix = good ? ' IT HELPED. GPU ×2!' : ' IT DID NOT HELP. GPU ×0.5.';
  }
  const ev = { id: e.id, name: e.name, bad: e.bad, mods, until: Date.now() + e.dur * 1000, log: e.log + suffix };
  G.activeEvents.push(ev);
  return ev;
};

G.expireEvents = function () {
  const now = Date.now();
  const expired = G.activeEvents.filter(e => e.until <= now);
  G.activeEvents = G.activeEvents.filter(e => e.until > now);
  return expired;
};

/* ------------------- unit ladder ------------------- */
G.checkMilestones = function () {
  const st = G.stats;
  if (!st) return [];
  const hits = [];
  for (const m of DATA.unitLadder) {
    if (st.storCap >= m.at && !G.state.milestones[m.unit]) {
      G.state.milestones[m.unit] = true;
      hits.push(m);
    }
  }
  return hits;
};

G.scaleName = function () {
  let name = DATA.scales[0].name;
  for (const sc of DATA.scales) if (sc.test(G.state)) name = sc.name;
  return name;
};

/* ------------------- save / load ------------------- */
G.save = function () {
  G.state.lastSeen = Date.now();
  try { localStorage.setItem(G.SAVE_KEY, JSON.stringify(G.state)); } catch (e) { /* storage full/blocked */ }
};

G.load = function () {
  let offline = 0;
  try {
    const raw = localStorage.getItem(G.SAVE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    G.state = Object.assign(G.freshState(), data);
    // offline progress: 50% efficiency, capped at 8 hours
    const away = Math.min((Date.now() - (G.state.lastSeen || Date.now())) / 1000, 8 * 3600);
    G.stats = G.calc();
    offline = Math.max(0, G.stats.incomePerSec) * away * 0.5;
    if (offline > 0) G.earn(offline);
  } catch (e) { /* corrupted save — start fresh */ }
  return offline;
};

G.wipe = function () {
  try { localStorage.removeItem(G.SAVE_KEY); } catch (e) { /* ignore */ }
};
