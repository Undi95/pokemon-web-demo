/**
 * pokenav_match_call_list.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_match_call_list.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_match_call_list.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { FLAG_BADGE05_GET, FLAG_WATTSON_REMATCH_AVAILABLE, TRAINER_REGISTERED_FLAGS_START } from '../include/constants/flags';
import { SE_FAILURE } from '../include/constants/songs';
import { A_BUTTON, B_BUTTON, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from '../include/gba/io_reg';
import { FONT_NARROW } from '../include/text';
import { JOY_NEW, JOY_REPEAT, PlaySE } from './battle_controllers';
import { gRematchTable } from './battle_setup';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { getString } from './engine/ui/gba-strings';
import { FlagGet } from './event_data';
import { gMapHeader } from './fieldmap';
import { GetStringClearToWidth, GetTrainerClassNameGenderSpecific } from './international_string_util';
import { Overworld_GetMapHeaderByGroupAndId, Overworld_MapTypeAllowsTeleportAndFly } from './overworld';
import { gStringVar4 } from './string_util';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const MATCH_CALL_OPTION_CALL = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MATCH_CALL_OPTION_CANCEL = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MATCH_CALL_OPTION_CHECK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_SUBSTRUCT_MATCH_CALL_MAIN = 5; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_UP = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_DOWN = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_PG_UP = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_PG_DOWN = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_SELECT = 5; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MODE_FORCE_CALL_READY = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_EXIT = 15; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_NONE = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MAIN_MENU_CURSOR_ON_MATCH_CALL = 100004; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_MOVE_OPTIONS_CURSOR = 6; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_CANCEL = 7; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MODE_FORCE_CALL_EXIT = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_NEARBY_MSG = 9; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_CALL_MSG = 8; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_SHOW_CHECK_PAGE = 11; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_CHECK_PAGE_UP = 12; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_CHECK_PAGE_DOWN = 13; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_EXIT_CHECK_PAGE = 14; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_MC_FUNC_EXIT_CALL = 10; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const MC_HEADER_COUNT = 21; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_CONTINUE = 3; // 1:1 include/pokenav.h:61 (à consolider dans include/)
const REMATCH_TABLE_ENTRIES = 78; // 1:1 include/constants/rematches.h:0 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const MATCH_CALL_OPTION_COUNT = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const MC_HEADER_WATTSON = 11; // 1:1 include/pokenav.h:0 (à consolider dans include/)

/** 1:1 `struct Pokenav_MatchCallMenu` (pokenav_match_call_list.c:17). */
interface Pokenav_MatchCallMenu {
  optionCursorPos: number;
  maxOptionId: number;
  matchCallOptions: Uint8Array;
  headerId: number;
  numRegistered: number;
  numSpecialTrainers: number;
  initFinished: boolean;
  loopedTaskId: number;
  callback: ((...args: any[]) => any) | null;
  matchCallEntries: any[];
}

/** 1:1 (pokenav_match_call_list.c:41) */
const sMatchCallOptionsNoCheckPage = Uint8Array.from([
  MATCH_CALL_OPTION_CALL,
  MATCH_CALL_OPTION_CANCEL,
]);

/** 1:1 (pokenav_match_call_list.c:47) */
const sMatchCallOptionsHasCheckPage = Uint8Array.from([
  MATCH_CALL_OPTION_CALL,
  MATCH_CALL_OPTION_CHECK,
  MATCH_CALL_OPTION_CANCEL,
]);

/** 1:1 `bool32 PokenavCallback_Init_MatchCall(void)` (pokenav_match_call_list.c:54-65). */
export function PokenavCallback_Init_MatchCall(): boolean {
  let state = AllocSubstruct(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_MatchCallMenu) */);
  if (!state)
    return false;
  state.callback = CB2_HandleMatchCallInput;
  state.headerId = 0;
  state.initFinished = false;
  state.loopedTaskId = CreateLoopedTask(LoopedTask_BuildMatchCallList, 1);
  return true;
}

/** 1:1 `u32 GetMatchCallCallback(void)` (pokenav_match_call_list.c:67-71). */
export function GetMatchCallCallback(): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  return state.callback(state);
}

