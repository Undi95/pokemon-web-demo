# AUDIT GÉNÉRIQUE — Hall of Fame → générique → FIN → reboot → copyright → intro → titre → CONTINUER

**Date** : 2026-07-19 · **Mode** : AUDIT PUR (aucune modif de code, aucun commit)
**Méthode** : diagnostic dynamique en jeu (onglet isolé `?debug`, pause + `runOneFrame` frame-précis,
lecture fiable de `bridge.imageData`, sondes `window.__rt`) + lecture décomp en regard.

## Résumé exécutif (état COURANT du code)

| # | Bug rapporté | Verdict COURANT | Cause racine |
|---|---|---|---|
| 1 | Vélo pas sur le sol | **NON reproduit** (positions 1:1) | — (résolu, probable `ddeb7ef86`) |
| 2 | Player bugué sur son vélo | **NON reproduit** (anim/sheet OK) | — (résolu, probable `ddeb7ef86` « silhouettes ») |
| 3 | Mons restent affichés sans leur carré | **REPRODUIT — cause racine trouvée** | mon-pic priorité OAM 0 au lieu de 1 → pas d'alpha-blend |
| 4 | Save HOF ne se charge pas au CONTINUER | **REPRODUIT — chaîne diagnostiquée** | `gSaveFileStatus` global figé au 1er page-load + save verrouillée `?debug` |
| 5 | Copyright NOIR au reboot | **REPRODUIT — cause racine trouvée** | `gIntroCopyright_Pal` écrasée par un chargement `palfromgfx` (rampe grise) |

La **séquence complète a été jouée de bout en bout** (`scene.hof` → défilé 55 pages / 9 scènes →
« FIN » → SoftReset → copyright → intro → overworld) : **aucun hang**, le cycle boucle. Les bugs 3/4/5
ci-dessous sont les vraies divergences ; 1/2 semblent soldés par les commits récents (à confirmer visuellement
vs vidéo GBA, cf. §Autres écarts).

---

## BUG 1 — « Vélo pas sur le sol » — NON REPRODUIT

**Symptôme rapporté** : le rider roule au-dessus/en-dessous de la ligne de sol.

**Observation dynamique (scène SCENE_OCEAN_MORNING, joueur centré)** :
- Sprite Player : `x=120, y=46`, `centerToCornerVecY=-32` → OAM couvre y **14→78** (64px). **1:1 décomp**.
- Sprite Bicycle : `x=120, y=54` (= player.y+8), `ctcY=-16` → OAM couvre y **38→70** (32px). **1:1 décomp**.
- Ligne de sol (haut du gazon, mesurée aux pixels colonne x=30 sans sprite) : **y=55**.
- Les roues (bas du sprite vélo ≈ y=60-70) reposent **dans le champ de gazon** (y=55→160). **Correct.**

**Confrontation décomp** :
- `credits.c:1062` (`SetBikeScene` SCENE_OCEAN_MORNING) : `gSprites[player].y = 46`. → notre port `y=46`. ✅
- `intro_credits_graphics.c:1121` (`CreateIntroBrendanSprite`) : vélo créé à `y + 8` ; `SpriteCB_Bicycle`
  (`intro_credits_graphics.c:1109-1116`) recopie chaque frame `sprite->y = player.y + 8`. → notre
  `src/intro_credits_graphics.ts:115-121` : **1:1** (recopie `invisible/x/y+8/x2/y2`). ✅
- Scroll BG grass (BG1) : `BG1VOFS = gIntroCredits_MovingSceneryVBase(34) + vOffset` (`Task_BicycleBgAnimation`,
  `intro_credits_graphics.c:958`). Sondé live : `BG1VOFS=44` (34+10). **1:1**. ✅

**Cause racine** : aucune. Positions, scroll BG et ancrage sprite (`centerToCornerVec` appliqué dans
`syncSpritesToOam`) sont **1:1**. Le vélo est sur le sol.

**Plan de fix** : néant. Le symptôme d'origine (probable rendu silhouette / mauvaise altitude avant
`ddeb7ef86` « cyclistes silhouettes — sur-allocation sheets ») ne se reproduit plus. **À confirmer** par
A/B visuel vs vidéo GBA sur les 5 scènes (ocean matin/couchant, forêt ×2, ville nuit).

**Taille** : N/A.

---

## BUG 2 — « Player bugué sur son vélo » — NON REPRODUIT

**Symptôme rapporté** : sprite/anim du joueur incorrecte en roulant (frames ? sheet partielle ? mauvaise table ?).

