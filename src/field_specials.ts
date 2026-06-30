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
  gPlayerParty, GetMonData, CalculatePlayerPartyCount, GetMonEVCount, CheckPartyPokerus,
  MON_DATA_SPECIES, MON_DATA_IS_EGG, MON_DATA_SANITY_IS_BAD_EGG,
  MON_DATA_COOL, MON_DATA_BEAUTY, MON_DATA_CUTE, MON_DATA_SMART, MON_DATA_TOUGH,
  MON_DATA_FRIENDSHIP, MON_DATA_OT_NAME,
} from './engine/battle/party-storage';
import { PARTY_SIZE } from '../include/constants/global';
import { gSpeciesInfo } from './engine/data/game-data';
import { GetPlayerNameString, setStringVar } from '../include/text';
import { VarGet, VarSet, FlagSet, FlagGet, FlagClear } from './engine/script/script-vars';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { gLocalTime } from './rtc';

// 1:1 décomp include/constants/global.h:113-114 (évite le fourre-tout decomp-globals).
const MALE = 0;
const FEMALE = 1;

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

// ─── Lot 2 — party query (suite) + player-info strings + flags simples ──────────────

/** 1:1 décomp `IsStarterInParty` (field_specials.c:1437-1448) : TRUE si le starter choisi
 *  (GetStarterPokemon(VAR_STARTER_MON)) est encore dans la party. */
export function IsStarterInParty(): number {
  // 1:1 décomp `GetStarterPokemon` (starter_choose.c) : sStarterMon[3] =
  // { TREECKO, TORCHIC, MUDKIP } ; default index 0 si invalide.
  const STARTER_BY_INDEX = [277 /* TREECKO */, 280 /* TORCHIC */, 283 /* MUDKIP */];
  const starterIdx = VarGet('VAR_STARTER_MON') ?? 0;
  const starter = STARTER_BY_INDEX[starterIdx] ?? STARTER_BY_INDEX[0];
  const partyCount = CalculatePlayerPartyCount();
  for (let i = 0; i < partyCount; i++) {
    const mon = gPlayerParty[i];
    const species = GetMonData(mon, MON_DATA_SPECIES) as number;
    if (species === 0 || (GetMonData(mon, MON_DATA_IS_EGG) as number)) continue;
    if (species === starter) return 1;
  }
  return 0;
}

/** 1:1 décomp `ScriptGetPartyMonSpecies` (field_specials.c:1544) :
 *    return GetMonData(&gPlayerParty[gSpecialVar_0x8004], MON_DATA_SPECIES); */
export function ScriptGetPartyMonSpecies(): number {
  const slot = VarGet('VAR_0x8004') ?? 0;
  const mon = gPlayerParty[slot];
  return mon ? (GetMonData(mon, MON_DATA_SPECIES) as number) : 0;
}

/** 1:1 décomp `IsPokerusInParty` (field_specials.c:1455-1461) :
 *    return CheckPartyPokerus(gPlayerParty, (1 << PARTY_SIZE) - 1) ? TRUE : FALSE; */
export function IsPokerusInParty(): number {
  return CheckPartyPokerus(gPlayerParty, (1 << PARTY_SIZE) - 1) ? 1 : 0;
}

/** 1:1 décomp `GetPlayerBigGuyGirlString` (field_specials.c:906) : StringCopy(gStringVar1,
 *  gText_BigGuy/gText_BigGirl) selon le genre. Notre version stocke la string FR pour expand. */
export function GetPlayerBigGuyGirlString(): void {
  setStringVar(1, gSaveBlock2Ptr.playerGender === MALE ? 'GRAND' : 'GRANDE');
}

/** 1:1 décomp `GetRivalSonDaughterString` (field_specials.c:914) : nom du rival selon le
 *  genre du JOUEUR (joueur garçon → rivale May = « fille » ; joueuse → Brendan = « fils »). */
export function GetRivalSonDaughterString(): void {
  const rivalIsBoy = gSaveBlock2Ptr.playerGender === FEMALE;
  setStringVar(1, rivalIsBoy ? 'fils' : 'fille');
}

