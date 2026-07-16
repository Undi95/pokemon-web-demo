# DECOMP-MAP — la carte complète décomp × port (mode d'emploi)

> Générateur/requêteur : `scripts/decomp-index.cjs` · index machine :
> `audit-reports/DECOMP-INDEX.json` · doublons : `audit-reports/DECOMP-INDEX-dupes.md`.
> Ce document est le MODE D'EMPLOI de la carte, pas la carte (les ~96 000 entrées
> vivent dans le JSON, régénérable à l'identique).

```
node scripts/decomp-index.cjs                 # (re)génère tout + stats console (~2 s)
node scripts/decomp-index.cjs --sym <regex>   # fiche(s) symbole (où décomp, quoi, où TS)
node scripts/decomp-index.cjs --sym <re> --kind <k>   # filtre par kind
node scripts/decomp-index.cjs --file battle_main.c    # brief chantier d'un fichier décomp
node scripts/decomp-index.cjs --dupes         # rapport doublons (console)
node scripts/decomp-index.cjs --regen --sym X # forcer la régén avant une requête
```

Les requêtes lisent le JSON existant (et le régénèrent s'il manque). La régén
complète relit décomp + port : à relancer après une vague de transpilation/dédup.

## Ce que couvre l'index (TOUTE la décomp, root compris)

| groupe JSON | kinds | sources décomp | entrées* |
|---|---|---|---|
| `functions` | `function` | `src/**/*.c` + `src/**/*.h` + `include/**/*.h` (+ `gflib/` si présent — **absent de CETTE décomp**, layout ancien : tout est dans `src/`) | 15 630 |
| `defines` | `define`, `func_macro` | tous les `#define` des `.h` ET `.c` + **synthèse des constantes générées au build** (voir plus bas) | 20 507 |
| `enums` | `enum_member` | membres d'enums nommés et anonymes des `.h`/`.c` (hors corps de fonctions), valeur résolue quand littérale/incrémentale ou expression numérique pure (`1 << 5`), sinon `raw` | 5 409 |
| `types` | `struct`, `union`, `typedef`, `enum` | définitions de types des `.h`/`.c` (nom + fichier:ligne, pas les champs) ; le `typedef` pointe le DÉBUT du statement | 694 |
| `globals` | `global` | variables col-0 des `.c`/`.h` : `extern`, `EWRAM_DATA`/`IWRAM_DATA`/`COMMON_DATA` (→ `extra.storage`), `static`, tables `const`, fn-pointers (`extra.fnptr`) | 34 077 |
| `data` | `data_label` | labels `Nom:`/`Nom::` de `data/**/*.inc|.s` + `sound/**/*.inc|.s` (`extra.exported` = `::`) + directives `.global` | 20 017 |

\* volumes à la génération de référence (2026-07-16) — les stats vivantes sont dans
`meta.counts` du JSON et dans la sortie console.

**Constantes générées au build** (absentes des `.h` du source) : `MAP_*` et
`LAYOUT_*` sont synthétisées depuis les JSON de la décomp, formule reprise de
l'émetteur officiel `tools/mapjson/mapjson.cpp` — `MAP_<ID> = (mapIdx | (groupIdx
<< 8))` (mapjson.cpp:554, l'index repart à 0 à chaque groupe de
`data/maps/map_groups.json`), `LAYOUT_<ID>` = index 1-basé dans
`data/layouts/layouts.json`, trous compris (mapjson.cpp:651), `MAP_GROUPS_COUNT`
(mapjson.cpp:563). Chaque `MAP_*` pointe la ligne `"id"` de SON `map.json`
(`extra.generated: "map_groups.h"`). Non synthétisés : `MAP_DYNAMIC`/`MAP_UNDEFINED`
(hardcodés dans le tool, pas dérivables d'un fichier source).

**Hors périmètre** (assumé) : `asm/` (libs asm non-C), `graphics/` (assets),
`tools/`, le contenu des `map.json` autre que l'`id`, `sound/` binaire. Les
homonymes (`static` du même nom dans N fichiers) = N entrées distinctes — « sans
doublon » signifie pas d'entrée redondante, pas de fusion des homonymes
(ex. `VBlankCB` static existe dans 113 fichiers : 113 entrées).

## Le croisement port (`port` de chaque entrée)

Le port scanné = `src/**/*.ts` + `harness/**/*.ts` + `include/**/*.ts` du repo web
(460 fichiers, hors `.d.ts`).

- `{"status":"declared","decls":["src/task.ts:17", …]}` — déclaration FORTE et
  TOP-LEVEL (col 0, module scope) : `function X` / `const X` / `let/var/class/
  interface/type/enum X`, `export` ou non. Les méthodes de classe, clés d'objet et
  variables locales (indentées) ne comptent PAS. Les stubs
  `const X: any = __wireTodo('X')` ne comptent PAS comme déclaration.
- `"variant":"_Nom"` — déclaré sous une convention de drift historique
  (`Nom_Manual`, `_Nom`, `_nom`) : porté mais nom non exact (compté « drift »).
- `{"status":"referenced","wireTodo":true}` — référencé uniquement via
  `__wireTodo('X')` (proxy inerte, câblage manquant — même détection que
  STUBS-INVENTORY).
- `{"status":"referenced"}` — le nom apparaît dans le port (identifiant de code OU
  littéral de chaîne — les labels byte-VM sont référencés en string) sans
  déclaration forte. Signal FAIBLE : un local TS homonyme suffit.
- `{"status":"absent"}` — nulle part.

## Le rapport doublons (`DECOMP-INDEX-dupes.md`) — l'or de la dédup Phase C

Un doublon = un symbole avec une déclaration forte dans 2+ fichiers TS. Quatre
sections, triées par gravité :

1. **VRAIES DUPES** — 2+ déclarations dans le MIROIR (`src/` + `include/`) : deux
   implémentations concurrentes dans l'arbre 1:1 (« quelle version tourne ? »).
   Sous-tables : fonctions/globals/labels (l'or) puis constantes.
2. **MIROIR + HARNESS** — adaptation moteur en parallèle du miroir : vérifier que
   le miroir délègue (pas deux vérités).
3. **HARNESS uniquement.**
4. **HORS-DÉCOMP** — noms inventés côté port déclarés 2+ fois (ex.
   `MainCB2_BagMenuRun`) : 4a noms pleins (même gravité qu'une vraie dupe),
   4b wrappers locaux `_Nom` d'un symbole décomp (pattern transpileur assumé,
   compactés), 4c helpers `_xxx` du port. Ces symboles sont aussi dans le JSON
   (`tsOnlyDupes`, clé racine).

## Position vis-à-vis des oracles existants (pas un 3ᵉ oracle divergent)

- **`audit-callgraph-closure.cjs`** — répond « quelles DÉPENDANCES d'une fonction
  portée manquent ? » (fermeture transitive). L'index REPREND À L'IDENTIQUE son
  scanner `stripCode` (gère `//*p = x;`), sa regex `FN_DEF` et sa `LABEL_DEF` :
  **compte de fonctions identique, vérifié 15 630 = 15 630, zéro écart par
  fichier**. L'index ajoute : defines/enums/types/globals exhaustifs, les lignes,
  signatures/valeurs, le statut port PAR symbole et les doublons. Pour préparer un
  chantier : `decomp-index --file X.c` (état), puis `audit-callgraph-closure --file
  X.c` (trous transitifs).
