/**
 * game/battle_main.ts — MIROIR 1:1 de `battle_main.c`
 * (D:/Projet 1/decomps/pokeemeraude/src/battle_main.c, ~5270 l.).
 *
 * MIROIR-INDEX (certification de couverture 2026-06-10) : battle_main.c est le
 * HUB du combat — chez nous il est physiquement réparti en sous-systèmes engine
 * (découpage historique du port, consolidation physique différée, pattern
 * battle_interface C1-C4). CE fichier : (a) PORTE les fonctions cœur listées
 * ci-dessous, (b) RE-EXPORTE nominalement celles qui vivent dans les
 * sous-systèmes → CHAQUE fonction du .c est accessible depuis ce miroir
 * (= include battle_main.h), au nom près.
 *
 * PORTÉES ICI : gBattle_BG0-3 + WIN0/1 (:124-135, battleVBlankState) ·
 *   VBlankCB_Battle (:2084) · HBlankCB_Battle (:2078) · GetBattleBgTemplateData
 *   (:2385) · SpriteCB_VsLetter* (:2108-2136) · BufferPartyVsScreenHealth_At*
 *   (:742/:2138) · BattleMainCB1 (:~3890) · BattleMainCB2 (:2177) ·
 *   FreeRestoreBattleData (:2195) · CB2_QuitRecordedBattle (:2208) ·
 *   SpriteCB_UnusedBattleInit(_Main) (:2218) · CB2_InitBattle (:589) ·
 *   CB2_InitBattleInternal (:617).
 * RE-EXPORTS (vivent dans le sous-système indiqué — voir section en fin de
 *   fichier) : la machine gBattleMainFunc (battle-main-functions) · la sélection
 *   d'action (battle-action-selection) · l'ordre/dispatch de tour
 *   (battle-turn-helpers/-dispatch) · les SpriteCB_* (battle-sprite-callbacks +
 *   battle-faint-anim) · CB2_HandleStartBattle (battle-link-start) ·
 *   CreateNPCTrainerParty (battle-trainer-party) · SwitchInClearSetData
 *   (battle-switch) · FaintClearSetData/TurnValuesCleanUp (util).
 * NON ATTEIGNABLES (link/multi/recorded — pas de re-export, gates 1:1) :
 *   CB2_PreInitMultiBattle · CB2_PreInitIngamePlayerPartnerBattle ·
 *   CB2_HandleStartMultiPartnerBattle · CB2_HandleStartMultiBattle ·
 *   SetMultiPartnerMenuParty · FindLinkBattleMaster · CB2_InitEndLinkBattle ·
 *   CB2_EndLinkBattle · EndLinkBattleInSteps · CB2_InitAskRecordBattle ·
 *   CB2_AskRecordBattle · AskRecordBattle · TryCorrectShedinjaLanguage (link
 *   trade) · SetAllPlayersBerryData/SetPlayerBerryDataInBattleStruct (battle-
 *   link-start, link) · BeginBattleIntroDummy (UNUSED décomp).
 *
 * Adaptation HW-emu :
 *   - Les globals u16 EWRAM `gBattle_BG*_X/Y` + `gBattle_WIN*` de la décomp sont
 *     modélisés par l'objet `battleVBlankState` (source unique) + des accesseurs
 *     `globalThis.gBattle_BG*` (get/set → battleVBlankState) : la convention décomp
 *     `gBattle_BG1_X += 6` (battle_intro.ts, auto-callbacks battle_anim) écrit ainsi
 *     la MÊME source que celle appliquée au GPU par VBlankCB_Battle.
 *   - LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer/ScanlineEffect_InitHBlankDmaTransfer
 *     = dette R3 (le runtime web les fait implicitement / via __scanlineEffectTick).
 */

import './pokemon_animation';
import {
  ResetPaletteFade as ResetPaletteFade_rt,
  getRuntime, BlendPalettes, PALETTES_ALL, setReservedSpritePaletteCount,
  AnimateSprites as _AnimateSprites_rt, BuildOamBuffer as _BuildOamBuffer_rt,
  UpdatePaletteFade as _UpdatePaletteFade_rt, RunTasks as _RunTasks_rt,
} from '../harness/runtime/decomp-globals';
import { Random } from './random';
import { MAX_SPRITES } from '../harness/runtime/decomp-runtime';
// Namespace ESM (remplace require('../save/save-block-state') CommonJS, dormant).
import * as _saveBlockNs from './engine/save/save-block-state';
import {
  gActiveBattler, gBattleTypeFlags, gBattlersCount, gBattleCommunication,
  gTrainerBattleOpponent_A, gTrainerBattleOpponent_B,
  setBattleOutcome, setActiveBattler, getBattlerControllerFunc, setBattleEnvironment,
} from './engine/battle/state';
// Namespace ESM (remplace require('./state') CommonJS, dormant → throw en navigateur).
import * as _stateNs from './engine/battle/state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_FRONTIER, BATTLE_TYPE_RECORDED,
  BATTLE_TYPE_MULTI, BATTLE_TYPE_TWO_OPPONENTS,
} from './engine/battle/constants';
import { RunTextPrinters as _RunTextPrinters_rt } from './text';
import { tickBattlerMonReveals } from './battle_controller_opponent';
import { FreeAllSpritePalettes, ResetSpriteData as _ResetSpriteDataImpl, DestroySprite as _DestroySpriteImpl, setSpriteAnims } from './sprite';
import {
  gScanlineEffectRegBuffers, ScanlineEffect_Clear, ScanlineEffect_SetParams,
  SCANLINE_EFFECT_DMACNT_16BIT,
} from './scanline_effect';
import {
  BattleInitBgsAndWindows, loadBattleTextboxAndBackground1to1, drawBattleEntryBackground,
} from './battle_bg';

// ─── BG/WIN scroll state 1:1 décomp (battle_main.c:124-135) ─────────────────

/** 1:1 décomp `gBattle_BG0_X/Y` … `gBattle_BG3_X/Y` + `gBattle_WIN0H/V` +
 *  `gBattle_WIN1H/V` (EWRAM_DATA u16). Source unique appliquée par VBlankCB_Battle. */
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
  // Dette R3 : le vrai (game/scanline_effect.ts) est tické séparément par le
  // runtime via globalThis.__scanlineEffectTick chaque VBlank. Stub ici pour
  // éviter un double appel (= comportement 1:1 conservé).
}

// ─── VBlankCB_Battle (battle_main.c:2084-2106) ─────────────────────────────

/** 1:1 décomp `VBlankCB_Battle()` (battle_main.c:2084-2106).
 *  VBlank callback du battle : RNG + sync BG scroll regs + WIN regs + OAM +
 *  palette + scanline effect. */
export function VBlankCB_Battle(): void {
  const rt = getRuntime();
  if (!rt) return;

  // 1:1 décomp ll. 2087-2088 : RNG seed change per VBlank (sauf link/frontier/recorded).
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

// ─── HBlankCB_Battle (battle_main.c:2078-2082) — UNUSED ────────────────────

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

// ─── GetBattleBgTemplateData (battle_main.c:2385-2416) ─────────────────────

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

// ─── BufferPartyVsScreenHealth (battle_main.c:742 + 2138) ──────────────────

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

// ─── Globals battle_main gBattle_BG*/WIN* = accesseurs live sur battleVBlankState ──
// Unifie la convention décomp (`gBattle_BG1_X += 6`, écrit par game/battle_intro.ts
// + les auto-callbacks battle_anim) avec la source appliquée par VBlankCB_Battle, SANS
// réécrire VBlankCB. (Port miroir battle_intro/battle_main — 2026-06-07.)
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

// ════════════════════════════════════════════════════════════════════════════
// Tranche 2 — BattleMainCB1/CB2 + cleanup (battle_main.c) [ex-battle-cb2.ts]
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `B_BUTTON` (io_reg.h) = 1 << 1. */
const B_BUTTON = 1 << 1;
/** 1:1 décomp `BeginNormalPaletteFade(palettes, delay, startY, endY, color)`. */
function _BeginNormalPaletteFade(palettes: number, delay: number, startY: number, endY: number, color: number): void {
  const rt = getRuntime();
  rt?.BeginNormalPaletteFade?.(
    palettes as unknown as string, delay, startY, endY, color as unknown as string,
  );
}

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `gBattleMainFunc` getter via K8. */
function _getBattleMainFunc(): (() => void) | null {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    getBattleMainFunc?: () => (() => void) | null;
  } | undefined;
  return m?.getBattleMainFunc?.() ?? null;
}

/** 1:1 décomp `gBattlerControllerFuncs[gActiveBattler]()` (battle_main.c:3031).
 *  Appel NON gaté : la func installée (SetControllerTo* / XxxBufferRunCommand /
 *  poller CompleteOnXxx) s'auto-gate sur `gBattleControllerExecFlags`. Gater
 *  ici casserait le 1er tick (SetControllerToPlayer doit tourner alors qu'aucun
 *  flag n'est set). Table partagée = state.ts. */
function _runBattlerController(battler: number): void {
  const fn = getBattlerControllerFunc(battler);
  if (fn) fn();
}

/** 1:1 décomp `AnimateSprites()` (sprite.c). Wire vers decomp-globals existing. */
function _AnimateSprites(): void {
  _AnimateSprites_rt();
}

/** 1:1 décomp `BuildOamBuffer()`. Wire vers decomp-globals existing. */
function _BuildOamBuffer(): void {
  _BuildOamBuffer_rt();
}

/** 1:1 décomp `RunTextPrinters()`. Wire vers ui/gba-text-system existing. */
function _RunTextPrinters(): void {
  _RunTextPrinters_rt();
}

/** 1:1 décomp `UpdatePaletteFade()`. Wire vers decomp-globals existing. */
function _UpdatePaletteFade(): void {
  _UpdatePaletteFade_rt();
}

/** 1:1 décomp `RunTasks()`. Wire vers decomp-globals existing. */
function _RunTasks(): void {
  _RunTasks_rt();
}

/** 1:1 décomp `JOY_HELD(button)`. */
function _JOY_HELD(button: number): boolean {
  const rt = getRuntime();
  const heldKeys = rt?.gMain?.heldKeys ?? 0;
  return (heldKeys & button) === button;
}

/** 1:1 décomp `RecordedBattle_CanStopPlayback()`. */
function _RecordedBattle_CanStopPlayback(): boolean {
  // Dette R3 : recorded battle system.
  return false;
}

/** 1:1 décomp `ResetPaletteFadeControl()`. */
function _ResetPaletteFadeControl(): void {
  // Dette R3 : palette fade reset.
}

/** 1:1 décomp `m4aMPlayStop(playerInfo)`. Wire vers m4a/player stopSong. */
function _m4aMPlayStop(playerInfo: unknown): void {
  // 1:1 décomp : stop le music player (= BGM ou SE1/SE2 selon ptr passé).
  void playerInfo;
  void import('../harness/m4a/player').then(({ stopSong }) => {
    stopSong('se1' as never);
    stopSong('se2' as never);
  });
}

/** 1:1 décomp `m4aSongNumStop(songId)`. Wire vers m4a/player stopSong. */
function _m4aSongNumStop(_songId: number): void {
  // 1:1 décomp : stop song par songId. SE_LOW_HEALTH = 287.
  void import('../harness/m4a/player').then(({ stopSong }) => {
    stopSong('se1' as never);
    stopSong('se2' as never);
  });
}

/** 1:1 décomp `FreeMonSpritesGfx()`. */
function _FreeMonSpritesGfx(): void {
  // Dette R3 : noop pour notre runtime web.
}

/** 1:1 décomp `FreeBattleSpritesData()`. */
function _FreeBattleSpritesData(): void {
  // Dette R3 : noop.
}

/** 1:1 décomp `FreeBattleResources()`. */
function _FreeBattleResources(): void {
  // Dette R3 : noop.
}

/** 1:1 décomp `FreeAllWindowBuffers()`. */
function _FreeAllWindowBuffers(): void {
  // Dette R3 : window buffer cleanup.
}

/** 1:1 décomp `ZeroEnemyPartyMons()`. */
function _ZeroEnemyPartyMons(): void {
  const stateMod = _stateNs as unknown as { gEnemyParty?: unknown[] };
  if (stateMod.gEnemyParty) {
    for (let i = 0; i < 6; i++) {
      stateMod.gEnemyParty[i] = null;
    }
  }
}

/** 1:1 décomp `SetMainCallback2(cb)` : installe le callback2 sur le runtime
 *  (= gMain.callback2, ticked chaque frame par CallCallbacks). */
function _SetMainCallback2(cb: (() => void) | null): void {
  getRuntime()?.SetMainCallback2?.(cb as never);
}

// ─── BattleMainCB1 (battle_main.c:3026-3032) ───────────────────────────────

/** 1:1 décomp `BattleMainCB1()` (battle_main.c:3026-3032).
 *  CB1 callback : run gBattleMainFunc puis controllers per-battler. */
export function BattleMainCB1(): void {
  const mainFunc = _getBattleMainFunc();
  if (mainFunc) mainFunc();

  for (let i = 0; i < gBattlersCount; i++) {
    setActiveBattler(i);
    _runBattlerController(gActiveBattler);
  }
}

// ─── BattleMainCB2 (battle_main.c:1863-1879) ───────────────────────────────

/** 1:1 décomp `BattleMainCB2()` (battle_main.c:1863-1879).
 *  CB2 callback : anim + OAM + text + palette fade + tasks. */
export function BattleMainCB2(): void {
  _AnimateSprites();
  _BuildOamBuffer();
  _RunTextPrinters();
  _UpdatePaletteFade();
  _RunTasks();
  // Voie L : l'animation d'entrée (BattleIntroSlide1/2/3) tourne comme une TASK via
  // _RunTasks() ci-dessus (1:1 : HandleIntroSlide → CreateTask).
  // ⚠️ DETTE port miroir : les 4 ticks ad-hoc ci-dessous ne sont PAS 1:1 (la décomp
  // fait reveal/send-out via SpriteCB). À RETIRER quand send-out/reveals passeront par
  // les vrais SpriteCB (cause probable de la désync texte/anim). Conservés pour l'instant
  // (comportement constant lors de la migration tranche 2).
  tickBattlerMonReveals();
  // tickIntroSlideIn() + tickTrainerThrow() RETIRES (voie L) : le slide-in dresseur passe par
  // SpriteCB_TrainerSlideIn (PlayerHandleDrawTrainerPic) et le throw/ball par StartAnimLinearTranslation
  // + Task_StartSendOutAnim + DoPokeballSendOutAnimation (PlayerHandleIntroTrainerBallThrow) — 100%
  // controller/SpriteCB/Task 1:1, auto-dispatches par _AnimateSprites/_RunTasks ci-dessus. L'ad-hoc
  // battle-sendout-anim.ts ne subsiste QUE pour la voie V (battle-flow.ts l'importe directement).
  // tickBattlerMonReveals GARDE (reveal anti-sprite-noir des mons, pas lie au slide/throw).

  // 1:1 décomp ll. 1871-1878 : B button during recorded → quit.
  if (_JOY_HELD(B_BUTTON)
      && (gBattleTypeFlags & BATTLE_TYPE_RECORDED)
      && _RecordedBattle_CanStopPlayback()) {
    setBattleOutcome(5 /* B_OUTCOME_PLAYER_TELEPORTED */);
    const stateMod = _stateNs as unknown as { setSpecialVarResult?: (v: number) => void };
    stateMod.setSpecialVarResult?.(5);

    _ResetPaletteFadeControl();
    _BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, 0 /* RGB_BLACK */);
    _SetMainCallback2(CB2_QuitRecordedBattle);
  }
}

// ─── FreeRestoreBattleData (battle_main.c:1881-1891) ───────────────────────

/** 1:1 décomp `FreeRestoreBattleData()` (battle_main.c:1881-1891). */
export function FreeRestoreBattleData(): void {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setMainInBattle?: (v: boolean) => void;
    getPreBattleCallback1?: () => (() => void) | null;
    setMainCallback1?: (cb: (() => void) | null) => void;
  } | undefined;
  m?.setMainCallback1?.(m?.getPreBattleCallback1?.() ?? null);
  m?.setMainInBattle?.(false);
  getRuntime().gMain.inBattle = false;   // symetrie 1:1 (battle_main.c:1885) — sinon true au 2e combat.

  _ZeroEnemyPartyMons();
  _m4aSongNumStop(287 /* SE_LOW_HEALTH */);
  _FreeMonSpritesGfx();
  _FreeBattleSpritesData();
  _FreeBattleResources();
}

// ─── CB2_QuitRecordedBattle (battle_main.c:1893-1904) ──────────────────────

/** 1:1 décomp `CB2_QuitRecordedBattle()` (battle_main.c:1893-1904).
 *  Exit recorded playback : wait palette fade end + cleanup + restore CB2. */
export function CB2_QuitRecordedBattle(): void {
  _UpdatePaletteFade();
  const rt = getRuntime();
  if (!rt?.gPaletteFade?.active) {
    _m4aMPlayStop(null /* gMPlayInfo_SE1 */);
    _m4aMPlayStop(null /* gMPlayInfo_SE2 */);
    FreeRestoreBattleData();
    _FreeAllWindowBuffers();

    const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
      getMainSavedCallback?: () => (() => void) | null;
    } | undefined;
    _SetMainCallback2(m?.getMainSavedCallback?.() ?? null);
  }
}

// ─── SpriteCB_UnusedBattleInit (battle_main.c:1909-1958) ───────────────────

interface UnusedSprite {
  data: number[];
  callback?: ((sprite: UnusedSprite) => void) | null;
}

/** 1:1 décomp `SpriteCB_UnusedBattleInit(sprite)` (1909-1913). UNUSED. */
export function SpriteCB_UnusedBattleInit(sprite: UnusedSprite): void {
  sprite.data[0] = 0;  // sState = 0
  sprite.callback = SpriteCB_UnusedBattleInit_Main;
}

/** 1:1 décomp helper case 1 (= extrait pour bypass fallthrough noFallthrough). */
function _spriteCB_UnusedBattleInit_Main_Case1(sprite: UnusedSprite): void {
  sprite.data[4]--;  // sDelay--
  if (sprite.data[4] === 0) {
    sprite.data[4] = 2;
    const r2 = sprite.data[1] + sprite.data[3] * 32;
    const r0 = sprite.data[2] - sprite.data[3] * 32;
    void r2; void r0;
    sprite.data[3]++;
    if (sprite.data[3] === 21) {
      sprite.data[0]++;
      sprite.data[1] = 32;
    }
  }
}

/** 1:1 décomp `SpriteCB_UnusedBattleInit_Main(sprite)` (1915-1958). UNUSED. */
export function SpriteCB_UnusedBattleInit_Main(sprite: UnusedSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[0]++;
      sprite.data[1] = 0;
      sprite.data[2] = 0x281;
      sprite.data[3] = 0;
      sprite.data[4] = 1;  // sDelay = 1
      _spriteCB_UnusedBattleInit_Main_Case1(sprite);
      break;
    case 1:
      _spriteCB_UnusedBattleInit_Main_Case1(sprite);
      break;
    case 2:
      sprite.data[1]--;
      if (sprite.data[1] === 20) {
        // 1:1 décomp : SetMainCallback2(CB2_InitBattle). Dette R3.
      }
      break;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Tranche 3 — CB2_InitBattle + CB2_InitBattleInternal (battle_main.c) [ex-battle-init.ts]
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `BATTLE_TYPE_INGAME_PARTNER` (battle.h:81) = bit 22.
 *  AUDIT FIX (audit-inline-battle-constants) : était bit 23 → désalignait gBattleTypeFlags
 *  vs le reste du port (combat duo Steven Mossdeep). */
const BATTLE_TYPE_INGAME_PARTNER = 1 << 22;
/** 1:1 décomp `BATTLE_TYPE_BATTLE_TOWER` (battle.h:67) = bit 8. AUDIT FIX : était bit 19. */
const BATTLE_TYPE_BATTLE_TOWER = 1 << 8;
/** 1:1 décomp `PARTY_SIZE` = 6. */
const PARTY_SIZE = 6;
/** 1:1 décomp `MAX_BATTLERS_COUNT` = 4. */
const MAX_BATTLERS_COUNT = 4;
/** 1:1 décomp `MULTIUSE_STATE` = 0. */
const MULTIUSE_STATE = 0;
/** 1:1 décomp `BATTLE_ENVIRONMENT_BUILDING` = 8. */
const BATTLE_ENVIRONMENT_BUILDING = 8;
/** 1:1 décomp `TRAINER_STEVEN_PARTNER` ID (trainers.h:17) = 3075. AUDIT FIX : était 768
 *  → le combat duo de Mossdeep ne reconnaissait pas Steven comme partenaire. */
const TRAINER_STEVEN_PARTNER = 3075;
/** 1:1 décomp `FRIENDSHIP_EVENT_LEAGUE_BATTLE` = 3 (include/constants/pokemon.h:177 ;
 *  l'ancienne valeur 6 = FRIENDSHIP_EVENT_FAINT_SMALL, masquée tant que _AdjustFriendship
 *  était un stub no-op). */
const FRIENDSHIP_EVENT_LEAGUE_BATTLE = 3;
/** 1:1 décomp `DISPLAY_WIDTH` = 240, `DISPLAY_HEIGHT` = 160. */
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;
// REG_OFFSET_* spécifiques init (WIN0H/WIN0V/BG3HOFS déjà définis tranche 1).
const REG_OFFSET_MOSAIC = 0x4C;
const REG_OFFSET_WININ = 0x48;
const REG_OFFSET_WINOUT = 0x4A;

/** 1:1 décomp `WIN_RANGE(a, b)` = (a << 8) | b. */
function WIN_RANGE(a: number, b: number): number {
  return ((a & 0xFF) << 8) | (b & 0xFF);
}

// ─── Cascade helpers init (= dette R3 documentée) ──────────────────────────

/** 1:1 décomp `MoveSaveBlocks_ResetHeap()` (save.c). */
function _MoveSaveBlocks_ResetHeap(): void { /* Dette R3 : heap reset (n/a web). */ }
/** 1:1 décomp `AllocateBattleResources()`. */
function _AllocateBattleResources(): void { /* Dette R3 : gBattleResources alloc. */ }
/** 1:1 décomp `AllocateBattleSpritesData()`. */
function _AllocateBattleSpritesData(): void { /* Dette R3. */ }
/** 1:1 décomp `AllocateMonSpritesGfx()`. */
function _AllocateMonSpritesGfx(): void { /* Dette R3. */ }
/** 1:1 décomp `RecordedBattle_ClearFrontierPassFlag()`. */
function _RecordedBattle_ClearFrontierPassFlag(): void { /* Dette R3. */ }
/** 1:1 décomp `HandleLinkBattleSetup()`. */
function _HandleLinkBattleSetup(): void { /* Dette R3. */ }

/** 1:1 décomp `SetHBlankCallback(cb)`. */
function _SetHBlankCallback(_cb: (() => void) | null): void { /* Dette R3 (HBlank scanline). */ }
/** 1:1 décomp `SetVBlankCallback(cb)` : installe le callback VBlank runtime. */
function _SetVBlankCallback(cb: (() => void) | null): void {
  getRuntime()?.SetVBlankCallback?.(cb);
}
/** 1:1 décomp `CpuFill32(value, dest, size)`. */
function _CpuFill32(_value: number, _dest: unknown, _size: number): void { /* Dette R3 : DMA VRAM clear. */ }
/** 1:1 décomp `SetGpuReg(reg, value)`. */
function _SetGpuReg(reg: number, value: number): void {
  getRuntime()?.SetGpuReg?.(reg, value);
}
/** 1:1 décomp `ResetPaletteFade()` (palette.c:374). FIX user « barres noires
 *  d intro » 2026-06-11 : ce stub vide laissait le fade NOIR de la transition
 *  d entree ACTIF pendant toute la slide -> les bandes defilaient dans le noir
 *  (invisible) puis POP le combat revele. Le decomp reset le fade ICI (la
 *  fente WIN0 1px assure le noir geometrique, pas la palette). */
function _ResetPaletteFade(): void { ResetPaletteFade_rt(); }

/** 1:1 décomp `InitBattleBgsVideo()` (battle_bg.c) → CpuFill32(0,VRAM) + BattleInitBgsAndWindows. */
function _InitBattleBgsVideo(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.vram.fill(0);          // 1:1 CpuFill32(0, VRAM, VRAM_SIZE)
  BattleInitBgsAndWindows();    // 1:1 InitBattleBgsVideo → BattleInitBgsAndWindows
}
/** 1:1 décomp `LoadBattleTextboxAndBackground()` (battle_bg.c:859) — async fire-and-forget. */
function _LoadBattleTextboxAndBackground(env: number): void {
  void loadBattleTextboxAndBackground1to1(env);
}
/** 1:1 décomp `ResetSpriteData()` (sprite.c:294). */
function _ResetSpriteData(): void { _ResetSpriteDataImpl(); }
/** 1:1 décomp `ResetTasks()`. */
function _ResetTasks(): void { getRuntime()?.ResetTasks(); }
/** 1:1 décomp `FreeAllSpritePalettes()` (sprite.c). */
function _FreeAllSpritePalettes(): void { FreeAllSpritePalettes(); }
// SetWildMonHeldItem : porté 1:1 dans party-storage (pokemon.c equiv) ; ex-stub no-op retiré.

/** Wire vers BattleSetup_GetEnvironmentId (battle_setup.c). */
function _BattleSetup_GetEnvironmentId(): number {
  const m = (globalThis as Record<string, unknown>).__battleSetupHelpers as {
    BattleSetup_GetEnvironmentId?: () => number;
  } | undefined;
  return m?.BattleSetup_GetEnvironmentId?.() ?? 0;
}
/** Wire vers SetUpBattleVarsAndBirchZigzagoon (battle_setup.c). */
function _SetUpBattleVarsAndBirchZigzagoon(): void {
  const m = (globalThis as Record<string, unknown>).__battleSetupHelpers as {
    SetUpBattleVarsAndBirchZigzagoon?: () => void;
  } | undefined;
  m?.SetUpBattleVarsAndBirchZigzagoon?.();
}
/** Wire vers CB2_HandleStartBattle (battle-link-start.ts). */
function _getCB2_HandleStartBattle(): () => void {
  const m = (globalThis as Record<string, unknown>).__battleLinkStart as {
    CB2_HandleStartBattle?: () => void;
  } | undefined;
  return m?.CB2_HandleStartBattle ?? ((): void => { /* noop */ });
}
/** Wire vers CreateNPCTrainerParty (battle-trainer-party.ts). */
function _CreateNPCTrainerParty(party: unknown, trainerNum: number, firstTrainer: boolean): number {
  const m = (globalThis as Record<string, unknown>).__battleTrainerParty as {
    CreateNPCTrainerParty?: (party: unknown, trainerNum: number, firstTrainer: boolean) => number;
  } | undefined;
  return m?.CreateNPCTrainerParty?.(party, trainerNum, firstTrainer) ?? 0;
}
// CB2_HandleStartMulti* / PreInit* — non portés (Dette R3 multi/partner).
function _CB2_HandleStartMultiPartnerBattle(): void { /* Dette R3 multi */ }
function _CB2_HandleStartMultiBattle(): void { /* Dette R3 multi */ }
function _CB2_PreInitMultiBattle(): void { /* Dette R3 multi */ }
function _CB2_PreInitIngamePlayerPartnerBattle(): void { /* Dette R3 partner */ }

// ─── CB2_InitBattle (battle_main.c:588-617) ────────────────────────────────

/** 1:1 décomp `CB2_InitBattle()` (battle_main.c:588-617).
 *  Entry boot battle : alloc resources + branche selon BATTLE_TYPE_MULTI. */
export function CB2_InitBattle(): void {
  _MoveSaveBlocks_ResetHeap();
  _AllocateBattleResources();
  _AllocateBattleSpritesData();
  _AllocateMonSpritesGfx();
  _RecordedBattle_ClearFrontierPassFlag();

  if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED) {
      CB2_InitBattleInternal();
    } else if (!(gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER)) {
      _HandleLinkBattleSetup();
      _SetMainCallback2(_CB2_PreInitMultiBattle);
    } else {
      _SetMainCallback2(_CB2_PreInitIngamePlayerPartnerBattle);
    }
    gBattleCommunication[MULTIUSE_STATE] = 0;
  } else {
    CB2_InitBattleInternal();
  }
}

// ─── CB2_InitBattleInternal (battle_main.c:619-710) ────────────────────────

/** 1:1 décomp `CB2_InitBattleInternal()` (battle_main.c:619-710).
 *  Full battle setup : VRAM clear + GPU/WIN regs + scanline + BGs + sprites +
 *  dispatch CB2 selon type + trainer party + friendship. battleVBlankState +
 *  VBlankCB_Battle = accès DIRECT (même module = plus 1:1 que l'ancien lazy global). */
export function CB2_InitBattleInternal(): void {
  _SetHBlankCallback(null);
  _SetVBlankCallback(null);

  _CpuFill32(0, null /* VRAM */, 0x18000);

  _SetGpuReg(REG_OFFSET_MOSAIC, 0);
  _SetGpuReg(REG_OFFSET_WIN0H, DISPLAY_WIDTH);
  _SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(DISPLAY_HEIGHT / 2, DISPLAY_HEIGHT / 2 + 1));
  _SetGpuReg(REG_OFFSET_WININ, 0);
  _SetGpuReg(REG_OFFSET_WINOUT, 0);
  // 1:1 : active WIN0 (DISPCNT_WIN0_ON = 0x2000). WININ=0/WINOUT=0 masquent l'écran
  // (noir géométrique) jusqu'à l'ouverture des bandes (BattleIntroSlide case 1).
  _SetGpuReg(0x00 /*REG_OFFSET_DISPCNT*/, (getRuntime()?.GetGpuReg?.(0x00) ?? 0) | 0x2000);

  battleVBlankState.win0h = DISPLAY_WIDTH;

  // gPartnerTrainerId via lazy globalThis.
  const stateMod = (globalThis as { __battleState?: { gPartnerTrainerId?: number } }).__battleState;
  const partnerTrainerId = stateMod?.gPartnerTrainerId ?? 0;

  if ((gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER) && partnerTrainerId !== TRAINER_STEVEN_PARTNER) {
    // 1:1 décomp ll. 638-641 : ingame partner non-Steven WIN setup.
    battleVBlankState.win0v = DISPLAY_HEIGHT - 1;
    battleVBlankState.win1h = DISPLAY_WIDTH;
    battleVBlankState.win1v = 32;
  } else {
    // 1:1 décomp ll. 644-660 : standard battle WIN0V split central + scanline.
    battleVBlankState.win0v = WIN_RANGE(DISPLAY_HEIGHT / 2, DISPLAY_HEIGHT / 2 + 1);
    ScanlineEffect_Clear();

    // 1:1 décomp ll. 647-657 : scanline buffer fill (top half 0xF0, bottom 0xFF10).
    let i = 0;
    for (; i < DISPLAY_HEIGHT / 2; i++) {
      gScanlineEffectRegBuffers[0][i] = 0xF0;
      gScanlineEffectRegBuffers[1][i] = 0xF0;
    }
    for (; i < DISPLAY_HEIGHT; i++) {
      gScanlineEffectRegBuffers[0][i] = 0xFF10;
      gScanlineEffectRegBuffers[1][i] = 0xFF10;
    }

    // 1:1 décomp `ScanlineEffect_SetParams(sIntroScanlineParams16Bit)` (battle_main.c:659).
    ScanlineEffect_SetParams({ dmaDest: REG_OFFSET_BG3HOFS, dmaControl: SCANLINE_EFFECT_DMACNT_16BIT, initState: 1 });
  }

  _ResetPaletteFade();

  // 1:1 décomp ll. 663-670 : reset 8 BG scroll vars.
  battleVBlankState.bg0_x = 0; battleVBlankState.bg0_y = 0;
  battleVBlankState.bg1_x = 0; battleVBlankState.bg1_y = 0;
  battleVBlankState.bg2_x = 0; battleVBlankState.bg2_y = 0;
  battleVBlankState.bg3_x = 0; battleVBlankState.bg3_y = 0;

  // 1:1 décomp ll. 672-674 : gBattleEnvironment depuis BattleSetup_GetEnvironmentId.
  let environment = _BattleSetup_GetEnvironmentId();
  if (gBattleTypeFlags & BATTLE_TYPE_RECORDED) {
    environment = BATTLE_ENVIRONMENT_BUILDING;
  }
  // DEVTOOL harness (chantier intro-terrains 2026-06-11) : forcer l'environment
  // pour A/B les 10 intros sans se déplacer sur la map. null/undefined = réel.
  {
    const forced = (globalThis as Record<string, unknown>).__forceBattleEnvironment;
    if (typeof forced === 'number' && forced >= 0 && forced <= 9) environment = forced;
  }
  setBattleEnvironment(environment);

  _InitBattleBgsVideo();
  _LoadBattleTextboxAndBackground(environment);
  _ResetSpriteData();
  _ResetTasks();
  // 1:1 décomp `DrawBattleEntryBackground()` (battle_main.c:680) avec l'env RECALCULÉ
  // (fixe le « sable au re-combat »). Async (assets terrain), caché par WIN0 jusqu'à l'ouverture.
  void drawBattleEntryBackground(environment);
  // 1:1 ROM (C0 racine, 2026-06-12) : AUCUNE réserve tiles en combat —
  // ResetSpriteData (sprite.c:302) remet gReservedSpriteTileCount=0 et la ROM
  // n'y touche PAS (seul pokemon_storage_system pose 0x280). Tout est
  // first-fit depuis 0 : mons (sprites-à-images), healthboxes (ranges par
  // tag au bitmap), ball, sheets anim. L'ex-réserve 0x140 (pansement
  // scratch@0 d'avant le marquage des ranges) GASPILLAIT 320 tiles : la zone
  // anim tombait à ~107 tiles → ANIM_TAG_ROCKS (96) / HealBell (BELL+
  // NOTES_2+THIN_RING) ne tenaient plus (sheet:10058/10206/10203/10049,
  // mesures 2026-06-12). Les occupants réels sont TOUS au bitmap
  // (AllocSpriteTileRange + _markLiveSpriteTiles).
  (globalThis as Record<string, unknown>).gReservedSpriteTileCount = 0;
  _FreeAllSpritePalettes();
  // 1:1 décomp l. 682 : gReservedSpritePaletteCount = MAX_BATTLERS_COUNT (réserve OBJ 0..3).
  setReservedSpritePaletteCount(MAX_BATTLERS_COUNT);
  _SetVBlankCallback(VBlankCB_Battle);
  _SetUpBattleVarsAndBirchZigzagoon();

  // 1:1 décomp ll. 686-693 : dispatch CB2 selon BATTLE_TYPE.
  if (gBattleTypeFlags & BATTLE_TYPE_MULTI && gBattleTypeFlags & BATTLE_TYPE_BATTLE_TOWER) {
    _SetMainCallback2(_CB2_HandleStartMultiPartnerBattle);
  } else if (gBattleTypeFlags & BATTLE_TYPE_MULTI && gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER) {
    _SetMainCallback2(_CB2_HandleStartMultiPartnerBattle);
  } else if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
    _SetMainCallback2(_CB2_HandleStartMultiBattle);
  } else {
    _SetMainCallback2(_getCB2_HandleStartBattle());
  }

  // 1:1 décomp ll. 695-701 : trainer party load + wild held item.
  if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED))) {
    _CreateNPCTrainerParty(null /* gEnemyParty[0] */, gTrainerBattleOpponent_A, true);
    if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
      _CreateNPCTrainerParty(null /* gEnemyParty[PARTY_SIZE/2] */, gTrainerBattleOpponent_B, false);
    }
    SetWildMonHeldItem();
  }

  // 1:1 décomp ll. 703-704 : gMain.inBattle = TRUE + frontier disableRecordBattle.
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setMainInBattle?: (v: boolean) => void;
  } | undefined;
  m?.setMainInBattle?.(true);
  // 1:1 battle_main.c:703 `gMain.inBattle = TRUE`. ⚠️ DOUBLE-FLAG : setMainInBattle ecrit le
  // module-local _gMain_inBattle ; le champ runtime rt.gMain.inBattle (lu par pokeball.ts
  // SpriteCB_ReleaseMonFromBall pour le bloc cri/waitForCry) est DISTINCT → le poser aussi,
  // sinon le send-out chain saute le cri + waitForCry n'est jamais leve.
  getRuntime().gMain.inBattle = true;

  const sb2 = (globalThis as { gSaveBlock2Ptr?: { frontier?: { disableRecordBattle?: boolean } } }).gSaveBlock2Ptr;
  if (sb2?.frontier) sb2.frontier.disableRecordBattle = false;

  // 1:1 décomp ll. 706-707 : AdjustFriendship(&gPlayerParty[i], FRIENDSHIP_EVENT_LEAGUE_BATTLE)
  // per player mon. Route vers le canonique AdjustFriendship (party-storage) sur le STRUCT
  // gPlayerParty (pas la vue saveblock) ; le gate interne n'applique le gain qu'en combat
  // Champion d'Arène / Conseil 4 / Maître. (Ex-stub _AdjustFriendship no-op = dette soldée.)
  for (let i = 0; i < PARTY_SIZE; i++) {
    AdjustFriendship(_gPlayerParty[i], FRIENDSHIP_EVENT_LEAGUE_BATTLE);
  }

  gBattleCommunication[MULTIUSE_STATE] = 0;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