/** 1:1 `void FreeMatchCallSubstruct1(void)` (pokenav_match_call_list.c:73-76). */
export function FreeMatchCallSubstruct1(): void {
  FreePokenavSubstruct(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
}

/** 1:1 `static u32 CB2_HandleMatchCallInput(struct Pokenav_MatchCallMenu *state)` (pokenav_match_call_list.c:78-126). */
function CB2_HandleMatchCallInput(state: Pokenav_MatchCallMenu): number {
  let selection = 0;
  if (JOY_REPEAT(DPAD_UP))
    return POKENAV_MC_FUNC_UP;
  if (JOY_REPEAT(DPAD_DOWN))
    return POKENAV_MC_FUNC_DOWN;
  if (JOY_REPEAT(DPAD_LEFT))
    return POKENAV_MC_FUNC_PG_UP;
  if (JOY_REPEAT(DPAD_RIGHT))
    return POKENAV_MC_FUNC_PG_DOWN;
  if (JOY_NEW(A_BUTTON))
  {
    state.callback = CB2_HandleMatchCallOptionsInput;
    state.optionCursorPos = 0;
    selection = PokenavList_GetSelectedIndex();
    if (!state.matchCallEntries[selection].isSpecialTrainer || MatchCall_HasCheckPage(state.matchCallEntries[selection].headerId))
    {
      state.matchCallOptions = sMatchCallOptionsHasCheckPage;
      state.maxOptionId = sMatchCallOptionsHasCheckPage.length - 1;
    }
    else
    {
      state.matchCallOptions = sMatchCallOptionsNoCheckPage;
      state.maxOptionId = sMatchCallOptionsNoCheckPage.length - 1;
    }
    return POKENAV_MC_FUNC_SELECT;
  }
  if (JOY_NEW(B_BUTTON))
  {
    if (GetPokenavMode() != POKENAV_MODE_FORCE_CALL_READY)
    {
      state.callback = GetExitMatchCallMenuId;
      return POKENAV_MC_FUNC_EXIT;
    }
    else
    {
      // Cant exit Match Call menu before calling Mr Stone during tutorial
      PlaySE(SE_FAILURE);
    }
  }
  return POKENAV_MC_FUNC_NONE;
}

/** 1:1 `static u32 GetExitMatchCallMenuId(struct Pokenav_MatchCallMenu *state)` (pokenav_match_call_list.c:128-131). */
function GetExitMatchCallMenuId(state: Pokenav_MatchCallMenu): number {
  return POKENAV_MAIN_MENU_CURSOR_ON_MATCH_CALL;
}

/** 1:1 `static u32 CB2_HandleMatchCallOptionsInput(struct Pokenav_MatchCallMenu *state)` (pokenav_match_call_list.c:133-176). */
function CB2_HandleMatchCallOptionsInput(state: Pokenav_MatchCallMenu): number {
  if (JOY_NEW(DPAD_UP) && state.optionCursorPos)
  {
    state.optionCursorPos--;
    return POKENAV_MC_FUNC_MOVE_OPTIONS_CURSOR;
  }
  if (JOY_NEW(DPAD_DOWN) && state.optionCursorPos < state.maxOptionId)
  {
    state.optionCursorPos++;
    return POKENAV_MC_FUNC_MOVE_OPTIONS_CURSOR;
  }
  if (JOY_NEW(A_BUTTON))
  {
    switch (state.matchCallOptions[state.optionCursorPos]) {
      case MATCH_CALL_OPTION_CANCEL:
        state.callback = CB2_HandleMatchCallInput;
        return POKENAV_MC_FUNC_CANCEL;
      case MATCH_CALL_OPTION_CALL:
        if (GetPokenavMode() == POKENAV_MODE_FORCE_CALL_READY)
          SetPokenavMode(POKENAV_MODE_FORCE_CALL_EXIT);
        state.callback = CB2_HandleCallExitInput;
        if (ShouldDoNearbyMessage())
          return POKENAV_MC_FUNC_NEARBY_MSG;
        return POKENAV_MC_FUNC_CALL_MSG;
      case MATCH_CALL_OPTION_CHECK:
        state.callback = CB2_HandleCheckPageInput;
        return POKENAV_MC_FUNC_SHOW_CHECK_PAGE;
    }
  }
  if (JOY_NEW(B_BUTTON))
  {
    state.callback = CB2_HandleMatchCallInput;
    return POKENAV_MC_FUNC_CANCEL;
  }
  return POKENAV_MC_FUNC_NONE;
}

/** 1:1 `static u32 CB2_HandleCheckPageInput(struct Pokenav_MatchCallMenu *state)` (pokenav_match_call_list.c:178-192). */
function CB2_HandleCheckPageInput(state: Pokenav_MatchCallMenu): number {
  if (JOY_REPEAT(DPAD_UP))
    return POKENAV_MC_FUNC_CHECK_PAGE_UP;
  if (JOY_REPEAT(DPAD_DOWN))
    return POKENAV_MC_FUNC_CHECK_PAGE_DOWN;
  if (JOY_NEW(B_BUTTON))
  {
    state.callback = CB2_HandleMatchCallInput;
    return POKENAV_MC_FUNC_EXIT_CHECK_PAGE;
  }
  return POKENAV_MC_FUNC_NONE;
}

/** 1:1 `static u32 CB2_HandleCallExitInput(struct Pokenav_MatchCallMenu *state)` (pokenav_match_call_list.c:194-203). */
function CB2_HandleCallExitInput(state: Pokenav_MatchCallMenu): number {
  if (JOY_NEW(A_BUTTON | B_BUTTON))
  {
    state.callback = CB2_HandleMatchCallInput;
    return POKENAV_MC_FUNC_EXIT_CALL;
  }
  return POKENAV_MC_FUNC_NONE;
}

/** 1:1 `static u32 LoopedTask_BuildMatchCallList(s32 taskState)` (pokenav_match_call_list.c:205-259). */
function LoopedTask_BuildMatchCallList(taskState: number): number {
  let i = 0;
  let j = 0;
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  switch (taskState) {
    case 0:
      state.headerId = 0;
      state.numRegistered = 0;
      return LT_INC_AND_CONTINUE;
    case 1:
      // Load special trainers (e.g. Rival, gym leaders)
      for ((i = 0, j = state.headerId); i < 30; (i++, j++))
      {
        if (MatchCall_GetEnabled(j))
        {
          state.matchCallEntries[state.numRegistered].headerId = j;
          state.matchCallEntries[state.numRegistered].isSpecialTrainer = true;
          state.matchCallEntries[state.numRegistered].mapSec = MatchCall_GetMapSec(j);
          state.numRegistered++;
        }
        if (++state.headerId >= MC_HEADER_COUNT)
        {
          state.numSpecialTrainers = state.headerId;
          state.headerId = 0;
          return LT_INC_AND_CONTINUE;
        }
      }
      return LT_CONTINUE;
    case 2:
      // Load normal trainers
      for ((i = 0, j = state.headerId); i < 30; (i++, j++))
      {
        if (!MatchCall_HasRematchId(state.headerId) && IsRematchEntryRegistered(state.headerId))
        {
          state.matchCallEntries[state.numRegistered].headerId = state.headerId;
          state.matchCallEntries[state.numRegistered].isSpecialTrainer = false;
          state.matchCallEntries[state.numRegistered].mapSec = GetMatchTableMapSectionId(j);
          state.numRegistered++;
        }
        if (++state.headerId > REMATCH_TABLE_ENTRIES - 1)
          return LT_INC_AND_CONTINUE;
      }
      return LT_CONTINUE;
    case 3:
      state.initFinished = true;
      break;
  }
  return LT_FINISH;
}

/** 1:1 `bool32 IsRematchEntryRegistered(int rematchIndex)` (pokenav_match_call_list.c:261-267). */
export function IsRematchEntryRegistered(rematchIndex: number): boolean {
  if (rematchIndex < REMATCH_TABLE_ENTRIES)
    return FlagGet(TRAINER_REGISTERED_FLAGS_START + rematchIndex);
  return false;
}

/** 1:1 `int IsMatchCallListInitFinished(void)` (pokenav_match_call_list.c:269-273). */
export function IsMatchCallListInitFinished(): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  return state.initFinished;
}

