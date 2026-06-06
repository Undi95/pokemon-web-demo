# SMELLS 1:1 — filet anti-régression (Outil C)

Généré : 2026-06-05T16:00:39.446Z

> ⚠️ Statique = filet régression. **NE PROUVE PAS le comportement.**
>
> **Gate (exit≠0) = DUP-CASE seul** : signal de régression zéro-faux-
> positif (prouvé par --selftest ; cf. dead `case 14` party retiré).
> **HARDCODE = vrais bugs** (B_BUFF_*, CRY_PRIORITY_NORMAL, NO_ACC_…
> cross-lus dans la décomp) mais **non-gating** : volume = dette
> pré-existante cross-engine, pas des régressions de session — à
> corriger en important depuis decomp-data/auto (feedback-no-hardcoded
> -decomp-values), pas un build rouge permanent. **FALLTHRU** =
> structurel advisory (peut inclure fallthrough volontaire / artefact
> de parsing TS — vérifier). **U32-SUB** = heuristique (vérifier).

## [DUP-CASE] 0 — `case` dupliqué même switch (déterministe)

_aucun ✓_

## [HARDCODE] 9 — littéral ≠ constante décomp (vrai bug, non-gating)

- `src/engine/battle/battle-bag.ts`:36 — `SE_USE_ITEM = 4` mais décomp = **1** (src/engine/decomp-data/_common-constants.ts)
- `src/engine/ui/gba-text-printer.ts`:67 — `EXT_CTRL_CODE_PAUSE = 9` mais décomp = **8** (src/engine/decomp-data/_common-constants.ts)
- `src/engine/ui/gba-text-printer.ts`:68 — `EXT_CTRL_CODE_PAUSE_UNTIL_PRESS = 10` mais décomp = **9** (src/engine/decomp-data/_common-constants.ts)
- `src/engine/ui/gba-text-printer.ts`:69 — `EXT_CTRL_CODE_WAIT_SE = 11` mais décomp = **10** (src/engine/decomp-data/_common-constants.ts)
- `src/engine/ui/gba-text-printer.ts`:70 — `EXT_CTRL_CODE_PLAY_BGM = 12` mais décomp = **11** (src/engine/decomp-data/_common-constants.ts)
- `src/engine/ui/gba-text-printer.ts`:71 — `EXT_CTRL_CODE_ESCAPE = 13` mais décomp = **12** (src/engine/decomp-data/_common-constants.ts)
- `src/engine/ui/main-menu-impl.ts`:977 — `EXT_CTRL_CODE_PAUSE = 9` mais décomp = **8** (src/engine/decomp-data/_common-constants.ts)
- `src/engine/ui/option-menu-impl.ts`:627 — `CHAR_0 = 48` mais décomp = **161** (src/engine/decomp-data/_common-constants.ts)
- `src/engine/ui/option-menu-impl.ts`:628 — `CHAR_SPACER = 32` mais décomp = **119** (src/engine/decomp-data/_common-constants.ts)

## [FALLTHRU] 190 — case sans break/return ni commentaire (structurel)