/** 1:1 décomp `GetPlayerTrainerIdOnesDigit` (field_specials.c:901-904) :
 *    return (u16)(gSaveBlock2Ptr->playerTrainerId[0] | (playerTrainerId[1] << 8)) % 10; */
export function GetPlayerTrainerIdOnesDigit(): number {
  const trainerId = gSaveBlock2Ptr.playerTrainerId;
  return (trainerId & 0xFFFF) % 10;
}

/** 1:1 décomp `SetHiddenItemFlag` (field_specials.c:935-938) :
 *    FlagSet(gSpecialVar_0x8004);  (VAR_0x8004 = id numérique du flag posé par script). */
export function SetHiddenItemFlag(): void {
  FlagSet(VarGet('VAR_0x8004'));
}

/** 1:1 décomp `FoundBlackGlasses` (field_specials.c:1514-1517) :
 *    return FlagGet(FLAG_HIDDEN_ITEM_ROUTE_116_BLACK_GLASSES); */
export function FoundBlackGlasses(): number {
  return FlagGet('FLAG_HIDDEN_ITEM_ROUTE_116_BLACK_GLASSES') ? 1 : 0;
}

// ─── Lot 3 — flags d'état (SS Tidal, Trick House, Abandoned Ship) + coords joueur ───

/** 1:1 décomp `SetSSTidalFlag` (field_specials.c:276-280) :
 *    FlagSet(FLAG_SYS_CRUISE_MODE); *GetVarPointer(VAR_CRUISE_STEP_COUNT) = 0;
 *  Embarquement sur le SS Tidal (mode croisière + reset compteur de pas). */
export function SetSSTidalFlag(): void {
  FlagSet('FLAG_SYS_CRUISE_MODE');
  VarSet('VAR_CRUISE_STEP_COUNT', 0);
}

/** 1:1 décomp `ResetSSTidalFlag` (field_specials.c:282-285) :
 *    FlagClear(FLAG_SYS_CRUISE_MODE);  (fin de croisière SS Tidal). */
export function ResetSSTidalFlag(): void {
  FlagClear('FLAG_SYS_CRUISE_MODE');
}

/** 1:1 décomp `StorePlayerCoordsInVars` (field_specials.c:895) :
 *    *GetVarPointer(VAR_0x8004) = gSaveBlock1Ptr->pos.x;
 *    *GetVarPointer(VAR_0x8005) = gSaveBlock1Ptr->pos.y;
 *  Stocke les coords du joueur (pour positionner un NPC dessus). */
export function StorePlayerCoordsInVars(): number {
  VarSet('VAR_0x8004', gSaveBlock1Ptr.pos.x);
  VarSet('VAR_0x8005', gSaveBlock1Ptr.pos.y);
  return 0;
}

/** 1:1 décomp `SetTrickHouseNuggetFlag` (field_specials.c:1174-1180) :
 *    gSpecialVar_0x8004 = FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET; FlagSet(flag);
 *  (VarGet(name) résout l'id numérique du flag — adaptation : notre Flag* prend un name string.) */
export function SetTrickHouseNuggetFlag(): void {
  VarSet('VAR_0x8004', VarGet('FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET'));
  FlagSet('FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET');
}

/** 1:1 décomp `ResetTrickHouseNuggetFlag` (field_specials.c:1182-1188) :
 *    gSpecialVar_0x8004 = FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET; FlagClear(flag); */
export function ResetTrickHouseNuggetFlag(): void {
  VarSet('VAR_0x8004', VarGet('FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET'));
  FlagClear('FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET');
}

/** 1:1 décomp `FoundAbandonedShipRoom{1,2,4,6}Key` (field_specials.c:1328-1370) : pattern
 *  uniforme — gSpecialVar_0x8004 = FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_N_KEY ; return FlagGet(flag). */
