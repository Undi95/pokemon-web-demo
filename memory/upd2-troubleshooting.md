# Branch upd2 — Troubleshooting + Future roadmap

Date : 2026-05-09 — overnight session

## Si le jeu ne boot pas

1. `git checkout main` pour revenir à un état stable
2. `git checkout upd2` pour revenir à upd2
3. Check `npx vite build --mode development` pour voir erreur exacte
4. Si erreur dans un fichier auto-generé : `node scripts/check-auto-syntax.mjs`
5. Si erreur dans bridge : `node scripts/check-bridge-coverage.mjs`

## Si ChooseStarter ne se déclenche pas

Le flow démarre quand `special ChooseStarter` est exécuté par un script.
Le script trigger est dans `data/maps/Route101/scripts.inc:Route101_EventScript_PickStarter`.

Pour test manuel :
```js
// Dans console F12, après avoir démarré TestOverworldScene
const { startChooseStarterFlow } = await import('/src/engine/starter-choose-flow.ts');
const flow = startChooseStarterFlow();
const interval = setInterval(() => {
  if (flow.tick()) clearInterval(interval);
}, 16);
```

## Si une régression visible apparaît

Les commits Phase B.* du bridge agent sont incrémentaux et faciles à revert :
```bash
git log --oneline upd2 ^main | head -20
git revert <commit_hash> --no-edit
```

## Architecture overview pour future maintenance

### Engine systems (= les "bases" qu'on reuse)

```
src/engine/
├── decomp-runtime.ts     # Gba host + sprite/task/palette mgmt
├── decomp-globals.ts     # Re-exports + helpers globaux
├── decomp-bridge.ts      # Single import surface (= 400+ helpers)
├── decomp-helpers.ts     # Sin/Cos/affine/PaletteBuffer
├── gba-window-system.ts  # AddWindow + DrawStdFrameWithCustomTileAndPalette
├── gba-text-system.ts    # AddTextPrinterParameterized3 + Run/IsActive
├── gba-menu-system.ts    # CreateYesNoMenu + Menu_ProcessInputNoWrapClearOnChoose
├── field-message-box.ts  # ShowFieldMessage + IsFieldMessageBoxHidden
├── script-runtime.ts     # ScriptContext + RunScriptCommand
├── script-opcodes.ts     # 80+ opcodes registered
├── specials-registry.ts  # 11+ specials registered
├── starter-choose-flow.ts # ChooseStarter state machine (Phase 5.5)
└── battle-flow.ts        # Battle state machine (Phase 5.6, agent WIP)
```

### Patterns utilisés

1. **State machine via SetupNativeScript** : flow.tick() polled chaque frame.
   - Used : starter-choose-flow, battle-flow, script-opcodes msgbox/yesnobox/etc.
2. **Sprite via runtime templates** : `rt.CreateSpriteFromTemplate('sSpriteTemplate_X', x, y)`.
   - Templates extracted via `scripts/extract-sprite-system.mjs`.
3. **Bridge import** : `import { X } from './decomp-bridge'`.
   - Bridge re-exports + macros + NotImplemented stubs.

### Pour ajouter un nouveau special UI flow

1. Créer `src/engine/<name>-flow.ts` avec state machine + tick()
2. Wire dans `script-opcodes.ts` opcode `special` :
   ```ts
   if (name === 'YourSpecial') {
     void import('./<name>-flow').then((mod) => {
       const flow = mod.startYourFlow();
       SetupNativeScript(ctx, flow.tick);
     });
     return true;
   }
   ```
3. Le flow utilise les bases engine (= window-system + text-system + menu-system)

### Pour ajouter une nouvelle scene

1. Créer `src/scenes/<Name>Scene.ts` qui extends `Phaser.Scene`
2. Si runtime requis : pattern de `BirchRuntimeScene.ts` (= host Gba + DecompRuntime)
3. Ajouter au `scene` array de `main.ts`
4. Trigger via `window.__phaserGame.scene.start('<Name>Scene')`

### Pour bridger un nouveau helper

1. Identifier où il est défini dans le décomp (= `D:/Projet 1/decomps/pokeemeraude/src/`)
2. Si on a déjà l'impl côté nous : re-export dans `decomp-bridge.ts`
3. Si macro simple : inline directement dans bridge
4. Si trop complex pour porter maintenant : `throw new Error('[bridge] X not yet 1:1 ported. See Y.c:Z.')`
5. Run `node scripts/inject-bridge-imports.mjs` pour mettre à jour les auto-files

## Phase prochaines (= priorité décroissante)

### P0 (= dépend des agents)
- ✅ Phase B.1-B.5 bridge expansion (agent 1, ~125 helpers)
- ⏳ Phase 5.6 battle scene (agent 2 WIP, 770 lignes battle-flow.ts)

### P1 (= visible wins)
- Phase 5.5d : Pokemon front sprite spawn on confirm (= 1:1 visual décomp)
- Phase 5.5e : BG swap to Birch's bag (= match décomp screenshot user shared)
- Phase 5.7 : Rival battle (= trainerbattle opcode + Brendan/May)

### P2 (= scope expansion)
- Wallclock UI (= Phase 3.3 deferred)
- Vigoroth garbage = OAM index leak architecture (= deferred)
- More specials porting (= 50+ remaining specials in décomp)

### P3 (= polish)
- Pokemon cry on confirm (= PlayCry_Normal wiring)
- LookAround sActionFuncId proper machinery
- Frame glitch on truck exit fix

## Métriques actuelles

```
Total commits depuis main : 17+
Bridge coverage : ~95% (= bridged + internal défini)
Auto-files parsing : 295/295 (100%)
Build time : 12-14s
Live game : ✓ boots
ChooseStarter UI : ✓ visible avec sprites
Battle : ⏳ WIP par agent
```

## Notes de session

Cette session a démarré avec une violation du directive 1 (= Phaser primitives
au lieu d'engine APIs pour ChooseStarter). Reverted + reconstruit proprement
avec 100% nos systèmes engine. Important pattern : **dynamic import** pour
éviter circular dependencies au load.

Les 2 OPUS agents travaillent en parallèle sans conflit grâce à séparation
claire des fichiers (= bridge agent on decomp-bridge.ts + battle agent on
battle-flow.ts).
