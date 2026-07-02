/**
 * daycare.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/daycare.c` (1298 l, 67 fns).
 *
 * Source de vérité (1:1 décomp) : `decomps/pokeemeraude/src/daycare.c`
 *   + `include/constants/daycare.h` + `include/daycare.h`.
 *
 * Pension COMPLÈTE : dépôt/retrait (party menu mode DAYCARE — party_menu.ts),
 * coût/niveaux gagnés, production+hérédité d'œuf (IVs bug Emerald préservé,
 * egg moves, incense, Volt Tackle), compat string, menu niveau (ListMenu),
 * chaîne éclosion (TryProduceOrHatchEgg/ShouldEggHatch — CHEMIN P2.2, vérifiée).
 *
 * Adaptations modèle (assumées, documentées inline) :
 *  - `struct DayCare`/`DaycareMon`/`DaycareMail` vivent dans le SAVE BLOCK
 *    (src/engine/save/save-blocks.ts:599-610, 1:1 global.h:779-800) — ce module
 *    pointe dessus (gSaveBlock1Ptr.daycare). BoxPokemon ≡ Pokemon (modèle
 *    numérique plat unifié) ; slot vide = `null` (⟺ species == SPECIES_NONE).
 *  - Copies de struct C (`a = b`) = CopyMon / copies profondes explicites.
 *  - Sorties par pointeur (`u16 *species`) = valeur de retour.
 *  - `GetCursorSelectionMonId`/`ChooseMonForDaycare` (party_menu.c) : ponts
 *    globalThis posés par party_menu.ts (cycle ESM vérifié via
 *    scripts/find-import-cycle.cjs : party_menu → overworld →
 *    script_pokemon_util → daycare).
 */

// CreateMon NUMÉRIQUE 1:1 (foyer pokemon.c) — remplace la convenience legacy
// engine/pokemon/pokemon:CreateMon(speciesEnum, opts). createEmptyPokemon = la struct cible.
import {
  CreateMon, createEmptyPokemon, GetNatureFromPersonality, GetBoxMonGender,
  GetGenderFromSpeciesAndPersonality, CalculatePlayerPartyCount,
  TryIncrementMonLevel, MonTryLearningNewMove, DeleteFirstMoveAndGiveMoveToMon,
  CalculateMonStats, GiveMoveToMon, GetLevelFromBoxMonExp, GetLevelUpMovesBySpecies,
  CanMonLearnTMHM, BoxMonRestorePP, ZeroMonData, BoxMonToMon, CopyMon,
} from './pokemon';
import { CompactPartySlots } from './pokemon_storage_system';
// 1:1 décomp party_menu.c:4688 `ItemIdToBattleMoveId` — feuille tmhm-moves.ts
// (consommé par BuildEggMoveset, boucle CT/CS du père).
import { ItemIdToBattleMoveId as _ItemIdToBattleMoveId } from './engine/pokemon/tmhm-moves';
import { resolveDecompConstant, reverseDecompConstant } from '../harness/runtime/decomp-constants';
import {
  OT_ID_PLAYER_ID, EGG_GROUP_DITTO, EGG_GROUP_NO_EGGS_DISCOVERED, EGG_GROUPS_PER_MON,
  MON_MALE, MON_FEMALE, MON_GENDERLESS, NUM_STATS, MAX_LEVEL, MON_HAS_MAX_MOVES,
  EVOS_PER_MON,
} from '../include/constants/pokemon';
import {
  GetMonData, SetMonData,
  MON_DATA_POKEBALL, MON_DATA_NICKNAME, MON_DATA_FRIENDSHIP,
  MON_DATA_MET_LEVEL, MON_DATA_LANGUAGE, MON_DATA_MET_LOCATION, MON_DATA_IS_EGG,
  MON_DATA_SPECIES, MON_DATA_PERSONALITY, MON_DATA_OT_ID, MON_DATA_HELD_ITEM,
  MON_DATA_SANITY_HAS_SPECIES, MON_DATA_SANITY_IS_BAD_EGG,
  MON_DATA_MOVE1, MON_DATA_EXP, MON_DATA_LEVEL, MON_DATA_OT_NAME, MON_DATA_MAIL,
  MON_DATA_HP_IV, MON_DATA_ATK_IV, MON_DATA_DEF_IV, MON_DATA_SPEED_IV,
  MON_DATA_SPATK_IV, MON_DATA_SPDEF_IV,
  gPlayerParty,
} from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
import { gSpeciesInfo, getEggMoves as getEggMovesData, getEvolutions } from './engine/data/game-data';
import { getString } from './engine/ui/gba-strings';
import { encodeOwText, GetPlayerName } from './text';
import { FONT_NORMAL, TEXT_SKIP_DRAW, AddTextPrinter, gTextFlags, GetStringRightAlignXOffset } from './text';
import {
  StringCopy, StringCopy_Nickname, StringAppend, StripExtCtrlCodes,
  ConvertIntToDecimalStringN, gStringVar1, gStringVar2, gStringVar3, gStringVar4,
} from './string_util';
import { STR_CONV_MODE_LEFT_ALIGN } from '../include/string_util';
import {
  LANGUAGE_JAPANESE, LANGUAGE_FRENCH, POKEMON_NAME_LENGTH, PLAYER_NAME_LENGTH,
  MAX_MON_MOVES, PARTY_SIZE, MALE, FEMALE, GENDER_COUNT,
} from '../include/constants/global';
import { CHAR_MALE, CHAR_FEMALE, EOS } from '../include/constants/characters';
import {
  ITEM_POKE_BALL, ITEM_NONE, ITEM_EVERSTONE, ITEM_LAX_INCENSE, ITEM_SEA_INCENSE,
  ITEM_LIGHT_BALL, ITEM_TM01, NUM_TECHNICAL_MACHINES, NUM_HIDDEN_MACHINES,
} from '../include/constants/items';
import { MOVE_NONE, MOVE_VOLT_TACKLE } from '../include/constants/moves';
import {
  SPECIES_DITTO, SPECIES_NIDORAN_F, SPECIES_NIDORAN_M, SPECIES_ILLUMISE,
  SPECIES_VOLBEAT, SPECIES_WYNAUT, SPECIES_AZURILL, SPECIES_WOBBUFFET,
  SPECIES_MARILL, SPECIES_PICHU, SPECIES_EGG,
} from '../include/constants/species';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import type { DayCare, DaycareMon, DaycareMail, Mail } from './engine/save/save-blocks';
import { Random, Random2, SeedRng2 } from './random';
import { FlagSet, VarSet, VarGet } from './event_data';
import { FLAG_PENDING_DAYCARE_EGG } from '../include/constants/flags';
import { gMain, getRuntime, JOY_NEW } from '../harness/runtime/decomp-globals';
import { A_BUTTON, B_BUTTON } from '../include/gba/io_reg';
import { gMoveToLearn } from './engine/battle/state';
import { MonHasMail, TakeMailFromMon, GiveMailToMon, ClearMail } from './mail_data';
import { AddWindow, RemoveWindow, CopyWindowToVram } from './window';
import type { WindowTemplate } from './window';
import { DrawStdWindowFrame, ClearStdWindowAndFrame } from './menu';
import {
  ListMenuInit, ListMenu_ProcessInput, DestroyListMenuTask, ListMenuDefaultCursorMoveFunc,
  LIST_NO_MULTIPLE_SCROLL, CURSOR_BLACK_ARROW,
} from './list_menu';
import type { ListMenuTemplate, ListMenuItem } from './list_menu';
import { CreateTask, DestroyTask } from './task';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
import { ScriptContext_Enable } from './script';
// ⚠️ cycle ESM daycare↔egg_hatch assumé : imports de FONCTIONS appelées au runtime
// uniquement (déclarations hoistées, aucun usage top-level) → pas de TDZ.
import { GetEggCyclesToSubtract } from './egg_hatch';

// Re-export des types save-blocks (source unique — l'ancien doublon d'interface
// local otName/monName Uint8Array est DISSOUS ; egg_hatch.ts importe d'ici).
export type { DayCare, DaycareMon, DaycareMail };

