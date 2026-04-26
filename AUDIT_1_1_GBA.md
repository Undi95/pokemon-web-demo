# Audit 1:1 GBA — pokemon-web-demo

**Date** : 2026-04-26 (session 57)
**Source** : sub-agent Opus, `agentId: a474e8d76151bbcf7`
**Contexte** : 6+ itérations de patches sur `dialogue-box.ts` n'ont pas convergé vers le rendu emulator. Audit complet pour identifier les divergences structurelles.

---

## TL;DR

On patche un système (canvas Phaser direct) qui n'a PAS la structure du décomp. Le décomp utilise un vrai moteur **TextPrinter** avec :
- WindowPixelBuffer 4bpp en mémoire
- State machine RENDER_STATE_* (charByChar streaming, EXT_CTRL_CODE handling)
- Half-row LUT couleurs (`GenerateFontHalfRowLookupTable`) pour fg/bg/shadow runtime
- Glyph 4bpp décompressés (`DecompressGlyphTile`) avec drop-shadow 1px
- `currentX/currentY` maintenus auto par la state machine

Les calculs heuristiques (`(lineIdx+1)*16-8` pour arrow Y, `X+last.width` pour arrow X, RGB-replace pour shadow) divergeront TOUJOURS car ils ne sont pas synchronisés avec ce moteur.

---

## Audit par module

### Module 1 : Pipeline texte (CRITIQUE)

**Divergence #1 — Layout PNG mal lu**
- `bitmap-font.ts:12-14` traite chaque cell comme bloc 16×16 cohérent.
- Réalité : `tools/gbagfx/font.c:19-40` montre que latin_normal.png est layout `.latfont` 4bpp où le glyph fait **8 px wide × 16 px tall** (les 8 cols droites de chaque cell PNG sont des slots BG inutilisés).
- Sévérité : cosmétique (pas le bug visible) mais source de confusion.

**Divergence #2 — Half-row remapping ABSENT** ⚠️ CRITIQUE
- `bitmap-font.ts:262-291` fait un naïf RGB-replace `{(56,56,56)→(96,96,96)}`.
- Réalité décomp (`text.c:363-512` GenerateFontHalfRowLookupTable + `text.c:526-555` DecompressGlyphTile + `text.c:572-594` GLYPH_COPY) : glyph stocké en 4bpp où `0=BG, 1=FG, 2=SHADOW`. AddTextPrinter construit une LUT 0x51 entries qui mappe chaque demi-row (4 px) selon `fgColor/bgColor/shadowColor` du printer.
- Conséquence : sans LUT, shadow drawn at wrong pixels (décomp = drop shadow 1 px below + 1 px right). Code web rend uniquement (56,56,56) PNG → DARK GRAY plat sans shadow → **explique le décalage visuel "léger"** car baseline de chaque ligne change quand shadow absent.

**Divergence #3 — Position printer cohérente**
- `menu.c:177` `printer.x=0, printer.y=1`. Code web met `Y+1` au container ET `ly*16` interne → première ligne à `Y+1`, deuxième à `Y+17`. Décomp idem.
- Sévérité : aucune.

**Divergence #4 — Arrow position incorrecte** ⚠️ VISIBLE
- `dialogue-box.ts:252-258` calcule `ARROW_X = X + last.width` et `ARROW_Y = Y + 1 + (lineIdx+1)*16 - 8`.
- Réalité décomp (`text.c:787-836` TextPrinterDrawDownArrow) : `BlitBitmapRectToWindow(..., currentX, currentY, 8, 16)`. `currentY` = position de la dernière ligne après render (state machine), pas heuristique.
- Pour 1 ligne : `currentY = printer.y = 1` → arrow blitted à `(currentX, 1)` dans window = `(X+lastWidth, Y+1)` absolute.
- Code web met à `Y+9` = **8 px trop bas**.

### Module 2 : DialogueBox / state machine arrow

**Divergence #1 — Pas de state machine downArrowDelay/YPosIdx**
- Décomp text.c:787-834 : tick avance `downArrowYPosIdx` SEULEMENT quand `downArrowDelay==0`, reset `downArrowDelay = 8` (133 ms). Cycle indices `sDownArrowYCoords = {0,1,2,1}`. Arrow blitted avec **Y offset = sDownArrowYCoords[idx]** (Y de blit dans window pixel buffer, pas frame index).
- Web : `setFrame(idx)` sur spritesheet 3 frames → suppose 3 versions PNG distinctes. Probable que les 3 frames PNG soient toutes identiques (le décomp gère le bobbing par offset Y au blit, pas par frames pré-rendues).

**Divergence #2 — Pas de ClearDownArrow entre frames**
- text.c:838 `TextPrinterClearDownArrow` appelle `FillWindowPixelRect` au bg color avant chaque blit. Web : rien → cumulation visuelle si frames PNG ont bbox différentes.

