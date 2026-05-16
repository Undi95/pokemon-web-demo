# Wire Bytecode au Gameplay — Plan + Risques Connus

**Date** : 2026-05-16 (post session 139, 42 commits)
**Objectif** : Transitionner `battle-flow.ts` (~1056l state machine ad-hoc qui
marche pour Zigzagton tutorial) vers le bytecode interpreter `runBattleScript`
(= 249 opcodes 1:1 décomp dispo, ~78% FULL strict).

## ⚠️ Risques connus (= ne va PAS marcher du premier coup)

### Bloquants potentiels — UI

1. **BtlController_Emit* stubs no-op** — battle-controllers.ts a ~28 STUBs (anim
   moves, hit anim, health bar update, faint anim, status icon, party UI, etc.).
   Quand le bytecode appelle `BtlController_EmitHealthBarUpdate`, rien ne se
   passe visuellement. **Impact** : combat invisible (= text dialog rien, sprite
   immobile). MAIS la logique bytecode tourne quand même.

2. **Text placeholders manquants** — `PrepareStringBattle`, `BattlePutTextOnWindow`
   sont stubs. Le combat se déroule sans aucun text affiché.

3. **JOY_NEW stub** — `Cmd_yesnobox` (0x67) attend input A/B/UP/DOWN. Si le user
   doit confirmer un "Use {move}?", il faut JOY_NEW wired aux vrais events.

### Bloquants potentiels — State

4. **gBattleMons[0]/[1] init** — Le bytecode lit `gBattleMons[gBattlerAttacker].stat`
   etc. partout. Si l'init au début du combat ne remplit pas correctement (= via
   `battle-flow.ts:SPAWN_SPRITES` actuel), tout est 0 et formula damage = 0.
   **Check** : `gBattleMons[0].species/level/maxHP/hp/attack/defense/speed/spAttack
   /spDefense/moves[]/pp[]/type1/type2/ability/item` tous bien set ?

5. **gActiveBattler timing** — Beaucoup d'opcodes font `setActiveBattler(X)` puis
   `BtlController_EmitY(...)` puis `MarkBattlerForControllerExec(X)`. Si le
   controller ne tick pas immédiatement, `gBattleControllerExecFlags` reste set
   et la prochaine instruction stay-on-opcode infinie loop.

6. **gChosenMoveByBattler[]** — Le bytecode lit ce que le user a choisi via cet
   array. Notre `battle-flow.ts` actuel a sa propre state machine (= state
   `MOVE_MENU_INPUT`). Quand on transition à bytecode, faut écrire dans
   `gChosenMoveByBattler[0] = selectedMove` au choix user.

7. **gCurrentActionFuncId loop** — Le bytecode interpreter loop sur les actions
   via `gCurrentActionFuncId`. Si on n'init pas correctement à
   `B_ACTION_USE_MOVE` après input, ça ne démarre pas.

8. **gBattlerByTurnOrder[]** — Speed-based turn order. Le décomp calcule via
   `SetActionsAndBattlersTurnOrder()` (= helper qu'on n'a pas porté en TS).
   Sans ça, l'ordre est aléatoire et le combat plante.

### Risques secondaires — Helpers FULL pas testés end-to-end

9. **42 commits de helpers FULL portés** — Tous compilent OK, tous 1:1 décomp,
   mais ZÉRO test runtime. Pattern probable : 1-2 helpers ont des bugs subtils
   (= off-by-one, sign extension u8/s8, mauvais order des operations) qu'on ne
   détectera qu'en running un combat.

10. **Helpers cross-dépendants** — Quand `Cmd_attackcanceler` appelle
    `AtkCanceler_UnableToUseMove` qui appelle `IsMonDisobedient` qui appelle
    `_FlagGet`, n'importe quel maillon faible casse la chaîne.

## 🛠️ Plan de wire incrémental

### Step 0 — Sanity check préparatoire

Avant tout, vérifier que :
- `gBattleMons[0]/[1]` se remplissent bien au battle setup (= via
  `battle-flow.ts:LOAD_ASSETS`).
- `gBattlersCount = 2` set.
- `gBattlerAttacker = 0` / `gBattlerTarget = 1` set au début turn player.

### Step 1 — POC tout petit : exécuter UN seul opcode via bytecode

Hooker un `window.scope.runOpcode('Cmd_X')` qui exécute juste cet opcode et
return le state changes. Permettra de valider chaque helper séparément.

### Step 2 — Hello-world bytecode

Run `runBattleScript(setupBattleScriptContext('BattleScript_EffectHit'))` après
le choix du move user. Comparer le résultat avec ce que `battle-flow.ts` fait
actuellement (= via devtools `window.scope.battle.snapshot()`).

Cible : Zigzagton vs Poussifeu, Charge sur Zigzagton.
- Attendu : damage calc correct, target hp décrémenté.
- Risques : substitute fade, miss/crit branches.

### Step 3 — Wire au gameplay réel

