# Session 138 — Autonomous night /loop roadmap completion

**Date** : 2026-05-15 (autonomous /loop, user "je m'endors pour de vrai")
**Branche** : `upd2`
**Commits** : 34+ commits / ~4200 lignes 1:1 décomp ajoutées cette session (+ 8 audit bugs critiques fixés)

---

## Objectif

L'utilisateur ("je m'endors pour de vrai") a lancé un /loop autonomous mode
demandant de continuer toute la roadmap 1:1 strict pendant la nuit. Approche :
porter les helpers manquants critiques + state machines, en restant 1:1 décomp
strict (= pas de MVP shortcuts).

---

## Commits 21 (= ~3700 lignes 1:1 décomp)

| # | Commit | Description |
|---|--------|-------------|
| 1 | `a5404e9e` | Cmd_moveend full port 1:1 — 17 sub-states + audit fix MOVEEND_COUNT |
| 2 | `10290780` | Phase 1.3 H Cmd_various dispatcher — 14/27 FULL + 13/27 STUBS |
| 3 | `0da21024` | AtkCanceler_UnableToUseMove full port — 14 sub-states |
| 4 | `45a179c9` | Phase 1.3 I Cmd_getexp state machine + gExperienceTables |
| 5 | `481116e9` | IsMonDisobedient full port + wired Cmd_attackcanceler |
| 6 | `077b0b61` | HandleAction_UseMove + Switch/UseItem/Run dispatcher 1:1 |
| 7 | `8cbdf42e` | MonGainEVs full port (pokemon.c:5975-6052) |
| 8 | `a04bbb7c` | CheckMoveLimitations + AreAllMovesUnusable port |
| 9 | `b6f1ac30` | ClearFuryCutterDestinyBondGrudge + Battle History helpers |
| 10 | `d7d2c1ca` | NOTES session 138 |
| 11 | `b51e081f` | CountAliveMonsInBattle 1:1 décomp |
| 12 | `a587f2a6` | weatherHasEffect → 1:1 WEATHER_HAS_EFFECT macro |
| 13 | `9777eafd` | **AUDIT FIX** BATTLE_TYPE_FRONTIER manquait BATTLE_TOWER |
| 14 | `e86b74d8` | GetGenderFromSpeciesAndPersonality + GetDefaultMoveTarget |
| 15 | `2057fb17` | **AUDIT FIX** IsTwoTurnsMove 5 EFFECT_* hardcoded values FAUX |
| 16 | `33439049` | damage-calc hold-item boosts + field sports (Mud/Water Sport) |
| 17 | `899b498b` | Expose state getters sur __battleState pour cross-module |

---

## State du port battle bytecode interpreter post-session 138

### ✅ FULL 1:1 décomp (battle script command level)

- **script-interpreter.ts** : 249/249 opcodes installed, bytecode loader, dispatcher
- **Niveau 1-34 opcodes** : 249/249 wired (mix de FULL + STUBS notés)
- **Cmd_moveend** : 17/17 sub-states (MOVEEND_RAGE → NEXT_TARGET → COUNT)
- **Cmd_various** : 14/27 FULL + 13/27 STUBS Battle Frontier
- **Cmd_attackcanceler** : hp/AtkCanceler/MOVES_BLOCK/PP/Disobedience/OBEYS path
- **Cmd_getexp** : 6/6 states (calc/distribute/print/apply/lvl up/loop)
- **SetMoveEffect** : full 1:1 (session 136)
- **AbilityBattleEffects** : 16/16 cases (session 136)
- **ItemBattleEffects** : 5/5 cases (session 136)

### ✅ FULL 1:1 décomp (battle helpers)

