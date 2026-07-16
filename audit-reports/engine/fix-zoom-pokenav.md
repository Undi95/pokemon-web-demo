# FIX ZOOM POKÉNAV — option MATCH PHONE (menu principal)

Analyse de la séquence de zoom+fondu de l'option sélectionnée du menu Pokénav, en réponse
au bug live (5 freeze-frames : « MA/MAT » net non-zoomé + fantôme délavé décalé, tranches
verticales avec césures, puis disparition).

Décomp : `D:/Projet 1/decomps/pokeemeraude/src/pokenav_menu_handler_gfx.c`
Port    : `D:/Projet 1/pokemon-web-demo/src/pokenav_menu_handler_gfx.ts`

---

## 1. Séquence C établie (citations décomp)

Une option = **4 sprites INDÉPENDANTS** 32×16 (`NUM_OPTION_SUBSPRITES=4`, c:32), même `x`,
tuilés par `x2 = 32*j` (c:828) et `tileNum + 8*j` (c:866).

**`StartOptionZoom` (c:1019-1042)** — pour chaque sous-sprite j :
- `oam.objMode = ST_OAM_OBJ_BLEND` (c:1027)
- `oam.affineMode = ST_OAM_AFFINE_DOUBLE` (c:1028)
- `callback = SpriteCB_OptionZoom`, `sZoomDelay=8`, `sZoomSetAffine=FALSE`, `sZoomSubspriteId=j` (c:1029-1032)
- `InitSpriteAffineAnim(sprites[0])` + `StartSpriteAffineAnim(sprites[0], 0)` (c:1033-1034) → matrice propre, anim « Normal » (identité).
Puis : `SetGpuReg(BLDALPHA, BLDALPHA_BLEND(16,0))` (c:1038), `CreateTask(Task_OptionBlend, 3)` avec `tBlendDelay=8` (c:1039-1040), `numIconsBlending++` (c:1041).

**`SpriteCB_OptionZoom` (c:1075-1127)** — après `sZoomDelay` (8 frames) :
- 1er passage (`!sZoomSetAffine`) : `StartSpriteAffineAnim(sprite,1)` (= anim Zoom), `sZoomSpeed=0x100`, **plie** `x += x2 ; x2 = 0` (c:1083-1087).
- passages suivants : `sZoomSpeed += 16`, `x = (sZoomSpeed>>3 - 32)/2`, **écarte** `x2 = ∓x*{3,1,1,3}` selon `sZoomSubspriteId` (c:1091-1111).
- à `affineAnimEnded` : `invisible=TRUE`, `FreeOamMatrix`, `CalcCenterToCornerVec(..OFF)`, `affineMode=OFF`, `objMode=NORMAL`, `callback=Dummy` (c:1112-1120).

Table affine Zoom (c:309-314) : `FRAME(0x100,0x100,0,0)` puis `FRAME(0x10,0x10,0,0x12)` → `xScale` 0x100 → 0x220 sur 18 frames (pic ≈ 2,13×).

**`Task_OptionBlend` (c:1134-1177)** — après `tBlendDelay` (8 frames) :
- state 0 : `BLDCNT = BLDCNT_EFFECT_NONE | BLDCNT_TGT2_ALL` (c:1145), `BLDALPHA=(16,0)` (c:1146).
- state 1 : rampe `BLDALPHA` eva 16→…, evb 0→16 sur 12 pas (c:1150-1163), fin (`counter==12`) : `BLDALPHA=(0,16)`, `numIconsBlending--`, `DestroyTask` (c:1164-1168).

**Fenêtre de glow (`SetupPokenavMenuScanlineEffects` c:1311-1331 + `SetMenuOptionGlow` c:1366-1375)** :
`BLDCNT = TGT1_OBJ | EFFECT_LIGHTEN`, `WININ = WIN0_ALL (0x3F, inclut bit5 color-effect)`,
`WINOUT = WIN01_BG_ALL | WIN01_OBJ (0x1F, bit5 NON mis)`, WIN0 = boîte serrée autour de l'option
sélectionnée (x∈[114,240] via `RGB(16,23,28)=0x72F0` DMA scanline → REG_WIN0H ; y = bande du curseur).
⚠️ **Le décomp ne touche PAS WININ/WINOUT au moment du zoom** (les `LoopedTask_Open*` case 0/1 font seulement `ResetBldCnt()` = BLDCNT←0). La boîte WIN0 reste donc active pendant tout le zoom.

---

## 2. Comparaison port ↔ C — divergences

