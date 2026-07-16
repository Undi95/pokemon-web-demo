# fix-region-map — port 1:1 `region_map.c` + câblage carte Pokénav (2026-07-16)

## Fichiers

| Fichier | Action |
|---|---|
| `src/region_map.ts` | RÉÉCRIT : 81 lignes (3 GetMapName*) → miroir COMPLET de `region_map.c` (~1900 l., 58/58 fonctions, ordre du .c). Les 3 `GetMapName*` préexistants (Match Call/party/summary/tv) sont PRÉSERVÉS tels quels et replacés à leur position du .c. |
| `src/pokenav_region_map.ts` | CÂBLÉ : 39 `__wireTodo` → 0. Imports réels (region_map, pokenav_main_menu, pokenav, data/) + gate assets case 0 + fixes bloqueurs (détail plus bas). |
| `src/data/region_map/city_map_tilemaps.ts` | CRÉÉ : miroir `src/data/region_map/city_map_tilemaps.h` (22 `gPokenavCityMap_*`, chargés async). |
| `src/data/region_map/city_map_entries.ts` | CRÉÉ : miroir `src/data/region_map/city_map_entries.h` (`sPokenavCityMaps[22]`, `tilemap` = getter LIVE). |
| `src/pokenav.ts` | 2 lignes : import + appel `PrefetchPokenavRegionMapAssets()` dans `CB2_InitPokeNav` (emplacement sanctionné par la mission, à côté de `PrefetchMatchCallAssets`). |

`npx tsc --noEmit` = **0 erreur**. Aucun fichier de la liste interdite touché (`window.ts` gelé → `PutWindowRectTilemap` implémenté localement dans pokenav_region_map.ts sur les briques exportées de window.ts, 1:1 window.c:371).

## Fonctions portées

- **region_map.c : 58/58** (diff d'inventaire .c vs .ts = 0 manquante, forward-decls dédupliquées).
  Cœur : InitRegionMap, InitRegionMapData, ShowRegionMapForPokedexAreaScreen, LoadRegionMapGfx (8 cases),
  BlendRegionMap, FreeRegionMapIconResources, DoRegionMapInputCallback, ProcessRegionMapInput_Full/Zoomed,
  MoveRegionMapCursor_Full/Zoomed, SetRegionMapDataForZoom, UpdateRegionMapZoom, CalcZoomScrollParams,
  RegionMap_SetBG2XAndBG2Y, UpdateRegionMapVideoRegs, PokedexAreaScreen_UpdateRegionMapVariablesAndVideoRegs,
  GetMapSecIdAt, InitMapBasedOnPlayerLocation, RegionMap_InitializeStateBasedOnSSTidalLocation, GetMapsecType,
  GetRegionMapSecIdAt, CorrectSpecialMapSecId(_Internal), GetTerraOrMarineCaveMapSecId, GetMarineCaveCoords,
  IsPlayerInAquaHideout, GetPositionOfCursorWithinMapSec, RegionMap_IsMapSecIdInNextRow, SpriteCB_Cursor*,
  CreateRegionMapCursor, FreeRegionMapCursorSprite, Set/ClearUnkCursorSpriteData (UNUSED, transcrites),
  CreateRegionMapPlayerIcon, Hide/UnhideRegionMapPlayerIcon, SpriteCB_PlayerIcon*, TrySetPlayerIconBlink,
  GetMapName/Generic/HandleAquaHideout, GetMapSecDimensions, IsRegionMapZoomed, IsEventIslandMapSecId.
- **FLY MAP : transcrite COMPLÈTE mais INERTE** (CB2_OpenFlyMap → CB_ExitFlyMap, 12 fonctions + toutes
  les data : sMapHealLocations[50], sMultiNameFlyDestinations, sFlyMapBg/WindowTemplates, icônes+anims).
  `CB2_OpenFlyMap` n'est câblé nulle part (le Vol in-game passe toujours par `engine/field/region-map.ts`
  mode 'FLY' + `fly-field-move.ts`). Je ne me suis PAS arrêté en route : tout le .c est transcrit.
- Données : `gRegionMapEntries` (indexé mapSecId NUMÉRIQUE) + `sRegionMap_MapSectionLayout` (15×28
  numérique) construits au prefetch depuis `region_map_data.json` (extraction existante). Oracle offline :
  213 entries + 55 clés layout résolvent TOUTES vers `include/constants/region_map_sections.ts` ;
  FLAG_VISITED_* contigus (canFlyFlag++ 1:1) ; MAP_CONSTANTS complet pour sMapHealLocations.

