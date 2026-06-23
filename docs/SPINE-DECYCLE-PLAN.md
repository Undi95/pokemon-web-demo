# SPINE — Plan de décyclage du `decomp-bridge.ts`

> Source : 616 exports classés de `harness/runtime/decomp-bridge.ts` (Workflow read-only `spine-decycle-map`, 15 agents Plan, 2026-06-23).
> Objectif : vider progressivement le bridge en rapatriant chaque symbole vers son foyer canonique `src/` / `include/`, en re-routant les importeurs, sans jamais introduire de cycle ESM. Exécution **solo, lot-par-lot**, `tsc=0` + test A/B à chaque lot, **jamais de push**.

---

## 0. ADDENDUM post-audit déterministe (2026-06-23, `scripts/audit-bridge-importers.cjs`)

⚠ **Les `importerCount` du plan comptent TOUTES les sources, pas le bridge-spécifique.** Audit déterministe des imports **depuis le bridge** :
- **656 exports** ; **50 VIVANTS** (≥1 importeur statique du bridge) ; **606 statiquement MORTS** (0 importeur du bridge).
- Top vivants (vrai re-route) : `CreateSprite`(20), `CreateTask`(10), `ResetSpriteData`(10), `DestroyTask`(9), `BeginNormalPaletteFade`(9), `DestroySprite`(6), `SetGpuReg`(5), `ConvertIntToDecimalStringN`(4), `StartSpriteAnim`(4), `StringCopy`(3)…
- **Surfaces dynamiques** : `__game_bridge` (globalThis) = **JAMAIS assigné → INERTE** (lectures optionnelles à fallback dans specials-registry) ; `__bridgedHelpers__` = lu en **read-only** par `dev-bridge-audit-tools.ts` (coverage) ; `dev-scope.ts` itère le namespace (expo devtools). **Aucun résolveur dynamique ne consomme le bridge** → l'audit statique est fiable.
- **Conséquence** : beaucoup de « lots gros » du plan sont en fait des **ré-exports 0-importeur** (suppression sèche, ex. lot 12 trig). Le **vrai travail de re-route** = ~50 symboles. Le reste des 606 morts = cleanup progressif (⚠ exclure le **substrat** ~225 + vérifier l'**usage interne bridge↔bridge** avant chaque retrait, ce que l'audit statique ne voit pas).

---

## 1. Résumé

Répartition par classification (616 lignes ; quelques symboles comptés 2× dans le JSON brut — voir §4/§7) :

| Classification | Sens | Compte | Action |
|---|---|---|---|
| **substrate** | Reste dans le harness (BIOS/macros HW/glue runtime) | 225 | Ne pas bouger |
| **duplicate** | Déjà défini dans un foyer `src/`/`include/` — le bridge double | 172 | Supprimer du bridge + re-router |
| **movable** | Origine `.c` claire, foyer cible identifié mais pas encore porté | 202 | Porter dans le foyer + re-router |
| **orphan** | Origine ambiguë / nom suspect / introuvable | 17 | Investiguer AVANT tout déplacement |

**Effort très concentré.** Gros porteurs : `GetMonData`/`SetMonData` (40 ch. → party-storage), `DestroySprite` (35), `SetGpuReg` (32), `StartSpriteAnim` (30), `CreateTask`/`DestroyTask` (28 ch.), `PlaySE` (27), `LoadPalette` (21), `CreateSprite` (20), `BeginNormalPaletteFade` (19), `Sin` (18), `StartSpriteAffineAnim` (17), `DIR_*` (17 ch.). ≈ **900+ sites d'import** à re-router, mais ~70 % absorbés par une douzaine de lots centraux (sprite / task / gpu_regs / palette / event_object_movement / party-storage).

---

## 2. Table `duplicate` — gains rapides (0 risque logique)

Foyer canonique `src/` déjà existant ; le bridge n'est qu'un relais. Action = **supprimer du bridge, re-router**.

### 2a. Sûrs (impl identique → supprimer + re-router)

