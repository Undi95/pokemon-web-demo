# M4A Audio Engine — Bit-Exact Specification (from pokeemerald decomp)

Source files audited (English original confirmed identical to FR fork):
- `pokeemerald-master/include/gba/m4a_internal.h`
- `pokeemerald-master/src/m4a.c`
- `pokeemerald-master/src/m4a_1.s` (~1900 lines, ARM/Thumb)
- `pokeemerald-master/src/m4a_tables.c`
- `pokeemerald-master/asm/macros/music_voice.inc`

Goal: re-implement in JS with sample-exact GBA hardware output.

This is NOT documentation of the MIDI sequencer (handled separately) — only the per-frame mixing core (`SoundMain`/`SoundMainRAM`), the PSG state machine (`CgbSound`), the pitch math (`MidiKeyToFreq`/`MidiKeyToCgbFreq`), the note trigger (`ply_note`/`ChnVolSetAsm`), the volume update (`TrkVolPitSet`), and the static lookup tables.

---

## 0. Hardware constants

### 0.1 Frame rate / mix rate

`SampleFreqSet(SOUND_MODE_FREQ_xxxx)` (`m4a.c:400`) sets:
- `pcmSamplesPerVBlank = gPcmSamplesPerVBlankTable[freq - 1]` (per-VBlank sample count)
- `pcmFreq = (597275 * pcmSamplesPerVBlank + 5000) / 10000` (LCD = 59.7275 Hz)
- `divFreq = (16777216 / pcmFreq + 1) >> 1` (CPU 16.78 MHz / pcmFreq, rounded)

`gPcmSamplesPerVBlankTable` (`m4a_tables.c:102`):
```
[96, 132, 176, 224, 264, 304, 352, 448, 528, 608, 672, 704]
```

Pokemon Emerald init = `SOUND_MODE_FREQ_13379` (= index 4). `pcmSamplesPerVBlank = 264`. `pcmFreq = 15768.07 ≈ 15768 Hz`. `divFreq = 532` (this is the "samples per CPU cycle" reciprocal used by `MidiKeyToFreq`).

**Buffer size:** `PCM_DMA_BUF_SIZE = 1584`. Buffer is double — one half right (FIFO_A), one half left (FIFO_B), each 1584 bytes of `s8` PCM.

### 0.2 Master volume / max channels

`m4aSoundMode(SOUND_MODE_DA_BIT_8 | SOUND_MODE_FREQ_13379 | (12 << SOUND_MODE_MASVOL_SHIFT) | (5 << SOUND_MODE_MAXCHN_SHIFT))`:
- `masterVolume = 12` (range 0..15)
- `maxChans = 5` (number of DirectSound channels actually mixed; struct holds 12)

---

## 1. Static tables (`m4a_tables.c`)

### 1.1 `gFreqTable[12]` — pitch base for DirectSound (`m4a_tables.c:86`)

```
2147483648  2275179671  2410468894  2553802834
2705659852  2866546760  3037000500  3217589947
3408917802  3611622603  3826380858  4053909305
```

These are u32 fixed-point ratios. Each entry corresponds to one of the 12 semitones of an octave at the **highest** octave; `MidiKeyToFreq` shifts right to descend octaves.

### 1.2 `gScaleTable[180]` — DS key→(octave_shift, semitone) (`m4a_tables.c:67`)

```
0xE0..0xEB  0xD0..0xDB  0xC0..0xCB  0xB0..0xBB  0xA0..0xAB
0x90..0x9B  0x80..0x8B  0x70..0x7B  0x60..0x6B  0x50..0x5B
0x40..0x4B  0x30..0x3B  0x20..0x2B  0x10..0x1B  0x00..0x0B
```

Per-byte format: low nibble = semitone index into `gFreqTable`, high nibble = right-shift count for octave. Key 0 → 0xE0 → shift 14 (= very low pitch). Key 179 → 0x0B → shift 0 (= highest).

### 1.3 `gCgbScaleTable[132]` (`m4a_tables.c:118`)

Same layout as `gScaleTable` but for PSG. Format: `(shift << 4) | semitone`. Indexed by `key - 36`. Range covered: keys 36..167 (mapped to indices 0..131). `gCgbFreqTable[12]`:

```
-2004 -1891 -1785 -1685 -1591 -1501 -1417 -1337 -1262 -1192 -1125 -1062
```

(GBA hardware: NR13/NR14 freq value is `2048 + gCgbFreqTable[i] >> shift` — confirmed by `+ 2048` in `MidiKeyToCgbFreq`.)

### 1.4 `gNoiseTable[60]` — noise NR43 byte per key (`m4a_tables.c:149`)

Contains 60 entries indexed by `key - 21`, clamped 0..59. Each byte is the literal NR43 register value.

### 1.5 `gCgb3Vol[16]` — wave channel NR32 mapping (`m4a.c:4` extern)

```
0x00 0x00  0x60 0x60 0x60 0x60  0x40 0x40 0x40 0x40
0x80 0x80 0x80 0x80  0x20 0x20
```

Indexed by `envelopeVolume` (0..15). Per GBA spec NR32 bits 6-5: 00=mute, 01=100%, 10=50%, 11=25%. So map: 0..1→mute, 2..5→25%(`0x60`), 6..9→50%(`0x40`), 10..13→100%(`0x80`), 14..15→shift-by-4 mode (`0x20`, "75%").

### 1.6 `gClockTable[49]` — note-length lookup (`m4a_tables.c:177`)

Note-event length byte 0..0x18 → 0..0x18 linear; 0x19..0x30 → custom rounded values (1C, 1E, 20, 24, 28...). Used by `ply_note` first instruction: `gateTime = gClockTable[note_cmd]`.

---

## 2. Pitch math

### 2.1 `MidiKeyToFreq(wav, key, fineAdjust)` (`m4a.c:23`)

