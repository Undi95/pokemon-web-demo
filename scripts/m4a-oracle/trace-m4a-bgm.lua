-- trace-m4a-bgm.lua — Oracle son m4a, étage A (« à l'état près, chaque frame »).
-- À charger dans mGBA (>= 0.10) : Tools > Scripting… > File > Load script.
-- Avec pokeemerald US (matching, sha1 f3ae0881…) : laisser l'intro tourner ~30 s.
--
-- Dump JSONL : chaque frame, l'état des pistes du player BGM.
-- Découverte dynamique (zéro .map) : SOUND_INFO_PTR (0x3007FF0, defines.h:22)
-- → SoundInfo.musicPlayerHead (+0x24) → remonter musicPlayerNext (+0x3C)
-- jusqu'au DERNIER de la chaîne = gMPlayInfo_BGM (1er MPlayOpen de
-- m4aSoundInit) → tracks (+0x30), trackCount (+0x08).
-- Offsets vérifiés sur constants/m4a_constants.inc de la décomp.

local outPath = "D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-mgba-bgm.jsonl"
local MAX_FRAMES = 1500 -- ~25 s de trace à partir de la 1re chanson

local f = nil
local frame = 0
local traced = 0
local bgmInfo = nil
local bgmTracks = nil
local trackCount = 0

local function u8(a) return emu:read8(a) end
local function u32(a) return emu:read32(a) end

local function discover()
  local si = u32(0x3007FF0)
  if si == 0 then return false end
  if u32(si) ~= 0x68736D53 then return false end -- ident 'Smsh' (driver prêt)
  local mp = u32(si + 0x24) -- musicPlayerHead (dernier MPlayOpen = cry player)
  if mp == 0 then return false end
  local guard = 0
  while true do
    local nxt = u32(mp + 0x3C) -- musicPlayerNext
    if nxt == 0 then break end
    mp = nxt
    guard = guard + 1
    if guard > 16 then return false end
  end
  bgmInfo = mp
  bgmTracks = u32(mp + 0x30)
  trackCount = u8(mp + 0x08)
  return bgmTracks ~= 0 and trackCount > 0 and trackCount <= 16
end

-- 12 champs par piste : [flags, wait, key, velocity, gateTime, keyM, pitM,
-- volMR, volML, patternLevel, cmdPtr(adresse ROM), chanNonNull]
local function dumpFrame()
  local sh = u32(bgmInfo + 0x00) -- songHeader (adresse ROM de la chanson)
  local status = u32(bgmInfo + 0x04)
  local parts = {}
  for i = 0, trackCount - 1 do
    local t = bgmTracks + i * 0x50
    parts[#parts + 1] = string.format(
      "[%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d]",
      u8(t + 0x00), u8(t + 0x01), u8(t + 0x05), u8(t + 0x06), u8(t + 0x04),
      u8(t + 0x08), u8(t + 0x09), u8(t + 0x10), u8(t + 0x11), u8(t + 0x02),
      u32(t + 0x40), (u32(t + 0x20) ~= 0) and 1 or 0)
  end
  f:write(string.format('{"f":%d,"sh":%d,"st":%d,"tr":[%s]}\n',
    frame, sh, status, table.concat(parts, ",")))
end

callbacks:add("frame", function()
  frame = frame + 1
  if traced >= MAX_FRAMES then return end
  if not bgmInfo then
    if not discover() then return end
    f = io.open(outPath, "w")
    console:log(string.format("m4a-oracle: BGM info @0x%08X, tracks @0x%08X (n=%d)",
      bgmInfo, bgmTracks, trackCount))
  end
  if u32(bgmInfo) == 0 then return end -- pas encore de chanson chargée
  dumpFrame()
  traced = traced + 1
  if traced == MAX_FRAMES then
    f:close()
    console:log("m4a-oracle: DONE - " .. traced .. " frames -> " .. outPath)
  end
end)

console:log("m4a-oracle: armé. Laissez l'intro jouer ~30 s sans toucher.")
