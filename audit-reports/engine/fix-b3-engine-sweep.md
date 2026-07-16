# Phase B.3 — Exerciseur E2E `__e2e.run('engine-sweep')`

Plan source : `docs/CHANTIER-MOTEUR-100.md` §PHASE B.3. Objectif : après boot →
overworld, ouvrir CHAQUE écran porté un par un (vrais chemins d'input), collecter
erreurs/warns/gardes moteur touchées, rapport JSON par écran. À relancer après
CHAQUE lot de fixes (détection de régression + découverte de stubs).

## Fichiers

- **Créé** : `harness/e2e/engine-sweep.ts` — tout le scénario (self-contained).
- **Modifié** (câblage minimal, 2 lignes) : `harness/e2e/scenarios.ts`
  - `import { engineSweepScenario } from './engine-sweep';`
  - `registerScenario(engineSweepScenario);`
- Aucun autre fichier touché. `npx tsc --noEmit` = **0**.

## Comment lancer

Dans la console du jeu (onglet overworld booté, save progressée) :

```js
await __e2e.run('engine-sweep')
```

- Retour = le `E2eReport` standard du runner (`steps[]` : une entrée par écran avec
  `ms` mesuré + `detail` = verdict `OK/KO … err=N`). `pass=false` si un écran a
  produit un `console.error`/`console.warn` (le runner agrège) ou un throw.
- Détail riche par écran : `window.__engineSweepReport` =
  `{ screens, ok, ko, totalErrors, results: [{screen, ok, ms, errors[], firstStack?}] }`.
- Un `console.table` récapitulatif + `[engine-sweep] {…}` sont loggés en fin de run.
- `__e2e.last()` renvoie aussi le dernier `E2eReport`.

Préconditions : booter d'abord jusqu'à l'overworld (le scénario réutilise l'attente
de `boot-overworld` : `until cb2 === MainCB2_Overworld2`, 30 s). Save avec
`FLAG_SYS_POKEDEX_GET` / `FLAG_SYS_POKEMON_GET` / `FLAG_SYS_POKENAV_GET` pour couvrir
pokédex/party/pokénav (sinon ces écrans sont marqués « absent du menu — non testable »,
sans échec).

## Écrans couverts (ordre)

1. **start-menu** — ouvre (START) / ferme (B), vérifie `startMenu.isOpen()`.
2. **pokedex** — ouvre (menu START), scroll 3 crans, B. (cb2 `*Pokedex*`)
3. **party+summary** — ouvre, curseur 2 mons, ouvre le summary (A→A = RÉSUMÉ 1er item), B B. (cb2 `*Party*`, `*Summary*`)
4. **bag** — ouvre, change de poche ×2 (right/right), B. (cb2 `*Bag*`)
5. **trainer-card** — ouvre, B. (cb2 `*TrainerCard*`)
6. **options** — ouvre, B. (cb2 `CB2_InitOptionMenu` → `MainCB2`)
7. **save-cancel** — ouvre le dialogue SAUVER, attend le OUI/NON (`GetYesNoWindowId()>=0`), **ANNULE par B** (jamais A → jamais de save réelle).
8. **pokenav-matchcall** — ouvre le Pokénav, DOWN×2 (curseur MAP→MATCH CALL), **confirme MATCH CALL via `GetCurrentMenuItemId()` avant A**, ouvre Match Call, scroll 3 crans, B B (quitte).
9. **shop** — `launchPokemart()` (byte-VM), attend `IsShopMenuOpen()`, browse, B B.
10. **pc-storage** — `launchScript('EventScript_PC')` (byte-VM), avance dialogs + sélectionne option 0 (POKéMON STORAGE, pc.inc:19), RETIRER (1er item), curseur ×2, B B B → overworld. Contrôle party count avant/après (note si mutation).
11. **battle-trainer** — `launchTB(333)` (byte-VM), driver du plan : ~toutes les 400 ms si cb2 ∈ {PartyMenu, BagMenu} → B, sinon cycle left/up/A ; fin = retour overworld ; timeout 120 s.

Chaque écran a un try/catch + timeout individuel (12–22 s, 130 s pour le combat). Un
écran qui échoue **ne bloque pas** les suivants : `runScreen` catch tout puis
`recoverToOverworld` (B répétés, jamais destructifs) ramène à l'overworld propre
(`cb2 overworld && !startMenu.isOpen() && !shopOpen()`).

## SKIP-LIST (non couverts) + raison exacte

- **Pokénav › CARTE DE HOENN** (region map) : écran NON câblé —
  `PokenavCallback_Init_RegionMap` → throw wireTodo `IsEventIslandMapSecId`
  (chantier `region_map.c` / `pokenav_region_map.ts`, 39 symboles). Le sweep
  n'appuie **jamais** A dessus (cursorPos 0, on descend avant de valider).
