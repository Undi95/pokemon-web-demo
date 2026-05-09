# Branch upd2 — Final overnight snapshot (UPDATED 04:55)

Date : 2026-05-09 — overnight session active

## TL;DR

**Massive overnight progress sur upd2 — agents OPUS done!**

- **25 commits** depuis main
- Bridge : **267 → 638 bridged** + 28 NotImpl (= +261 helpers, **+138% growth**)
- Real coverage: **33.97% → 83.49%** (= +49.5 percentage points)
- ChooseStarter UI : visible 1:1 avec sprites + dialogs ✓
- **Birch tutorial battle : shipped & functional** ✓ (commit `ae57794e`)
- Build clean, game runs, no regressions

## Commit log final

```
666151e5 Phase 5.6 — battle-flow : factor out refreshMoveMenu helper
cd7c1cac Phase B.8 — re-inject bridge imports across 21 auto-files
ae57794e Phase 5.6 — Birch tutorial battle (= 1:1 décomp pragmatic MVP)
d3e4f684 Phase B.7 — bridge expansion : final cleanup batch (+76 helpers)
d60d70b0 Memory : upd2-final-snapshot.md
32b2f592 Phase B.6 — bridge expansion : status macros + battle utils +61
d1b16052 Memory : upd2-troubleshooting.md
8cc71f01 Memory : upd2-morning-briefing.md
1534920e Phase B.5 — bridge expansion : pokemon storage NotImpl + RFU/flash +39
76688186 Phase B.4 — bridge expansion : data lookups + strings + LT_SET_STATE +20
5ee7e31a Phase 5.5d-fix : circular import dynamic import for ChooseStarter
9fea8567 Phase B.3 — bridge expansion : battle + util macros +38
642e9984 Memory checkpoint upd2-overnight-status.md
aa6e13f5 Phase B.2 — bridge expansion : re-export existing impls +10
dee774a5 Phase 5.5c — ChooseStarter sprite anim swap + circle on confirm
0183ca02 Phase 5.5b — ChooseStarter visual sprites via runtime real OAM
2fe17afd Phase 5.5a — ChooseStarter inline flow via engine APIs
223f9b3c Revert "Phase 5.5 Phaser scene"
c5fd3774 Phase B.1 — bridge expansion : GBA macros + libc primitives +17
b85b4e70 Phase 5.3 final — memory/upd2-progress.md
1465da35 Phase 5.3d — extract static const tables (3090) + manual ports
03557b56 Phase 5.3c — auto-dispatch fallback into movement-system
983688a2 Phase 5.3b — movement-action-dispatch + libc bridge
4dfe46f1 Phase 5.3a — bridge runtime wrappers + 140 MB_*
```

## ChooseStarter (= testable)

✅ Visible 1:1 décomp via NOTRE engine :
- 3 pokeballs sprites at sPokeballCoords
- Hand cursor avec sin bob
- Pokeball anim swap selon selection
- Circle halo sur confirm
- Dialog via gba-text-system
- YesNo menu via gba-menu-system
- VAR_RESULT + party update + cleanup

❌ Pas encore visuel complet :
- Pokemon front sprite spawn on confirm (Phase 5.5d-bis)
- BG swap to Birch's bag (Phase 5.5e)
- PlayCry_Normal sur confirm

## Battle scene (= testable)

✅ Birch tutorial wild battle complet :
- Player-back + opp-front sprites loaded au runtime
- HP windows (= text "ZIGZAGOON Lv2 PV: 12/12")
- Move menu avec cursor DPAD + A/B
- Damage formula 1:1 décomp CalculateBaseDamage
- Atk/Def stats from species + level + IVs (= CalcStat Gen 3)
- VAR_RESULT 1=WIN / 2=LOSS, gBattleOutcome stash
- Cleanup sprites + windows on exit

✅ Live tested (in console) :
```js
await dev.battle.startBirchTutorial()  // = vs Zigzagoon LV 2
await dev.battle.startWild('SPECIES_POOCHYENA', 5)  // = generic
dev.battle.outcome()                    // = last outcome
```