| Symbole | Foyer canonique existant | Imp. | cycleRisk |
|---|---|---|---|
| FreeAllSpritePalettes | src/sprite.ts:282 | 6 | high |
| IndexOfSpritePaletteTag | src/sprite.ts:306 | 7 | high |
| GetSpriteTileStartByTag | src/sprite.ts:749 | 5 | high |
| LoadSpritePalettes | src/sprite.ts:477 | 6 | high |
| AnimateSprites / BuildOamBuffer | src/sprite.ts:1885/1894 | 4 / 4 | high |
| DestroySprite | src/sprite.ts:1390 | 35 | medium |
| FreeOamMatrix / AllocOamMatrix | src/sprite.ts:546/507 | 12 / 13 | low |
| ResetSpriteData | src/sprite.ts:1412 | 15 | medium |
| StartSpriteAnim | src/sprite.ts:1353 | 30 | medium |
| Sin / Cos / gSineTable | src/trig.ts:73/78/27 | 18 / 14 / 2 | high |
| Random / SeedRng / Random32 / SeedRngAndSetTrainerId | src/random.ts, include/random.ts, src/main.ts | 6/0/0/0 | medium–low |
| GetMonData / SetMonData | src/engine/battle/party-storage.ts:269/406 | 40 / 40 | high |
| GetVarPointer | src/event_data.ts:57 (à exporter) | 1 | medium |
| FindCameraSprite | src/event_object_movement.ts:8443 (à exporter) | 2 | medium |
| AreCoordsWithinMapGridBounds | src/fieldmap.ts:1720 (à exporter) | 1 | medium |
| GetWalk{Slow,Normal,Fast,Faster}MovementAction | src/event_object_movement.ts:6141/6124/6159/6290 | 4/5/2/2 | medium–high |
| GetWalkInPlace{Normal,Fast,Slow}MovementAction | src/event_object_movement.ts:6274/6238/6255 | 2/2/1 | high |
| GetJump2 / GetJumpSpecialMovementAction | src/event_object_movement.ts:6202/6221 | 1/3 | high |
| GetFace/Move{,Fast,Faster}DirectionAnimNum, GetRunningDirectionAnimNum, GetOppositeDirection | src/engine/field/direction-coords.ts + event_object_movement.ts | 1–2 ch. | medium |
| DIR_NONE/SOUTH/NORTH/WEST/EAST | src/engine/field/direction-coords.ts:17-21 | 17 ch. | high |
| OBJECT_EVENTS_COUNT | src/event_object_movement.ts:124 | 0 | medium |
| LOCALID_PLAYER / LOCALID_NONE | include/constants/event_objects.ts:300/297 | 1/1 | low–medium |
| UNPACK_BEHAVIOR / UNPACK_METATILE | src/fieldmap.ts:340/337 | 0/1 | low–medium |
| MAP_GROUP / MAP_NUM | include/constants/map_groups.ts:1054-1055 | 0 | low |
| HIHALF / LOHALF | include/global.ts:8/13 | 1 ch. | low |
| GET_SHINY_VALUE / GET_UNOWN_LETTER | include/pokemon.ts:33/24 | 3/1 | low |
| ISO_RANDOMIZE1 / TRUE / FALSE | include/random.ts, include/gba/defines.ts | 0 | low |
| Bloc script-vars (Compare, COMPARE_*, FlagSet/Clear/Get, VarSet/Get) | src/engine/script/script-vars.ts | 15 (bloc) | medium |
| Bloc script (LockPlayerFieldControls, InitScriptContext, SetupBytecodeScript, ScriptJump) | src/script.ts | 8 (bloc) | medium |
| Bloc texte (StringExpandPlaceholders, GetStringWidth, RunTextPrinters, …×12) | src/engine/ui/gba-text-system.ts | 20 (bloc) | medium |
| Bloc text_window (×7) | src/text_window.ts | 0 | low |
| MapGridGetCollision/MetatileBehavior/Elevation At | src/fieldmap.ts:1749/1765/1742 | 0 | low |
| Blocs MetatileBehavior_* (~23) + `export *` metatile_behaviors | src/metatile_behavior.ts / include/constants/metatile_behaviors.ts | 0 | low–medium |
| Famille string_util (StringCopy/Append/Convert/Length/Compare/…×15) + WriteColorChangeControlCode | src/string_util.ts | ≈10 | low |
| STR_CONV_MODE_LEFT_ALIGN/RIGHT_ALIGN/LEADING_ZEROS | include/string_util.ts:13-15 | 1/3/1 | low |
| Famille easy_chat (CopyEasyChatWord, ConvertEasyChatWordsToString, CopyEasyChatWordPadded) | src/easy_chat.ts / engine/ui/easy-chat-render.ts | 2/1/1 | low |
| DynamicPlaceholderTextUtil_ExpandPlaceholders | src/dynamic_placeholder_text_util.ts:51 | 1 | low |
| GetBerryInfo / GetBerryTreeInfo | src/berry.ts:317/329 | 1/1 | low |
| GetObjectEventGraphicsInfo | src/engine/field/object-event-graphics.ts:275 | 1 | high |
| GetDoorGraphics / GetMapSecIdAt | src/field_door.ts (l.690 → exporter) / src/engine/field/region-map-data.ts:77 | 0/0 | low |
| GetHealthboxElementGfxPtr, AddTextPrinterAndCreateWindowOnHealthbox | src/battle_interface.ts (→ exporter) | 0 | low |
| GetIntroSpeechOfApproachingTrainer, GetTrainerCantBattleSpeech, GetTrainerALoseText | src/battle_setup.ts:457/464, engine/battle/battle-setup-helpers.ts:282 | 0 | low |
| Famille battle constants (BATTLE_PARTNER/OPPOSITE, GET_BATTLER_SIDE, IS_TYPE_*, STATUS1/2/3_*, GET/SET_STAT_BUFF*, HITMARKER_*, SET_STATCHANGER) | src/engine/battle/constants.ts | 0–1 | low–medium |
| PREPARE_*_BUFFER (×13), PREPARE_STAT/ABILITY_BUFFER | src/engine/battle/text-buffers.ts:116–221 | 0 | low |
| IS_ITEM_MAIL | src/mail.ts:985 (à exporter) | 0 | low |
| GET_TRUE_SPRITE_INDEX, ANIM_SPRITES_START | include/constants/battle_anim.ts | 2/8 | low–medium |
| INTRO3_RAW_PTR / DmaClearLarge16 | harness/runtime/decomp-globals.ts:1862/393 | 1/0 | low |
| BG_TILE_H/V_FLIP, WIN_RANGE, PLTT_SIZEOF, PLTT_SIZE_4BPP/8BPP | harness/runtime/decomp-helpers.ts | 1 ch. | low |