**Observation dynamique** :
- **Table d'anim OK** : `animNum=0` (`sAnim_Player_Slow`), `animCmdIndex` cycle **2→3→0→1** à cadence 8
  frames/frame (`FRAME(0,8) FRAME(64,8) FRAME(128,8) FRAME(192,8) JUMP(0)`). Le pédalage anime. **1:1
  `credits.c:154-161`.** Le vélo (`sAnims_Bicycle`) cycle en phase.
- **Sheet complète** : le rider rend en sprite COLORÉ reconnaissable (casque, buste, bras sur guidon),
  **pas une silhouette**, pas de sheet tronquée.
- **Positions/état** : state-machine `SpriteCB_Player` 1:1 (`data[0]` 0→4→…), déplacement `x` correct.

**Cause racine** : aucune divergence structurelle trouvée. Le bug d'origine correspond très probablement à
l'issue « cyclistes silhouettes (sur-allocation sheets) » corrigée en `ddeb7ef86`.

**Résidu à vérifier** : les **roues du vélo tirent vers le vert/jaune-vert** (frame rouge/rose, roues vertes).
Le vélo utilise `paletteTag: 'TAG_BRENDAN'` (`intro_credits_graphics.ts:165`) — **1:1 décomp** (`credits.c`
`sSpriteTemplate_BrendanBicycle.paletteTag = TAG_BRENDAN`). C'est le MÊME sprite que la scène 2 de l'intro.
→ probablement conforme au design, mais **à confirmer** vs vidéo GBA (cf. §Autres écarts).

**Plan de fix** : néant sur l'anim/sheet. Si les roues vertes sont un vrai écart : comparer la palette
`sBrendanCredits_Pal` extraite vs `graphics/intro/scene2/brendan_credits.gbapal` du décomp.

**Taille** : N/A.

---

## BUG 3 — « Les mons restent affichés quelques frames sans leur carré » — REPRODUIT (cause racine)

**Symptôme** : dans les interludes Pokémon, quand le carré coloré (mon-bg) disparaît, le mon reste affiché
opaque quelques frames sans son carré, puis « pop » disparaît d'un coup.

**Preuve dynamique (mesure fiable `bridge.imageData`, fondu state 3, `d3` 16→0)** :

```
d3 :  16   15   14   ...   4    3    2    1    0        (state 3 = fondu blend)
mon (px centre)  : [132,165,231] CONSTANT tout le fondu → [57,90,49] grass à state 9
carré (px coin)  : [165,165,255] → 163,169,246 → ... → 140,222,115  (fond BLEU → vert : blende OK)
```

- **Le carré (mon-bg) blende correctement** vers le gazon (bleu → vert) = disparaît en fondu. ✅
- **Le mon-pic ne blende PAS** : pixel figé à `[132,165,231]`, opaque, jusqu'au « pop » (invisible state 9). ❌
- Résultat visuel : le carré s'efface, le mon reste plein écran ~16 frames → **exactement le symptôme rapporté.**

**Cause racine EXACTE** (sonde OAM live) :

| Sprite | `DecompSprite.priority` | **OAM.priority (compositeur)** | objMode |
|---|---|---|---|
| mon-pic | 1 | **0** ❌ | 1 (BLEND) |
| carré mon-bg | 1 | **1** ✅ | 1 (BLEND) |

- `src/credits.ts:1591` : `gSprites[monSpriteId].priority = 1;` écrit le champ **plat** `.priority`.
  Or `syncSpritesToOam` **ne propage PAS** `.priority` vers l'OAM (champ figé à la CRÉATION, cf. commentaire
  `credits.ts:1855` sur `CreateMovingScenerySprites` : « syncSpritesToOam NE propage PAS shape/size/priority/
  paletteNum »). `CreateMonPicSprite` crée la pic avec **OAM priority 0** → elle y reste.
- Le carré, lui, est créé par `CreateSprite(sSpriteTemplate_CreditsMonBg, …)` avec `sOamData_MonBg.priority=1`
  (posé à la création) → OAM priority **1**.
- Conséquence compositeur (`harness/gba/compositor.ts:415-465`) : le mon (OBJ priorité **0**) compose AU-DESSUS
  du carré (OBJ priorité **1**). Pour l'alpha-blend OBJ (`layer1ObjBlend`), le `layer2` = le carré (un OBJ),
  et `BLDCNT_TGT2` = uniquement des BG (`0xF00`). Donc `blend.target2 & (1<<OBJ) == 0` → **blend sauté** → mon
  opaque. Le carré, lui, a le BG grass (TGT2) sous lui → il blende.
