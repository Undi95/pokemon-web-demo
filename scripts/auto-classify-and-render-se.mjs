/**
 * Auto-classify and render ALL SE.
 *
 * Strategy : pour chaque SE, on regarde les voice types des tracks
 *   - Si ANY voice = noise/noise_alt → notre LFSR pre-render BAT spessasynth
 *   - Si noise + directsound mixed → notre full pre-render BAT spessasynth
 *   - Si UNIQUEMENT directsound → spessasynth WINS (sinc > notre linear)
 *
 * Output :
 *   - public/audio/se_prerendered/<name>.wav pour les SE qu'on pre-render
 *   - logs liste des SE rendered + raison
 *   - le fichier `pre-rendered-list.json` pour mise à jour PRERENDERED_SE_NAMES
 */
import midiPkg from '@tonejs/midi';
const { Midi } = midiPkg;
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DECOMP_ROOT = resolve(PROJECT_ROOT, '..', 'decomps', 'pokeemeraude');
const OUT_DIR = resolve(PROJECT_ROOT, 'public', 'audio', 'se_prerendered');
const MIDI_CFG = resolve(DECOMP_ROOT, 'sound', 'songs', 'midi', 'midi.cfg');
const MIDI_DIR = resolve(DECOMP_ROOT, 'sound', 'songs', 'midi');
mkdirSync(OUT_DIR, { recursive: true });

// Import the renderer functions from render-se-full.mjs by reading + eval'ing.
// Simpler: replicate the renderer here. Time-bound : copy the essential parts.

const INTERNAL_RATE = 192000;  // = 48000 * 4 exact, factor 4 → 48000 output
const SPEAKER_LP = 5000;
const SPEAKER_HP = 120;
const VOL_SCALE_DS = 0.5;
const VOL_SCALE_NOISE = 0.15;

const G_NOISE_TABLE = [
  0xD7, 0xD6, 0xD5, 0xD4, 0xC7, 0xC6, 0xC5, 0xC4,
  0xB7, 0xB6, 0xB5, 0xB4, 0xA7, 0xA6, 0xA5, 0xA4,
  0x97, 0x96, 0x95, 0x94, 0x87, 0x86, 0x85, 0x84,
  0x77, 0x76, 0x75, 0x74, 0x67, 0x66, 0x65, 0x64,
  0x57, 0x56, 0x55, 0x54, 0x47, 0x46, 0x45, 0x44,
  0x37, 0x36, 0x35, 0x34, 0x27, 0x26, 0x25, 0x24,
  0x17, 0x16, 0x15, 0x14, 0x07, 0x06, 0x05, 0x04,
  0x03, 0x02, 0x01, 0x00,
];

function decodeNr43(nr43) {
  const s = (nr43 >> 4) & 0xF;
  const r = nr43 & 0x7;
  const divisor = r === 0 ? 0.5 : r;
  return 524288 / divisor / (1 << (s + 1));
}
function midiNoteToNoiseFreq(key) {
  if (key <= 20) return decodeNr43(G_NOISE_TABLE[0]);
  let idx = key - 21;
  if (idx > 59) idx = 59;
  if (idx < 0) idx = 0;
  return decodeNr43(G_NOISE_TABLE[idx]);
}

// ─── parse midi.cfg → { name → voicegroup } ─────────────────────────────────
function parseMidiCfg() {
  const text = readFileSync(MIDI_CFG, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(\w+\.mid):\s*(.+)$/);
    if (!m) continue;
    const name = m[1].replace('.mid', '');
    const args = m[2];
    const vgMatch = args.match(/-G_?(\w+)/);
    if (vgMatch) {
      out[name] = vgMatch[1];
    }
  }
  return out;
}

