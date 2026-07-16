# AUDIT MOTEUR — `src/sprite.c` (1760 l) vs port TS

> Lecture seule. Cibles : `src/sprite.ts` (2052 l), `harness/runtime/decomp-globals.ts`,
> `harness/runtime/decomp-runtime.ts`, `src/engine/decomp-impls/sprite-engine-impl.ts`,
> `harness/gba/compositor.ts`, `harness/runtime/decomp-helpers.ts`. Headers `include/sprite.h`,
> `include/gba/types.ts`. Corps comparés — jamais les commentaires « 1:1 » du port.

## Compteurs (≈102 fns sprite.c, statics incluses)

| Statut | N | Sens |
|---|---|---|
| ✅ 1:1 (dont replis fidèles) | ~72 | corps équivalent, adaptations moteur légitimes |
| 🟡 DIVERGENT | 6 | comportement observable différent |
| 🟠 PARTIEL / replié non-1:1 | ~9 | fusionné dans une autre fn, sémantique fine perdue |
| 🔴 STUB | 0 | — |
| ⛔ ABSENT | ~15 | pas d'impl centrale (parfois dupée localement) |
| 🔌 EXEMPTION-HW | 3 | LoadOam / CopyMatricesToOamBuffer / oamBuffer |

**VERDICT (1 ligne) :** cœur sprite/anim/affine/palette/tile **fidèle et solide** ; le bug zoom Pokénav n'est **PAS** dans l'état (matrices/vec/positions justes, vérifiés) — il est **dynamique** dans le rendu affine-DOUBLE (plafond bbox 2× + fondu OBJ-BLEND) ; principaux manques = anchor-matrix, loops affines à compteur, sérialisation Copy*, et divergence subsprites×affine.

---

## Tableau par fonction

### Cœur boucle / OAM

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| ResetSpriteData | ✅ | 294 | sprite.ts:1512 | ordre 1:1 ; reset arrays statics + bitmap + `gOamMatrixAllocBitmap=0` |
| AnimateSprites | ✅ | 308 | sprite.ts:2015 | callbacks + tick anims + tick affine (repli des CB2 non-main) |
| BuildOamBuffer | 🟠 | 325 | sprite.ts:2024 | replié en `syncSpritesToOamPublic` ; fusionne Update/Build/Sort/Add/CopyMatrices |
| UpdateOamCoords | ✅ | 339 | sprite.ts:1898 | dans syncSpritesToOam ; `x+x2+ctcv (+offset si coordOffsetEnabled)` 1:1 |
| BuildSpritePriorities | 🟠 | 361 | compositor.ts:167 | clé `subpriority \| (priority<<8)` recalculée au tri compositor |
| **SortSprites** | 🟡 | 372 | compositor.ts:164-175 | **l'ajustement Y spécial AFFINE_DOUBLE+SIZE_3 square/vrect (c:391-411, `Y>128 → Y-256`) N'EST PAS répliqué** → z-order des gros sprites affine-double peut diverger |
| CopyMatricesToOamBuffer | 🔌 | 469 | — | pas d'oamBuffer ; compositor lit `gba.affineParams` live |
| AddSpritesToOamBuffer | 🟠 | 482 | sprite.ts:1898 + globals:1999 | single-OAM via syncSpritesToOam ; subsprites via syncSubspriteOam |
| CreateSprite | ✅ | 502 | sprite.ts:1739 | routeur inline/by-tag → CreateSpriteAtOam (scan 1er slot `!inUse` 1:1) |
| CreateSpriteAtEnd | 🟠 | 513 | sprite.ts:1660 | pas d'export ; replié en flag `fromEnd` de CreateSpriteAtOam |
| CreateInvisibleSprite | ⛔ | 524 | — | central absent ; dupes locales (voir rustines) |
| CreateSpriteAt | ✅ | 540 | sprite.ts:1549/1760 | CreateSpriteAtOam / _CreateSpriteAtTemplate ; CalcCenterToCornerVec appliqué |
| CreateSpriteAndAnimate | ⛔ | 591 | — | central absent ; inliné par appelant combat |
| DestroySprite | ✅* | 618 | sprite.ts:1427 | 1:1 free-tiles inline ; *divergence assumée : libère AUSSI la matrice OAM si allouée (le décomp la laisse au caller) |
| ResetOamRange | ✅ | 633 | sprite.ts:700 | dummy OAM (y160 x304 pri3) 1:1 |
| LoadOam | 🔌 | 640 | sprite.ts:722 | no-op (pas de double-buffer, compositor lit live) |
| ClearSpriteCopyRequests | 🟠 | 646 | sprite.ts:1151 | `ResetSpriteCopyRequests` vide la queue mais **ne remet pas `sShouldProcess=FALSE`** (sans effet chez nous, drain synchrone) |

