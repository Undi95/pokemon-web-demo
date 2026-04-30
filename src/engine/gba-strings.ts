/**
 * gba-strings.ts
 * --------------
 * Strings globales utilisées par les callbacks auto-générés du main menu.
 * Les callbacks référencent `gText_XXX` comme des variables globales.
 * On les définit ici et on les expose sur `globalThis`.
 */

const strings: Record<string, string> = {
  // Main menu
  gText_MainMenuNewGame: 'NOUVELLE PARTIE',
  gText_MainMenuContinue: 'CONTINUER',
  gText_MainMenuOption: 'OPTION',
  gText_MainMenuMysteryGift: 'CADEAU MYST.',
  gText_MainMenuMysteryGift2: 'CADEAU MYST.',
  gText_MainMenuMysteryEvents: 'EVEN. MYST.',
  gText_SaveFileErased: 'La sauvegarde a été effacée.',
  gText_SaveFileCorrupted: 'La sauvegarde est corrompue.',
  gText_BatteryRunDry: 'La pile est à plat.',
  gText_WirelessNotConnected: 'L\'adaptateur sans fil n\'est pas connecté.',
  gText_MysteryGiftCantUse: 'Le CADEAU MYST. ne peut pas être utilisé.',
  gText_MysteryEventsCantUse: 'Les EVEN. MYST. ne peuvent pas être utilisés.',

  // Birch speech
  gText_Birch_Welcome: 'Bonjour! Désolé de t\'avoir fait attendre!\pBienvenue dans le monde des POKéMON!\nJe m\'appelle BIRCH.\pMais on m\'appelle aussi le\nPROFESSEUR POKéMON.\p',
  gText_ThisIsAPokemon: 'Ceci est ce qu\'on appelle un POKéMON.\p',
  gText_Birch_MainSpeech: 'Le monde est peuplé de créatures\nappelees POKéMON.\pLes humains et les POKéMON vivent\nensemble en s\'aidant mutuellement.\pCertains jouent avec les POKéMON,\nd\'autres les font combattre.\pEt moi...\nJ\'étudie les POKéMON.\p',
  gText_Birch_AndYouAre: 'Et toi, qui es-tu?',
  gText_Birch_BoyOrGirl: 'Es-tu un garçon?\nOu une fille?',
  gText_Birch_WhatsYourName: 'Comment t\'appelles-tu?',
  gText_Birch_SoItsPlayer: 'Alors, c\'est {PLAYER}?',
  gText_Birch_YourePlayer: 'Ah, d\'accord!\pTu es {PLAYER} qui emménage dans\nma ville natale de BOURG-EN-VOL.\p',
  gText_Birch_AreYouReady: '{PLAYER}, es-tu prêt?\pTon aventure va commencer.\pRêve grand et vis de grandes\naventures!\pBien, rejoins-moi dehors!\p',

  // Default player names
  gText_DefaultNameStu: 'STU',
  gText_DefaultNameMilton: 'MILTON',
  gText_DefaultNameTom: 'TOM',
  gText_DefaultNameKenny: 'KENNY',
  gText_DefaultNameReid: 'REID',
  gText_DefaultNameJude: 'JUDE',
  gText_DefaultNameJaxson: 'JAXSON',
  gText_DefaultNameEaston: 'EASTON',
  gText_DefaultNameWalker: 'WALKER',
  gText_DefaultNameTeru: 'TERU',
  gText_DefaultNameJohnny: 'JOHNNY',
  gText_DefaultNameBrett: 'BRETT',
  gText_DefaultNameSeth: 'SETH',
  gText_DefaultNameTerry: 'TERRY',
  gText_DefaultNameCasey: 'CASEY',
  gText_DefaultNameDarren: 'DARREN',
  gText_DefaultNameLandon: 'LANDON',
  gText_DefaultNameCollin: 'COLLIN',
  gText_DefaultNameStanley: 'STANLEY',
  gText_DefaultNameQuincy: 'QUINCY',
  gText_DefaultNameKimmy: 'KIMMY',
  gText_DefaultNameTiara: 'TIARA',
  gText_DefaultNameBella: 'BELLA',
  gText_DefaultNameJayla: 'JAYLA',
  gText_DefaultNameAllie: 'ALLIE',
  gText_DefaultNameLianna: 'LIANNA',
  gText_DefaultNameSara: 'SARA',
  gText_DefaultNameMonica: 'MONICA',
  gText_DefaultNameCamila: 'CAMILA',
  gText_DefaultNameAubree: 'AUBREE',
  gText_DefaultNameRuthie: 'RUTHIE',
  gText_DefaultNameHazel: 'HAZEL',
  gText_DefaultNameNadine: 'NADINE',
  gText_DefaultNameTanja: 'TANJA',
  gText_DefaultNameYasmin: 'YASMIN',
  gText_DefaultNameNicola: 'NICOLA',
  gText_DefaultNameLillie: 'LILLIE',
  gText_DefaultNameTerra: 'TERRA',
  gText_DefaultNameLucy: 'LUCY',
  gText_DefaultNameHalie: 'HALIE',
};

// Expose sur globalThis pour les callbacks auto-générés
for (const [key, value] of Object.entries(strings)) {
  (globalThis as Record<string, unknown>)[key] = value;
}

// Export explicite pour les imports nommés
export const {
  gText_MainMenuNewGame,
  gText_MainMenuContinue,
  gText_MainMenuOption,
  gText_MainMenuMysteryGift,
  gText_MainMenuMysteryGift2,
  gText_MainMenuMysteryEvents,
  gText_SaveFileErased,
  gText_SaveFileCorrupted,
  gText_BatteryRunDry,
  gText_WirelessNotConnected,
  gText_MysteryGiftCantUse,
  gText_MysteryEventsCantUse,
  gText_Birch_Welcome,
  gText_ThisIsAPokemon,
  gText_Birch_MainSpeech,
  gText_Birch_AndYouAre,
  gText_Birch_BoyOrGirl,
  gText_Birch_WhatsYourName,
  gText_Birch_SoItsPlayer,
  gText_Birch_YourePlayer,
  gText_Birch_AreYouReady,
} = strings;
