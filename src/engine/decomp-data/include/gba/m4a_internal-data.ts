// AUTO-GENERATED from include/gba/m4a_internal.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/gba/m4a_internal.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const ID_NUMBER = 1752395091;
export const C_V = 64;
export const SOUND_MODE_REVERB_VAL = 127;
export const SOUND_MODE_REVERB_SET = 128;
export const SOUND_MODE_MAXCHN = 3840;
export const SOUND_MODE_MAXCHN_SHIFT = 8;
export const SOUND_MODE_MASVOL = 61440;
export const SOUND_MODE_MASVOL_SHIFT = 12;
export const SOUND_MODE_FREQ_05734 = 65536;
export const SOUND_MODE_FREQ_07884 = 131072;
export const SOUND_MODE_FREQ_10512 = 196608;
export const SOUND_MODE_FREQ_13379 = 262144;
export const SOUND_MODE_FREQ_15768 = 327680;
export const SOUND_MODE_FREQ_18157 = 393216;
export const SOUND_MODE_FREQ_21024 = 458752;
export const SOUND_MODE_FREQ_26758 = 524288;
export const SOUND_MODE_FREQ_31536 = 589824;
export const SOUND_MODE_FREQ_36314 = 655360;
export const SOUND_MODE_FREQ_40137 = 720896;
export const SOUND_MODE_FREQ_42048 = 786432;
export const SOUND_MODE_FREQ = 983040;
export const SOUND_MODE_FREQ_SHIFT = 16;
export const SOUND_MODE_DA_BIT_9 = 8388608;
export const SOUND_MODE_DA_BIT_8 = 9437184;
export const SOUND_MODE_DA_BIT_7 = 10485760;
export const SOUND_MODE_DA_BIT_6 = 11534336;
export const SOUND_MODE_DA_BIT = 11534336;
export const SOUND_MODE_DA_BIT_SHIFT = 20;
export const TONEDATA_TYPE_CGB = 7;
export const TONEDATA_TYPE_FIX = 8;
export const TONEDATA_TYPE_SPL = 64;
export const TONEDATA_TYPE_RHY = 128;
export const TONEDATA_P_S_PAN = 192;
/** Raw expr: `TONEDATA_P_S_PAN` */
export const TONEDATA_P_S_PAM_EXPR = "TONEDATA_P_S_PAN";
export const SOUND_CHANNEL_SF_START = 128;
export const SOUND_CHANNEL_SF_STOP = 64;
export const SOUND_CHANNEL_SF_LOOP = 16;
export const SOUND_CHANNEL_SF_IEC = 4;
export const SOUND_CHANNEL_SF_ENV = 3;
export const SOUND_CHANNEL_SF_ENV_ATTACK = 3;
export const SOUND_CHANNEL_SF_ENV_DECAY = 2;
export const SOUND_CHANNEL_SF_ENV_SUSTAIN = 1;
export const SOUND_CHANNEL_SF_ENV_RELEASE = 0;
/** Raw expr: `(SOUND_CHANNEL_SF_START | SOUND_CHANNEL_SF_STOP | SOUND_CHANNEL_SF_IEC | SOUND_CHANNEL_SF_ENV)` */
export const SOUND_CHANNEL_SF_ON_EXPR = "(SOUND_CHANNEL_SF_START | SOUND_CHANNEL_SF_STOP | SOUND_CHANNEL_SF_IEC | SOUND_CHANNEL_SF_ENV)";
export const CGB_CHANNEL_MO_PIT = 2;
export const CGB_CHANNEL_MO_VOL = 1;
export const CGB_NRx2_ENV_DIR_DEC = 0;
export const CGB_NRx2_ENV_DIR_INC = 8;
export const MAX_DIRECTSOUND_CHANNELS = 12;
export const PCM_DMA_BUF_SIZE = 1584;
export const MPT_FLG_VOLSET = 1;
export const MPT_FLG_VOLCHG = 3;
export const MPT_FLG_PITSET = 4;
export const MPT_FLG_PITCHG = 12;
export const MPT_FLG_START = 64;
export const MPT_FLG_EXIST = 128;
export const MUSICPLAYER_STATUS_TRACK = 65535;
export const MUSICPLAYER_STATUS_PAUSE = 2147483648;
export const MAX_MUSICPLAYER_TRACKS = 16;
export const TRACKS_ALL = 65535;
export const TEMPORARY_FADE = 1;
export const FADE_IN = 2;
export const FADE_VOL_MAX = 64;
export const FADE_VOL_SHIFT = 2;
export const MAX_POKEMON_CRIES = 2;
/** Raw expr: `((u16)gNumMusicPlayers)` */
export const NUM_MUSIC_PLAYERS_EXPR = "((u16)gNumMusicPlayers)";
/** Raw expr: `((u32)gMaxLines)` */
export const MAX_LINES_EXPR = "((u32)gMaxLines)";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'umul3232H32', ret: "u32", arity: 2, params: "u32 multiplier, u32 multiplicand" },
  { name: 'SoundMain', ret: "void", arity: 0, params: "void" },
  { name: 'SoundMainBTM', ret: "void", arity: 0, params: "void" },
  { name: 'TrackStop', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'MPlayMain', ret: "void", arity: 1, params: "struct MusicPlayerInfo *" },
  { name: 'RealClearChain', ret: "void", arity: 1, params: "void *x" },
  { name: 'MPlayContinue', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'MPlayStart', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct SongHeader *songHeader" },
  { name: 'm4aMPlayStop', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'FadeOutBody', ret: "void", arity: 1, params: "struct MusicPlayerInfo *mplayInfo" },
  { name: 'TrkVolPitSet', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track" },
  { name: 'MPlayFadeOut', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 speed" },
  { name: 'ClearChain', ret: "void", arity: 1, params: "void *x" },
  { name: 'Clear64byte', ret: "void", arity: 1, params: "void *addr" },
  { name: 'SoundInit', ret: "void", arity: 1, params: "struct SoundInfo *soundInfo" },
  { name: 'MPlayExtender', ret: "void", arity: 1, params: "struct CgbChannel *cgbChans" },
  { name: 'm4aSoundMode', ret: "void", arity: 1, params: "u32 mode" },
  { name: 'MPlayOpen', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *tracks, u8 trackCount" },
  { name: 'CgbSound', ret: "void", arity: 0, params: "void" },
  { name: 'CgbOscOff', ret: "void", arity: 1, params: "u8" },
  { name: 'CgbModVol', ret: "void", arity: 1, params: "struct CgbChannel *chan" },
  { name: 'MidiKeyToCgbFreq', ret: "u32", arity: 3, params: "u8, u8, u8" },
  { name: 'DummyFunc', ret: "void", arity: 0, params: "void" },
  { name: 'MPlayJumpTableCopy', ret: "void", arity: 1, params: "MPlayFunc *mplayJumpTable" },
  { name: 'SampleFreqSet', ret: "void", arity: 1, params: "u32 freq" },
  { name: 'm4aSoundVSyncOn', ret: "void", arity: 0, params: "void" },
  { name: 'm4aSoundVSyncOff', ret: "void", arity: 0, params: "void" },
  { name: 'm4aMPlayTempoControl', ret: "void", arity: 2, params: "struct MusicPlayerInfo *mplayInfo, u16 tempo" },
  { name: 'm4aMPlayVolumeControl', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, u16 volume" },
  { name: 'm4aMPlayPitchControl', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, s16 pitch" },
  { name: 'm4aMPlayPanpotControl', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, s8 pan" },
  { name: 'ClearModM', ret: "void", arity: 1, params: "struct MusicPlayerTrack *track" },
  { name: 'm4aMPlayModDepthSet', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, u8 modDepth" },
  { name: 'm4aMPlayLFOSpeedSet', ret: "void", arity: 3, params: "struct MusicPlayerInfo *mplayInfo, u16 trackBits, u8 lfoSpeed" },
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
  { name: 'ply_fine', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_goto', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_patt', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_pend', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_rept', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_memacc', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_prio', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_tempo', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_keysh', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_voice', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_vol', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_pan', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_bend', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_bendr', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_lfos', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_lfodl', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_mod', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_modt', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_tune', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_port', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xcmd', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_endtie', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_note', ret: "void", arity: 3, params: "u32 note_cmd, struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xxx', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xwave', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xtype', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xatta', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xdeca', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xsust', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xrele', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xiecv', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xiecl', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xleng', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xswee', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xwait', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
  { name: 'ply_xcmd_0D', ret: "void", arity: 2, params: "struct MusicPlayerInfo *, struct MusicPlayerTrack *" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gba/gba.h',
] as const;
