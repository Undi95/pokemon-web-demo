---
name: Session 140 — Wire bytecode validated end-to-end
description: Bytecode interpreter → gameplay wire complete. 639/639 scripts run, bridge to battle-flow.ts behind flag, multi-turn combats validated 1:1 décomp.
type: project
---

# Session 140 — Wire bytecode → gameplay VALIDATED

**Date** : 2026-05-16 (post-compact, /loop autonomous nuit)
**Commits** : 9 sur branche `upd2`
**Branche** : `upd2`

## 🏆 Milestones

1. **Compiler bytecode fixé** (2 root cause bugs trouvés + fixés) :
   - **ENUM_X scrape manquant** : `scrapeConstants` ne lisait que `export const NAME = NUM;`. Les `export const ENUM_BattleScriptOpcode = {...}` (= format auto-extractor) n'étaient pas parsés. Conséquence : 11k+ symboles inclus B_SCR_OP_* résolvaient à 0 → TOUT le bytecode battle était `attackcanceler 0x00` répété (= infinite loop).
   - **5 macros `end` conflictantes** (battle_script=0x3D vs battle_ai_script=0x5A vs battle_anim_script=0x08 vs contest_ai_script=0x81 vs event=SCR_OP_END). Le 1er chargé alphabétiquement gagnait (= battle_ai_script.end). Fix : scope par contexte (= 1:1 décomp .include resolution).
   
2. **639/639 BattleScript_* scripts tournent sans bug runtime** (battery test exhaustif). 2 bugs auto-gen fixés en passant :
   - `Cmd_tryfaintmon: gBattleTypeFlags is not defined` → port local AdjustFriendshipOnBattleFaint.
   - `Cmd_givecaughtmon: MON_DATA_OT_NAME is not defined` → stub GiveMonToPlayer.
   - `Cmd_trysetcaughtmondexflags: FLAG_GET_SEEN is not defined` → port local GetSetPokedexFlag.

