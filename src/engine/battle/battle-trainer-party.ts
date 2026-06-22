/**
 * battle/battle-trainer-party.ts — Port 1:1 strict de CreateNPCTrainerParty
 * + helpers.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:1960-2076`
 *
 * Fonctions portées 1:1 :
 *   - CreateNPCTrainerParty (1960-2076) — load trainer party depuis gTrainers
 *     data table avec 4 variants struct (NoItemDefault/CustomMoves +
 *     ItemDefault/CustomMoves).
 *   - ZeroEnemyPartyMons (= helper reset gEnemyParty).
 *
 * Cascade dépendances :
 *   - gTrainers[] data (= trainers.h) — via decomp-data
 *   - gSpeciesNames[] — pour nameHash computation
 *   - gBattleMoves[] — pour PP setup
 *   - CreateMon (= pokemon.c full mon generator)
 *   - SetMonData (= mon field write)
 *
 * Mécanique :
 *   - personalityValue calculé depuis trainerName + speciesName hash
 *   - DoubleBattle → personality 0x80
 *   - F_TRAINER_FEMALE → personality 0x78 (skew female)
 *   - sinon → personality 0x88 (skew male)
 *   - fixedIV = partyData[i].iv * MAX_PER_STAT_IVS / 255
 *   - 4 variants partyFlags : default / custom moves / held item / both
 *
 * Note : c'est une fn statique côté décomp mais publique côté battle setup
 * trainer flow. Export pour wire dans battle-setup-trainer.ts ultérieur.
 */

import {
  gBattleTypeFlags, setBattleTypeFlags,
} from './state';
// Namespace ESM (remplace require('./state') CommonJS, dormant → throw en navigateur).
import * as _stateNs from './state';
import {
  BATTLE_TYPE_TRAINER, BATTLE_TYPE_FRONTIER, BATTLE_TYPE_EREADER_TRAINER,
  BATTLE_TYPE_TRAINER_HILL, BATTLE_TYPE_TWO_OPPONENTS,
} from './constants';
import { MAX_PER_STAT_IVS } from '../decomp-data/include/constants/pokemon-data';
import { TRAINER_SECRET_BASE } from '../decomp-data/include/constants/trainers-data';
// Voie L : mon dresseur BATTLE-READY (= CreateMon plein) ecrit dans gEnemyParty (party-storage,
// array LU par la voie L). Remplace le _CreateMon stub (sans stats, mauvais array). T2 du port trainer.
import { createPokemonInstance, type PokemonInstance, type StatSpread } from '../pokemon/pokemon';
import { setupEnemyPartyForBattle } from './party-storage';
import { reverseDecompConstant } from '../../../harness/runtime/decomp-constants';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `PARTY_SIZE` = 6. */
const PARTY_SIZE = 6;

/** 1:1 décomp `MAX_MON_MOVES` = 4. */
const MAX_MON_MOVES = 4;

/** 1:1 décomp `F_TRAINER_FEMALE` (= bit 7 du encounterMusic_gender). */
const F_TRAINER_FEMALE = 0x80;

/** 1:1 décomp `F_TRAINER_PARTY_CUSTOM_MOVESET` (= bit 0). */
const F_TRAINER_PARTY_CUSTOM_MOVESET = 1;

/** 1:1 décomp `F_TRAINER_PARTY_HELD_ITEM` (= bit 1). */
const F_TRAINER_PARTY_HELD_ITEM = 2;

/** 1:1 décomp `OT_ID_RANDOM_NO_SHINY` (pokemon.c). Magic flag pour CreateMon. */
const OT_ID_RANDOM_NO_SHINY = 2;

/** 1:1 décomp `EOS` = 0xFF (end of string sentinel). */
const EOS = 0xFF;

/** 1:1 décomp `MON_DATA_*` field IDs. */
const MON_DATA_MOVE1 = 13;
const MON_DATA_PP1 = 17;
const MON_DATA_HELD_ITEM = 22;

// ─── Trainer party member types 1:1 décomp ─────────────────────────────────

/** 1:1 décomp `struct TrainerMonNoItemDefaultMoves` (data/trainers.h). */
interface TrainerMonNoItemDefaultMoves {
  iv: number;
  lvl: number;
  species: number;
}

/** 1:1 décomp `struct TrainerMonNoItemCustomMoves`. */
interface TrainerMonNoItemCustomMoves extends TrainerMonNoItemDefaultMoves {
  moves: number[];  // [4]
}

