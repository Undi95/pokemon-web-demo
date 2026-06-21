# Carte de fidélité 1:1 — Specials (top 40 par usage)

> **Pilote d'audit multi-agent #2, 2026-06-21.** 2 auditeurs Opus indépendants (cross-check) + énumération
> déterministe + vérification manuelle du lead. Sous-système = les "specials" (fonctions natives appelées
> par les opcodes `special`/`specialvar`). Périmètre = **les 40 specials les plus utilisés** (mesuré).

## Niveaux de confiance
- **✅ CONFIRMÉ-MOI** : lead a lu les deux corps + arbitré. - **✅ CONFIRMÉ-CONVERGENCE** : les 2 agents d'accord.
- **🟡 PISTE** : 1 seul agent / non revérifié.

## Coverage déterministe (zéro agent)
- Décomp : **524 specials** (`data/specials.inc`). Nous : **294 enregistrés** (264 matchent + 30 maison).
- **260 manquants** (226 utilisés en script) — MAIS le top des manquants est **bas en usage (≤3) et
  quasi tout en sous-systèmes DÉFÉRÉS** (secret base, contest, link, daycare, frontier, mystery gift).
  → Le cœur n'est pas dans les manquants. C'est un backlog de **fidélité** (stubs), pas de couverture.
- ✅ `npm run audit:specials` **RÉPARÉ** (2026-06-21) : scannait un chemin périmé
  `src/engine/specials-registry.ts` → scanne maintenant tout `src/`. Sortie : 294 enregistrés, **0 manquant
  en main-story** (les manquants sont tous en contenu déféré/postgame).

## Résultat sur les 40 audités (✅ CONFIRMÉ-CONVERGENCE)
- **0 manquant** (les 40 sont enregistrés), **24/40 = sous-systèmes déférés** (link/cable_club/contest/
  frontier/slot/fan_club/record_mixing/secret_base/tv), **16/40 = cœur**.
- ~16 FIDÈLES, ~22 STUB, ~2 DIVERGENT. Les stubs déférés sont attendus ; le levier = **les stubs de CŒUR**.

## 🎯 Désaccords entre agents — ARBITRÉS par le lead (la valeur du cross-check)
1. **`IsFanClubMemberFanOfPlayer`** — A1 : DIVERGENT-bug ; A2 : FIDÈLE. → ✅ **A1 a raison** (CONFIRMÉ-MOI).
   Le vrai décomp (`field_specials.c:4168`) = `return GET_TRAINER_FAN_CLUB_FLAG(gSpecialVar_0x8004)` (direct,
   sans garde). Notre handler (`specials-registry.ts:982`) a une garde `if(idx>=8) return 0` + offset `+8`
   qui DIVERGE. ⚠️ **A2 s'est fait avoir par le COMMENTAIRE de notre handler** (`:971-981`) qui décrit un
   AUTRE corps décomp (version indexée `sFanClubMemberIds`). **Leçon : nos propres commentaires peuvent
   mentir → toujours lire le vrai décomp.** (Sous-système déféré → impact réel faible, mais divergence nette.)
2. **`DrawWholeMapView`** — A1 : « vraie impl existe, special no-op pas câblé » ; A2 : « no-op, vérifier si
   setmetatile sync ». → ✅ **Les deux ont raison + RÉSOLU (CONFIRMÉ-MOI) : c'est un VRAI BUG**, voir ci-dessous.

