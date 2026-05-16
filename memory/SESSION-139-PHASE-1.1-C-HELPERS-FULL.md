# Session 139 — Phase 1.1 C + helpers FULL 1:1 décomp

**Date** : 2026-05-16
**Branche** : `upd2`
**État final** : 42 commits, 0 erreur TS, preview clean (audit + helpers FULL + Phase 1.3 G + plan wire)

**🎯 Pour la prochaine session post-compact** : Lire en priorité
`memory/WIRE-BYTECODE-TO-GAMEPLAY-PLAN.md` (= risques connus + plan incrémental
+ devtools + critères succès pour wire bytecode au gameplay).

## Summary

User a dit "Bonjour! C'est parti, continue le plan. Reste bien strict 1:1."
post-compact session 138.

25 commits portés sur :
1. **Phase 1.1 C complete** (3 commits) — gBattleStruct unifié 1:1 décomp
2. **Helpers FULL** (~22 commits) — TryRunFromBattle, FaintClearSetData,
   Cmd_ppreduce, Cmd_datahpupdate, Cmd_attackcanceler, MOVE_EFFECT_STEAL_ITEM,
   Cmd_drawpartystatussummary, PressurePPLose, ClearBattlerMoveHistory,
   shouldGetStatBadgeBoost (FlagGet badge boosts), IsOtherTrainer,
   IncrementGameStat, BtlController_EmitSetMonData wire, CountAliveMonsInBattle
   FULL, GetSetPokedexFlag wire, Cmd_trydobeatup FULL, AdjustFriendship
   wire + ~7 autres stubs résolus.

## Phase 1.1 C — gBattleStruct unifié (3 commits)

### Step 1 (`fe0e47e4`) — Création struct
- `interface BattleStruct` dans `src/engine/battle/state.ts`
- 1:1 décomp `struct BattleStruct` battle.h:354-447 (~60 fields)
- Sous-structs : `LinkBattlerHeader`, `BattleTvMovePoints`, `BattleTv`
- `gBattleStruct: BattleStruct` instance
- Helper `_makeBlankBattleStruct()`
- Aliases legacy gardés temporairement (= setters synchronisent gBattleStruct.X)

### Step 2 (`aa59544f`) — Migration call-sites
12 fichiers migrés (= replace exports legacy → gBattleStruct.X direct) :
- `cmd-niveau-{1,21,25,26,28,30,34}.ts`
- `atk-canceler.ts`
- `move-limitations.ts`
- `handle-action.ts`
- `ability-battle-effects.ts`
- `set-move-effect.ts`

### Step 3 (`820a995c`) — Suppression exports legacy
19 exports supprimés de state.ts :
- `gIntimidateBattler/setIntimidateBattler`
- `gFormToChangeInto/setFormToChangeInto`
- `gSynchronizeMoveEffect/setSynchronizeMoveEffect`
- `gHpScale/setHpScale`
- `gHpOnSwitchout` (alias)
- `gWrappedBy/gWrappedMove` (aliases)
- `gMoveTarget/gChosenMovePositions` (aliases)
- `gBattleStructChoicedMove/gBattleStructChangedItems` (aliases)
- `gBattleStructAbsentBattlerFlags/setBattleStructAbsentBattlerFlags`
- `gBattleStructAtkCancelerTracker/setBattleStructAtkCancelerTracker`
- `gBattleStructExpValue/setBattleStructExpValue`
- `gBattleStructExpGetterMonId/setBattleStructExpGetterMonId`
- `gBattleStructExpGetterBattlerId/setBattleStructExpGetterBattlerId`
- `gBattleStructSentInPokes/setBattleStructSentInPokes`
- `gBattleStructWildVictorySong/setBattleStructWildVictorySong`
- `gBattleStructGivenExpMons/setBattleStructGivenExpMons`

`resetBattleState()` consolidé : tous les fields reset direct via
`gBattleStruct.X = 0` ou boucle in-place pour arrays.

## Helpers FULL portés

