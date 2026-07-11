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
import { gSpeciesInfo, getMoveName } from './engine/data/game-data';
import { ItemIdToBattleMoveId } from './party_menu';
import { GetPlayerNameString, setStringVar } from '../include/text';
import { VarGet, VarSet, FlagSet, FlagGet, FlagClear } from './engine/script/script-vars';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { gLocalTime } from './rtc';
import { GetLastUsedWarpMapType, IsMapTypeOutdoors } from './overworld';
import { Random } from './random';
import { CheckFreePokemonStorageSpace, StorageGetCurrentBox } from './pokemon_storage_system';
import { SetCameraPanning, SetCameraPanningCallback, InstallCameraPanAheadCallback } from './field_camera';
import { CreateTask, DestroyTask, gTasks } from './task';
import { SE_M_STRENGTH } from '../include/constants/songs';

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
 *      StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(gSpecialVar_0x8004)]); return TRUE; }
 *    return FALSE;
 *  ✅ Branché 1:1 : ItemIdToBattleMoveId (tmhm-moves.ts) + getMoveName (game-data.ts), import direct
 *  (les anciens bridges globalThis __game_tmhm/__game_data n'étaient JAMAIS fournis → nom vide). */
export function BufferTMHMMoveName(): number {
  const itemId = VarGet('VAR_0x8004');
  if (itemId >= 289 /* ITEM_TM01 */ && itemId <= 346 /* ITEM_HM08 */) {
    setStringVar(2, getMoveName(ItemIdToBattleMoveId(itemId)) || '');
    VarSet('VAR_RESULT', 1);
    return 1;
  }
  VarSet('VAR_RESULT', 0);
  return 0;
}

// ─── Lot 5 — divers (battle outcome, vélo, mart, eon ticket) + météo de route ───

/** 1:1 décomp `GetBattleOutcome` (field_specials.c:922) : return gBattleOutcome (win/lose/
 *  run/draw/caught). Lu via bridge globalThis `__getBattleOutcome` (état battle live, anti-cycle). */
export function GetBattleOutcome(): number {
  const fn = (globalThis as { __getBattleOutcome?: () => number }).__getBattleOutcome;
  return fn ? fn() : 0;  // 0 = aucun combat encore.
}

/** 1:1 décomp `GetPlayerAvatarBike` (field_specials.c:168-175) :
 *    if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_ACRO_BIKE)) return 1;
 *    if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_MACH_BIKE)) return 2;
 *    return 0;
 *  Lit gPlayerAvatar.flags (bridge globalThis, anti-cycle) : ACRO=(1<<2), MACH=(1<<1). */
export function GetPlayerAvatarBike(): number {
  const pa = (globalThis as { gPlayerAvatar?: { flags?: number } }).gPlayerAvatar;
  const flags = pa?.flags ?? 0;
  if (flags & (1 << 2)) return 1;  // PLAYER_AVATAR_FLAG_ACRO_BIKE
  if (flags & (1 << 1)) return 2;  // PLAYER_AVATAR_FLAG_MACH_BIKE
  return 0;
}

/** 1:1 décomp `GetMartEmployeeObjectEventId` (field_specials.c:3598-3626) : lookup table de
 *  12 marts ; commentaire décomp 3597 « All mart employees have a local id of 1 » → return 1. */
export function GetMartEmployeeObjectEventId(): number {
  return 1;
}

/** 1:1 décomp `ShouldDistributeEonTicket` (field_specials.c:3640-3646) :
 *    if (!VarGet(VAR_DISTRIBUTE_EON_TICKET)) return FALSE; return TRUE;
 *  Commentaire décomp 3639 « Always returns FALSE » (var jamais set hors event eShop). */
export function ShouldDistributeEonTicket(): number {
  return VarGet('VAR_DISTRIBUTE_EON_TICKET') !== 0 ? 1 : 0;
}

/** 1:1 décomp `SetRoute119Weather` (field_specials.c:1519-1523) :
 *    if (IsMapTypeOutdoors(GetLastUsedWarpMapType()) != TRUE) SetSavedWeather(WEATHER_ROUTE119_CYCLE);
 *  WEATHER_ROUTE119_CYCLE = 20 ; SetSavedWeather = gSaveBlock1Ptr.weather = N. */
export function SetRoute119Weather(): void {
  if (!IsMapTypeOutdoors(GetLastUsedWarpMapType())) {
    gSaveBlock1Ptr.weather = 20;  // WEATHER_ROUTE119_CYCLE
  }
}

/** 1:1 décomp `SetRoute123Weather` (field_specials.c:1525-1529) : idem, WEATHER_ROUTE123_CYCLE = 21. */
export function SetRoute123Weather(): void {
  if (!IsMapTypeOutdoors(GetLastUsedWarpMapType())) {
    gSaveBlock1Ptr.weather = 21;  // WEATHER_ROUTE123_CYCLE
  }
}

// ─── Lot 6 — Trainer Fan Club (field_specials.c §3967-4290) ─────────────────
// 1:1 décomp macros (field_specials.c:3967-3971) :
//   FANCLUB_BITFIELD = VAR_FANCLUB_FAN_COUNTER ;
//   GET_TRAINER_FAN_CLUB_FLAG(flag) = (FANCLUB_BITFIELD >> flag) & 1 ;
//   SET_TRAINER_FAN_CLUB_FLAG(flag) = (FANCLUB_BITFIELD |= 1 << flag).
// FANCLUB_GOT_FIRST_FANS=7 ; FANCLUB_MEMBER1..8 = 8..15 ; NUM_TRAINER_FAN_CLUB_MEMBERS=8.

/** 1:1 décomp `IsFanClubMemberFanOfPlayer` (field_specials.c:4168-4178) :
 *    if (gSpecialVar_0x8004 >= NUM_TRAINER_FAN_CLUB_MEMBERS) return FALSE;
 *    return GET_TRAINER_FAN_CLUB_FLAG(gSpecialVar_0x8004 + FANCLUB_MEMBER1); */
export function IsFanClubMemberFanOfPlayer(): number {
  const idx = VarGet('VAR_0x8004');
  if (idx >= 8) return 0;  // NUM_TRAINER_FAN_CLUB_MEMBERS
  const counter = VarGet('VAR_FANCLUB_FAN_COUNTER');
  return ((counter >> (idx + 8)) & 1) ? 1 : 0;  // FANCLUB_MEMBER1 = 8
}

/** 1:1 décomp `GetNumFansOfPlayerInTrainerFanClub` (field_specials.c:4126-4138) :
 *    for (i=0; i<NUM_TRAINER_FAN_CLUB_MEMBERS; i++)
 *      if (GET_TRAINER_FAN_CLUB_FLAG(i + FANCLUB_MEMBER1)) numFans++; */
export function GetNumFansOfPlayerInTrainerFanClub(): number {
  const counter = VarGet('VAR_FANCLUB_FAN_COUNTER');
  let numFans = 0;
  for (let i = 0; i < 8; i++) {
    if ((counter >> (i + 8)) & 1) numFans++;
  }
  return numFans;
}

/** 1:1 décomp `ResetFanClub` (field_specials.c:3979-3983) :
 *    VAR_FANCLUB_FAN_COUNTER = 0; VAR_FANCLUB_LOSE_FAN_TIMER = 0; */
export function ResetFanClub(): void {
  VarSet('VAR_FANCLUB_FAN_COUNTER', 0);
  VarSet('VAR_FANCLUB_LOSE_FAN_TIMER', 0);
}

/** 1:1 décomp `SetPlayerGotFirstFans` (field_specials.c:4271-4274) :
 *    SET_TRAINER_FAN_CLUB_FLAG(FANCLUB_GOT_FIRST_FANS=7) = VAR_FANCLUB_FAN_COUNTER |= (1<<7).
 *  ⚠️ CORRIGÉ 1:1 : l'ancienne impl registry écrivait `trainerFanClub.flags` (bridge),
 *  incohérent avec les lecteurs (IsFanClubMemberFanOfPlayer/GetNumFans/DidPlayerGetFirstFans)
 *  qui lisent les bits de VAR_FANCLUB_FAN_COUNTER. Ici = le vrai bitfield du décomp. */
export function SetPlayerGotFirstFans(): void {
  VarSet('VAR_FANCLUB_FAN_COUNTER', (VarGet('VAR_FANCLUB_FAN_COUNTER') | (1 << 7)) & 0xFFFF);
}

/** 1:1 décomp `UpdateTrainerFanClubGameClear` (field_specials.c:3994-...) : si pas encore
 *  GOT_FIRST_FANS → SetPlayerGotFirstFans + SetInitialFansOfPlayer (SET MEMBER6/1/3 = bits
 *  13/8/10) + lose-timer = playTimeHours + clear FLAG_HIDE_FANCLUB_* + VAR_LILYCOVE_FAN_CLUB_STATE=1. */
export function UpdateTrainerFanClubGameClear(): void {
  let counter = VarGet('VAR_FANCLUB_FAN_COUNTER');
  if ((counter >> 7) & 1) return;  // GET_TRAINER_FAN_CLUB_FLAG(GOT_FIRST_FANS) → déjà fait.
  counter |= (1 << 7);  // SetPlayerGotFirstFans.
  counter |= (1 << 13) | (1 << 8) | (1 << 10);  // SetInitialFansOfPlayer : MEMBER6/1/3.
  VarSet('VAR_FANCLUB_FAN_COUNTER', counter & 0xFFFF);
  VarSet('VAR_FANCLUB_LOSE_FAN_TIMER', gSaveBlock2Ptr.playTimeHours ?? 0);
  FlagClear('FLAG_HIDE_FANCLUB_OLD_LADY');
  FlagClear('FLAG_HIDE_FANCLUB_BOY');
  FlagClear('FLAG_HIDE_FANCLUB_LITTLE_BOY');
  FlagClear('FLAG_HIDE_FANCLUB_LADY');
  FlagClear('FLAG_HIDE_LILYCOVE_FAN_CLUB_INTERVIEWER');
  VarSet('VAR_LILYCOVE_FAN_CLUB_STATE', 1);
}

/** 1:1 décomp `BufferFanClubTrainerName` (field_specials.c:4180-...) : buffer le nom d'un
 *  membre du fan club. Data/UI Lilycove non portée → no-op (état antérieur préservé). */
export function BufferFanClubTrainerName(): void { /* no-op (data Lilycove non portée) */ }

/** 1:1 décomp `Script_TryGainNewFanFromCounter` (field_specials.c:4277-4280) :
 *    return TryGainNewFanFromCounter(gSpecialVar_0x8004);  (valeur de retour toujours ignorée).
 *  TryGainNewFanFromCounter (porté secret-base.ts) DIFFÉRÉ ici (éviter import cycle) → 0. */
export function Script_TryGainNewFanFromCounter(): number { return 0; }

// ─── Lot 7 — Cycling Road challenge + slot machine + IV rater + divers reads ────

/** 1:1 décomp `ResetCyclingRoadChallengeData` (field_specials.c:154-159) :
 *    gBikeCyclingChallenge = FALSE; gBikeCollisions = 0; sBikeCyclingTimer = 0; */
export function ResetCyclingRoadChallengeData(): void {
  gBikeCycling.challenge = 0;
  gBikeCycling.collisions = 0;
  gBikeCycling.timer = 0;
}

/** 1:1 décomp `Special_BeginCyclingRoadChallenge` (field_specials.c:161-166) :
 *    gBikeCyclingChallenge = TRUE; gBikeCollisions = 0; sBikeCyclingTimer = gMain.vblankCounter1;
 *  Adaptation : vblankCounter1 (frame counter) → performance.now()|0 (timer monotone comparable). */
export function Special_BeginCyclingRoadChallenge(): void {
  gBikeCycling.challenge = 1;
  gBikeCycling.collisions = 0;
  gBikeCycling.timer = (performance.now() | 0) >>> 0;
}

/** 1:1 décomp `Special_ShowDiploma` (field_specials.c:141-...) :
 *    SetMainCallback2(CB2_ShowDiploma); LockPlayerFieldControls();
 *  Dette R3 : CB2_ShowDiploma (diploma screen UI) non porté → no-op + log. */
export function Special_ShowDiploma(): void {
  console.log('[special Special_ShowDiploma] dette R3 (cascade CB2_ShowDiploma diploma UI U-tier)');
}

/** 1:1 décomp `GetSlotMachineId` (field_specials.c:1289-...) :
 *    rnd = dewfordTrends[0].trendiness + dewfordTrends[0].rand + sSlotMachineRandomSeeds[VAR_0x8004];
 *    if (IsPokeNewsActive(POKENEWS_GAME_CORNER)) return sSlotMachineServiceDayIds[rnd % 12];
 *    return sSlotMachineIds[rnd % 12];
 *  Choisit la « chance » d'une machine à sous (Game Corner). PokeNews non porté →
 *  (pokeNews[] vide) → branche regular sauf si une entrée GAME_CORNER+ACTIVE existe. */
export function GetSlotMachineId(): number {
  const UNLUCKIEST = 0, UNLUCKIER = 1, UNLUCKY = 2;
  const LUCKY = 3, LUCKIER = 4, LUCKIEST = 5;
  const seeds = [12, 2, 4, 5, 1, 8, 7, 11, 3, 10, 9, 6];
  const ids = [
    UNLUCKIEST, UNLUCKIER, UNLUCKIER,
    UNLUCKY, UNLUCKY, UNLUCKY,
    LUCKY, LUCKY, LUCKY,
    LUCKIER, LUCKIER, LUCKIEST,
  ];
  const serviceDayIds = [
    LUCKY, LUCKY, LUCKY, LUCKY, LUCKY, LUCKY,
    LUCKIER, LUCKIER, LUCKIER, LUCKIER,
    LUCKIEST, LUCKIEST,
  ];
  const slot = VarGet('VAR_0x8004');
  const trends = gSaveBlock1Ptr.dewfordTrends?.[0];
  if (!trends) return UNLUCKIEST;
  const rnd = ((trends.trendiness ?? 0) + (trends.rand ?? 0) + (seeds[slot] ?? 0)) >>> 0;
  // IsPokeNewsActive(POKENEWS_GAME_CORNER=2, STATE_ACTIVE=2) ; pokeNews non porté → vide.
  const pokeNews = gSaveBlock1Ptr.pokeNews ?? [];
  let pokeNewsActive = false;
  for (let i = 0; i < 16; i++) {
    const news = pokeNews[i];
    if (news?.kind === 2 && news?.state === 2) { pokeNewsActive = true; break; }
  }
  if (pokeNewsActive) return (serviceDayIds[rnd % 12] ?? 0) & 0xFFFF;
  return (ids[rnd % 12] ?? 0) & 0xFFFF;
}

/** 1:1 décomp `BufferVarsForIVRater` (field_specials.c:1969-...) : IV Rater de Lavaridge —
 *  VAR_0x8005 = somme des 6 IVs du mon (slot VAR_0x8004), VAR_0x8006/0x8007 = idx+valeur de
 *  la stat au plus haut IV (tiebreak Random()&1). */
export function BufferVarsForIVRater(): void {
  const slot = VarGet('VAR_0x8004') ?? 0;
  const mon = gPlayerParty[slot];
  if (!mon || (GetMonData(mon, MON_DATA_SPECIES) as number) === 0) return;
  const ivStorage: number[] = [
    mon.hpIV, mon.attackIV, mon.defenseIV, mon.speedIV, mon.spAttackIV, mon.spDefenseIV,
  ];
  let sum = 0;
  for (let i = 0; i < 6; i++) sum += ivStorage[i];
  VarSet('VAR_0x8005', sum & 0xFFFF);
  let maxIdx = 0;
  let maxVal = ivStorage[0];
  for (let i = 1; i < 6; i++) {
    if (maxVal < ivStorage[i]) {
      maxIdx = i; maxVal = ivStorage[i];
    } else if (maxVal === ivStorage[i]) {
      if (Random() & 1) { maxIdx = i; maxVal = ivStorage[i]; }  // 1:1 tiebreak Random()&1.
    }
  }
  VarSet('VAR_0x8006', maxIdx);
  VarSet('VAR_0x8007', maxVal & 0xFFFF);
}

/** 1:1 décomp `GetBattleTowerSinglesStreak` (field_specials.c:1279-1282) :
 *    return GetGameStat(GAME_STAT_BATTLE_TOWER_SINGLES_STREAK=32); (gameStats cleartext). */
export function GetBattleTowerSinglesStreak(): number {
  return (gSaveBlock1Ptr.gameStats?.[32] ?? 0) & 0xFFFF;
}

/** 1:1 décomp `GetSecretBaseNearbyMapName` (field_specials.c:1274-1277) :
 *    GetMapName(gStringVar1, VarGet(VAR_SECRET_BASE_MAP), 0);
 *  ⚠️ DÉFÉRÉ no-op (l'ancien bridge globalThis __game_bridge n'était jamais fourni = même
 *  résultat : nom vide). 3 blocages avérés à l'import direct de region_map.GetMapName :
 *    (1) CYCLE : `import './region_map'` ici → TDZ `PALETTES_ALL` au boot (region_map est
 *        palette-couplé, et field_specials est importé tôt par bike.ts) ;
 *    (2) notre GetMapName est STRING-keyed (`MAPSEC_<NAME>`) ≠ VAR_SECRET_BASE_MAP NUMÉRIQUE ;
 *    (3) le système base secrète qui remplit VAR_SECRET_BASE_MAP n'est pas porté.
 *  À faire ensemble (résolveur mapSec numérique + cycle via bridge fourni + secret_base). */
export function GetSecretBaseNearbyMapName(): void {
  setStringVar(1, '');
}

// ─── Lot 8 — PC storage (field_specials.c §1450, 3415) ──────────────────────
// (SetPCBoxToSendMon/GetPCBoxToSendMon vivent dans pc-box.ts = leaf anti-cycle partagé
//  avec le flow GiveMonToPlayer ; DoPCTurnOn/OffEffect dans pc-anim.ts = anim tile-couplée.)

/** 1:1 décomp `ScriptCheckFreePokemonStorageSpace` (field_specials.c:1450) :
 *    return CheckFreePokemonStorageSpace();  → gSpecialVar_Result = TRUE s'il reste un slot PC. */
export function ScriptCheckFreePokemonStorageSpace(): number {
  return CheckFreePokemonStorageSpace() ? 1 : 0;
}

/** 1:1 décomp `ShouldShowBoxWasFullMessage` (field_specials.c:3415-3426) :
 *    if (!FlagGet(FLAG_SHOWN_BOX_WAS_FULL_MESSAGE))
 *      if (StorageGetCurrentBox() != VarGet(VAR_PC_BOX_TO_SEND_MON)) {
 *        FlagSet(FLAG_SHOWN_BOX_WAS_FULL_MESSAGE); return TRUE; }
 *    return FALSE;
 *  TRUE une seule fois (flag-gated) quand le mon capturé atterrit dans une AUTRE boîte que
 *  celle du curseur PC (boîte courante pleine). Appelé par Cmd_givecaughtmon (battle) via
 *  globalThis.__ShouldShowBoxWasFullMessage (= boolean, cycle-safe) + par le special. */
export function ShouldShowBoxWasFullMessage(): number {
  if (!FlagGet('FLAG_SHOWN_BOX_WAS_FULL_MESSAGE')) {
    if (StorageGetCurrentBox() !== VarGet('VAR_PC_BOX_TO_SEND_MON')) {
      FlagSet('FLAG_SHOWN_BOX_WAS_FULL_MESSAGE');
      return 1;
    }
  }
  return 0;
}
// Préserve le hook battle (Cmd_givecaughtmon, battle_script_commands.c:10062) : boolean.
(globalThis as Record<string, unknown>).__ShouldShowBoxWasFullMessage = () => ShouldShowBoxWasFullMessage() !== 0;

// ─── Lot 9 — camera (field_specials.c §1251, 1263, 1470, 1672) ──────────────

/** 1:1 décomp `OffsetCameraForBattle` (field_specials.c:1672-1676) :
 *    SetCameraPanningCallback(NULL); SetCameraPanning(8, 0);  (centrage caméra avant anim combat). */
export function OffsetCameraForBattle(): void {
  SetCameraPanningCallback(null);
  SetCameraPanning(8, 0);
}

// Task data for Task_ShakeCamera (1:1 field_specials.c:1463-1468) :
//   data[0] tHorizontalPan · data[1] tDelayCounter · data[2] tNumShakes · data[3] tDelay · data[4] tVerticalPan
/** 1:1 décomp `ShakeCamera` (field_specials.c:1470-1480) : crée Task_ShakeCamera (oscille
 *  SetCameraPanning(±tH, ±tV) toutes les tDelay frames, tNumShakes fois) + PlaySE(SE_M_STRENGTH).
 *  Débloque les cinématiques légendaires (Groudon/Kyogre/Rayquaza/Sootopolis) qui font
 *  `special ShakeCamera` + `waitstate` : StopCameraShake réactive le contexte à la fin. */
export function ShakeCamera(): void {
  // Revue transpiler : pattern task runtime OBLIGATOIRE (t)=>fn(t.taskId) (cf. braille_puzzles).
  const taskId = CreateTask((t: { taskId: number }) => Task_ShakeCamera(t.taskId), 9);
  gTasks[taskId].data[0] /* tHorizontalPan */ = VarGet('VAR_0x8005');
  gTasks[taskId].data[1] /* tDelayCounter */ = 0;
  gTasks[taskId].data[2] /* tNumShakes */ = VarGet('VAR_0x8006');
  gTasks[taskId].data[3] /* tDelay */ = VarGet('VAR_0x8007');
  gTasks[taskId].data[4] /* tVerticalPan */ = VarGet('VAR_0x8004');
  SetCameraPanningCallback(null);
  // 1:1 PlaySE(SE_M_STRENGTH) — via pont __PlaySE (pas d'arête ESM field_specials→sound).
  (globalThis as { __PlaySE?: (n: number) => void }).__PlaySE?.(SE_M_STRENGTH);
}

/** 1:1 décomp `Task_ShakeCamera` (field_specials.c:1482-1500). */
function Task_ShakeCamera(taskId: number): void {
  const task = gTasks[taskId];
  task.data[1] /* tDelayCounter */++;
  if (task.data[1] /* tDelayCounter */ % task.data[3] /* tDelay */ == 0)
  {
    task.data[1] /* tDelayCounter */ = 0;
    task.data[2] /* tNumShakes */--;
    task.data[0] /* tHorizontalPan */ = -task.data[0] /* tHorizontalPan */;
    task.data[4] /* tVerticalPan */ = -task.data[4] /* tVerticalPan */;
    SetCameraPanning(task.data[0] /* tHorizontalPan */, task.data[4] /* tVerticalPan */);
    if (task.data[2] /* tNumShakes */ == 0)
    {
      StopCameraShake(taskId);
      InstallCameraPanAheadCallback();
    }
  }
}

/** 1:1 décomp `StopCameraShake` (field_specials.c:1502-1506) : DestroyTask + ScriptContext_Enable.
 *  ScriptContext_Enable réactivé via pont globalThis (anti-cycle field_specials→script) ; on
 *  émet aussi __SignalWaitState — notre byte-VM `waitstate` reprend sur ce signal (pattern
 *  braille_puzzles Task_SealedChamberShakingEffect). */
function StopCameraShake(taskId: number): void {
  DestroyTask(taskId);
  (globalThis as { __ScriptContext_Enable?: () => void }).__ScriptContext_Enable?.();
  (globalThis as { __SignalWaitState?: () => void }).__SignalWaitState?.();
}

/** 1:1 décomp `SpawnCameraObject` (field_specials.c:1251-...) : crée l'object event CAMERA que la
 *  caméra suit (TrySpawnObjectEvent OBJ_EVENT_GFX_CAMERA + CameraObject_Init). DÉFÉRÉ no-op
 *  (object event CAMERA non porté). */
export function SpawnCameraObject(): number { return 0; }

/** 1:1 décomp `RemoveCameraObject` (field_specials.c:1263-...) : retire l'object event CAMERA.
 *  DÉFÉRÉ no-op (object event CAMERA non porté). */
export function RemoveCameraObject(): void { /* no-op — object event CAMERA non porté */ }


// ─── PC turn on/off 1:1 (field_specials.c:986-1111) — ex-pc-anim.ts (lot 11) ──
// DoPCTurnOnEffect flicker le metatile PC 5 fois. Adaptation moteur conservée :
// state machine tickée (TickPCAnim depuis la main loop harness) au lieu des
// tasks décomp (PCTurnOnEffect_0/1) — re-transcription task-based = raffinement.
// DoPCTurnOffEffect embarque le reload tileset anti-damier-magenta (CAS 3,
// cf. mémoire diag-pc-center-magenta a1a04117).
import {
  MapGridSetMetatileIdAt as _MapGridSetMetatileIdAt_PCA, MAP_OFFSET as _MAP_OFFSET_PCA,
  gMapHeader as _gMapHeader_PCA, CopyMapTilesetsToVram as _CopyMapTilesetsToVram_PCA,
} from './fieldmap';
import { GetPlayerFacingDirection as _GetPlayerFacingDirection_PCA } from './field_player_avatar';
import { gSaveBlock1Ptr as _gSaveBlock1Ptr_PCA } from './engine/save/save-block-state';
import { VarGet as _VarGet_PCA } from './engine/script/script-vars';
import { DrawWholeMapView as _DrawWholeMapView_PCA } from './field_camera';
import {
  METATILE_Building_PC_On as _MT_PC_On_PCA, METATILE_Building_PC_Off as _MT_PC_Off_PCA,
  METATILE_BrendansMaysHouse_BrendanPC_On as _MT_BPC_On_PCA,
  METATILE_BrendansMaysHouse_BrendanPC_Off as _MT_BPC_Off_PCA,
  METATILE_BrendansMaysHouse_MayPC_On as _MT_MPC_On_PCA,
  METATILE_BrendansMaysHouse_MayPC_Off as _MT_MPC_Off_PCA,
} from '../include/constants/metatile_labels';
import {
  PC_LOCATION_OTHER as _PC_LOC_OTHER_PCA, PC_LOCATION_BRENDANS_HOUSE as _PC_LOC_BH_PCA,
  PC_LOCATION_MAYS_HOUSE as _PC_LOC_MH_PCA,
} from '../include/constants/field_specials';
import { DIR_NORTH as _DIR_NORTH_PCA, DIR_WEST as _DIR_WEST_PCA, DIR_EAST as _DIR_EAST_PCA } from '../include/global.fieldmap';

/** 1:1 décomp `fieldmap.h` : `MAPGRID_IMPASSABLE = MAPGRID_COLLISION_MASK = 0x0C00` (bits 10-11).
 *  AUDIT FIX : était 0x800 (bit 11 seul) → collision=2 au lieu de 3 (impassable complet). */
const MAPGRID_IMPASSABLE = 0x0C00;

interface PCAnimState {
  active: boolean;
  flickerCount: number;
  timer: number;
  isScreenOn: boolean;
}

const _state: PCAnimState = {
  active: false,
  flickerCount: 0,
  timer: 0,
  isScreenOn: false,
};

/** 1:1 décomp `DoPCTurnOnEffect` (field_specials.c:986-997). */
export function StartPCTurnOnEffect(): void {
  if (_state.active) return;  // 1:1 FuncIsActiveTask check (already running)
  _state.active = true;
  _state.flickerCount = 0;
  _state.timer = 0;
  _state.isScreenOn = false;
}

export function IsPCAnimRunning(): boolean {
  return _state.active;
}

/** 1:1 décomp `Task_PCTurnOnEffect` (field_specials.c:999-1004) + `PCTurnOnEffect`
 *  (1006-1044). Ticked chaque frame. Toggle metatile every 6 frames pendant 5
 *  flickers, finit sur ON. */
export function TickPCAnim(): void {
  if (!_state.active) return;
  if (_state.timer === 6) {
    _state.timer = 0;

    const dxdy = _computeDxDy();
    if (!dxdy) {
      // Direction non-supportée (= player faces SOUTH?). Skip frame.
      return;
    }
    const { dx, dy } = dxdy;
    _setPCMetatile(_state.isScreenOn, dx, dy);
    // 1:1 décomp `_DrawWholeMapView_PCA()` (field_specials.c:1035) — re-render le BG
    // overworld après la modif metatile. Signature 1:1 = no args (lit
    // _gSaveBlock1Ptr_PCA->pos.x/y + _gMapHeader_PCA.mapLayout internally). Avant on
    // passait `gPlayerAvatar.x/y` → décalage 1 case visuel quand player ≠
    // camera focus (user-flag "Utiliser le PC nous bouge temporairement d'une
    // case a droite" 2026-05-21).
    _DrawWholeMapView_PCA();

    _state.isScreenOn = !_state.isScreenOn;
    _state.flickerCount++;
    if (_state.flickerCount === 5) {
      _state.active = false;
    }
  }
  _state.timer++;
}

/** 1:1 décomp `DoPCTurnOffEffect` (field_specials.c:1073-1111). Pas de flicker.
 *  Refresh BG via DrawWholeMapView (= 1:1 décomp _DrawWholeMapView_PCA() post setMetatile). */
export function DoPCTurnOffEffect(): void {
  const dxdy = _computeDxDy();
  if (!dxdy) return;
  const { dx, dy } = dxdy;
  _setPCMetatileToOff(dx, dy);
  // 🩸 Adaptation moteur (SYMPTÔME, pas 1:1 — cf. mémoire diag-pc-center-magenta) : les fenêtres du
  // PC (menu / multichoice « Quel PC? » / écran boîtes) écrivent dans la zone VRAM du tileset field
  // (charBase 0 partagé) et corrompent la tile 513 (border), révélant le damier magenta BG3 hors-map
  // sur les petites maps (PC Center 14×9 < écran). On RECHARGE le tileset field ici : DoPCTurnOffEffect
  // est le hook commun à TOUS les PC (EventScript_TurnOffPC : déconnexion ET MULTI_B_PRESSED, + PC
  // chambre via TurnOffPlayerPC). Complète le fix Task_PCMainMenu STATE_FADE_IN (retour écran boîtes).
  _CopyMapTilesetsToVram_PCA(_gMapHeader_PCA?.mapLayout ?? null);
  _DrawWholeMapView_PCA();
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/** 1:1 décomp `PCTurnOnEffect` (lines 1015-1031) : compute dx/dy depuis player dir. */
function _computeDxDy(): { dx: number; dy: number } | null {
  const facing = _GetPlayerFacingDirection_PCA();
  if (facing === _DIR_NORTH_PCA) return { dx: 0, dy: -1 };
  if (facing === _DIR_WEST_PCA)  return { dx: -1, dy: -1 };
  if (facing === _DIR_EAST_PCA)  return { dx: 1, dy: -1 };
  // DIR_SOUTH ou autres : décomp pas de case → dx=0, dy=0 (= modifie le tile player).
  // 1:1 décomp : dx=0 dy=0 par défaut (= initial values du switch sans match).
  return { dx: 0, dy: 0 };
}

function _setPCMetatile(isScreenOn: boolean, dx: number, dy: number): void {
  // 1:1 décomp `PCTurnOnEffect_SetMetatile` (lines 1046-1070).
  const pcLocation = _getCurrentPCLocation();
  let metatileId = 0;
  if (isScreenOn) {
    // Currently ON, set to OFF
    if (pcLocation === _PC_LOC_OTHER_PCA)            metatileId = _MT_PC_Off_PCA;
    else if (pcLocation === _PC_LOC_BH_PCA) metatileId = _MT_BPC_Off_PCA;
    else if (pcLocation === _PC_LOC_MH_PCA)  metatileId = _MT_MPC_Off_PCA;
  } else {
    // Currently OFF, set to ON
    if (pcLocation === _PC_LOC_OTHER_PCA)            metatileId = _MT_PC_On_PCA;
    else if (pcLocation === _PC_LOC_BH_PCA) metatileId = _MT_BPC_On_PCA;
    else if (pcLocation === _PC_LOC_MH_PCA)  metatileId = _MT_MPC_On_PCA;
  }
  // 1:1 décomp : x + dx + _MAP_OFFSET_PCA, y + dy + _MAP_OFFSET_PCA.
  _MapGridSetMetatileIdAt_PCA(
    _gSaveBlock1Ptr_PCA.pos.x + dx + _MAP_OFFSET_PCA,
    _gSaveBlock1Ptr_PCA.pos.y + dy + _MAP_OFFSET_PCA,
    metatileId | MAPGRID_IMPASSABLE,
  );
}

function _setPCMetatileToOff(dx: number, dy: number): void {
  const pcLocation = _getCurrentPCLocation();
  let metatileId = 0;
  if (pcLocation === _PC_LOC_OTHER_PCA)            metatileId = _MT_PC_Off_PCA;
  else if (pcLocation === _PC_LOC_BH_PCA) metatileId = _MT_BPC_Off_PCA;
  else if (pcLocation === _PC_LOC_MH_PCA)  metatileId = _MT_MPC_Off_PCA;
  _MapGridSetMetatileIdAt_PCA(
    _gSaveBlock1Ptr_PCA.pos.x + dx + _MAP_OFFSET_PCA,
    _gSaveBlock1Ptr_PCA.pos.y + dy + _MAP_OFFSET_PCA,
    metatileId | MAPGRID_IMPASSABLE,
  );
}

/** Read VAR_0x8004 = PC_LOCATION_*. Le décomp lit gSpecialVar_0x8004 que le
 *  script setvar avant le special. Pour PlayerPC (= 0 / OTHER) le script setvar
 *  pas (= default 0). */
function _getCurrentPCLocation(): number {
  // Le script setvar VAR_0x8004 just before special DoPCTurnOnEffect.
  // Lecture via gameState.getVar.
  const v = _VarGet_PCA('VAR_0x8004');
  // Fallback : si non-set explicitly, regarde la mapId pour deviner.
  if (v === 0) {
    const mapId = _gMapHeader_PCA?.id ?? '';
    if (mapId === 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F') return _PC_LOC_BH_PCA;
    if (mapId === 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_2F') return _PC_LOC_MH_PCA;
  }
  return v;
}

// ─── Mauville Gym puzzle 1:1 (field_specials.c:611-782) — barrières électriques (arène badge 3) ──
// Les métatiles écrites (MapGridSetMetatileIdAt) sont ré-affichées par le special DrawWholeMapView
// que le script enchaîne (specials-registry). MAPGRID_IMPASSABLE = const locale 0x0C00 ci-dessus.
import { MapGridSetMetatileIdAt, MapGridGetMetatileIdAt, MAP_OFFSET } from './fieldmap';
import {
  METATILE_MauvilleGym_PressedSwitch, METATILE_MauvilleGym_RaisedSwitch,
  METATILE_MauvilleGym_GreenBeamH1_On, METATILE_MauvilleGym_GreenBeamH1_Off,
  METATILE_MauvilleGym_GreenBeamH2_On, METATILE_MauvilleGym_GreenBeamH2_Off,
  METATILE_MauvilleGym_GreenBeamH3_On, METATILE_MauvilleGym_GreenBeamH3_Off,
  METATILE_MauvilleGym_GreenBeamH4_On, METATILE_MauvilleGym_GreenBeamH4_Off,
  METATILE_MauvilleGym_RedBeamH1_On, METATILE_MauvilleGym_RedBeamH1_Off,
  METATILE_MauvilleGym_RedBeamH2_On, METATILE_MauvilleGym_RedBeamH2_Off,
  METATILE_MauvilleGym_RedBeamH3_On, METATILE_MauvilleGym_RedBeamH3_Off,
  METATILE_MauvilleGym_RedBeamH4_On, METATILE_MauvilleGym_RedBeamH4_Off,
  METATILE_MauvilleGym_GreenBeamV1_On, METATILE_MauvilleGym_GreenBeamV2_On,
  METATILE_MauvilleGym_RedBeamV1_On, METATILE_MauvilleGym_RedBeamV2_On,
  METATILE_MauvilleGym_PoleBottom_On, METATILE_MauvilleGym_PoleBottom_Off,
  METATILE_MauvilleGym_PoleTop_On, METATILE_MauvilleGym_PoleTop_Off,
  METATILE_MauvilleGym_FloorTile,
} from '../include/constants/metatile_labels';

/** 1:1 décomp `static const struct UCoords8 sMauvilleGymSwitchCoords[]` (field_specials.c:611-617). */
const sMauvilleGymSwitchCoords: readonly { x: number; y: number }[] = [
  { x: 0 + MAP_OFFSET, y: 15 + MAP_OFFSET },
  { x: 4 + MAP_OFFSET, y: 12 + MAP_OFFSET },
  { x: 3 + MAP_OFFSET, y:  9 + MAP_OFFSET },
  { x: 8 + MAP_OFFSET, y:  9 + MAP_OFFSET },
];

/** 1:1 décomp `MauvilleGymPressSwitch` (field_specials.c:619-630) : presse le switch foulé
 *  (gSpecialVar_0x8004 = index) et relève les autres. */
export function MauvilleGymPressSwitch(): void {
  for (let i = 0; i < sMauvilleGymSwitchCoords.length; i++) {
    if (i == VarGet('VAR_0x8004'))
      MapGridSetMetatileIdAt(sMauvilleGymSwitchCoords[i].x, sMauvilleGymSwitchCoords[i].y, METATILE_MauvilleGym_PressedSwitch);
    else
      MapGridSetMetatileIdAt(sMauvilleGymSwitchCoords[i].x, sMauvilleGymSwitchCoords[i].y, METATILE_MauvilleGym_RaisedSwitch);
  }
}

/** 1:1 décomp `MauvilleGymSetDefaultBarriers` (field_specials.c:632-724) : remet les barrières à
 *  leur état par défaut (leur état alternatif est géré par EventScript_SetAltBarriers). */
export function MauvilleGymSetDefaultBarriers(): void {
  // All switches/barriers are within these coord ranges
  for (let y = 5 + MAP_OFFSET; y < 17 + MAP_OFFSET; y++) {
    for (let x = 0 + MAP_OFFSET; x < 9 + MAP_OFFSET; x++) {
      switch (MapGridGetMetatileIdAt(x, y)) {
        case METATILE_MauvilleGym_GreenBeamH1_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH1_Off);
          break;
        case METATILE_MauvilleGym_GreenBeamH2_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH2_Off);
          break;
        case METATILE_MauvilleGym_GreenBeamH3_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH3_Off);
          break;
        case METATILE_MauvilleGym_GreenBeamH4_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH4_Off);
          break;
        case METATILE_MauvilleGym_GreenBeamH1_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH1_On);
          break;
        case METATILE_MauvilleGym_GreenBeamH2_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH2_On);
          break;
        case METATILE_MauvilleGym_GreenBeamH3_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH3_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_GreenBeamH4_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH4_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_RedBeamH1_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH1_Off);
          break;
        case METATILE_MauvilleGym_RedBeamH2_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH2_Off);
          break;
        case METATILE_MauvilleGym_RedBeamH3_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH3_Off);
          break;
        case METATILE_MauvilleGym_RedBeamH4_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH4_Off);
          break;
        case METATILE_MauvilleGym_RedBeamH1_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH1_On);
          break;
        case METATILE_MauvilleGym_RedBeamH2_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH2_On);
          break;
        case METATILE_MauvilleGym_RedBeamH3_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH3_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_RedBeamH4_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH4_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_GreenBeamV1_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_PoleBottom_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_GreenBeamV2_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_FloorTile);
          break;
        case METATILE_MauvilleGym_RedBeamV1_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_PoleBottom_Off | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_RedBeamV2_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_FloorTile);
          break;
        case METATILE_MauvilleGym_PoleBottom_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamV1_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_FloorTile:
          if (MapGridGetMetatileIdAt(x, y - 1) == METATILE_MauvilleGym_GreenBeamV1_On)
            MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamV2_On | MAPGRID_IMPASSABLE);
          else
            MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamV2_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_PoleBottom_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamV1_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_PoleTop_Off:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_PoleTop_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_PoleTop_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_PoleTop_Off);
          break;
      }
    }
  }
}

