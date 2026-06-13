'use strict';
/* ============================================================
   SCALE OR DIE AI — game data
   All numbers come from economy.md. Edit balance here, not in
   engine.js. Byte values are plain numbers (1 GB = 1e9).
   ============================================================ */

const DATA = {};

/* ------------------------------------------------------------
   PRODUCERS (HARDWARE tab) — repeatable purchases.
   cost = baseCost * growth^owned          (economy.md formula)
   Capacity items (capRam/capStor) DOUBLE each purchase:
   total capacity = base * (2^owned - 1). Cost growth is set
   above 2 so price outpaces capacity — that IS the lesson.
   ------------------------------------------------------------ */
DATA.producers = [
  { id:'keyboard', glyph:'⌨', name:'MECHANICAL KEYBOARD', vocab:'input device',
    desc:'<span class="fx">+1 code/click.</span> Clack therapy included.',
    baseCost:10, growth:1.12, clickCode:1 },

  { id:'scriptbot', glyph:'♺', name:'SCRIPT BOT', vocab:'automation',
    desc:'<span class="fx">+1 code/sec.</span> It copy-pastes so you don\'t have to.',
    baseCost:50, growth:1.12, autoCode:1 },

  { id:'cpu', glyph:'▦', name:'CPU CORE', vocab:'CPU · clock speed · cores',
    desc:'<span class="fx">+5 compute, +0.5 code/sec.</span> One honest core doing honest work.',
    baseCost:200, growth:1.17, compute:5, autoCode:0.5 },

  { id:'ram', glyph:'▤', name:'RAM STICK', vocab:'RAM — working memory',
    desc:'Each stick <span class="fx">DOUBLES</span> the last: 4 MB, 8 MB, 16 MB… exponential growth, live.',
    baseCost:125, growth:2.3, capRam:4e6 },

  { id:'ssd', glyph:'▣', name:'STORAGE DRIVE', vocab:'storage — persistent data',
    desc:'Each drive <span class="fx">DOUBLES</span> the last: 50 MB, 100 MB, 200 MB…',
    baseCost:400, growth:2.2, capStor:50e6 },

  { id:'gpu', glyph:'▥', name:'GPU', vocab:'GPU · parallelism · VRAM',
    desc:'<span class="fx">+200 compute, +8 GB VRAM.</span> Does 10,000 small things at once. Uses 0.7 kW.',
    baseCost:5e3, growth:1.25, compute:200, vram:8e9, gpus:1, powerKW:0.7,
    unlock:{ lifetime:2e3 } },

  { id:'server', glyph:'≣', name:'SERVER', vocab:'server · uptime',
    desc:'<span class="fx">+100 code/sec, +500 compute.</span> Needs a rack slot. Uses 0.5 kW.',
    baseCost:50e3, growth:1.30, autoCode:100, compute:500, powerKW:0.5, needsSlot:true,
    unlock:{ lifetime:20e3 } },

  { id:'rack', glyph:'☰', name:'42U RACK', vocab:'rack unit (U)',
    desc:'<span class="fx">+21 server slots</span> (42U ÷ 2U per server). Hardware is physical.',
    baseCost:500e3, growth:1.30, slots:21, powerKW:1,
    unlock:{ lifetime:200e3 } },

  { id:'pdu', glyph:'⚡', name:'POWER DIST. UNIT', vocab:'PDU · kilowatts',
    desc:'<span class="fx">+25 kW power capacity.</span> Electricity is the real currency.',
    baseCost:250e3, growth:1.5, capPowerKW:25,
    unlock:{ producer:['server',1] } },

  { id:'generator', glyph:'⛽', name:'BACKUP GENERATOR', vocab:'redundancy',
    desc:'<span class="fx">+150 kW power capacity.</span> Keeps the lights on when the grid blinks.',
    baseCost:2e6, growth:1.6, capPowerKW:150,
    unlock:{ producer:['pdu',2] } },

  { id:'cluster', glyph:'⊞', name:'GPU CLUSTER', vocab:'cluster computing',
    desc:'Counts as <span class="fx">8 GPUs: +2,000 compute, +64 GB VRAM.</span> Uses 6 kW.',
    baseCost:50e6, growth:1.35, compute:2e3, vram:64e9, gpus:8, powerKW:6,
    unlock:{ lifetime:10e6 } },

  { id:'pbarray', glyph:'⛁', name:'PETABYTE ARRAY', vocab:'petabyte',
    desc:'Each array <span class="fx">DOUBLES</span>: 1 PB, 2 PB, 4 PB… your dataset gets its own weather system.',
    baseCost:1e9, growth:1.45, capStor:1e15,
    unlock:{ lifetime:200e6 } },

  { id:'datacenter', glyph:'⌗', name:'DATA CENTER', vocab:'infrastructure · megawatts',
    desc:'<span class="fx">×1.5 ALL output, +50 rack slots, +20k compute, +5 MW capacity.</span> Drinks a river, heats a county.',
    baseCost:50e6, growth:1.40, multAll:1.5, slots:50, compute:20e3, capPowerKW:5e3, powerKW:500,
    unlock:{ lifetime:20e6 } },

  { id:'substation', glyph:'⏚', name:'SUBSTATION', vocab:'electrical grid',
    desc:'<span class="fx">+50 MW power capacity.</span> Now you negotiate with the grid.',
    baseCost:200e6, growth:1.5, capPowerKW:50e3,
    unlock:{ producer:['datacenter',1] } },

  { id:'campus', glyph:'✦', name:'AI CAMPUS', vocab:'hyperscale · gigawatts',
    desc:'<span class="fx">×3 ALL output, +500k compute.</span> Visible from orbit. So is the power bill (20 MW).',
    baseCost:10e9, growth:1.40, multAll:3, compute:500e3, powerKW:20e3,
    unlock:{ producer:['datacenter',2] } },
];