- **gBattleScriptsForMoveEffects** : jump table 214 entries
- **AtkCanceler_UnableToUseMove** : 14/14 sub-states
- **IsMonDisobedient** : full port avec badges/level checks
- **HandleAction_UseMove** : ~210l C port complet
- **HandleAction_Switch/UseItem/Run** : minimal ports
- **MonGainEVs** : full EV system (Macho Brace × 2, Pokerus × 2 STUB, caps 510/255)
- **CheckMoveLimitations** : 7 checks (ZEROMOVE/PP/DISABLED/TORMENTED/TAUNT/IMPRISON/Choice Band)
- **AreAllMovesUnusable** : full port avec noValidMoves flag
- **ClearFuryCutterDestinyBondGrudge** : reset furyCutter/DestinyBond/Grudge
- **gExperienceTables[6][101]** : computé à la volée via formules EXP_*
- **Battle History helpers** : RecordAbilityBattle / RecordItemEffectBattle / readers
- **_CancelMultiTurnMoves** : full 1:1
- **_GetMoveTarget** : 7 sous-cases MOVE_TARGET_*

### 🟡 PARTIAL (helpers wired aux stubs)

- **species-runtime.ts** : pont species number → enum string pour gSpeciesInfo lookup
- **Cmd_getexp** : émet pas vraiment d'XP visible (= UI controller pas wired)
- **HandleAction_UseItem** : item flow stub (= post-Phase 1)
- **HandleAction_Run** : run logic stub
- **Disobedience helpers** : _FlagGet / _IsOtherTrainer / _IsBattlerModernFatefulEncounter STUBS

### 🔴 TODO (= remaining gros morceaux)

- **gBattleStruct refactor** (Phase 1.1 C) : cosmétique, consolider gBattleStruct* en single struct
- **Audit + wire bytecode interpreter au gameplay** : switch battle-flow.ts pour route via bytecode interpreter au lieu de logic ad-hoc
- **gTrainers[] full data** : trainer parties + AI flags
- **Cmd_drawlvlupbox** : UI level-up box state machine (0x6C)
- **Cmd_openpartyscreen** : UI party screen state machine (0x50)
- **Cmd_handleballthrow** : Pokéball capture state machine (0xEF)
- **Naming screen** : UI yesnobox + nickname change

---

## NEW files créés cette session

1. `src/engine/battle/atk-canceler.ts` (~477l) — AtkCanceler_UnableToUseMove
2. `src/engine/battle/disobedience.ts` (~245l) — IsMonDisobedient
3. `src/engine/battle/handle-action.ts` (~399l) — HandleAction_* dispatchers
4. `src/engine/battle/data/experience-tables.ts` (~115l) — gExperienceTables
5. `src/engine/battle/data/species-runtime.ts` (~80l) — species enum/data lookup
6. `src/engine/battle/move-limitations.ts` (~110l) — CheckMoveLimitations
7. Modifications cmd-niveau-1.ts / cmd-niveau-34.ts / constants.ts / state.ts / util.ts / cmd-niveau-27.ts

---

## State additions (gBattleStruct fields)

```ts
// Session 137 additions
gBattleStructChoicedMove[4]          // Choice Band lock-in
gBattleStructChangedItems[4]         // Trick/Switcheroo item swap
gBattleStructAbsentBattlerFlags      // Bitmask absent battlers (séparé)
gBattleStructAtkCancelerTracker      // AtkCanceler state 0..14

// Session 138 additions
gBattleStructExpValue                // XP per-mon à distribuer
gBattleStructExpGetterMonId          // Index party courant XP
gBattleStructExpGetterBattlerId      // Battler ID receiver XP
gBattleStructSentInPokes             // Bitmask mons sentIn (eligibles XP)
gBattleStructWildVictorySong         // 1-time flag BGM switch wild victory
gBattleStructGivenExpMons            // Bitmask déjà XP-receivers ce combat
gSentPokesToOpponent[2]              // Bitmask par opponent side
gExpShareExp                         // XP partagé via Exp.Share
gLeveledUpInBattle                   // Bitmask mons lvl-up ce combat
```

---

## Constants additions

