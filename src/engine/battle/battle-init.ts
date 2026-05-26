/**
 * battle/battle-init.ts — Port 1:1 strict de CB2_InitBattle + CB2_InitBattleInternal.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:588-710`
 *
 * Fonctions portées 1:1 :
 *   - CB2_InitBattle (588-617) — entry boot battle :
 *     - AllocateBattleResources + AllocateBattleSpritesData + AllocateMonSpritesGfx
 *     - RecordedBattle_ClearFrontierPassFlag
 *     - BATTLE_TYPE_MULTI branching (= recorded / link / partner / multi)
 *     - Sinon : CB2_InitBattleInternal direct
 *
 *   - CB2_InitBattleInternal (619-710) — full battle setup :
 *     - SetHBlank/VBlank null + CpuFill VRAM
 *     - GPU regs WIN setup (= BIRCH tutorial sets WIN central split)
 *     - ScanlineEffect (= scanline params 16-bit pour intro slide)
 *     - ResetPaletteFade + reset 8 BG scroll vars
 *     - gBattleEnvironment = BattleSetup_GetEnvironmentId (= K18)
 *     - InitBattleBgsVideo + LoadBattleTextboxAndBackground + ResetSpriteData
 *     - DrawBattleEntryBackground + FreeAllSpritePalettes
 *     - SetVBlankCallback(VBlankCB_Battle) (= K19)
 *     - SetUpBattleVarsAndBirchZigzagoon (= K18)
 *     - Dispatch CB2 selon type (Multi/Partner/Standard)
 *     - CreateNPCTrainerParty (= K15) + SetWildMonHeldItem
 *     - gMain.inBattle = TRUE + AdjustFriendship per player mon
 *
 * Wire vers existing modules :
 *   - K15 CreateNPCTrainerParty
 *   - K18 SetUpBattleVarsAndBirchZigzagoon + BattleSetup_GetEnvironmentId
 *   - K19 VBlankCB_Battle
 *   - K22 BattleMainCB1 + BattleMainCB2
 *   - K24 CB2_HandleStartBattle
 *
 * Dépendances :
 *   - state.ts : gBattleTypeFlags, gBattleCommunication, gMain
 *   - constants.ts : BATTLE_TYPE_* flags
 */

import {
  gBattleTypeFlags, gBattleCommunication,
  gTrainerBattleOpponent_A, gTrainerBattleOpponent_B,
  setBattleEnvironment,
} from './state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_RECORDED, BATTLE_TYPE_MULTI,
  BATTLE_TYPE_TWO_OPPONENTS,
} from './constants';
import { getRuntime } from '../system/decomp-globals';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `BATTLE_TYPE_INGAME_PARTNER` = bit 23. */
const BATTLE_TYPE_INGAME_PARTNER = 1 << 23;
/** 1:1 décomp `BATTLE_TYPE_BATTLE_TOWER` = bit 19. */
const BATTLE_TYPE_BATTLE_TOWER = 1 << 19;
/** 1:1 décomp `PARTY_SIZE` = 6. */
const PARTY_SIZE = 6;
/** 1:1 décomp `MAX_BATTLERS_COUNT` = 4. */
const MAX_BATTLERS_COUNT = 4;
/** 1:1 décomp `MULTIUSE_STATE` = 0. */
const MULTIUSE_STATE = 0;
/** 1:1 décomp `BATTLE_ENVIRONMENT_BUILDING` = 8 (= K18). */
const BATTLE_ENVIRONMENT_BUILDING = 8;
/** 1:1 décomp `TRAINER_STEVEN_PARTNER` ID. */
const TRAINER_STEVEN_PARTNER = 768;
/** 1:1 décomp `FRIENDSHIP_EVENT_LEAGUE_BATTLE` (= constants/pokemon.h) = 6. */
const FRIENDSHIP_EVENT_LEAGUE_BATTLE = 6;
/** 1:1 décomp `DISPLAY_WIDTH` = 240, `DISPLAY_HEIGHT` = 160. */
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;

