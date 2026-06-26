#!/usr/bin/env node
/**
 * audit-specials-registration.cjs — ORACLE de fidélité des noms de specials des scripts.
 *
 * Les scripts overworld appellent `special X` / `specialvar VAR, X`. La liste canonique des noms
 * de specials = le décomp `data/specials.inc` (`gSpecials::` → `def_special X`). Invariant vérifié :
 *
 *   tout special APPELÉ par un script extrait (public/decomp/em/scripts/_all.json) est un nom
 *   VALIDE du décomp gSpecials.
 *
 * Un script référençant un special inconnu du décomp = anomalie d'EXTRACTION (le bytecode du port
 * a inventé/mal nommé un special) → garde de fidélité du pipeline scripts→bytecode.
 *
 * (NB : la COMPLÉTUDE inverse — tout special utilisé est-il ENREGISTRÉ côté port ? — est une mesure
 * de dette de FEATURE, pas de fidélité : 216 specials utilisés non portés = Daycare, Réapprentissage,
 * Parc Safari, Frontier, énigmes Regi… = features non solo-safe, hors périmètre. Et 20 specials sont
 * enregistrés en EXTRA côté port — helpers IsLastMonThatKnows<HM>/GetGameStat non appelés par script,
 * inoffensifs.)
 *
 *   node scripts/audit-specials-registration.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

// 1. noms canoniques du décomp gSpecials
const inc = fs.readFileSync(path.join(DECOMP, 'data/specials.inc'), 'utf8');
const decompSpecials = new Set([...inc.matchAll(/def_special\s+([A-Za-z]\w*)/g)].map((m) => m[1]));

// 2. specials appelés par les scripts compilés
const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/scripts/_all.json'), 'utf8'));
const usedByScript = new Set();
for (const n in all.scripts) {
  for (const l of all.scripts[n]) {
    if (typeof l !== 'string') continue;
    const m = l.match(/^special\s+([A-Za-z]\w*)/) || l.match(/^specialvar\s+\w+,\s*([A-Za-z]\w*)/);
    if (m) usedByScript.add(m[1]);
  }
}

// 3. confrontation : tout special APPELÉ par un script ∈ décomp gSpecials
const findings = [];
let checked = 0;
for (const name of [...usedByScript].sort()) {
  checked++;
  if (!decompSpecials.has(name)) findings.push(`${name} : appelé par un script extrait mais ABSENT du décomp gSpecials → extraction infidèle`);
}

console.log(`Specials appelés par les scripts confrontés : ${checked} (décomp gSpecials : ${decompSpecials.size}).`);
if (findings.length === 0) { console.log('✅ Tout special appelé par un script est un nom décomp gSpecials valide.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
