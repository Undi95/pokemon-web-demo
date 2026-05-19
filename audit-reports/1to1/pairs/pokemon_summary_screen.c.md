# Paires décomp↔port — `pokemon_summary_screen.c`

Généré : 2026-05-19T12:30:42.639Z

> ⚠️ Pairing statique pour relecture BORNÉE. NE PROUVE PAS le comportement.

10 fonction(s) décomp citée(s) (sur 140 fonctions du fichier).

## Index des paires

- `gLastViewedMonIndex` (pokemon_summary_screen.c:190-190) ‖ src/engine/summary-screen.ts:457
- `sBgTemplates` (pokemon_summary_screen.c:319-368) ‖ src/engine/summary-screen.ts:2228
- `sPowerAccSlidingWindow` (pokemon_summary_screen.c:388-396) ‖ src/engine/summary-screen.ts:1657
- `sSummaryTemplate` (pokemon_summary_screen.c:407-590) ‖ src/engine/summary-screen.ts:116
- `DrawExperienceProgressBar` (pokemon_summary_screen.c:2636-2677) ‖ src/engine/summary-screen.ts:_drawExperienceProgressBar
- `BufferNatureString` (pokemon_summary_screen.c:3173-3179) ‖ src/engine/data/game-data.ts:getNatureNameByIndex
- `PrintMoveDetails` (pokemon_summary_screen.c:3661-3685) ‖ src/engine/summary-screen.ts:_printMoveDetails
- `PlayMonCry` (pokemon_summary_screen.c:3963-3974) ‖ src/engine/summary-screen.ts:_playMonCryOnce
- `SpriteCB_Pokemon` (pokemon_summary_screen.c:3994-4007) ‖ src/engine/summary-screen.ts:_spriteCB_Pokemon
- `StopPokemonAnimations` (pokemon_summary_screen.c:4030-4047) ‖ src/engine/mon-summary-anim.ts:StopPokemonAnimations

## Paires détaillées

