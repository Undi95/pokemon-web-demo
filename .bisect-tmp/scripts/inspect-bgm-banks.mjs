import { readFileSync } from 'fs';
import pkg from '@tonejs/midi';
const { Midi } = pkg;
const tests = [
  'D:/Projet 1/pokemon-web-demo/public/decomp/em/music/mus_intro.mid',
  'D:/Projet 1/pokemon-web-demo/public/decomp/em/music/mus_title.mid',
  'D:/Projet 1/pokemon-web-demo/public/decomp/em/music/se_intro_blast.mid',
  'D:/Projet 1/pokemon-web-demo/public/decomp/em/music/se_pc_login.mid',
];
for (const f of tests) {
  const name = f.split('/').pop();
  console.log(`\n=== ${name} ===`);
  try {
    const buf = readFileSync(f);
    const m = new Midi(buf);
    console.log(`  ${m.tracks.length} tracks, ${m.duration.toFixed(2)}s`);
    m.tracks.forEach((t, i) => {
      const banks = [];
      if (t.controlChanges?.[0]) banks.push(`bMSB=${t.controlChanges[0].map(c => Math.round(c.value*127)).join(',')}`);
      if (t.controlChanges?.[32]) banks.push(`bLSB=${t.controlChanges[32].map(c => Math.round(c.value*127)).join(',')}`);
      console.log(`  t${i}: ch=${t.channel} prog=${t.instrument?.number} notes=${t.notes.length} ${banks.join(' ')}`);
    });
  } catch (e) { console.log(' FAILED:', e.message); }
}
