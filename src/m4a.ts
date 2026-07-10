/**
 * src/m4a.ts — miroir 1:1 `src/m4a.c` (LOT 1 : tout le .c SAUF ce qui dépend
 * du mixeur PCM ou des tables de données).
 *
 * Transcrit ici : MidiKeyToFreq · MPlayContinue · MPlayFadeOut · m4aMPlayContinue
 * · m4aMPlayFadeOut/Temporarily/FadeIn · m4aMPlayImmInit · MPlayExtender ·
 * ClearChain · Clear64byte · SoundInit · SampleFreqSet · m4aSoundMode ·
 * SoundClear · m4aSoundVSyncOff/On · MPlayOpen · MPlayStart · m4aMPlayStop ·
 * FadeOutBody · TrkVolPitSet · MidiKeyToCgbFreq · CgbOscOff · CgbPan · CgbModVol
 * · CgbSound · m4aMPlayTempo/Volume/Pitch/PanpotControl · ClearModM ·
 * m4aMPlayModDepthSet · m4aMPlayLFOSpeedSet · ply_memacc · ply_xcmd · ply_x* ·
 * DummyFunc · SetPokemonCry* · IsPokemonCryPlaying + les globals COMMON_DATA.
 *
 * LOT 2 (mixeur) : m4aSoundInit · m4aSoundMain (→ SoundMain du .s).
 * LOT DONNÉES (gMPlayTable/gSongTable extraits) : m4aSongNumStart/StartOrChange/
 * StartOrContinue/Stop/Continue · m4aMPlayAllStop · m4aMPlayAllContinue.
 *
 * Adaptations (mêmes que m4a_1.ts) : registres → gSoundIoRam ; « adresses » de
 * données → offsets gSoundMemory ; SoundMainRAM_Buffer (copie du code mixeur en
 * RAM) : N/A. gPokemonCrySongs vit DANS gSoundMemory (zone RAM audio) car la
 * séquence du cri s'exécute dans la structure (voir m4a_internal.ts).
 */

import {
  C_V,
  CGB_NRx2_ENV_DIR_DEC,
  CGB_NRx2_ENV_DIR_INC,
  CgbChannel,
  CRYSONG_OFF_GOTO_TARGET,
  CRYSONG_OFF_LENGTH,
  CRYSONG_OFF_PAN_VALUE,
  CRYSONG_OFF_PART0,
  CRYSONG_OFF_PART0_PTR,
  CRYSONG_OFF_PART1,
  CRYSONG_OFF_PART1_PTR,
  CRYSONG_OFF_PRIORITY,
  CRYSONG_OFF_RELEASE_VALUE,
  CRYSONG_OFF_TIE_KEY_VALUE,
  CRYSONG_OFF_TONE,
  CRYSONG_OFF_TRACK_COUNT,
  CRYSONG_OFF_TUNE_VALUE,
  CRYSONG_OFF_TUNE_VALUE2,
  CRYSONG_OFF_UNK_CMD_0D_PARAM,
  CRYSONG_OFF_VOLUME_VALUE,
  CRYSONG_SIZE,
  CGB_CHANNEL_MO_PIT,
  CGB_CHANNEL_MO_VOL,
  FADE_IN,
  FADE_VOL_SHIFT,
  ID_NUMBER,
  MAX_DIRECTSOUND_CHANNELS,
  MAX_MUSICPLAYER_TRACKS,
  MAX_POKEMON_CRIES,
  MPT_FLG_EXIST,
  MPT_FLG_PITCHG,
  MPT_FLG_PITSET,
  MPT_FLG_START,
  MPT_FLG_VOLCHG,
  MPT_FLG_VOLSET,
  MPlayFunc,
  MusicPlayerInfo,
  MusicPlayerTrack,
  MUSICPLAYER_STATUS_PAUSE,
  MUSICPLAYER_STATUS_TRACK,
  SONG_HEADER_OFF_PART,
  SONG_HEADER_OFF_PRIORITY,
  SONG_HEADER_OFF_REVERB,
  SONG_HEADER_OFF_TONE,
  SONG_HEADER_OFF_TRACK_COUNT,
  SOUND_CHANNEL_SF_ENV_ATTACK,
  SOUND_CHANNEL_SF_ENV,
  SOUND_CHANNEL_SF_ENV_DECAY,
  SOUND_CHANNEL_SF_ENV_RELEASE,
  SOUND_CHANNEL_SF_ENV_SUSTAIN,
  SOUND_CHANNEL_SF_IEC,
  SOUND_CHANNEL_SF_ON,
  SOUND_CHANNEL_SF_START,
  SOUND_CHANNEL_SF_STOP,
  SOUND_MODE_DA_BIT,
  SOUND_MODE_FREQ,
  SOUND_MODE_FREQ_13379,
  SOUND_MODE_MASVOL,
  SOUND_MODE_MASVOL_SHIFT,
  SOUND_MODE_MAXCHN,
  SOUND_MODE_MAXCHN_SHIFT,
  SOUND_MODE_REVERB_SET,
  SOUND_MODE_REVERB_VAL,
  SoundInfo,
  TEMPORARY_FADE,
  TONEDATA_TYPE_CGB,
  TONEDATA_TYPE_FIX,
  WAVE_DATA_OFF_FREQ,
} from '../include/gba/m4a_internal';
import {
  REG_OFFSET_NR10,
  REG_OFFSET_NR11,
  REG_OFFSET_NR12,
  REG_OFFSET_NR13,
  REG_OFFSET_NR14,
  REG_OFFSET_NR21,
  REG_OFFSET_NR22,
  REG_OFFSET_NR23,
  REG_OFFSET_NR24,
  REG_OFFSET_NR30,
  REG_OFFSET_NR31,
  REG_OFFSET_NR32,
  REG_OFFSET_NR33,
  REG_OFFSET_NR34,
  REG_OFFSET_NR41,
  REG_OFFSET_NR42,
  REG_OFFSET_NR43,
  REG_OFFSET_NR44,
  REG_OFFSET_NR50,
  REG_OFFSET_NR51,
  REG_OFFSET_NR52,
  REG_OFFSET_SOUNDBIAS,
} from '../include/gba/io_reg';
import {
  gCgb3Vol,
  gCgbFreqTable,
  gCgbScaleTable,
  gFreqTable,
  gNoiseTable,
  gPcmSamplesPerVBlankTable,
  gScaleTable,
  writePokemonCrySongTemplate,
} from './m4a_tables';
import {
  gSoundIoRam,
  gSoundMemory,
  MPlayJumpTableCopy,
  MPlayMain,
  ply_endtie,
  ply_lfos,
  ply_mod,
  ply_note as ply_note_import,
  RealClearChain,
  setSoundInfoPtr,
  SOUND_INFO_PTR,
  SoundMainBTM,
  TrackStop,
  umul3232H32,
} from './m4a_1';
import { gXcmdTable as gXcmdTableRef } from './m4a_tables';

// ─── Zone « RAM audio » de gSoundMemory (cf. m4a_internal.ts) ────────────────
// gPokemonCrySongs (2×52 bytes) + gPokemonCrySong (52) y vivent : la séquence
// des cris s'exécute DANS ces structures (part[]/gotoTarget pointent dedans).