**Séquence de zoom : 1:1 (aucune divergence logique).** Vérifié ligne à ligne :
- `StartOptionZoom` (ts:1204-1229) = c:1019-1042 ✅ (objMode BLEND, affineMode DOUBLE, 4× InitSpriteAffineAnim/StartSpriteAffineAnim, BLDALPHA(16,0), Task_OptionBlend tBlendDelay=8).
- `SpriteCB_OptionZoom` (ts:1255-1312) = c:1075-1127 ✅ (délai 8, pli x+=x2, écart `∓x*{3,1,1,3}`, fin affineAnimEnded).
- `Task_OptionBlend` (ts:1315-1355) = c:1134-1177 ✅ (BLDCNT NONE|TGT2_ALL, rampe BLDALPHA identique).
- Moteur affine (`InitSpriteAffineAnim` decomp-globals:2465, `sprite-engine-impl.ts` Begin/Continue/ApplyAffineAnimFrame) : matrice + anim **par sprite** ; ctcv recalculé −32 en DOUBLE. Conforme à la sonde (matrixNum 1-4, pa=pd identiques ×4, xScale=0x120 mi-zoom).

**Adaptation `SetMenuOptionGlow` (ts:1536-1554) — équivalente, PAS la cause.** Le port ne réplique
pas la DMA HBlank par-ligne (`REG_WIN0H` = `__wireTodo`, ts:59) et pose une fenêtre WIN0 **statique** :
`WIN0H = RGB(16,23,28) = [114,240]` (ts:1552), `WIN0V = [r4, r4+0x10]` (ts:1553). Région nette **identique**
au décomp (boîte serrée autour de l'option au repos, x∈[114,242]). Les `CpuFill16` scalaires (ts:1542-1543,
TRANSPILER-TODO) sont **morts** (buffer scanline non consommé) — sans effet, à nettoyer un jour, pas le bug.

**Correction hypothèse (c) du lead** : il n'existe **AUCUNE copie BG** de l'option à effacer — les
options sont 100 % des sprites (`CreateSprite`+`DrawOptionLabelGfx`). Le « MA/MAT net » n'est PAS un
résidu BG : c'est le **débordement OPAQUE du sprite hors de la boîte WIN0** (voir §3).

---

## 3. Cause racine — MOTEUR (compositor), hors périmètre pokenav_*

`harness/gba/compositor.ts` **gate le blend OBJ semi-transparent (OBJ_BLEND) par la fenêtre** :

- l.264-290 : `blendAllowed = win0BlendEnable` dans WIN0, `= outsideBlendEnable` dehors.
  Or `WINOUT=0x1F` (bit5 CLR=0x20 NON mis, types/decomp-globals:1574) → `outsideBlendEnable=false`.
- l.322 : `if (blendAllowed && blend) { … l.329 if (layer1ObjBlend) { …alpha blend… } }`.

⇒ Le **fondu OBJ_BLEND (rampe BLDALPHA de `Task_OptionBlend`) n'agit QUE dans la boîte WIN0**
[114,240]×[bande curseur]. Pendant le zoom, l'option **déborde** la boîte : (a) écartement
`x2 = ∓x*{3,1,1,3}` (sous-sprite 0 part à GAUCHE sous x=114, sous-sprite 3 à DROITE au-delà de 240),
(b) bbox DOUBLE 2× + scale jusqu'à 2,13×. **Hors de la boîte, `blendAllowed=false` → le sprite rend
OPAQUE (non fondu)** = les tranches « MA/MAT nettes » ; **dedans, le fondu joue** = le fantôme délavé.
C'est EXACTEMENT la signature des 5 frames (net à gauche + fantôme + tranches + disparition finale
quand `affineAnimEnded` pose `invisible`).

Le clip du bbox 2× au pic (hypothèse a) est réel MAIS secondaire : sur GBA il est **masqué par le
fondu** — ici le fondu est spatialement rogné par WIN0, donc rien ne masque.

### Le point à trancher (HW)
Le décomp **laisse WIN0 (boîte glow) active pendant le zoom** et ne modifie pas WININ/WINOUT.
Donc, **si** le GBA gate réellement l'OBJ semi-transparent par le bit5-fenêtre (ce que documentent
Tonc/NanoBoyAdvance), l'artefact existe AUSSI sur hardware — juste **discret à 60 fps sur écran GBA**,
mais **exagéré** ici par (i) l'inspection frame-par-frame, (ii) le rendu net haute-résolution du port.
**Si** au contraire le zoom est LISSE sur la vidéo hardware de l'utilisateur (référence = autorité 1:1),
alors le GBA **ne** gate PAS l'OBJ semi-transparent par la fenêtre → le gate `blendAllowed` du
compositor est le bug.

