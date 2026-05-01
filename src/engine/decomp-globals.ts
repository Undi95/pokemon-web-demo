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
import { SONG_ID_TO_NAME, getSongConfig } from './decomp-data/auto/src/song-table';
import { setReverb as _staticSetReverb } from './m4a/audio-context';
// Static imports m4a/player + synth pour pouvoir stopper la musique de FAÇON
// SYNCHRONE depuis m4aSongNumStart (sinon le sync stop attend l'import async,
// laissant la song précédente déclencher son endTimer de loop entre-temps).
import { stopSong as _staticStopSong, loadMidi as _staticLoadMidi, playSong as _staticPlaySong } from './m4a/player';
import { stopAllActiveNotes as _staticStopAllNotes } from './m4a/synth';

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
  // 1:1 décomp : LoadPalette écrit dans gPlttBufferUnfaded (= source pour
  // CpuCopy16 plus tard, et pour UpdatePaletteFade qui copie unfaded → faded).
  // Sans ce write, les CpuCopy16 qui lisent gPlttBufferUnfaded[OBJ_PLTT_ID(0)]
  // récupèrent 0 (= les copies ripple/etc échouent).
  for (let i = 0; i < numEntries; i++) {
    r.gPlttBufferUnfaded.set(offset + i, u16[i]);
    r.gPlttBufferFaded.set(offset + i, u16[i]);
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

/** 1:1 décomp `FreeAllSpritePalettes` — libère tous les slots OBJ palette
 *  alloués par tag. Permet de réutiliser les 16 slots OBJ palette entre 2 scènes
 *  (= sinon overflow `nextObjPalSlot >= 16`). */
export function FreeAllSpritePalettes(): void {
  const r = rt();
  r.paletteTagToSlot.clear();
  r.nextObjPalSlot = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 STUBS (Phase 0b minimum viable — no-op pour ne pas crasher)
// TODO Phase 0c : implementer 1:1 décomp src/intro.c
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/intro.c:274 — sprite sheets pour Volbeat/Torchic/Manectric.
 *  Boucle `for (i=0; i < ARRAY_COUNT-1; i++)` skip le sentinel `{}` final, donc
 *  on inclut bien le terminateur vide (notre boucle traite `length - 1`). */
export const sSpriteSheet_RunningPokemon: ReadonlyArray<{ data: string, size: number, tag: string | number }> = [
  { data: 'gIntroVolbeat_Gfx', size: 0x400, tag: 'TAG_VOLBEAT' },
  { data: 'gIntroTorchic_Gfx', size: 0xC00, tag: 'TAG_TORCHIC' },
  { data: 'gIntroManectric_Gfx', size: 0x2000, tag: 'TAG_MANECTRIC' },
  { data: '', size: 0, tag: '' },  // sentinel
];

/** 1:1 décomp src/intro.c — Bubbles (Kyogre Scene 3). */
export const sSpriteSheet_Bubbles: { data: string, size: number, tag: string | number } = {
  data: 'gIntroBubbles_Gfx', size: 0x600, tag: 'TAG_BUBBLES',
};
export const sSpritePalette_Bubbles: { data: string, tag: string | number } = {
  data: 'gIntroBubbles_Pal', tag: 'TAG_BUBBLES',
};

/** 1:1 décomp src/intro.c — Lightning (Rayquaza Scene 3). */
export const sSpriteSheet_Lightning: { data: string, size: number, tag: string | number } = {
  data: 'gIntroLightning_Gfx', size: 0xC00, tag: 'TAG_LIGHTNING',
};
export const sSpritePalette_Lightning: ReadonlyArray<{ data: string, tag: string | number }> = [
  { data: 'gIntroLightning_Pal', tag: 'TAG_LIGHTNING' },
];

/** 1:1 décomp src/intro.c — Rayquaza orb (intro blast). */
export const sSpriteSheet_RayquazaOrb: { data: string, size: number, tag: string | number } = {
  data: 'sIntroMisc_Gfx', size: 0xA00, tag: 'TAG_RAYQUAZA_ORB',
};
export const sSpritePalette_RayquazaOrb: ReadonlyArray<{ data: string, tag: string | number }> = [
  { data: 'sIntroRayquzaOrb_Pal', tag: 'TAG_RAYQUAZA_ORB' },
];

/** 1:1 décomp src/intro.c:281 — palettes OBJ pour Volbeat/Torchic/Manectric. */
export const sSpritePalettes_RunningPokemon: ReadonlyArray<{ data: string, tag: string | number }> = [
  { data: 'gIntroVolbeat_Pal', tag: 'TAG_VOLBEAT' },
  { data: 'gIntroTorchic_Pal', tag: 'TAG_TORCHIC' },
  { data: 'gIntroManectric_Pal', tag: 'TAG_MANECTRIC' },
];

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
  // 1:1 décomp : `gSprites[rightSpriteId].callback = &SpriteCB_FlygonRightHalf;`
  // Override le callback du template (FlygonLeftHalf no-op) pour le right half.
  const rightCb = r.spriteCallbacks.get('SpriteCB_FlygonRightHalf');
  if (right && rightCb) {
    right.callback = (spr) => rightCb(spr, r);
  }
  return leftSpriteId;
}

/** 1:1 décomp src/intro_credits_graphics.c:924 — crée le Task_BicycleBgAnimation
 *  qui anime les BG parallax pendant Scene 2 bike ride.
 *  data layout : data[0]=mode, data[1]=bg1Speed, [2]=bg1PosHi, [3]=bg1PosLo,
 *  [4]=bg2Speed, [5]=bg2PosHi, [6]=bg2PosLo, [7]=bg3Speed, [8]=bg3PosHi=8, [9]=bg3PosLo.
 *  Le callback Task_BicycleBgAnimation est enregistré dans spriteCallbacks par GameScene. */
export function CreateBicycleBgAnimationTask(mode: number, bg1Speed: number, bg2Speed: number, bg3Speed: number): number {
  const r = rt();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskFn = r.spriteCallbacks.get('Task_BicycleBgAnimation') as any;
  if (!taskFn) {
    console.warn('[decomp-globals] Task_BicycleBgAnimation not registered; BG scroll inactive');
    return r.CreateTask(() => { /* no-op fallback */ }, 0);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskId = r.CreateTask((t: any) => taskFn(t, r), 0);
  const task = r.gTasks.get(taskId);
  if (task) {
    task.data[0] = mode;
    task.data[1] = bg1Speed;
    task.data[2] = 0;
    task.data[3] = 0;
    task.data[4] = bg2Speed;
    task.data[5] = 0;
    task.data[6] = 0;
    task.data[7] = bg3Speed;
    task.data[8] = 8;
    task.data[9] = 0;
    // 1:1 décomp : run task body immediately for first frame.
    taskFn(task, r);
  }
  return taskId;
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

/** Constants 1:1 décomp `include/constants/songs.h`. Re-exportés depuis la
 *  song-table extraite (532 entries). Re-export ici pour compat avec les
 *  imports existants `import { MUS_INTRO } from '../../decomp-globals'`.
 *  La constante `SONG_ID_TO_NAME` complète est importée en tête du fichier. */
export const MUS_INTRO = 414;          // mus_intro
export const MUS_INTRO_BATTLE = 442;   // mus_intro_battle
export const MUS_TITLE = 413;          // mus_title

// State du M4A engine maison (notre `src/engine/m4a/`). Init lazy via m4aPrime().
let _m4aPrimed = false;
type VgLookupFn = (name: string) => unknown;
let _vgLookup: VgLookupFn | null = null;
let _songVoicegroups: Record<string, string> | null = null;

/** Init audio engine (spessasynth_lib + emerald.sf2). Lazy au premier
 *  m4aSongNumStart. Idempotent. Précharge les 3 synth slots en parallèle pour
 *  que les premiers PlaySE n'aient PAS de latence cold-init (~1-2s SF2 load). */
async function m4aPrime(): Promise<void> {
  if (_m4aPrimed) return;
  const { getAudioContext } = await import('./m4a/audio-context');
  const { preloadAllSlots } = await import('./m4a/player');
  const { lookupVoicegroup } = await import('./m4a/voicegroups-data/_all-voicegroups-index');
  // Init AudioContext (requires user gesture — déjà eu via click TestGba→GameScene)
  getAudioContext();
  // Load song → voicegroup mapping (gardé pour les warnings PlaySE qui filtrent
  // les slots, même si spessasynth ne consomme plus le voicegroup data lui-même).
  const resp = await fetch('/decomp/em/music/song-voicegroups.json');
  _songVoicegroups = await resp.json() as Record<string, string>;
  _vgLookup = lookupVoicegroup as VgLookupFn;
  // Précharge les 3 synth slots (BGM + SE1 + SE2) en parallèle. Le SF2 buffer
  // est fetch 1 fois et partagé via slice() entre les 3 instances.
  await preloadAllSlots();
  _m4aPrimed = true;
  console.log('[decomp-globals] audio engine ready (spessasynth_lib + emerald.sf2, 3 slots préchargés)');
}

/** 1:1 décomp `m4aSongNumStart(songId)` — démarre une song en boucle via NOTRE
 *  M4A engine maison (`src/engine/m4a/`). Pas SpessaSynth ni emerald.sf2.
 *  Async fire-and-forget : await m4aPrime() puis playSong().
 *  Le voicegroup est résolu via `song-voicegroups.json` (extracted décomp). */
// Song ID courante (= dernière passée à m4aSongNumStart). Utilisée par le
// handler visibilitychange dans main.ts pour replay au retour de focus.
let _currentSongId: number | null = null;
export function getCurrentSongId(): number | null { return _currentSongId; }

export function m4aSongNumStart(songId: number): void {
  const songName = SONG_ID_TO_NAME[songId];
  if (!songName) {
    console.warn(`[m4aSongNumStart] song ID ${songId} not mapped, skip`);
    return;
  }
  _currentSongId = songId;
  // STOP IMMÉDIAT et SYNC du slot BGM uniquement (= laisse SE1/SE2 jouer).
  // Static imports (top of file) garantissent disponibilité immédiate.
  // Critique pour éviter le micro-replay de loop entre 2 BGMs.
  // NOTE : on N'appelle PAS _staticStopAllNotes() ici car ça killerait aussi
  // les SE en cours (architecture multi-slot 1:1 GBA).
  _staticStopSong('bgm');
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
      const midi = await _staticLoadMidi(url);
      // Re-vérification : si une autre m4aSongNumStart est passée entre-temps,
      // _currentSongId aura changé. Skip pour ne pas écraser la nouvelle.
      if (_currentSongId !== songId) return;
      // Reverb + volume par-song 1:1 décomp `sound/songs/midi/midi.cfg` (mid2agb args).
      // Ex : mus_intro = R50 V90 (overworld léger), mus_cave_of_origin = R90 (cavernes).
      const cfg = getSongConfig(songName);
      if (cfg && cfg.reverb !== null) _staticSetReverb(cfg.reverb);
      const songVol = cfg?.volume ?? null;
      // 1:1 GBA : loop=false par DEFAUT. Le LOOP est encodé dans le .mid via
      // les markers `[` et `]` que mid2agb détecte pour générer `ply_goto`
      // (cf tools/mid2agb/midi.cpp:286-292). MUS_INTRO n'a PAS ces markers
      // → mid2agb génère `ply_fine` (one-shot). Donc dans le vrai GBA,
      // MUS_INTRO joue une fois puis stoppe → 0.6s silence avant scene 3
      // (frame ~2034 song end vs frame 2070 Task_Scene3_Load) = comportement
      // original. Pour les BGMs qui DOIVENT looper (overworld), il faudra
      // détecter les markers MIDI dans nos .mid (TODO Phase 8+) ou maintenir
      // une liste explicite par songName.
      await (_staticPlaySong as (m: unknown, vg: unknown, lookup: VgLookupFn, loop: boolean, slot: string, volume: number | null) => Promise<void>)(
        midi, voicegroup, _vgLookup!, false, 'bgm', songVol,
      );
      console.log(`[m4aSongNumStart] playing ${url} via M4A maison (vg=${vgName}) slot=bgm V=${songVol ?? 'default'}`);
    } catch (e) {
      console.error('[m4aSongNumStart] failed:', e);
    }
  })();
}

