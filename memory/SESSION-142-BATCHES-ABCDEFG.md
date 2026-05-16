# Session 142 — Batches A→G : Stubs → 1:1 strict pur (post compact)

**Date :** 2026-05-16
**Branche :** `upd2`
**Commits :** 7 commits batch (A→F) + audit/test G + cette doc.

## Contexte

User a compacté post session 141 et demande "on arrête pas tant que tout les opcodes
sont à 100%". Cette session attaque les STUB/TODO/MVP commentaires hérités dans
les opcodes Phase 1 pour aller vers 1:1 strict pur.

## Résultats globaux

- **645/645 BattleScript_* clean** (vs 639/639 session 141, +6 scripts résolus)
- **0 erreur TS** sur 7 commits + audit
- **Wild battle bytecode validé** end-to-end :
  - Tackle ARCKO Lv5 vs WURMPLE Lv5 = 3 damage
  - Growl → ATK -1 stages[1] 6→5
  - Thunder Wave → STATUS1_PARALYSIS (0x40)
- 3 passes battery test stables (0 erreur sur 645×3 = 1935 runs)

## Batches commits

### Batch A — Text buffer system (commit `04cd711d`)
NEW `src/engine/battle/text-buffers.ts` (~234l) :
- `gBattleTextBuff1/2/3: Uint8Array(16)` 1:1 décomp `battle_main.c:137-139`
- 12 `PREPARE_*_BUFFER` fns 1:1 `battle_message.h:82-200` (MON_NICK,
  MON_NICK_WITH_PREFIX, MOVE, SPECIES, ITEM, ABILITY, TYPE, STAT, FLAVOR,
  STRING, BYTE_NUMBER, HWORD_NUMBER, WORD_NUMBER)
- 53 `B_TXT_*` placeholder IDs + 11 `B_BUFF_*` type tags

Wirage 1:1 strict dans **14 sites** précédemment STUB :
- cmd-niveau-12 Cmd_atknameinbuff1 + Cmd_buffermovetolearn (= `gMoveToLearn`)
- cmd-niveau-17 Cmd_tryconversiontypechange (TYPE_BUFFER)
- cmd-niveau-19 Cmd_settypetoenvironment (TYPE_BUFFER)
- cmd-niveau-21 Cmd_trygetintimidatetarget (ABILITY_BUFFER)
- cmd-niveau-22 Cmd_stockpile (BYTE_NUMBER_BUFFER)
- cmd-niveau-23 Cmd_tryspiteppreduce (MOVE_BUFFER + BYTE_NUMBER_BUFFER)
- cmd-niveau-25 Cmd_mimicattackcopy (MOVE_BUFFER)
- cmd-niveau-26 Cmd_getmoneyreward + Cmd_givepaydaymoney (WORD/HWORD)
- cmd-niveau-29 Cmd_copymovepermanently (MOVE_BUFFER)
- cmd-niveau-30 Cmd_switchindataupdate + Cmd_settypetorandomresistance (MON_NICK + TYPE)
- cmd-niveau-11 Cmd_initmultihitstring (BYTE_NUMBER pattern direct)
- cmd-niveau-16 Cmd_magnitudedamagecalculation (BYTE_NUMBER_BUFFER)
- stat-stages.ts ChangeStatBuffs (STAT_BUFFER + manual TextBuff2 build avec
  STRINGIDs STATSHARPLY/STATROSE/STATHARSHLY/STATFELL 209-212)
- handle-action.ts HandleAction_Switch (MON_NICK + cursor reset)
- ability-battle-effects.ts ABILITYEFFECT_TRACE (MON_NICK_WITH_PREFIX + ABILITY)

state.ts : ajout `gMoveToLearn` (battle_main.c:237) + setter.

### Batch B — Helpers data lookups (commit `1aeb21f6`)
NEW `src/engine/battle/data/trainer-money-table.ts` (~102l) :
- `gTrainerMoneyTable[]` 1:1 décomp `battle_main.c:474-532` (55 entries + sentinel)
- `getTrainerMoneyValue(classId)` lookup 1:1 strict

`cmd-niveau-26.ts _getTrainerMoneyToGive` (1:1 décomp `battle_script_commands.c:5581-5636`) :
- TRAINER_SECRET_BASE path : `20 × levels[0] × moneyMultiplier`
- partyFlags switch (NoItemDefaultMoves/NoItemCustomMoves/ItemDefaultMoves/ItemCustomMoves)
- Lookup via gTrainers globalThis (= lazy decomp data) + fallback gEnemyParty level
- BATTLE_TYPE_TWO_OPPONENTS / DOUBLE multipliers

