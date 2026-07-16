# Fix Lot A3 — scanline / PPU (source : ppu-compositor.md + misc-engine.md §A)

Exécuté sur `Opus-v2`. `npx tsc --noEmit` = **0** après chaque édit. Aucun serveur/jeu/commit.
Décomp : `D:/Projet 1/decomps/pokeemeraude`. Contrainte respectée : **aucune édition** de
`src/palette.ts`, `harness/runtime/decomp-runtime.ts`, `src/window.ts` (édités en // par d'autres
agents) — les fixes qui les exigeaient sont **documentés** (Fix 5).

Fichiers modifiés :
`harness/gba/types.ts`, `harness/gba/compositor.ts`, `harness/gba/gba.ts`,
`src/scanline_effect.ts`, `src/sprite.ts`, `src/pokemon_storage_system.ts`,
`src/pokenav_menu_handler_gfx.ts`.

---

## Fix 1 — Routage scanline → TOUS les registres via SetGpuReg ✅
**`src/scanline_effect.ts:108` `_applyRegFromValue`** (réécrit).

- **Avant** : ne gérait que `0x52` (BLDALPHA) + `0x10..0x1E` (BGnH/VOFS). Tout autre `dmaDest`
  (ex. `REG_WIN0H=0x40`) tombait dans la branche BG-offset (`off=0x30 → bg(3).hofs`) =
  **corruption silencieuse**.
- **Après** : `rt()?.SetGpuReg?.(dmaDest, value)` — route par le **même switch** que
  `SetGpuReg` (decomp-runtime.ts:782), donc 1:1 pour WIN0H/WIN1H (0x40/0x42), WIN0V/WIN1V
  (0x44/0x46), WININ/WINOUT (0x48/0x4A), BLDCNT/BLDALPHA/BLDY (0x50/0x52/0x54), BG2/3 affine
  PA-PD + ref X/Y (0x20-0x3E). Citation : `include/gba/io_reg.h:15-52`.
- **Non-régression prouvée** (tous les consommateurs scanline du repo) :
  - **BG offsets** (battle_intro `battle_main.ts:1369`, vagues eau/lave, battle_anim
    dark/dragon/effects_2/effects_3/ground/psychic) : `SetGpuReg(BGnHOFS)` masque `& 0x1FF`.
    Le compositor réduit `((x+hofs) % screenWPx + screenWPx) % screenWPx` (bg-layer.ts:73,
    screenWPx∈{256,512}). `0xFFEC ≡ 0x1EC (mod 256 et mod 512)` → `vx` **identique** à l'ancien
    `& 0xFFFF`. Airtight (65024 = 254·256 = 127·512).
  - **BLDALPHA 0x52** (Surf/Muddy Water `battle_anim_water.ts:1397`) : `SetGpuReg(0x52)` =
    `applyBldAlpha` (`alpha1=v&0x1F; alpha2=(v>>8)&0x1F`) = **strictement identique** à l'ancien
    cas spécial 0x52.
  - **WIN0H 0x40** (Pokénav glow) : désormais routé correctement (cf. Fix 2).

## Fix 2 — Purge des 2 rustines
### 2a — Glow Pokénav : chemin scanline 1:1 restauré ✅
**`src/pokenav_menu_handler_gfx.ts`**. Décomp `pokenav_menu_handler_gfx.c:358-1375`.
Le glow anime **REG_WIN0H par scanline** (box biseautable) : `sPokenavMainMenuScanlineEffectParams`
`dmaDest=&REG_WIN0H`, buffers remplis par `SetMenuOptionGlow`.

- **`:59`** `REG_WIN0H = REG_OFFSET_WIN0H` (0x40) — était `__wireTodo('REG_WIN0H')` (stub → le
  scanline pointait sur un `dmaDest` NaN → no-op silencieux).
- **`:490`** `dmaControl: SCANLINE_EFFECT_DMACNT_16BIT` — le littéral décomp
  `((DMA_ENABLE|DMA_START_HBLANK|DMA_REPEAT|DMA_DEST_RELOAD)<<16)|1` est un transfert 16-bit ;
  le port dispatche sur le **marqueur** HW-emu (scanline_effect.ts:39), et le littéral brut
  `≠ 0x0016` tombait à tort dans la branche 32-bit (WIN0H/WIN1H entrelacés faux).