/* ------------------------------------------------------------
   UPGRADES (one-time multipliers)
   effect keys: codeValue, clickMult, allMult, cpuMult, gpuMult,
   serverMult, ramMult, storMult, vramMult, aiMult (gpu projects),
   coolingDelta (subtracts from cooling ratio), uptime (sets
   floor), elecMult, eventCalm (halves bad-event chance)
   ------------------------------------------------------------ */
DATA.upgrades = [
  { id:'syntax',    name:'SYNTAX HIGHLIGHTING',  cost:100,    vocab:'IDE',
    desc:'Code value ×1.1. Colors make bugs embarrassed enough to leave.', fx:{ codeValue:1.1 },
    unlock:{ producer:['keyboard',1] } },
  { id:'editor',    name:'REAL TEXT EDITOR',     cost:250,    vocab:'tooling',
    desc:'Click value ×1.5. You may now exit it, too.', fx:{ clickMult:1.5 },
    unlock:{ lifetime:100 } },
  { id:'duck',      name:'RUBBER DUCK DEBUGGER', cost:500,    vocab:'debugging',
    desc:'ALL output ×1.05. The duck already knew what was wrong.', fx:{ allMult:1.05 },
    unlock:{ lifetime:250 } },
  { id:'compiler',  name:'OPTIMIZING COMPILER',  cost:2e3,   vocab:'compilation',
    desc:'Code value ×2. -O3 and a prayer.', fx:{ codeValue:2 },
    unlock:{ producer:['cpu',1] } },
  { id:'dualcore',  name:'DUAL-CORE SCHEDULER',  cost:8e3,   vocab:'parallelism · threads',
    desc:'CPU output ×2. Two things at once. Revolutionary.', fx:{ cpuMult:2 },
    unlock:{ producer:['cpu',2] } },
  { id:'cache',     name:'CACHE OPTIMIZATION',   cost:10e3,  vocab:'cache · locality',
    desc:'CPU output ×1.2. The fastest memory is the memory you already read.', fx:{ cpuMult:1.2 },
    unlock:{ producer:['cpu',4] } },
  { id:'ssdctl',    name:'SSD CONTROLLER',       cost:25e3,  vocab:'solid-state drive',
    desc:'Effective storage ×1.5. No moving parts, no patience required.', fx:{ storMult:1.5 },
    unlock:{ producer:['ssd',3] } },
  { id:'unittests', name:'UNIT TESTS',           cost:50e3,  vocab:'testing',
    desc:'ALL output ×1.1. Code that proves your other code works.', fx:{ allMult:1.1 },
    unlock:{ lifetime:25e3 } },
  { id:'ramch',     name:'MORE RAM CHANNELS',    cost:100e3, vocab:'memory bandwidth',
    desc:'Effective RAM ×1.25. Wider pipe, same water.', fx:{ ramMult:1.25 },
    unlock:{ producer:['ram',4] } },
  { id:'cuda',      name:'CUDA-ISH TOOLKIT',     cost:250e3, vocab:'GPGPU · kernels',
    desc:'GPU compute ×2. Teach the graphics card to do math homework.', fx:{ gpuMult:2 },
    unlock:{ producer:['gpu',1] } },
  { id:'ethswitch', name:'ETHERNET SWITCH',      cost:500e3, vocab:'networking',
    desc:'Server output ×1.25. Computers are better at teamwork than people.', fx:{ serverMult:1.25 },
    unlock:{ producer:['server',2] } },
  { id:'ups',       name:'UPS BATTERY',          cost:750e3, vocab:'uptime — "two nines"',
    desc:'Uptime 95% → 99%. Outages now need an appointment.', fx:{ uptime:0.99 },
    unlock:{ producer:['server',1] } },
  { id:'raid',      name:'RAID ARRAY',           cost:1e6,   vocab:'redundancy',
    desc:'Effective storage ×2. Two copies of everything, on purpose.', fx:{ storMult:2 },
    unlock:{ producer:['server',1] } },
  { id:'vramx2',    name:'VRAM DOUBLER',         cost:2e6,   vocab:'VRAM ≠ RAM ≠ storage',
    desc:'Effective VRAM ×2. GPU memory is its own thing — now there\'s twice the thing.', fx:{ vramMult:2 },
    unlock:{ producer:['gpu',2] } },
  { id:'ecc',       name:'ECC MEMORY',           cost:3e6,   vocab:'error correction',
    desc:'Effective RAM ×1.5. Cosmic rays politely corrected.', fx:{ ramMult:1.5 },
    unlock:{ producer:['server',2] } },
  { id:'tensor',    name:'MATRIX MULTIPLIER UNIT', cost:5e6, vocab:'tensors',
    desc:'AI project value ×2. It is matrix multiplication all the way down.', fx:{ aiMult:2 },
    unlock:{ producer:['gpu',4] } },
  { id:'loadbal',   name:'LOAD BALANCER',        cost:10e6,  vocab:'distributed systems',
    desc:'Server output ×1.15. No server left lonely, none crushed.', fx:{ serverMult:1.15 },
    unlock:{ producer:['server',5] } },
  { id:'aisle',     name:'HOT/COLD AISLE',       cost:20e6,  vocab:'airflow · cooling',
    desc:'Cooling overhead −0.2. Hot air and cold air, finally separated like feuding siblings.', fx:{ coolingDelta:0.2 },
    unlock:{ producer:['rack',1] } },
  { id:'fiber',     name:'FIBER UPLINK',         cost:50e6,  vocab:'bandwidth · latency',
    desc:'ALL output ×1.3. Data at the speed of light, paperwork at the speed of ISP.', fx:{ allMult:1.3 },
    unlock:{ producer:['rack',2] } },
  { id:'liquid',    name:'LIQUID COOLING',       cost:200e6, vocab:'thermal design',
    desc:'Cooling overhead −0.2. Slightly damp, vastly cooler.', fx:{ coolingDelta:0.2 },
    unlock:{ producer:['cluster',1] } },
  { id:'sre',       name:'SRE TEAM',             cost:500e6, vocab:'"three nines"',
    desc:'Uptime → 99.9%. They carry pagers and grudges.', fx:{ uptime:0.999 },
    unlock:{ producer:['datacenter',1] } },
  { id:'hbm',       name:'HBM MEMORY GPUS',      cost:1e9,   vocab:'high-bandwidth memory',
    desc:'Effective VRAM ×4, GPU compute ×1.5. Memory stacked like pancakes.', fx:{ vramMult:4, gpuMult:1.5 },
    unlock:{ producer:['cluster',2] } },
  { id:'parallel',  name:'MODEL PARALLELISM',    cost:5e9,   vocab:'distributed training',
    desc:'AI project value ×2. The model is too big for one machine. Use forty.', fx:{ aiMult:2 },
    unlock:{ producer:['cluster',4] } },
  { id:'checkpt',   name:'CHECKPOINT STORAGE',   cost:10e9,  vocab:'checkpoints',
    desc:'Bad events 50% less likely. Save early, save often, save automatically.', fx:{ eventCalm:1 },
    unlock:{ producer:['datacenter',1] } },
  { id:'pipeline',  name:'DATASET PIPELINE',     cost:20e9,  vocab:'data engineering',
    desc:'Code value ×1.5. Garbage in, slightly less garbage out.', fx:{ codeValue:1.5 },
    unlock:{ producer:['datacenter',2] } },
  { id:'watercool', name:'WATER-EFFICIENT COOLING', cost:100e9, vocab:'sustainability · PUE',
    desc:'Cooling overhead −0.15. The river says thank you.', fx:{ coolingDelta:0.15 },
    unlock:{ producer:['campus',1] } },
  { id:'ppa',       name:'POWER PURCHASE AGREEMENT', cost:500e9, vocab:'PPA · grid economics',
    desc:'Electricity price ×0.5. You now buy power the way nations do.', fx:{ elecMult:0.5 },
    unlock:{ producer:['substation',1] } },
  { id:'chaos',     name:'CHAOS ENGINEERING',    cost:1e12,  vocab:'"four nines"',
    desc:'Uptime → 99.99%. Break it on purpose so it can\'t surprise you.', fx:{ uptime:0.9999 },
    unlock:{ producer:['campus',2] } },
];

