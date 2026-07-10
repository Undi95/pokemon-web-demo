/**
 * battle/party-storage.ts — 1:1 décomp `gPlayerParty[]` / `gEnemyParty[]`
 * battle-side storage + GetMonData/SetMonData helpers.
 *
 * Sources de vérité (1:1) :
 *   - `D:/Projet 1/decomps/pokeemeraude/include/pokemon.h:196..232`
 *     (struct BoxPokemon + struct Pokemon)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/pokemon.h:6..97`
 *     (enum MON_DATA_*)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/pokemon.c:GetMonData/SetMonData`
 *
 * Architecture :
 *   - On stocke gPlayerParty[6] + gEnemyParty[6] comme structs *décodés*
 *     (= pas les BoxPokemon encrypted, on garde des champs plats accessibles
 *     direct).
 *   - GetMonData/SetMonData lisent/écrivent ces champs par tag MON_DATA_*.
 *   - Bridge `PokemonInstance` (runtime) → `Pokemon` (battle struct) au début
 *     de combat, et inverse à la fin pour persist HP/status/exp.
 */

import { GetPlayerNameString } from '../../../include/text';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save/save-block-state';
import { TOTAL_BOXES_COUNT, IN_BOX_COUNT } from '../save/save-blocks';
import type { PokemonStorage } from '../save/save-blocks';
import { VarGet, VarSet, FlagClear } from '../script/script-vars';
import { SetPCBoxToSendMon, GetPCBoxToSendMon } from '../../field_specials';
import { resolveDecompConstant, reverseDecompConstant } from '../../../harness/runtime/decomp-constants';
// getSpeciesInfo (id→info espèce) : lu par pokemonInstanceToPokemon / CopyMonToPC /
// les setters de types. resolveDecompConstant/reverseDecompConstant (l.32) = ponts string↔id.
import { getSpeciesInfo } from '../data/game-data';
// Résolution nom-de-move (leaf infra harness, zéro @pkmn/dex — lot 27). Re-export
// pour les call-sites existants (wire-bytecode-bridge, battle-devtools).
import { moveDexIdToEnum, resolveMoveDexId } from '../../../harness/runtime/move-name-resolve';
export { moveDexIdToEnum, resolveMoveDexId } from '../../../harness/runtime/move-name-resolve';
// AUDIT BUG FIX : import direct gBattleMons depuis state.ts (= même instance
// singleton que bytecode runtime). Avant : globalThis.__battleState lookup
// retournait une instance ESM différente → battle mons setup invisible aux
// opcodes. Static import = canonical instance.
import { gBattleMons as _gBattleMonsRuntime } from './state';