### Matrices / center-vec / tiles

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| ResetOamMatrices | ✅ | 661 | sprite.ts:593 | identité sur 32 slots |
| SetOamMatrix | ✅ | 674 | sprite.ts:611 / helpers:46 | ⚠️ **2 impls** : helpers:46 garde signé (moteur affine) ; globals:1141 masque `& 0xFFFF` (C transcrit) → **pa<0 cassé si un port passe par la 2e** |
| ResetSprite | 🟠 | 682 | sprite.ts:1456 | pas de `*sprite=sDummySprite` ; replié dans DestroySprite/_makeTrashSprite |
| CalcCenterToCornerVec | ✅ | 687 | sprite.ts:1004 | **retourne** le vec (≠ écrit sprite) ; `×2` si AFFINE_DOUBLE_MASK 1:1 |
| AllocSpriteTiles | ✅ | 702 | sprite.ts:894 | scan bitmap first-fit 1:1 (tileCount==0 → free tout) |
| SpriteTileAllocBitmapOp | ⛔ | 755 | — | absent (non-référencé décomp aussi) |
| SpriteCallbackDummy | ✅ | 781 | globals | no-op |
| ProcessSpriteCopyRequests | ✅ | 785 | sprite.ts:1140 | drain queue → objVram |
| RequestSpriteFrameImageCopy | ✅ | 802 | sprite.ts:1120 | queue par index d'image |
| RequestSpriteCopy | ❓ | 813 | — | générique `(src,dest,size)` non retrouvé 1:1 (queue = destTileNum) ; réf globals:1433 |
| CopyFromSprites | ⛔ | 824 | — | sérialisation savestate — absent (savestate JS) |
| CopyToSprites | ⛔ | 836 | — | idem — absent |
| ResetAllSprites | 🟠 | 848 | sprite.ts:1526 | `gSprites.fill(undefined)` + sentinelle `[MAX_SPRITES]` (trash) |
| FreeSpriteTiles(sprite) | ⛔ | 861 | — | wrapper absent (FreeSpriteTilesByTag existe) |
| FreeSpritePalette(sprite) | ⛔ | 873 | — | wrapper absent (FreeSpritePaletteByTag existe) |
| FreeSpriteOamMatrix | ✅ | 884 | sprite.ts:562 | modèle plat `sprite.affineMode`/`matrixNum` |
| DestroySpriteAndFreeResources | ⛔ | 893 | — | central absent ; inliné par appelant (battle_anim `DestroySpriteAndFreeResources_`) |

### Animation frame (sheet/image)

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| AnimateSprite | 🟠 | 901 | sprite.ts:1369 | **ne fait que la frame-anim** ; l'affine (`sAffineAnimFuncs`) est séparé en `tickAllAffineAnims` (≠ un seul appel décomp) |
| BeginAnim | ✅ | 909 | sprite.ts:1229 | `imageValue!=-1`, flips si non-affine, sheet vs image |
| ContinueAnim | ✅ | 943 | sprite.ts:1247 | delay/dispatch 1:1 |
| AnimCmd_frame/end/jump/loop | ✅ | 968-1034 | sprite.ts:1279-1311 | dispatch `switch(kind)` (≠ table de fn, adaptation) |
| BeginAnimLoop/ContinueAnimLoop/JumpToTopOfAnimLoop | ✅ | 1036-1065 | sprite.ts:1316-1361 | compteur de boucle 1:1 (remonte au LOOP) |
| StartSpriteAnim / IfDifferent | ✅ | 1346-1357 | sprite.ts:1384-1394 | 1:1 |
| SeekSpriteAnim | ✅* | 1359 | sprite.ts:1398 | *idiome différent : le décomp sauve/restore `animPaused` ; le port restore `animBeginning/delayCounter` **si animEnded** — vérifier équivalence sur anims longues |
| SetSpriteSheetFrameTileNum | 🟠 | 1403 | sprite.ts:1858 | pas de fn ; logique inlinée (`sheetTileStart+imageValue`) |
| SetSpriteOamFlipBits | ✅ | 1246 | sprite.ts:1181 | flip OAM = frame XOR `sprite.hFlip` (via `animHFlip`/`animVFlip`), ne touche pas hFlip manuel 1:1 |
| DecrementAnimDelayCounter | 🟠 | 1289 | sprite.ts:1194 | **ne teste pas `animPaused`** (le décomp si) — caller garde, mais divergence si appelé pausé |

