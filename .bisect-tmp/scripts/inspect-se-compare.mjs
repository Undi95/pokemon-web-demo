import { readFileSync } from 'fs';
import pkg from '@tonejs/midi';
const { Midi } = pkg;
const tests = [
  ['se_bang (= OK)', 'D:/Projet 1/pokemon-web-demo/public/decomp/em/music/se_bang.mid'],
  ['se_intro_blast (= probleme)', 'D:/Projet 1/pokemon-web-demo/public/decomp/em/music/se_intro_blast.mid'],
];
for (const [label, f] of tests) {
  console.log(`\n========= ${label} =========`);
  const buf = readFileSync(f);
  const m = new Midi(buf);
  console.log(`dur=${m.duration.toFixed(3)}s tracks=${m.tracks.length}`);
  console.log(`tempos: ${m.header.tempos.length} timeSignatures: ${m.header.timeSignatures.length}`);
  m.tracks.forEach((t, i) => {
    const ccs = Object.keys(t.controlChanges || {}).map(n => `CC${n}=${t.controlChanges[n].map(c => Math.round(c.value*127)).join(',')}`).join(' ');
    const notes = t.notes.slice(0, 5).map(no => `${no.name}@${no.time.toFixed(2)} d=${no.duration.toFixed(2)} v=${(no.velocity*127).toFixed(0)}`).join(', ');
    console.log(`  t${i}: ch=${t.channel} prog=${t.instrument?.number} notes=${t.notes.length} [${notes}]`);
    if (ccs) console.log(`     ${ccs}`);
  });
}
