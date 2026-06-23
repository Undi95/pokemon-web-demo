# Plan — Réplique 1:1 INTÉGRALE de l'arbre décomp (marathon)

> **Décision user 2026-06-21.** Objectif : que TOUT le port soit un miroir 1:1 strict et INTÉGRAL de
> `decomps/pokeemeraude`, fichier par fichier, fonction par fonction, import par import — arborescence
> comprise. Marathon assumé (« ultra long, je m'en fou »). Supersede `MIGRATION-GAME-1TO1.md` (migration
> game/ incrémentale) et lève le « plat verrouillé » sur l'axe structure (le src/ reste plat car décomp src/ plat).

## Décisions verrouillées
- **STRUCTURE = réplique 1:1 intégrale de l'arbre décomp.** On recrée l'arbre complet :
  `src/` (miroir PLAT des `.c`), `include/` (+ `constants/`, `gba/`), `data/` (tables/maps/scripts/.inc),
  `gfx/` (TOUS les assets), `sound/`. Le **harness pur maison** (scènes Phaser, devtools, émulation GBA,
  m4a synth, glu Vite) = **isolé dans un dossier clairement NON-décomp** (ex. `src/_harness/` ou `engine/`).
- **100 % SOLO** — zéro agent, même la passe de vérification. (Le « solo relaxé pour audit read-only » NE
  s'applique PAS à ce chantier.) Continuer d'ignorer « ultracode/Workflow ».
- **1:1 INTÉGRAL** : pas de port partiel laissé tel quel — chaque fichier décomp est complété à 100 % de
  ses fonctions, mêmes noms (fichier/fonction/global/constante), mêmes imports/inclusions, ligne-à-ligne.
- **Assets en masse** : importer TOUS les gfx/tilesets d'un coup (fini le goutte-à-goutte par feature).

## Contrat (inchangé, rappel)
Branche `mirroir`, **JAMAIS push**. **tsc=0 + A/B réel en jeu** avant chaque commit (jamais « zéro régression »
par raisonnement). 1 mécanisme/lot = 1 commit (msg FR heredoc Bash `<<'EOF'` + trailer
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`). Chemins absolus + `git -C`. Stage
EXPLICITE (jamais `git add -A`, jamais commit `audit-reports/1to1/COVERAGE-GLOBAL.md`). Audio : appeler
PlaySE/PlayCry/PlayBGM OK, NE PAS toucher le moteur SE/BGM. Décomp = `D:/Projet 1/decomps/pokeemeraude`.
User VISION RÉDUITE → sondes déterministes + décrire les visuels (et mode « stop avant commit + explique
quoi vérifier » pour le visuel). Zéro cast/approximation pour faire taire un type.

## Cible d'arborescence — VERROUILLÉE (décision user 2026-06-22)
**Option 1 = miroir À LA RACINE du repo, arbre COMPLET (zéro aplatissement — la décomp n'est pas plate).**
Chaque `decomp/<chemin>/X.c` → `port/<chemin>/X.ts` au MÊME chemin. Arbre décomp relevé :
`decomp/src/` = 310 `.c` à plat + `src/data/` (13 sous-dossiers : bard_music, battle_frontier, decoration,
easy_chat, field_effects, graphics, object_events, pokemon, pokemon_graphics, region_map, text, tilesets,
trainer_graphics) ; `include/` + `include/constants/` + `include/gba/` ; root `data/ graphics/ sound/ constants/`.
```
<repo>/
  src/            ← decomp/src/*.c → *.ts (310, à plat comme la décomp) + src/data/<13 sous-dossiers>/*.ts
  include/        ← decomp/include/*.h → *.ts   (+ include/constants/, include/gba/)
  data/           ← decomp/data/ (maps/scripts/layouts/.inc) — DÉJÀ servi depuis public/decomp/em/ au runtime
  graphics/       ← decomp/graphics/ (assets) — DÉJÀ sous public/decomp/em/
  sound/          ← decomp/sound/ (refs ; moteur m4a = harness)
  harness/        ← MAISON, hors décomp : scenes Phaser, gba/ (émulation+compositor+bridge), devtools,
                    m4a/ (synth), decomp-runtime/globals/bridge, glu Vite, main.ts, index entry.
```
> ⚠️ `src/engine/` actuel = MIX : (a) HARNESS pur (gba/, m4a/, system/decomp-runtime|globals|bridge, devtools,
> boot glu) → `harness/` ; (b) sous-systèmes décomp éclatés (engine/field, engine/script, engine/battle,
> engine/ui, engine/pokemon, engine/bag, engine/save, engine/decomp-data) → consolider vers `src/<nom décomp>.ts`
> (plat) ou `include/`/`src/data/` selon leur nature. L'actuel `src/game/*.ts` (105, déjà nommés décomp) → `src/*.ts`.
> Assets (data/graphics) déjà en `public/decomp/em/` (chargés au runtime) — le miroir de chemin source porte surtout sur `src/`+`include/`.

> ⚠️ RÉGRESSION DÉFÉRÉE (user 2026-06-22) : warp porte/autre → le perso spawn au mauvais endroit, puis est
> recalé après le fade (visible 1-2 frames). À traiter pendant la revue de `field_screen_effect.c` (SetUpWarpExitTask).

## Phases (ordre recommandé — grind incrémental, commits vérifiés)
**Phase 0 — CARTOGRAPHIE complète (la « vérif tout fichier »).**
Énumérer TOUT l'arbre décomp (src/, include/, data/, gfx/, sound/, asm/). Pour chaque fichier décomp :
où vit-il chez nous (ou manquant) + % de complétude 1:1 + nature (logique/data/include/asset/harness).
Produire un CHECKLIST maître = le backlog du marathon. Réutiliser `scripts/audit-game-mirror.cjs` +
`npm run coverage:1to1` comme point de départ MAIS étendre à l'arbre entier (pas que les .c). Sortie :
`docs/FULL-1TO1-CHECKLIST.md` (vivant, coché au fur et à mesure).

**Phase 1 — RESTRUCTURE (arbre cible + rewire imports).**
Créer l'arbre cible. Déplacer les fichiers à leur place décomp, INCRÉMENTALEMENT par sous-système.
`git mv` + reroute imports (généraliser `scripts/migrate-game.cjs`) + tsc=0 + boot après chaque lot.
Isoler le harness dans `_harness/`. Ne JAMAIS casser le boot entre 2 commits.

**Phase 2 — IMPORT ASSETS en masse.**
Une extraction/import exhaustive de TOUS les gfx/tilesets décomp → `gfx/` (étendre les `extract:*`).
But : plus jamais d'import manuel par feature.

**Phase 3 — COMPLÉTION 1:1 fichier par fichier (le gros du marathon).**
Pour chaque entrée du checklist non-100% : compléter à 1:1 intégral (toutes les fonctions du .c,
mêmes noms/imports, ligne-à-ligne), tsc=0 + A/B réel, marquer `// #100%`, cocher le checklist, commit.
Prioriser le cœur jouable d'abord (overworld → combat → menus), différer les sous-systèmes hors-scope
SEULEMENT s'ils sont explicitement déférés (mais l'objectif est INTÉGRAL → à terme tout y passe).

## AVANCEMENT Phase 1 — RESTRUCTURE (mis à jour 2026-06-22)
**Harness 100 % extrait** vers `harness/` : m4a, gba, devtools, util, scenes, boot (lots 1-4),
**runtime** (lot 6 : decomp-runtime/globals/bridge/helpers, gba-global-scope, gba-io-regs,
window-renderer, input-handler, decomp-constants, data-tables, static-data-tables → `harness/runtime/`),
**main.ts** (lot 7 : bootstrap Phaser/Vite → `harness/main.ts` + `index.html`, libère le nom `src/main.ts`
pour le futur `main.c`).

**`game/ → src/` racine** (lot 5, centerpiece) : 105 miroirs .c à plat + `include/` racine + `src/data/`.

**Relocalisations 1:1 propres** (mono-fichier = miroir de facto d'un seul .c, cible libre) :
- lot 8 : `palette.ts`(palette.c), `rtc.ts`(rtc.c), `clock.ts`(clock.c←time-based-events), `include/constants/metatile_behaviors.ts`.
- lot 9 : `mail.ts`, `item_icon.ts`, `player_pc.ts`(←bedroom-pc), `load_save.ts`, `battle_bg.ts`, `item_use.ts`(←item-use-callbacks), `main_menu.ts`(←main-menu-impl).

**Outil** : `scripts/move-tree.cjs` (réécriture path.relative des specifiers ; **fix** : normalise les
extensions → gère les moves de FICHIER, pas que de dossier). Process/lot : dry → rewrite → preview_stop
(verrou Windows) → git mv → tsc=0 → boot A/B (?nointro, sortie camion droite → warp Littleroot + event maman) → stage explicite → commit.

### RESTE de `src/engine/` (~260 fichiers) = surtout des FUSIONS N:1 (Phase 3, travail de contenu)
La décompo maison a éclaté chaque `.c` en plusieurs fichiers → mirror = MERGER les splits dans UN `.ts`/`.c` :
- **`script/script-opcodes-*.ts` (37)** → `src/scrcmd.ts` (handlers d'opcodes ; les `-berry/-contest/-decoration/...`
  ne sont PAS les miroirs de berry.c/contest.c mais les branches scrcmd → tout va dans scrcmd.ts).
- **`battle/*.ts` (50)** → `src/battle_*.ts` existants (battle_main/controllers/anim/script_commands/util/...).
  Ex `battle-controllers*.ts`(5)→battle_controllers.c ; `battle-anim-interpreter/-registry/-generated-bridge`→battle_anim.c.
- **`bag/*.ts` (7)** → `item_menu.c` + `item.c`. **`save/*.ts`** → `save.c`(system+sectors) + `event_data.c` + ...
- **`pokemon/*.ts` (10)** → `pokemon.c`/`pokemon_animation.c`/`secret_base.c`/`pokemon_icon.c`/`item.c`(pc-items) existants.
- **`ui/*.ts` (25)** → `menu.c`/`text.c`/`window.c`/`text_window.c`/`menu_helpers.c`/`option_menu.c`(impl+return)/
  `pokedex.c`(screen+flags)/`pokemon_summary_screen.c`(summary+anim)/`tv.c`/`wallclock.c`/`start_menu.c`/...
- **`field/*.ts` (21)** → `event_object_movement.c`/`fieldmap.c`/`field_effect.c`/`field_region_map.c`/...
- **`system/` reste 7** : `random.ts`(shim→src/random.ts, déduper+sortir SeedRng→main/new_game),
  `music.ts`(bridge M4A→classer harness vs sound.c), `fade-screen.ts`(→merge field_weather.c),
  `flash-mask.ts`(→fldeff_flash.c+field_screen_effect.c), `pokeball-effects.ts`(→battle_anim_throw.c+pokeball.c),
  `multichoice-data.ts`(loader→src/data/script_menu), `string-buffers.ts`(glue→merge string_util.ts).
- **`decomp-data/` (97)** = data extraite + headers → `src/data/` + `include/`(+constants/+gba/) ; relocalisation
  en masse mais suffixe `-data.ts` ≠ décomp → étape dédiée (préserver le câblage des loaders harness).
- **`decomp-impls/` (2)** → `sprite.c` (merge dans `src/sprite.ts`).

Ces fusions = vrai travail ligne-par-ligne (lire le .c décomp, réconcilier, A/B comportemental), 1 sous-système/lot,
PAS des `git mv` mécaniques. Prochain : attaquer un sous-système borné de bout en bout (candidat : `scrcmd` ou `save`).

### Avancement decomp-data/src/ — scaffolds inlinés (2026-06-23, lots 20-25)
Méthode validée (= scaffold importé par peu de fichiers → inliner les symboles RÉELLEMENT
importés dans le .c-mirror 1:1, droper les métadonnées scaffold mortes, supprimer le fichier,
tsc=0 + A/B en jeu). ⚠️ Vérifier les importeurs avec `./X` intra-dossier (piège grep) + cycles ESM.
- ✅ `sine-table.ts` → `gSineTable` littéral Q_8_8 inline dans `src/trig.ts` (`7e32a765`).
- ✅ `battle_bg-data.ts` → `gBattleBgTemplates` dans `battle_bg.ts` + `sStandardBattleWindowTemplates`
  raw dans `battle-windows.ts` (cycle battle_bg↔battle-windows évité) (`2cd05165`).
- ✅ `option_menu-data.ts` → `sOptionMenu{Bg,Win}Templates` dans `option-menu-impl.ts` (`28c9a4fa`).
- ✅ `item_menu_icons-data.ts` → `TAG_BAG_GFX`/`TAG_ROTATING_BALL_GFX` export dans `item_menu_icons.ts`
  (`34d4cbda`) + **fix divergence `TAG_ITEM_ICON` 5557→102** (valeur enum décomp, `b5186018`).
- ✅ `item_menu-data.ts` → `TAG_POCKET/BAG_SCROLL_ARROW` dans `bag-menu.ts` (`c992ddd9`).
- ✅ `battle_setup-data.ts` → `TRANSITION_TYPE_*` dans `battle-setup-helpers.ts` (`6d938bde`).

RESTE decomp-data/src/ (= plus involved, chantiers dédiés) :
- **Cluster intro LIVE** (`intro-callbacks-auto`, `intro-c-data-auto`, `intro-data`, `_data-tables-flat`,
  `sprite-system`(+flat), `intro_credits_graphics-*`) = web auto-gen interdépendant, imports relatifs
  `./X` → piège ; chantier intro `src/intro.c`/`intro_credits_graphics.c` dédié.
- **`-callbacks-auto` LIVE** (`main_menu-`, `option_menu-`, `overworld-`, `title_screen-`) = grosses
  state-machines auto-gen ; consolidation par .c.
- **main_menu** : 2 scaffolds (`decomp-data/src/main_menu-data` ↔ BirchRuntimeScene harness ;
  `decomp-data/main-menu-data` ↔ `src/main_menu.ts`) avec `sMainMenuBgTemplates` DUPLIQUÉ + casts
  `as any` → lot de consolidation vers `src/main_menu.ts` (+ retirer les casts).
- **Grosses tables port-adaptées** : `battle_anim_pic_table-data` (~290 entrées, struct `AnimPicEntry`
  ≠ C, png-loader runtime), `mon-anim-tables-data` (465 l, import dyn) → consolidation battle_anim/pokemon.
- **Audio (NE PAS toucher le moteur)** : `programmable-waves`, `song-table` → différés.

## État au lancement
- HEAD `7a59a425` (branche mirroir, rien poussé). Couverture réelle ~37 % cœur cité 1:1 (cf. coverage).
- Outils : `audit-game-mirror.cjs`, `coverage:1to1`, `migrate-game.cjs` (non-trackés). `audit:scrcmd`/
  `audit:specials` réparés. Hook `__scriptRuntime.getOpcodeHandler`.
- ⚠️ BUG DÉFÉRÉ (diagnostiqué, non corrigé) : input pendant la marche (A → interaction acceptée à la frame
  de frontière alors que le sprite est visuellement mid-step = désync ~1 frame held-finish vs render M3 ;
  gate + tts confirmés 1:1). À reprendre après/pendant le restructure (le timing held-movement sera revu).

## Cadence
Marathon = grind par lots committés et vérifiés, JAMAIS un big-bang. Tenir le checklist à jour. Le boot
doit rester vert entre chaque commit. Avancer sous-système par sous-système jusqu'au 1:1 intégral.