// ─── MON_DATA_* enum : consolidé vers son foyer-header 1:1 include/pokemon.ts ──
// (= include/pokemon.h). Import-back (party-storage en use plusieurs en INTERNE :
// pokemonInstanceToPokemon / CopyMonToPC / les setters de types) + RE-EXPORT pour
// les 39 fichiers qui les importent de party-storage (inchangés).
import {
  MON_DATA_PERSONALITY, MON_DATA_OT_ID, MON_DATA_NICKNAME, MON_DATA_LANGUAGE,
  MON_DATA_SANITY_IS_BAD_EGG, MON_DATA_SANITY_HAS_SPECIES, MON_DATA_SANITY_IS_EGG,
  MON_DATA_OT_NAME, MON_DATA_MARKINGS, MON_DATA_CHECKSUM, MON_DATA_ENCRYPT_SEPARATOR,
  MON_DATA_SPECIES, MON_DATA_HELD_ITEM, MON_DATA_MOVE1, MON_DATA_MOVE2, MON_DATA_MOVE3,
  MON_DATA_MOVE4, MON_DATA_PP1, MON_DATA_PP2, MON_DATA_PP3, MON_DATA_PP4,
  MON_DATA_PP_BONUSES, MON_DATA_COOL, MON_DATA_BEAUTY, MON_DATA_CUTE, MON_DATA_EXP,
  MON_DATA_HP_EV, MON_DATA_ATK_EV, MON_DATA_DEF_EV, MON_DATA_SPEED_EV, MON_DATA_SPATK_EV,
  MON_DATA_SPDEF_EV, MON_DATA_FRIENDSHIP, MON_DATA_SMART, MON_DATA_POKERUS,
  MON_DATA_MET_LOCATION, MON_DATA_MET_LEVEL, MON_DATA_MET_GAME, MON_DATA_POKEBALL,
  MON_DATA_HP_IV, MON_DATA_ATK_IV, MON_DATA_DEF_IV, MON_DATA_SPEED_IV, MON_DATA_SPATK_IV,
  MON_DATA_SPDEF_IV, MON_DATA_IS_EGG, MON_DATA_ABILITY_NUM, MON_DATA_TOUGH, MON_DATA_SHEEN,
  MON_DATA_OT_GENDER, MON_DATA_COOL_RIBBON, MON_DATA_BEAUTY_RIBBON, MON_DATA_CUTE_RIBBON,
  MON_DATA_SMART_RIBBON, MON_DATA_TOUGH_RIBBON, MON_DATA_STATUS, MON_DATA_LEVEL, MON_DATA_HP,
  MON_DATA_MAX_HP, MON_DATA_ATK, MON_DATA_DEF, MON_DATA_SPEED, MON_DATA_SPATK,
  MON_DATA_SPDEF, MON_DATA_MAIL, MON_DATA_SPECIES_OR_EGG, MON_DATA_IVS,
  MON_DATA_CHAMPION_RIBBON, MON_DATA_WINNING_RIBBON, MON_DATA_VICTORY_RIBBON,
  MON_DATA_ARTIST_RIBBON, MON_DATA_EFFORT_RIBBON, MON_DATA_MARINE_RIBBON,
  MON_DATA_LAND_RIBBON, MON_DATA_SKY_RIBBON, MON_DATA_COUNTRY_RIBBON,
  MON_DATA_NATIONAL_RIBBON, MON_DATA_EARTH_RIBBON, MON_DATA_WORLD_RIBBON,
  MON_DATA_UNUSED_RIBBONS, MON_DATA_MODERN_FATEFUL_ENCOUNTER, MON_DATA_KNOWN_MOVES,
  MON_DATA_RIBBON_COUNT, MON_DATA_RIBBONS, MON_DATA_ATK2, MON_DATA_DEF2, MON_DATA_SPEED2,
  MON_DATA_SPATK2, MON_DATA_SPDEF2,
} from '../../../include/pokemon';
export {
  MON_DATA_PERSONALITY, MON_DATA_OT_ID, MON_DATA_NICKNAME, MON_DATA_LANGUAGE,
  MON_DATA_SANITY_IS_BAD_EGG, MON_DATA_SANITY_HAS_SPECIES, MON_DATA_SANITY_IS_EGG,
  MON_DATA_OT_NAME, MON_DATA_MARKINGS, MON_DATA_CHECKSUM, MON_DATA_ENCRYPT_SEPARATOR,
  MON_DATA_SPECIES, MON_DATA_HELD_ITEM, MON_DATA_MOVE1, MON_DATA_MOVE2, MON_DATA_MOVE3,
  MON_DATA_MOVE4, MON_DATA_PP1, MON_DATA_PP2, MON_DATA_PP3, MON_DATA_PP4,
  MON_DATA_PP_BONUSES, MON_DATA_COOL, MON_DATA_BEAUTY, MON_DATA_CUTE, MON_DATA_EXP,
  MON_DATA_HP_EV, MON_DATA_ATK_EV, MON_DATA_DEF_EV, MON_DATA_SPEED_EV, MON_DATA_SPATK_EV,
  MON_DATA_SPDEF_EV, MON_DATA_FRIENDSHIP, MON_DATA_SMART, MON_DATA_POKERUS,
  MON_DATA_MET_LOCATION, MON_DATA_MET_LEVEL, MON_DATA_MET_GAME, MON_DATA_POKEBALL,
  MON_DATA_HP_IV, MON_DATA_ATK_IV, MON_DATA_DEF_IV, MON_DATA_SPEED_IV, MON_DATA_SPATK_IV,
  MON_DATA_SPDEF_IV, MON_DATA_IS_EGG, MON_DATA_ABILITY_NUM, MON_DATA_TOUGH, MON_DATA_SHEEN,
  MON_DATA_OT_GENDER, MON_DATA_COOL_RIBBON, MON_DATA_BEAUTY_RIBBON, MON_DATA_CUTE_RIBBON,
  MON_DATA_SMART_RIBBON, MON_DATA_TOUGH_RIBBON, MON_DATA_STATUS, MON_DATA_LEVEL, MON_DATA_HP,
  MON_DATA_MAX_HP, MON_DATA_ATK, MON_DATA_DEF, MON_DATA_SPEED, MON_DATA_SPATK,
  MON_DATA_SPDEF, MON_DATA_MAIL, MON_DATA_SPECIES_OR_EGG, MON_DATA_IVS,
  MON_DATA_CHAMPION_RIBBON, MON_DATA_WINNING_RIBBON, MON_DATA_VICTORY_RIBBON,
  MON_DATA_ARTIST_RIBBON, MON_DATA_EFFORT_RIBBON, MON_DATA_MARINE_RIBBON,
  MON_DATA_LAND_RIBBON, MON_DATA_SKY_RIBBON, MON_DATA_COUNTRY_RIBBON,
  MON_DATA_NATIONAL_RIBBON, MON_DATA_EARTH_RIBBON, MON_DATA_WORLD_RIBBON,
  MON_DATA_UNUSED_RIBBONS, MON_DATA_MODERN_FATEFUL_ENCOUNTER, MON_DATA_KNOWN_MOVES,
  MON_DATA_RIBBON_COUNT, MON_DATA_RIBBONS, MON_DATA_ATK2, MON_DATA_DEF2, MON_DATA_SPEED2,
  MON_DATA_SPATK2, MON_DATA_SPDEF2,
};

/** 1:1 décomp `PARTY_SIZE` (include/constants/global.h). */
export const PARTY_SIZE = 6;

// Cœur mon-data CONSOLIDÉ vers le foyer pokemon.c (src/pokemon.ts = où struct Pokemon /
// gPlayerParty / GetMonData sont définis dans la décomp). Import pour usage local + RE-EXPORT
// pour compat : les fichiers qui importent ces symboles depuis party-storage continuent SANS
// changement (struct/createEmptyPokemon/GetMonData/SetMonData/gPlayerParty/gEnemyParty).
import { createEmptyPokemon, GetMonData, SetMonData, gPlayerParty, gEnemyParty,
  GetMonAbility, GetAbilityBySpecies, CalculateMonStats, CreateMon, SetMonMoveSlot, MonRestorePP } from '../../pokemon';
import type { Pokemon } from '../../pokemon';
export { createEmptyPokemon, GetMonData, SetMonData, gPlayerParty, gEnemyParty,
  GetMonAbility, GetAbilityBySpecies, CalculateMonStats, MonRestorePP };
export type { Pokemon };

// MonKnowsMove / GiveMoveToMon : consolidés vers le foyer pokemon.c (src/pokemon.ts).
// Re-export pur (aucun user interne).
export { MonKnowsMove, GiveMoveToMon } from '../../pokemon';

// IsPokemonStorageFull / IsPlayerPartyAndPokemonStorageFull : foyer pokemon.c. Re-export pour
// les modules BATTLE (battle_main) qui les importent d'ICI (anti-cycle : pas d'edge foyer direct).
export { IsPokemonStorageFull, IsPlayerPartyAndPokemonStorageFull } from '../../pokemon';

// ─── Légalité d'apprentissage CT/CS (1:1 décomp pokemon.c) ──────────────────

// CanSpeciesLearnTMHM / CanMonLearnTMHM (= 1:1 décomp pokemon.c:6232-6258) : consolidés
// vers le foyer pokemon.c (src/pokemon.ts ; lisent sTMHMMoves/getTmhmLearnset/
// speciesNumberToEnum/GetMonData, tous déjà au foyer ou leaf). Re-export pour compat.
export { CanSpeciesLearnTMHM, CanMonLearnTMHM } from '../../pokemon';

