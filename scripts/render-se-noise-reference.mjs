/**
 * Render SE noise → WAV via 1:1 hardware GBA LFSR algorithm.
 *
 * Génère un fichier WAV pour chaque SE problématique, en utilisant exactement
 * le même algo que `public/m4a-noise-lfsr-processor.js` + l'envelope du voice
 * extracted dans `voicegroups-data/rs_sfx_*.ts`.
 *
 * But : permettre au user de comparer 1 instance propre (= pas le 8x HMR
 * pollution du dev server) avec son souvenir hardware. Si ça sonne pareil
 * qu'en preview → 8x HMR est innocent. Si ça sonne mieux → 8x est coupable.
 *
 * Usage : node scripts/render-se-noise-reference.mjs
 * Output : scripts/reference/<song>.wav
 */
import midiPkg from '@tonejs/midi';
const { Midi } = midiPkg;
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
// Output public/audio/se_prerendered/ pour que le browser puisse fetch via HTTP.
const OUT_DIR = resolve(PROJECT_ROOT, 'public', 'audio', 'se_prerendered');
mkdirSync(OUT_DIR, { recursive: true });

// Internal render rate très élevé pour réduire l'aliasing du LFSR.
// 192 kHz = Nyquist 96 kHz = LFSR up to ~96 kHz est sampled correctly.
// LFSR au-dessus alias mais le low-pass 6 kHz post-render élimine la majorité.
const INTERNAL_RATE = 192000;
const OUTPUT_RATE = 48000;
const DOWNSAMPLE_FACTOR = INTERNAL_RATE / OUTPUT_RATE;  // = 4
// Cutoff low-pass = simulation speaker GBA (= ~6 kHz freq response).
const LOWPASS_CUTOFF = 6000;

// ─── gNoiseTable (1:1 décomp src/m4a_tables.c) ──────────────────────────────
const G_NOISE_TABLE = [
  0xD7, 0xD6, 0xD5, 0xD4,
  0xC7, 0xC6, 0xC5, 0xC4,
  0xB7, 0xB6, 0xB5, 0xB4,
  0xA7, 0xA6, 0xA5, 0xA4,
  0x97, 0x96, 0x95, 0x94,
  0x87, 0x86, 0x85, 0x84,
  0x77, 0x76, 0x75, 0x74,
  0x67, 0x66, 0x65, 0x64,
  0x57, 0x56, 0x55, 0x54,
  0x47, 0x46, 0x45, 0x44,
  0x37, 0x36, 0x35, 0x34,
  0x27, 0x26, 0x25, 0x24,
  0x17, 0x16, 0x15, 0x14,
  0x07, 0x06, 0x05, 0x04,
  0x03, 0x02, 0x01, 0x00,
];

function midiNoteToNoiseFreq(key) {
  if (key <= 20) return decodeNr43(G_NOISE_TABLE[0]);
  let idx = key - 21;
  if (idx > 59) idx = 59;
  return decodeNr43(G_NOISE_TABLE[idx]);
}

function decodeNr43(nr43) {
  const s = (nr43 >> 4) & 0xF;
  const r = nr43 & 0x7;
  const divisor = r === 0 ? 0.5 : r;
  return 524288 / divisor / (1 << (s + 1));
}

// ─── LFSR generator avec freq variable (= pitch bend support) ───────────────
// freqAtTime = function(t) → freq Hz. t exprimé en secondes depuis note start.
function generateLfsrSamplesWithBend(freqAtTime, durationSec, is7bit, sampleRate) {
  const totalSamples = Math.ceil(durationSec * sampleRate);
  const out = new Float32Array(totalSamples);
  let lfsr = is7bit ? 0x7F : 0x7FFF;
  const mask = is7bit ? 0x7F : 0x7FFF;
  const newBitShift = is7bit ? 6 : 14;
  let phase = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const freq = freqAtTime(t);
    phase += freq / sampleRate;
    while (phase >= 1) {
      phase -= 1;
      const bit0 = lfsr & 1;
      const bit1 = (lfsr >> 1) & 1;
      const newBit = bit0 ^ bit1;
      lfsr = ((lfsr >> 1) | (newBit << newBitShift)) & mask;
    }
    out[i] = (lfsr & 1) ? -1 : 1;
  }
  return out;
}

