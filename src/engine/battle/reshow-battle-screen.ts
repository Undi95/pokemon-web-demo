/**
 * battle/reshow-battle-screen.ts — Port 1:1 strict de `reshow_battle_screen.c`
 * (D:/Projet 1/decomps/pokeemeraude/src/reshow_battle_screen.c).
 *
 * Reconstruit l'écran de combat après qu'un SOUS-ÉCRAN (sac/équipe/résumé) l'a
 * détruit via un scene-swap (CB2_InitPartyMenu / GoToBagMenu / Summary). Appelé
 * comme exit-callback de ces écrans : `CB2_SetUpReshowBattleScreenAfterMenu`
 * (battle_controller_player.c:1550) → `SetMainCallback2(ReshowBattleScreenAfterMenu)`.
 *
 * ⚠️ NE PAS confondre avec le « reshow-pump » ad-hoc de `battle-flow.ts` (voie V,
 *    NON-1:1, `_reshowPumpCB2`/`__battleSwitchResultSlot`). CECI est le VRAI reshow
 *    décomp, pour la voie L. (User 2026-06-05 : « ne reprends pas V à l'aveugle ».)
 *
 * Divergences V/L assumées + documentées :
 *  - Les loads d'assets en L sont ASYNC (vs sync ROM GBA). La machine à états garde
 *    sa STRUCTURE 1:1 (mêmes cases/ordre, une étape/frame) ; les cases qui chargent
 *    un asset posent `_reshowBusy=true` et la frame suivante attend (le runtime
 *    re-tick le CB2 tant qu'il est `gMain.callback2`). Même effet observable.
 *  - Registres GBA purs (SetGpuReg MOSAIC, SetHBlankCallback, gBattle_BG*_X scroll,
 *    gReservedSpritePaletteCount, CpuFastFill VRAM) = abstraits/no-op par le runtime
 *    web → omis avec note (le reload BG/sprites + le fade couvrent l'effet visible).
 */

import { getRuntime, FreeAllSpritePalettes, ResetPaletteFade, setReservedSpritePaletteCount } from '../system/decomp-globals';
import { gBattlersCount, gBattleEnvironment, gBattlerPartyIndexes } from './state';
import { loadBattleTextboxAndBackground, BattleInitBgsAndWindows } from './battle-bg';
import { ResetSpriteData } from '../system/decomp-bridge';
import { _loadAndCreateBattlerMonSprite } from './battle-controller-opponent';
import {
  CreateBattlerHealthboxSprites, InitBattlerHealthboxCoords, UpdateHealthboxAttribute,
  SetHealthboxSpriteVisible, SetHealthboxSpriteInvisible, gHealthboxSpriteIds,
} from './battle-healthbox-l';
import { BattleMainCB2 } from './battle-cb2';
import { VBlankCB_Battle } from './battle-vblank-helpers';
import { BeginHardwarePaletteFade } from '../system/palette';
import { ActionSelectionCreateCursorAt } from './battle-controller-player';
import { GET_BATTLER_SIDE, B_SIDE_PLAYER } from './constants';
import { gPlayerParty, gEnemyParty } from './party-storage';

/** 1:1 décomp `HEALTHBOX_ALL` (battle_interface.h) — refresh tous les éléments. */
const HEALTHBOX_ALL = 0;

/** Accès `gBattleScripting.reshowMainState` (champ réel du struct, memory-map.ts:209). */
function _reshowMain(): number {
  return (globalThis as { __battleState?: { gBattleScripting?: { reshowMainState?: number } } })
    .__battleState?.gBattleScripting?.reshowMainState ?? 0;
}
function _setReshowMain(v: number): void {
  const bs = (globalThis as { __battleState?: { gBattleScripting?: { reshowMainState?: number } } })
    .__battleState?.gBattleScripting;
  if (bs) bs.reshowMainState = v & 0xFF;
}

/** Garde async : une case qui charge un asset la pose ; la frame suivante attend. */
let _reshowBusy = false;