void BlendPalettes;

(globalThis as Record<string, unknown>).__battleVBlankHelpers = {
  VBlankCB_Battle, HBlankCB_Battle, GetBattleBgTemplateData,
  SpriteCB_VsLetterDummy, SpriteCB_VsLetter, SpriteCB_VsLetterInit,
  BufferPartyVsScreenHealth_AtStart, BufferPartyVsScreenHealth_AtEnd,
  battleVBlankState,
};

(globalThis as Record<string, unknown>).__battleCB2 = {
  BattleMainCB1, BattleMainCB2,
  FreeRestoreBattleData, CB2_QuitRecordedBattle,
  SpriteCB_UnusedBattleInit, SpriteCB_UnusedBattleInit_Main,
};

(globalThis as Record<string, unknown>).__battleInit = {
  CB2_InitBattle, CB2_InitBattleInternal,
  gScanlineEffectRegBuffers,
};

/** Swap physique de 2 slots de gPlayerParty (1:1 SwapPartyPokemon, party_menu.c:5856). */
function _SwapPartyPokemonBySlots(a: number, b: number): void {
  if (!_gPlayerParty[a] || !_gPlayerParty[b]) return;
  const t = Object.assign({}, _gPlayerParty[a]);
  Object.assign(_gPlayerParty[a], _gPlayerParty[b]);
  Object.assign(_gPlayerParty[b], t);
}

// ─── Surface party-order (lue par party-screen + InitBattleControllers, lazy) ──
// 1:1 party_menu.c : le party menu COMBAT vit en ordre BATTLE (actif slot 0) ;
// l'ordre est persistant (battlerPartyOrders) et restauré à la fermeture.
(globalThis as Record<string, unknown>).__battlePartyOrder = {
  /** Ouverture du party menu combat : charge l'ordre persistant du battler joueur +
   *  réordonne physiquement gPlayerParty. Retourne le slot AFFICHÉ du mon actif. */
  openBattleOrder(activePartyId: number): number {
    for (let i = 0; i < 3; i++) gBattlePartyCurrentOrder[i] = gBattleStruct.battlerPartyOrders[0][i] ?? 0;
    // GARDE anti-dégénérescence : des nibbles tous nuls (= battlerPartyOrders
    // jamais initialisé) feraient pointer TOUS les slots sur party[0] →
    // UpdatePartyToBattleOrder DUPLIQUERAIT le mon 0 sur toute la party (bug
    // « 2 ARCKO » A/B 2026-06-10). L'ordre légitime a toujours byte0 != 0
    // (slot1 != party0 dès que l'ordre est construit) → reconstruire 1:1.
    if ((gBattlePartyCurrentOrder[0] ?? 0) === 0 && (gBattlePartyCurrentOrder[1] ?? 0) === 0) {
      BufferBattlePartyOrder(gBattlePartyCurrentOrder);
    }
    UpdatePartyToBattleOrder();
    return _GetPartyIdFromBattlePartyId(activePartyId);
  },
  /** Choix du switch (1:1 TrySwitchInPokemon party_menu.c:5851-5856) : capture l'id
   *  FIELD du choisi (la réponse moteur) PUIS swap nibbles + swap physique. */
  chooseSwitchSlot(displaySlot: number, activePartyId: number): number {
    const fieldId = GetPartyIdFromBattleSlot(displaySlot);
    const newSlot = _GetPartyIdFromBattlePartyId(activePartyId);
    _SwitchPartyMonSlots(newSlot, displaySlot);
    _SwapPartyPokemonBySlots(newSlot, displaySlot);
    return fieldId;
  },
  /** Fermeture (toutes sorties : choix OU annulation B) : restaure l'ordre FIELD +
   *  persiste les nibbles dans battlerPartyOrders[joueur]. */
  closeBattleOrder(): void {
    UpdatePartyToFieldOrder();
    for (let i = 0; i < 3; i++) gBattleStruct.battlerPartyOrders[0][i] = gBattlePartyCurrentOrder[i] ?? 0;
  },
  BufferBattlePartyCurrentOrderBySide,
};

// ─── RE-EXPORTS nominaux 1:1 (miroir-index — cf. en-tête COUVERTURE) ─────────
// Chaque fonction de battle_main.c vivant dans un sous-système engine est
// accessible depuis CE miroir au nom décomp exact (= include battle_main.h).
// La consolidation PHYSIQUE (concat des corps ici) suivra le pattern
// battle_interface C1-C4, fichier par fichier, avec A/B par phase.

// Machine gBattleMainFunc + intro + fins de combat (battle-main-functions).
// (machine gBattleMainFunc + intro + HandleEndTurn : CONSOLIDÉE ci-dessous, section C7.)

// Sélection d'action + ordre/dispatch du tour.
// (action-selection : CONSOLIDÉE ci-dessous, section C5.)
// (turn-helpers : CONSOLIDÉS ci-dessous, section C3.)
// (turn-dispatch : CONSOLIDÉS ci-dessous, section C4.)

// SpriteCB_* du combat (battle-sprite-callbacks + battle-faint-anim).
// (sprite-callbacks : CONSOLIDÉS ci-dessous, section C6.)
// (SpriteCB_Faint* : CONSOLIDÉS PHYSIQUEMENT ci-dessous — section battle-faint-anim,
//  1:1 battle_main.c:2744-2891. L'ancien module = shim re-export.)

// Boot link-start + données de combat (cleanup) + party dresseur.
// (CB2_HandleStartBattle + FindLinkBattleMaster : CONSOLIDÉS ci-dessous, section C8.)
export { SwitchInClearSetData } from './engine/battle/battle-switch';
// (FaintClearSetData + TurnValuesCleanUp : CONSOLIDÉS ci-dessous, section C2.)
export { CreateNPCTrainerParty } from './engine/battle/battle-trainer-party';
// ═══ SECTION battle-faint-anim — CONSOLIDÉE PHYSIQUEMENT (C1, 2026-06-10) ════
// Port 1:1 strict des callbacks faint sprite (battle_main.c:2744-2891) :
//   - SpriteCB_FaintOpponentMon (2744-2786) — entry faint pour opp mon
//   - SpriteCB_AnimFaintOpponent (2788-2811) — tick fall animation (8 frames)
//   - SpriteCB_FaintSlideAnim (2881-2891) — slide post-faint (player side)
// Mécanique : drop 8 px/step ; chaque step erase 256 bytes (1 row de tiles) du
// gfx → effet « tomber » ; data[3] = steps restants ; data[4] = countdown.
// L'ancien module engine/battle/battle-faint-anim.ts = shim re-export.
// (getRuntime : déjà importé en tête de fichier.)

import { GetBattlerPosition } from './engine/battle/util';

/** 1:1 décomp `sBattler` data field (= sprite->data[5] in décomp). */
const SPRITE_DATA_BATTLER = 5;
/** 1:1 décomp `sSpeciesId` data field (= sprite->data[7] in décomp). */
const SPRITE_DATA_SPECIES = 7;
/** 1:1 décomp `sSpeedX` data field (= sprite->data[1]). */
const SPRITE_DATA_SPEED_X = 1;
/** 1:1 décomp `sSpeedY` data field (= sprite->data[2]). */
const SPRITE_DATA_SPEED_Y = 2;

/** Type minimal de sprite (= compatible avec DecompSprite du runtime). */
interface FaintSprite {
  data: number[];
  y2: number;
  x2: number;
  invisible?: boolean;
  inUse?: boolean;
  callback?: ((sprite: FaintSprite) => void) | null;
}

// ─── Hardware/data helpers (= dette R3 documentée) ────────────────────────

/** 1:1 décomp `gMonFrontPicCoords[species].y_offset`. Default = 0 si species
 *  data absente. Cascade : pokemon_front_pic_coords data dans
 *  decomp-data/auto-data/. */
function _getMonFrontPicYOffset(species: number): number {
  // Wire vers species-runtime si disponible (= getMonFrontPicCoords data).
  // Pour now : default 8 (= middle des 8 steps).
  void species;
  return 8;
}

/** 1:1 décomp `FreeSpriteOamMatrix(sprite)`. Libère le matrix slot affine. */
function FreeSpriteOamMatrix(_sprite: FaintSprite): void {
  // Dette R3 : full OAM matrix dealloc via runtime FreeOamMatrix. Pour now :
  // notre runtime gère via tag-based system, le matrix sera libéré au DestroySprite.
}

/** 1:1 décomp `DestroySprite(sprite)`. */
function DestroySprite(sprite: FaintSprite): void {
  // Wire vers runtime : trouve l'id du sprite et détruit PROPREMENT.
  const r = getRuntime();
  if (!r || !r.gSprites) return;
  for (let id = 0; id < MAX_SPRITES; id++) {
    const s = r.gSprites[id];
    if (s === undefined) continue;
    if (s === sprite) {
      // ⚠️ BUG FANTÔME (user 2026-06-10, « le mon KO reste derrière les PV ») :
      // l'ancienne version faisait gSprites[] = undefined SANS cacher l'OAM → le sprite
      // sortait de la Map (plus aucun sync oam.visible) et l'IMAGE restait affichée
      // À JAMAIS. 1:1 DestroySpriteAndFreeResources : le runtime cache l'OAM
      // (oam.visible=false + invisible + inUse=false + callback=null), PUIS on
      // retire le slot de la Map (le mon faint n'a pas d'enfants-data).
      _DestroySpriteImpl(id);
      r.gSprites[id] = undefined;
      return;
    }
  }
}

/** 1:1 décomp `gMonSpritesGfxPtr->sprites.byte[position]`. Pointer vers
 *  le buffer GFX du sprite mon battler. Cascade : 4 buffers per side. */
function _getMonSpriteGfxByteBuffer(_position: number): Uint8Array | null {
  // Dette R3 : gMonSpritesGfxPtr access via decomp-bridge. Pour now : pas
  // de buffer manipulation directe — le runtime gère via tile data.
  return null;
}

/** 1:1 décomp `gBattleMonForms[battler]`. Form index pour species multi-form
 *  (= Castform/Unown). */
function _getBattleMonForm(_battler: number): number {
  // Dette R3 : track per-battler form change (= Castform weather, Unown letter).
  return 0;
}

/** 1:1 décomp `StartSpriteAnim(sprite, animNum)`. Démarre une animation
 *  sprite par index. */
function StartSpriteAnim(_sprite: FaintSprite, _animNum: number): void {
  // Dette R3 : sprite anim restart (= sprite.animNum = animNum, reset anim
  // state machine). Wire vers sprite-animation.ts si dispo.
}

/** 1:1 décomp `gIntroSlideFlags`. Si bit 0 set, slide animations sont pause. */
let _gIntroSlideFlags = 0;
export function setFaintSlideFlags(v: number): void { _gIntroSlideFlags = v; }
export function getFaintSlideFlags(): number { return _gIntroSlideFlags; }

// ─── SpriteCB_FaintOpponentMon (battle_main.c:2744) — 1:1 décomp ───────────

/** 1:1 décomp `SpriteCB_FaintOpponentMon(sprite)` (battle_main.c:2744-2786).
 *  Entry callback pour le faint d'un opponent mon. Compute le nombre de
 *  steps depuis le y_offset de l'image species, puis switch vers
 *  SpriteCB_AnimFaintOpponent pour le tick par tick.
 *
 *  Note : décomp utilise GetMonData(MON_DATA_PERSONALITY) une fois (return
 *  value unused) puis check species == SPECIES_UNOWN. Notre port simplifie
 *  car les SPECIES_UNOWN/CASTFORM handling sont rare cases. */
export function SpriteCB_FaintOpponentMon(sprite: FaintSprite): void {
  const battler = sprite.data[SPRITE_DATA_BATTLER] ?? 0;
  // Dette R3 : transformSpecies tracker dans gBattleSpritesDataPtr->battlerData.
  // Pour now : use sprite's stored species directly.
  const species = sprite.data[SPRITE_DATA_SPECIES] ?? 0;

  // 1:1 décomp ll. 2755 : unused GetMonData(MON_DATA_PERSONALITY) call.
  // Notre port skip car return value unused.
  void species;
  void battler;

  // Y offset par species ; SPECIES_UNOWN, SPECIES_CASTFORM = special cases.
  // Dette R3 : full case match. Pour now : default offset 8.
  const yOffset = _getMonFrontPicYOffset(species);

  sprite.data[3] = 8 - Math.floor(yOffset / 8);
  sprite.data[4] = 1;
  sprite.callback = SpriteCB_AnimFaintOpponent;
}

// ─── SpriteCB_AnimFaintOpponent (battle_main.c:2788) — 1:1 décomp ──────────

/** 1:1 décomp `SpriteCB_AnimFaintOpponent(sprite)` (battle_main.c:2788-2811).
 *  Tick par tick le sprite drop : data[4] countdown → 0 = step. Chaque step :
 *  - y2 += 8 (sprite descend de 8 pixels)
 *  - data[3] décrémente (= nombre de steps restants)
 *  - erase 256 bytes du gfx buffer (= 1 row de tile data) pour smooth illusion
 *  - StartSpriteAnim avec form actuel (= reload graphics avec partial erase)
 *  - Quand data[3] < 0 : FreeOamMatrix + DestroySprite (= sprite gone). */
export function SpriteCB_AnimFaintOpponent(sprite: FaintSprite): void {
  sprite.data[4]--;
  if (sprite.data[4] === 0) {
    sprite.data[4] = 2;
    sprite.y2 += 8;
    sprite.data[3]--;
    if (sprite.data[3] < 0) {
      FreeSpriteOamMatrix(sprite);
      DestroySprite(sprite);
    } else {
      // Erase bottom part of the sprite to create a smooth illusion of mon falling.
      const battler = sprite.data[SPRITE_DATA_BATTLER] ?? 0;
      const position = GetBattlerPosition(battler);
      const monForm = _getBattleMonForm(battler);
      const dst = _getMonSpriteGfxByteBuffer(position);
      if (dst) {
        // 1:1 décomp : (monForm << 11) + (data[3] << 8) offset, write 0x100 zeros.
        const offset = (monForm << 11) + (sprite.data[3] << 8);
        for (let i = 0; i < 0x100; i++) {
          if (offset + i < dst.length) dst[offset + i] = 0;
        }
      }

      StartSpriteAnim(sprite, monForm);
    }
  }
}

// ─── SpriteCB_FaintSlideAnim (battle_main.c:2881) — 1:1 décomp ─────────────

/** 1:1 décomp `SpriteCB_FaintSlideAnim(sprite)` (battle_main.c:2881-2888).
 *  Slide simple post-faint (= player side fait souvent un offset slide).
 *  data[1]=speedX, data[2]=speedY. */
export function SpriteCB_FaintSlideAnim(sprite: FaintSprite): void {
  if (!(_gIntroSlideFlags & 1)) {
    sprite.x2 += sprite.data[SPRITE_DATA_SPEED_X] ?? 0;
    sprite.y2 += sprite.data[SPRITE_DATA_SPEED_Y] ?? 0;
  }
}

// ─── SpriteCB_FaintPlayerMon helper (= entry pour player side) ─────────────

/** Helper : trigger un faint slide pour player side. Décomp utilise
 *  SpriteCB_FaintSlideAnim direct avec speeds set par caller. */
export function TriggerFaintSlide(sprite: FaintSprite, speedX: number, speedY: number): void {
  sprite.data[SPRITE_DATA_SPEED_X] = speedX;
  sprite.data[SPRITE_DATA_SPEED_Y] = speedY;
  sprite.callback = SpriteCB_FaintSlideAnim;
}

/** Helper : trigger un faint opponent (= drop animation). Sets data[5] = battler
 *  et data[7] = species, puis active SpriteCB_FaintOpponentMon. */
export function TriggerFaintOpponent(sprite: FaintSprite, battler: number, species: number): void {
  sprite.data[SPRITE_DATA_BATTLER] = battler;
  sprite.data[SPRITE_DATA_SPECIES] = species;
  sprite.callback = SpriteCB_FaintOpponentMon;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleFaintAnim = {
  SpriteCB_FaintOpponentMon, SpriteCB_AnimFaintOpponent, SpriteCB_FaintSlideAnim,
  TriggerFaintSlide, TriggerFaintOpponent,
  setFaintSlideFlags, getFaintSlideFlags,
};

// ═══ SECTION FaintClearSetData + TurnValuesCleanUp — CONSOLIDÉE (C2, 2026-06-10) ═
// 1:1 battle_main.c:3270-3355 (FaintClearSetData) + :4857-4892 (TurnValuesCleanUp).
// Corps déplacés TEXTUELLEMENT depuis engine/battle/util.ts (devenu re-export,
// pattern GetScaledHPFraction/battle_interface — cycle util-miroir bénin vérifié).

import {
  gBattleMons, gStatuses3, gDisableStructs, gProtectStructs, gBattleStruct,
  gActionSelectionCursor, gMoveSelectionCursor,
  gLastMoves, gLastLandedMoves, gLastHitByType, gLastResultingMoves,
  gLastPrintedMoves, gLastHitBy, gBattleResourcesFlags, gCurrentMove,
} from './engine/battle/state';
import {
  NUM_BATTLE_STATS, DEFAULT_STAT_STAGE, MOVE_NONE,
  STATUS2_ESCAPE_PREVENTION, STATUS2_WRAPPED, STATUS2_INFATUATION,
  GET_BATTLER_SIDE,
} from './engine/battle/constants';
import { ClearBattlerMoveHistory, ClearBattlerAbilityHistory } from './battle_ai_script_commands';
import { CancelMultiTurnMoves, AreAllMovesUnusable } from './battle_util';
import { getSpeciesTypes } from './engine/battle/data/species-runtime';

/** 1:1 décomp `void FaintClearSetData(void)` (battle_main.c:3270-3355) : reset
 *  complet du battler actif au KO — stat stages, status2/3, effets croisés
 *  (escape/infatuation/wrap), curseurs UI, DisableStruct, ProtectStruct,
 *  historiques de moves, types depuis species (revert Conversion). */
export function FaintClearSetData(): void {
  for (let i = 0; i < NUM_BATTLE_STATS; i++) {
    gBattleMons[gActiveBattler].statStages[i] = DEFAULT_STAT_STAGE;
  }
  gBattleMons[gActiveBattler].status2 = 0;
  gStatuses3[gActiveBattler] = 0;

  // 1:1 décomp ll.3275-3283 : clear cross-battler effects qui dépendent de
  // gActiveBattler (= escape prevention, infatuation, wrap).
  for (let i = 0; i < gBattlersCount; i++) {
    if ((gBattleMons[i].status2 & STATUS2_ESCAPE_PREVENTION)
        && gDisableStructs[i].battlerPreventingEscape === gActiveBattler) {
      gBattleMons[i].status2 &= ~STATUS2_ESCAPE_PREVENTION;
    }
    // STATUS2_INFATUATED_WITH(active) = 0x1<<16 << active (= 4 bits at 16-19).
    const infatuatedWithActive = STATUS2_INFATUATION & (0x10000 << gActiveBattler);
    if (gBattleMons[i].status2 & infatuatedWithActive) {
      gBattleMons[i].status2 &= ~infatuatedWithActive;
    }
    if ((gBattleMons[i].status2 & STATUS2_WRAPPED)
        && gBattleStruct.wrappedBy[i] === gActiveBattler) {
      gBattleMons[i].status2 &= ~STATUS2_WRAPPED;
    }
  }

  // 1:1 décomp ll.3285-3286 : reset UI cursors pour ce battler.
  gActionSelectionCursor[gActiveBattler] = 0;
  gMoveSelectionCursor[gActiveBattler] = 0;

  // 1:1 décomp ll.3288-3290 : clear gDisableStructs entièrement.
  const ds = gDisableStructs[gActiveBattler];
  for (const k of Object.keys(ds) as Array<keyof typeof ds>) {
    (ds as unknown as Record<string, number>)[k] = 0;
  }

  // 1:1 décomp ll.3292-3310 : clear gProtectStructs bit fields.
  const ps = gProtectStructs[gActiveBattler];
  ps.protected = 0;
  ps.endured = 0;
  ps.noValidMoves = 0;
  ps.helpingHand = 0;
  ps.bounceMove = 0;
  ps.stealMove = 0;
  ps.flag0Unknown = 0;
  ps.prlzImmobility = 0;
  ps.confusionSelfDmg = 0;
  ps.targetNotAffected = 0;
  ps.chargingTurn = 0;
  ps.fleeType = 0;
  ps.usedImprisonedMove = 0;
  ps.loveImmobility = 0;
  ps.usedDisabledMove = 0;
  ps.usedTauntedMove = 0;
  ps.flag2Unknown = 0;
  ps.flinchImmobility = 0;
  ps.notFirstStrike = 0;

  ds.isFirstTurn = 2; // 1:1 décomp : reset to 2 (= post-faint freshness).

  gLastMoves[gActiveBattler] = MOVE_NONE;
  gLastLandedMoves[gActiveBattler] = MOVE_NONE;
  gLastHitByType[gActiveBattler] = 0;
  gLastResultingMoves[gActiveBattler] = MOVE_NONE;
  gLastPrintedMoves[gActiveBattler] = MOVE_NONE;
  gLastHitBy[gActiveBattler] = 0xFF;

  // 1:1 décomp ll.3321-3322 : clear gBattleStruct->choicedMove (= u16 low/high).
  gBattleStruct.choicedMove[gActiveBattler] = MOVE_NONE;

  // 1:1 décomp ll.3324-3325 : clear gBattleStruct->lastTakenMove[active*2..+1].
  gBattleStruct.lastTakenMove[gActiveBattler * 2 + 0] = MOVE_NONE;
  gBattleStruct.lastTakenMove[gActiveBattler * 2 + 1] = MOVE_NONE;

  // 1:1 décomp ll.3326-3333 : clear gBattleStruct->lastTakenMoveFrom[active][0..3].
  for (let i = 0; i < 4; i++) {
    gBattleStruct.lastTakenMoveFrom[gActiveBattler * 8 + i * 2 + 0] = 0;
    gBattleStruct.lastTakenMoveFrom[gActiveBattler * 8 + i * 2 + 1] = 0;
  }

  // 1:1 décomp l.3335 : clear palace flag pour active battler.
  gBattleStruct.palaceFlags &= ~(1 << gActiveBattler);

  // 1:1 décomp ll.3337-3346 : clear cross-battler tracking depuis active.
  for (let i = 0; i < gBattlersCount; i++) {
    if (i !== gActiveBattler && GET_BATTLER_SIDE(i) !== GET_BATTLER_SIDE(gActiveBattler)) {
      // Clear lastTakenMove pour les opponents (= no longer hit by us).
      gBattleStruct.lastTakenMove[i * 2 + 0] = MOVE_NONE;
      gBattleStruct.lastTakenMove[i * 2 + 1] = MOVE_NONE;
    }
    // Clear lastTakenMoveFrom[i][active] (= no longer hit by active).
    gBattleStruct.lastTakenMoveFrom[i * 8 + gActiveBattler * 2 + 0] = 0;
    gBattleStruct.lastTakenMoveFrom[i * 8 + gActiveBattler * 2 + 1] = 0;
  }

  // 1:1 décomp l.3348 : gBattleResources->flags->flags[active] = 0.
  gBattleResourcesFlags[gActiveBattler] = 0;

  // 1:1 décomp ll.3350-3351 : reset types depuis species data (= revert
  // Conversion / Soak / etc.).
  const [t1, t2] = getSpeciesTypes(gBattleMons[gActiveBattler].species);
  gBattleMons[gActiveBattler].type1 = t1;
  gBattleMons[gActiveBattler].type2 = t2;

  // 1:1 décomp ll.3353-3354 : ClearBattlerMoveHistory + ClearBattlerAbilityHistory.
  ClearBattlerMoveHistory(gActiveBattler);
  ClearBattlerAbilityHistory(gActiveBattler);

  // Reference l.3324-3325 : gCurrentMove non touché ici (= different scope).
  void gCurrentMove;
}

/** 1:1 décomp `void TurnValuesCleanUp(bool8 var0)` (battle_main.c:4857-4892) :
 *  TRUE = cleanup post-move rapide (protect/endure) ; FALSE = nouveau tour
 *  (ProtectStruct complet + isFirstTurn-- + rechargeTimer + substitute check)
 *  + reset followmeTimer des 2 camps. */
export function TurnValuesCleanUp(var0: boolean): void {
  // Inline STATUS2_* constants (= éviter circular import).
  const STATUS2_RECHARGE_LOCAL  = 1 << 22;
  const STATUS2_SUBSTITUTE_LOCAL = 1 << 24;
  for (let active = 0; active < gBattlersCount; active++) {
    if (var0) {
      // 1:1 décomp ll. 4866-4867 : post-move cleanup.
      gProtectStructs[active].protected = 0;
      gProtectStructs[active].endured = 0;
    } else {
      // 1:1 décomp ll. 4871-4883 : fresh turn = full clear ProtectStruct.
      const ps = gProtectStructs[active];
      ps.protected = 0; ps.endured = 0;
      ps.noValidMoves = 0; ps.helpingHand = 0;
      ps.bounceMove = 0; ps.stealMove = 0;
      ps.flag0Unknown = 0; ps.prlzImmobility = 0;
      ps.confusionSelfDmg = 0; ps.targetNotAffected = 0;
      ps.chargingTurn = 0; ps.fleeType = 0;
      ps.usedImprisonedMove = 0; ps.loveImmobility = 0;
      ps.usedDisabledMove = 0; ps.usedTauntedMove = 0;
      ps.flag2Unknown = 0; ps.flinchImmobility = 0;
      ps.notFirstStrike = 0;
      // 1:1 décomp ll. 4875-4876 : decrement isFirstTurn si > 0.
      if (gDisableStructs[active].isFirstTurn) {
        gDisableStructs[active].isFirstTurn--;
      }
      // 1:1 décomp ll. 4878-4883 : rechargeTimer countdown + STATUS2_RECHARGE clear.
      if (gDisableStructs[active].rechargeTimer) {
        gDisableStructs[active].rechargeTimer--;
        if (gDisableStructs[active].rechargeTimer === 0) {
          gBattleMons[active].status2 &= ~STATUS2_RECHARGE_LOCAL;
        }
      }
    }
    // 1:1 décomp ll. 4886-4887 : substituteHP 0 → clear STATUS2_SUBSTITUTE.
    if (gDisableStructs[active].substituteHP === 0) {
      gBattleMons[active].status2 &= ~STATUS2_SUBSTITUTE_LOCAL;
    }
  }
  // 1:1 décomp ll. 4890-4891 : reset followmeTimer pour les 2 sides.
  // Lazy via state singleton (= éviter d'importer gSideTimers ici).
  const sideTimersGlobal = (globalThis as { __battleState?: { gSideTimers?: Array<{ followmeTimer: number }> } }).__battleState?.gSideTimers;
  if (sideTimersGlobal) {
    if (sideTimersGlobal[0]) sideTimersGlobal[0].followmeTimer = 0;
    if (sideTimersGlobal[1]) sideTimersGlobal[1].followmeTimer = 0;
  }
}
// ═══ SECTION battle-turn-helpers — CONSOLIDÉE PHYSIQUEMENT (C3, 2026-06-10) ══
// 1:1 battle_main.c:4086-4855 : SwitchPartyOrder (4086) · AllAtActionConfirmed
// (4554) · UpdateBattlerPartyOrdersOnSwitch (4570) · SwapTurnOrder (4587) ·
// SetActionsAndBattlersTurnOrder (4756, RUN > ITEM/SWITCH > MOVE par speed).
// L'ancien module engine/battle/battle-turn-helpers.ts = shim re-export.
// (gActiveBattler/gBattleTypeFlags/gBattlersCount/gBattleCommunication/
//  setActiveBattler : tête de fichier ; gBattleStruct : section C2 ;
//  BATTLE_TYPE_LINK/MULTI : tête.)

import {
  gActionsByTurnOrder, gBattlerByTurnOrder, gChosenActionByBattler,
  gBattlerPartyIndexes,
} from './engine/battle/state';
import {
  BATTLE_TYPE_SAFARI, BATTLE_TYPE_DOUBLE,
  B_ACTION_USE_ITEM, B_ACTION_SWITCH, B_ACTION_RUN,
  BATTLE_PARTNER,
} from './engine/battle/constants';
// (GetWhoStrikesFirst : fonction LOCALE section C7 — battle_main.c:4595, son fichier d'origine.)

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `STATE_WAIT_ACTION_CONFIRMED` (battle_main.c:4123). */
// (STATE_WAIT_ACTION_CONFIRMED : export const de la section C5, même valeur 5.)

/** Wire vers K21 CheckFocusPunch_ClearVarsBeforeTurnStarts + K8 setBattleMainFunc. */
function _setBattleMainFunc_CheckFocusPunch(): void {
  const td = (globalThis as Record<string, unknown>).__battleTurnDispatch as {
    CheckFocusPunch_ClearVarsBeforeTurnStarts?: () => void;
  } | undefined;
  const bm = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setBattleMainFunc?: (fn: () => void) => void;
  } | undefined;
  if (td?.CheckFocusPunch_ClearVarsBeforeTurnStarts && bm?.setBattleMainFunc) {
    bm.setBattleMainFunc(td.CheckFocusPunch_ClearVarsBeforeTurnStarts);
  }
}

/** 1:1 décomp `gBattlePartyCurrentOrder[3]` — buffer temp pour party switch. */
const gBattlePartyCurrentOrder: number[] = [0, 0, 0];

// ─── AllAtActionConfirmed (battle_main.c:4554) — 1:1 décomp ────────────────

/** 1:1 décomp `AllAtActionConfirmed()` (battle_main.c:4554-4568).
 *  Check si tous les battlers (sauf 1 = celui en cours) ont confirmé leur action. */
export function AllAtActionConfirmed(): boolean {
  let count = 0;
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattleCommunication[i] === STATE_WAIT_ACTION_CONFIRMED) {
      count++;
    }
  }
  return count + 1 === gBattlersCount;
}

// ─── UpdateBattlerPartyOrdersOnSwitch (4570) — 1:1 décomp ──────────────────

/** 1:1 décomp `UpdateBattlerPartyOrdersOnSwitch()` (battle_main.c:4570-4585).
 *  Record le switch action dans buffer + party orders pour link battle multi. */
export function UpdateBattlerPartyOrdersOnSwitch(): void {
  // 1:1 décomp l. 4572 : gBattleStruct->monToSwitchIntoId[active] =
  //                       gBattleBufferB[active][1].
  // Dette R3 : gBattleBufferB[active][1..3] tracker côté controller.
  // Pour now : read via lazy globalThis si disponible.
  const stateMod = (globalThis as { __battleState?: { gBattleBufferB?: Uint8Array[] } }).__battleState;
  const buf = stateMod?.gBattleBufferB?.[gActiveBattler];

  if (buf) {
    gBattleStruct.monToSwitchIntoId[gActiveBattler] = buf[1];
    // Dette R3 : RecordedBattle_SetBattlerAction not yet ported.

    if (gBattleTypeFlags & BATTLE_TYPE_LINK && gBattleTypeFlags & BATTLE_TYPE_MULTI) {
      // 1:1 décomp ll. 4577-4583 : battlerPartyOrders update pour link multi.
      // Type 1:1 décomp : u8[MAX_BATTLERS_COUNT][3] → number[4][3] côté TS.
      const partyOrders = gBattleStruct.battlerPartyOrders;
      partyOrders[gActiveBattler][0] &= 0xF;
      partyOrders[gActiveBattler][0] |= (buf[2] & 0xF0);
      partyOrders[gActiveBattler][1] = buf[3];

      const partnerIdx = BATTLE_PARTNER(gActiveBattler);
      partyOrders[partnerIdx][0] &= 0xF0;
      partyOrders[partnerIdx][0] |= (buf[2] & 0xF0) >> 4;
      partyOrders[partnerIdx][2] = buf[3];
    }
  }
}

// ─── SwapTurnOrder (4587) — 1:1 décomp ─────────────────────────────────────

/** 1:1 décomp `SwapTurnOrder(id1, id2)` (battle_main.c:4587-4593). */
export function SwapTurnOrder(id1: number, id2: number): void {
  const tmpAction = gActionsByTurnOrder[id1];
  gActionsByTurnOrder[id1] = gActionsByTurnOrder[id2];
  gActionsByTurnOrder[id2] = tmpAction;

  const tmpBattler = gBattlerByTurnOrder[id1];
  gBattlerByTurnOrder[id1] = gBattlerByTurnOrder[id2];
  gBattlerByTurnOrder[id2] = tmpBattler;
}

// ─── SwitchPartyOrder (4086) — 1:1 décomp ──────────────────────────────────

/** Cascade helper : `GetPartyIdFromBattlePartyId(idx)`. */
// ─── Party order nibbles 1:1 (party_menu.c:6035-6065 + UpdatePartyToBattle/FieldOrder) ──
// gBattlePartyCurrentOrder (section C3) : 3 bytes, nibble hi/lo = party-id FIELD du
// slot AFFICHÉ (6 slots). Pendant le party menu COMBAT, gPlayerParty est PHYSIQUEMENT
// réordonnée (UpdatePartyToBattleOrder, l'actif au slot 0) et RESTAURÉE à la fermeture
// (UpdatePartyToFieldOrder) — fix « le mon échangé n'est pas premier » (user 2026-06-10).

/** 1:1 décomp `GetPartyIdFromBattleSlot(u8 slot)` (party_menu.c:6035). */
export function GetPartyIdFromBattleSlot(slot: number): number {
  const b = gBattlePartyCurrentOrder[slot >> 1] ?? 0;
  return (slot & 1) ? (b & 0xF) : (b >> 4);
}

/** 1:1 décomp `SetPartyIdAtBattleSlot(u8 slot, u8 setVal)` (party_menu.c:6041). */
export function SetPartyIdAtBattleSlot(slot: number, setVal: number): void {
  const i = slot >> 1;
  const b = gBattlePartyCurrentOrder[i] ?? 0;
  gBattlePartyCurrentOrder[i] = (slot & 1) ? ((b & 0xF0) | (setVal & 0xF)) : ((b & 0x0F) | ((setVal & 0xF) << 4));
}

/** 1:1 décomp `u8 GetPartyIdFromBattlePartyId(u8 battlePartyId)` (party_menu.c:6055) :
 *  scanne les nibbles → retourne le SLOT AFFICHÉ du party-id donné. */
function _GetPartyIdFromBattlePartyId(battlePartyId: number): number {
  for (let j = 0, i = 0; i < 3; j++, i++) {
    if ((gBattlePartyCurrentOrder[i] >> 4) !== battlePartyId) {
      j++;
      if ((gBattlePartyCurrentOrder[i] & 0xF) === battlePartyId) return j;
    } else {
      return j;
    }
  }
  return 0;
}
export { _GetPartyIdFromBattlePartyId as GetPartyIdFromBattlePartyId };

/** 1:1 décomp `void SwitchPartyMonSlots(u8 slot, u8 slot2)` (party_menu.c:6051) :
 *  swap des party-ids aux 2 slots AFFICHÉS (nibbles). */
function _SwitchPartyMonSlots(slot: number, slot2: number): void {
  const partyId = GetPartyIdFromBattleSlot(slot);
  SetPartyIdAtBattleSlot(slot, GetPartyIdFromBattleSlot(slot2));
  SetPartyIdAtBattleSlot(slot2, partyId);
}

/** 1:1 décomp `BufferBattlePartyOrder(partyBattleOrder, flankId)` single
 *  (party_menu.c:5864) : ordre = [mon ACTIF du joueur, puis les autres en ordre
 *  field] → nibbles. */
export function BufferBattlePartyOrder(partyBattleOrder: number[]): void {
  const ids: number[] = new Array(6).fill(0);
  ids[0] = gBattlerPartyIndexes[0] ?? 0;
  let j = 1;
  for (let i = 0; i < 6; i++) {
    if (i !== ids[0]) ids[j++] = i;
  }
  for (let i = 0; i < 3; i++) partyBattleOrder[i] = ((ids[i * 2] & 0xF) << 4) | (ids[i * 2 + 1] & 0xF);
}

/** 1:1 décomp `BufferBattlePartyCurrentOrderBySide(battler, flankId)`
 *  (party_menu.c:5918) — single : écrit battlerPartyOrders[battler]. */
export function BufferBattlePartyCurrentOrderBySide(battler: number, _flankId: number): void {
  BufferBattlePartyOrder(gBattleStruct.battlerPartyOrders[battler]);
}

