# Audit Dedup + Simplification

> Audit Sonnet session 81. Le user veut : "Plus simple pour toi pour modifier, plus simple pour les gens pour fork".

## 🟢 High value (= cleanup visible, blockers fork ease)

### 1. `PLTT_SIZE_4BPP` / `PLTT_SIZE_8BPP` doublé
- `decomp-globals.ts:83-85` : `0x20` / `0x200` (bytes)
- `decomp-helpers.ts:188-189` : `32` / `512` (= same value, different notation)
- **Fix** : consolider dans `decomp-helpers`, re-export depuis `decomp-globals`.

### 2. `GET_TRUE_SPRITE_INDEX` doublé
- `decomp-helpers.ts:208`
- `decomp-globals.ts:860`
- Identical. **Fix** : delete celui dans `decomp-globals`, re-export.

### 3. Affine mode parse copié 2× dans même fonction
- `decomp-runtime.ts:1265-1266` (CreateSpriteAtOam call)
- `decomp-runtime.ts:1288-1289` (if (sprite) block, 4 lignes plus bas)
- Same ternary copy-pasted. **Fix** : `function parseAffineMode(s: string | undefined): 0 | 1 | 3`.

### 4. `_updateBg2Ref` / `_updateBg3Ref` identiques
- `decomp-runtime.ts:362-388`
- Diffèrent uniquement par bg index + `_bgN*` fields. **Fix** : `private _updateBgRef(bgIdx: 2 | 3): void`. Cuts ~15 lignes.

### 5. Stale `console.log` dans `CreateTask`
- `decomp-runtime.ts:1057` : `console.log('[CreateTask] taskId=', taskId, ...)` fires every task creation, pas behind `RT_DEBUG`.
- **Fix** : wrap `if (RT_DEBUG)` ou delete.

### 6. Locales lambdas re-implémentent constants exportées
- `decomp-globals.ts:469-472` dans `SetIntroPart2BgCnt` : `BG_PRI`, `BG_CHARBASE`, `BG_SCREENBASE` locales identiques aux exports `BGCNT_PRIORITY`, `BGCNT_CHARBASE`, `BGCNT_SCREENBASE` déjà importés.
- **Fix** : delete les 4 locales.

## 🟡 Medium value (= nice-to-have)

### 7. `LoadCompressedSpriteSheet*` variants share OBJ VRAM logic
- `decomp-runtime.ts:681-707` : 3 méthodes faisant
  ```ts
  const remainingSpace = this.gba.objVram.length - byteOffset;
  const copySize = Math.min(png.charData.length, remainingSpace);
  if (copySize > 0) this.gba.objVram.set(png.charData.subarray(0, copySize), byteOffset);
  ```
- **Fix** : private `_writeToObjVram(charData: Uint8Array, byteOffset: number): number`.

### 8. Palette buffer sync loop copié
- `decomp-globals.ts:221-224` (LoadPalette)
- `decomp-globals.ts:1059-1062` (LoadSpritePalette)
- Indirect via `LoadPaletteObj` aussi.
- **Fix** : runtime helper `syncPaletteBuffers(flatIdx, u16, count)`.

### 9. `objMode` parse inline (= aussi à extract avec `parseAffineMode`)
- `decomp-runtime.ts:1283-1285`
- Pas encore répété mais le sera. **Fix** : `function parseObjMode(s: string | undefined): 0 | 1 | 2`.

### 10. `LoadPaletteBg/ObjFromFile` API
- `decomp-runtime.ts:719-730` : 1-line wrappers. Could unify as `LoadPaletteFromFile(url, flatIdx, isObj)`. (= keep si lisibilité préférée)

## 🔵 Low value (= micro polish)

### 11. Magic numbers raw reg addresses dans `SetIntroPart2BgCnt`
- `decomp-globals.ts:474-480` : utilise `0x00E`, `0x00C`, `0x00A`, `0x000` au lieu de `REG_OFFSET_BG3CNT` etc.

### 12. Drift risk `BG_SCREEN_SIZE`
- `decomp-globals.ts:79` : `0x800`
- `decomp-data/auto/include/gba/defines-data.ts:47` : `2048` (= same value, different file)
- **Fix** : note matching value dans `decomp-globals` pour prevent drift.

### 13. Dead TODO scaffolding
- `decomp-globals.ts:324` : `// TODO LoadCompressedSpriteSheet(sSpriteSheet_TreesSmall)` dans `LoadIntroPart2Graphics`. Scene 2 trees jamais loaded.
- `decomp-globals.ts:838-855` : `LoadCompressedSpriteSheetUsingHeap` / `LoadCompressedSpritePaletteUsingHeap` existent juste pour prevent crashes. Could collapse en 1 no-op `function _unimplementedHeapLoad(data: unknown): void { void data; }`.