```
Inputs:
  wav: WaveData* (uses wav->freq, a u32 = sampleRate * 1024 (= 22.10 fixed))
  key: u8 final MIDI key (already keyshifted, range expected 0..178)
  fineAdjust: u8 fractional cents 0..255

Algorithm:
  fineAdjustShifted = fineAdjust << 24       // u32, =fineAdjust * 16777216
  if (key > 178) {
      key = 178
      fineAdjustShifted = 0xFF000000
  }
  raw1 = gScaleTable[key]                    // u8
  val1 = gFreqTable[raw1 & 0x0F] >> (raw1 >> 4)   // u32
  raw2 = gScaleTable[key + 1]
  val2 = gFreqTable[raw2 & 0x0F] >> (raw2 >> 4)
  // Linear interpolation in u32 space, then *= wav.freq, take high 32 bits:
  delta = umul3232H32(val2 - val1, fineAdjustShifted)   // (u64)(val2-val1) * fineAdjustShifted >> 32
  pitch = val1 + delta
  return umul3232H32(wav.freq, pitch)        // = (u64)wav.freq * pitch >> 32

Output: u32 used as channel->frequency.
       After mul by divFreq in SoundMainRAM: gives u32 phase increment per output sample,
       Q9.23 fixed point. (lr asr 23 in inner loop = sample step; low 23 bits = fractional.)
```

`umul3232H32(a,b) = (u32)((u64)a * (u64)b >> 32)`. Source: `m4a_1.s:9-18` ARM `umull` then return high half.

**Tricky:** `wav->freq` field is `sampleRate * 1024 / pcmFreq * (something)`. Actually pre-baked at sample export time as `originalSampleRate * (2^32 / pcmFreq) / 4`. The TS extractor will read `wav->freq` directly from binary — DO NOT recompute it.

### 2.2 `MidiKeyToCgbFreq(chanNum, key, fineAdjust)` (`m4a.c:810`)

```
if (chanNum == 4) {        // noise
    if (key <= 20) key = 0
    else { key -= 21; if (key > 59) key = 59 }
    return gNoiseTable[key]    // direct NR43 byte
}
// chanNum 1, 2, 3 (square, square, wave):
if (key <= 35) { fineAdjust = 0; key = 0 }
else { key -= 36; if (key > 130) { key = 130; fineAdjust = 255 } }
raw1 = gCgbScaleTable[key]
val1 = (s32)gCgbFreqTable[raw1 & 0x0F] >> (raw1 >> 4)   // ARITHMETIC right shift (signed)
raw2 = gCgbScaleTable[key + 1]
val2 = (s32)gCgbFreqTable[raw2 & 0x0F] >> (raw2 >> 4)
return val1 + ((fineAdjust * (val2 - val1)) >> 8) + 2048
```

**Hardware:** the `+ 2048` complement gives the 11-bit NR13/NR14 value. Audible frequency is `131072 / (2048 - regVal)` for square channels, `65536 / (2048 - regVal)` for wave channel.

---

## 3. Note triggering — `ply_note` (`m4a_1.s:1538`)

Called by sequencer when it encounters a note event. Signature: `ply_note(u32 note_cmd, MusicPlayerInfo*, MusicPlayerTrack*)`.

### 3.1 Algorithm

```
gateTime = gClockTable[note_cmd]             // initial duration from cmd byte (0x00..0x30)
b = *cmdPtr
if (b < 0x80) {                              // optional key byte
    track->key = b
    cmdPtr++
    b = *cmdPtr
    if (b < 0x80) {                          // optional velocity byte
        track->velocity = b
        cmdPtr++
        b = *cmdPtr
        if (b < 0x80) {                      // optional gate-time extension byte
            gateTime += b
            track->gateTime = gateTime
            cmdPtr++
        }
    }
}
// Resolve voice (handle keysplit/rhythm)
tone = &track->tone                          // base voice (8 bytes)
key = track->key
rhythmPan = 0
if (tone->type & (TONEDATA_TYPE_RHY | TONEDATA_TYPE_SPL)) {
    if (tone->type & TONEDATA_TYPE_SPL) {
        // keysplit: lookup table maps key -> sub-voice index
        idx = tone->keySplitTable[key]
    } else {
        idx = key                            // rhythm: index by key directly
    }
    subVoice = (ToneData*)((u8*)tone->wav + idx * 12)   // each sub-tone is 12 bytes
    if (subVoice->type & (TONEDATA_TYPE_SPL | TONEDATA_TYPE_RHY)) goto abort  // no nested split
    if (tone->type & TONEDATA_TYPE_RHY) {
        ps = subVoice->pan_sweep
        if (ps & 0x80) rhythmPan = (ps - 0xC0) << 1   // -64..62 panning
    }
    activeVoice = subVoice
    activeKey = subVoice->key                // rhythm/split overrides key
} else {
    activeVoice = tone
    activeKey = key
}

priority = clamp(track->priority + mplayInfo->priority, 0..255)
isCgb = activeVoice->type & TONEDATA_TYPE_CGB        // = 0x07; zero for DS

// Channel allocation
if (isCgb) {
    chanNum = isCgb                          // = 1, 2, 3, or 4 (the type IS the chan number)
    chan = &soundInfo->cgbChans[chanNum - 1]
    // Steal only if free, or stopping, or lower priority, or same prio + younger track
    if ((chan->statusFlags & ON) && !(chan->statusFlags & STOP) &&
        (chan->priority > priority ||
         (chan->priority == priority && chan->track <= track))) abort
} else {
    // DS: scan maxChans entries, pick lowest priority slot
    bestSlot = NULL
    for (i = 0; i < maxChans; i++) {
        chan = &soundInfo->chans[i]
        if (!(chan->statusFlags & ON)) { bestSlot = chan; break }
        if (chan->statusFlags & STOP) {
            if (bestSlot is "active" so far) continue
            // first STOP candidate
        }
        // tie-break by priority asc, then track addr asc
        ...
    }
    if (!bestSlot) abort
    chan = bestSlot
}

// Initialize channel
ClearChain(chan)
chan->prevChannelPointer = NULL
chan->nextChannelPointer = track->chan
if (track->chan) track->chan->prevChannelPointer = chan
track->chan = chan
chan->track = track

// Reset modulation if needed
track->lfoDelayC = track->lfoDelay
if (track->lfoDelay) clear_modM(track)

TrkVolPitSet(mplayInfo, track)               // recalc volMR/volML and keyM/pitM

// Copy voice → channel
chan->gateTime = track->gateTime
chan->priority = priority
chan->key = activeKey
chan->rhythmPan = rhythmPan
chan->type = activeVoice->type
chan->wav = activeVoice->wav                 // raw u32 word at offset 4
*(u32*)&chan->attack = *(u32*)&activeVoice->attack   // copies attack/decay/sustain/release
chan->pseudoEchoVolume = track->pseudoEchoVolume
chan->pseudoEchoLength = track->pseudoEchoLength

ChnVolSetAsm(chan, track)                    // compute right/leftVolume from velocity*pan*track-vol

finalKey = chan->key + track->keyM           // signed add; if negative → 0
if (finalKey < 0) finalKey = 0
fineAdjust = track->pitM                     // u8

if (isCgb) {
    chan->length = activeVoice->length       // CGB note length (bit 6 of NR{1..4}1)
    sweep = activeVoice->pan_sweep
    if (!(sweep & 0x80) && (sweep & 0x70))   // valid sweep value, not a pan
        chan->sweep = sweep
    else
        chan->sweep = 0x08                   // default = no sweep
    chan->frequency = MidiKeyToCgbFreq(chanNum, finalKey, fineAdjust)
} else {
    chan->count = track->unk_3C              // sample-start offset (xcmd 0x0D)
    chan->frequency = MidiKeyToFreq(activeVoice->wav, finalKey, fineAdjust)
}
chan->statusFlags = SOUND_CHANNEL_SF_START   // = 0x80, will be processed next frame
track->flags &= 0xF0                          // clear lower nibble (volset/pitset/start flags)
```

