# Branch upd2 — Overnight session status

Date : 2026-05-09 ~04h00 (continuing)
User : asleep, full autonomy granted on upd2 branch + opus agents
Direction : "continue, search, find"

## Commits sur upd2 (= 8 total depuis main)

| Hash | Phase | Description |
|---|---|---|
| `4dfe46f1` | 5.3a | Bridge runtime wrappers + 140 MB_* + 13 metatile predicates |
| `983688a2` | 5.3b | movement-action-dispatch + libc bridge + body-scan inject |
| `03557b56` | 5.3c | Wire auto-dispatch fallback into movement-system._tickAction |
| `1465da35` | 5.3d | Extract static const tables (3090) + manual ports |
| `b85b4e70` | 5.3 doc | upd2-progress.md status snapshot |
| `223f9b3c` | 5.5 revert | Reverted Phaser primitives shortcut (= violated 1:1 directive) |
| `2fe17afd` | 5.5a | ChooseStarter inline flow via engine APIs (ShowFieldMessage + CreateYesNoMenu) |
| `818ca25a` | (reverted) | Original Phaser scene attempt |
| **5.5b** | sprites visuals | 3 pokeballs + hand cursor via runtime CreateSpriteFromTemplate |
| **5.5c** | sprite anims | Pokeball anim swap on selection + circle on confirm + decline cleanup |

## Current state ChooseStarter

**Visible 1:1 décomp via NOTRE engine** :
- Sprites pokeballs (32x32) at sPokeballCoords (= 60,64 / 120,88 / 180,64) ✓
- Hand cursor with sin bob ✓
- Anim swap : selected pokeball plays "moving" animation ✓
- Circle halo on confirm ✓
- Dialog "Le PROF. SEKO a des ennuis!..." via gba-text-system ✓
- CreateYesNoMenu confirmation ✓
- Full state machine driven by SetupNativeScript polling ✓

**Pas encore implémenté** :
- Pokemon front sprite spawn on confirm (= MON_PIC_AFFINE_FRONT, deferred)
- BG swap to Birch's bag (= overworld map reste visible derrière, peut être OK)
- PlayCry_Normal sur confirm

## Active OPUS agents (background)

### Agent 1 : Bridge expansion (= drain top 30 unbridged helpers)
- Goal : raise coverage from ~95% to >97%
- Working on : decomp-bridge.ts re-exports + macros + NotImpl stubs
- Will commit incrementally as Phase B.X

### Agent 2 : Birch tutorial battle (= player starter vs Zigzagoon)
- Goal : minimal but functional battle that returns VAR_RESULT
- Files : src/engine/battle-flow.ts (NEW)
- Architecture : state machine like starter-choose-flow + reuse window/text/menu APIs

## Risks / conflits possibles

- Both agents could touch `script-opcodes.ts` (battle adds opcodes, bridge might re-export from there)
- Both agents could touch `decomp-bridge.ts` (bridge adds, battle might add)
- Mitigation : agents commit incrementally, conflicts resolved on next iteration

## Files modified depuis Phase 5.3 final

```
M  src/engine/decomp-bridge.ts        (= bridge expansion in progress)
A  src/engine/starter-choose-flow.ts  (= 5.5a/b/c)
M  src/engine/script-opcodes.ts       (= ChooseStarter wiring)
M  src/engine/specials-registry.ts    (= removed auto-pick stub)
M  src/main.ts                        (= window.__phaserGame export)
M  scripts/extract-sprite-system.mjs  (= added starter_choose.c)
M  src/engine/decomp-data/auto/src/sprite-system.ts (= regenerated)
A  public/decomp/em/starter_choose/   (= asset PNGs)
```

## Next iterations

- 5.5d : Pokemon front sprite + PlayCry sur confirm
- 5.5e : BG swap (= load Birch bag tilemap)
- 5.6 : Battle integration (= when agent 2 done)
- 5.7 : Rival battle (= trainerbattle opcode + AI)
- B : Bridge expansion finalisé (= when agent 1 done)

## Session summary

Started session : Phase 5.3 done (commits b85b4e70 → 1465da35)
Mid-session : Reverted Phaser shortcut, rebuilt 1:1 with engine APIs
Now : Sprites visible via runtime, both agents running for battle + bridge

User can review upd2 branch in the morning. NE PAS push to remote.
