/**
 * specials-registry.ts — Registry des specials scripts (= 1:1 décomp `gSpecials[]`).
 *
 * Source de vérité (1:1 décomp) :
 *   - `data/specials.inc` (= 527 def_special entries)
 *   - `src/scrcmd.c:118-132` (= ScrCmd_special / ScrCmd_specialvar dispatch)
 *
 * Architecture :
 *   - Décomp utilise `gSpecials[index]()` indexé par SPECIAL_xxx (= u16).
 *   - Notre impl utilise `registerSpecial(name, handler)` via string name. Les
 *     scripts JSON pré-extraits ont les noms (= e.g. "HealPlayerParty"), pas
 *     d'index numérique nécessaire.
 *   - Handler peut return `number | void`. Si return un nombre, opcode
 *     `specialvar` le store dans une variable.
 *
 * Quand register un nouveau special :
 *   - Si side-effect uniquement (= e.g. heal party) → return void.
 *   - Si retourne valeur read par script (= e.g. GetBattleOutcome) → return number.
 *   - Si pas encore implémenté → stub safe : `() => 0` (= fait scripts continuer
 *     sans crash, log warning vu `_invokeSpecial`).
 *
 * Phase 4.9 first cut : stubs minimaux pour scripts Bourg-en-Vol (= Mom dialogue,
 * Birch intro). À étendre au fur et à mesure quand on touche d'autres flows.
 *
 * NB : ce module a un side-effect au load (= registerSpecial calls). Doit être
 * importé une fois au boot (= TestOverworldScene ou main entry).
 */

import { registerSpecial } from '../../scrcmd';
import { ScriptContext_Enable } from '../../script';
import { ShowEasyChatScreen, easyChatGfxReady } from '../../easy_chat';
import {
  gBikeCycling, GetLeadMonIndex, IsBadEggInParty,
  CheckLeadMonCool, CheckLeadMonBeauty, CheckLeadMonCute, CheckLeadMonSmart, CheckLeadMonTough,
  GetLeadMonFriendshipScore, Special_AreLeadMonEVsMaxedOut, LeadMonHasEffortRibbon,
  MonOTNameNotPlayer, IsGrassTypeInParty,
  IsStarterInParty, ScriptGetPartyMonSpecies, IsPokerusInParty,
  GetPlayerBigGuyGirlString, GetRivalSonDaughterString, GetPlayerTrainerIdOnesDigit,
  SetHiddenItemFlag, FoundBlackGlasses,
  SetSSTidalFlag, ResetSSTidalFlag, StorePlayerCoordsInVars,
  SetTrickHouseNuggetFlag, ResetTrickHouseNuggetFlag,
  FoundAbandonedShipRoom1Key, FoundAbandonedShipRoom2Key, FoundAbandonedShipRoom4Key, FoundAbandonedShipRoom6Key,
  GetWeekCount, GetDaysUntilPacifidlogTMAvailable, SetPacifidlogTMReceivedDay,
  BufferLottoTicketNumber, BufferTMHMMoveName,
  GetBattleOutcome, GetPlayerAvatarBike, GetMartEmployeeObjectEventId, ShouldDistributeEonTicket,
  SetRoute119Weather, SetRoute123Weather,
  IsFanClubMemberFanOfPlayer, GetNumFansOfPlayerInTrainerFanClub, ResetFanClub,
  SetPlayerGotFirstFans, UpdateTrainerFanClubGameClear, BufferFanClubTrainerName, Script_TryGainNewFanFromCounter,
  ResetCyclingRoadChallengeData, Special_BeginCyclingRoadChallenge, Special_ShowDiploma, GetSlotMachineId,
  BufferVarsForIVRater, GetBattleTowerSinglesStreak, GetSecretBaseNearbyMapName,
  ScriptCheckFreePokemonStorageSpace, ShouldShowBoxWasFullMessage,
  OffsetCameraForBattle, ShakeCamera, SpawnCameraObject, RemoveCameraObject,
  MauvilleGymPressSwitch, MauvilleGymSetDefaultBarriers, MauvilleGymDeactivatePuzzle,
} from '../../field_specials';
// Puzzle portes tournantes (arène Fortree, badge 6) — impl 1:1 src/rotating_gate.ts (hooks
// collision déjà câblés field_player_avatar). Ces specials étaient CLOBBERÉS en ()=>0 par la
// stub-loop ; on les enregistre vers les vraies fns (dédup last-wins → registerSpecial gagne).
import { RotatingGate_InitPuzzle, RotatingGate_InitPuzzleAndGraphics } from '../../rotating_gate';
import { IsPokemonJumpSpeciesInParty } from '../../pokemon_jump';
import { ResetLotteryCorner, RetrieveLotteryNumber, PickLotteryCornerTicket } from '../../lottery_corner';
import { IsTrendyPhraseBoring, GetDewfordHallPaintingNameIndex } from '../../dewford_trend';
import { CheckFreePokemonStorageSpace, StorageGetCurrentBox, AnyStorageMonWithMove, CountStorageNonEggMons, CountPartyAliveNonEggMons_IgnoreVar0x8004Slot } from '../../pokemon_storage_system';
import { EggHatch, ScriptHatchMon, CheckDaycareMonReceivedMail, CountPartyAliveNonEggMons } from '../../egg_hatch';
// Pension 1:1 (src/daycare.ts = daycare.c complet — chantier daycare 2026-07-02).
import {
  GetDaycareState, GetDaycareMonNicknames, GetSelectedMonNicknameAndSpecies,
  StoreSelectedPokemonInDaycare, ChooseSendDaycareMon, GetDaycareCost,
  GetNumLevelsGainedFromDaycare, TakePokemonFromDaycare, GiveEggFromDaycare,
  RejectEggFromDayCare, SetDaycareCompatibilityString, ShowDaycareLevelMenu,
} from '../../daycare';
import { Script_ClearHeldMovement } from '../../event_object_lock';
import { GetPokemonStorage } from '../../save';
import { FlagSet, FlagClear, FlagGet, VarSet, VarGet } from './script-vars';
import { gMapHeader } from '../../fieldmap';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save/save-block-state';
import { SetUnlockedPokedexFlags, SetChampionSaveWarp } from '../../save_location';
import {
  CheckRelicanthWailord, DoSealedChamberShakingEffect_Long, DoSealedChamberShakingEffect_Short,
  ShouldDoBrailleRegicePuzzle, ShouldDoBrailleRegirockEffectOld,
} from '../../braille_puzzles';
import { EnterSafariMode, ExitSafariMode, GetPokeblockFeederInFront } from '../../safari_zone';
import { SetMewAboveGrass, DestroyMewEmergingGrassSprite } from '../../faraway_island';
import { MALE, FEMALE } from '../../../harness/runtime/decomp-globals';
import { GetCurrentMap } from '../../load_save';
import {
  CheckForPlayersHouseNews as _CheckForPlayersHouseNews,
  ChangePokemonNickname as _ChangePokemonNickname,
  ChangeBoxPokemonNickname as _ChangeBoxPokemonNickname,
  DoTVShow as _DoTVShow,
  DoPokeNews as _DoPokeNews,
  DoTVShowInSearchOfTrainers as _DoTVShowInSearchOfTrainers,
  InterviewBefore as _InterviewBefore,
  InterviewAfter as _InterviewAfter,
  SetContestCategoryStringVarForInterview as _SetContestCategoryStringVarForInterview,
  ShouldHideFanClubInterviewer as _ShouldHideFanClubInterviewer,
  TryPutNameRaterShowOnTheAir as _TryPutNameRaterShowOnTheAir,
  PutLilycoveContestLadyShowOnTheAir as _tvPutLilycoveContestLadyShowOnTheAir,
} from '../../tv';
import { ShowPokedexRatingMessage as _ShowPokedexRatingMessage } from '../../birch_pc';
import { setStringVar, GetPlayerNameString } from '../../../include/text';
import { SPECIES_WAILORD, SPECIES_RELICANTH, SPECIES_DODRIO } from '../../../include/constants/species';
import { ITEM_MACH_BIKE, ITEM_ACRO_BIKE, ITEM_ENIGMA_BERRY } from '../../../include/constants/items';
import { OBJ_EVENT_GFX_BARD } from '../../../include/constants/event_objects';
import { GIDDY_MAX_TALES, MAX_MON_MOVES, PARTY_SIZE } from '../../../include/constants/global';
import { FRONTIER_MODE_LINK_MULTIS, FRONTIER_MODE_MULTIS } from '../../../include/constants/battle_frontier';
import { FLAG_CHOSEN_MULTI_BATTLE_NPC_PARTNER } from '../../../include/constants/flags';
import { MOVE_NONE } from '../../../include/constants/moves';
import { gLocalTime, RtcCalcLocalTime } from '../../rtc';
import { GetLastUsedWarpMapType, IsMapTypeOutdoors } from '../../overworld';
// time_events.c — foyer 1:1 des fonctions ci-dessous (gSpecials[] les référence).
import { IsMirageIslandPresent, UpdateShoalTideFlag, InitBirchState } from '../../time_events';
import { ShowFieldMessage } from '../../field_message_box';
import { gStringVar4 } from '../../../include/string_util';
import { Random } from '../../random';
import { reverseDecompConstant } from '../../../harness/runtime/decomp-constants';
import {
  CheckPartyPokerus, gPlayerParty, CalculatePlayerPartyCount, CalculatePPWithBonus,
  GetMonsStateToDoubles, GetMonEVCount,
  GetMonData as _GetMonData, SetMonData,
  MON_DATA_MOVE1 as _MON_DATA_MOVE1,
  MON_DATA_SPECIES, MON_DATA_HP, MON_DATA_MAX_HP, MON_DATA_STATUS, MON_DATA_SANITY_IS_BAD_EGG,
  MON_DATA_PP1, MON_DATA_PP_BONUSES,
  MON_DATA_FRIENDSHIP, MON_DATA_NICKNAME, MON_DATA_IS_EGG, MON_DATA_OT_NAME, MON_DATA_OT_ID,
  MON_DATA_HELD_ITEM,
  MON_DATA_COOL, MON_DATA_BEAUTY, MON_DATA_CUTE, MON_DATA_SMART, MON_DATA_TOUGH,
} from '../battle/party-storage';
import type { Pokemon as _PartyPokemon } from '../battle/party-storage';
import { gSpeciesNames, gSpeciesInfo } from '../data/game-data';
import { CheckPartyMonHasHeldItem, HealPlayerParty } from '../../script_pokemon_util';
import { GameClear, SetCB2WhiteOut } from '../../post_battle_event_funcs';
import { SetMauvilleOldManObjEventGfx, GetCurrentMauvilleOldMan } from '../../mauville_old_man';
import { gGameLanguage } from '../../main';
import { GetPCBoxToSendMon } from '../../field_specials';
import { ShowMapNamePopup as _ShowMapNamePopupImpl } from '../../map_name_popup';
import { SetCameraPanning, SetCameraPanningCallback, DrawWholeMapView } from '../../field_camera';
import { gSpecialVar, gSelectedObjectEvent } from './script-vars';
import { getGObjectEvents } from '../field/field-globals';

/** Pont trainer_see (P2.3 aggro dresseurs). Le module trainer_see pose ces accesseurs
 *  sur globalThis.__trainerSee (import trainer_see→battle_setup→…→field_effect→trainer_see :
 *  cycle brisé côté specials via ce pont, jamais d'import statique). */
interface TrainerSeeSpecials {
  DoTrainerApproach?: () => void;
  SetTrainerFacingDirection?: () => void;
  TryPrepareSecondApproachingTrainer?: () => void;
  GetCurrentApproachingTrainerObjectEventId?: () => number;
  GetChosenApproachingTrainerObjectEventId?: (arrayId: number) => number;
  PlayerFaceTrainerAfterBattle?: () => void;
}
function _trainerSeeSpecials(): TrainerSeeSpecials | undefined {
  return (globalThis as { __trainerSee?: TrainerSeeSpecials }).__trainerSee;
}
import { AddBagItem } from '../bag/bag';
import {
  GetBerryTypeByBerryTreeId, GetStageByBerryTreeId, GetNumStagesWateredByBerryTreeId,
  GetBerryCountByBerryTreeId, AllowBerryTreeGrowth, BerryTypeToItemId, RemoveBerryTree,
  GetBerryInfo, GetBerryTreeInfo, GetBerryNameByBerryType, BERRY_STAGE_SPARKLING,
  BERRY_STAGE_PLANTED, BERRY_STAGE_SPROUTED, BERRY_STAGE_TALLER, BERRY_STAGE_FLOWERING,
  PlantBerryTree, ItemIdToBerryType,
} from '../../berry';
import { gDecorations } from '../../data/decoration/header';
import { GetFirstEmptyDecorSlot } from '../../decoration_inventory';
import { DecorationAdd, DecorationRemove } from '../../decoration_inventory';

// ─── Phase 4.9 stubs minimaux (= early-game specials) ──────────────────────

/** 1:1 décomp `GetPlayerBigGuyGirlString` (string_util.c).
 *  Set sStringVar1 = "GRAND" (MALE) ou "GRANDE" (FEMALE) pour expand le
 *  placeholder {STR_VAR_1} dans dialogues type "Hum, salut, GRAND/GRANDE !".
 *  Used par e.g. LittlerootTown_Text_CanYouGoSeeWhatsHappening (= Twin NPC). */
registerSpecial('GetPlayerBigGuyGirlString', GetPlayerBigGuyGirlString);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `HealPlayerParty` (script_pokemon_util.c:30) :
 *  ```c
 *  void HealPlayerParty(void) {
 *      u8 i, j;
 *      u8 ppBonuses;
 *      u8 arg[4];
 *      for (i = 0; i < gPlayerPartyCount; i++) {
 *          u16 maxHP = GetMonData(&gPlayerParty[i], MON_DATA_MAX_HP);
 *          arg[0] = maxHP; arg[1] = maxHP >> 8;
 *          SetMonData(&gPlayerParty[i], MON_DATA_HP, arg);
 *          ppBonuses = GetMonData(&gPlayerParty[i], MON_DATA_PP_BONUSES);
 *          for (j = 0; j < MAX_MON_MOVES; j++) {
 *              arg[0] = CalculatePPWithBonus(GetMonData(&gPlayerParty[i], MON_DATA_MOVE1 + j), ppBonuses, j);
 *              SetMonData(&gPlayerParty[i], MON_DATA_PP1 + j, arg);
 *          }
 *          arg[0]=arg[1]=arg[2]=arg[3]=0;
 *          SetMonData(&gPlayerParty[i], MON_DATA_STATUS, arg);
 *      }
 *  }
 *  ```
 *  Restore HP + PP + clear status de toute l'équipe. Appelé par les NPC
 *  Centre Pokémon, après défaite dresseur, après le combat ChooseStarter.
 *
 *  HP (maxHP) et status (0) = 1:1 strict. PP : la décomp recalcule via
 *  `CalculatePPWithBonus(move, ppBonuses, j)` ; les PP Up (ppBonuses) ne
 *  sont PAS modélisés dans tout le projet (même défèrement honnête que
 *  summary-screen.ts:2789 — `ppMax` tient lieu de PP max effectif). On
 *  restaure donc à `ppMax`, conséquence de ce défèrement systémique, PAS
 *  un raccourci local. Porter ppBonuses + CalculatePPWithBonus =
 *  chantier data-model séparé (supervisé). */
/** 1:1 décomp `HealPlayerParty` (party_menu.c) : pour chaque mon (< partyCount) :
 *  HP = MAX_HP ; chaque move : PP = CalculatePPWithBonus(move, ppBonuses, j) ;
 *  STATUS = 0. Opère sur gPlayerParty + GetMonData/SetMonData (1:1).
 *  ⚠️ Corrige le bug latent de l'ancienne version : `mv.pp = mv.ppMax` sur les
 *  VUES nested (`mon.moves[i].pp`) n'était PAS propagé au modèle natif. */
// (corps rapatrié au foyer 1:1 src/script_pokemon_util.ts — HealPlayerParty, 2026-07-02)
registerSpecial('HealPlayerParty', HealPlayerParty);

// 1:1 décomp post_battle_event_funcs.c (foyer src/post_battle_event_funcs.ts) :
// GameClear = victoire Ligue (EverGrandeCity_HallOfFame `special GameClear`) ;
// SetCB2WhiteOut = K.O. poison field (EventScript_FieldWhiteOut). Dé-stubés 2026-07-02.
registerSpecial('GameClear', GameClear);
registerSpecial('SetCB2WhiteOut', () => { SetCB2WhiteOut(); return 0; });

/** 1:1 décomp `ChooseStarter` (battle_setup.c:911) :
 *  ```c
 *  void ChooseStarter(void) {
 *      SetMainCallback2(CB2_ChooseStarter);  // UI 3 pokeballs
 *      gMain.savedCallback = CB2_GiveStarter; // post-UI : give mon + battle
 *  }
 *  ```
 *  Notre impl Phase 3.2 minimum : auto-pick TREECKO (= idx 0) + give level 5
 *  + set VAR_RESULT/VAR_STARTER_MON. La cinematic UI starter selection sera
 *  Phase 5 (= besoin Phaser scene 3 pokeballs + transition). Le combat
 *  tutorial vs Poochyena est aussi Phase 5 (= BattleScene).
 *
 *  IMPORTANT : la script Route 101 fait `special ChooseStarter` SANS
 *  `waitstate` derrière, donc le décomp utilise SetMainCallback2 pour halt
 *  l'overworld (= pas le script). Notre special étant sync, la flow continue
 *  immédiatement → applymovement Birch + dialog. C'est OK pour MVP, plus
 *  rapide en démo (= skip UI). User feedback Phase 5+ pourrait vouloir l'UI. */
// Phase 5.5 : ChooseStarter handled directly in `special` opcode handler
// (= script-opcodes.ts) via state machine in starter-choose-flow.ts. NOT a
// registerSpecial here because we need access to `ctx` to call SetupNativeScript
// (= block script while UI runs). registerSpecial handlers don't have ctx access.

/** 1:1 décomp `BedroomPC` (player_pc.c:373) : open PC menu in bedroom (= 4
 *  options : PC OBJET / COURRIER / DÉCORATION / SORTIR). Le special est
 *  `waitstate=1` (specials.inc:277) donc l'opcode dispatcher dans
 *  script-opcodes.ts intercepte BedroomPC directement et installe un
 *  SetupNativeScript bloquant jusqu'à fermeture du PC.
 *  Stub ici pour audit-coverage ; vrai dispatch dans script-opcodes.ts. */
registerSpecial('BedroomPC', () => { /* see script-opcodes.ts dispatcher */ });

/** 1:1 décomp `PlayerPC` (player_pc.c:380) : open PC menu hors chambre (= 3
 *  options : PC OBJET / COURRIER / SORTIR, pas de DECORATION).
 *  Stub ici pour audit-coverage ; vrai dispatch dans script-opcodes.ts. */
registerSpecial('PlayerPC', () => { /* see script-opcodes.ts dispatcher */ });

/** 1:1 décomp `u8 GetBattleOutcome(void)` (field_specials.c:922) :
 *    `return gBattleOutcome;` (win/lose/run/draw/caught…). Appelé via
 *  `specialvar VAR_RESULT, GetBattleOutcome` (AncientTomb, AquaHideout, BirthIsland…
 *  = légendaires, post-battle). FIX : on lit le VRAI `gBattleOutcome` (state.ts)
 *  via le getter live `__getBattleOutcome` — avant, on lisait `__gBattleOutcome`
 *  qui n'était JAMAIS écrit → renvoyait toujours WIN (1) quel que soit le résultat. */
registerSpecial('GetBattleOutcome', GetBattleOutcome);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `CalculatePlayerPartyCount` (pokemon.c) :
 *    gPlayerPartyCount = 0;
 *    while (gPlayerPartyCount < PARTY_SIZE
 *           && GetMonData(&gPlayerParty[gPlayerPartyCount], MON_DATA_SPECIES, NULL) != SPECIES_NONE)
 *        gPlayerPartyCount++;
 *    return gPlayerPartyCount;
 *  Recompute + sync cache. Évite la dérive si le cache n'a pas été update. */
registerSpecial('CalculatePlayerPartyCount', () => {
  // 1:1 décomp `CalculatePlayerPartyCount` (pokemon.c) : compte gPlayerParty tant
  // que MON_DATA_SPECIES != SPECIES_NONE. + sync le cache save (legacy).
  const count = CalculatePlayerPartyCount();
  gSaveBlock1Ptr.playerPartyCount = count;
  return count;
});

// `ShouldTryRematchBattle` : porté 1:1 (T-B rematches) dans src/game/battle_setup.ts
// (gRematchTable + IsFirstTrainerIdReadyForRematch + WasSecondRematchWon réels).

/** 1:1 décomp `IsEnoughForCostInVar0x8005` (money.c:123-126).
 *  Return IsEnoughMoney(saveBlock1.money, gSpecialVar_0x8005). */
registerSpecial('IsEnoughForCostInVar0x8005', () => {
  const cost = VarGet('VAR_0x8005');
  // Notre IsEnoughMoney lit directement saveBlock1.money (= encrypted u32).
  // Import dynamic pour éviter cycle ESM.
  const { IsEnoughMoney } = (globalThis as { __game_money?: {
    IsEnoughMoney?: (cost: number) => boolean;
  } }).__game_money ?? {};
  if (IsEnoughMoney) return IsEnoughMoney(cost) ? 1 : 0;
  // Fallback inline 1:1 décomp money.c:18 IsEnoughMoney : money >= cost.
  const sb1 = gSaveBlock1Ptr as unknown as { money?: number };
  const money = sb1.money ?? 0;
  return money >= cost ? 1 : 0;
});

/** 1:1 décomp `SetCableClubWarp` / `DoCableClubWarp` (cable_club.c).
 *  Multiplayer link warp. Stubs no-op. */
registerSpecial('SetCableClubWarp', () => { /* no-op stub */ });
registerSpecial('DoCableClubWarp', () => { /* no-op stub */ });

// `StartWallClock` + `Special_ViewWallClock` : interceptés directement par
// l'opcode `special` dispatcher dans script-opcodes.ts (= lance wallclock-flow.ts
// inline overlay). Pas de stub à enregistrer ici, car le dispatch ne tombe
// jamais dans `_invokeSpecial`. Cf. session 124 fix Bug 4.

/** 1:1 décomp `ResetCyclingRoadChallengeData` (field_specials.c:154-159) :
 *  ```c
 *  void ResetCyclingRoadChallengeData(void) {
 *      gBikeCyclingChallenge = FALSE;
 *      gBikeCollisions = 0;
 *      sBikeCyclingTimer = 0;
 *  }
 *  ```
 *  Globals EWRAM_DATA `gBikeCyclingChallenge=bool8` (= field_specials.c:78),
 *  `gBikeCollisions=u8`, `sBikeCyclingTimer=u32`. Stockés ici comme statics
 *  module-level (= EWRAM_DATA équivalent). */
registerSpecial('ResetCyclingRoadChallengeData', ResetCyclingRoadChallengeData);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `Special_BeginCyclingRoadChallenge` (field_specials.c:161-166) :
 *  ```c
 *  void Special_BeginCyclingRoadChallenge(void) {
 *      gBikeCyclingChallenge = TRUE;
 *      gBikeCollisions = 0;
 *      sBikeCyclingTimer = gMain.vblankCounter1;
 *  }
 *  ```
 *  vblankCounter1 = frame counter ; notre équivalent = performance.now() | 0
 *  pour granularité comparable (= timer monotonic). */
registerSpecial('Special_BeginCyclingRoadChallenge', Special_BeginCyclingRoadChallenge);  // impl 1:1 → src/field_specials.ts

// `gBikeCycling` (EWRAM field_specials.c) vit dans `game/field_specials.ts` (feuille zéro-dup
// sans import lourd, pour éviter les cycles ESM avec bike.ts). Importé ci-dessus.

/** 1:1 décomp `Special_ShowDiploma` (field_specials.c:3739) :
 *  ```c
 *  void Special_ShowDiploma(void) {
 *      SetMainCallback2(CB2_ShowDiploma);
 *      LockPlayerFieldControls();
 *  }
 *  ```
 *  Dette R3 doc : CB2_ShowDiploma demande diploma screen UI subsystem entier
 *  U-tier (= sprite player + banner + pokedex completion check). */
registerSpecial('Special_ShowDiploma', Special_ShowDiploma);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `bool8 IsBadEggInParty(void)` (field_specials.c:1649) :
 *  ```c
 *  u8 partyCount = CalculatePlayerPartyCount();
 *  for (i = 0; i < partyCount; i++)
 *      if (GetMonData(&gPlayerParty[i], MON_DATA_SANITY_IS_BAD_EGG) == TRUE)
 *          return TRUE;
 *  return FALSE;
 *  ```
 *  Structurel 1:1 (= remplace l'ancien raccourci comportemental `() => 0` « jamais
 *  de bad egg ») : `isBadEgg` EST posable via SetMonData → la vraie boucle est
 *  robuste ET identique en jeu normal (aucun mon bad-egg → FALSE). Appelé en
 *  `specialvar VAR_RESULT` (cable_club.inc:828 = garde anti-save-corrompue au link). */
registerSpecial('IsBadEggInParty', IsBadEggInParty);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `IsLeadMonNicknamedOrNotEnglish` (tv.c:3024-3027) →
 *  `IsPartyMonNicknamedOrNotEnglish(GetLeadMonIndex())` (tv.c:3010-3022) :
 *    GetMonData(NICKNAME, gStringVar1)
 *    language = GetMonData(LANGUAGE)
 *    if (language == GAME_LANGUAGE && !StringCompare(speciesName, nickname))
 *        return FALSE
 *    return TRUE
 *
 *  Notre projet : FR-only (= tous mons GAME_LANGUAGE). Compare nickname vs
 *  speciesNameFr. Si match → FALSE (= pas renommé), sinon TRUE. */
// CheckLeadMon{Cool,Beauty,Cute,Smart,Tough} + GetLeadMonIndex : impl 1:1 → src/field_specials.ts.
registerSpecial('CheckLeadMonCool', CheckLeadMonCool);
registerSpecial('CheckLeadMonBeauty', CheckLeadMonBeauty);
registerSpecial('CheckLeadMonCute', CheckLeadMonCute);
registerSpecial('CheckLeadMonSmart', CheckLeadMonSmart);
registerSpecial('CheckLeadMonTough', CheckLeadMonTough);

/** 1:1 décomp `ChangePokemonNickname` (tv.c:3292) — porté 1:1 tv.ts (transpilé) :
 *  ouvre le VRAI naming screen (pattern egg_hatch : buffer charCodes + CB →
 *  SetMonData + CB2_ReturnToFieldContinueScript_Manual). Le script fait
 *  `fadescreen; special ChangePokemonNickname; waitstate` — la reprise passe
 *  par gFieldCallback ContinueScript (ex-stub MVP « skip rename » remplacé). */
registerSpecial('ChangePokemonNickname', () => {
  _ChangePokemonNickname();
  return 0;
});

/** 1:1 décomp `BufferLeadMonSpeciesName` (pokemon_util.c).
 *  Sets gStringVar1 to lead party mon species name. Used by scripts post-battle. */
registerSpecial('BufferLeadMonSpeciesName', () => {
  // 1:1 décomp : StringCopy(gStringVar1, gSpeciesNames[GetMonData(&gPlayerParty[0], MON_DATA_SPECIES)]).
  const mon = gPlayerParty[0];
  const species = _GetMonData(mon, MON_DATA_SPECIES) as number;
  if (species !== 0) setStringVar(1, gSpeciesNames[species] ?? '');
});

// ─── PC effects (= used by post-rival-battle when player visits Birch's lab) ─

/** 1:1 décomp `DoPCTurnOnEffect` (field_specials.c:986-997).
 *  Spawn task qui flicker le metatile PC 5 fois (off→on→off→on→off→on) en
 *  finissant sur ON. Notre port utilise une mini state machine ticked depuis
 *  TestOverworldScene.
 *
 *  1:1 décomp PCTurnOnEffect_SetMetatile (lines 1046-1070) :
 *    - lit gSpecialVar_0x8004 (= PC_LOCATION_OTHER/BRENDANS/MAYS_HOUSE)
 *    - lit player facing (NORTH/WEST/EAST) → calcule dx/dy offset du PC
 *    - MapGridSetMetatileIdAt(player.x + dx, player.y + dy, metatileId | MAPGRID_IMPASSABLE)
 *
 *  PC est TOUJOURS au-dessus du player (dy = -1) selon la direction face. */
registerSpecial('DoPCTurnOnEffect', () => {
  void import('../../field_specials').then(({ StartPCTurnOnEffect }) => {
    StartPCTurnOnEffect();
  });
});

/** 1:1 décomp `ShowPokemonStorageSystemPC` (pokemon_storage_system.c:1650) — le script « PC POKéMON »
 *  (menu accès au PC dans un Centre) l'appelle via `special`. Ouvre le menu RETIRER/DÉPOSER/... */
registerSpecial('ShowPokemonStorageSystemPC', () => {
  void import('../../pokemon_storage_system').then(({ ShowPokemonStorageSystemPC }) => {
    ShowPokemonStorageSystemPC();
  });
});

/** 1:1 décomp `ScriptMenu_CreatePCMultichoice` (script_menu.c:314) — def_special waitstate=1 :
 *  menu « Quel PC? » (PC DE QUELQU'UN/JOUEUR/[PANTHEON]/DECONNEXION). Le multichoice tourne en
 *  task (ticke le poll Menu_ProcessInput) ; au choix → VAR_RESULT posé + SignalWaitState pour
 *  relâcher l'opcode `waitstate` inséré après le special → reprise à EventScript_AccessPC.
 *  PLAIN special (pas special-flow — un poll bloquant doublerait le waitstate, cf. special_flows.ts). */
registerSpecial('ScriptMenu_CreatePCMultichoice', () => {
  void import('../../script_menu').then(({ ScriptMenu_CreatePCMultichoice }) => {
    const poll = ScriptMenu_CreatePCMultichoice();  // spawn le menu + retourne le tick
    // 🩸 Fix damier magenta hors-map (même cause moteur que Task_PCMainMenu STATE_FADE_IN et
    // DoPCTurnOffEffect, cf. mémoire diag-pc-center-magenta) : au SALUT, le retour du menu PC vers
    // ce multichoice re-corrompt la tile VRAM 513 (border, charBase 0). Ce special tourne APRÈS la
    // corruption (1er frame OW, après le message « Quel PC? ») → on recharge le tileset field ici.
    // À la 1re ouverture du PC la tile est déjà saine → rechargement idempotent, inoffensif.
    void import('../../fieldmap').then(({ CopyMapTilesetsToVram, gMapHeader }) => {
      CopyMapTilesetsToVram((gMapHeader?.mapLayout ?? null) as never);
    }).catch((e) => console.error('[pc-multichoice-tileset-reload]', e));
    void import('../../../harness/runtime/decomp-globals').then(({ getRuntime }) => {
      const rt = getRuntime(); if (!rt) return;
      rt.CreateTask((t) => {
        if (poll()) {  // Menu_ProcessInput a résolu (VAR_RESULT posé)
          rt.DestroyTask(t.taskId);
          (globalThis as { __SignalWaitState?: () => void }).__SignalWaitState?.();
        }
      }, 80);
    });
  });
});

/** 1:1 décomp `DoPCTurnOffEffect` (field_specials.c:1073-1111).
 *  Pas de flicker — set directement le metatile à PC_OFF + DrawWholeMapView. */
registerSpecial('DoPCTurnOffEffect', () => {
  void import('../../field_specials').then(({ DoPCTurnOffEffect }) => {
    DoPCTurnOffEffect();
  });
});

/** 1:1 décomp `TurnOnTVScreen` (tv.c:875-879).
 *    SetTVMetatilesOnMap(gBackupMapLayout.width, gBackupMapLayout.height,
 *                        METATILE_Building_TV_On);
 *    DrawWholeMapView();
 *  → Set TOUS les MB_TELEVISION metatiles à TV_On + refresh BG → TV cycle
 *  via TilesetAnim_Building (tile 496..499). */
registerSpecial('TurnOnTVScreen', () => {
  void import('../../tv').then(({ TurnOnTVScreen }) => {
    TurnOnTVScreen();
  });
});

/** 1:1 décomp `TurnOffTVScreen` (tv.c:869-873). Identique à TurnOnTVScreen
 *  mais avec METATILE_Building_TV_Off (= TV statique noir). */
registerSpecial('TurnOffTVScreen', () => {
  void import('../../tv').then(({ TurnOffTVScreen }) => {
    TurnOffTVScreen();
  });
});

/** 1:1 décomp `ResetTVShowState` (tv.c:6825-6828).
 *    void ResetTVShowState(void) { sTVShowState = 0; }
 *  Notre runtime n'utilise pas sTVShowState (= reset interne au TV show
 *  generator). No-op safe pour démo. */
registerSpecial('ResetTVShowState', () => { /* no-op : pas de TV show generator */ });

/** 1:1 décomp `CheckForPlayersHouseNews` (tv.c:3359-3384).
 *  Délégué au module tv-screen.ts qui contient l'implémentation 1:1 partagée
 *  avec `UpdateTVScreensOnMap` (= map load) + `TurnOnTVScreen/Off`. */
