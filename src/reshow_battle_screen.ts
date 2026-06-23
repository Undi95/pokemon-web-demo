/**
 * src/game/reshow_battle_screen.ts — MIROIR 1:1 strict de `reshow_battle_screen.c`
 * (D:/Projet 1/decomps/pokeemeraude/src/reshow_battle_screen.c). DÉPLACÉ depuis
 * src/engine/battle/reshow-battle-screen.ts (devenu shim re-export) le 2026-06-09.
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

import { ResetSpriteData } from './sprite';
import { getRuntime, FreeAllSpritePalettes, ResetPaletteFade, setReservedSpritePaletteCount } from '../harness/runtime/decomp-globals';
import { gBattlersCount, gBattleEnvironment, gBattlerPartyIndexes } from './engine/battle/state';
import { loadBattleTextboxAndBackground, BattleInitBgsAndWindows } from './battle_bg';

import { _loadAndCreateBattlerMonSprite } from './battle_controller_opponent';
// Healthbox : DIRECT depuis le miroir battle_interface (même dossier) — bénéfice de la
// consolidation : reshow_battle_screen.c inclut battle_interface.h, idem ici.
import {
  CreateBattlerHealthboxSprites, InitBattlerHealthboxCoords, UpdateHealthboxAttribute,
  SetHealthboxSpriteVisible, SetHealthboxSpriteInvisible, gHealthboxSpriteIds,
  BattleLoadAllHealthBoxesGfx,
} from './battle_interface';
import { BattleMainCB2 } from './battle_main';
import { VBlankCB_Battle } from './engine/battle/battle-vblank-helpers';
import { BeginHardwarePaletteFade } from './palette';
import { ActionSelectionCreateCursorAt } from './battle_controller_player';
import { GET_BATTLER_SIDE, B_SIDE_PLAYER } from './engine/battle/constants';
import { gPlayerParty, gEnemyParty } from './engine/battle/party-storage';
import { ClearSpritesHealthboxAnimData, isBattlerDataInvisible } from './engine/battle/battle-sprites-data';
import { FillAroundBattleWindows } from './battle_gfx_sfx_util';

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
  // Écran NOIR immédiat (BLDCNT=tous calques bright-dec, BLDY=16) pendant que la scène
  // se reconstruit. 1:1 esprit décomp : bufferTransferDisabled garde l'écran noir jusqu'au
  // fondu final ; ici on le fait via le blend hardware (que UpdatePaletteFade anime ensuite,
  // BeginHardwarePaletteFade au default case). Sans ça, les éléments réapparaissent un par un.
  rt?.SetGpuReg?.(0x050, 0x00FF);
  rt?.SetGpuReg?.(0x054, 16);
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

  // Maintient l'écran NOIR pendant TOUTE la (re)création (cases 0-19) — re-asserté chaque
  // frame car BattleInitBgsAndWindows/ResetPaletteFade peuvent remettre le blend à 0. Le
  // default case (state >= 20) lance BeginHardwarePaletteFade → UpdatePaletteFade anime
  // BLDY 16→0 (fondu synchronisé). Cf. ReshowBattleScreenAfterMenu.
  if (state <= 19) {
    rt?.SetGpuReg?.(0x050, 0x00FF);
    rt?.SetGpuReg?.(0x054, 16);
  }

  switch (state) {
    case 0:
      // 1:1 : ScanlineEffect_Clear + BattleInitBgsAndWindows + ShowBg(0..3) +
      // ResetPaletteFade + reset scrolls BG (reshow_battle_screen.c:56-63).
      BattleInitBgsAndWindows();
      ResetPaletteFade();
      // 1:1 gBattle_BG0_X/Y = 0 (+BG1/2) — SANS ce reset, le scroll BG0 reste
      // a 160 (groupe ACTION du tilemap 32x64) -> les boites du menu d'action
      // VIDES (tiles texte wipees) restent visibles pendant tout le fade-in du
      // retour sac/party (bug user 2026-06-10 « le menu s'affiche dans le
      // fading, vide » — capture frames n1720/n1725).
      {
        const vb = (globalThis as { __battleVBlankHelpers?: { battleVBlankState?: Record<string, number> } }).__battleVBlankHelpers;
        const st = vb?.battleVBlankState;
        if (st) {
          st.bg0_x = 0; st.bg0_y = 0;
          if ('bg1_x' in st) { st.bg1_x = 0; st.bg1_y = 0; }
          if ('bg2_x' in st) { st.bg2_x = 0; st.bg2_y = 0; }
        }
      }
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
      // 1:1 : BattleLoadAllHealthBoxesGfx (reshow_battle_screen.c:82) — (ré)alloue le
      // gfx healthbox dans OBJ VRAM, ICI, AVANT la (re)création des sprites mon
      // (cases 7-10). La case 3 (ResetSpriteData) a vidé le bitmap d'alloc → si on
      // saute cette étape, les mons prennent les tiles bas (0..127) et le re-blit
      // healthbox (offset périmé) les écrase → mons "blocs orange" après reshow (#8).
      // ASYNC en L (assets) → _reshowBusy comme les autres cases de chargement.
      _reshowBusy = true;
      void BattleLoadAllHealthBoxesGfx().then(() => { _reshowBusy = false; });
      break;
    case 7:
    case 8:
    case 9:
    case 10: {
      // 1:1 : LoadBattlerSpriteGfx(battler) → délègue à BattleLoad{Opponent,Player}
      // MonSpriteGfx (miroir battle_gfx_sfx_util, via _loadAndCreateBattlerMonSprite
      // qui enchaîne load PUIS create). Cases 7-10 ET 11-14 du décomp fusionnées
      // (async plateforme) → les cases 11-14 (CreateBattlerSprite) deviennent no-op.
      const battler = state - 7;
      if (battler < gBattlersCount) {
        _reshowBusy = true;
        const isOpp = GET_BATTLER_SIDE(battler) !== B_SIDE_PLAYER;
        // reshow:true → mon STATIQUE (1:1 CreateBattlerSprite), pas le slide-in/emerge
        // d'intro → l'ennemi ne "re-scrolle" plus comme s'il réapparaissait (#2).
        void _loadAndCreateBattlerMonSprite(battler, isOpp, { reshow: true }).then(() => {
          // 1:1 décomp CreateBattlerSprite (reshow_battle_screen.c:272) :
          // sprite.invisible = battlerData[battler].invisible — un mon en Vol/Tunnel
          // RESTE invisible après le party menu (champ écrit par CopyBattleSpriteInvisibility).
          const g = globalThis as {
            __battleControllerPlayer?: { getBattlerMonSpriteId?: (b: number) => number };
            __battleControllerOpponent?: { getBattlerMonSpriteId?: (b: number) => number };
          };
          const getId = battler % 2 === 0
            ? g.__battleControllerPlayer?.getBattlerMonSpriteId
            : g.__battleControllerOpponent?.getBattlerMonSpriteId;
          const monId = getId ? getId(battler) : -1;
          const spr = monId >= 0 ? getRuntime()?.gSprites[monId] : undefined;
          if (spr) (spr as { invisible: boolean }).invisible = isBattlerDataInvisible(battler);
          _reshowBusy = false;
        });
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
    case 19: {
      // 1:1 reshow_battle_screen.c:132-157 : LoadAndCreateEnemyShadowSprites +
      // SetBattlerShadowSpriteCallback(opp, species) + ActionSelectionCreateCursorAt
      // + wireless indicator (skippé : gWirelessCommType=0 chez nous).
      // Ombres : battle_gfx_sfx_util.c NON migré → hook structurel optionnel (graphe
      // d'appel 1:1 présent, no-op tant que le module n'expose pas les fonctions).
      const gfx = (globalThis as {
        __battleGfxSfxUtil?: {
          LoadAndCreateEnemyShadowSprites?: () => void;
          SetBattlerShadowSpriteCallback?: (battler: number, species: number) => void;
        };
      }).__battleGfxSfxUtil;
      gfx?.LoadAndCreateEnemyShadowSprites?.();
      if (gfx?.SetBattlerShadowSpriteCallback) {
        // 1:1 :139-141 : opponentBattler = GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)
        // = battler 1 en single ; species du mon adverse courant.
        const oppMon = gEnemyParty[gBattlerPartyIndexes[1] ?? 0];
        const species = (oppMon as { species?: number } | undefined)?.species ?? 0;
        gfx.SetBattlerShadowSpriteCallback(1, species);
      }
      // 1:1 :150 : ActionSelectionCreateCursorAt(gActionSelectionCursor[gBattlerInMenuId], 0)
      // — single : curseur du battler 0 ; position 0 = défaut (gActionSelectionCursor
      // non exposé ici ; divergence min. : curseur remis en haut-gauche au reshow).
      ActionSelectionCreateCursorAt(0, 0);
      break;
    }
    default:
      // 1:1 : SetVBlankCallback(VBlankCB_Battle) + ClearBattleBgCntBaseBlocks +
      // BeginHardwarePaletteFade(0xFF,0,0x10,0,1) + bufferTransferDisabled=0 +
      // SetMainCallback2(BattleMainCB2) + FillAroundBattleWindows.
      rt?.SetVBlankCallback?.(VBlankCB_Battle);
      ClearBattleBgCntBaseBlocks();   // 1:1 :161 (no-op plateforme, cf. doc)
      if (rt?.gPaletteFade) rt.gPaletteFade.bufferTransferDisabled = false;
      BeginHardwarePaletteFade(0xFF, 0, 0x10, 0, 1);
      rt?.SetMainCallback2?.(BattleMainCB2);
      FillAroundBattleWindows();      // 1:1 :165 (stub, dette battle_gfx_sfx_util)
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

// (ClearSpritesHealthboxAnimData : importé 1:1 depuis battle-sprites-data —
//  fichier d'origine décomp = battle_gfx_sfx_util.c, re-homé à sa migration.)

/** 1:1 décomp `void ReshowBattleScreenDummy(void)` (reshow_battle_screen.c:26) —
 *  vide dans la décomp aussi. */
