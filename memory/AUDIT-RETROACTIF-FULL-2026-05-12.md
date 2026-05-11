# Audit rétroactif 1:1 décomp — 2026-05-12

**Auditeur** : Claude (Opus 4.7 1M)  
**Branche** : `upd2` (HEAD `0cc98619`)  
**Scope** : tous fichiers `src/engine/**.ts` + `src/scenes/**.ts` vs `decomps/pokeemeraude/src/*.c`  
**Mode** : READ-ONLY pour la Phase 1.

---

## Stats globales

- **Total fichiers TS dans `src/engine/`** : 111
- **Total fichiers `*.c` décomp** : 315
- **Total auto-files `decomp-data/auto/src-all/`** : 296
- **Fichiers avec écarts détectés (audit Phase 1)** : ~20 prioritaires + N restants
- **Hacks bloquants comptés** : 7 (= `_syncSubspriteOam` hook, `setFieldCameraSuspended`, save/restore VRAM/palettes, etc.)
- **Hardcodes (strings/labels)** : 50+ dans party-screen + pokedex-screen + trainer-card-screen + start-menu
- **Stubs MVP/Phase 6+/TODO** détectés : 35+ (cf. grep)
- **Erreurs transpiler dans auto-files** : 121 (= `specials-auto.ts` + `scrcmd-auto.ts` + `fieldeffect-auto.ts`)

---

## Catégorie A — Bag screen (BLOQUE)

### `src/engine/bag-screen.ts` ↔ `decomps/pokeemeraude/src/item_menu.c`

**Pattern attendu décomp** (item_menu.c:617 GoToBagMenu + 672 CB2_Bag) :
```
GoToBagMenu :
  gBagMenu = AllocZeroed(sizeof *gBagMenu)
  gBagPosition.exitCallback = exitCallback
  SetMainCallback2(CB2_Bag)

CB2_Bag :
  while (!SetupBagMenu()) ;

SetupBagMenu state machine 0..20 :
  0: SetVBlankHBlankCallbacksToNull + ClearScheduledBgCopiesToVram
  1: ScanlineEffect_Stop
  2: FreeAllSpritePalettes
  3: ResetPaletteFade + bufferTransferDisabled=TRUE
  4: ResetSpriteData
  5: (link skip)
  6: ResetTasks
  7: BagMenu_InitBGs (=ResetVramOamAndBgCntRegs + InitBgsFromTemplates + SetBgTilemapBuffer)
  8: LoadBagMenu_Graphics (5 sub-states)
  9: LoadBagMenuTextWindows (=InitWindows + LoadUserWindowBorderGfx + LoadMessageBoxGfx + 
     ListMenuLoadStdPalAt + LoadPalette gStandardMenuPalette BG_PLTT_ID(15))
  10: UpdatePocketItemLists + InitPocketListPositions
  11: AllocateBagItemListBuffers
  12: LoadBagItemListBuffers(pocket)
  13: PrintPocketNames + DrawPocketIndicatorSquare
  14: CreateBagInputHandlerTask + ListMenuInit
  15: AddBagVisualSprite
  16: CreateItemMenuSwapLine
  17: CreatePocketScrollArrowPair + CreatePocketSwitchArrowPair
  18: PrepareTMHMMoveWindow
  19: BlendPalettes(PALETTES_ALL, 16, 0)
  20: BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)
  default: SetVBlankCallback(VBlankCB_BagMenuRun) + SetMainCallback2(CB2_BagMenuRun) + return TRUE
```

