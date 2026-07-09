# AUDIT MIROIR 1:1 — nos .ts ↔ décomp .c (structurel : noms de fonctions)

> pureté = nos fn au nom décomp (du counterpart) / total · complétude = fn décomp présentes / total décomp · divergence = nos fn au nom introuvable dans TOUT le décomp (maison).
> ⚠️ STRUCTUREL (noms), pas comportemental. Ne lit pas la logique ligne-à-ligne.

## 🗂️ game/ (déjà migré) — 0 fichiers, vérif que c'est en ordre

| fichier | counterpart | nos fn | match(c.p./partout) | pureté | complét. | divergence | verdict |
|---|---|---|---|---|---|---|---|

### Divergences dans game/ (fn au nom non-décomp — à justifier : glu M3 ? mal nommé ?)


## 🟢 CANDIDATS migration → game/ (0) — engine/, purs, .c existe

| fichier engine | → game/ | nos fn | match | pureté | complét. | divergence |
|---|---|---|---|---|---|---|

## 🟡 Partiels (7) — décomp-nommés mais dispersés/hybrides (évaluer au cas par cas)

| fichier engine | best .c | nos fn | match partout | pureté(p) | divergence |
|---|---|---|---|---|---|
| `engine/battle/battle-link-end.ts` | `battle_main.c` | 42 | 37 | 88% | 5 |
| `engine/battle/battle-setup-helpers.ts` | `battle_setup.c` | 29 | 22 | 76% | 7 |
| `engine/battle/constants.ts` | `—` | 22 | 22 | 100% | 0 |
| `engine/battle/data/experience-tables.ts` | `—` | 11 | 8 | 73% | 3 |
| `engine/bag/bag-pockets.ts` | `item.c` | 10 | 6 | 60% | 4 |
| `engine/script/script-vars.ts` | `event_data.c` | 9 | 6 | 67% | 3 |
| `engine/field/region-map-data.ts` | `region_map.c` | 8 | 5 | 63% | 3 |

## 🔴 Harness/maison (53) — reste en engine/ (peu/pas de noms décomp)

- `engine/bag/bag-item-effects.ts` (12 fn, 2 décomp-nommées)
- `engine/bag/bag-screen.ts` (89 fn, 1 décomp-nommées)
- `engine/bag/bag-types.ts` (4 fn, 0 décomp-nommées)
- `engine/bag/bag.ts` (17 fn, 8 décomp-nommées)
- `engine/battle/ai/ai-state.ts` (11 fn, 0 décomp-nommées)
- `engine/battle/battle-anim-registry.ts` (6 fn, 0 décomp-nommées)
- `engine/battle/battle-decomp-loop.ts` (29 fn, 5 décomp-nommées)
- `engine/battle/battle-devtools.ts` (27 fn, 0 décomp-nommées)
- `engine/battle/battle-event-queue.ts` (7 fn, 0 décomp-nommées)
- `engine/battle/battle-levelup-box.ts` (7 fn, 0 décomp-nommées)
- `engine/battle/battle-sendout-anim.ts` (42 fn, 0 décomp-nommées)
- `engine/battle/battle-sprites-data.ts` (33 fn, 1 décomp-nommées)
- `engine/battle/battle-switch.ts` (7 fn, 3 décomp-nommées)
- `engine/battle/battle-trainer-data-bridge.ts` (7 fn, 0 décomp-nommées)
- `engine/battle/battle-trainer-party.ts` (8 fn, 4 décomp-nommées)
- `engine/battle/battle-windows.ts` (3 fn, 1 décomp-nommées)
- `engine/battle/data/battle-moves.ts` (3 fn, 0 décomp-nommées)
- `engine/battle/data/flavor-compat.ts` (1 fn, 1 décomp-nommées)
- `engine/battle/data/item-effects.ts` (4 fn, 1 décomp-nommées)
- `engine/battle/data/item-hold-effects.ts` (3 fn, 2 décomp-nommées)
- `engine/battle/data/move-name-resolve.ts` (3 fn, 0 décomp-nommées)
- `engine/battle/data/species-runtime.ts` (7 fn, 0 décomp-nommées)
- `engine/battle/data/trainer-money-table.ts` (1 fn, 0 décomp-nommées)
- `engine/battle/memory-map.ts` (7 fn, 0 décomp-nommées)
- `engine/battle/opcode-names.ts` (3 fn, 0 décomp-nommées)
- `engine/battle/party-storage.ts` (15 fn, 3 décomp-nommées)
- `engine/battle/script-interpreter.ts` (30 fn, 11 décomp-nommées)
- `engine/battle/state.ts` (64 fn, 0 décomp-nommées)
- `engine/battle/wire-bytecode-bridge.ts` (15 fn, 0 décomp-nommées)
- `engine/data/game-data.ts` (34 fn, 2 décomp-nommées)
- `engine/field/field-globals.ts` (7 fn, 0 décomp-nommées)
- `engine/field/fly-field-move.ts` (3 fn, 0 décomp-nommées)
- `engine/field/map-layout-swap.ts` (1 fn, 1 décomp-nommées)
- `engine/field/movement-system.ts` (5 fn, 0 décomp-nommées)
- `engine/field/object-event-graphics-info.ts` (5 fn, 2 décomp-nommées)
- `engine/field/object-event-graphics.ts` (10 fn, 2 décomp-nommées)
- `engine/field/region-map.ts` (21 fn, 1 décomp-nommées)
- `engine/field/tilemap-loader.ts` (9 fn, 0 décomp-nommées)
- `engine/field/virtual-objects.ts` (7 fn, 2 décomp-nommées)
- `engine/field/warp-system.ts` (24 fn, 11 décomp-nommées)
- `engine/pokemon/pc-anim.ts` (8 fn, 1 décomp-nommées)
- `engine/pokemon/pc-box.ts` (2 fn, 2 décomp-nommées)
- `engine/pokemon/pc-items.ts` (11 fn, 6 décomp-nommées)
- `engine/pokemon/secret-base.ts` (4 fn, 0 décomp-nommées)
- `engine/pokemon/tmhm-moves.ts` (1 fn, 1 décomp-nommées)
- `engine/save/new-game-flags.ts` (1 fn, 0 décomp-nommées)
- `engine/save/save-block-state.ts` (4 fn, 0 décomp-nommées)
- `engine/save/save-blocks.ts` (25 fn, 0 décomp-nommées)
- `engine/script/script-opcodes-helpers.ts` (8 fn, 0 décomp-nommées)
- `engine/script/specials-registry.ts` (8 fn, 0 décomp-nommées)
- `engine/ui/bitmap-font.ts` (7 fn, 0 décomp-nommées)
- `engine/ui/gba-strings.ts` (3 fn, 0 décomp-nommées)
- `engine/wire-todo.ts` (2 fn, 0 décomp-nommées)
