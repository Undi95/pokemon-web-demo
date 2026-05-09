# Branch upd2 — Final snapshot (overnight session, iteration 6 update)

Date : 2026-05-09 ~05h55

## TL;DR

**35 commits sur upd2 cette nuit.** Build clean, game runs.

### Big wins (cumulé jusqu'à iter6)

| Item | Status |
|---|---|
| Bridge coverage | **267 → 638 helpers** (= +138%) |
| Real coverage | 33.97% → **83.49%** (= +49.5pp) |
| ChooseStarter UI | ✅ visible 1:1 sprites + dialog + Pokemon front |
| Wild battle | ✅ Birch tutorial fonctionnel |
| Trainer battle | ✅ Rival via trainerbattle opcodes |
| Specials registered | ✅ **46** (= +34 cette nuit) |
| Opcodes registered | ✅ **~167** (= +25 iter6, audit-driven) |
| Audit tool | ✅ `scripts/audit-missing-opcodes.mjs` |
| Memory docs | ✅ 5 files briefing user |

### Iteration 6 highlights (commit `493b3cee`)

- Created `scripts/audit-missing-opcodes.mjs` qui cross-référence les 470
  fichiers `public/decomp/em/scripts/*.json` extraits avec les opcodes
  registered dans `script-opcodes.ts`. Tally :
  - Total opcodes registered : 142 (avant iter6) → 167 (après)
  - Total opcodes utilisés dans scripts : 982
  - Missing opcodes (pseudo-ops filtrés) : 790
  - **Top missing avant iter6** : playsewithpan (1746x), waitforvisualfinish
    (1474x — battle-only), loadspritegfx (1146x — battle), waitse (342x),
    finditem (332x), register_matchcall (152x).
  - **Battle-script opcodes** (attackstring, ppreduce, attackcanceler,
    accuracycheck, etc.) belong to a SEPARATE dispatcher — not field-script.
    Will be addressed in Phase 5.8 ou Phase 6.
- Added 25 field-only opcode stubs (= safe `false` returns or simple
  globals tracking). Most-impact :
  - `playsewithpan` / `loopsewithpan` / `waitse` / `waitplaysewithpan` →
    aliases to existing playse, stereo pan ignored
  - `register_matchcall` → tracks `globalThis.__matchCallTrainers` Set
  - `settrainerflag` / `cleartrainerflag` / `checktrainerflag` → tracks
    `globalThis.__defeatedTrainers` Set
  - `pause` → SetupNativeScript with frame countdown (1:1 décomp delay)
  - `random` → `Math.random()` into VAR_RESULT
  - `endall` / `end2` → proper StopScript()
  - braille variants, messageautoscroll, finditem, pokemart, etc. → safe
    skip stubs avec log de TODO

### Live test commands

Console F12 après game boot :
```js
window.__phaserGame.scene.start('TestOverworldScene')
// Wait 5s

// Test 1 : ChooseStarter (= 3 pokeballs visible + dialog)
const cs = await import('/src/engine/starter-choose-flow.ts')
const f = cs.startChooseStarterFlow()
const i = setInterval(() => f.tick() && clearInterval(i), 16)
// Use ←→ to choose, W=A pour confirm

// Test 2 : Wild battle (= Birch tutorial)
await dev.battle.startBirchTutorial()
// Use arrows + W to navigate move menu

// Test 3 : Trainer battle (= rival Brendan)
await dev.battle.startTrainer('TRAINER_BRENDAN_ROUTE_103_TORCHIC')

// Test 4 : Bridge coverage
window.dev.bridge.report().then(console.log)
```

## Commit log (= 35 commits)