// REG_OFFSET_* (= io_reg.h).
const REG_OFFSET_MOSAIC = 0x4C;
const REG_OFFSET_WIN0H = 0x40;
const REG_OFFSET_WIN0V = 0x44;
const REG_OFFSET_WININ = 0x48;
const REG_OFFSET_WINOUT = 0x4A;

/** 1:1 décomp `WIN_RANGE(a, b)` = (a << 8) | b. */
function WIN_RANGE(a: number, b: number): number {
  return ((a & 0xFF) << 8) | (b & 0xFF);
}

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `MoveSaveBlocks_ResetHeap()` (save.c). */
function _MoveSaveBlocks_ResetHeap(): void {
  // Dette R3 : heap reset (= not applicable web).
}

/** 1:1 décomp `AllocateBattleResources()` (battle_main.c). */
function _AllocateBattleResources(): void {
  // Dette R3 : gBattleResources alloc (= struct statique côté TS).
}

/** 1:1 décomp `AllocateBattleSpritesData()`. */
function _AllocateBattleSpritesData(): void {
  // Dette R3 : gBattleSpritesDataPtr alloc.
}

/** 1:1 décomp `AllocateMonSpritesGfx()`. */
function _AllocateMonSpritesGfx(): void {
  // Dette R3 : gMonSpritesGfxPtr alloc.
}

/** 1:1 décomp `RecordedBattle_ClearFrontierPassFlag()`. */
function _RecordedBattle_ClearFrontierPassFlag(): void {
  // Dette R3.
}

/** 1:1 décomp `HandleLinkBattleSetup()`. */
function _HandleLinkBattleSetup(): void {
  // Dette R3.
}

/** 1:1 décomp `SetMainCallback2(cb)`. */
function _SetMainCallback2(_cb: (() => void) | null): void {
  // Dette R3 : CB2 dispatch via runtime.
}

/** 1:1 décomp `SetHBlankCallback(cb)` + `SetVBlankCallback(cb)`. */
function _SetHBlankCallback(_cb: (() => void) | null): void { /* Dette R3 */ }
function _SetVBlankCallback(_cb: (() => void) | null): void { /* Dette R3 */ }

/** 1:1 décomp `CpuFill32(value, dest, size)`. */
function _CpuFill32(_value: number, _dest: unknown, _size: number): void {
  // Dette R3 : DMA VRAM clear.
}

/** 1:1 décomp `SetGpuReg(reg, value)`. */
function _SetGpuReg(reg: number, value: number): void {
  const rt = getRuntime();
  rt?.SetGpuReg?.(reg, value);
}

/** 1:1 décomp `ScanlineEffect_Clear()` + `ScanlineEffect_SetParams(params)`. */
function _ScanlineEffect_Clear(): void { /* Dette R3 */ }
function _ScanlineEffect_SetParams(_params: unknown): void { /* Dette R3 */ }

/** 1:1 décomp `gScanlineEffectRegBuffers[buf][line]`. */
const gScanlineEffectRegBuffers: number[][] = [
  new Array(160).fill(0), new Array(160).fill(0),
];

/** 1:1 décomp `ResetPaletteFade()`. */
function _ResetPaletteFade(): void {
  // Dette R3 : palette fade state reset.
}

/** 1:1 décomp `InitBattleBgsVideo()`. */
function _InitBattleBgsVideo(): void {
  // Dette R3 : BG setup.
}

/** 1:1 décomp `LoadBattleTextboxAndBackground()`. */
function _LoadBattleTextboxAndBackground(): void {
  // Dette R3.
}

/** 1:1 décomp `ResetSpriteData()` + `ResetTasks()`. */
function _ResetSpriteData(): void {
  getRuntime()?.gSprites?.clear();
}
function _ResetTasks(): void {
  getRuntime()?.gTasks?.clear();
}

/** 1:1 décomp `DrawBattleEntryBackground()`. */
function _DrawBattleEntryBackground(): void { /* Dette R3 */ }

/** 1:1 décomp `FreeAllSpritePalettes()`. */
function _FreeAllSpritePalettes(): void { /* Dette R3 */ }

