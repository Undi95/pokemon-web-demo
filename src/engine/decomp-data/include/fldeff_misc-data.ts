// AUTO-GENERATED from include/fldeff_misc.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/fldeff_misc.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ComputerScreenOpenEffect', ret: "void", arity: 3, params: "u16 increment, u16 unused, u8 priority" },
  { name: 'ComputerScreenCloseEffect', ret: "void", arity: 3, params: "u16 increment, u16 unused, u8 priority" },
  { name: 'IsComputerScreenOpenEffectActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsComputerScreenCloseEffectActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetUpFieldMove_SecretPower', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseSecretPowerCave', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SecretPowerCave', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseSecretPowerTree', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SecretPowerTree', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseSecretPowerShrub', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SecretPowerShrub', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SecretBasePCTurnOn', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoSecretBasePCTurnOffEffect', ret: "void", arity: 0, params: "void" },
  { name: 'PopSecretBaseBalloon', ret: "void", arity: 3, params: "s16 metatileId, s16 x, s16 y" },
  { name: 'FldEff_Nop47', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_Nop48', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShatterSecretBaseBreakableDoor', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'PlaySecretBaseMusicNoteMatSound', ret: "void", arity: 1, params: "s16 metatileId" },
  { name: 'DoSecretBaseGlitterMatSparkle', ret: "void", arity: 0, params: "void" },
  { name: 'FldEff_SandPillar', ret: "bool8", arity: 0, params: "void" },
  { name: 'InteractWithShieldOrTVDecoration', ret: "void", arity: 0, params: "void" },
  { name: 'IsLargeBreakableDecoration', ret: "bool8", arity: 2, params: "u16 metatileId, bool8 checkBase" },
  { name: 'FldEffPoison_Start', ret: "void", arity: 0, params: "void" },
  { name: 'FldEffPoison_IsActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'DoWateringBerryTreeAnim', ret: "void", arity: 0, params: "void" },
  { name: 'CreateRecordMixingLights', ret: "u8", arity: 0, params: "void" },
  { name: 'DestroyRecordMixingLights', ret: "void", arity: 0, params: "void" },
] as const;
