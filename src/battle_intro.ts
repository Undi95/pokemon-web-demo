/**
 * battle_intro.ts — Port MIROIR 1:1 de la décomp `src/battle_intro.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/battle_intro.c
 *
 * L'animation d'ENTRÉE de combat : la fente WIN0 s'ouvre verticalement + le terrain
 * scrolle (gBattle_BG1_X) + se "cisaille" par scanline (gScanlineEffectRegBuffers →
 * REG_BG3HOFS). Les `BattleIntroSlide1/2/3/Link/Partner` sont des TASK FUNCS
 * (CreateTask) tickées par RunTasks ; `HandleIntroSlide(environment)` en crée une
 * selon l'environnement (sBattleIntroSlideFuncs).
 *
 * === Adaptations (// HW-emu) — la LOGIQUE reste 1:1 ===
 *  - Globals battle_main `gBattle_BG*_X/Y`, `gBattle_WIN0V`, `gIntroSlideFlags` vivent
 *    sur `globalThis` (convention du projet ; cf battle_anim/battle_dome auto-callbacks).
 *    `VBlankCB_Battle` les applique aux registres (unifié dans battle-vblank-helpers).
 *  - Primitives HW (CreateTask/DestroyTask/gTasks, SetGpuReg/GetGpuReg, CpuFill32,
 *    SetBgAttribute, LoadBgTiles/Tilemap, CpuCopy16, gSprites, gBattleStruct,
 *    gMonSpritesGfxPtr, GetBattlerAtPosition) via le runtime central `globalThis.__rt`.
 *  - Le DMA HBlank du scanline est géré par scanline_effect.ts (importé).
 */
import { Cos2 } from './trig';
import { SetBgAttribute } from './window';
import { LoadBgTilemap } from '../harness/runtime/decomp-globals';
import { gScanlineEffect, gScanlineEffectRegBuffers } from './scanline_effect';
import {
  REG_OFFSET_WININ, REG_OFFSET_WINOUT, REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY,
  REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_DISPCNT,
  DISPCNT_OBJ_ON, DISPCNT_OBJ_1D_MAP, DISPCNT_WIN0_ON, DISPCNT_WIN1_ON,
  BLDCNT_TGT1_BG1, BLDCNT_EFFECT_BLEND, BLDCNT_TGT2_BG3, BLDCNT_TGT2_OBJ,
} from '../harness/runtime/decomp-runtime';
/** 1:1 io_reg.h `DISPCNT_OBJWIN_ON` (bit 15). Pas exporté par decomp-runtime. */
const DISPCNT_OBJWIN_ON = 0x8000;

// ─── Runtime central (HW-emu, lazy) ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rt(): any { return (globalThis as any).__rt; }
// Globals battle_main sur globalThis (convention projet). G.gBattle_BG1_X etc.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const G = globalThis as any;

// ─── Constantes 1:1 (gba/io_reg.h, battle_environment, battle constants) ─────
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;
const BG_SCREEN_SIZE = 0x800;

// WININ/WINOUT (io_reg.h) : low byte = WIN0 / WIN01-inside, high byte = WIN1 / WINOBJ.
const WININ_WIN0_BG_ALL = 0x0F, WININ_WIN0_OBJ = 0x10, WININ_WIN0_CLR = 0x20;
const WININ_WIN1_BG1 = 0x200, WININ_WIN1_BG2 = 0x400, WININ_WIN1_BG3 = 0x800;
const WININ_WIN1_OBJ = 0x1000, WININ_WIN1_CLR = 0x2000;
const WININ_WIN0_ALL = WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR;          // 0x3F
const WININ_WIN1_ALL = (WININ_WIN0_BG_ALL << 8) | WININ_WIN1_OBJ | WININ_WIN1_CLR;   // 0x3F00
const WINOUT_WIN01_BG_ALL = 0x0F, WINOUT_WIN01_BG1 = 0x02, WINOUT_WIN01_BG2 = 0x04;
const WINOUT_WIN01_OBJ = 0x10, WINOUT_WIN01_CLR = 0x20;
const WINOUT_WINOBJ_BG_ALL = 0xF00, WINOUT_WINOBJ_OBJ = 0x1000, WINOUT_WINOBJ_CLR = 0x2000;
const WINOUT_ALL = WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR
  | WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR;