Dans `battle-flow.ts:PLAYER_USES_MOVE`, au lieu de calc damage ad-hoc :
1. Set `gCurrentMove = chosenMove`
2. Set `gChosenMove = chosenMove`
3. Set `gBattlerAttacker = 0`, `gBattlerTarget = 1`
4. Lookup script offset depuis `gBattleScriptsForMoveEffects[move.effect]`
5. Call `runBattleScript(setupBattleScriptContext(offset))`
6. Check `gBattleMoveDamage` + apply to gameState.party

### Step 4 — Switch UI tick au bytecode

Brancher `BtlController_Emit*` aux vrais frame callbacks (anim sprite, text
print, etc.). Probablement à faire incrémentalement par feature visuelle.

### Step 5 — Cleanup `battle-flow.ts`

Une fois tout passe via bytecode, supprimer la state machine ad-hoc. Garder
seulement le scene management (= SPAWN_SPRITES, INTRO, CLEANUP, FADE).

## 🔧 Devtools dispo pour debugger

Déjà wirés (session 133+) :
- `window.scope.battle` — accès direct gameState
- `window.scope.snapshot()` — full state dump
- `window.scope.where()` — current map info
- `window.scope.party` — player party
- `window.scope.dialog` — current text
- `window.scope.fade` — fade state
- `window.scope.observe(fn, ms)` — poll a fn at interval

À ajouter pour le wire :
- `window.scope.bytecode.runOpcode(name, args)` — POC single opcode test
- `window.scope.bytecode.runScript(label)` — Full script run
- `window.scope.battle.dumpMons()` — gBattleMons[0..3] complete state
- `window.scope.battle.dispatchStats()` — Combien d'opcodes appelés, par name
- `window.scope.battle.lastBugAt()` — Catch first uncaught exception

## 📂 Points d'entrée critiques

### Pour le wire

- `src/engine/battle-flow.ts:152-172` — `type State` (= 25 ad-hoc states)
- `src/engine/battle-flow.ts:730+` — Case `PLAYER_USES_MOVE` (= ad-hoc damage calc)
- `src/engine/battle/script-interpreter.ts:runBattleScript()` — Le runner
- `src/engine/battle/script-interpreter.ts:setupBattleScriptContext()` — Context init
- `src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_1-jump-table.ts` —
  `gBattleScriptsForMoveEffects[effect] → offset`

### Pour les helpers cassants

- `src/engine/battle/atk-canceler.ts` — 14 sub-states status checks
- `src/engine/battle/disobedience.ts` — IsMonDisobedient
- `src/engine/battle/damage-calc.ts` — CalculateBaseDamage
- `src/engine/battle/handle-action.ts` — HandleAction_UseMove (= turn dispatch)
- `src/engine/battle/set-move-effect.ts` — SetMoveEffect (= secondary effects)

## 📋 Checklist avant wire

- [ ] Read battle-flow.ts complete (= 1056l)
- [ ] Map les states ad-hoc → opcodes équivalent dans bytecode
- [ ] Identifier les hooks UI que battle-flow.ts utilise actuellement
- [ ] Lister les vars que battle-flow.ts écrit vs ce que bytecode attend
- [ ] Ajouter les devtools bytecode (`runOpcode`, `runScript`, `dumpMons`)
- [ ] Faire un POC mode : flag `__USE_BYTECODE__` qui switch entre les 2 modes
- [ ] Wire incrémental : 1 effect (EFFECT_HIT) puis 1 autre, etc.

## 🎯 Critère de succès

Combat Zigzagton de tutorial via bytecode :
1. Player choisit CHARGE (= EFFECT_HIT, l'opcode `seteffectprimary` set
   STAT_ATK +1).
2. Bytecode tourne `BattleScript_EffectStatUp`.
3. Stat stage attaque player passe 0 → +1.
4. Turn opponent : Zigzagton choisit son move.
5. Bytecode tourne `BattleScript_EffectHit`.
6. Damage calc correct ± 1 HP (= 1:1 ROM).
7. Combat se termine WIN après 2-3 turns.

Si ça passe → wire COMPLETE pour les moves simples. Les moves complexes (= multi-hit,
status, weather) viendront ensuite.

## 🚨 Notes critiques

- **Session 138** (autonomous nuit) a porté beaucoup de stubs. Tous compilent
  mais runtime untested.
- **Session 139** (= ce matin) a finalisé Phase 1.1 C + Phase 1.3 G + ~10
  helpers FULL post-audit. 0 bug trouvé.
- **L'audit 249 opcodes a confirmé 0 bug 1:1 décomp** dans le code. Les bugs
  potentiels seront donc dans le wirage (= boundaries entre modules) ou dans
  des edge cases pas couverts.

## Pour la prochaine session post-compact

1. Lire ce file en priorité.
2. Décider : continuer avec wire incrémental Step 1-3 (= recommandé) ou
   approche alternative (= rewriter battle-flow.ts en gardant ad-hoc state
   machine + appeler bytecode pour subset of effects).
3. Setup les devtools bytecode AVANT de wire (= meilleur ROI debugging).
4. Tester chaque step en preview, pas trop avant de fix les obvious breaks.
