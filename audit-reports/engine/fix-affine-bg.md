# Fix — BG AFFINE dans le PPU compositor + mode vidéo DISPCNT persistant (2026-07-16)

Dette « branche AFFINE tilemaps » (CHANTIER-MOTEUR-100.md, Suivi 🐛 MOTEUR) + registres
affine (fix-b2-gardes.md §2). `npx tsc --noEmit` = **0**. Vérifié en plus par un **smoke
test headless** du compositor (esbuild+node, 7 checks, 100 % PASS — détail §7).
Test EN JEU (rotation lissée à l'écran) = à faire en session principale via
`dev.gfx.affineTest` (§6).

Fichiers modifiés :
- `harness/gba/gba.ts` — champ `videoMode` (source de vérité mode vidéo) + reset.
- `harness/gba/types.ts` — `BgConfig.affineRefXGen/affineRefYGen` (compteurs d'écriture
  BG2X/BG2Y, par axe).
- `harness/runtime/decomp-runtime.ts` — `_dispCntMode` dissous → `gba.videoMode` ;
  bit 7 (forced blank) inclus dans la reconstruction `GetGpuReg(DISPCNT)` ; garde
  hurlante modes 3-5 ; `_updateBgRef(bg, axis)` bump les compteurs par axe.
- `harness/gba/compositor.ts` — modèle GBATEK « internal reference registers »
  (latch VBlank + reload par-écriture + avance (PB,PD) par scanline) ; mosaic
  vertical affine.
- `harness/gba/bg-layer.ts` — `renderBgAffineScanline` consomme le point interne
  (plus de terme `pb*sy`/`pd*sy`) ; hot-path `writeBgRgbaTo` (comme le texte).
- `harness/runtime/decomp-globals.ts` — `PanFadeAndZoomScreen` re-câblé sur les VRAIS
  `SetGpuReg` BG2PA..BG2Y_H (1:1 intro.c:2823-2830 ; remplace les pokes directs
  `bgAffineMatrices`/`config` qui pré-dataient le routage).
- `src/window.ts` — bloc SetBgAffine/SetBgAffineInternal/BgAffineSet dé-inertisé
  (commentaires : chaîne câblée + références BIOS/arrondis ; corps INCHANGÉS,
  re-vérifiés ligne à ligne contre bg.c:244-283 / 772-775).
- `harness/devtools/dev-gfx-tools.ts` — outil `dev.gfx.affineTest` (outillage harness,
  pas de 1:1 ; RIEN ajouté à registrations.ts).

---

## 1. VERDICT hypothèse « GetGpuReg(DISPCNT) ne mémorise pas les bits 0-2 »

**INFIRMÉE.** La reconstruction incluait DÉJÀ le mode : `GetGpuReg(DISPCNT)` commence par
`let v = this._dispCntMode` depuis la session 68 (`f4b6834f4`, vérifié par `git log -L`).
Le RMW de `SetBgMode` (window.ts:1399) ne perdait donc PAS le mode.

**Explication du constat en jeu (DISPCNT relu = 0x1F00 après un passage « censé » poser
mode 1)** : le `SetBgMode(1)` de la carte Pokénav n'a JAMAIS été exécuté. L'écran throw
AVANT : `PokenavCallback_Init_RegionMap` (pokenav_region_map.ts:246) appelle le wireTodo
`IsEventIslandMapSecId` → throw ; or `SetBgMode(1)` est dans `LoopedTask_OpenRegionMap`
case 0 (pokenav_region_map.ts:371), qui ne tourne qu'APRÈS l'init du callback menu.
0x1F00 = BG0-3 + OBJ on, mode 0 = l'état du menu Pokénav, jamais modifié. C'est cohérent
avec le Suivi CHANTIER (« Carte Pokénav = écran NON CÂBLÉ »). ⇒ la ligne « 🐛 MOTEUR »
du CHANTIER-MOTEUR-100.md peut être soldée par le présent rapport.

**Durci quand même (livrable 1, fait)** :
- Source de vérité déplacée dans l'état gba : `gba.videoMode` (gba.ts) — resettable par
  `gba.reset()` (l'ex-champ privé runtime ne l'était pas), lisible par sondes/compositor
  sans passer par le runtime. `applyDispCnt` la pose ; `GetGpuReg(DISPCNT)` la relit ;
  `applyBgCnt` en re-dérive `isAffine`.
- **Vraie asymétrie corrigée au passage : bit 7 (forced blank)** — `applyDispCnt` posait
  `gba.forcedBlank` mais la reconstruction ne le réémettait PAS → n'importe quel RMW
  DISPCNT pendant un init aurait ÉTEINT le forced blank (sur hardware, un RMW le
  préserve). Ajouté à la reconstruction (aucun writer actuel ne pose le bit → zéro
  changement de comportement aujourd'hui, filet pour les inits futurs).
- `applyDispCnt` dérive `isAffine` 1:1 GBATEK : mode 0 → aucun ; mode 1 → BG2 (BG0/1
  texte) ; mode 2 → BG2+BG3 ; tout autre mode → retombe isAffine=false partout + garde
  hurlante dédupliquée (`__dispCntBitmapModeSeen`) : modes 3-5 bitmap jamais utilisés
  par Émeraude (grep décomp = 0), non modélisés.
- Boot inchangé : défaut `videoMode = 0` partout, la branche affine ne s'active que si
  `isAffine` (dérivé exclusivement du mode).

## 2. Rendu BG affine 1:1 GBATEK (compositor.ts + bg-layer.ts)

La branche affine EXISTAIT (renderBgAffineScanline) mais rendait en « formule fermée »
`(ref + pa·sx + pb·sy) >> 8` : correct UNIQUEMENT si registres constants sur la frame.
Remplacée par le modèle GBATEK **« Internal Reference Point Registers »** exact :

- **Latch VBlank** : en tête de `composeFrame`, point interne ← BG2X/Y externes
  (« automatically copied to internal registers during each vblank »).
- **Reload par écriture, PAR AXE** : chaque écriture `SetGpuReg(BG2X_L/H)` (resp. Y)
  bump `config.affineRefXGen` (resp. `YGen`) via `_updateBgRef` ; le compositor compare
  par scanline et recharge L'AXE écrit seulement (« immediately copy the new value to
  the CORRESPONDING internal register ») — écrire X ne recharge pas l'interne Y, qui
  continue d'avancer de PD. (Bug attrapé par le smoke test B : la 1re version couplait
  X et Y sur un seul compteur.) Le nouveau point vaut pour la scanline COURANTE (le
  HBlank cb tourne avant le rendu de la ligne — même convention que scanline_effect).
