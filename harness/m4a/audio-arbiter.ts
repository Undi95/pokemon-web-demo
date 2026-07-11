/**
 * Arbitre audio multi-instance (harness, dev only).
 *
 * Bug « 2 BGM » (user 2026-07-10) : DEUX instances du jeu ouvertes en même
 * temps (le pane Browser de l'app Claude + l'onglet Chrome du user) jouaient
 * chacune leur musique — l'onglet en arrière-plan continue de sonner PAR CHOIX
 * (main.ts : pause visibilitychange retirée sur demande).
 *
 * Politique : la DERNIÈRE instance qui a (re)pris le focus garde le son ; les
 * autres coupent leur étage de sortie (setArbiterMuted, audio-context.ts).
 * Une instance seule n'est jamais mutée, et une instance en arrière-plan
 * continue de sonner TANT QU'AUCUNE autre ne réclame le focus.
 *
 * Transport : import.meta.hot (WebSocket HMR Vite) relayé serveur à TOUS les
 * clients (vite.config.ts « m4a:audio-focus ») — BroadcastChannel ne traverse
 * pas deux navigateurs différents. No-op en build prod (import.meta.hot absent).
 */

import { setArbiterMuted } from './audio-context';
import { logAudio } from './audio-log';

const MY_ID = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
let _lastClaimAt = 0;
let _muted = false;

// ?mute=1 : instance muette au boot, et SEULE une interaction humaine réelle
// (pointerdown/keydown) la rend sonore — pas les focus programmatiques. Posé
// par Claude sur le pane Browser de l'app : sa policy autoplay permissive le
// faisait sonner chez le user à chaque reload de vérification.
const START_MUTED = new URLSearchParams(window.location.search).has('mute');

function setMuted(muted: boolean, why: string): void {
  if (muted === _muted) return;
  _muted = muted;
  setArbiterMuted(muted);
  logAudio(muted ? 'arbitre → MUET' : 'arbitre → sonore', why);
  console.log(`[m4a-arbiter] ${muted ? 'muet' : 'sonore'} (${why})`);
}

/** État lisible par le devtool audio. */
export function isArbiterMuted(): boolean {
  return _muted;
}

/** Sauvetage (devtool « unmute ») : reprend le son quoi qu'il arrive. */
export function forceClaimFocus(): void {
  logAudio('unmute forcé (devtool)');
  claimFocus();
}

/** Coupe cette instance (devtool — symétrique de forceClaimFocus). */
export function forceMute(): void {
  setMuted(true, 'mute forcé (devtool)');
}

function claimFocus(ev?: Event): void {
  // 🩸 Les événements SYNTHÉTIQUES (dispatchEvent des sondes/tests du pane)
  // ne doivent JAMAIS claim : un keydown simulé dans le pane ?mute=1 volait
  // le son de l'onglet du user en plein test.
  if (ev && !ev.isTrusted) return;
  _lastClaimAt = Date.now();
  setMuted(false, 'focus sur cette instance');
  import.meta.hot?.send('m4a:audio-focus', { id: MY_ID, at: _lastClaimAt });
}

/** À appeler une fois au boot du harness (main.ts). */
export function installAudioArbiter(): void {
  if (START_MUTED) setMuted(true, 'boot ?mute=1');
  if (!import.meta.hot) return;
  import.meta.hot.on('m4a:audio-focus', (data: unknown) => {
    const { id, at } = data as { id?: string; at?: number };
    if (!id || id === MY_ID) return;
    logAudio('claim reçu', `instance ${id}${(at ?? 0) >= _lastClaimAt ? ' (plus récent → je me tais)' : ' (plus vieux, ignoré)'}`);
    if ((at ?? 0) >= _lastClaimAt) setMuted(true, 'autre instance du jeu active');
  });
  // capture:true : le canvas Phaser peut stopPropagation — on veut voir CHAQUE
  // geste réel avant lui.
  window.addEventListener('pointerdown', claimFocus, { capture: true });
  window.addEventListener('keydown', claimFocus, { capture: true });
  if (!START_MUTED) {
    window.addEventListener('focus', claimFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && document.hasFocus()) claimFocus();
    });
    if (document.visibilityState === 'visible' && document.hasFocus()) claimFocus();
  }
}
