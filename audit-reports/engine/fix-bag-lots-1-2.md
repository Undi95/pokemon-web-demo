# Fix bag-screen — LOTS 1 & 2 (ports INERTES, zéro bascule)

Exécution des 2 premiers lots du plan `PLAN-dissolution-bag-screen.md` **tels que redéfinis par la
mission** : Lot 1 = dépôt ItemPC (doc LOT 1), Lot 2 = usage d'objet en combat (doc LOT 4). Les
bascules de call-sites et le port `player_pc.ts` (doc LOT 2/3/5) sont **hors périmètre**.

- Fichiers touchés : `src/item_menu.ts`, `src/item.ts`, `src/item_use.ts` **uniquement**.
- `npx tsc --noEmit` = **0**. `node scripts/audit-transpiler-pitfalls.cjs` = **0 finding** dans ces 3 fichiers.
- Tout est **INERTE** (aucun call-site basculé — le clone `bag-screen.ts` reste seul actif en jeu).

---

## LOT 1 — Dépôt ItemPC (foyer `item_menu.ts` ← `item_menu.c`)

| Porté (item_menu.ts) | Décomp (item_menu.c) | Notes |
|---|---|---|
| `CB2_GoToItemDepositMenu` (export) :3065 | `CB2_GoToItemDepositMenu` :593 | exitCallback `CB2_PlayerPCExitBagMenu` = **pont globalThis** `__CB2_PlayerPCExitBagMenu` (foyer player_pc.c:571, hors périmètre) — pattern `CB2_FavorLadyExitBagMenu` :3489 |
| `Task_ItemContext_Deposit` :3076 | `Task_ItemContext_Deposit` :2203 | qty==1 → dépôt direct ; sinon fenêtre quantité |
| `Task_ChooseHowManyToDeposit` :3096 | `Task_ChooseHowManyToDeposit` :2223 | DPad/A/B ; B → `_CtxReturnToList` (folage `PrintItemDescription`+`PrintCursor`+`ReturnToItemList`, idem `CancelToss`) |
| `TryDepositItem` :3118 | `TryDepositItem` :2248 | `GetItemImportance` refus / `AddPCItem(GetBagItemKey(id), N)` OK / plein ; succès → `Task_RemoveItemFromBag` (réutilisé 1:1) |
| `WaitDepositErrorMessage` :3142 | `WaitDepositErrorMessage` :2276 | A/B → `_CtxReturnToList` |
| branche `ITEMMENULOCATION_ITEMPC` dans `Task_BagMenu_HandleInput` :~2050 | `sContextMenuFuncs[ITEMPC]=Task_ItemContext_Deposit` :351 | `SetTaskFuncWithFollowupFunc(…, Task_ItemContext_Deposit, …)` — même convention que les autres contextes |
| `MAX_ITEM_DIGITS` :3057 | `#define MAX_ITEM_DIGITS BERRY_CAPACITY_DIGITS` (items.h:458) | dérivé 1:1 (pas hardcode) |

**Réutilisés (déjà 1:1 dans item_menu.ts, non re-portés)** : `BagMenu_AddWindow`, `BagMenu_RemoveWindow`,
`_CtxPrintQuantityInWindow` (= `PrintItemQuantity`), `AdjustQuantityAccordingToDPadInput`,
`Task_RemoveItemFromBag`, `CopyItemName`, `BagMenu_Print`, `_CtxReturnToList`, `GetItemImportance`, `AddPCItem`.

**Piège EOS traité** : les 4 messages (`gText_DepositHowManyVar1`, `gText_DepositedVar2Var1s`,
`gText_CantStoreImportantItems`, `gText_NoRoomForItems`) passent par
`StringExpandPlaceholders(gStringVar4, encodeOwText(getString(...)))` puis `BagMenu_Print(gStringVar4)`
(buffer byte EOS-terminé + `\n`→CHAR_NEWLINE), **pas** un plain-string. Comptes via
`setStringVar(1, nom)` + `ConvertIntToDecimalStringN(gStringVar2, N, LEFT_ALIGN, MAX_ITEM_DIGITS)`.

---

## LOT 2 — Usage d'objet EN COMBAT (foyers `item.ts` + `item_use.ts`)

### `src/item.ts`
| Porté | Décomp (item.c) | Notes |
|---|---|---|
| `GetItemBattleFunc` (export) :94 | `GetItemBattleFunc` :941 | miroir EXACT de `GetItemFieldFunc` — rend le **nom** du handler (`battleUseFunc`, items.json ; 62 items peuplés) |

### `src/item_use.ts` (les 7 fonctions + helpers privés item_use.c)
| Porté | Décomp (item_use.c) | Notes |
|---|---|---|
| `ItemUseInBattle_PokeBall` (export) :568 | :949 | `IsPlayerPartyAndPokemonStorageFull` (pokemon.ts) ; plein → `DisplayItemMessage(gText_BoxFull)` |
| `ItemUseInBattle_StatIncrease` (export) :611 | :994 | `ExecuteTableBasedItemEffect` ≡ `PokemonUseItemEffects(...)` (inBattle auto-détecté) ; succès → `Task_UseStatIncreaseItem` |
| `Task_UseStatIncreaseItem` :590 | :980 | `data[8]` compteur ; message via **pont** `__UseStatIncreaseItem` (foyer pokemon.c:5433) |
| `Task_CloseStatIncreaseMessage` :580 | :969 | A/B → fermeture |
| `ItemUseInBattle_ShowPartyMenu` :632 | :1012 | `gBagMenu.newScreenCallback` = **pont** `__ChooseMonForInBattleItem` (foyer party_menu.c) |
| `ItemUseInBattle_Medicine` (export) :646 | :1026 | `setItemUseCB(ItemUseCB_Medicine)` + ShowPartyMenu |
| `ItemUseInBattle_PPRecovery` (export) :652 | :1039 | `setItemUseCB(ItemUseCB_PPRecovery)` + ShowPartyMenu |
| `ItemUseInBattle_Escape` (export) :708 | :1046 | wild → `RemoveUsedItem` + msg + close ; dresseur → `DisplayDadsAdviceCannotUseItemMessage` |
| `RemoveUsedItem` :672 | :824 | RemoveBagItem + `gStringVar4`="{PLAYER} utilise {objet}." + refresh poche (`_pocketIdForItem` = GetItemPocket string→id) |
| `DisplayCannotUseItemMessage` :687 | :142 | branche non-field (solo) 1:1 ; branche field-registered déférée (non atteinte en combat) |
| `DisplayDadsAdviceCannotUseItemMessage` :701 | :158 | = `DisplayCannotUseItemMessage(…, gText_DadsAdvice)` |