/** 1:1 décomp `struct TrainerMonItemDefaultMoves`. */
interface TrainerMonItemDefaultMoves extends TrainerMonNoItemDefaultMoves {
  heldItem: number;
}

/** 1:1 décomp `struct TrainerMonItemCustomMoves`. */
interface TrainerMonItemCustomMoves extends TrainerMonItemDefaultMoves {
  moves: number[];
}

/** 1:1 décomp `union party_t` dans `struct Trainer`. */
type TrainerPartyData = {
  NoItemDefaultMoves?: TrainerMonNoItemDefaultMoves[];
  NoItemCustomMoves?: TrainerMonNoItemCustomMoves[];
  ItemDefaultMoves?: TrainerMonItemDefaultMoves[];
  ItemCustomMoves?: TrainerMonItemCustomMoves[];
};

/** 1:1 décomp `struct Trainer` (= entries dans gTrainers[]). */
interface TrainerData {
  partyFlags: number;
  trainerClass: number;
  encounterMusic_gender: number;
  trainerPic: number;
  trainerName: number[];
  items: number[];
  doubleBattle: boolean;
  aiFlags: number;
  partySize: number;
  party: TrainerPartyData;
}

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `gTrainers[trainerNum]` lookup. */
function _getTrainerData(trainerNum: number): TrainerData | null {
  // Cascade : auto-extracted trainer data depuis decomp-data/trainer-parties.json.
  // Pour now : lazy lookup via globalThis si disponible, sinon null.
  const trainers = (globalThis as { __gTrainers?: Record<number, TrainerData> }).__gTrainers;
  return trainers?.[trainerNum] ?? null;
}

/** 1:1 décomp `gSpeciesNames[species]` (data/text/species_names.h). */
function _getSpeciesName(species: number): number[] {
  // Dette R3 : full species names table. Pour now : empty array.
  void species;
  return [];
}

/** 1:1 décomp `gBattleMoves[moveId].pp` (data/battle_moves.h). */
function _getMovePp(moveId: number): number {
  // Lazy lookup via window data.
  const moves = (globalThis as { __battleMovesData?: Array<{ pp?: number }> }).__battleMovesData;
  return moves?.[moveId]?.pp ?? 0;
}

/** 1:1 décomp `CreateMon(party, species, level, iv, useRandomIvs, personality, otIdType, otIdNum)`
 *  (pokemon.c). Generator complet d'un mon (= stats, ability, moves auto). */
function _CreateMon(
  monSlot: { species: number; level: number; iv: number; personality: number; moves: number[]; pp: number[]; heldItem: number },
  species: number, level: number, fixedIV: number,
  _useRandomIvs: boolean, personality: number, _otIdType: number, _otIdNum: number,
): void {
  // Dette R3 : full CreateMon avec stats calc + ability + moveset auto.
  // Pour now : minimal field set.
  monSlot.species = species;
  monSlot.level = level;
  monSlot.iv = fixedIV;
  monSlot.personality = personality;
  // Cascade : SetBoxMonPokerusStatus, CalculateMonStats, ApplyEvolution items.
}

/** 1:1 décomp `SetMonData(mon, field, data)` (pokemon.c). */
function _SetMonData(
  monSlot: { moves: number[]; pp: number[]; heldItem?: number },
  field: number, value: number,
): void {
  if (field >= MON_DATA_MOVE1 && field < MON_DATA_MOVE1 + 4) {
    monSlot.moves[field - MON_DATA_MOVE1] = value;
  } else if (field >= MON_DATA_PP1 && field < MON_DATA_PP1 + 4) {
    monSlot.pp[field - MON_DATA_PP1] = value;
  } else if (field === MON_DATA_HELD_ITEM) {
    monSlot.heldItem = value;
  }
}

/** 1:1 décomp `ZeroEnemyPartyMons()`. Clear gEnemyParty[6] = 0. */
function _ZeroEnemyPartyMons(): void {
  const stateMod = _stateNs as unknown as { gEnemyParty?: unknown[] };
  if (stateMod.gEnemyParty) {
    for (let i = 0; i < PARTY_SIZE; i++) {
      stateMod.gEnemyParty[i] = {
        species: 0, level: 0, iv: 0, personality: 0,
        moves: [0, 0, 0, 0], pp: [0, 0, 0, 0],
        heldItem: 0,
      };
    }
  }
}

