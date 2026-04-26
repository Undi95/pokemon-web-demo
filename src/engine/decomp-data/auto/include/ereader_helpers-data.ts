// AUTO-GENERATED from include/ereader_helpers.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/ereader_helpers.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const EREADER_XFER_EXE = 1;
export const EREADER_XFER_CHK = 2;
export const EREADER_XFER_SHIFT = 0;
/** Raw expr: `((EREADER_XFER_EXE | EREADER_XFER_CHK) << EREADER_XFER_SHIFT)` */
export const EREADER_XFER_MASK_EXPR = "((EREADER_XFER_EXE | EREADER_XFER_CHK) << EREADER_XFER_SHIFT)";
export const EREADER_CANCEL_TIMEOUT = 1;
export const EREADER_CANCEL_KEY = 2;
export const EREADER_CANCEL_SHIFT = 2;
/** Raw expr: `(EREADER_CANCEL_TIMEOUT << EREADER_CANCEL_SHIFT)` */
export const EREADER_CANCEL_TIMEOUT_MASK_EXPR = "(EREADER_CANCEL_TIMEOUT << EREADER_CANCEL_SHIFT)";
/** Raw expr: `(EREADER_CANCEL_KEY << EREADER_CANCEL_SHIFT)` */
export const EREADER_CANCEL_KEY_MASK_EXPR = "(EREADER_CANCEL_KEY << EREADER_CANCEL_SHIFT)";
/** Raw expr: `((EREADER_CANCEL_TIMEOUT | EREADER_CANCEL_KEY) << EREADER_CANCEL_SHIFT)` */
export const EREADER_CANCEL_MASK_EXPR = "((EREADER_CANCEL_TIMEOUT | EREADER_CANCEL_KEY) << EREADER_CANCEL_SHIFT)";
export const EREADER_CHECKSUM_OK = 1;
export const EREADER_CHECKSUM_ERR = 2;
export const EREADER_CHECKSUM_SHIFT = 4;
/** Raw expr: `(EREADER_CHECKSUM_OK << EREADER_CHECKSUM_SHIFT)` */
export const EREADER_CHECKSUM_OK_MASK_EXPR = "(EREADER_CHECKSUM_OK << EREADER_CHECKSUM_SHIFT)";
/** Raw expr: `((EREADER_CHECKSUM_OK | EREADER_CHECKSUM_ERR) << EREADER_CHECKSUM_SHIFT)` */
export const EREADER_CHECKSUM_MASK_EXPR = "((EREADER_CHECKSUM_OK | EREADER_CHECKSUM_ERR) << EREADER_CHECKSUM_SHIFT)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_EREADER_0 = {
  EREADER_XFR_STATE_INIT: 0,
  EREADER_XFR_STATE_HANDSHAKE: 1,
  EREADER_XFR_STATE_START: 2,
  EREADER_XFR_STATE_TRANSFER: 3,
  EREADER_XFR_STATE_TRANSFER_DONE: 4,
  EREADER_XFR_STATE_CHECKSUM: 5,
  EREADER_XFR_STATE_DONE: 6,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ValidateTrainerHillData', ret: "bool8", arity: 1, params: "struct EReaderTrainerHillSet *hillSet" },
  { name: 'TryWriteTrainerHill', ret: "bool32", arity: 1, params: "struct EReaderTrainerHillSet *hillSet" },
  { name: 'ReadTrainerHillAndValidate', ret: "bool32", arity: 0, params: "void" },
  { name: 'EReaderHandleTransfer', ret: "int", arity: 4, params: "u8 mode, size_t size, const void *data, void *recvBuffer" },
  { name: 'EReaderHelper_Timer3Callback', ret: "void", arity: 0, params: "void" },
  { name: 'EReaderHelper_SerialCallback', ret: "void", arity: 0, params: "void" },
  { name: 'EReaderHelper_SaveRegsState', ret: "void", arity: 0, params: "void" },
  { name: 'EReaderHelper_RestoreRegsState', ret: "void", arity: 0, params: "void" },
  { name: 'EReaderHelper_ClearSendRecvMgr', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'trainer_hill.h',
] as const;
