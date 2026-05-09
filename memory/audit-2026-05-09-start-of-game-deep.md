# Audit start-of-game flow — 2026-05-09

Source décomp : `D:/Projet 1/decomps/pokeemeraude/`
Notre port    : `D:/Projet 1/pokemon-web-demo/`

User report : (1) Both Brendan's and May's houses still trigger the same events. (2) Warps to houses still wrong. (3) Flag fixes in `boot-mode.ts:applyNoIntroPreset` have not stopped the visible regression.

---

## A) Flag setup at game start

### Decomp expected — `data/maps/InsideOfTruck/scripts.inc:24-48`

`InsideOfTruck_EventScript_SetIntroFlagsMale` (lines 24-35) sets, in order :
1. `setrespawn HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F`
2. `setvar VAR_LITTLEROOT_INTRO_STATE, 1`
3. `setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MOM`
4. `setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK`
5. `setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_MOM`
6. `setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_SIBLING`
7. `setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL`
8. `setvar VAR_LITTLEROOT_HOUSES_STATE_BRENDAN, 1`
9. `setdynamicwarp MAP_LITTLEROOT_TOWN, 3, 10`

Female (lines 37-48) is the symmetric (= MALE/FEMALE swap), with `setdynamicwarp MAP_LITTLEROOT_TOWN, 12, 10`.

### Our port actual — `src/engine/boot-mode.ts:137-151`

- ✓ `FLAG_HIDE_LITTLEROOT_TOWN_*_MOM` symmetric pair set
- ✓ `FLAG_HIDE_LITTLEROOT_TOWN_*_RIVAL_MOM` symmetric pair set
- ✓ `FLAG_HIDE_LITTLEROOT_TOWN_*_RIVAL_SIBLING` symmetric pair set
- ✓ `FLAG_HIDE_LITTLEROOT_TOWN_*_2F_POKE_BALL` symmetric pair set
- ✓ Both `FLAG_HIDE_LITTLEROOT_TOWN_*_TRUCK` flags set (lines 127-128, gender-agnostic — OK)
- ✓ `VAR_LITTLEROOT_HOUSES_STATE_BRENDAN/MAY` set to 1 per gender
- ⚠️ `VAR_LITTLEROOT_INTRO_STATE = 6` (line 119) — *intentional*, but bypasses several state-3/4/5 OnTransition setobjectxyperm calls (= Mom never gets repositioned to TV at xy=4,5 or 6,5). Mom stays at her template spawn position (`x=2,y=6` Brendan / `x=8,y=6` May).
- ⚠️ No `setrespawn` equivalent — fine for MVP, no PC heal yet.

### ⚠️ Critical issues — section A

- **A.1** Decomp's MALE branch sets `MAYS_HOUSE_TRUCK` and FEMALE sets `BRENDANS_HOUSE_TRUCK`. Our port sets BOTH unconditionally. Harmless visually post-intro (= both trucks gone) but **diverges from decomp 1:1**.
- **A.2** No issue actually with HOUSES_STATE assignment. **MALE → STATE_BRENDAN=1**, **FEMALE → STATE_MAY=1**, matches decomp scripts.inc line 32 vs 45.

---

## B) Warp handling

### Decomp expected — `data/maps/LittlerootTown/map.json:132-153`

`warp_events[]` array (= 0-indexed) :
- `warps[0]` = (14, 8) → `MAYS_HOUSE_1F` warp_id=`"1"`
- `warps[1]` = (5, 8)  → `BRENDANS_HOUSE_1F` warp_id=`"1"`
- `warps[2]` = (7, 16) → `BIRCHS_LAB` warp_id=`"0"`

`BrendansHouse_1F` warps :
- `warps[0]` = (9, 8) → `LITTLEROOT_TOWN` warp_id=`"1"` (= back to Brendan front door)
- `warps[1]` = (8, 8) → `LITTLEROOT_TOWN` warp_id=`"1"` (= same destination, second tile)
- `warps[2]` = (8, 2) → `BRENDANS_HOUSE_2F` warp_id=`"0"`

`MaysHouse_1F` warps :
- `warps[0]` = (1, 8) → `LITTLEROOT_TOWN` warp_id=`"0"` (= back to May front door)
- `warps[1]` = (2, 8) → `LITTLEROOT_TOWN` warp_id=`"0"`
- `warps[2]` = (2, 2) → `MAYS_HOUSE_2F` warp_id=`"0"`