/* ------------------------------------------------------------
   PROJECTS — the active project multiplies all code value, but
   runs at the bottleneck efficiency:
   eff = min(1, have/need) across storage, RAM, compute, GPUs, VRAM
   Optional theme:'name' reskins the whole terminal while the
   project is active (see css/themes.css). No theme = amber CRT.
   ------------------------------------------------------------ */
DATA.projects = [
  { id:'hello',      name:'HELLO WORLD',          value:1,
    req:{ stor:1e3, ram:1e6, compute:1 }, reveal:0,
    flavor:'Mostly semicolons and optimism.' },
  { id:'website',    name:'PERSONAL WEBSITE',     value:4,  theme:'myspace',
    req:{ stor:10e6, ram:64e6, compute:10 }, reveal:100,
    flavor:'Under construction GIF sold separately.' },
  { id:'app',        name:'MOBILE APP',           value:15,
    req:{ stor:1e9, ram:2e9, compute:50 }, reveal:5e3,
    flavor:'It\'s like a website, but with permissions dialogs.' },
  { id:'classifier', name:'IMAGE CLASSIFIER',     value:60,  ai:true,
    req:{ stor:20e9, ram:8e9, compute:1e3, gpus:1, vram:4e9 }, reveal:2e5,
    flavor:'It is 87% sure that is a cat.' },
  { id:'tinyllm',    name:'TINY LANGUAGE MODEL',  value:400, ai:true,
    req:{ stor:500e9, ram:128e9, compute:5e3, gpus:1, vram:24e9 }, reveal:5e6,
    flavor:'Speaks fluent autocomplete.' },
  { id:'campusbot',  name:'CAMPUS CHATBOT',       value:5e3, ai:true,
    req:{ stor:5e12, ram:256e9, compute:50e3, gpus:8, vram:128e9 }, reveal:5e8,
    flavor:'Knows the cafeteria menu. Refuses to do homework.' },
  { id:'campusgpt',  name:'CAMPUSGPT',            value:100e3, ai:true,
    req:{ stor:50e12, ram:2e12, compute:200e3, gpus:32, vram:768e9 }, reveal:5e10,
    flavor:'Trained on every lecture ever recorded, including the boring ones.' },
  { id:'hyperscale', name:'HYPERSCALE AI SERVICES', value:5e6, ai:true,
    req:{ stor:1e18, ram:100e12, compute:5e6, gpus:256, vram:8e12 }, reveal:5e13,
    flavor:'The cloud is not magic. It is your electric bill now.' },
];

