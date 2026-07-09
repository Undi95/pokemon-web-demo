/**
 * extract-mart-lists.cjs — récupère les listes d'objets des Pokémarts depuis la
 * décomp. L'extracteur de scripts (JSON par map) ne garde que les OPCODES ; il a
 * jeté les lignes `.2byte ITEM_*` qui composent chaque liste de boutique. Ce
 * script rescanne les `.inc` de la décomp et reconstruit, pour chaque LABEL de
 * liste (terminée par `pokemartlistend`), le tableau de constantes d'objets.
 *
 * Sortie : public/decomp/em/mart-lists.json = { "<Label>": ["ITEM_X", ...], ... }
 *
 * 1:1 décomp : ces tableaux sont les `.2byte ITEM_*` de `data/maps/<X>/scripts.inc`.
 */
const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const OUT = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/mart-lists.json';

/** Liste récursive des .inc sous un dossier. */
function walkInc(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkInc(p, acc);
    else if (entry.name.endsWith('.inc')) acc.push(p);
  }
  return acc;
}

const files = walkInc(path.join(DECOMP, 'data'), []);
const result = {};

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let curLabel = null;
  let pending = [];
  for (let raw of lines) {
    const line = raw.trim();
    if (line === '' || line.startsWith('@') || line.startsWith('.align')) continue;
    let m;
    if ((m = line.match(/^(\w+):/))) {
      // Nouveau label → ferme toute liste en cours non terminée (sécurité).
      curLabel = m[1];
      pending = [];
    } else if ((m = line.match(/^\.2byte\s+([A-Za-z0-9_]+)/))) {
      pending.push(m[1]);
    } else if (/^pokemartlistend\b/.test(line)) {
      if (curLabel && pending.length) result[curLabel] = pending;
      pending = [];
    } else {
      // Tout autre opcode/directive → on n'est pas dans un tableau de données.
      if (pending.length) pending = [];
    }
  }
}

const labels = Object.keys(result).sort();
fs.writeFileSync(OUT, JSON.stringify(result, null, 0) + '\n');
console.log(`Écrit ${labels.length} listes mart → ${OUT}`);
for (const l of labels) console.log(`  ${l} : [${result[l].join(', ')}]`);