**Écarts détectés** :
- `[HACK]` line 1065 : `setFieldCameraSuspended(true)` — PAS dans décomp. Le décomp swap CB2 → l'overworld arrête de tick. Notre hack suspend manuellement.
- `[HACK]` line 1134-1153 : Override hook `globalThis._syncSubspriteOam` — PAS dans décomp. Pour cacher les OAM overworld pendant que CB2 overworld continue à tick.
- `[HACK]` line 1097-1108 : Save/restore `_savedObjVram` + `_savedObjPalettes` (player/NPCs OAM tile data) — PAS dans décomp. Le décomp clear OAM via `ResetVramOamAndBgCntRegs` qui zero VRAM/OAM/PLTT, puis réinit propre via les CB2 init.
- `[HACK]` line 990-1039 : Save/restore `_savedBgState` (charBase, mapBase, priority, screenSize, BG2 vofs/hofs, vramSnap, paletteSnap) — PAS dans décomp.
- `[HACK]` line 2240-2287 (`_teardownBackgroundTilemap`) : Restore VRAM bytes + sub-palette 0 + BG2 config + re-show overworld BGs — PAS dans décomp. Le décomp utilise `SetMainCallback2(gMain.savedCallback)` + reload OW via `CB2_ReturnToFieldLocal` qui re-init complet.
- `[STUB]` line 1813 : `console.log('[bag-screen] action ${ItemAction[action]} on ${_ctxItemKey} — TODO')` — USE / GIVE / REGISTER / CHECK / CHECK_TAG = stub silencieux.
- `[STUB]` line 675 : "TODO : extraire hm_icon.png + blit" — HM badge non rendu.
- `[STUB]` line 702 : "Phase 6+ : blit du select_button.png" — bouton SELECT pas rendu.
- `[NOT-1:1]` line 936-959 : `OpenBagScreen` async fait `void _loadAssets().then(...)`. Décomp = state machine 5 sub-états dans `LoadBagMenu_Graphics`, attend complétion avant state++. Pas thenable → divergent ordre exec.
- `[NOT-1:1]` BG=0 utilisé pour TOUTES les windows. Décomp `sContextMenuWindowTemplates[ITEMWIN_2x2]` utilise `.bg = 1`. CB ctx menu bug visuel rayures.

**Fix proposé** (réutiliser pattern option-menu CB2 swap) :
1. Créer `CB2_InitBagMenu` (= state machine 0..20)
2. Créer `MainCB2_BagMenuRun` (= 1:1 `CB2_Bag` post-init)
3. Créer `Task_FadeAndCloseBagMenu` + `Task_CloseBagMenu`
4. Adapter `sacAction()` dans `start-menu.ts` : preload assets + `SetMainCallback2(CB2_InitBagMenu)` + `gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual`.
5. SUPPRIMER : `setFieldCameraSuspended`, `_syncSubspriteOam` hook, `_savedObjVram`, `_savedObjPalettes`, `_savedBgState`.
6. SUPPRIMER : `_setupBackgroundTilemap` + `_teardownBackgroundTilemap` → roll-up dans state machine.

**Préreq architectural** :
- `InitWindows(templates: readonly WindowTemplate[]): number[]` — actuellement retourne `void` (cf. gba-window-system.ts:148). Cible : retourne array des window IDs.
- Vérifier que `FreeAllWindowBuffers` (gba-window-system.ts:167) clear bien gWindows AVANT que CB2_InitBagMenu state 9 ne fasse InitWindows (= state 7 BagMenu_InitBGs clear VRAM + state 9 clear gWindows OW map name popup).

---

## Catégorie B — Autres menus (HEAVY MVP)

### `src/engine/party-screen.ts` ↔ `decomps/pokeemeraude/src/party_menu.c`

**Stats** : 266 lignes (notre code) vs ~6000 lignes (décomp party_menu.c). Lourdement MVP.

**Écarts** :
- `[MVP]` line 32-38 : COLOR_MAIN/RED/YELLOW hardcoded `[1,2,3] [1,5,6] [1,7,8]` — devrait utiliser `sFontColorTable[]` du décomp.
- `[HARDCODE]` line 99-180 : Hardcoded labels "Pas de POKéMON.", "Type:", "Cap:", "ATTAQUES :", "Tient:", "(slot vide)" — pas dans strings.json mais devraient être `gText_*`.
- `[NO-CB2-SWAP]` line 194-209 : `OpenPartyScreen(onClose)` + sub-state pattern. Pas de SetMainCallback2 (= overworld tick en parallèle, même problème que bag-screen).
- `[VISUAL-DIVERGENT]` line 99-122 : Layout 6 slots vertical avec `>` ASCII cursor. Décomp utilise `sPartyMenuBoxInfos[]` (= sprites BoxOutline + Hp bar + Status icon) — pas notre layout.
- `[NO-1:1]` Pas de `Task_HandleChooseMonInput`, pas de `Task_HandleSelectionMenuInput`, pas de `Task_HandleAndCloseChooseMonInput` — toute l'API party menu manque.

