# WINDOWS / BOXES REFERENCE — décomp pokeemeraude

> Audit exhaustif Agent Explore very thorough du 2026-04-25.
> Source : `D:\Projet 1\decomps\pokeemeraude\src\{menu,menu_specialized,script_menu,naming_screen,start_menu,option_menu,money,text_window}.c`.
> But : refacto SANS HARDCODE de tout le système box/dialogue/menu via un module `WindowRenderer` générique + 2 nouveaux extracteurs.

> **Contexte écran GBA = 240×160 px = 30×20 tiles de 8 px.**

---

## 1. Inventaire exhaustif des WindowTemplates (21 nommés)

### A. Dialogue & Message Boxes
| Nom | Tiles (l,t,w,h) | Pixels | Pal | Trigger | Source |
|---|---|---|---|---|---|
| `sStandardTextBox_WindowTemplates[0]` | 2,15,27,4 | 16,120,216,32 | 15 | `msgbox` standard | menu.c:84 |
| `sYesNo_WindowTemplates` | 21,9,5,4 | 168,72,40,32 | 15 | `yesnobox` + `MSGBOX_YESNO` | menu.c:98 |
| `sWindowTemplates_LinkBattleSave[0]` | 2,15,26,4 | 16,120,208,32 | 15 | save post link battle | start_menu.c:212 |

### B. Menus principaux
| Nom | Tiles | Pixels | Pal | Trigger |
|---|---|---|---|---|
| `sWindowTemplate_SafariBalls` | 1,1,9,4 | 8,8,72,32 | 15 | Safari Zone count |
| `sWindowTemplate_PyramidFloor` | 1,1,10,4 | 8,8,80,32 | 15 | Battle Pyramid floor |
| `sWindowTemplate_PyramidPeak` | 1,1,12,4 | 8,8,96,32 | 15 | Pyramid peak (variant) |
| `sOptionMenuWinTemplates[WIN_HEADER]` | 2,1,26,2 | 16,8,208,16 | 1 | option menu header |
| `sOptionMenuWinTemplates[WIN_OPTIONS]` | 2,5,26,14 | 16,40,208,112 | 1 | option items list |
| `sSaveInfoWindowTemplate` | 1,1,14,10 | 8,8,112,80 | 15 | save info display |

### C. Mailbox / Move Relearner
| Nom | Tiles | Pixels | Pal | Trigger |
|---|---|---|---|---|
| `MAILBOXWIN_TITLE` | 1,1,24,2 | 8,8,192,16 | 15 | mailbox title |
| `MAILBOXWIN_LIST` | 21,1,8,18 | 168,8,64,144 | 15 | mailbox item list |
| `MAILBOXWIN_OPTIONS` | 1,1,11,8 | 8,8,88,64 | 15 | mailbox context |
| `RELEARNERWIN_DESC_BATTLE` | 1,1,16,12 | 8,8,128,96 | 15 | move desc battle |
| `RELEARNERWIN_MOVE_LIST` | 19,1,10,12 | 152,8,80,96 | 15 | available moves |
| `RELEARNERWIN_MSG` | 4,15,22,4 | 32,120,176,32 | 15 | relearner message |
| `sMoveRelearnerYesNoMenuTemplate` | 22,8,5,4 | 176,64,40,32 | 15 | confirm learn move |

### D. Naming Screen
| Nom | Tiles | Pixels | Pal | Trigger |
|---|---|---|---|---|
| `WIN_KB_PAGE_1` | 3,10,19,8 | 24,80,152,64 | 10 | clavier page 1 |
| `WIN_KB_PAGE_2` | (idem, bg=2) | (idem) | 10 | clavier page 2 |
| `WIN_TEXT_ENTRY` | 8,6,17,2 | 64,48,136,16 | 10 | input field |
| `WIN_TEXT_ENTRY_BOX` | 8,4,17,2 | 64,32,136,16 | 10 | input border |
| `WIN_BANNER` | 0,0,30,2 | 0,0,240,16 | 11 | top banner |

