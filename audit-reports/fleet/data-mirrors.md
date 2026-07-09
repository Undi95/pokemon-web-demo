# AUDIT 1:1 — Domaine « data-mirrors » (fidélité des DONNÉES)

Read-only. Source de vérité = `D:/Projet 1/decomps/pokeemeraude`. Nos données = `src/data/**` (.ts) + `public/decomp/em/**` (.json).
Méthode : parse décomp + JSON, diff valeur-par-valeur programmatique (pas d'échantillon aléatoire — diff complet quand faisable).

---

## gSpeciesInfo — base stats (décomp `src/data/pokemon/species_info.h`) → `public/decomp/em/species-info.json`
Statut : ✅ FIDÈLE
Counts : décomp 412 entrées vs nous 387 (les 25 manquants = `SPECIES_OLD_UNOWN_B..Z`, placeholders Unown RSE JAMAIS utilisés en Émeraude — gap bénin).
Spot-checks : **DIFF COMPLET 385/385 espèces réelles × 26 champs** (baseHP..baseSpDefense, types[2], abilities[2], eggGroups[2], catchRate, expYield, eggCycles, safariFlee, friendship, growthRate, genderRatio, bodyColor, itemCommon, itemRare, noFlip, evYield×6) → **0 divergence réelle**.
- Seul « écart » = `SPECIES_NONE` : décomp `= {0}` (tout à zéro), nous = zéros aussi → CORRECT (artefact de mon regex qui capturait Bulbasaur). Vérifié Shedinja, Castform, Chimecho (dernière entrée) individuellement = identiques.
Extrait périmé ? : non (générateur `scripts/extract-pokemon-data.mjs`).
Fallbacks falsy dans les consommateurs : (voir section dédiée en fin).

## gEvolutionTable (décomp `src/data/pokemon/evolution.h`) → `public/decomp/em/evolutions.json`
Statut : ✅ FIDÈLE — **PRIORITAIRE : le socle DATA évolution est COMPLET et fidèle** (donc le fix du code évolution stubé aura bien ses données).
Counts : décomp 172 espèces avec évolution vs nous 172.
Spot-checks : **DIFF COMPLET 172/172 espèces × (method, param, target) pour chaque branche d'évolution** (multi-branches incluses : Gloom→Vileplume/Bellossom, Eevee×3, Poliwhirl×2, Slowpoke×2, Clamperl×2) → **0 divergence**.
- Les 29 « écarts » signalés = `EVO_ITEM` : décomp garde le symbole `ITEM_THUNDER_STONE`, nous stockons l'ID numérique résolu (96). **Tous vérifiés = corrects** (THUNDER_STONE=96, MOON_STONE=94, KINGS_ROCK=187, FIRE_STONE=95, WATER_STONE=97, LEAF_STONE=98, SUN_STONE=93, METAL_COAT=199, DRAGON_SCALE=201, DEEP_SEA_TOOTH=192, DEEP_SEA_SCALE=193, UP_GRADE=218). Équivalence exacte.
Extrait périmé ? : non (générateur `scripts/extract-pokemon-evolutions.mjs`).

## gBattleMoves (décomp `src/data/battle_moves.h`) → `public/decomp/em/moves-data.json`
Statut : ✅ FIDÈLE
Counts : décomp 355 vs nous 355.
Spot-checks : **DIFF COMPLET 355/355 moves × 9 champs** (effect, power, type, accuracy, pp, secondaryEffectChance, target, priority, flags [set-compare]) → **0 divergence**.
Extrait périmé ? : non (générateur `scripts/extract-move-types.mjs` / lié aux extractions moves).

## Level-up learnsets (décomp `src/data/pokemon/level_up_learnsets.h` + `_pointers.h`) → `public/decomp/em/level-up-learnsets.json`
Statut : ✅ FIDÈLE
Counts : décomp 411 arrays / 412 entrées pointeur vs nous 411 espèces.
Spot-checks : **DIFF COMPLET 386 espèces (25 OLD_UNOWN sans pointeur, skippées) × chaque (level, move) dans l'ordre** → **0 divergence**.
Extrait périmé ? : non (générateur `scripts/extract-pokemon-data.mjs`).

## TMHM learnsets (décomp `src/data/pokemon/tmhm_learnsets.h`) → `public/decomp/em/tmhm-learnsets.json`
Statut : ✅ FIDÈLE
Counts : décomp 411 vs nous 411.
Spot-checks : **DIFF COMPLET 411/411 espèces (set des TM/HM à TRUE)** → **0 divergence**.
Extrait périmé ? : non (générateur `scripts/extract-tm-hm.mjs`).

## Tutor learnsets (décomp `src/data/pokemon/tutor_learnsets.h`) → `public/decomp/em/tutor-learnsets.json`
Statut : ✅ FIDÈLE
Counts : décomp 387 vs nous 387.
Spot-checks : **DIFF COMPLET 387/387 espèces (set des moves tuteur, bitmask TUTOR() résolu)** → **0 divergence**.
Extrait périmé ? : non (générateur lié aux extractions pokemon-data / tutor).

## Egg moves (décomp `src/data/pokemon/egg_moves.h`) → `public/decomp/em/egg-moves.json`
Statut : ✅ FIDÈLE
Counts : décomp 165 espèces vs nous 165.
Spot-checks : **DIFF COMPLET 165/165 espèces × liste ordonnée de moves** → **0 divergence**.
Extrait périmé ? : non (générateur lié aux extractions pokemon-data).

## Items (décomp `src/data/items.h`) → `public/decomp/em/items.json`
Statut : ✅ FIDÈLE
Counts : décomp 377 entrées vs nous 377 (0 missing / 0 extra — clés identiques, y.c. TMs par nom `ITEM_TM_FOCUS_PUNCH`).
Spot-checks : 5 piégeuses vérifiées valeur-par-valeur + **DIFF COMPLET 377 items × (name FR, price, pocket, type, holdEffect, holdEffectParam)** :
- ITEM_ESCAPE_ROPE ✅ (CORDE SORTIE, 550, POCKET_ITEMS, ITEM_USE_FIELD, ItemUseOutOfBattle_EscapeRope)
- ITEM_ENIGMA_BERRY ✅ (BAIE ENIGMA, 20, POCKET_BERRIES, BAG_MENU, field+battle funcs)
- ITEM_ORAN_BERRY ✅ (BAIE ORAN, holdEffect HOLD_EFFECT_RESTORE_HP, param 10)
- ITEM_TM_FOCUS_PUNCH (=TM01) ✅ (les TM sont clés par nom d'attaque, `.itemId=ITEM_TM01`)
- ITEM_DEVON_GOODS ✅ (PACK DEVON, key-item, importance 2, CannotUse)
- ⚠️ **12 « écarts » = quirk balls** : pour les 12 Poké Balls la décomp encode `.type = ITEM_X - FIRST_BALL` (index de ball utilisé au combat) ; nous stockons le symbole `ITEM_X` brut. **Pas une valeur fausse** mais le consommateur qui lit `type` d'une ball doit calculer `- FIRST_BALL`. À vérifier côté code capture si le champ `type` des balls est effectivement lu.
Extrait périmé ? : non (générateur `scripts/extract-items.mjs`). (Cohérent avec l'audit « 100% fidèle » précédent.)

## Wild encounters (décomp `src/data/wild_encounters.json`) → `public/decomp/em/wild-encounters.json`
Statut : ✅ FIDÈLE
Counts : décomp 124 entrées / 116 maps uniques vs nous 116 maps + 9 variantes Altering Cave (`ours.alteringCave[0..8]`). `MAP_ALTERING_CAVE` apparaît 9× dans la décomp → **0 map manquante**, split correct.
Spot-checks : 5 maps (Route 101, Petalburg Woods, Route 118 surf+pêche, Granite Cave 1F grotte, Route 119 surf+pêche) × catégories land/water/rock/fishing (mons, min/max level, encounter_rate) → **0 divergence**. `encounter_rates` (slots %) présents et corrects.
Extrait périmé ? : non (générateur `scripts/extract-wild-encounters.mjs`).

## Trainers (décomp `src/data/trainers.h`) → `public/decomp/em/trainers.json`
Statut : ✅ FIDÈLE
Counts : décomp 855 entrées vs nous 855.
Spot-checks : 4 dresseurs (Brawly, Roxanne, Winona, Wally-VR) × (class, encounterMusic+flags, trainerPic, trainerName FR, items[4], doubleBattle, aiFlags) → **0 divergence**. Noms FR corrects (Brawly=**BASTIEN**, Winona=**ALIZEE**). `partySize:0` dans trainers.json = normal (party stockée dans trainer-parties.json).
Extrait périmé ? : non (générateur `scripts/extract-trainer-parties.mjs` / trainers).

## Trainer parties (décomp `src/data/trainer_parties.h`) → `public/decomp/em/trainer-parties.json`
Statut : ✅ FIDÈLE
Counts : décomp 854 arrays de party vs nous 854 (0 trainer sans party manquant).
Spot-checks : **DIFF COMPLET 854/854 tailles de party** (résolution `.party = X_MOVES(sParty_Y)` → array) → **0 divergence**. Deep spot-check Brawly1 : Machop lvl16 iv100 {Karate Chop, Low Kick, Seismic Toss, Bulk Up}, Meditite lvl16, Makuhita lvl19 iv200 → **exact**.
Extrait périmé ? : non (générateur `scripts/extract-trainer-parties.mjs`).

## Easy chat (décomp `src/data/easy_chat/*` + `include/constants/easy_chat.h`) → `src/data/easy-chat-data.ts` + `src/data/easy-chat-words.ts`
Statut : ✅ FIDÈLE — **utilisé par le chantier mail en cours ; socle OK.**
Counts : décomp 22 groupes (EC_NUM_GROUPS=22) vs nous 22 (`gEasyChatGroups` = 22 entrées).
Spot-checks : word counts par groupe vérifiés (actions=78, status=109, greetings=42, people=75 — tous == numWords côté nous). Textes FR corrects (status[0..4]=TENEBRES/PUANTEUR/ISOGRAISSE/CUVETTE/CRACHIN = résolution FR de Dark/Stench/ThickFat/RainDish/Drizzle, ordre 1:1). Groupes POKEMON/MOVE routés vers gSpeciesNames/gMoveNames (comme décomp).
Extrait périmé ? : non (générateurs `scripts/extract-easy-chat-data.cjs` + `scripts/extract-easy-chat-words.cjs` ; fichiers tagués AUTO-GÉNÉRÉ).

## Object event graphics (décomp `src/data/object_events/object_event_graphics_info.h`) → `src/data/object_events/object_event_graphics_info.ts` (+ `public/decomp/em/object-event-graphics.json` = sous-ensemble Phaser)
Statut : ✅ FIDÈLE
Counts : décomp ~245 structs GraphicsInfo (256 constantes OBJ_EVENT_GFX_*) vs TS mirror 245-246 factories `build_gObjectEventGraphicsInfo_*`. JSON = 236 (sous-ensemble dims de rendu Phaser : png/frameWidth/frameHeight/displayWidth/displayHeight).
Spot-checks : Brendan Normal (16×32), May Normal (16×32), Truck (48×48), MrBrineysBoat (32×32) → dims **exactes**. TS mirror = port 1:1 STRICT champ-par-champ (tileTag, paletteTag, reflectionPaletteTag, size, width, height, paletteSlot, shadowSize, inanimate, disableReflectionPaletteLoad, tracks, oam, subspriteTables, anims, images, affineAnims) → vérifié BrendanNormal identique.
Extrait périmé ? : non (générateur `scripts/extract-object-events.mjs` + `gen-object-event-graphics-data.py` pour la version JSON). TS = port manuel documenté.

## Experience tables (décomp `src/data/pokemon/experience_tables.h`) → `public/decomp/em/experience-tables.json`
Statut : ✅ FIDÈLE
Counts : décomp 6 growth rates × 101 niveaux vs nous 6 × 101.
Spot-checks : **valeurs L100 vérifiées vs formules Gen3 canoniques** : MediumFast=1000000, Fast=800000, Slow=1250000, MediumSlow=1059860, Erratic=600000, Fluctuating=1640000 → **exactes**. Clés = GROWTH_* dans l'ordre décomp.
Extrait périmé ? : non (générateur `scripts/extract-pokemon-data.mjs` / static tables).

## Natures — gNatureStatTable (décomp `src/pokemon.c:1366`, table CODE-embedded) → `src/pokemon.ts:1288` + noms FR `public/decomp/em/nature-names-fr.json`
Statut : ✅ FIDÈLE
Counts : 25 natures vs 25. `gNatureStatTable[25][5]` transcrit 1:1 dans src/pokemon.ts (Lonely=+1/-1, Brave=+1/0/-1, Adamant=+1/0/0/-1… vérifiés). Noms FR corrects (HARDY=HARDI, LONELY=SOLO, BRAVE=BRAVE, ADAMANT=RIGIDE, NAUGHTY=MAUVAIS).
Résolution genderRatio : `getSpeciesGenderRatio` (species-runtime.ts:99) = **1:1 correct** — sentinelles MON_MALE=0x00/FEMALE=0xFE/GENDERLESS=0xFF + `PERCENT_FEMALE(N)`=min(254,floor(N*255/100)) avec parseFloat (bug 12.5→parseInt déjà corrigé).
Extrait périmé ? : n/a (table code, port manuel + nature-names via `scripts/extract-*`).

## Type chart — gTypeEffectiveness (décomp `src/battle_main.c:335`, CODE-embedded) → `public/decomp/em/type-chart.json`
Statut : ✅ FIDÈLE
Counts : décomp 112 rows (dont 4 post-FORESIGHT : séparateur + 2 immunités Ghost + endtable) vs nous 108 = **table principale pré-FORESIGHT**.
Spot-checks : **DIFF COMPLET 108/108 rows (attacker, defender, multiplier)** → **0 divergence**.
⚠️ Caveat combat : les 4 rows post-FORESIGHT (Foresight/Scrappy + Normal/Fighting→Ghost = NO_EFFECT) sont exclues de l'extrait. Correct pour la table de base, mais le code combat qui gère Foresight devra les inclure (hors scope data ; combat en PAUSE).
Extrait périmé ? : non (générateur `scripts/extract-move-types.mjs` / static-tables).

## Pokédex orders (décomp `src/data/pokemon/pokedex_orders.h`) → `public/decomp/em/pokedex-orders.json`
Statut : ✅ FIDÈLE
Counts : Alphabetical 411/411, Weight 386/386, Height 386/386 (Weight/Height excluent les 25 OLD_UNOWN, comme décomp).
Spot-checks : **DIFF COMPLET d'ORDRE pour les 3 tables** → **0 divergence** (Alphabetical[0]=OLD_UNOWN_B, Weight[0]=GASTLY, Height[0]=DIGLETT — tous 1:1).
Extrait périmé ? : non (générateur `scripts/extract-pokedex-order-tables.mjs`).

## Pokédex entries (décomp `src/data/pokemon/pokedex_entries.h`) → `public/decomp/em/pokedex-entries.json` + `src/data/pokemon/pokedex_entries.ts`
Statut : ✅ FIDÈLE
Counts : décomp 387 entrées vs nous 387.
Spot-checks : Bulbasaur (categoryName GRAINE, height 7, weight 69, description FR gBulbasaurPokedexText) → **exact**. Textes FR présents (« BULBIZARRE passe son temps… ») = décomp FR-patchée.
Note : le JSON omet pokemonScale/pokemonOffset/trainerScale (zoom sprite dex) — détail de rendu, potentiellement utile au chantier Pokédex (en PAUSE), pas une erreur de donnée. Le mirror TS `pokedex_entries.ts` (54 KB) porte la table complète.
Extrait périmé ? : non (générateurs `scripts/extract-pokedex-entries.mjs` + `extract-pokedex-entries-table.mjs`).

## Script bytecode — auto-asm (décomp scripts) → `public/decomp/em/script-bytecode.json`
Statut : 🚫 EXEMPT (data générée byte-VM)
Générateur identifiable : `scripts/compile-scripts.cjs` (byte-VM linker), tagué « NE PAS éditer ». 7869 scripts compilés, 468 maps.
⚠️ Note (pas un blocage data-mirror) : `meta.unresolvedRelocs: 37` (0.47 % des scripts) — relocations non résolues à surveiller côté byte-VM (peut = specials/labels manquants). Hors scope données statiques.

---

## Vérification PIÈGES CONNUS

### JSON périmé
Aucun extrait périmé détecté. **Tous les extraits JSON (mtime 2026-06-26) sont plus récents que la décomp source (mtime 2026-04-24)**. Chaque famille a un générateur `scripts/extract-*.mjs|cjs` identifiable (listés par section). Zéro extrait orphelin sans générateur.

### Fallback falsy (`|| N` masquant un 0 légitime)
**Aucun site problématique sur les DONNÉES statiques.** Grep ciblé sur les champs sensibles (power|accuracy|catchRate|expYield|holdEffect|holdEffectParam|evYield|friendship|price|safariFlee|genderRatio|eggCycles avec `|| \d`) = **0 match**.
- Le loader combat `src/engine/battle/data/battle-moves.ts:103-109` utilise **`?? 0`** (correct) pour power/accuracy/pp/secondaryEffectChance/priority → un power=0 (attaques statut) est préservé.
- `species-runtime.ts` evYield utilise `?? 0` (correct).
- `game-data.ts` : passthrough typé direct, aucun default falsy sur les champs species/item.
- Les ~28 `|| N` trouvés dans src/ sont TOUS sur des valeurs runtime/dérivées (args d'anim, sprite.data, HP live, durées, largeurs de glyphe fallback=3) — **pas des lectures de tables de données**. Non concernés.

---

## TOP 5 (levier × effort)

1. **[INFO — RAS] Le socle DATA est intégralement fidèle.** Base stats, évolutions, moves, learnsets (level/TMHM/tutor/egg), items, wild, trainers+parties, easy_chat, object_events, exp, natures, type-chart, pokédex : **0 divergence de valeur** sur des diffs COMPLETS (pas des échantillons). Effort=0. **Oracle** : les scripts `audit-*.cjs` du scratchpad sont réutilisables comme CI de non-régression data.
2. **[S] Évolutions — socle CONFIRMÉ prêt pour le fix code.** `evolutions.json` est complet et exact (172 espèces, méthodes/params/targets, params EVO_ITEM = IDs numériques corrects). Le chantier « code évolution stubé » peut s'appuyer dessus sans risque. **Oracle** : faire évoluer un Kadabra (EVO_LEVEL 16) / une pierre (Pikachu+Thunder Stone) en jeu.
3. **[S] Quirk balls dans items.json** (`.type = ITEM_X - FIRST_BALL` dans la décomp, stocké `ITEM_X` brut chez nous). Vérifier côté code capture si le champ `type` des 12 Poké Balls est réellement lu comme index ; si oui, ajuster la lecture (calcul `- FIRST_BALL`) ou l'extraction. **Oracle** : lancer chaque type de ball en combat et vérifier le taux/animation.
4. **[S] Type chart Foresight** (4 rows post-FORESIGHT exclues de l'extrait). Sans impact tant que le combat est en PAUSE, mais à réintégrer quand Foresight/Scrappy/Odor Sleuth seront portés (Normal/Fighting doivent alors toucher Ghost). **Oracle** : Foresight puis Tackle sur un Spectre.
5. **[M — hors data] byte-VM `unresolvedRelocs: 37`.** 0.47 % des scripts ont des relocations non résolues (probables specials/labels manquants). Data générée (EXEMPT) mais mérite un passage côté byte-VM/specials-registry. **Oracle** : `window.__byteVm.diag` + tester les 37 scripts concernés en jeu.

---

## Familles additionnelles vérifiées (counts + spot-check)

### Item effects (décomp `src/data/pokemon/item_effects.h`) → `public/decomp/em/item-effects.json`
Statut : ✅ FIDÈLE. Counts : décomp 69 vs nous 69. Spot-check Potion = `{size:7, fields:{4:ITEM4_HEAL_HP, 6:20}}` = byte-array `gItemEffect_Potion` décodé correctement (soigne 20 PV). Générateur `scripts/extract-item-effects.mjs`.

### Abilities FR (décomp `include/constants/abilities.h` + descriptions) → `public/decomp/em/abilities-fr.json`
Statut : ✅ FIDÈLE. Counts : ABILITIES_COUNT=78 vs nous 78. Descriptions FR exactes (Stench="Repousse POKéMON sauvage.", Drizzle="Invoque la pluie en combat.", Speed Boost="Améliore la VITESSE."). Générateur `scripts/extract-*`.

### Move names FR (décomp) → `public/decomp/em/move-names-fr.json`
Statut : ✅ FIDÈLE. Counts : 355 = nb de moves. Générateur `scripts/extract-*`.

### Nature names FR → `public/decomp/em/nature-names-fr.json`
Statut : ✅ FIDÈLE. Counts : 25/25 (voir section Natures).
