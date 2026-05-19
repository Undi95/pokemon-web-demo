# UNCITED — fonctions TS du port sans provenance décomp

Généré : 2026-05-19T13:38:28.353Z

> ⚠️ Statique = couverture + traçabilité + filet régression. **NE PROUVE PAS le comportement.**
> Bugs timing/fade/sprite = runtime ROM-diff séparé (mgba-wasm), hors de cet outil.

> **PRECISE** = citation `fichier.c:N` (idéal) · **MARKER** = marqueur `1:1`/`décomp`
> dans le corps ou un bandeau de section (provenance OK, ligne imprécise) ·
> **HARD** = ni l'un ni l'autre → vraiment adapté / à justifier (liste actionnable).

## `src/engine/party-screen.ts`

PRECISE **48/65 (74%)** · +MARKER **55/65 (85%)** · HARD **10** (triées par taille)

- `_freePartyMenu` (L1195-1233, 39l)
- `OpenPartyScreen` (L2044-2056, 13l)
- `ClosePartyScreen` (L2109-2119, 11l)
- `_loadPokeballGfx` (L963-972, 10l)
- `Task_FadeAndClosePartyMenu` (L1235-1240, 6l)
- `_rightAlign3` (L549-552, 4l)
- `IsPartyScreenOpen` (L2040-2042, 3l)
- `TickPartyScreen` (L2122-2124, 3l)
- `VBlankCB_PartyMenuRun` (L1937-1937, 1l)
- `MainCB2_PartyMenuRun` (L1938-1938, 1l)

## `src/engine/summary-screen.ts`

PRECISE **4/138 (3%)** · +MARKER **115/138 (83%)** · HARD **23** (triées par taille)

- `_loadAssets` (L514-555, 42l)
- `_printMoveNameAndPP` (L1322-1347, 26l)
- `_freeSummary` (L2876-2897, 22l)
- `_clearPageWindowTilemaps` (L1560-1578, 19l)
- `_printExpPointsNextLevel` (L1230-1246, 17l)
- `__summaryDebugState` (L3061-3074, 14l)
- `_bufferLeftColumnStats` (L1201-1213, 13l)
- `_emptySummary` (L424-433, 10l)
- `_bufferRightColumnStats` (L1218-1225, 8l)
- `_currentReset` (L2899-2906, 8l)
- `_printHeldItemName` (L1168-1173, 6l)
- `_flushWin` (L873-877, 5l)
- `_resumeInput` (L2093-2097, 5l)
- `_rightAlignSpacer` (L1197-1200, 4l)
- `_bgMapBase` (L568-570, 3l)
- `_printMonAbilityName` (L1071-1073, 3l)
- `_printMonAbilityDescription` (L1074-1076, 3l)
- `_printMonTrainerMemo` (L1101-1103, 3l)
- `_printLeftColumnStats` (L1214-1216, 3l)
- `_printRightColumnStats` (L1226-1228, 3l)
- `IsSummaryScreenOpen` (L3013-3015, 3l)
- `CloseSummaryScreen` (L3056-3058, 3l)
- `MainCB2_SummaryRun` (L2913-2913, 1l)

## `src/engine/bag-menu.ts`

PRECISE **19/25 (76%)** · +MARKER **21/25 (84%)** · HARD **4** (triées par taille)

- `_bagLoadAssets` (L209-232, 24l)
- `_allocZeroedBagMenu` (L160-181, 22l)
- `__bagMenuDebugState` (L628-639, 12l)
- `VBlankCB_BagMenuRun` (L395-395, 1l)

## `src/engine/bag-screen.ts`

PRECISE **19/74 (26%)** · +MARKER **54/74 (73%)** · HARD **20** (triées par taille)

- `_tickTossConfirm` (L1755-1784, 30l)
- `_tickContextMenu` (L1579-1607, 29l)
- `_tickTossQuantity` (L1697-1725, 29l)
- `_despawnPocketArrows` (L1082-1099, 18l)
- `_despawnListScrollArrows` (L1165-1182, 18l)
- `_drawYesNo` (L1736-1753, 18l)
- `_drawTossPrompt` (L1660-1676, 17l)
- `_wrap` (L738-752, 15l)
- `_cancelToss` (L1813-1826, 14l)
- `initItemIconMap` (L784-795, 12l)
- `_tickRotatingBall` (L1392-1399, 8l)
- `_askTossItems` (L1727-1734, 8l)
- `_drawAll` (L754-760, 7l)
- `_selectedItemKey` (L522-526, 5l)
- `_cancelItemSwap` (L1902-1906, 5l)
- `_ensureStdMenuPal` (L2276-2280, 5l)
- `_confirmToss` (L1786-1789, 4l)
- `preloadBagAssets` (L500-502, 3l)
- `_drawDots` (L552-554, 3l)
- `IsBagScreenOpen` (L898-900, 3l)

## `src/engine/list-menu.ts`

PRECISE **45/51 (88%)** · +MARKER **50/51 (98%)** · HARD **1** (triées par taille)

- `_destroyTask` (L490-493, 4l)

## `src/engine/bag.ts`

PRECISE **1/14 (7%)** · +MARKER **10/14 (71%)** · HARD **4** (triées par taille)

- `migrateBag` (L78-93, 16l)
- `pocketArrayFor` (L104-113, 10l)
- `getPocketName` (L96-101, 6l)
- `getSlotCapacity` (L116-118, 3l)

