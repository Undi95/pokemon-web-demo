/**
 * pc-box.ts — 1:1 port du static `sPCBoxToSendMon` + Set/Get du field_specials.c.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_specials.c:118`
 *     (= EWRAM_DATA u8 sPCBoxToSendMon = 0)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_specials.c:3405-3413`
 *     (= SetPCBoxToSendMon + GetPCBoxToSendMon)
 *
 * Pourquoi un fichier dédié : SetPCBoxToSendMon est appelé depuis pokemon.c
 * (= GiveMonToPlayer flow) ET field_specials.c (= special GetPCBoxToSendMon
 * lui-même + IsDestinationBoxFull). Mettre la var statique dans 1 seul module
 * shared empêche 2 instances divergentes.
 */

/** 1:1 décomp `static EWRAM_DATA u8 sPCBoxToSendMon = 0` (field_specials.c:118). */
let sPCBoxToSendMon = 0;

/** 1:1 décomp `void SetPCBoxToSendMon(u8 boxId)` (field_specials.c:3405-3408).
 *  Setter du dernier box utilisé pour envoyer un mon (= via storage system). */
export function SetPCBoxToSendMon(boxId: number): void {
  sPCBoxToSendMon = boxId & 0xFF;
}

/** 1:1 décomp `u16 GetPCBoxToSendMon(void)` (field_specials.c:3410-3413).
 *  Getter. Retourne en u16 car le décomp retourne u16 même si la var est u8
 *  (= compatible avec le set dans gSpecialVar_Result via specialvar opcode). */
export function GetPCBoxToSendMon(): number {
  return sPCBoxToSendMon;
}