// Build une fonction freq(t) à partir des pitch bends de la track (relatifs à note start).
// pitchBends[] = [{ time: secs, value: -1..+1 }] avec time RELATIF au début de la note.
// bendRange = en semitones (default 2 = standard MIDI).
// baseMidi = midi de la note.
// Pour le noise channel, pitch bend décale la `key` qui sert d'index dans gNoiseTable.
function buildFreqAtTime(baseMidi, pitchBends, bendRange = 2) {
  // Sort pitch bends by time
  const sorted = pitchBends.slice().sort((a, b) => a.time - b.time);
  return (t) => {
    // Find current bend value via linear interpolation
    let bendValue = 0;
    if (sorted.length === 0) {
      bendValue = 0;
    } else if (t <= sorted[0].time) {
      bendValue = sorted[0].value;
    } else if (t >= sorted[sorted.length - 1].time) {
      bendValue = sorted[sorted.length - 1].value;
    } else {
      // Find surrounding events
      for (let i = 0; i < sorted.length - 1; i++) {
        if (t >= sorted[i].time && t < sorted[i + 1].time) {
          const f = (t - sorted[i].time) / (sorted[i + 1].time - sorted[i].time);
          bendValue = sorted[i].value + (sorted[i + 1].value - sorted[i].value) * f;
          break;
        }
      }
    }
    // Apply bend to baseMidi: bendValue=-1..+1 maps to ±bendRange semitones.
    // 1:1 décomp m4a.c:793-803 utilise x >> 8 (= Math.floor), PAS round.
    // Donc le shift d'octave est plus tardif (= bend doit dépasser 1.0 semitone
    // entier avant de changer la table entry).
    const bentMidi = baseMidi + bendValue * bendRange;
    return midiNoteToNoiseFreq(Math.floor(bentMidi));
  };
}

// ─── ADSR envelope + CC7 volume ramps (1:1 hardware avec CC7 modulation) ────
function applyEnvelope(samples, voice, velocity, sampleRate, durationSec, cc7Events = []) {
  const velNorm = velocity / 127;
  const sustainNorm = (voice.envelope.sustain / 15) * velNorm * 0.15;
  const attackSec = voice.envelope.attack > 0 ? voice.envelope.attack / 60 : 0;
  const decaySec = voice.envelope.decay > 0 ? voice.envelope.decay / 60 : 0.005;
  const releaseSec = voice.envelope.release > 0 ? voice.envelope.release / 60 : 0.04;

  const totalSec = durationSec + releaseSec;
  const totalSamples = Math.ceil(totalSec * sampleRate);
  const out = new Float32Array(totalSamples);

  const tAttackEnd = attackSec;
  const tDecayEnd = attackSec + decaySec;
  const tNoteOff = durationSec;
  const tReleaseEnd = durationSec + releaseSec;

  // Sort CC7 events by time (relative to note start)
  const cc7Sorted = cc7Events.slice().sort((a, b) => a.time - b.time);

  // Build a function cc7AtTime(t) returning multiplier 0-1
  const cc7AtTime = (t) => {
    if (cc7Sorted.length === 0) return 1.0;
    if (t <= cc7Sorted[0].time) return cc7Sorted[0].value;
    if (t >= cc7Sorted[cc7Sorted.length - 1].time) return cc7Sorted[cc7Sorted.length - 1].value;
    for (let i = 0; i < cc7Sorted.length - 1; i++) {
      if (t >= cc7Sorted[i].time && t < cc7Sorted[i + 1].time) {
        const f = (t - cc7Sorted[i].time) / (cc7Sorted[i + 1].time - cc7Sorted[i].time);
        return cc7Sorted[i].value + (cc7Sorted[i + 1].value - cc7Sorted[i].value) * f;
      }
    }
    return 1.0;
  };

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let gain;
    if (t < tAttackEnd) {
      gain = attackSec > 0 ? (t / attackSec) * velNorm : velNorm;
    } else if (t < tDecayEnd) {
      const f = decaySec > 0 ? (t - tAttackEnd) / decaySec : 1;
      gain = velNorm + (sustainNorm - velNorm) * f;
    } else if (t < tNoteOff) {
      // SUSTAIN PHASE — apply CC7 volume modulation here
      gain = sustainNorm * cc7AtTime(t);
    } else if (t < tReleaseEnd) {
      const f = releaseSec > 0 ? (t - tNoteOff) / releaseSec : 1;
      gain = sustainNorm * cc7AtTime(tNoteOff) * (1 - f);
    } else {
      gain = 0;
    }
    const sampleIdx = Math.min(i, samples.length - 1);
    out[i] = (samples[sampleIdx] || 0) * gain;
  }
  return out;
}

