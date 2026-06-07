# Couverture combat 1:1 — filet mécanique

> Généré par `scripts/audit-battle-coverage.mjs`. Énumère les tables EXHAUSTIVES de la décomp
> et les croise avec le portage — chaque table via SA bonne source (cf. colonne « méthode »).
> **MANQUANT** = absent du portage (à faire, fiable). **présent** = la DATA est portée
> (script/message/nom existe) ≠ garantie que le CONTENU est 1:1 correct = **NIVEAU 2**
> (audit du maillon : exécution du script, rendu byte-level, contenu des cases). Re-run à volonté.

| Table | présents | total | % | manquants | méthode |
|---|---|---|---|---|---|
| EFFECT (move) | 214 | 214 | 100% | 0 | jump-table gBattleScriptsForMoveEffects → labels bytecode |
| MOVE_EFFECT (secondary) | 59 | 59 | 100% | 0 | par valeur dans set-move-effect.ts (eff===N / ranges) |
| HOLD_EFFECT | 63 | 67 | 94% | 4 | par valeur _sHoldEffectToType + item-effects ; évo/OW hors combat |
| ABILITY | 78 | 78 | 100% | 0 | nom dans le code combat |
| STRINGID | 375 | 375 | 100% | 0 | table de strings extraite (STRINGID_NAMES) |
| Opcodes Cmd_* | 249 | 249 | 100% | 0 | OPCODE_NAMES + impl |

## EFFECT (move) — 0 MANQUANT(S)

_(tous présents)_

## MOVE_EFFECT (secondary) — 0 MANQUANT(S)

_(tous présents)_

## HOLD_EFFECT — 4 MANQUANT(S)

- HOLD_EFFECT_REPEL
- HOLD_EFFECT_PREVENT_EVOLVE
- HOLD_EFFECT_DRAGON_SCALE
- HOLD_EFFECT_UP_GRADE

## ABILITY — 0 MANQUANT(S)

_(tous présents)_

## STRINGID — 0 MANQUANT(S)

_(tous présents)_

## Opcodes Cmd_* — 0 MANQUANT(S)

_(tous présents)_

