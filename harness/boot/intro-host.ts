/**
 * intro-host.ts — boot de la séquence intro 1:1 décomp, réutilisable par n'importe
 * quelle scène hôte tenant un DecompRuntime.
 *
 * Chantier « c » (fusion runtimes) Step 2.1 (cf. docs/RUNTIME-MERGE-PLAN.md) : extrait
 * de GameScene.create()/bootIntro() pour que la scène hôte UNIQUE puisse lancer l'intro
 * dans SON runtime, puis enchaîner l'overworld via SetMainCallback2 (sans changement de
 * scène, = 1:1 décomp AgbMain).
 *
 * 2 helpers :
 *  - registerIntroSpriteCallbacks(rt) : enregistre les sprite callbacks intro/title/credits
 *    dans rt.spriteCallbacks (résolus par CreateSprite/les templates).
 *  - bootIntroSequence(rt) : preload assets intro/title/birch + SetMainCallback2(
 *    CB2_InitCopyrightScreenAfterBootup) = lance la chaîne CB2 décomp (Copyright→Intro→
 *    Title→MainMenu→Birch).
 */
import type { DecompRuntime } from '../runtime/decomp-runtime';
import { assetCache } from '../runtime/decomp-globals';
import { preloadFontData } from '../../src/engine/ui/gba-text-system';
import {
  preloadScene1Assets, preloadScene2Assets, preloadScene3Assets,
  preloadTitleAssets, preloadBirchSpeechAssets,
} from './intro-asset-loader';
import {
  Task_Scene1_Load, MainCB2_EndIntro,
  SpriteCB_Sparkle, SpriteCB_Volbeat, SpriteCB_Torchic, SpriteCB_Manectric,
  SpriteCB_GroudonRocks, SpriteCB_KyogreBubbles, SpriteCB_Lightning,
  SpriteCB_WaterDrop_Ripple, SpriteCB_WaterDropHalf, SpriteCB_WaterDrop,
  SpriteCB_WaterDrop_Slide, SpriteCB_WaterDrop_ReachLeafEnd,
  SpriteCB_WaterDrop_DangleFromLeaf, SpriteCB_WaterDrop_Fall, SpriteCB_WaterDropShort,
  SpriteCB_PlayerOnBicycle, SpriteCB_Flygon, SpriteCB_LogoLetter,
  SpriteCB_GameFreakLogo, SpriteCB_FlygonSilhouette, SpriteCB_RayquazaOrb,
} from '../../src/engine/decomp-data/src/intro-callbacks-auto';
import {
  SpriteCB_VersionBannerLeft, SpriteCB_VersionBannerRight,
  SpriteCB_PressStartCopyrightBanner,
  SpriteCB_PokemonLogoShine, SpriteCB_PokemonLogoShine_Fast,
} from '../../src/engine/decomp-data/src/title_screen-callbacks-auto';
import {
  SpriteCB_Bicycle, SpriteCB_FlygonRightHalf, Task_BicycleBgAnimation,
} from '../../src/engine/decomp-data/src/intro_credits_graphics-callbacks-auto';
import { CB2_InitCopyrightScreenAfterBootup } from './copyright-boot';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 1:1 GameScene.create() : enregistre les sprite callbacks intro/title/credits dans
 *  rt.spriteCallbacks (les fonctions ESM ne sont pas sur globalThis, donc
 *  CreateSpriteFromTemplate / les templates les résolvent via cette Map). */
