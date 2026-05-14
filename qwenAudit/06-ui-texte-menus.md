# Audit 6/8 : UI, texte, menus, dialogues

## Comparaison web projet vs décomp pokeemeraude

### Architecture décomp UI

**Fichiers décomp clés** :
- `src/text.c` (~1 300 lignes) — TextPrinter state machine 7 states, RenderText, RunTextPrinters, glyph decompression, down arrow, scroll/clear, control codes
- `src/window.c` (~700 lignes) — Window registry, Init/Remove/FreeAllWindows, CopyWindowToVram, PutWindowTilemap, Clear/DrawStdFrame, ScrollWindow, BlitBitmapRect
- `src/menu.c` (~2 800 lignes) — Yes/No menus, list menus, radio button menus, start menu items, cursor input, std frame drawing, window templates
- `src/start_menu.c` (~1 400 lignes) — CB2_StartMenu, BuildNormalStartMenu, 7 items, save flow, save info window, fade-to-screen pattern
- `src/party_menu.c` (~2 200 lignes) — 6 slot party UI, big left slot, HP bar, icons, summary screen transition, action menu
- `src/item_menu.c` (~2 700 lignes) — 5 pockets, 3 windows (header/list/description), item icons, context menu, use logic
- `src/pokedex.c` (~1 800 lignes) — counters, list view, filter, regional/national dex, search
- `src/trainer_card.c` (~600 lignes) — BG layers, trainer pic, badges, stats text
- `src/option_menu.c` (~900 lignes) — 7 options, highlight window, cursor navigation, save callbacks
- `src/field_message_box.c` (~100 lignes) — Init/Show/Hide, Task_DrawFieldMessage state machine, NORMAL/AUTO_SCROLL modes
- `src/text_window.c` (~150 lignes) — LoadMessageBoxGfx, LoadMessageBoxAndBorderGfx, standard text box templates
- `src/string_util.c` (~300 lignes) — StringExpandPlaceholders, gStringVar1-4 buffer management
- `src/bitmap_font.c` (~500 lignes) — bitmap font rendering helpers (legacy)
- `src/window_template.c` (~200 lignes) — window template definitions

**Total décomp UI** : ~23 928 lignes

### Architecture web projet

**Fichiers correspondants** :
- `src/engine/gba-text-printer.ts` (806 lignes) — 1:1 décomp TextPrinter 7 states, Window pixel buffer, glyph blit, color remap, down arrow, scroll/clear
- `src/engine/gba-window-system.ts` (708 lignes) — Window registry, CopyWindowToVram, PutWindowTilemap, std frame, dialogue frame, BG template API
- `src/engine/gba-text-system.ts` (553 lignes) — TextPrinter registry, RunTextPrinters, font resolution, placeholder expansion, string width/align helpers
- `src/engine/menu.ts` (104 lignes) — reusable menu component (Phaser-based, non-décomp)
- `src/engine/gba-menu-system.ts` (476 lignes) — Yes/No menus, cursor input, Menu_ProcessInputNoWrap*, gSaveBlock2Ptr proxy
- `src/engine/start-menu.ts` (889 lignes) — 7 items start menu, save flow, fade-to-screen, sub-screens wiring
- `src/engine/party-screen.ts` (1 385 lignes) — 6 slot party UI, HP text, icons, gender symbol, summary transition
- `src/engine/bag-screen.ts` (2 728 lignes) — 5 pockets, 3 windows, item icons, context menu, descriptions
- `src/engine/dialogue-box.ts` (460 lignes) — Birch dialog + general dialog, page management, GBA engine + fallback
- `src/engine/field-message-box.ts` (197 lignes) — overworld dialog box 1:1 décomp
- `src/engine/pokedex-screen.ts` (~100 lignes) — counters only (skeleton)
- `src/engine/trainer-card-screen.ts` (~200 lignes) — BG layers, trainer pic, badges, stats
- `src/engine/option-menu-impl.ts` (~300 lignes) — 7 options, highlight, cursor, save
- `src/engine/bitmap-font.ts` (~200 lignes) — legacy bitmap font (fallback)
- `src/engine/window-renderer.ts` (~100 lignes) — dialog window creation helper

**Total web UI** : ~9 879 lignes hand-written

---

## Écarts détectés

### ERREUR E6.1 — TextPrinter 7 states : 1:1 fidèle ✅

