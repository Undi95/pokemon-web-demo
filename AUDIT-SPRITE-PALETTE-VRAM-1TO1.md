# AUDIT 1:1 STRICT — Sprite / Palette / VRAM Banks

Comparaison **ligne par ligne** décomp Pokemon Emerald vs notre runtime
TypeScript. Source de vérité : `D:/Projet 1/decomps/pokeemeraude/`.

---

## A. VRAM Banks (= `src/Gba/lcd_io.h` + `bg.c`)

**Décomp** :
- VRAM 96KB unifié `0x06000000-0x06017FFF` (= `BG_VRAM` + `OBJ_VRAM` adjacents)
- `BG_VRAM` = 64KB `0x06000000-0x0600FFFF` partagé par BG0-3
- `OBJ_VRAM` = 32KB `0x06010000-0x06017FFF` pour sprite tiles
- `BG_CHAR_ADDR(n)` = `BG_VRAM + n × 0x4000` (= 16KB par char base, n=0..3)
- `BG_SCREEN_ADDR(n)` = `BG_VRAM + n × 0x800` (= 2KB par screen base, n=0..31)
- BGs partagent char bases (= un BG avec charBase=0 lit les mêmes tiles qu'un autre BG avec charBase=0)

**Runtime** (`gba/gba.ts:67-78`) :
```ts
readonly vram = new Uint8Array(0x18000);          // 96KB unifié ✓
readonly oam: OamEntry[] = Array.from({ length: 128 }, ...);
// objVram via bg(n).vram view dans this.vram à charBaseIndex * 0x4000
```

**Verdict** : ✓ **1:1 hardware**. Notre `gba.vram` = 96KB unifié, `bg(n).vram`
= view Uint8Array à `charBaseIndex * 0x4000`, `bg(n).tilemap` = view Uint16Array
à `mapBaseIndex * 0x800`. Comportement de partage de char base = identique
décomp.

**Aucun refactor nécessaire pour VRAM banks.**

---

## B. Palette buffers (`src/palette.c:61-67`)

**Décomp** :
```c
ALIGNED(4) EWRAM_DATA u16 gPlttBufferUnfaded[PLTT_BUFFER_SIZE] = {0};  // 512 u16
ALIGNED(4) EWRAM_DATA u16 gPlttBufferFaded[PLTT_BUFFER_SIZE] = {0};    // 512 u16
EWRAM_DATA struct PaletteFadeControl gPaletteFade = {0};
EWRAM_DATA u8 ALIGNED(2) gPaletteDecompressionBuffer[PLTT_SIZE] = {0};
```
- `PLTT_BUFFER_SIZE = PLTT_SIZE / sizeof(u16) = 1024/2 = 512`
- BG palettes : entries 0-255 (= 16 banks × 16 colors)
- OBJ palettes : entries 256-511 (= 16 banks × 16 colors)
- `OBJ_PLTT_OFFSET = 0x100 (256)`
- `TransferPlttBuffer` : DMA `gPlttBufferFaded → PLTT register` (0x05000000) au VBlank

**Runtime** (`decomp-runtime.ts` + `gba/palette.ts:PaletteBanks`) :
- `r.gPlttBufferUnfaded`, `r.gPlttBufferFaded` (= `PaletteBuffer` wrappers)
- Get/set par index flat 0-511
- `TransferPlttBuffer` (decomp-globals.ts:1417) appelle `flushTo()` au VBlank

**Verdict** : ✓ **1:1 sémantique**. Notre `PaletteBuffer` est une abstraction
mais sa sémantique (= flat indexable 0-511, OBJ à 256+) est identique. Les
fonctions `LoadPalette / FillPalette / LoadCompressedPalette / Blend* / Tint*`
sont 1:1 portées dans `palette.ts` et `decomp-globals.ts`.

**Aucun refactor nécessaire pour palette buffers.**

---

## C. OAM staging buffer (`include/main.h:34`)

**Décomp** :
```c
struct Main {
    /*0x038*/ struct OamData oamBuffer[128];     // staging buffer
    ...
};
```
- `gMain.oamBuffer[128]` = 128 OamData entries (= 1024 bytes)
- `BuildOamBuffer` (sprite.c:325-337) compose les sprites visibles dans `gMain.oamBuffer`
- `LoadOam` (sprite.c:640-644) DMA `gMain.oamBuffer → OAM` register (0x07000000) au VBlank

**Runtime** (`gba/gba.ts:78`) :
```ts
readonly oam: OamEntry[] = Array.from({ length: 128 }, () => defaultOamEntry());
```
- Compositor lit `gba.oam[]` DIRECTEMENT chaque frame (= no staging buffer)
- `BuildOamBuffer`, `LoadOam` = no-op chez nous

**Divergence** : Pas de `oamBuffer` staging séparé chez nous. Le compositor
lit `gba.oam[]` direct (= 1 buffer au lieu de 2).

**Impact** : Pas de bug observable, sémantique équivalente (= équivalent VBlank
race-condition handling). Le décomp utilise un buffer staging pour éviter de
écrire l'OAM register pendant que le compositor lit ; chez nous c'est synchrone.

**Verdict** : 🟡 **Divergence non-critique**. Refactor pour ajouter `oamBuffer`
serait pur cosmétique, pas de bug user.

---

## D. OamEntry vs struct OamData (`gba/types.ts:129` vs `include/gba/types.h`)

**Décomp** (`include/gba/types.h:OamData`) — bit-packed u32×2 :
```c
struct OamData {
    /*0x00*/ u32 y:8;
    /*0x01*/ u32 affineMode:2;
             u32 objMode:2;
             u32 mosaic:1;
             u32 bpp:1;
             u32 shape:2;
    /*0x02*/ u32 x:9;
             u32 matrixNum:5;  // bits 3/4 = hFlip/vFlip si non-affine
             u32 size:2;
    /*0x04*/ u16 tileNum:10;
             u16 priority:2;
             u16 paletteNum:4;
    /*0x06*/ u16 affineParam;
};
```

**Runtime** (`gba/types.ts:129` `OamEntry`) :
```ts
// Décompacted struct (= sépare hFlip/vFlip de matrixNum)
{ visible, x, y, affineMode, objMode, mosaic, bpp, shape, size,
  matrixNum, flipH, flipV, tileId, priority, paletteBank, ... }
```

**Divergence** : Notre `OamEntry` décompacte les fields bit-packed. Le décomp
les laisse comme bits dans u32×2 (= GBA hardware packing).

**Impact** : OK car l'API est plus claire. La compositor n'a pas besoin de
unpack à chaque rendu.

**Verdict** : ✓ **Sémantique 1:1**, structure différente intentionnelle pour
clarté.

---

## E. Sprite tag system (`src/sprite.c:270-292`)

**Décomp** (EWRAM static) :
```c
static u16 sSpritePaletteTags[16];                  // 16 slots OBJ palette
static u16 sSpriteTileRangeTags[MAX_SPRITES];        // 64 slots tile ranges
static u16 sSpriteTileRanges[MAX_SPRITES * 2];       // 64 × (start, count)
EWRAM_DATA static u8 sSpriteTileAllocBitmap[128];    // 1024 bits (= 1024 tiles)
COMMON_DATA u8 gReservedSpritePaletteCount = 0;
EWRAM_DATA u16 gReservedSpriteTileCount = 0;
```

**Runtime** (`decomp-runtime.ts:531-545`) :
```ts
paletteTagToSlot = new Map<string, number>();         // 1:1 décomp sSpritePaletteTags
spriteSheetTagToTileStart = new Map<string, number>();// 1:1 décomp sSpriteTileRangeTags
spriteSheetTagToByteSize = new Map<string, number>(); // EXTRA non-décomp
freedSpriteTileRanges = Array<{offset, size}>[];      // hack reclaim
nextObjPalSlot = 0;                                   // EXTRA cursor non-décomp
nextSpriteSheetByteOffset = 0;                        // EXTRA cursor non-décomp
```

**Divergences MAJEURES** :

1. **`paletteTagToSlot: Map` vs `sSpritePaletteTags: u16[16]`** :
   - Décomp : `sSpritePaletteTags[i] = tag` (= index = slot, value = tag u16)
   - Runtime : `Map.set(tagStr, slot)` (= inversé)
   - Sémantique : équivalente pour AllocSpritePalette/IndexOfSpritePaletteTag
   - Impact : tag = `string` au lieu de `u16` (= notre tags sont 'PALTAG_CURSOR'
     etc. via string). 1:1 numérique perdu mais sémantique préservée.

2. **`spriteSheetTagToTileStart: Map` vs `sSpriteTileRangeTags + sSpriteTileRanges`** :
   - Décomp : 2 arrays parallèles indexés par slot
   - Runtime : 2 Maps tag→start + tag→size
   - Sémantique : équivalente

3. **`freedSpriteTileRanges + cursor` vs `sSpriteTileAllocBitmap[128]`** :
   - Décomp : bitmap 1024 bits (= 1 bit par tile sur les 1024 tiles OBJ VRAM)
   - Runtime : cursor monotone + queue de plages libérées
   - **NON équivalent algorithmiquement** :
     - Décomp `AllocSpriteTiles(N)` : scan bitmap pour N tiles contigus libres,
       n'importe où dans [reserved, 1024)
     - Runtime : avance cursor monotone, reclaim possibility limitée
   - **Impact** : fragmentation différente. Si décomp peut allouer 4 tiles
     entre 2 ranges occupés (= "trou"), notre runtime ne peut pas (= cursor
     monotone). MAIS notre code ne stress-test pas l'OBJ VRAM full → pas
     observable.

**Verdict E** : 🟠 **Divergence ALGORITHMIQUE pour tile allocator**. Pour
1:1 STRICT, refactor `AllocSpriteTiles` en bitmap-based.

---

## F. gSprites array (`src/sprite.c:280`)

**Décomp** :
```c
EWRAM_DATA struct Sprite gSprites[MAX_SPRITES + 1] = {0};  // 65 sprites
```
- Index direct : `gSprites[0]..gSprites[63]` + `gSprites[64]` (dummy "null")
- `CreateSprite` scan first `i where !gSprites[i].inUse` (= 1:1 sprite.c:540)
- Returns `i` = direct index

**Runtime** (`decomp-runtime.ts`) :
```ts
gSprites = new Map<number, DecompSprite>();
```
- `gSprites.get(id)` access via Map
- `CreateSpriteAtOam` retourne `spriteId` qui est utilisé comme key

**Divergence MAJEURE** :
- Décomp : index 0-64 dans array
- Runtime : key arbitraire dans Map

**Impact** : Les callers utilisent partout `rt.gSprites.get(id)`. Si refactor
à array, **TOUS les callers à migrer** (= ~80+ sites). API break massive.

**Verdict F** : 🔴 **Divergence STRUCTURELLE majeure**. Refactor 1:1 = gros
chantier (= toucher ~80 fichiers). Risque casse élevé.

---

## G. OAM matrix allocator (`src/sprite.c:277, 1427-1461`)

**Décomp** :
```c
COMMON_DATA u32 gOamMatrixAllocBitmap = 0;     // 32 bits = 32 matrix slots
// AllocOamMatrix : scan bits, return first free
```

**Runtime** (`decomp-runtime.ts`) :
```ts
private _matrixUsed = new Set<number>();        // 1:1 sémantique
```

**Divergence** : Set vs bitmap. Sémantique équivalente (= scan first-free,
return -1 si full).

**Verdict G** : ✓ **Sémantique 1:1**, structure différente cosmétique.

---

## H. Sprite ordering (`src/sprite.c:281-282, 361-467`)

**Décomp** :
```c
EWRAM_DATA static u16 sSpritePriorities[MAX_SPRITES];  // 64 u16
EWRAM_DATA static u8 sSpriteOrder[MAX_SPRITES];        // 64 u8
```
- `BuildSpritePriorities` (sprite.c:361) : `sSpritePriorities[i] = sprite.subpriority | (sprite.oam.priority << 8)`
- `SortSprites` (sprite.c:372-467) : insertion sort sur `sSpriteOrder[]` selon `sSpritePriorities[]` + sprite.oam.y

**Runtime** : NON PORTÉ.

**Impact** : Le compositor lit `gba.oam[]` direct dans l'ordre OAM index (=
le décomp utilise l'ordre `sSpriteOrder[]` pour copy à `gMain.oamBuffer`,
puis OAM[0] = first visible = front-most).

