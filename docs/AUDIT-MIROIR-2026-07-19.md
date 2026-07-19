# AUDIT DE COMPLÉTUDE MIROIR 1:1 — 2026-07-19

Port miroir Pokémon Émeraude. Décomp de référence : `D:/Projet 1/decomps/pokeemeraude`.
Audit **lecture seule** (aucun fix). Périmètre = **SOLO COMPLET**.

Méthode : `cartograph-1to1.cjs` (baseline) **+** un matcher par-fichier maison
(`fnmatch`, `\bNom\b` sur *tout* `src/` + `harness/`) qui corrige le sous-comptage
du cartographe sur le code **renommé / dissous** (le cartographe ne matche que le
nom décomp *exact* comme définition TS ; nos helpers renommés lui échappent).
Les comptes « vérifiés » ci-dessous portent le marqueur **†**. Données croisées
avec les JSON extraits `public/decomp/em/*.json`.

> ⚠️ **Lire les chiffres du cartographe comme un plancher, pas une vérité.** Ex.
> `pokemon_summary_screen` : cartographe 13/140 → **réel 123/145†** (écran quasi
> complet, helpers `Print*` renommés `_print*`). Idem `start_menu`, `overworld`,
> `field_specials`, `party_menu` : fonctionnels, gaps réels bien plus petits que
> le brut ne le suggère.

---

## 1. SYNTHÈSE

**310 fichiers `src/*.c`** dans la décomp, classés par périmètre :

| Périmètre | Fichiers | Miroir complet ✅ | Partiel/dispersé 🟡🟠 | Absent 🔴 | Vide ⚪ |
|---|---:|---:|---:|---:|---:|
| **SOLO** | 220 | 120 | 85 | 15 | 0 |
| EXEMPT (link/contest/frontier/mystery-gift/e-reader) | 64 | 5 | 9 | 46 | 4 |
| INFRA (save-flash/RTC/m4a/malloc/interrupts/data-only) | 26 | 2 | 3 | 13 | 8 |

Complétude pondérée cartographe : **~53 % strict / ~56 % large** sur les 310.
**Effective SOLO** (bruit link/frontier retiré + code renommé recompté) : nettement
plus haute — l'écrasante majorité des systèmes solo **fonctionnent** ; les vrais
trous sont **~25 fichiers**, surtout du **contenu annexe** et de la **polish
visuelle**, pas le chemin critique.

**Le chemin critique (démarrer → 8 arènes → Ligue → Champion → Panthéon) est
essentiellement porté.** Aucun gap trouvé ci-dessous ne bloque *mécaniquement* la
progression (voir la nuance Dive/Waterfall en §3). Les manques sont : mini-jeux du
Casino, écrans annexes (Carte Dresseur, Maître des Capacités, étiquette de Baie),
effets visuels (particules météo, animations de warp), et quelques PNJ de saveur.

### Top-10 des manques SOLO les plus impactants (tous **vérifiés** absents)

1. **`field_weather_effect.c` — particules météo** (43/106†, ~62 fns absentes).
   `CreateRainSprite`/`Snow_*`/`Sandstorm_*`/`FogDiagonal_*`/`Bubbles_*`/`Drought_*`/
   `Thunderstorm_*` **introuvables partout**. Seuls Clouds/Sunny/Shade sont portés.
   → Pluie, neige, tempête de sable (désert R111), brouillard, bulles sous-marines,
   sécheresse **ne s'affichent pas**. Très visible, non bloquant.
2. **`field_effect.c` — effets de warp** (129/247, ~60 fns absentes). Escalator
   (grands magasins), Escape Rope, chute par trou (`FallWarp*`), Téléport
   (`TeleportWarp*`), arène de Vermilava (`LavaridgeGym*Warp*`), rocher Deoxys.
   → Warps **sans animation** (le warp brut passe, l'anim manque).
3. **`slot_machine.c`** (0/270, **aucun fichier dédié**). Machines à sous du Casino
   de Mauville. **Entièrement absent.**
4. **`roulette.c`** (0/104, **aucun fichier dédié**). Roulette du Casino. **Absent.**
5. **`trainer_card.c`** (31/82†, rendu absent). La **Carte Dresseur** (menu Start) :
   `DrawTrainerCardWindow`, `Print*OnCard`, `Task_TrainerCard`, flip d'animation —
   tout le rendu manque. Stub.
6. **Maître des Capacités** (`move_relearner.c` 5/22†, **aucun fichier** +
   `menu_specialized.c` `MoveRelearner*`/`InitMoveRelearnerWindows` absents +
   `party_menu.c` `Task_ChooseMonForMoveRelearner`/`GetTutorMove`). Rappel de
   capacités (Clémentiville, contre Écaille Cœur). **Absent.**
7. **`item_use.c`** (53/74†). Absents : **Cherch'Objet** (`IsHiddenItemPresentAtCoords`,
   `Task_HiddenItemNearby`…), **Repousse** (`Task_StartUseRepel`), **Flûtes B/N**
   (`Task_UsedBlackWhiteFlute`), **planter/arroser Baies** au champ
   (`ItemUseOnFieldCB_Berry`, `TryToWaterSudowoodo`).
8. **`fldeff_flash.c` — transition de grotte** (7/22†). `DoEnterCaveTransition`/
   `DoExitCaveTransition`/`Task_(Enter|Exit)CaveTransition*` absents → entrée/sortie
   de **toute grotte** sans le fondu circulaire + effet Flash. Très fréquent.
9. **`start_menu.c` — flux de sauvegarde improvisé** (§3). La sauvegarde marche mais
   n'est pas 1:1 : `InitStartMenu`, `StartMenuSaveCallback`, `SaveConfirmOverwrite*`
   absents, remplacés par `saveAction`/`_showSaveInfoWindow` maison.
10. **`party_menu.c`** (136/354, ~mais fonctionnel†). Absents utiles : entrées
    field-move **Plongée/Cascade** (voir nuance §3), lecture/écriture **Courrier**
    depuis l'équipe, flux **Objet CT/PP**, intégration tuteur/relearner.