### 3.2 `ChnVolSetAsm(chan, track)` (`m4a_1.s:1509`)

```
velocity   = chan->velocity                  // 0..127
rhythmPan  = (s8)chan->rhythmPan             // -128..127
volMR      = track->volMR                    // 0..127 (computed by TrkVolPitSet)
volML      = track->volML

right = ((128 + rhythmPan) * velocity * volMR) >> 14   // signed mul cascades
if (right > 255) right = 255
chan->rightVolume = right

left  = ((127 - rhythmPan) * velocity * volML) >> 14
if (left  > 255) left  = 255
chan->leftVolume = left
```

Note: shift is **logical right by 14** (`asrs r0, 14`). Practically equivalent since values are non-negative.

### 3.3 `TrkVolPitSet(mplayInfo, track)` (`m4a.c:765`)

Called from `ply_note` and during sequencer command processing.

```
if (track->flags & MPT_FLG_VOLSET) {
    x = (track->vol * track->volX) >> 5             // master vol scale, range 0..512
    if (track->modT == 1) x = (x * (track->modM + 128)) >> 7   // LFO volume mod
    y = 2 * track->pan + track->panX                // pan offset
    if (track->modT == 2) y += track->modM          // LFO pan mod
    y = clamp(y, -128, 127)
    track->volMR = ((y + 128) * x) >> 8            // 0..127 typical
    track->volML = ((127 -  y) * x) >> 8
}
if (track->flags & MPT_FLG_PITSET) {
    bend = track->bend * track->bendRange          // s16 ranges
    x = (track->tune + bend) * 4
      + (track->keyShift << 8)
      + (track->keyShiftX << 8)
      + track->pitX                                // s32
    if (track->modT == 0) x += 16 * track->modM    // LFO pitch mod
    track->keyM = x >> 8                           // signed shift
    track->pitM = x                                // truncated low 8 bits
}
track->flags &= ~(MPT_FLG_PITSET | MPT_FLG_VOLSET)
```

---

## 4. DirectSound mixing — `SoundMain`/`SoundMainRAM` (`m4a_1.s:20-466`)

