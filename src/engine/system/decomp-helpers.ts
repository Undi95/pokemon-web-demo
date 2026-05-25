/**
 * Helpers C runtime du décomp Pokemon Emerald (Sin/Cos/SetOamMatrix/CalcCenterToCornerVec
 * /CpuCopy16/StartSpriteAffineAnim/DestroySprite/gPlttBufferFaded etc.).
 *
 * Utilisés par les SpriteCB_* + Create*Sprite* bodyC. Permet de transcrire
 * littéralement les bodyC C en TS sans réinventer.
 *
 * Sources :
 *   - gSineTable : `decomps/pokeemeraude/src/trig.c` → src/engine/decomp-data/src/sine-table.ts
 *   - Q_8_8 / SPRITE_SHAPE / SPRITE_SIZE constants : include/gba/types.h
 *   - SetOamMatrix : src/sprite.c
 *   - CalcCenterToCornerVec : src/sprite.c (ajuste position pour affine bbox)
 *   - StartSpriteAffineAnim : src/sprite.c (charge une affine anim)
 *   - CpuCopy16 : libgcnmultiboot equivalent (= memcpy en pratique)
 *   - gPlttBufferFaded/Unfaded : 256+256 entries u16 (BG + OBJ palette buffers)
 */
import { Gba } from '../gba/gba';
import { rgba8ToRgb15 } from '../gba/types';
import { G_SINE_TABLE } from '../decomp-data/src/sine-table';
import { getRuntime } from './decomp-globals';

// ─── Sine/Cosine via gSineTable (Q.8 fixed) ──────────────────────────────────
/** 1:1 décomp Sin(idx, amplitude) = (gSineTable[idx & 0xFF] * amplitude) >> 8.
 *  Retourne un s16 (peut être négatif). */
export function Sin(idx: number, amplitude: number): number {
  const i = idx & 0xFF;
  return (G_SINE_TABLE[i] * amplitude) >> 8;
}
/** 1:1 décomp Cos(idx, amp) = Sin((idx + 64) & 0xFF, amp). */
export function Cos(idx: number, amplitude: number): number {
  return Sin(idx + 64, amplitude);
}
/** Lookup direct gSineTable (sans amplitude). */
export function gSineTable(idx: number): number {
  return G_SINE_TABLE[idx & 0xFF];
}

// ─── Q.8.8 fixed-point ────────────────────────────────────────────────────────
/** 1:1 décomp Q_8_8_TO_INT(v) = v >> 8 (signed). */
export function Q_8_8_TO_INT(v: number): number {
  return v >> 8;
}

// ─── Affine matrix slots (gba.affineParams[0..31]) ───────────────────────────
/** 1:1 décomp SetOamMatrix(idx, a, b, c, d) — écrit dans les affine params slots. */
export function SetOamMatrix(gba: Gba, matrixNum: number, a: number, b: number, c: number, d: number): void {
  if (matrixNum < 0 || matrixNum >= 32) return;
  const m = gba.affineParams[matrixNum];
  m.pa = a;
  m.pb = b;
  m.pc = c;
  m.pd = d;
}

// ─── CalcCenterToCornerVec (affine sprite bbox helper) ───────────────────────
/** 1:1 décomp constants src/include/gba/types.h. */
export const ST_OAM_AFFINE_OFF = 0;
export const ST_OAM_AFFINE_NORMAL = 1;
export const ST_OAM_AFFINE_ERASE = 2;
export const ST_OAM_AFFINE_DOUBLE = 3;
export const ST_OAM_AFFINE_ON_MASK = 1;        // bit 0 = affine on
export const ST_OAM_AFFINE_DOUBLE_MASK = 2;    // bit 1 = affine double
export const ST_OAM_OBJ_NORMAL = 0;
export const ST_OAM_OBJ_BLEND = 1;
export const ST_OAM_OBJ_WINDOW = 2;
export const ST_OAM_4BPP = 0;
export const ST_OAM_8BPP = 1;

/** 1:1 décomp src/sprite.c:137 sCenterToCornerVecTable[3][4][2] :
 *  [shape][size] → [centerToCornerVecX, centerToCornerVecY]. En u8 mais valeurs
 *  négatives volontaires (= -w/2, -h/2 du sprite, en pixels).
 *  On utilise les valeurs raw (signées 8-bit interprétées via Int8Array trick). */
export const sCenterToCornerVecTable: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  // shape 0 = square (8x8 / 16x16 / 32x32 / 64x64)
  [[-4, -4], [-8, -8], [-16, -16], [-32, -32]],
  // shape 1 = horizontal rectangle (16x8 / 32x8 / 32x16 / 64x32)
  [[-8, -4], [-16, -4], [-16, -8], [-32, -16]],
  // shape 2 = vertical rectangle (8x16 / 8x32 / 16x32 / 32x64)
  [[-4, -8], [-4, -16], [-8, -16], [-16, -32]],
];

