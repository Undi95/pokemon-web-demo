/**
 * daycare.ts — 1:1 port partiel de `D:/Projet 1/decomps/pokeemeraude/src/daycare.c`.
 *
 * Source de vérité (1:1 décomp) : `decomps/pokeemeraude/src/daycare.c`.
 *
 * Subset porté : `CreateEgg` (opcode `giveegg`) + la chaîne ÉCLOSION complète
 * (GetMonNickname2/GetBoxMonNickname, TryProduceOrHatchEgg + compat/trigger œuf,
 * ShouldEggHatch — CHEMIN P2.2). Le reste (dépôt/retrait pension, hérédité
 * IV/moves, GiveEggFromDaycare) = chantier pension dédié.
 */

// CreateMon NUMÉRIQUE 1:1 (foyer pokemon.c) — remplace la convenience legacy
// engine/pokemon/pokemon:CreateMon(speciesEnum, opts). createEmptyPokemon = la struct cible.
import {
  CreateMon, createEmptyPokemon, GetNatureFromPersonality, GetBoxMonGender,
  GetGenderFromSpeciesAndPersonality, CalculatePlayerPartyCount,
} from './pokemon';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { OT_ID_PLAYER_ID, EGG_GROUP_DITTO, EGG_GROUP_NO_EGGS_DISCOVERED } from '../include/constants/pokemon';
import {
  GetMonData, SetMonData,
  MON_DATA_POKEBALL, MON_DATA_NICKNAME, MON_DATA_FRIENDSHIP,
  MON_DATA_MET_LEVEL, MON_DATA_LANGUAGE, MON_DATA_MET_LOCATION, MON_DATA_IS_EGG,
  MON_DATA_SPECIES, MON_DATA_PERSONALITY, MON_DATA_OT_ID, MON_DATA_HELD_ITEM,
  MON_DATA_SANITY_HAS_SPECIES, MON_DATA_SANITY_IS_BAD_EGG,
  gPlayerParty,
} from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
import { gSpeciesInfo } from './engine/data/game-data';
import { getString } from './engine/ui/gba-strings';
import { encodeOwText } from './text';
import { StringCopy_Nickname } from './string_util';
import { LANGUAGE_JAPANESE } from '../include/constants/global';
import { ITEM_POKE_BALL } from '../include/constants/items';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { Random, Random2, SeedRng2 } from './random';
import { FlagSet, VarSet } from './event_data';
import { FLAG_PENDING_DAYCARE_EGG } from '../include/constants/flags';
import { gMain } from '../harness/runtime/decomp-globals';
// ⚠️ cycle ESM daycare↔egg_hatch assumé : imports de FONCTIONS appelées au runtime
// uniquement (déclarations hoistées, aucun usage top-level) → pas de TDZ.
import { GetEggCyclesToSubtract } from './egg_hatch';

/** 1:1 décomp `#define EGG_HATCH_LEVEL 5` (constants/daycare.h:17). */
export const EGG_HATCH_LEVEL = 5;

/** 1:1 décomp `#define METLOC_SPECIAL_EGG 0xFD` (constants/region_map_sections.h). */
const METLOC_SPECIAL_EGG = 0xFD;