/** 1:1 décomp `UpdatePartyToBattleOrder()` (party_menu.c) : réordonne PHYSIQUEMENT
 *  gPlayerParty selon gBattlePartyCurrentOrder (party[slot] = field[nibble(slot)]).
 *  Permutation de refs (Object.assign par slot) — aucun partage d'arrays. */
export function UpdatePartyToBattleOrder(): void {
  const tmp = _gPlayerParty.map((m) => Object.assign({}, m));
  for (let slot = 0; slot < 6; slot++) {
    const fieldId = GetPartyIdFromBattleSlot(slot);
    if (tmp[fieldId]) Object.assign(_gPlayerParty[slot], tmp[fieldId]);
  }
}

/** 1:1 décomp `UpdatePartyToFieldOrder()` (party_menu.c) : restaure l'ordre FIELD
 *  (field[nibble(slot)] = party[slot]). */
export function UpdatePartyToFieldOrder(): void {
  const tmp = _gPlayerParty.map((m) => Object.assign({}, m));
  for (let slot = 0; slot < 6; slot++) {
    const fieldId = GetPartyIdFromBattleSlot(slot);
    if (tmp[slot]) Object.assign(_gPlayerParty[fieldId], tmp[slot]);
  }
}

/** 1:1 décomp `SwitchPartyOrder(battler)` (battle_main.c:4086-4114).
 *  Swap les slot dans la party current order après un switch. */
export function SwitchPartyOrder(battler: number): void {
  const partyOrders = gBattleStruct.battlerPartyOrders;

  // 1:1 décomp ll. 4092-4093 : copy battlerPartyOrders[battler][0..3] dans temp.
  for (let i = 0; i < 3; i++) {
    gBattlePartyCurrentOrder[i] = partyOrders[battler][i] ?? 0;
  }

  // 1:1 décomp ll. 4095-4097 : swap les 2 slots dans player party.
  const partyId1 = _GetPartyIdFromBattlePartyId(gBattlerPartyIndexes[battler]);
  const partyId2 = _GetPartyIdFromBattlePartyId(gBattleStruct.monToSwitchIntoId[battler] ?? 0);
  _SwitchPartyMonSlots(partyId1, partyId2);

  // 1:1 décomp ll. 4099-4113 : update battlerPartyOrders.
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    for (let i = 0; i < 3; i++) {
      partyOrders[battler][i] = gBattlePartyCurrentOrder[i];
      partyOrders[BATTLE_PARTNER(battler)][i] = gBattlePartyCurrentOrder[i];
    }
  } else {
    for (let i = 0; i < 3; i++) {
      partyOrders[battler][i] = gBattlePartyCurrentOrder[i];
    }
  }
}

// ─── SetActionsAndBattlersTurnOrder (4756) — 1:1 décomp ────────────────────

/** 1:1 décomp `SetActionsAndBattlersTurnOrder()` (battle_main.c:4756-4855).
 *  Main turn order setter : RUN > ITEM/SWITCH > MOVE (par speed).
 *
 *  Safari : pas d'order (= chacun joue dans l'ordre battler).
 *  Sinon :
 *  - Check si un battler a B_ACTION_RUN → priorité absolue (= fuite immediate)
 *  - Sinon : ITEM/SWITCH first par battler order, puis MOVES par speed. */
export function SetActionsAndBattlersTurnOrder(): void {
  let turnOrderId = 0;

  if (gBattleTypeFlags & BATTLE_TYPE_SAFARI) {
    // 1:1 décomp ll. 4762-4768 : Safari = order battler natural.
    for (let active = 0; active < gBattlersCount; active++) {
      setActiveBattler(active);
      gActionsByTurnOrder[turnOrderId] = gChosenActionByBattler[active];
      gBattlerByTurnOrder[turnOrderId] = active;
      turnOrderId++;
    }
  } else {
    // 1:1 décomp ll. 4772-4795 : check si un battler veut RUN.
    if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
      for (let active = 0; active < gBattlersCount; active++) {
        setActiveBattler(active);
        if (gChosenActionByBattler[active] === B_ACTION_RUN) {
          turnOrderId = 5;
          break;
        }
      }
    } else {
      // 1:1 décomp ll. 4785-4794 : single battle = check battler 0 + 2.
      if (gChosenActionByBattler[0] === B_ACTION_RUN) {
        setActiveBattler(0);
        turnOrderId = 5;
      }
      if (gChosenActionByBattler[2] === B_ACTION_RUN) {
        setActiveBattler(2);
        turnOrderId = 5;
      }
    }

    if (turnOrderId === 5) {
      // 1:1 décomp ll. 4799-4810 : RUN priority order setup.
      gActionsByTurnOrder[0] = gChosenActionByBattler[gActiveBattler];
      gBattlerByTurnOrder[0] = gActiveBattler;
      turnOrderId = 1;
      for (let i = 0; i < gBattlersCount; i++) {
        if (i !== gActiveBattler) {
          gActionsByTurnOrder[turnOrderId] = gChosenActionByBattler[i];
          gBattlerByTurnOrder[turnOrderId] = i;
          turnOrderId++;
        }
      }
      // 1:1 décomp wire : gBattleMainFunc = CheckFocusPunch_ClearVarsBeforeTurnStarts (= K21).
      _setBattleMainFunc_CheckFocusPunch();
      gBattleStruct.focusPunchBattlerId = 0;
      return;
    } else {
      // 1:1 décomp ll. 4817-4825 : ITEM/SWITCH actions first.
      for (let active = 0; active < gBattlersCount; active++) {
        setActiveBattler(active);
        if (gChosenActionByBattler[active] === B_ACTION_USE_ITEM
            || gChosenActionByBattler[active] === B_ACTION_SWITCH) {
          gActionsByTurnOrder[turnOrderId] = gChosenActionByBattler[active];
          gBattlerByTurnOrder[turnOrderId] = active;
          turnOrderId++;
        }
      }
      // 1:1 décomp ll. 4826-4834 : non-ITEM/SWITCH actions ensuite.
      for (let active = 0; active < gBattlersCount; active++) {
        setActiveBattler(active);
        if (gChosenActionByBattler[active] !== B_ACTION_USE_ITEM
            && gChosenActionByBattler[active] !== B_ACTION_SWITCH) {
          gActionsByTurnOrder[turnOrderId] = gChosenActionByBattler[active];
          gBattlerByTurnOrder[turnOrderId] = active;
          turnOrderId++;
        }
      }
      // 1:1 décomp ll. 4835-4850 : bubble sort par speed (= GetWhoStrikesFirst).
      for (let i = 0; i < gBattlersCount - 1; i++) {
        for (let j = i + 1; j < gBattlersCount; j++) {
          const battler1 = gBattlerByTurnOrder[i];
          const battler2 = gBattlerByTurnOrder[j];
          if (gActionsByTurnOrder[i] !== B_ACTION_USE_ITEM
              && gActionsByTurnOrder[j] !== B_ACTION_USE_ITEM
              && gActionsByTurnOrder[i] !== B_ACTION_SWITCH
              && gActionsByTurnOrder[j] !== B_ACTION_SWITCH) {
            if (GetWhoStrikesFirst(battler1, battler2, false)) {
              SwapTurnOrder(i, j);
            }
          }
        }
      }
    }
  }
  // 1:1 décomp (battle_main.c, fin de SetActionsAndBattlersTurnOrder) :
  //   gBattleStruct->focusPunchBattlerId = 0;
  //   gBattleMainFunc = CheckFocusPunch_ClearVarsBeforeTurnStarts;
  // Présent sur TOUS les chemins de sortie (le early-return RUN l'appelle déjà
  // ligne ~218). SANS cet appel ici, le chemin normal (single battle / tri par
  // vitesse) laisse gBattleMainFunc figé sur SetActionsAndBattlersTurnOrder → la
  // boucle de tour ne démarre JAMAIS (= le combat reste bloqué après la sélection).
  gBattleStruct.focusPunchBattlerId = 0;
  _setBattleMainFunc_CheckFocusPunch();
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleTurnHelpers = {
  AllAtActionConfirmed, UpdateBattlerPartyOrdersOnSwitch,
  SwapTurnOrder, SwitchPartyOrder, SetActionsAndBattlersTurnOrder,
};
// ═══ SECTION battle-turn-dispatch — CONSOLIDÉE PHYSIQUEMENT (C4, 2026-06-10) ═
// 1:1 battle_main.c : sTurnActionsFuncsTable (:536) · sEndTurnFuncsTable (:554) ·
// CheckFocusPunch_ClearVarsBeforeTurnStarts (:4906) · RunTurnActionsFunctions
// (:4937) · TryCorrectShedinjaLanguage (:2645) · GetBattleWindowTemplatePixelWidth
// (:2659). L'ancien module engine/battle/battle-turn-dispatch.ts = shim re-export.
// (Déjà importés ailleurs dans ce fichier : gActiveBattler/gBattlersCount/
//  gBattleCommunication [tête] ; gBattleMons/gDisableStructs/gProtectStructs/
//  gBattleStruct [C2] ; gActionsByTurnOrder [C3].)

import {
  gBattlerAttacker, gChosenMoveByBattler,
  gHitMarker, gBattleOutcome, gCurrentTurnActionNumber,
  gCurrentActionFuncId,
  gBattleScripting,
  gDynamicBasePower,
  setBattlerAttacker,
  setHitMarker, setCurrentActionFuncId, setCurrentTurnActionNumber,
  setDynamicBasePower,
} from './engine/battle/state';
import {
  HITMARKER_RUN, HITMARKER_PASSIVE_HP_UPDATE, HITMARKER_NO_ATTACKSTRING,
  HITMARKER_UNABLE_TO_USE_MOVE,
  STATUS1_SLEEP, MOVE_FOCUS_PUNCH,
  B_ACTION_USE_MOVE,
  B_ACTION_SAFARI_WATCH_CAREFULLY, B_ACTION_SAFARI_BALL,
  B_ACTION_SAFARI_POKEBLOCK, B_ACTION_SAFARI_GO_NEAR, B_ACTION_SAFARI_RUN,
  B_ACTION_WALLY_THROW, B_ACTION_EXEC_SCRIPT, B_ACTION_TRY_FINISH,
  B_ACTION_FINISHED, B_ACTION_NOTHING_FAINTED,
  B_OUTCOME_WON, B_OUTCOME_LOST, B_OUTCOME_DREW, B_OUTCOME_RAN,
  B_OUTCOME_PLAYER_TELEPORTED, B_OUTCOME_CAUGHT, B_OUTCOME_MON_TELEPORTED,
} from './engine/battle/constants';
import {
  HandleAction_UseMove, HandleAction_UseItem, HandleAction_Switch,
  HandleAction_Run, HandleAction_RunBattleScript, HandleAction_TryFinish,
  HandleAction_ActionFinished, HandleAction_NothingIsFainted,
} from './battle_util';
// (setBattleMainFunc + HandleEndTurn_* : fonctions LOCALES section C7.)

// ─── Type pour HandleAction_* + HandleEndTurn_* ────────────────────────────

type ActionHandler = () => void;
type EndTurnHandler = () => void;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `TryClearRageStatuses()` (battle_util.c). */
function _TryClearRageStatuses(): void {
  // Dette R3 : Rage status clear cascade vers util.ts.
}

/** 1:1 décomp `BattleScriptExecute(bsPtr)` — délègue au vrai BattleScriptExecute
 *  (défini plus bas dans ce fichier, hoisting) : push gBattleMainFunc →
 *  RunBattleScriptCommands_PopCallbacksStack. (Était un stub console.warn →
 *  Focus Punch ne lançait JAMAIS son script de setup.) */
function _BattleScriptExecute_c4(label: string): void {
  BattleScriptExecute(label);
}

/** 1:1 décomp `BattleScript_FocusPunchSetUp` (battle_scripts_1.s) — label bytecode. */
const BattleScript_FocusPunchSetUp = 'BattleScript_FocusPunchSetUp';

/** 1:1 décomp `B_OUTCOME_MON_FLED` = 6. */
const B_OUTCOME_MON_FLED = 6;
/** 1:1 décomp `B_OUTCOME_NO_SAFARI_BALLS` = 8. */
const B_OUTCOME_NO_SAFARI_BALLS = 8;
/** 1:1 décomp `B_OUTCOME_FORFEITED` = 9. */
const B_OUTCOME_FORFEITED_LOCAL = 9;

// ─── sTurnActionsFuncsTable (battle_main.c:536-552) — 1:1 décomp ───────────

/** 1:1 décomp `sTurnActionsFuncsTable[]`. Per-action func dispatch.
 *  Indexé par B_ACTION_* enum. */
export const sTurnActionsFuncsTable: ActionHandler[] = [];

function _initTurnActionsFuncsTable(): void {
  sTurnActionsFuncsTable[B_ACTION_USE_MOVE] = HandleAction_UseMove;
  sTurnActionsFuncsTable[B_ACTION_USE_ITEM] = HandleAction_UseItem;
  sTurnActionsFuncsTable[B_ACTION_SWITCH] = HandleAction_Switch;
  sTurnActionsFuncsTable[B_ACTION_RUN] = HandleAction_Run;
  // [C] Dette Safari/Wally : les vrais HandleAction_WatchesCarefully / SafariZoneBallThrow /
  // ThrowPokeblock / GoNear / SafariZoneRun / WallyBallThrow ne sont pas portés → alias vers
  // HandleAction_RunBattleScript (= comportement actuel INCHANGÉ ; à porter séparément).
  sTurnActionsFuncsTable[B_ACTION_SAFARI_WATCH_CAREFULLY] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_SAFARI_BALL] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_SAFARI_POKEBLOCK] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_SAFARI_GO_NEAR] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_SAFARI_RUN] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_WALLY_THROW] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_EXEC_SCRIPT] = HandleAction_RunBattleScript;
  sTurnActionsFuncsTable[B_ACTION_TRY_FINISH] = HandleAction_TryFinish;
  sTurnActionsFuncsTable[B_ACTION_FINISHED] = HandleAction_ActionFinished;
  sTurnActionsFuncsTable[B_ACTION_NOTHING_FAINTED] = HandleAction_NothingIsFainted;
}
_initTurnActionsFuncsTable();

// ─── sEndTurnFuncsTable (battle_main.c:554-567) — 1:1 décomp ───────────────

/** 1:1 décomp `sEndTurnFuncsTable[]`. Per-outcome end-turn dispatcher. */
export const sEndTurnFuncsTable: EndTurnHandler[] = [];

function _initEndTurnFuncsTable(): void {
  sEndTurnFuncsTable[0] = HandleEndTurn_ContinueBattle;
  sEndTurnFuncsTable[B_OUTCOME_WON] = HandleEndTurn_BattleWon;
  sEndTurnFuncsTable[B_OUTCOME_LOST] = HandleEndTurn_BattleLost;
  sEndTurnFuncsTable[B_OUTCOME_DREW] = HandleEndTurn_BattleLost;
  sEndTurnFuncsTable[B_OUTCOME_RAN] = HandleEndTurn_RanFromBattle;
  sEndTurnFuncsTable[B_OUTCOME_PLAYER_TELEPORTED] = HandleEndTurn_FinishBattle;
  sEndTurnFuncsTable[B_OUTCOME_MON_FLED] = HandleEndTurn_MonFled;
  sEndTurnFuncsTable[B_OUTCOME_CAUGHT] = HandleEndTurn_FinishBattle;
  sEndTurnFuncsTable[B_OUTCOME_NO_SAFARI_BALLS] = HandleEndTurn_FinishBattle;
  sEndTurnFuncsTable[B_OUTCOME_FORFEITED_LOCAL] = HandleEndTurn_FinishBattle;
  sEndTurnFuncsTable[B_OUTCOME_MON_TELEPORTED] = HandleEndTurn_FinishBattle;
}
_initEndTurnFuncsTable();

// ─── CheckFocusPunch_ClearVarsBeforeTurnStarts (4906-4935) — 1:1 décomp ────

/** 1:1 décomp `CheckFocusPunch_ClearVarsBeforeTurnStarts()` (battle_main.c:4906-4935).
 *
 *  Iterate battlers : pour chaque battler qui a chosen MOVE_FOCUS_PUNCH +
 *  pas asleep + pas truant + has valid moves → execute BattleScript_FocusPunchSetUp.
 *  Sinon : continue itération.
 *
 *  Quand fini → clear turn vars + set gBattleMainFunc = RunTurnActionsFunctions.
 */
export function CheckFocusPunch_ClearVarsBeforeTurnStarts(): void {
  if (!(gHitMarker & HITMARKER_RUN)) {
    while (gBattleStruct.focusPunchBattlerId < gBattlersCount) {
      const id = gBattleStruct.focusPunchBattlerId;
      setActiveBattler(id);
      setBattlerAttacker(id);
      gBattleStruct.focusPunchBattlerId++;

      if (gChosenMoveByBattler[gActiveBattler] === MOVE_FOCUS_PUNCH
          && !(gBattleMons[gActiveBattler].status1 & STATUS1_SLEEP)
          && !(gDisableStructs[gBattlerAttacker].truantCounter)
          && !(gProtectStructs[gActiveBattler].noValidMoves)) {
        _BattleScriptExecute_c4(BattleScript_FocusPunchSetUp);
        return;
      }
    }
  }

  _TryClearRageStatuses();
  setCurrentTurnActionNumber(0);
  setCurrentActionFuncId(gActionsByTurnOrder[gCurrentTurnActionNumber]);
  setDynamicBasePower(0);
  gBattleStruct.dynamicMoveType = 0;

  // 1:1 décomp : gBattleMainFunc = RunTurnActionsFunctions.
  setBattleMainFunc(RunTurnActionsFunctions);

  gBattleCommunication[3] = 0;
  gBattleCommunication[4] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  // 1:1 décomp : gBattleResources->battleScriptsStack->size = 0.
  // Dette R3 : script stack tracker.
  void gDynamicBasePower;
}

// ─── RunTurnActionsFunctions (4937-4958) — 1:1 décomp ──────────────────────

/** 1:1 décomp `RunTurnActionsFunctions()` (battle_main.c:4937-4958).
 *
 *  Drive le dispatcher per-action. Si tous les battlers ont agi → switch
 *  vers sEndTurnFuncsTable[outcome]. */
export function RunTurnActionsFunctions(): void {
  if (gBattleOutcome !== 0) {
    setCurrentActionFuncId(B_ACTION_FINISHED);
  }

  gBattleStruct.savedTurnActionNumber = gCurrentTurnActionNumber;

  // 1:1 décomp : sTurnActionsFuncsTable[gCurrentActionFuncId]().
  const handler = sTurnActionsFuncsTable[gCurrentActionFuncId];
  if (handler) handler();

  if (gCurrentTurnActionNumber >= gBattlersCount) {
    // Tous battlers ont agi → end-turn dispatch.
    setHitMarker(gHitMarker & ~HITMARKER_PASSIVE_HP_UPDATE);

    // 1:1 décomp : gBattleMainFunc = sEndTurnFuncsTable[outcome & 0x7F].
    const endTurnHandler = sEndTurnFuncsTable[gBattleOutcome & 0x7F];
    // 1:1 décomp : gBattleMainFunc = sEndTurnFuncsTable[outcome & 0x7F].
    if (endTurnHandler) setBattleMainFunc(endTurnHandler);
  } else if (gBattleStruct.savedTurnActionNumber !== gCurrentTurnActionNumber) {
    // Action turn done → clear hitmarker bits pour next battler.
    setHitMarker(gHitMarker & ~HITMARKER_NO_ATTACKSTRING);
    setHitMarker(gHitMarker & ~HITMARKER_UNABLE_TO_USE_MOVE);
  }
}

// ─── TryCorrectShedinjaLanguage (2645-2657) — 1:1 décomp ───────────────────

/** 1:1 décomp `TryCorrectShedinjaLanguage(mon)` (battle_main.c:2645-2657).
 *  Edge case : Shedinja avec nickname Japonais original → set language à
 *  Japonais. Affecte la decoder qui handle nickname display proprement. */
export function TryCorrectShedinjaLanguage(_mon: unknown): void {
  // Dette R3 : GetMonData + StringCompareWithoutExtCtrlCodes + sText_ShedinjaJpnName.
  // Edge case ultra-rare ; pour notre démo Birch tutorial : pas applicable.
}

// ─── GetBattleWindowTemplatePixelWidth (2659-2662) — 1:1 décomp ────────────

/** 1:1 décomp `GetBattleWindowTemplatePixelWidth(windowsType, tableId)`
 *  (battle_main.c:2659-2662). Returns gBattleWindowTemplates[windowsType][tableId].width * 8. */
export function GetBattleWindowTemplatePixelWidth(windowsType: number, tableId: number): number {
  // Dette R3 : gBattleWindowTemplates[][] data table.
  void windowsType; void tableId;
  return 64;  // default width approximation
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleTurnDispatch = {
  sTurnActionsFuncsTable, sEndTurnFuncsTable,
  CheckFocusPunch_ClearVarsBeforeTurnStarts,
  RunTurnActionsFunctions,
  TryCorrectShedinjaLanguage,
  GetBattleWindowTemplatePixelWidth,
};
/**
 * battle/battle-action-selection.ts — Port 1:1 strict de HandleTurnActionSelectionState.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:4116-4552`
 *
 * Cette fn est le state machine principal pour la sélection des actions
 * battlers à chaque tour. ~425 lignes, 8 states + per-action branching.
 *
 * STATES enum (battle_main.c:4116-4127) :
 *   - STATE_TURN_START_RECORD       (0) : recorded battle copy moves
 *   - STATE_BEFORE_ACTION_CHOSEN    (1) : choose action (EmitChooseAction)
 *   - STATE_WAIT_ACTION_CHOSEN      (2) : process action (USE_MOVE, USE_ITEM, etc.)
 *   - STATE_WAIT_ACTION_CASE_CHOSEN (3) : process sub-action (= chosen move/item/mon)
 *   - STATE_WAIT_ACTION_CONFIRMED_STANDBY (4) : emit LinkStandbyMsg
 *   - STATE_WAIT_ACTION_CONFIRMED   (5) : confirmed counter++
 *   - STATE_SELECTION_SCRIPT        (6) : exec selection battle script
 *   - STATE_WAIT_SET_BEFORE_ACTION  (7) : return to BEFORE_ACTION_CHOSEN
 *   - STATE_SELECTION_SCRIPT_MAY_RUN (8) : selection script with FORFEIT option
 *
 * Note : cascade massive vers controller IPC + bytecode + recorded battle.
 * Le port maintient la structure state machine 1:1 strict avec dette R3
 * explicite pour les helpers cascade non-applicables à notre démo offline.
 *
 * Dépendances :
 *   - state.ts : gActiveBattler, gBattlersCount, gBattleCommunication,
 *     gBattleStruct, gBattleMons, gDisableStructs, gProtectStructs,
 *     gChosenActionByBattler, gChosenMoveByBattler, gBattleTypeFlags,
 *     gHitMarker, gBattleBufferB (= dette R3 controller IPC buffer)
 *   - constants.ts : B_ACTION_* + BATTLE_TYPE_* + STATUS2_*
 *   - util.ts : GetBattlerAtPosition, GetBattlerPosition, BATTLE_PARTNER
 *   - K17 battle-turn-helpers : AllAtActionConfirmed, UpdateBattlerPartyOrdersOnSwitch
 *   - K8 battle-main-functions : setBattleMainFunc
 */

// (Dédup C5 : gActiveBattler/gBattlersCount/gBattleCommunication/gBattleTypeFlags/
//  setActiveBattler [tête] ; gBattleStruct/gBattleMons/gDisableStructs/gProtectStructs/
//  gStatuses3 [C2] ; gChosenActionByBattler [C3] ; gChosenMoveByBattler/gHitMarker/
//  gBattlerAttacker/setBattlerAttacker/setHitMarker [C4] ; BATTLE_TYPE_LINK/MULTI/
//  FRONTIER [tête] ; BATTLE_TYPE_DOUBLE/B_ACTION_USE_ITEM/SWITCH/RUN/BATTLE_PARTNER [C3] ;
//  B_ACTION_USE_MOVE/SAFARI_×5/WALLY_THROW/NOTHING_FAINTED [C4] ; STATUS2_WRAPPED/
//  ESCAPE_PREVENTION [C2] ; GetBattlerPosition [C1].)
import {
  gLastUsedItem, gLastUsedAbility, setLastUsedItem,
  gBattleControllerExecFlags, setBattleControllerExecFlags,
} from './engine/battle/state';
import { PrepareBufferDataTransfer } from './battle_controllers';
import {
  BATTLE_TYPE_RECORDED_LINK, BATTLE_TYPE_TRAINER, BATTLE_TYPE_TRAINER_HILL,
  BATTLE_TYPE_ARENA, BATTLE_TYPE_EREADER_TRAINER, BATTLE_TYPE_PALACE,
  B_ACTION_CANCEL_PARTNER,
  STATUS2_MULTIPLETURNS, STATUS2_RECHARGE,
  STATUS3_ROOTED,
  ABILITY_SHADOW_TAG, ABILITY_ARENA_TRAP, ABILITY_LEVITATE, ABILITY_MAGNET_PULL,
  ABILITY_NONE,
  TYPE_FLYING, TYPE_STEEL,
  BIT_FLANK,
} from './engine/battle/constants';
import { GetBattlerAtPosition } from './engine/battle/util';
import { CalculatePPWithBonus, IsPlayerPartyAndPokemonStorageFull } from './engine/battle/party-storage';

// ─── STATE enum 1:1 décomp (4116-4127) ─────────────────────────────────────

export const STATE_TURN_START_RECORD = 0;
export const STATE_BEFORE_ACTION_CHOSEN = 1;
export const STATE_WAIT_ACTION_CHOSEN = 2;
export const STATE_WAIT_ACTION_CASE_CHOSEN = 3;
export const STATE_WAIT_ACTION_CONFIRMED_STANDBY = 4;
export const STATE_WAIT_ACTION_CONFIRMED = 5;
export const STATE_SELECTION_SCRIPT = 6;
export const STATE_WAIT_SET_BEFORE_ACTION = 7;
export const STATE_SELECTION_SCRIPT_MAY_RUN = 8;

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

const ACTIONS_CONFIRMED_COUNT = 4;
// (PARTY_SIZE : déjà déclaré en tête de fichier.)
// (MAX_BATTLERS_COUNT : déjà déclaré en tête de fichier.)
const MAX_MON_MOVES = 4;
const B_FLANK_LEFT = 0;
const B_COMM_TO_CONTROLLER = 0;

// PARTY_ACTION_* constants (= constants/party_menu.h).
const PARTY_ACTION_CHOOSE_MON = 0;
// AUDIT FIX (audit-inline-battle-constants) : valeurs party_menu.h = 2 et 4 (étaient 4 et 5)
// → l'écran party recevait le mauvais code d'action au refus de switch (piégeage/blocage).
const PARTY_ACTION_CANT_SWITCH = 2;
const PARTY_ACTION_ABILITY_PREVENTS = 4;

// LINK_STANDBY_MSG_* constants.
const LINK_STANDBY_MSG_STOP_BOUNCE = 0;
const LINK_STANDBY_STOP_BOUNCE_ONLY = 1;

// BATTLE_TYPE_FRONTIER_NO_PYRAMID (battle.h:92) = TOWER|DOME|PALACE|ARENA|FACTORY|PIKE.
// AUDIT FIX : était `1 << 11` (un seul bit faux) → mask Frontier incorrect. = 2031872.
const BATTLE_TYPE_FRONTIER_NO_PYRAMID =
  (1 << 8) | (1 << 16) | (1 << 17) | (1 << 18) | (1 << 19) | (1 << 20);
// (BATTLE_TYPE_INGAME_PARTNER : déjà déclaré en tête de fichier.)

// CONTROLLER_* opcodes (battle_controllers.h) — pour les emits engine→controller
// (= bufferA[0]). Lus par PlayerBufferRunCommand → sPlayerBufferCommands[opcode].
const CONTROLLER_CHOOSEACTION = 0x12;
const CONTROLLER_CHOOSEMOVE = 0x14;
const CONTROLLER_OPENBAG = 0x15;
const CONTROLLER_CHOOSEPOKEMON = 0x16;
const CONTROLLER_LINKSTANDBYMSG = 0x35;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

// 1:1 décomp `gBitTable[i]` → consolidé sur le miroir `src/game/util.ts` (source unique).
import { gBitTable as _gBitTable } from '../include/util';

/** 1:1 décomp `gBattleBufferB[battler][i]` controller IPC buffer.
 *  Pour notre port : lazy globalThis lookup (= dette R3 complete buffer). */
function _getBattleBufferB(battler: number, offset: number): number {
  const stateMod = (globalThis as { __battleState?: { gBattleBufferB?: Uint8Array[] } }).__battleState;
  return stateMod?.gBattleBufferB?.[battler]?.[offset] ?? 0;
}

function _setBattleBufferB(battler: number, offset: number, value: number): void {
  const stateMod = (globalThis as { __battleState?: { gBattleBufferB?: Uint8Array[] } }).__battleState;
  const buf = stateMod?.gBattleBufferB?.[battler];
  if (buf) buf[offset] = value;
}

/** 1:1 décomp `gSelectionBattleScripts[battler]`. */
const gSelectionBattleScripts: number[] = [0, 0, 0, 0];

/** Wire vers l'interpréteur de battle-script (globalThis, évite le cycle ESM
 *  battle-action-selection ↔ script-interpreter ↔ battle-script-commands). */
function _scriptInterp() {
  return (globalThis as { __scriptInterp?: { stepBattleScriptCommand: (ctx: { scriptPtr: number }) => void; gBattleScriptContext: { scriptPtr: number }; getBattleScriptOffset: (label: string) => number } }).__scriptInterp;
}
/** 1:1 décomp `gBattlescriptCurrInstr` = `gBattleScriptContext.scriptPtr` de l'interpréteur
 *  (le selection-script tourne sur le MÊME ptr que le tour, exactement comme le décomp ;
 *  le tour repose le ptr via HandleAction_UseMove ensuite → 0 corruption). */
function _setBattlescriptCurrInstr(v: number): void { const si = _scriptInterp(); if (si) si.gBattleScriptContext.scriptPtr = v; }
function _getBattlescriptCurrInstr(): number { const si = _scriptInterp(); return si ? si.gBattleScriptContext.scriptPtr : 0; }
/** Résout un label de battle-script en offset bytecode (via l'interpréteur). */
function _getBattleScriptOffset(label: string): number { const si = _scriptInterp(); return si ? si.getBattleScriptOffset(label) : -1; }

/** 1:1 décomp `RecordedBattle_CopyBattlerMoves()`. */
function _RecordedBattle_CopyBattlerMoves(): void {
  // Dette R3 : recorded battle moves copy.
}

/** 1:1 décomp `RecordedBattle_SetBattlerAction(battler, action)`. */
function _RecordedBattle_SetBattlerAction(_battler: number, _action: number): void {
  // Dette R3.
}

/** 1:1 décomp `RecordedBattle_ClearBattlerAction(battler, count)`. */
function _RecordedBattle_ClearBattlerAction(_battler: number, _count: number): void {
  // Dette R3.
}

/** 1:1 décomp `RecordedBattle_CheckMovesetChanges(mode)`. */
function _RecordedBattle_CheckMovesetChanges(_mode: number): void {
  // Dette R3.
}

/** 1:1 décomp `BtlController_EmitChooseAction(buf, action, itemId)`
 *  (battle_controllers.c:1199) : écrit bufferA[0..3] = CHOOSEACTION/action/itemId.
 *  → PlayerBufferRunCommand dispatch PlayerHandleChooseAction (installe le menu
 *  + l'input handler). */
function _BtlController_EmitChooseAction(buf: number, action: number, itemId: number): void {
  PrepareBufferDataTransfer(buf,
    new Uint8Array([CONTROLLER_CHOOSEACTION, action, itemId & 0xFF, (itemId >> 8) & 0xFF]), 4);
}

/** 1:1 décomp `BtlController_EmitChooseMove(buf, isDouble, NoPpNumber, movePpData)`
 *  (battle_controllers.c:1219). Écrit bufferA[0..3]=CHOOSEMOVE+flags PUIS sérialise
 *  le `ChooseMoveStruct` byte-par-byte à partir de bufferA[4] (= `for i<sizeof :
 *  buffer[4+i]=((u8*)movePpData)[i]`).
 *
 *  Layout ChooseMoveStruct (battle.h) : moves[4] u16 @0 ; currentPp[4] u8 @8 ;
 *  maxPp[4] u8 @12 ; species u16 @16 ; monType1/monType2 u8 @18/19. Dans bufferA,
 *  tout est décalé de +4 (l'en-tête opcode).
 *
 *  CRITIQUE — ce buffer N'EST PAS optionnel : `OpponentHandleChooseMove` (branche
 *  wild) ET `_readChooseMoveStruct` (player) LISENT les moves depuis bufferA[4..].
 *  Sans sérialisation, moves[]=0 → le `do { } while (move == MOVE_NONE)` du random
 *  pick wild boucle À L'INFINI (gel). (L'ancien raccourci « opcode seul » = bug.) */
function _BtlController_EmitChooseMove(
  buf: number, isDouble: boolean, noPp: boolean,
  moveInfo: { species: number; monTypes: number[]; moves: number[]; currentPp: number[]; maxPp: number[] },
): void {
  const data = new Uint8Array(4 + 20);
  data[0] = CONTROLLER_CHOOSEMOVE;
  data[1] = isDouble ? 1 : 0;
  data[2] = noPp ? 1 : 0;
  data[3] = 0;
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const mv = moveInfo.moves[i] ?? 0;
    data[4 + i * 2] = mv & 0xFF;             // moves[i] lo   (@4,6,8,10)
    data[5 + i * 2] = (mv >> 8) & 0xFF;      // moves[i] hi
    data[12 + i] = (moveInfo.currentPp[i] ?? 0) & 0xFF;  // currentPp[i] (@12..15)
    data[16 + i] = (moveInfo.maxPp[i] ?? 0) & 0xFF;      // maxPp[i]     (@16..19)
  }
  const sp = moveInfo.species ?? 0;
  data[20] = sp & 0xFF;                       // species lo  (@20)
  data[21] = (sp >> 8) & 0xFF;                // species hi  (@21)
  data[22] = (moveInfo.monTypes[0] ?? 0) & 0xFF;  // monType1 (@22)
  data[23] = (moveInfo.monTypes[1] ?? 0) & 0xFF;  // monType2 (@23)
  PrepareBufferDataTransfer(buf, data, data.length);
}

/** 1:1 décomp `BtlController_EmitChooseItem(buf, battlePartyOrder)`
 *  (battle_controllers.c:1232-1240) : écrit gBattleBufferA[active] = [OPENBAG,
 *  partyOrder[0..2]] (4 bytes). INDISPENSABLE : sans ça (ancien stub vide), le
 *  `_MarkBattlerForControllerExec` qui suit re-dispatchait le bufferA[0] PÉRIMÉ →
 *  PlayerHandleChooseItem jamais appelé → bag jamais ouvert → SOFT-LOCK à
 *  STATE_WAIT_ACTION_CASE_CHOSEN (= SAC, MÊME bug que le switch loop #9). */
function _BtlController_EmitChooseItem(buf: number, partyOrder: number[]): void {
  const data = new Uint8Array(4);
  data[0] = CONTROLLER_OPENBAG;
  for (let i = 0; i < 3; i++) data[1 + i] = (partyOrder[i] ?? 0) & 0xFF;
  PrepareBufferDataTransfer(buf, data, 4);
}

/** 1:1 décomp `BtlController_EmitChoosePokemon(buf, caseId, slotId, abilityId, data)`
 *  (battle_controllers.c:1242-1253) : écrit gBattleBufferA[active] = [CHOOSEPOKEMON,
 *  caseId, slotId, abilityId, data[0..2]] (8 bytes). INDISPENSABLE : sans ça (ancien
 *  stub vide), le `_MarkBattlerForControllerExec` qui suit (l.515) re-dispatchait le
 *  bufferA[0] PÉRIMÉ → PlayerHandleChoosePokemon JAMAIS appelé → party menu jamais
 *  ouvert → SOFT-LOCK à STATE_WAIT_ACTION_CASE_CHOSEN (= bug switch volontaire loop #8/9).
 *  MÊME classe que le fix _BtlController_EmitLinkStandbyMsg ci-dessous. */
function _BtlController_EmitChoosePokemon(
  buf: number, caseId: number, mon: number, ability: number, partyOrder: number[],
): void {
  const data = new Uint8Array(8);
  data[0] = CONTROLLER_CHOOSEPOKEMON;
  data[1] = caseId & 0xFF;
  data[2] = mon & 0xFF;
  data[3] = ability & 0xFF;
  for (let i = 0; i < 3; i++) data[4 + i] = (partyOrder[i] ?? 0) & 0xFF;
  PrepareBufferDataTransfer(buf, data, 8);
}

