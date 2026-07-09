# transpile international_string_util.c → src\international_string_util.ts

stats: {"fns":15,"data":1,"defines":0,"flags":26,"unresolved":4,"gtext":3,"mergeSkipped":3}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `ConvertPixelWidthToTileWidth` ()
- `gWindows` ()
- `CpuFastFill8` ()
- `gTrainerClassNames` ()

## Flags TRANSPILER-TODO
- :116 **deref** — `*(buffer++)`
- :116 **ptr-arith** — `buffer++`
- :116 **assign-intranspilable** — `*(buffer++) = EXT_CTRL_CODE_BEGIN`
- :117 **deref** — `*(buffer++)`
- :117 **ptr-arith** — `buffer++`
- :117 **assign-intranspilable** — `*(buffer++) = EXT_CTRL_CODE_CLEAR`
- :118 **deref** — `*(buffer++)`
- :118 **ptr-arith** — `buffer++`
- :118 **assign-intranspilable** — `*(buffer++) = clearWidth`
- :175 **ptr-arith** — `buffer++`
- :180 **ptr-arith** — `buffer--`
- :187 **deref** — `*str++`
- :187 **deref** — `*str++`
- :197 **deref** — `*str++`
- :197 **assign-intranspilable** — `*str++ = EXT_CTRL_CODE_BEGIN`
- :198 **deref** — `*str++`
- :198 **assign-intranspilable** — `*str++ = EXT_CTRL_CODE_ENG`
- :223 **adresse-element** — `&gWindows[windowId]`
- :248 **deref** — `*src++`
- :0 **import-ambigu** — `GetStringWidth ← src/text.ts | include/text.ts (choisi src/text.ts)`
- :0 **import-ambigu** — `FONT_NORMAL ← src/engine/battle/battle-windows.ts | src/text.ts | include/text.ts (choisi include/text.ts)`
- :0 **import-ambigu** — `gPokedexEntries ← src/data/pokemon/pokedex_entries.ts | src/engine/ui/pokedex-flags.ts (choisi src/data/pokemon/pokedex_entries.ts)`
- :0 **import-ambigu** — `TILE_SIZE_4BPP ← src/sprite.ts | src/tileset_anims.ts (choisi src/sprite.ts)`
- :0 **import-ambigu** — `StringCopyN ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`
- :0 **import-ambigu** — `PLACEHOLDER_BEGIN ← src/battle_message.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `StringCompare ← src/string_util.ts | include/string_util.ts (choisi src/string_util.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
- :273 gText_Eleve
- :278 gText_Dresseur
- :282 gText_Champion
