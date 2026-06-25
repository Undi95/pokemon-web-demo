# Recensement 1:1 — carte de la dette (read-only, EN COURS)

But : cartographier **toute** la dette (duplication + déviations 1:1) avant d'attaquer, pour
agir « en connaissance de tout ». Source de vérité = `D:/Projet 1/decomps/pokeemeraude`.

> ⚠️ **Statut : PREMIÈRE PASSE.** Sondes globales faites ; confirmations ciblées en attente
> (voir §F). Une ligne flaggée ici = **où creuser**, pas un verdict.

## Méthode & limites de confiance
Sondes (manuelles, lecture seule, sans agent) :
1. Forme du codebase (lignes/fichiers par dossier).
2. Heatmap des **marqueurs de déviation** (`stub`/`non porté`/`déviation`/`glue`/`hardcod`/`TODO`…) par fichier.
3. **Ratio-taille** : nos lignes `.ts` ÷ lignes `.c` décomp homonyme.
4. Gros `.c` décomp **sans port homonyme**.

**Bruits connus (à garder en tête) :**
- *Appariement* : l'auto-pairing prend le 1ᵉʳ homonyme → parfois un stub `-data` (ex. `menu` apparié à 104 l. au lieu du vrai `menu.ts` = 1055 l.).
- *Ports éclatés* : `pokemon`/`overworld`/`menu`/`battle_anim_*` répartis sur plusieurs fichiers → **faux « incomplet »**.
- *Densité de commentaires* (JSDoc lourd, typique ici) → **faux « bloat » léger** (~1.4–1.6 peut être un port fidèle bien commenté).
- *Marqueur ≠ dette* : un fichier qui documente honnêtement ses déviations score haut ; la dette **silencieuse** (non commentée) est invisible ici et plus dangereuse.

## Forme du codebase
- **224 280 lignes** `.ts` / **298 fichiers**.
- Répartition : `src` plat 138 · `engine/battle` 39 · `engine/field` 21 · `engine/ui` 18 · `engine/decomp-data` ~30 · `engine/pokemon` 7 · `engine/bag` 7 · `engine/script` 4 · `engine/save` 4.
- Plus gros fichiers : `battle_script_commands` 585 Ko, `event_object_movement` 430 Ko, `object-event-graphics-info-data` 348 Ko (= **données**, légitime), `battle_main` 257 Ko.

## 🚨 Tête de liste — sans ambiguïté, dicte la stratégie
- **`task.ts` = 31 l. / `task.c` = 204 ⇒ ~15 % porté.** LE TRONC (`gTasks`/`RunTasks`/`CreateTask`/témoin `.func`). Tout le contrôle en dépend. **C'est ici qu'on attaque, quoi que dise le reste.**
- **4 primitives partagées NON portées** (recopiées à la main, 0 `export function`) : `CreateYesNoMenuWithCallbacks` (menu_helpers.c:156, 15 l., ~10 appelants décomp), `Task_CallYesOrNoCallback`, `DisplayMessageAndContinueTask`, `DisplayItemMessageOnField`.
- **Globals dupliqués** : `gSaveBlock1Ptr` & `gSaveBlock2Ptr` définis dans **3 fichiers** chacun ; `gCamera`, `gTrainerBattleOpponent_B` dans 2. (Risque désync, déjà payé — cf. mémoire `pitfall-devrt-vs-window-globals`.) → à confirmer : re-export vs définitions séparées.

## Synthèse affinée (passe 2 — confirmations §F1/F4/F5)
**Le constat dominant : la dette est surtout de la STRUCTURE MIROIR, pas de la logique manquante.**
La majorité des « incomplets » du ratio sont des ports **éclatés/renommés hors du chemin 1:1** —
la logique existe, ailleurs, sous d'autres noms :
- `pokemon.c` → `engine/pokemon/pokemon.ts` (`CreateMon`) + `engine/battle/party-storage.ts` (`GetMonData`/`SetMonData`/`CalculateMonStats`/`GetMonAbility`). PAS manquant.
- `field_effect.c` → `field_effect.ts` (`FieldEffectStart`) + `engine/field/field-effect-active-list.ts`.
- `overworld.c` → noms *glue* : `MainCB2_Overworld2`, `CB2_ReturnToFieldLocal_Manual` (option-menu-return.ts). Déviation de **nom**, pas absence.
- `pokemon_summary_screen.c` → `engine/ui/summary-screen.ts` (renommé). `item.c` cœur → `item.ts`.

