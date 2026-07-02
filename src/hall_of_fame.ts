/**
 * hall_of_fame.ts — décomp `src/hall_of_fame.c` (AMORCE — CB2 INTÉRIMAIRE HONNÊTE).
 *
 * L'écran Hall of Fame complet (défilé de l'équipe + confettis + gHasHallOfFameRecords
 * + écriture des HOF records SRAM + enchaînement credits.c) = CHEMIN Palier 4.
 *
 * Ce fichier fournit UNIQUEMENT `CB2_DoHallOfFameScreen` en version intérimaire :
 *   1. sauvegarde (= l'effet DURABLE : GameClear a posé FLAG_SYS_GAME_CLEAR,
 *      les rubans Champion, le continue-warp chambre — décomp hall_of_fame.c
 *      sauve pendant l'écran via TrySavingData(SAVE_HALL_OF_FAME)) ;
 *   2. fondu au noir → retour à l'écran titre (déroulé décomp : HOF → credits →
 *      soft-reset titre ; on saute l'AFFICHAGE, pas les effets).
 * Oracle en jeu : battre la Ligue → special GameClear → save + retour titre →
 * CONTINUER → réveil dans la chambre du joueur (continue-warp).
 */
import type { CB2Callback } from '../harness/runtime/decomp-runtime';
import { UpdatePaletteFade } from '../harness/runtime/decomp-globals';
import { TrySavingData } from './save';

let _hofInterimState = 0;

/** = décomp `CB2_DoHallOfFameScreen` (hall_of_fame.c) — INTÉRIM (voir en-tête).
 *  title_screen en import DYNAMIQUE : garde ce fichier hors du graphe statique
 *  intro/titre (il est tiré par specials-registry via post_battle_event_funcs). */
export const CB2_DoHallOfFameScreen: CB2Callback = (rt) => {
  if (_hofInterimState === 0) {
    _hofInterimState = 1;
    // 1:1 effet durable : le HOF sauve la partie (hall_of_fame.c Task_Hof_TrySaveData
    // → TrySavingData(SAVE_HALL_OF_FAME)). L'écran/records = P4.
    const ok = TrySavingData();
    console.log(`[hall_of_fame] INTÉRIM : save ${ok ? 'OK' : 'KO'} — écran HOF/credits = CHEMIN P4, retour titre.`);
    rt.BeginNormalPaletteFade("PALETTES_ALL", 0, 0, 16, "RGB_BLACK");
  }
  if (_hofInterimState === 1 && !UpdatePaletteFade()) {
    _hofInterimState = 2;
    void import('./title_screen').then((ts) => {
      _hofInterimState = 0;
      rt.SetMainCallback2(ts.CB2_InitTitleScreen);
    });
  }
};