/** 1:1 décomp `BtlController_EmitLinkStandbyMsg(buf, mode, record)`
 *  (battle_controllers.c) : écrit bufferA[0]=LINKSTANDBYMSG + mode → le controller
 *  dispatch PlayerHandleLinkStandbyMsg/OpponentHandleLinkStandbyMsg (qui complètent
 *  immédiatement hors-link).
 *
 *  CRITIQUE — STATE_WAIT_ACTION_CONFIRMED_STANDBY appelle MarkBattlerForControllerExec
 *  (arme l'exec flag) JUSTE APRÈS cet emit. Si l'emit n'écrit PAS un nouvel opcode
 *  (ancien stub noop), le controller re-lit l'ANCIEN bufferA[0] (= CHOOSEMOVE) → le
 *  menu de moves se ré-ouvre en boucle, le battler ne CONFIRME jamais →
 *  ACTIONS_CONFIRMED_COUNT bloqué < gBattlersCount → le tour ne démarre jamais. */
function _BtlController_EmitLinkStandbyMsg(buf: number, mode: number, frame: boolean): void {
  PrepareBufferDataTransfer(buf,
    new Uint8Array([CONTROLLER_LINKSTANDBYMSG, mode & 0xFF, frame ? 1 : 0, 0]), 4);
}

/** 1:1 décomp `BtlController_EmitEndBounceEffect(buf)`. */
function _BtlController_EmitEndBounceEffect(_buf: number): void {
  // Dette R3.
}

/** 1:1 décomp `MarkBattlerForControllerExec(battler)` (battle_util.c) : set le bit
 *  battler dans gBattleControllerExecFlags → le controller s'exécute au prochain
 *  tick de BattleMainCB1. */
function _MarkBattlerForControllerExec(battler: number): void {
  setBattleControllerExecFlags(gBattleControllerExecFlags | _gBitTable[battler]);
}

/** 1:1 décomp `IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(battler)`
 *  (battle.h) : le controller est ENCORE actif tant que son exec flag est set.
 *  La sélection d'action gate dessus (`if (!...) proceed`) → attend que le
 *  controller (= input joueur) ait fini. (Avant : `return false` = auto-confirme
 *  sans jamais attendre l'input → BUG non-1:1.) */
function _IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(battler: number): boolean {
  return (gBattleControllerExecFlags & _gBitTable[battler]) !== 0;
}

/** Délègue au canonique 1:1 `AreAllMovesUnusable` (battle_util, qui appelle le vrai
 *  `CheckMoveLimitations` : PP/Disable/Torment/Taunt/Imprison/Encore/Choice).
 *  AUDIT FIX : l'ancien stub `return false` empêchait la détection « tous les moves
 *  inutilisables » → la branche Struggle/no-moves-left de HandleTurnActionSelectionState
 *  ne se déclenchait jamais (combats longs, tous les PP à 0). `setActiveBattler(active)`
 *  est posé en tête de boucle → `gActiveBattler` correct au point d'appel. */
function _AreAllMovesUnusable(): boolean {
  return AreAllMovesUnusable();
}

/** 1:1 décomp `TrySetCantSelectMoveBattleScript()`. */
function _TrySetCantSelectMoveBattleScript(): boolean {
  return false;
}

/** Délègue au canonique 1:1 `CalculatePPWithBonus` (party-storage). Source unique
 *  de la formule (basePP + basePP*20*nbPPUp/100, basePP=gBattleMoves[move].pp).
 *  Nom local conservé pour les call-sites (maxPp du menu de moves). */
function _CalculatePPWithBonus(move: number, ppBonuses: number, idx: number): number {
  return CalculatePPWithBonus(move, ppBonuses, idx);
}

/** 1:1 décomp macro `ABILITY_ON_OPPOSING_FIELD(battler, ability)` (battle_util.h:36) =
 *  `AbilityBattleEffects(ABILITYEFFECT_CHECK_OTHER_SIDE, battler, ability, 0, 0)`. AUDIT FIX :
 *  l'ancien stub `return 0` désactivait les capacités de piégeage (Shadow Tag/Arena Trap) → le
 *  joueur pouvait toujours changer/fuir. Route vers le vrai AbilityBattleEffects (case CHECK = pur). */
function _ABILITY_ON_OPPOSING_FIELD(battler: number, ability: number): number {
  return AbilityBattleEffects(12 /* ABILITYEFFECT_CHECK_OTHER_SIDE */, battler, ability, 0, 0);
}

/** Délègue au vrai `AbilityBattleEffects` (battle_util, importé). AUDIT FIX : l'ancien stub
 *  `return 0` cassait le check Magnet Pull (CHECK_FIELD_EXCEPT_BATTLER) du switch. Seuls usages =
 *  cases CHECK purs (requêtes sans effet de bord). */
function _AbilityBattleEffects(effect: number, battler: number, ability: number, special: number, moveArg: number): number {
  return AbilityBattleEffects(effect, battler, ability, special, moveArg);
}

/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)`. */
function _IS_BATTLER_OF_TYPE(battler: number, type: number): boolean {
  const mon = gBattleMons[battler];
  return mon.type1 === type || mon.type2 === type;
}

/** 1:1 décomp `IsRunningFromBattleImpossible()` (= K14b wire). */
function _IsRunningFromBattleImpossible(): number {
  // Wire vers try-run-from-battle.ts (= K14b).
  const m = (globalThis as { IsRunningFromBattleImpossible?: () => number }).IsRunningFromBattleImpossible;
  return m?.() ?? 0;
}

/** 1:1 décomp `BATTLE_RUN_SUCCESS` = 0. */
const BATTLE_RUN_SUCCESS = 0;

/** 1:1 décomp `BattleScriptExecute(label)` : démarre un battle-script IMBRIQUÉ via le
 *  callback stack (push gBattleMainFunc → RunBattleScriptCommands_PopCallbacksStack →
 *  step jusqu'à end2 → pop → reprend HandleTurnActionSelectionState). Wire vers
 *  battle-main-functions (globalThis, évite le cycle ESM). Mécanisme déjà validé (fin
 *  de combat). Utilisé ici pour PrintCantRunFromTrainer (« Pas question de fuir! »). */
function _BattleScriptExecute(label: string): void {
  const bmf = (globalThis as { __battleMainFunctions?: { BattleScriptExecute?: (label: string) => void } }).__battleMainFunctions;
  if (bmf?.BattleScriptExecute) bmf.BattleScriptExecute(label);
}

/** 1:1 décomp `gBattleScriptingCommandsTable[*gBattlescriptCurrInstr]()` : exécute UNE
 *  commande du selection-script via l'interpréteur (sur gBattleScriptContext, dont
 *  scriptPtr a été posé par _setBattlescriptCurrInstr). Print-only + endselectionscript
 *  → pas de Cmd_end/B_ACTION_TRY_FINISH, ctx du tour non corrompu. */
function _runBattleScriptingCommand(_opcode: number): void {
  const si = _scriptInterp();
  if (si) si.stepBattleScriptCommand(si.gBattleScriptContext);
}

/** 1:1 décomp `SwitchPartyOrderInGameMulti(battler, monIdx)`. */
function _SwitchPartyOrderInGameMulti(_battler: number, _monIdx: number): void {
  // Dette R3 : ingame multi party order swap.
}

/** 1:1 décomp `gBattlePalaceMoveSelectionRngValue` + `gRngValue`. */
let _gBattlePalaceMoveSelectionRngValue = 0;
let _gRngValue = 0;
function _setRngValue(v: number): void { _gRngValue = v; }

// BattleScript_* offsets résolus lazily via _getBattleScriptOffset(label) au point
// d'usage (le wire interpréteur n'est posé qu'au runtime, pas à l'import).

/** Wire vers K17 helpers. */
function _AllAtActionConfirmed(): boolean {
  const m = (globalThis as Record<string, unknown>).__battleTurnHelpers as {
    AllAtActionConfirmed?: () => boolean;
  } | undefined;
  return m?.AllAtActionConfirmed?.() ?? false;
}

function _UpdateBattlerPartyOrdersOnSwitch(): void {
  const m = (globalThis as Record<string, unknown>).__battleTurnHelpers as {
    UpdateBattlerPartyOrdersOnSwitch?: () => void;
  } | undefined;
  m?.UpdateBattlerPartyOrdersOnSwitch?.();
}

/** Wire vers K17 SetActionsAndBattlersTurnOrder. */
function _SetActionsAndBattlersTurnOrder(): void {
  const m = (globalThis as Record<string, unknown>).__battleTurnHelpers as {
    SetActionsAndBattlersTurnOrder?: () => void;
  } | undefined;
  m?.SetActionsAndBattlersTurnOrder?.();
}

/** Wire vers K8 setBattleMainFunc. */
function _setBattleMainFunc(fn: () => void): void {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setBattleMainFunc?: (fn: () => void) => void;
  } | undefined;
  m?.setBattleMainFunc?.(fn);
}

// ─── HandleTurnActionSelectionState (battle_main.c:4129-4552) ──────────────

/** 1:1 décomp `HandleTurnActionSelectionState()` (battle_main.c:4129-4552).
 *  State machine principal pour sélection des actions battlers à chaque tour.
 *
 *  Iterate battlers + dispatch sur gBattleCommunication[battler] state.
 *  Final check : si tous battlers confirmé → SetActionsAndBattlersTurnOrder. */
export function HandleTurnActionSelectionState(): void {
  let i: number;

  gBattleCommunication[ACTIONS_CONFIRMED_COUNT] = 0;

  for (let active = 0; active < gBattlersCount; active++) {
    setActiveBattler(active);
    const position = GetBattlerPosition(active);

    switch (gBattleCommunication[active]) {
      case STATE_TURN_START_RECORD:
        // 1:1 décomp ll. 4139-4142.
        _RecordedBattle_CopyBattlerMoves();
        gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
        break;

      case STATE_BEFORE_ACTION_CHOSEN:
        // 1:1 décomp ll. 4143-4174.
        gBattleStruct.monToSwitchIntoId[active] = PARTY_SIZE;

        if ((gBattleTypeFlags & BATTLE_TYPE_MULTI)
            || (position & BIT_FLANK) === B_FLANK_LEFT
            || (gBattleStruct.absentBattlerFlags & _gBitTable[GetBattlerAtPosition(BATTLE_PARTNER(position))])
            || gBattleCommunication[GetBattlerAtPosition(BATTLE_PARTNER(position))] === STATE_WAIT_ACTION_CONFIRMED) {

          if (gBattleStruct.absentBattlerFlags & _gBitTable[active]) {
            gChosenActionByBattler[active] = B_ACTION_NOTHING_FAINTED;
            if (!(gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
              gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED;
            } else {
              gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
            }
          } else {
            if ((gBattleMons[active].status2 & STATUS2_MULTIPLETURNS)
                || (gBattleMons[active].status2 & STATUS2_RECHARGE)) {
              gChosenActionByBattler[active] = B_ACTION_USE_MOVE;
              gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
            } else {
              _BtlController_EmitChooseAction(B_COMM_TO_CONTROLLER, gChosenActionByBattler[0],
                _getBattleBufferB(0, 1) | (_getBattleBufferB(0, 2) << 8));
              _MarkBattlerForControllerExec(active);
              gBattleCommunication[active]++;
            }
          }
        }
        break;

      case STATE_WAIT_ACTION_CHOSEN:
        // 1:1 décomp ll. 4175-4353.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          _RecordedBattle_SetBattlerAction(active, _getBattleBufferB(active, 1));
          gChosenActionByBattler[active] = _getBattleBufferB(active, 1);

          const chosenAction = _getBattleBufferB(active, 1);

          if (chosenAction === B_ACTION_USE_MOVE) {
            // 1:1 décomp ll. 4183-4220.
            if (_AreAllMovesUnusable()) {
              gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
              gBattleStruct.selectionScriptFinished[active] = 0;  // FALSE
              gBattleStruct.stateIdAfterSelScript[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
              gBattleStruct.moveTarget[active] = _getBattleBufferB(active, 3);
              return;
            } else if (gDisableStructs[active].encoredMove !== 0) {
              gChosenMoveByBattler[active] = gDisableStructs[active].encoredMove;
              gBattleStruct.chosenMovePositions[active] = gDisableStructs[active].encoredMovePos;
              gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
              return;
            } else {
              // 1:1 décomp ll. 4199-4218 : ChooseMoveStruct moveInfo populate + Emit.
              const moveInfo = {
                species: gBattleMons[active].species,
                monTypes: [gBattleMons[active].type1, gBattleMons[active].type2],
                moves: [0, 0, 0, 0] as number[],
                currentPp: [0, 0, 0, 0] as number[],
                maxPp: [0, 0, 0, 0] as number[],
              };
              for (i = 0; i < MAX_MON_MOVES; i++) {
                moveInfo.moves[i] = gBattleMons[active].moves[i];
                moveInfo.currentPp[i] = gBattleMons[active].pp[i];
                moveInfo.maxPp[i] = _CalculatePPWithBonus(
                  gBattleMons[active].moves[i],
                  gBattleMons[active].ppBonuses,
                  i,
                );
              }

              _BtlController_EmitChooseMove(B_COMM_TO_CONTROLLER,
                (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0, false, moveInfo);
              _MarkBattlerForControllerExec(active);
            }
          } else if (chosenAction === B_ACTION_USE_ITEM) {
            // 1:1 décomp ll. 4221-4239 : item use check link/frontier restriction.
            if (gBattleTypeFlags & (BATTLE_TYPE_LINK
                                    | BATTLE_TYPE_FRONTIER_NO_PYRAMID
                                    | BATTLE_TYPE_EREADER_TRAINER
                                    | BATTLE_TYPE_RECORDED_LINK)) {
              _RecordedBattle_ClearBattlerAction(active, 1);
              gSelectionBattleScripts[active] = _getBattleScriptOffset('BattleScript_ActionSelectionItemsCantBeUsed');
              gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
              gBattleStruct.selectionScriptFinished[active] = 0;
              gBattleStruct.stateIdAfterSelScript[active] = STATE_BEFORE_ACTION_CHOSEN;
              return;
            } else {
              _BtlController_EmitChooseItem(B_COMM_TO_CONTROLLER, gBattleStruct.battlerPartyOrders[active]);
              _MarkBattlerForControllerExec(active);
            }
          } else if (chosenAction === B_ACTION_SWITCH) {
            // 1:1 décomp ll. 4240-4267 : switch ability check (Shadow Tag/Arena Trap/Magnet Pull).
            gBattleStruct.battlerPartyIndexes[active] = active /* gBattlerPartyIndexes[active] */;

            if ((gBattleMons[active].status2 & (STATUS2_WRAPPED | STATUS2_ESCAPE_PREVENTION))
                || (gBattleTypeFlags & BATTLE_TYPE_ARENA)
                || (gStatuses3[active] & STATUS3_ROOTED)) {
              _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER, PARTY_ACTION_CANT_SWITCH,
                PARTY_SIZE, ABILITY_NONE, gBattleStruct.battlerPartyOrders[active]);
            } else if ((i = _ABILITY_ON_OPPOSING_FIELD(active, ABILITY_SHADOW_TAG))
                       || ((i = _ABILITY_ON_OPPOSING_FIELD(active, ABILITY_ARENA_TRAP))
                           && !_IS_BATTLER_OF_TYPE(active, TYPE_FLYING)
                           && gBattleMons[active].ability !== ABILITY_LEVITATE)
                       || ((i = _AbilityBattleEffects(15 /* ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER */,
                                                      active, ABILITY_MAGNET_PULL, 0, 0))
                           && _IS_BATTLER_OF_TYPE(active, TYPE_STEEL))) {
              _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER,
                ((i - 1) << 4) | PARTY_ACTION_ABILITY_PREVENTS,
                PARTY_SIZE, gLastUsedAbility, gBattleStruct.battlerPartyOrders[active]);
            } else {
              // 1:1 décomp ll. 4258-4264 : double battle partner switch coordination.
              if (active === 2 && gChosenActionByBattler[0] === B_ACTION_SWITCH) {
                _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER, PARTY_ACTION_CHOOSE_MON,
                  gBattleStruct.monToSwitchIntoId[0], ABILITY_NONE, gBattleStruct.battlerPartyOrders[active]);
              } else if (active === 3 && gChosenActionByBattler[1] === B_ACTION_SWITCH) {
                _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER, PARTY_ACTION_CHOOSE_MON,
                  gBattleStruct.monToSwitchIntoId[1], ABILITY_NONE, gBattleStruct.battlerPartyOrders[active]);
              } else {
                _BtlController_EmitChoosePokemon(B_COMM_TO_CONTROLLER, PARTY_ACTION_CHOOSE_MON,
                  PARTY_SIZE, ABILITY_NONE, gBattleStruct.battlerPartyOrders[active]);
              }
            }
            _MarkBattlerForControllerExec(active);
          } else if (chosenAction === B_ACTION_SAFARI_BALL) {
            // 1:1 décomp ll. 4268-4277.
            if (IsPlayerPartyAndPokemonStorageFull()) {
              gSelectionBattleScripts[active] = _getBattleScriptOffset('BattleScript_PrintFullBox');
              gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
              gBattleStruct.selectionScriptFinished[active] = 0;
              gBattleStruct.stateIdAfterSelScript[active] = STATE_BEFORE_ACTION_CHOSEN;
              return;
            }
          } else if (chosenAction === B_ACTION_SAFARI_POKEBLOCK) {
            _BtlController_EmitChooseItem(B_COMM_TO_CONTROLLER, gBattleStruct.battlerPartyOrders[active]);
            _MarkBattlerForControllerExec(active);
          } else if (chosenAction === B_ACTION_CANCEL_PARTNER) {
            // 1:1 décomp ll. 4282-4320 : cancel partner action.
            const partner = GetBattlerAtPosition(BATTLE_PARTNER(position));
            gBattleCommunication[active] = STATE_WAIT_SET_BEFORE_ACTION;
            gBattleCommunication[partner] = STATE_BEFORE_ACTION_CHOSEN;
            _RecordedBattle_ClearBattlerAction(active, 1);

            if ((gBattleMons[partner].status2 & STATUS2_MULTIPLETURNS)
                || (gBattleMons[partner].status2 & STATUS2_RECHARGE)) {
              _BtlController_EmitEndBounceEffect(B_COMM_TO_CONTROLLER);
              _MarkBattlerForControllerExec(active);
              return;
            } else if (gChosenActionByBattler[partner] === B_ACTION_SWITCH) {
              _RecordedBattle_ClearBattlerAction(partner, 2);
            } else if (gChosenActionByBattler[partner] === B_ACTION_RUN) {
              _RecordedBattle_ClearBattlerAction(partner, 1);
            } else if (gChosenActionByBattler[partner] === B_ACTION_USE_MOVE
                       && (gProtectStructs[partner].noValidMoves
                           || gDisableStructs[partner].encoredMove)) {
              _RecordedBattle_ClearBattlerAction(partner, 1);
            } else if ((gBattleTypeFlags & BATTLE_TYPE_PALACE)
                       && gChosenActionByBattler[partner] === B_ACTION_USE_MOVE) {
              _setRngValue(_gBattlePalaceMoveSelectionRngValue);
              _RecordedBattle_ClearBattlerAction(partner, 1);
            } else {
              _RecordedBattle_ClearBattlerAction(partner, 3);
            }
            _BtlController_EmitEndBounceEffect(B_COMM_TO_CONTROLLER);
            _MarkBattlerForControllerExec(active);
            return;
          }

          // 1:1 décomp ll. 4322-4351 : trainer flee block + IsRunningFromBattleImpossible.
          if ((gBattleTypeFlags & BATTLE_TYPE_TRAINER)
              && (gBattleTypeFlags & (BATTLE_TYPE_FRONTIER | BATTLE_TYPE_TRAINER_HILL))
              && _getBattleBufferB(active, 1) === B_ACTION_RUN) {
            gSelectionBattleScripts[active] = _getBattleScriptOffset('BattleScript_AskIfWantsToForfeitMatch');
            gBattleCommunication[active] = STATE_SELECTION_SCRIPT_MAY_RUN;
            gBattleStruct.selectionScriptFinished[active] = 0;
            gBattleStruct.stateIdAfterSelScript[active] = STATE_BEFORE_ACTION_CHOSEN;
            return;
          } else if ((gBattleTypeFlags & BATTLE_TYPE_TRAINER)
                     && !(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))
                     && _getBattleBufferB(active, 1) === B_ACTION_RUN) {
            _BattleScriptExecute('BattleScript_PrintCantRunFromTrainer');
            gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
          } else if (_IsRunningFromBattleImpossible() !== BATTLE_RUN_SUCCESS
                     && _getBattleBufferB(active, 1) === B_ACTION_RUN) {
            gSelectionBattleScripts[active] = _getBattleScriptOffset('BattleScript_PrintCantEscapeFromBattle');
            gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
            gBattleStruct.selectionScriptFinished[active] = 0;
            gBattleStruct.stateIdAfterSelScript[active] = STATE_BEFORE_ACTION_CHOSEN;
            return;
          } else {
            gBattleCommunication[active]++;
          }
        }
        break;

      case STATE_WAIT_ACTION_CASE_CHOSEN:
        // 1:1 décomp ll. 4354-4457 : per-action sub-state processing.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          const chosen = gChosenActionByBattler[active];

          if (chosen === B_ACTION_USE_MOVE) {
            const subAction = _getBattleBufferB(active, 1);
            // 1:1 décomp ll. 4360-4404.
            if (subAction >= 3 && subAction <= 9) {
              gChosenActionByBattler[active] = subAction;
              return;
            } else if (subAction === 15) {
              gChosenActionByBattler[active] = B_ACTION_SWITCH;
              _UpdateBattlerPartyOrdersOnSwitch();
              return;
            } else {
              _RecordedBattle_CheckMovesetChanges(1 /* B_RECORD_MODE_PLAYBACK */);
              const moveValue = _getBattleBufferB(active, 2) | (_getBattleBufferB(active, 3) << 8);
              if (moveValue === 0xFFFF) {
                gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
                _RecordedBattle_ClearBattlerAction(active, 1);
              } else if (_TrySetCantSelectMoveBattleScript()) {
                _RecordedBattle_ClearBattlerAction(active, 1);
                gBattleCommunication[active] = STATE_SELECTION_SCRIPT;
                gBattleStruct.selectionScriptFinished[active] = 0;
                _setBattleBufferB(active, 1, B_ACTION_USE_MOVE);
                gBattleStruct.stateIdAfterSelScript[active] = STATE_WAIT_ACTION_CHOSEN;
                return;
              } else {
                if (!(gBattleTypeFlags & BATTLE_TYPE_PALACE)) {
                  _RecordedBattle_SetBattlerAction(active, _getBattleBufferB(active, 2));
                  _RecordedBattle_SetBattlerAction(active, _getBattleBufferB(active, 3));
                }
                gBattleStruct.chosenMovePositions[active] = _getBattleBufferB(active, 2);
                gChosenMoveByBattler[active] = gBattleMons[active].moves[gBattleStruct.chosenMovePositions[active]];
                gBattleStruct.moveTarget[active] = _getBattleBufferB(active, 3);
                gBattleCommunication[active]++;
              }
            }
          } else if (chosen === B_ACTION_USE_ITEM) {
            const itemValue = _getBattleBufferB(active, 1) | (_getBattleBufferB(active, 2) << 8);
            if (itemValue === 0) {
              gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
            } else {
              setLastUsedItem(itemValue);
              gBattleCommunication[active]++;
            }
          } else if (chosen === B_ACTION_SWITCH) {
            if (_getBattleBufferB(active, 1) === PARTY_SIZE) {
              gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
              _RecordedBattle_ClearBattlerAction(active, 1);
            } else {
              _UpdateBattlerPartyOrdersOnSwitch();
              gBattleCommunication[active]++;
            }
          } else if (chosen === B_ACTION_RUN) {
            setHitMarker(gHitMarker | HITMARKER_RUN);
            gBattleCommunication[active]++;
          } else if (chosen === B_ACTION_SAFARI_WATCH_CAREFULLY
                     || chosen === B_ACTION_SAFARI_BALL
                     || chosen === B_ACTION_SAFARI_GO_NEAR
                     || chosen === B_ACTION_WALLY_THROW) {
            gBattleCommunication[active]++;
          } else if (chosen === B_ACTION_SAFARI_POKEBLOCK) {
            const pokeblockValue = _getBattleBufferB(active, 1) | (_getBattleBufferB(active, 2) << 8);
            if (pokeblockValue !== 0) {
              gBattleCommunication[active]++;
            } else {
              gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
            }
          } else if (chosen === B_ACTION_SAFARI_RUN) {
            setHitMarker(gHitMarker | HITMARKER_RUN);
            gBattleCommunication[active]++;
          }
        }
        break;

      case STATE_WAIT_ACTION_CONFIRMED_STANDBY:
        // 1:1 décomp ll. 4458-4479.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          const allConfirmed = _AllAtActionConfirmed();
          if (((gBattleTypeFlags & BATTLE_TYPE_MULTI) || !(gBattleTypeFlags & BATTLE_TYPE_DOUBLE))
              || (position & BIT_FLANK) !== B_FLANK_LEFT
              || (gBattleStruct.absentBattlerFlags & _gBitTable[GetBattlerAtPosition(BATTLE_PARTNER(position))])) {
            _BtlController_EmitLinkStandbyMsg(B_COMM_TO_CONTROLLER, LINK_STANDBY_MSG_STOP_BOUNCE, allConfirmed);
          } else {
            _BtlController_EmitLinkStandbyMsg(B_COMM_TO_CONTROLLER, LINK_STANDBY_STOP_BOUNCE_ONLY, allConfirmed);
          }
          _MarkBattlerForControllerExec(active);
          gBattleCommunication[active]++;
        }
        break;

      case STATE_WAIT_ACTION_CONFIRMED:
        // 1:1 décomp ll. 4480-4485.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          gBattleCommunication[ACTIONS_CONFIRMED_COUNT]++;
        }
        break;

      case STATE_SELECTION_SCRIPT:
        // 1:1 décomp ll. 4486-4501.
        if (gBattleStruct.selectionScriptFinished[active]) {
          gBattleCommunication[active] = gBattleStruct.stateIdAfterSelScript[active];
        } else {
          setBattlerAttacker(active);
          _setBattlescriptCurrInstr(gSelectionBattleScripts[active]);
          if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
            _runBattleScriptingCommand(_getBattlescriptCurrInstr());
          }
          gSelectionBattleScripts[active] = _getBattlescriptCurrInstr();
        }
        break;

      case STATE_WAIT_SET_BEFORE_ACTION:
        // 1:1 décomp ll. 4502-4507.
        if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
          gBattleCommunication[active] = STATE_BEFORE_ACTION_CHOSEN;
        }
        break;

      case STATE_SELECTION_SCRIPT_MAY_RUN:
        // 1:1 décomp ll. 4508-4533.
        if (gBattleStruct.selectionScriptFinished[active]) {
          if (_getBattleBufferB(active, 1) === B_ACTION_NOTHING_FAINTED) {
            setHitMarker(gHitMarker | HITMARKER_RUN);
            gChosenActionByBattler[active] = B_ACTION_RUN;
            gBattleCommunication[active] = STATE_WAIT_ACTION_CONFIRMED_STANDBY;
          } else {
            _RecordedBattle_ClearBattlerAction(active, 1);
            gBattleCommunication[active] = gBattleStruct.stateIdAfterSelScript[active];
          }
        } else {
          setBattlerAttacker(active);
          _setBattlescriptCurrInstr(gSelectionBattleScripts[active]);
          if (!_IS_BATTLE_CONTROLLER_ACTIVE_OR_PENDING_SYNC_ANYWHERE(active)) {
            _runBattleScriptingCommand(_getBattlescriptCurrInstr());
          }
          gSelectionBattleScripts[active] = _getBattlescriptCurrInstr();
        }
        break;
    }
  }

  // 1:1 décomp ll. 4537-4551 : check si tous battlers ont confirmé.
  if (gBattleCommunication[ACTIONS_CONFIRMED_COUNT] === gBattlersCount) {
    _RecordedBattle_CheckMovesetChanges(0 /* B_RECORD_MODE_RECORDING */);
    _setBattleMainFunc(_SetActionsAndBattlersTurnOrder);

    if (gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER) {
      for (i = 0; i < gBattlersCount; i++) {
        if (gChosenActionByBattler[i] === B_ACTION_SWITCH) {
          _SwitchPartyOrderInGameMulti(i, gBattleStruct.monToSwitchIntoId[i]);
        }
      }
    }
  }

  // Suppress unused refs (= imports utilisés indirectement).
  void gActiveBattler; void gBattlerAttacker; void gLastUsedItem;
  void MAX_BATTLERS_COUNT;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleActionSelection = {
  HandleTurnActionSelectionState,
  STATE_TURN_START_RECORD, STATE_BEFORE_ACTION_CHOSEN, STATE_WAIT_ACTION_CHOSEN,
  STATE_WAIT_ACTION_CASE_CHOSEN, STATE_WAIT_ACTION_CONFIRMED_STANDBY,
  STATE_WAIT_ACTION_CONFIRMED, STATE_SELECTION_SCRIPT,
  STATE_WAIT_SET_BEFORE_ACTION, STATE_SELECTION_SCRIPT_MAY_RUN,
};
/**
 * battle/battle-sprite-callbacks.ts — Port 1:1 strict des sprite callbacks
 * battle_main.c.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:2667-3006`
 *
 * Callbacks portés 1:1 :
 *   - SpriteCB_WildMon (2667-2672) — entry wild mon spawn
 *   - SpriteCB_MoveWildMonToRight (2674-2684) — slide x2 +2 jusqu'à 0
 *   - SpriteCB_WildMonShowHealthbox (2686-2696) — anim ended → healthbox slide
 *   - SpriteCB_WildMonAnimate (2698-2704) — battle animate front sprite
 *   - SpriteCB_Flicker (2721-2736) — 6 flickers post-spawn
 *   - SpriteCB_ShowAsMoveTarget (2814-2819) — entry target highlight
 *   - SpriteCB_BlinkVisible (2821-2828) — toggle invisible
 *   - SpriteCB_HideAsMoveTarget (2830-2835) — restore invisible
 *   - SpriteCB_OpponentMonFromBall (2837-2848) — affine end → animate
 *   - SpriteCB_BattleSpriteStartSlideLeft (2851-2854) — set slide cb
 *   - SpriteCB_BattleSpriteSlideLeft (2856-2867) — slide x2 -2 jusqu'à 0
 *   - SpriteCB_Idle (2874-2876) — empty
 *   - DoBounceEffect (2899-2938) — start sin/cos bounce
 *   - EndBounceEffect (2940-2965) — stop bounce + reset
 *   - SpriteCB_BounceEffect (2967-2979) — tick sin index
 *   - SpriteCB_PlayerMonFromBall (2987-2991) — affine end → back sprite anim
 *   - SpriteCB_TrainerThrowObject (3002-3005) — start throw anim
 *   - SpriteCB_TrainerThrowObject_Main (2993-2998) — main loop throw
 *   - AnimSetCenterToCornerVecX (3008+) — sprite corner offset
 *   - SpriteCallbackDummy_2 (2706-2709) — empty
 *
 * Dépendances :
 *   - decomp-globals.ts : getRuntime, BeginNormalPaletteFade
 *   - state.ts : gBattleTypeFlags, gHitMarker
 *   - battle-faint-anim.ts : SpriteCB_FaintOpponent (port K13)
 *   - battle-vblank-helpers.ts : gIntroSlideFlags state
 *
 * Note : sprite types adapted pour notre runtime DecompSprite (= compat
 * struct C minimal). Les fields gSprites[id].data[0..7] sont les 8 task data
 * 16-bit du décomp.
 */

// ═══ SECTION battle-sprite-callbacks — CONSOLIDÉE PHYSIQUEMENT (C6, 2026-06-10) ═
// 1:1 battle_main.c : ~20 SpriteCB du combat (WildMon slide/healthbox/animate,
// Flicker, Show/HideAsMoveTarget, OpponentMonFromBall/PlayerMonFromBall,
// BattleSpriteSlideLeft, Idle, TrainerThrowObject, Do/EndBounceEffect +
// SpriteCB_BounceEffect, AnimSetCenterToCornerVecX, SpriteCallbackDummy_2).
// L'ancien module engine/battle/battle-sprite-callbacks.ts = shim re-export.
// (getRuntime/gBattleTypeFlags [tête], gHitMarker [C4], BATTLE_TYPE_LINK [tête],
//  BATTLE_TYPE_RECORDED_LINK [C5] : déjà importés. ⚠️ SPRITE_DATA_BATTLER/SPECIES
//  de CETTE section = slots 0/2 (≠ section C1 faint : 5/7) → suffixe _CB6.)

import { gSineTable } from '../harness/runtime/decomp-helpers';
import { HITMARKER_NO_ANIMATIONS } from './engine/battle/constants';

// ─── Sprite type minimal compat décomp ─────────────────────────────────────

interface BattleSprite {
  x: number; y: number;
  x2: number; y2: number;
  data: number[];
  invisible: boolean;
  animEnded?: boolean;
  affineAnimEnded?: boolean;
  callback?: ((sprite: BattleSprite) => void) | null;
}

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `#define sBattler data[0]` (battle_main.c:2664). */
const SPRITE_DATA_BATTLER_CB6 = 0;

/** 1:1 décomp `#define sSpeciesId data[2]` (battle_main.c:2665). */
const SPRITE_DATA_SPECIES_CB6 = 2;

/** 1:1 décomp `sNumFlickers` = sprite->data[3], `sDelay` = sprite->data[4]. */
const SPRITE_DATA_NUM_FLICKERS = 3;
const SPRITE_DATA_DELAY = 4;

/** 1:1 décomp DoBounceEffect data fields. */
const SPRITE_DATA_SIN_INDEX = 0;
const SPRITE_DATA_DELTA = 1;
const SPRITE_DATA_AMPLITUDE = 2;
const SPRITE_DATA_BOUNCER_SPRITE_ID = 3;
const SPRITE_DATA_WHICH = 4;

/** 1:1 décomp BOUNCE_HEALTHBOX = 0, BOUNCE_MON = 1. */
export const BOUNCE_HEALTHBOX = 0;
export const BOUNCE_MON = 1;

/** 1:1 décomp `sFlickerArray[1]` (battle_main.c local static). */
const sFlickerArray: number[] = [0];

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `gIntroSlideFlags` shared state. */
function _getIntroSlideFlags(): number {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    getIntroSlideFlags?: () => number;
  } | undefined;
  return m?.getIntroSlideFlags?.() ?? 0;
}

/** 1:1 décomp `gBattleSpritesDataPtr->healthBoxesData[battler]`. */
interface HealthBoxData {
  healthboxIsBouncing: number;
  battlerIsBouncing: number;
  healthboxBounceSpriteId: number;
  battlerBounceSpriteId: number;
}
function _getHealthBoxData(battler: number): HealthBoxData | null {
  // 1:1 `&gBattleSpritesDataPtr->healthBoxesData[battler]` (sous-ensemble bounce) via le backing
  // battle-sprites-data (objet MUTABLE par battler, lazy lookup globalThis = cycle-safe). Sans ca
  // (null), DoBounceEffect n'etait PAS idempotent -> creait un bouncer/frame = fuite + pas de bob.
  const m = (globalThis as { __battleSpritesData?: { getHealthBoxBounceData?: (b: number) => HealthBoxData | null } }).__battleSpritesData;
  return m?.getHealthBoxBounceData?.(battler) ?? null;
}

/** 1:1 décomp `gHealthboxSpriteIds[battler]`. Branché au registre healthbox voie-L
 *  (battle-healthbox-l.ts) via globalThis (cycle-safe, = pattern _getIntroSlideFlags). */
function _getHealthboxSpriteId(battler: number): number {
  const hb = (globalThis as Record<string, unknown>).__battleHealthbox as {
    gHealthboxSpriteIds?: number[];
  } | undefined;
  return hb?.gHealthboxSpriteIds?.[battler] ?? -1;
}

/** 1:1 décomp `gBattlerSpriteIds[battler]`. Branché au registre voie-L des sprites mon
 *  (battle-controller-opponent.getBattlerMonSpriteId) via globalThis (cycle-safe : opponent.ts
 *  importe deja battle-sprite-callbacks). Sans ca (-1), le bouncer MON n'etait jamais resolu. */
function _getBattlerSpriteId(battler: number): number {
  const m = (globalThis as { __battleControllerOpponent?: { getBattlerMonSpriteId?: (b: number) => number } }).__battleControllerOpponent;
  return m?.getBattlerMonSpriteId?.(battler) ?? -1;
}

/** 1:1 décomp `StartHealthboxSlideIn(battler)` (pokeball.c:1241). Branché à l'impl
 *  voie-L (battle-healthbox-l.ts) via globalThis (cycle-safe). */
