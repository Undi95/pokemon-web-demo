# Carte de fidélité 1:1 — Opcodes de script overworld (`ScrCmd_*`)

> **Pilote d'audit multi-agent, 2026-06-21.** Produit par 2 auditeurs Opus **indépendants, lecture seule**
> (cross-check), recoupés contre une énumération déterministe + vérification manuelle du lead.
> Sous-système = les ~220 `ScrCmd_*` du décomp `src/scrcmd.c`, dispatchés par `gScriptCmdTable`
> (`data/script_cmd_table.inc`, 227 entrées dont ~7 → `ScrCmd_nop1` vanilla).

## Niveaux de confiance (à respecter)
- **✅ CONFIRMÉ-MOI** : lead a lu le code des deux côtés et vérifié. Fiable.
- **✅ CONFIRMÉ-CONVERGENCE** : les 2 agents l'ont trouvé **indépendamment**. Fiable.
- **🟡 PISTE** : 1 seul agent l'a jugé, l'autre a marqué INCERTAIN (fichier non lu). **À vérifier avant d'agir.**

---

## Résultat stratégique (✅ CONFIRMÉ-CONVERGENCE)

**C'est un backlog de FIDÉLITÉ, pas de COUVERTURE.** Les 220 opcodes ont **tous** un handler enregistré
(100 % des noms via `registerOpcode`, 351 enregistrements). Aucun n'est totalement absent. Le travail
restant = **~15-30 divergences/stubs ciblés**, pas des milliers de fonctions. Ça change la nature du
chantier : reconnaître/corriger des patterns connus, pas réinventer.

### Architecture confirmée (impacte tous les verdicts)
- Notre VM (`script-runtime.ts`) est **label-based**, pas bytecode-RAM-based. Les opcodes raw qui
  manipulent des pointeurs RAM (`loadword`/`setptr`/`copybyte`/`goto_if` raw…) sont **no-op LÉGITIMES**
  (N/A-archi), **pas des stubs** — notre extracteur émet directement les super-macros expansées.
- **Super-macros** (1 nom → plusieurs raw opcodes, reproduites en effet net) : `msgbox` (loadword+callstd),
  `switch`/`case` (copyvar+compare+goto_if_eq), `giveitem` (additem+callstd), `goto_if_eq/_ne/…`
  (compare+goto_if), `dofieldeffectsparkle` (setfieldeffectargument×3+dofieldeffect).

---

## Backlog priorisé (par levier = réutilisation × gravité)

### ✅ FAIT cette session
| opcode | était | fix | commit | vérif |
|---|---|---|---|---|
| `gotostd_if`/`callstd_if` | condition IGNORÉE → std toujours exécuté (bug silencieux) | porte `sScriptConditionTable` + gate sur `comparisonResult` | `276cd9e1` | sonde 10/10 |
| `random` | `Math.random()` (non-déterministe) | LCG `Random()` 1:1 | `adf9e3f9` | sonde 12/12 |

### 🔴 HAUT levier — à attaquer ensuite
1. **Table des `special`/`specialvar`** (✅ CONFIRMÉ-CONVERGENCE) — les opcodes `special`(1075 usages)/
   `specialvar`(345) sont **FIDÈLES**, MAIS la table des specials qu'ils dispatchent est en grande partie
   des **stubs loggés**. C'est LE plus gros levier réel : chaque special manquant casse un script.
   → **Prochain sous-système d'audit recommandé** (même méthode : 2 auditeurs croisés + vérif).

