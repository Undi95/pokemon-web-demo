/**
 * include/gba/m4a_internal.ts — miroir 1:1 `include/gba/m4a_internal.h`.
 *
 * Structures et constantes du moteur son m4a/mp2k (MusicPlayer2000, « Sappy »).
 * Chantier son-m4a (branche dédiée) : moteur INERTE tant que non câblé — le shim
 * WAV historique (harness/runtime/decomp-globals m4aSongNumStart) reste la voie
 * active jusqu'au branchement final.
 *
 * ── Modèle mémoire (adaptation moteur, précédent : byte-VM src/script.ts) ─────
 * Sur GBA, séquences/voicegroups/samples (ROM) et structures du player (RAM)
 * partagent UN espace d'adressage : les pointeurs (cmdPtr, wav, part[], goto)
 * sont des u32. On reproduit ce modèle : `gSoundMemory` (Uint8Array, posé par
 * m4a.ts) est l'unique espace adressé par tous les « pointeurs données » du
 * moteur, qui restent de purs offsets u32 :
 *   [0 .. SOUND_RAM_SIZE)  : « RAM audio » — gPokemonCrySongs y est construit
 *                            (les cris exécutent leur séquence DANS la struct,
 *                            cf. PokemonCrySong du header C, offsets 0x11..0x30),
 *   [SOUND_RAM_SIZE .. )   : image ROM audio extraite de la décomp (song data,
 *                            voicegroups, keysplit tables, samples) aux offsets
 *                            byte-exact de l'extraction.
 * Les structures RUNTIME (SoundInfo, canaux, tracks, players) vivent en objets
 * TS (mêmes noms/champs que le .h) — seules leurs références croisées
 * (track.chan, chan.track, chaînes prev/next) sont des références d'objets.
 */

// ASCII encoding of 'Smsh' in reverse
// This is presumably short for SMASH, the developer of MKS4AGB.
export const ID_NUMBER = 0x68736d53;

export const C_V = 0x40; // center value for PAN, BEND, and TUNE

export const SOUND_MODE_REVERB_VAL = 0x0000007f;
export const SOUND_MODE_REVERB_SET = 0x00000080;
export const SOUND_MODE_MAXCHN = 0x00000f00;
export const SOUND_MODE_MAXCHN_SHIFT = 8;
export const SOUND_MODE_MASVOL = 0x0000f000;
export const SOUND_MODE_MASVOL_SHIFT = 12;
export const SOUND_MODE_FREQ_05734 = 0x00010000;
export const SOUND_MODE_FREQ_07884 = 0x00020000;
export const SOUND_MODE_FREQ_10512 = 0x00030000;
export const SOUND_MODE_FREQ_13379 = 0x00040000;
export const SOUND_MODE_FREQ_15768 = 0x00050000;
export const SOUND_MODE_FREQ_18157 = 0x00060000;
export const SOUND_MODE_FREQ_21024 = 0x00070000;
export const SOUND_MODE_FREQ_26758 = 0x00080000;
export const SOUND_MODE_FREQ_31536 = 0x00090000;
export const SOUND_MODE_FREQ_36314 = 0x000a0000;
export const SOUND_MODE_FREQ_40137 = 0x000b0000;
export const SOUND_MODE_FREQ_42048 = 0x000c0000;
export const SOUND_MODE_FREQ = 0x000f0000;
export const SOUND_MODE_FREQ_SHIFT = 16;
export const SOUND_MODE_DA_BIT_9 = 0x00800000;
export const SOUND_MODE_DA_BIT_8 = 0x00900000;
export const SOUND_MODE_DA_BIT_7 = 0x00a00000;
export const SOUND_MODE_DA_BIT_6 = 0x00b00000;
export const SOUND_MODE_DA_BIT = 0x00b00000;
export const SOUND_MODE_DA_BIT_SHIFT = 20;

/** struct WaveData — en-tête d'un sample DirectSound DANS gSoundMemory.
 *  Layout ROM (16 bytes then samples) : type u16 @0, status u16 @2, freq u32 @4,
 *  loopStart u32 @8, size u32 @12, data s8[] @16. Le moteur lit l'en-tête via
 *  ces offsets ; `data` = offset absolu (wavOff + WAVE_DATA_HEADER_SIZE). */
