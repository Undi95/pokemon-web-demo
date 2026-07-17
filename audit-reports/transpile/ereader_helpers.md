# transpile ereader_helpers.c → src\ereader_helpers.ts

stats: {"fns":26,"data":12,"defines":0,"flags":28,"unresolved":16,"gtext":0,"mergeSkipped":0}

## Symboles NON RÉSOLUS (imports à créer / kernel manquant)
- `AGB_ASSERT_EX` ()
- `TryWriteSpecialSaveSector` ()
- `TryReadSpecialSaveSector` ()
- `gShouldAdvanceLinkState` ()
- `VBlankIntrWait` ()
- `REG_IME` ()
- `REG_IE` ()
- `REG_SIOCNT` ()
- `REG_TM3CNT_H` ()
- `REG_IF` ()
- `REG_RCNT` ()
- `REG_SIODATA32` ()
- `REG_TM3CNT_L` ()
- `REG_SIOMLT_SEND` ()
- `REG_SIOMLT_RECV` ()
- `REG_KEYINPUT` ()

## Flags TRANSPILER-TODO
- :54 **designator** — `[0] = {
        .name = __("マキエ$$$$$   "),
       `
- :134 **designator** — `[1] = {
        .name = __("ハルヒト$$$$   "),
       `
- :214 **designator** — `[2] = {
        .name = __("メイコ$$$$$   "),
       `
- :294 **designator** — `[3] = {
        .name = __("ピエール$$$$   "),
       `
- :383 **expr-inconnue** — `offsetof_expression: offsetof(typeof(*hillTrainer), checksum)`
- :403 **adresse-element** — `&hillSet->trainers[i]`
- :408 **sizeof** — `sizeof(struct EReaderTrainerHillTrainer)`
- :422 **sizeof** — `sizeof(struct EReaderTrainerHillSet)`
- :422 **expr-inconnue** — `offsetof_expression: offsetof(struct EReaderTrainerHillSet, trainers)`
- :436 **memset** — `memset(challenge, 0, SECTOR_SIZE)`
- :461 **sizeof** — `sizeof(struct TrainerHillFloor)`
- :470 **alloc** — `AllocZeroed(SECTOR_SIZE)`
- :481 **sizeof** — `sizeof(struct EReaderTrainerHillSet)`
- :481 **memcpy** — `memcpy(dest, buffer, sizeof(struct EReaderTrainerHillSet))`
- :490 **alloc** — `AllocZeroed(SECTOR_SIZE)`
- :498 **alloc** — `AllocZeroed(SECTOR_SIZE)`
- :540 **sizeof** — `sizeof(sSendRecvMgr)`
- :581 **sizeof** — `sizeof(sSendRecvMgr)`
- :609 **sizeof** — `sizeof(sSendRecvMgr)`
- :708 **deref** — `*(vu32 *)REG_ADDR_SIOCNT`
- :757 **deref** — `*(u64 *)recv`
- :757 **assign-intranspilable** — `*(u64 *)recv = REG_SIOMLT_RECV`
- :824 **deref** — `*(vu64 *)recv`
- :824 **assign-intranspilable** — `*(vu64 *)recv = REG_SIOMLT_RECV`
- :874 **sizeof** — `sizeof(sSendRecvMgr)`
- :0 **import-ambigu** — `gSaveBlock1Ptr ← src/engine/save/save-block-state.ts | src/save.ts | harness/runtime/decomp-globals.ts (choisi src/engine/save/save-block-state.ts)`
- :0 **import-ambigu** — `CalcByteArraySum ← src/util.ts | include/util.ts (choisi src/util.ts)`
- :0 **import-ambigu** — `B_BUTTON ← src/battle_controllers.ts | src/engine/script/script-opcodes-helpers.ts | src/list_menu.ts | include/gba/io_reg.ts (choisi include/gba/io_reg.ts)`

## gText_* transformés en getString() — vérifier encodeOwText aux sites printer
(aucun)
