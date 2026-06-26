/**
 * include/task.ts — miroir 1:1 `include/task.h` (constantes du système de tâches).
 * Module FEUILLE (zéro import) → source sûre des constantes, hors de tout cycle ESM
 * (contrairement au god-module decomp-globals où elles TDZ-aient quand un importeur
 * cyclique les lit à l'init).
 */
export const HEAD_SENTINEL = 0xFE;   // 1:1 task.h:4
export const TAIL_SENTINEL = 0xFF;   // 1:1 task.h:5
export const TASK_NONE = TAIL_SENTINEL; // 1:1 task.h:6 (#define TASK_NONE TAIL_SENTINEL)
export const NUM_TASKS = 16;         // 1:1 task.h:8
