// Génère le littéral TS de gRematchTable depuis rematch-entries.json.
const fs = require('fs');
const entries = JSON.parse(fs.readFileSync(__dirname + '/rematch-entries.json', 'utf8'));
const out = entries.map(e => {
  const t = e.trainers.map(x => `'${x}'`).join(', ');
  return `  /* [${e.key}] */ { trainerIds: [${t}], map: '${e.map}' },`;
}).join('\n');
fs.writeFileSync(__dirname + '/rematch-table-block.txt', out);
console.log('lignes:', entries.length);
