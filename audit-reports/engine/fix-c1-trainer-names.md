# FIX C1 — helpers maison « noms/classes de dresseurs » → fonctions décomp 1:1

Date : 2026-07-16 · Réf décomp : `D:/Projet 1/decomps/pokeemeraude` · `npx tsc --noEmit` = **0**

Suite au finding `audit-reports/engine/strings-util.md` (§🚨 MANQUES CRITIQUES #1-#3) :
les 2 fonctions canoniques `GetTrainerClassNameFromId` / `GetTrainerNameFromId`
(pokemon.c:6945-6957, « French Difference ») étaient ABSENTES du port ; scrcmd et
battle_message court-circuitaient la chaîne FR par des helpers maison.

## 1. Fonctions 1:1 portées (src/pokemon.ts:2489-2559)

Transcrites ligne-à-ligne, après `HandleSetPokedexFlag` (= ordre du .c : 6940 → 6945) :

```
GetTrainerClassNameFromId(trainerId) : if (id >= TRAINERS_COUNT) id = TRAINER_NONE;
  return GetTrainerClassNameGenderSpecific(gTrainers[id].trainerClass,
         gTrainers[id].encounterMusic_gender, gTrainers[id].trainerName);   // pokemon.c:6949
GetTrainerNameFromId(trainerId)      : if (id >= TRAINERS_COUNT) id = TRAINER_NONE;
  return gTrainers[id].trainerName;                                          // pokemon.c:6956
```

- `GetTrainerClassNameGenderSpecific` = la fn 1:1 DÉJÀ portée (international_string_util.ts:285)
  — non ré-implémentée, réutilisée.
- **Clamp `>= TRAINERS_COUNT` (855) → TRAINER_NONE (0)** identique au .c.
- Retour `const u8*` → `Uint8Array` (bytes charmap + EOS).

### Source de vérité `gTrainers[]` (précédent Match Call suivi EXACTEMENT)
Le Match Call (TOPDRESSEUR OK) lit `globalThis.__gTrainers` (peuplée par
`ensureGTrainersLoaded`, battle-trainer-data-bridge.ts) via le Proxy
`pokenav_match_call_data.ts:59` qui ré-encode `trainerName` (charCodes ASCII sans EOS
→ bytes GBA+EOS via `encodeOwText`, sinon StringCopy/StringCompare bouclent).
J'ai répliqué CE précédent dans pokemon.ts :
- Proxy `gTrainers` **export** (indexation numérique) + helper `_gTrainer(id)` qui lit
  `globalThis.__gTrainers` et ré-encode le nom — identique au Proxy pokenav (sibling).
- pokemon.ts est FONDATIONAL : import statique de `./international_string_util` ou
  `./text` FERME un cycle TDZ (`pokemon→text→window→decomp-globals→pokemon_animation→
  battle_anim_mons→party-storage→pokemon`, vérifié par script de reachability). D'où le
  **pont `globalThis.__intlStr`** (`{ GetTrainerClassNameGenderSpecific, encodeOwText }`,
  posé en fin de international_string_util.ts) lu lazy à l'exécution — **même discipline
  que le pont `__rtc` déjà en place (pokemon.ts:22-27) et que l'accès `__gTrainers`
  déjà fait en pokemon.ts:1327**. Seuls imports ajoutés au module fondational :
  `TRAINER_NONE/TRAINERS_COUNT` (opponents) + `EOS` (characters) = feuilles, zéro cycle.
- Garde-fou hurlant (Règle 3) : `_gTrainer` `console.error` + défaut si pont/`__gTrainers`
  absent, jamais `undefined` (pas de crash `.trainerClass`).

## 2. Convention buffer↔string (suivie du précédent dominant, jamais de mélange)

| Call-site | Contrat | Pont appliqué |
|---|---|---|
| scrcmd (opcode) | `setStringVar(idx, string)` | `decodeOwBytes(u8*)` — précédent `ScrCmd_bufferstring` (scrcmd.ts:1097) |
| battle_message `_resolveToCpy` | retourne `Uint8Array` (bytes) | AUCUN wrap : le 1:1 rend déjà des bytes |
| battle_message `_substitutePlaceholders` | retourne `string` | `decodeOwBytes(u8*)` (frontière décodeur `{B_X}`) |

## 3. Call-sites redirigés (8) + helpers supprimés (4)

**scrcmd.ts:1100/1107** (`ScrCmd_buffertrainerclassname/name`, scrcmd.c:2272-2288) →
`GetTrainerClassNameFromId` / `GetTrainerNameFromId` + `decodeOwBytes`. (2 sites)

**battle_message.ts** — les deux consommateurs :
- byte-level `_resolveToCpy` (B_TXT_TRAINER1/2_CLASS/NAME, ex-378/379/396/397) →
  `GetTrainerClassNameGenderSpecific(gTrainers[opp].trainerClass,
  gTrainers[opp].encounterMusic_gender & 0x7F, gTrainers[opp].trainerName)` et
  `gTrainers[opp].trainerName`. **1:1 battle_message.c:2583-2605 / 2643 / 2740-2770.** (4 sites)
- string-level `_substitutePlaceholders` (TRAINER1/2_CLASS/NAME) → idem + `decodeOwBytes`. (4 sites)

⚠️ **Masque `& 0x7F` conservé EXACT** en battle_message (c:2602/2751) — DIFFÉRENT de
`GetTrainerClassNameFromId` qui passe le champ `encounterMusic_gender` entier (c:6949).
battle_message n'appelle donc PAS `GetTrainerClassNameFromId` (ce serait un faux 1:1) mais
`GetTrainerClassNameGenderSpecific` directement, comme le .c. La classe LEADER + « LEVY&TATIA »
→ CHAMPION (perdue par l'ancien helper) est désormais gérée.

**Helpers maison SUPPRIMÉS :**
- `getTrainerClassNameFr`, `getTrainerNameFr` — harness/runtime/data-tables.ts (tombstones posés).
- `_resolveTrainerClassNameFr`, `_resolveTrainerNameFr` — battle_message.ts, + leur scaffolding
  mort (`_resolveTrainerKey`, `_trainerIdToKey`, `_buildTrainerIdCache`, l'import dynamique
  `opponents`, l'export ligne 1052). `_getTrainerOpponentB` conservé (toujours utilisé).
- Imports `getTrainer/getTrainerNameFr/getTrainerClassNameFr` retirés de scrcmd (`getTrainer`
  n'avait plus d'autre usage). Grep repo : **plus aucune référence CODE** aux 4 helpers.

## 4. Point data `trainerClass` (garde-fou step 5 — PAS corrigé, signalé)

**`gTrainers[].trainerClass` n'est PAS 0 partout** : la dette « trainerClass=0 au bridge »
(mémoire 2026-07-11) est **résolue** dans battle-trainer-data-bridge.ts:117
(`resolveDecompConstant(j.trainerClass) ?? 0`) — confirmé par le Match Call qui affiche
TOPDRESSEUR correctement (la chaîne id→classe→nom FR fonctionne). Rien corrigé côté data.

**Nuance de TIMING (à valider en jeu, non touchée)** : `__gTrainers` est chargée LAZY
(`ensureGTrainersLoaded`, déclenchée à la config d'un combat dresseur battle_setup.ts:395
et à l'ouverture du Match Call), pas au boot. Un `buffertrainername`/`classname` de script
FIELD exécuté AVANT tout combat/Match Call de la session tomberait sur le garde-fou hurlant
(défaut dégradé) là où l'ancien helper lisait `trainersTable` (chargée au boot). Combat +
post-combat + rematch = OK (data déjà chargée). Si un cas field pur casse, la correction 1:1
est de précharger `__gTrainers` au boot (concern DATA/bridge — hors périmètre de ce lot).

## Écarts / notes
- `src/battle_tower.ts:93` : **commentaire** (prose) mentionnant encore `_resolveTrainerNameFr`
  — référence désormais périmée, laissée telle quelle (hors périmètre, aucune incidence code).
- `getTrainer`/`trainersTable`/`loadTrainersTable` (data-tables) laissés en place (infra
  générale, non nommés dans le lot ; `noUnusedLocals=false` → pas d'erreur tsc).
- Fichiers interdits (decomp-runtime.ts, text_window.ts, wire-todo.ts, e2e, devtools) NON touchés.

## Fichiers modifiés
- `src/pokemon.ts` (+2 fns 1:1 + Proxy gTrainers + pont __intlStr + 2 imports feuilles)
- `src/international_string_util.ts` (pont __intlStr en fin de module)
- `src/scrcmd.ts` (2 opcodes redirigés + imports)
- `src/battle_message.ts` (8 call-sites redirigés + suppression helpers/scaffolding/export)
- `harness/runtime/data-tables.ts` (2 helpers supprimés)
