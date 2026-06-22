/**
 * mon-summary-anim.ts — Animation d'intro du Pokémon (écran RÉSUMÉ) 1:1 décomp
 * `src/pokemon_animation.c` (5544 l) + `PokemonSummaryDoMonAnimation`
 * (pokemon.c:6826) + delay task (pokemon.c:6761).
 *
 * Port FIDÈLE de TOUTES les fonctions d'animation (≈240 : 151 Anim_* +
 * helpers partagés) via le système affine OAM du runtime (= pattern prouvé
 * pokéball SAC : AllocOamMatrix + SetOamMatrix par frame). Arithmétique
 * ENTIÈRE C respectée (Math.trunc pour `/`, `%` JS = `%` C tronqué, `>>`
 * s32). `sprite->data[]` = DecompSprite.data (Int16Array → wrap s16 1:1).
 *
 * sIsSummaryAnim = TRUE (toujours, contexte résumé). sDontFlip = data[1] =
 * IsMonSpriteNotFlipped(species) (posé par SpriteCB_Pokemon).
 *
 * Limite HONNÊTE documentée : `HasTwoFramesAnimation`/StartSpriteAnim(.,1)
 * (2e frame du front-pic combat) — nos front.png résumé sont 1-frame →
 * no-op (même statut que les sprites combat). L'anim AFFINE joue 1:1.
 */
import type { DecompRuntime, DecompSprite } from '../system/decomp-runtime';
import { getRuntime } from '../system/decomp-globals';
import { AllocOamMatrix, FreeOamMatrix } from '../../sprite';
import { SpriteCallbackDummy, BlendPalette } from '../system/decomp-globals';
import { Sin, Cos, gSineTable, SetOamMatrix, CalcCenterToCornerVec } from '../system/decomp-helpers';
import { OBJ_PLTT_ID } from '../system/decomp-runtime';
import { RAW_MON_FRONT_ANIM_IDS, RAW_MON_ANIM_DELAYS } from '../decomp-data/src/mon-anim-tables-data';
import { ENUM_BattlerId } from '../decomp-data/include/constants/battle-data';

/* ── RGB (1:1 include/constants/rgb.h) ───────────────────────────────────── */
const RGB = (r: number, g: number, b: number) => (r | (g << 5) | (b << 10));
const RGB_BLACK = RGB(0, 0, 0);
const RGB_RED = RGB(31, 0, 0);
const RGB_GREEN = RGB(0, 31, 0);
const RGB_BLUE = RGB(0, 0, 31);
const RGB_YELLOW = RGB(31, 31, 0);

/* ── int helpers (C integer semantics) ───────────────────────────────────── */
const T = Math.trunc;                       // C integer division (toward 0)

/* ── ANIM_* (1:1 include/pokemon_animation.h) ────────────────────────────── */
const ANIM: Record<string, number> = {
  ANIM_V_SQUISH_AND_BOUNCE: 0, ANIM_CIRCULAR_STRETCH_TWICE: 1, ANIM_H_VIBRATE: 2,
  ANIM_H_SLIDE: 3, ANIM_V_SLIDE: 4, ANIM_BOUNCE_ROTATE_TO_SIDES: 5,
  ANIM_V_JUMPS_H_JUMPS: 6, ANIM_ROTATE_TO_SIDES: 7, ANIM_ROTATE_TO_SIDES_TWICE: 8,
  ANIM_GROW_VIBRATE: 9, ANIM_ZIGZAG_FAST: 10, ANIM_SWING_CONCAVE: 11,
  ANIM_SWING_CONCAVE_FAST: 12, ANIM_SWING_CONVEX: 13, ANIM_SWING_CONVEX_FAST: 14,
  ANIM_H_SHAKE: 15, ANIM_V_SHAKE: 16, ANIM_CIRCULAR_VIBRATE: 17, ANIM_TWIST: 18,
  ANIM_SHRINK_GROW: 19, ANIM_CIRCLE_C_CLOCKWISE: 20, ANIM_GLOW_BLACK: 21,
  ANIM_H_STRETCH: 22, ANIM_V_STRETCH: 23, ANIM_RISING_WOBBLE: 24,
  ANIM_V_SHAKE_TWICE: 25, ANIM_TIP_MOVE_FORWARD: 26, ANIM_H_PIVOT: 27,
  ANIM_V_SLIDE_WOBBLE: 28, ANIM_H_SLIDE_WOBBLE: 29, ANIM_V_JUMPS_BIG: 30,
  ANIM_SPIN_LONG: 31, ANIM_GLOW_ORANGE: 32, ANIM_GLOW_RED: 33, ANIM_GLOW_BLUE: 34,
  ANIM_GLOW_YELLOW: 35, ANIM_GLOW_PURPLE: 36, ANIM_BACK_AND_LUNGE: 37,
  ANIM_BACK_FLIP: 38, ANIM_FLICKER: 39, ANIM_BACK_FLIP_BIG: 40, ANIM_FRONT_FLIP: 41,
  ANIM_TUMBLING_FRONT_FLIP: 42, ANIM_FIGURE_8: 43, ANIM_FLASH_YELLOW: 44,
  ANIM_SWING_CONCAVE_FAST_SHORT: 45, ANIM_SWING_CONVEX_FAST_SHORT: 46,
  ANIM_ROTATE_UP_SLAM_DOWN: 47, ANIM_DEEP_V_SQUISH_AND_BOUNCE: 48, ANIM_H_JUMPS: 49,
  ANIM_H_JUMPS_V_STRETCH: 50, ANIM_ROTATE_TO_SIDES_FAST: 51, ANIM_ROTATE_UP_TO_SIDES: 52,
  ANIM_FLICKER_INCREASING: 53, ANIM_TIP_HOP_FORWARD: 54, ANIM_PIVOT_SHAKE: 55,
  ANIM_TIP_AND_SHAKE: 56, ANIM_VIBRATE_TO_CORNERS: 57, ANIM_GROW_IN_STAGES: 58,
  ANIM_V_SPRING: 59, ANIM_V_REPEATED_SPRING: 60, ANIM_SPRING_RISING: 61,
  ANIM_H_SPRING: 62, ANIM_H_REPEATED_SPRING_SLOW: 63, ANIM_H_SLIDE_SHRINK: 64,
  ANIM_LUNGE_GROW: 65, ANIM_CIRCLE_INTO_BG: 66, ANIM_RAPID_H_HOPS: 67,
  ANIM_FOUR_PETAL: 68, ANIM_V_SQUISH_AND_BOUNCE_SLOW: 69, ANIM_H_SLIDE_SLOW: 70,
  ANIM_V_SLIDE_SLOW: 71, ANIM_BOUNCE_ROTATE_TO_SIDES_SMALL: 72,
  ANIM_BOUNCE_ROTATE_TO_SIDES_SLOW: 73, ANIM_BOUNCE_ROTATE_TO_SIDES_SMALL_SLOW: 74,
  ANIM_ZIGZAG_SLOW: 75, ANIM_H_SHAKE_SLOW: 76, ANIM_V_SHAKE_SLOW: 77,
  ANIM_TWIST_TWICE: 78, ANIM_CIRCLE_C_CLOCKWISE_SLOW: 79, ANIM_V_SHAKE_TWICE_SLOW: 80,
  ANIM_V_SLIDE_WOBBLE_SMALL: 81, ANIM_V_JUMPS_SMALL: 82, ANIM_SPIN: 83,
  ANIM_TUMBLING_FRONT_FLIP_TWICE: 84, ANIM_DEEP_V_SQUISH_AND_BOUNCE_TWICE: 85,
  ANIM_H_JUMPS_V_STRETCH_TWICE: 86, ANIM_V_SHAKE_BACK: 87, ANIM_V_SHAKE_BACK_SLOW: 88,
  ANIM_V_SHAKE_H_SLIDE_SLOW: 89, ANIM_V_STRETCH_BOTH_ENDS_SLOW: 90,
  ANIM_H_STRETCH_FAR_SLOW: 91, ANIM_V_SHAKE_LOW_TWICE: 92, ANIM_H_SHAKE_FAST: 93,
  ANIM_H_SLIDE_FAST: 94, ANIM_H_VIBRATE_FAST: 95, ANIM_H_VIBRATE_FASTEST: 96,
  ANIM_V_SHAKE_BACK_FAST: 97, ANIM_V_SHAKE_LOW_TWICE_SLOW: 98,
  ANIM_V_SHAKE_LOW_TWICE_FAST: 99, ANIM_CIRCLE_C_CLOCKWISE_LONG: 100,
  ANIM_GROW_STUTTER_SLOW: 101, ANIM_V_SHAKE_H_SLIDE: 102, ANIM_V_SHAKE_H_SLIDE_FAST: 103,
  ANIM_TRIANGLE_DOWN_SLOW: 104, ANIM_TRIANGLE_DOWN: 105, ANIM_TRIANGLE_DOWN_TWICE: 106,
  ANIM_GROW: 107, ANIM_GROW_TWICE: 108, ANIM_H_SPRING_FAST: 109, ANIM_H_SPRING_SLOW: 110,
  ANIM_H_REPEATED_SPRING_FAST: 111, ANIM_H_REPEATED_SPRING: 112, ANIM_SHRINK_GROW_FAST: 113,
  ANIM_SHRINK_GROW_SLOW: 114, ANIM_V_STRETCH_BOTH_ENDS: 115,
  ANIM_V_STRETCH_BOTH_ENDS_TWICE: 116, ANIM_H_STRETCH_FAR_TWICE: 117,
  ANIM_H_STRETCH_FAR: 118, ANIM_GROW_STUTTER_TWICE: 119, ANIM_GROW_STUTTER: 120,
  ANIM_CONCAVE_ARC_LARGE_SLOW: 121, ANIM_CONCAVE_ARC_LARGE: 122,
  ANIM_CONCAVE_ARC_LARGE_TWICE: 123, ANIM_CONVEX_DOUBLE_ARC_SLOW: 124,
  ANIM_CONVEX_DOUBLE_ARC: 125, ANIM_CONVEX_DOUBLE_ARC_TWICE: 126,
  ANIM_CONCAVE_ARC_SMALL_SLOW: 127, ANIM_CONCAVE_ARC_SMALL: 128,
  ANIM_CONCAVE_ARC_SMALL_TWICE: 129, ANIM_H_DIP: 130, ANIM_H_DIP_FAST: 131,
  ANIM_H_DIP_TWICE: 132, ANIM_SHRINK_GROW_VIBRATE_FAST: 133, ANIM_SHRINK_GROW_VIBRATE: 134,
  ANIM_SHRINK_GROW_VIBRATE_SLOW: 135, ANIM_JOLT_RIGHT_FAST: 136, ANIM_JOLT_RIGHT: 137,
  ANIM_JOLT_RIGHT_SLOW: 138, ANIM_SHAKE_FLASH_YELLOW_FAST: 139, ANIM_SHAKE_FLASH_YELLOW: 140,
  ANIM_SHAKE_FLASH_YELLOW_SLOW: 141, ANIM_SHAKE_GLOW_RED_FAST: 142, ANIM_SHAKE_GLOW_RED: 143,
  ANIM_SHAKE_GLOW_RED_SLOW: 144, ANIM_SHAKE_GLOW_GREEN_FAST: 145, ANIM_SHAKE_GLOW_GREEN: 146,
  ANIM_SHAKE_GLOW_GREEN_SLOW: 147, ANIM_SHAKE_GLOW_BLUE_FAST: 148, ANIM_SHAKE_GLOW_BLUE: 149,
  ANIM_SHAKE_GLOW_BLUE_SLOW: 150,
};

/* ── sAnims (1:1 struct PokemonAnimData sAnims[MAX_BATTLERS_COUNT]) ───────── */
interface PokemonAnimData { delay: number; speed: number; runs: number; rotation: number; data: number }
// 1:1 décomp `MAX_BATTLERS_COUNT` (constants/battle.h) — extracted as
// ENUM_BattlerId.MAX_BATTLERS_COUNT dans decomp-data battle-data.ts.
const MAX_BATTLERS_COUNT = ENUM_BattlerId.MAX_BATTLERS_COUNT;
const sAnims: PokemonAnimData[] = Array.from({ length: MAX_BATTLERS_COUNT },
  () => ({ delay: 0, speed: 0, runs: 1, rotation: 0, data: 0 }));
let sAnimIdx = 0;
const sIsSummaryAnim = true;                 // toujours (contexte résumé)

function InitAnimData(id: number): boolean {
  if (id >= MAX_BATTLERS_COUNT) return false;
  sAnims[id].rotation = 0; sAnims[id].delay = 0; sAnims[id].runs = 1;
  sAnims[id].speed = 0; sAnims[id].data = 0;
  return true;
}
function AddNewAnim(): number {
  sAnimIdx = (sAnimIdx + 1) % MAX_BATTLERS_COUNT;
  InitAnimData(sAnimIdx);
  return sAnimIdx;
}

/* ── Sprite adapter (DecompSprite ↔ décomp `struct Sprite *`) ─────────────── */
type S = DecompSprite;
const sDontFlip = (s: S) => s.data[1];                       // #define sDontFlip data[1]
function setCb(s: S, fn: (s: S) => void): void { s.callback = (sp) => fn(sp as S); }
function oamPalNum(s: S): number {
  const rt = getRuntime(); return rt ? rt.gba.oam[s.oamIndex].paletteBank : 0;  // décomp oam.paletteNum
}

/* ── ObjAffineSet (1:1 BIOS) + SetAffineData (pokemon_animation.c:984) ────── */
function objAffineSet(xScale: number, yScale: number, rotation: number): [number, number, number, number] {
  const i = (rotation >> 8) & 0xFF;          // BIOS : 0x10000 = tour complet → idx = rot>>8
  const sin = gSineTable(i);
  const cos = gSineTable((i + 64) & 0xFF);
  return [(xScale * cos) >> 8, -((xScale * sin) >> 8), (yScale * sin) >> 8, (yScale * cos) >> 8];
}
function SetAffineData(s: S, xScale: number, yScale: number, rotation: number): void {
  const rt = getRuntime(); if (!rt) return;
  const [pa, pb, pc, pd] = objAffineSet(xScale, yScale, rotation);
  SetOamMatrix(rt.gba, s.matrixNum, pa, pb, pc, pd);
}
/* HandleStartAffineAnim (:1003) : DOUBLE + alloc matrix + frame flip/identity. */
function HandleStartAffineAnim(s: S): void {
  const rt = getRuntime(); if (!rt) return;
  const oam = rt.gba.oam[s.oamIndex];
  s.affineMode = 3; if (oam) oam.affineMode = 3;             // ST_OAM_AFFINE_DOUBLE
  if (s.matrixNum <= 0) {
    const m = AllocOamMatrix();
    s.matrixNum = m < 0 ? 0 : m;
  }
  if (oam) oam.affineParamIndex = s.matrixNum;
  // StartSpriteAffineAnim(.,1)=sMonAffineAnim_1(-256,256,0) flip ; (.,0)=_0 identité.
  const x0 = !sDontFlip(s) ? -256 : 256;
  SetAffineData(s, x0, 256, 0);
  const c = CalcCenterToCornerVec(s.shape, s.size, 3);
  s.centerToCornerVecX = c.centerToCornerVecX;
  s.centerToCornerVecY = c.centerToCornerVecY;
}
/* HandleSetAffineData (:1020). */
function HandleSetAffineData(s: S, xScale: number, yScale: number, rotation: number): void {
  if (!sDontFlip(s)) { xScale *= -1; rotation *= -1; }
  SetAffineData(s, xScale, yScale, rotation);
}
/* TryFlipX (:1031). */
function TryFlipX(s: S): void { if (!sDontFlip(s)) s.x2 *= -1; }
/* ResetSpriteAfterAnim (:1061) — branche sIsSummaryAnim. */
function ResetSpriteAfterAnim(s: S): void {
  const rt = getRuntime(); if (!rt) return;
  const oam = rt.gba.oam[s.oamIndex];
  s.hFlip = !sDontFlip(s);                                    // !sDontFlip → hFlip=TRUE
  if (s.matrixNum > 0) FreeOamMatrix(s.matrixNum);
  s.matrixNum = 0;
  s.affineMode = 0; if (oam) { oam.affineMode = 0; oam.affineParamIndex = 0; } // AFFINE_OFF
  const c = CalcCenterToCornerVec(s.shape, s.size, 0);
  s.centerToCornerVecX = c.centerToCornerVecX;
  s.centerToCornerVecY = c.centerToCornerVecY;
}
/* WaitAnimEnd (:5540) : nos front-pic résumé = 1-frame (animEnded immédiat) →
 * callback dummy (ResetSpriteAfterAnim a déjà rétabli le sprite statique). */