/** 1:1 décomp `void ReshowBattleScreenAfterMenu(void)` (reshow_battle_screen.c:31).
 *  Désactive le transfert de palette, init les états de la machine, et installe
 *  `CB2_ReshowBattleScreenAfterMenu` comme CB2. (HBlank/VBlank/Mosaic = registres
 *  GBA abstraits par le runtime → bufferTransferDisabled seul est pertinent.) */
export function ReshowBattleScreenAfterMenu(): void {
  const rt = getRuntime();
  if (rt?.gPaletteFade) rt.gPaletteFade.bufferTransferDisabled = true;
  _setReshowMain(0);
  const bsHelper = (globalThis as { __battleState?: { gBattleScripting?: { reshowHelperState?: number } } })
    .__battleState?.gBattleScripting;
  if (bsHelper) bsHelper.reshowHelperState = 0;
  _reshowBusy = false;
  rt?.SetMainCallback2?.(CB2_ReshowBattleScreenAfterMenu);
}

/** 1:1 décomp `static void CB2_ReshowBattleScreenAfterMenu(void)`
 *  (reshow_battle_screen.c:42). Machine à états (cases 0-19 + default) ticked chaque
 *  frame. Reconstruit BG/textbox → reset sprite-data → sprites des combattants →
 *  healthboxes → curseur, puis fade-in et retour à BattleMainCB2. */
function CB2_ReshowBattleScreenAfterMenu(): void {
  if (_reshowBusy) return;   // attente d'un load async (divergence plateforme)
  const rt = getRuntime();
  const state = _reshowMain();

  switch (state) {
    case 0:
      // 1:1 : ScanlineEffect_Clear + BattleInitBgsAndWindows + ShowBg(0..3) +
      // ResetPaletteFade + reset scrolls BG (= runtime web : BattleInitBgsAndWindows
      // + ResetPaletteFade ; ShowBg/BG-scroll gérés par le renderer).
      BattleInitBgsAndWindows();
      ResetPaletteFade();
      break;
    case 1:
      // 1:1 : CpuFastFill(0, VRAM, VRAM_SIZE) — clear VRAM (implicite en L via le
      // reload BG/sprites ci-dessous).
      break;
    case 2:
      // 1:1 : LoadBattleTextboxAndBackground (ASYNC en L).
      _reshowBusy = true;
      void loadBattleTextboxAndBackground(gBattleEnvironment).then(() => { _reshowBusy = false; });
      break;
    case 3:
      ResetSpriteData();
      break;
    case 4:
      // 1:1 : FreeAllSpritePalettes + gReservedSpritePaletteCount=MAX_BATTLERS_COUNT.
      // ⚠️ Ce 2e appel n'est PAS un no-op en L : il réserve les slots OBJ 0-3 pour les
      // sprites des combattants (= comme le boot battle-init:368). Sans lui → palettes
      // mon corrompues après reshow (vérifié runtime).
      FreeAllSpritePalettes();
      setReservedSpritePaletteCount(4 /* MAX_BATTLERS_COUNT */);
      break;
    case 5:
      ClearSpritesHealthboxAnimData();
      break;
    case 6:
      // 1:1 : BattleLoadAllHealthBoxesGfx — en L le gfx healthbox est (re)chargé par
      // CreateBattlerHealthboxSprites (cases 15-18) → pas d'étape de préload séparée.
      break;
    case 7:
    case 8:
    case 9:
    case 10: {
      // 1:1 : LoadBattlerSpriteGfx(battler). En L `_loadAndCreateBattlerMonSprite`
      // FUSIONNE load + create (cases 7-10 ET 11-14 du décomp) → on charge+crée ici ;
      // les cases 11-14 deviennent no-op.
      const battler = state - 7;
      if (battler < gBattlersCount) {
        _reshowBusy = true;
        const isOpp = GET_BATTLER_SIDE(battler) !== B_SIDE_PLAYER;
        void _loadAndCreateBattlerMonSprite(battler, isOpp).then(() => { _reshowBusy = false; });
      }
      break;
    }
    case 11:
    case 12:
    case 13:
    case 14:
      // 1:1 : CreateBattlerSprite(battler) — FUSIONNÉ dans cases 7-10 en L (no-op).
      break;
    case 15:
    case 16:
    case 17:
    case 18:
      // 1:1 : CreateHealthboxSprite(battler) (reshow_battle_screen.c:268, ASYNC en L).
      _reshowBusy = true;
      void CreateHealthboxSprite(state - 15).then(() => { _reshowBusy = false; });
      break;
    case 19:
      // 1:1 : LoadAndCreateEnemyShadowSprites + SetBattlerShadowSpriteCallback +
      // ActionSelectionCreateCursorAt(gActionSelectionCursor[gBattlerInMenuId], 0).
      // (Ombres = chantier sprite séparé ; on restaure au moins le curseur d'action.)
      ActionSelectionCreateCursorAt(0, 0);
      break;
    default:
      // 1:1 : SetVBlankCallback(VBlankCB_Battle) + ClearBattleBgCntBaseBlocks +
      // BeginHardwarePaletteFade(0xFF,0,0x10,0,1) + bufferTransferDisabled=0 +
      // SetMainCallback2(BattleMainCB2) + FillAroundBattleWindows.
      rt?.SetVBlankCallback?.(VBlankCB_Battle);
      if (rt?.gPaletteFade) rt.gPaletteFade.bufferTransferDisabled = false;
      BeginHardwarePaletteFade(0xFF, 0, 0x10, 0, 1);
      rt?.SetMainCallback2?.(BattleMainCB2);
      // Signal « reshow terminé » pour les controllers (WaitForMonSelection) =
      // équivalent L sync/cycle-free du check décomp `gMain.callback2 == BattleMainCB2`.
      (globalThis as { __battleReshowDone?: boolean }).__battleReshowDone = true;
      return;   // 1:1 : pas d'incrément après le default (on a quitté le CB2)
  }

  _setReshowMain(state + 1);
}