function _StartHealthboxSlideIn(battler: number): void {
  const hb = (globalThis as Record<string, unknown>).__battleHealthbox as {
    StartHealthboxSlideIn?: (b: number) => void;
  } | undefined;
  hb?.StartHealthboxSlideIn?.(battler);
}

/** 1:1 décomp `SetHealthboxSpriteVisible(spriteId)` (battle_interface.c:1031). */
function _SetHealthboxSpriteVisible(spriteId: number): void {
  const hb = (globalThis as Record<string, unknown>).__battleHealthbox as {
    SetHealthboxSpriteVisible?: (id: number) => void;
  } | undefined;
  hb?.SetHealthboxSpriteVisible?.(spriteId);
}

/** 1:1 décomp `StartSpriteAnim(sprite, animNum)` / `StartSpriteAnimIfDifferent`. */
function _StartSpriteAnim(sprite: BattleSprite, animNum: number): void {
  // 1:1 décomp StartSpriteAnim(sprite, animNum) pour les sprites MON : la table
  // d'anims species (front_pic_anims, `monFrontAnimTable`) est enregistrée à la
  // création (battle_controller_opponent) → route vers le système d'anims runtime.
  const rt = getRuntime();
  const s = sprite as unknown as { spriteId?: number; tileBase?: number; monFrontAnimTable?: string };
  if (rt && s.monFrontAnimTable && s.spriteId !== undefined) {
    // CONVERGENCE 1:1 : sprite.anims (inline) au lieu de spriteAnimStates (legacy). Modèle sheet :
    // le front-pic 2-frames est chargé contigu à tileBase (cf. battle_controller_opponent twoFrames)
    // → oam.tileId = tileBase + f*64, identique au legacy. (Déviation pré-existante : usingSheet sur
    // un sprite CreateSpriteInline ; le vrai 1:1 décomp = frame-images dynamiques, rework gfx à part.)
    setSpriteAnims(rt, s.spriteId, s.monFrontAnimTable, animNum, s.tileBase ?? 0);
  }
}

function _StartSpriteAnimIfDifferent(sprite: BattleSprite, animNum: number): void {
  // 1:1 décomp : only restart if animNum != current. Pour now : noop.
  void sprite; void animNum;
}

/** 1:1 décomp `BattleAnimateFrontSprite(sprite, species, noCry, panMode)`
 *  (pokemon.c:6771) → `DoMonFrontSpriteAnimation` (:6779) : joue le CRI du mon
 *  (PlayCry_Normal(species, pan) — pan ±25 = dette mécanisme cri) + si
 *  HasTwoFramesAnimation : StartSpriteAnim(sprite, 1) = l'alternance 2-frames
 *  EXACTE du species (front_pic_anims.h, enregistrée à la création du sprite
 *  sous `monFrontAnimTable`) + callback → SpriteCallbackDummy_2 (one-shot :
 *  SpriteCB_WildMonAnimate/OpponentMonFromBall ne re-déclenchent plus).
 *  Dette doc : l'anim de MOUVEMENT (sMonFrontAnimIdsTable → pokemon_animation.c,
 *  bounce/shake par species — cf. pokemon-anims.json déjà extrait) = chantier dédié. */
let _shinyTriedThisBattle = false;
export function resetShinyTried(): void { _shinyTriedThisBattle = false; }
function _BattleAnimateFrontSprite(sprite: BattleSprite, species: number, noCry: boolean, _panMode: number): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1-net (goal T5, timing user « les etoiles arrivent DES l'apparition ») :
  // TryShinyAnimation au moment de l'apparition du FRONT adverse (decomp :
  // Intro_TryShinyAnimShowHealthbox, battle_controller_opponent.c). Le PID
  // check decide ; idempotent via le flag tried interne.
  {
    const shiny = (globalThis as Record<string, unknown>).__battleAnimThrowShiny as {
      TryShinyAnimation?: (b: number, m: { otId?: number; personality?: number } | null) => boolean;
      _tried?: Record<number, boolean>;
    } | undefined;
    const bs = (globalThis as Record<string, unknown>).__battleState as { gBattleMons?: Array<{ otId?: number; personality?: number }> } | undefined;
    const party = (globalThis as Record<string, unknown>).__gEnemyParty as Array<{ otId?: number; personality?: number }> | undefined;
    const mon = party?.[0] ?? bs?.gBattleMons?.[1] ?? null;
    if (shiny?.TryShinyAnimation && !_shinyTriedThisBattle) {
      _shinyTriedThisBattle = true;
      shiny.TryShinyAnimation(1, mon);
    }
  }
  // 1:1 :6796-6800 : PlayCry_Normal(species, pan) — le cri du mon à l'apparition.
  if (!noCry && species) {
    const nm = reverseDecompConstant(species, 'SPECIES_');
    if (nm) void import('../harness/m4a/music').then(({ playCry }) => playCry(nm)).catch(() => { /* asset */ });
  }
  // 1:1 :6798-6799 : HasTwoFramesAnimation → StartSpriteAnim(sprite, 1).
  const s = sprite as unknown as { spriteId?: number; tileBase?: number; monFrontAnimTable?: string; callback: unknown };
  if (!noCry && _HasTwoFramesAnimation(species) && s.monFrontAnimTable && s.spriteId !== undefined) {
    // CONVERGENCE 1:1 : sprite.anims (inline) — cf. _StartSpriteAnim. anim 1 = séquence 2-frames.
    setSpriteAnims(rt, s.spriteId, s.monFrontAnimTable, 1, s.tileBase ?? 0);
  }
  // 1:1 :6809-6821 : l'anim de MOUVEMENT (sMonFrontAnimIdsTable + delay table
  // -> Task_AnimateAfterDelay -> LaunchAnimationTaskForFrontSprite). Data =
  // pokemon-anims.json {frontAnimId, delay} ; miroir game/pokemon_animation.ts.
  // ⚠️ 1:1 : ce bloc est HORS du gate `!noCry` dans la décomp (seuls le CRI et
  // l'anim 2-frames y sont) — l'ancien gate `!noCry` supprimait la « respiration »
  // du mon adverse en combat DRESSEUR (noCry=true car le cri vient de la cry-task
  // de la ball) : bug user 2026-06-12. Seul SKIP_FRONT_ANIM (0x80, posé par
  // BattleAnimateFrontSprite :6773 quand HITMARKER_NO_ANIMATIONS) la saute.
  const skipFrontAnim = (_panMode & 0x80) !== 0
    || ((gHitMarker & HITMARKER_NO_ANIMATIONS) !== 0
        && !(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)));
  if (!skipFrontAnim && species) {
    const nm2 = reverseDecompConstant(species, 'SPECIES_');
    const sid2 = s.spriteId;
    if (nm2 && sid2 !== undefined) {
      void _ensureMonMoveAnims().then((tbl) => {
        const e = tbl[nm2];
        if (!e || !e.frontAnimId) return;
        const launch = (): void => {
          const pa = (globalThis as Record<string, unknown>).__pokemonAnimation as {
            LaunchAnimationTaskForFrontSprite?: (id: number, anim: string) => void;
          } | undefined;
          pa?.LaunchAnimationTaskForFrontSprite?.(sid2, e.frontAnimId);
        };
        const rt3 = getRuntime();
        if (e.delay && rt3) {
          // 1:1 Task_AnimateAfterDelay : attend delay frames puis lance.
          const taskId = rt3.CreateTask((task: { data: number[]; taskId: number }) => {
            if (++task.data[0] >= e.delay) { launch(); rt3.DestroyTask(task.taskId); }
          }, 0);
          void taskId;
        } else {
          launch();
        }
      });
    }
  }
  // 1:1 :6816 : sprite->callback = SpriteCallbackDummy_2 (fin du trigger).
  s.callback = SpriteCallbackDummy_2;
}

/** 1:1 décomp `BattleAnimateBackSprite(sprite, species)` (pokemon.c:6821) :
 *  les backs émeraude = 1 frame (pas d'anim) ; l'anim de mouvement = chantier
 *  pokemon_animation (dette doc, comme le front). */
function _BattleAnimateBackSprite(_sprite: BattleSprite, _species: number): void {
  // (anim mouvement back = chantier pokemon_animation.)
}

/** Data pokemon-anims.json (gMonFrontAnimIdsTable + sMonAnimationDelayTable
 *  extraits) — fetch lazy module-cache. */
let _monMoveAnimsCache: Record<string, { frontAnimId: string; delay: number }> | null = null;
async function _ensureMonMoveAnims(): Promise<Record<string, { frontAnimId: string; delay: number }>> {
  if (_monMoveAnimsCache) return _monMoveAnimsCache;
  try {
    const r = await fetch('/decomp/em/pokemon-anims.json');
    _monMoveAnimsCache = r.ok ? (await r.json() as Record<string, { frontAnimId: string; delay: number }>) : {};
  } catch { _monMoveAnimsCache = {}; }
  return _monMoveAnimsCache;
}

/** 1:1 décomp `bool8 HasTwoFramesAnimation(u16 species)` (pokemon.c:6843) :
 *  TRUE sauf CASTFORM / DEOXYS / SPINDA / UNOWN (frames spéciales). Résolution
 *  par NOM (ids internes émeraude non contigus). */
function _HasTwoFramesAnimation(species: number): boolean {
  const nm = reverseDecompConstant(species, 'SPECIES_');
  return nm !== 'SPECIES_CASTFORM' && nm !== 'SPECIES_DEOXYS'
      && nm !== 'SPECIES_SPINDA' && nm !== 'SPECIES_UNOWN';
}

// (_BeginNormalPaletteFade : déjà défini en tête de fichier, corps identique.)

/** 1:1 décomp `gPaletteFade.active`. */
function _isPaletteFadeActive(): boolean {
  return getRuntime()?.gPaletteFade?.active ?? false;
}

/** 1:1 décomp `Sin(index, amplitude)` (math_util.c:18) = `(gSineTable[index] * amplitude) >> 8`.
 *  gSineTable est une FONCTION dans notre port (decomp-helpers). 1:1 strict (plus de Math.sin). */
function _Sin(index: number, amplitude: number): number {
  return (gSineTable(index & 0xFF) * amplitude) >> 8;
}

/** 1:1 décomp `CreateInvisibleSpriteWithCallback(cb)` (util.c) :
 *  ```c
 *  u8 sprite = CreateSprite(&sInvisibleSpriteTemplate, DISPLAY_WIDTH+8, DISPLAY_HEIGHT+8, 14);
 *  gSprites[sprite].invisible = TRUE; gSprites[sprite].callback = callback; return sprite;
 *  ```
 *  Cree un sprite "ticker" hors-ecran (rendu nul), ticke chaque frame par AnimateSprites
 *  (runSpriteCallbacks). Sert de moteur a SpriteCB_BounceEffect (bob du mon/healthbox).
 *  Sans ca (-1), aucun ticker -> SpriteCB_BounceEffect ne tournait jamais = pas de bob. */
function _CreateInvisibleSpriteWithCallback(cb: (sprite: BattleSprite) => void): number {
  const rt = getRuntime();
  if (!rt) return -1;
  // sInvisibleSpriteTemplate = dummy (tileTag TAG_NONE) ; on alloue le slot via CreateSpriteAtOam
  // (data Int16Array(16) + ajout a gSprites) puis invisible+callback (1:1 util.c).
  const created = rt.CreateSpriteAtOam({
    tileId: 0, paletteBank: 0,
    x: 248 /* DISPLAY_WIDTH+8 */, y: 168 /* DISPLAY_HEIGHT+8 */,
    shape: 0, size: 0, priority: 0, subpriority: 14,
  });
  const id = created.spriteId;
  if (id < 0 || id >= 64) return -1;
  const s = rt.gSprites[id];
  if (s) {
    s.invisible = true;
    (s as { callback: unknown }).callback = cb;
  }
  return id;
}

/** 1:1 décomp `DestroySprite(sprite)` (sprite.c) : libere le slot gSprites + l'OAM. */
function _DestroySprite(sprite: BattleSprite): void {
  const rt = getRuntime();
  const id = (sprite as { spriteId?: number }).spriteId;
  if (rt && typeof id === 'number') _DestroySpriteImpl(id);
  else sprite.callback = null;
}

/** 1:1 décomp `AnimSetCenterToCornerVecX(sprite)` (battle_anim_mons.c:3008+).
 *  Calcule sprite corner offset depuis size pour OAM. */
export function AnimSetCenterToCornerVecX(_sprite: BattleSprite): void {
  // Dette R3 : full size lookup via sprite.oam shape/size.
}

// ─── Sprite callbacks 1:1 strict ───────────────────────────────────────────

/** 1:1 décomp `SpriteCallbackDummy_2(sprite)` (battle_main.c:2706-2709). */
export function SpriteCallbackDummy_2(_sprite: BattleSprite): void {
  // Empty function 1:1.
}

/** 1:1 décomp `SpriteCB_WildMon(sprite)` (battle_main.c:2667-2672).
 *  Entry callback wild mon spawn : start slide-to-right + dim palette fade. */
export function SpriteCB_WildMon(sprite: BattleSprite): void {
  sprite.callback = SpriteCB_MoveWildMonToRight;
  _StartSpriteAnimIfDifferent(sprite, 0);
  // 1:1 décomp : 0x20000 = palettes bit pour mon OBJ palette (= bit 17).
  // RGB(8,8,8) = couleur de dim grise.
  _BeginNormalPaletteFade(0x20000, 0, 10, 10, (8 | (8 << 5) | (8 << 10)));
}

/** 1:1 décomp `SpriteCB_MoveWildMonToRight(sprite)` (battle_main.c:2674-2684). */
export function SpriteCB_MoveWildMonToRight(sprite: BattleSprite): void {
  if ((_getIntroSlideFlags() & 1) === 0) {
    sprite.x2 += 2;
    if (sprite.x2 === 0) {
      sprite.callback = SpriteCB_WildMonShowHealthbox;
    }
  }
}

/** 1:1 décomp `SpriteCB_WildMonShowHealthbox(sprite)` (battle_main.c:2686-2696). */
export function SpriteCB_WildMonShowHealthbox(sprite: BattleSprite): void {
  if (sprite.animEnded) {
    const battler = sprite.data[SPRITE_DATA_BATTLER_CB6] ?? 0;
    _StartHealthboxSlideIn(battler);
    _SetHealthboxSpriteVisible(_getHealthboxSpriteId(battler));
    sprite.callback = SpriteCB_WildMonAnimate;
    _StartSpriteAnimIfDifferent(sprite, 0);
    // Fade out dim palette (= return to normal).
    _BeginNormalPaletteFade(0x20000, 0, 10, 0, (8 | (8 << 5) | (8 << 10)));
  }
}

/** 1:1 décomp `SpriteCB_WildMonAnimate(sprite)` (battle_main.c:2698-2704). */
export function SpriteCB_WildMonAnimate(sprite: BattleSprite): void {
  if (!_isPaletteFadeActive()) {
    const species = sprite.data[SPRITE_DATA_SPECIES_CB6] ?? 0;
    _BattleAnimateFrontSprite(sprite, species, false, 1);
  }
}

/** 1:1 décomp `SpriteCB_Flicker(sprite)` (battle_main.c:2721-2736). */
export function SpriteCB_Flicker(sprite: BattleSprite): void {
  sprite.data[SPRITE_DATA_DELAY]--;
  if (sprite.data[SPRITE_DATA_DELAY] === 0) {
    sprite.data[SPRITE_DATA_DELAY] = 8;
    sprite.invisible = !sprite.invisible;
    sprite.data[SPRITE_DATA_NUM_FLICKERS]--;
    if (sprite.data[SPRITE_DATA_NUM_FLICKERS] === 0) {
      sprite.invisible = false;
      sprite.callback = SpriteCallbackDummy_2;
      sFlickerArray[0] = 0;
    }
  }
}

/** 1:1 décomp `SpriteCB_ShowAsMoveTarget(sprite)` (battle_main.c:2814-2819). */
export function SpriteCB_ShowAsMoveTarget(sprite: BattleSprite): void {
  sprite.data[3] = 8;
  sprite.data[4] = sprite.invisible ? 1 : 0;
  sprite.callback = SpriteCB_BlinkVisible;
}

/** 1:1 décomp `SpriteCB_BlinkVisible(sprite)` (battle_main.c:2821-2828). */
export function SpriteCB_BlinkVisible(sprite: BattleSprite): void {
  sprite.data[3]--;
  if (sprite.data[3] === 0) {
    sprite.invisible = !sprite.invisible;
    sprite.data[3] = 8;
  }
}

/** 1:1 décomp `SpriteCB_HideAsMoveTarget(sprite)` (battle_main.c:2830-2835). */
export function SpriteCB_HideAsMoveTarget(sprite: BattleSprite): void {
  sprite.invisible = sprite.data[4] !== 0;
  sprite.data[4] = 0;  // FALSE
  sprite.callback = SpriteCallbackDummy_2;
}

/** 1:1 décomp `SpriteCB_OpponentMonFromBall(sprite)` (battle_main.c:2837-2848). */
export function SpriteCB_OpponentMonFromBall(sprite: BattleSprite): void {
  if (sprite.affineAnimEnded) {
    if (!(gHitMarker & HITMARKER_NO_ANIMATIONS)
        || (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))) {
      const species = sprite.data[SPRITE_DATA_SPECIES_CB6] ?? 0;
      if (_HasTwoFramesAnimation(species)) {
        _StartSpriteAnim(sprite, 1);
      }
    }
    const species = sprite.data[SPRITE_DATA_SPECIES_CB6] ?? 0;
    _BattleAnimateFrontSprite(sprite, species, true, 1);
  }
}

/** 1:1 décomp `SpriteCB_BattleSpriteStartSlideLeft(sprite)` (battle_main.c:2851-2854). */
export function SpriteCB_BattleSpriteStartSlideLeft(sprite: BattleSprite): void {
  sprite.callback = SpriteCB_BattleSpriteSlideLeft;
}

/** 1:1 décomp `SpriteCB_BattleSpriteSlideLeft(sprite)` (battle_main.c:2856-2867). */
export function SpriteCB_BattleSpriteSlideLeft(sprite: BattleSprite): void {
  if (!(_getIntroSlideFlags() & 1)) {
    sprite.x2 -= 2;
    if (sprite.x2 === 0) {
      sprite.callback = SpriteCB_Idle;
      sprite.data[1] = 0;
    }
  }
}

/** 1:1 décomp `SpriteCB_Idle(sprite)` (battle_main.c:2874-2876). */
export function SpriteCB_Idle(_sprite: BattleSprite): void {
  // Empty function 1:1.
}

/** 1:1 décomp `SpriteCB_PlayerMonFromBall(sprite)` (battle_main.c:2987-2991). */
export function SpriteCB_PlayerMonFromBall(sprite: BattleSprite): void {
  if (sprite.affineAnimEnded) {
    const species = sprite.data[SPRITE_DATA_SPECIES_CB6] ?? 0;
    _BattleAnimateBackSprite(sprite, species);
  }
}

/** 1:1 décomp `SpriteCB_TrainerThrowObject_Main(sprite)` (battle_main.c:2993-2998). */
export function SpriteCB_TrainerThrowObject_Main(sprite: BattleSprite): void {
  AnimSetCenterToCornerVecX(sprite);
  if (sprite.animEnded) {
    sprite.callback = SpriteCB_Idle;
  }
}

/** 1:1 décomp `SpriteCB_TrainerThrowObject(sprite)` (battle_main.c:3002-3005). */
export function SpriteCB_TrainerThrowObject(sprite: BattleSprite): void {
  _StartSpriteAnim(sprite, 1);
  sprite.callback = SpriteCB_TrainerThrowObject_Main;
}

// ─── DoBounceEffect / EndBounceEffect (battle_main.c:2899-2965) ────────────

/** 1:1 décomp `DoBounceEffect(battler, which, delta, amplitude)`
 *  (battle_main.c:2899-2938). Start bouncing effect sur healthbox ou mon. */
export function DoBounceEffect(battler: number, which: number, delta: number, amplitude: number): void {
  const hbData = _getHealthBoxData(battler);
  if (hbData) {
    if (which === BOUNCE_HEALTHBOX) {
      if (hbData.healthboxIsBouncing) return;
    } else if (which === BOUNCE_MON) {
      if (hbData.battlerIsBouncing) return;
    }
  }

  const invisibleSpriteId = _CreateInvisibleSpriteWithCallback(SpriteCB_BounceEffect);
  let bouncerSpriteId: number;

  if (which === BOUNCE_HEALTHBOX) {
    bouncerSpriteId = _getHealthboxSpriteId(battler);
    if (hbData) {
      hbData.healthboxBounceSpriteId = invisibleSpriteId;
      hbData.healthboxIsBouncing = 1;
    }
    // sSinIndex = 128 (= half period).
    _setBounceData(invisibleSpriteId, SPRITE_DATA_SIN_INDEX, 128);
  } else {
    bouncerSpriteId = _getBattlerSpriteId(battler);
    if (hbData) {
      hbData.battlerBounceSpriteId = invisibleSpriteId;
      hbData.battlerIsBouncing = 1;
    }
    // sSinIndex = 192 (= -1 effective).
    _setBounceData(invisibleSpriteId, SPRITE_DATA_SIN_INDEX, 192);
  }

  _setBounceData(invisibleSpriteId, SPRITE_DATA_DELTA, delta);
  _setBounceData(invisibleSpriteId, SPRITE_DATA_AMPLITUDE, amplitude);
  _setBounceData(invisibleSpriteId, SPRITE_DATA_BOUNCER_SPRITE_ID, bouncerSpriteId);
  _setBounceData(invisibleSpriteId, SPRITE_DATA_WHICH, which);

  // Reset bouncer sprite offset.
  const rt = getRuntime();
  const bouncer = rt?.gSprites?.[bouncerSpriteId];
  if (bouncer) {
    bouncer.x2 = 0;
    bouncer.y2 = 0;
  }
}

function _setBounceData(spriteId: number, field: number, value: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[spriteId];
  if (sprite) sprite.data[field] = value;
}

/** 1:1 décomp `EndBounceEffect(battler, which)` (battle_main.c:2940-2965). */
export function EndBounceEffect(battler: number, which: number): void {
  const hbData = _getHealthBoxData(battler);
  if (!hbData) return;

  let bouncerSpriteId: number;
  const rt = getRuntime();

  if (which === BOUNCE_HEALTHBOX) {
    if (!hbData.healthboxIsBouncing) return;
    const invisibleSprite = rt?.gSprites?.[hbData.healthboxBounceSpriteId];
    bouncerSpriteId = (invisibleSprite?.data[SPRITE_DATA_BOUNCER_SPRITE_ID] ?? 0);
    if (invisibleSprite) _DestroySprite(invisibleSprite as never);
    hbData.healthboxIsBouncing = 0;
  } else {
    if (!hbData.battlerIsBouncing) return;
    const invisibleSprite = rt?.gSprites?.[hbData.battlerBounceSpriteId];
    bouncerSpriteId = (invisibleSprite?.data[SPRITE_DATA_BOUNCER_SPRITE_ID] ?? 0);
    if (invisibleSprite) _DestroySprite(invisibleSprite as never);
    hbData.battlerIsBouncing = 0;
  }

  const bouncer = rt?.gSprites?.[bouncerSpriteId];
  if (bouncer) {
    bouncer.x2 = 0;
    bouncer.y2 = 0;
  }
}