// ─── Biquad low-pass filter (Butterworth Q=0.707) ───────────────────────────
// Simule le frequency response analog du speaker GBA (~6 kHz cutoff).
// Cascade de 3 stages = 18 dB/octave rolloff.
function biquadLowpass(samples, sampleRate, cutoffHz) {
  // RBJ cookbook biquad lowpass coefficients
  const w0 = (2 * Math.PI * cutoffHz) / sampleRate;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const Q = 0.707; // Butterworth (no resonance peak)
  const alpha = sinW0 / (2 * Q);
  const b0 = (1 - cosW0) / 2;
  const b1 = 1 - cosW0;
  const b2 = (1 - cosW0) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha;
  const nb0 = b0 / a0, nb1 = b1 / a0, nb2 = b2 / a0;
  const na1 = a1 / a0, na2 = a2 / a0;
  const out = new Float32Array(samples.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i];
    const y0 = nb0 * x0 + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2;
    out[i] = y0;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0;
  }
  return out;
}

// Cascade 3 biquads pour avoir une rolloff plus aggressive (~18 dB/octave).
function lowpassCascade3x(samples, sampleRate, cutoffHz) {
  let s = samples;
  s = biquadLowpass(s, sampleRate, cutoffHz);
  s = biquadLowpass(s, sampleRate, cutoffHz);
  s = biquadLowpass(s, sampleRate, cutoffHz);
  return s;
}

// Downsample par factor: average chaque groupe de N samples (= boxcar filter).
// Le low-pass cascade au-dessus a déjà supprimé les freqs > Nyquist du output,
// donc le boxcar additionnel est juste pour décimer proprement.
function downsample(samples, factor) {
  const outLen = Math.floor(samples.length / factor);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    let sum = 0;
    for (let j = 0; j < factor; j++) {
      sum += samples[i * factor + j];
    }
    out[i] = sum / factor;
  }
  return out;
}

// Normalize peak amplitude à -3 dB (= 0.7 max) pour éviter clipping + headroom.
function normalize(samples, targetPeak = 0.7) {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > peak) peak = a;
  }
  if (peak === 0) return samples;
  const gain = targetPeak / peak;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * gain;
  return out;
}

// ─── WAV writer (PCM 16-bit mono) ───────────────────────────────────────────
function writeWav(filename, samples, sampleRate) {
  const numSamples = samples.length;
  const byteRate = sampleRate * 2;
  const blockAlign = 2;
  const dataSize = numSamples * 2;
  const fileSize = 44 + dataSize;
  const buf = Buffer.alloc(fileSize);
  let p = 0;
  buf.write('RIFF', p); p += 4;
  buf.writeUInt32LE(fileSize - 8, p); p += 4;
  buf.write('WAVE', p); p += 4;
  buf.write('fmt ', p); p += 4;
  buf.writeUInt32LE(16, p); p += 4;          // fmt chunk size
  buf.writeUInt16LE(1, p); p += 2;            // PCM
  buf.writeUInt16LE(1, p); p += 2;            // mono
  buf.writeUInt32LE(sampleRate, p); p += 4;
  buf.writeUInt32LE(byteRate, p); p += 4;
  buf.writeUInt16LE(blockAlign, p); p += 2;
  buf.writeUInt16LE(16, p); p += 2;           // 16-bit
  buf.write('data', p); p += 4;
  buf.writeUInt32LE(dataSize, p); p += 4;
  for (let i = 0; i < numSamples; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), p);
    p += 2;
  }
  writeFileSync(filename, buf);
}

