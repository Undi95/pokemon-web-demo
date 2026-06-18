# Migration `src/engine/field/` → `src/game/` (miroir 1:1 décomp)

> But : éliminer la dette de **placement/nommage**. Un fichier port d'un `.c` décomp finit
> dans **`src/game/` À PLAT** avec le **nom décomp** (`game/event_object_movement.ts`, pas
> `engine/field/object-events.ts`), fonctions/globals/imports aux **noms décomp**, **zéro-dup**.
> Évite la « Nème réécriture » : paire `decomps/.../src/X.c` ↔ `src/game/X.ts` côte-à-côte.
>
> **STRUCTURE CIBLE (verrouillée 2026-06-17, FLAT)** : `src/game/` **PLAT** = miroir de la décomp
> `src/` (elle-même PLATE : ~310 `.c` à la racine + `src/data/`). `src/X.c` ↔ `src/game/X.ts`
> (chemin identique à `src/game/` près, même nom). Les ~71 fichiers `game/` actuels sont DÉJÀ
> plats = corrects, rien à réorganiser. (Pas de `game/engine/<sous-dossier>/` : sur-organisation,
> la décomp n'a pas de sous-dossiers → flat = plus simple, moins d'erreurs.)
>
> **RÈGLE D'OR (intention user)** : un fichier ne bouge dans `game/` (plat, nom décomp) QUE
> **quand il est propre/1:1** (même si incomplet, ce qui est là est 100% propre). Le **moteur
> maison/harness** (scenes/, devtools/, decomp-runtime/globals, glu Phaser) **ne sera jamais 1:1
> → reste dans `engine/`**. Migration INCRÉMENTALE par fichier-propre, pas un big-bang.

## Règles
- **Déplacer vers `game/`** dès qu'un fichier est **1:1 ligne-à-ligne** (structure/noms décomp),
  **même si incomplet** (le `.c` a plus de fonctions non encore portées).
- **`// #100% done`** en 1re ligne UNIQUEMENT pour un fichier fini qu'on ne retouchera plus.
- **NE PAS** renommer en nom décomp un fichier **HYBRIDE** (structure maison) → ce serait un
  **FAUX miroir**. Un fichier `game/event_object_movement.ts` SANS `// #100%` = port en cours (honnête).
- Chaque migration = **1 commit** : `git mv` + maj importeurs + renommage fonctions + **tsc=0** + **A/B réel**.
- `git mv` (pas Write+delete) pour préserver l'historique (rename detection).

