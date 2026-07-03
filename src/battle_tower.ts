/**
 * battle_tower.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/battle_tower.c`.
 *
 * Port PARTIEL (au besoin) : `GetCurrentBattleTowerWinStreak` (tiré par tv.c
 * TryPutFrontierTVShowOnAir/bravoTrainerTower). Le reste de battle_tower.c
 * (83 fns) = vague FRONTIER dédiée.
 */

import { MAX_STREAK } from '../include/constants/battle_frontier';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';

/** 1:1 décomp `u16 GetCurrentBattleTowerWinStreak(u8 lvlMode, u8 battleMode)`
 *  (battle_tower.c:2791-2799). */
export function GetCurrentBattleTowerWinStreak(lvlMode: number, battleMode: number): number {
  const winStreak = gSaveBlock2Ptr.frontier.towerWinStreaks[battleMode][lvlMode];

  if (winStreak > MAX_STREAK)
    return MAX_STREAK;
  else
    return winStreak;
}
