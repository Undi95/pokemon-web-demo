# Audit READ-ONLY 1:1 — domaine « overworld-map »

> Généré par la flotte d'audit (agent Opus read-only). Source de vérité = décomp
> `D:/Projet 1/decomps/pokeemeraude/src/*.c`. Portage = `D:/Projet 1/pokemon-web-demo/src/*.ts`.
> Doctrine : miroir STRICT (mêmes noms fichiers/fns/globals, corps transcrit ligne à ligne).
> Statuts : ✅ MIROIR | 🟡 PARTIEL | 🔴 DIVERGENT | ⬜ ABSENT | 🚫 EXEMPT.

Périmètre : overworld.c, fieldmap.c, field_camera.c, field_tasks.c, field_screen_effect.c,
field_control_avatar.c, field_door.c, field_weather.c, field_weather_effect.c, map_name_popup.c,
heal_location.c, tileset_anims.c, cable_club.c, region_map.c + `src/engine/field/**` (map-loader/warp).

---

## field_camera.c → src/field_camera.ts
Statut : ✅ MIROIR
Fonctions : 28/28 (toutes présentes, même noms)
Manquantes : aucune.
Divergences : aucune divergence logique. Le bug 1:1 `deltaX` au lieu de `deltaY` (field_camera.c:401-405)
est FIDÈLEMENT reproduit (field_camera.ts:955-957, commenté « 1:1 décomp BUG (preserved 1:1) »). Bien.
Adaptations assumées (documentées, hors 1:1 strict mais légitimes) :
- `CameraMove` hébergé ici (dette d'extraction de fieldmap.c:649) — signalé dans l'en-tête du fichier.
- `_camPos` = proxy dynamique vers `gSaveBlock1Ptr.pos` (au lieu d'accès direct) — adaptation ESM anti-cycle.
- couche flush VRAM (`flushOverworldTilemaps`/`clearOverworldTilemaps`), `_pendingConnection`, hooks scene,
  trace devtools (`_trace`/`__moveTrace`/`__getFieldCameraDebug`) — glue harness explicitement marquée.
- `_clearMirageTowerPulseBlendEffect` = port 1:1 avec early-return (sMirageTowerPulseBlend jamais init, Mirage Tower non porté) — conforme.
Stubs suspects : aucun. `SetBerryTreesSeen()` (berry.c:1322) N'EST PAS appelé dans CameraUpdate — commenté
comme dette (field_camera.ts:989-993). C'est un écart de comportement mineur (berry trees pas « vus » au scroll),
documenté et attribué au domaine berry, pas overworld. Divergence à noter mais faible levier.
Fuites harness : trace devtools présente mais bien délimitée. Rien d'improvisé dans la logique.

## field_tasks.c → src/field_tasks.ts
Statut : ✅ MIROIR
Fonctions : 28/28. Table `sPerStepCallbacks` 8/8 = vraies fonctions décomp (STEP_CB_TRUCK→EndTruckSequence
de field_special_scene.ts, STEP_CB_SECRET_BASE→SecretBasePerStepCallback de secret_base.ts — consolidations
N:1 correctes). Les 3 tasks (Task_RunPerStepCallback, Task_MuddySlope, Task_RunTimeBasedEvents) portées.
Manquantes : aucune.
Divergences : aucune. Le fallthrough case 1→case 2 de FortreeBridgePerStepCallback (décomp:558-564) est
correctement extrait en `_fortreeBridgeBounce` et appelé explicitement (TS interdit fallthrough non-vide) —
équivalent sémantique fidèle. Le quirk non-BUGFIX `if (isFortreeBridgePrev)` (ROM) est répliqué (pas le
`#ifdef BUGFIX`). Range-check non-signé `(u16)(x-L) < W` émulé via `& 0xFFFF`. Bien.
Stubs suspects : aucun. Omissions AUDIO seulement (PlaySE SE_PUDDLE/SE_BRIDGE_WALK/SE_ICE_*, UpdateAmbientCry) —
exemptées par contrat. `elevation`/`onBridgeElevation` de FortreeBridge omis car ne servaient qu'au gate audio.
Fuites harness : `_drawMapMetatileAt` adaptateur (CurrentMapDrawMetatileAt 4-args au lieu de globals sFieldCameraOffset) — adaptation propre.

## field_door.c → src/field_door.ts
Statut : 🟡 PARTIEL (fonctionnellement complet pour le single-player, quelques écarts d'API)
Fonctions : ~19/23 portées. Table `sDoorAnimGraphicsTable` 1:1 (57 entrées, ordre préservé, valeurs palette/metatile exactes).
Manquantes / divergentes :
- `ShouldUseMultiCorridorDoor` (field_door.c:561) : NON portée. [code-mort single-player — Battle Tower multi link].
  Conséquence : `DrawDoor` ne réplique PAS le branchement `if (ShouldUseMultiCorridorDoor()) DrawClosedDoorTiles(gfx, gSpecialVar_0x8004+..., 0x8005+...)`.
  Légitime (flux multi hors périmètre), mais l'appel manque dans DrawDoor → écart structurel mineur.
- `GetLastDoorFrame` (field_door.c:419) : logique inlinée dans FieldSetDoorOpened (`frames[3]` hardcodé au lieu de scan `while time!=0`). Équivalent mais pas 1:1 (nom manquant).
- `Debug_FieldAnimateDoorOpen` (field_door.c:508, UNUSED) : absente. [code-mort/debug].
Divergences :
- Le check `MetatileBehavior_IsDoor` de la décomp est remplacé par une comparaison directe `behavior !== MB_ANIMATED_DOOR`
  (constante locale de tilemap-loader) — écart de nom, sémantiquement proche mais utilise un chemin non-mirror.
- `StartDoorAnimationTask` OMET le garde `if (FuncIsActiveTask(Task_AnimateDoor)) return -1` (documenté : autorise anims simultanées).
  C'est une divergence de comportement 1:1 assumée mais réelle.
- Fonctions rendues `async`/Promise (loader PNG) au lieu de sync — adaptation IO assumée.
Stubs suspects : aucun. Audio (SE) mappé 1:1 dans GetDoorSoundEffect.
Fuites harness : side-map `_doorTaskState` remplace les pointeurs data[0..3] (JS ne stocke pas de pointeurs en s16) — adaptation propre documentée.

## map_name_popup.c → src/map_name_popup.ts
Statut : 🟡 PARTIEL
Fonctions : 6/7. Task state machine (Task_MapNamePopUpWindow), ShowMapNamePopup, ShowMapNamePopUpWindow,
LoadMapNamePopUpWindowBg, DrawMapNamePopUpFrame, HideMapNamePopUpWindow présentes.
Manquantes : `StartMenu_ShowMapNamePopup` (map_name_popup.c:204, UNUSED) [code-mort].
Divergences (structurelles réelles) :
- `sMapSectionToThemeId[]` : la décomp est un ARRAY numérique indexé par MAPSEC avec soustraction `KANTO_MAPSEC_COUNT`
  (gestion Kanto mapsec). Notre port = `MAPSEC_TO_THEME` Record<string> INCOMPLET : il MANQUE plusieurs mapsecs
  (ex. MAPSEC_UNDERWATER_SEAFLOOR_CAVERN, MAPSEC_FIERY_PATH2, MAPSEC_JAGGED_PASS/2, MAPSEC_MAGMA_HIDEOUT,
  MAPSEC_MIRAGE_TOWER, MAPSEC_TERRA_CAVE, MAPSEC_TRAINER_HILL, les UNDERWATER_1xx post-Kanto, etc.).
  → thèmes de popup FAUX (fallback 'wood') sur ces zones. DIVERGENCE DE DONNÉES.
- `ShowMapNamePopUpWindow` : OMET tout le bloc Battle Pyramid (`CurrentBattlePyramidLocation` + sBattlePyramid_MapHeaderStrings)
  → nom d'étage pyramide non affiché. [Frontier hors périmètre, mais l'omission est réelle].
- Texte : décomp utilise `FONT_NARROW` + `GetStringCenterAlignXOffset(FONT_NARROW, ..., 80)` +
  `AddTextPrinterParameterized` avec highlight EXT_CTRL_CODE. Notre port utilise `FONT_NORMAL` (1) +
  centrage approximé `mapName.length * 6` + AddTextPrinterParameterized3. → position/police du nom non 1:1.
- `HideMapNamePopUpWindow` : n'appelle pas `SetGpuReg_ForcedBlank` (utilise SetGpuReg normal). Mineur.
Stubs suspects : aucun (fonctionnel). Le popup s'affiche et slide 1:1.
Fuites harness : chargement async des thèmes + map-names via fetch JSON (adaptation IO assumée) ; `_sLastMapSectionId`
gate (skip si même mapsec) = comportement décomp implicite (ShowMapNamePopup appelé conditionnellement par overworld).

## heal_location.c → src/heal_location.ts
Statut : 🟡 PARTIEL (adaptation name-based assumée)
Fonctions : 1/3 strict (GetHealLocation). `GetHealLocationByName` = variante name-based ajoutée (adaptation).
Manquantes : `GetHealLocationIndexByMap` (heal_location.c:7) [code-mort — 0 caller connu, confirmé par le contexte projet],
`GetHealLocationByMap` (heal_location.c:19) [code-mort]. Ne PAS exiger leur port.
Divergences : `GetHealLocation` prend l'index 1-based comme le décomp (id-1) — conforme. Table `sHealLocations`
name-based (map string au lieu de mapGroup/mapNum) = adaptation IO assumée. Les 22 entrées correspondent aux
valeurs décomp (vérifié coords). Bien.
Stubs suspects : aucun.

## field_control_avatar.c → src/field_control_avatar.ts
Statut : 🟡 PARTIEL (cœur input/interaction porté, dispatch warp RE-ROUTÉ, plusieurs branches omises)
Fonctions : ~26/41. Présentes 1:1 : FieldClearPlayerInput, FieldGetPlayerInput, ProcessPlayerFieldInput,
GetPlayerPosition, GetInFrontOfPlayerPosition, GetPlayerCurMetatileBehavior, GetInteractionScript,
GetInteractedObjectEventScript, GetInteractedBackgroundEventScript, GetInteractedMetatileScript,
GetInteractedWaterScript, TryStartInteractionScript, GetWarpEventAtPosition/AtMapPosition, SetupWarp,
TryArrowWarp/TryStartWarpEventScript/TryDoorWarp (portées mais NON câblées — cf. divergence), GetBackgroundEventAtPosition,
TrySetDiveWarp, TryDoDiveWarp, TrySetupDiveDownScript, TrySetupDiveEmergeScript, UpdateFriendshipStepCounter,
UpdatePoisonStepCounter, TryStartStepCountScript, TryStartCoordEventScript (via TryRunCoordEventScript inline).
Manquantes (vivantes, single-player) :
- `GetInteractedLinkPlayerScript` (field_control_avatar.c:261) [link — N-A].
- `SetCableClubWarp` (field_control_avatar.c:995) [cable_club — N-A].
- `GetObjectEventScriptPointerPlayerFacing` (field_control_avatar.c:985) [VIVANT — utilisé par field specials/scripts]. À vérifier ailleurs.
- `GetCoordEventScriptAtMapPosition` / `GetCoordEventScriptAtPosition` / `TryRunCoordEventScript` (field_control_avatar.c:877-921) :
  logique déléguée à script.ts (TryRunCoordEventScript importé de './script') — consolidation, à confirmer 1:1.
- `TryStartMiscWalkingScripts` (field_control_avatar.c:508) [VIVANT — cracked-floor-hole/pyramid/secret-base mats] : NON portée.
- `ClearFriendshipStepCounter`/`ClearPoisonStepCounter`/`RestartWildEncounterImmunitySteps` : Clear* absentes (Clear friendship=UNUSED ; RestartWildEncounterImmunitySteps VIVANT, remplacée par ResetWildEncounterImmunitySteps nom≠).
- `CheckStandardWildEncounter` (field_control_avatar.c:668) : logique déléguée à wild_encounter.ts (import) — l'immunité `sWildEncounterImmunitySteps` VIT ici en double (getters) mais la vraie CheckStandardWildEncounter ailleurs.
Divergences MAJEURES :
- **`ProcessPlayerFieldInput` RE-ROUTE le dispatch warp** : au lieu d'appeler TryArrowWarp/TryStartWarpEventScript/TryDoorWarp
  (portées dans CE fichier), il utilise `findWarpEventAt`/`getWarpKindFor`/`setPendingWarp` (warp-system, `src/engine/field/`).
  Les fns 1:1 de ce fichier sont donc du CODE MORT dans le port. Documenté mais = double implémentation → risque de dérive.
- `ProcessPlayerFieldInput` OMET : `CheckForTrainersWantingBattle` (au tout début), `TryRunOnFrameMapScript`, et la
  branche START (`ShowStartMenu` — déportée dans TickStartMenu de la scène). SELECT (UseRegisteredKeyItemOnField) via globalThis.
- `TryStartStepBasedScript` : inlined dans ProcessPlayerFieldInput au lieu d'être une fonction. `TryStartMiscWalkingScripts` OMIS de la chaîne.
- `TryStartStepCountScript` fortement tronquée : omet InUnionRoom, UpdateFarawayIslandStepCounter, ShouldEggHatch,
  AbnormalWeatherHasExpired, ShouldDoBrailleRegicePuzzle, tous les Match Calls (Wally/Scott/Roxanne/Rayquaza), SafariZoneTakeStep,
  CountSSTidalStep, TryStartMatchCall. [sous-systèmes non portés — mais AbnormalWeatherHasExpired est cité comme bug en attente ailleurs].
- `GetInteractedObjectEventScript` : omet Trainer Hill (InTrainerHill) + GetRamScript filter (documenté).
- `GetInteractedBackgroundEventScript` : hidden-item ne fait PAS le check FlagGet(FLAG_HIDDEN_ITEMS_START + id) → objet déjà ramassé
  serait re-proposé ; secret_base retourne null (non porté). Divergence de comportement réelle sur objets cachés.
- `GetInteractedMetatileScript` : OMET tout le bloc secret-base/decoration (élévation) de la fin (field_control_avatar.c:412-444).
- Audio PlaySE omis (SE_SELECT, SE_WIN_OPEN) — exempté.
Stubs suspects : `SetupWarp` renvoie juste le WarpEvent sans faire SetWarpDestinationToMapWarp/UpdateEscapeWarp/SetDynamicWarp
(logique reportée sur warp-system). Fonctionnel mais pas 1:1.
Fuites harness : dispatch via globalThis.__UseRegisteredKeyItemOnField, warp-system, party-storage import dynamique.

## fieldmap.c → src/fieldmap.ts
Statut : ✅ MIROIR (adaptation IO name-based assumée)
Fonctions : ~54/55. Toutes les fns cœur présentes 1:1 : InitMap, InitMapLayoutData, InitBackupMapLayoutData,
InitBackupMapLayoutConnections, FillConnection + Fill{South,North,West,East}Connection, MapGridGet*/Set*,
GetMetatileAttributesById, SaveMapView, LoadSavedMapView, MoveMapViewToBackup, GetMapBorderIdAt,
GetPostCameraMoveMapBorderId, CanCameraMoveInDirection, GetIncomingConnection, SetPositionFromConnection,
IsPosInIncomingConnectingMap/IsCoordInIncomingConnectingMap, GetMapConnectionAtPos, tileset copy/palette fns,
InitBattlePyramidMap, InitTrainerHillMap, InitMapFromSavedGame.
Vérifié 1:1 en détail : InitBackupMapLayoutData (offset width*7+MAP_OFFSET), FillConnection stride, les 4 Fill*Connection
(clamp x/x2/width), GetMapBorderIdAt (bornes width-(MAP_OFFSET+1)/height-MAP_OFFSET + flags), UNPACK_* masks
(métatile 0x3FF / collision 0xC00 / elevation 0xF000). Constantes NUM_* / MAP_OFFSET(7)/W(15)/H(14) exactes.
Divergences / adaptations assumées (les 4 adaptations fieldmap documentées, NON re-litigées) :
- `CameraMove` déplacée dans field_camera.ts (dette d'extraction déclarée). Ici : `TransitionToConnection` remplace
  `LoadMapFromCameraTransition` (chargement map async name-based).
- `GetMapHeaderFromConnection` : lookup par `connection.destMap` (string) dans `mapHeaderCache` au lieu de
  Overworld_GetMapHeaderByGroupAndId(mapGroup, mapNum) — adaptation modèle name-based, résultat identique.
- `sBackupMapData` = Uint16Array (10240) vs EWRAM ; ApplyGlobalTint* = no-op (dummy FRLG, 1:1 — c'était déjà vide côté décomp).
- InitBackupMapLayoutConnections skip async si header connexion pas en cache (prefetch) — adaptation IO.
Manquante : `SavedMapViewIsEmpty`/`SkipCopyingMetatileFromSavedMap` — présentes (LoadSavedMapView les appelle). La "1 manquante"
du cartograph = probablement `SetCameraCoords` (UNUSED) ou le macro GetBorderBlockAt (inline). Rien de vivant manquant.
Stubs suspects : aucun. `LoadTilesetPalette` gère bien primary(black+shifted)/secondary. Bien.

## field_screen_effect.c → src/field_screen_effect.ts
Statut : 🔴 DIVERGENT (fichier miroir quasi VIDE — logique dispersée hors-mirror)
Fonctions : 0/77 dans le fichier homonyme. `field_screen_effect.ts` ne contient QUE `sFlashLevelToRadius`.
Le reste (77 fns) est soit ABSENT, soit dispersé sous d'autres noms/fichiers :
- Task_ExitDoor / Task_ExitNonAnimDoor / Task_ExitNonDoor / Task_WarpAndLoadMap / Task_DoDoorWarp / SetUpWarpExitTask /
  FieldCB_DefaultWarpExit / DoWarp / DoDoorWarp / DoDiveWarp → réimplémentés dans `src/engine/field/warp-system.ts`
  (noms conservés en commentaire, mais PAS des exports 1:1 ; logique kebab-adaptée). [VIVANT, ailleurs].
- `WarpFadeInScreen` / `WarpFadeOutScreen` / `FadeInFromBlack` / `FadeInFromWhite` / `GetMapPairFadeFromType` /
  `GetMapPairFadeToType` → **INTROUVABLES dans tout le repo (0 hit)**. La table map-pair fade (black vs white
  selon paire de map-types) N'EST PAS portée. [ABSENT, vivant].
- `AnimateFlash` / `WriteFlashScanlineEffectBuffer` / `WriteBattlePyramidViewScanlineEffectBuffer` /
  `StartUpdateFlashLevelEffect` / `SetFlashScanlineEffectWindowBoundaries` (algo cercle de flash) → ABSENTS.
  Le flash de grotte est fait par un compositeur harness (`harness/gba/flash-mask.ts`) qui lit juste `sFlashLevelToRadius`.
  [ABSENT — divergence rendu assumée mais non 1:1].
- `DoOrbEffect` / `FadeOutOrbEffect` / `Task_OrbEffect` (effet Orbe Rouge/Bleu Groudon/Kyogre) → ABSENTS. [vivant si scénario Rayquaza].
- `DoSpinExitWarp` / `DoSpinEnterWarp` / `DoTeleportTileWarp` / `DoMossdeepGymWarp` / `DoEscalatorWarp` /
  `DoLavaridgeGym*Warp` → référencés par field_control_avatar (`specialDispatch`) mais pas portés ici.
- `Script_FadeOutMapMusic` / `FieldCB_ContinueScript*` / `ReturnToFieldOpenStartMenu` → à vérifier ailleurs.
BUG FADESCREEN (contexte projet) : la DIVERGENCE candidate la plus probable est ICI. La logique de fade de warp
(`WarpFadeOutScreen`/`WarpFadeInScreen` + `WaitForWeatherFadeIn` + `GetMapPairFadeFromType`) n'est PAS un mirror :
`FadeScreen` vit dans field_weather.ts, et la synchro fade-out→load→fade-in est gérée par la scène/warp-system.
L'absence de `WaitForWeatherFadeIn` 1:1 (qui gate sur `IsWeatherNotFadingIn`) au bon endroit peut expliquer un
fade intermittent (course entre fin de fade météo et enchaînement de la task d'exit). À investiguer en priorité :
warp-system.ts (synchro exit task) + field_weather.ts (WaitForWeatherFadeIn / IsWeatherNotFadingIn / gPaletteFade.active).
Stubs suspects : `field_screen_effect.ts` lui-même s'auto-déclare « AMORCE / TODO restructure » — honnête, pas un stub caché.
Fuites harness : flash rendu via compositeur harness (assumé), mais c'est un écart 1:1 réel sur l'effet de grotte.

## field_weather.c → src/field_weather.ts
Statut : ✅ MIROIR
Fonctions : 48/49. Vérifié 1:1 : `FadeScreen` (mode→fadeColor/fadeOut, useWeatherPal switch sur currWeather,
BeginNormalPaletteFade, palProcessingState), `IsWeatherNotFadingIn`, `ApplyWeatherColorMapIfIdle(_Gradual)`,
`UpdateSpritePaletteWithWeather`, `IsWeatherChangeComplete`, `SetWeatherScreenFadeOut`, la state machine
Task_WeatherInit/Main + table sWeatherFuncs + gWeatherPalStateFuncs. Constantes RGB/WEATHER_PAL_STATE exactes.
Manquante : 1 (probablement une fn sprite-fog interne comme `LightenSpritePaletteInFog` ou un DoNothing dummy).
Divergences : aucune divergence logique notable. Le FadeScreen (utilisé au warp) est 1:1 correct — donc le bug
fadescreen n'est PAS dans FadeScreen lui-même mais dans l'ORCHESTRATION (field_screen_effect.c non porté, cf. section ci-dessus).
Stubs suspects : aucun. Rendu météo (drought color LUT, fog blend) porté.
Note pour le bug fadescreen : `IsWeatherNotFadingIn` est bien 1:1, mais si le warp-system n'attend pas
`WaitForWeatherFadeIn` (= IsWeatherNotFadingIn) avant de rendre le contrôle, on obtient un fade intermittent. Croiser avec field_screen_effect.

## tileset_anims.c → src/tileset_anims.ts
Statut : ✅ MIROIR (assets async assumés)
Fonctions : 50/84. Infra 1:1 : InitTilesetAnimations, _InitPrimary/SecondaryTilesetAnimation, UpdateTilesetAnimations
(counters + wrap + dispatch callbacks), TransferTilesetAnimsBuffer, appendTilesetAnimToBuffer + tous les
TilesetAnim_* (General/Building/Rustboro/Dewford/Slateport/Mauville/Lavaridge/EverGrande/Pacifidlog/Sootopolis/BF/
Underwater/SootopolisGym/Cave/EliteFour/MauvilleGym/BikeShop/BattlePyramid/BattleDome) + QueueAnimTiles_* (217 refs).
Manquantes (~34) : essentiellement les TABLES de frames data (`gTilesetAnims_*_Frame*`) qui sont des données GFX
chargées en PNG async côté port (INCGFX → loadTileBin) — adaptation asset assumée, pas une divergence de logique.
Divergences / adaptations : DMA3 buffer = buffer JS différé flushé à `TransferTilesetAnimsBuffer` (simule DMA VBlank) ;
GFX en async (loadTileBin) ; `pauseTilesetAnimations`/`resumeTilesetAnimations` = ajouts harness (scenes réutilisant VRAM) —
propres, bien délimités. `getTilesetAnimDebugState` = devtools.
Stubs suspects : aucun. Compteurs primary/secondary + wrap 1:1.
Fuites harness : debug state sur globalThis (délimité). Rien d'improvisé dans la logique d'anim.

## region_map.c → src/region_map.ts (+ src/engine/field/region-map.ts)
Statut : 🔴 DIVERGENT (mirror homonyme = coquille ; l'écran réel réimplémenté hors-mirror)
Fonctions : 3/60 dans le fichier homonyme. `src/region_map.ts` (61 lignes) ne contient QUE `GetMapName`,
`GetMapNameGeneric`, `GetMapNameHandleAquaHideout` (helpers de lookup nom FR).
Manquantes (vivantes) : tout le moteur d'écran carte/Vol — `InitRegionMap`, `ProcessRegionMapInput_Full`,
`MoveRegionMapCursor_Full`, `GetRegionMapCursorPos`, `CreateRegionMapCursor`, `SpriteCB_CursorMapFull`,
`CB2_FlyMap`, `GetRegionMapSectionIdAt`, etc. → réimplémentés dans `src/engine/field/region-map.ts` (997 l)
sous des noms CUSTOM (`OpenRegionMap`/`TickRegionMap`/`CloseRegionMap`, GameObjects Phaser), PAS des exports 1:1.
Divergences : l'écran Vol/Carte est une réimplémentation Phaser (état singleton globalThis, throttle curseur 4 frames)
qui vise le rendu 1:1 mais N'EST PAS un mirror structurel (noms fns/globals ≠ décomp). `GetMapName` port simplifié
name-based (lookup FR direct au lieu de gRegionMapEntries[id].name) — adaptation modèle.
Stubs suspects : `region_map.ts` est une coquille honnête (décyclée du bridge). Aucun stub caché.
Fuites harness : logique écran dans engine/field (Phaser) — écart de doctrine mirror, mais fonctionnellement présent.

## cable_club.c → ABSENT
Statut : 🚫 EXEMPT (flux link/multi non implémentés — assumé)
Fonctions : 0/62. Tout le fichier = link/multijoueur : Task_Linkup* (14 tasks), TryBattleLinkup, TryTradeLinkup,
TryRecordMixLinkup, TryBerryBlenderLinkup, TryContest*ModeLinkup, CreateTask_ReestablishCableClubLink,
CableClubSaveGame, CleanupLinkRoomState, ExitLinkRoom, CreateTask_EnterCableClubSeat, PlayerEnteredTradeSeat,
ColosseumPlayerSpotTriggered, Script_ShowLinkTrainerCard, TrySetBattleTowerLinkType.
Dépendances single-player : AUCUNE. `SetCableClubWarp` (utilisé single-player ?) vit en fait dans field_control_avatar.c
(non porté, cf. section). `CreateTask_ReestablishCableClubLink` n'est appelé que par le flux link FieldCB_ReturnToFieldCableLink.
`ValidateMixingGameLanguage` = record mixing (link). Rien à porter pour le solo. Exemption correcte.

---

## TOP 5 — plus gros écarts du domaine (levier × effort)

### 1. field_screen_effect.c NON porté → orchestration warp/fade dispersée (M, potentiellement racine du bug fadescreen)
Le fichier miroir `field_screen_effect.ts` est vide (juste sFlashLevelToRadius). Les 77 fns (Task_ExitDoor,
Task_WarpAndLoadMap, WarpFadeInScreen/OutScreen, GetMapPairFadeFromType, WaitForWeatherFadeIn, DoOrbEffect, AnimateFlash…)
sont soit absentes soit réimplémentées kebab dans warp-system.ts / TestOverworldScene. `GetMapPairFadeFromType/ToType`
(table black-vs-white fade par paire de map-types) + `WaitForWeatherFadeIn` sont INTROUVABLES (0 hit repo).
Effort : M (consolider warp-system.ts → field_screen_effect.ts aux noms 1:1 + porter la table map-pair + la synchro WaitForWeatherFadeIn).
Oracle en jeu : warp intérieur→extérieur pluvieux (ex. sortir d'une maison sous la pluie à Route 104) plusieurs fois de
suite → observer si le fade-in reste parfois figé/incomplet (bug fadescreen intermittent). Comparer aussi une porte de
grotte (fade noir) vs une sortie eau (fade blanc via GetMapPairFadeFromType).

### 2. field_control_avatar.c : dispatch warp/interaction re-routé + branches step omises (L)
ProcessPlayerFieldInput réutilise warp-system (findWarpEventAt/setPendingWarp) au lieu des TryArrowWarp/
TryStartWarpEventScript/TryDoorWarp POURTANT portés ici (→ code mort). Omissions vivantes : TryStartMiscWalkingScripts
(cracked-floor-hole/pyramid/secret-base mats), CheckForTrainersWantingBattle en tête, GetObjectEventScriptPointerPlayerFacing,
hidden-item flag check (objet caché re-proposé), bloc secret-base de GetInteractedMetatileScript, la majorité de TryStartStepCountScript.
Effort : L (rebrancher ProcessPlayerFieldInput sur les fns 1:1 locales + porter les branches manquantes).
Oracle en jeu : (a) marcher sur un trou de sol fissuré (Sky Pillar / Grotte) → doit lancer EventScript_FallDownHole
(actuellement OMIS via TryStartMiscWalkingScripts). (b) Ramasser un objet caché, recharger, re-parler à la case → ne
doit PAS re-proposer l'objet (hidden-item flag check manquant).

### 3. region_map.c : écran Vol/Carte réimplémenté hors-mirror (L, faible priorité)
`region_map.ts` = coquille (3 GetMapName*). L'écran réel (997 l) vit dans engine/field/region-map.ts en Phaser custom,
noms ≠ décomp (OpenRegionMap/TickRegionMap). Non-conforme à la doctrine mirror.
Effort : L (réécrire aux noms 1:1 InitRegionMap/ProcessRegionMapInput_Full/CB2_FlyMap…). Faible levier (fonctionne).
Oracle en jeu : utiliser Vol depuis le sac → carte de Hoenn, déplacer le curseur, sélectionner une ville → warp correct.

### 4. map_name_popup.c : table thèmes INCOMPLÈTE + texte non-1:1 (S)
`MAPSEC_TO_THEME` (Record string) omet plusieurs mapsecs (UNDERWATER_SEAFLOOR_CAVERN, FIERY_PATH2, JAGGED_PASS,
MAGMA_HIDEOUT, MIRAGE_TOWER, TERRA_CAVE, TRAINER_HILL, UNDERWATER_1xx…) → thème popup faux (fallback wood) sur ces zones.
Texte via FONT_NORMAL + centrage approximé (mapName.length*6) au lieu de FONT_NARROW + GetStringCenterAlignXOffset. Bloc Battle Pyramid omis.
Effort : S (compléter la table depuis sMapSectionToThemeId + FONT_NARROW + centrage exact).
Oracle en jeu : entrer à Fiery Path / Jagged Pass / Seafloor Cavern → le cadre du popup doit être STONE, pas wood ;
vérifier le centrage du nom de map à l'entrée d'une ville longue (ex. « CENTRE COMMERCIAL »).

### 5. field_door.c : ShouldUseMultiCorridorDoor + garde FuncIsActiveTask omis (S)
`ShouldUseMultiCorridorDoor` non porté → DrawDoor ne réplique pas le double-draw (mineur, Battle Tower multi = link).
Plus grave côté solo : `StartDoorAnimationTask` OMET le garde `FuncIsActiveTask(Task_AnimateDoor)` → anims de porte
simultanées possibles (divergence comportement). `GetLastDoorFrame` inlinée (frames[3] hardcodé).
Effort : S (réintroduire le garde + GetLastDoorFrame 1:1).
Oracle en jeu : enchaîner rapidement deux warps de porte (entrer/sortir vite d'un bâtiment) → vérifier qu'une seule
anim de porte tourne à la fois (pas de superposition / double son).

---

## Synthèse statuts (périmètre overworld-map)

| fichier .c | notre fichier | statut | fns portées/total |
|---|---|---|---|
| field_camera.c | field_camera.ts | ✅ MIROIR | 28/28 |
| field_tasks.c | field_tasks.ts | ✅ MIROIR | 28/28 |
| fieldmap.c | fieldmap.ts | ✅ MIROIR | ~54/55 |
| field_weather.c | field_weather.ts | ✅ MIROIR | 48/49 |
| tileset_anims.c | tileset_anims.ts | ✅ MIROIR | 50/84 (data async) |
| field_door.c | field_door.ts | 🟡 PARTIEL | ~19/23 |
| field_control_avatar.c | field_control_avatar.ts | 🟡 PARTIEL | ~26/41 |
| map_name_popup.c | map_name_popup.ts | 🟡 PARTIEL | 6/7 |
| field_weather_effect.c | field_weather_effect.ts | 🟡 PARTIEL | 43/106 (non ré-audité en détail — cf. cartograph) |
| heal_location.c | heal_location.ts | 🟡 PARTIEL | 1/3 (2 code-mort) |
| field_screen_effect.c | field_screen_effect.ts | 🔴 DIVERGENT | 0/77 (dispersé warp-system) |
| region_map.c | region_map.ts (+engine/field) | 🔴 DIVERGENT | 3/60 (écran hors-mirror) |
| cable_club.c | ABSENT | 🚫 EXEMPT | 0/62 (link/multi) |

Note : `field_weather_effect.c` (43/106) était dans le périmètre mais est un gros fichier de rendu météo (effets
pluie/neige/brouillard/cendre) ; le cartograph le classe 🟡 partiel. Non ré-audité fonction-par-fonction ici faute de
signal de divergence (les Init/Main/Finish de chaque météo sont la partie manquante = rendu, pas logique de jeu).