### 2b. `duplicate` à RÉCONCILIER la signature AVANT suppression (⚠ ne pas re-router à l'aveugle)

| Symbole | Foyer | Divergence |
|---|---|---|
| IS_BATTLER_OF_TYPE | engine/battle/constants.ts:630 | bridge `(battler)` lit gBattleMons ; src `(t1,t2,type)` |
| GetMapName | engine/field/region-map-data.ts:97 | bridge `(dest,id,pad)` écrit buffer FR ; src `(id)→string` |
| GetMonSpritePal*/GetMonFrontSpritePal/GetMonIconPtr | src/pokemon.ts, src/pokemon_icon.ts | stubs bridge à remplacer par la vraie impl |
| OBJ_PLTT_ID2 | src/palette.ts:58 | bridge `n*16` (**bug**) vs src `PLTT_ID(n+16)` (1:1) — **garder src** |
| ISO_RANDOMIZE2 | include/random.ts:24 | bridge `+24691` vs header décomp `+12345` — **vérifier la bonne valeur** |
| StringCopy/Append/… | src/string_util.ts | bridge ≈ `string`, src = `Uint8Array` 1:1 — vérifier call sites |
| BattleSetup_ConfigureTrainerBattle | src/battle_setup.ts:338 | signatures totalement divergentes |
| GetCurrentRegionMapSectionId | src/overworld.ts (à exporter) | stub bridge lit rt.gMapHeader |
| PLTT_ID | src/palette.ts:53 | re-router aussi `src/field_weather.ts` |

---

## 3. Table `movable` — GROUPÉE PAR FICHIER CIBLE (= lots de migration)

`(N)` = importerCount.

### Foyers à CRÉER (n'existent pas encore)

