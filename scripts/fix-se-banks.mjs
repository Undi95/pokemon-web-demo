// Pre-process SE .mid files : merge cross-track bank select (CC 0) onto the
// track where the program change lives. spessasynth_lib semble ne pas propager
// le bank select entre tracks → on duplique pour assurer la persistance.
//
// Stratégie : pour chaque .mid, scan toutes les CC 0 events ; pour chaque
// program change, ajoute une CC 0 (= last seen value) juste avant le PC sur
// la même track.
//
// Usage : node scripts/fix-se-banks.mjs

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import pkg from '@tonejs/midi';
const { Midi } = pkg;

const MUSIC_DIR = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/music';

const files = readdirSync(MUSIC_DIR).filter(f => f.endsWith('.mid'));
let fixed = 0, untouched = 0;

for (const f of files) {
  const filepath = join(MUSIC_DIR, f);
  const buf = readFileSync(filepath);
  let midi;
  try { midi = new Midi(buf); } catch { untouched++; continue; }

  // Find all CC 0 events globally (across tracks), keyed by channel.
  // For each channel, get the BankSelect MSB (CC 0) at the latest time before
  // any program change on that channel.
  const bankByChannel = new Map();
  for (const t of midi.tracks) {
    if (t.controlChanges?.[0]) {
      for (const cc of t.controlChanges[0]) {
        const val = Math.round(cc.value * 127);
        bankByChannel.set(t.channel, val);
      }
    }
  }

  if (bankByChannel.size === 0) { untouched++; continue; }

  // For each track that has a program change but NO CC 0 of its own, inject CC 0.
  let modified = false;
  for (const t of midi.tracks) {
    const ch = t.channel;
    const bank = bankByChannel.get(ch);
    if (bank === undefined) continue;
    const hasCC0 = t.controlChanges?.[0]?.length > 0;
    const hasProgramChange = t.notes.length > 0; // program is implicit on note tracks
    if (!hasCC0 && hasProgramChange) {
      // Add CC 0 at time 0 on this track's channel
      t.addCC({
        number: 0,
        value: bank / 127,
        time: 0,
      });
      modified = true;
    }
  }

  if (modified) {
    const newBuf = Buffer.from(midi.toArray());
    writeFileSync(filepath, newBuf);
    fixed++;
  } else {
    untouched++;
  }
}

console.log(`Fixed ${fixed} mids (added inline bank select), ${untouched} untouched`);