function _foundAbandonedShipKey(flag: string): number {
  VarSet('VAR_0x8004', VarGet(flag));
  return FlagGet(flag) ? 1 : 0;
}
export function FoundAbandonedShipRoom1Key(): number { return _foundAbandonedShipKey('FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_1_KEY'); }
export function FoundAbandonedShipRoom2Key(): number { return _foundAbandonedShipKey('FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_2_KEY'); }
export function FoundAbandonedShipRoom4Key(): number { return _foundAbandonedShipKey('FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_4_KEY'); }
export function FoundAbandonedShipRoom6Key(): number { return _foundAbandonedShipKey('FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_6_KEY'); }

// ─── Lot 4 — time/clock + buffers (Pacifidlog TM, semaine, lotto, TM/HM move) ───

/** 1:1 décomp `GetWeekCount` (field_specials.c:940-947) :
 *    u16 weekCount = gLocalTime.days / 7; if (weekCount > 9999) weekCount = 9999; return weekCount; */
export function GetWeekCount(): number {
  let weekCount = Math.floor(gLocalTime.days / 7);
  if (weekCount > 9999) weekCount = 9999;
  return weekCount & 0xFFFF;
}

/** 1:1 décomp `GetDaysUntilPacifidlogTMAvailable` (field_specials.c:1555-1564) :
 *    tmReceivedDay = VarGet(VAR_PACIFIDLOG_TM_RECEIVED_DAY);
 *    if (gLocalTime.days - tmReceivedDay >= 7) return 0;
 *    else if (gLocalTime.days < 0) return 8;
 *    return 7 - (gLocalTime.days - tmReceivedDay);
 *  Jours restants avant la TM hebdo de Pacifidlog (0 = disponible). */
export function GetDaysUntilPacifidlogTMAvailable(): number {
  const tmReceivedDay = VarGet('VAR_PACIFIDLOG_TM_RECEIVED_DAY');
  if (gLocalTime.days - tmReceivedDay >= 7) return 0;
  if (gLocalTime.days < 0) return 8;
  return (7 - (gLocalTime.days - tmReceivedDay)) & 0xFFFF;
}

/** 1:1 décomp `SetPacifidlogTMReceivedDay` (field_specials.c:1566-1569) :
 *    VarSet(VAR_PACIFIDLOG_TM_RECEIVED_DAY, gLocalTime.days); return gLocalTime.days; */
export function SetPacifidlogTMReceivedDay(): number {
  VarSet('VAR_PACIFIDLOG_TM_RECEIVED_DAY', gLocalTime.days);
  return gLocalTime.days & 0xFFFF;
}

/** 1:1 décomp `BufferLottoTicketNumber` (field_specials.c:1585-1617) : pad VAR_RESULT à
 *  5 chiffres (leading zeros) → gStringVar1 (équivalent String(v).padStart(5, '0')). */
export function BufferLottoTicketNumber(): void {
  setStringVar(1, String(VarGet('VAR_RESULT')).padStart(5, '0'));
}

/** 1:1 décomp `BufferTMHMMoveName` (field_specials.c:1638-1647) :
 *    if (gSpecialVar_0x8004 in [ITEM_TM01, ITEM_HM08]) {
 *      StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(item)]); return TRUE; }
 *    return FALSE;
 *  ItemIdToBattleMoveId/getMoveName via bridge globalThis (anti-cycle, comme avant). */
export function BufferTMHMMoveName(): number {
  const itemId = VarGet('VAR_0x8004');
  if (itemId >= 289 /* ITEM_TM01 */ && itemId <= 346 /* ITEM_HM08 */) {
    const tmhmFn = (globalThis as { __game_tmhm?: {
      ItemIdToBattleMoveId?: (itemId: number) => string;
    } }).__game_tmhm?.ItemIdToBattleMoveId;
    const getMoveNameFn = (globalThis as { __game_data?: {
      getMoveName?: (moveId: string | number) => string;
    } }).__game_data?.getMoveName;
    if (tmhmFn && getMoveNameFn) {
      setStringVar(2, getMoveNameFn(tmhmFn(itemId)) || '');
    }
    VarSet('VAR_RESULT', 1);
    return 1;
  }
  VarSet('VAR_RESULT', 0);
  return 0;
}
