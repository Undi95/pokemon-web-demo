/**
 * post_battle_event_funcs.ts — 1:1 décomp `src/post_battle_event_funcs.c` (2 fns).
 *
 *   - `GameClear` : special du script Hall of Fame (EverGrandeCity_HallOfFame,
 *     `special GameClear` + waitstate) — victoire de la Ligue.
 *   - `SetCB2WhiteOut` : special d'`EventScript_FieldWhiteOut` (event_scripts.s)
 *     — K.O. général par poison sur la carte (field_poison.c → TryFieldPoisonWhiteOut).
 */
import { FlagGet, FlagSet } from './engine/script/script-vars';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { gPlayerParty, GetMonData, SetMonData } from './engine/battle/party-storage';
import {
  MON_DATA_SANITY_HAS_SPECIES, MON_DATA_SANITY_IS_EGG, MON_DATA_CHAMPION_RIBBON,
} from '../include/pokemon';
import { PARTY_SIZE } from '../include/constants/global';
import { GAME_STAT_FIRST_HOF_PLAY_TIME, GAME_STAT_RECEIVED_RIBBONS } from '../include/constants/game_stat';
import { NUM_CUTIES_RIBBONS } from '../include/constants/tv';
import { HealPlayerParty } from './script_pokemon_util';
import { GetRibbonCount } from './tv';
import { GetGameStat, SetGameStat, IncrementGameStat } from './field_player_avatar';
import { SetContinueGameWarpStatus } from './load_save';
import { SetContinueGameWarpToHealLocation, DoWhiteOut } from './overworld';
import { CB2_DoHallOfFameScreen, SetHasHallOfFameRecords, preloadHallOfFameAssets } from './hall_of_fame';
import { getRuntime, MALE } from '../harness/runtime/decomp-globals';

/** 1:1 EWRAM `gHasHallOfFameRecords` (credits.c:85) — RAPATRIÉ dans hall_of_fame.ts (lot L).
 *  Réexport-pont pour les lecteurs historiques : GameClear écrit via `SetHasHallOfFameRecords`. */
export { gHasHallOfFameRecords } from './hall_of_fame';

/** 1:1 décomp `int GameClear(void)` (post_battle_event_funcs.c:12-90). */
export function GameClear(): number {
  HealPlayerParty();

  if (FlagGet('FLAG_SYS_GAME_CLEAR')) {
    SetHasHallOfFameRecords(true);
  } else {
    SetHasHallOfFameRecords(false);
    FlagSet('FLAG_SYS_GAME_CLEAR');
  }

  if (GetGameStat(GAME_STAT_FIRST_HOF_PLAY_TIME) === 0) {
    SetGameStat(GAME_STAT_FIRST_HOF_PLAY_TIME,
      ((gSaveBlock2Ptr.playTimeHours ?? 0) << 16)
      | ((gSaveBlock2Ptr.playTimeMinutes ?? 0) << 8)
      | (gSaveBlock2Ptr.playTimeSeconds ?? 0));
  }

  SetContinueGameWarpStatus();

  if (gSaveBlock2Ptr.playerGender === MALE)
    SetContinueGameWarpToHealLocation('HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F');
  else
    SetContinueGameWarpToHealLocation('HEAL_LOCATION_LITTLEROOT_TOWN_MAYS_HOUSE_2F');

  let ribbonGet = false;
  const ribbonCounts: { partyIndex: number; count: number }[] = [];

  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i];
    ribbonCounts[i] = { partyIndex: i, count: 0 };
    if (mon
     && GetMonData(mon, MON_DATA_SANITY_HAS_SPECIES)
     && !GetMonData(mon, MON_DATA_SANITY_IS_EGG)
     && !GetMonData(mon, MON_DATA_CHAMPION_RIBBON)) {
      SetMonData(mon, MON_DATA_CHAMPION_RIBBON, 1);
      ribbonCounts[i].count = GetRibbonCount(mon);
      ribbonGet = true;
    }
  }

  if (ribbonGet) {
    IncrementGameStat(GAME_STAT_RECEIVED_RIBBONS);
    FlagSet('FLAG_SYS_RIBBON_GET');
    for (let i = 1; i < 6; i++) {
      if (ribbonCounts[i].count > ribbonCounts[0].count) {
        const prevBest = ribbonCounts[0];
        ribbonCounts[0] = ribbonCounts[i];
        ribbonCounts[i] = prevBest;
      }
    }
    if (ribbonCounts[0].count > NUM_CUTIES_RIBBONS) {
      // 1:1 décomp : TryPutSpotTheCutiesOnAir(&gPlayerParty[ribbonCounts[0].partyIndex],
      // MON_DATA_CHAMPION_RIBBON) — générateurs TV `TryPut*OnAir` non portés
      // (tv.c 5/207, CHEMIN P3.7) : divergence documentée, show TV non généré.
    }
  }

  // 1:1 décomp c:88 : SetMainCallback2(CB2_DoHallOfFameScreen). Le vrai écran HOF est asynchrone
  // côté assets (fetch PNG) → on lance le préchargement ICI (à GameClear), .catch hurlant, JAMAIS
  // dans le CB2 synchrone (piège FREEZE) ; le CB2 GATE jusqu'à ce que le préchargement soit réglé.
  preloadHallOfFameAssets().catch((e) => console.error('[post_battle_event_funcs] preloadHallOfFameAssets', e));
  getRuntime()?.SetMainCallback2(CB2_DoHallOfFameScreen);
  return 0;
}

/** 1:1 décomp `bool8 SetCB2WhiteOut(void)` (post_battle_event_funcs.c:92-96) :
 *  `SetMainCallback2(CB2_WhiteOut)`. ADAPTATION : CB2_WhiteOut (overworld.c:344)
 *  = 120 frames de fondu (déjà fait par le `fadescreen` d'EventScript_FieldWhiteOut)
 *  puis DoWhiteOut + reload map — notre port exécute DoWhiteOut directement ; le
 *  pending-warp respawn posé fait avancer le `waitstate` du script appelant. */
export function SetCB2WhiteOut(): boolean {
  DoWhiteOut();
  return false;
}