- **`cartograph-1to1.cjs`** — vue PAR FICHIER (« quel .ts héberge quel .c, à quel
  % »). Il SOUS-estime (matching par basename + normalisation) — documenté. Ses
  catégories-domaines sont reprises ici pour les stats « % porté par domaine ».
- **`build-ts-symbol-index.cjs`** — index des EXPORTS TS pour le résolveur
  d'imports du transpileur. L'index décomp détecte en plus les déclarations
  non-exportées (col-0) avec leurs lignes, et exclut les stubs `__wireTodo`.

## Vérifications d'exhaustivité (faites à la création, reproductibles)

1. **vs oracle callgraph** : réplication exacte de son parseur sur le même corpus →
   **15 630 fonctions des deux côtés, zéro diff par fichier** (le « ~15 629 » de la
   mémoire était un arrondi). Le compte inclut les `static inline` des headers.
2. **20 échantillons variés vérifiés à la main (20/20)** : fonction battle
   (`HandleTurnActionSelectionState` battle_main.c:4129) · `FLAG_BADGE08_GET`
   (flags.h:1366) · `SPECIES_TREECKO` (species.h:283 — les espèces sont des
   `#define` dans cette décomp, pas des enums) · membre d'enum
   (`B_POSITION_PLAYER_LEFT` battle.h:28, valeur 0) · static homonyme (`VBlankCB`
   ×113 fichiers, 6 vérifiés) · `gText_ThankYouForAccessingMysteryGift`
   (event_scripts.s:943) · EventScript de map (scripts.inc:4) · `struct
   Dma3Request` (dma3_manager.c:11) · `struct Pokedex` (global.h:212) ·
   macro fonctionnelle `ScriptReadByte` (script.h:22) · global EWRAM
   `gAIScriptPtr` (battle_ai_script_commands.c:154) · `VAR_RESULT` (vars.h:296) ·
   `MOVE_SURF` · `ITEM_SCANNER` · `MAP_LITTLEROOT_TOWN` (synthétisé,
   map.json:2) · typedef `LINK_MANAGER` (AgbRfu_LinkManager.h:150) ·
   `Common_Movement_Delay32` (movement.inc:87) · fn-pointer `COMMON_DATA`
   `PollFlashStatus` (agb_flash.c:10) · label sound `gSongTable`
   (song_table.inc:8) · `union AnimCmd` (sprite.h:74).
