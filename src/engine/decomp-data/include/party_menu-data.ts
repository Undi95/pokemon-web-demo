// AUTO-GENERATED from include/party_menu.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/party_menu.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimatePartySlot', ret: "void", arity: 2, params: "u8 slot, u8 animNum" },
  { name: 'IsMultiBattle', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetCursorSelectionMonId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetPartyMenuType', ret: "u8", arity: 0, params: "void" },
  { name: 'Task_HandleChooseMonInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DisplayPartyMenuMessage', ret: "u8", arity: 2, params: "const u8 *str, bool8 keepOpen" },
  { name: 'IsPartyMenuTextPrinterActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'PartyMenuModifyHP', ret: "void", arity: 5, params: "u8 taskId, u8 slot, s8 hpIncrement, s16 hpDifference, TaskFunc task" },
  { name: 'GetAilmentFromStatus', ret: "u8", arity: 1, params: "u32 status" },
  { name: 'GetMonAilment', ret: "u8", arity: 1, params: "struct Pokemon *mon" },
  { name: 'DisplayPartyMenuStdMessage', ret: "void", arity: 1, params: "u32 stringId" },
  { name: 'FieldCallback_PrepareFadeInFromMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_ReturnToPartyMenuFromFlyMap', ret: "void", arity: 0, params: "void" },
  { name: 'LoadHeldItemIcons', ret: "void", arity: 0, params: "void" },
  { name: 'DrawHeldItemIconsForTrade', ret: "void", arity: 3, params: "u8 *partyCounts, u8 *partySpriteIds, u8 whichParty" },
  { name: 'CB2_ShowPartyMenuForItemUse', ret: "void", arity: 0, params: "void" },
  { name: 'ItemUseCB_Medicine', ret: "void", arity: 2, params: "u8 taskId, TaskFunc task" },
  { name: 'ItemUseCB_ReduceEV', ret: "void", arity: 2, params: "u8 taskId, TaskFunc task" },
  { name: 'ItemUseCB_PPRecovery', ret: "void", arity: 2, params: "u8 taskId, TaskFunc task" },
  { name: 'ItemUseCB_PPUp', ret: "void", arity: 2, params: "u8 taskId, TaskFunc task" },
  { name: 'ItemIdToBattleMoveId', ret: "u16", arity: 1, params: "u16 item" },
  { name: 'IsMoveHm', ret: "bool8", arity: 1, params: "u16 move" },
  { name: 'MonKnowsMove', ret: "bool8", arity: 2, params: "struct Pokemon *mon, u16 move" },
  { name: 'ItemUseCB_TMHM', ret: "void", arity: 2, params: "u8 taskId, TaskFunc task" },
  { name: 'ItemUseCB_RareCandy', ret: "void", arity: 2, params: "u8 taskId, TaskFunc task" },
  { name: 'ItemUseCB_SacredAsh', ret: "void", arity: 2, params: "u8 taskId, TaskFunc task" },
  { name: 'ItemUseCB_EvolutionStone', ret: "void", arity: 2, params: "u8 taskId, TaskFunc task" },
  { name: 'GetItemEffectType', ret: "u8", arity: 1, params: "u16 item" },
  { name: 'CB2_PartyMenuFromStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ChooseMonToGiveItem', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseMonToGiveMailFromMailbox', ret: "void", arity: 0, params: "void" },
  { name: 'InitChooseHalfPartyForBattle', ret: "void", arity: 1, params: "u8 unused" },
  { name: 'ClearSelectedPartyOrder', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseMonForTradingBoard', ret: "void", arity: 2, params: "u8 menuType, MainCallback callback" },
  { name: 'ChooseMonForMoveTutor', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseMonForWirelessMinigame', ret: "void", arity: 0, params: "void" },
  { name: 'OpenPartyMenuInBattle', ret: "void", arity: 1, params: "u8 partyAction" },
  { name: 'ChooseMonForInBattleItem', ret: "void", arity: 0, params: "void" },
  { name: 'BufferBattlePartyCurrentOrder', ret: "void", arity: 0, params: "void" },
  { name: 'BufferBattlePartyCurrentOrderBySide', ret: "void", arity: 2, params: "u8 battler, u8 flankId" },
  { name: 'SwitchPartyOrderLinkMulti', ret: "void", arity: 3, params: "u8 battler, u8 slot, u8 slot2" },
  { name: 'SwitchPartyMonSlots', ret: "void", arity: 2, params: "u8 slot, u8 slot2" },
  { name: 'GetPartyIdFromBattlePartyId', ret: "u8", arity: 1, params: "u8 battlePartyId" },
  { name: 'ShowPartyMenuToShowcaseMultiBattleParty', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseMonForDaycare', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_FadeFromPartyMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'ChooseContestMon', ret: "void", arity: 0, params: "void" },
  { name: 'ChoosePartyMon', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseMonForMoveRelearner', ret: "void", arity: 0, params: "void" },
  { name: 'BattlePyramidChooseMonHeldItems', ret: "void", arity: 0, params: "void" },
  { name: 'DoBattlePyramidMonsHaveHeldItem', ret: "void", arity: 0, params: "void" },
  { name: 'IsSelectedMonEgg', ret: "void", arity: 0, params: "void" },
  { name: 'IsLastMonThatKnowsSurf', ret: "void", arity: 0, params: "void" },
  { name: 'MoveDeleterForgetMove', ret: "void", arity: 0, params: "void" },
  { name: 'BufferMoveDeleterNicknameAndMove', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumMovesSelectedMonHas', ret: "void", arity: 0, params: "void" },
  { name: 'MoveDeleterChooseMoveToForget', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandleChooseMonInput',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ChooseMonToGiveItem',
  'CB2_PartyMenuFromStartMenu',
  'CB2_ReturnToPartyMenuFromFlyMap',
  'CB2_ShowPartyMenuForItemUse',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'main.h',
  'task.h',
] as const;
