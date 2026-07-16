# Audit PPU / Compositor émulé — vs GBATEK & usages jeu

Cibles auditées : `harness/gba/compositor.ts`, `bg-layer.ts`, `gba.ts`, `types.ts`,
`palette.ts`, `tile.ts`, `flash-mask.ts`, routage `SetGpuReg` dans
`harness/runtime/decomp-runtime.ts`, + moteur scanline `src/scanline_effect.ts`.
Méthode : lecture ligne-à-ligne + croisement `grep` décomp (`D:/Projet 1/decomps/pokeemeraude`).
**Lecture seule — aucun fichier existant modifié.**

## Compteurs (≈52 sous-features)

| Statut | Nb | Signification |
|---|---|---|
| ✅ fidèle | 34 | Conforme GBATEK + chemin jeu OK |
| 🟡 divergente | 6 | Écart chiffré/documenté, impact souvent faible |
| 🟠 partielle | 2 | Rendu présent mais chemin d'activation incomplet |
| ⛔ absente | 10 | Non implémentée |
| ❓ incertaine | 0 | — |

**Verdict global : SOLIDE pour le cœur solo.** BG text/affine, OBJ regular/affine/double,
priorités + tie-breaks, fenêtres rectangulaires, blend 0-3, OBJWIN, OBJ semi-transparent,
scanline BG-offset/BLDALPHA : tous 1:1. **Le trou structurant unique = les effets scanline
qui ciblent un registre AUTRE que BGnH/VOFS ou BLDALPHA** (WIN0H/V, BLDY, affine) : non
routés → ils forcent 2 rustines (flash grotte, glow Pokénav) et un mis-routage latent.
Le rendu affine-double OBJ (bug zoom Pokénav) est **correct côté moteur** ; la faute est en
amont (matrices par pièce).

---

## Tableau des features

