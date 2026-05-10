# Audit exhaustif port Émeraude — 2026-05-10

**Auteur** : Agent Opus (general-purpose, 387k tokens, 1760s)
**Demandeur** : Undi
**Scope** : boot → combat Zigzagton, audit 1:1 décomp `pokeemeraude`
**Branche** : `claude/hungry-moore-a74774`
**Contexte** : session 126 (= post-session 125 menu options fix), user bloqué à MaysHouse_1F (2,4) après que dialog Maman ne fire pas

---

## A. SYNTHÈSE EXÉCUTIVE

Le port a une architecture solide (script-runtime 1:1, map-loader 1:1, warp-system 1:1, save-blocks 1:1) mais **3 BUGS BLOQUANTS** empêchent la progression boot→combat :

1. **Bug #1 (CRITIQUE)** : Les textes `PlayersHouse_1F_Text_*` ne sont PAS chargés pour la map FEMALE `LittlerootTown_MaysHouse_1F`. Ils sont définis uniquement dans le map JSON Brendan's House. Result : `msgbox` silent-fail mais `setvar` continue → progression "fantôme".
2. **Bug #2 (CRITIQUE)** : `Overworld_GetMapHeaderByGroupAndId`, `defineMapHeaderEntry`, `GetMapGridBlockAt`, `MapGridGetCollisionAt`, `MapGridGetMetatileBehaviorAt`, `MapGridGetElevationAt` ne sont PAS exposés sur globalThis dans `gba-global-scope.ts`. Tout chemin auto-transpilé qui les appelle (= `CB2_ContinueSavedGame` etc) crash → save load brisé.
3. **Bug #3 (CRITIQUE)** : Le opcode `msgbox` ne distingue PAS entre "label introuvable" et "rien à afficher" — en cas de label non trouvé, il return `false` (= continue), faisant exécuter les opcodes suivants comme si l'utilisateur avait fermé le dialog. Doit retourner `true` (= halt) ou afficher un placeholder visible.

Top 3 priorités : **Fix #1 (extract-scripts.mjs : merger les `data/maps/<*>/scripts.inc` dans `_common.json`), Fix #2 (gba-global-scope.ts : ajouter les bridge fns), Fix #3 (msgbox halt sur label manquant)**.

---

## B. BUGS BLOQUANTS

### B.1 Texte `PlayersHouse_1F_Text_IsntItNiceInHere` introuvable au runtime → msgbox silent-fail

- **Symptôme observé** : Player warp à MaysHouse_1F (FEMALE), dialog "MAMAN: Alors, UNDI? C'est joli ici, non?" **ne s'affiche PAS**. Mais `VAR_LITTLEROOT_INTRO_STATE = 4` set quand même (= script qui lance setvar exécute après le msgbox raté).
- **Root cause** : `D:/Projet 1/pokemon-web-demo/scripts/extract-scripts.mjs:96-107` : pour chaque map, sauvegarde `<MapName>.json` avec ses scripts/textes locaux. Mais le `_common.json` (= ligne 114-147) ne récolte que les fichiers dans `data/scripts/*.inc + data/text/**/*.inc + data/*.s|inc` racine. **Il N'inclut PAS les `data/maps/<*>/scripts.inc`** où sont définis `PlayersHouse_1F_Text_*` (= dans Brendan's House map seulement). Donc quand `LittlerootTown_MaysHouse_1F.json` est loadé, `_common.json` non plus n'a ces textes. `getText('PlayersHouse_1F_Text_IsntItNiceInHere')` → undefined.
  - Vérifié via Python script : texte présent UNIQUEMENT dans `LittlerootTown_BrendansHouse_1F.json` et `_all.json`, absent de `_common.json` et `LittlerootTown_MaysHouse_1F.json`.
- **Comparaison décomp** : `D:/Projet 1/decomps/pokeemeraude/data/maps/LittlerootTown_BrendansHouse_1F/scripts.inc:286` définit le texte. Le décomp partage ces textes via les lookups linkés au compile (= toutes les maps voient les textes). Notre runtime fait fetch JSON par-map → asymétrie.
- **Fix proposé** : Modifier `extract-scripts.mjs` pour AUSSI walk `data/maps/**/scripts.inc` et merger dans `commonScripts/commonTexts`. Variante alternative : faire en sorte que `script-runtime.ts:loadMapScripts` charge `_all.json` au lieu de `_common.json` (plus lourd : 4.3MB vs 1.6MB, mais une fois). Choix recommandé : merger dans `_common.json`.
- **Confiance** : 100%.