// ─── Constantes 1:1 include/constants/daycare.h ─────────────────────────────
// Parent compatibility scores (:5-8).
const PARENTS_INCOMPATIBLE = 0;
const PARENTS_LOW_COMPATIBILITY = 20;
const PARENTS_MED_COMPATIBILITY = 50;
const PARENTS_MAX_COMPATIBILITY = 70;
// Daycare state (:11-14).
export const DAYCARE_NO_MONS = 0;
export const DAYCARE_EGG_WAITING = 1;
export const DAYCARE_ONE_MON = 2;
export const DAYCARE_TWO_MONS = 3;
/** 1:1 décomp `#define INHERITED_IV_COUNT 3` (constants/daycare.h:16). */
const INHERITED_IV_COUNT = 3;
/** 1:1 décomp `#define EGG_HATCH_LEVEL 5` (constants/daycare.h:17). */
export const EGG_HATCH_LEVEL = 5;
/** 1:1 décomp `#define EGG_GENDER_MALE 0x8000` (constants/daycare.h:18). */
const EGG_GENDER_MALE = 0x8000;
/** 1:1 décomp constants/daycare.h:20-21. */
export const DAYCARE_LEVEL_MENU_EXIT = 5;
export const DAYCARE_EXITED_LEVEL_MENU = 2;
/** 1:1 décomp constants/daycare.h:24-25 : EGG_MOVES_ARRAY_COUNT=10 ;
 *  EGG_LVL_UP_MOVES_ARRAY_COUNT = max(MAX_LEVEL_UP_MOVES, 50) = 50. */
const EGG_MOVES_ARRAY_COUNT = 10;
const EGG_LVL_UP_MOVES_ARRAY_COUNT = 50;
/** 1:1 décomp `#define DAYCARE_MON_COUNT 2` (include/daycare.h). */
export const DAYCARE_MON_COUNT = 2;
/** 1:1 décomp `#define METLOC_SPECIAL_EGG 0xFD` (constants/region_map_sections.h). */
const METLOC_SPECIAL_EGG = 0xFD;

// ─── RAM buffers 1:1 daycare.c:33-38 (assist BuildEggMoveset) ────────────────
const sHatchedEggLevelUpMoves: number[] = new Array(EGG_LVL_UP_MOVES_ARRAY_COUNT).fill(0);
const sHatchedEggFatherMoves: number[] = new Array(MAX_MON_MOVES).fill(0);
const sHatchedEggFinalMoves: number[] = new Array(MAX_MON_MOVES).fill(0);
const sHatchedEggEggMoves: number[] = new Array(EGG_MOVES_ARRAY_COUNT).fill(0);
const sHatchedEggMotherMoves: number[] = new Array(MAX_MON_MOVES).fill(0);

// ─── Data 1:1 daycare.c:42-92 ────────────────────────────────────────────────

/** 1:1 décomp `static const struct WindowTemplate sDaycareLevelMenuWindowTemplate`
 *  (daycare.c:42-51). */
const sDaycareLevelMenuWindowTemplate: WindowTemplate = {
  bg: 0,
  tilemapLeft: 15,
  tilemapTop: 1,
  width: 14,
  height: 6,
  paletteNum: 15,
  baseBlock: 8,
};

/** 1:1 décomp `static const struct ListMenuItem sLevelMenuItems[]` (daycare.c:55-60).
 *  Names lazy (getString : strings.json chargé async au boot) — construits dans
 *  ShowDaycareLevelMenu. Indices → VAR_RESULT (cf. commentaire décomp :53-54). */
function _sLevelMenuItems(): ListMenuItem[] {
  return [
    { name: getString('gText_ExpandedPlaceholder_Empty'), id: 0 },
    { name: getString('gText_ExpandedPlaceholder_Empty'), id: 1 },
    { name: getString('gText_Exit'), id: DAYCARE_LEVEL_MENU_EXIT },
  ];
}

/** 1:1 décomp `static const struct ListMenuTemplate sDaycareListMenuLevelTemplate`
 *  (daycare.c:62-82). */
function _sDaycareListMenuLevelTemplate(): ListMenuTemplate {
  return {
    items: _sLevelMenuItems(),
    moveCursorFunc: ListMenuDefaultCursorMoveFunc,
    itemPrintFunc: DaycarePrintMonInfo,
    totalItems: 3,
    maxShowed: 3,
    windowId: 0,
    header_X: 0,
    item_X: 8,
    cursor_X: 0,
    upText_Y: 1,
    cursorPal: 2,
    fillValue: 1,
    cursorShadowPal: 3,
    lettersSpacing: 1,
    itemVerticalPadding: 0,
    scrollMultiple: LIST_NO_MULTIPLE_SCROLL,
    fontId: FONT_NORMAL,
    cursorKind: CURSOR_BLACK_ARROW,
  };
}

/** 1:1 décomp `static const u8 *const sCompatibilityMessages[]` (daycare.c:84-90)
 *  — clés strings.json FR (gDaycareText_*, extraites du décomp). */
const sCompatibilityMessages: readonly string[] = [
  'gDaycareText_GetAlongVeryWell',
  'gDaycareText_GetAlong',
  'gDaycareText_DontLikeOther',
  'gDaycareText_PlayOther',
];

// sJapaneseEggNickname (daycare.c:92, "タマゴ") : notre modèle FR/UTF-8 utilise
// getString('gText_EggNickname') ("OEUF") — cf. CreateEgg (adaptation vérifiée P2.2).

/** = `&gSaveBlock1Ptr->daycare` — le bloc vit dans SaveBlock1 (save-blocks.ts:1169,
 *  emptyDayCare :1383). Init lazy si save antérieure au chantier pension. */
export function GetDaycareData(): DayCare {
  let dc = gSaveBlock1Ptr.daycare as DayCare | undefined;
  if (!dc) {
    dc = {
      mons: [
        { mon: null, mail: _freshDaycareMail(), steps: 0 },
        { mon: null, mail: _freshDaycareMail(), steps: 0 },
      ],
      offspringPersonality: 0, stepCounter: 0,
    };
    gSaveBlock1Ptr.daycare = dc;
  }
  // Migration douce : saves du chantier P2.2 (mail.otName/monName string ou
  // Uint8Array sérialisé en objet ; message = subset {itemId}) → structs complètes.
  for (const dm of dc.mons) {
    const m = dm.mail as unknown as { otName: unknown; monName: unknown; message?: Partial<Mail> };
    if (typeof m.otName === 'string') m.otName = Array.from(encodeOwText(m.otName));
    else if (!Array.isArray(m.otName)) m.otName = new Array(PLAYER_NAME_LENGTH + 1).fill(0);
    if (typeof m.monName === 'string') m.monName = Array.from(encodeOwText(m.monName));
    else if (!Array.isArray(m.monName)) m.monName = new Array(POKEMON_NAME_LENGTH + 1).fill(0);
    if (!m.message || !Array.isArray(m.message.words) || !Array.isArray(m.message.trainerId)) {
      const itemId = m.message?.itemId ?? 0;
      dm.mail.message = _freshMail();
      dm.mail.message.itemId = itemId;
    }
  }
  return dc;
}

/** struct Mail zérotée (= ClearMail sur un objet neuf). */
function _freshMail(): Mail {
  const mail: Mail = { words: [], playerName: [], trainerId: [0, 0, 0, 0], species: 0, itemId: 0 };
  ClearMail(mail);
  return mail;
}

/** struct DaycareMail zérotée (= ClearDaycareMonMail sur un objet neuf). */
function _freshDaycareMail(): DaycareMail {
  const mail: DaycareMail = { message: _freshMail(), otName: [], monName: [], gameLanguage: 0, monLanguage: 0 };
  ClearDaycareMonMail(mail);
  return mail;
}

/** 1:1 décomp `u8 *GetMonNickname2(struct Pokemon *mon, u8 *dest)` (daycare.c:94-99). */
export function GetMonNickname2(mon: Pokemon, dest: Uint8Array): Uint8Array {
  const nickname = encodeOwText(GetMonData(mon, MON_DATA_NICKNAME) as string);
  return StringCopy_Nickname(dest, nickname);
}

/** 1:1 décomp `u8 *GetBoxMonNickname(struct BoxPokemon *mon, u8 *dest)` (daycare.c:101-106). */
export function GetBoxMonNickname(mon: Pokemon, dest: Uint8Array): Uint8Array {
  const nickname = encodeOwText(GetMonData(mon, MON_DATA_NICKNAME) as string);
  return StringCopy_Nickname(dest, nickname);
}

/** 1:1 décomp `u8 CountPokemonInDaycare(struct DayCare *daycare)` (daycare.c:108-120). */
export function CountPokemonInDaycare(daycare: DayCare): number {
  let count = 0;
  for (let i = 0; i < DAYCARE_MON_COUNT; i++) {
    // GetBoxMonData(&mons[i].mon, MON_DATA_SPECIES) != 0 — slot vide = null (⟺ species 0).
    if (daycare.mons[i].mon && (GetMonData(daycare.mons[i].mon!, MON_DATA_SPECIES) as number) !== 0)
      count++;
  }
  return count;
}

