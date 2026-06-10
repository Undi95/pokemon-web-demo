// AUTO-GENERATED from asm/macros/map.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/map.inc
// Generated: 2026-04-26

// ─── .equ / .set constants ──────────────────────────────────────────────────
export const _num_npcs = 0;
export const _num_warps = 0;
export const _num_traps = 0;
export const _num_signs = 0;

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "map", args: ["map_id:req"], body: [{op:".ifdef",args:["\\map_id"]}, {op:".byte",args:["\\map_id >> 8"]}, {op:".byte",args:["\\map_id & 0xFF"]}, {op:".else",args:[]}, {op:".error",args:["\"undefined map (check for typos)\""]}, {op:".endif",args:[]}] },
  { name: "map_script", args: ["type:req", "script:req"], body: [{op:".byte",args:["\\type"]}, {op:".4byte",args:["\\script"]}] },
  { name: "map_script_2", args: ["var:req", "compare:req", "script:req"], body: [{op:".2byte",args:["\\var"]}, {op:".2byte",args:["\\compare"]}, {op:".4byte",args:["\\script"]}] },
  { name: "object_event", args: ["index:req", "gfx:req", "x:req", "y:req", "elevation:req", "movement_type:req", "x_radius:req", "y_radius:req", "trainer_type:req", "sight_radius_tree_etc:req", "script:req", "event_flag:req"], body: [{op:".byte",args:["\\index"]}, {op:".byte",args:["\\gfx"]}, {op:".byte",args:["OBJ_KIND_NORMAL"]}, {op:".space",args:["1"]}, {op:".2byte",args:["\\x","\\y"]}, {op:".byte",args:["\\elevation"]}, {op:".byte",args:["\\movement_type"]}, {op:".byte",args:["((\\y_radius << 4) | \\x_radius)"]}, {op:".space",args:["1"]}, {op:".2byte",args:["\\trainer_type"]}, {op:".2byte",args:["\\sight_radius_tree_etc"]}, {op:".4byte",args:["\\script"]}, {op:".2byte",args:["\\event_flag"]}, {op:".space",args:["2"]}, {op:"inc",args:["_num_npcs"]}] },
  { name: "clone_event", args: ["index:req", "gfx:req", "x:req", "y:req", "target_local_id:req", "target_map_id:req"], body: [{op:".byte",args:["\\index"]}, {op:".byte",args:["\\gfx"]}, {op:".byte",args:["OBJ_KIND_CLONE"]}, {op:".space",args:["1"]}, {op:".2byte",args:["\\x","\\y"]}, {op:".byte",args:["\\target_local_id"]}, {op:".space",args:["3"]}, {op:".2byte",args:["\\target_map_id & 0xFF"]}, {op:".2byte",args:["\\target_map_id >> 8"]}, {op:".space",args:["8"]}, {op:"inc",args:["_num_npcs"]}] },
  { name: "warp_def", args: ["x:req", "y:req", "elevation:req", "warpId:req", "map_id:req"], body: [{op:".2byte",args:["\\x","\\y"]}, {op:".byte",args:["\\elevation"]}, {op:".byte",args:["\\warpId"]}, {op:".byte",args:["\\map_id & 0xFF"]}, {op:".byte",args:["\\map_id >> 8"]}, {op:"inc",args:["_num_warps"]}] },
  { name: "coord_event", args: ["x:req", "y:req", "elevation:req", "var:req", "varValue:req", "script:req"], body: [{op:".2byte",args:["\\x","\\y"]}, {op:".byte",args:["\\elevation"]}, {op:".space",args:["1"]}, {op:".2byte",args:["\\var"]}, {op:".2byte",args:["\\varValue"]}, {op:".space",args:["2"]}, {op:".4byte",args:["\\script"]}, {op:"inc",args:["_num_traps"]}] },
  { name: "coord_weather_event", args: ["x:req", "y:req", "elevation:req", "weather:req"], body: [{op:"coord_event",args:["\\x","\\y","\\elevation","\\weather","0","NULL"]}] },
  { name: "bg_event", args: ["x:req", "y:req", "elevation:req", "kind:req", "arg6:req", "arg7"], body: [{op:".2byte",args:["\\x","\\y"]}, {op:".byte",args:["\\elevation"]}, {op:".byte",args:["\\kind"]}, {op:".space",args:["2"]}, {op:".if",args:["\\kind != BG_EVENT_HIDDEN_ITEM"]}, {op:".4byte",args:["\\arg6"]}, {op:".else",args:[]}, {op:".2byte",args:["\\arg6"]}, {op:".2byte",args:["\\arg7"]}, {op:".endif",args:[]}, {op:"inc",args:["_num_signs"]}] },
  { name: "bg_sign_event", args: ["x:req", "y:req", "elevation:req", "facing_dir:req", "script:req"], body: [{op:"bg_event",args:["\\x","\\y","\\elevation","\\facing_dir","\\script"]}] },
  { name: "bg_hidden_item_event", args: ["x:req", "y:req", "elevation:req", "item:req", "flag:req"], body: [{op:".if",args:["\\flag < FLAG_HIDDEN_ITEMS_START"]}, {op:".error",args:["\"Hidden Item flag \\flag is too small. Must be >= FLAG_HIDDEN_ITEMS_START.\""]}, {op:".endif",args:[]}, {op:"bg_event",args:["\\x","\\y","\\elevation","BG_EVENT_HIDDEN_ITEM","\\item","((\\flag) - FLAG_HIDDEN_ITEMS_START)"]}] },
  { name: "bg_secret_base_event", args: ["x:req", "y:req", "elevation:req", "secret_base_id:req"], body: [{op:"bg_event",args:["\\x","\\y","\\elevation","BG_EVENT_SECRET_BASE","\\secret_base_id"]}] },
  { name: "map_events", args: ["npcs:req", "warps:req", "traps:req", "signs:req"], body: [{op:".byte",args:["_num_npcs","_num_warps","_num_traps","_num_signs"]}, {op:".4byte",args:["\\npcs","\\warps","\\traps","\\signs"]}, {op:"reset_map_events",args:[]}] },
  { name: "reset_map_events", args: [], body: [] },
  { name: "connection", args: ["direction:req", "offset:req", "map:req"], body: [{op:".byte",args:["connection_\\direction"]}, {op:".space",args:["3"]}, {op:".4byte",args:["\\offset"]}, {op:"map",args:["\\map"]}, {op:".space",args:["2"]}] },
  { name: "map_header_flags", args: ["allow_cycling:req", "allow_escaping:req", "allow_running:req", "show_map_name:req"], body: [{op:".byte",args:["((\\show_map_name & 1) << 3) | ((\\allow_running & 1) << 2) | ((\\allow_escaping & 1) << 1) | \\allow_cycling"]}] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 1 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"reset_map_events",args:[]},
] as const;