### Fix moteur proposé (à appliquer par le lead — HORS scope pokenav_*, impact combats)
Dans `harness/gba/compositor.ts`, **sortir le blend OBJ semi-transparent du gate `blendAllowed`**
(seuls les effets pilotés par BLDCNT — alpha/brighten/darken — restent gated) :

```ts
// AVANT (l.322-337) : le semi-OBJ est DANS le gate fenêtre.
// APRÈS : semi-OBJ blend indépendant de blendAllowed (visible partout où l'OBJ l'est).
if (blend && layer1ObjBlend) {
  const top2Mask = 1 << layer2;
  if (blend.target2 & top2Mask) {
    const a1w = Math.min(blend.alpha1, 16) / 16;
    const a2w = Math.min(blend.alpha2, 16) / 16;
    r = r1 * a1w + r2 * a2w; g = g1 * a1w + g2 * a2w; b = b1 * a1w + b2 * a2w;
  }
} else if (blendAllowed && blend && blend.mode > 0) {
  // … modes BLDCNT 1/2/3 inchangés, toujours gated par la fenêtre …
}
```
Le glow au repos (LIGHTEN = mode 2) **reste** window-gated (au repos les options sont `OBJ_NORMAL`,
donc `layer1ObjBlend=false`) → aucun impact sur le highlight. Seul le zoom (options `OBJ_BLEND`) change.
⚠️ Le blend semi-OBJ est très utilisé en combat → **vérification live combat obligatoire** avant merge.

---

## 4. Diff appliqué

**AUCUN changement dans `pokenav_*`** : la séquence de zoom du port est déjà 1:1 avec le décomp
(§2). Le seul levier est moteur (`compositor.ts`, §3), **hors du périmètre `pokenav_* uniquement`** →
documenté, non appliqué (règle : « si un manque moteur bloque, documente-le au lieu de contourner »).
Aucun contournement pokenav (qui serait non-1:1) n'a été introduit. `npx tsc --noEmit` inchangé.

---

## 5. Ce qui reste (moteur)

1. **`compositor.ts:322/329` — gate `blendAllowed` sur l'OBJ semi-transparent** (§3). Fix ci-dessus,
   conditionné à la vérif vidéo HW de l'utilisateur. C'est LE candidat n°1 pour l'artefact.
2. **`src/sprite.ts:1917-1922` — `syncSpritesToOam` : `oam.affineMode = sprite.affineMode | oam.affineMode`**
   (OR avec la valeur OAM PÉRIMÉE) n'est pas 1:1 (le décomp copie le champ). Latent, **pas** la cause du
   zoom (mi-zoom 3|3=3) ; mais à la FIN (sprite→OFF, matrixNum non remis à 0) il garde `affineMode=3`
   (0|3=3) → l'OAM reste en DOUBLE sur une matrice libérée jusqu'à ce que matrixNum retombe à 0
   (le sprite est déjà `invisible` à ce moment, donc invisible visuellement — à surveiller si un futur
   sprite réutilise le slot). Devrait être une copie franche (`oam.affineMode = sprite.affineMode`).

---

## 6. Plan de re-test live (le lead vérifie en jeu)

1. **Comparer la vidéo hardware** (Émeraude réel) du zoom MATCH PHONE : le fondu couvre-t-il TOUTE
   l'option qui grossit, ou seulement la cellule de repos ? → tranche la question §3.
2. Si « toute l'option » : appliquer le fix compositor (§3), puis :
   - Pokénav : ouvrir le menu, `press A` sur MATCH PHONE → le zoom doit fondre uniformément (plus de
     tranches nettes), disparition propre, transition écran suivant OK.
   - **Non-régression combat** : lancer un combat, vérifier tout effet OBJ semi-transparent
     (`__byteVm.load()` + `launchTB(...)`) — ombres/anims translucides inchangées.
   - Non-régression glow : au repos, le highlight de la cellule sélectionnée reste borné à la cellule.
3. Sonde utile pendant le zoom (4 sous-sprites `gfx.iconSprites[sel][0..3]`) : confirmer que
   `blendAllowed` (dans la boucle compositor) est bien la seule variable qui diffère entre la zone
   nette et la zone fondue — c.-à-d. `oam.objMode===1` partout, matrices identiques, seul le pixel
   dedans/dehors WIN0 change.