### TryRunFromBattle (`19aedbb0`)
NEW file `try-run-from-battle.ts` ~126 lignes.
Source : battle_util.c:407-485.
Calcule si battler arrive à fuir :
- HOLD_EFFECT_CAN_ALWAYS_RUN → auto + FLEE_ITEM
- ABILITY_RUN_AWAY → auto (sauf Pyramid) + FLEE_ABILITY
- BATTLE_TYPE_FRONTIER/TRAINER_HILL + TRAINER → auto
- Sinon : `speedVar = speed*128/oppSpeed + runTries*30` vs `Random()&0xFF`
- Success → setBattleOutcome(B_OUTCOME_RAN) + setCurrentTurnActionNumber(gBattlersCount)

Wired dans cmd-niveau-20.ts:Cmd_jumpifplayerran (0x72).

Constants ajoutées : `FLEE_NONE/FLEE_ITEM/FLEE_ABILITY`, `PYRAMID_LOCATION_NONE`.

### FaintClearSetData FULL (`abf6df06`)
Source : battle_main.c:3264-3360.
Reset complet d'un fainted battler :
- statStages → DEFAULT (6 stats)
- status2/status3 → 0
- Cross-battler cleanup (Escape Prevention / Infatuation / Wrap qui pointent vers active)
- gActionSelectionCursor + gMoveSelectionCursor reset
- gDisableStructs clear + isFirstTurn = 2
- gProtectStructs 19 bit fields → 0
- gLastMoves/gLastLandedMoves/gLastHitByType/gLastResultingMoves/gLastPrintedMoves
- gBattleStruct.choicedMove/lastTakenMove/lastTakenMoveFrom → 0
- palaceFlags clear bit[active]
- Cross-battler lastTakenMove cleanup (= opponents lose Mirror Move ref vers active)
- BattleMon.type1/type2 → species default via `getSpeciesTypes`
- gBattleResourcesFlags[active] = 0 (= Flash Fire reset)
- ClearBattlerMoveHistory + ClearBattlerAbilityHistory

Helper added : `getSpeciesTypes(species)` dans species-runtime.ts (= map TYPE_X enum string → number 1:1 constants/pokemon_types.h).

### Cmd_ppreduce FULL (`878e118a`)
Source : battle_script_commands.c:1205-1251.
- gSpecialStatuses[attacker].ppNotAffectedByPressure check
- Multi-target Pressure dispatch (FOES_AND_ALLY → COUNT_ON_FIELD, BOTH/OPPONENTS_FIELD → COUNT_OTHER_SIDE, default → single)
- MOVE_IS_PERMANENT(attacker, slot) check + emit PP update stub

### Cmd_datahpupdate FULL (`ffb84513`)
Source : battle_script_commands.c:1844-1969.
- Substitute path complete : push cursor + jump `BattleScript_SubstituteFade` si subHP=0
- Bide damage tracker : `gBideDmg[active] += damage`, gBideTarget selon BS_TARGET arg
- Counter/Mirror Coat tracker : `gProtectStructs[active].physicalDmg/specialDmg` + battlerId selon IS_TYPE_PHYSICAL
- Shell Bell tracker conditionnel sur !(PASSIVE_HP_UPDATE)
- moveType resolution via GET_MOVE_TYPE macro

### Cmd_attackcanceler FULL (`882b19b5`)
Source : battle_script_commands.c:962-1007. 4 branches portées :
1. **Magic Coat bounce** : `target.bounceMove + FLAG_MAGIC_COAT_AFFECTED` → PressurePPLose + jump `BattleScript_MagicCoatBounce`
2. **Snatch** : itère battlers, `snatcher.stealMove + FLAG_SNATCH_AFFECTED` → jump `BattleScript_SnatchedMove`
3. **Lightning Rod redirect** : `target.lightningRodRedirected` → setLastUsedAbility + jump `BattleScript_TookAttack`
4. **DEFENDER_IS_PROTECTED** : `target.protected + FLAG_PROTECT_AFFECTED + (move != CURSE ou attacker GHOST) + (!IsTwoTurnsMove ou MULTIPLETURNS)` → MOVE_RESULT_MISSED + CancelMultiTurnMoves

### SetMoveEffect STEAL_ITEM FULL (`45dd07bd`)
Source : battle_script_commands.c:2738-2803.
Branches : BATTLE_TYPE_TRAINER_HILL skip, opponent + non-link skip,
knockedOffMons skip, Sticky Hold → NoItemSteal, conditions fail skip, sinon
steal full + jump `BattleScript_ItemSteal` + clear choicedMove[target].