/** 1:1 décomp `struct RecordMixingDaycareMail` (include/daycare.h) — struct minimale
 *  pour le miroir (le record mixing n'existe pas chez nous : AUCUN câblage). */
export interface RecordMixingDaycareMail {
  mail: DaycareMail[];
  numDaycareMons: number;
  cantHoldItem: boolean[];
}

/** 1:1 décomp `void InitDaycareMailRecordMixing(struct DayCare *daycare,
 *  struct RecordMixingDaycareMail *mixMail)` (daycare.c:122-145). Porté pour le
 *  miroir intégral — record mixing ABSENT (link) : aucun appelant câblé. */
export function InitDaycareMailRecordMixing(daycare: DayCare, mixMail: RecordMixingDaycareMail): void {
  let numDaycareMons = 0;
  for (let i = 0; i < DAYCARE_MON_COUNT; i++) {
    const mon = daycare.mons[i].mon;
    if (mon && (GetMonData(mon, MON_DATA_SPECIES) as number) !== 0 /* SPECIES_NONE */) {
      numDaycareMons++;
      if ((GetMonData(mon, MON_DATA_HELD_ITEM) as number) === ITEM_NONE)
        mixMail.cantHoldItem[i] = false;
      else
        mixMail.cantHoldItem[i] = true;
    } else {
      // Daycare slot empty
      mixMail.cantHoldItem[i] = true;
    }
  }
  mixMail.numDaycareMons = numDaycareMons;
}

/** 1:1 décomp `static s8 Daycare_FindEmptySpot(struct DayCare *daycare)` (daycare.c:147-158). */
function Daycare_FindEmptySpot(daycare: DayCare): number {
  for (let i = 0; i < DAYCARE_MON_COUNT; i++) {
    if (!daycare.mons[i].mon || (GetMonData(daycare.mons[i].mon!, MON_DATA_SPECIES) as number) === 0)
      return i;
  }
  return -1;
}

/** 1:1 décomp `static void StorePokemonInDaycare(struct Pokemon *mon,
 *  struct DaycareMon *daycareMon)` (daycare.c:160-182). */
function StorePokemonInDaycare(mon: Pokemon, daycareMon: DaycareMon): void {
  if (MonHasMail(mon)) {
    // StringCopy(daycareMon->mail.otName, gSaveBlock2Ptr->playerName)
    const otName = new Uint8Array(PLAYER_NAME_LENGTH + 1);
    StringCopy(otName, GetPlayerName());
    daycareMon.mail.otName = Array.from(otName);
    // GetMonNickname2(mon, daycareMon->mail.monName) + StripExtCtrlCodes
    const monName = new Uint8Array(POKEMON_NAME_LENGTH + 1);
    GetMonNickname2(mon, monName);
    StripExtCtrlCodes(monName);
    daycareMon.mail.monName = Array.from(monName);
    daycareMon.mail.gameLanguage = LANGUAGE_FRENCH;  // GAME_LANGUAGE (= LANGUAGE_FRENCH chez nous)
    daycareMon.mail.monLanguage = GetMonData(mon, MON_DATA_LANGUAGE) as number;
    const mailId = GetMonData(mon, MON_DATA_MAIL) as number;
    // daycareMon->mail.message = gSaveBlock1Ptr->mail[mailId] (copie de struct → copie profonde).
    const src = gSaveBlock1Ptr.mail[mailId] as Mail;
    daycareMon.mail.message = {
      words: [...src.words], playerName: [...src.playerName],
      trainerId: [...src.trainerId], species: src.species, itemId: src.itemId,
    };
    TakeMailFromMon(mon);
  }

  // daycareMon->mon = mon->box (copie struct ; modèle plat → CopyMon sur un objet neuf.
  // NB : copie le Pokemon COMPLET — les champs party (hp/status) sont resetés au
  // retrait par BoxMonToMon, comportement 1:1).
  const box = createEmptyPokemon();
  CopyMon(box, mon);
  daycareMon.mon = box;
  BoxMonRestorePP(daycareMon.mon);
  daycareMon.steps = 0;
  ZeroMonData(mon);
  CompactPartySlots();
  CalculatePlayerPartyCount();
}

/** 1:1 décomp `static void StorePokemonInEmptyDaycareSlot(struct Pokemon *mon,
 *  struct DayCare *daycare)` (daycare.c:184-188). */
function StorePokemonInEmptyDaycareSlot(mon: Pokemon, daycare: DayCare): void {
  const slotId = Daycare_FindEmptySpot(daycare);
  StorePokemonInDaycare(mon, daycare.mons[slotId]);
}

/** = `GetCursorSelectionMonId()` (party_menu.c) via pont globalThis (cycle ESM :
 *  party_menu → overworld → script_pokemon_util → daycare, vérifié find-import-cycle). */
function _GetCursorSelectionMonId(): number {
  const fn = (globalThis as Record<string, unknown>).__GetCursorSelectionMonId as (() => number) | undefined;
  return fn ? fn() : 0;
}

/** 1:1 décomp `void StoreSelectedPokemonInDaycare(void)` (daycare.c:190-194) — special. */
export function StoreSelectedPokemonInDaycare(): void {
  const monId = _GetCursorSelectionMonId();
  StorePokemonInEmptyDaycareSlot(gPlayerParty[monId], GetDaycareData());
}

/** 1:1 décomp `static void ShiftDaycareSlots(struct DayCare *daycare)` (daycare.c:196-211).
 *  Shifts the second daycare Pokémon slot into the first slot. */
function ShiftDaycareSlots(daycare: DayCare): void {
  // This condition is only satisfied when the player takes out the first Pokémon from the daycare.
  if (daycare.mons[1].mon && (GetMonData(daycare.mons[1].mon!, MON_DATA_SPECIES) as number) !== 0
    && (!daycare.mons[0].mon || (GetMonData(daycare.mons[0].mon!, MON_DATA_SPECIES) as number) === 0)) {
    daycare.mons[0].mon = daycare.mons[1].mon;
    daycare.mons[1].mon = null;  // ZeroBoxMonData(&mons[1].mon) — slot vide = null

    daycare.mons[0].mail = daycare.mons[1].mail;     // copie struct → transfert (slot 1 ré-alloué juste après)
    daycare.mons[0].steps = daycare.mons[1].steps;
    daycare.mons[1].steps = 0;
    daycare.mons[1].mail = _freshDaycareMail();      // ClearDaycareMonMail(&mons[1].mail)
  }
}

/** 1:1 décomp `static void ApplyDaycareExperience(struct Pokemon *mon)` (daycare.c:213-241). */
function ApplyDaycareExperience(mon: Pokemon): void {
  for (let i = 0; i < MAX_LEVEL; i++) {
    // Add the mon's gained daycare experience level by level until it can't level up anymore.
    if (TryIncrementMonLevel(mon)) {
      // Teach the mon new moves it learned while in the daycare.
      let firstMove = true;
      let learnedMove: number;
      while ((learnedMove = MonTryLearningNewMove(mon, firstMove)) !== 0) {
        firstMove = false;
        if (learnedMove === MON_HAS_MAX_MOVES)
          DeleteFirstMoveAndGiveMoveToMon(mon, gMoveToLearn);
      }
    } else {
      break;
    }
  }
  // Re-calculate the mons stats at its new level.
  CalculateMonStats(mon);
}

/** 1:1 décomp `static u16 TakeSelectedPokemonFromDaycare(struct DaycareMon *daycareMon)`
 *  (daycare.c:243-272). */
function TakeSelectedPokemonFromDaycare(daycareMon: DaycareMon): number {
  const pokemon = createEmptyPokemon();

  GetBoxMonNickname(daycareMon.mon!, gStringVar1);
  const species = GetMonData(daycareMon.mon!, MON_DATA_SPECIES) as number;
  BoxMonToMon(daycareMon.mon!, pokemon);

  if ((GetMonData(pokemon, MON_DATA_LEVEL) as number) !== MAX_LEVEL) {
    const experience = ((GetMonData(pokemon, MON_DATA_EXP) as number) + daycareMon.steps) >>> 0;
    SetMonData(pokemon, MON_DATA_EXP, experience);
    ApplyDaycareExperience(pokemon);
  }

  CopyMon(gPlayerParty[PARTY_SIZE - 1], pokemon);  // gPlayerParty[PARTY_SIZE-1] = pokemon (copie struct)
  if (daycareMon.mail.message.itemId) {
    GiveMailToMon(gPlayerParty[PARTY_SIZE - 1], daycareMon.mail.message);
    ClearDaycareMonMail(daycareMon.mail);
  }

  daycareMon.mon = null;  // ZeroBoxMonData(&daycareMon->mon)
  daycareMon.steps = 0;
  CompactPartySlots();
  CalculatePlayerPartyCount();
  return species;
}