**Verdict H** : 🟡 **Manquant non-critique**. La priorité visuelle marche
chez nous parce qu'on utilise `oam.priority` direct. Le décomp utilise un
post-sort sur subpriority. Pour 1:1 STRICT, à porter.

---

## I. Sprite copy requests queue (`src/sprite.c:284-285, 785-822`)

**Décomp** :
```c
EWRAM_DATA static u8 sSpriteCopyRequestCount = 0;
EWRAM_DATA static struct SpriteCopyRequest sSpriteCopyRequests[MAX_SPRITES];
// RequestSpriteCopy(src, dest, size) queue
// ProcessSpriteCopyRequests() flush au VBlank
```

**Runtime** : NON PORTÉ. Notre `ProcessSpriteCopyRequests` est no-op
(decomp-globals.ts:1441) car les tile copies sont eager (= immédiatement
appliqués à objVram).

**Verdict I** : 🟡 **Manquant non-critique**. Notre approche eager fonctionne.
Pour 1:1 STRICT, port la queue.

---

## RÉCAP DIVERGENCES + ORDRE DE REFACTOR PROPOSÉ

| # | Section | Sévérité | Effort | Risque | Note |
|---|---------|----------|--------|--------|------|
| A | VRAM banks | ✓ 1:1 | - | - | OK |
| B | Palette buffers | ✓ 1:1 | - | - | OK |
| C | OAM staging | 🟡 | 1h | bas | non-critique |
| D | OamEntry decompact | ✓ 1:1 sémantique | - | - | OK |
| E | Tag system Maps→arrays | 🟠 | 4h | moyen | structurel |
| E' | Tile bitmap allocator | 🟠 | 3h | bas | structurel |
| F | gSprites Map→array | 🔴 | 8h+ | élevé | ~80 callers |
| G | OAM matrix Set→bitmap | ✓ 1:1 sémantique | - | - | OK |
| H | sSpriteOrder + SortSprites | 🟡 | 2h | bas | non-critique |
| I | sSpriteCopyRequests | 🟡 | 1h | bas | non-critique |

