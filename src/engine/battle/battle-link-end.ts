/**
 * battle/battle-link-end.ts — Port 1:1 strict des callbacks End Link Battle.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *
 * Fonctions portées 1:1 :
 *   - CB2_InitEndLinkBattle (2177-2252) — entry link battle end setup
 *   - CB2_EndLinkBattle (2254-2262) — main CB2 link end (= AnimateSprites + tasks)
 *   - EndLinkBattleInSteps (2264-2383) — 10-state machine progression :
 *       0 : ShowBg + init delay
 *       1 : countdown → fade out
 *       2 : palette fade end → branch (record battle / no record / reconnect)
 *       3 : CpuFill VRAM + LoadChosenBattleElement + fade in
 *       4 : wait fade in
 *       5 : wait Task_ReconnectWithLinkPlayers
 *       6 : link task finished → "Link Standby" text
 *       7 : wait text + link task
 *       8 : SetCloseLinkCallback
 *       9 : wait final callback restore
 *
 * Note : link battle est non-applicable pour notre démo offline. Le port
 * existe pour completeness 1:1 strict — les cascade vers gLinkPlayers /
 * gWirelessCommType / SetCloseLinkCallback / RecordedBattle_GetFrontierPassFlag
 * sont dette R3 explicit.
 *
 * Dépendances :
 *   - K8 battle-main-functions.ts : setBattleMainFunc, BattleMainCB2
 *   - K19 battle-vblank-helpers.ts : VBlankCB_Battle
 *   - decomp-globals.ts : BeginNormalPaletteFade, PALETTES_ALL, FreeMonSpritesGfx
 *   - state.ts : gBattleTypeFlags, gBattleCommunication
 */

import {
  gBattleTypeFlags, gBattleCommunication,
  setBattleTypeFlags,
} from './state';
import {
  BATTLE_TYPE_FRONTIER, BATTLE_TYPE_MULTI,
} from './constants';
import {
  getRuntime, FreeMonSpritesGfx, PALETTES_ALL,
} from '../system/decomp-globals';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `BATTLE_TYPE_LINK_IN_BATTLE` (= bit set pendant link battle). */
const BATTLE_TYPE_LINK_IN_BATTLE = 1 << 18;

/** 1:1 décomp `MULTIUSE_STATE` = 0 dans gBattleCommunication. */
const MULTIUSE_STATE = 0;

/** 1:1 décomp `RGB_BLACK` = 0. */
const RGB_BLACK = 0;

/** 1:1 décomp `VERSION_EMERALD` = 5 (= include/global.h). */
const VERSION_EMERALD = 5;

/** 1:1 décomp `FLAG_SYS_FRONTIER_PASS`. */
const FLAG_SYS_FRONTIER_PASS = 0x864;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `SetHBlankCallback(cb)`. */
function _SetHBlankCallback(_cb: (() => void) | null): void {
  // Dette R3 : HBlank callback (= notre runtime web utilise différentes mécaniques).
}

/** 1:1 décomp `SetVBlankCallback(cb)`. */
function _SetVBlankCallback(_cb: (() => void) | null): void {
  // Dette R3 : VBlank callback registry.
}

/** 1:1 décomp `SetMainCallback2(cb)`. */
function _SetMainCallback2(_cb: (() => void) | null): void {
  // Dette R3 : CB2 dispatch (= notre runtime n'a pas CB2 layer).
}

/** 1:1 décomp `FreeBattleResources()` + `FreeBattleSpritesData()`. */
function _FreeBattleResources(): void {
  // Dette R3 : noop pour notre runtime.
}
function _FreeBattleSpritesData(): void {
  // Dette R3 : noop.
}
function _FreeAllWindowBuffers(): void {
  // Dette R3 : window cleanup.
}
function _CpuFill32(_value: number, _dest: unknown, _size: number): void {
  // Dette R3 : VRAM clear via DMA. Notre runtime gère implicit.
}

/** 1:1 décomp `BeginNormalPaletteFade(palettes, delay, startY, endY, color)`. */
function _BeginNormalPaletteFade(palettes: number, delay: number, startY: number, endY: number, color: number): void {
  const rt = getRuntime();
  rt?.BeginNormalPaletteFade?.(
    palettes as unknown as string, delay, startY, endY, color as unknown as string,
  );
}