function WaitAnimEnd(s: S): void { s.callback = SpriteCallbackDummy as unknown as S['callback']; }
function MonAnimDummySpriteCallback(_s: S): void { /* no-op (délai) */ }
/* SetPosForRotation (:868). */
function SetPosForRotation(s: S, index: number, amplitudeX: number, amplitudeY: number): void {
  amplitudeX *= -1; amplitudeY *= -1;
  const xAdder = Cos(index, amplitudeX) - Sin(index, amplitudeY);
  const yAdder = Cos(index, amplitudeY) + Sin(index, amplitudeX);
  amplitudeX *= -1; amplitudeY *= -1;
  s.x2 = xAdder + amplitudeX;
  s.y2 = yAdder + amplitudeY;
}

/* ── Données tables (1:1) ────────────────────────────────────────────────── */
const sZigzagData: ReadonlyArray<readonly [number, number, number]> = [
  [-1, -1, 6], [2, 0, 6], [-2, 2, 6], [2, 0, 6], [-2, -2, 6],
  [2, 0, 6], [-2, 2, 6], [2, 0, 6], [-1, -1, 6], [0, 0, 0],
];
const sBounceRotateToSidesData: ReadonlyArray<ReadonlyArray<readonly [number, number, number]>> = [
  [[0, 8, 8], [8, -8, 12], [-8, 8, 12], [8, -8, 12], [-8, 8, 12], [8, -8, 12], [-8, 0, 12], [0, 0, 0]],
  [[0, 8, 16], [8, -8, 24], [-8, 8, 24], [8, -8, 24], [-8, 8, 24], [8, -8, 24], [-8, 0, 24], [0, 0, 0]],
];
const sVerticalShakeData: ReadonlyArray<readonly [number, number]> = [
  [6, 30], [254, 15], [6, 30], [255, 0],   // -2→254 (u8), -1→255 (u8)
];
const sTriangleDownData: ReadonlyArray<readonly [number, number, number]> = [
  [1, 1, 12], [-2, 0, 12], [1, -1, 12], [0, 0, 0],
];
const sYellowFlashData: ReadonlyArray<readonly [number, number]> = [
  [0, 5], [1, 1], [0, 15], [1, 4], [0, 2], [1, 2], [0, 2], [1, 2],
  [0, 2], [1, 2], [0, 2], [1, 2], [0, 2], [0, -1],
];
const sShakeYellowFlashData_Fast: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [0, 15], [1, 1], [0, 15], [1, 1], [0, 15], [1, 1],
  [0, 1], [1, 1], [0, 1], [1, 1], [0, 1], [1, 1], [0, 1], [1, 1],
  [0, 1], [1, 1], [0, 1], [0, -1],
];
const sShakeYellowFlashData_Normal: ReadonlyArray<readonly [number, number]> = [
  [0, 5], [1, 1], [0, 15], [1, 4], [0, 2], [1, 2], [0, 2], [1, 2],
  [0, 2], [1, 2], [0, 2], [1, 2], [0, 2], [0, -1],
];
const sShakeYellowFlashData_Slow: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 1], [0, 20], [1, 1], [0, 20], [1, 1], [0, 20], [1, 1], [0, 1], [0, -1],
];
const sShakeYellowFlashData = [sShakeYellowFlashData_Fast, sShakeYellowFlashData_Normal, sShakeYellowFlashData_Slow];
const SHAKEGLOW_COLORS = [RGB_RED, RGB_GREEN, RGB_BLUE, RGB_BLACK];