- **Avance par scanline** : en fin de chaque ligne, interne += (PB, PD) (« incremented
  by dmx and dmy after each scanline »), que le BG soit visible ou non (compteur
  hardware indépendant du bit BG-on). PA..PD relus chaque ligne (pas de latch matrice
  — les écritures mid-frame de matrice s'appliquent immédiatement, 1:1).
- **Rendu d'une ligne** : `texX = (refInterne + pa·sx) >> 8` (28.8, troncature du shift
  arithmétique = bits entiers du compteur hardware). Plus de terme pb·sy/pd·sy (il est
  DANS le point interne).
- **Chemin d'écriture UNIQUE** : tout passe par `SetGpuReg` (0x20-0x3E routés depuis
  toujours) — y compris les effets scanline (`_applyRegFromValue` = `rt.SetGpuReg`,
  fix A3) et désormais `PanFadeAndZoomScreen` (§4). Aucun poke direct restant
  (grep `bgAffineMatrices`/`affineRefX =` : seuls SetGpuReg + une sonde read-only).

Inchangé (déjà 1:1, re-vérifié) : tilemap affine 8 BITS (1 octet = tile number, pas de
flip — convention du port : 1 entrée u8 par u16 de la vue, `& 0xFF`) ; tiles 8bpp
obligatoires (palette BG complète, bank ignorée) ; tailles 0-3 = 128/256/512/1024 px ;
overflow BGCNT bit 13 (`wraparound`, alimenté par `applyBgCnt` :991) : wrap si set,
sinon transparent hors zone. Priorités/fenêtres/blend/mosaic H : la branche affine
passe par la MÊME plomberie que le texte (scanline buffers + boucle priorité) — rien
de parallèle.

**Mosaic vertical BG affine** (était : re-rendu de la ligne source, faux avec les refs
internes) : latch du point interne au TOP de chaque bloc de (bgV+1) lignes, rendu du
bloc avec ce point (répétition de la ligne du haut), pendant que les registres internes
continuent d'avancer — comportement hardware.

