/**
 * gym_leader_rematch.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/gym_leader_rematch.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/gym_leader_rematch.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { FLAG_SYS_GAME_CLEAR, FLAG_WATTSON_REMATCH_AVAILABLE } from '../include/constants/flags';
import { HasTrainerBeenFought, _rematchTable } from './battle_setup';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { FlagGet } from './event_data';
import { Random } from './random';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const REMATCH_ROXANNE = 65; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_BRAWLY = 66; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_WATTSON = 67; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_FLANNERY = 68; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_NORMAN = 69; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_WINONA = 70; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_TATE_AND_LIZA = 71; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const REMATCH_JUAN = 72; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)

/** 1:1 (gym_leader_rematch.c:10) */
const GymLeaderRematches_AfterNewMauville = Uint16Array.from([
  REMATCH_ROXANNE,
  REMATCH_BRAWLY,
  REMATCH_WATTSON,
  REMATCH_FLANNERY,
  REMATCH_NORMAN,
  REMATCH_WINONA,
  REMATCH_TATE_AND_LIZA,
  REMATCH_JUAN,
]);

/** 1:1 (gym_leader_rematch.c:21) */
const GymLeaderRematches_BeforeNewMauville = Uint16Array.from([
  REMATCH_ROXANNE,
  REMATCH_BRAWLY,
  // Wattson isn't available at this time
  REMATCH_FLANNERY,
  REMATCH_NORMAN,
  REMATCH_WINONA,
  REMATCH_TATE_AND_LIZA,
  REMATCH_JUAN,
]);

/** 1:1 `void UpdateGymLeaderRematch(void)` (gym_leader_rematch.c:32-41). */
export function UpdateGymLeaderRematch(): void {
  if (FlagGet(FLAG_SYS_GAME_CLEAR) && (Random() % 100) <= 30)
  {
    if (FlagGet(FLAG_WATTSON_REMATCH_AVAILABLE))
      UpdateGymLeaderRematchFromArray(GymLeaderRematches_AfterNewMauville, GymLeaderRematches_AfterNewMauville.length, 5);
    else
      UpdateGymLeaderRematchFromArray(GymLeaderRematches_BeforeNewMauville, GymLeaderRematches_BeforeNewMauville.length, 1);
  }
}

/** 1:1 `static void UpdateGymLeaderRematchFromArray(const u16 *data, size_t size, u32 maxRematch)` (gym_leader_rematch.c:43-92). */
function UpdateGymLeaderRematchFromArray(data: Uint16Array, size: number, maxRematch: number): void {
  let whichLeader = 0;
  let lowestRematchIndex = 5;
  let i = 0;
  let rematchIndex = 0;
  for (i = 0; i < size; i++)
  {
    if (!gSaveBlock1Ptr.trainerRematches[data[i]])
    {
      rematchIndex = GetRematchIndex(data[i]);
      if (lowestRematchIndex > rematchIndex)
        lowestRematchIndex = rematchIndex;
      whichLeader++;
    }
  }
  if (whichLeader != 0 && lowestRematchIndex <= maxRematch)
  {
    whichLeader = 0;
    for (i = 0; i < size; i++)
    {
      if (!gSaveBlock1Ptr.trainerRematches[data[i]])
      {
        rematchIndex = GetRematchIndex(data[i]);
        if (rematchIndex == lowestRematchIndex)
          whichLeader++;
      }
    }
    if (whichLeader != 0)
    {
      whichLeader = Random() % whichLeader;
      for (i = 0; i < size; i++)
      {
        if (!gSaveBlock1Ptr.trainerRematches[data[i]])
        {
          rematchIndex = GetRematchIndex(data[i]);
          if (rematchIndex == lowestRematchIndex)
          {
            if (whichLeader == 0)
            {
              gSaveBlock1Ptr.trainerRematches[data[i]] = lowestRematchIndex;
              break;
            }
            whichLeader--;
          }
        }
      }
    }
  }
}

/** 1:1 `static s32 GetRematchIndex(u32 trainerIdx)` (gym_leader_rematch.c:94-105).
 *  Revue transpiler : gRematchTable → table résolue numérique `_rematchTable()`
 *  (convention battle_setup.ts — trainerIds strings → ids via resolveTrainerNumId). */
function GetRematchIndex(trainerIdx: number): number {
  let i = 0;
  for (i = 0; i < 5; i++)
  {
    if (!HasTrainerBeenFought(_rematchTable()[trainerIdx].trainerIds[i]))
    {
      return i;
    }
  }
  return 5;
}
