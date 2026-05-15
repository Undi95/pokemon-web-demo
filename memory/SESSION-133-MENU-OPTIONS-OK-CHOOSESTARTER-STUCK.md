# Session 133 — Menu options/start OK ✅, ChooseStarter MARCHE en fait ✅, bugs annexes identifiés (2026-05-15)

## TL;DR (corrigé après vraie investigation)

User parti dormir, m'a demandé : "si menu option/start corrigé, essaye de tout faire et de gagner le combat vs zigzaton".

Au reveil + reprise après compact, le user a clarifié plusieurs points :
- **Le combat hardcodé via `dev.battle.startWild` ne prouve rien** — c'est juste visuel (= la baisse de stats est cosmétique, aucun damage calc réel, attaques pré-scriptées). On a `battle_setup.c` qui set ARCKO/ZIGZATON puis quelques tours fixes.
- **Le vrai test** = l'event tuto Birch : fade in/out correct, special ChooseStarter qui marche, combat prof avec **les vrais opcodes** battle (= Phase 1 roadmap).
- **Première session avait conclu trop vite** : "bug ChooseStarter écran noir bloquant" → en fait c'était un état corrompu après que le combat hardcodé ait été lancé manuellement via devtools. Le flow normal **MARCHE END-TO-END** ✅.

### Résultats vraie investigation

1. ✅ **Menu START 1:1** : POKéDEX, POKéMON, SAC, PLAYER, SAUVER, OPTIONS, RETOUR
2. ✅ **Menu OPTIONS 1:1** : VIT.TEXTE 1/2/3, ANIMAT.COMBAT, STYLE COMBAT, SON, MODE BOUTONS, FENETRE, RETOUR — tout fonctionnel
3. ✅ **Path tuto Birch complet** (via interact sac de Birch sur Route 101) :
   - Logs trace ALL states traversés correctement :
     - `LOAD_ASSETS → WAIT_LOAD → FADE_OUT_OVERWORLD → SCENE_INIT → WAIT_FADE_IN_BIRCH → SPAWN_SPRITES → PROMPT_INIT → PROMPT_WAIT → WAIT_INPUT → ASK_CONFIRM_INIT → ASK_CONFIRM_WAIT → WAIT_CONFIRM → COMMIT_INIT → LAUNCH_FIRST_BATTLE → battle done outcome=1 WIN → WAIT_FIRST_BATTLE → FADE_OUT_BIRCH → WAIT_FADE_OUT_BIRCH → CLEANUP → WAIT_FADE_IN_OVERWORLD → DONE`
   - Brendan choisit TREECKO (= ARCKO/BOIS GECKO) → confirm OUI → fade out → first wild battle vs ZIGZATON Lv 2 → ARCKO ÉCRAS'FACE×3 → outcome=1 WIN → fade in OW
   - msgbox `Route101_Text_YouSavedMe` ("PROF. SEKO: Ouf… …Tu m'as sauvé. Merci beaucoup! ...Hé, c'est toi, PLAYER! ...Allons au LABO POKéMON, OK?") s'affiche

## Bugs identifiés (à fixer)

### Bug 1 : `scope.where()` retourne MAP_LITTLEROOT_TOWN au lieu de MAP_ROUTE101

**Repro** : aller à Route 101 via la connection nord de Littleroot → `scope.where()` retourne `MAP_LITTLEROOT_TOWN (x, y)` au lieu de `MAP_ROUTE101 (x, y)`. `gMapHeader.id` est correct (= "MAP_ROUTE101"), c'est `gameState.map.name` qui n'est pas synced après une connection (= il reste figé sur la map primaire du dernier warp explicite).

**Fix** : `_where()` dans `src/engine/dev-scope.ts:79-95` doit prioriser `gMapHeader.id` :
```ts
const hdr = _g<{ id?: string }>('gMapHeader');
const mapId = hdr?.id ?? gs?.map?.name ?? ...
```
Modifié en session 133. **HMR n'a pas propagé le fix** (= scope object déjà installé sur window capture l'ancienne référence `_where`). Solution : recharger la page après edit OU exposer scope comme Proxy / getter pour re-read à chaque appel.

**Note** : `dev.info()` retourne BG state, pas mapId. Pas d'autre devtool simple pour query le mapId courant à part `globalThis.gMapHeader.id`.

### Bug 2 : Sac de Birch reste visible après combat tuto

**Symptôme** : après le combat tuto Zigzagton + fade-in overworld, le NPC `OBJ_EVENT_GFX_BIRCHS_BAG` (localId 3) reste visible à coords (7, 14). Au ROM original, **le sac est censé disparaître pendant le combat, pas être encore là à la sortie**.

**Décomp script** `Route101_EventScript_BirchsBag` (data/maps/Route101/scripts.inc:218) :
```
fadescreen FADE_TO_BLACK
removeobject LOCALID_ROUTE101_ZIGZAGOON
setobjectxy LOCALID_PLAYER, 6, 13
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
special ChooseStarter
applymovement LOCALID_ROUTE101_BIRCH, Route101_Movement_BirchApproachPlayer
waitmovement 0
msgbox Route101_Text_YouSavedMe, MSGBOX_DEFAULT     ← on est ici quand bag visible
special HealPlayerParty
setflag FLAG_HIDE_ROUTE_101_BIRCH_ZIGZAGOON_BATTLE
clearflag FLAG_HIDE_LITTLEROOT_TOWN_BIRCHS_LAB_BIRCH
setflag FLAG_HIDE_ROUTE_101_BIRCH_STARTERS_BAG       ← bag hide ICI dans script
```