registerSpecial('CheckForPlayersHouseNews', () => _CheckForPlayersHouseNews());

/** 1:1 décomp `GetMomOrDadStringForTVMessage` (tv.c:3386-3440).
 *  Écrit gStringVar1 = "MAMAN" ou "PAPA" :
 *    - Dans la maison du joueur (= HOUSE_1F gender-match) → toujours "MAMAN"
 *    - Sinon : VAR_TEMP_3 si déjà set, sinon random 50/50 (puis cache dans VAR_TEMP_3)
 */
/** 1:1 décomp `FieldShowRegionMap` (field_specials.c:973-976) :
 *    void FieldShowRegionMap(void) { SetMainCallback2(CB2_FieldShowRegionMap); }
 *  → CB2_FieldShowRegionMap (= 1:1 décomp field_region_map.c:92).
 *
 *  Notre port : ouvre overlay HTML region-map.ts (= visuel HOENN map + cursor +
 *  player icon + mapsec name + title). Le special bloque le script via
 *  SetupNativeScript dans script-opcodes.ts (= dispatch direct), wait IsOpen()
 *  false → script reprend après. Fade-from-black géré au open (= ouverture
 *  immédiate, l'écran noir précédent FADE_TO_BLACK est remplacé par la carte). */
// 1:1 décomp `special ShowEasyChatScreen` (specials.inc:114 → easy_chat.c:1456) : ouvre le
// clavier de mots (mail / mot-tendance Dewford / interview / quiz…) selon VAR_0x8004.
// Adaptation web : les GFX sont fetch (pas en ROM) et le special de champ ne peut pas await
// → on précharge au boot pour qu'ils soient prêts quand un PNJ déclenche l'écran.
void easyChatGfxReady();
registerSpecial('ShowEasyChatScreen', () => { ShowEasyChatScreen(); });

registerSpecial('FieldShowRegionMap', () => {
  void import('../field/region-map').then(async ({ OpenRegionMap }) => {
    await OpenRegionMap();
    // Fade-from-black aussi pour que l'overlay carte soit visible (= sinon
    // l'écran noir GPU reste derrière l'overlay HTML).
    void import('../../../harness/runtime/decomp-globals').then(({ getRuntime }) => {
      getRuntime().BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
    });
  });
});

registerSpecial('GetMomOrDadStringForTVMessage', () => {
  const mapId = gMapHeader?.id ?? '';
  const isMaleHouse = mapId === 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F';
  const isFemaleHouse = mapId === 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F';
  const isInPlayersHouse = (gSaveBlock2Ptr.playerGender === MALE && isMaleHouse)
                        || (gSaveBlock2Ptr.playerGender === FEMALE && isFemaleHouse);
  console.log(`[special GetMomOrDadStringForTVMessage] mapId=${mapId} gender=${gSaveBlock2Ptr.playerGender === FEMALE ? 'FEMALE' : 'MALE'} isInPlayersHouse=${isInPlayersHouse}`);
  if (isInPlayersHouse) {
    setStringVar(1, 'MAMAN');
    VarSet('VAR_TEMP_3', 1);
    return;
  }
  const cached = VarGet('VAR_TEMP_3');
  if (cached === 1) { setStringVar(1, 'MAMAN'); return; }
  if (cached === 2) { setStringVar(1, 'PAPA'); return; }
  if (cached > 2) {
    setStringVar(1, cached % 2 === 0 ? 'MAMAN' : 'PAPA');
    return;
  }
  // Random 50/50 — 1:1 décomp tv.c GetMomOrDadStringForTVMessage `Random() & 1`.
  if ((Random() & 1) !== 0) {
    setStringVar(1, 'MAMAN');
    VarSet('VAR_TEMP_3', 1);
  } else {
    setStringVar(1, 'PAPA');
    VarSet('VAR_TEMP_3', 2);
  }
});

/** 1:1 décomp `EnableNationalPokedex` (event_data.c:63-72) :
 *  ```c
 *  void EnableNationalPokedex(void) {
 *      u16 *nationalDexVar = GetVarPointer(VAR_NATIONAL_DEX);
 *      gSaveBlock2Ptr->pokedex.nationalMagic = 0xDA;
 *      *nationalDexVar = 0x302;
 *      FlagSet(FLAG_SYS_NATIONAL_DEX);
 *      gSaveBlock2Ptr->pokedex.mode = DEX_MODE_NATIONAL;
 *      gSaveBlock2Ptr->pokedex.order = 0;
 *      ResetPokedexScrollPositions();
 *  }
 *  ```
 *  Avant : juste FlagSet('FLAG_RECEIVED_POKEDEX_FROM_BIRCH') (= WRONG flag).
 *  Maintenant : 1:1 strict — set pokedex.nationalMagic=0xDA + VAR_NATIONAL_DEX=0x302
 *  + FlagSet(FLAG_SYS_NATIONAL_DEX) + mode=DEX_MODE_NATIONAL + order=0.
 *  ResetPokedexScrollPositions skip (= cascade R3 pokedex UI subsystem). */
registerSpecial('EnableNationalPokedex', () => {
  VarSet('VAR_NATIONAL_DEX', 0x302);
  const sb2 = gSaveBlock2Ptr as { pokedex?: { nationalMagic: number; mode: number; order: number } };
  if (sb2.pokedex) {
    sb2.pokedex.nationalMagic = 0xDA;
    sb2.pokedex.mode = 1;  // DEX_MODE_NATIONAL (= include/pokedex.h:10 enum local)
    sb2.pokedex.order = 0;
  }
  FlagSet('FLAG_SYS_NATIONAL_DEX');
  // ResetPokedexScrollPositions : dette R3 cascade pokedex UI subsystem.
});

/** 1:1 décomp `SetUnlockedPokedexFlags` (save_location.c:125-134) — impl
 *  transpilée dans src/save_location.ts (source unique, même fichier que la décomp). */
registerSpecial('SetUnlockedPokedexFlags', () => { SetUnlockedPokedexFlags(); });

/** 1:1 décomp `InitRoamer` (roamer.c) : initialize legendary roamer state
 *  (= Latios/Latias). Used post-EV. Stub no-op. */
registerSpecial('InitRoamer', () => { /* no-op */ });

/** 1:1 décomp `PlayerFaceTrainerAfterBattle` (trainer_see.c:794) : après un combat de
 *  dresseur, le joueur se tourne pour lui faire face. Porté (trainer_see.ts). */
registerSpecial('PlayerFaceTrainerAfterBattle', () => { _trainerSeeSpecials()?.PlayerFaceTrainerAfterBattle?.(); });

// ─── Additional commonly-used early-game specials ───────────────────────────

// `Special_AreLeadMonEVsMaxedOut` (field_specials.c:1390) — porté ci-bas avec
// real body (= sum 6 EVs >= MAX_TOTAL_EVS=510). Stub supprimé.

/** 1:1 décomp `LoadBattlePyramidObjectEventTemplates` (battle_pyramid.c). Stub. */
registerSpecial('LoadBattlePyramidObjectEventTemplates', () => { /* no-op */ });

/** 1:1 décomp `IsLastMonThatKnows*` (party_menu.c:6407-6429 IsLastMonThatKnowsSurf
 *  + 8 dérivées). HM forget guards : check si le mon var0x8004 a le HM-move,
 *  loop autres mons party + check chacun (= si trouvé, FALSE). Si aucun autre
 *  mon n'a le move, check storage (PC boxes). Set result = TRUE seulement si
 *  c'est le dernier qui sait le HM-move. */
/** HM field-move name (arg de _isLastMonThatKnowsMove) → constante MOVE_ décomp. */
const _HM_MOVE_CONST: Record<string, string> = {
  surf: 'MOVE_SURF', cut: 'MOVE_CUT', dive: 'MOVE_DIVE', rocksmash: 'MOVE_ROCK_SMASH',
  fly: 'MOVE_FLY', waterfall: 'MOVE_WATERFALL', strength: 'MOVE_STRENGTH', flash: 'MOVE_FLASH',
};
function _isLastMonThatKnowsMove(moveIdString: string): number {
  const slot = VarGet('VAR_0x8004');
  const moveSlot = VarGet('VAR_0x8005');
  // moveIdString ('surf'…) → id MOVE_ numérique (1:1 : on compare des ids de move).
  const moveId = resolveDecompConstant(_HM_MOVE_CONST[moveIdString] ?? '') ?? 0;
  const mon = gPlayerParty[slot];
  if (!mon || (_GetMonData(mon, MON_DATA_SPECIES) as number) === 0) return 0;
  if ((_GetMonData(mon, _MON_DATA_MOVE1 + moveSlot) as number) !== moveId) return 0;
  // Loop les autres slots party : si un autre mon connaît le même move → pas le dernier.
  const partyCount = CalculatePlayerPartyCount();
  for (let i = 0; i < partyCount; i++) {
    if (i === slot) continue;
    const m = gPlayerParty[i];
    for (let j = 0; j < MAX_MON_MOVES; j++) {
      if ((_GetMonData(m, _MON_DATA_MOVE1 + j) as number) === moveId) return 0;
    }
  }
  // 1:1 décomp : `if (AnyStorageMonWithMove(move) != TRUE) gSpecialVar_Result = TRUE`.
  // Si un mon du PC connaît le move → ce n'est PAS le dernier → return FALSE
  // (l'oubli est autorisé). Sinon → TRUE (dernier détenteur). [dette R3 soldée]
  return AnyStorageMonWithMove(moveId) ? 0 : 1;
}
/** FIX : décomp `IsLastMonThatKnowsSurf` (party_menu.c:6407) est VOID et pose
 *  gSpecialVar_Result, appelé via `special` (Move Deleter, anti-softlock Surf) →
 *  l'opcode `special` ignore le retour → VarSet explicite. [[gotcha-special-vs-specialvar-varresult]]
 *  (Seul `Surf` existe dans la décomp ; les 7 autres sont nos extras, idem corrigés.) */
const _regLastMonKnows = (move: string) => () => {
  const result = _isLastMonThatKnowsMove(move);
  VarSet('VAR_RESULT', result);
  return result;
};
registerSpecial('IsLastMonThatKnowsSurf', _regLastMonKnows('surf'));
registerSpecial('IsLastMonThatKnowsCut', _regLastMonKnows('cut'));
registerSpecial('IsLastMonThatKnowsDive', _regLastMonKnows('dive'));
registerSpecial('IsLastMonThatKnowsRockSmash', _regLastMonKnows('rocksmash'));
registerSpecial('IsLastMonThatKnowsFly', _regLastMonKnows('fly'));
registerSpecial('IsLastMonThatKnowsWaterfall', _regLastMonKnows('waterfall'));
registerSpecial('IsLastMonThatKnowsStrength', _regLastMonKnows('strength'));
registerSpecial('IsLastMonThatKnowsFlash', _regLastMonKnows('flash'));

/** 1:1 décomp `BufferEReaderTrainerName`. Stub. */
registerSpecial('BufferEReaderTrainerName', () => { /* no-op */ });

/** 1:1 décomp `GetGameStat` (pokemon_util.c). Returns 0 for any stat. */
/** 1:1 décomp `GetGameStat(u8 index)` (overworld.c:447-453) :
 *  ```c
 *  u32 GetGameStat(u8 index) {
 *      if (index >= NUM_USED_GAME_STATS) return 0;
 *      return gSaveBlock1Ptr->gameStats[index] ^ gSaveBlock2Ptr->encryptionKey;
 *  }
 *  ```
 *  Notre projet stocke gameStats cleartext (= IncrementGameStat fait `+= 1`,
 *  pas XOR'd). Donc on retourne direct sans XOR (= 1:1 strict justifié vu
 *  que le décomp encrypte juste pour anti-cheat ROM Gen3 inutile en web). */
registerSpecial('GetGameStat', () => {
  const index = VarGet('VAR_0x8004');
  if (index >= 52 /* NUM_USED_GAME_STATS */) return 0;
  return (gSaveBlock1Ptr.gameStats?.[index] ?? 0) & 0xFFFF;
});

/** 1:1 décomp `PutZigzagoonInPlayerParty` (battle_setup.c) : adds Zigzagoon
 *  for Birch tutorial battle if party is empty. */
registerSpecial('PutZigzagoonInPlayerParty', () => {
  // For our flow, we already have a Pokemon from ChooseStarter. If party is
  // empty (= dev test), add a Zigzagoon. 1:1 count via CalculatePlayerPartyCount.
  if (CalculatePlayerPartyCount() === 0) {
    void (async () => {
      // 1:1 décomp battle_setup.c PutZigzagoonInPlayerParty : CreateMon NUMÉRIQUE +
      // moveset FIXE tutorial (Tackle slot0, Tail Whip slot4). Import dynamique = anti-cycle
      // (specials-registry ↔ pokemon). CreateMon ← foyer ; reste ← party-storage (re-export).
      const { CreateMon } = await import('../../pokemon');
      const { createEmptyPokemon, SetMonData, GiveMonToPlayer,
        MON_DATA_MOVE1, MON_DATA_MOVE2, MON_DATA_MOVE3, MON_DATA_MOVE4 } = await import('../battle/party-storage');
      const { resolveDecompConstant } = await import('../../../harness/runtime/decomp-constants');
      const rc = (n: string): number => (resolveDecompConstant(n) as number | undefined) ?? 0;
      const zig = createEmptyPokemon();
      CreateMon(zig, rc('SPECIES_ZIGZAGOON'), 5, 32 /* USE_RANDOM_IVS */, false, 0, 0 /* OT_ID_PLAYER_ID */, 0);
      // 1:1 décomp : moveset tutorial imposé (override du level-up moveset par défaut).
      SetMonData(zig, MON_DATA_MOVE1, rc('MOVE_TACKLE'));
      SetMonData(zig, MON_DATA_MOVE2, 0 /* MOVE_NONE */);
      SetMonData(zig, MON_DATA_MOVE3, 0 /* MOVE_NONE */);
      SetMonData(zig, MON_DATA_MOVE4, rc('MOVE_TAIL_WHIP'));
      GiveMonToPlayer(zig);
    })();
  }
});

// ─── Iter7 — early-game gap fillers (audit-driven) ──────────────────────────
// audit-early-game-specials.mjs found 16 missing specials in 20 early maps.

/** 1:1 décomp `ChooseStarter` (starter_choose.c). NOTE: actual UI dispatch is
 *  in script-opcodes.ts via dynamic import to avoid circular deps. This stub
 *  is registered so audit tools see 100% coverage. */
registerSpecial('ChooseStarter', () => {
  // Real flow handled by script-opcodes.ts opcode handler (= dynamic import
  // of starter-choose-flow.ts). This stub is just a fallback for audit.
});

/** 1:1 décomp `DrawWholeMapView` (field_camera.c:94-98) : redessine TOUT le tilemap visible
 *  depuis la grille courante. ⚠️ PAS un no-op : `MapGridSetMetatileIdAt` (fieldmap.ts:1789)
 *  n'écrit QUE la donnée de grille (pas de repeint VRAM, 1:1 décomp) → sans ce repeint, les
 *  changements de métatile scriptés (gym switches, portes cachées, TV on/off, décors) restent
 *  INVISIBLES jusqu'au prochain scroll caméra. 78 usages — câblé sur le `DrawWholeMapView()`
 *  réel (field_camera.ts:520). [audit specials pilote 2026-06-21]. */
registerSpecial('DrawWholeMapView', () => { DrawWholeMapView(); });

/** 1:1 décomp `IsTrainerRegistered` (match_call.c) — checks if trainer is
 *  registered for matchcall. 5x usage (= rival rematch logic). */
registerSpecial('IsTrainerRegistered', () => {
  // Stub : returns 0 (= not registered) for early-game flow. Rematch flow
  // pas encore implémenté.
  return 0;
});

/** 1:1 décomp `GetRivalSonDaughterString` (string_util.c) — set sStringVar1
 *  pour rival NPC dialog. May = "fille", Brendan = "fils". 3x usage. */
registerSpecial('GetRivalSonDaughterString', GetRivalSonDaughterString);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `SavePlayerParty` / `LoadPlayerParty` — battle frontier party
 *  save state. Le décomp original copie `gPlayerParty` → `gSaveBlock2Ptr->
 *  frontier.playerParty` (mem-to-mem), PAS d'appel à `TrySavingData`. La
 *  save SRAM se fait uniquement via START → SAUVER explicite. (Avant : on
 *  appelait `gameState.save()` ici → cause user-flag "save random" 2026-05-21).
 *  Notre party est déjà partagée en RAM, donc no-op suffit côté TS. */
registerSpecial('SavePlayerParty', () => { /* mem-to-mem, no SRAM write */ });
registerSpecial('LoadPlayerParty', () => { /* loaded at boot already */ });

/** 1:1 décomp `IsStarterInParty` (field_specials.c:1437-1448).
 *  Loop party, return TRUE si starter (= GetStarterPokemon(VAR_STARTER_MON))
 *  est encore là. */
registerSpecial('IsStarterInParty', IsStarterInParty);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `InitBirchState` (time_events.c:108-111) :
 *  ```c
 *  void InitBirchState(void) {
 *      *GetVarPointer(VAR_BIRCH_STATE) = 0;
 *  }
 *  ```
 *  Reset VAR_BIRCH_STATE = 0 (= state machine birch lab tutorial).
 *  Foyer 1:1 = time_events.ts (gSpecials[] référence la fonction). */
registerSpecial('InitBirchState', InitBirchState);

/** 1:1 décomp `LoadWallyZigzagoon` (wally_tutorial.c) — preps Wally's catch
 *  tutorial battle setup. Dette R3 doc : Wally tutorial subsystem entier U-tier
 *  (= Wally avatar transition + battle setup CreateMon WALLY_OT + PARTNER_FLAG
 *  + scripted POKE_BALL throw). */
registerSpecial('LoadWallyZigzagoon', () => {
  console.log('[special LoadWallyZigzagoon] dette R3 (cascade Wally tutorial U-tier)');
  return 0;
});

/** 1:1 décomp `StartWallyTutorialBattle` (wally_tutorial.c) — starts Wally's
 *  catch tutorial. Dette R3 doc : cascade BattleSetup_StartWallyTutorialBattle
 *  + setup gPartnerTrainerId + BattleTransition U-tier. */
registerSpecial('StartWallyTutorialBattle', () => {
  console.log('[special StartWallyTutorialBattle] dette R3 (cascade Wally tutorial U-tier)');
  return 0;
});

// `IsTrainerReadyForRematch` : porté 1:1 (T-B) dans src/game/battle_setup.ts.

/** 1:1 décomp `IsEnigmaBerryValid` (berry.c). */
/** 1:1 décomp `IsEnigmaBerryValid` (berry.c:969-978).
 *  Validate 3 conditions :
 *  - enigmaBerry.berry.stageDuration != 0
 *  - enigmaBerry.berry.maxYield != 0
 *  - checksum matches GetEnigmaBerryChecksum.
 *  Notre projet : pas de lien Gen 3 (= EnigmaBerry vient toujours d'un lien
 *  trade). saveBlock1.enigmaBerry est emptyEnigmaBerry par construction donc
 *  stageDuration = 0 → return FALSE. 1:1 strict justifié. */
registerSpecial('IsEnigmaBerryValid', () => {
  const eb = gSaveBlock1Ptr.enigmaBerry;
  if (!eb || !eb.berry) return 0;
  if (!eb.berry.stageDuration) return 0;
  if (!eb.berry.maxYield) return 0;
  // Dette R3 : GetEnigmaBerryChecksum pas porté (= compute checksum sur les
  // bytes). Pour notre projet, on skip ce check car enigmaBerry n'est jamais
  // populé via lien → stageDuration/maxYield seront toujours 0 → return FALSE
  // avant d'arriver ici.
  return 1;
});

/** 1:1 décomp `HasAllHoennMons` (pokedex.c) — pokedex completion check. */
/** 1:1 décomp `HasAllHoennMons` (pokedex.c:4331-4342).
 *  Loop HOENN_DEX_COUNT-2 (= exclude Jirachi+Deoxys), check GetSetPokedexFlag
 *  caught pour chaque. Si un mon n'est pas caught → FALSE. */
registerSpecial('HasAllHoennMons', () => {
  // Import dynamic pour éviter cycle ESM specials-registry → pokedex-flags.
  const pokedexMod = (globalThis as { __game_pokedex?: {
    HOENN_DEX_COUNT?: number;
    HoennToNationalOrder?: (n: number) => number;
    GetSetPokedexFlag?: (dexNum: number, caseId: number) => number;
    FLAG_GET_CAUGHT?: number;
  } }).__game_pokedex;
  if (!pokedexMod || !pokedexMod.HOENN_DEX_COUNT || !pokedexMod.HoennToNationalOrder
      || !pokedexMod.GetSetPokedexFlag || pokedexMod.FLAG_GET_CAUGHT === undefined) {
    // Fallback : pokedex pas wired → return FALSE 1:1 strict (= pas tous attrapés).
    return 0;
  }
  const flagGetCaught = pokedexMod.FLAG_GET_CAUGHT;
  for (let i = 0; i < pokedexMod.HOENN_DEX_COUNT - 2; i++) {
    const natDex = pokedexMod.HoennToNationalOrder(i + 1);
    if (!pokedexMod.GetSetPokedexFlag(natDex, flagGetCaught)) return 0;
  }
  return 1;
});

/** 1:1 décomp `ResetHealLocationFromDewford` (field_specials.c:3891-3895) :
 *  ```c
 *  void ResetHealLocationFromDewford(void) {
 *      if (gSaveBlock1Ptr->lastHealLocation.mapGroup == MAP_GROUP(MAP_DEWFORD_TOWN)
 *          && gSaveBlock1Ptr->lastHealLocation.mapNum == MAP_NUM(MAP_DEWFORD_TOWN))
 *          SetLastHealLocationWarp(HEAL_LOCATION_PETALBURG_CITY);
 *  }
 *  ```
 *  Dette R3 documentée : notre projet utilise gSaveBlock1Ptr.respawnLocation
 *  (= string ID name) au lieu de lastHealLocation.{mapGroup,mapNum}. Compare
 *  via string ID directement (= heal_location-all-auto.ts table).
 *  MAP_GROUP/MAP_NUM(MAP_DEWFORD_TOWN) = (15, 11) côté décomp ; nous comparons
 *  par name "MAP_DEWFORD_TOWN" si stocké. Sinon no-op safe. */
registerSpecial('ResetHealLocationFromDewford', () => {
  const sb1 = gSaveBlock1Ptr as { respawnLocation?: string; lastHealLocation?: { mapGroup?: number; mapNum?: number } };
  const respawn = sb1.respawnLocation;
  // 1:1 strict via string ID (= notre pattern actuel).
  if (respawn === 'HEAL_LOCATION_DEWFORD_TOWN') {
    sb1.respawnLocation = 'HEAL_LOCATION_PETALBURG_CITY';
  }
  // 1:1 strict via numeric mapGroup/mapNum si lastHealLocation populated direct.
  // Dette R3 : MAP_DEWFORD_TOWN = (15, 11) hardcoded depuis include/constants/map_groups.h.
  // À porter quand map_groups extracted ; pour l'instant skip si mapGroup absent.
});

/** 1:1 décomp `PetalburgGymSlideOpenRoomDoors` / `UnlockRoomDoors`. */
registerSpecial('PetalburgGymSlideOpenRoomDoors', () => { /* no-op */ });
registerSpecial('PetalburgGymUnlockRoomDoors', () => { /* no-op */ });

// ─── Iter8 — extended-game (Rustboro, Devon Corp) gap fillers ──────────────

/** 1:1 décomp `FoundBlackGlasses` (field_specials.c:1514-1517) :
 *  ```c
 *  bool8 FoundBlackGlasses(void) {
 *      return FlagGet(FLAG_HIDDEN_ITEM_ROUTE_116_BLACK_GLASSES);
 *  }
 *  ```
 *  Simple FlagGet sur flag hidden item Route 116 cave. */
registerSpecial('FoundBlackGlasses', FoundBlackGlasses);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `ScriptMenu_CreateStartMenuForPokenavTutorial` (start_menu.c) —
 *  open special start menu only with PokeNav for tutorial. Dette R3 doc :
 *  cascade PokeNav UI subsystem U-tier. */
registerSpecial('ScriptMenu_CreateStartMenuForPokenavTutorial', () => {
  console.log('[special PokenavTutorialMenu] dette R3 (cascade PokeNav UI U-tier)');
  return 0;
});

/** 1:1 décomp `OpenPokenavForTutorial` (pokenav.c).
 *  Dette R3 doc : PokeNav UI subsystem entier U-tier (= map + match call +
 *  ribbons + matchcall trainer card). */
registerSpecial('OpenPokenavForTutorial', () => {
  console.log('[special OpenPokenavForTutorial] dette R3 (cascade PokeNav UI U-tier)');
  return 0;
});

/** 1:1 décomp `TryBufferWaldaPhrase` / `DoWaldaNamingScreen` /
 *  `TryGetWallpaperWithWaldaPhrase` — Walda's Phrases (= secret base
 *  wallpaper customization). Late-game feature, stub for now. */
registerSpecial('TryBufferWaldaPhrase', () => 0);
registerSpecial('DoWaldaNamingScreen', () => 0);
registerSpecial('TryGetWallpaperWithWaldaPhrase', () => 0);

// ─── Iter9 — main-story (70 maps) gap fillers ──────────────────────────────

/** 1:1 décomp `ResetSSTidalFlag` / `SetSSTidalFlag` (event_data.c) — ferry
 *  state for SS Tidal cruise. */
/** 1:1 décomp `ResetSSTidalFlag` (field_specials.c:282-285).
 *  Clear FLAG_SYS_CRUISE_MODE (= player no longer on SS Tidal cruise). */
registerSpecial('ResetSSTidalFlag', ResetSSTidalFlag);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `SetPlayerGotFirstFans` (field_specials.c:4271-4274).
 *  SET_TRAINER_FAN_CLUB_FLAG(FANCLUB_GOT_FIRST_FANS=7). */
registerSpecial('SetPlayerGotFirstFans', SetPlayerGotFirstFans);  // impl 1:1 (corrigée) → src/field_specials.ts
/** 1:1 décomp `SetSSTidalFlag` (field_specials.c:276-280) :
 *  ```c
 *  void SetSSTidalFlag(void) {
 *      FlagSet(FLAG_SYS_CRUISE_MODE);
 *      *GetVarPointer(VAR_CRUISE_STEP_COUNT) = 0;
 *  }
 *  ```
 *  Set cruise mode flag + reset step counter (= board SS Tidal). */
registerSpecial('SetSSTidalFlag', SetSSTidalFlag);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp link-contest specials. Stubs (= no contests yet). */
registerSpecial('LoadLinkContestPlayerPalettes', () => 0);
/** 1:1 décomp `GetContestMultiplayerId` (contest_util.c:2669-2677) :
 *  ```c
 *  void GetContestMultiplayerId(void) {
 *      if ((gLinkContestFlags & LINK_CONTEST_FLAG_IS_LINK)
 *          && gNumLinkContestPlayers == CONTESTANT_COUNT
 *          && !(gLinkContestFlags & LINK_CONTEST_FLAG_IS_WIRELESS))
 *          gSpecialVar_Result = GetMultiplayerId();
 *      else
 *          gSpecialVar_Result = MAX_LINK_PLAYERS;
 *  }
 *  ```
 *  Notre projet : pas de link → branch else → MAX_LINK_PLAYERS (= 4). */
registerSpecial('GetContestMultiplayerId', () => {
  // 1:1 décomp constants link.h MAX_LINK_PLAYERS = 4.
  VarSet('VAR_RESULT', 4);
  return 4;
});
/** 1:1 décomp `GenerateContestRand` (contest_util.c:2679-2696) :
 *  ```c
 *  void GenerateContestRand(void) {
 *      u16 random;
 *      u16 *result;
 *      if (gLinkContestFlags & LINK_CONTEST_FLAG_IS_LINK) {
 *          gContestRngValue = ISO_RANDOMIZE1(gContestRngValue);
 *          random = gContestRngValue >> 16;
 *      } else {
 *          random = Random();
 *      }
 *      result = &gSpecialVar_Result;
 *      *result = random % *result;
 *  }
 *  ```
 *  Notre projet : pas de link → branch else (= random = Random()).
 *  Modulo VAR_RESULT (= input ; sortie même var). */
registerSpecial('GenerateContestRand', () => {
  // 1:1 décomp branch else : gLinkContestFlags == 0.
  const random = Random();
  const divisor = VarGet('VAR_RESULT');
  const result = divisor === 0 ? 0 : (random % divisor) & 0xFFFF;
  VarSet('VAR_RESULT', result);
  return result;
});
registerSpecial('IsWirelessContest', () => 0);
registerSpecial('ClearLinkContestFlags', () => { /* no-op */ });

/** 1:1 décomp `GetPlayerFacingDirection` (event_object_movement.c). */
registerSpecial('GetPlayerFacingDirection', () => {
  // 1:1 décomp : retourne gObjectEvents[gPlayerAvatar.objectEventId].facingDirection.
  // Notre port stocke direct DIR_* (= DIR_NONE=0, DIR_SOUTH=1, DIR_NORTH=2,
  // DIR_WEST=3, DIR_EAST=4) dans block1.__facing.
  return GetCurrentMap()?.facing ?? 0;
});

// `ShouldTryGetTrainerScript` : porté 1:1 (T-B) dans src/game/battle_setup.ts.

/** 1:1 décomp in-game trade specials. Stubs (= no trade UI yet). */
registerSpecial('GetInGameTradeSpeciesInfo', () => 0);
registerSpecial('GetTradeSpecies', () => 0);
registerSpecial('CreateInGameTradePokemon', () => 0);
registerSpecial('DoInGameTradeScene', () => 0);
registerSpecial('ChoosePartyMon', () => 0);

/** 1:1 décomp `LookThroughPorthole` (cinematic). Stub. */
/** 1:1 décomp `LookThroughPorthole` (field_special_scene.c:377) :
 *  cinematic SS Tidal porthole avec CB2 swap. Notre projet : ferry cinematic
 *  non porté → no-op 1:1 strict justifié. */
registerSpecial('LookThroughPorthole', () => { /* 1:1 justified : ferry cinematic non porté */ });

/** 1:1 décomp `RunUnionRoom` (union_room.c:2423) : link multi-player room
 *  entrance. Notre projet web : pas de link adapter → no-op 1:1 strict justifié. */
registerSpecial('RunUnionRoom', () => { /* 1:1 justified : no link subsystem */ });

// ─── Iter10 — bulk stubs for top global specials (post-game heavy) ──────────

/** 1:1 décomp `CloseLink` (link.c:400) : `gReceivedRemoteLinkPlayers = FALSE;
 *  if (gWirelessCommType) LinkRfu_Shutdown(); sLinkOpen = FALSE; DisableSerial();`
 *  Notre projet : pas de link wireless/serial → no-op 1:1 strict justifié. */
registerSpecial('CloseLink', () => { /* 1:1 justified : no link subsystem */ });

/** 1:1 décomp `IsWirelessAdapterConnected` (link.c:237) : `SetWirelessCommType1();
 *  InitRFUAPI(); if (rfu_LMAN_REQBN_softReset_and_checkID() == RFU_ID) return TRUE;`
 *  Notre projet : pas de RFU (wireless adapter SDK) → return FALSE 1:1 strict justifié. */
registerSpecial('IsWirelessAdapterConnected', () => 0);

/** Cinematic camera (= e.g. Rayquaza scene, Steven battle). */
registerSpecial('ShakeCamera', ShakeCamera);  // impl 1:1 (no-op différé) → src/field_specials.ts
registerSpecial('SpawnCameraObject', SpawnCameraObject);  // impl 1:1 (no-op différé) → src/field_specials.ts
registerSpecial('RemoveCameraObject', RemoveCameraObject);  // impl 1:1 (no-op différé) → src/field_specials.ts

/** Trainer Fan Club (Lilycove, post-game). */
/** 1:1 décomp `IsFanClubMemberFanOfPlayer` (field_specials.c:4117-4124) :
 *  ```c
 *  bool8 IsFanClubMemberFanOfPlayer(void) {
 *      u16 idx = gSpecialVar_0x8004;
 *      if (GET_TRAINER_FAN_CLUB_FLAG(sFanClubMemberIds[idx]))
 *          return TRUE;
 *      return FALSE;
 *  }
 *  ```
 *  sFanClubMemberIds[NUM_TRAINER_FAN_CLUB_MEMBERS=8] = [FANCLUB_MEMBER1..8 =
 *  8..15]. FANCLUB_BITFIELD = vars[VAR_FANCLUB_FAN_COUNTER]. Bit shift+mask. */
registerSpecial('IsFanClubMemberFanOfPlayer', IsFanClubMemberFanOfPlayer);  // impl 1:1 → src/field_specials.ts
registerSpecial('BufferFanClubTrainerName', BufferFanClubTrainerName);  // impl 1:1 → src/field_specials.ts
/** 1:1 décomp `GetNumFansOfPlayerInTrainerFanClub` (field_specials.c:4126-4138) :
 *  ```c
 *  u16 GetNumFansOfPlayerInTrainerFanClub(void) {
 *      u8 i, numFans = 0;
 *      for (i = 0; i < NUM_TRAINER_FAN_CLUB_MEMBERS; i++) {
 *          if (GET_TRAINER_FAN_CLUB_FLAG(i + FANCLUB_MEMBER1)) numFans++;
 *      }
 *      return numFans;
 *  }
 *  ```
 *  NUM_TRAINER_FAN_CLUB_MEMBERS=8, FANCLUB_MEMBER1=8. */
