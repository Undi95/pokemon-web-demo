/**
 * battle_tower.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/battle_tower.c`.
 *
 * Port PARTIEL. Portés à ce jour :
 *   - `GetCurrentBattleTowerWinStreak` (tiré par tv.c).
 *   - MULTI STEVEN (jalon combat multi, chemin critique) : `sStevenMons`,
 *     `FillPartnerParty` (branche TRAINER_STEVEN_PARTNER), `DoSpecialTrainerBattle`
 *     (case SPECIAL_BATTLE_STEVEN), + refs 1:1 `Task_StartBattleAfterTransition` /
 *     `HandleSpecialTrainerBattleEnd`.
 * Le reste de battle_tower.c (frontier : ~80 fns) = vague FRONTIER dédiée.
 */

import { MAX_STREAK, SPECIAL_BATTLE_STEVEN } from '../include/constants/battle_frontier';
import { TRAINER_STEVEN_PARTNER } from '../include/constants/trainers';
import { TRAINER_STEVEN, TRAINER_MAXIE_MOSSDEEP, TRAINER_TABITHA_MOSSDEEP } from '../include/constants/opponents';
import { MULTI_PARTY_SIZE, PARTY_SIZE, MAX_MON_MOVES, MALE } from '../include/constants/global';
import { NUM_STATS, MAX_PER_STAT_IVS, OT_ID_PRESET, NATURE_BRAVE, NATURE_IMPISH, NATURE_ADAMANT } from '../include/constants/pokemon';
import { SPECIES_METANG, SPECIES_SKARMORY, SPECIES_AGGRON } from '../include/constants/species';
import {
  MOVE_LIGHT_SCREEN, MOVE_PSYCHIC, MOVE_REFLECT, MOVE_METAL_CLAW,
  MOVE_TOXIC, MOVE_AERIAL_ACE, MOVE_PROTECT, MOVE_STEEL_WING,
  MOVE_THUNDER, MOVE_SOLAR_BEAM, MOVE_DRAGON_CLAW,
} from '../include/constants/moves';
import { LOCALID_NONE } from '../include/constants/event_objects';
import { MON_DATA_HP_EV, MON_DATA_OT_NAME, MON_DATA_OT_GENDER } from '../include/pokemon';
import { Random32 } from '../include/random';
import { CreateMon, SetMonMoveSlot, CalculateMonStats, IsShinyOtIdPersonality, GetNatureFromPersonality } from './pokemon';
import { gPlayerParty, SetMonData } from './engine/battle/party-storage';
import {
  configureTrainerBattleCore, TRAINER_BATTLE_SET_TRAINER_A, TRAINER_BATTLE_SET_TRAINER_B,
  type TrainerArgSource,
} from './battle_setup';
import { gBattleScripting, setBattleTypeFlags } from './engine/battle/state';
import { VarGet } from './event_data';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { getRuntime } from '../harness/runtime/decomp-globals';

// ─── BATTLE_TYPE_* (1:1 décomp include/constants/battle.h) ──────────────────
const BATTLE_TYPE_DOUBLE = 1 << 0;          // battle.h:59
const BATTLE_TYPE_TRAINER = 1 << 3;         // battle.h:62
const BATTLE_TYPE_MULTI = 1 << 6;           // battle.h:65
const BATTLE_TYPE_TWO_OPPONENTS = 1 << 15;  // battle.h:74
const BATTLE_TYPE_INGAME_PARTNER = 1 << 22; // battle.h:81

/** 1:1 décomp `VAR_0x8004` (special var — gSpecialVar_0x8004). */
const VAR_0x8004 = 0x8004;

/** 1:1 décomp `#define STEVEN_OTID 61226` (battle_tower.c:3006). */
const STEVEN_OTID = 61226;

/**
 * 1:1 décomp `sStevenMons[MULTI_PARTY_SIZE]` (battle_tower.c:765-799) : l'équipe
 * prêtée par Steven pour le combat multi de Mossdeep (Metang/Skarmory/Aggron).
 * Struct : { u16 species; u8 fixedIV; u8 level; u8 nature; u8 evs[NUM_STATS]; u16 moves[MAX_MON_MOVES]; }.
 */
