# ROADMAP — Animations de moves 1:1 strict (agent 2026-06-11)

> Demande user : « roadmap des imports 1:1 miroir strict de toutes les animations
> de moves, les emplacements finaux des pokémon, ce qu'il nous manque ». Constat :
> les callbacks étaient réécrits À LA MAIN (le faux pas) — tout passe en
> EXTRACTION AUTOMATIQUE + port 1:1 du socle d'abord.

## LE PÉRIMÈTRE (chiffres décomp réels)
- **395 scripts** : 356 Move_* + 9 Status_* + 23 General_* + 7 Special_*.
- **26 fichiers C**, **1211 fonctions**, ~397 SpriteTemplates, ~226 tables AnimCmd, ~185 AffineAnimCmd, 72 OamData.
- **289 ANIM_TAG_*** (gBattleAnimPicTable/PaletteTable), 279 PNG sprites + 27 BG.
- Consommation scripts : 276 templates uniques, 198 AnimTask/SoundTask uniques, 192 tags loadspritegfx, **412 monbg**, 167 setalpha.

## NOTRE ÉTAT (mesuré) : ~190/1211 corps (16 %)
- battle_anim_mons.ts 31/120 (1:1 propre — GetBattlerSpriteCoord EXISTE, pas branché dans createsprite !) ; mon_movement 30/34 ; throw 76/78 ✓ ; le reste embryonnaire/net-effect ; 13 fichiers INEXISTANTS.
- Registry : 15/276 templates, 9/198 tasks. 5 types AnimSprite dupliqués.
- **ORPHELIN découvert** : src/engine/battle/battle-anim-normal.ts (32 fonctions 1:1 BlendColorCycle & co) jamais importé/enregistré.
- Interpreter : monbg/clearmonbg/MoveBattlerSpriteToBG/LoadMoveBg = STUBS VIDES (412 usages !) ; createsprite positionne par hack au lieu du GetBattlerSpriteCoord 1:1 ; loadspritegfx sans gBattleAnimPicTable (10 tags manuels/192).
- **ATOUT** : extracted-all JSON = les 1211 corps déjà extraits ; extract-sprite-system.mjs parse DÉJÀ AnimCmd/AffineAnimCmd/Templates (menus) — à étendre aux 26 battle_anim ; extract-png-indexed-tiles.mjs = conversion exacte ; 384 templates déjà en decomp-data (réfs nominales).

## RÉPONSE : OUI, importer le socle AVANT les attaques
Ordre des prérequis (dicté par les chiffres) :
1. Extraction AUTO des tables const (zéro recopie manuelle = zéro approximation).
2. gBattleAnimPicTable auto (289 tags → gfx par tag générique).
3. Moteur battle_anim.c (monbg !) + GetBattlerSpriteCoord branché.
4. battle_anim_mons.c COMPLET (120 fn — GetBattlerSpriteCoord 386 call-sites, StoreSpriteCallbackInData6 103).
5. SEULEMENT APRÈS : les attaques.

## LES PHASES
### Phase 0 — Tables auto (`extract-battle-anim-sprites.mjs`)
Étendre extract-sprite-system.mjs aux 26 fichiers + battle_anim.h ; gérer ANIMCMD_END_ALT (14) + .hFlip/.vFlip nommés (148) ; émettre aux formats des moteurs EXISTANTS (sprite-animation.ts / sprite-affine-extras.ts) ; templates avec callback PAR NOM + OAM réels (72 gOamData). ~397 templates + ~226 + ~185 tables générés. Validation : audit 0 table manquante vs grep décomp.

### Phase 0bis — Gfx par tag (gBattleAnimPicTable)
Batch extract-png-indexed-tiles.mjs piloté par graphics-data.ts : 279 PNG → .4bpp.bin+.gbapal + 27 BG + manifest 289 entrées {tag, fichier, size} + loader runtime GÉNÉRIQUE par tag (remplace les loaders manuels). Validation : les 192 tags loadspritegfx résolus, 0 tag sans asset.

### Phase 1 — Socle moteur (port manuel 1:1, ~104 fn)
- Brancher GetBattlerSpriteCoord 1:1 dans Cmd_createsprite (virer le hack).
- monbg RÉEL : MoveBattlerSpriteToBG/Task_UpdateMonBg/clearmonbg/ResetBattleAnimBg + LoadMoveBg/LoadDefaultBg (27 BG) + IsBattlerSpriteVisible réel.
- battle_anim_mons.ts 120/120 (translations Fast/ById/Arc, affine task data, BG helpers, palettes masks, clones/traces, subpriorités).
- Brancher l'orphelin battle-anim-normal.ts ; UN type AnimSprite partagé.
Validation : POUND/TACKLE/CUT pixel-fidèles ; 0 warn opcode.

### Phase 2 — Transversaux (~61 fn) : mon_movement 34/34, utility_funcs 42/42 (BlendBattleAnimPal = 89 usages), sound_tasks 15/15 (PlaySE1/2WithPanning = 47). → top-20 createvisualtask couvert ≈ 70 % des occurrences.

### Phase 3 — normal + effects_1/2/3 (~420 fn) : draft auto depuis extracted-all (transpile-decomp-all.mjs) puis passe manuelle 1:1. Validation : GEN 1 COMPLET (moves 1-165) sans symbole non résolu.

### Phase 4 — 13 fichiers de type + statuts (~370 fn) : ordre ROI fire/water/electric/fight d'abord. Validation : 395 scripts sans warn ; 9 Status_* en combat réel.

### Phase 5 — Audit final : showcase des 395 scripts via __combatTest + audit-anim-1to1.mjs (0 symbole/tag/table manquant) + spot-check vs mGBA.

**Restant : ~990 corps (~150 en Phases 1-2 qui débloquent tout) ; 100 % des ~800 tables/templates/gfx par GÉNÉRATION, pas à la main.**
