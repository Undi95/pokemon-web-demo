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
| STAB + efficacité de type | `Cmd_typecalc` / `TypecalcImpl` | battle_script_commands.c | **ORACLE** `probe-typecalc` (`5cbd976b` : STAB ×1.5 + efficacité type1/type2 sur `gBattleMoveDamage` LIVE) + `probe-type-effectiveness` AI_TypeCalc 9/9 + table `audit-type-chart` 336/336 |
| Finalisation (crit/dmgMult/Charge/Helping Hand) | `Cmd_damagecalc` | battle_script_commands.c:1290 | **AUDIT 1:1** (×gCritMultiplier×dmgMultiplier ; Charge électrique ×2 ; Helping Hand ×15/10) |
| Aléa 85-100 % (`ApplyRandomDmgMultiplier`) | `Cmd_adjustnormaldamage` | battle_script_commands.c:1639 | **ORACLE** `probe-randdmg-1to1` 96/96 (`bc1f181e` : RNG-peek, `randPercent=100-Random()%16`, `dmg*%/100` floor, min-1, no-op) |
| leave-at-1-HP (Focus Band/Endure/False Swipe) | `Cmd_adjustnormaldamage` | battle_script_commands.c:1658 | **AUDIT 1:1** (skip Substitute) |
| Coups multiples 2-5 | `Cmd_setmultihitcounter` | battle_script_commands.c:7142 | **AUDIT 1:1** (`Random()&3` ; si >1 `(Random()&3)+2` ; sinon `+2` → 3/8·3/8·1/8·1/8) |
| Effet secondaire (chance) | `Cmd_seteffectwithchance` | battle_script_commands.c:2908 | **AUDIT 1:1** (Serene Grace ×2 ; branche CERTAIN ; `Random()%100 < percentChance` → SetMoveEffect, CERTAIN si ≥100) |
| Manipulation dégâts | `Cmd_manipulatedamage` | battle_script_commands.c:6743 | **AUDIT 1:1** (DMG_CHANGE_SIGN ×-1 ; DMG_RECOIL_FROM_MISS ÷2 min 1 cap maxHP/2 ; DMG_DOUBLED ×2) |

## Autres formules

| Mécanique | Fonction | Source | Statut |
|---|---|---|---|
| Efficacité de type (table) | `gTypeEffectiveness` 18×18 | battle_main.c | **ORACLE** `audit-type-chart` 336 éléments (foresight inclus) |
| Capture Pokéball | `Cmd_handleballthrow` | battle_script_commands.c:9908 | **AUDIT 1:1** + lock `audit-ball-catch` (odds, ballMultiplier, status ×2/×1.5, double-`Sqrt`, shakes ; Safari ne wrap pas u8). ⚠️ l'audit-lecture avait RATÉ 2 littéraux inline faux — `FLAG_GET_CAUGHT` (Repeat Ball) `935051c8` + `BATTLE_TYPE_WALLY_TUTORIAL` `49d53399` — rattrapés par l'oracle `audit-commented-constants`. |
| catchRate par espèce | `gSpeciesInfo[].catchRate` | — | **ORACLE** `audit-species-data` |
| Gain d'EXP de combat | `Cmd_getexp` | battle_script_commands.c:3340+ | **AUDIT 1:1** (`expYield×level/7` ; split exp-share via identité `floor(floor(a/2)/b)=floor(a/2b)` ; chaîne +share → ×Œuf Chance → ×dresseur → ×échangé ; `IsTradedMon` corrigé) |
| Courbe d'EXP (niveau→exp) | `gExperienceTables` | pokemon.c | **ORACLE** `probe-experience-runtime` (6 courbes L100 canoniques) |
| Genre / chromatique | `GetGenderFromSpecies…` | pokemon.c | **ORACLE** `probe-gender-shiny` 13/13 (`57402d75` — 🐛 bug `PERCENT_FEMALE` décimal corrigé) |

## Sondé/audité depuis (mise à jour session finale)

- **Badges** (`ShouldGetStatBadgeBoost` ×110/100) : **ORACLE** `probe-damage-badges` (`6988e1e7`, 64 cas,
  FlagSet/Clear save-restore).
- **`Cmd_typecalc`** : **ORACLE** `probe-typecalc` (`5cbd976b`) — STAB + efficacité sur les globals LIVE.
- **Précision/esquive** (`Cmd_accuracycheck`) : **AUDIT 1:1** ligne-à-ligne ; 🐛 fix `WEATHER_HAS_EFFECT`
  manquant (Thunder-soleil/Sand Veil, `45b97218`) + caseID `CHECK_OTHER_SIDE` vs `CHECK_ON_FIELD`
  (`5973e127`).
- **Finalisation/aléa/effet-secondaire** (`Cmd_damagecalc`, `Cmd_adjustnormaldamage`,
  `Cmd_seteffectwithchance`, `Cmd_manipulatedamage`) : **AUDIT 1:1** (voir tableau pipeline).

## Reste

- **field sports** (Mud/Water Sport ×⅓ sur Feu/Électrik), **Plus/Minus** (partenaire double),
  **double battle** (ciblage/spread). Hors single-player principal pour la plupart.

> Constat de la session finale : tout ce qui est audité/sondé ici est **1:1**. Les seuls vrais bugs
> trouvés dans la couche combat étaient des improvisations isolées (parse genre décimal, BGM victoire,
> `IsTradedMon` otId-only) — déjà corrigés. La fondation des formules tient.