**Décomp** : `RenderText` (text.c:934) implémente la state machine :
1. HANDLE_CHAR — render glyph par glyph
2. WAIT — delay entre chars (textSpeed)
3. CLEAR — \p page break propre (clear window + wait A + down arrow)
4. SCROLL_START — \l scroll up 1 line + wait A
5. SCROLL — progressif scroll pixels/frame
6. WAIT_SE — wait sound effect
7. PAUSE — EXT_CTRL_CODE_PAUSE timer

**Web** : `runTextPrinter` (gba-text-printer.ts:512) implémente les 7 states.
- HANDLE_CHAR ✅ (glyph blit + advance cursor + delayCounter)
- WAIT ✅ (delayCounter countdown + AB speed up)
- CLEAR ✅ (fillWindowPixelBuffer + reset cursor + down arrow)
- SCROLL_START ✅ (scrollDistance = LINE_HEIGHT + lineSpacing)
- SCROLL ✅ (scrollWindow deltaY selon speed SLOW/MID/FAST)
- WAIT_SE ❌ — pas de sound effect wait pendant le text rendering
- PAUSE ✅ (pauseCounter countdown + onCharRendered callback)

**Vérification détails** :
- `delayCounter = textSpeed - 1` ✅ (ligne 474, 1:1 décomp --textSpeed)
- `hasPrintBeenSpedUp` ✅ (ligne 551, held A/B → delayCounter=0)
- `gTextFlags.canABSpeedUpPrint` ✅ (ligne 88-92, battle messages can disable)
- Down arrow bobbing ✅ (DOWN_ARROW_Y_COORDS [0,1,2,1] ligne 29, delay 8 frames)
- SE_SELECT on page advance ✅ (gba-text-system.ts ligne 372)
- TEXT_SKIP_DRAW (255) sync flush ✅ (gba-text-system.ts ligne 276-282)

**Impact WAIT_SE absent** : les scripts qui utilisent `\x16` (WAIT_SE) pour synchroniser le texte avec un sound effect (e.g., fanfare pendant un nommage) ne vont pas wait. Le texte continue immédiatement.

**Criticité** : LOW — WAIT_SE est utilisé par quelques scripts spécifiques (title screen, naming). Pas critique pour les dialogues overworld.

### ERREUR E6.2 — Glyph decompression : correct mais pas de FONT_BOLD

**Décomp** : 10 font IDs (FONT_SMALL=0 à FONT_BOLD=9). Chaque font a ses propres glyph data + widths.

**Web** : implémente FONT_SMALL, FONT_NORMAL, FONT_SHORT, FONT_NARROW, FONT_SMALL_NARROW ✅. FONT_BRAILLE (6) et FONT_BOLD (9) ❌.

**Impact** : FONT_BOLD est utilisé par certains messages de battle et le title screen. FONT_BRAILLE est un easter egg (message secret au Hall of Fame).

**Fichiers** : `src/engine/gba-text-system.ts` ligne 42-49
**Criticité** : LOW — FONT_BOLD affecte quelques messages cosmétiques. FONT_BRAILLE = easter egg.

### ERREUR E6.3 — Control codes : couverture partielle

**Décomp** : text.c handle les EXT_CTRL_CODE suivants :
- COLOR (0x01) ✅ (3 bytes, set fgColor)
- HIGHLIGHT (0x02) ✅ (3 bytes, set bgColor)
- SHADOW (0x03) ✅ (3 bytes, set shadowColor)
- FONT (0x06) ❌ — pas de font switch au runtime
- PAUSE (0x09) ✅ (3 bytes, pause frames)
- PAUSE_UNTIL_PRESS (0x0A) ❌ — wait keypress (différent de PAUSE timer)
- WAIT_SE (0x0B) ❌ — wait sound effect
- PLAY_BGM (0x0C) ❌ — 5 bytes, start music
- ESCAPE (0x0D) ❌ — escape text printer
- COLOR_HIGHLIGHT_SHADOW (0x0E) ❌ — 5 bytes, set 3 colors simultaneously
- PLAY_SE (0x10) ✅ (stub — pas de SE playback)
- CLEAR (0x11) ✅ (3 bytes, advance currentX by N)
- SKIP (0x12) ✅ (3 bytes, set currentX = origin x + N)
- CLEAR_TO (0x13) ✅ (3 bytes, pad to target X)
- MIN_LETTER_SPACING (0x14) ✅ (3 bytes, set letterSpacing)
- VAR (0x15) ❌ — insert variable value inline
- SPECIAL (0x16) ❌ — insert special string inline

