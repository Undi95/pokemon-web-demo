/**
 * fldeff_sweetscent.ts — Port 1:1 STRICT (MIROIR) de `src/fldeff_sweetscent.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/fldeff_sweetscent.c
 *
 * Doux Parfum (party-menu, hors combat) : pose field-move → flash ROUGE de
 * l'écran → après 64 frames, encounter sauvage FORCÉ (SweetScentWildEncounter).
 * Si aucun encounter possible (pas de tuile herbe/eau sauvage) → restore palette
 * + EventScript_FailSweetScent (« Pas de POKéMON... »).
 *
 * `SetUpFieldMove_SweetScent` + `FieldCallback_SweetScent` sont définis dans
 * party-screen.ts (anti-cycle ESM : le module UI n'importe pas ce graphe field)
 * et postent `FieldEffectStart(FLDEFF_SWEET_SCENT)` → dispatch vers FldEff_SweetScent ci-dessous.
 */

import type { DecompRuntime } from './engine/system/decomp-runtime';
import type { DecompTask } from './engine/system/decomp-runtime';
import { CreateFieldMoveTask } from './field_effect_helpers';
import { FieldEffectActiveListRemove } from './engine/field/field-effect-active-list';
import { SetWeatherScreenFadeOut, SetWeatherPalStateIdle } from './field_weather';
import { SweetScentWildEncounter } from './wild_encounter';
import { GetPlayerAvatarSpriteId } from './field_player_avatar';
import { ScriptContext_SetupScript } from './engine/script/script-runtime';
import { getRuntime, gPaletteDecompressionBuffer, BlendPalettes } from './engine/system/decomp-globals';
import { BeginNormalPaletteFade } from './engine/system/decomp-bridge';

/** 1:1 décomp `FLDEFF_SWEET_SCENT = 51` (include/constants/field_effects.h). */
const FLDEFF_SWEET_SCENT = 51;
/** 1:1 décomp `RGB_RED = RGB(31, 0, 0)` = 0x001F (BGR15). */
const RGB_RED = 0x001F;
/** Nombre d'entrées PLTT (= PLTT_SIZE/2, PaletteBuffer = 512 u16). */
const PLTT_ENTRIES = 512;

/** Copie gPlttBufferUnfaded -> gPaletteDecompressionBuffer (PaletteBuffer -> Uint16Array).
 *  = 1:1 décomp `CpuFastCopy(gPlttBufferUnfaded, gPaletteDecompressionBuffer, PLTT_SIZE)`.
 *  (Le CpuFastCopy du port ne gère pas le wrapper PaletteBuffer → copie .get/.set localisée.) */
function _saveUnfadedToDecompBuffer(rt: DecompRuntime): void {
  for (let i = 0; i < PLTT_ENTRIES; i++) gPaletteDecompressionBuffer[i] = rt.gPlttBufferUnfaded.get(i);
}
/** Copie gPlttBufferFaded -> gPlttBufferUnfaded. = `CpuFastCopy(gPlttBufferFaded, gPlttBufferUnfaded, PLTT_SIZE)`. */
function _copyFadedToUnfaded(rt: DecompRuntime): void {
  for (let i = 0; i < PLTT_ENTRIES; i++) rt.gPlttBufferUnfaded.set(i, rt.gPlttBufferFaded.get(i));
}
/** Restaure gPaletteDecompressionBuffer -> gPlttBufferUnfaded. = `CpuFastCopy(gPaletteDecompressionBuffer, gPlttBufferUnfaded, PLTT_SIZE)`. */
function _restoreDecompBufferToUnfaded(rt: DecompRuntime): void {
  for (let i = 0; i < PLTT_ENTRIES; i++) rt.gPlttBufferUnfaded.set(i, gPaletteDecompressionBuffer[i]);
}

/** Masque de fade = tous les slots SAUF la palette OBJ du joueur (pour qu'il
 *  reste visible pendant le flash rouge). 1:1 `~(1 << (gSprites[GetPlayerAvatarSpriteId()].oam.paletteNum + 16))`. */
function _fadeMaskExcludingPlayer(rt: DecompRuntime): number {
  // décomp : gSprites[spriteId].oam.paletteNum. Port : la palette OBJ vit dans
  // l'entrée OAM (rt.gba.oam[oamIndex].paletteBank), pas sur DecompSprite.
  const sprite = rt.gSprites[GetPlayerAvatarSpriteId()];
  const palNum = sprite ? (rt.gba.oam[sprite.oamIndex]?.paletteBank ?? 0) : 0;
  return ~(1 << (palNum + 16));
}

