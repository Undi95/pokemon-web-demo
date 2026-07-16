# AUDIT MOTEUR — text.c → src/text.ts (+ satellites)

**Référence** : `D:/Projet 1/decomps/pokeemeraude/src/text.c` (1905 l.) + `include/text.h` (173 l.)
**Port principal** : `src/text.ts` (2023 l.) · satellites : `src/menu.ts` (P2/P3/P4, GetPlayerTextSpeed*), `src/window.ts` (fill/scroll), `harness/runtime/decomp-globals.ts` (PlaySE/IsSEPlaying).
**Exemption actée** : moteur glyphe ÉMULÉ (latfont.json pré-décodé, pas de packing 4bpp/`sFontHalfRowLookupTable`) — audit = couverture COMPORTEMENTALE.

## Compteurs & verdict

| Catégorie | ✅ | 🟡 | 🟠 | 🔴 | ⛔ | ⚪ |
|---|---|---|---|---|---|---|
| Fonctions text.c (38) | 20 | 5 | 1 | 1 | 5 | 6 |
| EXT_CTRL_CODE (20) | 10 | 3 | 1 | 1 | 5 | — |
| CHAR_* spéciaux (8) | 5 | 1 | — | — | 1 | 1 |
| Data/tables (14) | 9 | 1 | — | — | 2 | 2 |

**Verdict (1 ligne)** : le cœur (printers, pacing par char, widths 512 entrées 1:1 fonts.c, ▼, \p/\l pixel-scroll, CLEAR/CLEAR_TO, keypad) est solide et fidèle ; les manques qui se VOIENT = `WAIT_SE` no-op (fanfares level-up/capture/évolution non attendues), `COLOR_HIGHLIGHT_SHADOW` absent du renderer (mines armées dans pokenav_conditions déjà transpilé), interligne NEWLINE hardcodé 16, P5 absent, pacing des codes de contrôle gratuit.

---