/* ------------------------------------------------------------
   RESEARCH (prestige upgrades, bought with Research Points)
   cost of next level = lvl + 1 RP
   ------------------------------------------------------------ */
DATA.research = [
  { id:'algorithms', name:'ALGORITHMS',        max:10, desc:'ALL output ×1.25 per level. Better thinking beats better hardware.' },
  { id:'datastruct', name:'DATA STRUCTURES',   max:5,  desc:'Project RAM requirements ×0.85 per level. The right structure makes big problems small.' },
  { id:'os',         name:'OPERATING SYSTEMS', max:5,  desc:'Auto code +15% per level. Scheduling: the art of pretending to multitask.' },
  { id:'networking', name:'NETWORKING',        max:5,  desc:'Server & rack output +15% per level. Packets find a way.' },
  { id:'ml',         name:'MACHINE LEARNING',  max:5,  desc:'AI project value ×1.2 per level. The model is the product.' },
  { id:'cybersec',   name:'CYBERSECURITY',     max:3,  desc:'Bad events 30% less likely per level. Paranoia, professionally applied.' },
  { id:'sustain',    name:'SUSTAINABILITY',    max:4,  desc:'Power & cooling use ×0.85 per level. Efficiency is the cheapest megawatt.' },
];

/* ------------------------------------------------------------
   RANDOM EVENTS — temporary modifiers; vocab that sticks.
   ------------------------------------------------------------ */
