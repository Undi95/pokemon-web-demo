# Assets — écrans RUBANS du Pokénav

Câblage des `INCBIN/INCGFX` des deux écrans rubans (`pokenav_ribbons_list.c`,
`pokenav_ribbons_summary.c`). Pattern suivi : `loadTileBin` / `loadTilemapBin` /
`extractPngPlte` / `loadGbaPal` (`harness/gba/png-loader`) + préchargement au fade
d'ouverture (précédent `PrefetchListArrowAssets` / `PrefetchMatchCallAssets`).

⚠️ Aucun script/manifest d'extraction modifié, aucun pack régénéré (agent en vol).

## Statut : TOUS LES BINAIRES SONT DÉJÀ PRÉSENTS ✅

Vérifié dans `public/decomp/em/pokenav/ribbons/` — rien à extraire.

### Écran LISTE (`pokenav_ribbons_list.ts`) — source décomp → chemin runtime
| symbole décomp | INCGFX (graphics.c) | chemin runtime | loader |
|---|---|---|---|
| `gMonRibbonListFrameTiles` | `ribbons/list_bg.png` `.4bpp.lz` | `/decomp/em/pokenav/ribbons/list_bg.png` | `loadTileBin(…,4)` ✅ présent |
| `gMonRibbonListFrameTilemap` | `ribbons/list_bg.bin.lz` | `/decomp/em/pokenav/ribbons/list_bg.bin` | `loadTilemapBin` ✅ présent |
| `gMonRibbonListFramePal` | `ribbons/list_bg.png` `.gbapal` | `/decomp/em/pokenav/ribbons/list_bg.png` | `extractPngPlte` ✅ présent |
| `sMonRibbonListUi_Pal` | `ribbons/list_ui.pal` | `/decomp/em/pokenav/ribbons/list_ui.pal` | `loadGbaPal` ✅ présent |

### Écran SUMMARY (`pokenav_ribbons_summary.ts`)
| symbole décomp | INCGFX | chemin runtime | loader |
|---|---|---|---|
| `gPokenavRibbonsSummaryBg_Gfx` | `ribbons/summary_bg.png` `.4bpp.lz` | `…/ribbons/summary_bg.png` | `loadTileBin(…,4)` ✅ |
| `gPokenavRibbonsSummaryBg_Tilemap` | `ribbons/summary_bg.bin.lz` | `…/ribbons/summary_bg.bin` | `loadTilemapBin` ✅ |
| `gPokenavRibbonsSummaryBg_Pal` | `ribbons/summary_bg.png` `.gbapal` | `…/ribbons/summary_bg.png` | `extractPngPlte` ✅ |
| `sRibbonIconsSmall_Gfx` | `ribbons/icons.png` `.4bpp.lz` | `…/ribbons/icons.png` | `loadTileBin(…,4)` ✅ |
| `sRibbonIconsBig_Gfx` | `ribbons/icons_big.png` `.4bpp.lz` | `…/ribbons/icons_big.png` | `loadTileBin(…,4)` ✅ |
| `sRibbonIcons1_Pal`..`5_Pal` | `ribbons/icons1..5.pal` `.gbapal` | `…/ribbons/icons{1..5}.pal` | `loadGbaPal` ✅ |
| `sMonInfo_Pal` | `ribbons/mon_info.pal` `.gbapal` | `…/ribbons/mon_info.pal` | `loadGbaPal` ✅ |

### Front pic du mon (summary) — via `CreateMonPicSprite_HandleDeoxys`
| besoin | chemin runtime | loader |
|---|---|---|
| tiles front pic espèce | `/decomp/em/pokemon/<espece>/front.png` | `loadIndexedPngStrict(…,4)` ✅ (déjà utilisé par pokédex/starter) |
| palette front pic | `/decomp/em/pokemon/<espece>/normal.pal` | `loadGbaPal` ✅ |

## Adaptations moteur (async — 1:1 côté ROM = INCGFX instantané)
- Les module-vars `gMonRibbonListFrame*` / `gPokenavRibbonsSummaryBg_*` / `sRibbon*_Pal` /
  `sRibbonIcons*_Gfx` sont `null` au module-init puis remplies par les loaders `_loadRibbons*Assets()`.
- **Gate `_settled`** (loaded OU 404) au `case 0` des `LoopedTask_Open*` (pattern sanctionné
  `pokenav_list` case 3) → jamais de tuiles VRAM sur `null`, jamais de freeze si un binaire manque.
- Si un asset manque au runtime : `console.error('[pokenav_ribbons_*] chargement … ÉCHOUÉ')` +
  le `_settled` débloque le gate (écran ouvre sans le visuel manquant, sans figer).
- **Contiguïté ROM** : le décomp lit `5 * PLTT_SIZE_4BPP` depuis `sRibbonIcons1_Pal` (les 5 pals
  icons sont contiguës en ROM). Le port concatène `icons1..5.pal` en 1 buffer 80 couleurs pour
  `sRibbonIcons1_Pal` (le sprite pal tag 1 n'en lit que les 16 premières = icons1).

## Bilan : AUCUN binaire manquant. Rien à extraire.
