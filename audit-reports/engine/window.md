# AUDIT MOTEUR — window.c & text_window.c (2026-07-16)

Réf : `D:/Projet 1/decomps/pokeemeraude/src/window.c` (715 l.) + `src/text_window.c` (198 l.)
Ports : `src/window.ts` (1268 l.) + `src/text_window.ts` (290 l.). Audit LECTURE SEULE, corps comparés ligne à ligne (blit.c lu pour les sémantiques colorKey).

---

## SECTION A — window.c → src/window.ts

**Compteurs (30 fonctions + 5 globals)** : ✅ 14 · 🟡 6 · 🟠 1 · 🔴 1 · ⛔ 8 (dont 7 morts/absorbés sans impact) · globals : 2 ✅-adaptés, 3 ⛔-absorbés.
**Verdict A : cœur solide et fidèle (fill/scroll/blit-8bpp/tilemap 1:1), mais 2 primitives absentes crashent des écrans câblés (PutWindowRectTilemap, WriteSequenceToBgTilemapBuffer) et les blits 4bpp ignorent la transparence colorKey=0 du décomp.**

### Note d'architecture (adaptation pixelBuffer — cadre de lecture)
Le port remplace `tileData` (4bpp tile-packed, 32 o/tuile) par un `pixelBuffer` linéaire 1 octet/pixel (window.ts:15-30). Toutes les primitives re-adressent en conséquence ; l'équivalence est vérifiée au NET EFFECT (mêmes pixels, mêmes offsets tuile au flush 4bpp `copyPixelBufferToVram` window.ts:151-192, qui repacke 2 px/octet low-nibble-first = layout GBA exact). Le tilemap n'a pas de « VRAM copy » : le compositor lit le buffer live (`CopyBgTilemapBufferToVram` = no-op assumé, window.ts:1086-1089) → les écritures tilemap sont visibles SANS CopyWindowToVram (visibilité anticipée d'une frame, écart doctrinal connu).

### Tableau A
| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `DummyWindowBgTilemap` | ⛔-absorbé | window.c:21 | — | Marqueur d'alloc ; sans objet (GC/tilemap harness toujours alloué). |
| `InitWindows` | ✅ | window.c:26-107 | src/window.ts:256-266 | Sentinelle `bg==0xFF` break 1:1 (c:51). Adaptation signature : retourne `number[]` d'ids au lieu de `bool16` (callers adaptés). Reset compteur d'ids via FreeAllWindowBuffers = équivalent au wipe gWindows[] (c:45-49). Branches `gWindowTileAutoAllocEnabled` omises = **dead code décomp** (bg.c:45 `=0`, seul écrivain `ResetBgsAndClearDma3BusyFlags` bg.c:309, aucun appel avec 1 dans tout le repo). |
| `AddWindow` | 🟡 | window.c:109-179 | src/window.ts:318-323 | Alloc OK. DIVERGENCES : (a) pas de limite `WINDOWS_MAX=32` (window.h:4) ni retour `WINDOW_NONE=0xFF` plein ; (b) ids **monotones jamais réutilisés** (`nextWindowId++`) vs décomp « premier slot bg==0xFF » → id 255 possible sans InitWindows intermédiaire = collision avec la sentinelle `WINDOW_NONE` chez les callers (`winId != WINDOW_NONE`). Latent (les écrans re-InitWindows), à durcir. |
| `AddWindowWithoutTileMap` | ⛔ | window.c:181-216 | — | Absent. Seul caller décomp = save_failed_screen.c (non porté) → pas d'orphelin vivant. |
| `RemoveWindow` | ✅ | window.c:218-241 | src/window.ts:339-342 | Splice = net effect du reset dummy + Free (GC). Le décomp ne touche pas le tilemap non plus. |
| `FreeAllWindowBuffers` | ✅ | window.c:243-264 | src/window.ts:344-347 | Reset complet (+ compteur ids, nécessaire au modèle monotone). |
| `CopyWindowToVram` | 🟡 | window.c:266-284 | src/window.ts:415-420 | **`mode` ignoré** : décomp COPYWIN_MAP = tilemap seul / GFX = tiles seules / FULL = les 2 ; port copie TOUJOURS les tiles (et le tilemap est live). Conséquence : `COPYWIN_MAP` flushe des gfx que le décomp ne toucherait pas → peut écraser des tuiles posées par `LoadBgTiles` direct sur la même plage baseBlock. Callers MAP vivants : pokenav_list.ts:229/529/714, pokenav_match_call_gfx.ts:1028, pokenav_conditions_search_results.ts:715, pokenav_ribbons_list.ts:686, battle_script_commands.ts:10833. |
| `CopyWindowRectToVram` | 🟠 | window.c:286-317 | src/pokenav_list.ts:44-49 (shim local) | Absent du moteur ; pokenav_list (seul caller décomp, pokenav_list.c:721/748/769) définit un shim qui re-copie la fenêtre ENTIÈRE. Même rendu pour ces call-sites (rect ⊂ full, buffer cohérent) mais l'arithmétique rect 1:1 (c:296-301) n'existe nulle part → à centraliser dans window.ts. |
| `PutWindowTilemap` | ✅ | window.c:319-332 | src/window.ts:471-475 (`writeWindowTilemap` :195-223) | `tileId = baseTile + baseBlock + ty*w + tx | pal<<12` = exactement WriteSequence(delta 1) du décomp (c:325 BG_ATTR_BASETILE + baseBlock) ; baseTile aligné avec LoadBgTiles (bg.c:382, cf. decomp-globals.ts:328-332). |
| `PutWindowRectTilemapOverridePalette` | ⛔ | window.c:334-354 | — | Seul caller décomp = `ListMenuInitInRect` (list_menu.c:375-388), **jamais appelée** dans tout le décomp (header seul) → mort. |
| `ClearWindowTilemap` | 🟡 mineur | window.c:357-369 | src/window.ts:477-481 | Décomp écrit tuile `gTransparentTileNumber`(=0) avec `paletteNum` de la fenêtre ; port écrit l'entry 0 (palette 0). Identique à l'écran si la tuile 0 du charbase est vierge ; sinon la teinte diffère (cf. leçon « tile 0 réservé » `8c820d7a9`). |
| `PutWindowRectTilemap` | 🔴 STUB | window.c:371-391 | src/pokenav_region_map.ts:66 | **`__wireTodo('PutWindowRectTilemap')` = Proxy qui THROW à l'appel** (src/engine/wire-todo.ts:8). Call-sites câblés : pokenav_region_map.ts:576/585 (1:1 pokenav_region_map.c:540/548) → l'info-window de la carte Pokénav lèvera une exception au draw. À transcrire dans window.ts (boucle par ligne, currentRow += width, c:377-390). |
| `BlitBitmapToWindow` | 🟡 | window.c:393-396 | src/window.ts:533-566 | Adressage tuiles source 1:1. **DIVERGENCE : le décomp passe par `BlitBitmapRect4Bit(..., colorKey=0)` (window.c:411 → blit.c:61 `if (toOrr != colorKey)`) = pixel source 0 NON copié (transparent)** ; le port écrit TOUS les pixels, 0 compris (window.ts:561-562) → un blit efface le fond sous ses pixels 0 au lieu de le préserver. Aujourd'hui peu visible (destinations le plus souvent PIXEL_FILL(0) : item_menu.ts:875/884, pokedex.ts:466, pokemon_summary_screen.ts:1057, map_name_popup.ts:383, party_menu.ts:669, bag-screen.ts:913) mais faux sur fond ≠ 0. NB : text.ts:459-479 (DrawKeypadIcon) implémente le skip 0 correctement — précédent interne à imiter. |
| `BlitBitmapRectToWindow` | 🟡 | window.c:398-412 | src/window.ts:574-606 | Même divergence colorKey=0 (mêmes lignes port :601-602). Caller : item_menu.ts:1398, trainer_card.ts:529 (indirect). |
| `BlitBitmapRectToWindowWithColorKey` | ⛔ | window.c:414-428 | — | `UNUSED` dans le décomp lui-même. |
| `FillWindowPixelRect` | ✅ | window.c:430-439 | src/window.ts:608-619 (`fillWindowPixelRect` :68-81) | blit.c:73-104 écrit le LOW nibble de fillValue sur les 2 parités (toOrr1=`fill<<4` tronqué u8) = le masque port `& 0x0F` est exact. Clamps dst 1:1 (blit.c:81-87). |
| `CopyToWindowPixelBuffer` | ✅ | window.c:441-447 | src/window.ts:386-413 | size>0 → CpuCopy16 = dépaquetage tuile→linéaire équivalent ; size==0 → décomp LZ77UnCompWram, port copie l'asset PRÉ-décompressé (adaptation légitime), clampé à la fenêtre. |
| `FillWindowPixelBuffer` | ✅ | window.c:450-454 | src/window.ts:349-353 (:62-65) | CpuFastFill8(fillValue) ≡ fill(low nibble) pour PIXEL_FILL(n) (les 2 nibbles = n). |
| `ScrollWindow` | ✅ | window.c:478-523 | src/window.ts:728-760 | Macros MOVE_TILES_DOWN/UP (c:456-476) décodées : net effect = shift de `distance` rangées px + fill du vide (dir 0 = up/fill bas ; dir 1 = down/fill haut ; dir 2 = no-op c:521). Port linéaire strictement équivalent, y compris distance ≥ hauteur → fill total (srcOffset≥size). Consommé 1:1 par list_menu.ts:617/627 (list_menu.c:794/808) et text.ts:774-785 (text.c:1196/1201, via `scrollWindow` bas niveau :50-59). |
| `CallWindowFunction` | ✅ | window.c:525-529 | src/window.ts:500-508 | 6 champs du template passés 1:1 (famille Draw*/Clear*Frame de menu.ts). |
| `SetWindowAttribute` | ⛔ | window.c:531-556 | — | Callers décomp : save_failed_screen.c (non porté) + list_menu.c:495-496 (`ChangeListMenuCoords` marquée `// unused`) → pas d'orphelin vivant. À transcrire avec save_failed_screen. |
| `GetWindowAttribute` | 🟡 mineur | window.c:558-581 | src/window.ts:280-294 | 7 attributs 1:1 ; **case `WINDOW_TILE_DATA`(7) absente** (retourne 0). Adaptation dédiée : `GetWindowPixelBuffer` (:368-371) + `ExtractWindowTiles4bpp` (:299-316) — callers adaptés (item_menu.ts:1183, battle_interface.ts:2658, pokedex_cry_screen.ts:119, pokenav_list.ts:64). |
| `GetNumActiveWindowsOnBg` | ⛔-absorbé | window.c:583-593 | — | Comptage pour lifecycle d'alloc → sans objet (GC). |
| `DummyWindowBgTilemap8Bit` | ⛔-absorbé | window.c:595 | — | idem. |
| `AddWindow8Bit` | ✅ (+rustine) | window.c:600-645 | src/window.ts:332-337 | 64 o/tuile ≡ 1 o/pixel natif. Rustine : `needsFlush=false` post-création pour neutraliser l'auto-flush (voir RUSTINES) — le décomp ne copie rien à la création, donc le NET EFFECT redevient 1:1. |
| `FillWindowPixelBuffer8Bit` | ✅ | window.c:647-655 | src/window.ts:455-460 | fill byte plein (masque 0xFF). |
| `FillWindowPixelRect8Bit` | ✅ | window.c:657-666 | src/window.ts:678-701 | = FillBitmapRect8Bit (blit.c:184-209) net effect, clamps compris. |
| `BlitBitmapRectToWindow4BitTo8Bit` | ✅ (commentaire FAUX) | window.c:668-682 | src/window.ts:630-672 | Décomp passe **colorKey=0** (c:681) → blit.c:157-178 SKIPPE les nibbles 0. Le port skippe pixel 0 (:667) = **comportement 1:1**… mais son commentaire (:626-666) prétend « décomp colorKey 0xFF copie tout » et étiquette le skip « ADAPTATION RENDERER (≠ décomp) » — faux, à corriger (garder le code). `palOffsetBits = paletteNum*16` 1:1 (blit.c:119). |
| `CopyWindowToVram8Bit` | ✅ | window.c:684-702 | src/window.ts:464-469 (`copyPixelBufferToVram8Bit` :429-451) | 64 o/tuile, layout = decodeTile8bpp. Même conflation de mode que la voie 4bpp (MAP jamais utilisé par le seul caller PC storage). |
| `GetNumActiveWindowsOnBg8Bit` | ⛔-absorbé | window.c:704-714 | — | idem :583. |

### Globals A
| Donnée | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `gTransparentTileNumber` | ⛔-absorbé | window.c:8 | — | « set to 0 and never changed » (c:7) → constante 0 inlinée dans ClearWindowTilemap port. |
| `gWindowBgTilemapBuffers[4]` | ⛔-absorbé | window.c:9 | — | Le harness alloue les tilemaps BG en permanence (`rt.gba.bg(n).tilemap`) ; lifecycle alloc/Free sans objet. |
| `gWindows[32]` | ✅-adapté | window.c:12 | src/window.ts:144 | Array + `find(id)` au lieu d'index direct (frontière documentée window.ts:498-499). Cf. réserve ids monotones (AddWindow). |
| `sWindowPtr` / `sWindowSize` | ⛔-absorbés | window.c:13-14 | — | Locaux de CopyWindowToVram8Bit dans le port. |
| `sDummyWindowTemplate` | ✅ | window.c:19 | include/window.ts:36-38 | `DUMMY_WIN_TEMPLATE` bg=0xFF 1:1 (window.h:38-41), leaf anti-TDZ. |

---

## SECTION B — text_window.c → src/text_window.ts

**Compteurs (12 fonctions + 3 groupes de tables)** : ✅ 10 · 🟡 1 · 🔴 1 · tables : 2 ✅ · 1 🔴.
**Verdict B : miroir quasi complet et fidèle (bordures, frames utilisateur, message box) ; UNE dette réelle — `GetTextWindowPalette` rend toujours `null` faute d'assets `text_pal1/3/4.pal`, no-op silencieux vivant dans le PC storage.**

### Tableau B
| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `GetWindowFrameTilesPal` | ✅ | text_window.c:85-91 | src/text_window.ts:81-87 | `id>=20 → frame 0` 1:1. ⚠️ renvoie des buffers VIDES sans warn si preload manqué (silence contra Règle 3 ; en pratique préchargé partout — voir preload). Consommé 1:1 : main_menu.ts:264, option_menu.ts:30, mon_markings.ts:76 (= callers décomp main_menu/option_menu/mon_markings ✅). |
| `LoadMessageBoxGfx` | ✅ | text_window.c:93-97 | src/text_window.ts:94-125 | LoadBgTiles(bg, gMessageBox_Gfx, 0x1C0) + palette 1:1 ; warn console si asset manquant (+ fallback gris hardcodé — rustine). Asset `/decomp/em/text_window/message_box.png` présent (56×16 = 14 tuiles = 0x1C0 ✓). |
| `LoadUserWindowBorderGfx_` | ✅ | text_window.c:99-102 | src/text_window.ts:129-131 | Wrapper 1:1. |
| `LoadWindowGfx` | ✅ | text_window.c:104-108 | src/text_window.ts:139-144 | 0x120 (9 tuiles) + 16 couleurs 1:1. |
| `LoadUserWindowBorderGfx` | ✅ | text_window.c:110-113 | src/text_window.ts:150-152 | via `gSaveBlock2Ptr.optionsWindowFrameType` 1:1. |
| `DrawTextBorderOuter` | ✅ | text_window.c:115-131 | src/text_window.ts:156-171 | Les 8 FillBgTilemapBufferRect vérifiés cellule par cellule (tileNum+0..8 sans +4, coords/tailles identiques). |
| `DrawTextBorderInner` | ✅ | text_window.c:133-149 | src/text_window.ts:177-192 | 8 rects width-2/height-2 vérifiés 1:1. Caller décomp = union_room_chat (hors solo) — présent pour complétude. |
| `rbox_fill_rectangle` | 🟡 | text_window.c:151-160 | src/text_window.ts:198-206 | Appel recopié 1:1, MAIS la palette **0x11 (=17)** a un sens spécial dans le décomp : `FillBgTilemapBufferRect` → `WriteSequenceToBgTilemapBuffer(...palette,0)` → `CopyTileMapEntry` default = **entry verbatim** (bits palette = ceux du tileNum, soit 0x0000) (bg.c FillBgTilemapBufferRect + CopyTileMapEntry cases 0-15/16/17). Le port `FillBgTilemapBufferRect` (window.ts:1075) fait `palNum & 0xF` = palette 1 → entry 0x1000. Invisible si tuile 0 vierge ; sémantique 16/17 à router vers `CopyTileMapEntry` (déjà porté window.ts:1163-1179 !). Aucun caller src actuel (callers décomp : use_pokeblock non porté, reste hors solo). |
| `GetTextWindowPalette` | 🔴 | text_window.c:162-185 | src/text_window.ts:212-219 | Switch 0x00/0x10/0x20/0x30/0x40 transcrit, mais lit l'asset **`sTextWindowPalettes` qui n'est JAMAIS posé** dans assetCache (preload ne le charge pas) → **retourne toujours `null`**. Impact vivant : pokemon_storage_system.ts:5521/5610 (1:1 pokemon_storage_system.c:8213/8319) `LoadPalette(GetTextWindowPalette(3)!, BG_PLTT_ID(13), 32)` → LoadPalette null-guard (decomp-globals.ts:304) = **no-op SILENCIEUX** : la palette 13 du texte MultiMove PC n'est jamais chargée. |
| `GetOverworldTextboxPalettePtr` | ✅ | text_window.c:187-190 | src/text_window.ts:223-227 | = asset `gMessageBox_Pal` (préchargé). |
| `LoadUserWindowBorderGfxOnBg` | ✅ | text_window.c:193-197 | src/text_window.ts:235-240 | 1:1 (caller décomp pokemon_jump = hors solo ; présent pour complétude). |

### DONNÉES/TABLES
| Table | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `gTextWindowFrame1_Gfx` + `sTextWindowFrame2..20_Gfx/_Pal` | ✅ | text_window.c:9-49 | text_window.ts:57-62 + 249-286 | INCBIN → PNG `/decomp/em/ui/text_window/1..20.png` (tous présents sur disque), clés assetCache au naming décomp exact, préchargées au boot (BirchRuntimeScene.ts:161, TestOverworldScene.ts:1230) et par les écrans (option_menu, party_menu, wallclock, starter_choose). |
| `sTextWindowPalettes[5][16]` | 🔴 | text_window.c:51-58 | text_window.ts:213 (lecture seule) | **Données jamais extraites ni chargées** : `public/decomp/em/ui/text_window/` ne contient QUE `text_pal2.pal` (manquent `text_pal1/3/4.pal` ; la banque 0 = pal de message_box.png existe ailleurs). `static-tables/text_window.json` ne porte que les refs INCGFX, pas les couleurs. → extraire les .pal + assembler le buffer 5×16 + `assetCache.set('sTextWindowPalettes', …)` dans preloadTextWindowFrames. |
| `sWindowFrames[20]` | ✅ | text_window.c:60-82 | text_window.ts:81-87 (`frameAssetKeys`) | Mapping frame id → asset N+1 1:1 (frame 0 = 1.png). |
| `gMessageBox_Gfx/_Pal` (graphics.c, consommés ici) | ✅ | text_window.c:95/189 | text_window.ts:270-282 | Préchargés (idempotent). |

---

## 🚨 MANQUES CRITIQUES (impact en jeu)
1. **`WriteSequenceToBgTilemapBuffer` n'existe nulle part dans le moteur** (bg.c, primitive du système fenêtres) alors que `match_call.ts:1971/2131` (1:1 match_call.c:1285/1452, écran d'appel Match Call OVERWORLD) l'appelle en identifiant nu — le `@ts-nocheck` de match_call.ts:1 masque l'erreur tsc (vérifié par l'API compilateur : symbole NON RÉSOLU) → **ReferenceError au premier draw de la fenêtre d'appel OW + icône Pokénav qui tourne**. Une impl locale privée existe déjà (pokemon_storage_system.ts:119) mais avec `palNum & 0xF` : ces call-sites passent palette **17** (verbatim, tileNum embarque `0xF<<12`) → il faut la version 1:1 avec sémantique CopyTileMapEntry 0-15/16/17.
2. **`PutWindowRectTilemap` = stub `__wireTodo` qui THROW** (pokenav_region_map.ts:66, appelé :576/585 = pokenav_region_map.c:540/548) → l'info-window de la carte Pokénav lèvera une exception à l'affichage (wire-todo.ts:8). Transcription window.c:371-391 triviale avec `writeWindowTilemap` existant.
3. **`GetTextWindowPalette` → toujours `null`** (assets text_pal1/3/4.pal jamais extraits, clé `sTextWindowPalettes` jamais posée) → PC storage MultiMove : palette BG 13 jamais chargée, **no-op silencieux** (contra Règle 3 — aucun hurlement console). Aussi bloquant pour les futurs ports hall_of_fame.c:704, battle_records.c:494, naming_screen (rustine locale en place).
4. **Blits 4bpp sans transparence colorKey=0** : `BlitBitmapToWindow`/`BlitBitmapRectToWindow` copient les pixels 0 que le décomp skippe (blit.c:61) → tout blit d'icône efface le fond de fenêtre sous ses pixels 0. Aujourd'hui masqué (fonds PIXEL_FILL(0)), garanti faux sur fond coloré (ex. lignes de liste PIXEL_FILL(1)).
5. **`CopyWindowToVram` ignore `mode` + auto-flush `flushDirtyWindows`** (decomp-runtime.ts:2027-2030, chaque frame) : COPYWIN_MAP re-copie des gfx, et toute fenêtre `needsFlush` part en VRAM sans appel du jeu → risques de clobber sur plages baseBlock partagées (la rustine AddWindow8Bit `needsFlush=false` window.ts:325-337 en est le symptôme documenté : cadre YesNo 0xB-0x13 vs MultiMove baseBlock 0xA).

## RUSTINES À PURGER (après fix moteur)
- `src/pokenav_list.ts:44-49` — shim local `CopyWindowRectToVram` full-copy → remplacer par la vraie transcription rect (window.c:286-317) dans window.ts.
- `src/pokenav_region_map.ts:66` — `__wireTodo('PutWindowRectTilemap')` → import depuis window.ts une fois transcrite.
- `src/pokemon_storage_system.ts:114-124` — `GetBgAttribute` local hardcodé `return 0` + `WriteSequenceToBgTilemapBuffer` local (sans sémantique palette 16/17) → hisser la version 1:1 dans window.ts (ou bg miroir) et l'exporter (match_call en a besoin).
- `src/window.ts:626-668` — commentaire « ADAPTATION RENDERER (≠ décomp) » de BlitBitmapRectToWindow4BitTo8Bit **factuellement faux** (le skip 0 EST le décomp, window.c:681 colorKey=0) : corriger le commentaire, garder le code.
- `src/window.ts:332-337` — hack `needsFlush=false` d'AddWindow8Bit (dépend de l'adaptation auto-flush ; à réévaluer si CopyWindowToVram respecte un jour les modes).
- `src/text_window.ts:64-74` — `writePalette` = doublon de `LoadPalette` (harness/runtime/decomp-globals.ts:290, désormais exposé) → substituer.
- `src/text_window.ts:110-124` — fallback palette grise hardcodée de LoadMessageBoxGfx (le warn suffit).
- `src/naming_screen.ts:531-536` — chargement direct `text_pal2.pal` en bypass de `GetTextWindowPalette(2)` (fix session 96) → re-router après extraction des .pal.
- `src/match_call.ts:1` — `@ts-nocheck` masque des identifiants non résolus (a caché le manque #1) ; à lever après câblage.

## CALL-SITES ORPHELINS (code décomp porté chez nous, appel window.c/text_window.c absent/inerte)
| Décomp | Port | État |
|---|---|---|
| match_call.c:1285 (`MatchCall_DrawWindow`) + :1452 (`Task_SpinPokenavIcon`) → WriteSequenceToBgTilemapBuffer | match_call.ts:1971 / 2131 | Identifiant **non résolu** → ReferenceError runtime au 1er appel OW. |
| pokenav_region_map.c:540/548 → PutWindowRectTilemap | pokenav_region_map.ts:576/585 | Stub __wireTodo → throw à l'usage. |
| pokemon_storage_system.c:8213/8319 → GetTextWindowPalette(3) | pokemon_storage_system.ts:5521/5610 | Appel présent mais résultat `null` → LoadPalette no-op silencieux. |
| naming_screen.c:1891 → GetTextWindowPalette(2) | naming_screen.ts:531-536 | Contourné par chargement direct (rustine, rendu correct). |
| hall_of_fame.c:704 / battle_records.c:494 → GetTextWindowPalette(1)/(0) | hall_of_fame.ts / battle_records.ts | Ports = seeding-only (41/45 l.) — écrans non portés, PAS un orphelin actif ; dépendront du fix #3. |
| save_failed_screen.c → AddWindowWithoutTileMap + SetWindowAttribute | — | Écran non porté (pas d'orphelin). |
| list_menu.c:382 → PutWindowRectTilemapOverridePalette | — | Dans `ListMenuInitInRect`, jamais appelée dans le décomp (morte). |
