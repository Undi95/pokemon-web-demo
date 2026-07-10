-- trace-m4a-pcm.lua — Oracle son m4a, étage B (« au sample près »).
-- À charger dans mGBA (>= 0.10) : Tools > Scripting… > File > Load script,
-- puis RESET (Ctrl+R) et laisser l'intro jouer ~30 s sans toucher.
--
-- Dump BINAIRE : chaque frame, le pcmBuffer ENTIER (double buffer DirectSound,
-- 2 × 1584 s8) + de quoi s'aligner. Format (little-endian) :
--   header : "M4AP" u32 magic · u8 version=1 · u8 pcmDmaPeriod · u16 spv
--   par frame : u32 frame · u32 songHeader(BGM) · u8 pcmDmaCounter ·
--               u8 reverb · u16 0 · s8[3168] pcmBuffer
-- Offsets SoundInfo vérifiés sur constants/m4a_constants.inc :
--   pcmDmaCounter @+4, reverb @+5, pcmDmaPeriod @+11, spv @+16,
--   musicPlayerHead @+0x24, pcmBuffer @+0x350 (chans 12×64 @+0x50).

local outPath = "D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-mgba-pcm.bin"
local MAX_FRAMES = 1500

local f = nil
local frame = 0
local traced = 0
local si = nil
local bgmInfo = nil

local function u8(a) return emu:read8(a) end
local function u32(a) return emu:read32(a) end

local function discover()
  local p = u32(0x3007FF0)
  if p == 0 then return false end
  if u32(p) ~= 0x68736D53 then return false end -- 'Smsh'
  local mp = u32(p + 0x24) -- musicPlayerHead
  if mp == 0 then return false end
  local guard = 0
  while true do
    local nxt = u32(mp + 0x3C)
    if nxt == 0 then break end
    mp = nxt
    guard = guard + 1
    if guard > 16 then return false end
  end
  si = p
  bgmInfo = mp -- dernier de la chaîne = gMPlayInfo_BGM
  return true
end

callbacks:add("frame", function()
  frame = frame + 1
  if traced >= MAX_FRAMES then return end
  if not si then
    if not discover() then return end
    f = io.open(outPath, "wb")
    f:write(string.pack("<I4BBI2", 0x5041344D, 1, u8(si + 11), u8(si + 16) | (u8(si + 17) << 8)))
    console:log(string.format("m4a-pcm: SoundInfo @0x%08X, BGM @0x%08X, period=%d spv=%d",
      si, bgmInfo, u8(si + 11), u8(si + 16) | (u8(si + 17) << 8)))
  end
  local sh = u32(bgmInfo)
  if sh == 0 then return end -- pas encore de chanson
  f:write(string.pack("<I4I4BBI2", frame, sh, u8(si + 4), u8(si + 5), 0))
  f:write(emu:readRange(si + 0x350, 3168))
  traced = traced + 1
  if traced == MAX_FRAMES then
    f:close()
    console:log("m4a-pcm: DONE - " .. traced .. " frames -> " .. outPath)
  end
end)

console:log("m4a-pcm: armé. RESET puis laissez l'intro jouer ~30 s.")