## wireTodo résiduels

- `pokenav_region_map.ts` : **0**.
- `region_map.ts` : **6 sentinelles NEUVES**, toutes dans du code INERTE (throw à l'appel, documentées) :
  `GetSSTidalLocation` (field_specials pas porté — atteignable seulement si carte ouverte À BORD du
  S.S. Tidal), `SetWarpDestinationToHealLocation`, `SetWarpDestinationToMapWarp`,
  `ReturnToFieldFromFlyMapSelect`, `CB2_ReturnToPartyMenuFromFlyMap`, `CB2_ReturnToFieldWithOpenMenu`
  (fly map inerte). À résoudre au câblage réel de la fly map 1:1.

## Assets / packs / SW

- **AUCUN nouveau binaire à extraire** : les 15 fichiers `graphics/pokenav/region_map/*` + les 22
  `city_maps/*.bin` étaient déjà servis dans `public/decomp/em/pokenav/region_map/` (sources décomp
  DÉCOMPRESSÉES : city bins = 200 o = 10×10 u16 raw, map.bin = 4096 o affine u8 raw) ;
  `region_map_data.json` (entries+layout) déjà extrait. → **packs NON régénérés** (rien d'ajouté ; les
  `.pack` ne couvrent pas pokenav — chemin fetch direct identique à Match Call, prouvé en jeu).
- Chargement : `PrefetchPokenavRegionMapAssets()` (pokenav_region_map) → `PrefetchRegionMapAssets()`
  (region_map.c : map/curseur/icônes joueur + JSON) + `PrefetchCityMapTilemaps()` (22 villes) + INCGFX
  locaux (info_window.pal, zoom_tiles, city_zoom_text). Lancé à `CB2_InitPokeNav`. Gates : case 0 du
  LoopedTask PAUSE tant que pas prêt (précédent pokenav_main_menu.ts:464) ; tous les loaders
  `.catch(console.error)` et les lecteurs HURLENT si data null (Règle 3). `PrefetchFlyMapAssets()`
  séparé (frame/fly icons, appelé seulement par CB2_OpenFlyMap inerte).
- 🩸 SW : par prudence, **désenregistrer le Service Worker avant le test** si des fetches semblent
  stales (leçon repo) — même si aucun asset n'a été modifié/ajouté.

## Adaptations moteur (précédents cités en commentaire dans le code)

- INCBIN → module-lets async + gates poll (pokenav_main_menu `_pokenavLoadHeaderGraphics`, match_call_gfx).
- mapSecId NUMÉRIQUE 1:1 partout ; frontière moteur (gMapHeader.regionMapSectionId = clé string) via
  `_mapsecIdFromKey`/`_mapsecKeyFromId` ; `IsEventIslandMapSecId` accepte string|number.
- Out-params C (`GetMarineCaveCoords(&x,&y)`, `GetMapSecDimensions`, `GetSSTidalLocation`) → retours objets.
- Adaptateurs bg.c LOCAUX (précédent mail.ts:1010-1075 — pas d'arête d'import vers le cluster pokenav
  depuis region_map, module EAGER importé par match_call/tv/party_menu/summary) :
  `DecompressAndCopyTileDataToVram` (mode 0 = tuiles au charBase ; **mode 1 = tilemap ÉCRITE AU
  mapBase VRAM directement** — la view `bg.tilemap` est clampée par le screenSize COURANT or le BG2
  affine 64×64 ne reçoit `SetBgAttribute(SCREENSIZE, 2)` qu'au case 7 → passer par la view aurait
  tronqué 3/4 de la carte), `FreeTempTileDataBuffersIfPossible` (=false), `LZ77UnCompWram` (=copie).
- Sprites : PAS de sous-struct `.oam` sur le sprite du port (MEMORY) → helpers `_spriteOamSizeSet/
  ShapeSet` (region_map) et `_spriteOamTileNumGet/Set` (pokenav_region_map, triple-écriture
  oam.tileId+tileBase+sheetTileStart comme pokenav_main_menu:717).
- `CpuFill16` local buffer-dest dans pokenav_region_map (celui du harness ne gère que les ADRESSES →
  no-op silencieux = fond BG1 jamais posé) ; `state.tilemapBuffer` = **getter** view LIVE tilemap BG1
  (relu après InitBgTemplates).
- Struct embarqués matérialisés à l'Alloc (RegionMap : mapSecName[20]/cursorSmallImage[0x100]/
  cursorLargeImage[0x600] dans InitRegionMapData ; Pokenav_RegionMapGfx : cityZoomTextSprites[3]/
  tilemapBuffer/cityZoomPics[22][200] dans OpenPokenavRegionMap) — la ROM caste un bloc Alloc brut.