### Our port actual

- `public/decomp/em/maps/LittlerootTown_BrendansHouse_1F.json` is **identical** to decomp (= 1:1 extracted, vu via `grep dest_warp_id` lignes 119, 126, 133).
- `dest_warp_id` est typé **`number`** dans `map-loader.ts:500` mais le JSON sérialise `"1"` (= string). À l'exécution `warpId: w.dest_warp_id` (line 539) stocke la string telle quelle. La fonction `getPlayerCoordsFromWarp` (warp-system.ts:215) compare `(destWarpId >= 0 && destWarpId < warps.length)` — fonctionne en JS par coercion implicite (`"1" >= 0 === true`, `"1" < 3 === true`, `warps["1"] === warps[1]`).
- ⚠️ **B.1** : `warpId` reste typé `number` dans l'interface `WarpEvent` mais contient une string au runtime — bombe à retardement. Si quelqu'un fait `destWarpId + 1` → `"11"` au lieu de `2`. À fixer en `parseInt` dans `map-loader.ts:539`.
- ✓ **B.2** : la sémantique 0-indexed est respectée. Le warp opcode `warp MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F, 7, 1` (scripts.inc:64) utilise des coords explicites — pas de conflict.

### ⚠️ Critical issues — section B

- **Pas de bug warp confirmé**. Les `dest_warp_id: "1"` du décomp pointent bien vers le warp 1 (= `(5,8)` Brendan front door), pas le warp 0. La JSON conversion préserve les indices.
- ⚠️ **B.3 — boot spawn (= `boot-mode.ts:178`)** : `?nointro` spawn force `(5, 9)` MALE comme FEMALE. **C'est faux pour FEMALE qui devrait spawn à `(14, 9)` ou similaire devant May's house**. Le user joue les deux genres dans le même `?nointro` URL — résultat : la fille spawn devant la maison du mec. **Cause probable du report "warps wrong"**.

---

## C) House layout / object_events flag system

### Decomp expected — `data/maps/LittlerootTown_BrendansHouse_1F/map.json:16-111`

Brendan's house template (= 7 object_events) :
| local_id | sprite | flag | visible MALE | visible FEMALE |
|---|---|---|---|---|
| `LOCALID_PLAYERS_HOUSE_1F_MOM` | OBJ_EVENT_GFX_MOM | `FLAG_HIDE_..._BRENDANS_HOUSE_MOM` | ✓ (flag clear) | ✗ (flag set) |
| `LOCALID_RIVALS_HOUSE_1F_MOM` | OBJ_EVENT_GFX_WOMAN_4 | `FLAG_HIDE_..._BRENDANS_HOUSE_RIVAL_MOM` | ✗ (flag set) | ✓ |
| (sibling) | OBJ_EVENT_GFX_NINJA_BOY | `FLAG_HIDE_..._BRENDANS_HOUSE_RIVAL_SIBLING` | ✗ | ✓ |
| `LOCALID_PLAYERS_HOUSE_1F_DAD` | OBJ_EVENT_GFX_NORMAN | `FLAG_HIDE_PLAYERS_HOUSE_DAD` | ✗ early | ✗ early |
| `LOCALID_RIVALS_HOUSE_1F_RIVAL` | OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL | `FLAG_HIDE_..._BRENDANS_HOUSE_BRENDAN` | always hidden by `NEW_GAME_HIDE_FLAGS[34]` | always hidden |
| (vigoroth1, vigoroth2) | déménageurs | `FLAG_HIDE_..._VIGOROTH_*` | hidden post-intro | hidden post-intro |

May's house — symmetric, sprite `RIVAL_MAY_NORMAL` instead of Brendan, flags suffixed `MAYS_HOUSE`.

### Our port actual — `src/engine/object-events.ts:985`

```ts
if (template.flagId && template.flagId !== '0' && FlagGet(template.flagId)) {
  return false;
}
```

✓ Spawn-time skip per-flag — correct. Each map has its OWN `BRENDANS_HOUSE` vs `MAYS_HOUSE` namespaced flag, so the gating is independent.

### ⚠️ Critical issues — section C