### Affine anim (moteur `sprite-engine-impl.ts`)

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| BeginAffineAnim | 🟠 | 1067 | engine:234 | 1:1 SAUF **`if(anchored) UpdateSpriteMatrixAnchorPos` ABSENT** (c:1079-1080) |
| ContinueAffineAnim | 🟠 | 1084 | engine:295 | 1:1 SAUF **anchor absent** (c:1109-1110) + loop/jump simplifiés (voir dessous) |
| AffineAnimDelay | ✅ | 1114 | engine:301 | replié (branche delay) |
| **AffineAnimCmd_loop** | 🟡 | 1124 | engine:336 | terminator `'LOOP'` → `cmdIndex=0` : **le COMPTEUR de boucle et JumpToTopOfAffineAnimLoop sont PERDUS** (loop affine multi-frame incorrecte) |
| BeginAffineAnimLoop / ContinueAffineAnimLoop / JumpToTopOfAffineAnimLoop | ⛔ | 1132-1161 | — | absents (compteur de boucle affine non modélisé) |
| **AffineAnimCmd_jump** | 🟡 | 1163 | engine:336 | terminator `'JUMP'` → `cmdIndex=0` **en dur** : ignore `jump.target` ≠ 0 |
| AffineAnimCmd_end | ✅ | 1172 | engine:324 | `ended=TRUE`, cmdIndex--, ré-applique dummy 1:1 |
| AffineAnimCmd_frame | ✅ | 1180 | engine:341 | 1:1 |
| CopyOamMatrix | ✅ | 1188 | sprite.ts:629 | 1:1 |
| GetSpriteMatrixNum | 🟠 | 1196 | — | pas de fn (état affine sur le sprite ; `matrixNum` lu direct) |
| SetSpriteMatrixAnchor | ⛔ | 1206 | — | **système anchor ABSENT** (minigame countdown) |
| GetAnchorCoord | ⛔ | 1213 | — | absent |
| UpdateSpriteMatrixAnchorPos | ⛔ | 1225 | — | absent → `sprite.anchored` sans effet |
| AffineAnimStateRestartAnim | 🟠 | 1253 | engine:244 | inliné dans BeginAffineAnim |
| AffineAnimStateStartAnim | ✅ | 1260 | engine:61 | 1:1 (état sur sprite) |
| AffineAnimStateReset | ✅ | 1271 | engine:51 | 1:1 |
| ApplyAffineAnimFrameAbsolute | 🟠 | 1282 | engine:193 | inliné (branche duration==0) ; `rotation<<8` sans mask 1:1 |
| DecrementAffineAnimDelayCounter | 🟠 | 1295 | engine:305 | inliné (check `affineAnimPaused`) |
| ApplyAffineAnimFrameRelativeAndUpdateMatrix | ✅ | 1302 | engine:205 | `+= deltas`, `& ~0xFF` rot, ObjAffineSet→CopyOamMatrix 1:1 |
| ConvertScaleParam | ✅ | 1316 | engine:105 / sprite.ts:638 | `0x10000/scale` clampé s16 1:1 |
| GetAffineAnimFrame | 🟠 | 1322 | engine:307 | inliné (`anim.frames[cmdIndex]`) |
| ApplyAffineAnimFrame | ✅ | 1330 | engine:175 | duration!=0 → relatif ; ==0 → absolu+dummy 1:1 |
| StartSpriteAffineAnim | ✅ | 1373 | engine:76 | 1:1 (+`ended=!table` = no-op fini immédiat, adaptation gate) |
| StartSpriteAffineAnimIfDifferent | ⛔ | 1381 | — | central absent |
| ChangeSpriteAffineAnim | ✅ | 1388 | engine:93 | 1:1 (scale/rot persistent) |
| ChangeSpriteAffineAnimIfDifferent | ⛔ | 1396 | — | central absent (dupe locale event_object_movement:5615) |
| ResetAffineAnimData | 🟠 | 1414 | sprite.ts:1538 | **partiel** : `gOamMatrixAllocBitmap=0` seul ; ne rappelle ni ResetOamMatrices ni AffineAnimStateReset(×32), et `gAffineAnimsDisabled` non remis |
| AllocOamMatrix | ✅* | 1427 | sprite.ts:507 | *DIVERGENCE assumée : scan dès **i=1** (slot 0 réservé identité) ; décomp scanne dès 0 |
| FreeOamMatrix | ✅ | 1448 | sprite.ts:546 | + reset identité (1:1 c:1460) |
| InitSpriteAffineAnim | ✅ | 1463 | globals:2465 | recalcule ctcv pour affineMode courant (fix « REEL » du zoom) |
| SetOamMatrixRotationScaling | ✅ | 1475 | sprite.ts:668 | sin/cos gSineTable + ObjAffineSet 1:1 |