/* ── Animations 1:1 (pokemon_animation.c:1087-5538) ──────────────────────── */
function Anim_CircularStretchTwice(s: S): void {
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > 40) { HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    const v = T(s.data[2] * 512 / 40) % 256;
    s.data[4] = Sin(v, 32) + 256; s.data[5] = Cos(v, 32) + 256;
    HandleSetAffineData(s, s.data[4], s.data[5], 0);
  }
  s.data[2]++;
}
function Anim_HorizontalVibrate(s: S): void {
  if (s.data[2] > 40) { setCb(s, WaitAnimEnd); s.x2 = 0; }
  else { const sign = !(s.data[2] & 1) ? 1 : -1; s.x2 = Sin(T(s.data[2] * 128 / 40) % 256, 6) * sign; }
  s.data[2]++;
}
function HorizontalSlide(s: S): void {
  TryFlipX(s);
  if (s.data[2] > s.data[0]) { setCb(s, WaitAnimEnd); s.x2 = 0; }
  else s.x2 = Sin(T(s.data[2] * 384 / s.data[0]) % 256, 6);
  s.data[2]++; TryFlipX(s);
}
function Anim_HorizontalSlide(s: S): void { s.data[0] = 40; HorizontalSlide(s); setCb(s, HorizontalSlide); }
function VerticalSlide(s: S): void {
  TryFlipX(s);
  if (s.data[2] > s.data[0]) { setCb(s, WaitAnimEnd); s.y2 = 0; }
  else s.y2 = -(Sin(T(s.data[2] * 384 / s.data[0]) % 256, 6));
  s.data[2]++; TryFlipX(s);
}
function Anim_VerticalSlide(s: S): void { s.data[0] = 40; VerticalSlide(s); setCb(s, VerticalSlide); }
function VerticalJumps(s: S): void {
  let counter = s.data[2];
  if (counter > 384) { setCb(s, WaitAnimEnd); s.x2 = 0; s.y2 = 0; }
  else {
    const divCounter = T(counter / 128);
    switch (divCounter) {
      case 0: case 1: s.y2 = -(Sin(counter % 128, s.data[0] * 2)); break;
      case 2: case 3: counter -= 256; s.y2 = -(Sin(counter, s.data[0] * 3)); break;
    }
  }
  s.data[2] += 12;
}
function Anim_VerticalJumps_Big(s: S): void { s.data[0] = 4; VerticalJumps(s); setCb(s, VerticalJumps); }
function Anim_VerticalJumpsHorizontalJumps(s: S): void {
  let counter = s.data[2];
  if (counter > 768) { setCb(s, WaitAnimEnd); s.x2 = 0; s.y2 = 0; }
  else {
    const divCounter = T(counter / 128);
    switch (divCounter) {
      case 0: case 1: s.x2 = 0; break;
      case 2: counter = 0; break;
      case 3: s.x2 = T(-(counter % 128 * 8) / 128); break;
      case 4: s.x2 = T(counter % 128 / 8) - 8; break;
      case 5: s.x2 = T(-(counter % 128 * 8) / 128) + 8; break;
    }
    s.y2 = -(Sin(counter % 128, 8));
  }
  s.data[2] += 12;
}
function Anim_GrowVibrate(s: S): void {
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > 40) { HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    const index = T(s.data[2] * 256 / 40) % 256;
    if (s.data[2] % 2 === 0) { s.data[4] = Sin(index, 32) + 256; s.data[5] = Sin(index, 32) + 256; }
    else { s.data[4] = Sin(index, 8) + 256; s.data[5] = Sin(index, 8) + 256; }
    HandleSetAffineData(s, s.data[4], s.data[5], 0);
  }
  s.data[2]++;
}
function Zigzag(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) s.data[3] = 0;
  if (sZigzagData[s.data[3]][2] === s.data[2]) {
    if (sZigzagData[s.data[3]][2] === 0) setCb(s, WaitAnimEnd);
    else { s.data[3]++; s.data[2] = 0; }
  }
  if (sZigzagData[s.data[3]][2] === 0) setCb(s, WaitAnimEnd);
  else {
    s.x2 += sZigzagData[s.data[3]][0]; s.y2 += sZigzagData[s.data[3]][1];
    s.data[2]++; TryFlipX(s);
  }
}
function Anim_ZigzagFast(s: S): void { Zigzag(s); setCb(s, Zigzag); }
function HorizontalShake(s: S): void {
  const counter = s.data[2];
  if (counter > 2304) { setCb(s, WaitAnimEnd); s.x2 = 0; }
  else s.x2 = Sin(counter % 256, s.data[7]);
  s.data[2] += s.data[0];
}
function Anim_HorizontalShake(s: S): void { s.data[0] = 60; s.data[7] = 3; HorizontalShake(s); setCb(s, HorizontalShake); }
function VerticalShake(s: S): void {
  const counter = s.data[2];
  if (counter > 2304) { setCb(s, WaitAnimEnd); s.y2 = 0; }
  else s.y2 = Sin(counter % 256, 3);
  s.data[2] += s.data[0];
}
function Anim_VerticalShake(s: S): void { s.data[0] = 60; VerticalShake(s); setCb(s, VerticalShake); }
function Anim_CircularVibrate(s: S): void {
  if (s.data[2] > 512) { setCb(s, WaitAnimEnd); s.x2 = 0; s.y2 = 0; }
  else {
    const sign = !(s.data[2] & 1) ? 1 : -1;
    const amplitude = Sin(T(s.data[2] / 4), 8);
    const index = s.data[2] % 256;
    s.y2 = Sin(index, amplitude) * sign;
    s.x2 = Cos(index, amplitude) * sign;
  }
  s.data[2] += 9;
}
function Twist(s: S): void {
  const id = s.data[0];
  if (sAnims[id].delay !== 0) { sAnims[id].delay--; return; }
  if (s.data[2] === 0 && sAnims[id].data === 0) { HandleStartAffineAnim(s); sAnims[id].data++; }
  if (s.data[2] > sAnims[id].rotation) {
    HandleSetAffineData(s, 256, 256, 0);
    if (sAnims[id].runs > 1) { sAnims[id].runs--; sAnims[id].delay = 10; s.data[2] = 0; }
    else { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  } else {
    s.data[6] = Sin(s.data[2] % 256, 4096);
    HandleSetAffineData(s, 256, 256, s.data[6]);
  }
  s.data[2] += 16;
}
function Anim_Twist(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 512; sAnims[id].delay = 0;
  Twist(s); setCb(s, Twist);
}
function Spin(s: S): void {
  const id = s.data[0];
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > sAnims[id].delay) { HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else { s.data[6] = T(65536 / sAnims[id].data) * s.data[2]; HandleSetAffineData(s, 256, 256, s.data[6]); }
  s.data[2]++;
}
function Anim_Spin_Long(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].delay = 60; sAnims[id].data = 20;
  Spin(s); setCb(s, Spin);
}
function CircleCounterclockwise(s: S): void {
  const id = s.data[0];
  TryFlipX(s);
  if (s.data[2] > sAnims[id].rotation) { s.x2 = 0; s.y2 = 0; setCb(s, WaitAnimEnd); }
  else {
    const index = (s.data[2] + 192) % 256;
    s.x2 = -(Cos(index, sAnims[id].data * 2));
    s.y2 = Sin(index, sAnims[id].data) + sAnims[id].data;
  }
  s.data[2] += sAnims[id].speed; TryFlipX(s);
}
function Anim_CircleCounterclockwise(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 512; sAnims[id].data = 6; sAnims[id].speed = 24;
  CircleCounterclockwise(s); setCb(s, CircleCounterclockwise);
}
/* GlowColor macro (:1539). */
function GlowColor(s: S, color: number, colorIncrement: number, speed: number): void {
  if (s.data[2] === 0) s.data[7] = OBJ_PLTT_ID(oamPalNum(s));
  if (s.data[2] > 128) { BlendPalette(s.data[7], 16, 0, color); setCb(s, WaitAnimEnd); }
  else { s.data[6] = Sin(s.data[2], colorIncrement); BlendPalette(s.data[7], 16, s.data[6], color); }
  s.data[2] += speed;
}
function Anim_GlowBlack(s: S): void { GlowColor(s, RGB_BLACK, 16, 1); }
function Anim_HorizontalStretch(s: S): void {
  let index1 = 0, index2 = 0;
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > 40) { HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    index2 = T(s.data[2] * 128 / 40);
    if (s.data[2] >= 10 && s.data[2] <= 29) { s.data[7] += 51; index1 = 0xFF & s.data[7]; }
    if (!sDontFlip(s)) s.data[4] = (Sin(index2, 40) - 256) + Sin(index1, 16);
    else s.data[4] = (256 - Sin(index2, 40)) - Sin(index1, 16);
    s.data[5] = Sin(index2, 16) + 256;
    SetAffineData(s, s.data[4], s.data[5], 0);
  }
  s.data[2]++;
}
function Anim_VerticalStretch(s: S): void {
  let posY = 0, index1 = 0, index2 = 0;
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > 40) { HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); s.y2 = posY; }
  else {
    index2 = T(s.data[2] * 128 / 40);
    if (s.data[2] >= 10 && s.data[2] <= 29) { s.data[7] += 51; index1 = 0xFF & s.data[7]; }
    if (!sDontFlip(s)) s.data[4] = -(Sin(index2, 16)) - 256;
    else s.data[4] = Sin(index2, 16) + 256;
    s.data[5] = (256 - Sin(index2, 40)) - Sin(index1, 8);
    if (s.data[5] !== 256) posY = T((256 - s.data[5]) / 8);
    s.y2 = -(posY);
    SetAffineData(s, s.data[4], s.data[5], 0);
  }
  s.data[2]++;
}
function VerticalShakeTwice(s: S): void {
  const index = s.data[2] & 0xFF;
  const var7 = s.data[6] & 0xFF;
  const var5 = sVerticalShakeData[s.data[5]][0] & 0xFF;
  const var6 = sVerticalShakeData[s.data[5]][1] & 0xFF;
  let amplitude = 0;
  if (var5 !== 254) amplitude = T((var6 - var7) * var5 / var6); else amplitude = 0;
  if (var5 === 255) { setCb(s, WaitAnimEnd); s.y2 = 0; }
  else {
    s.y2 = Sin(index, amplitude);
    if (var7 === var6) { s.data[5]++; s.data[6] = 0; }
    else { s.data[2] += s.data[0]; s.data[6]++; }
  }
}
function Anim_VerticalShakeTwice(s: S): void { s.data[0] = 48; VerticalShakeTwice(s); setCb(s, VerticalShakeTwice); }
function Anim_TipMoveForward(s: S): void {
  TryFlipX(s);
  const counter = s.data[2] & 0xFF;
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > 35) { HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); s.x2 = 0; }
  else {
    const index = T((counter - 10) * 128 / 20);
    if (counter < 10) HandleSetAffineData(s, 256, 256, T(counter / 2) * 512);
    else if (counter >= 10 && counter <= 29) s.x2 = -(Sin(index, 5));
    else HandleSetAffineData(s, 256, 256, T((35 - counter) / 2) * 1024);
  }
  s.data[2]++; TryFlipX(s);
}
function Anim_HorizontalPivot(s: S): void {
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > 100) { HandleSetAffineData(s, 256, 256, 0); s.y2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else { const index = T(s.data[2] * 256 / 100); s.y2 = Sin(index, 10); HandleSetAffineData(s, 256, 256, Sin(index, 3276)); }
  s.data[2]++;
}
function VerticalSlideWobble(s: S): void {
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > 100) { HandleSetAffineData(s, 256, 256, 0); s.y2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    const index = T(s.data[2] * 256 / 100);
    const v = (T(s.data[2] * 512 / 100)) & 0xFF;
    s.y2 = Sin(index, s.data[0]);
    HandleSetAffineData(s, 256, 256, Sin(v, 3276));
  }
  s.data[2]++;
}
function Anim_VerticalSlideWobble(s: S): void { s.data[0] = 10; VerticalSlideWobble(s); setCb(s, VerticalSlideWobble); }
function RisingWobble(s: S): void {
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > 100) { HandleSetAffineData(s, 256, 256, 0); s.y2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    const index = T(s.data[2] * 256 / 100);
    const v = (T(s.data[2] * 512 / 100)) & 0xFF;
    s.y2 = -(Sin(T(index / 2), s.data[0] * 2));
    HandleSetAffineData(s, 256, 256, Sin(v, 3276));
  }
  s.data[2]++;
}
function Anim_RisingWobble(s: S): void { s.data[0] = 5; RisingWobble(s); setCb(s, RisingWobble); }
function Anim_HorizontalSlideWobble(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  if (s.data[2] > 100) { HandleSetAffineData(s, 256, 256, 0); s.x2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    const index = T(s.data[2] * 256 / 100);
    const v = (T(s.data[2] * 512 / 100)) & 0xFF;
    s.x2 = Sin(index, 8);
    HandleSetAffineData(s, 256, 256, Sin(v, 3276));
  }
  s.data[2]++; TryFlipX(s);
}
function VerticalSquishBounce(s: S): void {
  let posY = 0;
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[3] = 0; }
  TryFlipX(s);
  if (s.data[2] > s.data[0] * 3) { HandleSetAffineData(s, 256, 256, 0); s.y2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    const yScale = Sin(s.data[4], 32) + 256;
    if (s.data[2] > s.data[0] && s.data[2] < s.data[0] * 2) s.data[3] += T(128 / s.data[0]);
    if (yScale > 256) posY = T((256 - yScale) / 8);
    s.y2 = -(Sin(s.data[3], 10)) - posY;
    HandleSetAffineData(s, 256 - Sin(s.data[4], 32), yScale, 0);
    s.data[2]++;
    s.data[4] = (s.data[4] + T(128 / s.data[0])) & 0xFF;
  }
  TryFlipX(s);
}
function Anim_VerticalSquishBounce(s: S): void { s.data[0] = 16; VerticalSquishBounce(s); setCb(s, VerticalSquishBounce); }
function ShrinkGrow(s: S): void {
  let posY = 0;
  if (s.data[2] > T(128 / s.data[6]) * s.data[7]) { HandleSetAffineData(s, 256, 256, 0); s.y2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    const yScale = Sin(s.data[4], 32) + 256;
    if (yScale > 256) posY = T((256 - yScale) / 8);
    s.y2 = -(posY);
    HandleSetAffineData(s, Sin(s.data[4], 48) + 256, yScale, 0);
    s.data[2]++;
    s.data[4] = (s.data[4] + s.data[6]) & 0xFF;
  }
}
function Anim_ShrinkGrow(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[7] = 3; s.data[6] = 8; }
  ShrinkGrow(s);
}
function BounceRotateToSides(s: S): void {
  TryFlipX(s);
  const structId = s.data[0];
  const vv = sAnims[structId].rotation;
  const arrId = sAnims[structId].data;
  const r9 = sBounceRotateToSidesData[arrId][s.data[4]][0];
  const r10 = sBounceRotateToSidesData[arrId][s.data[4]][1] - r9;
  const r7 = s.data[3];
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; }
  if (sBounceRotateToSidesData[arrId][s.data[4]][2] === 0) {
    HandleSetAffineData(s, 256, 256, 0); s.x2 = 0; s.y2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd);
  } else {
    s.y2 = -(Sin(T(r7 * 128 / sBounceRotateToSidesData[arrId][s.data[4]][2]), 10));
    s.x2 = T(r10 * r7 / sBounceRotateToSidesData[arrId][s.data[4]][2]) + r9;
    const rotation = T(-(vv * s.x2) / 8);
    HandleSetAffineData(s, 256, 256, rotation);
    if (r7 === sBounceRotateToSidesData[arrId][s.data[4]][2]) { s.data[4]++; s.data[3] = 0; }
    else s.data[3]++;
  }
  TryFlipX(s);
}
function Anim_BounceRotateToSides(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 4096; sAnims[id].data = s.data[6];
  BounceRotateToSides(s); setCb(s, BounceRotateToSides);
}
function Anim_GlowOrange(s: S): void { GlowColor(s, RGB(31, 22, 0), 12, 2); }
function Anim_GlowRed(s: S): void { GlowColor(s, RGB_RED, 12, 2); }
function Anim_GlowBlue(s: S): void { GlowColor(s, RGB_BLUE, 12, 2); }
function Anim_GlowYellow(s: S): void { GlowColor(s, RGB_YELLOW, 12, 2); }
function Anim_GlowPurple(s: S): void { GlowColor(s, RGB(24, 0, 24), 12, 2); }
function Anim_BackAndLunge(s: S): void { HandleStartAffineAnim(s); setCb(s, BackAndLunge_0); }
function BackAndLunge_0(s: S): void {
  TryFlipX(s);
  if (++s.x2 > 7) { s.x2 = 8; s.data[7] = 2; setCb(s, BackAndLunge_1); }
  TryFlipX(s);
}
function BackAndLunge_1(s: S): void {
  TryFlipX(s);
  s.x2 -= s.data[7]; s.data[7]++;
  if (s.x2 <= 0) {
    let subResult = s.x2; let v = s.data[7]; s.data[6] = 0;
    do { subResult -= v; s.data[6]++; v++; } while (subResult > -8);
    s.data[5] = 1; setCb(s, BackAndLunge_2);
  }
  TryFlipX(s);
}
function BackAndLunge_2(s: S): void {
  TryFlipX(s);
  s.x2 -= s.data[7]; s.data[7]++;
  const rotation = T(s.data[5] * 6 / s.data[6]);
  if (++s.data[5] > s.data[6]) s.data[5] = s.data[6];
  HandleSetAffineData(s, 256, 256, rotation * 256);
  if (s.x2 < -8) { s.x2 = -8; s.data[4] = 2; s.data[3] = 0; s.data[2] = rotation; setCb(s, BackAndLunge_3); }
  TryFlipX(s);
}
function BackAndLunge_3(s: S): void {
  TryFlipX(s);
  if (s.data[3] > 11) {
    s.data[2] -= 2; if (s.data[2] < 0) s.data[2] = 0;
    HandleSetAffineData(s, 256, 256, s.data[2] << 8);
    if (s.data[2] === 0) setCb(s, BackAndLunge_4);
  } else { s.x2 += s.data[4]; s.data[4] *= -1; s.data[3]++; }
  TryFlipX(s);
}
function BackAndLunge_4(s: S): void {
  TryFlipX(s);
  s.x2 += 2;
  if (s.x2 > 0) { s.x2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  TryFlipX(s);
}
function Anim_BackFlip(s: S): void { HandleStartAffineAnim(s); s.data[3] = 0; setCb(s, BackFlip_0); }
function BackFlip_0(s: S): void {
  TryFlipX(s); s.x2++; s.y2--;
  if (s.x2 % 2 === 0 && s.data[3] <= 0) s.data[3] = 10;
  if (s.x2 > 7) { s.x2 = 8; s.y2 = -8; s.data[4] = 0; setCb(s, BackFlip_1); }
  TryFlipX(s);
}
function BackFlip_1(s: S): void {
  TryFlipX(s);
  s.x2 = Cos(s.data[4], 16) - 8; s.y2 = Sin(s.data[4], 16) - 8;
  if (s.data[4] > 63) { s.data[2] = 160; s.data[3] = 10; setCb(s, BackFlip_2); }
  s.data[4] += 8; if (s.data[4] > 64) s.data[4] = 64;
  TryFlipX(s);
}
function BackFlip_2(s: S): void {
  TryFlipX(s);
  if (s.data[3] > 0) s.data[3]--;
  else {
    s.x2 = Cos(s.data[2], 5) - 4; s.y2 = -(Sin(s.data[2], 5)) + 4;
    s.data[2] -= 4;
    const rotation = s.data[2] - 32;
    HandleSetAffineData(s, 256, 256, rotation * 512);
    if (s.data[2] <= 32) { s.x2 = 0; s.y2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  }
  TryFlipX(s);
}
function Anim_Flicker(s: S): void {
  if (s.data[3] > 0) s.data[3]--;
  else {
    s.data[4] = (s.data[4] === 0) ? 1 : 0;
    s.invisible = !!s.data[4];
    if (++s.data[2] > 19) { s.invisible = false; setCb(s, WaitAnimEnd); }
    s.data[3] = 2;
  }
}
function Anim_BackFlipBig(s: S): void { HandleStartAffineAnim(s); setCb(s, BackFlipBig_0); }
function BackFlipBig_0(s: S): void {
  TryFlipX(s); s.x2--; s.y2++;
  if (s.x2 <= -16) { s.x2 = -16; s.y2 = 16; setCb(s, BackFlipBig_1); s.data[2] = 160; }
  TryFlipX(s);
}
function BackFlipBig_1(s: S): void {
  TryFlipX(s);
  s.data[2] -= 4;
  s.x2 = Cos(s.data[2], 22); s.y2 = -(Sin(s.data[2], 22));
  const rotation = s.data[2] - 32;
  HandleSetAffineData(s, 256, 256, rotation * 512);
  if (s.data[2] <= 32) setCb(s, BackFlipBig_2);
  TryFlipX(s);
}
function BackFlipBig_2(s: S): void {
  TryFlipX(s); s.x2--; s.y2++;
  if (s.x2 <= 0) { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  TryFlipX(s);
}
function Anim_FrontFlip(s: S): void { HandleStartAffineAnim(s); setCb(s, FrontFlip_0); }
function FrontFlip_0(s: S): void {
  TryFlipX(s); s.x2++; s.y2--;
  if (s.x2 > 15) { s.data[2] = 0; setCb(s, FrontFlip_1); }
  TryFlipX(s);
}
function FrontFlip_1(s: S): void {
  TryFlipX(s); s.data[2] += 16;
  if (s.x2 <= -16) { s.x2 = -16; s.y2 = 16; s.data[2] = 0; setCb(s, FrontFlip_2); }
  else { s.x2 -= 2; s.y2 += 2; }
  HandleSetAffineData(s, 256, 256, s.data[2] << 8);
  TryFlipX(s);
}
function FrontFlip_2(s: S): void {
  TryFlipX(s); s.x2++; s.y2--;
  if (s.x2 >= 0) { s.x2 = 0; s.y2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  TryFlipX(s);
}
function Anim_TumblingFrontFlip(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].speed = 2;
  TumblingFrontFlip(s); setCb(s, TumblingFrontFlip);
}
function TumblingFrontFlip(s: S): void {
  if (sAnims[s.data[0]].delay !== 0) { sAnims[s.data[0]].delay--; return; }
  TryFlipX(s);
  if (s.data[2] === 0) {
    s.data[2]++; HandleStartAffineAnim(s);
    s.data[7] = sAnims[s.data[0]].speed; s.data[3] = -1; s.data[4] = -1; s.data[5] = 0; s.data[6] = 0;
  }
  s.x2 += (s.data[7] * 2 * s.data[3]);
  s.y2 += (s.data[7] * s.data[4]);
  s.data[6] += 8;
  if (s.x2 <= -16 || s.x2 >= 16) { s.x2 = s.data[3] * 16; s.data[3] *= -1; s.data[5]++; }
  else if (s.y2 <= -16 || s.y2 >= 16) { s.y2 = s.data[4] * 16; s.data[4] *= -1; s.data[5]++; }
  if (s.data[5] > 5 && s.x2 <= 0) {
    s.x2 = 0; s.y2 = 0;
    if (sAnims[s.data[0]].runs > 1) { sAnims[s.data[0]].runs--; s.data[5] = 0; s.data[6] = 0; sAnims[s.data[0]].delay = 10; }
    else { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  }
  HandleSetAffineData(s, 256, 256, s.data[6] << 8);
  TryFlipX(s);
}
function Anim_Figure8(s: S): void { HandleStartAffineAnim(s); s.data[6] = 0; s.data[7] = 0; setCb(s, Figure8); }
function Figure8(s: S): void {
  TryFlipX(s);
  s.data[6] += 4;
  s.x2 = -(Sin(s.data[6], 16));
  s.y2 = -(Sin((s.data[6] * 2) & 0xFF, 8));
  if (s.data[6] > 192 && s.data[7] === 1) { HandleSetAffineData(s, 256, 256, 0); s.data[7]++; }
  else if (s.data[6] > 64 && s.data[7] === 0) { HandleSetAffineData(s, -256, 256, 0); s.data[7]++; }
  if (s.data[6] > 255) { s.x2 = 0; s.y2 = 0; HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  TryFlipX(s);
}
function Anim_FlashYellow(s: S): void {
  if (++s.data[2] === 1) { s.data[7] = OBJ_PLTT_ID(oamPalNum(s)); s.data[6] = 0; s.data[5] = 0; s.data[4] = 0; }
  if ((sYellowFlashData[s.data[6]][1] & 0xFF) === 255) setCb(s, WaitAnimEnd);
  else {
    if (s.data[4] === 1) {
      if (sYellowFlashData[s.data[6]][0]) BlendPalette(s.data[7], 16, 16, RGB_YELLOW);
      else BlendPalette(s.data[7], 16, 0, RGB_YELLOW);
      s.data[4] = 0;
    }
    if (sYellowFlashData[s.data[6]][1] === s.data[5]) { s.data[4] = 1; s.data[5] = 0; s.data[6]++; }
    else s.data[5]++;
  }
}
function SwingConcave(s: S): void {
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  TryFlipX(s);
  if (s.data[2] > sAnims[s.data[0]].data) {
    HandleSetAffineData(s, 256, 256, 0); s.x2 = 0;
    if (sAnims[s.data[0]].runs > 1) { sAnims[s.data[0]].runs--; s.data[2] = 0; }
    else { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  } else {
    const index = T(s.data[2] * 256 / sAnims[s.data[0]].data);
    s.x2 = -(Sin(index, 10));
    HandleSetAffineData(s, 256, 256, Sin(index, 3276));
  }
  s.data[2]++; TryFlipX(s);
}
function Anim_SwingConcave_FastShort(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].data = 50; SwingConcave(s); setCb(s, SwingConcave);
}
function SwingConvex(s: S): void {
  if (s.data[2] === 0) HandleStartAffineAnim(s);
  TryFlipX(s);
  if (s.data[2] > sAnims[s.data[0]].data) {
    HandleSetAffineData(s, 256, 256, 0); s.x2 = 0;
    if (sAnims[s.data[0]].runs > 1) { sAnims[s.data[0]].runs--; s.data[2] = 0; }
    else { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  } else {
    const index = T(s.data[2] * 256 / sAnims[s.data[0]].data);
    s.x2 = -(Sin(index, 10));
    HandleSetAffineData(s, 256, 256, -(Sin(index, 3276)));
  }
  s.data[2]++; TryFlipX(s);
}
function Anim_SwingConvex_FastShort(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].data = 50; SwingConvex(s); setCb(s, SwingConvex);
}
function Anim_RotateUpSlamDown(s: S): void {
  HandleStartAffineAnim(s);
  s.data[6] = T(-(14 * s.centerToCornerVecX) / 10);
  s.data[7] = 128;
  setCb(s, RotateUpSlamDown_0);
}
function RotateUpSlamDown_0(s: S): void {
  TryFlipX(s);
  s.data[7]--;
  s.x2 = s.data[6] + Cos(s.data[7], s.data[6]);
  s.y2 = -(Sin(s.data[7], s.data[6]));
  HandleSetAffineData(s, 256, 256, (s.data[7] - 128) << 8);
  if (s.data[7] <= 120) { s.data[7] = 120; s.data[3] = 0; setCb(s, RotateUpSlamDown_1); }
  TryFlipX(s);
}
function RotateUpSlamDown_1(s: S): void {
  if (s.data[3] === 20) { setCb(s, RotateUpSlamDown_2); s.data[3] = 0; }
  s.data[3]++;
}
function RotateUpSlamDown_2(s: S): void {
  TryFlipX(s);
  s.data[7] += 2;
  s.x2 = s.data[6] + Cos(s.data[7], s.data[6]);
  s.y2 = -(Sin(s.data[7], s.data[6]));
  HandleSetAffineData(s, 256, 256, (s.data[7] - 128) << 8);
  if (s.data[7] >= 128) {
    s.x2 = 0; s.y2 = 0; HandleSetAffineData(s, 256, 256, 0); s.data[2] = 0;
    ResetSpriteAfterAnim(s); setCb(s, Anim_VerticalShake);
  }
  TryFlipX(s);
}
function DeepVerticalSquishBounce(s: S): void {
  if (sAnims[s.data[0]].delay !== 0) { sAnims[s.data[0]].delay--; return; }
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[4] = 0; s.data[5] = 0; s.data[2] = 1; }
  if (s.data[5] === 0) {
    s.data[7] = Sin(s.data[4], 256); s.y2 = Sin(s.data[4], 16); s.data[6] = Sin(s.data[4], 32);
    HandleSetAffineData(s, 256 - s.data[6], 256 + s.data[7], 0);
    if (s.data[4] === 128) { s.data[4] = 0; s.data[5] = 1; }
  } else if (s.data[5] === 1) {
    s.data[7] = Sin(s.data[4], 32); s.y2 = -(Sin(s.data[4], 8)); s.data[6] = Sin(s.data[4], 128);
    HandleSetAffineData(s, 256 + s.data[6], 256 - s.data[7], 0);
    if (s.data[4] === 128) {
      if (sAnims[s.data[0]].runs > 1) { sAnims[s.data[0]].runs--; sAnims[s.data[0]].delay = 10; s.data[4] = 0; s.data[5] = 0; }
      else { HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
    }
  }
  s.data[4] += sAnims[s.data[0]].rotation;
}
function Anim_DeepVerticalSquishBounce(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 4; DeepVerticalSquishBounce(s); setCb(s, DeepVerticalSquishBounce);
}
function Anim_HorizontalJumps(s: S): void {
  const counter = s.data[2];
  TryFlipX(s);
  if (counter > 512) { setCb(s, WaitAnimEnd); s.x2 = 0; s.y2 = 0; }
  else {
    switch (T(s.data[2] / 128)) {
      case 0: s.x2 = T(-(counter % 128 * 8) / 128); break;
      case 1: s.x2 = T(counter % 128 / 16) - 8; break;
      case 2: s.x2 = T(counter % 128 / 16); break;
      case 3: s.x2 = T(-(counter % 128 * 8) / 128) + 8; break;
    }
    s.y2 = -(Sin(counter % 128, 8));
  }
  s.data[2] += 12; TryFlipX(s);
}
function Anim_HorizontalJumpsVerticalStretch(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].data = -1;
  HandleStartAffineAnim(s); s.data[3] = 0;
  HorizontalJumpsVerticalStretch_0(s); setCb(s, HorizontalJumpsVerticalStretch_0);
}
function HorizontalJumpsVerticalStretch_0(s: S): void {
  if (sAnims[s.data[0]].delay !== 0) { sAnims[s.data[0]].delay--; return; }
  TryFlipX(s);
  const counter = s.data[2];
  if (s.data[2] > 128) { s.data[2] = 0; setCb(s, HorizontalJumpsVerticalStretch_1); }
  else {
    const v = 8 * sAnims[s.data[0]].data;
    s.x2 = T(v * (counter % 128) / 128);
    s.y2 = -(Sin(counter % 128, 8));
    s.data[2] += 12;
  }
  TryFlipX(s);
}
function HorizontalJumpsVerticalStretch_1(s: S): void {
  TryFlipX(s);
  if (s.data[2] > 48) { HandleSetAffineData(s, 256, 256, 0); s.y2 = 0; s.data[2] = 0; setCb(s, HorizontalJumpsVerticalStretch_2); }
  else {
    const yScale = Sin(s.data[4], 64) + 256;
    if (s.data[2] >= 16 && s.data[2] <= 31) { s.data[3] += 8; s.x2 -= sAnims[s.data[0]].data; }
    let yDelta = 0;
    if (yScale > 256) yDelta = T((256 - yScale) / 8);
    s.y2 = -(Sin(s.data[3], 20)) - yDelta;
    HandleSetAffineData(s, 256 - Sin(s.data[4], 32), yScale, 0);
    s.data[2]++; s.data[4] += 8; s.data[4] &= 0xFF;
  }
  TryFlipX(s);
}
function HorizontalJumpsVerticalStretch_2(s: S): void {
  TryFlipX(s);
  const counter = s.data[2];
  if (counter > 128) {
    if (sAnims[s.data[0]].runs > 1) {
      sAnims[s.data[0]].runs--; sAnims[s.data[0]].delay = 10;
      s.data[3] = 0; s.data[2] = 0; s.data[4] = 0;
      setCb(s, HorizontalJumpsVerticalStretch_0);
    } else { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
    s.x2 = 0; s.y2 = 0;
  } else {
    const v = sAnims[s.data[0]].data;
    s.x2 = T(v * ((counter % 128) * 8) / 128) + 8 * -v;
    s.y2 = -(Sin(counter % 128, 8));
  }
  s.data[2] += 12; TryFlipX(s);
}
function RotateToSides(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; }
  TryFlipX(s);
  if (s.data[7] > 254) {
    s.x2 = 0; s.y2 = 0; HandleSetAffineData(s, 256, 256, 0);
    if (sAnims[s.data[0]].runs > 1) { sAnims[s.data[0]].runs--; s.data[2] = 0; s.data[7] = 0; }
    else { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
    TryFlipX(s);
  } else {
    s.x2 = -(Sin(s.data[7], 16));
    const rotation = Sin(s.data[7], 32);
    HandleSetAffineData(s, 256, 256, rotation << 8);
    s.data[7] += sAnims[s.data[0]].rotation;
    TryFlipX(s);
  }
}
function Anim_RotateToSides_Fast(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 4; RotateToSides(s); setCb(s, RotateToSides);
}
function Anim_RotateUpToSides(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; }
  TryFlipX(s);
  if (s.data[7] > 254) {
    s.x2 = 0; s.y2 = 0; HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); TryFlipX(s);
  } else {
    s.x2 = -(Sin(s.data[7], 16));
    s.y2 = -(Sin(s.data[7] % 128, 16));
    const rotation = Sin(s.data[7], 32);
    HandleSetAffineData(s, 256, 256, rotation << 8);
    s.data[7] += 8; TryFlipX(s);
  }
}
function Anim_FlickerIncreasing(s: S): void {
  if (s.data[2] === 0) s.data[7] = 0;
  if (s.data[2] === s.data[7]) { s.data[7] = 0; s.data[2]++; s.invisible = false; }
  else { s.data[7]++; s.invisible = true; }
  if (s.data[2] > 10) { s.invisible = false; setCb(s, WaitAnimEnd); }
}
function Anim_TipHopForward(s: S): void { HandleStartAffineAnim(s); s.data[7] = 0; setCb(s, TipHopForward_0); }
function TipHopForward_0(s: S): void {
  if (s.data[7] > 31) { s.data[7] = 32; s.data[2] = 0; setCb(s, TipHopForward_1); }
  else s.data[7] += 4;
  HandleSetAffineData(s, 256, 256, s.data[7] << 8);
}
function TipHopForward_1(s: S): void {
  TryFlipX(s);
  if (s.data[2] > 512) { setCb(s, TipHopForward_2); s.data[6] = 0; }
  else { s.x2 = T(-(s.data[2] * 16) / 512); s.y2 = -(Sin(s.data[2] % 128, 4)); s.data[2] += 12; }
  TryFlipX(s);
}
function TipHopForward_2(s: S): void {
  TryFlipX(s);
  s.data[7] -= 2;
  if (s.data[7] < 0) { s.data[7] = 0; s.x2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else s.x2 = -(Sin(s.data[7] * 2, 16));
  HandleSetAffineData(s, 256, 256, s.data[7] << 8);
  TryFlipX(s);
}
function Anim_PivotShake(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; }
  TryFlipX(s);
  if (s.data[7] > 255) { s.x2 = 0; s.y2 = 0; s.data[7] = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else { s.data[7] += 16; s.x2 = -(Sin(s.data[7] % 128, 8)); s.y2 = -(Sin(s.data[7] % 128, 8)); }
  const rotation = Sin(s.data[7] % 128, 16);
  HandleSetAffineData(s, 256, 256, rotation << 8);
  TryFlipX(s);
}
function Anim_TipAndShake(s: S): void { HandleStartAffineAnim(s); s.data[7] = 0; s.data[4] = 0; setCb(s, TipAndShake_0); }
function TipAndShake_0(s: S): void {
  TryFlipX(s);
  if (s.data[7] > 24) { if (++s.data[4] > 4) { s.data[4] = 0; setCb(s, TipAndShake_1); } }
  else { s.data[7] += 2; s.x2 = Sin(s.data[7], 8); s.y2 = -(Sin(s.data[7], 8)); }
  HandleSetAffineData(s, 256, 256, -(s.data[7]) << 8);
  TryFlipX(s);
}
function TipAndShake_1(s: S): void {
  TryFlipX(s);
  if (s.data[7] > 32) { s.data[6] = 1; setCb(s, TipAndShake_2); }
  else { s.data[7] += 2; s.x2 = Sin(s.data[7], 8); s.y2 = -(Sin(s.data[7], 8)); }
  HandleSetAffineData(s, 256, 256, -(s.data[7]) << 8);
  TryFlipX(s);
}
function TipAndShake_2(s: S): void {
  TryFlipX(s);
  s.data[7] += (s.data[6] * 4);
  if (s.data[5] > 9) { s.data[7] = 32; setCb(s, TipAndShake_3); }
  s.x2 = Sin(s.data[7], 8); s.y2 = -(Sin(s.data[7], 8));
  if (s.data[7] <= 28 || s.data[7] >= 36) { s.data[6] *= -1; s.data[5]++; }
  HandleSetAffineData(s, 256, 256, -(s.data[7]) << 8);
  TryFlipX(s);
}
function TipAndShake_3(s: S): void {
  TryFlipX(s);
  if (s.data[7] <= 0) { s.data[7] = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else { s.data[7] -= 2; s.x2 = Sin(s.data[7], 8); s.y2 = -(Sin(s.data[7], 8)); }
  HandleSetAffineData(s, 256, 256, -(s.data[7]) << 8);
  TryFlipX(s);
}
function Anim_VibrateToCorners(s: S): void {
  TryFlipX(s);
  if (s.data[2] > 40) { setCb(s, WaitAnimEnd); s.x2 = 0; }
  else {
    const sign = !(s.data[2] & 1) ? 1 : -1;
    if (T((s.data[2] % 4) / 2) === 0) { s.x2 = Sin(T(s.data[2] * 128 / 40) % 256, 16) * sign; s.y2 = -(s.x2); }
    else { s.x2 = -(Sin(T(s.data[2] * 128 / 40) % 256, 16)) * sign; s.y2 = s.x2; }
  }
  s.data[2]++; TryFlipX(s);
}
function Anim_GrowInStages(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[5] = 0; s.data[6] = 0; s.data[7] = 0; s.data[2]++; }
  if (s.data[6] > 0) {
    s.data[6]--;
    if (s.data[5] !== 3) {
      let scale = T(8 * s.data[6] / 20);
      scale = Sin(s.data[7] - scale, 64);
      HandleSetAffineData(s, 256 - scale, 256 - scale, 0);
    }
  } else {
    let v: number;
    if (s.data[5] === 3) {
      if (s.data[7] > 63) { s.data[7] = 64; HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
      v = Cos(s.data[7], 64);
    } else {
      v = Sin(s.data[7], 64);
      if (s.data[7] > 63) { s.data[5] = 3; s.data[6] = 10; s.data[7] = 0; }
      else {
        if (v > 48 && s.data[5] === 1) { s.data[5] = 2; s.data[6] = 20; }
        else if (v > 16 && s.data[5] === 0) { s.data[5] = 1; s.data[6] = 20; }
      }
    }
    s.data[7] += 2;
    HandleSetAffineData(s, 256 - v, 256 - v, 0);
  }
  TryFlipX(s);
}
function Anim_VerticalSpring(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; }
  if (s.data[7] > 512) { s.y2 = 0; HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    s.y2 = Sin(s.data[7] % 256, 8);
    s.data[7] += 8;
    const yScale = Sin(s.data[7] % 128, 96);
    HandleSetAffineData(s, 256, yScale + 256, 0);
  }
}
function Anim_VerticalRepeatedSpring(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; }
  if (s.data[7] > 256) { s.y2 = 0; HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    s.y2 = Sin(s.data[7], 16);
    s.data[7] += 4;
    const yScale = Sin((s.data[7] % 64) * 2, 128);
    HandleSetAffineData(s, 256, yScale + 256, 0);
  }
}
function Anim_SpringRising(s: S): void { HandleStartAffineAnim(s); setCb(s, SpringRising_0); s.data[7] = 0; }
function SpringRising_0(s: S): void {
  let yScale: number;
  s.data[7] += 8;
  if (s.data[7] > 63) { s.data[7] = 0; s.data[6] = 0; setCb(s, SpringRising_1); yScale = Sin(64, 128); }
  else yScale = Sin(s.data[7], 128);
  HandleSetAffineData(s, 256, 256 + yScale, 0);
}
function SpringRising_1(s: S): void {
  let yScale: number;
  s.data[7] += 4;
  if (s.data[7] > 95) { yScale = Cos(0, 128); s.data[7] = 0; s.data[6]++; }
  else {
    s.y2 = -(s.data[6] * 4) - Sin(s.data[7], 8);
    let sign: number, index: number;
    if (s.data[7] > 63) { sign = -1; index = s.data[7] - 64; }
    else { sign = 1; index = 0; }
    yScale = Cos((index * 2) + s.data[7], 128) * sign;
  }
  HandleSetAffineData(s, 256, 256 + yScale, 0);
  if (s.data[6] === 3) { s.data[7] = 0; setCb(s, SpringRising_2); }
}
function SpringRising_2(s: S): void {
  s.data[7] += 8;
  let yScale = Cos(s.data[7], 128);
  s.y2 = -(Cos(s.data[7], 12));
  if (s.data[7] > 63) { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); s.y2 = 0; HandleSetAffineData(s, 256, 256, 0); }
  HandleSetAffineData(s, 256, 256 + yScale, 0);
}
function HorizontalSpring(s: S): void {
  if (s.data[7] > s.data[5]) { s.x2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); HandleSetAffineData(s, 256, 256, 0); }
  else {
    s.x2 = Sin(s.data[7] % 256, s.data[4]);
    s.data[7] += s.data[6];
    const xScale = Sin(s.data[7] % 128, 96);
    HandleSetAffineData(s, 256 + xScale, 256, 0);
  }
}
function Anim_HorizontalSpring(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; s.data[6] = 8; s.data[5] = 512; s.data[4] = 8; }
  HorizontalSpring(s);
}
function HorizontalRepeatedSpring(s: S): void {
  if (s.data[7] > s.data[5]) { s.x2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); HandleSetAffineData(s, 256, 256, 0); }
  else {
    s.x2 = Sin(s.data[7] % 256, s.data[4]);
    s.data[7] += s.data[6];
    const xScale = Sin((s.data[7] % 64) * 2, 128);
    HandleSetAffineData(s, 256 + xScale, 256, 0);
  }
}
function Anim_HorizontalRepeatedSpring_Slow(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; s.data[6] = 4; s.data[5] = 256; s.data[4] = 16; }
  HorizontalRepeatedSpring(s);
}
function Anim_HorizontalSlideShrink(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; }
  if (s.data[7] > 512) { s.x2 = 0; ResetSpriteAfterAnim(s); HandleSetAffineData(s, 256, 256, 0); setCb(s, WaitAnimEnd); }
  else {
    s.x2 = Sin(s.data[7] % 256, 8);
    s.data[7] += 8;
    const scale = Sin(s.data[7] % 128, 96);
    HandleSetAffineData(s, 256 + scale, 256 + scale, 0);
  }
  TryFlipX(s);
}
function Anim_LungeGrow(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; }
  if (s.data[7] > 512) { s.x2 = 0; ResetSpriteAfterAnim(s); HandleSetAffineData(s, 256, 256, 0); setCb(s, WaitAnimEnd); }
  else {
    s.x2 = -(Sin(T((s.data[7] % 256) / 2), 16));
    s.data[7] += 8;
    const scale = -(Sin(T((s.data[7] % 256) / 2), 64));
    HandleSetAffineData(s, 256 + scale, 256 + scale, 0);
  }
  TryFlipX(s);
}
function Anim_CircleIntoBackground(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; }
  if (s.data[7] > 512) { s.x2 = 0; ResetSpriteAfterAnim(s); HandleSetAffineData(s, 256, 256, 0); setCb(s, WaitAnimEnd); }
  else {
    s.x2 = -(Sin(s.data[7] % 256, 8));
    s.data[7] += 8;
    const scale = Sin(T((s.data[7] % 256) / 2), 96);
    HandleSetAffineData(s, 256 + scale, 256 + scale, 0);
  }
  TryFlipX(s);
}
function Anim_RapidHorizontalHops(s: S): void {
  TryFlipX(s);
  if (s.data[2] > 2048) { setCb(s, WaitAnimEnd); s.data[6] = 0; }
  else {
    const caseVar = T(s.data[2] / 512) % 4;
    switch (caseVar) {
      case 0: s.x2 = T(-(s.data[2] % 512 * 16) / 512); break;
      case 1: s.x2 = T(s.data[2] % 512 / 32) - 16; break;
      case 2: s.x2 = T((s.data[2] % 512) / 32); break;
      case 3: s.x2 = T(-(s.data[2] % 512 * 16) / 512) + 16; break;
    }
    s.y2 = -(Sin(s.data[2] % 128, 4));
    s.data[2] += 24;
  }
  TryFlipX(s);
}
function Anim_FourPetal(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) { s.data[6] = 0; s.data[7] = 64; s.data[2]++; }
  s.data[7] += 8;
  if (s.data[6] === 4) { if (s.data[7] > 63) { s.data[7] = 0; s.data[6]++; } }
  else { if (s.data[7] > 127) { s.data[7] = 0; s.data[6]++; } }
  switch (s.data[6]) {
    case 1: s.x2 = -(Cos(s.data[7], 8)); s.y2 = Sin(s.data[7], 8) - 8; break;
    case 2: s.x2 = Sin(s.data[7] + 128, 8) + 8; s.y2 = -(Cos(s.data[7], 8)); break;
    case 3: s.x2 = Cos(s.data[7], 8); s.y2 = Sin(s.data[7] + 128, 8) + 8; break;
    case 0: case 4: s.x2 = Sin(s.data[7], 8) - 8; s.y2 = Cos(s.data[7], 8); break;
    default: s.x2 = 0; s.y2 = 0; setCb(s, WaitAnimEnd); break;
  }
  TryFlipX(s);
}
function Anim_VerticalSquishBounce_Slow(s: S): void { s.data[0] = 32; VerticalSquishBounce(s); setCb(s, VerticalSquishBounce); }
function Anim_HorizontalSlide_Slow(s: S): void { s.data[0] = 80; HorizontalSlide(s); setCb(s, HorizontalSlide); }
function Anim_VerticalSlide_Slow(s: S): void { s.data[0] = 80; VerticalSlide(s); setCb(s, VerticalSlide); }
function Anim_BounceRotateToSides_Small(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 2048; sAnims[id].data = s.data[6];
  BounceRotateToSides(s); setCb(s, BounceRotateToSides);
}
function Anim_BounceRotateToSides_Slow(s: S): void { s.data[6] = 1; Anim_BounceRotateToSides(s); }
function Anim_BounceRotateToSides_SmallSlow(s: S): void { s.data[6] = 1; Anim_BounceRotateToSides_Small(s); }
function Anim_ZigzagSlow(s: S): void {
  if (s.data[2] === 0) s.data[0] = 0;
  if (s.data[0] <= 0) { Zigzag(s); s.data[0] = 1; }
  else s.data[0]--;
}
function Anim_HorizontalShake_Slow(s: S): void { s.data[0] = 30; s.data[7] = 3; HorizontalShake(s); setCb(s, HorizontalShake); }
function Anim_VertialShake_Slow(s: S): void { s.data[0] = 30; VerticalShake(s); setCb(s, VerticalShake); }
function Anim_Twist_Twice(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 1024; sAnims[id].delay = 0; sAnims[id].runs = 2;
  Twist(s); setCb(s, Twist);
}
function Anim_CircleCounterclockwise_Slow(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 512; sAnims[id].data = 3; sAnims[id].speed = 12;
  CircleCounterclockwise(s); setCb(s, CircleCounterclockwise);
}
function Anim_VerticalShakeTwice_Slow(s: S): void { s.data[0] = 24; VerticalShakeTwice(s); setCb(s, VerticalShakeTwice); }
function Anim_VerticalSlideWobble_Small(s: S): void { s.data[0] = 5; VerticalSlideWobble(s); setCb(s, VerticalSlideWobble); }
function Anim_VerticalJumps_Small(s: S): void { s.data[0] = 3; VerticalJumps(s); setCb(s, VerticalJumps); }
function Anim_Spin(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].delay = 60; sAnims[id].data = 30;
  Spin(s); setCb(s, Spin);
}
function Anim_TumblingFrontFlip_Twice(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].speed = 1; sAnims[id].runs = 2;
  TumblingFrontFlip(s); setCb(s, TumblingFrontFlip);
}
function Anim_DeepVerticalSquishBounce_Twice(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 4; sAnims[id].runs = 2;
  DeepVerticalSquishBounce(s); setCb(s, DeepVerticalSquishBounce);
}
function Anim_HorizontalJumpsVerticalStretch_Twice(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].data = 1; sAnims[id].runs = 2;
  HandleStartAffineAnim(s); s.data[3] = 0;
  HorizontalJumpsVerticalStretch_0(s); setCb(s, HorizontalJumpsVerticalStretch_0);
}
function Anim_RotateToSides(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 2; RotateToSides(s); setCb(s, RotateToSides);
}
function Anim_RotateToSides_Twice(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 4; sAnims[id].runs = 2;
  RotateToSides(s); setCb(s, RotateToSides);
}
function Anim_SwingConcave(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].data = 100; SwingConcave(s); setCb(s, SwingConcave);
}
function Anim_SwingConcave_Fast(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].data = 50; sAnims[id].runs = 2;
  SwingConcave(s); setCb(s, SwingConcave);
}
function Anim_SwingConvex(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].data = 100; SwingConvex(s); setCb(s, SwingConvex);
}
function Anim_SwingConvex_Fast(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].data = 50; sAnims[id].runs = 2;
  SwingConvex(s); setCb(s, SwingConvex);
}
function VerticalShakeBack(s: S): void {
  const counter = s.data[2];
  if (counter > 2304) { setCb(s, WaitAnimEnd); s.y2 = 0; }
  else s.y2 = Sin((counter + 192) % 256, s.data[7]) + s.data[7];
  s.data[2] += s.data[0];
}
function Anim_VerticalShakeBack(s: S): void { s.data[0] = 60; s.data[7] = 3; VerticalShakeBack(s); setCb(s, VerticalShakeBack); }
function Anim_VerticalShakeBack_Slow(s: S): void { s.data[0] = 30; s.data[7] = 3; VerticalShakeBack(s); setCb(s, VerticalShakeBack); }
function Anim_VerticalShakeHorizontalSlide_Slow(s: S): void {
  TryFlipX(s);
  if (s.data[2] > 2048) { setCb(s, WaitAnimEnd); s.data[6] = 0; }
  else {
    const divCase = T(s.data[2] / 512) % 4;
    switch (divCase) {
      case 0: s.x2 = T((s.data[2] % 512) / 32); break;
      case 2: s.x2 = T(-(s.data[2] % 512 * 16) / 512); break;
      case 1: s.x2 = T(-(s.data[2] % 512 * 16) / 512) + 16; break;
      case 3: s.x2 = T((s.data[2] % 512) / 32) - 16; break;
    }
    s.y2 = Sin(s.data[2] % 128, 4);
    s.data[2] += 24;
  }
  TryFlipX(s);
}
function VerticalStretchBothEnds(s: S): void {
  let index1 = 0, index2 = 0;
  if (s.data[5] > s.data[6]) {
    s.y2 = 0; s.data[5] = 0; HandleSetAffineData(s, 256, 256, 0);
    if (s.data[4] <= 1) { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
    else { s.data[4]--; s.data[7] = 0; }
  } else {
    index2 = T(s.data[5] * 128 / s.data[6]);
    const cmpVal1 = T(s.data[6] / 4) & 0xFF;
    const cmpVal2 = (cmpVal1 * 3) & 0xFF;
    if (s.data[5] >= cmpVal1 && s.data[5] < cmpVal2) { s.data[7] += 51; index1 = s.data[7] & 0xFF; }
    let xScale: number;
    if (!sDontFlip(s)) xScale = -256 - Sin(index2, 16);
    else xScale = 256 + Sin(index2, 16);
    const amplitude = s.data[3] & 0xFF;
    const yScale = 256 - Sin(index2, amplitude) - Sin(index1, T(amplitude / 5));
    SetAffineData(s, xScale, yScale, 0);
    s.data[5]++;
  }
}
function Anim_VerticalStretchBothEnds_Slow(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; HandleStartAffineAnim(s); s.data[4] = 1; s.data[6] = 40; s.data[3] = 40; s.data[5] = 0; s.data[7] = 0; }
  VerticalStretchBothEnds(s);
}
function HorizontalStretchFar(s: S): void {
  let index1 = 0, index2 = 0;
  if (s.data[5] > s.data[6]) {
    s.data[5] = 0; HandleSetAffineData(s, 256, 256, 0);
    if (s.data[4] <= 1) { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
    else { s.data[4]--; s.data[7] = 0; }
  } else {
    index2 = T(s.data[5] * 128 / s.data[6]);
    const cmpVal1 = T(s.data[6] / 4) & 0xFF;
    const cmpVal2 = (cmpVal1 * 3) & 0xFF;
    if (s.data[5] >= cmpVal1 && s.data[5] < cmpVal2) { s.data[7] += 51; index1 = s.data[7] & 0xFF; }
    const amplitude = s.data[3] & 0xFF;
    let xScale: number;
    if (!sDontFlip(s)) xScale = -256 + Sin(index2, amplitude) + Sin(index1, T(amplitude / 5) * 2);
    else xScale = 256 - Sin(index2, amplitude) - Sin(index1, T(amplitude / 5) * 2);
    SetAffineData(s, xScale, 256, 0);
    s.data[5]++;
  }
}
function Anim_HorizontalStretchFar_Slow(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; HandleStartAffineAnim(s); s.data[4] = 1; s.data[6] = 40; s.data[3] = 40; s.data[5] = 0; s.data[7] = 0; }
  HorizontalStretchFar(s);
}
function VerticalShakeLowTwice(s: S): void {
  const var8 = s.data[2] & 0xFF;
  const var9 = s.data[6] & 0xFF;
  let var5 = sVerticalShakeData[s.data[5]][0] & 0xFF;
  if (var5 !== 255) var5 = s.data[7] & 0xFF;
  const var6 = sVerticalShakeData[s.data[5]][1] & 0xFF;
  let var7 = 0;
  if ((sVerticalShakeData[s.data[5]][0] & 0xFF) !== 254) var7 = T((var6 - var9) * var5 / var6);
  else var7 = 0;
  if (var5 === 255) { setCb(s, WaitAnimEnd); s.y2 = 0; }
  else {
    s.y2 = Sin((var8 + 192) % 256, var7) + var7;
    if (var9 === var6) { s.data[5]++; s.data[6] = 0; }
    else { s.data[2] += s.data[0]; s.data[6]++; }
  }
}
function Anim_VerticalShakeLowTwice(s: S): void { s.data[0] = 40; s.data[7] = 6; VerticalShakeLowTwice(s); setCb(s, VerticalShakeLowTwice); }
function Anim_HorizontalShake_Fast(s: S): void { s.data[0] = 70; s.data[7] = 6; HorizontalShake(s); setCb(s, HorizontalShake); }
function Anim_HorizontalSlide_Fast(s: S): void { s.data[0] = 20; HorizontalSlide(s); setCb(s, HorizontalSlide); }
function Anim_HorizontalVibrate_Fast(s: S): void {
  if (s.data[2] > 40) { setCb(s, WaitAnimEnd); s.x2 = 0; }
  else { const sign = !(s.data[2] & 1) ? 1 : -1; s.x2 = Sin(T(s.data[2] * 128 / 40) % 256, 9) * sign; }
  s.data[2]++;
}
function Anim_HorizontalVibrate_Fastest(s: S): void {
  if (s.data[2] > 40) { setCb(s, WaitAnimEnd); s.x2 = 0; }
  else { const sign = !(s.data[2] & 1) ? 1 : -1; s.x2 = Sin(T(s.data[2] * 128 / 40) % 256, 12) * sign; }
  s.data[2]++;
}
function Anim_VerticalShakeBack_Fast(s: S): void { s.data[0] = 70; s.data[7] = 6; VerticalShakeBack(s); setCb(s, VerticalShakeBack); }
function Anim_VerticalShakeLowTwice_Slow(s: S): void { s.data[0] = 24; s.data[7] = 6; VerticalShakeLowTwice(s); setCb(s, VerticalShakeLowTwice); }
function Anim_VerticalShakeLowTwice_Fast(s: S): void { s.data[0] = 56; s.data[7] = 9; VerticalShakeLowTwice(s); setCb(s, VerticalShakeLowTwice); }
function Anim_CircleCounterclockwise_Long(s: S): void {
  const id = s.data[0] = AddNewAnim();
  sAnims[id].rotation = 1024; sAnims[id].data = 6; sAnims[id].speed = 24;
  CircleCounterclockwise(s); setCb(s, CircleCounterclockwise);
}
function GrowStutter(s: S): void {
  let index1 = 0, index2 = 0;
  if (s.data[5] > s.data[6]) {
    s.y2 = 0; s.data[5] = 0; HandleSetAffineData(s, 256, 256, 0);
    if (s.data[4] <= 1) { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
    else { s.data[4]--; s.data[7] = 0; }
  } else {
    index2 = T(s.data[5] * 128 / s.data[6]);
    const cmpVal1 = T(s.data[6] / 4) & 0xFF;
    const cmpVal2 = (cmpVal1 * 3) & 0xFF;
    if (s.data[5] >= cmpVal1 && s.data[5] < cmpVal2) { s.data[7] += 51; index1 = s.data[7] & 0xFF; }
    const amplitude = s.data[3] & 0xFF;
    let xScale: number;
    if (!sDontFlip(s)) xScale = Sin(index2, amplitude) + (Sin(index1, T(amplitude / 5) * 2) - 256);
    else xScale = 256 - Sin(index1, T(amplitude / 5) * 2) - Sin(index2, amplitude);
    const yScale = 256 - Sin(index1, T(amplitude / 5)) - Sin(index2, amplitude);
    SetAffineData(s, xScale, yScale, 0);
    s.data[5]++;
  }
}
function Anim_GrowStutter_Slow(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; HandleStartAffineAnim(s); s.data[4] = 1; s.data[6] = 40; s.data[3] = 40; s.data[5] = 0; s.data[7] = 0; }
  GrowStutter(s);
}
function Anim_VerticalShakeHorizontalSlide(s: S): void {
  TryFlipX(s);
  if (s.data[2] > 2048) { setCb(s, WaitAnimEnd); s.data[6] = 0; }
  else {
    const divCase = T(s.data[2] / 512) % 4;
    switch (divCase) {
      case 0: s.x2 = T((s.data[2] % 512) / 32); break;
      case 2: s.x2 = T(-(s.data[2] % 512 * 16) / 512); break;
      case 1: s.x2 = T(-(s.data[2] % 512 * 16) / 512) + 16; break;
      case 3: s.x2 = T((s.data[2] % 512) / 32) - 16; break;
    }
    s.y2 = Sin(s.data[2] % 128, 4);
    s.data[2] += 48;
  }
  TryFlipX(s);
}
function Anim_VerticalShakeHorizontalSlide_Fast(s: S): void {
  TryFlipX(s);
  if (s.data[2] > 2048) { setCb(s, WaitAnimEnd); s.data[6] = 0; }
  else {
    const divCase = T(s.data[2] / 512) % 4;
    switch (divCase) {
      case 0: s.x2 = T((s.data[2] % 512) / 32); break;
      case 2: s.x2 = T(-(s.data[2] % 512 * 16) / 512); break;
      case 1: s.x2 = T(-(s.data[2] % 512 * 16) / 512) + 16; break;
      case 3: s.x2 = T((s.data[2] % 512) / 32) - 16; break;
    }
    s.y2 = Sin(s.data[2] % 96, 4);
    s.data[2] += 64;
  }
  TryFlipX(s);
}
function TriangleDown(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) s.data[3] = 0;
  if (T(sTriangleDownData[s.data[3]][2] / s.data[5]) === s.data[2]) { s.data[3]++; s.data[2] = 0; }
  if (T(sTriangleDownData[s.data[3]][2] / s.data[5]) === 0) {
    if (--s.data[6] === 0) setCb(s, WaitAnimEnd);
    else s.data[2] = 0;
  } else {
    const amplitude = s.data[5];
    s.x2 += (sTriangleDownData[s.data[3]][0] * amplitude);
    s.y2 += (sTriangleDownData[s.data[3]][1] * s.data[5]);
    s.data[2]++; TryFlipX(s);
  }
}
function Anim_TriangleDown_Slow(s: S): void { s.data[5] = 1; s.data[6] = 1; TriangleDown(s); setCb(s, TriangleDown); }
function Anim_TriangleDown(s: S): void { s.data[5] = 2; s.data[6] = 1; TriangleDown(s); setCb(s, TriangleDown); }
function Anim_TriangleDown_Fast(s: S): void { s.data[5] = 2; s.data[6] = 2; TriangleDown(s); setCb(s, TriangleDown); }
function Grow(s: S): void {
  if (s.data[7] > 255) {
    if (s.data[5] <= 1) { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); HandleSetAffineData(s, 256, 256, 0); }
    else { s.data[5]--; s.data[7] = 0; }
  } else {
    s.data[7] += s.data[6];
    if (s.data[7] > 256) s.data[7] = 256;
    const scale = Sin(T(s.data[7] / 2), 64);
    HandleSetAffineData(s, 256 - scale, 256 - scale, 0);
  }
}
function Anim_Grow(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; s.data[6] = 4; s.data[5] = 1; }
  Grow(s); TryFlipX(s);
}
function Anim_Grow_Twice(s: S): void {
  TryFlipX(s);
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; s.data[6] = 8; s.data[5] = 2; }
  Grow(s); TryFlipX(s);
}
function Anim_HorizontalSpring_Fast(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; s.data[6] = 8; s.data[5] = 512; s.data[4] = 16; }
  HorizontalSpring(s);
}
function Anim_HorizontalSpring_Slow(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; s.data[6] = 4; s.data[5] = 256; s.data[4] = 16; }
  HorizontalSpring(s);
}
function Anim_HorizontalRepeatedSpring_Fast(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; s.data[6] = 8; s.data[5] = 512; s.data[4] = 16; }
  HorizontalRepeatedSpring(s);
}
function Anim_HorizontalRepeatedSpring(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[2]++; s.data[7] = 0; s.data[6] = 8; s.data[5] = 512; s.data[4] = 8; }
  HorizontalRepeatedSpring(s);
}
function Anim_ShrinkGrow_Fast(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[7] = 5; s.data[6] = 8; }
  ShrinkGrow(s);
}
function Anim_ShrinkGrow_Slow(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[7] = 3; s.data[6] = 4; }
  ShrinkGrow(s);
}
function Anim_VerticalStretchBothEnds(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; HandleStartAffineAnim(s); s.data[4] = 1; s.data[6] = 30; s.data[3] = 60; s.data[7] = 0; }
  VerticalStretchBothEnds(s);
}
function Anim_VerticalStretchBothEnds_Twice(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; HandleStartAffineAnim(s); s.data[4] = 2; s.data[6] = 20; s.data[3] = 70; s.data[7] = 0; }
  VerticalStretchBothEnds(s);
}
function Anim_HorizontalStretchFar_Twice(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; HandleStartAffineAnim(s); s.data[4] = 2; s.data[6] = 20; s.data[3] = 70; s.data[5] = 0; s.data[7] = 0; }
  HorizontalStretchFar(s);
}
function Anim_HorizontalStretchFar(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; HandleStartAffineAnim(s); s.data[4] = 1; s.data[6] = 30; s.data[3] = 60; s.data[5] = 0; s.data[7] = 0; }
  HorizontalStretchFar(s);
}
function Anim_GrowStutter_Twice(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; HandleStartAffineAnim(s); s.data[4] = 2; s.data[6] = 20; s.data[3] = 70; s.data[5] = 0; s.data[7] = 0; }
  GrowStutter(s);
}
function Anim_GrowStutter(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; HandleStartAffineAnim(s); s.data[4] = 1; s.data[6] = 30; s.data[3] = 60; s.data[5] = 0; s.data[7] = 0; }
  GrowStutter(s);
}
function ConcaveArc(s: S): void {
  if (s.data[7] > 255) {
    if (s.data[6] <= 1) { setCb(s, WaitAnimEnd); s.x2 = 0; s.y2 = 0; }
    else { s.data[7] %= 256; s.data[6]--; }
  } else {
    s.x2 = -(Sin(s.data[7], s.data[5]));
    s.y2 = Sin((s.data[7] + 192) % 256, s.data[4]);
    if (s.y2 > 0) s.y2 *= -1;
    s.y2 += s.data[4];
    s.data[7] += s.data[3];
  }
}
function Anim_ConcaveArcLarge_Slow(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; s.data[6] = 1; s.data[7] = 0; s.data[5] = 12; s.data[4] = 12; s.data[3] = 4; }
  ConcaveArc(s);
}
function Anim_ConcaveArcLarge(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; s.data[6] = 1; s.data[7] = 0; s.data[5] = 12; s.data[4] = 12; s.data[3] = 6; }
  ConcaveArc(s);
}
function Anim_ConcaveArcLarge_Twice(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; s.data[6] = 2; s.data[7] = 0; s.data[5] = 12; s.data[4] = 12; s.data[3] = 8; }
  ConcaveArc(s);
}
function ConvexDoubleArc(s: S): void {
  if (s.data[7] > 256) {
    if (s.data[6] <= s.data[4]) setCb(s, WaitAnimEnd);
    else { s.data[4]++; s.data[7] = 0; }
    s.x2 = 0; s.y2 = 0;
  } else {
    if (s.data[7] > 159) {
      if (s.data[7] > 256) s.data[7] = 256;
      s.y2 = -(Sin(s.data[7] % 256, 8));
    } else if (s.data[7] > 95) {
      s.y2 = Sin(96, 6) - Sin((s.data[7] - 96) * 2, 4);
    } else {
      s.y2 = Sin(s.data[7], 6);
    }
    let posX = -(Sin(T(s.data[7] / 2), s.data[5]));
    if (s.data[4] % 2 === 0) posX *= -1;
    s.x2 = posX;
    s.data[7] += s.data[3];
  }
}
function Anim_ConvexDoubleArc_Slow(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; s.data[6] = 2; s.data[7] = 0; s.data[5] = 16; s.data[4] = 1; s.data[3] = 4; }
  ConvexDoubleArc(s);
}
function Anim_ConvexDoubleArc(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; s.data[6] = 2; s.data[7] = 0; s.data[5] = 16; s.data[4] = 1; s.data[3] = 6; }
  ConvexDoubleArc(s);
}
function Anim_ConvexDoubleArc_Twice(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; s.data[6] = 3; s.data[7] = 0; s.data[5] = 16; s.data[4] = 1; s.data[3] = 8; }
  ConvexDoubleArc(s);
}
function Anim_ConcaveArcSmall_Slow(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; s.data[6] = 1; s.data[7] = 0; s.data[5] = 4; s.data[4] = 6; s.data[3] = 4; }
  ConcaveArc(s);
}
function Anim_ConcaveArcSmall(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; s.data[6] = 1; s.data[7] = 0; s.data[5] = 4; s.data[4] = 6; s.data[3] = 6; }
  ConcaveArc(s);
}
function Anim_ConcaveArcSmall_Twice(s: S): void {
  if (s.data[2] === 0) { s.data[2] = 1; s.data[6] = 2; s.data[7] = 0; s.data[5] = 4; s.data[4] = 6; s.data[3] = 8; }
  ConcaveArc(s);
}
function SetHorizontalDip(s: S): void {
  const index = Sin(T(s.data[2] * 128 / s.data[7]), s.data[5]);
  s.data[6] = -(index << 8);
  SetPosForRotation(s, index, s.data[4], 0);
  HandleSetAffineData(s, 256, 256, s.data[6]);
}
function Anim_HorizontalDip(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[7] = 60; s.data[5] = 8; s.data[4] = -32; s.data[3] = 1; s.data[0] = 0; }
  if (s.data[2] > s.data[7]) {
    HandleSetAffineData(s, 256, 256, 0); s.x2 = 0; s.y2 = 0; s.data[0]++;
    if (s.data[3] <= s.data[0]) { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); return; }
    else s.data[2] = 0;
  } else SetHorizontalDip(s);
  s.data[2]++;
}
function Anim_HorizontalDip_Fast(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[7] = 90; s.data[5] = 8; s.data[4] = -32; s.data[3] = 1; s.data[0] = 0; }
  if (s.data[2] > s.data[7]) {
    HandleSetAffineData(s, 256, 256, 0); s.x2 = 0; s.y2 = 0; s.data[0]++;
    if (s.data[3] <= s.data[0]) { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); return; }
    else s.data[2] = 0;
  } else SetHorizontalDip(s);
  s.data[2]++;
}
function Anim_HorizontalDip_Twice(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.data[7] = 30; s.data[5] = 8; s.data[4] = -32; s.data[3] = 2; s.data[0] = 0; }
  if (s.data[2] > s.data[7]) {
    HandleSetAffineData(s, 256, 256, 0); s.x2 = 0; s.y2 = 0; s.data[0]++;
    if (s.data[3] <= s.data[0]) { ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); return; }
    else s.data[2] = 0;
  } else SetHorizontalDip(s);
  s.data[2]++;
}
function ShrinkGrowVibrate(s: S): void {
  if (s.data[2] > s.data[7]) { s.y2 = 0; HandleSetAffineData(s, 256, 256, 0); ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  else {
    const index = (T(((s.data[2] % s.data[6]) * 256) / s.data[6]) & 0xFFFF) % 256;
    let sinY: number;
    if (s.data[2] % 2 === 0) { s.data[4] = Sin(index, 32) + 256; s.data[5] = Sin(index, 32) + 256; sinY = Sin(index, 32); }
    else { s.data[4] = Sin(index, 8) + 256; s.data[5] = Sin(index, 8) + 256; sinY = Sin(index, 8); }
    const y = (T(sinY / 8)) & 0xFFFF;
    s.y2 = y;
    HandleSetAffineData(s, s.data[4], s.data[5], 0);
  }
  s.data[2]++;
}
function Anim_ShrinkGrowVibrate_Fast(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.y2 += 2; s.data[6] = 40; s.data[7] = 80; }
  ShrinkGrowVibrate(s);
}
function Anim_ShrinkGrowVibrate(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.y2 += 2; s.data[6] = 40; s.data[7] = 40; }
  ShrinkGrowVibrate(s);
}
function Anim_ShrinkGrowVibrate_Slow(s: S): void {
  if (s.data[2] === 0) { HandleStartAffineAnim(s); s.y2 += 2; s.data[6] = 80; s.data[7] = 80; }
  ShrinkGrowVibrate(s);
}
function JoltRight(s: S): void {
  TryFlipX(s);
  s.x2 -= s.data[2];
  if (s.x2 <= -s.data[6]) { s.x2 = -s.data[6]; s.data[7] = 2; setCb(s, JoltRight_0); }
  TryFlipX(s);
}
function JoltRight_0(s: S): void {
  TryFlipX(s);
  s.x2 += s.data[7]; s.data[7]++;
  if (s.x2 >= 0) setCb(s, JoltRight_1);
  TryFlipX(s);
}
function JoltRight_1(s: S): void {
  TryFlipX(s);
  s.x2 += s.data[7]; s.data[7]++;
  if (s.x2 > s.data[6]) { s.x2 = s.data[6]; setCb(s, JoltRight_2); }
  TryFlipX(s);
}
function JoltRight_2(s: S): void {
  TryFlipX(s);
  if (s.data[3] >= s.data[5]) setCb(s, JoltRight_3);
  else { s.x2 += s.data[4]; s.data[4] *= -1; s.data[3]++; }
  TryFlipX(s);
}
function JoltRight_3(s: S): void {
  TryFlipX(s);
  s.x2 -= 2;
  if (s.x2 <= 0) { s.x2 = 0; ResetSpriteAfterAnim(s); setCb(s, WaitAnimEnd); }
  TryFlipX(s);
}
function Anim_JoltRight_Fast(s: S): void {
  HandleStartAffineAnim(s);
  s.data[7] = 4; s.data[6] = 12; s.data[5] = 16; s.data[4] = 4; s.data[3] = 0; s.data[2] = 2;
  setCb(s, JoltRight);
}
function Anim_JoltRight(s: S): void {
  HandleStartAffineAnim(s);
  s.data[7] = 2; s.data[6] = 8; s.data[5] = 12; s.data[4] = 2; s.data[3] = 0; s.data[2] = 1;
  setCb(s, JoltRight);
}
function Anim_JoltRight_Slow(s: S): void {
  HandleStartAffineAnim(s);
  s.data[7] = 0; s.data[6] = 6; s.data[5] = 6; s.data[4] = 2; s.data[3] = 0; s.data[2] = 1;
  setCb(s, JoltRight);
}
function SetShakeFlashYellowPos(s: S): void {
  s.x2 = s.data[1];
  if (s.data[0] > 1) { s.data[1] *= -1; s.data[0] = 0; }
  else s.data[0]++;
}
function ShakeFlashYellow(s: S): void {
  const array = sShakeYellowFlashData[s.data[3]];
  SetShakeFlashYellowPos(s);
  if ((array[s.data[6]][1] & 0xFF) === 255) { s.x2 = 0; setCb(s, WaitAnimEnd); }
  else {
    if (s.data[4] === 1) {
      if (array[s.data[6]][0]) BlendPalette(s.data[7], 16, 16, RGB_YELLOW);
      else BlendPalette(s.data[7], 16, 0, RGB_YELLOW);
      s.data[4] = 0;
    }
    if (array[s.data[6]][1] === s.data[5]) { s.data[4] = 1; s.data[5] = 0; s.data[6]++; }
    else s.data[5]++;
  }
}
function Anim_ShakeFlashYellow_Fast(s: S): void {
  if (++s.data[2] === 1) { s.data[7] = OBJ_PLTT_ID(oamPalNum(s)); s.data[6] = 0; s.data[5] = 0; s.data[4] = 0; s.data[3] = 0; }
  ShakeFlashYellow(s);
}
function Anim_ShakeFlashYellow(s: S): void {
  if (++s.data[2] === 1) { s.data[7] = OBJ_PLTT_ID(oamPalNum(s)); s.data[6] = 0; s.data[5] = 0; s.data[4] = 0; s.data[3] = 1; }
  ShakeFlashYellow(s);
}
function Anim_ShakeFlashYellow_Slow(s: S): void {
  if (++s.data[2] === 1) { s.data[7] = OBJ_PLTT_ID(oamPalNum(s)); s.data[6] = 0; s.data[5] = 0; s.data[4] = 0; s.data[3] = 2; }
  ShakeFlashYellow(s);
}
function ShakeGlow_Blend(s: S): void {
  if (s.data[2] > 127) { BlendPalette(s.data[7], 16, 0, RGB_RED); setCb(s, WaitAnimEnd); }
  else { s.data[6] = Sin(s.data[2], 12); BlendPalette(s.data[7], 16, s.data[6], SHAKEGLOW_COLORS[s.data[1]]); }
}
function ShakeGlow_Move(s: S): void {
  if (s.data[3] < s.data[4]) {
    TryFlipX(s);
    if (s.data[5] > s.data[0]) {
      if (++s.data[3] < s.data[4]) s.data[5] = 0;
      s.x2 = 0;
    } else {
      const sign = 1 - (s.data[3] % 2 * 2);
      s.x2 = sign * Sin(T(s.data[5] * 384 / s.data[0]) % 256, 6);
      s.data[5]++;
    }
    TryFlipX(s);
  }
}
function makeShakeGlow(d0: number, d4: number, color: number): (s: S) => void {
  return (s: S) => {
    if (s.data[2] === 0) {
      s.data[7] = OBJ_PLTT_ID(oamPalNum(s)); s.data[0] = d0; s.data[5] = 0;
      s.data[4] = d4; s.data[3] = 0; s.data[1] = color;
    }
    if (s.data[2] % 2 === 0) ShakeGlow_Blend(s);
    if (s.data[2] >= T((128 - s.data[0] * s.data[4]) / 2)) ShakeGlow_Move(s);
    s.data[2]++;
  };
}
const Anim_ShakeGlowRed_Fast = makeShakeGlow(10, 2, 0);
const Anim_ShakeGlowRed = makeShakeGlow(20, 1, 0);
const Anim_ShakeGlowRed_Slow = makeShakeGlow(80, 1, 0);
const Anim_ShakeGlowGreen_Fast = makeShakeGlow(10, 2, 1);
const Anim_ShakeGlowGreen = makeShakeGlow(20, 1, 1);
const Anim_ShakeGlowGreen_Slow = makeShakeGlow(80, 1, 1);
const Anim_ShakeGlowBlue_Fast = makeShakeGlow(10, 2, 2);
const Anim_ShakeGlowBlue = makeShakeGlow(20, 1, 2);
const Anim_ShakeGlowBlue_Slow = makeShakeGlow(80, 1, 2);

