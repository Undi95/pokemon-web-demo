/**
 * field_specials.ts — miroir 1:1 de `src/field_specials.c` (4280 l, ~191 fns).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/field_specials.c`.
 *
 * field_specials.c = le « grab-bag » des fonctions script-callables de l'overworld
 * (specials). Historiquement, ces fns vivaient INLINÉES dans specials-registry.ts
 * (= la table gSpecials). Ce fichier est leur FOYER miroir 1:1 ; specials-registry
 * importe ces fns + les enregistre (consolidation MIRROR, par lots vérifiés).
 *
 * ⚠️ Migration INCRÉMENTALE : les fns sont rapatriées par lots thématiques, chacun
 * vérifié (tsc + in-game) + commité. Le reste continue de vivre dans specials-registry
 * jusqu'à son lot. Voir [[overworld-field-mirror-consolidation-state]].
 *
 * ⚠️ ANTI-CYCLE : `gBikeCycling` (EWRAM partagé bike.ts + specials-registry) reste défini
 * EN TÊTE. L'ancien cycle TDZ (DIR_SOUTH) venait d'importer specials-registry DEPUIS ce
 * fichier — on ne l'importe TOUJOURS PAS. Les imports ci-dessous (party-storage/game-data/
 * text/script-vars) sont des modules data/leaf qui ne ré-importent pas field_specials/bike.
 *
 * Adaptations vs décomp (assumées, préservées telles quelles depuis specials-registry) :
 *  - Modèle Pokémon = PokemonInstance (gPlayerParty) lu via GetMonData ; conditions
 *    concours (Cool/Beauty/…) restent à 0 tant qu'aucun Pokébloc (non porté) → 1:1
 *    correct (dépendance d'étape). Ribbons (effortRibbon) partiels. FR-only (langue).
 */

import {
  gPlayerParty, GetMonData, CalculatePlayerPartyCount, GetMonEVCount,
  MON_DATA_SPECIES, MON_DATA_IS_EGG, MON_DATA_SANITY_IS_BAD_EGG,
  MON_DATA_COOL, MON_DATA_BEAUTY, MON_DATA_CUTE, MON_DATA_SMART, MON_DATA_TOUGH,
  MON_DATA_FRIENDSHIP, MON_DATA_OT_NAME,
} from './engine/battle/party-storage';
import { PARTY_SIZE } from '../include/constants/global';
import { gSpeciesInfo } from './engine/data/game-data';
import { GetPlayerNameString } from '../include/text';
import { VarGet, VarSet } from './engine/script/script-vars';

// 1:1 décomp EWRAM_DATA (field_specials.c:78-80) : gBikeCyclingChallenge (bool8),
// gBikeCollisions (u8), sBikeCyclingTimer (u32). Défini EN TÊTE (leaf anti-cycle :
// bike.ts l'importe au boot). NE PAS déplacer sous le code.
export const gBikeCycling = { challenge: 0, collisions: 0, timer: 0 };

// ─── Lot 1 — lead-mon / party query (field_specials.c §949, 1190-1396, 1230, 1372, 1572) ──

/** 1:1 décomp `GetLeadMonIndex` (pokemon.c) : 1er slot non-egg non-vide, sinon 0.
 *  (Foyer 1:1 réel = pokemon.c ; placé ici car consommé surtout par field_specials —
 *  consolidation pokemon différée. Remplace l'ancien `_GetLeadMonIndex` de specials-registry.) */
export function GetLeadMonIndex(): number {
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i];
    if ((GetMonData(mon, MON_DATA_SPECIES) as number) !== 0 && !(GetMonData(mon, MON_DATA_IS_EGG) as number)) {
      return i;
    }
  }
  return 0;
}

/** 1:1 décomp `IsBadEggInParty` (field_specials.c) :
 *    for (i = 0; i < CalculatePlayerPartyCount(); i++)
 *      if (GetMonData(&gPlayerParty[i], MON_DATA_SANITY_IS_BAD_EGG) == TRUE) return TRUE;
 *    return FALSE;
 *  Appelé en `specialvar VAR_RESULT` (cable_club.inc = garde anti-save-corrompue au link). */
export function IsBadEggInParty(): number {
  const partyCount = CalculatePlayerPartyCount();
  for (let i = 0; i < partyCount; i++) {
    if ((GetMonData(gPlayerParty[i], MON_DATA_SANITY_IS_BAD_EGG) as number) === 1 /* TRUE */) return 1;
  }
  return 0;
}

/** 1:1 décomp `CheckLeadMon{Cool,Beauty,Cute,Smart,Tough}` (field_specials.c:1190-1228) :
 *    if (GetMonData(&gPlayerParty[GetLeadMonIndex()], MON_DATA_X) < 200) return FALSE; return TRUE;
 *  PNJ « montre-moi un POKéMON <stat> ». Conditions montent via Pokéblocs (non portés)
 *  → FALSE tant qu'aucun mon n'est nourri (1:1 correct, dépendance d'étape). */