**Total estimé** : ~20h pour 1:1 STRICT TOTAL.

---

## ROOT CAUSE DES BUGS REVERTÉS (field-effect-* + starter)

Le refactor 1:1 a cassé parce que le **substrat actuel n'est pas vraiment 1:1**.
Spécifiquement :

- **`LoadSpriteSheet` runtime** alloue cursor monotone APRÈS gReservedSprite
  TileCount, MAIS ne respecte pas le concept de "fixed offset" décomp
  (= certaines sheets sont chargées à offset précis pour partage de tiles
  entre sprites).
- **field-effect-emotes** : ma concat 3 PNG en 1 sheet a inséré du padding
  qui ne matchait pas la convention décomp 4 tiles/emote.
- **starter** : `LoadSpritePalette` retournait slot ≠ hardcoded → les "?"
  placeholders qui partageaient le slot pokeball avaient la mauvaise palette.

**Conclusion** : Pour refactor 1:1 STRICT sans casser, il faut **D'ABORD**
porter le substrat (sections E, E', F, H, I) en mode 1:1 strict, ENSUITE
migrer les callers (field-effect-*, starter, etc.).

L'ordre actuel (= callers d'abord, substrat ensuite) crée des incohérences.

---

## PLAN PROPOSÉ — itération CONCRÈTE 1:1 STRICT

