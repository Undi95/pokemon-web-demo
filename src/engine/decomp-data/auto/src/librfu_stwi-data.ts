// AUTO-GENERATED from src/librfu_stwi.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/librfu_stwi.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'STWI_intr_timer', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_init', ret: "u16", arity: 1, params: "u8 request" },
  { name: 'STWI_start_Command', ret: "s32", arity: 0, params: "void" },
  { name: 'STWI_set_timer', ret: "void", arity: 1, params: "u8 unk" },
  { name: 'STWI_stop_timer', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_restart_Command', ret: "s32", arity: 0, params: "void" },
  { name: 'STWI_reset_ClockCounter', ret: "s32", arity: 0, params: "void" },
  { name: 'STWI_init_all', ret: "void", arity: 3, params: "struct RfuIntrStruct *interruptStruct, IntrFunc *interrupt, bool8 copyInterruptToRam" },
  { name: 'STWI_init_timer', ret: "void", arity: 2, params: "IntrFunc *interrupt, s32 timerSelect" },
  { name: 'AgbRFU_SoftReset', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_set_MS_mode', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'STWI_read_status', ret: "u16", arity: 1, params: "u8 index" },
  { name: 'STWI_init_Callback_M', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_init_Callback_S', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_set_Callback_M', ret: "void", arity: 1, params: "void *callbackM" },
  { name: 'STWI_poll_CommandEnd', ret: "u16", arity: 0, params: "void" },
  { name: 'STWI_send_ResetREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_LinkStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_VersionStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SystemStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SlotStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_ConfigStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_GameConfigREQ', ret: "void", arity: 2, params: "const u8 *serial_gname, const u8 *uname" },
  { name: 'STWI_send_SystemConfigREQ', ret: "void", arity: 3, params: "u16 availSlotFlag, u8 maxMFrame, u8 mcTimer" },
  { name: 'STWI_send_SC_StartREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SC_PollingREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SC_EndREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SP_StartREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SP_PollingREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SP_EndREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_CP_StartREQ', ret: "void", arity: 1, params: "u16 unk1" },
  { name: 'STWI_send_CP_PollingREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_CP_EndREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_DataTxREQ', ret: "void", arity: 2, params: "const void *in, u8 size" },
  { name: 'STWI_send_DataTxAndChangeREQ', ret: "void", arity: 2, params: "const void *in, u8 size" },
  { name: 'STWI_send_DataRxREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_MS_ChangeREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_DataReadyAndChangeREQ', ret: "void", arity: 1, params: "u8 unk" },
  { name: 'STWI_send_DisconnectedAndChangeREQ', ret: "void", arity: 2, params: "u8 unk0, u8 unk1" },
  { name: 'STWI_send_ResumeRetransmitAndChangeREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_DisconnectREQ', ret: "void", arity: 1, params: "u8 unk" },
  { name: 'STWI_send_TestModeREQ', ret: "void", arity: 2, params: "u8 unk0, u8 unk1" },
  { name: 'STWI_send_CPR_StartREQ', ret: "void", arity: 3, params: "u16 unk0, u16 unk1, u8 unk2" },
  { name: 'STWI_send_CPR_PollingREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_CPR_EndREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_StopModeREQ', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'librfu.h',
] as const;