/** 1:1 décomp `SpriteCB_BounceEffect(sprite)` (battle_main.c:2967-2979). */
export function SpriteCB_BounceEffect(sprite: BattleSprite): void {
  const bouncerSpriteId = sprite.data[SPRITE_DATA_BOUNCER_SPRITE_ID];
  const index = sprite.data[SPRITE_DATA_SIN_INDEX];
  const amplitude = sprite.data[SPRITE_DATA_AMPLITUDE];

  const rt = getRuntime();
  const bouncer = rt?.gSprites?.[bouncerSpriteId];
  if (bouncer) {
    bouncer.y2 = _Sin(index, amplitude) + amplitude;
    // Le healthbox = 3 sprites (MAIN + OTHER + BAR). OTHER/BAR mirrorent MAIN.y2 via
    // SpriteCB_HealthBoxOther/SpriteCB_HealthBar, MAIS leurs callbacks tournent AVANT ce ticker
    // (ids plus bas) -> ils copient la valeur de la frame N-1 = la boite se dechire 1px d'1 frame
    // a chaque changement de y2 (invisible sur GBA, visible sur le rendu web net ; mesure :
    // 3 frames desync/60). On pre-synchronise les sous-sprites lies ICI (OTHER=MAIN.data[7],
    // BAR=MAIN.data[5], cf CreateBattlerHealthboxSprites) -> les 3 parts partagent le meme y2 a
    // la frame de rendu. Strictement gate sur BOUNCE_HEALTHBOX (le bounce MON = 1 seul sprite).
    // (Fix 1:1-PUR = aligner l'ordre de creation des sprites pour que le ticker tombe sur un slot
    // < healthbox comme dans la decomp -> structurel, a faire a la migration src/game/.)
    if (sprite.data[SPRITE_DATA_WHICH] === BOUNCE_HEALTHBOX && bouncer.data) {
      const other = rt?.gSprites?.[bouncer.data[7] | 0];
      const bar = rt?.gSprites?.[bouncer.data[5] | 0];
      if (other) other.y2 = bouncer.y2;
      if (bar) bar.y2 = bouncer.y2;
    }
  }
  sprite.data[SPRITE_DATA_SIN_INDEX] = (sprite.data[SPRITE_DATA_SIN_INDEX] + sprite.data[SPRITE_DATA_DELTA]) & 0xFF;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleSpriteCallbacks = {
  SpriteCB_WildMon, SpriteCB_MoveWildMonToRight, SpriteCB_WildMonShowHealthbox,
  SpriteCB_WildMonAnimate, SpriteCB_Flicker,
  SpriteCB_ShowAsMoveTarget, SpriteCB_BlinkVisible, SpriteCB_HideAsMoveTarget,
  SpriteCB_OpponentMonFromBall, SpriteCB_BattleSpriteStartSlideLeft,
  SpriteCB_BattleSpriteSlideLeft, SpriteCB_Idle,
  SpriteCB_PlayerMonFromBall, SpriteCB_TrainerThrowObject,
  SpriteCB_TrainerThrowObject_Main, SpriteCallbackDummy_2,
  AnimSetCenterToCornerVecX,
  DoBounceEffect, EndBounceEffect, SpriteCB_BounceEffect,
  BOUNCE_HEALTHBOX, BOUNCE_MON,
};
/**
 * battle/battle-main-functions.ts — Port 1:1 strict des fonctions battle_main.c
 * manquantes (= INTRO sequence, end-turn handlers, cleanup).
 *
 * Source de vérité décomp : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *
 * Fonctions portées :
 *   - BeginBattleIntroDummy (3014-3017)
 *   - BeginBattleIntro (3019-3024)
 *   - BattleStartClearSetData (3034-3150)
 *   - BattleIntroGetMonsData (3357-3378)
 *   - BattleIntroPrepareBackgroundSlide (3380-3391)
 *   - BattleIntroDrawTrainersOrMonsSprites (3393-3489)
 *   - BattleIntroDrawPartySummaryScreens (3491-3562)
 *   - BattleIntroPrintTrainerWantsToBattle (3564-3572)
 *   - BattleIntroPrintWildMonAttacked (3574-3581)
 *   - BattleIntroPrintOpponentSendsOut (3583-3608)
 *   - BattleIntroOpponent1SendsOutMonAnimation (3642-3683)
 *   - BattleIntroOpponent2SendsOutMonAnimation (3610-3640)
 *   - BattleIntroRecordMonsToDex (3685-3703)
 *   - BattleIntroPrintPlayerSendsOut (3711-3738)
 *   - BattleIntroPlayer1SendsOutMonAnimation (3776-3818)
 *   - BattleIntroPlayer2SendsOutMonAnimation (3740-3774)
 *   - TryDoEventsBeforeFirstTurn (3841-3930)
 *   - HandleEndTurn_ContinueBattle (3932-3954)
 *   - HandleEndTurn_BattleWon (4960-5016)
 *   - HandleEndTurn_BattleLost (5018-5052)
 *   - HandleEndTurn_RanFromBattle (5054-5086)
 *   - HandleEndTurn_MonFled (5088-5096)
 *   - HandleEndTurn_FinishBattle (5098-5153)
 *   - FreeResetData_ReturnToOvOrDoEvolutions (5155-5178)
 *   - TryEvolvePokemon (5180-5209)
 *   - WaitForEvoSceneToFinish (5211-5215)
 *   - ReturnFromBattleToOverworld (5217-5249)
 *
 * Dépendances :
 *   - state.ts : tous les g* globals (gBattleMons, gBattleStruct, etc.)
 *   - battle-controllers.ts : BtlController_Emit* + MarkBattlerForControllerExec
 *   - util.ts : GetBattlerAtPosition, GetBattlerPosition, GET_BATTLER_SIDE, TurnValuesCleanUp, SpecialStatusesClear
 *   - constants.ts : BATTLE_TYPE_* flags
 *   - ability-battle-effects.ts : AbilityBattleEffects
 *   - item-battle-effects.ts : ItemBattleEffects
 *
 * Les fns hardware (= ResetSpriteData / FreeAllWindowBuffers / etc.) sont
 * importées du substrat engine ; les fns subsystem encore non-portées
 * (= RandomlyGivePartyPokerus / EvolutionScene) sont stubbed avec warn
 * explicit + dette R3 commentée. Pas de stub silencieux : la signature
 * existe pour que le call-site appelle réellement la fn.
 */

// ═══ SECTION battle-main-functions — CONSOLIDÉE PHYSIQUEMENT (C7, 2026-06-10) ═
// 1:1 battle_main.c : machine gBattleMainFunc COMPLÈTE — BeginBattleIntro ·
// BattleStartClearSetData (:3199) · BattleIntro* ×14 (:3358-3905) ·
// TryDoEventsBeforeFirstTurn (:3907) · HandleEndTurn_* ×6 (:4960-5070) ·
// FreeResetData_ReturnToOvOrDoEvolutions (:5072) · ReturnFromBattleToOverworld
// (:5128) · TryEvolvePokemon (:5092) + setBattleMainFunc/gIntroSlideFlags &co.
// L'ancien module engine/battle/battle-main-functions.ts = shim re-export.
// (Dédup : la quasi-totalité state/constants déjà importée [tête+C2-C6] ;
//  TurnValuesCleanUp = LOCAL [C2] ; Random/getRuntime/_stateNs/_saveBlockNs
//  [tête] ; MAX_BATTLERS_COUNT/PARTY_SIZE = const locales tête.)

import {
  gSideTimers, gWishFutureKnock, gSideStatuses, gLockedMoves,
  gAbsentBattlerFlags, gLeveledUpInBattle, gBattleResults,
  setBattlerTarget, setMoveResultFlags, setLeveledUpInBattle,
  setBattleWeather, setRandomTurnNumber, setPaydayMoney,
  setMultiHitCounter, setBattleMoveDamage,
  setAbsentBattlerFlags, setPauseCounterBattle,
  resetBattleResults,
} from './engine/battle/state';
import {
  BATTLE_TYPE_RECORDED_IS_MASTER, BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_WALLY_TUTORIAL, BATTLE_TYPE_ROAMER,
  B_SIDE_PLAYER, B_SIDE_OPPONENT,
  STATUS2_FLINCHED,
  FLEE_ITEM, FLEE_ABILITY,
} from './engine/battle/constants';
const gPalaceSelectionBattleScripts: number[] = [0, 0, 0, 0];
/** 1:1 décomp `gBattleResources->battleScriptsStack->size` + callbackStack
 *  size (local single-element array). */
const gBattleResources_battleScriptsStack_size: number[] = [0];
const gBattleResources_battleCallbackStack_size: number[] = [0];
import {
  B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT,
} from './engine/battle/util';
import {
  BtlController_EmitGetMonData, BtlController_EmitIntroSlide,
  BtlController_EmitIntroTrainerBallThrow, BtlController_EmitDrawTrainerPic,
  BtlController_EmitLoadMonSprite, BtlController_EmitDrawPartyStatusSummary,
  BattlePutTextOnWindow,
} from './battle_controllers';
import { MarkBattlerForControllerExec, PrepareStringBattle } from './battle_util';
import {
  AbilityBattleEffects,
  ABILITYEFFECT_SWITCH_IN_WEATHER, ABILITYEFFECT_ON_SWITCHIN,
  ABILITYEFFECT_INTIMIDATE1, ABILITYEFFECT_TRACE,
  consumeAbilityWantedScript,
} from './battle_util';
import { ItemBattleEffects, ITEMEFFECT_ON_SWITCH_IN, consumeItemWantedScript } from './battle_util';
import { runBattleTurnPassedViaBytecode } from './engine/battle/wire-bytecode-bridge';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import {
  OPTIONS_BATTLE_SCENE_ON, OPTIONS_BATTLE_SCENE_OFF, OPTIONS_BATTLE_STYLE_SHIFT,
} from '../include/constants/global';
import { FreeMonSpritesGfx, BeginFastPaletteFade } from '../harness/runtime/decomp-globals';
import {
  stepBattleScriptCommand, gBattleScriptContext, getBattleScriptOffset,
} from './engine/battle/script-interpreter';
import { fillActiveBattleMonsForBattleStart } from './engine/battle/party-storage';
import {
  B_ACTION_TRY_FINISH as _B_ACTION_TRY_FINISH_BSE,
  B_ACTION_FINISHED as _B_ACTION_FINISHED_BSE,
} from './engine/battle/constants';
import { getSpeciesInfo } from './engine/data/game-data';
import { SpeciesToNationalPokedexNum as _SpeciesToNationalPokedexNum, HandleSetPokedexFlag as _HandleSetPokedexFlag } from './engine/ui/pokedex-flags';
import { GetWhoStrikesFirst as _GetWhoStrikesFirst } from './battle_ai_script_commands';
import { FadeOutBGM as _FadeOutBGM_rt, PlayBGM as _PlayBGM_rt } from '../harness/runtime/decomp-globals';
import {
  GetMonData, gEnemyParty as _gEnemyParty, gPlayerParty as _gPlayerParty, AdjustFriendship, SetWildMonHeldItem,
  GetAbilityBySpecies, restoreOwPartyAfterTest,
  MON_DATA_SPECIES, MON_DATA_SPECIES_OR_EGG, MON_DATA_HP, MON_DATA_STATUS, MON_DATA_NICKNAME,
} from './engine/battle/party-storage';
import { resolveDecompConstant, reverseDecompConstant } from '../harness/runtime/decomp-constants';

// Inline constants 1:1 décomp (= éviter export-clutter sur ces specifics) :
/** 1:1 décomp `ITEM_NONE` (constants/items.h) = 0. */
const ITEM_NONE = 0;
/** 1:1 décomp `HP_EMPTY_SLOT` (constants/battle.h) = 65535. */
const HP_EMPTY_SLOT = 65535;
/** 1:1 décomp `PARTY_SUMM_SKIP_DRAW_DELAY` (battle_controllers.h:10) = (1<<7) = 128. */
const PARTY_SUMM_SKIP_DRAW_DELAY = 1 << 7;
/** 1:1 décomp `B_ACTION_NONE` (constants/battle.h) = 0xFF. */
const B_ACTION_NONE = 0xFF;
/** 1:1 décomp `B_OUTCOME_LINK_BATTLE_RAN` (constants/battle.h) = 0x80. */
const B_OUTCOME_LINK_BATTLE_RAN = 0x80;
/** 1:1 décomp `B_OUTCOME_FORFEITED` (constants/battle.h) = 9. */
const B_OUTCOME_FORFEITED = 9;

/** 1:1 décomp `SpecialStatusesClear()` (battle_main.c:4894-4904). Reset
 *  gSpecialStatuses[] (= per-battler bit flags pour ce tour). Inline car
 *  pas exporté de util.ts. */
function SpecialStatusesClear(): void {
  const stateMod = _stateNs as unknown as {
    gSpecialStatuses: Array<Record<string, number>>;
  };
  for (let active = 0; active < gBattlersCount; active++) {
    const ss = stateMod.gSpecialStatuses[active];
    for (const k of Object.keys(ss) as Array<keyof typeof ss>) {
      (ss as unknown as Record<string, number>)[k] = 0;
    }
  }
}

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `REQUEST_ALL_BATTLE` (battle_controllers.h). */
const REQUEST_ALL_BATTLE = 0;

/** 1:1 décomp `B_COMM_TO_CONTROLLER` (battle_controllers.h). */
// (B_COMM_TO_CONTROLLER : déclaré en section C5.)

/** 1:1 décomp `MULTIUSE_STATE` index dans gBattleCommunication. */
// (MULTIUSE_STATE : déclaré en tête de fichier.)

/** 1:1 décomp `SPRITES_INIT_STATE1` index dans gBattleCommunication. */
const SPRITES_INIT_STATE1 = 1;

/** 1:1 décomp `BATTLE_COMMUNICATION_ENTRIES_COUNT` (battle_script_commands.h:297) = 8.
 *  AUDIT FIX : était 16 (les boucles de clear de gBattleCommunication tournaient 2× trop). */
const BATTLE_COMMUNICATION_ENTRIES_COUNT = 8;

/** 1:1 décomp `STRINGID_INTROMSG` = 0. */
const STRINGID_INTROMSG = 0;

/** 1:1 décomp `STRINGID_INTROSENDOUT` = 1. */
const STRINGID_INTROSENDOUT = 1;

// MON_DATA_* : IMPORTÉS de party-storage (la source de vérité du GetMonData
// utilisé ici). ⚠️ NE PAS redéclarer en local avec les valeurs de l'enum .h
// décomp : notre party-storage a un mapping DÉCALÉ (+2 après les ribbons,
// cf. party-storage.ts:102). Les anciennes const locales MON_DATA_HP=39 /
// MON_DATA_STATUS=37 (valeurs .h) lisaient les MAUVAIS champs via GetMonData
// → hp=0 émis pour les mons vivants → balls party-summary adverses rendues
// FAINTED à l'intro dresseur (bug user #1, 2026-06-12).

/** 1:1 décomp `SPECIES_NONE`. */
const SPECIES_NONE = 0;

/** 1:1 décomp `SPECIES_EGG`. */
const SPECIES_EGG = 412;

/** 1:1 décomp `gText_EmptyString3`. */
const gText_EmptyString3 = '';

/** 1:1 décomp `B_WIN_MSG` = 0. */
const B_WIN_MSG = 0;

/** 1:1 décomp `gIntroSlideFlags` (battle_main.c). Bitmask des effects intro
 *  slide à activer. Reset à 0 par BattleStartClearSetData. */
let gIntroSlideFlags = 0;
export function setIntroSlideFlags(v: number): void { gIntroSlideFlags = v; }
export function getIntroSlideFlags(): number { return gIntroSlideFlags; }

/** 1:1 décomp `sUnusedBattlersArray[MAX_BATTLERS_COUNT]` (battle_main.c).
 *  Reset à 0 par BattleStartClearSetData. */
const sUnusedBattlersArray: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleMainFunc` (battle_main.c). Function pointer state
 *  machine du combat. Notre port : string identifier mappé au lookup. */
let gBattleMainFunc: BattleMainFunc = BeginBattleIntroDummy;
export function getBattleMainFunc(): BattleMainFunc { return gBattleMainFunc; }
export function setBattleMainFunc(fn: BattleMainFunc): void { gBattleMainFunc = fn; }

/** 1:1 décomp `gMain.inBattle`. Notre port : flag global accessible. */
let _gMain_inBattle = false;
export function setMainInBattle(v: boolean): void { _gMain_inBattle = v; }
export function getMainInBattle(): boolean { return _gMain_inBattle; }

/** 1:1 décomp `gMain.callback1` / `gMain.savedCallback`. */
let _gMain_callback1: (() => void) | null = null;
export function setMainCallback1(cb: (() => void) | null): void {
  _gMain_callback1 = cb;
  // 1:1 décomp `gMain.callback1 = cb` : le runtime tick callback1() PUIS
  // callback2() chaque frame (CallCallbacks, decomp-runtime.ts:2253). La source
  // de vérité est donc le runtime — c'est ce qui pilote BattleMainCB1.
  getRuntime()?.SetMainCallback1?.(cb as never);
}
export function getMainCallback1(): (() => void) | null {
  const rt = getRuntime();
  const cb = (rt?.gMain?.callback1 as (() => void) | null | undefined);
  return cb ?? _gMain_callback1;
}

let _gMain_savedCallback: (() => void) | null = null;
export function setMainSavedCallback(cb: (() => void) | null): void { _gMain_savedCallback = cb; }
export function getMainSavedCallback(): (() => void) | null { return _gMain_savedCallback; }

let _gPreBattleCallback1: (() => void) | null = null;
export function setPreBattleCallback1(cb: (() => void) | null): void { _gPreBattleCallback1 = cb; }
export function getPreBattleCallback1(): (() => void) | null { return _gPreBattleCallback1; }

// 1:1 décomp `gCB2_AfterEvolution` : COMMON_DATA défini dans evolution_scene.c
// → FOYER src/evolution_scene.ts (consolidé 2026-07-02, Palier 2.1). Les set/get
// exportés ici (compat callers battle-main-functions) délèguent au foyer.
export function setCB2AfterEvolution(cb: (() => void) | null): void { SetCB2AfterEvolution_Foyer(cb); }
export function getCB2AfterEvolution(): (() => void) | null { return GetCB2AfterEvolution_Foyer(); }

/** Function pointer type pour gBattleMainFunc. */
export type BattleMainFunc = () => void;

// 1:1 décomp `gBitTable[]` → consolidé sur le miroir `src/game/util.ts` (source unique ;
// l'import vient de src/game/, pas de battle-controllers → pas de cycle).
// (_gBitTable : importé en section C5.)
import { IsMonShiny } from '../include/pokemon';
// Famille Pokérus consolidée au foyer pokemon.c. Edge battle_main→src/pokemon = sens
// unique (pokemon.ts n'importe PAS battle_main) → zéro cycle.
import { RandomlyGivePartyPokerus, PartySpreadPokerus, GetEvolutionTargetSpecies as GetEvolutionTargetSpecies_Foyer } from './pokemon';
// Scène d'évolution : FOYER src/evolution_scene.ts (Palier 2.1 — imports
// fonction-hoisted, cycle battle_main↔evolution_scene fonction-only bénin).
import {
  EvolutionScene as EvolutionScene_Foyer,
  SetCB2AfterEvolution as SetCB2AfterEvolution_Foyer,
  GetCB2AfterEvolution as GetCB2AfterEvolution_Foyer,
} from './evolution_scene';
import type { Pokemon } from './engine/battle/party-storage';

// ─── Hardware/subsystem stubs (= dette R3 documentée) ──────────────────────

/** 1:1 décomp `ResetSpriteData()` (sprite.c). Phase port : reset internal
 *  sprite tracking. Notre runtime gère via runtime.gSprites Map ; ici on
 *  notify le reset. */
function ResetSpriteData(): void {
  // 1:1 décomp `ResetSpriteData()` (sprite.c:294) = ResetOamRange(0,128) +
  // ResetAllSprites + ClearSpriteCopyRequests + ResetAffineAnimData +
  // FreeSpriteTileRanges. L'impl 1:1 vit dans game/sprite.ts (= ce qu'appelle
  // aussi decomp-bridge.ResetSpriteData). Essentiel au retour de combat : clear
  // OAM + tiles + sprites, sinon les sprites de combat (mon + healthbox) gardent
  // leurs entrées OAM et RENDENT ENCORE dans l'OW (user-flag : sprites + palette
  // combat qui leakent). Le re-spawn OW (_restoreOverworldFromMenu) re-crée
  // ensuite les sprites OW = 1:1.
  _ResetSpriteDataImpl();
}

/** 1:1 décomp `FreeAllWindowBuffers()` (window.c). Phase port : libère les
 *  buffers windows GBA. Notre engine gba-window-system reset implicit
 *  à chaque scene swap. */
function FreeAllWindowBuffers(): void {
  // Dette R3 : window buffer tracker explicit (= notre AddWindow alloue
  // dynamiquement, pas de pool de free explicit nécessaire pour battle
  // single instance).
}

/** 1:1 décomp `FreeBattleResources()` (battle_bg.c). Phase port : libère
 *  gBattleResources struct. Notre port : noop car gBattleStruct est statique. */
function FreeBattleResources(): void {
  // Dette R3 : reset gBattleResources tracker explicit. Pour now : noop.
}

/** 1:1 décomp `FreeBattleSpritesData()` (battle_anim.c). */
function FreeBattleSpritesData(): void {
  // Dette R3 : reset sprite tracking tables battle. Notre port : noop.
}

// Famille Pokérus (CheckPartyHasHadPokerus/RandomlyGivePartyPokerus/PartySpreadPokerus,
// pokemon.c:6072-6209) : consolidée vers le foyer pokemon.c (src/pokemon.ts, à côté de
// CheckPartyPokerus/UpdatePartyPokerusTime). Importée pour les appels post-combat ci-dessous.

/** 1:1 décomp `FadeOutMapMusic(speed)` (sound.c). Wire vers FadeOutBGM existing.
 *  Notre runtime supporte FadeOutBGM(speed) (= m4aMPlayFadeOut sound.c:290). */
function FadeOutMapMusic(speed: number): void {
  _FadeOutBGM_rt(speed);
}

/** 1:1 décomp `m4aSongNumStop(songId)` (m4a.c). Stop le SE/BGM specified.
 *  Wire vers m4a/player stopSong selon mapping songId → slot. */
function m4aSongNumStop(songId: number): void {
  // 1:1 décomp : songId 287 = SE_LOW_HEALTH (= loop SE). Stop SE1/SE2.
  // Pour BGM (songId variant), stop 'bgm' slot.
  void songId;
  void import('../harness/m4a/player').then(({ stopSong }) => {
    stopSong('se1' as never);
    stopSong('se2' as never);
  });
}

/** 1:1 décomp `BattleStopLowHpSound()` (battle_main.c). Stop le low-HP
 *  SE_LOW_HEALTH qui boucle quand un mon en bas HP. */
function BattleStopLowHpSound(): void {
  m4aSongNumStop(287 /* SE_LOW_HEALTH */);
}

/** 1:1 décomp `UpdateRoamerHPStatus(mon)` (roamer.c). */
function UpdateRoamerHPStatus(_mon: unknown): void {
  // Dette R3 : roamer (= Latias/Latios) HP/status tracker post-combat.
}

/** 1:1 décomp `SetRoamerInactive()` (roamer.c). */
function SetRoamerInactive(): void {
  // Dette R3 : disable le roamer global (= post-catch).
}

/** 1:1 décomp `RecordedBattle_SetPlaybackFinished()` (recorded_battle.c). */
function RecordedBattle_SetPlaybackFinished(): void {
  // Dette R3 : recorded battle playback flag. Notre port n'a pas le
  // recorded battle system. Noop.
}

/** 1:1 décomp `TryPutPokemonTodayOnAir()` (tv.c). Trigger TV show
 *  "Pokemon Today" si conditions remplies post-combat. */
function TryPutPokemonTodayOnAir(): void {
  // Dette R3 : TV show triggers post-battle. Notre TV system handle d'autres
  // shows mais pas Pokemon Today encore.
}

/** 1:1 décomp `TryPutBreakingNewsOnAir()` (tv.c). */
function TryPutBreakingNewsOnAir(): void {
  // Dette R3 : TV breaking news trigger pour shiny capture.
}

/** 1:1 décomp `BattleArena_InitPoints()` (battle_arena.c). */
function BattleArena_InitPoints(): void {
  // Dette R3 : Battle Arena (= Frontier facility) points init. Notre port
  // n'a pas le Frontier yet.
}

/** 1:1 décomp `StopCryAndClearCrySongs()` (pokemon_sound.c). */
function StopCryAndClearCrySongs(): void {
  // Dette R3 : stop pokemon cry SE + cleanup queue.
}

/** 1:1 décomp `gBattleResources->battleCallbackStack->function[]` (battle.h).
 *  Stack des gBattleMainFunc sauvegardés par BattleScriptExecute (scripts
 *  imbriqués : GiveExp, HandleFaintedMon, …). */
const gBattleCallbackStack: BattleMainFunc[] = [];

/** 1:1 décomp `RunBattleScriptCommands_PopCallbacksStack()` (battle_main.c:5251).
 *  SI gCurrentActionFuncId == TRY_FINISH/FINISHED (= le script imbriqué a fini
 *  via end2/end → a posé ce funcId) → pop le callback stack → restaure
 *  gBattleMainFunc. SINON → step UNE commande du script (gated execFlags),
 *  exactement comme HandleAction_RunBattleScript. */
export function RunBattleScriptCommands_PopCallbacksStack(): void {
  if (_stateNs.gCurrentActionFuncId === _B_ACTION_TRY_FINISH_BSE
      || _stateNs.gCurrentActionFuncId === _B_ACTION_FINISHED_BSE) {
    const fn = gBattleCallbackStack.pop();
    if (fn) gBattleMainFunc = fn;
  } else if (gBattleScriptContext.scriptPtr < 0 && gBattleCallbackStack.length > 0) {
    // 1:1 décomp `Cmd_end3` (battle_script_commands.c) : pop le callback stack.
    // Un script lancé via BattleScriptExecute qui finit par `end3` pose scriptPtr=-1
    // SANS poser TRY_FINISH (contrairement à end/end2 qui passent par la branche ci-dessus)
    // → on pop ici. Nécessaire pour les talents de switch-in (BattleScript_IntimidateActivatesEnd3
    // & co.) lancés depuis TryDoEventsBeforeFirstTurn. Ciblé : ne se déclenche que quand
    // gBattleMainFunc EST PopCallbacksStack (= script en cours) et que le script vient de finir.
    const fn = gBattleCallbackStack.pop();
    if (fn) gBattleMainFunc = fn;
  } else if (gBattleControllerExecFlags === 0) {
    stepBattleScriptCommand(gBattleScriptContext);
  }
}

/** 1:1 décomp `BattleScriptExecute(bsPtr)` (battle_util.c:3184). Démarre un
 *  battle script IMBRIQUÉ : pose le scriptPtr sur le ctx persistant, push le
 *  gBattleMainFunc courant, bascule gBattleMainFunc vers
 *  RunBattleScriptCommands_PopCallbacksStack + gCurrentActionFuncId=0 (= mode
 *  exécution). Le script finit par `end2` (gCurrentActionFuncId=TRY_FINISH) →
 *  PopCallbacksStack pop → gBattleMainFunc restauré. Prend un LABEL (notre
 *  port résout label→offset bytecode). */
function BattleScriptExecute(scriptLabel: string): void {
  const off = getBattleScriptOffset(scriptLabel);
  if (off < 0) {
    console.warn(`[battle-main-functions] BattleScriptExecute: label '${scriptLabel}' introuvable`);
    return;
  }
  gBattleScriptContext.scriptPtr = off;
  gBattleScriptContext.scriptPtrStack.length = 0;
  gBattleCallbackStack.push(gBattleMainFunc);
  gBattleMainFunc = RunBattleScriptCommands_PopCallbacksStack;
  setCurrentActionFuncId(0);
}

/** 1:1 décomp `RunBattleScriptCommands()` (battle_main.c:5266-5271) : step le
 *  script courant tant qu'aucun contrôleur n'est actif. Posé par
 *  BattleScriptPushCursorAndCallback (scripts abilities/items end-turn).
 *  Branche scriptPtr<0 : même compromis documenté que PopCallbacksStack — notre
 *  Cmd_end3 ne pop pas lui-même le callback stack (décomp Cmd_end3 le fait) →
 *  on restaure ici cursor + mainFunc quand le script imbriqué vient de finir. */
export function RunBattleScriptCommands(): void {
  if (gBattleScriptContext.scriptPtr < 0 && gBattleCallbackStack.length > 0) {
    const savedCursor = gBattleScriptContext.scriptPtrStack.pop();
    if (savedCursor !== undefined) gBattleScriptContext.scriptPtr = savedCursor;
    const fn = gBattleCallbackStack.pop();
    if (fn) gBattleMainFunc = fn;
    return;
  }
  if (gBattleControllerExecFlags === 0) {
    stepBattleScriptCommand(gBattleScriptContext);
  }
}

/** 1:1 décomp `BattleScriptPushCursorAndCallback(BS_ptr)` (battle_util.c:3192-3198) :
 *  BattleScriptPushCursor (push le cursor du script courant) + push gBattleMainFunc
 *  → exécute le script donné sous RunBattleScriptCommands (sans toucher
 *  gCurrentActionFuncId, contrairement à BattleScriptExecute). Décomp : appelé EN
 *  INTERNE par AbilityBattleEffects/ItemBattleEffects pour les scripts end-turn
 *  (Speed Boost, Shed Skin…). Notre AbilityBattleEffects délègue encore le
 *  lancement au caller via consumeAbilityWantedScript → BattleScriptExecute
 *  (dette d'alignement) ; ce port rend la cible 1:1 disponible. */
export function BattleScriptPushCursorAndCallback(scriptLabel: string): void {
  const off = getBattleScriptOffset(scriptLabel);
  if (off < 0) {
    console.warn(`[battle_main] BattleScriptPushCursorAndCallback: label '${scriptLabel}' introuvable`);
    return;
  }
  gBattleScriptContext.scriptPtrStack.push(gBattleScriptContext.scriptPtr);
  gBattleScriptContext.scriptPtr = off;
  gBattleCallbackStack.push(gBattleMainFunc);
  gBattleMainFunc = RunBattleScriptCommands;
}

/** 1:1 décomp `BattleScript_*` pointers. Dette R3 : script bytecode entries
 *  pour outcomes spécifiques. */
const BattleScript_LinkBattleWonOrLost = {} as unknown;
const BattleScript_FrontierTrainerBattleWon = {} as unknown;
const BattleScript_LocalTrainerBattleWon = {} as unknown;
const BattleScript_FrontierLinkBattleLost = {} as unknown;
const BattleScript_PrintPlayerForfeitedLinkBattle = {} as unknown;
const BattleScript_LocalBattleLost = {} as unknown;
const BattleScript_PrintPlayerForfeited = {} as unknown;
const BattleScript_GotAwaySafely = {} as unknown;
const BattleScript_SmokeBallEscape = {} as unknown;
const BattleScript_RanAwayUsingMonAbility = {} as unknown;
const BattleScript_PayDayMoneyAndPickUpItems = {} as unknown;
const BattleScript_WildMonFled = {} as unknown;
const BattleScript_ArenaTurnBeginning = {} as unknown;
// (BattleScript_FocusPunchSetUp : déclaré en section C4.)

let gBattlescriptCurrInstr: unknown = null;

// IsMonShiny : consolidé vers le foyer pokemon.c (src/pokemon.ts, à côté de
// IsShinyOtIdPersonality) ; importé via le re-export include/pokemon (cf. en-tête).

/** 1:1 décomp `SpeciesToNationalPokedexNum(species)` (pokedex.c).
 *  Wire direct vers ui/pokedex-flags.ts (= existing 1:1 port). */
function SpeciesToNationalPokedexNum(species: number): number {
  return _SpeciesToNationalPokedexNum(species);
}

/** 1:1 décomp `HandleSetPokedexFlag(nationalDexNum, caseId, personality)`.
 *  Wire direct vers ui/pokedex-flags.ts (= existing 1:1 port). */
function HandleSetPokedexFlag(nationalDexNum: number, caseId: number, personality: number): void {
  _HandleSetPokedexFlag(nationalDexNum, caseId, personality);
}

// 1:1 décomp `GetAbilityBySpecies` : importé de party-storage.ts (version
// canonique, résout abilities string→id via resolveDecompConstant). La copie
// locale ici traitait `info.abilities` comme number[] (= bug : ce sont des
// 'ABILITY_X' strings).

/** 1:1 décomp `gBattleBufferB[gActiveBattler][4 + i]` (battle_controllers.c).
 *  Buffer rempli par BtlController_EmitGetMonData REQUEST_ALL_BATTLE.
 *  Notre port lit directement gPlayerParty[partyIdx] / gEnemyParty[partyIdx].
 *  Cette fonction simule le buffer en cas où le wire n'est pas encore complet. */
function _readBattleMonFromBuffer(battler: number): void {
  // 1:1-observable : le décomp désérialise gBattleBufferB (struct BattlePokemon
  // sérialisée par CopyPlayerMonData) → gBattleMons[battler]. En single-player
  // LOCAL, le buffer IPC (multi-CPU/link) est inutile : on remplit gBattleMons
  // directement depuis le party (gPlayerParty/gEnemyParty) via le MÊME helper que
  // la voie V — `fillActiveBattleMonsForBattleStart` (idempotent, remplit tous les
  // battlers actifs). Résultat IDENTIQUE au décomp ; la dérivation types/ability/
  // stat-stages qui suit l'appel (BattleIntro state) finalise gBattleMons[battler].
  // (Voie L flag-ON : sans ça, gBattleMons reste à 0 car _CopyPlayerMonData est stub.)
  void battler;
  fillActiveBattleMonsForBattleStart();
}

/** 1:1 décomp `ResetSentPokesToOpponentValue()` (battle_util.c:900-913). */
function ResetSentPokesToOpponentValue(): void {
  // 1:1 décomp : clear [0..1] PUIS marquer les mons du joueur envoyés (bits = OR de
  // gBitTable[gBattlerPartyIndexes[i]] côté joueur) sur le flank adverse. La 2e partie
  // MANQUAIT → gSentPokesToOpponent restait 0 → Cmd_getexp lit sentInPokes=0 → 0 EXP
  // → pas de level-up → pas d'apprentissage de move. (Racine du « KO sans EXP » boot path.)
  const stateMod = _stateNs as unknown as { gSentPokesToOpponent: number[]; gBattlersCount: number; gBattlerPartyIndexes: number[] };
  stateMod.gSentPokesToOpponent[0] = 0;
  stateMod.gSentPokesToOpponent[1] = 0;
  let bits = 0;
  for (let i = 0; i < stateMod.gBattlersCount; i += 2)
    bits |= _gBitTable[stateMod.gBattlerPartyIndexes[i]];
  for (let i = 1; i < stateMod.gBattlersCount; i += 2)
    stateMod.gSentPokesToOpponent[(i & 2 /* BIT_FLANK */) >> 1] = bits;
}

/** 1:1 décomp `GetEvolutionTargetSpecies(mon, evoMode, evolutionItem)` — impl réelle
 *  au FOYER pokemon.ts (pokemon.c:5490). NB quirk décomp authentique : TryEvolvePokemon
 *  (battle_main.c:5196) passe `levelUpBits` en 3e arg — ignoré en EVO_MODE_NORMAL. */
function GetEvolutionTargetSpecies(mon: unknown, evoMode: number, evolutionItem: number): number {
  return GetEvolutionTargetSpecies_Foyer(mon as Parameters<typeof GetEvolutionTargetSpecies_Foyer>[0], evoMode, evolutionItem);
}

/** 1:1 décomp `EvolutionScene(mon, species, canStopEvo, partyId)` — impl RÉELLE
 *  au foyer evolution_scene.ts (scène complète, Palier 2.1 étape 4). */
function EvolutionScene(mon: unknown, species: number, canStopEvo: boolean, partyId: number): void {
  EvolutionScene_Foyer(mon as Parameters<typeof EvolutionScene_Foyer>[0], species, canStopEvo, partyId);
}

/** 1:1 décomp `gSpeciesInfo[species].catchRate`. */
function _getSpeciesCatchRate(species: number): number {
  // 1:1 décomp `gSpeciesInfo[species].catchRate`. getSpeciesInfo est keyé par
  // enum string → on passe par reverseDecompConstant (id→'SPECIES_X'), comme
  // party-storage. species 0 / inconnu → 0 (= gSpeciesInfo[SPECIES_NONE]).
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_');
  const info = speciesEnum ? getSpeciesInfo(speciesEnum) : undefined;
  return info?.catchRate ?? 0;
}

// (BattleMainCB2 : version réelle en tête de fichier — stub historique retiré.)

/** 1:1 décomp `SetMainCallback2(cb)` : pose gMain.callback2 du runtime (= le runtime
 *  l'appelle chaque frame). AVANT : STUB (`void cb`) → ne posait RIEN → la SEULE
 *  utilisation, `ReturnFromBattleToOverworld` (fin de combat voie L), ne pouvait pas
 *  rendre la main au callback overworld → la boucle combat (_BattleMainCB2) restait =
 *  FREEZE en fin de combat, pas de retour OW (signalé user). Câblé comme les autres
 *  modules (battle-cb2/init `_SetMainCallback2`). Voie V utilise battle-flow (pas
 *  ReturnFromBattleToOverworld) → pas de régression. */
function SetMainCallback2(cb: (() => void) | null): void {
  getRuntime()?.SetMainCallback2?.(cb as never);
}

/** 1:1 décomp `gTrainers[id].trainerClass` (trainers data). */
function _getTrainerClass(_trainerId: number): number {
  // Dette R3 : trainers data table. Pour now : default 0.
  return 0;
}

/** 1:1 décomp `gTrainerBattleOpponent_A`. */
function _getTrainerBattleOpponentA(): number {
  const stateMod = _stateNs as unknown as { gTrainerBattleOpponent_A?: number };
  return stateMod.gTrainerBattleOpponent_A ?? 0;
}

/** 1:1 décomp `PlayBGM(songId)` (sound.c). Wire vers decomp-globals existing. */
function PlayBGM(songId: number): void {
  _PlayBGM_rt(songId);
}

/** 1:1 décomp `PREPARE_MON_NICK_BUFFER(buffer, battler, partyIdx)` macro. */
function PREPARE_MON_NICK_BUFFER(_buffer: number[], _battler: number, _partyIdx: number): void {
  // Dette R3 : text_buffers helper. Pour now : noop.
}

/** 1:1 décomp `GetBattleSceneInRecordedBattle()` (recorded_battle.c). */
function GetBattleSceneInRecordedBattle(): boolean {
  return false; // Pas de recorded battles dans notre port.
}

/** 1:1 décomp `GetWhoStrikesFirst(b1, b2, ignoreChosen)` (battle_main.c:4595).
 *  Wire direct vers ai/ai-script-commands.ts (= existing 1:1 port). */
function GetWhoStrikesFirst(b1: number, b2: number, ignoreChosen: boolean): number {
  return _GetWhoStrikesFirst(b1, b2, ignoreChosen);
}

// (SwapTurnOrder : consolidé en section C3, corps identique.)

/** 1:1 décomp `TryClearRageStatuses()` (battle_util.c). */
function TryClearRageStatuses(): void {
  // Wire vers util.ts si existe. Sinon dette R3.
}

/** Setup pour BattleMainFunc callbacks. Le state machine décomp utilise des
 *  function pointers ; notre port utilise des refs JS directes. */

// ─── BeginBattleIntroDummy + BeginBattleIntro ──────────────────────────────

/** 1:1 décomp `BeginBattleIntroDummy()` (battle_main.c:3014-3017). */
export function BeginBattleIntroDummy(): void {
  // Empty function 1:1.
}

/** 1:1 décomp `BeginBattleIntro()` (battle_main.c:3019-3024). */
export function BeginBattleIntro(): void {
  BattleStartClearSetData();
  gBattleCommunication[1] = 0;
  gBattleMainFunc = BattleIntroGetMonsData;
}

// ─── BattleStartClearSetData (3034-3150) ───────────────────────────────────

/** 1:1 décomp `BattleStartClearSetData()` (battle_main.c:3034-3150).
 *  Reset TOUS les globals battle au démarrage du combat. */
export function BattleStartClearSetData(): void {
  TurnValuesCleanUp(false);
  SpecialStatusesClear();

  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    gStatuses3[i] = 0;

    // 1:1 décomp ll. 3047-3049 : clear gDisableStructs[i] entièrement.
    const ds = gDisableStructs[i];
    for (const k of Object.keys(ds) as Array<keyof typeof ds>) {
      (ds as unknown as Record<string, number>)[k] = 0;
    }

    gDisableStructs[i].isFirstTurn = 2;
    sUnusedBattlersArray[i] = 0;
    gLastMoves[i] = MOVE_NONE;
    gLastLandedMoves[i] = MOVE_NONE;
    gLastHitByType[i] = 0;
    gLastResultingMoves[i] = MOVE_NONE;
    gLastHitBy[i] = 0xFF;
    gLockedMoves[i] = MOVE_NONE;
    gLastPrintedMoves[i] = MOVE_NONE;
    gBattleResourcesFlags[i] = 0;
    gPalaceSelectionBattleScripts[i] = 0;
  }

  // 1:1 décomp ll. 3064-3071 : clear gSideStatuses + gSideTimers per side.
  for (let i = 0; i < 2; i++) {
    gSideStatuses[i] = 0;
    const st = gSideTimers[i];
    for (const k of Object.keys(st) as Array<keyof typeof st>) {
      (st as unknown as Record<string, number>)[k] = 0;
    }
  }

  setBattlerAttacker(0);
  setBattlerTarget(0);
  setBattleWeather(0);

  // 1:1 décomp ll. 3077-3079 : clear gWishFutureKnock entièrement.
  for (const k of Object.keys(gWishFutureKnock) as Array<keyof typeof gWishFutureKnock>) {
    const v = (gWishFutureKnock as unknown as Record<string, unknown>)[k];
    if (Array.isArray(v)) {
      for (let j = 0; j < v.length; j++) (v as number[])[j] = 0;
    } else {
      (gWishFutureKnock as unknown as Record<string, number>)[k] = 0;
    }
  }

  setHitMarker(0);

  // 1:1 décomp ll. 3083-3091 : HITMARKER_NO_ANIMATIONS si battleSceneOff.
  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    // 1:1 battle_main.c:3085 `optionsBattleSceneOff == TRUE` — la save stocke
    // 0/1 NUMERIQUE (boot-mode) : `=== true` ne matchait JAMAIS -> l'option
    // « ANIMS DE COMBAT : SANS » etait ignoree (tranche B goal 2026-06-11).
    if (!(gBattleTypeFlags & BATTLE_TYPE_LINK) && !!gSaveBlock2Ptr.optionsBattleSceneOff) {
      setHitMarker(gHitMarker | HITMARKER_NO_ANIMATIONS);
    }
  } else if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))
             && GetBattleSceneInRecordedBattle()) {
    setHitMarker(gHitMarker | HITMARKER_NO_ANIMATIONS);
  }

  gBattleScripting.battleStyle = gSaveBlock2Ptr.optionsBattleStyle ?? 0;

  setMultiHitCounter(0);
  setBattleOutcome(0);
  setBattleControllerExecFlags(0);
  setPaydayMoney(0);

  // 1:1 décomp ll. 3099-3100 : reset script stacks.
  gBattleResources_battleScriptsStack_size[0] = 0;
  gBattleResources_battleCallbackStack_size[0] = 0;

  for (let i = 0; i < BATTLE_COMMUNICATION_ENTRIES_COUNT; i++) {
    gBattleCommunication[i] = 0;
  }

  setPauseCounterBattle(0);
  setBattleMoveDamage(0);
  gIntroSlideFlags = 0;
  gBattleScripting.animTurn = 0;
  gBattleScripting.animTargetsHit = 0;
  setLeveledUpInBattle(0);
  setAbsentBattlerFlags(0);

  gBattleStruct.runTries = 0;
  gBattleStruct.safariGoNearCounter = 0;
  gBattleStruct.safariPkblThrowCounter = 0;

  // 1:1 décomp l. 3115 : safariCatchFactor = catchRate * 100 / 1275.
  const enemySpecies = GetMonData(_getEnemyParty()[0] as never, MON_DATA_SPECIES) as number;
  const catchRate = _getSpeciesCatchRate(enemySpecies);
  gBattleStruct.safariCatchFactor = Math.floor(catchRate * 100 / 1275);

  gBattleStruct.safariEscapeFactor = 3;
  gBattleStruct.wildVictorySong = 0;
  gBattleStruct.moneyMultiplier = 1;

  for (let i = 0; i < 8; i++) {
    gBattleStruct.lastTakenMove[i] = MOVE_NONE;
    gBattleStruct.usedHeldItems[i] = ITEM_NONE;
    gBattleStruct.choicedMove[i] = MOVE_NONE;
    gBattleStruct.changedItems[i] = ITEM_NONE;
    gBattleStruct.lastTakenMoveFrom[i + 0 * 8] = 0;
    gBattleStruct.lastTakenMoveFrom[i + 1 * 8] = 0;
    gBattleStruct.lastTakenMoveFrom[i + 2 * 8] = 0;
    gBattleStruct.lastTakenMoveFrom[i + 3 * 8] = 0;
  }

  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    gBattleStruct.AI_monToSwitchIntoId[i] = PARTY_SIZE;
  }

  gBattleStruct.givenExpMons = 0;
  gBattleStruct.palaceFlags = 0;

  setRandomTurnNumber(Random() & 0xFFFF);

  // 1:1 décomp ll. 3142-3144 : clear gBattleResults entièrement.
  resetBattleResults();

  gBattleResults.shinyWildMon = IsMonShiny(_getEnemyParty()[0] as Pokemon);

  gBattleStruct.arenaLostPlayerMons = 0;
  gBattleStruct.arenaLostOpponentMons = 0;
}

/** Helper : accède à gPlayerParty / gEnemyParty via gSaveBlock1Ptr. */
function _getPlayerParty(): unknown[] {
  // 1:1 décomp `gPlayerParty` (EWRAM, = party-storage) — PAS gSaveBlock1Ptr.playerParty :
  // en combat la source de vérité décomp est gPlayerParty (la save y est copiée à
  // l'entrée). Lire la save ici donnait hp=0 en harness → balls party-summary GRISES
  // (tile fainted +3) pour des mons vivants (A/B 2026-06-09). Symétrique de _getEnemyParty.
  return _gPlayerParty as unknown[];
}

function _getEnemyParty(): unknown[] {
  // 1:1 décomp `gEnemyParty` : vit dans party-storage.ts (array de PARTY_SIZE
  // mons valides), PAS dans state.ts (l'ancien require('./state').gEnemyParty
  // renvoyait undefined → crash dès que la voie décomp lit gEnemyParty[0]).
  return _gEnemyParty;
}

// ─── BattleIntroGetMonsData (3357) ─────────────────────────────────────────

/** 1:1 décomp `BattleIntroGetMonsData()` (battle_main.c:3357-3378). */
export function BattleIntroGetMonsData(): void {
  switch (gBattleCommunication[MULTIUSE_STATE]) {
    case 0:
      setActiveBattler(gBattleCommunication[1]);
      BtlController_EmitGetMonData(B_COMM_TO_CONTROLLER, REQUEST_ALL_BATTLE, 0);
      MarkBattlerForControllerExec(gActiveBattler);
      gBattleCommunication[MULTIUSE_STATE]++;
      break;
    case 1:
      if (gBattleControllerExecFlags === 0) {
        gBattleCommunication[1]++;
        if (gBattleCommunication[1] === gBattlersCount) {
          gBattleMainFunc = BattleIntroPrepareBackgroundSlide;
        } else {
          gBattleCommunication[MULTIUSE_STATE] = 0;
        }
      }
      break;
  }
}

// ─── BattleIntroPrepareBackgroundSlide (3380) ──────────────────────────────

/** 1:1 décomp `BattleIntroPrepareBackgroundSlide()` (battle_main.c:3380-3391). */
export function BattleIntroPrepareBackgroundSlide(): void {
  if (gBattleControllerExecFlags === 0) {
    setActiveBattler(GetBattlerAtPosition(0));
    // 1:1 décomp : BtlController_EmitIntroSlide(buf, gBattleEnvironment).
    const stateMod = _stateNs as unknown as { gBattleEnvironment?: number };
    BtlController_EmitIntroSlide(B_COMM_TO_CONTROLLER, stateMod.gBattleEnvironment ?? 0);
    MarkBattlerForControllerExec(gActiveBattler);
    gBattleMainFunc = BattleIntroDrawTrainersOrMonsSprites;
    gBattleCommunication[MULTIUSE_STATE] = 0;
    gBattleCommunication[SPRITES_INIT_STATE1] = 0;
  }
}

// ─── BattleIntroDrawTrainersOrMonsSprites (3393) ───────────────────────────

/** 1:1 décomp `BattleIntroDrawTrainersOrMonsSprites()` (battle_main.c:3393-3489). */
export function BattleIntroDrawTrainersOrMonsSprites(): void {
  if (gBattleControllerExecFlags) return;

  for (let active = 0; active < gBattlersCount; active++) {
    setActiveBattler(active);

    if ((gBattleTypeFlags & BATTLE_TYPE_SAFARI)
        && GET_BATTLER_SIDE(active) === B_SIDE_PLAYER) {
      // 1:1 décomp ll. 3403-3409 : clear gBattleMons[active] entièrement
      // (= safari player ne reçoit pas son mon, le start-up le génère).
      const mon = gBattleMons[active];
      for (const k of Object.keys(mon) as Array<keyof typeof mon>) {
        const v = (mon as unknown as Record<string, unknown>)[k];
        if (typeof v === 'number') {
          (mon as unknown as Record<string, number>)[k] = 0;
        } else if (Array.isArray(v)) {
          for (let j = 0; j < (v as number[]).length; j++) (v as number[])[j] = 0;
        } else if (typeof v === 'string') {
          (mon as unknown as Record<string, string>)[k] = '';
        }
      }
    } else {
      // 1:1 décomp ll. 3414-3426 : copy depuis gBattleBufferB[4..4+sizeof(BattlePokemon)]
      // vers gBattleMons[active]. Notre port : déjà fait par fillActiveBattleMonsForBattleStart.
      _readBattleMonFromBuffer(active);

      // 1:1 décomp : type1/type2 = gSpeciesInfo[species].types[0/1] ; ability =
      // GetAbilityBySpecies. getSpeciesInfo keyé par enum + types = 'TYPE_X'
      // strings → reverse/resolve (= MÊME dérivation que party-storage:837-844).
      const speciesEnum = reverseDecompConstant(gBattleMons[active].species, 'SPECIES_');
      const info = speciesEnum ? getSpeciesInfo(speciesEnum) : undefined;
      if (info?.types) {
        const t1 = resolveDecompConstant(info.types[0] ?? '');
        const t2 = resolveDecompConstant(info.types[1] ?? info.types[0] ?? '');
        gBattleMons[active].type1 = typeof t1 === 'number' ? t1 : 0;
        gBattleMons[active].type2 = typeof t2 === 'number' ? t2 : 0;
      }
      gBattleMons[active].ability = GetAbilityBySpecies(
        gBattleMons[active].species, gBattleMons[active].abilityNum,
      );

      // 1:1 décomp ll. 3421-3422 : hpOnSwitchout[side] = current hp.
      const side = GET_BATTLER_SIDE(active);
      gBattleStruct.hpOnSwitchout[side] = gBattleMons[active].hp;

      for (let i = 0; i < NUM_BATTLE_STATS; i++) {
        gBattleMons[active].statStages[i] = DEFAULT_STAT_STAGE;
      }
      gBattleMons[active].status2 = 0;
    }

    // 1:1 décomp ll. 3428-3432 : player draw trainer pic.
    if (GetBattlerPosition(active) === B_POSITION_PLAYER_LEFT) {
      BtlController_EmitDrawTrainerPic(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
    }

    if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
      // 1:1 décomp ll. 3436-3440 : opponent draw trainer pic.
      if (GetBattlerPosition(active) === B_POSITION_OPPONENT_LEFT) {
        BtlController_EmitDrawTrainerPic(B_COMM_TO_CONTROLLER);
        MarkBattlerForControllerExec(active);
      }
      // 1:1 décomp ll. 3441-3449 : pokedex flag SEEN pour mon vs trainer.
      if (GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT
          && !(gBattleTypeFlags & (BATTLE_TYPE_EREADER_TRAINER
                                   | BATTLE_TYPE_FRONTIER
                                   | BATTLE_TYPE_LINK
                                   | BATTLE_TYPE_RECORDED_LINK
                                   | BATTLE_TYPE_TRAINER_HILL))) {
        HandleSetPokedexFlag(
          SpeciesToNationalPokedexNum(gBattleMons[active].species),
          2 /* FLAG_SET_SEEN */, gBattleMons[active].personality,
        );
      }
    } else {
      // 1:1 décomp ll. 3453-3467 : wild → loadMonSprite + pokedex flag.
      if (GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT) {
        if (!(gBattleTypeFlags & (BATTLE_TYPE_EREADER_TRAINER
                                  | BATTLE_TYPE_FRONTIER
                                  | BATTLE_TYPE_LINK
                                  | BATTLE_TYPE_RECORDED_LINK
                                  | BATTLE_TYPE_TRAINER_HILL))) {
          HandleSetPokedexFlag(
            SpeciesToNationalPokedexNum(gBattleMons[active].species),
            2 /* FLAG_SET_SEEN */, gBattleMons[active].personality,
          );
        }
        BtlController_EmitLoadMonSprite(B_COMM_TO_CONTROLLER);
        MarkBattlerForControllerExec(active);
        const enemyParty = _getEnemyParty();
        const stateMod = _stateNs as unknown as { gBattlerPartyIndexes: number[] };
        const partyIdx = stateMod.gBattlerPartyIndexes[active] ?? 0;
        gBattleResults.lastOpponentSpecies = GetMonData(
          enemyParty[partyIdx] as never, MON_DATA_SPECIES,
        ) as number;
      }
    }

    // 1:1 décomp ll. 3469-3477 : double battle (= multi) draw trainer pic right slot.
    if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
      if (GetBattlerPosition(active) === B_POSITION_PLAYER_RIGHT
          || GetBattlerPosition(active) === B_POSITION_OPPONENT_RIGHT) {
        BtlController_EmitDrawTrainerPic(B_COMM_TO_CONTROLLER);
        MarkBattlerForControllerExec(active);
      }
    }

    // 1:1 décomp ll. 3479-3483 : two opponents (= 2v1) right slot trainer pic.
    if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS
        && GetBattlerPosition(active) === B_POSITION_OPPONENT_RIGHT) {
      BtlController_EmitDrawTrainerPic(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
    }

    if (gBattleTypeFlags & BATTLE_TYPE_ARENA) {
      BattleArena_InitPoints();
    }
  }

  gBattleMainFunc = BattleIntroDrawPartySummaryScreens;
}

// ─── BattleIntroDrawPartySummaryScreens (3491) ─────────────────────────────

/** 1:1 décomp `BattleIntroDrawPartySummaryScreens()` (battle_main.c:3491-3562).
 *  Affiche les 6-mons summary side panels (= trainer battle uniquement).
 *  Wild battle : noop visible mais le struct hpStatus est setup quand même
 *  (= 1:1 strict, le décomp commente "no point in having dead code"). */
export function BattleIntroDrawPartySummaryScreens(): void {
  if (gBattleControllerExecFlags) return;

  interface HpAndStatus { hp: number; status: number; }
  const hpStatus: HpAndStatus[] = new Array(PARTY_SIZE).fill(null).map(() => ({ hp: 0, status: 0 }));

  const enemyParty = _getEnemyParty();
  const playerParty = _getPlayerParty();

  if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    // 1:1 décomp ll. 3501-3514 : enemy party hpStatus.
    for (let i = 0; i < PARTY_SIZE; i++) {
      const enemyMon = enemyParty[i];
      const species = enemyMon ? GetMonData(enemyMon as never, MON_DATA_SPECIES_OR_EGG) as number : SPECIES_NONE;
      if (species === SPECIES_NONE || species === SPECIES_EGG) {
        hpStatus[i].hp = HP_EMPTY_SLOT;
        hpStatus[i].status = 0;
      } else {
        hpStatus[i].hp = GetMonData(enemyMon as never, MON_DATA_HP) as number;
        hpStatus[i].status = GetMonData(enemyMon as never, MON_DATA_STATUS) as number;
      }
    }
    setActiveBattler(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT));
    BtlController_EmitDrawPartyStatusSummary(B_COMM_TO_CONTROLLER, hpStatus, PARTY_SUMM_SKIP_DRAW_DELAY);
    MarkBattlerForControllerExec(gActiveBattler);

    // 1:1 décomp ll. 3519-3535 : player party hpStatus.
    for (let i = 0; i < PARTY_SIZE; i++) {
      const playerMon = playerParty[i];
      const species = playerMon ? GetMonData(playerMon as never, MON_DATA_SPECIES_OR_EGG) as number : SPECIES_NONE;
      if (species === SPECIES_NONE || species === SPECIES_EGG) {
        hpStatus[i].hp = HP_EMPTY_SLOT;
        hpStatus[i].status = 0;
      } else {
        hpStatus[i].hp = GetMonData(playerMon as never, MON_DATA_HP) as number;
        hpStatus[i].status = GetMonData(playerMon as never, MON_DATA_STATUS) as number;
      }
    }
    setActiveBattler(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
    BtlController_EmitDrawPartyStatusSummary(B_COMM_TO_CONTROLLER, hpStatus, PARTY_SUMM_SKIP_DRAW_DELAY);
    MarkBattlerForControllerExec(gActiveBattler);

    gBattleMainFunc = BattleIntroPrintTrainerWantsToBattle;
  } else {
    // 1:1 décomp ll. 3540-3560 : wild → fill hpStatus mais pas d'emit.
    // Le décomp commente "dead code intentionally kept" → on conserve 1:1.
    for (let i = 0; i < PARTY_SIZE; i++) {
      const playerMon = playerParty[i];
      const species = playerMon ? GetMonData(playerMon as never, MON_DATA_SPECIES_OR_EGG) as number : SPECIES_NONE;
      if (species === SPECIES_NONE || species === SPECIES_EGG) {
        hpStatus[i].hp = HP_EMPTY_SLOT;
        hpStatus[i].status = 0;
      } else {
        hpStatus[i].hp = GetMonData(playerMon as never, MON_DATA_HP) as number;
        hpStatus[i].status = GetMonData(playerMon as never, MON_DATA_STATUS) as number;
      }
    }
    gBattleMainFunc = BattleIntroPrintWildMonAttacked;
  }
}

// ─── BattleIntroPrintTrainerWantsToBattle (3564) ───────────────────────────

/** 1:1 décomp `BattleIntroPrintTrainerWantsToBattle()` (battle_main.c:3564-3572). */
export function BattleIntroPrintTrainerWantsToBattle(): void {
  if (gBattleControllerExecFlags === 0) {
    setActiveBattler(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT));
    PrepareStringBattle(STRINGID_INTROMSG, gActiveBattler);
    gBattleMainFunc = BattleIntroPrintOpponentSendsOut;
  }
}

// ─── BattleIntroPrintWildMonAttacked (3574) ────────────────────────────────

/** 1:1 décomp `BattleIntroPrintWildMonAttacked()` (battle_main.c:3574-3581).
 *  Le healthbox du mon sauvage est désormais montré 1:1 par `SpriteCB_WildMonShowHealthbox`
 *  (battle-sprite-callbacks.ts) à la FIN du slide du mon (StartHealthboxSlideIn +
 *  SetHealthboxSpriteVisible). L'ancien contournement `_ShowWildOpponentHealthboxes` (qui
 *  montrait le healthbox TÔT, ici) est RETIRÉ : la chaîne SpriteCB_WildMon est maintenant
 *  câblée (slide + teinte + healthbox), donc le show est 1:1 (après le slide, pas au message). */
export function BattleIntroPrintWildMonAttacked(): void {
  if (gBattleControllerExecFlags === 0) {
    gBattleMainFunc = BattleIntroPrintPlayerSendsOut;
    PrepareStringBattle(STRINGID_INTROMSG, 0);
  }
}

// ─── BattleIntroPrintOpponentSendsOut (3583) ───────────────────────────────

/** 1:1 décomp `BattleIntroPrintOpponentSendsOut()` (battle_main.c:3583-3608). */
export function BattleIntroPrintOpponentSendsOut(): void {
  let position: number;

  if (gBattleControllerExecFlags) return;

  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    position = B_POSITION_OPPONENT_LEFT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
      position = B_POSITION_OPPONENT_LEFT;
    } else {
      position = B_POSITION_PLAYER_LEFT;
    }
  } else {
    position = B_POSITION_OPPONENT_LEFT;
  }

  PrepareStringBattle(STRINGID_INTROSENDOUT, GetBattlerAtPosition(position));
  gBattleMainFunc = BattleIntroOpponent1SendsOutMonAnimation;
}

// ─── BattleIntroOpponent2SendsOutMonAnimation (3610) ───────────────────────

/** 1:1 décomp `BattleIntroOpponent2SendsOutMonAnimation()` (battle_main.c:3610-3640). */
export function BattleIntroOpponent2SendsOutMonAnimation(): void {
  let position: number;

  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    position = B_POSITION_OPPONENT_RIGHT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
      position = B_POSITION_OPPONENT_RIGHT;
    } else {
      position = B_POSITION_PLAYER_RIGHT;
    }
  } else {
    position = B_POSITION_OPPONENT_RIGHT;
  }

  for (let active = 0; active < gBattlersCount; active++) {
    if (GetBattlerPosition(active) === position) {
      setActiveBattler(active);
      BtlController_EmitIntroTrainerBallThrow(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
    }
  }

  gBattleMainFunc = BattleIntroRecordMonsToDex;
}

// ─── BattleIntroOpponent1SendsOutMonAnimation (3642) ───────────────────────

/** 1:1 décomp `BattleIntroOpponent1SendsOutMonAnimation()` (battle_main.c:3642-3683). */
export function BattleIntroOpponent1SendsOutMonAnimation(): void {
  let position: number;

  if (gBattleTypeFlags & BATTLE_TYPE_RECORDED) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
      if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
        position = B_POSITION_OPPONENT_LEFT;
      } else {
        position = B_POSITION_PLAYER_LEFT;
      }
    } else {
      position = B_POSITION_OPPONENT_LEFT;
    }
  } else {
    position = B_POSITION_OPPONENT_LEFT;
  }

  if (gBattleControllerExecFlags) return;

  for (let active = 0; active < gBattlersCount; active++) {
    if (GetBattlerPosition(active) === position) {
      setActiveBattler(active);
      BtlController_EmitIntroTrainerBallThrow(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
      if (gBattleTypeFlags & (BATTLE_TYPE_MULTI | BATTLE_TYPE_TWO_OPPONENTS)) {
        gBattleMainFunc = BattleIntroOpponent2SendsOutMonAnimation;
        return;
      }
    }
  }

  gBattleMainFunc = BattleIntroRecordMonsToDex;
}

// ─── BattleIntroRecordMonsToDex (3685) ─────────────────────────────────────

/** 1:1 décomp `BattleIntroRecordMonsToDex()` (battle_main.c:3685-3703). */
export function BattleIntroRecordMonsToDex(): void {
  if (gBattleControllerExecFlags === 0) {
    for (let active = 0; active < gBattlersCount; active++) {
      setActiveBattler(active);
      if (GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT
          && !(gBattleTypeFlags & (BATTLE_TYPE_EREADER_TRAINER
                                   | BATTLE_TYPE_FRONTIER
                                   | BATTLE_TYPE_LINK
                                   | BATTLE_TYPE_RECORDED_LINK
                                   | BATTLE_TYPE_TRAINER_HILL))) {
        HandleSetPokedexFlag(
          SpeciesToNationalPokedexNum(gBattleMons[active].species),
          2 /* FLAG_SET_SEEN */, gBattleMons[active].personality,
        );
      }
    }
    gBattleMainFunc = BattleIntroPrintPlayerSendsOut;
  }
}

// NON PORTÉS (volontaire) : `BattleIntroSkipRecordMonsToDex` (battle_main.c:3705)
// et `BattleIntroSwitchInPlayerMons` (battle_main.c:3820) sont marqués `UNUSED`
// dans la décomp (jamais référencés = hors graphe d'appels). Dette explicite
// plutôt que code mort.

// ─── BattleIntroPrintPlayerSendsOut (3711) ─────────────────────────────────

/** 1:1 décomp `BattleIntroPrintPlayerSendsOut()` (battle_main.c:3711-3738). */
export function BattleIntroPrintPlayerSendsOut(): void {
  if (gBattleControllerExecFlags === 0) {
    let position: number;

    if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
      position = B_POSITION_PLAYER_LEFT;
    } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
      if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
        position = B_POSITION_PLAYER_LEFT;
      } else {
        position = B_POSITION_OPPONENT_LEFT;
      }
    } else {
      position = B_POSITION_PLAYER_LEFT;
    }

    if (!(gBattleTypeFlags & BATTLE_TYPE_SAFARI)) {
      PrepareStringBattle(STRINGID_INTROSENDOUT, GetBattlerAtPosition(position));
    }

    gBattleMainFunc = BattleIntroPlayer1SendsOutMonAnimation;
  }
}

// ─── BattleIntroPlayer2SendsOutMonAnimation (3740) ─────────────────────────

/** 1:1 décomp `BattleIntroPlayer2SendsOutMonAnimation()` (battle_main.c:3740-3774). */
export function BattleIntroPlayer2SendsOutMonAnimation(): void {
  let position: number;

  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    position = B_POSITION_PLAYER_RIGHT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
      position = B_POSITION_PLAYER_RIGHT;
    } else {
      position = B_POSITION_OPPONENT_RIGHT;
    }
  } else {
    position = B_POSITION_PLAYER_RIGHT;
  }

  for (let active = 0; active < gBattlersCount; active++) {
    if (GetBattlerPosition(active) === position) {
      setActiveBattler(active);
      BtlController_EmitIntroTrainerBallThrow(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
    }
  }

  gBattleStruct.switchInAbilitiesCounter = 0;
  gBattleStruct.switchInItemsCounter = 0;
  gBattleStruct.overworldWeatherDone = 0;

  gBattleMainFunc = TryDoEventsBeforeFirstTurn;
}

// ─── BattleIntroPlayer1SendsOutMonAnimation (3776) ─────────────────────────

/** 1:1 décomp `BattleIntroPlayer1SendsOutMonAnimation()` (battle_main.c:3776-3818). */
export function BattleIntroPlayer1SendsOutMonAnimation(): void {
  let position: number;

  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    position = B_POSITION_PLAYER_LEFT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
      position = B_POSITION_PLAYER_LEFT;
    } else {
      position = B_POSITION_OPPONENT_LEFT;
    }
  } else {
    position = B_POSITION_PLAYER_LEFT;
  }

  if (gBattleControllerExecFlags) return;

  for (let active = 0; active < gBattlersCount; active++) {
    if (GetBattlerPosition(active) === position) {
      setActiveBattler(active);
      BtlController_EmitIntroTrainerBallThrow(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
      if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
        gBattleMainFunc = BattleIntroPlayer2SendsOutMonAnimation;
        return;
      }
    }
  }

  gBattleStruct.switchInAbilitiesCounter = 0;
  gBattleStruct.switchInItemsCounter = 0;
  gBattleStruct.overworldWeatherDone = 0;

  gBattleMainFunc = TryDoEventsBeforeFirstTurn;
}

// ─── TryDoEventsBeforeFirstTurn (3841) ─────────────────────────────────────

/** 1:1 décomp `TryDoEventsBeforeFirstTurn()` (battle_main.c:3841-3930).
 *  Run les switch-in abilities + items dans l'ordre de speed avant le 1er turn. */
/** Exécute le script de talent de switch-in que `AbilityBattleEffects` vient de mettre
 *  en file (via `consumeAbilityWantedScript`). 1:1 décomp : AbilityBattleEffects appelle
 *  `BattleScriptPushCursorAndCallback(script)` EN INTERNE ; notre port délègue le lancement
 *  au caller → on exécute le script via BattleScriptExecute (push gBattleMainFunc +
 *  RunBattleScriptCommands_PopCallbacksStack ; le script finit par end3 → pop via la
 *  branche scriptPtr<0 de PopCallbacksStack). SANS ÇA, les talents de switch-in (Intimidate,
 *  météo, Trace) sont détectés mais leur effet/message ne s'applique JAMAIS au début de
 *  combat (l'Attaque du joueur ne baisse pas face à un ennemi Intimidate). */
function _ExecSwitchInAbilityScript(): void {
  const label = consumeAbilityWantedScript();
  if (label) BattleScriptExecute(label);
}

/** Idem pour les ITEMS de switch-in (`ItemBattleEffects(ITEMEFFECT_ON_SWITCH_IN)` →
 *  `consumeItemWantedScript`). MÊME bug que les talents : le caller faisait `return`
 *  sans exécuter le script. Au début de combat, seul White Herb (HOLD_EFFECT_RESTORE_STATS
 *  → `BattleScript_WhiteHerbEnd2`) en file un — il restaure les stats baissées (ex. contre
 *  Intimidate). Le script finit par end2 → branche TRY_FINISH de PopCallbacksStack. Garde
 *  contre les labels placeholder `__…` (= signaux non-script d'autres itemEffects). */
function _ExecSwitchInItemScript(): void {
  const label = consumeItemWantedScript();
  if (label && !label.startsWith('__')) BattleScriptExecute(label);
}

export function TryDoEventsBeforeFirstTurn(): void {
  let effect = 0;

  if (gBattleControllerExecFlags) return;

  if (gBattleStruct.switchInAbilitiesCounter === 0) {
    for (let i = 0; i < gBattlersCount; i++) {
      gBattlerByTurnOrder[i] = i;
    }
    // 1:1 décomp ll. 3854-3862 : insertion sort par speed.
    for (let i = 0; i < gBattlersCount - 1; i++) {
      for (let j = i + 1; j < gBattlersCount; j++) {
        if (GetWhoStrikesFirst(gBattlerByTurnOrder[i], gBattlerByTurnOrder[j], true) !== 0) {
          SwapTurnOrder(i, j);
        }
      }
    }
  }

  if (!gBattleStruct.overworldWeatherDone
      && AbilityBattleEffects(0, 0, 0, ABILITYEFFECT_SWITCH_IN_WEATHER, 0) !== 0) {
    gBattleStruct.overworldWeatherDone = 1;
    _ExecSwitchInAbilityScript();
    return;
  }

  // 1:1 décomp ll. 3869-3879 : run switch-in abilities du plus rapide au plus lent.
  while (gBattleStruct.switchInAbilitiesCounter < gBattlersCount) {
    if (AbilityBattleEffects(
      ABILITYEFFECT_ON_SWITCHIN,
      gBattlerByTurnOrder[gBattleStruct.switchInAbilitiesCounter],
      0, 0, 0,
    ) !== 0) {
      effect++;
    }

    gBattleStruct.switchInAbilitiesCounter++;

    if (effect !== 0) { _ExecSwitchInAbilityScript(); return; }
  }

  if (AbilityBattleEffects(ABILITYEFFECT_INTIMIDATE1, 0, 0, 0, 0) !== 0) { _ExecSwitchInAbilityScript(); return; }
  if (AbilityBattleEffects(ABILITYEFFECT_TRACE, 0, 0, 0, 0) !== 0) { _ExecSwitchInAbilityScript(); return; }

  // 1:1 décomp ll. 3884-3894 : run switch-in items.
  while (gBattleStruct.switchInItemsCounter < gBattlersCount) {
    if (ItemBattleEffects(
      ITEMEFFECT_ON_SWITCH_IN,
      gBattlerByTurnOrder[gBattleStruct.switchInItemsCounter],
      false,
    )) {
      effect++;
    }

    gBattleStruct.switchInItemsCounter++;

    if (effect !== 0) { _ExecSwitchInItemScript(); return; }
  }

  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    gBattleStruct.monToSwitchIntoId[i] = PARTY_SIZE;
    gChosenActionByBattler[i] = B_ACTION_NONE;
    gChosenMoveByBattler[i] = MOVE_NONE;
  }
  TurnValuesCleanUp(false);
  SpecialStatusesClear();

  gBattleStruct.absentBattlerFlags = gAbsentBattlerFlags;
  BattlePutTextOnWindow(gText_EmptyString3, B_WIN_MSG);

  // 1:1 décomp l. 3905 : gBattleMainFunc = HandleTurnActionSelectionState.
  // La vraie fn vit dans battle-action-selection.ts (port 1:1 complet) ;
  // résolue via __battleActionSelection (lazy-global = évite le cycle ESM, car
  // battle-action-selection importe setBattleMainFunc d'ici). Stub = fallback.
  gBattleMainFunc = _getHandleTurnActionSelectionState();
  ResetSentPokesToOpponentValue();

  for (let i = 0; i < BATTLE_COMMUNICATION_ENTRIES_COUNT; i++) {
    gBattleCommunication[i] = 0;
  }

  for (let i = 0; i < gBattlersCount; i++) {
    gBattleMons[i].status2 &= ~STATUS2_FLINCHED;
  }

  gBattleStruct.turnEffectsTracker = 0;
  gBattleStruct.turnEffectsBattlerId = 0;
  gBattleStruct.wishPerishSongState = 0;
  gBattleStruct.wishPerishSongBattlerId = 0;
  gBattleScripting.moveendState = 0;
  gBattleStruct.faintedActionsState = 0;
  gBattleStruct.turnCountersTracker = 0;
  setMoveResultFlags(0);

  setRandomTurnNumber(Random() & 0xFFFF);

  if (gBattleTypeFlags & BATTLE_TYPE_ARENA) {
    StopCryAndClearCrySongs();
    BattleScriptExecute('BattleScript_ArenaTurnBeginning');
  }
}

/** Résout la vraie `HandleTurnActionSelectionState` (battle-action-selection.ts,
 *  port 1:1 complet de battle_main.c:4129-4552) via le global expose, pour
 *  éviter le cycle ESM (battle-action-selection importe setBattleMainFunc d'ici).
 *  Fallback = stub si le module n'est pas chargé. */
function _getHandleTurnActionSelectionState(): () => void {
  const m = (globalThis as Record<string, unknown>).__battleActionSelection as {
    HandleTurnActionSelectionState?: () => void;
  } | undefined;
  return m?.HandleTurnActionSelectionState ?? _HandleTurnActionSelectionStateStub;
}

/** Fallback uniquement (= module battle-action-selection pas chargé). La vraie
 *  fn est `HandleTurnActionSelectionState` dans battle-action-selection.ts. */
function _HandleTurnActionSelectionStateStub(): void {
  // No-op de secours : si on est ici, le module action-selection n'a pas chargé.
}

// ─── HandleEndTurn_ContinueBattle (3932) ───────────────────────────────────

/** 1:1 décomp `HandleEndTurn_ContinueBattle()` (battle_main.c:3932-3954). */
export function HandleEndTurn_ContinueBattle(): void {
  if (gBattleControllerExecFlags === 0) {
    gBattleMainFunc = _BattleTurnPassed;
    for (let i = 0; i < BATTLE_COMMUNICATION_ENTRIES_COUNT; i++) {
      gBattleCommunication[i] = 0;
    }
    for (let i = 0; i < gBattlersCount; i++) {
      gBattleMons[i].status2 &= ~STATUS2_FLINCHED;
      // 1:1 C:3944-3945 (AUDIT 2026-06, manquait) : un mon ENDORMI avec un move
      // multi-tours (Thrash/Rollout/Uproar/Bide...) voit son lock annule chaque tour.
      if ((gBattleMons[i].status1 & STATUS1_SLEEP) && (gBattleMons[i].status2 & STATUS2_MULTIPLETURNS)) {
        CancelMultiTurnMoves(i);
      }
    }
    gBattleStruct.turnEffectsTracker = 0;
    gBattleStruct.turnEffectsBattlerId = 0;
    gBattleStruct.wishPerishSongState = 0;
    gBattleStruct.wishPerishSongBattlerId = 0;
    gBattleStruct.turnCountersTracker = 0;
    setMoveResultFlags(0);
    // AUDIT 2026-06 : retires d'ici (PAS dans C:3932-3954) : moveendState=0,
    // faintedActionsState=0, setRandomTurnNumber — tous faits 1:1 par notre
    // BattleTurnPassed (C:3973/3981/4013), qui suit immediatement.
  }
}

/** 1:1 décomp `BattleTurnPassed()` (battle_main.c:3956-4019).
 *  Étapes 1-16 (TurnValuesCleanUp, DoField/BattlerEndTurnEffects = dégâts
 *  poison/brûlure/météo, HandleWishPerishSong, reset markers/comm/chosen/turnCounter)
 *  exécutées par le wire 1:1 `runBattleTurnPassedViaBytecode` (rafale ; pacing
 *  per-frame des effets end-turn = dette R3). Puis pose `gBattleMainFunc` — la
 *  dernière ligne de la décomp, qui manquait (stub) → le tour 2 ne démarrait jamais :
 *   - outcome == 0  → `HandleTurnActionSelectionState` (nouveau tour)
 *   - outcome != 0  → `RunTurnActionsFunctions` (le wire a posé gCurrentActionFuncId
 *     = B_ACTION_FINISHED → HandleAction_TryFinish → fin de combat). */
function _BattleTurnPassed(): void {
  const res = runBattleTurnPassedViaBytecode();
  if (res?.battleEnded) {
    const td = (globalThis as { __battleTurnDispatch?: { RunTurnActionsFunctions?: () => void } }).__battleTurnDispatch;
    if (td?.RunTurnActionsFunctions) gBattleMainFunc = td.RunTurnActionsFunctions;
    return;
  }
  gBattleMainFunc = _getHandleTurnActionSelectionState();
}

// ─── HandleEndTurn_BattleWon (4960) ────────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_BattleWon()` (battle_main.c:4960-5016).
 *  Dispatch outcome WON → BGM + script approprié. */
export function HandleEndTurn_BattleWon(): void {
  setCurrentActionFuncId(0);

  if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
    // 1:1 décomp ll. 4965-4970 : link battle outcome script.
    const stateMod = _stateNs as unknown as { setSpecialVarResult?: (v: number) => void; gBattleTextBuff1: number[]; };
    stateMod.setSpecialVarResult?.(gBattleOutcome);
    stateMod.gBattleTextBuff1[0] = gBattleOutcome;
    setBattlerAttacker(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
    gBattlescriptCurrInstr = BattleScript_LinkBattleWonOrLost;
    // Voie L : pose le scriptPtr sur le ctx persistant (HandleEndTurn_FinishBattle
    // le steppe per-frame), MÊME mécanisme que les branches wild/local-trainer
    // ci-dessous. Sans ça `gBattlescriptCurrInstr = {}` (vestige) ne déroulait
    // jamais BattleScript_LinkBattleWonOrLost. (label présent dans la table.)
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_LinkBattleWonOrLost');
    setBattleOutcome(gBattleOutcome & ~B_OUTCOME_LINK_BATTLE_RAN);
  } else if (gBattleTypeFlags & BATTLE_TYPE_TRAINER
             && gBattleTypeFlags & (BATTLE_TYPE_FRONTIER | BATTLE_TYPE_TRAINER_HILL | BATTLE_TYPE_EREADER_TRAINER)) {
    // 1:1 décomp ll. 4972-4982 : Frontier/Trainer Hill victory.
    BattleStopLowHpSound();
    gBattlescriptCurrInstr = BattleScript_FrontierTrainerBattleWon;
    // Voie L : idem — pose le scriptPtr (label présent dans la table d'offsets).
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_FrontierTrainerBattleWon');

    const trainerOpponentA = _getTrainerBattleOpponentA();
    // 1:1 décomp `TRAINER_FRONTIER_BRAIN` (include/constants/trainers.h:12) = 1022.
    const TRAINER_FRONTIER_BRAIN = 1022;
    if (trainerOpponentA === TRAINER_FRONTIER_BRAIN) {
      PlayBGM(354 /* MUS_VICTORY_GYM_LEADER (songs.h:285) — AUDIT 2026-06 : était 382 */);
    } else {
      PlayBGM(412 /* MUS_VICTORY_TRAINER (songs.h:343) — AUDIT 2026-06 : était 380 */);
    }
  } else if (gBattleTypeFlags & BATTLE_TYPE_TRAINER && !(gBattleTypeFlags & BATTLE_TYPE_LINK)) {
    // 1:1 décomp ll. 4983-5008 : local trainer victory + BGM par classe.
    BattleStopLowHpSound();
    // Voie L : pose le scriptPtr sur le ctx persistant (HandleEndTurn_FinishBattle
    // le steppe per-frame), comme la branche wild (PayDay) ci-dessous. Sans ça
    // `gBattlescriptCurrInstr = {}` (stub) ne lançait PAS le script de victoire
    // dresseur → ni "Vous avez battu X!" ni l'argent. (= dette #31 côté L.)
    gBattlescriptCurrInstr = BattleScript_LocalTrainerBattleWon;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_LocalTrainerBattleWon');

    const trainerOpponentA = _getTrainerBattleOpponentA();
    const trainerClass = _getTrainerClass(trainerOpponentA);

    // 1:1 trainers.h:291-341 — AUDIT 2026-06 : les 9 valeurs étaient fausses
    // (84/85/24/26/23/25/27/28/30, des ids d'une autre gen).
    const TRAINER_CLASS_ELITE_FOUR = 0x1f;
    const TRAINER_CLASS_CHAMPION = 0x26;
    const TRAINER_CLASS_TEAM_AQUA = 0x3;
    const TRAINER_CLASS_TEAM_MAGMA = 0x9;
    const TRAINER_CLASS_AQUA_ADMIN = 0xb;
    const TRAINER_CLASS_AQUA_LEADER = 0xd;
    const TRAINER_CLASS_MAGMA_ADMIN = 0x31;
    const TRAINER_CLASS_MAGMA_LEADER = 0x35;
    const TRAINER_CLASS_LEADER = 0x20;

    switch (trainerClass) {
      case TRAINER_CLASS_ELITE_FOUR:
      case TRAINER_CLASS_CHAMPION:
        PlayBGM(355 /* MUS_VICTORY_LEAGUE (songs.h:286) — AUDIT 2026-06 : était 381 */);
        break;
      case TRAINER_CLASS_TEAM_AQUA:
      case TRAINER_CLASS_TEAM_MAGMA:
      case TRAINER_CLASS_AQUA_ADMIN:
      case TRAINER_CLASS_AQUA_LEADER:
      case TRAINER_CLASS_MAGMA_ADMIN:
      case TRAINER_CLASS_MAGMA_LEADER:
        PlayBGM(424 /* MUS_VICTORY_AQUA_MAGMA (songs.h:355) — AUDIT 2026-06 : était 383 */);
        break;
      case TRAINER_CLASS_LEADER:
        PlayBGM(354 /* MUS_VICTORY_GYM_LEADER (songs.h:285) — AUDIT 2026-06 : était 382 */);
        break;
      default:
        PlayBGM(412 /* MUS_VICTORY_TRAINER (songs.h:343) — AUDIT 2026-06 : était 380 */);
        break;
    }
  } else {
    // 1:1 décomp ll. 5010-5013 : wild battle won → payday + pick up items script.
    // Voie L : pose le scriptPtr sur le ctx persistant (HandleEndTurn_FinishBattle
    // le steppe per-frame ; le vestige gBattlescriptCurrInstr est gardé pour trace).
    gBattlescriptCurrInstr = BattleScript_PayDayMoneyAndPickUpItems;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_PayDayMoneyAndPickUpItems');
  }

  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_BattleLost (5018) ───────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_BattleLost()` (battle_main.c:5018-5052). */
export function HandleEndTurn_BattleLost(): void {
  setCurrentActionFuncId(0);

  if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
    if (gBattleTypeFlags & BATTLE_TYPE_FRONTIER) {
      if (gBattleOutcome & B_OUTCOME_LINK_BATTLE_RAN) {
        // 1:1 décomp ll. 5028-5030. Voie L : pose le scriptPtr (label présent).
        gBattlescriptCurrInstr = BattleScript_PrintPlayerForfeitedLinkBattle;
        gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_PrintPlayerForfeitedLinkBattle');
        setBattleOutcome(gBattleOutcome & ~B_OUTCOME_LINK_BATTLE_RAN);
        // 1:1 décomp : gSaveBlock2Ptr->frontier.disableRecordBattle = TRUE.
        const sb2 = gSaveBlock2Ptr as { frontier?: { disableRecordBattle?: boolean } };
        if (sb2.frontier) sb2.frontier.disableRecordBattle = true;
      } else {
        // 1:1 décomp ll. 5034-5035. Voie L : pose le scriptPtr (label présent).
        gBattlescriptCurrInstr = BattleScript_FrontierLinkBattleLost;
        gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_FrontierLinkBattleLost');
        setBattleOutcome(gBattleOutcome & ~B_OUTCOME_LINK_BATTLE_RAN);
      }
    } else {
      // 1:1 décomp ll. 5040-5043. Voie L : pose le scriptPtr (label présent).
      const stateMod = _stateNs as unknown as { gBattleTextBuff1: number[] };
      stateMod.gBattleTextBuff1[0] = gBattleOutcome;
      setBattlerAttacker(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
      gBattlescriptCurrInstr = BattleScript_LinkBattleWonOrLost;
      gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_LinkBattleWonOrLost');
      setBattleOutcome(gBattleOutcome & ~B_OUTCOME_LINK_BATTLE_RAN);
    }
  } else {
    // 1:1 décomp ll. 5040 : défaite LOCALE (sauvage/dresseur) → script whiteout.
    // Voie L : pose le scriptPtr sur le ctx persistant (HandleEndTurn_FinishBattle
    // le steppe per-frame), = MÊME fix que HandleEndTurn_BattleWon:1452-1453. Sans
    // ça le script de défaite ne déroulait jamais (combat figé sur
    // HandleEndTurn_FinishBattle alors que gBattleOutcome=LOST était bien posé).
    gBattlescriptCurrInstr = BattleScript_LocalBattleLost;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_LocalBattleLost');
  }

  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_RanFromBattle (5054) ────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_RanFromBattle()` (battle_main.c:5054-5086). */
export function HandleEndTurn_RanFromBattle(): void {
  setCurrentActionFuncId(0);

  if (gBattleTypeFlags & BATTLE_TYPE_FRONTIER && gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    gBattlescriptCurrInstr = BattleScript_PrintPlayerForfeited;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_PrintPlayerForfeited');
    setBattleOutcome(B_OUTCOME_FORFEITED);
    const sb2 = gSaveBlock2Ptr as { frontier?: { disableRecordBattle?: boolean } };
    if (sb2.frontier) sb2.frontier.disableRecordBattle = true;
  } else if (gBattleTypeFlags & BATTLE_TYPE_TRAINER_HILL) {
    gBattlescriptCurrInstr = BattleScript_PrintPlayerForfeited;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_PrintPlayerForfeited');
    setBattleOutcome(B_OUTCOME_FORFEITED);
  } else {
    // 1:1 décomp ll. 5070-5083 : switch sur fleeType.
    const fleeType = gBattleStruct ? (_stateNs as unknown as {
      gProtectStructs: Array<{ fleeType?: number }>;
    }).gProtectStructs[gBattlerAttacker].fleeType ?? 0 : 0;
    switch (fleeType) {
      default:
        gBattlescriptCurrInstr = BattleScript_GotAwaySafely;
        gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_GotAwaySafely');
        break;
      case FLEE_ITEM:
        gBattlescriptCurrInstr = BattleScript_SmokeBallEscape;
        gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_SmokeBallEscape');
        break;
      case FLEE_ABILITY:
        gBattlescriptCurrInstr = BattleScript_RanAwayUsingMonAbility;
        gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_RanAwayUsingMonAbility');
        break;
    }
  }

  // Voie L : HandleEndTurn_FinishBattle steppe gBattleScriptContext per-frame — il
  // FAUT poser ctx.scriptPtr sur l'offset (pas juste gBattlescriptCurrInstr=<stub>),
  // = MÊME fix que HandleEndTurn_BattleWon:1453. Sans ça le script de fuite ne tourne
  // jamais → freeze à FinishBattle (vérifié : FUITE bloquait l'onglet).
  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_MonFled (5088) ──────────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_MonFled()` (battle_main.c:5088-5096). */
export function HandleEndTurn_MonFled(): void {
  setCurrentActionFuncId(0);

  const stateMod = _stateNs as unknown as { gBattleTextBuff1: number[]; gBattlerPartyIndexes: number[] };
  PREPARE_MON_NICK_BUFFER(
    stateMod.gBattleTextBuff1, gBattlerAttacker,
    stateMod.gBattlerPartyIndexes[gBattlerAttacker],
  );
  gBattlescriptCurrInstr = BattleScript_WildMonFled;
  gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_WildMonFled');

  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_FinishBattle (5098) ─────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_FinishBattle()` (battle_main.c:5098-5153). */
export function HandleEndTurn_FinishBattle(): void {
  if (gCurrentActionFuncId === B_ACTION_TRY_FINISH || gCurrentActionFuncId === B_ACTION_FINISHED) {
    // 1:1 décomp ll. 5102-5127 : record player party mons + TV trigger.
    if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK
                              | BATTLE_TYPE_RECORDED_LINK
                              | BATTLE_TYPE_FIRST_BATTLE
                              | BATTLE_TYPE_SAFARI
                              | BATTLE_TYPE_EREADER_TRAINER
                              | BATTLE_TYPE_WALLY_TUTORIAL
                              | BATTLE_TYPE_FRONTIER))) {
      const playerParty = _getPlayerParty();
      for (let active = 0; active < gBattlersCount; active++) {
        setActiveBattler(active);
        if (GET_BATTLER_SIDE(active) === B_SIDE_PLAYER) {
          const stateMod = _stateNs as unknown as { gBattlerPartyIndexes: number[] };
          const partyIdx = stateMod.gBattlerPartyIndexes[active] ?? 0;
          if (gBattleResults.playerMon1Species === SPECIES_NONE) {
            gBattleResults.playerMon1Species = GetMonData(
              playerParty[partyIdx] as never, MON_DATA_SPECIES,
            ) as number;
            const name = GetMonData(playerParty[partyIdx] as never, MON_DATA_NICKNAME) as unknown;
            if (Array.isArray(name)) {
              for (let i = 0; i < gBattleResults.playerMon1Name.length && i < name.length; i++) {
                gBattleResults.playerMon1Name[i] = name[i];
              }
            }
          } else {
            gBattleResults.playerMon2Species = GetMonData(
              playerParty[partyIdx] as never, MON_DATA_SPECIES,
            ) as number;
            const name = GetMonData(playerParty[partyIdx] as never, MON_DATA_NICKNAME) as unknown;
            if (Array.isArray(name)) {
              for (let i = 0; i < gBattleResults.playerMon2Name.length && i < name.length; i++) {
                gBattleResults.playerMon2Name[i] = name[i];
              }
            }
          }
        }
      }
      TryPutPokemonTodayOnAir();
    }

    // 1:1 décomp ll. 5129-5140 : shiny wild news trigger.
    if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK
                              | BATTLE_TYPE_RECORDED_LINK
                              | BATTLE_TYPE_TRAINER
                              | BATTLE_TYPE_FIRST_BATTLE
                              | BATTLE_TYPE_SAFARI
                              | BATTLE_TYPE_FRONTIER
                              | BATTLE_TYPE_EREADER_TRAINER
                              | BATTLE_TYPE_WALLY_TUTORIAL))
        && gBattleResults.shinyWildMon) {
      TryPutBreakingNewsOnAir();
    }

    RecordedBattle_SetPlaybackFinished();
    BeginFastPaletteFade(3);
    FadeOutMapMusic(5);
    gBattleMainFunc = FreeResetData_ReturnToOvOrDoEvolutions;
    SetCB2AfterEvolution_Foyer(BattleMainCB2);  // 1:1 gCB2_AfterEvolution = BattleMainCB2
  } else {
    // 1:1 décomp ll. 5150-5152 :
    //   `if (gBattleControllerExecFlags == 0) gBattleScriptingCommandsTable[*gBattlescriptCurrInstr]();`
    // Voie L : step le script (PayDay/LocalBattleWon/…) via le ctx persistant.
    // Quand le script finit par `end` → gCurrentActionFuncId=TRY_FINISH → la branche
    // cleanup+fade ci-dessus s'exécute au frame suivant.
    if (gBattleControllerExecFlags === 0) {
      stepBattleScriptCommand(gBattleScriptContext);
    }
  }
}