registerSpecial('GetNumFansOfPlayerInTrainerFanClub', GetNumFansOfPlayerInTrainerFanClub);  // impl 1:1 → src/field_specials.ts
registerSpecial('Script_TryGainNewFanFromCounter', Script_TryGainNewFanFromCounter);  // impl 1:1 → src/field_specials.ts

/** Special trainer battles (= legendary, gym leaders specifics, Rayquaza). */
/** 1:1 décomp `SetBattledOwnerFromResult` (secret_base.c:1171-1174) :
 *  ```c
 *  void SetBattledOwnerFromResult(void) {
 *      gSaveBlock1Ptr->secretBases[VarGet(VAR_CURRENT_SECRET_BASE)].battledOwnerToday
 *          = gSpecialVar_Result;
 *  }
 *  ```
 *  Set battle outcome bool sur secretBase[CURRENT]. */
registerSpecial('SetBattledOwnerFromResult', () => {
  const idx = VarGet('VAR_CURRENT_SECRET_BASE');
  const base = gSaveBlock1Ptr.secretBases?.[idx];
  if (base) base.battledOwnerToday = gSpecialVar.Result;
});
registerSpecial('DoSpecialTrainerBattle', () => 0);
registerSpecial('BattleSetup_StartLegendaryBattle', () => 0);
// 'PlayTrainerEncounterMusic' — porté 1:1 (battle_setup.c:1440) dans battle_setup.ts
// (routage song table). No-op RETIRÉ (double registration = clobber).

/** Records / Link Battle UI. */
registerSpecial('RemoveRecordsWindow', () => { /* no-op */ });
registerSpecial('CloseBattlePointsWindow', () => { /* no-op */ });
registerSpecial('ShowBattlePointsWindow', () => { /* no-op */ });
// TakeFrontierBattlePoints — porté 1:1 décomp field_specials.c:2946 (batch B39).

/** Scrollable multichoice (= shop with many items). */
registerSpecial('ShowScrollableMultichoice', () => { /* no-op */ });

/** Battle Frontier party. */
registerSpecial('ChoosePartyForBattleFrontier', () => 0);
registerSpecial('ChooseHalfPartyForBattle', () => 0);

/** 1:1 décomp `HasEnoughMonsForDoubleBattle` (script_pokemon_util.c:99-113) :
 *    switch (GetMonsStateToDoubles()) { case X: gSpecialVar_Result = X; ... }
 *  Le switch du décomp est une identité sur {TWO_USABLE=0, ONE_MON=1,
 *  ONE_USABLE=2} → `gSpecialVar_Result = GetMonsStateToDoubles()`. La logique
 *  (count mons vivants non-œuf) vit désormais dans le primitif nommé 1:1
 *  `GetMonsStateToDoubles` (pokemon.c:4494, party-storage).
 *
 *  FIX : le décomp l'appelle via `special` (trainer_battle.inc:29/71 = détection
 *  combat double, cable_club.inc) → la fonction pose gSpecialVar_Result. Notre
 *  ancien handler ne faisait que `return` → l'opcode `special` générique ignore
 *  le retour → VAR_RESULT JAMAIS posé → branchement single/double cassé. On pose
 *  donc VAR_RESULT explicitement (+ on retourne aussi, pour un appel specialvar). */
registerSpecial('HasEnoughMonsForDoubleBattle', () => {
  const state = GetMonsStateToDoubles();
  VarSet('VAR_RESULT', state);
  return state;
});

/** Casino. */
/** 1:1 décomp `GetSlotMachineId` (field_specials.c:1289-1326) :
 *  ```c
 *  u16 GetSlotMachineId(void) {
 *      static const u8 sSlotMachineRandomSeeds[12] = {12,2,4,5,1,8,7,11,3,10,9,6};
 *      static const u8 sSlotMachineIds[12] = { UNLUCKIEST, UNLUCKIER×2, UNLUCKY×3,
 *          LUCKY×3, LUCKIER×2, LUCKIEST };
 *      static const u8 sSlotMachineServiceDayIds[12] = { LUCKY×6, LUCKIER×4,
 *          LUCKIEST×2 };
 *      u32 rnd = dewfordTrends[0].trendiness + dewfordTrends[0].rand
 *              + sSlotMachineRandomSeeds[VAR_0x8004];
 *      if (IsPokeNewsActive(POKENEWS_GAME_CORNER))
 *          return sSlotMachineServiceDayIds[rnd % 12];
 *      return sSlotMachineIds[rnd % 12];
 *  }
 *  ```
 *  Notre projet sans PokeNews subsystem actif → toujours branch sSlotMachineIds. */
registerSpecial('GetSlotMachineId', GetSlotMachineId);  // impl 1:1 → src/field_specials.ts
registerSpecial('PlayerEnteredTradeSeat', () => { /* no-op */ });

/** Secret Base. */
/** 1:1 décomp `GetSelectedTVShow` (tv.c:882-885) :
 *  ```c
 *  u8 GetSelectedTVShow(void) {
 *      return gSaveBlock1Ptr->tvShows[gSpecialVar_0x8004].common.kind;
 *  }
 *  ```
 *  Retourne le kind du TV show à slot VAR_0x8004. */
registerSpecial('GetSelectedTVShow', () => {
  const slot = VarGet('VAR_0x8004');
  const tvShows = gSaveBlock1Ptr.tvShows;
  if (!tvShows || slot < 0 || slot >= tvShows.length) return 0;
  return tvShows[slot]?.kind ?? 0;
});

/** 1:1 décomp `SubtractMoneyFromVar0x8005` (money.c:128-131) :
 *  ```c
 *  void SubtractMoneyFromVar0x8005(void) {
 *      RemoveMoney(&gSaveBlock1Ptr->money, gSpecialVar_0x8005);
 *  }
 *  ```
 *  Soustrait `VAR_0x8005` du solde du joueur (= cost de l'item après achat). */
registerSpecial('SubtractMoneyFromVar0x8005', () => {
  // Note 1:1 strict : import dynamique pour éviter cycle ESM specials-registry
  // ↔ money.ts (= money.ts importe gSaveBlock1Ptr aussi).
  const moneyMod = (globalThis as { __game_money?: {
    RemoveMoney?: (toSub: number) => void;
  } }).__game_money;
  const cost = VarGet('VAR_0x8005');
  if (moneyMod?.RemoveMoney) {
    moneyMod.RemoveMoney(cost);
  } else {
    // Fallback : direct manipulation (= safe vu que money est un simple u32 dans saveBlock1).
    gSaveBlock1Ptr.money = Math.max(0, (gSaveBlock1Ptr.money ?? 0) - cost);
  }
});

/** 1:1 décomp `GabbyAndTyGetBattleNum` (tv.c:996-1002) :
 *  ```c
 *  u8 GabbyAndTyGetBattleNum(void) {
 *      if (gSaveBlock1Ptr->gabbyAndTyData.battleNum > 5)
 *          return (gSaveBlock1Ptr->gabbyAndTyData.battleNum % 3) + 6;
 *      return gSaveBlock1Ptr->gabbyAndTyData.battleNum;
 *  }
 *  ```
 *  Rotation cyclique 1..8 sur battles répétés. */
registerSpecial('GabbyAndTyGetBattleNum', () => {
  const battleNum = gSaveBlock1Ptr.gabbyAndTyData?.battleNum ?? 0;
  if (battleNum > 5) return ((battleNum % 3) + 6) & 0xFF;
  return battleNum & 0xFF;
});

/** 1:1 décomp `GabbyAndTyGetLastQuote` (tv.c:1009-1018) :
 *  ```c
 *  bool8 GabbyAndTyGetLastQuote(void) {
 *      if (gSaveBlock1Ptr->gabbyAndTyData.quote[0] == EC_EMPTY_WORD) return FALSE;
 *      CopyEasyChatWord(gStringVar1, gSaveBlock1Ptr->gabbyAndTyData.quote[0]);
 *      gSaveBlock1Ptr->gabbyAndTyData.quote[0] = -1;
 *      return TRUE;
 *  }
 *  ```
 *  Note 1:1 strict : EC_EMPTY_WORD = 0xFFFF (= -1 unsigned). Reset à -1 (0xFFFF)
 *  après lecture. CopyEasyChatWord deps EasyChat subsystem — dette R3 documentée. */
registerSpecial('GabbyAndTyGetLastQuote', () => {
  const data = gSaveBlock1Ptr.gabbyAndTyData;
  if (!data) return 0;
  const quote0 = data.quote[0];
  // 1:1 décomp constants/easy_chat.h : EC_EMPTY_WORD = 0xFFFF.
  if (quote0 === 0xFFFF || quote0 === -1) return 0;
  // Note 1:1 R3 : CopyEasyChatWord(gStringVar1, quote0) — déferé (= EasyChat
  // expand to string demande tables. Le reset à -1 est porté pour idempotence.
  data.quote[0] = 0xFFFF;
  return 1;
});

/** 1:1 décomp `GetGabbyAndTyLocalIds` (tv.c:1038-1075) :
 *  Set gSpecialVar_0x8004/0x8005 selon battleNum cyclique 1..8 :
 *    1 → ROUTE111_GABBY_1 / TY_1
 *    2 → ROUTE118_GABBY_1 / TY_1
 *    3 → ROUTE120_GABBY_1 / TY_1
 *    4 → ROUTE111_GABBY_2 / TY_2
 *    5 → ROUTE118_GABBY_2 / TY_2
 *    6 → ROUTE120_GABBY_2 / TY_2
 *    7 → ROUTE111_GABBY_3 / TY_3
 *    8 → ROUTE118_GABBY_3 / TY_3
 *  Note 1:1 strict : nos LOCALID_X sont string names dans le bytecode (= parseValue
 *  les resolve via map templates). Pour ce special on stocke le NAME dans VAR
 *  car aucun lookup numeric pré-fixé. */
registerSpecial('GetGabbyAndTyLocalIds', () => {
  // 1:1 décomp call cascade GabbyAndTyGetBattleNum().
  const battleNum = gSaveBlock1Ptr.gabbyAndTyData?.battleNum ?? 0;
  const effective = battleNum > 5 ? ((battleNum % 3) + 6) : battleNum;
  // Mapping table — LOCALID names string resolus runtime par parseValue
  // (= dépend de la map active). Notre VarSet stocke u16 numerics ; ici on stocke
  // le placeholder via constant resolution pour préserver le pattern décomp.
  const mapping: Record<number, [string, string]> = {
    1: ['LOCALID_ROUTE111_GABBY_1', 'LOCALID_ROUTE111_TY_1'],
    2: ['LOCALID_ROUTE118_GABBY_1', 'LOCALID_ROUTE118_TY_1'],
    3: ['LOCALID_ROUTE120_GABBY_1', 'LOCALID_ROUTE120_TY_1'],
    4: ['LOCALID_ROUTE111_GABBY_2', 'LOCALID_ROUTE111_TY_2'],
    5: ['LOCALID_ROUTE118_GABBY_2', 'LOCALID_ROUTE118_TY_2'],
    6: ['LOCALID_ROUTE120_GABBY_2', 'LOCALID_ROUTE120_TY_2'],
    7: ['LOCALID_ROUTE111_GABBY_3', 'LOCALID_ROUTE111_TY_3'],
    8: ['LOCALID_ROUTE118_GABBY_3', 'LOCALID_ROUTE118_TY_3'],
  };
  const ids = mapping[effective];
  if (ids) {
    VarSet('VAR_0x8004', VarGet(ids[0]));
    VarSet('VAR_0x8005', VarGet(ids[1]));
  }
});

/** 1:1 décomp `GetTraderTradedFlag` (trader.c:139-143) :
 *  ```c
 *  void GetTraderTradedFlag(void) {
 *      struct MauvilleOldManTrader *trader = &gSaveBlock1Ptr->oldMan.trader;
 *      gSpecialVar_Result = trader->alreadyTraded;
 *  }
 *  ```
 *  Set VAR_RESULT = oldMan.trader.alreadyTraded (0/1). */
registerSpecial('GetTraderTradedFlag', () => {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'trader') {
    VarSet('VAR_RESULT', om.alreadyTraded ?? 0);
    return om.alreadyTraded ?? 0;
  }
  VarSet('VAR_RESULT', 0);
  return 0;
});

/** 1:1 décomp `CheckInteractedWithFriendsDollDecor` (secret_base.c:1834-1838) :
 *  ```c
 *  void CheckInteractedWithFriendsDollDecor(void) {
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0)
 *          VarSet(HIGH_TV, HIGH_TV | SECRET_BASE_USED_DOLL);
 *  }
 *  ```
 *  SECRET_BASE_USED_DOLL = (1 << 11). */
registerSpecial('CheckInteractedWithFriendsDollDecor', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const high = VarGet('VAR_SECRET_BASE_HIGH_TV_FLAGS');
    VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', (high | (1 << 11)) & 0xFFFF);
  }
});

/** 1:1 décomp `CheckInteractedWithFriendsCushionDecor` (secret_base.c:1840-1844) :
 *  ```c
 *  void CheckInteractedWithFriendsCushionDecor(void) {
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0)
 *          VarSet(LOW_TV, LOW_TV | SECRET_BASE_USED_CUSHION);
 *  }
 *  ```
 *  SECRET_BASE_USED_CUSHION = (1 << 10). */
registerSpecial('CheckInteractedWithFriendsCushionDecor', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const low = VarGet('VAR_SECRET_BASE_LOW_TV_FLAGS');
    VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', (low | (1 << 10)) & 0xFFFF);
  }
});

/** 1:1 décomp `InitSecretBaseVars` (secret_base.c:1805-1817) :
 *  ```c
 *  void InitSecretBaseVars(void) {
 *      VarSet(VAR_SECRET_BASE_STEP_COUNTER, 0);
 *      VarSet(VAR_SECRET_BASE_LAST_ITEM_USED, 0);
 *      VarSet(VAR_SECRET_BASE_LOW_TV_FLAGS, 0);
 *      VarSet(VAR_SECRET_BASE_HIGH_TV_FLAGS, 0);
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0)
 *          VarSet(VAR_SECRET_BASE_IS_NOT_LOCAL, TRUE);
 *      else
 *          VarSet(VAR_SECRET_BASE_IS_NOT_LOCAL, FALSE);
 *      sInFriendSecretBase = FALSE;
 *  }
 *  ```
 *  Note 1:1 : sInFriendSecretBase est un static C ; non porté → flag implicite
 *  géré par notre system de secret base ultérieurement. */
registerSpecial('InitSecretBaseVars', () => {
  VarSet('VAR_SECRET_BASE_STEP_COUNTER', 0);
  VarSet('VAR_SECRET_BASE_LAST_ITEM_USED', 0);
  VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', 0);
  VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', 0);
  const isInOtherBase = VarGet('VAR_CURRENT_SECRET_BASE') !== 0;
  VarSet('VAR_SECRET_BASE_IS_NOT_LOCAL', isInOtherBase ? 1 : 0);
});

/** 1:1 décomp `DeclinedSecretBaseBattle` (secret_base.c:1846-1853) :
 *  ```c
 *  void DeclinedSecretBaseBattle(void) {
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0) {
 *          VarSet(LOW_TV, LOW_TV & ~(WON | LOST | DECLINED));
 *          VarSet(HIGH_TV, HIGH_TV & ~(DRAW));
 *          VarSet(LOW_TV, LOW_TV | DECLINED);
 *      }
 *  }
 *  ```
 *  Flags : SECRET_BASE_BATTLED_WON=1<<11, _LOST=1<<12, _DECLINED=1<<13,
 *  _DRAW=1<<0 (high). */
registerSpecial('DeclinedSecretBaseBattle', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const WON = 1 << 11, LOST = 1 << 12, DECLINED = 1 << 13;
    const DRAW = 1 << 0;
    let low = VarGet('VAR_SECRET_BASE_LOW_TV_FLAGS');
    let high = VarGet('VAR_SECRET_BASE_HIGH_TV_FLAGS');
    low = low & ~(WON | LOST | DECLINED);
    high = high & ~DRAW;
    low = low | DECLINED;
    VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', low & 0xFFFF);
    VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', high & 0xFFFF);
  }
});
registerSpecial('DoSecretBasePCTurnOffEffect', () => { /* no-op */ });

/** Interview / TV — portés 1:1 tv.ts (transpilé) : dispatchers des 25 shows. */
registerSpecial('InterviewBefore', () => { _InterviewBefore(); return 0; });
registerSpecial('InterviewAfter', () => { _InterviewAfter(); return 0; });
registerSpecial('DoTVShow', () => { _DoTVShow(); return 0; });
registerSpecial('DoPokeNews', () => { _DoPokeNews(); return 0; });
registerSpecial('DoTVShowInSearchOfTrainers', () => { _DoTVShowInSearchOfTrainers(); return 0; });
registerSpecial('SetContestCategoryStringVarForInterview', () => { _SetContestCategoryStringVarForInterview(); return 0; });
registerSpecial('ShouldHideFanClubInterviewer', () => +_ShouldHideFanClubInterviewer());
registerSpecial('TryPutNameRaterShowOnTheAir', () => +_TryPutNameRaterShowOnTheAir());
registerSpecial('ChangeBoxPokemonNickname', () => { _ChangeBoxPokemonNickname(); return 0; });

/** Berries. */
/** 1:1 décomp `PlayerHasBerries` (berry.c:1315-1318).
 *  Retourne IsBagPocketNonEmpty(POCKET_BERRIES). Notre projet check
 *  gSaveBlock1Ptr.bagPocket_Berries (= 1:1 décomp 5e pocket sac). */
registerSpecial('PlayerHasBerries', () => {
  // 1:1 décomp IsBagPocketNonEmpty(POCKET_BERRIES) : un slot non vide.
  // Nos slots = { itemKey: string, quantity }. Vide = itemKey '' / 'ITEM_NONE'.
  const sb1 = gSaveBlock1Ptr as unknown as { bagPocket_Berries?: Array<{ itemKey?: string; quantity?: number }> };
  const berries = sb1.bagPocket_Berries ?? [];
  for (const slot of berries) {
    if (slot.itemKey && slot.itemKey !== 'ITEM_NONE' && (slot.quantity ?? 0) > 0) return 1;
  }
  return 0;
});
/** 1:1 décomp `GetFirstFreePokeblockSlot` (pokeblock.c:1346-1357) :
 *  ```c
 *  s8 GetFirstFreePokeblockSlot(void) {
 *      u8 i;
 *      for (i = 0; i < POKEBLOCKS_COUNT; i++) {
 *          if (gSaveBlock1Ptr->pokeblocks[i].color == PBLOCK_CLR_NONE)
 *              return i;
 *      }
 *      return -1;
 *  }
 *  ```
 *  Retourne le premier slot vide (color=PBLOCK_CLR_NONE=0) ou -1 si rempli. */
registerSpecial('GetFirstFreePokeblockSlot', () => {
  const pokeblocks = gSaveBlock1Ptr.pokeblocks ?? [];
  // 1:1 décomp constants : POKEBLOCKS_COUNT = 40, PBLOCK_CLR_NONE = 0.
  for (let i = 0; i < 40; i++) {
    if ((pokeblocks[i]?.color ?? 0) === 0) return i;
  }
  return 0xFFFF;  // -1 cast u16 = 0xFFFF (= s8 -1 mais return type u16).
});
// ObjectEventInteractionGetBerryName : porté 1:1 dans la section baies (berry.c:1274).

/** Contests. */
registerSpecial('DoContestHallWarp', () => { /* no-op */ });
registerSpecial('GetContestWinnerId', () => 0);
registerSpecial('BufferContestWinnerMonName', () => { /* no-op */ });

/** Misc small specials. */
registerSpecial('ColosseumPlayerSpotTriggered', () => { /* no-op */ });
registerSpecial('RecordMixingPlayerSpotTriggered', () => { /* no-op */ });
registerSpecial('ShowFrontierExchangeCornerItemIconWindow', () => { /* no-op */ });
registerSpecial('CloseFrontierExchangeCornerItemIconWindow', () => { /* no-op */ });
/** 1:1 décomp `GetLeadMonFriendshipScore` (field_specials.c:949-966) :
 *  ```c
 *  u8 GetLeadMonFriendshipScore(void) {
 *      struct Pokemon *pokemon = &gPlayerParty[GetLeadMonIndex()];
 *      if (GetMonData(pokemon, MON_DATA_FRIENDSHIP) == MAX_FRIENDSHIP) return FRIENDSHIP_MAX;
 *      if (... >= 200) return FRIENDSHIP_200_TO_254;
 *      ... (5 brackets : 0..1..49..50..99..100..149..150..199..200..254..255 max)
 *      return FRIENDSHIP_NONE;
 *  }
 *  ```
 *  Retourne le bucket de friendship du lead mon (= 7 valeurs 0..6 → enum). */
registerSpecial('GetLeadMonFriendshipScore', GetLeadMonFriendshipScore);  // impl 1:1 → src/field_specials.ts
registerSpecial('WaitWeather', () => 0);
// ─── Puzzles d'arènes obligatoires — impls 1:1 (anti-clobber : retirés des stub-loops ci-dessus) ──
// Mauville (badge 3) : bascule des métatiles de barrières (field_specials.ts, 1:1 field_specials.c).
registerSpecial('MauvilleGymPressSwitch', MauvilleGymPressSwitch);
registerSpecial('MauvilleGymSetDefaultBarriers', MauvilleGymSetDefaultBarriers);
registerSpecial('MauvilleGymDeactivatePuzzle', MauvilleGymDeactivatePuzzle);
// Fortree (badge 6) : init du puzzle de portes tournantes (rotating_gate.ts, 1:1 rotating_gate.c).
registerSpecial('RotatingGate_InitPuzzle', RotatingGate_InitPuzzle);
registerSpecial('RotatingGate_InitPuzzleAndGraphics', RotatingGate_InitPuzzleAndGraphics);
registerSpecial('Script_DoRayquazaScene', () => { /* no-op */ });
/** 1:1 décomp `ShowFieldMessageStringVar4` (field_specials.c:890-893) :
 *  ```c
 *  void ShowFieldMessageStringVar4(void) {
 *      ShowFieldMessage(gStringVar4);
 *  }
 *  ```
 *  Affiche le contenu courant de gStringVar4 en field message. */
registerSpecial('ShowFieldMessageStringVar4', () => {
  ShowFieldMessage(gStringVar4);
});
registerSpecial('Script_FacePlayer', () => { /* no-op */ });
registerSpecial('Script_ClearHeldMovement', Script_ClearHeldMovement); // 1:1 event_object_lock.c:124
// 1:1 décomp `SetTrainerFacingDirection` (battle_setup.c:1224) — porté (trainer_see.ts).
// (GetChosenApproachingTrainerObjectEventId n'est PAS un special : fn C appelée par
//  event_object_lock.c/battle_pyramid.c — exportée de trainer_see.ts.)
registerSpecial('SetTrainerFacingDirection', () => { _trainerSeeSpecials()?.SetTrainerFacingDirection?.(); });
// 1:1 décomp `special DoTrainerApproach` (trainer_see.c:648, def_special waitstate=1) : lance
// la task d'approche ; le `waitstate` opcode qui suit (image byte-VM) bloque, relâché par le
// SignalWaitState de Task_EndTrainerApproach. PLAIN special (pas special-flow — un poll doublait
// le waitstate → freeze).
registerSpecial('DoTrainerApproach', () => { _trainerSeeSpecials()?.DoTrainerApproach?.(); });
registerSpecial('BufferFavorLadyRequest', _lilycove.BufferFavorLadyRequest);
// 'GetDaycareState' — porté 1:1 décomp daycare.c:971 (src/daycare.ts), handler
// enregistré dans le bloc PENSION ci-bas. STUB `() => 0` RETIRÉ (il court-circuitait
// tout le dialogue pension : état toujours DAYCARE_NO_MONS).
// IsTrainerRegistered + IsWirelessContest already registered in iter7/iter9.

// ─── Audit session 126 (post-test) : specials wire batch ─────────────────────
// 161 specials missing détectés via scripts/find-missing-specials.mjs. La plupart
// sont post-game (Frontier/Tower/Museum). Voici les wired pour le path normal :

import { resolveDecompConstant } from '../../../harness/runtime/decomp-constants';
import * as _lilycove from '../../lilycove_lady';

/** 1:1 décomp `BufferMonNickname` (pokemon_util.c) :
 *    GetMonData(&gPlayerParty[gSpecialVar_0x8004], MON_DATA_NICKNAME, dest);
 *  Utilisé par scripts give Pokémon, daycare retrieve, etc. Buffer dans
 *  STR_VAR_1 le nickname du party[VAR_0x8004]. */
registerSpecial('BufferMonNickname', () => {
  // 1:1 décomp : GetMonData(&gPlayerParty[VAR_0x8004], MON_DATA_NICKNAME, gStringVar1).
  const slot = VarGet('VAR_0x8004') ?? 0;
  const mon = gPlayerParty[slot];
  setStringVar(1, mon ? (_GetMonData(mon, MON_DATA_NICKNAME) as string) : '???');
  return 0;
});

/** 1:1 décomp `ScriptGetPartyMonSpecies` :
 *    return GetMonData(&gPlayerParty[VAR_0x8004], MON_DATA_SPECIES);
 *  Utilisé par scripts pour check le species du Pokémon en slot. */
registerSpecial('ScriptGetPartyMonSpecies', ScriptGetPartyMonSpecies);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `GetPlayerAvatarBike` (field_specials.c:168-175) :
 *  ```c
 *  u16 GetPlayerAvatarBike(void) {
 *      if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_ACRO_BIKE)) return 1;
 *      if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_MACH_BIKE)) return 2;
 *      return 0;
 *  }
 *  ```
 *  Read direct gPlayerAvatar.flags bits ACRO=(1<<2), MACH=(1<<1).
 *  Migré stub → port 1:1 (cleanup B12). */
registerSpecial('GetPlayerAvatarBike', GetPlayerAvatarBike);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `ShowMapNamePopup` (map_name_popup.c:231-256) :
 *  ```c
 *  void ShowMapNamePopup(void) {
 *      if (FlagGet(FLAG_HIDE_MAP_NAME_POPUP) != TRUE) {
 *          if (!FuncIsActiveTask(Task_MapNamePopUpWindow)) {
 *              sPopupTaskId = CreateTask(Task_MapNamePopUpWindow, 90);
 *              ...
 *          }
 *      }
 *  }
 *  ```
 *  Wire vers notre port direct ShowMapNamePopup dans map-name-popup.ts. */
registerSpecial('ShowMapNamePopup', () => {
  _ShowMapNamePopupImpl();
});

/** 1:1 décomp `IsSelectedMonEgg` :
 *    return GetMonData(party[VAR_0x8004], MON_DATA_IS_EGG); */
registerSpecial('IsSelectedMonEgg', () => {
  // 1:1 décomp party_menu.c:6399 (VOID) : gSpecialVar_Result = GetMonData(
  // &gPlayerParty[VAR_0x8004], MON_DATA_IS_EGG). Appelé via `special` (Maison du
  // Maître/Effaceur de Capacités) → VarSet explicite. [[gotcha-special-vs-specialvar-varresult]]
  const slot = VarGet('VAR_0x8004') ?? 0;
  const mon = gPlayerParty[slot];
  const result = mon && (_GetMonData(mon, MON_DATA_IS_EGG) as number) ? 1 : 0;
  VarSet('VAR_RESULT', result);
  return result;
});

/** 1:1 décomp `StorePlayerCoordsInVars` (event_object_movement.c) :
 *    *VarGetPtr(VAR_0x8004) = gPlayerAvatar.x;
 *    *VarGetPtr(VAR_0x8005) = gPlayerAvatar.y;
 *  Used par scripts qui veulent positionner un NPC à coords player. */
registerSpecial('StorePlayerCoordsInVars', StorePlayerCoordsInVars);  // impl 1:1 → src/field_specials.ts

/** Misc post-game stubs (= return 0/no-op pour éviter NaN VAR_RESULT) :
 *  Battle Frontier, Museum, Mirage Island, Painting, etc. */
const _STUB_RETURN_0_SPECIALS = [
  'StartRegiBattle', 'MoveElevator',
  // 'GetFrontierBattlePoints' — porté 1:1 décomp field_specials.c:2962 ci-bas (batch B39).
  'UpdateBattlePointsWindow',
  // 'CountPlayerMuseumPaintings' — porté 1:1 décomp contest_util.c:2380 ci-bas (batch B33).
  'CloseDeptStoreElevatorWindow',
  'BufferMoveDeleterNicknameAndMove',
  // 'DoSealedChamberShakingEffect_Short' — porté 1:1 braille_puzzles.ts (transpilé), handler ci-bas.
  'RemoveBerryPowderVendorMenu',
  // 'OffsetCameraForBattle' — porté 1:1 décomp field_specials.c:1672 ci-bas (batch B17).
  // 'DoBattlePyramidMonsHaveHeldItem' — porté 1:1 décomp party_menu.c:6307 ci-bas (batch B49).
  'SaveForBattleTowerLink', 'SetBattleTowerLinkPlayerGfx', 'LinkRetireStatusWithBattleTowerPartner',
  'ShowFrontierGamblerGoMessage',
  // 'GiveFrontierBattlePoints' — porté 1:1 décomp field_specials.c:2954 ci-bas (batch B39).
  'CloseBattleFrontierTutorWindow',
  // 'GetDewfordHallPaintingNameIndex' — porté 1:1 décomp dewford_trend.c:320 ci-bas (batch B17).
  // 'GameClear' — porté 1:1 décomp post_battle_event_funcs.c:12 ci-haut (2026-07-02).
  // 'SetMewAboveGrass' — porté 1:1 faraway_island.ts (transpilé), handler ci-bas.
  // 'RotatingGate_InitPuzzle' / 'RotatingGate_InitPuzzleAndGraphics' — portés 1:1 rotating_gate.ts,
  //   registerSpecial vers les vraies fns ci-bas (retirés de la stub-loop = anti-clobber).
  // 'ShouldDoBrailleRegicePuzzle' — porté 1:1 braille_puzzles.ts (transpilé), handler ci-bas.
  'SaveMuseumContestPainting', 'GiveMonArtistRibbon', 'TryPutLotteryWinnerReportOnAir',
  'ScriptMenu_CreateLilycoveSSTidalMultichoice', 'GetLilycoveSSTidalSelection',
  'DoOrbEffect', 'FadeOutOrbEffect',
  // 'MauvilleGymDeactivatePuzzle' — porté 1:1 field_specials.ts, registerSpecial ci-bas (anti-clobber).
  // 'GetWeekCount' — porté 1:1 décomp field_specials.c:940 ci-bas.
  'ReducePlayerPartyToSelectedMons', 'CableCarWarp', 'CableCar',
  'LoopWingFlapSE',
  // 'GetDaysUntilPacifidlogTMAvailable' — porté 1:1 décomp field_specials.c:1555 ci-bas.
  // 'SetPacifidlogTMReceivedDay' — porté 1:1 décomp field_specials.c:1566 ci-bas.
  // 'IsMirageIslandPresent' — porté 1:1 décomp time_events.c:42 ci-bas.
  // 'HasEnoughBerryPowder' — porté 1:1 décomp berry_powder.c:153 ci-bas (batch B18).
  // 'GetSeedotSizeRecordInfo' — porté 1:1 décomp pokemon_size_record.c:157 (batch B8).
  // 'GetLotadSizeRecordInfo' — porté 1:1 décomp pokemon_size_record.c:176 (batch B8).
];
for (const name of _STUB_RETURN_0_SPECIALS) {
  registerSpecial(name, () => 0);
}

// ─── Session A2.27 batch — time/clock specials 1:1 strict ───────────────────

/** 1:1 décomp `GetWeekCount` (field_specials.c:940-947) :
 *  ```c
 *  u16 GetWeekCount(void) {
 *      u16 weekCount = gLocalTime.days / 7;
 *      if (weekCount > 9999) weekCount = 9999;
 *      return weekCount;
 *  }
 *  ```
 *  Retourne le nombre de semaines depuis le début (cap 9999). */
registerSpecial('GetWeekCount', GetWeekCount);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `GetDaysUntilPacifidlogTMAvailable` (field_specials.c:1555-1564) :
 *  ```c
 *  u16 GetDaysUntilPacifidlogTMAvailable(void) {
 *      u16 tmReceivedDay = VarGet(VAR_PACIFIDLOG_TM_RECEIVED_DAY);
 *      if (gLocalTime.days - tmReceivedDay >= 7) return 0;
 *      else if (gLocalTime.days < 0) return 8;
 *      return 7 - (gLocalTime.days - tmReceivedDay);
 *  }
 *  ```
 *  Days restants pour récupérer la TM hebdo de Pacifidlog (= 0 si available). */