- **`SetMenuOptionGlow`** (`:1544`) : remplissage RÉEL des buffers
  `gScanlineEffectRegBuffers[0/1].fill(0,0,DISPLAY_HEIGHT)` + `.fill(RGB(16,23,28), r4, r4+0x10)`
  (1:1 `CpuFill16(0,buf,DISPLAY_HEIGHT*2)` + `CpuFill16(RGB,&buf[r4],0x20)`, 0x20 octets = 16
  entrées u16). `.fill()` direct car `gScanlineEffectRegBuffers` = array EWRAM émulé (le
  `CpuFill16` address-based du port ne le cible pas — même convention que
  `ScanlineEffect_Clear`/`GenerateWave`). Les anciens `CpuFill16(…, buffer)` étaient des **no-op**
  (mauvais overload) + **fenêtre STATIQUE** `SetGpuReg(WIN0H/WIN0V)` **retirée**.
- Résultat : WIN0H par-scanline → lignes `[r4,r4+16)` → `0x72F0` (x1=114, x2=240 = zone labels),
  ailleurs vide ; WIN0V plein écran (setup inchangé). Box glow `[114,240)×[r4,r4+16)`, blend
  LIGHTEN-OBJ gaté par WININ/WINOUT (inchangés) → identique au décomp ET à l'ancien raccourci.
- `SetupPokenavMenuScanlineEffects`/`VBlankCB_PokenavMainMenu`/`DestroyMenuOptionGlowTask` déjà
  câblés (SetParams + InitHBlankDmaTransfer + Stop) — **inchangés**.

### 2b — flash-mask.ts : **LAISSÉ** (documenté) ⚠️
**PAS supprimé.** Le chemin 1:1 (`field_screen_effect.c:766-960` :
`SetFlashScanlineEffectWindowBoundaries`, `UpdateFlashLevelEffect`, `sFlashEffectParams` dmaDest
`&REG_WIN0H`, machinerie de task) **n'est PAS porté** : `src/field_screen_effect.ts` est une
**amorce** (seule `sFlashLevelToRadius` portée, l.4). Fix 1 **débloque** ce port (WIN0H/V scanline
route maintenant), mais transcrire les ~200 lignes de la pénombre = chantier séparé (hors Lot A3).
Tant qu'il n'existe pas, `flash-mask.ts` reste le seul rendu de la grotte → conservé.

## Fix 3 — Mosaic BG vertical ✅
**`harness/gba/compositor.ts:~207`** (skip explicite supprimé). Scanline source =
`y - (y % (mosaic.bgV + 1))` quand `bg.config.mosaic && mosaic.bgV>0`, passée à
`renderBgScanline`/`renderBgAffineScanline`. 1:1 GBATEK REG_MOSAIC bits 4-7 (bloc de bgV+1 lignes
répète sa ligne du haut). Convention `+1` cohérente avec l'OBJ (renderOamSpriteNormal:466) et
l'horizontal (applyMosaicHorizontal blockSize=factor+1).

## Fix 4 — sprite.mosaic → oam.mosaic synchronisé ✅
- **`src/sprite.ts:~1916` `syncSpritesToOam`** : `oam.mosaic = (sprite as {mosaic?}).mosaic ?? false`.
  1:1 `BuildOamBuffer` (copie `sprite->oam` en entier, mosaic:1 inclus). Cast optionnel = même
  motif que `animHFlip`/`animVFlip` déjà dans la fonction (le champ `mosaic` n'est pas déclaré sur
  `DecompSprite` — decomp-runtime.ts off-limits ; voir Non-faits).
- **`src/pokemon_storage_system.ts:2265/2273/2281`** : migré des écritures OAM directes vers
  `(spr as {mosaic?}).mosaic` (1:1 `sprite->oam.mosaic = TRUE/FALSE`, PSS.c:3901/3911/3922).
  **Obligatoire** : sinon la nouvelle sync (`oam.mosaic = sprite.mosaic`) **écraserait** l'écriture
  directe chaque frame (`_spr` renvoie le vrai `gSprites[]`, donc synchronisé).
- Compositor **teste déjà le bit PAR SPRITE** (renderOamSpriteNormal:465-466 `sprite.mosaic ?
  _objMos… : 0`), pas le reg global seul — **vérifié, RAS**.

## Fix 5 — Forced blank (DISPCNT bit 7) : moitié rendu livrée, TRIGGER documenté ⚠️
- **`harness/gba/gba.ts`** : champ `forcedBlank=false` + `tick()` remplit `frameBuffer.fill(255)`
  (blanc RGBA) au lieu de compositer quand `forcedBlank` (1:1 GBATEK "Forced Blank → screen white").
  Reset dans `reset()`.