// ─── CalculatePlayerPartyCount (= 1:1 décomp pokemon.c:7011) ─────────────

// CalculatePlayerPartyCount / GetMonsStateToDoubles / CalculateEnemyPartyCount :
// consolidés vers le foyer pokemon.c (src/pokemon.ts, = lisent gPlayerParty/gEnemyParty/GetMonData,
// tous au foyer désormais). Re-export pour compat (~12 importateurs inchangés).
export { CalculatePlayerPartyCount, GetMonsStateToDoubles, CalculateEnemyPartyCount } from '../../pokemon';

// GetBoxMonGender / GetMonGender : consolidés vers le foyer pokemon.c (src/pokemon.ts,
// à côté de GetGenderFromSpeciesAndPersonality). Réécrits 1:1 en numérique (sans le
// détour reverseDecompConstant). La sonde dev __GetMonGender suit l'impl dans pokemon.ts.

// ─── CheckPartyPokerus (= 1:1 décomp pokemon.c:6101-6127) ────────────────

// GetMonEVCount / CheckPartyPokerus / UpdatePartyPokerusTime : consolidés vers le foyer
// pokemon.c (src/pokemon.ts, = lisent GetMonData/gPlayerParty au foyer). Re-export pour compat.
export { GetMonEVCount, CheckPartyPokerus, UpdatePartyPokerusTime } from '../../pokemon';

// AdjustFriendship (+ table sFriendshipEventModifiers) : consolidé vers le foyer pokemon.c
// (src/pokemon.ts ; gMapHeader lu via globalThis là-bas → foyer sans import field/).
// Import-back (user interne l.~933) + re-export.
import { AdjustFriendship } from '../../pokemon';
export { AdjustFriendship };

// SetWildMonHeldItem (= 1:1 décomp pokemon.c) : consolidé vers le foyer pokemon.c
// (src/pokemon.ts ; lit gEnemyParty/gPlayerParty + gSpeciesInfo + GetMonAbility, déjà au
// foyer ; gBattleTypeFlags via globalThis = cycle-safe). Re-export PUR (sonde __SetWildMonHeldItem
// suit l'impl là-bas).
export { SetWildMonHeldItem } from '../../pokemon';

// MonGainEVs (= 1:1 décomp pokemon.c:5975-6052) : consolidé vers le foyer pokemon.c
// (src/pokemon.ts). Lit/écrit les champs EV du mon + getSpeciesInfo (déjà importé là-bas).
// Re-export PUR (fonction MORTE : aucun appelant — cf. JSDoc côté pokemon.ts).
export { MonGainEVs } from '../../pokemon';

// ─── CalculateMonStats (= 1:1 décomp pokemon.c:1932-2017) ─────────────────

// `gNatureStatTable` + `ModifyStatByNature` + `GetNatureFromPersonality` = consolidés
// sur le miroir `src/game/pokemon.ts` (source unique 1:1, cf. import en tête).

// GetNature / CalculateMonStats (+ helpers _getNatureFromPersonality / _modifyStatByNature) :
// consolidés vers le foyer pokemon.c (src/pokemon.ts) — les helpers inlinés là-bas
// (GetNatureFromPersonality + ModifyStatByNature, same-file). CalculateMonStats : import-back
// + re-export via le bloc d'import en tête (user interne l.~339).

// gPPUpGetMask / CalculatePPWithBonus / SetMonMoveSlot : consolidés vers le foyer pokemon.c
// (src/pokemon.ts, = lisent gBattleMoves/SetMonData). Re-export pur (aucun user interne).
export { gPPUpGetMask, CalculatePPWithBonus, SetMonMoveSlot } from '../../pokemon';
// API de création numérique (foyer pokemon.c) re-exportée pour compat : les callers battle
// (trainer-party…) l'importent d'ICI au lieu du foyer direct → pas de NOUVEL edge vers le
// foyer (party-storage l'importe déjà) → pas de réordonnancement d'init (cycle decomp-globals).
export { CreateMon, CreateBoxMon, GiveMonInitialMoveset, GiveBoxMonInitialMoveset } from '../../pokemon';

// ─── Party bridge (called at battle setup/end) ─────────────────────────────

/** Charge une party de TEST (devtools/harness) dans gPlayerParty (mons NUMÉRIQUES,
 *  = createTestMon/CreateMon). Slots vides reset via `createEmptyPokemon`. Appelé par
 *  `setupPartyForBattle` (combats de test). Le vrai chargement OW = `LoadPlayerParty`
 *  (load_save.ts), qui copie gPlayerParty direct (pas via cette fn). */
export function loadTestPlayerParty(player: Pokemon[]): void {
  // ⚠️ Snapshot AVANT le reset : `player` peut référencer gPlayerParty (combats
  // de test). Reset gPlayerParty PUIS le lire le viderait → party vide. On copie
  // donc d'abord (snapshot indépendant), ensuite on reset + ré-écrit.
  const n = Math.min(player.length, PARTY_SIZE);
  const snapshot: Pokemon[] = [];
  for (let i = 0; i < n; i++) {
    const c = createEmptyPokemon();
    Object.assign(c, player[i]);
    c.moves = [...player[i].moves];
    c.pp = [...player[i].pp];
    snapshot.push(c);
  }
  for (let i = 0; i < PARTY_SIZE; i++) Object.assign(gPlayerParty[i], createEmptyPokemon());
  for (let i = 0; i < n; i++) Object.assign(gPlayerParty[i], snapshot[i]);
}

/** Remplit gEnemyParty depuis des mons NUMÉRIQUES (= CreateMon : wild/trainer/scripted).
 *  Appelé au début de chaque combat. Les slots vides sont reset via `createEmptyPokemon`. */
export function setupEnemyPartyForBattle(enemy: Pokemon[]): void {
  for (let i = 0; i < PARTY_SIZE; i++) Object.assign(gEnemyParty[i], createEmptyPokemon());
  for (let i = 0; i < Math.min(enemy.length, PARTY_SIZE); i++) {
    Object.assign(gEnemyParty[i], enemy[i]);
  }
}