**Phase 1 — Substrat tag system 1:1** (4h, risque bas) :
- `sSpritePaletteTags[16] = u16 array` standalone dans sprite.ts
- `sSpriteTileRangeTags[64] + sSpriteTileRanges[128]` arrays
- API LoadSpritePalette/IndexOfSpritePaletteTag etc. lit/écrit dans les arrays
- `paletteTagToSlot/spriteSheetTagToTileStart Maps` deviennent des **views**
  dérivées des arrays (= compat layer)
- A/B test : preview chambre Brendan → palette PLAYER intacte

**Phase 2 — Substrat bitmap tile allocator 1:1** (3h, risque bas) :
- `sSpriteTileAllocBitmap[128]` Uint8Array dans sprite.ts
- `AllocSpriteTiles(N)` bitmap scan 1:1 sprite.c:702-753
- `LoadSpriteSheet` via AllocSpriteTiles
- `freedSpriteTileRanges/cursor` deviennent fallback path
- A/B test : ouvrir/fermer PC, bag, items icons

**Phase 3 — Re-essai field-effect-* refactor** (1h, risque bas avec substrat solide) :
- Le substrat bitmap permet alloc N tiles n'importe où après reserved
- LoadSpriteSheet pour chaque field-effect avec son tag
- A/B test : emotes (cri NPC), arrow (warp), grass, dust, shadow

**Phase 4 — Re-essai starter refactor** (1h, risque bas avec substrat solide) :
- LoadSpritePalette via tag system pour les 3 starters
- Propager slot retourné à tous les sites usage
- A/B test : new game → Birch speech → starter selection

**Phase 5 — gSprites array migration** (8h+, risque ÉLEVÉ, OPTIONNEL) :
- À ne tenter qu'avec A/B user présent
- Migration massive callers `Map.get(id)` → `array[id]`
- Peut être déféré indéfiniment si Map sémantique préservée

**Phase 6 — sSpriteOrder + sSpriteCopyRequests + OAM staging** (4h, OPTIONNEL) :
- Pure architecture 1:1, pas user-perçu

---

## ENGAGEMENT

Phases 1+2+3+4 ≈ **9h** pour résoudre la racine + recovery refactor. C'est
le scope minimum pour avoir un système Sprite/Palette/VRAM Banks **structurellement
1:1 sur les surfaces qui causent des bugs**.

Phases 5+6 = cosmétique architectural 1:1, défer.
