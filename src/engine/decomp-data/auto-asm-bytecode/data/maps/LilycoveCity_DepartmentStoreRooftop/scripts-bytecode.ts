// AUTO-GENERATED from data/maps/LilycoveCity_DepartmentStoreRooftop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=119, bytes=823, labels=25, unknownOps=0, unresolvedSymbols=19

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LilycoveCity_DepartmentStoreRooftop_MapScripts": 0,
  "LilycoveCity_DepartmentStoreRooftop_OnTransition": 5,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ShowSaleWoman": 53,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_HideSaleWoman": 57,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_SaleWoman": 61,
  "LilycoveCity_DepartmentStoreRooftop_PokemartDecor_ClearOutSale": 86,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_Man": 88,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ManClearOutSale": 125,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ThirstyMan": 135,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_VendingMachine": 144,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ChooseDrink": 163,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_FreshWater": 288,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_SodaPop": 298,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_Lemonade": 308,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_CheckMoneyFreshWater": 318,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_CheckMoneySodaPop": 325,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_CheckMoneyLemonade": 332,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_RemoveMoneyFreshWater": 339,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_RemoveMoneySodaPop": 346,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_RemoveMoneyLemonade": 353,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_TryBuyDrink": 360,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ChooseNewDrink": 776,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_NotEnoughMoneyForDrink": 790,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_NoRoomForDrink": 804,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ExitVendingMachine": 818,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,151,3,0,35,13,128,1,0,34,13,128,1,0,8,1,53,0,0,0,8,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,8,1,57,0,0,0,8,1,13,128,0,0,90,43,194,3,15,42,194,3,15,107,91,104,0,0,0,0,0,0,0,136,86,0,0,0,16,0,0,0,0,0,10,4,109,90,109,90,107,91,151,3,0,35,13,128,1,0,34,13,128,1,0,8,1,125,0,0,0,8,1,13,128,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,106,104,0,0,0,0,0,0,0,148,0,0,0,89,163,0,0,0,90,112,16,0,42,0,26,0,0,13,128,26,0,128,0,0,35,0,128,0,0,34,0,128,0,0,35,32,1,0,0,34,32,1,0,0,7,1,0,0,0,0,7,1,32,1,0,0,35,0,128,1,0,34,0,128,1,0,35,42,1,0,0,34,42,1,0,0,7,1,0,0,0,0,7,1,42,1,0,0,35,0,128,2,0,34,0,128,2,0,35,52,1,0,0,34,52,1,0,0,7,1,0,0,0,0,7,1,52,1,0,0,16,0,0,0,0,0,10,4,89,50,3,0,0,90,113,0,26,0,89,104,1,0,0,90,113,0,27,0,89,104,1,0,0,90,113,0,28,0,89,104,1,0,0,90,147,200,0,0,0,0,15,147,44,1,0,0,0,15,147,94,1,0,0,0,15,146,200,0,0,0,0,15,146,44,1,0,0,0,15,146,94,1,0,0,0,15,35,0,0,0,0,34,0,0,0,0,8,1,62,1,0,0,8,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,69,1,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,76,1,0,0,8,1,0,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,22,3,0,0,7,1,13,128,0,0,71,0,0,1,0,35,13,128,0,0,34,13,128,0,0,7,1,36,3,0,0,7,1,13,128,0,0,35,0,0,0,0,34,0,0,0,0,8,1,83,1,0,0,8,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,90,1,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,97,1,0,0,8,1,0,0,0,0,150,0,0,0,129,0,1,2,0,0,0,9,106,0,16,0,0,0,0,0,10,4,69,0,0,1,0,129,0,1,2,0,0,0,133,0,1,2,0,14,0,16,0,0,0,0,0,10,4,144,64,0,35,13,128,0,0,34,13,128,0,0,7,5,8,3,0,0,7,5,13,128,0,0,71,0,0,1,0,35,13,128,0,0,34,13,128,0,0,7,1,36,3,0,0,7,1,13,128,0,0,9,106,0,16,0,0,0,0,0,10,4,69,0,0,1,0,129,0,1,2,0,0,0,133,0,1,2,0,14,0,16,0,0,0,0,0,10,4,144,64,0,35,13,128,0,0,34,13,128,0,0,7,5,8,3,0,0,7,5,13,128,0,0,71,0,0,1,0,35,13,128,0,0,34,13,128,0,0,7,1,36,3,0,0,7,1,13,128,0,0,9,106,0,16,0,0,0,0,0,10,4,69,0,0,1,0,129,0,1,2,0,0,0,133,0,1,2,0,14,0,16,0,0,0,0,0,10,4,89,8,3,0,0,90,104,0,0,0,0,0,0,0,89,163,0,0,0,90,16,0,0,0,0,0,10,4,89,50,3,0,0,90,16,0,0,0,0,0,10,4,89,50,3,0,0,90,149,0,0,108,90] as const;

export const STATS = { ops: 119, bytes: 823, labels: 25, unknownOps: 0, unresolvedSymbols: 19 } as const;
