// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_conditions.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_conditions.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_conditions.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { CHAR_EXTRA_SYMBOL, CHAR_FEMALE, CHAR_LV_2, CHAR_MALE, CHAR_SLASH, CHAR_SPACE, CHAR_SPACER, EOS, EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR, EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW, EXT_CTRL_CODE_SHADOW, EXT_CTRL_CODE_SKIP, TEXT_COLOR_BLUE, TEXT_COLOR_GREEN, TEXT_COLOR_LIGHT_BLUE, TEXT_COLOR_LIGHT_GREEN, TEXT_COLOR_LIGHT_RED, TEXT_COLOR_RED, TEXT_COLOR_TRANSPARENT } from '../include/constants/characters';
import { POKEMON_NAME_LENGTH } from '../include/constants/global';
import { MON_FEMALE, MON_GENDERLESS, MON_MALE } from '../include/constants/pokemon';
import { SE_SELECT } from '../include/constants/songs';
import { SPECIES_NIDORAN_F, SPECIES_NIDORAN_M } from '../include/constants/species';
import { A_BUTTON, B_BUTTON, DPAD_DOWN, DPAD_UP } from '../include/gba/io_reg';
import { MON_DATA_BEAUTY, MON_DATA_COOL, MON_DATA_CUTE, MON_DATA_IS_EGG, MON_DATA_LEVEL, MON_DATA_MARKINGS, MON_DATA_NICKNAME, MON_DATA_OT_ID, MON_DATA_PERSONALITY, MON_DATA_SHEEN, MON_DATA_SMART, MON_DATA_SPECIES, MON_DATA_SPECIES_OR_EGG, MON_DATA_TOUGH } from '../include/pokemon';
import { STR_CONV_MODE_LEFT_ALIGN } from '../include/string_util';
import { JOY_HELD, JOY_NEW, PlaySE } from './battle_controllers';
import { GetMonData } from './engine/battle/party-storage';
import { gSpeciesNames } from './engine/data/game-data';
import { BOX_NAME_LENGTH, TOTAL_BOXES_COUNT } from './engine/save/save-blocks';
import { getString } from '../harness/runtime/decomp-strings';
import { CalculatePlayerPartyCount, GetBoxMonGender, GetLevelFromBoxMonExp, GetMonGender, SetMonData, gPlayerParty } from './pokemon';
import { GetBoxedMonPtr } from './pokemon_storage_system';
import { ConvertIntToDecimalStringN, StringCompare, StringCopyPadded, StringGet_Nickname } from './string_util';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import { __wireTodo } from './engine/wire-todo';
import { AllocSubstruct, FreePokenavSubstruct, GetSubstructPtr } from './pokenav_resources';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
const ConditionGraph_CalcPositions: any = __wireTodo('ConditionGraph_CalcPositions');
const ConditionGraph_Init: any = __wireTodo('ConditionGraph_Init');
const ConditionGraph_SetNewPositions: any = __wireTodo('ConditionGraph_SetNewPositions');
const GET_NUM_CONDITION_SPARKLES: any = __wireTodo('GET_NUM_CONDITION_SPARKLES');
const GetBoxNamePtr: any = __wireTodo('GetBoxNamePtr');
const GetBoxOrPartyMonData: any = __wireTodo('GetBoxOrPartyMonData');
const GetMonMarkingsData: any = __wireTodo('GetMonMarkingsData');
const GetMonSpritePalFromSpeciesAndPersonality: any = __wireTodo('GetMonSpritePalFromSpeciesAndPersonality');
const HandleMonMarkingsMenuInput: any = __wireTodo('HandleMonMarkingsMenuInput');
const LZ77UnCompWram: any = __wireTodo('LZ77UnCompWram');
const LoadSpecialPokePic: any = __wireTodo('LoadSpecialPokePic');
const SetBoxMonDataAt: any = __wireTodo('SetBoxMonDataAt');
const gKeyRepeatStartDelay: any = __wireTodo('gKeyRepeatStartDelay');
const gMonFrontPicTable: any = __wireTodo('gMonFrontPicTable');

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU = 11; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_MON_LIST = 18; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_FUNC_NONE = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_FUNC_RETURN = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_FUNC_ADD_MARKINGS = 5; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_FUNC_CLOSE_MARKINGS = 6; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_CONDITION_MENU = 100002; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_RETURN_CONDITION_SEARCH = 100010; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_FUNC_NO_TRANSITION = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_FUNC_SLIDE_MON_OUT = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_FUNC_SLIDE_MON_IN = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_LOAD_MON_INFO = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_LOAD_GRAPH = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_LOAD_MON_PIC = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const CONDITION_COOL = 0; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const CONDITION_TOUGH = 1; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const CONDITION_SMART = 2; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const CONDITION_CUTE = 3; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const CONDITION_BEAUTY = 4; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const CONDITION_COUNT = 5; // 1:1 include/menu_specialized.h:0 (à consolider dans include/)
const CONDITION_GRAPH_CENTER_X = 155; // 1:1 include/menu_specialized.h:52 (à consolider dans include/)
const CONDITION_GRAPH_CENTER_Y = 91.5; // 1:1 include/menu_specialized.h:53 (à consolider dans include/)

