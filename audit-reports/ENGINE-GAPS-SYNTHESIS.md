# SYNTHÈSE AUDIT ENGINE GAPS — 2026-06-13

## ⭐ PLAN « 100 % DES ANIMS » (réflexion demandée user 2026-06-13 — PAS du patch)
Constat user validé par l'enquête Mist : « on a dû extraire une palette alors
qu'elle devrait déjà être dans la décomp » + le rendu rose avec des palettes
logiques CORRECTES (sonde slot 8 = mist_cloud exact, BLD/objMode 1:1, et
pourtant rose à l'écran). Les bugs d'anims ne sont plus des trous de PORTAGE
(les fonctions y sont) mais des trous d'INFRASTRUCTURE. Par couche :

### 1. DONNÉES (la racine n°1 — le point user)
- Aujourd'hui : manifest custom `_animGfxByValue` (battle-anim-interpreter:1108)
  → fetch de .bin/.pal extraits AU CAS PAR CAS au fil des chantiers + entrées
  manuelles éparses (`_battleAnimPicEntries` decomp-globals:1313 n'a QUE ROCKS).
  Chaque anim nouvelle = risque de palette/gfx manquant ou louche, en silence.
- Vanilla : `gBattleAnimPicTable` + `gBattleAnimPaletteTable` (src/data/battle_anim.h)
  = ~289 paires {gBattleAnimSpriteGfx_X, gBattleAnimSpritePal_X} COMPLÈTES par tag.
- → FIX DE FOND : UN script d'extraction TOTAL (graphics/battle_anims/sprites/*
  → public/, mêmes noms de symboles) + table TS générée 1:1 de gBattleAnimPicTable.
  Tue toute la classe « mauvaise palette d'anim » d'un coup. PRIORITÉ 1.

### 2. PALETTES — le double-monde (la racine du « rose »)
- Architecture actuelle : gPlttBufferUnfaded/Faded (monde LOGIQUE 1:1, sondes,
  BlendPalette, fades) ≠ PaletteBanks bgRgb15/objRgb15 (monde RENDU, compositor)
  ; pont = `gPlttBufferFaded.flushTo()` au VBlank si gMain.vblankCallback
  (decomp-runtime:2433-2438) + déviation documentée (palette.ts:16-25) :
  certains chemins écrivent DIRECT PaletteBanks (écrans UI : bag/summary/party/
  wallclock/trainer-card — hors combat, tolérable).
- Bug Mist : palettes logiques justes, rendu rose → un désync flush/ordre/écrivain
  direct reste possible en combat. → FIX DE FOND : (a) canary dev qui warn toute
  écriture directe PaletteBanks pendant un combat ; (b) investiguer le rose AVEC
  ce canary (1 tranche dédiée) ; (c) à terme : une SEULE écriture = flushTo.

### 3. VRAM OBJ — la corruption
- RequestDma3Fill inexistant (cleanup screenblocks anims, cf. manque n°1 plus bas)
  + `_markLiveSpriteTiles` = rustine qui PROUVE que des chemins chargent hors
  allocateur. → FIX : RequestDma3Fill 1:1 + tout chargement via l'allocateur par
  tags (supprimer les rustines une fois les chemins unifiés).
- ✍ EN COURS (working tree, A/B Psychic restant) : fills 1:1 de
  MoveBattlerSpriteToBG (l'ancien tilemap.fill(0) pointait la 1ère TILE DU MON
  → motif 8x8 répété plein écran à chaque monbg = le « damier » des screenshots)
  + palette monbg depuis le slot RÉEL du sprite (pas 256+battler*16) + Unfaded.

### 4. RENDU (compositor) — presque complet
- Solide : windowing par pixel, blend + règle GBATEK OBJ semi-transparent,
  mosaic H, affine BG/OBJ, scanline. Manques : mosaic V (+ bit oam.mosaic par
  sprite), détaillés plus bas.

### 5. MOTEUR SPRITE — la classe sync-écrase
- syncSpritesToOam ré-écrit x/y/visible/flips/objMode/subpriority/affineParamIndex
  depuis les champs SPRITE chaque frame (3 bugs payés). → poser les champs côté
  sprite TOUJOURS ; généraliser le canary si une 4e occurrence apparaît.

### 6. OUTILLAGE (fiabilité des diagnostics)
- __verifyMoveAnim et harnessExecuteTurnL pompent HORS runOneFrame → le
  freeze-frame (patch runOneFrame=noop) fige l'ÉCRAN mais pas la simulation →
  sondes post-freeze = post-mortem trompeur (2 fois cette session). → FIX :
  un vrai flag pause respecté par les pumps du harnais.
- gba.getFrameBuffer() pendant le freeze ≠ écran affiché (la texture Phaser ne
  suit plus). → échantillonner le canvas, ou sonder DANS le watcher (synchrone).

### Ordre d'exécution proposé
1. Données : extraction totale + gBattleAnimPicTable 1:1 (priorité user).
2. Palette : canary écrivains directs + résoudre le rose.
3. VRAM : RequestDma3Fill + A/B du fix monbg (Psychic) + retirer les rustines.
4. Mosaic V. 5. Re-sweep __verifyMoveAnim ×354 avec pixel-probes par mécanisme.

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