### E. Boxes dynamiques (calculées au runtime)
- **Money box** (money.c:170) : pos x+1,y+1, size 10×2 tiles, pal 15 — paramétrable
- **Multichoice** (script_menu.c:630) : pos x+1,y+1, size dynamique, pal 15
- **Start Menu** (start_menu.c:493) : pos 22,1, height = num_actions×2+2

---

## 2. Assets

### PNG frames (`graphics/text_window/`)
- `1.png` à `20.png` : 20 frames de cadre 9-slice (24×24 px, indexé 4-bit)
- `message_box.png` : frame spécial dialogue (palette embarquée)

### Palettes (`graphics/text_window/`)
- `text_pal1.pal`, `text_pal2.pal`, `text_pal3.pal`, `text_pal4.pal` (JASC-PAL, 16 couleurs RGB)
- `message_box.gbapal` (GBA 5-bit RGB binaire)

### Constantes système (menu.c)
```c
#define DLG_WINDOW_PALETTE_NUM 15
#define DLG_WINDOW_BASE_TILE_NUM 0x200
#define STD_WINDOW_PALETTE_NUM 14
#define STD_WINDOW_BASE_TILE_NUM 0x214
#define WINDOW_FRAMES_COUNT 20
```

### Statut côté `pokemon-web-demo` (à jour session 31)
- ✅ PNGs 1-20 + message_box extraits dans `public/decomp/em/ui/text_window/`
- ✅ **Palettes JASC extraites** → `palettes.json` (14 palettes : text_pal1-4, std_menu, main_menu_*, menu_info1-3, option_menu_text, red, blank, hof_pc_topbar)
- ✅ **117 WindowTemplates extraits** → `window-templates.json` (scan récursif `src/**/*.c`, gère array + struct simple)
- ✅ **Module `src/engine/window-renderer.ts`** : 2 APIs distinctes selon le système :
  - `createWindow(scene, name, opts?)` : 9-slice avec `1.png`-`20.png` (menus, yesno, std boxes)
  - `createDialogWindow(scene, name, opts?)` : composition tile-par-tile avec `message_box.png` (DIALOG box uniquement, fidèle à `WindowFunc_DrawDialogueFrame` src/menu.c:319-412 — 14 tiles 7×2 avec V_FLIP pour le bas)
  - `getTemplatePixelRect(name)` : helper position pixel
  - Composition palette runtime (cache `wnd-tex-{frameId}-{paletteName}`)
- ✅ **Migrations effectuées** :
  - `dialogue-box.ts` → `createDialogWindow` (vrai cadre dialog, pas le 9-slice menu)
  - `OverworldScene.askYesNo` → `getTemplatePixelRect('sYesNo_WindowTemplates')` (position du décomp)
- ⏳ Restant : multichoice, naming screen, money box (pas encore utilisés ou layout dynamique)

### Convention "fichiers centraux" du décomp (pour éviter de chercher)

Le décomp n'a PAS un seul JSON catalog mais une convention stricte. Pour toute question UI, lire d'abord :

| Fichier | Rôle |
|---|---|
| `src/text_window.c` | Toutes les frames `1.png-20.png` + palettes `text_pal1-4.pal` + `gMessageBox_Gfx/Pal` (registry `sWindowFrames[]`) |
| `src/menu.c` | WindowTemplates (`sStandardTextBox_*`, `sYesNo_*`) + `WindowFunc_DrawDialogueFrame` + `WindowFunc_DrawStandardFrame` + `CreateYesNoMenu` |
| `src/text.c` | Rendu glyph + remap palette font_idx → output color (TextPrinter) + `sDownArrowYCoords` |
| `src/window.c` | `FillWindowPixelBuffer(PIXEL_FILL(1))` qui fill la zone texte avec palette idx 1 |
| `include/text.h` | `TEXT_COLOR_TRANSPARENT/WHITE/DARK_GRAY/LIGHT_GRAY/DYNAMIC_*` constantes |
| `graphics/text_window/*.png` | Frames 9-slice + message_box + .pal palettes |
| `graphics/fonts/latin_normal.png` | Font 256×512, palette 4 couleurs idx 0-3 |
| `graphics/fonts/down_arrow.png` | 8×48 = 3 frames 8×16 animation bobbing |