/* ── sMonAnimFunctions dispatch (1:1 :630) ───────────────────────────────── */
const sMonAnimFunctions: Array<(s: S) => void> = [];
sMonAnimFunctions[ANIM.ANIM_V_SQUISH_AND_BOUNCE] = Anim_VerticalSquishBounce;
sMonAnimFunctions[ANIM.ANIM_CIRCULAR_STRETCH_TWICE] = Anim_CircularStretchTwice;
sMonAnimFunctions[ANIM.ANIM_H_VIBRATE] = Anim_HorizontalVibrate;
sMonAnimFunctions[ANIM.ANIM_H_SLIDE] = Anim_HorizontalSlide;
sMonAnimFunctions[ANIM.ANIM_V_SLIDE] = Anim_VerticalSlide;
sMonAnimFunctions[ANIM.ANIM_BOUNCE_ROTATE_TO_SIDES] = Anim_BounceRotateToSides;
sMonAnimFunctions[ANIM.ANIM_V_JUMPS_H_JUMPS] = Anim_VerticalJumpsHorizontalJumps;
sMonAnimFunctions[ANIM.ANIM_ROTATE_TO_SIDES] = Anim_RotateToSides;
sMonAnimFunctions[ANIM.ANIM_ROTATE_TO_SIDES_TWICE] = Anim_RotateToSides_Twice;
sMonAnimFunctions[ANIM.ANIM_GROW_VIBRATE] = Anim_GrowVibrate;
sMonAnimFunctions[ANIM.ANIM_ZIGZAG_FAST] = Anim_ZigzagFast;
sMonAnimFunctions[ANIM.ANIM_SWING_CONCAVE] = Anim_SwingConcave;
sMonAnimFunctions[ANIM.ANIM_SWING_CONCAVE_FAST] = Anim_SwingConcave_Fast;
sMonAnimFunctions[ANIM.ANIM_SWING_CONVEX] = Anim_SwingConvex;
sMonAnimFunctions[ANIM.ANIM_SWING_CONVEX_FAST] = Anim_SwingConvex_Fast;
sMonAnimFunctions[ANIM.ANIM_H_SHAKE] = Anim_HorizontalShake;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE] = Anim_VerticalShake;
sMonAnimFunctions[ANIM.ANIM_CIRCULAR_VIBRATE] = Anim_CircularVibrate;
sMonAnimFunctions[ANIM.ANIM_TWIST] = Anim_Twist;
sMonAnimFunctions[ANIM.ANIM_SHRINK_GROW] = Anim_ShrinkGrow;
sMonAnimFunctions[ANIM.ANIM_CIRCLE_C_CLOCKWISE] = Anim_CircleCounterclockwise;
sMonAnimFunctions[ANIM.ANIM_GLOW_BLACK] = Anim_GlowBlack;
sMonAnimFunctions[ANIM.ANIM_H_STRETCH] = Anim_HorizontalStretch;
sMonAnimFunctions[ANIM.ANIM_V_STRETCH] = Anim_VerticalStretch;
sMonAnimFunctions[ANIM.ANIM_RISING_WOBBLE] = Anim_RisingWobble;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_TWICE] = Anim_VerticalShakeTwice;
sMonAnimFunctions[ANIM.ANIM_TIP_MOVE_FORWARD] = Anim_TipMoveForward;
sMonAnimFunctions[ANIM.ANIM_H_PIVOT] = Anim_HorizontalPivot;
sMonAnimFunctions[ANIM.ANIM_V_SLIDE_WOBBLE] = Anim_VerticalSlideWobble;
sMonAnimFunctions[ANIM.ANIM_H_SLIDE_WOBBLE] = Anim_HorizontalSlideWobble;
sMonAnimFunctions[ANIM.ANIM_V_JUMPS_BIG] = Anim_VerticalJumps_Big;
sMonAnimFunctions[ANIM.ANIM_SPIN_LONG] = Anim_Spin_Long;
sMonAnimFunctions[ANIM.ANIM_GLOW_ORANGE] = Anim_GlowOrange;
sMonAnimFunctions[ANIM.ANIM_GLOW_RED] = Anim_GlowRed;
sMonAnimFunctions[ANIM.ANIM_GLOW_BLUE] = Anim_GlowBlue;
sMonAnimFunctions[ANIM.ANIM_GLOW_YELLOW] = Anim_GlowYellow;
sMonAnimFunctions[ANIM.ANIM_GLOW_PURPLE] = Anim_GlowPurple;
sMonAnimFunctions[ANIM.ANIM_BACK_AND_LUNGE] = Anim_BackAndLunge;
sMonAnimFunctions[ANIM.ANIM_BACK_FLIP] = Anim_BackFlip;
sMonAnimFunctions[ANIM.ANIM_FLICKER] = Anim_Flicker;
sMonAnimFunctions[ANIM.ANIM_BACK_FLIP_BIG] = Anim_BackFlipBig;
sMonAnimFunctions[ANIM.ANIM_FRONT_FLIP] = Anim_FrontFlip;
sMonAnimFunctions[ANIM.ANIM_TUMBLING_FRONT_FLIP] = Anim_TumblingFrontFlip;
sMonAnimFunctions[ANIM.ANIM_FIGURE_8] = Anim_Figure8;
sMonAnimFunctions[ANIM.ANIM_FLASH_YELLOW] = Anim_FlashYellow;
sMonAnimFunctions[ANIM.ANIM_SWING_CONCAVE_FAST_SHORT] = Anim_SwingConcave_FastShort;
sMonAnimFunctions[ANIM.ANIM_SWING_CONVEX_FAST_SHORT] = Anim_SwingConvex_FastShort;
sMonAnimFunctions[ANIM.ANIM_ROTATE_UP_SLAM_DOWN] = Anim_RotateUpSlamDown;
sMonAnimFunctions[ANIM.ANIM_DEEP_V_SQUISH_AND_BOUNCE] = Anim_DeepVerticalSquishBounce;
sMonAnimFunctions[ANIM.ANIM_H_JUMPS] = Anim_HorizontalJumps;
sMonAnimFunctions[ANIM.ANIM_H_JUMPS_V_STRETCH] = Anim_HorizontalJumpsVerticalStretch;
sMonAnimFunctions[ANIM.ANIM_ROTATE_TO_SIDES_FAST] = Anim_RotateToSides_Fast;
sMonAnimFunctions[ANIM.ANIM_ROTATE_UP_TO_SIDES] = Anim_RotateUpToSides;
sMonAnimFunctions[ANIM.ANIM_FLICKER_INCREASING] = Anim_FlickerIncreasing;
sMonAnimFunctions[ANIM.ANIM_TIP_HOP_FORWARD] = Anim_TipHopForward;
sMonAnimFunctions[ANIM.ANIM_PIVOT_SHAKE] = Anim_PivotShake;
sMonAnimFunctions[ANIM.ANIM_TIP_AND_SHAKE] = Anim_TipAndShake;
sMonAnimFunctions[ANIM.ANIM_VIBRATE_TO_CORNERS] = Anim_VibrateToCorners;
sMonAnimFunctions[ANIM.ANIM_GROW_IN_STAGES] = Anim_GrowInStages;
sMonAnimFunctions[ANIM.ANIM_V_SPRING] = Anim_VerticalSpring;
sMonAnimFunctions[ANIM.ANIM_V_REPEATED_SPRING] = Anim_VerticalRepeatedSpring;
sMonAnimFunctions[ANIM.ANIM_SPRING_RISING] = Anim_SpringRising;
sMonAnimFunctions[ANIM.ANIM_H_SPRING] = Anim_HorizontalSpring;
sMonAnimFunctions[ANIM.ANIM_H_REPEATED_SPRING_SLOW] = Anim_HorizontalRepeatedSpring_Slow;
sMonAnimFunctions[ANIM.ANIM_H_SLIDE_SHRINK] = Anim_HorizontalSlideShrink;
sMonAnimFunctions[ANIM.ANIM_LUNGE_GROW] = Anim_LungeGrow;
sMonAnimFunctions[ANIM.ANIM_CIRCLE_INTO_BG] = Anim_CircleIntoBackground;
sMonAnimFunctions[ANIM.ANIM_RAPID_H_HOPS] = Anim_RapidHorizontalHops;
sMonAnimFunctions[ANIM.ANIM_FOUR_PETAL] = Anim_FourPetal;
sMonAnimFunctions[ANIM.ANIM_V_SQUISH_AND_BOUNCE_SLOW] = Anim_VerticalSquishBounce_Slow;
sMonAnimFunctions[ANIM.ANIM_H_SLIDE_SLOW] = Anim_HorizontalSlide_Slow;
sMonAnimFunctions[ANIM.ANIM_V_SLIDE_SLOW] = Anim_VerticalSlide_Slow;
sMonAnimFunctions[ANIM.ANIM_BOUNCE_ROTATE_TO_SIDES_SMALL] = Anim_BounceRotateToSides_Small;
sMonAnimFunctions[ANIM.ANIM_BOUNCE_ROTATE_TO_SIDES_SLOW] = Anim_BounceRotateToSides_Slow;
sMonAnimFunctions[ANIM.ANIM_BOUNCE_ROTATE_TO_SIDES_SMALL_SLOW] = Anim_BounceRotateToSides_SmallSlow;
sMonAnimFunctions[ANIM.ANIM_ZIGZAG_SLOW] = Anim_ZigzagSlow;
sMonAnimFunctions[ANIM.ANIM_H_SHAKE_SLOW] = Anim_HorizontalShake_Slow;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_SLOW] = Anim_VertialShake_Slow;
sMonAnimFunctions[ANIM.ANIM_TWIST_TWICE] = Anim_Twist_Twice;
sMonAnimFunctions[ANIM.ANIM_CIRCLE_C_CLOCKWISE_SLOW] = Anim_CircleCounterclockwise_Slow;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_TWICE_SLOW] = Anim_VerticalShakeTwice_Slow;
sMonAnimFunctions[ANIM.ANIM_V_SLIDE_WOBBLE_SMALL] = Anim_VerticalSlideWobble_Small;
sMonAnimFunctions[ANIM.ANIM_V_JUMPS_SMALL] = Anim_VerticalJumps_Small;
sMonAnimFunctions[ANIM.ANIM_SPIN] = Anim_Spin;
sMonAnimFunctions[ANIM.ANIM_TUMBLING_FRONT_FLIP_TWICE] = Anim_TumblingFrontFlip_Twice;
sMonAnimFunctions[ANIM.ANIM_DEEP_V_SQUISH_AND_BOUNCE_TWICE] = Anim_DeepVerticalSquishBounce_Twice;
sMonAnimFunctions[ANIM.ANIM_H_JUMPS_V_STRETCH_TWICE] = Anim_HorizontalJumpsVerticalStretch_Twice;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_BACK] = Anim_VerticalShakeBack;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_BACK_SLOW] = Anim_VerticalShakeBack_Slow;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_H_SLIDE_SLOW] = Anim_VerticalShakeHorizontalSlide_Slow;
sMonAnimFunctions[ANIM.ANIM_V_STRETCH_BOTH_ENDS_SLOW] = Anim_VerticalStretchBothEnds_Slow;
sMonAnimFunctions[ANIM.ANIM_H_STRETCH_FAR_SLOW] = Anim_HorizontalStretchFar_Slow;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_LOW_TWICE] = Anim_VerticalShakeLowTwice;
sMonAnimFunctions[ANIM.ANIM_H_SHAKE_FAST] = Anim_HorizontalShake_Fast;
sMonAnimFunctions[ANIM.ANIM_H_SLIDE_FAST] = Anim_HorizontalSlide_Fast;
sMonAnimFunctions[ANIM.ANIM_H_VIBRATE_FAST] = Anim_HorizontalVibrate_Fast;
sMonAnimFunctions[ANIM.ANIM_H_VIBRATE_FASTEST] = Anim_HorizontalVibrate_Fastest;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_BACK_FAST] = Anim_VerticalShakeBack_Fast;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_LOW_TWICE_SLOW] = Anim_VerticalShakeLowTwice_Slow;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_LOW_TWICE_FAST] = Anim_VerticalShakeLowTwice_Fast;
sMonAnimFunctions[ANIM.ANIM_CIRCLE_C_CLOCKWISE_LONG] = Anim_CircleCounterclockwise_Long;
sMonAnimFunctions[ANIM.ANIM_GROW_STUTTER_SLOW] = Anim_GrowStutter_Slow;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_H_SLIDE] = Anim_VerticalShakeHorizontalSlide;
sMonAnimFunctions[ANIM.ANIM_V_SHAKE_H_SLIDE_FAST] = Anim_VerticalShakeHorizontalSlide_Fast;
sMonAnimFunctions[ANIM.ANIM_TRIANGLE_DOWN_SLOW] = Anim_TriangleDown_Slow;
sMonAnimFunctions[ANIM.ANIM_TRIANGLE_DOWN] = Anim_TriangleDown;
sMonAnimFunctions[ANIM.ANIM_TRIANGLE_DOWN_TWICE] = Anim_TriangleDown_Fast;
sMonAnimFunctions[ANIM.ANIM_GROW] = Anim_Grow;
sMonAnimFunctions[ANIM.ANIM_GROW_TWICE] = Anim_Grow_Twice;
sMonAnimFunctions[ANIM.ANIM_H_SPRING_FAST] = Anim_HorizontalSpring_Fast;
sMonAnimFunctions[ANIM.ANIM_H_SPRING_SLOW] = Anim_HorizontalSpring_Slow;
sMonAnimFunctions[ANIM.ANIM_H_REPEATED_SPRING_FAST] = Anim_HorizontalRepeatedSpring_Fast;
sMonAnimFunctions[ANIM.ANIM_H_REPEATED_SPRING] = Anim_HorizontalRepeatedSpring;
sMonAnimFunctions[ANIM.ANIM_SHRINK_GROW_FAST] = Anim_ShrinkGrow_Fast;
sMonAnimFunctions[ANIM.ANIM_SHRINK_GROW_SLOW] = Anim_ShrinkGrow_Slow;
sMonAnimFunctions[ANIM.ANIM_V_STRETCH_BOTH_ENDS] = Anim_VerticalStretchBothEnds;
sMonAnimFunctions[ANIM.ANIM_V_STRETCH_BOTH_ENDS_TWICE] = Anim_VerticalStretchBothEnds_Twice;
sMonAnimFunctions[ANIM.ANIM_H_STRETCH_FAR_TWICE] = Anim_HorizontalStretchFar_Twice;
sMonAnimFunctions[ANIM.ANIM_H_STRETCH_FAR] = Anim_HorizontalStretchFar;
sMonAnimFunctions[ANIM.ANIM_GROW_STUTTER_TWICE] = Anim_GrowStutter_Twice;
sMonAnimFunctions[ANIM.ANIM_GROW_STUTTER] = Anim_GrowStutter;
sMonAnimFunctions[ANIM.ANIM_CONCAVE_ARC_LARGE_SLOW] = Anim_ConcaveArcLarge_Slow;
sMonAnimFunctions[ANIM.ANIM_CONCAVE_ARC_LARGE] = Anim_ConcaveArcLarge;
sMonAnimFunctions[ANIM.ANIM_CONCAVE_ARC_LARGE_TWICE] = Anim_ConcaveArcLarge_Twice;
sMonAnimFunctions[ANIM.ANIM_CONVEX_DOUBLE_ARC_SLOW] = Anim_ConvexDoubleArc_Slow;
sMonAnimFunctions[ANIM.ANIM_CONVEX_DOUBLE_ARC] = Anim_ConvexDoubleArc;
sMonAnimFunctions[ANIM.ANIM_CONVEX_DOUBLE_ARC_TWICE] = Anim_ConvexDoubleArc_Twice;
sMonAnimFunctions[ANIM.ANIM_CONCAVE_ARC_SMALL_SLOW] = Anim_ConcaveArcSmall_Slow;
sMonAnimFunctions[ANIM.ANIM_CONCAVE_ARC_SMALL] = Anim_ConcaveArcSmall;
sMonAnimFunctions[ANIM.ANIM_CONCAVE_ARC_SMALL_TWICE] = Anim_ConcaveArcSmall_Twice;
sMonAnimFunctions[ANIM.ANIM_H_DIP] = Anim_HorizontalDip;
sMonAnimFunctions[ANIM.ANIM_H_DIP_FAST] = Anim_HorizontalDip_Fast;
sMonAnimFunctions[ANIM.ANIM_H_DIP_TWICE] = Anim_HorizontalDip_Twice;
sMonAnimFunctions[ANIM.ANIM_SHRINK_GROW_VIBRATE_FAST] = Anim_ShrinkGrowVibrate_Fast;
sMonAnimFunctions[ANIM.ANIM_SHRINK_GROW_VIBRATE] = Anim_ShrinkGrowVibrate;
sMonAnimFunctions[ANIM.ANIM_SHRINK_GROW_VIBRATE_SLOW] = Anim_ShrinkGrowVibrate_Slow;
sMonAnimFunctions[ANIM.ANIM_JOLT_RIGHT_FAST] = Anim_JoltRight_Fast;
sMonAnimFunctions[ANIM.ANIM_JOLT_RIGHT] = Anim_JoltRight;
sMonAnimFunctions[ANIM.ANIM_JOLT_RIGHT_SLOW] = Anim_JoltRight_Slow;
sMonAnimFunctions[ANIM.ANIM_SHAKE_FLASH_YELLOW_FAST] = Anim_ShakeFlashYellow_Fast;
sMonAnimFunctions[ANIM.ANIM_SHAKE_FLASH_YELLOW] = Anim_ShakeFlashYellow;
sMonAnimFunctions[ANIM.ANIM_SHAKE_FLASH_YELLOW_SLOW] = Anim_ShakeFlashYellow_Slow;
sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_RED_FAST] = Anim_ShakeGlowRed_Fast;
sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_RED] = Anim_ShakeGlowRed;
sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_RED_SLOW] = Anim_ShakeGlowRed_Slow;
sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_GREEN_FAST] = Anim_ShakeGlowGreen_Fast;
sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_GREEN] = Anim_ShakeGlowGreen;
sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_GREEN_SLOW] = Anim_ShakeGlowGreen_Slow;
sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_BLUE_FAST] = Anim_ShakeGlowBlue_Fast;
sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_BLUE] = Anim_ShakeGlowBlue;
sMonAnimFunctions[ANIM.ANIM_SHAKE_GLOW_BLUE_SLOW] = Anim_ShakeGlowBlue_Slow;

