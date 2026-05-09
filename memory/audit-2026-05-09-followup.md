# Audit follow-up — Pokemon Emerald port deep dive 2

Date : 2026-05-09
Scope : 5 issues from `audit-2026-05-09-start-of-game-deep.md` resolved or pinpointed
References : `D:/Projet 1/decomps/pokeemeraude` (decomp source) + `D:/Projet 1/pokemon-web-demo` (port)

---

## Issue 1 — Dad never appears (P4)

### Decomp truth

`FLAG_HIDE_PLAYERS_HOUSE_DAD` (0x2DE = 734) gates Dad in BOTH BrendansHouse and MaysHouse.

| Action | File | Line | Note |
|---|---|---|---|
| SET (= hide) | `data/scripts/new_game.inc` | 154 | New game init — runs `EventScript_ResetAllMapFlags` |
| CLEAR (= reveal) | `data/scripts/hall_of_fame.inc` | 46 | `EventScript_ReadyReceiveSSTicketEvent` — runs ONLY post-Champion (= entered Hall of Fame) |
| Map gate | `data/maps/LittlerootTown_BrendansHouse_1F/map.json` | 83 | `LOCALID_PLAYERS_HOUSE_1F_DAD` at (5, 6), `OBJ_EVENT_GFX_NORMAN` |

Decomp reveal scope (lines 43-47 of hall_of_fame.inc) :
```
EverGrandeCity_HallOfFame_EventScript_ReadyReceiveSSTicketEvent::
    setvar VAR_LITTLEROOT_HOUSES_STATE_MAY, 3
    setvar VAR_LITTLEROOT_HOUSES_STATE_BRENDAN, 3
    clearflag FLAG_HIDE_PLAYERS_HOUSE_DAD
    return
```

### Conclusion

Dad is **intentionally hidden** until post-Champion. The original audit mistake : suggested Dad shows after gym-ready. He does NOT appear during the early intro at all in the canonical decomp flow.

### Our port state

`src/engine/new-game-flags.ts:66` correctly includes `FLAG_HIDE_PLAYERS_HOUSE_DAD` in `NEW_GAME_HIDE_FLAGS`. Nothing to fix — this is canonical behavior.

### Optional dev shortcut

If we want Dad visible in the demo BEFORE Hall of Fame for testing the PetalburgGymReport scene fully :
- Add `gameState.clearFlag('FLAG_HIDE_PLAYERS_HOUSE_DAD')` to `applyNoIntroPreset()` in `src/engine/boot-mode.ts:127`. Demo-only ; do NOT clear this in production new-game flow.

---

## Issue 2 — gameState.reset() flag wipe verification

### Implementation chain

`gameState.reset()` (game-state.ts:53) → `ResetSaveBlocks()` (save-system.ts:255) :
```ts
sCurrentBlock2 = emptySaveBlock2();
sCurrentBlock1 = emptySaveBlock1(emptyBag());
sSaveCounter = 0;
sLastSavedSlot = -1;
sSaveFileStatus = SAVE_STATUS_EMPTY;
```

`emptySaveBlock1()` (save-blocks.ts:236) :
```ts
flags: {},
vars: {},
playerParty: [],
__objectPositions removed (= field omitted from the new object literal)
__takenItemBalls removed (= field omitted)
```

### Result

**CONFIRMED CLEAN**. `reset()` allocates fresh empty objects for `flags` and `vars` (= no carry-over from previous gender/intro state). `?nointro` MALE → `?nointro` FEMALE switch is fully wiped by `gameState.reset()` at line 99 of `boot-mode.ts:applyNoIntroPreset` before the new gender preset begins.

The previously-suspected leak is NOT present. Note that `__objectPositions` and `__takenItemBalls` are NOT initialized in `emptySaveBlock1` — they are lazily-created on first use via the type cast pattern (`block1 as { __objectPositions?: ... }`), so reset always omits them = effectively cleared.

---

## Issue 3 — Mom position OnTransition dispatch at INTRO_STATE=7

### Decomp _OnTransition table (BrendansHouse_1F/scripts.inc:26-30)

```
LittlerootTown_BrendansHouse_1F_OnTransition:
    call_if_eq VAR_LITTLEROOT_INTRO_STATE, 3, ..._MoveMomToDoor
    call_if_eq VAR_LITTLEROOT_INTRO_STATE, 5, ..._MoveMomToStairs
    call_if_eq VAR_LITTLEROOT_INTRO_STATE, 6, ..._MoveMomToTV
    end
```

### Where Mom should be at INTRO_STATE=7

