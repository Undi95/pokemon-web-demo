# transpile pokenav_menu_handler.c → src\pokenav_menu_handler.ts

stats: {"fns":27,"data":2,"defines":0,"flags":18,"unresolved":9,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `AllocSubstruct` ()
- `GetSelectedConditionSearch` ()
- `SetPokenavMode` ()
- `GetPokenavMode` ()
- `GetSubstructPtr` ()
- `FreePokenavSubstruct` ()
- `CanViewRibbonsMenu` ()
- `POKENAV_MENU_FUNC_EXIT` ()
- `SetSelectedConditionSearch` ()

## Flags TRANSPILER-TODO
- :50 **expr-inconnue** — `initializer_pair: [2 ... MAX_POKENAV_MENUITEMS - 1] = POKENAV_MENUITEM_SWITCH_`
- :57 **expr-inconnue** — `initializer_pair: [3 ... MAX_POKENAV_MENUITEMS - 1] = POKENAV_MENUITEM_SWITCH_`
- :65 **expr-inconnue** — `initializer_pair: [4 ... MAX_POKENAV_MENUITEMS - 1] = POKENAV_MENUITEM_SWITCH_`
- :72 **expr-inconnue** — `initializer_pair: [3 ... MAX_POKENAV_MENUITEMS - 1] = POKENAV_MENUITEM_SWITCH_`
- :102 **sizeof** — `sizeof(struct Pokenav_Menu)`
- :116 **sizeof** — `sizeof(struct Pokenav_Menu)`
- :130 **sizeof** — `sizeof(struct Pokenav_Menu)`
- :143 **sizeof** — `sizeof(struct Pokenav_Menu)`
- :157 **sizeof** — `sizeof(struct Pokenav_Menu)`
- :0 **import-ambigu** — `FlagGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `A_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `JOY_NEW ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `B_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `PlaySE ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `SE_SELECT ← src/battle_controllers.ts | include/constants/songs.ts (choisi include/constants/songs.ts)`
- :0 **import-ambigu** — `DPAD_UP ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `DPAD_DOWN ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
