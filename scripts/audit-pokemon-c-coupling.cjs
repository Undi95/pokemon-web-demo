// Pour les fns pokemon.c actuellement dans party-storage.ts : compte les importateurs
// externes + detecte usage INTERNE a party-storage (= cycle-risk si deplacees).
const fs = require('fs');
const path = require('path');
const ROOT = 'D:/Projet 1/pokemon-web-demo';

const TARGETS = [
  'CalculateMonStats', 'GiveMoveToMon', 'SetMonMoveSlot', 'GetMonGender', 'GetBoxMonGender',
  'CalculateEnemyPartyCount', 'GetMonsStateToDoubles', 'GetAbilityBySpecies', 'GetMonAbility',
  'CalculatePPWithBonus', 'GetNature', 'AdjustFriendship', 'MonGainEVs', 'GetMonEVCount',
  'CheckPartyPokerus', 'UpdatePartyPokerusTime', 'CanMonLearnTMHM', 'CanSpeciesLearnTMHM',
  'IsTradedMon', 'IsOtherTrainer', 'SetWildMonHeldItem', 'CopyMonToPC', 'CalculatePlayerPartyCount',
];

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.ts')) acc.push(p);
  }
  return acc;
}
const tsFiles = walk(path.join(ROOT, 'src'), []);
const contents = tsFiles.map(f => ({
  f: path.relative(ROOT, f).split(path.sep).join('/'),
  t: fs.readFileSync(f, 'utf8'),
}));
const PS = 'src/engine/battle/party-storage.ts';
const psContent = contents.find(c => c.f === PS).t;

const rows = [];
for (const name of TARGETS) {
  // importateurs externes = fichiers (hors party-storage) qui importent ce nom depuis party-storage
  const impRe = new RegExp('import[^;]*\\b' + name + '\\b[^;]*party-storage');
  // call sites externes (hors party-storage) = usage `name(`
  const callRe = new RegExp('(^|[^.\\w])' + name + '\\s*\\(');
  const importers = [];
  let externCallFiles = 0;
  for (const { f, t } of contents) {
    if (f === PS) continue;
    if (impRe.test(t)) importers.push(f);
    else if (callRe.test(t) && new RegExp('\\b' + name + '\\b').test(t)) {
      // call without importing from party-storage (maybe re-exported / globalThis)
    }
  }
  // usage INTERNE party-storage (autre fn du fichier appelle name) — EXCLUT la ligne de def.
  let internalCalls = (psContent.match(new RegExp('(^|[^.\\w])' + name + '\\s*\\(', 'g')) || []).length;
  if (new RegExp('function\\s+' + name + '\\s*\\(').test(psContent)) internalCalls -= 1; // retire la def
  if (new RegExp(name + '\\s*[=:]\\s*(\\(|function)').test(psContent)) internalCalls -= 1; // def arrow/method
  rows.push({ name, importers: importers.length, internalCalls, files: importers });
}
rows.sort((a, b) => (a.importers + a.internalCalls) - (b.importers + b.internalCalls));
console.log('fn  |  #importateurs externes  |  #appels INTERNES party-storage (cycle-risk)');
console.log('-----------------------------------------------------------------------------');
for (const r of rows) {
  console.log(r.name.padEnd(26) + ' imp=' + String(r.importers).padStart(2) + '  internes=' + String(r.internalCalls).padStart(2)
    + (r.importers <= 3 ? '   <- ' + r.files.join(', ') : ''));
}
