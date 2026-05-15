# Roadmap Phase 1 — Compléter 100% 1:1 strict

**Date** : 2026-05-15
**État** : 249/249 opcodes dans dispatch table, 0 erreur TS, mais ~39 opcodes 1:1 PARTIAL (= stubs documentés).

## Contexte

Sessions 133-135 ont implémenté **249/249 opcodes** du bytecode interpreter battle (commit `2aad0a93`). 2 audits 1:1 systématiques ont fixé 10 bugs (commits `c633f7cf` + `1ea8497d` + `a058876f`).

**Mais** : ~39 opcodes sont 1:1 **partial** — ils consument les bytes correctement et avancent, mais skip l'effet métier quand un helper/state majeur n'est pas porté. Le bytecode interpreter n'est PAS encore wired au gameplay (= combat zigzagton utilise `battle-flow.ts` qui marche, session 127 victory validée).

Le user **exige 100% strict** (= zéro stub, fidélité décomp ROM). Ce roadmap liste ce qu'il faut porter.

## Pourquoi pas wirer maintenant ?

Si on wire le bytecode interpreter au gameplay AVANT de porter les helpers manquants :
- Les combats Zigzagton+ vont crash ou diverger du décomp dès qu'un opcode partial est appelé.
- Pas de baseline 1:1 pour comparer.
- Régression vs battle-flow.ts qui marche.

Donc : **porter d'abord les helpers, ensuite wirer**.

## Plan en 4 phases

### Phase 1.1 — Foundation (~3 sessions)

Helpers/state simples qui débloquent beaucoup d'opcodes pour peu de code.

#### A. Party storage bridge battle-side
**Lignes décomp** : ~200 (= wrapper logic, pas full party_menu)
**Opcodes débloqués (8)** : `0x4F` jumpifcantswitch, `0xAE` healpartystatus, `0xC4` trydobeatup, `0xDE` assistattackselect, `0xEF` handleballthrow, `0xF0` givecaughtmon, `0xE5` pickup, `0x97` tryinfatuating
**Approche** :
- Créer `gPlayerParty[6]` + `gEnemyParty[6]` battle-side (= struct Pokemon décomp).
- Bridge via `gameState.party` (PokemonInstance[]) → conversion au battle setup.
- Implémenter `GetMonData(mon, MON_DATA_*)` 1:1 décomp avec les fields nécessaires (SPECIES, HP, LEVEL, MOVE1..4, NICKNAME, PERSONALITY, OT_ID, IS_EGG, ABILITY_NUM, HELD_ITEM, STATUS, EXP, FRIENDSHIP).
- Sync au début et fin de battle pour persister.

**Files à créer/modifier** :
- `src/engine/battle/state.ts` : add `gPlayerParty/gEnemyParty` constants
- `src/engine/battle/party-storage.ts` (nouveau) : helpers GetMonData / SetMonData 1:1 décomp
- Update `cmd-niveau-19/27/29/30/31/32.ts` pour utiliser le bridge

#### B. `gBattleScriptsForMoveEffects[effect]` jump table
**Lignes décomp** : ~100 (= juste extraction + integration)
**Opcodes débloqués (5)** : `0x9E` metronome, `0x7C` trymirrormove, `0xCC` callenvironmentattack, `0x63` jumptocalledmove, `0xB7` presentdamagecalculation
**Approche** :
- Le bytecode `data/battle_scripts_1.s` contient un label `gBattleScriptsForMoveEffects` à offset 0, suivi d'une liste de `.4byte BattleScript_X` (= jump pointers per effect 0..210).
- Extracter cette table dans un .json/.ts mapping `effect_id → label_name → byte_offset`.
- Modifier `script-interpreter.ts` pour exposer `getMoveEffectScriptOffset(effect: number): number`.
- Update les opcodes pour utiliser cette table au lieu de `getBattleScriptOffset('gBattleScriptsForMoveEffects')`.

**Files à créer/modifier** :
- `src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_1-jump-table.ts` (nouveau, extracté)
- `src/engine/battle/script-interpreter.ts` : export `getMoveEffectScriptOffset`
- Update `cmd-niveau-26.ts` (jumptocalledmove), `cmd-niveau-27.ts` (metronome, callenv), `cmd-niveau-29.ts` (mirrormove), `cmd-niveau-16.ts` (present)

