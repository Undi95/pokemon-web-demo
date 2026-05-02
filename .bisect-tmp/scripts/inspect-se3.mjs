import { readFileSync } from 'fs';
import pkg from '@tonejs/midi';
const { Midi } = pkg;
// What's at songNNN around the se_intro_blast index?
// Decomp says : line 9 = mus_dummy (idx 0), line 112 = se_intro_blast (idx 103).
// Ripper output : songN.mid = entry N (0-based per our investigation).
// So song103.mid should be se_intro_blast IF ROM France align with US decomp.
const dir = 'D:/Projet 1/vbam/em/Pokemon - Version Emeraude (France)';
const tests = [101, 102, 103, 104, 105, 110, 111, 112, 113];
for (const n of tests) {
  const fp = `${dir}/song${String(n).padStart(3, '0')}.mid`;
  try {
    const buf = readFileSync(fp);
    const m = new Midi(buf);
    const tnames = m.tracks.map(t => t.name).filter(Boolean);
    const totalNotes = m.tracks.reduce((s, t) => s + t.notes.length, 0);
    const programs = m.tracks.map(t => t.instrument?.number).filter(p => p !== undefined);
    console.log(`song${String(n).padStart(3,'0')}: dur=${m.duration.toFixed(2)}s tracks=${m.tracks.length} notes=${totalNotes} programs=[${programs.join(',')}] names=${JSON.stringify(tnames)}`);
  } catch (e) {
    console.log(`song${String(n).padStart(3,'0')}: MISSING`);
  }
}

// Also inspect our public se_intro_blast.mid
console.log('\nOur public se_intro_blast.mid :');
try {
  const buf = readFileSync('D:/Projet 1/pokemon-web-demo/public/decomp/em/music/se_intro_blast.mid');
  const m = new Midi(buf);
  console.log(`dur=${m.duration.toFixed(2)}s tracks=${m.tracks.length} notes=${m.tracks.reduce((s,t)=>s+t.notes.length, 0)}`);
  m.tracks.forEach((t, i) => {
    console.log(`  t${i}: ch=${t.channel} prog=${t.instrument?.number} notes=${t.notes.length}`);
  });
} catch (e) { console.log(' FAILED:', e.message); }

// Compare with decomp original .mid
console.log('\nDecomp se_intro_blast.mid :');
try {
  const buf = readFileSync('D:/Projet 1/decomps/pokeemeraude/sound/songs/midi/se_intro_blast.mid');
  const m = new Midi(buf);
  console.log(`dur=${m.duration.toFixed(2)}s tracks=${m.tracks.length} notes=${m.tracks.reduce((s,t)=>s+t.notes.length, 0)}`);
  m.tracks.forEach((t, i) => {
    console.log(`  t${i}: ch=${t.channel} prog=${t.instrument?.number} notes=${t.notes.length}`);
  });
} catch (e) { console.log(' FAILED:', e.message); }
