/**
 * include/strings.ts — miroir 1:1 (PARTIEL) de `decomp/include/strings.h`.
 *
 * STAGE 0 du chantier TEXTE 1:1 : déclare seulement les `gText_ExpandedPlaceholder_*`
 * (utilisés par `GetExpandedPlaceholder`, string_util.ts) + le bridge transitoire
 * d'encodage (InitTextData/EncodePlayerNameFR). Le reste de strings.h (milliers de
 * chaînes OW/menus) = Stage 1. Les re-exports préservent le live-binding ES des
 * `export let` (valeurs encodées après InitTextData visibles par les importeurs).
 */
export {
  gText_ExpandedPlaceholder_Empty,
  gText_ExpandedPlaceholder_Kun,
  gText_ExpandedPlaceholder_Chan,
  gText_ExpandedPlaceholder_Emerald,
  gText_ExpandedPlaceholder_Aqua,
  gText_ExpandedPlaceholder_Magma,
  gText_ExpandedPlaceholder_Archie,
  gText_ExpandedPlaceholder_Maxie,
  gText_ExpandedPlaceholder_Kyogre,
  gText_ExpandedPlaceholder_Groudon,
  gText_ExpandedPlaceholder_Brendan,
  gText_ExpandedPlaceholder_May,
  InitTextData,
  EncodePlayerNameFR,
  IsTextDataInitialized,
} from '../strings';