/** 1:1 décomp `gPaletteFade.active`. */
function _isPaletteFadeActive(): boolean {
  return getRuntime()?.gPaletteFade?.active ?? false;
}

/** 1:1 décomp `RecordedBattle_GetFrontierPassFlag()`. */
function _RecordedBattle_GetFrontierPassFlag(): boolean {
  // Dette R3 : recorded battle system.
  return false;
}

/** 1:1 décomp `FlagGet(flagId)`. */
function _FlagGet(_flagId: number): boolean {
  const sb1 = (globalThis as { gSaveBlock1Ptr?: { flags?: Uint8Array } }).gSaveBlock1Ptr;
  if (!sb1?.flags) return false;
  return (sb1.flags[Math.floor(_flagId / 8)] & (1 << (_flagId % 8))) !== 0;
}

/** 1:1 décomp `gLinkPlayers[i].version`. */
function _getLinkPlayerVersion(_idx: number): number {
  // Dette R3 : link players data. Pour now : assume Emerald.
  return VERSION_EMERALD;
}

/** 1:1 décomp `gReceivedRemoteLinkPlayers`. */
function _getReceivedRemoteLinkPlayers(): number {
  // Dette R3 : link players counter.
  return 0;
}

/** 1:1 décomp `gMain.anyLinkBattlerHasFrontierPass`. */
let _gMain_anyLinkBattlerHasFrontierPass = false;

/** 1:1 décomp `gWirelessCommType`. */
function _getWirelessCommType(): number {
  return 0;  // No wireless.
}

/** 1:1 décomp `CreateTask(taskFn, priority)`. */
function _CreateTask(_taskFn: () => void, _priority: number): number {
  // Dette R3 : task creation via runtime.
  return -1;
}

/** 1:1 décomp `Task_ReconnectWithLinkPlayers` task function. */
function _Task_ReconnectWithLinkPlayers(): void {
  // Dette R3 : link reconnect task.
}

/** 1:1 décomp `FuncIsActiveTask(taskFn)`. */
function _FuncIsActiveTask(_taskFn: () => void): boolean {
  // Dette R3 : check si task active.
  return false;
}

/** 1:1 décomp `IsLinkTaskFinished()`. */
function _IsLinkTaskFinished(): boolean {
  return true;  // No link = always finished.
}

/** 1:1 décomp `SetLinkStandbyCallback()`. */
function _SetLinkStandbyCallback(): void {
  // Dette R3.
}

/** 1:1 décomp `BattlePutTextOnWindow(text, windowId)`. */
function _BattlePutTextOnWindow(_text: number | string, _windowId: number): void {
  // Dette R3 : window text print.
}

/** 1:1 décomp `IsTextPrinterActive(windowId)`. */
function _IsTextPrinterActive(_windowId: number): boolean {
  return false;
}

/** 1:1 décomp `SetCloseLinkCallback()`. */
function _SetCloseLinkCallback(): void {
  // Dette R3.
}

/** 1:1 décomp `LoadChosenBattleElement(i)`. */
function _LoadChosenBattleElement(_i: number): void {
  // Dette R3 : battle element load (= BG / tilemap / palette).
}

/** 1:1 décomp `ScanlineEffect_Clear()`. */
function _ScanlineEffect_Clear(): void {
  // Dette R3 : scanline effect cleanup.
}

/** 1:1 décomp `ResetPaletteFade()`. */
function _ResetPaletteFade(): void {
  // Dette R3 : palette fade state reset.
}

/** 1:1 décomp `InitBattleBgsVideo()`. */
function _InitBattleBgsVideo(): void {
  // Dette R3 : battle BG setup.
}

/** 1:1 décomp `LoadCompressedPalette` + `LoadBattleMenuWindowGfx`. */
function _LoadCompressedPalette(_data: unknown, _offset: number, _size: number): void {
  // Dette R3.
}
function _LoadBattleMenuWindowGfx(): void {
  // Dette R3.
}

