# Byte-VM — réécriture 1:1 du moteur de script (`script.c`)

> Branche dédiée **`Byte-VM`** (depuis `finale` `3b34ce7f`). Réussite → merge `finale` ;
> échec → suppression de la branche, zéro perte. Décision user 2026-06-27.

## Pourquoi

Le moteur actuel (`src/script.ts`) est un **dispatch par NOM** : les scripts JSON
(`public/decomp/em/scripts/*.json`) sont des chaînes au niveau **macro source**
(`"goto_if_set FLAG_X, Label"`, `"msgbox Text_X, MSGBOX_DEFAULT"`), parsées en
`{name, args:string[]}` et dispatchées via `getOpcodeHandler` (364 opcodes dans
`src/scrcmd.ts`).

La décomp est une **VM bytecode** : `scriptPtr` = `u8*` ; `ScriptReadByte` → id de
commande → `gScriptCmdTable[id]` ; chaque handler lit ses args via
`ScriptReadByte/Halfword/Word`. Atteindre `script.c` à **100% 1:1** (notamment
`ScriptReadHalfword/Word`, le **RAM script**, l'injection d'events custom voulue
par le user — multi, complétion dex) exige une vraie VM byte, pas un pont
byte↔opcode (que le user a refusé).

## Les 5 phases

1. **Cmd-table (FONDATION) — ✅ FAIT.** `name → {cmdId, argLayout}` extrait des 2
   sources canoniques. Voir ci-dessous.
2. **Compilateur (assembleur) — ✅ FAIT.** JSON macros → octets (image globale +
   linker). Voir « Phase 2 ».
3. **Byte VM — ✅ FAIT + PROUVÉ EN JEU.** `src/script_bytevm.ts` (1:1 `script.c`).
   Voir « Phase 3 ».
4. **Handlers `ScrCmd_*` — ✅ 100,0 % de l'usage couvert.** `src/scrcmd_bytevm.ts`.
   Voir « Phase 4 ».
5. **Swap + re-vérif TOUT le jeu — 🔄 FONCTIONNEL flag-gated `?bytevm`** (parsé = défaut). Voir « Phase 5 ».

⚠️ Risque max = système nerveux du jeu ; casse toute interaction pendant le
chantier → d'où la branche sandbox. Multi-session.

## ⏱️ Statut rapide (mise à jour avant compact)

| Phase | Statut | Artefact |
|---|---|---|
| 1. Cmd-table | ✅ | `public/decomp/em/script-cmd-table.json` (227 opcodes) |
| 2. Compilateur + linker image-globale | ✅ | `compile-scripts.cjs` → `script-bytecode.json` (gitignoré) |
| 3. VM core (1:1 `script.c`) | ✅ prouvé en jeu | `src/script_bytevm.ts` |
| 4. Handlers (1:1 `scrcmd.c`) | ✅ **100,0 % usage** (52686/52686) | `src/scrcmd_bytevm.ts` + voie A `scrcmd_object/door/fieldeffect/flash/trainer`, `script_menu/shop/decoration/heal_location/special_flows` |
| 5. Swap + re-vérif + **CLEAN** | ✅ **byte-VM = SEUL moteur** (parsé retiré : scrcmd.ts 3852→55) | `src/script.ts` (routage) + `bytevm-boot.ts` |

**Commits sur `Byte-VM`** : `c331854c` (Ph1) → … → `cbc478bf` (trainerbattle + preuve visuelle). `finale` intacte (`3b34ce7f`).
**Tests déterministes EN JEU (26 verts, 0 erreur)** : `window.__byteVm.{test,testSpecials,testDialogue,testNpc,testMovement,testWarp,testWarpVariants,testMoney,testItem,testMetatile,testObject,testObjectMovement,testBuffers,testPlayer,testWeather,testDoor,testFieldEffect,testVobject,testFade,testFlash,testGiveMon,testLongTail1-4,testTrainerbattleArgs}` (harness/devtools/dev-bytevm-tools.ts).

### 👁️ Vérification « voir par code » (condition user 2026-06-27, PROUVÉE)
Le gros (combats/menus) est vérifiable SANS test manuel via **2 canaux concordants** :
1. **État live** `window.__byteVm.battleState()` — inBattle / gBattleTypeFlags /
   gTrainerBattleOpponent_A / gBattleOutcome / party ennemie (espèce/level/hp) /
   battlers. (Globals combat module-internes → lus via le harness.)