/** 1:1 décomp `static u16 TakeSelectedPokemonMonFromDaycareShiftSlots(struct DayCare
 *  *daycare, u8 slotId)` (daycare.c:274-279). */
function TakeSelectedPokemonMonFromDaycareShiftSlots(daycare: DayCare, slotId: number): number {
  const species = TakeSelectedPokemonFromDaycare(daycare.mons[slotId]);
  ShiftDaycareSlots(daycare);
  return species;
}

/** 1:1 décomp `u16 TakePokemonFromDaycare(void)` (daycare.c:281-284) — special
 *  (specialvar VAR_RESULT). */
export function TakePokemonFromDaycare(): number {
  return TakeSelectedPokemonMonFromDaycareShiftSlots(GetDaycareData(), VarGet(0x8004) /* gSpecialVar_0x8004 */);
}

/** 1:1 décomp `static u8 GetLevelAfterDaycareSteps(struct BoxPokemon *mon, u32 steps)`
 *  (daycare.c:286-293). ⚠️ CLONE du BoxPokemon (`tempMon = *mon`) — ne mute JAMAIS le slot. */
function GetLevelAfterDaycareSteps(mon: Pokemon, steps: number): number {
  const tempMon = createEmptyPokemon();
  CopyMon(tempMon, mon);  // struct BoxPokemon tempMon = *mon (copie)
  const experience = ((GetMonData(mon, MON_DATA_EXP) as number) + steps) >>> 0;
  SetMonData(tempMon, MON_DATA_EXP, experience);
  return GetLevelFromBoxMonExp(tempMon);
}

/** 1:1 décomp `static u8 GetNumLevelsGainedFromSteps(struct DaycareMon *daycareMon)`
 *  (daycare.c:295-303). */
function GetNumLevelsGainedFromSteps(daycareMon: DaycareMon): number {
  const levelBefore = GetLevelFromBoxMonExp(daycareMon.mon!);
  const levelAfter = GetLevelAfterDaycareSteps(daycareMon.mon!, daycareMon.steps);
  return (levelAfter - levelBefore) & 0xFF;
}

/** 1:1 décomp `static u8 GetNumLevelsGainedForDaycareMon(struct DaycareMon *daycareMon)`
 *  (daycare.c:305-311). gStringVar2 = niveaux, gStringVar1 = nickname. */
function GetNumLevelsGainedForDaycareMon(daycareMon: DaycareMon): number {
  const numLevelsGained = GetNumLevelsGainedFromSteps(daycareMon);
  ConvertIntToDecimalStringN(gStringVar2, numLevelsGained, STR_CONV_MODE_LEFT_ALIGN, 2);
  GetBoxMonNickname(daycareMon.mon!, gStringVar1);
  return numLevelsGained;
}

/** 1:1 décomp `static u32 GetDaycareCostForSelectedMon(struct DaycareMon *daycareMon)`
 *  (daycare.c:313-322) : cost = 100 + 100 * niveaux gagnés. */
function GetDaycareCostForSelectedMon(daycareMon: DaycareMon): number {
  const numLevelsGained = GetNumLevelsGainedFromSteps(daycareMon);
  GetBoxMonNickname(daycareMon.mon!, gStringVar1);
  const cost = 100 + 100 * numLevelsGained;
  ConvertIntToDecimalStringN(gStringVar2, cost, STR_CONV_MODE_LEFT_ALIGN, 5);
  return cost;
}

/** 1:1 décomp `static u16 GetDaycareCostForMon(struct DayCare *daycare, u8 slotId)`
 *  (daycare.c:324-327). */
function GetDaycareCostForMon(daycare: DayCare, slotId: number): number {
  return GetDaycareCostForSelectedMon(daycare.mons[slotId]) & 0xFFFF;
}

/** 1:1 décomp `void GetDaycareCost(void)` (daycare.c:329-332) — special :
 *  gSpecialVar_0x8005 = coût du mon en slot gSpecialVar_0x8004. */
export function GetDaycareCost(): void {
  VarSet(0x8005, GetDaycareCostForMon(GetDaycareData(), VarGet(0x8004)));
}

/** 1:1 décomp `static void UNUSED Debug_AddDaycareSteps(u16 numSteps)` (daycare.c:334-338)
 *  — UNUSED décomp, porté pour le miroir (utile en sonde dev). */
export function Debug_AddDaycareSteps(numSteps: number): void {
  const daycare = GetDaycareData();
  daycare.mons[0].steps = (daycare.mons[0].steps + numSteps) >>> 0;
  daycare.mons[1].steps = (daycare.mons[1].steps + numSteps) >>> 0;
}

/** 1:1 décomp `u8 GetNumLevelsGainedFromDaycare(void)` (daycare.c:340-346) — special
 *  (specialvar VAR_RESULT ; bufferise gStringVar1/2 pour le msgbox « a grandi de X niveaux »). */
export function GetNumLevelsGainedFromDaycare(): number {
  const daycare = GetDaycareData();
  const slot = VarGet(0x8004);  // gSpecialVar_0x8004
  if (daycare.mons[slot].mon && (GetMonData(daycare.mons[slot].mon!, MON_DATA_SPECIES) as number) !== 0)
    return GetNumLevelsGainedForDaycareMon(daycare.mons[slot]);
  return 0;
}

/** 1:1 décomp `static void ClearDaycareMonMail(struct DaycareMail *mail)` (daycare.c:348-358). */
function ClearDaycareMonMail(mail: DaycareMail): void {
  const otName: number[] = [];
  for (let i = 0; i < PLAYER_NAME_LENGTH + 1; i++) otName[i] = 0;
  mail.otName = otName;
  const monName: number[] = [];
  for (let i = 0; i < POKEMON_NAME_LENGTH + 1; i++) monName[i] = 0;
  mail.monName = monName;
  ClearMail(mail.message);
}

/** 1:1 décomp `static void ClearDaycareMon(struct DaycareMon *daycareMon)` (daycare.c:360-365). */
function ClearDaycareMon(daycareMon: DaycareMon): void {
  daycareMon.mon = null;  // ZeroBoxMonData
  daycareMon.steps = 0;
  ClearDaycareMonMail(daycareMon.mail);
}

/** 1:1 décomp `static void UNUSED ClearAllDaycareData(struct DayCare *daycare)`
 *  (daycare.c:367-376) — UNUSED décomp, porté pour le miroir. */
export function ClearAllDaycareData(daycare: DayCare): void {
  for (let i = 0; i < DAYCARE_MON_COUNT; i++)
    ClearDaycareMon(daycare.mons[i]);
  daycare.offspringPersonality = 0;
  daycare.stepCounter = 0;
}

/** 1:1 décomp `static u16 GetEggSpecies(u16 species)` (daycare.c:378-412) :
 *  remonte la chaîne d'évolution à l'envers (jusqu'à EVOS_PER_MON fois) en
 *  scannant TOUTES les espèces j ∈ [1, NUM_SPECIES) × leurs évolutions.
 *  Data : evolutions.json (⟺ gEvolutionTable, diff 1:1 vérifié). */