export const SOUND_RAM_SIZE = 0x1000;
export const CRYSONG_RAM_OFF = 0x100; // gPokemonCrySongs[0..1]
export const CRYSONG_TEMPLATE_RAM_OFF = CRYSONG_RAM_OFF + CRYSONG_SIZE * MAX_POKEMON_CRIES; // gPokemonCrySong

// ─── COMMON_DATA (m4a.c:10-21) ────────────────────────────────────────────────

export const gSoundInfo = new SoundInfo();
export const gPokemonCryMusicPlayers: MusicPlayerInfo[] =
  Array.from({ length: MAX_POKEMON_CRIES }, () => new MusicPlayerInfo());
export const gMPlayInfo_BGM = new MusicPlayerInfo();
export const gMPlayJumpTable: MPlayFunc[] = new Array<MPlayFunc>(36).fill(DummyFunc);
export const gCgbChans: CgbChannel[] = Array.from({ length: 4 }, () => new CgbChannel());
export const gMPlayInfo_SE1 = new MusicPlayerInfo();
export const gMPlayInfo_SE2 = new MusicPlayerInfo();
export const gPokemonCryTracks: MusicPlayerTrack[] =
  Array.from({ length: MAX_POKEMON_CRIES * 2 }, () => new MusicPlayerTrack());
export const gMPlayMemAccArea = new Uint8Array(0x10);
export const gMPlayInfo_SE3 = new MusicPlayerInfo();

// Helpers mémoire locaux (little-endian).
function rdU8(off: number): number {
  return gSoundMemory[off];
}
function rdU32(off: number): number {
  return (gSoundMemory[off] | (gSoundMemory[off + 1] << 8) | (gSoundMemory[off + 2] << 16) | (gSoundMemory[off + 3] << 24)) >>> 0;
}
function wrU8(off: number, v: number): void {
  gSoundMemory[off] = v & 0xff;
}
function wrU16(off: number, v: number): void {
  gSoundMemory[off] = v & 0xff;
  gSoundMemory[off + 1] = (v >>> 8) & 0xff;
}
function wrU32(off: number, v: number): void {
  gSoundMemory[off] = v & 0xff;
  gSoundMemory[off + 1] = (v >>> 8) & 0xff;
  gSoundMemory[off + 2] = (v >>> 16) & 0xff;
  gSoundMemory[off + 3] = (v >>> 24) & 0xff;
}
function s8(v: number): number {
  return (v << 24) >> 24;
}

export function MidiKeyToFreq(wav: number, key: number, fineAdjust: number): number {
  let fineAdjustShifted = (fineAdjust << 24) >>> 0;
  if (key > 178) {
    key = 178;
    fineAdjustShifted = (255 << 24) >>> 0;
  }

  let val1 = gScaleTable[key];
  val1 = gFreqTable[val1 & 0xf] >>> (val1 >> 4);

  let val2 = gScaleTable[key + 1];
  val2 = gFreqTable[val2 & 0xf] >>> (val2 >> 4);

  const wavFreq = rdU32(wav + WAVE_DATA_OFF_FREQ);
  return umul3232H32(wavFreq, (val1 + umul3232H32((val2 - val1) >>> 0, fineAdjustShifted)) >>> 0);
}

export function MPlayContinue(mplayInfo: MusicPlayerInfo): void {
  if (mplayInfo.ident === ID_NUMBER) {
    mplayInfo.ident++;
    mplayInfo.status = (mplayInfo.status & ~MUSICPLAYER_STATUS_PAUSE) >>> 0;
    mplayInfo.ident = ID_NUMBER;
  }
}

export function MPlayFadeOut(mplayInfo: MusicPlayerInfo, speed: number): void {
  if (mplayInfo.ident === ID_NUMBER) {
    mplayInfo.ident++;
    mplayInfo.fadeOC = speed;
    mplayInfo.fadeOI = speed;
    mplayInfo.fadeOV = 64 << FADE_VOL_SHIFT;
    mplayInfo.ident = ID_NUMBER;
  }
}

export function m4aMPlayContinue(mplayInfo: MusicPlayerInfo): void {
  MPlayContinue(mplayInfo);
}

export function m4aMPlayFadeOut(mplayInfo: MusicPlayerInfo, speed: number): void {
  MPlayFadeOut(mplayInfo, speed);
}

export function m4aMPlayFadeOutTemporarily(mplayInfo: MusicPlayerInfo, speed: number): void {
  if (mplayInfo.ident === ID_NUMBER) {
    mplayInfo.ident++;
    mplayInfo.fadeOC = speed;
    mplayInfo.fadeOI = speed;
    mplayInfo.fadeOV = (64 << FADE_VOL_SHIFT) | TEMPORARY_FADE;
    mplayInfo.ident = ID_NUMBER;
  }
}

export function m4aMPlayFadeIn(mplayInfo: MusicPlayerInfo, speed: number): void {
  if (mplayInfo.ident === ID_NUMBER) {
    mplayInfo.ident++;
    mplayInfo.fadeOC = speed;
    mplayInfo.fadeOI = speed;
    mplayInfo.fadeOV = (0 << FADE_VOL_SHIFT) | FADE_IN;
    mplayInfo.status = (mplayInfo.status & ~MUSICPLAYER_STATUS_PAUSE) >>> 0;
    mplayInfo.ident = ID_NUMBER;
  }
}

export function m4aMPlayImmInit(mplayInfo: MusicPlayerInfo): void {
  const trackCount = mplayInfo.trackCount;
  const tracks = mplayInfo.tracks as MusicPlayerTrack[];
  for (let i = 0; i < trackCount; i++) {
    const track = tracks[i];
    if (track.flags & MPT_FLG_EXIST) {
      if (track.flags & MPT_FLG_START) {
        Clear64byte(track);
        track.flags = MPT_FLG_EXIST;
        track.bendRange = 2;
        track.volX = 64;
        track.lfoSpeed = 22;
        track.tone.type = 1;
      }
    }
  }
}