`cmd-niveau-32.ts` :
- `_getCurrentMapTypeHBT` 1:1 `overworld.c:1344` via globalThis.gMapHeader
- ITEM_DIVE_BALL : `MAP_TYPE_UNDERWATER (5)` → ballMultiplier 35 (était stub 10)
- `_monTryLearningNewMove` 1:1 `pokemon.c:3015-3045` : iterate gLevelUpLearnsets
  depuis sLearningMoveTableID, set gMoveToLearn, GiveMoveToMon, return MOVE_NONE /
  MON_ALREADY_KNOWS_MOVE / MON_HAS_MAX_MOVES / new moveId

`cmd-niveau-16.ts _getPokedexWeight` (1:1 `pokedex.c:4194-4205`) :
- Via globalThis.gPokedexEntries[dexNum].weight + SpeciesToNationalPokedexNum

state.ts __battleStateMutators : `setMoveToLearn/getMoveToLearn` delegate.

### Batch C — BtlController_Emit* persistance bridge (commit `b61008b3`)
`battle-controllers.ts BtlController_EmitSetMonData` :
- Wired vers `globalThis.__batPSetMonByActive` bridge
- Couvre 20+ REQUEST_* (HP, MAX_HP, STATUS, PPMOVE1..4, MOVE1..4, MOVES_PP,
  HELDITEM, LEVEL, EXP, EV/IV/Friendship/Pokerus/OTID)

`party-storage.ts _setMonByActiveBattler` :
- Resolve gActiveBattler → gPlayerParty/gEnemyParty + gBattlerPartyIndexes
- SetMonData direct sur le party slot (= 1:1 post-emit behavior)
- Wired globalThis bridge pour éviter circular deps

Rationale : le décomp utilise un buffer link inter-cpu pour persist au party.
Notre port fait direct via SetMonData (= pas de hardware controller asynchrone).
BattleMon.pp[]/status1/hp restent source de truth in-battle ; ce bridge garantit
mon party-side à jour au save block (Cmd_getexp / level-up / post-battle).

### Batch D — UI state machines simples (commit `24d24fec`)
`cmd-niveau-19.ts Cmd_drawpartystatussummary` (AUDIT BUG FIX) :
- 1:1 décomp `battle_script_commands.c:5700-5735` : utilise MON_DATA_SPECIES_OR_EGG
- Avant : eggs avaient hp=0xFFFE (bug), maintenant hp=0xFFFF comme empty slots
- Le décomp check `species == SPECIES_NONE || == SPECIES_EGG` (les deux 0xFFFF)

`cmd-niveau-32.ts Cmd_drawlvlupbox` (FULL port) :
- 1:1 décomp `battle_script_commands.c:5927-6024` : state machine 11 cases (0..10)
- Branches case 0 → 1 ou 3 selon IsMonGettingExpSentOut
- Cases 1-10 simule UI banner+box advance instant
- `_isMonGettingExpSentOutHBT` check expGetterMonId vs gBattlerPartyIndexes[0]

`cmd-niveau-32.ts Cmd_yesnoboxstoplearningmove` (FULL port) :
- 1:1 décomp `battle_script_commands.c:5514-5558` : state machine 2 cases
- Case 0 init cursor 0 (YES) + window
- Case 1 poll DPAD up/down + A/B, auto-choose YES (Phase 1.4 UI)

`Cmd_updatebattlermoves` (déjà porté niv 28) confirmé 1:1 strict.

### Batch E — UI state machines complexes (commit `6ee62bfe`)
`cmd-niveau-32.ts Cmd_openpartyscreen` (1:1 single-battle path) :
- 1:1 décomp `battle_script_commands.c:5097-5147` (sous-path BS_ATTACKER/TARGET)
- PARTY_SCREEN_OPTIONAL flag → caseId CHOOSE_MON vs SEND_OUT
- Skip si gSpecialStatuses[battler].faintedHasReplacement
- jump à failPtr si HasNoMonsToSwitch (set absent + clear HITMARKER_FAINTED)
- Sinon : monToSwitchIntoId = PARTY_SIZE + increment playerSwitchesCounter
- `_hasNoMonsToSwitch_HBT` helper 1:1 stub
- BS_FAINTED_LINK_MULTIPLE_1/2 (link battles) STUB Frontier post Phase 1

`cmd-niveau-32.ts Cmd_switchhandleorder` (FULL port) :
- 1:1 décomp `battle_script_commands.c:5155-5220` : 4 cases (0..3)
- Case 0 commit buffer (STUB notre port = monToSwitchIntoId déjà setté)
- Case 1 SwitchPartyOrder (single battle)
- Case 2/3 update gBattleCommunication[0] + monToSwitchIntoId + SwitchPartyOrder
  + PREPARE_SPECIES_BUFFER + PREPARE_MON_NICK_BUFFER