// BGCNT (io_reg.h)
function BGCNT_PRIORITY(n: number): number { return n & 3; }
function BGCNT_CHARBASE(n: number): number { return (n & 3) << 2; }
function BGCNT_SCREENBASE(n: number): number { return (n & 0x1F) << 8; }
const BGCNT_16COLOR = 0x0000;
const BGCNT_TXT256x512 = 0x8000;
const BGCNT_TXT512x256 = 0x4000;

// BG attribute id pour SetBgAttribute (bg.h enum) : charBaseIndex.
const BG_ATTR_CHARBASEINDEX = 1;
const ST_OAM_OBJ_WINDOW = 2;

// BATTLE_ENVIRONMENT_* (constants/battle.h)
const BATTLE_ENVIRONMENT_GRASS = 0, BATTLE_ENVIRONMENT_LONG_GRASS = 1, BATTLE_ENVIRONMENT_SAND = 2;
const BATTLE_ENVIRONMENT_UNDERWATER = 3, BATTLE_ENVIRONMENT_WATER = 4, BATTLE_ENVIRONMENT_POND = 5;
const BATTLE_ENVIRONMENT_MOUNTAIN = 6, BATTLE_ENVIRONMENT_CAVE = 7, BATTLE_ENVIRONMENT_BUILDING = 8;
const BATTLE_ENVIRONMENT_PLAIN = 9;

// BATTLE_TYPE_* (constants/battle.h) — masks utilisés ici.
const BATTLE_TYPE_LINK = 0x00000002;
const BATTLE_TYPE_RECORDED_LINK = 0x02000000;
// AUDIT FIX (audit-inline-battle-constants) : valeurs 1:1 battle.h/trainers.h/global.h
// (étaient fausses : INGAME_PARTNER 1<<24, FRONTIER 1<<10, KYOGRE_GROUDON 1<<18,
// STEVEN_PARTNER 0x300 « approx », VERSION_RUBY 1).
const BATTLE_TYPE_INGAME_PARTNER = 0x00400000;  // bit 22
const BATTLE_TYPE_FRONTIER = 0x003F0100;         // TOWER|DOME|PALACE|ARENA|FACTORY|PIKE|PYRAMID
const BATTLE_TYPE_KYOGRE_GROUDON = 0x00001000;   // bit 12
const TRAINER_STEVEN_PARTNER = 3075;             // trainers.h:17
const VERSION_RUBY = 2;                           // global.h

// ─── helpers GPU/CPU (HW-emu via rt) ────────────────────────────────────────
function SetGpuReg(off: number, v: number): void { rt()?.SetGpuReg?.(off, v & 0xFFFF); }
function GetGpuReg(off: number): number { return rt()?.GetGpuReg?.(off) ?? 0; }
// 1:1 io_reg.h BLDALPHA_BLEND(t1, t2) = (t1 | (t2 << 8)) SANS masque : Slide2/3
// passent data[4] PACKED (eva|evb<<8) en t1 -> le masque 0x1F perdait l evb
// (le cross-fade entry->terrain ne fadait que l entry). Fix matrice 2026-06-11.
function BLDALPHA_BLEND(eva: number, evb: number): number { return ((eva & 0xFFFF) | ((evb & 0xFF) << 8)) & 0xFFFF; }
/** 1:1 `CpuFill32(0, BG_SCREEN_ADDR(n), size)` : clear une zone de VRAM BG (screen base). */
function CpuFill32_BgScreen(screenBase: number, sizeBytes: number): void {
  const vram = rt()?.gba?.vram as Uint8Array | undefined;
  if (!vram) return;
  const base = screenBase * BG_SCREEN_SIZE;  // BG_SCREEN_ADDR(n) = VRAM + n*0x800
  vram.fill(0, base, Math.min(vram.length, base + sizeBytes));
}
// SetBgAttribute : désormais le VRAI port 1:1 bg.c:476 (src/window.ts) — l'ancien
// dispatch `rt()?.SetBgAttribute?.()` était un no-op silencieux (jamais porté).

// ─── globals battle_main (globalThis) : accès typés courts ──────────────────
function gBattleTypeFlags(): number { return (G.gBattleTypeFlags | 0) || (rt()?.gBattleTypeFlags | 0) || 0; }
function setIntroSlideFlagsClearBit0(): void { G.gIntroSlideFlags = (G.gIntroSlideFlags | 0) & ~1; }

