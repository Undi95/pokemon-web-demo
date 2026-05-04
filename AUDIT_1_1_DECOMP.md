# Audit 1:1 Décomp — Bugs subtils

> Audit Opus session 81 (post intro/title screen 1:1). Compare l'impl TS vs `D:/Projet 1/decomps/pokeemeraude`.
> **Statut session 81** : ✅ A1-A5 + critique OBJ_PLTT_ID + audio (m4aSongNumStart→PlaySE, FadeOutBGM impl, fade duration, SE_SELECT placeholder) + Phase C item #7 (BlendPalette +8). Restants pour future sessions : items 8-11 + menu polish.
> **Statut session 82** : ✅ Items 9-11 (BG_CHAR_ADDR/BG_SCREEN_ADDR absolute, gPlttBufferTransferPending scaffold + doc, objVram size doc). Restants : item 8 (key auto-repeat — déjà DONE en réalité) + menu polish.
>
> **Session 82 (option menu + 5 fixes systémiques)** :
> ✅ Option menu 1:1 décomp via auto file + post-transpile-patches.mjs (PATCH O1-O6).
> ✅ **5 fixes systémiques sur fondations** (= pattern reusable pour Birch / battle / etc.) :
>   1. PaletteBuffer.set ne propage plus à gba.palette → gPlttBufferFaded only.
>   2. TransferPlttBuffer hook au end of runOneFrame UNIQUEMENT si vblankCallback non-null (= 1:1 décomp gating, prévient flash CB2_Init).
>   3. SetVBlankCallback(NULL/VBlankCB) restore dans auto file (= mécanisme anti-flash décomp).
>   4. BeginNormalPaletteFade ne reset plus BLDCNT/BLDY hardware (= était kill du WIN0 darken).
>   5. ResetPaletteFade ne reset que internal fade state (= était kill du BLDY hardware).
> ✅ gba-text-window.ts foundation partagée (GetWindowFrameTilesPal/preloadTextWindowFrames) — supprime duplication option-menu-impl ↔ gba-menu-system.
> ✅ sTextColor_Headers = [10, 11, 12] (= 1:1 décomp DYNAMIC_COLOR positions, plus d'approximation hardcoded).
> ✅ Save persistence localStorage via Proxy gSaveBlock2Ptr.
> ✅ Lock canvas browser-native (tabIndex + document.activeElement).
>
> **Restants à 1:1 décomp pour next session** :
>   - `gba-menu-system.ts:InitMainMenu` est MANUELLEMENT écrit (= approximation). Devrait passer par auto file `CB2_InitMainMenu` 1:1 décomp avec post-transpile-patches.
>   - `option-menu-impl.ts:rightAlignX` = ~6px/char approx. Devrait utiliser glyphwidths réels via GetStringWidth.
>   - Birch speech CB2 callbacks (auto file) ont `/* noop SetVBlankCallback */` à patcher (même pattern O6).
>   - Audit complet du codebase pour voir s'il reste duplications/hacks/approximations.
>
> **Session 83 (audit complet 1:1 décomp + foundations unifiées)** : ✅ **ALL CLEAR**
> ✅ **Phase A** : Generic post-transpile-patches loop (= élimine duplication patch-par-fichier, traite TOUS les `*-callbacks-auto.ts`). 53/153 auto files patchés en 1 passe avec 3 patterns G1/G2/G3 (SetMainCallback2, SetVBlankCallback, VBlankCB no-op auto-inject). gba-menu-system.ts InitMainMenu cleanup hex magic → REG_OFFSET_*/DISPCNT_* + DmaFill16/32 + SetVBlankCallback(null) au début (= 1:1 décomp main_menu.c:558-615).
> ✅ **Phase B** : PaletteFade struct complète (= softwareFadeFinishing, deltaY, objPaletteToggle, hardwareFadeFinishing, shouldResetBlendRegisters, multipurpose1/2 ; constants NORMAL_FADE/FAST_FADE/HARDWARE_FADE) match `struct PaletteFadeControl` du décomp. UpdatePaletteFade signal softwareFadeFinishing 1 frame à la fin. ResetPaletteFade reset tous les fields. GetStringWidth + GetStringRightAlignXOffset 1:1 décomp src/text.c via vraies glyphWidths (= fini approximation 6px/char).
> ✅ **Phase C** : Split gba-menu-system.ts (580 lignes) → main-menu-impl.ts (470 lignes, scene-specific) + gba-menu-system.ts (200 lignes, helpers menu génériques). Pattern analogue option-menu-impl.ts. IsWirelessAdapterConnected() debug call ajouté dans HandleMainMenuInput pour 1:1 décomp pure.
> ✅ **Phase D-cleanup** : 8 items duplications cachées :
>    1. CycleSceneryPalette + LoadSpritePalette + LoadSpritePalettes : foundations contournées fix (= écrit gPlttBufferFaded seulement, plus de gba.palette direct).
>    2. Mystery Gift/Event/EReader scene transitions stubs (= 3× console.warn explicites au lieu de TODO).
>    3. ACTIONS_FALLBACK retiré de movement.ts (= 80 lignes hardcoded supprimées, source unique movement-actions.json décomp).
>    4. DmaClearLarge16/DmaClear32 stubs no-op locaux retirés de option-menu-impl.ts (= duplication cachée des vrais helpers decomp-globals.ts).
>    5. AddBirchSpeechObjects + 4× NewGameBirchSpeech_StartFade* déplacés decomp-globals → main-menu-impl (= consolidation thématique scene-Birch).
>    6. sBirch* templates documentation explicite "PHASE D PLACEHOLDERS" + valeurs sensées (= ScrollArrowParams full struct).
>    7. palette-fade.ts marked @deprecated (= Phaser legacy, migration plan documenté).
>    8. Sweep transversal TODO/FALLBACK/HACK/hardcoded : aucun item critique restant.
> ✅ **Sweep additionnel** : 4× console.log debug noisy retirés (CB2_MainMenu, CB2_InitMainMenu, InitMainMenu) via post-transpile-patches.mjs PATCH M2 + cleanup direct.
>
> **Architecture finale session 83** :
> - 0 erreur tsc, Vite build OK 13-14s
> - 10 commits ahead origin (= prêts pour push après Birch impl)
> - Foundations unifiées 1:1 décomp pure (= directive #1 respectée)
> - Pattern reusable pour future scenes : auto file callbacks + post-transpile-patches.mjs idempotent

## 🔴 Critiques (= bugs visibles probables)

### 1. `LoadPaletteObj` flat-idx mismatch
**File** : `src/engine/decomp-runtime.ts:714`
**Bug** : forwarde `256+slot×16` à `gba.palette.loadObjRange`, qui attend un idx OBJ-relatif (0-255). Hors-range → early return silent (palette.ts:65).
**Impact** : `LoadSpritePalettesFromTable` (decomp-runtime.ts:1188/1190) silent no-op → toutes les sprite palettes via cette path n'arrivent pas. Affecte intro Scene 2/3 + battle.
**Fix** : `loadObjRange(slot*16, ...)` au lieu de `loadObjRange(OBJ_PLTT_ID(slot), ...)` (= -256 inside).

### 2. `ConvertScaleParam` manquant (affine animations)
**File** : `src/engine/decomp-impls/sprite-engine-impl.ts:91-99`
**Bug** : utilise `xScale` directement comme matrix `pa`. Décomp `src/sprite.c:1316` fait `ConvertScaleParam = SAFE_DIV(0x10000, scale)` d'abord.
**Impact** : `AFFINEANIMCMD_FRAME(128, 128, ...)` devrait donner pa=512 (visual 0.5×), notre impl donne pa=128 (visual 2×). GameFreak letters/logo zoom inversed.
**Fix** : appliquer `0x10000 / scale` avant matrix calc.

### 3. Palette fade speed 2× trop lent + missing OBJ toggle
**File** : `src/engine/decomp-runtime.ts:846-890`
**Bug** : avance `y` par 1 par frame non-delay. Décomp `src/palette.c:472,480` avance par `deltaY` (default 2). Et alterne BG/OBJ chaque frame via `objPaletteToggle`.
**Impact** : tous les `BeginNormalPaletteFade` runs ~2× plus lent (copyright fade-in/out, scene transitions).
**Fix** : implementer `deltaY` + `objPaletteToggle`.

### 4. `WINOUT_WINOBJ_ALL` constant wrong
**File** : `src/engine/decomp-globals.ts:1228`
**Bug** : `0x1F00`. Décomp `io_reg.h:582` = `0x3F00` (BG_ALL=0xF00 | OBJ=0x1000 | CLR=0x2000).
**Impact** : blend special-effect pas activé dans WINOBJ region → title screen logo shine etc. mis-rendered.
**Fix** : `0x3F00`.

### 5. `BG_TILE_H_FLIP` / `BG_TILE_V_FLIP` non définis
**File** : `src/engine/gba-global-scope.ts` (= n'expose pas ces helpers)
**Bug** : décomp `gba/defines.h:48-49` `BG_TILE_H_FLIP(n) = 0x400+n`, `V_FLIP(n) = 0x800+n`. Utilisés par main_menu / Birch dialogue border drawing.
**Impact** : bottom row dialogue/menu borders unflipped → asymétrie visible.
**Fix** : exporter ces helpers + les exposer dans gba-global-scope.

## 🟡 Subtils (= future bugs potentiels)

### 6. `runTasks` pendant `MainCB2_EndIntro`
**File** : `decomp-runtime.ts:1444` `isMainCB2 = cbName.startsWith('MainCB2')`
**Bug** : match `MainCB2_EndIntro` mais décomp `intro.c:1054` ne fait que `UpdatePaletteFade`.
**Impact** : benign maintenant (pas de task résiduelle ce moment), mais peut masquer futurs bugs.

### 7. `BlendPalette` rounding mismatch ✅ FIXED session 81
**File** : `decomp-runtime.ts:_applyPaletteFadeStep`
**Bug** : `(x + tx*w + 8) >> 4`. Décomp `src/util.c:275` = `r + ((tr - r) * coeff) >> 4` (truncation, no +8).
**Impact** : off-by-one shifts edge cases.
**Fix** : refactor pour matcher exactement la formule décomp (= sans +8, sum after shift).

### 8. Pas de `gMain.newAndRepeatedKeys` / key repeat
**File** : `decomp-runtime.ts` (gMain struct)
**Bug** : pas implémenté. Décomp `src/main.c:248-268` implémente auto-repeat après `gKeyRepeatStartDelay` puis `gKeyRepeatContinueDelay`.
**Impact** : futurs menus relying on hold-to-scroll won't repeat.

### 9. `BG_CHAR_ADDR` / `BG_SCREEN_ADDR` semantics ✅ FIXED session 82
**File** : `decomp-runtime.ts:182-184`
**Bug** : retournaient `n*0x4000` / `n*0x800` (= relative offsets). Décomp `gba/defines.h:45-46` = `BG_VRAM + n*…` (= 0x06000000 base absolute).
**Impact** : mixed-paradigm internally; callers happen to mod-wrap correctly. Risk if math expression expects absolute address.
**Fix** : `BG_VRAM = 0x06000000` exporté + `BG_CHAR_ADDR(n) = BG_VRAM + n*0x4000` etc. Math via `% vram.byteLength` strip BG_VRAM (0x06000000 mod 0x18000 = 0). Comments + literal callsites mis à jour pour utiliser les macros.

### 10. Pas de `gPlttBufferTransferPending` / `bufferTransferDisabled` ✅ DOCUMENTED session 82
**File** : `gba/palette.ts` `PaletteBuffer.set()`, `decomp-globals.ts:TransferPlttBuffer`
**Bug** : écrit faded buffer + simulated palette mais pas gated sur `gPlttBufferTransferPending`.
**Impact** : writes pendant HBlank-disabled periods s'appliquent immediately au lieu de next VBlank.
**Fix scaffolding** : `PaletteFade.bufferTransferDisabled` field added (= matching struct C signature). `TransferPlttBuffer()` respecte le gate (return early si disabled). Architecture deviation documentée dans `palette.ts` header.
**Pas de fix complet** : require refactor palette pipeline (= LoadPalette doit écrire seulement gPlttBufferFaded, pas direct compositor). Impact pratique nul car Pokemon Emerald set ce flag pour effects HBlank qu'on simule pas. Marqué « low-prio low-impact ».

### 11. `gba.objVram = 32 KB` (note future) ✅ DOCUMENTED session 82
Match `OBJ_VRAM0_SIZE` pour text/affine modes (= modes 0-2, Pokemon Emerald). Modes 3-5 (bitmap, unused Emerald) seraient 16 KB (BG bitmap mange la moitié). Comment ajouté dans `gba.ts:80` pour clarifier que c'est correct pour Emerald, pas un bug.

## 🆕 Découverts session 81 (post-audit Opus)

### A. **OBJ_PLTT_ID** retournait `n*16` au lieu de `256+n*16` ✅ FIXED
Bug systémique sur 86 callsites. `LoadPalette(...OBJ_PLTT_ID(n))` écrivait dans
BG palette space (= invisible). Cf. `decomp-runtime.ts:166` post-fix.

### B. **m4aSongNumStart(SE_*)** transpileur bug ✅ FIXED
386 occurrences sur 52 fichiers auto. `PlaySE(SE_X)` du décomp était converti
en `m4aSongNumStart(SE_X)` → SE jouait sur slot BGM, écrasant la musique.
Fix : transpileur regex `m4aSongNumStart(SE_X)` → `PlaySE(SE_X)` + global sed.

### C. **FadeOutBGM** stub (= no fade title→menu) ✅ FIXED
Implémenté via `setMasterParameter('masterGain')` rampe 1:1 décomp m4a.c
(= 16 steps × speed frames). Aussi `FadeInBGM` en pendant.

### D. **SE_SELECT = 1 placeholder** dans gba-menu-system.ts ✅ FIXED
Plaçeholder oublié (= jouait `se_use_item` au lieu de `se_select`). Fix : 5.

### E. **Sprite.objMode** vs `oam[].objMode` divergence ✅ FIXED
Bug pattern : `SpriteCB_*` écrivait `rt.gba.oam[oamIndex].objMode = X`. Mais
syncSpritesToOam propage `sprite.objMode → oam.objMode` chaque frame, écrasant.
Fix appliqué sur SpriteCB_VersionBanner + StartPokemonLogoShine.

### F. **`runTasks` per CB2 type** ✅ FIXED (= refactor session 81)
Runtime appelait toujours runTasks(). Décomp : seuls les `MainCB2*` callbacks
le font. Fix : `cbName.startsWith('MainCB2')` dans runOneFrame.

### G. **MUS_TITLE auto-loop detection** ✅ FIXED
@tonejs/midi n'a pas de `.loop` property. Scan MIDI markers `FF 06 'loopStart'`
direct sur le buffer pour set `midi.loop` correctement.

## 🚧 Pending — Menu polish (à faire en future session)

Le main menu (= NOUVELLE PARTIE / OPTION) a des fenêtres avec bordures
incorrectes (= solid blue/grey rectangles au lieu de tiles ROM stylisées).
Investigation nécessaire :
- Extract `gWindowFrames` tiles depuis ROM (= 9 tiles × 32 bytes par frame style)
- Vérifier WININ/WINOUT pour highlight selectedItem
- Charset alignment du texte (= heart icon à la fin = char id mismatch)
- Cf. décomp `src/data/menu_message.h` + `src/dynamic_placeholder_text_util.c`

## ✅ Verified clean

- `OBJ_PLTT_ID` / `BG_PLTT_ID` (post-fix session 81)
- Button constants A/B/L/R/SELECT/START/DPAD
- `RGB(r,g,b)` packing
- WININ/WIN_RANGE/BLDALPHA_BLEND
- BLDCNT bit layout, BGCNT layout, DISPCNT modes
- `applyBldCnt`/`applyBldAlpha` parsing
- OAM size table
- VRAM 96KB / OAM 0x400 / PLTT 0x400 / BG_CHAR_SIZE 0x4000 / BG_SCREEN_SIZE 0x800
- Sprite/OAM `objMode` synced (post-fix session 81)