DATA.events = [
  { id:'memleak',  name:'MEMORY LEAK',        bad:true,  dur:60, mods:{ ramMult:0.5 },
    log:'A loop allocates and never frees. Effective RAM −50% for 60s.' },
  { id:'cachehit', name:'CACHE HIT STREAK',   bad:false, dur:30, mods:{ cpuMult:2 },
    log:'Everything you need is already in cache. CPU output ×2 for 30s.' },
  { id:'diskfull', name:'DISK FULL',          bad:true,  dur:45, mods:{ storMult:0.5 },
    log:'node_modules strikes again. Effective storage −50% for 45s.' },
  { id:'driverup', name:'GPU DRIVER UPDATE',  bad:false, dur:45, coinflip:true,
    log:'A new GPU driver installs itself. 50/50 it helps…' },
  { id:'coolfail', name:'COOLING FAILURE',    bad:true,  dur:60, mods:{ powerCapMult:0.6 },
    log:'A fan died heroically. Power capacity −40% for 60s.' },
  { id:'spike',    name:'POWER SPIKE',        bad:true,  dur:60, mods:{ elecMult:3 },
    log:'Grid prices surge. Electricity ×3 for 60s.' },
  { id:'grant',    name:'GRANT FUNDING',      bad:false, dur:0,  grant:true,
    log:'A grant committee was impressed. Free money!' },
  { id:'sof',      name:'STACK OVERFLOW BLESSING', bad:false, dur:30, mods:{ clickMult:5 },
    log:'Someone answered your exact question, in your exact version. Clicks ×5 for 30s.' },
];

/* ------------------------------------------------------------
   UNIT LADDER — fires when STORAGE capacity first crosses each
   threshold. Straight from economy.md.
   ------------------------------------------------------------ */