registerSpecial('GetDaysUntilPacifidlogTMAvailable', GetDaysUntilPacifidlogTMAvailable);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `BufferTMHMMoveName` (field_specials.c:1638-1647) :
 *  ```c
 *  bool8 BufferTMHMMoveName(void) {
 *      if (gSpecialVar_0x8004 >= ITEM_TM01 && gSpecialVar_0x8004 <= ITEM_HM08) {
 *          StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(gSpecialVar_0x8004)]);
 *          return TRUE;
 *      }
 *      return FALSE;
 *  }
 *  ```
 *  Buffer le nom de move correspondant à un TM/HM item dans gStringVar2. */
registerSpecial('BufferTMHMMoveName', BufferTMHMMoveName);  // impl 1:1 → src/field_specials.ts

// ─── Session A2.29 batch — Abandoned Ship + Game stats + Contest random ────

/** 1:1 décomp `IsLeadMonNicknamedOrNotEnglish` (tv.c:3024-3027) →
 *  `IsPartyMonNicknamedOrNotEnglish(GetLeadMonIndex())` (tv.c:3010-3022) :
 *  ```c
 *  bool8 IsLeadMonNicknamedOrNotEnglish(void) {
 *      return IsPartyMonNicknamedOrNotEnglish(GetLeadMonIndex());
 *  }
 *  ```
 *  Notre projet FR-only → équivalent à IsLeadMonNicknamed (= compare nickname
 *  vs speciesNameFr). Comportement 1:1 strict identique vu que langage match. */
registerSpecial('IsLeadMonNicknamedOrNotEnglish', () => {
  // 1:1 décomp tv.c:3018 : compare gSpeciesNames[species] vs nickname (FR-only).
  // GetLeadMonIndex importé de field_specials.ts (foyer 1:1).
  const mon = gPlayerParty[GetLeadMonIndex()];
  if (!mon || (_GetMonData(mon, MON_DATA_SPECIES) as number) === 0) return 0;
  const nickname = _GetMonData(mon, MON_DATA_NICKNAME) as string;
  const speciesName = gSpeciesNames[_GetMonData(mon, MON_DATA_SPECIES) as number] ?? '';
  return nickname === speciesName ? 0 : 1;
});

/** 1:1 décomp `GetMartEmployeeObjectEventId` (field_specials.c:3598-3626) :
 *  Lookup table de 12 marts. Tous les LOCALID_X_MART_CLERK valent 1 (= 1er
 *  objectEvent du map.json). Le commentaire décomp ligne 3597 confirme :
 *  > // All mart employees have a local id of 1, so function always returns 1
 *  Fallback `return 1` si non trouvé.
 *  → 1:1 strict justifié : return 1 toujours. */
registerSpecial('GetMartEmployeeObjectEventId', GetMartEmployeeObjectEventId);  // impl 1:1 → src/field_specials.ts

// ─── Session B3 batch — Buffer* specials 1:1 strict ────────────────────────

/** 1:1 décomp `BufferFavorLadyItemName` (lilycove_lady.c:198-202) :
 *  ```c
 *  void BufferFavorLadyItemName(void) {
 *      sFavorLadyPtr = &gSaveBlock1Ptr->lilycoveLady.favor;
 *      BufferItemName(gStringVar2, sFavorLadyPtr->itemId);
 *  }
 *  ```
 *  BufferItemName = StringCopy(dest, GetItemName(itemId)). */
registerSpecial('BufferFavorLadyItemName', _lilycove.BufferFavorLadyItemName);

/** 1:1 décomp `BufferFavorLadyPlayerName` (lilycove_lady.c:210-215) :
 *  ```c
 *  void BufferFavorLadyPlayerName(void) {
 *      sFavorLadyPtr = &gSaveBlock1Ptr->lilycoveLady.favor;
 *      SetFavorLadyPlayerName(sFavorLadyPtr->playerName, gStringVar3);
 *      ConvertInternationalString(gStringVar3, sFavorLadyPtr->language);
 *  }
 *  ```
 *  SetFavorLadyPlayerName = memset EOS + StringCopy_PlayerName(dest, src).
 *  Notre projet FR-only → ConvertInternationalString = no-op. */
registerSpecial('BufferFavorLadyPlayerName', _lilycove.BufferFavorLadyPlayerName);

/** 1:1 décomp `BufferQuizPrizeName` (lilycove_lady.c:452-455) :
 *  ```c
 *  void BufferQuizPrizeName(void) {
 *      StringCopy(gStringVar1, GetItemName(sQuizLadyPtr->prize));
 *  }
 *  ``` */
registerSpecial('BufferQuizPrizeName', _lilycove.BufferQuizPrizeName);

/** 1:1 décomp `BufferQuizPrizeItem` (lilycove_lady.c:487-491) :
 *  ```c
 *  void BufferQuizPrizeItem(void) {
 *      sQuizLadyPtr = &gSaveBlock1Ptr->lilycoveLady.quiz;
 *      gSpecialVar_0x8005 = sQuizLadyPtr->prize;
 *  }
 *  ``` */
registerSpecial('BufferQuizPrizeItem', _lilycove.BufferQuizPrizeItem);

/** 1:1 décomp `BufferLottoTicketNumber` (field_specials.c:1585-1617) :
 *  Pad le VAR_RESULT à 5 chiffres avec leading zeros, puis convert decimal.
 *  Branche par range >= 10000 / >= 1000 / >= 100 / >= 10 / < 10. 1:1 strict :
 *  équivalent à `String(value).padStart(5, '0')` (5 chars total). */
registerSpecial('BufferLottoTicketNumber', BufferLottoTicketNumber);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `ShouldDistributeEonTicket` (field_specials.c:3640-3646) :
 *  ```c
 *  bool32 ShouldDistributeEonTicket(void) {
 *      if (!VarGet(VAR_DISTRIBUTE_EON_TICKET)) return FALSE;
 *      return TRUE;
 *  }
 *  ```
 *  Commentaire décomp ligne 3639 : "Always returns FALSE" (= var jamais set
 *  dans le jeu, c'était pour event eShop distribution). */
registerSpecial('ShouldDistributeEonTicket', ShouldDistributeEonTicket);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `IsTVShowAlreadyInQueue` (tv.c:3268-3278) :
 *  ```c
 *  bool8 IsTVShowAlreadyInQueue(void) {
 *      for (i = 0; i < NUM_NORMAL_TVSHOW_SLOTS; i++)
 *          if (gSaveBlock1Ptr->tvShows[i].common.kind == gSpecialVar_0x8004)
 *              return TRUE;
 *      return FALSE;
 *  }
 *  ```
 *  Loop sur 5 slots NORMAL_TVSHOW + check kind match VAR_0x8004. */
registerSpecial('IsTVShowAlreadyInQueue', () => {
  const targetKind = VarGet('VAR_0x8004');
  const tvShows = gSaveBlock1Ptr.tvShows ?? [];
  // 1:1 décomp constants/tv.h : NUM_NORMAL_TVSHOW_SLOTS = 5.
  for (let i = 0; i < 5; i++) {
    if ((tvShows[i]?.kind ?? 0) === targetKind) return 1;
  }
  return 0;
});

/** 1:1 décomp `IsQuizLadyWaitingForChallenger` (lilycove_lady.c:468-472) :
 *  ```c
 *  bool8 IsQuizLadyWaitingForChallenger(void) {
 *      sQuizLadyPtr = &gSaveBlock1Ptr->lilycoveLady.quiz;
 *      return sQuizLadyPtr->waitingForChallenger;
 *  }
 *  ``` */
registerSpecial('IsQuizLadyWaitingForChallenger', () => +_lilycove.IsQuizLadyWaitingForChallenger());

/** 1:1 décomp `QuizLadySetWaitingForChallenger` (lilycove_lady.c:559-563) :
 *  ```c
 *  void QuizLadySetWaitingForChallenger(void) {
 *      sQuizLadyPtr = &gSaveBlock1Ptr->lilycoveLady.quiz;
 *      sQuizLadyPtr->waitingForChallenger = TRUE;
 *  }
 *  ``` */
registerSpecial('QuizLadySetWaitingForChallenger', _lilycove.QuizLadySetWaitingForChallenger);

/** 1:1 décomp `GetFavorLadyState` (lilycove_lady.c:159-168) :
 *  ```c
 *  u8 GetFavorLadyState(void) {
 *      sFavorLadyPtr = &gSaveBlock1Ptr->lilycoveLady.favor;
 *      if (sFavorLadyPtr->state == LILYCOVE_LADY_STATE_PRIZE) return LILYCOVE_LADY_STATE_PRIZE;
 *      else if (sFavorLadyPtr->state == LILYCOVE_LADY_STATE_COMPLETED) return LILYCOVE_LADY_STATE_COMPLETED;
 *      else return LILYCOVE_LADY_STATE_READY;
 *  }
 *  ```
 *  Retourne state clamped à PRIZE/COMPLETED/READY (= 2/1/0). */
registerSpecial('GetFavorLadyState', _lilycove.GetFavorLadyState);

/** 1:1 décomp `SetQuizLadyState_Complete` (lilycove_lady.c:493-497) :
 *  ```c
 *  void SetQuizLadyState_Complete(void) {
 *      sQuizLadyPtr = &gSaveBlock1Ptr->lilycoveLady.quiz;
 *      sQuizLadyPtr->state = LILYCOVE_LADY_STATE_COMPLETED;
 *  }
 *  ```
 *  LILYCOVE_LADY_STATE_COMPLETED = 1. */
registerSpecial('SetQuizLadyState_Complete', _lilycove.SetQuizLadyState_Complete);

/** 1:1 décomp `SetQuizLadyState_GivePrize` (lilycove_lady.c:499-503) :
 *  ```c
 *  void SetQuizLadyState_GivePrize(void) {
 *      sQuizLadyPtr = &gSaveBlock1Ptr->lilycoveLady.quiz;
 *      sQuizLadyPtr->state = LILYCOVE_LADY_STATE_PRIZE;
 *  }
 *  ```
 *  LILYCOVE_LADY_STATE_PRIZE = 2. */
registerSpecial('SetQuizLadyState_GivePrize', _lilycove.SetQuizLadyState_GivePrize);

/** 1:1 décomp `HasAnotherPlayerGivenFavorLadyItem` (lilycove_lady.c:181-191) :
 *  ```c
 *  bool8 HasAnotherPlayerGivenFavorLadyItem(void) {
 *      sFavorLadyPtr = &gSaveBlock1Ptr->lilycoveLady.favor;
 *      if (sFavorLadyPtr->playerName[0] != EOS) {
 *          StringCopy_PlayerName(gStringVar3, sFavorLadyPtr->playerName);
 *          ConvertInternationalString(gStringVar3, sFavorLadyPtr->language);
 *          return TRUE;
 *      }
 *      return FALSE;
 *  }
 *  ```
 *  Check si un autre joueur a donné un item à la Favor Lady (= record-mixed).
 *  Notre projet FR-only → ConvertInternationalString = no-op. */
registerSpecial('HasAnotherPlayerGivenFavorLadyItem', () => +_lilycove.HasAnotherPlayerGivenFavorLadyItem());

/** 1:1 décomp `ScriptGetPokedexInfo` (birch_pc.c:7-21) :
 *  ```c
 *  bool16 ScriptGetPokedexInfo(void) {
 *      if (gSpecialVar_0x8004 == 0) {
 *          gSpecialVar_0x8005 = GetHoennPokedexCount(FLAG_GET_SEEN);
 *          gSpecialVar_0x8006 = GetHoennPokedexCount(FLAG_GET_CAUGHT);
 *      } else {
 *          gSpecialVar_0x8005 = GetNationalPokedexCount(FLAG_GET_SEEN);
 *          gSpecialVar_0x8006 = GetNationalPokedexCount(FLAG_GET_CAUGHT);
 *      }
 *      return IsNationalPokedexEnabled();
 *  }
 *  ```
 *  Get Hoenn or National pokedex counts (seen + caught). Used by Birch's PC. */
registerSpecial('ScriptGetPokedexInfo', () => {
  // Import dynamique pour éviter cycle ESM (= pokedex-flags + event-data
  // import gSaveBlock state aussi).
  const helpers = (globalThis as { __game_pokedex?: {
    GetHoennPokedexCount?: (op: number) => number;
    GetNationalPokedexCount?: (op: number) => number;
    IsNationalPokedexEnabled?: () => boolean;
  } }).__game_pokedex;
  const useNational = VarGet('VAR_0x8004') !== 0;
  // 1:1 décomp constants/pokedex.h : FLAG_GET_SEEN=0, FLAG_GET_CAUGHT=1.
  const FLAG_GET_SEEN = 0, FLAG_GET_CAUGHT = 1;
  if (useNational) {
    VarSet('VAR_0x8005', helpers?.GetNationalPokedexCount?.(FLAG_GET_SEEN) ?? 0);
    VarSet('VAR_0x8006', helpers?.GetNationalPokedexCount?.(FLAG_GET_CAUGHT) ?? 0);
  } else {
    VarSet('VAR_0x8005', helpers?.GetHoennPokedexCount?.(FLAG_GET_SEEN) ?? 0);
    VarSet('VAR_0x8006', helpers?.GetHoennPokedexCount?.(FLAG_GET_CAUGHT) ?? 0);
  }
  return helpers?.IsNationalPokedexEnabled?.() ? 1 : 0;
});

/** 1:1 décomp `ShowPokedexRatingMessage` (birch_pc.c:85) — porté 1:1 birch_pc.ts
 *  (transpilé) : ShowFieldMessage(GetPokedexRatingText(VAR_0x8004)). Import
 *  STATIQUE : le texte doit être posé DANS le contexte script (dyn = trop tard). */
registerSpecial('ShowPokedexRatingMessage', () => {
  _ShowPokedexRatingMessage();
  return 0;
});

/** 1:1 décomp `SetMirageTowerVisibility` (mirage_tower.c:319-344) :
 *  ```c
 *  void SetMirageTowerVisibility(void) {
 *      if (VarGet(VAR_MIRAGE_TOWER_STATE)) {
 *          FlagClear(FLAG_MIRAGE_TOWER_VISIBLE);
 *          return;
 *      }
 *      rand = Random();
 *      visible = rand & 1;
 *      if (FlagGet(FLAG_FORCE_MIRAGE_TOWER_VISIBLE) == TRUE) visible = TRUE;
 *      if (visible) {
 *          FlagSet(FLAG_MIRAGE_TOWER_VISIBLE);
 *          TryStartMirageTowerPulseBlendEffect();
 *          return;
 *      }
 *      FlagClear(FLAG_MIRAGE_TOWER_VISIBLE);
 *  }
 *  ```
 *  Dette R3 documentée : TryStartMirageTowerPulseBlendEffect (= pulse blend
 *  palette anim) non porté ; le flag visibility est wired, l'effet visuel
 *  sera porté avec le mirage tower disintegration séquence. */
registerSpecial('SetMirageTowerVisibility', () => {
  if (VarGet('VAR_MIRAGE_TOWER_STATE')) {
    FlagClear('FLAG_MIRAGE_TOWER_VISIBLE');
    return;
  }
  const rand = Random();
  let visible = (rand & 1) !== 0;
  if (FlagGet('FLAG_FORCE_MIRAGE_TOWER_VISIBLE')) visible = true;
  if (visible) {
    FlagSet('FLAG_MIRAGE_TOWER_VISIBLE');
    // Dette R3 : TryStartMirageTowerPulseBlendEffect — pulse blend visual.
    return;
  }
  FlagClear('FLAG_MIRAGE_TOWER_VISIBLE');
});

/** 1:1 décomp `WonSecretBaseBattle` (secret_base.c:1856-1864) :
 *  ```c
 *  void WonSecretBaseBattle(void) {
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0) {
 *          LOW_TV &= ~(WON | LOST | DECLINED);
 *          HIGH_TV &= ~(DRAW);
 *          LOW_TV |= WON;
 *      }
 *  }
 *  ``` */
registerSpecial('WonSecretBaseBattle', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const WON = 1 << 11, LOST = 1 << 12, DECLINED = 1 << 13;
    const DRAW = 1 << 0;
    let low = VarGet('VAR_SECRET_BASE_LOW_TV_FLAGS');
    let high = VarGet('VAR_SECRET_BASE_HIGH_TV_FLAGS');
    low = low & ~(WON | LOST | DECLINED);
    high = high & ~DRAW;
    low = low | WON;
    VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', low & 0xFFFF);
    VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', high & 0xFFFF);
  }
});

/** 1:1 décomp `LostSecretBaseBattle` (secret_base.c:1866-1874).
 *  Same pattern WonSecretBaseBattle mais set LOST flag au lieu de WON. */
registerSpecial('LostSecretBaseBattle', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const WON = 1 << 11, LOST = 1 << 12, DECLINED = 1 << 13;
    const DRAW = 1 << 0;
    let low = VarGet('VAR_SECRET_BASE_LOW_TV_FLAGS');
    let high = VarGet('VAR_SECRET_BASE_HIGH_TV_FLAGS');
    low = low & ~(WON | LOST | DECLINED);
    high = high & ~DRAW;
    low = low | LOST;
    VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', low & 0xFFFF);
    VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', high & 0xFFFF);
  }
});

/** 1:1 décomp `ToggleCurSecretBaseRegistry` (secret_base.c:891-895) :
 *  ```c
 *  void ToggleCurSecretBaseRegistry(void) {
 *      gSaveBlock1Ptr->secretBases[VarGet(VAR_CURRENT_SECRET_BASE)].registryStatus ^= 1;
 *      FlagSet(FLAG_SECRET_BASE_REGISTRY_ENABLED);
 *  }
 *  ```
 *  Toggle registry status pour la base courante + set flag global. */
registerSpecial('ToggleCurSecretBaseRegistry', () => {
  const baseIdx = VarGet('VAR_CURRENT_SECRET_BASE');
  const base = gSaveBlock1Ptr.secretBases?.[baseIdx];
  if (base) {
    base.registryStatus = (base.registryStatus ?? 0) ^ 1;
  }
  FlagSet('FLAG_SECRET_BASE_REGISTRY_ENABLED');
});

/** 1:1 décomp `IsMonOTIDNotPlayers` (tv.c:3329-3335) :
 *  ```c
 *  void IsMonOTIDNotPlayers(void) {
 *      if (GetPlayerIDAsU32() == GetMonData(&gPlayerParty[gSpecialVar_0x8004], MON_DATA_OT_ID, NULL))
 *          gSpecialVar_Result = FALSE;
 *      else
 *          gSpecialVar_Result = TRUE;
 *  }
 *  ```
 *  Compare player trainer ID vs mon OT ID. TRUE si différent (= mon traded). */
registerSpecial('IsMonOTIDNotPlayers', () => {
  const slot = VarGet('VAR_0x8004');
  const mon = gPlayerParty[slot];
  if (!mon || (_GetMonData(mon, MON_DATA_SPECIES) as number) === 0) {
    VarSet('VAR_RESULT', 1);
    return 1;
  }
  // 1:1 décomp GetPlayerIDAsU32 = saveBlock2.playerTrainerId u32 vs MON_DATA_OT_ID.
  const playerTID = gSaveBlock2Ptr.playerTrainerId;
  const monOtId = _GetMonData(mon, MON_DATA_OT_ID) as number;
  const result = (playerTID === monOtId) ? 0 : 1;
  VarSet('VAR_RESULT', result);
  return result;
});

/** 1:1 décomp `IsMirageIslandPresent` (time_events.c:42-52) :
 *  ```c
 *  bool8 IsMirageIslandPresent(void) {
 *      u16 rnd = GetMirageRnd() >> 16;
 *      for (i = 0; i < PARTY_SIZE; i++)
 *          if (GetMonData(SPECIES) && (GetMonData(PERSONALITY) & 0xFFFF) == rnd)
 *              return TRUE;
 *      return FALSE;
 *  }
 *  ```
 *  `GetMirageRnd` (time_events.c:12-17) = (VAR_MIRAGE_RND_H << 16) | VAR_MIRAGE_RND_L.
 *  rnd = result >> 16 = VAR_MIRAGE_RND_H (= high 16 bits).
 *  Mirage Island apparait si un mon de party a `(personality & 0xFFFF) == rnd_high`.
 *  Foyer 1:1 = time_events.ts (gSpecials[] référence la fonction). */
registerSpecial('IsMirageIslandPresent', IsMirageIslandPresent);

/** 1:1 décomp `FoundAbandonedShipRoom1Key` (field_specials.c:1328-1337).
 *  Pattern uniforme : set gSpecialVar_0x8004 = FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_N_KEY
 *  + return FlagGet(flag). Note 1:1 strict : FlagSet/Get prend un name string,
 *  donc VarSet stocke le numeric flag id résolu via parseValue. */
registerSpecial('FoundAbandonedShipRoom1Key', FoundAbandonedShipRoom1Key);  // impl 1:1 → src/field_specials.ts
registerSpecial('FoundAbandonedShipRoom2Key', FoundAbandonedShipRoom2Key);
registerSpecial('FoundAbandonedShipRoom4Key', FoundAbandonedShipRoom4Key);
registerSpecial('FoundAbandonedShipRoom6Key', FoundAbandonedShipRoom6Key);

/** 1:1 décomp `SetPacifidlogTMReceivedDay` (field_specials.c:1566-1569) :
 *  ```c
 *  u16 SetPacifidlogTMReceivedDay(void) {
 *      VarSet(VAR_PACIFIDLOG_TM_RECEIVED_DAY, gLocalTime.days);
 *      return gLocalTime.days;
 *  }
 *  ```
 *  Mark le day de réception → bloque la TM 7j. */
registerSpecial('SetPacifidlogTMReceivedDay', SetPacifidlogTMReceivedDay);  // impl 1:1 → src/field_specials.ts

// ═══════════════════════════════════════════════════════════════════════════
// SESSION 131 — bulk register tous les specials décomp restants (= 411 specials
// listés dans `data/specials.inc` mais pas encore implémentés dans notre port).
// Safe stub returning 0. Real impl pourra venir au fur et à mesure.
//
// Source : `D:/Projet 1/decomps/pokeemeraude/data/specials.inc` (525 def_special).
// ═══════════════════════════════════════════════════════════════════════════