### `src/item_menu.ts` — dispatch 1:1 (fonction SÉPARÉE inerte)
| Porté | Décomp (item_menu.c) | Notes |
|---|---|---|
| `ItemMenu_UseInBattle_1to1` (export) :3569 | `ItemMenu_UseInBattle` :1997 | `GetItemBattleFunc(item)` → `switch` nom → `ItemUseInBattle_*` (même pattern que `ItemMenu_UseOutOfBattle`/`GetItemFieldFunc`). **La version simplifiée `ItemMenu_UseInBattle` :3557 reste câblée dans `sItemMenuActions[ACTION_BATTLE_USE]`** — non remplacée (mission : fonction séparée). |

**Exports ajoutés à item_menu.ts** (consommés par item_use.ts) : `DisplayItemMessage`, `CloseItemMessage`,
`UpdatePocketItemList`, `UpdatePocketListPosition`.

**Décision `gSpecialVar.ItemId`** (piège mission) : tout le flux combat lit/pose `gSpecialVar.ItemId`
— **jamais** le bridge maison `__battleBagResultItemId` du clone.

---

## Adaptations documentées (Règle 1 — écarts au .c, honnêtes)

1. **Battle Pyramid = HORS-SOLO.** `CurrentBattlePyramidLocation()` (battle_util.c:1362, non exporté)
   vaut TOUJOURS `PYRAMID_LOCATION_NONE` en solo → seule la branche NONE est transcrite ; les
   branches pyramide (`CloseBattlePyramidBag`, `DisplayItemMessageInBattlePyramid`, `gPyramidBagMenu`
   — **absentes du port**, battle_pyramid_bag.c non porté) sont notées mais non transcrites. Cohérent
   avec la mémoire « frontier hors-solo ».
2. **Ponts globalThis** (cross-fichier, foyers hors périmètre — câblage réel = Lots 4/5) :
   `__CB2_PlayerPCExitBagMenu` (player_pc.ts), `__ChooseMonForInBattleItem` (party_menu.ts),
   `__UseStatIncreaseItem` (pokemon.ts). Chacun **HURLE** en `console.error` si absent (Règle 3).
3. **`ExecuteTableBasedItemEffect` → `PokemonUseItemEffects`** : notre port auto-détecte `inBattle`
   via `gBattleTypeFlags` (retour `cannotUse` identique). ⚠️ pour combat SAUVAGE inline
   (`gBattleTypeFlags==0`) le Lot 5 devra assurer le contexte inBattle (`_forceInBattle`).

---

## Ce que le LOT 3 (et 4/5) devra câbler

**Lot 3 (ItemPC — `player_pc.ts`, doc LOT 2/3)** :
- Porter `CB2_PlayerPCExitBagMenu` (player_pc.c:571) + `ItemStorage_ReshowAfterBagMenu` (:577) et
  **exposer `globalThis.__CB2_PlayerPCExitBagMenu`** (consommé par `CB2_GoToItemDepositMenu`).
- Remplacer `_itemStorageDeposit` (import clone) par `CleanupOverworldWindowsAndTilemaps()` +
  `CB2_GoToItemDepositMenu()` (import `./item_menu`). Supprimer dead code `_depositOpenList`.
- ⚠️ **Vérif TM/HM** : `TryDepositItem` ajoute au PC via `GetBagItemKey` (move-named) mais le
  `Task_RemoveItemFromBag` réutilisé retire via `getItemKeyById` (enum-numbered) → asymétrie
  **préexistante** (partagée avec Toss) pouvant dupliquer une CT déposée. À valider en jeu au Lot 3
  (les objets normaux — Potions etc. — ont les 2 clés identiques, OK).

**Lot 4/5 (combat)** :
- `sItemMenuActions[ACTION_BATTLE_USE]` : basculer de `ItemMenu_UseInBattle` (simplifié) vers
  `ItemMenu_UseInBattle_1to1`, puis supprimer la simplifiée.
- Exposer `globalThis.__ChooseMonForInBattleItem` (party_menu.ts, réutiliser `OpenPartyScreenForItemUse`
  avec **retour combat** = reshow, pas `CB2_ReturnToBagMenu`) + `globalThis.__UseStatIncreaseItem` (pokemon.ts).
- Câbler `_cb2SetUpReshowBattleScreenAfterMenu2` (item_menu.ts:538, toujours `null`) + basculer
  `battle_controller_player.ts:2062` sur `CB2_BagMenuFromBattle()` + `_CompleteWhenChoseItem` lit
  `gSpecialVar.ItemId`. Retirer `__battleBagResultItemId`/`__battleReshowDone`.