- ⚠️ **C.1 — REAL BUG `?nointro` for FEMALE doesn't reset MALE state from previous run**. `applyNoIntroPreset` calls `gameState.reset()` then re-runs `NewGameInit()`. But `NewGameInit` doesn't clear flags, only sets the 159 hide flags (= adds them to the set). **However `gameState.reset()` SHOULD wipe the flag store**. Need to confirm `gameState.reset()` empties `data.flags`. If a user toggles `?nointro` MALE → FEMALE between sessions, flags from the MALE preset (`HIDE_BRENDANS_HOUSE_RIVAL_MOM`) might persist if reset is incomplete.
- ⚠️ **C.2 — DAD never visible**. `FLAG_HIDE_PLAYERS_HOUSE_DAD` is in `NEW_GAME_HIDE_FLAGS` (= line 65 of new-game-flags.ts). The decomp normally CLEARS this flag in `LittlerootTown_EventScript_DadShowsUp` after `VAR_LITTLEROOT_TOWN_STATE` advances to gym-ready. Currently we never clear it → Dad invisible forever, doors lead to PetalburgGymReport script which expects Dad. **Not the user's reported bug**, but a pending gap.

---

## D) Door open/close + waitdooranim

### Decomp expected — `src/scripts/players_house.c` doesn't exist; logic lives in
`data/scripts/players_house.inc` and `scrcmd.c::ScrCmd_opendoor`.

ScrCmd_opendoor flow :
```
PlaySE(GetDoorSoundEffect(x, y))
FieldAnimateDoorOpen(x, y)
return FALSE   // continue script tick
```

`waitdooranim` then halts via `SetupNativeScript(IsDoorAnimationStopped)`.

### Our port actual — `src/engine/script-opcodes.ts:1277-1321`

- ✓ `opendoor` correctly imports `field-door`, calls `GetDoorSoundEffect` + `FieldAnimateDoorOpen`, sets `_doorAnimActive` flag.
- ✓ `waitdooranim` polls `!_doorAnimActive` via `SetupNativeScript`.
- ✓ Hotfix lines 1548-1554 removed the no-op stub overrides that previously masked the real implementations.

### ⚠️ Critical issues — section D

- **No issue**. Door anim plumbing 1:1 OK. The hotfix in lines 1277/1296/1313 looks correct.

---

## E) VAR_LITTLEROOT_INTRO_STATE / VAR_LITTLEROOT_HOUSES_STATE_*

### Decomp expected — what each VAR controls

`VAR_LITTLEROOT_INTRO_STATE` progression (= state machine) :
- 0 = pre-intro (default)
- 1 = MALE truck arrival, set by `SetIntroFlagsMale`
- 2 = FEMALE truck arrival, set by `SetIntroFlagsFemale`
- 3 = `LittlerootTown_EventScript_GoInsideWithMom` mom-walks-into-house (= scripts.inc:158, sets state=3 after warp into house)
- 4 = After `EnterHouseMovingIn` (`players_house.inc:13`) — gates `GoSeeRoom` coord trigger at house entrance
- 5 = After 2F clock unset (`players_house.inc:2`)
- 6 = After clock set (`players_house.inc:60`) — gates `PetalburgGymReport`
- 7 = After PetalburgGymReport (`players_house.inc:141`) — disables retrigger

`VAR_LITTLEROOT_HOUSES_STATE_BRENDAN` :
- 0 = default
- 1 = MALE-set in `SetIntroFlagsMale` line 32 → Brendan visiting May's house triggers `YoureNewNeighbor` (= MAYS_HOUSE OnFrame entry line 52, `map_script_2 VAR_LITTLEROOT_HOUSES_STATE_BRENDAN, 1, ...YoureNewNeighbor`)
- 2 = After meeting May's mom — disables retrigger