/* ── Species tables (1:1 sMonFrontAnimIdsTable / sMonAnimationDelayTable /
 *    HasTwoFramesAnimation — extraits pokemon.c, keyés enum SPECIES_X) ───── */
const _frontAnimByEnum = new Map<string, number>();
for (const [sp, anim] of RAW_MON_FRONT_ANIM_IDS) {
  const id = ANIM[anim]; if (id !== undefined) _frontAnimByEnum.set(sp, id);
}
const _delayByEnum = new Map<string, number>();
for (const [sp, d] of RAW_MON_ANIM_DELAYS) _delayByEnum.set(sp, Number(d) | 0);

/* ── API publique (1:1 PokemonSummaryDoMonAnimation + delay task) ────────── */
let _animDelayTaskId = -1;

/** 1:1 décomp `StartMonSummaryAnimation` (pokemon_animation.c:949). */
export function StartMonSummaryAnimation(s: DecompSprite, frontAnimId: number): void {
  const fn = sMonAnimFunctions[frontAnimId];
  if (fn) setCb(s, fn);
}

/** 1:1 décomp `Task_PokemonSummaryAnimateAfterDelay` (pokemon.c:6761). */
function _taskAnimateAfterDelay(task: { taskId: number; data: number[] }): void {
  const rt = getRuntime(); if (!rt) return;
  if (--task.data[3] === 0) {
    const sprId = (task.data[0] | (task.data[1] << 16)) >>> 0;
    const spr = rt.gSprites[sprId];
    if (spr) StartMonSummaryAnimation(spr, task.data[2]);
    _animDelayTaskId = -1;
    rt.DestroyTask(task.taskId);
  }
}