- Sur GBA réel, mon et carré sont **tous deux priorité 1** → fusionnés en UNE couche OBJ, le mon gagne au
  centre et blende avec le BG grass (TGT2) → fondu correct des deux.

**Réf décomp** : `credits.c:1473` → `gSprites[monSpriteId].oam.priority = 1;` (écrit l'**OAM**, pas un champ plat).

**Plan de fix** (au choix, S) :
1. Le plus fidèle : router la priorité vers l'OAM du mon-pic après création dans `CreateCreditsMonSprite`
   (`credits.ts:1591`), p.ex. écrire l'entrée OAM (comme `CreateMovingScenerySprites` pose shape/size au
   CREATE, `credits.ts:1858-1872`), ou exposer/setter `gSprites[monSpriteId].oam.priority = 1`.
2. Ou faire propager `.priority` par `syncSpritesToOam` (change moteur, plus large — vérifier régressions).

**Taille** : **S** (ciblé `credits.ts:1591` + éventuel helper OAM), mais valider EN JEU (fondu mon+carré synchrones).

---

## BUG 4 — « La partie sauvegardée au HOF ne se charge PAS » — REPRODUIT (chaîne diagnostiquée)

Voir §« Chaîne save HOF→CONTINUER » ci-dessous pour le détail. En bref : **le moteur de save fonctionne**
(round-trip prouvé), mais 3 maillons cassent l'affichage/chargement du CONTINUER après le cycle.

---

## BUG 5 — « Copyright reste NOIR au reboot, puis l'intro se lance » — REPRODUIT (cause racine)

**Symptôme** : après « FIN » → SoftReset, l'écran copyright est **entièrement noir** (aucun texte). Le
**boot initial (page load sans `?debug`) affiche bien le copyright** (« ©2005 Pokémon / ©1995-2005 Nintendo /
Creatures Inc. / GAME FREAK inc. », texte blanc sur fond noir).

**Preuve dynamique (comparaison boot initial vs reboot, même state 50)** :

| | Boot initial (OK) | Reboot post-FIN (NOIR) |
|---|---|---|
| `gIntroCopyright_Pal` (assetCache) | `[0, 6738, **7fff**, 35aa, 420d]` (5 couleurs) | `[0,0,0,0,0,0, 1080,1ce3,…,7fff]` (16, rampe grise) |
| palette **index 2** (couleur du texte) | `0x7fff` = **BLANC** | `0` = **NOIR** |
| tuiles glyphes (mêmes) → indices utilisés | 0-4 (texte = index 2) | 0-4 (texte = index 2) |
| rendu | texte blanc visible | texte noir = invisible |

Le reste est chargé correctement au reboot : tilemap texte présent (rangées y=6-13, palbank 0), gfx glyphes
en VRAM, `DISPCNT=0x100` (BG0 on), `BG0CNT=0x700`. **Seule la palette est fausse.**

**Cause racine EXACTE** :
- Copyright (correct) : `preloadScene1Assets` charge `gIntroCopyright_Gfx` en `loadIndexedPng()` puis
  `assetCache.set('gIntroCopyright_Pal', png.palette)` **si absent** (`intro-asset-loader.ts:258-260`)
  → palette 5-couleurs du PLTE (index 2 = blanc). ✅
- Générique : `preloadCreditsAssets` recharge le MÊME symbole en `type:'palfromgfx'`
  (`intro-asset-loader.ts:795`) = `loadIndexedPngStrict(copyright.png, 4)` → `png.palette` **16 couleurs =
  rampe grise** (index 2 = noir) (`intro-asset-loader.ts:819-821`). ❌ Le commentaire (`:793-794`) la croit
  « idempotente » — elle ne l'est PAS (méthode d'extraction différente).
- Ordre fatal dans le flux `?debug`/`scene.hof` : le boot direct-overworld **ne lance pas
  `preloadScene1Assets`** → la 1re écriture de `gIntroCopyright_Pal` vient du générique (rampe grise). Au
  reboot, `preloadScene1Assets` retourne tôt à cause du garde `if (!assetCache.has('gIntroCopyright_Pal'))`
  (`:260`) → la mauvaise palette PERSISTE → copyright noir.

