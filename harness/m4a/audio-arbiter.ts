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

const MY_ID = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
let _lastClaimAt = 0;
let _muted = false;

function setMuted(muted: boolean, why: string): void {
  if (muted === _muted) return;
  _muted = muted;
  setArbiterMuted(muted);
  console.log(`[m4a-arbiter] ${muted ? 'muet' : 'sonore'} (${why})`);
}

function claimFocus(): void {
  _lastClaimAt = Date.now();
  setMuted(false, 'focus sur cette instance');
  import.meta.hot?.send('m4a:audio-focus', { id: MY_ID, at: _lastClaimAt });
}

/** À appeler une fois au boot du harness (main.ts). */
export function installAudioArbiter(): void {
  if (!import.meta.hot) return;
  import.meta.hot.on('m4a:audio-focus', (data: unknown) => {
    const { id, at } = data as { id?: string; at?: number };
    if (!id || id === MY_ID) return;
    if ((at ?? 0) >= _lastClaimAt) setMuted(true, 'autre instance du jeu active');
  });
  window.addEventListener('focus', claimFocus);
  window.addEventListener('pointerdown', claimFocus);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.hasFocus()) claimFocus();
  });
  if (document.visibilityState === 'visible' && document.hasFocus()) claimFocus();
}
