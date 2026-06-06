/**
 * include/menu_helpers.ts — surface « header » 1:1 de `decomp/include/menu_helpers.h`.
 * Constantes MENU_L/R_PRESSED + re-export des fonctions publiques de l'impl miroir.
 */
export {
  MENU_L_PRESSED, MENU_R_PRESSED,
  AdjustQuantityAccordingToDPadInput,
  GetLRKeysPressed, GetLRKeysPressedAndHeld,
  IsHoldingItemAllowed, IsWritingMailAllowed,
  MenuHelpers_IsLinkActive, MenuHelpers_ShouldWaitForLinkRecv,
  SetItemListPerPageCount, SetCursorWithinListBounds, SetCursorScrollWithinListBounds,
  type ListPos, type IntRef,
} from '../menu_helpers';
