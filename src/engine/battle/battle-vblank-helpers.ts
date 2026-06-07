/**
 * battle/battle-vblank-helpers.ts — Port 1:1 strict des helpers VBlank + BG
 * battle.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *
 * Fonctions portées 1:1 :
 *   - VBlankCB_Battle (2084-2106) — VBlank callback principal battle
 *   - GetBattleBgTemplateData (2385-2415) — accès gBattleBgTemplates field
 *   - SpriteCB_VsLetterDummy (2108-2111) — empty cb
 *   - SpriteCB_VsLetter (2113-2129) — letter slide-in anim
 *   - SpriteCB_VsLetterInit (2131-2136) — entry init
 *   - HBlankCB_Battle (2078-2082) — unused HBlank cb
 *   - BufferPartyVsScreenHealth_AtStart (742-751) — VS screen healthy flag
 *   - BufferPartyVsScreenHealth_AtEnd (2138-2175) — VS screen end task
 *
 * Mécanique VBlankCB_Battle :
 *   - Random() per frame (= si pas link/frontier/recorded)
 *   - Sync 8 BG scroll regs (BG0/1/2/3 H/V)
 *   - Sync 4 WIN regs (WIN0/1 H/V)
 *   - LoadOam + ProcessSpriteCopyRequests + TransferPlttBuffer
 *   - ScanlineEffect_InitHBlankDmaTransfer
 *
 * Note : notre runtime web n'a pas de VBlank physique. La sync regs est faite
 * dans le tick loop game directement. Ce module expose les helpers pour
 * portabilité, mais le wire VBlank actuel se fait via gba-runtime.
 */

import { getRuntime } from '../system/decomp-globals';
import { Random } from '../system/random';
// Namespace ESM (remplace require('../save/save-block-state') CommonJS, dormant).
import * as _saveBlockNs from '../save/save-block-state';
import { gBattleTypeFlags } from './state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_FRONTIER, BATTLE_TYPE_RECORDED,
} from './constants';

// ─── BG scroll state 1:1 décomp (= gBattle_BG0/1/2/3_X/Y) ───────────────────

/** 1:1 décomp `gBattle_BG0_X/Y` + `gBattle_BG1_X/Y` + `gBattle_BG2_X/Y` +
 *  `gBattle_BG3_X/Y` + `gBattle_WIN0H/V` + `gBattle_WIN1H/V`. */
export const battleVBlankState = {
  bg0_x: 0, bg0_y: 0,
  bg1_x: 0, bg1_y: 0,
  bg2_x: 0, bg2_y: 0,
  bg3_x: 0, bg3_y: 0,
  win0h: 0, win0v: 0,
  win1h: 0, win1v: 0,
};

// ─── REG_OFFSET_* constants 1:1 décomp (= io_reg.h) ─────────────────────────

const REG_OFFSET_BG0HOFS = 0x10;
const REG_OFFSET_BG0VOFS = 0x12;
const REG_OFFSET_BG1HOFS = 0x14;
const REG_OFFSET_BG1VOFS = 0x16;
const REG_OFFSET_BG2HOFS = 0x18;
const REG_OFFSET_BG2VOFS = 0x1A;
const REG_OFFSET_BG3HOFS = 0x1C;
const REG_OFFSET_BG3VOFS = 0x1E;
const REG_OFFSET_WIN0H = 0x40;
const REG_OFFSET_WIN0V = 0x44;
const REG_OFFSET_WIN1H = 0x42;
const REG_OFFSET_WIN1V = 0x46;
const REG_OFFSET_BG0CNT = 0x08;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `LoadOam()`. Copy OAM RAM buffer vers OBJ attributes register. */
function LoadOam(): void {
  // Dette R3 : notre runtime fait LoadOam implicitement dans le sync loop.
}

/** 1:1 décomp `ProcessSpriteCopyRequests()`. */
function ProcessSpriteCopyRequests(): void {
  // Dette R3 : notre runtime process sprite copies implicitement.
}

/** 1:1 décomp `TransferPlttBuffer()`. */
function TransferPlttBuffer(): void {
  // Dette R3 : notre runtime transfer palette buffer chaque frame.
}

/** 1:1 décomp `ScanlineEffect_InitHBlankDmaTransfer()`. */
function ScanlineEffect_InitHBlankDmaTransfer(): void {
  // Dette R3 : scanline effect HBlank DMA setup.
}

// ─── VBlankCB_Battle (battle_main.c:2084) ─────────────────────────────────

/** 1:1 décomp `VBlankCB_Battle()` (battle_main.c:2084-2106).
 *  VBlank callback du battle : sync BG scroll regs + WIN regs + OAM +
 *  palette + scanline effect. */