### 🟠 Divergences confirmées (✅ CONFIRMÉ-CONVERGENCE, sauf noté)
| opcode | verdict | note | réutil. |
|---|---|---|---|
| `setweather` | DIVERGENT | set direct sans `TranslateWeatherNum`/`UpdateRainCounter` (cycles météo Route 119/123 inactifs) | 25 |
| `doweather` | STUB | no-op (pas de VFX météo runtime : pluie/sable/cendre) | 15 |
| `giveitem` | DIVERGENT | fait QUE l'additem (msgbox « a reçu… » + fanfare laissés au script appelant — à vérifier que l'extracteur émet le couple) | 160 |
| `playbgm` | DIVERGENT | ignore le flag `save` (`Overworld_SetSavedMusic`) → musique de map mal restaurée post-combat | 53 |
| `getplayerxy` | DIVERGENT (✅ CONFIRMÉ-MOI) | lit `GetCurrentMap().x/y` au lieu de `gSaveBlock1Ptr->pos` — **à confirmer** si la valeur coïncide en archi unifiée | 12 |
| `warpdoor`/`warphole`/`warpteleport`/`warpmossdeepgym`/`warpspinenter`/`warpwhitefade` | DIVERGENT | tous alias de `warp` (perdent leur anim spécifique : porte/spin/white fade) | var. |
| `bufferstdstring`/`bufferboxname` | STUB | renvoient `''` (table gStdStrings/box names non extraite) → placeholders vides | moy. |
| `buffernumberstring` | DIVERGENT | pas `ConvertIntToDecimalStringN` (alignement/digits) | via msgbox |
| `messageautoscroll`/`pokenavcall`/braille | STUB | log+skip (UI/police absentes) | bas-moy |

### 🟢 Cœur VÉRIFIÉ fidèle (✅ CONFIRMÉ-MOI / CONVERGENCE)
Tous les opcodes HAUTE réutilisation sont **FIDÈLES** : `msgbox`(4440), `applymovement`(2013),
`waitmovement`(1676), `delay`(2098), `setvar`(1856), `case`(1532), `release`(1447), `setflag`(889),
`setmetatile`(873, ✅ CONFIRMÉ-MOI : `x+MAP_OFFSET`, `MAPGRID_IMPASSABLE` 1:1), `lock`/`lockall`/
`releaseall`/`faceplayer`, `goto`/`call`/`goto_if_*`, `playse`(362), `special`(opcode), `warp`(122),
`message`/`waitmessage`/`closemessage`, `playmoncry`/`waitmoncry`, `fadescreen`, item/flag/money de base.

### 🟡 PISTES à vérifier (1 agent a jugé STUB, l'autre INCERTAIN — fichiers non relus)
Avant d'agir, **ouvrir et lire les deux corps** : `shop.ts` (pokemart), `decoration.ts`, `contest.ts`
(seuls les `=> false` confirmés via grep), `slot-machine.ts`, `rotating-tile-puzzle.ts`, `pc-storage.ts`
(checkpcitem), `berry.ts`, `tv.ts`, `mystery-event.ts`, `battle.ts` (corps des trainerbattle), la 2e
moitié de `money-coins.ts` (boxes UI argent/jetons via globalThis).

---

## Notes outillage
- ⚠️ **`npm run audit:scrcmd` est CASSÉ** (`scripts/audit-scrcmd.mjs` lit un chemin périmé
  `src/engine/script-opcodes.ts` qui n'existe plus). À réparer pour servir de 2e cross-check déterministe.
- Hook de vérif : `window.__scriptRuntime.getOpcodeHandler('nom')` (commit `2427b631`) permet d'invoquer
  un opcode en isolation avec un ctx contrôlé (`comparisonResult`, args) — réutilisable pour la suite.
- Énumération déterministe : `data/script_cmd_table.inc` (décomp) vs `grep "registerOpcode('"` (nous).

## Méthode (réutilisable — cf. memory `audit-game-mirror-validate-on-touch`)
2 auditeurs Opus **indépendants lecture seule** (type `Plan` = pas d'Edit/Write) sur le **même** set borné,
brief identique exigeant **citation `fichier:ligne` par affirmation** + verdict INCERTAIN si non lu.
Convergence = confiance ; divergence = « un a lu, l'autre a honnêtement dit qu'il n'avait pas lu ».
Le lead vérifie un échantillon des claims à fort enjeu (ici 5/5 ont tenu, zéro hallucination).