/** 1:1 `int GetNumberRegistered(void)` (pokenav_match_call_list.c:275-279). */
export function GetNumberRegistered(): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  return state.numRegistered;
}

/** 1:1 `static int GetNumSpecialTrainers(void)` (pokenav_match_call_list.c:281-285). */
function GetNumSpecialTrainers(): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  return state.numSpecialTrainers;
}

/** 1:1 `static int GetNumNormalTrainers(void)` (pokenav_match_call_list.c:287-291). */
function GetNumNormalTrainers(): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  return state.numRegistered - state.numSpecialTrainers;
}

/** 1:1 `static int GetNormalTrainerHeaderId(int index)` (pokenav_match_call_list.c:293-301). */
function GetNormalTrainerHeaderId(index: number): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  index += state.numSpecialTrainers;
  if (index >= state.numRegistered)
    return REMATCH_TABLE_ENTRIES;
  return state.matchCallEntries[index].headerId;
}

/** 1:1 `struct PokenavMatchCallEntry *GetMatchCallList(void)` (pokenav_match_call_list.c:303-307). */
export function GetMatchCallList(): any {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  return state.matchCallEntries;
}

/** 1:1 `mapsec_u16_t GetMatchCallMapSec(int index)` (pokenav_match_call_list.c:309-313). */
export function GetMatchCallMapSec(index: number): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  return state.matchCallEntries[index].mapSec;
}