Helpers : `_isItemMailSME(itemId)` 1:1 IS_ITEM_MAIL macro (12 items),
import RecordAbilityBattle + ITEM_ENIGMA_BERRY auto-data.

Fix state.ts : `gWishFutureKnock.knockedOffMons` était `number`, doit être
`number[NUM_BATTLE_SIDES]` 1:1 décomp battle.h:173.

### Cmd_drawpartystatussummary FULL (`a888eebd`)
Source : battle_script_commands.c. Build `hpStatuses[PARTY_SIZE]` from
gPlayerParty/gEnemyParty selon side :
- SPECIES_NONE → hp=0xFFFF, status=0 (slot vide)
- IS_EGG → hp=0xFFFE, status=0 (œuf)
- else → hp + status réels

### IncrementGameStat (`a888eebd` part 2)
Source : scrcmd.c pattern. Wire vers globalThis.gSaveBlock1Ptr.gameStats[].

### IsOtherTrainer (`2d309468`)
Wire via gameState.trainerId (= gSaveBlock2Ptr.playerTrainerId).
Compare TID du mon avec player TID pour disobedience check.

### PressurePPLose NEW helper (`882b19b5`)
Source : battle_util.c:740-765.
Si target a ABILITY_PRESSURE → attacker perd 1 PP extra sur ce move slot.

### ClearBattlerMoveHistory (`9333721b`)
Source : battle_ai_script_commands.c:635-661.
`_battleHistory.usedMoves[4][4]` extended dans util.ts pour tracker last 4
moves par battler (= AI tracking).

Helpers added :
- `ClearBattlerMoveHistory(battler)`
- `ClearBattlerItemEffectHistory(battler)`
- `RecordLastUsedMoveByTarget(gLastMoves, target)`
- `getBattleHistoryUsedMoves(battler)`

### shouldGetStatBadgeBoost FULL (`ab902d90`)
Source : pokemon.c:3408-3420.
- Map badgeFlag number → enum string ('FLAG_BADGE01_GET'..'FLAG_BADGE08_GET')
- Wire FlagGet réel via script-vars (= gameState.hasFlag)
- Badges boost stats (+10% si BADGE01/05/07 set pour player)

### Audit + helpers post-audit (commits `4306ae7d` → `f3c77c30`)

**Audit complet 249 opcodes** (= `AUDIT-OPCODES-2026-05-16.md`) :
- 4 batches d'audit via Agents Explore en parallèle
- Résultat : ~75% FULL strict, 0 bug 1:1 critique trouvé
- Agent over-pessimisme corrigé (= 9 opcodes signalés STUB en fait FULL)

**Helpers FULL portés post-audit** :
- `4306ae7d` Cmd_tryfaintmon FULL (HITMARKER_FAINTED + jumps + counters + Destiny Bond + Grudge)
- `a115705e` Cmd_accuracycheck HOLD_EFFECT_EVASION_UP wire
- `8761c9ce` Cmd_switchoutabilities bitmask fix + Cmd_pickup FULL (sPickupItems[18] + sRarePickupItems[11] + sPickupProbabilities[9])
- `cca86963` Cmd_givecaughtmon FULL (GiveMonToPlayer wire + caughtMon{Species,Ball,Box} log)
- `2ea9f40b` Cmd_handleballthrow FULL (~146l capture state machine + Sqrt formula)
- `85bb32ab` _getMoneyMultiplier wire vers gBattleStruct.moneyMultiplier
- `a18d2942` Cmd_assistattackselect FULL (party iter 1:1 vs gBattleMons stub)
- `4cf7fe0b` gUsedHeldItems alias vers gBattleStruct.usedHeldItems
- `297c494c` HandleAction_Run FULL 1:1 (3 branches : link + player TryRunFromBattle + opponent Roar/Whirlwind)
- `f3c77c30` HandleAction_TryFinish + NothingIsFainted + ActionFinished FULL + table 14 entries

### gBattleResourcesFlags consolidé (`b8c60824`)
Source : `struct ResourceFlags { u32 flags[MAX_BATTLERS_COUNT] }` (battle.h:63-66).
- Add `gBattleResourcesFlags: number[]` à state.ts
- Migré ability-battle-effects.ts `_flashFireFlags` → `gBattleResourcesFlags`
- Migré damage-calc.ts globalThis bridge → import direct
- Wire dans FaintClearSetData : `gBattleResourcesFlags[active] = 0`