// ─── FreeResetData_ReturnToOvOrDoEvolutions (5155) ─────────────────────────

/** 1:1 décomp `FreeResetData_ReturnToOvOrDoEvolutions()` (battle_main.c:5155-5178). */
export function FreeResetData_ReturnToOvOrDoEvolutions(): void {
  const r = getRuntime();
  if (!r.gPaletteFade.active) {
    ResetSpriteData();
    if (gLeveledUpInBattle === 0 || gBattleOutcome !== B_OUTCOME_WON) {
      gBattleMainFunc = ReturnFromBattleToOverworld;
      return;
    } else {
      gBattleMainFunc = TryEvolvePokemon;
    }
  }

  FreeAllWindowBuffers();
  if (!(gBattleTypeFlags & BATTLE_TYPE_LINK)) {
    FreeMonSpritesGfx();
    FreeBattleResources();
    FreeBattleSpritesData();
  }
}

// ─── TryEvolvePokemon (5180) ───────────────────────────────────────────────

/** 1:1 décomp `TryEvolvePokemon()` (battle_main.c:5180-5209). */
export function TryEvolvePokemon(): void {
  const playerParty = _getPlayerParty();

  while (gLeveledUpInBattle !== 0) {
    for (let i = 0; i < PARTY_SIZE; i++) {
      if (gLeveledUpInBattle & _gBitTable[i]) {
        const levelUpBits = gLeveledUpInBattle;
        const newLevelUpBits = levelUpBits & ~_gBitTable[i];
        setLeveledUpInBattle(newLevelUpBits);

        const species = GetEvolutionTargetSpecies(
          playerParty[i], 0 /* EVO_MODE_NORMAL */, levelUpBits,
        );
        if (species !== SPECIES_NONE) {
          FreeAllWindowBuffers();
          gBattleMainFunc = WaitForEvoSceneToFinish;
          EvolutionScene(playerParty[i], species, true, i);
          return;
        }
      }
    }
  }

  gBattleMainFunc = ReturnFromBattleToOverworld;
}