/** Setup gPlayerParty ET gEnemyParty. ⚠️ Migration Pokémon (étape 5) : depuis
 *  le pivot, `gPlayerParty` est la SOURCE de vérité (= la party joueur OW). Les
 *  combats RÉELS (wild/trainer) ne doivent donc PAS la remplacer — ils appellent
 *  `setupEnemyPartyForBattle` (ennemi seul) et lisent gPlayerParty direct. Cette
 *  fonction (qui REMPLACE gPlayerParty) reste pour les COMBATS DE TEST (devtools)
 *  qui veulent une party artificielle ; ⚠️ elle écrase la party joueur courante
 *  (à entourer d'un backup/restore côté appelant — cf. push/popTestPlayerParty). */
export function setupPartyForBattle(player: Pokemon[], enemy: Pokemon[]): void {
  backupOwPartyForTest();      // sauve la party OW (ce combat de TEST va écraser gPlayerParty)
  loadTestPlayerParty(player);
  setupEnemyPartyForBattle(enemy);
  RefreshPlayerPartyViews();   // block1.playerParty reflète la party de test (pas de vues fantômes)
}

// ─── Backup/restore party OW pour les COMBATS DE TEST (devtools) — échafaudage ──
// Depuis le pivot, gPlayerParty est la SOURCE (= party OW). `setupPartyForBattle`
// (test-only) la remplace par une party artificielle → écraserait la party OW.
// On sauvegarde la party OW au 1er setup et on la restaure au retour OW
// (FreeResetData_ReturnToOvOrDoEvolutions). Conditionnel : un combat RÉEL
// (setupEnemyPartyForBattle) ne backup PAS → restore = no-op (la party de combat
// EST la party OW, ses HP/XP post-combat persistent). 1:1 N/A (la décomp n'a pas
// de combat de test ; gPlayerParty y est l'unique party).
let sBackupOwParty: Pokemon[] | null = null;

export function backupOwPartyForTest(): void {
  if (sBackupOwParty) return;  // déjà sauvegardé (combat de test multi-setup)
  sBackupOwParty = gPlayerParty.map(m => {
    const c = createEmptyPokemon();
    Object.assign(c, m);
    c.moves = [...m.moves];
    c.pp = [...m.pp];
    return c;
  });
}

export function restoreOwPartyAfterTest(): void {
  if (!sBackupOwParty) return;
  for (let i = 0; i < PARTY_SIZE; i++) Object.assign(gPlayerParty[i], sBackupOwParty[i]);
  sBackupOwParty = null;
  RefreshPlayerPartyViews();
}

// ─── Factory NUMÉRIQUE de Pokémon de test (HARNESS/TEST — exempt 1:1) ────────
// Remplace feu `createPokemonInstance` (2e modèle string supprimé) : construit un
// `Pokemon` NUMÉRIQUE via le vrai `CreateMon` (foyer pokemon.c) + applique les
// overrides de test par SetMonData. Consommé par boot-mode (?debug) et les devtools
// combat (battle-devtools / battle-decomp-loop). PAS 1:1 — c'est de l'échafaudage de
// test ; le VRAI jeu crée ses mons via CreateMon direct (givemon/wild/trainer/starter).

/** Spread de stats (notation Smogon) acceptée par les overrides IV/EV de test. */
export interface TestStatSpread {
  hp: number; atk: number; def: number; spa: number; spd: number; spe: number;
}

/** Construit un Pokémon de test numérique. `opts.moves` = ids runtime ("pound") OU
 *  enums décomp ("MOVE_SURF"). `opts.heldItem` = id runtime ("miracleseed") OU enum.
 *  `opts.personality` impose le PID (sinon Random32). */
export function createTestMon(speciesEnum: string, level: number, opts?: {
  moves?: string[]; nickname?: string; ivs?: TestStatSpread; evs?: TestStatSpread;
  heldItem?: string; personality?: number;
}): Pokemon {
  const species = (resolveDecompConstant(speciesEnum) as number | undefined) ?? 0;
  const mon = createEmptyPokemon();
  const hasFixedPid = typeof opts?.personality === 'number';
  // CreateMon(mon, species, level, fixedIV=USE_RANDOM_IVS(32), hasFixedPersonality,
  // fixedPersonality, otIdType=OT_ID_PLAYER_ID(0), fixedOtId=0).
  CreateMon(mon, species, level, 32, hasFixedPid, hasFixedPid ? (opts!.personality! >>> 0) : 0, 0, 0);
  if (opts?.ivs) {
    SetMonData(mon, MON_DATA_HP_IV, opts.ivs.hp & 0x1F);
    SetMonData(mon, MON_DATA_ATK_IV, opts.ivs.atk & 0x1F);
    SetMonData(mon, MON_DATA_DEF_IV, opts.ivs.def & 0x1F);
    SetMonData(mon, MON_DATA_SPEED_IV, opts.ivs.spe & 0x1F);
    SetMonData(mon, MON_DATA_SPATK_IV, opts.ivs.spa & 0x1F);
    SetMonData(mon, MON_DATA_SPDEF_IV, opts.ivs.spd & 0x1F);
  }
  if (opts?.evs) {
    SetMonData(mon, MON_DATA_HP_EV, opts.evs.hp & 0xFF);
    SetMonData(mon, MON_DATA_ATK_EV, opts.evs.atk & 0xFF);
    SetMonData(mon, MON_DATA_DEF_EV, opts.evs.def & 0xFF);
    SetMonData(mon, MON_DATA_SPEED_EV, opts.evs.spe & 0xFF);
    SetMonData(mon, MON_DATA_SPATK_EV, opts.evs.spa & 0xFF);
    SetMonData(mon, MON_DATA_SPDEF_EV, opts.evs.spd & 0xFF);
  }
  if (opts?.moves) {
    // Moveset imposé : remplit slot par slot ; vide les slots non spécifiés (= moveset
    // EXACT, comme feu createPokemonInstance qui faisait moveIds.slice(0,4)).
    for (let i = 0; i < 4; i++) {
      const raw = opts.moves[i];
      if (raw === undefined) { SetMonMoveSlot(mon, 0, i); continue; }
      const enumKey = raw.startsWith('MOVE_') ? raw : moveDexIdToEnum(raw);
      const moveId = (resolveDecompConstant(enumKey) as number | undefined) ?? 0;
      SetMonMoveSlot(mon, moveId, i);
    }
  }
  if (opts?.heldItem) {
    const itemEnum = opts.heldItem.startsWith('ITEM_') ? opts.heldItem
      : 'ITEM_' + opts.heldItem.toUpperCase().replace(/-/g, '_');
    SetMonData(mon, MON_DATA_HELD_ITEM, (resolveDecompConstant(itemEnum) as number | undefined) ?? 0);
  }
  if (opts?.nickname) SetMonData(mon, MON_DATA_NICKNAME, opts.nickname);
  // IVs/EVs changés après CreateMon (qui a calculé avec des valeurs random) → recalc.
  if (opts?.ivs || opts?.evs) CalculateMonStats(mon);
  return mon;
}

