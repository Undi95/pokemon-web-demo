// AUTO-GENERATED from src/ereader_helpers.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/ereader_helpers.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetKeyInput', ret: "void", arity: 0, params: "void" },
  { name: 'DetermineSendRecvState', ret: "u16", arity: 1, params: "u8" },
  { name: 'EnableSio', ret: "void", arity: 0, params: "void" },
  { name: 'DisableTm3', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpTransferManager', ret: "void", arity: 3, params: "size_t, const void *, void *" },
  { name: 'StartTm3', ret: "void", arity: 0, params: "void" },
  { name: 'GetTrainerHillUnkVal', ret: "u8", arity: 0, params: "void" },
  { name: 'ValidateTrainerChecksum', ret: "bool32", arity: 1, params: "struct EReaderTrainerHillTrainer *hillTrainer" },
  { name: 'ValidateTrainerHillData', ret: "bool8", arity: 1, params: "struct EReaderTrainerHillSet *hillSet" },
  { name: 'ValidateTrainerHillChecksum', ret: "bool32", arity: 1, params: "struct EReaderTrainerHillSet *hillSet" },
  { name: 'TryWriteTrainerHill_Internal', ret: "bool32", arity: 2, params: "struct EReaderTrainerHillSet *hillSet, struct TrainerHillChallenge *challenge" },
  { name: 'TryWriteTrainerHill', ret: "bool32", arity: 1, params: "struct EReaderTrainerHillSet *hillSet" },
  { name: 'TryReadTrainerHill_Internal', ret: "bool32", arity: 2, params: "struct EReaderTrainerHillSet *dest, u8 *buffer" },
  { name: 'TryReadTrainerHill', ret: "bool32", arity: 1, params: "struct EReaderTrainerHillSet *hillSet" },
  { name: 'ReadTrainerHillAndValidate', ret: "bool32", arity: 0, params: "void" },
  { name: 'EReader_Send', ret: "int", arity: 2, params: "int size, const void *src" },
  { name: 'EReader_Recv', ret: "int", arity: 1, params: "void *dest" },
  { name: 'CloseSerial', ret: "void", arity: 0, params: "void" },
  { name: 'OpenSerialMulti', ret: "void", arity: 0, params: "void" },
  { name: 'OpenSerial32', ret: "void", arity: 0, params: "void" },
  { name: 'EReaderHandleTransfer', ret: "int", arity: 4, params: "u8 mode, size_t size, const void *data, void *recvBuffer" },
  { name: 'EReaderHelper_Timer3Callback', ret: "void", arity: 0, params: "void" },
  { name: 'EReaderHelper_SerialCallback', ret: "void", arity: 0, params: "void" },
  { name: 'EReaderHelper_SaveRegsState', ret: "void", arity: 0, params: "void" },
  { name: 'EReaderHelper_RestoreRegsState', ret: "void", arity: 0, params: "void" },
  { name: 'EReaderHelper_ClearSendRecvMgr', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'decompress.h',
  'ereader_helpers.h',
  'link.h',
  'main.h',
  'union_room.h',
  'save.h',
  'sprite.h',
  'task.h',
  'util.h',
  'trainer_hill.h',
  'constants/trainers.h',
  'constants/moves.h',
  'constants/items.h',
  'constants/trainer_hill.h',
] as const;
