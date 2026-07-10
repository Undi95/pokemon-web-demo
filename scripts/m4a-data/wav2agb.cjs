/**
 * scripts/m4a-data/wav2agb.cjs — transcription 1:1 de tools/wav2agb (décomp
 * pokeemeraude, ipatix 2019 : wav_file.cpp + converter.cpp) — .wav → .bin AGB
 * (WaveData : header 16 octets + PCM s8 ou blocs DPCM 0x21).
 *
 * Seul le mode BINAIRE est transcrit : audio_rules.mk n'invoque wav2agb que
 * via `-b` (samples : `wav2agb -b in.wav out.bin` ; cries :
 * `wav2agb -b -c -l 1 --no-pad in.wav out.bin`). Le mode assembleur
 * (convert_uncompressed/convert_dpcm/data_write/agb_out) et les overrides CLI
 * (--loop-start/--tune/…, jamais passés par le build) ne sont pas portés.
 *
 * Usage module : const { convert } = require('./wav2agb.cjs');
 *   convert(wavPath, { compress: true, lookahead: 1, noPad: true }) → Buffer
 */
'use strict';
const fs = require('fs');

// ============================ wav_file.cpp ============================

const WAV_INVALID_VAL = 0xFFFFFFFF;
const loadChunkSize = 2048;

const format_type = { u8: 0, s16: 1, s24: 2, s32: 3, f32: 4, f64: 5 };
const FMT_SIZE = [1, 2, 3, 4, 4, 8];

class wav_file {
  constructor(path) {
    const buf = fs.readFileSync(path);
    this.buf = buf;
    this.loadedChunk = WAV_INVALID_VAL;
    this.loadBuffer = new Float64Array(loadChunkSize);

    this.loopStart = 0; // samples
    this.loopEnd = 0xFFFFFFFF; // samples
    this.loopEnabled = false;
    this.tuning = 0.0; // cents
    this.midiKey = 60;
    this.sampleRate = 0;
    this.numSamples = 0;
    this.agbPitch = 0; // chunk 'agbp' (0 = absent)
    this.agbLoopEnd = 0; // chunk 'agbl' (0 = absent)

    const len = buf.length;
    if (buf.toString('latin1', 0, 4) !== 'RIFF') throw new Error('RIFF ID invalid');
    const mainChunkLen = buf.readUInt32LE(4);
    if (mainChunkLen + 8 !== len)
      throw new Error(`RIFF chunk len (=${mainChunkLen}) doesn't match file len (=${len})`);
    if (buf.toString('latin1', 8, 12) !== 'WAVE') throw new Error('WAVE ID invalid');

    let dataChunkFound = false;
    let fmtChunkFound = false;
    let pos = 12;
    while (pos + 8 <= len) {
      const chunkId = buf.toString('latin1', pos, pos + 4);
      const chunkLen = buf.readUInt32LE(pos + 4);
      if (pos + 8 + chunkLen > len)
        throw new Error(`ERROR: chunk goes beyond end of file: offset=${pos}`);

      const chunkData = buf.subarray(pos + 8, pos + 8 + chunkLen);

      if (chunkId === 'fmt ') {
        fmtChunkFound = true;
        const fmtTag = chunkData.readUInt16LE(0);
        const numChannels = chunkData.readUInt16LE(2);
        if (numChannels !== 1) throw new Error('ERROR: input file is NOT mono');
        this.sampleRate = chunkData.readUInt32LE(4);
        const block_align = chunkData.readUInt16LE(12);
        const bits_per_sample = chunkData.readUInt16LE(14);
        if (fmtTag === 1) {
          if (block_align === 1 && bits_per_sample === 8) this.fmt = format_type.u8;
          else if (block_align === 2 && bits_per_sample === 16) this.fmt = format_type.s16;
          else if (block_align === 3 && bits_per_sample === 24) this.fmt = format_type.s24;
          else if (block_align === 4 && bits_per_sample === 32) this.fmt = format_type.s32;
          else throw new Error('ERROR: unsupported integer format combination');
        } else if (fmtTag === 3) {
          if (block_align === 4 && bits_per_sample === 32) this.fmt = format_type.f32;
          else if (block_align === 8 && bits_per_sample === 64) this.fmt = format_type.f64;
          else throw new Error('ERROR: unsupported float format combination');
        } else {
          throw new Error(`ERROR: unsupported format code: ${fmtTag}`);
        }
      } else if (chunkId === 'data') {
        dataChunkFound = true;
        this.dataChunkPos = pos + 8;
        this.dataChunkEndPos = this.dataChunkPos + chunkLen;
      } else if (chunkId === 'smpl') {
        const midiUnityNote = chunkData.readUInt32LE(12);
        this.midiKey = Math.min(midiUnityNote, 127);
        const midiPitchFraction = chunkData.readUInt32LE(16);
        // the values below convert the uint32_t range to 0.0 to 100.0 range
        this.tuning = midiPitchFraction / (4294967296.0 * 100.0);
        const numLoops = chunkData.readUInt32LE(28);
        if (numLoops > 1) throw new Error('ERROR: too many loops in smpl chunk');
        if (numLoops === 1) {
          const loopType = chunkData.readUInt32LE(36 + 4);
          if (loopType !== 0) throw new Error(`ERROR: loop type not supported: ${loopType}`);
          this.loopStart = chunkData.readUInt32LE(36 + 8);
          // sampler chunks tell the last sample to be played (so including rather than excluding), thus +1
          this.loopEnd = chunkData.readUInt32LE(36 + 12) + 1;
          this.loopEnabled = true;
        }
      } else if (chunkId === 'agbp') {
        // Custom chunk: exact GBA pitch value (sample_rate * 1024)
        if (chunkLen >= 4) this.agbPitch = chunkData.readUInt32LE(0);
      } else if (chunkId === 'agbl') {
        // Custom chunk: exact loop end override (handles off-by-one from original game)
        if (chunkLen >= 4) this.agbLoopEnd = chunkData.readUInt32LE(0);
      }

      pos += 8 + chunkLen;
      // If chunk size is odd, skip the pad byte
      if ((chunkLen % 2) === 1) pos++;
    }

    if (!fmtChunkFound) throw new Error('ERROR: fmt chunk not found');
    if (!dataChunkFound) throw new Error('ERROR: data chunk not found');

    this.numSamples = Math.trunc((this.dataChunkEndPos - this.dataChunkPos) / FMT_SIZE[this.fmt]);
    this.loopEnd = Math.min(this.loopEnd, this.numSamples);
  }

