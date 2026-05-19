# UNCITED — fonctions TS du port sans provenance décomp

Généré : 2026-05-19T12:34:11.296Z

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