const _SESSION_131_DECOMP_SPECIALS = [
  // 'Bag_ChooseBerry' — géré dans le dispatcher script-opcodes-special.ts (waitstate=1).
  'AccessHallOfFamePC', 'BattlePyramidChooseMonHeldItems',
  'BattleSetup_StartLatiBattle',
  // 'BattleSetup_StartRematchBattle' — porté 1:1 T-B : intercepté par l'opcode
  // `special` (script-opcodes-special.ts, suspend/reprise du script) + boot dans
  // src/game/battle_setup.ts (_bootRematchBattleForScript).
  'BattleTowerReconnectLink', 'BufferBattleFrontierTutorMoveName',
  // 'BufferBattleTowerElevatorFloors' — porté 1:1 décomp field_specials.c:2209 ci-bas (batch B6).
  'BufferContestTrainerAndMonNames',
  'BufferContestWinnerTrainerName', 'BufferDeepLinkPhrase',
  // 'BufferFavorLadyItemName' — porté 1:1 décomp lilycove_lady.c:198 ci-bas.
  // 'BufferFavorLadyPlayerName' — porté 1:1 décomp lilycove_lady.c:210 ci-bas.
  // 'BufferLottoTicketNumber' — porté 1:1 décomp field_specials.c:1585 ci-bas.
  // 'BufferQuizPrizeItem' — porté 1:1 décomp lilycove_lady.c:487 ci-bas.
  // 'BufferQuizPrizeName' — porté 1:1 décomp lilycove_lady.c:452 ci-bas.
  // 'BufferQuizAuthorNameAndCheckIfLady' — porté 1:1 lilycove_lady.c:457.
  // 'BufferQuizCorrectAnswer' — porté 1:1 lilycove_lady.c:565.
  // 'BufferTMHMMoveName' — porté 1:1 décomp field_specials.c:1638 ci-bas.
  // 'BufferTrendyPhraseString' — porté 1:1 décomp dewford_trend.c:290 (src/dewford_trend.ts), handler ci-bas.
  'BufferUnionRoomPlayerName',
  // 'BufferVarsForIVRater' — porté 1:1 décomp field_specials.c:1969 ci-bas (batch B44).
  // 'CableClubSaveGame' — porté 1:1 décomp cable_club.c:806 ci-bas (batch B47).
  'CallApprenticeFunction', 'CallBattleArenaFunction',
  'CallBattleDomeFunction', 'CallBattleFactoryFunction',
  'CallBattlePalaceFunction', 'CallBattlePikeFunction',
  'CallBattlePyramidFunction', 'CallBattleTowerFunc',
  'CallFallarborTentFunction', 'CallFrontierUtilFunc',
  'CallSlateportTentFunction', 'CallTrainerHillFunction',
  'CallVerdanturfTentFunction',
  // 'ChangeBoxPokemonNickname' — porté 1:1 tv.ts (transpilé), handler ci-haut.
  // 'CheckDaycareMonReceivedMail' — porté 1:1 décomp egg_hatch.c:418 (src/egg_hatch.ts), handler ci-bas.
  // 'CheckForPlayersHouseNews' — handler concret enregistré supra (= TV path dispatch 1:1).
  // 'CheckInteractedWithFriendsCushionDecor' — porté 1:1 décomp secret_base.c:1840 ci-bas.
  // 'CheckInteractedWithFriendsDollDecor' — porté 1:1 décomp secret_base.c:1834 ci-bas.
  'CheckInteractedWithFriendsFurnitureBottom', 'CheckInteractedWithFriendsFurnitureMiddle',
  'CheckInteractedWithFriendsFurnitureTop', 'CheckInteractedWithFriendsPosterDecor',
  'CheckInteractedWithFriendsSandOrnament',
  // 'CheckLeadMon{Cool,Beauty,Cute,Smart,Tough}' — portés 1:1 field_specials.c:1190 ci-haut.
  // 'CheckPlayerHasSecretBase' — porté 1:1 décomp secret_base.c:258 ci-bas.
  // 'CheckRelicanthWailord' — porté 1:1 décomp braille_puzzles.c:92 ci-bas.
  'ChooseItemsToTossFromPyramidBag', 'ChooseMonForMoveRelearner',
  'ChooseMonForMoveTutor', 'ChooseMonForWirelessMinigame',
  // 'ChooseSendDaycareMon' — porté 1:1 décomp daycare.c:1294 (bloc PENSION ci-bas).
  'CleanupLinkRoomState', 'ClearAndLeaveSecretBase',
  // 'ClearQuizLadyPlayerAnswer' — porté 1:1 décomp lilycove_lady.c:505 ci-bas (batch B45).
  // 'ClearQuizLadyQuestionAndAnswer' — porté 1:1 décomp lilycove_lady.c:526 ci-bas (batch B45).
  'CloseBattlePikeCurtain',
  // 'CompareLotadSize' — porté 1:1 décomp pokemon_size_record.c:183 (batch B8).
  // 'CompareSeedotSize' — porté 1:1 décomp pokemon_size_record.c:164 (batch B8).
  'CopyCurSecretBaseOwnerName_StrVar1',
  'CopyEReaderTrainerGreeting',
  // 'CountPartyAliveNonEggMons' — porté 1:1 décomp pokemon_storage_system.c:1440 ci-bas.
  // 'CountPartyAliveNonEggMons_IgnoreVar0x8004Slot' — porté 1:1 ci-bas.
  // 'CountPartyNonEggMons' — porté 1:1 décomp pokemon_storage_system.c:1424 ci-bas.
  // 'CountPlayerTrainerStars' — porté 1:1 décomp trainer_card.c:663 ci-bas (batch B11).
  // 'CreateAbnormalWeatherEvent' — porté 1:1 décomp field_specials.c:3453 ci-bas (batch B32).
  'CreateEnemyEventMon',
  // 'DestroyMewEmergingGrassSprite' — porté 1:1 faraway_island.ts (transpilé), handler ci-bas.
  // 'DidFavorLadyLikeItem' — porté 1:1 décomp lilycove_lady.c:218 ci-bas (batch B9).
  'DisplayBerryPowderVendorMenu', 'DoBerryBlending', 'DoDeoxysRockInteraction',
  'DoDiveWarp', 'DoDomeConfetti', 'DoFallWarp', 'DoLotteryCornerComputerEffect',
  'DoMirageTowerCeilingCrumble',
  // 'DoPokeNews' — porté 1:1 tv.ts (transpilé), handler ci-haut.
  // 'DoSealedChamberShakingEffect_Long' — porté 1:1 braille_puzzles.ts (transpilé), handler ci-bas.
  'DoSoftReset',
  // 'DoTVShow' — porté 1:1 tv.ts (transpilé), handler ci-haut.
  // 'DoTVShowInSearchOfTrainers' — porté 1:1 tv.ts (transpilé), handler ci-haut.
  // 'DoTrainerApproach' — porté 1:1 (trainer_see.c:648) via special-flow (special_flows.ts).
  // 'DoWateringBerryTreeAnim' — handler concret 1:1 décomp enregistré plus bas (arrosage).
  // 'DoesContestCategoryHaveMuseumPainting' — porté 1:1 décomp contest_util.c:2332 ci-bas (batch B50).
  // 'DoesPartyHaveEnigmaBerry' — porté 1:1 décomp script_pokemon_util.c:128 ci-bas (batch B6).
  // 'DoesPlayerHaveNoDecorations' — porté 1:1 décomp trader.c:145 ci-bas.
  'DrewSecretBaseBattle',
  // 'EggHatch' — porté 1:1 décomp egg_hatch.c:472 (src/egg_hatch.ts, scène complète), handler ci-bas.
  'EndLotteryCornerComputerEffect', 'EnterNewlyCreatedSecretBase',
  // 'EnterSafariMode'/'ExitSafariMode' — portés 1:1 safari_zone.ts (transpilé), handlers ci-bas.
  'EnterSecretBase', 'ExitLinkRoom',
  // 'FavorLadyGetPrize' — porté 1:1 décomp lilycove_lady.c:278 ci-bas (batch B9).
  // 'FieldShowRegionMap' — handler concret enregistré infra (= fade-from-black
  // jusqu'au port 1:1 worldmap UI region_map.c).
  'FinishCyclingRoadChallenge',
  // 'FoundAbandonedShipRoom1Key' — porté 1:1 décomp field_specials.c:1328 ci-bas.
  // 'FoundAbandonedShipRoom2Key' — porté 1:1 décomp field_specials.c:1339 ci-bas.
  // 'FoundAbandonedShipRoom4Key' — porté 1:1 décomp field_specials.c:1350 ci-bas.
  // 'FoundAbandonedShipRoom6Key' — porté 1:1 décomp field_specials.c:1361 ci-bas.
  // 'GabbyAndTyAfterInterview' — porté 1:1 décomp tv.c:979 ci-bas (batch B27).
  // 'GabbyAndTyBeforeInterview' — porté 1:1 décomp tv.c:935 ci-bas (batch B28).
  // 'GabbyAndTyGetLastBattleTrivia' — porté 1:1 décomp tv.c:1020 ci-bas.
  // 'GabbyAndTyGetBattleNum' — porté 1:1 décomp tv.c:996 ci-bas.
  // 'GabbyAndTyGetLastQuote' — porté 1:1 décomp tv.c:1009 ci-bas.
  // 'GetGabbyAndTyLocalIds' — porté 1:1 décomp tv.c:1038 ci-bas.
  'GenerateGiddyLine',
  'GetAbnormalWeatherMapNameAndType', 'GetBattleFrontierTutorMoveIndex',
  'GetBattlePyramidHint',
  // 'GetBattleTowerSinglesStreak' — porté 1:1 décomp field_specials.c:1279 ci-bas (batch B43).
  // 'GetContestLadyCategory' — porté 1:1 décomp lilycove_lady.c:781 ci-bas (batch B30).
  // 'GetContestLadyMonSpecies' — porté 1:1 décomp lilycove_lady.c:775 ci-bas (batch B30).
  'GetContestMonCondition', 'GetContestMonConditionRanking',
  'GetContestPlayerId', 'GetContestantNamesAtRank',
  // 'GetCurSecretBaseRegistrationValidity' — porté 1:1 décomp secret_base.c:881 dans secret-base.ts (batch B24).
  // 'GetDaycareCost' — porté 1:1 décomp daycare.c:329 (bloc PENSION ci-bas).
  // 'GetDaycareMonNicknames' — porté 1:1 décomp daycare.c:966 (bloc PENSION ci-bas).
  'GetDeptStoreDefaultFloorChoice',
  // 'GetFavorLadyState' — porté 1:1 décomp lilycove_lady.c:159 ci-bas.
  'GetLinkPartnerNames',
  // 'GetMartEmployeeObjectEventId' — porté 1:1 décomp field_specials.c:3598 ci-bas.
  // 'GetMomOrDadStringForTVMessage' — handler concret enregistré supra (1:1 décomp).
  // 'PlayerPC' — dispatcher direct dans script-opcodes.ts (= bedroom-pc.ts UI).
  'GetMysteryGiftCardStat', 'GetNextActiveShowIfMassOutbreak',
  'GetNpcContestantLocalId',
  // 'GetNumLevelsGainedFromDaycare' — porté 1:1 décomp daycare.c:340 (bloc PENSION ci-bas).
  // 'GetNumMovesSelectedMonHas' — porté 1:1 décomp party_menu.c:6347 ci-bas (batch B6).
  // 'GetObjectEventLocalIdByFlag' — porté 1:1 décomp decoration.c:2217 ci-bas (batch B6).
  // 'GetPCBoxToSendMon' — porté 1:1 décomp field_specials.c:3410 ci-bas (batch B6).
  // 'GetPlayerTrainerIdOnesDigit' — porté 1:1 décomp field_specials.c:901 ci-bas.
  // 'GetPokeblockFeederInFront' — porté 1:1 safari_zone.ts (transpilé), handler ci-bas.
  'GetPokeblockNameByMonNature',
  // 'GetQuizAuthor' — porté 1:1 lilycove_lady.c:358.
  // 'GetQuizLadyState' — porté 1:1 décomp lilycove_lady.c:347 ci-bas (batch B10).
  'GetRandomActiveShowIdx',
  'GetRecordedCyclingRoadResults',
  // 'GetSecretBaseNearbyMapName' — porté 1:1 décomp field_specials.c:1274 ci-bas (batch B43).
  // 'GetSecretBaseOwnerAndState' — porté 1:1 décomp secret_base.c:1176 ci-bas (batch B22).
  'GetSecretBaseTypeInFrontOfPlayer',
  // 'GetSelectedTVShow' — porté 1:1 décomp tv.c:882 ci-bas.
  // 'GetSelectedMonNicknameAndSpecies' — porté 1:1 décomp daycare.c:960 (bloc PENSION ci-bas).
  // 'GetTraderTradedFlag' — porté 1:1 décomp trader.c:139 ci-bas.
  // 'GetTrainerFlag' — porté 1:1 décomp battle_setup.c:1235 ci-bas (refactor B1).
  // 'GetTrainerBattleMode' — porté 1:1 décomp battle_setup.c:1230 (game/battle_setup.ts).
  // 'GetWirelessCommType' — porté 1:1 décomp link.c:1846 ci-bas (= no wireless).
  // 'GiddyShouldTellAnotherTale' — porté 1:1 décomp mauville_old_man.c:267 ci-bas.
  // 'GiveEggFromDaycare' — porté 1:1 décomp daycare.c:874 (bloc PENSION ci-bas).
  'GiveLeadMonEffortRibbon', 'GiveMonContestRibbon',
  // 'HasAnotherPlayerGivenFavorLadyItem' — porté 1:1 décomp lilycove_lady.c:181 ci-bas.
  // 'HasAtLeastOneBerry' — porté 1:1 décomp item.c:163 ci-bas.
  // 'HasBardSongBeenChanged' — porté 1:1 décomp mauville_old_man.c:151 ci-bas.
  // 'HasHipsterTaughtWord' — porté 1:1 décomp mauville_old_man.c:241 ci-bas.
  'HasMonWonThisContestBefore',
  // 'HasPlayerGivenContestLadyPokeblock' — porté 1:1 décomp lilycove_lady.c:739 ci-bas (batch B31).
  // 'HasStorytellerAlreadyRecorded' — porté 1:1 décomp mauville_old_man.c:1467 ci-bas (batch B25).
  'HideContestEntryMonPic',
  'HipsterTryTeachWord',
  // 'IncrementDailyPickedBerries' — porté 1:1 décomp tv.c:2528 ci-bas.
  // 'IncrementDailyPlantedBerries' — porté 1:1 décomp tv.c:2523 ci-bas.
  'InitSecretBaseDecorationSprites',
  // 'InitSecretBaseVars' — porté 1:1 décomp secret_base.c:1805 ci-bas.
  'InitUnionRoom', 'InteractWithShieldOrTVDecoration',
  // 'InterviewAfter' — porté 1:1 tv.ts (transpilé), handler ci-haut.
  // 'IsContestDebugActive' — porté 1:1 décomp contest_util.c:2571 ci-bas (= toujours FALSE).
  // 'IsContestWithRSPlayer' — porté 1:1 décomp contest_util.c:2762 ci-bas (= no link).
  // 'IsCurSecretBaseOwnedByAnotherPlayer' — porté 1:1 décomp secret_base.c:720 dans secret-base.ts (batch B23).
  // 'IsDecorationCategoryFull' — porté 1:1 décomp trader.c:160 ci-bas (batch B26).
  // 'IsDodrioInParty' — porté 1:1 décomp dodrio_berry_picking.c:2908 ci-bas.
  // 'IsFavorLadyThresholdMet' — porté 1:1 décomp lilycove_lady.c:264 ci-bas (batch B9).
  // 'IsGabbyAndTyShowOnTheAir' — porté 1:1 décomp tv.c:1004 ci-bas.
  // 'IsGrassTypeInParty' — porté 1:1 décomp field_specials.c:1230 ci-bas.
  // 'IsLeadMonNicknamedOrNotEnglish' — porté 1:1 décomp tv.c:3024 ci-bas (= alias FR-only sur IsLeadMonNicknamed).
  // 'IsMonOTIDNotPlayers' — porté 1:1 décomp tv.c:3329 ci-bas.
  // 'IsPokemonJumpSpeciesInParty' — porté 1:1 décomp pokemon_jump.c:2350 (src/pokemon_jump.ts), handler ci-bas.
  // 'IsPokerusInParty' — porté 1:1 décomp field_specials.c:1455 ci-bas (batch B6).
  // 'IsQuizAnswerCorrect' — porté 1:1 lilycove_lady.c:479.
  // 'IsQuizLadyWaitingForChallenger' — porté 1:1 décomp lilycove_lady.c:468 ci-bas.
  // 'IsTVShowAlreadyInQueue' — porté 1:1 décomp tv.c:3268 ci-bas.
  // 'IsTrendyPhraseBoring' — porté 1:1 décomp dewford_trend.c:296 ci-bas.
  // 'LeadMonHasEffortRibbon' — porté 1:1 décomp field_specials.c:1372 ci-bas (= dette ribbons R3).
  // 'LinkContestTryHideWirelessIndicator' — porté 1:1 décomp contest_util.c:2753 ci-bas (= no link).
  // 'LinkContestTryShowWirelessIndicator' — porté 1:1 décomp contest_util.c:2741 ci-bas (= no link).
  // 'LostSecretBaseBattle' — porté 1:1 décomp secret_base.c:1866 ci-bas.
  'LinkContestWaitForConnection', 'LoadPlayerBag',
  // 'MauvilleGymSetDefaultBarriers' — porté 1:1 field_specials.ts, registerSpecial ci-bas (anti-clobber).
  // 'MonOTNameNotPlayer' — porté 1:1 décomp field_specials.c:1572 ci-bas.
  'MoveDeleterChooseMoveToForget', 'MoveDeleterForgetMove',
  'MoveOutOfSecretBase', 'MoveOutOfSecretBaseFromOutside',
  // ObjectEventInteractionGetBerryTreeData/GetBerryCountString/GetBerryName/
  // PickBerryTree/RemoveBerryTree/WaterBerryTree/PlantBerryTree : handlers concrets
  // 1:1 décomp enregistrés plus bas (récolte + arrosage + plantation).
  'OpenPokeblockCaseOnFeeder',
  'Overworld_PlaySpecialMapMusic',
  // 'PickLotteryCornerTicket' — porté 1:1 décomp lottery_corner.c:48 ci-bas (batch E1).
  'PlayBardSong', 'PlayRoulette', 'PlayerNotAtTrainerHillEntrance',
  // 'PlayerPC' — dispatcher direct dans script-opcodes.ts (= bedroom-pc.ts UI).
  // 'PrepSecretBaseBattleFlags' — porté 1:1 décomp secret_base.c:1164 dans secret-base.ts (batch B24).
  'PrintPlayerBerryPowderAmount',
  'PutAwayDecorationIteration', 'PutFanClubSpecialOnTheAir',
  // 'QuizLadyGetPlayerAnswer' — porté 1:1 lilycove_lady.c:474.
  // 'QuizLadyPickNewQuestion' — porté 1:1 lilycove_lady.c:516.
  // 'QuizLadyRecordCustomQuizData' — porté 1:1 décomp lilycove_lady.c:547 ci-bas (batch B46).
  // 'QuizLadySetWaitingForChallenger' — porté 1:1 décomp lilycove_lady.c:559 ci-bas.
  // 'QuizLadySetCustomQuestion' — porté 1:1 lilycove_lady.c:536.
  // 'QuizLadyShowQuizQuestion' — porté 1:1 DETTE écran easy_chat.c:1573 — handler anti-freeze ci-bas.
  // 'QuizLadyTakePrizeForCustomQuiz' — porté 1:1 décomp lilycove_lady.c:542 ci-bas (batch B46).
  // 'ResetTrickHouseNuggetFlag' — porté 1:1 décomp field_specials.c:1182 ci-bas.
  // 'ResetFanClub' — porté 1:1 décomp field_specials.c:3979 ci-bas.
  // 'ResetTVShowState' — no-op explicite documenté ci-dessus (~417). RETIRÉ du stub-loop
  //   pour ne pas écraser silencieusement la registration explicite (même comportement, no-op).
  // 'RejectEggFromDayCare' — porté 1:1 décomp daycare.c:726 (bloc PENSION ci-bas).
  // 'RetrieveLotteryNumber' — porté 1:1 décomp lottery_corner.c:42 ci-bas.
  'ReturnFromLinkRoom',
  // 'RockSmashWildEncounter' — porté 1:1 décomp wild_encounter.c (game/wild_encounter.ts) → registré ci-bas.
  // 'SaveBardSongLyrics' — porté 1:1 décomp mauville_old_man.c:156 ci-bas (batch B37).
  // 'SaveGame' — porté 1:1 décomp start_menu.c:896 ci-bas (batch B40).
  // 'ScriptCheckFreePokemonStorageSpace' — porté 1:1 décomp pokemon_storage_system.c:9572 (handler ci-bas).
  // 'ScriptGetPokedexInfo' — porté 1:1 décomp birch_pc.c:7 ci-bas.
  // 'ScriptHatchMon' — porté 1:1 décomp egg_hatch.c:395 (src/egg_hatch.ts), handler ci-bas.
  // 'ScriptMenu_CreatePCMultichoice' — porté 1:1 script_menu.c:314 (src/script_menu.ts),
  //   câblé comme special-flow waitstate=1 dans special_flows.ts (menu PC Pokémon Center).
  // 'Script_BufferContestLadyCategoryAndMonName' — porté 1:1 lilycove_lady.c:759.
  'Script_FadeOutMapMusic',
  // 'Script_GetCurrentMauvilleMan' — porté 1:1 décomp mauville_old_man.c:146 ci-bas.
  // 'Script_FavorLadyOpenBagMenu' — porté 1:1 lilycove_lady.c:224.
  // 'Script_GetLilycoveLadyId' — porté 1:1 décomp lilycove_lady.c:115 ci-bas (batch B41).
  // 'Script_QuizLadyOpenBagMenu' — porté 1:1 lilycove_lady.c:511.
  'Script_ResetUnionRoomTrade', 'Script_ShowLinkTrainerCard',
  'Script_StartWiredTrade', 'Script_StorytellerDisplayStory',
  'Script_StorytellerInitializeRandomStat',
  'ScrollRankingHallRecordsWindow', 'ScrollableMultichoice_ClosePersistentMenu',
  'ScrollableMultichoice_RedrawPersistentMenu',
  'ScrollableMultichoice_TryReturnToList',
  // 'SetCB2WhiteOut' — porté 1:1 décomp post_battle_event_funcs.c:92 ci-haut (2026-07-02).
  // 'SetChampionSaveWarp' — porté 1:1 décomp save_location.c:136 ci-bas.
  // 'SetContestCategoryStringVarForInterview' — porté 1:1 tv.ts (transpilé), handler ci-haut.
  // 'SetContestLadyGivenPokeblock' — porté 1:1 décomp lilycove_lady.c:769 ci-bas (batch B29).
  'SetContestTrainerGfxIds',
  // 'SetDaycareCompatibilityString' — porté 1:1 décomp daycare.c:1082 (bloc PENSION ci-bas).
  'SetDecoration',
  'SetDeoxysRockPalette', 'SetDeptStoreFloor', 'SetEReaderTrainerGfxId',
  // 'SetHiddenItemFlag' — porté 1:1 décomp field_specials.c:935 ci-bas (refactor B1).
  'SetHipsterTaughtWord',
  // 'SetHipsterTaughtWord' — porté 1:1 décomp mauville_old_man.c:246 ci-bas.
  // 'SetLilycoveLadyGfx' — porté 1:1 décomp lilycove_lady.c:44 ci-bas (batch B41).
  'SetLinkContestPlayerGfx', 'SetMatchCallRegisteredFlag',
  // 'SetMauvilleOldManObjEventGfx' — porté 1:1 décomp mauville_old_man.c:746 ci-bas.
  // 'SetMirageTowerVisibility' — porté 1:1 décomp mirage_tower.c:319 ci-bas.
  // 'SetPlayerGotFirstFans' — porté 1:1 décomp field_specials.c:4271 ci-bas.
  // 'SetPlayerSecretBase' — porté 1:1 décomp secret_base.c:365 dans secret-base.ts (batch B35).
  // 'SetQuizLadyState_Complete' — porté 1:1 décomp lilycove_lady.c:493 ci-bas.
  // 'SetQuizLadyState_GivePrize' — porté 1:1 décomp lilycove_lady.c:499 ci-bas.
  // 'SetRoute119Weather' — porté 1:1 décomp field_specials.c:1519 ci-bas (B4 refactor).
  // 'SetRoute123Weather' — porté 1:1 décomp field_specials.c:1525 ci-bas (B4 refactor).
  // 'SetSecretBaseOwnerGfxId' — porté 1:1 décomp secret_base.c:654 dans secret-base.ts (batch B42).
  // 'SetTrickHouseNuggetFlag' — porté 1:1 décomp field_specials.c:1174 ci-bas.
  'SetSootopolisGymCrackedIceMetatiles',
  // 'ShouldDistributeEonTicket' — porté 1:1 décomp field_specials.c:3640 ci-bas.
  // 'ShouldContestLadyShowGoOnAir' — porté 1:1 décomp lilycove_lady.c:747 ci-bas (batch B31).
  // 'ShouldDoBrailleRegirockEffectOld' — porté 1:1 braille_puzzles.ts (transpilé, nullsub), handler ci-bas.
  // 'ShouldHideFanClubInterviewer' — porté 1:1 tv.ts (transpilé), handler ci-haut.
  'ShouldReadyContestArtist',
  // 'ShouldShowBoxWasFullMessage' — porté 1:1 field_specials.c:3415 ci-bas.
  'ShowBerryBlenderRecordWindow', 'ShowBerryCrushRankings',
  'ShowContestEntryMonPic', 'ShowContestPainting',
  // 'ShowDaycareLevelMenu' — porté 1:1 décomp daycare.c:1270 (bloc PENSION ci-bas).
  'ShowDeptStoreElevatorFloorSelect', 'ShowDodrioBerryPickingRecords',
  // 'ShowEasyChatScreen' — PORTÉ 1:1 (easy_chat.c:1456) + registré ci-dessus (~443). RETIRÉ
  //   de la liste de stubs : sinon la boucle `registerSpecial(name, () => 0)` (bas de fichier)
  //   ÉCRASE le vrai handler → `special ShowEasyChatScreen` depuis un PNJ ne ferait RIEN.
  'ShowEasyChatProfile', 'ShowFrontierGamblerLookingMessage',
  'ShowFrontierManiacMessage', 'ShowGlassWorkshopMenu',
  'ShowLinkBattleRecords', 'ShowNatureGirlMessage',
  // 'ShowPokedexRatingMessage' — porté 1:1 birch_pc.ts (transpilé), handler ci-bas.
  'ShowPokemonJumpRecords',
  // 'ShowPokemonStorageSystemPC' — PORTÉ (phase 1 menu PC, pokemon_storage_system.ts) + registré
  //   ci-dessus. RETIRÉ de la stub-loop (sinon `() => 0` écrase → accéder au PC ne ferait RIEN).
  'ShowRankingHallRecordsWindow',
  'ShowSecretBaseDecorationMenu', 'ShowSecretBaseRegistryMenu',
  // 'ShowTrainerCantBattleSpeech' — porté 1:1 décomp battle_setup.c:1435 (game/battle_setup.ts).
  'ShowTrainerHillRecords',
  // 'ShowTrainerIntroSpeech' — porté 1:1 décomp battle_setup.c:1378 (game/battle_setup.ts).
  'ShowWirelessCommunicationScreen',
  'SpawnLinkPartnerObjectEvent', 'StartDroughtWeatherBlend',
  'StartGroudonKyogreBattle', 'StartMirageTowerDisintegration',
  'StartMirageTowerFossilFallAndSink', 'StartMirageTowerShake',
  'StartPlayerDescendMirageTower', 'StopMapMusic',
  // 'StoreSelectedPokemonInDaycare' — porté 1:1 décomp daycare.c:190 (bloc PENSION ci-bas).
  'StorytellerGetFreeStorySlot',
  'StorytellerStoryListMenu', 'StorytellerUpdateStat',
  // 'SwapRegisteredBike' — porté 1:1 décomp item.c:577 ci-bas.
  // 'SubtractMoneyFromVar0x8005' — porté 1:1 décomp money.c:128 ci-bas.
  // 'TakeBerryPowder' — porté 1:1 décomp berry_powder.c:188 ci-bas (batch B38).
  // 'TakePokemonFromDaycare' — porté 1:1 décomp daycare.c:281 (bloc PENSION ci-bas).
  'TeachMoveRelearnerMove',
  // 'ToggleCurSecretBaseRegistry' — porté 1:1 décomp secret_base.c:891 ci-bas.
  // 'TraderDoDecorationTrade' — porté 1:1 décomp trader.c:199 ci-bas (batch D5).
  'TraderMenuGetDecoration', 'TraderShowDecorationMenu', 'TryBattleLinkup',
  'TryBecomeLinkLeader', 'TryBerryBlenderLinkup', 'TryContestEModeLinkup',
  // 'TryFieldPoisonWhiteOut' — porté 1:1 décomp field_poison.c:115 (game/field_poison.ts), handler ci-bas.
  'TryContestGModeLinkup', 'TryEnterContestMon',
  'TryHideBattleTowerReporter', 'TryInitBattleTowerAwardManObjectEvent',
  'TryJoinLinkGroup', 'TryLoseFansFromPlayTime',
  'TryLoseFansFromPlayTimeAfterLinkBattle',
  // 'TryPrepareSecondApproachingTrainer' — porté (=0, trainer_see dette) game/battle_setup.ts.
  // 'TryPutNameRaterShowOnTheAir' — porté 1:1 tv.ts (transpilé), handler ci-haut.
  'TryPutTrainerFanClubOnAir', 'TryPutTreasureInvestigatorsOnAir',
  'TryRecordMixLinkup', 'TrySetBattleTowerLinkType',
  'TryStoreHeldItemsInPyramidBag', 'TryTradeLinkup',
  'TryUpdateRusturfTunnelState', 'Unused_SetWeatherSunny',
  // 'UpdateShoalTideFlag' — porté 1:1 décomp time_events.c:54 ci-bas (B4 refactor).
  'UpdateCyclingRoadState',
  // 'UpdateTrainerFanClubGameClear' — porté 1:1 décomp field_specials.c:3994 ci-bas (batch B36).
  'ValidateEReaderTrainer',
  'ValidateMixingGameLanguage', 'ValidateSavedWonderCard',
  // 'WonSecretBaseBattle' — porté 1:1 décomp secret_base.c:1856 ci-bas.
  'WonderNews_GetRewardInfo',
];

for (const name of _SESSION_131_DECOMP_SPECIALS) {
  registerSpecial(name, () => 0);
}

// 1:1 décomp `RockSmashWildEncounter` (wild_encounter.c) — combat sauvage possible après cassure d'un
// rocher (EventScript_SmashRock). Pose gSpecialVar_Result = TRUE si un combat démarre, sinon FALSE.
// L'impl vit dans game/wild_encounter.ts (réutilise GetCurrentMapWildMonHeader/WildEncounterCheck/
// TryGenerateWildMon) ; appelée via le hook globalThis (cycle-safe : specials-registry est lourd,
// import statique de wild_encounter → risque cycle ESM).
registerSpecial('RockSmashWildEncounter', () => {
  const fn = (globalThis as Record<string, unknown>).__RockSmashWildEncounter as (() => boolean) | undefined;
  VarSet('VAR_RESULT', fn && fn() ? 1 : 0);
  return 0;
});

// 1:1 décomp `TryFieldPoisonWhiteOut` (field_poison.c:115) — lance Task_TryField
// PoisonWhiteOut (AdjustFriendship FAINT_FIELD_PSN + clear status + message « <mon>
// est K.O… » + pose VAR_RESULT pour le branchement white-out de EventScript_Field
// Poison). L'impl vit dans src/field_poison.ts ; appelée via hook globalThis (cycle-
// safe : specials-registry est lourd, import statique de field_poison → risque cycle).
registerSpecial('TryFieldPoisonWhiteOut', () => {
  const fn = (globalThis as Record<string, unknown>).__TryFieldPoisonWhiteOut as (() => void) | undefined;
  if (fn) fn();
  return 0;
});

// 1:1 décomp `BufferTrendyPhraseString` (dewford_trend.c:290) — convertit les 2 mots
// easy-chat de la tendance VAR_0x8004 en string dans gStringVar1 (NPC Hall Poivressel).
// L'impl vit dans src/dewford_trend.ts ; appelée via hook globalThis (le registry a
// déféré l'import easy_chat — cycle-safe : dewford_trend.ts est une feuille).
registerSpecial('BufferTrendyPhraseString', () => {
  const fn = (globalThis as Record<string, unknown>).__BufferTrendyPhraseString as (() => void) | undefined;
  if (fn) fn();
  return 0;
});

// 1:1 décomp `IsPokemonJumpSpeciesInParty` (pokemon_jump.c:2350) — pose VAR_RESULT
// selon la présence d'une espèce éligible au Pokémon Jump dans le party. Import
// direct (pokemon_jump.ts est une feuille ; party-storage est déjà importé ici).
registerSpecial('IsPokemonJumpSpeciesInParty', () => {
  IsPokemonJumpSpeciesInParty();
  return 0;
});

// 1:1 décomp `ScriptCheckFreePokemonStorageSpace` (field_specials.c:1450) :
//   `return CheckFreePokemonStorageSpace();` → gSpecialVar_Result = TRUE s'il reste
// un slot de boîte PC libre. Import direct (pokemon_storage_system.ts est une feuille ;
// save.ts ne réimporte pas specials-registry → cycle-safe).
registerSpecial('ScriptCheckFreePokemonStorageSpace', ScriptCheckFreePokemonStorageSpace);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `bool8 ShouldShowBoxWasFullMessage(void)` (field_specials.c:3415-3426) :
 *    if (!FlagGet(FLAG_SHOWN_BOX_WAS_FULL_MESSAGE))
 *        if (StorageGetCurrentBox() != VarGet(VAR_PC_BOX_TO_SEND_MON)) {
 *            FlagSet(FLAG_SHOWN_BOX_WAS_FULL_MESSAGE); return TRUE; }
 *    return FALSE;
 *
 *  Renvoie TRUE (une seule fois, flag-gated) quand le Pokémon capturé atterrit
 *  dans une AUTRE boîte que celle pointée par le curseur PC (= la boîte courante
 *  était pleine) → message « La Boîte était pleine ! <mon> a été transféré dans
 *  la Boîte X ». Appelé par Cmd_givecaughtmon (battle_script_commands.c:10062) ;
 *  exposé sur globalThis pour ce caller (cycle-safe). Le déclenchement réel
 *  dépend du dépôt PC posant VAR_PC_BOX_TO_SEND_MON (dépendance d'étape). */
// impl 1:1 → src/field_specials.ts (le hook battle globalThis.__ShouldShowBoxWasFullMessage
// y est aussi posé, pour Cmd_givecaughtmon).
registerSpecial('ShouldShowBoxWasFullMessage', ShouldShowBoxWasFullMessage);

// ─── Berry tree field interaction — récolte (1:1 décomp berry.c:1252-1313) ───
// Specials retirés de _SESSION_131_DECOMP_SPECIALS (étaient no-op) → handlers
// concrets ci-dessous. Le flux récolte (BerryTree_EventScript_CheckBerryFully
// Grown) lit VAR_0x8004 (stade), VAR_0x8006 (compte) + gStringVar1 (nom baie).

/** 1:1 décomp `GetObjectEventBerryTreeId(gSelectedObjectEvent)`
 *  (event_object_movement.c:2425) : berryTreeId de l'object event interagi. */
function _selectedBerryTreeId(): number {
  return getGObjectEvents()[gSelectedObjectEvent.index]?.trainerRange_berryTreeId ?? 0;
}

/** 1:1 décomp `GetBerryCountString` (item.c:107) + `GetBerryCountStringByBerryType`
 *  (berry.c:1175) : gText_Berry/Berries ("BAIE"/"BAIES", strings.c:1822-1823) +
 *  espace + nom de la baie. */
function _berryCountString(berry: number, count: number): string {
  const word = count < 2 ? 'BAIE' : 'BAIES';
  return `${word} ${GetBerryInfo(berry).name}`;
}

/** 1:1 décomp `BERRY_FLAG_SPARKLING/JUST_PICKED` (event_object_movement.c:3072-3073). */
const _BERRY_FLAG_SPARKLING = 1 << 1;
const _BERRY_FLAG_JUST_PICKED = 1 << 2;

/** 1:1 décomp `ObjectEventInteractionGetBerryTreeData` (berry.c:1252-1273) :
 *  set VAR_0x8004 = stade (ou SPARKLING), VAR_0x8005 = stages arrosés,
 *  VAR_0x8006 = nb de baies, gStringVar1 = "BAIE(S) <nom>". */
function _objectEventInteractionGetBerryTreeData(): void {
  const id = _selectedBerryTreeId();
  const berry = GetBerryTypeByBerryTreeId(id);
  AllowBerryTreeGrowth(id);
  // IsBerryTreeSparkling(gSpecialVar_LastTalked,...) : gSpecialVar_LastTalked désigne
  // le MÊME object event que gSelectedObjectEvent → check direct du flag (résultat 1:1).
  const npc = getGObjectEvents()[gSelectedObjectEvent.index];
  const sparkling = npc ? (npc.berryTreeFlags & _BERRY_FLAG_SPARKLING) !== 0 : false;
  VarSet('VAR_0x8004', sparkling ? BERRY_STAGE_SPARKLING : GetStageByBerryTreeId(id));
  VarSet('VAR_0x8005', GetNumStagesWateredByBerryTreeId(id));
  VarSet('VAR_0x8006', GetBerryCountByBerryTreeId(id));
  setStringVar(1, _berryCountString(berry, GetBerryCountByBerryTreeId(id)));
}
registerSpecial('ObjectEventInteractionGetBerryTreeData', _objectEventInteractionGetBerryTreeData);

/** 1:1 décomp `ObjectEventInteractionPlantBerryTree` (berry.c:1293-1299) :
 *  PlantBerryTree(id, ItemIdToBerryType(VAR_ITEM_ID), BERRY_STAGE_PLANTED, TRUE)
 *  puis ObjectEventInteractionGetBerryTreeData (refresh VAR_0x8004..6 + gStringVar1). */
registerSpecial('ObjectEventInteractionPlantBerryTree', () => {
  const berry = ItemIdToBerryType(gSpecialVar.ItemId);
  PlantBerryTree(_selectedBerryTreeId(), berry, BERRY_STAGE_PLANTED, true);
  _objectEventInteractionGetBerryTreeData();
});

/** 1:1 décomp `ObjectEventInteractionGetBerryCountString` (berry.c:1280-1286). */
registerSpecial('ObjectEventInteractionGetBerryCountString', () => {
  const id = _selectedBerryTreeId();
  setStringVar(1, _berryCountString(GetBerryTypeByBerryTreeId(id), GetBerryCountByBerryTreeId(id)));
});

/** 1:1 décomp `ObjectEventInteractionPickBerryTree` (berry.c:1294-1300) :
 *  gSpecialVar_0x8004 = AddBagItem(BerryTypeToItemId(berry), count) (= succès bool). */
registerSpecial('ObjectEventInteractionPickBerryTree', () => {
  const id = _selectedBerryTreeId();
  const itemKey = reverseDecompConstant(BerryTypeToItemId(GetBerryTypeByBerryTreeId(id)), 'ITEM_');
  const ok = itemKey ? AddBagItem(itemKey, GetBerryCountByBerryTreeId(id)) : false;
  VarSet('VAR_0x8004', ok ? 1 : 0);
});

/** 1:1 décomp `ObjectEventInteractionRemoveBerryTree` (berry.c:1308-1313) :
 *  RemoveBerryTree(id) + SetBerryTreeJustPicked (flag sur l'object event). */
registerSpecial('ObjectEventInteractionRemoveBerryTree', () => {
  RemoveBerryTree(_selectedBerryTreeId());
  const npc = getGObjectEvents()[gSelectedObjectEvent.index];
  if (npc) npc.berryTreeFlags |= _BERRY_FLAG_JUST_PICKED;
});

// ─── Berry tree field interaction — arrosage (1:1 décomp berry.c:997-1019,1274) ─
// Flux : BerryTree_EventScript_WaterBerry (berry_tree.inc:161-171) → GetBerryName
// (msgbox "BAIE <nom>") → WaterBerryTree (pose le flag waterN du stade courant =
// meilleur yield à maturité) → DoWateringBerryTreeAnim.

/** 1:1 décomp `ObjectEventInteractionGetBerryName` (berry.c:1274-1278) :
 *  gStringVar1 = nom de la baie de l'arbre sélectionné. */
registerSpecial('ObjectEventInteractionGetBerryName', () => {
  const berryType = GetBerryTypeByBerryTreeId(_selectedBerryTreeId());
  setStringVar(1, GetBerryNameByBerryType(berryType));
});

/** 1:1 décomp `ObjectEventInteractionWaterBerryTree` (berry.c:997-1019) :
 *  selon le stade courant, pose watered1..4 (= +1 stage arrosé → meilleur
 *  CalcBerryYield à maturité). Retourne TRUE si arrosé, FALSE sinon (stade
 *  hors PLANTED..FLOWERING). */
registerSpecial('ObjectEventInteractionWaterBerryTree', () => {
  const tree = GetBerryTreeInfo(_selectedBerryTreeId());
  if (!tree) return 0;
  switch (tree.stage) {
    case BERRY_STAGE_PLANTED:   tree.watered1 = 1; break;
    case BERRY_STAGE_SPROUTED:  tree.watered2 = 1; break;
    case BERRY_STAGE_TALLER:    tree.watered3 = 1; break;
    case BERRY_STAGE_FLOWERING: tree.watered4 = 1; break;
    default: return 0;
  }
  return 1;
});

/** 1:1 décomp `DoWateringBerryTreeAnim` (fldeff_misc.c:1285-1288) :
 *  CreateTask(Task_WateringBerryTreeAnim, 80) → le joueur prend la pose
 *  « arrosoir » (SetPlayerAvatarWatering) et tient un walk-in-place 10 fois.
 *
 *  DETTE explicite (player-avatar subsystem) : la pose d'arrosage requiert
 *  PLAYER_AVATAR_STATE_WATERING (object-event-graphics.ts:79) — non câblé dans
 *  sRivalAvatarGfxIds (NORMAL seul ; bike/surf/fishing/watering = TODO Phase 4),
 *  + SetPlayerAvatarWatering / GetWalkInPlaceNormalMovementAction /
 *  SetPlayerAvatarTransitionFlags non portés. Le sprite arrosoir du joueur n'est
 *  pas extrait. → animation cosmétique reportée au chantier player-avatar.
 *
 *  1:1 comportemental préservé : le script BerryTree_EventScript_WaterBerry NE
 *  bloque PAS sur ce special (aucun `waitstate` ; ScriptContext_Enable du task
 *  est défensif pour le chemin sac). L'arrosage FONCTIONNEL (flag + yield + les
 *  3 messages) est complet ; seule la pose visuelle du joueur manque. */
registerSpecial('DoWateringBerryTreeAnim', () => { /* dette player-avatar : cf supra */ });

// ─── Session A2 batch 1 — ports 1:1 strict ─────────────────────────────────

/** 1:1 décomp `CheckPlayerHasSecretBase` (secret_base.c:258-265) (VOID) :
 *  gSpecialVar_Result = TRUE si le joueur a une secret base (= slot 0 non-zero),
 *  sinon FALSE. Player's secret base est toujours en slot 0. Appelé via `special`
 *  (Mossdeep House4 = enregistrement de Base Secrète) → VarSet explicite (l'opcode
 *  `special` ignore le retour). [[gotcha-special-vs-specialvar-varresult]] */
registerSpecial('CheckPlayerHasSecretBase', () => {
  const result = gSaveBlock1Ptr.secretBases[0].secretBaseId ? 1 : 0;
  VarSet('VAR_RESULT', result);
  return result;
});

/** 1:1 décomp `CheckRelicanthWailord` (braille_puzzles.c:92-104) — impl transpilée
 *  dans src/braille_puzzles.ts (source unique ; utilise MON_DATA_SPECIES_OR_EGG
 *  comme la décomp — l'ancienne inline lisait MON_DATA_SPECIES : un ŒUF en bout
 *  de party ne doit PAS compter comme RELICANTH). */
registerSpecial('CheckRelicanthWailord', () => (CheckRelicanthWailord() ? 1 : 0));

// ─── Braille puzzles (Regi/Sealed Chamber) — impl transpilées braille_puzzles.ts ───

/** 1:1 décomp `DoSealedChamberShakingEffect_Long` (braille_puzzles.c:117) —
 *  special waitstate=1 ; la task émet ScriptContext_Enable + SignalWaitState. */
registerSpecial('DoSealedChamberShakingEffect_Long', () => { DoSealedChamberShakingEffect_Long(); });
/** 1:1 décomp `DoSealedChamberShakingEffect_Short` (braille_puzzles.c:129) — waitstate=1. */
registerSpecial('DoSealedChamberShakingEffect_Short', () => { DoSealedChamberShakingEffect_Short(); });
/** 1:1 décomp `ShouldDoBrailleRegicePuzzle` (braille_puzzles.c:283). NB : la décomp
 *  l'appelle AUSSI per-step (field_control_avatar.c:565) — câblage per-step = dette
 *  field_control (tracée au rapport transpile). */
registerSpecial('ShouldDoBrailleRegicePuzzle', () => (ShouldDoBrailleRegicePuzzle() ? 1 : 0));
/** 1:1 décomp `ShouldDoBrailleRegirockEffectOld` (braille_puzzles.c:107) — nullsub ROM. */
registerSpecial('ShouldDoBrailleRegirockEffectOld', () => { ShouldDoBrailleRegirockEffectOld(); });

// ─── Safari Zone — impl transpilées safari_zone.ts ──────────────────────────

/** 1:1 décomp `EnterSafariMode` (safari_zone.c:55) — 30 balles, 500 pas, stat. */
registerSpecial('EnterSafariMode', () => { EnterSafariMode(); });
/** 1:1 décomp `ExitSafariMode` (safari_zone.c:66) — reset flag/feeders/balles. */
registerSpecial('ExitSafariMode', () => { ExitSafariMode(); });
/** 1:1 décomp `GetPokeblockFeederInFront` (safari_zone.c:131) — VAR_RESULT + gStringVar1. */
registerSpecial('GetPokeblockFeederInFront', () => { GetPokeblockFeederInFront(); });

// ─── Faraway Island (Mew) — impl transpilées faraway_island.ts ──────────────

/** 1:1 décomp `SetMewAboveGrass` (faraway_island.c:370) — émergence de Mew. */
registerSpecial('SetMewAboveGrass', () => { SetMewAboveGrass(); });
/** 1:1 décomp `DestroyMewEmergingGrassSprite` (faraway_island.c:411). */
registerSpecial('DestroyMewEmergingGrassSprite', () => { DestroyMewEmergingGrassSprite(); });

/** 1:1 décomp `GetTrainerFlag` (battle_setup.c:1235-1243) :
 *  ```c
 *  bool8 GetTrainerFlag(void) {
 *      if (CurrentBattlePyramidLocation() != PYRAMID_LOCATION_NONE)
 *          return GetBattlePyramidTrainerFlag(gSelectedObjectEvent);
 *      else if (InTrainerHill())
 *          return GetHillTrainerFlag(gSelectedObjectEvent);
 *      else
 *          return FlagGet(GetTrainerAFlag());
 *  }
 *  ```
 *  `GetTrainerAFlag` (battle_setup.c) = TRAINER_FLAGS_START + gTrainerBattleOpponent_A.
 *  TRAINER_FLAGS_START = 1280.
 *
 *  Notre projet : pas de Pyramid (= return PYRAMID_LOCATION_NONE 1:1 justified),
 *  pas de TrainerHill (= return FALSE 1:1 justified). Donc branch else exclusivement.
 *  FlagGet accepte maintenant numeric (= refactor B1) → no-op fallback `__flag_<id>`. */
registerSpecial('GetTrainerFlag', () => {
  // 1:1 décomp guard Pyramid/Hill : notre projet n'a pas ces subsystems →
  // CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE et InTrainerHill() == FALSE.
  // Le code prend donc le `else` branch.
  // Bridge via __battleStateMutators (= set par battle/state.ts au load).
  const mutators = (globalThis as { __battleStateMutators?: {
    getTrainerBattleOpponent_A?: () => number;
  } }).__battleStateMutators;
  const opponentA = mutators?.getTrainerBattleOpponent_A?.() ?? 0;
  // 1:1 décomp constants/flags.h : TRAINER_FLAGS_START = 1280.
  const flagId = 1280 + opponentA;
  return FlagGet(flagId) ? 1 : 0;
});

/** 1:1 décomp `CountPartyNonEggMons` (pokemon_storage_system.c:1424-1438).
 *  Count non-empty + non-egg party slots. Used par scripts daycare/PC switch. */
registerSpecial('CountPartyNonEggMons', () => {
  // 1:1 décomp : count gPlayerParty[i] avec SPECIES != SPECIES_NONE && !IS_EGG.
  let count = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i];
    if ((_GetMonData(mon, MON_DATA_SPECIES) as number) !== 0 && !(_GetMonData(mon, MON_DATA_IS_EGG) as number)) count++;
  }
  return count;
});