**Fix proposé** :
- Port complet 1:1 décomp `src/party_menu.c` : `InitPartyMenu()`, `Task_HandleChooseMonInput()`, sprites box outlines, HP bar fill, status icon, etc.
- Utiliser `gText_*` pour TOUTES strings.
- CB2 swap : `CB2_InitPartyMenu` (1:1 décomp).
- Charger 1:1 `sPartyMenuBg_Tiles` / `sPartyMenuBg_Pal` / `sPartyMenuTextBox_Tilemap` etc. depuis `graphics/party_menu/`.

### `src/engine/trainer-card-screen.ts` ↔ `decomps/pokeemeraude/src/trainer_card.c`

**Stats** : 146 lignes vs ~2500 lignes décomp. EXTRÊME MVP.

**Écarts** :
- `[MVP]` line 38-40 : 1 seule window 28×17, layout table. Décomp utilise 2 cartes (page recto+verso), 9+ windows distincts (header, footer, money, time, badges, dex, link records, etc.).
- `[HARDCODE]` line 55,81-91,103 : Hardcoded "FILLE/GARÇON", "CARTE DE DRESSEUR", "Nom"/"Sexe"/"No. ID"/"Argent"/"POKéMON"/"POKéDEX"/"Badges"/"Durée", "A / B : retour menu". TOUS devraient être `gText_*`.
- `[NO-CB2-SWAP]` line 113-123 : Pattern Open/Tick/Close. Pas SetMainCallback2.
- `[NO-1:1]` Pas de page flip (= ROM utilise A button pour flip verso). Pas de sprite trainer rendering (= devrait blit gFrontTrainerPics_X). Pas de stars (= 5 niveaux trainer card, basé sur achievements).

**Fix proposé** : Port complet 1:1 `src/trainer_card.c`. Beaucoup de travail.

### `src/engine/pokedex-screen.ts` ↔ `decomps/pokeemeraude/src/pokedex.c`

**Stats** : 112 lignes vs ~5000 lignes décomp. EXTRÊME MVP.

**Écarts** :
- `[MVP]` line 51-66 : 1 window text-only avec count seen/caught hardcoded. Décomp = écran complet avec list scrollable Pokémon, sprite mon front, description FR, cri sonore, etc.
- `[HARDCODE]` line 51,52,53,54,55,57,59,63,65-67,69 : Tous les textes hardcodés. Pas gText_*.
- `[STUB]` line 65 : `'(UI complète à venir)'` — admis comme stub.
- `[NO-CB2-SWAP]` Pattern Open/Tick/Close.

**Fix proposé** : Port complet 1:1 `src/pokedex.c`.

---

## Catégorie C — Engine visuel GBA

### `src/engine/gba-window-system.ts` ↔ `decomps/pokeemeraude/src/window.c`

**Stats** : 699 lignes vs 714 lignes décomp. Plutôt bon alignement.

