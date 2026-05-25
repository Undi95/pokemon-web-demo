/**
 * script-opcodes-rotating-tile-puzzle.ts — opcodes 1:1 décomp `rotating_tile_puzzle.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:2158-2185` :
 *   `ScrCmd_moverotatingtileobjects`  : sMovingNpcId = MoveRotatingTileObjects(puzzleNumber).
 *   `ScrCmd_turnrotatingtileobjects`  : TurnRotatingTileObjects().
 *   `ScrCmd_initrotatingtilepuzzle`   : InitRotatingTilePuzzle(isTrickHouse).
 *   `ScrCmd_freerotatingtilepuzzle`   : FreeRotatingTilePuzzle().
 *
 * Et `D:/Projet 1/decomps/pokeemeraude/src/rotating_tile_puzzle.c` — wiring
 * complet (= Mossdeep Gym + Trick House puzzles) à porter en session dédiée.
 */

import { registerOpcode } from './script-runtime';
import { VarGet } from './script-vars';

registerOpcode('initrotatingtilepuzzle', (_ctx, args) => {
  // 1:1 décomp ScrCmd_initrotatingtilepuzzle (scrcmd.c) :
  //   InitRotatingTilePuzzle(isTrickHouse).
  const isTrickHouse = VarGet(args[0] ?? '0');
  (globalThis as Record<string, unknown>).gRotatingTilePuzzleState = {
    active: true,
    isTrickHouse: isTrickHouse !== 0,
  };
  return false;
});

registerOpcode('moverotatingtileobjects', (_ctx, args) => {
  // 1:1 décomp ScrCmd_moverotatingtileobjects (scrcmd.c) :
  //   sMovingNpcId = MoveRotatingTileObjects(puzzleNumber).
  const _puzzleNumber = VarGet(args[0] ?? '0');
  void _puzzleNumber;
  return false;
});

registerOpcode('turnrotatingtileobjects', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_turnrotatingtileobjects (scrcmd.c) :
  //   TurnRotatingTileObjects().
  return false;
});

registerOpcode('freerotatingtilepuzzle', (_ctx, _args) => {
  // 1:1 décomp ScrCmd_freerotatingtilepuzzle (scrcmd.c) :
  //   FreeRotatingTilePuzzle().
  (globalThis as Record<string, unknown>).gRotatingTilePuzzleState = { active: false };
  return false;
});