/** 1:1 décomp `void CreateEgg(struct Pokemon *mon, u16 species, bool8 setHotSpringsLocation)`
 *  (daycare.c:828-853) :
 *  ```c
 *  CreateMon(mon, species, EGG_HATCH_LEVEL, USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0);
 *  metLevel = 0; ball = ITEM_POKE_BALL; language = LANGUAGE_JAPANESE;
 *  SetMonData(mon, MON_DATA_POKEBALL, &ball);
 *  SetMonData(mon, MON_DATA_NICKNAME, sJapaneseEggNickname);
 *  SetMonData(mon, MON_DATA_FRIENDSHIP, &gSpeciesInfo[species].eggCycles);
 *  SetMonData(mon, MON_DATA_MET_LEVEL, &metLevel);
 *  SetMonData(mon, MON_DATA_LANGUAGE, &language);
 *  if (setHotSpringsLocation) SetMonData(mon, MON_DATA_MET_LOCATION, &METLOC_SPECIAL_EGG);
 *  isEgg = TRUE; SetMonData(mon, MON_DATA_IS_EGG, &isEgg);
 *  ```
 *  Adaptations modèle :
 *   - `CreateMon` retourne le mon (au lieu d'écrire un pointeur sortie).
 *   - Le nickname œuf = `getString('gText_EggNickname')` ("OEUF") au lieu du
 *     `sJapaneseEggNickname` (タマゴ) du décomp : notre modèle est FR/UTF-8 et
 *     l'affichage spécialise déjà `isEgg` → "OEUF" (cf. party-screen.ts:666),
 *     donc le nickname stocké est cohérent avec ce qui s'affiche.
 *   - `eggCycles` lu via `gSpeciesInfo[mon.species]` (table id-indexée). */
// ─── Struct DayCare (1:1 include/global.h : DaycareMon/DayCare) ──────────────
// BoxPokemon ≡ Pokemon chez nous (modèle numérique unifié src/pokemon.ts).
export interface DaycareMail {
  message: { itemId: number };            // struct Mail (subset : itemId suffit aux checks)
  otName: Uint8Array;                      // OT_NAME_LENGTH + 1
  monName: Uint8Array;                     // POKEMON_NAME_LENGTH + 1
  gameLanguage: number;                    // :4
  monLanguage: number;                     // :4
}
export interface DaycareMon {
  mon: Pokemon | null;                     // struct BoxPokemon
  mail: DaycareMail;
  steps: number;                           // u32
}
export interface DayCare {
  mons: [DaycareMon, DaycareMon];
  offspringPersonality: number;            // u32
  stepCounter: number;                     // u8
}

/** 1:1 décomp `#define DAYCARE_MON_COUNT 2` (constants/daycare.h). */
export const DAYCARE_MON_COUNT = 2;
/** 1:1 décomp `#define EGG_GROUPS_PER_MON 2` (constants/daycare.h). */
const EGG_GROUPS_PER_MON = 2;
/** 1:1 décomp `#define EGG_GENDER_MALE 0x8000` (constants/daycare.h:18). */
const EGG_GENDER_MALE = 0x8000;
// 1:1 décomp constants/daycare.h:5-8.
const PARENTS_INCOMPATIBLE = 0;
const PARENTS_LOW_COMPATIBILITY = 20;
const PARENTS_MED_COMPATIBILITY = 50;
const PARENTS_MAX_COMPATIBILITY = 70;

function _emptyDaycareMon(): DaycareMon {
  return {
    mon: null,
    mail: { message: { itemId: 0 }, otName: new Uint8Array(8), monName: new Uint8Array(11), gameLanguage: 0, monLanguage: 0 },
    steps: 0,
  };
}

/** = `&gSaveBlock1Ptr->daycare` — init lazy du bloc si le save ne l'a pas encore
 *  (les saves antérieures à ce chantier n'ont pas de pension). */
export function GetDaycareData(): DayCare {
  let dc = gSaveBlock1Ptr.daycare as DayCare | undefined;
  if (!dc) {
    dc = { mons: [_emptyDaycareMon(), _emptyDaycareMon()], offspringPersonality: 0, stepCounter: 0 };
    gSaveBlock1Ptr.daycare = dc;
  }
  return dc;
}

/** 1:1 décomp `u8 *GetMonNickname2(struct Pokemon *mon, u8 *dest)` (daycare.c:94). */
export function GetMonNickname2(mon: Pokemon, dest: Uint8Array): Uint8Array {
  const nickname = encodeOwText(GetMonData(mon, MON_DATA_NICKNAME) as string);
  return StringCopy_Nickname(dest, nickname);
}

