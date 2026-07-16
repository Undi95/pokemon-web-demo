# Assets écran CONDITION (Pokénav) — état au câblage 2026-07-16

**Résultat : AUCUN binaire manquant.** Tous les assets INCGFX/INCBIN du chantier sont déjà
extraits dans `public/decomp/em/` (miroir du dossier décomp `graphics/pokenav/condition/`).
Rien à régénérer, aucun script d'extraction touché.

## Mapping décomp → runtime (tel que câblé)

| Symbole décomp | Source décomp (INCGFX/INCBIN) | Chemin runtime (fetch) | Loader |
|---|---|---|---|
| `gPokenavCondition_Gfx` (graphics.c:1288) | `graphics/pokenav/condition/graph.png` .4bpp.lz | `/decomp/em/pokenav/condition/graph.png` | `loadTileBin(,4)` |
| `gPokenavCondition_Pal` (graphics.c:1287) | `graph.png` .gbapal | idem (PLTE) | `extractPngPlte` |
| `gPokenavCondition_Tilemap` (graphics.c:1289) | `graph.bin` .lz | `/decomp/em/pokenav/condition/graph.bin` | `loadTilemapBin` |
| `gPokenavOptions_Tilemap` (graphics.c:1291) | `graphics/pokenav/options/options.bin` (brut) | `/decomp/em/pokenav/options/options.bin` | `loadTilemapBin` |
| `gConditionGraphData_Pal` (pokenav_conditions_gfx.c:27) | `graph_data.pal` | `/decomp/em/pokenav/condition/graph_data.pal` | `loadGbaPal` |
| `gConditionText_Pal` (:28) | `text.pal` | `/decomp/em/pokenav/condition/text.pal` | `loadGbaPal` |
| `sConditionGraphData_Gfx` (:29) | `graph_data.png` .4bpp.lz | `/decomp/em/pokenav/condition/graph_data.png` | `loadTileBin(,4)` |
| `sConditionGraphData_Tilemap` (:30) | `graph_data.bin` .lz | `/decomp/em/pokenav/condition/graph_data.bin` | `loadTilemapBin` |
| `sMonMarkings_Pal` (:31) | `mon_markings.pal` | `/decomp/em/pokenav/condition/mon_markings.pal` | `loadGbaPal` |
| `sConditionPokeball_Gfx` (menu_specialized.c:1127) | `pokeball.png` .4bpp | `/decomp/em/pokenav/condition/pokeball.png` | `loadTileBin(,4)` |
| `sConditionPokeballPlaceholder_Gfx` (:1128) | `pokeball_placeholder.png` .4bpp | `/decomp/em/pokenav/condition/pokeball_placeholder.png` | `loadTileBin(,4)` |
| `sConditionSparkle_Gfx` (:1129, ⚠️ = PALETTE, quirk décomp) | `sparkle.png` .gbapal | `/decomp/em/pokenav/condition/sparkle.png` (PLTE) | `extractPngPlte` |
| `sConditionSparkle_Pal` (:1130, ⚠️ = TILES, quirk décomp) | `sparkle.png` .4bpp | idem | `loadTileBin(,4)` |
| `gPokenavConditionCancel_Pal` (graphics.c:1320, 32 couleurs BALL+CANCEL) | `cancel.pal` | `/decomp/em/pokenav/condition/cancel.pal` | `loadGbaPal` (+`.subarray(16)` pour CANCEL) |
| `gPokenavConditionCancel_Gfx` (graphics.c:1321) | `cancel.png` .4bpp | `/decomp/em/pokenav/condition/cancel.png` | `loadTileBin(,4)` |
| `gConditionSearchResultTiles` (graphics.c:1619) | `search_results.png` .4bpp.lz | `/decomp/em/pokenav/condition/search_results.png` | `loadTileBin(,4)` |
| `gConditionSearchResultFramePal` (graphics.c:1618) | `search_results.png` .gbapal | idem (PLTE) | `extractPngPlte` |
| `gConditionSearchResultTilemap` (graphics.c:1620) | `search_results.bin.lz` | `/decomp/em/pokenav/condition/search_results.bin` | `loadTilemapBin` |
| `sListBg_Pal` (pokenav_conditions_search_results.c:81) | `search_results_list.pal` | `/decomp/em/pokenav/condition/search_results_list.pal` | `loadGbaPal` |
| `sMonMarkings_Gfx` (mon_markings.c) | `graphics/misc/mon_markings.png` | `/decomp/em/ui/interface/mon_markings.png` | déjà câblé (mon_markings.ts `_loadMarkingsGfx`) |
| pics mons (`gMonFrontPicTable` + `GetMonSpritePalFromSpeciesAndPersonality`) | par-espèce | `/decomp/em/pokemon/<dex>/anim_front.png` (frame 0) + `normal.pal` | précédent PC storage `PreloadDisplayMonPic` |

## Préchargement
- `PrefetchConditionGraphAssets()` (pokenav_conditions_gfx.ts) + `PrefetchConditionSearchResultsAssets()`
  (pokenav_conditions_search_results.ts) + `PrefetchConditionSpriteAssets()` (menu_specialized.ts),
  appelés dès `CB2_InitPokeNav` (pokenav.ts, comme `PrefetchMatchCallAssets`).
- Gates : `case 0` des looped-tasks d'ouverture (`ConditionMenuBgAssetsReady` /
  `ConditionSpriteAssetsReady` / `SearchResultsAssetsReady`) + gate par-slot des pics mon
  (`IsConditionMonPicLoaded`). Échec fetch = `console.error` bruyant (le gate attend, pas de gel silencieux).