`VAR_LITTLEROOT_HOUSES_STATE_MAY` : symmetric (1 for FEMALE after truck, 2 after MEETING Brendan's mom).

### Our port actual

- `applyNoIntroPreset` sets `INTRO_STATE=6` and either `HOUSES_STATE_BRENDAN=1` (MALE) or `HOUSES_STATE_MAY=1` (FEMALE) — matches decomp **for that one MALE/FEMALE branch** but **starts the player at state 6 = post-intro**, while the decomp's natural flow goes 1→3→4→5→6→7.
- ⚠️ **E.1 — START STATE == 6 + HOUSES_STATE_*=1 = double-trigger trap**. With INTRO_STATE=6, walking into Brendan's house fires `PetalburgGymReport` (OnFrame line 52: `map_script_2 VAR_LITTLEROOT_INTRO_STATE, 6, ...PetalburgGymReport`). With HOUSES_STATE_MAY=1 (set when player is FEMALE), entering Brendan's house ALSO fires `YoureNewNeighbor` (line 53). **Two scripts fire at the same coord-trigger frame.** OnFrame iteration is "first match wins" per script-runtime.ts:527 (`for ... return TRUE on first match`), so PetalburgGymReport runs and YoureNewNeighbor is silenced — but the *next* frame after PetalburgGymReport advances INTRO_STATE to 7, the YoureNewNeighbor entry is now uniquely matchable → fires next frame inside the same scene. **Likely the user's "both houses trigger same events" bug**.
- ⚠️ **E.2 — Mom positions never reset**. With INTRO_STATE=6, the OnTransition `MoveMomToTV` should run (= scripts.inc:29 `call_if_eq VAR_LITTLEROOT_INTRO_STATE, 6, ..._MoveMomToTV`). Verify the OnTransition opcode dispatch fires correctly. Looking at `script-runtime.ts:508-516`, `RunOnTransitionMapScript` is called from `TestOverworldScene.ts:577`. Should work.
- ⚠️ **E.3 — STATE_BRENDAN=1 vs STATE_MAY=1 cross-contamination across saves**. Same as C.1, if user toggled gender between sessions and `gameState.reset()` is incomplete.

---

## Final priority list — most likely causes of the user's reports

### ⚠️ P0 — `?nointro` spawn coord is gender-blind
File : `boot-mode.ts:178`
Fix : Branch on `gameState.gender`, spawn at `(5, 9)` MALE or `(14, 9)` FEMALE.
This is the most likely cause of "warps wrong : entering Brendan goes wrong place" — the FEMALE player is dropped onto BRENDAN's front door tile, walks into Brendan's house, sees Brendan's family. Looks like "May's family is in Brendan's house" but actually it's that FEMALE entered the wrong house.

### ⚠️ P1 — INTRO_STATE=6 + HOUSES_STATE_*=1 cause cascading triggers
File : `boot-mode.ts:119,143,150`
Fix : Either drop INTRO_STATE down to 7 (= post-PetalburgGymReport, no more OnFrame triggers), OR clear `VAR_LITTLEROOT_HOUSES_STATE_*` if `INTRO_STATE >= 6` to mimic the decomp end-state where the cross-house meeting has already happened.
This is the most likely cause of "Both houses trigger same events" — the user spawns post-intro but the script still has scripted state machine entries pending.

### ⚠️ P2 — `dest_warp_id` typed `number` but stored as string
File : `map-loader.ts:500,539`
Fix : `warpId: parseInt(w.dest_warp_id as unknown as string, 10)` to match the type.
Not a confirmed visible bug, but a latent landmine. JS `>=` coercion saves us today; tomorrow's `+1` arithmetic breaks it.

### P3 — Decomp truck flag asymmetry
File : `boot-mode.ts:127-128`
Cosmetic 1:1 deviation. Currently sets BOTH trucks regardless of gender. Decomp sets only the cross-gender one. Behavior identical post-intro (= both trucks gone either way).

### P4 — Dad never appears
File : `new-game-flags.ts:65`
Add a clearflag step gated by `VAR_LITTLEROOT_TOWN_STATE` advancement. Not user-reported but pending scenario gap.

---

## Next-step recommended fix order

1. Patch `boot-mode.ts:172-178` (`decideBootMode`) to spawn at `(14, 9)` if `gameState.gender === 'FEMALE'`.
2. Patch `applyNoIntroPreset` to set `VAR_LITTLEROOT_INTRO_STATE = 7` instead of 6, AND clear `VAR_LITTLEROOT_HOUSES_STATE_*` to 2 (= "already met") to disable the OnFrame triggers for `YoureNewNeighbor`.
3. Verify with the dev devtools `dev.audit.flagDump()` after `?nointro` MALE then `?nointro` FEMALE that the flag set is symmetric (= no leakage from previous session).
4. Type-fix `map-loader.ts:539` `parseInt(w.dest_warp_id, 10)`.