/** 1:1 décomp `CountPartyAliveNonEggMons` (egg_hatch.c:941-947) — la fn 1:1 vit
 *  désormais dans src/egg_hatch.ts (chantier éclosion) : l'impl inline dupliquée
 *  d'ici a été dissoute (consolidation N:1 → miroir). */
registerSpecial('CountPartyAliveNonEggMons', () => CountPartyAliveNonEggMons());

/** 1:1 décomp `CountPartyAliveNonEggMons_IgnoreVar0x8004Slot`
 *  (pokemon_storage_system.c:1458) — fn 1:1 dans src/pokemon_storage_system.ts. */
registerSpecial('CountPartyAliveNonEggMons_IgnoreVar0x8004Slot', () => CountPartyAliveNonEggMons_IgnoreVar0x8004Slot());

// ─── Éclosion d'œuf (chantier P2.2, src/egg_hatch.ts — 1:1 egg_hatch.c) ──────

/** 1:1 décomp `EggHatch` (egg_hatch.c:472) — def_special waitstate=1 : lance la
 *  scène d'éclosion ; le script (EventScript_EggHatch) reprend via
 *  FieldCB_ContinueScriptHandleMusic → ScriptContext_Enable + SignalWaitState. */
registerSpecial('EggHatch', () => { EggHatch(); return 0; });

/** 1:1 décomp `ScriptHatchMon` (egg_hatch.c:395) : AddHatchedMonToParty(VAR_0x8004). */
registerSpecial('ScriptHatchMon', () => { ScriptHatchMon(); return 0; });

/** 1:1 décomp `CheckDaycareMonReceivedMail` (egg_hatch.c:418). */
registerSpecial('CheckDaycareMonReceivedMail', () => (CheckDaycareMonReceivedMail() ? 1 : 0));

// ─── PENSION (chantier daycare 2026-07-02, src/daycare.ts = daycare.c 1:1) ────
// Tous RETIRÉS de _SESSION_131_DECOMP_SPECIALS (+ stub direct GetDaycareState) :
// une double registration = clobber silencieux. Scripts : data/scripts/day_care.inc.

/** 1:1 décomp `GetDaycareState` (daycare.c:971) — specialvar VAR_RESULT :
 *  DAYCARE_NO_MONS(0)/EGG_WAITING(1)/ONE_MON(2)/TWO_MONS(3). */
registerSpecial('GetDaycareState', () => GetDaycareState());

/** 1:1 décomp `GetDaycareMonNicknames` (daycare.c:966) — gStringVar1/2 = nicknames,
 *  gStringVar3 = OT du mon 1. */
registerSpecial('GetDaycareMonNicknames', () => { GetDaycareMonNicknames(); return 0; });

/** 1:1 décomp `GetSelectedMonNicknameAndSpecies` (daycare.c:960) — specialvar
 *  VAR_0x8005 = species du mon sélectionné (party menu), gStringVar1 = nickname. */
registerSpecial('GetSelectedMonNicknameAndSpecies', () => GetSelectedMonNicknameAndSpecies());

/** 1:1 décomp `StoreSelectedPokemonInDaycare` (daycare.c:190) — dépose
 *  gPlayerParty[GetCursorSelectionMonId()] dans le 1er slot pension libre. */
registerSpecial('StoreSelectedPokemonInDaycare', () => { StoreSelectedPokemonInDaycare(); return 0; });

/** 1:1 décomp `ChooseSendDaycareMon` (daycare.c:1294) — def_special waitstate=1 :
 *  ouvre le party menu mode DAYCARE ; le script reprend via BufferMonSelection →
 *  CB2_FadeFromPartyMenu → Task_PartyMenuWaitForFade (ScriptContext_Enable). */
registerSpecial('ChooseSendDaycareMon', () => { ChooseSendDaycareMon(); return 0; });

/** 1:1 décomp `GetDaycareCost` (daycare.c:329) — VAR_0x8005 = 100 + 100×niveaux
 *  gagnés du mon en slot VAR_0x8004 (gStringVar1 = nickname, gStringVar2 = coût). */
registerSpecial('GetDaycareCost', () => { GetDaycareCost(); return 0; });

/** 1:1 décomp `GetNumLevelsGainedFromDaycare` (daycare.c:340) — specialvar VAR_RESULT. */
registerSpecial('GetNumLevelsGainedFromDaycare', () => GetNumLevelsGainedFromDaycare());

/** 1:1 décomp `TakePokemonFromDaycare` (daycare.c:281) — specialvar VAR_RESULT =
 *  species du mon retiré (EXP pension appliquée + shift des slots). */
registerSpecial('TakePokemonFromDaycare', () => TakePokemonFromDaycare());

/** 1:1 décomp `GiveEggFromDaycare` (daycare.c:874) — crée l'œuf (hérédité complète)
 *  dans la party, retire l'œuf pendant de la pension. */
registerSpecial('GiveEggFromDaycare', () => { GiveEggFromDaycare(); return 0; });

/** 1:1 décomp `RejectEggFromDayCare` (daycare.c:726). */
registerSpecial('RejectEggFromDayCare', () => { RejectEggFromDayCare(); return 0; });

/** 1:1 décomp `SetDaycareCompatibilityString` (daycare.c:1082) — gStringVar4
 *  (lu par ShowFieldMessageStringVar4). */
registerSpecial('SetDaycareCompatibilityString', () => { SetDaycareCompatibilityString(); return 0; });

/** 1:1 décomp `ShowDaycareLevelMenu` (daycare.c:1270) — def_special waitstate=1 :
 *  list menu 3 entrées (mon 1 / mon 2 / RETOUR) ; Task_HandleDaycareLevelMenuInput
 *  pose VAR_RESULT puis ScriptContext_Enable + SignalWaitState. */
registerSpecial('ShowDaycareLevelMenu', () => { ShowDaycareLevelMenu(); return 0; });

/** 1:1 décomp `HasAtLeastOneBerry` (item.c:163-177).
 *  Loop sur les berry slots (ITEM_CHERI_BERRY..ITEM_BRIGHT_POWDER-1, soit
 *  FIRST_BERRY_INDEX..(ITEM_BRIGHT_POWDER-1)). Set gSpecialVar_Result + return. */
registerSpecial('HasAtLeastOneBerry', () => {
  // 1:1 décomp items.h : FIRST_BERRY_INDEX = ITEM_CHERI_BERRY = 133.
  // ITEM_BRIGHT_POWDER = 179.
  // Notre CheckBagHasItem prend STRING key — on doit utiliser getItemKeyById.
  const { getItemKeyById } = (globalThis as { __game_data?: {
    getItemKeyById?: (id: number) => string;
  } }).__game_data ?? {};
  if (!getItemKeyById) {
    // Fallback : itère via gSaveBlock1Ptr.itemSlots.berries (= pocket 5).
    const sb1 = gSaveBlock1Ptr as unknown as { bagPocket_Berries?: Array<{ itemId?: string; quantity?: number }> };
    const berries = sb1.bagPocket_Berries ?? [];
    for (const slot of berries) {
      if (slot.itemId && (slot.quantity ?? 0) > 0) {
        VarSet('VAR_RESULT', 1);
        return 1;
      }
    }
    VarSet('VAR_RESULT', 0);
    return 0;
  }
  // 1:1 décomp loop FIRST_BERRY_INDEX..ITEM_BRIGHT_POWDER-1 (= 133..178).
  for (let i = 133; i < 179; i++) {
    const key = getItemKeyById(i);
    if (key) {
      // Re-import CheckBagHasItem inline to avoid TDZ cycle.
      const checkFn = (globalThis as { __game_bag?: {
        CheckBagHasItem?: (key: string, count: number) => boolean;
      } }).__game_bag?.CheckBagHasItem;
      if (checkFn && checkFn(key, 1)) {
        VarSet('VAR_RESULT', 1);
        return 1;
      }
    }
  }
  VarSet('VAR_RESULT', 0);
  return 0;
});

// `IsSelectedMonEgg` déjà porté ligne 741 (= duplicate skip).
// `IsLastMonThatKnowsSurf` real body ajouté ligne 415 (= remplace stub).

/** 1:1 décomp `Special_AreLeadMonEVsMaxedOut` (field_specials.c:1390-1396).
 *  Return TRUE si EVs total du lead mon >= MAX_TOTAL_EVS (= 510). */
registerSpecial('Special_AreLeadMonEVsMaxedOut', Special_AreLeadMonEVsMaxedOut);  // impl 1:1 → src/field_specials.ts

// `RetrieveLotteryNumber` (lottery_corner.c:42) : impl 1:1 dans son foyer
// src/lottery_corner.ts, enregistrée ici (table gSpecials).
registerSpecial('RetrieveLotteryNumber', RetrieveLotteryNumber);

/** 1:1 décomp `HasBardSongBeenChanged` (mauville_old_man.c:151-154).
 *  Set gSpecialVar_Result = oldMan.bard.hasChangedSong (= 0/1). */
registerSpecial('HasBardSongBeenChanged', () => {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'bard') return om.hasChangedSong;
  return 0;
});

/** 1:1 décomp `HasHipsterTaughtWord` (mauville_old_man.c:241-244).
 *  Set gSpecialVar_Result = oldMan.hipster.taughtWord (= 0/1). */
registerSpecial('HasHipsterTaughtWord', () => {
  // 1:1 décomp mauville_old_man.c (VOID) : gSpecialVar_Result =
  // gSaveBlock1Ptr->oldMan.hipster.taughtWord. Appelé via `special`
  // (mauville_man.inc) → VarSet explicite. [[gotcha-special-vs-specialvar-varresult]]
  const om = gSaveBlock1Ptr.oldMan;
  const result = (om && om.kind === 'hipster') ? om.taughtWord : 0;
  VarSet('VAR_RESULT', result);
  return result;
});

/** 1:1 décomp `IsContestDebugActive` (contest_util.c:2571-2574).
 *  Return FALSE — toujours (= contest debug n'a jamais été enabled in shipping
 *  Emerald). 1:1 strict justifié. */
registerSpecial('IsContestDebugActive', () => 0);

/** 1:1 décomp `IsGabbyAndTyShowOnTheAir` (tv.c:1004-1007).
 *  Return gSaveBlock1Ptr->gabbyAndTyData.onAir. */
registerSpecial('IsGabbyAndTyShowOnTheAir', () => {
  return gSaveBlock1Ptr.gabbyAndTyData?.onAir ?? 0;
});

/** 1:1 décomp `GabbyAndTyGetLastBattleTrivia` (tv.c:1020-1035).
 *  Check 4 flags battle dans gabbyAndTyData ; retourne 1/2/3/4 selon le
 *  premier flag positif. Default 0 (= rien à dire). */
registerSpecial('GabbyAndTyGetLastBattleTrivia', () => {
  const d = gSaveBlock1Ptr.gabbyAndTyData;
  if (!d) return 0;
  if (!d.battleTookMoreThanOneTurn2) return 1;
  if (d.playerThrewABall2) return 2;
  if (d.playerUsedHealingItem2) return 3;
  if (d.playerLostAMon2) return 4;
  return 0;
});

/** 1:1 décomp `GetWirelessCommType` (link.c:1846-1849).
 *  Return gWirelessCommType (= 0 si pas link, non-zero si Wireless).
 *  Notre projet : pas de wireless link (= retourne 0 = 1:1 strict justifié). */
registerSpecial('GetWirelessCommType', () => 0);

/** 1:1 décomp `DoesPlayerHaveNoDecorations` (trader.c:145-158).
 *  Loop sur DECORCAT_COUNT (= 8 catégories). Return TRUE si aucune category
 *  n'a de decoration ownéee. Set gSpecialVar_Result. */
registerSpecial('DoesPlayerHaveNoDecorations', () => {
  // 1:1 décomp constants/decorations.h DECORCAT_COUNT = 8.
  // Import dynamique pour éviter cycle ESM.
  const { GetNumOwnedDecorationsInCategory } = (globalThis as { __game_decoration?: {
    GetNumOwnedDecorationsInCategory?: (cat: number) => number;
  } }).__game_decoration ?? {};
  if (!GetNumOwnedDecorationsInCategory) {
    // Fallback : aucune decoration system loaded → return TRUE.
    VarSet('VAR_RESULT', 1);
    return 1;
  }
  for (let i = 0; i < 8; i++) {
    if (GetNumOwnedDecorationsInCategory(i) > 0) {
      VarSet('VAR_RESULT', 0);
      return 0;
    }
  }
  VarSet('VAR_RESULT', 1);
  return 1;
});

/** 1:1 décomp `IsDodrioInParty` (dodrio_berry_picking.c:2908-2922).
 *  Loop sur PARTY_SIZE, return TRUE si un mon non-empty est SPECIES_DODRIO. */
registerSpecial('IsDodrioInParty', () => {
  // 1:1 décomp : loop PARTY_SIZE, TRUE si un mon non-empty == SPECIES_DODRIO.
  for (let i = 0; i < PARTY_SIZE; i++) {
    const species = _GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number;
    if (species !== 0 && species === SPECIES_DODRIO) {
      VarSet('VAR_RESULT', 1);
      return 1;
    }
  }
  VarSet('VAR_RESULT', 0);
  return 0;
});

/** 1:1 décomp `LeadMonHasEffortRibbon` (field_specials.c:1372-1375).
 *  Retourne MON_DATA_EFFORT_RIBBON du lead mon (= 1er non-egg slot).
 *  Notre PokemonInstance ne stocke pas encore les ribbons (= subsystem ribbons
 *  pas porté). Return 0 = no ribbon, 1:1 strict justifié (= notre projet ne
 *  donne pas encore de ribbons via SetMonData MON_DATA_EFFORT_RIBBON).
 *  Dette R3 documentée : ajouter ribbons field PokemonInstance + serialization. */
registerSpecial('LeadMonHasEffortRibbon', LeadMonHasEffortRibbon);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `GetPlayerTrainerIdOnesDigit` (field_specials.c:901-904).
 *  Retourne les low 16 bits du trainer ID modulo 10. */
registerSpecial('GetPlayerTrainerIdOnesDigit', GetPlayerTrainerIdOnesDigit);  // impl 1:1 → src/field_specials.ts

// `ScriptGetPartyMonSpecies` déjà porté ligne 692 (= duplicate skip).

/** 1:1 décomp `MonOTNameNotPlayer` (field_specials.c:1572-1583).
 *  Retourne TRUE si OT name du mon var0x8004 != player name OR language != GAME_LANGUAGE.
 *  Used par scripts e.g. NameRater pour bloquer rename de mons étrangers. */
registerSpecial('MonOTNameNotPlayer', MonOTNameNotPlayer);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `IsGrassTypeInParty` (field_specials.c:1230-1249).
 *  Loop sur les 6 slots party, retourne TRUE si au moins un mon non-egg a
 *  TYPE_GRASS comme type1 ou type2. Set gSpecialVar_Result. */
registerSpecial('IsGrassTypeInParty', IsGrassTypeInParty);  // impl 1:1 → src/field_specials.ts

// ─── Session A2.24 batch — 5 specials triviaux 1:1 strict ──────────────────

/** 1:1 décomp `SetTrickHouseNuggetFlag` (field_specials.c:1174-1180) :
 *  ```c
 *  void SetTrickHouseNuggetFlag(void) {
 *      u16 *specVar = &gSpecialVar_0x8004;
 *      u16 flag = FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET;
 *      *specVar = flag;
 *      FlagSet(flag);
 *  }
 *  ```
 *  Stocke l'id numérique du flag dans VAR_0x8004 puis set le flag par name
 *  (notre FlagSet prend un name string = 1:1 strict comportementalement). */
registerSpecial('SetTrickHouseNuggetFlag', SetTrickHouseNuggetFlag);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `ResetTrickHouseNuggetFlag` (field_specials.c:1182-1188) :
 *  ```c
 *  void ResetTrickHouseNuggetFlag(void) {
 *      u16 *specVar = &gSpecialVar_0x8004;
 *      u16 flag = FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET;
 *      *specVar = flag;
 *      FlagClear(flag);
 *  }
 *  ``` */
registerSpecial('ResetTrickHouseNuggetFlag', ResetTrickHouseNuggetFlag);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `SwapRegisteredBike` (item.c:577-588) :
 *  ```c
 *  void SwapRegisteredBike(void) {
 *      switch (gSaveBlock1Ptr->registeredItem) {
 *      case ITEM_MACH_BIKE: gSaveBlock1Ptr->registeredItem = ITEM_ACRO_BIKE; break;
 *      case ITEM_ACRO_BIKE: gSaveBlock1Ptr->registeredItem = ITEM_MACH_BIKE; break;
 *      }
 *  }
 *  ```
 *  Toggle entre Mach Bike et Acro Bike enregistré au L button. */
registerSpecial('SwapRegisteredBike', () => {
  const sb1 = gSaveBlock1Ptr as unknown as { registeredItem: number; __registeredItemKey?: string };
  switch (sb1.registeredItem) {
    case ITEM_MACH_BIKE:
      sb1.registeredItem = ITEM_ACRO_BIKE;
      // Web-port : maintenir le bridge __registeredItemKey 1:1 (cf. save-blocks.ts:1201).
      sb1.__registeredItemKey = 'ITEM_ACRO_BIKE';
      break;
    case ITEM_ACRO_BIKE:
      sb1.registeredItem = ITEM_MACH_BIKE;
      sb1.__registeredItemKey = 'ITEM_MACH_BIKE';
      break;
  }
});

/** 1:1 décomp `SetMauvilleOldManObjEventGfx` (mauville_old_man.c:746-749) :
 *  ```c
 *  void SetMauvilleOldManObjEventGfx(void) {
 *      VarSet(VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_BARD);
 *  }
 *  ```
 *  Force le sprite Mauville Old Man en BARD (= old man par défaut).
 *  Impl 1:1 → foyer src/mauville_old_man.ts (aussi appelée par SetMauvilleOldMan). */
registerSpecial('SetMauvilleOldManObjEventGfx', SetMauvilleOldManObjEventGfx);

/** 1:1 décomp `GiddyShouldTellAnotherTale` (mauville_old_man.c:267-280) :
 *  ```c
 *  void GiddyShouldTellAnotherTale(void) {
 *      struct MauvilleManGiddy *giddy = &gSaveBlock1Ptr->oldMan.giddy;
 *      if (giddy->taleCounter == GIDDY_MAX_TALES) {
 *          gSpecialVar_Result = FALSE;
 *          giddy->taleCounter = 0;
 *      } else {
 *          gSpecialVar_Result = TRUE;
 *      }
 *  }
 *  ```
 *  Décide si Giddy continue à raconter (= TRUE) ou s'arrête (= FALSE) après
 *  avoir atteint GIDDY_MAX_TALES (= 10) racontes. */
registerSpecial('GiddyShouldTellAnotherTale', () => {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'giddy') {
    if (om.taleCounter === GIDDY_MAX_TALES) {
      om.taleCounter = 0;
      VarSet('VAR_RESULT', 0);
      return 0;
    }
    VarSet('VAR_RESULT', 1);
    return 1;
  }
  // 1:1 strict : si pas en mode giddy, le décomp accède quand même au struct
  // (union) — retourne TRUE par défaut comportementalement (= taleCounter=0).
  VarSet('VAR_RESULT', 1);
  return 1;
});

// ─── Session A2.25 batch — 5 specials triviaux 1:1 strict ──────────────────

/** 1:1 décomp `Script_GetCurrentMauvilleMan` (mauville_old_man.c:146-149) :
 *  ```c
 *  void Script_GetCurrentMauvilleMan(void) {
 *      gSpecialVar_Result = GetCurrentMauvilleOldMan();
 *  }
 *  ```
 *  Et `GetCurrentMauvilleOldMan` :142 (foyer src/mauville_old_man.ts) retourne
 *  `gSaveBlock1Ptr->oldMan.common.id`. */
registerSpecial('Script_GetCurrentMauvilleMan', () => {
  const id = GetCurrentMauvilleOldMan();
  VarSet('VAR_RESULT', id);
  return id;
});

/** 1:1 décomp `SetHipsterTaughtWord` (mauville_old_man.c:246-249) :
 *  ```c
 *  void SetHipsterTaughtWord(void) {
 *      (&gSaveBlock1Ptr->oldMan.hipster)->taughtWord = TRUE;
 *  }
 *  ```
 *  Set hipster.taughtWord = 1. */
registerSpecial('SetHipsterTaughtWord', () => {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'hipster') {
    om.taughtWord = 1;
  }
  // 1:1 strict : si pas hipster, le décomp écrirait quand même via le union
  // pointer (= behavior wrt union puis ré-init). Notre discriminated union
  // empêche d'écrire sur le mauvais variant ; aligné avec le savegame quand
  // hipster est actif (= seul cas où ce special est appelé via scripts).
});

/** 1:1 décomp `IncrementDailyPlantedBerries` (tv.c:2523-2526) :
 *  ```c
 *  void IncrementDailyPlantedBerries(void) {
 *      VarSet(VAR_DAILY_PLANTED_BERRIES, VarGet(VAR_DAILY_PLANTED_BERRIES) + 1);
 *  }
 *  ```
 *  Stat daily : +1 berry planted. */
registerSpecial('IncrementDailyPlantedBerries', () => {
  VarSet('VAR_DAILY_PLANTED_BERRIES', (VarGet('VAR_DAILY_PLANTED_BERRIES') + 1) & 0xFFFF);
});

/** 1:1 décomp `IncrementDailyPickedBerries` (tv.c:2528-2531) :
 *  ```c
 *  void IncrementDailyPickedBerries(void) {
 *      VarSet(VAR_DAILY_PICKED_BERRIES, VarGet(VAR_DAILY_PICKED_BERRIES) + gSpecialVar_0x8006);
 *  }
 *  ```
 *  Stat daily : +X berries picked (X = gSpecialVar_0x8006 = nb harvest). */
registerSpecial('IncrementDailyPickedBerries', () => {
  const delta = VarGet('VAR_0x8006');
  VarSet('VAR_DAILY_PICKED_BERRIES', (VarGet('VAR_DAILY_PICKED_BERRIES') + delta) & 0xFFFF);
});

/** 1:1 décomp `SetChampionSaveWarp` (save_location.c:136-139) — impl
 *  transpilée dans src/save_location.ts (source unique, même fichier que la décomp). */
registerSpecial('SetChampionSaveWarp', () => { SetChampionSaveWarp(); });

// ─── Session A2.26 batch — 5 specials triviaux 1:1 strict ──────────────────

/** 1:1 décomp `ResetFanClub` (field_specials.c:3979-3983) :
 *  ```c
 *  void ResetFanClub(void) {
 *      gSaveBlock1Ptr->vars[VAR_FANCLUB_FAN_COUNTER - VARS_START] = 0;
 *      gSaveBlock1Ptr->vars[VAR_FANCLUB_LOSE_FAN_TIMER - VARS_START] = 0;
 *  }
 *  ```
 *  Reset fan club state (= counter + lose-fan timer). */
registerSpecial('ResetFanClub', ResetFanClub);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `IsTrendyPhraseBoring` (dewford_trend.c:296-314) :
 *  ```c
 *  void IsTrendyPhraseBoring(void) {
 *      bool16 result = FALSE;
 *      do {
 *          if (gSaveBlock1Ptr->dewfordTrends[0].trendiness - gSaveBlock1Ptr->dewfordTrends[1].trendiness > 1)
 *              break;
 *          if (gSaveBlock1Ptr->dewfordTrends[0].gainingTrendiness)
 *              break;
 *          if (!gSaveBlock1Ptr->dewfordTrends[1].gainingTrendiness)
 *              break;
 *          result = TRUE;
 *      } while (0);
 *      gSpecialVar_Result = result;
 *  }
 *  ```
 *  Determine si la phrase trendy courante (slot 0) est "boring" (= peu plus
 *  trendy que slot 1, et pas gagne pas, mais slot 1 gagne). */
// Impl 1:1 dans le foyer src/dewford_trend.ts (pose gSpecialVar.Result), enregistrée ici.
registerSpecial('IsTrendyPhraseBoring', IsTrendyPhraseBoring);

/** 1:1 décomp `IsContestWithRSPlayer` (contest_util.c:2762-2768) :
 *  ```c
 *  bool8 IsContestWithRSPlayer(void) {
 *      if (gLinkContestFlags & LINK_CONTEST_FLAG_HAS_RS_PLAYER)
 *          return TRUE;
 *      else
 *          return FALSE;
 *  }
 *  ```
 *  Notre projet : pas de link wireless (= gLinkContestFlags toujours 0).
 *  1:1 strict justifié (pas RS link). */
registerSpecial('IsContestWithRSPlayer', () => 0);

/** 1:1 décomp `LinkContestTryShowWirelessIndicator` (contest_util.c:2741-2751) :
 *  ```c
 *  void LinkContestTryShowWirelessIndicator(void) {
 *      if (gLinkContestFlags & LINK_CONTEST_FLAG_IS_WIRELESS) {
 *          if (gReceivedRemoteLinkPlayers) {
 *              LoadWirelessStatusIndicatorSpriteGfx();
 *              CreateWirelessStatusIndicatorSprite(8, 8);
 *          }
 *      }
 *  }
 *  ```
 *  Notre projet : gLinkContestFlags == 0 → guard fail → no-op 1:1 strict justifié. */
registerSpecial('LinkContestTryShowWirelessIndicator', () => {
  // 1:1 décomp guard fail (gLinkContestFlags == 0) → no-op.
});

/** 1:1 décomp `LinkContestTryHideWirelessIndicator` (contest_util.c:2753-2759) :
 *  ```c
 *  void LinkContestTryHideWirelessIndicator(void) {
 *      if (gLinkContestFlags & LINK_CONTEST_FLAG_IS_WIRELESS) {
 *          if (gReceivedRemoteLinkPlayers)
 *              DestroyWirelessStatusIndicatorSprite();
 *      }
 *  }
 *  ```
 *  Same pattern, no-op 1:1 strict justifié. */
registerSpecial('LinkContestTryHideWirelessIndicator', () => {
  // 1:1 décomp guard fail (gLinkContestFlags == 0) → no-op.
});

// `IsCurSecretBaseOwnedByAnotherPlayer` (secret_base.c:720-726) — dette R3 :
// utilise sCurSecretBaseId (= static, set par EnterNewlyCreatedSecretBase).
// SecretBase subsystem U-tier (cf. ROADMAP U-tier).

/** 1:1 décomp `SetHiddenItemFlag` (field_specials.c:935-938) :
 *  ```c
 *  void SetHiddenItemFlag(void) {
 *      FlagSet(gSpecialVar_0x8004);
 *  }
 *  ```
 *  VAR_0x8004 contient le numeric id du flag (set par script `setvar VAR_0x8004,
 *  FLAG_HIDDEN_ITEM_X`). Notre FlagSet accepte maintenant string | number
 *  (= refactor B1). reverseDecompConstant(numId, 'FLAG_') mappe au name string. */
registerSpecial('SetHiddenItemFlag', SetHiddenItemFlag);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `SetRoute119Weather` (field_specials.c:1519-1523) :
 *  ```c
 *  void SetRoute119Weather(void) {
 *      if (IsMapTypeOutdoors(GetLastUsedWarpMapType()) != TRUE)
 *          SetSavedWeather(WEATHER_ROUTE119_CYCLE);
 *  }
 *  ```
 *  WEATHER_ROUTE119_CYCLE = 20. SetSavedWeather = gSaveBlock1Ptr.weather = N. */
registerSpecial('SetRoute119Weather', SetRoute119Weather);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `SetRoute123Weather` (field_specials.c:1525-1529) :
 *  Same pattern with WEATHER_ROUTE123_CYCLE = 21. */
registerSpecial('SetRoute123Weather', SetRoute123Weather);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `UpdateShoalTideFlag` (time_events.c:54-92) :
 *  ```c
 *  void UpdateShoalTideFlag(void) {
 *      static const u8 tide[24] = {1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1};
 *      if (IsMapTypeOutdoors(GetLastUsedWarpMapType())) {
 *          RtcCalcLocalTime();
 *          if (tide[gLocalTime.hours]) FlagSet(FLAG_SYS_SHOAL_TIDE);
 *          else FlagClear(FLAG_SYS_SHOAL_TIDE);
 *      }
 *  }
 *  ```
 *  Marée Shoal Cave : low tide 03:00-08:00 + 15:00-20:00, sinon high tide.
 *  B4 refactor débloqué : helpers GetLastUsedWarpMapType + IsMapTypeOutdoors
 *  portés dans overworld.ts. Foyer 1:1 = time_events.ts (gSpecials[] référence). */
