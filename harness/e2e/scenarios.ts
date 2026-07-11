/**
 * harness/e2e/scenarios.ts — scénarios E2E pilotes (v1).
 *
 * Chaque scénario = préconditions documentées (boot) + étapes + assertions.
 * Conventions : les étapes doivent être ROBUSTES aux vitesses variables
 * (until/frames, jamais de sleep aveugle long) et chaque assertion nomme ce
 * qu'elle vérifie (le rapport doit se lire sans contexte).
 *
 * Pilotes v1 : le boot → overworld (le chemin critique absolu) et
 * l'ouverture du menu Start + sac (navigation UI type). Les chantiers à
 * venir (Pokénav, contests, frontier) ajouteront les leurs ici.
 */
import { e2e, registerScenario } from './runner';

registerScenario({
  id: 'boot-overworld',
  description: 'Boot (?nointro, save existante) → overworld : CB2, BGM natif, écran rendu, zéro erreur console.',
  boot: '?nointro (avec une save valide — le poll autoboot du harness)',
  steps: [
    {
      name: 'attendre l\'overworld (MainCB2_Overworld2)',
      run: async (ctx) => {
        await ctx.until('cb2 = MainCB2_Overworld2', () => e2e.cb2Name() === 'MainCB2_Overworld2', 30000);
      },
    },
    {
      name: 'le jeu tourne (60 frames s\'écoulent)',
      run: async (ctx) => {
        await ctx.frames(60);
      },
    },
    {
      name: 'le BGM natif joue',
      run: async (ctx) => {
        await ctx.until('BGM actif', () => e2e.bgmPlaying(), 10000);
        ctx.note(`songHeader=0x${e2e.bgmSongHeader()}`);
      },
    },
    {
      name: 'l\'écran rend (pas noir)',
      run: (ctx) => {
        ctx.assert(e2e.screenNotBlack(), 'canvas uniformément noir');
      },
    },
  ],
});

registerScenario({
  id: 'menu-sac',
  description: 'Depuis l\'overworld : Start → menu → SAC → l\'écran sac s\'ouvre → retour overworld.',
  boot: 'depuis boot-overworld (l\'overworld doit être actif)',
  steps: [
    {
      name: 'précondition : overworld actif',
      run: (ctx) => {
        ctx.assert(e2e.cb2Name() === 'MainCB2_Overworld2', `cb2=${e2e.cb2Name()} (lancer boot-overworld d\'abord)`);
      },
    },
    {
      name: 'ouvrir le menu Start',
      run: async (ctx) => {
        await ctx.press('start');
        // Le menu Start est une fenêtre overworld (pas de changement de CB2) :
        // on vérifie qu'une task de plus est active (Task_ShowStartMenu).
        await ctx.frames(20);
      },
    },
    {
      name: 'naviguer vers SAC et ouvrir',
      run: async (ctx) => {
        // Ordre du menu : Pokédex, Pokémon, SAC… (selon les flags de la save).
        // Descente robuste : on cherche le CB2 du sac en essayant les positions.
        for (let i = 0; i < 6 && e2e.cb2Name() !== 'CB2_BagMenuRun'; i++) {
          await ctx.press('down');
          await ctx.frames(6);
          await ctx.press('a');
          await ctx.until('transition', () => true, 100);
          await ctx.frames(30);
          if (e2e.cb2Name() === 'CB2_BagMenuRun') break;
          // Pas le sac : si on a quitté l'overworld pour un autre écran, B pour revenir.
          if (e2e.cb2Name() !== 'MainCB2_Overworld2') {
            await ctx.press('b');
            await ctx.until('retour overworld', () => e2e.cb2Name() === 'MainCB2_Overworld2', 15000);
            await ctx.press('start');
            await ctx.frames(20);
          }
        }
        ctx.assert(e2e.cb2Name() === 'CB2_BagMenuRun', `sac non ouvert (cb2=${e2e.cb2Name()})`);
        ctx.assert(e2e.screenNotBlack(), 'écran sac noir');
      },
    },
    {
      name: 'refermer et revenir à l\'overworld',
      run: async (ctx) => {
        await ctx.press('b');
        await ctx.until('retour overworld', () => e2e.cb2Name() === 'MainCB2_Overworld2', 20000);
        await ctx.press('b'); // ferme le menu Start résiduel
        await ctx.frames(10);
      },
    },
  ],
});