const CONDITION_MONS_LOADED = 3; // 1:1 pokenav_conditions.c:16

/** 1:1 `struct Pokenav_ConditionMenu` (pokenav_conditions.c:18). */
interface Pokenav_ConditionMenu {
  monPal: Uint32Array;
  fill: Uint8Array;
  monPicGfx: Uint32Array;
  inSearchMode: boolean;
  toLoadListIndex: number;
  callback: ((...args: any[]) => any) | null;
  fill2: Uint8Array;
  locationText: Uint8Array;
  nameText: Uint8Array;
  graph: any;
  numSparkles: Uint8Array;
  monMarks: Uint8Array;
  loadId: number;
  nextLoadIdDown: number;
  nextLoadIdUp: number;
  toLoadId: number;
  state: number;
}

/** 1:1 `bool32 PokenavCallback_Init_ConditionGraph_Party(void)` (pokenav_conditions.c:50-62). */
export function PokenavCallback_Init_ConditionGraph_Party(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_ConditionMenu) */);
  if (menu == null)
    return false;
  ConditionGraph_Init(menu.graph);
  InitPartyConditionListParameters();
  gKeyRepeatStartDelay = 20;
  menu.callback = HandleConditionMenuInput;
  return true;
}

/** 1:1 `bool32 PokenavCallback_Init_ConditionGraph_Search(void)` (pokenav_conditions.c:64-76). */
export function PokenavCallback_Init_ConditionGraph_Search(): boolean {
  let menu = AllocSubstruct(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_ConditionMenu) */);
  if (menu == null)
    return false;
  ConditionGraph_Init(menu.graph);
  InitSearchResultsConditionList();
  gKeyRepeatStartDelay = 20;
  menu.callback = HandleConditionMenuInput;
  return true;
}

/** 1:1 `u32 GetConditionGraphMenuCallback(void)` (pokenav_conditions.c:78-83). */
export function GetConditionGraphMenuCallback(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.callback(menu);
}

/** 1:1 `static u32 HandleConditionMenuInput(struct Pokenav_ConditionMenu *menu)` (pokenav_conditions.c:85-122). */
function HandleConditionMenuInput(menu: Pokenav_ConditionMenu): number {
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  let ret = ConditionGraphHandleDpadInput(menu);
  if (ret == CONDITION_FUNC_NONE)
  {
    if (JOY_NEW(B_BUTTON))
    {
      PlaySE(SE_SELECT);
      menu.callback = GetConditionReturnCallback;
      ret = CONDITION_FUNC_RETURN;
    }
    else if (JOY_NEW(A_BUTTON))
    {
      if (!menu.inSearchMode)
      {
        // In Party mode, pressing A only applies to the Cancel button
        if (monListPtr.currIndex == monListPtr.listCount - 1)
        {
          // Cancel
          PlaySE(SE_SELECT);
          menu.callback = GetConditionReturnCallback;
          ret = CONDITION_FUNC_RETURN;
        }
      }
      else
      {
        // In Search mode pressing A brings up the markings menu
        PlaySE(SE_SELECT);
        ret = CONDITION_FUNC_ADD_MARKINGS;
        menu.callback = OpenMarkingsMenu;
      }
    }
  }
  return ret;
}

