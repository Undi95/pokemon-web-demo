# Migration `src/engine/field/` → `src/game/` (miroir 1:1 décomp)

> But : éliminer la dette de **placement/nommage**. Tout fichier port d'un `.c` décomp
> doit finir sous **`src/game/engine/<sous-dossier>/`** avec le **nom décomp**
> (`game/engine/field/event_object_movement.ts`, pas `engine/field/object-events.ts`),
> fonctions/globals aux **noms décomp**, **zéro-dup**. C'est ce qui évite la « Nème
> réécriture » : on navigue par paire `decomps/.../src/X.c` ↔ `src/game/engine/.../X.ts`.
>
> **STRUCTURE CIBLE (verrouillée 2026-06-17)** : `src/game/` reflète l'arbo de `src/engine/`.
>   `src/engine/field/X.ts` → `src/game/engine/field/<décomp>.ts`
>   `src/engine/battle/X.ts` → `src/game/engine/battle/<décomp>.ts` … etc.
> Les ~71 fichiers `game/` actuellement PLATS (game/bike.ts…) sont à RE-déplacer sous
> `game/engine/<sous-dossier>/` pour cohérence. Méthode : **par sous-dossier, vérifié**
> (move + maj imports + tsc=0 + A/B + commit). À grande échelle = codemod (éviter le
> hand-edit de masse = source d'erreurs).

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
field_weather_effect (Clouds, en pause), metatile_behavior, wild_encounter, trainer_see,
coord_event_weather, event_data, secret_base, fldeff_misc.

## 🗺️ À migrer — par fichier (engine/field → game/)

| engine/field | → game/ (décomp) | importeurs | statut 1:1 | action |
|---|---|---|---|---|
| `rotating-gate.ts` (466) | `rotating_gate.ts` (rotating_gate.c) | 0 | à vérifier | **move pilote** (0 risque) |
| `tilemap-loader.ts` (371) | ? (pas un .c direct) | 0 | helper maison | différer/évaluer |
| `tileset-anims.ts` (1234) | `tileset_anims.ts` | ? | à vérifier | candidat |
| `field-door.ts` (962) | `field_door.ts` (field_door.c) | 1 | à vérifier | candidat |
| `script-movement.ts` (517) | `script_movement.ts` (script_movement.c) | 2 | à vérifier | candidat |
| `region-map.ts` (997) | `region_map.ts` (region_map.c) | 1 | à vérifier | candidat |
| `field-message-box.ts` (249) | `field_message_box.ts` | ? | à vérifier | candidat |
| `field-control-avatar.ts` (874) | `field_control_avatar.ts` | 3 | hybride | 🟥 chantier |
| `field-camera.ts` (924) | `field_camera.ts` (field_camera.c) | 16 | proche ? | 🟥 chantier |
| `player-avatar.ts` (2866) | `field_player_avatar.ts` | 18 | majoritairement 1:1 | 🟥 GROS chantier |
| `object-events.ts` (8490) | `event_object_movement.ts` | 14 | HYBRIDE (NPC_SPRITE_FRAMES, updateNpcSpriteFrame legacy) | 🟥 ÉNORME chantier |
| `map-loader.ts` (2004) | split `fieldmap.ts` + `overworld.ts` | 32 | mix fieldmap.c+overworld.c | 🟥 GROS chantier (split) |
| `movement-system.ts` (1032) | event_object_movement.c (part) | 4 | maison (éclaté) | 🔧 fusionner dans event_object_movement |
| `movement-action-dispatch.ts` (200) | event_object_movement.c (part) | ? | maison | 🔧 fusionner |
| `direction-coords.ts` (266) | event_object_movement.c (anim-num getters) | 4 | maison | 🔧 fusionner (dup) |
| `metatile-behavior-helpers.ts` (67) | éclaté (event_object_movement.c / field_player_avatar.c) | 1 | maison | 🔧 fusionner |
| `object-event-graphics*.ts` / `*-data.ts` / `*-oam.ts` | data décomp | — | data générée | laisser (data) |
| `field-effect*.ts` (arrow/active-list) | `field_effect.ts` | 4 | éparpillé | 🔧 regrouper |
| `warp-system.ts` (466) | field_screen_effect.c / overworld.c warps | 6 | maison | évaluer |
| `truck-cinematic.ts`, `map-name-popup.ts`, `swap-line.ts`, `map-layout-swap.ts`, `npc-loader.ts`, `virtual-objects.ts`, `character-anims.ts`, `field-globals.ts` | divers | — | maison | évaluer cas par cas |

## 🟥 Dups restants à solder (pendant la migration)
- `GetMoveDirection{,Fast,Faster}AnimNum` + `GetAcroWheelieDirectionAnimNum` + `GetFaceDirectionAnimNum`
  dupliqués `object-events.ts` ↔ `direction-coords.ts` → source unique = `event_object_movement.ts`
  (résolu en fusionnant direction-coords dedans). ✅ `IsRunningDisallowed*` déjà soldé (→ bike.ts, `6d16ad27`).

## 📋 Ordre d'exécution recommandé
1. **Pilotes 0-importeur** (`rotating-gate`, `tileset-anims`, `tilemap-loader`) : valider le process move+A/B+commit sans risque d'import.
2. **Petits 1:1** (`field-door`, `script-movement`, `region-map`, `field-message-box`).
3. **Moyens** (`field-control-avatar` 3, `field-camera` 16).
4. **Gros** (`player-avatar`→field_player_avatar 18 ; `object-events`→event_object_movement 14 ; `map-loader` split 32). Chacun = plusieurs sous-milestones (move+importeurs d'abord, raffinage 1:1 ensuite).
5. **Fusion helpers** (movement-system/movement-action-dispatch/direction-coords/metatile-behavior-helpers → event_object_movement) + dups.

> Statut : tenir cette table à jour à chaque migration (cocher / marquer `// #100%`).
