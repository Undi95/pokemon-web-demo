// AUTO-GENERATED helpers : ré-export les SPRITE_DATA_TABLES sous leur nom original
// avec `.values` direct (sans wrapper {type, cType, dims, values}). Permet aux
// modules auto-callbacks de faire `sGameFreakLetterData[i][1]` directement.
//
// Re-runnable : si on ajoute des tables dans sprite-system.ts SPRITE_DATA_TABLES,
// ce module est régénéré (TODO : auto-générer via transpileur).

import { SPRITE_DATA_TABLES } from './sprite-system';

type DataTable = { values: ReadonlyArray<unknown> };
const T = SPRITE_DATA_TABLES as Record<string, DataTable>;

export const sGameFreakLetterData = T['sGameFreakLetterData']?.values as ReadonlyArray<readonly [number, number]>;
export const sGameFreakLetterStartDelays = T['sGameFreakLetterStartDelays']?.values as ReadonlyArray<number>;
export const sGameFreakLettersMoveSpeed = T['sGameFreakLettersMoveSpeed']?.values as ReadonlyArray<number>;
export const sPresentsLetterData = T['sPresentsLetterData']?.values as ReadonlyArray<readonly [number, number]>;
export const sSparkleCoords = T['sSparkleCoords']?.values as ReadonlyArray<readonly [number, number]>;
export const sGroudonRockData = T['sGroudonRockData']?.values as ReadonlyArray<readonly [number, number]>;
export const sKyogreBubbleData = T['sKyogreBubbleData']?.values as ReadonlyArray<readonly [number, number]>;
export const sUnusedData = T['sUnusedData']?.values as ReadonlyArray<unknown>;
