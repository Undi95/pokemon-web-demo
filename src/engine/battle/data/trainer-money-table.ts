/**
 * battle/data/trainer-money-table.ts — gTrainerMoneyTable 1:1 décomp.
 *
 * Source : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:474-532`.
 * Used by GetTrainerMoneyToGive(trainerId) for post-trainer-battle money.
 */

import {
  TRAINER_CLASS_TEAM_AQUA, TRAINER_CLASS_AQUA_ADMIN, TRAINER_CLASS_AQUA_LEADER,
  TRAINER_CLASS_AROMA_LADY, TRAINER_CLASS_RUIN_MANIAC, TRAINER_CLASS_INTERVIEWER,
  TRAINER_CLASS_TUBER_F, TRAINER_CLASS_TUBER_M, TRAINER_CLASS_SIS_AND_BRO,
  TRAINER_CLASS_COOLTRAINER, TRAINER_CLASS_HEX_MANIAC, TRAINER_CLASS_LADY,
  TRAINER_CLASS_BEAUTY, TRAINER_CLASS_RICH_BOY, TRAINER_CLASS_POKEMANIAC,
  TRAINER_CLASS_SWIMMER_M, TRAINER_CLASS_BLACK_BELT, TRAINER_CLASS_GUITARIST,
  TRAINER_CLASS_KINDLER, TRAINER_CLASS_CAMPER, TRAINER_CLASS_OLD_COUPLE,
  TRAINER_CLASS_BUG_MANIAC, TRAINER_CLASS_PSYCHIC, TRAINER_CLASS_GENTLEMAN,
  TRAINER_CLASS_ELITE_FOUR, TRAINER_CLASS_LEADER, TRAINER_CLASS_SCHOOL_KID,
  TRAINER_CLASS_SR_AND_JR, TRAINER_CLASS_POKEFAN, TRAINER_CLASS_EXPERT,
  TRAINER_CLASS_YOUNGSTER, TRAINER_CLASS_CHAMPION, TRAINER_CLASS_FISHERMAN,
  TRAINER_CLASS_TRIATHLETE, TRAINER_CLASS_DRAGON_TAMER, TRAINER_CLASS_BIRD_KEEPER,
  TRAINER_CLASS_NINJA_BOY, TRAINER_CLASS_BATTLE_GIRL, TRAINER_CLASS_PARASOL_LADY,
  TRAINER_CLASS_SWIMMER_F, TRAINER_CLASS_PICNICKER, TRAINER_CLASS_TWINS,
  TRAINER_CLASS_SAILOR, TRAINER_CLASS_COLLECTOR, TRAINER_CLASS_RIVAL,
  TRAINER_CLASS_PKMN_BREEDER, TRAINER_CLASS_PKMN_RANGER, TRAINER_CLASS_TEAM_MAGMA,
  TRAINER_CLASS_MAGMA_ADMIN, TRAINER_CLASS_MAGMA_LEADER, TRAINER_CLASS_LASS,
  TRAINER_CLASS_BUG_CATCHER, TRAINER_CLASS_HIKER, TRAINER_CLASS_YOUNG_COUPLE,
  TRAINER_CLASS_WINSTRATE,
} from '../../../../include/constants/trainers';

export interface TrainerMoney { classId: number; value: number; }