function GetEggSpecies(species: number): number {
  const NUM_SPECIES = SPECIES_EGG;  // 1:1 constants/species.h : NUM_SPECIES = SPECIES_EGG
  // Working backwards up to 5 times seems arbitrary, since the maximum number
  // of times would only be 3 for 3-stage evolutions.
  for (let i = 0; i < EVOS_PER_MON; i++) {
    let found = false;
    let j: number;
    for (j = 1; j < NUM_SPECIES; j++) {
      const jKey = reverseDecompConstant(j, 'SPECIES_');
      const evos = jKey ? getEvolutions(jKey) : [];
      for (let k = 0; k < EVOS_PER_MON && k < evos.length; k++) {
        if (((resolveDecompConstant(evos[k].target) as number | undefined) ?? 0) === species) {
          species = j;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (j === NUM_SPECIES) break;
  }
  return species;
}

/** 1:1 décomp `static s32 GetParentToInheritNature(struct DayCare *daycare)` (daycare.c:414-453). */
function GetParentToInheritNature(daycare: DayCare): number {
  const species: number[] = [0, 0];
  let dittoCount: number;
  let i: number;
  let parent = -1;

  // search for female gender
  for (i = 0; i < DAYCARE_MON_COUNT; i++) {
    if (daycare.mons[i].mon && GetBoxMonGender(daycare.mons[i].mon!) === MON_FEMALE)
      parent = i;
  }

  // search for ditto
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
  if (parent < 0
    || (GetMonData(daycare.mons[parent].mon!, MON_DATA_HELD_ITEM) as number) !== ITEM_EVERSTONE
    || Random() >= 32767 /* USHRT_MAX / 2 */) {
    return -1;
  }

  return parent;
}

/** 1:1 décomp `static void _TriggerPendingDaycareEgg(struct DayCare *daycare)` (daycare.c:455-487).
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

/** 1:1 décomp `static void _TriggerPendingDaycareMaleEgg(...)` (daycare.c:490-494) —
 *  "Functionally unused" dans la décomp ; porté pour le miroir intégral. */
function _TriggerPendingDaycareMaleEgg(daycare: DayCare): void {
  daycare.offspringPersonality = (Random() | EGG_GENDER_MALE) >>> 0;
  FlagSet(FLAG_PENDING_DAYCARE_EGG);
}

/** 1:1 décomp `void TriggerPendingDaycareEgg(void)` (daycare.c:496-499). */
export function TriggerPendingDaycareEgg(): void {
  _TriggerPendingDaycareEgg(GetDaycareData());
}

/** 1:1 décomp `static void UNUSED TriggerPendingDaycareMaleEgg(void)` (daycare.c:501-504). */
export function TriggerPendingDaycareMaleEgg(): void {
  _TriggerPendingDaycareMaleEgg(GetDaycareData());
}

/** 1:1 décomp `static void RemoveIVIndexFromList(u8 *ivs, u8 selectedIv)` (daycare.c:506-525) :
 *  retire l'index sélectionné de la liste d'IVs et décale à gauche. */
function RemoveIVIndexFromList(ivs: number[], selectedIv: number): void {
  const temp: number[] = new Array(NUM_STATS);

  ivs[selectedIv] = 0xFF;
  for (let i = 0; i < NUM_STATS; i++) {
    temp[i] = ivs[i];
  }

  let j = 0;
  for (let i = 0; i < NUM_STATS; i++) {
    if (temp[i] !== 0xFF)
      ivs[j++] = temp[i];
  }
}

/** 1:1 décomp `static void InheritIVs(struct Pokemon *egg, struct DayCare *daycare)`
 *  (daycare.c:527-597). ⚠️ CONSERVE LE BUG EMERALD (#ifndef BUGFIX, daycare.c:550-552) :
 *  `RemoveIVIndexFromList(availableIVs, i)` retire la POSITION i (HP, puis DEF décalée,
 *  puis 2) au lieu de l'index tiré → HP/DEF moins hérités + doublons possibles. */
function InheritIVs(egg: Pokemon, daycare: DayCare): void {
  let i: number;
  const selectedIvs: number[] = new Array(INHERITED_IV_COUNT);
  const availableIVs: number[] = new Array(NUM_STATS);
  const whichParents: number[] = new Array(INHERITED_IV_COUNT);
  let iv: number;

  // Initialize a list of IV indices.
  for (i = 0; i < NUM_STATS; i++) {
    availableIVs[i] = i;
  }

  // Select the 3 IVs that will be inherited.
  for (i = 0; i < INHERITED_IV_COUNT; i++) {
    // 1:1 #ifndef BUGFIX (Emerald) — voir doc ci-dessus.
    selectedIvs[i] = availableIVs[Random() % (NUM_STATS - i)];
    RemoveIVIndexFromList(availableIVs, i);
  }

  // Determine which parent each of the selected IVs should inherit from.
  for (i = 0; i < INHERITED_IV_COUNT; i++) {
    whichParents[i] = Random() % DAYCARE_MON_COUNT;
  }

  // Set each of inherited IVs on the egg mon.
  for (i = 0; i < INHERITED_IV_COUNT; i++) {
    switch (selectedIvs[i]) {
      case 0:
        iv = GetMonData(daycare.mons[whichParents[i]].mon!, MON_DATA_HP_IV) as number;
        SetMonData(egg, MON_DATA_HP_IV, iv);
        break;
      case 1:
        iv = GetMonData(daycare.mons[whichParents[i]].mon!, MON_DATA_ATK_IV) as number;
        SetMonData(egg, MON_DATA_ATK_IV, iv);
        break;
      case 2:
        iv = GetMonData(daycare.mons[whichParents[i]].mon!, MON_DATA_DEF_IV) as number;
        SetMonData(egg, MON_DATA_DEF_IV, iv);
        break;
      case 3:
        iv = GetMonData(daycare.mons[whichParents[i]].mon!, MON_DATA_SPEED_IV) as number;
        SetMonData(egg, MON_DATA_SPEED_IV, iv);
        break;
      case 4:
        iv = GetMonData(daycare.mons[whichParents[i]].mon!, MON_DATA_SPATK_IV) as number;
        SetMonData(egg, MON_DATA_SPATK_IV, iv);
        break;
      case 5:
        iv = GetMonData(daycare.mons[whichParents[i]].mon!, MON_DATA_SPDEF_IV) as number;
        SetMonData(egg, MON_DATA_SPDEF_IV, iv);
        break;
    }
  }
}

/** 1:1 décomp `static u8 GetEggMoves(struct Pokemon *pokemon, u16 *eggMoves)`
 *  (daycare.c:599-630). Data : egg-moves.json = LA table gEggMoves découpée par
 *  espèce (le scan du marqueur `species + EGG_MOVES_SPECIES_OFFSET` ⟺ lookup clé ;
 *  ordre décomp préservé ; cap EGG_MOVES_ARRAY_COUNT identique). */
function GetEggMoves(pokemon: Pokemon, eggMoves: number[]): number {
  let numEggMoves = 0;
  const species = GetMonData(pokemon, MON_DATA_SPECIES) as number;
  const speciesKey = reverseDecompConstant(species, 'SPECIES_');
  const list = speciesKey ? getEggMovesData(speciesKey) : [];
  for (let i = 0; i < EGG_MOVES_ARRAY_COUNT; i++) {
    if (i >= list.length) break;  // ⟺ gEggMoves[eggMoveIdx + i] > EGG_MOVES_SPECIES_OFFSET
    eggMoves[i] = (resolveDecompConstant(list[i]) as number | undefined) ?? 0;
    numEggMoves++;
  }
  return numEggMoves;
}

/** 1:1 décomp `static void BuildEggMoveset(struct Pokemon *egg, struct BoxPokemon
 *  *father, struct BoxPokemon *mother)` (daycare.c:632-718). */
function BuildEggMoveset(egg: Pokemon, father: Pokemon, mother: Pokemon): void {
  let numSharedParentMoves = 0;
  let i: number, j: number;

  for (i = 0; i < MAX_MON_MOVES; i++) {
    sHatchedEggMotherMoves[i] = MOVE_NONE;
    sHatchedEggFatherMoves[i] = MOVE_NONE;
    sHatchedEggFinalMoves[i] = MOVE_NONE;
  }
  for (i = 0; i < EGG_MOVES_ARRAY_COUNT; i++)
    sHatchedEggEggMoves[i] = MOVE_NONE;
  for (i = 0; i < EGG_LVL_UP_MOVES_ARRAY_COUNT; i++)
    sHatchedEggLevelUpMoves[i] = MOVE_NONE;

  const numLevelUpMoves = GetLevelUpMovesBySpecies(GetMonData(egg, MON_DATA_SPECIES) as number, sHatchedEggLevelUpMoves);
  for (i = 0; i < MAX_MON_MOVES; i++) {
    sHatchedEggFatherMoves[i] = GetMonData(father, MON_DATA_MOVE1 + i) as number;
    sHatchedEggMotherMoves[i] = GetMonData(mother, MON_DATA_MOVE1 + i) as number;
  }

  const numEggMoves = GetEggMoves(egg, sHatchedEggEggMoves);

  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (sHatchedEggFatherMoves[i] !== MOVE_NONE) {
      for (j = 0; j < numEggMoves; j++) {
        if (sHatchedEggFatherMoves[i] === sHatchedEggEggMoves[j]) {
          if (GiveMoveToMon(egg, sHatchedEggFatherMoves[i]) === MON_HAS_MAX_MOVES)
            DeleteFirstMoveAndGiveMoveToMon(egg, sHatchedEggFatherMoves[i]);
          break;
        }
      }
    } else {
      break;
    }
  }
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (sHatchedEggFatherMoves[i] !== MOVE_NONE) {
      for (j = 0; j < NUM_TECHNICAL_MACHINES + NUM_HIDDEN_MACHINES; j++) {
        // ItemIdToBattleMoveId retourne la clé enum 'MOVE_X' (tmhm-moves.ts) → id.
        const tmhmMove = (resolveDecompConstant(_ItemIdToBattleMoveId(ITEM_TM01 + j)) as number | undefined) ?? 0;
        if (sHatchedEggFatherMoves[i] === tmhmMove && CanMonLearnTMHM(egg, j)) {
          if (GiveMoveToMon(egg, sHatchedEggFatherMoves[i]) === MON_HAS_MAX_MOVES)
            DeleteFirstMoveAndGiveMoveToMon(egg, sHatchedEggFatherMoves[i]);
        }
      }
    }
  }
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (sHatchedEggFatherMoves[i] === MOVE_NONE)
      break;
    for (j = 0; j < MAX_MON_MOVES; j++) {
      if (sHatchedEggFatherMoves[i] === sHatchedEggMotherMoves[j] && sHatchedEggFatherMoves[i] !== MOVE_NONE)
        sHatchedEggFinalMoves[numSharedParentMoves++] = sHatchedEggFatherMoves[i];
    }
  }

  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (sHatchedEggFinalMoves[i] === MOVE_NONE)
      break;
    for (j = 0; j < numLevelUpMoves; j++) {
      if (sHatchedEggLevelUpMoves[j] !== MOVE_NONE && sHatchedEggFinalMoves[i] === sHatchedEggLevelUpMoves[j]) {
        if (GiveMoveToMon(egg, sHatchedEggFinalMoves[i]) === MON_HAS_MAX_MOVES)
          DeleteFirstMoveAndGiveMoveToMon(egg, sHatchedEggFinalMoves[i]);
        break;
      }
    }
  }
}