/** 1:1 `bool32 ShouldDrawRematchPokeballIcon(int index)` (pokenav_match_call_list.c:315-327). */
export function ShouldDrawRematchPokeballIcon(index: number): boolean {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  if (!state.matchCallEntries[index].isSpecialTrainer)
    index = state.matchCallEntries[index].headerId;
  else
    index = MatchCall_GetRematchTableIdx(state.matchCallEntries[index].headerId);
  if (index == REMATCH_TABLE_ENTRIES)
    return false;
  return gSaveBlock1Ptr.trainerRematches[index] != 0;
}

/** 1:1 `int GetMatchCallTrainerPic(int index)` (pokenav_match_call_list.c:329-349). */
export function GetMatchCallTrainerPic(index: number): number {
  let headerId = 0;
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  if (!state.matchCallEntries[index].isSpecialTrainer)
  {
    index = GetTrainerIdxByRematchIdx(state.matchCallEntries[index].headerId);
    return gTrainers[index].trainerPic;
  }
  headerId = state.matchCallEntries[index].headerId;
  index = MatchCall_GetRematchTableIdx(headerId);
  if (index != REMATCH_TABLE_ENTRIES)
  {
    index = GetTrainerIdxByRematchIdx(index);
    return gTrainers[index].trainerPic;
  }
  index = MatchCall_GetOverrideFacilityClass(headerId);
  return gFacilityClassToPicIndex[index];
}

/** 1:1 `const u8 *GetMatchCallMessageText(int index, bool8 *newRematchRequest)` (pokenav_match_call_list.c:351-364). */
export function GetMatchCallMessageText(index: number, newRematchRequest: { v: number }): Uint8Array | null {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  newRematchRequest.v = false;
  if (!Overworld_MapTypeAllowsTeleportAndFly(gMapHeader.mapType))
    return getString('gText_CallCantBeMadeHere');
  if (!state.matchCallEntries[index].isSpecialTrainer)
    newRematchRequest.v = SelectMatchCallMessage(GetTrainerIdxByRematchIdx(state.matchCallEntries[index].headerId), gStringVar4);
  else
    MatchCall_GetMessage(state.matchCallEntries[index].headerId, gStringVar4);
  return gStringVar4;
}

/** 1:1 `const u8 *GetMatchCallFlavorText(int index, int checkPageEntry)` (pokenav_match_call_list.c:366-382). */
export function GetMatchCallFlavorText(index: number, checkPageEntry: number): Uint8Array | null {
  let rematchId = 0;
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  if (state.matchCallEntries[index].isSpecialTrainer)
  {
    rematchId = MatchCall_GetRematchTableIdx(state.matchCallEntries[index].headerId);
    if (rematchId == REMATCH_TABLE_ENTRIES)
      return MatchCall_GetOverrideFlavorText(state.matchCallEntries[index].headerId, checkPageEntry);
  }
  else
  {
    rematchId = state.matchCallEntries[index].headerId;
  }
  return gMatchCallFlavorTexts[rematchId][checkPageEntry];
}

/** 1:1 `u16 GetMatchCallOptionCursorPos(void)` (pokenav_match_call_list.c:384-388). */
export function GetMatchCallOptionCursorPos(): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  return state.optionCursorPos;
}

/** 1:1 `u16 GetMatchCallOptionId(int optionId)` (pokenav_match_call_list.c:390-397). */
export function GetMatchCallOptionId(optionId: number): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  if (state.maxOptionId < optionId)
    return MATCH_CALL_OPTION_COUNT;
  return state.matchCallOptions[optionId];
}

/**
 * French Difference
*/