/** 1:1 décomp `ResetSpriteData()` + `ResetTasks()`. */
function _ResetSpriteData(): void {
  const r = getRuntime();
  r?.gSprites?.clear();
}
function _ResetTasks(): void {
  const r = getRuntime();
  r?.gTasks?.clear();
}

/** 1:1 décomp `DrawBattleEntryBackground()`. */
function _DrawBattleEntryBackground(): void {
  // Dette R3 : battle entry BG draw.
}

/** 1:1 décomp `FreeAllSpritePalettes()`. */
function _FreeAllSpritePalettes(): void {
  // Dette R3.
}

/** 1:1 décomp `InitLinkBattleVsScreen` task fn. */
function _InitLinkBattleVsScreen(): void {
  // Dette R3 : VS screen display task.
}

/** 1:1 décomp `BufferPartyVsScreenHealth_AtEnd(taskId)`. */
function _BufferPartyVsScreenHealth_AtEnd(_taskId: number): void {
  // K19 partial wire.
  const m = (globalThis as Record<string, unknown>).__battleVBlankHelpers as {
    BufferPartyVsScreenHealth_AtEnd?: (taskId: number) => void;
  } | undefined;
  m?.BufferPartyVsScreenHealth_AtEnd?.(_taskId);
}

/** 1:1 décomp `SetGpuReg(reg, value)`. */
function _SetGpuReg(reg: number, value: number): void {
  const rt = getRuntime();
  rt?.SetGpuReg?.(reg, value);
}

/** 1:1 décomp WIN_RANGE macro. */
function _WIN_RANGE(a: number, b: number): number {
  return ((a & 0xFF) << 8) | (b & 0xFF);
}

// REG_OFFSET_* constants (= io_reg.h).
const REG_OFFSET_MOSAIC = 0x4C;
const REG_OFFSET_WIN0H = 0x40;
const REG_OFFSET_WIN0V = 0x44;
const REG_OFFSET_WININ = 0x48;
const REG_OFFSET_WINOUT = 0x4A;

// Display constants.
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;

// ─── CB2_InitEndLinkBattle (2177-2252) — 1:1 décomp ────────────────────────

/** 1:1 décomp `CB2_InitEndLinkBattle()` (battle_main.c:2177-2252).
 *  Entry CB2 link battle end setup : clear VRAM + setup WIN + scanline + tasks. */