/** 1:1 `static u32 OpenMarkingsMenu(struct Pokenav_ConditionMenu *menu)` (pokenav_conditions.c:124-148). */
function OpenMarkingsMenu(menu: Pokenav_ConditionMenu): number {
  let monListPtr: any = null;
  const markings = { v: 0 }; // TRANSPILER: &markings pris → box
  let ret = CONDITION_FUNC_NONE;
  let boxId = 0;
  let monId = 0;
  if (!HandleMonMarkingsMenuInput())
  {
    menu.monMarks[menu.loadId] = GetMonMarkingsData();
    monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
    boxId = monListPtr.monData[monListPtr.currIndex].boxId;
    monId = monListPtr.monData[monListPtr.currIndex].monId;
    markings.v = menu.monMarks[menu.loadId];
    if (boxId == TOTAL_BOXES_COUNT)
      SetMonData(gPlayerParty[monId], MON_DATA_MARKINGS, markings);
    else
      SetBoxMonDataAt(boxId, monId, MON_DATA_MARKINGS, markings);
    menu.callback = HandleConditionMenuInput;
    ret = CONDITION_FUNC_CLOSE_MARKINGS;
  }
  return ret;
}

/** 1:1 `static u32 GetConditionReturnCallback(struct Pokenav_ConditionMenu *menu)` (pokenav_conditions.c:150-156). */
function GetConditionReturnCallback(menu: Pokenav_ConditionMenu): number {
  if (!menu.inSearchMode)
    return POKENAV_CONDITION_MENU;
  else
    return POKENAV_RETURN_CONDITION_SEARCH;
}

/** 1:1 `void FreeConditionGraphMenuSubstruct1(void)` (pokenav_conditions.c:158-165). */
export function FreeConditionGraphMenuSubstruct1(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  if (!menu.inSearchMode)
    FreePokenavSubstruct(POKENAV_SUBSTRUCT_MON_LIST);
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
}

/** 1:1 `static u8 ConditionGraphHandleDpadInput(struct Pokenav_ConditionMenu *menu)` (pokenav_conditions.c:167-192). */
function ConditionGraphHandleDpadInput(menu: Pokenav_ConditionMenu): number {
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  let ret = CONDITION_FUNC_NONE;
  if (JOY_HELD(DPAD_UP))
  {
    // Prevent input wrapping in search mode
    if (!menu.inSearchMode || monListPtr.currIndex != 0)
    {
      PlaySE(SE_SELECT);
      ret = SwitchConditionSummaryIndex(true);
    }
  }
  else if (JOY_HELD(DPAD_DOWN))
  {
    // Prevent input wrapping in search mode
    if (!menu.inSearchMode || monListPtr.currIndex < monListPtr.listCount - 1)
    {
      PlaySE(SE_SELECT);
      ret = SwitchConditionSummaryIndex(false);
    }
  }
  return ret;
}

/** 1:1 `static u8 SwitchConditionSummaryIndex(u8 moveUp)` (pokenav_conditions.c:194-233). */
function SwitchConditionSummaryIndex(moveUp: number): number {
  let newLoadId = 0;
  let wasNotLastMon = false;
  let isNotLastMon = false;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  newLoadId = (moveUp) ? menu.nextLoadIdUp : menu.nextLoadIdDown;
  ConditionGraph_SetNewPositions(menu.graph, menu.graph.savedPositions[menu.loadId], menu.graph.savedPositions[newLoadId]);
  wasNotLastMon = (monListPtr.currIndex != (IsConditionMenuSearchMode() ? monListPtr.listCount : monListPtr.listCount - 1));
  if (moveUp)
  {
    menu.nextLoadIdUp = menu.nextLoadIdDown;
    menu.nextLoadIdDown = menu.loadId;
    menu.loadId = newLoadId;
    menu.toLoadId = menu.nextLoadIdUp;
    monListPtr.currIndex = (monListPtr.currIndex == 0) ? monListPtr.listCount - 1 : monListPtr.currIndex - 1;
    menu.toLoadListIndex = (monListPtr.currIndex != 0) ? monListPtr.currIndex - 1 : monListPtr.listCount - 1;
  }
  else
  {
    menu.nextLoadIdDown = menu.nextLoadIdUp;
    menu.nextLoadIdUp = menu.loadId;
    menu.loadId = newLoadId;
    menu.toLoadId = menu.nextLoadIdDown;
    monListPtr.currIndex = (monListPtr.currIndex < monListPtr.listCount - 1) ? monListPtr.currIndex + 1 : 0;
    menu.toLoadListIndex = (monListPtr.currIndex < monListPtr.listCount - 1) ? monListPtr.currIndex + 1 : 0;
  }
  isNotLastMon = (monListPtr.currIndex != (IsConditionMenuSearchMode() ? monListPtr.listCount : monListPtr.listCount - 1));
  if (!wasNotLastMon)
    return CONDITION_FUNC_NO_TRANSITION;
  else if (!isNotLastMon)
    return CONDITION_FUNC_SLIDE_MON_OUT;
  else
    return CONDITION_FUNC_SLIDE_MON_IN;
}