3. **3 fichiers .c comptés indépendamment** (accolades col-0 + analyse des
   candidats) : `dma3_manager.c` = 5, `scanline_effect.c` = 9, `battle_main.c` =
   105 — l'index colle aux trois ; les 3 candidats écartés de battle_main.c sont
   bien de la data (`sTurnActionsFuncsTable`, `sEndTurnFuncsTable`,
   `sText_ShedinjaJpnName`), indexée côté `globals`.

## Limites connues (honnêtes)

- `referenced` est un signal faible (tout identifiant du code ET des strings TS).
- Déclarations TS comptées à la colonne 0 uniquement : un symbole déclaré indenté
  (namespace, `declare global`) n'est pas « declared » — voulu, le miroir 1:1 est
  plat.
- Les `#define` dupliqués par branches `#if` = entrées multiples (voulu, fichiers/
  lignes distincts). Les membres d'enum sous `#if` sont indexés pour TOUTES les
  branches ; après une valeur non résolue, les implicites suivants sont `raw`.
- Les stats port comptent par NOM unique (un homonyme porté quelque part compte
  porté) ; le détail par fichier reste dans les entrées.
- ~4 fonctions au style `NAKED`-sur-ligne-séparée peuvent échapper à `FN_DEF`
  (héritage assumé de l'oracle callgraph, même parseur).
- Deux runs consécutifs = JSON et dupes.md identiques à l'octet
  (`meta.generatedAt` est la chaîne fixe `"REGEN"`). Le JSON est compact,
  1 entrée par ligne → greppable (`grep '"name":"CreateTask"' DECOMP-INDEX.json`).

## Exemples de requêtes (sorties réelles abrégées)

**Fiche symbole** — où c'est dans la décomp, ce que c'est, où c'est dans le port :

```
$ node scripts/decomp-index.cjs --sym '^CreateTask$'
=== CreateTask (function) ===
  décomp : src/task.c:27
  détail : u8 CreateTask(TaskFunc func, u8 priority)
  port   : PORTÉ (exact)
           src/starter_choose.ts:241
           src/task.ts:17          ← 2 déclarations = vraie dupe (rapport §1)
```

**Brief chantier d'un fichier** — l'état d'un futur chantier en une commande :

```
$ node scripts/decomp-index.cjs --file dma3_manager.c
Fonctions : 5 (portées 5 · référencées 0 · absentes 0)
  [✓] CheckForSpaceForDma3Request (:163) → src/dma3_manager.ts:224
  …
globals : 3 (portés 3) · defines : 5 (portés 5) · types : 1 (porté 1)
```

**Familles de constantes** (`--kind` : `function`, `define`, `func_macro`,
`enum_member`, `struct`, `union`, `typedef`, `enum`, `global`, `data_label`) :

```
$ node scripts/decomp-index.cjs --sym '^FLAG_BADGE' --kind define
=== FLAG_BADGE01_GET (define) ===
  décomp : include/constants/flags.h:1359
  détail : = (SYSTEM_FLAGS + 0x7)
  port   : PORTÉ (exact) → include/constants/flags.ts:1220
  …
```

**Doublons** : `node scripts/decomp-index.cjs --dupes` (résumé console) ; le
détail complet trié par gravité est dans `audit-reports/DECOMP-INDEX-dupes.md`.

## Stats de la génération de référence (2026-07-16, arbre vivant → re-runner)

| groupe | entrées | noms uniques | déclarés port | référencés | absents |
|---|--:|--:|--:|--:|--:|
| functions | 15 630 | 15 381 | 8 216 (53 %, dont 428 drift) | 871 | 6 294 |
| defines | 20 507 | 19 680 | 11 049 (56 %) | 1 398 | 7 233 |
| enums | 5 409 | 5 326 | 1 710 (32 %) | 1 488 | 2 128 |
| types | 694 | 690 | 308 (45 %) | 55 | 327 |
| globals | 34 077 | 25 848 | 2 370 (9 %)* | 4 362 | 19 116 |
| data | 20 017 | 20 016 | 41 (0,2 %)** | 2 621 | 17 354 |

\* la plupart des globals C vivent en PROPRIÉTÉS d'objets runtime côté TS
(decomp-globals/decomp-runtime), pas en `const` top-level → « declared » les
sous-estime volontairement (voir l'oracle callgraph, champ `tsProps`, pour la
couverture par propriété).
\*\* les labels data/ sont consommés par la byte-VM via des STRINGS → le signal
utile est `referenced` (2 621), pas `declared`.

Fonctions déclarées par domaine (catégories cartograph) : Son 96 % ·
Pokémon/Party 70 % · Système/GBA 68 % · UI/Menu/Gfx 63 % · Combat 59 % ·
Overworld/Field 49 % · Item/Bag 49 % · Save/RTC 49 % · Autre 24 % ·
Link/IO (N-A) 8 %.

Doublons : **1 359 symboles décomp** déclarés dans 2+ fichiers TS (1 214 vraies
dupes miroir dont 231 fonctions/globals/labels · 144 miroir+harness · 1 harness) +
**280 hors-décomp** (100 noms pleins inventés · 76 wrappers `_Nom` · 104 helpers).
