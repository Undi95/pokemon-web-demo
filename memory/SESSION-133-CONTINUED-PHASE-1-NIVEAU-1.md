# Session 133 continued — Phase 1 Niveau 1 START (2026-05-15)

## TL;DR

Suite session 133 (devtools), commit `79d5daa6` pose les fondations 1:1 décomp pour le battle script interpreter Phase 1 (= roadmap Qwen).

## Done cette session (post commit devtools)

### 1. `src/engine/battle/state.ts` (NEW, ~190 lignes)

Porte les ewram vars 1:1 décomp `battle_main.c:160-250` :
- `gBattleMons[4]` : array `BattlePokemon` (= struct défini dans script-interpreter.ts)
- `gBattlerAttacker`, `gBattlerTarget`, `gActiveBattler`, `gEffectBattler`, `gBattlerFainted`, `gPotentialItemEffectBattler`
- `gBattlersCount` (= 2 single, 4 double)
- `gCurrentMove`, `gChosenMove`, `gCalledMove`, `gCurrMovePos`, `gChosenMovePos`
- `gBattleMoveDamage`, `gHpDealt`, `gCritMultiplier`, `gMultiHitCounter`
- `gMoveResultFlags`, `gHitMarker`, `gBattleOutcome`, `gBattleTypeFlags`, `gBattleWeather`, `gDynamicBasePower`
- `gBattleScripting` (struct)
- `gSideStatuses[2]`, `gStatuses3[4]`
- `gLastMoves[4]`, `gLastLandedMoves[4]`, `gLastHitByType[4]`, `gLastResultingMoves[4]`, `gLastUsedMove[4]`, `gLastUsedAbility`, `gLastUsedItem`, `gLastHitBy[4]`
- `gBattlerByTurnOrder[4]`, `gBattleCommunication[16]`
- Setters explicites pour chacune (TS modules exports `let` sont read-only)
- `resetBattleState()` pour reset full au début de chaque combat
- Expose `globalThis.__battleState` pour devtools

### 2. `src/engine/battle/cmd-niveau-1.ts` (NEW, ~220 lignes)

Container des handlers Niveau 1. 2 opcodes implémentés 1:1 décomp :

**`Cmd_ppreduce` (0x03)** : 1:1 décomp `battle_script_commands.c:1205-1251`
- Calcule `ppToDeduct` (= 1 par défaut, +1 si target ability == PRESSURE et target != attacker)
- Si pas HITMARKER_NO_PPDEDUCT et pas HITMARKER_NO_ATTACKSTRING et pp[curMovePos] > 0 : decrement pp (clamp à 0)
- Clear HITMARKER_NO_PPDEDUCT
- TODO : gSpecialStatuses[].ppNotAffectedByPressure, gProtectStructs[].notFirstStrike, BtlController_EmitSetMonData persistent sync, move target switch (MOVE_TARGET_FOES_AND_ALLY etc.)

**`Cmd_critcalc` (0x04)** : 1:1 décomp `battle_script_commands.c:1253-1288`
- Formule critChance complète (= FOCUS_ENERGY ×2 + EFFECT_HIGH_CRITICAL/SKY_ATTACK/BLAZE_KICK/POISON_TAIL +1 each + HOLD_EFFECT_SCOPE_LENS +1 + LUCKY_PUNCH×CHANSEY ×2 + STICK×FARFETCHD ×2)
- Clamp à [0, 4]
- Check `BATTLE_ARMOR` / `SHELL_ARMOR` immunity, `STATUS3_CANT_SCORE_A_CRIT`, `BATTLE_TYPE_WALLY_TUTORIAL`/`FIRST_BATTLE`
- Final `Random() % sCriticalHitChance[critChance] === 0` → gCritMultiplier = 2 sinon 1
- TODO : hold effect + move effect lookup (stubs `_getMoveEffect`, `_getHoldEffect` returnent 0 — wire avec data tables quand portées)

### 3. `src/engine/battle/script-interpreter.ts` (MODIFIED)

`_initCommandsTable` install les Niveau 1 handlers via lazy import (break cyclic dep avec cmd-niveau-1.ts qui importe `BattleOpcodeHandler` type).

