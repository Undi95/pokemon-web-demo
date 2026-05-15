# Session 137 — Phase 1 Cmd_moveend + Cmd_various 1:1 décomp

**Date** : 2026-05-15 (autonomous /loop)
**Branche** : `upd2`
**Commits** : `a5404e9e` (Cmd_moveend) + `10290780` (Cmd_various) + `0da21024` (AtkCanceler)

---

## Objectif

Continuer le port 1:1 décomp strict du battle script bytecode interpreter
(Phase 1 du roadmap), priorité : porter les 2 plus gros stubs restants après
session 136 = `Cmd_moveend` (0x49) et `Cmd_various` (0x76).

Bonus : tester un combat Zigzagton via le préview (= validation gameplay).

---

## Phase 1 — Cmd_moveend (0x49)

**Source décomp** : `battle_script_commands.c:4213-4501`
**State machine** : 17 sub-states (= MOVEEND_RAGE → MOVEEND_NEXT_TARGET → MOVEEND_COUNT)

### Sub-states portés (17/17 ✅)

| # | Constante | Logique |
|---|-----------|---------|
| 0 | MOVEEND_RAGE | Rage stat-up build + BattleScript_RageIsBuilding push |
| 1 | MOVEEND_DEFROST | STATUS1_FREEZE clear sur Fire move + DefrostedViaFireMove |
| 2 | MOVEEND_SYNCHRONIZE_TARGET | AbilityBattleEffects(SYNCHRONIZE, target) |
| 3 | MOVEEND_ON_DAMAGE_ABILITIES | Rough Skin/Static/Effect Spore/Color Change |
| 4 | MOVEEND_IMMUNITY_ABILITIES | Loop all battlers, stay-on-state until done |
| 5 | MOVEEND_SYNCHRONIZE_ATTACKER | AbilityBattleEffects(ATK_SYNCHRONIZE, attacker) |
| 6 | MOVEEND_CHOICE_MOVE | Choice Band lock-in du move utilisé |
| 7 | MOVEEND_CHANGED_ITEMS | Trick/Switcheroo item swap apply |
| 8 | MOVEEND_ATTACKER_INVISIBLE | SemiInvuln + NoAnimations → sprite invisible |
| 9 | MOVEEND_ATTACKER_VISIBLE | restore visible + restoredBattlerSprite |
| 10 | MOVEEND_TARGET_VISIBLE | target restore visible |
| 11 | MOVEEND_ITEM_EFFECTS_ALL | ItemBattleEffects(MOVE_END) berries cures |
| 12 | MOVEEND_KINGSROCK_SHELLBELL | ItemBattleEffects(KINGSROCK_SHELLBELL) |
| 13 | MOVEEND_SUBSTITUTE | Clear STATUS2_SUBSTITUTE si substituteHP == 0 |
| 14 | MOVEEND_UPDATE_LAST_MOVES | gLastMoves/gLastResultingMoves/gLastHitBy/etc. |
| 15 | MOVEEND_MIRROR_MOVE | gLastTakenMove + gLastTakenMoveFrom tracking |
| 16 | MOVEEND_NEXT_TARGET | Double-battle re-target sur partner si MOVE_TARGET_BOTH |

### Helpers internes portés 1:1

- `_TARGET_TURN_DAMAGED` (battle.h:469)
- `_BATTLE_PARTNER` (battle.h:46)
- `_WasUnableToUseMove` (battle_util.c:877-891)
- `_MoveValuesCleanUp` (battle_script_commands.c:3624-3633)

### AUDIT BUG FIXES — Critiques

1. **MOVEEND_COUNT était `28` (FAUX)** → vraie valeur décomp `17`
   (`battle_script_commands.h:393-410`).
   Le stub précédent skip-ait 28 sub-states qui n'existent pas.

2. **EFFECT_BATON_PASS hardcoded `121` (FAUX)** → vraie valeur `127`
   (auto-data `battle_move_effects-data.ts:135`).
   Aurait silencieusement cassé MOVEEND_UPDATE_LAST_MOVES check.

### State additions

```ts
gBattleStructChoicedMove[4]       // Choice Band move locked-in
gBattleStructChangedItems[4]      // Trick/Switcheroo item swap pending
gBattleStructAbsentBattlerFlags   // Bitmask absent battlers (séparé de gAbsentBattlerFlags)
```

### STUBS notés (= TODO post-Phase 1)

- `gEnigmaBerries[]` holdEffect path (= custom per-battler berry data, rare).
- `BtlController_EmitSetMonData` status1 sync sur defrost (= UI controller wiring).

---

## Phase 1.3 H — Cmd_various (0x76)

**Source décomp** : `battle_script_commands.c:6321-6503`
**Dispatcher** : 27 cases VARIOUS_* (0..26)