## NEW structs / state

- `BattleResults` interface 23 fields (battle.h:234-258)
  - playerFaintCounter, opponentFaintCounter, playerSwitchesCounter
  - playerMonWasDamaged, usedMasterBall, caughtMonBall, shinyWildMon
  - playerMon1Species/Name, battleTurnCounter, playerMon2Species/Name
  - lastUsedMovePlayer/Opponent, pokeblockThrows, caughtMonSpecies/Nick
  - catchAttempts[11]
- `gBattleStruct: BattleStruct` 60+ fields (battle.h:354-447) — Phase 1.1 C
- `gBattleResourcesFlags: number[]` (= u32[4] ResourceFlags)
- `gActionSelectionCursor: number[]` (= UI cursor menu action)
- `gMoveSelectionCursor: number[]` (= UI cursor menu move)
- Fix `gWishFutureKnock.knockedOffMons: number[]` (= u8[NUM_BATTLE_SIDES])

## STUBS résolus

1. PP_NOT_AFFECTED_BY_PRESSURE check (Cmd_ppreduce)
2. Multi-target Pressure dispatch (3 cases)
3. MOVE_IS_PERMANENT check (Cmd_ppreduce + Cmd_pphalvedreduce)
4. gBattleResults.playerMonWasDamaged (Cmd_healthbarupdate)
5. gBattleOutcome != 0 early-out (Cmd_attackcanceler)
6. Magic Coat / Snatch / Lightning Rod / Protect (Cmd_attackcanceler 4 branches)
7. SubstituteFade jump (Cmd_datahpupdate)
8. Bide damage tracker + Counter/Mirror Coat tracker (Cmd_datahpupdate)
9. MOVE_EFFECT_STEAL_ITEM FULL (SetMoveEffect)
10. UproarWakeUpCheck setBattlerTarget (atk-canceler)
11. CANCELER_BIDE GetMoveTarget repick (atk-canceler)
12. RecordAbilityBattle wirage (cmd-niveau-3 ×3 + type-calc ×2)
13. targetNotAffected wirage (type-calc)
14. gBattleResults.playerSwitchesCounter (HandleAction_Switch)
15. gBattleResults.lastUsedMovePlayer/Opponent (HandleAction_UseMove)
16. VARIOUS_SET_ALREADY_STATUS_MOVE_ATTEMPT wirage
17. VARIOUS_UPDATE_CHOICE_MOVE_ON_LVL_UP utilise expGetterMonId réel
18. IsOtherTrainer wire gameState.trainerId
19. FlagGet badge boosts (shouldGetStatBadgeBoost)
20. _getItemHoldEffect wire item-hold-effects.ts
21. IncrementGameStat wire gSaveBlock1Ptr
22. gActionSelectionCursor/gMoveSelectionCursor reset (FaintClearSetData)
23. ClearBattlerMoveHistory wire (FaintClearSetData)
24. gProtectStructs.targetNotAffected (type-calc post-DOESNT_AFFECT_FOE)
25. PressurePPLose helper FULL

## STUBs restants (~110 total, ~20 résolus cette session)

| File | Count | Type |
|------|-------|------|
| battle-controllers.ts | 28 | UI controllers wirage (Phase 1.4) |
| cmd-niveau-34.ts | 22 | Battle Frontier specifics + UI |
| handle-action.ts | 9 | gBattleBufferB / AI item types |
| cmd-niveau-1.ts | 5 | text placeholders + Enigma Berry |
| cmd-niveau-31.ts | 5 | UI yesno / party menu / naming |
| cmd-niveau-32.ts | 5 | UI level-up box / dex / ball throw |
| script-interpreter.ts | 5 | tickBattleControllers MVP |
| disobedience.ts | 4 | INGAME_PARTNER / FRONTIER edge cases |
| cmd-niveau-33.ts | 3 | memory mapping natif opcodes (Phase 1.3 G) |
| move-limitations.ts | 3 | + others |
| damage-calc.ts | 2 | ITEM_ENIGMA_BERRY + Secret Base check |
| cmd-niveau-28.ts | 2 | item_use logic + gBattleBufferB |
| cmd-niveau-12.ts | 2 | text placeholders |
| cmd-niveau-2.ts | 2 | doubles support + Niveau 2 |
| other | ~13 | divers |

