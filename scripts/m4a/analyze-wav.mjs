import { readFileSync } from 'node:fs';
const path = process.argv[2] || 'D:/Projet 1/vbam/blast.wav';
const buf = readFileSync(path);
const fmt = buf.readUInt16LE(20);
const ch = buf.readUInt16LE(22);
const sr = buf.readUInt32LE(24);
const bps = buf.readUInt16LE(34);
console.log(`=== ${path} ===`);
console.log(`format: ${fmt === 1 ? 'PCM' : fmt === 3 ? 'float' : fmt}, ${ch}ch, ${sr}Hz, ${bps}bit`);
let p = 12;
while (p < buf.length - 8) {
  const tag = buf.slice(p, p + 4).toString('ascii');
  const sz = buf.readUInt32LE(p + 4);
  if (tag === 'data') {
    const dataStart = p + 8;
    const numSamples = sz / (bps / 8) / ch;
    const dur = numSamples / sr;
    console.log(`data: ${sz} bytes, ${numSamples} samples/ch, duration ${dur.toFixed(3)}s`);
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let peak = 0;
    const stride = bps / 8 * ch;
    for (let j = dataStart; j < dataStart + sz - bps/8; j += bps/8) {
      const v = bps === 16 ? dv.getInt16(j, true) : dv.getInt8(j);
      if (Math.abs(v) > peak) peak = Math.abs(v);
    }
    const max = bps === 16 ? 32767 : 127;
    console.log(`peak: ${peak}/${max} (${(peak/max*100).toFixed(1)}%)`);
    // RMS over time, in 100ms windows
    console.log(`RMS over time (100ms windows) :`);
    const winSamples = Math.floor(sr * 0.1);
    for (let s = 0; s < numSamples; s += winSamples) {
      let sum = 0, count = 0;
      for (let i = 0; i < winSamples && s + i < numSamples; i++) {
        const offs = dataStart + (s + i) * stride;
        const v = bps === 16 ? dv.getInt16(offs, true) : dv.getInt8(offs);
        sum += v * v;
        count++;
      }
      const rms = Math.sqrt(sum / count);
      const t = s / sr;
      const bar = '█'.repeat(Math.min(50, Math.round(rms / max * 80)));
      console.log(`  ${t.toFixed(2)}s : rms=${rms.toFixed(0)} ${bar}`);
    }
    break;
  }
  p += 8 + sz;
}