export function VBlankCB_Battle(): void {
  const rt = getRuntime();
  if (!rt) return;

  // 1:1 décomp ll. 2087-2088 : RNG seed change per VBlank.
  if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_FRONTIER | BATTLE_TYPE_RECORDED))) {
    Random();
  }

  // 1:1 décomp ll. 2090-2097 : sync 8 BG scroll regs.
  rt.SetGpuReg(REG_OFFSET_BG0HOFS, battleVBlankState.bg0_x);
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, battleVBlankState.bg0_y);
  rt.SetGpuReg(REG_OFFSET_BG1HOFS, battleVBlankState.bg1_x);
  rt.SetGpuReg(REG_OFFSET_BG1VOFS, battleVBlankState.bg1_y);
  rt.SetGpuReg(REG_OFFSET_BG2HOFS, battleVBlankState.bg2_x);
  rt.SetGpuReg(REG_OFFSET_BG2VOFS, battleVBlankState.bg2_y);
  rt.SetGpuReg(REG_OFFSET_BG3HOFS, battleVBlankState.bg3_x);
  rt.SetGpuReg(REG_OFFSET_BG3VOFS, battleVBlankState.bg3_y);

  // 1:1 décomp ll. 2098-2101 : sync 4 WIN regs.
  rt.SetGpuReg(REG_OFFSET_WIN0H, battleVBlankState.win0h);
  rt.SetGpuReg(REG_OFFSET_WIN0V, battleVBlankState.win0v);
  rt.SetGpuReg(REG_OFFSET_WIN1H, battleVBlankState.win1h);
  rt.SetGpuReg(REG_OFFSET_WIN1V, battleVBlankState.win1v);

  // 1:1 décomp ll. 2102-2105.
  LoadOam();
  ProcessSpriteCopyRequests();
  TransferPlttBuffer();
  ScanlineEffect_InitHBlankDmaTransfer();
}

// ─── HBlankCB_Battle (battle_main.c:2078) — UNUSED ─────────────────────────

/** 1:1 décomp `HBlankCB_Battle()` (battle_main.c:2078-2082). UNUSED. */
export function HBlankCB_Battle(): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp : check REG_VCOUNT range 111..DISPLAY_HEIGHT(160).
  // Dette R3 : REG_VCOUNT access via runtime.
  const VCOUNT = 0;  // placeholder
  if (VCOUNT < 160 && VCOUNT >= 111) {
    // BGCNT_SCREENBASE(24) | BGCNT_TXT256x512.
    rt.SetGpuReg(REG_OFFSET_BG0CNT, (24 << 8) | 0x4000);
  }
}

// ─── GetBattleBgTemplateData (battle_main.c:2385) ──────────────────────────

/** 1:1 décomp `gBattleBgTemplates[4]` (battle_bg.c). 4 entries pour BG0/1/2/3. */
interface BgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

const gBattleBgTemplates: BgTemplate[] = [
  // 1:1 décomp battle_bg.c sStandardBattleBgTemplates[]. Stub minimal.
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 24, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 26, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];

/** 1:1 décomp `GetBattleBgTemplateData(arrayId, caseId)` (battle_main.c:2385-2416).
 *  Accès field-by-field aux gBattleBgTemplates[arrayId]. */
export function GetBattleBgTemplateData(arrayId: number, caseId: number): number {
  const tpl = gBattleBgTemplates[arrayId];
  if (!tpl) return 0;
  switch (caseId) {
    case 0: return tpl.bg;
    case 1: return tpl.charBaseIndex;
    case 2: return tpl.mapBaseIndex;
    case 3: return tpl.screenSize;
    case 4: return tpl.paletteMode;
    case 5: return tpl.priority;  // Only this case is used
    case 6: return tpl.baseTile;
  }
  return 0;
}

// ─── SpriteCB_VsLetter* (battle_main.c:2108-2136) ──────────────────────────

interface VsLetterSprite {
  x: number;
  data: number[];
  affineAnimEnded?: boolean;
  callback?: ((sprite: VsLetterSprite) => void) | null;
}

/** 1:1 décomp `SpriteCB_VsLetterDummy(sprite)` (2108-2111). Empty cb. */
export function SpriteCB_VsLetterDummy(_sprite: VsLetterSprite): void {
  // Empty function 1:1.
}

/** 1:1 décomp `SpriteCB_VsLetter(sprite)` (2113-2129). Letter slide-in anim. */
export function SpriteCB_VsLetter(sprite: VsLetterSprite): void {
  if (sprite.data[0] !== 0) {
    sprite.x = sprite.data[1] + ((sprite.data[2] & 0xFF00) >> 8);
  } else {
    sprite.x = sprite.data[1] - ((sprite.data[2] & 0xFF00) >> 8);
  }
  sprite.data[2] += 0x180;

  if (sprite.affineAnimEnded) {
    // Dette R3 : FreeSpriteTilesByTag + FreeSpritePaletteByTag +
    // FreeSpriteOamMatrix + DestroySprite cascade.
    sprite.callback = null;
  }
}

/** 1:1 décomp `SpriteCB_VsLetterInit(sprite)` (2131-2136). */
export function SpriteCB_VsLetterInit(sprite: VsLetterSprite): void {
  // 1:1 décomp : StartSpriteAffineAnim(sprite, 1) + PlaySE(SE_MUGSHOT).
  sprite.callback = (s) => SpriteCB_VsLetter(s);
  // Dette R3 : StartSpriteAffineAnim + PlaySE(SE_MUGSHOT = 89).
}