#### C. `gBattleStruct` unifié
**Lignes décomp** : ~150 (= refactor)
**Bug 1:1 strict fixé** : Cleanup state épars + ~15 opcodes plus 1:1 strict
**Approche** :
- Actuellement on a `gHpScale`, `gHpOnSwitchout`, `gMoveTarget`, `gChosenMovePositions`, `gIntimidateBattler`, `gFormToChangeInto`, `gUsedHeldItems`, etc. comme globals épars.
- Le décomp utilise `gBattleStruct->X` (= struct unique BattleStruct allocated EWRAM).
- Refactor : créer `gBattleStruct` interface unifiée dans state.ts.
- Tous les opcodes qui lisent `gHpScale` → `gBattleStruct.hpScale` etc.

**Files à modifier** :
- `src/engine/battle/state.ts` : remplacer globals épars par `gBattleStruct: BattleStruct`
- Tous les `cmd-niveau-*.ts` qui utilisent ces fields (search/replace)

**Sources de vérité** : `decomps/pokeemeraude/include/battle.h:200-405 struct BattleStruct`

---

### Phase 1.2 — Helpers majeurs (~7-10 sessions)

Les 3 helpers les plus lourds, mais qui débloquent tous les comportements abilities/items/move-effects en battle.

#### D. `SetMoveEffect(primary, certain)`
**Lignes décomp** : ~500 (`battle_script_commands.c:2218..2780`)
**Opcodes débloqués (3)** : `0x15` seteffectwithchance, `0x16` seteffectprimary, `0x17` seteffectsecondary
**Impact réel** : Tous les secondaires de moves (= poison, paralysis, burn, flinch, confusion, stat changes, etc.) sont déclenchés via cette fn.

**Approche** :
- Lire le décomp ligne-par-ligne `battle_script_commands.c:2218..2780`.
- Switch principal sur `gBattleCommunication[MOVE_EFFECT_BYTE]` (= MOVE_EFFECT_*).
- Statuses primaires (≤PRIMARY_STATUS_MOVE_EFFECT) : apply via emit SetMonData.
- Statuses secondaires (>PRIMARY_STATUS_MOVE_EFFECT) : apply via emit + jump à `sMoveEffectBS_Ptrs[effect]`.
- Stat changes : trigger via `gBattleScripting.statChanger` + jump à BattleScript_*.
- Special cases : MOVE_EFFECT_PAYDAY (set gPaydayMoney), MOVE_EFFECT_STEAL_ITEM, MOVE_EFFECT_RECHARGE, MOVE_EFFECT_TRI_ATTACK, etc.

**Dépendances** :
- `sStatusFlagsForMoveEffects` (✓ déjà OK)
- `sMoveEffectBS_Ptrs` (= jump table label → byte offset) — porter avec extraction similaire à B
- `RecordAbilityBattle` (stub OK)
- AbilityBattleEffects(ABILITYEFFECT_SYNCHRONIZE) — nécessite E

**Files à créer/modifier** :
- `src/engine/battle/set-move-effect.ts` (nouveau, ~500 lignes 1:1)
- `src/engine/battle/cmd-niveau-1.ts` (0x16, 0x17) + `cmd-niveau-31.ts` (0x15) : appeler `SetMoveEffect` réel

#### E. `AbilityBattleEffects(caseId, battler, ability, special, moveArg)`
**Lignes décomp** : ~1500 (`battle_util.c:1080..3000`), 20+ cases
**Opcodes affectés (~25)** : Tous les opcodes qui font des checks abilities (Volt/Water Absorb, Truant, Intimidate, Synchronize, etc.)
**Cases internes** :
- ABILITYEFFECT_ON_SWITCHIN (= Intimidate, Drought, Drizzle, Sand Stream, Cloud Nine, Trace, Forecast)
- ABILITYEFFECT_ENDTURN (= Speed Boost, Shed Skin, etc.)
- ABILITYEFFECT_MOVES_BLOCK (= Soundproof, Damp)
- ABILITYEFFECT_ABSORBING (= Volt Absorb, Water Absorb, Flash Fire)
- ABILITYEFFECT_MOVE_END (= Color Change, Rough Skin, Static, Effect Spore)
- ABILITYEFFECT_IMMUNITY (= Limber, Insomnia, etc.)
- ABILITYEFFECT_FORECAST
- ABILITYEFFECT_SYNCHRONIZE
- ABILITYEFFECT_COUNT_OTHER_SIDE / COUNT_BATTLER_SIDE / CHECK_ON_FIELD / CHECK_BATTLER_SIDE
- ~10 autres

