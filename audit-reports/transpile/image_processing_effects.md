# transpile image_processing_effects.c → src\image_processing_effects.ts

stats: {"fns":38,"data":10,"defines":1,"flags":56,"unresolved":7,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `IS_ALPHA` ()
- `RGB_RED` ()
- `sPointillismPoints` ()
- `GET_POINT_DELTA` ()
- `GET_POINT_COLOR_TYPE` ()
- `GET_POINT_OFFSET_DL` ()
- `Q_8_8` ()

## Flags TRANSPILER-TODO
- :130 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :131 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :132 **ptr-arith** — `pixel++`
- :155 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :156 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :157 **ptr-arith** — `pixel++`
- :184 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :185 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :186 **ptr-arith** — `pixel++`
- :200 **adresse-element** — `&gCanvasPixels[gCanvasRowStart * gCanvasWidth]`
- :201 **adresse-element** — `&pixelRow[gCanvasColumnStart + i]`
- :226 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :227 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :228 **ptr-arith** — `pixel++`
- :242 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :243 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :244 **ptr-arith** — `pixel++`
- :260 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :261 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :263 **ptr-arith** — `pixel++`
- :263 **ptr-arith** — `pixel++`
- :275 **adresse-element** — `&gCanvasPixels[gCanvasRowStart * gCanvasWidth]`
- :276 **adresse-element** — `&pixelRow[gCanvasColumnStart + i]`
- :294 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :295 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :296 **ptr-arith** — `pixel++`
- :314 **ptr-arith** — `pixel++`
- :324 **adresse-element** — `&gCanvasPixels[j]`
- :337 **adresse-element** — `&gCanvasPixels[j]`
- :358 **ptr-arith** — `pixel++`
- :372 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :373 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :375 **ptr-arith** — `pixel++`
- :375 **ptr-arith** — `pixel++`
- :392 **adresse-element** — `&gCanvasPixels[gCanvasRowStart * gCanvasWidth]`
- :393 **adresse-element** — `&pixelRow[gCanvasColumnStart + i]`
- :418 **struct-array-local** — `points`
- :450 **adresse-element** — `&gCanvasPixels[points[i].row * MAX_DIMENSION]`
- :622 **multi-dim-local** — `pixelChannels`
- :818 **adresse-element** — `&context->canvasPalette[gCanvasPaletteStart]`
- :915 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :916 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :917 **ptr-arith** — `pixel++`
- :983 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :984 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :985 **ptr-arith** — `pixel++`
- :1014 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :1015 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :1016 **ptr-arith** — `pixel++`
- :1032 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :1033 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :1034 **ptr-arith** — `pixel++`
- :1050 **adresse-element** — `&gCanvasPixels[(gCanvasRowStart + j) * gCanvasWidth]`
- :1051 **adresse-element** — `&pixelRow[gCanvasColumnStart]`
- :1052 **ptr-arith** — `pixel++`
- :0 **import-ambigu** — `RGB2 ← src/palette.ts | harness/runtime/decomp-bridge.ts (choisi src/palette.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