interface StevenMon {
  species: number;
  fixedIV: number;
  level: number;
  nature: number;
  evs: number[];        // [NUM_STATS]
  moves: number[];      // [MAX_MON_MOVES]
}
const sStevenMons: StevenMon[] = [
  {
    species: SPECIES_METANG,
    fixedIV: MAX_PER_STAT_IVS,
    level: 42,
    nature: NATURE_BRAVE,
    evs: [0, 252, 252, 0, 6, 0],
    moves: [MOVE_LIGHT_SCREEN, MOVE_PSYCHIC, MOVE_REFLECT, MOVE_METAL_CLAW],
  },
  {
    species: SPECIES_SKARMORY,
    fixedIV: MAX_PER_STAT_IVS,
    level: 43,
    nature: NATURE_IMPISH,
    evs: [252, 0, 0, 0, 6, 252],
    moves: [MOVE_TOXIC, MOVE_AERIAL_ACE, MOVE_PROTECT, MOVE_STEEL_WING],
  },
  {
    species: SPECIES_AGGRON,
    fixedIV: MAX_PER_STAT_IVS,
    level: 44,
    nature: NATURE_ADAMANT,
    evs: [0, 252, 0, 0, 252, 6],
    moves: [MOVE_THUNDER, MOVE_PROTECT, MOVE_SOLAR_BEAM, MOVE_DRAGON_CLAW],
  },
];

/** 1:1 décomp `gTrainers[TRAINER_STEVEN].trainerName` (battle_tower.c:3041) — le nom OT
 *  posé sur les Pokémon prêtés par Steven. Foyer port : `gameDataTrainers` (mêmes données
 *  trainer que battle_message `_resolveTrainerNameFr`). Fallback = dérivé de la CLÉ
 *  ('TRAINER_STEVEN' → 'STEVEN'), jamais un littéral décomp codé en dur. */
function _stevenTrainerName(): string {
  const dt = (globalThis as { gameDataTrainers?: Record<string, { trainerName?: string; name?: string }> }).gameDataTrainers;
  const t = dt?.['TRAINER_STEVEN'];
  return t?.trainerName ?? t?.name ?? 'TRAINER_STEVEN'.replace(/^TRAINER_/, '');
}

/**
 * 1:1 décomp `static void FillPartnerParty(u16 trainerId)` (battle_tower.c:3008-3120).
 * Seule la branche `TRAINER_STEVEN_PARTNER` est portée (jalon multi Steven) : peuple
 * `gPlayerParty[MULTI_PARTY_SIZE + i]` (= slots 3..5) avec l'équipe `sStevenMons`.
 *
 * Les autres branches (TRAINER_EREADER / frontier `< FRONTIER_TRAINERS_COUNT` /
 * record-mixing / apprentice) = vague FRONTIER, non portées (FillPartnerParty n'est
 * appelé ici QUE pour Steven).
 *
 * ⚠️ 1:1 décomp (BUGFIX activé) : la personnalité tirée `j` (loop do/while jusqu'à une
 * personnalité NON-shiny de la bonne nature) est bien passée à CreateMon — la ROM
 * expédiée passait `i` par erreur (natures fausses). On suit la branche BUGFIX.
 */
