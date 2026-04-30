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
import { G_SINE_TABLE } from './decomp-data/auto/src/sine-table';

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

/** Récupère un asset depuis le cache, log warning si manquant (= preload incomplet). */
export function getAsset(symbol: string): Uint8Array | Uint16Array | null {
  const data = assetCache.get(symbol);
  if (!data) {
    console.warn(`decomp-globals: asset '${symbol}' not in cache (forgot to preload?)`);
    return null;
  }
  return data;
}

// ─── BG/VRAM constants (1:1 décomp include/gba/types.h + io_reg.h) ────────────
/** 1:1 décomp BG_SCREEN_SIZE = 0x800 bytes (= 1024 entries u16). */
export const BG_SCREEN_SIZE = 0x800;
/** 1:1 décomp PLTT_SIZE = 0x400 bytes (= 256 colors × 2). */
export const PLTT_SIZE = 0x400;
/** 1:1 décomp PLTT_SIZE_4BPP = 0x20 bytes (= 16 colors × 2). */
export const PLTT_SIZE_4BPP = 0x20;
/** 1:1 décomp PLTT_SIZE_8BPP = 0x200 bytes (= 256 colors × 2). */
export const PLTT_SIZE_8BPP = 0x200;
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

/** EWRAM_DATA u16 gIntroCredits_MovingSceneryVBase — utilisé par intro/credits scrolling. */
export let gIntroCredits_MovingSceneryVBase = 0;
/** EWRAM_DATA s16 gIntroCredits_MovingSceneryVOffset — utilisé par intro/credits parallax. */
export let gIntroCredits_MovingSceneryVOffset = 0;
/** EWRAM_DATA s16 gIntroCredits_MovingSceneryState — INTROCRED_SCENERY_NORMAL/FROZEN. */
export let gIntroCredits_MovingSceneryState = 0;

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
  if (!data) return; // asset manquant, déjà loggué
  const r = rt();
  const traceEntry: { symbol: string; dest: number; dataLen: number; copied?: number; reason?: string } = {
    symbol: srcSymbol, dest: destAddr, dataLen: data.byteLength,
  };
  lz77Trace.push(traceEntry);
  const bytes = data instanceof Uint16Array
    ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    : data;
  const vram = r.gba.vram;
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
export function LoadPalette(srcSymbol: string | Uint16Array | number, offset: number, sizeBytes: number): void {
  let u16: Uint16Array | undefined;
  if (typeof srcSymbol === 'string') {
    const asset = getAsset(srcSymbol);
    if (asset) {
      u16 = asset instanceof Uint16Array
        ? asset
        : new Uint16Array(asset.buffer, asset.byteOffset, Math.floor(asset.byteLength / 2));
    }
  } else if (typeof srcSymbol === 'number') {
    u16 = new Uint16Array([srcSymbol & 0xFFFF]);
  } else {
    u16 = srcSymbol;
  }
  if (!u16 || u16.length === 0) return;
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

/** 1:1 décomp `LoadBgTiles` — copy tile data into BG VRAM.
 *  Simplified: ignores baseTile (assumed 0) and paletteMode. */
export function LoadBgTiles(bg: number, src: Uint8Array, sizeBytes: number, destOffset: number): void {
  const r = rt();
  const vram = r.gba.bg(bg as 0 | 1 | 2 | 3).vram;
  const offset = destOffset * 32; // each tile = 32 bytes in 4bpp
  const end = Math.min(offset + sizeBytes, vram.length);
  vram.set(src.subarray(0, end - offset), offset);
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
  const offset = destAddr % vram.byteLength;
  const clearSize = Math.min(sizeBytes, vram.byteLength - offset);
  if (clearSize > 0) {
    vram.fill(0, offset, offset + clearSize);
  }
}

/** 1:1 décomp `CpuFill16(value, dest, size)` — fill 16-bit.
 *  Supporte VRAM et PLTT (address-based). */
export function CpuFill16(value: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  if (destAddr >= VRAM && destAddr < VRAM + VRAM_SIZE) {
    const offset = destAddr - VRAM;
    const end = Math.min(offset + sizeBytes, VRAM_SIZE);
    const view = new Uint16Array(r.gba.vram.buffer, offset, (end - offset) >> 1);
    view.fill(value & 0xFFFF);
  } else if (destAddr >= PLTT && destAddr < PLTT + PLTT_SIZE) {
    const start = (destAddr - PLTT) >> 1;
    const count = sizeBytes >> 1;
    for (let i = 0; i < count; i++) {
      r.gPlttBufferFaded.set(start + i, value & 0xFFFF);
    }
  }
}

/** 1:1 décomp `CpuFill32(value, dest, size)` — fill 32-bit.
 *  Supporte VRAM, OAM (hide sprites) et PLTT. */
export function CpuFill32(value: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  if (destAddr >= VRAM && destAddr < VRAM + VRAM_SIZE) {
    const offset = destAddr - VRAM;
    const end = Math.min(offset + sizeBytes, VRAM_SIZE);
    const view = new Uint32Array(r.gba.vram.buffer, offset, (end - offset) >> 2);
    view.fill(value >>> 0);
  } else if (destAddr >= OAM && destAddr < OAM + OAM_SIZE) {
    for (const entry of r.gba.oam) {
      entry.visible = false;
    }
  } else if (destAddr >= PLTT && destAddr < PLTT + PLTT_SIZE) {
    CpuFill16(value & 0xFFFF, destAddr, sizeBytes);
    CpuFill16((value >>> 16) & 0xFFFF, destAddr + 2, sizeBytes > 2 ? sizeBytes - 2 : 0);
  }
}

/** 1:1 décomp `CpuSet(src, dest, control)` — copy/fill words.
 *  Stub : notre engine ne supporte pas l'adressage mémoire brut C. */
export function CpuSet(_src: any, _dest: any, _control: number): void {
  // no-op stub
}

/** 1:1 décomp `CpuFastSet(src, dest, control)` — fast copy/fill.
 *  Stub : idem CpuSet. */
export function CpuFastSet(_src: any, _dest: any, _control: number): void {
  // no-op stub
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

/** 1:1 décomp src/intro_credits_graphics.c:761 — setup BGCNT pour Scene 2.
 *  scenery=1 → trees bike ride (= utilisé par intro Scene 2). Active
 *  BG1+BG2+BG3+OBJ via DISPCNT MODE_0. */
export function SetIntroPart2BgCnt(scenery: number): void {
  const r = rt();
  const BG_PRI = (n: number) => n & 3;
  const BG_CHARBASE = (n: number) => (n & 3) << 2;
  const BG_SCREENBASE = (n: number) => (n & 31) << 8;
  const BG_TXT_256 = 0x0000;
  // BG3CNT (0x00E) : priority 3, charBase 0, screenBase 6
  r.SetGpuReg(0x00E, BG_PRI(3) | BG_CHARBASE(0) | BG_SCREENBASE(6) | BG_TXT_256);
  // BG2CNT (0x00C) : priority 2, charBase 0, screenBase 7
  r.SetGpuReg(0x00C, BG_PRI(2) | BG_CHARBASE(0) | BG_SCREENBASE(7) | BG_TXT_256);
  // BG1CNT (0x00A) : priority 1, charBase 1, screenBase 15
  r.SetGpuReg(0x00A, BG_PRI(1) | BG_CHARBASE(1) | BG_SCREENBASE(15) | BG_TXT_256);
  // DISPCNT (0x000) : MODE_0 | OBJ_1D_MAP | BG1_ON | BG2_ON | BG3_ON | OBJ_ON
  r.SetGpuReg(0x000, 0 | 0x40 | 0x200 | 0x400 | 0x800 | 0x1000);
  void scenery;  // case 0/1/2 partagent le même setup pour intro
}
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

/** 1:1 décomp `m4aMPlayAllStop()` — stoppe tout playback M4A. */
export function m4aMPlayAllStop(): void {
  void import('./m4a/player').then(({ stopSong }) => stopSong());
}

/** 1:1 décomp `PlaySE(seId)` — joue un sound effect one-shot. Phase 0c stub. */
export function PlaySE(_seId: number): void { /* TODO Phase 1 Action 4 */ }

/** 1:1 décomp src/intro.c PanFadeAndZoomScreen(screenX, screenY, zoom, alpha) :
 *  setup BG2 affine matrix pour Scene 3 Pokeball spin + zoom.
 *  Phase 2 stub no-op (= la Pokeball reste statique, pas de zoom).
 *  TODO Phase 2 audit : implémenter via gba.bgAffineMatrices[0] + bg(2) affine. */
export function PanFadeAndZoomScreen(_screenX: number, _screenY: number, _zoom: number, _alpha: number): void {
  /* no-op stub Phase 2 */
}

/** 1:1 décomp `SAFE_DIV(x, y)` macro = (y == 0) ? 0 : (x / y). */
export function SAFE_DIV(x: number, y: number): number {
  return y === 0 ? 0 : Math.floor(x / y);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 STUBS (Phase 2 minimum viable — ne pas crasher, atteindre Title screen)
// Scene 3 sera visuellement cassée (Groudon/Kyogre/Rayquaza pas affichés) mais
// la chaîne Tasks continue jusqu'à Task_EndIntroMovie → CB2_InitTitleScreen.
// TODO Phase 3 : implémenter pleinement Scene 3 avec preload + LZ77 + sprites.
// ═══════════════════════════════════════════════════════════════════════════════

/** Alias LZDecompressVram = LZ77UnCompVram. Wrap try/catch pour que asset
 *  manquant ne crash pas la Task entière (= juste warning). */
export function LZDecompressVram(srcSymbol: string, destAddr: number): void {
  try {
    LZ77UnCompVram(srcSymbol, destAddr);
  } catch (e) {
    console.warn(`[LZDecompressVram] ${srcSymbol} failed (asset not preloaded), continuing:`, (e as Error).message);
  }
}

/** Stubs Scene 3 sprite/palette loading (= utilise heap dans le décomp). */
export function LoadCompressedSpriteSheetUsingHeap(_sheet: unknown): void { /* TODO Phase 3 */ }
export function LoadCompressedSpritePaletteUsingHeap(_pal: unknown): void { /* TODO Phase 3 */ }
export function FreeMonSpritesGfx(): void { /* TODO */ }

/** 1:1 décomp `GET_TRUE_SPRITE_INDEX(animTag)` — retourne l'index du sprite
 *  dans gBattleAnimPicTable correspondant à l'anim tag. Phase 2 stub. */
export function GET_TRUE_SPRITE_INDEX(animTag: number): number {
  return animTag;  // pass-through
}

/** Stubs tables battle anim (Scene 3 ANIM_TAG_ROCKS pour Groudon). */
export const gBattleAnimPicTable: ReadonlyArray<{ data: string; size: number; tag: number }> = [];
export const gBattleAnimPaletteTable: ReadonlyArray<{ data: string; tag: number }> = [];

/** 1:1 décomp `gReservedSpritePaletteCount` — nombre de palettes OBJ
 *  réservées par le système. Le décomp le set à 8 pendant l'intro. */
export let gReservedSpritePaletteCount = 0;
export function setReservedSpritePaletteCount(v: number): void { gReservedSpritePaletteCount = v; }

// Scene 3 symbol-name strings (asset cache keys)
export const gIntroGroudon_Gfx = 'gIntroGroudon_Gfx';
export const gIntroGroudon_Tilemap = 'gIntroGroudon_Tilemap';
export const gIntroKyogre_Gfx = 'gIntroKyogre_Gfx';
export const gIntroKyogre_Tilemap = 'gIntroKyogre_Tilemap';
export const gIntroLegendBg_Gfx = 'gIntroLegendBg_Gfx';
export const gIntroGroudonBg_Tilemap = 'gIntroGroudonBg_Tilemap';
export const gIntroKyogreBg_Tilemap = 'gIntroKyogreBg_Tilemap';
export const gIntroClouds_Gfx = 'gIntroClouds_Gfx';
export const gIntroCloudsSun_Tilemap = 'gIntroCloudsSun_Tilemap';
export const gIntroCloudsLeft_Tilemap = 'gIntroCloudsLeft_Tilemap';
export const gIntroCloudsRight_Tilemap = 'gIntroCloudsRight_Tilemap';
export const gIntroRayquaza_Tilemap = 'gIntroRayquaza_Tilemap';
export const gIntroRayquazaClouds_Tilemap = 'gIntroRayquazaClouds_Tilemap';
export const gIntroRayquaza_Gfx = 'gIntroRayquaza_Gfx';
export const gIntroRayquazaClouds_Gfx = 'gIntroRayquazaClouds_Gfx';
export const gIntro3Bg_Pal = 'gIntro3Bg_Pal';

/** Scanline effect register buffers (2 buffers × 640 entries).
 *  Matches decomp gScanlineEffectRegBuffers[2][0x320]. */
export const gScanlineEffectRegBuffers: [Uint16Array, Uint16Array] = [
  new Uint16Array(640),
  new Uint16Array(640),
];

/** Stop flag for wave task. */
export let sShouldStopWaveTask = false;

/** Global scanline effect state (mutable). */
export let gScanlineEffect = {
  state: 0,
  dmaSrcBuffers: [null, null] as (null | number)[],
  dmaDest: null as number | null,
  dmaControl: 0,
  srcBuffer: 0,
  unused16: 0,
  unused17: 0,
  waveTaskId: 0xFF,
  setFirstScanlineReg: () => {},
};

// ═══════════════════════════════════════════════════════════════════════════════
// TITLE SCREEN STUBS (Phase 3 minimum viable)
// ═══════════════════════════════════════════════════════════════════════════════

/** Stubs helpers missing du décomp utilisés par CB2_InitTitleScreen. */
export function DmaFill16(_channel: number, value: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  const offset = destAddr % r.gba.vram.byteLength;
  const cnt = Math.min(sizeBytes, r.gba.vram.byteLength - offset);
  if (cnt > 0) r.gba.vram.fill(value & 0xFF, offset, offset + cnt);
}
export function DmaFill32(_channel: number, value: number, destAddr: number, sizeBytes: number): void {
  DmaFill16(_channel, value & 0xFFFF, destAddr, sizeBytes);
}
export function ResetPaletteFade(): void {
  const r = rt();
  r.gPaletteFade.active = false;
  r.gba.blend.brightness = 0;
}
export function ResetTasks(): void {
  const r = rt();
  r.gTasks.clear();
  r.nextTaskId = 0;
  console.log('[ResetTasks] gTasks cleared, nextTaskId reset, size=', r.gTasks.size);
}
export function TransferPlttBuffer(): void {
  // Dans notre engine, gPlttBufferFaded écrit déjà directement dans gba.palette
  // via PaletteBuffer.set() → loadBgRange/loadObjRange → refreshCache.
  // Cette fonction est un no-op fonctionnel, conservée pour compatibilité C.
}
export function ScanlineEffect_Clear(): void {
  gScanlineEffectRegBuffers[0].fill(0);
  gScanlineEffectRegBuffers[1].fill(0);
  gScanlineEffect.dmaSrcBuffers[0] = null;
  gScanlineEffect.dmaSrcBuffers[1] = null;
  gScanlineEffect.dmaDest = null;
  gScanlineEffect.dmaControl = 0;
  gScanlineEffect.srcBuffer = 0;
  gScanlineEffect.state = 0;
  gScanlineEffect.waveTaskId = 0xFF;
  sShouldStopWaveTask = false;
}

export function ScanlineEffect_SetParams(_params: unknown): void {
  // Phase 3+ : faithful DMA emulation via gScanlineEffectRegBuffers.
  // For now, mark active so H-blank callback knows to run.
  gScanlineEffect.state = 1;
}

export function ScanlineEffect_InitHBlankDmaTransfer(): void {
  // No-op : our compositor calls hblankCallback directly per scanline.
  // Real GBA uses DMA from gScanlineEffectRegBuffers to hardware regs.
}

export function ScanlineEffect_Stop(): void {
  waveParams = null;
  wavePhase = 0;
  waveDelayCounter = 0;
  try {
    rt().gba.setHBlankCallback(null);
  } catch { /* runtime may not be set */ }
  gScanlineEffect.state = 0;
}
export function EnableInterrupts(_flag: number): void { /* no-op */ }
export function LoadSpritePalette(_pal: { data: string, tag: string | number } | unknown): void {
  /* Phase 3+ : implémenter via paletteTagToSlot register */
}

/** 1:1 décomp `UpdatePaletteFade()` — tick palette fade + return active state.
 *  Returns `true` if fade is still active, `false` when done. */
export function UpdatePaletteFade(): boolean {
  const r = rt();
  r.UpdatePaletteFade();
  return r.gPaletteFade.active;
}

/** 1:1 décomp `JOY_NEW(buttonMask)` — retourne gMain.newKeys & buttonMask. */
export function JOY_NEW(buttonMask: number): number {
  return (rt().gMain as unknown as { newKeys: number }).newKeys & buttonMask;
}

/** 1:1 décomp `JOY_HELD(buttonMask)` — retourne gMain.heldKeys & buttonMask. */
export function JOY_HELD(buttonMask: number): number {
  return (rt().gMain as unknown as { heldKeys: number }).heldKeys & buttonMask;
}

// ─── ScanlineEffect_InitWave implementation ─────────────────────────────────

let wavePhase = 0;
let waveDelayCounter = 0;
let waveParams: {
  startLine: number;
  endLine: number;
  frequency: number;
  amplitude: number;
  regOffset: number;
  delayInterval: number;
  applyBattleBgOffsets: boolean;
} | null = null;

function getBgForRegOffset(regOffset: number): { bgIndex: number; prop: 'hofs' | 'vofs' } {
  const bgIndex = Math.floor(regOffset / 4);
  const isVofs = (regOffset % 4) === 2;
  return { bgIndex: Math.min(3, Math.max(0, bgIndex)), prop: isVofs ? 'vofs' : 'hofs' };
}

/** 1:1 décomp `ScanlineEffect_InitWave(...)` — implémentation directe via H-blank callback.
 *  Pas de DMA fidle : le compositor appelle le H-blank callback à chaque scanline.
 *  Amplitude/frequency/wavePhase modélisés avec G_SINE_TABLE (Q.8). */
export function ScanlineEffect_InitWave(
  startLine: number, endLine: number, frequency: number,
  amplitude: number, delayInterval: number, regOffset: number,
  applyBattleBgOffsets: boolean,
): number {
  const r = rt();
  const { bgIndex, prop } = getBgForRegOffset(regOffset);

  wavePhase = 0;
  waveDelayCounter = delayInterval;
  waveParams = { startLine, endLine, frequency, amplitude, regOffset, delayInterval, applyBattleBgOffsets };

  // Base offset captured at scanline 0 each frame (matches battle BG offset behavior)
  let frameBase = 0;

  r.gba.setHBlankCallback((scanline) => {
    if (!waveParams) return;

    const bg = r.gba.bg(bgIndex as 0 | 1 | 2 | 3);

    if (scanline === 0) {
      frameBase = prop === 'hofs' ? bg.config.hofs : bg.config.vofs;
      // Advance phase according to delayInterval (decomp tFramesUntilMove logic)
      if (waveDelayCounter === 0) {
        waveDelayCounter = waveParams.delayInterval;
        wavePhase = (wavePhase + 1) & 0xFF;
      } else {
        waveDelayCounter--;
      }
    }

    if (scanline < waveParams.startLine || scanline >= waveParams.endLine) {
      if (prop === 'hofs') bg.config.hofs = frameBase;
      else bg.config.vofs = frameBase;
      return;
    }

    // Decomp wave formula: Sin((scanline + phase) * frequency, amplitude)
    // G_SINE_TABLE is Q.8 (range -256..256). Sin(idx, amp) = (table[idx] * amp) >> 8.
    const idx = ((scanline + wavePhase) * waveParams.frequency) & 0xFF;
    const offset = (G_SINE_TABLE[idx] * waveParams.amplitude) >> 8;

    if (prop === 'hofs') {
      bg.config.hofs = frameBase + offset;
    } else {
      bg.config.vofs = frameBase + offset;
    }
  });

  gScanlineEffect.state = 1;
  return 0; // taskId (not used by caller in our engine)
}

/** 1:1 décomp `StartPokemonLogoShine(mode)` — stub Phase 0.
 *  Logo shine sparkle effect not yet implemented. */
export function StartPokemonLogoShine(_mode: number): void {
  // TODO Phase 3: implement shine sprite creation
}

/** Memory addresses GBA hardware constants. */
export const VRAM = 0x06000000;
export const OAM = 0x07000000;
export const PLTT = 0x05000000;
export const OAM_SIZE = 0x400;
// VRAM_SIZE déjà déclaré plus haut

/** Window control bits (1:1 GBA). */
export const WININ_WIN0_BG_ALL = 0xF;
export const WININ_WIN0_OBJ = 0x10;
export const WININ_WIN1_BG_ALL = 0xF00;
export const WININ_WIN1_OBJ = 0x1000;
export const WINOUT_WIN01_BG_ALL = 0xF;
export const WINOUT_WIN01_OBJ = 0x10;
export const WINOUT_WIN01_CLR = 0x20;
export const WINOUT_WINOBJ_ALL = 0x1F00;

/** Interrupt flags. */
export const INTR_FLAG_VBLANK = 1;

/** Title screen affine BG regs. */
export const REG_OFFSET_BG2X_L = 0x028;
export const REG_OFFSET_BG2X_H = 0x02A;
export const REG_OFFSET_BG2Y_L = 0x02C;
export const REG_OFFSET_BG2Y_H = 0x02E;

/** Title screen symbol-name strings (title_screen.c). */
export const gTitleScreenPokemonLogoGfx = 'gTitleScreenPokemonLogoGfx';
export const gTitleScreenPokemonLogoTilemap = 'gTitleScreenPokemonLogoTilemap';
export const gTitleScreenBgPalettes = 'gTitleScreenBgPalettes';
export const sTitleScreenRayquazaGfx = 'sTitleScreenRayquazaGfx';
export const sTitleScreenRayquazaTilemap = 'sTitleScreenRayquazaTilemap';
export const sTitleScreenCloudsGfx = 'sTitleScreenCloudsGfx';
export const gTitleScreenCloudsTilemap = 'gTitleScreenCloudsTilemap';
export const gTitleScreenEmeraldVersionPal = 'gTitleScreenEmeraldVersionPal';
export const sSpritePalette_PressStart: ReadonlyArray<{ data: string; tag: number }> = [
  { data: 'sPressStart_Pal', tag: 1000 },
];

/** gMain re-export (pour bodyC CB2_InitTitleScreen qui fait `gMain.state = N`). */
export const gMain = new Proxy({} as { state: number; callback2: unknown; vblankCallback: unknown }, {
  get(_, k) { return (rt().gMain as unknown as Record<string, unknown>)[k as string]; },
  set(_, k, v) { (rt().gMain as unknown as Record<string, unknown>)[k as string] = v; return true; },
});

/** Accessor `gPlttBufferUnfaded` proxy — pointer vers rt().gPlttBufferUnfaded.
 *  Le bodyC fait des `gPlttBufferUnfaded[idx]` = read u16 à index dans le buf.
 *  Notre PaletteBuffer expose `.get(idx)` ; pour rester compatible avec
 *  l'array-access décomp, on retourne un proxy. */
export const gPlttBufferUnfaded = new Proxy({}, {
  get(_, k) {
    if (k === 'length') return 512;
    const i = Number(k);
    if (!Number.isFinite(i)) return undefined;
    try { return rt().gPlttBufferUnfaded.get(i); } catch { return 0; }
  },
}) as unknown as ArrayLike<number>;

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
  if (!charData) return; // asset manquant
  const bytes = charData instanceof Uint16Array
    ? new Uint8Array(charData.buffer, charData.byteOffset, charData.byteLength)
    : charData;
  const tagStr = String(sheet.tag);
  if (r.spriteSheetTagToTileStart.has(tagStr)) return;
  const tileStart = (r.nextSpriteSheetByteOffset >> 5);
  const copySize = Math.min(bytes.length, r.gba.objVram.length - r.nextSpriteSheetByteOffset);
  if (copySize > 0) r.gba.objVram.set(bytes.subarray(0, copySize), r.nextSpriteSheetByteOffset);
  r.spriteSheetTagToTileStart.set(tagStr, tileStart);
  r.nextSpriteSheetByteOffset += copySize;
}

/** 1:1 décomp `LoadSpritePalettes(palettes[])` — charge une table de palettes OBJ. */
export function LoadSpritePalettes(palettes: Array<{ data: string, tag: string | number }>): void {
  const r = rt();
  for (const p of palettes) {
    const tagStr = String(p.tag);
    if (r.paletteTagToSlot.has(tagStr)) continue;
    const palData = getAsset(p.data);
    if (!palData) continue; // asset manquant
    const u16 = palData instanceof Uint16Array
      ? palData
      : new Uint16Array(palData.buffer, palData.byteOffset, Math.floor(palData.byteLength / 2));
    const slot = r.nextObjPalSlot++;
    r.gba.palette.loadObjRange(slot * 16, u16.subarray(0, 16));
    r.paletteTagToSlot.set(tagStr, slot);
  }
}
/** Reset des allocations OBJ slots (à call entre 2 scènes). */
export function resetObjAllocations(): void {
  const r = rt();
  r.nextSpriteSheetByteOffset = 0;
  r.nextObjPalSlot = 0;
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
  for (let i = 32; i < 64; i++) arr[i] = _bldAlpha(0, 16);
  return arr;
})();

/** 1:1 décomp `BlendPalette(palOffset, numEntries, coeff, blendColor)` — mélange
 *  gPlttBufferUnfaded vers gPlttBufferFaded. coeff = 0-16 (16 = 100% blendColor). */
export function BlendPalette(palOffset: number, numEntries: number, coeff: number, blendColor: number): void {
  const r = rt();
  const bcR = blendColor & 0x1F;
  const bcG = (blendColor >> 5) & 0x1F;
  const bcB = (blendColor >> 10) & 0x1F;
  for (let i = 0; i < numEntries; i++) {
    const idx = palOffset + i;
    const unfaded = r.gPlttBufferUnfaded.get(idx);
    const r1 = unfaded & 0x1F;
    const g1 = (unfaded >> 5) & 0x1F;
    const b1 = (unfaded >> 10) & 0x1F;
    const newR = r1 + (((bcR - r1) * coeff) >> 4);
    const newG = g1 + (((bcG - g1) * coeff) >> 4);
    const newB = b1 + (((bcB - b1) * coeff) >> 4);
    r.gPlttBufferFaded.set(idx, ((newB & 0x1F) << 10) | ((newG & 0x1F) << 5) | (newR & 0x1F));
  }
}

/** 1:1 décomp `RunTasks()` — exécute toutes les tasks actives. */
export function RunTasks(): void {
  rt().runTasks();
}
/** 1:1 décomp `AnimateSprites()` — met à jour les animations de sprites.
 *  Notre engine gère les sprites dans tickFixed / syncSpritesToOam. */
export function AnimateSprites(): void {
  /* no-op — animations gérées par le runtime Phaser sync */
}
/** 1:1 décomp `BuildOamBuffer()` — construit l'OAM buffer pour le rendu.
 *  Notre engine gère l'OAM via Phaser sync dans tickFixed. */
export function BuildOamBuffer(): void {
  /* no-op — OAM géré par le runtime Phaser sync */
}

// ─── Title screen / audio stubs ──────────────────────────────────────────────
export function UpdateLegendaryMarkingColor(_counter: number): void {
  // TODO: implement legendary marking palette cycling (needs gTitleScreenLegendaryMarkingsPalette)
}
export function FadeOutBGM(_speed: number): void {
  // TODO: implement BGM fade out
}
export function CanResetRTC(): boolean {
  return false; // stub
}
export let gBattle_BG1_X = 0;
export let gBattle_BG1_Y = 0;
export const gMPlayInfo_BGM = { status: 1 };

// Synchronise les mutable exports sur globalThis pour que les modules auto-générés
// puissent y accéder sans import ESM (évite "Assignment to constant variable").
const _mutableGlobals: Record<string, { get: () => unknown; set: (v: unknown) => void }> = {
  sIntroCharacterGender: { get: () => sIntroCharacterGender, set: (v) => { sIntroCharacterGender = v as number; } },
  sFlygonYOffset: { get: () => sFlygonYOffset, set: (v) => { sFlygonYOffset = v as number; } },
  gReservedSpritePaletteCount: { get: () => gReservedSpritePaletteCount, set: (v) => { gReservedSpritePaletteCount = v as number; } },
  gBattle_BG1_X: { get: () => gBattle_BG1_X, set: (v) => { gBattle_BG1_X = v as number; } },
  gBattle_BG1_Y: { get: () => gBattle_BG1_Y, set: (v) => { gBattle_BG1_Y = v as number; } },
  gIntroCredits_MovingSceneryVBase: { get: () => gIntroCredits_MovingSceneryVBase, set: (v) => { gIntroCredits_MovingSceneryVBase = v as number; } },
  gIntroCredits_MovingSceneryVOffset: { get: () => gIntroCredits_MovingSceneryVOffset, set: (v) => { gIntroCredits_MovingSceneryVOffset = v as number; } },
  gIntroCredits_MovingSceneryState: { get: () => gIntroCredits_MovingSceneryState, set: (v) => { gIntroCredits_MovingSceneryState = v as number; } },
};
for (const [k, d] of Object.entries(_mutableGlobals)) {
  if (!(k in globalThis)) {
    Object.defineProperty(globalThis, k, { get: d.get, set: d.set, enumerable: true, configurable: true });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI SYSTEM EXPORTS (window.c + text.c + menu.c adapters)
// ═══════════════════════════════════════════════════════════════════════════════
export * from './decomp-data/main-menu-data';
export * from './gba-window-system';
export * from './gba-text-system';
export * from './gba-menu-system';
export * from './gba-strings';
export * from './decomp-data/auto/src/sprite-system-flat';
export * from './decomp-data/auto/src/intro-c-data-auto';

// ─── Stubs for main_menu-callbacks-auto.ts ───────────────────────────────────
export function AddBirchSpeechObjects(_taskId: number): void { /* TODO */ }
export function CreatePokeballSpriteToReleaseMon(_spriteId: number, _paletteBank: number, _x: number, _y: number, _a: number, _b: number, _c: number, _pal: number, _species: number): number { return 0; }
export function InitSpriteAffineAnim(_sprite: any): void { /* TODO */ }
export function NewGameBirchSpeech_StartFadeInTarget1OutTarget2(_taskId: number, _delay: number): void { /* TODO */ }
export function NewGameBirchSpeech_StartFadeOutTarget1InTarget2(_taskId: number, _delay: number): void { /* TODO */ }
export function NewGameBirchSpeech_StartFadePlatformIn(_taskId: number, _delay: number): void { /* TODO */ }
export function NewGameBirchSpeech_StartFadePlatformOut(_taskId: number, _delay: number): void { /* TODO */ }

/** 1:1 décomp `PIXEL_FILL(value)` macro — fills both nibbles of a byte. */
export function PIXEL_FILL(value: number): number {
  return value | (value << 4);
}