### Sheets / palettes / tags (tous ✅)

| Fonction | Statut | C:ligne | Port |
|---|---|---|---|
| LoadSpriteSheet(s) | ✅ | 1486/1502 | sprite.ts:942/967 (+guard size 0) |
| FreeSpriteTilesByTag | ✅ | 1509 | sprite.ts:856 |
| FreeSpriteTileRanges | ✅ | 1531 | sprite.ts:827 |
| GetSpriteTileStartByTag / IndexOfSpriteTileTag / GetSpriteTileTagByTileStart / AllocSpriteTileRange | ✅ | 1542-1578 | sprite.ts:759/741/777/796 |
| FreeAllSpritePalettes / LoadSpritePalette(s) / DoLoadSpritePalette / AllocSpritePalette / IndexOfSpritePaletteTag / GetSpritePaletteTagByPaletteNum / FreeSpritePaletteByTag | ✅ | 1581-1657 | sprite.ts:282/433/477/403/344/306/362/377 (substrat u16-tag synthétique ≥0xC000 pour tags string) |

### Subsprites (🟡 divergence affine)

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| SetSubspriteTables | 🟡 | 1659 | globals:1937 | alloue **d'avance** N OAM enfants (≠ décomp qui les construit à `BuildOamBuffer`) ; enfant `oam.affineMode=0` **en dur** (l.1978) |
| AddSpriteToOamBuffer | 🟠 | 1666 | globals:1999 | branche subsprite → syncSubspriteOam |
| **AddSubspritesToOamBuffer** | 🟡 | 1683 | globals:1999 | **le décomp fait `destOam[i]=*oam`** → chaque enfant HÉRITE `affineMode`+`matrixNum` du parent ; le port force les enfants **non-affine** → **un sprite à SubspriteTable ET affine rendrait ses enfants sans transfo** (non déclenché par les options Pokénav, qui sont 4 sprites séparés) |

---

## 🚨 MANQUES CRITIQUES