// ─── Task helpers (HW-emu via rt.gTasks / rt.CreateTask) ────────────────────
// tState = data[0], tEnvironment = data[1] (1:1 #define battle_intro.c:102-103).
function tData(taskId: number): number[] { return rt().gTasks[taskId].data as number[]; }  // HW-emu : rt.gTasks = Map

// ═══════════════════════════════════════════════════════════════════════════
// SetAnimBgAttribute / GetAnimBgAttribute (battle_intro.c:39-100)
// (gBattleAnimBgCntSet/Get + struct BgCnt bitfields). Déférés : utilisés par les
// anims de move (chantier ultérieur), pas par l'intro slide. Stubs 1:1-compatibles.
// ═══════════════════════════════════════════════════════════════════════════
export function SetAnimBgAttribute(_bgId: number, _attributeId: number, _value: number): void {
  // Dette : gBattleAnimBgCntSet[] + BgCnt bitfields (battle_anim BG). Hors intro slide.
}
export function GetAnimBgAttribute(_bgId: number, _attributeId: number): number {
  return 0;  // Dette (idem)
}

// ═══════════════════════════════════════════════════════════════════════════
// HandleIntroSlide (battle_intro.c:105-138)
// ═══════════════════════════════════════════════════════════════════════════
const sBattleIntroSlideFuncs: Record<number, (taskId: number) => void> = {
  [BATTLE_ENVIRONMENT_GRASS]: BattleIntroSlide1,
  [BATTLE_ENVIRONMENT_LONG_GRASS]: BattleIntroSlide1,
  [BATTLE_ENVIRONMENT_SAND]: BattleIntroSlide2,
  [BATTLE_ENVIRONMENT_UNDERWATER]: BattleIntroSlide2,
  [BATTLE_ENVIRONMENT_WATER]: BattleIntroSlide2,
  [BATTLE_ENVIRONMENT_POND]: BattleIntroSlide1,
  [BATTLE_ENVIRONMENT_MOUNTAIN]: BattleIntroSlide1,
  [BATTLE_ENVIRONMENT_CAVE]: BattleIntroSlide1,
  [BATTLE_ENVIRONMENT_BUILDING]: BattleIntroSlide3,
  [BATTLE_ENVIRONMENT_PLAIN]: BattleIntroSlide3,
};

export function HandleIntroSlide(environment: number): void {
  const r = rt();
  let taskId: number;
  const flags = gBattleTypeFlags();
  // HW-emu : notre runtime appelle la task func avec l'OBJET DecompTask, pas le taskId
  // (décomp = func(taskId)). On wrappe pour passer `task.taskId` aux BattleIntroSlideN
  // (qui gardent la signature 1:1 `(taskId)` + tData(taskId)=gTasks[taskId]).
  const _ct = (fn: (taskId: number) => void): number =>
    r.CreateTask((tk: { taskId: number }) => fn(tk.taskId), 0);

  if ((flags & BATTLE_TYPE_INGAME_PARTNER) && G.gPartnerTrainerId !== TRAINER_STEVEN_PARTNER) {
    taskId = _ct(BattleIntroSlidePartner);
  } else if (flags & BATTLE_TYPE_LINK) {
    taskId = _ct(BattleIntroSlideLink);
  } else if (flags & BATTLE_TYPE_FRONTIER) {
    taskId = _ct(BattleIntroSlide3);
  } else if ((flags & BATTLE_TYPE_KYOGRE_GROUDON) && G.gGameVersion !== VERSION_RUBY) {
    environment = BATTLE_ENVIRONMENT_UNDERWATER;
    taskId = _ct(BattleIntroSlide2);
  } else {
    taskId = _ct(sBattleIntroSlideFuncs[environment] ?? BattleIntroSlide1);
  }

  const data = tData(taskId);
  data[0] = 0;             // tState
  data[1] = environment;   // tEnvironment
  data[2] = 0; data[3] = 0; data[4] = 0; data[5] = 0; data[6] = 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// BattleIntroSlideEnd (battle_intro.c:140-152)
// ═══════════════════════════════════════════════════════════════════════════
function BattleIntroSlideEnd(taskId: number): void {
  rt().DestroyTask(taskId);
  G.gBattle_BG1_X = 0;
  G.gBattle_BG1_Y = 0;
  G.gBattle_BG2_X = 0;
  G.gBattle_BG2_Y = 0;
  SetGpuReg(REG_OFFSET_BLDCNT, 0);
  SetGpuReg(REG_OFFSET_BLDALPHA, 0);
  SetGpuReg(REG_OFFSET_BLDY, 0);
  SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL | WININ_WIN1_ALL);
  SetGpuReg(REG_OFFSET_WINOUT, WINOUT_ALL);
}