**Web fallback** : les codes non-handled default à skip 3 bytes (ligne 680). Pas de crash mais effet perdu.

**Criticité** : MEDIUM — PLAY_BGM dans le texte (utilisé par les scripts de map transition) et COLOR_HIGHLIGHT_SHADOW (utilisé par les menus colorés) sont fonctionnels mais silencieux.

### ERREUR E6.4 — Window system : 1:1 fidèle ✅

**Décomp** : `window.c` implémente :
- InitWindows/AddWindow/RemoveWindow/FreeAllWindowBuffers ✅
- CopyWindowToVram (pixel buffer → 4bpp VRAM) ✅
- PutWindowTilemap / ClearWindowTilemap ✅
- FillWindowPixelBuffer / FillWindowPixelRect ✅
- ScrollWindow (shift up + fill bottom) ✅
- BlitBitmapToWindow (4bpp source → 1 byte/pixel dst) ✅
- CreateWindowTemplate ✅
- DrawDialogueFrame / DrawStdFrameWithCustomTileAndPalette ✅
- ClearDialogWindowAndFrame / ClearStdWindowAndFrame ✅
- LoadMessageBoxGfx ✅ (tiles + palette)

**Vérification** :
- `copyPixelBufferToVram` (gba-window-system.ts:55) : correct 4bpp packing (low nibble = pixel gauche) ✅
- `tileMapIndex` (ligne 125) : correct screen size handling (32x32, 64x32, 32x64, 64x64) ✅
- `flushDirtyWindows` (ligne 208) : optimized — flush seulement les windows needsFlush ✅
- `BlitBitmapToWindow` (ligne 229) : correct 4bpp unpack ✅
- Frame drawing : 14 tiles pour dialogue frame, 8 tiles pour std frame ✅
- V_FLIP bottom row ✅ (ligne 420, 0x800 flag)

**Adaptation web** : pixelBuffer = 1 byte/pixel au lieu de packed 4bpp. Acceptable car plus simple à manipuler et surcoût mémoire négligeable (7 KB par dialog).

**Criticité** : ✅ CORRECT — pas d'erreur fonctionnelle

### ERREUR E6.5 — RunTextPrinters : double-tick guard correct ✅

**Décomp** : RunTextPrinters appelé une fois par frame dans le main loop.

**Web** : `RunTextPrinters` (gba-text-system.ts:553) avec guard `_lastRunTextPrintersFrame` pour éviter le double-tick. Les auto-callbacks appellent aussi `RunTextPrintersAndIsPrinter0Active` → sans guard, le down arrow s'animerait 2× trop vite.

**Vérification** : guard based on `gIntroFrameCounter` ✅. Input state (_setTextInputState) mis à jour une fois par frame ✅. A/B speed-up wiring correct ✅.

**Criticité** : ✅ CORRECT

### ERREUR E6.6 — Field message box : 1:1 décomp ✅

**Décomp** : `Task_DrawFieldMessage` (field_message_box.c) :
- State 0 : LoadMessageBoxAndBorderGfx
- State 1 : DrawDialogueFrame + AddTextPrinterForMessage
- State 2 : Wait printer done → mode = HIDDEN

**Web** : `TickFieldMessageBox` (field-message-box.ts:151) :
- State 0 : LoadMessageBoxGfx + lazy AddWindow ✅
- State 1 : DrawDialogueFrame + AddTextPrinterParameterized3 ✅
- State 2 : IsTextPrinterActive check → HIDDEN ✅

**Vérification** :
- `sStandardTextBox_WindowTemplates` 1:1 ✅ (BG0, (2,15), 27×4, palette 15, baseBlock 0x194)
- `StringExpandPlaceholders(gStringVar4, stripped)` ✅ (placeholders résolus avant encoding)
- `ClearDialogWindowAndFrame` pour hide ✅ (clear large rect couvrant les 2 colonnes de border)
- AUTO_SCROLL mode non implémenté (Phase 4.5 MVP) — acceptable

**Criticité** : ✅ CORRECT — NORMAL mode 1:1 fidèle. AUTO_SCROLL manquant mais hors scope MVP.