### Convention rendu glyph (CRITIQUE)
**Font palette idx 0-3 sont des SLOTS, pas des couleurs finales.** Le décomp remappe au runtime via TextPrinter :
- `font_idx 0` → toujours TEXT_COLOR_TRANSPARENT
- `font_idx 1` → fgColor (configuré par caller)
- `font_idx 2` → shadowColor (configuré)
- `font_idx 3` → bgColor (souvent TRANSPARENT pour cursor/menu)

Notre web port utilise `bitmap-font.ts renderTextToCanvas(scene, text, maxWidth, { transparentizeWhite: true })` pour les contextes où font_idx 3 doit être transparent (cursor `▶`).

### Convention down_arrow.png (CRITIQUE)
Le PNG 8×48 = **3 frames de 8×16** (PAS 6×8). Animation cycle `frame index = {0, 1, 2, 1}` (sDownArrowYCoords text.c:71). Couleurs natives : outline (idx 2 gris) + fill (idx 4 ROUGE) — pas de tint à appliquer.

### Distinction critique : dialog ≠ menu/textbox
Les screenshots du jeu montrent que les **dialogues NPC** ont un cadre visuellement DIFFÉRENT des menus :
- **Menu / yesno** : cadre simple 9-slice depuis `1.png` (24×24, 9 tiles 3×3) — `WindowFunc_DrawStandardFrame` src/menu.c:252
- **Dialog (msgbox)** : cadre composé tile-par-tile depuis `message_box.png` (56×16, 14 tiles 7×2) — `WindowFunc_DrawDialogueFrame` src/menu.c:319 utilise un layout asymétrique avec V_FLIP pour le bas
Le dialog est plus "doux" / arrondi vs le menu plus "carré". Confondre les deux = "dialog box looks like a menu" (bug observé sessions précédentes).

---

## 3. Plan extracteurs

### `extract-window-templates.mjs` (nouveau)
**Input** : `src/menu.c`, `script_menu.c`, `menu_specialized.c`, `naming_screen.c`, `start_menu.c`, `option_menu.c`
**Output** : `public/decomp/em/window-templates.json`
```json
{
  "sStandardTextBox": {
    "bg": 0, "tilemapLeft": 2, "tilemapTop": 15,
    "width": 27, "height": 4,
    "paletteNum": 15, "baseBlock": 0x194,
    "frameId": 1, "usage": "Standard dialogue box"
  },
  "sYesNo": { "bg": 0, "tilemapLeft": 21, "tilemapTop": 9, "width": 5, "height": 4, "paletteNum": 15, ... },
  ...
}
```
**Méthode** : regex sur `static const struct WindowTemplate s<Name>_WindowTemplates[]` + parser des champs `.bg`, `.tilemapLeft`, etc.

### `extract-palettes.mjs` (nouveau)
**Input** : tous les `.pal` JASC dans `graphics/`
**Output** : `public/decomp/em/palettes.json`
```json
{
  "text_pal1": { "colors": [[r,g,b], [r,g,b], ...16 RGB tuples] },
  "text_pal2": { "colors": [...] },
  ...
}
```
**Méthode** : parser JASC-PAL (skip header `JASC-PAL\n0100\nN\n` puis lire N lignes RGB).

---

## 4. Module TS proposé : `WindowRenderer`

