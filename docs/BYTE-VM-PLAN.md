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

## Phase 2 — compilateur (assembleur) — le DUR

Objectif : `Map<label, Opcode[]>` (niveau macro, format actuel) → `Map<label,
Uint8Array>` (bytecode) + tables de liens.

Sous-problèmes :
1. **Préprocesseur** `#ifdef/#ifndef/#else/#endif` : évaluer contre le set de
   defines de la décomp par défaut (ex. `UBFIX`). Aujourd'hui le moteur les drop
   en silence (warn noop) → décider du comportement 1:1.
2. **Expansion des composites** : msgbox→`loadword 0,text`+`callstd type` ;
   goto_if_eq→`compare`+`goto_if` ; frontier_*→`setvar`+`special` ; etc.
   (récursif ; gérer `.if/.ifb/.elseif/.else` + args par défaut). Source = le champ
   `composites{}` du JSON Phase 1.
3. **Linker labels/pointeurs** : les `.4byte` pointeurs (goto/call/msgbox/
   applymovement/pokemart…) référencent d'autres scripts/textes/data **par label**.
   Notre identité étant **STRING** (scripts/maps/textes par label, pas adresse ROM),
   décision d'archi à prendre : **espace d'adresses synthétique** — chaque
   script/texte/blob compilé reçoit une adresse u32 synthétique ; un registre
   `addr→{kind,ref}` permet à `ScriptReadWord` de rendre l'adresse et au handler de
   résoudre la cible. Les slots `map` (2o) → index dans une table de noms de map.
   ⇒ garde la VM byte-fidèle (`ScriptRead*` lit de vrais octets) tout en restant
   compatible string.
4. **Special id** : `special`/`specialvar` encodent `SPECIAL_<fn>` en 2o → besoin
   d'une table `SPECIAL_* → id` (`data/specials.inc`) + le flag waitstate
   (`SPECIAL_WAITSTATE_*`).

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
