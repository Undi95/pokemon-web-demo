# Session 133 FINAL — Phase 1 Niveaux 1+2 COMPLETS (2026-05-15)

## Commits cette session

| Commit | Description |
|--------|-------------|
| `acf11122` | DEVTOOLS — whereObj/sprites/fade/skipDialog/observe + fix where stale + HMR |
| `79d5daa6` | BATTLE Niveau 1 START — state.ts + 2 opcodes (ppreduce, critcalc) |
| `2935910b` | DOCS plan complet |
| `d70c4630` | BATTLE Niveau 1 damage flow — 5 opcodes + data tables + CalculateBaseDamage |
| `217d5716` | BATTLE Niveau 1 COMPLET — 4 opcodes restants (attackcanceler/accuracycheck/healthbarupdate/moveend) |
| `9796b2ef` | BATTLE audit Niveau 1 → constants.ts + fix 15+ bit values FAUSSES |
| `e37c6348` | BATTLE Niveau 2 — 8 opcodes + stat-stages.ts ChangeStatBuffs 1:1 |

## Niveau 1 (11/11 opcodes, audité 1:1)

| Opcode | Status | Détail |
|--------|--------|--------|
| 0x00 attackcanceler | happy path | hp==0 + pp==0 + HITMARKER_OBEYS set ; skip Protect/Snatch/MagicCoat/LightningRod/Disobedience |
| 0x01 accuracycheck | full | sAccuracyStageRatios + Thunder/Sun + CompoundEyes/SandVeil/Hustle + readWord/readHalfword args |
| 0x03 ppreduce | full | Pressure ability bump + HITMARKER_NO_PPDEDUCT clear |
| 0x04 critcalc | full | sCriticalHitChance + getBattleMove(curr).effect + hold effects + BATTLE_ARMOR/SHELL_ARMOR + FIRST_BATTLE no-crit |
| 0x05 damagecalc | wraps | CalculateBaseDamage × gCritMultiplier × dmgMultiplier ; dynamicMoveType = 0 |
| 0x06 typecalc | full | STAB + Levitate + gTypeEffectiveness iterate + Wonder Guard + ModulateDmgByType |
| 0x07 adjustnormaldamage | full 1:1 | ApplyRandomDmgMultiplier 85-100% + FocusBand check + Endured/FalseSwipe leave-at-1-HP |
| 0x0B healthbarupdate | stub UI | consume byte arg, no anim emit |
| 0x0C datahpupdate | 1:1 | consume byte arg, getBattlerForBattleScript, apply hp + gHpDealt |
| 0x19 tryfaintmon | 1:1 | consume 6 bytes args (battler/mode/ptr), set gBattlerFainted + outcome WIN/LOST |
| 0x49 moveend | stub | consume 2 bytes args, set moveendState = COUNT (= exit) |

## Niveau 2 (8/8 opcodes)

| Opcode | Status | Détail |
|--------|--------|--------|
| 0x16 seteffectprimary | stub | TODO SetMoveEffect helper (~500 lignes) |
| 0x17 seteffectsecondary | stub | TODO SetMoveEffect + chance roll |
| 0x18 clearstatusfromeffect | full | clear status1/2 via sStatusFlagsForMoveEffects |
| 0x47 setgraphicalstatchangevalues | full | compute animArg1/2 from statChanger |
| 0x48 playstatchangeanimation | stub UI | consume 3 bytes args, no anim emit |
| 0x89 statbuffchange | full | wraps ChangeStatBuffs + jumpPtr push si FAIL+ALLOW_PTR |
| 0x8A normalisebuffs | full | Haze, reset all stat stages to DEFAULT_STAT_STAGE |
| 0x98 updatestatusicon | stub UI | consume byte arg, no UI emit |

## Modules

```
src/engine/battle/
├── state.ts                 ✅ ewram vars 1:1 décomp battle_main.c:160-250
├── constants.ts             ✅ ~280 lignes : BATTLE_TYPE/STATUS/HITMARKER/MOVE_RESULT/
│                                B_WEATHER/BS_/STAT_/TYPE/ABILITY/HOLD_EFFECT/EFFECT/
│                                MOVE/SPECIES/SIDE_STATUS/B_OUTCOME/B_MSG/B_SIDE
│                                + helpers GET_BATTLER_SIDE, IS_TYPE_PHYSICAL,
│                                  GET_STAT_BUFF_VALUE, SET_STAT_BUFF_VALUE,
│                                  HITMARKER_FAINTED, BATTLE_OPPOSITE
├── script-interpreter.ts    ✅ skeleton + dispatch table + readers + Niveau 1+2 install
├── cmd-niveau-1.ts          ✅ 11 opcodes Niveau 1
├── cmd-niveau-2.ts          ✅ 8 opcodes Niveau 2
├── damage-calc.ts           ✅ CalculateBaseDamage 1:1 pokemon.c:3107
├── type-calc.ts             ✅ Cmd_typecalc + ModulateDmgByType 1:1
├── stat-stages.ts           ✅ ChangeStatBuffs 1:1 battle_script_commands.c:6940
└── data/
    ├── battle-moves.ts       ✅ gBattleMoves[] async load JSON
    └── type-effectiveness.ts ✅ gTypeEffectiveness[336] 1:1
```

## Bugs audit Niveau 1 trouvés + fixés