// ─── voice loader ────────────────────────────────────────────────────────────
function loadVoice(vgName, voiceIdx) {
  const incPath = resolve(DECOMP_ROOT, 'sound', 'voicegroups', `${vgName}.inc`);
  if (!existsSync(incPath)) return null;
  const text = readFileSync(incPath, 'utf8');
  let curIdx = 0;
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('@') || t.startsWith('.')) continue;
    if (t.startsWith('voice_group')) continue;
    if (curIdx === voiceIdx) {
      const m = t.match(/^(voice_\w+)\s+(.+)$/);
      if (!m) return null;
      const macro = m[1];
      const args = m[2].split(',').map(s => s.trim());
      if (macro === 'voice_directsound' || macro === 'voice_directsound_no_resample' || macro === 'voice_directsound_alt') {
        return {
          type: macro.replace('voice_', ''), category: 'directsound',
          baseKey: parseInt(args[0]), pan: parseInt(args[1]),
          sampleLabel: args[2],
          envelope: { attack: parseInt(args[3]), decay: parseInt(args[4]), sustain: parseInt(args[5]), release: parseInt(args[6]) },
        };
      }
      if (macro === 'voice_noise' || macro === 'voice_noise_alt') {
        return {
          type: macro.replace('voice_', ''), category: 'noise',
          baseKey: parseInt(args[0]), pan: parseInt(args[1]),
          period: parseInt(args[2]),
          envelope: { attack: parseInt(args[3]), decay: parseInt(args[4]), sustain: parseInt(args[5]), release: parseInt(args[6]) },
        };
      }
      // square_1, square_2, programmable_wave, keysplit, etc.
      return { type: macro.replace('voice_', ''), category: 'other' };
    }
    curIdx++;
  }
  return null;
}

// ─── classifier : decide if SE should be pre-rendered ────────────────────────
function classify(midi, vgName) {
  const cats = new Set();
  for (const track of midi.tracks) {
    if (track.notes.length === 0) continue;
    const program = track.instrument?.number ?? 0;
    const v = loadVoice(vgName, program);
    if (!v) continue;
    cats.add(v.category);
  }
  if (cats.has('noise')) {
    return { pre: true, reason: cats.size > 1 ? 'noise+ds mix' : 'pure noise' };
  }
  return { pre: false, reason: 'directsound only' };
}

// ─── WAV reader (with smpl loop) ────────────────────────────────────────────
function readWav(filePath) {
  const buf = readFileSync(filePath);
  if (buf.toString('ascii', 0, 4) !== 'RIFF') throw new Error('not WAV');
  let off = 12;
  let fmtOff = -1, dataOff = -1, dataLen = 0;
  let loopStart = -1, loopEnd = -1;
  while (off < buf.length - 8) {
    const id = buf.toString('ascii', off, off + 4);
    const len = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') fmtOff = off + 8;
    if (id === 'data') { dataOff = off + 8; dataLen = len; }
    if (id === 'smpl') {
      const numLoops = buf.readUInt32LE(off + 8 + 28);
      if (numLoops > 0) {
        loopStart = buf.readUInt32LE(off + 8 + 36 + 8);
        loopEnd = buf.readUInt32LE(off + 8 + 36 + 12);
      }
    }
    off += 8 + len;
    if (len % 2) off++;
  }
  const ch = buf.readUInt16LE(fmtOff + 2);
  const sr = buf.readUInt32LE(fmtOff + 4);
  const bps = buf.readUInt16LE(fmtOff + 14);
  const numSamples = dataLen / (bps / 8) / ch;
  const out = new Float32Array(numSamples);
  if (bps === 16) for (let i = 0; i < numSamples; i++) out[i] = buf.readInt16LE(dataOff + i * 2 * ch) / 32768;
  else if (bps === 8) for (let i = 0; i < numSamples; i++) out[i] = (buf[dataOff + i * ch] - 128) / 128;
  return { samples: out, sampleRate: sr, numSamples, loopStart, loopEnd };
}

function preprocessLoopCrossfade(sample, fadeMs = 25) {
  if (sample.loopStart < 0 || sample.loopEnd <= sample.loopStart) return sample;
  const loopLen = sample.loopEnd - sample.loopStart + 1;
  let fadeLen = Math.floor((fadeMs * sample.sampleRate) / 1000);
  if (fadeLen > loopLen * 0.4) fadeLen = Math.floor(loopLen * 0.4);
  if (fadeLen <= 0) return sample;
  const samples = new Float32Array(sample.samples);
  for (let i = 0; i < fadeLen; i++) {
    const t = i / fadeLen;
    const tailIdx = sample.loopEnd - fadeLen + 1 + i;
    const headIdx = sample.loopStart + i;
    if (tailIdx >= sample.loopStart && tailIdx <= sample.loopEnd && headIdx <= sample.loopEnd) {
      samples[tailIdx] = samples[tailIdx] * (1 - t) + samples[headIdx] * t;
    }
  }
  return { ...sample, samples };
}

