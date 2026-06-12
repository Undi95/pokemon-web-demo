# SYNTHÈSE AUDIT ENGINE GAPS — 2026-06-13

Demande user : « savoir définitivement ce qu'il nous manque dans notre engine »
(même 1:1 strict miroir, des anims sortent fausses — ex. Mist mauve + corruption).
Outil : `scripts/audit-engine-gaps.cjs` → `audit-reports/engine-gaps.txt` (brut).
Ce fichier = le rapport brut REQUALIFIÉ après drill-down (les faux 🔴 du matching
par nom sont expliqués). Hors périmètre : BGM/SE (consigne user — bricolage maison).

## ✅ REQUALIFIÉS — PAS des manques (architecture vérifiée)
- **Registres BGxHOFS/VOFS, BGxCNT, WIN*, MOSAIC, BLD*** : tous routés par
  `decomp-runtime.SetGpuReg` (:752-806) vers les structures `gba.bg(n).config /
  gba.blend / gba.windows / gba.mosaic` — le compositor lit les STRUCTURES, pas
  les noms de registres (d'où les faux 🔴 du grep). Vérifié : windowing win0/
  win1/objwin avec layer-mask + blend-gate par pixel (compositor:226-286),
  blend complet + règle GBATEK « OBJ semi-transparent force target1 »
  (compositor:256-258), mosaic BG-H et OBJ-H (compositor:202-218).
- **GetGpuReg** : reconstruit les valeurs depuis les structures (:700-738). OK.
- **`oam.affineParam` (champ SCRATCH C, 21 usages)** : pas un champ de RENDU
  (le rendu passe par matrixNum). Le C s'en sert comme stockage 16-bit custom
  (compteur Petal Dance, spriteId du partenaire healthbox…). Chez nous : émulé
  localement à chaque site — `_affineParam` (battle_anim_effects_1.ts:198+),
  `data[7]` (battle_interface.ts:859), champ ad-hoc (battle-sendout-anim.ts:73).
  → PAS bloquant, mais 3 conventions ≠ 1 modèle : voir « améliorations ».
- **Globals plateforme** (gSineTable, gPlttBuffer*, gScanlineEffect*, gOamMatrices,
  gPaletteFade, gSpriteCoordOffset*) : tous présents.
- **Fonctions plateforme** : 80/86 présentes (cf. brut section 4).
- **Section 3 du brut (sTimer/sState/sBattler…)** : FAUX positifs — ce sont des
  `#define sX data[N]` LOCAUX aux .c (conventions de nommage), pas des champs
  plateforme. Les vrais champs struct Sprite (invisible, subpriority, animEnded,
  animPaused, affineAnimPaused, hFlip/vFlip, animNum…) sont tous ✅.

## 🔴 VRAIS MANQUES CONFIRMÉS (priorisés)
1. **`RequestDma3Fill` — INEXISTANT (0 impl)** — battle_anim.c:679-685+724-725 :
   c'est LE CLEAR des screenblocks d'anim (fill 0 → BG_SCREEN_ADDR(16)/(8)/(12),
   fill 0xFF → (30)/(28)) à l'init/teardown des anims de moves + le fill du pic
   mon (battle_anim_throw.c:2198 substitute). Sans lui, les TILEMAPS d'anim ne
   sont JAMAIS nettoyés entre deux anims → restes/corruption à l'écran.
   **Candidat racine n°1 pour la corruption post-Mist signalée par le user.**
   → Porter : un fill mémoire direct (pas besoin du manager DMA complet) DANS
   le chemin des anims (vérifier où battle_anim.c:679 est porté côté
   battle-anim-interpreter/LoadMoveBg — le port a peut-être sauté ces lignes).
2. **MOSAIC vertical — non rendu** (compositor:210 « skip mosaic vertical ») :
   le H est rendu (BG+OBJ), le V est sauté. Minimize/mosaic-anims rendent à
   moitié. → Compositor : tracking inter-scanlines (garder la scanline source
   y - (y % bgV)).
3. **`LoadBgTilemap` — INEXISTANT** : 1 site atteignable (battle_intro.c:602,
   les 2 autres = battle_factory hors démo). → utilisé par l'intro de combat ;
   à porter (copie tilemap → screenblock par taille).
4. **`DestroySpriteAndFreeResources` — partiel (1 mention)** : 10 usages combat.
   Les sprites runtime ne portent pas leurs tags template → la libération
   sheet+palette par sprite est approximée site par site (déjà documenté dette
   particules). → Modéliser sprite.templateTags {tile, pal} posés par
   CreateSprite, puis impl 1:1.
5. **Mosaic OBJ : `oam.mosaic` non synced/rendu par sprite** (le flag par-sprite ;
   le reg global est lu mais le BIT par-OAM n'est pas vérifié — compositor
   applique l'OBJ-mosaic à TOUS les sprites quand objH>0 ?). À vérifier au
   premier A/B mosaic (lié au point 2).

## 🟡 INCOHÉRENCES / AMÉLIORATIONS (non bloquantes, à unifier au fil des tranches)
- **`oam.affineParam` scratch** : ajouter le champ à OamEntry (u16, jamais touché
  par syncSpritesToOam ni le rendu) et unifier les 3 émulations locales.
- **`CreateSpriteAndAnimate`** (2 mentions) : Cmd_createsprite émule à la main —
  OK fonctionnellement, mais l'AnimateSprite immédiat 1:1 (1er tick dans la même
  frame) est à confirmer.
- **`HandleLoadSpecialPokePic_DontHandleDeoxys` / `LoadSpecialPokePic*`** (1) :
  chemins pic spéciaux (Deoxys/Castform) partiels.
- **`ScanlineEffect_InitWave`** : présent (scanline_effect.ts) mais 2 mentions —
  vérifier les 2 call-sites combat (Spite ✅ A/B ce soir, l'autre = ?).
- **`SetOamMatrixRotationScaling`** (2) : présent ; vérifier les sites non-anim.

## 📌 LA CLASSE « sync-écrase » (rappel systémique, 3 occurrences payées)
`syncSpritesToOam` (decomp-runtime:2480-2517) ré-écrit CHAQUE frame depuis les
champs SPRITE : x/y, visible(←invisible), flips, affineParamIndex(←matrixNum),
**objMode**, subpriority, affineMode. → tout champ OAM posé une fois doit AUSSI
être posé côté sprite. SURVIVENT sur l'OAM : tileId, paletteBank, priority,
shape/size, (futur affineParam scratch).
Fix racine livré (commit objMode templates) : `BATTLE_ANIM_OAMS.objMode` était
extrait mais JETÉ par battle-anim-generated-bridge → propagé maintenant
(registry type + bridge + decomp-bridge.CreateSprite pose s.objMode).
A/B : Mist → 7 nuages sprite.objMode=1 (avant : 0 partout).

## Suivi bug user (à traiter en tranches dédiées avec ce cadre)
- **Mist MAUVE** : la palette ANIM_TAG_MIST_CLOUD sort violette. Suspects :
  conflit/réutilisation de slot palette OBJ après une anim qui teinte
  (BlendPalette violet de Spite = RGB(13,0,15) ≈ le mauve vu !), restore
  incomplet, ou mauvaise source .gbapal. → repro : Spite puis Mist vs Mist seul,
  dump du slot palette de MIST_CLOUD dans les 2 cas.
- **Corruption sprite après Mist** (screenshot user : mon en morceaux) :
  candidats = RequestDma3Fill manquant (point 1) + libération de tiles
  partagées/overlap AllocSpriteTiles. → repro : dump objVram alloc bitmap
  avant/après Mist.
