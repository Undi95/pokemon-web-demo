/**
 * decomp-globals.ts — helpers globaux mimés depuis le décomp Pokemon Emerald.
 *
 * Le code transpilé `intro-callbacks-auto.ts` utilise des symbols à scope GLOBAL
 * (= équivalent C des fonctions extern) : `LoadPalette`, `LZ77UnCompVram`,
 * `DmaClear16`, `CpuFill16`, etc. Ces symbols pointent vers le DecompRuntime
 * singleton actif (= notre engine GBA + cache asset).
 *
 * USAGE :
 *   - GameScene.create() :
 *       setGlobalRuntime(this.rt);
 *       await preloadIntroAssets();   // populate assetCache
 *       this.rt.CreateTask(Task_Scene1_Load, 0);
 *   - intro-callbacks-auto.ts :
 *       import { LoadPalette, LZ77UnCompVram, DmaClear16, ... } from '../../../decomp-globals';
 *
 * ASSET CACHE : les LZ77UnCompVram/LoadPalette du décomp sont synchrones
 * (data en ROM). Notre engine = data dans des PNGs/binaires fetchés async.
 * Solution : preload async de tous les assets nécessaires AVANT de lancer la
 * Task qui les utilise. Pendant l'exécution, les helpers font lookup-cache + write sync.
 *
 * 1:1 décomp src/decompress.c (LZ77UnCompVram), src/palette.c (LoadPalette),
 * include/gba/macro.h (DmaClear16 macro), src/main.c (CpuFill16/32).
 */
import type { DecompRuntime } from './decomp-runtime';
import { BG_PLTT_ID, OBJ_PLTT_ID, BG_CHAR_ADDR, BG_SCREEN_ADDR } from './decomp-runtime';

// ─── Singleton runtime + asset cache ──────────────────────────────────────────

let _rt: DecompRuntime | null = null;

/** Set le runtime actif. À call dans GameScene.create() AVANT toute Task. */
export function setGlobalRuntime(rt: DecompRuntime): void {
  _rt = rt;
}

/** Récupère le runtime actif. Throw si pas init (= bug : on a oublié setGlobalRuntime). */
function rt(): DecompRuntime {
  if (!_rt) throw new Error('decomp-globals: runtime not set, call setGlobalRuntime() first');
  return _rt;
}

/** Public getter pour le runtime (utilisé par les helpers transcrits dans
 *  intro-callbacks-auto.ts qui n'ont plus `rt` en premier arg). */
export function getRuntime(): DecompRuntime {
  return rt();
}

/** Cache asset preloaded : symbol décomp (e.g. 'sIntro1Bg_Gfx') → data buffer typed.
 *  Populé par intro-asset-loader avant de lancer les Tasks. Les helpers
 *  LZ77UnCompVram/LoadPalette font lookup ici. */
export const assetCache = new Map<string, Uint8Array | Uint16Array>();

/** Compteur LZ77UnCompVram pour debug : combien de fois chaque symbol a été appelé,
 *  combien d'entries ont été copiées, vers quel bgIdx. Inspectable via window.debug. */
export const lz77Trace: Array<{ symbol: string; dest: number; dataLen: number; bgIdx?: number; copied?: number; reason?: string }> = [];

/** Récupère un asset depuis le cache, throw si manquant (= preload incomplet). */
function getAsset(symbol: string): Uint8Array | Uint16Array {
  const data = assetCache.get(symbol);
  if (!data) throw new Error(`decomp-globals: asset '${symbol}' not in cache (forgot to preload?)`);
  return data;
}

// ─── BG/VRAM constants (1:1 décomp include/gba/types.h + io_reg.h) ────────────
/** 1:1 décomp BG_SCREEN_SIZE = 0x800 bytes (= 1024 entries u16). */
export const BG_SCREEN_SIZE = 0x800;
/** 1:1 décomp PLTT_SIZE = 0x400 bytes (= 256 colors × 2). */
export const PLTT_SIZE = 0x400;
/** 1:1 décomp VRAM_SIZE = 0x18000 bytes. */
export const VRAM_SIZE = 0x18000;

// ─── Constants utilisées par intro-callbacks-auto sans être importées ─────────
// (résolues par le constant resolver du transpileur, mais redéclarées ici pour
//  cohérence + accès direct par decomp-globals.ts)
export const PALETTES_ALL = 0xFFFFFFFF;