/** 1:1 `bool32 LoadConditionGraphMenuGfx(void)` (pokenav_conditions.c:235-301). */
export function LoadConditionGraphMenuGfx(): boolean {
  let var_ = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  switch (menu.state) {
    case 0:
      CopyMonNameGenderLocation(monListPtr.currIndex, 0);
      break;
    case 1:
      GetMonConditionGraphData(monListPtr.currIndex, 0);
      break;
    case 2:
      ConditionGraphDrawMonPic(monListPtr.currIndex, 0);
      break;
    case 3:
      if (monListPtr.listCount == 1)
      {
        menu.loadId = 0;
        menu.nextLoadIdDown = 0;
        menu.nextLoadIdUp = 0;
        menu.state = 0;
        return true;
      }
      else
      {
        menu.loadId = 0;
        menu.nextLoadIdDown = 1;
        menu.nextLoadIdUp = 2;
      }
      break;
    // These were probably ternaries just like cases 7-9, but couldn't match it any other way.
    case 4:
      var_ = monListPtr.currIndex + 1;
      if (var_ >= monListPtr.listCount)
        var_ = 0;
      CopyMonNameGenderLocation(var_, 1);
      break;
    case 5:
      var_ = monListPtr.currIndex + 1;
      if (var_ >= monListPtr.listCount)
        var_ = 0;
      GetMonConditionGraphData(var_, 1);
      break;
    case 6:
      var_ = monListPtr.currIndex + 1;
      if (var_ >= monListPtr.listCount)
        var_ = 0;
      ConditionGraphDrawMonPic(var_, 1);
      break;
    case 7:
      CopyMonNameGenderLocation((monListPtr.currIndex - 1 >= 0) ? monListPtr.currIndex - 1 : monListPtr.listCount - 1, 2);
      break;
    case 8:
      GetMonConditionGraphData((monListPtr.currIndex - 1 >= 0) ? monListPtr.currIndex - 1 : monListPtr.listCount - 1, 2);
      break;
    case 9:
      ConditionGraphDrawMonPic((monListPtr.currIndex - 1 >= 0) ? monListPtr.currIndex - 1 : monListPtr.listCount - 1, 2);
      menu.state = 0;
      return true;
  }
  menu.state++;
  return false;
}

/** 1:1 `bool32 LoadNextConditionMenuMonData(u8 mode)` (pokenav_conditions.c:303-321). */
export function LoadNextConditionMenuMonData(mode: number): boolean {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  switch (mode) {
    case CONDITION_LOAD_MON_INFO:
      CopyMonNameGenderLocation(menu.toLoadListIndex, menu.toLoadId);
      break;
    case CONDITION_LOAD_GRAPH:
      GetMonConditionGraphData(menu.toLoadListIndex, menu.toLoadId);
      break;
    case CONDITION_LOAD_MON_PIC:
      ConditionGraphDrawMonPic(menu.toLoadListIndex, menu.toLoadId);
      return true;
  }
  return false;
}

/** 1:1 `u8 *CopyStringLeftAlignedToConditionData(u8 *dst, const u8 *src, s16 n)` (pokenav_conditions.c:323-333). */
export function CopyStringLeftAlignedToConditionData(dst: { v: number }, src: { v: number }, n: number): Uint8Array | null {
  while (src.v != EOS)
    (void 0 /* TRANSPILER-TODO ASSIGN: *dst++ = *src++ */, n--);
  while (n-- > 0)
    void 0 /* TRANSPILER-TODO ASSIGN: *dst++ = CHAR_SPACE */;
  dst.v = EOS;
  return dst.v;
}