2. **Pixels réels** `preview_screenshot` du canvas **240×160** (vrai framebuffer GBA).
Démontré : `launchTB(318)` (byte-VM dotrainerbattle) → battleState {opponent 318,
flag TRAINER, enemyParty species286 Lv5} ↔ screenshot « Un combat est lancé par
GAMIN CALVIN! ». 🔧 déclencheurs : `dev.battle.startWild(sp,lvl)` / `__byteVm.launchTB(id)`.
**Oracle de couverture** : `scratchpad/bytevm-coverage.cjs` (expand-composites → usage opcode réel).

---

## Phase 1 — cmd-table (FAIT)

**Outil :** `scripts/extract-script-cmd-table.cjs` (déterministe, ré-exécutable).
**Sortie :** `public/decomp/em/script-cmd-table.json` (~165 KB).

**Sources parsées (canon décomp) :**
- `data/script_cmd_table.inc` → `SCR_OP_* → cmdId` (ordre enum, **227** entrées
  0x00..0xE2 ; chaque cmdId cross-validé contre le commentaire `@ 0xNN`).
- `asm/macros/event.inc` → layout d'octets de chaque opcode réel (`.byte`=u8 /
  `.2byte`=u16 / `.4byte`=u32|ptr), + sous-émetteurs (`map`=2o group/num,
  `stringvar`=1o, `formatwarp`=map+warpId+x+y=7o, `special`=`SPECIAL_x` 2o).
- `asm/macros/battle_frontier/*.inc` + `battle_tent.inc` + `trainer_hill.inc` →
  composites Frontier/Tent/Hill (s'expandent vers `setvar`+`special CallXFunc`).

**Contenu du JSON :**
- `enum[]` : 227 `{op, cmdId, handler}` ordonnés.
- `opcodes{}` : **225** opcodes réels `{op, cmdId, handler, args:[{name,width,kind,
  fixed?}], totalBytes}`. Cas spéciaux fidèles :
  - `kind` : `u8`/`u16`/`u32`/`map`/`stringvar`/`special`.
  - variants `*AT` (`applymovement`/`waitmovement`/`addobject`/`removeobject`) :
    `{selectedBy:'map', variants:[{when:'map_absent',...},{when:'map_present',...}]}`.
  - `trainerbattle` : préfixe `type/trainer/local_id` + `byType{}` (1–4 pointeurs
    selon `TRAINER_BATTLE_*`).
  - `special`/`specialvar` : `appendsWaitstate:true` (waitstate implicite si le
    special est marqué `SPECIAL_WAITSTATE_*` — voir `data/specials.inc`, Phase 2).
  - alias à valeurs fixes (`showplayer`→SHOWOBJECTAT, `hidemoneybox`, …) : slots
    `fixed`.
- `composites{}` : **247** macros sans octet de commande (msgbox, giveitem,
  goto_if_eq, switch/case, frontier_*, *tent_*, trainerhill_*, …) avec leur corps
  brut (à expander en Phase 2).

**Validation :** ✅ 227/227 cmdId couverts par ≥1 macro émettrice ; ✅ zéro
directive inconnue dans les opcodes réels.

**Couverture de la surface réelle** (scan des 470 JSON, 1er token de chaque ligne) :
tous les opcodes des **vrais fichiers de map** sont couverts (opcodes réels +
composites). Les "inconnus" résiduels sont, par nature, hors moteur `script.c` :
- **autres DSL** (mouvements `walk_*`/`step_end`, anim de combat `createsprite`,
  scripts de combat `attackstring`, AI `if_effect`, …) → moteurs séparés.
- **artefacts d'extraction** : `#ifdef UBFIX / #else / #endif` (correctifs
  conditionnels de la décomp) dans ~7 maps ; agrégats `_all.json`/`_common.json`
  pollués par des tokens de combat. → à gérer/nettoyer en Phase 2.

---

## Phase 2 — compilateur (assembleur) — le DUR — EN COURS

Objectif : `Map<label, Opcode[]>` (niveau macro, format actuel) → `Map<label,
Uint8Array>` (bytecode) + tables de liens.

**Décision d'archi : précompilation BUILD-TIME (CJS), comme la ROM.** Le runtime
(Phase 3) exécutera du bytecode déjà compilé (fidèle = la ROM contient du
bytecode). La logique d'assemblage pourra plus tard être portée en TS pour
l'injection d'events custom au runtime (vision user). Outils dans `scripts/lib/`.

Sous-problèmes & état :
1. **Table des specials — ✅** `scripts/extract-specials-table.cjs` →
   `specials-table.json` (527, ordre = id `gSpecials[]`, 99 waitstate, 3 doublons
   vanilla last-wins). Pour encoder `special`/`specialvar` (id 2o + waitstate).
