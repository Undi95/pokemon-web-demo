// Audit déterministe : specials enregistrés chez nous ABSENTS de data/specials.inc (décomp).
const fs = require('fs');

const REG = 'D:/Projet 1/pokemon-web-demo/src/engine/script/specials-registry.ts';
const INC = 'D:/Projet 1/decomps/pokeemeraude/data/specials.inc';

const regSrc = fs.readFileSync(REG, 'utf8');
const incSrc = fs.readFileSync(INC, 'utf8');

// 1) noms enregistrés : registerSpecial('NAME' ...
const registered = new Map(); // name -> [lineNumbers]
regSrc.split(/\r?\n/).forEach((line, i) => {
  const m = line.match(/registerSpecial\(\s*['"]([A-Za-z0-9_]+)['"]/);
  if (m) {
    const n = m[1];
    if (!registered.has(n)) registered.set(n, []);
    registered.get(n).push(i + 1);
  }
});

// 1b) listes de stubs éventuelles (tableaux de noms passés en boucle à registerSpecial)
//     On capture tout identifiant string dans un bloc array nommé *SPECIALS* suivi d'un forEach registerSpecial.
const arrayNames = new Set();
const arrRe = /const\s+(\w*SPECIALS\w*)\s*[:=][^=]*?=\s*\[([\s\S]*?)\]/g;
let am;
while ((am = arrRe.exec(regSrc)) !== null) {
  const body = am[2];
  const names = body.match(/['"]([A-Za-z0-9_]+)['"]/g) || [];
  names.forEach(s => arrayNames.add(s.replace(/['"]/g, '')));
}

// 2) def_special décomp
const defSpecial = new Set();
incSrc.split(/\r?\n/).forEach(line => {
  const m = line.match(/def_special\s+([A-Za-z0-9_]+)/);
  if (m) defSpecial.add(m[1]);
});

// 3) diff
const allRegistered = new Set([...registered.keys(), ...arrayNames]);
const candidates = [...allRegistered].filter(n => !defSpecial.has(n)).sort();

console.log('=== STATS ===');
console.log('registerSpecial(...) noms uniques :', registered.size);
console.log('noms en tableaux *SPECIALS* :', arrayNames.size);
console.log('def_special décomp :', defSpecial.size);
console.log('CANDIDATS (enregistrés mais PAS def_special) :', candidates.length);
console.log('');
console.log('=== CANDIDATS ===');
candidates.forEach(n => {
  const lines = registered.get(n);
  const where = lines ? `registry:${lines.join(',')}` : (arrayNames.has(n) ? 'array-stub' : '?');
  console.log(`${n}\t${where}`);
});

// dump JSON pour la suite
fs.writeFileSync('D:/Projet 1/pokemon-web-demo/audit-reports/phantom-specials-candidates.json',
  JSON.stringify({ candidates, registeredCount: registered.size, defSpecialCount: defSpecial.size }, null, 2));