**Mentions honorables** (annexe, non bloquant) : `mirage_tower.c` (0/27, Tour
Mirage/fossile), `berry_tag_screen.c` (1/27, étiquette de Baie), `cable_car.c`
(1/24, téléphérique Chenaline), **trades en jeu** (`trade.c` partie solo absente),
`mauville_old_man.c` (Barde/Conteur/Hipster de Mauville, 9/59), visionneuse
**Panthéon-PC** (`hof_pc.c` 0/4 + `menu.c` `HofPCTopBar_*`), transitions de combat
légendaires/génériques (`battle_transition.c` 97/210), anim d'herbe **Coupe**
(`fldeff_cut.c` 5/17), **dette H1** de la table d'actions de mouvement
(`event_object_movement.c`, §3).

---

## 2. TABLEAU PAR FICHIER `.c` (ordre alpha)

Légende état : ✅ miroir complet · 🟡 partiel · 🟠 dispersé · 🔴 absent/quasi · ⚪ vide/data.
Portée : **S**=solo · **E**=exempt · **I**=infra. Comptes = `portées/total` (cartographe,
sauf **†** = vérifié fnmatch). « Notes » = fonctions manquantes clés / où vit le code.

| État | P | Fichier .c | fns | Notes |
|---|---|---|---|---|
| 🔴 | I | agb_flash_1m.c | 0/2 | Flash save HW — exempt |
| ⚪ | I | agb_flash_le.c | 0/0 | data |
| 🔴 | I | agb_flash_mx.c | 0/5 | Flash save HW — exempt |
| 🔴 | I | agb_flash.c | 0/15 | Flash save HW — exempt |
| 🔴 | E | AgbRfu_LinkManager.c | 0/34 | Link RFU — exempt |
| ⚪ | I | anim_mon_front_pics.c | 0/0 | data (incbin) |
| 🔴 | E | apprentice.c | 3/53 | Frontier — exempt |
| 🔴 | E | bard_music.c | 0/5 | Mauville Barde (musique) — **absent** (lié mauville_old_man) |
| ✅ | S | battle_ai_script_commands.c | 115/115 | |
| ✅ | S | battle_ai_switch_items.c | 13/13 | |
| ✅ | S | battle_anim_bug.c | 13/13 | |
| 🟡 | S | battle_anim_dark.c | 19/25 | anims manquantes mineures |
| 🟡 | S | battle_anim_dragon.c | 10/11 | |
| 🟡 | S | battle_anim_effects_1.c | 143/154 | split → `battle_anim_effects_1.ts` + `_1b.ts` |
| 🟡 | S | battle_anim_effects_2.c | 116/121 | |
| ✅ | S | battle_anim_effects_3.c | 133/140 | |
| ✅ | S | battle_anim_electric.c | 34/37 | |
| ✅ | S | battle_anim_fight.c | 30/31 | |
| ✅ | S | battle_anim_fire.c | 30/35 | |
| 🟡 | S | battle_anim_flying.c | 27/31 | |
| ✅ | S | battle_anim_ghost.c | 34/37 | |
| ✅ | S | battle_anim_ground.c | 25/25 | |
| ✅ | S | battle_anim_ice.c | 30/32 | |
| ✅ | S | battle_anim_mon_movement.c | 34/34 | |
| 🟡 | S | battle_anim_mons.c | 102/128 | helpers OAM renommés en partie |
| 🟡 | S | battle_anim_normal.c | 25/36 | |
| 🟡 | S | battle_anim_poison.c | 9/9 | (comptage cartographe strict ≠ homonyme) |
| 🟡 | S | battle_anim_psychic.c | 24/27 | |
| 🟡 | S | battle_anim_rock.c | 19/22 | |
| 🟡 | S | battle_anim_smokescreen.c | 1/3 | anim écran de fumée mineure |
| ✅ | S | battle_anim_sound_tasks.c | 15/15 | |
| 🟡 | S | battle_anim_status_effects.c | 8/12 | |
| ✅ | S | battle_anim_throw.c | 67/78 | anim de lancer de Ball (capture OK) |
| ✅ | S | battle_anim_utility_funcs.c | 39/42 | |
| ✅ | S | battle_anim_water.c | 44/48 | |
| ✅ | S | battle_anim.c | 75/79 | |
| 🔴 | E | battle_arena.c | 2/19 | Frontier — exempt |
| 🟡 | S | battle_bg.c | 7/12† | fond de combat ; helpers renommés, fonctionnel |
| 🟡 | E | battle_controller_link_opponent.c | 19/88 | Link — exempt (mappé partner) |
| 🟡 | E | battle_controller_link_partner.c | 20/86 | Link — exempt |
| 🟡 | S | battle_controller_opponent.c | 83/88 | |
| ✅ | S | battle_controller_player_partner.c | 85/93 | (2v2 solo) |
| 🟡 | S | battle_controller_player.c | 108/124 | |
| 🟡 | E | battle_controller_recorded_opponent.c | 19/88 | Record — exempt |
| 🟡 | E | battle_controller_recorded_player.c | 18/87 | Record — exempt |
| 🔴 | E | battle_controller_safari.c | 6/73 | **Safari Zone** — controller absent (voir §3, borderline) |
| 🔴 | E | battle_controller_wally.c | 9/82 | Tuto Flora — combat scripté ; controller absent |
| 🟡 | S | battle_controllers.c | 48/68 | dispatch ; `BattlePutTextOnWindow` ici |
| 🔴 | E | battle_dome.c | 0/72 | Frontier — exempt |
| 🔴 | E | battle_factory_screen.c | 3/119 | Frontier — exempt |
| ✅ | S | battle_factory.c | 27/27 | (data utilisée hors frontier) |
| 🟡 | S | battle_gfx_sfx_util.c | 43/53 | |
| 🟡 | S | battle_interface.c | 32/53† | healthbox OK ; **Safari ball counter** + `GetStatusIconForBattlerId` absents |
| ✅ | S | battle_intro.c | 10/11 | |
| ✅ | S | battle_main.c | 100/108 | absorbe `battle_util2.c` |
| 🟠 | S | battle_message.c | 7/10† | **dispersé** → `battle_controllers.ts`, `battle_controller_opponent.ts` |
| ✅ | S | battle_palace.c | 12/12 | |
| ✅ | S | battle_pike.c | 56/56 | |
| 🔴 | E | battle_pyramid_bag.c | 5/81 | Frontier — exempt |
| 🔴 | E | battle_pyramid.c | 7/52 | Frontier — exempt |
| 🔴 | E | battle_records.c | 3/31 | Link records — exempt |
| ✅ | S | battle_script_commands.c | 271/287 | cœur combat |
| 🟡 | S | battle_setup.c | 95/103† | absents : `GetTrainerWonSpeech`/`GetTrainerBLoseText` (**texte fin de combat dresseur**), `BattleSetup_StartRoamerBattle`, `GetSpecialBattleTransition` |
| ✅ | S | battle_tent.c | 32/32 | |
| 🟡 | E | battle_tower.c | 13/84 | Frontier — exempt |
| 🔴 | E | battle_transition_frontier.c | 0/34 | Frontier — exempt |
| 🟡 | S | battle_transition.c | 97/210† | transitions légendaires (Groudon/Kyogre/Rayquaza/Regis), Aqua/Magma, Mugshot (Conseil 4/leaders), Blackhole, ShredSplit… **absentes** (polish) |
| ✅ | S | battle_tv.c | 12/12 | |
| 🟡 | S | battle_util.c | 43/52 | |
| 🟠 | S | battle_util2.c | 3/5† | **dispersé** → `battle_main.ts` (AllocateBattleResources…) |
| 🔴 | E | berry_blender.c | 1/81 | Mini-jeu multi — exempt |
| 🔴 | E | berry_crush.c | 2/74 | Mini-jeu multi — exempt |
| 🔴 | I | berry_fix_graphics.c | 0/1 | Prog. berry-fix GBA — exempt |
| 🔴 | I | berry_fix_program.c | 0/6 | Prog. berry-fix GBA — exempt |
| 🔴 | E | berry_powder.c | 2/14 | Poudre (multi) — exempt |
| 🔴 | S | **berry_tag_screen.c** | 1/27† | **Étiquette de Baie absente** (aucun fichier). Voir Baies au champ. |
| 🟡 | S | berry.c | 35/37† | absents : `IsPlayerFacingEmptyBerryTreePatch`, `TryToWaterBerryTree` → **planter/arroser** incomplet |
| 🟡 | S | bg.c | 29/52† | **dissous** → `window.ts` (+ internes renommés). BG fonctionnel |
| ✅ | S | bike.c | 56/56 | vélo (Acro+Course) |
| ✅ | S | birch_pc.c | 3/3 | |
| ✅ | S | blit.c | 5/5 | |
| ✅ | S | braille_puzzles.c | 18/18 | (logique braille : portée ; police braille = exemption archi) |
| 🔴 | S | braille.c | 0/3 | **Exemption architecturale** (moteur-texte émulé) |
| 🔴 | S | **cable_car.c** | 1/24† | **Téléphérique Chenaline absent** (aucun fichier) |
| 🔴 | E | cable_club.c | 1/62 | Link — exempt |
| 🔴 | I | clear_save_data_screen.c | 1/9 | Écran reset save — mineur |
| 🟡 | S | clock.c | 1/6† | absents : `InitTimeBasedEvents`, `ReturnFromStartWallClock` |
| ✅ | S | coins.c | 7/7 | jetons Casino (compteur OK, jeux absents) |
| ✅ | S | confetti_util.c | 8/8 | |
| 🔴 | E | contest_ai.c | 2/142 | Concours — exempt |
| ✅ | E | contest_effect.c | 51/51 | (data réutilisée : TV, etc.) |
| 🔴 | E | contest_link_util.c | 0/12 | Concours — exempt |
| 🔴 | E | contest_link.c | 0/17 | Concours — exempt |
| 🔴 | E | contest_painting.c | 0/20 | Concours — exempt |
| 🔴 | E | contest_util.c | 0/111 | Concours — exempt |
| 🔴 | E | contest.c | 9/205 | Concours — exempt |
| ✅ | S | coord_event_weather.c | 14/14 | |
| ✅ | S | credits.c | 36/38 | générique de fin |
| ⚪ | I | data.c | 0/0 | data |
| ✅ | S | daycare.c | 67/67 | Pension |
| 🔴 | S | decompress.c | 12/21† | **dispersé** ; absents : `LoadSpecialPokePic_2`, `DecompressPicFromTable_DontHandleDeoxys`, `DuplicateDeoxysTiles` (formes Deoxys + buffers override). Cœur OK |
| ✅ | S | decoration_inventory.c | 11/11 | |
| ✅ | S | decoration.c | 133/135 | Bases secrètes déco |
| ✅ | S | dewford_trend.c | 11/13 | ragot Fongus |
| ✅ | S | digit_obj_util.c | 14/14 | util. sprites-chiffres |
| 🟡 | S | diploma.c | 2/10† | **Diplôme** (Pokédex complet) — quasi absent, dispersé `option_menu.ts` (coincidence). Post-game mineur |
| ✅ | S | dma3_manager.c | 5/5 | |
| 🔴 | E | dodrio_berry_picking.c | 4/159 | Mini-jeu multi — exempt |
| ✅ | S | dynamic_placeholder_text_util.c | 4/4 | |
| ✅ | S | easy_chat.c | 223/248 | Messagerie facile |
| ✅ | S | egg_hatch.c | 25/25 | éclosion œuf |
| ✅ | E | ereader_helpers.c | 26/26 | (porté mais e-reader = exempt) |
| 🔴 | E | ereader_screen.c | 0/11 | e-reader — exempt |
| ✅ | S | event_data.c | 25/25 | flags/vars |
| 🟡 | S | event_object_lock.c | 13/14 | |
| 🟡 | S | **event_object_movement.c** | 212/733† | 9514 lignes portées. Table `gMovementActionFuncs[]`/`MovementType_*` **data-driven** (`movement-actions.json`, 159) + **dette H1** (dispatch inliné, cf. commentaires in-code). Mouvement fonctionne ; pas 1:1 strict sur les step-funcs. Voir §3 |
| ✅ | S | evolution_graphics.c | 37/37 | |
| ✅ | S | evolution_scene.c | 25/25 | |
| ✅ | S | faraway_island.c | 15/15 | Mew (île Lointaine) |
| ✅ | S | field_camera.c | 28/28 | |
| 🟡 | S | field_control_avatar.c | 34/41† | absents : `ClearFriendshipStepCounter`, `ClearPoisonStepCounter`, `RestartWildEncounterImmunitySteps`, `GetCoordEventScriptAtPosition` (probables renommages ; à confirmer) |
| 🟡 | S | field_door.c | 18/24† | portes OK ; `StartDoorOpen/CloseAnimation`, `GetDoorSoundType` renommés (→ `scrcmd_door.ts`) |
| ✅ | S | field_effect_helpers.c | 76/81 | (fichier décomp distinct — pas une dispersion) |
| 🟡 | S | **field_effect.c** | 129/247† | **absents ~60 warps** : Escalator, EscapeRope, FallWarp, TeleportWarp, LavaridgeGym*, Deoxys rock, Ash. `FldEff_UseDive`/`UseWaterfall`/`UseSurf` **présents**. Voir §3 |
| 🟡 | S | field_message_box.c | 10/17† | dialogues OK ; `ShowFieldAutoScrollMessage`, `ShowPokenavFieldMessage` absents/renommés |
| ✅ | S | field_player_avatar.c | 152/177 | |
| ✅ | S | field_poison.c | 7/7 | |
| 🔴 | S | field_region_map.c | 0/6 | mini carte région (Poké Nav tuto) — mineur |
| 🟡 | S | field_screen_effect.c | 60/78† | absents solo : `Task_Spin(Enter/Exit)Warp`, `FieldCB_MossdeepGymWarpExit`, `DoPortholeWarp` (reste = link/record exempt) |
| 🟡 | S | field_special_scene.c | 8/13 | scènes (Cabine SS, camion…) partielles |
| 🟡 | S | field_specials.c | 144/192† | absents solo : **ScrollableMultichoice** (~8), portes **Arène Clémenti** (`PetalburgGymSetDoorMetatiles`), **ascenseurs** (Lavandia/Atlanopolis), **Loterie** (`LotteryCornerComputerEffect`), Deoxys/météo anormale, Route Cyclisme, `PCTurnOffEffect` |
| ✅ | S | field_tasks.c | 28/28 | |
| 🟡 | S | **field_weather_effect.c** | 43/106† | **particules absentes** : Rain/Snow/Sandstorm/Fog/Bubbles/Drought/Thunderstorm/Downpour. Clouds/Sunny/Shade OK. Voir top-10 #1 |
| ✅ | S | field_weather.c | 48/49 | (coordinateur — l'état météo marche ; le rendu particules non) |
| ✅ | S | fieldmap.c | 55/55 | |
| 🟡 | S | fldeff_cut.c | 9/18† | **anim herbe Coupe** absente (`CutGrassSpriteCallback*`, `SetCutGrassMetatiles`, `StartCutGrassFieldEffect`). Coupe-arbre OK |
| 🟡 | S | fldeff_dig.c | 3/4† | `StartDigFieldEffect` absent (anim Tunnel) |
| ✅ | S | fldeff_escalator.c | 6/6 | |
| 🟡 | S | fldeff_flash.c | 7/22† | **transition grotte** absente (`Do(Enter/Exit)CaveTransition`, `Task_*CaveTransition*`). Voir top-10 #8 |
| 🟡 | S | fldeff_misc.c | 23/66† | absents : entrées **Base Secrète** (`FldEff_SecretPower*`, `SpriteCB_*Entrance`), **anim arrosage Baie** (`Task_WateringBerryTreeAnim_*`), **anim poison au champ** (`Task_FieldPoisonEffect`), pilier de sable |
| 🟠 | S | fldeff_rocksmash.c | 8/10† | RockSmash OK ; contient aussi `SetUpFieldMove_Strength` |
| 🟠 | S | fldeff_softboiled.c | 7/8† | **dispersé** → `party_menu.ts` (Adoucissant) |
| 🟡 | S | fldeff_strength.c | 4/4 | Force OK |
| 🟡 | S | fldeff_sweetscent.c | 6/6 | Doux Parfum OK |
| 🟡 | S | fldeff_teleport.c | 4/4† | setup Téléport OK ; l'**effet warp** vit dans field_effect.c → **absent** |
| ⚪ | I | fonts.c | 0/0 | data police |
| 🔴 | E | frontier_pass.c | 0/37 | Frontier — exempt |
| 🔴 | E | frontier_util.c | 5/93 | Frontier — exempt |
| ✅ | S | give_gift_ribbon_to_party.c | 1/1 | |
| 🟡 | S | gpu_regs.c | 6/12† | absents : `InitGpuRegManager`, `CopyBufferedValuesToGpuRegs`, `SetGpuReg_ForcedBlank`, `SyncRegIE` — buffering GPU partiel (adaptation moteur) |
| ⚪ | I | graphics.c | 0/0 | data incbin |
| ✅ | S | gym_leader_rematch.c | 3/3 | |
| 🟡 | S | hall_of_fame.c | 40/49† | Panthéon (fin) OK ; **visionneuse Panthéon-PC** (`CB2_DoHallOfFamePC`, `Task_HofPC_*`) absente |
| 🟡 | S | heal_location.c | 1/3† | `GetHealLocationByMap`/`IndexByMap` absents/renommés ; soin PC fonctionne |
| 🔴 | S | hof_pc.c | 0/4 | visionneuse Panthéon depuis PC — **absent** (post-game mineur) |
| ✅ | S | image_processing_effects.c | 38/38 | |
| ✅ | S | international_string_util.c | 18/18 | |
| 🟡 | S | intro_credits_graphics.c | 16/20 | |
| ✅ | S | intro.c | 63/69 | **intro/copyright + discours Seko présents** |
| ⚪ | I | io_reg.c | 0/0 | data |
| 🟡 | S | item_icon.c | 2/6† | icônes objet — helpers renommés |
| 🟡 | S | item_menu_icons.c | 15/21 | |
| ✅ | S | item_menu.c | 105/122 | Sac |
| 🟡 | S | **item_use.c** | 53/74† | Voir top-10 #7 (Cherch'Objet, Repousse, Flûtes, Baies au champ) |
| ✅ | S | item.c | 44/52† | solo complet (absents = pyramid bag + chiffrement, exempts) |
| ✅ | S | landmark.c | 2/2 | |
| 🔴 | I | libisagbprn.c | 0/16 | debug print HW — exempt |
| 🔴 | E | librfu_intr.c | 0/10 | Link — exempt |
| 🔴 | E | librfu_rfu.c | 0/86 | Link — exempt |
| 🔴 | E | librfu_sio32id.c | 0/4 | Link — exempt |
| 🔴 | E | librfu_stwi.c | 0/48 | Link — exempt |
| ✅ | S | lilycove_lady.c | 72/72 | Dame Atlanopolis (quête/collecte/mode) |
| 🔴 | E | link_rfu_2.c | 0/150 | Link — exempt |
| 🔴 | E | link_rfu_3.c | 4/30 | Link — exempt |
| 🔴 | E | link.c | 11/125 | Link — exempt |
| ✅ | S | list_menu.c | 45/48 | |
| 🟡 | I | load_save.c | 16/21† | absents = chiffrement + `CheckForFlashMemory` (HW exempt) + `SavePlayerBag` |
| ✅ | S | lottery_corner.c | 8/8 | (logique loterie OK ; l'anim `LotteryCornerComputerEffect` est dans field_specials — absente) |
| ⚪ | I | m4a_tables.c | 0/0 | data son |
| ✅ | I | m4a.c | 70/72 | moteur son 1:1 (validé) |
| ✅ | S | mail_data.c | 12/12 | |
| ✅ | S | mail.c | 10/10 | (lecture ; écriture depuis équipe = party_menu, absente) |
| ✅ | S | main_menu.c | 82/82 | |
| 🟡 | I | main.c | 15/29† | absents = handlers d'interruption/série GBA (HW) + `WaitForVBlank` (adapté hôte) |
| 🟡 | I | malloc.c | 3/12 | Alloc/Free = GC TS — **exemption structurelle** |
| ✅ | S | map_name_popup.c | 6/7 | |
| ✅ | S | match_call.c | 56/56 | Match Appel |
| ✅ | S | math_util.c | 9/9 | |
| 🟡 | S | mauville_old_man.c | 26/60† | **Barde/Conteur/Hipster/Giddy** de Mauville absents (~34 fns : `BardSing`, `Storyteller*`, `InitGiddyTaleList`) |
| 🟡 | S | menu_helpers.c | 24/25 | |
| 🟡 | S | menu_specialized.c | 48/61† | absents : **Maître Capacités** (`MoveRelearner*`, `InitMoveRelearnerWindows`) + **Boîte aux lettres PC** (`MailboxMenu_*`) |
| 🟡 | S | menu.c | 94/124† | absents : `HofPCTopBar_*` (Panthéon-PC), `AddStartMenuWindow`/`GetStartMenuWindowId` (lié start_menu), grid-input renommé |
| ✅ | S | metatile_behavior.c | 144/144 | |
| 🔴 | I | mini_printf.c | 0/9 | debug — exempt |
| 🔴 | S | minigame_countdown.c | 0/20 | compte-à-rebours mini-jeux (surtout multi) — **absent** |
| 🔴 | S | **mirage_tower.c** | 0/27† | **Tour Mirage / fossile** (R111) — **absent** (aucun fichier) |
| ✅ | S | mon_markings.c | 15/15 | marquages |
| ✅ | S | money.c | 13/15 | |
| 🔴 | S | **move_relearner.c** | 5/22† | **Maître des Capacités** — **absent** (aucun fichier). Voir top-10 #6 |
| 🔴 | E | multiboot.c | 0/9 | Link — exempt |
| 🟡 | E | mystery_event_menu.c | 1/6 | Mystery event — exempt |
| ⚪ | E | mystery_event_msg.c | 0/0 | data |
| ✅ | E | mystery_event_script.c | 30/30 | (moteur porté ; feature = exempt) |
| 🔴 | E | mystery_gift_client.c | 0/18 | Mystery gift — exempt |
| 🔴 | E | mystery_gift_link.c | 0/10 | exempt |
| 🔴 | E | mystery_gift_menu.c | 0/35 | exempt |
| ⚪ | E | mystery_gift_scripts.c | 0/0 | data |
| 🔴 | E | mystery_gift_server.c | 0/15 | exempt |
| 🔴 | E | mystery_gift_view.c | 0/18 | exempt |
| 🔴 | E | mystery_gift.c | 4/45 | exempt |
| ✅ | S | naming_screen.c | 110/120† | (absents = Debug_ + envoi-PC edge) |
| ✅ | S | new_game.c | 13/13 | |
| ✅ | S | option_menu.c | 24/24 | |
| 🟡 | S | overworld.c | 130/227† | **solo quasi complet** ; absents ≈ tous link/cable-club/multi. Reste solo : `Set/UpdateEscapeWarp`, `SetWarpDestinationToFixedHoleWarp`, `PlayAmbientCry`, `SetContinueGameWarpToDynamicWarp` |
| ✅ | S | palette_util.c | 19/19 | |
| 🟡 | S | palette.c | 28/40† | absents : `PaletteStruct_*` (anim palette temporisée ~9), `BeginPlttFade`, `ReadPlttIntoBuffers`. Fades normaux OK |
| 🟡 | S | party_menu.c | 243/354† | Voir top-10 #10. **Fonctionnel** ; helpers de rendu renommés |
| ✅ | S | play_time.c | 5/5 | |
| 🟡 | S | player_pc.c | 44/85† | PC du joueur (objets/déco/boîte) partiel |
| 🟡 | S | pokeball.c | 24/39† | capture OK (via `battle_anim_throw.ts`) ; `SpriteCB_BallThrow_*`/`SpriteCB_TradePokeball*` absents ici |
| 🔴 | E | pokeblock_feed.c | 0/28 | Pokéblocks (concours) — exempt |
| 🔴 | E | pokeblock.c | 3/58 | Pokéblocks (concours) — exempt |
| ✅ | S | pokedex_area_region_map.c | 4/4 | |
| 🟡 | S | pokedex_area_screen.c | 15/19 | zones Pokédex |
| ✅ | S | pokedex_cry_screen.c | 14/14 | |
| ✅ | S | pokedex.c | 131/140 | Pokédex |
| ✅ | S | pokemon_animation.c | 237/241 | |
| 🟡 | S | pokemon_icon.c | 18/25† | icônes OK ; gestion palettes renommée |
| 🔴 | E | pokemon_jump.c | 5/178 | Mini-jeu multi — exempt |
| 🟡 | S | pokemon_size_record.c | 12/12† | **complet** (cartographe faux) |
| ✅ | S | pokemon_storage_system.c | 380/380 | PC Boîtes (complet) |
| 🔴 | S | **pokemon_summary_screen.c** | 123/145† | **CARTOGRAPHE FAUX (13/140)** — écran **quasi complet**. Absents : `Print*` (renommés `_print*`), multi-battle (exempt), `ShowPokemonSummaryScreenHandleDeoxys`, `DidMonComeFromGBAGames` |
| 🟡 | S | pokemon.c | 119/168† | absents utiles : `DrawSpindaSpots` (**taches Spinda**), `GetMoveRelearnerMoves`, `GetDeoxysStat`, `CreateEventMon`, `Task_PlayMapChosenOrBattleBGM`. Reste = frontier/link/secret-base + helpers renommés (`GetSubstruct`, `DecryptBoxMon`) |
| ✅ | S | pokenav_conditions_gfx.c | 28/28 | |
| ✅ | S | pokenav_conditions_search_results.c | 36/36 | |
| ✅ | S | pokenav_conditions.c | 32/32 | |
| ✅ | S | pokenav_list.c | 47/47 | |
| ✅ | S | pokenav_main_menu.c | 45/45 | |
| ✅ | S | pokenav_match_call_data.c | 59/59 | |
| ✅ | S | pokenav_match_call_gfx.c | 65/65 | |
| ✅ | S | pokenav_match_call_list.c | 29/29 | |
| ✅ | S | pokenav_menu_handler_gfx.c | 56/56 | |
| ✅ | S | pokenav_menu_handler.c | 26/27 | |
| ✅ | S | pokenav_region_map.c | 37/37 | |
| ✅ | S | pokenav_ribbons_list.c | 37/37 | |
| ✅ | S | pokenav_ribbons_summary.c | 55/55 | |
| 🟡 | S | pokenav.c | 26/28 | lanceur Poké Nav (module lazy) |
| ✅ | S | post_battle_event_funcs.c | 2/2 | |
| ✅ | S | random.c | 4/4 | |
| ✅ | S | rayquaza_scene.c | 72/72 | scène Rayquaza (climax) |
| 🔴 | E | record_mixing.c | 1/43 | Link — exempt |
| 🟡 | E | recorded_battle.c | 13/42 | Record — exempt (dispersé battle_main) |
| ✅ | S | region_map.c | 60/60 | carte région (Vol) |
| 🔴 | I | reload_save.c | 0/1 | exempt |
| 🔴 | I | reset_rtc_screen.c | 1/19 | reset RTC HW — exempt |
| 🟡 | S | reshow_battle_screen.c | 5/7 | |
| 🟡 | S | roamer.c | 10/13† | absents : `RoamerMove`, `GetRoamerLocation`, `IsRoamerAt`, `CreateRoamerMonInstance` → **roaming légendaire (Latias/Latios)** incomplet |
| 🔴 | I | rom_header_gf.c | 0/1 | data header |
| 🟡 | S | rotating_gate.c | 15/22 | portails rotatifs (Casse-Brique) partiel |
| ✅ | S | rotating_tile_puzzle.c | 6/6 | |
| 🔴 | S | **roulette.c** | 1/104† | **Roulette Casino** — **absent** (aucun fichier). Top-10 #4 |
| ✅ | S | rtc.c | 26/26 | pont RTC (validé) |
| ✅ | S | safari_zone.c | 17/17 | logique Safari (steps/balls) OK ; controller de combat = exempt |
| 🔴 | I | save_failed_screen.c | 1/12 | écran échec save HW — exempt |
| ✅ | S | save_location.c | 10/10 | |
| 🟡 | I | save.c | 16/35† | secteurs flash = **moteur save 1:1 séparé (validé)**. ⚠️ note plan B1.1 : `Save/LoadPlayerParty` no-op → équipe Steven corrompue |
| ✅ | S | scanline_effect.c | 9/9 | |
| ✅ | S | scrcmd.c | 222/231 | interpréteur script (byte-VM) |
| 🟡 | S | script_menu.c | 16/31† | multichoice **présent** (dispersé scrcmd/field_specials/special_flows) ; absents : `Task_HandleMultichoiceGridInput`, `CreateLilycoveSSTidalMultichoice`, `ScriptMenu_DisplayPCStartupPrompt` |
| 🟡 | S | script_movement.c | 11/19 | |
| 🟡 | S | script_pokemon_util.c | 7/13 | |
| 🟡 | S | script.c | 31/39 | |
| ✅ | S | secret_base.c | 99/99 | Bases Secrètes (logique complète ; entrées visuelles = fldeff_misc, absentes) |
| 🟡 | S | shop.c | 45/59† | **fonctionnel** (achat/vente récents) ; `BuyMenu*` renommés + **magasin Déco** (`CreateDecorationShop1/2Menu`) absent |
| 🔴 | I | siirtc.c | 0/16 | RTC HW — exempt |
| 🔴 | S | **slot_machine.c** | 0/270 | **Machines à sous Casino** — **absent** (aucun fichier). Top-10 #3 |
| ✅ | S | sound.c | 47/47 | |
| 🟡 | S | sprite.c | 97/102† | quasi complet ; internes OAM renommés |
| 🔴 | S | **start_menu.c** | 38/82† | **fonctionnel mais flux Save improvisé** (§3). Absents solo : `InitStartMenu`, `StartMenuSaveCallback`, `SaveConfirmOverwrite*`, `PrintStartMenuActions` |
| ✅ | S | starter_choose.c | 17/18 | choix starter |
| ✅ | S | string_util.c | 44/44 | |
| ⚪ | I | strings.c | 0/0 | data (getString) |
| 🟡 | S | task.c | 14/14† | **complet** (cartographe faux) |
| ⚪ | I | text_input_strings.c | 0/0 | data |
| ✅ | S | text_window.c | 11/11 | |
| 🟡 | S | text.c | 39/55† | **dissous** → `engine/ui/bitmap-font.ts` (`FontFunc_*`, largeurs, icônes clavier). Texte fonctionne |
| ✅ | S | tileset_anims.c | 84/84 | |
| ⚪ | I | tilesets.c | 0/0 | data |
| ✅ | S | time_events.c | 10/10 | |
| ✅ | S | title_screen.c | 18/20 | écran-titre |
| 🔴 | S | trade.c | 10/134† | link trade = exempt ; **trades EN JEU absents** (`CB2_InInGameTrade`, `CreateInGameTradePokemonInternal`, `Task_InGameTrade`) — ~5 PNJ |
| 🟡 | S | trader.c | 3/13 | troc déco (Fongus) partiel |
| 🔴 | S | **trainer_card.c** | 31/82† | **Carte Dresseur** — rendu absent. Top-10 #5 |
| 🟡 | E | trainer_hill.c | 9/60 | Frontier — exempt |
| 🟡 | S | trainer_pokemon_sprites.c | 10/23† | sprites dresseur partiels |
| ✅ | S | trainer_see.c | 39/39 | détection dresseur |
| ✅ | S | trig.c | 4/4 | |
| ✅ | S | tv.c | 207/207 | Télé (complet) |
| 🔴 | E | union_room_battle.c | 0/5 | Link — exempt |
| 🔴 | E | union_room_chat.c | 3/123 | Link — exempt |
| 🔴 | E | union_room_player_avatar.c | 1/38 | Link — exempt |
| 🔴 | E | union_room.c | 0/111 | Link — exempt |
| 🔴 | E | use_pokeblock.c | 0/51 | Pokéblocks (concours) — exempt |
| 🟡 | S | util.c | 7/11 | |
| ✅ | S | walda_phrase.c | 14/14 | |
| ✅ | S | wallclock.c | 25/25 | horloge murale (réglage) |
| ✅ | S | wild_encounter.c | 33/34 | rencontres sauvages |
| 🟡 | S | window.c | 22/30† | fenêtres OK ; absorbe une partie de bg.c |
| 🔴 | E | wireless_communication_status_screen.c | 0/12 | Link — exempt |
| 🔴 | E | wonder_news.c | 1/9 | Mystery gift — exempt |

---

## 3. DIVERGENCES STRUCTURELLES

### 3.1 Divergences ACTÉES / justifiées (anti-cycle ESM, split de taille, adaptation moteur)

- **`engine/battle/*.ts` = shims de compat documentés.** `battle-main-functions.ts`
  porte l'en-tête « SHIM de compat — la machine `gBattleMainFunc` COMPLÈTE est
  CONSOLIDÉE dans `battle_main.ts` ». Re-export nommé, code 1:1 dans l'homonyme.
  **Non-divergence** (architecture délibérée).
- **`battle_anim_effects_1.c` → `battle_anim_effects_1.ts` + `battle_anim_effects_1b.ts`.**
  Split de taille (fichier énorme). Nombreux `battle_anim_*.ts` portent des
  commentaires anti-cycle explicites. Acceptable.
- **`bg.c` dissous dans `window.ts`** (+ internes renommés) et **`text.c`
  (`FontFunc_*`) dissous dans `engine/ui/bitmap-font.ts`.** Adaptations moteur du
  sous-système texte/BG. Fonctionnels ; **à noter comme écart de découpage** (le
  miroir voudrait `bg.ts`/`text.ts` homonymes complets).
- **`battle_message.c` → `battle_controllers.ts` / `battle_controller_opponent.ts`**
  et **`battle_util2.c` → `battle_main.ts`.** Dispersions ; pas de commentaire
  anti-cycle trouvé → **écart de découpage non justifié explicitement** (mais code
  présent et fonctionnel).
- **`movement-system.ts` = doublon maison MORT**, auto-documenté (« C'était un
  DOUBLON maison des MovementAction Step funcs qui vivent déjà dans
  `event_object_movement.ts` (`gMovementActionFuncs[]`). Vérifié MORT en runtime »).
  À supprimer (dette d'hygiène), pas une divergence active.

### 3.2 Divergences NON justifiées (Règle 1 — improvisation / non-1:1)

- **`start_menu.c` — flux de sauvegarde improvisé.** La state-machine décomp
  (`SaveCallback` → `SaveConfirmOverwriteCallback` → `SaveConfirmSaveCallback` →
  `SaveErrorCallback` …) est **absente** ; remplacée par des helpers maison
  `saveAction` / `_showSaveInfoWindow` / `_removeSaveInfoWindow`. `InitStartMenu`
  et `PrintStartMenuActions` absents aussi (le reste du menu — `CreateStartMenuTask`,
  `BuildStartMenuActions`, `HandleStartMenuInput`, `StartMenu*Callback` — **est**
  porté 1:1). → **À re-transcrire** (sous-menu Save).
- **`event_object_movement.c` — table d'actions de mouvement data-driven + dette H1.**
  Les ~200 `MovementAction_*_Step0/1` et `MovementType_*_Step*` du décomp ne sont
  pas transcrites comme fonctions nommées : représentées en **données**
  (`movement-actions.json`, 159 entrées `{dx,dy,facing,kind,speedMs}`) et le
  dispatch `gMovementActionFuncs[]` est **inliné** (commentaires « DETTE H1 » dans
  le code). Le mouvement fonctionne mais **n'est pas 1:1 strict** sur les step-funcs.
  C'est la plus grosse divergence structurelle du port. Actée comme dette in-code.

### 3.3 Noms de state-machine à surveiller

- `field_effect.c` : le script-interpréteur d'effets (`FieldEffectCmd_loadtiles`,
  `_loadpal`, `_callnative`, `FieldEffectScript_ReadWord`) n'apparaît pas sous ces
  noms → le VM d'effets est probablement inliné dans `_runFieldEffectScript`
  (à vérifier ; fonctionnel pour les effets portés, mais les commandes ≠ 1:1).

---

## 4. DONNÉES

Toutes les tables majeures chargent du **RÉEL extrait** (`public/decomp/em/*.json`),
via accesseurs 1:1 (ex. `species_info.ts` → `game-data.ts` → `species-info.json`,
proxy lazy). **Aucun trou / troncature** détecté sur les domaines échantillonnés :

| Domaine | Fichier JSON | Entrées | Attendu Émeraude | Verdict |
|---|---|---:|---:|---|
| Espèces (base stats/types/talents/groupes œuf) | `species-info.json` | 387 | 386 + NONE | ✅ complet |
| Capacités (effet/puiss/type/préc/PP/cible/prio) | `moves-data.json` | 355 | 354 + NONE | ✅ complet |
| Objets (nom/prix/poche/desc/usage) | `items.json` | 377 | 377 | ✅ complet |
| Dresseurs | `trainers.json` | 855 | ~854 | ✅ complet |
| Équipes dresseurs | `trainer-parties.json` | 855 | ~854 | ✅ complet |
| Évolutions | `evolutions.json` | 172 | ~172 | ✅ complet |
| Apprentissage niveau | `level-up-learnsets.json` | 411 | 411 | ✅ complet |
| CT/CS | `tmhm-learnsets.json` | 411 | 411 | ✅ complet |
| Tuteur | `tutor-learnsets.json` | 387 | ~387 | ✅ complet |
| Œuf | `egg-moves.json` | 165 | ~165 | ✅ complet |
| Rencontres sauvages | `wild-encounters.json` | `byMap` (toutes maps) | — | ✅ complet (species/niveaux réels par map, land/water/rock) |
| Maps / layouts | (cartographe) | 988 maps · 884 layouts | — | ✅ |

**Adaptation data notable** : `movement-actions.json` (159) représente les actions
de mouvement en données simplifiées (`{dx,dy,facing,kind,speedMs}`) au lieu des
step-funcs décomp (cf. §3.2). Fonctionnel mais divergence de forme.

Aucun cas de `||N` masquant un 0 légitime repéré sur l'échantillon (les accesseurs
species utilisent des maps enum→number explicites).

---

## 5. HORS PÉRIMÈTRE (exemptions actées — non creusées)

- **Link / multi / RFU** : `link*.c`, `librfu_*.c`, `AgbRfu_LinkManager.c`,
  `cable_club.c`, `union_room*.c`, `link_rfu_*.c`, `multiboot.c`,
  `wireless_communication_status_screen.c` — communication inter-cartouches.
- **Record mixing** : `record_mixing.c`, `recorded_battle.c`, controllers
  `*_recorded_*`, `battle_records.c`.
- **Mystery Gift / Wonder** : `mystery_gift*.c`, `mystery_event*.c`, `wonder_news.c`.
- **e-Reader** : `ereader_screen.c` (+ `ereader_helpers.c` porté mais feature exempt).
- **Concours** : `contest*.c`, `pokeblock*.c`, `use_pokeblock.c` (Pokéblocks =
  conditions concours), `apprentice.c`.
- **Battle Frontier** : `battle_dome/factory_screen/pyramid*/tower/arena.c`,
  `frontier_*.c`, `battle_transition_frontier.c`, `trainer_hill.c`.
- **Mini-jeux multi** : `berry_blender/crush/powder.c`, `dodrio_berry_picking.c`,
  `pokemon_jump.c`, `minigame_countdown.c`.
- **Braille** : `braille.c` — **exemption architecturale** (moteur-texte émulé central).
- **Son bas-niveau / Save-flash / RTC hardware** : `m4a*.c` (moteur son 1:1 validé,
  non « manquant »), `agb_flash*.c`, `siirtc.c`, `save.c` (secteurs flash), moteurs
  1:1 séparés validés. `malloc.c` = GC TS (exemption structurelle). `main.c` handlers
  d'interruption = boucle hôte.
- **Debug décomp** : `Debug_*` divers, `mini_printf.c`, `libisagbprn.c`,
  `clear_save_data_screen.c`, `reset_rtc_screen.c`, `save_failed_screen.c`.
- **Intro copyright** : **présente** (`intro.c` 63/69 — non exempt, listé pour lever le doute).

---

### Annexe — fiabilité de l'audit
Chaque « absent » du top-10 et des cases 🔴 solo a été vérifié par `\bNom\b` sur
tout `src/` + `harness/` (pas seulement l'homonyme) ; les fichiers « aucun fichier
dédié » ont été confirmés par recherche de nom de fichier (kebab + snake). Les
comptes **†** remplacent le cartographe là où il sous-comptait le code renommé.
Nuance critique validée : **Plongée/Cascade ne bloquent PAS la progression** — seuls
les *raccourcis field-move du menu équipe* (`SetUpFieldMove_Dive/Waterfall`) manquent ;
les déclencheurs réels (`TrySetDiveWarp`, `TrySetupDiveDownScript`, `FldEff_UseDive`,
`FldEff_UseWaterfall`) **sont portés**.
