# Branch upd2 — Module activation progress

Date : 2026-05-09 (= continuation of session 124)
Branch : `upd2` (= 4 commits depuis main, NE PAS push)

## Commits

| Hash | Phase | Description |
|---|---|---|
| `4dfe46f1` | 5.3a | Bridge runtime wrappers + 140 MB_* + 13 metatile predicates |
| `983688a2` | 5.3b | movement-action-dispatch + libc bridge + body-scan inject fix |
| `03557b56` | 5.3c | Wire auto-dispatch fallback into movement-system._tickAction |
| `1465da35` | 5.3d | Extract static const tables (3090) + manual ports |

## État infrastructure

| Item | Status |
|---|---|
| `src/engine/decomp-bridge.ts` | **486 exports** (+155 vs Phase 5) |
| `src/engine/static-data-tables.ts` | 25+ tables portées manuellement |
| `src/engine/movement-action-dispatch.ts` | 154/159 actions auto-bridgées |
| `scripts/extract-static-data-tables.mjs` | 3090 tables extraites dans 219 fichiers |
| `scripts/inject-bridge-imports.mjs` | Body-scan + multi-line export blocks fix |
| Build | ✓ 12-13s |
| Live game | ✓ Copyright screen, fps stable, no regressions |
| 295/295 auto-files | parse cleanly (= 0 TS1 errors) |

## Coverage live

```js
dev.bridge.report()
// → { bridgedCount: 331, notImplementedCount: 12 }
// (Note : __bridgedHelpers__ Set tracking inclut moins que bridge exports réels.)

dev.movementDispatch.listBridgedActions().length
// → 154

dev.movementDispatch.listUnbridgedActions()
// → ['fly_down', 'fly_up', 'lock_anim', 'step_end', 'unlock_anim']
```

## Action dispatch behavior

```
delay_*       → handled, ticking ✓
face_*        → handled, throw on currentCoords undef (= mock object missing field)
walk_*        → handled, throw on GetStepAnimTable / sStep1Funcs
jump_*        → handled, throw on sStep4Funcs / GetJumpY  
slide_*       → handled, throw on sJumpInitDisplacements (= now bridged ✓)
walk_in_place_* → handled, throw on GetStepAnimTable
```

→ Le pattern d'activation FONCTIONNE. Les throws revealent les helpers/data
manquants au fur et à mesure. Chaque fix débloque la couche suivante.

## Workflow d'activation établi

1. **Extract** : `node scripts/extract-decomp-all-functions.mjs` (= 15K functions)
2. **Transpile** : `node scripts/transpile-decomp-all.mjs` (= 295 .ts files, 100% parse)
3. **Inject bridge** : `node scripts/inject-bridge-imports.mjs` (= destructure imports)
4. **Static tables** : `node scripts/extract-static-data-tables.mjs` (= 3090 tables)
5. **Build** : `npx vite build` (= verify integration)
6. **Test live** : `dev.movementDispatch.tryDispatch(...)` etc.

## Tableau des helpers manquants par fréquence

Top unbridged calls (= TODO list, run `dev.bridge.unbridgedCalls()` live) :
- GetObjectEventGraphicsInfo (29×) — exists in object-events.ts
- GetMapName (16×)
- GetItemName (14×)
- LT_SET_STATE (14×)
- GetMonSpritePalFromSpeciesAndPersonality (13×)
- GetBerryInfo (13×)
- CpuFastCopy (13×)
- DmaSet (11×)
- ...

## Phase 5.4-5.7 (= next steps)

### 5.4 scrcmd opcodes
- 220 opcodes auto-extraits, 88 hand-implementés (= 132 manquants)
- Activation strategy : add scrcmd-dispatch.ts similar to movement-dispatch
- Risk : opcodes ont nombreuses deps (= writes to ScriptContext, var/flag access)

### 5.5 ChooseStarter
- 18 functions in starter_choose-all-auto.ts
- VISIBLE WIN : currently auto-picks first starter, would let user choose 3 pokeballs
- Heavy : needs BG layer setup, sprite creation, input handling, dialogue

### 5.6 field_effect (tall grass etc.)
- 224 functions in field_effect-all-auto.ts
- Visible : grass animation, jump dust, shadow effects
- Medium : depends on FieldEffectStart machinery

### 5.7 overworld sub-systems
- 210 functions in overworld-all-auto.ts
- Includes : ambient cry timer, weather, day/night, wallclock dispatcher

## Risques identifiés

1. **Activation reveals deep dep chain** : chaque fix débloque le throw suivant.
   Single function activation peut nécessiter 10+ helpers/tables à porter.
2. **Static const data tables** : 3090 extracted but most need manual port for
   précis indexing (= [DIR_X] = Y patterns need DIR_X resolution).
3. **Function pointer arrays** : `static u8 (*const sX[])(args) = {fn1, fn2}`
   need lazy resolution via getter (= fn names resolve to bridge or auto).
4. **Sprite/ObjectEvent struct shape mismatch** : auto-files expect décomp
   struct fields (= currentCoords.x), our impl uses different field names.

## Recommandation

Plutôt que continuer à activer modules en cascade (= chaque level reveals
deeper deps), pivot stratégique :

**Option A** : Focus on ChooseStarter UI (= visible win)
- Lit auto starter_choose body line by line
- Port helpers manquants au fur et à mesure
- Result : 3 pokeballs picker functional

**Option B** : Focus on adding more bridge helpers (= raise coverage % high)
- Run `dev.bridge.unbridgedCalls()` live
- Port top 50 manuellement
- Result : higher % auto-files become activatable

**Option C** : Ship upd2 + start a new branch (= upd3) for next focus
- Merge upd2 to main as Phase 5.3 milestone
- Then upd3 dedicated to UI flows (= ChooseStarter, WallClock)

User decision needed : A, B, ou C ?