## 🔴 TOP LEVIER — stubs/divergences de CŒUR (backlog priorisé par usage)
| # | special | usages | verdict | impact |
|---|---|---|---|---|
| 1 | **`DrawWholeMapView`** | **78** | ✅ **CORRIGÉ `c6fea625`** | était no-op → câblé sur le vrai `DrawWholeMapView()` ; A/B réel OK |
| 2 | `PlayerFaceTrainerAfterBattle` | 60 | STUB | joueur ne pivote pas vers le dresseur post-combat (cosmétique, 60 scripts) |
| 3 | `ShakeCamera`+`SpawnCameraObject`+`RemoveCameraObject` | 24+15+10 | STUB | trio caméra cinématique muet (séismes, légendaires, cinématiques) — chantier caméra |
| 4 | `ChoosePartyMon` | 10 | STUB (`return 0`) | choix de mon → toujours slot 0 (mauvais Pokémon possible) |
| 5 | `BattleSetup_StartLegendaryBattle` | 7 | STUB (`return 0`) | aucun combat légendaire scripté ne se lance (bloque fin de jeu) |
| 6 | `IsTrainerRegistered` | 7 | STUB (`return 0`) | branches rematch/PokéNav jamais prises (cohérent sans PokéNav). ⚠️ commentaire cite à tort `match_call.c` ; vrai = `field_specials.c:3628` |
| 7 | `PlayTrainerEncounterMusic` | 6 | STUB | pas de jingle de rencontre dresseur (cosmétique audio) |
| 8 | `MauvilleGymPressSwitch` | 5 | STUB | puzzle d'interrupteurs gym Mauville ne change pas les métatiles (couplé à #1) |

> ### ✅ `DrawWholeMapView` (78 usages, #1) — CORRIGÉ (`c6fea625`)
> - Le special (`specials-registry.ts:654`) est un **no-op**, justifié par un commentaire FAUX
>   (« notre setmetatile est sync »).
> - **Vérifié** : `MapGridSetMetatileIdAt` (`fieldmap.ts:1789`) écrit **UNIQUEMENT la donnée de grille**
>   (`gBackupMapLayout.map[i]`), **aucun repeint VRAM** — 1:1 décomp (le décomp s'appuie sur
>   `DrawWholeMapView` pour repeindre).
> - **Conséquence** : tout script `setmetatile … ; special DrawWholeMapView` (gym switches, portes
>   cachées, TV on/off, décors) → **changement INVISIBLE jusqu'au prochain scroll caméra**.
> - **Fix appliqué (`c6fea625`)** : câblé sur le **`DrawWholeMapView()` qui existait déjà** (`game/field_camera.ts:520`,
>   `DrawWholeMapViewInternal` + `copyBGToVRAM=true`) + commentaire mensonger corrigé.
> - **A/B réel FAIT** (Mossdeep) : bloc 8×7 de métatiles changé via `setmetatile` → écran INCHANGÉ (bug
>   reproduit) → `special DrawWholeMapView` → le bloc apparaît. ✅ Fix confirmé visuellement.

## ✅ Cœur VÉRIFIÉ fidèle
`HealPlayerParty`, `GetBattleOutcome`, `CalculatePlayerPartyCount`, `ShouldTryRematchBattle`,
`GetPlayerBigGuyGirlString`, `PlayerHasBerries`, `ObjectEventInteractionGetBerryName`, `TurnOffTVScreen`
(délègue à `tv-screen.ts`). `LoadPlayerParty`/`SavePlayerParty` = STUB **justifié** (party partagée en RAM ;
mais redevient nécessaire si Battle Frontier activé — déféré).

## Méthode + confiance
Cross-check a de nouveau payé : convergence forte sur le gros + **A1 a attrapé une erreur d'A2**
(`IsFanClubMember`, faux-FIDÈLE dû à un commentaire trompeur). Le lead a vérifié les claims contentieux
(2/2 arbitrés, dont 1 contradiction tranchée). Cf. [[multi-agent-audit-method]].

## Prochain pas recommandé
1. **Fixer `DrawWholeMapView`** (trivial + #1 levier, A/B métatile requis).
2. Les autres stubs de cœur (caméra, PlayerFace, MauvilleGym, légendaires) = **chantiers** (vrai portage,
   pas des wire-ups) → à planifier séparément.
3. ✅ FAIT : `audit:specials`/`audit:scrcmd` réparés (scannent `src/`) → cross-check déterministe permanent dispo.
