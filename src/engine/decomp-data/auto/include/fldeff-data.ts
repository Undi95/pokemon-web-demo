// AUTO-GENERATED from include/fldeff.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/fldeff.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetUpFieldMove_Cut', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseCutOnGrass', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseCutOnTree', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_CutGrass', ret: "bool8", arity: 0, params: "void" },
  { name: 'FixLongGrassMetatilesWindowTop', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'FixLongGrassMetatilesWindowBottom', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'StartEscalator', ret: "void", arity: 1, params: "bool8 goingUp" },
  { name: 'StopEscalator', ret: "void", arity: 0, params: "void" },
  { name: 'IsEscalatorMoving', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetUpFieldMove_SoftBoiled', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_TryUseSoftboiledOnPartyMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ChooseMonForSoftboiled', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetUpFieldMove_Flash', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_DoChangeMap', ret: "void", arity: 0, params: "void" },
  { name: 'GetMapPairFadeToType', ret: "bool8", arity: 2, params: "u8 _fromType, u8 _toType" },
  { name: 'GetMapPairFadeFromType', ret: "bool8", arity: 2, params: "u8 _fromType, u8 _toType" },
  { name: 'SetUpFieldMove_Strength', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseStrength', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetUpFieldMove_SweetScent', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SweetScent', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetUpFieldMove_Teleport', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseTeleport', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetUpFieldMove_Dig', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseDig', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckObjectGraphicsInFrontOfPlayer', ret: "bool8", arity: 1, params: "u8 graphicsId" },
  { name: 'CreateFieldMoveTask', ret: "u8", arity: 0, params: "void" },
  { name: 'SetUpFieldMove_RockSmash', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseRockSmash', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_TryUseSoftboiledOnPartyMon',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_DoChangeMap',
] as const;