// ─── render directsound + noise notes (= same as render-se-full.mjs) ────────
function makeBendCurve(pbs, range) {
  const s = pbs.slice().sort((a, b) => a.time - b.time);
  return (t) => {
    if (s.length === 0) return 0;
    if (t <= s[0].time) return s[0].value * range;
    if (t >= s[s.length - 1].time) return s[s.length - 1].value * range;
    for (let i = 0; i < s.length - 1; i++) {
      if (t >= s[i].time && t < s[i + 1].time) {
        const f = (t - s[i].time) / (s[i + 1].time - s[i].time);
        return (s[i].value + (s[i + 1].value - s[i].value) * f) * range;
      }
    }
    return 0;
  };
}
function makeCcCurve(ccs, dflt = 1.0) {
  const s = ccs.slice().sort((a, b) => a.time - b.time);
  return (t) => {
    if (s.length === 0) return dflt;
    if (t <= s[0].time) return s[0].value;
    if (t >= s[s.length - 1].time) return s[s.length - 1].value;
    for (let i = 0; i < s.length - 1; i++) {
      if (t >= s[i].time && t < s[i + 1].time) {
        const f = (t - s[i].time) / (s[i + 1].time - s[i].time);
        return s[i].value + (s[i + 1].value - s[i].value) * f;
      }
    }
    return dflt;
  };
}

function sampleLabelToWavPath(label) {
  return resolve(DECOMP_ROOT, 'sound', 'direct_sound_samples', label.replace(/^DirectSoundWaveData_/, '') + '.wav');
}

// Helper : pan curve (0=L, 0.5=center, 1=R) → equal-power L/R gains.
// Use sin/cos for constant-power : preserves perceived loudness mid-pan.
function panToLR(p) {
  // Clamp 0..1
  const pp = Math.max(0, Math.min(1, p));
  // sin/cos equal-power : at p=0.5, both = sqrt(0.5) = 0.707
  const angle = pp * Math.PI / 2;
  return { l: Math.cos(angle), r: Math.sin(angle) };
}

function renderDirectsoundNoteStereo(mixL, mixR, sample, note, voice, bendRange, pbs, ccs, panCurve, sr, nextStart) {
  const baseRatio = Math.pow(2, (note.midi - voice.baseKey) / 12);
  const bendC = makeBendCurve(pbs, bendRange);
  const ccC = makeCcCurve(ccs);
  const velNorm = note.velocity;
  const sustain = (voice.envelope.sustain / 255) * velNorm * VOL_SCALE_DS;
  const aSec = voice.envelope.attack / 1024;
  const dSec = voice.envelope.decay / 1024;
  const rSec = voice.envelope.release / 1024;
  const tA = aSec, tD = aSec + dSec, tNoff = note.duration;
  const naturalRel = note.duration + rSec;
  const monoCut = nextStart - note.time;
  const tRel = Math.min(naturalRel, monoCut);
  const cutFade = 0.005;
  const cutStart = (tRel < naturalRel) ? Math.max(tNoff, tRel - cutFade) : Infinity;
  const startSamp = Math.floor(note.time * sr);
  let pos = 0;
  for (let i = 0; i < Math.ceil(tRel * sr); i++) {
    const oi = startSamp + i;
    if (oi >= mixL.length) break;
    const t = i / sr;
    if (t >= tRel) break;
    const ratio = baseRatio * Math.pow(2, bendC(t) / 12);
    const step = (sample.sampleRate * ratio) / sr;
    const fl = Math.floor(pos), fr = pos - fl;
    let s0 = 0, s1 = 0;
    if (fl < sample.numSamples) s0 = sample.samples[fl];
    let s1i = fl + 1;
    if (sample.loopEnd > sample.loopStart && s1i > sample.loopEnd) s1i = sample.loopStart;
    if (s1i < sample.numSamples) s1 = sample.samples[s1i];
    const sv = s0 + (s1 - s0) * fr;
    let env;
    if (t < tA) env = aSec > 0 ? (t / aSec) * velNorm * VOL_SCALE_DS : velNorm * VOL_SCALE_DS;
    else if (t < tD) { const f = dSec > 0 ? (t - tA) / dSec : 1; env = velNorm * VOL_SCALE_DS + (sustain - velNorm * VOL_SCALE_DS) * f; }
    else if (t < tNoff) env = sustain;
    else if (t < tRel) { const f = rSec > 0 ? (t - tNoff) / rSec : 1; env = sustain * (1 - f); }
    else env = 0;
    if (t >= cutStart && cutStart < tRel) { const f = (t - cutStart) / (tRel - cutStart); env *= 1 - f; }
    env *= ccC(t + note.time);
    const sig = sv * env;
    // Apply pan : split signal between L/R via equal-power
    const { l, r } = panToLR(panCurve(t + note.time));
    mixL[oi] += sig * l;
    mixR[oi] += sig * r;
    pos += step;
    if (pos >= sample.numSamples) {
      if (sample.loopStart >= 0 && sample.loopEnd > sample.loopStart) {
        pos = sample.loopStart + ((pos - sample.numSamples) % (sample.loopEnd - sample.loopStart + 1));
      } else pos = sample.numSamples - 1;
    } else if (sample.loopEnd > 0 && pos > sample.loopEnd) {
      pos = sample.loopStart + ((pos - sample.loopEnd - 1) % (sample.loopEnd - sample.loopStart + 1));
    }
  }
}

