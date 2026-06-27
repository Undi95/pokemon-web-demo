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
2. **Compilateur (assembleur).** JSON macros → octets. Le DUR : expansion des
   composites + résolution de **labels/pointeurs** (linker). Voir « Phase 2 ».
3. **Byte VM.** `ScriptContext.scriptPtr` = buffer + offset ; `ScriptRead{Byte,
   Halfword,Word}` ; `RunScriptCommand` lit l'id → dispatch par id.
4. **Réécrire les ~225 handlers** : `(ctx, args[])` → lecture via `ScriptRead*`.
5. **Re-vérifier TOUT le jeu** (intro, chaque PNJ, cutscenes, maps, Frontier).

⚠️ Risque max = système nerveux du jeu ; casse toute interaction pendant le
chantier → d'où la branche sandbox. Multi-session.

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

## Phase 3 — byte VM

`ScriptContext` : remplacer `{scriptOpcodes, scriptIdx}` par `{scriptPtr: {buf,
off}}` (+ stack idem). `ScriptReadByte/Halfword/Word` (little-endian). Dispatch :
id → handler (table `gScriptCmdTable` = tableau de 227 fonctions).

## Phase 4 — handlers

Réécrire les ~225 `ScrCmd_*` : signature `(ctx) => bool`, lecture via
`ScriptRead*`, résolution des pointeurs via le registre synthétique. ÉNORME.

## Phase 5 — re-vérification

Cold-boot + A/B : intro (♂/♀), PNJ, cutscenes, warps, OnLoad/OnTransition/OnFrame/
OnWarp, Frontier (post-game, tolérant). `__scriptRuntime.getOpcodeHandler` etc.
