/**
 * fldeff_flash.ts — Port 1:1 STRICT (MIROIR partiel) de `src/fldeff_flash.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/fldeff_flash.c
 *
 * Branche FLASH HM (party menu) : `FieldCallback_Flash` + `FldEff_UseFlash`. Le
 * gros de fldeff_flash.c (transitions de grotte BLDCNT/BLDALPHA via CB2_DoChangeMap
 * / TryDoMapTransition) est déclenché aux WARPS entrée/sortie de grotte, PAS par
 * le move — chantier séparé (non porté ici, mais ce qui est porté est 1:1 propre).
 *
 * `SetUpFieldMove_Flash` (condition cave + flag) est dans party-screen.ts
 * (anti-cycle ESM). Il pose `gPostMenuFieldCallback = __FieldCallback_Flash`
 * (exposé ci-dessous sur globalThis). La pénombre de grotte (sFlashLevelToRadius
 * + masque circulaire) + les opcodes animateflash/setflashlevel existent déjà
 * (flash-mask.ts + script-opcodes-screen-fx.ts).
 */

import { CreateFieldMoveTask } from './field_effect_helpers';
import { FlagSet } from './engine/script/script-vars';
import { ScriptContext_SetupScript } from './script';

/** 1:1 décomp `FLAG_SYS_USE_FLASH` (= SYSTEM_FLAGS + 0x28 = 2184). */
const FLAG_SYS_USE_FLASH = 2184;

/** 1:1 STRICT décomp `FldEff_UseFlash` (fldeff_flash.c:94) :
 *    PlaySE(SE_M_REFLECT);                              // audio skip (règle BGM/SE)
 *    FlagSet(FLAG_SYS_USE_FLASH);
 *    ScriptContext_SetupScript(EventScript_UseFlash);   // ["animateflash 1","setflashlevel 1","end"]
 *  Le script anime l'ouverture du rayon (gFlashLevel 8→1 via animateflash) → la
 *  grotte s'éclaire (flash-mask.ts rend le masque circulaire). */
function FldEff_UseFlash(): void {
  // PlaySE(SE_M_REFLECT) : skip (audio non demandé).
  FlagSet(FLAG_SYS_USE_FLASH);
  ScriptContext_SetupScript('EventScript_UseFlash');
}

/** 1:1 STRICT décomp `FieldCallback_Flash` (fldeff_flash.c:87) :
 *    taskId = CreateFieldMoveTask();
 *    gFieldEffectArguments[0] = GetCursorSelectionMonId();   // show-mon no-op (posé par le menu)
 *    gTasks[taskId].data[8/9] = (u32)FldEff_UseFlash;        // fn callback
 *  Port : `CreateFieldMoveTask(FldEff_UseFlash)` (fn passée directement). Appelé
 *  comme `gPostMenuFieldCallback` par le party menu (Task_FieldMoveWaitForFade). */
export function FieldCallback_Flash(): void {
  CreateFieldMoveTask(FldEff_UseFlash);
}

// Exposé pour le party menu (SetUpFieldMove_Flash pose gPostMenuFieldCallback =
// __FieldCallback_Flash) sans import statique party-screen→ce module (anti-cycle ESM).
(globalThis as Record<string, unknown>).__FieldCallback_Flash = FieldCallback_Flash;
