import { readFileSync } from 'fs';
import pkg from '@tonejs/midi';
const { Midi } = pkg;
const files = [
  ['decomp', 'D:/Projet 1/decomps/pokeemeraude/sound/songs/midi/se_intro_blast.mid'],
  ['ripper-public (current main)', 'D:/Projet 1/pokemon-web-demo/public/decomp/em/music/se_intro_blast.mid'],
];
for (const [label, f] of files) {
  try {
    const buf = readFileSync(f);
    const m = new Midi(buf);
    console.log(`\n=== ${label} ===`);
    console.log(`dur=${m.duration.toFixed(3)}s tracks=${m.tracks.length}`);
    m.tracks.forEach((t, i) => {
      const n = t.notes.length;
      const ch = t.channel;
      const prog = t.instrument?.number;
      const drum = t.instrument?.percussion ? ' DRUMKIT' : '';
      const notes = t.notes.slice(0, 5).map(no => `${no.name}@${no.time.toFixed(2)}d=${no.duration.toFixed(2)}v=${no.velocity.toFixed(2)}`).join(',');
      console.log(`  t${i}: ch=${ch} prog=${prog}${drum} notes=${n} [${notes}]`);
      // Programmes/control changes events
      const ccs = Object.keys(t.controlChanges || {}).join(',');
      if (ccs) console.log(`    CCs: ${ccs}`);
      // Show CC 0 (bank select MSB) and CC 32 (bank select LSB) values
      if (t.controlChanges?.[0]) console.log(`    CC0 (bank MSB): ${t.controlChanges[0].map(c => c.value * 127).join(',')}`);
      if (t.controlChanges?.[32]) console.log(`    CC32 (bank LSB): ${t.controlChanges[32].map(c => c.value * 127).join(',')}`);
    });
  } catch (e) {
    console.log(`\n=== ${label} === FAILED:`, e.message);
  }
}