  fmt_size() { return FMT_SIZE[this.fmt]; }

  readData(location, data, dataOff, len) {
    while (len-- > 0) {
      if (this.loadedChunk !== location - (location % loadChunkSize)) {
        this.loadedChunk = location - (location % loadChunkSize);

        const blockpos = this.dataChunkPos + this.loadedChunk * this.fmt_size();
        const endblockpos = this.dataChunkEndPos;
        const actualChunkSize = Math.min(loadChunkSize,
          Math.trunc(Math.max(0, endblockpos - blockpos) / this.fmt_size()));

        if (actualChunkSize === 0) {
          this.loadBuffer.fill(0.0);
        } else {
          const ld = this.buf.subarray(blockpos, blockpos + actualChunkSize * this.fmt_size());
          const fs_ = this.fmt_size();
          if (this.fmt === format_type.u8) {
            for (let i = 0; i < actualChunkSize; i++)
              this.loadBuffer[i] = (ld[i] - 128.0) / 128.0;
          } else if (this.fmt === format_type.s16) {
            for (let i = 0; i < actualChunkSize; i++)
              this.loadBuffer[i] = ld.readInt16LE(i * fs_) / 32768.0;
          } else if (this.fmt === format_type.s24) {
            for (let i = 0; i < actualChunkSize; i++) {
              let s = ld[i * fs_] | (ld[i * fs_ + 1] << 8) | (ld[i * fs_ + 2] << 16);
              s = (s << 8) >> 8;
              this.loadBuffer[i] = s / 8388608.0;
            }
          } else if (this.fmt === format_type.s32) {
            for (let i = 0; i < actualChunkSize; i++)
              this.loadBuffer[i] = ld.readInt32LE(i * fs_) / 2147483648.0;
          } else if (this.fmt === format_type.f32) {
            for (let i = 0; i < actualChunkSize; i++)
              this.loadBuffer[i] = ld.readFloatLE(i * fs_);
          } else if (this.fmt === format_type.f64) {
            for (let i = 0; i < actualChunkSize; i++)
              this.loadBuffer[i] = ld.readDoubleLE(i * fs_);
          }
          for (let i = actualChunkSize; i < loadChunkSize; i++) this.loadBuffer[i] = 0.0;
        }
      }
      data[dataOff++] = this.loadBuffer[location % loadChunkSize];
      location++;
    }
  }
}

// ============================ converter.cpp ============================

function clamp(v, lo, hi) { return v < lo ? lo : hi < v ? hi : v; }
function squared(x) { return x * x; }

const DPCM_BLK_SIZE = 0x40;
const dpcmLookupTable = [0, 1, 4, 9, 16, 25, 36, 49, -64, -49, -36, -25, -16, -9, -4, -1];
const dpcmIndexTable = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

let dpcm_include_padding = true;
let dpcm_enc_lookahead = 3;

function convert_uncompressed_bin(wf, data) {
  const ds = new Float64Array(1);
  for (let i = 0; i < wf.loopEnd; i++) {
    wf.readData(i, ds, 0, 1);
    // TODO apply dither noise
    const s = clamp(Math.floor(ds[0] * 128.0), -128, 127);
    data.push(s & 0xFF);
  }

  // Align to 4 bytes.
  while (data.length % 4 !== 0) data.push(0);
}