**Réf décomp** : `intro.c` `LoadCopyrightGraphics` charge UNE `gIntroCopyright_Pal` ; `credits.c`
`LoadTheEndScreen` réutilise la MÊME. Notre port en produit deux versions incohérentes.

**Portée réelle** : dans le **vrai flux** (boot normal → jeu → HOF → générique → reboot), `preloadScene1Assets`
tourne au boot et cache la BONNE palette AVANT le générique (qui `return` sur `has`) → copyright OK au reboot.
Donc le bug se déclenche **principalement via le chemin de test `?debug`/`scene.hof`** — mais c'est une
**incohérence latente réelle** (deux extractions divergentes d'un même asset).

**Plan de fix** (S-M) :
1. Rendre les deux chargements COHÉRENTS : la ligne générique `:795` doit utiliser la MÊME extraction que le
   copyright (`loadIndexedPng` → `png.palette` 5-couleurs), PAS `palfromgfx`/strict-4bpp.
2. **OU** si l'écran « THE END » a besoin de la rampe 16-couleurs (à vérifier — `LoadTheEndScreen`
   `credits.ts:1360` charge `gIntroCopyright_Pal`), lui donner un symbole distinct et NE PAS toucher
   `gIntroCopyright_Pal`.
3. **OU** au reboot, forcer `preloadScene1Assets` à réécrire `gIntroCopyright_Pal` (retirer le garde `if !has`
   pour ce symbole) — moins propre mais auto-répare le reboot.

**Taille** : **S-M**. Vérifier EN JEU que « THE END » ET le copyright reboot rendent corrects après fix.

---

## CHAÎNE SAVE HOF → CONTINUER (détail bug 4)

### Ce que fait réellement le HOF
- `scene.hof` (`harness/devtools/registrations.ts:507-513`) : `SetMainCallback2(CB2_DoHallOfFameScreen)`.
  ⚠️ **N'appelle PAS `GameClear`** → `FLAG_SYS_GAME_CLEAR` et le warp-continue **ne sont pas posés** (dans le
  vrai jeu c'est le `special GameClear` du script EverGrandeCity_HallOfFame qui les pose AVANT le HOF).
- `Task_Hof_TrySaveData` (`hall_of_fame.ts:384-414`) → `TrySavingData()` (`save.ts:642`).

### Où ça casse
1. **[artefact `?debug`] Save VERROUILLÉE** : `?debug`/`?nointro`/`?truck` appellent `SetSaveLocked(true)` au
   boot (`boot-mode.ts:544-545`). `TrySavingData` retourne `false` sans écrire (`save.ts:649-652`). Log
   observé en jeu : `[save-system] TrySavingData BLOCKED (SetSaveLocked=true)`. → **le HOF n'écrit RIEN** en
   `?debug`. Le CONTINUER (s'il s'affiche) rechargerait l'ANCIENNE save déjà en flash, pas la partie HOF.
2. **[artefact `scene.hof`] Pas de warp-continue** : sans `GameClear`, même une save réussie n'aurait pas le
   `SetContinueGameWarp` vers la chambre/Panthéon (`overworld.ts:296`, `load_save.ts:285`).
3. **[BUG RÉEL] `gSaveFileStatus` global figé** : le menu principal décide d'afficher CONTINUER d'après
   `gSaveFileStatus` (global) — `main_menu.ts:1306` (`switch (gSaveFileStatus)` → `HAS_SAVED_GAME`) et
   `intro.ts:2169`. Or `SetSaveFileStatus()` n'a **qu'UN SEUL appelant** : `harness/main.ts:167-168`
   (`LoadGameSave()` + `SetSaveFileStatus(status)`), exécuté **une seule fois au page-load du module**.
   - Le SoftReset (`Task_CreditsSoftReset` → `bootIntroSequence`, `credits.ts:789-798`) **ne réexécute PAS**
     `main.ts` (reboot simulé, pas de vrai reload page) → `gSaveFileStatus` **reste la valeur du 1er page-load**.
   - `TrySavingData` met à jour `sSaveFileStatus` (**local**, `save.ts:664`), **jamais** le `gSaveFileStatus`
     **global** lu par le menu.
   - Donc : page démarrée SANS save → `gSaveFileStatus=EMPTY` → même après une save HOF réussie, le menu
     post-reboot lit toujours `EMPTY` → **CONTINUER ne s'affiche pas**.

### Ce qui marche
- **Moteur de secteurs** : `__saveSlotEngineSelfTest()` PASSE tout (write×2, counter++, alternance slot,
  `pickedLatestSave`, `saveBlock1RoundTrip`, corruption détectée). Round-trip prouvé.