**Approche** :
- Port case-by-case (= ~75 lignes/case en moyenne).
- Dépend de E1: `RecordAbilityBattle` réel (= AI tracking).
- Dépend de E2: gBattleScripts labels existants (= via Phase 1.1 B).

**Files** :
- `src/engine/battle/ability-battle-effects.ts` (nouveau, ~1500 lignes)
- `src/engine/battle/util.ts` : exposer `AbilityBattleEffects` global
- Update tous les call-sites (= cmd-niveau-* qui utilisent stubs)

#### F. `ItemBattleEffects(caseId, battler, moveTurn)`
**Lignes décomp** : ~800 (`battle_util.c:3200..4000`)
**Opcodes affectés (~10)** : Berries trigger, Focus Band, Quick Claw, Sticky Barb, Shell Bell, Leftovers
**Approche** :
- Port case-by-case similaire à E.
- Dépend de gItemHoldEffects table (= extraite depuis decomp `data/items.h`).

**Files** :
- `src/engine/battle/item-battle-effects.ts` (nouveau, ~800 lignes)
- `src/engine/battle/data/item-hold-effects.ts` (nouveau, table extraction)

---

### Phase 1.3 — Specialised (~3-5 sessions)

Refactors et state machines spécialisées une fois Phase 1.2 done.

#### G. Memory mapping GBA → TS pour opcodes natifs N33
**Lignes** : ~150 (= extraction table + getter/setter)
**Opcodes affectés (15)** : Tous les opcodes 0x2A-0x38, 0x3B
**Approche** :
- Les opcodes natifs (`jumpifhalfword`, `addbyte`, `orword`, etc.) prennent un u32 ptr GBA absolu (= addresse mémoire EWRAM).
- Extracter le mapping `u32_addr → variable_name` depuis ELF dump du décomp linker.
- Créer un `MemoryMap` TS qui maps ces addresses à des getter/setter sur nos variables (gBattleScripting.X, gBattleMons[i].field, gStatuses3[i], etc.).
- Modifier `cmd-niveau-33.ts` pour résoudre dynamiquement.

**Files** :
- `src/engine/battle/memory-map.ts` (nouveau)
- Update `cmd-niveau-33.ts` : utiliser MemoryMap pour read/write

#### H. `Cmd_various` dispatcher (0x76)
**Lignes décomp** : ~7k chars, 35+ subcases
**Approche** :
- Switch geant sur `gBattlescriptCurrInstr[2]` (= VARIOUS_* enum).
- Beaucoup de cases dépendent de helpers Phase 1.2 (= déjà portés à ce point).
- Cases triviales : VARIOUS_CANCEL_MULTI_TURN_MOVES (✓), SET_MAGIC_COAT_TARGET, GET_MOVE_TARGET, etc.
- Cases lourdes : VARIOUS_PALACE_*, ARENA_*, PIKE_*, PYRAMID_* (= si on porte ces sous-systèmes).

**Files** :
- `src/engine/battle/cmd-niveau-34.ts` : remplacer stub par switch réel ~30 cases

#### I. `Cmd_getexp` state machine (0x23)
**Lignes décomp** : ~600 (state machine 6 cases)
**Approche** :
- State machine via `gBattleScripting.getexpState`.
- Dépend de `gExperienceTables` (= XP curves per growth rate, à extraire).
- Trigger `BattleScript_LevelUp` quand mon level up (= via gBattleScriptsForMoveEffects-like jump table).
- Trigger evolution check via `MonGetEvolutionTargetSpecies` (= helper field).

**Files** :
- `src/engine/battle/cmd-niveau-34.ts` : implémenter Cmd_getexp réel
- `src/engine/battle/data/experience-tables.ts` (nouveau)