// ─── Voicegroup loader (parse .inc directly) ────────────────────────────────
function loadNoiseVoice(vgName, voiceIdx) {
  const incPath = resolve(PROJECT_ROOT, '..', 'decomps', 'pokeemeraude', 'sound', 'voicegroups', `${vgName}.inc`);
  const text = readFileSync(incPath, 'utf8');
  const lines = text.split('\n');
  // Skip the first non-comment, non-blank line which is voicegroup label
  let curIdx = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('@') || t.startsWith('.')) continue;
    if (t.startsWith('voicegroup_')) continue;
    if (curIdx === voiceIdx) {
      // Parse this voice line. e.g.: voice_noise_alt 60, 0, 0, 2, 0, 15, 0
      const m = t.match(/^(voice_\w+)\s+(.+)$/);
      if (!m) throw new Error(`cannot parse voice line: ${t}`);
      const macro = m[1];
      const args = m[2].split(',').map(s => parseInt(s.trim(), 10));
      if (macro === 'voice_noise' || macro === 'voice_noise_alt') {
        // base_midi_key, pan, period, attack, decay, sustain, release
        return {
          type: macro === 'voice_noise_alt' ? 'noise_alt' : 'noise',
          baseKey: args[0],
          panSweep: args[1],
          period: args[2],
          envelope: {
            attack: args[3],
            decay: args[4],
            sustain: args[5],
            release: args[6],
          },
        };
      }
      throw new Error(`voice ${voiceIdx} in ${vgName} is not noise: ${macro}`);
    }
    curIdx++;
  }
  throw new Error(`voice idx ${voiceIdx} not found in ${vgName}`);
}

// ─── Render single SE ───────────────────────────────────────────────────────
async function renderSE({ name, midiPath, voicegroupName }) {
  console.log(`\n── ${name} ──`);
  const arrBuf = readFileSync(midiPath);
  const midi = new Midi(arrBuf);
  console.log(`MIDI duration: ${midi.duration.toFixed(2)}s, ${midi.tracks.length} tracks`);

  // Mix all notes from all tracks into one buffer at INTERNAL_RATE.
  const totalSec = midi.duration + 0.5;
  const totalSamples = Math.ceil(totalSec * INTERNAL_RATE);
  const mix = new Float32Array(totalSamples);

  let noteCount = 0;
  let noiseTrackCount = 0;
  for (const track of midi.tracks) {
    if (track.notes.length === 0) continue;
    const program = track.instrument?.number ?? 0;
    let voice;
    try {
      voice = loadNoiseVoice(voicegroupName, program);
    } catch (e) {
      console.log(`  track ch=${track.channel} program=${program} skipped (${e.message.split(':')[0]})`);
      continue;
    }
    noiseTrackCount++;
    console.log(`  track ch=${track.channel} program=${program} → voice ${voice.type} period=${voice.period} env=A${voice.envelope.attack}/D${voice.envelope.decay}/S${voice.envelope.sustain}/R${voice.envelope.release}`);

    // Pour chaque note : trouver les pitch bends + CC7 dans la window de la note
    const pitchBends = track.pitchBends || [];
    const cc7Events = track.controlChanges?.[7] || [];
    // CC20 = BENDR sur M4A engine (mid2agb agb.cpp:383). Default 2 si absent.
    // Valeur raw (0-127) = bend range en semitones.
    const cc20Events = track.controlChanges?.[20] || [];
    const bendRange = cc20Events.length > 0
      ? Math.round(cc20Events[0].value * 127)
      : 2;
    console.log(`    bendRange (BENDR via CC20): ${bendRange} semitones`);
    for (const note of track.notes) {
      noteCount++;
      const noteEnd = note.time + note.duration;
      // Pitch bends relatifs au start de la note (filtre + remap time)
      const noteBends = pitchBends
        .filter(pb => pb.time >= note.time && pb.time <= noteEnd)
        .map(pb => ({ time: pb.time - note.time, value: pb.value }));
      // CC7 relatifs au start de la note
      const noteCc7 = cc7Events
        .filter(cc => cc.time >= note.time && cc.time <= noteEnd)
        .map(cc => ({ time: cc.time - note.time, value: cc.value }));
      const is7bit = (voice.period & 1) === 1;
      // Build freq(t) qui inclut les pitch bends. Bend range from CC20 (BENDR).
      const freqAtTime = buildFreqAtTime(note.midi, noteBends, bendRange);
      const samples = generateLfsrSamplesWithBend(freqAtTime, note.duration, is7bit, INTERNAL_RATE);
      const enveloped = applyEnvelope(samples, voice, Math.round(note.velocity * 127), INTERNAL_RATE, note.duration, noteCc7);
      const startSample = Math.floor(note.time * INTERNAL_RATE);
      for (let i = 0; i < enveloped.length && startSample + i < mix.length; i++) {
        mix[startSample + i] += enveloped[i];
      }
      const initFreq = midiNoteToNoiseFreq(note.midi);
      // Probe peak freq mid-note (= where bend often peaks)
      let peakFreq = initFreq;
      for (let s = 0; s < 20; s++) {
        const t = (s / 20) * note.duration;
        const f = freqAtTime(t);
        if (f > peakFreq) peakFreq = f;
      }
      console.log(`    note midi=${note.midi} init=${initFreq.toFixed(0)}Hz peak=${peakFreq.toFixed(0)}Hz dur=${note.duration.toFixed(3)}s vel=${Math.round(note.velocity * 127)} bends=${noteBends.length} cc7=${noteCc7.length}`);
    }
  }
  console.log(`Total noise tracks: ${noiseTrackCount}, notes: ${noteCount}`);
  if (noteCount === 0) {
    console.log(`  → no noise notes, skipping WAV`);
    return;
  }

  // Pipeline post-render :
  // 1. Low-pass cascade 6kHz @ 192kHz internal (= simulation speaker GBA)
  // 2. Downsample 192→48 kHz par factor 4 avec boxcar averaging
  // 3. Normalize peak à 0.7 (= -3 dB headroom anti-clipping)
  console.log(`  applying lowpass cascade 6kHz @ ${INTERNAL_RATE}Hz...`);
  const filtered = lowpassCascade3x(mix, INTERNAL_RATE, LOWPASS_CUTOFF);
  console.log(`  downsampling ${INTERNAL_RATE}→${OUTPUT_RATE} Hz (factor ${DOWNSAMPLE_FACTOR})...`);
  const downsampled = downsample(filtered, DOWNSAMPLE_FACTOR);
  console.log(`  normalizing to peak 0.7...`);
  const normalized = normalize(downsampled, 0.7);
  const outPath = join(OUT_DIR, `${name}.wav`);
  writeWav(outPath, normalized, OUTPUT_RATE);
  console.log(`→ ${outPath} (${(normalized.length / OUTPUT_RATE).toFixed(2)}s, ${(normalized.length * 2 / 1024).toFixed(0)} KB)`);
}