/** 1:1 décomp `static void RemoveEggFromDayCare(struct DayCare *daycare)` (daycare.c:720-724). */
function RemoveEggFromDayCare(daycare: DayCare): void {
  daycare.offspringPersonality = 0;
  daycare.stepCounter = 0;
}

/** 1:1 décomp `void RejectEggFromDayCare(void)` (daycare.c:726-729) — special. */
export function RejectEggFromDayCare(): void {
  RemoveEggFromDayCare(GetDaycareData());
}

/** 1:1 décomp `static void AlterEggSpeciesWithIncenseItem(u16 *species, struct DayCare
 *  *daycare)` (daycare.c:731-748). Sortie par pointeur → valeur de retour (adaptation). */
function AlterEggSpeciesWithIncenseItem(species: number, daycare: DayCare): number {
  if (species === SPECIES_WYNAUT || species === SPECIES_AZURILL) {
    const motherItem = daycare.mons[0].mon ? (GetMonData(daycare.mons[0].mon!, MON_DATA_HELD_ITEM) as number) : 0;
    const fatherItem = daycare.mons[1].mon ? (GetMonData(daycare.mons[1].mon!, MON_DATA_HELD_ITEM) as number) : 0;
    if (species === SPECIES_WYNAUT && motherItem !== ITEM_LAX_INCENSE && fatherItem !== ITEM_LAX_INCENSE) {
      species = SPECIES_WOBBUFFET;
    }
    if (species === SPECIES_AZURILL && motherItem !== ITEM_SEA_INCENSE && fatherItem !== ITEM_SEA_INCENSE) {
      species = SPECIES_MARILL;
    }
  }
  return species;
}

/** 1:1 décomp `static void GiveVoltTackleIfLightBall(struct Pokemon *mon, struct DayCare
 *  *daycare)` (daycare.c:750-760). */
function GiveVoltTackleIfLightBall(mon: Pokemon, daycare: DayCare): void {
  const motherItem = daycare.mons[0].mon ? (GetMonData(daycare.mons[0].mon!, MON_DATA_HELD_ITEM) as number) : 0;
  const fatherItem = daycare.mons[1].mon ? (GetMonData(daycare.mons[1].mon!, MON_DATA_HELD_ITEM) as number) : 0;

  if (motherItem === ITEM_LIGHT_BALL || fatherItem === ITEM_LIGHT_BALL) {
    if (GiveMoveToMon(mon, MOVE_VOLT_TACKLE) === MON_HAS_MAX_MOVES)
      DeleteFirstMoveAndGiveMoveToMon(mon, MOVE_VOLT_TACKLE);
  }
}

/** 1:1 décomp `static u16 DetermineEggSpeciesAndParentSlots(struct DayCare *daycare,
 *  u8 *parentSlots)` (daycare.c:762-802). */
function DetermineEggSpeciesAndParentSlots(daycare: DayCare, parentSlots: number[]): number {
  const species: number[] = [0, 0];

  for (let i = 0; i < DAYCARE_MON_COUNT; i++) {
    species[i] = daycare.mons[i].mon ? (GetMonData(daycare.mons[i].mon!, MON_DATA_SPECIES) as number) : 0;
    if (species[i] === SPECIES_DITTO) {
      parentSlots[0] = i ^ 1;
      parentSlots[1] = i;
    } else if (daycare.mons[i].mon && GetBoxMonGender(daycare.mons[i].mon!) === MON_FEMALE) {
      parentSlots[0] = i;
      parentSlots[1] = i ^ 1;
    }
  }

  let eggSpecies = GetEggSpecies(species[parentSlots[0]]);
  if (eggSpecies === SPECIES_NIDORAN_F && (daycare.offspringPersonality & EGG_GENDER_MALE)) {
    eggSpecies = SPECIES_NIDORAN_M;
  }
  if (eggSpecies === SPECIES_ILLUMISE && (daycare.offspringPersonality & EGG_GENDER_MALE)) {
    eggSpecies = SPECIES_VOLBEAT;
  }

  // Make Ditto the "mother" slot if the other daycare mon is male.
  if (species[parentSlots[1]] === SPECIES_DITTO
    && daycare.mons[parentSlots[0]].mon && GetBoxMonGender(daycare.mons[parentSlots[0]].mon!) !== MON_FEMALE) {
    const ditto = parentSlots[1];
    parentSlots[1] = parentSlots[0];
    parentSlots[0] = ditto;
  }

  return eggSpecies;
}

/** 1:1 décomp `static void _GiveEggFromDaycare(struct DayCare *daycare)` (daycare.c:804-826). */
function _GiveEggFromDaycare(daycare: DayCare): void {
  const egg = createEmptyPokemon();
  const parentSlots: number[] = [0, 0];

  let species = DetermineEggSpeciesAndParentSlots(daycare, parentSlots);
  species = AlterEggSpeciesWithIncenseItem(species, daycare);
  SetInitialEggData(egg, species, daycare);
  InheritIVs(egg, daycare);
  BuildEggMoveset(egg, daycare.mons[parentSlots[1]].mon!, daycare.mons[parentSlots[0]].mon!);

  if (species === SPECIES_PICHU)
    GiveVoltTackleIfLightBall(egg, daycare);

  SetMonData(egg, MON_DATA_IS_EGG, 1);  // isEgg = TRUE
  CopyMon(gPlayerParty[PARTY_SIZE - 1], egg);  // gPlayerParty[PARTY_SIZE-1] = egg (copie struct)
  CompactPartySlots();
  CalculatePlayerPartyCount();
  RemoveEggFromDayCare(daycare);
}

/** 1:1 décomp `void CreateEgg(struct Pokemon *mon, u16 species, bool8 setHotSpringsLocation)`
 *  (daycare.c:828-853). Adaptations (vérifiées P2.2) : CreateMon écrit `mon` en place ;
 *  nickname œuf = getString('gText_EggNickname') ("OEUF" — modèle FR/UTF-8, cohérent
 *  avec l'affichage isEgg) au lieu du sJapaneseEggNickname タマゴ ; eggCycles via
 *  gSpeciesInfo[species] (table id-indexée). */
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

/** 1:1 décomp `static void SetInitialEggData(struct Pokemon *mon, u16 species,
 *  struct DayCare *daycare)` (daycare.c:855-872). Mêmes adaptations que CreateEgg. */
function SetInitialEggData(mon: Pokemon, species: number, daycare: DayCare): void {
  const personality = daycare.offspringPersonality;
  CreateMon(mon, species, EGG_HATCH_LEVEL, 32 /* USE_RANDOM_IVS */, true, personality, OT_ID_PLAYER_ID, 0);
  SetMonData(mon, MON_DATA_POKEBALL, ITEM_POKE_BALL);
  SetMonData(mon, MON_DATA_NICKNAME, getString('gText_EggNickname'));
  SetMonData(mon, MON_DATA_FRIENDSHIP, gSpeciesInfo[species]?.eggCycles ?? 0);
  SetMonData(mon, MON_DATA_MET_LEVEL, 0);
  SetMonData(mon, MON_DATA_LANGUAGE, LANGUAGE_JAPANESE);
}

/** 1:1 décomp `void GiveEggFromDaycare(void)` (daycare.c:874-877) — special. */
export function GiveEggFromDaycare(): void {
  _GiveEggFromDaycare(GetDaycareData());
}

