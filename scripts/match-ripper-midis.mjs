// Match ripper songNNN.mid → decomp mus_NAME.mid via signature de contenu.
// Signature = duration_ms × track_count × total_note_count.
//
// Étapes :
// 1. Lit tous les .mid décomp restaurés (= source des noms canoniques).
// 2. Lit tous les ripper songNNN.mid.
// 3. Match par signature : si unique match, copy ripper → décomp filename.
// 4. Pour les ambiguïtés (= plusieurs fichiers avec même signature), garde le décomp original.
//
// Output : public/decomp/em/music/{name}.mid mis à jour avec le ripper content correspondant.

import { readFileSync, copyFileSync, readdirSync, existsSync } from 'fs';
import pkg from '@tonejs/midi';
const { Midi } = pkg;
import { join } from 'path';

const DECOMP_DIR = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/music';
const RIPPER_DIR = 'D:/Projet 1/vbam/em/Pokemon - Version Emeraude (France)';

function signature(buf) {
  try {
    const midi = new Midi(buf);
    const dur = Math.round(midi.duration * 1000);
    const trackCount = midi.tracks.length;
    const noteCount = midi.tracks.reduce((s, t) => s + t.notes.length, 0);
    return `${dur}|${trackCount}|${noteCount}`;
  } catch {
    return null;
  }
}

console.log('Parsing decomp .mid signatures...');
const decompFiles = readdirSync(DECOMP_DIR).filter(f => f.endsWith('.mid'));
const decompBySig = new Map();   // sig → [name1, name2, ...]
for (const f of decompFiles) {
  const buf = readFileSync(join(DECOMP_DIR, f));
  const sig = signature(buf);
  if (!sig) continue;
  const name = f.replace('.mid', '');
  if (!decompBySig.has(sig)) decompBySig.set(sig, []);
  decompBySig.get(sig).push(name);
}
console.log(`  → ${decompFiles.length} décomp files, ${decompBySig.size} unique signatures`);

console.log('Parsing ripper .mid signatures...');
const ripperFiles = readdirSync(RIPPER_DIR).filter(f => f.startsWith('song') && f.endsWith('.mid'));
const ripperBySig = new Map();   // sig → [songNNN, songMMM, ...]
for (const f of ripperFiles) {
  const buf = readFileSync(join(RIPPER_DIR, f));
  const sig = signature(buf);
  if (!sig) continue;
  if (!ripperBySig.has(sig)) ripperBySig.set(sig, []);
  ripperBySig.get(sig).push(f);
}
console.log(`  → ${ripperFiles.length} ripper files, ${ripperBySig.size} unique signatures`);

let unique = 0, ambiguous = 0, decompOnly = 0, ripperOnly = 0;
const matches = [];
for (const [sig, decompNames] of decompBySig) {
  const ripperNames = ripperBySig.get(sig);
  if (!ripperNames) {
    decompOnly++;
    continue;
  }
  if (decompNames.length === 1 && ripperNames.length === 1) {
    matches.push({ name: decompNames[0], ripper: ripperNames[0] });
    unique++;
  } else {
    // Ambiguity : plusieurs fichiers ont la même signature (= probablement
    // alias/duplicates dans le song table). Match par ordre.
    const n = Math.min(decompNames.length, ripperNames.length);
    for (let i = 0; i < n; i++) {
      matches.push({ name: decompNames[i], ripper: ripperNames[i] });
    }
    ambiguous += n;
  }
}
for (const sig of ripperBySig.keys()) {
  if (!decompBySig.has(sig)) ripperOnly++;
}
console.log(`Matches: ${matches.length} (${unique} unique, ${ambiguous} ambiguous-but-paired)`);
console.log(`Décomp-only signatures: ${decompOnly} (= songs in decomp not in ROM rip)`);
console.log(`Ripper-only signatures: ${ripperOnly} (= songs in ROM not in decomp .mid)`);

console.log('\nApplying matches (ripper → décomp name)...');
let copied = 0;
for (const { name, ripper } of matches) {
  const src = join(RIPPER_DIR, ripper);
  const dst = join(DECOMP_DIR, `${name}.mid`);
  if (existsSync(src)) {
    copyFileSync(src, dst);
    copied++;
  }
}
console.log(`Done. ${copied} .mid overwrite(s).`);