function renderNoiseNoteStereo(mixL, mixR, note, voice, bendRange, pbs, ccs, panCurve, sr, nextStart) {
  const is7bit = ((voice.period ?? 0) & 1) === 1;
  const bendC = makeBendCurve(pbs, bendRange);
  const ccC = makeCcCurve(ccs);
  const velNorm = note.velocity;
  const sustain = (voice.envelope.sustain / 15) * velNorm * VOL_SCALE_NOISE;
  const aSec = voice.envelope.attack > 0 ? voice.envelope.attack / 60 : 0;
  const dSec = voice.envelope.decay > 0 ? voice.envelope.decay / 60 : 0.005;
  const rSec = voice.envelope.release > 0 ? voice.envelope.release / 60 : 0.04;
  const tA = aSec, tD = aSec + dSec, tNoff = note.duration;
  const naturalRel = note.duration + rSec;
  const monoCut = nextStart - note.time;
  const tRel = Math.min(naturalRel, monoCut);
  const cutFade = 0.005;
  const cutStart = (tRel < naturalRel) ? Math.max(tNoff, tRel - cutFade) : Infinity;
  let lfsr = is7bit ? 0x7F : 0x7FFF;
  const mask = is7bit ? 0x7F : 0x7FFF;
  const nbs = is7bit ? 6 : 14;
  let phase = 0;
  const startSamp = Math.floor(note.time * sr);
  for (let i = 0; i < Math.ceil(tRel * sr); i++) {
    const oi = startSamp + i;
    if (oi >= mixL.length) break;
    const t = i / sr;
    if (t >= tRel) break;
    const bm = note.midi + bendC(t);
    const freq = midiNoteToNoiseFreq(Math.floor(bm));
    phase += freq / sr;
    while (phase >= 1) {
      phase -= 1;
      const b0 = lfsr & 1, b1 = (lfsr >> 1) & 1, nb = b0 ^ b1;
      lfsr = ((lfsr >> 1) | (nb << nbs)) & mask;
    }
    const lo = (lfsr & 1) ? -1 : 1;
    let env;
    if (t < tA) env = aSec > 0 ? (t / aSec) * velNorm * VOL_SCALE_NOISE : velNorm * VOL_SCALE_NOISE;
    else if (t < tD) { const f = dSec > 0 ? (t - tA) / dSec : 1; env = velNorm * VOL_SCALE_NOISE + (sustain - velNorm * VOL_SCALE_NOISE) * f; }
    else if (t < tNoff) env = sustain;
    else if (t < tRel) { const f = rSec > 0 ? (t - tNoff) / rSec : 1; env = sustain * (1 - f); }
    else env = 0;
    if (t >= cutStart && cutStart < tRel) { const f = (t - cutStart) / (tRel - cutStart); env *= 1 - f; }
    env *= ccC(t + note.time);
    const sig = lo * env;
    const { l, r } = panToLR(panCurve(t + note.time));
    mixL[oi] += sig * l;
    mixR[oi] += sig * r;
  }
}

