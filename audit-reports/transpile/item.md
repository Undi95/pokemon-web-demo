# transpile item.c → src\item.ts

stats: {"fns":44,"data":1,"defines":0,"flags":69,"unresolved":6,"gtext":3,"mergeSkipped":8}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `ApplyNewEncryptionKeyToHword` ()
- `CurrentBattlePyramidLocation` ()
- `CurMapIsSecretBase` ()
- `GetItemListPosition` ()
- `SWAP` ()
- `gPyramidBagMenuState` ()

## Flags TRANSPILER-TODO
- :52 **adresse** — `&(gBagPockets[pocket].itemSlots[item].quantity)`
- :264 **sizeof** — `sizeof(struct ItemSlot)`
- :264 **alloc** — `AllocZeroed(itemPocket->capacity * sizeof(struct ItemSlot))`
- :265 **sizeof** — `sizeof(struct ItemSlot)`
- :265 **memcpy** — `memcpy(newItems, itemPocket->itemSlots, itemPocket->capacity`
- :282 **sizeof** — `sizeof(struct ItemSlot)`
- :282 **memcpy** — `memcpy(itemPocket->itemSlots, newItems, itemPocket->capacity`
- :344 **sizeof** — `sizeof(struct ItemSlot)`
- :344 **memcpy** — `memcpy(itemPocket->itemSlots, newItems, itemPocket->capacity`
- :499 **sizeof** — `sizeof(gSaveBlock1Ptr->pcItems)`
- :499 **alloc** — `AllocZeroed(sizeof(gSaveBlock1Ptr->pcItems))`
- :500 **sizeof** — `sizeof(gSaveBlock1Ptr->pcItems)`
- :500 **memcpy** — `memcpy(newItems, gSaveBlock1Ptr->pcItems, sizeof(gSaveBlock1`
- :511 **sizeof** — `sizeof(gSaveBlock1Ptr->pcItems)`
- :511 **memcpy** — `memcpy(gSaveBlock1Ptr->pcItems, newItems, sizeof(gSaveBlock1`
- :519 **sizeof** — `sizeof(gSaveBlock1Ptr->pcItems)`
- :519 **memcpy** — `memcpy(gSaveBlock1Ptr->pcItems, newItems, sizeof(gSaveBlock1`
- :543 **sizeof** — `sizeof(gSaveBlock1Ptr->pcItems)`
- :543 **memcpy** — `memcpy(gSaveBlock1Ptr->pcItems, newItems, sizeof(gSaveBlock1`
- :615 **adresse-element** — `&bagPocket->itemSlots[i]`
- :615 **adresse-element** — `&bagPocket->itemSlots[j]`
- :635 **adresse-element** — `&bagPocket->itemSlots[i]`
- :635 **adresse-element** — `&bagPocket->itemSlots[j]`
- :742 **sizeof** — `sizeof(*newItems)`
- :742 **alloc** — `Alloc(PYRAMID_BAG_ITEMS_COUNT * sizeof(*newItems))`
- :743 **sizeof** — `sizeof(*newQuantities)`
- :743 **alloc** — `Alloc(PYRAMID_BAG_ITEMS_COUNT * sizeof(*newQuantities))`
- :745 **sizeof** — `sizeof(*newItems)`
- :745 **memcpy** — `memcpy(newItems, items, PYRAMID_BAG_ITEMS_COUNT * sizeof(*ne`
- :746 **sizeof** — `sizeof(*newQuantities)`
- :746 **memcpy** — `memcpy(newQuantities, quantities, PYRAMID_BAG_ITEMS_COUNT * `
- :794 **sizeof** — `sizeof(*items)`
- :794 **memcpy** — `memcpy(items, newItems, PYRAMID_BAG_ITEMS_COUNT * sizeof(*it`
- :795 **sizeof** — `sizeof(*quantities)`
- :795 **memcpy** — `memcpy(quantities, newQuantities, PYRAMID_BAG_ITEMS_COUNT * `
- :825 **sizeof** — `sizeof(*newItems)`
- :825 **alloc** — `Alloc(PYRAMID_BAG_ITEMS_COUNT * sizeof(*newItems))`
- :826 **sizeof** — `sizeof(*newQuantities)`
- :826 **alloc** — `Alloc(PYRAMID_BAG_ITEMS_COUNT * sizeof(*newQuantities))`
- :828 **sizeof** — `sizeof(*newItems)`
- :828 **memcpy** — `memcpy(newItems, items, PYRAMID_BAG_ITEMS_COUNT * sizeof(*ne`
- :829 **sizeof** — `sizeof(*newQuantities)`
- :829 **memcpy** — `memcpy(newQuantities, quantities, PYRAMID_BAG_ITEMS_COUNT * `
- :856 **sizeof** — `sizeof(*items)`
- :856 **memcpy** — `memcpy(items, newItems, PYRAMID_BAG_ITEMS_COUNT * sizeof(*it`
- :857 **sizeof** — `sizeof(*quantities)`
- :857 **memcpy** — `memcpy(quantities, newQuantities, PYRAMID_BAG_ITEMS_COUNT * `
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `POCKETS_COUNT ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/item_menu.ts | include/constants/item.ts (choisi include/constants/item.ts)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `ITEMS_POCKET ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/item_menu.ts | include/constants/item.ts (choisi include/constants/item.ts)`
- :0 **import-ambigu** — `BAG_ITEMS_COUNT ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `KEYITEMS_POCKET ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/item_menu.ts | include/constants/item.ts (choisi include/constants/item.ts)`
- :0 **import-ambigu** — `BAG_KEYITEMS_COUNT ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `BALLS_POCKET ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/item_menu.ts | include/constants/item.ts (choisi include/constants/item.ts)`
- :0 **import-ambigu** — `BAG_POKEBALLS_COUNT ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `TMHM_POCKET ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/item_menu.ts | include/constants/item.ts (choisi include/constants/item.ts)`
- :0 **import-ambigu** — `BAG_TMHM_COUNT ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `BERRIES_POCKET ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/item_menu.ts | include/constants/item.ts (choisi include/constants/item.ts)`
- :0 **import-ambigu** — `BAG_BERRIES_COUNT ← src/engine/bag/bag-types.ts | src/engine/bag/bag.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `StringCopy ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `CHAR_SPACE ← src/mail_data.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `FlagGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `VarSet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `ITEM_NONE ← src/mail_data.ts | include/constants/items.ts (choisi include/constants/items.ts)`
- :0 **import-ambigu** — `VarGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `PC_ITEMS_COUNT ← src/engine/pokemon/pc-items.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `MAX_PC_ITEM_CAPACITY ← src/engine/pokemon/pc-items.ts | include/constants/items.ts (choisi include/constants/items.ts)`
- :0 **import-ambigu** — `PYRAMID_BAG_ITEMS_COUNT ← src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :91 gText_PokeBalls
- :113 gText_Berry
- :115 gText_Berries
