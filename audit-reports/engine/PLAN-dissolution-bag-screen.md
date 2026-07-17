# PLAN de dissolution du clone `bag-screen.ts`

Défrichage LECTURE SEULE — préparation Phase C du plan `docs/CHANTIER-MOTEUR-100.md`
(§PHASE C.1, lignes 56-73 : « bag-screen.ts (clone list_menu, utilisé par sac de
combat battle_controller_player.ts:2062 + ItemPC player_pc.ts:621) »).

Méthode imposée par §PHASE C.2 : *porter la fonction décomp 1:1 dans le .ts miroir du
.c d'origine → rediriger TOUS les call-sites → SUPPRIMER la copie locale → tsc → test
en jeu de l'écran touché.*

---

## 0. Résumé exécutif (verdicts)

| Question | Verdict |
|---|---|
| Taille du clone | `src/engine/bag/bag-screen.ts` = **3219 lignes, 86 fonctions, 12 exports**. |
| Le port 1:1 existe-t-il ? | **OUI** : `src/item_menu.ts` (3529 lignes, miroir `item_menu.c` 2609 l.) sert **déjà le sac overworld en jeu** (`start_menu.ts:90` `import { OpenBagScreen } from './item_menu'`). Le clone n'a plus que **2 call-sites gameplay** + 1 boot. |
| Call-sites RÉELS du clone | **3 fichiers** : `harness/main.ts:93-95` (preload assets), `battle_controller_player.ts:2062` (sac combat), `player_pc.ts:621` (ItemPC deposit). Tous les autres « bag-screen » du repo sont des **commentaires** (shop.ts, trainer_card.ts, party_menu.ts, start_menu.ts). |
| ItemPC = item_menu ou UI propre ? | **MIXTE.** DÉPÔT (deposit) = `item_menu.c` (`CB2_GoToItemDepositMenu` → `GoToBagMenu(ITEMMENULOCATION_ITEMPC,…)`). RETRAIT + JETER (withdraw/toss) = **UI PROPRE de `player_pc.c`** (list_menu maison sur `gSaveBlock1Ptr->pcItems`), déjà portée inline dans `player_pc.ts`. Donc pour `player_pc.ts:621`, la cible EST `item_menu.ts` (mode ITEMPC), mais il faut d'abord y **porter le context Deposit**. |
| Fns d'item_menu.c manquantes pour le COMBAT | **~6** : `GetItemBattleFunc` + `ItemUseInBattle_{PokeBall,StatIncrease,Medicine,PPRecovery,Escape}` + `ItemUseInBattle_ShowPartyMenu` (leur vrai domicile = `item_use.c`, PAS `item_menu.c`) ; PLUS le câblage `_cb2SetUpReshowBattleScreenAfterMenu2` (actuellement `null`, item_menu.ts:538). Le `ItemMenu_UseInBattle` d'item_menu.ts (3448) est aujourd'hui **simplifié** (fade+close). |
| Fns manquantes pour l'ItemPC | **4** : `CB2_GoToItemDepositMenu` (item_menu.c:593), `Task_ItemContext_Deposit` (2203), `Task_ChooseHowManyToDeposit` (2223), `TryDepositItem`+`WaitDepositErrorMessage` (2248/2276). Côté PC : `CB2_PlayerPCExitBagMenu` + `ItemStorage_ReshowAfterBagMenu` (player_pc.c:571/577) à transcrire dans `player_pc.ts`. |
| Nombre de lots d'exécution | **6 lots** (≤ ~300 l. diff chacun). |
| Risque n°1 | **Le flux d'USAGE d'objet EN COMBAT (`GetItemBattleFunc` + `ItemUseInBattle_*`) n'existe 1:1 NULLE PART** — il est uniquement *inliné* dans le clone (bag-screen.ts:1773-1887). Le chemin Médecine/PP passe par le party-menu (multi-écrans : sac → party → sac → reshow combat). C'est le seul vrai « lift » ; le reste est du câblage. |

---

## 1. Inventaire du clone → équivalent item_menu

Le clone est une **state-machine maison à chaînes `_phase`** (bag-screen.ts:227-237) alors
qu'item_menu.ts est une **machine à `gTasks`/`task.func` 1:1**. La quasi-totalité des 86
fonctions du clone a **déjà** son équivalent 1:1 DANS item_menu.ts (puisqu'il sert
l'overworld). Table par sous-système (clone `fn:ligne` ↔ cible `item_menu.ts fn:ligne`
/ `item_menu.c:ligne`) :