1. **Système anchor-matrix absent** — `SetSpriteMatrixAnchor` / `GetAnchorCoord` / `UpdateSpriteMatrixAnchorPos` (c:1206-1244) + les appels `if(anchored)` dans Begin/ContinueAffineAnim (c:1079-1080, 1109-1110). `sprite.anchored` reste sans effet. Impact : compte-à-rebours des mini-jeux (les chiffres glisseraient en scalant). Table `sOamDimensions32` (c:220) aussi absente (uniquement utilisée par l'anchor).
2. **Loops affines à compteur** — `AffineAnimCmd_loop` + Begin/Continue/JumpToTopOfAffineAnimLoop (c:1124-1161) réduits à « JUMP index 0 » ; **le compteur de boucle et `jump.target` non-nul sont ignorés** (engine:336). Toute anim affine avec `AFFINEANIMCMD_LOOP(n)` ou jump vers ≠0 diverge.
3. **Divergence subsprites × affine** — `AddSubspritesToOamBuffer` : les OAM enfants ne recopient PAS `affineMode`/`matrixNum` du parent (globals:1978). Latent tant qu'aucun sprite affine n'utilise `SetSubspriteTables`.
4. **`SortSprites` : ajustement Y AFFINE_DOUBLE+SIZE_3 non répliqué** (c:391-411) → z-order des gros sprites affine-double (64×64 square/vrect) potentiellement faux.
5. **`SetOamMatrix` à deux impls** — helpers:49 (signé, moteur) vs globals:1141 (`& 0xFFFF`, C transcrit) : une matrice à `pa/pb/pc/pd` négatif écrite via la 2e serait lue u16 par le compositor → `texX` explose (cf. bg-layer.ts:192, même piège côté BG). Vérifier qu'aucun C transcrit ne pose de matrice affine rotée via globals:SetOamMatrix.

**Manques mineurs :** `gAffineAnimsDisabled` non modélisé (tickAllAffineAnims ne le teste pas → anims affines non gelées en link trade, hors solo) · `gOamLimit`(64) non appliqué (compositor rend jusqu'à 128 OAM) · Copy{To,From}Sprites absents (savestate C, remplacé JS) · `RequestSpriteCopy` générique ❓.

## DONNÉES / TABLES

| Table C | C:ligne | Port | Statut |
|---|---|---|---|
| sCenterToCornerVecTable[3][4][2] | 137 | sprite.ts:980 | ✅ 1:1 |
| sOamDimensions[3][4] | 245 | globals:1931 `_SUB_W` | 🟠 **largeur seule** (hFlip subsprite) ; hauteur absente ; compositor a `OAM_SIZES` (types) pour w/hPx |
| sOamDimensions32[3][4] | 220 | — | ⛔ (anchor absent) |
| gDummyOamData / DUMMY_OAM_DATA | 101/171 | sprite.ts:2037 | ✅ |
| sDummySprite | 159 | sprite.ts:1484 `_makeTrashSprite` | 🟠 sentinelle trash 1:1 |
| sDummyAnim / gDummySpriteAnimTable | 173 | sprite.ts:2045 | ✅ |
| gDummySpriteAffineAnimTable | 177 | sprite.ts:2051 | ✅ (nom-string, adaptation moteur affine par-nom) |
| sAnimFuncs / sAffineAnimFuncs / sAnimCmdFuncs / sAffineAnimCmdFuncs | 192-218 | — | 🟠 remplacées par `switch(kind)`/terminator (adaptation) |
| sUnknownData[24] | 127 | — | ⛔ (non-référencé décomp) |
| gSpriteCoordOffsetX/Y | 289 | rt.gSpriteCoordOffsetX/Y (syncSpritesToOam:1904) | ✅ |
| gOamMatrices[32] | 291 | gba.affineParams[32] | ✅ (champs `pa/pb/pc/pd`) |
| sAffineAnimStates[32] | 273 | état SUR le sprite (engine:15) | ✅ (équiv. car 1 matrice/sprite) |

## RUSTINES À PURGER (dupes locales de fns sprite.c)

| Rustine | Fichier:ligne | Canonique à réimporter |
|---|---|---|
| `CreateInvisibleSprite` local | field_effect_helpers.ts:2135 | CreateInvisibleSprite (à porter, c:524) |
| `_CreateInvisibleSpriteWithCallback` | battle_main.ts:3673 | idem |
| `_StartSpriteAnimIfDifferent` | battle_main.ts:3532 | StartSpriteAnimIfDifferent (sprite.ts:1392) |
| `_ChangeSpriteAffineAnimIfDifferent` | event_object_movement.ts:5615 | ChangeSpriteAffineAnimIfDifferent (à porter, c:1396) |
| `DestroySpriteAndFreeResources_` | battle_anim_effects_3.ts:3874 | DestroySpriteAndFreeResources (à porter, c:893) |

(Dette déjà notée dans l'en-tête sprite.ts:37-40.)

## CALL-SITES ORPHELINS

- `CreateSpriteAndAnimate` : uniquement en **commentaires** 1:1 (battle_anim.ts:56/1260/1294, battle_anim_effects_1.ts:313, battle_anim_flying.ts:947) — chaque appelant a inliné son propre chemin ; pas d'orphelin runtime, mais fn canonique manquante.
- `DestroySpriteAndFreeResources` : commentaires (battle_interface.ts:783, battle_main.ts:1616, battle_anim_throw.ts:1512) → inliné localement.
- Aucun appel à une fn **non définie** détecté (pas de crash latent type `__sprite.X` undefined sur ce périmètre).

## DIAGNOSTIC ZOOM POKÉNAV

**Mécanique réelle (décomp `pokenav_menu_handler_gfx.c`, `NUM_OPTION_SUBSPRITES=4`) :** une option = **4 `struct Sprite` SÉPARÉS** (pas un sprite à `SetSubspriteTables`), chacun 32×16 (H_RECT, `SPRITE_SIZE(32x16)`), même `x`, tuilés par `x2 = 32*j` (c:828) et tuiles `tileNum + 8*j` (c:866). À la sélection, `StartOptionZoom` (c:1019) passe chaque pièce en `AFFINE_DOUBLE`+`OBJ_BLEND`, `InitSpriteAffineAnim` par pièce (→ matrice propre, ctcv recalculé `-32`), et `SpriteCB_OptionZoom` (c:1075) : (1) plie `x += x2 ; x2 = 0`, (2) lance l'anim Zoom (`xScale 0x100 → 0x220` sur 0x12 frames), (3) **écarte** les pièces via `x2 = ∓x*{3,1,1,3}` (case 0..3). Le port (`pokenav_menu_handler_gfx.ts:1204/1255`) est **1:1** ; le moteur affine produit les bonnes matrices ; `renderOamSpriteAffine` (compositor:527) centre chaque pièce sur son propre centre — **correct**.

**Vérifs (arithmétique) :** à l'identité affine-double, `oam.x = x + x2 - 32` (espacés 32) et chaque pièce dessine sa texture 32px au **milieu** de son bbox 64px → écrans `[X-16,X+16) [X+16,X+48) [X+48,X+80) [X+80,X+112)` = **contigus, zéro trou**. La sonde (« 4 matrices `pa=pd` identiques, x espacés de 32, ctcv=-32, affineMode 3 ») décrit donc un état **JUSTE** — qui devrait rendre les 4 pièces identiquement. Le sens du scale est bon : `xScale` croît → `ConvertScaleParam` décroît (256→120) → `pa` décroît → **agrandissement** (« zooms in »), pas de rétrécissement.

**Diagnostic (2 lignes) :** Le bug n'est PAS l'état (vérifié juste) ni le modèle (4 sprites affine-double = 1:1 hardware) : c'est **dynamique**. Au pic, `xScale=0x220 → pa≈120 = zoom 2,13×** qui **dépasse le plafond 2× du bbox AFFINE_DOUBLE (64px)** → les colonnes externes de chaque pièce 32px sont **clippées** par son bbox pendant que `x2=±3x` **écarte** les pièces → bords clippés = « bandes fines + trous ». Sur hardware c'est masqué par le **fondu OBJ-BLEND simultané** (`Task_OptionBlend` rampe BLDALPHA) ; côté port le compositor gère bien `objMode===1` (compositor:314-326) mais **le fondu ne semble pas atténuer l'option pendant le zoom** → l'artefact reste visible.

**Réserve honnête sur « le 1er OK, 3 autres cassés » :** l'asymétrie SPATIALE (pas temporelle) **n'est pas reproductible** depuis l'état uniforme de la sonde — 4 pièces à matrice/shape/size identiques et positions entières exactes doivent rendre **pareil**. Cela pointe une **divergence d'état par-pièce invisible dans la sonde résumée**, candidats : (a) matrice/`affineParamIndex` des pièces 1-3 non rafraîchie tandis que la 0 l'est ; (b) `affineAnimEnded` atteint plus tôt sur 1-3 → retour `AFFINE_OFF` + ctcv `-16` (décalage +16) prématuré ; (c) OAM enfant/voisin qui piétine 1-3.

**Sonde live recommandée (par frame, pendant le zoom, pour les 4 pièces `gfx.iconSprites[sel][0..3]`) :**
`{oamIndex, matrixNum, oam.affineParamIndex, affineParams[matrixNum].pa/pd, affineMode, oam.affineMode, tileId, oam.x, x2, affineAnimEnded, objMode}` — et vérifier que le **fondu BLDALPHA** descend bien vers 0 pendant que le zoom monte. La première divergence entre pièce 0 et 1-3 = la cause racine.

**Pistes de correction (après confirmation) :** si clip+écartement pur → tolérable seulement si le fondu masque (réparer le fondu OBJ-BLEND/BLDALPHA) ; l'InitSpriteAffineAnim « REEL » (globals:2465) a déjà réglé le décalage ctcv statique — reste l'interaction dynamique.
