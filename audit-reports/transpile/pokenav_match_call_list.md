# transpile pokenav_match_call_list.c → src\pokenav_match_call_list.ts

stats: {"fns":29,"data":2,"defines":0,"flags":15,"unresolved":21,"gtext":1,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `AllocSubstruct` ()
- `CreateLoopedTask` ()
- `GetSubstructPtr` ()
- `FreePokenavSubstruct` ()
- `PokenavList_GetSelectedIndex` ()
- `MatchCall_HasCheckPage` ()
- `GetPokenavMode` ()
- `SetPokenavMode` ()
- `MatchCall_GetEnabled` ()
- `MatchCall_GetMapSec` ()
- `MatchCall_HasRematchId` ()
- `MatchCall_GetRematchTableIdx` ()
- `GetTrainerIdxByRematchIdx` ()
- `gTrainers` ()
- `MatchCall_GetOverrideFacilityClass` ()
- `gFacilityClassToPicIndex` ()
- `SelectMatchCallMessage` ()
- `MatchCall_GetMessage` ()
- `MatchCall_GetOverrideFlavorText` ()
- `gMatchCallFlavorTexts` ()
- `MatchCall_GetNameAndDesc` ()

## Flags TRANSPILER-TODO
- :56 **sizeof** — `sizeof(struct Pokenav_MatchCallMenu)`
- :408 **adresse-element** — `&gTrainers[GetTrainerIdxByRematchIdx(matchCallEntry->headerI`
- :0 **import-ambigu** — `DPAD_UP ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `JOY_REPEAT ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `DPAD_DOWN ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `DPAD_LEFT ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `DPAD_RIGHT ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `A_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `JOY_NEW ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `B_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `PlaySE ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `FlagGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `gStringVar4 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `FONT_NARROW ← src/engine/battle/battle-windows.ts | src/text.ts | include/text.ts (choisi include/text.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :356 gText_CallCantBeMadeHere