| Fichier cible (à créer) | Symboles | Σ imp. |
|---|---|---|
| **src/task.ts** | ResetTasks(6), RunTasks(5), FindTaskIdByFunc(5), TASK_NONE(4), CreateTask(28), DestroyTask(28), SetTaskFuncWithFollowupFunc(3), SwitchTaskToFollowupFunc(2) | **81** |
| **src/sound.ts** | PlaySE(27), PlayBGM(12), PlayFanfare(8), StopFanfare(3), IsFanfareTaskInactive(3), WaitFanfare(3), FadeOutBGM(3), FadeInBGM(3), PlayCryInternal(3) | **65** |
| **src/gpu_regs.ts** | SetGpuReg(32), GetGpuReg(5) | **37** |
| **src/decompress.ts** | LoadCompressedSpriteSheet(16), LZDecompressVram(5), …UsingHeap×2(4 ch.), DecompressAndCopyTileDataToVram(1) | **30** |
| **src/bg.ts** | LoadBgTiles(4), GetBgTilemapBuffer(1) | **5** |
| **src/item.ts** | GetItemType(3), GetItemName(2), GetItemDescription(2), GetItemImportance(2), GetItemFieldFunc(2), GetItemSecondaryId(2) | **13** |
| **src/data.ts** | GET_MON_COORDS_WIDTH(1), GET_MON_COORDS_HEIGHT(1) | 1 |
| **src/heal_location.ts** (existe — variante par index) | GetHealLocation(2) | 2 |
| **src/mon_markings.ts** | CreateMonMarkingAllCombosSprite(1) | 1 |
| **src/menu_specialized.ts** | GET_NUM_CONDITION_SPARKLES(1), SHIFT_RIGHT_ADJUSTED(0) | 1 |
| **src/international_string_util.ts** | GetStringClearToWidth(1), StringAppendWithPlaceholder(1), GetTrainerClassNameGenderSpecific(0) | 2 |
| **src/match_call.ts** | GetRematchTrainerLocation(1), GetGeneralMatchCallText(0) | 1 |
| **include/battle_main.ts** | TYPE_EFFECT_ATK/DEF_TYPE, MULTIPLIER | 0 |
| **Features U-tier (0 imp, au fil du portage `.c`)** | pokenav*, mystery_gift (CALC_CRC ⚠), pokemon_storage_system, pokemon_jump, roulette, apprentice, union_room_chat/player_avatar, contest/util, daycare, mauville_old_man, record_mixing, party_menu, pokedex_area_screen, secret_base, link | ≈0 |

### Foyers EXISTANTS (ajouter le symbole manquant)