// ─── Re-export complet decomp-runtime pour import en bloc côté bodyC ─────────
// Tous les REG_OFFSET_*, BGCNT_*, DISPCNT_*, BLDCNT_*, BG_PLTT_ID, etc.
// utilisés par les Tasks transcrites depuis le décomp.
export {
  BG_PLTT_ID, OBJ_PLTT_ID, BG_CHAR_ADDR, BG_SCREEN_ADDR,
  DISPLAY_WIDTH, DISPLAY_HEIGHT,
  // REG_OFFSET_* (1:1 décomp include/gba/io_reg.h)
  REG_OFFSET_DISPCNT,
  REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_BG3CNT,
  REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS,
  REG_OFFSET_BG3HOFS, REG_OFFSET_BG3VOFS,
  REG_OFFSET_WIN0H, REG_OFFSET_WIN1H, REG_OFFSET_WIN0V, REG_OFFSET_WIN1V,
  REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY,
  // BGCNT_*
  BGCNT_PRIORITY, BGCNT_CHARBASE, BGCNT_SCREENBASE,
  BGCNT_16COLOR, BGCNT_256COLOR,
  BGCNT_TXT256x256, BGCNT_TXT512x256, BGCNT_TXT256x512, BGCNT_TXT512x512,
  BGCNT_AFF128x128, BGCNT_AFF256x256, BGCNT_AFF512x512, BGCNT_AFF1024x1024,
  // DISPCNT_*
  DISPCNT_MODE_0, DISPCNT_MODE_1, DISPCNT_MODE_2,
  DISPCNT_OBJ_1D_MAP,
  DISPCNT_BG0_ON, DISPCNT_BG1_ON, DISPCNT_BG2_ON, DISPCNT_BG3_ON,
  DISPCNT_OBJ_ON, DISPCNT_WIN0_ON, DISPCNT_BG_ALL_ON,
  // BLDCNT_*
  BLDCNT_TGT1_BG0, BLDCNT_TGT1_BG1, BLDCNT_TGT1_BG2, BLDCNT_TGT1_BG3,
  BLDCNT_TGT1_OBJ, BLDCNT_TGT1_BD,
  BLDCNT_EFFECT_NONE, BLDCNT_EFFECT_BLEND, BLDCNT_EFFECT_LIGHTEN, BLDCNT_EFFECT_DARKEN,
  BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3,
  BLDCNT_TGT2_OBJ, BLDCNT_TGT2_BD,
} from './decomp-runtime';

// ─── State machine intro globals (1:1 décomp EWRAM_DATA src/intro.c) ──────────
/** EWRAM_DATA u16 sIntroCharacterGender — set par Task_Scene1_Load via Random()%GENDER_COUNT. */
export let sIntroCharacterGender = 0;
export function setIntroCharacterGender(v: number): void { sIntroCharacterGender = v; }

/** EWRAM_DATA u16 sFlygonYOffset — utilisé par SpriteCB_FlygonSilhouette. */
export let sFlygonYOffset = 0;
export function setFlygonYOffset(v: number): void { sFlygonYOffset = v; }

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS GLOBAUX (= équivalents fonctions extern décomp)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `LZ77UnCompVram(src, dest)` — décompresse un blob LZ77 dans VRAM.
 *  Notre version : src est le SYMBOL décomp (e.g. sIntro1Bg_Gfx) → lookup cache.
 *  dest est l'address VRAM absolue (BG_CHAR_ADDR(n) ou BG_SCREEN_ADDR(n)).
 *
 *  Sémantique GBA : VRAM = 0x06000000-0x06017FFF. Les 4 BG charBase et 32 screenBase
 *  partagent cet espace. On dispatch :
 *    - addr 0x00000-0x0FFFF → bg.vram (charBase 0-3, chars indexed)
 *    - addr 0x10000-0x17FFF → bg.tilemap (screenBase 0-31)
 *    - mais en pratique, addr ≤ 0x4000 = char data BG, ≥ 0x4000 = screen data
 *
 *  Notre routing simplifié : on assume que dest indique le bg index via
 *  l'adresse calculée. BG_CHAR_ADDR(n) = n*0x4000 → BG n, charBase = n*4.
 *  BG_SCREEN_ADDR(n) = n*0x800 → screen n. */
