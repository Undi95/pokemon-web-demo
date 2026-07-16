# CHANTIER MOTEUR 100 % — plan directeur (2026-07-16, demande user)

**Objectif user** : « Sur les fichiers moteur : un 100 % parfait. Sur les fichiers hors moteur :
corriger/fixer/supprimer les dupes, code dans le .ts exact décomp miroir 1:1. Simuler le moteur
dans différents états pour trouver tout ce qui est stub, no-op ou TODO. »
**Modèle d'exécution** : agents Opus (spec fermée, un rapport par lot) → Fable vérifie en jeu → commit.
**Source de vérité** : les 12 rapports `audit-reports/engine/*.md` (vague complète, commits
`a1420244a` + `124357243`) — chaque agent de fix LIT son rapport source avant de toucher au code.

## Séparation moteur / hors-moteur (actée par l'audit)
- **MOTEUR** (objectif 100 %) : sprite.c, bg.c, window.c, text.c (émulé-acté), palette.c, text_window.c,
  main.c, task.c, dma3_manager.c, gpu_regs.c, io_reg.c, malloc.c (exempt GC), decompress.c (adapt fetch),
  string_util.c + international + dynamic_placeholder, menu.c, menu_helpers.c, list_menu.c,
  scanline_effect.c, trig.c, util.c, random.c, sound.c (interface) + PPU compositor (spec GBATEK).
- **HORS-MOTEUR** : tout le reste de src/ — cible = miroir 1:1 strict, zéro dupe, zéro helper maison.

## PHASE A — fixes moteur (vague Opus n°1 EN COURS, 4 lots)
- **Lot A1 palette** (source : palette.md) : dispatch FAST_FADE (decomp-runtime UpdatePaletteFade),
  flush PLTT immédiat forcé de BeginNormalPaletteFade (palette.c:193-199), ResetPaletteFadeControl 1:1
  exportée + call-sites, purge des 4 rustines (battle_anim.ts:1036/1042 no-op, battle_main.ts:593 stub,
  _LoadCompressedPalette :6614), alias 1:1 des champs gPaletteFade (y/blendColor/targetY…).
- **Lot A2 bg** (source : bg.md) : WriteSequenceToBgTilemapBuffer impl 1:1 (bg.c) + câbler match_call.ts:1971/2131 ;
  SetBgMode réel (pokenav_region_map) ; CopyToBgTilemapBufferRect → rediriger les 3 __wireTodo vers l'impl
  window.ts:1207 ; SetBgTilemapBuffer/Unset no-op CENTRALISÉ (plus de throw credits/conditions) ;
  SetBgAffine + SetBgAffineInternal 1:1 (bg.c:772/244, scène Rayquaza) ; LoadBgTilemap 1:1 (battle_intro).
- **Lot A3 scanline/PPU** (source : ppu-compositor.md) : _applyRegFromValue → router TOUS les registres
  (WIN0H/V, WIN1H/V, BLDCNT/BLDALPHA/BLDY, WININ/WINOUT — plus jamais « 0x40 → bg3.hofs ») ; PURGER les
  2 rustines rendues obsolètes (flash-mask.ts gaté par nom de CB2, glow Pokénav fenêtre statique
  pokenav_menu_handler_gfx.ts:1544-1553 → scanline réelle 1:1) ; mosaic BG vertical (compositor:209) ;
  sync sprite.mosaic → oam.mosaic (sprite.ts:1898-1924) + rendu du bit par-sprite ; forced blank
  (DISPCNT bit 7 → écran blanc) ; fallback matrice identité → console.error (hurler, pas masquer) ;
  clamp BLDY ≤16 + expansion RGB15 exacte (x*255/31 vs ×8, types.ts:29-31).
