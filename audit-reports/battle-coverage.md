# Couverture combat 1:1 — filet mécanique

> Généré par `scripts/audit-battle-coverage.mjs`. Énumère les tables EXHAUSTIVES de la décomp
> et les croise avec le portage — chaque table via SA bonne source (cf. colonne « méthode »).
> **MANQUANT** = absent du portage (à faire, fiable). **présent** = la DATA est portée
> (script/message/nom existe) ≠ garantie que le CONTENU est 1:1 correct = **NIVEAU 2**
> (audit du maillon : exécution du script, rendu byte-level, contenu des cases). Re-run à volonté.

| Table | présents | total | % | manquants | méthode |
|---|---|---|---|---|---|
| EFFECT (move) | 214 | 214 | 100% | 0 | jump-table gBattleScriptsForMoveEffects → labels bytecode |
| MOVE_EFFECT (secondary) | 42 | 61 | 69% | 19 | nom dans le code combat |
| HOLD_EFFECT | 46 | 67 | 69% | 21 | nom dans le code combat |
| ABILITY | 78 | 78 | 100% | 0 | nom dans le code combat |
| STRINGID | 375 | 375 | 100% | 0 | table de strings extraite (STRINGID_NAMES) |
| Opcodes Cmd_* | 249 | 249 | 100% | 0 | OPCODE_NAMES + impl |

## EFFECT (move) — 0 MANQUANT(S)

_(tous présents)_

## MOVE_EFFECT (secondary) — 19 MANQUANT(S)

- MOVE_EFFECT_ATK_PLUS_2
- MOVE_EFFECT_DEF_PLUS_2
- MOVE_EFFECT_SPD_PLUS_2
- MOVE_EFFECT_SP_ATK_PLUS_2
- MOVE_EFFECT_SP_DEF_PLUS_2
- MOVE_EFFECT_ACC_PLUS_2
- MOVE_EFFECT_EVS_PLUS_2
- MOVE_EFFECT_ATK_MINUS_2
- MOVE_EFFECT_DEF_MINUS_2
- MOVE_EFFECT_SPD_MINUS_2
- MOVE_EFFECT_SP_ATK_MINUS_2
- MOVE_EFFECT_SP_DEF_MINUS_2
- MOVE_EFFECT_ACC_MINUS_2
- MOVE_EFFECT_EVS_MINUS_2
- MOVE_EFFECT_KNOCK_OFF
- MOVE_EFFECT_NOTHING_37
- MOVE_EFFECT_NOTHING_38
- MOVE_EFFECT_NOTHING_39
- MOVE_EFFECT_NOTHING_3A

## HOLD_EFFECT — 21 MANQUANT(S)

- HOLD_EFFECT_BUG_POWER
- HOLD_EFFECT_REPEL
- HOLD_EFFECT_PREVENT_EVOLVE
- HOLD_EFFECT_STEEL_POWER
- HOLD_EFFECT_DRAGON_SCALE
- HOLD_EFFECT_GROUND_POWER
- HOLD_EFFECT_ROCK_POWER
- HOLD_EFFECT_GRASS_POWER
- HOLD_EFFECT_DARK_POWER
- HOLD_EFFECT_FIGHTING_POWER
- HOLD_EFFECT_ELECTRIC_POWER
- HOLD_EFFECT_WATER_POWER
- HOLD_EFFECT_FLYING_POWER
- HOLD_EFFECT_POISON_POWER
- HOLD_EFFECT_ICE_POWER
- HOLD_EFFECT_GHOST_POWER
- HOLD_EFFECT_PSYCHIC_POWER
- HOLD_EFFECT_FIRE_POWER
- HOLD_EFFECT_DRAGON_POWER
- HOLD_EFFECT_NORMAL_POWER
- HOLD_EFFECT_UP_GRADE

## ABILITY — 0 MANQUANT(S)

_(tous présents)_

## STRINGID — 0 MANQUANT(S)

_(tous présents)_

## Opcodes Cmd_* — 0 MANQUANT(S)

_(tous présents)_

