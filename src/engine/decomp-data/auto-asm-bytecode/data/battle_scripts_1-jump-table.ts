/**
 * battle_scripts_1-jump-table.ts — Extraction 1:1 décomp de la table
 * `gBattleScriptsForMoveEffects` dans `data/battle_scripts_1.s` (= les 214
 * premières .4byte entries, mappant EFFECT_* 0..213 vers leur BattleScript_*).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/data/battle_scripts_1.s:18..232`
 *
 * Architecture :
 *   - L'array `BATTLE_SCRIPTS_FOR_MOVE_EFFECTS` est indexé par effect id 0..213.
 *   - Chaque entry est le nom du label `BattleScript_Effect*` (= identique au
 *     décomp .s).
 *   - Pour résoudre vers un byte offset : passer le label à
 *     `getBattleScriptOffset(label)` (= `script-interpreter.ts`).
 *
 * Le helper `getMoveEffectScriptOffset(effect)` est exposé via
 * `script-interpreter.ts` pour usage par les opcodes (metronome, mirrormove,
 * callenvironmentattack, jumptocalledmove, presentdamagecalculation).
 */

/** 1:1 décomp `gBattleScriptsForMoveEffects[]` table.
 *  Index 0..213 = EFFECT_HIT..EFFECT_CAMOUFLAGE.
 *  Note : plusieurs effects mappent au même label (= EFFECT_HIT pour beaucoup
 *  d'effects "trivial damage" ou "unused"). */