/** 1:1 décomp src/sprite.c:687 CalcCenterToCornerVec :
 *    u8 x = sCenterToCornerVecTable[shape][size][0];
 *    u8 y = sCenterToCornerVecTable[shape][size][1];
 *    if (affineMode & ST_OAM_AFFINE_DOUBLE_MASK) { x *= 2; y *= 2; }
 *    sprite->centerToCornerVecX = x;
 *    sprite->centerToCornerVecY = y;
 *
 *  Stocke le décalage à appliquer au sprite pour positionnement correct selon
 *  shape/size/affineMode. Le décomp utilise centerToCornerVecX/Y dans BuildOamBuffer
 *  pour calculer la position OAM finale. Notre runtime applique ce décalage dans
 *  syncSpritesToOam (= oam.x = sprite.x + sprite.x2 + sprite.centerToCornerVecX).
 */
export function CalcCenterToCornerVec(
  shape: number, size: number, affineMode: number,
): { centerToCornerVecX: number, centerToCornerVecY: number } {
  let [x, y] = sCenterToCornerVecTable[shape & 3]?.[size & 3] ?? [0, 0];
  if (affineMode & ST_OAM_AFFINE_DOUBLE_MASK) {
    x *= 2;
    y *= 2;
  }
  return { centerToCornerVecX: x, centerToCornerVecY: y };
}

// ─── Affine animations (sAffineAnims_X tables) ───────────────────────────────
/** Affine anim state : tracking la frame courante d'une affine animation pour un sprite.
 *  Quand StartSpriteAffineAnim(sprite, idx) est appelé, on init cet état pour le sprite.
 *  Chaque tick, on advance la frame, accumule scale/rotation, écrit dans le matrix slot. */
export interface SpriteAffineAnimState {
  /** Nom du table sAffineAnims_X */
  affineAnimsTableName: string;
  /** Index de l'affine anim active dans le table */
  animIdx: number;
  /** Index de la frame courante */
  frameIdx: number;
  /** Frames restantes avant de passer à la frame suivante */
  framesRemaining: number;
  /** Scale courant (X et Y) accumulés depuis les frames affine (= valeurs Q.8.8 cumulées) */
  scaleX: number;
  scaleY: number;
  /** Rotation courante (Q.8.8) */
  rotation: number;
  /** Slot affine matrix associé (= sprite.matrixNum, 0-31) */
  matrixNum: number;
  /** True quand l'anim a fini (terminator END atteint, stable sur dernière frame) */
  ended: boolean;
}

// ─── Palette buffers (gPlttBufferFaded/Unfaded) ──────────────────────────────
/** Wrapper pour gPlttBufferFaded[N] = N-ème entry palette flat (BG + OBJ).
 *  Layout 1:1 GBA : 256 BG colors + 256 OBJ colors = 512 u16.
 *  N < 256 → BG, N >= 256 → OBJ idx (N - 256).
 *  Notre gba.palette n'expose pas les buffers raw, on les simule via load/get. */
export class PaletteBuffer {
  /** 512 RGB15 entries (256 BG + 256 OBJ). */
  private buffer = new Uint16Array(512);

  constructor(public readonly gba: Gba) {}

  /** Lit une entry (idx 0-511). */
  get(flatIdx: number): number {
    return this.buffer[flatIdx] ?? 0;
  }

  /** Écrit une entry (idx 0-511) dans le buffer interne uniquement.
   *  ⚠️ 1:1 décomp : LoadPalette + UpdatePaletteFade écrivent dans
   *  gPlttBufferFaded. Le PLTT register (= compositor-visible palette) n'est
   *  mis à jour qu'au VBlank via TransferPlttBuffer. Avant cette fix, on
   *  propageait IMMEDIATEMENT à gba.palette → flash bright pendant les CB2
   *  init de scène (= LoadPalette visible avant fade-in start). */
  set(flatIdx: number, rgb15: number): void {
    if (flatIdx < 0 || flatIdx >= 512) return;
    this.buffer[flatIdx] = rgb15;
  }

  /** 1:1 décomp `TransferPlttBuffer` body — copy this buffer → gba.palette
   *  (= equivalent du DmaCopy16(faded → PLTT) au VBlank). À call depuis
   *  TransferPlttBuffer (decomp-globals) à chaque VBlank. */
  flushTo(): void {
    for (let i = 0; i < 256; i++) {
      this.gba.palette.loadBgRange(i, [this.buffer[i]]);
    }
    for (let i = 0; i < 256; i++) {
      this.gba.palette.loadObjRange(i, [this.buffer[256 + i]]);
    }
  }

  /** Bulk write : écrit `colors` à partir de `dstFlat` (0-511). */
  setRange(dstFlat: number, colors: ArrayLike<number>): void {
    for (let i = 0; i < colors.length; i++) this.set(dstFlat + i, colors[i]);
  }

  /** 1:1 décomp CpuCopy16(src, dst, sizeBytes) : copie sizeBytes/2 entries.
   *  src et dst sont des "addresses" dans nos buffers — on simplifie en passant
   *  un Uint16Array source + un dst flatIdx. */
  cpuCopy16(src: ArrayLike<number>, srcOffset: number, dstFlat: number, count: number): void {
    for (let i = 0; i < count; i++) this.set(dstFlat + i, src[srcOffset + i] ?? 0);
  }
}

