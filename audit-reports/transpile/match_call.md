# transpile match_call.c → src\match_call.ts

stats: {"fns":52,"data":29,"defines":13,"flags":59,"unresolved":6,"gtext":13,"mergeSkipped":3}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `DecompressAndCopyTileDataToVram` ()
- `FreeTempTileDataBuffersIfPossible` ()
- `WriteSequenceToBgTilemapBuffer` ()
- `GetBgAttribute` ()
- `gTrainers` ()
- `gWildMonHeaders` ()

## Flags TRANSPILER-TODO
- :1197 **incbin** — `sMatchCallWindow_Pal ← graphics/pokenav/match_call/window.png`
- :1198 **incbin** — `sMatchCallWindow_Gfx ← graphics/pokenav/match_call/window.png`
- :1199 **incbin** — `sPokenavIcon_Pal ← graphics/pokenav/match_call/nav_icon.png`
- :1200 **incbin** — `sPokenavIcon_Gfx ← graphics/pokenav/match_call/nav_icon.png`
- :1256 **sizeof** — `sizeof(sMatchCallWindow_Gfx)`
- :1271 **sizeof** — `sizeof(sMatchCallWindow_Pal)`
- :1272 **sizeof** — `sizeof(sPokenavIcon_Pal)`
- :1563 **adresse-element** — `&sMatchCallBattleRequestTopics[topic][id]`
- :1572 **adresse-element** — `&sMatchCallBattleRequestTopics[topic][id]`
- :1588 **adresse-element** — `&sMatchCallBattleTopics[topic][id]`
- :1627 **adresse-element** — `&sMatchCallGeneralTopics[topic][id]`
- :1633 **adresse-element** — `&sMatchCallGeneralTopics[topic][id]`
- :2070 **sizeof** — `sizeof(gStringVar4)`
- :2070 **alloc** — `Alloc(sizeof(gStringVar4))`
- :2083 **deref** — `*(str++)`
- :2083 **ptr-arith** — `str++`
- :2083 **assign-intranspilable** — `*(str++) = CHAR_PROMPT_CLEAR`
- :2085 **deref** — `*(str++)`
- :2085 **ptr-arith** — `str++`
- :2085 **assign-intranspilable** — `*(str++) = CHAR_PROMPT_CLEAR`
- :2091 **deref** — `*(str++)`
- :2091 **ptr-arith** — `str++`
- :2091 **assign-intranspilable** — `*(str++) = CHAR_PROMPT_CLEAR`
- :2106 **sizeof** — `sizeof(sMatchCallWindow_Pal)`
- :0 **import-ambigu** — `gPlayerParty ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_SANITY_IS_EGG ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `GetMonData ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/engine/battle/party-storage.ts)`
- :0 **import-ambigu** — `GetMonAbility ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `ABILITY_LIGHTNING_ROD ← src/engine/battle/constants.ts | include/constants/abilities.ts (choisi include/constants/abilities.ts)`
- :0 **import-ambigu** — `Random ← src/engine/battle/script-interpreter.ts | src/random.ts | include/random.ts (choisi src/random.ts)`
- :0 **import-ambigu** — `FlagGet ← src/engine/script/script-vars.ts | src/event_data.ts | include/event_data.ts (choisi src/event_data.ts)`
- :0 **import-ambigu** — `PlaySE ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `encodeOwText ← src/text.ts | include/text.ts (choisi src/text.ts)`
- :0 **import-ambigu** — `PIXEL_FILL ← src/engine/battle/battle-windows.ts | harness/runtime/decomp-globals.ts (choisi src/engine/battle/battle-windows.ts)`
- :0 **import-ambigu** — `BG_PLTT_ID ← src/palette.ts | harness/runtime/decomp-globals.ts | harness/runtime/decomp-runtime.ts (choisi src/palette.ts)`
- :0 **import-ambigu** — `gStringVar4 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `A_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `B_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `JOY_NEW ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `LoadMessageBoxAndBorderGfx ← src/menu.ts | src/window.ts (choisi src/menu.ts)`
- :0 **import-ambigu** — `FONT_NORMAL ← src/engine/battle/battle-windows.ts | src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `TEXT_DYNAMIC_COLOR_1 ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `TEXT_COLOR_BLUE ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `TEXT_DYNAMIC_COLOR_5 ← src/engine/battle/battle-windows.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `GetPlayerTextSpeedDelay ← src/menu.ts | include/menu.ts | harness/runtime/decomp-globals.ts (choisi src/menu.ts)`
- :0 **import-ambigu** — `JOY_HELD ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `StringExpandPlaceholders ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `gStringVar1 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `gStringVar2 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `gStringVar3 ← src/string_util.ts | include/string_util.ts | harness/runtime/decomp-globals.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `StringCopy ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `GetMapName ← src/engine/field/region-map-data.ts | src/region_map.ts (choisi src/region_map.ts)`
- :0 **import-ambigu** — `EOS ← src/mail_data.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `STR_CONV_MODE_LEFT_ALIGN ← src/battle_message.ts | include/string_util.ts (choisi include/string_util.ts)`
- :0 **import-ambigu** — `ConvertIntToDecimalStringN ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `FRONTIER_LVL_MODE_COUNT ← src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `SpeciesToNationalPokedexNum ← src/engine/data/game-data.ts | src/engine/ui/pokedex-flags.ts (choisi src/engine/data/game-data.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :1671 gText_Kira
- :1672 gText_Amy
- :1673 gText_John
- :1674 gText_Roy
- :1675 gText_Gabby
- :1676 gText_Anna
- :1823 gText_BattleTower2
- :1824 gText_BattleDome
- :1825 gText_BattlePalace
- :1826 gText_BattleArena
- :1827 gText_BattlePike
- :1828 gText_BattleFactory
- :1829 gText_BattlePyramid
