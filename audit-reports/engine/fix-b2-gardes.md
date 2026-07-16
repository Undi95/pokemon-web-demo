# Fix B.2 — gardes moteur « hurlantes » (2026-07-16)

Lot cadré par un bug réel : « CARTE DE HOENN » du Pokénav throw `PokenavCallback_Init_RegionMap`
(`__wireTodo`, écran non câblé) ; le catch de `runTasks` laisse la task active → re-throw CHAQUE
frame → 1176 `console.error` identiques en 4 s → la cause racine (1er message, différent des
suivants) sort du ring buffer console. Les 4 gardes ci-dessous rendent le diagnostic possible
SANS changer aucun comportement d'exécution (seule la politique de log + des buffers
`globalThis.__*` de diagnostic changent).

Fichiers modifiés (uniquement ces 3) :
- `harness/runtime/decomp-runtime.ts` (points 1 et 2)
- `src/text_window.ts` (point 3)
- `src/engine/wire-todo.ts` (point 4)

`npx tsc --noEmit` = **0** (exit 0) après tous les édits.

---

## Point 1 — Déduplication des throws de tasks (`decomp-runtime.ts`) — FAIT

Helper local unique `_logTaskError(tag, err, fnName?)` (méthode privée du runtime) + câblé dans
le catch de `runTasks` :

```ts
try { t.func?.(t); } catch (e) { this._logTaskError('[runTasks] task threw', e, t.func?.name); }
```

Politique :
- **Ring buffer** `globalThis.__taskErrors` (50 entrées `{frame, fn, message, stack}`, stack
  complet) : conserve TOUTES les erreurs UNIQUES (une entrée par message).
- **Clé de dédup = `message`** (les stacks des répétitions sont identiques → inutile de les
  relogger). Table `globalThis.__taskErrorSeen` (Map message → `{count, firstFrame, lastLoggedFrame}`).
- **1re occurrence** → `console.error` complet : `[runTasks] task threw (frame F, fn=NAME) —
  [voir __taskErrors] :` suivi de l'objet `Error` (⇒ stack complet dans la console).
- **Occurrences suivantes** → compteur silencieux ; re-log court `(xN depuis frame F)` **au plus
  1× toutes les 300 frames par clé**.
- **La task n'est NI tuée NI désactivée** — le comportement d'exécution du jeu est strictement
  inchangé, seule la POLITIQUE DE LOG change.
- `frame` = `this.gMain.vblankCounter1` (compteur VBlank free-running, main.h).

Autres catch analogues dans le fichier : **AUCUN**. Le fichier ne contient qu'UN SEUL `catch`
(celui de `runTasks`). Les dispatches `callback1`/`callback2`/`vblankCallback` NE sont PAS
enveloppés de try/catch — les envelopper AJOUTERAIT un catch (changement de comportement : un
throw actuellement propagé serait avalé), ce qui violerait le 1:1. Donc je n'ai touché QUE le
catch existant, via le helper unique (prêt à être réutilisé si un futur catch analogue apparaît).

Dans le cas du bug Pokénav, c'est exactement ce catch qui absorbait les 1176 throws : le 1er est
maintenant loggé en entier + conservé dans `__taskErrors[0]`, les 1175 suivants sont comptés.

---

## Point 2 — Registres GPU non routés (`decomp-runtime.ts`) — FAIT

Helper local unique `_logGpuRegGap(kind, offset, value?)` (méthode privée) :
- Compteur GLOBAL cumulé `globalThis.__gpuRegGapCount` (toutes occurrences).
- Dédup `globalThis.__gpuRegGapSeen` (Set de clés `'r:'+offset` / `'w:'+offset`) → **1 seul
  `console.error` par (kind, offset) et par session**.
- `GetGpuReg` : lecture → `[GetGpuReg] registre 0xNN non modélisé → 0`.
- `SetGpuReg` : écriture → `[SetGpuReg] écriture registre 0xNN non routée (val=0xVVVV)`.

Câblage :
- `GetGpuReg` branche `default: return 0` → **conservée** (rend toujours 0), + `_logGpuRegGap('r', reg)`.
- `SetGpuReg` : le `switch` n'avait **AUCUN default** → toute écriture d'un offset non listé était
  avalée SILENCIEUSEMENT. Ajout d'un `default:` → `_logGpuRegGap('w', reg, value)` + `break`
  (aucune écriture — comportement 1:1 inchangé).

### Vérification du chemin d'écriture (⚠️ demandé)
- **Chemin d'écriture GPU du code jeu = `SetGpuReg` uniquement.** Le seul autre chemin qui touche
  des registres PPU est `src/scanline_effect.ts:_applyRegFromValue` (application par-scanline du
  buffer HBlank DMA) : il écrit DIRECTEMENT `gba.bg().config.hofs/vofs` + BLDALPHA, via une
  fonction distincte dans un autre fichier — **jamais** via `SetGpuReg`. Donc AUCUN offset routé
  par `SetGpuReg` n'est double-géré : pas de conflit, la garde ne peut hurler que sur un offset
  qui atteint réellement le `default`.
- `harness/runtime/gba-io-regs.ts` expose `REG_DISPSTAT`/`REG_VCOUNT` mais ce sont des **stubs
  inertes** (jamais écrits par `SetGpuReg` ; seuls `REG_IE`/`REG_IME` sont utilisés, par
  `main_menu.ts`). DISPSTAT/VCOUNT ne sont donc **routés par aucun autre chemin** → ce sont de
  vrais trous (HW non émulé), pas des offsets « gérés ailleurs ».
