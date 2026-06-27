#!/usr/bin/env node
/**
 * extract-specials-table.cjs — table des specials (byte-VM Phase 2).
 *
 * Parse data/specials.inc : `def_special <Name>[, waitstate=N]`.
 * L'id d'un special = son ordre de déclaration (`__special__` part de 0, +1 par
 * entrée) = exactement l'index dans `gSpecials[]`. `special`/`specialvar`
 * encodent cet id sur 2 octets ; `SPECIAL_WAITSTATE_<Name>` indique si un
 * waitstate implicite suit.
 *
 * Sortie : public/decomp/em/specials-table.json
 *   { meta:{count}, specials:[name,...]  (index=id),
 *     byName:{ name:{id, waitstate} } }
 *
 * Outil de build (non 1:1) — déterministe.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const SPECIALS_INC = path.join(DECOMP, 'data/specials.inc');
const OUT = path.join(__dirname, '..', 'public/decomp/em/specials-table.json');

function main() {
  const txt = fs.readFileSync(SPECIALS_INC, 'utf8');
  const lines = txt.split(/\r?\n/);
  const specials = [];
  const byName = {};
  const dups = [];
  // `def_special Name` ou `def_special Name, waitstate=1`
  const re = /^\s*def_special\s+(\w+)\s*(?:,\s*waitstate\s*=\s*(\d+))?\s*$/;
  for (const line of lines) {
    const code = line.split('@')[0];
    const m = code.match(re);
    if (!m) continue;
    const name = m[1];
    const waitstate = m[2] ? parseInt(m[2], 10) !== 0 : false;
    const id = specials.length;          // chaque def_special consomme un slot gSpecials
    // gas `.set SPECIAL_\ptr` = last-wins : un nom dupliqué résout au DERNIER id.
    if (byName[name]) dups.push(`${name} (${byName[name].id} -> ${id})`);
    byName[name] = { id, waitstate };
    specials.push(name);                 // toujours pousser (ids suivants décalés en conséquence)
  }

  const out = {
    meta: { note: 'Généré par scripts/extract-specials-table.cjs (byte-VM). NE PAS éditer.', count: specials.length },
    specials,
    byName,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

  const waitCount = specials.filter((n) => byName[n].waitstate).length;
  console.log(`=== extract-specials-table ===`);
  console.log(`specials    : ${specials.length}`);
  console.log(`avec waitstate : ${waitCount}`);
  console.log(`écrit       : ${path.relative(path.join(__dirname, '..'), OUT)}`);
  console.log(`exemples    : SPECIAL_${specials[0]}=0, SPECIAL_${specials[2]}=2 (waitstate=${byName[specials[2]].waitstate})`);
  if (dups.length) console.log(`doublons (last-wins) : ${dups.join(', ')}`);
}

main();