/** 1:1 décomp `u8 *GetBoxMonNickname(struct BoxPokemon *mon, u8 *dest)` (daycare.c:101). */
export function GetBoxMonNickname(mon: Pokemon, dest: Uint8Array): Uint8Array {
  const nickname = encodeOwText(GetMonData(mon, MON_DATA_NICKNAME) as string);
  return StringCopy_Nickname(dest, nickname);
}

/** eggGroups data (strings 'EGG_GROUP_X') → valeur numérique décomp. */
function _eggGroup(name: string | undefined): number {
  return name ? ((resolveDecompConstant(name) as number | undefined) ?? 0) : 0;
}

/** 1:1 décomp `static s32 GetParentToInheritNature(struct DayCare *daycare)` (daycare.c:414). */
function GetParentToInheritNature(daycare: DayCare): number {
  const species: number[] = [0, 0];
  let dittoCount: number;
  let i: number;
  let parent = -1;

  // search for female gender
  for (i = 0; i < DAYCARE_MON_COUNT; i++) {
    if (daycare.mons[i].mon && GetBoxMonGender(daycare.mons[i].mon!) === 254 /* MON_FEMALE */)
      parent = i;
  }

  // search for ditto
  const SPECIES_DITTO = (resolveDecompConstant('SPECIES_DITTO') as number | undefined) ?? 132;
  for (dittoCount = 0, i = 0; i < DAYCARE_MON_COUNT; i++) {
    species[i] = daycare.mons[i].mon ? (GetMonData(daycare.mons[i].mon!, MON_DATA_SPECIES) as number) : 0;
    if (species[i] === SPECIES_DITTO) { dittoCount++; parent = i; }
  }

  // coin flip on ...two Dittos
  if (dittoCount === DAYCARE_MON_COUNT) {
    parent = Random() >= 32767 /* USHRT_MAX / 2 (division entière C) */ ? 0 : 1;
  }

  // Don't inherit nature if not holding Everstone
  // (parent == -1 : le décomp lit mons[-1] (UB) → held item garbage ≠ EVERSTONE → -1 ;
  //  le guard `parent < 0` produit le même résultat sans l'OOB.)
  const ITEM_EVERSTONE = (resolveDecompConstant('ITEM_EVERSTONE') as number | undefined) ?? 0;
  if (parent < 0
    || (GetMonData(daycare.mons[parent].mon!, MON_DATA_HELD_ITEM) as number) !== ITEM_EVERSTONE
    || Random() >= 32767 /* USHRT_MAX / 2 */) {
    return -1;
  }

  return parent;
}

/** 1:1 décomp `static void _TriggerPendingDaycareEgg(struct DayCare *daycare)` (daycare.c:455).
 *  `SeedRng2(gMain.vblankCounter2)` : vblankCounter2 non simulé séparément →
 *  vblankCounter1 (même horloge vblank chez nous). */
function _TriggerPendingDaycareEgg(daycare: DayCare): void {
  let natureTries = 0;

  SeedRng2((gMain as { vblankCounter1?: number }).vblankCounter1 ?? 0);
  const parent = GetParentToInheritNature(daycare);

  // don't inherit nature
  if (parent < 0) {
    daycare.offspringPersonality = (((Random2() << 16) >>> 0) | ((Random() % 0xFFFE) + 1)) >>> 0;
  } else {
    // inherit nature
    const wantedNature = GetNatureFromPersonality(GetMonData(daycare.mons[parent].mon!, MON_DATA_PERSONALITY) as number);
    let personality = 0;

    do {
      personality = (((Random2() << 16) >>> 0) | Random()) >>> 0;
      if (wantedNature === GetNatureFromPersonality(personality) && personality !== 0)
        break; // found a personality with the same nature

      natureTries++;
    } while (natureTries <= 2400);

    daycare.offspringPersonality = personality;
  }

  FlagSet(FLAG_PENDING_DAYCARE_EGG);
}

/** 1:1 décomp `static void _TriggerPendingDaycareMaleEgg(...)` (daycare.c:490) —
 *  "Functionally unused" dans la décomp ; porté pour le miroir intégral. */