Donc les **vrais trous** (à attaquer) se réduisent à 4 classes nettes :
1. 🚨 **Tronc de contrôle** : `task.ts` 15 %, 4 primitives partagées non portées, témoin `.func` sous-utilisé.
2. 🔴 **Globals réellement dupliqués (désync)** : `gCamera` (fieldmap.ts:325 **vs** field_camera.ts:129, 2 objets séparés) ; `gTrainerBattleOpponent_B` (battle_setup.ts:92 **vs** engine/battle/state.ts:743). *(gSaveBlock*Ptr = re-exports propres d'1 seul store → PAS un doublon.)*
3. **Bloat code RÉEL (confirmé §F2 — lignes de code hors commentaires)** : seulement `field_effect_helpers` (code 1.91) & `script_movement` (1.91) = ~2× le code décomp (glue/dup réelle) ; modéré `field_door` 1.44, `scrcmd` 1.43, `fieldmap` 1.36, `field_camera` 1.25. ⚠️ **Le reste du « bloat »-taille = JSDoc, PAS du code** : `field_player_avatar` code **1:1 exact** (1898 vs 1894), `mail` 1.03, `player_pc` 1.09. → **la dup-code n'est PAS « partout »**, elle est concentrée sur ~2-5 fichiers.
4. **Features réellement stub/partielles** : `field_specials` (9 l.), `pokemon_storage_system` (PC box), `easy_chat`, `tv`, `daycare`, `secret_base`, `menu_specialized`, fldeff_*, etc.

+ une **dette de structure** transverse (logique correcte mais pas au chemin/nom 1:1) = l'escalade « réplique 1:1 intégrale de l'arbre » de la mémoire. À traiter, mais ≠ bugs fonctionnels.

## A. Fidélité par ratio-taille (136 ports homonymes / 310 `.c`)

### Incomplet probable (ratio < 0.70) — logique manquante OU port éclaté (à confirmer)
**Cœur / overworld / système :**
`task` 0.15 · `overworld` 0.11 (346/3226 ⚠️éclaté?) · `pokemon` 0.12 (857/7156 ⚠️éclaté?) · `field_effect` 0.08 · `field_specials` 0.00 (9/4280 = stub) · `menu` 0.05 (⚠️mispair, réel=1055/2147=0.49) · `item` 0.11 (108/949) · `main` 0.10 · `overworld`/`fieldmap` à recouper · `international_string_util` 0.13 · `trig` 0.17 · `util` 0.38 · `menu_helpers` 0.47 (← contient le yes/no callbacks) · `text` 0.55 · `money` 0.43 (réparti dans money-box-ui).
**Écrans / features :**
`pokemon_storage_system` 0.01 (PC box) · `easy_chat` 0.02 · `tv` 0.02 · `region_map` 0.03 · `daycare` 0.05 · `secret_base` 0.09 · `menu_specialized` 0.10 · `pokemon_icon` 0.12 · `trainer_see` 0.25 · `dewford_trend` 0.36 · `berry` 0.40 · `lottery_corner` 0.42 · `rotating_gate` 0.45 · `item_use` 0.48 · `pokeball` 0.49 · `main_menu` 0.53 · `trainer_card` 0.56 · `script_pokemon_util` 0.52.
**Battle (souvent éclaté en anims — à confirmer) :**
`battle_message` 0.18 · `battle_transition` 0.18 · `pokemon_animation` 0.28 · `battle_anim_status_effects` 0.42 · `battle_bg` 0.43 · `battle_anim_effects_1` 0.53 · `battle_anim_mons` 0.59 · `battle_setup` 0.59 · `battle_anim_*` 0.63–0.69 · `battle_gfx_sfx_util` 0.66.
**Field effects :**
`fldeff_misc` 0.08 · `fldeff_cut` 0.09 · `fldeff_flash` 0.13 · `fldeff_rocksmash` 0.30 · `field_weather_effect` 0.35.

### Bloat probable (ratio > 1.40) — glue/dup non-1:1 (ou JSDoc lourd)
`field_effect_helpers` 2.44 (4192/1717) · `script_movement` 2.24 · `field_camera` 2.09 · `fieldmap` 2.04 · `mail_data` 1.96 · `scrcmd` 1.93 · `random` 1.79 · `script` 1.78 · `field_door` 1.69 · `load_save` 1.65 · `decoration_inventory` 1.65 · `play_time` 1.58 · `fldeff_teleport` 1.57 · `starter_choose` 1.56 · `mail` 1.55 · `field_message_box` 1.55 · `player_pc` 1.48 · `text_window` 1.47 · `heal_location` 1.46 · `field_player_avatar` 1.44.

### OK (0.70–1.40) : **60 fichiers** — à spot-checker (taille plausible ≠ fidélité prouvée).

## B. `.c` sans port homonyme — À CLASSER (≠ « non portés »)
- **Renommés / portés ailleurs (vérifié partiel)** : `party_menu`→`party-screen.ts`, `pokedex`→`pokedex-screen.ts`, `item_menu`→`bag-screen.ts`/`bag-menu.ts`, `battle_anim`→`battle-anim-*`.
- **Hors-scope plausible (link/frontier/minigames)** : `slot_machine` 7955, `trade` 5100, `union_room`(_chat) , `roulette` 4760, `contest`(_util), `battle_dome/tower/factory/pyramid` , `frontier_util`, `berry_blender/crush`, `dodrio_berry_picking`, `pokemon_jump`, `link`/`librfu_rfu`/`link_rfu_2`, `match_call`, `rayquaza_scene`, battle controllers link/partner/recorded.
- **Vrais candidats manquants (à vérifier en priorité)** : `pokemon_summary_screen` 4183, `intro` 3435 (← bug intro pixellisée signalé user), `decoration` 2748.

## C. Contrôle (la source directe des bugs vécus)
- **Témoin `gTasks[id].func =`** utilisé 29× dans 10 fichiers → les rails existent, mais **usage mélangé**.
- **9 écrans pilotés par un `TickX` polled** (≠ CB2+gTasks décomp) : `bag`, `party`, `pokedex`, `trainer_card`, `region-map`, `start_menu`, `shop`, `player_pc`, `pc-anim`. *(Field/movement/battle-anim ticks = légitimes, exclus.)*
- **3 machines maison explicites (`sSubState`)** : `player_pc` (40 refs + 9 témoins = à moitié migré), `start_menu` (24), `shop` (15 + 1 témoin). → à reconvertir en task-témoin.

## D. Heatmap déviations documentées (marqueurs/fichier, top 15)
`mail` 49 · `event_object_movement` 38 · `battle_script_commands` 35 · `battle_main` 31 · `specials-registry` 30 · `script-opcodes` 24 · `tileset_anims` 20 · `scrcmd` 18 · `main_menu` 16 · `field_effect_helpers` 16 · `battle_util` 15 · `script-interpreter` 14 · `battle-controllers` 13 · `bag-screen` 12 · `battle_controller_player` 11.

## E. Poids mort (PAS le gros sujet — déjà nettoyé)
- `harness/runtime/decomp-bridge.ts` = 506 l. / 14 exports / 31 importeurs (spine-decycle a vidé l'ancien monstre 656-exports — note mémoire à corriger).

## F. Confirmations (passe 2)
1. ✅ **« incomplet » éclatés résolus** : cœur (pokemon/field_effect/overworld/item/summary) = porté ailleurs/renommé, PAS manquant. Cf. Synthèse affinée.
2. ✅ **« bloat » confirmé** : surtout JSDoc ; vraie dup-code seulement `field_effect_helpers` + `script_movement` (code 1.91). Cf. Synthèse pt 3.
3. ◐ **Absents classés (gros)** : renommés (party_menu→party-screen, pokedex→pokedex-screen, item_menu→bag, battle_anim→battle-anim, summary→summary-screen) · hors-scope (link/rfu, frontier, minigames slot/berry/contest/trade/roulette/union) · partiels (decoration). Long-tail des petits `.c` = à classer si besoin.
4. ✅ **candidats manquants résolus** : summary/intro/decoration tous présents (renommés/partiels), aucun « cœur totalement absent ».
5. 🔴 **dup cross-cutting confirmée** : `gCamera` (fieldmap vs field_camera = 2 objets) + `gTrainerBattleOpponent_B` (battle_setup vs engine/battle/state). `gSaveBlock*Ptr` = re-exports propres (PAS dup). + **2 sous-systèmes sprites object-event** (overworld INLINE vs menu) = dup architecturale connue (cf. mémoire `graphics-1to1-verifier`).
6. ⏳ **spot-check des 60 « OK »** : différé (taille plausible = risque faible ; à échantillonner pendant l'attaque).

## Conclusion du recensement
La peur « dupliqué partout / d'où le poids » est **partiellement infirmée par les chiffres** : le code est **majoritairement proportionnel à la décomp** (lourdement commenté, ≠ dupliqué). Les **vrais** problèmes sont **concentrés et nommés** :
- 🚨 **tronc de contrôle** (`task` 15 % + 4 primitives partagées + témoin `.func` sous-utilisé → 9 écrans polled / 3 machines maison) = cause des bugs vécus ;
- 🔴 **2 globals dupliqués** (gCamera, gTrainerBattleOpponent_B) + **dup sprites** object-event ;
- **bloat-code** réel sur ~2-5 fichiers (field_effect_helpers, script_movement…) ;
- **dette de structure miroir** transverse (logique correcte mais hors chemin/nom 1:1) — réelle mais ≠ bugs.

Le **poids** = surtout la taille légitime d'un port Emerald complet (224 k l. de logique réelle + assets), PAS de la dup massive. (Le JSDoc est strippé au build → n'alourdit pas le bundle.)

**Point d'attaque verrouillé : le tronc `task.ts` ↔ `task.c`.**
