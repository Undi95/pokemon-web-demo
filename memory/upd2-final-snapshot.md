# Branch upd2 — Final overnight snapshot

Date : 2026-05-09 04:50

## TL;DR pour ton réveil bro

**Massive overnight progress sur upd2** :
- Bridge : **267 → 562+ helpers** (= 2x growth, ~300+ added)
- ChooseStarter UI : visuel 1:1 fonctionnel via notre engine
- Battle scene : 770 lignes `battle-flow.ts` WIP par OPUS agent (pas encore commit)
- 18+ commits cette nuit, tous sur `upd2`, NE PAS push

## Dernier commit log

```
32b2f592 Phase B.6 — bridge expansion : status macros + battle utils +61 helpers
d1b16052 Memory : upd2-troubleshooting.md
8cc71f01 Memory : upd2-morning-briefing.md
1534920e Phase B.5 — bridge expansion : pokemon storage NotImpl + RFU/flash +39
76688186 Phase B.4 — bridge expansion : data lookups + strings +20
5ee7e31a Phase 5.5d-fix — circular import dynamic import for ChooseStarter
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
```

= 18 commits depuis main (= phase 5.3 baseline).

## ChooseStarter état (= testable)

✅ Visible 1:1 décomp via NOTRE engine (pas Phaser primitives) :
- 3 pokeballs sprites at sPokeballCoords
- Hand cursor avec sin bob
- Pokeball anim swap selon selection
- Circle halo sur confirm
- Dialog via gba-text-system (= text "Le PROF. SEKO a des ennuis!")
- YesNo menu via gba-menu-system
- VAR_RESULT + party update + cleanup

❌ Pas encore visuel complet :
- Pokemon front sprite spawn on confirm (Phase 5.5d à finir)
- BG swap to Birch's bag (Phase 5.5e)
- PlayCry_Normal sur confirm

## Battle scene WIP (= agent 2)

`src/engine/battle-flow.ts` (770 lignes, uncommitted) :
- State machine inline overworld (= même pattern que starter-choose-flow)
- Birch tutorial : starter LV5 vs Zigzagoon LV2
- Use real engine systems (= window/text/menu)
- Pokemon back/front sprites loaded au runtime
- HP bars en text (= simplified vs tile HP bar)
- Move menu via window + cursor
- Damage formula 1:1 décomp `CalculateBaseDamage`
- Battle outcome → VAR_RESULT 1=WIN / 2=LOSE

Files modified by agent (uncommitted) :
- src/engine/engine-devtools.ts
- src/engine/script-opcodes.ts (= peut-être conflit avec mes changes)
- src/engine/script-runtime.ts
- src/engine/specials-registry.ts (= GetBattleOutcome lit globalThis.__gBattleOutcome)
- src/engine/battle-flow.ts (= NEW)

## Instructions for morning testing

### 1. Vérifier que tout compile

```bash
npx vite build --mode development
# → ✓ built in 12-15s
```

### 2. Test ChooseStarter live

```bash
npm run dev
# Ouvrir http://localhost:5173 dans browser
```

```js
// Console F12 :
window.__phaserGame.scene.start('TestOverworldScene')
// Wait 5s
const { startChooseStarterFlow } = await import('/src/engine/starter-choose-flow.ts')
const flow = startChooseStarterFlow()
const interval = setInterval(() => {
  if (flow.tick()) clearInterval(interval)
}, 16)
// Press W/Enter for A button, X/Esc for B, ←→ for selection
```

### 3. Si battle agent a commit

```bash
git log --oneline upd2 ^main | head -5
# → cherche "Phase 5.6" ou "battle"
```

### 4. Bridge coverage

```js
window.dev.bridge.report()
// → bridgedCount: 562+, notImplementedCount: 27+
```

## Files modifiés cette nuit (= besoin user review)

```
A  memory/upd2-progress.md
A  memory/upd2-overnight-status.md
A  memory/upd2-morning-briefing.md
A  memory/upd2-troubleshooting.md
A  memory/upd2-final-snapshot.md (= ce fichier)
M  scripts/extract-sprite-system.mjs (= +starter_choose.c)
M  scripts/inject-bridge-imports.mjs
A  scripts/check-bridge-coverage.mjs (= agent)
M  src/engine/decomp-bridge.ts (= massif, +400 helpers)
A  src/engine/starter-choose-flow.ts (= 350 lignes)
A  src/engine/battle-flow.ts (= 770 lignes WIP)
M  src/engine/decomp-data/auto/src/sprite-system.ts (= regenerated)
M  src/engine/script-opcodes.ts (= +ChooseStarter opcode wiring + battle)
M  src/engine/specials-registry.ts (= GetBattleOutcome update)
M  src/engine/script-runtime.ts (= agent changes)
M  src/engine/engine-devtools.ts (= agent changes)
M  src/main.ts (= window.__phaserGame export)
A  public/decomp/em/starter_choose/ (= asset PNGs + RGBA)
M  src/engine/decomp-data/auto/src-all/*.ts (= 295 auto-files re-injected)
```

## Architecture reminder

Tout passe par les vraies APIs engine. ZERO Phaser primitive pour la game UI.
- Sprites : `rt.CreateSpriteFromTemplate('sSpriteTemplate_X', x, y)`
- Windows : `AddWindow + DrawStdFrameWithCustomTileAndPalette`
- Text : `AddTextPrinterParameterized3 (= ShowFieldMessage wrapper)`
- Menus : `CreateYesNoMenu + Menu_ProcessInputNoWrapClearOnChoose`
- State machine : `SetupNativeScript polling per frame`

Cf. `memory/upd2-troubleshooting.md` pour détails maintenance.

## Bonne journée 💛

Si tu vois des bugs / régressions, le revert est facile :
```bash
git revert <hash> --no-edit
```

Tous les commits sont incrémentaux et indépendants. Bridge expansion peut être
revert sans casser ChooseStarter, et inversement.

NE PAS push origin sans review. Branch `upd2` reste local jusqu'à ton OK.

Bonne nuit / bon réveil bro 🌙→☀️