### ERREUR E6.7 — Dialogue box (Birch) : double engine hybrid

**Décomp** : Birch speech utilise le même pipeline text.c (AddTextPrinterWithCallbackForMessage + RunTextPrinters).

**Web** : `DialogueBox` (dialogue-box.ts) implémente :
1. Nouveau moteur GBA (renderWithGbaEngine) — Window pixel buffer + TextPrinter ✅
2. Fallback legacy (renderTextToCanvas via bitmap-font) — si font data manquante ❌

**Impact** : le fallback legacy utilise un bitmap font différent du décomp. Si les assets JSON ne sont pas chargés au moment du render, le texte Birch rend avec la police fallback → incohérence visuelle. Le nouveau moteur est correct quand il est utilisé.

**Vérification** :
- Page management via `pagesFromScriptText` ✅ (\n, \l, \p parsing)
- Placeholder substitution via `substitutePlaceholders` ✅
- `onPauseCallback` pour le Lotad release sync ✅ (1:1 NewGameBirchSpeech_WaitForThisIsPokemonText)
- Speed-up held A/B ✅ (speedUpHeld flag + delayCounter=0)
- Down arrow dans le buffer ✅ (blitée par textPrinterDrawDownArrow)

**Criticité** : LOW — le fallback n'est reachable que si les assets JSON échouent. En flow normal, le moteur GBA est utilisé.

### ERREUR E6.8 — Start menu : 7 items 1:1 décomp ✅

**Décomp** : `sStartMenuItems` (start_menu.c) :
1. POKéDEX (si FLAG_SYS_POKEDEX_GET)
2. POKéMON (si FLAG_SYS_POKEMON_GET)
3. SAC
4. PokéNav (si FLAG_SYS_POKENAV_GET) — absent early game
5. {PLAYER}
6. SAUVER
7. OPTIONS
8. RETOUR

**Web** : `buildItems` (start-menu.ts:506) :
- POKéDEX ✅ (flag gated + vraie UI pokedex-screen)
- POKéMON ✅ (flag gated + vraie UI party-screen)
- SAC ✅ (ouverte via bag-screen CB2 swap)
- PokéNav ✅ (flag gated + placeholder message)
- {PLAYER} ✅ (trainer-card-screen)
- SAUVER ✅ (save flow complet : info window + Yes/No + overwrite confirm)
- OPTIONS ✅ (fade-to-black + CB2_InitOptionMenu)
- RETOUR ✅ (close)

**Vérification** :
- Fade-to-black pattern pour POKéMON/SAC/OPTIONS/PLAYER ✅ (1:1 décomp HandleStartMenuInput)
- `sPendingScreenAction` + `_tickFadingToScreen` ✅ (attend !gPaletteFade.active)
- Save info window 1:1 décomp ShowSaveInfoWindow ✅ (region name, joueur, badges, pokedex, durée jeu)
- FreezeObjectEvents au open ✅ (ligne 598), UnfreezeAllNpcs au close ✅ (ligne 625)
- Cursor navigation ✅ (UP/DOWN clamped, no wrap)
- SE_SELECT + SE_WIN_OPEN ✅

**Criticité** : ✅ CORRECT — start menu 1:1 fidèle incluant les sous-menus

### ERREUR E6.9 — Menu cursor input : 1:1 décomp ✅

**Décomp** : `Menu_ProcessInputNoWrap` / `Menu_ProcessInputNoWrapClearOnChoose` (menu.c).

**Web** : `_processMenuInput` (gba-menu-system.ts:75) :
- A → return cursor pos + eraseOnSelect cleanup ✅
- B → return -1 (cancel) + eraseOnSelect cleanup ✅
- UP/DOWN → cursor navigate + clear/draw cursor + SE_SELECT ✅
- No-wrap vs wrap distinction ✅ (NoWrap = clamped, Wrap = cyclic)
- `InitMenuInUpperLeftCornerNormal` ✅ (draw initial cursor)
- `EraseYesNoWindow` ✅ (ClearStdWindowAndFrame + RemoveWindow)

**Vérification** :
- Yes/No menu : OUI/NON text + cursor + frame ✅
- Cursor draw/clear via AddTextPrinterParameterized3 + FillWindowPixelRect ✅
- `Menu_GetCursorPos` ✅

**Criticité** : ✅ CORRECT

