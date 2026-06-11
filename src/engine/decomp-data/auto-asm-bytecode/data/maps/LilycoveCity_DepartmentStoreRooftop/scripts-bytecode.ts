// AUTO-GENERATED from data/maps/LilycoveCity_DepartmentStoreRooftop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=119, bytes=820, labels=25, unknownOps=0, unresolvedSymbols=28

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LilycoveCity_DepartmentStoreRooftop_MapScripts": 0,
  "LilycoveCity_DepartmentStoreRooftop_OnTransition": 5,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ShowSaleWoman": 53,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_HideSaleWoman": 57,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_SaleWoman": 61,
  "LilycoveCity_DepartmentStoreRooftop_PokemartDecor_ClearOutSale": 84,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_Man": 86,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ManClearOutSale": 123,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ThirstyMan": 133,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_VendingMachine": 142,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ChooseDrink": 159,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_FreshWater": 284,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_SodaPop": 295,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_Lemonade": 306,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_CheckMoneyFreshWater": 317,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_CheckMoneySodaPop": 324,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_CheckMoneyLemonade": 331,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_RemoveMoneyFreshWater": 338,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_RemoveMoneySodaPop": 345,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_RemoveMoneyLemonade": 352,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_TryBuyDrink": 359,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ChooseNewDrink": 775,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_NotEnoughMoneyForDrink": 787,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_NoRoomForDrink": 801,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_ExitVendingMachine": 815,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,5,0,0,0,151,0,0,35,0,0,1,0,34,0,0,1,0,8,1,53,0,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,57,0,0,0,8,1,0,0,0,0,3,43,0,0,4,42,0,0,4,107,91,104,0,0,0,0,103,136,84,0,0,0,16,0,0,0,0,0,10,4,109,3,109,3,107,91,151,0,0,35,0,0,1,0,34,0,0,1,0,8,1,123,0,0,0,8,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,106,104,0,0,0,0,103,148,0,0,0,6,159,0,0,0,3,112,16,0,0,0,26,0,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,28,1,0,0,34,28,1,0,0,7,1,0,0,0,0,7,1,28,1,0,0,35,0,0,1,0,34,0,0,1,0,35,39,1,0,0,34,39,1,0,0,7,1,0,0,0,0,7,1,39,1,0,0,35,0,0,2,0,34,0,0,2,0,35,50,1,0,0,34,50,1,0,0,7,1,0,0,0,0,7,1,50,1,0,0,16,0,0,0,0,0,10,4,6,47,3,0,0,3,23,0,0,0,0,6,103,1,0,0,3,23,0,0,0,0,6,103,1,0,0,3,23,0,0,0,0,6,103,1,0,0,3,147,200,0,0,0,0,4,147,44,1,0,0,0,4,147,94,1,0,0,0,4,146,200,0,0,0,0,4,146,44,1,0,0,0,4,146,94,1,0,0,0,4,35,0,0,0,0,34,0,0,0,0,8,1,61,1,0,0,8,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,68,1,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,75,1,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,19,3,0,0,7,1,0,0,0,0,71,0,0,1,0,35,0,0,0,0,34,0,0,0,0,7,1,33,3,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,82,1,0,0,8,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,89,1,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,96,1,0,0,8,1,0,0,0,0,150,0,0,0,129,0,1,2,0,0,0,48,106,0,16,0,0,0,0,0,10,4,69,0,0,1,0,129,0,1,2,0,0,0,133,0,1,2,0,0,0,16,0,0,0,0,0,10,4,144,64,0,35,0,0,0,0,34,0,0,0,0,7,5,7,3,0,0,7,5,0,0,0,0,71,0,0,1,0,35,0,0,0,0,34,0,0,0,0,7,1,33,3,0,0,7,1,0,0,0,0,48,106,0,16,0,0,0,0,0,10,4,69,0,0,1,0,129,0,1,2,0,0,0,133,0,1,2,0,0,0,16,0,0,0,0,0,10,4,144,64,0,35,0,0,0,0,34,0,0,0,0,7,5,7,3,0,0,7,5,0,0,0,0,71,0,0,1,0,35,0,0,0,0,34,0,0,0,0,7,1,33,3,0,0,7,1,0,0,0,0,48,106,0,16,0,0,0,0,0,10,4,69,0,0,1,0,129,0,1,2,0,0,0,133,0,1,2,0,0,0,16,0,0,0,0,0,10,4,6,7,3,0,0,3,104,0,0,0,0,103,6,159,0,0,0,3,16,0,0,0,0,0,10,4,6,47,3,0,0,3,16,0,0,0,0,0,10,4,6,47,3,0,0,3,149,0,0,108,3] as const;

export const STATS = { ops: 119, bytes: 820, labels: 25, unknownOps: 0, unresolvedSymbols: 28 } as const;