export function LZ77UnCompVram(srcSymbol: string, destAddr: number): void {
  const data = getAsset(srcSymbol);
  const r = rt();
  const traceEntry: { symbol: string; dest: number; dataLen: number; copied?: number; reason?: string } = {
    symbol: srcSymbol, dest: destAddr, dataLen: data.byteLength,
  };
  lz77Trace.push(traceEntry);
  // 1:1 GBA hardware : VRAM est UN tableau partagé 96KB (0x06000000-0x06017FFF).
  // BG_CHAR_ADDR(n) = n*0x4000, BG_SCREEN_ADDR(n) = n*0x800 sont des offsets
  // dans cette VRAM unifiée. Chez nous (Phase 1 Action 2), `r.gba.vram` EST cette
  // VRAM unifiée. On écrit directement à `destAddr` modulo VRAM_SIZE.
  //
  // BG charBase et mapBase pointent dans cette même VRAM ; les BGs avec mêmes
  // charBase/mapBase voient les mêmes data automatiquement (= 1:1 hardware
  // shared addressing). Plus aucun routage par suffix de symbol.
  const bytes = data instanceof Uint16Array
    ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    : data;
  const vram = r.gba.vram;
  // VRAM = 96KB = 0x18000. C'est PAS une power-of-2 → utiliser modulo, PAS un
  // AND mask (le AND mask suppose power-of-2, sinon `0x8000 & 0x17FFF = 0`).
  const offset = destAddr % vram.byteLength;
  const copySize = Math.min(bytes.length, vram.byteLength - offset);
  if (copySize > 0) {
    vram.set(bytes.subarray(0, copySize), offset);
    traceEntry.copied = copySize;
    traceEntry.reason = `vram[0x${offset.toString(16)}..0x${(offset + copySize).toString(16)}]`;
  } else {
    traceEntry.reason = `dest 0x${offset.toString(16)} out of VRAM range, no-op`;
  }
}

/** 1:1 décomp `LoadPalette(src, offset, size)` — copy palette dans gPlttBufferFaded.
 *  src = SYMBOL décomp string (e.g. sIntro1Bg_Pal) → lookup cache.
 *  offset = flat palette index (BG_PLTT_ID(n) = n*16 ou OBJ_PLTT_ID(n) = n*16 + 256).
 *  sizeBytes : IGNORÉ quand srcSymbol est une string (le bodyC transcrit a un bug
 *  `(symbol)?.length` qui retourne la longueur de la STRING name au lieu du
 *  sizeof(buffer) attendu). On utilise toujours la vraie taille du buffer cache. */
export function LoadPalette(srcSymbol: string | Uint16Array, offset: number, sizeBytes: number): void {
  const data = typeof srcSymbol === 'string' ? getAsset(srcSymbol) : srcSymbol;
  const u16 = data instanceof Uint16Array ? data : new Uint16Array(data.buffer, data.byteOffset, Math.floor(data.byteLength / 2));
  // Si srcSymbol est une string : on ignore sizeBytes (artefact du transpileur)
  // et on utilise la vraie taille du buffer cache.
  const numEntries = typeof srcSymbol === 'string'
    ? u16.length
    : Math.floor(sizeBytes / 2);
  const r = rt();
  // offset < 256 = BG palette, ≥ 256 = OBJ palette
  if (offset < 256) {
    r.gba.palette.loadBgRange(offset, u16.subarray(0, numEntries));
  } else {
    r.gba.palette.loadObjRange(offset - 256, u16.subarray(0, numEntries));
  }
}

/** 1:1 décomp `DmaClear16(channel, dest, size)` — clear memory via DMA.
 *
 *  Phase 1 Action 2 : maintenant que VRAM est unifié (rt.gba.vram 96KB), on
 *  peut clear directement à `destAddr`. Plus de risque d'écraser le tilemap
 *  qu'on vient de remplir (ancien bug 0b avec vram séparés par BG).
 *
 *  Sémantique : DMA clear = écrire 0 dans `[destAddr..destAddr+sizeBytes]`. */
export function DmaClear16(_channel: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  const vram = r.gba.vram;
  const offset = destAddr & (vram.byteLength - 1);
  const clearSize = Math.min(sizeBytes, vram.byteLength - offset);
  if (clearSize > 0) {
    vram.fill(0, offset, offset + clearSize);
  }
}

/** 1:1 décomp `CpuFill16(value, dest, size)` — fill 16-bit. */
export function CpuFill16(_value: number, _destAddr: number, _sizeBytes: number): void {
  // Notre engine : pas d'address-based memory model, on no-op pour l'instant
}

/** 1:1 décomp `CpuFill32(value, dest, size)` — fill 32-bit. */
export function CpuFill32(_value: number, _destAddr: number, _sizeBytes: number): void {
  // Idem CpuFill16
}

