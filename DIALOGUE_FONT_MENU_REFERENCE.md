# DIALOGUE / FONT / MENU REFERENCE — décomp pokeemeraude

> Spec issue de l'audit Agent Explore (very thorough) du 2026-04-25.
> Source : `D:\Projet 1\decomps\pokeemeraude\src\{text_window,text,menu,script_menu,fonts}.c` + `include/window.h`.
> But : refactor `dialogue-box.ts` + `menu.ts` pour fidélité visuelle parfaite.

> **Contexte écran GBA = 240×160 px = 30×20 tiles de 8 px.**

---

## 1. Textbox dialogue (cadre principal)

### Asset source
- PNG : `graphics/text_window/1.png` à `20.png` (20 variantes — défault = `1.png`)
- Palette : `text_pal1.pal` à `text_pal4.pal` (variantes utilisateur via Options)
- Format GBA : 4bpp, 0x120 bytes par frame (288 tiles), 9-slice

### Layout (sStandardTextBox_WindowTemplates menu.c:84-96)
| Champ | Tiles | Pixels |
|---|---|---|
| left | 2 | 16 |
| top | 15 | 120 |
| width | 27 | 216 |
| height | 4 | 32 |

- **Padding interne** : x=1, y=1
- **Line-height** : 16 px (FONT_NORMAL maxHeight)
- **Max lignes** : 2 avant scroll

### Palette (16 couleurs, défaut FONT_NORMAL fgColor=2/bgColor=1/shadowColor=3)
- Color 0 : transparent
- Color 1 : fond textbox (blanc/gris clair)
- Color 2 : texte principal (noir)
- Color 3 : ombre du texte (gris)
- Colors 4-15 : variantes via `sTextWindowPalettes[]`

### 9-slice composition (`DrawTextBorderOuter` text_window.c:115-131)
Tile pattern : 0=coin haut-gauche, 1=bordure haut, 2=coin haut-droit, etc. Standard 9-slice.

---

## 2. Font rendering (4 fonts)

### Assets (fonts.c)
| Font | PNG | Glyph max | Hauteur |
|---|---|---|---|
| `FONT_NORMAL` | `latin_normal.png` | 6 px | **16 px** |
| `FONT_SMALL` | `latin_small.png` | 5 px | 12 px |
| `FONT_NARROW` | `latin_narrow.png` | 5 px | 16 px |
| `FONT_SHORT` | `latin_short.png` | 6 px | 14 px |

**Variable-width** : chaque glyph a sa propre largeur stockée dans `gFont<X>LatinGlyphWidths[]` (256 entrées par font).

### Couleurs / palette
Pour FONT_NORMAL (text.c:131-140) :
- `fgColor = 2` (texte)
- `bgColor = 1` (fond)
- `shadowColor = 3` (ombre)

### Codes de contrôle (text.c:934-1224 RenderText)
| Code hex | Macro | Effet |
|---|---|---|
| 0x00 | CHAR_NEWLINE / `\n` | nouvelle ligne |
| 0xFC | EXT_CTRL_CODE_BEGIN | début de séquence ctrl, suivi de sub-code : |
| └ 0x01 | COLOR | change fgColor |
| └ 0x02 | HIGHLIGHT | change bgColor |
| └ 0x03 | SHADOW | change shadowColor |
| └ 0x04 | COLOR_HIGHLIGHT_SHADOW | 3 couleurs en bloc |
| └ 0x06 | FONT | change fontId |
| └ 0x07 | PAUSE | délai en frames |
| 0xFD | PROMPT_CLEAR / `\l` | scroll dernière ligne up |
| 0xFE | PROMPT_SCROLL / `\p` | clear complet |

### Glyph widths (extraits FONT_NORMAL)
- space (0x20) : 3 px
- '0' : 6 px
- '1' : 3 px
- 'A'-'Z' / 'a'-'z' : 6 px
- 'm'/'w' : 6 px (max)
- 'l'/'i' : 3 px
- Accents 'é' (0xE9), 'è' (0xE8), 'à' (0xE0), 'ç' (0xE7), 'â' (0xE2), 'ê' (0xEA), 'ô' (0xF4) : 6 px

### Text speed (menu.c:77-82)
| Option | Frames delay/char |
|---|---|
| SLOW | 8 |
| MID | 4 |
| FAST | 1 |

---

## 3. Arrow indicator (down-arrow clignotant)

- Asset : `graphics/fonts/down_arrow.png` (8×16 px, 4bpp)
- Animation : 4 frames Y-position via `sDownArrowYCoords[] = {0, 1, 2, 1}` (oscille)
- Délai entre frames : **8 frames** (~133 ms à 60 FPS)
- Mode : clignement quand attend A/B presse (sauf si `gTextFlags.autoScroll=1`)