| Fichier cible existant | Symboles à porter | Σ imp. |
|---|---|---|
| **src/sprite.ts** | SpriteCallbackDummy(8), StartSpriteAffineAnim(17), InitSpriteAffineAnim(6), SetSubspriteTables(4), CreateSpriteAtEnd(3), SetOamMatrix(3), CalcCenterToCornerVec(2), SET_SPRITE_TILE_RANGE(1), FREE_SPRITE_TILE(0), TILE_SIZE_4BPP(dup) | **44** |
| **src/palette.ts** | LoadPalette(21), BeginNormalPaletteFade(19), UpdatePaletteFade(8), ResetPaletteFade(6), BlendPalettes(5), BlendPalette(4), BlendPalettesUnfaded(3), FillPalBufferBlack/White(3 ch.), SetBackdropFrom*(0) | **75** |
| **src/event_object_movement.ts** | GetFaceDirectionMovementAction(5), Get{WalkInPlaceFaster,Slide,JumpInPlace}MovementAction, GetBaseTemplateForObjectEvent, GetObjectEventTemplateByLocalIdAndMap, MOVE_SPEED_*(×5), JUMP_DISTANCE/TYPE_*(×6), sObjEventId/sTypeFuncId/sActionFuncId/sDirection + **re-export static-data-tables** (ANIM_STD_GO_*×16, sMoveDirection*AnimNums, gFace/WalkSlow/Normal/Fast MovementActions, sOppositeDirections, gStandardDirections, sJump*, sStepTimes, sDirectionToVectors) | **~15 + tables** |
| **src/battle_util.ts** | GET_MOVE_TYPE(6), SET_BATTLER_TYPE(3), ABILITY_ON_*FIELD*(0) ⚠ trampolines lazy | **9** |
| **src/pokemon.ts** | CALC_STAT(1) ⚠ table nature triple, GetSubstruct(1), GetMonSpritePalStruct(0), SET8/16/32(0), READ/STORE_PTR_IN_TASK(0) | **2** |
| **src/engine/battle/party-storage.ts** | GetBoxMonData(3), GetMonNickname(3) | **6** |
| **src/event_data.ts** | GetFlagPointer(0), GetVarPointer(à exporter) | 0 |
| **src/overworld.ts** | Overworld_GetMapHeaderByGroupAndId(1), defineMapHeaderEntry(1), GetMapLayout(1), GetDestinationWarpMapHeader(0), GetCurrentRegionMapSectionId(0) | 3 |
| **src/engine/field/region-map-data.ts** | GetMapNameGeneric(1), GetMapNameHandleAquaHideout(1) | 2 |
| **src/item_icon.ts / pokemon_icon.ts** | GetItemIconPic(Or Palette)(2), GetMonIconTiles(1), GetValidMonIconPalettePtr(0) | 3 |
| **src/field_effect.ts** | MultiplyInvertedPaletteRGBComponents(2) | 2 |
| **src/easy_chat.ts** | EC_GROUP/INDEX/WORD(1 ch.), GetCurrentPhrase(1), OtherConvertEasyChatWordsToString(0) | 3 |
| **Divers (≤2 imp)** | battle_anim_mons (IS_DOUBLE_BATTLE, LoadPointerFromVars), battle_main (BUFFER_PARTY_VS_SCREEN_STATUS), battle_transition (SET_TILE), field_control_avatar (GetObjectEventScriptPointerPlayerFacing), berry (FIRST_BERRY_INDEX), field_specials, fieldmap (GetMapHeaderFromConnection), script, battle_message, battle_setup, secret_base, include/global, include/gba/defines | 0–2 | 
| **src/main.ts** | SetVBlankCallback(13) — borderline substrate | 13 |

---

## 4. Table `orphan` — à INVESTIGUER avant tout déplacement

| Symbole | Home hypothétique | À investiguer |
|---|---|---|
| GET_BATTLER_SIDE2 | engine/battle/constants.ts | Nom suspect, pas d'équivalent `.h`. Probablement fusionner avec GET_BATTLER_SIDE. |
| GetPlayerName | src/overworld.ts | Aucun `GetPlayerName()` global 1:1 décomp. Câbler sur `gSaveBlock2Ptr.playerName`/StringCopy_PlayerName, ne pas inventer. (1 imp) |
| CALC_CRC | src/mystery_gift.ts | Origine mystery_gift.c:25 mais stub à 0 (feature lien). Confirmer non-usage. |
| READ_XCMD_BYTE | src/script.ts ? | bridge le redéfinit `ScriptReadByte` alors que l'origine `m4a.c:1536` est audio → mauvaise sémantique, re-câbler. (1 imp) |
| BOUNCES / SHAKES / SHAKE_INC / STATE | battle_anim_throw.ts **ou** intro.ts | **Collision d'homonymes** : grep trouve ces `#define` dans battle_anim_throw.c, PAS intro.c. STATE (3 imp) très générique. Désambiguïser par importeur. |
| DIRECTION / FALL / PHASE_DELTA / RISE_FASTER / RESET_STATE | src/intro.ts | Stubs identité, **aucun `#define` confirmé** dans intro.c. Ne pas inventer. |
| CountBoxMonsForBox | src/pokemon_storage_system.ts | **Introuvable** sous ce nom (variante CountMonsInBox). Origine ambiguë. |
| AgbAssert | harness (substrat) | Alias inventé de DebugAssert. Reste no-op. |

> ⚠ **Déduplication JSON** : plusieurs symboles apparaissent 2× (`IS_TYPE_PHYSICAL/SPECIAL`, `IS_BATTLER_OF_TYPE`, `GetMapNameGeneric/HandleAquaHideout`, `ITEM_HAS_EFFECT`, `BYTE_TO_RECEIVE`, `MSC/LMAN_callback`, `BOUNCES/SHAKES/SHAKE_INC`). Pas de travail supplémentaire.

---

## 5. Liste `substrate` — RESTE dans le harness (225)

Intrinsèques **BIOS GBA, macros HW, registres MMIO, glue de transpilation** — aucune origine `.c` portable.