/** 1:1 décomp `static bool8 TryProduceOrHatchEgg(struct DayCare *daycare)` (daycare.c:879-929).
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

/** 1:1 décomp `bool8 ShouldEggHatch(void)` (daycare.c:931-934). */
export function ShouldEggHatch(): boolean {
  return TryProduceOrHatchEgg(GetDaycareData());
}

/** 1:1 décomp `static bool8 IsEggPending(struct DayCare *daycare)` (daycare.c:936-939). */
function IsEggPending(daycare: DayCare): boolean {
  return daycare.offspringPersonality !== 0;
}

/** 1:1 décomp `static void _GetDaycareMonNicknames(struct DayCare *daycare)` (daycare.c:944-958) :
 *  gStringVar1 = nickname mon 1 · gStringVar2 = nickname mon 2 · gStringVar3 = OT mon 1. */
function _GetDaycareMonNicknames(daycare: DayCare): void {
  const otName = new Uint8Array(12);  // u8 otName[max(12, PLAYER_NAME_LENGTH + 1)]
  if (daycare.mons[0].mon && (GetMonData(daycare.mons[0].mon!, MON_DATA_SPECIES) as number) !== 0) {
    GetBoxMonNickname(daycare.mons[0].mon!, gStringVar1);
    // GetBoxMonData(MON_DATA_OT_NAME, otName) : OT name = JS string chez nous → encode.
    StringCopy(otName, encodeOwText(GetMonData(daycare.mons[0].mon!, MON_DATA_OT_NAME) as string));
    StringCopy(gStringVar3, otName);
  }

  if (daycare.mons[1].mon && (GetMonData(daycare.mons[1].mon!, MON_DATA_SPECIES) as number) !== 0) {
    GetBoxMonNickname(daycare.mons[1].mon!, gStringVar2);
  }
}

/** 1:1 décomp `u16 GetSelectedMonNicknameAndSpecies(void)` (daycare.c:960-964) — special
 *  (specialvar VAR_0x8005 = species ; gStringVar1 = nickname du mon sélectionné). */
export function GetSelectedMonNicknameAndSpecies(): number {
  const mon = gPlayerParty[_GetCursorSelectionMonId()];
  GetBoxMonNickname(mon, gStringVar1);
  return GetMonData(mon, MON_DATA_SPECIES) as number;
}

/** 1:1 décomp `void GetDaycareMonNicknames(void)` (daycare.c:966-969) — special. */
export function GetDaycareMonNicknames(): void {
  _GetDaycareMonNicknames(GetDaycareData());
}

/** 1:1 décomp `u8 GetDaycareState(void)` (daycare.c:971-986) — special
 *  (specialvar VAR_RESULT : DAYCARE_NO_MONS/EGG_WAITING/ONE_MON/TWO_MONS). */
export function GetDaycareState(): number {
  if (IsEggPending(GetDaycareData())) {
    return DAYCARE_EGG_WAITING;
  }

  const numMons = CountPokemonInDaycare(GetDaycareData());
  if (numMons !== 0) {
    return numMons + 1; // DAYCARE_ONE_MON or DAYCARE_TWO_MONS
  }

  return DAYCARE_NO_MONS;
}

/** 1:1 décomp `static u8 UNUSED GetDaycarePokemonCount(void)` (daycare.c:988-995)
 *  — UNUSED décomp, porté pour le miroir. */
export function GetDaycarePokemonCount(): number {
  const ret = CountPokemonInDaycare(GetDaycareData());
  if (ret)
    return ret;
  return 0;
}

/** eggGroups data (strings 'EGG_GROUP_X') → valeur numérique décomp. */
function _eggGroup(name: string | undefined): number {
  return name ? ((resolveDecompConstant(name) as number | undefined) ?? 0) : 0;
}

/** 1:1 décomp `static bool8 EggGroupsOverlap(u16 *eggGroups1, u16 *eggGroups2)`
 *  (daycare.c:999-1013). */
function EggGroupsOverlap(eggGroups1: number[], eggGroups2: number[]): boolean {
  for (let i = 0; i < EGG_GROUPS_PER_MON; i++) {
    for (let j = 0; j < EGG_GROUPS_PER_MON; j++) {
      if (eggGroups1[i] === eggGroups2[j]) return true;
    }
  }
  return false;
}

/** 1:1 décomp `static u8 GetDaycareCompatibilityScore(struct DayCare *daycare)`
 *  (daycare.c:1015-1075). */
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
    if (genders[0] === MON_GENDERLESS || genders[1] === MON_GENDERLESS)
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

/** 1:1 décomp `static u8 GetDaycareCompatibilityScoreFromSave(void)` (daycare.c:1077-1080). */
function GetDaycareCompatibilityScoreFromSave(): number {
  return GetDaycareCompatibilityScore(GetDaycareData());
}

/** 1:1 décomp `void SetDaycareCompatibilityString(void)` (daycare.c:1082-1099) — special :
 *  gStringVar4 = message de compatibilité (lu par ShowFieldMessageStringVar4). */
export function SetDaycareCompatibilityString(): void {
  let whichString: number;

  const relationshipScore = GetDaycareCompatibilityScoreFromSave();
  whichString = 0;
  if (relationshipScore === PARENTS_INCOMPATIBLE)
    whichString = 3;
  if (relationshipScore === PARENTS_LOW_COMPATIBILITY)
    whichString = 2;
  if (relationshipScore === PARENTS_MED_COMPATIBILITY)
    whichString = 1;
  if (relationshipScore === PARENTS_MAX_COMPATIBILITY)
    whichString = 0;

  StringCopy(gStringVar4, encodeOwText(getString(sCompatibilityMessages[whichString])));
}

/** 1:1 décomp `bool8 NameHasGenderSymbol(const u8 *name, u8 genderRatio)`
 *  (daycare.c:1101-1121). */
export function NameHasGenderSymbol(name: Uint8Array, genderRatio: number): boolean {
  const symbolsCount: number[] = new Array(GENDER_COUNT);
  symbolsCount[MALE] = symbolsCount[FEMALE] = 0;

  // `i < name.length` = borne mémoire du buffer (un buffer sans EOS lirait
  // au-delà en C ; en TS `undefined !== EOS` bouclerait à l'infini).
  for (let i = 0; i < name.length && name[i] !== EOS; i++) {
    if (name[i] === CHAR_MALE)
      symbolsCount[MALE]++;
    if (name[i] === CHAR_FEMALE)
      symbolsCount[FEMALE]++;
  }

  if (genderRatio === MON_MALE && symbolsCount[MALE] !== 0 && symbolsCount[FEMALE] === 0)
    return true;
  if (genderRatio === MON_FEMALE && symbolsCount[FEMALE] !== 0 && symbolsCount[MALE] === 0)
    return true;

  return false;
}

/** 1:1 décomp `static u8 *AppendGenderSymbol(u8 *name, u8 gender)` (daycare.c:1123-1137).
 *  gText_MaleSymbol4 "♂" / gText_FemaleSymbol4 "♀" / gText_GenderlessSymbol "" (FR). */
function AppendGenderSymbol(name: Uint8Array, gender: number): Uint8Array {
  if (gender === MON_MALE) {
    if (!NameHasGenderSymbol(name, MON_MALE))
      return StringAppend(name, encodeOwText(getString('gText_MaleSymbol4')));
  } else if (gender === MON_FEMALE) {
    if (!NameHasGenderSymbol(name, MON_FEMALE))
      return StringAppend(name, encodeOwText(getString('gText_FemaleSymbol4')));
  }
  return StringAppend(name, encodeOwText(getString('gText_GenderlessSymbol')));
}

/** 1:1 décomp `static u8 *AppendMonGenderSymbol(u8 *name, struct BoxPokemon *boxMon)`
 *  (daycare.c:1139-1142). */
function AppendMonGenderSymbol(name: Uint8Array, boxMon: Pokemon): Uint8Array {
  return AppendGenderSymbol(name, GetBoxMonGender(boxMon));
}

/** 1:1 décomp `static void UNUSED GetDaycareLevelMenuText(struct DayCare *daycare, u8 *dest)`
 *  (daycare.c:1144-1161) — UNUSED décomp, porté pour le miroir. */
