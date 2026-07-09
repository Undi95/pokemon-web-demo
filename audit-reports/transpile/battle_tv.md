# transpile battle_tv.c → src\battle_tv.ts

stats: {"fns":12,"data":30,"defines":1,"flags":37,"unresolved":8,"gtext":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `GetBattlerSide` ()
- `gBattleMsgDataPtr` ()
- `SHRT_MAX` ()
- `GetLinkTrainerFlankId` ()
- `GetOpposingLinkMultiBattlerId` ()
- `move` ()
- `type` ()
- `power` ()

## Flags TRANSPILER-TODO
- :1459 **adresse-element** — `&dmgByMove[i]`
- :1586 **adresse-element** — `&party[gBattlerPartyIndexes[battler]]`
- :0 **import-ambigu** — `MOVE_COUNTER ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_BIDE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_MIRROR_COAT ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_FOCUS_PUNCH ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_SNORE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_DIVE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `MOVE_SOLAR_BEAM ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `STRINGID_ITDOESNTAFFECT ← src/engine/battle/constants.ts | include/constants/battle_string_ids.ts (choisi include/constants/battle_string_ids.ts)`
- :0 **import-ambigu** — `STRINGID_NOTVERYEFFECTIVE ← src/engine/battle/constants.ts | include/constants/battle_string_ids.ts (choisi include/constants/battle_string_ids.ts)`
- :0 **import-ambigu** — `B_SIDE_PLAYER ← src/engine/battle/constants.ts | include/constants/battle.ts (choisi include/constants/battle.ts)`
- :0 **import-ambigu** — `gPlayerParty ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `gEnemyParty ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/pokemon.ts)`
- :0 **import-ambigu** — `MAX_MON_MOVES ← src/engine/battle/constants.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `GetBattlerPosition ← src/battle_anim_mons.ts | src/engine/battle/util.ts (choisi src/battle_anim_mons.ts)`
- :0 **import-ambigu** — `MON_DATA_HP ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `GetMonData ← src/engine/battle/party-storage.ts | src/pokemon.ts (choisi src/engine/battle/party-storage.ts)`
- :0 **import-ambigu** — `STRINGID_SUPEREFFECTIVE ← src/engine/battle/constants.ts | include/constants/battle_string_ids.ts (choisi include/constants/battle_string_ids.ts)`
- :0 **import-ambigu** — `STRINGID_CRITICALHIT ← src/engine/battle/constants.ts | include/constants/battle_string_ids.ts (choisi include/constants/battle_string_ids.ts)`
- :0 **import-ambigu** — `MOVE_SLEEP_TALK ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `BIT_SIDE ← src/engine/battle/constants.ts | include/constants/battle.ts (choisi include/constants/battle.ts)`
- :0 **import-ambigu** — `MOVE_NONE ← src/engine/battle/constants.ts | include/constants/moves.ts (choisi include/constants/moves.ts)`
- :0 **import-ambigu** — `PARTY_SIZE ← src/engine/battle/party-storage.ts | src/engine/save/save-blocks.ts | include/constants/global.ts (choisi include/constants/global.ts)`
- :0 **import-ambigu** — `MON_DATA_SPECIES ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `SPECIES_NONE ← src/mail_data.ts | include/constants/species.ts (choisi include/constants/species.ts)`
- :0 **import-ambigu** — `MON_DATA_IS_EGG ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_EXP ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MON_DATA_MOVE1 ← src/engine/battle/party-storage.ts | include/pokemon.ts (choisi include/pokemon.ts)`
- :0 **import-ambigu** — `MULTI_PARTY_SIZE ← src/engine/battle/constants.ts | src/engine/save/save-blocks.ts (choisi src/engine/battle/constants.ts)`
- :0 **import-ambigu** — `gBattleScripting ← src/battle_controllers.ts | src/engine/battle/state.ts (choisi src/battle_controllers.ts)`
- :0 **import-ambigu** — `TYPE_FIRE ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `TYPE_ELECTRIC ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `B_SIDE_OPPONENT ← src/engine/battle/constants.ts | include/constants/battle.ts (choisi include/constants/battle.ts)`
- :0 **import-ambigu** — `STAT_ACC ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `DEFAULT_STAT_STAGE ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`
- :0 **import-ambigu** — `STAT_EVASION ← src/engine/battle/constants.ts | include/constants/pokemon.ts (choisi include/constants/pokemon.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