/** 1:1 décomp src/intro_credits_graphics.c:729 — charge BG2/BG3 Scene 2.
 *  scenery=1 (toujours appelé avec 1) : trees scenery (= bike ride forest).
 *  scenery=0 : clouds (= jamais utilisé dans intro Pokemon Emerald).
 *
 *  Layout VRAM Scene 2 :
 *    - sGrass_Gfx → BG_CHAR_ADDR(1) = 0x4000 (BG3 ground char data)
 *    - sGrass_Tilemap → BG_SCREEN_ADDR(15) = 0x7800 (BG3 tilemap)
 *    - sGrass_Pal → BG palette bank 15
 *    - sTrees_Gfx → VRAM = 0 (BG2 trees char data, partagé avec BG0/1 charBase 0)
 *    - sTrees_Tilemap → BG_SCREEN_ADDR(6) = 0x3000 (BG2 tilemap)
 *    - sTrees_Pal → BG palette bank 0 */
export function LoadIntroPart2Graphics(scenery: number): void {
  // Ground (BG3) — toujours chargé, peu importe scenery
  LZ77UnCompVram(sGrass_Gfx, 0x4000);
  LZ77UnCompVram(sGrass_Tilemap, 0x7800);
  LoadPalette(sGrass_Pal, 15 * 16, 32);  // BG palette bank 15 = flat idx 240
  if (scenery === 1) {
    // Trees + small trees sprites (= bike ride forest scenery)
    LZ77UnCompVram(sTrees_Gfx, 0);
    LZ77UnCompVram(sTrees_Tilemap, 0x3000);
    LoadPalette(sTrees_Pal, 0, 32);  // BG palette bank 0 = flat idx 0
    // TODO LoadCompressedSpriteSheet(sSpriteSheet_TreesSmall) + LoadPalette(sTreesSmall_Pal, OBJ)
    // TODO CreateTreeSprites() — Phase 2 (= sprite OAM trees animés)
  }
  // gIntroCredits_MovingSceneryState = INTROCRED_SCENERY_NORMAL est set par
  // le bodyC Task_Scene2_Load directement (var locale module).
  // gReservedSpritePaletteCount = 8 → no-op chez nous (= alloc OBJ palette).
}

