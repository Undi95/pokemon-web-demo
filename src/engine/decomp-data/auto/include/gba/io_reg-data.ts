// AUTO-GENERATED from include/gba/io_reg.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/gba/io_reg.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const REG_BASE = 67108864;
export const REG_OFFSET_DISPCNT = 0;
export const REG_OFFSET_DISPSTAT = 4;
export const REG_OFFSET_VCOUNT = 6;
export const REG_OFFSET_BG0CNT = 8;
export const REG_OFFSET_BG1CNT = 10;
export const REG_OFFSET_BG2CNT = 12;
export const REG_OFFSET_BG3CNT = 14;
export const REG_OFFSET_BG0HOFS = 16;
export const REG_OFFSET_BG0VOFS = 18;
export const REG_OFFSET_BG1HOFS = 20;
export const REG_OFFSET_BG1VOFS = 22;
export const REG_OFFSET_BG2HOFS = 24;
export const REG_OFFSET_BG2VOFS = 26;
export const REG_OFFSET_BG3HOFS = 28;
export const REG_OFFSET_BG3VOFS = 30;
export const REG_OFFSET_BG2PA = 32;
export const REG_OFFSET_BG2PB = 34;
export const REG_OFFSET_BG2PC = 36;
export const REG_OFFSET_BG2PD = 38;
export const REG_OFFSET_BG2X = 40;
export const REG_OFFSET_BG2X_L = 40;
export const REG_OFFSET_BG2X_H = 42;
export const REG_OFFSET_BG2Y = 44;
export const REG_OFFSET_BG2Y_L = 44;
export const REG_OFFSET_BG2Y_H = 46;
export const REG_OFFSET_BG3PA = 48;
export const REG_OFFSET_BG3PB = 50;
export const REG_OFFSET_BG3PC = 52;
export const REG_OFFSET_BG3PD = 54;
export const REG_OFFSET_BG3X = 56;
export const REG_OFFSET_BG3X_L = 56;
export const REG_OFFSET_BG3X_H = 58;
export const REG_OFFSET_BG3Y = 60;
export const REG_OFFSET_BG3Y_L = 60;
export const REG_OFFSET_BG3Y_H = 62;
export const REG_OFFSET_WIN0H = 64;
export const REG_OFFSET_WIN1H = 66;
export const REG_OFFSET_WIN0V = 68;
export const REG_OFFSET_WIN1V = 70;
export const REG_OFFSET_WININ = 72;
export const REG_OFFSET_WINOUT = 74;
export const REG_OFFSET_MOSAIC = 76;
export const REG_OFFSET_BLDCNT = 80;
export const REG_OFFSET_BLDALPHA = 82;
export const REG_OFFSET_BLDY = 84;
export const REG_OFFSET_SOUND1CNT_L = 96;
export const REG_OFFSET_NR10 = 96;
export const REG_OFFSET_SOUND1CNT_H = 98;
export const REG_OFFSET_NR11 = 98;
export const REG_OFFSET_NR12 = 99;
export const REG_OFFSET_SOUND1CNT_X = 100;
export const REG_OFFSET_NR13 = 100;
export const REG_OFFSET_NR14 = 101;
export const REG_OFFSET_SOUND2CNT_L = 104;
export const REG_OFFSET_NR21 = 104;
export const REG_OFFSET_NR22 = 105;
export const REG_OFFSET_SOUND2CNT_H = 108;
export const REG_OFFSET_NR23 = 108;
export const REG_OFFSET_NR24 = 109;
export const REG_OFFSET_SOUND3CNT_L = 112;
export const REG_OFFSET_NR30 = 112;
export const REG_OFFSET_SOUND3CNT_H = 114;
export const REG_OFFSET_NR31 = 114;
export const REG_OFFSET_NR32 = 115;
export const REG_OFFSET_SOUND3CNT_X = 116;
export const REG_OFFSET_NR33 = 116;
export const REG_OFFSET_NR34 = 117;
export const REG_OFFSET_SOUND4CNT_L = 120;
export const REG_OFFSET_NR41 = 120;
export const REG_OFFSET_NR42 = 121;
export const REG_OFFSET_SOUND4CNT_H = 124;
export const REG_OFFSET_NR43 = 124;
export const REG_OFFSET_NR44 = 125;
export const REG_OFFSET_SOUNDCNT_L = 128;
export const REG_OFFSET_NR50 = 128;
export const REG_OFFSET_NR51 = 129;
export const REG_OFFSET_SOUNDCNT_H = 130;
export const REG_OFFSET_SOUNDCNT_X = 132;
export const REG_OFFSET_NR52 = 132;
export const REG_OFFSET_SOUNDBIAS = 136;
export const REG_OFFSET_SOUNDBIAS_L = 136;
export const REG_OFFSET_SOUNDBIAS_H = 137;
export const REG_OFFSET_WAVE_RAM0 = 144;
export const REG_OFFSET_WAVE_RAM1 = 148;
export const REG_OFFSET_WAVE_RAM2 = 152;
export const REG_OFFSET_WAVE_RAM3 = 156;
export const REG_OFFSET_FIFO_A = 160;
export const REG_OFFSET_FIFO_B = 164;
export const REG_OFFSET_DMA0 = 176;
export const REG_OFFSET_DMA0SAD = 176;
export const REG_OFFSET_DMA0SAD_L = 176;
export const REG_OFFSET_DMA0SAD_H = 178;
export const REG_OFFSET_DMA0DAD = 180;
export const REG_OFFSET_DMA0DAD_L = 180;
export const REG_OFFSET_DMA0DAD_H = 182;
export const REG_OFFSET_DMA0CNT = 184;
export const REG_OFFSET_DMA0CNT_L = 184;
export const REG_OFFSET_DMA0CNT_H = 186;
export const REG_OFFSET_DMA1 = 188;
export const REG_OFFSET_DMA1SAD = 188;
export const REG_OFFSET_DMA1SAD_L = 188;
export const REG_OFFSET_DMA1SAD_H = 190;
export const REG_OFFSET_DMA1DAD = 192;
export const REG_OFFSET_DMA1DAD_L = 192;
export const REG_OFFSET_DMA1DAD_H = 194;
export const REG_OFFSET_DMA1CNT = 196;
export const REG_OFFSET_DMA1CNT_L = 196;
export const REG_OFFSET_DMA1CNT_H = 198;
export const REG_OFFSET_DMA2 = 200;
export const REG_OFFSET_DMA2SAD = 200;
export const REG_OFFSET_DMA2SAD_L = 200;
export const REG_OFFSET_DMA2SAD_H = 202;
export const REG_OFFSET_DMA2DAD = 204;
export const REG_OFFSET_DMA2DAD_L = 204;
export const REG_OFFSET_DMA2DAD_H = 206;
export const REG_OFFSET_DMA2CNT = 208;
export const REG_OFFSET_DMA2CNT_L = 208;
export const REG_OFFSET_DMA2CNT_H = 210;
export const REG_OFFSET_DMA3 = 212;
export const REG_OFFSET_DMA3SAD = 212;
export const REG_OFFSET_DMA3SAD_L = 212;
export const REG_OFFSET_DMA3SAD_H = 214;
export const REG_OFFSET_DMA3DAD = 216;
export const REG_OFFSET_DMA3DAD_L = 216;
export const REG_OFFSET_DMA3DAD_H = 218;
export const REG_OFFSET_DMA3CNT = 220;
export const REG_OFFSET_DMA3CNT_L = 220;
export const REG_OFFSET_DMA3CNT_H = 222;
export const REG_OFFSET_TMCNT = 256;
export const REG_OFFSET_TMCNT_L = 256;
export const REG_OFFSET_TMCNT_H = 258;
export const REG_OFFSET_TM0CNT = 256;
export const REG_OFFSET_TM0CNT_L = 256;
export const REG_OFFSET_TM0CNT_H = 258;
export const REG_OFFSET_TM1CNT = 260;
export const REG_OFFSET_TM1CNT_L = 260;
export const REG_OFFSET_TM1CNT_H = 262;
export const REG_OFFSET_TM2CNT = 264;
export const REG_OFFSET_TM2CNT_L = 264;
export const REG_OFFSET_TM2CNT_H = 266;
export const REG_OFFSET_TM3CNT = 268;
export const REG_OFFSET_TM3CNT_L = 268;
export const REG_OFFSET_TM3CNT_H = 270;
export const REG_OFFSET_SIOCNT = 296;
export const REG_OFFSET_SIODATA8 = 298;
export const REG_OFFSET_SIODATA32 = 288;
export const REG_OFFSET_SIOMLT_SEND = 298;
export const REG_OFFSET_SIOMLT_RECV = 288;
export const REG_OFFSET_SIOMULTI0 = 288;
export const REG_OFFSET_SIOMULTI1 = 290;
export const REG_OFFSET_SIOMULTI2 = 292;
export const REG_OFFSET_SIOMULTI3 = 294;
export const REG_OFFSET_KEYINPUT = 304;
export const REG_OFFSET_KEYCNT = 306;
export const REG_OFFSET_RCNT = 308;
export const REG_OFFSET_JOYCNT = 320;
export const REG_OFFSET_JOYSTAT = 344;
export const REG_OFFSET_JOY_RECV = 336;
export const REG_OFFSET_JOY_RECV_L = 336;
export const REG_OFFSET_JOY_RECV_H = 338;
export const REG_OFFSET_JOY_TRANS = 340;
export const REG_OFFSET_JOY_TRANS_L = 340;
export const REG_OFFSET_JOY_TRANS_H = 342;
export const REG_OFFSET_IME = 520;
export const REG_OFFSET_IE = 512;
export const REG_OFFSET_IF = 514;
export const REG_OFFSET_WAITCNT = 516;
/** Raw expr: `(REG_BASE + REG_OFFSET_DISPCNT)` */
export const REG_ADDR_DISPCNT_EXPR = "(REG_BASE + REG_OFFSET_DISPCNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DISPSTAT)` */
export const REG_ADDR_DISPSTAT_EXPR = "(REG_BASE + REG_OFFSET_DISPSTAT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_VCOUNT)` */
export const REG_ADDR_VCOUNT_EXPR = "(REG_BASE + REG_OFFSET_VCOUNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG0CNT)` */
export const REG_ADDR_BG0CNT_EXPR = "(REG_BASE + REG_OFFSET_BG0CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG1CNT)` */
export const REG_ADDR_BG1CNT_EXPR = "(REG_BASE + REG_OFFSET_BG1CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2CNT)` */
export const REG_ADDR_BG2CNT_EXPR = "(REG_BASE + REG_OFFSET_BG2CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3CNT)` */
export const REG_ADDR_BG3CNT_EXPR = "(REG_BASE + REG_OFFSET_BG3CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG0HOFS)` */
export const REG_ADDR_BG0HOFS_EXPR = "(REG_BASE + REG_OFFSET_BG0HOFS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG0VOFS)` */
export const REG_ADDR_BG0VOFS_EXPR = "(REG_BASE + REG_OFFSET_BG0VOFS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG1HOFS)` */
export const REG_ADDR_BG1HOFS_EXPR = "(REG_BASE + REG_OFFSET_BG1HOFS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG1VOFS)` */
export const REG_ADDR_BG1VOFS_EXPR = "(REG_BASE + REG_OFFSET_BG1VOFS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2HOFS)` */
export const REG_ADDR_BG2HOFS_EXPR = "(REG_BASE + REG_OFFSET_BG2HOFS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2VOFS)` */
export const REG_ADDR_BG2VOFS_EXPR = "(REG_BASE + REG_OFFSET_BG2VOFS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3HOFS)` */
export const REG_ADDR_BG3HOFS_EXPR = "(REG_BASE + REG_OFFSET_BG3HOFS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3VOFS)` */
export const REG_ADDR_BG3VOFS_EXPR = "(REG_BASE + REG_OFFSET_BG3VOFS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2PA)` */
export const REG_ADDR_BG2PA_EXPR = "(REG_BASE + REG_OFFSET_BG2PA)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2PB)` */
export const REG_ADDR_BG2PB_EXPR = "(REG_BASE + REG_OFFSET_BG2PB)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2PC)` */
export const REG_ADDR_BG2PC_EXPR = "(REG_BASE + REG_OFFSET_BG2PC)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2PD)` */
export const REG_ADDR_BG2PD_EXPR = "(REG_BASE + REG_OFFSET_BG2PD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2X)` */
export const REG_ADDR_BG2X_EXPR = "(REG_BASE + REG_OFFSET_BG2X)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2X_L)` */
export const REG_ADDR_BG2X_L_EXPR = "(REG_BASE + REG_OFFSET_BG2X_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2X_H)` */
export const REG_ADDR_BG2X_H_EXPR = "(REG_BASE + REG_OFFSET_BG2X_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2Y)` */
export const REG_ADDR_BG2Y_EXPR = "(REG_BASE + REG_OFFSET_BG2Y)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2Y_L)` */
export const REG_ADDR_BG2Y_L_EXPR = "(REG_BASE + REG_OFFSET_BG2Y_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG2Y_H)` */
export const REG_ADDR_BG2Y_H_EXPR = "(REG_BASE + REG_OFFSET_BG2Y_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3PA)` */
export const REG_ADDR_BG3PA_EXPR = "(REG_BASE + REG_OFFSET_BG3PA)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3PB)` */
export const REG_ADDR_BG3PB_EXPR = "(REG_BASE + REG_OFFSET_BG3PB)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3PC)` */
export const REG_ADDR_BG3PC_EXPR = "(REG_BASE + REG_OFFSET_BG3PC)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3PD)` */
export const REG_ADDR_BG3PD_EXPR = "(REG_BASE + REG_OFFSET_BG3PD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3X)` */
export const REG_ADDR_BG3X_EXPR = "(REG_BASE + REG_OFFSET_BG3X)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3X_L)` */
export const REG_ADDR_BG3X_L_EXPR = "(REG_BASE + REG_OFFSET_BG3X_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3X_H)` */
export const REG_ADDR_BG3X_H_EXPR = "(REG_BASE + REG_OFFSET_BG3X_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3Y)` */
export const REG_ADDR_BG3Y_EXPR = "(REG_BASE + REG_OFFSET_BG3Y)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3Y_L)` */
export const REG_ADDR_BG3Y_L_EXPR = "(REG_BASE + REG_OFFSET_BG3Y_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BG3Y_H)` */
export const REG_ADDR_BG3Y_H_EXPR = "(REG_BASE + REG_OFFSET_BG3Y_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WIN0H)` */
export const REG_ADDR_WIN0H_EXPR = "(REG_BASE + REG_OFFSET_WIN0H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WIN1H)` */
export const REG_ADDR_WIN1H_EXPR = "(REG_BASE + REG_OFFSET_WIN1H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WIN0V)` */
export const REG_ADDR_WIN0V_EXPR = "(REG_BASE + REG_OFFSET_WIN0V)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WIN1V)` */
export const REG_ADDR_WIN1V_EXPR = "(REG_BASE + REG_OFFSET_WIN1V)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WININ)` */
export const REG_ADDR_WININ_EXPR = "(REG_BASE + REG_OFFSET_WININ)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WINOUT)` */
export const REG_ADDR_WINOUT_EXPR = "(REG_BASE + REG_OFFSET_WINOUT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_MOSAIC)` */
export const REG_ADDR_MOSAIC_EXPR = "(REG_BASE + REG_OFFSET_MOSAIC)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BLDCNT)` */
export const REG_ADDR_BLDCNT_EXPR = "(REG_BASE + REG_OFFSET_BLDCNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BLDALPHA)` */
export const REG_ADDR_BLDALPHA_EXPR = "(REG_BASE + REG_OFFSET_BLDALPHA)";
/** Raw expr: `(REG_BASE + REG_OFFSET_BLDY)` */
export const REG_ADDR_BLDY_EXPR = "(REG_BASE + REG_OFFSET_BLDY)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND1CNT_L)` */
export const REG_ADDR_SOUND1CNT_L_EXPR = "(REG_BASE + REG_OFFSET_SOUND1CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR10)` */
export const REG_ADDR_NR10_EXPR = "(REG_BASE + REG_OFFSET_NR10)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND1CNT_H)` */
export const REG_ADDR_SOUND1CNT_H_EXPR = "(REG_BASE + REG_OFFSET_SOUND1CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR11)` */
export const REG_ADDR_NR11_EXPR = "(REG_BASE + REG_OFFSET_NR11)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR12)` */
export const REG_ADDR_NR12_EXPR = "(REG_BASE + REG_OFFSET_NR12)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND1CNT_X)` */
export const REG_ADDR_SOUND1CNT_X_EXPR = "(REG_BASE + REG_OFFSET_SOUND1CNT_X)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR13)` */
export const REG_ADDR_NR13_EXPR = "(REG_BASE + REG_OFFSET_NR13)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR14)` */
export const REG_ADDR_NR14_EXPR = "(REG_BASE + REG_OFFSET_NR14)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND2CNT_L)` */
export const REG_ADDR_SOUND2CNT_L_EXPR = "(REG_BASE + REG_OFFSET_SOUND2CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR21)` */
export const REG_ADDR_NR21_EXPR = "(REG_BASE + REG_OFFSET_NR21)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR22)` */
export const REG_ADDR_NR22_EXPR = "(REG_BASE + REG_OFFSET_NR22)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND2CNT_H)` */
export const REG_ADDR_SOUND2CNT_H_EXPR = "(REG_BASE + REG_OFFSET_SOUND2CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR23)` */
export const REG_ADDR_NR23_EXPR = "(REG_BASE + REG_OFFSET_NR23)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR24)` */
export const REG_ADDR_NR24_EXPR = "(REG_BASE + REG_OFFSET_NR24)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND3CNT_L)` */
export const REG_ADDR_SOUND3CNT_L_EXPR = "(REG_BASE + REG_OFFSET_SOUND3CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR30)` */
export const REG_ADDR_NR30_EXPR = "(REG_BASE + REG_OFFSET_NR30)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND3CNT_H)` */
export const REG_ADDR_SOUND3CNT_H_EXPR = "(REG_BASE + REG_OFFSET_SOUND3CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR31)` */
export const REG_ADDR_NR31_EXPR = "(REG_BASE + REG_OFFSET_NR31)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR32)` */
export const REG_ADDR_NR32_EXPR = "(REG_BASE + REG_OFFSET_NR32)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND3CNT_X)` */
export const REG_ADDR_SOUND3CNT_X_EXPR = "(REG_BASE + REG_OFFSET_SOUND3CNT_X)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR33)` */
export const REG_ADDR_NR33_EXPR = "(REG_BASE + REG_OFFSET_NR33)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR34)` */
export const REG_ADDR_NR34_EXPR = "(REG_BASE + REG_OFFSET_NR34)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND4CNT_L)` */
export const REG_ADDR_SOUND4CNT_L_EXPR = "(REG_BASE + REG_OFFSET_SOUND4CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR41)` */
export const REG_ADDR_NR41_EXPR = "(REG_BASE + REG_OFFSET_NR41)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR42)` */
export const REG_ADDR_NR42_EXPR = "(REG_BASE + REG_OFFSET_NR42)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUND4CNT_H)` */
export const REG_ADDR_SOUND4CNT_H_EXPR = "(REG_BASE + REG_OFFSET_SOUND4CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR43)` */
export const REG_ADDR_NR43_EXPR = "(REG_BASE + REG_OFFSET_NR43)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR44)` */
export const REG_ADDR_NR44_EXPR = "(REG_BASE + REG_OFFSET_NR44)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUNDCNT_L)` */
export const REG_ADDR_SOUNDCNT_L_EXPR = "(REG_BASE + REG_OFFSET_SOUNDCNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR50)` */
export const REG_ADDR_NR50_EXPR = "(REG_BASE + REG_OFFSET_NR50)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR51)` */
export const REG_ADDR_NR51_EXPR = "(REG_BASE + REG_OFFSET_NR51)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUNDCNT_H)` */
export const REG_ADDR_SOUNDCNT_H_EXPR = "(REG_BASE + REG_OFFSET_SOUNDCNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUNDCNT_X)` */
export const REG_ADDR_SOUNDCNT_X_EXPR = "(REG_BASE + REG_OFFSET_SOUNDCNT_X)";
/** Raw expr: `(REG_BASE + REG_OFFSET_NR52)` */
export const REG_ADDR_NR52_EXPR = "(REG_BASE + REG_OFFSET_NR52)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUNDBIAS)` */
export const REG_ADDR_SOUNDBIAS_EXPR = "(REG_BASE + REG_OFFSET_SOUNDBIAS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUNDBIAS_L)` */
export const REG_ADDR_SOUNDBIAS_L_EXPR = "(REG_BASE + REG_OFFSET_SOUNDBIAS_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SOUNDBIAS_H)` */
export const REG_ADDR_SOUNDBIAS_H_EXPR = "(REG_BASE + REG_OFFSET_SOUNDBIAS_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WAVE_RAM0)` */
export const REG_ADDR_WAVE_RAM0_EXPR = "(REG_BASE + REG_OFFSET_WAVE_RAM0)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WAVE_RAM1)` */
export const REG_ADDR_WAVE_RAM1_EXPR = "(REG_BASE + REG_OFFSET_WAVE_RAM1)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WAVE_RAM2)` */
export const REG_ADDR_WAVE_RAM2_EXPR = "(REG_BASE + REG_OFFSET_WAVE_RAM2)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WAVE_RAM3)` */
export const REG_ADDR_WAVE_RAM3_EXPR = "(REG_BASE + REG_OFFSET_WAVE_RAM3)";
/** Raw expr: `(REG_BASE + REG_OFFSET_FIFO_A)` */
export const REG_ADDR_FIFO_A_EXPR = "(REG_BASE + REG_OFFSET_FIFO_A)";
/** Raw expr: `(REG_BASE + REG_OFFSET_FIFO_B)` */
export const REG_ADDR_FIFO_B_EXPR = "(REG_BASE + REG_OFFSET_FIFO_B)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA0)` */
export const REG_ADDR_DMA0_EXPR = "(REG_BASE + REG_OFFSET_DMA0)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA0SAD)` */
export const REG_ADDR_DMA0SAD_EXPR = "(REG_BASE + REG_OFFSET_DMA0SAD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA0DAD)` */
export const REG_ADDR_DMA0DAD_EXPR = "(REG_BASE + REG_OFFSET_DMA0DAD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA0CNT)` */
export const REG_ADDR_DMA0CNT_EXPR = "(REG_BASE + REG_OFFSET_DMA0CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA0CNT_L)` */
export const REG_ADDR_DMA0CNT_L_EXPR = "(REG_BASE + REG_OFFSET_DMA0CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA0CNT_H)` */
export const REG_ADDR_DMA0CNT_H_EXPR = "(REG_BASE + REG_OFFSET_DMA0CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA1)` */
export const REG_ADDR_DMA1_EXPR = "(REG_BASE + REG_OFFSET_DMA1)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA1SAD)` */
export const REG_ADDR_DMA1SAD_EXPR = "(REG_BASE + REG_OFFSET_DMA1SAD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA1DAD)` */
export const REG_ADDR_DMA1DAD_EXPR = "(REG_BASE + REG_OFFSET_DMA1DAD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA1CNT)` */
export const REG_ADDR_DMA1CNT_EXPR = "(REG_BASE + REG_OFFSET_DMA1CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA1CNT_L)` */
export const REG_ADDR_DMA1CNT_L_EXPR = "(REG_BASE + REG_OFFSET_DMA1CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA1CNT_H)` */
export const REG_ADDR_DMA1CNT_H_EXPR = "(REG_BASE + REG_OFFSET_DMA1CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA2)` */
export const REG_ADDR_DMA2_EXPR = "(REG_BASE + REG_OFFSET_DMA2)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA2SAD)` */
export const REG_ADDR_DMA2SAD_EXPR = "(REG_BASE + REG_OFFSET_DMA2SAD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA2DAD)` */
export const REG_ADDR_DMA2DAD_EXPR = "(REG_BASE + REG_OFFSET_DMA2DAD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA2CNT)` */
export const REG_ADDR_DMA2CNT_EXPR = "(REG_BASE + REG_OFFSET_DMA2CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA2CNT_L)` */
export const REG_ADDR_DMA2CNT_L_EXPR = "(REG_BASE + REG_OFFSET_DMA2CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA2CNT_H)` */
export const REG_ADDR_DMA2CNT_H_EXPR = "(REG_BASE + REG_OFFSET_DMA2CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA3)` */
export const REG_ADDR_DMA3_EXPR = "(REG_BASE + REG_OFFSET_DMA3)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA3SAD)` */
export const REG_ADDR_DMA3SAD_EXPR = "(REG_BASE + REG_OFFSET_DMA3SAD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA3DAD)` */
export const REG_ADDR_DMA3DAD_EXPR = "(REG_BASE + REG_OFFSET_DMA3DAD)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA3CNT)` */
export const REG_ADDR_DMA3CNT_EXPR = "(REG_BASE + REG_OFFSET_DMA3CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA3CNT_L)` */
export const REG_ADDR_DMA3CNT_L_EXPR = "(REG_BASE + REG_OFFSET_DMA3CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_DMA3CNT_H)` */
export const REG_ADDR_DMA3CNT_H_EXPR = "(REG_BASE + REG_OFFSET_DMA3CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TMCNT)` */
export const REG_ADDR_TMCNT_EXPR = "(REG_BASE + REG_OFFSET_TMCNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TMCNT_L)` */
export const REG_ADDR_TMCNT_L_EXPR = "(REG_BASE + REG_OFFSET_TMCNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TMCNT_H)` */
export const REG_ADDR_TMCNT_H_EXPR = "(REG_BASE + REG_OFFSET_TMCNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM0CNT)` */
export const REG_ADDR_TM0CNT_EXPR = "(REG_BASE + REG_OFFSET_TM0CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM0CNT_L)` */
export const REG_ADDR_TM0CNT_L_EXPR = "(REG_BASE + REG_OFFSET_TM0CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM0CNT_H)` */
export const REG_ADDR_TM0CNT_H_EXPR = "(REG_BASE + REG_OFFSET_TM0CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM1CNT)` */
export const REG_ADDR_TM1CNT_EXPR = "(REG_BASE + REG_OFFSET_TM1CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM1CNT_L)` */
export const REG_ADDR_TM1CNT_L_EXPR = "(REG_BASE + REG_OFFSET_TM1CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM1CNT_H)` */
export const REG_ADDR_TM1CNT_H_EXPR = "(REG_BASE + REG_OFFSET_TM1CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM2CNT)` */
export const REG_ADDR_TM2CNT_EXPR = "(REG_BASE + REG_OFFSET_TM2CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM2CNT_L)` */
export const REG_ADDR_TM2CNT_L_EXPR = "(REG_BASE + REG_OFFSET_TM2CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM2CNT_H)` */
export const REG_ADDR_TM2CNT_H_EXPR = "(REG_BASE + REG_OFFSET_TM2CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM3CNT)` */
export const REG_ADDR_TM3CNT_EXPR = "(REG_BASE + REG_OFFSET_TM3CNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM3CNT_L)` */
export const REG_ADDR_TM3CNT_L_EXPR = "(REG_BASE + REG_OFFSET_TM3CNT_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_TM3CNT_H)` */
export const REG_ADDR_TM3CNT_H_EXPR = "(REG_BASE + REG_OFFSET_TM3CNT_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SIOCNT)` */
export const REG_ADDR_SIOCNT_EXPR = "(REG_BASE + REG_OFFSET_SIOCNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SIODATA8)` */
export const REG_ADDR_SIODATA8_EXPR = "(REG_BASE + REG_OFFSET_SIODATA8)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SIODATA32)` */
export const REG_ADDR_SIODATA32_EXPR = "(REG_BASE + REG_OFFSET_SIODATA32)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SIOMLT_SEND)` */
export const REG_ADDR_SIOMLT_SEND_EXPR = "(REG_BASE + REG_OFFSET_SIOMLT_SEND)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SIOMLT_RECV)` */
export const REG_ADDR_SIOMLT_RECV_EXPR = "(REG_BASE + REG_OFFSET_SIOMLT_RECV)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SIOMULTI0)` */
export const REG_ADDR_SIOMULTI0_EXPR = "(REG_BASE + REG_OFFSET_SIOMULTI0)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SIOMULTI1)` */
export const REG_ADDR_SIOMULTI1_EXPR = "(REG_BASE + REG_OFFSET_SIOMULTI1)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SIOMULTI2)` */
export const REG_ADDR_SIOMULTI2_EXPR = "(REG_BASE + REG_OFFSET_SIOMULTI2)";
/** Raw expr: `(REG_BASE + REG_OFFSET_SIOMULTI3)` */
export const REG_ADDR_SIOMULTI3_EXPR = "(REG_BASE + REG_OFFSET_SIOMULTI3)";
/** Raw expr: `(REG_BASE + REG_OFFSET_KEYINPUT)` */
export const REG_ADDR_KEYINPUT_EXPR = "(REG_BASE + REG_OFFSET_KEYINPUT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_KEYCNT)` */
export const REG_ADDR_KEYCNT_EXPR = "(REG_BASE + REG_OFFSET_KEYCNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_RCNT)` */
export const REG_ADDR_RCNT_EXPR = "(REG_BASE + REG_OFFSET_RCNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_JOYCNT)` */
export const REG_ADDR_JOYCNT_EXPR = "(REG_BASE + REG_OFFSET_JOYCNT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_JOYSTAT)` */
export const REG_ADDR_JOYSTAT_EXPR = "(REG_BASE + REG_OFFSET_JOYSTAT)";
/** Raw expr: `(REG_BASE + REG_OFFSET_JOY_RECV)` */
export const REG_ADDR_JOY_RECV_EXPR = "(REG_BASE + REG_OFFSET_JOY_RECV)";
/** Raw expr: `(REG_BASE + REG_OFFSET_JOY_RECV_L)` */
export const REG_ADDR_JOY_RECV_L_EXPR = "(REG_BASE + REG_OFFSET_JOY_RECV_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_JOY_RECV_H)` */
export const REG_ADDR_JOY_RECV_H_EXPR = "(REG_BASE + REG_OFFSET_JOY_RECV_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_JOY_TRANS)` */
export const REG_ADDR_JOY_TRANS_EXPR = "(REG_BASE + REG_OFFSET_JOY_TRANS)";
/** Raw expr: `(REG_BASE + REG_OFFSET_JOY_TRANS_L)` */
export const REG_ADDR_JOY_TRANS_L_EXPR = "(REG_BASE + REG_OFFSET_JOY_TRANS_L)";
/** Raw expr: `(REG_BASE + REG_OFFSET_JOY_TRANS_H)` */
export const REG_ADDR_JOY_TRANS_H_EXPR = "(REG_BASE + REG_OFFSET_JOY_TRANS_H)";
/** Raw expr: `(REG_BASE + REG_OFFSET_IME)` */
export const REG_ADDR_IME_EXPR = "(REG_BASE + REG_OFFSET_IME)";
/** Raw expr: `(REG_BASE + REG_OFFSET_IE)` */
export const REG_ADDR_IE_EXPR = "(REG_BASE + REG_OFFSET_IE)";
/** Raw expr: `(REG_BASE + REG_OFFSET_IF)` */
export const REG_ADDR_IF_EXPR = "(REG_BASE + REG_OFFSET_IF)";
/** Raw expr: `(REG_BASE + REG_OFFSET_WAITCNT)` */
export const REG_ADDR_WAITCNT_EXPR = "(REG_BASE + REG_OFFSET_WAITCNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DISPCNT)` */
export const REG_DISPCNT_EXPR = "(*(vu16 *)REG_ADDR_DISPCNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DISPSTAT)` */
export const REG_DISPSTAT_EXPR = "(*(vu16 *)REG_ADDR_DISPSTAT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_VCOUNT)` */
export const REG_VCOUNT_EXPR = "(*(vu16 *)REG_ADDR_VCOUNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG0CNT)` */
export const REG_BG0CNT_EXPR = "(*(vu16 *)REG_ADDR_BG0CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG1CNT)` */
export const REG_BG1CNT_EXPR = "(*(vu16 *)REG_ADDR_BG1CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2CNT)` */
export const REG_BG2CNT_EXPR = "(*(vu16 *)REG_ADDR_BG2CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3CNT)` */
export const REG_BG3CNT_EXPR = "(*(vu16 *)REG_ADDR_BG3CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG0HOFS)` */
export const REG_BG0HOFS_EXPR = "(*(vu16 *)REG_ADDR_BG0HOFS)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG0VOFS)` */
export const REG_BG0VOFS_EXPR = "(*(vu16 *)REG_ADDR_BG0VOFS)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG1HOFS)` */
export const REG_BG1HOFS_EXPR = "(*(vu16 *)REG_ADDR_BG1HOFS)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG1VOFS)` */
export const REG_BG1VOFS_EXPR = "(*(vu16 *)REG_ADDR_BG1VOFS)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2HOFS)` */
export const REG_BG2HOFS_EXPR = "(*(vu16 *)REG_ADDR_BG2HOFS)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2VOFS)` */
export const REG_BG2VOFS_EXPR = "(*(vu16 *)REG_ADDR_BG2VOFS)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3HOFS)` */
export const REG_BG3HOFS_EXPR = "(*(vu16 *)REG_ADDR_BG3HOFS)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3VOFS)` */
export const REG_BG3VOFS_EXPR = "(*(vu16 *)REG_ADDR_BG3VOFS)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2PA)` */
export const REG_BG2PA_EXPR = "(*(vu16 *)REG_ADDR_BG2PA)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2PB)` */
export const REG_BG2PB_EXPR = "(*(vu16 *)REG_ADDR_BG2PB)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2PC)` */
export const REG_BG2PC_EXPR = "(*(vu16 *)REG_ADDR_BG2PC)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2PD)` */
export const REG_BG2PD_EXPR = "(*(vu16 *)REG_ADDR_BG2PD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_BG2X)` */
export const REG_BG2X_EXPR = "(*(vu32 *)REG_ADDR_BG2X)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2X_L)` */
export const REG_BG2X_L_EXPR = "(*(vu16 *)REG_ADDR_BG2X_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2X_H)` */
export const REG_BG2X_H_EXPR = "(*(vu16 *)REG_ADDR_BG2X_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_BG2Y)` */
export const REG_BG2Y_EXPR = "(*(vu32 *)REG_ADDR_BG2Y)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2Y_L)` */
export const REG_BG2Y_L_EXPR = "(*(vu16 *)REG_ADDR_BG2Y_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG2Y_H)` */
export const REG_BG2Y_H_EXPR = "(*(vu16 *)REG_ADDR_BG2Y_H)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3PA)` */
export const REG_BG3PA_EXPR = "(*(vu16 *)REG_ADDR_BG3PA)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3PB)` */
export const REG_BG3PB_EXPR = "(*(vu16 *)REG_ADDR_BG3PB)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3PC)` */
export const REG_BG3PC_EXPR = "(*(vu16 *)REG_ADDR_BG3PC)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3PD)` */
export const REG_BG3PD_EXPR = "(*(vu16 *)REG_ADDR_BG3PD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_BG3X)` */
export const REG_BG3X_EXPR = "(*(vu32 *)REG_ADDR_BG3X)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3X_L)` */
export const REG_BG3X_L_EXPR = "(*(vu16 *)REG_ADDR_BG3X_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3X_H)` */
export const REG_BG3X_H_EXPR = "(*(vu16 *)REG_ADDR_BG3X_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_BG3Y)` */
export const REG_BG3Y_EXPR = "(*(vu32 *)REG_ADDR_BG3Y)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3Y_L)` */
export const REG_BG3Y_L_EXPR = "(*(vu16 *)REG_ADDR_BG3Y_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BG3Y_H)` */
export const REG_BG3Y_H_EXPR = "(*(vu16 *)REG_ADDR_BG3Y_H)";
/** Raw expr: `(*(vu16 *)REG_ADDR_WIN0H)` */
export const REG_WIN0H_EXPR = "(*(vu16 *)REG_ADDR_WIN0H)";
/** Raw expr: `(*(vu16 *)REG_ADDR_WIN1H)` */
export const REG_WIN1H_EXPR = "(*(vu16 *)REG_ADDR_WIN1H)";
/** Raw expr: `(*(vu16 *)REG_ADDR_WIN0V)` */
export const REG_WIN0V_EXPR = "(*(vu16 *)REG_ADDR_WIN0V)";
/** Raw expr: `(*(vu16 *)REG_ADDR_WIN1V)` */
export const REG_WIN1V_EXPR = "(*(vu16 *)REG_ADDR_WIN1V)";
/** Raw expr: `(*(vu16 *)REG_ADDR_WININ)` */
export const REG_WININ_EXPR = "(*(vu16 *)REG_ADDR_WININ)";
/** Raw expr: `(*(vu16 *)REG_ADDR_WINOUT)` */
export const REG_WINOUT_EXPR = "(*(vu16 *)REG_ADDR_WINOUT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_MOSAIC)` */
export const REG_MOSAIC_EXPR = "(*(vu16 *)REG_ADDR_MOSAIC)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BLDCNT)` */
export const REG_BLDCNT_EXPR = "(*(vu16 *)REG_ADDR_BLDCNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BLDALPHA)` */
export const REG_BLDALPHA_EXPR = "(*(vu16 *)REG_ADDR_BLDALPHA)";
/** Raw expr: `(*(vu16 *)REG_ADDR_BLDY)` */
export const REG_BLDY_EXPR = "(*(vu16 *)REG_ADDR_BLDY)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND1CNT_L)` */
export const REG_SOUND1CNT_L_EXPR = "(*(vu16 *)REG_ADDR_SOUND1CNT_L)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR10)` */
export const REG_NR10_EXPR = "(*(vu8  *)REG_ADDR_NR10)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND1CNT_H)` */
export const REG_SOUND1CNT_H_EXPR = "(*(vu16 *)REG_ADDR_SOUND1CNT_H)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR11)` */
export const REG_NR11_EXPR = "(*(vu8  *)REG_ADDR_NR11)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR12)` */
export const REG_NR12_EXPR = "(*(vu8  *)REG_ADDR_NR12)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND1CNT_X)` */
export const REG_SOUND1CNT_X_EXPR = "(*(vu16 *)REG_ADDR_SOUND1CNT_X)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR13)` */
export const REG_NR13_EXPR = "(*(vu8  *)REG_ADDR_NR13)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR14)` */
export const REG_NR14_EXPR = "(*(vu8  *)REG_ADDR_NR14)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND2CNT_L)` */
export const REG_SOUND2CNT_L_EXPR = "(*(vu16 *)REG_ADDR_SOUND2CNT_L)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR21)` */
export const REG_NR21_EXPR = "(*(vu8  *)REG_ADDR_NR21)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR22)` */
export const REG_NR22_EXPR = "(*(vu8  *)REG_ADDR_NR22)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND2CNT_H)` */
export const REG_SOUND2CNT_H_EXPR = "(*(vu16 *)REG_ADDR_SOUND2CNT_H)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR23)` */
export const REG_NR23_EXPR = "(*(vu8  *)REG_ADDR_NR23)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR24)` */
export const REG_NR24_EXPR = "(*(vu8  *)REG_ADDR_NR24)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND3CNT_L)` */
export const REG_SOUND3CNT_L_EXPR = "(*(vu16 *)REG_ADDR_SOUND3CNT_L)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR30)` */
export const REG_NR30_EXPR = "(*(vu8  *)REG_ADDR_NR30)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND3CNT_H)` */
export const REG_SOUND3CNT_H_EXPR = "(*(vu16 *)REG_ADDR_SOUND3CNT_H)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR31)` */
export const REG_NR31_EXPR = "(*(vu8  *)REG_ADDR_NR31)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR32)` */
export const REG_NR32_EXPR = "(*(vu8  *)REG_ADDR_NR32)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND3CNT_X)` */
export const REG_SOUND3CNT_X_EXPR = "(*(vu16 *)REG_ADDR_SOUND3CNT_X)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR33)` */
export const REG_NR33_EXPR = "(*(vu8  *)REG_ADDR_NR33)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR34)` */
export const REG_NR34_EXPR = "(*(vu8  *)REG_ADDR_NR34)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND4CNT_L)` */
export const REG_SOUND4CNT_L_EXPR = "(*(vu16 *)REG_ADDR_SOUND4CNT_L)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR41)` */
export const REG_NR41_EXPR = "(*(vu8  *)REG_ADDR_NR41)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR42)` */
export const REG_NR42_EXPR = "(*(vu8  *)REG_ADDR_NR42)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUND4CNT_H)` */
export const REG_SOUND4CNT_H_EXPR = "(*(vu16 *)REG_ADDR_SOUND4CNT_H)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR43)` */
export const REG_NR43_EXPR = "(*(vu8  *)REG_ADDR_NR43)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR44)` */
export const REG_NR44_EXPR = "(*(vu8  *)REG_ADDR_NR44)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUNDCNT_L)` */
export const REG_SOUNDCNT_L_EXPR = "(*(vu16 *)REG_ADDR_SOUNDCNT_L)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR50)` */
export const REG_NR50_EXPR = "(*(vu8  *)REG_ADDR_NR50)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR51)` */
export const REG_NR51_EXPR = "(*(vu8  *)REG_ADDR_NR51)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUNDCNT_H)` */
export const REG_SOUNDCNT_H_EXPR = "(*(vu16 *)REG_ADDR_SOUNDCNT_H)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUNDCNT_X)` */
export const REG_SOUNDCNT_X_EXPR = "(*(vu16 *)REG_ADDR_SOUNDCNT_X)";
/** Raw expr: `(*(vu8  *)REG_ADDR_NR52)` */
export const REG_NR52_EXPR = "(*(vu8  *)REG_ADDR_NR52)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SOUNDBIAS)` */
export const REG_SOUNDBIAS_EXPR = "(*(vu16 *)REG_ADDR_SOUNDBIAS)";
/** Raw expr: `(*(vu8  *)REG_ADDR_SOUNDBIAS_L)` */
export const REG_SOUNDBIAS_L_EXPR = "(*(vu8  *)REG_ADDR_SOUNDBIAS_L)";
/** Raw expr: `(*(vu8  *)REG_ADDR_SOUNDBIAS_H)` */
export const REG_SOUNDBIAS_H_EXPR = "(*(vu8  *)REG_ADDR_SOUNDBIAS_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_WAVE_RAM0)` */
export const REG_WAVE_RAM0_EXPR = "(*(vu32 *)REG_ADDR_WAVE_RAM0)";
/** Raw expr: `(*(vu32 *)REG_ADDR_WAVE_RAM1)` */
export const REG_WAVE_RAM1_EXPR = "(*(vu32 *)REG_ADDR_WAVE_RAM1)";
/** Raw expr: `(*(vu32 *)REG_ADDR_WAVE_RAM2)` */
export const REG_WAVE_RAM2_EXPR = "(*(vu32 *)REG_ADDR_WAVE_RAM2)";
/** Raw expr: `(*(vu32 *)REG_ADDR_WAVE_RAM3)` */
export const REG_WAVE_RAM3_EXPR = "(*(vu32 *)REG_ADDR_WAVE_RAM3)";
/** Raw expr: `(*(vu32 *)REG_ADDR_FIFO_A)` */
export const REG_FIFO_A_EXPR = "(*(vu32 *)REG_ADDR_FIFO_A)";
/** Raw expr: `(*(vu32 *)REG_ADDR_FIFO_B)` */
export const REG_FIFO_B_EXPR = "(*(vu32 *)REG_ADDR_FIFO_B)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA0SAD)` */
export const REG_DMA0SAD_EXPR = "(*(vu32 *)REG_ADDR_DMA0SAD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA0DAD)` */
export const REG_DMA0DAD_EXPR = "(*(vu32 *)REG_ADDR_DMA0DAD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA0CNT)` */
export const REG_DMA0CNT_EXPR = "(*(vu32 *)REG_ADDR_DMA0CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DMA0CNT_L)` */
export const REG_DMA0CNT_L_EXPR = "(*(vu16 *)REG_ADDR_DMA0CNT_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DMA0CNT_H)` */
export const REG_DMA0CNT_H_EXPR = "(*(vu16 *)REG_ADDR_DMA0CNT_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA1SAD)` */
export const REG_DMA1SAD_EXPR = "(*(vu32 *)REG_ADDR_DMA1SAD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA1DAD)` */
export const REG_DMA1DAD_EXPR = "(*(vu32 *)REG_ADDR_DMA1DAD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA1CNT)` */
export const REG_DMA1CNT_EXPR = "(*(vu32 *)REG_ADDR_DMA1CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DMA1CNT_L)` */
export const REG_DMA1CNT_L_EXPR = "(*(vu16 *)REG_ADDR_DMA1CNT_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DMA1CNT_H)` */
export const REG_DMA1CNT_H_EXPR = "(*(vu16 *)REG_ADDR_DMA1CNT_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA2SAD)` */
export const REG_DMA2SAD_EXPR = "(*(vu32 *)REG_ADDR_DMA2SAD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA2DAD)` */
export const REG_DMA2DAD_EXPR = "(*(vu32 *)REG_ADDR_DMA2DAD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA2CNT)` */
export const REG_DMA2CNT_EXPR = "(*(vu32 *)REG_ADDR_DMA2CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DMA2CNT_L)` */
export const REG_DMA2CNT_L_EXPR = "(*(vu16 *)REG_ADDR_DMA2CNT_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DMA2CNT_H)` */
export const REG_DMA2CNT_H_EXPR = "(*(vu16 *)REG_ADDR_DMA2CNT_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA3SAD)` */
export const REG_DMA3SAD_EXPR = "(*(vu32 *)REG_ADDR_DMA3SAD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA3DAD)` */
export const REG_DMA3DAD_EXPR = "(*(vu32 *)REG_ADDR_DMA3DAD)";
/** Raw expr: `(*(vu32 *)REG_ADDR_DMA3CNT)` */
export const REG_DMA3CNT_EXPR = "(*(vu32 *)REG_ADDR_DMA3CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DMA3CNT_L)` */
export const REG_DMA3CNT_L_EXPR = "(*(vu16 *)REG_ADDR_DMA3CNT_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_DMA3CNT_H)` */
export const REG_DMA3CNT_H_EXPR = "(*(vu16 *)REG_ADDR_DMA3CNT_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_TM0CNT)` */
export const REG_TM0CNT_EXPR = "(*(vu32 *)REG_ADDR_TM0CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_TM0CNT_L)` */
export const REG_TM0CNT_L_EXPR = "(*(vu16 *)REG_ADDR_TM0CNT_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_TM0CNT_H)` */
export const REG_TM0CNT_H_EXPR = "(*(vu16 *)REG_ADDR_TM0CNT_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_TM1CNT)` */
export const REG_TM1CNT_EXPR = "(*(vu32 *)REG_ADDR_TM1CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_TM1CNT_L)` */
export const REG_TM1CNT_L_EXPR = "(*(vu16 *)REG_ADDR_TM1CNT_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_TM1CNT_H)` */
export const REG_TM1CNT_H_EXPR = "(*(vu16 *)REG_ADDR_TM1CNT_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_TM2CNT)` */
export const REG_TM2CNT_EXPR = "(*(vu32 *)REG_ADDR_TM2CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_TM2CNT_L)` */
export const REG_TM2CNT_L_EXPR = "(*(vu16 *)REG_ADDR_TM2CNT_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_TM2CNT_H)` */
export const REG_TM2CNT_H_EXPR = "(*(vu16 *)REG_ADDR_TM2CNT_H)";
/** Raw expr: `(*(vu32 *)REG_ADDR_TM3CNT)` */
export const REG_TM3CNT_EXPR = "(*(vu32 *)REG_ADDR_TM3CNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_TM3CNT_L)` */
export const REG_TM3CNT_L_EXPR = "(*(vu16 *)REG_ADDR_TM3CNT_L)";
/** Raw expr: `(*(vu16 *)REG_ADDR_TM3CNT_H)` */
export const REG_TM3CNT_H_EXPR = "(*(vu16 *)REG_ADDR_TM3CNT_H)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SIOCNT)` */
export const REG_SIOCNT_EXPR = "(*(vu16 *)REG_ADDR_SIOCNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SIODATA8)` */
export const REG_SIODATA8_EXPR = "(*(vu16 *)REG_ADDR_SIODATA8)";
/** Raw expr: `(*(vu32 *)REG_ADDR_SIODATA32)` */
export const REG_SIODATA32_EXPR = "(*(vu32 *)REG_ADDR_SIODATA32)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SIOMLT_SEND)` */
export const REG_SIOMLT_SEND_EXPR = "(*(vu16 *)REG_ADDR_SIOMLT_SEND)";
/** Raw expr: `(*(vu64 *)REG_ADDR_SIOMLT_RECV)` */
export const REG_SIOMLT_RECV_EXPR = "(*(vu64 *)REG_ADDR_SIOMLT_RECV)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SIOMULTI0)` */
export const REG_SIOMULTI0_EXPR = "(*(vu16 *)REG_ADDR_SIOMULTI0)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SIOMULTI1)` */
export const REG_SIOMULTI1_EXPR = "(*(vu16 *)REG_ADDR_SIOMULTI1)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SIOMULTI2)` */
export const REG_SIOMULTI2_EXPR = "(*(vu16 *)REG_ADDR_SIOMULTI2)";
/** Raw expr: `(*(vu16 *)REG_ADDR_SIOMULTI3)` */
export const REG_SIOMULTI3_EXPR = "(*(vu16 *)REG_ADDR_SIOMULTI3)";
/** Raw expr: `(*(vu16 *)REG_ADDR_KEYINPUT)` */
export const REG_KEYINPUT_EXPR = "(*(vu16 *)REG_ADDR_KEYINPUT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_KEYCNT)` */
export const REG_KEYCNT_EXPR = "(*(vu16 *)REG_ADDR_KEYCNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_RCNT)` */
export const REG_RCNT_EXPR = "(*(vu16 *)REG_ADDR_RCNT)";
/** Raw expr: `(*(vu16 *)REG_ADDR_IME)` */
export const REG_IME_EXPR = "(*(vu16 *)REG_ADDR_IME)";
/** Raw expr: `(*(vu16 *)REG_ADDR_IE)` */
export const REG_IE_EXPR = "(*(vu16 *)REG_ADDR_IE)";
/** Raw expr: `(*(vu16 *)REG_ADDR_IF)` */
export const REG_IF_EXPR = "(*(vu16 *)REG_ADDR_IF)";
/** Raw expr: `(*(vu16 *)REG_ADDR_WAITCNT)` */
export const REG_WAITCNT_EXPR = "(*(vu16 *)REG_ADDR_WAITCNT)";
export const DISPCNT_MODE_0 = 0;
export const DISPCNT_MODE_1 = 1;
export const DISPCNT_MODE_2 = 2;
export const DISPCNT_MODE_3 = 3;
export const DISPCNT_MODE_4 = 4;
export const DISPCNT_MODE_5 = 5;
export const DISPCNT_HBLANK_INTERVAL = 32;
export const DISPCNT_OBJ_1D_MAP = 64;
export const DISPCNT_FORCED_BLANK = 128;
export const DISPCNT_BG0_ON = 256;
export const DISPCNT_BG1_ON = 512;
export const DISPCNT_BG2_ON = 1024;
export const DISPCNT_BG3_ON = 2048;
export const DISPCNT_BG_ALL_ON = 3840;
export const DISPCNT_OBJ_ON = 4096;
export const DISPCNT_WIN0_ON = 8192;
export const DISPCNT_WIN1_ON = 16384;
export const DISPCNT_OBJWIN_ON = 32768;
export const DISPSTAT_VBLANK = 1;
export const DISPSTAT_HBLANK = 2;
export const DISPSTAT_VCOUNT = 4;
export const DISPSTAT_VBLANK_INTR = 8;
export const DISPSTAT_HBLANK_INTR = 16;
export const DISPSTAT_VCOUNT_INTR = 32;
export const BGCNT_MOSAIC = 64;
export const BGCNT_16COLOR = 0;
export const BGCNT_256COLOR = 128;
export const BGCNT_WRAP = 8192;
export const BGCNT_TXT256x256 = 0;
export const BGCNT_TXT512x256 = 16384;
export const BGCNT_TXT256x512 = 32768;
export const BGCNT_TXT512x512 = 49152;
export const BGCNT_AFF128x128 = 0;
export const BGCNT_AFF256x256 = 16384;
export const BGCNT_AFF512x512 = 32768;
export const BGCNT_AFF1024x1024 = 49152;
/** Raw expr: `(1 << 0)` */
export const WININ_WIN0_BG0_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const WININ_WIN0_BG1_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const WININ_WIN0_BG2_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const WININ_WIN0_BG3_EXPR = "(1 << 3)";
/** Raw expr: `(WININ_WIN0_BG0 | WININ_WIN0_BG1 | WININ_WIN0_BG2 | WININ_WIN0_BG3)` */
export const WININ_WIN0_BG_ALL_EXPR = "(WININ_WIN0_BG0 | WININ_WIN0_BG1 | WININ_WIN0_BG2 | WININ_WIN0_BG3)";
/** Raw expr: `(1 << 4)` */
export const WININ_WIN0_OBJ_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const WININ_WIN0_CLR_EXPR = "(1 << 5)";
/** Raw expr: `(WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR)` */
export const WININ_WIN0_ALL_EXPR = "(WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR)";
/** Raw expr: `(1 << 8)` */
export const WININ_WIN1_BG0_EXPR = "(1 << 8)";
/** Raw expr: `(1 << 9)` */
export const WININ_WIN1_BG1_EXPR = "(1 << 9)";
/** Raw expr: `(1 << 10)` */
export const WININ_WIN1_BG2_EXPR = "(1 << 10)";
/** Raw expr: `(1 << 11)` */
export const WININ_WIN1_BG3_EXPR = "(1 << 11)";
/** Raw expr: `(WININ_WIN1_BG0 | WININ_WIN1_BG1 | WININ_WIN1_BG2 | WININ_WIN1_BG3)` */
export const WININ_WIN1_BG_ALL_EXPR = "(WININ_WIN1_BG0 | WININ_WIN1_BG1 | WININ_WIN1_BG2 | WININ_WIN1_BG3)";
/** Raw expr: `(1 << 12)` */
export const WININ_WIN1_OBJ_EXPR = "(1 << 12)";
/** Raw expr: `(1 << 13)` */
export const WININ_WIN1_CLR_EXPR = "(1 << 13)";
/** Raw expr: `(WININ_WIN1_BG_ALL | WININ_WIN1_OBJ | WININ_WIN1_CLR)` */
export const WININ_WIN1_ALL_EXPR = "(WININ_WIN1_BG_ALL | WININ_WIN1_OBJ | WININ_WIN1_CLR)";
/** Raw expr: `(1 << 0)` */
export const WINOUT_WIN01_BG0_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const WINOUT_WIN01_BG1_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const WINOUT_WIN01_BG2_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const WINOUT_WIN01_BG3_EXPR = "(1 << 3)";
/** Raw expr: `(WINOUT_WIN01_BG0 | WINOUT_WIN01_BG1 | WINOUT_WIN01_BG2 | WINOUT_WIN01_BG3)` */
export const WINOUT_WIN01_BG_ALL_EXPR = "(WINOUT_WIN01_BG0 | WINOUT_WIN01_BG1 | WINOUT_WIN01_BG2 | WINOUT_WIN01_BG3)";
/** Raw expr: `(1 << 4)` */
export const WINOUT_WIN01_OBJ_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const WINOUT_WIN01_CLR_EXPR = "(1 << 5)";
/** Raw expr: `(WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR)` */
export const WINOUT_WIN01_ALL_EXPR = "(WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR)";
/** Raw expr: `(1 << 8)` */
export const WINOUT_WINOBJ_BG0_EXPR = "(1 << 8)";
/** Raw expr: `(1 << 9)` */
export const WINOUT_WINOBJ_BG1_EXPR = "(1 << 9)";
/** Raw expr: `(1 << 10)` */
export const WINOUT_WINOBJ_BG2_EXPR = "(1 << 10)";
/** Raw expr: `(1 << 11)` */
export const WINOUT_WINOBJ_BG3_EXPR = "(1 << 11)";
/** Raw expr: `(WINOUT_WINOBJ_BG0 | WINOUT_WINOBJ_BG1 | WINOUT_WINOBJ_BG2 | WINOUT_WINOBJ_BG3)` */
export const WINOUT_WINOBJ_BG_ALL_EXPR = "(WINOUT_WINOBJ_BG0 | WINOUT_WINOBJ_BG1 | WINOUT_WINOBJ_BG2 | WINOUT_WINOBJ_BG3)";
/** Raw expr: `(1 << 12)` */
export const WINOUT_WINOBJ_OBJ_EXPR = "(1 << 12)";
/** Raw expr: `(1 << 13)` */
export const WINOUT_WINOBJ_CLR_EXPR = "(1 << 13)";
/** Raw expr: `(WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR)` */
export const WINOUT_WINOBJ_ALL_EXPR = "(WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR)";
/** Raw expr: `(1 << 0)` */
export const BLDCNT_TGT1_BG0_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const BLDCNT_TGT1_BG1_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const BLDCNT_TGT1_BG2_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const BLDCNT_TGT1_BG3_EXPR = "(1 << 3)";
/** Raw expr: `(BLDCNT_TGT1_BG0 | BLDCNT_TGT1_BG1 | BLDCNT_TGT1_BG2 | BLDCNT_TGT1_BG3)` */
export const BLDCNT_TGT1_BG_ALL_EXPR = "(BLDCNT_TGT1_BG0 | BLDCNT_TGT1_BG1 | BLDCNT_TGT1_BG2 | BLDCNT_TGT1_BG3)";
/** Raw expr: `(1 << 4)` */
export const BLDCNT_TGT1_OBJ_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const BLDCNT_TGT1_BD_EXPR = "(1 << 5)";
/** Raw expr: `(BLDCNT_TGT1_BG_ALL | BLDCNT_TGT1_OBJ | BLDCNT_TGT1_BD)` */
export const BLDCNT_TGT1_ALL_EXPR = "(BLDCNT_TGT1_BG_ALL | BLDCNT_TGT1_OBJ | BLDCNT_TGT1_BD)";
/** Raw expr: `(0 << 6)` */
export const BLDCNT_EFFECT_NONE_EXPR = "(0 << 6)";
/** Raw expr: `(1 << 6)` */
export const BLDCNT_EFFECT_BLEND_EXPR = "(1 << 6)";
/** Raw expr: `(2 << 6)` */
export const BLDCNT_EFFECT_LIGHTEN_EXPR = "(2 << 6)";
/** Raw expr: `(3 << 6)` */
export const BLDCNT_EFFECT_DARKEN_EXPR = "(3 << 6)";
/** Raw expr: `(1 << 8)` */
export const BLDCNT_TGT2_BG0_EXPR = "(1 << 8)";
/** Raw expr: `(1 << 9)` */
export const BLDCNT_TGT2_BG1_EXPR = "(1 << 9)";
/** Raw expr: `(1 << 10)` */
export const BLDCNT_TGT2_BG2_EXPR = "(1 << 10)";
/** Raw expr: `(1 << 11)` */
export const BLDCNT_TGT2_BG3_EXPR = "(1 << 11)";
/** Raw expr: `(BLDCNT_TGT2_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_BG2 | BLDCNT_TGT2_BG3)` */
export const BLDCNT_TGT2_BG_ALL_EXPR = "(BLDCNT_TGT2_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_BG2 | BLDCNT_TGT2_BG3)";
/** Raw expr: `(1 << 12)` */
export const BLDCNT_TGT2_OBJ_EXPR = "(1 << 12)";
/** Raw expr: `(1 << 13)` */
export const BLDCNT_TGT2_BD_EXPR = "(1 << 13)";
/** Raw expr: `(BLDCNT_TGT2_BG_ALL | BLDCNT_TGT2_OBJ | BLDCNT_TGT2_BD)` */
export const BLDCNT_TGT2_ALL_EXPR = "(BLDCNT_TGT2_BG_ALL | BLDCNT_TGT2_OBJ | BLDCNT_TGT2_BD)";
export const SOUND_CGB_MIX_QUARTER = 0;
export const SOUND_CGB_MIX_HALF = 1;
export const SOUND_CGB_MIX_FULL = 2;
export const SOUND_A_MIX_HALF = 0;
export const SOUND_A_MIX_FULL = 4;
export const SOUND_B_MIX_HALF = 0;
export const SOUND_B_MIX_FULL = 8;
export const SOUND_ALL_MIX_FULL = 14;
export const SOUND_A_RIGHT_OUTPUT = 256;
export const SOUND_A_LEFT_OUTPUT = 512;
export const SOUND_A_TIMER_0 = 0;
export const SOUND_A_TIMER_1 = 1024;
export const SOUND_A_FIFO_RESET = 2048;
export const SOUND_B_RIGHT_OUTPUT = 4096;
export const SOUND_B_LEFT_OUTPUT = 8192;
export const SOUND_B_TIMER_0 = 0;
export const SOUND_B_TIMER_1 = 16384;
export const SOUND_B_FIFO_RESET = 32768;
export const SOUND_1_ON = 1;
export const SOUND_2_ON = 2;
export const SOUND_3_ON = 4;
export const SOUND_4_ON = 8;
export const SOUND_MASTER_ENABLE = 128;
export const DMA_DEST_INC = 0;
export const DMA_DEST_DEC = 32;
export const DMA_DEST_FIXED = 64;
export const DMA_DEST_RELOAD = 96;
export const DMA_SRC_INC = 0;
export const DMA_SRC_DEC = 128;
export const DMA_SRC_FIXED = 256;
export const DMA_REPEAT = 512;
export const DMA_16BIT = 0;
export const DMA_32BIT = 1024;
export const DMA_DREQ_ON = 2048;
export const DMA_START_NOW = 0;
export const DMA_START_VBLANK = 4096;
export const DMA_START_HBLANK = 8192;
export const DMA_START_SPECIAL = 12288;
export const DMA_START_MASK = 12288;
export const DMA_INTR_ENABLE = 16384;
export const DMA_ENABLE = 32768;
export const TIMER_1CLK = 0;
export const TIMER_64CLK = 1;
export const TIMER_256CLK = 2;
export const TIMER_1024CLK = 3;
export const TIMER_INTR_ENABLE = 64;
export const TIMER_ENABLE = 128;
export const SIO_ID = 48;
export const SIO_8BIT_MODE = 0;
export const SIO_32BIT_MODE = 4096;
export const SIO_MULTI_MODE = 8192;
export const SIO_UART_MODE = 12288;
export const SIO_9600_BPS = 0;
export const SIO_38400_BPS = 1;
export const SIO_57600_BPS = 2;
export const SIO_115200_BPS = 3;
export const SIO_MULTI_SI = 4;
export const SIO_MULTI_SD = 8;
export const SIO_MULTI_BUSY = 128;
export const SIO_ERROR = 64;
export const SIO_START = 128;
export const SIO_ENABLE = 128;
export const SIO_INTR_ENABLE = 16384;
export const SIO_MULTI_SI_SHIFT = 2;
export const SIO_MULTI_SI_MASK = 1;
export const SIO_MULTI_DI_SHIFT = 3;
export const SIO_MULTI_DI_MASK = 1;
export const A_BUTTON = 1;
export const B_BUTTON = 2;
export const SELECT_BUTTON = 4;
export const START_BUTTON = 8;
export const DPAD_RIGHT = 16;
export const DPAD_LEFT = 32;
export const DPAD_UP = 64;
export const DPAD_DOWN = 128;
export const R_BUTTON = 256;
export const L_BUTTON = 512;
export const KEYS_MASK = 1023;
export const KEY_INTR_ENABLE = 16384;
export const KEY_OR_INTR = 0;
export const KEY_AND_INTR = 32768;
/** Raw expr: `((DPAD_RIGHT | DPAD_LEFT | DPAD_UP | DPAD_DOWN))` */
export const DPAD_ANY_EXPR = "((DPAD_RIGHT | DPAD_LEFT | DPAD_UP | DPAD_DOWN))";
export const JOY_EXCL_DPAD = 783;
/** Raw expr: `(1 <<  0)` */
export const INTR_FLAG_VBLANK_EXPR = "(1 <<  0)";
/** Raw expr: `(1 <<  1)` */
export const INTR_FLAG_HBLANK_EXPR = "(1 <<  1)";
/** Raw expr: `(1 <<  2)` */
export const INTR_FLAG_VCOUNT_EXPR = "(1 <<  2)";
/** Raw expr: `(1 <<  3)` */
export const INTR_FLAG_TIMER0_EXPR = "(1 <<  3)";
/** Raw expr: `(1 <<  4)` */
export const INTR_FLAG_TIMER1_EXPR = "(1 <<  4)";
/** Raw expr: `(1 <<  5)` */
export const INTR_FLAG_TIMER2_EXPR = "(1 <<  5)";
/** Raw expr: `(1 <<  6)` */
export const INTR_FLAG_TIMER3_EXPR = "(1 <<  6)";
/** Raw expr: `(1 <<  7)` */
export const INTR_FLAG_SERIAL_EXPR = "(1 <<  7)";
/** Raw expr: `(1 <<  8)` */
export const INTR_FLAG_DMA0_EXPR = "(1 <<  8)";
/** Raw expr: `(1 <<  9)` */
export const INTR_FLAG_DMA1_EXPR = "(1 <<  9)";
/** Raw expr: `(1 << 10)` */
export const INTR_FLAG_DMA2_EXPR = "(1 << 10)";
/** Raw expr: `(1 << 11)` */
export const INTR_FLAG_DMA3_EXPR = "(1 << 11)";
/** Raw expr: `(1 << 12)` */
export const INTR_FLAG_KEYPAD_EXPR = "(1 << 12)";
/** Raw expr: `(1 << 13)` */
export const INTR_FLAG_GAMEPAK_EXPR = "(1 << 13)";
/** Raw expr: `(0 << 0)` */
export const WAITCNT_SRAM_4_EXPR = "(0 << 0)";
/** Raw expr: `(1 << 0)` */
export const WAITCNT_SRAM_3_EXPR = "(1 << 0)";
/** Raw expr: `(2 << 0)` */
export const WAITCNT_SRAM_2_EXPR = "(2 << 0)";
/** Raw expr: `(3 << 0)` */
export const WAITCNT_SRAM_8_EXPR = "(3 << 0)";
/** Raw expr: `(3 << 0)` */
export const WAITCNT_SRAM_MASK_EXPR = "(3 << 0)";
/** Raw expr: `(0 << 2)` */
export const WAITCNT_WS0_N_4_EXPR = "(0 << 2)";
/** Raw expr: `(1 << 2)` */
export const WAITCNT_WS0_N_3_EXPR = "(1 << 2)";
/** Raw expr: `(2 << 2)` */
export const WAITCNT_WS0_N_2_EXPR = "(2 << 2)";
/** Raw expr: `(3 << 2)` */
export const WAITCNT_WS0_N_8_EXPR = "(3 << 2)";
/** Raw expr: `(3 << 2)` */
export const WAITCNT_WS0_N_MASK_EXPR = "(3 << 2)";
/** Raw expr: `(0 << 4)` */
export const WAITCNT_WS0_S_2_EXPR = "(0 << 4)";
/** Raw expr: `(1 << 4)` */
export const WAITCNT_WS0_S_1_EXPR = "(1 << 4)";
/** Raw expr: `(0 << 5)` */
export const WAITCNT_WS1_N_4_EXPR = "(0 << 5)";
/** Raw expr: `(1 << 5)` */
export const WAITCNT_WS1_N_3_EXPR = "(1 << 5)";
/** Raw expr: `(2 << 5)` */
export const WAITCNT_WS1_N_2_EXPR = "(2 << 5)";
/** Raw expr: `(3 << 5)` */
export const WAITCNT_WS1_N_8_EXPR = "(3 << 5)";
/** Raw expr: `(3 << 5)` */
export const WAITCNT_WS1_N_MASK_EXPR = "(3 << 5)";
/** Raw expr: `(0 << 7)` */
export const WAITCNT_WS1_S_4_EXPR = "(0 << 7)";
/** Raw expr: `(1 << 7)` */
export const WAITCNT_WS1_S_1_EXPR = "(1 << 7)";
/** Raw expr: `(0 << 8)` */
export const WAITCNT_WS2_N_4_EXPR = "(0 << 8)";
/** Raw expr: `(1 << 8)` */
export const WAITCNT_WS2_N_3_EXPR = "(1 << 8)";
/** Raw expr: `(2 << 8)` */
export const WAITCNT_WS2_N_2_EXPR = "(2 << 8)";
/** Raw expr: `(3 << 8)` */
export const WAITCNT_WS2_N_8_EXPR = "(3 << 8)";
/** Raw expr: `(3 << 8)` */
export const WAITCNT_WS2_N_MASK_EXPR = "(3 << 8)";
/** Raw expr: `(0 << 10)` */
export const WAITCNT_WS2_S_8_EXPR = "(0 << 10)";
/** Raw expr: `(1 << 10)` */
export const WAITCNT_WS2_S_1_EXPR = "(1 << 10)";
/** Raw expr: `(0 << 11)` */
export const WAITCNT_PHI_OUT_NONE_EXPR = "(0 << 11)";
/** Raw expr: `(1 << 11)` */
export const WAITCNT_PHI_OUT_4MHZ_EXPR = "(1 << 11)";
/** Raw expr: `(2 << 11)` */
export const WAITCNT_PHI_OUT_8MHZ_EXPR = "(2 << 11)";
/** Raw expr: `(3 << 11)` */
export const WAITCNT_PHI_OUT_16MHZ_EXPR = "(3 << 11)";
/** Raw expr: `(3 << 11)` */
export const WAITCNT_PHI_OUT_MASK_EXPR = "(3 << 11)";
/** Raw expr: `(1 << 14)` */
export const WAITCNT_PREFETCH_ENABLE_EXPR = "(1 << 14)";
/** Raw expr: `(0 << 15)` */
export const WAITCNT_AGB_EXPR = "(0 << 15)";
/** Raw expr: `(1 << 15)` */
export const WAITCNT_CGB_EXPR = "(1 << 15)";