/** 1:1 `void BufferMatchCallNameAndDesc(struct PokenavMatchCallEntry *matchCallEntry, u8 *str)` (pokenav_match_call_list.c:402-428). */
export function BufferMatchCallNameAndDesc(matchCallEntry: any, str: Uint8Array): void {
  let trainerName: any = null;
  let className: any = null;
  if (!matchCallEntry.isSpecialTrainer)
  {
    let trainer = gTrainers[GetTrainerIdxByRematchIdx(matchCallEntry.headerId)] /* TRANSPILER-TODO &élément scalaire (out-param ?) */;
    let class_ = trainer.trainerClass;
    let gender = trainer.encounterMusic_gender;
    className = GetTrainerClassNameGenderSpecific(class_, gender, trainer.trainerName);
    trainerName = trainer.trainerName;
  }
  else
  {
    MatchCall_GetNameAndDesc(matchCallEntry.headerId, className, trainerName);
  }
  if (className && trainerName)
  {
    let str2 = GetStringClearToWidth(str, FONT_NARROW, className, 69);
    GetStringClearToWidth(str2, FONT_NARROW, trainerName, 57);
  }
  else
  {
    GetStringClearToWidth(str, FONT_NARROW, null, 126);
  }
}

/** 1:1 `mapsec_u8_t GetMatchTableMapSectionId(int rematchIndex)` (pokenav_match_call_list.c:430-435). */
export function GetMatchTableMapSectionId(rematchIndex: number): number {
  let mapGroup = gRematchTable[rematchIndex].mapGroup;
  let mapNum = gRematchTable[rematchIndex].mapNum;
  return Overworld_GetMapHeaderByGroupAndId(mapGroup, mapNum).regionMapSectionId;
}

/** 1:1 `int GetIndexDeltaOfNextCheckPageDown(int index)` (pokenav_match_call_list.c:437-452). */
export function GetIndexDeltaOfNextCheckPageDown(index: number): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  let count = 1;
  while (++index < state.numRegistered)
  {
    if (!state.matchCallEntries[index].isSpecialTrainer)
      return count;
    if (MatchCall_HasCheckPage(state.matchCallEntries[index].headerId))
      return count;
    count++;
  }
  return 0;
}

/** 1:1 `int GetIndexDeltaOfNextCheckPageUp(int index)` (pokenav_match_call_list.c:454-469). */
export function GetIndexDeltaOfNextCheckPageUp(index: number): number {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  let count = -1;
  while (--index >= 0)
  {
    if (!state.matchCallEntries[index].isSpecialTrainer)
      return count;
    if (MatchCall_HasCheckPage(state.matchCallEntries[index].headerId))
      return count;
    count--;
  }
  return 0;
}

/** 1:1 `static bool32 HasRematchEntry(void)` (pokenav_match_call_list.c:471-492). */
function HasRematchEntry(): boolean {
  let i = 0;
  for (i = 0; i < REMATCH_TABLE_ENTRIES; i++)
  {
    if (IsRematchEntryRegistered(i) && gSaveBlock1Ptr.trainerRematches[i])
      return true;
  }
  for (i = 0; i < MC_HEADER_COUNT; i++)
  {
    if (MatchCall_GetEnabled(i))
    {
      let index = MatchCall_GetRematchTableIdx(i);
      if (gSaveBlock1Ptr.trainerRematches[index])
        return true;
    }
  }
  return false;
}

/** 1:1 `static bool32 ShouldDoNearbyMessage(void)` (pokenav_match_call_list.c:494-520). */
function ShouldDoNearbyMessage(): boolean {
  let state = GetSubstructPtr(POKENAV_SUBSTRUCT_MATCH_CALL_MAIN);
  let selection = PokenavList_GetSelectedIndex();
  if (!state.matchCallEntries[selection].isSpecialTrainer)
  {
    if (GetMatchCallMapSec(selection) == gMapHeader.regionMapSectionId)
    {
      if (!gSaveBlock1Ptr.trainerRematches[state.matchCallEntries[selection].headerId])
        return true;
    }
  }
  else
  {
    if (state.matchCallEntries[selection].headerId == MC_HEADER_WATTSON)
    {
      if (GetMatchCallMapSec(selection) == gMapHeader.regionMapSectionId && FlagGet(FLAG_BADGE05_GET))
      {
        if (!FlagGet(FLAG_WATTSON_REMATCH_AVAILABLE))
          return true;
      }
    }
  }
  return false;
}