Audit ligne par ligne vs décomp a trouvé 15+ bit constants FAUSSES (= valeurs inventées
au lieu de 1:1) :

**HITMARKER_*** : NO_ATTACKSTRING, NO_PPDEDUCT, UNABLE_TO_USE_MOVE, OBEYS, ALLOW_NO_PP.
**BATTLE_TYPE_*** : FIRST_BATTLE, WALLY_TUTORIAL.
**STATUS2_*** : MULTIPLETURNS.
**STATUS3_*** : CANT_SCORE_A_CRIT, ALWAYS_HITS, UNDERWATER.
**MOVE_RESULT_*** : FAILED.
**SIDE_STATUS_*** : LIGHTSCREEN, SPIKES_DAMAGED.
**BS_*** : TARGET/ATTACKER (= décomp les inverse de l'attendu, TARGET=0).
**EFFECT_*** : SKY_ATTACK, BLAZE_KICK, POISON_TAIL, FALSE_SWIPE.
**HOLD_EFFECT_*** : presque tous (CHOICE_BAND, SCOPE_LENS, LUCKY_PUNCH, STICK,
FOCUS_BAND, DEEP_SEA_TOOTH/SCALE, LIGHT_BALL, METAL_POWDER, THICK_CLUB, EVASION_UP,
SOUL_DEW).
**B_MSG_*** : AVOIDED_DMG, GROUND_MISS, PROTECTED, MSG_DISPLAY index.

**Bugs logique** identifiés + fixés :
- Cmd_adjustnormaldamage : ajout ApplyRandomDmgMultiplier (85-100% random) + retrait clamp inconditionnel WRONG.
- Cmd_datahpupdate : consume byte arg manquant (= corruption bytecode).
- Cmd_tryfaintmon : consume 6 bytes args manquant.
- Cmd_critcalc : utilise getBattleMove().effect au lieu de stub.
- Cmd_damagecalc : dynamicMoveType=0 (= no override) au lieu de random.

## État de l'interpreter

Le bytecode interpreter n'est toujours pas wired au gameplay actif. `battle-flow.ts`
utilise toujours le hardcoded path visuel (= ni damage calc réel ni stat stages
appliqués au runtime). Le wire viendra une fois :
1. SetMoveEffect helper porté (= seteffectprimary/secondary réels)
2. Battle controllers minimal stubs (= UI sync pour healthbar / status icons / anims)
3. battle-flow.ts replacé par `setupBattleScriptContext('BattleScript_HitFromAttackerString')` + boucle `runBattleScript(ctx)`

## Pour reprendre next session

**Niveau 3 (branching) — 7 opcodes** :
- 0x1C jumpifstatus
- 0x1D jumpifstatus2
- 0x1E jumpifability
- 0x1F jumpifsideaffecting
- 0x20 jumpifstat
- 0x21 jumpifstatus3condition
- 0x22 jumpiftype
- 0x84 jumpifcantmakeasleep

Tous simples (= read args + check + jump ou advance). Peu de helpers.

**Puis Niveau 4 (animations + UI) — 6 opcodes** :
- attackanimation, waitanimation, printstring, waitmessage, printfromtable, yesnobox
- Requièrent battle controllers async pour UI sync. Niveau 4 fera la mise en place
  d'un controller minimal stub pour traverser ces opcodes sans bloquer.

**Helpers majeurs à porter (= post-Niveau 3)** :
- SetMoveEffect (~500 lignes) — pour seteffectprimary/secondary réels
- sStatusFlagsForMoveEffects full table (= NUM_MOVE_EFFECTS = ~40 entries)
- gSideTimers (Mist, Reflect/LightScreen counters, Safeguard) — pour stat stages
  ability blocks + Reflect damage halving
- gProtectStructs — pour Protect/Snatch/MagicCoat/Substitute/HelpingHand
- gSpecialStatuses — pour focusBanded/lightningRodRedirected/statLowered
- BattleScriptPush/Pop (= call stack for script branching)
- gBattleStruct.dynamicMoveType — pour Hidden Power, Weather Ball

## Limitations connues (post Niveau 1+2)

10 stubs documentés dans le code :
1. gProtectStructs (Protect/Snatch/MagicCoat targets)
2. gSpecialStatuses (lightningRodRedirected, ppNotAffectedByPressure, focusBanded, statLowered)
3. AbilityBattleEffects (Synchronize, OnDamage, Immunity, MOVES_BLOCK)
4. ItemBattleEffects (King's Rock, Shell Bell, Enigma Berry, Choice Band)
5. gEnigmaBerries + GetItemHoldEffect/Param table
6. ShouldGetStatBadgeBoost (+10% per badge, post-gym)
7. AttacksThisTurn (Wonder Guard multi-hit edge)
8. gBattleControllerExecFlags (UI anim async wait)
9. MoveValuesCleanUp + BattleScriptPush/Pop (multi-target battles, branching)
10. gBattleStruct.choicedMove + dynamicMoveType (Choice Band lock, Hidden Power)
11. gSideTimers (Mist/Reflect/LightScreen counters)
12. sStatusFlagsForMoveEffects full table (currently only 6 entries hardcoded)
13. SetMoveEffect helper (~500 lignes)

Toutes annotées `// TODO porter ...` dans le code source.

## Compile status

`tsc --noEmit` : 0 erreur sur tous les modules `src/engine/battle/*`. Les bugs
TypeScript existants (~117) sont préexistants et non liés à ce travail.
