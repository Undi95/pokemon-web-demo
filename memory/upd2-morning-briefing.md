# Branch upd2 — Morning briefing

Date : 2026-05-09 ~04h45 (overnight session active)

## Pour le réveil bro

Voici l'état au moment où tu lis ça. Branche `upd2`, NE PAS push.

### Ce qui est shippé (commits chronologiques)

```
4dfe46f1 Phase 5.3a — bridge runtime wrappers + 140 MB_* + 13 metatile predicates
983688a2 Phase 5.3b — movement-action-dispatch + libc bridge
03557b56 Phase 5.3c — wire auto-dispatch fallback into movement-system
1465da35 Phase 5.3d — extract static const tables (3090) + manual ports
b85b4e70 Phase 5.3 final — memory/upd2-progress.md
818ca25a Phase 5.5  — ChooseStarter Phaser scene (REVERTED, violait directive 1)
223f9b3c Revert "Phase 5.5"
2fe17afd Phase 5.5a — ChooseStarter inline flow via engine APIs (1:1)
0183ca02 Phase 5.5b — visual sprites via runtime CreateSprite
dee774a5 Phase 5.5c — sprite anim swap + circle on confirm
642e9984 Memory checkpoint upd2-overnight-status.md
c5fd3774 Phase B.1 — bridge expansion : GBA macros + libc primitives (+17)
aa6e13f5 Phase B.2 — bridge expansion : re-export existing impls (+10)
9fea8567 Phase B.3 — bridge expansion : battle + util macros (+38)
76688186 Phase B.4 — bridge expansion : data lookups + strings + LT_SET_STATE (+20)
5ee7e31a Phase 5.5d-fix — circular import fix
```

= **15+ commits depuis main**, total = ~85+ helpers ajoutés au bridge,
ChooseStarter UI 1:1 avec sprites + dialogs.

### ChooseStarter état

✅ Visuellement proche du décomp original :
- 3 pokeballs sprites at sPokeballCoords (60,64) (120,88) (180,64)
- Hand cursor avec sin bob
- Pokeball anim swap (still ↔ moving) selon selection
- Circle halo on confirm
- Dialog "Le PROF. SEKO a des ennuis!" via gba-text-system
- Dialog "Prendre ce POKéMON?" + YesNo menu via gba-menu-system
- Cleanup propre en fin de flow (= sprites destroyed, vars set, party updated)

❌ Pas encore (= Phase 5.5d/e à faire) :
- Pokemon front sprite spawn on confirm (= TREECKO/TORCHIC/MUDKIP visuel)
- BG swap to Birch's bag (= overworld map reste visible derrière)
- PlayCry_Normal sur confirm

### Agents OPUS background

- **Agent 1 (bridge expansion)** : Phase B.1→B.4 shipped (4 commits, +85 helpers).
  Working on more.
- **Agent 2 (battle scene)** : encore en cours. Pas commit yet.

Tu peux check `git log --oneline upd2 ^main` pour voir leur progress quand tu te réveilles.

### Comment tester ChooseStarter

Dans la console F12 :
```js
// Démarre l'overworld
window.__phaserGame.scene.start('TestOverworldScene')
// Attendre le load (= 5s)
// Trigger le flow inline :
const { startChooseStarterFlow } = await import('/src/engine/starter-choose-flow.ts')
const flow = startChooseStarterFlow()
// Laisser le flow tourner — il s'avance via setTimeout polling.
// OU si tu veux la flow live via le script game :
// → Marche jusqu'à la pokeball de Birch's bag sur Route 101 → trigger script
```

### Bridge coverage actuelle

```js
window.dev.bridge.report().then(r => console.log(r))
// → bridgedCount: ~400+ (selon agent progress)
// → notImplementedCount: 12-15
```

### Roadmap prochain réveil

1. **Si battle agent fini** : test le tutorial battle, integrate dans Route 101 flow
2. **Phase 5.5d** : ajouter Pokemon front sprite (= TREECKO etc.) à ChooseStarter
3. **Phase 5.5e** : BG swap pour matcher 100% le visuel décomp
4. **Phase 5.7** : trainerbattle opcode (= rival battle Brendan/May)

### Risques / à valider

- Possibles conflits si agents touchent même fichiers (= unlikely vu mes prompts)
- ChooseStarter pas encore testé end-to-end via le vrai script flow Route 101
  (= seulement testé via direct flow.tick())
- Battle agent peut avoir ajouté des dépendances que je ne gérerais pas correctement

### Build / live status

✅ `npx vite build --mode development` → 12-13s, no errors
✅ Game loads at TestGbaScene + DebugOverlayScene
✅ TestOverworldScene boots correctly avec runtime

### Memory files

- `memory/upd2-progress.md` (= status à fin Phase 5.3)
- `memory/upd2-overnight-status.md` (= progress mid-overnight)
- `memory/upd2-morning-briefing.md` (= ce fichier, pour ton réveil)

Bonne journée 💛