// ─── Migration Pokémon (palier B) : gPlayerParty = SOURCE, block1.playerParty = vues ──

/** Reconstruit `gSaveBlock1Ptr.playerParty` = tableau COMPACT (slots PEUPLÉS seulement)
 *  de Pokemon NUMÉRIQUES — refs DIRECTES aux slots de `gPlayerParty` (la source de vérité).
 *  `.length` = compte de party. Appelé après chaque mutation STRUCTURELLE de gPlayerParty
 *  (GiveMonToPlayer, LoadPlayerParty).
 *  ⚙️ Ex-calque de vues PokemonInstance (Proxy makePokemonInstanceView) EFFONDRÉ (2026-07-02) :
 *  les lecteurs lisent du numérique via GetMonData / les champs plats (species/hp/status num). */
export function RefreshPlayerPartyViews(): void {
  const party: Pokemon[] = [];
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (gPlayerParty[i].species !== 0) party.push(gPlayerParty[i]);
  }
  gSaveBlock1Ptr.playerParty = party;
  gSaveBlock1Ptr.playerPartyCount = party.length;
}

/** 1:1 décomp `u8 MON_GIVEN_TO_PARTY/PC/CANT_GIVE` (include/pokemon.h). Co-localisés
 *  avec gPlayerParty + GetMonData/SetMonData (= fragment de pokemon.c côté stockage) ;
 *  `pokemon.ts` les re-exporte pour les call-sites OW existants. */
export const MON_GIVEN_TO_PARTY = 0;
export const MON_GIVEN_TO_PC = 1;
export const MON_CANT_GIVE = 2;

/** 1:1 décomp `u8 GiveMonToPlayer(struct Pokemon *mon)` (pokemon.c:4412) :
 *    SetMonData(mon, MON_DATA_OT_NAME, gSaveBlock2Ptr->playerName);
 *    SetMonData(mon, MON_DATA_OT_GENDER, &gSaveBlock2Ptr->playerGender);
 *    SetMonData(mon, MON_DATA_OT_ID, gSaveBlock2Ptr->playerTrainerId);
 *    for (i = 0; i < PARTY_SIZE; i++)
 *        if (GetMonData(&gPlayerParty[i], MON_DATA_SPECIES) == SPECIES_NONE) break;
 *    if (i >= PARTY_SIZE) return CopyMonToPC(mon);
 *    CopyMon(&gPlayerParty[i], mon, sizeof(*mon));
 *    gPlayerPartyCount = i + 1;
 *    return MON_GIVEN_TO_PARTY;
 *
 *  Prend un `struct Pokemon` natif (P4a-suite : produit par `CreateMon`, ou par le
 *  pont `pokemonInstanceToPokemon` aux call-sites legacy/DEBUG/voie-V). Écrit dans
 *  `gPlayerParty` (la SOURCE de vérité) + rafraîchit la façade de vues. */