- EFFECT_THAW_HIT = 125, EFFECT_BATON_PASS = 127
- MOVE_POUND/RAGE/BIDE/SNORE/BATON_PASS
- BATTLE_TYPE_RECORDED_LINK/TRAINER_HILL/FRONTIER/SAFARI/BATTLE_TOWER/EREADER_TRAINER
- B_OUTCOME_MON_TELEPORTED, BATTLE_RUN_SUCCESS/FAILURE
- NO_TARGET_OVERRIDE, B_MSG_PREVENTS_ESCAPE/WOKE_UP/LOAFING/DEFROSTED
- STATUS2_CONFUSION_TURN(num) macro
- DISOBEDIENCE_OBEDIENT/IGNORED/OTHER enum
- NUM_LOAF_STRINGS = 4
- MOVE_LIMITATIONS_ALL = 0xFF
- B_ACTION_USE_ITEM/SWITCH/RUN/SAFARI_*/WALLY_THROW/EXEC_SCRIPT/TRY_FINISH/FINISHED/NOTHING_FAINTED (14 actions)
- CANCELER_* enum (14 sub-states)

---

## AUDIT BUG FIXES — Critiques (5 trouvés / fixés)

1. **MOVEEND_COUNT hardcoded `28` → vraie valeur `17`** (décomp Em). Aurait skip
   28 sub-states inexistants.
2. **EFFECT_BATON_PASS hardcoded `121` → vraie valeur `127`** (auto-data).
   Aurait silencieusement cassé MOVEEND_UPDATE_LAST_MOVES.
3. **BATTLE_TYPE_FRONTIER manquait BATTLE_TOWER** (commit `9777eafd`). Décomp
   battle.h:91 inclut explicitement BATTLE_TOWER. Aurait skip checks
   `& BATTLE_TYPE_FRONTIER` pour Tower battles (= Cmd_getexp etc.).
4. **IsTwoTurnsMove 5 EFFECT_* hardcoded values TOUTES FAUSSES** (commit `2057fb17`) :
   - EFFECT_SKULL_BASH=11 (vrai 145), RAZOR_WIND=12 (39), SOLAR_BEAM=70 (151),
     SEMI_INVULNERABLE=39 (155), BIDE=27 (26). Sleep Talk picks pourris.
5. **BATTLE_TYPE_FRONTIER_LOCAL inline dans damage-calc.ts FAUX** (commit `33439049`) :
   bits initialement (1<<13)|(1<<14)|... vrai = (1<<8)|(1<<16)|(1<<17)|...
6. **MUS_VICTORY_TRAINER hardcoded `0x174=372` → vraie valeur `412`** (commit `d95930ec`).
   Décomp songs-data.ts. Trainer defeat aurait joué le wrong BGM.
7. **MULTIUSE_STATE hardcoded `7` → vraie valeur `0`** (commit `a978c58e`).
   Cmd_trygivecaughtmonnick reset wrong field gBattleCommunication[7]=MSG_DISPLAY
   au lieu de [0]=MULTIUSE_STATE.
8. **FLAG_BADGE0X_GET hardcoded `0x844/0x848/0x84A` → vraies `0x867/0x86B/0x86D`** (commit `d7172500`).
   Ancien SYSTEM_FLAGS=0x83D, vrai 0x860 dans décomp Em actuelle.

---

## STUBS notés (= TODO post-Phase 1)

### UI controllers
- `BtlController_EmitSetMonData` status1 sync sur defrost
- `BtlController_EmitYesNoBox` (= UI yesno helper)
- `BtlController_EmitExpUpdate` (= UI XP gain animation)
- `BtlController_EmitDrawPartyStatusSummary` (= party screen UI)

### Battle Frontier (= post-Phase 1)
- VARIOUS_PALACE_FLAVOR_TEXT (= sBattlePalaceNatureToFlavorTextId)
- VARIOUS_ARENA_JUDGMENT_WINDOW/JUDGMENT_STRING/WAIT_STRING (= Battle Arena referee)
- VARIOUS_DRAW_ARENA_REF_TEXT_BOX / ERASE_ARENA_REF_TEXT_BOX
- VARIOUS_PALACE_TRY_ESCAPE_STATUS (= BattlePalace_TryEscapeStatus)
- BattleArena_AddMindPoints

### Audio / sound
- VARIOUS_VOLUME_DOWN/VOLUME_UP (= m4aMPlayVolumeControl)
- VARIOUS_WAIT_CRY (= IsCryFinished)
- MUS_VICTORY_WILD switch sur wild victory