| Famille | Exemples |
|---|---|
| **BIOS/SWI** | CpuSet, CpuFastSet, CpuFill*, ObjAffineSet, BgAffineSet, ArcTan2, Sqrt, LZ77UnComp*, VBlankIntrWait, IntrEnable, RegisterRamReset, SoftReset |
| **DMA macros** | DmaClear/Fill/Copy 16/32 (+Large/Defvars/Stop/Set), Dma3*Large*, CpuCopy16/32 |
| **Registres MMIO** | REG_OFFSET_*, BGCNT_*, DISPCNT_*, BLDCNT_*, BLDALPHA_BLEND, REG_TMCNT_*, REG_SIOMULTI, GPU_REG_BUF, SET_WIN0H_WIN1H, WIN_RANGE2 |
| **Constantes HW** | ST_OAM_*, PALETTES_*, PLTT_SIZE, BG_*, VRAM_SIZE, DISPLAY_W/H, BG_PLTT_ID(17)/OBJ_PLTT_ID(10), *_FADE, PIXEL_FILL, SPRITE_SHAPE/SIZE |
| **Macros headers** | ARRAY_COUNT, SWAP, T1/T2_READ_*, SAFE_DIV, Q_* (fixed-point), MOD, ALIGNED, RGB2, GET_R/G/B, IS_ALPHA, FREE_AND_SET_NULL |
| **libc** | memcpy, memset, strcmp, strlen |
| **Heap (no-op GC)** | Alloc, AllocZeroed, Free |
| **m4a/audio** | m4aSongNumStart, m4aMPlayAllStop, pause/resume/isBgmPaused, TrackStop |
| **Flash/RTC/Link/RFU** | FLASH_WRITE, ProgramFlash*, EraseFlashSector, INFO/DATETIME/TIME_BUF, GetHostRfuGameData, RfuGetStatus, MSC/LMAN_callback, BYTE_TO_SEND/RECEIVE, IS_BATTLE_CONTROLLER_* |
| **Glue runtime web** | setGlobalRuntime, getRuntime, getAsset, CMD_ARGS, notImplemented, NULL, PaletteBuffer |
| **Diagnostic** | AGB_ASSERT, DebugAssert, AgbAssert |
| **Méta-bridge / outillage** | `__bridgedHelpers__`, `__notImplementedHelpers__`, getStaticTable — **NE PAS déplacer** (lus par `harness/devtools/dev-bridge-audit-tools.ts` + `scripts/check-bridge-coverage.mjs`) |

> Frontière à garder en tête : `SetVBlankCallback` (main.c, 13 imp.), `GET_BATTLER_POSITION`, `BYTE_TO_SEND/RECEIVE` — classés substrate mais ont un foyer `.c`.

---

## 6. ORDRE DE MIGRATION (cycle-aware, lot-par-lot)

**Feuilles d'abord** (cycleRisk low, foyer non-central, peu/pas d'importeurs), **noeuds centraux en dernier**. Chaque lot : porter/supprimer → re-router importeurs → `tsc=0` → A/B → commit local. **Jamais de push.**

### Phase A — Feuilles `include/` + constantes (0 cycle)
- **Lot 1** `include/gba/defines.ts` : TRUE, FALSE, PLTT_OFFSET_4BPP.
- **Lot 2** `include/global.ts` : HIHALF, LOHALF, S16TOPOSFLOAT, DIV_ROUND_UP, JOY_HELD_RAW.
- **Lot 3** `include/random.ts` : ISO_RANDOMIZE1, ISO_RANDOMIZE2 (⚠ valeur), Random32.
- **Lot 4** `include/pokemon.ts` : GET_SHINY_VALUE, GET_UNOWN_LETTER.
- **Lot 5** `include/string_util.ts` : STR_CONV_MODE_*.
- **Lot 6** `include/constants/map_groups.ts` : MAP_GROUP, MAP_NUM (+ MAP_UNDEFINED).
- **Lot 7** `include/constants/battle_anim.ts` : ANIM_SPRITES_START, GET_TRUE_SPRITE_INDEX (+ retirer doublon decomp-helpers).
- **Lot 8** `include/battle_main.ts` (créer) : TYPE_EFFECT_*.

