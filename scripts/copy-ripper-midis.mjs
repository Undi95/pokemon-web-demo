// Map gba-mus-ripper output songNNN.mid → décomp filename mus_NAME.mid
// via le song_table.inc du décomp Pokemon Emerald (= source de vérité).
//
// Convention naming GBA-Mus-Ripper-GUI (jpmac26/CaptainSwag fork) : songN.mid
// = ROM song_table entry N (0-based, padded à 3 digits, song000 PAS écrit
// car entry 0 est mus_dummy = empty bytecode).
//
// Empirical proof : song414.mid duration 33.93s = exactly matches mus_intro
// at song_table index 414 (line 423 = line 9 + 414).
//
// Usage : node scripts/copy-ripper-midis.mjs

import { readFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SONG_TABLE_INC = 'D:/Projet 1/decomps/pokeemeraude/sound/song_table.inc';
const RIPPER_DIR = 'D:/Projet 1/vbam/em/Pokemon - Version Emeraude (France)';
const TARGET_DIR = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/music';

if (!existsSync(TARGET_DIR)) mkdirSync(TARGET_DIR, { recursive: true });

const tableInc = readFileSync(SONG_TABLE_INC, 'utf8');
const lines = tableInc.split('\n');
const names = [];
for (const line of lines) {
  const m = line.match(/^\s*song\s+(\w+)\s*,/);
  if (m) names.push(m[1]);
}
console.log(`Parsed ${names.length} song entries from song_table.inc`);

let copied = 0, missing = 0, overwritten = 0;
for (let i = 0; i < names.length; i++) {
  // 0-based : songN.mid = entry N. Entry 0 (mus_dummy) → song000.mid not written.
  const songNum = i;
  const srcFile = join(RIPPER_DIR, `song${String(songNum).padStart(3, '0')}.mid`);
  if (!existsSync(srcFile)) {
    missing++;
    continue;
  }
  const targetFile = join(TARGET_DIR, `${names[i]}.mid`);
  const willOverwrite = existsSync(targetFile);
  copyFileSync(srcFile, targetFile);
  if (willOverwrite) overwritten++;
  copied++;
}
console.log(`Copied ${copied} mids (${overwritten} overwrites, ${missing} missing/dummy in ripper output)`);