- Quand CONTINUER est pressé, `CB2_ContinueSavedGame` → `LoadGameSave()` relit le flash À FROID
  (`TestOverworldScene.ts:454`, `GameScene.ts:341-343`) → charge correctement CE QUI EST en flash.

### Plan de fix (bug 4)
- **Cœur (M)** : au reboot SoftReset, réexécuter `LoadGameSave()` + `SetSaveFileStatus(status)` (miroir
  `main.ts:167-168` = ce que `AgbMain`/`main.c` refait à chaque reboot). Point d'accroche : dans
  `Task_CreditsSoftReset` (`credits.ts:755-800`) après le RAM-reset, ou dans `bootIntroSequence`, ou au setup
  copyright. Ainsi le menu post-reboot reflète l'état save réel (y compris une save faite en session).
- **Complément (S)** : `TrySavingData` (ou `SaveGame`) devrait aussi rafraîchir le `gSaveFileStatus` global
  (`SetSaveFileStatus(SAVE_STATUS_OK)`) après écriture réussie — sinon une save en cours de session n'est
  jamais reflétée sans reboot.
- **Pour tester la vraie chaîne** (hors artefacts `?debug`) : câbler `scene.hof` pour appeler `GameClear`
  d'abord, et tester la save DÉVERROUILLÉE (ou tester en boot normal).

**Taille globale bug 4** : **M** (le maillon réel = re-load save au reboot ; les 2 autres sont des artefacts
du chemin de test `?debug`/`scene.hof`).

---

## AUTRES ÉCARTS OBSERVÉS (bonus)

1. **Fond du Hall of Fame** : au lancement `scene.hof`, warnings console
   `[png-loader] /decomp/em/misc/japanese_hof.4bpp.bin absent, fallback loadIndexedPngStrict` et idem
   `confetti.4bpp.bin`. Le fond HOF rendu était **vert-clair uni** au lieu du **bleu/confetti Émeraude**.
   → à vérifier : assets `japanese_hof` / `confetti` (fallback = rendu dégradé possible).
2. **Écran final HOF OK** : « NOM UNDI · N°ID 08763 · DUREE JEU 00:08 » + « MAITRE DE LA LIGUE! FELICITATIONS! »
   corrects (le fix N°ID `8dee92c28` tient). Sortie HOF = presser A (`Task_Hof_ExitOnKeyPressed`, 1:1).
3. **Roues du vélo verdâtres** (cf. bug 2) — à confronter vidéo GBA.
4. **Pacing / musiques** : MUS_CREDITS démarre au lancement ; « THE END » puis MUS_END à la fin
   (`Task_CreditsTheEnd6`, `credits.ts:744-745`). Pacing non mesuré finement vs GBA (commits récents
   `5ea8f7ecf`/`373bb4475` ont ajusté « plein pacing »). Rendu « THE END » **non revérifié visuellement** —
   ⚠️ il partage `gIntroCopyright_Pal` (rampe grise, cf. bug 5) : vérifier qu'il n'est pas AUSSI affecté.
5. **Reboot fonctionnel** : le SoftReset post-FIN ré-amorce bien copyright→intro→overworld sans hang ni
   écran figé — la mécanique de reboot (`ddeb7ef86` « VRAI reboot post-FIN ») est en place ; seul le
   contenu palette copyright (bug 5) et le `gSaveFileStatus` (bug 4) sont à corriger.

---

## Notes de méthode / reproduction

- Onglet isolé `http://localhost:5173/?debug` (bugs 3/4/5 côté test) + `http://localhost:5173/` (référence
  copyright OK) — jamais touché l'onglet partagé `seed`.
- Contrôle frame-précis : `__rt.paused=true` + `runOneFrame()` en boucle ; rendu forcé via `bridge.tick()`
  (le loop `setTimeout` de l'onglet arrière-plan est throttlé → `stepBudget` draine lentement).
- 🩸 **Lecture pixels fiable = `bridge.imageData.data`** (le canvas Phaser WebGL est GELÉ entre 2
  `runOneFrame` synchrones → `drawImage(canvas)` renvoie une frame périmée, faux négatifs).
- Sondes live : `window.__rt.gSprites/gTasks` (PAS `window.gSprites` qui était vide/désync), OAM via
  `rt.gba.oam`, VRAM `rt.gba.vram`, palettes `rt.gPlttBufferFaded.get(i)`.