Called once per V-Blank (~59.7275 Hz). Renders one buffer block of `pcmSamplesPerVBlank / pcmDmaPeriod` samples into `pcmBuffer[pcmDmaCounter * 528 ...]` (with `pcmDmaPeriod = 6` and `samplesPerVBlank = 264`, that's 264/6 = 44 samples per VBlank chunk; but actual write is `pcmSamplesPerVBlank` per VBlank when counter wraps). The buffer holds samples for FIFO_A (right) at offset 0 and FIFO_B (left) at offset `PCM_DMA_BUF_SIZE = 1584`.

### 4.1 Buffer clear / reverb (`m4a_1.s:88-145`)

If `reverb` is non-zero, each output sample is computed as:
```
mix = pcmBuffer[i] + pcmBuffer[i + 1584] + pcmBuffer[i + 1] + pcmBuffer[i + 1585]
out = (mix * reverb) >> 9
if (out & 0x80) out += 1                     // round half-up
pcmBuffer[i] = pcmBuffer[i + 1584] = out
```
Effectively a 4-tap pre-existing-content average scaled by `reverb / 512`. If reverb is 0, both halves of the buffer are filled with zeros (first loop, lines 121-145).

### 4.2 Per-channel envelope update (`m4a_1.s:177-262`)

Called once per VBlank per channel BEFORE mixing. Operates on `chan->envelopeVolume` (0..255 multiplicative envelope).

```
sf = chan->statusFlags
env = chan->envelopeVolume

if (sf & SOUND_CHANNEL_SF_START) {           // 0x80, first frame
    if (sf & SOUND_CHANNEL_SF_STOP) {        // 0x40, "kill immediately"
        chan->statusFlags = 0; goto skip_channel
    }
    // Initial trigger:
    chan->statusFlags = SF_ENV_ATTACK         // = 3, "in attack phase"
    chan->currentPointer = chan->wav->data + chan->count
    chan->count = chan->wav->size - chan->count
    env = 0
    chan->fw = 0                              // fractional position accumulator
    if (chan->wav->status & WAVE_DATA_FLAG_LOOP) sf |= SF_LOOP, write back
    goto envelope_attack_step
}

// SF_START not set:
if (sf & SF_IEC) {                            // 0x04, in pseudo-echo phase
    chan->pseudoEchoLength--
    if ((s8)chan->pseudoEchoLength <= 0) {    // signed compare
        chan->statusFlags = 0; goto skip_channel
    }
    goto post_envelope                        // env stays put during echo
}

if (sf & SF_STOP) {                           // 0x40, release requested
    env = (env * chan->release) >> 8
    if (env > chan->pseudoEchoVolume) goto post_envelope  // still releasing
    // Drop into echo or stop:
    if (chan->pseudoEchoVolume == 0) { chan->statusFlags = 0; goto skip_channel }
    env = chan->pseudoEchoVolume
    chan->statusFlags = sf | SF_IEC
    goto post_envelope
}

state = sf & SF_ENV                          // 0..3

if (state == SF_ENV_DECAY) {                  // 2
    env = (env * chan->decay) >> 8
    if (env <= chan->sustain) {
        env = chan->sustain
        if (env == 0) {                       // sustain-hits-0 special path
            // Same as release-completes path:
            if (chan->pseudoEchoVolume == 0) { chan->statusFlags = 0; goto skip_channel }
            env = chan->pseudoEchoVolume
            chan->statusFlags = sf | SF_IEC
            goto post_envelope
        }
        sf--                                  // → SF_ENV_SUSTAIN
        chan->statusFlags = sf
        goto post_envelope
    }
} else if (state == SF_ENV_ATTACK) {          // 3
    envelope_attack_step:
    env += chan->attack
    if (env >= 0xFF) {
        env = 0xFF
        sf--                                  // → SF_ENV_DECAY
        chan->statusFlags = sf
    }
}
// state == SF_ENV_SUSTAIN (1): env unchanged
// state == SF_ENV_RELEASE (0): only reachable via SF_STOP path above

post_envelope:
chan->envelopeVolume = env

// Final per-side scaled envelope (fade-out applied via release+1 trick):
masvol_plus_1 = soundInfo->masterVolume + 1   // SoundInfo is read at sp+0x18; here it
                                              //   actually loads from offset
                                              //   o_SoundChannel_release in the OUTER
                                              //   SoundInfo struct = SoundInfo.masterVolume.
                                              //   (Yes, same structure offset by coincidence.)
scaledEnv = (env * masvol_plus_1) >> 4        // 0..240 typically
chan->envelopeVolumeRight = (chan->rightVolume * scaledEnv) >> 8
chan->envelopeVolumeLeft  = (chan->leftVolume  * scaledEnv) >> 8
```

**CRITICAL FORMULA** (from `m4a_1.s:265-277`):
```
envR = (rightVolume * ((env * (masterVolume + 1)) >> 4)) >> 8
envL = (leftVolume  * ((env * (masterVolume + 1)) >> 4)) >> 8
```
This is the per-side mix gain used by the inner loop. With `masterVolume=12`, `env=255`, `rightVolume=255` → `(255 * 13) >> 4 = 207`; `(255 * 207) >> 8 = 206`.

### 4.3 Sample mixing inner loop (`m4a_1.s:295-444`)

ARM mode (32-bit). Three modes selected by `chan->type`:

**Mode A — `type & TONEDATA_TYPE_CMP/REV` (compressed/reverse):** dispatched to `SoundMainRAM_Unk1`, uses delta-encoded ADPCM-like data via `gDeltaEncodingTable[16]` (signed deltas: 0,1,4,9,16,25,36,49,-64,-49,...). 64-byte decoded chunks per 0x21 source bytes. Skip for first pass.

**Mode B — `type & TONEDATA_TYPE_FIX` (8 = "no resample"):** straight 1-sample-per-output mode. Steps source pointer by 1 each output sample, no fractional accumulator, no interpolation. Used for sounds with `wav.freq == output_rate`.

```
loop count: pcmSamplesPerVBlank
src = chan->currentPointer
remain = chan->count
for each output_sample:
    s = (s8)*src++
    out_right += (envR_q16 * s) // discarded high bytes
    out_left  += (envL_q16 * s)
    remain--
    if (remain == 0) {
        if (chan->statusFlags & SF_LOOP) {
            src    = chan->wav->data + chan->wav->loopStart
            remain = chan->wav->size - chan->wav->loopStart
        } else { chan->statusFlags = 0; break }
    }
chan->count = remain
chan->currentPointer = src
```

**Mode C — default (linear interpolation):** the hot path for music samples.

```
freq = chan->frequency           // u32 from MidiKeyToFreq
inc  = divFreq * freq            // u32×u32 → u32 (truncated; ARM mul = low 32 bits)
                                 // = (output_rate << 23) / sampleRate, in Q9.23
acc  = chan->fw                  // u32, fractional position in Q9.23
src  = chan->currentPointer
remain = chan->count
s0 = (s8)src[0]
s1 = (s8)src[1]
diff = s1 - s0                   // s32 (could be negative)
src++

for each output_sample:
    // Linear interp: interp = s0 + (acc * diff) >> 23, signed
    interp = s0 + ((acc * diff) << 0 >> 23)   // ARM:  mul lr,r9,r1; lr asr 23
    // Mix into output buffer. Buffer holds packed 4-byte words = 4 s8 samples
    // rotated by 8 bits each iteration via "ror 8" trick.
    accum_right_word += (envR_q16 * interp) & 0x00FFFFFF
    accum_left_word  += (envL_q16 * interp) & 0x00FFFFFF
    acc += inc
    step = acc >> 23                          // integer step in samples
    acc &= 0x007FFFFF                         // keep 23 fractional bits
    if (step) {
        remain -= step
        if (remain <= 0) {
            // Loop wrap: subtract step until in range
            if (chan->wav->loopable) {
                loopLen = chan->wav->size - chan->wav->loopStart
                while (remain <= 0) remain += loopLen
                src = chan->wav->data + chan->wav->loopStart + (loopLen - remain - 1)
            } else { chan->statusFlags = 0; break }
        }
        src += step - 1
        s0 = (s8)*src++
        s1 = (s8)*src
        diff = s1 - s0
    }
// Save state
chan->fw = acc
chan->count = remain
chan->currentPointer = src
```

**The actual buffer write trick** (`m4a_1.s:328-340` for Mode B, `:407-414` for Mode C):
- `r6` and `r7` are 32-bit accumulators holding 4 packed `s8` output samples.
- Each iteration multiplies `(envR_q16 * interp)` (effectively `envR << 16 * interp`), masks low 24 bits via `bic r12, r12, 0xFF0000`, then `add r6, r12, r6, ror 8`. The `ror 8` rotates the word so each output sample ends up in its own byte.
- Every 4 iterations (`adds r5, r5, 0x40000000` → carry set), the accumulated word is written to memory (`str r7, [r5, PCM_DMA_BUF_SIZE]; str r6, [r5], 0x4`).

For a JS reimplementation, ignore the SIMD trick. Just compute:
```
out_right_buffer[t] += (envR * interp) >> 8     // s8 added to s8 accumulator
out_left_buffer[t]  += (envL * interp) >> 8
```
where buffers are signed accumulators (`s32` or `Float32Array`) before final `s8` clipping. The hardware truncates to `s8` per sample.

**Subtlety on `envR/envL`:** the assembly pre-shifts them left by 16 (`mov r10, r10, lsl 16`), so the multiply result is `envR << 16 * interp` which after `ror 8` extracts byte 1 of the high half. Net effect = `(envR * interp) >> 8` per byte, as documented.

### 4.4 Sample rate

Phase increment: `inc = divFreq * channelFrequency`. With output rate `pcmFreq = 15768` Hz and sample's `wav.freq = sampleRate * 1024`, the channel frequency stored after `MidiKeyToFreq` is approximately `wav.freq / output_rate / 4` (Q22.10 truncated). Multiplied by `divFreq = 532` and added to `fw`, every `1 << 23 = 8388608` units of `fw` advance one source sample. Keep this in Q9.23 in JS.

---

## 5. PSG channels — `CgbSound` (`m4a.c:925`)

Called once per VBlank. Updates the 4 CGB channels' envelope, pitch, and writes to NR registers.

### 5.1 c15 — 64 Hz tick logic (`m4a.c:941-944`)

```
if (soundInfo->c15) soundInfo->c15--
else                soundInfo->c15 = 14
```

`c15` cycles 14→13→...→0→14. `prevC15 = soundInfo->c15` is captured BEFORE the per-channel loop. Inside each channel: after the normal envelope step, if `prevC15 == 0` (= every 15 frames at ~59.73 Hz → 3.98 Hz... no wait), a SECOND envelope step is run. The comment says "every 15 frames, envelope calculation has to be done twice to keep up with the hardware envelope rate (1/64 s)". Math: 60 frames/sec normally, but to hit 64 Hz envelope updates we need an extra step every 15 frames → `60 + 60/15 = 64`.

### 5.2 Per-channel envelope (`m4a.c:946-1230`)

State machine on `chan->statusFlags & 0x03`:
- `3 = ATTACK`: counter-based. `envelopeCounter` decrements each tick. When 0:
  - `envelopeVolume++`. If `envelopeVolume >= envelopeGoal`, transition to DECAY and reset counter to `decay`. If `decay == 0`, jump to sustain start.
  - Else reset counter to `attack`.
- `2 = DECAY`: same counter mechanic.
  - When counter hits 0: `envelopeVolume--`. If `envelopeVolume <= sustainGoal`, transition to SUSTAIN.
  - At SUSTAIN start: if `chan->sustain == 0`, jump immediately to pseudo-echo. Else `statusFlags--` (= 1, SUSTAIN), set `envelopeVolume = sustainGoal`, `envelopeCounter = 7` (= sustain re-eval every 8 ticks).
  - Else reset counter to `decay`.
- `1 = SUSTAIN`: every time counter hits 0, `CgbModVol(chan)` is called (recomputes envGoal based on possibly-changed volume) and envelopeVolume is forced to `sustainGoal`, counter reset to 7.
- `0 = RELEASE`: triggered by SF_STOP transition. Counter-based. When counter hits 0:
  - `envelopeVolume--`. If <= 0, enter pseudo-echo phase: `envelopeVolume = (envelopeGoal * pseudoEchoVolume + 0xFF) >> 8`. If 0, stop the oscillator. Else set `SF_IEC` flag, modify volume.
  - Else reset counter to `release`.

**Special path: attack == 0**
At trigger (`SF_START`), if `attack == 0`: skip the attack phase, go straight to "envelope_decay_start" with `envelopeVolume = envelopeGoal`. `nrx2` gets `decay | DEC` instead of `attack | INC`.

**Special path: decay == 0 from attack peak**
`if (envelopeCounter == 0)` after attack completion → falls through to `envelope_sustain_start`. If `sustain == 0` from there → goes straight to `envelope_pseudoecho_start`, skipping the entire sustain phase.

**Special path: sustain == 0**
Means the note dies at decay-end. `envelope_sustain_start: if (chan->sustain == 0) goto envelope_pseudoecho_start`.

**Pseudo-echo (`SF_IEC`):**
Once activated, channel decrements `pseudoEchoLength` once per CgbSound call. When it reaches 0 (signed compare), oscillator is shut off. During echo, envelope volume is held at `pseudoEchoVolume`-derived level.

### 5.3 `CgbModVol(chan)` (`m4a.c:903`)

Computes `envelopeGoal` and `sustainGoal` from current per-side volumes:

```
soundInfo = SOUND_INFO_PTR
needsHardPan = (!(soundInfo->mode & 1)) && CgbPan(chan)   // see 5.4

if (needsHardPan) {
    chan->envelopeGoal = (leftVolume + rightVolume) / 16
    if (envelopeGoal > 15) envelopeGoal = 15
} else {
    chan->pan = 0xFF                          // no hard pan, both sides
    chan->envelopeGoal = (leftVolume + rightVolume) / 16
    // (no clamp in this branch — implicit because both vols ≤ 127, sum ≤ 254, /16 ≤ 15)
}
chan->sustainGoal = (envelopeGoal * sustain + 15) >> 4    // ceil(g*s/16)
chan->pan &= chan->panMask                    // mask to channel's NR51 bits
```

### 5.4 `CgbPan(chan)` (`m4a.c:878`)

Returns 1 (hard-pan) if one side is at least 2× the other:
```
r = (u8)rightVolume; l = (u8)leftVolume
if (r >= l) {
    if (r / 2 >= l) { chan->pan = 0x0F; return 1 }   // hard right
} else {
    if (l / 2 >= r) { chan->pan = 0xF0; return 1 }   // hard left
}
return 0   // soft pan, fall to envelopeGoal averaging
```

### 5.5 Pitch update (`m4a.c:1184-1203`)

```
if (modify & MO_PIT) {
    if (chanNum < 4 && (chan->type & TONEDATA_TYPE_FIX)) {
        // PWM rate compensation:
        bias = REG_SOUNDBIAS_H
        if (bias < 0x40) chan->frequency = (chan->frequency + 2) & 0x7FC   // 32768 Hz PWM
        else if (bias < 0x80) chan->frequency = (chan->frequency + 1) & 0x7FE   // 65536 Hz
    }
    if (chanNum != 4)
        write nrx3 = chan->frequency & 0xFF
    else
        write nrx3 = (existing_nrx3 & 0x08) | (chan->frequency & 0xFF)   // preserve LFSR-7 bit
    chan->n4 = (chan->n4 & 0xC0) + ((chan->frequency >> 8) & 0xFF)
    write nrx4 = (s8)chan->n4
}
```

For chans 1, 2, 3 (square/wave): `frequency` is the 11-bit value from `MidiKeyToCgbFreq` (range 0..2047, low 8 bits in NR{1,2,3}3, high 3 bits in low 3 bits of NR{1,2,3}4).

For chan 4 (noise): `frequency` is the 8-bit NR43 value from `gNoiseTable`. Bit 3 of NR43 (LFSR-7-bit-mode) is preserved from the existing register.

**LFSR algorithm (GBA hardware spec, not in m4a code):** 15-bit by default. Each clock cycle: `b = LFSR[0] XOR LFSR[1]; LFSR >>= 1; LFSR[14] = b; output = ~LFSR[0]`. If NR43 bit 3 is set, switch to 7-bit mode: same XOR-feed but only 7 bits (`LFSR[6] = b; mask & 0x7F`). Step rate determined by NR43 bits 7-4 (shift) and bits 2-0 (divisor). Hardware spec:
```
divisor = [8, 16, 32, 48, 64, 80, 96, 112][nr43 & 7]
shift = (nr43 >> 4) & 0xF
step_freq_hz = 524288 / divisor / (1 << (shift + 1))
```

### 5.6 Volume / envelope write (`m4a.c:1205-1227`)

```
if (modify & MO_VOL) {
    REG_NR51 = (REG_NR51 & ~chan->panMask) | chan->pan
    if (chanNum == 3) {         // wave channel
        write nrx2 = gCgb3Vol[envelopeVolume]
        if (n4 & 0x80) {
            write nrx0 = 0x80
            write nrx4 = chan->n4
            chan->n4 &= 0x7F
        }
    } else {                    // square/noise: 4-bit envelope written via NRx2
        write nrx2 = (envelopeStepTimeAndDir & 0x0F) | (envelopeVolume << 4)
        write nrx4 = chan->n4 | 0x80    // restart trigger
        if (chanNum == 1 && !(nrx0 & 0x08)) write nrx4 = chan->n4 | 0x80   // duplicate (for sweep direction)
    }
}
```

**`envelopeStepTimeAndDir`**: this is what was loaded into `nrx2` originally (or set during state transitions). On attack: `attack | 0x08` (INC direction). On decay: `decay | 0x00` (DEC direction). On sustain: `0 | 0x08` (length 0 → no envelope sweep, just hold). On release: `release | 0x00` (DEC). On pseudo-echo: `0 | 0x08`.

**Important:** the m4a engine SETS the hardware envelope to its own values then OVERRIDES the volume via `(envelopeVolume << 4)` every frame. The hardware envelope itself runs at 64 Hz internally but m4a effectively pins it by rewriting nrx2 each frame.

### 5.7 Trigger paths (`m4a.c:988-1042`)

On SF_START first frame (without SF_STOP):
- Force `statusFlags = SF_ENV_ATTACK` (= 3, attack state)
- `modify = MO_PIT | MO_VOL`
- Call `CgbModVol(chan)`
- Per-channel hardware setup:
  - Chan 1: `nrx0 = sweep` (NR10), then chan 2 path
  - Chan 2: `nrx1 = (wavePointer << 6) + length` — `wavePointer` here for chan 2 is reused as duty (0..3 → bits 6-7 of NR21)
  - Chan 3 (wave): if `wavePointer != currentPointer`, write `0x40` to NR30 (DAC on, bank 1), copy 16 bytes from `wavePointer` to `WAVE_RAM0..3`, set `currentPointer`. Then NR30 = 0, NR31 = length, n4 = `0xC0` if length else `0x80`.
  - Chan 4 (noise): `nrx1 = length`, `nrx3 = wavePointer << 3` — `wavePointer` here is the noise period mode (0 or 1, → NR43 bit 3 LFSR width)
- For chans 1, 2, 4: set `envelopeStepTimeAndDir = attack | INC`. n4 = `0x40` if length else `0x00`.
- `envelopeCounter = attack`
- If attack != 0: `envelopeVolume = 0` and goto envelope_step_complete (which decrements counter and possibly does the c15 double-step)
- If attack == 0: goto envelope_decay_start (`envelopeVolume = envelopeGoal`, transition to DECAY, set nrx2 to `decay | DEC`)

---

## 6. Voice macro layout (`music_voice.inc`)

8-byte structure for each voice (with type-dependent overlays):

| Offset | DirectSound        | Square 1 (sweep)   | Square 2          | Wave (prog)       | Noise              |
|--------|--------------------|--------------------|--------------------|--------------------|--------------------|
| +0     | type (0/8/16)      | type (1/9)         | type (2/10)        | type (3/11)        | type (4/12)        |
| +1     | base_midi_key      | base_midi_key      | base_midi_key      | base_midi_key      | base_midi_key      |
| +2     | 0                  | 0                  | 0                  | 0                  | 0                  |
| +3     | pan (or pan+0x80)  | pan / sweep        | pan                | pan                | pan                |
| +4-+7  | sample_data_ptr    | duty (b3) at +4    | duty (b3) at +4    | wave_samples_ptr   | period (b3) at +4  |
| +8     | attack             | attack & 0x07      | attack & 0x07      | attack & 0x07      | attack & 0x07      |
| +9     | decay              | decay & 0x07       | decay & 0x07       | decay & 0x07       | decay & 0x07       |
| +10    | sustain            | sustain & 0x0F     | sustain & 0x0F     | sustain & 0x0F     | sustain & 0x0F     |
| +11    | release            | release & 0x07     | release & 0x07     | release & 0x07     | release & 0x07     |

For PSG voices, the field layout is the same `ToneData` struct but reinterpreted: `wav` u32 at offset 4 contains the duty/period in low 8 bits (rest zero).

**Pan byte:** if non-zero in source, written as `0x80 | pan`. The high bit set is the "rhythm pan present" marker; subtract `0xC0` and shift left 1 to get signed pan -64..62.

**Type byte values:**
- 0 = DirectSound (resampled, no fixed-pitch)
- 1 = Square 1 (with sweep, NR10)
- 2 = Square 2 (no sweep)
- 3 = Programmable wave (16-byte sample written to WAVE_RAM)
- 4 = Noise
- 8 = DirectSound | FIX (no resample, native sample rate)
- 9..12 = "alt" variants (same engine handling, used as flags for tools)
- 0x40 = SPL (key-split: lookup table at +8 or in `wav` field)
- 0x80 = RHY (rhythm: index voice array by raw key)
- 0x07 mask = CGB chan number (1, 2, 3, 4)

**Key-split table:** raw bytes indexed by MIDI key (0..127) → sub-voice index. Sub-voices are 12-byte ToneData structs stored at `tone->wav` (reinterpreted).

---

## 7. Putting it together — JS reimplementation outline

```
class M4AEngine {
    sampleRate = 15768                     // pcmFreq from SOUND_MODE_FREQ_13379
    samplesPerVBlank = 264
    masterVolume = 12                      // 0..15
    reverb = 0
    c15 = 0
    dsChans: SoundChannel[12]
    cgbChans: CgbChannel[4]

    // Called every 16.7 ms (1 / 59.7275)
    onVBlank() {
        // 1. MPlayMain ticks (sequencer; out of scope here, but it'll mutate
        //    track flags and call ply_note → fills SoundChannel/CgbChannel structs)

        // 2. CgbSound: update PSG envelopes + write to virtual NR registers
        cgbSound()

        // 3. SoundMain → SoundMainRAM: render `samplesPerVBlank` samples of DS
        renderDirectSoundBuffer()
    }

    cgbSound() {
        if (this.c15) this.c15--; else this.c15 = 14
        for (ch = 1..4) {
            const prevC15 = this.c15
            const chan = this.cgbChans[ch - 1]
            if (!(chan.statusFlags & 0xC7)) continue   // SOUND_CHANNEL_SF_ON
            // ... full state machine from §5.2-5.7 ...
        }
    }

    renderDirectSoundBuffer() {
        const N = this.samplesPerVBlank
        const right = new Int32Array(N), left = new Int32Array(N)
        for (const chan of this.dsChans.slice(0, this.maxChans)) {
            if (!(chan.statusFlags & 0xC7)) continue
            // 1. Update envelope (§4.2)
            updateEnv(chan)
            const masPlus1 = this.masterVolume + 1
            const scaledEnv = (chan.envelopeVolume * masPlus1) >> 4
            const envR = (chan.rightVolume * scaledEnv) >> 8
            const envL = (chan.leftVolume  * scaledEnv) >> 8
            // 2. Mix samples (§4.3 mode C)
            mixChannelLerp(chan, envR, envL, right, left, N)
        }
        // Clip s8 + push to output
        for (let i = 0; i < N; i++) {
            this.outputRight[t++] = Math.max(-128, Math.min(127, right[i] >> 8))   // shift consistent w/ engine
            this.outputLeft[t++]  = Math.max(-128, Math.min(127, left[i]  >> 8))
        }
    }

    mixChannelLerp(chan, envR, envL, R, L, N) {
        const inc = (this.divFreq * chan.frequency) >>> 0    // u32
        let acc = chan.fw
        let src = chan.currentPointer    // index into wav.data
        let remain = chan.count
        let s0 = chan.wav.data[src], s1 = chan.wav.data[src + 1]
        let diff = s1 - s0
        src++
        for (let i = 0; i < N; i++) {
            const interp = s0 + (((acc * diff) | 0) >> 23)
            R[i] += (envR * interp) >> 8
            L[i] += (envL * interp) >> 8
            acc = (acc + inc) >>> 0
            const step = acc >>> 23
            acc &= 0x7FFFFF
            if (step) {
                remain -= step
                if (remain <= 0) {
                    if (chan.statusFlags & 0x10) {           // SF_LOOP
                        const loopLen = chan.wav.size - chan.wav.loopStart
                        while (remain <= 0) remain += loopLen
                        src = chan.wav.loopStart + (loopLen - remain - 1)
                    } else { chan.statusFlags = 0; break }
                }
                src += step - 1
                s0 = chan.wav.data[src]; s1 = chan.wav.data[src + 1]
                diff = s1 - s0
                src++
            }
        }
        chan.fw = acc
        chan.count = remain
        chan.currentPointer = src
    }
}
```

---

## 8. Edge-case checklist for verification

1. **`fineAdjust = 0` and `fineAdjust = 255`** in MidiKeyToFreq: at 255, the interpolation yields almost-but-not-quite the next semitone (off by `(val2-val1)/256`). At 0, exact semitone.
2. **Key 178** in MidiKeyToFreq: clamps to 178 + force `fineAdjustShifted = 0xFF000000`. This means the highest playable pitch is just below the (synthetic) key 179.
3. **Key < 21** for noise: silent (key clamped to 0, `gNoiseTable[0] = 0xD7` = lowest noise frequency).
4. **Key < 36** for square/wave: silent (key clamped to 0, fineAdjust = 0).
5. **Attack = 0**:
   - DirectSound: attack adds 0 to env; env never reaches 0xFF; channel hangs in attack phase forever. Bug? Or expected behavior with note-end via release? In practice, most voices use attack ≥ 1.
   - PSG: explicit fast-path, jumps straight to decay with `envelopeVolume = envelopeGoal`.
6. **Sustain = 0**:
   - DirectSound: env decays multiplicatively; once `env <= sustain (= 0)`, falls into the `pseudoEcho` branch (which behaves like a release-end). If `pseudoEchoVolume == 0`, channel stops. Otherwise enters echo phase.
   - PSG: same logic as sustain-end → goto pseudo-echo.
7. **Release = 0** in DS: `env = (env * 0) >> 8 = 0` immediately on first STOP frame. Channel stops or enters echo on next frame.
8. **Loop wrap mid-step**: when `step > remain`, the `_081DD134/_081DD3B0` loop subtracts `step` and re-adds `loopLen` until in range. JS implementation must handle this even when `step` is much larger than `loopLen` (huge pitch shifts).
9. **`type & TONEDATA_TYPE_FIX` (= 8)**: branch taken at `m4a_1.s:312`; uses Mode B (no resample, no interp). `chan->frequency` is ignored for stepping but still computed — wasteful but harmless.
10. **PWM rate compensation in CgbSound (chan != 4 + FIX)**: rounds `chan->frequency` to nearest 4 (or 2) when DAC bit depth is reduced. Most FR ROMs use `SOUND_MODE_DA_BIT_8` so REG_SOUNDBIAS_H = 0x40 → 65536 Hz PWM → `& 0x7FE` round. For us with 13379 Hz output, this only triggers on FIX-flagged CGB voices, which are extremely rare in Pokemon BGM.
11. **Pseudo-echo length signed compare**: the decrement `pseudoEchoLength--; if ((s8)pseudoEchoLength <= 0)` means values 0x80..0xFF are treated as "already expired" — channel stops immediately.
12. **c15 double-step**: at frames where `prevC15 == 0`, the envelope state machine runs TWICE in CgbSound. This is the ONLY way to hit ~64 Hz envelope rate from 60 fps base. JS impl: capture `prevC15`, if 0 after first step run a second `goto envelope_step_repeat` cycle.
13. **Reverb is content-dependent**: it averages CURRENT buffer state (= last frame's output + this frame's accumulating mix). True ring-buffer behavior. JS must keep buffer between frames.
14. **`statusFlags` bits at trigger**: ply_note sets `chan->statusFlags = 0x80` (SF_START only). The first SoundMainRAM frame transitions it to `0x03` (SF_ENV_ATTACK). The same bit pattern would transition again to `0x02` (DECAY) when env saturates at 0xFF — no race because attack=0 case never sets envelopeVolume to 0xFF in one step (env starts at 0 + attack < 0xFF for any attack < 255).
15. **`unk_3C` (xcmd 0x0D) = sample-start offset** for DS voices. Set via `Pokemon Cry` system to skip into a sample. Goes into `chan->count` as the read offset, then immediately overwritten by `wav.size - count` to be the remaining samples. Read pointer starts at `wav.data + count`.

---

## 9. Fields written to SoundChannel by ply_note (canonical list)

After `ply_note` succeeds:
- `gateTime, priority, key, rhythmPan, type, wav, attack, decay, sustain, release, pseudoEchoVolume, pseudoEchoLength, rightVolume, leftVolume, frequency, count, statusFlags`
- For CGB also: `length, sweep`

NOT written (= preserved or zero from prior `ClearChain` + `Clear64byte`):
- `fw, currentPointer` (set on first SoundMainRAM frame from `wav` + `count`)
- `envelopeVolume`, `envelopeVolumeRight`, `envelopeVolumeLeft` (filled during envelope update)
- `envelopeCounter, envelopeGoal, sustainGoal, modify` (CGB only, computed on first CgbSound)
- `pan, panMask, n4` (CGB; panMask is set once at MPlayExtender, others computed on trigger)

---

## 10. Sample data format

Field layout (`m4a_internal.h:39`):
```
struct WaveData {
    u16 type;          // bit 0: ?; bit 14 (= status & 0x4000): "loop" flag
                       //   actually the loop flag lives in `status` per the asm
    u16 status;        // bit 14: WAVE_DATA_FLAG_LOOP (= 0x4000)
    u32 freq;          // = (sampleRate * 1024) for 22.10 fixed-point used by MidiKeyToFreq
    u32 loopStart;     // sample index where loop begins
    u32 size;          // total sample count
    s8 data[1];        // PCM data (signed bytes), variable length
}
```

(Note: `gba/m4a_internal.h` declares `u16 type; u16 status;` but the asm `WAVE_DATA_FLAG_LOOP` is read from offset `o_WaveData_flags`, which by convention is the second u16 = `status`. So the loop flag is `wav->status & 0x4000`.)

For compressed samples (`type` bit 0 set), data is delta-encoded with `gDeltaEncodingTable`. This route goes through `SoundMainRAM_Unk1`/`Unk2` and decodes 64 samples per 0x21-byte block. Most BGM samples are uncompressed.

---

## END

Coverage: pitch (DS+CGB), envelope (DS+CGB), pseudo-echo, ChnVolSetAsm, TrkVolPitSet, ply_note voice resolution, sample mixing inner loop with linear interp, NR register layout, voice macros, all 6 lookup tables.

NOT covered (out of scope per request): MIDI sequencer (`MPlayMain`), tempo/clock advance, ply_xxx command handlers (except those affecting note triggering), RealClearChain internals.