## Tableau fonction par fonction (text.c)

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| SetFontsPointer | ⚪ émulé | 239 | — | pas de pointeur `gFonts` ; data lazy `loadFontData` (text.ts:1285) |
| DeactivateAllTextPrinters | ✅ | 244 | text.ts:1247 | `active=false` sur tous les slots (ne vide pas) 1:1 |
| AddTextPrinterParameterized | ✅ | 251 | text.ts:1205 | attributs via GetFontAttribute 1:1 |
| AddTextPrinter | 🟡 | 271 | text.ts:1150 | speed 0/0xFF → rendu instant borné 0x400 ✓, `--textSpeed` ✓ (addTextPrinter text.ts:1901). Divergences : `gDisableTextPrinters=FALSE` (c:315) non porté ; TEXT_SKIP_DRAW ne DIFFÈRE pas la copie VRAM (needsFlush auto) — décomp ne copie pas (c:311) ; break explicite sur états WAIT en instant (équiv. net : décomp spinne 0x400 puis abandonne) |
| RunTextPrinters | 🟡 | 319 | text.ts:1398 | boucle slots ✓, FINISH→inactive ✓. Manque : gate `gDisableTextPrinters` (c:323) ; `callback(template, renderCmd)` per-frame (c:335-336) remplacé par `onCharRendered` per-char (mécanisme ≠) ; + guard 1-tick/frame (adaptation harness, OK) |
| IsTextPrinterActive | ✅ | 347 | text.ts:1226 | |
| RenderFont | ✅ | 352 | text.ts:1059 | boucle RENDER_REPEAT + garde 0x400 |
| GenerateFontHalfRowLookupTable | ⚪ émulé | 363 | text.ts:1578 | remap 0→bg,1→fg,2→shadow,3→bg au blit (`sFontHalfRowOffsets[3]==[0]` ✓) |
| SaveTextColors / RestoreTextColors | ⛔ | 514/521 | — | 0 caller décomp hors text.c → impact nul (RenderTextHandleBold garde un état local 1:1-net) |
| DecompressGlyphTile | ⚪ émulé | 526 | — | latfont pré-décodé (exemption actée) |
| GetLastTextColor | ⚪ | 557 | — | UNUSED décomp |
| GLYPH_COPY | ⚪ émulé | 572 | text.ts:1578 | skip pixel nibble 0 = 1:1 `if (toOrr)` (c:585) |
| CopyGlyphToWindow | ✅ émulé | 596 | text.ts:715 | clipping par-pixel ≡ clamps (c:608-612) ; skip byte 0 (espace) = garde whitespace documentée |
| ClearTextSpan | 🟡 | 649 | text.ts:727 | fill bg ✓ MAIS (a) teste `printer.bgColor` vs `sLastTextBgColor` global (c:656) ; (b) hauteur = `gCurGlyph.height` port = maxLetterHeight (16/12/8) ≠ hauteur glyphe décomp (15/13/14/15/12, c:1713/1755/1841/1883) → rect ±1-4 px ; (c) sondes debug `__noClearSpan`/`__traceClearSpan` (rustines) |
| FontFunc_Small…SmallNarrow (8) | ✅ | 676-770 | text.ts:1014-1025 | fusionnés : dispatch `switch(subStruct.fontId)` + `hasFontIdBeenSet=true` à la création — équivalent |
| TextPrinterInitDownArrowCounters | 🟡 | 772 | text.ts:850/858 | inliné à \p/\l : downArrowDelay/YPosIdx=0 ✓ ; branche `autoScroll → autoScrollDelay=0` (c:776-778) MANQUANTE (latent : autoScroll jamais true) |
| TextPrinterDrawDownArrow | ✅ | 787 | text.ts:1952 | fill 8×16 bg ✓, alt-arrow au draw-time ✓, srcY=sDownArrowYCoords[idx] ✓, delay 8 ✓ ; check `autoScroll==0` délégué au caller (équiv.) |
| TextPrinterClearDownArrow | ✅ | 838 | text.ts:668 | (bg<<4)\|bg → `&0x0F` window.ts:69 = même nibble |
| TextPrinterWaitAutoMode | ✅ | 850 | text.ts:628 | seuil 49 ✓ — chemin MORT (autoScroll jamais posé true dans le port) |
| TextPrinterWaitWithDownArrow | ✅ | 865 | text.ts:637 | A/B → PlaySE(SE_SELECT) ✓ |
| TextPrinterWait | ✅ | 884 | text.ts:653 | idem sans ▼ |
| DrawDownArrow | ⛔ | 902 | — | seul caller décomp = mystery_gift_menu.c:574-597 → hors-scope solo |
| **RenderText** | 🟠 | 934 | text.ts:739/812 | états WAIT/CLEAR/SCROLL_START/SCROLL/WAIT_SE/PAUSE ✓ structure 1:1 ; HANDLE_CHAR : voir tableau codes. Pacing : delay ✓, JOY_HELD+hasPrintBeenSpedUp ✓, canABSpeedUpPrint ✓ ; MANQUE `autoScroll → delayCounter=3` (c:958-959) ; codes de contrôle GRATUITS (décomp : chaque RENDER_REPEAT re-consomme un slot de délai, c:947-961) |
| GetStringWidthFixedWidthFont | ⚪ | 1226 | — | UNUSED décomp |
| GetFontWidthFunc | ✅ | 1315 | text.ts:423 | braille omis → null → return 0 = même effet que func==NULL |
| **GetStringWidth** | ✅ | 1328 | text.ts:498 | 1:1 logique : multi-ligne MAX ✓, VAR_1-3 ✓ (autre placeholder → 0 ✓ c:1376), DYNAMIC ✓, {FONT} switch ✓, CLEAR+=/SKIP=/CLEAR_TO-max ✓ (c:1425-1435), MIN_LETTER_SPACING ✓, KEYPAD ✓, EXTRA 0x100 ✓ ; letterSpacing latin JAMAIS ajouté (1:1 — que JPN ⚪). ⚠️ signature inversée `(str, fontId, ls)` documentée, accepte JS-string (encode au vol) |
| RenderTextHandleBold | 🟡 | 1500 | text.ts:1677 | flux/offsets tuiles 0x40 1:1, codes couleur locaux 1:1 ; FONT_BOLD → fallback FONT_NORMAL (asset non extrait) → chiffres PV **doubles** non-bold (cosmétique, battle_interface.c:1204/1273/1324/1356) |
| DrawKeypadIcon | ✅ | 1609 | text.ts:465 | pixels pré-croppés (tileOffset appliqué offline), colorKey 0 = 1:1 blit.c else |
| GetKeypadIconTileOffset / Height | ⛔ | 1625/1635 | — | 0 caller décomp hors text.c → impact nul |
| GetKeypadIconWidth | ✅ | 1630 | text.ts:449 | |
| SetDefaultFontsPointer | ⚪ émulé | 1640 | — | loadFontData |
| GetFontAttribute | ✅ | 1645 | text.ts:341 | 8 attributs ✓ |
| GetMenuCursorDimensionByFont | ✅ | 1678 | text.ts:375 | table ✓ |
| DecompressGlyph_Small/Narrow/SmallNarrow/Short/Normal | ✅ émulé | 1683-1885 | text.ts:706-710 | sélection glyphe+width via `_fillCurGlyph` ; JP ⚪ ; 🟡 `gCurGlyph.height` = maxLetterHeight au lieu de 13/15/12/14/15 (impacte ClearTextSpan) ; 🟡 width `\|\| 3` fallback magique |
| GetGlyphWidth_Small/Normal/Short/Narrow/SmallNarrow | ✅ | 1717-1892 | text.ts:390-406 | source = tables `gFont*LatinGlyphWidths` de fonts.c extraites 1:1 (512 entrées/font vérifiées, extra-symbols 0x100+ couverts) via extract-font-widths.mjs → font-widths.json |
| DecompressGlyph_Bold | 🔴 | 1895 | — | `sFontBoldJapaneseGlyphs` non extrait → FONT_NAMES[9] absent → fallback normal |