export function MPlayExtender(cgbChans: CgbChannel[]): void {
  // REG_SOUNDCNT_X = master enable + les 4 canaux PSG « on » (lecture seule des
  // bits 0-3 sur GBA ; l'écriture pose le master enable).
  gSoundIoRam[REG_OFFSET_NR52] = 0x80 | 0x0f;
  gSoundIoRam[REG_OFFSET_NR50] = 0; // SOUNDCNT_L bas : volume master PSG à zéro
  gSoundIoRam[REG_OFFSET_NR51] = 0;
  gSoundIoRam[REG_OFFSET_NR12] = 0x8;
  gSoundIoRam[REG_OFFSET_NR22] = 0x8;
  gSoundIoRam[REG_OFFSET_NR42] = 0x8;
  gSoundIoRam[REG_OFFSET_NR14] = 0x80;
  gSoundIoRam[REG_OFFSET_NR24] = 0x80;
  gSoundIoRam[REG_OFFSET_NR44] = 0x80;
  gSoundIoRam[REG_OFFSET_NR30] = 0;
  gSoundIoRam[REG_OFFSET_NR50] = 0x77;

  const soundInfo = SOUND_INFO_PTR();

  const ident = soundInfo.ident;
  if (ident !== ID_NUMBER) return;
  soundInfo.ident++;

  gMPlayJumpTable[8] = ply_memacc as unknown as MPlayFunc;
  gMPlayJumpTable[17] = ply_lfos as unknown as MPlayFunc;
  gMPlayJumpTable[19] = ply_mod as unknown as MPlayFunc;
  gMPlayJumpTable[28] = ply_xcmd as unknown as MPlayFunc;
  gMPlayJumpTable[29] = ply_endtie as unknown as MPlayFunc;
  gMPlayJumpTable[30] = SampleFreqSet as unknown as MPlayFunc;
  gMPlayJumpTable[31] = TrackStop as unknown as MPlayFunc;
  gMPlayJumpTable[32] = FadeOutBody as unknown as MPlayFunc;
  gMPlayJumpTable[33] = TrkVolPitSet as unknown as MPlayFunc;

  soundInfo.cgbChans = cgbChans;
  soundInfo.CgbSound = CgbSound;
  soundInfo.CgbOscOff = CgbOscOff;
  soundInfo.MidiKeyToCgbFreq = MidiKeyToCgbFreq;
  soundInfo.maxLines = 0; // MAX_LINES (profil scanline N/A hors GBA)

  // CpuFill32(0, cgbChans, sizeof * 4)
  for (const chan of cgbChans) {
    Object.assign(chan, new CgbChannel());
  }

  cgbChans[0].type = 1;
  cgbChans[0].panMask = 0x11;
  cgbChans[1].type = 2;
  cgbChans[1].panMask = 0x22;
  cgbChans[2].type = 3;
  cgbChans[2].panMask = 0x44;
  cgbChans[3].type = 4;
  cgbChans[3].panMask = 0x88;

  soundInfo.ident = ident;
}

export function ClearChain(x: Parameters<typeof RealClearChain>[0]): void {
  // 1:1 : via gMPlayJumpTable[34] (= RealClearChain).
  (gMPlayJumpTable[34] as unknown as typeof RealClearChain)(x);
}

export function Clear64byte(x: Parameters<typeof SoundMainBTM>[0]): void {
  // 1:1 : via gMPlayJumpTable[35] (= SoundMainBTM, le clear 64 octets).
  (gMPlayJumpTable[35] as unknown as typeof SoundMainBTM)(x);
}

export function SoundInit(soundInfo: SoundInfo): void {
  soundInfo.ident = 0;

  // REG_DMA1/2, SOUNDCNT_H, SOUNDBIAS, adresses FIFO : configuration du
  // transport PCM GBA — portée au lot mixeur (le worklet consomme pcmBuffer
  // directement). Les écritures d'état émulées utiles restent :
  gSoundIoRam[REG_OFFSET_NR52] = 0x80 | 0x0f; // SOUNDCNT_X : master + PSG on
  gSoundIoRam[REG_OFFSET_SOUNDBIAS + 1] = (gSoundIoRam[REG_OFFSET_SOUNDBIAS + 1] & 0x3f) | 0x40;

  setSoundInfoPtr(soundInfo);
  // CpuFill32(0, soundInfo, sizeof(struct SoundInfo)) :
  const fresh = new SoundInfo();
  soundInfo.ident = fresh.ident;
  soundInfo.pcmDmaCounter = 0;
  soundInfo.reverb = 0;
  soundInfo.maxChans = 0;
  soundInfo.masterVolume = 0;
  soundInfo.freq = 0;
  soundInfo.mode = 0;
  soundInfo.c15 = 0;
  soundInfo.pcmDmaPeriod = 0;
  soundInfo.maxLines = 0;
  soundInfo.pcmSamplesPerVBlank = 0;
  soundInfo.pcmFreq = 0;
  soundInfo.divFreq = 0;
  soundInfo.cgbChans = null;
  soundInfo.MPlayMainHead = null;
  soundInfo.musicPlayerHead = null;
  soundInfo.CgbSound = null;
  soundInfo.CgbOscOff = null;
  soundInfo.MidiKeyToCgbFreq = null;
  soundInfo.MPlayJumpTable = null;
  soundInfo.plynote = null;
  soundInfo.ExtVolPit = null;
  soundInfo.chans = fresh.chans;
  soundInfo.pcmBuffer.fill(0);

  soundInfo.maxChans = 8;
  soundInfo.masterVolume = 15;
  soundInfo.plynote = ply_note_import;
  soundInfo.CgbSound = DummyFunc;
  soundInfo.CgbOscOff = DummyFunc as unknown as NonNullable<SoundInfo['CgbOscOff']>;
  soundInfo.MidiKeyToCgbFreq = DummyFunc as unknown as NonNullable<SoundInfo['MidiKeyToCgbFreq']>;
  soundInfo.ExtVolPit = DummyFunc;

  MPlayJumpTableCopy(gMPlayJumpTable);
  soundInfo.MPlayJumpTable = gMPlayJumpTable;

  SampleFreqSet(SOUND_MODE_FREQ_13379);

  soundInfo.ident = ID_NUMBER;
}

export function SampleFreqSet(freq: number): void {
  const soundInfo = SOUND_INFO_PTR();

  freq = (freq & 0xf0000) >>> 16;
  soundInfo.freq = freq;
  soundInfo.pcmSamplesPerVBlank = gPcmSamplesPerVBlankTable[freq - 1];
  soundInfo.pcmDmaPeriod = Math.floor(1584 / soundInfo.pcmSamplesPerVBlank); // PCM_DMA_BUF_SIZE

  // LCD refresh rate 59.7275Hz
  soundInfo.pcmFreq = Math.floor((597275 * soundInfo.pcmSamplesPerVBlank + 5000) / 10000);

  // CPU frequency 16.78Mhz
  soundInfo.divFreq = (Math.floor(16777216 / soundInfo.pcmFreq) + 1) >> 1;

  // REG_TM0CNT (timer d'échantillonnage) + attente VCOUNT 159 + relance DMA :
  // cadencement réel du hardware — le worklet cadence la consommation du
  // pcmBuffer (lot mixeur). m4aSoundVSyncOn() reste appelé pour l'état :
  m4aSoundVSyncOn();
}

export function m4aSoundMode(mode: number): void {
  const soundInfo = SOUND_INFO_PTR();
  let temp: number;

  if (soundInfo.ident !== ID_NUMBER) return;
  soundInfo.ident++;

  temp = mode & (SOUND_MODE_REVERB_SET | SOUND_MODE_REVERB_VAL);
  if (temp) soundInfo.reverb = temp & SOUND_MODE_REVERB_VAL;

  temp = mode & SOUND_MODE_MAXCHN;
  if (temp) {
    soundInfo.maxChans = temp >> SOUND_MODE_MAXCHN_SHIFT;
    for (let i = 0; i < MAX_DIRECTSOUND_CHANNELS; i++) {
      soundInfo.chans[i].statusFlags = 0;
    }
  }

  temp = mode & SOUND_MODE_MASVOL;
  if (temp) soundInfo.masterVolume = temp >> SOUND_MODE_MASVOL_SHIFT;

  temp = mode & SOUND_MODE_DA_BIT;
  if (temp) {
    temp = (temp & 0x300000) >> 14;
    gSoundIoRam[REG_OFFSET_SOUNDBIAS + 1] = (gSoundIoRam[REG_OFFSET_SOUNDBIAS + 1] & 0x3f) | temp;
  }

  temp = mode & SOUND_MODE_FREQ;
  if (temp) {
    m4aSoundVSyncOff();
    SampleFreqSet(temp);
  }

  soundInfo.ident = ID_NUMBER;
}