/** 1:1 `static u8 *CopyConditionMonNameGender(u8 *str, u16 listId, bool8 skipPadding)` (pokenav_conditions.c:335-424). */
function CopyConditionMonNameGender(str: Uint8Array, listId: number, skipPadding: boolean): Uint8Array | null {
  let boxId = 0;
  let monId = 0;
  let gender = 0;
  let species = 0;
  let level = 0;
  let lvlDigits = 0;
  let boxMon: any = null;
  let txtPtr: any = null;
  let str_: any = null;
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  boxId = monListPtr.monData[listId].boxId;
  monId = monListPtr.monData[listId].monId;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str++) = EXT_CTRL_CODE_BEGIN */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str++) = EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str++) = TEXT_COLOR_BLUE */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str++) = TEXT_COLOR_TRANSPARENT */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str++) = TEXT_COLOR_LIGHT_BLUE */;
  if (GetBoxOrPartyMonData(boxId, monId, MON_DATA_IS_EGG, null))
    return StringCopyPadded(str, getString('gText_EggNickname'), CHAR_SPACE, POKEMON_NAME_LENGTH + 2);
  GetBoxOrPartyMonData(boxId, monId, MON_DATA_NICKNAME, str);
  StringGet_Nickname(str);
  species = GetBoxOrPartyMonData(boxId, monId, MON_DATA_SPECIES, null);
  if (boxId == TOTAL_BOXES_COUNT)
  {
    level = GetMonData(gPlayerParty[monId], MON_DATA_LEVEL);
    gender = GetMonGender(gPlayerParty[monId]);
  }
  else
  {
    boxMon = GetBoxedMonPtr(boxId, monId);
    gender = GetBoxMonGender(boxMon);
    level = GetLevelFromBoxMonExp(boxMon);
  }
  if ((species == SPECIES_NIDORAN_F || species == SPECIES_NIDORAN_M) && !StringCompare(str, gSpeciesNames[species]))
    gender = MON_GENDERLESS;
  str_ = str;
  // For some reason, a variable is needed to match.
  while (str_[0] /* *ptr */ != EOS)
    (str_++ /* TRANSPILER-TODO ptr-arith */);
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_BEGIN */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_SKIP */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = 60 */;
  switch (gender) {
    default:
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = CHAR_SPACER */;
      // Genderless
      break;
    case MON_MALE:
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_BEGIN */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_COLOR */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = TEXT_COLOR_RED */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_BEGIN */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_SHADOW */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = TEXT_COLOR_LIGHT_RED */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = CHAR_MALE */;
      break;
    case MON_FEMALE:
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_BEGIN */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_COLOR */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = TEXT_COLOR_GREEN */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_BEGIN */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_SHADOW */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = TEXT_COLOR_LIGHT_GREEN */;
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = CHAR_FEMALE */;
      break;
  }
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_BEGIN */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = TEXT_COLOR_BLUE */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = TEXT_COLOR_TRANSPARENT */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = TEXT_COLOR_LIGHT_BLUE */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = CHAR_SLASH */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = CHAR_EXTRA_SYMBOL */;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = CHAR_LV_2 */;
  txtPtr = str_;
  str_ = ConvertIntToDecimalStringN(str_, level, STR_CONV_MODE_LEFT_ALIGN, 3);
  lvlDigits = str_ - txtPtr;
  void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = CHAR_SPACE */;
  if (!skipPadding)
  {
    lvlDigits = 3 - lvlDigits;
    while (lvlDigits-- != 0)
      void 0 /* TRANSPILER-TODO ASSIGN: *(str_++) = CHAR_SPACE */;
  }
  str_[0] /* *ptr */ = EOS;
  return str_;
}

