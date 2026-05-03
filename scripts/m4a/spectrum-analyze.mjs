/**
 * Analyze spectral content of a WAV file using simple DFT.
 * Compute energy in frequency bands to characterize the noise.
 */
import { readFileSync } from 'node:fs';
const path = process.argv[2];
const skipS = parseFloat(process.argv[3] || '0');
const durS = parseFloat(process.argv[4] || '1.0');

const buf = readFileSync(path);
const sr = buf.readUInt32LE(24);
const ch = buf.readUInt16LE(22);
const bps = buf.readUInt16LE(34);
let p = 12;
let dataStart = -1, dataSize = 0;
while (p < buf.length - 8) {
  const tag = buf.slice(p, p + 4).toString('ascii');
  const sz = buf.readUInt32LE(p + 4);
  if (tag === 'data') { dataStart = p + 8; dataSize = sz; break; }
  p += 8 + sz;
}

console.log(`${path}: ${sr}Hz ${bps}bit ${ch}ch`);
const numSamples = dataSize / (bps / 8) / ch;
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

// Take window starting at skipS for durS
const startIdx = Math.floor(skipS * sr);
const endIdx = Math.min(numSamples, Math.floor((skipS + durS) * sr));
const N = endIdx - startIdx;
console.log(`Analyzing ${N} samples from ${skipS}s to ${(skipS+durS).toFixed(2)}s`);

// Read mono (= average L+R)
const samples = new Float32Array(N);
const stride = bps / 8 * ch;
const max = bps === 16 ? 32767 : 127;
for (let i = 0; i < N; i++) {
  const offs = dataStart + (startIdx + i) * stride;
  let v = 0;
  if (bps === 16) {
    v = dv.getInt16(offs, true);
    if (ch === 2) v = (v + dv.getInt16(offs + 2, true)) / 2;
  } else {
    v = dv.getInt8(offs);
  }
  samples[i] = v / max;
}

// Energy in frequency bands via DFT (= simple, slow, OK for ~1s window)
// Use bins of 100 Hz from 0 to Nyquist
const NYQ = sr / 2;
const BIN_HZ = 200;
const numBins = Math.floor(NYQ / BIN_HZ);
const binEnergy = new Float32Array(numBins);

// Naive DFT for a few specific frequencies
// For speed use Goertzel-like : E_k = |sum samples * exp(-2πi k n / N)|^2
function goertzelEnergy(samples, freqHz, sr) {
  const N = samples.length;
  const k = freqHz / sr;
  const w = 2 * Math.PI * k;
  let s_prev = 0, s_prev2 = 0;
  const cosw = Math.cos(w);
  const coeff = 2 * cosw;
  for (let n = 0; n < N; n++) {
    const s = samples[n] + coeff * s_prev - s_prev2;
    s_prev2 = s_prev;
    s_prev = s;
  }
  return s_prev * s_prev + s_prev2 * s_prev2 - coeff * s_prev * s_prev2;
}

let totalE = 0;
for (let b = 0; b < numBins; b++) {
  const fc = (b + 0.5) * BIN_HZ;
  binEnergy[b] = goertzelEnergy(samples, fc, sr);
  totalE += binEnergy[b];
}

console.log(`\nSpectral bins (200Hz wide, normalized) :`);
for (let b = 0; b < numBins; b++) {
  const fLo = b * BIN_HZ;
  const fHi = (b + 1) * BIN_HZ;
  const pct = (binEnergy[b] / totalE * 100);
  if (pct < 0.5) continue;
  const bar = '█'.repeat(Math.min(60, Math.round(pct * 3)));
  console.log(`  ${fLo.toString().padStart(5)}-${fHi.toString().padEnd(5)} : ${pct.toFixed(2)}% ${bar}`);
}

// Spectral centroid (= "where the energy mass is")
let weightedSum = 0;
for (let b = 0; b < numBins; b++) {
  weightedSum += (b + 0.5) * BIN_HZ * binEnergy[b];
}
const centroid = weightedSum / totalE;
console.log(`\nSpectral centroid: ${centroid.toFixed(0)} Hz`);
