# Session 129 — Plan refactor 1:1 décomp architectural

**Date** : 2026-05-11
**Branche** : `upd2`, worktree `hungry-moore-a74774`
**Dernier commit OK** : `0fe45fe9` (= asset std_menu.pal)
**Avant** : `bf15a954` SAC TMHM format final + context menu FONT_NARROW + toss qty

## 🎯 Mission utilisateur (textuel)

> "Je veux être 1:1 100% bordel Claude. Si je suis 100% partout, tout s'emboite,
> mais depuis le début tu cherche a faire des shortcut et des MVP et voilà ou
> on en est."

> "Ecrire un plan sur comment être 1:1 dans l'état du projet actuel"
> "Réparer ce system architectural qui va nous casser les couilles à vie si on
> fait pas 1:1 maintenant."
> "Pas de limite de token, pas de limite du tout. J'ai perdu trop de temps."
> "tout tes changement doivent être rétro actif, et tout cod dupliqué supprimé."
> "Si tu vois une erreur, un WIP, un stub qu'on peut changer, un MVP, ou un
> shortcut, tu corrige."

> "Utilise le projet pour comprendre le projet, ca doit être un puzzle pas des
> piece hardcodée mise bout à bout."

## 🐛 Problème architectural à fix

**Le bug** : pendant le sac (et autres menus), l'overworld continue de tick en
parallèle. Conséquences :
- Save/restore manuel de BG VRAM + OBJ palettes + tilemaps au open/close du sac
- Hook `_syncSubspriteOam` pour cacher les OAM OW
- `setFieldCameraSuspended(true/false)` pour bloquer scroll
- Tilemap corruption visible : context menu frame avec rayures purple/dark
  qui leak depuis BG2 fond rayé
- OW corruption au close (= state non-correctement restauré)

**Le décomp** : `SetMainCallback2(NewCB2)` swap le main callback. L'OW arrête
complètement de tick. État OW préservé naturellement parce que sa scène
"dort". Au close, `SetMainCallback2(gMain.savedCallback)` redémarre l'OW
depuis zéro (re-init BG, re-load char data, re-draw map). Cf. la pattern
déjà implémentée pour OPTIONS via `CB2_InitOptionMenu` + `CB2_ReturnToFieldWithOpenMenu_Manual`.

**Décision utilisateur** : Option A = scene swap proper 1:1 décomp.
- Stoppe l'OW tick pendant menu
- Restore l'OW depuis zéro au close (= comme `_restoreOverworldFromMenu`)
- **Pas de shortcut**

## 📋 Plan détaillé pour la prochaine session post-compact

### Étape 1 — Audit current architecture (READ-ONLY)

Lire pour comprendre :
- `src/scenes/TestOverworldScene.ts` (l. 353) `MainCB2_Overworld` closure
- `src/scenes/TestOverworldScene.ts` (l. 471) `_restoreOverworldFromMenu`
- `src/engine/decomp-runtime.ts` (l. 1432) `SetMainCallback2`
- `src/engine/decomp-runtime.ts` (l. 1899-2050) `tickFixed` / `runOneFrame`
- `src/engine/option-menu-return.ts` (= template CB2 swap return)
- `src/engine/start-menu.ts:442-466` (= template `optionsAction` CB2 swap)
- `src/engine/bag-screen.ts` (= notre cible à refactor)

### Étape 2 — Créer le pattern CB2_Init pour bag

Réutiliser massivement le pattern option-menu :

**`bag-screen.ts` nouveau code** :
1. `export function CB2_InitBagMenu()` (1:1 décomp `CB2_InitBagMenu` item_menu.c) :
   - State machine 0..N (BG reset, palette setup, BG init, windows alloc, etc.)
   - 1:1 décomp `BagMenu_InitBGs` + `LoadBagMenuTextWindows` +
     `LoadBagMenuGraphics` + `LoadAllocatedTextWindowMessageBoxGfx_` +
     `BlendPalettes(PALETTES_ALL, 16, 0)` + `BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)`
   - À la fin : `SetMainCallback2(MainCB2_BagMenuRun)`

2. `function MainCB2_BagMenuRun()` (1:1 décomp `CB2_Bag`) :
   - Préfix `MainCB2` → le runtime tickFixed exécute RunTasks + AnimateSprites etc.
   - Body : `TickBagScreen` actuel adapté + `UpdatePaletteFade`

3. `function Task_FadeAndCloseBagMenu(taskId)` (1:1 décomp `Task_FadeAndCloseBagMenu`) :
   - `BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK)`
   - `gTasks[taskId].func = Task_CloseBagMenu`

4. `function Task_CloseBagMenu(taskId)` (1:1 décomp idem) :
   - Wait `!gPaletteFade.active`
   - `DestroyListMenuTask` + `FreeBagMenu`
   - `SetMainCallback2(gMain.savedCallback)`  // = CB2_ReturnToFieldWithOpenMenu_Manual