/* ── Frame-toggle 2 frames (1:1 StartSpriteAnim(.,1) = sAnim_X_1) ─────────
 *  gMonFrontAnimsPtrTable[species][1] = séquence AnimCmd FRAME(img,dur)…END
 *  (toggle front-pic frame 0↔1, le mon "respire"). Jouée EN PARALLÈLE de
 *  l'anim affine (sprite->anims/AnimateSprite ≠ sprite->callback décomp).
 *  Données = front-pic-anims.json (extract-front-pic-anims.mjs). frame img
 *  → oam.tileId = base + img*frameTiles (anim_front.png 2×64 tiles). */
let _fpa: Record<string, number[][]> | null = null;
let _fpaLoading: Promise<void> | null = null;
export function preloadFrontPicAnims(): Promise<void> {
  if (_fpa) return Promise.resolve();
  if (!_fpaLoading) {
    _fpaLoading = fetch('/decomp/em/pokemon/front-pic-anims.json')
      .then((r) => r.json()).then((j) => { _fpa = j; })
      .catch((e) => { console.error('[mon-anim] front-pic-anims load failed:', e); _fpa = {}; });
  }
  return _fpaLoading;
}

/** 1:1 décomp `HasTwoFramesAnimation` (pokemon.c:6959). */
export function HasTwoFramesAnimation(speciesEnum: string): boolean {
  return speciesEnum !== 'SPECIES_CASTFORM' && speciesEnum !== 'SPECIES_DEOXYS'
      && speciesEnum !== 'SPECIES_SPINDA' && speciesEnum !== 'SPECIES_UNOWN';
}