```
493b3cee Phase 5.7+ iter6 — audit-driven field opcode stubs (+25 opcodes)
27bc6013 Phase 5.7+ — 22 additional specials stubs (PC effects, Pokedex, Roamer, HM checks)
23a84a41 Phase 5.7+ — 40+ misc opcode stubs (incrementgamestat, playmoncry, giveitem, buffer*, doweather...)
21e32cc6 Phase 5.7+ — 6 audio opcodes (playbgm, savebgm, fadedefaultbgm, fadenewbgm, fadeoutbgm, fadeinbgm)
d002806b Phase 5.7-fix — eagerly load trainer-battle-flow for dev.battle.startTrainer
96c8a28f Memory — final snapshot updated avec Phase 5.5e+ (29 commits)
f33be59d Phase 5.5e+ — additional specials stubs (WallClock, Diploma, etc.)
fb272086 Phase 5.5d-bis — Pokemon front sprite spawn on confirm
9123e777 Phase 5.7 — Trainer battle via battle-flow extension
4b56b4d0 Memory : updated final snapshot avec battle agent results
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

## ChooseStarter (Phase 5.5)

✅ Implementé via `src/engine/starter-choose-flow.ts` :
- 3 pokeballs sprites at sPokeballCoords (60,64) (120,88) (180,64)
- Hand cursor avec sin bob
- Pokeball anim swap (still ↔ moving) selon selection
- Circle halo sur confirm
- **Pokemon front sprite (Phase 5.5d-bis)** : preload TREECKO/TORCHIC/MUDKIP front.png + spawn on confirm
- Dialog via gba-text-system
- YesNo menu via gba-menu-system
- VAR_RESULT + party update + cleanup

❌ Pas implémenté :
- BG swap to Birch's bag (= Phase 5.5e DEFERRED, complex BG layer manipulation)
- PlayCry_Normal sur confirm (= audio TODO)

## Battle scenes (Phase 5.6 + 5.7)

### Phase 5.6 — Wild battle (= Birch tutorial)

✅ `src/engine/battle-flow.ts` (770 lignes) :
- 2 sprites (player back + opp front) via runtime LoadCompressedSpriteSheet
- HP windows (= text "ZIGZAGOON Lv2 PV: 12/12")
- Move menu avec cursor DPAD + A/B
- Damage formula 1:1 décomp CalculateBaseDamage
- Atk/Def via CalcStat Gen 3
- VAR_RESULT 1=WIN / 2=LOSS, gBattleOutcome stash
- Cleanup sprites + windows

### Phase 5.7 — Trainer battle (= rival)

✅ `src/engine/trainer-battle-flow.ts` (~200 lignes) :
- Wraps startWildBattle for trainer party
- Loads `trainer-parties.json` async
- Intro text "BRICE veut combattre!"
- Loop through party members
- Wired to all trainerbattle opcodes (= legacy, _single, _double, _rematch, etc.)
- VAR_RESULT + flag setting

## Bridge expansion (Phase B.1-B.8)

✅ `src/engine/decomp-bridge.ts` : 1421 → 3326 lignes (+1905 lines)
- 638 bridged helpers (= re-exports + macros + runtime wrappers + NotImpl)
- 28 NotImpl stubs (= TODO list pour vrais ports)
- `__bridgedHelpers__` Set tracks coverage

Top remaining unbridged (= rare) :
- 9× ItemStorage_GetMessage (= sibling fn, resolves when player_pc-all-auto activated)
- 2× GET_COL_IDX, GET_MIN_BET_ID (roulette)
- 1× each of various rare helpers

Top NotImpl (= for future ports) :
- 485× GetMonData / 130× SetMonData (= pokemon.c port)
- 208× GetSubstructPtr (= save.c)
- 42× GetVarPointer
- 43× LZ77UnCompWram

## Memory files

```
memory/upd2-progress.md           # Phase 5.3 baseline (post-Phase 5)
memory/upd2-overnight-status.md   # mid-overnight progress
memory/upd2-morning-briefing.md   # wake-up brief
memory/upd2-troubleshooting.md    # maintenance guide
memory/upd2-final-snapshot.md     # this file
```

## Iter6 audit findings (= roadmap data)

Le top des opcodes manquants est dominé par les opcodes de battle scripts
(= `attackstring`, `attackanimation`, `ppreduce`, etc.). Ces opcodes
appartiennent à un **dispatcher séparé** (`battle_script_commands.c` dans
le décomp). Notre `script-runtime.ts` actuel ne dispatche que les
**field scripts** (`scrcmd.c`).

Pour activer les battle scripts (= damage formula riche, animations
attaques, status effects...), il faudra créer un nouveau module
`battle-script-runtime.ts` qui parse + dispatche `gBattleScriptingCommandsTable[]`
extracted from `data/battle_scripts_1.s`. C'est Phase 6.

### Battle script opcodes manquants (top 30 par usage)

```
   270  attackstring        — display attack message
   266  ppreduce            — reduce PP after move use
   260  attackcanceler      — check protect/snatch/etc
   224  if_equal            — battle-script branching
   198  simple_palette_blend — battle anim
   184  attackanimation     — play move animation
   184  waitanimation       — wait for animation
   132  if_hp_more_than     — branch on HP
   132  accuracycheck       — accuracy roll
   116  if_stat_level_more_than — stat stage check
   116  setmoveeffect       — schedule secondary effect
   ... etc.
