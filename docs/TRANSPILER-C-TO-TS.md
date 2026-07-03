# TRANSPILER C→TS — conventions d'émission (miroir 1:1)

> Mandat : finir le miroir 1:1 (9539 fonctions manquantes / 15629) avec un **vrai
> transpiler** au lieu du port à la main. `scripts/transpile-c.cjs` transcrit un
> `.c` de la décomp (`D:/Projet 1/decomps/pokeemeraude`) en `.ts` suivant les
> conventions établies par les ports manuels (référence : `egg_hatch.ts`,
> `evolution_scene.ts`). Ce qui n'est pas traduisible SÛREMENT est flaggé
> `// TRANSPILER-TODO` + rapport sidecar `audit-reports/transpile/<nom>.md` —
> jamais d'improvisation silencieuse (contrat « transcrire pas improviser »).

## Pipeline

1. `scripts/build-ts-symbol-index.cjs` → `audit-reports/ts-symbol-index.json`
   (symbole exporté → fichier ; scan `src/`, `include/`, `harness/`). À
   régénérer après chaque vague (les nouveaux fichiers deviennent importables).
2. `node scripts/transpile-c.cjs --file tv.c` → `src/tv.ts` + rapport sidecar.
3. Revue humaine des flags du rapport → corrections → `npx tsc --noEmit` = 0
   → boot → smoke test en jeu → commit.

## Résolution préprocesseur (build vanilla FR — include/config.h)

| Macro | État | Effet |
|---|---|---|
| `NDEBUG` | défini | asserts/AGBPrint = branches mortes |
| `FRENCH` | défini | `ENGLISH` absent → `UNITS_METRIC`, `CHAR_DEC_SEPARATOR = CHAR_COMMA` |
| `BUGFIX` / `UBFIX` | ABSENTS | on transcrit le comportement ROM d'origine ; chaque site UBFIX écarté est listé dans le rapport (revue : un UB C peut devenir crash TS) |
| `MODERN` | 0 | `#if !MODERN` = vrai |
| `LIBRFU_VERSION` | 1026 | (librfu.h) |
| `__STDC_VERSION__` | < 202311L | branche legacy |

Les branches mortes sont blanchies AVANT parse (positions de lignes préservées
→ les `(:ligne)` des JSDoc restent exacts).

## Mapping types & expressions

| C | TS |
|---|---|
| `u8/u16/u32/s8/s16/s32/bool8/bool16/bool32` scalaires | `number` / `boolean` (convention repo : pas de wrap implicite, comme les ports manuels) |
| tableaux `u8[N]`/`s16[N]`… | `Uint8Array(N)` / `Int16Array(N)`… (wrap C gratuit à l'écriture) ; tableaux de structs → `T[]` initialisés |
| cast `(u8)x` `(u16)x` `(u32)x` | `(x & 0xFF)` `(x & 0xFFFF)` `(x >>> 0)` |
| cast `(s8)x` `(s16)x` `(s32)x` | `((x << 24) >> 24)` `((x << 16) >> 16)` `(x \| 0)` |
| division entière `/` | `Math.trunc(a / b)` (tronque vers 0 = C) ; `%` JS = C99 tel quel |
| `>>` sur type unsigned connu | `>>>` (sinon `>>` + flag si doute) |
| `struct X *p` | référence objet ; `p->f` → `p.f` ; `NULL` → `null` |
| `&scalaire` (out-param) | **boxing** : le local devient `const x = { v: init }`, usages `x.v`, l'appelé prend `{ v: number }` |
| `&struct` / `&arr[i]` | passage direct de la référence |
| `*p = *q` (copie struct) | flag TRANSPILER-TODO (deep-copy à valider) |
| `sizeof(arr)` | `arr.length` (×2/×4 si éléments 16/32 bits — octets 1:1) |
| `TRUE/FALSE/NULL` | `true/false/null` |
| arithmétique de pointeur | flag TRANSPILER-TODO sauf idiomes reconnus (itération indexée) |
| `goto` | flag TRANSPILER-TODO |

## Data statiques & defines

- `#define NAME <expr>` → `const NAME = <expr>;` (ligne d'origine en commentaire).
- `#define tFoo data[N]` (alias task/sprite) → expansion aux usages :
  `.data[N] /* tFoo */` — fidèle au sens, lisible.
- `#define M(a,b) <expr>` simple → `const M = (a: number, b: number) => <expr>;`
- struct locale → `interface` (tous champs, mêmes noms) ; enum → suite de `const`.
- initialisateurs désignés `[X] = v` / `.f = v` → tableaux/objets TS 1:1.
- `static` data → `const s...` module-local ; non-static → `export`.
- `static` var mutable → `let` module-local ; `EWRAM_DATA` idem (exemption malloc).
- `INCGFX_*/INCBIN_*` → flag + emission d'un loader `loadTileBin/loadGbaPal/
  loadTilemapBin('/decomp/em/<chemin>')` en commentaire suggestion (pattern
  egg_hatch `_load*Gfx` : préchargement async pendant le fade, scène sync 1:1).

## Strings

- `gText_X` (extern) → `getString('gText_X')` (adossé `/decomp/em/strings.json`) ;
  chaque site listé au rapport (certains printers veulent `encodeOwText(...)`).
- `_("…")` inline → flag (rare).

## Imports

Identifiant non défini localement → lookup index → import ajouté. Non résolu →
laissé nu + rapport (l'erreur tsc EST la todo-list, on transpile feuilles
d'abord). `SPECIES_*/ITEM_*/MOVE_*…` → `include/constants/*.ts` (mirror étendu
au besoin via extraction mécanique des `#define` du header décomp).

## Ce que le transpiler NE fait PAS (revue humaine)

- Adaptations gfx/scène (préchargement async, compositeur BG) — patterns
  documentés mais appliqués à la main sur les fichiers à écrans.
- Frontière hardware (DMA, registres, link SIO, m4a) — exemptions documentées.
- Vérif en jeu. tsc+boot ≠ fini : chaque vague liste ce qui est testé/pas testé.