Le décomp script set `FLAG_HIDE_ROUTE_101_BIRCH_STARTERS_BAG` **après** le msgbox. Mais le user (qui A/B test avec ROM original) confirme que **visuellement, le sac disparaît pendant le combat / au plus tard au fade-in OW**.

**Hypothèses root cause** :
1. Le décomp ROM cache le sac via un autre mécanisme (= peut-être un OAM hide automatique lors du ChooseStarter scene + jamais re-spawn parce que le script ne fait pas exit immédiatement après cleanup).
2. Le mapping object_events de Route 101 a une condition de visibility liée à `FLAG_RESCUED_BIRCH` (déjà set au début du script BirchsBag) → quand on respawn les NPCs après ChooseStarter, le bag est filtré out.
3. Notre port respawn le bag NPC parce qu'on ne check pas le bon flag.

**À investiguer** : `src/engine/object-events.ts` `SpawnObjectEvent` ou équivalent — vérifier si le bag a un `flagId` ou `trainerFlag` qui doit le filtrer après set des bons flags.

### Bug 3 (mineur) : Cry SE encoding error pour ZIGZATON + ARCKO

Logs warn :
```
[music] cry fail ZIGZATON EncodingError: Unable to decode audio data
[music] cry fail ARCKO EncodingError: Unable to decode audio data
```
À investiguer dans `src/engine/music.ts:playCry` + cry asset path resolution. Probablement les fichiers WAV cry sont mal formatés ou path incorrect pour ces species. Pas bloquant gameplay.

## Architecture confirmée 1:1 décomp

- **`special ChooseStarter`** dans `script-opcodes.ts:1065-1077` → délègue à `startChooseStarterFlow()` via dynamic import. State machine 20 states 1:1 décomp `CB2_ChooseStarter` flow.
- **`battle-flow.ts:startBirchTutorialBattle()`** lance le first wild battle (= 1:1 `CB2_StartFirstBattle` battle_setup.c:930-948).
- **`SetupNativeScript(ctx, () => flow.tick())`** = pattern propagé pour tous les UI flows inline (ChooseStarter, BirchTutorialBattle, WallClock, etc.).

## Devtools utilisés + gaps identifiés

### Devtools actuels (`dev-scope.ts`)
```js
window.scope.where()               // string "MAP_X (x, y) facing DIR" - BUG après connection
window.scope.press('a'/'b'/'up'/'down'/'left'/'right'/'start'/'select')
window.scope.walk(dir, n)
window.scope.ai(['a', 'wait 30', 'a']) // chain actions avec délais
window.scope.party() / .battle() / .dialog() / .npcs() / .flags() / .vars()
window.scope.script()              // {status: 0=RUNNING, 1=WAITING, 2=SHUTDOWN}
window.scope.tile(x, y)
window.scope.see() / .snapshot() / .compare()
window.scope.help()

dev.fade()                         // gPaletteFade state
dev.battle.startWild(species, lv)  // contournement combat (cosmétique seulement!)
dev.battle.outcome()               // 1=win, 2=lose
dev._rt                            // runtime engine direct
dev.info()                         // BG state + frame + sprites
dev.sprites / .windows / .bgs / .blend / .tasks / .printers / etc.
```

### Gaps identifiés (à ajouter en session 133)
- **`scope.where()`** prioriser `gMapHeader.id` (= synced après connection)
- **`scope.whereObj()`** : retourne objet structuré pour query précis
- **`scope.sprites()`** : list sprites visible + invisible, coords, anim, template
- **`scope.fade()`** : alias rapide vers `dev.fade()`
- **`scope.skipDialog(maxTicks)`** : auto-spam A jusqu'à dialog fermé (= utile pour skip msgboxes longs)
- **`scope.starterChoose()`** : expose le state du starter-choose-flow pour debug
- **`scope.gotoMap(mapId, x, y)`** : helper warp pour skip à un point précis

## Pour prochaine session

### Tâche en cours (= immediate)
1. Fix bug bag de Birch (= Bug 2). Investigation : object_events Route101 + flagId du bag NPC.
2. Reprendre roadmap Phase 1 battle interpreter (= porter les 238 opcodes stub depuis `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`).

### Phase 1 battle interpreter — priorité
Le combat actuel (= `battle-flow.ts:startBirchTutorialBattle`) est **hardcodé** (pas 1:1 décomp). Pour vrais combats, il faut le **battle script interpreter** (= skeleton créé session 132 dans `src/engine/battle/script-interpreter.ts`).

Niveau 1 (= damage flow basic, 11 opcodes) :
- `0x00 Cmd_attackcanceler`
- `0x01 Cmd_accuracycheck`
- `0x03 Cmd_ppreduce`
- `0x04 Cmd_critcalc`
- `0x05 Cmd_damagecalc`
- `0x06 Cmd_typecalc`
- `0x07 Cmd_adjustnormaldamage`
- `0x0B Cmd_healthbarupdate`
- `0x0C Cmd_datahpupdate`
- `0x19 Cmd_tryfaintmon`
- `0x49 Cmd_moveend`

Estimation : ~1 semaine. Tout Phase 1 (8 niveaux) ~3-4 semaines.

## État final session 133

- Branche `upd2`
- Worktree `hungry-moore-a74774`
- Preview server 5173 toujours running
- Logs StarterChoose ajoutés (= 1 line tracer dans `starter-choose-flow.ts` tick())
- Fix `_where()` appliqué dans `dev-scope.ts` mais HMR pas propagé (= reload nécessaire)
- Save state intact : ARCKO Lv5 + JIRACHI Lv100 + 2nd ARCKO Lv5 (= reçu via ChooseStarter)
- Bag de Birch encore visible à Route 101 (bug 2)
- msgbox `YouSavedMe` ouvert (PROF. SEKO: Ouf...)