export function GiveMonToPlayer(mon: Pokemon): number {
  // 1:1 décomp pokemon.c:4416-4418 : le mon donné/capturé prend l'OT du joueur
  // (= nom joueur tel quel, VIDE si pas de nom ; pas de fallback 'UNDI').
  SetMonData(mon, MON_DATA_OT_NAME, GetPlayerNameString());
  SetMonData(mon, MON_DATA_OT_GENDER, gSaveBlock2Ptr.playerGender ?? 0);
  SetMonData(mon, MON_DATA_OT_ID, (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0);
  // 1:1 décomp : premier slot SPECIES_NONE de gPlayerParty.
  let i = 0;
  for (; i < PARTY_SIZE; i++) if (gPlayerParty[i].species === 0 /* SPECIES_NONE */) break;
  if (i >= PARTY_SIZE) return CopyMonToPC(mon);
  Object.assign(gPlayerParty[i], mon);  // 1:1 CopyMon(&gPlayerParty[i], mon, sizeof(*mon))
  // 1:1 décomp : gPlayerPartyCount = i + 1 (notre décompte = playerPartyCount, posé
  // par RefreshPlayerPartyViews = views.length, == i+1 pour une party compacte).
  RefreshPlayerPartyViews();
  return MON_GIVEN_TO_PARTY;
}

/** 1:1 décomp `static u8 CopyMonToPC(struct Pokemon *mon)` (pokemon.c:4434-4465) :
 *  ```c
 *  SetPCBoxToSendMon(VarGet(VAR_PC_BOX_TO_SEND_MON));
 *  boxNo = StorageGetCurrentBox();
 *  do { for (boxPos…) if (boxes[boxNo][boxPos].species == NONE) {
 *      MonRestorePP(mon); CopyMon(checkingMon, &mon->box, …);
 *      gSpecialVar_MonBoxId/Pos = …;
 *      if (GetPCBoxToSendMon() != boxNo) FlagClear(FLAG_SHOWN_BOX_WAS_FULL_MESSAGE);
 *      VarSet(VAR_PC_BOX_TO_SEND_MON, boxNo); return MON_GIVEN_TO_PC; }
 *    boxNo = (boxNo+1) % TOTAL_BOXES_COUNT; } while (boxNo != StorageGetCurrentBox());
 *  return MON_CANT_GIVE;
 *  ```
 *  Range le mon dans le 1er slot PC libre (depuis la box courante, en bouclant).
 *  Dette R3 SOLDÉE : party pleine → mon au PC (au lieu d'être perdu). Adaptations
 *  modèle : box slot = PokemonInstance → conversion via pokemonToPokemonInstance ;
 *  storage via le hook `__getPokemonStorage` (cycle-safe : éviter d'importer save.ts
 *  lourd dans party-storage). MonRestorePP (PP au max) = 1:1 ✅. gSpecialVar_MonBoxId/Pos
 *  (numéro pour le message « envoyé à la Boîte X ») = refinement différé. */
export function CopyMonToPC(mon: Pokemon): number {
  const getStorage = (globalThis as { __getPokemonStorage?: () => PokemonStorage }).__getPokemonStorage;
  const storage = getStorage?.();
  if (!storage) {
    console.warn('[CopyMonToPC] storage PC pas prêt → CANT_GIVE');
    return MON_CANT_GIVE;
  }
  SetPCBoxToSendMon(VarGet('VAR_PC_BOX_TO_SEND_MON'));
  const startBox = storage.currentBox;  // 1:1 StorageGetCurrentBox()
  let boxNo = startBox;
  do {
    for (let boxPos = 0; boxPos < IN_BOX_COUNT; boxPos++) {
      const slot = storage.boxes[boxNo]?.[boxPos];
      if (!slot || !slot.species) {  // 1:1 : GetBoxMonData(SPECIES) == SPECIES_NONE (numérique)
        MonRestorePP(mon);  // 1:1 décomp : PP au max avant le rangement au PC
        // 1:1 CopyMon : copie INDÉPENDANTE du mon NUMÉRIQUE dans le slot de boîte (le slot
        // party va être réutilisé → on ne partage pas les arrays moves/pp).
        const boxed = createEmptyPokemon();
        Object.assign(boxed, mon);
        boxed.moves = [...mon.moves];
        boxed.pp = [...mon.pp];
        storage.boxes[boxNo][boxPos] = boxed;
        if (GetPCBoxToSendMon() !== boxNo) FlagClear('FLAG_SHOWN_BOX_WAS_FULL_MESSAGE');
        VarSet('VAR_PC_BOX_TO_SEND_MON', boxNo);
        return MON_GIVEN_TO_PC;
      }
    }
    boxNo = (boxNo + 1) % TOTAL_BOXES_COUNT;
  } while (boxNo !== startBox);
  return MON_CANT_GIVE;  // toutes les boîtes pleines
}

// IsOtherTrainer / IsTradedMon : consolidés vers le foyer pokemon.c (src/pokemon.ts,
// à côté de IsShinyOtIdPersonality). IsTradedMon lit mon.otName/otId en direct (modèle plat).
// La sonde dev __IsTradedMon suit l'impl dans pokemon.ts.

/** 1:1 décomp `SwitchPartyMon` (party_menu.c:3016-3030) côté STOCKAGE : swap le
 *  CONTENU des 2 slots `gPlayerParty` (la source) via un buffer temporaire. Les
 *  vues de la façade pointent vers les objets-slots → reflètent le swap
 *  automatiquement (aucun refresh nécessaire). */
export function SwitchPartyMonSlots(i: number, j: number): void {
  const tmp = createEmptyPokemon();
  Object.assign(tmp, gPlayerParty[i]);
  Object.assign(gPlayerParty[i], gPlayerParty[j]);
  Object.assign(gPlayerParty[j], tmp);
}

/** 1:1 décomp `OpponentHandleGetMonData` + `BattleIntroDrawTrainersOrMonsSprites`
 *  fields setup (battle_controller_opponent.c:543-616 + battle_main.c:2742-2790).
 *
 *  Fill un `gBattleMons[battlerId]` slot depuis un Pokemon party slot. C'est
 *  l'équivalent simplifié du REQUEST_ALL_BATTLE + post-process décomp :
 *    1. Copie tous les fields plats (species/hp/maxHP/stats/IVs/moves/pp/etc.)
 *    2. Set types[0]/types[1] depuis gSpeciesInfo (= battle_main.c:2766-2767)
 *    3. Set ability via GetAbilityBySpecies (= battle_main.c:2768)
 *    4. Reset statStages[i] = 6 (= base stage, battle_main.c:2771-2772)
 *    5. Reset status2 = 0 (= battle_main.c:2773)
 *
 *  Source `partySource = 'player' | 'enemy'` picks gPlayerParty vs gEnemyParty.
 *  Source `partyIdx` = index dans la party (= 0..5).
 *
 *  Note : ce helper est appelé au début de chaque combat ET à chaque switch-in.
 *  Pour les switch-in mid-battle, le décomp utilise des controllers async; on
 *  fait sync direct ici (= simplification 1:1 fonctionnel). */
export function fillBattleMonFromParty(
  battlerId: number,
  partySource: 'player' | 'enemy',
  partyIdx: number,
): void {
  // AUDIT BUG FIX : import direct depuis state.ts (= même instance que bytecode
  // runtime). Avant : lazy via globalThis.__battleState.gBattleMons écrivait
  // dans une instance ESM différente du runtime → battle mons setup invisible
  // aux opcodes. Maintenant : import statique = même instance singleton.
  const mons = _gBattleMonsRuntime;
  if (!mons) {
    console.warn('[party-storage] gBattleMons not exposed yet — call fillBattleMonFromParty after state.ts init');
    return;
  }
  if (battlerId < 0 || battlerId >= mons.length) return;

  const party = partySource === 'player' ? gPlayerParty : gEnemyParty;
  if (partyIdx < 0 || partyIdx >= party.length) return;
  const src = party[partyIdx];
  const dst = mons[battlerId];

  // 1:1 décomp REQUEST_ALL_BATTLE field copy.
  dst.species = src.species;
  dst.item = src.heldItem;
  for (let i = 0; i < 4; i++) {
    dst.moves[i] = src.moves[i];
    dst.pp[i] = src.pp[i];
  }
  dst.ppBonuses = src.ppBonuses;
  dst.friendship = src.friendship;
  dst.experience = src.experience;
  dst.hpIV = src.hpIV;
  dst.attackIV = src.attackIV;
  dst.defenseIV = src.defenseIV;
  dst.speedIV = src.speedIV;
  dst.spAttackIV = src.spAttackIV;
  dst.spDefenseIV = src.spDefenseIV;
  dst.personality = src.personality;
  dst.status1 = src.status;
  dst.level = src.level;
  dst.hp = src.hp;
  dst.maxHP = src.maxHP;
  dst.attack = src.attack;
  dst.defense = src.defense;
  dst.speed = src.speed;
  dst.spAttack = src.spAttack;
  dst.spDefense = src.spDefense;
  dst.isEgg = src.isEgg !== 0;
  dst.abilityNum = src.abilityNum;
  dst.otId = src.otId;
  dst.nickname = src.nickname;
  dst.otName = src.otName;

  // 1:1 décomp battle_main.c:2766-2773 post-DataTransfer processing.
  const speciesEnum = reverseDecompConstant(src.species, 'SPECIES_');
  if (speciesEnum) {
    const info = getSpeciesInfo(speciesEnum);
    if (info?.types) {
      const t1 = resolveDecompConstant(info.types[0] ?? '');
      const t2 = resolveDecompConstant(info.types[1] ?? info.types[0] ?? '');
      dst.type1 = typeof t1 === 'number' ? t1 : 0;
      dst.type2 = typeof t2 === 'number' ? t2 : 0;
    }
  }
  dst.ability = GetAbilityBySpecies(src.species, src.abilityNum);

  // Reset stat stages à 6 (neutre). 1:1 décomp NUM_BATTLE_STATS = 8 (HP, ATK, DEF,
  // SPEED, SPATK, SPDEF, ACC, EVASION) → 8 slots (STAT_EVASION=7 inclus, sinon NaN).
  for (let i = 0; i < dst.statStages.length; i++) {
    dst.statStages[i] = 6;
  }
  dst.status2 = 0;
}

/** Setup le combat depuis le party joueur + le mon adverse. Appelé une fois
 *  au début du combat. Fill gBattleMons[0] (player active) et gBattleMons[1]
 *  (enemy active). Set gBattleStruct.battlerPartyIndexes[0/1] = 0.
 *
 *  Pour wire bytecode, ce helper doit être appelé APRÈS setupPartyForBattle. */
export function fillActiveBattleMonsForBattleStart(): void {
  fillBattleMonFromParty(0, 'player', 0);
  fillBattleMonFromParty(1, 'enemy', 0);
}

interface BattleMonLike {
  species: number; item: number;
  moves: number[]; pp: number[];
  ppBonuses: number; friendship: number; experience: number;
  hpIV: number; attackIV: number; defenseIV: number;
  speedIV: number; spAttackIV: number; spDefenseIV: number;
  personality: number; status1: number; level: number;
  hp: number; maxHP: number;
  attack: number; defense: number; speed: number;
  spAttack: number; spDefense: number;
  isEgg: boolean; abilityNum: number; otId: number;
  nickname: string; otName: string;
  type1: number; type2: number;
  ability: number;
  statStages: number[];
  status2: number;
}

// ─── GetAbilityBySpecies (= 1:1 décomp pokemon.c) ─────────────────────────

// GetAbilityBySpecies / GetMonAbility : consolidés vers le foyer pokemon.c (src/pokemon.ts).
// Import-back (users internes l.~480/960) + re-export = via le bloc d'import en tête du fichier.

// ─── EmitSetMonData persistance bridge (Phase 1.4 wire) ────────────────────

import {
  gActiveBattler, gBattlerPartyIndexes,
} from './state';
import { GET_BATTLER_SIDE } from './constants';

// REQUEST_* constants (battle_controllers.h) — 1:1 décomp.
const REQUEST_HELDITEM_BATTLE_PSC   = 2;
const REQUEST_MOVES_PP_BATTLE_PSC   = 3;
const REQUEST_MOVE1_BATTLE_PSC      = 4;
// REQUEST_MOVE2..4 = 5..7
const REQUEST_PP_DATA_BATTLE_PSC    = 8;
const REQUEST_PPMOVE1_BATTLE_PSC    = 9;
// REQUEST_PPMOVE2..4 = 10..12
const REQUEST_OTID_BATTLE_PSC       = 17;
const REQUEST_EXP_BATTLE_PSC        = 18;
const REQUEST_HP_EV_BATTLE_PSC      = 19;
const REQUEST_ATK_EV_BATTLE_PSC     = 20;
const REQUEST_DEF_EV_BATTLE_PSC     = 21;
const REQUEST_SPEED_EV_BATTLE_PSC   = 22;
const REQUEST_SPATK_EV_BATTLE_PSC   = 23;
const REQUEST_SPDEF_EV_BATTLE_PSC   = 24;
const REQUEST_FRIENDSHIP_BATTLE_PSC = 25;
const REQUEST_POKERUS_BATTLE_PSC    = 26;
const REQUEST_STATUS_BATTLE_PSC     = 40;
const REQUEST_LEVEL_BATTLE_PSC      = 41;
const REQUEST_HP_BATTLE_PSC         = 42;
const REQUEST_MAX_HP_BATTLE_PSC     = 43;

/** Sync gActiveBattler's data au party-side Pokemon via SetMonData.
 *  1:1 décomp : le caller (= Cmd_*) a déjà write gBattleMons[gActiveBattler].X,
 *  cet emit persist au party-side pour le save block.
 *
 *  Cette fn est appelée par BtlController_EmitSetMonData via globalThis bridge
 *  (= éviter circular deps). */
// 1:1 décomp SetPlayerMonData (battle_controller_player.c:1949) : applique UNE requête
// SetMonData à UN mon donné. Extrait pour permettre l'itération multi-mon (Heal Bell).
function _applySetMonData(mon: Parameters<typeof SetMonData>[0], requestId: number, data: unknown, active: number): void {
  // Decode data : peut être un nombre direct, ou un Uint8Array/array.
  const value = typeof data === 'number' ? data : 0;

  switch (requestId) {
    // PP per move slot (PPMOVE1..4 = 9..12).
    case REQUEST_PPMOVE1_BATTLE_PSC:
      SetMonData(mon, MON_DATA_PP1, value); return;
    case REQUEST_PPMOVE1_BATTLE_PSC + 1:
      SetMonData(mon, MON_DATA_PP2, value); return;
    case REQUEST_PPMOVE1_BATTLE_PSC + 2:
      SetMonData(mon, MON_DATA_PP3, value); return;
    case REQUEST_PPMOVE1_BATTLE_PSC + 3:
      SetMonData(mon, MON_DATA_PP4, value); return;
    case REQUEST_HP_BATTLE_PSC:
      SetMonData(mon, MON_DATA_HP, value); return;
    case REQUEST_MAX_HP_BATTLE_PSC:
      SetMonData(mon, MON_DATA_MAX_HP, value); return;
    case REQUEST_STATUS_BATTLE_PSC:
      SetMonData(mon, MON_DATA_STATUS, value); return;
    case REQUEST_HELDITEM_BATTLE_PSC:
      SetMonData(mon, MON_DATA_HELD_ITEM, value); return;
    case REQUEST_LEVEL_BATTLE_PSC:
      SetMonData(mon, MON_DATA_LEVEL, value); return;
    case REQUEST_EXP_BATTLE_PSC:
      SetMonData(mon, MON_DATA_EXP, value); return;
    case REQUEST_HP_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_HP_EV, value); return;
    case REQUEST_ATK_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_ATK_EV, value); return;
    case REQUEST_DEF_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_DEF_EV, value); return;
    case REQUEST_SPEED_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_SPEED_EV, value); return;
    case REQUEST_SPATK_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_SPATK_EV, value); return;
    case REQUEST_SPDEF_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_SPDEF_EV, value); return;
    case REQUEST_FRIENDSHIP_BATTLE_PSC:
      SetMonData(mon, MON_DATA_FRIENDSHIP, value); return;
    case REQUEST_POKERUS_BATTLE_PSC:
      SetMonData(mon, MON_DATA_POKERUS, value); return;
    case REQUEST_OTID_BATTLE_PSC:
      SetMonData(mon, MON_DATA_OT_ID, value); return;
    case REQUEST_MOVE1_BATTLE_PSC:
      SetMonData(mon, MON_DATA_MOVE1, value); return;
    case REQUEST_MOVE1_BATTLE_PSC + 1:
      SetMonData(mon, MON_DATA_MOVE2, value); return;
    case REQUEST_MOVE1_BATTLE_PSC + 2:
      SetMonData(mon, MON_DATA_MOVE3, value); return;
    case REQUEST_MOVE1_BATTLE_PSC + 3:
      SetMonData(mon, MON_DATA_MOVE4, value); return;
    case REQUEST_MOVES_PP_BATTLE_PSC:
    case REQUEST_PP_DATA_BATTLE_PSC:
      // Sync all 4 moves+pp à partir des battle mons (déjà write).
      if (_gBattleMonsRuntime[active]) {
        const bm = _gBattleMonsRuntime[active];
        for (let i = 0; i < 4; i++) {
          SetMonData(mon, MON_DATA_MOVE1 + i, bm.moves[i]);
          SetMonData(mon, MON_DATA_PP1 + i, bm.pp[i]);
        }
        SetMonData(mon, MON_DATA_PP_BONUSES, bm.ppBonuses);
      }
      return;
    default:
      // Other requests (cool, charm, etc.) — deferred Phase 1.4+.
      return;
  }
}

