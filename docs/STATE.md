# État du projet — port 1:1 Pokémon Émeraude

> **Doc canonique** : ce qui est fait / pas fait, les outils d'audit, le backlog
> priorisé. Mis à jour 2026-06-11. Branche `mirroir` (non poussée — on ne push jamais).
> Pour l'archi : `docs/ARCHITECTURE.md`. Pour les dettes ponctuelles : `DETTES-1TO1-STRICT.md`.

## ⚔️ ANIMS DE MOVE — LE PIPELINE GÉNÉRÉ (session 2026-06-11, ~20 commits)

**Le pivot user « extraction auto, pas de recopie » est EXÉCUTÉ** (docs/ROADMAP-ANIMS-1TO1.md) :

| Étage | Outil/Module | Contenu |
|---|---|---|
| Tables const | `scripts/extract-battle-anim-sprites.mjs` → `decomp-data/auto/src/battle-anim-sprites.ts` | 226 AnimCmd + 128 tables + 185 AffineAnimCmd + 101 tables + **387 SpriteTemplates** + 74 OAM |
| Gfx par tag | `scripts/extract-battle-anim-gfx.py` → `public/decomp/em/battle_anims/` | **289/289 tags** (manifest + .4bpp.bin/.gbapal, multi-frames concaténés) |
| Le bridge | `src/engine/battle/battle-anim-generated-bridge.ts` | lookupGeneratedTemplate : tag manifest + OAM + tables exactes + **callback par nom C** (`registerAnimCallbacks`) |
| Loader | `_loadAnimSheetByTag` (interpreter) | n'importe quel `loadspritegfx` charge depuis le manifest |

**LA SEULE CHOSE MANUELLE = les callbacks** (vagues 2a-3c : ~25 portés → ~66 templates actifs).
Les warns console `callback X non porté` = la liste de demande exacte des vagues suivantes.

**Racine VRAM morte** (4 itérations de sonde) : `_markLiveSpriteTiles` (sprites vivants + ranges
non-anim) avant CHAQUE alloc anim + realBytes + re-marquage post-free. Sonde de vérité :
`sSpriteTileRangeTags` par zones (« conflitsVram: AUCUN »).

**🏆 QUALIFICATION COMPLÈTE 2026-06-11 (soir)** : **354/354 moves gen1-3 VERTS**
(zéro soft-lock, zéro résiduel OAM) — sweep + re-sweep + garde-fous Cmd_end/
waitforvisualfinish + fix bindArgs (args nommés GAS) + createsoundtask registry.
~92 callbacks restent en fallback propre (anim sautée, listée par __warnCapture) ;
dette racine : affine variante≠0 des hitsplats (ended jamais — garde-fou actif),
chantier BG/monbg. Détail : audit-reports/anims/SWEEP-2026-06-11.md.

**Outils de qualif** : `__combatTest(['MOVE_X',...])` (Treecko lvl60 vs Wailord increvable) ;
`__testMoveAnim(id)` v4 (1 tick = 1 vraie frame, plafond 1800, oamResiduels + monDeplace) ;
`__animCallbackCanary` ; sweep de masse `__sweepResults` (354 moves).

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

### 🏁 2026-06-10 (suite) — GOAL 7 TRANCHES « combat 100% 1:1 miroir » : LIVRÉ

Sept tranches committées (ea19bcb8→T5), chacune tsc 0 + A/B harness :
1. **Capture finale** : 3 étoiles réelles (arc+flicker), yes/no surnom 1:1
   (vraie box+curseurs+inputs), PLAY_BGM/PLAY_SE/WAIT_SE au rendu texte (fix
   « attrapé!À » + fanfare MUS_CAUGHT), displaydexinfo flux 1:1.
2. **Sac combat complet** : dispatch data-driven `.battleUseFunc` — balls
   (+check box), X items (effet réel mon actif), **médecine bag→party→soin→
   retour combat** (A/B 18→33), escape (wild). Moteur : RunByUsingItem/
   PlayerUsesItem routés.
3. **VOIE V SUPPRIMÉE** (~6000 l. : battle-flow, trainer-battle-flow,
   battle-ball-throw, battle-intro-events, script-runner) + C4 WhiteOut
   net-effect (money/2+heal+EventScript_WhiteOut). KO-run WON + capture-run
   CAUGHT post-suppression.
4. **Placement miroir** : `src/game/battle_anim_throw.ts` (rename complet).
5. **Anims de mouvement** : `src/game/pokemon_animation.ts` (top-5 = 41%
   des species, scale matrice réel, Launch+delay 1:1).

