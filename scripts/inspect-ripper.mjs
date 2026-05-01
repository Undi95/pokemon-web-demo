import { readFileSync, existsSync } from 'fs';
import pkg from '@tonejs/midi';
const { Midi } = pkg;
const dir = 'D:/Projet 1/vbam/em/Pokemon - Version Emeraude (France)';

const expected = ['song001', 'song002', 'song003', 'song004', 'song412', 'song413', 'song414', 'song415'];
for (const n of expected) {
  const fp = `${dir}/${n}.mid`;
  if (!existsSync(fp)) { console.log(n, '→ MISSING'); continue; }
  const buf = readFileSync(fp);
  const m = new Midi(buf);
  const tnames = m.tracks.map(t => t.name).filter(Boolean);
  const totalNotes = m.tracks.reduce((s, t) => s + t.notes.length, 0);
  // Programs used per track
  const programs = m.tracks.map(t => t.instrument?.number).filter(p => p !== undefined);
  console.log(`${n}: dur=${m.duration.toFixed(2)}s tracks=${m.tracks.length} notes=${totalNotes} programs=[${programs.join(',')}] names=${JSON.stringify(tnames)}`);
}