export function SoundClear(): void {
  const soundInfo = SOUND_INFO_PTR();

  if (soundInfo.ident !== ID_NUMBER) return;
  soundInfo.ident++;

  for (let i = 0; i < MAX_DIRECTSOUND_CHANNELS; i++) {
    soundInfo.chans[i].statusFlags = 0;
  }

  const cgbChans = soundInfo.cgbChans;
  if (cgbChans) {
    for (let i = 1; i <= 4; i++) {
      soundInfo.CgbOscOff?.(i);
      cgbChans[i - 1].statusFlags = 0;
    }
  }

  soundInfo.ident = ID_NUMBER;
}

export function m4aSoundVSyncOff(): void {
  const soundInfo = SOUND_INFO_PTR();
  if (soundInfo.ident >= ID_NUMBER && soundInfo.ident <= ID_NUMBER + 1) {
    soundInfo.ident += 10;
    // arrêt DMA1/DMA2 : transport N/A (worklet) — l'état émulé :
    soundInfo.pcmBuffer.fill(0);
  }
}

export function m4aSoundVSyncOn(): void {
  const soundInfo = SOUND_INFO_PTR();
  const ident = soundInfo.ident;
  if (ident === ID_NUMBER) return;
  // relance DMA1/DMA2 FIFO : transport N/A (worklet).
  soundInfo.pcmDmaCounter = 0;
  soundInfo.ident = ident - 10;
}

export function MPlayOpen(mplayInfo: MusicPlayerInfo, tracks: MusicPlayerTrack[], trackCount: number): void {
  if (trackCount === 0) return;
  if (trackCount > MAX_MUSICPLAYER_TRACKS) trackCount = MAX_MUSICPLAYER_TRACKS;

  const soundInfo = SOUND_INFO_PTR();
  if (soundInfo.ident !== ID_NUMBER) return;
  soundInfo.ident++;

  Clear64byte(mplayInfo);

  mplayInfo.tracks = tracks;
  mplayInfo.trackCount = trackCount;
  mplayInfo.status = MUSICPLAYER_STATUS_PAUSE;

  for (let i = 0; i < trackCount; i++) tracks[i].flags = 0;

  // append music player and MPlayMain to linked list
  if (soundInfo.MPlayMainHead !== null) {
    mplayInfo.MPlayMainNext = soundInfo.MPlayMainHead;
    mplayInfo.musicPlayerNext = soundInfo.musicPlayerHead;
    soundInfo.MPlayMainHead = null; // sémantiquement inutile, gardé 1:1
  }

  soundInfo.musicPlayerHead = mplayInfo;
  soundInfo.MPlayMainHead = MPlayMain;
  soundInfo.ident = ID_NUMBER;
  mplayInfo.ident = ID_NUMBER;
}

export function MPlayStart(mplayInfo: MusicPlayerInfo, songHeader: number): void {
  if (mplayInfo.ident !== ID_NUMBER) return;

  const unk_B = mplayInfo.unk_B;
  const songPriority = rdU8(songHeader + SONG_HEADER_OFF_PRIORITY);

  if (
    !unk_B
    || ((!mplayInfo.songHeader || !((mplayInfo.tracks as MusicPlayerTrack[])[0].flags & MPT_FLG_START))
      && ((mplayInfo.status & MUSICPLAYER_STATUS_TRACK) === 0
        || (mplayInfo.status & MUSICPLAYER_STATUS_PAUSE) !== 0))
    || mplayInfo.priority <= songPriority
  ) {
    mplayInfo.ident++;
    mplayInfo.status = 0;
    mplayInfo.songHeader = songHeader;
    mplayInfo.tone = rdU32(songHeader + SONG_HEADER_OFF_TONE);
    mplayInfo.priority = songPriority;
    mplayInfo.clock = 0;
    mplayInfo.tempoD = 150;
    mplayInfo.tempoI = 150;
    mplayInfo.tempoU = 0x100;
    mplayInfo.tempoC = 0;
    mplayInfo.fadeOI = 0;

    const songTrackCount = rdU8(songHeader + SONG_HEADER_OFF_TRACK_COUNT);
    const tracks = mplayInfo.tracks as MusicPlayerTrack[];
    let i = 0;
    for (; i < songTrackCount && i < mplayInfo.trackCount; i++) {
      const track = tracks[i];
      TrackStop(mplayInfo, track);
      track.flags = MPT_FLG_EXIST | MPT_FLG_START;
      track.chan = null;
      track.cmdPtr = rdU32(songHeader + SONG_HEADER_OFF_PART + i * 4);
    }
    for (; i < mplayInfo.trackCount; i++) {
      const track = tracks[i];
      TrackStop(mplayInfo, track);
      track.flags = 0;
    }

    if (rdU8(songHeader + SONG_HEADER_OFF_REVERB) & SOUND_MODE_REVERB_SET) {
      m4aSoundMode(rdU8(songHeader + SONG_HEADER_OFF_REVERB));
    }

    mplayInfo.ident = ID_NUMBER;
  }
}

export function m4aMPlayStop(mplayInfo: MusicPlayerInfo): void {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;
  mplayInfo.status = (mplayInfo.status | MUSICPLAYER_STATUS_PAUSE) >>> 0;

  const tracks = mplayInfo.tracks as MusicPlayerTrack[];
  for (let i = 0; i < mplayInfo.trackCount; i++) {
    TrackStop(mplayInfo, tracks[i]);
  }

  mplayInfo.ident = ID_NUMBER;
}

export function FadeOutBody(mplayInfo: MusicPlayerInfo): void {
  if (mplayInfo.fadeOI === 0) return;
  mplayInfo.fadeOC = (mplayInfo.fadeOC - 1) & 0xffff;
  if (mplayInfo.fadeOC !== 0) return;

  mplayInfo.fadeOC = mplayInfo.fadeOI;

  if (mplayInfo.fadeOV & FADE_IN) {
    mplayInfo.fadeOV = (mplayInfo.fadeOV + (4 << FADE_VOL_SHIFT)) & 0xffff;
    if (mplayInfo.fadeOV >= 64 << FADE_VOL_SHIFT) {
      mplayInfo.fadeOV = 64 << FADE_VOL_SHIFT;
      mplayInfo.fadeOI = 0;
    }
  } else {
    mplayInfo.fadeOV = (mplayInfo.fadeOV - (4 << FADE_VOL_SHIFT)) & 0xffff;
    if (((mplayInfo.fadeOV << 16) >> 16) <= 0) {
      const tracks = mplayInfo.tracks as MusicPlayerTrack[];
      for (let i = 0; i < mplayInfo.trackCount; i++) {
        const track = tracks[i];
        TrackStop(mplayInfo, track);
        if (!(TEMPORARY_FADE & mplayInfo.fadeOV)) track.flags = 0;
      }

      if (mplayInfo.fadeOV & TEMPORARY_FADE) {
        mplayInfo.status = (mplayInfo.status | MUSICPLAYER_STATUS_PAUSE) >>> 0;
      } else {
        mplayInfo.status = MUSICPLAYER_STATUS_PAUSE;
      }

      mplayInfo.fadeOI = 0;
      return;
    }
  }

  const tracks = mplayInfo.tracks as MusicPlayerTrack[];
  for (let i = 0; i < mplayInfo.trackCount; i++) {
    const track = tracks[i];
    if (track.flags & MPT_FLG_EXIST) {
      track.volX = (mplayInfo.fadeOV >> FADE_VOL_SHIFT) & 0xff;
      track.flags = (track.flags | MPT_FLG_VOLCHG) & 0xff;
    }
  }
}

