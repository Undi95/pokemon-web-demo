/**
 * contest_strings.ts — table FR `sContestNames[]` (voie A, partagée parsé + byte-VM).
 *
 * 1:1 décomp `sContestNames[]` (data/lilycove_lady.h:452), indexé CONTEST_CATEGORY_*
 * (global.h:86 = COOL 0 / BEAUTY 1 / CUTE 2 / SMART 3 / TOUGH 4) →
 * gText_{Coolness,Beauty,Cuteness,Smartness,Toughness}Contest, strings FR ROM
 * décomp strings.c:616-620 (texte cité ligne-par-ligne, PAS un enum dérivable →
 * hardcode 1:1 documenté). Utilisé par ScrCmd_buffercontestname.
 */
export const sContestNames = [
  'SANG-FROID',   // [CONTEST_CATEGORY_COOL]   gText_CoolnessContest  strings.c:616
  'BEAUTE',       // [CONTEST_CATEGORY_BEAUTY] gText_BeautyContest    strings.c:617
  'GRACE',        // [CONTEST_CATEGORY_CUTE]   gText_CutenessContest  strings.c:618
  'INTELLIGENCE', // [CONTEST_CATEGORY_SMART]  gText_SmartnessContest strings.c:619
  'ROBUSTESSE',   // [CONTEST_CATEGORY_TOUGH]  gText_ToughnessContest strings.c:620
] as const;
