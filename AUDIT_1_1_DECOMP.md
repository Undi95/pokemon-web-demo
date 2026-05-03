# Audit 1:1 Décomp — Bugs subtils

> Audit Opus session 81 (post intro/title screen 1:1). Compare l'impl TS vs `D:/Projet 1/decomps/pokeemeraude`.

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

### 7. `BlendPalette` rounding mismatch
**File** : `decomp-runtime.ts:841-843`
**Bug** : `(x + tx*w + 8) >> 4`. Décomp `src/util.c:275` = `r + ((tr - r) * coeff) >> 4` (truncation, no +8).
**Impact** : off-by-one shifts edge cases (= très dark/light pixels low brightness).

### 8. Pas de `gMain.newAndRepeatedKeys` / key repeat
**File** : `decomp-runtime.ts` (gMain struct)
**Bug** : pas implémenté. Décomp `src/main.c:248-268` implémente auto-repeat après `gKeyRepeatStartDelay` puis `gKeyRepeatContinueDelay`.
**Impact** : futurs menus relying on hold-to-scroll won't repeat.

### 9. `BG_CHAR_ADDR` / `BG_SCREEN_ADDR` semantics
**File** : `decomp-runtime.ts:175,177`
**Bug** : retournent `n*0x4000` / `n*0x800` (= relative offsets). Décomp `gba/defines.h:45-46` = `BG_VRAM + n*…` (= 0x06000000 base absolute).
**Impact** : mixed-paradigm internally; callers happen to mod-wrap correctly. Risk if math expression expects absolute address.

### 10. Pas de `gPlttBufferTransferPending` / `bufferTransferDisabled`
**File** : `gba/palette.ts` `PaletteBuffer.set()`
**Bug** : écrit faded buffer + simulated palette mais pas gated sur `gPlttBufferTransferPending`.
**Impact** : writes pendant HBlank-disabled periods s'appliquent immediately au lieu de next VBlank.

### 11. `gba.objVram = 32 KB` (note future)
Match `OBJ_VRAM0_SIZE` pour text/affine modes. Modes 3-5 (bitmap, unused Emerald) need OBJ_VRAM1.

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