## Control codes (RenderText HANDLE_CHAR, text.ts:864-971)

| Code | Statut | C:ligne | Détail |
|---|---|---|---|
| COLOR / HIGHLIGHT / SHADOW | ✅ | 980-994 | 3 bytes ✓, couleur lue au blit (≡ GenerateFontHalfRow) |
| **COLOR_HIGHLIGHT_SHADOW** | ⛔ | 995-1003 | non géré → default skippe 3 bytes au lieu de **5** → 2 bytes d'args rendus en GLYPHES parasites + couleurs perdues. Writers byte-level DÉJÀ dans le repo : pokenav_conditions.ts:454-458, pokenav_conditions_gfx.ts:652, pokenav_ribbons_*/conditions_search (via encodeOwText, tokens droppés) |
| PALETTE | ✅ no-op | 1004-1006 | décomp = skip arg sans action → default port (3 bytes) équivalent |
| FONT | ✅ | 1007-1010 | subStruct.fontId ✓ (glyph data par font) |
| RESET_FONT | 🟠 | 1011-1012 | 0-arg ; default port mange 1 byte de trop — aucun texte ne l'utilise (grep data = 0) |
| PAUSE | 🟡 | 1013-1017 | ✓ mais retour RENDER_UPDATE vs RENDER_REPEAT décomp → pause +1 frame |
| PAUSE_UNTIL_PRESS | ✅ | 1018-1022 | WAIT sans ▼ ✓, reset autoScrollDelay ✓ |
| **WAIT_SE** | 🔴 | 1023-1025 | consommé PUIS `RENDER_REPEAT` (text.ts:888-891) au lieu de `state=WAIT_SE` — l'état est porté (text.ts:792) et `IsSEPlaying` branché (decomp-globals.ts:1059) mais JAMAIS atteint. Textes solo : level-up (battle_message.c:60), apprend capacité (:61), capture (:473-474), évolution (:1269) |
| PLAY_BGM | 🟡 | 1026-1032 | u16 LE ✓ mais via `__m4aSongNumStart(id, **false**)` (loop forcé off) au lieu de PlayBGM |
| ESCAPE | ⛔ | 1033-1036 | décomp rend le byte \|0x100 ; port skip. Seul texte {ESCAPE 4}=gText_BattleSwitchWhich4 non référencé → quasi-inatteignable |
| PLAY_SE | ✅ | 1037-1043 | u16 LE ✓ (via global __PlaySE — hook harness) |
| SHIFT_RIGHT / SHIFT_DOWN | ⛔ action | 1044-1051 | skip 3 bytes ✓ mais currentX/currentY PAS déplacés. Aucun texte FR trouvé (grep strings/data = 0) → latent |
| FILL_WINDOW | ⛔ | 1052-1056 | décomp 2 bytes + FillWindowPixelBuffer+reset X/Y ; port default mange 1 byte + aucune action. Writer byte : mauville_old_man.c:230 (chant du Barde — sous-système bloqué de toute façon) |
| PAUSE_MUSIC / RESUME_MUSIC | ⛔ | 1057-1062 | 0-arg, port mange 1 byte + pas d'action m4a. Seul texte = gText_EndedWithXUnitsPowder (berry_crush = LINK, hors-scope) |
| CLEAR | ✅ | 1063-1072 | ClearTextSpan + advance ✓ (fix résidus Match Call) ; 🟡 `continue` au lieu de RENDER_PRINT (pacing) |
| SKIP | ✅ | 1073-1076 | currentX = x + n ✓ |
| CLEAR_TO | ✅ | 1077-1090 | efface jusqu'à x+n ✓ (vendeuses/prix {CLEAR_TO 78} strings.c:649-651 OK) |
| MIN_LETTER_SPACING | ✅ | 1091-1093 | minLetterSpacing + padding ClearTextSpan au rendu (c:1149-1158) ✓ |
| JPN / ENG | ⛔ | 1094-1099 | 0-arg, default mange 1 byte — FR ⚪ inatteignable |

