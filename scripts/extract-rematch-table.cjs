// Extrait gRematchTable (battle_setup.c:260-339) en JSON intermédiaire pour
// le port miroir src/game/battle_setup.ts (78 entrées REMATCH_*).
// node scripts/extract-rematch-table.cjs
const fs = require('fs');
const src = fs.readFileSync('D:/Projet 1/decomps/pokeemeraude/src/battle_setup.c', 'utf8');
const block = src.match(/const struct RematchTrainer gRematchTable\[REMATCH_TABLE_ENTRIES\] =\s*\{([\s\S]*?)\n\};/);
if (!block) { console.log('TABLE INTROUVABLE'); process.exit(1); }
const entries = [];
const re = /\[(REMATCH_\w+)\] = REMATCH\(([^)]+)\)/g;
let m;
while ((m = re.exec(block[1]))) {
  const args = m[2].split(',').map(s => s.trim());
  entries.push({ key: m[1], trainers: args.slice(0, 5), map: args[5] });
}
const mg = fs.readFileSync('src/engine/decomp-data/include/constants/map_groups-data.ts', 'utf8');
const missing = entries.filter(e => !mg.includes(e.map + ':'));
console.log(JSON.stringify({ count: entries.length, missingMaps: missing.map(e => e.map), first: entries[0], last: entries[entries.length - 1] }, null, 1));
fs.writeFileSync('scripts/rematch-entries.json', JSON.stringify(entries, null, 1));