```ts
// src/engine/window-renderer.ts
export interface WindowTemplate {
  bg: number;
  tilemapLeft: number; tilemapTop: number;
  width: number; height: number;       // en TILES (8 px)
  paletteNum: number; baseBlock: number;
  frameId?: number;                    // 1-20 pour text_window
  paletteName?: string;                // ex. "text_pal1"
}

export interface Palette {
  colors: Array<[number, number, number]>;  // [r, g, b], 16 entries
}

let templates: Record<string, WindowTemplate> = {};
let palettes: Record<string, Palette> = {};
const textureCache = new Set<string>();

export function loadTemplates(t: Record<string, WindowTemplate>) { templates = t; }
export function loadPalettes(p: Record<string, Palette>) { palettes = p; }

export function createWindow(scene: Phaser.Scene, name: string, overrides?: Partial<WindowTemplate>): Phaser.GameObjects.NineSlice | null {
  const t = { ...templates[name], ...overrides };
  if (!t) return null;
  const frameId = t.frameId ?? 1;
  const palName = t.paletteName ?? `text_pal1`;
  const texKey = `window-frame${frameId}-${palName}`;
  if (!textureCache.has(texKey)) {
    composeWindowTexture(scene, texKey, frameId, palName);
    textureCache.add(texKey);
  }
  // 9-slice : centre stretchable, coins fixes 8px
  return scene.add.nineslice(
    t.tilemapLeft * 8 + (t.width * 8) / 2,
    t.tilemapTop * 8 + (t.height * 8) / 2,
    texKey, 0,
    t.width * 8, t.height * 8,
    8, 8, 8, 8
  );
}

function composeWindowTexture(scene: Phaser.Scene, key: string, frameId: number, palName: string) {
  // 1. Récupère le PNG indexé (déjà chargé en cache textures via preload)
  const srcKey = `text-window-${frameId}`;
  const srcImg = scene.textures.get(srcKey).getSourceImage() as HTMLImageElement;
  const pal = palettes[palName];
  if (!pal) return;

  // 2. Compose canvas avec palette appliquée
  const canvas = document.createElement('canvas');
  canvas.width = srcImg.width; canvas.height = srcImg.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(srcImg, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyPaletteRemap(data, pal);
  ctx.putImageData(data, 0, 0);
  scene.textures.addCanvas(key, canvas);
}

function applyPaletteRemap(imgData: ImageData, pal: Palette) {
  // PNG indexé 4-bit chargé en HTML : browser produit RGB selon palette intégrée.
  // Pour appliquer NOTRE palette : remap chaque pixel en cherchant son index
  // dans la palette PNG (via lookup couleur), puis remplacer par notre palette.
  // Simplification : suppose les couleurs PNG sont distinctes → mapping 1:1.
  // (Approche alternative : lire le PNG en raw avec pngjs pour avoir l'index direct.)
  ...
}
```

### Migration `dialogue-box.ts` + `menu.ts`
```ts
// dialogue-box.ts
const frame = createWindow(scene, 'sStandardTextBox', { paletteName: 'text_pal1' });
// Position et taille viennent du template, plus de hardcode.

// menu.ts (yesnobox)
const frame = createWindow(scene, 'sYesNo', { paletteName: 'text_pal1' });
```

---

## 5. Phase d'implémentation

1. **Phase 1 — Extraction** : écrire les 2 extracteurs (`extract-window-templates.mjs` + `extract-palettes.mjs`)
2. **Phase 2 — WindowRenderer** : créer le module avec composition canvas + palette remap
3. **Phase 3 — Migration dialogue-box** : remplacer les positions hardcodées (16,120,216,32) par `createWindow('sStandardTextBox')`
4. **Phase 4 — Migration menu** : idem pour yesnobox/multichoice
5. **Phase 5 — Tests** : comparaison visuelle screenshots GBA vs web

---

## 6. Edge cases

- Palettes différentes selon contexte (battle vs field) — paramétrable via `overrides.paletteName`
- Frames PNG variants (1-20) — paramétrable via `overrides.frameId`
- Cache des textures composées pour éviter recompositions
- Performance : memoize par `(frameId, paletteName)` → 20 × 5 = max 100 textures cached
- Compatibilité avec autres scenes (BirchSpeech, Naming) qui peuvent avoir leurs propres templates

---

## 7. Risques

| Risque | Mitigation |
|---|---|
| Palette PNG ≠ palette .pal cible | Remap rigoureux par index, ou recharger PNG en mode raw via pngjs |
| 9-slice mal calé sur 24×24 PNG | Bordures 8/8/8/8 OK pour les frames standards |
| Multichoice = position dynamique | Calcule au runtime via `createWindow('sMultichoice', {tilemapLeft, tilemapTop, width, height})` |
| Tile baseBlock differs per template | Stocké dans le JSON, mais probablement pas critique côté Phaser (pas de VRAM) |
