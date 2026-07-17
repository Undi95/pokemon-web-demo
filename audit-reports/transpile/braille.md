# transpile braille.c → src\braille.ts

stats: {"fns":3,"data":2,"defines":0,"flags":23,"unresolved":9,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `gFonts` ()
- `GenerateFontHalfRowLookupTable` ()
- `TextPrinterInitDownArrowCounters` ()
- `CopyGlyphToWindow` ()
- `gCurGlyph` ()
- `TextPrinterWait` ()
- `TextPrinterWaitWithDownArrow` ()
- `TextPrinterClearDownArrow` ()
- `DecompressGlyphTile` ()

## Flags TRANSPILER-TODO
- :15 **incbin** — `sFont_Braille ← graphics/fonts/braille.png`
- :47 **deref** — `*textPrinter->printerTemplate.currentChar++`
- :60 **deref** — `*textPrinter->printerTemplate.currentChar++`
- :64 **deref** — `*textPrinter->printerTemplate.currentChar++`
- :68 **deref** — `*textPrinter->printerTemplate.currentChar++`
- :72 **deref** — `*textPrinter->printerTemplate.currentChar++`
- :76 **deref** — `*textPrinter->printerTemplate.currentChar`
- :77 **deref** — `*++textPrinter->printerTemplate.currentChar`
- :78 **deref** — `*++textPrinter->printerTemplate.currentChar`
- :87 **deref** — `*textPrinter->printerTemplate.currentChar`
- :93 **deref** — `*textPrinter->printerTemplate.currentChar++`
- :109 **deref** — `*++textPrinter->printerTemplate.currentChar`
- :112 **deref** — `*textPrinter->printerTemplate.currentChar++`
- :115 **deref** — `*textPrinter->printerTemplate.currentChar++`
- :131 **deref** — `*textPrinter->printerTemplate.currentChar++`
- :0 **import-ambigu** — `A_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `B_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`
- :0 **import-ambigu** — `JOY_HELD ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `JOY_NEW ← src/battle_controllers.ts | harness/runtime/decomp-globals.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `EOS ← src/mail_data.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `PLACEHOLDER_BEGIN ← src/battle_message.ts | include/constants/characters.ts (choisi include/constants/characters.ts)`
- :0 **import-ambigu** — `PIXEL_FILL ← src/engine/battle/battle-windows.ts | harness/runtime/decomp-globals.ts (choisi src/engine/battle/battle-windows.ts)`
- :0 **import-ambigu** — `gSaveBlock2Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