// ─── WaitForEvoSceneToFinish (5211) ────────────────────────────────────────

/** 1:1 décomp `WaitForEvoSceneToFinish()` (battle_main.c:5211-5215) :
 *  `if (gMain.callback2 == BattleMainCB2) gBattleMainFunc = TryEvolvePokemon;`
 *  — la scène rend la main en posant gCB2_AfterEvolution (= BattleMainCB2). */
export function WaitForEvoSceneToFinish(): void {
  if (getRuntime().gMain.callback2 === (BattleMainCB2 as unknown))
    gBattleMainFunc = TryEvolvePokemon;
}

// ─── ReturnFromBattleToOverworld (5217) ────────────────────────────────────

/** 1:1 décomp `ReturnFromBattleToOverworld()` (battle_main.c:5217-5249). */
export function ReturnFromBattleToOverworld(): void {
  // Échafaudage devtools (non-1:1) : restaure la party OW si un COMBAT DE TEST
  // l'avait remplacée (backupOwPartyForTest dans setupPartyForBattle). No-op pour
  // les combats RÉELS (pas de backup → la party de combat EST la party OW).
  restoreOwPartyAfterTest();
  const playerParty = _getPlayerParty();

  if (!(gBattleTypeFlags & BATTLE_TYPE_LINK)) {
    RandomlyGivePartyPokerus(playerParty);
    PartySpreadPokerus(playerParty);
  }

  // 1:1 décomp ll. 5225-5226 : link battle wait remote players.
  // Notre port : pas de link battle, skip.

  const stateMod = _stateNs as unknown as { setSpecialVarResult?: (v: number) => void };
  stateMod.setSpecialVarResult?.(gBattleOutcome);
  setMainInBattle(false);
  // 1:1 décomp `gMain.inBattle = FALSE` : reset AUSSI le flag RUNTIME (double-flag —
  // CB2_InitBattleInternal + FreeRestoreBattleData écrivent les DEUX ; setMainInBattle n'écrit que la
  // var module). Sans ça, gMain.inBattle (runtime) leak à true après le combat voie L → le poll
  // `!gMain.inBattle` du reflip trainer (_runTrainerBattle) ou tout consommateur du flag runtime hange.
  getRuntime().gMain.inBattle = false;
  // 1:1 décomp `gMain.callback1 = gPreBattleCallback1` (battle_main.c:5230). DOIT
  // écrire le RUNTIME (pas juste la var module) — sinon le runtime garde
  // callback1 = BattleMainCB1 → la boucle combat continue de rappeler
  // gBattleMainFunc = ReturnFromBattleToOverworld CHAQUE frame, qui re-pose
  // callback2 = savedCallback (one-shot devenu no-op) → MainCB2_Overworld jamais
  // rétabli → OW rendu mais FIGÉ (freeze signalé user). `setMainCallback1` écrit
  // la var module ET getRuntime().SetMainCallback1. gPreBattleCallback1 = le
  // callback1 pré-combat (sauvé case 18, battle-link-start.ts:228 — null/anon en OW).
  setMainCallback1(_gPreBattleCallback1);

  if (gBattleTypeFlags & BATTLE_TYPE_ROAMER) {
    const enemyParty = _getEnemyParty();
    UpdateRoamerHPStatus(enemyParty[0]);

    // 1:1 décomp BUGFIX path (= conditional compilation) :
    // if (outcome == WON || outcome == CAUGHT || outcome == DREW) → roamer inactive.
    if (gBattleOutcome === B_OUTCOME_WON
        || gBattleOutcome === B_OUTCOME_CAUGHT
        || gBattleOutcome === B_OUTCOME_DREW) {
      SetRoamerInactive();
    }
  }

  m4aSongNumStop(287 /* SE_LOW_HEALTH */);
  SetMainCallback2(_gMain_savedCallback);
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleMainFunctions = {
  BeginBattleIntroDummy, BeginBattleIntro, BattleStartClearSetData,
  BattleIntroGetMonsData, BattleIntroPrepareBackgroundSlide,
  BattleIntroDrawTrainersOrMonsSprites, BattleIntroDrawPartySummaryScreens,
  BattleIntroPrintTrainerWantsToBattle, BattleIntroPrintWildMonAttacked,
  BattleIntroPrintOpponentSendsOut, BattleIntroOpponent1SendsOutMonAnimation,
  BattleIntroOpponent2SendsOutMonAnimation, BattleIntroRecordMonsToDex,
  BattleIntroPrintPlayerSendsOut, BattleIntroPlayer1SendsOutMonAnimation,
  BattleIntroPlayer2SendsOutMonAnimation, TryDoEventsBeforeFirstTurn,
  HandleEndTurn_ContinueBattle, HandleEndTurn_BattleWon,
  HandleEndTurn_BattleLost, HandleEndTurn_RanFromBattle, HandleEndTurn_MonFled,
  HandleEndTurn_FinishBattle, FreeResetData_ReturnToOvOrDoEvolutions,
  TryEvolvePokemon, WaitForEvoSceneToFinish, ReturnFromBattleToOverworld,
  getBattleMainFunc, setBattleMainFunc,
  BattleScriptExecute, RunBattleScriptCommands_PopCallbacksStack,
  // Famille callback1 / inBattle / savedCallback : requise par battle-link-start
  // (_setMainCallback1 case 18), battle-cb2 (FreeRestoreBattleData) et battle-init
  // (setMainInBattle). setMainCallback1 écrit le runtime (gMain.callback1) → c'est
  // ce qui installe BattleMainCB1 et fait tourner gBattleMainFunc.
  setMainCallback1, getMainCallback1,
  setMainInBattle, getMainInBattle,
  setPreBattleCallback1, getPreBattleCallback1,
  setMainSavedCallback, getMainSavedCallback,
  setCB2AfterEvolution, getCB2AfterEvolution,
  IsMonShiny, SpeciesToNationalPokedexNum, HandleSetPokedexFlag,
  GetWhoStrikesFirst, SwapTurnOrder,
  // gIntroSlideFlags (1:1) : lu par les SpriteCB de slide (battle-sprite-callbacks.ts
  // _getIntroSlideFlags) pour geler le slide du mon sauvage / dresseur pendant l'ouverture
  // des bandes ; écrit par PlayerHandleIntroSlide (SET) + tickBattleIntroSlideL case 2 (CLEAR).
  getIntroSlideFlags, setIntroSlideFlags,
};

// Suppress unused warnings (= imports utilisés indirectly via stubs/setters).
void gPalaceSelectionBattleScripts;
/**
 * battle/battle-link-start.ts — Port 1:1 strict de FindLinkBattleMaster +
 * CB2_HandleStartBattle.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *
 * Fonctions portées 1:1 :
 *   - FindLinkBattleMaster (897-951) — détermine le master link battle
 *     selon version + multiplayerId
 *   - CB2_HandleStartBattle (953-1159) — state machine 18 cases pour
 *     link battle handshake (= envoi/réception party Pokémon, RNG seed,
 *     init sprites)
 *
 * Note : link battle est non-applicable à notre démo offline. Le port
 * existe pour completeness 1:1 strict — cascade massive R3 vers
 * gBlockRecvBuffer / SendBlock / IsLinkTaskFinished / etc.
 *
 * Dépendances :
 *   - state.ts : gBattleTypeFlags, gBattleCommunication, gBattleStruct,
 *     gBattleScripting, gTrainerBattleOpponent_A
 *   - constants.ts : BATTLE_TYPE_* flags
 */

// ═══ SECTION battle-link-start — CONSOLIDÉE PHYSIQUEMENT (C8, 2026-06-10) ════
// 1:1 battle_main.c : CB2_HandleStartBattle (:953-1159, machine 18 cases —
// offline skip à case 15) + FindLinkBattleMaster + helpers link (dettes R3 doc).
// L'ancien module engine/battle/battle-link-start.ts = shim re-export.
// (gBattleTypeFlags/gBattleCommunication/gTrainerBattleOpponent_A/BATTLE_TYPE_LINK/
//  RECORDED [tête] ; gBattleScripting [C4] ; gBattleStruct [C2] ; getRuntime [tête].)

import { setBattleTypeFlags } from './engine/battle/state';
import { InitBattleControllers as _InitBattleControllersImpl } from './battle_controllers';
import { ShowBg } from './window';
import { FillAroundBattleWindows } from './battle_gfx_sfx_util';
import { IsDma3ManagerBusyWithBgCopy } from './battle_bg';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `BATTLE_TYPE_IS_MASTER` = bit 2 (battle.h:61 — « In not-link
 *  battles, it's always set »). ⚠️ AUDIT 2026-06 : était 1<<24 = bit
 *  BATTLE_TYPE_RECORDED → RECORDED se retrouvait SET à CHAQUE combat offline
 *  (VBlankCB cessait d'avancer le RNG, branches recorded prises). */
const BATTLE_TYPE_IS_MASTER = 1 << 2;
/** 1:1 décomp `BATTLE_TYPE_TRAINER` = bit 3. */
const BATTLE_TYPE_TRAINER_LOCAL = 1 << 3;
/** 1:1 décomp `BATTLE_TYPE_LINK_IN_BATTLE` = bit 5 (battle.h:64). AUDIT 2026-06 : était 1<<18. */
const BATTLE_TYPE_LINK_IN_BATTLE = 1 << 5;
/** 1:1 décomp `BIT_SIDE` = 1. */
const BIT_SIDE = 1;
/** 1:1 décomp `MULTIUSE_STATE` = 0. */
// (MULTIUSE_STATE : déclaré en tête.)
/** 1:1 décomp `SPRITES_INIT_STATE1` = 1, `SPRITES_INIT_STATE2` = 2. */
// (SPRITES_INIT_STATE1 : déclaré plus haut.)
const SPRITES_INIT_STATE2 = 2;
/** 1:1 décomp `TRAINER_UNION_ROOM` = 3072 (trainers.h:16). AUDIT 2026-06 : était 1025. */
const TRAINER_UNION_ROOM = 3072;
/** 1:1 décomp `VERSION_EMERALD` (global.h:10) = 3. AUDIT FIX : était 5 (= VERSION_LEAFGREEN). */
const VERSION_EMERALD = 3;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `gBlockRecvBuffer[i][word]` — link battle recv buffer. */
function _getBlockRecvBuffer(_player: number, _word: number): number {
  // Dette R3 : link cable recv buffer. Pour now : default 0.
  return 0;
}

/** 1:1 décomp `GetMultiplayerId()`. */
function _GetMultiplayerId(): number {
  return 0;  // Single player.
}

/** 1:1 décomp `IsDma3ManagerBusyWithBgCopy()`. */
function _IsDma3ManagerBusyWithBgCopy(): boolean {
  // 1:1 : gate réel (battle-bg) — TRUE pendant les chargements BG async du boot,
  // pour que ShowBg + FillAroundBattleWindows arrivent APRÈS les copies.
  return IsDma3ManagerBusyWithBgCopy();
}

/** 1:1 décomp `ShowBg(bgId)` → active le BG dans DISPCNT (gba-window-system). */
function _ShowBg(bgId: number): void {
  ShowBg(bgId);
}

/** 1:1 décomp `FillAroundBattleWindows()` — corps réel dans le miroir
 *  battle_gfx_sfx_util (opacifie les pixels nuls des tiles 18-26 du tileset
 *  textbox, VRAM+0x240). */
function _FillAroundBattleWindows(): void {
  FillAroundBattleWindows();
}

/** 1:1 décomp `gWirelessCommType`. */
function _getWirelessCommType(): number {
  return 0;
}

/** 1:1 décomp `LoadWirelessStatusIndicatorSpriteGfx()`. */
function _LoadWirelessStatusIndicatorSpriteGfx(): void {
  // Dette R3 : wireless indicator gfx.
}

/** 1:1 décomp `CreateWirelessStatusIndicatorSprite()`. */
function _CreateWirelessStatusIndicatorSprite(_x: number, _y: number): void {
  // Dette R3.
}

/** 1:1 décomp `gReceivedRemoteLinkPlayers`. */
function _getReceivedRemoteLinkPlayers(): number {
  return 0;
}

/** 1:1 décomp `IsLinkTaskFinished()`. */
function _IsLinkTaskFinished(): boolean {
  return true;
}

/** 1:1 décomp `gLinkPlayers[i]`. */
function _setLinkPlayerId(_idx: number, _id: number): void {
  // Dette R3.
}

function _getLinkPlayerVersion(_idx: number): number {
  return VERSION_EMERALD;
}

/** 1:1 décomp `SendBlock(mask, src, size)`. */
function _SendBlock(_mask: number, _src: unknown, _size: number): void {
  // Dette R3 : link block send.
}

/** 1:1 décomp `BitmaskAllOtherLinkPlayers()`. */
function _BitmaskAllOtherLinkPlayers(): number {
  return 0;
}

/** 1:1 décomp `GetBlockReceivedStatus()`. */
function _GetBlockReceivedStatus(): number {
  return 0;
}

/** 1:1 décomp `ResetBlockReceivedFlags()`. */
function _ResetBlockReceivedFlags(): void {
  // Dette R3.
}

/** 1:1 décomp `CreateTask(taskFn, priority)`. */
function _CreateTask(_taskFn: () => void, _priority: number): number {
  return -1;
}

/** 1:1 décomp `InitLinkBattleVsScreen` task fn. */
function _InitLinkBattleVsScreen(): void {
  // Dette R3 : VS screen display.
}

/** 1:1 décomp `RecordedBattle_SetFrontierPassFlagFromHword(hword)`. */
function _RecordedBattle_SetFrontierPassFlagFromHword(_hword: number): void {
  // Dette R3.
}

/** 1:1 décomp `SetDeoxysStats()`. */
function _SetDeoxysStats(): void {
  // Dette R3 : Deoxys form-specific stats.
}

/** 1:1 décomp `SetPlayerBerryDataInBattleStruct()` (battle_main.c:753-785). */
function _SetPlayerBerryDataInBattleStruct(): void {
  // 1:1 décomp : copy player Enigma Berry data dans gBattleStruct.
  // Dette R3 : full IsEnigmaBerryValid + GetBerryInfo cascade.
}

/** 1:1 décomp `SetAllPlayersBerryData()` (battle_main.c:787-894). */
function _SetAllPlayersBerryData(): void {
  // 1:1 décomp : init gEnigmaBerries[0..3] from player Enigma berry or default.
  // Dette R3.
}

/** 1:1 décomp `BufferPartyVsScreenHealth_AtStart()` (= K19 wire). */
function _BufferPartyVsScreenHealth_AtStart(): void {
  const m = (globalThis as Record<string, unknown>).__battleVBlankHelpers as {
    BufferPartyVsScreenHealth_AtStart?: () => void;
  } | undefined;
  m?.BufferPartyVsScreenHealth_AtStart?.();
}

/** 1:1 décomp `TryCorrectShedinjaLanguage(mon)` (= K21 wire). */
function _TryCorrectShedinjaLanguage(_mon: unknown): void {
  const m = (globalThis as Record<string, unknown>).__battleTurnDispatch as {
    TryCorrectShedinjaLanguage?: (mon: unknown) => void;
  } | undefined;
  m?.TryCorrectShedinjaLanguage?.(_mon);
}

/** 1:1 décomp `InitBattleControllers()` (battle_controllers.c:81).
 *  Wire vers battle-controllers-init.ts (pose gBattleMainFunc = BeginBattleIntro
 *  + installe SetControllerToPlayer/Opponent dans la table partagée). */
function _InitBattleControllers(): void {
  _InitBattleControllersImpl();
}

/** 1:1 décomp `RecordedBattle_SetTrainerInfo()`. */
function _RecordedBattle_SetTrainerInfo(): void {
  // Dette R3.
}

/** 1:1 décomp `BattleInitAllSprites(ptr1, ptr2)` (battle_gfx_sfx_util.c) — case 3 =
 *  `gHealthboxSpriteIds[battler] = CreateBattlerHealthboxSprites(battler)`. Notre
 *  création healthbox est ASYNC (assets) → la state machine `initAllHealthboxes`
 *  (battle-healthbox-l, modèle décomp) kick off + retourne fini ; on relaie son bool
 *  (= reste en case 18 tant que pas fini, comme le décomp étale la création sur
 *  frames). Si le module healthbox n'est pas chargé → return true (pas de blocage). */
function _BattleInitAllSprites(_ptr1: number, _ptr2: number): boolean {
  // BASCULE MIROIR (2026-06-10) : la VRAIE machine 1:1 BattleInitAllSprites
  // (src/game/battle_gfx_sfx_util.ts, cases 0-6 = healthboxes + ombres) remplace
  // l'ancien raccourci initAllHealthboxes. Fallback si module non chargé.
  const gfx = (globalThis as { __battleGfxSfxUtil?: { BattleInitAllSpritesTick?: () => boolean } }).__battleGfxSfxUtil;
  if (gfx?.BattleInitAllSpritesTick) return gfx.BattleInitAllSpritesTick();
  const hb = (globalThis as { __battleHealthbox?: { initAllHealthboxes?: () => boolean } }).__battleHealthbox;
  if (!hb?.initAllHealthboxes) return true;
  return hb.initAllHealthboxes();
}

/** 1:1 décomp `BattleMainCB1` + `BattleMainCB2` (= K22 wire). */
function _BattleMainCB1(): void {
  const m = (globalThis as Record<string, unknown>).__battleCB2 as {
    BattleMainCB1?: () => void;
  } | undefined;
  m?.BattleMainCB1?.();
}

function _BattleMainCB2(): void {
  const m = (globalThis as Record<string, unknown>).__battleCB2 as {
    BattleMainCB2?: () => void;
  } | undefined;
  m?.BattleMainCB2?.();
}

/** 1:1 décomp `gMain.callback1` setter (= K8 wire). */
function _setMainCallback1(cb: (() => void) | null): void {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setMainCallback1?: (cb: (() => void) | null) => void;
    setPreBattleCallback1?: (cb: (() => void) | null) => void;
    getMainCallback1?: () => (() => void) | null;
  } | undefined;
  // 1:1 décomp ll. 1139-1140 : gPreBattleCallback1 = gMain.callback1 ;
  // gMain.callback1 = BattleMainCB1.
  m?.setPreBattleCallback1?.(m?.getMainCallback1?.() ?? null);
  m?.setMainCallback1?.(cb);
}

// (_SetMainCallback2/_RunTasks/_AnimateSprites/_BuildOamBuffer : versions RÉELLES en tête de fichier — stubs C8 retirés, dette en moins.)

// ─── FindLinkBattleMaster (897-951) — 1:1 décomp ───────────────────────────

/** 1:1 décomp `FindLinkBattleMaster(numPlayers, multiPlayerId)`
 *  (battle_main.c:897-951). Détermine le master link battle selon version
 *  + multiplayerId.
 *
 *  3 cases :
 *  1) Player 1 minimum version (0x100) → player 1 master
 *  2) Tous players même version → player 1 master
 *  3) Lowest index avec highest version → master
 *
 *  Sets BATTLE_TYPE_IS_MASTER + BATTLE_TYPE_TRAINER flags. */
export function FindLinkBattleMaster(numPlayers: number, multiPlayerId: number): void {
  let found = 0;

  // 1:1 décomp ll. 901-909 : player 1 minimum version (0x100).
  if (_getBlockRecvBuffer(0, 0) === 0x100) {
    if (multiPlayerId === 0) {
      setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER_LOCAL);
    } else {
      setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_TRAINER_LOCAL);
    }
    found++;
  }

  if (found === 0) {
    // 1:1 décomp ll. 911-929 : tous players même version → player 1 master.
    let i: number;
    for (i = 0; i < numPlayers; i++) {
      if (_getBlockRecvBuffer(0, 0) !== _getBlockRecvBuffer(i, 0)) break;
    }

    if (i === numPlayers) {
      if (multiPlayerId === 0) {
        setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER_LOCAL);
      } else {
        setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_TRAINER_LOCAL);
      }
      found++;
    }

    if (found === 0) {
      // 1:1 décomp ll. 933-949 : lowest index highest version master.
      for (i = 0; i < numPlayers; i++) {
        if (_getBlockRecvBuffer(i, 0) === 0x300 && i !== multiPlayerId) {
          if (i < multiPlayerId) break;
        }
        if (_getBlockRecvBuffer(i, 0) > 0x300 && i !== multiPlayerId) break;
      }

      if (i === numPlayers) {
        setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER_LOCAL);
      } else {
        setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_TRAINER_LOCAL);
      }
    }
  }
}

// ─── CB2_HandleStartBattle (953-1159) — 1:1 décomp ─────────────────────────

/** 1:1 décomp `CB2_HandleStartBattle()` (battle_main.c:953-1159). State machine
 *  18 cases pour link battle handshake. Non-link path : skip à case 15. */
export function CB2_HandleStartBattle(): void {
  _RunTasks();
  _AnimateSprites();
  _BuildOamBuffer();

  const playerMultiplayerId = _GetMultiplayerId();
  gBattleScripting.multiplayerId = playerMultiplayerId;
  const enemyMultiplayerId = playerMultiplayerId ^ BIT_SIDE;

  switch (gBattleCommunication[MULTIUSE_STATE]) {
    case 0:
      // 1:1 décomp ll. 968-980.
      if (!_IsDma3ManagerBusyWithBgCopy()) {
        _ShowBg(0); _ShowBg(1); _ShowBg(2); _ShowBg(3);
        _FillAroundBattleWindows();
        gBattleCommunication[MULTIUSE_STATE] = 1;
      }
      if (_getWirelessCommType()) _LoadWirelessStatusIndicatorSpriteGfx();
      break;
    case 1:
      // 1:1 décomp ll. 981-1014 : link path vs offline path.
      if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
        if (_getReceivedRemoteLinkPlayers()) {
          if (_IsLinkTaskFinished()) {
            // Set version signature 0x300 (= Emerald).
            // Dette R3 : gBattleStruct.multiBuffer.linkBattlerHeader.versionSignatureLo/Hi.
            _BufferPartyVsScreenHealth_AtStart();
            _SetPlayerBerryDataInBattleStruct();

            if (gTrainerBattleOpponent_A === TRAINER_UNION_ROOM) {
              _setLinkPlayerId(0, 0);
              _setLinkPlayerId(1, 1);
            }

            _SendBlock(_BitmaskAllOtherLinkPlayers(), null, 0);
            gBattleCommunication[MULTIUSE_STATE] = 2;
          }
          if (_getWirelessCommType()) _CreateWirelessStatusIndicatorSprite(0, 0);
        }
      } else {
        // Offline path : skip à case 15.
        if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
          setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_IS_MASTER);
        }
        gBattleCommunication[MULTIUSE_STATE] = 15;
        _SetAllPlayersBerryData();
      }
      break;
    case 2:
      // 1:1 décomp ll. 1015-1034 : recv version signature + setup VS task.
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        FindLinkBattleMaster(2, playerMultiplayerId);
        _SetAllPlayersBerryData();
        const taskId = _CreateTask(_InitLinkBattleVsScreen, 0);
        void taskId;  // Dette R3 : gTasks setup.
        _RecordedBattle_SetFrontierPassFlagFromHword(_getBlockRecvBuffer(playerMultiplayerId, 1));
        _RecordedBattle_SetFrontierPassFlagFromHword(_getBlockRecvBuffer(enemyMultiplayerId, 1));
        _SetDeoxysStats();
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 3:
      // 1:1 décomp ll. 1035-1043 : send Pokemon 1-2.
      if (_IsLinkTaskFinished()) {
        _SendBlock(_BitmaskAllOtherLinkPlayers(), null /* gPlayerParty */, 200 * 2);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 4:
      // 1:1 décomp ll. 1044-1052 : recv Pokemon 1-2.
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        // Dette R3 : memcpy gEnemyParty depuis gBlockRecvBuffer.
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 7:
      if (_IsLinkTaskFinished()) {
        _SendBlock(_BitmaskAllOtherLinkPlayers(), null /* gPlayerParty[2] */, 200 * 2);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 8:
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 11:
      if (_IsLinkTaskFinished()) {
        _SendBlock(_BitmaskAllOtherLinkPlayers(), null /* gPlayerParty[4] */, 200 * 2);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 12:
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        // 1:1 décomp ll. 1085-1090 : Shedinja language correction par mon.
        for (let i = 0; i < 6; i++) {
          _TryCorrectShedinjaLanguage(null);  // gEnemyParty[i]
        }
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 15:
      // 1:1 décomp ll. 1094-1115 : init battle controllers + check Emerald version.
      _InitBattleControllers();
      _RecordedBattle_SetTrainerInfo();
      gBattleCommunication[SPRITES_INIT_STATE1] = 0;
      gBattleCommunication[SPRITES_INIT_STATE2] = 0;

      if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
        let i = 0;
        for (; i < 2 && (_getLinkPlayerVersion(i) & 0xFF) === VERSION_EMERALD; i++);
        if (i === 2) gBattleCommunication[MULTIUSE_STATE] = 16;
        else gBattleCommunication[MULTIUSE_STATE] = 18;
      } else {
        gBattleCommunication[MULTIUSE_STATE] = 18;
      }
      break;
    case 16:
      // 1:1 décomp ll. 1117-1124 : send RNG seed pour recorded battle.
      if (_IsLinkTaskFinished()) {
        _SendBlock(_BitmaskAllOtherLinkPlayers(), null /* gRecordedBattleRngSeed */, 4);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 17:
      // 1:1 décomp ll. 1125-1134 : recv RNG seed.
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        if (!(gBattleTypeFlags & BATTLE_TYPE_IS_MASTER)) {
          // Dette R3 : memcpy gRecordedBattleRngSeed.
        }
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 18:
      // 1:1 décomp ll. 1135-1145 : finish, start battle.
      if (_BattleInitAllSprites(SPRITES_INIT_STATE1, SPRITES_INIT_STATE2)) {
        _setMainCallback1(_BattleMainCB1);
        _SetMainCallback2(_BattleMainCB2);
        if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
          setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_LINK_IN_BATTLE);
        }
      }
      break;
    // 1:1 décomp ll. 1146-1157 : delays cases 5/9/13 + waits 6/10/14.
    case 5:
    case 9:
    case 13:
      gBattleCommunication[MULTIUSE_STATE]++;
      gBattleCommunication[1] = 1;
      // 1:1 décomp : intentional fall through (= immediate decrement next case).
      // Extract for TS noFallthroughCasesInSwitch compat.
      _delayWait();
      break;
    case 6:
    case 10:
    case 14:
      _delayWait();
      break;
  }
}

/** 1:1 décomp helper case 6/10/14 (= extrait pour bypass fallthrough). */
function _delayWait(): void {
  if (--gBattleCommunication[1] === 0) {
    gBattleCommunication[MULTIUSE_STATE]++;
  }
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleLinkStart = {
  FindLinkBattleMaster, CB2_HandleStartBattle,
};

// ─── Helpers options battle (lecture gSaveBlock2Ptr.optionsBattle*) ───────────
// Rapatriés depuis gba-menu-system (fourre-tout dissous). 1:1 décomp : battle_main.c
// lit ces options pour gater le comportement (HITMARKER_NO_ANIMATIONS / switch prompt).

/** Returns true si battle animations doivent être SKIPPÉES.
 *  **OVERRIDE TEMPORAIRE (user 2026-05-26)** : tant que la cascade visuelle K1
 *  (battle_anim_*.c) n'est pas portée, force TRUE peu importe l'option user (menu
 *  Options affiche "OUI" sans effet ; engine se comporte "NON" = skip toutes anims).
 *  À retirer quand K1 portée + A/B validation. */
export function IsBattleSceneOff(): boolean {
  return true;
  // 1:1 décomp original (= activé quand K1 cascade portée) :
  // return ((gSaveBlock2Ptr.optionsBattleSceneOff ?? OPTIONS_BATTLE_SCENE_ON) | 0) === OPTIONS_BATTLE_SCENE_OFF;
}

/** Returns true si les ANIMATIONS DE HIT (blink + healthbox jiggle) doivent être
 *  SKIPPÉES. VRAIE option user `optionsBattleSceneOff` (1:1 décomp : HITMARKER_NO_ANIMATIONS).
 *  Découplé de IsBattleSceneOff (forcé TRUE pour masquer les MOVE anims K1). */
export function IsHitAnimDisabled(): boolean {
  return ((gSaveBlock2Ptr.optionsBattleSceneOff ?? OPTIONS_BATTLE_SCENE_ON) | 0) === OPTIONS_BATTLE_SCENE_OFF;
}

/** Returns le battle style courant : 0 = SHIFT (ask before switch), 1 = SET (no prompt). */
export function GetBattleStyle(): number {
  return ((gSaveBlock2Ptr.optionsBattleStyle ?? OPTIONS_BATTLE_STYLE_SHIFT) | 0) & 1;
}

// Bridge globalThis pour les auto-callbacks / battle code (= eval scope @ts-nocheck).
(globalThis as Record<string, unknown>).IsBattleSceneOff = IsBattleSceneOff;
(globalThis as Record<string, unknown>).IsHitAnimDisabled = IsHitAnimDisabled;
(globalThis as Record<string, unknown>).GetBattleStyle = GetBattleStyle;