**Écart critique** :
- `[NOT-1:1-SIGNATURE]` line 148 : `InitWindows(templates: readonly WindowTemplate[]): void` — devrait retourner `number[]` (= array d'IDs alloués). Sans ça, le pattern décomp `windowIds = InitWindows(sDefaultBagWindows); _spriteWid = windowIds[0]; ...` est impossible → tout le code utilise `AddWindow` séparément.

**Fix proposé** :
```ts
export function InitWindows(templates: readonly WindowTemplate[]): number[] {
  FreeAllWindowBuffers();
  const ids: number[] = [];
  for (const t of templates) ids.push(AddWindow(t));
  return ids;
}
```

**Autres écarts** :
- `[MISSING]` Pas de `AddWindow8Bit` / `FillWindowPixelBuffer8Bit` / etc. (8bpp windows) — décomp les a. Si jamais utilisé par battle UI / summary screen, manquant.
- `[MISSING]` Pas de `ScrollWindow` (window.c:478) — utilisé par certains menus.
- `[MISSING]` Pas de `CallWindowFunction` (window.c:525).
- `[MISSING]` Pas de `GetWindowAttribute` (window.c:558).

### `src/engine/gba-text-system.ts` ↔ `decomps/pokeemeraude/src/text.c`

**Stats** : 528 lignes vs 1904 lignes décomp. Bon alignement pour l'essentiel mais ~1/3.

**Helpers à vérifier** : `AddTextPrinter`, `AddTextPrinterParameterized`, `AddTextPrinterParameterized2`, `AddTextPrinterParameterized3`, `AddTextPrinterParameterized4`, `RunTextPrinters` — tous existent ?

### `src/engine/gba-text-window.ts` ↔ `decomps/pokeemeraude/src/text_window.c`

**Stats** : 118 lignes vs 197 lignes décomp. Compact, OK.

---

## Catégorie D — Strings hardcodées

### `src/engine/start-menu.ts`

**Écarts** :
- `[HARDCODE]` lines 491-503 : Labels start menu hardcoded :
  - `'POKéDEX'` → existe `gText_MenuPokedex`, `gText_MenuOptionPokedex`
  - `'POKéMON'` → `gText_MenuPokemon`, `gText_MenuOptionPokemon`
  - `'SAC'` → `gText_MenuBag`, `gText_MenuOptionBag`
  - `'POKéNAV'` → `gText_MenuOptionPokenav`
  - `'SAUVER'` → `gText_MenuSave`, `gText_MenuOptionSave`
  - `'OPTIONS'` → `gText_MenuOption`, `gText_MenuOptionOption`
  - `'RETOUR'` → `gText_MenuExit`, `gText_MenuOptionExit`
- `[HARDCODE]` line 349-394 : 'JOUEUR', 'BADGES', 'POKéDEX', 'DUREE JEU' — décomp utilise `gText_SaveMenu_Player`, `gText_SaveMenu_Badges`, `gText_SaveMenu_Pokedex`, `gText_SaveMenu_PlayTime`. À vérifier dans strings.json.
- `[HARDCODE]` line 199 : `'Le POKéDEX n\\'est pas\\nencore disponible.'` — pas dans strings.json (= placeholder MVP propre).
- `[HARDCODE]` line 224 : `'Vous n\\'avez pas\\nencore de POKéMON.'` — idem.
- `[HARDCODE]` line 422-423 : Fallback `'Voulez-vous sauvegarder la partie?'` — getText('gText_ConfirmSave') déjà utilisé, fallback OK.

**Fix proposé** : Remplacer tout par `getString('gText_X')` (ou `getText('gText_X')` pour celles dans per-map scripts).

### `src/engine/party-screen.ts` / `pokedex-screen.ts` / `trainer-card-screen.ts`

Voir Catégorie B. Tous les labels hardcodés à remplacer.

---

## Catégorie E — Assets hardcodés / chargement

### `src/engine/bag-screen.ts`

**Status** : Bon globalement, charge via `loadIndexedPngStrict` / `loadGbaPal` / `loadTileBin`. Assets dans `/decomp/em/bag/`, `/decomp/em/interface/`, `/decomp/em/items/`.

### `src/engine/party-screen.ts` / `pokedex-screen.ts` / `trainer-card-screen.ts`

**Status** : AUCUN asset chargé. Tout text-only. Devraient charger :
- party_menu_text.png + .pal
- trainer_card.png + .pal (page recto, verso, stars, etc.)
- pokedex frames + sprites mon front + cries

---

## Catégorie F — Globals & duplication

### Duplication identifiée

**Pattern Open/Tick/Close avec `_isOpen`/`_onClose` répété N=4 fois** :
- bag-screen.ts:271-924
- party-screen.ts:54-200
- pokedex-screen.ts:33-85
- trainer-card-screen.ts:42-115

**Fix proposé** : Tous ces menus doivent suivre le pattern CB2 swap (1:1 décomp). Le `_isOpen` + `_onClose` devient inutile car :
- `_isOpen` = vérifier `gMain.callback2 === MainCB2_XxxRun`
- `_onClose` = `gMain.savedCallback` (= `CB2_ReturnToFieldWithOpenMenu_Manual`)

**Pattern dupliqué** : Save info window dans start-menu.ts (296-396) — labels JOUEUR/BADGES/POKéDEX/DUREE JEU hardcoded.

**Hooks _syncSubspriteOam** : Utilisé par bag-screen (à supprimer) + naming-screen-impl + summary-screen (= dans auto-files). Si on CB2-swap proprement les menus, hooks deviennent inutiles.

### Helpers manquants (= bridged via globalThis ou non implémentés)

**Non-implémentés (TODO/throw)** :
- `gApprenticeSpeciesMatchups` (= apprentice.c) — decomp-bridge.ts:761
- `gBerries` table — decomp-bridge.ts:1030
- `sSpriteTileAllocBitmap` — decomp-bridge.ts:1780
- `sSpriteTileRanges` — decomp-bridge.ts:2105
- Affine matrix calculation — decomp-bridge.ts:1455
- Wonder news/card lookups — decomp-bridge.ts:1856
- Flash storage — decomp-bridge.ts:1614+
- Pokemon nickname comparison logic — decomp-bridge.ts:2093

**Stubs no-op acceptables (single-player only)** :
- Wireless link / RFU (no-op OK)

### Constants pas centralisés

- `FONT_NORMAL = 1` redéfini dans : bag-screen.ts:45, option-menu-impl.ts:50 (implicit), party-screen.ts:31, pokedex-screen.ts:22, trainer-card-screen.ts:31, start-menu.ts (implicit). Devrait être `import { FONT_NORMAL } from './decomp-constants'` (où `decomp-constants` exposerait les constants 1:1 décomp `text.h`).
- `STD_FRAME_TILE = 0x214` redéfini dans : bag-screen.ts:62, party-screen.ts:36, pokedex-screen.ts:25, trainer-card-screen.ts:34. Décomp = `STANDARD_WINDOW_PALETTE_NUM` + `STANDARD_WINDOW_BASE_TILE_NUM` macros. Décrire dans decomp-constants.
- `TEXT_SKIP_DRAW = 255` redéfini dans bag-screen.ts:49, party-screen.ts:32, etc. — devrait être `TEXT_SKIP_DRAW` exporté.
- `COLOR_MAIN: [number, number, number] = [1, 2, 3]` redéfini dans plusieurs files. Décomp = `sFontColorTable[COLORID_NORMAL]`. Devrait être array constant exporté.

---

## Catégorie G — Auto-files (transpiler bugs)

### Errors `npm run build` (= 121 erreurs)

**Tous concentrés sur 3 fichiers** :
- `src/engine/decomp-data/auto/src/specials-auto.ts` (~80 erreurs)
- `src/engine/decomp-data/auto/src/scrcmd-auto.ts` (~30 erreurs)
- `src/engine/decomp-data/auto/src/fieldeffect-auto.ts` (1 erreur)

**Cause root** : Le transpiler `scripts/transpile-callbacks.mjs` ne handle pas :
1. **Designated initializers C** (`{ .bg = 0, .tilemapLeft = 6 }`) → laisse littéral. Cf specials-auto.ts:728-734.
2. **`txtPtr++ = CHAR_COMMA`** (= C pointer dereferenced and incremented) → laisse littéral.
3. **`void` variables** (`let void = something`) — TS interdit `void` comme nom de variable.
4. **`continue` after `return`** dans switch — TS error.
5. **Property syntax `key:` dans struct initializer** :
   ```ts
   const x: any = {
     foo:: number = 0,  // <-- erreur ': expected'
   };
   ```

**Fix proposé** :
1. Update `transpile-callbacks.mjs` pour handle :
   - Designated initializer `.foo = X` → `foo: X`
   - `txtPtr++ = X` → reconnaître pattern et générer commentaire + skip
   - `void` keyword conflict → rename à `_void`
2. Re-run le transpiler pour regenerate ces 3 fichiers.

**Workaround court terme** : Wrap chaque function avec syntax cassée dans `/* try/catch */` ou comment-out. Cf. `post-transpile-patches.mjs` qui semble être un script de patching post-transpile — extends.

---

## Catégorie H — Misc

### `src/engine/start-menu.ts`

**Pattern** : Sub-states 'menu' / 'msg_wait' / 'save_confirm' / 'save_yesno' / 'save_done' / 'bag_screen' / 'party_screen' / 'trainer_card_screen' / 'pokedex_screen'.

**Pas 1:1 décomp** :
- Décomp `Task_ShowStartMenu` créé une Task avec `func = HandleStartMenuInput`. Le menu callback est `gMenuCallback`. Notre pattern sub-state = équivalent fonctionnel mais pas 1:1 structurel.
- Décomp ferme le menu via `RemoveStartMenuWindow()` + `CleanupOverworldWindowsAndTilemaps()` (cf. start_menu.c:691) — notre `CloseStartMenu` fait `ClearStdWindowAndFrame` + `RemoveWindow`. Manquent les helpers.
- Décomp `StartMenuPokedexCallback`, `StartMenuPokemonCallback`, `StartMenuBagCallback`, etc. (start_menu.c:702-820) — chacun :
  1. `if (!gPaletteFade.active) {`
  2.   `PlayRainStoppingSoundEffect()`
  3.   `RemoveExtraStartMenuWindows()`
  4.   `CleanupOverworldWindowsAndTilemaps()`
  5.   `SetMainCallback2(CB2_XxxMenu)`
  6.   `gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu`
  7.   `return TRUE; }`
  8. `return FALSE;`

  Notre code fait `OpenBagScreen` direct sans CB2 swap. PAS 1:1.

**Fix** : Refactor each `xxxAction()` → CB2 swap pattern comme `optionsAction()`.

### `src/scenes/TestOverworldScene.ts`

- `[MAYBE-HACK]` line 471 `_restoreOverworldFromMenu` — appelé par `option-menu-return.ts:CB2_ReturnToFieldLocal_Manual` case 1 quand option menu close. Wrapper async qui réinit BG/sprite/map. Le décomp utilise `ResumeMap()` + `InitObjectEventsReturnToField()` séparément — vérifier que notre wrapper match.
- `[STATUS-TEXT]` Phaser statusText overlay "Loading MAP..." parfois visible — bleed through les menus. Devrait être `.setVisible(false)`.

---

## Helpers manquants / TBD

- `ScanlineEffect_Stop` — référencé case 1 de CB2_InitBagMenu (no-op OK chez nous).
- `LoadCompressedPalette` — décomp dans intro.c, decomp-bridge.ts wraps comme LoadPalette ? À vérifier.
- `ListMenuLoadStdPalAt(BG_PLTT_ID(12), 1)` — chargement palette list menu standard. À vérifier port.
- `FreeAllSpritePalettes` — existe dans decomp-globals.ts ? À vérifier.
- `ResetSpriteData` — existe dans decomp-bridge.ts. OK.
- `ResetTasks` — existe. OK.
- `BlendPalettes(0xFFFFFFFF, 16, 0)` — existe via decomp-globals BlendPalettes ? À vérifier.
- `gStandardMenuPalette` — asset `public/decomp/em/interface/std_menu.pal` est en place (= commit `0fe45fe9`).

---

## Auto-files manquants par rapport au décomp

```
$ ls decomps/pokeemeraude/src/ | wc -l  → 315
$ ls src/engine/decomp-data/auto/src-all/ | wc -l  → 296 (- 1 _barrel.ts = 295)
```

Donc ~20 fichiers décomp n'ont pas leur auto-équivalent. À identifier via diff (= prochaine étape automation).

---

## Scripts d'automation créés (Phase 3)

Voir `scripts/audit-*.mjs` :
- **`scripts/audit-1to1-decomp.mjs`** — compare un TS file vs son équivalent décomp .c (= liste fonctions définies, signatures, helpers manquants)
- **`scripts/check-hardcoded-strings.mjs`** — détecte les literals `'XXX'` ≥ 4 caractères dans src/engine/ qui devraient être `getString('gText_X')` (= cross-ref avec strings.json)
- **`scripts/check-duplicate-helpers.mjs`** — détecte les helpers (= const, function) dupliqués entre modules src/engine/
- **`scripts/validate-bridge-completeness.mjs`** — vérifie que tous les `globalThis.X` référencés dans le code ont une impl

---

## Plan de fix priorisé

### Priorité 1 — Architecture (= débloque tous les menus)

1. **`InitWindows` retourne `number[]`** (= gba-window-system.ts:148) — petite modif, débloque pattern CB2 swap.
2. **Bag screen CB2 swap proper** (= 1:1 décomp item_menu.c + supprime hacks).
   - Nouveau `CB2_InitBagMenu` state machine 0..20.
   - Nouveau `MainCB2_BagMenuRun`.
   - Nouveau `Task_FadeAndCloseBagMenu` + `Task_CloseBagMenu`.
   - Adapter `sacAction()` dans start-menu.ts.
   - Supprimer hacks (= `_syncSubspriteOam` hook, `setFieldCameraSuspended`, `_savedObjVram/Palettes/BgState`).
3. **Helper bridging** : `ScanlineEffect_Stop` (no-op), `FreeAllSpritePalettes`, `ResetVramOamAndBgCntRegs`, etc. — porter ou stub fail-fast.

### Priorité 2 — Strings & dedup

4. **Replace hardcoded labels** avec `getString('gText_*')` dans :
   - start-menu.ts (labels POKéDEX/POKéMON/SAC/POKéNAV/SAUVER/OPTIONS/RETOUR)
   - start-menu.ts SaveInfoWindow (JOUEUR/BADGES/POKéDEX/DUREE JEU)
   - bag-screen.ts (= remplacer 'FERMER LE SAC' par `getString('gText_CloseBag')`)
5. **Centraliser constants** dans `decomp-constants.ts` :
   - FONT_NORMAL, FONT_NARROW, TEXT_SKIP_DRAW
   - STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM (= STANDARD_WINDOW_*)
   - DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM
   - COLORS arrays (= sFontColorTable[COLORID_*])
6. **Dedup `_isOpen`/`_onClose` pattern** → tous menus passent via CB2 swap.

### Priorité 3 — Refactor menus B-class

7. **Party screen** : port complet 1:1 décomp `party_menu.c`. Charger gPartyMenuBg_Tiles, sprite OAM box outlines, HP bar, status icons.
8. **Trainer card** : port complet 1:1 décomp `trainer_card.c`. Page recto/verso, sprite trainer pic, stars, achievements.
9. **Pokédex** : port complet 1:1 décomp `pokedex.c`. List scrollable, mon front pic, FR descriptions, cri sonore.

### Priorité 4 — Auto-files transpiler fixes

10. **Update `scripts/transpile-callbacks.mjs`** pour handle :
    - Designated initializers C → object literal TS
    - `txtPtr++ = X` pattern → comment out / convert to array push
    - `void` variable conflict → rename
11. **Re-run transpiler** → regenerate specials-auto.ts + scrcmd-auto.ts + fieldeffect-auto.ts.

### Priorité 5 — Helpers manquants

12. **Implement decomp-bridge TODOs** : gApprenticeSpeciesMatchups, gBerries, sSpriteTileAllocBitmap, etc. (= ~12 stubs throw NotImplemented).

### Priorité 6 — Polish

13. **Hide Phaser statusText overlay** (= scenes/TestOverworldScene.ts).
14. **Cleanup _common-constants.ts** + audit `decomp-data/` for hardcodes.
15. **Documentation** : update memory/*.md avec snapshot pré/post refactor.

---

## Décisions architecturales

### A. SAC : CB2 swap proper (= validé user session 129)

Source de vérité = `feedback-bag-refactor-foam-base.md` + `SESSION-129-PLAN-1TO1-DECOMP.md`.

### B. Menus B-class (party/pokedex/trainer-card) : ports 1:1 prioritaires

Ces menus sont MVP-level mais ne bloquent pas la progression du jeu pour l'instant. À porter en parallèle du gros refactor sac, ou après.

### C. Transpiler fixes : low effort high impact

Les 121 erreurs npm build sont concentrées sur 3 fichiers. Fix transpiler = re-run = clean. Pas de risque architectural.

### D. Pas de hacks `_syncSubspriteOam` / `setFieldCameraSuspended`

Une fois CB2 swap proper en place, ces hacks deviennent inutiles. À RETIRER, pas à étendre.

---

## Risques

- **Refactor bag breaks intro / starter / battle** : tester chaque scene après refactor (= la pattern CB2 swap est isolée au menu seulement, pas de side-effect sur OW).
- **InitWindows breaking change** : signature change `void → number[]`. Check callers : `gba-window-system.ts:148`, callers via grep. Backward compat possible avec overload.
- **Transpiler re-run écrase fixes manuels** : auto-files SONT régénérés. User a explicitly dit "PAS modifier auto-files à la main". Tous fixes via transpiler/extracteur.

---

## Conclusion

Le projet a une base solide (= 11k+ lignes de runtime décomp porté, 296 auto-files transpilés, 1000+ items, 386 species, etc.) mais souffre de :
1. **Architecture menus pas 1:1** (= bag/party/pokedex/trainer-card ont leur propre lifecycle au lieu de CB2 swap décomp).
2. **Hardcodes labels** (~50+ strings hardcodées qui existent dans strings.json).
3. **MVP screens** (party/pokedex/trainer-card sont des stubs visuels).
4. **Transpiler bugs** (3 auto-files cassés syntactiquement → npm build fail).

**Plan recommandé** :
1. Fix `InitWindows` signature (= 5 min).
2. Refactor bag-screen CB2 swap (= 2-4h de travail méticuleux, suivre plan session 129).
3. Refactor party/pokedex/trainer-card avec CB2 swap (= 1-2h chacun).
4. Replace hardcoded strings (= 1h).
5. Fix transpiler + re-run (= 1-2h).

Total estimé : ~1 jour de travail méticuleux + tests visuels frame-par-frame.