// ─── Main ───────────────────────────────────────────────────────────────────
const DECOMP_MIDI_DIR = resolve(PROJECT_ROOT, '..', 'decomps', 'pokeemeraude', 'sound', 'songs', 'midi');

// SE list to render. (name, midi, voicegroup) — voicegroup from midi.cfg.
const SE_LIST = [
  // Long-noise SE flagged in project_audio_engine_status.md :
  { name: 'se_intro_blast',     mid: 'se_intro_blast.mid',     vg: 'rs_sfx_1' },
  { name: 'se_orb',             mid: 'se_orb.mid',             vg: 'rs_sfx_2' },
  { name: 'se_elevator',        mid: 'se_elevator.mid',        vg: 'rs_sfx_2' },
  { name: 'se_m_twister',       mid: 'se_m_twister.mid',       vg: 'rs_sfx_2' },
  { name: 'se_mugshot',         mid: 'se_mugshot.mid',         vg: 'rs_sfx_2' },
  { name: 'se_ship',            mid: 'se_ship.mid',            vg: 'rs_sfx_2' },
  { name: 'se_m_sacred_fire2',  mid: 'se_m_sacred_fire2.mid',  vg: 'rs_sfx_2' },
  { name: 'se_effective',       mid: 'se_effective.mid',       vg: 'rs_sfx_1' },
  { name: 'se_m_flame_wheel2',  mid: 'se_m_flame_wheel2.mid',  vg: 'rs_sfx_2' },
  { name: 'se_m_yawn',          mid: 'se_m_yawn.mid',          vg: 'rs_sfx_2' },
  { name: 'se_faint',           mid: 'se_faint.mid',           vg: 'rs_sfx_1' },
  // SE classique demandé par user :
  { name: 'se_m_sing',          mid: 'se_m_sing.mid',          vg: 'rs_sfx_2' },
];
for (const se of SE_LIST) {
  await renderSE({
    name: se.name,
    midiPath: join(DECOMP_MIDI_DIR, se.mid),
    voicegroupName: se.vg,
  });
}

console.log(`\n✓ All WAVs written to: ${OUT_DIR}`);