- **Pokénav › CONDITION** : écran NON câblé — `pokenav_conditions_gfx` = 59 wireTodo
  (`STUBS-INVENTORY.md`). Jamais sélectionné (cursorPos 1). On ne valide (A) QUE si
  `GetCurrentMenuItemId()` confirme `POKENAV_MENUITEM_MATCH_CALL (2)` ; sinon sortie par B.
- **Mail (lecture)** : aucun lanceur standalone dans `harness/devtools`. Ouvert
  uniquement via un item MAIL tenu (bag → lire/donner) → hors périmètre input-driven.
- **Berry tag** : aucun lanceur standalone. Ouvert depuis la poche BAIES du sac
  (item baie → ÉTIQUETTE) → non couvert.

Inclus car un lanceur EXISTE déjà (`launch*` dans `harness/devtools/dev-bytevm-tools.ts`) :
shop (`launchPokemart`), PC (`launchScript`), combat (`launchTB`).

## Choix d'implémentation

- **Un écran = une étape du runner** dont le `run` NE THROW JAMAIS (`runScreen` catch
  tout). Le runner casse au 1er throw (`runner.ts:241`) — indispensable pour que
  chaque écran reste indépendant. Bénéfice : `ms` mesuré par le runner + `detail` par
  écran dans le `E2eReport` standard, sans modifier `runner.ts`.
- **Hook console** chaîné PAR-DESSUS le wrapper `console.error` du runner (comme
  `double-battle`) + wrappe `console.warn` (non touché par le runner). Dédup par
  message (Map, cap 20 distinct/écran), `firstStack` capturé une fois. `console.warn`
  restauré en fin de run (`console.error` est restauré par le runner).
- **Idempotence** : reset intégral de l'état + dé-wrap/re-wrap des hooks à chaque run
  (relançable après reload).
- **Navigation menu START déterministe** : le curseur `sStartMenuCursorPos` persiste
  entre ouvertures → on parque en haut (UP×8, borné décomp) puis DOWN×index. Les
  index sont dérivés des flags (`FLAG_SYS_POKEDEX/POKEMON/POKENAV_GET`) via `FlagGet`
  (ordre 1:1 `BuildNormalStartMenu`).
- **Détection d'écran robuste par mot-clé cb2** (`/Bag/i`, `/Party/i`, `/Pokedex/i`,
  `/TrainerCard/i`, `/Pokenav/i`, `/Summary/i`, `/PokeStorage/i`) : tolère les variantes
  init (`CB2_Init*`) vs stabilisé (`MainCB2_*Run`). ⚠️ `menu-sac` (scénario existant)
  teste `=== 'CB2_BagMenuRun'` alors que le vrai nom est `MainCB2_BagMenuRun` — non
  corrigé ici (hors périmètre), mais à noter.
- **Sécurité Pokénav** : DOWN×2 depuis le curseur d'ouverture (MAP=0) atteint
  MATCH_CALL (2) et ne peut PAS tomber sur MAP(0)/CONDITION(1) ; en menu type DEFAULT
  (match call non débloqué) il tombe sur SWITCH_OFF (sortie propre). Le read
  `GetCurrentMenuItemId()` (import dynamique, même instance module que le jeu) gate
  l'appui A : A **seulement** si item == 2 ou read impossible (fallback DOWN×2-sûr).
- **Sécurité PC** : sélection option 0 par A uniquement (jamais DOWN → jamais
  « player's PC »/« turn off ») ; RETIRER puis cursor + B (jamais A dans la grille →
  aucun mon retiré). Party count comparé avant/après par sécurité.
- **Imports src** (`FlagGet`, `GetYesNoWindowId`, `IsShopMenuOpen`,
  `CalculatePlayerPartyCount`) : tous DÉJÀ dans le graphe E2E via `dev-bytevm-tools`
  → aucune nouvelle arête d'import tôt (pas de TDZ). `GetCurrentMenuItemId` importé
  DYNAMIQUEMENT (pokénav = module lazy du jeu, ne pas le charger au boot).

## Points à vérifier EN JEU (Fable — je n'ai pas de pane)

- Ordre exact du menu contextuel party (hypothèse : RÉSUMÉ = 1er item → A→A ouvre le
  summary). Si l'ordre diffère, `party+summary` note « summary non détecté » sans
  échouer — à confirmer visuellement.
- Le driver combat `launchTB(333)` doit finir le combat < 120 s ; sinon `battle-trainer`
  reste éventuellement en combat (dernier écran, n'impacte pas la synthèse).
- Flux PC réel (multichoice « quel PC » → storage) : le nombre d'appuis A avant
  `CB2_PokeStorage` est absorbé par une boucle (max 8), mais à confirmer.
- En pane throttlée le stall `ctx.frames` (4 s sans frame) pourrait faux-positiver ;
  en onglet 60 fps c'est sain (cible d'exécution voulue).