function FillPartnerParty(trainerId: number): void {
  // 1:1 :3016 SetFacilityPtrsGetLevel() — frontier (setup pointeurs de facility) ; sans
  // objet pour la branche Steven (pas de facility). Omis (dette FRONTIER, hors Steven).
  if (trainerId === TRAINER_STEVEN_PARTNER) {
    for (let i = 0; i < MULTI_PARTY_SIZE; i++) {
      // 1:1 :3022-3025 : tire une personnalité non-shiny de la nature voulue.
      let j: number;
      do {
        j = Random32();
      } while (IsShinyOtIdPersonality(STEVEN_OTID, j) || sStevenMons[i].nature !== GetNatureFromPersonality(j));
      // 1:1 :3026-3036 CreateMon(&gPlayerParty[MULTI_PARTY_SIZE + i], species, level, fixedIV,
      //   hasFixedPersonality=TRUE, fixedPersonality=j, OT_ID_PRESET, STEVEN_OTID).
      CreateMon(
        gPlayerParty[MULTI_PARTY_SIZE + i],
        sStevenMons[i].species,
        sStevenMons[i].level,
        sStevenMons[i].fixedIV,
        true,
        j,
        OT_ID_PRESET,
        STEVEN_OTID,
      );
      // 1:1 :3037-3038 : pose les 6 EV (MON_DATA_HP_EV + j, j ∈ [0, PARTY_SIZE)).
      for (let k = 0; k < NUM_STATS; k++) {
        SetMonData(gPlayerParty[MULTI_PARTY_SIZE + i], MON_DATA_HP_EV + k, sStevenMons[i].evs[k]);
      }
      // 1:1 :3039-3040 : pose les 4 moves.
      for (let k = 0; k < MAX_MON_MOVES; k++) {
        SetMonMoveSlot(gPlayerParty[MULTI_PARTY_SIZE + i], sStevenMons[i].moves[k], k);
      }
      // 1:1 :3041 SetMonData(MON_DATA_OT_NAME, gTrainers[TRAINER_STEVEN].trainerName).
      SetMonData(gPlayerParty[MULTI_PARTY_SIZE + i], MON_DATA_OT_NAME, _stevenTrainerName());
      // 1:1 :3042-3043 j = MALE; SetMonData(MON_DATA_OT_GENDER, &j).
      SetMonData(gPlayerParty[MULTI_PARTY_SIZE + i], MON_DATA_OT_GENDER, MALE);
      // 1:1 :3044 CalculateMonStats.
      CalculateMonStats(gPlayerParty[MULTI_PARTY_SIZE + i]);
    }
  } else {
    // Branches EREADER / frontier / record-mixing / apprentice : vague FRONTIER (dette).
    console.warn('[battle_tower] FillPartnerParty : trainerId non-Steven non porté (frontier)', trainerId);
  }
}

/**
 * 1:1 décomp `static void HandleSpecialTrainerBattleEnd(void)` (battle_tower.c:2003-2042).
 * RÉFÉRENCE 1:1, INERTE dans le port : le retour-overworld post-combat est assuré par le
 * `savedCallback` posé par `bootDecompBattleLoop` (battle-decomp-loop.ts:635, = 1:1
 * `SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic)`). Pour STEVEN, aucun
 * des `case` (TOWER/DOME/…/SECRET_BASE/EREADER, tous frontier/record) ne matche
 * `specialTrainerBattleType = SPECIAL_BATTLE_STEVEN` → chemin `default` = simple retour field.
 * (RecordedBattle_SaveBattleOutcome : non porté, recorded battles hors périmètre solo.)
 */
function HandleSpecialTrainerBattleEnd(): void {
  // switch (gBattleScripting.specialTrainerBattleType) — les case frontier/secretbase/ereader
  // ne sont pas atteints pour STEVEN (dette vague FRONTIER). Chemin default → retour OW.
  const rt = getRuntime() as unknown as { SetMainCallback2?: (cb: unknown) => void } | null;
  const ret = (globalThis as { __overworldCB2?: { CB2_ReturnToFieldContinueScriptPlayMapMusic?: () => void } }).__overworldCB2?.CB2_ReturnToFieldContinueScriptPlayMapMusic;
  if (ret) rt?.SetMainCallback2?.(ret);
}

/**
 * 1:1 décomp `static void Task_StartBattleAfterTransition(u8 taskId)` (battle_tower.c:2044-2052).
 * RÉFÉRENCE 1:1, INERTE dans le port : le foyer transition→CB2_InitBattle est
 * `bootDecompBattleLoop` (battle-decomp-loop.ts) — MÊME substitution que
 * `BattleSetup_StartTrainerBattle` (battle_setup.ts:1351) qui remplace
 * `CreateBattleStartTask` + `Task_BattleStart` par ce boot. Le port n'a pas de
 * `IsBattleTransitionDone` standalone (la transition tourne en CB2, cf.
 * `_makeBattleStartTransitionCB2`), donc ce task n'est pas câblé.
 */