### 1.a Cycle de vie / CB2 / setup (tous couverts)
| Clone (bag-screen.ts) | Équivalent item_menu.ts | Décomp item_menu.c |
|---|---|---|
| `OpenBagScreen` :974 | `GoToBagMenu` :545 | :617 |
| `OpenBagScreenForBattle` :966 | `CB2_BagMenuFromBattle` :507 | :568 |
| `CB2_InitBagMenu` :3061 (state 0-20) | `CB2_Bag`:578 + `SetupBagMenu` :584 | :672/:678 |
| `_initBagBgs` :2875 | `BagMenu_InitBGs` :394 | (BagMenu_InitBGs) |
| `_loadBagMenuGraphicsCb2` :2912 | `LoadBagMenu_Graphics` :431 | (LoadBagMenu_Graphics) |
| `_loadBagMenuTextWindowsCb2` :2967 | `LoadBagMenuTextWindows` :684 | :2457 |
| `MainCB2_BagMenuRun`:2777 / `VBlankCB…`:2783 | idem :570/:571 | :646/:655 |
| `CloseBagScreen`:2300 / `Task_FadeAndCloseBagMenu_BagScreen`:2790 / `Task_CloseBagMenu_BagScreen`:2805 | `Task_FadeAndCloseBagMenu` :1826 + `Task_CloseBagMenu` :1833 | :1077/:1083 |
| `_freeBagMenu` :3010 | `FreeBagMenu` :1494 | (FreeBagMenu) |
| `preloadBagAssets`:522 / `initItemIconMap`:806 / `_loadAssets`:478 | `_bagLoadAssets` :303 (lazy dans LoadBagMenu_Graphics) | — (adaptation asset ; **pas d'équivalent 1:1 à conserver**, voir §5.d) |

### 1.b Rendu liste / header / desc / dots / icône (tous couverts)
| Clone | item_menu.ts | item_menu.c |
|---|---|---|
| `_drawList` :628 | `BagMenu_ItemPrintCallback` :1054 + `LoadBagItemListBuffers` :1113 | :969 / :… |
| `_drawHeader`+`_drawPocketDots` :578/:565 | `PrintPocketNames`:1165 + `CopyPocketNameToWindow`:1198 + `DrawPocketIndicatorSquare`:1229 | :… |
| `_drawDesc` :710 | `PrintItemDescription` :934 | :1008 |
| `_drawItemIcon` :877 (+`_ensureItemIconLoaded`, `_itemIconUrlBase`, `initItemIconMap`) | `AddBagItemIconSprite` (item_menu_icons.ts:103) | item_menu_icons.c:535 |
| `_currentPocketItems`:536 / `_selectedItemKey`:544 | `UpdatePocketItemList`:785 + `BagGetItemIdByPocketPosition` | :… |
| `_wrap` :760 | *sans équivalent — invention maison* (item_menu.ts utilise `\n` du décomp, pas de wrap JS) |

### 1.c Sprite sac + flèches + rotating ball (tous couverts par item_menu_icons.ts)
| Clone | Équivalent |
|---|---|
| `_spawnBagSpriteOam`:1052 / `_updateBagSpriteOam`:2164 / `_triggerBagShake`:2208 / `_bagShakeApplyMatrix`:2229 / `_tickBagSpriteShake`:2246 / `_tickBagSpriteJumpAnim`:2183 | `AddBagVisualSprite` / `ShakeBagSprite` / `SetBagVisualPocketId` (item_menu_icons.ts, importés item_menu.ts:56) |
| `_spawnPocketArrows`:1133 / `_despawnPocketArrows`:1173 / `_tickPocketArrows`:1200 | `CreatePocketSwitchArrowPair`:1330 / `DestroyPocketSwitchArrowPair`:1336 |
| `_spawnListScrollArrows`:1225 / `_despawn…`:1256 / `_tick…`:1279 | `CreatePocketScrollArrowPair`:1321 / `BagDestroyPocketScrollArrowPair`:1484 |
| `_spawnRotatingBallSprite`:1309 / `_updateBallCoords`:1394 / `_ballApplyMatrix`:1414 / `_ballInitCallback`:1440 / `_ballContinueCallback`:1475 / `_tickRotatingBall`:1491 / `_despawnRotatingBall`:1355 | `AddSwitchPocketRotatingBallSprite` (item_menu_icons.ts, importé item_menu.ts:56) |

### 1.d Switch de poche (couvert)
| Clone | item_menu.ts | item_menu.c |
|---|---|---|
| `_startPocketSwitchAnim`:1098 / `_tickPocketSwitchAnim`:1500 | `SwitchBagPocket`:1692 + `Task_SwitchBagPocket`:1769 | :… |
| `_fillBgTilemapRect`:1026 | `DrawItemListBgRow` :1223 | :… |

### 1.e Context menu + actions (couvert, SAUF battle-use réel)
| Clone | item_menu.ts | item_menu.c |
|---|---|---|
| `_openContextMenu`:1550 / `_drawContextMenu`:1616 / `_closeContextMenu`:1650 / `_ctxMoveCursor`:1674 / `_tickContextMenu`:1689 | `OpenContextMenu`:2339 + `Task_ItemContext_SingleRow`:2412 + `…MultipleRows`:2432 + `RemoveContextWindow`:2461 | :1518/:1702/:1723/:1784 |
| `_executeAction`:1737 — CANCEL/TOSS/REGISTER/GIVE branches | `sItemMenuActions[]`:2160+ → `ItemMenu_Cancel`/`ItemMenu_Toss`:2958/`ItemMenu_Register`:3308/`ItemMenu_Give`:3398 | :… |
| `_executeAction` — **BATTLE_USE** branch :1773-1887 (PokeBall/StatIncrease/Medicine/PPRecovery/Escape inline) | `ItemMenu_UseInBattle`:3448 **= SIMPLIFIÉ** (fade+close) — **équivalent PAS ENCORE porté 1:1** (voir §5.a) | :1997 |
| Toss : `_startToss`:1888 / `_drawTossQuantity`:1930 / `_tickTossQuantity`:1949 / `_askTossItems`:1979 / `_drawYesNo`:1988 / `_tickTossConfirm`:2007 / `_confirmToss`:2038 / `_tickTossMessage`:2043 / `_cancelToss`:2065 | `ItemMenu_Toss`:2958 / `Task_ChooseHowManyToToss`:2974 / `AskTossItems`:2992 / `ConfirmToss`:3001 / `Task_RemoveItemFromBag`:3013 / `CancelToss`:3027 | :1810+ |
| Swap : `_canSwapItems`:2086 / `_startItemSwap`:2093 / `_doItemSwap`:2115 / `_cancelItemSwap`:2153 | `CanSwapItems`:1519 / `StartItemSwap`:1532 / `DoItemSwap`:1598 / `CancelItemSwap`:1629 | :… |

### 1.f ItemPC deposit (équivalent PAS ENCORE porté dans item_menu.ts)
| Clone | Cible item_menu.ts | Décomp à transcrire |
|---|---|---|
| `_itemContextDeposit`:2547 | *(à créer)* `Task_ItemContext_Deposit` | **item_menu.c:2203** |
| `_drawDepositQtyWindow`:2605 / `_tickItemPCDepositQty`:2656 | *(à créer)* `Task_ChooseHowManyToDeposit` | **item_menu.c:2223** |
| `_tryDepositItem`:2693 / `_tickItemPCDepositMsg`:2725 | *(à créer)* `TryDepositItem` + `WaitDepositErrorMessage` | **item_menu.c:2248 / :2276** |
| `_getBagPocketSlots`:2586 / `_findBagItemIdx`:2595 | déjà : `BagGetItemIdByPocketPosition` / `UpdatePocketItemList` | — |

### 1.g Sans équivalent (inventions maison à NE PAS reporter)
- `_wrap` :760 (word-wrap JS ; item_menu utilise les `\n` du décomp).
- `_drawSprite` :550 (no-op mort, commenté).
- `_ensureStdMenuPal` :2764, `_splitOwLines`:2621, `_printDescription`:2640 (helpers ad-hoc du clone — item_menu.ts a `BagMenu_Print`:901 + `PrintItemDescription`:934).
- Le bridge `__battleBagResultItemId` (globalThis) — invention du clone pour le combat inline ; à remplacer par `gSpecialVar.ItemId` 1:1 (voir §3).

**Conclusion inventaire :** hors combat-use réel et ItemPC-deposit, **100 % du clone a déjà
son miroir 1:1 vivant dans item_menu.ts/item_menu_icons.ts**. La dissolution est surtout un
**recâblage de 3 call-sites** + **2 petits ports** (deposit, battle-use).

---

## 2. Call-sites entrants (grep complet)

Grep `bag-screen` sur `src/` + `harness/` → seulement **3 imports réels** (le reste = commentaires) :

### 2.a `harness/main.ts:93-95` — boot preload
```
93: import { preloadBagAssets, initItemIconMap } from '../src/engine/bag/bag-screen';
94: preloadBagAssets();
95: void initItemIconMap();
```
- **Usage** : précharge sprite sac + `item-icon-map.json`/`item-palette-map.json` du clone.
- **Remplacement** : **SUPPRIMER** les 3 lignes. item_menu.ts charge ses assets en lazy
  dans `SetupBagMenu`→`LoadBagMenu_Graphics` (item_menu.ts:431→`_bagLoadAssets`:303), et
  les icônes via `AddBagItemIconSprite`→`AddItemIconSprite` (item_icon.ts, **n'utilise PAS**
  `item-icon-map.json`). Vérifié : `item_menu_icons.ts` n'importe ni `initItemIconMap` ni la
  map JSON. → aucun préchargement de remplacement requis (au pire, ajouter un
  `void _bagLoadAssets()` de préchauffe, optionnel).

### 2.b `src/battle_controller_player.ts:2062` — sac de COMBAT
```
2047: function _OpenBagAndChooseItem(): void {
2054:   if (getRuntime()?.gPaletteFade?.active) return;
2055:   gBattlerControllerFuncs[gActiveBattler] = _CompleteWhenChoseItem;
2056:   (globalThis…).__battleBagResultItemId = 0;
2057:   (globalThis…).__battleReshowDone = false;
2058:   void Promise.all([ import('./engine/bag/bag-screen'), import('./reshow_battle_screen') ])
2062:     .then(([bag, reshow]) => bag.OpenBagScreenForBattle(reshow.CB2_SetUpReshowBattleScreenAfterMenu));
```
- **Usage** : ouvre le sac en mode BATTLE ; l'objet choisi revient via le global
  `__battleBagResultItemId`, lu par `_CompleteWhenChoseItem` :2071-2077 qui l'émet via
  `BtlController_EmitOneReturnValue(B_COMM_TO_ENGINE, itemId)`.
- **Remplacement** : appeler `CB2_BagMenuFromBattle()` d'item_menu.ts (:507), et faire lire
  `gSpecialVar.ItemId` par `_CompleteWhenChoseItem` (1:1 décomp `CompleteWhenChoseItem`
  bcp.c:1386 = `EmitOneReturnValue(…, gSpecialVar_ItemId)`). Détail §3 + §6-Lot 4.

### 2.c `src/player_pc.ts:621` — ItemPC DÉPÔT
```
604: function _itemStorageDeposit(): void { … ferme le PC …
621:   void import('./engine/bag/bag-screen').then(({ OpenBagScreen, BAG_LOCATION_ITEMPC }) => {
622:     OpenBagScreen(undefined, BAG_LOCATION_ITEMPC, () => { … réouvre le PC … });
```
- **Usage** : ouvre le sac en mode ITEMPC pour choisir un objet à déposer dans le PC ;
  au close, réouvre le PC (bricolage `setTimeout` + `OpenBedroomPC(true)`).
- **Remplacement** : appeler `CB2_GoToItemDepositMenu()` (à porter dans item_menu.ts,
  1:1 :593) qui fait `GoToBagMenu(ITEMMENULOCATION_ITEMPC, POCKETS_COUNT, CB2_PlayerPCExitBagMenu)`.
  Le retour se fait par `CB2_PlayerPCExitBagMenu` (à porter dans player_pc.ts, 1:1
  player_pc.c:571) → `gFieldCallback = ItemStorage_ReshowAfterBagMenu ; CB2_ReturnToField`.
  Détail §4 + §6-Lot 3.

> ⚠️ **Dead code repéré** : `player_pc.ts:650 _depositOpenList` (+ `sDepositListItems`) est une
> UI deposit inline **jamais appelée** (grep : 1 seule occurrence = la définition). À supprimer
> au passage (échafaudage abandonné).

---

## 3. Flux COMBAT exact (décomp ↔ notre port)

### 3.a Décomp (le contrat)
1. `PlayerHandleChooseItem` (bcp.c:2653) → `gBattlerControllerFuncs[…] = OpenBagAndChooseItem` (:2658).
2. `OpenBagAndChooseItem` (bcp.c:1375) : quand `!gPaletteFade.active` →
   `gBattlerControllerFuncs[…] = CompleteWhenChoseItem` ; `ReshowBattleScreenDummy()` ;
   `FreeAllWindowBuffers()` ; **`CB2_BagMenuFromBattle()`** (:1382).
3. `CB2_BagMenuFromBattle` (item_menu.c:568) →
   `GoToBagMenu(ITEMMENULOCATION_BATTLE, POCKETS_COUNT, CB2_SetUpReshowBattleScreenAfterMenu2)` (:571).
4. Sélection A sur un objet → `Task_BagMenu_HandleInput` pose `gSpecialVar_ItemId = item`
   puis `sContextMenuFuncs[BATTLE] = Task_ItemContext_Normal` (item_menu.c:346).
5. Context menu → action `ACTION_BATTLE_USE` → `ItemMenu_UseInBattle` (item_menu.c:1997) :
   `if (GetItemBattleFunc(gSpecialVar_ItemId)) { RemoveContextWindow(); GetItemBattleFunc(item)(taskId); }`.
6. `GetItemBattleFunc` renvoie un `ItemUseInBattle_*` (item_use.c) :
   - **PokeBall** → `ItemUseInBattle_PokeBall` (item_use.c:~945) : party+box pleins ? refus.
     sinon `RemoveBagItem` + `Task_FadeAndCloseBagMenu`.
   - **StatIncrease (X Attaque…)** → `Task_UseStatIncreaseItem` sur mon actif ; échec = `gText_WontHaveEffect`.
   - **Medicine / PPRecovery** → `ItemUseInBattle_Medicine`/`_PPRecovery` (item_use.c:1026/1039) :
     `gItemUseCB = ItemUseCB_*` puis `ItemUseInBattle_ShowPartyMenu` (:1012) :
     `gBagMenu->newScreenCallback = ChooseMonForInBattleItem ; Task_FadeAndCloseBagMenu`
     (→ **sac se ferme VERS le party-menu**, mon choisi, effet appliqué, retour).
   - **Escape (Poké Poupée)** → `ItemUseInBattle_Escape` (item_use.c:1046) : wild → `RemoveUsedItem` + close ; dresseur → `DadsAdvice`.
7. Fermeture → exitCallback `CB2_SetUpReshowBattleScreenAfterMenu2` (bcp.c:1555) →
   `ReshowBattleScreenAfterMenu` → `gMain.callback2 == BattleMainCB2`.
8. `CompleteWhenChoseItem` (bcp.c:1386) : `BtlController_EmitOneReturnValue(B_COMM_TO_ENGINE, gSpecialVar_ItemId)` + `PlayerBufferExecCompleted`.
   (annulation B = `gSpecialVar_ItemId` reste `ITEM_NONE`=0.)

### 3.b Notre `battle_controller_player.ts:2062` aujourd'hui
- Appelle le **clone** `OpenBagScreenForBattle(reshow.CB2_SetUpReshowBattleScreenAfterMenu)` (:2062).
- Le clone fait TOUT l'effet **inline** (bag-screen.ts:1773-1887) et pose `__battleBagResultItemId`
  (PokeBall :1798, StatIncrease :1819 via `PokemonUseItemEffects`, Medicine/PP :1842 via
  `party_menu.OpenPartyScreenForItemUse`, Escape :1863).
- `_CompleteWhenChoseItem` (:2071) lit `__battleBagResultItemId` (PAS `gSpecialVar.ItemId`) et l'émet (:2075).

### 3.c État d'item_menu.ts côté combat
- `CB2_BagMenuFromBattle` :507 **existe** mais son exitCallback `_cb2SetUpReshowBattleScreenAfterMenu2`
  = **`null`** (item_menu.ts:538). → à câbler.
- Le context BATTLE **fonctionne** : `OpenContextMenu` gère `ITEMMENULOCATION_BATTLE` (:2345)
  → `sContextMenuItems_BattleUse` ; dispatch A via le `default` de `Task_BagMenu_HandleInput`
  (:2040) → `Task_ItemContext_Normal`.
- `ItemMenu_UseInBattle` :3448 = **simplifié** : `RemoveContextWindow(); Task_FadeAndCloseBagMenu(task)`
  — pose seulement `gSpecialVar.ItemId` (fait à la sélection A, :2019) SANS exécuter l'effet.
- `GetItemBattleFunc` + `ItemUseInBattle_*` = **ABSENTS** de `src/` (grep : 0 hit hors clone).

### 3.d Décision d'exécution (1:1 vs adaptation)
Le contrat (CLAUDE.md Règle 1) impose de **transcrire**, pas de reporter le hack inline du clone.
La cible 1:1 = **porter `GetItemBattleFunc` dans `src/item.ts`** (domicile `item.c:941`) **+
les `ItemUseInBattle_*` dans `src/item_use.ts`** (domicile `item_use.c`), puis brancher
`ItemMenu_UseInBattle` dessus. Infrastructure
déjà en place : `OpenPartyScreenForItemUse` (party_menu.ts:4197) + `CB2_ReturnToBagMenu`
(party_menu.ts:2468) portent le sous-flux Médecine. `PokemonUseItemEffects` (bag-item-effects)
et `RemoveBagItem` existent déjà.

---

## 4. Flux ItemPC exact (décomp ↔ notre port)

### 4.a Décomp — TROIS actions, DEUX UI différentes
`sItemStorage_MenuActions` (player_pc.c:219-221) : `WITHDRAW`→`ItemStorage_Withdraw`,
`DEPOSIT`→`ItemStorage_Deposit`, `TOSS`→`ItemStorage_Toss`.

- **WITHDRAW (player_pc.c:591)** + **TOSS (player_pc.c:609)** : **UI PROPRE de player_pc.c**
  (`ItemStorage_Enter`, `SetItemListPerPageCount(gSaveBlock1Ptr->pcItems, …)` :1131, list_menu
  maison listant les objets **du PC**). **N'utilise PAS item_menu.c.**
- **DEPOSIT (player_pc.c:555)** → `Task_ItemStorage_Deposit` (:561) : après fade,
  `CleanupOverworldWindowsAndTilemaps()` + **`CB2_GoToItemDepositMenu()`** (:566) + `DestroyTask`.
  `CB2_GoToItemDepositMenu` (item_menu.c:593) = `GoToBagMenu(ITEMMENULOCATION_ITEMPC,
  POCKETS_COUNT, CB2_PlayerPCExitBagMenu)`. → **liste les objets DU SAC** pour en choisir un à
  déposer ; c'est le SEUL chemin ItemPC qui passe par item_menu.c.
- Sélection dans le sac ITEMPC → `sContextMenuFuncs[ITEMMENULOCATION_ITEMPC] = Task_ItemContext_Deposit`
  (item_menu.c:351) → `Task_ChooseHowManyToDeposit`:2223 → `TryDepositItem`:2248
  (`GetItemImportance` refus / `AddPCItem` OK / plein) → `Task_RemoveItemFromBag`:2266 / `WaitDepositErrorMessage`:2276.
- Retour PC : `CB2_PlayerPCExitBagMenu` (player_pc.c:571) : `gFieldCallback = ItemStorage_ReshowAfterBagMenu ; SetMainCallback2(CB2_ReturnToField)` ; `ItemStorage_ReshowAfterBagMenu` (:577) redessine le menu PC.

### 4.b VERDICT ItemPC (question 4 de la mission)
La cible pour `player_pc.ts:621` **EST bien `item_menu.ts` mode ITEMPC** — MAIS uniquement pour
le DÉPÔT (c'est exactement ce que fait le décomp). Le RETRAIT et le JETER restent la **UI propre
de player_pc.ts** (déjà portée inline : `_itemStorageEnter`:854, list-menu PC). **Aucune** de ces
deux dernières ne doit migrer vers item_menu. Donc le plan ItemPC = (i) porter le context Deposit
dans item_menu.ts, (ii) porter `CB2_GoToItemDepositMenu` + `CB2_PlayerPCExitBagMenu` +
`ItemStorage_ReshowAfterBagMenu`, (iii) remplacer l'appel clone par `CB2_GoToItemDepositMenu()`.

### 4.c État d'item_menu.ts côté ItemPC
- `ITEMMENULOCATION_ITEMPC` déclaré (:131), présent dans `sBagMenu_ReturnToStrings` (:742 = `gText_ThePC`).
- **MAIS** : `Task_BagMenu_HandleInput` (:2040) n'a **pas** de branche ITEMPC → tomberait dans
  `default`→`Task_ItemContext_Normal` (FAUX, donnerait un menu Use/Give/Toss au lieu du dépôt).
- `Task_ItemContext_Deposit` / `Task_ChooseHowManyToDeposit` / `TryDepositItem` = **ABSENTS**
  (grep : 0 hit dans item_menu.ts).
- `CB2_GoToItemDepositMenu` = **ABSENT** d'item_menu.ts.
- Dépendances déjà prêtes : `AddPCItem` (item.ts:382), `GetItemImportance` (item.ts:74),
  fenêtre quantité `ITEMWIN_QUANTITY` (item_menu.ts:2129) + `AdjustQuantityAccordingToDPadInput`
  (menu_helpers, importé :62) + `Task_RemoveItemFromBag` (:3013) réutilisables tels quels.

---

## 5. Ce qui manque dans item_menu.ts (par location, avec lignes .c)

Grep `ITEMMENULOCATION_*` dans item_menu.ts → locations GÉRÉES aujourd'hui : FIELD, BATTLE
(partiel), PARTY, SHOP, BERRY_TREE, BERRY_BLENDER_CRUSH, PCBOX, FAVOR_LADY, QUIZ_LADY, WALLY
(via OpenContextMenu). **NON gérées** : ITEMPC (context), APPRENTICE (hors-solo).

### 5.a COMBAT — à transcrire
Domicile `GetItemBattleFunc` = **`item.c:941`** → `src/item.ts` (où vivent déjà `AddPCItem`/
`GetItemImportance`). Domicile des `ItemUseInBattle_*` = **`item_use.c`** → `src/item_use.ts`.
1. `GetItemBattleFunc(itemId)` — **item.c:941** (`include/item.h:76`).
2. `ItemUseInBattle_PokeBall` — item_use.c:949.
3. `ItemUseInBattle_StatIncrease` — item_use.c:994 (+ `Task_UseStatIncreaseItem` :980).
4. `ItemUseInBattle_ShowPartyMenu` — item_use.c:1012.
5. `ItemUseInBattle_Medicine` — item_use.c:1026.
6. `ItemUseInBattle_PPRecovery` — item_use.c:1039.
7. `ItemUseInBattle_Escape` — item_use.c:1046.

Dans `item_menu.ts` :
- Remplacer `ItemMenu_UseInBattle` (:3448) par le 1:1 :1997 (`GetItemBattleFunc(gSpecialVar.ItemId)(task)`).
- Câbler `_cb2SetUpReshowBattleScreenAfterMenu2` (:538) → un `CB2_SetUpReshowBattleScreenAfterMenu2`
  réel (miroir bcp.c:1555 = `SetMainCallback2(ReshowBattleScreenAfterMenu)`), résolu via pont
  globalThis (anti-cycle item_menu↔battle, cf. le pattern déjà utilisé pour FavorLady :3489).

### 5.b ITEMPC — à transcrire (domicile = `item_menu.c`)
1. `CB2_GoToItemDepositMenu` — item_menu.c:593.
2. `Task_ItemContext_Deposit` — item_menu.c:2203.
3. `Task_ChooseHowManyToDeposit` — item_menu.c:2223.
4. `TryDepositItem` — item_menu.c:2248.
5. `WaitDepositErrorMessage` — item_menu.c:2276.
6. Ajouter la branche `ITEMMENULOCATION_ITEMPC` dans `Task_BagMenu_HandleInput` (:2040)
   → `SetTaskFuncWithFollowupFunc(taskId, Task_ItemContext_Deposit, Task_BagMenu_HandleInput)`
   (1:1 `sContextMenuFuncs[ITEMPC]`).

Côté `player_pc.ts` (domicile `player_pc.c`) :
7. `CB2_PlayerPCExitBagMenu` — player_pc.c:571.
8. `ItemStorage_ReshowAfterBagMenu` + `ItemStorage_HandleReturnToProcessInput` — player_pc.c:577/585.

### 5.c Data requise
- `items.json` doit exposer `.battleUsage`/`.battleUseFunc` (le clone les lit via
  `_ensureItemsJson`:950 / `_itemBattleUseFunc`:957). Vérifier que la table décomp
  `gItems[].battleUsage` est extraite ; sinon l'extraire (dépendance du Lot 4).

### 5.d Assets (pas de 1:1 à conserver)
- `preloadBagAssets`/`initItemIconMap`/`item-icon-map.json` = **système asset du clone**,
  distinct de celui d'item_menu (`AddItemIconSprite` via `getItemKeyById`). À supprimer avec le clone.

---

## 6. Plan d'exécution ordonné (6 lots ≤ ~300 l. diff)

> Invariant à CHAQUE lot : `npx tsc --noEmit` = 0. Le clone RESTE en place et fonctionnel
> jusqu'au Lot 6 (aucune régression du sac combat/PC pendant les lots préparatoires).

### LOT 1 — Porter le context ItemPC-Deposit dans item_menu.ts (INERTE) — ✅ FAIT `c55e3f790`
- **Fichiers** : `src/item_menu.ts`.
- **Contenu** : transcrire `Task_ItemContext_Deposit` (:2203), `Task_ChooseHowManyToDeposit`
  (:2223), `TryDepositItem` (:2248), `WaitDepositErrorMessage` (:2276) + `CB2_GoToItemDepositMenu`
  (:593). Réutiliser `BagMenu_AddWindow(ITEMWIN_QUANTITY)`, `AdjustQuantityAccordingToDPadInput`,
  `Task_RemoveItemFromBag`, `AddPCItem`, `GetItemImportance`. Ajouter la branche ITEMPC dans
  `Task_BagMenu_HandleInput` (:2040). **Laisser INERTE** (non appelé : player_pc.ts appelle
  encore le clone).
- **Test** : `tsc` vert + boot sain. (Pas de test en jeu — code inerte, Règle 2.)
- **Critère** : compile, `CB2_GoToItemDepositMenu` exporté.

### LOT 2 — Porter les callbacks retour ItemPC dans player_pc.ts (INERTE) — ✅ FAIT `a002604b6` (avec le LOT 3, validé en jeu 2026-07-17)
- **Fichiers** : `src/player_pc.ts`.
- **Contenu** : transcrire `CB2_PlayerPCExitBagMenu` (player_pc.c:571), `ItemStorage_ReshowAfterBagMenu`
  (:577), `ItemStorage_HandleReturnToProcessInput` (:585). Supprimer le dead code `_depositOpenList`
  + `sDepositListItems` (:645-703). **Laisser INERTE** (`_itemStorageDeposit` appelle encore le clone).
- **Test** : `tsc` vert + boot sain.
- **Critère** : compile, `CB2_PlayerPCExitBagMenu` prêt à être posé comme exitCallback.

### LOT 3 — Basculer l'ItemPC sur item_menu + SUPPRIMER l'usage clone ITEMPC — ✅ FAIT `a002604b6` (dépôt POTION ×2 validé : sac 5→3, PC 1+2=3, retour curseur DEPOSER, pas de start menu fantôme)
- **Fichiers** : `src/player_pc.ts`.
- **Contenu** : remplacer `_itemStorageDeposit` (:604-641) : au lieu de
  `import('./engine/bag/bag-screen')…OpenBagScreen(…ITEMPC…)`, faire (1:1 `Task_ItemStorage_Deposit`)
  `CleanupOverworldWindowsAndTilemaps()` puis `CB2_GoToItemDepositMenu()` (import depuis
  `./item_menu`). Retirer le bricolage `setTimeout`/`OpenBedroomPC(true)`.
- **Test EN JEU** : PC chambre → STOCKAGE OBJ. → DÉPOSER → choisir objet → quantité → dépôt →
  retour PC. Screenshot. Vérifier : liste = objets du SAC, dépôt retire du sac + ajoute au PC,
  retour PC propre. Non-régression RETIRER/JETER (UI player_pc inchangée).
- **Critère** : ItemPC ne référence plus `bag-screen`.

### LOT 4 — Porter le battle-use réel (item.ts + item_use.ts) + câbler item_menu.ts — ✅ FAIT `c55e3f790` (porté INERTE : GetItemBattleFunc + 7 ItemUseInBattle_* + ItemMenu_UseInBattle_1to1 ; reste le câblage reshow du LOT 5)
- **Fichiers** : `src/item.ts` (`GetItemBattleFunc`), `src/item_use.ts` (les `ItemUseInBattle_*`),
  `src/item_menu.ts` (+ éventuellement extraction data `battleUsage`).
- **Contenu** : transcrire `GetItemBattleFunc` (item.c:941) + `ItemUseInBattle_{PokeBall:949,
  StatIncrease:994,Medicine:1026,PPRecovery:1039,Escape:1046}` + `ItemUseInBattle_ShowPartyMenu:1012`
  (item_use.c). Brancher
  `ItemMenu_UseInBattle` (item_menu.ts:3448) sur le 1:1 :1997. Réutiliser `OpenPartyScreenForItemUse`
  (party_menu.ts:4197) pour le sous-flux Médecine/PP (= `ChooseMonForInBattleItem` via
  `newScreenCallback`). **Laisser le combat encore sur le clone** (test au Lot 5).
- **Test** : `tsc` vert + boot sain.
- **Critère** : compile ; `ItemMenu_UseInBattle` exécute l'effet 1:1.

### LOT 5 — Basculer le sac de combat sur item_menu + SUPPRIMER l'usage clone BATTLE
- **Fichiers** : `src/battle_controller_player.ts`, `src/item_menu.ts`.
- **Contenu** : câbler `_cb2SetUpReshowBattleScreenAfterMenu2` (item_menu.ts:538) → reshow réel
  (pont globalThis vers `reshow_battle_screen`). Dans `_OpenBagAndChooseItem` (:2047) : remplacer
  `import('./engine/bag/bag-screen')…OpenBagScreenForBattle(…)` par `CB2_BagMenuFromBattle()`
  (import `./item_menu`), en posant `gMain.savedCallback`/reshow comme le décomp bcp.c:1375-1382.
  Changer `_CompleteWhenChoseItem` (:2071) pour lire **`gSpecialVar.ItemId`** au lieu de
  `__battleBagResultItemId` (1:1 bcp.c:1390). Retirer les globals `__battleBagResultItemId`/
  `__battleReshowDone`.
- **Test EN JEU** (`__byteVm.load()` + `launchTB(…)`, `?debug` équipe Léviator+Surf) :
  combat → SAC → Potion (soin → party menu → mon → retour combat), X-Attaque (mon actif),
  Poké Ball (capture), Poké Poupée (fuite wild). Annulation B = pas de tour consommé. Screenshots.
- **Critère** : le combat ne référence plus `bag-screen` ; objet émis = `gSpecialVar.ItemId`.

### LOT 6 — Débrancher le boot + SUPPRIMER le clone
- **Fichiers** : `harness/main.ts`, suppression `src/engine/bag/bag-screen.ts`.
- **Contenu** : retirer `harness/main.ts:93-95` (import + `preloadBagAssets()` + `initItemIconMap()`).
  Grep final `bag-screen` = 0 import réel. **Supprimer `src/engine/bag/bag-screen.ts`** (3219 l.).
  Vérifier assets orphelins `item-icon-map.json`/`item-palette-map.json` (laisser si servis ailleurs).
- **Test** : `tsc` vert ; re-test global sac overworld (start menu → SAC), sac combat (Lot 5),
  ItemPC (Lot 3). `__e2e.run('boot-overworld')` + `('double-battle')` si dispo. Screenshots.
- **Critère « le clone peut être supprimé quand… »** : les 3 call-sites (2.a/2.b/2.c) ne
  l'importent plus ET les 3 écrans (overworld/combat/ItemPC) sont validés en jeu.

---

## 7. Risques (par ordre de danger)

1. **[MAJEUR] Usage d'objet en COMBAT non porté 1:1.** `GetItemBattleFunc`+`ItemUseInBattle_*`
   n'existent que *inlinés* dans le clone (bag-screen.ts:1773-1887). Le chemin Médecine/PP est
   **multi-écrans** (sac→party→sac→reshow combat via `gBagMenu->newScreenCallback =
   ChooseMonForInBattleItem`, item_use.c:1016). Transcrire dans item_use.ts en réutilisant
   `OpenPartyScreenForItemUse`/`CB2_ReturnToBagMenu` (party_menu.ts:4197/2468). Piège associé :
   la sémantique de retour d'objet change de `__battleBagResultItemId` (clone) → `gSpecialVar.ItemId`
   (1:1). Bien vérifier que l'annulation laisse `gSpecialVar.ItemId = 0` (item_menu.ts:2005 le fait
   déjà sur LIST_CANCEL).

2. **[MOYEN] exitCallback battle = `null` (item_menu.ts:538).** `_cb2SetUpReshowBattleScreenAfterMenu2`
   doit être résolu par pont globalThis (cycle item_menu↔battle_controller_player↔reshow_battle_screen).
   Suivre le pattern anti-cycle déjà en place (`CB2_FavorLadyExitBagMenu` :3489 lit
   `globalThis.__FieldCallback_*`). Ne PAS créer d'import statique croisé (TDZ, cf. mémoire
   `find-import-cycle.cjs`).

