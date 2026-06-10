# État du projet — port 1:1 Pokémon Émeraude

> **Doc canonique** : ce qui est fait / pas fait, les outils d'audit, le backlog
> priorisé. Mis à jour 2026-06-10. Branche `mirroir` (non poussée — on ne push jamais).
> Pour l'archi : `docs/ARCHITECTURE.md`. Pour les dettes ponctuelles : `DETTES-1TO1-STRICT.md`.

## 🧰 La boîte à outils d'audit (ne JAMAIS auditer à la main — lancer un script)

| Commande | Sort | À quoi ça sert |
|---|---|---|
| **`npm run coverage:1to1`** | `audit-reports/1to1/COVERAGE-GLOBAL.md` | **Carte de couverture globale** : pour CHAQUE `.c` du décomp, % de fonctions portées (= citées 1:1). Le backlog automatique. `--file=<x>.c` pour le détail, `--top=N` pour le stdout. |
| `npm run audit:1to1` | `GAPS/UNCITED/STALE.md` | Couverture fine des 6 fichiers UI « audités » (party/summary/bag/list) + citations périmées. |
| `npm run lint:1to1` | `SMELLS.md` | Anti-patterns / odeurs 1:1. |
| `npm run pair:1to1` | `pairs/*.md` | Paire C↔TS côte-à-côte pour les écrans audités. |
| `npm run audit:combat` | stdout | Fidélité **data** combat : base stats, moves, type chart, learnsets, trainer parties, item/hold effects, evolutions, exp tables, stat-stage ratios. |
| `npm run audit:overworld` | stdout | Fidélité **OW** : opcodes, specials, move-effect scripts, scrcmd, movement, collision. |
| `npm run audit:graphics` | stdout | Tables d'anim manquantes, mon-pic coords, pokemon anims. |
| `npm run extract:*` | `public/decomp/em/*` | (Re)extraction de data/assets depuis le décomp (byte-identique). |

⚠️ **Tous ces audits prouvent la COUVERTURE/data/traçabilité, PAS le comportement.**
Les bugs runtime (timing, fade, sprite, anim) se voient à l'œil / ROM-diff, pas en statique.

## 📊 Couverture — 3 AXES (le décomp n'est pas que des `.c`)

Le port a **trois types de contenu**, chacun porté + mesuré différemment. Ne pas
lire le "25%" comme l'état global — c'est UN seul axe (le code transcrit) :

| Type décomp | Comment porté | Mesure | État (2026-06-01) |
|---|---|---|---|
| **`.c` fonctions** | transcrit à la main + cité `1:1 décomp` | `coverage:1to1` | **2778/11228 (25%)** core |
| **`.s`/`.inc` scripts** (combat/anim/event/field-fx/ai) | **compilé** en bytecode (transpileur) | `coverage:1to1` (axe SCRIPTS) + `audit:opcodes` | **100% compilés** ; gap = impl. opcodes |
| **`.h` data** (species/moves/items/trainers/learnsets) + **constantes** | **extrait** en JSON | `audit:combat` / `audit:overworld` / `extract:*` | extrait + audité ✓ |

Donc : data **extraite**, scripts **compilés** (100%), et le 25% = uniquement les
fonctions C transcrites. Le 25% est bas surtout à cause des grosses traînes (anims de
move, movement OW, PC boxes) — le **chemin de jeu principal** (boot → OW → combat →
menus) tourne. `npm run coverage:1to1` affiche les 3 axes.

## ✅ Mûr (porté + vérifié, tourne bout-en-bout)

### 🆕 2026-06-10 — capture + sac en combat + audit ULTRACODE (session miroir)

- **CAPTURE 100% bout-en-bout, manette-réaliste** (commits `30faa4a0`→`a239ec03`) :
  menu → SAC (l'UI **complète** du sac s'ouvre EN COMBAT) → poche POKé BALLS →
  UTILIS. → chaîne d'anim 1:1 `battle_anim_throw.c:855-1567` (arc, mon aspiré
  rot-scale, 4 rebonds + SE, secousses subpixel, échec = mon ressort / succès =
  click + flash + `MUS_RG_CAUGHT_INTRO`) → mon ajouté à la party →
  `gBattleOutcome=7 (CAUGHT)` → retour OW. Annulation B validée (re-menu propre).
  ⚠️ La chaîne `SpriteCB_BallThrow*` de pokeball.c est du CODE MORT décomp
  (« do not seem to get run ») — la vraie = battle_anim_throw.c.
- **Reloc bytecode scripts_2** (`script-interpreter.ts`) : les opérandes de saut
  de `battle_scripts_2` étaient émises en offsets LOCAUX non shiftés → tout jump
  interne _2 (capture, items) sautait dans scripts_1 (garbage). Reloc à la volée
  dans le stepper (prouvé sûr : aucun script _2 ne référence un label _1).
- **Audit ULTRACODE game-vs-decomp** : 967 fonctions auditées sur les 24 miroirs
  `src/game/`, 8 écarts confirmés adversarialement, **8/8 corrigés** (dont
  `BATTLE_TYPE_IS_MASTER` 1<<24→1<<2 qui posait RECORDED à chaque combat = RNG
  VBlank gelé). Rapport : `AUDIT-GAME-VS-DECOMP-2026-06.md`.
