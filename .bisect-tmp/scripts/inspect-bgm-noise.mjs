// Cherche dans les BGM les notes les plus longues sur les programs noise
// (= bank 115 prog 119-127 ou bank 47/48 prog noise) pour voir si BGM
// a des noise long-notes. Si oui, BGM doivent sonner blanc-noise aussi.

import { readFileSync, readdirSync } from 'fs';
import pkg from '@tonejs/midi';
const { Midi } = pkg;
const dir = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/music';
const bgms = ['mus_intro.mid', 'mus_title.mid', 'mus_route101.mid', 'mus_birch_lab.mid'];

for (const f of bgms) {
  console.log(`\n=== ${f} ===`);
  try {
    const buf = readFileSync(`${dir}/${f}`);
    const m = new Midi(buf);
    let maxNoiseDur = 0;
    let noiseTrackCount = 0;
    for (const t of m.tracks) {
      const cc0 = t.controlChanges?.[0]?.[0]?.value;
      const bankMSB = cc0 !== undefined ? Math.round(cc0 * 127) : 0;
      const prog = t.instrument?.number ?? 0;
      // Noise voices sont typiquement à programs 119-127 dans les voicegroups GBA
      const isLikelyNoise = prog >= 119 && prog <= 127;
      if (isLikelyNoise && t.notes.length > 0) {
        noiseTrackCount++;
        const longest = Math.max(...t.notes.map(n => n.duration));
        const avg = t.notes.reduce((s, n) => s + n.duration, 0) / t.notes.length;
        console.log(`  t (ch=${t.channel} bank=${bankMSB} prog=${prog}): ${t.notes.length} notes, longest=${longest.toFixed(3)}s avg=${avg.toFixed(3)}s`);
        if (longest > maxNoiseDur) maxNoiseDur = longest;
      }
    }
    console.log(`  total noise tracks: ${noiseTrackCount}, max noise note duration: ${maxNoiseDur.toFixed(3)}s`);
  } catch (e) { console.log(' FAILED:', e.message); }
}