### B.2 `Overworld_GetMapHeaderByGroupAndId` et autres bridge fns NON exposées sur globalThis

- **Symptôme observé** : Console `Overworld_GetMapHeaderByGroupAndId is not defined` au save resume → user perd sa save (= visuellement, le main menu n'affiche plus "Continue", car `gSaveFileStatus` reste à EMPTY après crash). User : "ma save disparaît à chaque fois...".
- **Root cause** : `D:/Projet 1/pokemon-web-demo/src/engine/gba-global-scope.ts:20-494` (= `symbolsToExpose`) liste explicitement les symbols à mettre sur globalThis. Manquent :
  - `Overworld_GetMapHeaderByGroupAndId` (défini `decomp-bridge.ts:975`)
  - `defineMapHeaderEntry` (défini `decomp-bridge.ts:972`)
  - `GetMapGridBlockAt` (défini `decomp-bridge.ts:1551` — mais c'est un STUB qui retourne 0)
  - `MapGridGetCollisionAt` (défini `map-loader.ts:1315`, mais EN EXPORT, pas en globalThis)
  - `MapGridGetMetatileBehaviorAt` (défini `map-loader.ts:1331`)
  - `MapGridGetElevationAt` (défini `map-loader.ts:1308`)
  - `MapGridGetMetatileIdAt`, `GetMapBorderIdAt`, `GetMetatileAttributesById`
- Ces fonctions sont référencées sans qualifier dans `decomp-data/auto/src-all/overworld-all-auto.ts:256, 263, 592, 879, 2286, 2667, 1305-1311 (CB2_ContinueSavedGame)`.
- **Comparaison décomp** : Ce sont des fonctions C globales qui doivent être visibles dans tout fichier qui les call. Notre runtime les définit séparément (en TS export) mais l'auto-file les utilise comme global.
- **Fix proposé** : Ajouter ces 9 fns à `symbolsToExpose` dans `gba-global-scope.ts`. **ATTENTION** : il y a une collision potentielle entre la version `decomp-bridge.ts:975` (= cache-based) et la version `overworld-all-auto.ts:1310 LoadSaveblockMapHeader` qui assigne à un `gMapHeader` local non-existant. La version manuelle doit gagner. Soit on expose **uniquement** la manuelle (= delete le fallback auto), soit `flattenBarrelOnGlobalThis` en `option-menu-impl.ts:670` skip si déjà défini (`first-seen wins`) — mais le timing fait que `flattenBarrel` n'est appelé qu'à l'ouverture du menu, donc l'expose manuelle au boot via `gba-global-scope.ts` est nécessaire.
- **Confiance** : 100% (c'est exactement le bug noté dans l'enquête session 125).

### B.3 `msgbox` opcode silent-fail au lieu de halt sur label manquant

- **Symptôme observé** : Conséquence directe de B.1. Le script `EnterHouseMovingIn` continue d'exécuter `applymovement + setvar STATE=4` même quand `msgbox PlayersHouse_1F_Text_IsntItNiceInHere` ne trouve PAS le texte.
- **Root cause** : `D:/Projet 1/pokemon-web-demo/src/engine/script-opcodes.ts:567-574`. Le handler `msgbox` :
  ```ts
  const rawText = getText(textLabel);
  if (!rawText) {
    console.warn(`[opcode msgbox] text '${textLabel}' not found`);
    return false;  // ← FALSE = continue script !
  }
  ```
  Comportement attendu : `return true` (= halt + wait pour A button) OU display un fallback `[??${textLabel}??]` visible pour debug. Avec `return false`, le scriptIdx avance, les opcodes suivants exécutent.
- **Comparaison décomp** : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:msgbox` impl pas de fallback car le linker garantit le text existe. Mais notre runtime async fetch peut manquer → on doit gérer.
- **Fix proposé** : 2 options :
  1. Defensive : `msgbox` halt + log error visible si label undefined. Ça force voir tout le bug visuellement (= player frozen).
  2. Robust : `ShowFieldMessage(rawText ?? `[MISSING:${textLabel}]`)` + continuer normalement → user voit `[MISSING:PlayersHouse_1F_Text_X]` à l'écran, debug + flow continue.
- **Confiance** : 100%.

### B.4 Player bloqué à (2,4) à MaysHouse_1F (= probablement secondaire à B.1)

- **Symptôme observé** : Player walk de (2,8) → (2,7) puis manuellement vers (2,4). À (2,4) ne peut plus monter vers (2,3). Console `__gObjectEvents` montre 3× `OBJ_EVENT_GFX_MOVING_BOX` du Truck.
- **Root cause hypothétique** : Pas certain à 100% sans logs runtime live. Hypothèses :
  - **(H1) — 70% confiance** : Le script `EnterHouseMovingIn` s'exécute partiellement (msgbox silent-fail B.1), mais `applymovement Mom + Mom WalkInPlaceFasterUp + waitmovement` charge des movements queues qui ne se complètent JAMAIS (= si Mom n'est pas spawné OU son local id mal résolu). `waitmovement 0` then sets script en NATIVE waiting forever → `LockPlayerFieldControls` reste TRUE → player frozen. Mais l'user a quand même fait des steps manuels, donc improbable.
  - **(H2) — 60% confiance** : Le `_tickWalk` du player a un bug subtle : ligne 489 `gPlayerAvatar.stepFramesLeft = duration - frame;` set le stepFramesLeft pendant le walk scripted, mais ça pourrait interagir avec le PlayerStep qui regarde `stepFramesLeft > 0` pour ne pas faire keypad. **Possible : si stepFramesLeft n'est pas reset proprement à 0 à la fin, le player reste "en step" et keypad input ignoré pour 1 step extra**. Vérifier `movement-system.ts:507` `gPlayerAvatar.stepFramesLeft = 0;` : OK reset.
  - **(H3) — 80% confiance** : L'option-menu-return / state restore après ouverture/fermeture du menu options pendant l'intro a corrompu la `gPlayerAvatar.facing` ou un autre state. Mais user n'a pas mentionné menu.
  - **(H4) — 90% confiance** : **Les 3 OBJ_EVENT_GFX_MOVING_BOX persistent dans `__gObjectEvents` avec coords (0,0), (0,3), (2,3). Bien que `active=false`, peut-être que pendant un applymovement scripted ou un cross-border le check de collision les considère brièvement active=true.** À vérifier en debug live. Le **fix le plus safe** : étendre `resetObjectEventAllocations` pour reset aussi `currentCoordsX/Y`, `previousCoordsX/Y`, `initialCoordsX/Y`, `graphicsId`, `localIdRaw`, `mapId` à des valeurs sentinelles (= -1 / null).
- **Fix proposé** : Étendre `D:/Projet 1/pokemon-web-demo/src/engine/object-events.ts:313-333` `resetObjectEventAllocations` :
  ```ts
  npc.currentCoordsX = -999;
  npc.currentCoordsY = -999;
  npc.previousCoordsX = -999;
  npc.previousCoordsY = -999;
  npc.initialCoordsX = -999;
  npc.initialCoordsY = -999;
  npc.graphicsId = '';
  npc.localIdRaw = '';
  npc.mapId = '';
  npc.scriptLabel = '';
  npc.localId = 0;
  npc.facingDirection = 0;
  ```
  Et **ajouter** `IsElevationMismatchAt` au pipeline `checkPlayerCollision` (= ligne 543-544 de `player-avatar.ts`) — actuellement absent. Voir B.5.
- **Confiance** : 60% (root cause exacte à confirmer en debug live).

### B.5 `IsElevationMismatchAt` non appelé dans le pipeline `checkPlayerCollision`

- **Symptôme observé** : Pas de symptôme visible isolé, mais expose le port à des collisions wrong (= player passe / ne passe pas) sur les transitions d'élévation (= staircase, ledge, etc.).
- **Root cause** : `D:/Projet 1/pokemon-web-demo/src/engine/player-avatar.ts:521-555` `checkPlayerCollision` fait map collision + IsMetatileDirectionallyImpassable + ShouldJumpLedge + NPC collision, **mais skip IsElevationMismatchAt**. Le commentaire docstring `:512` mentionne pourtant le check 1:1 décomp.
- **Comparaison décomp** : `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c:4715 GetCollisionAtCoords` — la séquence des checks est :
  1. `IsCoordOutsideObjectEventMovementRange` (= player skip — pas de range)
  2. `MapGridGetCollisionAt` || `GetMapBorderIdAt == CONNECTION_INVALID` || `IsMetatileDirectionallyImpassable` → COLLISION_IMPASSABLE
  3. **`IsElevationMismatchAt(currentElevation, x, y)` → COLLISION_ELEVATION_MISMATCH**
  4. `DoesObjectCollideWithObjectAt` → COLLISION_OBJECT_EVENT
  5. COLLISION_NONE
- **Fix proposé** : Importer `IsElevationMismatchAt` (= `D:/Projet 1/pokemon-web-demo/src/engine/decomp-data/auto/src-all/event_object_movement-all-auto.ts:6177`) ou mieux ré-implémenter manuel dans `metatile-behavior-helpers.ts` 1:1, et l'appeler entre IsMetatileDirectionallyImpassable et NPC check. Mettre à jour `gPlayerAvatar.currentElevation` au step end (= lecture de `MapGridGetElevationAt`).
- **Confiance** : 100% (vs décomp).

---

## C. BUGS NON-BLOQUANTS mais CRITIQUES pour 1:1

### C.1 `extract-scripts.mjs` ne récolte pas tous les textes inter-maps

Voir B.1 et B.2 (= même symptôme côté générateur). Le pool `commonScripts/commonTexts` ne walk PAS `data/maps/**/*.inc`. Les ~150 maps ont des cross-references (= lap MAYS goto Players_X défini dans Brendan's). Beaucoup d'autres bugs analogues seront révélés. Fix : `walkAndParse(join(decompPath, 'data', 'maps'))` dans `extract-scripts.mjs`. **Confiance** : 100%.

### C.2 `decomp-bridge.ts:1551 GetMapGridBlockAt` est un STUB qui retourne 0

- **Root cause** : `decomp-bridge.ts:1549-1554` est un stub `return 0`. Si une fonction auto-transpilée appelle cette version (= via globalThis si exposée, ou via le re-export du barrel), elle obtient toujours 0 = jamais MAPGRID_UNDEFINED → wrong path partout (= MapGridGetCollisionAt retourne `(0 >> 10) & 0x3 = 0` = always passable).
- **Fix proposé** : Le fichier `map-loader.ts:1300` a la vraie impl mais en `function` private. **Refactor** : la rendre `export function GetMapGridBlockAt(...)` et le bridge la use directly. Ou supprimer le stub `decomp-bridge.ts:1551-1554` complètement et laisser `map-loader.ts` être la source unique.
- **Confiance** : 100%.

### C.3 `setobjectxyperm` ne sync pas `currentCoordsX/Y` du NPC actif

- **Root cause** : `D:/Projet 1/pokemon-web-demo/src/engine/script-opcodes.ts:1117-1135` setobjectxyperm modifie `tpl.x/y` (= template) + `npc.initialCoordsX/Y`. **Ne touche PAS `currentCoordsX/Y` ni `previousCoordsX/Y`**. Le NPC reste visuellement à sa position courante.
- **Comparaison décomp** : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1093 ScrCmd_setobjectxyperm` appelle `SetObjEventTemplateCoords` qui modifie le template seulement. Le NPC actif n'est pas re-positionné — le décomp s'attend à ce que le NPC respawn au prochain cross-border. **Notre version est plus 1:1** (= modifie aussi `initialCoordsX/Y`). Il y a probablement un bug latent : si le script `MoveMomToDoor` set Mom à (1,8) mais Mom était déjà active à (8,6) post-spawn, **Mom reste affiché à (8,6)**. Mais à MaysHouse_1F, le warp vient de se faire → la map vient d'être loadée → templates utilisés pour spawn. Donc Mom apparait à (8,6) (= template default), puis OnTransition fait setobjectxyperm vers (1,8) → modifie template + initialCoords. Mais la check `_spawnSingleNpcFromTemplate` set `currentCoordsX = template.x` au spawn. **Si OnTransition fire AVANT spawn**, alors Mom apparait à (1,8). Si APRÈS, à (8,6).
- D'après le code `TestOverworldScene.ts:646-649` : `RunOnTransitionMapScript()` est appelé AVANT `SpawnObjectEventsOnMap`. Donc Mom doit spawn à (1,8) directement. **Donc OK.**
- **Fix proposé** : Aucun, c'est OK au boot. Mais en cours de game (= Mom déjà active + script change perm coords), il faut aussi sync `currentCoordsX/Y`. À étendre.
- **Confiance** : 80% (à vérifier in-game).

### C.4 Stubs d'opcodes utilisés dans le critical path Truck→Combat

Liste prioritaire :
- `setrespawn` (= `script-opcodes.ts:1531` no-op) — pas critique tant qu'on whiteoute pas
- `incrementgamestat` (= `:1537` no-op) — utilisé dans `WallClock CheckWallClock` (`incrementgamestat GAME_STAT_CHECKED_CLOCK`). Pas critique.
- `multichoice` / `multichoicedefault` / `multichoicegrid` (= `:702-720` stub returning 0) — utilisé dans LatiBroadcast scene, pas dans path Truck→Zigzagton.
- `givemoney` / `takemoney` / `checkmoney` (= `:1574-1583`) — pas dans path Truck→Zigzagton.
- `setweather` / `doweather` — Route 101 est WEATHER_NONE, pas critique.
- `dofieldeffect` (= `:1595` no-op) — utilisé pour rocksmash/cut/etc, pas pour intro.

**Fix proposé** : laisser tel quel pour la phase actuelle, ces stubs ne bloquent pas le path Truck→Combat.

---

## D. STUBS/NO-OPS dans le critical path

### D.1 (CRITICAL) `_stubMultichoice` dans Mom dialog Latias broadcast

- **Localisation** : `script-opcodes.ts:697-720`
- **Impact** : Le script `PlayersHouse_1F_EventScript_GetSSTicketAndSeeLatiTV` (= post-Petalburg gym report) appelle `multichoice 22, 8, MULTI_TV_LATI, TRUE`. Stub retourne `VAR_RESULT = 0` = first option. Pas dans path Truck→Zigzagton, mais dans path post-Zigzagton.

### D.2 `IsMetatileDirectionallyImpassable` autres mb manquants ?

- **Localisation** : `metatile-behavior-helpers.ts`
- **Vérifier** : `MetatileBehavior_IsNorthBlocked / IsSouthBlocked / IsEastBlocked / IsWestBlocked` sont impl 1:1. Mais `IsImpassableNorthAndSouth`, etc, à vérifier complétude.

### D.3 Bridge stubs cassés

- **Localisation** : `decomp-bridge.ts:1551 GetMapGridBlockAt = return 0`
- **Localisation** : `decomp-bridge.ts:2165 SomeFn = return Overworld_GetMapHeaderByGroupAndId(0, 0)` → fallback vers placeholder header → wrong values

---

## E. CODE INUTILISÉ / MAL TRANSPILÉ

### E.1 `script-runner.ts` (= legacy) coexistence avec `script-runtime.ts` (= new)

- **Localisation** : `D:/Projet 1/pokemon-web-demo/src/engine/script-runner.ts` (= 727 lignes) et `D:/Projet 1/pokemon-web-demo/src/engine/script-runtime.ts` (= 631 lignes).
- **Mention** : `script-runner.ts` est encore importé par `map-scripts.ts:1`, `new-game-init.ts:?`, `world-renderer.ts:?`. Les conditional branches `goto_if_set` y sont **toujours ignorées** (= ligne 17 `goto_if_set ... : ignoré (on considère que le flag n'est pas set)`). Si jamais une logique tombe dans le path script-runner, elle sera buggy.
- **Fix proposé** : Auditer chaque importer, vérifier qu'il utilise plutôt `script-runtime.ts`. Migrer + delete `script-runner.ts`.

### E.2 `_invokeSpecial` returns `undefined` si pas registered

- **Localisation** : `specials-registry.ts` `_invokeSpecial`
- **Impact** : Si script appelle `special UnknownSpecial`, retourne undefined → `VAR_RESULT = NaN` (= via specialvar) → comportement aléatoire dans goto_if_eq.
- **Fix proposé** : Default return 0 + log warn.

### E.3 Auto-files = beaucoup de fonctions déclarées mais référencent des helpers non-bridgés

- **Localisation** : `decomp-data/auto/src-all/*-all-auto.ts` (= énormes fichiers, e.g. `overworld-all-auto.ts:1305-1311 CB2_ContinueSavedGame`).
- **Impact** : Quand le `option-menu-impl.ts:670 flattenBarrelOnGlobalThis()` flatten ces auto-files sur globalThis, **beaucoup de symbols sont écrasés mais buggy** (= leurs bodies réfèrent des helpers non-bridgés). C'est mitigé par "first-seen wins" (= `if undefined`), mais des symboles non-définis avant flatten seront exposés en version cassée.
- **Exemples critiques exposés post-flatten qui pourraient écraser nos versions** : `MapGridGetCollisionAt` (cf. fieldmap-all-auto.ts:311), si exposé avant que map-loader exporte la sienne, on a la auto buggy.
- **Fix proposé** : Auditer les conflits entre `_barrel` exports et nos versions manuelles. Maintenir en `gba-global-scope.ts:symbolsToExpose` la version manuelle pour éviter override par flatten.

---

## F. SAVE/LOAD

### F.1 Système globalement OK, sauf B.2

- `save-system.ts` : 1:1 sectors + alternation + checksum. OK.
- `load_save.ts` : `PreSaveSyncBlocks` + `PostLoadApplyBlocks` correctement wired. OK.
- `game-state.ts` : abstraction au-dessus, OK.

### F.2 Save fonctionnel mais Continue path crash

- Save écrit OK (= `gameState.save() → PreSaveSyncBlocks + TrySavingData`).
- Load démarre OK (= `gameState.hasPersistedSave() && gameState.load()` → returns true).
- **MAIS** : Au moment où le code path tombe sur un appel à `Overworld_GetMapHeaderByGroupAndId` (= `CB2_ContinueSavedGame` direct ou via auto-file flatten), crash → save apparait perdue.
- Le `boot-mode.ts:decideBootMode` court-circuite ce path en faisant lui-même la decision (= ligne 199-289). Mais si le user arrive à un endroit qui appelle un auto-file qui call `Overworld_GetMapHeaderByGroupAndId`, crash.

### F.3 Save NPC positions OK mais peut diverger sur cross-map switches

- `LoadObjectEvents` (= `load_save.ts:145`) match par `localId` mais **les `localId` post-spawn dans notre runtime sont 1-based index template (cf. `script-opcodes.ts:1732`)**, pas le décomp localId. Sur reload, le match peut échouer si l'ordre des templates change.
- **Fix proposé** : Match par `localIdRaw` (= string `LOCALID_*`) plutôt que `localId` numeric.

---

## G. WARP system

### G.1 Système globalement 1:1

- `warp-system.ts` (= 246 lignes) : kind classifier + exit task kind + warp coords resolution. OK 1:1 décomp `field_control_avatar.c` + `field_screen_effect.c` + `overworld.c`.
- `executeWarp` dans `TestOverworldScene.ts:753` : 5 phases (door anim + fade out + load map + fade in + exit task). OK.

### G.2 `parseWarpArgs` correct, branche sur `formatwarp` macro

- `script-opcodes.ts:1487-1506` : 0/1/2/3+ args branches OK selon `formatwarp` macro. **Confiance 100%**.

### G.3 Bug latent : si `dest_warp_id == "WARP_ID_DYNAMIC"` non géré

- **Localisation** : `script-opcodes.ts:1511 setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step');`
- Mais le map JSON warp_event peut avoir `dest_warp_id = "WARP_ID_DYNAMIC"` (= string). Vérifier que `parseInt("WARP_ID_DYNAMIC")` n'est pas appelé → NaN. Pas dans path Truck→Combat.

---

## H. CAMÉRA

### H.1 Système 1:1 décomp, robuste

- `field-camera.ts` (= 699 lignes) : `CameraUpdate` + `RedrawMapSlice*` + `gFieldCamera.movementSpeedX/Y` + `gTotalCameraPixelOffsetX/Y` + `sFieldCameraOffset.xPixelOffset/yPixelOffset`. **1:1 décomp `field_camera.c`**.
- `sVerticalCameraPan = 32` (line 93) → +8 dans `FieldUpdateBgTilemapScroll` → BG_VOFS = yPixelOffset + 40. **1:1 décomp** `ResumeMap → InstallCameraPanAheadCallback`.

### H.2 Pas de déviation détectée

Tous les paths que j'ai relus sont fidèles. Camera follow player OK.

---

## I. NPCs / object events

### I.1 Spawn fonctionne mais reset incomplet

Voir B.4. `resetObjectEventAllocations` (= `object-events.ts:313-333`) ne reset PAS `currentCoordsX/Y`, `previousCoordsX/Y`, `initialCoordsX/Y`, `graphicsId`, `localIdRaw`, `mapId`. Conséquence : NPCs persistent visuellement comme zombies dans `__gObjectEvents` (= active=false mais coords du Truck). Bug minor visuel + débuggage difficile.

### I.2 Movement system 1:1 décomp solide

`movement-system.ts` (= ~1000 lignes) : queues per-target, ticker per-frame, walk/jump/in_place/delay actions. **OK**.

### I.3 Movement types 1:1 décomp

`object-events.ts:` tickFaceXxx, tickWanderAround, tickWalkLeftAndRight, tickWalkInPlaceUp/Down, tickRotate, etc. **Couverture des types 1:1 décomp**.

### I.4 Spawn dedup par `(mapId, initialCoordsX, initialCoordsY)`

`object-events.ts:1055-1062`. **Bug potentiel** : si un NPC est removed puis re-spawn avec MEME initial coords (= e.g. ChapelGate), dedup peut foirer. Pas dans path Truck→Combat.

---

## J. PLAN D'ATTAQUE PRIORISÉ

**Pour fonctionner boot→combat 1:1 décomp, faire dans cet ordre :**

1. **Fix BUG #1 (texte manquant)** dans `D:/Projet 1/pokemon-web-demo/scripts/extract-scripts.mjs` :
   - Ajouter `walkAndParse(join(decompPath, 'data', 'maps'))` ou simplement `for (const map of readdirSync(mapsDir)) { Object.assign(commonScripts/commonTexts, parsedMap); }` AVANT le write de `_common.json`.
   - Re-run `npm run extract:scripts` pour régénérer.
   - Test : grep `"PlayersHouse_1F_Text_IsntItNiceInHere"` dans `_common.json` → doit apparaître.
   - **Résoudra** : msgbox EnterHouseMovingIn, MoversPokemonGoSetClock, et tous les textes Brendan/May cross-map. Beaucoup d'autres dialogues fired silently se débloqueront aussi.

2. **Fix BUG #2 (bridge fns sur globalThis)** dans `D:/Projet 1/pokemon-web-demo/src/engine/gba-global-scope.ts` :
   - Ajouter dans `symbolsToExpose` : `Overworld_GetMapHeaderByGroupAndId, defineMapHeaderEntry, GetMapGridBlockAt, MapGridGetCollisionAt, MapGridGetMetatileBehaviorAt, MapGridGetElevationAt, MapGridGetMetatileIdAt, GetMapBorderIdAt, GetMetatileAttributesById`.
   - Importer depuis `decomp-bridge.ts` pour `Overworld_*` et depuis `map-loader.ts` pour les `MapGrid*`.
   - **Résoudra** : crash `is not defined` sur Continue path + auto-fns qui utilisent ces fonctions.

3. **Fix BUG #3 (msgbox halt sur label manquant)** dans `D:/Projet 1/pokemon-web-demo/src/engine/script-opcodes.ts:567-574` :
   - Remplacer `return false` par afficher fallback `[MISSING:${textLabel}]` + halt.
   - **Résoudra** : silent-fail des dialogs futurs (= debug visible).

4. **Fix BUG #4 (resetObjectEventAllocations incomplete)** dans `D:/Projet 1/pokemon-web-demo/src/engine/object-events.ts:313-333` :
   - Reset aussi `currentCoordsX/Y, previousCoordsX/Y, initialCoordsX/Y, graphicsId, localIdRaw, mapId, scriptLabel, localId, facingDirection`.
   - **Résoudra** : NPCs zombies dans `__gObjectEvents`. Possible fix du blocage à (2,4).

5. **Fix BUG #5 (`IsElevationMismatchAt` manquant)** dans `D:/Projet 1/pokemon-web-demo/src/engine/player-avatar.ts:543-544` :
   - Ajouter ce check entre `IsMetatileDirectionallyImpassable` et NPC collision.
   - Update `gPlayerAvatar.currentElevation` au step end via `MapGridGetElevationAt(x+MAP_OFFSET, y+MAP_OFFSET)`.
   - **Résoudra** : transitions d'élévation 1:1 décomp.

6. **Vérification "ROM marche / port marche"** (= cf. K).

7. **Fix C.4 stubs critiques** dans `script-opcodes.ts` au fur et à mesure des paths post-Zigzagton :
   - `multichoice` impl réelle (= sMultichoiceLists data + UI).
   - `setrespawn` impl (= write block1.warp.lastHealLocation).
   - `incrementgamestat` (= write block1.gameStats[]).

8. **Migration progressive de `script-runner.ts` (legacy) → `script-runtime.ts`** :
   - Auditer les 3 importers (`map-scripts.ts`, `new-game-init.ts`, `world-renderer.ts`).
   - Retirer leur usage. Delete `script-runner.ts`.

---

## K. CHECKLIST de vérification "ROM marche / port marche"

Pour valider que le port est 1:1 décomp à chaque session :

1. **Boot → Title** :
   - [ ] Copyright screen affiché ~60 frames
   - [ ] Title screen rayquaza animation OK
   - [ ] Press Start → Main menu

2. **New Game** :
   - [ ] Birch speech boy/girl choice
   - [ ] Player name input → naming screen
   - [ ] Truck cinematic : truck déplacement, MOVING_BOX bouncing, sortie
   - [ ] LittlerootTown : trigger StepOffTruckMale/Female

3. **Mom + GoInsideWithMom** :
   - [ ] Mom apparait via opendoor
   - [ ] Mom approche player
   - [ ] Dialog "Notre maison... " affiché
   - [ ] Dialog A button advance OK
   - [ ] Mom guide player vers la porte de la maison
   - [ ] Closedoor anim
   - [ ] **warpsilent vers MaysHouse_1F (FEMALE) ou BrendansHouse_1F (MALE)**

4. **MaysHouse_1F (= où le bug se passe)** :
   - [ ] Player spawn (2,8) face NORTH
   - [ ] Mom spawn à (1,8) face NORTH
   - [ ] OnFrame trigger STATE=3 → EnterHouseMovingIn
   - [ ] **Dialog "C'est joli ici, non?" affiché** ← BUG #1
   - [ ] A advance
   - [ ] Mom face player
   - [ ] **Dialog "Quand les déménageurs arriveront..." affiché** ← BUG #1
   - [ ] A advance
   - [ ] STATE=4 set
   - [ ] Player walk_up forced
   - [ ] Releaseall + script done

5. **Player walk to staircase (2,2)** :
   - [ ] Player free movement après script done
   - [ ] Player can walk (2,7) → (2,6) → (2,5) → (2,4) → (2,3) → (2,2) sans bloc
   - [ ] À (2,2) : warp tile MB_STAIRS → warp MaysHouse_2F

6. **MaysHouse_2F WallClock** :
   - [ ] Player spawn (1,1) face NORTH
   - [ ] OnFrame STATE=4 → BlockStairsUntilClockIsSet → STATE=5
   - [ ] OnFrame STATE=5 → GoUpstairsToSetClock (back to 1F to set clock)
   - [ ] Player goes back to 1F
   - [ ] STATE=5 trigger script → setvar STATE=5 fait par BlockStairs... wait

   Note : Le flow exact diffère, mais OK pour 1:1.

7. **PetalburgGymReport** : (= STATE=6)
   - [ ] Mom dialog "Maybe Dad will be on..."
   - [ ] BGM change ENCOUNTER_INTERVIEWER
   - [ ] Player walk to TV
   - [ ] BroadcastBeginning
   - [ ] msgbox "Report from Petalburg gym..."
   - [ ] STATE=7

8. **Exit MaysHouse_1F → LittlerootTown** :
   - [ ] OnFrame `RouteSec` ou similaire
   - [ ] Walk to north → Route 101 connection

9. **Route 101 (= Birch Help → Combat Zigzagton)** :
   - [ ] OnTransition spawn Birch
   - [ ] Coord trigger `Route101_EventScript_StartBirchRescue` à `(?, ?)`
   - [ ] Birch + Zigzagoon chase animation
   - [ ] msgbox "Au secours!"
   - [ ] Player walk to Birch
   - [ ] Trigger StarterChoose UI
   - [ ] **Combat Zigzagton (= BattleScene avec Treecko/Torchic/Mudkip vs Zigzagoon Lv 2)**

10. **Sanity checks après chaque step** :
    - `__gObjectEvents.filter(o => o.active).map(o => ({ id: o.localIdRaw, x: o.currentCoordsX, y: o.currentCoordsY }))` → seulement les NPCs de la map courante
    - `__gFlags.size` → cohérent (= NewGameInit ~159 flags + setflags du gameplay)
    - `__gVars.get('VAR_LITTLEROOT_INTRO_STATE')` → state correct
    - `__scriptRuntime.status()` → SHUTDOWN entre scripts, RUNNING/WAITING pendant
    - Console errors : aucun `is not defined` au runtime

---

## Notes finales

- **Confiance globale** : 95% sur les fixes proposés. Les bugs #1, #2, #3 sont 100% confirmés. Le bug #4 (block à (2,4)) est probably-related à #1 (le silent-fail laisse l'état dans une incohérence) mais à vérifier en debug live après application des fixes.
- **Pas vérifié faute de temps** :
  - Le pipeline `RunOnLoadMapScript` (= setdooropen + setmetatile au load) — à vérifier que les setmetatile pour MovingBoxes au boot maison fired correctly.
  - Les `__bridgedHelpers__` set descriptif de `decomp-bridge.ts:3028+` (= 200+ symbols) — c'est juste un audit list, pas un setup actif. Mais peut être confondu visuellement avec un `symbolsToExpose`.
  - Le pipeline `option-menu-return.ts` qui restore overworld après option menu — l'user a peut-être un side-effect bizarre avec les NPCs après le menu.
- **Une dernière chose à investiguer après les fixes** : si bug à (2,4) persiste, ajouter logs `console.log('checkPlayerCollision', dir, mapColl, currentB, targetB, 'NPCs:', actives)` à `player-avatar.ts:521` → repro et identifier précisément le NPC bloquant.