**At STATE=7, NO `_OnTransition` branch fires for Mom.** Decomp behavior : Mom remains where the LAST `setobjectxyperm` placed her (= persisted in `gObjectEventTemplates`). At STATE=7, that was MoveMomToTV (state 6, before transitioning to 7) :
- x=4, y=5, MOVEMENT_TYPE_FACE_UP (= scripts.inc:37-40)

State 7 is set by `PlayersHouse_1F_EventScript_SetWatchedBroadcast` (players_house.inc:140-143) AFTER state 6 ran, so `setobjectxyperm` at (4, 5, FACE_UP) persists.

Map.json default Mom spawn (= no override) : (2, 6) facing RIGHT. So if our port's `?nointro` STATE=7 spawns Mom at default (2, 6) instead of (4, 5), it means our `setobjectxyperm` overlay is NOT being persisted across `?nointro` boot.

### Our port flow

`src/engine/script-runtime.ts:508` `RunOnTransitionMapScript` correctly dispatches via `findMapScriptLabel`. `src/scenes/TestOverworldScene.ts:577` calls it BEFORE spawning NPCs — order is correct.

`src/engine/script-opcodes.ts:1068` `setobjectxyperm` correctly writes to BOTH `gMapHeader.events.objectEvents[].x/y` (= template) AND active NPC.

### Root cause

At `?nointro` STATE=7, the `_OnTransition` script has NO branch that fires (state 7 not handled). The template stays at the map.json default = (2, 6) FACE_RIGHT. The MoveMomToTV state was never executed because the player never went through state 6 in `?nointro`.

### Fix

Add MoveMomToTV-equivalent setobjectxyperm to `applyNoIntroPreset` after `gameState.setVar('VAR_LITTLEROOT_INTRO_STATE', 7)`. In `src/engine/boot-mode.ts` after line 124 :

```ts
// At INTRO_STATE=7 (= post-PetalburgGymReport), Mom's _OnTransition has no
// branch ; she should be at MoveMomToTV position (= last persisted from state 6).
// 1:1 décomp BrendansHouse_1F_EventScript_MoveMomToTV (scripts.inc:37-40) :
//   setobjectxyperm LOCALID_PLAYERS_HOUSE_1F_MOM, 4, 5
//   setobjectmovementtype LOCALID_PLAYERS_HOUSE_1F_MOM, MOVEMENT_TYPE_FACE_UP
const playerHouseMap = gameState.gender === 'FEMALE'
  ? 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F'
  : 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F';
gameState.setObjectXY(playerHouseMap, 'LOCALID_PLAYERS_HOUSE_1F_MOM', 4, 5);
// Note : `setObjectXY` only writes position. movementType remains FACE_RIGHT
// from map.json default. To persist movementType too, you need a parallel
// `setObjectMovementType` API on gameState (currently absent — see follow-up).
```

### Follow-up

`gameState.setObjectXY` exists (game-state.ts:190) but writes only x/y. There is no `setObjectMovementType` overlay equivalent. The `setobjectmovementtype` opcode persists movementType to `gMapHeader.events.objectEvents[].movementTypeRaw` (= live template), which is ephemeral — wiped on every map reload from `loadMapHeader`. To preserve movementType across `?nointro` reload, add a parallel `__objectMovementTypes` overlay in SaveBlock1 + read it in npc-loader.ts. Track this as a separate task (= not blocking this audit).

---

## Issue 4 — Truck flag asymmetry (P3)

### Decomp behavior

Re-read `data/maps/InsideOfTruck/scripts.inc:24-48` carefully :

```
InsideOfTruck_EventScript_SetIntroFlagsMale::
    ...
    setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK    @ line 28 — hide RIVAL'S truck (= the OTHER house)
    ...

InsideOfTruck_EventScript_SetIntroFlagsFemale::
    ...
    setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK @ line 41 — hide RIVAL'S truck
    ...
```

**Player's own truck** is hidden later by `LittlerootTown_EventScript_StepOffTruckMale/Female` :
- Male : `setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK` (LittlerootTown/scripts.inc:115)
- Female : `setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK` (LittlerootTown/scripts.inc:126)

So in canonical post-intro state, BOTH trucks are hidden. The asymmetry was that they're set at different phases.

### Our port

`src/engine/boot-mode.ts:132-133` sets BOTH `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK` and `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK` unconditionally for `?nointro`.

### Verdict

**This is correct for `?nointro` (= post-intro state).** The two-phase decomp split is purely procedural — both trucks end up hidden by the time INTRO_STATE reaches 3. Our `?nointro` jumps to STATE=7 (= much later), so both trucks must be hidden. Setting both unconditionally is the right choice.

For `?truck` mode (boot-mode.ts:199-213) : `gameState.reset()` is called, then NewGameInit runs, then truck cinematic spawns at MAP_INSIDE_OF_TRUCK. The trigger `SetIntroFlagsMale/Female` will fire normally when the player steps on the trigger. **No fix needed for ?truck either** — flags will be set canonically during the cinematic.