export const BATTLE_SCRIPTS_FOR_MOVE_EFFECTS: readonly string[] = [
  'BattleScript_EffectHit',                       // 0   EFFECT_HIT
  'BattleScript_EffectSleep',                     // 1   EFFECT_SLEEP
  'BattleScript_EffectPoisonHit',                 // 2   EFFECT_POISON_HIT
  'BattleScript_EffectAbsorb',                    // 3   EFFECT_ABSORB
  'BattleScript_EffectBurnHit',                   // 4   EFFECT_BURN_HIT
  'BattleScript_EffectFreezeHit',                 // 5   EFFECT_FREEZE_HIT
  'BattleScript_EffectParalyzeHit',               // 6   EFFECT_PARALYZE_HIT
  'BattleScript_EffectExplosion',                 // 7   EFFECT_EXPLOSION
  'BattleScript_EffectDreamEater',                // 8   EFFECT_DREAM_EATER
  'BattleScript_EffectMirrorMove',                // 9   EFFECT_MIRROR_MOVE
  'BattleScript_EffectAttackUp',                  // 10  EFFECT_ATTACK_UP
  'BattleScript_EffectDefenseUp',                 // 11  EFFECT_DEFENSE_UP
  'BattleScript_EffectHit',                       // 12  EFFECT_SPEED_UP
  'BattleScript_EffectSpecialAttackUp',           // 13  EFFECT_SPECIAL_ATTACK_UP
  'BattleScript_EffectHit',                       // 14  EFFECT_SPECIAL_DEFENSE_UP
  'BattleScript_EffectHit',                       // 15  EFFECT_ACCURACY_UP
  'BattleScript_EffectEvasionUp',                 // 16  EFFECT_EVASION_UP
  'BattleScript_EffectHit',                       // 17  EFFECT_ALWAYS_HIT
  'BattleScript_EffectAttackDown',                // 18  EFFECT_ATTACK_DOWN
  'BattleScript_EffectDefenseDown',               // 19  EFFECT_DEFENSE_DOWN
  'BattleScript_EffectSpeedDown',                 // 20  EFFECT_SPEED_DOWN
  'BattleScript_EffectHit',                       // 21  EFFECT_SPECIAL_ATTACK_DOWN
  'BattleScript_EffectHit',                       // 22  EFFECT_SPECIAL_DEFENSE_DOWN
  'BattleScript_EffectAccuracyDown',              // 23  EFFECT_ACCURACY_DOWN
  'BattleScript_EffectEvasionDown',               // 24  EFFECT_EVASION_DOWN
  'BattleScript_EffectHaze',                      // 25  EFFECT_HAZE
  'BattleScript_EffectBide',                      // 26  EFFECT_BIDE
  'BattleScript_EffectRampage',                   // 27  EFFECT_RAMPAGE
  'BattleScript_EffectRoar',                      // 28  EFFECT_ROAR
  'BattleScript_EffectMultiHit',                  // 29  EFFECT_MULTI_HIT
  'BattleScript_EffectConversion',                // 30  EFFECT_CONVERSION
  'BattleScript_EffectFlinchHit',                 // 31  EFFECT_FLINCH_HIT
  'BattleScript_EffectRestoreHp',                 // 32  EFFECT_RESTORE_HP
  'BattleScript_EffectToxic',                     // 33  EFFECT_TOXIC
  'BattleScript_EffectPayDay',                    // 34  EFFECT_PAY_DAY
  'BattleScript_EffectLightScreen',               // 35  EFFECT_LIGHT_SCREEN
  'BattleScript_EffectTriAttack',                 // 36  EFFECT_TRI_ATTACK
  'BattleScript_EffectRest',                      // 37  EFFECT_REST
  'BattleScript_EffectOHKO',                      // 38  EFFECT_OHKO
  'BattleScript_EffectRazorWind',                 // 39  EFFECT_RAZOR_WIND
  'BattleScript_EffectSuperFang',                 // 40  EFFECT_SUPER_FANG
  'BattleScript_EffectDragonRage',                // 41  EFFECT_DRAGON_RAGE
  'BattleScript_EffectTrap',                      // 42  EFFECT_TRAP
  'BattleScript_EffectHit',                       // 43  EFFECT_HIGH_CRITICAL
  'BattleScript_EffectDoubleHit',                 // 44  EFFECT_DOUBLE_HIT
  'BattleScript_EffectRecoilIfMiss',              // 45  EFFECT_RECOIL_IF_MISS
  'BattleScript_EffectMist',                      // 46  EFFECT_MIST
  'BattleScript_EffectFocusEnergy',               // 47  EFFECT_FOCUS_ENERGY
  'BattleScript_EffectRecoil',                    // 48  EFFECT_RECOIL
  'BattleScript_EffectConfuse',                   // 49  EFFECT_CONFUSE
  'BattleScript_EffectAttackUp2',                 // 50  EFFECT_ATTACK_UP_2
  'BattleScript_EffectDefenseUp2',                // 51  EFFECT_DEFENSE_UP_2
  'BattleScript_EffectSpeedUp2',                  // 52  EFFECT_SPEED_UP_2
  'BattleScript_EffectSpecialAttackUp2',          // 53  EFFECT_SPECIAL_ATTACK_UP_2
  'BattleScript_EffectSpecialDefenseUp2',         // 54  EFFECT_SPECIAL_DEFENSE_UP_2
  'BattleScript_EffectHit',                       // 55  EFFECT_ACCURACY_UP_2
  'BattleScript_EffectHit',                       // 56  EFFECT_EVASION_UP_2
  'BattleScript_EffectTransform',                 // 57  EFFECT_TRANSFORM
  'BattleScript_EffectAttackDown2',               // 58  EFFECT_ATTACK_DOWN_2
  'BattleScript_EffectDefenseDown2',              // 59  EFFECT_DEFENSE_DOWN_2
  'BattleScript_EffectSpeedDown2',                // 60  EFFECT_SPEED_DOWN_2
  'BattleScript_EffectHit',                       // 61  EFFECT_SPECIAL_ATTACK_DOWN_2
  'BattleScript_EffectSpecialDefenseDown2',       // 62  EFFECT_SPECIAL_DEFENSE_DOWN_2
  'BattleScript_EffectHit',                       // 63  EFFECT_ACCURACY_DOWN_2
  'BattleScript_EffectHit',                       // 64  EFFECT_EVASION_DOWN_2
  'BattleScript_EffectReflect',                   // 65  EFFECT_REFLECT
  'BattleScript_EffectPoison',                    // 66  EFFECT_POISON
  'BattleScript_EffectParalyze',                  // 67  EFFECT_PARALYZE
  'BattleScript_EffectAttackDownHit',             // 68  EFFECT_ATTACK_DOWN_HIT
  'BattleScript_EffectDefenseDownHit',            // 69  EFFECT_DEFENSE_DOWN_HIT
  'BattleScript_EffectSpeedDownHit',              // 70  EFFECT_SPEED_DOWN_HIT
  'BattleScript_EffectSpecialAttackDownHit',      // 71  EFFECT_SPECIAL_ATTACK_DOWN_HIT
  'BattleScript_EffectSpecialDefenseDownHit',     // 72  EFFECT_SPECIAL_DEFENSE_DOWN_HIT
  'BattleScript_EffectAccuracyDownHit',           // 73  EFFECT_ACCURACY_DOWN_HIT
  'BattleScript_EffectHit',                       // 74  EFFECT_EVASION_DOWN_HIT
  'BattleScript_EffectSkyAttack',                 // 75  EFFECT_SKY_ATTACK
  'BattleScript_EffectConfuseHit',                // 76  EFFECT_CONFUSE_HIT
  'BattleScript_EffectTwineedle',                 // 77  EFFECT_TWINEEDLE
  'BattleScript_EffectHit',                       // 78  EFFECT_VITAL_THROW
  'BattleScript_EffectSubstitute',                // 79  EFFECT_SUBSTITUTE
  'BattleScript_EffectRecharge',                  // 80  EFFECT_RECHARGE
  'BattleScript_EffectRage',                      // 81  EFFECT_RAGE
  'BattleScript_EffectMimic',                     // 82  EFFECT_MIMIC
  'BattleScript_EffectMetronome',                 // 83  EFFECT_METRONOME
  'BattleScript_EffectLeechSeed',                 // 84  EFFECT_LEECH_SEED
  'BattleScript_EffectSplash',                    // 85  EFFECT_SPLASH
  'BattleScript_EffectDisable',                   // 86  EFFECT_DISABLE
  'BattleScript_EffectLevelDamage',               // 87  EFFECT_LEVEL_DAMAGE
  'BattleScript_EffectPsywave',                   // 88  EFFECT_PSYWAVE
  'BattleScript_EffectCounter',                   // 89  EFFECT_COUNTER
  'BattleScript_EffectEncore',                    // 90  EFFECT_ENCORE
  'BattleScript_EffectPainSplit',                 // 91  EFFECT_PAIN_SPLIT
  'BattleScript_EffectSnore',                     // 92  EFFECT_SNORE
  'BattleScript_EffectConversion2',               // 93  EFFECT_CONVERSION_2
  'BattleScript_EffectLockOn',                    // 94  EFFECT_LOCK_ON
  'BattleScript_EffectSketch',                    // 95  EFFECT_SKETCH
  'BattleScript_EffectHit',                       // 96  EFFECT_UNUSED_60
  'BattleScript_EffectSleepTalk',                 // 97  EFFECT_SLEEP_TALK
  'BattleScript_EffectDestinyBond',               // 98  EFFECT_DESTINY_BOND
  'BattleScript_EffectFlail',                     // 99  EFFECT_FLAIL
  'BattleScript_EffectSpite',                     // 100 EFFECT_SPITE
  'BattleScript_EffectHit',                       // 101 EFFECT_FALSE_SWIPE
  'BattleScript_EffectHealBell',                  // 102 EFFECT_HEAL_BELL
  'BattleScript_EffectHit',                       // 103 EFFECT_QUICK_ATTACK
  'BattleScript_EffectTripleKick',                // 104 EFFECT_TRIPLE_KICK
  'BattleScript_EffectThief',                     // 105 EFFECT_THIEF
  'BattleScript_EffectMeanLook',                  // 106 EFFECT_MEAN_LOOK
  'BattleScript_EffectNightmare',                 // 107 EFFECT_NIGHTMARE
  'BattleScript_EffectMinimize',                  // 108 EFFECT_MINIMIZE
  'BattleScript_EffectCurse',                     // 109 EFFECT_CURSE
  'BattleScript_EffectHit',                       // 110 EFFECT_UNUSED_6E
  'BattleScript_EffectProtect',                   // 111 EFFECT_PROTECT
  'BattleScript_EffectSpikes',                    // 112 EFFECT_SPIKES
  'BattleScript_EffectForesight',                 // 113 EFFECT_FORESIGHT
  'BattleScript_EffectPerishSong',                // 114 EFFECT_PERISH_SONG
  'BattleScript_EffectSandstorm',                 // 115 EFFECT_SANDSTORM
  'BattleScript_EffectEndure',                    // 116 EFFECT_ENDURE
  'BattleScript_EffectRollout',                   // 117 EFFECT_ROLLOUT
  'BattleScript_EffectSwagger',                   // 118 EFFECT_SWAGGER
  'BattleScript_EffectFuryCutter',                // 119 EFFECT_FURY_CUTTER
  'BattleScript_EffectAttract',                   // 120 EFFECT_ATTRACT
  'BattleScript_EffectReturn',                    // 121 EFFECT_RETURN
  'BattleScript_EffectPresent',                   // 122 EFFECT_PRESENT
  'BattleScript_EffectFrustration',               // 123 EFFECT_FRUSTRATION
  'BattleScript_EffectSafeguard',                 // 124 EFFECT_SAFEGUARD
  'BattleScript_EffectThawHit',                   // 125 EFFECT_THAW_HIT
  'BattleScript_EffectMagnitude',                 // 126 EFFECT_MAGNITUDE
  'BattleScript_EffectBatonPass',                 // 127 EFFECT_BATON_PASS
  'BattleScript_EffectHit',                       // 128 EFFECT_PURSUIT
  'BattleScript_EffectRapidSpin',                 // 129 EFFECT_RAPID_SPIN
  'BattleScript_EffectSonicboom',                 // 130 EFFECT_SONICBOOM
  'BattleScript_EffectHit',                       // 131 EFFECT_UNUSED_83
  'BattleScript_EffectMorningSun',                // 132 EFFECT_MORNING_SUN
  'BattleScript_EffectSynthesis',                 // 133 EFFECT_SYNTHESIS
  'BattleScript_EffectMoonlight',                 // 134 EFFECT_MOONLIGHT
  'BattleScript_EffectHiddenPower',               // 135 EFFECT_HIDDEN_POWER
  'BattleScript_EffectRainDance',                 // 136 EFFECT_RAIN_DANCE
  'BattleScript_EffectSunnyDay',                  // 137 EFFECT_SUNNY_DAY
  'BattleScript_EffectDefenseUpHit',              // 138 EFFECT_DEFENSE_UP_HIT
  'BattleScript_EffectAttackUpHit',               // 139 EFFECT_ATTACK_UP_HIT
  'BattleScript_EffectAllStatsUpHit',             // 140 EFFECT_ALL_STATS_UP_HIT
  'BattleScript_EffectHit',                       // 141 EFFECT_UNUSED_8D
  'BattleScript_EffectBellyDrum',                 // 142 EFFECT_BELLY_DRUM
  'BattleScript_EffectPsychUp',                   // 143 EFFECT_PSYCH_UP
  'BattleScript_EffectMirrorCoat',                // 144 EFFECT_MIRROR_COAT
  'BattleScript_EffectSkullBash',                 // 145 EFFECT_SKULL_BASH
  'BattleScript_EffectTwister',                   // 146 EFFECT_TWISTER
  'BattleScript_EffectEarthquake',                // 147 EFFECT_EARTHQUAKE
  'BattleScript_EffectFutureSight',               // 148 EFFECT_FUTURE_SIGHT
  'BattleScript_EffectGust',                      // 149 EFFECT_GUST
  'BattleScript_EffectStomp',                     // 150 EFFECT_FLINCH_MINIMIZE_HIT
  'BattleScript_EffectSolarBeam',                 // 151 EFFECT_SOLAR_BEAM
  'BattleScript_EffectThunder',                   // 152 EFFECT_THUNDER
  'BattleScript_EffectTeleport',                  // 153 EFFECT_TELEPORT
  'BattleScript_EffectBeatUp',                    // 154 EFFECT_BEAT_UP
  'BattleScript_EffectSemiInvulnerable',          // 155 EFFECT_SEMI_INVULNERABLE
  'BattleScript_EffectDefenseCurl',               // 156 EFFECT_DEFENSE_CURL
  'BattleScript_EffectSoftboiled',                // 157 EFFECT_SOFTBOILED
  'BattleScript_EffectFakeOut',                   // 158 EFFECT_FAKE_OUT
  'BattleScript_EffectUproar',                    // 159 EFFECT_UPROAR
  'BattleScript_EffectStockpile',                 // 160 EFFECT_STOCKPILE
  'BattleScript_EffectSpitUp',                    // 161 EFFECT_SPIT_UP
  'BattleScript_EffectSwallow',                   // 162 EFFECT_SWALLOW
  'BattleScript_EffectHit',                       // 163 EFFECT_UNUSED_A3
  'BattleScript_EffectHail',                      // 164 EFFECT_HAIL
  'BattleScript_EffectTorment',                   // 165 EFFECT_TORMENT
  'BattleScript_EffectFlatter',                   // 166 EFFECT_FLATTER
  'BattleScript_EffectWillOWisp',                 // 167 EFFECT_WILL_O_WISP
  'BattleScript_EffectMemento',                   // 168 EFFECT_MEMENTO
  'BattleScript_EffectFacade',                    // 169 EFFECT_FACADE
  'BattleScript_EffectFocusPunch',                // 170 EFFECT_FOCUS_PUNCH
  'BattleScript_EffectSmellingsalt',              // 171 EFFECT_SMELLINGSALT
  'BattleScript_EffectFollowMe',                  // 172 EFFECT_FOLLOW_ME
  'BattleScript_EffectNaturePower',               // 173 EFFECT_NATURE_POWER
  'BattleScript_EffectCharge',                    // 174 EFFECT_CHARGE
  'BattleScript_EffectTaunt',                     // 175 EFFECT_TAUNT
  'BattleScript_EffectHelpingHand',               // 176 EFFECT_HELPING_HAND
  'BattleScript_EffectTrick',                     // 177 EFFECT_TRICK
  'BattleScript_EffectRolePlay',                  // 178 EFFECT_ROLE_PLAY
  'BattleScript_EffectWish',                      // 179 EFFECT_WISH
  'BattleScript_EffectAssist',                    // 180 EFFECT_ASSIST
  'BattleScript_EffectIngrain',                   // 181 EFFECT_INGRAIN
  'BattleScript_EffectSuperpower',                // 182 EFFECT_SUPERPOWER
  'BattleScript_EffectMagicCoat',                 // 183 EFFECT_MAGIC_COAT
  'BattleScript_EffectRecycle',                   // 184 EFFECT_RECYCLE
  'BattleScript_EffectRevenge',                   // 185 EFFECT_REVENGE
  'BattleScript_EffectBrickBreak',                // 186 EFFECT_BRICK_BREAK
  'BattleScript_EffectYawn',                      // 187 EFFECT_YAWN
  'BattleScript_EffectKnockOff',                  // 188 EFFECT_KNOCK_OFF
  'BattleScript_EffectEndeavor',                  // 189 EFFECT_ENDEAVOR
  'BattleScript_EffectEruption',                  // 190 EFFECT_ERUPTION
  'BattleScript_EffectSkillSwap',                 // 191 EFFECT_SKILL_SWAP
  'BattleScript_EffectImprison',                  // 192 EFFECT_IMPRISON
  'BattleScript_EffectRefresh',                   // 193 EFFECT_REFRESH
  'BattleScript_EffectGrudge',                    // 194 EFFECT_GRUDGE
  'BattleScript_EffectSnatch',                    // 195 EFFECT_SNATCH
  'BattleScript_EffectLowKick',                   // 196 EFFECT_LOW_KICK
  'BattleScript_EffectSecretPower',               // 197 EFFECT_SECRET_POWER
  'BattleScript_EffectDoubleEdge',                // 198 EFFECT_DOUBLE_EDGE
  'BattleScript_EffectTeeterDance',               // 199 EFFECT_TEETER_DANCE
  'BattleScript_EffectBurnHit',                   // 200 EFFECT_BLAZE_KICK
  'BattleScript_EffectMudSport',                  // 201 EFFECT_MUD_SPORT
  'BattleScript_EffectPoisonFang',                // 202 EFFECT_POISON_FANG
  'BattleScript_EffectWeatherBall',               // 203 EFFECT_WEATHER_BALL
  'BattleScript_EffectOverheat',                  // 204 EFFECT_OVERHEAT
  'BattleScript_EffectTickle',                    // 205 EFFECT_TICKLE
  'BattleScript_EffectCosmicPower',               // 206 EFFECT_COSMIC_POWER
  'BattleScript_EffectSkyUppercut',               // 207 EFFECT_SKY_UPPERCUT
  'BattleScript_EffectBulkUp',                    // 208 EFFECT_BULK_UP
  'BattleScript_EffectPoisonHit',                 // 209 EFFECT_POISON_TAIL
  'BattleScript_EffectWaterSport',                // 210 EFFECT_WATER_SPORT
  'BattleScript_EffectCalmMind',                  // 211 EFFECT_CALM_MIND
  'BattleScript_EffectDragonDance',               // 212 EFFECT_DRAGON_DANCE
  'BattleScript_EffectCamouflage',                // 213 EFFECT_CAMOUFLAGE
];

/** Nombre d'entries dans la table (= 214 effects total). */
export const NUM_BATTLE_SCRIPTS_FOR_MOVE_EFFECTS = BATTLE_SCRIPTS_FOR_MOVE_EFFECTS.length;