function Task_StartBattleAfterTransition(taskId: number): void {
  const rt = getRuntime() as unknown as {
    IsBattleTransitionDone?: () => boolean;
    SetMainCallback2?: (cb: unknown) => void;
    DestroyTask?: (id: number) => void;
    gMain?: { savedCallback?: unknown };
  } | null;
  if (rt?.IsBattleTransitionDone?.() === true) {
    if (rt.gMain) rt.gMain.savedCallback = HandleSpecialTrainerBattleEnd;
    const cb2 = (globalThis as { __battleInit?: { CB2_InitBattle?: () => void } }).__battleInit?.CB2_InitBattle;
    rt.SetMainCallback2?.(cb2);
    rt.DestroyTask?.(taskId);
  }
}

/** Source d'args trainerbattle inline (VOIE A) pour les deux configs Maxie/Tabitha du
 *  combat Steven — reproduit l'ordre de consommation de `sOrdinaryBattleParams` /
 *  `sTrainerBOrdinaryBattleParams` : u8(mode) → u16(opponent) → u16(localId) →
 *  ptr32(intro) → ptr32(defeat) → retAddr(null). */
function _stevenTrainerArgSource(mode: number, opponentId: number, introDefeatLabel: string): TrainerArgSource {
  const u16vals = [opponentId & 0xFFFF, LOCALID_NONE & 0xFFFF];
  const ptrs: (string | null)[] = [introDefeatLabel, introDefeatLabel];
  let ui = 0;
  let pi = 0;
  return {
    u8: () => mode & 0xFF,
    u16: () => u16vals[ui++] ?? 0,
    ptr32: () => ptrs[pi++] ?? null,
    retAddr: () => null,
  };
}

/**
 * 1:1 décomp `void DoSpecialTrainerBattle(void)` (battle_tower.c:2054-2182).
 * Seul le `case SPECIAL_BATTLE_STEVEN` (:2169-2180) est porté (jalon multi Steven).
 * Les autres types (tower/dome/palace/arena/factory/pike/pyramid/secretbase/ereader,
 * :2061-2167) = vague FRONTIER, non portés (ce special n'était câblé sur RIEN avant).
 */