// Old mono versions kept for reference but unused now
function renderDirectsoundNote(mix, sample, note, voice, bendRange, pbs, ccs, sr, nextStart) {
  const baseRatio = Math.pow(2, (note.midi - voice.baseKey) / 12);
  const bendC = makeBendCurve(pbs, bendRange);
  const ccC = makeCcCurve(ccs);
  const velNorm = note.velocity;
  const sustain = (voice.envelope.sustain / 255) * velNorm * VOL_SCALE_DS;
  const aSec = voice.envelope.attack / 1024;
  const dSec = voice.envelope.decay / 1024;
  const rSec = voice.envelope.release / 1024;
  const tA = aSec, tD = aSec + dSec, tNoff = note.duration;
  const naturalRel = note.duration + rSec;
  const monoCut = nextStart - note.time;
  const tRel = Math.min(naturalRel, monoCut);
  const cutFade = 0.005;
  const cutStart = (tRel < naturalRel) ? Math.max(tNoff, tRel - cutFade) : Infinity;
  const startSamp = Math.floor(note.time * sr);
  let pos = 0;
  for (let i = 0; i < Math.ceil(tRel * sr); i++) {
    const oi = startSamp + i;
    if (oi >= mix.length) break;
    const t = i / sr;
    if (t >= tRel) break;
    const ratio = baseRatio * Math.pow(2, bendC(t) / 12);
    const step = (sample.sampleRate * ratio) / sr;
    const fl = Math.floor(pos), fr = pos - fl;
    let s0 = 0, s1 = 0;
    if (fl < sample.numSamples) s0 = sample.samples[fl];
    let s1i = fl + 1;
    if (sample.loopEnd > sample.loopStart && s1i > sample.loopEnd) s1i = sample.loopStart;
    if (s1i < sample.numSamples) s1 = sample.samples[s1i];
    const sv = s0 + (s1 - s0) * fr;
    let env;
    if (t < tA) env = aSec > 0 ? (t / aSec) * velNorm * VOL_SCALE_DS : velNorm * VOL_SCALE_DS;
    else if (t < tD) { const f = dSec > 0 ? (t - tA) / dSec : 1; env = velNorm * VOL_SCALE_DS + (sustain - velNorm * VOL_SCALE_DS) * f; }
    else if (t < tNoff) env = sustain;
    else if (t < tRel) { const f = rSec > 0 ? (t - tNoff) / rSec : 1; env = sustain * (1 - f); }
    else env = 0;
    if (t >= cutStart && cutStart < tRel) { const f = (t - cutStart) / (tRel - cutStart); env *= 1 - f; }
    env *= ccC(t + note.time);
    mix[oi] += sv * env;
    pos += step;
    if (pos >= sample.numSamples) {
      if (sample.loopStart >= 0 && sample.loopEnd > sample.loopStart) {
        pos = sample.loopStart + ((pos - sample.numSamples) % (sample.loopEnd - sample.loopStart + 1));
      } else pos = sample.numSamples - 1;
    } else if (sample.loopEnd > 0 && pos > sample.loopEnd) {
      pos = sample.loopStart + ((pos - sample.loopEnd - 1) % (sample.loopEnd - sample.loopStart + 1));
    }
  }
}