export function ReshowBattleScreenDummy(): void {
  // 1:1 : corps vide.
}

/** 1:1 décomp `static void ClearBattleBgCntBaseBlocks(void)` (reshow_battle_screen.c:172) :
 *  REG_BG1CNT/REG_BG2CNT.charBaseBlock = 0. Registres BG GBA — chez nous le renderer
 *  ne modélise pas charBaseBlock par-BG (les tiles BG sont reconstruits par
 *  loadBattleTextboxAndBackground) → no-op plateforme documenté. */
function ClearBattleBgCntBaseBlocks(): void {
  // no-op plateforme (cf. doc) — 1:1 graphe d'appel conservé (default case).
}

// 1:1 décomp `FillAroundBattleWindows` : corps réel porté dans le miroir
// battle_gfx_sfx_util (son fichier d'origine) — import en tête de fichier.

/** 1:1 décomp `void CB2_SetUpReshowBattleScreenAfterMenu(void)`
 *  (battle_controller_player.c:1550). Exit-callback posé par les sous-écrans
 *  (InitPartyMenu/GoToBagMenu) → installe ReshowBattleScreenAfterMenu.
 *  ⚠️ Fichier décomp d'origine = battle_controller_player.c (pas reshow) — vit ici
 *  tant que le controller n'est pas migré ; re-exporté tel quel (dette placement). */
export function CB2_SetUpReshowBattleScreenAfterMenu(): void {
  getRuntime()?.SetMainCallback2?.(ReshowBattleScreenAfterMenu);
}

// Alias 1:1 (battle_controller_player.c:1555) — identique en pratique.
export const CB2_SetUpReshowBattleScreenAfterMenu2 = CB2_SetUpReshowBattleScreenAfterMenu;
