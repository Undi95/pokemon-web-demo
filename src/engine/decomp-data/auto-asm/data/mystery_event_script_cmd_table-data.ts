// AUTO-GENERATED from data/mystery_event_script_cmd_table.s by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/mystery_event_script_cmd_table.s
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gMysteryEventScriptCmdTable', isGlobal: true, instrIndex: 0 },
  { name: 'gMysteryEventScriptCmdTableEnd', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .4byte=17
export const DATA_DIRECTIVES = [
  { kind: '.4byte', vals: ["MEScrCmd_nop"] },
  { kind: '.4byte', vals: ["MEScrCmd_checkcompat"] },
  { kind: '.4byte', vals: ["MEScrCmd_end"] },
  { kind: '.4byte', vals: ["MEScrCmd_setmsg"] },
  { kind: '.4byte', vals: ["MEScrCmd_setstatus"] },
  { kind: '.4byte', vals: ["MEScrCmd_runscript"] },
  { kind: '.4byte', vals: ["MEScrCmd_initramscript"] },
  { kind: '.4byte', vals: ["MEScrCmd_setenigmaberry"] },
  { kind: '.4byte', vals: ["MEScrCmd_giveribbon"] },
  { kind: '.4byte', vals: ["MEScrCmd_givenationaldex"] },
  { kind: '.4byte', vals: ["MEScrCmd_addrareword"] },
  { kind: '.4byte', vals: ["MEScrCmd_setrecordmixinggift"] },
  { kind: '.4byte', vals: ["MEScrCmd_givepokemon"] },
  { kind: '.4byte', vals: ["MEScrCmd_addtrainer"] },
  { kind: '.4byte', vals: ["MEScrCmd_enableresetrtc"] },
  { kind: '.4byte', vals: ["MEScrCmd_checksum"] },
  { kind: '.4byte', vals: ["MEScrCmd_crc"] },
] as const;