## Status Phase 1 post-139

| Composant | Status |
|-----------|--------|
| script-interpreter | ✅ 249/249 opcodes installed |
| Niveau 1-34 opcodes | ✅ 249/249 (mix FULL + STUBS notés) |
| Cmd_moveend (0x49) | ✅ 17/17 sub-states |
| Cmd_various (0x76) | ✅ 14/27 FULL + 13 STUBS Battle Frontier |
| Cmd_attackcanceler (0x00) | ✅ **FULL** (Magic Coat/Snatch/Lightning Rod/Protect) |
| Cmd_datahpupdate (0x0C) | ✅ **FULL** (Bide/Counter/SubstituteFade) |
| Cmd_ppreduce (0x03) | ✅ **FULL** (Pressure multi-target) |
| Cmd_getexp (0x23) | ✅ 6/6 states |
| Cmd_drawpartystatussummary | ✅ **FULL** |
| SetMoveEffect | ✅ FULL (STEAL_ITEM port) |
| AbilityBattleEffects | ✅ 16/16 cases |
| ItemBattleEffects | ✅ 5/5 cases |
| gBattleScriptsForMoveEffects | ✅ jump table 214 entries |
| AtkCanceler_UnableToUseMove | ✅ 14/14 sub-states |
| IsMonDisobedient | ✅ FULL + IsOtherTrainer wire |
| HandleAction dispatcher | ✅ FULL + gBattleResults |
| MonGainEVs | ✅ FULL EV system |
| CheckMoveLimitations | ✅ 7 checks |
| AccuracyCalcHelper | ✅ FULL + WEATHER_HAS_EFFECT |
| FaintClearSetData | ✅ **FULL** (battle_main.c:3264-3360) |
| TryRunFromBattle | ✅ **FULL** |
| PressurePPLose | ✅ **FULL** |
| ClearBattlerMoveHistory | ✅ **FULL** + AI usedMoves tracking |
| **gBattleStruct refactor** | ✅ **FULL 1:1** (Phase 1.1 C done) |
| **gBattleResults** | ✅ FULL struct 23 fields |
| **gBattleResourcesFlags** | ✅ struct unifiée (Flash Fire) |
| **Wire bytecode au gameplay** | 🔴 battle-flow.ts encore actif (gros refactor pending) |
| **UI battle controllers** | 🔴 BtlController_Emit* stubs (post-Phase 1) |

## Prochaine session (= priorités)

### Priorité 1 — Wire bytecode au gameplay
Switch `battle-flow.ts` (~1056 lignes state machine ad-hoc) pour router via
`runBattleScript(ctx)` quand un move est choisi. Permettra de tester un combat
complet end-to-end via le bytecode.

Approche :
- Pour le combat Zigzagton (= EFFECT_HIT = simple move), le bytecode devrait
  juste exécuter `BattleScript_EffectHit` (~17 opcodes).
- Le challenge : wirer les Emit* aux UI controllers actuels (= dialog/sprites/anim).

### Priorité 2 — UI battle controllers wirage (Phase 1.4)
`BtlController_Emit*` → actual UI calls (= dialog text, sprite anim, party UI).
Permettra de retirer les STUBs UI (= ~28 occurrences dans battle-controllers.ts).

### Priorité 3 — Cleanup STUBS résiduels
Battle Frontier specifics (Cmd_various 13/27 STUBs), gBattleBufferB pour
HandleAction_UseItem AI types, text placeholders Phase 1.4.

## Tools / approach validés

- gBattleStruct unifié : migration en 3 commits incrémentaux (= step 1 ajout struct + aliases, step 2 migration call-sites par fichier, step 3 suppression exports).
- `getSpeciesTypes(species)` helper dans data/species-runtime.ts pour reset types from species data au faint.
- `_isItemMailSME(itemId)` helper local pour IS_ITEM_MAIL macro (= 12 items hardcoded).
- Pattern `import { X as X_LOCAL } from './module'` pour éviter conflicts duplicate identifiers.