---

## 4. Yesnobox (`yesnobox` opcode)

### Layout (sYesNo_WindowTemplates menu.c:98-107)
| Champ | Tiles | Pixels |
|---|---|---|
| left | 21 | 168 |
| top | 9 | 72 |
| width | 5 | 40 |
| height | 4 | 32 |

- Items : "YES" (line 0) et "NO" (line 1)
- Cursor défaut : position 0 (YES)
- **Délai input** : 5 frames avant accept inputs (script_menu.c:226-230)
- Result : `gSpecialVar_Result` = 1 (YES) ou 0 (NO)

### Code (script_menu.c:198-248)
```c
ScriptMenu_YesNo(left, top) → DisplayYesNoMenuDefaultYes() menu.c:464-466
```

---

## 5. Multichoice (`multichoice` opcode)

### Tables MULTI_X (`sMultichoiceLists[]` data/script_menu.h)
Structure :
```c
struct {
    u8 count;
    const struct MenuAction *list;  // {text, func} — func=NULL généralement
} sMultichoiceLists[NUM_MULTICHOICES];
```

### Layout dynamique (`DrawMultichoiceMenu` script_menu.c:92-114)
- Width : `ConvertPixelWidthToTileWidth()` basé sur l'item le plus long
- Height : `count × 2 tiles` (chaque item = 16 px)
- Position : `ScriptMenu_AdjustLeftCoordFromWidth()` centre si besoin

### Behavior
- Navigation : DPAD_UP/DOWN (`Menu_MoveCursor` menu.c:948-962) avec wrap optionnel
- Confirm : A → returns cursorPos
- Cancel : B → returns -1 (sauf si `ignoreBPress=TRUE`)
- Cursor : glyph `▶` (caractère du font, pas sprite séparé). Position relative : Δx=8 px, Δy=cursorPos × cursorHeight

---

## 6. Menu specifics

### Cursor dimensions (text.c:223-235)
- FONT_NORMAL : 8 × 15 px
- Glyph `▶` : 6 px de large

### Window template fields (window.h:8-35)
```c
{ bg, tilemapLeft, tilemapTop, width, height, paletteNum, baseBlock }
```

Standard menu :
- BG = 0, PALETTE_NUM = 14, BASE_BLOCK = 0x194 (STD_WINDOW_BASE_TILE_NUM = 0x214)

---

## 7. Plan refactor TS

### `dialogue-box.ts` à corriger
- Position : `x=16, y=120, w=216, h=32` (au lieu de la position actuelle approximative)
- Palette à appliquer : color 1 = fond clair, color 2 = texte noir, color 3 = ombre grise
- Padding : `x=1, y=1`
- Line-height : 16 px (pas un nombre arbitraire)
- Arrow : 4 frames y-offset {0, 1, 2, 1}, intervalle 133 ms
- Codes ctrl 0xFC sub-code 0x01-0x07 : à parser dans `substitutePlaceholders`

### `menu.ts` à corriger
- Yesnobox layout : `x=168, y=72, w=40, h=32`
- Multichoice layout : dynamique selon longueur items
- Cursor `▶` : utiliser le glyph du bitmap font (déjà dispo)
- Délai input : 5 frames (~83 ms) au lieu de 200 ms ad-hoc

### Nouveau extractor à écrire
- `extract-list-menu-items.mjs` : parse `data/script_menu.h` et `data/scripts/list_menu_items.inc` pour extraire les `MULTI_*` tables → `multichoice-tables.json`. Format :
  ```json
  { "MULTI_FAVOR_LADY_MENU": ["Talk", "See item", "Quit"], ... }
  ```

### Glyph widths (déjà en partie dans bitmap-font.ts ?)
- Vérifier que notre `latin_normal.png` est correctement parsé avec sa table de widths
- Sinon : extraire `gFontNormalLatinGlyphWidths[]` depuis `src/data/fonts.c` ou recomputer en parsant le PNG (chaque glyph a son largeur encodée dans la 1ère colonne ?)

---

## 8. Color rendering (3 colors par glyph)

`DecompressGlyphTile` text.c:526-555 utilise `sFontHalfRowLookupTable[]` (text.c:41) pour mapper les nibbles du glyph source → 3 couleurs (fg, bg, shadow). Pour notre Phaser : équivalent = parser le PNG indexé puis remplacer les pixels par les 3 couleurs cibles via canvas manipulation.

---

## 9. Maintenance

À mettre à jour quand :
- Nouvelle font implémentée (FONT_SHORT, FONT_NARROW)
- Nouveau code de contrôle wiré
- Glyph widths ajustés (accents FR notamment)
