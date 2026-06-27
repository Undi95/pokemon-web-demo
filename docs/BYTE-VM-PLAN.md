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
5. **Sérialiseur + linker — RESTE (dernière pièce Phase 2)** : opcodes réels →
   octets via les `argLayout` du cmd-table (u8/u16/u32 ; `map`=2o group/num via
   table de noms ; `stringvar`=1o STR_VAR_*→0/1/2 ; `special`=id 2o + waitstate ;
   variants `*AT` par présence d'arg `map` ; `trainerbattle` par type). **Linker**
   per-map : 1 image contiguë { scripts + textes (charmap) + mouvements + mart
   lists }, 2 passes (layout des offsets → émission + patch des pointeurs). Rôle
   de chaque `.4byte` (codeptr/textptr/dataptr/nativeptr/value) déduit du nom
   d'arg. Natifs (callnative/gotonative) → table de symboles synthétique.

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