### Module 3 : Window rendering

**Divergence #1 — composeDialogTexture remplit intérieur en RGB hardcodé**
- `window-renderer.ts:291` `ctx.fillStyle = 'rgb(248,248,248)'`.
- Réalité : `FillWindowPixelBuffer(windowId, PIXEL_FILL(1))` → idx 1 mappé via palette idx 15 (DLG_WINDOW_PALETTE_NUM). Palette varie selon `gSaveBlock2Ptr->optionsWindowFrameType`.
- Bug : pas critique tant que couleur matche, mais structurellement faux.

**Divergence #2 — Choix `text_window/6.png` au lieu de `1.png`**
- `dialogue-box.ts:88` charge `6.png` "parce que 1.png a une palette mauve dans notre extraction".
- Réalité : le textbox dialog n'utilise PAS un text_window/N.png. Il utilise `message_box.png` (gMessageBox_Gfx). Les `text_window/N.png` = frames pour menus standard. Pour BirchSpeech, `LoadMessageBoxGfx(0, BIRCH_DLG_BASE_TILE_NUM, BG_PLTT_ID(15))` charge bien message_box.
- `6.png` = fallback rare (templates pas chargés). OK structurellement, commentaire trompeur.

**Divergence #3 — `BIRCH_DLG_BASE_TILE_NUM = 0xFC` ignoré** ⚠️ FUTUR
- Web ne tient pas compte des `baseBlock` / tile cache offsets. Sans incidence visuelle directe, mais plusieurs windows superposées vont chevaucher (futur : combat, party menu).

### Module 4 : Scene transitions

Aucune primitive `InitWindows / FillWindowPixelBuffer / CopyWindowToVram / PutWindowTilemap` n'a d'équivalent web. Le code dessine directement en canvas.
- `InitWindows(sNewGameBirchSpeechTextWindows)` non implémenté.
- Conséquence : impossible de scroller (`ScrollWindow`), `FillWindowPixelRect` impossible (= clear arrow), text streaming charByChar (textSpeed) impossible.

### Module 5 : BirchSpeech vs main_menu.c

Manquant côté web :
- **Tasks d'animation** : `Task_NewGameBirchSpeech_WaitToShowBirch` (timer 0xD8 frames = 3.6s avant Birch fade-in), fade alpha sprite, Lotad release, platform slide -60 px, player shrink, fade-to-white. **Aucun** dans `BirchSpeechScene.ts`.
- **Music fade** : `FadeOutBGM(4)` avant naming.
- **Pokeball release callback** : `NewGameBirchSpeech_WaitForThisIsPokemonText` synchronise spawn Lotad sur `EXT_CTRL_CODE_PAUSE` du texte → Lotad apparaît AU MILIEU du dialog "C'est un Pokémon !". Web : aucun parsing des codes contrôle = pas de sync.

---

## Inventaire

| Asset | État | Note |
|---|---|---|
| Fonts widths table | ✅ | `extract-font-widths.mjs` OK |
| Fonts glyph bitmaps | ⚠️ | PNG atlas (`latin_normal.png`) au lieu de `.latfont` raw → consommé sans LUT couleur |
| Window templates | ✅ | `window-templates.json` 1:1 |
| Window frames PNG | ✅ | `text_window/1..20.png + message_box.png` |
| Window palettes runtime | ⚠️ | `text_pal1..4.pal` extraits mais mapping `paletteNum→name` incomplet (window-renderer.ts:86-95) |
| `gMessageBox_Pal` | ❌ | Hardcodée RGB literal dans le code |
| `BIRCH_DLG_BASE_TILE_NUM` + tile cache constants | ❌ | Pas extraites |
| Half-row LUT couleurs | ❌ | Pas implémentée |
| `sDownArrowTiles` raw 4bpp | ❌ | Web utilise PNG pré-rendu 3 frames stackées (peut être faux) |
| State machine TextPrinter | ❌ | Aucun équivalent. Web dump tout d'un coup |
| EXT_CTRL_CODE handling | ❌ | Strippés au lieu d'être traités → pas de sync Lotad |
| MIDI music | ⚠️ | `mus_route122.mid` chargé, pas de FadeOutBGM, pas de cris Pokémon |
| Sprite OAM affineAnims | ❌ | Player shrink, fade alpha pas implémentés |
| PaletteFade | ❌ | `BeginNormalPaletteFade` aucun équivalent |

---

## Propositions

### Prop 1 — TextPrinter engine 1:1 (8-12h)