### ERREUR E6.10 — Party screen : MVP fonctionnel mais incomplet

**Décomp** : `party_menu.c` (~2 200 lignes) avec :
- 6 slots avec sprites icon animés ✅
- Big left slot (sélectionné) + 5 right slots ✅
- HP bar tilemap (verte/jaune/rouge) ❌ web fait HP text uniquement
- Gender symbol ♂/♀ ✅
- Status icon (PSN/PAR/etc.) ❌
- Held item icon ❌
- Action menu (RESUMER / OBJET / INFOS / APTITU / CAPACITES / RETOUR) ❌
- Stats pages flip (INFOS / APTITU / CAPACITES) ❌
- Palette swap par slot (selected/fainted/multi-alt) ✅ (partial — constants définies)
- Cursor highlight palette swap ❌

**Web** : `party-screen.ts` (1 385 lignes) :
- 6 slots avec text rendering (nickname, Lv, HP) ✅
- Pokémon icon OAM per slot (16×16 front animated) ✅
- Bottom dialog "Choisir un POKéMON ou annuler" ✅
- Gender symbol ♂/♀ avec palette dynamique ✅
- SORTIR button ✅
- A/B/START close ✅
- CB2 swap pattern 1:1 décomp ✅
- Transition summary screen ✅

**Criticité** : MEDIUM — le MVP est fonctionnel (6 slots, icons, navigation, close). Les features manquantes (HP bar, action menu, stats pages) sont post-MVP.

### ERREUR E6.11 — Bag screen : fonctionnel mais context menu incomplet

**Décomp** : `item_menu.c` (~2 700 lignes) :
- 5 pockets scrollable ✅
- Header window (nom pocket) ✅
- List window (items × qty) ✅
- Description window ✅
- Item icons animés ✅
- Context menu (USAGER / JETER / INFO) ❌ — web affiche message placeholder
- Use logic (heal, throw ball, teach move) ❌ — post-overworld
- Quantity selector (1 / MOITIÉ / TOUT) ❌
- Ball throwing transition ❌

**Web** : `bag-screen.ts` (2 728 lignes) :
- 5 pockets ✅ (items, pokeBalls, tmHm, berries, keyItems)
- Header + List + Description windows ✅
- Item icon rendering avec palette ✅
- Navigation ↑↓ scroll, ←→ switch pocket ✅
- A = "use" message placeholder, B/START close ✅
- CB2 swap pattern 1:1 décomp ✅
- VISIBLE_ROWS = 8 ✅ (1:1 décomp list window)
- FONT_NARROW ✅ (1:1 décomp item list font)

**Criticité** : MEDIUM — l'infrastructure 5 pockets + 3 windows + icons est correcte. Le context menu et la logique d'utilisation sont post-overworld.

### ERREUR E6.12 — Options menu : 7 options avec auto-callbacks

**Décomp** : `option_menu.c` (~900 lignes) :
- VITESSE TEXTE (LENT / MOYEN / RAPIDE) ✅
- ANIM COMBAT (ON / OFF) ✅
- STYLE COMBAT (DEPLACEMENT / CHOIX) ✅
- SON (MONO / STÉRÉO) ✅
- BOUTONS (NORMAL / LR / L=A) ✅
- CADRE MENU (8 styles) ✅
- RETOUR ✅

**Web** : `option-menu-impl.ts` (~300 lignes) + auto-transpilé callbacks :
- 7 options wired ✅
- Highlight window via WIN_RANGE ✅
- Cursor navigation ✅
- Save callbacks ✅
- gSaveBlock2Ptr auto-persist ✅
- GetStringRightAlignXOffset pour right-align valeurs ✅

**Vérification** :
- Fade-to-black pattern pour entrer ✅
- CB2_ReturnToFieldWithOpenMenu_Manual pour retour ✅
- BlendPalettes pour highlight ✅
- SetPokemonCryStereo wired ✅
- preloadOptionMenuAssets ✅

**Criticité** : ✅ CORRECT — options menu fonctionnel avec les 7 options décomp

### ERREUR E6.13 — Pokédex screen : skeleton uniquement

**Décomp** : `pokedex.c` (~1 800 lignes) :
- Counters Vus/Capturés ✅ (web implémente ça)
- List view scrollable ❌
- Regional/National dex toggle ❌
- Search function ❌
- Filter (normal, not seen, not caught) ❌
- Summary screen per entry ❌
- DEX_0151 / DEX_0251 / DEX_0386 / DEX_0438 modes ❌

