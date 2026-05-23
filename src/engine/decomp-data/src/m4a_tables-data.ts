// AUTO-GENERATED from src/m4a_tables.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/m4a_tables.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const FINE = 177;
export const GOTO = 178;
export const PATT = 179;
export const PEND = 180;
export const REPT = 181;
export const MEMACC = 185;
export const PRIO = 186;
export const TEMPO = 187;
export const KEYSH = 188;
export const VOICE = 189;
export const VOL = 190;
export const PAN = 191;
export const BEND = 192;
export const BENDR = 193;
export const LFOS = 194;
export const LFODL = 195;
export const MOD = 196;
export const MODT = 197;
export const TUNE = 200;
export const XCMD = 205;
export const xRELE = 7;
export const xIECV = 8;
export const xIECL = 9;
export const xWAIT = 12;
export const EOT = 206;
export const TIE = 207;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const gDeltaEncodingTable: readonly number[] = [0,1,4,9,16,25,36,49,-64,-49,-36,-25,-16,-9,-4,-1] as const;
export const gScaleTable: readonly number[] = [224,225,226,227,228,229,230,231,232,233,234,235,208,209,210,211,212,213,214,215,216,217,218,219,192,193,194,195,196,197,198,199,200,201,202,203,176,177,178,179,180,181,182,183,184,185,186,187,160,161,162,163,164,165,166,167,168,169,170,171,144,145,146,147,148,149,150,151,152,153,154,155,128,129,130,131,132,133,134,135,136,137,138,139,112,113,114,115,116,117,118,119,120,121,122,123,96,97,98,99,100,101,102,103,104,105,106,107,80,81,82,83,84,85,86,87,88,89,90,91,64,65,66,67,68,69,70,71,72,73,74,75,48,49,50,51,52,53,54,55,56,57,58,59,32,33,34,35,36,37,38,39,40,41,42,43,16,17,18,19,20,21,22,23,24,25,26,27,0,1,2,3,4,5,6,7,8,9,10,11] as const;
export const gPcmSamplesPerVBlankTable: readonly number[] = [96,132,176,224,264,304,352,448,528,608,672,704] as const;
export const gCgbScaleTable: readonly number[] = [0,1,2,3,4,5,6,7,8,9,10,11,16,17,18,19,20,21,22,23,24,25,26,27,32,33,34,35,36,37,38,39,40,41,42,43,48,49,50,51,52,53,54,55,56,57,58,59,64,65,66,67,68,69,70,71,72,73,74,75,80,81,82,83,84,85,86,87,88,89,90,91,96,97,98,99,100,101,102,103,104,105,106,107,112,113,114,115,116,117,118,119,120,121,122,123,128,129,130,131,132,133,134,135,136,137,138,139,144,145,146,147,148,149,150,151,152,153,154,155,160,161,162,163,164,165,166,167,168,169,170,171] as const;
export const gCgbFreqTable: readonly number[] = [-2004,-1891,-1785,-1685,-1591,-1501,-1417,-1337,-1262,-1192,-1125,-1062] as const;
export const gNoiseTable: readonly number[] = [215,214,213,212,199,198,197,196,183,182,181,180,167,166,165,164,151,150,149,148,135,134,133,132,119,118,117,116,103,102,101,100,87,86,85,84,71,70,69,68,55,54,53,52,39,38,37,36,23,22,21,20,7,6,5,4,3,2,1,0] as const;
export const gCgb3Vol: readonly number[] = [0,0,96,96,96,96,64,64,64,64,128,128,128,128,32,32] as const;
export const gClockTable: readonly number[] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,28,30,32,36,40,42,44,48,52,54,56,60,64,66,68,72,76,78,80,84,88,90,92,96] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gba/m4a_internal.h',
] as const;