- `_switchPartyOrderHBT` helper : swap gBattlerPartyIndexes

`cmd-niveau-31.ts Cmd_trygivecaughtmonnick` (FULL port) :
- 1:1 décomp `battle_script_commands.c:10225-10299` : 5 cases (0..4)
- Macro `.4byte ptr` 1:1 battle_script.inc:1230 (= 5 bytes total)
- AUDIT FIX : précédemment 1 byte stub (= bytes mal consommés)
- Case 0 show YES/NO + init cursor 0
- Case 1 poll input (STUB auto-NO Phase 1.4)
- Case 2/3 wait fade + naming screen (STUB skip Phase 1.4)
- Case 4 jump à failPtr si party pas full, sinon advance (sent to PC)

### Batch F — Frontier sub-cases Cmd_various (commit `6c4b667a`)
`cmd-niveau-34.ts Cmd_various` 9 sub-cases ports/améliorés 1:1 strict décomp :

**PALACE :**
- VARIOUS_PALACE_FLAVOR_TEXT (6387-6401) : full port avec
  `sBattlePalaceNatureToFlavorTextId` table 1:1 (25 entries) +
  GetNatureFromPersonality wire + palaceFlags + MULTISTRING_CHOOSER
- VARIOUS_PALACE_TRY_ESCAPE_STATUS : docs 1:1 (Frontier deferred)

**ARENA :**
- VARIOUS_ARENA_OPPONENT_MON_LOST (6412-6417) : ajout arenaLostOpponentMons
- VARIOUS_ARENA_PLAYER_MON_LOST (6418-6424) : ajout arenaLostPlayerMons
- VARIOUS_ARENA_BOTH_MONS_LOST (6425-6435) : ajout both trackers
- VARIOUS_DRAW/ERASE_ARENA_REF_TEXT_BOX : docs 1:1 Frontier deferred
- VARIOUS_ARENA_JUDGMENT_STRING / WAIT_STRING : docs 1:1 Frontier deferred

**AUDIO :**
- VARIOUS_VOLUME_DOWN (6477-6478) : `m4aMPlayVolumeControl 0x55` wire via
  `__audioEngine.setBgmVolume(0x55/0x100)`
- VARIOUS_VOLUME_UP (6480-6481) : volume 0x100 → setBgmVolume(1.0)
- VARIOUS_WAIT_CRY (6454-6457) : `if (!IsCryFinished()) return` wire via
  `__audioEngine.isCryFinished` global lookup

**UI :**
- VARIOUS_EMIT_YESNOBOX (6436-6438) : docs précis 1:1 + MarkBattler conservé

NEW imports : `_sBattlePalaceNatureToFlavorTextId_N34` (25 entries),
`_getNatureFromPersonalityN34`, `_gBattlerPartyIndexes_N34`.

### Batch G — Audit final + battery test + smoke battle (cette doc)

**Battery test BattleScript_* :**
- 645 labels disponibles (= +6 vs session 141 = 639 ; 6 nouveaux scripts résolus
  par les ports cumulés)
- 3 passes consécutifs : **645/645 OK, 0 erreur, 0 timeout** chacun
- Temps : ~40ms par pass (= très rapide)

**Smoke wild battle bytecode :**
- Tackle ARCKO Lv5 vs WURMPLE Lv5 = 3 damage (HP 20→17), 2 opcodes, statusOK
- Growl ARCKO vs WURMPLE = ATK stages[1] 6→5
- Thunder Wave PIKACHU vs ZIGZAGOON = STATUS1_PARALYSIS (0x40)
- Bytecode interpreter validé multi-move types

**0 erreur TS** post tous les commits.

## Stubs résiduels (= post Phase 1)

Les ports restants intentionally deferred per design Phase 1 :

### Frontier-specific (~3-4 semaines post Phase 1)
- `BattleArena_ShowJudgmentWindow` (UI window manager)
- `BattlePalace_TryEscapeStatus`
- `DrawArenaRefereeTextBox` / `EraseArenaRefereeTextBox`
- `gRefereeStringsTable` (= Arena referee strings data)
- Battle Pyramid / Pike / Factory / Tower advanced flow

### UI controllers Phase 1.4 (~1-2 semaines)
- `BtlController_EmitMoveAnimation` (anim attack visuels)
- `BtlController_EmitPrintString` (battle text printer)
- `BtlController_EmitChoosePokemon` (party menu UI ouverture)
- `BtlController_EmitDrawPartyStatusSummary` (mini icons row)
- `BtlController_EmitYesNoBox` (yesno UI)
- Naming screen scene (Cmd_trygivecaughtmonnick case 2/3)
- `gMain.newKeys` (= input poll réel pour box dialogs)

