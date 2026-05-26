/**
 * battle/battle-cb2.ts — Port 1:1 strict des callbacks CB2_* + helpers
 * boot battle.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *
 * Fonctions portées 1:1 :
 *   - BattleMainCB1 (3026-3032) — main CB1 (= gBattleMainFunc + controllers)
 *   - BattleMainCB2 (1863-1879) — main CB2 (= anim + OAM + text + tasks)
 *   - FreeRestoreBattleData (1881-1891) — cleanup battle data
 *   - CB2_QuitRecordedBattle (1893-1904) — exit recorded playback
 *   - SpriteCB_UnusedBattleInit (1909-1913) — entry
 *   - SpriteCB_UnusedBattleInit_Main (1915-1958) — main loop (3 cases)
 *
 * Mécanique BattleMainCB2 :
 *   - AnimateSprites + BuildOamBuffer + RunTextPrinters + UpdatePaletteFade
 *   - RunTasks
 *   - B button during recorded playback → B_OUTCOME_PLAYER_TELEPORTED + quit
 *
 * Dépendances :
 *   - K8 battle-main-functions.ts : gBattleMainFunc getter
 *   - battle-controllers.ts : gBattlerControllerFuncs
 *   - state.ts : gActiveBattler, gBattleTypeFlags, gBattleOutcome
 *   - decomp-globals.ts : getRuntime, BeginNormalPaletteFade, PALETTES_ALL
 */

import {
  gActiveBattler, gBattleTypeFlags, gBattlersCount,
  setBattleOutcome, setActiveBattler,
} from './state';
import { BATTLE_TYPE_RECORDED } from './constants';
import {
  getRuntime, BlendPalettes, PALETTES_ALL,
  AnimateSprites as _AnimateSprites_rt, BuildOamBuffer as _BuildOamBuffer_rt,
  UpdatePaletteFade as _UpdatePaletteFade_rt, RunTasks as _RunTasks_rt,
} from '../system/decomp-globals';
import { RunTextPrinters as _RunTextPrinters_rt } from '../ui/gba-text-system';
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

/** 1:1 décomp `gBattlerControllerFuncs[i]()`. */
function _runBattlerController(_battler: number): void {
  // Dette R3 : controller dispatch system. Notre port : noop (controllers
  // sont géré via state machine direct dans battle-flow.ts).
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
  // Notre m4a/player a stopSong(slot). On extrapole le slot depuis le ptr.
  // Pour gMPlayInfo_SE1 → 'se1', gMPlayInfo_SE2 → 'se2', gMPlayInfo_BGM → 'bgm'.
  // Stub par défaut : stop SE1+SE2 (= cas dominant CB2_QuitRecordedBattle).
  void playerInfo;
  void import('../m4a/player').then(({ stopSong }) => {
    stopSong('se1' as never);
    stopSong('se2' as never);
  });
}

/** 1:1 décomp `m4aSongNumStop(songId)`. Wire vers m4a/player stopSong. */
function _m4aSongNumStop(_songId: number): void {
  // 1:1 décomp : stop song par songId. SE_LOW_HEALTH = 287.
  // Notre m4a/player utilise des slots fixes. Stop SE1+SE2 (= contexte HP low SE).
  void import('../m4a/player').then(({ stopSong }) => {
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
  const stateMod = require('./state') as { gEnemyParty?: unknown[] };
  if (stateMod.gEnemyParty) {
    for (let i = 0; i < 6; i++) {
      stateMod.gEnemyParty[i] = null;
    }
  }
}

/** 1:1 décomp `SetMainCallback2(cb)`. */
function _SetMainCallback2(_cb: (() => void) | null): void {
  // Dette R3 : main callback dispatch (= notre runtime n'a pas CB2 layer
  // équivalente). Pour now : noop ; le caller dispatch implicit.
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

  // 1:1 décomp ll. 1871-1878 : B button during recorded → quit.
  if (_JOY_HELD(B_BUTTON)
      && (gBattleTypeFlags & BATTLE_TYPE_RECORDED)
      && _RecordedBattle_CanStopPlayback()) {
    // Set gSpecialVar_Result = gBattleOutcome = B_OUTCOME_PLAYER_TELEPORTED.
    setBattleOutcome(5 /* B_OUTCOME_PLAYER_TELEPORTED */);
    const stateMod = require('./state') as { setSpecialVarResult?: (v: number) => void };
    stateMod.setSpecialVarResult?.(5);

    _ResetPaletteFadeControl();
    _BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, 0 /* RGB_BLACK */);
    _SetMainCallback2(CB2_QuitRecordedBattle);
  }
}

// ─── FreeRestoreBattleData (battle_main.c:1881-1891) ───────────────────────

/** 1:1 décomp `FreeRestoreBattleData()` (battle_main.c:1881-1891). */
export function FreeRestoreBattleData(): void {
  // 1:1 décomp ll. 1883-1885 : restore gMain.callback1 = gPreBattleCallback1 +
  // gScanlineEffect.state = 3 + gMain.inBattle = FALSE.
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

    // Dette R3 : restore gMain.savedCallback.
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

/** 1:1 décomp `SpriteCB_UnusedBattleInit(sprite)` (1909-1913). UNUSED.
 *  Entry init pour un effet visuel boot battle (= jamais utilisé). */
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
    // 1:1 décomp ll. 1939-1943 : fill arr[r2..r0] avec 0x3D.
    // Dette R3 : arr est gDecompressionBuffer (= u16 array).
    void r2; void r0;
    sprite.data[3]++;
    if (sprite.data[3] === 21) {
      sprite.data[0]++;
      sprite.data[1] = 32;
    }
  }
}

/** 1:1 décomp `SpriteCB_UnusedBattleInit_Main(sprite)` (1915-1958). UNUSED.
 *  Main loop animation init (= 3 cases state machine). */
export function SpriteCB_UnusedBattleInit_Main(sprite: UnusedSprite): void {
  // 1:1 décomp : access gDecompressionBuffer (= temp working buffer).
  // Dette R3 : pas de gDecompressionBuffer dans notre runtime.

  switch (sprite.data[0]) {
    case 0:
      sprite.data[0]++;
      sprite.data[1] = 0;
      sprite.data[2] = 0x281;
      sprite.data[3] = 0;
      sprite.data[4] = 1;  // sDelay = 1
      // 1:1 décomp : fall through to case 1 (explicit block to bypass noFallthroughCasesInSwitch).
      _spriteCB_UnusedBattleInit_Main_Case1(sprite);
      break;
    case 1:
      _spriteCB_UnusedBattleInit_Main_Case1(sprite);
      break;
    case 2:
      sprite.data[1]--;
      if (sprite.data[1] === 20) {
        // 1:1 décomp : SetMainCallback2(CB2_InitBattle).
        // Dette R3 : CB2_InitBattle non porté complet.
      }
      break;
  }
}

// ─── Devtools expose ───────────────────────────────────────────────────────

void BlendPalettes;

(globalThis as Record<string, unknown>).__battleCB2 = {
  BattleMainCB1, BattleMainCB2,
  FreeRestoreBattleData, CB2_QuitRecordedBattle,
  SpriteCB_UnusedBattleInit, SpriteCB_UnusedBattleInit_Main,
};