// ═══════════════════════════════════════════════════════════════════════════
// BattleIntroSlide1 (battle_intro.c:154-237) — GRASS/LONG_GRASS/POND/MOUNTAIN/CAVE
// ═══════════════════════════════════════════════════════════════════════════
function BattleIntroSlide1(taskId: number): void {
  const data = tData(taskId);
  let i: number;

  G.gBattle_BG1_X = (G.gBattle_BG1_X + 6) & 0xFFFF;
  switch (data[0] /* tState */) {
    case 0:
      data[2] = (gBattleTypeFlags() & BATTLE_TYPE_LINK) ? 16 : 1;
      data[0]++;
      break;
    case 1:
      if (--data[2] === 0) {
        data[0]++;
        SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL);
      }
      break;
    case 2:
      G.gBattle_WIN0V = (G.gBattle_WIN0V - 0xFF) & 0xFFFF;
      if ((G.gBattle_WIN0V & 0xFF00) === 0x3000) {
        data[0]++;
        data[2] = DISPLAY_WIDTH;
        data[3] = 32;
        setIntroSlideFlagsClearBit0();
      }
      break;
    case 3:
      if (data[3]) {
        data[3]--;
      } else {
        if (data[1] /* tEnvironment */ === BATTLE_ENVIRONMENT_LONG_GRASS) {
          if (G.gBattle_BG1_Y !== ((-80) & 0xFFFF)) G.gBattle_BG1_Y = (G.gBattle_BG1_Y - 2) & 0xFFFF;
        } else {
          if (G.gBattle_BG1_Y !== ((-56) & 0xFFFF)) G.gBattle_BG1_Y = (G.gBattle_BG1_Y - 1) & 0xFFFF;
        }
      }
      if (G.gBattle_WIN0V & 0xFF00) G.gBattle_WIN0V = (G.gBattle_WIN0V - 0x3FC) & 0xFFFF;
      if (data[2]) data[2] -= 2;

      // Scanline (réglé par ScanlineEffect_SetParams en CB2_InitBattleInternal).
      for (i = 0; i < DISPLAY_HEIGHT / 2; i++) gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = data[2] & 0xFFFF;
      for (; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = (-data[2]) & 0xFFFF;

      if (data[2] === 0) {
        gScanlineEffect.state = 3;
        data[0]++;
        CpuFill32_BgScreen(28, BG_SCREEN_SIZE);
        SetBgAttribute(1, BG_ATTR_CHARBASEINDEX, 0);
        SetBgAttribute(2, BG_ATTR_CHARBASEINDEX, 0);
        SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(28) | BGCNT_TXT256x512);
        SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(30) | BGCNT_TXT512x256);
      }
      break;
    case 4:
      BattleIntroSlideEnd(taskId);
      break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BattleIntroSlide2 (battle_intro.c:239-349) — SAND/UNDERWATER/WATER
