# Module Activation Guide — décomp auto-files

Date : 2026-05-09
Source : 295 fichiers `.c` du décomp transpilés en `src/engine/decomp-data/auto/src-all/*-all-auto.ts`.
Dependencies : `src/engine/decomp-bridge.ts` (single import surface).

## Coverage actuel (= post Phase 5)

- Bridged helpers : **256** (re-exports + inline macros)
- NotImplemented helpers : **10** (= GetMonData, GetSubstructPtr, etc.)
- Total calls dans le décomp : **41,164**
- Calls résolus (= bridgés + internes) : **38,731 = 94.1%**
- Calls non-résolus (= TODO) : **1355 = 3.3%** (top : GetObjectEventGraphicsInfo 29×, IS_BATTLER_OF_TYPE 18×, etc.)

## Pattern d'activation

### Étape 1 : choisir un module cible

Modules priorisés par order de débloque :
1. **event_object_movement-all-auto** (703 fns) — débloque 130 movement actions
2. **scrcmd-all-auto** (231 fns) — opcodes script manquants
3. **field_specials-all-auto** (189 fns) — specials simples
4. **field_effect-all-auto** (223 fns) — tall grass, jump dust, etc.
5. **overworld-all-auto** (210 fns) — sub-systems

### Étape 2 : vérifier que le module parse

```bash
npx tsc --noEmit --allowJs --skipLibCheck \
  src/engine/decomp-data/auto/src-all/<module>-all-auto.ts \
  --downlevelIteration --esModuleInterop --target es2020 \
  --module esnext --moduleResolution bundler 2>&1 | grep "error TS1"
```

→ Si **0 errors TS1xxx**, le fichier parse. Continue.
→ Sinon, fix le pattern dans `scripts/transpile-decomp-all.mjs` puis re-extrait.

### Étape 3 : injecter le bridge import

```bash
node scripts/inject-bridge-imports.mjs \
  src/engine/decomp-data/auto/src-all/<module>-all-auto.ts
```

Ajoute un `import * as _bridge from '../../../decomp-bridge'` + destructuring.

### Étape 4 : scanner les callsTo non-bridgés

Dans la console browser :
```js
dev.bridge.scanCallsTo('<module>')
```

Output : liste de callees qui font partie de :
- `bridged` (= ok via bridge)
- `notImplemented` (= will throw au call)
- `unbridged` (= TODO list)

### Étape 5 : porter les helpers manquants au bridge

Pour chaque helper dans `unbridged` :

a) **Si ça existe dans notre engine TS** → ajouter `export { X } from './<engine-file>';` dans `decomp-bridge.ts` + ajouter `'X'` dans `__bridgedHelpers__`.

b) **Si c'est une macro simple** (ARRAY_COUNT-style) → inline dans `decomp-bridge.ts`.

c) **Si c'est complexe et pas porté** → `throw new Error('[bridge] X not yet 1:1 ported. See <file>.c:<line>.');`. STRICT 1:1 — pas de stubs silencieux.

### Étape 6 : importer une fonction du module dans le runtime

Dans `src/engine/<existing-file>.ts` :
```ts
import { MovementAction_SlideDown_Step1 } from './decomp-data/auto/src-all/event_object_movement-all-auto';

// Use it :
const result = MovementAction_SlideDown_Step1(objectEvent, sprite);
```

### Étape 7 : tester

a) **Build** : `npx vite build --mode development` — doit pas casser.
b) **Live** : ouvre Vite dev → trigger le code path qui utilise la fonction.
c) **Coverage** : `dev.bridge.coverage()` → vérifie que le %  augmente.

## Notes 1:1 STRICT

- **PAS** de fallback silencieux (= retourner 0/null/false). Si un helper ne peut pas faire 1:1, il **doit** throw.
- **PAS** de duplication de logique. Si une fonction est dans `auto/src-all/`, on l'utilise depuis là — pas de re-impl manuelle.
- **PAS** de modification des fichiers `auto/src-all/*-all-auto.ts` à la main. Ils sont régénérés par `transpile-decomp-all.mjs`.
- **OUI** d'ajouter au bridge des helpers existants dans notre engine.
- **OUI** d'inline les macros triviales (ARRAY_COUNT, MAP_NUM, etc.) dans le bridge.

## Workflow complet (= ré-exécution post-extracteur)

```bash
# Étape 1 : ré-extrait depuis le décomp.
node scripts/extract-decomp-all-functions.mjs

# Étape 2 : transpile vers TS (= 295 fichiers auto/src-all/*-all-auto.ts).
node scripts/transpile-decomp-all.mjs

# Étape 3 : injecte les bridge imports.
node scripts/inject-bridge-imports.mjs

# Étape 4 : valide la syntaxe globale.
node scripts/check-auto-syntax.mjs

# Étape 5 : verify build.
npx vite build --mode development
```

## Devtools

- `dev.bridge.help()` — liste les helpers
- `dev.bridge.coverage()` — % coverage global
- `dev.bridge.unbridgedCalls()` — TODO list (top helpers à porter)
- `dev.bridge.helperCallCount('X')` — combien de fichiers callent X
- `dev.bridge.moduleStatus('event_object_movement')` — status d'un module
- `dev.bridge.report()` — dump complet → `window.__bridgeReport`

## Roadmap (= ordre recommandé)

1. ✅ Phase 5 : bridge layer + dev tools (**commit b54d069e**)
2. ⏳ Phase 5.1 : OPUS transpiler agent fixes auto-files syntax (in progress)
3. 🔲 Phase 5.2 : injecter bridge imports → `node scripts/inject-bridge-imports.mjs`
4. 🔲 Phase 5.3 : scanCallsTo + porter top 20 unbridged → bridge
5. 🔲 Phase 5.4 : activer `event_object_movement-all-auto` → débloque 130 movement actions
6. 🔲 Phase 5.5 : activer `scrcmd-all-auto` → opcodes manquants
7. 🔲 Phase 5.6 : activer `field_specials-all-auto` → ChooseStarter real
8. 🔲 Phase 5.7 : activer `field_effect-all-auto` → tall grass, jump dust
9. 🔲 Phase 5.8 : activer `overworld-all-auto` → sub-systems
10. 🔲 Phase 5.9 : itérer sur les modules battle_* (= Phase 5 prep pour BattleScene)

Cf. `memory/audit-2026-05-09-total-1to1.md` pour les violations 1:1 connues.
Cf. `memory/helper-bridge-manifest.md` pour les top helpers (= mais désormais obsolete vu que le bridge porte directement).
