/**
 * harness/m4a/audio-log.ts — journal des événements audio (diagnostic live).
 *
 * Ring buffer de 64 événements horodatés, alimenté par le moteur natif
 * (starts, resume/suspend, horloge de secours), l'arbitre multi-instance
 * (mute/unmute + claims) et l'étage de sortie (arbiterGain). Consommé par le
 * panneau devtools « Audio » (dev-audio-tools) et `__m4aLog()` en console.
 *
 * But : quand le user dit « plus de son », la CAUSE est dans ce journal
 * (qui a muté, quand, pourquoi) au lieu d'hypothèses à l'aveugle.
 */

export interface AudioLogEntry {
  at: number; // performance.now()
  wall: string; // HH:MM:SS.mmm lisible
  event: string;
  detail?: string;
}

const _log: AudioLogEntry[] = [];
const MAX = 64;

export function logAudio(event: string, detail?: string): void {
  const d = new Date();
  const wall = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
  _log.push({ at: performance.now(), wall, event, detail });
  if (_log.length > MAX) _log.shift();
}

export function getAudioLog(): ReadonlyArray<AudioLogEntry> {
  return _log;
}

// Console : __m4aLog() → tableau lisible.
(globalThis as Record<string, unknown>).__m4aLog = () => {
  for (const e of _log) console.log(`${e.wall}  ${e.event}${e.detail ? ` — ${e.detail}` : ''}`);
  return `${_log.length} événements`;
};