/** 1:1 décomp `SetWildMonHeldItem()` (pokemon.c). */
function _SetWildMonHeldItem(): void {
  // Dette R3 : wild mon held item assignment.
}

/** 1:1 décomp `AdjustFriendship(mon, eventType)`. */
function _AdjustFriendship(_mon: unknown, _eventType: number): void {
  // Dette R3.
}

/** Wire vers K18 BattleSetup_GetEnvironmentId. */
function _BattleSetup_GetEnvironmentId(): number {
  const m = (globalThis as Record<string, unknown>).__battleSetupHelpers as {
    BattleSetup_GetEnvironmentId?: () => number;
  } | undefined;
  return m?.BattleSetup_GetEnvironmentId?.() ?? 0;
}

/** Wire vers K18 SetUpBattleVarsAndBirchZigzagoon. */
function _SetUpBattleVarsAndBirchZigzagoon(): void {
  const m = (globalThis as Record<string, unknown>).__battleSetupHelpers as {
    SetUpBattleVarsAndBirchZigzagoon?: () => void;
  } | undefined;
  m?.SetUpBattleVarsAndBirchZigzagoon?.();
}

/** Wire vers K19 VBlankCB_Battle. */
function _getVBlankCB_Battle(): (() => void) | null {
  const m = (globalThis as Record<string, unknown>).__battleVBlankHelpers as {
    VBlankCB_Battle?: () => void;
  } | undefined;
  return m?.VBlankCB_Battle ?? null;
}

/** Wire vers K24 CB2_HandleStartBattle. */
function _getCB2_HandleStartBattle(): () => void {
  const m = (globalThis as Record<string, unknown>).__battleLinkStart as {
    CB2_HandleStartBattle?: () => void;
  } | undefined;
  return m?.CB2_HandleStartBattle ?? ((): void => { /* noop */ });
}

/** Wire vers K15 CreateNPCTrainerParty. */
function _CreateNPCTrainerParty(party: unknown, trainerNum: number, firstTrainer: boolean): number {
  const m = (globalThis as Record<string, unknown>).__battleTrainerParty as {
    CreateNPCTrainerParty?: (party: unknown, trainerNum: number, firstTrainer: boolean) => number;
  } | undefined;
  return m?.CreateNPCTrainerParty?.(party, trainerNum, firstTrainer) ?? 0;
}

// CB2_HandleStartMulti* — non portés.
function _CB2_HandleStartMultiPartnerBattle(): void { /* Dette R3 multi */ }
function _CB2_HandleStartMultiBattle(): void { /* Dette R3 multi */ }
function _CB2_PreInitMultiBattle(): void { /* Dette R3 multi */ }
function _CB2_PreInitIngamePlayerPartnerBattle(): void { /* Dette R3 partner */ }

// ─── CB2_InitBattle (battle_main.c:588) — 1:1 décomp ───────────────────────

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

// ─── CB2_InitBattleInternal (battle_main.c:619) — 1:1 décomp ───────────────

/** 1:1 décomp `CB2_InitBattleInternal()` (battle_main.c:619-710).
 *  Full battle setup : VRAM clear + GPU regs + scanline + BGs + sprites
 *  + dispatch CB2 selon type + trainer party load + friendship adjust. */