/** 1:1 décomp `m4aMPlayAllStop()` — stoppe tout playback M4A (BGM + SE).
 *  Utilise `stopAllSongs()` du player qui boucle sur les 3 slots (bgm/se1/se2). */
export function m4aMPlayAllStop(): void {
  void import('./m4a/player').then(({ stopAllSongs }) => stopAllSongs());
}

/** 1:1 décomp `PlaySE(seId)` — joue un sound effect one-shot.
 *
 *  ARCHITECTURE 1:1 GBA : la décomp utilise des slots `gMPlayInfo_SE1` et
 *  `gMPlayInfo_SE2` SÉPARÉS du `gMPlayInfo_BGM` (cf src/m4a.c:13-21). Ainsi
 *  un SE et la BGM coexistent. Notre player.ts a maintenant la même
 *  architecture : 3 slots `bgm`/`se1`/`se2` indépendants avec leurs propres
 *  generations + activeNotes + scheduledTimers.
 *
 *  Mapping seId → song name via la table complète extraite de songs.h.
 *  Voicegroup résolu via song-voicegroups.json (rs_sfx_1 / rs_sfx_2 / frlg_sfx). */
let _seSlotToggle: 'se1' | 'se2' = 'se1';
export function PlaySE(seId: number): void {
  const name = SONG_ID_TO_NAME[seId];
  if (!name) {
    console.warn(`[PlaySE] SE id ${seId} not mapped — songs.h missing entry?`);
    return;
  }
  if (!name.startsWith('se_') && !name.startsWith('ph_')) {
    console.warn(`[PlaySE] id ${seId} = ${name} is NOT a SE/PH — use m4aSongNumStart instead`);
    return;
  }
  // Alterne entre se1 et se2 (= 1:1 décomp src/sound.c:577-598 : si SE1
  // occupé, utilise SE2). Permet 2 SE simultanés.
  const slot: 'se1' | 'se2' = _seSlotToggle;
  _seSlotToggle = slot === 'se1' ? 'se2' : 'se1';
  void (async () => {
    try {
      await m4aPrime();
      const url = `/decomp/em/music/${name}.mid`;
      const vgName = _songVoicegroups![name];
      if (!vgName) {
        console.warn(`[PlaySE] no voicegroup for ${name}`);
        return;
      }
      const voicegroup = _vgLookup!(vgName);
      if (!voicegroup) {
        console.warn(`[PlaySE] voicegroup '${vgName}' not in lookup`);
        return;
      }
      const midi = await _staticLoadMidi(url);
      // Reverb + volume par-song : si midi.cfg a des valeurs, on les respecte.
      // Sinon on hérite du reverb BGM courant (= comportement 1:1 GBA m4aSoundMode).
      const cfg = getSongConfig(name);
      if (cfg && cfg.reverb !== null) _staticSetReverb(cfg.reverb);
      const seSongVol = cfg?.volume ?? null;
      // SE = loop=false + slot SE (PAS bgm). La BGM courante n'est PAS coupée :
      // les 2 slots tournent en parallèle (1:1 GBA).
      await (_staticPlaySong as (m: unknown, vg: unknown, lookup: VgLookupFn, loop: boolean, slot: string, volume: number | null) => Promise<void>)(
        midi, voicegroup, _vgLookup!, false, slot, seSongVol,
      );
    } catch (e) {
      console.error('[PlaySE] failed:', e);
    }
  })();
}

