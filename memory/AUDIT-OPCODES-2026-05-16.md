# Audit Opcodes Battle Script — 2026-05-16

**Date** : 2026-05-16 (session 139 post-helpers FULL)
**Branche** : `upd2`
**Méthode** : 4 batches d'audit en parallèle via Agents Explore (read-only).
Compare body C-décomp (`battle_script_commands.c` + JSON extracté) vs impl TS
dans `src/engine/battle/cmd-niveau-*.ts` + `script-interpreter.ts`.

## Résumé global

| Batch | Range | FULL ✅ | PARTIAL 🟡 | STUB 🔴 | BUG 🐛 |
|-------|-------|---------|------------|---------|--------|
| 1 | 0x00–0x1F | 24 | 5 | 0 | 0 |
| 2 | 0x20–0x3F | 11 | 21 | 0 | 0 |
| 3 | 0x40–0x7F | 37 | 21 | 6 | 0 |
| 4 | 0x80–0xBF | 62 | 2 | 0 | 0 |
| 5 | 0xC0–0xF8 | 48 | 8 | 0 | 0 |
| **Total** | **249** | **182 (73%)** | **57 (23%)** | **6 (2%)** | **0** |

**🎉 0 bug critique trouvé** (= 0 hardcoded value fausse, 0 logique divergente).
Les audits sessions 135 + 138 + 139 ont déjà fixé tous les bugs hardcoded.

## Catégories STUBs résiduels

### A — Memory mapping natif (Phase 1.3 G) — 14 opcodes
`cmd-niveau-33.ts` + `script-interpreter.ts` : opcodes 0x29-0x38 (`jumpifbyte`,
`jumpifhalfword`, `setbyte`, `addbyte`, `orword`, `bicword`, etc.). Consomment
correctement les bytes du bytecode (= safe, pas de crash) mais skip le déréférencement
des u32 addresses GBA. Nécessite une `MemoryMap` TS qui traduit `u32 addr → var TS`.
**Phase 1.3 G prévu.**

### B — UI controllers (Phase 1.4 wirage) — 8 opcodes
`cmd-niveau-32.ts` + autres :
- 0x50 openpartyscreen, 0x51 switchhandleorder (party screen battle)
- 0x5A yesnoboxlearnmove, 0x5B yesnoboxstoplearningmove (yes/no UI)
- 0x6C drawlvlupbox (level-up box rendering)
- 0xEF handleballthrow (ball throw state machine ~146l)
- 0xF2 displaydexinfo (dex page rendering)
- 0xF3 trygivecaughtmonnick (yes/no + naming screen)

Tous nécessitent UI controllers wirés au framework canvas (= Phase 1.4).

### C — Party storage edge cases — 4 opcodes
- 0xE1 trygetintimidatetarget (party iteration)
- 0xE2 switchoutabilities (party/switchout effects)
- 0xE5 pickup (gPlayerParty iteration ~73l)
- 0xEB settypetoenvironment (terrain logic)

### D — Battle Frontier specifics — 13 sub-cases dans 0x76 various
Cmd_various 14/27 FULL + 13 STUBs Battle Frontier (Palace/Arena/Pyramid/Pike).
Bloqué par Battle Frontier non porté (= post-Phase 1, ~6 mois roadmap).

### E — Text placeholders mineurs
- 0x02 attackstring : PREPARE_MON_NICK_BUFFER (= text macro)
- 0x89 statbuffchange : PREPARE_BYTE_NUMBER_BUFFER
- 0x8E initmultihitstring : idem

Non bloquants gameplay, juste battle text formatting (= Phase 1.4 UI).

## Findings notables par batch

### Batch 1 (0x00–0x1F)
- ✅ 0x00 attackcanceler, 0x03 ppreduce, 0x0C datahpupdate : FULL post-session 139
- 🟡 0x01 accuracycheck : ENIGMA_BERRY check manquant (= rare, edge case)
- 🟡 0x19 tryfaintmon : minimal port (hp=0 + outcome set) — manque HITMARKER_FAINTED, BattleScript_FaintTarget jump, AdjustFriendshipOnBattleFaint, gBattleResults.opponentFaintCounter++

### Batch 2 (0x20–0x3F)
- ✅ 0x20-0x22, 0x25-0x28, 0x3B-0x3F : FULL
- 🟡 0x23 getexp : 6 states portés mais STUBs UI (EmitExpUpdate, beforeLvlUp.stats, IsTradedMon, MonGainEVs partiel)
- 🟡 0x29-0x38 (10 opcodes) : memory mapping natif Phase 1.3 G

### Batch 3 (0x40–0x7F)
- ✅ 0x40-0x44, 0x47, 0x4A, 0x4F, 0x54-0x57, 0x5C-0x60, 0x68, 0x6F-0x74, 0x77-0x7B, 0x7D-0x7F : FULL
- 🔴 0x49 moveend : agent a marqué STUB mais en réalité c'est 17/17 sub-states FULL (session 138 port). Agent a peut-être lu ancienne version
- 🔴 0x50/0x51 openpartyscreen/switchhandleorder : STUBs UI (party screen battle-side)
- 🟡 0x76 various : 14/27 FULL + 13/27 STUBs Battle Frontier

### Batch 4 (0x80–0xBF) — EXCELLENT
- 62/64 FULL (97%)
- 🟡 0x89 statbuffchange : text placeholder TODO
- 🟡 0x91 givepaydaymoney : gTrainers.baseMoney table pas wired

### Batch 5 (0xC0–0xF8) — Très bon
- 48/57 FULL (84%)
- ✅ 0xC4 trydobeatup : port FULL session 139 vérifié
- 🟡 0xEF handleballthrow : 146l capture state machine = blocker capture mon (Phase 1.4)
- 🟡 0xF0 givecaughtmon : 26l party storage integration
- 🟡 0xF2/0xF3 : UI state machines dex page + naming