interface FrameAnimState { spriteId: number; cmds: number[][]; idx: number; left: number; base: number; frameTiles: number }
let _frameAnim: FrameAnimState | null = null;
let _frameAnimTaskId = -1;

function _applyFrame(st: FrameAnimState): void {
  const rt = getRuntime(); if (!rt) return;
  const spr = rt.gSprites[st.spriteId]; if (!spr) return;
  const img = st.cmds[st.idx]?.[0] ?? 0;
  rt.gba.oam[spr.oamIndex].tileId = st.base + img * st.frameTiles;
}
function _tickMonFrameAnim(): void {
  const st = _frameAnim; if (!st) return;
  // FRAME(img,dur) affiché `dur` ticks ; ANIMCMD_END → tient la dernière.
  if (--st.left > 0) return;
  st.idx++;
  if (st.idx >= st.cmds.length) {                 // END
    const rt = getRuntime();
    if (rt && _frameAnimTaskId >= 0) { try { rt.DestroyTask(_frameAnimTaskId); } catch { /* */ } }
    _frameAnimTaskId = -1; _frameAnim = null;
    return;
  }
  st.left = st.cmds[st.idx][1];
  _applyFrame(st);
}
function _startMonFrameAnim(s: DecompSprite, speciesEnum: string, base: number, frameTiles: number): void {
  const rt = getRuntime(); if (!rt || !_fpa) return;
  const cmds = _fpa[speciesEnum];
  if (!cmds || cmds.length === 0) return;          // pas de 2-frame (1:1 GeneralFrame0)
  _stopMonFrameAnim();
  _frameAnim = { spriteId: s.spriteId, cmds, idx: 0, left: cmds[0][1], base, frameTiles };
  _applyFrame(_frameAnim);
  _frameAnimTaskId = rt.CreateTask(((_t: { taskId: number; data: number[] }) => _tickMonFrameAnim()) as unknown as (t: { taskId: number; data: number[] }) => void, 0);
}
function _stopMonFrameAnim(): void {
  const rt = getRuntime();
  if (_frameAnimTaskId >= 0) { try { rt?.DestroyTask(_frameAnimTaskId); } catch { /* */ } _frameAnimTaskId = -1; }
  if (_frameAnim && rt) {                          // remet frame 0 (= GeneralFrame0)
    const spr = rt.gSprites[_frameAnim.spriteId];
    if (spr) rt.gba.oam[spr.oamIndex].tileId = _frameAnim.base;
  }
  _frameAnim = null;
}