**DETTES RESTANTES EXPLICITES (le contrat du goal)** :
- T1 : naming screen (OUI=sans surnom, warn) ; écran dexinfo (flux ok, UI page
  dex à porter) ; messages UI bag-battle (WontHaveEffect/BoxFull/DadsAdvice
  en console).
- T2 : branche AI trainer items (HandleAction_UseItem) ; EnigmaBerry.
- T3b : dépose des 13 shims re-export engine/battle→game (~21 importeurs,
  zéro logique dupliquée) ; warp lastHealLocation du WhiteOut (script joue,
  specials warp selon dispo).
- T5 : 56 ANIM_* de mouvement restantes (warn-once par anim) ; back anims.
- T6 : les fonctions .c manquantes par fichier = la section « Fonctions du .c
  absentes des miroirs » de `AUDIT-GAME-VS-DECOMP-2026-06.md` (battle_anim_mons
  111, menus 103, controllers link/multi 43, battle_interface 18,
  battle_gfx_sfx_util 21, pokeball 25 dont chaîne morte décomp) — backlog
  d'import incrémental, majorité link/multi/contest/Frontier hors scope démo.

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

## 2026-06-10 (soir) — GOAL 8 TRANCHES : état T1-T4 + dettes
- **T1 ✓** menu vide à chaque fade : scrolls BG reset au reshow 1:1 (reshow_battle_screen.c:56-63). VALIDÉ USER.
- **T2 ✓** pokemon_animation.c COMPLET : 62/62 anims de mouvement 1:1 (+1127 l.), A/B 8 familles.
- **T3 ✓** anims de STATUT : bytecode anim COMPLET (9215 ops, levée de la troncature 5000), tables de pointeurs extraites (anim-tables.json + battle-anim-tables.ts), résolution par NOMS, LaunchStatusAnimation/InitAndLaunchChosenStatusAnimation/TryHandleLaunchBattleTableAnimation 1:1, handlers controllers câblés. A/B poison bout-en-bout.
- **T4 ~70%** : registry créé (marqueurs nominaux ids 0x1000+, table dédiée 795 symboles, fix bitwise >>> 0), handlers MOVEANIMATION 1:1 (DoMoveAnim + tick), garde-fou opcodes/PC, AnimTask_ShakeMon/2 + lunge portés. LES SCRIPTS DE MOVE S'EXÉCUTENT (warns nominaux). RESTE : shake visible (hypothèse double-instance registry статique/dynamique), loadspritegfx réel (gfx par tag), déraillements PC move-0, autres templates/tasks par vagues.
- **INCIDENT MAJEUR RÉSOLU** (user-assist) : « ARCKO est déjà empoisonné » bloquant = bytecodes scripts_1/2 re-cassés par les recompiles T4 successifs (l'Intimidation de Mightyena déraillait). Restauration + RÈGLE : jamais recompiler sans restaurer/vérifier les non-cibles.
- **T5-T8 : non commencées** (shiny/move-switching/hit-shake/yes-no helper ; shims+renames ; naming/dexinfo ; doc+3 runs).

## 2026-06-10 (nuit) — GOAL 8 TRANCHES : RAPPORT FINAL
**T1 ✓ · T2 ✓ · T3 ✓ · T4 jalon majeur · T5 3/4 · T6 1/2 · T7 dette re-documentée · T8 ✓ (3 runs verts)**

### Livré cette session (commits f109ab73 → HEAD, tsc 0 partout)
- T4 JALON : **première anim de move 1:1 fonctionnelle** (POUND → AnimTask_ShakeMon → la cible TREMBLE à l'écran). Chaîne complète : bytecode asm régénéré (9215 ops) → tables de noms → marqueurs nominaux (handlers natifs compileur pour createsprite/createvisualtask/createsoundtask — l'expansion générique désalignait TOUT) → registry singleton global → AnimTask TS → pixels. + handlers MOVEANIMATION 1:1 (DoMoveAnim+tick), garde-fou opcodes/PC (terminaison propre = jamais de soft-lock).
- T5 : DoHitAnimHealthboxEffect 1:1 (healthbox oscille au hit, A/B ✓) ; PlayerHandleYesNoBox/Input 1:1 (le yes/no controller réel) ; runBattleYesNoMachine (helper réutilisable, suggestion user).
- T6 : 5 shims déposés (battle-healthbox-l/healthbox/hp-bar/party-summary/reshow-battle-screen) — importeurs redirigés vers les miroirs, KO-run post-dépose ✓.
- T8 : **KO-run ✓ + capture-run ✓ + médecine-run ✓** (combat→KO→OW ; Master Ball→capture→OW ; dégâts→potion→31/31→tour fini).

### Dettes restantes EXPLICITES (goal final)
- **T4** : loadspritegfx réel (gfx par tag → hitsplat/particules visibles) ; templates/tasks par vagues (les warns nominaux tracent la demande : gSlideMonToOffset/OriginalPos en tête) ; Translate* helpers ; déraillements PC résiduels tracés (move-0, 0x78@21334) ; monbg/MoveBattlerSpriteToBG réels.
- **T5** : TryShinyAnimAfterMonAnim (chantier gfx shiny) ; HandleMoveSwitching (réarrangement moves, ~150 l.) ; basculer les 2 sites yes/no script sur le helper (A/B dédié).
- **T6** : ~40 renames-miroir des équivalents fonctionnels (DETTE-T6-COMBAT-MISSING.md) ; fichiers engine/battle restants à migrer au nom décomp.
- **T7** : DoNamingScreen + CB2_DisplayDexInfo = écrans entiers (clavier/OAM dex) — le backbone actuel ne les fournit pas ; la capture fonctionne avec auto-NO documenté + dexflags posés. DETTE ASSUMÉE (1:1 différé, comportement net préservé).
- Hors-scope permanent : link/multi/contest/Frontier/Safari/Palace/debug.

## 2026-06-11 — GOAL 8 TRANCHES : RAPPORT FINAL v2 (nuit complète)
**T1✓ T2✓ T3✓ · T4 : TACKLE VISUELLEMENT COMPLET · T5 3.5/4 · T6 1/2 · T7 dette-doc · T8✓ (KO-run final vert avec toutes les anims actives)**

### Jalons additionnels de la nuit (post-rapport v1)
- **T4 hitsplat VISIBLE** : battle_anim_normal.ts (gBasicHitSplat+HandleInvert, AnimHitSplatBasic, LoadAnimImpactGfx pattern LoadBallGfx) + impact.png extrait byte-exact + registry load/oam + Cmd_createsprite route les tags via CreateSprite SYSTÈME. L'étoile d'impact d'Émeraude éclate à l'écran.
- **T4 slides 1:1** : SlideMonToOffset/OriginalPos(+Step) + InitSpriteDataForLinearTranslation + TranslateSpriteLinearByIdFixedPoint — le Tackle adverse glisse réellement. **Tackle = lunge + slide + hitsplat + shake, complet hors fond.**
- **T5 HandleMoveSwitching 1:1** : SELECT au menu moves → swap complet (bufferA + gBattleMons + ppBonuses + party) validé harness ([1,43,71,98]→[98,43,71,1]).
- **PATTERN GFX INDUSTRIALISÉ** : png→4bpp.bin/gbapal (convertisseur validé) → preload decomp-loop → template registry {tileTag, oam, load, callback}. Les warns console = la liste de demande réelle des prochaines vagues.

### Dettes restantes (mises à jour)
- T4 : vagues gfx suivantes guidées par les warns (Scratch/Ember/Bubble/Absorb...), offset Y du splat, monbg/MoveBattlerSpriteToBG réels, opcodes déraillements résiduels (move-0).
- T5 : TryShinyAnimAfterMonAnim (gold stars gfx — le pattern hitsplat s'applique tel quel).
- T6 : ~40 renames-miroir (DETTE-T6-COMBAT-MISSING.md).
- T7 : DoNamingScreen + dexinfo (dette assumée, capture OK avec auto-NO).

## 2026-06-11 (matin) — RAPPORT FINAL v3 : T4 CHEMIN DE JEU COMPLET
**Les 6 moves nommés du goal sont TOUS visibles et A/B-validés au pixel :**
Tackle (lunge+slide+hitsplat+shake) · Growl (noise lines+double cri) · Scratch
(griffures dorées 5 frames) · Ember (flamme en vol — LE PROJECTILE GÉNÉRIQUE
Translate* 1:1 : InitAnimLinearTranslation/AnimTranslateLinear fixed-point) ·
Bubble (template projectile) · Absorb (orbes drain cible→attaquant).
Fallback documenté : move sans template = terminaison propre warn-once.

### Bilan goal 8 tranches (final)
- T1 ✓ (user-validé) · T2 ✓ (62/62 anims) · T3 ✓ (statuts) · **T4 ✓ chemin de
  jeu** (6/6 nommés ; les ~400 autres moves = pattern industrialisé, vagues
  guidées par les warns) · T5 3.5/4 (shiny restant — pattern hitsplat
  applicable) · T6 1/2 (5 shims déposés ; ~40 renames listés) · T7 dette
  re-documentée (clause du goal) · T8 ✓ (3 runs verts + docs).
- Dettes 1:1 douces tracées : offset Y splat, oscillation flare Ember,
  trajectoire sinusoïdale Bubble, affine réel hitsplat (scale-in net-effect).

## 2026-06-11 — RAPPORT FINAL v4 : T5 COMPLET (4/4) — LE SHINY VIT
- **SHINY 1:1 validé au pixel** : Grahyena DORÉ (palette shiny.pal réelle, GET_SHINY_VALUE 1:1) + étoiles dorées encircle/diagonal + SE, DÈS L'APPARITION (timing user). Diagnostic user x2 (étoiles tetris = fix ball template-à-tags ; palette shiny manquante = GetMonFrontSpritePal payé).
- Bilan goal : **T1✓ T2✓ T3✓ T4✓(chemin 6/6) T5✓(4/4) T8✓** · T6 1/2 (~40 renames listés) · T7 dette-doc (clause goal).
- Non-régression : KO-run final à refaire post-shiny (le câblage apparition touche le flux d'intro).

## 2026-06-11 — RAPPORT FINAL v5 : GOAL 8 TRANCHES CLOS
**Les 8 tranches sont committées, tsc 0, chacune A/B-validée en harness (+ screenshots — règle user adoptée).**
- T1 ✓ menu vide au fade (reset scrolls reshow, user-validé « ça marche »)
- T2 ✓ 62/62 ANIM_* mouvement (A/B 8 familles)
- T3 ✓ anims de statut bout-en-bout (TryHandleLaunchBattleTableAnimation + InitAndLaunchChosenStatusAnimation, poison visible)
- T4 ✓ chantier anims de move : bytecode 9215 ops + registry + marqueurs nominaux + 6/6 moves du chemin (Tackle/Growl/Scratch/Ember/Bubble/Absorb) visibles au pixel + LE projectile générique Translate* 1:1 + fallback warn-once documenté
- T5 ✓ 4/4 : shiny (doré + étoiles, apparition), HandleMoveSwitching, DoHitAnimHealthboxEffect, PlayerHandleYesNoInput + helper réutilisable
- T6 ✓ 9/9 shims réels déposés + ~30 renames-miroir tombés en vrai ; ~15 nominaux restants = dette listée (DETTE-T6-COMBAT-MISSING.md mis à jour, fait foi)
- T7 ✓ clause du goal activée : DoNamingScreen + dexinfo = dette re-documentée (backbone naming/pokédex hors-périmètre combat)
- T8 ✓ KO-run + capture-run + médecine-run verts + ce rapport
**Fixes user de la session (tous validés screenshot/spy)** : anims résiduelles à l'écran (DestroyAnimSprite objet|id SANS gSprites.delete), healthbox écrasée (targetTileBase fixes 704-968), BGM victoire (414, double trou), barre EXP (signe + SE 33), shiny complet.
**Hors-scope** : link/multi/contest/Frontier/Safari/Palace/trade/doubles — dettes explicites.
**EN STOCK user** : pixels corrompus haut du shiny pendant son anim ; autres bugs à lui demander.

## 2026-06-11 (soir) — GOAL « INTROS + OPTION + TOUTES LES ANIMS » : état v6
**Tranches A/B/C0 COMPLÈTES (A/B-validées screenshots)** :
- A : 10/10 intros terrain (racine « barres noires » = ResetPaletteFade stub vide → câblé ; fix BLDALPHA_BLEND evb).
- B : option ANIMS DE COMBAT 1:1 opérationnelle (fix === true vs 0/1 ; toggle gSaveBlock2Ptr.optionsBattleSceneOff).
- C0 : unloadspritegfx 1:1 (VRAM libérée par tag), alloc dynamique (réserve 0x140 post-ResetSpriteData), Translate* dans battle_anim_mons.

**C1..Cn EN COURS (~30/415 moves mécaniquement verts)** — recadrage user intégré :
- LES DEUX MOTEURS DE TABLES 1:1 BRANCHÉS : ANIMCMD (AnimateSprite sprite.c:901) + AFFINEANIMCMD (BeginAffineAnim, registre extras). Les templates portent leurs VRAIES tables décomp → fidélité par construction. Pilotes : Scratch (gScratchAnimCmds), hitsplat (sAffineAnims_HitSplat 4 courbes), crocs Bite (gAffineAnims_Bite 8 rotations).
- __combatTest(['MOVE_X',...]) : combat réel vs Wailord lvl100 Splash-only (increvable) — la qualification visuelle humaine move par move (méthode user).
- Outils : __testMoveAnim v3 (ok + oamResiduels + monDeplace), getDebugState, garde-fous (waitforvisualfinish borné + purge/reveal par identité + restauration battlers).
- Dettes actives : ciblage createsprite (crocs sur l'attaquant — vérifier ANIMSPRITE_IS_TARGET), carte VRAM OBJ (mons dynamiques, réserve 0x280 casse le send-out), orphelin mud cosmétique, ~385 moves à porter/qualifier par vagues.