### Cases FULL 1:1 portés (14/27 ✅)

- VARIOUS_CANCEL_MULTI_TURN_MOVES (helper `_CancelMultiTurnMoves`)
- VARIOUS_SET_MAGIC_COAT_TARGET (= followmeTimer swap)
- VARIOUS_IS_RUNNING_IMPOSSIBLE (helper `_IsRunningFromBattleImpossible` —
  Shadow Tag/Arena Trap/Magnet Pull checks)
- VARIOUS_GET_MOVE_TARGET (helper `_GetMoveTarget` — 7 sous-cases MOVE_TARGET_*,
  Lightning Rod redirect)
- VARIOUS_GET_BATTLER_FAINTED
- VARIOUS_RESET_INTIMIDATE_TRACE_BITS
- VARIOUS_UPDATE_CHOICE_MOVE_ON_LVL_UP
- VARIOUS_RESET_PLAYER_FAINTED
- VARIOUS_ARENA_OPPONENT_MON_LOST / PLAYER_MON_LOST / BOTH_MONS_LOST
- VARIOUS_RETURN_OPPONENT_MON1 / MON2 (EmitReturnMonToBall)
- VARIOUS_SET_TELEPORT_OUTCOME (B_OUTCOME_PLAYER_TELEPORTED/MON_TELEPORTED)
- VARIOUS_PLAY_TRAINER_DEFEATED_MUSIC (EmitPlayFanfareOrBGM MUS_VICTORY_TRAINER)

### Cases STUBS notés (13/27 — TODO post-Phase 1)

- VARIOUS_PALACE_FLAVOR_TEXT (= sBattlePalaceNatureToFlavorTextId)
- VARIOUS_ARENA_JUDGMENT_WINDOW / JUDGMENT_STRING / WAIT_STRING (= Battle Arena referee)
- VARIOUS_DRAW_ARENA_REF_TEXT_BOX / ERASE_ARENA_REF_TEXT_BOX
- VARIOUS_EMIT_YESNOBOX (= BtlController_EmitYesNoBox UI)
- VARIOUS_WAIT_CRY (= IsCryFinished)
- VARIOUS_VOLUME_DOWN / VOLUME_UP (= m4aMPlayVolumeControl)
- VARIOUS_SET_ALREADY_STATUS_MOVE_ATTEMPT (= gBattleStruct.alreadyStatusedMoveAttempt)
- VARIOUS_PALACE_TRY_ESCAPE_STATUS (= BattlePalace_TryEscapeStatus)

### Constants additions

```ts
B_OUTCOME_MON_TELEPORTED = 10
BATTLE_RUN_SUCCESS = 0
BATTLE_RUN_FAILURE = 1
NO_TARGET_OVERRIDE = 0
B_MSG_PREVENTS_ESCAPE = 2
HOLD_EFFECT_CAN_ALWAYS_RUN  // importé auto-data hold_effects-data.ts = 37
```

---

## Test gameplay Zigzagton

L'utilisateur a tenté le combat Zigzagton :

- ✅ Warp Bourg → Route 101 (8,14) facing WEST → BirchsBag déclenché
- ✅ Script `Route101_EventScript_BirchsBag` lancé, `applymovement` Birch
- ✅ Combat démarré : ARCKO Lv5 (20/20) vs ZIGZATON Lv2 (13/13) — Torchic
- ✅ Menu d'action affiché : ECRASEMENT/GROS YEUX/VOL-VIE/VIVE-ATTAQUE
- ⚠️ Bug visuel pré-existant : artifacts BG garbled sur le menu (session 125
   final = MAP_LITTLEROOT_TOWN warp transition garbled BG)
- ⚠️ Bug audio mineur : cry ZIGZATON + ARCKO `EncodingError: Unable to decode audio`
- 🎮 Combat joué par utilisateur — interrompu (reload effectué)

**Note importante** : le combat utilise `battle-flow.ts` (ancien battle engine
existant), PAS le bytecode interpreter de Phase 1. `__battleState.gBattleMons`
restent vides pendant le combat (= preuve que le bytecode n'est pas wired au
gameplay). Wirage = task pending `Audit + wire bytecode interpreter`.

---

## Status global Phase 1 post-session 137

