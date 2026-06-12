// Throwaway balance smoke test: node smoke-test.js
const fs = require('fs');
const code = fs.readFileSync('js/data.js', 'utf8') + '\n' + fs.readFileSync('js/engine.js', 'utf8');
const test = `
localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
G.stats = G.calc();
console.log('START   click:', G.fmtMoney(G.stats.clickValue), 'eff:', G.stats.efficiency);

G.state.owned = { keyboard:5, scriptbot:5, cpu:4, ram:5, ssd:5 };
G.stats = G.calc();
console.log('EARLY   income/s:', G.fmtMoney(G.stats.incomePerSec), 'ram:', G.fmtBytes(G.stats.ramCap), 'stor:', G.fmtBytes(G.stats.storCap));

G.state.activeProject = 'website';
G.stats = G.calc();
console.log('WEBSITE eff:', G.stats.efficiency.toFixed(3), 'bn:', G.stats.bottleneck && G.stats.bottleneck.key, 'income/s:', G.fmtMoney(G.stats.incomePerSec));

G.state.owned = { keyboard:20, scriptbot:20, cpu:20, ram:10, ssd:10 };
G.state.activeProject = 'app';
G.stats = G.calc();
console.log('APP     eff:', G.stats.efficiency.toFixed(3), 'bn:', G.stats.bottleneck && G.stats.bottleneck.key, 'income/s:', G.fmtMoney(G.stats.incomePerSec));

G.state.owned = { keyboard:20, scriptbot:30, cpu:30, ram:13, ssd:13, gpu:4, server:4, pdu:2 };
G.state.upgrades = { compiler:true, dualcore:true, cuda:true };
G.state.activeProject = 'classifier';
G.stats = G.calc();
console.log('CLASSIF eff:', G.stats.efficiency.toFixed(3), 'bn:', G.stats.bottleneck && G.stats.bottleneck.key, 'income/s:', G.fmtMoney(G.stats.incomePerSec), 'power:', G.fmtPower(G.stats.powerUseKW)+'/'+G.fmtPower(G.stats.powerCapKW));

G.state.owned = { keyboard:30, scriptbot:40, cpu:40, ram:17, ssd:17, gpu:12, server:20, rack:1, pdu:5, generator:1, cluster:2, datacenter:1 };
G.state.upgrades = { compiler:true, dualcore:true, cuda:true, raid:true, ramch:true, ecc:true, vramx2:true, ups:true, ethswitch:true };
G.state.activeProject = 'campusbot';
G.stats = G.calc();
console.log('CAMPUS  eff:', G.stats.efficiency.toFixed(3), 'bn:', G.stats.bottleneck && G.stats.bottleneck.key, 'income/s:', G.fmtMoney(G.stats.incomePerSec), 'power:', G.fmtPower(G.stats.powerUseKW)+'/'+G.fmtPower(G.stats.powerCapKW), 'slots:', G.stats.serversOwned+'/'+G.stats.slots);

// cost sanity: what do the gating purchases cost?
const p = id => DATA.producers.find(x => x.id === id);
['ram','ssd','gpu','server','rack','cluster','datacenter'].forEach(id => {
  const pr = p(id);
  console.log(id.padEnd(11), '10th:', G.fmtMoney(pr.baseCost * Math.pow(pr.growth, 9)), '20th:', G.fmtMoney(pr.baseCost * Math.pow(pr.growth, 19)));
});

// prestige check
G.state.lifetime = 5e8;
console.log('PRESTIGE pending RP at $500M lifetime:', G.pendingRP());
`;
new Function(code + '\n' + test)();