export const WAVE_DATA_OFF_TYPE = 0;
export const WAVE_DATA_OFF_STATUS = 2;
export const WAVE_DATA_OFF_FREQ = 4;
export const WAVE_DATA_OFF_LOOP_START = 8;
export const WAVE_DATA_OFF_SIZE = 12; // number of samples
export const WAVE_DATA_HEADER_SIZE = 16; // data s8[] starts here

export const TONEDATA_TYPE_CGB = 0x07;
export const TONEDATA_TYPE_FIX = 0x08;
export const TONEDATA_TYPE_SPL = 0x40; // key split
export const TONEDATA_TYPE_RHY = 0x80; // rhythm

export const TONEDATA_P_S_PAN = 0xc0;
export const TONEDATA_P_S_PAM = TONEDATA_P_S_PAN;

/** struct ToneData (12 bytes en ROM : type u8, key u8, length u8, pan_sweep u8,
 *  wav u32, attack u8, decay u8, sustain u8, release u8).
 *  Instance TS mutable — `MusicPlayerTrack.tone` est une COPIE par valeur (1:1
 *  `track->tone = *tone` du .s), d'où copyFrom/readFromMemory. `wav` = offset
 *  u32 dans gSoundMemory (pointeur WaveData ou, en key-split/rhythm, pointeur
 *  vers sous-voicegroup/keySplitTable). */
export class ToneData {
  type = 0;
  key = 0;
  length = 0; // sound length (compatible sound)
  pan_sweep = 0; // pan or sweep (compatible sound ch. 1)
  wav = 0; // u32 offset dans gSoundMemory
  attack = 0;
  decay = 0;
  sustain = 0;
  release = 0;

  copyFrom(o: ToneData): void {
    this.type = o.type; this.key = o.key; this.length = o.length;
    this.pan_sweep = o.pan_sweep; this.wav = o.wav; this.attack = o.attack;
    this.decay = o.decay; this.sustain = o.sustain; this.release = o.release;
  }

  /** Lit un ToneData ROM (12 bytes little-endian) depuis gSoundMemory. */
  readFromMemory(mem: Uint8Array, off: number): void {
    this.type = mem[off];
    this.key = mem[off + 1];
    this.length = mem[off + 2];
    this.pan_sweep = mem[off + 3];
    this.wav = (mem[off + 4] | (mem[off + 5] << 8) | (mem[off + 6] << 16) | (mem[off + 7] << 24)) >>> 0;
    this.attack = mem[off + 8];
    this.decay = mem[off + 9];
    this.sustain = mem[off + 10];
    this.release = mem[off + 11];
  }
}

export const SOUND_CHANNEL_SF_START = 0x80;
export const SOUND_CHANNEL_SF_STOP = 0x40;
export const SOUND_CHANNEL_SF_LOOP = 0x10;
export const SOUND_CHANNEL_SF_IEC = 0x04;
export const SOUND_CHANNEL_SF_ENV = 0x03;
export const SOUND_CHANNEL_SF_ENV_ATTACK = 0x03;
export const SOUND_CHANNEL_SF_ENV_DECAY = 0x02;
export const SOUND_CHANNEL_SF_ENV_SUSTAIN = 0x01;
export const SOUND_CHANNEL_SF_ENV_RELEASE = 0x00;
export const SOUND_CHANNEL_SF_ON =
  SOUND_CHANNEL_SF_START | SOUND_CHANNEL_SF_STOP | SOUND_CHANNEL_SF_IEC | SOUND_CHANNEL_SF_ENV;

export const CGB_CHANNEL_MO_PIT = 0x02;
export const CGB_CHANNEL_MO_VOL = 0x01;

export const CGB_NRx2_ENV_DIR_DEC = 0x00;
export const CGB_NRx2_ENV_DIR_INC = 0x08;

