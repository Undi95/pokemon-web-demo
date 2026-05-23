// AUTO-GENERATED from include/money.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/money.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetMoney', ret: "u32", arity: 1, params: "u32 *moneyPtr" },
  { name: 'SetMoney', ret: "void", arity: 2, params: "u32 *moneyPtr, u32 newValue" },
  { name: 'IsEnoughMoney', ret: "bool8", arity: 2, params: "u32 *moneyPtr, u32 cost" },
  { name: 'AddMoney', ret: "void", arity: 2, params: "u32 *moneyPtr, u32 toAdd" },
  { name: 'RemoveMoney', ret: "void", arity: 2, params: "u32 *moneyPtr, u32 toSub" },
  { name: 'IsEnoughForCostInVar0x8005', ret: "bool8", arity: 0, params: "void" },
  { name: 'SubtractMoneyFromVar0x8005', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMoneyAmountInMoneyBox', ret: "void", arity: 3, params: "u8 windowId, int amount, u8 speed" },
  { name: 'PrintMoneyAmount', ret: "void", arity: 5, params: "u8 windowId, u8 x, u8 y, int amount, u8 speed" },
  { name: 'PrintMoneyAmountInMoneyBoxWithBorder', ret: "void", arity: 4, params: "u8 windowId, u16 tileStart, u8 pallete, int amount" },
  { name: 'ChangeAmountInMoneyBox', ret: "void", arity: 1, params: "int amount" },
  { name: 'DrawMoneyBox', ret: "void", arity: 3, params: "int amount, u8 x, u8 y" },
  { name: 'HideMoneyBox', ret: "void", arity: 0, params: "void" },
  { name: 'AddMoneyLabelObject', ret: "void", arity: 2, params: "u16 x, u16 y" },
  { name: 'RemoveMoneyLabelObject', ret: "void", arity: 0, params: "void" },
] as const;