export function TrkVolPitSet(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  if (track.flags & MPT_FLG_VOLSET) {
    let x = (track.vol * track.volX) >>> 5;
    if (track.modT === 1) x = (x * (s8(track.modM) + 128)) >>> 7;

    let y = 2 * s8(track.pan) + s8(track.panX);
    if (track.modT === 2) y += s8(track.modM);

    if (y < -128) y = -128;
    else if (y > 127) y = 127;

    track.volMR = ((y + 128) * x) >>> 8;
    track.volML = ((127 - y) * x) >>> 8;
  }

  if (track.flags & MPT_FLG_PITSET) {
    const bend = s8(track.bend) * track.bendRange;
    let x = (s8(track.tune) + bend) * 4
      + (s8(track.keyShift) << 8)
      + (s8(track.keyShiftX) << 8)
      + track.pitX;
    if (track.modT === 0) x += 16 * s8(track.modM);

    track.keyM = (x >> 8) & 0xff;
    track.pitM = x & 0xff;
  }

  track.flags = track.flags & ~(MPT_FLG_PITSET | MPT_FLG_VOLSET) & 0xff;
}

export function MidiKeyToCgbFreq(chanNum: number, key: number, fineAdjust: number): number {
  if (chanNum === 4) {
    if (key <= 20) {
      key = 0;
    } else {
      key -= 21;
      if (key > 59) key = 59;
    }
    return gNoiseTable[key];
  } else {
    if (key <= 35) {
      fineAdjust = 0;
      key = 0;
    } else {
      key -= 36;
      if (key > 130) {
        key = 130;
        fineAdjust = 255;
      }
    }

    let val1 = gCgbScaleTable[key];
    val1 = gCgbFreqTable[val1 & 0xf] >> (val1 >> 4);

    let val2 = gCgbScaleTable[key + 1];
    val2 = gCgbFreqTable[val2 & 0xf] >> (val2 >> 4);

    return (val1 + (((fineAdjust * (val2 - val1)) >> 8) | 0) + 2048) >>> 0;
  }
}

export function CgbOscOff(chanNum: number): void {
  switch (chanNum) {
    case 1:
      gSoundIoRam[REG_OFFSET_NR12] = 8;
      gSoundIoRam[REG_OFFSET_NR14] = 0x80;
      break;
    case 2:
      gSoundIoRam[REG_OFFSET_NR22] = 8;
      gSoundIoRam[REG_OFFSET_NR24] = 0x80;
      break;
    case 3:
      gSoundIoRam[REG_OFFSET_NR30] = 0;
      break;
    default:
      gSoundIoRam[REG_OFFSET_NR42] = 8;
      gSoundIoRam[REG_OFFSET_NR44] = 0x80;
  }
}

function CgbPan(chan: CgbChannel): number {
  const rightVolume = chan.rightVolume & 0xff;
  const leftVolume = chan.leftVolume & 0xff;

  if (rightVolume >= leftVolume) {
    if (rightVolume / 2 >= leftVolume) {
      chan.pan = 0x0f;
      return 1;
    }
  } else {
    if (leftVolume / 2 >= rightVolume) {
      chan.pan = 0xf0;
      return 1;
    }
  }
  return 0;
}

export function CgbModVol(chan: CgbChannel): void {
  const soundInfo = SOUND_INFO_PTR();

  if ((soundInfo.mode & 1) || !CgbPan(chan)) {
    chan.pan = 0xff;
    chan.envelopeGoal = ((chan.leftVolume + chan.rightVolume) / 16) | 0;
  } else {
    chan.envelopeGoal = ((chan.leftVolume + chan.rightVolume) / 16) | 0;
    if (chan.envelopeGoal > 15) chan.envelopeGoal = 15;
  }

  chan.sustainGoal = ((chan.envelopeGoal * chan.sustain + 15) >> 4) & 0xff;
  chan.pan &= chan.panMask;
}

/** 1:1 `CgbSound` (m4a.c:925) : fait tourner les enveloppes logicielles des 4
 *  canaux PSG et écrit les registres NRxx émulés (gSoundIoRam) que la synthèse
 *  PSG du worklet consommera. Le graphe de goto du C est transcrit en
 *  état/booléens locaux — mêmes transitions, mêmes écritures registres. */
