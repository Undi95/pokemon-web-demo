// src/gpu_regs.ts — foyer 1:1 décomp `src/gpu_regs.c` (accès registres GPU).
// Décyclé depuis decomp-bridge.ts (spine-decycle, Phase G). Le buffer de registres
// + la synchro VBlank vivent sur le substrat runtime (DecompRuntime) ; ces fonctions
// sont l'API 1:1-nommée publique qui délègue via getRuntime().
import { getRuntime } from '../harness/runtime/decomp-globals';

/** 1:1 décomp `src/gpu_regs.c:66 SetGpuReg(regOffset, value)` — écrit un registre GPU. */
export function SetGpuReg(reg: number, value: number): void {
  getRuntime().SetGpuReg(reg, value);
}

/** 1:1 décomp `src/gpu_regs.c:131 GetGpuReg(regOffset)` — lit un registre GPU. */
export function GetGpuReg(reg: number): number {
  return getRuntime().GetGpuReg(reg);
}
