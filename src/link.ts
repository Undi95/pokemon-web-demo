/**
 * link.ts — Port 1:1 (partiel) de `decomp/src/link.c`.
 *
 * Rapatrié depuis `gba-menu-system.ts` (fourre-tout dissous, MIRROR 1:1).
 * Le link multi-joueur réel (câble/wireless) n'est pas porté (engine web solo) ;
 * les checks renvoient les valeurs « non connecté » 1:1.
 */

/** 1:1 décomp `link.c IsWirelessAdapterConnected`. Engine web : pas de wireless
 *  adapter (= toujours false). Utilisé par main_menu.c pour les checks
 *  Mystery Gift / Mystery Events. */
export function IsWirelessAdapterConnected(): boolean {
  return false;
}
