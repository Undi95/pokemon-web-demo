# transpile palette_util.c → src\palette_util.ts

stats: {"fns":19,"data":0,"defines":0,"flags":42,"unresolved":2,"gtext":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `u8` ()
- `MODERN` ()

## Flags TRANSPILER-TODO
- :14 **sizeof** — `sizeof(flash->palettes)`
- :14 **memset** — `memset(&flash->palettes, 0, sizeof(flash->palettes))`
- :49 **adresse-element** — `&flash->palettes[id]`
- :49 **sizeof** — `sizeof(flash->palettes[id])`
- :49 **memset** — `memset(&flash->palettes[id], 0, sizeof(flash->palettes[id]))`
- :60 **adresse-element** — `&gPlttBufferFaded[pal->settings.paletteOffset + i]`
- :61 **adresse-element** — `&gPlttBufferUnfaded[pal->settings.paletteOffset + i]`
- :148 **adresse-element** — `&flash->palettes[i]`
- :150 **adresse-element** — `&flash->palettes[i]`
- :190 **adresse-element** — `&gPlttBufferFaded[offset]`
- :191 **adresse-element** — `&gPlttBufferUnfaded[offset]`
- :192 **memcpy** — `memcpy(faded, unfaded, flash->palettes[i].settings.numColors`
- :221 **sizeof** — `sizeof(pulseBlend->pulseBlendPalettes)`
- :221 **memset** — `memset(&pulseBlend->pulseBlendPalettes, 0, sizeof(pulseBlend`
- :233 **adresse-element** — `&pulseBlend->pulseBlendPalettes[0]`
- :241 **adresse-element** — `&pulseBlend->pulseBlendPalettes[i]`
- :256 **sizeof** — `sizeof(*settings)`
- :256 **memcpy** — `memcpy(&pulseBlendPalette->pulseBlendSettings, settings, siz`
- :270 **sizeof** — `sizeof(pulseBlendPalette->pulseBlendSettings)`
- :270 **memset** — `memset(&pulseBlendPalette->pulseBlendSettings, 0, sizeof(pul`
- :286 **adresse-element** — `&pulseBlend->pulseBlendPalettes[pulseBlendPaletteSelector & `
- :293 **adresse-element** — `&pulseBlend->pulseBlendPalettes[i]`
- :335 **adresse-element** — `&pulseBlend->pulseBlendPalettes[pulseBlendPaletteSelector & `
- :352 **adresse-element** — `&pulseBlend->pulseBlendPalettes[j]`
- :381 **adresse-element** — `&pulseBlend->pulseBlendPalettes[i]`
- :447 **adresse-element** — `&dest[top * 32 + left]`
- :452 **deref** — `*_dest++`
- :452 **ptr-arith** — `_dest++`
- :452 **assign-intranspilable** — `*_dest++ = value`
- :463 **adresse-element** — `&dest[top * 32 + left]`
- :468 **deref** — `*_src++`
- :468 **ptr-arith** — `_src++`
- :468 **deref** — `*_dest++`
- :468 **ptr-arith** — `_dest++`
- :468 **assign-intranspilable** — `*_dest++ = *_src++`
- :481 **deref** — `*(u16 *)((dest) + (y * 64 + x * 2))`
- :481 **assign-intranspilable** — `*(u16 *)((dest) + (y * 64 + x * 2)) = value`
- :498 **deref** — `*(_src++)`
- :498 **ptr-arith** — `_src++`
- :498 **deref** — `*(u16 *)((dest) + (y * 64 + x * 2))`
- :498 **assign-intranspilable** — `*(u16 *)((dest) + (y * 64 + x * 2)) = *(_src++)`
- :0 **import-ambigu** — `gPlttBufferUnfaded ← src/palette.ts | harness/runtime/decomp-globals.ts (choisi src/palette.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
