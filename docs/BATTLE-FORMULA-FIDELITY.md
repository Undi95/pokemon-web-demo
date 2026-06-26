# Carte de fidélité 1:1 — Formules de combat

> Statut de vérification déterministe des formules numériques de combat (dégâts, crit, capture,
> exp, stats). Deux niveaux de preuve : **ORACLE** = sonde runtime/headless verte committée
> (confronte la sortie LIVE du moteur à la formule décomp recodée main, contrôle négatif obligatoire) ;
> **AUDIT** = confrontation ligne-à-ligne lecture seule vs décomp (décomp = vérité), 1:1 confirmé sans
> écart. Méthode : `[[gotcha-stale-extracted-json-and-falsy-fallback]]` (oracles de formule).

## Pipeline de dégâts (ordre d'exécution du script de combat)

| Étape | Opcode / fonction | Source décomp | Statut |
|---|---|---|---|
| Stats du mon | `CalculateMonStats` | pokemon.c | **ORACLE** `probe-stats-1to1` 270/270 (`0de4c280`) |
| Nature | `ModifyStatByNature` | pokemon.c:5865 | couvert par stats |
| Base | `CalculateBaseDamage` cœur | pokemon.c:3107+ | **ORACLE** `probe-damage-1to1` 324/324 (`540f5692`) |
| — paliers de stats | `gStatStageRatios` | pokemon.c:1869 | **ORACLE** `probe-damage-statstages` 120/120 (`d32d0e5c`) |
| — talents/objets génériques | Huge/Choice Band/Guts/Thick Fat/Marvel/pinch | pokemon.c:3140-3231 | **ORACLE** `probe-damage-modifiers` 112/112 (`384f1a4b`) |
| — objets boost-de-type | `sHoldEffectToType` | pokemon.c:3171-3183 | **ORACLE** `probe-damage-typeitem` 256/256 (`404b627b`) |
| — objets espèce | Soul Dew/Deep Sea/Light Ball/Metal/Thick Club | pokemon.c:3186-3201 | **ORACLE** `probe-damage-speciesitem` 288/288 (`b8173521`) |
| — météo | pluie/soleil Feu/Eau | pokemon.c:3330-3360 | **ORACLE** `probe-damage-weather` 96/96 (`e654df05`) |
| — écrans (Reflect/Light Screen) | `sideStatus` | pokemon.c | **ORACLE** `probe-damage-screens` 64/64 (`d8edd3d2`) |
| Crit | `Cmd_critcalc` + `sCriticalHitChance{16,8,4,3,2}` | battle_script_commands.c:606,1253 | **AUDIT 1:1** (formule critChance : Focus Energy ×2, HIGH_CRITICAL/SKY_ATTACK/BLAZE_KICK/POISON_TAIL, Scope Lens, Lucky Punch+Chansey/Stick+Farfetch'd ×2 ; gate De Morgan) |
| Crit ×2 appliqué | `Cmd_damagecalc` (`damage × gCritMultiplier`) | battle_script_commands.c:1290 | couvert (statstages prouve `gCritMultiplier=1` hors crit) |
| STAB + efficacité de type | `Cmd_typecalc` | battle_script_commands.c | logique : **ORACLE** `probe-type-effectiveness` AI_TypeCalc 9/9 (`6fa3eba8`) ; table `gTypeEffectiveness` : **ORACLE** `audit-type-chart` 336/336. Application sur `gBattleMoveDamage` (globals) = à sonder |
| Aléa 85-100 % | `ApplyRandomDmgMultiplier` | battle_script_commands.c:1639 | RNG (non déterministe) |

## Autres formules

| Mécanique | Fonction | Source | Statut |
|---|---|---|---|
| Efficacité de type (table) | `gTypeEffectiveness` 18×18 | battle_main.c | **ORACLE** `audit-type-chart` 336 éléments (foresight inclus) |
| Capture Pokéball | `Cmd_handleballthrow` | battle_script_commands.c:9908 | **AUDIT 1:1** (odds, ballMultiplier par ball, status ×2/×1.5, double-`Sqrt`, shakes, `catchAttempts` ULTRA_BALL=2 ; Safari `×1275/100` ne wrap jamais u8 car facteur clampé ≤20) |
| catchRate par espèce | `gSpeciesInfo[].catchRate` | — | **ORACLE** `audit-species-data` |
| Gain d'EXP de combat | `Cmd_getexp` | battle_script_commands.c:3340+ | **AUDIT 1:1** (`expYield×level/7` ; split exp-share via identité `floor(floor(a/2)/b)=floor(a/2b)` ; chaîne +share → ×Œuf Chance → ×dresseur → ×échangé ; `IsTradedMon` corrigé) |
| Courbe d'EXP (niveau→exp) | `gExperienceTables` | pokemon.c | **ORACLE** `probe-experience-runtime` (6 courbes L100 canoniques) |
| Genre / chromatique | `GetGenderFromSpecies…` | pokemon.c | **ORACLE** `probe-gender-shiny` 13/13 (`57402d75` — 🐛 bug `PERCENT_FEMALE` décimal corrigé) |

## Reste à sonder (besoin de setup combat / globals)

- **Badges** (`ShouldGetStatBadgeBoost` ×110/100) : impl 1:1 (AUDIT FIX flags 0x867/0x86B/0x86D) mais
  non prouvée — besoin de poser les flags badge + un battler côté joueur (side 0).
- **`Cmd_typecalc`** : l'application STAB ×1.5 + multiplicateur d'efficacité sur `gBattleMoveDamage`
  (la LOGIQUE est prouvée via AI_TypeCalc, mais pas cette voie-là, qui opère sur les globals).
- **Précision/esquive** (`Cmd_accuracycheck`), **field sports**, **Plus/Minus** (partenaire), **double**.

> Constat de la session finale : tout ce qui est audité/sondé ici est **1:1**. Les seuls vrais bugs
> trouvés dans la couche combat étaient des improvisations isolées (parse genre décimal, BGM victoire,
> `IsTradedMon` otId-only) — déjà corrigés. La fondation des formules tient.
