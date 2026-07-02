/**
 * battle_records.ts — Port 1:1 STRICT (MIROIR partiel) de `src/battle_records.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_records.c`.
 *
 * Périmètre porté : le SEEDING new-game (`ClearPlayerLinkBattleRecords` +
 * `ClearLinkBattleRecord(s)`). L'écran Trainer Card / record link (Update*,
 * ShowLinkBattleRecords) = feature link, chantier ultérieur.
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { SetGameStat } from './field_player_avatar';
import {
  GAME_STAT_LINK_BATTLE_WINS, GAME_STAT_LINK_BATTLE_LOSSES, GAME_STAT_LINK_BATTLE_DRAWS,
} from '../include/constants/game_stat';
import type { LinkBattleRecord } from './engine/save/save-blocks';

// 1:1 décomp global.h:726.
const LINK_B_RECORDS_COUNT = 5;

/** 1:1 décomp `static void ClearLinkBattleRecord(struct LinkBattleRecord *record)`
 *  (battle_records.c:91-99). */
function ClearLinkBattleRecord(record: LinkBattleRecord): void {
  record.name = '';   // 1:1 :94 name[0] = EOS (CpuFill16 0 sur la struct entière)
  record.trainerId = 0;
  record.wins = 0;
  record.losses = 0;
  record.draws = 0;
}

/** 1:1 décomp `static void ClearLinkBattleRecords(struct LinkBattleRecord *records)`
 *  (battle_records.c:101-112). */
function ClearLinkBattleRecords(records: LinkBattleRecord[]): void {
  for (let i = 0; i < LINK_B_RECORDS_COUNT; i++) {
    ClearLinkBattleRecord(records[i]);
  }
  SetGameStat(GAME_STAT_LINK_BATTLE_WINS, 0);
  SetGameStat(GAME_STAT_LINK_BATTLE_LOSSES, 0);
  SetGameStat(GAME_STAT_LINK_BATTLE_DRAWS, 0);
}

/** 1:1 décomp `void ClearPlayerLinkBattleRecords(void)` (battle_records.c:223-226). */
export function ClearPlayerLinkBattleRecords(): void {
  ClearLinkBattleRecords(gSaveBlock1Ptr.linkBattleRecords.entries);
}
