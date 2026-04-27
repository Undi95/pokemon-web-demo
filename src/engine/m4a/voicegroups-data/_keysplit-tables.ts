// AUTO-GENERATED from sound/keysplit_tables.inc by extract-voicegroups-m4a.mjs
// Generated: 2026-04-27
// Format : pour une note MIDI N, trouver le 1er split dont `maxNote >= N`,
// puis utiliser `subVoiceIdx` comme index dans le sub-voicegroup.

export interface KeysplitEntry { idx: number; maxNote: number; }
export interface KeysplitTable { name: string; offset: number; splits: KeysplitEntry[]; }

export const KEYSPLIT_TABLES: Record<string, KeysplitTable> = {
  "keysplit_piano": {"name":"piano","offset":36,"splits":[{"idx":0,"maxNote":55},{"idx":1,"maxNote":70},{"idx":2,"maxNote":91},{"idx":3,"maxNote":108}]},
  "keysplit_strings": {"name":"strings","offset":36,"splits":[{"idx":0,"maxNote":69},{"idx":1,"maxNote":81},{"idx":2,"maxNote":108}]},
  "keysplit_trumpet": {"name":"trumpet","offset":36,"splits":[{"idx":0,"maxNote":66},{"idx":1,"maxNote":84},{"idx":2,"maxNote":108}]},
  "keysplit_tuba": {"name":"tuba","offset":24,"splits":[{"idx":0,"maxNote":42},{"idx":1,"maxNote":108}]},
  "keysplit_french_horn": {"name":"french_horn","offset":36,"splits":[{"idx":0,"maxNote":66},{"idx":1,"maxNote":108}]},
};

/** Résout une note MIDI → sub-voice index dans un keysplit table. */
export function resolveKeysplitNote(tableName: string, note: number): number | null {
  const t = KEYSPLIT_TABLES[tableName];
  if (!t) return null;
  for (const s of t.splits) if (note <= s.maxNote) return s.idx;
  return null;
}