/** 1:1 décomp `static void CreateHealthboxSprite(u8 battler)`
 *  (reshow_battle_screen.c:268). Crée le healthbox du combattant, init ses coords,
 *  le rend visible, refresh tous ses éléments, et le cache si le mon est K.O. */
async function CreateHealthboxSprite(battler: number): Promise<void> {
  if (battler >= gBattlersCount) return;
  const healthboxSpriteId = await CreateBattlerHealthboxSprites(battler);
  gHealthboxSpriteIds[battler] = healthboxSpriteId;
  InitBattlerHealthboxCoords(battler);
  SetHealthboxSpriteVisible(healthboxSpriteId);

  const isPlayer = GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER;
  const partyIdx = gBattlerPartyIndexes[battler];
  const mon = isPlayer ? gPlayerParty[partyIdx] : gEnemyParty[partyIdx];
  if (mon) {
    UpdateHealthboxAttribute(healthboxSpriteId, mon, HEALTHBOX_ALL);
    // 1:1 : cache le healthbox si le mon est K.O. (HP == 0).
    if ((mon.hp ?? 0) === 0) SetHealthboxSpriteInvisible(healthboxSpriteId);
  }
}

/** 1:1 décomp `void ClearSpritesHealthboxAnimData(void)` (battle_gfx_sfx_util.c).
 *  Reset les données d'anim healthbox/HP-bar de tous les combattants. */
function ClearSpritesHealthboxAnimData(): void {
  (globalThis as { __battleSpritesData?: { resetBattleSpritesData?: () => void } })
    .__battleSpritesData?.resetBattleSpritesData?.();
}

/** 1:1 décomp `void CB2_SetUpReshowBattleScreenAfterMenu(void)`
 *  (battle_controller_player.c:1550). Exit-callback posé par les sous-écrans
 *  (InitPartyMenu/GoToBagMenu) → installe ReshowBattleScreenAfterMenu. */
export function CB2_SetUpReshowBattleScreenAfterMenu(): void {
  getRuntime()?.SetMainCallback2?.(ReshowBattleScreenAfterMenu);
}

// Alias 1:1 (battle_controller_player.c:1555) — identique en pratique.
export const CB2_SetUpReshowBattleScreenAfterMenu2 = CB2_SetUpReshowBattleScreenAfterMenu;
