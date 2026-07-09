# transpile pokenav_ribbons_list.c → src\pokenav_ribbons_list.ts

stats: {"fns":37,"data":8,"defines":0,"flags":55,"unresolved":35,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `AllocSubstruct` ()
- `CreateLoopedTask` ()
- `GetSubstructPtr` ()
- `FreePokenavSubstruct` ()
- `IsLoopedTaskActive` ()
- `PokenavList_GetSelectedIndex` ()
- `CheckBoxMonSanityAt` ()
- `GetBoxMonDataAt` ()
- `DestroyPokenavList` ()
- `InitBgTemplates` ()
- `gMonRibbonListFrameTiles` ()
- `DecompressAndCopyTileDataToVram` ()
- `SetBgTilemapBuffer` ()
- `gMonRibbonListFrameTilemap` ()
- `gMonRibbonListFramePal` ()
- `CopyPaletteIntoBufferUnfaded` ()
- `FreeTempTileDataBuffersIfPossible` ()
- `IsCreatePokenavListTaskActive` ()
- `PrintHelpBarText` ()
- `PokenavFadeScreen` ()
- `LoadLeftHeaderGfxForIndex` ()
- `ShowLeftHeaderGfx` ()
- `IsPaletteFadeActive` ()
- `AreLeftHeaderSpritesMoving` ()
- `LT_SET_STATE` ()
- `PokenavList_MoveCursorUp` ()
- `PokenavList_IsMoveWindowTaskActive` ()
- `PokenavList_MoveCursorDown` ()
- `PokenavList_PageUp` ()
- `PokenavList_PageDown` ()
- `SlideMenuHeaderDown` ()
- `MainMenuLoopedTaskIsBusy` ()
- `SetLeftHeaderSpritesInvisibility` ()
- `CreatePokenavList` ()
- `GetBoxMonData` ()

## Flags TRANSPILER-TODO
- :76 **incbin** — `sMonRibbonListUi_Pal ← graphics/pokenav/ribbons/list_ui.pal`
- :127 **sizeof** — `sizeof(struct Pokenav_RibbonsMonList)`
- :131 **sizeof** — `sizeof(struct PokenavMonList)`
- :143 **sizeof** — `sizeof(struct Pokenav_RibbonsMonList)`
- :374 **sizeof** — `sizeof(struct Pokenav_RibbonsMonMenu)`
- :385 **sizeof** — `sizeof(struct Pokenav_RibbonsMonMenu)`
- :447 **sizeof** — `sizeof(sMonRibbonListUi_Pal)`
- :672 **deref** — `*ptr++`
- :672 **ptr-arith** — `ptr++`
- :672 **assign-intranspilable** — `*ptr++ = CHAR_SLASH`
- :680 **struct-local** — `struct PokenavListTemplate template`
- :683 **sizeof** — `sizeof(struct PokenavListItem)`
- :738 **deref** — `*s++`
- :738 **ptr-arith** — `s++`
- :738 **assign-intranspilable** — `*s++ = CHAR_SLASH`
- :739 **deref** — `*s++`
- :739 **ptr-arith** — `s++`
- :739 **assign-intranspilable** — `*s++ = CHAR_EXTRA_SYMBOL`
- :740 **deref** — `*s++`
- :740 **ptr-arith** — `s++`
- :740 **assign-intranspilable** — `*s++ = CHAR_LV_2`
- :0 **import-ambigu** — `encodeOwText ← src/text.ts | include/text.ts (choisi src/text.ts)`
- :0 **import-ambigu** — `DPAD_UP ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `JOY_REPEAT ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `DPAD_DOWN ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `DPAD_LEFT ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `JOY_NEW ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `DPAD_RIGHT ← src/battle_controllers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `B_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `A_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `PARTY_SIZE ← src/engine/battle/party-storage.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `gPlayerParty ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_SANITY_HAS_SPECIES ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `GetMonData ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/engine/battle/party-storage.ts)`
- :0 **import-ambigu** — `MON_DATA_SANITY_IS_EGG ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_SANITY_IS_BAD_EGG ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_RIBBON_COUNT ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_RIBBONS ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `BG_PLTT_ID ← src/palette.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `PLTT_SIZE_4BPP ← src/sprite.ts | harness/runtime/decomp-bridge.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-helpers.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `SE_SELECT ← src/battle_controllers.ts | include/constants/songs.ts (choisi include/constants/songs.ts)`
- :0 **import-ambigu** — `PlaySE ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `STR_CONV_MODE_RIGHT_ALIGN ← src/battle_message.ts | include/string_util.ts (choisi include/string_util.ts)`
- :0 **import-ambigu** — `ConvertIntToDecimalStringN ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `FONT_NORMAL ← src/engine/battle/battle-windows.ts | src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `GetStringCenterAlignXOffset ← src/international_string_util.ts | src/text.ts | include/text.ts (choisi src/international_string_util.ts)`
- :0 **import-ambigu** — `TEXT_SKIP_DRAW ← src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `MON_DATA_NICKNAME ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `gStringVar3 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringGet_Nickname ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `MON_MALE ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `MON_FEMALE ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `gStringVar1 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringCopy ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `STR_CONV_MODE_LEFT_ALIGN ← src/battle_message.ts | include/string_util.ts (choisi include/string_util.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