### Étape 3 — Adapter `start-menu.ts:sacAction`

```ts
function sacAction(): boolean {
  void preloadBagAssets().then(() => {
    gMain.state = 0;
    gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;  // déjà existant
    const rt = getRuntime();
    rt.SetMainCallback2(CB2_InitBagMenu);
  });
  return true;
}
```

### Étape 4 — Supprimer les hacks

Dans `bag-screen.ts`, supprimer :
- ❌ `_savedSyncSubspriteHook` + hook `globalThis._syncSubspriteOam` (l.1132-1153)
- ❌ `setFieldCameraSuspended(true)` au open (l.1065)
- ❌ `setFieldCameraSuspended(false)` au close (l.2256)
- ❌ Snapshot OBJ VRAM + restore (`_savedObjVram`, l.1097-1107, 2316+)
- ❌ Snapshot OBJ palettes + restore (`_savedObjPalettes`, l.1100-1106, 2317+)
- ❌ Snapshot BG VRAM + restore (`_savedBgState`, l.990-1039, 2240-2287)
- ❌ Le state `_isOpen` peut être simplifié — la scene swap garantit le state
- ❌ `_phase = 'fading_in' / 'fading_out'` géré par CB2 state machine

### Étape 5 — Refactor autres menus (= "que les autres files suivent le tempo")

Mêmes hacks à supprimer pour les menus qui les ont :
- `party-screen.ts` (TBD audit)
- `trainer-card-screen.ts` (TBD audit)
- `pokedex-screen.ts` (TBD audit)
- `naming-screen-impl.ts` (= déjà partiellement avec hook _syncSubspriteOam)
- `summary-screen.ts` si existant
- `option-menu-impl.ts` = déjà fait, modèle de référence

### Étape 6 — Cleanup code dupliqué

Audit pour duplication :
- `_setupBackgroundTilemap` doit être éliminé (= rolled into CB2_InitBagMenu state machine)
- Le pattern `_savedBgState` est dupliqué dans plusieurs menus — extraire dans
  un helper commun OU le supprimer entièrement après le refactor scene swap
- `option-menu-return.ts` peut être renommé `field-return.ts` ou similar pour
  refléter qu'il est partagé entre tous les menus (bag, options, party, etc.)

### Étape 7 — Vérifier tests visuels

Boot from `?debug` :
1. Bag opens (= context menu, toss flow, swap)
2. Bag closes → OW restored properly (= pas de corruption sprite/BG)
3. Start menu other options (party, trainer card, pokedex, save, options, exit)
4. No regression on intro / starter choose / battle flow

## ⚠️ Règles strictes

- **PAS DE SHORTCUT.** Pas de MVP, pas de stub, pas de WIP.
- **1:1 décomp partout.** Si la décomp fait X, on fait X.
- **Pas de code dupliqué.** Si le pattern existe (= option-menu), on réutilise.
- **Tout doit être rétroactif.** Le refactor doit pas casser l'intro / starter
  / battle / starter choose / etc.
- **Utiliser les ressources du projet.** Décomp source + assets extraits +
  scripts + JSON déjà disponibles. Pas hardcoder.

## 🔗 Fichiers clés à consulter

| Fichier | Pourquoi |
|---|---|
| `D:/Projet 1/decomps/pokeemeraude/src/item_menu.c` | Source décomp bag (CB2_InitBagMenu, etc.) |
| `D:/Projet 1/decomps/pokeemeraude/src/option_menu.c` | Template décomp (CB2 swap) |
| `D:/Projet 1/decomps/pokeemeraude/src/overworld.c:1505,1638,1670,1961` | RunFieldCallback / ReturnToFieldLocal |
| `D:/Projet 1/decomps/pokeemeraude/src/field_screen_effect.c:440` | FieldCB_ReturnToFieldOpenStartMenu |
| `D:/Projet 1/pokemon-web-demo/src/engine/option-menu-return.ts` | Template TS du retour OW |
| `D:/Projet 1/pokemon-web-demo/src/engine/start-menu.ts:442` | Template TS du CB2 swap |
| `D:/Projet 1/pokemon-web-demo/src/engine/bag-screen.ts` | Cible refactor |

## 🚨 État courant du SAC (commit bf15a954)

**Fonctionnel mais avec hacks** :
- ✅ Pixel-perfect sauf context menu (= corruption rayures purple/dark)
- ✅ Context menu + toss + swap + shake + scroll arrows + chevrons
- ✅ TMHM format CT01 NOM ×N (qty droite), CS01 NOM (sans qty)
- ✅ Tous les 376 items via `?debug`
- ❌ Hacks save/restore VRAM/palettes (à supprimer post-refactor)
- ❌ Hook `_syncSubspriteOam` (à supprimer)
- ❌ `setFieldCameraSuspended` (à supprimer)
- ❌ Corruption BG VRAM context menu (= cause root architecturale)