/** Map species ID → species name (= cri filename `cries/<name>.wav`).
 *  Values match décomp `include/constants/species.h` (SPECIES_KYOGRE=404 etc). */
const SPECIES_NAMES: Record<number, string> = {
  404: 'kyogre',     // SPECIES_KYOGRE
  405: 'groudon',    // SPECIES_GROUDON
  406: 'rayquaza',   // SPECIES_RAYQUAZA
  // TODO étendre selon besoin (151 species + extensions Hoenn).
};

/** 1:1 décomp `PlayCryInternal(species, pan, volume, priority, mode)` — joue
 *  le cri d'un Pokémon via WAV pré-extrait. Phase 7 minimal : ignore pan/volume/
 *  priority/mode (le décomp ajuste pitch/pan via m4a, ici on joue le WAV direct). */
export function PlayCryInternal(
  species: number, _pan: number, _volume: number, _priority: number, _mode: number,
): void {
  const name = SPECIES_NAMES[species];
  if (!name) return;
  void import('./music').then(({ playCry }) => playCry(name)).catch(() => { /* silent */ });
}

/** 1:1 décomp constants pour PlayCryInternal (cf. species.h, sound.h). */
export const SPECIES_GROUDON = 405;
export const SPECIES_KYOGRE = 404;
export const SPECIES_RAYQUAZA = 406;
export const CRY_PRIORITY_NORMAL = 2;
export const CRY_MODE_NORMAL = 0;