export function GetDaycareLevelMenuText(daycare: DayCare, dest: Uint8Array): void {
  const monNames: Uint8Array[] = [];

  dest[0] = EOS;
  for (let i = 0; i < DAYCARE_MON_COUNT; i++) {
    monNames[i] = new Uint8Array(20);  // POKEMON_NAME_BUFFER_SIZE
    GetBoxMonNickname(daycare.mons[i].mon!, monNames[i]);
    AppendMonGenderSymbol(monNames[i], daycare.mons[i].mon!);
  }

  StringCopy(dest, monNames[0]);
  StringAppend(dest, encodeOwText(getString('gText_NewLine2')));
  StringAppend(dest, monNames[1]);
  StringAppend(dest, encodeOwText(getString('gText_NewLine2')));
  StringAppend(dest, encodeOwText(getString('gText_Exit4')));
}

/** 1:1 décomp `static void UNUSED GetDaycareLevelMenuLevelText(struct DayCare *daycare,
 *  u8 *dest)` (daycare.c:1163-1178) — UNUSED décomp, porté pour le miroir. */
export function GetDaycareLevelMenuLevelText(daycare: DayCare, dest: Uint8Array): void {
  const text = new Uint8Array(20);

  dest[0] = EOS;
  for (let i = 0; i < DAYCARE_MON_COUNT; i++) {
    StringAppend(dest, encodeOwText(getString('gText_Lv')));
    const level = GetLevelAfterDaycareSteps(daycare.mons[i].mon!, daycare.mons[i].steps);
    ConvertIntToDecimalStringN(text, level, STR_CONV_MODE_LEFT_ALIGN, 3);
    StringAppend(dest, text);
    StringAppend(dest, encodeOwText(getString('gText_NewLine2')));
  }
}

/** 1:1 décomp `static void DaycareAddTextPrinter(u8 windowId, const u8 *text, u32 x, u32 y)`
 *  (daycare.c:1180-1200). */
function DaycareAddTextPrinter(windowId: number, text: Uint8Array, x: number, y: number): void {
  gTextFlags.useAlternateDownArrow = false;  // 1:1 :1192
  AddTextPrinter({
    str: text,           // printer.currentChar = text
    windowId,
    fontId: FONT_NORMAL,
    x,
    y,
    letterSpacing: 0,
    lineSpacing: 1,
    fgColor: 2,
    bgColor: 1,
    shadowColor: 3,
  }, TEXT_SKIP_DRAW, null);
}

/** 1:1 décomp `static void DaycarePrintMonNickname(struct DayCare *daycare, u8 windowId,
 *  u32 daycareSlotId, u32 y)` (daycare.c:1202-1208). */
function DaycarePrintMonNickname(daycare: DayCare, windowId: number, daycareSlotId: number, y: number): void {
  const nickname = new Uint8Array(20);  // POKEMON_NAME_BUFFER_SIZE
  GetBoxMonNickname(daycare.mons[daycareSlotId].mon!, nickname);
  AppendMonGenderSymbol(nickname, daycare.mons[daycareSlotId].mon!);
  DaycareAddTextPrinter(windowId, nickname, 8, y);
}

/** 1:1 décomp `static void DaycarePrintMonLvl(struct DayCare *daycare, u8 windowId,
 *  u32 daycareSlotId, u32 y)` (daycare.c:1210-1223). */
function DaycarePrintMonLvl(daycare: DayCare, windowId: number, daycareSlotId: number, y: number): void {
  const lvlText = new Uint8Array(12);
  const intText = new Uint8Array(8);

  StringCopy(lvlText, encodeOwText(getString('gText_Lv')));
  const level = GetLevelAfterDaycareSteps(daycare.mons[daycareSlotId].mon!, daycare.mons[daycareSlotId].steps);
  ConvertIntToDecimalStringN(intText, level, STR_CONV_MODE_LEFT_ALIGN, 3);
  StringAppend(lvlText, intText);
  const x = GetStringRightAlignXOffset(lvlText, 112, FONT_NORMAL);
  DaycareAddTextPrinter(windowId, lvlText, x, y);
}

/** 1:1 décomp `static void DaycarePrintMonInfo(u8 windowId, u32 daycareSlotId, u8 y)`
 *  (daycare.c:1225-1232) — itemPrintFunc du list menu. */
function DaycarePrintMonInfo(windowId: number, daycareSlotId: number, y: number): void {
  if (daycareSlotId < DAYCARE_MON_COUNT) {
    DaycarePrintMonNickname(GetDaycareData(), windowId, daycareSlotId, y);
    DaycarePrintMonLvl(GetDaycareData(), windowId, daycareSlotId, y);
  }
}

// #define tMenuListTaskId data[0] / tWindowId data[1] (daycare.c:1234-1235)

/** 1:1 décomp `static void Task_HandleDaycareLevelMenuInput(u8 taskId)` (daycare.c:1237-1268).
 *  Port : + SignalWaitState (l'opcode `waitstate` du byte-VM attend le latch en plus
 *  de ScriptContext_Enable — pattern établi field_screen_effect.ts). */
function Task_HandleDaycareLevelMenuInput(taskId: number): void {
  const rt = getRuntime();
  const data = rt.gTasks[taskId].data;
  const input = ListMenu_ProcessInput(data[0] /* tMenuListTaskId */);

  if (JOY_NEW(A_BUTTON)) {
    switch (input) {
      case 0:
      case 1:
        VarSet(0x800D /* VAR_RESULT */, input);  // gSpecialVar_Result = input
        break;
      case DAYCARE_LEVEL_MENU_EXIT:
        VarSet(0x800D /* VAR_RESULT */, DAYCARE_EXITED_LEVEL_MENU);
        break;
    }
    DestroyListMenuTask(data[0] /* tMenuListTaskId */);
    ClearStdWindowAndFrame(data[1] /* tWindowId */, true);
    RemoveWindow(data[1] /* tWindowId */);
    DestroyTask(taskId);
    ScriptContext_Enable();
    _SignalWaitState();
  } else if (JOY_NEW(B_BUTTON)) {
    VarSet(0x800D /* VAR_RESULT */, DAYCARE_EXITED_LEVEL_MENU);
    DestroyListMenuTask(data[0] /* tMenuListTaskId */);
    ClearStdWindowAndFrame(data[1] /* tWindowId */, true);
    RemoveWindow(data[1] /* tWindowId */);
    DestroyTask(taskId);
    ScriptContext_Enable();
    _SignalWaitState();
  }
}

/** Pont anti-cycle vers scrcmd.SignalWaitState (posé par scrcmd.ts sur globalThis —
 *  un import statique de scrcmd tirerait tout le byte-VM ici). */
function _SignalWaitState(): void {
  ((globalThis as Record<string, unknown>).__SignalWaitState as (() => void) | undefined)?.();
}

/** 1:1 décomp `void ShowDaycareLevelMenu(void)` (daycare.c:1270-1289) — special
 *  (waitstate=1 : le script bloque ; Task_HandleDaycareLevelMenuInput ré-enable). */
export function ShowDaycareLevelMenu(): void {
  const windowId = AddWindow(sDaycareLevelMenuWindowTemplate);
  DrawStdWindowFrame(windowId, false);

  const menuTemplate = _sDaycareListMenuLevelTemplate();
  menuTemplate.windowId = windowId;
  const listMenuTaskId = ListMenuInit(menuTemplate, 0, 0);

  CopyWindowToVram(windowId, 3 /* COPYWIN_FULL */);

  // Pattern task OBLIGATOIRE : CreateTask((t) => fn(t.taskId)) — le runtime passe l'OBJET.
  const daycareMenuTaskId = CreateTask((t: DecompTask) => Task_HandleDaycareLevelMenuInput(t.taskId), 3);
  const rt = getRuntime();
  rt.gTasks[daycareMenuTaskId].data[0] = listMenuTaskId;  // tMenuListTaskId
  rt.gTasks[daycareMenuTaskId].data[1] = windowId;        // tWindowId
}

/** 1:1 décomp `void ChooseSendDaycareMon(void)` (daycare.c:1294-1298) — special
 *  (waitstate=1) :
 *  ```c
 *  ChooseMonForDaycare();
 *  gMain.savedCallback = CB2_ReturnToField;
 *  ```
 *  Port : ChooseMonForDaycare (party_menu.ts) via pont globalThis (cycle ESM
 *  party_menu → overworld → script_pokemon_util → daycare). La 2e ligne est
 *  ABSORBÉE : dans notre modèle gMain.savedCallback EST gPartyMenu.exitCallback
 *  (= BufferMonSelection, posé par ChooseMonForDaycare) ; le slot séparé
 *  gMain.savedCallback du décomp n'a aucun consommateur dans ce flux. */
export function ChooseSendDaycareMon(): void {
  const fn = (globalThis as Record<string, unknown>).__ChooseMonForDaycare as (() => void) | undefined;
  if (!fn) {
    console.warn('[daycare] __ChooseMonForDaycare absent (party_menu pas chargé)');
    return;
  }
  fn();
}