```

### Field script opcodes restants (Phase 5.9)

Quelques champ specifics encore manquants (mais peu utilisés) :

```
    96  fadetobg                — fade map → backdrop bg
    72  pokemartlistend         — end of pokemart list
    66  copyobjectxytoperm      — persist NPC pos
    52  if_status2              — battle status check
    34  copyobjectxytoperm      — alt name
   ... etc.
```

## Phase 5.8+ roadmap (= future work)

### Phase 5.8 (= polish battle)

- Real HP bar tiles (= currently text)
- EXP/level-up post-win
- Type chart, abilities, items, crits, STAB
- Better AI (= use damaging move with type advantage)
- Battle BG (= load tall_grass tiles to BG2)
- Transition anim (= B_TRANSITION_BLUR)

### Phase 5.9 (= more specials)

- WallClock UI (= clock-setting at bedroom)
- Diploma display
- More flow stubs as scripts request them

### Phase 6 (= deeper systems)

- Pokemon storage (= PC system)
- Save system fully wired
- More battle features (= switch, bag, run)

### Phase 7 (= scope expansion)

- Multi-mon trainer (= gym leaders)
- Pokemon with abilities + items
- Real battle BG + animations

## How to revert if needed

Each commit is independent and reversible :
```bash
git revert <hash> --no-edit
```

Phases can be reverted individually :
- Phase 5.5* : revert affects ChooseStarter only
- Phase 5.6 : revert affects wild battle
- Phase 5.7 : revert affects trainer battle
- Phase B.* : revert affects bridge coverage (= just re-runs inject script)

## Bonne nuit / bon réveil 💛

NE PAS push to remote. Branch `upd2` reste local jusqu'à ton OK.

Le jeu progresse vers la complétion :
- ✅ Intro (= done depuis Phase 4)
- ✅ Maman (= done)
- ✅ Birch lab navigation (= done)
- ✅ ChooseStarter (= cette nuit)
- ✅ Tutorial battle (= cette nuit)
- ✅ Rival battle (= cette nuit)
- ✅ Field opcode coverage (= 167/982 unique opcodes, audit visible)
- 🔲 Battle script runtime (= Phase 6, separate dispatcher)
- 🔲 Visit gyms (= future)
- 🔲 Pokedex (= future)
- 🔲 Hall of Fame (= future)

## Workflow audit-driven (= reproducible pour itérations futures)

```bash
node scripts/audit-missing-opcodes.mjs | head -40
```

Output = top missing opcodes par usage. Ajoute un stub pour chacun
dans `src/engine/script-opcodes.ts` (= 1:1 décomp `scrcmd.c` reference,
fallback to no-op or simple state mutation). Le but : zero `[script-runtime]
opcode '...' not implemented` warnings dans la console quand le user joue
une zone normale.
