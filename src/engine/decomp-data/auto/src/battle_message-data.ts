// AUTO-GENERATED from src/battle_message.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_message.c
// Generated: 2026-04-26

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const gStatNamesTable = ['sText_HP2', 'sText_Attack2', 'sText_Defense2', 'sText_Speed', 'sText_SpAtk2', 'sText_SpDef2', 'sText_Accuracy', 'sText_Evasiveness'] as const;
export const gPokeblockWasTooXStringTable = ['sText_PokeblockWasTooSpicy', 'sText_PokeblockWasTooDry', 'sText_PokeblockWasTooSweet', 'sText_PokeblockWasTooBitter', 'sText_PokeblockWasTooSour'] as const;
export const gBattleStringsTable = ['sText_Trainer1LoseText', 'sText_PkmnGainedEXP', 'sText_PkmnGrewToLv', 'sText_PkmnLearnedMove', 'sText_TryToLearnMove1', 'sText_TryToLearnMove2', 'sText_TryToLearnMove3', 'sText_PkmnForgotMove', 'sText_StopLearningMove', 'sText_DidNotLearnMove', 'sText_PkmnLearnedMove2', 'sText_AttackMissed', 'sText_PkmnProtectedItself', 'sText_StatsWontIncrease2', 'sText_AvoidedDamage', 'sText_ItDoesntAffect', 'sText_AttackerFainted', 'sText_TargetFainted', 'sText_PlayerGotMoney', 'sText_PlayerWhiteout', 'sText_PlayerWhiteout2', 'sText_PreventsEscape', 'sText_HitXTimes', 'sText_PkmnFellAsleep', 'sText_PkmnMadeSleep', 'sText_PkmnAlreadyAsleep', 'sText_PkmnAlreadyAsleep2', 'sText_PkmnWasntAffected', 'sText_PkmnWasPoisoned', 'sText_PkmnPoisonedBy', 'sText_PkmnHurtByPoison', 'sText_PkmnAlreadyPoisoned', 'sText_PkmnBadlyPoisoned', 'sText_PkmnEnergyDrained', 'sText_PkmnWasBurned', 'sText_PkmnBurnedBy', 'sText_PkmnHurtByBurn', 'sText_PkmnWasFrozen', 'sText_PkmnFrozenBy', 'sText_PkmnIsFrozen', 'sText_PkmnWasDefrosted', 'sText_PkmnWasDefrosted2', 'sText_PkmnWasDefrostedBy', 'sText_PkmnWasParalyzed', 'sText_PkmnWasParalyzedBy', 'sText_PkmnIsParalyzed', 'sText_PkmnIsAlreadyParalyzed', 'sText_PkmnHealedParalysis', 'sText_PkmnDreamEaten', 'sText_StatsWontIncrease', 'sText_StatsWontDecrease', 'sText_TeamStoppedWorking', 'sText_FoeStoppedWorking', 'sText_PkmnIsConfused', 'sText_PkmnHealedConfusion', 'sText_PkmnWasConfused', 'sText_PkmnAlreadyConfused', 'sText_PkmnFellInLove', 'sText_PkmnInLove', 'sText_PkmnImmobilizedByLove', 'sText_PkmnBlownAway', 'sText_PkmnChangedType', 'sText_PkmnFlinched', 'sText_PkmnRegainedHealth', 'sText_PkmnHPFull', 'sText_PkmnRaisedSpDef', 'sText_PkmnRaisedDef', 'sText_PkmnCoveredByVeil', 'sText_PkmnUsedSafeguard', 'sText_PkmnSafeguardExpired', 'sText_PkmnWentToSleep', 'sText_PkmnSleptHealthy', 'sText_PkmnWhippedWhirlwind', 'sText_PkmnTookSunlight', 'sText_PkmnLoweredHead', 'sText_PkmnIsGlowing', 'sText_PkmnFlewHigh', 'sText_PkmnDugHole', 'sText_PkmnSqueezedByBind', 'sText_PkmnTrappedInVortex', 'sText_PkmnWrappedBy', 'sText_PkmnClamped', 'sText_PkmnHurtBy', 'sText_PkmnFreedFrom', 'sText_PkmnCrashed', 'gText_PkmnShroudedInMist', 'sText_PkmnProtectedByMist', 'gText_PkmnGettingPumped', 'sText_PkmnHitWithRecoil', 'sText_PkmnProtectedItself2', 'sText_PkmnBuffetedBySandstorm', 'sText_PkmnPeltedByHail', 'sText_PkmnSeeded', 'sText_PkmnEvadedAttack', 'sText_PkmnSappedByLeechSeed', 'sText_PkmnFastAsleep', 'sText_PkmnWokeUp', 'sText_PkmnUproarKeptAwake', 'sText_PkmnWokeUpInUproar', 'sText_PkmnCausedUproar', 'sText_PkmnMakingUproar', 'sText_PkmnCalmedDown', 'sText_PkmnCantSleepInUproar', 'sText_PkmnStockpiled', 'sText_PkmnCantStockpile', 'sText_PkmnCantSleepInUproar2', 'sText_UproarKeptPkmnAwake', 'sText_PkmnStayedAwakeUsing', 'sText_PkmnStoringEnergy', 'sText_PkmnUnleashedEnergy', 'sText_PkmnFatigueConfusion', 'sText_PlayerPickedUpMoney', 'sText_PkmnUnaffected', 'sText_PkmnTransformedInto', 'sText_PkmnMadeSubstitute', 'sText_PkmnHasSubstitute', 'sText_SubstituteDamaged', 'sText_PkmnSubstituteFaded', 'sText_PkmnMustRecharge', 'sText_PkmnRageBuilding', 'sText_PkmnMoveWasDisabled', 'sText_PkmnMoveIsDisabled', 'sText_PkmnMoveDisabledNoMore', 'sText_PkmnGotEncore', 'sText_PkmnEncoreEnded', 'sText_PkmnTookAim', 'sText_PkmnSketchedMove', 'sText_PkmnTryingToTakeFoe', 'sText_PkmnTookFoe', 'sText_PkmnReducedPP', 'sText_PkmnStoleItem', 'sText_TargetCantEscapeNow', 'sText_PkmnFellIntoNightmare', 'sText_PkmnLockedInNightmare', 'sText_PkmnLaidCurse', 'sText_PkmnAfflictedByCurse', 'sText_SpikesScattered', 'sText_PkmnHurtBySpikes', 'sText_PkmnIdentified', 'sText_PkmnPerishCountFell', 'sText_PkmnBracedItself', 'sText_PkmnEnduredHit', 'sText_MagnitudeStrength', 'sText_PkmnCutHPMaxedAttack', 'sText_PkmnCopiedStatChanges', 'sText_PkmnGotFree', 'sText_PkmnShedLeechSeed', 'sText_PkmnBlewAwaySpikes', 'sText_PkmnFledFromBattle', 'sText_PkmnForesawAttack', 'sText_PkmnTookAttack', 'sText_PkmnAttack', 'sText_PkmnCenterAttention', 'sText_PkmnChargingPower', 'sText_NaturePowerTurnedInto', 'sText_PkmnStatusNormal', 'sText_PkmnHasNoMovesLeft', 'sText_PkmnSubjectedToTorment', 'sText_PkmnCantUseMoveTorment', 'sText_PkmnTighteningFocus', 'sText_PkmnFellForTaunt', 'sText_PkmnCantUseMoveTaunt', 'sText_PkmnReadyToHelp', 'sText_PkmnSwitchedItems', 'sText_PkmnCopiedFoe', 'sText_PkmnMadeWish', 'sText_PkmnWishCameTrue', 'sText_PkmnPlantedRoots', 'sText_PkmnAbsorbedNutrients', 'sText_PkmnAnchoredItself', 'sText_PkmnWasMadeDrowsy', 'sText_PkmnKnockedOff', 'sText_PkmnSwappedAbilities', 'sText_PkmnSealedOpponentMove', 'sText_PkmnCantUseMoveSealed', 'sText_PkmnWantsGrudge', 'sText_PkmnLostPPGrudge', 'sText_PkmnShroudedItself', 'sText_PkmnMoveBounced', 'sText_PkmnWaitsForTarget', 'sText_PkmnSnatchedMove', 'sText_PkmnMadeItRain', 'sText_PkmnRaisedSpeed', 'sText_PkmnProtectedBy', 'sText_PkmnPreventsUsage', 'sText_PkmnRestoredHPUsing', 'sText_PkmnChangedTypeWith', 'sText_PkmnPreventsParalysisWith', 'sText_PkmnPreventsRomanceWith', 'sText_PkmnPreventsPoisoningWith', 'sText_PkmnPreventsConfusionWith', 'sText_PkmnRaisedFirePowerWith', 'sText_PkmnAnchorsItselfWith', 'sText_PkmnCutsAttackWith', 'sText_PkmnPreventsStatLossWith', 'sText_PkmnHurtsWith', 'sText_PkmnTraced', 'sText_StatSharply', 'gText_StatRose', 'sText_StatHarshly', 'sText_StatFell', 'sText_AttackersStatRose', 'gText_DefendersStatRose', 'sText_AttackersStatFell', 'sText_DefendersStatFell', 'sText_CriticalHit', 'sText_OneHitKO', 'sText_123Poof', 'sText_AndEllipsis', 'sText_NotVeryEffective', 'sText_SuperEffective', 'sText_GotAwaySafely', 'sText_WildPkmnFled', 'sText_NoRunningFromTrainers', 'sText_CantEscape', 'sText_DontLeaveBirch', 'sText_ButNothingHappened', 'sText_ButItFailed', 'sText_ItHurtConfusion', 'sText_MirrorMoveFailed', 'sText_StartedToRain', 'sText_DownpourStarted', 'sText_RainContinues', 'sText_DownpourContinues', 'sText_RainStopped', 'sText_SandstormBrewed', 'sText_SandstormRages', 'sText_SandstormSubsided', 'sText_SunlightGotBright', 'sText_SunlightStrong', 'sText_SunlightFaded', 'sText_StartedHail', 'sText_HailContinues', 'sText_HailStopped', 'sText_FailedToSpitUp', 'sText_FailedToSwallow', 'sText_WindBecameHeatWave', 'sText_StatChangesGone', 'sText_CoinsScattered', 'sText_TooWeakForSubstitute', 'sText_SharedPain', 'sText_BellChimed', 'sText_FaintInThree', 'sText_NoPPLeft', 'sText_ButNoPPLeft', 'sText_PlayerUsedItem', 'sText_WallyUsedItem', 'sText_TrainerBlockedBall', 'sText_DontBeAThief', 'sText_ItDodgedBall', 'sText_YouMissedPkmn', 'sText_PkmnBrokeFree', 'sText_ItAppearedCaught', 'sText_AarghAlmostHadIt', 'sText_ShootSoClose', 'sText_GotchaPkmnCaughtPlayer', 'sText_GotchaPkmnCaughtWally', 'sText_GiveNicknameCaptured', 'sText_PkmnSentToPC', 'sText_PkmnDataAddedToDex', 'sText_ItIsRaining', 'sText_SandstormIsRaging', 'sText_CantEscape2', 'sText_PkmnIgnoresAsleep', 'sText_PkmnIgnoredOrders', 'sText_PkmnBeganToNap', 'sText_PkmnLoafing', 'sText_PkmnWontObey', 'sText_PkmnTurnedAway', 'sText_PkmnPretendNotNotice', 'sText_EnemyAboutToSwitchPkmn', 'sText_CreptCloser', 'sText_CantGetCloser', 'sText_PkmnWatchingCarefully', 'sText_PkmnCuriousAboutX', 'sText_PkmnEnthralledByX', 'sText_PkmnIgnoredX', 'sText_ThrewPokeblockAtPkmn', 'sText_OutOfSafariBalls', 'sText_PkmnsItemCuredParalysis', 'sText_PkmnsItemCuredPoison', 'sText_PkmnsItemHealedBurn', 'sText_PkmnsItemDefrostedIt', 'sText_PkmnsItemWokeIt', 'sText_PkmnsItemSnappedOut', 'sText_PkmnsItemCuredProblem', 'sText_PkmnsItemRestoredHealth', 'sText_PkmnsItemRestoredPP', 'sText_PkmnsItemRestoredStatus', 'sText_PkmnsItemRestoredHPALittle', 'sText_ItemAllowsOnlyYMove', 'sText_PkmnHungOnWithX', 'gText_EmptyString3', 'sText_PkmnsXPreventsBurns', 'sText_PkmnsXBlocksY', 'sText_PkmnsXRestoredHPALittle2', 'sText_PkmnsXWhippedUpSandstorm', 'sText_PkmnsXPreventsYLoss', 'sText_PkmnsXInfatuatedY', 'sText_PkmnsXMadeYIneffective', 'sText_PkmnsXCuredYProblem', 'sText_ItSuckedLiquidOoze', 'sText_PkmnTransformed', 'sText_ElectricityWeakened', 'sText_FireWeakened', 'sText_PkmnHidUnderwater', 'sText_PkmnSprangUp', 'sText_HMMovesCantBeForgotten', 'sText_XFoundOneY', 'sText_PlayerDefeatedLinkTrainerTrainer1', 'sText_SoothingAroma', 'sText_ItemsCantBeUsedNow', 'sText_ForXCommaYZ', 'sText_UsingItemTheStatOfPkmnRose', 'sText_PkmnUsedXToGetPumped', 'sText_PkmnsXMadeYUseless', 'sText_PkmnTrappedBySandTomb', 'sText_EmptyString4', 'sText_ABoosted', 'sText_PkmnsXIntensifiedSun', 'sText_PkmnMakesGroundMiss', 'sText_YouThrowABallNowRight', 'sText_PkmnsXTookAttack', 'sText_PkmnChoseXAsDestiny', 'sText_PkmnLostFocus', 'sText_UseNextPkmn', 'sText_PkmnFledUsingIts', 'sText_PkmnFledUsing', 'sText_PkmnWasDraggedOut', 'sText_PreventedFromWorking', 'sText_PkmnsItemNormalizedStatus', 'sText_Trainer1UsedItem', 'sText_BoxIsFull', 'sText_PkmnAvoidedAttack', 'sText_PkmnsXMadeItIneffective', 'sText_PkmnsXPreventsFlinching', 'sText_PkmnAlreadyHasBurn', 'sText_StatsWontDecrease2', 'sText_PkmnsXBlocksY2', 'sText_PkmnsXWoreOff', 'sText_PkmnRaisedDefALittle', 'sText_PkmnRaisedSpDefALittle', 'sText_TheWallShattered', 'sText_PkmnsXPreventsYsZ', 'sText_PkmnsXCuredItsYProblem', 'sText_AttackerCantEscape', 'sText_PkmnObtainedX', 'sText_PkmnObtainedX2', 'sText_PkmnObtainedXYObtainedZ', 'sText_ButNoEffect', 'sText_PkmnsXHadNoEffectOnY', 'sText_TwoInGameTrainersDefeated', 'sText_Trainer2LoseText', 'sText_PkmnIncapableOfPower', 'sText_GlintAppearsInEye', 'sText_PkmnGettingIntoPosition', 'sText_PkmnBeganGrowlingDeeply', 'sText_PkmnEagerForMore', 'sText_DefeatedOpponentByReferee', 'sText_LostToOpponentByReferee', 'sText_TiedOpponentByReferee', 'sText_QuestionForfeitMatch', 'sText_ForfeitedMatch', 'gText_PkmnTransferredSomeonesPC', 'gText_PkmnTransferredLanettesPC', 'gText_PkmnTransferredSomeonesPCBoxFull', 'gText_PkmnTransferredLanettesPCBoxFull', 'sText_Trainer1WinText', 'sText_Trainer2WinText'] as const;
export const sStatNamesTable2 = ['sText_HP', 'sText_SpAtk', 'sText_Attack', 'sText_SpDef', 'sText_Defense', 'sText_Speed'] as const;
export const gRoundsStringTable = ['sText_Round1', 'sText_Round2', 'sText_Semifinal', 'sText_Final'] as const;
export const gRefereeStringsTable = ['sText_RefIfNothingIsDecided', 'sText_RefThatsIt', 'sText_RefJudgeMind', 'sText_RefJudgeSkill', 'sText_RefJudgeBody', 'sText_RefPlayerWon', 'sText_RefOpponentWon', 'sText_RefDraw', 'sText_RefCommenceBattle'] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sRecordedBattleTextSpeeds: readonly number[] = [8,4,1,0] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sBattlerAbilities', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ChooseMoveUsedParticle', ret: "void", arity: 1, params: "u8 *textPtr" },
  { name: 'ChooseTypeOfMoveUsedString', ret: "void", arity: 1, params: "u8 *dst" },
  { name: 'ExpandBattleTextBuffPlaceholders', ret: "void", arity: 2, params: "const u8 *src, u8 *dst" },
  { name: 'BufferStringBattle', ret: "void", arity: 1, params: "u16 stringID" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "gBattleTextBuff2, gMoveNames[gBattleMsgDataPtr->currentMove]" },
  { name: 'BattleStringExpandPlaceholdersToDisplayedString', ret: "u32", arity: 1, params: "const u8 *src" },
  { name: 'BattleStringExpandPlaceholders', ret: "u32", arity: 2, params: "const u8 *src, u8 *dst" },
  { name: 'StringAppend', ret: "else", arity: 2, params: "dst, sText_WildPkmnPrefix" },
  { name: 'GetMonData', ret: "else", arity: 3, params: "&gEnemyParty[src[srcID + 2]], MON_DATA_NICKNAME, dst" },
  { name: 'BattlePutTextOnWindow', ret: "void", arity: 2, params: "const u8 *text, u8 windowId" },
  { name: 'SetPpNumbersPaletteInMoveSelection', ret: "void", arity: 0, params: "void" },
  { name: 'GetCurrentPpToMaxPpState', ret: "u8", arity: 2, params: "u8 currentPp, u8 maxPp" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_anim.h',
  'battle_controllers.h',
  'battle_message.h',
  'battle_setup.h',
  'battle_tower.h',
  'data.h',
  'event_data.h',
  'frontier_util.h',
  'graphics.h',
  'international_string_util.h',
  'item.h',
  'link.h',
  'menu.h',
  'palette.h',
  'recorded_battle.h',
  'string_util.h',
  'strings.h',
  'text.h',
  'trainer_hill.h',
  'window.h',
  'constants/battle_dome.h',
  'constants/battle_string_ids.h',
  'constants/frontier_util.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/trainers.h',
  'constants/trainer_hill.h',
  'constants/weather.h',
] as const;