/** 1:1 décomp `gTrainerMoneyTable[]` (battle_main.c:474-532). 55 entries + sentinel. */
export const gTrainerMoneyTable: TrainerMoney[] = [
  { classId: TRAINER_CLASS_TEAM_AQUA, value: 5 },
  { classId: TRAINER_CLASS_AQUA_ADMIN, value: 10 },
  { classId: TRAINER_CLASS_AQUA_LEADER, value: 20 },
  { classId: TRAINER_CLASS_AROMA_LADY, value: 10 },
  { classId: TRAINER_CLASS_RUIN_MANIAC, value: 15 },
  { classId: TRAINER_CLASS_INTERVIEWER, value: 12 },
  { classId: TRAINER_CLASS_TUBER_F, value: 1 },
  { classId: TRAINER_CLASS_TUBER_M, value: 1 },
  { classId: TRAINER_CLASS_SIS_AND_BRO, value: 3 },
  { classId: TRAINER_CLASS_COOLTRAINER, value: 12 },
  { classId: TRAINER_CLASS_HEX_MANIAC, value: 6 },
  { classId: TRAINER_CLASS_LADY, value: 50 },
  { classId: TRAINER_CLASS_BEAUTY, value: 20 },
  { classId: TRAINER_CLASS_RICH_BOY, value: 50 },
  { classId: TRAINER_CLASS_POKEMANIAC, value: 15 },
  { classId: TRAINER_CLASS_SWIMMER_M, value: 2 },
  { classId: TRAINER_CLASS_BLACK_BELT, value: 8 },
  { classId: TRAINER_CLASS_GUITARIST, value: 8 },
  { classId: TRAINER_CLASS_KINDLER, value: 8 },
  { classId: TRAINER_CLASS_CAMPER, value: 4 },
  { classId: TRAINER_CLASS_OLD_COUPLE, value: 10 },
  { classId: TRAINER_CLASS_BUG_MANIAC, value: 15 },
  { classId: TRAINER_CLASS_PSYCHIC, value: 6 },
  { classId: TRAINER_CLASS_GENTLEMAN, value: 20 },
  { classId: TRAINER_CLASS_ELITE_FOUR, value: 25 },
  { classId: TRAINER_CLASS_LEADER, value: 25 },
  { classId: TRAINER_CLASS_SCHOOL_KID, value: 5 },
  { classId: TRAINER_CLASS_SR_AND_JR, value: 4 },
  { classId: TRAINER_CLASS_POKEFAN, value: 20 },
  { classId: TRAINER_CLASS_EXPERT, value: 10 },
  { classId: TRAINER_CLASS_YOUNGSTER, value: 4 },
  { classId: TRAINER_CLASS_CHAMPION, value: 50 },
  { classId: TRAINER_CLASS_FISHERMAN, value: 10 },
  { classId: TRAINER_CLASS_TRIATHLETE, value: 10 },
  { classId: TRAINER_CLASS_DRAGON_TAMER, value: 12 },
  { classId: TRAINER_CLASS_BIRD_KEEPER, value: 8 },
  { classId: TRAINER_CLASS_NINJA_BOY, value: 3 },
  { classId: TRAINER_CLASS_BATTLE_GIRL, value: 6 },
  { classId: TRAINER_CLASS_PARASOL_LADY, value: 10 },
  { classId: TRAINER_CLASS_SWIMMER_F, value: 2 },
  { classId: TRAINER_CLASS_PICNICKER, value: 4 },
  { classId: TRAINER_CLASS_TWINS, value: 3 },
  { classId: TRAINER_CLASS_SAILOR, value: 8 },
  { classId: TRAINER_CLASS_COLLECTOR, value: 15 },
  { classId: TRAINER_CLASS_RIVAL, value: 15 },
  { classId: TRAINER_CLASS_PKMN_BREEDER, value: 10 },
  { classId: TRAINER_CLASS_PKMN_RANGER, value: 12 },
  { classId: TRAINER_CLASS_TEAM_MAGMA, value: 5 },
  { classId: TRAINER_CLASS_MAGMA_ADMIN, value: 10 },
  { classId: TRAINER_CLASS_MAGMA_LEADER, value: 20 },
  { classId: TRAINER_CLASS_LASS, value: 4 },
  { classId: TRAINER_CLASS_BUG_CATCHER, value: 4 },
  { classId: TRAINER_CLASS_HIKER, value: 10 },
  { classId: TRAINER_CLASS_YOUNG_COUPLE, value: 8 },
  { classId: TRAINER_CLASS_WINSTRATE, value: 10 },
  { classId: 0xFF, value: 5 },  // 1:1 sentinel — default pour classes non listées.
];

/** 1:1 décomp lookup logic battle_script_commands.c:5621-5625. */
export function getTrainerMoneyValue(trainerClass: number): number {
  let i = 0;
  while (gTrainerMoneyTable[i].classId !== 0xFF) {
    if (gTrainerMoneyTable[i].classId === trainerClass) {
      return gTrainerMoneyTable[i].value;
    }
    i++;
  }
  return gTrainerMoneyTable[i].value;  // sentinel default = 5.
}