function renderNoiseNote(mix, note, voice, bendRange, pbs, ccs, sr, nextStart) {
  const is7bit = ((voice.period ?? 0) & 1) === 1;
  const bendC = makeBendCurve(pbs, bendRange);
  const ccC = makeCcCurve(ccs);
  const velNorm = note.velocity;
  const sustain = (voice.envelope.sustain / 15) * velNorm * VOL_SCALE_NOISE;
  const aSec = voice.envelope.attack > 0 ? voice.envelope.attack / 60 : 0;
  const dSec = voice.envelope.decay > 0 ? voice.envelope.decay / 60 : 0.005;
  const rSec = voice.envelope.release > 0 ? voice.envelope.release / 60 : 0.04;
  const tA = aSec, tD = aSec + dSec, tNoff = note.duration;
  const naturalRel = note.duration + rSec;
  const monoCut = nextStart - note.time;
  const tRel = Math.min(naturalRel, monoCut);
  const cutFade = 0.005;
  const cutStart = (tRel < naturalRel) ? Math.max(tNoff, tRel - cutFade) : Infinity;
  let lfsr = is7bit ? 0x7F : 0x7FFF;
  const mask = is7bit ? 0x7F : 0x7FFF;
  const nbs = is7bit ? 6 : 14;
  let phase = 0;
  const startSamp = Math.floor(note.time * sr);
  for (let i = 0; i < Math.ceil(tRel * sr); i++) {
    const oi = startSamp + i;
    if (oi >= mix.length) break;
    const t = i / sr;
    if (t >= tRel) break;
    const bm = note.midi + bendC(t);
    const freq = midiNoteToNoiseFreq(Math.floor(bm));
    phase += freq / sr;
    while (phase >= 1) {
      phase -= 1;
      const b0 = lfsr & 1, b1 = (lfsr >> 1) & 1, nb = b0 ^ b1;
      lfsr = ((lfsr >> 1) | (nb << nbs)) & mask;
    }
    const lo = (lfsr & 1) ? -1 : 1;
    let env;
    if (t < tA) env = aSec > 0 ? (t / aSec) * velNorm * VOL_SCALE_NOISE : velNorm * VOL_SCALE_NOISE;
    else if (t < tD) { const f = dSec > 0 ? (t - tA) / dSec : 1; env = velNorm * VOL_SCALE_NOISE + (sustain - velNorm * VOL_SCALE_NOISE) * f; }
    else if (t < tNoff) env = sustain;
    else if (t < tRel) { const f = rSec > 0 ? (t - tNoff) / rSec : 1; env = sustain * (1 - f); }
    else env = 0;
    if (t >= cutStart && cutStart < tRel) { const f = (t - cutStart) / (tRel - cutStart); env *= 1 - f; }
    env *= ccC(t + note.time);
    mix[oi] += lo * env;
  }
}

function biquad(s, sr, freq, type, Q = 0.707, gainDb = 0) {
  const w0 = (2 * Math.PI * freq) / sr, cw = Math.cos(w0), sw = Math.sin(w0);
  const A = Math.pow(10, gainDb / 40), alpha = sw / (2 * Q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'lp') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; }
  else if (type === 'hp') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; }
  else if (type === 'peak') { b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A; }
  const out = new Float32Array(s.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < s.length; i++) {
    const x0 = s[i];
    const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    out[i] = y0; x2 = x1; x1 = x0; y2 = y1; y1 = y0;
  }
  return out;
}
function downsample(s, factor) {
  const ol = Math.floor(s.length / factor);
  const out = new Float32Array(ol);
  for (let i = 0; i < ol; i++) {
    let sum = 0;
    for (let j = 0; j < factor; j++) sum += s[i * factor + j];
    out[i] = sum / factor;
  }
  return out;
}
function normalize(s, peak = 0.7) {
  let p = 0;
  for (const v of s) { const a = Math.abs(v); if (a > p) p = a; }
  if (p === 0) return s;
  const g = peak / p;
  const out = new Float32Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s[i] * g;
  return out;
}
function fadeInOut(s, sr, fIn = 10, fOut = 5) {
  const ni = Math.floor(fIn * sr / 1000), no = Math.floor(fOut * sr / 1000);
  for (let i = 0; i < ni && i < s.length; i++) s[i] *= i / ni;
  for (let i = 0; i < no && i < s.length; i++) s[s.length - 1 - i] *= i / no;
  return s;
}
function writeWav(filename, s, sr) {
  const dataSize = s.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  let p = 0;
  buf.write('RIFF', p); p += 4;
  buf.writeUInt32LE(36 + dataSize, p); p += 4;
  buf.write('WAVE', p); p += 4;
  buf.write('fmt ', p); p += 4;
  buf.writeUInt32LE(16, p); p += 4;
  buf.writeUInt16LE(1, p); p += 2;
  buf.writeUInt16LE(1, p); p += 2;
  buf.writeUInt32LE(sr, p); p += 4;
  buf.writeUInt32LE(sr * 2, p); p += 4;
  buf.writeUInt16LE(2, p); p += 2;
  buf.writeUInt16LE(16, p); p += 2;
  buf.write('data', p); p += 4;
  buf.writeUInt32LE(dataSize, p); p += 4;
  for (let i = 0; i < s.length; i++) {
    const v = Math.max(-1, Math.min(1, s[i]));
    buf.writeInt16LE(Math.round(v * 32767), p); p += 2;
  }
  writeFileSync(filename, buf);
}