export function CB2_InitEndLinkBattle(): void {
  _SetHBlankCallback(null);
  _SetVBlankCallback(null);
  setBattleTypeFlags(gBattleTypeFlags & ~BATTLE_TYPE_LINK_IN_BATTLE);

  if (gBattleTypeFlags & BATTLE_TYPE_FRONTIER) {
    // Frontier path : direct exit.
    const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
      getMainSavedCallback?: () => (() => void) | null;
    } | undefined;
    _SetMainCallback2(m?.getMainSavedCallback?.() ?? null);
    _FreeBattleResources();
    _FreeBattleSpritesData();
    FreeMonSpritesGfx();
  } else {
    // Standard link battle end : full setup VS screen.
    _CpuFill32(0, null /* VRAM */, 0x18000 /* VRAM_SIZE */);

    _SetGpuReg(REG_OFFSET_MOSAIC, 0);
    _SetGpuReg(REG_OFFSET_WIN0H, DISPLAY_WIDTH);
    _SetGpuReg(REG_OFFSET_WIN0V, _WIN_RANGE(DISPLAY_HEIGHT / 2, DISPLAY_HEIGHT / 2 + 1));
    _SetGpuReg(REG_OFFSET_WININ, 0);
    _SetGpuReg(REG_OFFSET_WINOUT, 0);

    // Sync battleVBlankState.
    const vbm = (globalThis as Record<string, unknown>).__battleVBlankHelpers as {
      battleVBlankState?: {
        bg0_x: number; bg0_y: number; bg1_x: number; bg1_y: number;
        bg2_x: number; bg2_y: number; bg3_x: number; bg3_y: number;
        win0h: number; win0v: number; win1h: number; win1v: number;
      };
    } | undefined;
    if (vbm?.battleVBlankState) {
      vbm.battleVBlankState.win0h = DISPLAY_WIDTH;
      vbm.battleVBlankState.win0v = _WIN_RANGE(DISPLAY_HEIGHT / 2, DISPLAY_HEIGHT / 2 + 1);
      vbm.battleVBlankState.bg0_x = 0; vbm.battleVBlankState.bg0_y = 0;
      vbm.battleVBlankState.bg1_x = 0; vbm.battleVBlankState.bg1_y = 0;
      vbm.battleVBlankState.bg2_x = 0; vbm.battleVBlankState.bg2_y = 0;
      vbm.battleVBlankState.bg3_x = 0; vbm.battleVBlankState.bg3_y = 0;
    }

    _ScanlineEffect_Clear();

    // 1:1 décomp ll. 2205-2218 : scanline buffer fill.
    // Dette R3 : gScanlineEffectRegBuffers full setup (= scrolling parallax).

    _ResetPaletteFade();
    _InitBattleBgsVideo();
    _LoadCompressedPalette(null /* gBattleTextboxPalette */, 0, 64);
    _LoadBattleMenuWindowGfx();
    _ResetSpriteData();
    _ResetTasks();
    _DrawBattleEntryBackground();
    _SetGpuReg(REG_OFFSET_WINOUT, 0x3F);  // WINOUT_WIN01_BG_ALL + OBJ + CLR
    _FreeAllSpritePalettes();
    // gReservedSpritePaletteCount = MAX_BATTLERS_COUNT.
    _SetVBlankCallback(_getVBlankCB_Battle());

    // 1:1 décomp ll. 2242-2247 : create VS screen task + buffer health.
    const taskId = _CreateTask(_InitLinkBattleVsScreen, 0);
    // gTasks[taskId].data[1] = 0x10E, data[2] = 0x5A, data[5] = 1.
    _BufferPartyVsScreenHealth_AtEnd(taskId);

    _SetMainCallback2(CB2_EndLinkBattle);
    gBattleCommunication[MULTIUSE_STATE] = 0;
  }
}

/** Lazy wire vers K19 VBlankCB_Battle. */
function _getVBlankCB_Battle(): (() => void) | null {
  const m = (globalThis as Record<string, unknown>).__battleVBlankHelpers as {
    VBlankCB_Battle?: () => void;
  } | undefined;
  return m?.VBlankCB_Battle ?? null;
}

// ─── CB2_EndLinkBattle (2254-2262) — 1:1 décomp ────────────────────────────

/** 1:1 décomp `CB2_EndLinkBattle()` (battle_main.c:2254-2262).
 *  Main CB2 link end : step state machine + anim + tasks. */
export function CB2_EndLinkBattle(): void {
  EndLinkBattleInSteps();
  // Dette R3 : AnimateSprites + BuildOamBuffer + RunTextPrinters + UpdatePaletteFade
  // + RunTasks (= runtime handles implicit).
}

// ─── EndLinkBattleInSteps (2264-2383) — 1:1 décomp ─────────────────────────

/** 1:1 décomp `EndLinkBattleInSteps()` (battle_main.c:2264-2383). State
 *  machine 10 cases pour link battle end. */