## CHAR_* spéciaux

| Char | Statut | C:ligne | Détail |
|---|---|---|---|
| CHAR_NEWLINE | 🟡 | 968-971 | port : `currentY += LINE_HEIGHT (16)` **hardcodé** (text.ts:842) vs `maxLetterHeight(font) + lineSpacing` — faux pour FONT_SHORT (14)/SMALL (12)/SMALL_NARROW (8) et ignore lineSpacing (ex. desc objet PC P5 lineSpacing=1 → 15 attendu, 16 rendu) |
| PLACEHOLDER_BEGIN | ⛔ | 972-974 | décomp skip 2 bytes ; port : byte 0xFD tombe dans le chemin glyphe → glyphe 253 parasite SI non-expansé (défensif — normalement StringExpandPlaceholders passe avant) |
| CHAR_PROMPT_CLEAR (\p) | ✅ | 1102-1105 | ▼+attente → FillWindowPixelBuffer + reset X/Y ✓ |
| CHAR_PROMPT_SCROLL (\l) | ✅ | 1106-1109 | ▼+attente → scroll pixel progressif `sWindowVerticalScrollSpeeds[GetPlayerTextSpeed()]` = [1,2,4] px/frame ✓ + reste ✓ (text.ts:775-789) — fidèle |
| CHAR_EXTRA_SYMBOL | ✅ | 1110-1113 | glyphId 0x100\|sym → même chemin glyphe ✓ (widths/glyphs 512 couverts) |
| CHAR_KEYPAD_ICON | ✅ | 1114-1118 | DrawKeypadIcon + `width + letterSpacing` ✓ + RENDER_PRINT ✓ |
| EOS | ✅ | 1119-1120 | RENDER_FINISH |
| CHAR_DYNAMIC | ⚪ | — | décomp RenderText ne le gère pas non plus (expansion en amont) — parité |