/** Helper : résout RGB(r, g, b) macro décomp = pack en RGB15. */
export function RGB(r: number, g: number, b: number): number {
  return ((b & 0x1F) << 10) | ((g & 0x1F) << 5) | (r & 0x1F);
}

/** Helper : résout _RGB(r, g, b) macro = pareil que RGB. */
export const _RGB = RGB;

/** RGB_BLACK = 0, RGB_WHITE = 0x7FFF, RGB_WHITEALPHA = 0x8000 | 0x7FFF (special). */
export const RGB_BLACK = 0;
export const RGB_WHITE = 0x7FFF;
export const RGB_WHITEALPHA = 0xFFFF;

/** Convertit un RGBA8 (0-255) → RGB15. */
export const rgba8ToRgb15Helper = rgba8ToRgb15;

// ─── PLTT_SIZE_4BPP / PLTT_SIZE_8BPP / PLTT_SIZEOF / BG_PLTT_ID / OBJ_PLTT_ID ─
/** 1:1 décomp constants. PLTT_SIZE_4BPP = 16 colors × 2 bytes = 32 bytes.
 *  PLTT_SIZEOF(N) = N × 2 bytes. BG_PLTT_ID(N) = N × 16 (indices). */
export const PLTT_SIZE_4BPP = 32;
export const PLTT_SIZE_8BPP = 512;
export function PLTT_SIZEOF(n: number): number { return n * 2; }

/** OBJ_PLTT_ID dans gPlttBufferFaded → flatIdx 256 + N×16. */
export function OBJ_PLTT_ID_FADED(n: number): number { return 256 + n * 16; }
export function BG_PLTT_ID_FADED(n: number): number { return n * 16; }

// ─── BG tilemap entry helpers (1:1 décomp gba/defines.h:48-49) ───────────────
/** BG_TILE_H_FLIP(n) = 0x400 + n. Set le flag horizontal flip + tile index n. */
export function BG_TILE_H_FLIP(n: number): number { return 0x400 + n; }
/** BG_TILE_V_FLIP(n) = 0x800 + n. Set le flag vertical flip + tile index n. */
export function BG_TILE_V_FLIP(n: number): number { return 0x800 + n; }

// ─── Function-like #define macros from include/gba/io_reg.h ──────────────────
/** 1:1 décomp `#define BLDALPHA_BLEND(t1, t2) (((t2) << 8) | (t1))`. */
export function BLDALPHA_BLEND(t1: number, t2: number): number {
  return ((t2 & 0xFF) << 8) | (t1 & 0xFF);
}
/** 1:1 décomp `#define WIN_RANGE(a, b) (((a) << 8) | (b))`. */
export function WIN_RANGE(a: number, b: number): number {
  return ((a & 0xFF) << 8) | (b & 0xFF);
}
/** 1:1 décomp `#define GET_TRUE_SPRITE_INDEX(i) ((i - ANIM_SPRITES_START))`.
 *  ANIM_SPRITES_START = 10000 (battle anim sprite tag base). */
export const ANIM_SPRITES_START = 10000;
export function GET_TRUE_SPRITE_INDEX(i: number): number { return i - ANIM_SPRITES_START; }

// ─── SPRITE_SHAPE / SPRITE_SIZE constants (extracted from include/gba/types.h) ─
/** Décode `SPRITE_SHAPE(WxH)` macro string ("16x32") en (shape, size) tuple.
 *  Notre OAM_DATAS contient `_sizeWH` numérique → on n'a pas besoin de décoder. */
export function spriteShapeFromString(s: string): { w: number, h: number } {
  const m = s.match(/SPRITE_SHAPE\((\d+)x(\d+)\)/);
  if (!m) return { w: 8, h: 8 };
  return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
}

// Re-export audio stub from decomp-globals so auto-generated callbacks can import it.
export { FreeAllSpritePalettes } from './decomp-globals';

/** 1:1 décomp `GetGpuReg(regOffset)` — lit la valeur courante d'un registre GPU. */
export function GetGpuReg(regOffset: number): number {
  return getRuntime().GetGpuReg(regOffset);
}

/** 1:1 décomp `SetGpuRegBits(regOffset, mask)` — set bits dans un registre GPU. */
export function SetGpuRegBits(regOffset: number, mask: number): void {
  const rt = getRuntime();
  rt.SetGpuReg(regOffset, rt.GetGpuReg(regOffset) | mask);
}

/** 1:1 décomp `ClearGpuRegBits(regOffset, mask)` — clear bits dans un registre GPU. */
export function ClearGpuRegBits(regOffset: number, mask: number): void {
  const rt = getRuntime();
  rt.SetGpuReg(regOffset, rt.GetGpuReg(regOffset) & ~mask);
}

/** 1:1 décomp `EnableInterrupts(mask)` — stub (pas d'émulation IRQ). */
export function EnableInterrupts(_mask: number): void {
  // no-op stub
}

/** 1:1 décomp `DisableInterrupts(mask)` — stub. */
export function DisableInterrupts(_mask: number): void {
  // no-op stub
}
