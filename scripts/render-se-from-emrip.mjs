/**
 * Render all SE WAVs from the em-rip69/ gba-mus-ripper output.
 *
 * Strategy :
 *   1. Parse decomp's song_table.inc → ordered [songIndex, songName] list.
 *   2. For each `se_*` song : load song{index+1:04}.mid + em.sf2 → spessa render.
 *   3. Save WAV at public/audio/se_prerendered/<name>.wav.
 *   4. Update pre-rendered-list.json to include ALL rendered SE.
 *
 * em.sf2 from gba-mus-ripper has pre-recorded GBA hardware PSG samples
 * (= "Noise normal 42..", "square 50%A..", etc) baked in. These come from
 * Bregalad's psg_data.raw — actual GBA recordings — so SE that use noise
 * channel will sound 1:1 with real hardware.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SpessaSynthProcessor,
  SpessaSynthSequencer,
  BasicMIDI,
  SoundBankLoader,
  audioToWav,
} from 'spessasynth_core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const SAMPLE_RATE = 48000;
const BLOCK_SIZE = 128;
const FADE_AFTER_MIDI_S = 0.5;
const MAX_DURATION_S = 8;
const SILENCE_TAIL_S = 0.05;

const RIP_DIR = resolve(PROJECT_ROOT, 'public', 'em-rip69');
const SF2_PATH = resolve(RIP_DIR, 'em.sf2');
const SONG_TABLE = resolve(PROJECT_ROOT, '..', 'decomps', 'pokeemeraude', 'sound', 'song_table.inc');
const OUT_DIR = resolve(PROJECT_ROOT, 'public', 'audio', 'se_prerendered');

mkdirSync(OUT_DIR, { recursive: true });

// === Parse song_table.inc → ordered list ===
const tableTxt = readFileSync(SONG_TABLE, 'utf-8');
const songNames = [];
for (const rawLine of tableTxt.split('\n')) {
  const m = rawLine.trim().match(/^song\s+(\w+),/);
  if (m) songNames.push(m[1]);
}
console.log(`Parsed ${songNames.length} songs from song_table.inc`);

// Filter SE only.
// IMPORTANT : gba-mus-ripper outputs songNNN.mid where NNN = songs.h ID directly
// (= 0-based index in song_table). songNames[0]=mus_dummy → song0000? actually
// rip starts at song0001.mid for ID 1 (= skips dummy at ID 0). Verified by
// decoding song0103.mid which matches se_intro_blast (= ID 103) decomp source.
const seEntries = songNames
  .map((name, i) => ({ name, index: i, fname: `song${String(i).padStart(4, '0')}.mid` }))
  .filter(e => e.name.startsWith('se_'));
console.log(`${seEntries.length} SE entries`);

// === Load SF2 once ===
console.log('Loading em.sf2 (gba-mus-ripper output, has GBA hardware-recorded PSG samples)...');
const sf2Buf = readFileSync(SF2_PATH);
const sf2Ab = sf2Buf.buffer.slice(sf2Buf.byteOffset, sf2Buf.byteOffset + sf2Buf.byteLength);
const soundBank = SoundBankLoader.fromArrayBuffer(sf2Ab);
console.log(`  ${soundBank.presets.length} presets, ${soundBank.samples.length} samples`);

// === Render each SE ===
const rendered = [];
const skipped = [];
const t0 = Date.now();

for (let i = 0; i < seEntries.length; i++) {
  const { name, fname } = seEntries[i];
  const midPath = resolve(RIP_DIR, fname);
  if (!existsSync(midPath)) {
    skipped.push({ name, reason: 'midi missing' });
    continue;
  }

  try {
    const processor = new SpessaSynthProcessor(SAMPLE_RATE);
    await processor.processorInitialized;
    processor.soundBankManager.addSoundBank(soundBank, 'main', 0);

    const sequencer = new SpessaSynthSequencer(processor);
    sequencer.loopCount = 0;
    sequencer.skipToFirstNoteOn = false;

    const midBuf = readFileSync(midPath);
    const midAb = midBuf.buffer.slice(midBuf.byteOffset, midBuf.byteOffset + midBuf.byteLength);
    const midi = BasicMIDI.fromArrayBuffer(midAb, fname);
    sequencer.loadNewSongList([midi]);
    sequencer.play();

    const TARGET_END_S = Math.min(midi.duration + FADE_AFTER_MIDI_S, MAX_DURATION_S);
    const TARGET_END_BLOCKS = Math.ceil((TARGET_END_S * SAMPLE_RATE) / BLOCK_SIZE);
    const SILENCE_BLOCKS_LIMIT = Math.ceil((SAMPLE_RATE * SILENCE_TAIL_S) / BLOCK_SIZE);
    const MAX_BLOCKS = Math.ceil((MAX_DURATION_S * SAMPLE_RATE) / BLOCK_SIZE);

    const left = new Float32Array(BLOCK_SIZE);
    const right = new Float32Array(BLOCK_SIZE);
    const leftChunks = [];
    const rightChunks = [];

    let blocks = 0;
    let silenceBlocks = 0;
    while (blocks < MAX_BLOCKS) {
      sequencer.processTick();
      left.fill(0);
      right.fill(0);
      processor.process(left, right);
      leftChunks.push(new Float32Array(left));
      rightChunks.push(new Float32Array(right));
      blocks++;
      if (blocks >= TARGET_END_BLOCKS) {
        let isSilent = true;
        for (let s = 0; s < BLOCK_SIZE; s++) {
          if (Math.abs(left[s]) > 1e-4 || Math.abs(right[s]) > 1e-4) { isSilent = false; break; }
        }
        if (isSilent) silenceBlocks++; else silenceBlocks = 0;
        if (silenceBlocks >= SILENCE_BLOCKS_LIMIT) break;
      }
    }

    // Concatenate chunks
    const totalSamples = leftChunks.length * BLOCK_SIZE;
    const finalL = new Float32Array(totalSamples);
    const finalR = new Float32Array(totalSamples);
    for (let c = 0; c < leftChunks.length; c++) {
      finalL.set(leftChunks[c], c * BLOCK_SIZE);
      finalR.set(rightChunks[c], c * BLOCK_SIZE);
    }

    // Apply fadeout (= GBA-style)
    const fadeStart = Math.floor(midi.duration * SAMPLE_RATE);
    const fadeEnd = Math.floor((midi.duration + FADE_AFTER_MIDI_S) * SAMPLE_RATE);
    const fadeLen = fadeEnd - fadeStart;
    for (let s = fadeStart; s < totalSamples; s++) {
      const t = (s - fadeStart) / fadeLen;
      const gain = s >= fadeEnd ? 0 : (1 - t) * (1 - t);
      finalL[s] *= gain;
      finalR[s] *= gain;
    }

    const wav = audioToWav([finalL, finalR], SAMPLE_RATE, { normalizeAudio: false });
    writeFileSync(resolve(OUT_DIR, `${name}.wav`), Buffer.from(wav));
    rendered.push(name);

    if ((i + 1) % 30 === 0 || i === seEntries.length - 1) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  [${i + 1}/${seEntries.length}] ${name} (${elapsed}s)`);
    }
  } catch (e) {
    skipped.push({ name, reason: e.message });
  }
}

console.log(`\n✓ Rendered ${rendered.length}/${seEntries.length} SE in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (skipped.length > 0) {
  console.log(`  Skipped ${skipped.length} :`);
  for (const s of skipped.slice(0, 10)) console.log(`    ${s.name}: ${s.reason}`);
}

// Update pre-rendered-list.json
const listPath = resolve(OUT_DIR, 'pre-rendered-list.json');
writeFileSync(listPath, JSON.stringify(rendered.sort(), null, 2));
console.log(`\nList saved : ${listPath}`);