### Phase B — Consolidation intra-harness (pas de cycle)
- **Lot 9** decomp-helpers : BG_TILE_H/V_FLIP, WIN_RANGE, PLTT_SIZEOF, PLTT_SIZE_4BPP/8BPP, TILE_OFFSET_4BPP.
- **Lot 10** decomp-globals : INTRO3_RAW_PTR, DmaClearLarge16 (⚠ signatures).

### Phase C — Modules `src/` périphériques NON-CENTRAUX (low)
- **Lot 11** `src/random.ts` (Random, SeedRng) + `src/main.ts` (SeedRngAndSetTrainerId).
- **Lot 12** `src/trig.ts` (Sin, Cos, gSineTable) — **34 imp, fort gain, foyer pur sans cycle**.
- **Lot 13** `src/string_util.ts` (famille ⚠ Uint8Array).
- **Lot 14** `src/easy_chat.ts` + easy-chat-render.
- **Lot 15** `src/berry.ts`.
- **Lot 16** dynamic_placeholder_text_util, international_string_util, data.ts.
- **Lot 17** text_window, field_door, heal_location, item_icon, pokemon_icon.
- **Lot 18** region-map-data (GetMapName ⚠, Generic, HandleAquaHideout, GetMapSecIdAt).
- **Lot 19** features U-tier (0 imp) au fil du portage `.c`.

### Phase D — Engine battle (contenu, semi-central)
- **Lot 20** engine/battle/constants.ts (BATTLE_*/STATUS*/GET_STAT_BUFF*/HITMARKER* ⚠ IS_BATTLER_OF_TYPE, masques STATUS*_TURN).
- **Lot 21** engine/battle/text-buffers.ts (PREPARE_*_BUFFER).
- **Lot 22** battle_util.ts (GET_MOVE_TYPE, SET_BATTLER_TYPE, ABILITY_ON_*FIELD* ⚠ trampolines lazy à CONSERVER).
- **Lot 23** battle_setup/message/main/anim_mons/transition, field_effect.

### Phase E — Foyers à créer (taille moyenne)
- **Lot 24** `src/decompress.ts` (30 imp).
- **Lot 25** `src/bg.ts` (5 imp).
- **Lot 26** `src/item.ts` (13 imp).
- **Lot 27** `src/sound.ts` (65 imp). ⚠ règle AUDIO : appeler PlaySE/PlayBGM OK, ne pas toucher le moteur m4a.

### Phase F — Scripts / event data / overworld / fieldmap
- **Lot 28** engine/script/script-vars.ts (Flag/Var/Compare).
- **Lot 29** script.ts (Lock/Init/Setup/ScriptJump + ScriptReadByte…).
- **Lot 30** event_data.ts (GetFlagPointer, GetVarPointer).
- **Lot 31** field_specials, field_control_avatar.
- **Lot 32** overworld.ts + fieldmap.ts (MapHeader/Layout/Warp, UNPACK_*, MapGrid*, AreCoordsWithinMapGridBounds).
- **Lot 33** gba-text-system.ts (bloc texte ×12).

### Phase G — NOEUDS CENTRAUX (high — EN DERNIER)
- **Lot 34** `src/gpu_regs.ts` (créer) : SetGpuReg, GetGpuReg (37 imp).
- **Lot 35** `src/task.ts` (créer) : Create/Destroy/Reset/Run/Find Task… (81 imp).
- **Lot 36** `src/palette.ts` : LoadPalette, *PaletteFade, Blend*, FillPalBuffer*, SetBackdrop* (75 imp). ⚠ **palette.ts re-délègue déjà à decomp-globals → cycle EXISTANT ; déplacer le CORPS de l'impl, pas juste re-router**.
- **Lot 37** `src/engine/field/direction-coords.ts` : DIR_*, Get*AnimNum, GetOppositeDirection (17+ imp).
- **Lot 38** `src/event_object_movement.ts` : Get*MovementAction (dup+movable), MOVE_SPEED/JUMP_*, sObjEventId/… + **migration des tables `static-data-tables.ts`**. Foyer le plus couplé.
- **Lot 39** `src/engine/battle/party-storage.ts` : GetMonData, SetMonData, GetBoxMonData, GetMonNickname (≥86 imp).
- **Lot 40** `src/pokemon.ts` : CALC_STAT (⚠ table nature triple), GetSubstruct, GetMonSpritePal*, SET8/16/32, READ/STORE_PTR_IN_TASK.
- **Lot 41** `src/sprite.ts` : tous les duplicate + movable sprite. ⚠ **le bridge importe DÉJÀ src/sprite.ts (l.45) → séquencer pour éviter cycle src/sprite ↔ bridge**.