3. **Devtools bytecode** (= `scope.bytecode.*`) :
   - `dumpMons()`, `snapshot()`, `labels(prefix?)`, `listOpcodes()`, `opcode(name|hex)`, `whereAm(ctx)`
   - `runScript(label, opts)` avec `fastForward: true` (= re-call jusqu'à fin)
   - `prepareTestBattle({ moveId, enemySpecies, enemyLevel })`
   - `testMoveBridge()` (= test end-to-end du bridge)
   - `dispatchStats()`, `tracingOn()`, `recentOps()`, `lastBug()`

4. **gBattleMons init au battle start** :
   - `fillBattleMonFromParty(battlerId, source, partyIdx)` 1:1 décomp OpponentHandleGetMonData + BattleIntroDrawTrainersOrMonsSprites.
   - `fillActiveBattleMonsForBattleStart()` wrapper.
   - `CalculateMonStats(mon)` 1:1 décomp pokemon.c:1932-2017 (= base + IVs + EVs + level + nature → atk/def/spe/spa/spd/maxHP).
   - Wired dans `battle-flow.ts:LOAD_ASSETS` après setupPartyForBattle.

5. **Bridge bytecode → battle-flow.ts** (= flag-gated) :
   - `wire-bytecode-bridge.ts:runMoveScriptViaBytecode({ attacker, defender, attackerMoveIdx, ... })` :
     1. Sync HP des PokemonInstance vers gBattleMons[battlerIds].
     2. Setup gBattlerAttacker / gBattlerTarget / gCurrentMove / hitMarker / outcome / moveDmg.
     3. Lookup script offset depuis BATTLE_SCRIPTS_FOR_MOVE_EFFECTS[move.effect].
     4. Run le bytecode en fastForward (= max 200 iters, stuck protection).
     5. Sync gBattleMons HP back vers PokemonInstance.
     6. Decode gMoveResultFlags → typeMul + missed + fainted.
   - `battle-flow.ts:applyMoveDamage` check `globalThis.__USE_BYTECODE_FOR_DAMAGE__` ou `localStorage.__USE_BYTECODE_FOR_DAMAGE__ === '1'`. Si flag : route via bytecode 1:1 décomp. Sinon : keep ad-hoc formula.

## ✅ Validation runtime

**Single move POC** : Arcko Lv5 Pound → Zigzatton Lv2 = damage 6, HP 13→7, typeMul 1, missed false ✓ (= 28 opcodes dispatchés).

**Multi-turn combat** : Arcko Lv5 vs Zigzatton Lv2 via bytecode 1:1 :
- Turn 0 : Player Tackle dmg 5 → e_hp 8, Enemy Tackle dmg 3 → p_hp 17
- Turn 1 : Player Tackle dmg 5 → e_hp 3, Enemy Tackle dmg 3 → p_hp 14
- Turn 2 : Player Tackle dmg 3 → e_hp 0 = FAINT ✓

**Battery 5 scenarios** : Treecko/Torchic/Mudkip Lv5 vs wilds Lv2-3 → 5/5 PLAYER WIN en 2-3 turns. Lv50+ déclenchent disobedience (= 1:1 décomp behavior, otId=0 fait considérer mon "traded").

## 📂 Files changed

NEW (3) :
- `src/engine/battle/opcode-names.ts` (~298l) — table 1:1 décomp 249 opcodes.
- `src/engine/battle/battle-devtools.ts` (~480l) — `scope.bytecode.*` API.
- `src/engine/battle/wire-bytecode-bridge.ts` (~200l) — bridge PokemonInstance ↔ gBattleMons via runBattleScript.

MODIFIED :
- `scripts/compile-decomp-bytecode.mjs` (+122 lignes) — ENUM_X scrape + macro context scoping.
- `src/engine/battle/script-interpreter.ts` (+99 lignes) — stats/tracing/lastBug exports.
- `src/engine/battle/party-storage.ts` (+232 lignes) — fillBattleMonFromParty + CalculateMonStats.
- `src/engine/battle/cmd-niveau-1.ts` (+42 lignes) — local AdjustFriendshipOnBattleFaint.
- `src/engine/battle/cmd-niveau-27.ts` (+30 lignes) — local GetSetPokedexFlag.
- `src/engine/battle/cmd-niveau-31.ts` (+8 lignes) — stub GiveMonToPlayer.
- `src/engine/battle-flow.ts` (+30 lignes) — wire bytecode behind flag.
- `src/engine/dev-scope.ts` (+13 lignes) — install scope.bytecode.

AUTOGEN :
- 474 `*-bytecode.ts` files regenerated (= post compiler fixes, 587K bytes au lieu de 80K).

## 🎯 Critère succès atteint

Plan original `WIRE-BYTECODE-TO-GAMEPLAY-PLAN.md` :
- ✅ Step 0 sanity check : gBattleMons init OK.
- ✅ Step 1 POC single opcode : tracé via devtools.
- ✅ Step 2 Hello-world bytecode : runScript('BattleScript_EffectHit') marche.
- ✅ Step 3 Wire au gameplay : applyMoveDamage route via bytecode si flag set.
- 🟡 Step 4 UI tick controllers : differé (= Phase 1.4 J/K/L, ~28 STUBs).
- 🟡 Step 5 Cleanup battle-flow.ts ad-hoc : differé (= keep fallback pour tutorial robuste).

## 🚀 Activation gameplay

Pour utiliser le bytecode en combat :
```js
localStorage.__USE_BYTECODE_FOR_DAMAGE__ = '1';
// puis reload page → next combat use bytecode 1:1 décomp.
```

Ou sans reload :
```js
window.__USE_BYTECODE_FOR_DAMAGE__ = true;
```

## ⚠️ Limites connues

1. **Lv50+ disobedience** : mons sans badges (= otId=0) trigger disobedience check. Comportement 1:1 décomp attendu. Pour test : set badges via FlagSet ou bridge otId = playerTrainerId.

2. **STUB UI controllers** : ~28 stubs dans battle-controllers.ts. Pendant le bytecode run, attackstring/attackanimation/healthbarupdate/etc. ne s'affichent pas. Le combat tourne quand même (= state propre) mais sans visuels.

3. **Status moves / stat stages** : pas encore sync'd back à PokemonInstance (= seulement HP/PP). Si bytecode set status1 = BURN sur defender, ça reste dans gBattleMons mais pas dans PokemonInstance.status. À implémenter Phase 1.4.

4. **Battle Frontier** (13 STUBs Cmd_various) : différé post-Phase 1.

## 📋 Pour la prochaine session

1. Soit continuer Phase 1.4 UI controllers (= wire BtlController_Emit* aux vrais frame callbacks).
2. Soit étendre le sync bytecode → PokemonInstance (status1, statStages, ability changes).
3. Soit tester le wire flag-gated en combat réel via overworld + Birch (= besoin walk to Route 101).
4. Soit améliorer createPokemonInstance pour générer le bon learnset selon level.

File complet ici. Lire en priorité post-compact.