- `src/engine/bag/bag-item-effects.ts`:482 — `case 0` tombe sur le suivant
- `src/engine/bag/bag-item-effects.ts`:678 — `case 0` tombe sur le suivant
- `src/engine/bag/bag-item-effects.ts`:679 — `case 1` tombe sur le suivant
- `src/engine/bag/bag-item-effects.ts`:680 — `case 2` tombe sur le suivant
- `src/engine/bag/bag-item-effects.ts`:734 — `case 5` tombe sur le suivant
- `src/engine/bag/bag-item-effects.ts`:735 — `case 6` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:297 — `case ITEMMENULOCATION_BATTLE` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:644 — `case ITEM_EFFECT_HEAL_HP` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:645 — `case ITEM_EFFECT_CURE_POISON` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:646 — `case ITEM_EFFECT_CURE_SLEEP` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:647 — `case ITEM_EFFECT_CURE_BURN` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:648 — `case ITEM_EFFECT_CURE_FREEZE` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:649 — `case ITEM_EFFECT_CURE_PARALYSIS` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:650 — `case ITEM_EFFECT_CURE_ALL_STATUS` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:651 — `case ITEM_EFFECT_HP_EV` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:652 — `case ITEM_EFFECT_ATK_EV` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:653 — `case ITEM_EFFECT_DEF_EV` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:654 — `case ITEM_EFFECT_SPEED_EV` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:655 — `case ITEM_EFFECT_SPATK_EV` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:664 — `case ITEM_EFFECT_PP_UP` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:548 — `case ` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:705 — `case ` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:706 — `case ` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:707 — `case ` tombe sur le suivant
- `src/engine/bag/bag-menu-ctx.ts`:708 — `case ` tombe sur le suivant
- `src/engine/bag/bag-menu.ts`:805 — `case TMHM_POCKET` tombe sur le suivant
- `src/engine/battle/ability-battle-effects.ts`:306 — `case WEATHER_RAIN` tombe sur le suivant
- `src/engine/battle/ability-battle-effects.ts`:307 — `case WEATHER_RAIN_THUNDERSTORM` tombe sur le suivant
- `src/engine/battle/ability-battle-effects.ts`:392 — `case ABILITY_CLOUD_NINE` tombe sur le suivant
- `src/engine/battle/ability-battle-effects.ts`:565 — `case ABILITY_INSOMNIA` tombe sur le suivant
- `src/engine/battle/ai/ai-script-commands.ts`:1154 — `case AI_TARGET` tombe sur le suivant
- `src/engine/battle/ai/ai-script-commands.ts`:1169 — `case AI_USER` tombe sur le suivant
- `src/engine/battle/ai/ai-script-commands.ts`:1177 — `case AI_TARGET` tombe sur le suivant
- `src/engine/battle/ai/ai-script-commands.ts`:1191 — `case AI_USER` tombe sur le suivant
- `src/engine/battle/ai/ai-script-commands.ts`:1200 — `case AI_TARGET` tombe sur le suivant
- `src/engine/battle/ai/ai-script-commands.ts`:1216 — `case AI_USER` tombe sur le suivant
- `src/engine/battle/ai/ai-script-commands.ts`:1225 — `case AI_TARGET` tombe sur le suivant
- `src/engine/battle/battle-controller-player.ts`:1975 — `case default` tombe sur le suivant
- `src/engine/battle/battle-flow.ts`:2366 — `case ` tombe sur le suivant
- `src/engine/battle/battle-healthbox.ts`:1028 — `case ` tombe sur le suivant
- `src/engine/battle/battle-link-start.ts`:460 — `case 5` tombe sur le suivant
- `src/engine/battle/battle-link-start.ts`:461 — `case 9` tombe sur le suivant
- `src/engine/battle/battle-link-start.ts`:469 — `case 6` tombe sur le suivant
- `src/engine/battle/battle-link-start.ts`:470 — `case 10` tombe sur le suivant
- `src/engine/battle/battle-main-functions.ts`:1486 — `case TRAINER_CLASS_ELITE_FOUR` tombe sur le suivant
- `src/engine/battle/battle-main-functions.ts`:1490 — `case TRAINER_CLASS_TEAM_AQUA` tombe sur le suivant
- `src/engine/battle/battle-main-functions.ts`:1491 — `case TRAINER_CLASS_TEAM_MAGMA` tombe sur le suivant
- `src/engine/battle/battle-main-functions.ts`:1492 — `case TRAINER_CLASS_AQUA_ADMIN` tombe sur le suivant
- `src/engine/battle/battle-main-functions.ts`:1493 — `case TRAINER_CLASS_AQUA_LEADER` tombe sur le suivant
- `src/engine/battle/battle-main-functions.ts`:1494 — `case TRAINER_CLASS_MAGMA_ADMIN` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:363 — `case B_TXT_ATK_PREFIX1` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:363 — `case B_TXT_ATK_PREFIX2` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:365 — `case B_TXT_DEF_PREFIX1` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:365 — `case B_TXT_DEF_PREFIX2` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:370 — `case B_TXT_TRAINER2_CLASS` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:370 — `case B_TXT_TRAINER2_NAME` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:371 — `case B_TXT_TRAINER1_LOSE_TEXT` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:371 — `case B_TXT_TRAINER1_WIN_TEXT` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:372 — `case B_TXT_TRAINER2_LOSE_TEXT` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:474 — `case 5` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:474 — `case 6` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:474 — `case 7` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:474 — `case 8` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:474 — `case 9` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:474 — `case 10` tombe sur le suivant
- `src/engine/battle/battle-message.ts`:476 — `case default` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:1027 — `case MOVE_TARGET_BOTH` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:3429 — `case MOVE_RESULT_DOESNT_AFFECT_FOE` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:3433 — `case MOVE_RESULT_FOE_ENDURED` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:3434 — `case MOVE_RESULT_ONE_HIT_KO` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:4710 — `case MOVE_FLY` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:4729 — `case MOVE_FLY` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:9704 — `case 0` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:9705 — `case 1` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:9706 — `case 2` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:9707 — `case 3` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:10122 — `case 2` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:10249 — `case 2` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:10250 — `case 3` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:10360 — `case 5` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:10503 — `case 11` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:10507 — `case default` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:11109 — `case MOVE_TARGET_DEPENDS` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:11110 — `case MOVE_TARGET_BOTH` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:11111 — `case MOVE_TARGET_FOES_AND_ALLY` tombe sur le suivant
- `src/engine/battle/battle-script-commands.ts`:11142 — `case MOVE_TARGET_USER_OR_SELECTED` tombe sur le suivant
- `src/engine/battle/battle-setup-helpers.ts`:258 — `case MAP_TYPE_TOWN` tombe sur le suivant
- `src/engine/battle/battle-setup-helpers.ts`:259 — `case MAP_TYPE_CITY` tombe sur le suivant
- `src/engine/battle/battle-setup-helpers.ts`:266 — `case MAP_TYPE_INDOOR` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:546 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:557 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:558 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:559 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:566 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:567 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:568 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:571 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:572 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:573 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:574 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:584 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:584 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:586 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:586 — `case ` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:655 — `case 6` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:656 — `case 7` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:657 — `case 8` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:658 — `case 9` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:659 — `case 10` tombe sur le suivant
- `src/engine/battle/battle-string-decoder.ts`:662 — `case default` tombe sur le suivant
- `src/engine/battle/data/item-effects.ts`:77 — `case 0` tombe sur le suivant
- `src/engine/battle/data/item-effects.ts`:78 — `case 1` tombe sur le suivant
- `src/engine/battle/data/item-effects.ts`:79 — `case 2` tombe sur le suivant
- `src/engine/battle/item-battle-effects.ts`:337 — `case HOLD_EFFECT_CONFUSE_SPICY` tombe sur le suivant
- `src/engine/battle/item-battle-effects.ts`:338 — `case HOLD_EFFECT_CONFUSE_DRY` tombe sur le suivant
- `src/engine/battle/item-battle-effects.ts`:339 — `case HOLD_EFFECT_CONFUSE_SWEET` tombe sur le suivant
- `src/engine/battle/item-battle-effects.ts`:340 — `case HOLD_EFFECT_CONFUSE_BITTER` tombe sur le suivant
- `src/engine/battle/party-storage.ts`:1124 — `case REQUEST_MOVES_PP_BATTLE_PSC` tombe sur le suivant
- `src/engine/battle/reshow-battle-screen.ts`:116 — `case 7` tombe sur le suivant
- `src/engine/battle/reshow-battle-screen.ts`:117 — `case 8` tombe sur le suivant
- `src/engine/battle/reshow-battle-screen.ts`:118 — `case 9` tombe sur le suivant
- `src/engine/battle/reshow-battle-screen.ts`:131 — `case 11` tombe sur le suivant
- `src/engine/battle/reshow-battle-screen.ts`:132 — `case 12` tombe sur le suivant
- `src/engine/battle/reshow-battle-screen.ts`:133 — `case 13` tombe sur le suivant
- `src/engine/battle/reshow-battle-screen.ts`:137 — `case 15` tombe sur le suivant
- `src/engine/battle/reshow-battle-screen.ts`:138 — `case 16` tombe sur le suivant
- `src/engine/battle/reshow-battle-screen.ts`:139 — `case 17` tombe sur le suivant
- `src/engine/battle/util.ts`:90 — `case BS_ATTACKER_WITH_PARTNER` tombe sur le suivant
- `src/engine/battle/util.ts`:91 — `case BS_FAINTED_LINK_MULTIPLE_2` tombe sur le suivant
- `src/engine/battle/util.ts`:92 — `case BS_ATTACKER_SIDE` tombe sur le suivant
- `src/engine/battle/util.ts`:93 — `case BS_NOT_ATTACKER_SIDE` tombe sur le suivant
- `src/engine/field/map-loader.ts`:983 — `case CONNECTION_SOUTH` tombe sur le suivant
- `src/engine/field/map-loader.ts`:986 — `case CONNECTION_WEST` tombe sur le suivant
- `src/engine/field/map-loader.ts`:1130 — `case CONNECTION_SOUTH` tombe sur le suivant
- `src/engine/field/map-loader.ts`:1133 — `case CONNECTION_WEST` tombe sur le suivant
- `src/engine/field/object-events.ts`:1894 — `case 0` tombe sur le suivant
- `src/engine/field/object-events.ts`:1921 — `case 0` tombe sur le suivant
- `src/engine/field/object-events.ts`:2007 — `case 0` tombe sur le suivant
- `src/engine/field/tilemap-loader.ts`:142 — `case MB_SOUTH_ARROW_WARP` tombe sur le suivant
- `src/engine/m4a/envelope.ts`:38 — `case ` tombe sur le suivant
- `src/engine/m4a/envelope.ts`:38 — `case ` tombe sur le suivant
- `src/engine/m4a/envelope.ts`:39 — `case ` tombe sur le suivant
- `src/engine/m4a/envelope.ts`:39 — `case ` tombe sur le suivant
- `src/engine/m4a/envelope.ts`:40 — `case ` tombe sur le suivant
- `src/engine/m4a/envelope.ts`:40 — `case ` tombe sur le suivant
- `src/engine/m4a/synth.ts`:216 — `case ` tombe sur le suivant
- `src/engine/m4a/synth.ts`:217 — `case ` tombe sur le suivant
- `src/engine/m4a/synth.ts`:218 — `case ` tombe sur le suivant
- `src/engine/m4a/synth.ts`:236 — `case ` tombe sur le suivant
- `src/engine/m4a/synth.ts`:262 — `case ` tombe sur le suivant
- `src/engine/script/script-opcodes.ts`:513 — `case 0` tombe sur le suivant
- `src/engine/script/script-opcodes.ts`:513 — `case 7` tombe sur le suivant
- `src/engine/script/script-opcodes.ts`:513 — `case 8` tombe sur le suivant
- `src/engine/script/script-opcodes.ts`:513 — `case 9` tombe sur le suivant
- `src/engine/script/script-opcodes.ts`:530 — `case 2` tombe sur le suivant
- `src/engine/script/script-opcodes.ts`:530 — `case 3` tombe sur le suivant
- `src/engine/script/script-opcodes.ts`:530 — `case 4` tombe sur le suivant
- `src/engine/script/script-opcodes.ts`:530 — `case 5` tombe sur le suivant
- `src/engine/system/palette.ts`:372 — `case FAST_FADE_IN_FROM_WHITE` tombe sur le suivant
- `src/engine/system/time-based-events.ts`:95 — `case BERRY_STAGE_PLANTED` tombe sur le suivant
- `src/engine/system/time-based-events.ts`:96 — `case BERRY_STAGE_SPROUTED` tombe sur le suivant
- `src/engine/ui/item-use-callbacks.ts`:240 — `case ITEM_EFFECT_HP_EV` tombe sur le suivant
- `src/engine/ui/item-use-callbacks.ts`:241 — `case ITEM_EFFECT_ATK_EV` tombe sur le suivant
- `src/engine/ui/item-use-callbacks.ts`:242 — `case ITEM_EFFECT_DEF_EV` tombe sur le suivant
- `src/engine/ui/item-use-callbacks.ts`:243 — `case ITEM_EFFECT_SPEED_EV` tombe sur le suivant
- `src/engine/ui/item-use-callbacks.ts`:244 — `case ITEM_EFFECT_SPATK_EV` tombe sur le suivant
- `src/engine/ui/item-use-callbacks.ts`:258 — `case ITEM_EFFECT_PP_UP` tombe sur le suivant
- `src/engine/ui/list-menu.ts`:300 — `case 2` tombe sur le suivant
- `src/engine/ui/list-menu.ts`:769 — `case LISTFIELD_MOVECURSORFUNC` tombe sur le suivant
- `src/engine/ui/list-menu.ts`:817 — `case LISTFIELD_MOVECURSORFUNC` tombe sur le suivant
- `src/engine/ui/list-menu.ts`:1691 — `case 2` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:362 — `case ITEM_ORANGE_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:363 — `case ITEM_HARBOR_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:364 — `case ITEM_GLITTER_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:365 — `case ITEM_MECH_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:366 — `case ITEM_WOOD_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:367 — `case ITEM_WAVE_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:368 — `case ITEM_BEAD_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:369 — `case ITEM_SHADOW_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:370 — `case ITEM_TROPIC_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:371 — `case ITEM_DREAM_MAIL` tombe sur le suivant
- `src/engine/ui/mail-data.ts`:372 — `case ITEM_FAB_MAIL` tombe sur le suivant
- `src/engine/ui/mail.ts`:841 — `case ICON_TYPE_BEAD` tombe sur le suivant
- `src/engine/ui/mon-summary-anim.ts`:258 — `case 0` tombe sur le suivant
- `src/engine/ui/mon-summary-anim.ts`:259 — `case 2` tombe sur le suivant
- `src/engine/ui/mon-summary-anim.ts`:271 — `case 0` tombe sur le suivant
- `src/engine/ui/mon-summary-anim.ts`:1139 — `case 0` tombe sur le suivant
- `src/engine/ui/start-menu.ts`:727 — `case ` tombe sur le suivant
- `src/engine/ui/summary-screen.ts`:1656 — `case PSS_PAGE_BATTLE_MOVES` tombe sur le suivant
- `src/engine/ui/wallclock.ts`:750 — `case 1` tombe sur le suivant

## [U32-SUB] 23 — soustraction sans `>>> 0` près d'un contexte u32 (heuristique)

- `src/engine/bag/bag-item-effects.ts`:411 — `const hpDelta = mon.maxHp - oldMaxHp;`
- `src/engine/bag/bag-item-effects.ts`:553 — `amount = mon.maxHp - mon.currentHp;`
- `src/engine/bag/bag-item-effects.ts`:570 — `result.hpHealed = newHp - mon.currentHp;`
- `src/engine/battle/battle-healthbox-l.ts`:311 — `const currExpBarValue = exp - currLevelExp;`
- `src/engine/battle/battle-script-commands.ts`:1205 — `setBattleMoveDamage(targetMon.hp - 1);  // leave at 1 HP`
- `src/engine/battle/battle-script-commands.ts`:4558 — `setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - gBattleMons[gBattlerAttacker].hp);`
- `src/engine/battle/battle-script-commands.ts`:5715 — `const painSplitHp = gBattleMons[gBattlerTarget].hp - hpDiff;`
- `src/engine/battle/battle-script-commands.ts`:5720 — `setBattleMoveDamage(gBattleMons[gBattlerAttacker].hp - hpDiff);`
- `src/engine/battle/battle-script-commands.ts`:6538 — `setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);`
- `src/engine/battle/battle-script-commands.ts`:6541 — `setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);`
- `src/engine/battle/battle-script-commands.ts`:6810 — `setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);`
- `src/engine/battle/battle-script-commands.ts`:6933 — `setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);`
- `src/engine/battle/battle-script-commands.ts`:7005 — `const divisor = 1 << (3 - gDisableStructs[gBattlerAttacker].stockpileCounter);`
- `src/engine/battle/battle-script-commands.ts`:7896 — `const result = Math.floor(((hpSwitchout - gBattleMons[opposing].hp) * 100) / hpSwitchout);`
- `src/engine/battle/battle-script-commands.ts`:8254 — `const spikesDmg = (5 - gSideTimers[side].spikesAmount) * 2;`
- `src/engine/battle/item-battle-effects.ts`:315 — `dmg = gBattleMons[battlerId].maxHP - gBattleMons[battlerId].hp;`
- `src/engine/battle/item-battle-effects.ts`:353 — `dmg = gBattleMons[battlerId].maxHP - gBattleMons[battlerId].hp;`
- `src/engine/battle/item-battle-effects.ts`:371 — `dmg = gBattleMons[battlerId].maxHP - gBattleMons[battlerId].hp;`
- `src/engine/battle/party-storage.ts`:842 — `mon.hp += newMaxHP - previousMaxHP;`
- `src/engine/battle/wire-bytecode-bridge.ts`:353 — `const damage = defenderHpBefore - opts.defender.currentHp;`
- `src/engine/pokemon/pokemon.ts`:357 — `inst.currentHp = Math.min(inst.maxHp, inst.currentHp + (inst.maxHp - oldMaxHp));`
- `src/engine/pokemon/pokemon.ts`:541 — `const hpDelta = mon.maxHp - oldMaxHp;`
- `src/engine/script/specials-registry.ts`:3391 — `i = (i - 1) & 0xFFFF;`