**Web** : `pokedex-screen.ts` (~100 lignes) :
- Counters Vus/Capturés via FLAG_DEX_FLAG_X_SEEN/CAUGHT ✅
- Window template + frame ✅
- Close A/B/START ✅
- List view + search + filter + summary = TODO

**Criticité** : MEDIUM — le skeleton est en place mais le Pokédex fonctionnel nécessite la list view, le filter, et la summary screen. Post-MVP.

### ERREUR E6.14 — Trainer card : 1:1 décomp ✅

**Décomp** : `trainer_card.c` (~600 lignes) :
- BG layers (bg.bin + front.bin) ✅
- Trainer pic (Brendan/May 64×64) ✅
- 8 badges sprites ✅
- Text (NOM, N°ID, ARGENT, POKéDEX, DUREE JEU) ✅
- Gender-aware palette (green/pink) ✅

**Web** : `trainer-card-screen.ts` (~200 lignes) :
- BG layout 1:1 décomp ✅
- Gender-aware palette ✅
- Trainer pic ✅
- Badges sprites ✅
- Text rendering ✅
- CB2 swap pattern ✅

**Criticité** : ✅ CORRECT — trainer card 1:1 fidèle

### ERREUR E6.15 — String placeholders : correct mais incomplet

**Décomp** : `string_util.c` (~300 lignes) :
- `StringExpandPlaceholders` avec ~30 expanders (PLAYER, RIVAL, STR_VAR_1-3, etc.)

**Web** :
- `StringExpandPlaceholders` (gba-text-system.ts:468) — PLAYER, RIVAL, STR_VAR_1-3 ✅
- `substitutePlaceholders` (dialogue-box.ts:40) — PLAYER, RIVAL, KUN, POKEBLOCK, VERSION, team names, STR_VAR, control codes strip ✅
- Manquants : MAI, BIRCH, STARK, ROUTE, TOWN, GYM_LEADER, etc. ❌

**Impact** : les placeholders non-résolus restent comme `{BIRCH}` dans le texte visible. Les scripts qui utilisent `{STR_VAR_4}` fallback à vide. `{MAI}` / `{BIRCH}` / `{STARK}` non résolus dans les dialogues.

**Criticité** : MEDIUM — les placeholders nommés ({BIRCH}, {STARK}, {RODE}, noms de lieux) peuvent apparaître comme `{NAME}` brut dans les dialogues au lieu d'être résolus en "BIRCH" / "STEVE" / "ROUTE 101".

### ERREUR E6.16 — gStringVar1-4 : correct ✅

**Décomp** : 4 string vars mutable buffers u8[0x100] chacun.

**Web** : `gStringVar1-4` dans gba-text-system.ts avec globalThis property binding ✅. Les auto-callbacks peuvent lire/écrire ces buffers via ES import.

**Vérification** :
- `setStringVar4` ✅ (mute + sync globalThis)
- `StringExpandPlaceholders` écrit dans gStringVar4 ✅
- `{STR_VAR_1..3}` résolus depuis gStringVar1-3 ✅
- `getStringVar` dans dialogue-box pour {STR_VAR_N} ✅

**Criticité** : ✅ CORRECT

### ERREUR E6.17 — Font loading : lazy + multi-font correct

**Décomp** : `font_load.c` charge les fonts depuis ROM en VRAM.

**Web** : `preloadFontData` (gba-text-system.ts:53) — lazy load depuis JSON.
- TOUS les fonts chargés (normal, short, narrow, small, smallnarrow) ✅
- `_resolveFont` mappe fontId → glyph data + widths ✅
- `GetStringWidth` / `GetStringRightAlignXOffset` / `GetStringCenterAlignXOffset` ✅
- Floor pour GetStringCenterAlignXOffset ✅ (1:1 C integer division)

**Criticité** : ✅ CORRECT

### ERREUR E6.18 — gSaveBlock2Ptr Proxy : auto-persist correct ✅

**Décomp** : `gSaveBlock2Ptr` est un pointeur vers les blocks en EWRAM.

**Web** : `gSaveBlock2Ptr` Proxy (gba-menu-system.ts:351) délègue vers `GetSaveBlock2()` du save-system. Les options sont auto-persistées via debounce micro-task TrySavingData. Legacy migration ✅.