/** 1:1 décomp `SetPlayerMonData(monId)` / `SetOpponentMonData(monId)`
 *  (battle_controller_player.c:116) : le handler désérialise `gBattleBufferA[active]` =
 *  `[SETMONDATA, requestId, monToCheck, bytes, ...dataLE]` puis `SetMonData(&party[monId],
 *  requestId, &bufferA[4])`. Ici : reconstruit l'entier LE depuis bufferA[4..4+bytes] et
 *  applique au mon `monId` de la party du côté du battler actif (via `_applySetMonData`).
 *  Remplace l'ancien side-channel `__batPSetMonByActive` : la donnée passe MAINTENANT par le
 *  round-trip bufferA comme la décomp (1:1), l'apply n'est plus court-circuité dans l'Emit.
 *  `bufferA` est PASSÉ en arg (= pas d'import de gBattleBufferA ici → pas de cycle). */
export function SetBattleMonDataFromBuffer(monId: number, bufferA: ArrayLike<number>, active: number): void {
  const requestId = bufferA[1];
  const bytes = bufferA[3];
  let value = 0;
  for (let i = 0; i < bytes; i++) value |= (bufferA[4 + i] & 0xFF) << (8 * i);
  value = value >>> 0;  // entier non-signé (status1 = 4 octets, bit de poids fort possible)
  const side = GET_BATTLER_SIDE(active);
  const party = side === 0 ? gPlayerParty : gEnemyParty;
  if (monId < 0 || monId >= 6) return;
  const mon = party[monId];
  if (mon) _applySetMonData(mon, requestId, value, active);
}

// (__gPlayerParty/__gEnemyParty exposés depuis le foyer pokemon.ts désormais — évite tout
//  accès top-level à gPlayerParty ici, donc zéro TDZ sur l'import depuis pokemon.ts.)
// Sonde déterministe : GiveMonToPlayer (party plein → CopyMonToPC). Sans effet jeu.
(globalThis as Record<string, unknown>).__GiveMonToPlayer = GiveMonToPlayer;
// Sonde déterministe : AdjustFriendship (gate LEAGUE_BATTLE). Sans effet jeu.
(globalThis as Record<string, unknown>).__AdjustFriendship = AdjustFriendship;