| Feature | Statut | Ligne | Utilisé par (où) | Détail |
|---|---|---|---|---|
| Mode vidéo 0 (4 BG text) | ✅ | compositor.ts:194-201 ; runtime:838-860 | overworld, menus, combat | `isAffine` piloté par mode DISPCNT |
| Mode 1 (BG0/1 text + BG2 affine) | ✅ | runtime:857-858 | rares (title/intro/trade) | grep décomp : `DISPCNT_MODE_1` bg/intro/title/trade |
| Mode 2 (BG2/3 affine) | ✅ | runtime:859-860 | idem | BG3 affine matIdx=1 |
| Modes 3/4/5 (bitmap) | ⛔ | types.ts:12 | **aucun** (grep décomp = 0) | Émeraude n'en fait jamais → non-atteignable |
| BG text 4bpp | ✅ | bg-layer.ts:124-125 | partout | cache tile numérique |
| BG text 8bpp | ✅ | bg-layer.ts:126 | rares BG 256c | palette bank ignorée en 8bpp |
| BG text sizes 0-3 (quadrants TL/TR/BL/BR) | ✅ | bg-layer.ts:82-102 | 64×32/32×64/64×64 maps | layout screen-block 1:1 |
| BG flips H/V (text) | ✅ | bg-layer.ts:111-113 | partout | décodés dans map-entry |
| BG scroll HOFS/VOFS (+ modulo négatif) | ✅ | bg-layer.ts:69,73 ; runtime:790-797 | partout | wrap positif propre |
| BG affine matrice pa/pb/pc/pd (sign-extend) | ✅ | bg-layer.ts:193-201 ; runtime:815-833 | title/roulette/… | s16 reconstruit |
| BG affine wraparound + clip | ✅ | bg-layer.ts:204-212 | selon `BGCNT` bit13 | |
| BG affine sizes 16/32/64/128 tiles | ✅ | bg-layer.ts:147-152,184 | | 8bpp forcé, tilemap u8 |
| BG affine ref-point 28.8 (BG2X/Y L/H) | ✅ | runtime:820-833 | | reconstruit par moitiés |
| BG affine ref reload PAR SCANLINE (Mode7) | ⛔ | — | roulette/cablecar (rare) | scanline effect ne touche que BGnH/VOFS+BLDALPHA |
| BG priority + tie-break (BG0>BG1>BG2>BG3) | ✅ | compositor.ts:124-129,294-306 | partout | tri stable, low-index au-dessus |
| BG mosaic horizontal | 🟠 | compositor.ts:203-205,619-632 | battle_transition.ts:788, battle_anim_effects_3.ts:3920, window.ts:830 | **`applyBgCnt` ignore `BGCNT` bit6** (runtime:878-886) ; marche seulement via `cfg.mosaic=true` écrit en direct |
| BG mosaic vertical | ⛔ | compositor.ts:209-210 (skip explicite) | transitions Mugshot, evo | absent → transitions mosaïque incomplètes |
| OBJ regular (mode 0) | ✅ | compositor.ts:428-516 | partout | |
| OBJ affine (mode 1) | ✅ | compositor.ts:527-613 | combat, anims | transfo inverse 8.8 |
| OBJ affine DOUBLE (mode 3, bbox 2×, échant. autour du centre) | ✅ | compositor.ts:537-572 | zoom Pokénav, throws | **math GBATEK-exacte** (voir diagnostic) |
| OBJ hidden (affineMode 2) | ✅ | compositor.ts:402 | | |
| OBJ shapes/tailles (square/wide/tall × 4) | ✅ | types.ts:183-190 ; compositor.ts:411 | partout | `OAM_SIZES` complet |
| OBJ 4bpp / 8bpp (tileNum en unités 32B, >>1 en 8bpp) | ✅ | compositor.ts:485-493,592-600 | mons combat 8bpp | |
| OBJ mapping 1D | ✅ | compositor.ts:379,474-480 | partout | Émeraude = 1D partout |
| OBJ mapping 2D | ⛔ | (codé en dur 1D) | **aucun** (`DISPCNT_OBJ_1D_MAP` partout) | DISPCNT bit6 non lu → non-atteignable |
| OBJ flip H/V | ✅ | compositor.ts:466-467 | | |
| OBJ priorité vs BG + tie-break (OBJ gagne l'égalité ; sprite idx) | ✅ | compositor.ts:294-318,164-175 | partout | BG écrit puis OBJ à pri égale |
| OBJ subpriority (BuildSpritePriorities) | ✅ | compositor.ts:147-175 ; types.ts:176-179 | intro Manectric, doubles | `subpri \| pri<<8` |
| OBJ mosaic (par sprite, bit OAM) | 🟠 | compositor.ts:459-465 | pokemon_storage_system.ts:2265 (release direct) | **`syncSpritesToOam` ne sync PAS `sprite.mosaic→oam.mosaic`** (sprite.ts:1898-1924) → champ template non propagé (evo) |
| OBJ wrap Y 8-bit (météo top-wrap) | ✅ | compositor.ts:445-446 | cendre/brouillard/neige | |
| OBJ affine : wrap Y NON modélisé | 🟡 | compositor.ts:542-545 | — | assumé (aucun sprite affine ne défile >256) |
| OBJ wrap X 9-bit | ✅ | compositor.ts:456,462 | nuages SUNNY | |
| WIN0 / WIN1 rect + wrap X1>X2 / Y1>Y2 | ✅ | compositor.ts:237-275 | starter_choose, menus | wrap-around GBATEK |
| WINOBJ (objMode=2 définit le masque) | ✅ | compositor.ts:409,638-720 | title shine, spotlight | sprites non dessinés, masque only |
| WINOUT | ✅ | compositor.ts:287-290 ; runtime:807-813 | | |
| Enable bits par couche (WININ/WINOUT) | ✅ | runtime:925-930,807-812 | | + bit blend par région |
| Priorité fenêtres WIN0>WIN1>WINOBJ>WINOUT | ✅ | compositor.ts:277-290 | | 1:1 GBATEK |
| Fenêtre modulée PAR SCANLINE (WIN0H/V en HBlank DMA) | ⛔ | scanline_effect.ts:96-116 | **Pokénav glow, Flash grotte, rideaux combat** | `_applyRegFromValue` ne gère que 0x52 + 0x10-0x1E → WIN0H(0x40) **mal-routé vers bg(3).hofs** |
| Blend mode 0 (off) | ✅ | compositor.ts:322 | | |
| Blend mode 1 (alpha) + clamp EVA/EVB≤16 | ✅ | compositor.ts:351-360 | | `Math.min(alpha,16)` |
| Blend mode 2 (brighten / BLDY) | 🟡 | compositor.ts:339-344 | fades, glow | **BLDY non clampé à 16** (runtime:800 `&0x1F`) |
| Blend mode 3 (darken / BLDY) | 🟡 | compositor.ts:345-350 | fades | idem clamp manquant (sauvé par Uint8ClampedArray) |
| OBJ semi-transparent force target1 | ✅ | compositor.ts:314-316,329-337 | party summary fade | encode `a===128` |
| Targets 1/2 (masques, dont BD backdrop) | ✅ | compositor.ts:323-338 ; runtime:901-912 | | |
| Scanline effect : BGnHOFS/VOFS par ligne | ✅ | scanline_effect.ts:108-116,192-203 | intro combat, vagues eau/lave | HBlank cb réel |
| Scanline effect : BLDALPHA par ligne | ✅ | scanline_effect.ts:100-107 | Surf/Muddy Water | |
| Scanline effect : autres regs (WIN0H, BLDY, affine) | ⛔ | scanline_effect.ts:96-116 | Pokénav, Flash | non gérés → rustines |
| Forced blank (DISPCNT bit7) | ⛔ | runtime:837-861 (bit7 non lu ; const:130) | rare (grep décomp = 3) | écran devrait être blanc pendant inits |
| RGB15→RGBA888 (×8) | 🟡 | types.ts:29-31 | partout | approx simple, pas d'expansion `(x<<3)\|(x>>2)` GBATEK |
| Palette : writes immédiats (pas de gate VBlank) | 🟡 | palette.ts:16-26 | partout | adaptation assumée (Tasks 1×/frame) |
| Backdrop = BG palette[0] | ✅ | compositor.ts:114,252-255 ; palette.ts:83-85 | partout | |

---

## 🚨 MANQUES CRITIQUES (priorisés par atteignabilité solo)

1. **Effets scanline hors BGnH/VOFS+BLDALPHA — surtout WIN0H/WIN0V** (`scanline_effect.ts:96-116`).
   `_applyRegFromValue` ne connaît que `0x52` (BLDALPHA) et `0x10-0x1E` (BGnH/VOFS). Un
   `dmaDest=REG_WIN0H (0x40)` tombe dans la branche BG-offset : `off=0x30 → bgIndex=3, hofs`
   → **corruption silencieuse de `bg(3).config.hofs`**. Atteignable : **Pokénav menu principal**
   (glow curseur, `pokenav_menu_handler_gfx.c` `sPokenavMainMenuScanlineEffectParams` dmaDest=WIN0H),
   **Flash grotte** (`field_screen_effect.c SetFlashScanlineEffectWindowBoundaries`), rideaux/
   fondus `battle_intro`/`battle_transition`. Fix : router 0x40/0x44 vers `gba.windows.win0.*`
   + faire relire WIN0 par le compositor par-scanline (il calcule déjà `yInWin0` par ligne,
   compositor.ts:237-246 — il suffit que les bornes varient).

2. **`sprite.mosaic → oam.mosaic` non synchronisé** (`sprite.ts:1898-1924` : `syncSpritesToOam`
   sync x/y/flip/affineParamIndex/objMode/subpriority/affineMode mais **PAS mosaic**). Le
   compositor SAIT mosaïquer par sprite (compositor.ts:459-465) mais le champ n'arrive jamais
   sauf écriture directe (PC release, `pokemon_storage_system.ts:2265`). Atteignable :
   **évolution** (le mon mosaïque via bit template OAM) → probablement inerte. Fix 1 ligne.

3. **BG mosaic VERTICAL absent** (`compositor.ts:209-210`, skip explicite) + **`BGCNT` bit6
   ignoré** (`applyBgCnt` runtime:878-886). Atteignable : **transitions Mugshot/mosaïque**
   (`battle_transition.ts:788` pose `cfg.mosaic` en direct → H marche, V non) et
   `battle_anim_effects_3.ts:3920`. Le rendu de ces transitions est donc partiel (pixelisation
   H sans V).

4. **Forced blank (DISPCNT bit7) ignoré** (`applyDispCnt` runtime:837-861). Faible atteignabilité
   (3 sites décomp) mais trivial : pendant un forced-blank d'init, on affiche le contenu stale
   BG/palette au lieu du blanc → flashs possibles. Fix : si bit7, remplir la frame en blanc.

5. **Clamp BLDY≤16 manquant** (`compositor.ts:339-350`, brightness pris `&0x1F`) + **expansion
   RGB15 approx** (`types.ts:29-31`, `×8` au lieu de `(v<<3)|(v>>2)`). Divergences chromatiques
   fines, partout ; impact faible (BLDY sauvé par le clamp du buffer, couleurs très légèrement
   plus sombres au max). À corriger pour un 1:1 pixel-exact.

---

## RUSTINES À PURGER (chemins spéciaux nommés par écran)

- **`harness/gba/flash-mask.ts` (fichier entier)** — masque circulaire noir post-process pour la
  pénombre de grotte, **au lieu** du WIN0 scanline 1:1 (`field_screen_effect.c`). Auto-gaté par
  **nom de CB2** (`flash-mask.ts:42-44` : `cb2name.startsWith('MainCB2_Overworld')`) = rustine
  écran. En-tête (l.1-14) l'admet : « sera remplacé par le vrai chemin 1:1 quand le compositeur
  supportera le WIN0 scanline ». ⇒ tombe avec le manque critique #1.
- **Glow curseur Pokénav en fenêtre STATIQUE** (`src/pokenav_menu_handler_gfx.ts:1544-1553`,
  `SetMenuOptionGlow`) — le décomp module `REG_WIN0H` par-ligne (box biseautée) ; le port pose
  une WIN0 fixe car « le renderer ne réplique pas la DMA HBlank par-ligne ». `REG_WIN0H` est
  d'ailleurs un `__wireTodo` stub (l.59). ⇒ même racine que #1.
- **`applyBgCnt` : skip si `value===0`** (runtime:873-877) — préserve la config au lieu de
  reset. Documenté (fix naming screen) mais c'est un écart au « write register » 1:1 ; à revoir
  quand la séparation registre-HW / `sGpuBgConfigs` sera modélisée.

> Note : le sync subsprite `syncSubspriteOam` (`decomp-globals.ts:2019-2048`) n'est PAS une
> rustine mais est **incomplet** vs `AddSubspritesToOamBuffer` (sprite.c:1746 `destOam[i]=*oam`) :
> il ne recopie pas `affineMode`, `affineParamIndex`, `shape`, `size` sur les OAM enfants. Sans
> effet sur les subsprites actuels (object-events/healthbars = non-affine), mais **casserait tout
> subsprite AFFINE** passant par ce chemin. À compléter avant d'y router un sprite affine.

---

## DIAGNOSTIC ZOOM POKÉNAV

**Le moteur `renderOamSpriteAffine` (compositor.ts:527-613) est CORRECT — ce n'est PAS lui.**
Vérifié contre GBATEK : bbox = 2× en double (l.538-539), échantillonnage `relX=dx-bboxW/2`,
`relY=localBboxY-bboxH/2` (l.561,567), `texX/Y = (matrice·rel)>>8 + demi-texture` (l.571-572).
C'est exactement l'algo affine-OBJ hardware, valable rectangulaire (32×16 : cxTex=16, cyTex=8).

**Structure réelle** (`pokenav_menu_handler_gfx.ts:1005-1007,1211-1224`) : chaque option = **4
sprites INDÉPENDANTS** (pas des subsprites d'`AddSubspritesToOamBuffer`), créés via `CreateSprite`
puis `x2=32*j`, chacun passé en `affineMode=ST_OAM_AFFINE_DOUBLE` + `InitSpriteAffineAnim(s)` →
**chaque pièce alloue sa PROPRE matrice** (`matrixNum` distinct), synchronisée `sprite.matrixNum →
oam.affineParamIndex` (sprite.ts:1914). L'anim de zoom est identique aux 4 (`sAffineAnim_MenuOption_Zoom`,
l.438-444) et `ObjAffineSet→SetOamMatrix(sprite.matrixNum,…)` écrit slot par slot
(sprite-engine-impl.ts:146-150).

**Raisonnement discriminant** : les 4 pièces partagent matrice(valeurs)+taille+Y identiques et ne
diffèrent que par x/tileId/**affineParamIndex** → `renderOamSpriteAffine` produit des formes
IDENTIQUES par construction. Un résultat « 1re nette / 3 autres en bandes fines » est donc
**impossible depuis le moteur seul si les matrices sont vraiment identiques** : il exige que les
pièces 1-3 lisent un **slot de matrice différent et FAUX** (pa/pd trop grand → `texX` sort de
`[0,wPx)` en 1-2 colonnes = bande fine). Racine = **amont** : l'allocation/écriture de matrice par
pièce ne peuplait qu'un slot correct (historiquement `InitSpriteAffineAnim` stub — cf. le fix
mémoire « InitSpriteAffineAnim REEL »), les 3 autres pointant sur identité/stale/slot voisin.
**Aggravant moteur à corriger** : le fallback silencieux `affineParams[idx] ?? {pa:256,pb:0,pc:0,pd:256}`
(compositor.ts:550) **masque** un slot manquant au lieu de HURLER (viole Règle 3) — il devrait
`console.error` sur `affineParamIndex` non alloué pour rendre ce bug visible immédiatement.