/** 1:1 décomp `FreeAllSpritePalettes` — Phase 0b stub no-op. */
export function FreeAllSpritePalettes(): void {
  // TODO Phase 0c : reset paletteTagToSlot mapping
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 STUBS (Phase 0b minimum viable — no-op pour ne pas crasher)
// TODO Phase 0c : implementer 1:1 décomp src/intro.c
// ═══════════════════════════════════════════════════════════════════════════════

/** Stub : data sheets avec .length=N pour les boucles. Le bodyC fait
 *  `for (i=0; i < (sSpriteSheet_RunningPokemon)?.length - 1; i++) LoadCompressedSpriteSheet(...)` */
export const sSpriteSheet_RunningPokemon: ReadonlyArray<unknown> = [];
export const sAnims_PlayerBicycle: ReadonlyArray<unknown> = [];

/** 1:1 décomp src/intro_credits_graphics.c:1118 — crée Brendan + bicycle sprites,
 *  link les via sPlayerSpriteId pour que SpriteCB_Bicycle synchronise position. */
export function CreateIntroBrendanSprite(x: number, y: number): number {
  const r = rt();
  const playerSpriteId = r.CreateSpriteFromTemplate('sSpriteTemplate_Brendan', x, y);
  const bicycleSpriteId = r.CreateSpriteFromTemplate('sSpriteTemplate_BrendanBicycle', x, y + 8);
  // 1:1 décomp : `gSprites[bicycleSpriteId].sPlayerSpriteId = playerSpriteId;`
  // `sPlayerSpriteId = data[0]` (alias bicycle data field)
  const bicycle = r.getSprite(bicycleSpriteId);
  if (bicycle) bicycle.data[0] = playerSpriteId;
  return playerSpriteId;
}

/** 1:1 décomp src/intro_credits_graphics.c:1126 — crée May + bicycle sprites. */
export function CreateIntroMaySprite(x: number, y: number): number {
  const r = rt();
  const playerSpriteId = r.CreateSpriteFromTemplate('sSpriteTemplate_May', x, y);
  const bicycleSpriteId = r.CreateSpriteFromTemplate('sSpriteTemplate_MayBicycle', x, y + 8);
  const bicycle = r.getSprite(bicycleSpriteId);
  if (bicycle) bicycle.data[0] = playerSpriteId;
  return playerSpriteId;
}

/** 1:1 décomp src/intro_credits_graphics.c:1162 — crée Flygon en 2 halves
 *  (left/right) car sprite trop grand pour 1 OAM (= 64x64 max). Right half
 *  utilise StartSpriteAnim 1 + SpriteCB_FlygonRightHalf pour sync avec left. */
export function CreateIntroFlygonSprite(x: number, y: number): number {
  const r = rt();
  const leftSpriteId = r.CreateSpriteFromTemplate('sSpriteTemplate_FlygonLatias', x - 32, y);
  const rightSpriteId = r.CreateSpriteFromTemplate('sSpriteTemplate_FlygonLatias', x + 32, y);
  const right = r.getSprite(rightSpriteId);
  if (right) right.data[0] = leftSpriteId;  // sLeftSpriteId = data[0]
  r.StartSpriteAnim(rightSpriteId, 1);
  // SpriteCB_FlygonRightHalf : transcrit dans intro_credits-callbacks-auto si dispo.
  // Pour l'instant on attache pas de callback (= TODO Phase 2 audit runtime).
  return leftSpriteId;
}

/** 1:1 décomp src/intro_credits_graphics.c:924 — crée le Task qui anime les BG
 *  parallax pendant Scene 2 bike ride. Phase 0c stub : retourne un Task ID
 *  no-op (pas d'animation BG scroll). À remplacer par implementation 1:1. */
export function CreateBicycleBgAnimationTask(_mode: number, _bg1Speed: number, _bg2Speed: number, _bg3Speed: number): number {
  // TODO Phase 1 Action 4 #3 (couplé avec LoadIntroPart2Graphics)
  return rt().CreateTask(() => { /* no-op stub */ }, 0);
}

/** 1:1 décomp src/intro_credits_graphics.c:761 — setup BGCNT pour Scene 2
 *  (priority + char/screen base + screen size). Phase 0c stub : no-op
 *  (= la Task_Scene2_Load setup déjà BGCNT directement). À remplacer si
 *  LoadIntroPart2Graphics démontre que c'est nécessaire. */
export function SetIntroPart2BgCnt(_scenery: number): void { /* TODO Phase 1 #3 */ }
/** 1:1 décomp src/intro_credits_graphics.c:989 — cycle palette scenery couleurs
 *  toutes les 4 frames pour effet shimmer (sun reflection on grass).
 *
 *  mode=0 (default) : swap palette colors 9↔10 du BG bank 0.
 *  mode=2 : swap RGB(7,9,15)↔RGB(21,20,0) puis RGB(28,24,0)↔RGB(7,9,15) sur
 *           palette colors 12+13.
 *  mode=1 : no-op (= pause cycling).
 *
 *  Le décomp utilise `gMain.vblankCounter1` qu'on simule via gIntroFrameCounter. */
export function CycleSceneryPalette(mode: number): void {
  const r = rt();
  const fc = r.gIntroFrameCounter;
  if (mode === 1) return;
  if ((fc & 3) !== 0 || r.gPaletteFade.active) return;

  if (mode === 2) {
    let x: number, y: number;
    if (fc & 4) {
      x = (7) | ((9) << 5) | ((15) << 10);   // RGB(7,9,15)
      y = (21) | ((20) << 5) | ((0) << 10);  // RGB(21,20,0)
    } else {
      x = (28) | ((24) << 5) | ((0) << 10);  // RGB(28,24,0)
      y = (7) | ((9) << 5) | ((15) << 10);   // RGB(7,9,15)
    }
    r.gba.palette.loadBgRange(0 + 12, new Uint16Array([x]));
    r.gba.palette.loadBgRange(0 + 13, new Uint16Array([y]));
  } else {
    // mode=0 default : swap palette colors 9 et 10
    let x: number, y: number;
    if (fc & 4) {
      x = r.gPlttBufferUnfaded.get(0 + 9);
      y = r.gPlttBufferUnfaded.get(0 + 10);
    } else {
      x = r.gPlttBufferUnfaded.get(0 + 10);
      y = r.gPlttBufferUnfaded.get(0 + 9);
    }
    r.gba.palette.loadBgRange(0 + 9, new Uint16Array([x]));
    r.gba.palette.loadBgRange(0 + 10, new Uint16Array([y]));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO M4A WIRING (Phase 1 Action 4 #1)
// 1:1 décomp `m4aSongNumStart(MUS_X)` → playMidiLoop('/decomp/em/music/mus_x.mid')
// Mapping song ID → URL via include/constants/songs.h.
// ═══════════════════════════════════════════════════════════════════════════════

/** Constants 1:1 décomp `include/constants/songs.h`. Note : on n'a besoin que des
 *  songs utilisés par les Tasks transcrites (intro, title, credits, battle, etc.).
 *  À étendre au fur et à mesure. */
export const MUS_INTRO = 414;          // = MUS_DEMO1 (mus_intro.mid)
export const MUS_INTRO_BATTLE = 442;   // = MUS_T_BATTLE (mus_intro_battle.mid)

/** Mapping song ID → song NAME (= filename sans .mid). */
const SONG_ID_TO_NAME: Record<number, string> = {
  [MUS_INTRO]: 'mus_intro',
  [MUS_INTRO_BATTLE]: 'mus_intro_battle',
};

// State du M4A engine maison (notre `src/engine/m4a/`). Init lazy via m4aPrime().
let _m4aPrimed = false;
type VgLookupFn = (name: string) => unknown;
let _vgLookup: VgLookupFn | null = null;
let _songVoicegroups: Record<string, string> | null = null;

/** Init notre M4A engine maison (= NOTRE moteur 1:1 décomp, PAS SpessaSynth).
 *  Lazy-init au premier m4aSongNumStart. Idempotent. */
async function m4aPrime(): Promise<void> {
  if (_m4aPrimed) return;
  const { getAudioContext } = await import('./m4a/audio-context');
  const { loadSampleManifest } = await import('./m4a/sample-loader');
  const { lookupVoicegroup } = await import('./m4a/voicegroups-data/_all-voicegroups-index');
  // Init AudioContext (requires user gesture — déjà eu via click TestGba→GameScene)
  getAudioContext();
  await loadSampleManifest();
  // Load song → voicegroup mapping (extracted du décomp)
  const resp = await fetch('/decomp/em/music/song-voicegroups.json');
  _songVoicegroups = await resp.json() as Record<string, string>;
  _vgLookup = lookupVoicegroup as VgLookupFn;
  _m4aPrimed = true;
  console.log('[decomp-globals] M4A engine maison ready (1:1 décomp, pas SpessaSynth)');
}

/** 1:1 décomp `m4aSongNumStart(songId)` — démarre une song en boucle via NOTRE
 *  M4A engine maison (`src/engine/m4a/`). Pas SpessaSynth ni emerald.sf2.
 *  Async fire-and-forget : await m4aPrime() puis playSong().
 *  Le voicegroup est résolu via `song-voicegroups.json` (extracted décomp). */
export function m4aSongNumStart(songId: number): void {
  const songName = SONG_ID_TO_NAME[songId];
  if (!songName) {
    console.warn(`[m4aSongNumStart] song ID ${songId} not mapped, skip`);
    return;
  }
  void (async () => {
    try {
      await m4aPrime();
      const url = `/decomp/em/music/${songName}.mid`;
      const vgName = _songVoicegroups![songName];
      if (!vgName) {
        console.warn(`[m4aSongNumStart] no voicegroup mapping for ${songName}`);
        return;
      }
      const voicegroup = _vgLookup!(vgName);
      if (!voicegroup) {
        console.warn(`[m4aSongNumStart] voicegroup '${vgName}' not found in lookup`);
        return;
      }
      const { loadMidi, playSong, stopSong } = await import('./m4a/player');
      stopSong();  // arrête song précédente si playing
      const midi = await loadMidi(url);
      // playSong(midi, voicegroup, vgLookup, loop). loop=true pour BGM.
      await (playSong as (m: unknown, vg: unknown, lookup: VgLookupFn, loop: boolean) => Promise<void>)(
        midi, voicegroup, _vgLookup!, true,
      );
      console.log(`[m4aSongNumStart] playing ${url} via M4A maison (vg=${vgName})`);
    } catch (e) {
      console.error('[m4aSongNumStart] failed:', e);
    }
  })();
}

/** 1:1 décomp `PlaySE(seId)` — joue un sound effect one-shot. Phase 0c stub. */
export function PlaySE(_seId: number): void { /* TODO Phase 1 Action 4 */ }

/** 1:1 décomp `INTRO3_RAW_PTR(palId)` macro src/intro.c:1870 :
 *    #define INTRO3_RAW_PTR(palId) (((void *) &gIntro3Bg_Pal) + palId)
 *
 *  Retourne un pointer dans gIntro3Bg_Pal à offset `palId` bytes. Utilisé
 *  pour CpuCopy16(INTRO3_RAW_PTR(N), &gPlttBufferFaded[idx], 2) → copy 1
 *  entry u16 à différents offsets dans le palette buffer (palette swap dyn).
 *
 *  Notre version : retourne Uint16Array view dans gIntro3Bg_Pal cache à
 *  l'offset `palId/2` entries (= palId bytes / 2 bytes par u16). */
export function INTRO3_RAW_PTR(palIdBytes: number): ArrayLike<number> {
  const data = assetCache.get('gIntro3Bg_Pal');
  if (!data || !(data instanceof Uint16Array)) {
    console.warn('[INTRO3_RAW_PTR] gIntro3Bg_Pal not in cache, return empty');
    return new Uint16Array(0);
  }
  const startEntry = (palIdBytes >> 1) & ~0;  // u16 entry index
  return data.subarray(startEntry);
}

/** Constants décomp commonly référencées sans être résolues par le transpileur. */
export const MALE = 0;
export const FEMALE = 1;

/** 1:1 décomp `LoadCompressedSpriteSheet(sheet)` — charge un sprite sheet
 *  individuel dans objVram. `sheet` = struct {data, size, tag}.
 *  Notre version : preload via assetCache, copy sync. */
export function LoadCompressedSpriteSheet(sheet: { data: string, size: number, tag: string | number }): void {
  // tag = unique ID, on l'enregistre comme tileTag pour CreateSpriteFromTemplate
  const r = rt();
  // data = symbol décomp (e.g. 'sIntroDropsLogo_Gfx')
  const charData = getAsset(sheet.data);
  const bytes = charData instanceof Uint16Array
    ? new Uint8Array(charData.buffer, charData.byteOffset, charData.byteLength)
    : charData;
  // Auto-allocate dans objVram via le runtime
  // On utilise une convention simplifiée : on append à objVram + record tag → tileStart
  const tagStr = String(sheet.tag);
  // Vérifier si déjà chargé
  if (r.spriteSheetTagToTileStart.has(tagStr)) return;
  // Find next free byte offset (track manually)
  const tileStart = (_nextSpriteSheetByteOffset >> 5);
  const copySize = Math.min(bytes.length, r.gba.objVram.length - _nextSpriteSheetByteOffset);
  if (copySize > 0) r.gba.objVram.set(bytes.subarray(0, copySize), _nextSpriteSheetByteOffset);
  r.spriteSheetTagToTileStart.set(tagStr, tileStart);
  _nextSpriteSheetByteOffset += copySize;
}
let _nextSpriteSheetByteOffset = 0;

/** 1:1 décomp `LoadSpritePalettes(palettes[])` — charge une table de palettes OBJ. */
export function LoadSpritePalettes(palettes: Array<{ data: string, tag: string | number }>): void {
  const r = rt();
  for (const p of palettes) {
    const tagStr = String(p.tag);
    if (r.paletteTagToSlot.has(tagStr)) continue;
    const palData = getAsset(p.data);
    const u16 = palData instanceof Uint16Array
      ? palData
      : new Uint16Array(palData.buffer, palData.byteOffset, Math.floor(palData.byteLength / 2));
    const slot = _nextObjPalSlot++;
    r.gba.palette.loadObjRange(slot * 16, u16.subarray(0, 16));
    r.paletteTagToSlot.set(tagStr, slot);
  }
}
let _nextObjPalSlot = 0;

/** Reset des allocations OBJ slots (à call entre 2 scènes). */
export function resetObjAllocations(): void {
  _nextSpriteSheetByteOffset = 0;
  _nextObjPalSlot = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYMBOL NAMES (self-reference strings) — pour que le code transcrit puisse écrire
// `LZ77UnCompVram(sIntro1Bg_Gfx, ...)` sans ReferenceError. Le symbol = sa propre
// string key vers assetCache. 1:1 sémantique : dans le décomp `sIntro1Bg_Gfx` est
// un pointeur vers les data ROM ; chez nous c'est juste une key vers le cache.
// ═══════════════════════════════════════════════════════════════════════════════

// Scene 1 BG layers
export const sIntro1Bg_Gfx = 'sIntro1Bg_Gfx';
export const sIntro1Bg_Pal = 'sIntro1Bg_Pal';
export const sIntro1Bg0_Tilemap = 'sIntro1Bg0_Tilemap';
export const sIntro1Bg1_Tilemap = 'sIntro1Bg1_Tilemap';
export const sIntro1Bg2_Tilemap = 'sIntro1Bg2_Tilemap';
export const sIntro1Bg3_Tilemap = 'sIntro1Bg3_Tilemap';
// Scene 1 sprite sheets + palettes
export const sIntroDropsLogo_Gfx = 'sIntroDropsLogo_Gfx';
export const sIntroDrops_Pal = 'sIntroDrops_Pal';
export const sIntroLogo_Pal = 'sIntroLogo_Pal';
export const sIntroFlygonSilhouette_Pal = 'sIntroFlygonSilhouette_Pal';
// Scene 1 g-prefixed externs (graphics.c décomp)
export const gIntroSparkle_Gfx = 'gIntroSparkle_Gfx';
export const gIntroFlygonSilhouette_Gfx = 'gIntroFlygonSilhouette_Gfx';
export const gIntroGameFreakTextFade_Pal = 'gIntroGameFreakTextFade_Pal';

// Scene 2 BG layers (1:1 décomp src/intro_credits_graphics.c data symbols)
export const sGrass_Gfx = 'sGrass_Gfx';
export const sGrass_Tilemap = 'sGrass_Tilemap';
export const sGrass_Pal = 'sGrass_Pal';
export const sTrees_Gfx = 'sTrees_Gfx';
export const sTrees_Tilemap = 'sTrees_Tilemap';
export const sTrees_Pal = 'sTrees_Pal';
export const sTreesSmall_Gfx = 'sTreesSmall_Gfx';
export const sTreesSmall_Pal = 'sTreesSmall_Pal';
export const sCloudsBg_Gfx = 'sCloudsBg_Gfx';
export const sCloudsBg_Tilemap = 'sCloudsBg_Tilemap';
export const sCloudsBg_Pal = 'sCloudsBg_Pal';
export const sClouds_Pal = 'sClouds_Pal';
export const sHouses_Gfx = 'sHouses_Gfx';
export const sHouses_Tilemap = 'sHouses_Tilemap';
export const sHouses_Pal = 'sHouses_Pal';

// Scene 2 sprites (à preload pour Phase 0c+)
export const gIntroBrendan_Gfx = 'gIntroBrendan_Gfx';
export const gIntroMay_Gfx = 'gIntroMay_Gfx';
export const gIntroBicycle_Gfx = 'gIntroBicycle_Gfx';
export const gIntroFlygon_Gfx = 'gIntroFlygon_Gfx';
export const gIntroVolbeat_Gfx = 'gIntroVolbeat_Gfx';
export const gIntroTorchic_Gfx = 'gIntroTorchic_Gfx';
export const gIntroManectric_Gfx = 'gIntroManectric_Gfx';
export const gIntroVolbeat_Pal = 'gIntroVolbeat_Pal';
export const gIntroTorchic_Pal = 'gIntroTorchic_Pal';
export const gIntroManectric_Pal = 'gIntroManectric_Pal';

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL TABLES (data extern décomp utilisée cross-module)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `const u16 gTitleScreenAlphaBlend[64]` (src/title_screen.c:74).
 *  Utilisé par Task_BlendLogoIn/Out + title_screen pour BLDALPHA fade smooth.
 *  - 0-15  : eva=16 fixe, evb=0→15  (logo lighten gradient)
 *  - 16-31 : eva=15→0, evb=16 fixe  (logo darken gradient)
 *  - 32-63 : eva=0, evb=16 fixe     (held final state)
 *  BLDALPHA_BLEND(eva, evb) = (eva | (evb << 8)). */
function _bldAlpha(eva: number, evb: number): number { return (eva & 0x1F) | ((evb & 0x1F) << 8); }
export const gTitleScreenAlphaBlend: ReadonlyArray<number> = (() => {
  const arr: number[] = new Array(64);
  for (let i = 0; i <= 15; i++) arr[i] = _bldAlpha(16, i);
  for (let i = 16; i <= 31; i++) arr[i] = _bldAlpha(31 - i, 16);
  for (let i = 32; i <= 63; i++) arr[i] = _bldAlpha(0, 16);
  return arr;
})();

// Scene 3 (Phase 0d+)
export const sIntroPokeball_Pal = 'sIntroPokeball_Pal';
export const sIntroPokeball_Tilemap = 'sIntroPokeball_Tilemap';
export const sIntroPokeball_Gfx = 'sIntroPokeball_Gfx';
export const sIntroStreaks_Pal = 'sIntroStreaks_Pal';
export const sIntroStreaks_Gfx = 'sIntroStreaks_Gfx';
export const sIntroStreaks_Tilemap = 'sIntroStreaks_Tilemap';
export const sIntroRayquzaOrb_Pal = 'sIntroRayquzaOrb_Pal';
export const sIntroMisc_Pal = 'sIntroMisc_Pal';
export const sIntroMisc_Gfx = 'sIntroMisc_Gfx';
export const sIntroLati_Gfx = 'sIntroLati_Gfx';
export const gIntroLightning_Gfx = 'gIntroLightning_Gfx';
export const gIntroLightning_Pal = 'gIntroLightning_Pal';
export const gIntroBubbles_Gfx = 'gIntroBubbles_Gfx';
export const gIntroBubbles_Pal = 'gIntroBubbles_Pal';