function _TriggerPendingDaycareMaleEgg(daycare: DayCare): void {
  daycare.offspringPersonality = (Random() | EGG_GENDER_MALE) >>> 0;
  FlagSet(FLAG_PENDING_DAYCARE_EGG);
}

/** 1:1 décomp `void TriggerPendingDaycareEgg(void)` (daycare.c:496). */
export function TriggerPendingDaycareEgg(): void {
  _TriggerPendingDaycareEgg(GetDaycareData());
}

/** 1:1 décomp `static void UNUSED TriggerPendingDaycareMaleEgg(void)` (daycare.c:501). */
export function TriggerPendingDaycareMaleEgg(): void {
  _TriggerPendingDaycareMaleEgg(GetDaycareData());
}

/** 1:1 décomp `static bool8 EggGroupsOverlap(u16 *eggGroups1, u16 *eggGroups2)` (daycare.c:999). */
function EggGroupsOverlap(eggGroups1: number[], eggGroups2: number[]): boolean {
  for (let i = 0; i < EGG_GROUPS_PER_MON; i++) {
    for (let j = 0; j < EGG_GROUPS_PER_MON; j++) {
      if (eggGroups1[i] === eggGroups2[j]) return true;
    }
  }
  return false;
}

/** 1:1 décomp `static u8 GetDaycareCompatibilityScore(struct DayCare *daycare)` (daycare.c:1015). */
function GetDaycareCompatibilityScore(daycare: DayCare): number {
  const eggGroups: number[][] = [[0, 0], [0, 0]];
  const species: number[] = [0, 0];
  const trainerIds: number[] = [0, 0];
  const genders: number[] = [0, 0];

  for (let i = 0; i < DAYCARE_MON_COUNT; i++) {
    const mon = daycare.mons[i].mon!;
    species[i] = GetMonData(mon, MON_DATA_SPECIES) as number;
    trainerIds[i] = GetMonData(mon, MON_DATA_OT_ID) as number;
    const personality = GetMonData(mon, MON_DATA_PERSONALITY) as number;
    genders[i] = GetGenderFromSpeciesAndPersonality(species[i], personality);
    eggGroups[i][0] = _eggGroup(gSpeciesInfo[species[i]]?.eggGroups?.[0]);
    eggGroups[i][1] = _eggGroup(gSpeciesInfo[species[i]]?.eggGroups?.[1]);
  }

  // check unbreedable egg group
  if (eggGroups[0][0] === EGG_GROUP_NO_EGGS_DISCOVERED || eggGroups[1][0] === EGG_GROUP_NO_EGGS_DISCOVERED)
    return PARENTS_INCOMPATIBLE;
  // two Ditto can't breed
  if (eggGroups[0][0] === EGG_GROUP_DITTO && eggGroups[1][0] === EGG_GROUP_DITTO)
    return PARENTS_INCOMPATIBLE;

  // one parent is Ditto
  if (eggGroups[0][0] === EGG_GROUP_DITTO || eggGroups[1][0] === EGG_GROUP_DITTO) {
    if (trainerIds[0] === trainerIds[1]) return PARENTS_LOW_COMPATIBILITY;
    return PARENTS_MED_COMPATIBILITY;
  } else {
    // neither parent is Ditto
    if (genders[0] === genders[1]) return PARENTS_INCOMPATIBLE;
    if (genders[0] === 255 /* MON_GENDERLESS */ || genders[1] === 255 /* MON_GENDERLESS */)
      return PARENTS_INCOMPATIBLE;
    if (!EggGroupsOverlap(eggGroups[0], eggGroups[1])) return PARENTS_INCOMPATIBLE;

    if (species[0] === species[1]) {
      if (trainerIds[0] === trainerIds[1]) return PARENTS_MED_COMPATIBILITY; // same species, same trainer
      return PARENTS_MAX_COMPATIBILITY;                                      // same species, different trainers
    } else {
      if (trainerIds[0] !== trainerIds[1]) return PARENTS_MED_COMPATIBILITY; // different species, different trainers
      return PARENTS_LOW_COMPATIBILITY;                                      // different species, same trainer
    }
  }
}