### Optional cleanup

For 1:1 fidelity with `?nointro` flow, you could reorganize the flag-set calls to mirror decomp's two phases. Currently both go in one block. Not a bug but a documentation improvement. Not recommended — current code is clearer.

---

## Issue 5 — Futureproof tooling for register-pattern dupes

### Audit results (= ran inline via temp script)

| File | Pattern | Total | Duplicates |
|---|---|---|---|
| `src/engine/script-opcodes.ts` | `registerOpcode` | 287 | 0 |
| `src/engine/script-runtime.ts` | `registerOpcode` | 0 | n/a |
| `src/engine/specials-registry.ts` | `registerSpecial` | 130 | 0 |
| Cross-file | `registerOpcode` | — | 0 |

**No duplicate registrations** in either registry. Existing `audit-special-dupes.mjs` covers specials ; no equivalent existed for opcodes.

### Other registries to monitor

| Registry | File | Mechanism | Audit needed |
|---|---|---|---|
| Object event anims | `object-event-graphics.ts:155,159` | `Map.set` (= last write wins) | Yes, low risk (= map keyed on label like `sAnim_StandardSouth`) |
| Trainer pics | `trainer-pic-graphics.ts:52` | `Map.set` × 2 (picId + picName) | Yes, picId collisions would be silent |
| Affine anims | `decomp-impls/sprite-affine-extras.ts:40,44` | `Map.set` | Yes, low priority (= small registry) |
| `_scriptsByLabel` (= map scripts) | `script-runtime.ts:200` | `Map.set` per map load | NO — wiped on every `loadMapScripts` (line 181), no leak |
| `_specialHandlers` | `script-opcodes.ts:849` | `Record key set` (= last write wins) | Already covered by `audit-special-dupes.mjs` |
| Movement actions | `movement-system.ts` | TS table | Static, no runtime register |

### New audit tooling proposed

Create `scripts/audit-registry-dupes.mjs` that scans :
- `registerOpcode` in `src/engine/script-opcodes.ts` and `src/engine/script-runtime.ts`
- `registerAnim` and `registerAnimTable` in `src/engine/object-event-graphics.ts`
- `registerTrainerPic` in `src/engine/trainer-pic-graphics.ts`
- `registerAffineAnim` and `registerAffineAnimTable` in `src/engine/decomp-impls/sprite-affine-extras.ts`

Output : list of duplicate keys per registry. Run pre-commit or as part of CI build.

Concrete content (roughly 30 lines) :

```js
import { readFileSync } from 'fs';

const targets = [
  { file: 'src/engine/script-opcodes.ts',                       fn: 'registerOpcode' },
  { file: 'src/engine/script-runtime.ts',                       fn: 'registerOpcode' },
  { file: 'src/engine/specials-registry.ts',                    fn: 'registerSpecial' },
  { file: 'src/engine/object-event-graphics.ts',                fn: 'registerAnim' },
  { file: 'src/engine/object-event-graphics.ts',                fn: 'registerAnimTable' },
  { file: 'src/engine/trainer-pic-graphics.ts',                 fn: 'registerTrainerPic' },
  { file: 'src/engine/decomp-impls/sprite-affine-extras.ts',    fn: 'registerAffineAnim' },
  { file: 'src/engine/decomp-impls/sprite-affine-extras.ts',    fn: 'registerAffineAnimTable' },
];

let any = false;
for (const t of targets) {
  const src = readFileSync(t.file, 'utf8');
  const re = new RegExp(`${t.fn}\\(\\s*['"]([^'"]+)['"]`, 'g');
  const seen = new Map();
  let m;
  while ((m = re.exec(src))) seen.set(m[1], (seen.get(m[1]) || 0) + 1);
  const dups = [...seen.entries()].filter(([_k, v]) => v > 1);
  if (dups.length > 0) {
    any = true;
    console.error(`[DUPE] ${t.file} :: ${t.fn} →`, dups);
  }
}
if (!any) console.log('All registries clean.');
process.exit(any ? 1 : 0);
```

---

## Summary of fixes

| Issue | Status | Action |
|---|---|---|
| 1. Dad never appears | Canonical, not a bug | Optional `?nointro` clearflag for demo only |
| 2. gameState.reset() | Confirmed clean | None |
| 3. Mom OnTransition at STATE=7 | Real gap | Add `setObjectXY(MAP, MOM, 4, 5)` in `applyNoIntroPreset` |
| 4. Truck flags | Canonical for `?nointro` | None |
| 5. Registry dupes audit | No dupes found | Add `audit-registry-dupes.mjs` futureproof tool |
