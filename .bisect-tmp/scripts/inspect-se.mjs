import { readFileSync } from 'fs';
import pkg from '@tonejs/midi';
const { Midi } = pkg;
const f = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/music/se_intro_blast.mid';
const buf = readFileSync(f);
const m = new Midi(buf);
console.log(`se_intro_blast: dur=${m.duration.toFixed(3)}s tracks=${m.tracks.length}`);
m.tracks.forEach((t, i) => {
  const n = t.notes.length;
  const ch = t.channel;
  const prog = t.instrument?.number;
  const drumkit = t.instrument?.percussion ? ' DRUMKIT' : '';
  const firstNote = t.notes[0] ? `${t.notes[0].name}@${t.notes[0].time.toFixed(3)}s` : '';
  console.log(`  t${i}: ch=${ch} prog=${prog}${drumkit} notes=${n} first=${firstNote}`);
});