/** 1:1 `static void CopyMonNameGenderLocation(s16 listId, u8 loadId)` (pokenav_conditions.c:426-456). */
function CopyMonNameGenderLocation(listId: number, loadId: number): void {
  let boxId = 0;
  let i = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  if (listId != (IsConditionMenuSearchMode() ? monListPtr.listCount : monListPtr.listCount - 1))
  {
    CopyConditionMonNameGender(menu.nameText[loadId], listId, false);
    boxId = monListPtr.monData[listId].boxId;
    menu.locationText[loadId][0] = EXT_CTRL_CODE_BEGIN;
    menu.locationText[loadId][1] = EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW;
    menu.locationText[loadId][2] = TEXT_COLOR_BLUE;
    menu.locationText[loadId][3] = TEXT_COLOR_TRANSPARENT;
    menu.locationText[loadId][4] = TEXT_COLOR_LIGHT_BLUE;
    if (boxId == TOTAL_BOXES_COUNT)
      CopyStringLeftAlignedToConditionData(menu.locationText[loadId][5] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, getString('gText_InParty'), BOX_NAME_LENGTH);
    else
      CopyStringLeftAlignedToConditionData(menu.locationText[loadId][5] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, GetBoxNamePtr(boxId), BOX_NAME_LENGTH);
  }
  else
  {
    for (i = 0; i < POKEMON_NAME_LENGTH + 2; i++)
      menu.nameText[loadId][i] = CHAR_SPACE;
    menu.nameText[loadId][i] = EOS;
    for (i = 0; i < BOX_NAME_LENGTH; i++)
      menu.locationText[loadId][i] = CHAR_SPACE;
    menu.locationText[loadId][i] = EOS;
  }
}

/** 1:1 `static void InitPartyConditionListParameters(void)` (pokenav_conditions.c:458-482). */
function InitPartyConditionListParameters(): void {
  let i = 0;
  let count = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  let monListPtr = AllocSubstruct(POKENAV_SUBSTRUCT_MON_LIST, 0 /* TRANSPILER-TODO sizeof(struct PokenavMonList) */);
  menu.inSearchMode = false;
  for ((i = 0, count = 0); i < CalculatePlayerPartyCount(); i++)
  {
    if (!GetMonData(gPlayerParty[i], MON_DATA_IS_EGG))
    {
      monListPtr.monData[count].boxId = TOTAL_BOXES_COUNT;
      monListPtr.monData[count].monId = i;
      monListPtr.monData[count].data = 0;
      count++;
    }
  }
  monListPtr.monData[count].boxId = 0;
  monListPtr.monData[count].monId = 0;
  monListPtr.monData[count].data = 0;
  monListPtr.currIndex = 0;
  monListPtr.listCount = count + 1;
  menu.state = 0;
}

/** 1:1 `static void InitSearchResultsConditionList(void)` (pokenav_conditions.c:484-489). */
function InitSearchResultsConditionList(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  menu.inSearchMode = true;
  menu.state = 0;
}

/** 1:1 `static void GetMonConditionGraphData(s16 listId, u8 loadId)` (pokenav_conditions.c:491-520). */
function GetMonConditionGraphData(listId: number, loadId: number): void {
  let boxId = 0;
  let monId = 0;
  let i = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  if (listId != (IsConditionMenuSearchMode() ? monListPtr.listCount : monListPtr.listCount - 1))
  {
    boxId = monListPtr.monData[listId].boxId;
    monId = monListPtr.monData[listId].monId;
    menu.graph.conditions[loadId][CONDITION_COOL] = GetBoxOrPartyMonData(boxId, monId, MON_DATA_COOL, null);
    menu.graph.conditions[loadId][CONDITION_TOUGH] = GetBoxOrPartyMonData(boxId, monId, MON_DATA_TOUGH, null);
    menu.graph.conditions[loadId][CONDITION_SMART] = GetBoxOrPartyMonData(boxId, monId, MON_DATA_SMART, null);
    menu.graph.conditions[loadId][CONDITION_CUTE] = GetBoxOrPartyMonData(boxId, monId, MON_DATA_CUTE, null);
    menu.graph.conditions[loadId][CONDITION_BEAUTY] = GetBoxOrPartyMonData(boxId, monId, MON_DATA_BEAUTY, null);
    menu.numSparkles[loadId] = GET_NUM_CONDITION_SPARKLES(GetBoxOrPartyMonData(boxId, monId, MON_DATA_SHEEN, null));
    menu.monMarks[loadId] = GetBoxOrPartyMonData(boxId, monId, MON_DATA_MARKINGS, null);
    ConditionGraph_CalcPositions(menu.graph.conditions[loadId], menu.graph.savedPositions[loadId]);
  }
  else
  {
    // Set empty graph point
    for (i = 0; i < CONDITION_COUNT; i++)
    {
      menu.graph.conditions[loadId][i] = 0;
      menu.graph.savedPositions[loadId][i].x = CONDITION_GRAPH_CENTER_X;
      menu.graph.savedPositions[loadId][i].y = CONDITION_GRAPH_CENTER_Y;
    }
  }
}

