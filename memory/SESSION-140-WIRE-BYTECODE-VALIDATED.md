---
name: Session 140 — Wire bytecode validated end-to-end
description: Bytecode interpreter → gameplay wire COMPLETE. 639/639 scripts run, bridge to battle-flow.ts behind flag, multi-turn combats validated 1:1 décomp, all helpers ported.
type: project
---

# Session 140 — Wire bytecode → gameplay COMPLETE

**Date** : 2026-05-16 (post-compact, /loop autonomous nuit)
**Commits** : 16 sur branche `upd2`
**Branche** : `upd2`

## 🏆 Milestones

1. **Compiler bytecode fixé** (2 root cause bugs trouvés + fixés) — commit `cc20a935` :
   - **ENUM_X scrape manquant** : `scrapeConstants` ne lisait que `export const NAME = NUM;`. Les `export const ENUM_BattleScriptOpcode = {...}` (= format auto-extractor) n'étaient pas parsés. Conséquence : 11k+ symboles inclus B_SCR_OP_* résolvaient à 0 → TOUT le bytecode battle était `attackcanceler 0x00` répété (= infinite loop).
   - **5 macros `end` conflictantes** (battle_script=0x3D vs battle_ai_script=0x5A vs battle_anim_script=0x08 vs contest_ai_script=0x81 vs event=SCR_OP_END). Le 1er chargé alphabétiquement gagnait. Fix : scope par contexte (= 1:1 décomp .include resolution).

2. **639/639 BattleScript_* scripts tournent sans bug runtime** (battery test exhaustif). 3 bugs auto-gen fixés en passant :
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
     2. Setup gBattlerAttacker / gBattlerTarget / gCurrentMove / hitMarker / outcome / moveDmg / critMultiplier / actionFuncId.
     3. Lookup script offset depuis BATTLE_SCRIPTS_FOR_MOVE_EFFECTS[move.effect].
     4. Run le bytecode en fastForward (= max 200 iters, stuck protection).
     5. Sync gBattleMons HP back vers PokemonInstance.
     6. Sync status1 back (= _decodeStatus1 inverse mapping STATUS1_* → PSN/BRN/etc.).
     7. Decode gMoveResultFlags → typeMul + missed + fainted.
   - `battle-flow.ts:applyMoveDamage` check `globalThis.__USE_BYTECODE_FOR_DAMAGE__` ou `localStorage.__USE_BYTECODE_FOR_DAMAGE__ === '1'`. Si flag : route via bytecode 1:1 décomp. Sinon : keep ad-hoc formula.

6. **Helpers 1:1 décomp ported** :
   - `AdjustFriendship(mon, event)` (pokemon.c:5901-5973) — inclut _SFRIENDSHIP_EVENT_MODIFIERS table 9×3.
   - `MonGainEVs(mon, defeatedSpeciesEnum)` (pokemon.c:5975-6052) — caps 510/255.
   - `CalculatePlayerPartyCount` / `CalculateEnemyPartyCount` (pokemon.c:7011) — scan party.
   - `pickLevelUpMoves` fixé pour utiliser `getLevelUpLearnset` 1:1 décomp (= avant fallback `[tackle, growl]` partout).

7. **otId bridge fix** : `pokemonInstanceToPokemon.otId = globalThis.gameState.trainerId`. Avant : otId=0 → IsOtherTrainer toujours true → Lv50+ trigger disobedience (= jump BattleScript_IgnoresAndFallsAsleep). Maintenant : mons player-caught → obey.

8. **Load game-data au boot** (= main.ts) : avant __game_data set seulement à battle-flow.ts:LOAD_ASSETS (= 1er combat). Maintenant le boot charge tout. Permet à `pickLevelUpMoves` et autres bridges de fonctionner avant le 1er combat.

9. **_resolveMoveId multi-word fix** : dexId 'blazekick' (= concat lowercase) → utilise Dex.moves.get(dexId).name → 'Blaze Kick' → 'MOVE_BLAZE_KICK' → numeric id. Avant : MOVE_BLAZEKICK (= no underscore) → unresolved → id 0 → move skip. Maintenant : tous les moves multi-word fonctionnent.

## ✅ Validation runtime

**Single move POC** : Arcko Lv5 Pound → Zigzatton Lv2 = damage 6, HP 13→7, typeMul 1, missed false ✓ (= 28 opcodes dispatchés).

**Multi-turn combat** : Arcko Lv5 vs Zigzatton Lv2 via bytecode 1:1 :
- Turn 0 : Player Tackle dmg 5 → e_hp 8, Enemy Tackle dmg 3 → p_hp 17
- Turn 1 : Player Tackle dmg 5 → e_hp 3, Enemy Tackle dmg 3 → p_hp 14
- Turn 2 : Player Tackle dmg 3 → e_hp 0 = FAINT ✓

**Battery 5 scenarios Lv5** : Treecko/Torchic/Mudkip vs wilds Lv2-3 → 5/5 PLAYER WIN en 2-3 turns. Lv50+ déclenchent disobedience (= 1:1 décomp behavior, fix avec otId bridge).