/** 1:1 décomp `PokemonSummaryDoMonAnimation` (pokemon.c:6826). speciesEnum =
 *  'SPECIES_X' ; oneFrame = isEgg. monPicTileBase/frameTiles = OBJ tile du
 *  front-pic (anim_front.png 2 frames : frame 1 = base + frameTiles). */
export function PokemonSummaryDoMonAnimation(
  s: DecompSprite, speciesEnum: string, oneFrame: boolean,
  monPicTileBase = 0, frameTiles = 64,
): void {
  const rt = getRuntime(); if (!rt) return;
  // 1:1 : if (!oneFrame && HasTwoFramesAnimation(species)) StartSpriteAnim(.,1)
  // → joue sAnim_X_1 (toggle frame 0↔1) EN PARALLÈLE de l'anim affine.
  if (!oneFrame && HasTwoFramesAnimation(speciesEnum)) {
    _startMonFrameAnim(s, speciesEnum, monPicTileBase, frameTiles);
  }
  const animId = _frontAnimByEnum.get(speciesEnum) ?? ANIM.ANIM_V_SQUISH_AND_BOUNCE;
  const delay = _delayByEnum.get(speciesEnum) ?? 0;
  if (delay !== 0) {
    const sprId = s.spriteId >>> 0;
    const tid = rt.CreateTask(_taskAnimateAfterDelay as unknown as (t: { taskId: number; data: number[] }) => void, 0);
    const t = rt.gTasks.get(tid);
    if (t) { t.data[0] = sprId & 0xFFFF; t.data[1] = (sprId >> 16) & 0xFFFF; t.data[2] = animId; t.data[3] = delay; }
    _animDelayTaskId = tid;
    s.callback = MonAnimDummySpriteCallback as unknown as DecompSprite['callback'];
  } else {
    StartMonSummaryAnimation(s, animId);
  }
}

/** 1:1 décomp `SummaryScreen_DestroyAnimDelayTask` / `StopPokemonAnimation
 *  DelayTask`. */
export function StopPokemonAnimationDelayTask(): void {
  const rt = getRuntime();
  if (_animDelayTaskId >= 0) { try { rt?.DestroyTask(_animDelayTaskId); } catch { /* */ } _animDelayTaskId = -1; }
}

/** 1:1 décomp `StopPokemonAnimations` (pokemon_summary_screen.c:4030) :
 *  fige le sprite + restaure la palette OBJ (annule BlendPalette glow). */
export function StopPokemonAnimations(s: DecompSprite): void {
  const rt = getRuntime(); if (!rt) return;
  s.callback = SpriteCallbackDummy as unknown as DecompSprite['callback'];
  _stopMonFrameAnim();
  StopPokemonAnimationDelayTask();
  const palIndex = OBJ_PLTT_ID(rt.gba.oam[s.oamIndex]?.paletteBank ?? 0);
  for (let i = 0; i < 16; i++) {
    const id = i + palIndex;
    rt.gPlttBufferUnfaded.set(id, rt.gPlttBufferFaded.get(id));
  }
}