## 🚨 MANQUES CRITIQUES (visibles en jeu)

1. **{WAIT_SE} no-op** — à CHAQUE montée de niveau/capture/évolution, le décomp attend la fin de la fanfare avant le `\p` (battle_message.c:60/61/473/1269) ; le port enchaîne immédiatement. Fix trivial : poser `state = RENDER_STATE_WAIT_SE` (l'état + IsSEPlaying existent déjà, text.ts:792).
2. **EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW absent du renderer** — mines ARMÉES : `pokenav_conditions.ts:454-458` écrit déjà les séquences 5-bytes (transpile récent) → au câblage de l'écran Condition, 2 glyphes parasites + couleurs fausses par ligne de lieu. Idem menu_specialized.c:925/982/1027 (à transcrire). PSS l'a contourné (triplets {COLOR}{HIGHLIGHT}{SHADOW}, pokemon_storage_system.ts:3691), le combat aussi (strings plaines) — deux rustines à purger après fix.
3. **CHAR_NEWLINE interligne hardcodé 16** — toute string multi-ligne en FONT_SHORT/SMALL/SMALL_NARROW a un interligne faux (+ lineSpacing ignoré : desc objets PC = 1px d'écart au décomp).
4. **AddTextPrinterParameterized5 non porté** (menu.ts:849) — callers solo : desc objets PC (pokemon_storage_system.c:9189, rustine locale qui PERD lineSpacing=1) et multichoix déroulant (field_specials.c:3190).
5. **Pacing codes de contrôle** — décomp : chaque code (COLOR, NEWLINE…) consomme un slot de délai (RENDER_REPEAT re-entre dans la branche delay, c:947-961) ; port : gratuits, + `autoScroll→delayCounter=3` absent, + PAUSE +1 frame. Typewriter légèrement plus rapide sur textes riches en codes.
6. (cosmétique) **FONT_BOLD non extrait** → chiffres PV des healthboxes DOUBLES en font normale (RenderTextHandleBold fallback).

## DONNÉES / TABLES

| Table | Statut | Source port |
|---|---|---|
| sFontInfos (c:119-221) | ✅ | text.ts:326 — 10 fonts, valeurs identiques vérifiées |
| sMenuCursorDimensions (c:223) | ✅ | text.ts:360 |
| sDownArrowTiles / sDarkDownArrowTiles (c:71-72) | ✅ | down_arrow.json / down_arrow_alt.json (alt = Pokénav/combat via useAlternateDownArrow ✓) |
| sUnusedFRLG*DownArrow (c:73-74) | ⚪ | unused décomp |
| sDownArrowYCoords (c:75) | ✅ | text.ts:1444 [0,1,2,1] + delay 8 (c:832) |
| sWindowVerticalScrollSpeeds (c:76-80) | ✅ | text.ts:624 [1,2,4] |
| sGlyphWidthFuncs (c:82-93) | ✅ | text.ts:411 (braille omis, effet ≡ NULL) |
| sKeypadIcons + sKeypadIconTiles (c:100-117) | ✅ | text.ts:433 + keypad_icons.json (13 icônes croppées offline, extract-keypad-icons.mjs) |
| gFont*LatinGlyphWidths (fonts.c) | ✅ | font-widths.json — **512/512 entrées par font** (small/normal/short/narrow/smallnarrow), extra-symbols couverts |
| gFont*LatinGlyphs | ✅ émulé | latin.latfont.json — 512 glyphes/font, cellules 16×16 pré-décodées |
| sFontBoldJapaneseGlyphs (c:237) | ⛔ | non extrait (→ manque n°6) |
| sFontHalfRowOffsets/LookupTable (c:41,51) | ⚪ émulé | remap au blit |
| gTextFlags (c:49) | 🟡 | text.ts:1487 — `canABSpeedUpPrint` init **true** vs 0 décomp (writers champ OK : field_message_box/battle_controllers/match_call) |
| gDisableTextPrinters (c:47) | ⛔ | absent — users : mauville_old_man.c:454-466 (Barde) |
| sTextSpeedFrameDelays (menu.c:77) | ✅ | menu.ts:54 [8,4,1] ; GetPlayerTextSpeed/Delay + forceMidTextSpeed ✓ (menu.ts:62-74) |

## RUSTINES À PURGER (après fix moteur)

1. `pokemon_storage_system.ts:125` — P5 locale (perd letterSpacing/lineSpacing) → porter le vrai `AddTextPrinterParameterized5` dans menu.ts.
2. `pokemon_storage_system.ts:3691-3697` — triplets `{COLOR}{HIGHLIGHT}{SHADOW}` contournant COLOR_HIGHLIGHT_SHADOW → revenir au code 5-bytes 1:1.
3. `battle_controller_player.ts:911`, `battle_script_commands.ts:3313/3351/9884`, `evolution_scene.ts:1064` — textes combat en JS-strings plaines SANS `{PALETTE 5}{COLOR_HIGHLIGHT_SHADOW …}` (« dette douce » annotée) → re-encoder byte-level quand PALETTE/CHS gérés.
4. `text.ts:728-730` (`__noClearSpan`/`__traceClearSpan`) + `text.ts:1162-1163` (`__traceATP`) — sondes bisect à retirer.
5. `text.ts:899-908` — PLAY_BGM/PLAY_SE via globals `__m4aSongNumStart`/`__PlaySE` (+ loop=false forcé) → imports directs PlayBGM/PlaySE.
6. `text.ts:700` — `_fillCurGlyph` width `|| 3` (valeur magique sans précédent décomp).
7. `text.ts:1488` — `canABSpeedUpPrint: true` par défaut (décomp = 0).
8. `src/engine/ui/bitmap-font.ts` — renderer texte Phaser parallèle (pixel-scan widths en fallback), encore importé par `src/engine/field/region-map.ts` → dissoudre au profit de RenderText.
9. `text.ts:1863-1865` — `encodeStringForFont` DROPPE silencieusement les tokens inconnus ({PALETTE N}, {COLOR_HIGHLIGHT_SHADOW A B C}, {ESCAPE N}…) → au minimum un `console.warn` (masque les codes non portés).
10. `scrcmd.ts:700-701` — `ScrCmd_messageautoscroll` no-op qui AVALE le message (décomp = ShowFieldAutoScrollMessage) → messages muets au Contest Lobby de Nénucrique (solo).

## CALL-SITES ORPHELINS

- `RENDER_STATE_WAIT_SE` (text.ts:792) : état porté + IsSEPlaying branché, JAMAIS atteint (cf. manque n°1).
- `TextPrinterWaitAutoMode`/`autoScrollDelay` : morts — `gTextFlags.autoScroll` n'est jamais posé `true` dans le port (décomp : scrcmd.c:1291 messageautoscroll, battle recorded, berry_crush) ; `ShowFieldAutoScrollMessage` (field_message_box.c:91) non porté.
- `DrawDownArrow` (c:902) : mystery_gift_menu uniquement → hors-scope solo, ne pas porter.
- `AddTextPrinterParameterized5` décomp : field_specials.c:3190 + pokemon_storage_system.c:9189 (solo) attendent le port réel.
- `gDisableTextPrinters` : attendu par mauville_old_man (Barde) — absent.
- `GetKeypadIconTileOffset`/`GetKeypadIconHeight`/`SaveTextColors`/`RestoreTextColors` : 0 caller décomp hors text.c — omission sans impact.
- `sTextColor_Headers`/`sTextColor_MenuInfo` (text.ts:1427-1433) : data de main_menu.c hébergée dans text.ts (foyer à relocaliser, non-bloquant).