function _checkLeadMonCondition(field: number): number {
  return (GetMonData(gPlayerParty[GetLeadMonIndex()], field) as number) < 200 ? 0 : 1;
}
export function CheckLeadMonCool(): number { return _checkLeadMonCondition(MON_DATA_COOL); }
export function CheckLeadMonBeauty(): number { return _checkLeadMonCondition(MON_DATA_BEAUTY); }
export function CheckLeadMonCute(): number { return _checkLeadMonCondition(MON_DATA_CUTE); }
export function CheckLeadMonSmart(): number { return _checkLeadMonCondition(MON_DATA_SMART); }
export function CheckLeadMonTough(): number { return _checkLeadMonCondition(MON_DATA_TOUGH); }

/** 1:1 décomp `GetLeadMonFriendshipScore` (field_specials.c:949) : bucket de friendship
 *  du lead mon (7 valeurs 0..6). MAX_FRIENDSHIP=255 → FRIENDSHIP_MAX=6, etc. */
export function GetLeadMonFriendshipScore(): number {
  const mon = gPlayerParty[GetLeadMonIndex()];
  const friendship = GetMonData(mon, MON_DATA_FRIENDSHIP) as number;
  if (friendship === 255) return 6;        // FRIENDSHIP_MAX
  if (friendship >= 200) return 5;         // FRIENDSHIP_200_TO_254
  if (friendship >= 150) return 4;         // FRIENDSHIP_150_TO_199
  if (friendship >= 100) return 3;         // FRIENDSHIP_100_TO_149
  if (friendship >= 50) return 2;          // FRIENDSHIP_50_TO_99
  if (friendship >= 1) return 1;           // FRIENDSHIP_1_TO_49
  return 0;                                 // FRIENDSHIP_NONE
}

/** 1:1 décomp `Special_AreLeadMonEVsMaxedOut` (field_specials.c:1390-1396) :
 *    return GetMonEVCount(&gPlayerParty[GetLeadMonIndex()]) >= MAX_TOTAL_EVS (510);
 *  Appelé via `specialvar VAR_RESULT` (Slateport). */
export function Special_AreLeadMonEVsMaxedOut(): number {
  const mon = gPlayerParty[GetLeadMonIndex()];
  if ((GetMonData(mon, MON_DATA_SPECIES) as number) === 0 || (GetMonData(mon, MON_DATA_IS_EGG) as number)) return 0;
  return GetMonEVCount(mon) >= 510 ? 1 : 0;  // MAX_TOTAL_EVS = 510
}

/** 1:1 décomp `LeadMonHasEffortRibbon` (field_specials.c:1372-1375) :
 *    return GetMonData(&gPlayerParty[GetLeadMonIndex()], MON_DATA_EFFORT_RIBBON);
 *  Dette R3 : subsystem rubans partiel → effortRibbon (0 si absent). */
export function LeadMonHasEffortRibbon(): number {
  const mon = gPlayerParty[GetLeadMonIndex()];
  if ((GetMonData(mon, MON_DATA_SPECIES) as number) === 0 || (GetMonData(mon, MON_DATA_IS_EGG) as number)) return 0;
  return (mon as unknown as { effortRibbon?: number }).effortRibbon ?? 0;
}

/** 1:1 décomp `MonOTNameNotPlayer` (field_specials.c:1572-1583) : TRUE si l'OT name du
 *  mon (slot VAR_0x8004) != nom joueur OU langue != GAME_LANGUAGE. Used par NameRater
 *  pour bloquer le rename de mons étrangers. FR-only → check OT name seulement. */
export function MonOTNameNotPlayer(): number {
  const slot = VarGet('VAR_0x8004');
  const mon = gPlayerParty[slot];
  if (!mon || (GetMonData(mon, MON_DATA_SPECIES) as number) === 0) return 1;
  const otName = (GetMonData(mon, MON_DATA_OT_NAME) as string) ?? '';
  const playerName = GetPlayerNameString();
  if (!otName) return 1;  // pas d'OT → considère étranger
  return otName === playerName ? 0 : 1;
}

/** 1:1 décomp `IsGrassTypeInParty` (field_specials.c:1230-1249) : TRUE si au moins un mon
 *  non-egg de la party a TYPE_GRASS (type1 ou type2). Pose gSpecialVar_Result (appelé via
 *  `special`, Route123). [[gotcha-special-vs-specialvar-varresult]] */
export function IsGrassTypeInParty(): number {
  let result = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i];
    const species = GetMonData(mon, MON_DATA_SPECIES) as number;
    if (species === 0 || (GetMonData(mon, MON_DATA_IS_EGG) as number)) continue;
    // Notre `gSpeciesInfo[].types` = enum-strings ('TYPE_GRASS'…) ≠ ids num décomp.
    const types = gSpeciesInfo[species]?.types ?? [];
    if (types[0] === 'TYPE_GRASS' || types[1] === 'TYPE_GRASS') { result = 1; break; }
  }
  VarSet('VAR_RESULT', result);
  return result;
}