async function renderSE(name, midiPath, vgName) {
  const buf = readFileSync(midiPath);
  const midi = new Midi(buf);
  // PRE-CHECK : si une track directsound a un sample manquant, on REFUSE
  // de pre-render ce SE → fallback sur spessasynth (= le SF2 ripped peut
  // contenir le sample même si la décomp n'a pas le .wav).
  for (const track of midi.tracks) {
    if (track.notes.length === 0) continue;
    const prog = track.instrument?.number ?? 0;
    const v = loadVoice(vgName, prog);
    if (!v || v.category !== 'directsound') continue;
    const wavPath = sampleLabelToWavPath(v.sampleLabel);
    if (!existsSync(wavPath)) {
      console.log(`  ${name}: SKIP (sample missing: ${v.sampleLabel})`);
      return false;
    }
  }
  const totalSamples = Math.ceil((midi.duration + 0.5) * INTERNAL_RATE);
  // STEREO render : 2 separate buffers L + R
  const mixL = new Float32Array(totalSamples);
  const mixR = new Float32Array(totalSamples);
  let total = 0;
  for (const track of midi.tracks) {
    if (track.notes.length === 0) continue;
    const prog = track.instrument?.number ?? 0;
    const v = loadVoice(vgName, prog);
    if (!v) continue;
    const cc20 = track.controlChanges?.[20] || [];
    const bendRange = cc20.length > 0 ? Math.round(cc20[0].value * 127) : 2;
    const pbs = (track.pitchBends || []).map(p => ({ time: p.time, value: p.value }));
    const cc7s = (track.controlChanges?.[7] || []).map(c => ({ time: c.time, value: c.value }));
    // CC10 pan : 0=full L, 0.5=center, 1=full R. Default center if no events.
    const cc10s = (track.controlChanges?.[10] || []).map(c => ({ time: c.time, value: c.value }));
    const panCurve = makeCcCurve(cc10s, 0.5);
    const sorted = track.notes.slice().sort((a, b) => a.time - b.time);
    const nextStarts = sorted.map((_, i) => i + 1 < sorted.length ? sorted[i + 1].time : Infinity);
    if (v.category === 'directsound') {
      const wavPath = sampleLabelToWavPath(v.sampleLabel);
      if (!existsSync(wavPath)) continue;
      let raw;
      try { raw = readWav(wavPath); } catch { continue; }
      const sample = preprocessLoopCrossfade(raw, 25);
      for (let i = 0; i < sorted.length; i++) {
        renderDirectsoundNoteStereo(mixL, mixR, sample, sorted[i], v, bendRange, pbs, cc7s, panCurve, INTERNAL_RATE, nextStarts[i]);
        total++;
      }
    } else if (v.category === 'noise') {
      for (let i = 0; i < sorted.length; i++) {
        renderNoiseNoteStereo(mixL, mixR, sorted[i], v, bendRange, pbs, cc7s, panCurve, INTERNAL_RATE, nextStarts[i]);
        total++;
      }
    }
  }
  if (total === 0) return false;
  // Apply GBA speaker EQ to both channels
  const procChan = (s) => {
    let r = biquad(s, INTERNAL_RATE, SPEAKER_HP, 'hp');
    r = biquad(r, INTERNAL_RATE, 2200, 'peak', 0.7, 1.5);
    r = biquad(r, INTERNAL_RATE, SPEAKER_LP, 'lp');
    r = biquad(r, INTERNAL_RATE, SPEAKER_LP, 'lp');
    r = downsample(r, 4);  // 196608 / 4 = 48000
    return r;
  };
  let sL = procChan(mixL);
  let sR = procChan(mixR);
  // Normalize jointly (same gain factor) to preserve stereo balance
  let peak = 0;
  for (let i = 0; i < sL.length; i++) {
    const a = Math.max(Math.abs(sL[i]), Math.abs(sR[i]));
    if (a > peak) peak = a;
  }
  if (peak > 0) {
    const g = 0.75 / peak;
    for (let i = 0; i < sL.length; i++) { sL[i] *= g; sR[i] *= g; }
  }
  // Fade in/out both channels
  const fadeIn = Math.floor(0.010 * 48000);
  const fadeOut = Math.floor(0.005 * 48000);
  for (let i = 0; i < fadeIn && i < sL.length; i++) { sL[i] *= i / fadeIn; sR[i] *= i / fadeIn; }
  for (let i = 0; i < fadeOut && i < sL.length; i++) {
    sL[sL.length - 1 - i] *= i / fadeOut;
    sR[sR.length - 1 - i] *= i / fadeOut;
  }
  writeWavStereo(join(OUT_DIR, `${name}.wav`), sL, sR, 48000);
  return true;
}