/** 1:1 décomp `CreateMon(&party[i], species, lvl, fixedIV, TRUE, personality, OT_ID_RANDOM_NO_SHINY, 0)`
 *  (battle_main.c:2014) via notre générateur BATTLE-READY. `personality` IMPOSÉ
 *  (pokemon.ts:412 ne consomme PAS le RNG pour le PID) → nature/ability-slot/gender/shiny
 *  dérivés du PID 1:1. `fixedIV` appliqué aux 6 IVs (= CreateMon `fixedIV`). Sans `moves`
 *  → pickLevelUpMoves = moveset de niveau natif (= CreateMon default-moves 1:1). */
function _makeTrainerMon(
  species: number, lvl: number, fixedIV: number, personality: number,
  moves?: number[], heldItem?: number,
): PokemonInstance {
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const iv: StatSpread = { hp: fixedIV, atk: fixedIV, def: fixedIV, spa: fixedIV, spd: fixedIV, spe: fixedIV };
  const opts: { personality: number; ivs: StatSpread; moves?: string[]; heldItem?: string } =
    { personality: personality >>> 0, ivs: iv };
  if (moves && moves.length) {
    // 1:1 ll.2028-2032 : moveset custom (MOVE_X). PP 1:1 via createPokemonInstance (gameDataGetMove().pp).
    const ms = moves.filter((m) => m !== 0).map((m) => reverseDecompConstant(m, 'MOVE_') ?? '').filter(Boolean);
    if (ms.length) opts.moves = ms;
  }
  if (heldItem) { const it = reverseDecompConstant(heldItem, 'ITEM_'); if (it) opts.heldItem = it; }
  return createPokemonInstance(speciesEnum, lvl, opts);
}

// ─── CreateNPCTrainerParty (battle_main.c:1960) — 1:1 strict ───────────────

/** 1:1 décomp `CreateNPCTrainerParty(party, trainerNum, firstTrainer)`
 *  (battle_main.c:1960-2076). Load la party d'un trainer depuis gTrainers[].
 *
 *  Returns gTrainers[trainerNum].partySize (= nombre de mons), 0 si
 *  TRAINER_SECRET_BASE (= geré ailleurs). */