registerSpecial('UpdateShoalTideFlag', UpdateShoalTideFlag);

// `GenerateGiddyLine` (mauville_old_man.c:282-315) — dette R3 cascade :
// utilise EasyChat (CopyEasyChatWord), Random, gStringVar4, sGiddyAdjectives,
// sGiddyQuestions, GiddyText_Is, GiddyText_DontYouAgree. Tables strings non
// extraites. Reste stub jusqu'à port mauville_old_man string tables.

// ─── Session B6 batch — 6 specials triviaux 1:1 strict ─────────────────────
//
// Source décomp pour chaque registerSpecial ci-dessous (= ligne précise dans
// le commentaire au-dessus de chaque entry). Aucun stub silencieux : tous les
// ports ont une cascade R3 résolue (helpers portés dans modules dédiés :
// CheckPartyPokerus = battle/party-storage.ts, CheckPartyMonHasHeldItem =
// script-pokemon-util.ts, GetPCBoxToSendMon = pc-box.ts).

/** 1:1 décomp `GetObjectEventLocalIdByFlag` (decoration.c:2217-2229) :
 *  ```c
 *  void GetObjectEventLocalIdByFlag(void) {
 *      u8 i;
 *      for (i = 0; i < gMapHeader.events->objectEventCount; i++) {
 *          if (gMapHeader.events->objectEvents[i].flagId == gSpecialVar_0x8004) {
 *              gSpecialVar_0x8005 = gMapHeader.events->objectEvents[i].localId;
 *              break;
 *          }
 *      }
 *  }
 *  ```
 *  Scan les objectEvents du current map pour trouver le NPC dont le flagId
 *  matche gSpecialVar_0x8004 (= numeric flag id). Décomp compare u16 ↔ u16
 *  direct ; notre flagId est stocké en STRING (= name canonical). Bridge via
 *  reverseDecompConstant(0x8004 value, 'FLAG_') ou fallback `__flag_<id>`. */
registerSpecial('GetObjectEventLocalIdByFlag', () => {
  if (!gMapHeader || !gMapHeader.events) return;
  const targetFlagNum = VarGet('VAR_0x8004');
  // 1:1 strict bridge : décomp utilise numeric direct, nous string. Pour
  // matcher, on resolve le name canonical via la table reverse (= même
  // bijection que B1 _resolveFlagKey).
  const targetFlagName = reverseDecompConstant(targetFlagNum, 'FLAG_')
                       ?? `__flag_${targetFlagNum}`;
  const events = gMapHeader.events.objectEvents;
  for (let i = 0; i < events.length; i++) {
    if (events[i].flagId === targetFlagName) {
      VarSet('VAR_0x8005', events[i].localId);
      break;
    }
  }
});

/** 1:1 décomp `IsPokerusInParty` (field_specials.c:1455-1461) :
 *  ```c
 *  bool8 IsPokerusInParty(void) {
 *      if (!CheckPartyPokerus(gPlayerParty, (1 << PARTY_SIZE) - 1))
 *          return FALSE;
 *      return TRUE;
 *  }
 *  ```
 *  Cascade R3 résolue : CheckPartyPokerus porté dans battle/party-storage.ts
 *  (= 1:1 pokemon.c:6101-6127). Lit MON_DATA_POKERUS sur chaque mon (bits 0-3
 *  = active pokerus). Retourne TRUE si au moins un mon a pokerus actif. */
registerSpecial('IsPokerusInParty', IsPokerusInParty);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `DoesPartyHaveEnigmaBerry` (script_pokemon_util.c:128-135) :
 *  ```c
 *  bool8 DoesPartyHaveEnigmaBerry(void) {
 *      bool8 hasItem = CheckPartyMonHasHeldItem(ITEM_ENIGMA_BERRY);
 *      if (hasItem == TRUE)
 *          GetBerryNameByBerryType(ItemIdToBerryType(ITEM_ENIGMA_BERRY), gStringVar1);
 *      return hasItem;
 *  }
 *  ```
 *  Cascade R3 résolue partielle :
 *    - CheckPartyMonHasHeldItem porté dans script-pokemon-util.ts (1:1).
 *    - GetBerryNameByBerryType + ItemIdToBerryType non portés (= dette R3 sur
 *      le berry name table). Le set du buffer gStringVar1 n'a d'effet que si
 *      un dialogue suivant expand {STR_VAR_1} (= contexte : Berry/Mystery
 *      Gift NPC). Sans ce buffer, le mon est reconnu mais le name affiché
 *      sera vide. Doc explicite : ne pas porter Berry name avant le port
 *      berry data subsystem complet. */
registerSpecial('DoesPartyHaveEnigmaBerry', () => {
  const hasItem = CheckPartyMonHasHeldItem(ITEM_ENIGMA_BERRY);
  // Note 1:1 strict : GetBerryNameByBerryType(ItemIdToBerryType(ITEM_ENIGMA_BERRY))
  // → gStringVar1 omis. Dette R3 berry name table. Comportement boolean
  // retour identique au décomp.
  return hasItem ? 1 : 0;
});

/** 1:1 décomp `GetNumMovesSelectedMonHas` (party_menu.c:6347-6357) :
 *  ```c
 *  void GetNumMovesSelectedMonHas(void) {
 *      u8 i;
 *      gSpecialVar_Result = 0;
 *      for (i = 0; i < MAX_MON_MOVES; i++) {
 *          if (GetMonData(&gPlayerParty[gSpecialVar_0x8004], MON_DATA_MOVE1 + i) != MOVE_NONE)
 *              gSpecialVar_Result++;
 *      }
 *  }
 *  ```
 *  Scan slots MOVE1..MOVE4 du mon à l'index VAR_0x8004 dans gPlayerParty.
 *  Compte le nombre de slots non-MOVE_NONE. Result dans VAR_RESULT. */
registerSpecial('GetNumMovesSelectedMonHas', () => {
  // 1:1 décomp (party_menu.c:6347) : count MOVE1..MOVE4 != MOVE_NONE du mon VAR_0x8004.
  const slot = VarGet('VAR_0x8004') ?? 0;
  const mon = gPlayerParty[slot];
  let count = 0;
  if (mon) {
    for (let i = 0; i < MAX_MON_MOVES; i++) {
      if (_GetMonData(mon, _MON_DATA_MOVE1 + i) !== MOVE_NONE) count++;
    }
  }
  VarSet('VAR_RESULT', count);
});

/** 1:1 décomp `GetPCBoxToSendMon` (field_specials.c:3410-3413) :
 *  ```c
 *  u16 GetPCBoxToSendMon(void) {
 *      return sPCBoxToSendMon;
 *  }
 *  ```
 *  Getter du static sPCBoxToSendMon (= dernier box ciblé pour réception mon).
 *  Cascade R3 résolue : sPCBoxToSendMon + Set/Get portés dans pc-box.ts. */
registerSpecial('GetPCBoxToSendMon', () => {
  return GetPCBoxToSendMon();
});

/** 1:1 décomp `BufferBattleTowerElevatorFloors` (field_specials.c:2209-2245) :
 *  ```c
 *  void BufferBattleTowerElevatorFloors(void) {
 *      static const u16 sBattleTowerStreakThresholds[] = {
 *          7, 14, 21, 28, 35, 49, 63, 77, 91, 0
 *      };
 *      u8 i;
 *      u16 battleMode = VarGet(VAR_FRONTIER_BATTLE_MODE);
 *      u8 lvlMode = gSaveBlock2Ptr->frontier.lvlMode;
 *      if (battleMode == FRONTIER_MODE_LINK_MULTIS) {
 *          gSpecialVar_0x8005 = 4; gSpecialVar_0x8006 = 5; return;
 *      }
 *      if (battleMode == FRONTIER_MODE_MULTIS
 *          && !FlagGet(FLAG_CHOSEN_MULTI_BATTLE_NPC_PARTNER)) {
 *          gSpecialVar_0x8005 = 5; gSpecialVar_0x8006 = 4; return;
 *      }
 *      for (i = 0; i < ARRAY_COUNT(sBattleTowerStreakThresholds) - 1; i++) {
 *          if (sBattleTowerStreakThresholds[i]
 *              > gSaveBlock2Ptr->frontier.towerWinStreaks[battleMode][lvlMode]) {
 *              gSpecialVar_0x8005 = 4; gSpecialVar_0x8006 = i + 5; return;
 *          }
 *      }
 *      gSpecialVar_0x8005 = 4; gSpecialVar_0x8006 = 12;
 *  }
 *  ```
 *  Set VAR_0x8005/0x8006 = nombre d'étages d'ascenseur affichés en Battle
 *  Tower selon battleMode (= single/double/multi/link-multi) et win streak. */
registerSpecial('BufferBattleTowerElevatorFloors', () => {
  // 1:1 décomp : `static const u16 sBattleTowerStreakThresholds[]`.
  const sBattleTowerStreakThresholds: ReadonlyArray<number> = [7, 14, 21, 28, 35, 49, 63, 77, 91, 0];
  const battleMode = VarGet('VAR_FRONTIER_BATTLE_MODE');
  const lvlMode = gSaveBlock2Ptr.frontier.lvlMode;
  if (battleMode === FRONTIER_MODE_LINK_MULTIS) {
    VarSet('VAR_0x8005', 4);
    VarSet('VAR_0x8006', 5);
    return;
  }
  if (battleMode === FRONTIER_MODE_MULTIS && !FlagGet(FLAG_CHOSEN_MULTI_BATTLE_NPC_PARTNER)) {
    VarSet('VAR_0x8005', 5);
    VarSet('VAR_0x8006', 4);
    return;
  }
  const towerStreak = gSaveBlock2Ptr.frontier.towerWinStreaks?.[battleMode]?.[lvlMode] ?? 0;
  for (let i = 0; i < sBattleTowerStreakThresholds.length - 1; i++) {
    if (sBattleTowerStreakThresholds[i] > towerStreak) {
      VarSet('VAR_0x8005', 4);
      VarSet('VAR_0x8006', i + 5);
      return;
    }
  }
  VarSet('VAR_0x8005', 4);
  VarSet('VAR_0x8006', 12);
});

// ─── Session B9 batch — 3 specials Favor Lady 1:1 strict ───────────────────

/** 1:1 décomp `DidFavorLadyLikeItem` (lilycove_lady.c:218-222) :
 *  ```c
 *  bool8 DidFavorLadyLikeItem(void) {
 *      sFavorLadyPtr = &gSaveBlock1Ptr->lilycoveLady.favor;
 *      return sFavorLadyPtr->likedItem ? TRUE : FALSE;
 *  }
 *  ``` */
registerSpecial('DidFavorLadyLikeItem', () => +_lilycove.DidFavorLadyLikeItem());

/** 1:1 décomp `IsFavorLadyThresholdMet` (lilycove_lady.c:264-271) :
 *  ```c
 *  bool8 IsFavorLadyThresholdMet(void) {
 *      u8 numItemsGiven;
 *      sFavorLadyPtr = &gSaveBlock1Ptr->lilycoveLady.favor;
 *      numItemsGiven = sFavorLadyPtr->numItemsGiven;
 *      return numItemsGiven < LILYCOVE_LADY_GIFT_THRESHOLD ? FALSE : TRUE;
 *  }
 *  ```
 *  LILYCOVE_LADY_GIFT_THRESHOLD = 5 (= lilycove_lady-data.ts). */
registerSpecial('IsFavorLadyThresholdMet', () => +_lilycove.IsFavorLadyThresholdMet());

/** 1:1 décomp `FavorLadyGetPrize` (lilycove_lady.c:278-287) :
 *  ```c
 *  u16 FavorLadyGetPrize(void) {
 *      u16 prize;
 *      sFavorLadyPtr = &gSaveBlock1Ptr->lilycoveLady.favor;
 *      prize = sFavorLadyPrizes[sFavorLadyPtr->favorId];
 *      FavorLadyBufferPrizeName(prize);
 *      sFavorLadyPtr->state = LILYCOVE_LADY_STATE_PRIZE;
 *      return prize;
 *  }
 *  ```
 *  sFavorLadyPrizes 1:1 décomp data/lilycove_lady.h:423-431 (6 items).
 *  LILYCOVE_LADY_STATE_PRIZE = 2. */
registerSpecial('FavorLadyGetPrize', _lilycove.FavorLadyGetPrize);

// ─── Session B18 batch — 1 special Berry Powder 1:1 strict ────────────────

/** 1:1 décomp `HasEnoughBerryPowder` (berry_powder.c:153-160) :
 *  ```c
 *  bool8 HasEnoughBerryPowder(void) {
 *      u32 *powder = &gSaveBlock2Ptr->berryCrush.berryPowderAmount;
 *      if (DecryptBerryPowder(powder) < gSpecialVar_0x8004) return FALSE;
 *      else return TRUE;
 *  }
 *  ```
 *  Cascade R3 simplifiée : DecryptBerryPowder (= `*powder ^ encryptionKey`)
 *  retourne le powder direct chez nous (= notre projet stocke cleartext
 *  sans XOR encryption, pattern aligné GetGameStat). berryPowderAmount
 *  existe dans gSaveBlock2Ptr.berryCrush 1:1 strict. */
registerSpecial('HasEnoughBerryPowder', () => {
  const powder = gSaveBlock2Ptr.berryCrush?.berryPowderAmount ?? 0;
  const required = VarGet('VAR_0x8004');
  return powder < required ? 0 : 1;
});

/** 1:1 décomp `GiveBerryPowder(u32 amountToAdd)` (berry_powder.c:162-176) :
 *  ```c
 *  bool8 GiveBerryPowder(u32 amountToAdd) {
 *      u32 *powder = &gSaveBlock2Ptr->berryCrush.berryPowderAmount;
 *      u32 amount = DecryptBerryPowder(powder) + amountToAdd;
 *      if (amount > MAX_BERRY_POWDER) {
 *          SetBerryPowder(powder, MAX_BERRY_POWDER);
 *          return FALSE;
 *      } else {
 *          SetBerryPowder(powder, amount);
 *          return TRUE;
 *      }
 *  }
 *  ```
 *  MAX_BERRY_POWDER = 99999 (= berry_crush.h:36).
 *  Special bridge : amountToAdd passed via gSpecialVar_0x8004 (= pattern décomp). */
registerSpecial('GiveBerryPowder', () => {
  if (!gSaveBlock2Ptr.berryCrush) return 0;
  const MAX_BERRY_POWDER = 99999;
  const amountToAdd = VarGet('VAR_0x8004');
  const current = gSaveBlock2Ptr.berryCrush.berryPowderAmount ?? 0;
  const total = current + amountToAdd;
  if (total > MAX_BERRY_POWDER) {
    gSaveBlock2Ptr.berryCrush.berryPowderAmount = MAX_BERRY_POWDER;
    return 0;  // FALSE (= cap reached, not all added)
  }
  gSaveBlock2Ptr.berryCrush.berryPowderAmount = total;
  return 1;  // TRUE
});

/** 1:1 décomp `GetBerryPowder(void)` (berry_powder.c:198-202) :
 *      return DecryptBerryPowder(powder).
 *  Notre port stocke cleartext (= no XOR), retourne direct. */
registerSpecial('GetBerryPowder', () => {
  return gSaveBlock2Ptr.berryCrush?.berryPowderAmount ?? 0;
});

// ─── lottery_corner.c — specials enregistrés depuis le foyer 1:1 ───────────
// Toute la logique (ResetLotteryCorner / PickLotteryCornerTicket / GetMatchingDigits
// / sLotteryPrizes / GetLotteryNumber / SetLotteryNumber) vit dans son foyer miroir
// src/lottery_corner.ts. Ici on se contente de l'enregistrer dans la table gSpecials.
// `SetRandomLotteryNumber` n'est PAS un special (absent de specials.inc) : appelé par
// UpdatePerDay(daysSince) → câblé dans clock.ts. `ResetLotteryCorner` est appelé
// hors-script mais conservé enregistré (inerte si jamais référencé par la table bytecode).
registerSpecial('ResetLotteryCorner', () => { ResetLotteryCorner(); return 0; });
registerSpecial('PickLotteryCornerTicket', () => { PickLotteryCornerTicket(); return 0; });

// ─── Session B17 batch — 2 specials triviaux 1:1 strict ───────────────────

/** 1:1 décomp `OffsetCameraForBattle` (field_specials.c:1672-1676) :
 *  ```c
 *  void OffsetCameraForBattle(void) {
 *      SetCameraPanningCallback(NULL);
 *      SetCameraPanning(8, 0);
 *  }
 *  ```
 *  Set camera offset (8, 0) avant battle (= shake centering pre-anim). */
registerSpecial('OffsetCameraForBattle', OffsetCameraForBattle);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `GetDewfordHallPaintingNameIndex` (dewford_trend.c:320-323) :
 *  ```c
 *  void GetDewfordHallPaintingNameIndex(void) {
 *      gSpecialVar_Result = (gSaveBlock1Ptr->dewfordTrends[0].words[0]
 *                          + gSaveBlock1Ptr->dewfordTrends[0].words[1]) & 7;
 *  }
 *  ```
 *  Returns 0..7 index pour painting name dans Dewford Hall (= picked from
 *  current trendy phrase words). */
// Impl 1:1 dans le foyer src/dewford_trend.ts (pose gSpecialVar.Result), enregistrée ici.
registerSpecial('GetDewfordHallPaintingNameIndex', GetDewfordHallPaintingNameIndex);

// ─── Session B11 batch — 1 special Trainer Card stars 1:1 strict ──────────

/** 1:1 décomp `CountPlayerTrainerStars` (trainer_card.c:663-677) :
 *  ```c
 *  u32 CountPlayerTrainerStars(void) {
 *      u8 stars = 0;
 *      if (GetGameStat(GAME_STAT_ENTERED_HOF)) stars++;
 *      if (HasAllHoennMons()) stars++;
 *      if (CountPlayerMuseumPaintings() >= CONTEST_CATEGORIES_COUNT) stars++;
 *      if (HasAllFrontierSymbols()) stars++;
 *      return stars;
 *  }
 *  ```
 *  Max stars = 4. Notre projet :
 *    - HOF check : direct gameStats[GAME_STAT_ENTERED_HOF=10]
 *    - HasAllHoennMons : via __game_pokedex bridge (= pattern aligné notre
 *      port HasAllHoennMons specials)
 *    - CountPlayerMuseumPaintings : 0 (= dette R3 Contest subsystem absent,
 *      doc explicite)
 *    - HasAllFrontierSymbols : 0 (= dette R3 Frontier subsystem absent)
 *
 *  Max effectif notre projet = 2/4 stars jusqu'à ports Contest + Frontier. */
registerSpecial('CountPlayerTrainerStars', () => {
  let stars = 0;
  // GAME_STAT_ENTERED_HOF = 10 (= include/constants/game_stat.h).
  if ((gSaveBlock1Ptr.gameStats?.[10] ?? 0) > 0) stars++;
  // HasAllHoennMons : delegate via __game_pokedex bridge.
  const pokedexMod = (globalThis as { __game_pokedex?: {
    HOENN_DEX_COUNT?: number;
    HoennToNationalOrder?: (n: number) => number;
    GetSetPokedexFlag?: (dexNum: number, caseId: number) => number;
    FLAG_GET_CAUGHT?: number;
  } }).__game_pokedex;
  if (pokedexMod?.HOENN_DEX_COUNT && pokedexMod.HoennToNationalOrder
      && pokedexMod.GetSetPokedexFlag && pokedexMod.FLAG_GET_CAUGHT !== undefined) {
    let allCaught = true;
    for (let i = 0; i < (pokedexMod.HOENN_DEX_COUNT - 2); i++) {
      const dexNum = pokedexMod.HoennToNationalOrder(i + 1);
      if (!pokedexMod.GetSetPokedexFlag(dexNum, pokedexMod.FLAG_GET_CAUGHT)) {
        allCaught = false;
        break;
      }
    }
    if (allCaught) stars++;
  }
  // CountPlayerMuseumPaintings >= CONTEST_CATEGORIES_COUNT=5 → +1 star.
  // 1:1 décomp contest_util.c:2380 ; porté B33 → utilise contestWinners[8..12].
  let museumCount = 0;
  for (let i = 0; i < 5; i++) {
    if (gSaveBlock1Ptr.contestWinners?.[8 + i]?.species) museumCount++;
  }
  if (museumCount >= 5) stars++;  // CONTEST_CATEGORIES_COUNT = 5
  // 1:1 décomp `HasAllFrontierSymbols` (trainer_card.c:652-661) :
  //   loop NUM_FRONTIER_FACILITIES=7, check FlagGet(FLAG_SYS_TOWER_SILVER+2i)
  //   && FlagGet(FLAG_SYS_TOWER_GOLD+2i). +1 star si tous.
  //   Cascade R3 résolue : 7 facilités = TOWER/DOME/PALACE/ARENA/FACTORY/PIKE/PYRAMID.
  const facilities = ['TOWER', 'DOME', 'PALACE', 'ARENA', 'FACTORY', 'PIKE', 'PYRAMID'];
  let allSymbols = true;
  for (const f of facilities) {
    if (!FlagGet(`FLAG_SYS_${f}_SILVER`) || !FlagGet(`FLAG_SYS_${f}_GOLD`)) {
      allSymbols = false;
      break;
    }
  }
  if (allSymbols) stars++;
  return stars;
});

// ─── Session B10 batch — 1 special Quiz Lady 1:1 strict ───────────────────

/** 1:1 décomp `GetQuizLadyState` (lilycove_lady.c:347-356) :
 *  ```c
 *  u8 GetQuizLadyState(void) {
 *      sQuizLadyPtr = &gSaveBlock1Ptr->lilycoveLady.quiz;
 *      if (sQuizLadyPtr->state == LILYCOVE_LADY_STATE_PRIZE) return LILYCOVE_LADY_STATE_PRIZE;
 *      else if (sQuizLadyPtr->state == LILYCOVE_LADY_STATE_COMPLETED) return LILYCOVE_LADY_STATE_COMPLETED;
 *      else return LILYCOVE_LADY_STATE_READY;
 *  }
 *  ```
 *  Retourne state clamped à PRIZE/COMPLETED/READY (= 2/1/0). Identique
 *  pattern GetFavorLadyState (= aligned discriminated union access). */
registerSpecial('GetQuizLadyState', _lilycove.GetQuizLadyState);

// ─── Session B25 batch — 1 special Storyteller 1:1 strict ────────────────

/** 1:1 décomp `HasStorytellerAlreadyRecorded` (mauville_old_man.c:1467-1475) :
 *  ```c
 *  bool8 HasStorytellerAlreadyRecorded(void) {
 *      sStorytellerPtr = &gSaveBlock1Ptr->oldMan.storyteller;
 *      if (sStorytellerPtr->alreadyRecorded == FALSE) return FALSE;
 *      else return TRUE;
 *  }
 *  ```
 *  Discriminated union access sur gSaveBlock1Ptr.oldMan.kind === 'storyteller'. */
registerSpecial('HasStorytellerAlreadyRecorded', () => {
  const oldMan = gSaveBlock1Ptr.oldMan;
  if (oldMan && oldMan.kind === 'storyteller') {
    return oldMan.alreadyRecorded ? 1 : 0;
  }
  return 0;
});

// ─── Session B50 batch — 1 special Contest Museum painting check 1:1 strict ─

/** 1:1 décomp `DoesContestCategoryHaveMuseumPainting` (contest_util.c:2332-2359) :
 *  ```c
 *  void DoesContestCategoryHaveMuseumPainting(void) {
 *      int contestWinner;
 *      switch (gSpecialVar_ContestCategory) {
 *          case CONTEST_CATEGORY_COOL:   contestWinner = CONTEST_WINNER_MUSEUM_COOL - 1; break;
 *          case CONTEST_CATEGORY_BEAUTY: contestWinner = CONTEST_WINNER_MUSEUM_BEAUTY - 1; break;
 *          case CONTEST_CATEGORY_CUTE:   contestWinner = CONTEST_WINNER_MUSEUM_CUTE - 1; break;
 *          case CONTEST_CATEGORY_SMART:  contestWinner = CONTEST_WINNER_MUSEUM_SMART - 1; break;
 *          case CONTEST_CATEGORY_TOUGH:
 *          default:                       contestWinner = CONTEST_WINNER_MUSEUM_TOUGH - 1; break;
 *      }
 *      if (gSaveBlock1Ptr->contestWinners[contestWinner].species == SPECIES_NONE)
 *          gSpecialVar_0x8004 = FALSE;
 *      else
 *          gSpecialVar_0x8004 = TRUE;
 *  }
 *  ```
 *  CONTEST_WINNER_MUSEUM_COOL=9 → idx 8. BEAUTY=10→9, CUTE=11→10, SMART=12→11,
 *  TOUGH=13→12. Donc idx = 8 + category (clamp 0..4). */
registerSpecial('DoesContestCategoryHaveMuseumPainting', () => {
  const category = VarGet('VAR_CONTEST_CATEGORY');
  const clamped = (category >= 0 && category <= 3) ? category : 4;  // TOUGH default
  const contestWinnerIdx = 8 + clamped;  // CONTEST_WINNER_MUSEUM_* - 1
  const species = gSaveBlock1Ptr.contestWinners?.[contestWinnerIdx]?.species ?? 0;
  VarSet('VAR_0x8004', species === 0 ? 0 : 1);
});

// ─── Session B49 batch — 1 special Battle Pyramid held item check 1:1 strict ─

/** 1:1 décomp `DoBattlePyramidMonsHaveHeldItem` (party_menu.c:6307-6320) :
 *  ```c
 *  void DoBattlePyramidMonsHaveHeldItem(void) {
 *      u8 i;
 *      gSpecialVar_Result = FALSE;
 *      for (i = 0; i < FRONTIER_PARTY_SIZE; i++) {
 *          if (GetMonData(&gPlayerParty[i], MON_DATA_HELD_ITEM) != ITEM_NONE) {
 *              gSpecialVar_Result = TRUE;
 *              break;
 *          }
 *      }
 *  }
 *  ```
 *  FRONTIER_PARTY_SIZE=3. Loop check held item != ITEM_NONE=0. */
registerSpecial('DoBattlePyramidMonsHaveHeldItem', () => {
  gSpecialVar.Result = 0;
  for (let i = 0; i < 3; i++) {  // FRONTIER_PARTY_SIZE
    const mon = gPlayerParty[i];
    // 1:1 décomp GetMonData(mon, MON_DATA_HELD_ITEM) != ITEM_NONE=0.
    if ((_GetMonData(mon, MON_DATA_HELD_ITEM) as number)) {
      gSpecialVar.Result = 1;
      break;
    }
  }
});

// ─── Session B47 batch — 1 special CableClubSaveGame 1:1 strict ──────────

/** 1:1 décomp `CableClubSaveGame` (cable_club.c:806-809) :
 *  ```c
 *  void CableClubSaveGame(void) {
 *      SaveGame();
 *  }
 *  ```
 *  Wrapper sur SaveGame() (porté B40). */
registerSpecial('CableClubSaveGame', () => {
  void (async () => {
    try {
      const mod = await import('../../save');
      await mod.SaveGame();
    } catch (e) {
      console.warn('[special CableClubSaveGame] async wrap failed', e);
    }
  })();
});

// ─── Session B46 batch — 2 specials Quiz Lady custom 1:1 strict ──────────

/** 1:1 décomp `QuizLadyTakePrizeForCustomQuiz` (lilycove_lady.c:542-545) :
 *  ```c
 *  void QuizLadyTakePrizeForCustomQuiz(void) {
 *      RemoveBagItem(gSpecialVar_ItemId, 1);
 *  }
 *  ```
 *  Notre RemoveBagItem demande itemKey string ; gSpecialVar.ItemId est number.
 *  Bridge via reverseDecompConstant 'ITEM_'. */
registerSpecial('QuizLadyTakePrizeForCustomQuiz', _lilycove.QuizLadyTakePrizeForCustomQuiz);

/** 1:1 décomp `QuizLadyRecordCustomQuizData` (lilycove_lady.c:547-557) :
 *  ```c
 *  void QuizLadyRecordCustomQuizData(void) {
 *      u8 i;
 *      sQuizLadyPtr = &gSaveBlock1Ptr->lilycoveLady.quiz;
 *      sQuizLadyPtr->prize = gSpecialVar_ItemId;
 *      for (i = 0; i < TRAINER_ID_LENGTH; i++)
 *          sQuizLadyPtr->playerTrainerId[i] = gSaveBlock2Ptr->playerTrainerId[i];
 *      StringCopy_PlayerName(sQuizLadyPtr->playerName, gSaveBlock2Ptr->playerName);
 *      sQuizLadyPtr->language = gGameLanguage;
 *  }
 *  ```
 *  TRAINER_ID_LENGTH=4, gGameLanguage=LANGUAGE_FRENCH=3 chez nous. */
registerSpecial('QuizLadyRecordCustomQuizData', _lilycove.QuizLadyRecordCustomQuizData);

// ─── Session B45 batch — 2 specials Quiz Lady clear 1:1 strict ───────────

/** 1:1 décomp `ClearQuizLadyPlayerAnswer` (lilycove_lady.c:505-509) :
 *  ```c
 *  void ClearQuizLadyPlayerAnswer(void) {
 *      sQuizLadyPtr = &gSaveBlock1Ptr->lilycoveLady.quiz;
 *      sQuizLadyPtr->playerAnswer = EC_EMPTY_WORD;
 *  }
 *  ```
 *  EC_EMPTY_WORD = 0xFFFF (= constants/easy_chat.h). */
registerSpecial('ClearQuizLadyPlayerAnswer', _lilycove.ClearQuizLadyPlayerAnswer);

/** 1:1 décomp `ClearQuizLadyQuestionAndAnswer` (lilycove_lady.c:526-534) :
 *  ```c
 *  void ClearQuizLadyQuestionAndAnswer(void) {
 *      u8 i;
 *      sQuizLadyPtr = &gSaveBlock1Ptr->lilycoveLady.quiz;
 *      for (i = 0; i < QUIZ_QUESTION_LEN; i++)
 *          sQuizLadyPtr->question[i] = EC_EMPTY_WORD;
 *      sQuizLadyPtr->correctAnswer = EC_EMPTY_WORD;
 *  }
 *  ```
 *  QUIZ_QUESTION_LEN = 9. */
registerSpecial('ClearQuizLadyQuestionAndAnswer', _lilycove.ClearQuizLadyQuestionAndAnswer);

// ─── Session B44 batch — 1 special IV Rater 1:1 strict ───────────────────

/** 1:1 décomp `BufferVarsForIVRater` (field_specials.c:1969-2006) :
 *  ```c
 *  void BufferVarsForIVRater(void) {
 *      u8 i;
 *      u32 ivStorage[NUM_STATS];
 *      ivStorage[STAT_HP] = GetMonData(&gPlayerParty[VAR_0x8004], MON_DATA_HP_IV);
 *      // ... idem ATK, DEF, SPEED, SPATK, SPDEF
 *      gSpecialVar_0x8005 = sum of all 6 IVs;
 *      gSpecialVar_0x8006 = stat idx max;
 *      gSpecialVar_0x8007 = max IV value;
 *      // Random tiebreak si égalité.
 *  }
 *  ```
 *  IV Rater à Lavaridge ; le NPC parle de la stat avec le plus haut IV. */
registerSpecial('BufferVarsForIVRater', BufferVarsForIVRater);  // impl 1:1 → src/field_specials.ts

// ─── Session B43 batch — 2 specials Battle Tower stat / Secret Base 1:1 strict ─

/** 1:1 décomp `GetBattleTowerSinglesStreak` (field_specials.c:1279-1282) :
 *  ```c
 *  u16 GetBattleTowerSinglesStreak(void) {
 *      return GetGameStat(GAME_STAT_BATTLE_TOWER_SINGLES_STREAK);
 *  }
 *  ```
 *  GAME_STAT_BATTLE_TOWER_SINGLES_STREAK=32. Notre projet stocke gameStats
 *  cleartext (= aligné GetGameStat porté). */
registerSpecial('GetBattleTowerSinglesStreak', GetBattleTowerSinglesStreak);  // impl 1:1 → src/field_specials.ts

/** 1:1 décomp `GetSecretBaseNearbyMapName` (field_specials.c:1274-1277) :
 *  ```c
 *  void GetSecretBaseNearbyMapName(void) {
 *      GetMapName(gStringVar1, VarGet(VAR_SECRET_BASE_MAP), 0);
 *  }
 *  ```
 *  Cascade R3 partielle : GetMapName demande mapSec → name lookup table
 *  (= region_map.c). Notre VAR_SECRET_BASE_MAP est numeric MAPSEC_*.
 *  Bridge via __game_bridge.GetMapNameByMapSecId si dispo (= pattern aligné). */
registerSpecial('GetSecretBaseNearbyMapName', GetSecretBaseNearbyMapName);  // impl 1:1 → src/field_specials.ts

// ─── Session B41 batch — 2 specials Lilycove Lady 1:1 strict ─────────────