- **NON câblé** (contrainte) : le trigger vit dans `applyDispCnt` (**decomp-runtime.ts**, édité en //).
  Ligne exacte à ajouter (l.~850, à côté de `objEnabled`) :
  `this.gba.forcedBlank = !!(value & DISPCNT_FORCED_BLANK);` (`DISPCNT_FORCED_BLANK=0x80` déjà
  exporté, decomp-runtime.ts:131). Tant qu'absent, `forcedBlank` reste false → `tick()` inchangé
  (0 régression). Atteignabilité faible (3 sites décomp).

## Fix 6 — Fallback matrice identité : HURLE ✅
**`harness/gba/compositor.ts:~556` `renderOamSpriteAffine`** : le `?? {identité}` silencieux
(masquait le bug zoom Pokénav) → `console.error` **une fois par slot / par frame** (Set dédup
clear en tête de `composeFrame`). **Rendu inchangé** (fallback identité conservé). Se déclenche
si `affineParamIndex ≥ 32` (slot hors des 32 alloués). Le chemin WINOBJ affine (:669) garde son
`?? {identité}` (masque only, hors périmètre 550).

## Fix 7 — Expansion RGB15 exacte + clamp BLDY ✅
- **`harness/gba/types.ts:29` `rgb15ToRgba8`** : `×8` → `(x<<3)|(x>>2)` par canal. Formule des
  émulateurs de référence (mGBA `mColorFrom555`, higan/ares ; GBATEK réplication de bits). x=31→255
  (blanc vrai vs 248). Central : `harness/gba/palette.ts` route TOUT par `rgb15ToRgba8` (pas d'autre
  `×8`) → propagé partout au prochain recompute de palette.
- **`harness/gba/compositor.ts:~347/353`** (brightness inc/dec) : `blend.brightness/16` →
  `Math.min(blend.brightness,16)/16`. 1:1 GBATEK EVY 0..16 (17..31 ≡ 16). Le runtime écrit
  `value & 0x1F` (0..31) — clampé côté compositor (decomp-runtime.ts off-limits). Cohérent avec
  `Math.min(alpha,16)` déjà présent pour l'alpha blend.

---

## Non-faits (+ raison)
- **Fix 5 trigger** : `applyDispCnt` = decomp-runtime.ts (off-limits). 1 ligne documentée ci-dessus.
- **Champ `mosaic` sur `DecompSprite`** (Fix 4) : évité via cast (decomp-runtime.ts off-limits).
  Version propre = ajouter `mosaic?: boolean` à l'interface DecompSprite + init dans CreateSprite
  depuis `template.oam.mosaic` (cohérent avec `objMode`, actuellement AUSSI non propagé par
  CreateSprite → laissé tel quel).
- **flash-mask.ts** (Fix 2b) : chemin 1:1 non porté (field_screen_effect.ts amorce). Laissé +
  documenté. Fix 1 le débloque pour un chantier futur.
- **BG affine ref-reload par scanline (Mode7 roulette/cablecar)** : hors périmètre ; Fix 1 le rend
  routable (BG2X/Y via SetGpuReg) mais aucun caller porté.

## Écrans à re-tester EN JEU (non testables côté Claude — user présent)
1. **Glow Pokénav menu principal** (⚠️ PRIORITÉ — rustine remplacée, screen validé) : ouvrir Pokénav,
   naviguer les options → l'option sélectionnée doit pulser (glow) ligne par ligne, box `[114,240)`,
   PAS de clignotement des autres OBJ. Vérifier menu MC + toutes apps.
2. **Zoom d'option Pokénav** (Fix 6 hurler) : ne doit PAS spammer la console ; si `console.error
   [compositor] slot … NON alloué` apparaît → un matrixNum est hors [0,31] (bug amont à traquer).
3. **Battle intro** (cisaillement BG scanline) + **Surf/Muddy Water** (alpha par bande) : inchangés
   attendus (Fix 1 prouvé équivalent) — régression check.
4. **Minimize / évolution PC** (Fix 4) : release PC → mon mosaïque en sortie (StartDisplayMonMosaic).
5. **Couleurs générales** (Fix 7) : blancs plus francs (255 vs 248) ; fades LIGHTEN/DARKEN au max
   (BLDY≥16) ne doivent plus sur-éclaircir.
6. **Flash grotte** (Fix 2b) : INCHANGÉ (flash-mask.ts conservé) — vérifier non-régression.