- **5 fixes A/B user validés** : sprite KO fantôme (DestroySprite sans hide OAM),
  cris (préfixe SPECIES_ → 404), élévation des volants (GetBattlerElevation),
  **anims 2-frames** des fronts (439 séquences exactes extraites de
  front_pic_anims.h → `pokemon-front-anims.json`, flip à la frame près + cri à
  l'apparition), **party order combat** (nibbles 1:1 party_menu.c:6035+, l'actif
  en haut-gauche, restore à la fermeture).
- Dettes capture/sac documentées (mémoire `chantier-capture/sac-combat-2026-06-10.md`) :
  yes/no + naming screen du surnom (auto-NON 1:1-doc), 3 étoiles de capture,
  battleUsage non-balls (médecine/X items), check box pleine, displaydexinfo,
  « attrapé!À » (byte de contrôle décodeur), anim throw du dresseur (backsprite).

- **Boot → title → main menu → new game / resume** (callback2 1:1).
- **Overworld** : maps, collisions, warps, NPCs, mouvement joueur, caméra, save/RTC/RNG.
- **Combat sauvage ET dresseur** : ordre du tour, dégâts (calcul officiel ~1:1), statuts,
  faint→switch, capture, XP/EV partagés, level-up + apprentissage de move, évolution,
  intro séquencée + send-out (spin ball, flash, healthbox slide), AI dresseur.
- **Data** : species/moves/abilities/type-chart/learnsets/trainer-parties/items/evolutions
  extraites + auditées (`audit:combat` propre).
- **Sac** (22/22 items OW utilisables 1:1), party screen, summary screen, PC joueur,
  pokédex (backbone), 100% : `battle_anim.c`, `field_camera.c`, `random.c`, `mail.c`…

## 🔴 Backlog CORE (vrais trous — voir COVERAGE-GLOBAL.md pour le détail par fonction)

Triés par # fonctions manquantes. Ce sont des chantiers, pas des bugs.

| Fichier décomp | porté | manquantes | Nature |
|---|---|---|---|
| `event_object_movement.c` | 208/785 | 577 | Longue traîne des MovementTypes/callbacks NPC (structure portée, callbacks au cas par cas). |
| `pokemon_storage_system.c` | 2/380 | 378 | **PC boxes** (rangement) — quasi non porté. Gros chantier UI. |
| `party_menu.c` | 83/354 | 271 | Party menu : actions field-move, etc. (UI mûr sur l'essentiel, longue traîne). |
| `field_effect.c` | 8/247 | 239 | Field effects (téléport, fly, dig, fumée…) — surtout déféré/A-B. |
| `battle_transition.c` | 14/210 | 196 | **Transitions d'entrée combat** (Slice/Blur/… par situation). Demandé. |
| `overworld.c` | 36/227 | 191 | Glue OW (connexions, flags map, scripts spéciaux). |
| `battle_script_commands.c` | 98/287 | 189 | Opcodes bytecode combat restants (33/51 HIGH faits). |
| `battle_anim_effects_1/2/3.c` | 0/415 | 415 | **Anims de move uniques** (~350) — placeholder lunge en place ; traîne longue. |
| `pokemon_summary_screen.c` | 7/140 | 133 | Summary (l'essentiel marche ; reste pages/détails). |
| `pokedex.c` | 9/140 | 131 | Pokédex UI (backbone fait ; reste écrans). |
| `field_player_avatar.c` | 30/177 | 147 | Avatar (vélo, surf, états spéciaux). |
| `battle_anim_mons.c` | 7/128 | 121 | Helpers d'anim battler. |

## ⭐ Quick wins (« presque finis » — ≤5 fonctions manquantes)

`wallclock.c` (96%), `pokemon_animation.c` (98%), `list_menu.c` (94%),
`berry.c` (89%), `mail_data.c` (92%), `battle_message.c` (80%), `option_menu.c` (79%),
`text_window.c` (64%), `field_region_map.c`, `coins.c`, `lottery_corner.c`…
+ plein de petits `.c` à 0% mais < 6 fonctions (`heal_location.c`, `gym_leader_rematch.c`,
`fldeff_dig/strength/teleport.c`, `post_battle_event_funcs.c`…) = **ports en masse faciles**.

## ⛔ Déféré (hors-scope démo — couverture basse NORMALE)

Minigames (slot_machine, roulette, pokemon_jump, dodrio_berry_picking, berry_blender),
link/multi (link*, union_room, trade, rfu, battle_controller_link/recorded),
contest (contest*), Battle Frontier (frontier*, battle_factory/pike/pyramid/dome/arena/palace/tower),
secret base, pokénav, pokéblock. (Liste éditable dans `scripts/audit-coverage-global.mjs` → `DEFERRED_RE`.)

## 🗺️ Roadmaps détaillées (mémoire `~/.claude/.../memory/`)

- **Combat** : `battle-finish-roadmap-2026-06-01.md`, `battle-opcode-1to1-worklist-2026-05-31.md`.
- **Sac** : `BAG-PHASE-2-PLAN-1TO1.md`, `BAG-SPINE-PROGRESS.md`.
- **OW** : `CHANTIER-OW-1TO1-PROGRESS.md`. **Pokédex** : `POKEDEX-CHANTIER-1TO1-PLAN.md`.
- **Refactor arbre** : `REFACTOR-ARBRE-PLAN-POST-1TO1.md` (feu vert user).
- **Protocole 1:1 à relire avant chaque port** : `1to1-import-protocol.md`, `WORKING-MODE-deep-research-1to1.md`.