export function CgbSound(): void {
  const soundInfo = SOUND_INFO_PTR();

  if (soundInfo.c15) soundInfo.c15--;
  else soundInfo.c15 = 14;

  const cgbChans = soundInfo.cgbChans as CgbChannel[];
  for (let ch = 1; ch <= 4; ch++) {
    const channels = cgbChans[ch - 1];
    if (!(channels.statusFlags & SOUND_CHANNEL_SF_ON)) continue;

    /* 1. determine hardware channel registers */
    let nrx0off: number, nrx1off: number, nrx2off: number, nrx3off: number, nrx4off: number;
    switch (ch) {
      case 1:
        nrx0off = REG_OFFSET_NR10; nrx1off = REG_OFFSET_NR11; nrx2off = REG_OFFSET_NR12;
        nrx3off = REG_OFFSET_NR13; nrx4off = REG_OFFSET_NR14;
        break;
      case 2:
        nrx0off = REG_OFFSET_NR10 + 1; nrx1off = REG_OFFSET_NR21; nrx2off = REG_OFFSET_NR22;
        nrx3off = REG_OFFSET_NR23; nrx4off = REG_OFFSET_NR24;
        break;
      case 3:
        nrx0off = REG_OFFSET_NR30; nrx1off = REG_OFFSET_NR31; nrx2off = REG_OFFSET_NR32;
        nrx3off = REG_OFFSET_NR33; nrx4off = REG_OFFSET_NR34;
        break;
      default:
        nrx0off = REG_OFFSET_NR30 + 1; nrx1off = REG_OFFSET_NR41; nrx2off = REG_OFFSET_NR42;
        nrx3off = REG_OFFSET_NR43; nrx4off = REG_OFFSET_NR44;
        break;
    }

    let prevC15 = soundInfo.c15;
    let envelopeStepTimeAndDir = gSoundIoRam[nrx2off];

    // Le graphe d'états du C (labels → mini-machine) :
    type Step =
      | 'dispatch' | 'env_step_repeat' | 'env_start_playing' | 'oscillator_off'
      | 'env_release_step' | 'envelope_pseudoecho_start' | 'envelope_sustain'
      | 'envelope_sustain_start' | 'envelope_decay_start' | 'envelope_step_complete'
      | 'envelope_complete' | 'channel_complete' | 'done';
    let step: Step = 'dispatch';

    while (step !== 'done') {
      switch (step) {
        case 'dispatch':
          if (channels.statusFlags & SOUND_CHANNEL_SF_START) {
            if (channels.statusFlags & SOUND_CHANNEL_SF_STOP) { step = 'oscillator_off'; break; }
            step = 'env_start_playing';
          } else if (channels.statusFlags & SOUND_CHANNEL_SF_IEC) {
            channels.pseudoEchoLength = (channels.pseudoEchoLength - 1) & 0xff;
            if (s8(channels.pseudoEchoLength) <= 0) { step = 'oscillator_off'; break; }
            step = 'envelope_complete';
          } else if ((channels.statusFlags & SOUND_CHANNEL_SF_STOP) && (channels.statusFlags & SOUND_CHANNEL_SF_ENV)) {
            channels.statusFlags &= ~SOUND_CHANNEL_SF_ENV;
            channels.envelopeCounter = channels.release;
            if (s8(channels.release)) {
              channels.modify |= CGB_CHANNEL_MO_VOL;
              if (ch !== 3) envelopeStepTimeAndDir = channels.release | CGB_NRx2_ENV_DIR_DEC;
              step = 'envelope_step_complete';
            } else {
              step = 'envelope_pseudoecho_start';
            }
          } else {
            step = 'env_step_repeat';
          }
          break;

        case 'env_start_playing': {
          channels.statusFlags = SOUND_CHANNEL_SF_ENV_ATTACK;
          channels.modify = CGB_CHANNEL_MO_PIT | CGB_CHANNEL_MO_VOL;
          CgbModVol(channels);
          let initEnvStep = false;
          switch (ch) {
            case 1:
              gSoundIoRam[nrx0off] = channels.sweep;
              // fallthrough
            case 2:
              gSoundIoRam[nrx1off] = (((channels.wavePointer << 6) & 0xff) + channels.length) & 0xff;
              initEnvStep = true;
              break;
            case 3:
              if (channels.wavePointer !== channels.currentPointer) {
                gSoundIoRam[nrx0off] = 0x40;
                // REG_WAVE_RAM0-3 ← les 16 octets du wave pattern (gSoundMemory).
                for (let k = 0; k < 16; k++) {
                  gSoundIoRam[0x90 + k] = gSoundMemory[channels.wavePointer + k];
                }
                channels.currentPointer = channels.wavePointer;
              }
              gSoundIoRam[nrx0off] = 0;
              gSoundIoRam[nrx1off] = channels.length;
              channels.n4 = channels.length ? 0xc0 : 0x80;
              break;
            default:
              gSoundIoRam[nrx1off] = channels.length;
              gSoundIoRam[nrx3off] = (channels.wavePointer << 3) & 0xff;
              initEnvStep = true;
              break;
          }
          if (initEnvStep) {
            envelopeStepTimeAndDir = (channels.attack + CGB_NRx2_ENV_DIR_INC) & 0xff;
            channels.n4 = channels.length ? 0x40 : 0x00;
          }
          channels.envelopeCounter = channels.attack;
          if (s8(channels.attack)) {
            channels.envelopeVolume = 0;
            step = 'envelope_step_complete';
          } else {
            step = 'envelope_decay_start';
          }
          break;
        }

        case 'oscillator_off':
          CgbOscOff(ch);
          channels.statusFlags = 0;
          step = 'channel_complete';
          break;

        case 'env_step_repeat':
          if (channels.envelopeCounter === 0) {
            if (ch === 3) channels.modify |= CGB_CHANNEL_MO_VOL;
            CgbModVol(channels);
            if ((channels.statusFlags & SOUND_CHANNEL_SF_ENV) === SOUND_CHANNEL_SF_ENV_RELEASE) {
              channels.envelopeVolume = (channels.envelopeVolume - 1) & 0xff;
              if (s8(channels.envelopeVolume) <= 0) {
                step = 'envelope_pseudoecho_start';
              } else {
                channels.envelopeCounter = channels.release;
                step = 'envelope_step_complete';
              }
            } else if ((channels.statusFlags & SOUND_CHANNEL_SF_ENV) === SOUND_CHANNEL_SF_ENV_SUSTAIN) {
              step = 'envelope_sustain';
            } else if ((channels.statusFlags & SOUND_CHANNEL_SF_ENV) === SOUND_CHANNEL_SF_ENV_DECAY) {
              channels.envelopeVolume = (channels.envelopeVolume - 1) & 0xff;
              if (s8(channels.envelopeVolume) <= s8(channels.sustainGoal)) {
                step = 'envelope_sustain_start';
              } else {
                channels.envelopeCounter = channels.decay;
                step = 'envelope_step_complete';
              }
            } else {
              channels.envelopeVolume = (channels.envelopeVolume + 1) & 0xff;
              if ((channels.envelopeVolume & 0xff) >= channels.envelopeGoal) {
                step = 'envelope_decay_start';
              } else {
                channels.envelopeCounter = channels.attack;
                step = 'envelope_step_complete';
              }
            }
          } else {
            step = 'envelope_step_complete';
          }
          break;

        case 'envelope_pseudoecho_start':
          channels.envelopeVolume = (((channels.envelopeGoal * channels.pseudoEchoVolume) + 0xff) >> 8) & 0xff;
          if (channels.envelopeVolume) {
            channels.statusFlags |= SOUND_CHANNEL_SF_IEC;
            channels.modify |= CGB_CHANNEL_MO_VOL;
            if (ch !== 3) envelopeStepTimeAndDir = 0 | CGB_NRx2_ENV_DIR_INC;
            step = 'envelope_complete';
          } else {
            step = 'oscillator_off';
          }
          break;

        case 'envelope_sustain':
          channels.envelopeVolume = channels.sustainGoal;
          channels.envelopeCounter = 7;
          step = 'envelope_step_complete';
          break;

        case 'envelope_sustain_start':
          if (channels.sustain === 0) {
            channels.statusFlags &= ~SOUND_CHANNEL_SF_ENV;
            step = 'envelope_pseudoecho_start';
          } else {
            channels.statusFlags = (channels.statusFlags - 1) & 0xff;
            channels.modify |= CGB_CHANNEL_MO_VOL;
            if (ch !== 3) envelopeStepTimeAndDir = 0 | CGB_NRx2_ENV_DIR_INC;
            step = 'envelope_sustain';
          }
          break;

        case 'envelope_decay_start':
          channels.statusFlags = (channels.statusFlags - 1) & 0xff;
          channels.envelopeCounter = channels.decay;
          if (channels.envelopeCounter & 0xff) {
            channels.modify |= CGB_CHANNEL_MO_VOL;
            channels.envelopeVolume = channels.envelopeGoal;
            if (ch !== 3) envelopeStepTimeAndDir = channels.decay | CGB_NRx2_ENV_DIR_DEC;
            step = 'envelope_step_complete';
          } else {
            step = 'envelope_sustain_start';
          }
          break;

        case 'envelope_step_complete':
          // every 15 frames, envelope calculation has to be done twice
          // to keep up with the hardware envelope rate (1/64 s)
          channels.envelopeCounter = (channels.envelopeCounter - 1) & 0xff;
          if (prevC15 === 0) {
            prevC15--;
            step = 'env_step_repeat';
          } else {
            step = 'envelope_complete';
          }
          break;

        case 'envelope_complete': {
          /* 3. apply pitch to HW registers */
          if (channels.modify & CGB_CHANNEL_MO_PIT) {
            if (ch < 4 && (channels.type & TONEDATA_TYPE_FIX)) {
              const dacPwmRate = gSoundIoRam[REG_OFFSET_SOUNDBIAS + 1];
              if (dacPwmRate < 0x40) {
                channels.frequency = (channels.frequency + 2) & 0x7fc;
              } else if (dacPwmRate < 0x80) {
                channels.frequency = (channels.frequency + 1) & 0x7fe;
              }
            }
            if (ch !== 4) {
              gSoundIoRam[nrx3off] = channels.frequency & 0xff;
            } else {
              gSoundIoRam[nrx3off] = ((gSoundIoRam[nrx3off] & 0x08) | channels.frequency) & 0xff;
            }
            channels.n4 = ((channels.n4 & 0xc0) + ((channels.frequency >> 8) & 0xff)) & 0xff;
            gSoundIoRam[nrx4off] = channels.n4;
          }

          /* 4. apply envelope & volume to HW registers */
          if (channels.modify & CGB_CHANNEL_MO_VOL) {
            gSoundIoRam[REG_OFFSET_NR51] = ((gSoundIoRam[REG_OFFSET_NR51] & ~channels.panMask) | channels.pan) & 0xff;
            if (ch === 3) {
              gSoundIoRam[nrx2off] = gCgb3Vol[channels.envelopeVolume];
              if (channels.n4 & 0x80) {
                gSoundIoRam[nrx0off] = 0x80;
                gSoundIoRam[nrx4off] = channels.n4;
                channels.n4 &= 0x7f;
              }
            } else {
              gSoundIoRam[nrx2off] = ((envelopeStepTimeAndDir & 0xf) + (channels.envelopeVolume << 4)) & 0xff;
              gSoundIoRam[nrx4off] = (channels.n4 | 0x80) & 0xff;
              if (ch === 1 && !(gSoundIoRam[nrx0off] & 0x08)) {
                gSoundIoRam[nrx4off] = (channels.n4 | 0x80) & 0xff;
              }
            }
          }
          step = 'channel_complete';
          break;
        }

        case 'channel_complete':
          channels.modify = 0;
          step = 'done';
          break;
      }
    }
  }
}