2. **Résolveur de constantes — ✅** `scripts/lib/decomp-constants.cjs` : toute
   constante décomp → nombre (source primaire = les `.h`, 13211 constantes).
3. **Expansion des composites — ✅** `scripts/lib/expand-composites.cjs` : déplie
   récursivement (substitution `\param`+défauts, `.if/.ifb/.ifnb/.elseif/.else`).
   **Validé** : `scripts/validate-script-expansion.cjs` expanse les 32960 lignes
   overworld des 468 maps → 42902 opcodes réels, **0 non résolu**.
4. **Préprocesseur** `#ifdef UBFIX/#else/#endif` : ~21 lignes dans ~7 maps. À
   évaluer contre les defines décomp par défaut (le moteur actuel les drop). RESTE.
5. **Sérialiseur + assembleur — ✅** `scripts/lib/assemble-script.cjs` : opcodes
   réels → octets via les `argLayout` du cmd-table. **Archi finale = buffers
   par-script + registre de symboles synthétiques u32** (id→{kind,label} pour
   script/text/movement/mart/native ; `map`=u16 id ; `stringvar`=1o STR_VAR_*→0/1/2 ;
   `special`=id 2o + waitstate conditionnel). Familles à layout variable 1:1 : warp
   (formatwarp, valeurs selon nb d'args), trainerbattle (byType), variants `*AT`
   (choix par arg `map`), + défauts de params. Pointeur `.4byte` : si résoluble en
   nombre → valeur ; sinon → id symbole (native si callnative/gotonative).
   **Validé** : `validate-script-assembly.cjs` = 6659/6716 scripts (165 Ko bytecode,
   10400 symboles), LOCALID per-map + fallback global. Gate de régression (exit 0
   hors tail). **Tail documenté (57 scripts, non bloquant)** : `ITEM_TM_*` (TM nommés
   absents des includes du décomp — incohérence), `STR_VAR_2`/`COMPARE_SIZE_*`/
   `MAP_NUM()` (edge cases).

6. **Préproc `#ifdef` + émission — ✅** `scripts/compile-scripts.cjs` : compile les
   468 maps → `public/decomp/em/script-bytecode.json` (artefact régénérable,
   gitignoré : 6390 event scripts / 165 Ko bytecode, 269 tables map_script gardées
   parsées, 57 tail). Préproc fidélité RETAIL (`config.h #if MODERN || BUGFIX` →
   UBFIX/BUGFIX OFF → corps `#ifdef UBFIX|BUGFIX` skippés, `#ifndef` gardés).
   Round-trip vérifié byte-exact (`setvar VAR_TEMP_1,1;return` → `16 01 40 01 00 03`).

**PHASE 2 = DONE.**

### Architecture finale du linker (mise à niveau fidélité — commit `2aa99f32`)

⚠️ **Découverte clé : le FALLTHROUGH.** ~5 % des scripts (778) n'ont **pas de
terminateur** (`end`/`return`/`goto`) et comptent sur le fait de **tomber dans le
script contigu suivant** (comme dans la ROM, où les scripts sont à la suite). Des
buffers séparés par-label CASSERAIENT ces 778 → pas 1:1. ⇒ `compile-scripts.cjs`
est un **LINKER** qui concatène tous les event scripts (common + maps, en **ordre
source**) dans **une image globale contiguë** → fallthrough préservé.

- Pointeurs **script→script** (goto/call/event-script de trainerbattle…) = **vrais
  offsets globaux** dans l'image (relocations patchées en 2 passes) — comme des
  adresses ROM. `scriptPtr` = curseur `{buf:image, off}` ; goto = `off = offset`.
- Ressources **irréplicables** (texte/mouvement/mart/natif/RAM-global) = **ids de
  symboles** (`id→{kind,label}`), résolus au runtime par le handler (getText/…).
- Refs **map** = ids MapSymbols (identité-map STRING).
- Les scripts d'**autres moteurs** (combat/anim/AI/field-effect) présents dans
  `_common` sont filtrés (échec d'expansion = opcode hors event.inc → 1893 exclus).

**Vérifié** : 7840 scripts compilés (204 Ko image), **1906/1906 goto/call → offset
valide** (round-trip OK), expansion 0 trou, assemblage 0 régression. **Tail = 4 occ**
edge (STR_VAR_2 ×2, COMPARE_SIZE ×2, MAP_NUM ×1 = identité-map STRING, impossible).
ITEM_TM/HM résolus 1:1 via tm-hm.json.

## Phase 3 — byte VM — ✅ FAIT

`src/script_bytevm.ts` = transcription 1:1 de `script.c`. `ScriptContext.scriptPtr`
= curseur `{ buf: Uint8Array, off }` (remplace `const u8*` ROM) ; stack[20] de
curseurs (snapshot par valeur) ; `ScriptReadByte/Halfword/Word` LE ;
`RunScriptCommand` lit `cmdCode = buf[off++]` → dispatch `gScriptCmdTable[cmdCode]`
(stop si `>= cmdTableEnd` ou handler null) ; `ScriptPush/Pop/Jump/Call/Return` ;
API `ScriptContext_*`. Loader : `loadByteVmImage()` (base64→Uint8Array + symboles) ;
`ptrFromOffset/ptrFromLabel`. **Non câblé au moteur vivant** (le moteur parsé
`script.ts`/`scrcmd.ts` reste live jusqu'au swap).

## Phase 4 — handlers — 🔄 EN COURS (99,2 % de l'usage, keystone trainerbattle ✅)

`src/scrcmd_bytevm.ts` = handlers 1:1 `scrcmd.c`, signature `(ctx) => bool`, lecture
via `ScriptRead*`, installés dans `gScriptCmdTable[cmdId]` via l'enum du cmd-table.
**159/227 cmdId, 99,2 % de l'usage opcode overworld réel.**

**Familles FAITES** (chacune vérifiée déterministe en jeu — état + alignement du flux) :
- état/flux · special/specialvar · dialogue (gotostd/callstd/message/waitmessage/
  closemessage ; symbole id 0 = NULL) · lock/release/faceplayer · applymovement/
  waitmovement(+at) · warp/warpsilent + **warp variants** (setwarp/setdivewarp/
  setholewarp/setescapewarp/setdynamicwarp) · money · item · coins · delay/
  waitbuttonpress/incrementgamestat/checkplayergender/trainer-flags · son (hardware-
  exempt) + savebgm/fadedefaultbgm/fadenewbgm · setmetatile · **object ops** (voie A) ·
  **buffers** (buffer*name/stdstring/string/numberstring/boxname) + getplayerxy/
  getpartysize · **weather** (setweather/resetweather/doweather → vraies fns
  field_weather_effect) · **doors** (voie A) · **field-effects** (voie A) ·
  createvobject/turnvobject · **object-movement** (turnobject/copyobjectxytoperm/
  setobjectmovementtype, voie A) · **fadescreen**(+speed/swapbuffers) · random/
  setberrytree/setmaplayoutindex/setstepcallback/money+coins box · checkpartymove/
  dotimebasedevents/v*(vgoto/vcall/vgoto_if/vmessage)/setvaddress/copybyte ·
  setobjectsubpriority/reset(voie A)/erasebox/getpokenewsactive/messageautoscroll ·
  setmonmove/braillemessage/closebraillemessage · **flash** (setflashlevel/animateflash,
  voie A) · givemon/giveegg · **trainerbattle + dotrainerbattle + gotopostbattlescript
  + gotobeatenscript** (KEYSTONE).

**VOIE A (validée user) = source unique, zéro divergence.** Modules partagés appelés
par LES DEUX moteurs (closures `scrcmd.ts` recâblées + handlers byte-VM) :
`src/scrcmd_object.ts` (object-ops + subpriority + movement-type) ·
`src/scrcmd_door.ts` · `src/scrcmd_fieldeffect.ts` · `src/scrcmd_flash.ts` ·
`battle_setup.ts` (trainerbattle : abstraction `TrainerArgSource` → tables byType +
switch partagés, source string[] parsé / curseur binaire byte-VM ;
`startTrainerBattleAndGetPoll` partagé). Interface object = args STRING ; le byte-VM
passe `String(localId num)` (fallback numérique des helpers + `findTemplateByLocalId`).

**KEYSTONE trainerbattle** : le byte-VM EXÉCUTE le vrai `trainer_battle.inc`
(event-scripts présents dans l'image, ex. `EventScript_TryDoNormalTrainerBattle`=34585).
`trainerbattle` peek mode → `configureTrainerBattleCore` → saut event-script ;
bridge symbole-texte→label / ret-addr→curseur ; continuation `sTrainerBattleEndScript`
élargie pour tenir `{buf,off}`. Prouvé par code : `testTrainerbattleArgs` (byType→
opponent=42) + `launchTB(318)` (combat Calvin réel, état↔pixel).

**2 fixes infra** : namespace `event_object_movement` ajouté au résolveur runtime
(`harness/runtime/decomp-constants.ts`) ; `findTemplateByLocalId` gagne un fallback
numérique (1:1 décomp). `gMaxFlashLevel`/`SetFlashLevel` déplacés dans scrcmd_flash.

**RESTE (le tail, ~0,8 % usage)** : combats annexes (setwildbattle/dowildbattle/
choosecontestmon/showcontestpainting/playslotmachine) · menus UI (multichoice×3/
yesnobox/pokemart×3/hidemonpic/showmonpic/pokenavcall) · niche (checkitemtype/
warphole/adddecoration/checkdecorspace/rotating-tile puzzle/setrespawn). ⚠️ 4-5 sont
couplés à des sous-systèmes non audités (shop/slot/puzzle/concours) → si gap réel :
STOP + flag user (pas de fake). Oracle : `scratchpad/bytevm-coverage.cjs`.

## Phase 5 — swap + re-vérification — ✅ FINALISÉ : byte-VM = DÉFAUT (le système nerveux)

**Approche SÛRE retenue (vs swap-fichier brutal)** : `script.ts` GARDE son API publique
et route en interne vers `script_bytevm.ts`. **Le byte-VM est le moteur par DÉFAUT**
(`_useByteVm = true`, commit `6d7a5acd`) ; `?parsed` rebascule sur l'ancien moteur parsé
(filet de secours, retiré au « clean »).

1. **Routage (fait)** — `src/script.ts` : `_useByteVm` (URL `?bytevm`) ; route
   Lock/Unlock/Are + ScriptContext_Init/IsEnabled/RunScript/SetupScript/Stop/Enable +
   RunScriptImmediately → équivalents byte-VM. `src/bytevm-boot.ts` installe
   image+handlers+specials (import dynamique awaité depuis `loadMapScripts`, anti-cycle
   `script↔scrcmd_bytevm`). DONNÉES (tables map_script_2, getText/getMovement) restent
   parsées ; les triggers OnLoad/Transition/Frame/Warp/Coord trouvent le label via
   données parsées puis EXÉCUTENT via byte-VM (`ptrFromLabel`).
2. **Flows `special` inline — voie A** : `src/special_flows.ts`
   (`makeSpecialInlineFlowPoll`) partagé par les 2 moteurs → ChooseStarter / Birch /
   FieldShowRegionMap / BedroomPC|PlayerPC / wallclock / rematch / Bag_ChooseBerry.
3. **🩸 GOTCHA lock unifié (fix `55e8f9b1`)** : il y avait 2 flags `sLockFieldControls`
   SÉPARÉS (script.ts + script_bytevm.ts) → désync (combat/warp/global tapent l'un OU
   l'autre). Symptômes : freeze post-combat (lock résiduel) PUIS warp cassé (1ères
   rustines unlock-on-SHUTDOWN/route-Enable, abandonnées). **Fix** : (a) flag UNIQUE
   `globalThis.__sLockFieldControls` ; (b) `ScriptContext_Init` (byte-VM) DÉVERROUILLE
   (reset = aucun script ⇒ pas de lock-script ; appelé qu'au reset, pas chaque frame).
4. **Re-vérif cœur (faite, A/B en jeu, `?bytevm`)** : marche libre · warp PC entrée+
   sortie · combat sauvage Magicarpe Lv1 KO→pas de freeze · wall clock · multichoice/
   yesnobox · dialogue NPC. Diag : `window.__byteVm.diag()`.
5. **byte-VM = DÉFAUT puis CLEAN (faits)** : `_useByteVm` retiré → byte-VM inconditionnel
   (commit `6ea8ded9`) ; `scrcmd.ts` réduit 3852→55 lignes — les 361 handlers parsés + leur
   interpréteur RETIRÉS (commit `8fc1093f`), ne reste que l'infra `special` (registerSpecial/
   invokeSpecial) + signal waitstate (SignalWaitState/consumeWaitStateSignal). BONUS : fix
   `ScrCmd_waitstate` byte-VM (honore SignalWaitState + warp/map-change ; avant = hang).
6. **RESTE (mineur, « après »)** : résidu parsé entremêlé dans script.ts (primitives utilisées
   par les tables de triggers map_script_2 + inline/snapshot devtools/intro) ; intro
   end-to-end. NB : item ball / species «?» / box-switch = **PAS** le swap (interaction
   inanimé / moteur combat pré-existant — chantier combat séparé).