❌ Pas encore (= Phase 5.7) :
- HP bar tiles (= text only for now)
- EXP/level-up post-win
- Type chart, abilities, items, crits, STAB
- AI (= opp uses first damaging move)
- Fuite, switch, bag
- Battle BG (= overworld map visible derrière)
- Transition anim (= B_TRANSITION_BLUR)

## Trigger battle

```js
// In dev console after starter chose
window.__phaserGame.scene.start('TestOverworldScene')  // ensure overworld active
// Wait 5s
await dev.battle.startBirchTutorial()
// Use W (=A) for confirm dialog, arrows for move menu
```

## Bridge architecture

```
src/engine/decomp-bridge.ts (= 3326 lines now, +1905 vs Phase 5)
├── 638 bridged exports (= re-exports + macros + runtime wrappers)
├── 28 NotImpl stubs (= for unportable helpers)
└── __bridgedHelpers__ + __notImplementedHelpers__ Sets for dev tools
```

Top remaining unbridged (= Phase B.9 future) :
- `9× ItemStorage_GetMessage` (= sibling auto-fn)
- `2× GET_COL_IDX`, `2× GET_MIN_BET_ID` (roulette)
- 1× each: TRY_EAT_*_BERRY, ERROR_EXIT, TryScene, GetPokedexRatingText, etc.

Top NotImpl (= for actual ports later) :
- `485× GetMonData` / `130× SetMonData` — pokemon.c port
- `208× GetSubstructPtr` — save.c port
- `42× GetVarPointer` — event_data.c
- `43× LZ77UnCompWram` — decompression
- `29× GetMonNickname` — pokemon nicknames

## Trigger flow

### ChooseStarter (= via script `special ChooseStarter`)
```
Birch's bag pokeball touch → Route101_EventScript_PickStarter
  → applymovement player + Birch
  → special ChooseStarter   ← le state machine prend le contrôle
  → applymovement Birch
  → msgbox "Tu m'as sauvé!"
  → special HealPlayerParty
```

### Battle (= via dev.battle ou special StartBirchTutorialBattle)
- Wild : `startWildBattle({ opponentSpecies, opponentLevel })`
- Birch tutorial : `startBirchTutorialBattle()` (= preset Zigzagoon LV 2)
- Trainer (Phase 5.7) : `startTrainerBattle({ trainerId, ... })` (= TODO)

## Files modifiés cette nuit

```
A  memory/upd2-progress.md
A  memory/upd2-overnight-status.md
A  memory/upd2-morning-briefing.md
A  memory/upd2-troubleshooting.md
M  memory/upd2-final-snapshot.md (= ce fichier)
M  scripts/extract-sprite-system.mjs
M  scripts/inject-bridge-imports.mjs
A  scripts/check-bridge-coverage.mjs (= agent)
M  src/engine/decomp-bridge.ts (= +1905 lines)
A  src/engine/starter-choose-flow.ts (= 350 lignes)
A  src/engine/battle-flow.ts (= 770 lignes)
M  src/engine/decomp-data/auto/src/sprite-system.ts (= regenerated)
M  src/engine/script-opcodes.ts (= +ChooseStarter wiring + battle special)
M  src/engine/specials-registry.ts (= GetBattleOutcome update)
M  src/engine/script-runtime.ts (= +ScriptContext_SetupInlineNative)
M  src/engine/engine-devtools.ts (= +dev.battle helpers)
M  src/main.ts (= window.__phaserGame export)
A  public/decomp/em/starter_choose/ (= asset PNGs)
M  src/engine/decomp-data/auto/src-all/*.ts (= 295 auto-files re-injected x2)
```

## Phase 5.7 roadmap (= en cours après agents)

Architecture battle-flow.ts permet trivialement de extend pour trainer battle :
1. Pass trainer party (= JSON `gTrainerParties[trainerId]`) au lieu de single opponent
2. Loop through opponent party on faint
3. Add intro text "BRENDAN veut combattre!"
4. Update `_stubTrainerBattle` opcode pour call `startTrainerBattle({...})`
5. Battle flow auto-compose sur la même infrastructure

## Bonne nuit / bon réveil 💛

Tu vas voir une **branche upd2 avec 25+ commits**, **build clean**,
**ChooseStarter visible** + **battle tutorial fonctionnel**, **bridge à 84% coverage**.

Continue session : Phase 5.7 trainer battle (= le rival Brendan/May).
