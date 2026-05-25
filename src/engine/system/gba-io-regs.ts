/**
 * Registres GBA I/O mutables utilisés par le code transpilé du décomp.
 *
 * Les exports `let` individuels ne sont pas mutables depuis l'importeur en ES modules.
 * On exporte donc un objet mutable `gbaIoRegs` que les modules importent et modifient
 * via `gbaIoRegs.REG_IE = ...`.
 */

export const gbaIoRegs = {
  REG_IE: 0,
  REG_IME: 0,
  REG_IF: 0,
  REG_DISPSTAT: 0,
  REG_VCOUNT: 0,
};