**Criticité** : ✅ CORRECT

---

## Résumé passage 6

| ID     | Type        | Criticité | Description courte                                          |
|--------|------------|-----------|-------------------------------------------------------------|
| E6.1   | ✅ CORRECT  | —         | TextPrinter 7 states 1:1 (WAIT_SE absent mais low impact)    |
| E6.2   | Manquant    | LOW       | FONT_BOLD (9) + FONT_BRAILLE (6) absents                    |
| E6.3   | Partiel     | MEDIUM    | ~10/17 EXT_CTRL_CODE variants non-handled (PLAY_BGM, etc.)   |
| E6.4   | ✅ CORRECT  | —         | Window system 1:1 (pixel buffer 1 byte vs 4bpp adapté)      |
| E6.5   | ✅ CORRECT  | —         | RunTextPrinters double-tick guard + A/B speed-up             |
| E6.6   | ✅ CORRECT  | —         | Field message box 1:1 décomp (NORMAL mode)                  |
| E6.7   | Hybrid      | LOW       | Dialogue box double engine (GBA primary + legacy fallback)   |
| E6.8   | ✅ CORRECT  | —         | Start menu 7 items 1:1 + sous-menus complets                |
| E6.9   | ✅ CORRECT  | —         | Menu cursor input 1:1 (Yes/No, NoWrap variants)             |
| E6.10  | Partiel     | MEDIUM    | Party screen MVP (HP bar, action menu, stats pages absents)  |
| E6.11  | Partiel     | MEDIUM    | Bag screen MVP (context menu, use logic, qty selector absents)|
| E6.12  | ✅ CORRECT  | —         | Options menu 7 options fonctionnelles                       |
| E6.13  | Partiel     | MEDIUM    | Pokédex skeleton (counters only, list/search/filter absents) |
| E6.14  | ✅ CORRECT  | —         | Trainer card 1:1 décomp                                     |
| E6.15  | Partiel     | MEDIUM    | Placeholders partiels (~30 décomp vs ~15 web)               |
| E6.16  | ✅ CORRECT  | —         | gStringVar1-4 mutable + globalThis binding                  |
| E6.17  | ✅ CORRECT  | —         | Font loading lazy + multi-font + align helpers              |
| E6.18  | ✅ CORRECT  | —         | gSaveBlock2Ptr Proxy auto-persist + legacy migration         |

**Couverture globale UI** :
- Text rendering pipeline : ~90% (7 states ✅, glyph blit ✅, down arrow ✅, control codes partiels)
- Window system : ~95% (CRUD ✅, VRAM copy ✅, frame drawing ✅, scroll ✅)
- Menu system : ~85% (cursor input ✅, Yes/No ✅, list menus partiels, radio menus ❌)
- Start menu : ~95% (7 items ✅, save flow ✅, sub-screens ✅, freeze NPCs ✅)
- Party screen : ~50% (6 slots ✅, icons ✅, HP bar ❌, action menu ❌, stats ❌)
- Bag screen : ~55% (5 pockets ✅, 3 windows ✅, icons ✅, context menu ❌, use ❌)
- Options menu : ~90% (7 options ✅, highlight ✅, save ✅)
- Field message box : ~90% (NORMAL mode ✅, AUTO_SCROLL ❌)
- Trainer card : ~90% (BG layers ✅, pic ✅, badges ✅, text ✅)
- Pokédex : ~15% (counters ✅, list/search/filter ❌)
- String placeholders : ~50% (~15/~30)

**Fort** : le pipeline text rendering est remarquablement fidèle. Le TextPrinter 7-state machine, le window system, le menu cursor input, et le start menu sont tous 1:1 décomp. La gestion des fonts multi-type, le lazy loading, et le gSaveBlock2Ptr Proxy sont bien architecturés.

**Faible** : les sous-menus party/bag/pokédex sont des MVP fonctionnels mais significativement incomplets (HP bar, action menu, context menu, use logic, list view). Les placeholders ne couvrent qu'une partie des noms/expandeurs décomp.

**Priorité correction** : E6.3 (control codes — PLAY_BGM dans le texte), E6.15 (placeholders — noms bruts visibles), E6.10 (party screen — HP bar + action menu), E6.11 (bag screen — context menu + use logic), E6.13 (pokédex — list view).