Arithmétique : accumulation en number JS, |interne| ≤ 2^27 + 160×2^16 < 2^31 → les ops
32-bit (`>> 8`) restent exactes. (Le wrap hardware des registres internes à ±2^27
n'est pas modélisé — inatteignable avec des maps ≤ 1024 px.)

## 3. Équivalence / zéro régression

- **Frame statique (title screen, intro Scene3, futur rayquaza_scene)** : registres
  écrits 1×/frame (Task) → latch VBlank puis accumulation entière exacte ⇒
  pixel-identique à l'ancienne formule fermée. PROUVÉ par le smoke test E (rotation
  45° + zoom 0.7 + refs non nuls : nouveau modèle ≡ `(ref + pa·sx + pb·sy)>>8` sur
  grille d'échantillons).
- **Rendu texte** : intouché (seul le calcul de `mosaicSrcY` a été factorisé à
  l'identique). Branche affine gatée par `isAffine`, dérivé du mode — défaut 0.
- **Cas NOUVEAUX couverts** (avant : faux) : écriture BG2X/Y mid-frame (Mode7 —
  l'audit ppu-compositor.md la listait ⛔ « BG affine ref reload PAR SCANLINE »),
  PB/PD via effet scanline, mosaic V affine.

## 4. SetBgAffine / SetBgAffineInternal / BgAffineSet (src/window.ts) + PanFadeAndZoomScreen

- `SetBgAffineInternal` re-vérifié ligne à ligne contre **bg.c:244-283** : gate mode
  (`GetGpuReg(DISPCNT)&7` ≡ `GetBgMode()` bg.c:64-67 — le port n'a pas le staging
  `bgVisibilityAndMode`, adaptation documentée), `BgAffineSet(&src,&dest,1)`, puis les
  écritures `SetGpuReg` BG2PA, PB, PC, PD, **PA à nouveau** (double write réel
  bg.c:274+278, transcrit), X_L/X_H/Y_L/Y_H. `SetBgAffine` = wrapper 1:1 (bg.c:772-775).
  Corps INCHANGÉS (ils étaient déjà fidèles) ; dé-inertisés : la chaîne complète est
  désormais consommée par le compositor et exercée par `dev.gfx.affineTest`.
- **`BgAffineSet` (BIOS SWI 0x0E)** — choix d'arrondi documentés dans le code :
  - Sémantique BIOS (GBATEK SWI 0Eh) : pa=sx·cos, pb=−sx·sin, pc=sy·sin, pd=sy·cos ;
    dx = texX − (pa·scrX + pb·scrY) calculé depuis les coefficients DÉJÀ tronqués s16
    (= BIOS réel, cf. HLE NanoBoyAdvance ; mGBA float est une approximation).
  - Précision : **précédent du port** = gSineTable trig.c **Q8.8** (index `alpha>>8`,
    256 pas/tour, shift `>>8`), suivi par les 2 implémentations BIOS existantes citées
    (`PanFadeAndZoomScreen` decomp-globals.ts:1117, `ObjAffineSet`
    pokemon_animation.ts:142) — au lieu de la table BIOS Q1.14 (`>>14`). Écart ≤ 1/256
    par coefficient, assumé et cohérent port-entier.
  - Négation AVANT le shift arithmétique (`(-sin*sx)>>8`) = vrai BIOS (troncature
    vers −∞), même choix que pokemon_animation.ts:147.
  - `alpha` u16 : seuls les bits 8-15 comptent (GBATEK « theta 8bit fractional »).
- **`PanFadeAndZoomScreen`** (intro Scene3) : pokes directs état → remplacés par les
  8 écritures `SetGpuReg` 1:1 **intro.c:2823-2830**. Même math (le routage SetGpuReg
  sign-extend s16 et reconstruit les refs par moitiés — round-trip identique), plus
  bump des compteurs par axe. Chemin registre désormais UNIQUE.
- Non fait (hors périmètre, listé pour mémoire) : `SetBgAffineStruct`/`DoBgAffineSet`
  (util.c:138/157, consommateurs contest/battle_anim) — wrappers fins de BgAffineSet,
  à porter avec leur chantier ; nécessiteront d'exporter BgAffineSet + les interfaces.

## 5. GetGpuReg 0x20-0x3E : asymétrie NON « corrigée » — c'est le hardware

Les registres BG2PA..BG3Y sont **write-only** sur GBA (GBATEK : les BG affine regs
sont « W »). Le décomp ne les relit jamais. `GetGpuReg` continue donc de rendre 0 pour
0x20-0x3E, et la garde B.2 HURLE si un code les lit un jour (= code smell 1:1). C'est
la réponse correcte à l'asymétrie notée dans fix-b2-gardes.md §2, pas un trou.

## 6. Outil d'exercice : `dev.gfx.affineTest` (harness/devtools/dev-gfx-tools.ts)

Outillage pur (pas de 1:1), dans LE fichier qui définit `dev.gfx.*` (film/lum/oam) —
`registrations.ts` non touché.

**Lancer** (console, sur un écran stable — overworld idle) :
```js
dev.gfx.affineTest()        // démarre (async : log [affineTest] ACTIF + DISPCNT)
dev.gfx.film({every:15, seconds:2})   // filmer la rotation pour valider
dev.gfx.affineTest(false)   // stoppe l'anim + restaure TOUT l'état
```

**Ce que fait `affineTest()`** :
1. Sauvegarde : DISPCNT (via GetGpuReg), config BG2 complète, matrice BG2, refs X/Y,
   16 KB VRAM charBase 1, 2 KB screenbase 30, palettes BG 0-255 (gPlttBufferFaded ET
   Unfaded).
2. `SetBgMode(1)` — le VRAI (import dynamique de src/window.ts au call, pas d'arête
   statique tôt depuis les devtools → pas de bombe TDZ) ; BG2CNT = charBase 1, 8bpp,
   screenbase 30, **wraparound**, size 1 (256×256) ; DISPCNT RMW : BG2 on, BG0/1/3 off
   (le RMW relit GetGpuReg → re-teste la persistance du mode à chaque étape).
3. Génère EN CODE : 256 tuiles 8bpp (aplat couleur t + bord blanc 255 + diagonale
   noire 254), tilemap affine 32×32 = dégradé 2D 16×16 répété 2×2 (rotation, zoom ET
   wraparound lisibles), palette 256 couleurs (dégradé R/V, bleu constant) poussée par
   gPlttBufferFaded/Unfaded + flush.
4. Anime : hook frame (`gba.addVBlankCallback`) qui appelle CHAQUE frame le VRAI
   `SetBgAffine(2, 128<<8, 128<<8, 120, 80, scale, scale, angle)` — chaîne complète
   gate-mode → BgAffineSet → 8× SetGpuReg. Rotation 1 tour/8,5 s (angle += 128),
   zoom ±50 % période 4 s (Q8.8 : 256±128). Sonde : toutes les 120 frames, si
   `GetGpuReg(0)&7 !== 1` → console.error « mode vidéo PERDU » (= le test de
   régression du RMW tourne en continu).
5. `affineTest(false)` : retire le hook, restaure VRAM/palettes/config, ré-écrit
   DISPCNT sauvegardé (applyDispCnt re-dérive mode/visibilités/isAffine/forced blank)
   puis matrice + refs PAR LES REGISTRES (les shadows runtime `_bgRefXL/H…` restent
   cohérents).

**Attendu à l'écran** : damier-dégradé 256×256 plein écran qui TOURNE en continu et
respire en zoom, wraparound infini, grille blanche nette (pas de trous), diagonales
noires lisibles. ⚠️ un changement de scène pendant le test peut réécrire VRAM/palette
sous le pattern (les systèmes du jeu continuent de tourner) — relancer sur écran calme ;
la restauration reste correcte.

## 7. Vérification (sans navigateur — session principale = test visuel)

- `npx tsc --noEmit` = 0 après chaque édit, final inclus.
- **Smoke test headless** du compositor (esbuild bundle + node, scratchpad
  `affine-smoke.ts`) — 7 checks, tous PASS :
  A. identité + refX=8px (échantillons multi-lignes) ; A2. clip hors zone (overflow
  transparent) ; B. reload mid-frame PAR AXE (écriture X à la ligne 80 via hblank cb :
  le haut inchangé, le bas décalé en X, l'interne Y CONTINUE — c'est ce check qui a
  attrapé le bug du compteur couplé X/Y) ; C. avance PB (+0.5px/ligne → ligne 64
  décalée de 32 px) ; D. wraparound (refX négatif) ; E. équivalence exacte
  nouveau modèle ≡ formule fermée sur frame statique (rotation 45°, zoom 0.7).

## 8. Limites restantes

- **Test EN JEU à faire** (session principale) : `dev.gfx.affineTest` + `dev.gfx.film`,
  et re-passage title screen / intro Scene3 (seuls écrans mode 1 câblés aujourd'hui)
  pour confirmer zéro régression visuelle.
- Mosaic vertical affine : modèle « répète la ligne du haut du bloc » (répétition du
  point interne latché). Le mosaic H s'applique après coup sur la scanline rendue
  (pipeline existant) — l'ordre exact hardware mosaic-vs-transformation n'est pas
  certifié pixel-exact (aucun écran affine+mosaic connu en solo).
- Wrap 28-bit des registres internes non modélisé (inatteignable, cf. §2).
- Modes 3-5 bitmap : toujours non modélisés (garde hurlante posée ; Émeraude = 0 usage).
- `SetBgAffineStruct`/`DoBgAffineSet` (util.c) non portés (§4).
- La carte Pokénav reste bloquée EN AMONT (wireTodo `IsEventIslandMapSecId` et 38
  autres symboles region_map — chantier séparé, cf. Suivi CHANTIER) ; quand elle sera
  câblée, son `SetBgMode(1)`/`UpdateRegionMapVideoRegs` trouveront le moteur prêt.