## TODO Niveau 1 (= 9 opcodes restants, ~1 semaine)

### Order de priorité

1. **`Cmd_attackcanceler` (0x00)** — `battle_script_commands.c:915-1007`
   - GROS (~100 lignes) : check gBattleOutcome, attacker HP=0, AtkCanceler_UnableToUseMove (sleep/paralyze/freeze/confuse/infatuation/disable/imprison/truant/recharge), AbilityBattleEffects ABILITYEFFECT_MOVES_BLOCK (Soundproof), PP check, IsMonDisobedient, MagicCoat bounce, Snatch, LightningRod redirect, Protect check
   - Path happy minimum : skip protect/snatch/magic coat, just advance.

2. **`Cmd_accuracycheck` (0x01)** — `battle_script_commands.c:1099-1204`
   - move accuracy × evasion stages → Random() check
   - Special : OHKO moves use level diff, Thunder hits 100% in rain, etc.

3. **`Cmd_damagecalc` (0x05)** — `battle_script_commands.c:1290-1313`
   - Wrapper qui appelle `CalculateBaseDamage(attacker, defender, move, sideStatus, dynamicBasePower, dynamicType, attackerIdx, defenderIdx)` (= pokemon.c:3107, ~500 lignes !)
   - Multiplie par gCritMultiplier × gBattleScripting.dmgMultiplier
   - +×2 si STATUS3_CHARGED_UP et type ELECTRIC
   - ×1.5 si gProtectStructs[attacker].helpingHand
   - **CalculateBaseDamage** est le plus gros morceau de Niveau 1 (probably should be its own file `damage-calc.ts`)

4. **`Cmd_typecalc` (0x06)** — `battle_script_commands.c:1355-1657` (~300 lignes !)
   - Type chart lookup : sTypeEffectivenessTable iterate (mult × 20 ou 5 ou 10 ou 0)
   - Levitate immunity, Wonder Guard, Volt Absorb / Water Absorb / Flash Fire ability triggers
   - STATUS3_MIRACLE_COATED ground immunity
   - Set gMoveResultFlags : MOVE_RESULT_SUPER_EFFECTIVE / NOT_VERY / NO_EFFECT
   - **Énorme aussi, mérite son fichier `type-calc.ts`**

5. **`Cmd_adjustnormaldamage` (0x07)** — `battle_script_commands.c:1658-1700`
   - Burn ÷2 (si attacker burned et physical move et pas GUTS)
   - Reflect/Light Screen ÷2 (si sideStatus avec SIDE_STATUS_REFLECT/LIGHTSCREEN et pas critical hit)
   - Substitute check
   - Damage clamp à mon HP