/** struct CgbChannel — canal PSG (GB : 2 pulses, wave, noise). */
export class CgbChannel {
  statusFlags = 0;
  type = 0;
  rightVolume = 0;
  leftVolume = 0;
  attack = 0;
  decay = 0;
  sustain = 0;
  release = 0;
  key = 0;
  envelopeVolume = 0;
  envelopeGoal = 0;
  envelopeCounter = 0;
  pseudoEchoVolume = 0;
  pseudoEchoLength = 0;
  dummy1 = 0;
  dummy2 = 0;
  gateTime = 0;
  midiKey = 0;
  velocity = 0;
  priority = 0;
  rhythmPan = 0;
  dummy3: [number, number, number] = [0, 0, 0];
  dummy5 = 0;
  sustainGoal = 0;
  n4 = 0; // NR[1-4]4 register (initial, length bit)
  pan = 0;
  panMask = 0;
  modify = 0;
  length = 0;
  sweep = 0;
  frequency = 0;
  wavePointer = 0; // u32 offset gSoundMemory — instructs CgbMain to load targeted wave
  currentPointer = 0; // u32 offset gSoundMemory — stores the currently loaded wave
  track: MusicPlayerTrack | null = null;
  prevChannelPointer: SoundChannel | CgbChannel | MusicPlayerTrack | null = null;
  nextChannelPointer: SoundChannel | CgbChannel | null = null;
}

/** struct SoundChannel — canal DirectSound (PCM 8-bit). */
export class SoundChannel {
  statusFlags = 0;
  type = 0;
  rightVolume = 0;
  leftVolume = 0;
  attack = 0;
  decay = 0;
  sustain = 0;
  release = 0;
  key = 0; // midi key as it was translated into final pitch
  envelopeVolume = 0;
  envelopeVolumeRight = 0;
  envelopeVolumeLeft = 0;
  pseudoEchoVolume = 0;
  pseudoEchoLength = 0;
  dummy1 = 0;
  dummy2 = 0;
  gateTime = 0;
  midiKey = 0; // midi key as it was used in the track data
  velocity = 0;
  priority = 0;
  rhythmPan = 0;
  dummy3: [number, number, number] = [0, 0, 0];
  count = 0; // u32
  fw = 0; // u32 — position fractionnaire du mixeur (fixed point)
  frequency = 0; // u32
  wav = 0; // u32 offset gSoundMemory (struct WaveData *)
  currentPointer = 0; // u32 offset gSoundMemory (s8 * dans les samples)
  track: MusicPlayerTrack | null = null;
  prevChannelPointer: SoundChannel | CgbChannel | MusicPlayerTrack | null = null;
  nextChannelPointer: SoundChannel | CgbChannel | null = null;
  dummy4 = 0;
  xpi = 0; // u16
  xpc = 0; // u16
}

export const MAX_DIRECTSOUND_CHANNELS = 12;

export const PCM_DMA_BUF_SIZE = 1584; // size of Direct Sound buffer

export type MPlayFunc = (...args: never[]) => void;
export type PlyNoteFunc = (noteCmd: number, mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack) => void;
export type CgbSoundFunc = () => void;
export type CgbOscOffFunc = (ch: number) => void;
export type MidiKeyToCgbFreqFunc = (chanNumber: number, key: number, fineAdjust: number) => number;
export type ExtVolPitFunc = () => void;
export type MPlayMainFunc = (mplayInfo: MusicPlayerInfo) => void;

/** struct SoundInfo — l'état global du driver (SOUND_INFO_PTR / gSoundInfo). */
export class SoundInfo {
  // This field is normally equal to ID_NUMBER but it is set to other
  // values during sensitive operations for locking purposes.
  ident = 0; // u32

  pcmDmaCounter = 0; // vu8

  // Direct Sound
  reverb = 0;
  maxChans = 0;
  masterVolume = 0;
  freq = 0;

