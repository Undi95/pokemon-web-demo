/**
 * game/battle_main.ts — Port MIROIR 1:1 de `battle_main.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *
 * ⚠️ Port PROGRESSIF par tranches (battle_main.c = 5270 l.). Cette première
 * tranche = la FONDATION : globals BG/WIN scroll + VBlankCB_Battle + HBlankCB +
 * helpers VS-screen/BgTemplate. Les tranches suivantes y ajouteront, dans l'ordre
 * du fichier décomp : CB2_InitBattle/Internal, CB2_HandleStartBattle, BattleMainCB1/2,
 * BattleStartClearSetData/BeginBattleIntro, la machine d'intro, la machine de tour,
 * HandleEndTurn_*, les SpriteCB_*.
 *
 * Fonctions portées (tranche 1) :
 *   - gBattle_BG0-3_X/Y + gBattle_WIN0/1H/V (124-135) — globals scroll/window
 *   - VBlankCB_Battle (2084-2106) — VBlank callback principal battle
 *   - HBlankCB_Battle (2078-2082) — HBlank cb (UNUSED)
 *   - GetBattleBgTemplateData (2385-2415) — accès gBattleBgTemplates field
 *   - SpriteCB_VsLetterDummy/VsLetter/VsLetterInit (2108-2136) — VS letter anim
 *   - BufferPartyVsScreenHealth_AtStart/AtEnd (742-751, 2138-2175) — VS screen flags
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

import {
  getRuntime, BlendPalettes, PALETTES_ALL,
  AnimateSprites as _AnimateSprites_rt, BuildOamBuffer as _BuildOamBuffer_rt,
  UpdatePaletteFade as _UpdatePaletteFade_rt, RunTasks as _RunTasks_rt,
} from '../engine/system/decomp-globals';
import { Random } from '../engine/system/random';
// Namespace ESM (remplace require('../save/save-block-state') CommonJS, dormant).
import * as _saveBlockNs from '../engine/save/save-block-state';
import {
  gActiveBattler, gBattleTypeFlags, gBattlersCount,
  setBattleOutcome, setActiveBattler, getBattlerControllerFunc,
} from '../engine/battle/state';
// Namespace ESM (remplace require('./state') CommonJS, dormant → throw en navigateur).
import * as _stateNs from '../engine/battle/state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_FRONTIER, BATTLE_TYPE_RECORDED,
} from '../engine/battle/constants';
import { RunTextPrinters as _RunTextPrinters_rt } from '../engine/ui/gba-text-system';
import { tickBattlerMonReveals } from '../engine/battle/battle-controller-opponent';
import { tickIntroSlideIn, tickTrainerThrow, tickSendOut } from '../engine/battle/battle-sendout-anim';

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
  void import('../engine/m4a/player').then(({ stopSong }) => {
    stopSong('se1' as never);
    stopSong('se2' as never);
  });
}

/** 1:1 décomp `m4aSongNumStop(songId)`. Wire vers m4a/player stopSong. */
function _m4aSongNumStop(_songId: number): void {
  // 1:1 décomp : stop song par songId. SE_LOW_HEALTH = 287.
  void import('../engine/m4a/player').then(({ stopSong }) => {
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
  tickIntroSlideIn();
  tickTrainerThrow();
  tickSendOut();

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