// ═══════════════════════════════════════════════════════════════════════════
function BattleIntroSlide2(taskId: number): void {
  const data = tData(taskId);
  let i: number;

  switch (data[1] /* tEnvironment */) {
    case BATTLE_ENVIRONMENT_SAND:
    case BATTLE_ENVIRONMENT_WATER:
      G.gBattle_BG1_X = (G.gBattle_BG1_X + 8) & 0xFFFF;
      break;
    case BATTLE_ENVIRONMENT_UNDERWATER:
      G.gBattle_BG1_X = (G.gBattle_BG1_X + 6) & 0xFFFF;
      break;
  }

  if (data[1] === BATTLE_ENVIRONMENT_WATER) {
    G.gBattle_BG1_Y = ((Cos2(data[6]) / 512 - 8) | 0) & 0xFFFF;
    data[6] += (data[6] < 180) ? 4 : 6;
    if (data[6] === 360) data[6] = 0;
  }

  switch (data[0] /* tState */) {
    case 0:
      data[4] = 16;
      data[2] = (gBattleTypeFlags() & BATTLE_TYPE_LINK) ? 16 : 1;
      data[0]++;
      break;
    case 1:
      if (--data[2] === 0) {
        data[0]++;
        SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
      }
      break;
    case 2:
      G.gBattle_WIN0V = (G.gBattle_WIN0V - 0xFF) & 0xFFFF;
      if ((G.gBattle_WIN0V & 0xFF00) === 0x3000) {
        data[0]++;
        data[2] = DISPLAY_WIDTH;
        data[3] = 32;
        data[5] = 1;
        setIntroSlideFlagsClearBit0();
      }
      break;
    case 3:
      if (data[3]) {
        if (--data[3] === 0) {
          SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ);
          SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(15, 0));
          SetGpuReg(REG_OFFSET_BLDY, 0);
        }
      } else if ((data[4] & 0x1F) && --data[5] === 0) {
        data[4] = (data[4] + 0xFF) & 0xFFFF;
        data[5] = 4;
      }
      if (G.gBattle_WIN0V & 0xFF00) G.gBattle_WIN0V = (G.gBattle_WIN0V - 0x3FC) & 0xFFFF;
      if (data[2]) data[2] -= 2;
      for (i = 0; i < DISPLAY_HEIGHT / 2; i++) gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = data[2] & 0xFFFF;
      for (; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = (-data[2]) & 0xFFFF;
      if (data[2] === 0) {
        gScanlineEffect.state = 3;
        data[0]++;
        CpuFill32_BgScreen(28, BG_SCREEN_SIZE);
        SetBgAttribute(1, BG_ATTR_CHARBASEINDEX, 0);
        SetBgAttribute(2, BG_ATTR_CHARBASEINDEX, 0);
        SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(28) | BGCNT_TXT256x512);
        SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(30) | BGCNT_TXT512x256);
      }
      break;
    case 4:
      BattleIntroSlideEnd(taskId);
      break;
  }

  if (data[0] !== 4) SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(data[4], 0));
}

// ═══════════════════════════════════════════════════════════════════════════
// BattleIntroSlide3 (battle_intro.c:351-437) — BUILDING/PLAIN/FRONTIER
// ═══════════════════════════════════════════════════════════════════════════
function BattleIntroSlide3(taskId: number): void {
  const data = tData(taskId);
  let i: number;

  G.gBattle_BG1_X = (G.gBattle_BG1_X + 8) & 0xFFFF;
  switch (data[0] /* tState */) {
    case 0:
      SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ);
      SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(8, 8));
      SetGpuReg(REG_OFFSET_BLDY, 0);
      data[4] = BLDALPHA_BLEND(8, 8);
      data[2] = (gBattleTypeFlags() & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) ? 16 : 1;
      data[0]++;
      break;
    case 1:
      if (--data[2] === 0) {
        data[0]++;
        SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
      }
      break;
    case 2:
      G.gBattle_WIN0V = (G.gBattle_WIN0V - 0xFF) & 0xFFFF;
      if ((G.gBattle_WIN0V & 0xFF00) === 0x3000) {
        data[0]++;
        data[2] = DISPLAY_WIDTH;
        data[3] = 32;
        data[5] = 1;
        setIntroSlideFlagsClearBit0();
      }
      break;
    case 3:
      if (data[3]) {
        data[3]--;
      } else if ((data[4] & 0xF) && --data[5] === 0) {
        data[4] = (data[4] + 0xFF) & 0xFFFF;
        data[5] = 6;
      }
      if (G.gBattle_WIN0V & 0xFF00) G.gBattle_WIN0V = (G.gBattle_WIN0V - 0x3FC) & 0xFFFF;
      if (data[2]) data[2] -= 2;
      for (i = 0; i < DISPLAY_HEIGHT / 2; i++) gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = data[2] & 0xFFFF;
      for (; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = (-data[2]) & 0xFFFF;
      if (data[2] === 0) {
        gScanlineEffect.state = 3;
        data[0]++;
        CpuFill32_BgScreen(28, BG_SCREEN_SIZE);
        SetBgAttribute(1, BG_ATTR_CHARBASEINDEX, 0);
        SetBgAttribute(2, BG_ATTR_CHARBASEINDEX, 0);
        SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(28) | BGCNT_TXT256x512);
        SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(30) | BGCNT_TXT512x256);
      }
      break;
    case 4:
      BattleIntroSlideEnd(taskId);
      break;
  }

  if (data[0] !== 4) SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(data[4], 0));
}