// ─── stereo write WAV ───────────────────────────────────────────────────────
function writeWavStereo(filename, sL, sR, sr) {
  const numSamples = Math.min(sL.length, sR.length);
  const dataSize = numSamples * 4;  // 2 ch * 2 bytes
  const buf = Buffer.alloc(44 + dataSize);
  let p = 0;
  buf.write('RIFF', p); p += 4;
  buf.writeUInt32LE(36 + dataSize, p); p += 4;
  buf.write('WAVE', p); p += 4;
  buf.write('fmt ', p); p += 4;
  buf.writeUInt32LE(16, p); p += 4;
  buf.writeUInt16LE(1, p); p += 2;       // PCM
  buf.writeUInt16LE(2, p); p += 2;       // 2 channels (stereo)
  buf.writeUInt32LE(sr, p); p += 4;
  buf.writeUInt32LE(sr * 4, p); p += 4;  // byteRate = sr * channels * bytesPerSample
  buf.writeUInt16LE(4, p); p += 2;       // blockAlign = channels * bytesPerSample
  buf.writeUInt16LE(16, p); p += 2;
  buf.write('data', p); p += 4;
  buf.writeUInt32LE(dataSize, p); p += 4;
  for (let i = 0; i < numSamples; i++) {
    const lv = Math.max(-1, Math.min(1, sL[i]));
    const rv = Math.max(-1, Math.min(1, sR[i]));
    buf.writeInt16LE(Math.round(lv * 32767), p); p += 2;
    buf.writeInt16LE(Math.round(rv * 32767), p); p += 2;
  }
  writeFileSync(filename, buf);
}

// ─── Main : iterate all SE in midi.cfg ───────────────────────────────────────
const cfg = parseMidiCfg();
const seNames = Object.keys(cfg).filter(n => n.startsWith('se_') || n.startsWith('ph_'));
console.log(`Total SE/PH in midi.cfg: ${seNames.length}`);
console.log();

const renderedList = [];
const stats = { rendered: 0, skipped_noNoise: 0, skipped_invalid: 0 };

for (const name of seNames) {
  const vgName = cfg[name];
  const midiPath = join(MIDI_DIR, `${name}.mid`);
  if (!existsSync(midiPath)) { stats.skipped_invalid++; continue; }
  let midi;
  try { midi = new Midi(readFileSync(midiPath)); } catch { stats.skipped_invalid++; continue; }
  const cls = classify(midi, vgName);
  if (!cls.pre) {
    stats.skipped_noNoise++;
    continue;
  }
  const ok = await renderSE(name, midiPath, vgName);
  if (ok) {
    renderedList.push({ name, voicegroup: vgName, reason: cls.reason });
    stats.rendered++;
    process.stdout.write(`[${stats.rendered}] ${name} (${cls.reason})\n`);
  }
}

console.log();
console.log(`✓ Rendered: ${stats.rendered}`);
console.log(`  Skipped no-noise (= directsound only, spessasynth path): ${stats.skipped_noNoise}`);
console.log(`  Skipped invalid (= midi missing/corrupt): ${stats.skipped_invalid}`);

// Write the list for browser consumption
const listPath = join(OUT_DIR, 'pre-rendered-list.json');
writeFileSync(listPath, JSON.stringify(renderedList.map(r => r.name), null, 2));
console.log(`\nList saved : ${listPath}`);