  mode = 0;
  c15 = 0; // periodically counts from 14 down to 0 (15 states)
  pcmDmaPeriod = 0; // number of V-blanks per PCM DMA
  maxLines = 0;
  pcmSamplesPerVBlank = 0; // s32
  pcmFreq = 0; // s32
  divFreq = 0; // s32
  cgbChans: CgbChannel[] | null = null;
  MPlayMainHead: MPlayMainFunc | null = null;
  musicPlayerHead: MusicPlayerInfo | null = null;
  CgbSound: CgbSoundFunc | null = null;
  CgbOscOff: CgbOscOffFunc | null = null;
  MidiKeyToCgbFreq: MidiKeyToCgbFreqFunc | null = null;
  MPlayJumpTable: MPlayFunc[] | null = null;
  plynote: PlyNoteFunc | null = null;
  ExtVolPit: ExtVolPitFunc | null = null;
  chans: SoundChannel[] = Array.from({ length: MAX_DIRECTSOUND_CHANNELS }, () => new SoundChannel());
  /** Double buffer PCM du DMA (s8) — le worklet lira ici. */
  pcmBuffer = new Int8Array(PCM_DMA_BUF_SIZE * 2);
}

/** struct SongHeader (ROM, dans gSoundMemory) : trackCount u8 @0, blockCount u8
 *  @1, priority u8 @2, reverb u8 @3, tone u32 @4 (offset voicegroup),
 *  part u32[] @8 (offsets des pistes). Lu à la volée via ces offsets. */
export const SONG_HEADER_OFF_TRACK_COUNT = 0;
export const SONG_HEADER_OFF_BLOCK_COUNT = 1;
export const SONG_HEADER_OFF_PRIORITY = 2;
export const SONG_HEADER_OFF_REVERB = 3;
export const SONG_HEADER_OFF_TONE = 4;
export const SONG_HEADER_OFF_PART = 8; // + 4*i

/** struct PokemonCrySong — layout EXACT (52 bytes, offsets commentés du .h).
 *  Construit dans la zone « RAM audio » de gSoundMemory : la séquence du cri
 *  s'exécute DANS la structure (cmdPtr → part0/gotoCmd/…), donc elle DOIT être
 *  adressable par offsets — mêmes noms de champs en constantes d'offsets. */
export const CRYSONG_OFF_TRACK_COUNT = 0x00;
export const CRYSONG_OFF_BLOCK_COUNT = 0x01;
export const CRYSONG_OFF_PRIORITY = 0x02;
export const CRYSONG_OFF_REVERB = 0x03;
export const CRYSONG_OFF_TONE = 0x04; // u32 (offset ToneData)
export const CRYSONG_OFF_PART0_PTR = 0x08; // u32 part[0]
export const CRYSONG_OFF_PART1_PTR = 0x0c; // u32 part[1]
export const CRYSONG_OFF_GAP = 0x10;
export const CRYSONG_OFF_PART0 = 0x11; // TUNE
export const CRYSONG_OFF_TUNE_VALUE = 0x12;
export const CRYSONG_OFF_GOTO_CMD = 0x13;
export const CRYSONG_OFF_GOTO_TARGET = 0x14; // u32
export const CRYSONG_OFF_PART1 = 0x18; // TUNE
export const CRYSONG_OFF_TUNE_VALUE2 = 0x19;
export const CRYSONG_OFF_CONT = 0x1a; // u8[2] — part0 jumps here with gotoCmd
export const CRYSONG_OFF_VOL_CMD = 0x1c;
export const CRYSONG_OFF_VOLUME_VALUE = 0x1d;
export const CRYSONG_OFF_UNK_CMD_0D = 0x1e; // u8[2]
export const CRYSONG_OFF_UNK_CMD_0D_PARAM = 0x20; // u32
export const CRYSONG_OFF_XRELE_CMD = 0x24; // u8[2]
export const CRYSONG_OFF_RELEASE_VALUE = 0x26;
export const CRYSONG_OFF_PAN_CMD = 0x27;
export const CRYSONG_OFF_PAN_VALUE = 0x28;
export const CRYSONG_OFF_TIE_CMD = 0x29;
export const CRYSONG_OFF_TIE_KEY_VALUE = 0x2a;
export const CRYSONG_OFF_TIE_VELOCITY_VALUE = 0x2b;
export const CRYSONG_OFF_XWAIT_CMD = 0x2c; // u8[2]
export const CRYSONG_OFF_LENGTH = 0x2e; // u16 — frames to wait
export const CRYSONG_OFF_END = 0x30; // u8[2]
export const CRYSONG_SIZE = 0x34; // sizeof(struct PokemonCrySong) = 52