3. **[MOYEN] Machine à états incompatible.** Le clone est piloté par `TickBagScreen(newKeys)`
   + `_phase` (chaînes) ; item_menu.ts est piloté par `gTasks`/`task.func` + `RunTasks` sous
   `MainCB2_BagMenuRun`. Les deux ne doivent JAMAIS tourner en même temps. Comme le basculement
   se fait par call-site (Lots 3/5) et que le clone n'est supprimé qu'au Lot 6, il n'y a pas de
   coexistence — mais bien vérifier qu'aucun `savedCallback`/`gMain.state` résiduel du clone ne
   fuite (le clone met `rt.gMain.state = 0`, item_menu aussi : OK tant qu'un seul ouvre à la fois).

4. **[MOYEN] Retour PC après dépôt.** Le clone bricole `setTimeout`+`OpenBedroomPC(true)`
   (player_pc.ts:632). Le 1:1 (`CB2_PlayerPCExitBagMenu`→`ItemStorage_ReshowAfterBagMenu`) passe
   par `gFieldCallback`+`CB2_ReturnToField`. Vérifier que `ItemStorage_ReshowAfterBagMenu` redessine
   le sous-menu PC au bon état (chambre vs Centre Pokémon) et n'ouvre pas le start menu par-dessus
   (bug historique noté dans le clone :998-999).

5. **[FAIBLE] Spritesheets/tags partagés.** Le clone et item_menu_icons.ts utilisent tous deux
   `TAG_BAG_GFX=100` (bag-screen.ts:368 = `TAG_BAG_GFX` item_menu.ts:56). Tant que les deux ne
   s'ouvrent pas ensemble, pas de collision ; après suppression du clone, plus de risque. Vérifier
   `FreeAllSpritePalettes`/`FreeSpriteTilesByTag` au close (item_menu.ts:1843 le fait).

6. **[FAIBLE] Data `battleUsage`/`battleUseFunc`.** `GetItemBattleFunc` a besoin de la colonne
   décomp `gItems[].battleUsage`. Si absente de l'extraction `items.json`, l'extraire avant le Lot 4
   (le clone la lit déjà via `_ensureItemsJson`:950, donc la donnée est probablement présente).

7. **[FAIBLE] Sons.** Le clone joue `PlaySE(SE_SELECT)` à divers endroits ; item_menu.ts fait de
   même 1:1. Pas de risque de régression sonore (mêmes appels). Aucun asset son propre au clone.

---

### Annexe — commande de vérification finale (Lot 6)
`grep -rn "bag-screen\|OpenBagScreenForBattle\|BAG_LOCATION_ITEMPC" src harness --include=*.ts`
→ doit renvoyer **0** import/appel (commentaires tolérés). Puis suppression du fichier.