export function DoSpecialTrainerBattle(): void {
  // 1:1 :2058 gBattleScripting.specialTrainerBattleType = gSpecialVar_0x8004.
  const special = VarGet(VAR_0x8004);
  gBattleScripting.specialTrainerBattleType = special;

  switch (special) {
    case SPECIAL_BATTLE_STEVEN: {
      // 1:1 :2170 gBattleTypeFlags = TRAINER | DOUBLE | TWO_OPPONENTS | MULTI | INGAME_PARTNER.
      setBattleTypeFlags(
        (BATTLE_TYPE_TRAINER | BATTLE_TYPE_DOUBLE | BATTLE_TYPE_TWO_OPPONENTS | BATTLE_TYPE_MULTI | BATTLE_TYPE_INGAME_PARTNER) >>> 0,
      );
      // 1:1 :2171 FillPartnerParty(TRAINER_STEVEN_PARTNER) → gPlayerParty[3..5] = Steven.
      FillPartnerParty(TRAINER_STEVEN_PARTNER);

      // 1:1 :2172-2175 : gApproachingTrainerId 0/1 + BattleSetup_ConfigureTrainerBattle
      //   (MaxieTrainer + 1 / TabithaTrainer + 1). Le port lit ces deux scripts inc :
      //     Maxie   = trainerbattle TRAINER_BATTLE_SET_TRAINER_A, TRAINER_MAXIE_MOSSDEEP, LOCALID_NONE, …
      //     Tabitha = trainerbattle TRAINER_BATTLE_SET_TRAINER_B, TRAINER_TABITHA_MOSSDEEP, LOCALID_NONE, …
      //   → pose gTrainerBattleOpponent_A = MAXIE, gTrainerBattleOpponent_B = TABITHA.
      // ⚠️ ADAPTATION : le port (trainer_see.ts) n'expose PAS de setter gApproachingTrainerId ;
      //   comme les modes SET_TRAINER_A/B sont EXPLICITES (pas dépendants de approachingId
      //   pour choisir A vs B) et que le special-battle boot NE joue PAS le speech field-intro
      //   (sTrainerA/BIntroSpeech), l'ordre A→B suffit (seul sTrainerAIntroSpeech, non utilisé
      //   ici, serait écrasé par InitTrainerBattleVariables du 2e appel). FILE-OPUS : setter
      //   gApproachingTrainerId 1:1.
      configureTrainerBattleCore(
        TRAINER_BATTLE_SET_TRAINER_A,
        _stevenTrainerArgSource(TRAINER_BATTLE_SET_TRAINER_A, TRAINER_MAXIE_MOSSDEEP, 'MossdeepCity_SpaceCenter_2F_Text_JustWantToExpandLand'),
      );
      configureTrainerBattleCore(
        TRAINER_BATTLE_SET_TRAINER_B,
        _stevenTrainerArgSource(TRAINER_BATTLE_SET_TRAINER_B, TRAINER_TABITHA_MOSSDEEP, 'MossdeepCity_SpaceCenter_Text_TabithaDefeat'),
      );

      // 1:1 :2176 gPartnerTrainerId = TRAINER_STEVEN_PARTNER.
      // ⚠️ ADAPTATION : gPartnerTrainerId n'a pas de foyer câblé unique dans le port
      //   (battle_setup.ts l'exporte en `let` sans setter). Les consommateurs lisent des
      //   bridges globalThis : battle_intro (globalThis.gPartnerTrainerId, HandleIntroSlide)
      //   et battle_main CB2_InitBattleInternal (__battleState.gPartnerTrainerId, choix du
      //   layout WIN0 Steven vs partenaire générique). On pose LES DEUX. FILE-OPUS : unifier.
      (globalThis as Record<string, unknown>).gPartnerTrainerId = TRAINER_STEVEN_PARTNER;
      const bstate = (globalThis as { __battleState?: Record<string, unknown> }).__battleState;
      if (bstate) bstate.gPartnerTrainerId = TRAINER_STEVEN_PARTNER;

      // 1:1 :2177-2179 : CreateTask(Task_StartBattleAfterTransition, 1) + PlayMapChosenOrBattleBGM(0)
      //   + BattleTransition_StartOnField(B_TRANSITION_MAGMA). Foyer port : bootDecompBattleLoop(true)
      //   = CreateBattleStartTask (transition d'entrée) + PlayBattleBGM + swap CB2_InitBattle +
      //   savedCallback retour OW (MÊME substitution que BattleSetup_StartTrainerBattle,
      //   battle_setup.ts:1330/1383). La transition MAGMA spécifique → fallback SLICE (dette
      //   visuelle A/B, comme toutes les transitions non-SLICE portées). Task_StartBattleAfterTransition
      //   / HandleSpecialTrainerBattleEnd ci-dessus = la référence 1:1 de ce boot.
      const boot = (globalThis as { __decompBattleLoop?: { bootDecompBattleLoop?: (r?: boolean) => void } })
        .__decompBattleLoop?.bootDecompBattleLoop;
      if (boot) {
        boot(true);
      } else {
        console.error('[battle_tower] DoSpecialTrainerBattle : bootDecompBattleLoop indisponible — combat Steven non booté');
      }
      break;
    }
    default:
      // SPECIAL_BATTLE_* frontier/secretbase/ereader (battle_tower.c:2061-2167) : vague FRONTIER,
      // non portés. DoSpecialTrainerBattle n'est câblé que pour STEVEN.
      console.warn('[battle_tower] DoSpecialTrainerBattle : type non porté (frontier)', special);
      break;
  }
}

/** 1:1 décomp `u16 GetCurrentBattleTowerWinStreak(u8 lvlMode, u8 battleMode)`
 *  (battle_tower.c:2791-2799). */
export function GetCurrentBattleTowerWinStreak(lvlMode: number, battleMode: number): number {
  const winStreak = gSaveBlock2Ptr.frontier.towerWinStreaks[battleMode][lvlMode];

  if (winStreak > MAX_STREAK)
    return MAX_STREAK;
  else
    return winStreak;
}