---

### Phase 1.4 — UI battle pipeline (~5-10 sessions)

Les opcodes UI qui sont actuellement stubs no-op. Phase la plus visuelle (= testable en preview).

#### J. Party screen battle integration
- `0x50` openpartyscreen (= UI state machine ~12k chars)
- `0x51` switchhandleorder
**Dépend** : Phase 130 party screen UI déjà porté en field — bridge battle-side.

#### K. Yesno boxes + naming screen
- `0x5A` yesnoboxlearnmove
- `0x5B` yesnoboxstoplearningmove
- `0xF3` trygivecaughtmonnick
**Dépend** : naming screen scene à porter (= field side existe peut-être).

#### L. Level-up box + dex page + ball anim
- `0x6C` drawlvlupbox (= level-up stats rendering)
- `0xF2` displaydexinfo (= dex page rendering)
- `0xEF` handleballthrow (= ball throw anim + capture odds)

---

## Total estimate

| Phase | Sessions | Cumul | % strict 1:1 |
|---|---|---|---|
| Actuel | - | - | ~80% |
| 1.1 (Foundation) | 3 | 3 | ~85% |
| 1.2 (Helpers majeurs) | 7-10 | 10-13 | ~95% |
| 1.3 (Specialised) | 3-5 | 13-18 | ~98% |
| 1.4 (UI battle) | 5-10 | **18-28** | **100%** |

## Ordre recommandé (= ROI décroissant)

1. **B (jump table)** → simple, débloque 5 opcodes immédiat
2. **A (party bridge)** → débloque 8 opcodes
3. **C (gBattleStruct unifié)** → cleanup state, 0 bug 1:1
4. **D (SetMoveEffect)** → débloque secondaires de move (~50 moves affected)
5. **E (AbilityBattleEffects)** → le gros morceau (~25 opcodes touched)
6. **F (ItemBattleEffects)** → fin Phase 1.2
7. **Audit final post-1.2** → wire bytecode interpreter au gameplay
8. **Phase 1.3** : G, H, I
9. **Phase 1.4** : J, K, L (UI pipeline)

## Validation

Après Phase 1.2 (= étape "wire au gameplay") :
- Test combat Zigzagton via bytecode interpreter (= switch flag dans battle-flow.ts).
- Comparer dégâts/effets vs ROM réelle (= A/B test user-side).
- Vérifier toutes les secondaires de move marchent (Tackle, Charge, Scratch, etc.).
- Vérifier abilities passives (= Truant si on combat un Linoone qui l'a).
- Si match parfait : bytecode interpreter remplace battle-flow.ts comme source de vérité.

## Sources de vérité

- `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c` (~10000 lignes, 249 opcodes)
- `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c` (~6000 lignes, helpers)
- `D:/Projet 1/decomps/pokeemeraude/include/battle.h` (= structs BattleStruct, BattleScripting, etc.)
- `D:/Projet 1/decomps/pokeemeraude/data/battle_scripts_1.s` (~5000 lignes scripts moves)
- `D:/Projet 1/pokemon-web-demo/public/decomp/em/extracted-all/battle_script_commands.json` (= bodies extractés)

## État précédent (post audit final session 135)

- 249/249 opcodes installed (commit `2aad0a93`)
- 10 bugs 1:1 fixés via 2 audits (commits `1ea8497d`, `a058876f`, `c633f7cf`)
- 0 erreur TS dans le repo (commit `044255ee`)
- 3 fichiers auto-generated daubes supprimés (commit `51f001a8`)
- Branche : `upd2`

## Stubs documentés (= TODO 1:1 strict)

Fichiers contenant des stubs `_setMoveEffect`, `_abilityCheckOnField`, `_getItemHoldEffect`, `_recordAbilityBattle`, `_pokemonUseItemEffects`, `_isInvalidForSleepTalkOrAssist`, `_checkMoveLimitations`, `_getMoveTarget`, `_getTrainerMoneyToGive`, `_addMoney`, `_monTryLearningNewMove`, etc.

Search : `grep -rE "^function _" src/engine/battle/cmd-niveau-*.ts | head -30`