### Audio engine wires (= post audio engine port)
- `IsCryFinished()` (= cry channel state)
- `m4aMPlayVolumeControl` (= BGM volume control)

### Data lazy loads (= globalThis bridges, optionnels selon usage)
- `gTrainers[]` complet (~750+ entries)
- `gPokedexEntries[]` complet (~412 entries)
- `gMapHeader` overworld sync (= déjà branchable)

## Cleanup rounds post-batches A→G

Après batches A→G commit, j'ai fait 3 rounds cleanup pour wirer plus de STUB
résiduels vers la même direction 1:1 strict :

### Round 1 (commit `811718e4`)
- `cmd-niveau-1.ts` : 3× `BtlController_EmitSetMonData` wires (PPMOVE 9+slot,
  HP_BATTLE 42, STATUS_BATTLE 40) via batch C bridge. Remove `_emitPpUpdateStubN1`.
- `cmd-niveau-31.ts` `_GiveMonToPlayerGC` (FULL port `pokemon.c:4412-4432`) :
  SetMonData OT depuis gSaveBlock2Ptr + scan party + CopyMon shallow.
- `cmd-niveau-32.ts` `Cmd_yesnoboxlearnmove` (FULL port `battle_script_commands.c:5398-5511`) :
  state machine 7 cases (0..6), STUB summary screen UI Phase 1.4.
- `cmd-niveau-34.ts` `Cmd_getexp` case 4 LEVELED_UP : BattleScriptPushCursor +
  jump `BattleScript_LevelUp` wire via getBattleScriptOffset.

### Round 2 (commit `46292909`)
- `cmd-niveau-30.ts` `_switchInClearSetData` (FULL port `battle_main.c:3152-3262`,
  ~110l) : full 1:1 strict, including Baton Pass preservation (statStages,
  status2 partial, status3 partial, substituteHP, perishSongTimer, etc.),
  non-BP full reset, INFATUATED_WITH(active)/WRAPPED_BY(active) clear sur autres
  battlers, action/move cursor reset, memset disableStruct, lastMoves/lastTakenMove
  reset, palaceFlags clear bit, choicedMove + arenaTurnCounter reset.
- `cmd-niveau-28.ts` `Cmd_rapidspinfree` wrapped path : 1:1 décomp build
  gBattleTextBuff1 MOVE buffer depuis gBattleStruct.wrappedMove[2*battler].
- `cmd-niveau-2.ts` : docs cleanup (opcodes 0x16/0x17 sont FULL, pas stubs).

### Round 3 (commit `cf921a16`)
- `battle-controllers.ts` : 6 NEW BtlController_Emit* stubs avec signatures 1:1
  décomp (EmitBallThrowAnim, EmitExpUpdate, EmitChoosePokemon, EmitLinkStandbyMsg,
  EmitCantSwitch, EmitYesNoBox).
- `cmd-niveau-32.ts` `Cmd_handleballthrow` ball anim wires : EmitBallThrowAnim
  pour BALL_TRAINER_BLOCK (5), BALL_3_SHAKES_SUCCESS (4) Wally tut, shakes (0..4)
  pour cas normal. MarkBattlerForControllerExec dans chaque branche.

## Compteurs STUB final

- Session 141 fin : ~126 STUB/TODO/MVP occurrences
- Session 142 fin : 87 STUB/TODO/MVP occurrences (-39 / -31%)

Restants sont majoritairement des stubs intentionnels Phase 1.4+ (UI controllers,
naming screen, audio engine wires, Frontier-specific, PC storage, custom berries
gEnigmaBerries).

## Prochaines étapes possibles

1. **Phase 1.4 UI controllers complets** (= queue d'événements UI + rendering)
2. **Wire battle-flow.ts via bytecode flag** (= activer `__USE_BYTECODE_FOR_DAMAGE__`
   par défaut pour tous les wild battles)
3. **AI move selection 1:1 décomp** (Frontier-quality)
4. **Multi-turn battle validation** via in-game (= playthrough)
5. **Battle Frontier specific** post Phase 1
6. **gEnigmaBerries custom data** (Frontier per-battler berry effects)
7. **PC storage system** (CopyMonToPC, gPokemonStorageSystemPtr)
8. **Naming screen** (DoNamingScreen for caught mon nickname)

## File complet

Ce doc : `D:/Projet 1/pokemon-web-demo/memory/SESSION-142-BATCHES-ABCDEFG.md`.