export function EndLinkBattleInSteps(): void {
  switch (gBattleCommunication[MULTIUSE_STATE]) {
    case 0:
      // 1:1 décomp ll. 2270-2276.
      _ShowBg(0); _ShowBg(1); _ShowBg(2);
      gBattleCommunication[1] = 0xFF;
      gBattleCommunication[MULTIUSE_STATE]++;
      break;
    case 1:
      // 1:1 décomp ll. 2277-2283 : countdown → fade.
      if (--gBattleCommunication[1] === 0) {
        _BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 2:
      // 1:1 décomp ll. 2284-2333 : palette fade end → branch.
      if (!_isPaletteFadeActive()) {
        let battlerCount: number;
        _gMain_anyLinkBattlerHasFrontierPass = _RecordedBattle_GetFrontierPassFlag();

        if (gBattleTypeFlags & BATTLE_TYPE_MULTI) battlerCount = 4;
        else battlerCount = 2;

        // 1:1 décomp l. 2296 : check Emerald version all players.
        let i = 0;
        for (; i < battlerCount && (_getLinkPlayerVersion(i) & 0xFF) === VERSION_EMERALD; i++);

        const sb2 = (globalThis as { gSaveBlock2Ptr?: { frontier?: { disableRecordBattle?: boolean } } }).gSaveBlock2Ptr;
        const disableRecord = sb2?.frontier?.disableRecordBattle ?? false;

        if (!disableRecord && i === battlerCount) {
          if (_FlagGet(FLAG_SYS_FRONTIER_PASS)) {
            // 1:1 décomp ll. 2300-2305 : ask player to record battle.
            _FreeAllWindowBuffers();
            _SetMainCallback2(_CB2_InitAskRecordBattle);
          } else if (!_gMain_anyLinkBattlerHasFrontierPass) {
            // 1:1 décomp ll. 2306-2313 : no record possible → exit.
            const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
              getMainSavedCallback?: () => (() => void) | null;
            } | undefined;
            _SetMainCallback2(m?.getMainSavedCallback?.() ?? null);
            _FreeBattleResources();
            _FreeBattleSpritesData();
            FreeMonSpritesGfx();
          } else if (_getReceivedRemoteLinkPlayers() === 0) {
            // 1:1 décomp ll. 2314-2320 : reconnect with link players.
            _CreateTask(_Task_ReconnectWithLinkPlayers, 5);
            gBattleCommunication[MULTIUSE_STATE]++;
          } else {
            gBattleCommunication[MULTIUSE_STATE]++;
          }
        } else {
          const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
            getMainSavedCallback?: () => (() => void) | null;
          } | undefined;
          _SetMainCallback2(m?.getMainSavedCallback?.() ?? null);
          _FreeBattleResources();
          _FreeBattleSpritesData();
          FreeMonSpritesGfx();
        }
      }
      break;
    case 3:
      // 1:1 décomp ll. 2335-2343 : VRAM clear + load element + fade in.
      _CpuFill32(0, null /* VRAM */, 0x18000);
      for (let i = 0; i < 2; i++) _LoadChosenBattleElement(i);
      _BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      gBattleCommunication[MULTIUSE_STATE]++;
      break;
    case 4:
      if (!_isPaletteFadeActive()) gBattleCommunication[MULTIUSE_STATE]++;
      break;
    case 5:
      if (!_FuncIsActiveTask(_Task_ReconnectWithLinkPlayers)) {
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 6:
      if (_IsLinkTaskFinished()) {
        _SetLinkStandbyCallback();
        _BattlePutTextOnWindow(0 /* gText_LinkStandby3 */, 0 /* B_WIN_MSG */);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 7:
      if (!_IsTextPrinterActive(0)) {
        if (_IsLinkTaskFinished()) gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 8:
      if (!_getWirelessCommType()) _SetCloseLinkCallback();
      gBattleCommunication[MULTIUSE_STATE]++;
      break;
    case 9:
      if (!_gMain_anyLinkBattlerHasFrontierPass
          || _getWirelessCommType()
          || _getReceivedRemoteLinkPlayers() !== 1) {
        _gMain_anyLinkBattlerHasFrontierPass = false;
        const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
          getMainSavedCallback?: () => (() => void) | null;
        } | undefined;
        _SetMainCallback2(m?.getMainSavedCallback?.() ?? null);
        _FreeBattleResources();
        _FreeBattleSpritesData();
        FreeMonSpritesGfx();
      }
      break;
  }
}

/** 1:1 décomp `ShowBg(bgId)`. */
function _ShowBg(_bgId: number): void {
  // Dette R3 : wire vers gba-window-system.ShowBg.
}

/** 1:1 décomp `CB2_InitAskRecordBattle()` (battle_main.c:2417). */
function _CB2_InitAskRecordBattle(): void {
  // Dette R3 : full record battle prompt setup. Cascade massive vers
  // CB2_AskRecordBattle + AskRecordBattle + AskRecordBattleYesNo etc.
  console.warn('[battle-link-end] CB2_InitAskRecordBattle — full record system not yet ported (dette R3)');
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleLinkEnd = {
  CB2_InitEndLinkBattle, CB2_EndLinkBattle, EndLinkBattleInSteps,
};