export const MPT_FLG_VOLSET = 0x01;
export const MPT_FLG_VOLCHG = 0x03;
export const MPT_FLG_PITSET = 0x04;
export const MPT_FLG_PITCHG = 0x0c;
export const MPT_FLG_START = 0x40;
export const MPT_FLG_EXIST = 0x80;

/** struct MusicPlayerTrack — une piste du séquenceur. */
export class MusicPlayerTrack {
  /** Adaptation moteur : ordre de « l'adresse » de la piste. Sur GBA les tracks
   *  sont des statiques dont les ADRESSES ordonnent les priorités de vol de
   *  canal (ply_note : `chan->track > track`). Attribué à la construction —
   *  créer les tracks dans l'ordre de déclaration du link décomp
   *  (music_player_table.inc, puis gPokemonCryTracks de m4a.c). */
  private static _nextAddrOrder = 0;
  readonly addrOrder = MusicPlayerTrack._nextAddrOrder++;

  flags = 0;
  wait = 0;
  patternLevel = 0;
  repN = 0;
  gateTime = 0;
  key = 0;
  velocity = 0;
  runningStatus = 0;
  keyM = 0;
  pitM = 0;
  keyShift = 0; // s8
  keyShiftX = 0; // s8
  tune = 0; // s8
  pitX = 0;
  bend = 0; // s8
  bendRange = 0;
  volMR = 0;
  volML = 0;
  vol = 0;
  volX = 0;
  pan = 0; // s8
  panX = 0; // s8
  modM = 0; // s8
  mod = 0;
  modT = 0;
  lfoSpeed = 0;
  lfoSpeedC = 0;
  lfoDelay = 0;
  lfoDelayC = 0;
  priority = 0;
  pseudoEchoVolume = 0;
  pseudoEchoLength = 0;
  chan: SoundChannel | CgbChannel | null = null;
  tone = new ToneData(); // par VALEUR (copie), 1:1
  timer = 0; // u16
  unk_3C = 0; // u32
  cmdPtr = 0; // u32 offset dans gSoundMemory (u8 *)
  patternStack: [number, number, number] = [0, 0, 0]; // u8 *[3] (offsets)
}

export const MUSICPLAYER_STATUS_TRACK = 0x0000ffff;
export const MUSICPLAYER_STATUS_PAUSE = 0x80000000;

export const MAX_MUSICPLAYER_TRACKS = 16;

export const TRACKS_ALL = 0xffff;

export const TEMPORARY_FADE = 0x0001;
export const FADE_IN = 0x0002;
export const FADE_VOL_MAX = 64;
export const FADE_VOL_SHIFT = 2;

/** struct MusicPlayerInfo — un player (BGM / SE1 / SE2 / SE3-cris). */
export class MusicPlayerInfo {
  songHeader = 0; // u32 offset dans gSoundMemory (struct SongHeader *)
  status = 0; // u32
  trackCount = 0;
  priority = 0;
  cmd = 0;
  unk_B = 0;
  clock = 0; // u32
  memAccArea = 0; // u32 offset (u8 *) — zone memacc (gMPlayMemAccArea)
  tempoD = 0; // u16
  tempoU = 0; // u16
  tempoI = 0; // u16
  tempoC = 0; // u16
  fadeOI = 0; // u16
  fadeOC = 0; // u16
  fadeOV = 0; // u16
  tracks: MusicPlayerTrack[] | null = null;
  tone = 0; // u32 offset (struct ToneData * = voicegroup)
  ident = 0; // u32
  MPlayMainNext: MPlayMainFunc | null = null;
  musicPlayerNext: MusicPlayerInfo | null = null;
}

/** struct MusicPlayer — entrée de gMPlayTable. */
export class MusicPlayer {
  constructor(
    public info: MusicPlayerInfo,
    public track: MusicPlayerTrack[],
    public numTracks: number,
    public unk_A: number,
  ) {}
}

/** struct Song — entrée de gSongTable : header (offset), ms/me = player index
 *  music/effect. */
export class Song {
  constructor(
    public header: number, // u32 offset dans gSoundMemory
    public ms: number, // u16
    public me: number, // u16
  ) {}
}

export const MAX_POKEMON_CRIES = 2;