### Phase H — Finition
- **Lot 42** `src/main.ts` : SetVBlankCallback (si sorti du substrat).
- **Lot 43** Résoudre les **orphans** (§4) un par un après désambiguïsation.
- **Lot 44** Retirer re-exports résiduels (metatile_behavior, `export *`) ; vérifier que le bridge ne contient plus que substrat + méta-outillage.

---

## 7. Risques

### Cycles ESM identifiés
1. **`src/sprite.ts` ↔ `decomp-bridge.ts`** : le bridge **importe déjà** src/sprite.ts (alias `_CreateSprite_game`, `_DestroySprite`, `_FreeOamMatrix`, `_AllocOamMatrix`, `_ResetSpriteData`, l.45). → **Lot 41 en dernier**, vérifier le graphe d'import de sprite.ts avant.
2. **`src/palette.ts` re-délègue à `decomp-globals`** (impl réelle de LoadPalette/Blend* dans decomp-globals.ts) = **cycle déjà présent** ; rapatrier l'impl DANS palette.ts est ce qui le casse. **Déplacer le corps, pas juste re-router.**
3. **`metatile_behaviors` `export *`** réintroduit le cycle que l'extraction de `include/constants/metatile_behaviors.ts` visait à casser. Router les importeurs **directement**, supprimer le `export *`.
4. **`script-vars.ts` / `event_data.ts`** : touchent globals/save en eager-init → vérifier l'ordre d'init.
5. **`battle_util.ts`** : trampolines lazy `globalThis` (ABILITY_ON_*FIELD*) pour casser bridge↔battle. **Les CONSERVER.**

### Dual-sources DANGEREUX (le bridge DOUBLE une impl VIVANTE — vérifier la valeur canonique)
- **`Get*MovementAction`** : 8 définis dans event_object_movement.ts:6124-6301 ; le bridge réimplémente des switches **divergents** (GetJumpMovementAction bridge → 0x4C..0x4F, collision possible WalkFaster). Aligné avec [[gotcha-movement-action-getter-dual-source]].
- **`FreeAllSpritePalettes`/`IndexOfSpritePaletteTag`/`LoadSpritePalettes`** : impl vivante src/sprite.ts, bridge double via decomp-globals.
- **Signatures divergentes** : IS_BATTLER_OF_TYPE, GetMapName, OBJ_PLTT_ID2 (`n*16` bug), ISO_RANDOMIZE2 (`+24691` vs `+12345`), BattleSetup_ConfigureTrainerBattle, GetMapSecIdAt (number vs string), STATUS*_TURN (masques `&0xF` parasites), string_util (string vs Uint8Array), GetSubstruct/GetBoxMonNickname (origine **daycare.c**, pas PSS).
- **Tables dupliquées** : CALC_STAT (table nature 3×), TILE_SIZE_4BPP (sprite.ts + tileset_anims.ts), ANIM_SPRITES_START (battle_anim.ts + decomp-helpers + bridge), STAT_BUFF_NEGATIVE (constants.ts + include/battle.ts). **Choisir un foyer unique, dédupliquer toutes les copies.**

### Méta-risque outillage
`__bridgedHelpers__`, `__notImplementedHelpers__`, `getStaticTable` lus par `harness/devtools/dev-bridge-audit-tools.ts` + `scripts/check-bridge-coverage.mjs` (parsing textuel). **Ne pas les déplacer** ; ils rétréciront naturellement.

---

## Annexe — Fichiers critiques pour l'implémentation
`harness/runtime/decomp-bridge.ts` · `src/sprite.ts` · `src/event_object_movement.ts` · `src/palette.ts` · `harness/runtime/static-data-tables.ts`

> Suite : analyses séparées de `decomp-globals.ts` (104 imp) et `decomp-runtime.ts` (78 imp) à mener plus tard, même méthode.