/** 1:1 décomp `MauvilleGymDeactivatePuzzle` (field_specials.c:726-782) : presse tous les switchs
 *  et désactive toutes les barrières. */
export function MauvilleGymDeactivatePuzzle(): void {
  // 1:1 : `const struct UCoords8 *switchCoords = sMauvilleGymSwitchCoords;` puis `switchCoords++`
  // (i décompte, le pointeur avance → coords[0..3] toutes pressées).
  let switchCoords = 0;
  for (let i = sMauvilleGymSwitchCoords.length - 1; i >= 0; i--) {
    MapGridSetMetatileIdAt(sMauvilleGymSwitchCoords[switchCoords].x, sMauvilleGymSwitchCoords[switchCoords].y, METATILE_MauvilleGym_PressedSwitch);
    switchCoords++;
  }
  for (let y = 5 + MAP_OFFSET; y < 17 + MAP_OFFSET; y++) {
    for (let x = 0 + MAP_OFFSET; x < 9 + MAP_OFFSET; x++) {
      switch (MapGridGetMetatileIdAt(x, y)) {
        case METATILE_MauvilleGym_GreenBeamH1_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH1_Off);
          break;
        case METATILE_MauvilleGym_GreenBeamH2_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH2_Off);
          break;
        case METATILE_MauvilleGym_GreenBeamH3_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH3_Off);
          break;
        case METATILE_MauvilleGym_GreenBeamH4_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_GreenBeamH4_Off);
          break;
        case METATILE_MauvilleGym_RedBeamH1_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH1_Off);
          break;
        case METATILE_MauvilleGym_RedBeamH2_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH2_Off);
          break;
        case METATILE_MauvilleGym_RedBeamH3_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH3_Off);
          break;
        case METATILE_MauvilleGym_RedBeamH4_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_RedBeamH4_Off);
          break;
        case METATILE_MauvilleGym_GreenBeamV1_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_PoleBottom_On | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_RedBeamV1_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_PoleBottom_Off | MAPGRID_IMPASSABLE);
          break;
        case METATILE_MauvilleGym_GreenBeamV2_On:
        case METATILE_MauvilleGym_RedBeamV2_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_FloorTile);
          break;
        case METATILE_MauvilleGym_PoleTop_On:
          MapGridSetMetatileIdAt(x, y, METATILE_MauvilleGym_PoleTop_Off);
          break;
      }
    }
  }
}

// ─── sPCBoxToSendMon 1:1 (field_specials.c:118 + 3405-3413) — ex-pc-box.ts (lot 11b) ──

/** 1:1 décomp `static EWRAM_DATA u8 sPCBoxToSendMon = 0` (field_specials.c:118). */
let sPCBoxToSendMon = 0;

/** 1:1 décomp `void SetPCBoxToSendMon(u8 boxId)` (field_specials.c:3405-3408). */
export function SetPCBoxToSendMon(boxId: number): void {
  sPCBoxToSendMon = boxId & 0xFF;
}

/** 1:1 décomp `u16 GetPCBoxToSendMon(void)` (field_specials.c:3410-3413). */
export function GetPCBoxToSendMon(): number {
  return sPCBoxToSendMon;
}