export function CreateNPCTrainerParty(
  party: Array<{
    species: number; level: number; iv: number; personality: number;
    moves: number[]; pp: number[]; heldItem: number;
  }>,
  trainerNum: number, firstTrainer: boolean,
): number {
  let nameHash = 0;
  let personalityValue: number;
  let fixedIV: number;
  let i: number, j: number;
  let monsCount: number;

  // 1:1 décomp ll. 1968-1969 : TRAINER_SECRET_BASE = handled ailleurs.
  if (trainerNum === TRAINER_SECRET_BASE) return 0;

  const trainerData = _getTrainerData(trainerNum);
  if (!trainerData) {
    console.warn(`[battle-trainer-party] No trainer data for ID ${trainerNum} (dette R3)`);
    return 0;
  }

  // 1:1 décomp ll. 1971-1973 : skip si Frontier/Ereader/Trainer Hill.
  if ((gBattleTypeFlags & BATTLE_TYPE_TRAINER)
      && !(gBattleTypeFlags & (BATTLE_TYPE_FRONTIER
                               | BATTLE_TYPE_EREADER_TRAINER
                               | BATTLE_TYPE_TRAINER_HILL))) {
    // 1:1 décomp l. 1975-1976 : zero party au premier trainer.
    if (firstTrainer) {
      _ZeroEnemyPartyMons();
    }

    // 1:1 décomp ll. 1978-1988 : monsCount = trainerData.partySize, capped à
    // PARTY_SIZE/2 pour TWO_OPPONENTS.
    if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
      monsCount = trainerData.partySize > Math.floor(PARTY_SIZE / 2)
        ? Math.floor(PARTY_SIZE / 2)
        : trainerData.partySize;
    } else {
      monsCount = trainerData.partySize;
    }

    // Voie L : on ACCUMULE les mons BATTLE-READY puis UN seul setupEnemyPartyForBattle (qui zero les
    // 6 slots = ZeroEnemyPartyMons + remplit). Un appel par mon ecraserait les precedents.
    // DETTE (hors scope single) : multi-dresseur (TWO_OPPONENTS, firstTrainer=false) ecraserait la
    // party du 1er dresseur -> a gerer avec un accumulateur persistant quand le double sera porte.
    const acc: PokemonInstance[] = [];
    for (i = 0; i < monsCount; i++) {
      // 1:1 décomp ll. 1993-1998 : personality init selon gender flag.
      if (trainerData.doubleBattle) {
        personalityValue = 0x80;
      } else if (trainerData.encounterMusic_gender & F_TRAINER_FEMALE) {
        personalityValue = 0x78;  // skew female
      } else {
        personalityValue = 0x88;  // skew male
      }

      // 1:1 décomp ll. 2000-2001 : trainerName hash sum. ⚠️ nameHash N'EST PAS reset par mon
      // (scope FONCTION dans la décomp, accumulé à travers les mons).
      for (j = 0; trainerData.trainerName[j] !== EOS && j < trainerData.trainerName.length; j++) {
        nameHash += trainerData.trainerName[j];
      }

      // 1:1 décomp ll. 2003-2069 : switch sur partyFlags (4 variants). Mon battle-ready via _makeTrainerMon.
      switch (trainerData.partyFlags) {
        case 0: {
          const partyData = trainerData.party.NoItemDefaultMoves;
          if (!partyData || !partyData[i]) break;
          const speciesName = _getSpeciesName(partyData[i].species);
          for (j = 0; speciesName[j] !== EOS && j < speciesName.length; j++) nameHash += speciesName[j];
          personalityValue += nameHash << 8;
          fixedIV = Math.floor(partyData[i].iv * MAX_PER_STAT_IVS / 255);
          acc.push(_makeTrainerMon(partyData[i].species, partyData[i].lvl, fixedIV, personalityValue));
          break;
        }
        case F_TRAINER_PARTY_CUSTOM_MOVESET: {
          const partyData = trainerData.party.NoItemCustomMoves;
          if (!partyData || !partyData[i]) break;
          const speciesName = _getSpeciesName(partyData[i].species);
          for (j = 0; speciesName[j] !== EOS && j < speciesName.length; j++) nameHash += speciesName[j];
          personalityValue += nameHash << 8;
          fixedIV = Math.floor(partyData[i].iv * MAX_PER_STAT_IVS / 255);
          acc.push(_makeTrainerMon(partyData[i].species, partyData[i].lvl, fixedIV, personalityValue, partyData[i].moves));
          break;
        }
        case F_TRAINER_PARTY_HELD_ITEM: {
          const partyData = trainerData.party.ItemDefaultMoves;
          if (!partyData || !partyData[i]) break;
          const speciesName = _getSpeciesName(partyData[i].species);
          for (j = 0; speciesName[j] !== EOS && j < speciesName.length; j++) nameHash += speciesName[j];
          personalityValue += nameHash << 8;
          fixedIV = Math.floor(partyData[i].iv * MAX_PER_STAT_IVS / 255);
          acc.push(_makeTrainerMon(partyData[i].species, partyData[i].lvl, fixedIV, personalityValue, undefined, partyData[i].heldItem));
          break;
        }
        case F_TRAINER_PARTY_CUSTOM_MOVESET | F_TRAINER_PARTY_HELD_ITEM: {
          const partyData = trainerData.party.ItemCustomMoves;
          if (!partyData || !partyData[i]) break;
          const speciesName = _getSpeciesName(partyData[i].species);
          for (j = 0; speciesName[j] !== EOS && j < speciesName.length; j++) nameHash += speciesName[j];
          personalityValue += nameHash << 8;
          fixedIV = Math.floor(partyData[i].iv * MAX_PER_STAT_IVS / 255);
          acc.push(_makeTrainerMon(partyData[i].species, partyData[i].lvl, fixedIV, personalityValue, partyData[i].moves, partyData[i].heldItem));
          break;
        }
      }
    }

    // 1:1 : ecrit gEnemyParty (party-storage) = l array LU par la voie L. (= ZeroEnemyPartyMons + CreateMon×n)
    setupEnemyPartyForBattle(acc);

    // 1:1 décomp l. 2072 : OR le doubleBattle flag dans gBattleTypeFlags.
    if (trainerData.doubleBattle) {
      setBattleTypeFlags(gBattleTypeFlags | 1 /* BATTLE_TYPE_DOUBLE */);
    }
  }

  return trainerData.partySize;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleTrainerParty = {
  CreateNPCTrainerParty,
  TRAINER_SECRET_BASE,
  F_TRAINER_FEMALE, F_TRAINER_PARTY_CUSTOM_MOVESET, F_TRAINER_PARTY_HELD_ITEM,
};