DATA.unitLadder = [
  { at:1e3,  unit:'KB', flavor:'Your code no longer fits on a napkin.' },
  { at:1e6,  unit:'MB', flavor:'You can store images now. Mostly blurry ones.' },
  { at:1e9,  unit:'GB', flavor:'Welcome to modern RAM.' },
  { at:1e12, unit:'TB', flavor:'You have entered server territory.' },
  { at:1e15, unit:'PB', flavor:'Your dataset has its own weather system.' },
  { at:1e18, unit:'EB', flavor:'At this point, your backup needs a backup.' },
];

/* ------------------------------------------------------------
   SCALE TIERS (highest matching wins) — header display
   ------------------------------------------------------------ */
DATA.scales = [
  { name:'KEYBOARD BASEMENT',    test: s => true },
  { name:'DORM ROOM PC',         test: s => (s.owned.cpu||0) >= 1 },
  { name:'LAB WORKSTATION',      test: s => (s.owned.cpu||0) >= 4 },
  { name:'GPU WORKSTATION',      test: s => (s.owned.gpu||0) >= 1 },
  { name:'SERVER CLOSET',        test: s => (s.owned.server||0) >= 1 },
  { name:'SERVER RACK',          test: s => (s.owned.rack||0) >= 1 },
  { name:'MINI DATA CENTER',     test: s => (s.owned.datacenter||0) >= 1 },
  { name:'AI TRAINING FACILITY', test: s => (s.owned.cluster||0) >= 2 },
  { name:'HYPERSCALE AI CAMPUS', test: s => (s.owned.campus||0) >= 1 },
];

/* ------------------------------------------------------------
   FLAVOR TEXT
   ------------------------------------------------------------ */
DATA.bootLines = [
  'SCALE OR DIE AI BIOS v2.0 — CS-101 EDITION',
  'COPYRIGHT 1987-2026 OPERATOR COLLECTIVE',
  '',
  'MEM CHECK ............................ <b>640K OK (SHOULD BE ENOUGH FOR ANYONE)</b>',
  'PHOSPHOR LAYER ....................... <b>AMBER / NOMINAL</b>',
  'KEYBOARD ............................. <b>DETECTED (MECHANICAL, LOUD)</b>',
  'OPERATOR PRESENCE .................... <b>CONFIRMED</b>',
  'CURRICULUM MODULE .................... <b>LOADED: BYTES THROUGH GIGAWATTS</b>',
  '',
  'MOUNTING SAVE VOLUME ................. <b>OK</b>',
  '',
  '> ENGAGING TERMINAL...',
];

DATA.chatter = [
  'COOLING LOOP NOMINAL.',
  'A STUDENT ASKED IF THE CLOUD IS LITERALLY A CLOUD. IT IS NOT.',
  'STRAY COSMIC RAY FLIPPED A BIT. FLIPPED IT BACK.',
  'REMINDER: RAM FORGETS WHEN THE POWER GOES OUT. STORAGE DOES NOT.',
  'CAPACITORS AT A COMFORTABLE HUM.',
  'NIGHT SHIFT REPORTS NOTHING UNUSUAL. SUSPICIOUS.',
  'FIRMWARE WATCHDOG FED AND CONTENT.',
  'FUN FACT: 1000 GB = 1 TB. UNLESS YOU ASK YOUR OPERATING SYSTEM.',
  'GRID OPERATOR SENT A POLITE NOTE ABOUT USAGE.',
  'SOMEWHERE, A FAN SPINS FASTER.',
];

DATA.codeSnippets = [
  'print("hello, world")',
  'for (let i = 0; i < n; i++) {',
  'while (!succeed) { try(); }',
  '// TODO: fix this later (2019)',
  'if (coffee.empty()) refill();',
  'sudo make me a sandwich',
  'const bugs = features;',
  'git commit -m "final_FINAL_v2"',
  'SELECT * FROM motivation;',
  'def train(model, data, hope):',
  'malloc(more_ram);',
  '0x1F4A9 // what does this do',
  'return answer; // 42',
  'import gradeboost as gb',
  'catch (e) { /* later */ }',
];