- Fix transpileur (bloqueur noté) : `sMapSecInfoWindow_Pal.length` → `.byteLength`
  (sizeof C = octets ; `.length` u16 = moitié de la palette copiée).
- `SetVBlankCallback_` wrapper local (précédent menu_handler_gfx:67) ; `SetPokenavVBlankCallback`
  importé de pokenav.ts (cycle runtime-only toléré, précédent menu_handler_gfx:66).
- Constantes weather EXPR non résolues par le générateur → dérivées 1:1 localement
  (MARINE_CAVE_LOCATIONS_START=9, ABNORMAL_WEATHER_LOCATIONS=16).

## Divergences conservées (à re-litiger plus tard, PAS cassé Match Call)

1. `GetMapName` : MAPSEC_SECRET_BASE ne passe PAS par `GetSecretBaseMapName` (non porté) — lookup FR
   direct comme avant ; retour = string JS (pas le ptr fin de buffer C). Comportement identique à
   l'existant (Match Call vérifié en jeu avant ce chantier).
2. `GetMapNameGeneric`/`HandleAquaHideout` : « FERRY »/« BASE SECRETE »/« PLANQUE » hardcodés
   (préexistant) au lieu de `getString(gText_Ferry/...)` — dette `feedback-never-hardcode-decomp-strings`,
   gardée pour ne pas toucher un chemin testé en jeu.
3. `sRegionMap_SpecialPlaceLocations` : **vanilla sans BUGFIX** (politique préproc du repo) →
   UNDERWATER_125 → ROUTE_129 (bug ROM conservé). ⚠ L'ancienne table field
   (`engine/field/region-map-data.ts`, hors mandat) applique le BUGFIX → les 2 écrans divergent d'un
   nom en plongée Route 125. À unifier un jour.
4. `sMapHealLocations` : heal locations = IDS STRING (registre du port `heal_location.ts`) — fly map
   inerte, sans effet aujourd'hui.

## Points à VÉRIFIER EN JEU (Fable, session principale)

1. **Ouverture** : Pokénav → CARTE DE HOENN. Attendu : PAUSE ≤ quelques frames (prefetch lancé à
   l'ouverture du Pokénav), puis fade et carte. Si écran BLOQUÉ sur le fond menu → regarder la console
   (les gates hurlent : fetch échoué ou prefetch pas lancé).
2. **Rendu BG2 affine** (dépend du chantier compositor EN COURS) : la carte elle-même (tiles 8bpp +
   tilemap 64×64 au mapBase 6, mode 1, BG2PA-PD/BG2X-Y écrits via SetGpuReg — le runtime les assemble
   déjà : decomp-runtime.ts:923-929). Si carte invisible/garbage → chantier affine, pas ce port.
   NB : tilemap écrite au mapBase par bytes u16-étendus (format view compositor).
3. **Curseur** : position initiale = mapsec du joueur, blink 2 frames (anim 0), déplacement D-pad
   (throttle 4 frames), nom mapsec mis à jour dans la fenêtre info (FONT_NARROW).
4. **Fenêtre info** : cadre (LoadUserWindowBorderGfx_ 0x42 pal 4), nom lieu, landmarks pour les routes,
   plan de ville 10×10 pour les villes visitées (cityZoomPics), fond BG1 tile 0x1040 propre (fix CpuFill16).
5. **Zoom** (A) / dézoom (A) : anim 16 frames (UpdateRegionMapZoom), curseur 32×32 anim 1, icône joueur
   repositionnée, sprites « city zoom text » qui défilent en bas, helpbar MAP_ZOOMED_IN/OUT.
6. **Sortie** (B) : fade to black, retour menu principal curseur sur CARTE, `SetBgMode(0)` restauré,
   pas de résidus (FreeRegionMapSubstruct2 → RemoveWindow + FreeCityZoomViewGfx).
7. **regionMapZoom persistant** : re-rentrer sur la carte après un zoom → doit rouvrir zoomée
   (gSaveBlock2Ptr.regionMapZoom).
8. Régression **Match Call** (localisations) + **résumé Pokémon** (mémo dresseur) + **party menu** :
   GetMapName* inchangés mais re-déclarés dans le nouveau fichier — vérifier une localisation MC.
9. Boot sain (nouvelles arêtes d'import region_map → overworld/event_data/sprite/window : toutes
   runtime-only ou vers des leafs ; tsc vert ; à confirmer par un boot).
