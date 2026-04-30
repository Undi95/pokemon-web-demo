/**
 * Tracer temporel pour diagnostiquer les bugs de warp / soft-switch map.
 *
 * Usage : `traceMark('label')` à chaque point critique. Le 1er appel après
 * `traceReset()` est t=0, les suivants affichent +Xms relatif.
 *
 * Pour activer : ouvrir console + `localStorage.warpTrace = '1'`. Sinon silent.
 *
 * Désactiver : `delete localStorage.warpTrace` puis recharger.
 */

let traceStart = 0;
let traceLast = 0;
let traceEnabled = false;

function refreshEnabled() {
  try { traceEnabled = !!localStorage.getItem('warpTrace'); } catch { traceEnabled = false; }
}
refreshEnabled();

export function traceReset(label: string): void {
  refreshEnabled();
  if (!traceEnabled) return;
  traceStart = performance.now();
  traceLast = traceStart;
  console.log(`%c[warp-trace] ════ ${label} ════ (t=0)`, 'color: #0af; font-weight: bold');
}

export function traceMark(label: string, extra?: object): void {
  if (!traceEnabled) return;
  const now = performance.now();
  const since = (now - traceStart).toFixed(1);
  const delta = (now - traceLast).toFixed(1);
  traceLast = now;
  const ext = extra ? ' ' + JSON.stringify(extra) : '';
  console.log(`%c[warp-trace] +${since.padStart(7)}ms (Δ ${delta.padStart(6)}ms)  ${label}${ext}`,
    'color: #0af');
}