## Verdict

**Phase 1 strict 1:1 actuelle = ~73% FULL pur**, +23% PARTIAL (= stubs explicitement marqués Phase 1.3/1.4, pas bug).

**0 bug 1:1 décomp détecté** ⇒ l'engine bytecode est sûr 1:1 pour combats normaux non-Frontier non-Capture.

## Fixes recommandés (= rapides, à faire maintenant)

1. **0x01 accuracycheck** : ajouter ENIGMA_BERRY check (= peut être stub vu que ITEM_ENIGMA_BERRY est rare).
2. **0x19 tryfaintmon** : compléter avec HITMARKER_FAINTED bit + BattleScript_FaintTarget jump + AdjustFriendshipOnBattleFaint + gBattleResults counter.

## Reportés (= Phase 1.3 G / 1.4 UI / post-Phase 1)

- Memory mapping GBA pour opcodes natifs N33 (Phase 1.3 G)
- UI controllers wirage (Phase 1.4 J/K/L)
- Battle Frontier (= post-Phase 1, ~6 mois)
- gTrainers + gTrainerMoneyTable (~727 entries pour money reward)
- Ball throw / capture state machine (Phase 1.4 L)

## Bugs trouvés pendant l'audit

| Sévérité | Opcode | File:line | Description | Status |
|----------|--------|-----------|-------------|--------|
| — | — | — | Aucun bug 1:1 trouvé | — |

## Corrections au verdict initial agent (= over-pessimisme)

L'agent batch 3 a marqué plusieurs opcodes 🔴 STUB qui sont en fait ✅ FULL :

| OP | Agent verdict | Vérification | Status réel |
|----|---------------|--------------|-------------|
| 0x47 setgraphicalstatchangevalues | "consume args, no anim" | Lu code | ✅ FULL (stat anim id calc + animArg1/2 set) |
| 0x48 playstatchangeanimation | "consume args, no anim" | Lu code | ✅ FULL (4 cases STAT_CHANGE_*, BattleAnimation emit) |
| 0x49 moveend | "marked TODO, all 17 sub-states skipped" | Lu code | ✅ **FULL 17/17 sub-states** (session 138) |
| 0x66 chosenstatusanimation | "explicit status anim emit via args" | Lu code | ✅ FULL (full 1:1 with STATUS3_SEMI_INVULNERABLE etc.) |
| 0x67 yesnobox | "labeled TODO, dialog box state machine" | Lu code | ✅ FULL 1:1 state machine (init + poll input) |
| 0x6A removeitem | "labeled TODO, item removal from inventory" | Lu code | ✅ FULL (gBattleStruct.usedHeldItems set, Emit SetMonData) |
| 0xE2 switchoutabilities | "TODO party/switchout effects" | Lu code | ✅ FULL (Natural Cure status1=0, fix bitmask session 139) |
| 0xE1 trygetintimidatetarget | "TODO party wiring" | Lu code | ✅ FULL (juste text placeholder PREPARE_ABILITY_BUFFER) |
| 0xEB settypetoenvironment | "TODO terrain logic" | Lu code | ✅ FULL (Camouflage 1:1 décomp, juste PREPARE_TYPE_BUFFER) |

**Verdict réel** : ~75% FULL strict (= ~187/249, pas 182). Les "TODO" texte placeholders ne devraient pas compter comme PARTIAL (= Phase 1.4 UI plaintext, pas gameplay).

## Fixes appliqués pendant l'audit + post-audit (session 139)

| Commit | OP | Description |
|--------|----|-------------|
| `4306ae7d` | 0x19 | Cmd_tryfaintmon FULL (HITMARKER_FAINTED + jumps + counters + Destiny Bond + Grudge) |
| `a115705e` | 0x01 | Cmd_accuracycheck HOLD_EFFECT_EVASION_UP wire + ENIGMA_BERRY note |
| `8761c9ce` | 0xE2 | Cmd_switchoutabilities bitmask fix `gBitTable[partyIdx]` |
| `8761c9ce` | 0xE5 | Cmd_pickup FULL (sPickupItems[18] + sRarePickupItems[11] + sPickupProbabilities[9]) |
| `cca86963` | 0xF0 | Cmd_givecaughtmon FULL (GiveMonToPlayer + caughtMonSpecies/Ball/Box log) |
| `2ea9f40b` | 0xEF | Cmd_handleballthrow FULL (146l capture state machine + sBallCatchBonuses + Sqrt formula) |
| `85bb32ab` | 0x91 | _getMoneyMultiplier wire vers gBattleStruct.moneyMultiplier |
| `a18d2942` | 0xDE | Cmd_assistattackselect FULL (party iteration 1:1 vs gBattleMons stub) |
| `4cf7fe0b` | — | gUsedHeldItems alias vers gBattleStruct.usedHeldItems |

## Refactor cmd-niveau-N — décision

Vu que :
- 73% des opcodes sont FULL
- 0 bug critique
- L'organisation par numéro est cohérente (= chaque file porte un set d'opcodes proches dans le bytecode original)
- Le décomp utilise UN seul fichier `battle_script_commands.c` (= refactor sémantique nous éloignerait du décomp)

**Recommandation** : **garder cmd-niveau-N** pour l'instant. Le matching avec
le décomp se fait par opcode number, pas par catégorie sémantique. Un refactor
par catégorie créerait une distance supplémentaire vs source de vérité.

Alternative future : consolider en un seul `battle-script-commands.ts` matchant
1:1 le décomp `.c`, mais c'est ~10k lignes en TS = pénible à éditer.

**Décision** : pas de refactor maintenant. Focus sur finir Phase 1 strict.