/** 1:1 décomp `static bool8 TryProduceOrHatchEgg(struct DayCare *daycare)` (daycare.c:879).
 *  `gPlayerPartyCount` global → CalculatePlayerPartyCount() (même valeur, recalculée). */
function TryProduceOrHatchEgg(daycare: DayCare): boolean {
  let validEggs = 0;
  let i: number;

  for (i = 0; i < DAYCARE_MON_COUNT; i++) {
    if (daycare.mons[i].mon && (GetMonData(daycare.mons[i].mon!, MON_DATA_SANITY_HAS_SPECIES) as number)) {
      daycare.mons[i].steps = (daycare.mons[i].steps + 1) >>> 0;
      validEggs++;
    }
  }

  // Check if an egg should be produced
  if (daycare.offspringPersonality === 0 && validEggs === DAYCARE_MON_COUNT
    && (daycare.mons[1].steps & 0xFF) === 0xFF) {
    const compatibility = GetDaycareCompatibilityScore(daycare);
    if (compatibility > Math.floor((Random() * 100) / 65535) /* division entière C */)
      TriggerPendingDaycareEgg();
  }

  // Try to hatch Egg
  daycare.stepCounter = (daycare.stepCounter + 1) & 0xFF;
  if (daycare.stepCounter === 255) {
    const toSub = GetEggCyclesToSubtract();
    const partyCount = CalculatePlayerPartyCount(); // = gPlayerPartyCount

    for (i = 0; i < partyCount; i++) {
      if (!(GetMonData(gPlayerParty[i], MON_DATA_IS_EGG) as number)) continue;
      if (GetMonData(gPlayerParty[i], MON_DATA_SANITY_IS_BAD_EGG) as number) continue;

      let eggCycles = GetMonData(gPlayerParty[i], MON_DATA_FRIENDSHIP) as number;
      if (eggCycles !== 0) {
        if (eggCycles >= toSub) eggCycles -= toSub;
        else eggCycles -= 1;
        SetMonData(gPlayerParty[i], MON_DATA_FRIENDSHIP, eggCycles);
      } else {
        VarSet(0x8004, i); // gSpecialVar_0x8004 = i
        return true;
      }
    }
  }

  return false;
}

/** 1:1 décomp `bool8 ShouldEggHatch(void)` (daycare.c:931). */
export function ShouldEggHatch(): boolean {
  return TryProduceOrHatchEgg(GetDaycareData());
}

export function CreateEgg(speciesEnum: string, setHotSpringsLocation: boolean): Pokemon {
  // 1:1 décomp : CreateMon(mon, species, EGG_HATCH_LEVEL, USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0).
  const mon = createEmptyPokemon();
  CreateMon(mon, (resolveDecompConstant(speciesEnum) as number | undefined) ?? 0, EGG_HATCH_LEVEL,
    32 /* USE_RANDOM_IVS = MAX_PER_STAT_IVS + 1 */, false, 0, OT_ID_PLAYER_ID, 0);
  SetMonData(mon, MON_DATA_POKEBALL, ITEM_POKE_BALL);
  SetMonData(mon, MON_DATA_NICKNAME, getString('gText_EggNickname'));
  SetMonData(mon, MON_DATA_FRIENDSHIP, gSpeciesInfo[mon.species]?.eggCycles ?? 0);
  SetMonData(mon, MON_DATA_MET_LEVEL, 0);
  SetMonData(mon, MON_DATA_LANGUAGE, LANGUAGE_JAPANESE);
  if (setHotSpringsLocation) {
    SetMonData(mon, MON_DATA_MET_LOCATION, METLOC_SPECIAL_EGG);
  }
  SetMonData(mon, MON_DATA_IS_EGG, 1);
  return mon;
}