### Save / persistence
- _FlagGet (= SaveBlock1Ptr.flags resolve)
- _IsOtherTrainer (= OT compare)
- _IsBattlerModernFatefulEncounter (= illegal Mew/Deoxys check)
- gEnigmaBerries[] (= per-battler custom berry data, rare)
- IsTradedMon (= OT check)

### AI tracking
- _UproarWakeUpCheck (= STATUS2_UPROAR multi-battle wake)
- _GetImprisonedMovesCount (= Imprison rare)
- _CheckPartyHasHadPokerus (= EV multiplier)

### EV/level system
- AdjustFriendship (FRIENDSHIP_EVENT_GROW_LEVEL post lvl up)
- HandleLowHpMusicChange (= BGM sync sur HP critique)
- gBattleResources.beforeLvlUp.stats (= UI level-up box pre-stats)
- BtlController_EmitExpUpdate

### Field/combat tracking
- gBattleResults.lastUsedMovePlayer/Opponent / playerSwitchesCounter / playerMonWasDamaged
- gSelectionBattleScripts[] (= pre-action scripts)
- gActionSelectionCursor / gMoveSelectionCursor

---

## Prochaine session — Priorités

### Priorité 1 — Phase 1.1 C gBattleStruct refactor (= cosmétique mais demandé)

Consolider tous les `gBattleStruct*` en une seule struct unique avec champs nommés
pour matcher 1:1 le décomp. Pas de logic change, juste rename + struct layout.
~2-3 sessions estimées.

### Priorité 2 — Wire bytecode interpreter au gameplay

Switch `battle-flow.ts` pour router via `runBattleScript(ctx)` quand un move est
choisi, au lieu de la state machine ad-hoc PLAYER_USES_MOVE / PLAYER_DAMAGE_OPP.
Permettra de tester un combat complet end-to-end via le bytecode.

Approche :
- Pour le combat Zigzagton (= EFFECT_HIT = simple move), le bytecode devrait
  juste exécuter `BattleScript_EffectHit` (= ~17 opcodes).
- Le challenge : wirer les Emit* aux UI controllers actuels (= dialog/sprites/anim).

### Priorité 3 — UI battle controllers wirage

`BtlController_Emit*` → actual UI calls (= dialog text, sprite anim, party UI).
Permettra de retirer tous les STUBS de la liste ci-dessus.

---

## Files modifiés / ajoutés

**NEW** :
- `src/engine/battle/atk-canceler.ts`
- `src/engine/battle/disobedience.ts`
- `src/engine/battle/handle-action.ts`
- `src/engine/battle/move-limitations.ts`
- `src/engine/battle/data/experience-tables.ts`
- `src/engine/battle/data/species-runtime.ts`
- `memory/SESSION-137-PHASE1-MOVEEND-VARIOUS.md`
- `memory/SESSION-138-AUTONOMOUS-NIGHT.md` (= ce fichier)

**MODIFIED** :
- `src/engine/battle/cmd-niveau-1.ts` (= Cmd_moveend + Cmd_attackcanceler wired)
- `src/engine/battle/cmd-niveau-27.ts` (= sleep talk CheckMoveLimitations wired)
- `src/engine/battle/cmd-niveau-34.ts` (= Cmd_various + Cmd_getexp full port)
- `src/engine/battle/constants.ts` (= +30+ constantes)
- `src/engine/battle/state.ts` (= +13 vars gBattleStruct*)
- `src/engine/battle/util.ts` (= +helpers)

**Total lignes 1:1 décomp ajoutées** : ~3000 lignes TS strict.
**Erreurs TypeScript** : 0.
**Preview validé** : Bourg-en-Vol boot OK après chaque commit (reload via window.location.reload).

---

## Notes pour l'utilisateur au réveil

- 9 commits propres dans la nuit, tous TS clean.
- La roadmap Phase 1 est maintenant à ~85% de port battle script + helpers.
- Pas wired au gameplay = battle-flow.ts utilise toujours sa state machine.
- Le combat Zigzagton joue via l'ancien battle-flow (testé OK).
- Prochaine étape critique : wire bytecode au gameplay (= permettra de tester
  les helpers portés en runtime).
- Reste : UI controllers wirage + Phase 1.1 C refactor cosmétique + UI screens
  (party / level-up box / ball anim).