/** 1:1 STRICT décomp `FailSweetScentEncounter` (fldeff_sweetscent.c:91) :
 *    if (!gPaletteFade.active) {
 *        CpuFastCopy(gPaletteDecompressionBuffer, gPlttBufferUnfaded, PLTT_SIZE);
 *        SetWeatherPalStateIdle();
 *        ScriptContext_SetupScript(EventScript_FailSweetScent);
 *        DestroyTask(taskId);
 *    } */
function FailSweetScentEncounter(task: DecompTask): void {
  const rt = getRuntime();
  if (rt.gPaletteFade.active) return;
  _restoreDecompBufferToUnfaded(rt);
  SetWeatherPalStateIdle();
  ScriptContext_SetupScript('EventScript_FailSweetScent');
  rt.DestroyTask(task.taskId);
}

/** 1:1 STRICT décomp `TrySweetScentEncounter` (fldeff_sweetscent.c:71) :
 *    if (!gPaletteFade.active) {
 *        ClearMirageTowerPulseBlendEffect();                   ← mirage_tower.c non porté (no-op hors Route 111)
 *        BlendPalettes(0x00000040, 8, RGB_RED);
 *        if (data[0] == 64) {
 *            data[0] = 0;
 *            if (SweetScentWildEncounter() == TRUE) DestroyTask(taskId);
 *            else { func = FailSweetScentEncounter; BeginNormalPaletteFade(..., 4, 8, 0, RGB_RED); TryStartMirageTowerPulseBlendEffect(); }
 *        } else data[0]++;
 *    } */
function TrySweetScentEncounter(task: DecompTask): void {
  const rt = getRuntime();
  if (rt.gPaletteFade.active) return;
  // ClearMirageTowerPulseBlendEffect() : mirage_tower.c non porté → no-op partout
  // sauf le donjon Tour Mirage (Route 111 désert). Documenté, pas stubbé.
  BlendPalettes(0x00000040, 8, RGB_RED);
  if (task.data[0] === 64) {
    task.data[0] = 0;
    if (SweetScentWildEncounter()) {
      rt.DestroyTask(task.taskId);
    } else {
      task.func = FailSweetScentEncounter;
      BeginNormalPaletteFade(_fadeMaskExcludingPlayer(rt), 4, 8, 0, RGB_RED);
      // TryStartMirageTowerPulseBlendEffect() : no-op (cf. ci-dessus).
    }
  } else {
    task.data[0]++;
  }
}

/** 1:1 STRICT décomp `StartSweetScentFieldEffect` (fldeff_sweetscent.c:55) :
 *    PlaySE(SE_M_SWEET_SCENT);                                  ← audio skip (règle BGM/SE)
 *    CpuFastCopy(gPlttBufferUnfaded, gPaletteDecompressionBuffer, PLTT_SIZE);
 *    CpuFastCopy(gPlttBufferFaded, gPlttBufferUnfaded, PLTT_SIZE);
 *    BeginNormalPaletteFade(~(1 << (playerPalNum + 16)), 4, 0, 8, RGB_RED);
 *    taskId = CreateTask(TrySweetScentEncounter, 0);
 *    gTasks[taskId].data[0] = 0;
 *    FieldEffectActiveListRemove(FLDEFF_SWEET_SCENT);
 *  Appelé par CreateFieldMoveTask APRÈS la pose field-move + show-mon. */
function StartSweetScentFieldEffect(): void {
  const rt = getRuntime();
  // PlaySE(SE_M_SWEET_SCENT) : skip (règle audio — non demandé par le user).
  _saveUnfadedToDecompBuffer(rt);
  _copyFadedToUnfaded(rt);
  BeginNormalPaletteFade(_fadeMaskExcludingPlayer(rt), 4, 0, 8, RGB_RED);
  const taskId = rt.CreateTask(TrySweetScentEncounter, 0);
  const task = rt.gTasks.get(taskId);
  if (task) task.data[0] = 0;
  FieldEffectActiveListRemove(FLDEFF_SWEET_SCENT);
}

/** 1:1 STRICT décomp `FldEff_SweetScent` (fldeff_sweetscent.c:43) :
 *    SetWeatherScreenFadeOut();
 *    taskId = CreateFieldMoveTask();
 *    gTasks[taskId].data[8/9] = (u32)StartSweetScentFieldEffect;   // fn en moitiés
 *    return FALSE;
 *  Port : `CreateFieldMoveTask(StartSweetScentFieldEffect)` (fn passée directement). */
export function FldEff_SweetScent(_rt: DecompRuntime): number {
  SetWeatherScreenFadeOut();
  CreateFieldMoveTask(StartSweetScentFieldEffect);
  return 0;  // FALSE
}