/** 1:1 décomp `SE_INTRO_BLAST` — sound effect ID. */
export const SE_INTRO_BLAST = 0x14;

/** 1:1 décomp src/intro.c:2810 `PanFadeAndZoomScreen(screenX, screenY, zoom, alpha)`.
 *  Calcule BgAffineSet pour BG2 (texture (0x8000, 0x8000) → screen (screenX, screenY))
 *  avec zoom (sx=sy) et rotation (alpha). Met à jour BG2PA/PB/PC/PD + BG2X/Y. */
export function PanFadeAndZoomScreen(screenX: number, screenY: number, zoom: number, alpha: number): void {
  const r = rt();
  const texX = 0x8000;
  const texY = 0x8000;
  // BgAffineSet : alpha en u16 (0..0xFFFF = 0..360°), interprété via gSineTable.
  // sin/cos en Q.8 fixed (-256..256). pa = cos*sx >> 8, pb = -sin*sy >> 8, etc.
  const G_SINE = G_SINE_TABLE;
  // sineIdx = (alpha >> 8) & 0xFF (256 entries par tour complet)
  const sineIdx = (alpha >> 8) & 0xFF;
  const cosIdx = (sineIdx + 64) & 0xFF;
  const sin = G_SINE[sineIdx];
  const cos = G_SINE[cosIdx];
  // Q.8 fixed math : (cos * zoom) >> 8 = pa
  const pa = (cos * zoom) >> 8;
  const pb = (-sin * zoom) >> 8;
  const pc = (sin * zoom) >> 8;
  const pd = (cos * zoom) >> 8;
  // 1:1 BIOS BgAffineSet : src.texX/texY sont DÉJÀ 28.8 fixed (= 0x8000 = 128.0 px).
  // dest.dx = src.texX - (scrX * pa + scrY * pb). Pas de shift << 8 supplémentaire !
  const dx = texX - (screenX * pa + screenY * pb);
  const dy = texY - (screenX * pc + screenY * pd);
  // Set BG2 affine matrix index 0 (= bg(2).config.affineMatrixIndex)
  if (r.gba.bgAffineMatrices && r.gba.bgAffineMatrices[0]) {
    const m = r.gba.bgAffineMatrices[0] as { pa: number; pb: number; pc: number; pd: number };
    m.pa = pa & 0xFFFF;
    m.pb = pb & 0xFFFF;
    m.pc = pc & 0xFFFF;
    m.pd = pd & 0xFFFF;
  }
  // Sign-extend pour BG2X/Y (28-bit signed)
  r.gba.bg(2).config.affineRefX = dx;
  r.gba.bg(2).config.affineRefY = dy;
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

/** Scene 3 sprite/palette loading via heap dans le décomp. Notre version
 *  fait juste appel aux fonctions normales (pas besoin de heap puisque assets
 *  préchargés en VRAM via `LoadCompressedSpriteSheet` standard). */
export function LoadCompressedSpriteSheetUsingHeap(sheet: unknown): void {
  if (!sheet) return;
  // sheet peut être un objet single ou un array (cas LoadCompressedSpriteSheet).
  if (Array.isArray(sheet)) {
    const first = sheet[0] as { data: string, size: number, tag: string | number } | undefined;
    if (first) LoadCompressedSpriteSheet(first);
  } else {
    LoadCompressedSpriteSheet(sheet as { data: string, size: number, tag: string | number });
  }
}
export function LoadCompressedSpritePaletteUsingHeap(pal: unknown): void {
  if (!pal) return;
  if (Array.isArray(pal)) {
    LoadSpritePalettes(pal as Array<{ data: string, tag: string | number }>);
  } else {
    LoadSpritePalette(pal);
  }
}
export function FreeMonSpritesGfx(): void { /* no-op : pas de heap chez nous */ }

/** 1:1 décomp `GET_TRUE_SPRITE_INDEX(animTag)` macro = `animTag - ANIM_SPRITES_START`.
 *  ANIM_SPRITES_START = 10000 (cf. constants/battle_anim.h). */
export function GET_TRUE_SPRITE_INDEX(animTag: number): number {
  return animTag - 10000;
}

/** 1:1 décomp battle anim sprite sheets/palettes — gBattleAnimPicTable est une
 *  table sparse ; on utilise un Proxy-like accès via Map pour pas remplir 256 stubs.
 *  Scene 3 ANIM_TAG_ROCKS = 10058 → index 58. */
const _battleAnimPicEntries: Record<number, { data: string; size: number; tag: string | number }> = {
  // Index 58 = ROCKS (ANIM_TAG_ROCKS)
  58: { data: 'gBattleAnimSpriteGfx_Rocks', size: 0x600, tag: 'ANIM_TAG_ROCKS' },
};
const _battleAnimPalEntries: Record<number, { data: string; tag: string | number }> = {
  58: { data: 'gBattleAnimSpritePal_Rocks', tag: 'ANIM_TAG_ROCKS' },
};

// Length 256 max, retourne stub vide pour index inconnu (= no-op load).
function _emptyAnimPic(idx: number) { return { data: '', size: 0, tag: idx }; }
function _emptyAnimPal(idx: number) { return { data: '', tag: idx }; }
export const gBattleAnimPicTable: ReadonlyArray<{ data: string; size: number; tag: string | number }> = new Proxy([], {
  get(_t, prop) {
    if (typeof prop === 'string' && /^\d+$/.test(prop)) {
      const idx = Number(prop);
      return _battleAnimPicEntries[idx] ?? _emptyAnimPic(idx);
    }
    if (prop === 'length') return 256;
    return undefined;
  },
}) as unknown as ReadonlyArray<{ data: string; size: number; tag: string | number }>;
export const gBattleAnimPaletteTable: ReadonlyArray<{ data: string; tag: string | number }> = new Proxy([], {
  get(_t, prop) {
    if (typeof prop === 'string' && /^\d+$/.test(prop)) {
      const idx = Number(prop);
      return _battleAnimPalEntries[idx] ?? _emptyAnimPal(idx);
    }
    if (prop === 'length') return 256;
    return undefined;
  },
}) as unknown as ReadonlyArray<{ data: string; tag: string | number }>;

/** Symbol-name keys pour gBattleAnimSpriteGfx_Rocks (preload Scene 3). */
export const gBattleAnimSpriteGfx_Rocks = 'gBattleAnimSpriteGfx_Rocks';
export const gBattleAnimSpritePal_Rocks = 'gBattleAnimSpritePal_Rocks';

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

/** Stubs helpers missing du décomp utilisés par CB2_InitTitleScreen.
 *
 *  DmaFill16 = clear memory range. Le décomp l'utilise pour clear VRAM/OAM/PLTT
 *  avant de charger la nouvelle scene. Mais notre runtime ordonne mal les calls
 *  (les LZ77 sont déjà appelés AVANT DmaFill via async preload), donc DmaFill
 *  efface ce qu'on vient de charger. SOLUTION pragmatique : log les calls pour
 *  debug, mais NE PAS effacer la VRAM (= notre engine fait sa propre gestion).
 *  Tilemap ranges restent 0 parce que les LZ77 tilemaps écrivent après.
 *
 *  IMPORTANT : le décomp original DOIT clear la VRAM car les samples existants
 *  bleed sur les nouvelles scenes. Chez nous on a un VRAM unifié + transitions
 *  contrôlées via gMain.state, donc on peut skip le clear. */
export function DmaFill16(_channel: number, _value: number, destAddr: number, _sizeBytes: number): void {
  // No-op : éviter d'effacer le char data qu'on vient de charger via LZ77.
  // Si le décomp veut clear OAM ou PLTT, on ignore aussi (= notre engine reset
  // ces buffers via ResetSpriteData / ResetPaletteFade). VRAM = 0x06000000 est
  // skipée pour préserver les LZ77 char data.
  void destAddr;
}
export function DmaFill32(_channel: number, _value: number, destAddr: number, _sizeBytes: number): void {
  void destAddr;  // idem no-op
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
  // 1:1 décomp src/scanline_effect.c:72 — appelé chaque VBlank par VBlankCB_Intro.
  // Quand `gScanlineEffect.state === 3`, le décomp stoppe le DMA + réinit state.
  // Chez nous : pas de DMA mais on doit toujours clear le hblank callback pour
  // que le BG arrête d'avoir le wave de la scène précédente.
  if (gScanlineEffect.state === 3) {
    ScanlineEffect_Stop();
  }
  // Real GBA uses DMA from gScanlineEffectRegBuffers to hardware regs (= no-op here).
}

// Expose globally pour que runOneFrame du runtime puisse l'appeler (sans avoir
// à importer decomp-globals depuis decomp-runtime, qui créerait un cycle).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__scanlineEffectTick = ScanlineEffect_InitHBlankDmaTransfer;

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
/** 1:1 décomp `LoadSpritePalette(pal)` — alloue le prochain slot OBJ libre
 *  (>= gReservedSpritePaletteCount), enregistre le tag, et copie 16 colors. */
export function LoadSpritePalette(pal: { data: string, tag: string | number } | unknown): void {
  if (!pal || typeof pal !== 'object') return;
  const p = pal as { data: string, tag: string | number };
  if (typeof p.data !== 'string') return;
  const r = rt();
  const tagStr = String(p.tag);
  if (r.paletteTagToSlot.has(tagStr)) return;
  const palData = getAsset(p.data);
  if (!palData) return;
  const u16 = palData instanceof Uint16Array
    ? palData
    : new Uint16Array(palData.buffer, palData.byteOffset, Math.floor(palData.byteLength / 2));
  // Skip reserved slots — décomp behavior : LoadSpritePalette ignore les
  // slots [0, gReservedSpritePaletteCount) et alloue à partir de là.
  if (r.nextObjPalSlot < gReservedSpritePaletteCount) {
    r.nextObjPalSlot = gReservedSpritePaletteCount;
  }
  if (r.nextObjPalSlot >= 16) return; // OBJ palette saturé
  const slot = r.nextObjPalSlot++;
  r.gba.palette.loadObjRange(slot * 16, u16.subarray(0, 16));
  // Sync gPlttBufferUnfaded/Faded pour CpuCopy16 ultérieur
  for (let i = 0; i < Math.min(16, u16.length); i++) {
    r.gPlttBufferUnfaded.set(256 + slot * 16 + i, u16[i]);
    r.gPlttBufferFaded.set(256 + slot * 16 + i, u16[i]);
  }
  r.paletteTagToSlot.set(tagStr, slot);
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

  // Capture frameBase ONCE à l'init — pas à chaque frame. Lire depuis bg.config
  // chaque scanline 0 cause drift (on overwrite la config à scanline 159, puis
  // on re-lit cette valeur corrompue comme base au prochain scanline 0).
  const bgInit = r.gba.bg(bgIndex as 0 | 1 | 2 | 3);
  const frameBase = prop === 'hofs' ? bgInit.config.hofs : bgInit.config.vofs;

  r.gba.setHBlankCallback((scanline) => {
    if (!waveParams) return;

    const bg = r.gba.bg(bgIndex as 0 | 1 | 2 | 3);

    if (scanline === 0) {
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

/** 1:1 décomp `StartPokemonLogoShine(mode)` — title_screen.c:527.
 *  Crée le(s) sprite(s) shine sweep avec OAM_OBJ_WINDOW + SpriteCB_PokemonLogoShine.
 *  - SHINE_MODE_SINGLE_NO_BG_COLOR (0) / SHINE_MODE_SINGLE (2) : 1 sprite normal
 *  - SHINE_MODE_DOUBLE (1) : 1 sprite invisible BG color + 2 sprites Fast */
export function StartPokemonLogoShine(mode: number): void {
  const r = rt();
  const SHINE_MODE_SINGLE_NO_BG_COLOR = 0;
  const SHINE_MODE_DOUBLE = 1;
  const SHINE_MODE_SINGLE = 2;
  const ST_OAM_OBJ_WINDOW = 2;

  if (mode === SHINE_MODE_SINGLE_NO_BG_COLOR || mode === SHINE_MODE_SINGLE) {
    const spriteId = r.CreateSpriteFromTemplate('sPokemonLogoShineSpriteTemplate', 0, 68);
    const sprite = r.gSprites.get(spriteId);
    if (sprite) {
      r.gba.oam[sprite.oamIndex].objMode = ST_OAM_OBJ_WINDOW;
      sprite.data[0] = mode;  // sMode alias
    }
  } else if (mode === SHINE_MODE_DOUBLE) {
    // Invisible sprite that updates BG color via SpriteCB_PokemonLogoShine
    let spriteId = r.CreateSpriteFromTemplate('sPokemonLogoShineSpriteTemplate', 0, 68);
    let sprite = r.gSprites.get(spriteId);
    if (sprite) {
      r.gba.oam[sprite.oamIndex].objMode = ST_OAM_OBJ_WINDOW;
      sprite.data[0] = mode;
      sprite.invisible = true;
    }
    // Two faster shine sprites — callback override via direct mutation
    const fastCb = (globalThis as any).SpriteCB_PokemonLogoShine_Fast
      ?? r.spriteCallbacks.get('SpriteCB_PokemonLogoShine_Fast');
    spriteId = r.CreateSpriteFromTemplate('sPokemonLogoShineSpriteTemplate', 0, 68);
    sprite = r.gSprites.get(spriteId);
    if (sprite) {
      r.gba.oam[sprite.oamIndex].objMode = ST_OAM_OBJ_WINDOW;
      if (fastCb) sprite.callback = (spr: unknown) => (fastCb as (s: unknown, rt: unknown) => void)(spr, r);
    }
    spriteId = r.CreateSpriteFromTemplate('sPokemonLogoShineSpriteTemplate', -80, 68);
    sprite = r.gSprites.get(spriteId);
    if (sprite) {
      r.gba.oam[sprite.oamIndex].objMode = ST_OAM_OBJ_WINDOW;
      if (fastCb) sprite.callback = (spr: unknown) => (fastCb as (s: unknown, rt: unknown) => void)(spr, r);
    }
  }
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
export const sSpritePalette_PressStart: ReadonlyArray<{ data: string; tag: string }> = [
  { data: 'gTitleScreenPressStartPal', tag: 'TAG_PRESS_START_COPYRIGHT' },
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
  if (!charData) {
    // ⚠️ ASSET MANQUANT : explicitement loud — sans ça flicker random du logo
    // (sIntroDropsLogo_Gfx pas chargé à temps → tile data garbage en OAM VRAM).
    console.error(`[LoadCompressedSpriteSheet] ASSET MISSING : '${sheet.data}' (tag=${sheet.tag}) — tile data NOT in OBJ VRAM. Will cause random sprite garbage.`);
    return;
  }
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
    // Sync gPlttBufferUnfaded/Faded pour CpuCopy16 ultérieur (= ripple variants)
    for (let i = 0; i < Math.min(16, u16.length); i++) {
      r.gPlttBufferUnfaded.set(256 + slot * 16 + i, u16[i]);
      r.gPlttBufferFaded.set(256 + slot * 16 + i, u16[i]);
    }
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
/** 1:1 décomp title_screen.c:859 — color cycling sur BG palette 14 entry 15
 *  (= Rayquaza eye marking). Recalcule la couleur tous les 4 frames depuis
 *  Cos(frameNum, Q_8_8(0.5)) en RGB(r, g, 12). */
export function UpdateLegendaryMarkingColor(frameNum: number): void {
  if ((frameNum & 0xFF) % 4 !== 0) return;
  // Cos(idx, amp) = (G_SINE_TABLE[(idx+64) & 0xFF] * amp) >> 8. Q_8_8(0.5) = 128.
  const cosIdx = ((frameNum & 0xFF) + 64) & 0xFF;
  const cosVal = (G_SINE_TABLE[cosIdx] * 128) >> 8;
  // intensity = cosVal + 128 (= cos*0.5 + 0.5, en Q.8 fixed)
  const intensity = cosVal + 128;
  // r = 31 - (intensity * 31) >> 8, g = 31 - (intensity * 22) >> 8
  const r = 31 - ((intensity * 31) >> 8);
  const g = 31 - ((intensity * 22) >> 8);
  const b = 12;
  // RGB15 = (b << 10) | (g << 5) | r
  const color = ((b & 0x1F) << 10) | ((g & 0x1F) << 5) | (r & 0x1F);
  // 1:1 décomp : BG_PLTT_ID(14) + 15 = slot 239. Doit écrire dans unfaded ET
  // faded car UpdatePaletteFade copie unfaded → faded chaque frame.
  // ⚠️ Notre rayquaza.png a été extrait avec la palette gold (= "Legendary
  // Marking") à idx 0 au lieu d'idx 15. Donc les pixels marking sont rendus
  // transparents (notre BG renderer skip idx 0 = GBATEK behavior 4bpp). TODO
  // ré-extraire rayquaza depuis ROM original ou re-mapper tile data + palette
  // pour avoir gold à idx 15 (= 1:1 décomp). En attendant, ce write est sans
  // effet visible mais reste 1:1 source.
  const slot = 14 * 16 + 15;
  const runtime = rt();
  runtime.gPlttBufferUnfaded.set(slot, color);
  runtime.gPlttBufferFaded.set(slot, color);
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