```

══════════════════════════════════════════════════════════════════════════════
▌ · gLastViewedMonIndex  —  pokemon_summary_screen.c:190-190 (1 l)
▌ ‖ port: src/engine/summary-screen.ts:457 (hors fonction)  ← cite "pokemon_summary_screen.c:190" @src/engine/summary-screen.ts:457
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:190-190 ────────────────────────────────────────
  190│ EWRAM_DATA u8 gLastViewedMonIndex = 0;
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ · sBgTemplates  —  pokemon_summary_screen.c:319-368 (50 l)
▌ ‖ port: src/engine/summary-screen.ts:2228 (hors fonction)  ← cite "pokemon_summary_screen.c:359" @src/engine/summary-screen.ts:2228
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:319-368 ────────────────────────────────────────
  319│ static const struct BgTemplate sBgTemplates[] =
  320│ {
  321│     {
  322│         .bg = 0,
  323│         .charBaseIndex = 0,
  324│         .mapBaseIndex = 31,
  325│         .screenSize = 0,
  326│         .paletteMode = 0,
  327│         .priority = 0,
  328│         .baseTile = 0,
  329│     },
  330│     {
  331│         .bg = 1,
  332│         .charBaseIndex = 2,
  333│         .mapBaseIndex = 27,
  334│         .screenSize = 1,
  335│         .paletteMode = 0,
  336│         .priority = 1,
  337│         .baseTile = 0,
  338│     },
  339│     {
  340│         .bg = 2,
  341│         .charBaseIndex = 2,
  342│         .mapBaseIndex = 25,
  343│         .screenSize = 1,
  344│         .paletteMode = 0,
  345│         .priority = 2,
  346│         .baseTile = 0,
  347│     },
  348│     {
  349│         .bg = 3,
  350│         .charBaseIndex = 2,
  351│         .mapBaseIndex = 29,
  352│         .screenSize = 1,
  353│         .paletteMode = 0,
  354│         .priority = 3,
  355│         .baseTile = 0,
  356│     },
  357│ };
  358│ 
  359│ struct SlidingWindow
  360│ {
  361│     const u16 *gfx;
  362│     u16 defaultTile;
  363│     u8 width;
  364│     u8 height;
  365│     u8 left;
  366│     u8 top;
  367│ };
  368│ 
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ · sPowerAccSlidingWindow  —  pokemon_summary_screen.c:388-396 (9 l)
▌ ‖ port: src/engine/summary-screen.ts:1657 (hors fonction)  ← cite "pokemon_summary_screen.c:388-405" @src/engine/summary-screen.ts:1657
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:388-396 ────────────────────────────────────────
  388│ static const struct SlidingWindow sPowerAccSlidingWindow =
  389│ {
  390│     .gfx = gSummaryScreen_MoveEffect_Battle_Tilemap,
  391│     .defaultTile = 0,
  392│     .width = 10,
  393│     .height = 7,
  394│     .left = 0,
  395│     .top = 45
  396│ };
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ · sSummaryTemplate  —  pokemon_summary_screen.c:407-590 (184 l)
▌ ‖ port: src/engine/summary-screen.ts:116 (hors fonction)  ← cite "pokemon_summary_screen.c:407" @src/engine/summary-screen.ts:116
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:407-590 ────────────────────────────────────────
  407│ static const struct WindowTemplate sSummaryTemplate[] =
  408│ {
  409│     [PSS_LABEL_WINDOW_POKEMON_INFO_TITLE] = {
  410│         .bg = 0,
  411│         .tilemapLeft = 0,
  412│         .tilemapTop = 0,
  413│         .width = 11,
  414│         .height = 2,
  415│         .paletteNum = 6,
  416│         .baseBlock = 1,
  417│     },
  418│     [PSS_LABEL_WINDOW_POKEMON_SKILLS_TITLE] = {
  419│         .bg = 0,
  420│         .tilemapLeft = 0,
  421│         .tilemapTop = 0,
  422│         .width = 11,
  423│         .height = 2,
  424│         .paletteNum = 6,
  425│         .baseBlock = 23,
  426│     },
  427│     [PSS_LABEL_WINDOW_BATTLE_MOVES_TITLE] = {
  428│         .bg = 0,
  429│         .tilemapLeft = 0,
  430│         .tilemapTop = 0,
  431│         .width = 11,
  432│         .height = 2,
  433│         .paletteNum = 6,
  434│         .baseBlock = 45,
  435│     },
  436│     [PSS_LABEL_WINDOW_CONTEST_MOVES_TITLE] = {
  437│         .bg = 0,
  438│         .tilemapLeft = 0,
  439│         .tilemapTop = 0,
  440│         .width = 11,
  441│         .height = 2,
  442│         .paletteNum = 6,
  443│         .baseBlock = 67,
  444│     },
  445│     [PSS_LABEL_WINDOW_PROMPT_CANCEL] = {
  446│         .bg = 0,
  447│         .tilemapLeft = 22,
  448│         .tilemapTop = 0,
  449│         .width = 8,
  450│         .height = 2,
  451│         .paletteNum = 7,
  452│         .baseBlock = 89,
  453│     },
  454│     [PSS_LABEL_WINDOW_PROMPT_INFO] = {
  455│         .bg = 0,
  456│         .tilemapLeft = 22,
  457│         .tilemapTop = 0,
  458│         .width = 8,
  459│         .height = 2,
  460│         .paletteNum = 7,
  461│         .baseBlock = 105,
  462│     },
  463│     [PSS_LABEL_WINDOW_PROMPT_SWITCH] = {
  464│         .bg = 0,
  465│         .tilemapLeft = 22,
  466│         .tilemapTop = 0,
  467│         .width = 8,
  468│         .height = 2,
  469│         .paletteNum = 7,
  470│         .baseBlock = 121,
  471│     },
  472│     [PSS_LABEL_WINDOW_UNUSED1] = {
  473│         .bg = 0,
  474│         .tilemapLeft = 11,
  475│         .tilemapTop = 4,
  476│         .width = 0,
  477│         .height = 2,
  478│         .paletteNum = 6,
  479│         .baseBlock = 137,
  480│     },
  481│     [PSS_LABEL_WINDOW_POKEMON_INFO_RENTAL] = {
  482│         .bg = 0,
  483│         .tilemapLeft = 11,
  484│         .tilemapTop = 4,
  485│         .width = 18,
  486│         .height = 2,
  487│         .paletteNum = 6,
  488│         .baseBlock = 137,
  489│     },
  490│     [PSS_LABEL_WINDOW_POKEMON_INFO_TYPE] = {
  491│         .bg = 0,
  492│         .tilemapLeft = 11,
  493│         .tilemapTop = 6,
  494│         .width = 18,
  495│         .height = 2,
  496│         .paletteNum = 6,
  497│         .baseBlock = 173,
  498│     },
  499│     [PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_LEFT] = {
  500│         .bg = 0,
  501│         .tilemapLeft = 10,
  502│         .tilemapTop = 7,
  503│         .width = 6,
  504│         .height = 6,
  505│         .paletteNum = 6,
  506│         .baseBlock = 209,
  507│     },
  508│     [PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_RIGHT] = {
  509│         .bg = 0,
  510│         .tilemapLeft = 22,
  511│         .tilemapTop = 7,
  512│         .width = 5,
  513│         .height = 6,
  514│         .paletteNum = 6,
  515│         .baseBlock = 245,
  516│     },
  517│     [PSS_LABEL_WINDOW_POKEMON_SKILLS_EXP] = {
  518│         .bg = 0,
  519│         .tilemapLeft = 10,
  520│         .tilemapTop = 14,
  521│         .width = 11,
  522│         .height = 4,
  523│         .paletteNum = 6,
  524│         .baseBlock = 275,
  525│     },
  526│     [PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS] = {
  527│         .bg = 0,
  528│         .tilemapLeft = 0,
  529│         .tilemapTop = 18,
  530│         .width = 6,
  531│         .height = 2,
  532│         .paletteNum = 6,
  533│         .baseBlock = 319,
  534│     },
  535│     [PSS_LABEL_WINDOW_MOVES_POWER_ACC] = {
  536│         .bg = 0,
  537│         .tilemapLeft = 1,
  538│         .tilemapTop = 15,
  539│         .width = 9,
  540│         .height = 4,
  541│         .paletteNum = 6,
  542│         .baseBlock = 331,
  543│     },
  544│     [PSS_LABEL_WINDOW_MOVES_APPEAL_JAM] = {
  545│         .bg = 0,
  546│         .tilemapLeft = 1,
  547│         .tilemapTop = 15,
  548│         .width = 5,
  549│         .height = 4,
  550│         .paletteNum = 6,
  551│         .baseBlock = 367,
  552│     },
  553│     [PSS_LABEL_WINDOW_UNUSED2] = {
  554│         .bg = 0,
  555│         .tilemapLeft = 22,
  556│         .tilemapTop = 4,
  557│         .width = 0,
  558│         .height = 2,
  559│         .paletteNum = 6,
  560│         .baseBlock = 387,
  561│     },
  562│     [PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER] = {
  563│         .bg = 0,
  564│         .tilemapLeft = 1,
  565│         .tilemapTop = 2,
  566│         .width = 4,
  567│         .height = 2,
  568│         .paletteNum = 7,
  569│         .baseBlock = 387,
  570│     },
  571│     [PSS_LABEL_WINDOW_PORTRAIT_NICKNAME] = {
  572│         .bg = 0,
  573│         .tilemapLeft = 1,
  574│         .tilemapTop = 12,
  575│         .width = 9,
  576│         .height = 2,
  577│         .paletteNum = 6,
  578│         .baseBlock = 395,
  579│     },
  580│     [PSS_LABEL_WINDOW_PORTRAIT_SPECIES] = {
  581│         .bg = 0,
  582│         .tilemapLeft = 1,
  583│         .tilemapTop = 14,
  584│         .width = 9,
  585│         .height = 4,
  586│         .paletteNum = 6,
  587│         .baseBlock = 413,
  588│     },
  589│     [PSS_LABEL_WINDOW_END] = DUMMY_WIN_TEMPLATE
  590│ };
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ DrawExperienceProgressBar  —  pokemon_summary_screen.c:2636-2677 (42 l)
▌ ‖ port: _drawExperienceProgressBar (src/engine/summary-screen.ts:1248-1283)  ← cite "pokemon_summary_screen.c:2636-2675" @src/engine/summary-screen.ts:1248
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:2636-2677 ────────────────────────────────────────
 2636│ static void DrawExperienceProgressBar(struct Pokemon *unused)
 2637│ {
 2638│     s64 numExpProgressBarTicks;
 2639│     struct PokeSummary *summary = &sMonSummaryScreen->summary;
 2640│     u16 *dst;
 2641│     u8 i;
 2642│ 
 2643│     if (summary->level < MAX_LEVEL)
 2644│     {
 2645│         u32 expBetweenLevels = gExperienceTables[gSpeciesInfo[summary->species].growthRate][summary->level + 1] - gExperienceTables[gSpeciesInfo[summary->species].growthRate][summary->level];
 2646│         u32 expSinceLastLevel = summary->exp - gExperienceTables[gSpeciesInfo[summary->species].growthRate][summary->level];
 2647│ 
 2648│         // Calculate the number of 1-pixel "ticks" to illuminate in the experience progress bar.
 2649│         // There are 8 tiles that make up the bar, and each tile has 8 "ticks". Hence, the numerator
 2650│         // is multiplied by 64.
 2651│         numExpProgressBarTicks = expSinceLastLevel * 64 / expBetweenLevels;
 2652│         if (numExpProgressBarTicks == 0 && expSinceLastLevel != 0)
 2653│             numExpProgressBarTicks = 1;
 2654│     }
 2655│     else
 2656│     {
 2657│         numExpProgressBarTicks = 0;
 2658│     }
 2659│ 
 2660│     dst = &sMonSummaryScreen->bgTilemapBuffers[PSS_PAGE_SKILLS][1][0x255];
 2661│     for (i = 0; i < 8; i++)
 2662│     {
 2663│         if (numExpProgressBarTicks > 7)
 2664│             dst[i] = 0x206A;
 2665│         else
 2666│             dst[i] = 0x2062 + (numExpProgressBarTicks % 8);
 2667│         numExpProgressBarTicks -= 8;
 2668│         if (numExpProgressBarTicks < 0)
 2669│             numExpProgressBarTicks = 0;
 2670│     }
 2671│ 
 2672│     if (GetBgTilemapBuffer(1) == sMonSummaryScreen->bgTilemapBuffers[PSS_PAGE_SKILLS][0])
 2673│         ScheduleBgCopyTilemapToVram(1);
 2674│     else
 2675│         ScheduleBgCopyTilemapToVram(2);
 2676│ }
 2677│ 
├─ PORT src/engine/summary-screen.ts:1248-1283 ────────────────────────────────────────
 1248│ /** 1:1 décomp `DrawExperienceProgressBar` (pokemon_summary_screen.c:2636-2675).
 1249│  *  8 tiles de barre EXP-vers-niveau-suivant : 64 "ticks" répartis (8 tiles ×
 1250│  *  8 px). tile = 0x2062 + (ticks%8) pour le tile partiel, 0x206A si plein.
 1251│  *  Écrit dans bgTilemapBuffers[SKILLS][1] @0x255 (= notre flat offset
 1252│  *  0x400+0x255, SC1) puis ScheduleBgCopy du BG portant SKILLS. */
 1253│ function _drawExperienceProgressBar(): void {
 1254│   const sum = sMon.summary;
 1255│   const sp = getSpeciesInfo(sum.species);
 1256│   const MAX_LEVEL = 100;
 1257│   let ticks: number;
 1258│   if (sum.level < MAX_LEVEL && sp) {
 1259│     // 1:1 décomp :2645-2646 : `u32 expBetweenLevels` / `u32 expSinceLastLevel`.
 1260│     // Sémantique UNSIGNED 32-bit : si summary->exp < table[level] (ex. mon de
 1261│     // debug exp=0 à N>1), expSinceLastLevel UNDERFLOW → ~4.29e9 → ticks énorme
 1262│     // → barre PLEINE (tous 0x206A), comme la ROM. (Soustraction signée JS →
 1263│     // négatif → 0x2062+(neg%8) = tile blanche fausse = le bug observé.) `>>> 0`
 1264│     // = cast u32 obligatoire pour le 1:1.
 1265│     const expBetween = (getExperienceForLevel(sp.growthRate, sum.level + 1) - getExperienceForLevel(sp.growthRate, sum.level)) >>> 0;
 1266│     const expSince = (sum.exp - getExperienceForLevel(sp.growthRate, sum.level)) >>> 0;
 1267│     ticks = expBetween !== 0 ? Math.floor((expSince * 64) / expBetween) : 0;
 1268│     if (ticks === 0 && expSince !== 0) ticks = 1;   // 1:1 :2652
 1269│   } else {
 1270│     ticks = 0;
 1271│   }
 1272│   const buf = sMon.bgTilemapBuffers[PSS_PAGE_SKILLS];
 1273│   if (!buf) return;
 1274│   const dst = 0x400 + 0x255;   // décomp [1][0x255] : SC1 = notre offset 0x400
 1275│   for (let i = 0; i < 8; i++) {
 1276│     buf[dst + i] = ticks > 7 ? 0x206A : (0x2062 + (ticks % 8));
 1277│     ticks -= 8;
 1278│     if (ticks < 0) ticks = 0;
 1279│   }
 1280│   // 1:1 :2672 : copie le BG qui porte actuellement la page SKILLS (1 ou 2).
 1281│   if (_getBgPage(1) === PSS_PAGE_SKILLS) _scheduleBgCopy(1);
 1282│   else _scheduleBgCopy(2);
 1283│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ BufferNatureString  —  pokemon_summary_screen.c:3173-3179 (7 l)
▌ ‖ port: getNatureNameByIndex (src/engine/data/game-data.ts:291-299)  ← cite "pokemon_summary_screen.c:3176" @src/engine/data/game-data.ts:295
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:3173-3179 ────────────────────────────────────────
 3173│ static void BufferNatureString(void)
 3174│ {
 3175│     struct PokemonSummaryScreenData *sumStruct = sMonSummaryScreen;
 3176│     DynamicPlaceholderTextUtil_SetPlaceholderPtr(2, gNatureNamePointers[sumStruct->summary.nature]);
 3177│     DynamicPlaceholderTextUtil_SetPlaceholderPtr(5, gText_EmptyString5);
 3178│ }
 3179│ 
├─ PORT src/engine/data/game-data.ts:291-299 ────────────────────────────────────────
  291│ /** 1:1 décomp `gNatureNamePointers[nature]` — nature indexée 0..24 (= ordre
  292│  *  enum NATURE_HARDY=0 … NATURE_QUIRKY=24). `nature-names-fr.json` est extrait
  293│  *  dans cet ordre exact (clés `NATURE_*` en ordre enum), donc `Object.values`
  294│  *  [idx] = le nom FR 1:1 (zéro hardcode de l'enum). Utilisé par
  295│  *  BufferNatureString (pokemon_summary_screen.c:3176). */
  296│ export function getNatureNameByIndex(natureIndex: number): string {
  297│   const vals = Object.values(ensureLoaded().natureNamesFr);
  298│   return vals[natureIndex] ?? '';
  299│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ PrintMoveDetails  —  pokemon_summary_screen.c:3661-3685 (25 l)
▌ ‖ port: _printMoveDetails (src/engine/summary-screen.ts:1363-1382)  ← cite "pokemon_summary_screen.c:3674" @src/engine/summary-screen.ts:1371
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:3661-3685 ────────────────────────────────────────
 3661│ static void PrintMoveDetails(u16 move)
 3662│ {
 3663│     u8 windowId = AddWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_DESCRIPTION);
 3664│     FillWindowPixelBuffer(windowId, PIXEL_FILL(0));
 3665│     if (move != MOVE_NONE)
 3666│     {
 3667│         if (sMonSummaryScreen->currPageIndex == PSS_PAGE_BATTLE_MOVES)
 3668│         {
 3669│             PrintMovePowerAndAccuracy(move);
 3670│             PrintTextOnWindow(windowId, gMoveDescriptionPointers[move - 1], 6, 1, 0, 0);
 3671│         }
 3672│         else
 3673│         {
 3674│             PrintTextOnWindow(windowId, gContestEffectDescriptionPointers[gContestMoves[move].effect], 6, 1, 0, 0);
 3675│         }
 3676│         PutWindowTilemap(windowId);
 3677│     }
 3678│     else
 3679│     {
 3680│         ClearWindowTilemap(windowId);
 3681│     }
 3682│ 
 3683│     ScheduleBgCopyTilemapToVram(0);
 3684│ }
 3685│ 
├─ PORT src/engine/summary-screen.ts:1363-1382 ────────────────────────────────────────
 1363│ function _printMoveDetails(move: string): void {
 1364│   const wid = _addWindowFromTemplateList(sPageMovesTemplate, PSS_DATA_WINDOW_MOVE_DESCRIPTION);
 1365│   FillWindowPixelBuffer(wid, 0);
 1366│   if (move) {
 1367│     if (sMon.currPageIndex === PSS_PAGE_BATTLE_MOVES) {
 1368│       _printMovePowerAndAccuracy(move);
 1369│       _printTextOnWindow(wid, getMoveDescription(move), 6, 1, 0, 0);
 1370│     } else {
 1371│       // 1:1 décomp PrintMoveDetails (pokemon_summary_screen.c:3674) : page
 1372│       // CONTEST → gContestEffectDescriptionPointers[gContestMoves[move]
 1373│       // .effect] (description d'EFFET concours), PAS la description combat.
 1374│       const cm = getContestMove(move);
 1375│       _printTextOnWindow(wid, cm ? getContestEffectDescription(cm.effect) : '', 6, 1, 0, 0);
 1376│     }
 1377│     _flushWin(wid);
 1378│   } else {
 1379│     ClearWindowTilemap(wid);
 1380│   }
 1381│   _scheduleBgCopy(0);
 1382│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ PlayMonCry  —  pokemon_summary_screen.c:3963-3974 (12 l)
▌ ‖ port: _playMonCryOnce (src/engine/summary-screen.ts:1963-1988)  ← cite "pokemon_summary_screen.c:3963" @src/engine/summary-screen.ts:1973
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:3963-3974 ────────────────────────────────────────
 3963│ static void PlayMonCry(void)
 3964│ {
 3965│     struct PokeSummary *summary = &sMonSummaryScreen->summary;
 3966│     if (!summary->isEgg)
 3967│     {
 3968│         if (ShouldPlayNormalMonCry(&sMonSummaryScreen->currentMon) == TRUE)
 3969│             PlayCry_ByMode(summary->species2, 0, CRY_MODE_NORMAL);
 3970│         else
 3971│             PlayCry_ByMode(summary->species2, 0, CRY_MODE_WEAK);
 3972│     }
 3973│ }
 3974│ 
├─ PORT src/engine/summary-screen.ts:1963-1988 ────────────────────────────────────────
 1963│ /** 1:1 décomp `SpriteCB_Pokemon` (:3994) : `if (!gPaletteFade.active &&
 1964│  *  data[2]!=1) { data[1]=IsMonSpriteNotFlipped; PlayMonCry();
 1965│  *  PokemonSummaryDoMonAnimation(sprite, species, isEgg); }`. Appelé une
 1966│  *  fois au state 'open' (post fade-in = !gPaletteFade.active). L'anim
 1967│  *  d'intro affine COMPLÈTE est portée 1:1 (mon-summary-anim.ts, 151
 1968│  *  Anim_* + framework ObjAffineSet/HandleSetAffineData/sAnims). */
 1969│ function _playMonCryOnce(): void {
 1970│   if (_cryPlayed || !sMon.currentMon) return;
 1971│   _cryPlayed = true;
 1972│   const isEgg = sMon.summary.isEgg;
 1973│   // 1:1 décomp `PlayMonCry` (pokemon_summary_screen.c:3963) : `if (!summary
 1974│   // ->isEgg) PlayCry...`. Un œuf NE FAIT PAS le cri du mon à l'intérieur.
 1975│   if (!isEgg) {
 1976│     const sp = sMon.currentMon.speciesName;
 1977│     void import('./music').then(({ playCry }) => playCry(sp)).catch(() => { /* cry asset absent */ });
 1978│   }
 1979│   // PokemonSummaryDoMonAnimation : species2 = SPECIES_EGG si œuf (sprite =
 1980│   // egg/front.png) ; oneFrame = isEgg (skip StartSpriteAnim 2e frame).
 1981│   const rt = getRuntime();
 1982│   const monSpr = rt && _monPicSpriteId >= 0 ? rt.gSprites.get(_monPicSpriteId) : null;
 1983│   if (monSpr) {
 1984│     const speciesEnum = isEgg ? 'SPECIES_EGG' : sMon.summary.species;
 1985│     try { PokemonSummaryDoMonAnimation(monSpr, speciesEnum, isEgg, MON_PIC_TILE_BASE, MON_PIC_FRAME_TILES); }
 1986│     catch (e) { console.error('[summary] mon anim failed:', e); }
 1987│   }
 1988│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SpriteCB_Pokemon  —  pokemon_summary_screen.c:3994-4007 (14 l)
▌ ‖ port: _spriteCB_Pokemon (src/engine/summary-screen.ts:1885-1893)  ← cite "pokemon_summary_screen.c:3994-4004" @src/engine/summary-screen.ts:1885
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:3994-4007 ────────────────────────────────────────
 3994│ static void SpriteCB_Pokemon(struct Sprite *sprite)
 3995│ {
 3996│     struct PokeSummary *summary = &sMonSummaryScreen->summary;
 3997│ 
 3998│     if (!gPaletteFade.active && sprite->data[2] != 1)
 3999│     {
 4000│         sprite->data[1] = IsMonSpriteNotFlipped(sprite->data[0]);
 4001│         PlayMonCry();
 4002│         PokemonSummaryDoMonAnimation(sprite, sprite->data[0], summary->isEgg);
 4003│     }
 4004│ }
 4005│ 
 4006│ // Track and then destroy Task_PokemonSummaryAnimateAfterDelay
 4007│ // Normally destroys itself but it can be interrupted before the animation starts
├─ PORT src/engine/summary-screen.ts:1885-1893 ────────────────────────────────────────
 1885│ /** 1:1 décomp `SpriteCB_Pokemon` (pokemon_summary_screen.c:3994-4004) :
 1886│  *  callback per-frame du sprite mon-pic ; déclenche cry + anim UNE fois,
 1887│  *  gaté `!gPaletteFade.active && sprite->data[2] != 1`. data[2] est mis à 1
 1888│  *  pendant la fenêtre de redraw du changement (Task_ChangeSummaryMon case 8
 1889│  *  → case 12) pour SUPPRIMER le trigger, remis à 0 ensuite. `_playMonCry
 1890│  *  Once` (guard _cryPlayed) garantit le "une fois" ; pour un mon "delayed"
 1891│  *  (JIRACHI) PokemonSummaryDoMonAnimation remplace la callback (MonAnim
 1892│  *  DummySpriteCallback) donc SpriteCB_Pokemon cesse, 1:1 net. */
 1893│ function _spriteCB_Pokemon(sprite: { data: number[] }): void {
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ StopPokemonAnimations  —  pokemon_summary_screen.c:4030-4047 (18 l)
▌ ‖ port: StopPokemonAnimations (src/engine/mon-summary-anim.ts:1995-2007)  ← cite "pokemon_summary_screen.c:4030" @src/engine/mon-summary-anim.ts:1995
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP pokemon_summary_screen.c:4030-4047 ────────────────────────────────────────
 4030│ static void StopPokemonAnimations(void)  // A subtle effect, this function stops Pokémon animations when leaving the PSS
 4031│ {
 4032│     u16 i;
 4033│     u16 paletteIndex;
 4034│ 
 4035│     gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_MON]].animPaused = TRUE;
 4036│     gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_MON]].callback = SpriteCallbackDummy;
 4037│     StopPokemonAnimationDelayTask();
 4038│ 
 4039│     paletteIndex = OBJ_PLTT_ID(gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_MON]].oam.paletteNum);
 4040│ 
 4041│     for (i = 0; i < 16; i++)
 4042│     {
 4043│         u16 id = i + paletteIndex;
 4044│         gPlttBufferUnfaded[id] = gPlttBufferFaded[id];
 4045│     }
 4046│ }
 4047│ 
├─ PORT src/engine/mon-summary-anim.ts:1995-2007 ────────────────────────────────────────
 1995│ /** 1:1 décomp `StopPokemonAnimations` (pokemon_summary_screen.c:4030) :
 1996│  *  fige le sprite + restaure la palette OBJ (annule BlendPalette glow). */
 1997│ export function StopPokemonAnimations(s: DecompSprite): void {
 1998│   const rt = getRuntime(); if (!rt) return;
 1999│   s.callback = SpriteCallbackDummy as unknown as DecompSprite['callback'];
 2000│   _stopMonFrameAnim();
 2001│   StopPokemonAnimationDelayTask();
 2002│   const palIndex = OBJ_PLTT_ID(rt.gba.oam[s.oamIndex]?.paletteBank ?? 0);
 2003│   for (let i = 0; i < 16; i++) {
 2004│     const id = i + palIndex;
 2005│     rt.gPlttBufferUnfaded.set(id, rt.gPlttBufferFaded.get(id));
 2006│   }
 2007│ }
└────────────────────────────────────────────────────────────

```
