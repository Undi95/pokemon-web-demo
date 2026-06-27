/**
 * scrcmd.ts — APRÈS LE CLEAN (2026-06-28). Le byte-VM (`scrcmd_bytevm.ts`) est le SEUL
 * moteur de handlers ; l'ancien moteur PARSÉ (361 `registerOpcode` + son interpréteur)
 * a été RETIRÉ. Cf docs/BYTE-VM-PLAN.md Phase 5.
 *
 * Ne subsiste ici que ce que le reste du code importe de `./scrcmd` :
 *   - l'infra des `special` (gSpecials) : `registerSpecial` / `invokeSpecial` (table
 *     string-keyed peuplée par `specials-registry.ts` + les modules de jeu) ;
 *   - le signal `waitstate` : `SignalWaitState` (appelé par les flows UI à leur fermeture)
 *     + `consumeWaitStateSignal` (lu par le handler `waitstate` du byte-VM).
 *
 * 1:1 décomp : `gSpecials[]` (data/specials.inc) = array de function pointers ; notre
 * version est string-keyed pour matcher la table de specials extraite.
 */

type SpecialHandler = () => number | void;

// `var` (hoisté, SANS initialiseur) + lazy-init : `battle_setup.ts` / `specials-registry.ts`
// appellent `registerSpecial` à LEUR init, possiblement AVANT que le corps de ce module
// n'ait tourné (cycle ESM) → un `const = {}` serait en TDZ. Le `??=` lazy-init le couvre.
// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
var _specialHandlers: Record<string, SpecialHandler> | undefined;

/** Enregistre un special handler (appelé par les modules de jeu via specials-registry). */
export function registerSpecial(name: string, handler: SpecialHandler): void {
  (_specialHandlers ??= {})[name] = handler;
}

/** Invoque un special par nom (1:1 `gSpecials[index]()`). Renvoie 0 si non enregistré. */
export function invokeSpecial(name: string): number {
  const handler = (_specialHandlers ??= {})[name];
  if (!handler) {
    console.log(`[special] '${name}' non enregistré (wire dans specials-registry.ts)`);
    return 0;
  }
  return handler() ?? 0;
}

let _waitStateSignaled = false;

/** Appelé par les flows UI (wallclock / starter / region map / PC) à leur fermeture pour
 *  débloquer un script suspendu sur `waitstate`. */
export function SignalWaitState(): void {
  _waitStateSignaled = true;
}

/** Consomme le signal waitstate (true une seule fois). Lu par `ScrCmd_waitstate` (byte-VM). */
export function consumeWaitStateSignal(): boolean {
  if (_waitStateSignaled) {
    _waitStateSignaled = false;
    return true;
  }
  return false;
}