- **Aucun code `.ts` porté n'appelle `Set/GetGpuReg(REG_OFFSET_DISPSTAT|VCOUNT|GREENSWAP)`** (le
  setup d'interruptions décomp — RemapInterrupts/EnableInterrupts — n'est pas porté, HW-stubbé).
  ⇒ **la garde ne se déclenche 0 fois aujourd'hui** ; elle est purement là pour capturer un futur
  trou (registre écrit/lu mais non modélisé). Pas de whitelist nécessaire : rien à faire taire.

### Liste EXACTE routés vs non-routés

`GetGpuReg` — **ROUTÉ** (rend la vraie valeur) :
| Offset | Reg | | Offset | Reg |
|---|---|---|---|---|
| 0x00 | DISPCNT | | 0x18/1A | BG2 H/VOFS |
| 0x08 | BG0CNT | | 0x1C/1E | BG3 H/VOFS |
| 0x0A | BG1CNT | | 0x40/42 | WIN0H/WIN1H |
| 0x0C | BG2CNT | | 0x44/46 | WIN0V/WIN1V |
| 0x0E | BG3CNT | | 0x48 | WININ |
| 0x10/12 | BG0 H/VOFS | | 0x4A | WINOUT |
| 0x14/16 | BG1 H/VOFS | | 0x4C | MOSAIC |
| | | | 0x50/52/54 | BLDCNT/BLDALPHA/BLDY |

`GetGpuReg` — **NON ROUTÉ** (default → 0, désormais HURLE en lecture) :
- **0x20–0x3E** (BG2PA/PB/PC/PD, BG2X_L/H, BG2Y_L/H, BG3PA/PB/PC/PD, BG3X_L/H, BG3Y_L/H) —
  ⚠️ **ASYMÉTRIE réelle** : `SetGpuReg` route ces registres affine mais `GetGpuReg` NON → une
  lecture d'un registre affine rend 0. La garde surfacera ce trou si du code les relit.
- 0x02 GREENSWAP, 0x04 DISPSTAT, 0x06 VCOUNT (HW interruptions/scanline non émulés).
- tout offset ≥ 0x56 (son/DMA/timers — hors PPU).

`SetGpuReg` — **ROUTÉ** (case explicite) :
- 0x00 DISPCNT ; 0x08–0x0E BGxCNT ; 0x10–0x1E BGx H/VOFS ;
- **0x20–0x3E** affine BG2/BG3 (PA/PB/PC/PD + X/Y L/H) ;
- 0x40 WIN0H, 0x42 WIN1H, 0x44 WIN0V, 0x46 WIN1V, 0x48 WININ, 0x4A WINOUT, 0x4C MOSAIC ;
- 0x50 BLDCNT, 0x52 BLDALPHA, 0x54 BLDY.

`SetGpuReg` — **NON ROUTÉ** (avant : écriture silencieuse ; désormais HURLE en écriture) :
- 0x02 GREENSWAP, 0x04 DISPSTAT, 0x06 VCOUNT (VCOUNT read-only de toute façon) ;
- 0x4E (réservé) ; tout offset ≥ 0x56.

**Conclusion** : tous les registres de RENDU (0x00–0x54) sont routés par `SetGpuReg` ; `GetGpuReg`
couvre tout sauf les affine 0x20–0x3E. Les seuls offsets réellement non modélisés sont les
registres HW (DISPSTAT/VCOUNT/GREENSWAP), non atteints par le code porté aujourd'hui. La garde
est donc du diag pur : 0 faux positif runtime actuel, filet pour tout futur trou.

---

## Point 3 — Fallback palette messagebox (`src/text_window.ts`) — FAIT

`LoadMessageBoxGfx`, branche fallback (asset `gMessageBox_Pal` non préchargé) :
`console.warn(...)` → `console.error('[LoadMessageBoxGfx] gMessageBox_Pal not preloaded —
fallback hardcoded grey palette — RENDU FAUX, précharger via decomp-asset-net')`.
Le fallback (4 couleurs grises) reste FONCTIONNEL — on ne casse pas le boot, on hurle juste que
le rendu est faux.

---

## Point 4 — Garde d'atteinte des `__wireTodo` (`src/engine/wire-todo.ts`) — FAIT

Fonction locale `_recordWireTodoHit(name)` appelée dans les traps `apply` ET `construct` du Proxy,
**AVANT** le `throw` (throw identique — comportement inchangé) :
- `globalThis.__wireTodoHits` : ring 100, **dédupliqué par `name`** (une entrée `{name, frame,
  count}` par symbole ; `count++` sur ré-atteinte, `frame` = 1er hit).
- `frame` = `globalThis.__rt?.gMain?.vblankCounter1 ?? -1` (conforme à la spec).
- Permet à l'exerciseur E2E (Phase B.3) de lister les symboles non câblés RÉELLEMENT atteints en
  jeu, distincts des 219 wireTodo statiques du STUBS-INVENTORY.
- L'accès de propriété (`get`) ne throw pas et n'enregistre rien (inchangé) : seul un APPEL réel
  est tracé.

---

## Écarts à la spec
Aucun. Les 4 points sont implémentés tels que spécifiés. Le seul choix de jugement (point 2 ⚠️) :
**pas de whitelist HW** — inutile car aucun offset non routé n'est atteint par le code porté
aujourd'hui, et aucun offset routé n'est double-géré par un autre chemin ; ajouter une whitelist
masquerait un futur vrai trou sans bénéfice actuel. Documenté ci-dessus.

## Buffers de diagnostic exposés (récap)
- `globalThis.__taskErrors` (ring 50) + `__taskErrorSeen` (Map dédup).
- `globalThis.__gpuRegGapCount` (compteur global) + `__gpuRegGapSeen` (Set dédup r:/w:).
- `globalThis.__wireTodoHits` (ring 100, dédup par name) — hits wireTodo réellement atteints.