**Quoi** : `src/engine/gba-text-printer.ts` qui implémente :
- `Window` struct (pixel buffer 4bpp `Uint8Array`, tileData indexé)
- `FillWindowPixelBuffer(windowId, fillIdx)`, `BlitBitmapRectToWindow`, `FillWindowPixelRect`
- `TextPrinter` state machine (RENDER_STATE_HANDLE_CHAR, WAIT, CLEAR, SCROLL...)
- `GenerateFontHalfRowLookupTable(fg, bg, shadow)` + `DecompressGlyphTile`
- Glyphs lus depuis `.latfont` raw (extraire JSON `{glyphId: Uint8Array(64)}`)
- `CopyWindowToVram` = blit pixel buffer reconstruit (8bpp via palette) sur canvas Phaser texture

**Pourquoi 1:1** : `text.c:271-345` (AddTextPrinter, RunTextPrinters, RenderFont) + `text.c:1853-1893` (DecompressGlyph_Normal, GetGlyphWidth_Normal) + `window.c:450-454` (FillWindowPixelBuffer) + `text.c:526-647` (DecompressGlyphTile, GLYPH_COPY).

**Coût** : 8-12h dev. Inclut extraction `.latfont` (3h), engine TextPrinter (4h), state machine + EXT_CTRL_CODE (3h), tests visuels (2h).

**ROI** : MASSIF. Débloque rendu char-by-char (textSpeed), down arrow correct (state machine identique), shadow naturel (LUT half-row), tous EXT_CTRL_CODE (PAUSE pour sync Lotad, etc.). Marche pour TOUTES scènes texte (combat, party, NPC), pas juste BirchSpeech. Supprime tout hardcode `bitmap-font.ts:262-291`.

### Prop 2 — Extract `.latfont` + palettes runtime (3-4h)

**Quoi** : `scripts/extract-latfont.mjs` qui invoque `gbagfx` (ou réimpl `ConvertToLatinFont` inverse en JS) → `public/decomp/em/ui/fonts/latin_normal.latfont.json` = `{glyphs: number[256][32]}`. Idem `.gbapal` → `palettes.json` enrichi avec `gMessageBox_Pal`, `gTextWindowFrame[1..20]_Pal`, `gFontPalette`.

**Pourquoi 1:1** : `font.c:12-17 gFontPalette` + `text_window.c:30-49`. PNG ne capture pas la "vraie" structure 4bpp (gbagfx ajoute padding visuel).

**Coût** : 3-4h. `gbagfx` déjà compilé dans `tools/gbagfx/`. Soit invoquer le binaire (1h), soit réimpl JS de `ConvertFromLatinFont` inverse + indexed-PNG decode (3h).

**ROI** : Permet Prop 1 (sans glyphs 4bpp, pas de half-row LUT). Aussi : exporte vraies palettes pour TOUS frames text_window → résout bug "1.png mauve" en composant runtime depuis idx + .pal.

### Prop 3 — Tasks + PaletteFade + OAM mini-runtime (6-8h)

**Quoi** : `src/engine/gba-task.ts` = `gTasks[]` array + dispatch loop dans Phaser.update. Chaque task = `{ func, data: i16[16] }` matchant décomp. `BeginNormalPaletteFade(palettesMask, delay, startY, endY, color)` = anime fade alpha global. `affineAnimEnded` flag = fini par tween Phaser scaleX/Y.

**Pourquoi 1:1** : `main_menu.c:1266-1788` est 100% structure tasks → state func pointer. Sans cette infra, impossible de reproduire les 18 tasks de BirchSpeech.

**Coût** : 6-8h. Task dispatcher (2h), PaletteFade (3h), affineAnims (2h), wiring BirchSpeech (1h).

**ROI** : haute. Rend BirchSpeech identique GBA (Birch fade-in, platform slide, Lotad release, player shrink, fade-to-white). Réutilisable pour TOUTES scènes (combat anims, evolution, hall of fame).

---

## Plan d'action

**Étape 1 (PROCHAIN MOVE)** : Prop **2 + 1 en une passe** (~12-15h sub-agent). Au prochain test BirchSpeech : indiscernable emulator (shadow correct, arrow position via state machine).

**Étape 2** : Prop **3** (~6-8h). Débloque cinématiques (BirchSpeech complet, futurs combats, evolution).

**À NE PAS faire** : continuer à patcher `dialogue-box.ts` ARROW_X/Y. Heuristique = divergence garantie tant que moteur ne maintient pas son propre `currentX/currentY` via state machine.

---

## Fichiers décomp clés audités

- `src/text.c` (lignes 119-220, 271-345, 363-555, 572-647, 787-836, 1050-1224, 1853-1893)
- `src/menu.c` (lignes 90-249, 319-422)
- `src/main_menu.c` (lignes 375-405, 1266-1788, 2240-2305)
- `src/text_window.c` (lignes 1-115)
- `src/window.c` (lignes 440-454)
- `src/fonts.c` (gFontNormalLatinGlyphs INCGFX `.latfont`)
- `tools/gbagfx/font.c` (ConvertFromLatinFont layout)