export function m4aMPlayTempoControl(mplayInfo: MusicPlayerInfo, tempo: number): void {
  if (mplayInfo.ident === ID_NUMBER) {
    mplayInfo.ident++;
    mplayInfo.tempoU = tempo & 0xffff;
    mplayInfo.tempoI = ((mplayInfo.tempoD * mplayInfo.tempoU) >> 8) & 0xffff;
    mplayInfo.ident = ID_NUMBER;
  }
}

export function m4aMPlayVolumeControl(mplayInfo: MusicPlayerInfo, trackBits: number, volume: number): void {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;

  const tracks = mplayInfo.tracks as MusicPlayerTrack[];
  let bit = 1;
  for (let i = 0; i < mplayInfo.trackCount; i++, bit = (bit << 1) >>> 0) {
    if (trackBits & bit) {
      const track = tracks[i];
      if (track.flags & MPT_FLG_EXIST) {
        track.volX = (volume / 4) & 0xff;
        track.flags = (track.flags | MPT_FLG_VOLCHG) & 0xff;
      }
    }
  }

  mplayInfo.ident = ID_NUMBER;
}

export function m4aMPlayPitchControl(mplayInfo: MusicPlayerInfo, trackBits: number, pitch: number): void {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;

  const tracks = mplayInfo.tracks as MusicPlayerTrack[];
  let bit = 1;
  for (let i = 0; i < mplayInfo.trackCount; i++, bit = (bit << 1) >>> 0) {
    if (trackBits & bit) {
      const track = tracks[i];
      if (track.flags & MPT_FLG_EXIST) {
        track.keyShiftX = (pitch >> 8) & 0xff;
        track.pitX = pitch & 0xff;
        track.flags = (track.flags | MPT_FLG_PITCHG) & 0xff;
      }
    }
  }

  mplayInfo.ident = ID_NUMBER;
}

export function m4aMPlayPanpotControl(mplayInfo: MusicPlayerInfo, trackBits: number, pan: number): void {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;

  const tracks = mplayInfo.tracks as MusicPlayerTrack[];
  let bit = 1;
  for (let i = 0; i < mplayInfo.trackCount; i++, bit = (bit << 1) >>> 0) {
    if (trackBits & bit) {
      const track = tracks[i];
      if (track.flags & MPT_FLG_EXIST) {
        track.panX = s8(pan);
        track.flags = (track.flags | MPT_FLG_VOLCHG) & 0xff;
      }
    }
  }

  mplayInfo.ident = ID_NUMBER;
}

export function ClearModM(track: MusicPlayerTrack): void {
  track.lfoSpeedC = 0;
  track.modM = 0;
  if (track.modT === 0) track.flags = (track.flags | MPT_FLG_PITCHG) & 0xff;
  else track.flags = (track.flags | MPT_FLG_VOLCHG) & 0xff;
}

export function m4aMPlayModDepthSet(mplayInfo: MusicPlayerInfo, trackBits: number, modDepth: number): void {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;

  const tracks = mplayInfo.tracks as MusicPlayerTrack[];
  let bit = 1;
  for (let i = 0; i < mplayInfo.trackCount; i++, bit = (bit << 1) >>> 0) {
    if (trackBits & bit) {
      const track = tracks[i];
      if (track.flags & MPT_FLG_EXIST) {
        track.mod = modDepth;
        if (!track.mod) ClearModM(track);
      }
    }
  }

  mplayInfo.ident = ID_NUMBER;
}

export function m4aMPlayLFOSpeedSet(mplayInfo: MusicPlayerInfo, trackBits: number, lfoSpeed: number): void {
  if (mplayInfo.ident !== ID_NUMBER) return;
  mplayInfo.ident++;

  const tracks = mplayInfo.tracks as MusicPlayerTrack[];
  let bit = 1;
  for (let i = 0; i < mplayInfo.trackCount; i++, bit = (bit << 1) >>> 0) {
    if (trackBits & bit) {
      const track = tracks[i];
      if (track.flags & MPT_FLG_EXIST) {
        track.lfoSpeed = lfoSpeed;
        if (!track.lfoSpeed) ClearModM(track);
      }
    }
  }

  mplayInfo.ident = ID_NUMBER;
}

/** 1:1 `ply_memacc` (m4a.c:1437) — opérations mémoire + sauts conditionnels
 *  sur memAccArea (gMPlayMemAccArea). */