// ─── BufferPartyVsScreenHealth (742 + 2138) ────────────────────────────────

/** 1:1 décomp `BUFFER_PARTY_VS_SCREEN_STATUS(party, flags, i)` macro.
 *  Pour chaque mon dans party, set bit 2*i si healthy (= species != NONE/EGG
 *  ET hp != 0 ET status == 0). */
function _bufferPartyVsScreenStatus(party: Array<{ species?: number; hp?: number; status?: number; isEgg?: boolean }>): number {
  let flags = 0;
  for (let i = 0; i < party.length; i++) {
    const mon = party[i];
    if (!mon) continue;
    const species = mon.species ?? 0;
    const hp = mon.hp ?? 0;
    const status = mon.status ?? 0;

    if (species === 0) continue;
    // Healthy mon : species != EGG && hp != 0 && status == 0.
    const isEgg = mon.isEgg ?? false;
    if (!isEgg && hp !== 0 && status === 0) {
      flags |= 1 << (i * 2);
    }
  }
  return flags;
}

/** 1:1 décomp `BufferPartyVsScreenHealth_AtStart()` (battle_main.c:742-751). */
export function BufferPartyVsScreenHealth_AtStart(): void {
  const stateMod = _saveBlockNs as unknown as {
    gSaveBlock1Ptr: { playerParty: unknown[] };
  };
  const playerParty = (stateMod.gSaveBlock1Ptr.playerParty ?? []) as never[];
  const flags = _bufferPartyVsScreenStatus(playerParty);

  // 1:1 décomp ll. 748-750 : write dans gBattleStruct.multiBuffer.linkBattlerHeader.
  // Dette R3 : multiBuffer.linkBattlerHeader tracker (= link battle setup).
  void flags;
}

/** 1:1 décomp `BufferPartyVsScreenHealth_AtEnd(taskId)` (battle_main.c:2138-2175). */
export function BufferPartyVsScreenHealth_AtEnd(taskId: number): void {
  // 1:1 décomp : task.data[3] + task.data[4] = flags player vs enemy.
  void taskId;
  // Dette R3 : multi battle player ID mapping via gLinkPlayers.
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleVBlankHelpers = {
  VBlankCB_Battle, HBlankCB_Battle, GetBattleBgTemplateData,
  SpriteCB_VsLetterDummy, SpriteCB_VsLetter, SpriteCB_VsLetterInit,
  BufferPartyVsScreenHealth_AtStart, BufferPartyVsScreenHealth_AtEnd,
  battleVBlankState,
};

// ─── Globals battle_main gBattle_BG*/WIN* = accesseurs live sur battleVBlankState ──
// Unifie la convention décomp (`gBattle_BG1_X += 6`, écrit par src/game/battle_intro.ts
// + les auto-callbacks battle_anim) avec la source appliquée par VBlankCB_Battle, SANS
// réécrire VBlankCB. (Port miroir battle_intro — étape câblage 2026-06-07.)
(() => {
  const g = globalThis as Record<string, unknown>;
  type VKey = keyof typeof battleVBlankState;
  const def = (name: string, key: VKey): void => {
    // Toujours (re)définir : au HMR, `battleVBlankState` est une NOUVELLE instance ;
    // un accesseur capturant l'ancienne serait périmé (= écrit dans le vide).
    // configurable:true → redéfinissable à chaque (re)chargement du module.
    Object.defineProperty(g, name, {
      configurable: true,
      get: () => battleVBlankState[key],
      set: (v: number) => { battleVBlankState[key] = v & 0xFFFF; },
    });
  };
  def('gBattle_BG0_X', 'bg0_x'); def('gBattle_BG0_Y', 'bg0_y');
  def('gBattle_BG1_X', 'bg1_x'); def('gBattle_BG1_Y', 'bg1_y');
  def('gBattle_BG2_X', 'bg2_x'); def('gBattle_BG2_Y', 'bg2_y');
  def('gBattle_BG3_X', 'bg3_x'); def('gBattle_BG3_Y', 'bg3_y');
  def('gBattle_WIN0H', 'win0h'); def('gBattle_WIN0V', 'win0v');
  def('gBattle_WIN1H', 'win1h'); def('gBattle_WIN1V', 'win1v');
  // gIntroSlideFlags ↔ __battleMainFunctions (= source du flag lue par le send-out
  // SpriteCB). battle_intro.ts le clear (&= ~1) ; PlayerHandleIntroSlide le set (|= 1).
  {
    const bmf = (): { getIntroSlideFlags?: () => number; setIntroSlideFlags?: (v: number) => void } | undefined =>
      (globalThis as Record<string, unknown>).__battleMainFunctions as never;
    Object.defineProperty(g, 'gIntroSlideFlags', {
      configurable: true,
      get: () => bmf()?.getIntroSlideFlags?.() ?? 0,
      set: (v: number) => { bmf()?.setIntroSlideFlags?.(v & 0xFFFF); },
    });
  }
})();