6. **`Cmd_healthbarupdate` (0x0B)** — `battle_script_commands.c:1807-1843`
   - UI sync : BtlController_EmitSetHealthBar pour anim HP drain
   - Wait via BattleControllerExecFlags (= pause script jusqu'à anim done)

7. **`Cmd_datahpupdate` (0x0C)** — `battle_script_commands.c:1844-...`
   - Apply gBattleMoveDamage à target.hp (= mon.hp -= damage, clamp à 0..maxHP)
   - Update gHpDealt
   - Substitute HP separate

8. **`Cmd_tryfaintmon` (0x19)** — `battle_script_commands.c:2965-...`
   - Si target.hp == 0 → jump BattleScript_FaintTarget
   - Set gBattlerFainted = target
   - Status effects expirent au faint

9. **`Cmd_moveend` (0x49)** — `battle_script_commands.c:4213-...`
   - State machine post-move : ~20 sub-states
   - Cleanup : Rage build-up, defrost (= Fire move thaws frozen target), Sleep wake-up if multi-turn move, etc.
   - Loop via gBattleScripting.atk49_state jusqu'à done

### Helpers/tables à porter

- `gBattleMoves[]` (= data/battle_moves.h, 354 entries × `{ effect, power, type, accuracy, pp, secondaryEffectChance, target, priority, flags }`)
- `gSpeciesInfo[]` (= partial déjà porté via decomp-data, mais accès via `BattlePokemon.species`)
- `gItems[]` hold effects + params
- `sHoldEffectToType[]` (= attacker hold effect → type boost)
- `sTypeEffectivenessTable` (= 18×18 = 324 entries, type × type → multiplier)
- `sCriticalHitChance[]` (= [16, 8, 4, 3, 2]) — déjà inline dans cmd-niveau-1.ts
- `sStatStageMultipliers` (= rank → numerator/denominator pair pour APPLY_STAT_MOD macro)
- `IsTwoTurnsMove(move)`, `IsMonDisobedient(battler)`, `BattleScriptPushCursor()` helpers

### Architecture proposée

```
src/engine/battle/
├── state.ts                 ✅ DONE — ewram vars
├── script-interpreter.ts    ✅ skeleton — dispatch table
├── cmd-niveau-1.ts          ✅ partial — ppreduce + critcalc
├── damage-calc.ts           ⏳ TODO — CalculateBaseDamage 1:1 décomp pokemon.c:3107
├── type-calc.ts             ⏳ TODO — type chart + Levitate/Wonder Guard/etc.
├── ability-effects.ts       ⏳ TODO — AbilityBattleEffects() switch on effect+battler
├── hold-effects.ts          ⏳ TODO — GetItemHoldEffect + params
├── stat-mods.ts             ⏳ TODO — APPLY_STAT_MOD macro logic
└── data/
    ├── battle-moves.ts       ⏳ extract du décomp data/battle_moves.h
    ├── type-effectiveness.ts ⏳ extract du décomp src/data/type_effectiveness.h
    └── hold-effect-to-type.ts ⏳ extract du décomp src/data/items.h
```

## Wire-in plan (post Niveau 1 complet)

Une fois les 11 opcodes Niveau 1 implémentés :
1. Update `battle-flow.ts` : remplacer le hardcoded path par `setupBattleScriptContext('BattleScript_HitFromAttackerString')` + `runBattleScript(ctx)` chaque frame jusqu'à done.
2. Hook les UI callbacks (healthbar, message print, etc.) sur les opcodes pause-wait pattern.
3. Tester end-to-end avec le tutorial Birch (= 1st battle Treecko vs Zigzagoon Lv2).
4. Vérifier que damage calc match les valeurs ROM réelles via A/B test.

## Commit history session 133

```
acf11122 DEVTOOLS : scope.whereObj/sprites/fade/skipDialog/observe + fix where stale après connection
79d5daa6 BATTLE : Phase 1 niveau 1 START — state.ts + 2 opcodes implémentés (ppreduce, critcalc)
2935910b DOCS : plan complet Phase 1 Niveau 1 + architecture battle/* proposée
d70c4630 BATTLE : Phase 1 niveau 1 — damage flow porté 1:1 décomp (7 opcodes total + data tables)
[next] BATTLE : Phase 1 niveau 1 COMPLET — 11/11 opcodes (+ accuracycheck, moveend, attackcanceler happy, healthbarupdate stub)
```

## État final session 133

- Branche `upd2`
- Worktree `hungry-moore-a74774`
- Compile clean (= aucune erreur tsc battle/*)
- Preview server 5173 OK
- **Niveau 1 COMPLET (11/11 opcodes)** :
  - ✅ 0x00 Cmd_attackcanceler (happy path)
  - ✅ 0x01 Cmd_accuracycheck (full 1:1)
  - ✅ 0x03 Cmd_ppreduce (full 1:1)
  - ✅ 0x04 Cmd_critcalc (full 1:1)
  - ✅ 0x05 Cmd_damagecalc (wraps CalculateBaseDamage)
  - ✅ 0x06 Cmd_typecalc (full 1:1)
  - ✅ 0x07 Cmd_adjustnormaldamage (clamp damage)
  - ✅ 0x0B Cmd_healthbarupdate (stub : no UI anim)
  - ✅ 0x0C Cmd_datahpupdate (apply hp change)
  - ✅ 0x19 Cmd_tryfaintmon (faint check + outcome)
  - ✅ 0x49 Cmd_moveend (stub : skip sub-states)

## Modules créés

```
src/engine/battle/
├── state.ts                 ✅ ewram vars 1:1 décomp battle_main.c:160-250
├── script-interpreter.ts    ✅ skeleton + dispatch table 256 entries + readers exposed
├── cmd-niveau-1.ts          ✅ 11 opcodes Niveau 1
├── damage-calc.ts           ✅ CalculateBaseDamage 1:1 (~270 lignes)
├── type-calc.ts             ✅ Cmd_typecalc + ModulateDmgByType 1:1
└── data/
    ├── battle-moves.ts       ✅ gBattleMoves[] async load JSON
    └── type-effectiveness.ts ✅ gTypeEffectiveness[336] 1:1
```

## Limitations / stubs en place (à upgrade post-Niveau 1)

1. **`gProtectStructs`** : non porté → attackcanceler skip Protect/Snatch/MagicCoat/LightningRod, typecalc skip targetNotAffected.
2. **`gSpecialStatuses`** : non porté → ppreduce skip ppNotAffectedByPressure, attackcanceler skip lightningRodRedirected.
3. **`AbilityBattleEffects()`** : non porté → moveend skip SYNCHRONIZE/ON_DAMAGE/IMMUNITY/ATK_SYNCHRONIZE, ppreduce skip Pressure across multi-target.
4. **`ItemBattleEffects()`** : non porté → moveend skip MOVE_END / KINGSROCK_SHELLBELL.
5. **`gEnigmaBerries`** + hold effects table : non porté → damagecalc/accuracycheck skip Choice Band, Scope Lens, Soul Dew, etc.
6. **Badge boosts** (`ShouldGetStatBadgeBoost`) : retourne false → +10% par badge non appliqué (= OK pour first battle pré-gym).
7. **`AttacksThisTurn()`** : returns 2 toujours → Wonder Guard fonctionne pour tous les hits (= OK pour single-hit moves).
8. **`gBattleControllerExecFlags`** : non porté → healthbarupdate ne wait pas (= UI anim instantanée, à upgrade quand UI controllers wired).
9. **`MoveValuesCleanUp` + `BattleScriptPush/Pop`** : non porté → moveend skip multi-target battles.
10. **`gBattleStruct.choicedMove`** : non porté → Choice Band lock non implémenté.

Tous ces stubs sont annotés `// TODO porter ...` dans le code.

## Wire-in plan (post Niveau 2 done)

Niveau 2 = stat stages + status (statbuffchange 0x89, setgraphicalstatchangevalues 0x47, playstatchangeanimation 0x48, seteffectprimary 0x16, seteffectsecondary 0x17, clearstatusfromeffect 0x18, updatestatusicon 0x98). ~7 opcodes.

Une fois ces 7 done, on aura un combat fonctionnel sans switching ni ability tricky. Wire :
1. Replace `battle-flow.ts` hardcoded path par `setupBattleScriptContext('BattleScript_HitFromAttackerString')` + `runBattleScript(ctx)` per frame
2. Hook UI : ShowFieldMessage, healthbar anim, damage flash
3. Test end-to-end avec tutorial Birch — A/B test damage values vs ROM réel

## Pour reprendre next session

Lire ce file + `SESSION-132-BACKING-SYSTEMS.md` (= plan Phase 1 complet) + `ROADMAP-FUTURE-PROOF-2026-05-14.md`.

Niveau 1 done. **Prochaine étape = Niveau 2 (stat stages + status, ~7 opcodes)**.

Ordre suggéré :
1. `0x89 Cmd_statbuffchange` (= apply stat stage change, 1:1 décomp ~80 lignes)
2. `0x47 Cmd_setgraphicalstatchangevalues` (= UI anim trigger, ~10 lignes)
3. `0x48 Cmd_playstatchangeanimation` (= run anim, async)
4. `0x16 Cmd_seteffectprimary` / `0x17 Cmd_seteffectsecondary` (= apply move effect : burn, poison, etc. + chance roll)
5. `0x18 Cmd_clearstatusfromeffect` (= remove status post-effect)
6. `0x98 Cmd_updatestatusicon` (= UI icon sync)

Puis Niveau 3 (branching) : jumpifstatus/ability/stat/type, jumpifcantmakeasleep.