export function ply_memacc(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  const op = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
  const addrIdx = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
  const data = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;

  const area = gMPlayMemAccArea;
  let cond: boolean;
  switch (op) {
    case 0: area[addrIdx] = data; return;
    case 1: area[addrIdx] = (area[addrIdx] + data) & 0xff; return;
    case 2: area[addrIdx] = (area[addrIdx] - data) & 0xff; return;
    case 3: area[addrIdx] = area[data]; return;
    case 4: area[addrIdx] = (area[addrIdx] + area[data]) & 0xff; return;
    case 5: area[addrIdx] = (area[addrIdx] - area[data]) & 0xff; return;
    case 6: cond = area[addrIdx] === data; break;
    case 7: cond = area[addrIdx] !== data; break;
    case 8: cond = area[addrIdx] > data; break;
    case 9: cond = area[addrIdx] >= data; break;
    case 10: cond = area[addrIdx] <= data; break;
    case 11: cond = area[addrIdx] < data; break;
    case 12: cond = area[addrIdx] === area[data]; break;
    case 13: cond = area[addrIdx] !== area[data]; break;
    case 14: cond = area[addrIdx] > area[data]; break;
    case 15: cond = area[addrIdx] >= area[data]; break;
    case 16: cond = area[addrIdx] <= area[data]; break;
    case 17: cond = area[addrIdx] < area[data]; break;
    default: return;
  }

  if (cond) {
    // cond_true : (*&gMPlayJumpTable[1])(mplayInfo, track) = ply_goto.
    (gMPlayJumpTable[1] as unknown as (mi: MusicPlayerInfo, tr: MusicPlayerTrack) => void)(mplayInfo, track);
    return;
  }
  // cond_false :
  track.cmdPtr = (track.cmdPtr + 4) >>> 0;
}

export function ply_xcmd(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  const n = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
  gXcmdTableRef[n](mplayInfo, track);
}

export function ply_xxx(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  (gMPlayJumpTable[0] as unknown as (mi: MusicPlayerInfo, tr: MusicPlayerTrack) => void)(mplayInfo, track);
}

export function ply_xwave(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  const wav = rdU32(track.cmdPtr);
  track.tone.wav = wav;
  track.cmdPtr = (track.cmdPtr + 4) >>> 0;
}

export function ply_xtype(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.tone.type = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
}

export function ply_xatta(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.tone.attack = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
}

export function ply_xdeca(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.tone.decay = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
}

export function ply_xsust(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.tone.sustain = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
}

export function ply_xrele(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.tone.release = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
}

export function ply_xiecv(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.pseudoEchoVolume = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
}

export function ply_xiecl(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.pseudoEchoLength = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
}

export function ply_xleng(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.tone.length = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
}

export function ply_xswee(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.tone.pan_sweep = rdU8(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 1) >>> 0;
}

export function ply_xwait(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  const len = rdU8(track.cmdPtr) | (rdU8(track.cmdPtr + 1) << 8);
  if (track.timer < (len & 0xffff)) {
    track.timer = (track.timer + 1) & 0xffff;
    track.cmdPtr = (track.cmdPtr - 2) >>> 0;
    track.wait = 1;
  } else {
    track.timer = 0;
    track.cmdPtr = (track.cmdPtr + 2) >>> 0;
  }
}

export function ply_xcmd_0D(mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack): void {
  void mplayInfo;
  track.unk_3C = rdU32(track.cmdPtr);
  track.cmdPtr = (track.cmdPtr + 4) >>> 0;
}

export function DummyFunc(): void {
}

// ─── Cris Pokémon (structures dans la zone RAM audio de gSoundMemory) ────────

/** Écrit la template gPokemonCrySong dans la RAM audio (équivalent du
 *  `memcpy(&gPokemonCrySong, &gPokemonCrySongTemplate, …)` de m4aSoundInit —
 *  appelé par le boot du moteur, lot mixeur/données). */
export function initPokemonCrySongRam(voicegroupDummyOff: number): void {
  writePokemonCrySongTemplate(gSoundMemory, CRYSONG_TEMPLATE_RAM_OFF, voicegroupDummyOff);
}

export function SetPokemonCryTone(tone: number): MusicPlayerInfo {
  let maxClock = 0;
  let maxClockIndex = 0;
  let i: number;
  let found = false;

  for (i = 0; i < MAX_POKEMON_CRIES; i++) {
    const track = gPokemonCryTracks[i * 2];
    if (!track.flags && (!track.chan || track.chan.track !== track)) {
      found = true;
      break;
    }
    if (maxClock < gPokemonCryMusicPlayers[i].clock) {
      maxClock = gPokemonCryMusicPlayers[i].clock;
      maxClockIndex = i;
    }
  }
  if (!found) i = maxClockIndex;

  const mplayInfo = gPokemonCryMusicPlayers[i];
  mplayInfo.ident++;

  // gPokemonCrySongs[i] = gPokemonCrySong (copie de la struct 52 bytes en RAM audio)
  const dst = CRYSONG_RAM_OFF + i * CRYSONG_SIZE;
  gSoundMemory.copyWithin(dst, CRYSONG_TEMPLATE_RAM_OFF, CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_SIZE);

  wrU32(dst + CRYSONG_OFF_TONE, tone);
  wrU32(dst + CRYSONG_OFF_PART0_PTR, dst + CRYSONG_OFF_PART0);
  wrU32(dst + CRYSONG_OFF_PART1_PTR, dst + CRYSONG_OFF_PART1);
  wrU32(dst + CRYSONG_OFF_GOTO_TARGET, dst + 0x1a); // &gPokemonCrySongs[i].cont

  mplayInfo.ident = ID_NUMBER;

  MPlayStart(mplayInfo, dst); // (struct SongHeader *)&gPokemonCrySongs[i]

  return mplayInfo;
}

export function SetPokemonCryVolume(val: number): void {
  wrU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_VOLUME_VALUE, val & 0x7f);
}

export function SetPokemonCryPanpot(val: number): void {
  wrU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_PAN_VALUE, (val + C_V) & 0x7f);
}

export function SetPokemonCryPitch(val: number): void {
  const b = (val + 0x80) << 16 >> 16;
  const a = (rdU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_TUNE_VALUE2)
    - rdU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_TUNE_VALUE)) & 0xff;
  wrU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_TIE_KEY_VALUE, (b >> 8) & 0x7f);
  wrU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_TUNE_VALUE, (b >> 1) & 0x7f);
  wrU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_TUNE_VALUE2, (a + ((b >> 1) & 0x7f)) & 0x7f);
}

export function SetPokemonCryLength(val: number): void {
  wrU16(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_LENGTH, val);
}

export function SetPokemonCryRelease(val: number): void {
  wrU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_RELEASE_VALUE, val);
}

export function SetPokemonCryProgress(val: number): void {
  wrU32(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_UNK_CMD_0D_PARAM, val);
}

export function IsPokemonCryPlaying(mplayInfo: MusicPlayerInfo): boolean {
  const track = (mplayInfo.tracks as MusicPlayerTrack[])[0];
  return !!(track.chan && track.chan.track === track);
}

export function SetPokemonCryChorus(val: number): void {
  if (val) {
    wrU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_TRACK_COUNT, 2);
    wrU8(
      CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_TUNE_VALUE2,
      (val + rdU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_TUNE_VALUE)) & 0x7f,
    );
  } else {
    wrU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_TRACK_COUNT, 1);
  }
}

export function SetPokemonCryStereo(val: number): void {
  const soundInfo = SOUND_INFO_PTR();
  if (val) {
    // REG_SOUNDCNT_H : routage stéréo A→droite/B→gauche — transport lot mixeur.
    soundInfo.mode = soundInfo.mode & ~1;
  } else {
    soundInfo.mode = soundInfo.mode | 1;
  }
}

export function SetPokemonCryPriority(val: number): void {
  wrU8(CRYSONG_TEMPLATE_RAM_OFF + CRYSONG_OFF_PRIORITY, val);
}