// ═══════════════════════════════════════════════════════════════════════════
// BattleIntroSlideLink (battle_intro.c:439-515) — combats LINK (non exercé en wild)
// ═══════════════════════════════════════════════════════════════════════════
function BattleIntroSlideLink(taskId: number): void {
  const r = rt();
  const data = tData(taskId);
  let i: number;

  if (data[0] > 1 && !data[4]) {
    const var0 = G.gBattle_BG1_X & 0x8000;
    if (var0 || G.gBattle_BG1_X < 80) {
      G.gBattle_BG1_X = (G.gBattle_BG1_X + 3) & 0xFFFF;
      G.gBattle_BG2_X = (G.gBattle_BG2_X - 3) & 0xFFFF;
    } else {
      CpuFill32_BgScreen(28, BG_SCREEN_SIZE);
      CpuFill32_BgScreen(30, BG_SCREEN_SIZE);
      data[4] = 1;
    }
  }

  switch (data[0] /* tState */) {
    case 0:
      data[2] = 32;
      data[0]++;
      break;
    case 1:
      if (--data[2] === 0) {
        data[0]++;
        const bs = r.gBattleStruct;
        if (bs && r.gSprites) {
          r.gSprites[bs.linkBattleVsSpriteId_V].oam.objMode = ST_OAM_OBJ_WINDOW;
          r.gSprites[bs.linkBattleVsSpriteId_V].callback = G.SpriteCB_VsLetterInit;
          r.gSprites[bs.linkBattleVsSpriteId_S].oam.objMode = ST_OAM_OBJ_WINDOW;
          r.gSprites[bs.linkBattleVsSpriteId_S].callback = G.SpriteCB_VsLetterInit;
        }
        SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
        SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR | WINOUT_WIN01_BG1 | WINOUT_WIN01_BG2);
      }
      break;
    case 2:
      G.gBattle_WIN0V = (G.gBattle_WIN0V - 0xFF) & 0xFFFF;
      if ((G.gBattle_WIN0V & 0xFF00) === 0x3000) {
        data[0]++;
        data[2] = DISPLAY_WIDTH;
        data[3] = 32;
        setIntroSlideFlagsClearBit0();
      }
      break;
    case 3:
      if (G.gBattle_WIN0V & 0xFF00) G.gBattle_WIN0V = (G.gBattle_WIN0V - 0x3FC) & 0xFFFF;
      if (data[2]) data[2] -= 2;
      for (i = 0; i < DISPLAY_HEIGHT / 2; i++) gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = data[2] & 0xFFFF;
      for (; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = (-data[2]) & 0xFFFF;
      if (data[2] === 0) {
        gScanlineEffect.state = 3;
        data[0]++;
        SetBgAttribute(1, BG_ATTR_CHARBASEINDEX, 0);
        SetBgAttribute(2, BG_ATTR_CHARBASEINDEX, 0);
        SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(28) | BGCNT_TXT256x512);
        SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(30) | BGCNT_TXT512x256);
      }
      break;
    case 4:
      BattleIntroSlideEnd(taskId);
      break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BattleIntroSlidePartner (battle_intro.c:517-585) — partner (non exercé en wild)
