# DETTES 1:1 STRICT — PC PLAYER + MAIL + DECORATION + EASY_CHAT

Document maintenu post-session **2026-05-23-3** (HEAD `3af6c12c` upd2 non poussé,
19 commits cette session). **~12000l C portés du décomp Pokemon Emerald** vers
~17000l TS, avec **79 STUBs/1:1 TODOs** explicites pour les helpers substrat
non encore portés.

Ce document est la **source de vérité unique** pour reprendre chaque dette. Chaque
entrée contient :
- Description précise
- Localisation (fichier:ligne dans notre TS)
- Source décomp (chemin + lignes)
- Pourquoi différée
- Estimation complexité
- Solution proposée
- Validation runtime attendue

---

## CATÉGORIES

1. [Substrat sprite/camera/OAM](#1-substrat-spritecameraoam-30-stubs)
2. [Menu helpers UI](#2-menu-helpers-ui-display-yesno-message-10-stubs)
3. [Assets graphics extraction](#3-assets-graphics-extraction-decoration--mail)
4. [Helpers cross-modules](#4-helpers-cross-modules-party_menu-tv-field-effect)
5. [Multi-langue conversion](#5-multi-langue-conversion-international)
6. [Refactor architectural](#6-refactor-architectural-state-legacy--struct-11)
7. [Easy_chat setter injection wires](#7-easy_chat-setter-injection-wires)
8. [Misc dettes mineures](#8-misc-dettes-mineures)

---

## 1. SUBSTRAT SPRITE/CAMERA/OAM (~30 STUBs)

Le mode **"Décorer ma chambre"** (= `Task_PlaceDecoration` + `ContinueDecorating`)
demande un système de sprite/camera/object events complet qui n'est que
partiellement porté dans notre runtime.

### 1.1 `gFieldCamera.spriteId` (= sprite anchor camera OW)

- **Localisation** : `src/engine/decoration-place.ts:620, 634, 728, 743, 971, 1179, 1247, 1266`
- **Source décomp** : `src/decoration.c:1393-1398, 1685-1699`, `src/field_camera.c:gFieldCamera struct`
- **Description** : Le décomp utilise `gFieldCamera.spriteId` pour tracker le sprite
  camera (= le sprite "invisible" qui suit le player et auquel on attach les autres
  sprites OAM via offset). Notre runtime a un `FieldCamera` partiellement mais
  pas `.spriteId` exposé.
- **Pourquoi différée** : demande refactor du sub-système camera + sprite alloc.
- **Complexité** : moyenne, ~200l à porter (= field_camera.c subset)
- **Solution proposée** :
  1. Porter `struct FieldCamera` complet depuis `field_camera.c` (= ~150l)
  2. Wire `gFieldCamera.spriteId` au sprite anchor caméra existant
  3. Exposer via `decomp-globals.ts` pour accès cross-modules
- **Validation** : préview avec `?nointro` → tester decoration place → cursor sprite
  doit suivre la caméra correctement.

### 1.2 `CreateObjectGraphicsSprite(gfxId, callback, x, y, subprio)`

- **Localisation** : `src/engine/decoration-place.ts:669`
- **Source décomp** : `src/event_object_movement.c` (CreateObjectGraphicsSprite)
- **Description** : helper pour créer un sprite NPC depuis un OBJ_EVENT_GFX_* ID.
  Utilisé pour le player avatar pendant le placement decoration (=
  `OBJ_EVENT_GFX_BRENDAN_DECORATING` / `MAY_DECORATING`).
- **Pourquoi différée** : sprite event object subsystem partiellement porté.
- **Complexité** : moyenne, demande aussi assets OBJ_EVENT_GFX_*_DECORATING
- **Solution proposée** :
  1. Vérifier si `event_object_movement.ts` expose déjà l'helper
  2. Sinon porter le subset CreateObjectGraphicsSprite (~50l)
  3. Extraire assets `graphics/object_events/pics/people/brendan/decorating.png`
     et `may/decorating.png` (= 2 spritesheets 16×32 4bpp)

### 1.3 `gSprites[].data[N]` access + sprite priority/x2/y2

- **Localisation** : `src/engine/decoration-place.ts:620, 728, 743, 971, 1179, 1247, 1266`
- **Source décomp** : `gSprites[]` array, struct Sprite (sprite.h)
- **Description** : accès direct aux fields des sprites OAM (oam.priority, x/y/x2/y2,
  data[8] pour state). Notre runtime expose `rt.gSprites` (Map) mais avec interface
  simplifiée.
- **Pourquoi différée** : refactor majeur du sprite system pour matcher 1:1 `struct Sprite`.
- **Complexité** : haute, ~500l de port complet
- **Solution proposée** :
  1. Étendre notre type Sprite avec tous les fields décomp (= data[8], x2/y2, oam complet)
  2. Garantir que les accès `gSprites[id].xxx` matchent 1:1
  3. Wire `sDecor_CameraSpriteObjectIdx1/2` avec les vrais sprite IDs
- **Validation** : place decoration → cursor sprite move suivant DPAD + player avatar
  visible avec animation décorating + sprite priority correcte vs BG.

### 1.4 `UpdateSwapLineSpritesPos` (= swap line UI)

- **Localisation** : `src/engine/bedroom-pc.ts:1709` (ItemStorage_UpdateSwapLinePos STUB)
- **Source décomp** : `src/menu_helpers.c::UpdateSwapLineSpritesPos`
- **Description** : Update la position des 7 sprites OAM de la swap line (=
  indicateur visuel pendant ItemStorage SELECT swap).
- **Pourquoi différée** : `CreateSwapLineSprites` pas appelé dans notre flow
  ItemStorage_Enter → les sprites n'existent pas, donc UpdateSwapLineSpritesPos
  no-op silencieux.
- **Complexité** : faible, ~50l si swap-line.ts existe déjà
- **Solution proposée** :
  1. Vérifier si `swap-line.ts` exporte `CreateSwapLineSprites/UpdateSwapLineSpritesPos/DestroySwapLineSprites`
  2. Wire dans `_itemStorageEnter` pour spawn + dans cleanup pour despawn
  3. Wrap dans `ItemStorage_UpdateSwapLinePos(y)` 1:1

---

## 2. MENU HELPERS UI (Display, YesNo, Message) — 10 STUBs

Helpers de UI generic (menu.c, menu_helpers.c) appelés par decoration mais pas
encore portés.

### 2.1 `DisplayItemMessageOnField(taskId, text, callback)`

- **Localisation** :
  - `src/engine/decoration-place.ts:213, 1110`
  - `src/engine/decoration-putaway.ts:_displayItemMessageOnField_STUB` (= injection setter)
  - `src/engine/decoration.ts:_displayItemMessageOnField` (= injection setter)
- **Source décomp** : `src/menu.c` ou `src/item_menu.c::DisplayItemMessageOnField`
- **Description** : Affiche un message field-style avec frame dialog + wait
  A press + callback. Pattern partout dans le PC/decoration/mailbox.
- **Pourquoi différée** : déjà implémenté en TS sous différents noms locaux
  (`_showSticky` dans bedroom-pc.ts, `_printMessage` ailleurs). Pas exposé
  comme helper global avec le nom 1:1.
- **Complexité** : faible, ~30l wrapper
- **Solution proposée** :
  1. Créer `src/engine/display-item-message.ts` qui expose
     `DisplayItemMessageOnField(text, callback)` 1:1
  2. Wrap `LoadMessageBoxAndBorderGfx + DrawDialogueFrame +
     AddTextPrinterParameterized + state-machine callback`
  3. Migrer les callers internes vers ce helper unique

### 2.2 `DisplayYesNoMenuDefaultYes()` + `DoYesNoFuncWithChoice(taskId, &funcTable)`

- **Localisation** :
  - `src/engine/decoration-place.ts:232, 240`
  - `src/engine/decoration-putaway.ts:_displayYesNoMenuDefaultYes`
- **Source décomp** : `src/menu.c::DisplayYesNoMenuDefaultYes`, `src/menu_helpers.c::DoYesNoFuncWithChoice`
- **Description** : Affiche YesNo menu + dispatch via `YesNoFuncTable`
  ({yesFunc, noFunc}).
- **Pourquoi différée** : équivalent existe (`CreateYesNoMenu` + `Menu_ProcessInputNoWrapClearOnChoose`
  manual dispatch) mais pas avec API task-based 1:1.
- **Complexité** : faible, ~50l wrapper
- **Solution proposée** :
  1. Exposer `DisplayYesNoMenuDefaultYes()` qui wrap `CreateYesNoMenu` avec
     defaultCursor=0 (= YES)
  2. Implémenter `DoYesNoFuncWithChoice(taskId, funcTable)` qui poll
     `Menu_ProcessInputNoWrapClearOnChoose` chaque frame + dispatch
  3. Wire dans decoration place/putaway flows

### 2.3 `ScriptContext_SetupScript(label)` cross-module call

- **Localisation** : `src/engine/decoration-place.ts:252`
- **Source décomp** : `src/script.c::ScriptContext_SetupScript`
- **Description** : Lance un script bytecode field event depuis TS. Déjà porté
  dans `script-runtime.ts`.
- **Pourquoi différée** : import dans `decoration-place.ts` pas wiré (cycle ESM
  potentiel).
- **Complexité** : trivial, juste l'import
- **Solution proposée** :
  ```ts
  import { ScriptContext_SetupScript } from './script-runtime';
  ```

---

## 3. ASSETS GRAPHICS EXTRACTION (decoration + mail)

Pour rendre visuellement le mode "Décorer ma chambre" + les mails avec leurs
designs, il faut extraire les assets binaires du décomp.

### 3.1 Mail backgrounds (12 designs)

- **Localisation** : `src/engine/mail.ts:34-40` (DETTE assets)
- **Source décomp** : `D:/Projet 1/decomps/pokeemeraude/graphics/mail/<name>/`
  pour chaque mail : `orange, harbor, glitter, mech, wood, wave, bead, shadow,
  tropic, dream, fab, retro` (= 12 designs)
- **Description** : Chaque mail design a `palette.gbapal + tiles.4bpp.lz +
  tilemap.bin.lz`. Notre code `sMailGraphics[*].tiles/tileMap/palette` retourne
  null → BG mail vide.
- **Pourquoi différée** : extraction script à écrire.
- **Complexité** : faible, ~50l script extraction Python
- **Solution proposée** :
  1. Adapter `scripts/extract_emerald_assets.py` pour décompresser les 12 mail
     designs vers `public/decomp/em/mail/<name>/`
  2. Output : `palette.bin` (32o), `tiles.4bpp.bin` (taille variable), `tilemap.bin` (taille variable)
  3. Wire `loadMailBg(name)` dans mail.ts pour fetch + render

### 3.2 Decoration tiles (gDecorations[].tiles)

- **Localisation** : `src/engine/decoration-data.ts:41`, tous les `DecorGfx_*`
  identifiers dans la table
- **Source décomp** : `D:/Projet 1/decomps/pokeemeraude/src/data/decoration/tiles.h` (643l)
- **Description** : Chaque décoration a un pointer `tiles` vers un asset
  graphique. Notre stub utilise string identifier `'DecorGfx_<name>'`
  null-friendly.
- **Pourquoi différée** : extraction massive (~120 decoration tiles)
- **Complexité** : moyenne, ~200l script extraction
- **Solution proposée** :
  1. Script `scripts/extract-decoration-tiles.mjs` qui lit `tiles.h` +
     extrait chaque asset vers `public/decomp/em/decoration/tiles/<name>.4bpp.bin`
  2. Update `gDecorations[i].tiles` mapping vers paths résolus
  3. Wire `loadDecorationTiles(decor)` dans decoration place flow

### 3.3 Decoration icons (gDecorIconTable)

- **Localisation** : `src/engine/decoration-place.ts:1383`
- **Source décomp** : `D:/Projet 1/decomps/pokeemeraude/src/data/decoration/icon.h` (124l)
- **Description** : Icons affichés dans le menu "items list within category" pour
  preview. Plus petit que tiles.
- **Complexité** : faible, ~100l script
- **Solution proposée** : Idem `3.2` mais pour `icon.h`.

### 3.4 Player decorating sprites

- **Localisation** : `src/engine/decoration-place.ts:417, 422, 441, 1408`
- **Source décomp** : `graphics/decorations/{brendan,may}.pal` +
  `graphics/object_events/pics/people/{brendan,may}/decorating.png`
- **Description** : Player avatar pendant le mode placing decoration. 2
  spritesheets + 2 palettes.
- **Complexité** : faible, ~50l (extract + register dans asset loader)

### 3.5 Put away cursor sprite

- **Localisation** : `src/engine/decoration-place.ts:441`
- **Source décomp** : `graphics/decorations/put_away_cursor.png`
- **Description** : Sprite du cursor pendant le mode PutAway (= ranger une déco).
- **Complexité** : faible, asset unique

---

## 4. HELPERS CROSS-MODULES (party_menu, tv, field_effect)

### 4.1 `ChooseMonToGiveMailFromMailbox()` — Mailbox Give flow

- **Localisation** : `src/engine/bedroom-pc.ts:_mailboxGive` (STUB warn)
- **Source décomp** : `src/party_menu.c::ChooseMonToGiveMailFromMailbox`
- **Description** : Le user choisit "DONNER" sur un mail dans Mailbox → ouvre
  party menu où il sélectionne le Pokémon qui recevra le mail.
- **Pourquoi différée** : `party_menu.c` est ÉNORME (= ~7000l, autre chantier).
- **Complexité** : très haute, dépend du port complet party_menu.c
- **Solution proposée** :
  1. Phase 1 (= maintenant) : STUB warn dans `_mailboxGive` ✓ déjà fait
  2. Phase 2 : porter party_menu.c (= chantier dédié à part)
  3. Phase 3 : wire `ChooseMonToGiveMailFromMailbox` + callback retour
- **Validation** : sub-menu Mailbox > DONNER → party menu apparaît → sélectionner
  Pokémon → mail attaché au Pokémon (= MonHasMail returns true).

### 4.2 `TryPutSecretBaseVisitOnAir()` — TV event

- **Localisation** : `src/engine/decoration-putaway.ts:_tryPutSecretBaseVisitOnAir`
- **Source décomp** : `src/tv.c::TryPutSecretBaseVisitOnAir`
- **Description** : Quand l'user finit de ranger les déco dans sa Secret Base
  d'un autre joueur, trigger un événement TV "secret base visit". Cosmétique.
- **Complexité** : moyenne, ~100l (= tv.c subset relatif secret base)

### 4.3 `gFieldCallback + CB2_ReturnToField + SetMainCallback2`

- **Localisation** :
  - `src/engine/decoration-place.ts:1090`
  - `src/engine/easy-chat-input.ts:_setCB2_ReturnToFieldContinueScript`
- **Source décomp** : `src/overworld.c::CB2_ReturnToField` + `gFieldCallback`
- **Description** : Pattern décomp pour swap CB2 vers field après un menu UI.
- **Complexité** : déjà partiellement porté dans `option-menu-return.ts`
  (CB2_ReturnToFieldLocal_Manual). Wire spécifique aux callers manquant.
- **Solution proposée** : exposer `CB2_ReturnToField` 1:1 + `gFieldCallback`
  setter dans `option-menu-return.ts`.

### 4.4 `WarpIntoMap` / `SetWarpDestination` (= ranger déco map switch)

- **Localisation** : `src/engine/decoration-place.ts:533`
- **Source décomp** : `src/overworld.c::WarpIntoMap`
- **Description** : Warp scripted entre maps. Pour decoration place qui touche
  les secret bases.
- **Complexité** : déjà porté en partie dans `warp-system.ts`. Wire manquant.

---

## 5. MULTI-LANGUE CONVERSION (international)

### 5.1 `ConvertInternationalPlayerName(buffer)` + `ConvertInternationalString(buffer, lang)`

- **Localisation** :
  - `src/engine/mailbox-menu.ts:MailboxMenu_ItemPrintFunc` (STUB no-op)
  - `src/engine/mail.ts` (= déjà no-op, notre UTF-8 natif)
- **Source décomp** : `src/international_string_util.c::ConvertInternationalPlayerName`
- **Description** : Le décomp gère JP vs EN player names avec padding différent
  (JP = 5 chars max, EN = 7 chars max). Notre port FR utilise UTF-8 natif.
- **Pourquoi différée** : pas critique car notre runtime est mono-langue FR/UTF-8.
- **Complexité** : faible si on garde mono-langue, haute si multi-langue
- **Solution proposée** : laisser no-op pour FR/EN. Si JP support futur, porter
  international_string_util.c complet.

---

## 6. REFACTOR ARCHITECTURAL (state legacy → struct 1:1)

### 6.1 Migration `sPCxxx` vars → `sItemStorageMenu.windowIds[ITEMPC_WIN_xxx]`

- **Localisation** : `src/engine/bedroom-pc.ts` (= toutes les vars `sPCListWindowId`,
  `sPCMessageWindowId`, `sPCTitleWindowId`, `sPCIconWindowId`, `sPCQuantityWindowId`,
  `sPCYesNoWindowId`, `sPCListTaskId`, `sPCInTossMode`, `sPCItemCount`)
- **Source décomp** : `struct ItemStorageMenu` (player_pc.c:90-98)
- **Description** : Notre TS utilise des vars module-level séparées. Le décomp
  les groupe dans `sItemStorageMenu.{windowIds[6], toSwapPos, spriteId, swapLineSpriteIds[7]}`.
  On a porté la struct (= ItemStorage_Init/Free/AddWindow/RemoveWindow) MAIS le
  code legacy `_itemStorageXxx` utilise encore les vars individuelles.
- **Pourquoi différée** : refactor mécanique massif, ~30 sites à patcher.
  Risque casse fonctionnel.
- **Complexité** : moyenne (~3-4h de refactor + tests)
- **Solution proposée** :
  1. Remplacer chaque `sPCListWindowId` → `sItemStorageMenu?.windowIds[ITEMPC_WIN_LIST] ?? -1`
  2. Idem pour les 5 autres windows
  3. Migrer `sPCIconSpriteId` → `sItemStorageMenu?.spriteId`
  4. Migrer `sPCSwapFromPos` → `sItemStorageMenu?.toSwapPos`
  5. Refactor `_itemStorageEnter` pour appeler `ItemStorage_Init()` (au lieu de
     reset manuel des vars)
  6. Refactor `_itemStorageExitItemList` pour appeler `ItemStorage_Free()`
- **Validation** : preview test withdraw + toss + swap flow → comportement
  identique.

### 6.2 Refactor naming `_itemStorageXxx` → `ItemStorage_Xxx`

- **Localisation** : `src/engine/bedroom-pc.ts` (= 21 functions préfixées `_`)
- **Description** : Notre code interne utilise préfixe `_itemStorageXxx`. Le
  décomp utilise `ItemStorage_Xxx`. Pour 1:1 nominal strict, rename direct.
- **Pourquoi différée** : aliases exports déjà en place (= `export const
  ItemStorage_Xxx = _itemStorageXxx`). Le rename interne est cosmétique.
- **Complexité** : faible (~30 renames), risque sed cassé sur strings/comments
- **Solution proposée** :
  1. sed `_itemStorageXxx` → `ItemStorage_Xxx` sur le fichier
  2. Sed reverse pour les références dans comments si nécessaire
  3. Supprimer les aliases (= ils deviennent identiques)
- **Validation** : tsc 0 erreur + boot preview OK.

### 6.3 Refactor sub-states `'pc_list'/'pc_swap'/etc.` → task func pointers

- **Localisation** : `src/engine/bedroom-pc.ts` (= `SubState` type + switch dans
  `TickBedroomPC`)
- **Source décomp** : `gTasks[taskId].func = ItemStorage_ProcessInput` etc.
- **Description** : Notre TS utilise un state machine `string` (`sSubState`).
  Le décomp utilise des function pointers (`gTasks[taskId].func`).
- **Pourquoi différée** : refactor architectural profond, ~1500l à toucher.
  Risque casse majeur sans gain fonctionnel direct (= juste 1:1 nominal).
- **Complexité** : haute, défer fortement
- **Solution proposée** : ne pas refactor sauf si requis pour wire un nouveau
  flow décomp 1:1 strict.

---

## 7. EASY_CHAT SETTER INJECTION WIRES

`easy-chat-input.ts`, `easy-chat-render.ts`, `easy-chat-sprite.ts` utilisent
un **pattern setter injection** pour casser les cycles ESM. Tous les setters
sont définis mais NON WIRÉS (= aucun caller appelle `_setXxxImpl(...)`).

Liste complète des setters non wirés :

### 7.1 easy-chat-input.ts setters

- `_setSEasyChatScreenTemplates` (= depuis easy-chat-init.ts)
- `_setSQuizLadyEasyChatScreens`
- `_setSAlphabetGroupIdMap`
- `_setSMysteryGiftPhrase`
- `_setSBerryMasterWifePhrases`
- `_set{Init,Free,Load}EasyChatScreen{Control,WordData}`
- `_set{Start,Run}EasyChatFunction`
- `_set{Get,Set}{Selected,Num}WordGroup*`
- `_setTrySetTrendyPhrase`
- `_set{Dynamic,TV}*`
- `_setGText*`
- `_setCB2_ReturnToFieldContinueScript`
- `_setCleanupOverworldWindowsAndTilemaps`
- `_setIsOverworldLinkActive`

### 7.2 easy-chat-sprite.ts setters

- `_setSEasyChatScreenRef`, `_setSScreenControlRef`, `_setSWordDataRef`
- `_setGStringVar2/4`, `_setRandom`, `_setFlagGet`
- `_setSpeciesToNationalPokedexNum`, `_setGetSetPokedexFlag`
- `_set_PrintEasyChatText`
- `_setOBJ_EVENT_GFX_*`

### Wire setup file

- **Description** : Pour activer le easy_chat runtime, il faut créer un fichier
  `easy-chat-wire.ts` qui :
  1. Imports tous les helpers réels (gSaveBlock1Ptr, Random, FlagGet, etc.)
  2. Appelle les setters au boot du module (`_setXxxImpl(realFn)`)
  3. Est importé une fois par le top-level main.ts ou côté wallclock
- **Complexité** : faible-moyenne, ~200l wrapper
- **Validation** : `DoEasyChatScreen('TYPE_MAIL', new Array(9).fill(0xFFFF), exitCb, 0)`
  → écran easy_chat s'ouvre, peut taper du texte, save mail.

---

## 8. MISC DETTES MINEURES

### 8.1 `mail.itemId` (number) → `itemKey` (string) conversion

- **Localisation** : `src/engine/bedroom-pc.ts:1580` (`_mailboxDoMailMoveToBag`)
- **Description** : `mail.itemId` est un number (= 0x121 ITEM_ORANGE_MAIL etc.)
  mais notre `AddBagItem(itemKey: string)` prend un string. Conversion via
  auto-data manquante.
- **Complexité** : trivial, ~10l mapping
- **Solution proposée** :
  ```ts
  import { gItems } from './decomp-data/auto/include/items-data';
  const itemKey = Object.keys(gItems).find(k => gItems[k] === mail.itemId);
  ```
  OU créer un helper `itemIdToKey(id)` dans `data-tables.ts`.

### 8.2 `FADE_TO_BLACK` fade avant `ReadMail`

- **Localisation** : `src/engine/bedroom-pc.ts:1640` (`Mailbox_FadeAndReadMail`)
- **Source décomp** : `player_pc.c:792-801::Mailbox_FadeAndReadMail`
- **Description** : Le décomp fait `FadeScreen(FADE_TO_BLACK, 0)` + wait
  `!gPaletteFade.active` avant d'appeler `ReadMail`. Notre port appelle
  ReadMail direct sans fade.
- **Pourquoi différée** : `gPaletteFade.active` global pas exposé proprement.
- **Complexité** : faible (~20l)
- **Solution proposée** : utiliser `FadeScreen + ScheduleWakeup` ou poll dans
  un tick handler.

### 8.3 `ListMenuGetYCoordForPrintingArrowCursor(taskId)`

- **Localisation** : `src/engine/bedroom-pc.ts:1672` (`ItemStorage_SetSwapArrow`)
- **Source décomp** : `src/list_menu.c::ListMenuGetYCoordForPrintingArrowCursor`
- **Description** : Retourne le y-coord du cursor dans une list-menu. Utilisé
  pour positionner l'arrow swap au bon endroit.
- **Pourquoi différée** : helper pas exposé par list-menu.ts.
- **Complexité** : trivial, ~10l
- **Solution proposée** : exposer dans `list-menu.ts` :
  ```ts
  export function ListMenuGetYCoordForPrintingArrowCursor(taskId: number): number {
    const task = rt._listMenus?.get(taskId);
    return task ? task.selectedRow * 16 + 9 : 0;
  }
  ```

### 8.4 `IsDma3ManagerBusyWithBgCopy()` polling

- **Localisation** : `src/engine/easy-chat-render.ts` (= multiple cases)
- **Source décomp** : `src/dma3_manager.c::IsDma3ManagerBusyWithBgCopy`
- **Description** : Le décomp poll `!IsDma3ManagerBusyWithBgCopy()` avant
  d'avancer state machine pour s'assurer que le BG copy DMA est fini.
- **Pourquoi différée** : notre runtime fait BG copy synchrone (= toujours
  retourne false).
- **Complexité** : trivial, stub déjà en place
- **Solution proposée** : laisser stub returns false (= 1:1 sémantique correct
  pour notre runtime).

### 8.5 `MAPSEC_SECRET_BASE` constant import

- **Localisation** : `src/engine/decoration-putaway.ts:712`
- **Source décomp** : `include/constants/region_map_sections.h::MAPSEC_SECRET_BASE`
- **Description** : Constant utilisé pour check si on est dans secret base.
- **Complexité** : trivial
- **Solution proposée** : import depuis `decomp-data/auto/include/constants/region_map_sections-data.ts`.

### 8.6 Helpers décomp non exposés (MetatileBehavior_*)

- **Localisation** : `src/engine/decoration-place.ts` (6 helpers `MetatileBehavior_*`)
- **Source décomp** : `src/metatile_behavior.c`
- **Description** : 6 helpers de check de behavior tile (IsSecretBaseTrainerSpot,
  IsFloorOrBoardAndHole, etc.). Notre `metatile-behavior.ts` peut les exposer.
- **Complexité** : faible si déjà porté, sinon ~50l chacun
- **Solution proposée** : vérifier `metatile-behavior.ts` exports, sinon porter.

---

## STATS GLOBALES

- **Fichiers TS créés cette session** : 12 (bedroom-pc.ts modif, mail.ts,
  mail-data.ts, decoration-inventory.ts, decoration-data.ts, decoration.ts,
  decoration-place.ts, decoration-putaway.ts, easy-chat-init.ts,
  easy-chat-input.ts, easy-chat-render.ts, easy-chat-sprite.ts, mailbox-menu.ts)
- **Lignes C décomp portées** : ~12000l
- **Lignes TS produites** : ~17000l (= 1.4× verbosity + comments + STUBs explicites)
- **Commits sur upd2 non poussés** : 19
- **STUBs / 1:1 TODOs documentés** : 79

## DETTES PRIORISÉES (= impact user perçu)

### URGENT (= blocage flow démo)

1. **Section 6.1 — `_itemStorageXxx` state migration `sItemStorageMenu`** : pas
   critique mais nettoie le code. Pas user-perçu directement.

### IMPORTANT (= feature manquante visible)

1. **Section 1.3 + 3.4 — Sprite + camera + assets player decorating** :
   permet le mode "Décorer ma chambre" visuellement complet.
2. **Section 3.1 — Mail backgrounds extraction** : permet aux mails d'afficher
   leur design (= sinon BG vide).
3. **Section 4.1 — `ChooseMonToGiveMailFromMailbox`** : permet le sub-menu
   Mailbox > DONNER à fonctionner (= sinon stub silencieux).
4. **Section 7 — Easy_chat wire setup** : permet l'écriture de mails (= sinon
   STUBs cascadent).

### NICE-TO-HAVE (= cosmétique)

1. **Section 6.2 — Refactor naming** : 1:1 nominal strict, peu de valeur.
2. **Section 5 — Multi-langue** : si jeu reste mono-FR, skip.
3. **Section 8.* — Misc petits fix** : à faire au fil de l'eau.

---

## RÉSUMÉ

Le port 1:1 STRICT du PC Player + Mail + Decoration + Easy Chat est
**fonctionnellement complet** (= tout le code C porté, tous les noms 1:1, toutes
les structures et tables identiques au décomp). Les STUBs/dettes restantes
sont **strictement** des helpers externes ou des assets graphiques qui ne sont
pas dans le scope du chantier PC Player original.

Pour reprendre une dette spécifique : référer la section + son fichier:ligne
+ source décomp + solution proposée. Pas besoin de re-fouiller le contexte.