**Combat Lv50 avec real moves** (post pickLevelUpMoves + Dex resolveMoveId fix) :
- Blaziken Lv50 Blaze Kick vs Sceptile Lv50 = 130 damage OHKO en 1 turn (Fire STAB + super eff vs Grass) ✓
- Charizard Lv50 Flamethrower vs Blastoise Lv50 :
- Turn 0 : Flamethrower 30 dmg + Rapid Spin 0 dmg
- Turn 1 : Flamethrower 62 dmg (crit)
- Turn 2 : Flamethrower 32 dmg
- Turn 3 : Flamethrower 25 dmg → BLASTOISE FAINTED ✓

**Damage variance** : 30 runs Treecko Tackle = min 4, max 11, avg 5.5, distribution {4: 3, 5: 18, 6: 7, 10: 1, 11: 1}. 1:1 décomp gen 3 formula : 85-100% × base + crits (= 2 × 5.5).

## 📂 Files changed

NEW (3) :
- `src/engine/battle/opcode-names.ts` (~298l) — table 1:1 décomp 249 opcodes.
- `src/engine/battle/battle-devtools.ts` (~480l) — `scope.bytecode.*` API.
- `src/engine/battle/wire-bytecode-bridge.ts` (~220l) — bridge PokemonInstance ↔ gBattleMons via runBattleScript.

MODIFIED :
- `scripts/compile-decomp-bytecode.mjs` (+141 lignes) — ENUM_X scrape + macro context scoping + preserve hand-curated files.
- `src/engine/battle/script-interpreter.ts` (+99 lignes) — stats/tracing/lastBug exports.
- `src/engine/battle/party-storage.ts` (+~350 lignes) — fillBattleMonFromParty + CalculateMonStats + AdjustFriendship + MonGainEVs + CalculatePlayerPartyCount + bridge otId.
- `src/engine/battle/cmd-niveau-1.ts` (+42 lignes) — local AdjustFriendshipOnBattleFaint + wire AdjustFriendship.
- `src/engine/battle/cmd-niveau-27.ts` (+30 lignes) — local GetSetPokedexFlag.
- `src/engine/battle/cmd-niveau-31.ts` (+8 lignes) — stub GiveMonToPlayer.
- `src/engine/battle/cmd-niveau-32.ts` (+5 lignes) — wire CalculatePlayerPartyCount.
- `src/engine/battle-flow.ts` (+30 lignes) — wire bytecode behind flag.
- `src/engine/dev-scope.ts` (+13 lignes) — install scope.bytecode.
- `src/engine/pokemon.ts` (+28 lignes) — pickLevelUpMoves 1:1 décomp.

AUTOGEN :
- 474 `*-bytecode.ts` files regenerated (= post compiler fixes, 589K bytes au lieu de 80K).

## 🎯 Critère succès atteint

Plan original `WIRE-BYTECODE-TO-GAMEPLAY-PLAN.md` :
- ✅ Step 0 sanity check : gBattleMons init OK.
- ✅ Step 1 POC single opcode : tracé via devtools.
- ✅ Step 2 Hello-world bytecode : runScript('BattleScript_EffectHit') marche.
- ✅ Step 3 Wire au gameplay : applyMoveDamage route via bytecode si flag set.
- 🟡 Step 4 UI tick controllers : differé (= Phase 1.4 J/K/L, 23 STUBs BtlController_Emit*).
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

1. **STUB UI controllers** : 23 stubs dans battle-controllers.ts. Pendant le bytecode run, attackstring/attackanimation/healthbarupdate/etc. ne s'affichent pas. Le combat tourne quand même (= state propre) mais sans visuels. Phase 1.4 J/K/L.

2. **Status moves / stat stages persistence** : status1 sync OK (BURN/PSN/PAR/SLP/FRZ). statStages restent dans gBattleMons[X].statStages entre les turns du combat (= correct), pas sync à PokemonInstance (= reset à la fin du combat, comme 1:1 décomp).

3. **Battle Frontier** (13 STUBs Cmd_various) : différé post-Phase 1.

4. **Weather overworld** : `_getCurrentWeather()` retourne WEATHER_NONE. À bridger si météo overworld implémentée (= rare, post-Phase 1).

5. **Hold effects items** : MACHO_BRACE 2x EVs, FRIENDSHIP_UP +50%, LUXURY_BALL +1 friendship : TODO Phase 1 ports d'items.

## 📋 Pour la prochaine session

1. **Phase 1.4 UI controllers** : wire les 23 BtlController_Emit* aux vrais frame callbacks (= rendering, animations, text). Permet le bytecode wire de fonctionner visuellement en combat real.

2. **Test combat réel via flag** : activer `__USE_BYTECODE_FOR_DAMAGE__ = true` + lancer le combat tutoriel Birch via overworld (= walk to Route 101 + scripted battle). Verify visual outcome 1:1 ROM.

3. **Port AI scripts** : actuellement enemy use moves[0] (= dumb). Pour vrai battle AI, port les ~13 AI scripts (battle_ai_script_commands).

4. **Sync ability changes** : si bytecode set gBattleMons[X].ability = SOMETHING (= Trace, Skill Swap, etc.), sync back to PokemonInstance.ability.

5. **Items effects in battle** : ITEMEFFECT_ON_SWITCH_IN partiellement portée. Tester avec attackerMon.heldItem set.

File complet ici. Lire en priorité post-compact.