/** 1:1 `static void ConditionGraphDrawMonPic(s16 listId, u8 loadId)` (pokenav_conditions.c:522-539). */
function ConditionGraphDrawMonPic(listId: number, loadId: number): void {
  let boxId = 0;
  let monId = 0;
  let species = 0;
  let personality = 0;
  let tid = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  if (listId == (IsConditionMenuSearchMode() ? monListPtr.listCount : monListPtr.listCount - 1))
    return;
  boxId = monListPtr.monData[listId].boxId;
  monId = monListPtr.monData[listId].monId;
  species = GetBoxOrPartyMonData(boxId, monId, MON_DATA_SPECIES_OR_EGG, null);
  tid = GetBoxOrPartyMonData(boxId, monId, MON_DATA_OT_ID, null);
  personality = GetBoxOrPartyMonData(boxId, monId, MON_DATA_PERSONALITY, null);
  LoadSpecialPokePic(gMonFrontPicTable[species] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, menu.monPicGfx[loadId], species, personality, true);
  LZ77UnCompWram(GetMonSpritePalFromSpeciesAndPersonality(species, tid, personality), menu.monPal[loadId]);
}

/** 1:1 `u16 GetMonListCount(void)` (pokenav_conditions.c:541-545). */
export function GetMonListCount(): number {
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  return monListPtr.listCount;
}

/** 1:1 `u16 GetConditionGraphCurrentListIndex(void)` (pokenav_conditions.c:547-551). */
export function GetConditionGraphCurrentListIndex(): number {
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  return monListPtr.currIndex;
}

/** 1:1 `struct ConditionGraph *GetConditionGraphPtr(void)` (pokenav_conditions.c:553-557). */
export function GetConditionGraphPtr(): any {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.graph;
}

/** 1:1 `u8 GetConditionGraphMenuCurrentLoadIndex(void)` (pokenav_conditions.c:559-563). */
export function GetConditionGraphMenuCurrentLoadIndex(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.loadId;
}

/** 1:1 `u8 GetConditionGraphMenuToLoadListIndex(void)` (pokenav_conditions.c:565-569). */
export function GetConditionGraphMenuToLoadListIndex(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.toLoadListIndex;
}

/** 1:1 `void *GetConditionMonPicGfx(u8 loadId)` (pokenav_conditions.c:571-575). */
export function GetConditionMonPicGfx(loadId: number): any {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.monPicGfx[loadId];
}

/** 1:1 `void *GetConditionMonPal(u8 loadId)` (pokenav_conditions.c:577-581). */
export function GetConditionMonPal(loadId: number): any {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.monPal[loadId];
}

/** 1:1 `u8 GetConditionGraphMenuToLoadId(void)` (pokenav_conditions.c:583-587). */
export function GetConditionGraphMenuToLoadId(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.toLoadId;
}

/** 1:1 `u8 *GetConditionMonNameText(u8 loadId)` (pokenav_conditions.c:589-593). */
export function GetConditionMonNameText(loadId: number): Uint8Array | null {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.nameText[loadId];
}

/** 1:1 `u8 *GetConditionMonLocationText(u8 loadId)` (pokenav_conditions.c:595-599). */
export function GetConditionMonLocationText(loadId: number): Uint8Array | null {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.locationText[loadId];
}

/** 1:1 `u16 GetConditionMonDataBuffer(void)` (pokenav_conditions.c:601-605). */
export function GetConditionMonDataBuffer(): number {
  let monListPtr = GetSubstructPtr(POKENAV_SUBSTRUCT_MON_LIST);
  return monListPtr.monData[monListPtr.currIndex].data;
}

/** 1:1 `bool32 IsConditionMenuSearchMode(void)` (pokenav_conditions.c:607-614). */
export function IsConditionMenuSearchMode(): boolean {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  if (menu.inSearchMode == 1)
    return true;
  else
    return false;
}

// Markings are only shown in search mode

/** 1:1 `u8 TryGetMonMarkId(void)` (pokenav_conditions.c:617-624). */
export function TryGetMonMarkId(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  if (menu.inSearchMode == 1)
    return menu.monMarks[menu.loadId];
  else
    return 0;
}

/** 1:1 `u8 GetNumConditionMonSparkles(void)` (pokenav_conditions.c:626-630). */
export function GetNumConditionMonSparkles(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_CONDITION_GRAPH_MENU);
  return menu.numSparkles[menu.loadId];
}