- **Lot A4 sprite** (source : sprite.md) : anchor-matrix complet (SetSpriteMatrixAnchor/GetAnchorCoord/
  UpdateSpriteMatrixAnchorPos, sprite.c:1206-1244 + branches if(anchored) dans Begin/ContinueAffineAnim) ;
  loops affines à compteur 1:1 (AFFINEANIMCMD_LOOP(n), JUMP target≠0, BeginAffineAnimLoop/
  ContinueAffineAnimLoop/JumpToTopOfAffineAnimLoop) ; AddSubspritesToOamBuffer : enfants HÉRITENT
  affineMode+matrixNum (destOam[i]=*oam, decomp-globals:1978) ; SortSprites ajustement Y
  AFFINE_DOUBLE+SIZE_3 (sprite.c:391-411) ; SetOamMatrix UNE impl 1:1 signée ; Copy{To,From}Sprites ;
  gAffineAnimsDisabled.
- Règles DURES par agent : lire le rapport source + le .c AVANT d'éditer · 1:1 strict, zéro improvisation ·
  `npx tsc --noEmit` = 0 · PAS de serveur/jeu/git · rapport `audit-reports/engine/fix-<lot>.md` ·
  si ambigu/intranscriptible → STOP + le dire.

## PHASE B — « simulateur d'états » (exerciseur anti-stub) — vague n°2
1. **Inventaire mécanique** : script `scripts/audit-engine-stubs.cjs` : scanner src/+harness/ pour
   __wireTodo/no-op/TODO/stub/_warnOnce/@ts-nocheck + les `default:` silencieux des switch de registres →
   `audit-reports/engine/STUBS-INVENTORY.md` (compte par fichier, call-sites atteignables).
2. **Gardes moteur** partout (pattern StringCopy/LoopedTask déjà posé) : toute primitive moteur absente
   THROW avec son nom (fini les no-op silencieux). Whitelist explicite des no-op LÉGITIMES (link/hw).
3. **Exerciseur E2E** : `__e2e.run('engine-sweep')` — boot → ouvre CHAQUE écran porté (start menu, sac,
   PC, pokédex, party, summary, trainer card, options, pokénav complet, save, shop, combat via launchTB,
   berry tag, mail) → collecte erreurs/warns/gardes touchées → rapport JSON. À faire tourner après CHAQUE
   lot de fixes (détection de régression + découverte de stubs).
4. Croiser avec l'oracle callgraph (`audit-callgraph-closure.cjs`) pour l'atteignabilité.

## PHASE C — hors-moteur : dédup + miroir 1:1 rétroactif — vagues n°3+
1. Inventaire des DUPES : les copies locales révélées par l'audit — bag-screen.ts (clone list_menu,
   utilisé par sac de combat battle_controller_player.ts:2062 + ItemPC player_pc.ts:621),
   DisplayItemMessageOnField ré-inliné ×43 (item_menu.ts:2676 « DETTE »), AddTextPrinterParameterized5
   stub local PSS:125, pipeline tile-data ×3 copies (dont 2 divergentes pokenav/mail),
   CreateInvisibleSpriteWithCallback local battle_main, helpers maison scrcmd.ts:1100/1107 +
   battle_message.ts:648 (chaîne FR classes dresseurs → GetTrainerClassNameFromId/GetTrainerNameFromId
   pokemon.c:6945 à porter), _resolveTrainerClassNameFr, émulations locales oam.affineParam ×3.
2. Par lot : porter la fonction décomp 1:1 dans le .ts miroir du .c d'origine → rediriger TOUS les
   call-sites → SUPPRIMER la copie locale → tsc → test en jeu de l'écran touché.
3. Purge des rustines listées section « RUSTINES À PURGER » de chaque rapport d'audit (12 listes).
4. Re-test global : `__e2e.run('boot-overworld')` + `('double-battle')` + engine-sweep + screenshots.

## Suivi
- Fixes déjà livrés : Random() VBlank `bb6de4d5d` · blend OBJ semi-transparent hors fenêtre `11a6436b5` ·
  glyphe espace `0473ab8a9` · StringCopy/LoopedTask gardes + MC data `bd6ee7f31`.
- Mémoire : `chantier-audit-moteur-complet.md` (agents=Opus, Fable vérifie).
- Validation finale par phase : test EN JEU + screenshot (jamais « fini » sans preuve).
