// AUTO-GENERATED from asm/macros/m4a.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/m4a.inc
// Generated: 2026-06-10

// ─── .equ / .set constants ──────────────────────────────────────────────────
export const _last_note = 0;
export const _last_split = 0;

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "song", args: ["label:req", "music_player:req", "unknown:req"], body: [{op:".4byte",args:["\\label"]}, {op:".2byte",args:["\\music_player"]}, {op:".2byte",args:["\\unknown"]}] },
  { name: "music_player", args: ["info_struct:req", "track_struct:req", "num_tracks:req", "unknown:req"], body: [{op:".4byte",args:["\\info_struct"]}, {op:".4byte",args:["\\track_struct"]}, {op:".byte",args:["\\num_tracks"]}, {op:".space",args:["1"]}, {op:".2byte",args:["\\unknown"]}] },
  { name: "voice_group", args: ["label:req", "starting_note"], body: [{op:".align",args:["2"]}, {op:".ifb",args:["\\starting_note"]}, {op:".global",args:["voicegroup_\\label"]}, {op:"voicegroup_\\label:",args:[]}, {op:".else",args:[]}, {op:".set",args:["voicegroup_\\label",". - \\starting_note * 0xC"]}, {op:".endif",args:[]}] },
  { name: "keysplit", args: ["label:req", "starting_note"], body: [{op:".ifb",args:["\\starting_note"]}, {op:".global",args:["keysplit_\\label"]}, {op:"keysplit_\\label:",args:[]}, {op:".else",args:[]}, {op:".set",args:["keysplit_\\label",". - \\starting_note"]}, {op:".endif",args:[]}] },
  { name: "split", args: ["index:req", "ending_note:req"], body: [{op:".if",args:["\\ending_note < _last_note"]}, {op:".if",args:["_last_split == 0"]}, {op:".error",args:["\"split's ending_note earlier than previous keysplit's starting_note\""]}, {op:".else",args:[]}, {op:".error",args:["\"split's ending_note earlier than previous split's ending_note\""]}, {op:".endif",args:[]}, {op:".else",args:[]}, {op:".rept",args:["\\ending_note - _last_note"]}, {op:".byte",args:["\\index"]}, {op:".endr",args:[]}, {op:".endif",args:[]}] },
] as const;
