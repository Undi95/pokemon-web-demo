// AUTO-GENERATED from src/frontier_util.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/frontier_util.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `count` */
export const numEligibleMons_EXPR = "count";
/** Raw expr: `emptyId` */
export const ZERO_EXPR = "emptyId";
export const FRONTIER_BRAIN_OTID = 61226;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sFrontierResultsWindowTemplate = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 28, height: 18, paletteNum: 15, baseBlock: 1 } as const;
export const sLinkContestResultsWindowTemplate = { bg: 0, tilemapLeft: 2, tilemapTop: 2, width: 26, height: 15, paletteNum: 15, baseBlock: 1 } as const;
export const sRankingHallRecordsWindowTemplate = { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 17, paletteNum: 15, baseBlock: 1 } as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sLevelModeText = ['gText_RecordsLv50', 'gText_RecordsOpenLevel'] as const;
export const sHallFacilityToRecordsText = ['gText_FrontierFacilityWinStreak', 'gText_FrontierFacilityWinStreak', 'gText_FrontierFacilityWinStreak', 'gText_FrontierFacilityClearStreak', 'gText_FrontierFacilityWinStreak', 'gText_FrontierFacilityKOsStreak', 'gText_FrontierFacilityWinStreak', 'gText_FrontierFacilityRoomsCleared', 'gText_FrontierFacilityFloorsCleared', 'gText_FrontierFacilityWinStreak'] as const;
export const sFrontierBrainPlayerLostSilverTexts = ['gText_AnabelWonSilver', 'gText_TuckerWonSilver', 'gText_SpenserWonSilver', 'gText_GretaWonSilver', 'gText_NolandWonSilver', 'gText_LucyWonSilver', 'gText_BrandonWonSilver'] as const;
export const sFrontierBrainPlayerWonSilverTexts = ['gText_AnabelDefeatSilver', 'gText_TuckerDefeatSilver', 'gText_SpenserDefeatSilver', 'gText_GretaDefeatSilver', 'gText_NolandDefeatSilver', 'gText_LucyDefeatSilver', 'gText_BrandonDefeatSilver'] as const;
export const sFrontierBrainPlayerLostGoldTexts = ['gText_AnabelWonGold', 'gText_TuckerWonGold', 'gText_SpenserWonGold', 'gText_GretaWonGold', 'gText_NolandWonGold', 'gText_LucyWonGold', 'gText_BrandonWonGold'] as const;
export const sFrontierBrainPlayerWonGoldTexts = ['gText_AnabelDefeatGold', 'gText_TuckerDefeatGold', 'gText_SpenserDefeatGold', 'gText_GretaDefeatGold', 'gText_NolandDefeatGold', 'gText_LucyDefeatGold', 'gText_BrandonDefeatGold'] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sFrontierUtilFuncs = ['GetChallengeStatus', 'GetFrontierData', 'SetFrontierData', 'SetSelectedPartyOrder', 'DoSoftReset_', 'SetFrontierTrainers', 'SaveSelectedParty', 'ShowFacilityResultsWindow', 'CheckPutFrontierTVShowOnAir', 'Script_GetFrontierBrainStatus', 'IsTrainerFrontierBrain', 'GiveBattlePoints', 'GetFacilitySymbolCount', 'GiveFacilitySymbol', 'CheckBattleTypeFlag', 'CheckPartyIneligibility', 'ValidateVisitingTrainer', 'IncrementWinStreak', 'RestoreHeldItems', 'SaveRecordBattle', 'BufferFrontierTrainerName', 'ResetSketchedMoves', 'SetFacilityBrainObjectEvent'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetChallengeStatus', ret: "void", arity: 0, params: "void" },
  { name: 'GetFrontierData', ret: "void", arity: 0, params: "void" },
  { name: 'SetFrontierData', ret: "void", arity: 0, params: "void" },
  { name: 'SetSelectedPartyOrder', ret: "void", arity: 0, params: "void" },
  { name: 'DoSoftReset_', ret: "void", arity: 0, params: "void" },
  { name: 'SetFrontierTrainers', ret: "void", arity: 0, params: "void" },
  { name: 'SaveSelectedParty', ret: "void", arity: 0, params: "void" },
  { name: 'ShowFacilityResultsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'CheckPutFrontierTVShowOnAir', ret: "void", arity: 0, params: "void" },
  { name: 'Script_GetFrontierBrainStatus', ret: "void", arity: 0, params: "void" },
  { name: 'IsTrainerFrontierBrain', ret: "void", arity: 0, params: "void" },
  { name: 'GiveBattlePoints', ret: "void", arity: 0, params: "void" },
  { name: 'GetFacilitySymbolCount', ret: "void", arity: 0, params: "void" },
  { name: 'GiveFacilitySymbol', ret: "void", arity: 0, params: "void" },
  { name: 'CheckBattleTypeFlag', ret: "void", arity: 0, params: "void" },
  { name: 'CheckPartyIneligibility', ret: "void", arity: 0, params: "void" },
  { name: 'ValidateVisitingTrainer', ret: "void", arity: 0, params: "void" },
  { name: 'IncrementWinStreak', ret: "void", arity: 0, params: "void" },
  { name: 'RestoreHeldItems', ret: "void", arity: 0, params: "void" },
  { name: 'SaveRecordBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BufferFrontierTrainerName', ret: "void", arity: 0, params: "void" },
  { name: 'ResetSketchedMoves', ret: "void", arity: 0, params: "void" },
  { name: 'SetFacilityBrainObjectEvent', ret: "void", arity: 0, params: "void" },
  { name: 'ShowTowerResultsWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowDomeResultsWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowPalaceResultsWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowPikeResultsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ShowFactoryResultsWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowArenaResultsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPyramidResultsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ShowLinkContestResultsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'CopyFrontierBrainText', ret: "void", arity: 1, params: "bool8 playerWonText" },
  { name: 'CallFrontierUtilFunc', ret: "void", arity: 0, params: "void" },
  { name: 'IsWinStreakActive', ret: "bool8", arity: 1, params: "u32 challenge" },
  { name: 'PrintAligned', ret: "void", arity: 2, params: "const u8 *str, s32 y" },
  { name: 'PrintHyphens', ret: "void", arity: 1, params: "s32 y" },
  { name: 'TowerPrintStreak', ret: "void", arity: 5, params: "const u8 *str, u16 num, u8 x1, u8 x2, u8 y" },
  { name: 'TowerPrintRecordStreak', ret: "void", arity: 5, params: "u8 battleMode, u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'TowerGetWinStreak', ret: "u16", arity: 2, params: "u8 battleMode, u8 lvlMode" },
  { name: 'TowerPrintPrevOrCurrentStreak', ret: "void", arity: 5, params: "u8 battleMode, u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'StringExpandPlaceholders', ret: "else", arity: 2, params: "gStringVar4, gText_LinkMultiBattleRoomResults" },
  { name: 'DomeGetWinStreak', ret: "u16", arity: 2, params: "u8 battleMode, u8 lvlMode" },
  { name: 'PrintTwoStrings', ret: "void", arity: 6, params: "const u8 *str1, const u8 *str2, u16 num, u8 x1, u8 x2, u8 y" },
  { name: 'DomePrintPrevOrCurrentStreak', ret: "void", arity: 5, params: "u8 battleMode, u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'PalacePrintStreak', ret: "void", arity: 5, params: "const u8 *str, u16 num, u8 x1, u8 x2, u8 y" },
  { name: 'PalacePrintRecordStreak', ret: "void", arity: 5, params: "u8 battleMode, u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'PalaceGetWinStreak', ret: "u16", arity: 2, params: "u8 battleMode, u8 lvlMode" },
  { name: 'PalacePrintPrevOrCurrentStreak', ret: "void", arity: 5, params: "u8 battleMode, u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'PikeGetWinStreak', ret: "u16", arity: 1, params: "u8 lvlMode" },
  { name: 'PikePrintCleared', ret: "void", arity: 6, params: "const u8 *str1, const u8 *str2, u16 num, u8 x1, u8 x2, u8 y" },
  { name: 'PikePrintPrevOrCurrentStreak', ret: "void", arity: 4, params: "u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'ArenaPrintStreak', ret: "void", arity: 5, params: "const u8 *str, u16 num, u8 x1, u8 x2, u8 y" },
  { name: 'ArenaPrintRecordStreak', ret: "void", arity: 4, params: "u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'ArenaGetWinStreak', ret: "u16", arity: 1, params: "u8 lvlMode" },
  { name: 'ArenaPrintPrevOrCurrentStreak', ret: "void", arity: 4, params: "u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'FactoryPrintStreak', ret: "void", arity: 7, params: "const u8 *str, u16 num1, u16 num2, u8 x1, u8 x2, u8 x3, u8 y" },
  { name: 'FactoryPrintRecordStreak', ret: "void", arity: 6, params: "u8 battleMode, u8 lvlMode, u8 x1, u8 x2, u8 x3, u8 y" },
  { name: 'FactoryGetWinStreak', ret: "u16", arity: 2, params: "u8 battleMode, u8 lvlMode" },
  { name: 'FactoryGetRentsCount', ret: "u16", arity: 2, params: "u8 battleMode, u8 lvlMode" },
  { name: 'FactoryPrintPrevOrCurrentStreak', ret: "void", arity: 6, params: "u8 battleMode, u8 lvlMode, u8 x1, u8 x2, u8 x3, u8 y" },
  { name: 'PyramidPrintStreak', ret: "void", arity: 5, params: "const u8 *str, u16 num, u8 x1, u8 x2, u8 y" },
  { name: 'PyramidPrintRecordStreak', ret: "void", arity: 4, params: "u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'PyramidGetWinStreak', ret: "u16", arity: 1, params: "u8 lvlMode" },
  { name: 'PyramidPrintPrevOrCurrentStreak', ret: "void", arity: 4, params: "u8 lvlMode, u8 x1, u8 x2, u8 y" },
  { name: 'TryPutFrontierTVShowOnAir', ret: "else", arity: 2, params: "gSaveBlock2Ptr->frontier.domeWinStreaks[battleMode][lvlMode], FRONTIER_SHOW_DOME_DOUBLES" },
  { name: 'GetFrontierBrainStatus', ret: "u8", arity: 0, params: "void" },
  { name: 'CopyFrontierTrainerText', ret: "void", arity: 2, params: "u8 whichText, u16 trainerId" },
  { name: 'BufferApprenticeChallengeText', ret: "else", arity: 1, params: "trainerId - TRAINER_RECORD_MIXING_APPRENTICE" },
  { name: 'FrontierSpeechToString', ret: "else", arity: 1, params: "gSaveBlock2Ptr->frontier.towerRecords[trainerId - TRAINER_RECORD_MIXING_FRIEND].speechWon" },
  { name: 'ResetWinStreaks', ret: "void", arity: 0, params: "void" },
  { name: 'GetCurrentFacilityWinStreak', ret: "u32", arity: 0, params: "void" },
  { name: 'ResetFrontierTrainerIds', ret: "void", arity: 0, params: "void" },
  { name: 'GetPlayerSymbolCountForFacility', ret: "u8", arity: 1, params: "u8 facility" },
  { name: 'FlagSet', ret: "else", arity: 1, params: "FLAG_SYS_TOWER_GOLD + facility * 2" },
  { name: 'AppendCaughtBannedMonSpeciesName', ret: "u8", arity: 3, params: "u16 species, u8 count, s32 numBannedMonsCaught" },
  { name: 'StringAppend', ret: "else", arity: 2, params: "gStringVar1, gText_CommaSpace" },
  { name: 'AppendIfValid', ret: "void", arity: 8, params: "u16 species, u16 heldItem, u16 hp, u8 lvlMode, u8 monLevel, u16 *speciesArray, u16 *itemsArray, u8 *count" },
  { name: 'Print1PRecord', ret: "void", arity: 5, params: "s32 position, s32 x, s32 y, struct RankingHall1P *hallRecord, s32 hallFacilityId" },
  { name: 'Print2PRecord', ret: "void", arity: 4, params: "s32 position, s32 x, s32 y, struct RankingHall2P *hallRecord" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "text, hallRecord->name2" },
  { name: 'Fill1PRecords', ret: "void", arity: 3, params: "struct RankingHall1P *dst, s32 hallFacilityId, s32 lvlMode" },
  { name: 'Fill2PRecords', ret: "void", arity: 2, params: "struct RankingHall2P *dst, s32 lvlMode" },
  { name: 'PrintHallRecords', ret: "void", arity: 2, params: "s32 hallFacilityId, s32 lvlMode" },
  { name: 'ShowRankingHallRecordsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ScrollRankingHallRecordsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ClearRankingHallRecords', ret: "void", arity: 0, params: "void" },
  { name: 'SaveGameFrontier', ret: "void", arity: 0, params: "void" },
  { name: 'GetFrontierBrainTrainerPicIndex', ret: "u8", arity: 0, params: "void" },
  { name: 'GetFrontierBrainTrainerClass', ret: "u8", arity: 0, params: "void" },
  { name: 'CopyFrontierBrainTrainerName', ret: "void", arity: 1, params: "u8 *dst" },
  { name: 'IsFrontierBrainFemale', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetFrontierBrainObjEventGfx_2', ret: "void", arity: 0, params: "void" },
  { name: 'CreateFrontierBrainPokemon', ret: "void", arity: 0, params: "void" },
  { name: 'GetFrontierBrainMonSpecies', ret: "u16", arity: 1, params: "u8 monId" },
  { name: 'SetFrontierBrainObjEventGfx', ret: "void", arity: 1, params: "u8 facility" },
  { name: 'GetFrontierBrainMonMove', ret: "u16", arity: 2, params: "u8 monId, u8 moveSlotId" },
  { name: 'GetFrontierBrainMonNature', ret: "u8", arity: 1, params: "u8 monId" },
  { name: 'GetFrontierBrainMonEvs', ret: "u8", arity: 2, params: "u8 monId, u8 evStatId" },
  { name: 'GetFronterBrainSymbol', ret: "s32", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'frontier_util.h',
  'event_data.h',
  'battle_setup.h',
  'overworld.h',
  'random.h',
  'battle_tower.h',
  'field_specials.h',
  'battle.h',
  'script_pokemon_util.h',
  'main.h',
  'window.h',
  'menu.h',
  'text.h',
  'battle_records.h',
  'international_string_util.h',
  'string_util.h',
  'new_game.h',
  'link.h',
  'tv.h',
  'apprentice.h',
  'pokedex.h',
  'recorded_battle.h',
  'data.h',
  'record_mixing.h',
  'strings.h',
  'malloc.h',
  'save.h',
  'load_save.h',
  'battle_dome.h',
  'constants/battle_frontier.h',
  'constants/battle_pike.h',
  'constants/frontier_util.h',
  'constants/trainers.h',
  'constants/game_stat.h',
  'constants/moves.h',
  'constants/items.h',
  'constants/event_objects.h',
  'party_menu.h',
] as const;