// ═══════════════════════════════════════════════════════════════════════════
function BattleIntroSlidePartner(taskId: number): void {
  const data = tData(taskId);
  switch (data[0] /* tState */) {
    case 0:
      data[2] = 1;
      data[0]++;
      break;
    case 1:
      if (--data[2] === 0) {
        data[0]++;
        SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(2) | BGCNT_CHARBASE(2) | BGCNT_16COLOR | BGCNT_SCREENBASE(28) | BGCNT_TXT512x256);
        SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(2) | BGCNT_CHARBASE(2) | BGCNT_16COLOR | BGCNT_SCREENBASE(30) | BGCNT_TXT512x256);
        SetGpuReg(REG_OFFSET_DISPCNT, GetGpuReg(REG_OFFSET_DISPCNT) | DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON | DISPCNT_WIN0_ON | DISPCNT_WIN1_ON | DISPCNT_OBJWIN_ON);
        SetGpuReg(REG_OFFSET_WININ, WININ_WIN1_BG1 | WININ_WIN1_BG2 | WININ_WIN1_BG3 | WININ_WIN1_OBJ | WININ_WIN1_CLR);
        SetGpuReg(REG_OFFSET_WINOUT, WINOUT_ALL);
        G.gBattle_BG0_Y = (-48) & 0xFFFF;
        G.gBattle_BG1_X = DISPLAY_WIDTH;
        G.gBattle_BG2_X = (-DISPLAY_WIDTH) & 0xFFFF;
      }
      break;
    case 2:
      G.gBattle_WIN0V = (G.gBattle_WIN0V + 0x100) & 0xFFFF;
      if ((G.gBattle_WIN0V & 0xFF00) !== 0x100) G.gBattle_WIN0V = (G.gBattle_WIN0V - 1) & 0xFFFF;
      if ((G.gBattle_WIN0V & 0xFF00) === 0x2000) {
        data[0]++;
        data[2] = DISPLAY_WIDTH;
        setIntroSlideFlagsClearBit0();
      }
      break;
    case 3:
      if ((G.gBattle_WIN0V & 0xFF00) !== 0x4C00) G.gBattle_WIN0V = (G.gBattle_WIN0V + 0x3FC) & 0xFFFF;
      if (data[2]) data[2] -= 2;
      G.gBattle_BG1_X = data[2];
      G.gBattle_BG2_X = (-data[2]) & 0xFFFF;
      if (data[2] === 0) data[0]++;
      break;
    case 4:
      G.gBattle_BG0_Y = (G.gBattle_BG0_Y + 2) & 0xFFFF;
      G.gBattle_BG2_Y = (G.gBattle_BG2_Y + 2) & 0xFFFF;
      if ((G.gBattle_WIN0V & 0xFF00) !== 0x5000) G.gBattle_WIN0V = (G.gBattle_WIN0V + 0xFF) & 0xFFFF;
      if (!(G.gBattle_BG0_Y & 0xFFFF)) {
        CpuFill32_BgScreen(28, BG_SCREEN_SIZE * 4);
        SetGpuReg(REG_OFFSET_DISPCNT, GetGpuReg(REG_OFFSET_DISPCNT) & ~DISPCNT_WIN1_ON);
        SetBgAttribute(1, BG_ATTR_CHARBASEINDEX, 0);
        SetBgAttribute(2, BG_ATTR_CHARBASEINDEX, 0);
        SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(28) | BGCNT_TXT256x512);
        SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(0) | BGCNT_CHARBASE(0) | BGCNT_16COLOR | BGCNT_SCREENBASE(30) | BGCNT_TXT512x256);
        gScanlineEffect.state = 3;
        data[0]++;
      }
      break;
    case 5:
      BattleIntroSlideEnd(taskId);
      break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DrawBattlerOnBg (battle_intro.c:587-603) — dessine un battler sur un BG.
// Deps lourdes (gMonSpritesGfxPtr, LoadBgTiles/Tilemap) via rt ; chemin VS/link.
// ═══════════════════════════════════════════════════════════════════════════
export function DrawBattlerOnBg(
  bgId: number, x: number, y: number, battlerPosition: number, paletteId: number,
  tiles: Uint8Array, tilemap: Uint16Array, tilesOffset: number,
): void {
  const r = rt();
  const battler = r.GetBattlerAtPosition(battlerPosition);
  let offset = tilesOffset;
  const gfx = r.gMonSpritesGfxPtr;
  if (gfx?.sprites?.ptr?.[battlerPosition] && r.CpuCopy16) {
    r.CpuCopy16(gfx.sprites.ptr[battlerPosition].subarray(BG_SCREEN_SIZE * (r.gBattleMonForms?.[battler] ?? 0)), tiles, BG_SCREEN_SIZE);
  }
  r.LoadBgTiles?.(bgId, tiles, 0x1000, tilesOffset);
  for (let i = y; i < y + 8; i++) {
    for (let j = x; j < x + 8; j++) {
      tilemap[i * 32 + j] = (offset | (paletteId << 12)) & 0xFFFF;
      offset++;
    }
  }
  // 1:1 décomp bg.c:404 (LoadBgTilemap) — appel DIRECT (ex-`r.LoadBgTilemap?.()` = no-op
  // silencieux : la fn n'existe pas sur le runtime instance, cf. decomp-globals.ts).
  LoadBgTilemap(bgId, tilemap, BG_SCREEN_SIZE, 0);
}