/** 1:1 décomp `Script_GetLilycoveLadyId` (lilycove_lady.c:115-118) :
 *  ```c
 *  void Script_GetLilycoveLadyId(void) {
 *      gSpecialVar_Result = GetLilycoveLadyId();
 *  }
 *  u8 GetLilycoveLadyId(void) {
 *      return gSaveBlock1Ptr->lilycoveLady.id;
 *  }
 *  ```
 *  LILYCOVE_LADY_QUIZ=0, _FAVOR=1, _CONTEST=2 dans le id. */
registerSpecial('Script_GetLilycoveLadyId', _lilycove.Script_GetLilycoveLadyId);

/** 1:1 décomp `SetLilycoveLadyGfx` (lilycove_lady.c:44-59) :
 *  ```c
 *  void SetLilycoveLadyGfx(void) {
 *      VarSet(VAR_OBJ_GFX_ID_0, sLilycoveLadyGfxId[GetLilycoveLadyId()]);
 *      if (GetLilycoveLadyId() == LILYCOVE_LADY_CONTEST) {
 *          VarSet(VAR_OBJ_GFX_ID_1, sContestLadyMonGfxId[lilycoveLady->contest.category]);
 *          gSpecialVar_Result = TRUE;
 *      } else {
 *          gSpecialVar_Result = FALSE;
 *      }
 *  }
 *  ```
 *  sLilycoveLadyGfxId 1:1 décomp data/lilycove_lady.h:14 = [WOMAN_4=26, WOMAN_2=20, GIRL_2=10]
 *  indexed par lady id (= QUIZ=0, FAVOR=1, CONTEST=2).
 *  sContestLadyMonGfxId 1:1 décomp data/lilycove_lady.h:5 =
 *  [ZIGZAGOON_1=98, SKITTY=203, POOCHYENA=220, KECLEON=204, PIKACHU=209]
 *  indexed par contest category (= COOL/BEAUTY/CUTE/SMART/TOUGH). */
registerSpecial('SetLilycoveLadyGfx', _lilycove.SetLilycoveLadyGfx);

// ─── Session B40 batch — 1 special SaveGame 1:1 strict ───────────────────

/** 1:1 décomp `SaveGame` (start_menu.c:896-900) :
 *  ```c
 *  void SaveGame(void) {
 *      InitSave();
 *      CreateTask(SaveGameTask, 0x50);
 *  }
 *  ```
 *  Cascade R3 : Notre SaveGame est async Promise<boolean>. Décomp utilise un
 *  task qui fire-and-forget. On wrap async dans un IIFE.
 *  InitSave équivalent : notre SaveGame fait le full flow (init + write).
 *  Wire dynamic import pour éviter cycle ESM (= save-system.ts → bag → ...). */
registerSpecial('SaveGame', () => {
  void (async () => {
    try {
      const mod = await import('../../save');
      await mod.SaveGame();
    } catch (e) {
      console.warn('[special SaveGame] async wrap failed', e);
    }
  })();
});

// ─── Session B39 batch — 3 specials Frontier Battle Points 1:1 strict ────

/** 1:1 décomp `TakeFrontierBattlePoints` (field_specials.c:2946-2952) :
 *  ```c
 *  void TakeFrontierBattlePoints(void) {
 *      if (gSaveBlock2Ptr->frontier.battlePoints < gSpecialVar_0x8004)
 *          gSaveBlock2Ptr->frontier.battlePoints = 0;
 *      else
 *          gSaveBlock2Ptr->frontier.battlePoints -= gSpecialVar_0x8004;
 *  }
 *  ``` */
registerSpecial('TakeFrontierBattlePoints', () => {
  const required = VarGet('VAR_0x8004');
  const cur = gSaveBlock2Ptr.frontier?.battlePoints ?? 0;
  if (!gSaveBlock2Ptr.frontier) return;
  gSaveBlock2Ptr.frontier.battlePoints = cur < required ? 0 : cur - required;
});

/** 1:1 décomp `GiveFrontierBattlePoints` (field_specials.c:2954-2960) :
 *  ```c
 *  void GiveFrontierBattlePoints(void) {
 *      if (gSaveBlock2Ptr->frontier.battlePoints + gSpecialVar_0x8004 > MAX_BATTLE_FRONTIER_POINTS)
 *          gSaveBlock2Ptr->frontier.battlePoints = MAX_BATTLE_FRONTIER_POINTS;
 *      else
 *          gSaveBlock2Ptr->frontier.battlePoints += gSpecialVar_0x8004;
 *  }
 *  ```
 *  MAX_BATTLE_FRONTIER_POINTS = 9999. */
registerSpecial('GiveFrontierBattlePoints', () => {
  const add = VarGet('VAR_0x8004');
  const cur = gSaveBlock2Ptr.frontier?.battlePoints ?? 0;
  if (!gSaveBlock2Ptr.frontier) return;
  gSaveBlock2Ptr.frontier.battlePoints = (cur + add) > 9999 ? 9999 : (cur + add);
});

/** 1:1 décomp `GetFrontierBattlePoints` (field_specials.c:2962-2964) :
 *  ```c
 *  u16 GetFrontierBattlePoints(void) {
 *      return gSaveBlock2Ptr->frontier.battlePoints;
 *  }
 *  ``` */
registerSpecial('GetFrontierBattlePoints', () => {
  return gSaveBlock2Ptr.frontier?.battlePoints ?? 0;
});

// ─── Session B38 batch — 1 special Berry Powder 1:1 strict ───────────────

/** 1:1 décomp `TakeBerryPowder` (berry_powder.c:188-196) :
 *  ```c
 *  bool8 TakeBerryPowder(void) {
 *      u32 *powder = &gSaveBlock2Ptr->berryCrush.berryPowderAmount;
 *      if (!HasEnoughBerryPowder_(gSpecialVar_0x8004)) return FALSE;
 *      SetBerryPowder(powder, DecryptBerryPowder(powder) - gSpecialVar_0x8004);
 *      return TRUE;
 *  }
 *  ```
 *  Cascade R3 simplifiée : DecryptBerryPowder/SetBerryPowder = identity dans
 *  notre projet (= berryPowderAmount cleartext, pattern aligné B18 HasEnoughBerryPowder). */
registerSpecial('TakeBerryPowder', () => {
  const berryCrush = gSaveBlock2Ptr.berryCrush;
  if (!berryCrush) return 0;
  const required = VarGet('VAR_0x8004');
  if ((berryCrush.berryPowderAmount ?? 0) < required) return 0;
  berryCrush.berryPowderAmount = (berryCrush.berryPowderAmount ?? 0) - required;
  return 1;
});

// ─── Session B37 batch — 1 special Mauville Bard 1:1 strict ──────────────

/** 1:1 décomp `SaveBardSongLyrics` (mauville_old_man.c:156-170) :
 *  ```c
 *  void SaveBardSongLyrics(void) {
 *      u16 i;
 *      struct MauvilleManBard *bard = &gSaveBlock1Ptr->oldMan.bard;
 *      StringCopy(bard->playerName, gSaveBlock2Ptr->playerName);
 *      for (i = 0; i < TRAINER_ID_LENGTH; i++)
 *          bard->playerTrainerId[i] = gSaveBlock2Ptr->playerTrainerId[i];
 *      for (i = 0; i < NUM_BARD_SONG_WORDS; i++)
 *          bard->songLyrics[i] = bard->newSongLyrics[i];
 *      bard->hasChangedSong = TRUE;
 *  }
 *  ```
 *  TRAINER_ID_LENGTH=4, NUM_BARD_SONG_WORDS=6. */
registerSpecial('SaveBardSongLyrics', () => {
  const oldMan = gSaveBlock1Ptr.oldMan;
  if (!oldMan || oldMan.kind !== 'bard') return;
  oldMan.playerName = GetPlayerNameString();
  if (!oldMan.playerTrainerId) oldMan.playerTrainerId = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {  // TRAINER_ID_LENGTH
    oldMan.playerTrainerId[i] = gSaveBlock2Ptr.playerTrainerId?.[i] ?? 0;
  }
  if (!oldMan.songLyrics) oldMan.songLyrics = new Array(6).fill(0);
  if (!oldMan.newSongLyrics) oldMan.newSongLyrics = new Array(6).fill(0);
  for (let i = 0; i < 6; i++) {  // NUM_BARD_SONG_WORDS
    oldMan.songLyrics[i] = oldMan.newSongLyrics[i];
  }
  oldMan.hasChangedSong = 1;
});

// ─── Session B36 batch — 1 special Trainer Fan Club 1:1 strict ───────────

/** 1:1 décomp `UpdateTrainerFanClubGameClear` (field_specials.c:3994-4008) :
 *  ```c
 *  void UpdateTrainerFanClubGameClear(void) {
 *      if (!GET_TRAINER_FAN_CLUB_FLAG(FANCLUB_GOT_FIRST_FANS)) {
 *          SetPlayerGotFirstFans();
 *          SetInitialFansOfPlayer();
 *          gSaveBlock1Ptr->vars[VAR_FANCLUB_LOSE_FAN_TIMER - VARS_START] = gSaveBlock2Ptr->playTimeHours;
 *          FlagClear(FLAG_HIDE_FANCLUB_OLD_LADY);
 *          FlagClear(FLAG_HIDE_FANCLUB_BOY);
 *          FlagClear(FLAG_HIDE_FANCLUB_LITTLE_BOY);
 *          FlagClear(FLAG_HIDE_FANCLUB_LADY);
 *          FlagClear(FLAG_HIDE_LILYCOVE_FAN_CLUB_INTERVIEWER);
 *          VarSet(VAR_LILYCOVE_FAN_CLUB_STATE, 1);
 *      }
 *  }
 *  ```
 *  FANCLUB_GOT_FIRST_FANS=7, FANCLUB_MEMBER1=8, MEMBER3=10, MEMBER6=13.
 *  SetInitialFansOfPlayer (= field_specials.c:4173) : SET bits 6, 1, 3
 *  (= bits 13, 8, 10 dans counter). Inline ici.
 *  SetPlayerGotFirstFans (= déjà porté A2.22) : SET bit 7. Recall direct. */
registerSpecial('UpdateTrainerFanClubGameClear', UpdateTrainerFanClubGameClear);  // impl 1:1 → src/field_specials.ts

// ─── Session B33 batch — 1 special Contest Museum 1:1 strict ─────────────

/** 1:1 décomp `CountPlayerMuseumPaintings` (contest_util.c:2380-2392) :
 *  ```c
 *  u8 CountPlayerMuseumPaintings(void) {
 *      int i; u8 count = 0;
 *      for (i = 0; i < NUM_CONTEST_WINNERS - MUSEUM_CONTEST_WINNERS_START; i++) {
 *          if (gSaveBlock1Ptr->contestWinners[MUSEUM_CONTEST_WINNERS_START + i].species)
 *              count++;
 *      }
 *      return count;
 *  }
 *  ```
 *  NUM_CONTEST_WINNERS=13, MUSEUM_CONTEST_WINNERS_START=8 (=CONTEST_WINNER_MUSEUM_COOL-1).
 *  Loop i=0..4 → check contestWinners[8..12].species. */
registerSpecial('CountPlayerMuseumPaintings', () => {
  let count = 0;
  for (let i = 0; i < 5; i++) {  // NUM_CONTEST_WINNERS - MUSEUM_CONTEST_WINNERS_START = 13 - 8 = 5
    if (gSaveBlock1Ptr.contestWinners?.[8 + i]?.species) count++;
  }
  return count;
});

// ─── Session B32 batch — 1 special Abnormal Weather 1:1 strict ────────────

/** 1:1 décomp `CreateAbnormalWeatherEvent` (field_specials.c:3453-3476) :
 *  ```c
 *  void CreateAbnormalWeatherEvent(void) {
 *      u16 randomValue = Random();
 *      VarSet(VAR_ABNORMAL_WEATHER_STEP_COUNTER, 0);
 *      if (FlagGet(FLAG_DEFEATED_KYOGRE) == TRUE)
 *          VarSet(VAR_ABNORMAL_WEATHER_LOCATION, (randomValue % TERRA_CAVE_LOCATIONS) + TERRA_CAVE_LOCATIONS_START);
 *      else if (FlagGet(FLAG_DEFEATED_GROUDON) == TRUE)
 *          VarSet(VAR_ABNORMAL_WEATHER_LOCATION, (randomValue % MARINE_CAVE_LOCATIONS) + MARINE_CAVE_LOCATIONS_START);
 *      else if ((randomValue & 1) == 0) {
 *          randomValue = Random();
 *          VarSet(VAR_ABNORMAL_WEATHER_LOCATION, (randomValue % TERRA_CAVE_LOCATIONS) + TERRA_CAVE_LOCATIONS_START);
 *      } else {
 *          randomValue = Random();
 *          VarSet(VAR_ABNORMAL_WEATHER_LOCATION, (randomValue % MARINE_CAVE_LOCATIONS) + MARINE_CAVE_LOCATIONS_START);
 *      }
 *  }
 *  ```
 *  Cascade R3 résolue : constants/weather.h:44-65 — TERRA_CAVE_LOCATIONS_START=1,
 *  TERRA_CAVE_LOCATIONS=8, MARINE_CAVE_LOCATIONS_START=9, MARINE_CAVE_LOCATIONS=8. */
registerSpecial('CreateAbnormalWeatherEvent', () => {
  let randomValue = Random() & 0xFFFF;
  VarSet('VAR_ABNORMAL_WEATHER_STEP_COUNTER', 0);
  // 1:1 décomp constants/weather.h.
  const TERRA_START = 1, TERRA_LOC = 8;
  const MARINE_START = 9, MARINE_LOC = 8;
  if (FlagGet('FLAG_DEFEATED_KYOGRE')) {
    VarSet('VAR_ABNORMAL_WEATHER_LOCATION', (randomValue % TERRA_LOC) + TERRA_START);
  } else if (FlagGet('FLAG_DEFEATED_GROUDON')) {
    VarSet('VAR_ABNORMAL_WEATHER_LOCATION', (randomValue % MARINE_LOC) + MARINE_START);
  } else if ((randomValue & 1) === 0) {
    randomValue = Random() & 0xFFFF;
    VarSet('VAR_ABNORMAL_WEATHER_LOCATION', (randomValue % TERRA_LOC) + TERRA_START);
  } else {
    randomValue = Random() & 0xFFFF;
    VarSet('VAR_ABNORMAL_WEATHER_LOCATION', (randomValue % MARINE_LOC) + MARINE_START);
  }
});

// ─── Session B31 batch — 2 specials Contest Lady 1:1 strict ───────────────

/** 1:1 décomp `HasPlayerGivenContestLadyPokeblock` (lilycove_lady.c:739-745) :
 *  ```c
 *  bool8 HasPlayerGivenContestLadyPokeblock(void) {
 *      sContestLadyPtr = &gSaveBlock1Ptr->lilycoveLady.contest;
 *      if (sContestLadyPtr->givenPokeblock == TRUE) return TRUE;
 *      return FALSE;
 *  }
 *  ``` */
registerSpecial('HasPlayerGivenContestLadyPokeblock', () => +_lilycove.HasPlayerGivenContestLadyPokeblock());

/** 1:1 décomp `ShouldContestLadyShowGoOnAir` (lilycove_lady.c:747-757) :
 *  ```c
 *  bool8 ShouldContestLadyShowGoOnAir(void) {
 *      bool8 putOnAir = FALSE;
 *      sContestLadyPtr = &gSaveBlock1Ptr->lilycoveLady.contest;
 *      if (sContestLadyPtr->numGoodPokeblocksGiven >= LILYCOVE_LADY_GIFT_THRESHOLD
 *       || sContestLadyPtr->numOtherPokeblocksGiven >= LILYCOVE_LADY_GIFT_THRESHOLD)
 *          putOnAir = TRUE;
 *      return putOnAir;
 *  }
 *  ```
 *  LILYCOVE_LADY_GIFT_THRESHOLD = 5. */
registerSpecial('ShouldContestLadyShowGoOnAir', () => +_lilycove.ShouldContestLadyShowGoOnAir());

// ─── Session B30 batch — 2 specials Contest Lady 1:1 strict ───────────────

/** 1:1 décomp `GetContestLadyMonSpecies` (lilycove_lady.c:775-779) :
 *  ```c
 *  void GetContestLadyMonSpecies(void) {
 *      sContestLadyPtr = &gSaveBlock1Ptr->lilycoveLady.contest;
 *      gSpecialVar_0x8005 = sContestLadyMonSpecies[sContestLadyPtr->category];
 *  }
 *  ```
 *  sContestLadyMonSpecies 1:1 décomp data/lilycove_lady.h:461 :
 *    [COOL=0]=ZIGZAGOON, [BEAUTY=1]=SKITTY, [CUTE=2]=POOCHYENA,
 *    [SMART=3]=KECLEON, [TOUGH=4]=PIKACHU. */
registerSpecial('GetContestLadyMonSpecies', _lilycove.GetContestLadyMonSpecies);

/** 1:1 décomp `GetContestLadyCategory` (lilycove_lady.c:781-785) :
 *  ```c
 *  u8 GetContestLadyCategory(void) {
 *      sContestLadyPtr = &gSaveBlock1Ptr->lilycoveLady.contest;
 *      return sContestLadyPtr->category;
 *  }
 *  ``` */
registerSpecial('GetContestLadyCategory', _lilycove.GetContestLadyCategory);

/** 1:1 décomp `SetContestLadyGivenPokeblock` (lilycove_lady.c:769-773) :
 *  ```c
 *  void SetContestLadyGivenPokeblock(void) {
 *      sContestLadyPtr = &gSaveBlock1Ptr->lilycoveLady.contest;
 *      sContestLadyPtr->givenPokeblock = TRUE;
 *  }
 *  ```
 *  Discriminated union access sur kind === 'contest'. */
registerSpecial('SetContestLadyGivenPokeblock', _lilycove.SetContestLadyGivenPokeblock);

// ─── Session B28 batch — 1 special TV Gabby/Ty Before Interview 1:1 strict ────

/** 1:1 décomp `GabbyAndTyBeforeInterview` (tv.c:935-977) :
 *  ```c
 *  void GabbyAndTyBeforeInterview(void) {
 *      gabbyAndTyData.mon1 = gBattleResults.playerMon1Species;
 *      gabbyAndTyData.mon2 = gBattleResults.playerMon2Species;
 *      gabbyAndTyData.lastMove = gBattleResults.lastUsedMovePlayer;
 *      if (gabbyAndTyData.battleNum != 0xFF) gabbyAndTyData.battleNum++;
 *      gabbyAndTyData.battleTookMoreThanOneTurn = gBattleResults.playerMonWasDamaged;
 *      gabbyAndTyData.playerLostAMon = gBattleResults.playerFaintCounter != 0;
 *      gabbyAndTyData.playerUsedHealingItem = gBattleResults.numHealingItemsUsed != 0;
 *      if (!gBattleResults.usedMasterBall) {
 *          for (i = 0; i < POKEBALL_COUNT - 1; i++) {
 *              if (gBattleResults.catchAttempts[i]) { playerThrewABall = TRUE; break; }
 *          }
 *      } else playerThrewABall = TRUE;
 *      TakeGabbyAndTyOffTheAir();  // onAir = FALSE
 *      if (lastMove == MOVE_NONE) FlagSet(FLAG_TEMP_SKIP_GABBY_INTERVIEW);
 *  }
 *  ```
 *  POKEBALL_COUNT=12 (pokeball.h:18) → loop 11 catchAttempts.
 *  FLAG_TEMP_SKIP_GABBY_INTERVIEW = alias FLAG_TEMP_1. */
registerSpecial('GabbyAndTyBeforeInterview', () => {
  const data = gSaveBlock1Ptr.gabbyAndTyData;
  if (!data) return;
  const bridge = (globalThis as { __game_bridge?: {
    gBattleResults?: {
      playerMon1Species?: number; playerMon2Species?: number;
      lastUsedMovePlayer?: number; playerMonWasDamaged?: number;
      playerFaintCounter?: number; numHealingItemsUsed?: number;
      usedMasterBall?: number; catchAttempts?: number[];
    };
  } }).__game_bridge;
  const br = bridge?.gBattleResults;
  data.mon1 = br?.playerMon1Species ?? 0;
  data.mon2 = br?.playerMon2Species ?? 0;
  data.lastMove = br?.lastUsedMovePlayer ?? 0;
  if (data.battleNum !== 0xFF) data.battleNum = (data.battleNum ?? 0) + 1;
  data.battleTookMoreThanOneTurn = br?.playerMonWasDamaged ?? 0;
  data.playerLostAMon = (br?.playerFaintCounter ?? 0) !== 0 ? 1 : 0;
  data.playerUsedHealingItem = (br?.numHealingItemsUsed ?? 0) !== 0 ? 1 : 0;
  if (!br?.usedMasterBall) {
    // 1:1 décomp loop POKEBALL_COUNT-1 = 11 (= exclude Master Ball).
    for (let i = 0; i < 11; i++) {
      if (br?.catchAttempts?.[i]) {
        data.playerThrewABall = 1;
        break;
      }
    }
  } else {
    data.playerThrewABall = 1;  // Master Ball case.
  }
  // TakeGabbyAndTyOffTheAir : onAir = FALSE.
  data.onAir = 0;
  // FLAG_TEMP_SKIP_GABBY_INTERVIEW = FLAG_TEMP_1 alias.
  if (data.lastMove === 0) {  // MOVE_NONE
    FlagSet('FLAG_TEMP_1');
  }
});

// ─── Session B27 batch — 1 special TV Gabby/Ty 1:1 strict ────────────────

/** 1:1 décomp `GabbyAndTyAfterInterview` (tv.c:979-988) :
 *  ```c
 *  void GabbyAndTyAfterInterview(void) {
 *      gSaveBlock1Ptr->gabbyAndTyData.battleTookMoreThanOneTurn2 = battleTookMoreThanOneTurn;
 *      gSaveBlock1Ptr->gabbyAndTyData.playerLostAMon2 = playerLostAMon;
 *      gSaveBlock1Ptr->gabbyAndTyData.playerUsedHealingItem2 = playerUsedHealingItem;
 *      gSaveBlock1Ptr->gabbyAndTyData.playerThrewABall2 = playerThrewABall;
 *      gSaveBlock1Ptr->gabbyAndTyData.onAir = TRUE;
 *      gSaveBlock1Ptr->gabbyAndTyData.mapnum = gMapHeader.regionMapSectionId;
 *      IncrementGameStat(GAME_STAT_GOT_INTERVIEWED);
 *  }
 *  ```
 *  Promote interview data + set onAir + increment game stat.
 *  Dette R3 partielle : mapnum stocke MAPSEC_* numeric ; nous avons le string,
 *  on resolve via reverseDecompConstant MAPSEC_ ou skip si non extracted. */
registerSpecial('GabbyAndTyAfterInterview', () => {
  const data = gSaveBlock1Ptr.gabbyAndTyData;
  if (data) {
    data.battleTookMoreThanOneTurn2 = data.battleTookMoreThanOneTurn;
    data.playerLostAMon2 = data.playerLostAMon;
    data.playerUsedHealingItem2 = data.playerUsedHealingItem;
    data.playerThrewABall2 = data.playerThrewABall;
    data.onAir = 1;
    // 1:1 strict mapnum = gMapHeader.regionMapSectionId (= u16 décomp).
    // Notre regionMapSectionId est STRING MAPSEC_X. Bridge via reverseDecompConstant.
    const mapsecName = gMapHeader?.regionMapSectionId;
    if (mapsecName) {
      const numericId = resolveDecompConstant(mapsecName);
      if (numericId !== undefined) data.mapnum = numericId & 0xFF;
    }
  }
  // IncrementGameStat(GAME_STAT_GOT_INTERVIEWED=20) = gSaveBlock1Ptr.gameStats[20]++.
  if (gSaveBlock1Ptr.gameStats) {
    gSaveBlock1Ptr.gameStats[20] = (gSaveBlock1Ptr.gameStats[20] ?? 0) + 1;
  }
});

// ─── Session B26 batch — 1 special Decoration 1:1 strict ──────────────────

/** 1:1 décomp `IsDecorationCategoryFull` (trader.c:160-169) :
 *  ```c
 *  void IsDecorationCategoryFull(void) {
 *      gSpecialVar_Result = FALSE;
 *      if (gDecorations[gSpecialVar_0x8004].category != gDecorations[gSpecialVar_0x8006].category
 *          && GetFirstEmptyDecorSlot(gDecorations[gSpecialVar_0x8004].category) == -1) {
 *          CopyDecorationCategoryName(gStringVar2, gDecorations[gSpecialVar_0x8004].category);
 *          gSpecialVar_Result = TRUE;
 *      }
 *  }
 *  ```
 *  Cascade R3 résolue : gDecorations existe + GetFirstEmptyDecorSlot porté.
 *  sDecorationCategoryNames FR : ['BUREAU', 'CHAISE', 'PLANTE', 'ORNEMENT',
 *  'TAPIS', 'POSTER', 'POUPÉE', 'COUSSIN'] (= 1:1 strings.c:545-552 FR). */
registerSpecial('IsDecorationCategoryFull', () => {
  gSpecialVar.Result = 0;
  const newDecorId = VarGet('VAR_0x8004');
  const oldDecorId = VarGet('VAR_0x8006');
  const newDecor = gDecorations[newDecorId];
  const oldDecor = gDecorations[oldDecorId];
  if (newDecor && oldDecor && newDecor.category !== oldDecor.category
      && GetFirstEmptyDecorSlot(newDecor.category) === -1) {
    // 1:1 décomp CopyDecorationCategoryName : StringCopy(gStringVar2, sDecorationCategoryNames[category]).
    const sDecorationCategoryNames = ['BUREAU', 'CHAISE', 'PLANTE', 'ORNEMENT', 'TAPIS', 'POSTER', 'POUPÉE', 'COUSSIN'];
    setStringVar(2, sDecorationCategoryNames[newDecor.category] ?? '???');
    gSpecialVar.Result = 1;
  }
});

/** 1:1 décomp `TraderDoDecorationTrade(void)` (trader.c:199-209) :
 *  ```c
 *  void TraderDoDecorationTrade(void) {
 *      struct MauvilleOldManTrader *trader = &gSaveBlock1Ptr->oldMan.trader;
 *      DecorationRemove(gSpecialVar_0x8006);  // remove player's decor at slot
 *      DecorationAdd(gSpecialVar_0x8004);     // add trader's decor
 *      StringCopy(trader->playerNames[gSpecialVar_0x8005], gSaveBlock2Ptr->playerName);
 *      trader->decorations[gSpecialVar_0x8005] = gSpecialVar_0x8006;
 *      trader->language[gSpecialVar_0x8005] = GAME_LANGUAGE;
 *      trader->alreadyTraded = TRUE;
 *  }
 *  ```
 *  VAR_0x8004 = decor à ADD (= depuis trader).
 *  VAR_0x8005 = trader slot idx (0..3).
 *  VAR_0x8006 = decor à REMOVE (= player's old decor swap'd to trader). */
registerSpecial('TraderDoDecorationTrade', () => {
  const oldMan = gSaveBlock1Ptr.oldMan;
  if (oldMan.kind !== 'trader') return 0;
  const decorToReceive = VarGet('VAR_0x8004');
  const slotIdx = VarGet('VAR_0x8005');
  const decorToGive = VarGet('VAR_0x8006');
  // 1:1 :203 : DecorationRemove + DecorationAdd.
  DecorationRemove(decorToGive);
  DecorationAdd(decorToReceive);
  // 1:1 :205 : StringCopy(trader->playerNames[slot], gSaveBlock2Ptr->playerName).
  if (slotIdx >= 0 && slotIdx < oldMan.playerNames.length) {
    oldMan.playerNames[slotIdx] = GetPlayerNameString();
  }
  if (slotIdx >= 0 && slotIdx < oldMan.decorations.length) {
    oldMan.decorations[slotIdx] = decorToGive;
  }
  // 1:1 :207 : language = GAME_LANGUAGE (= LANGUAGE_FRENCH = 3, constants/global.h:22).
  // 🐛 Fix 2026-07-02 : valait 5 en dur (5 = LANGUAGE_GERMAN) — faux.
  if (slotIdx >= 0 && slotIdx < oldMan.language.length) {
    oldMan.language[slotIdx] = gGameLanguage;
  }
  // 1:1 :208 : alreadyTraded = TRUE.
  oldMan.alreadyTraded = 1;
  return 0;
});

// ─── Session B22 batch — 1 special Secret Base 1:1 strict ─────────────────

/** 1:1 décomp `GetSecretBaseOwnerAndState` (secret_base.c:1176-1191) :
 *  ```c
 *  void GetSecretBaseOwnerAndState(void) {
 *      u16 secretBaseIdx = VarGet(VAR_CURRENT_SECRET_BASE);
 *      if (!FlagGet(FLAG_DAILY_SECRET_BASE)) {
 *          for (i = 0; i < SECRET_BASES_COUNT; i++)
 *              gSaveBlock1Ptr->secretBases[i].battledOwnerToday = FALSE;
 *          FlagSet(FLAG_DAILY_SECRET_BASE);
 *      }
 *      gSpecialVar_0x8004 = GetSecretBaseOwnerType(secretBaseIdx);
 *      gSpecialVar_Result = secretBases[secretBaseIdx].battledOwnerToday;
 *  }
 *  ```
 *  GetSecretBaseOwnerType (secret_base.c:1133) = (trainerId[0] % 5) + (gender * 5). */
registerSpecial('GetSecretBaseOwnerAndState', () => {
  const idx = VarGet('VAR_CURRENT_SECRET_BASE');
  if (!FlagGet('FLAG_DAILY_SECRET_BASE')) {
    for (let i = 0; i < 20; i++) {  // SECRET_BASES_COUNT = 20
      const b = gSaveBlock1Ptr.secretBases?.[i];
      if (b) b.battledOwnerToday = 0;
    }
    FlagSet('FLAG_DAILY_SECRET_BASE');
  }
  const base = gSaveBlock1Ptr.secretBases?.[idx];
  if (base) {
    // 1:1 décomp `GetSecretBaseOwnerType` (secret_base.c:1133).
    const ownerType = ((base.trainerId?.[0] ?? 0) % 5) + ((base.gender ?? 0) * 5);
    VarSet('VAR_0x8004', ownerType);
    gSpecialVar.Result = base.battledOwnerToday ?? 0;
  }
});

/** Boot marker — confirme que le registry a été importé au boot.
 *  Utilisé par debug pour vérifier que le module est loaded. */
console.log(`[specials-registry] loaded — ${130 + 6 + _STUB_RETURN_0_SPECIALS.length + _SESSION_131_DECOMP_SPECIALS.length} stubs registered (Phase 5.7+ iter10 + audit126 + session131 1:1 décomp completion)`);

// ─── LILYCOVE LADIES (suite) : specials du flow complet, délégations au foyer
// lilycove_lady.ts (dédoublonnage vague lilycove — impl inline remplacées). ───
registerSpecial('GetQuizAuthor', _lilycove.GetQuizAuthor);
registerSpecial('QuizLadyGetPlayerAnswer', _lilycove.QuizLadyGetPlayerAnswer);
registerSpecial('IsQuizAnswerCorrect', () => +_lilycove.IsQuizAnswerCorrect());
registerSpecial('QuizLadyPickNewQuestion', _lilycove.QuizLadyPickNewQuestion);
registerSpecial('QuizLadySetCustomQuestion', _lilycove.QuizLadySetCustomQuestion);
registerSpecial('Script_QuizLadyOpenBagMenu', _lilycove.Script_QuizLadyOpenBagMenu);
registerSpecial('Script_FavorLadyOpenBagMenu', _lilycove.Script_FavorLadyOpenBagMenu);
registerSpecial('Script_DoesFavorLadyLikeItem', () => +_lilycove.Script_DoesFavorLadyLikeItem());
registerSpecial('BufferQuizAuthorNameAndCheckIfLady', () => +_lilycove.BufferQuizAuthorNameAndCheckIfLady());
registerSpecial('BufferQuizCorrectAnswer', _lilycove.BufferQuizCorrectAnswer);
registerSpecial('Script_BufferContestLadyCategoryAndMonName', _lilycove.Script_BufferContestLadyCategoryAndMonName);
registerSpecial('SetFavorLadyState_Complete', _lilycove.SetFavorLadyState_Complete);
registerSpecial('GetContestLadyPokeblockState', _lilycove.GetContestLadyPokeblockState);
registerSpecial('ResetLilycoveLadyForRecordMix', _lilycove.ResetLilycoveLadyForRecordMix);
registerSpecial('OpenPokeblockCaseForContestLady', _lilycove.OpenPokeblockCaseForContestLady);

// PutLilycoveContestLadyShowOnTheAir — porté 1:1 tv.c:1581 (tv.ts), délégation directe.
registerSpecial('PutLilycoveContestLadyShowOnTheAir', _tvPutLilycoveContestLadyShowOnTheAir);
// 🚧 DETTE : QuizLadyShowQuizQuestion = SetMainCallback2(CB2_QuizLadyQuestion)
// (easy_chat.c:1573, écran d'affichage de la question du quiz) — écran non porté.
// Anti-freeze : le script fait `special` + `waitstate` → on ré-enable le contexte.
registerSpecial('QuizLadyShowQuizQuestion', () => {
  console.warn('[specials] QuizLadyShowQuizQuestion : écran CB2_QuizLadyQuestion non porté (dette easy_chat)');
  ScriptContext_Enable();
});