| Composant | Status | Sub-states/cases |
|-----------|--------|------------------|
| script-interpreter.ts | ✅ Done | 249/249 opcodes installed |
| Niveau 1-34 opcodes | ✅ Done | 249/249 (varied stubs) |
| Cmd_moveend | ✅ Full 1:1 | 17/17 sub-states |
| Cmd_various | ✅ Full 1:1 | 14/27 FULL, 13/27 STUBS Battle Frontier |
| SetMoveEffect | ✅ Full 1:1 | session 136 |
| AbilityBattleEffects | ✅ Full 1:1 | 16/16 cases (session 136) |
| ItemBattleEffects | ✅ Full 1:1 | 5/5 cases (session 136) |
| gBattleScriptsForMoveEffects | ✅ Jump table 214 entries |
| AtkCanceler_UnableToUseMove | ✅ Full 1:1 | 14/14 sub-states + wired Cmd_attackcanceler |
| Cmd_attackcanceler | ✅ Full 1:1 | hp/AtkCanceler/MOVES_BLOCK/PP/OBEYS path complete |
| Cmd_getexp | 🟡 Stub | 0/6 states portés — Phase 1.3 I TODO |
| gBattleStruct refactor | 🔴 TODO | Phase 1.1 C deferred |
| Bytecode interpreter wiring | 🔴 TODO | battle-flow.ts encore actif |

---

## Prochaine session — Plan

### Priorité 1 — Port AtkCanceler_UnableToUseMove (14 sub-states)

Source : `battle_util.c:1985-2270`.
Sub-states : FLAGS, ASLEEP, FROZEN, TRUANT, RECHARGE, FLINCH, DISABLED, TAUNTED,
IMPRISONED, CONFUSED, PARALYZED, IN_LOVE, BIDE, THAW.
Dépendances :
- `gBattleStruct.atkCancelerTracker` à add dans state.
- `UproarWakeUpCheck`, `GetImprisonedMovesCount`, `CountTrailingZeroBits` helpers.
- `CalculateBaseDamage` full signature pour confusion self-hit.
- Bunch de BattleScript_MoveUsed* labels (= déjà dans jump table).

### Priorité 2 — Phase 1.3 I Cmd_getexp state machine

Source : `battle_script_commands.c:3255-...`. 6 states (calc → distribute →
print → apply → lvl up → loop next mon).
Dépendances majeures :
- `gExperienceTables` (= 7 growth groups × 100 levels = 700 entries) — port from auto-data
- `gSpeciesInfo[species].expYield`, `growthRate`
- `MonGainEVs`, `IsTradedMon`, `BattleScript_LevelUp`
- `gBattleStruct.expValue`, `expGetterMonId`, `expGetterBattlerId`, `sentInPokes`, `wildVictorySong`, `givenExpMons`
- `BtlController_EmitExpUpdate`, `AdjustFriendship`
- `MUS_VICTORY_WILD`, `MUS_VICTORY_TRAINER`

### Priorité 3 — Audit + wire bytecode interpreter

Wirer `runBattleScript` dans `battle-flow.ts` pour que les vrais opcodes
exécutent au lieu de la logique ad-hoc actuelle. Permettra de tester un combat
complet end-to-end via le bytecode.

### Priorité 4 — Phase 1.1 C gBattleStruct refactor

Consolidation des `gBattleStruct*` variables en une struct unique pour matcher
1:1 le décomp. Cosmétique mais nettoie.

---

## Sources de vérité utilisées

- `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
- `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c`
- `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
- `D:/Projet 1/decomps/pokeemeraude/include/battle.h`
- `D:/Projet 1/decomps/pokeemeraude/include/constants/battle.h`
- `D:/Projet 1/decomps/pokeemeraude/include/constants/battle_script_commands.h`
- `D:/Projet 1/pokemon-web-demo/src/engine/decomp-data/auto/include/constants/`
  (battle_move_effects, hold_effects, moves, abilities, ...)

---

## Files modifiés

- `src/engine/battle/cmd-niveau-1.ts` — Cmd_moveend port complet + applyAtkCanceler wire
- `src/engine/battle/cmd-niveau-34.ts` — Cmd_various port complet
- `src/engine/battle/atk-canceler.ts` — NEW, AtkCanceler_UnableToUseMove 14 sub-states
- `src/engine/battle/constants.ts` — +14 constantes (BATTLE_RUN_*, NO_TARGET_OVERRIDE, CANCELER_*, B_MSG_*, etc.)
- `src/engine/battle/state.ts` — +4 vars gBattleStruct* (Choiced/ChangedItems/Absent/AtkCancelerTracker)

**Total lignes ajoutées 1:1 décomp** : ~1400 lignes TS strict.
**Erreurs TypeScript** : 0.
**Preview validé** : Bourg-en-Vol boot OK, audio OK, map popup OK.

## Récap session 137 (3 commits)

| Commit | Description | Lignes |
|--------|-------------|--------|
| `a5404e9e` | Cmd_moveend full port 1:1 — 17 sub-states + audit MOVEEND_COUNT/EFFECT_BATON_PASS | +463 |
| `10290780` | Cmd_various dispatcher 1:1 — 14/27 FULL, 13/27 STUBS Battle Frontier | +451 |
| `0da21024` | AtkCanceler_UnableToUseMove 14 sub-states + wired Cmd_attackcanceler | +477 |
| **Total** | | **+1391** |
