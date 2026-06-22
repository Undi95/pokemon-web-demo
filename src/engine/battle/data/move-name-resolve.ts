/**
 * battle/data/move-name-resolve.ts — résolution nom-de-move runtime → enum/id
 * décomp, 100% via données auto-extraites (= include/constants/moves.h).
 *
 * Module FEUILLE (leaf) : n'importe QUE `moves-data` (auto-extrait) +
 * `decomp-constants`. Aucune dépendance Showdown (@pkmn/dex). Source de
 * vérité UNIQUE partagée par party-storage / wire-bytecode-bridge /
 * pokemon.ts (= évite la duplication + le cycle pokemon↔party-storage).
 *
 * Problème résolu : les ids runtime sont sans séparateur ("defensecurl")
 * alors que les enums décomp sont underscore-segmentés ("MOVE_DEFENSE_CURL").
 * La conversion naïve `'MOVE_'+id.toUpperCase()` échoue sur les noms composés.
 */

import { resolveDecompConstant } from '../../../../harness/runtime/decomp-constants';
import * as MOVES_DATA from '../../decomp-data/include/constants/moves-data';

/** Map normalisée : nom sans séparateur minuscule ("defensecurl") → enum
 *  décomp ("MOVE_DEFENSE_CURL"). Construite lazy depuis les constantes
 *  auto-extraites moves-data. */
let _moveNameNormToEnum: Record<string, string> | null = null;
function _ensureMoveNameMap(): Record<string, string> {
  if (_moveNameNormToEnum) return _moveNameNormToEnum;
  const m: Record<string, string> = {};
  for (const key of Object.keys(MOVES_DATA)) {
    if (!key.startsWith('MOVE_')) continue;
    const norm = key.slice(5).replace(/_/g, '').toLowerCase();
    if (norm && !(norm in m)) m[norm] = key;
  }
  _moveNameNormToEnum = m;
  return m;
}

/** dexId runtime ("tackle", "defensecurl") → nom d'enum décomp
 *  ("MOVE_TACKLE", "MOVE_DEFENSE_CURL"). 1:1, zéro @pkmn/dex. */
export function moveDexIdToEnum(dexId: string): string {
  const direct = 'MOVE_' + dexId.toUpperCase().replace(/-/g, '_');
  const dId = resolveDecompConstant(direct);
  if (typeof dId === 'number' && dId !== 0) return direct;
  const norm = dexId.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return _ensureMoveNameMap()[norm] ?? direct;
}

/** dexId runtime → u16 id décomp (MOVE_*). 0 si introuvable. */
export function resolveMoveDexId(dexId: string): number {
  const id = resolveDecompConstant(moveDexIdToEnum(dexId));
  return typeof id === 'number' ? id : 0;
}
