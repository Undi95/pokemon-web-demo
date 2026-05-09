#!/usr/bin/env node
// Extended specials audit (= 38 early+mid game maps)
import { readFileSync } from 'fs';
import { join } from 'path';

const SCRIPTS_DIR = 'public/decomp/em/scripts';
const SPECIALS_FILE = 'src/engine/specials-registry.ts';

const EXTENDED_GAME = [
  'LittlerootTown', 'LittlerootTown_BrendansHouse_1F', 'LittlerootTown_BrendansHouse_2F',
  'LittlerootTown_MaysHouse_1F', 'LittlerootTown_MaysHouse_2F',
  'LittlerootTown_ProfessorBirchsLab',
  'OldaleTown', 'OldaleTown_PokemonCenter_1F', 'OldaleTown_PokemonCenter_2F', 'OldaleTown_Mart',
  'PetalburgCity', 'PetalburgCity_Gym', 'PetalburgCity_Mart',
  'PetalburgCity_PokemonCenter_1F', 'PetalburgCity_PokemonCenter_2F',
  'Route101', 'Route102', 'Route103', 'Route104', 'PetalburgWoods',
  'RustboroCity', 'RustboroCity_Flat1_1F', 'RustboroCity_Flat1_2F',
  'RustboroCity_Flat2_1F', 'RustboroCity_Flat2_2F', 'RustboroCity_Flat2_3F',
  'RustboroCity_Gym', 'RustboroCity_PokemonSchool',
  'RustboroCity_PokemonCenter_1F', 'RustboroCity_PokemonCenter_2F', 'RustboroCity_Mart',
  'RustboroCity_DevonCorp_1F', 'RustboroCity_DevonCorp_2F', 'RustboroCity_DevonCorp_3F',
  'Route115', 'Route116', 'RusturfTunnel', 'DevonCorp_1F',
];

const counts = new Map();
for (const name of EXTENDED_GAME) {
  const f = join(SCRIPTS_DIR, name + '.json');
  try {
    const j = JSON.parse(readFileSync(f, 'utf8'));
    if (!j.scripts) continue;
    for (const [_n, instrs] of Object.entries(j.scripts)) {
      if (!Array.isArray(instrs)) continue;
      for (const line of instrs) {
        if (typeof line !== 'string') continue;
        const parts = line.split(/\s+/);
        if (parts[0] === 'special' && parts[1]) {
          counts.set(parts[1].replace(/,$/, ''), (counts.get(parts[1].replace(/,$/, '')) || 0) + 1);
        } else if (parts[0] === 'specialvar' && parts[2]) {
          const sname = parts[2].replace(/,$/, '');
          counts.set(sname, (counts.get(sname) || 0) + 1);
        }
      }
    }
  } catch {}
}

const src = readFileSync(SPECIALS_FILE, 'utf8');
const re = /registerSpecial\(['"]([^'"]+)['"]/g;
const registered = new Set();
let m;
while ((m = re.exec(src))) registered.add(m[1]);

const missing = [];
for (const [op, n] of counts.entries()) {
  if (registered.has(op)) continue;
  missing.push([op, n]);
}
missing.sort((a, b) => b[1] - a[1]);

console.log(`=== Missing specials in EXTENDED-GAME (${EXTENDED_GAME.length} maps) ===`);
console.log(`Registered : ${registered.size} | Used : ${counts.size} | Missing : ${missing.length}`);
console.log();
for (const [op, n] of missing.slice(0, 50)) {
  console.log(`  ${n.toString().padStart(4)}  ${op}`);
}
