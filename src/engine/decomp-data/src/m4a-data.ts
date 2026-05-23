// AUTO-GENERATED from src/m4a.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/m4a.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `__attribute__((section(".bss.code")))` */
export const BSS_CODE_EXPR = "__attribute__((section(\".bss.code\")))";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "struct SoundInfo", name: 'gSoundInfo', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct PokemonCrySong", name: 'gPokemonCrySongs', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct MusicPlayerInfo", name: 'gPokemonCryMusicPlayers', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct MusicPlayerInfo", name: 'gMPlayInfo_BGM', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "MPlayFunc", name: 'gMPlayJumpTable', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct CgbChannel", name: 'gCgbChans', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct MusicPlayerInfo", name: 'gMPlayInfo_SE1', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct MusicPlayerInfo", name: 'gMPlayInfo_SE2', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct MusicPlayerTrack", name: 'gPokemonCryTracks', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct PokemonCrySong", name: 'gPokemonCrySong', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gMPlayMemAccArea', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct MusicPlayerInfo", name: 'gMPlayInfo_SE3', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MidiKeyToFreq', ret: "u32", arity: 3, params: "struct WaveData *wav, u8 key, u8 fineAdjust" },
  { name: 'UnusedDummyFunc', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'MPlayContinue', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'MPlayFadeOut', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 speed" },
  { name: 'm4aSoundInit', ret: "void", arity: 0, params: "void" },
  { name: 'm4aSoundMain', ret: "void", arity: 0, params: "void" },
  { name: 'm4aSongNumStart', ret: "void", arity: 1, params: "u16 n" },
  { name: 'm4aSongNumStartOrChange', ret: "void", arity: 1, params: "u16 n" },
  { name: 'm4aSongNumStartOrContinue', ret: "UNUSED", arity: 1, params: "u16 n" },
  { name: 'm4aSongNumStop', ret: "void", arity: 1, params: "u16 n" },
  { name: 'm4aSongNumContinue', ret: "UNUSED", arity: 1, params: "u16 n" },
  { name: 'm4aMPlayAllStop', ret: "void", arity: 0, params: "void" },
  { name: 'm4aMPlayContinue', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'm4aMPlayAllContinue', ret: "void", arity: 0, params: "void" },
  { name: 'm4aMPlayFadeOut', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 speed" },
  { name: 'm4aMPlayFadeOutTemporarily', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 speed" },
  { name: 'm4aMPlayFadeIn', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 speed" },
  { name: 'm4aMPlayImmInit', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'MPlayExtender', ret: "void", arity: 1, params: "struct CgbChannel *cgbChans" },
  { name: 'MusicPlayerJumpTableCopy', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'ClearChain', ret: "void", arity: 1, params: "void *x" },
  { name: 'Clear64byte', ret: "void", arity: 1, params: "void *x" },
  { name: 'SoundInit', ret: "void", arity: 1, params: "struct SoundInfo *soundInfo" },
  { name: 'SampleFreqSet', ret: "void", arity: 1, params: "u32 freq" },
  { name: 'm4aSoundMode', ret: "void", arity: 1, params: "u32 mode" },
  { name: 'SoundClear', ret: "void", arity: 0, params: "void" },
  { name: 'm4aSoundVSyncOff', ret: "void", arity: 0, params: "void" },
  { name: 'm4aSoundVSyncOn', ret: "void", arity: 0, params: "void" },
  { name: 'MPlayOpen', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *tracks, u8 trackCount" },
  { name: 'MPlayStart', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct SongHeader *songHeader" },
  { name: 'm4aMPlayStop', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'FadeOutBody', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'TrkVolPitSet', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'MidiKeyToCgbFreq', ret: "u32", arity: 3, params: "u8 chanNum, u8 key, u8 fineAdjust" },
  { name: 'CgbOscOff', ret: "void", arity: 1, params: "u8 chanNum" },
  { name: 'CgbPan', ret: "int", arity: 1, params: "struct CgbChannel *chan" },
  { name: 'CgbModVol', ret: "void", arity: 1, params: "struct CgbChannel *chan" },
  { name: 'CgbSound', ret: "void", arity: 0, params: "void" },
  { name: 'm4aMPlayTempoControl', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 tempo" },
  { name: 'm4aMPlayVolumeControl', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, u16 volume" },
  { name: 'm4aMPlayPitchControl', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, s16 pitch" },
  { name: 'm4aMPlayPanpotControl', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, s8 pan" },
  { name: 'ClearModM', ret: "void", arity: 1, params: "struct MusicPlayerTrack *track" },
  { name: 'm4aMPlayModDepthSet', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, u8 modDepth" },
  { name: 'm4aMPlayLFOSpeedSet', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, u8 lfoSpeed" },
  { name: 'ply_memacc', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xcmd', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xxx', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xwave', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xtype', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xatta', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xdeca', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xsust', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xrele', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xiecv', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xiecl', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xleng', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xswee', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xwait', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'ply_xcmd_0D', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'DummyFunc', ret: "void", arity: 0, params: "void" },
  { name: 'SetPokemonCryVolume', ret: "void", arity: 1, params: "u8 val" },
  { name: 'SetPokemonCryPanpot', ret: "void", arity: 1, params: "s8 val" },
  { name: 'SetPokemonCryPitch', ret: "void", arity: 1, params: "s16 val" },
  { name: 'SetPokemonCryLength', ret: "void", arity: 1, params: "u16 val" },
  { name: 'SetPokemonCryRelease', ret: "void", arity: 1, params: "u8 val" },
  { name: 'SetPokemonCryProgress', ret: "void", arity: 1, params: "u32 val" },
  { name: 'IsPokemonCryPlaying', ret: "bool32", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'SetPokemonCryChorus', ret: "void", arity: 1, params: "s8 val" },
  { name: 'SetPokemonCryStereo', ret: "void", arity: 1, params: "u32 val" },
  { name: 'SetPokemonCryPriority', ret: "void", arity: 1, params: "u8 val" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'gba/m4a_internal.h',
] as const;
