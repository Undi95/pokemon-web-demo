// AUTO-GENERATED from data/maps/LilycoveCity_DepartmentStoreRooftop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=119, bytes=607, labels=25, unknownOps=2, unresolvedSymbols=21

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LilycoveCity_DepartmentStoreRooftop_MapScripts": 0,
  "LilycoveCity_DepartmentStoreRooftop_OnTransition": 5,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ShowSaleWoman": 29,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_HideSaleWoman": 33,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_SaleWoman": 37,
  "LilycoveCity_DepartmentStoreRooftop_PokemartDecor_ClearOutSale": 62,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_Man": 64,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ManClearOutSale": 89,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ThirstyMan": 99,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_VendingMachine": 108,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ChooseDrink": 127,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_FreshWater": 216,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_SodaPop": 226,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_Lemonade": 236,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_CheckMoneyFreshWater": 246,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_CheckMoneySodaPop": 253,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_CheckMoneyLemonade": 260,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_RemoveMoneyFreshWater": 267,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_RemoveMoneySodaPop": 274,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_RemoveMoneyLemonade": 281,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_TryBuyDrink": 288,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ChooseNewDrink": 560,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_NotEnoughMoneyForDrink": 574,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_NoRoomForDrink": 588,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ExitVendingMachine": 602,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,151,3,0,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,43,194,3,15,42,194,3,15,107,91,104,0,0,0,0,0,0,0,136,62,0,0,0,16,0,0,0,0,0,10,0,109,90,109,90,107,91,151,3,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,106,104,0,0,0,0,0,0,0,148,0,0,0,89,127,0,0,0,90,112,16,0,42,0,26,0,0,13,128,26,0,128,0,0,35,0,128,0,0,34,0,128,0,0,35,216,0,0,0,34,216,0,0,0,35,0,128,1,0,34,0,128,1,0,35,226,0,0,0,34,226,0,0,0,35,0,128,2,0,34,0,128,2,0,35,236,0,0,0,34,236,0,0,0,16,0,0,0,0,0,10,0,89,90,2,0,0,90,113,0,26,0,89,32,1,0,0,90,113,0,27,0,89,32,1,0,0,90,113,0,28,0,89,32,1,0,0,90,147,200,0,0,0,0,15,147,44,1,0,0,0,15,147,94,1,0,0,0,15,146,200,0,0,0,0,15,146,44,1,0,0,0,15,146,94,1,0,0,0,15,35,0,0,0,0,34,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,0,0,2,0,34,0,0,2,0,35,13,128,0,0,34,13,128,0,0,71,0,0,1,0,35,13,128,0,0,34,13,128,0,0,35,0,0,0,0,34,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,0,0,2,0,34,0,0,2,0,150,0,0,0,129,0,1,2,0,0,0,9,106,0,16,0,0,0,0,0,10,0,69,0,0,1,0,129,0,1,2,0,0,0,133,0,1,2,0,14,0,16,0,0,0,0,0,10,0,144,64,0,35,13,128,0,0,34,13,128,0,0,71,0,0,1,0,35,13,128,0,0,34,13,128,0,0,9,106,0,16,0,0,0,0,0,10,0,69,0,0,1,0,129,0,1,2,0,0,0,133,0,1,2,0,14,0,16,0,0,0,0,0,10,0,144,64,0,35,13,128,0,0,34,13,128,0,0,71,0,0,1,0,35,13,128,0,0,34,13,128,0,0,9,106,0,16,0,0,0,0,0,10,0,69,0,0,1,0,129,0,1,2,0,0,0,133,0,1,2,0,14,0,16,0,0,0,0,0,10,0,89,48,2,0,0,90,104,0,0,0,0,0,0,0,89,127,0,0,0,90,16,0,0,0,0,0,10,0,89,90,2,0,0,90,16,0,0,0,0,0,10,0,89,90,2,0,0,90,149,0,0,108,90] as const;

export const STATS = { ops: 119, bytes: 607, labels: 25, unknownOps: 2, unresolvedSymbols: 21 } as const;