// Retourne {minimumError, minimumErrorIndex}.
function dpcm_lookahead(sampleBuf, bufOff, lookahead, prevLevel) {
  if (lookahead === 0) return { minimumError: 0, minimumErrorIndex: 0 };

  let minimumError = 0x7FFFFFFF;
  let minimumErrorIndex = dpcmLookupTable.length;
  const s = clamp(Math.floor(sampleBuf[bufOff] * 128.0), -128, 127);

  for (const i of dpcmIndexTable) {
    const newLevel = prevLevel + dpcmLookupTable[i];

    // TODO apply dither noise
    const errorEstimation = squared(s - newLevel);
    if (errorEstimation >= minimumError) continue;

    const rec = dpcm_lookahead(sampleBuf, bufOff + 1, lookahead - 1, newLevel);

    // TODO weigh the error squared
    const error = squared(s - newLevel) + rec.minimumError;
    if (error < minimumError) {
      if (newLevel <= 127 && newLevel >= -128) {
        minimumError = error;
        minimumErrorIndex = i;
      }
    }
  }

  return { minimumError, minimumErrorIndex };
}

function convert_dpcm_impl(wf, writeInitialSample, writeCompressedData) {
  for (let i = 0; i < wf.loopEnd; i += DPCM_BLK_SIZE) {
    const ds = new Float64Array(DPCM_BLK_SIZE);
    const samples_in_block = Math.min(DPCM_BLK_SIZE, wf.loopEnd - i);
    wf.readData(i, ds, 0, samples_in_block);
    // Pad remaining samples in block with zeros if needed
    for (let j = samples_in_block; j < DPCM_BLK_SIZE; j++) ds[j] = 0.0;

    // TODO apply dither noise
    let s = clamp(Math.floor(ds[0] * 128.0), -128, 127);

    writeInitialSample(s);

    let innerLoopCount = 1;
    const samples_to_process = dpcm_include_padding ? DPCM_BLK_SIZE : samples_in_block;
    let outData = 0;
    let sampleBufReadLen;

    // do { … initial_loop_enter: … } while — le goto saute la moitié haute
    // au premier tour (le 1er octet compressé ne porte qu'un nibble bas).
    let enterAtLow = true;
    for (;;) {
      if (!enterAtLow) {
        if (innerLoopCount >= samples_to_process) break;
        sampleBufReadLen = Math.min(dpcm_enc_lookahead, DPCM_BLK_SIZE - innerLoopCount);
        const r = dpcm_lookahead(ds, innerLoopCount, sampleBufReadLen, s);
        outData = (r.minimumErrorIndex & 0xF) << 4;
        s += dpcmLookupTable[r.minimumErrorIndex];
        innerLoopCount += 1;
      }
      enterAtLow = false;
      if (innerLoopCount >= samples_to_process) break;
      sampleBufReadLen = Math.min(dpcm_enc_lookahead, DPCM_BLK_SIZE - innerLoopCount);
      const r = dpcm_lookahead(ds, innerLoopCount, sampleBufReadLen, s);
      outData |= r.minimumErrorIndex & 0xF;
      s += dpcmLookupTable[r.minimumErrorIndex];
      innerLoopCount += 1;
      writeCompressedData(outData);
      if (!(innerLoopCount < DPCM_BLK_SIZE)) break;
    }
  }
}

function convert_dpcm_bin(wf, data) {
  convert_dpcm_impl(wf,
    (s) => data.push(s & 0xFF),
    (outData) => data.push(outData & 0xFF));
}

/**
 * convert() (mode binaire) : .wav → Buffer .bin AGB.
 * opts : { compress?: boolean, lookahead?: number, noPad?: boolean }
 */
function convert(wav_file_str, opts = {}) {
  dpcm_include_padding = !opts.noPad;
  dpcm_enc_lookahead = clamp(opts.lookahead ?? 3, 1, 8);

  const wf = new wav_file(wav_file_str);

  const fmt = opts.compress ? 1 : 0;

  let pitch;
  if (wf.midiKey === 60 && wf.tuning === 0.0) {
    pitch = wf.sampleRate;
  } else {
    pitch = wf.sampleRate * Math.pow(2.0, (60.0 - wf.midiKey) / 12.0 + wf.tuning / 1200.0);
  }

  let pitch_value;
  if (wf.agbPitch !== 0) pitch_value = wf.agbPitch;
  else pitch_value = Math.trunc(pitch * 1024.0) >>> 0;

  let loop_end = wf.loopEnd;
  if (wf.agbLoopEnd !== 0) loop_end = wf.agbLoopEnd;

  const bin_data = [];

  // Write header (16 bytes)
  // Bytes 0-3: flags (format in bit 0, loop in bit 30)
  let flags = fmt;
  if (wf.loopEnabled) flags |= 0x40000000;
  pushU32LE(bin_data, flags >>> 0);
  pushU32LE(bin_data, pitch_value);
  pushU32LE(bin_data, wf.loopStart);
  pushU32LE(bin_data, loop_end);

  if (!opts.compress) convert_uncompressed_bin(wf, bin_data);
  else convert_dpcm_bin(wf, bin_data);

  return Buffer.from(bin_data);
}

function pushU32LE(data, value) {
  data.push(value & 0xFF, (value >>> 8) & 0xFF, (value >>> 16) & 0xFF, (value >>> 24) & 0xFF);
}

module.exports = { convert, wav_file };