## ✅ Déjà miroir dans `game/`
bike, overworld, field_specials, field_effect_helpers, field_tasks, field_weather,
field_weather_effect (Clouds, fini `7b459430`), metatile_behavior, wild_encounter, trainer_see,
coord_event_weather, event_data, secret_base, fldeff_misc, heal_location,
fldeff_cut/rocksmash/sweetscent/flash/teleport/dig,
**field_player_avatar** (`17e81061`, port en cours — déviations M3 permanentes, PAS #100%),
**fieldmap** (`47e02c00`, ex-map-loader — fieldmap.c + glu chargement async maison, PAS #100%),
**field_camera** (`c5cdc8fe`, ex-field-camera — field_camera.c + glu M3, dette CameraMove/mirage à extraire, PAS #100%),
**event_object_movement** (`7206beeb`, ex-object-events — le + gros, 8490 l ; déviation M3 rendu Vigoroth/truck cutscène, PAS #100%),
**field_control_avatar** (`697896d8`, ex-field-control-avatar — master dispatcher input/warps/interactions ; wiring progressif + dette TrainerHill/secret base, PAS #100%),
**map_name_popup** (`238df9f3`, ex-map-name-popup — map_name_popup.c + glu chargement async des thèmes, PAS #100%).

## ⚠️ Blocage forbidden-files (PIN) — vaut pour object-events + map-loader
Les 2 fichiers INTERDITS de commit (`field_weather_effect.ts`, `dev-fieldfx-tools.ts`)
importent **player-avatar (fait), object-events ET map-loader** → migrer ces gros
fichiers oblige à changer leur ligne d'import. Technique retenue (décision user) :
**import-hunk** = stager UNIQUEMENT la ligne d'import retargetée via blob forgé
(`git show HEAD:f | sed 's#old#new#' | git hash-object -w` + `git update-index --cacheinfo`),
le WIP Clouds reste non-committé. Cf. [[gotcha-forbidden-file-pin-import-hunk]].

## 🗺️ À migrer — par fichier (engine/field → game/)

| engine/field | → game/ (décomp) | importeurs | statut 1:1 | action |
|---|---|---|---|---|
| ~~`rotating-gate.ts`~~ → `game/rotating_gate.ts` | — | 2 | port en cours (visuel = dette) | ✅ **MIGRÉ** (`139d0c3f`) |
| `tilemap-loader.ts` (371) | ? (pas un .c direct) | 0 | helper maison | différer/évaluer |
| ~~`tileset-anims.ts`~~ → `game/tileset_anims.ts` | — | 3 | port en cours | ✅ **MIGRÉ** (`a9b213f7`) |
| ~~`field-door.ts`~~ → `game/field_door.ts` | — | 2 | port en cours | ✅ **MIGRÉ** (`dc510518`) |
| ~~`script-movement.ts`~~ → `game/script_movement.ts` | — | 3 | port en cours | ✅ **MIGRÉ** (`afab535a`) |
| `region-map.ts` (997) | `region_map.ts` + `field_region_map.c` | 3 | 🟥 HYBRIDE (overlay Phaser, mappe 2 .c décomp) | ⛔ DÉFÉRÉ (faux miroir) |
| ~~`field-message-box.ts`~~ → `game/field_message_box.ts` | — | 9 | port en cours | ✅ **MIGRÉ** (`a9b213f7`) |
| ~~`field-control-avatar.ts`~~ → `game/field_control_avatar.ts` | — | 3 | port en cours (master dispatcher input/warps/interactions, fonctions décomp-nommées ; wiring progressif + dette TrainerHill/secret base/dive) | ✅ **MIGRÉ** (`697896d8` ; cadrage démo nettoyé `d251f63c`) |
| ~~`field-camera.ts`~~ → `game/field_camera.ts` | — | 20 | port en cours (field_camera.c + glu M3 ; dette : CameraMove fieldmap.c + mirage_tower helper hébergés) | ✅ **MIGRÉ** (`c5cdc8fe`) |
| ~~`player-avatar.ts`~~ → `game/field_player_avatar.ts` | — | 25 | port en cours (déviations M3) | ✅ **MIGRÉ** (`17e81061`, cleanup `549083e9`) |
| ~~`object-events.ts`~~ → `game/event_object_movement.ts` | — | 14 | port en cours (event_object_movement.c + déviation M3 rendu NPC : Vigoroth/truck cutscène) | ✅ **MIGRÉ** (`7206beeb` ; cadrage démo nettoyé `0bcbcfb3`) |
| ~~`map-loader.ts`~~ → `game/fieldmap.ts` | — | 45 | port en cours (fieldmap.c + glu chargement maison) | ✅ **MIGRÉ** (split 3/3 : `7523799e` DrawMetatile→field-camera, `05042707` GetMapConnection→overworld, `47e02c00` git mv) |

> 🔧 **Tool de migration** : `scripts/migrate-game.cjs <oldRelNoExt> <newRelNoExt>` (non-tracké) réécrit tous les imports après un `git mv`. Process moyen : assess 1:1 (header+fonctions décomp-nommées, .c existe, pas hybride/overlay) → `git mv` → `node scripts/migrate-game.cjs ...` → fix header (nom + retrait « démo ») → tsc=0 → A/B → `git add` explicite (jamais COVERAGE) → commit.
| ~~`movement-system.ts`~~ (1032→190) | applymovement/waitmovement glu → ScriptMovement (script_movement.c + scrcmd.c) | 4 | glu opcode mince (dispatcher maison `_queues` ÉLIMINÉ) | ✅ **FALLBACK SUPPRIMÉ** (`4e169ff6`) |
| ~~`movement-action-dispatch.ts`~~ | — | 0 | bridge DÉSACTIVÉ (no-op) = code mort | ✅ **SUPPRIMÉ** (`437dbfe9`) |
| `direction-coords.ts` (266) | event_object_movement.c + global.fieldmap.h (enum Direction) | 13 | **foundation autonome** (zéro import) | 🟢 GARDER (anti-cycle : fusionner créerait fieldmap↔eom ; dup anim-num soldé `b61a6e12`) |
| ~~`metatile-behavior-helpers.ts`~~ | — | 5 | barrel hybride (2 .c) | ✅ **FUSIONNÉ/SUPPRIMÉ** (`1dea2c5a` : IsMetatileDirectionallyImpassable→eom, ShouldJumpLedge→field_player_avatar, prédicats→game/metatile_behavior) |
| `object-event-graphics*.ts` / `*-data.ts` / `*-oam.ts` | data décomp | — | data générée | laisser (data) |
| `field-effect*.ts` (arrow/active-list) | `field_effect.ts` | 4 | éparpillé | 🔧 regrouper |
| `warp-system.ts` (466) | field_screen_effect.c / overworld.c warps | 6 | maison | évaluer |
| `truck-cinematic.ts` (→ `field_special_scene.ts`) | `field_special_scene.c` | — | **1:1 propre** (Task_HandleTruckSequence/Task_Truck1-3) | 🟢 migrer (prochain quick-win) |
| `field-effect.ts` (+`-arrow`/`-active-list`) | `field_effect.c` | 4 | 1:1 propre, éparpillé 3 fichiers | 🟢 consolider → `game/field_effect.ts` |
| `swap-line.ts`, `map-layout-swap.ts`, `npc-loader.ts`, `virtual-objects.ts`, `character-anims.ts`, `field-globals.ts`, `movement.ts`, `tilemap-loader.ts` | divers | — | maison (Phaser/helpers, pas de .c direct) | reste `engine/` (harness) |

> ⚠️ **Reframing movement-system (2026-06-18)** : la cible planifiée « fusionner les
> MovementAction Step funcs maison de `movement-system` DANS `event_object_movement.ts` »
> était FAUSSE. Les vraies Step funcs décomp vivent DÉJÀ dans eom (`gMovementActionFuncs[]`,
> via le chemin `applyMovement → ConvertMovementActionsToIds → ScriptMovement_StartObjectMovementScript
> → ObjectEventSetHeldMovement`). Le `_tickWalk`/`_tickJump`/… de movement-system était un
> **DOUBLON maison en fallback**, vérifié MORT en runtime (intro + batterie exotique → 0 hit).
> Copier ce doublon dans le mirror = injecter de la dette maison (anti-1:1). Le vrai 1:1 =
> **éliminer le fallback** → movement-system devient la glu opcode mince (route 100% décomp).
> Cf. [[feedback-1to1-structural-not-behavioral]] (« remonter à la racine non-1:1 »).
> RESTE optionnel : inliner la glu mince dans les handlers opcode (script-opcodes-movement) /
> `script_movement.ts` pour faire disparaître le fichier — faible valeur, à décider.

## 🟧 Chantier M3-NPC (raffinage rendu NPC, POST-migration)
**Découverte clé** : le rendu NPC standard est DÉJÀ ~95% unifié sur le chemin décomp —
les 245 records gObjectEventGraphicsInfo ont tous une anim table → `sprite.anims`
toujours wired → AnimateSprite drive `oam.tileNum`. Le rendu manuel (NPC_SPRITE_FRAMES)
était mort. Après M1, ne restent que 2 cas de **cutscène d'intro** (Vigoroth 32×32,
truck subsprites) = MOINS de déviation que field_camera (CameraMove) à la migration.
→ object-events **MIGRÉ** (`7206beeb`) avec ces 2 cas documentés comme déviations M3 ;
le raffinage (les porter sur AnimateSprite) continue EN `game/event_object_movement.ts` :
- ✅ **M1** (`549963e9`) — retrait du rendu manuel mort (legacy NPC_SPRITE_FRAMES →
  oam.tileId). A/B : 8/13 NPCs animés Rustboro + interact OK.
- ✅ **migration** (`7206beeb`) — git mv → game/, Vigoroth/truck = déviations M3 doc.
- ⬜ **M2** — Vigoroth 32×32 (`is32x32`) → AnimateSprite. ⚠️ quasi-intestable (Vigoroth
  = intro déménagement uniquement ; 32×32 sur chemin standard = garbage historique) +
  faible valeur gameplay → à faire si un véhicule de test apparaît.
- ⬜ **M3** — truck 48×48 (`useSubsprites`, intro) → chemin subsprite décomp.
- ⬜ **M4** — supprimer `updateNpcSpriteFrame` + `NPC_SPRITE_FRAMES`/`TILES_PER_FRAME_16x32`
  (setup initial à reporter sur StartSpriteAnim) + globalThis/register → rendu NPC 100% décomp.

## 🟥 Dups restants à solder (pendant la migration)
- ✅ **SOLDÉ** (`b61a6e12`) `GetFaceDirectionAnimNum` + `GetMoveDirection{,Fast,Faster,Fastest}AnimNum`
  étaient dupliqués `event_object_movement.ts` ↔ `direction-coords.ts` → **source unique = `direction-coords.ts`**
  (= foundation autonome anti-cycle ; eom importe d'ici, copies locales retirées). `GetAcroWheelieDirectionAnimNum`
  n'était que dans direction-coords (pas de dup). ✅ `IsRunningDisallowed*` déjà soldé (→ bike.ts, `6d16ad27`).

## 📋 Ordre d'exécution recommandé
1. **Pilotes 0-importeur** (`rotating-gate`, `tileset-anims`, `tilemap-loader`) : valider le process move+A/B+commit sans risque d'import.
2. **Petits 1:1** (`field-door`, `script-movement`, `region-map`, `field-message-box`).
3. **Moyens** (`field-control-avatar` 3, `field-camera` 16).
4. **Gros** (`player-avatar`→field_player_avatar 18 ; `object-events`→event_object_movement 14 ; `map-loader` split 32). Chacun = plusieurs sous-milestones (move+importeurs d'abord, raffinage 1:1 ensuite).
5. ✅ **Fusion helpers FAITE** : movement-action-dispatch SUPPRIMÉ (`437dbfe9`), metatile-behavior-helpers FUSIONNÉ/SUPPRIMÉ (`1dea2c5a`), dup anim-num SOLDÉ (`b61a6e12`), movement-system fallback `_queues` ÉLIMINÉ (`4e169ff6`). direction-coords = GARDÉ (foundation anti-cycle).

> Statut : tenir cette table à jour à chaque migration (cocher / marquer `// #100%`).