export function registerIntroSpriteCallbacks(rt: DecompRuntime): void {
  rt.spriteCallbacks.set('SpriteCB_Sparkle', SpriteCB_Sparkle);
  rt.spriteCallbacks.set('SpriteCB_Volbeat', SpriteCB_Volbeat);
  rt.spriteCallbacks.set('SpriteCB_Torchic', SpriteCB_Torchic);
  rt.spriteCallbacks.set('SpriteCB_Manectric', SpriteCB_Manectric);
  rt.spriteCallbacks.set('SpriteCB_GroudonRocks', SpriteCB_GroudonRocks);
  rt.spriteCallbacks.set('SpriteCB_KyogreBubbles', SpriteCB_KyogreBubbles);
  rt.spriteCallbacks.set('SpriteCB_Lightning', SpriteCB_Lightning);
  rt.spriteCallbacks.set('SpriteCB_WaterDrop_Ripple', SpriteCB_WaterDrop_Ripple);
  rt.spriteCallbacks.set('SpriteCB_WaterDropHalf', SpriteCB_WaterDropHalf);
  rt.spriteCallbacks.set('SpriteCB_WaterDrop', SpriteCB_WaterDrop);
  rt.spriteCallbacks.set('SpriteCB_WaterDrop_Slide', SpriteCB_WaterDrop_Slide);
  rt.spriteCallbacks.set('SpriteCB_WaterDrop_ReachLeafEnd', SpriteCB_WaterDrop_ReachLeafEnd);
  rt.spriteCallbacks.set('SpriteCB_WaterDrop_DangleFromLeaf', SpriteCB_WaterDrop_DangleFromLeaf);
  rt.spriteCallbacks.set('SpriteCB_WaterDrop_Fall', SpriteCB_WaterDrop_Fall);
  rt.spriteCallbacks.set('SpriteCB_WaterDropShort', SpriteCB_WaterDropShort);
  rt.spriteCallbacks.set('SpriteCB_PlayerOnBicycle', SpriteCB_PlayerOnBicycle);
  rt.spriteCallbacks.set('SpriteCB_Flygon', SpriteCB_Flygon);
  rt.spriteCallbacks.set('SpriteCB_LogoLetter', SpriteCB_LogoLetter);
  rt.spriteCallbacks.set('SpriteCB_GameFreakLogo', SpriteCB_GameFreakLogo);
  rt.spriteCallbacks.set('SpriteCB_FlygonSilhouette', SpriteCB_FlygonSilhouette);
  rt.spriteCallbacks.set('SpriteCB_RayquazaOrb', SpriteCB_RayquazaOrb);
  // Title screen (version banner slide+fade, press start blink, logo shine sweep).
  rt.spriteCallbacks.set('SpriteCB_VersionBannerLeft', SpriteCB_VersionBannerLeft as any);
  rt.spriteCallbacks.set('SpriteCB_VersionBannerRight', SpriteCB_VersionBannerRight as any);
  rt.spriteCallbacks.set('SpriteCB_PressStartCopyrightBanner', SpriteCB_PressStartCopyrightBanner as any);
  rt.spriteCallbacks.set('SpriteCB_PokemonLogoShine', SpriteCB_PokemonLogoShine as any);
  rt.spriteCallbacks.set('SpriteCB_PokemonLogoShine_Fast', SpriteCB_PokemonLogoShine_Fast as any);
  // Scene 2 sub-sprites (bicycle suit player, Flygon right half suit left) + BG scroll task.
  rt.spriteCallbacks.set('SpriteCB_Bicycle', SpriteCB_Bicycle);
  rt.spriteCallbacks.set('SpriteCB_FlygonRightHalf', SpriteCB_FlygonRightHalf);
  rt.spriteCallbacks.set('Task_BicycleBgAnimation', Task_BicycleBgAnimation as any);
  // Garde des références « used » pour les imports partagés avec GameScene (no-op runtime).
  void Task_Scene1_Load; void MainCB2_EndIntro;
}

/** 1:1 GameScene.bootIntro() : preload assets intro/title/birch + strings + cris +
 *  MIDIs, puis SetMainCallback2(CB2_InitCopyrightScreenAfterBootup) → lance la chaîne
 *  CB2 décomp. Idempotent côté assets (les preload sont cachés). */
export async function bootIntroSequence(rt: DecompRuntime): Promise<void> {
  // Strings FR 1:1 décomp AVANT toute Task qui référence gText_* (main menu, Birch…).
  const { initStringsFromDecomp } = await import('../../src/engine/ui/gba-strings');
  await initStringsFromDecomp();

  // Side-effect : option_menu helpers sur globalThis (requis avant CB2_InitOptionMenu).
  const { preloadOptionMenuAssets } = await import('../../src/engine/ui/option-menu-impl');

  await preloadScene1Assets();
  await preloadScene2Assets();
  await preloadScene3Assets();
  await preloadTitleAssets();
  await preloadFontData();
  await preloadOptionMenuAssets();
  await preloadBirchSpeechAssets();

  // species ID → cri filename (PlayCryInternal pour tous les species).
  const { loadSpeciesNamesAsync } = await import('../runtime/decomp-globals');
  await loadSpeciesNamesAsync();

  // Préchargement MIDIs intro/title + cris légendaires (élimine le gap silence aux
  // transitions m4aSongNumStart). 1:1 ROM-équivalent : tous les sons « déjà là ».
  const { loadMidi } = await import('../m4a/player');
  void Promise.all([
    loadMidi('/decomp/em/music/mus_intro.mid').catch(() => {}),
    loadMidi('/decomp/em/music/mus_intro_battle.mid').catch(() => {}),
    loadMidi('/decomp/em/music/mus_title.mid').catch(() => {}),
    loadMidi('/decomp/em/music/se_intro_blast.mid').catch(() => {}),
  ]);
  void Promise.all([
    fetch('/decomp/em/cries/groudon.wav').catch(() => {}),
    fetch('/decomp/em/cries/kyogre.wav').catch(() => {}),
  ]);

  // Palette additionnelle préchargée → runtime (text.pal pour color cycle GameFreak).
  const textPal = assetCache.get('gIntroGameFreakTextFade_Pal') as Uint16Array | undefined;
  if (textPal) rt.setExtraPalette('gIntroGameFreakTextFade_Pal', textPal);

  // Boot 1:1 décomp : CB2_InitCopyrightScreenAfterBootup → SetUpCopyrightScreen
  // state machine → fade in/hold/out → MainCB2_Intro + Task_Scene1_Load.
  rt.SetMainCallback2(CB2_InitCopyrightScreenAfterBootup);
}