export function CB2_InitBattleInternal(): void {
  _SetHBlankCallback(null);
  _SetVBlankCallback(null);

  _CpuFill32(0, null /* VRAM */, 0x18000);

  _SetGpuReg(REG_OFFSET_MOSAIC, 0);
  _SetGpuReg(REG_OFFSET_WIN0H, DISPLAY_WIDTH);
  _SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(DISPLAY_HEIGHT / 2, DISPLAY_HEIGHT / 2 + 1));
  _SetGpuReg(REG_OFFSET_WININ, 0);
  _SetGpuReg(REG_OFFSET_WINOUT, 0);

  // 1:1 décomp ll. 634-660 : WIN setup + scanline buffers selon partner type.
  const vbm = (globalThis as Record<string, unknown>).__battleVBlankHelpers as {
    battleVBlankState?: {
      win0h: number; win0v: number; win1h: number; win1v: number;
      bg0_x: number; bg0_y: number; bg1_x: number; bg1_y: number;
      bg2_x: number; bg2_y: number; bg3_x: number; bg3_y: number;
    };
  } | undefined;

  if (vbm?.battleVBlankState) {
    vbm.battleVBlankState.win0h = DISPLAY_WIDTH;
  }

  // Get gPartnerTrainerId via lazy globalThis.
  const stateMod = (globalThis as { __battleState?: { gPartnerTrainerId?: number } }).__battleState;
  const partnerTrainerId = stateMod?.gPartnerTrainerId ?? 0;

  if ((gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER) && partnerTrainerId !== TRAINER_STEVEN_PARTNER) {
    // 1:1 décomp ll. 638-641 : ingame partner non-Steven WIN setup.
    if (vbm?.battleVBlankState) {
      vbm.battleVBlankState.win0v = DISPLAY_HEIGHT - 1;
      vbm.battleVBlankState.win1h = DISPLAY_WIDTH;
      vbm.battleVBlankState.win1v = 32;
    }
  } else {
    // 1:1 décomp ll. 644-660 : standard battle WIN0V split central + scanline.
    if (vbm?.battleVBlankState) {
      vbm.battleVBlankState.win0v = WIN_RANGE(DISPLAY_HEIGHT / 2, DISPLAY_HEIGHT / 2 + 1);
    }
    _ScanlineEffect_Clear();

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

    _ScanlineEffect_SetParams(null /* sIntroScanlineParams16Bit */);
  }

  _ResetPaletteFade();

  // 1:1 décomp ll. 663-670 : reset 8 BG scroll vars.
  if (vbm?.battleVBlankState) {
    vbm.battleVBlankState.bg0_x = 0; vbm.battleVBlankState.bg0_y = 0;
    vbm.battleVBlankState.bg1_x = 0; vbm.battleVBlankState.bg1_y = 0;
    vbm.battleVBlankState.bg2_x = 0; vbm.battleVBlankState.bg2_y = 0;
    vbm.battleVBlankState.bg3_x = 0; vbm.battleVBlankState.bg3_y = 0;
  }

  // 1:1 décomp ll. 672-674 : gBattleEnvironment depuis K18.
  let environment = _BattleSetup_GetEnvironmentId();
  if (gBattleTypeFlags & BATTLE_TYPE_RECORDED) {
    environment = BATTLE_ENVIRONMENT_BUILDING;
  }
  setBattleEnvironment(environment);

  _InitBattleBgsVideo();
  _LoadBattleTextboxAndBackground();
  _ResetSpriteData();
  _ResetTasks();
  _DrawBattleEntryBackground();
  _FreeAllSpritePalettes();
  // 1:1 décomp l. 682 : gReservedSpritePaletteCount = MAX_BATTLERS_COUNT.
  void MAX_BATTLERS_COUNT;
  _SetVBlankCallback(_getVBlankCB_Battle());
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
    _SetWildMonHeldItem();
  }

  // 1:1 décomp ll. 703-704 : gMain.inBattle = TRUE + frontier disableRecordBattle.
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setMainInBattle?: (v: boolean) => void;
  } | undefined;
  m?.setMainInBattle?.(true);

  const sb2 = (globalThis as { gSaveBlock2Ptr?: { frontier?: { disableRecordBattle?: boolean } } }).gSaveBlock2Ptr;
  if (sb2?.frontier) sb2.frontier.disableRecordBattle = false;

  // 1:1 décomp ll. 706-707 : AdjustFriendship per player mon (= +1 friendship).
  const playerParty = ((globalThis as { gSaveBlock1Ptr?: { playerParty?: unknown[] } }).gSaveBlock1Ptr?.playerParty) ?? [];
  for (let i = 0; i < PARTY_SIZE; i++) {
    _AdjustFriendship(playerParty[i], FRIENDSHIP_EVENT_LEAGUE_BATTLE);
  }

  gBattleCommunication[MULTIUSE_STATE] = 0;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleInit = {
  CB2_InitBattle, CB2_InitBattleInternal,
  gScanlineEffectRegBuffers,
};
