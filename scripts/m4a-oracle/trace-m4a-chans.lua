-- trace-m4a-chans.lua — Oracle son m4a, étage A-bis (état des SoundChannels)
-- + étage B (pcmBuffer) en un seul dump. Remplace trace-m4a-pcm.lua.
-- À charger dans mGBA : Tools > Scripting… > Load script, puis RESET (Ctrl+R),
-- laisser l'intro jouer ~30 s sans toucher.
--
-- Format binaire (little-endian) :
--   header : "M4AC" u32 · u8 version=2 · u8 pcmDmaPeriod · u16 spv
--   par frame : u32 frame · u32 songHeader(BGM) · u8 pcmDmaCounter · u8 reverb
--               · u16 0 · 5 × 64 octets (chans[0..4] bruts) · 3168 pcmBuffer
-- Offsets SoundInfo (m4a_constants.inc) : chans @+0x50, pcmBuffer @+0x350.

local outPath = "D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-mgba-chans.bin"
local MAX_FRAMES = 1500
local NCHANS = 5

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
  local mp = u32(p + 0x24)
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
  bgmInfo = mp
  return true
end

callbacks:add("frame", function()
  frame = frame + 1
  if traced >= MAX_FRAMES then return end
  if not si then
    if not discover() then return end
    f = io.open(outPath, "wb")
    f:write(string.pack("<I4BBI2", 0x4341344D, 2, u8(si + 11), u8(si + 16) | (u8(si + 17) << 8)))
    console:log(string.format("m4a-chans: SoundInfo @0x%08X, BGM @0x%08X", si, bgmInfo))
  end
  local sh = u32(bgmInfo)
  if sh == 0 then return end
  f:write(string.pack("<I4I4BBI2", frame, sh, u8(si + 4), u8(si + 5), 0))
  f:write(emu:readRange(si + 0x50, NCHANS * 64))
  f:write(emu:readRange(si + 0x350, 3168))
  traced = traced + 1
  if traced == MAX_FRAMES then
    f:close()
    console:log("m4a-chans: DONE - " .. traced .. " frames -> " .. outPath)
  end
end)

console:log("m4a-chans: armé. RESET puis laissez l'intro jouer ~30 s.")
