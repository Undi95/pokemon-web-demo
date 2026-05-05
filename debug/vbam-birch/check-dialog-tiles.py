"""Check dialog box tile data location in VBA-M dump."""
import os
DIR = os.path.dirname(os.path.abspath(__file__))
vram = open(os.path.join(DIR, "vram.bin"), "rb").read()
pltt = open(os.path.join(DIR, "pltt.bin"), "rb").read()

# Decomp expects dialog tiles at charBase=3 (0xC000) + tile 0xFC (252) * 32 = 0xDF80
print("Dialog box tile data check:")
print(f"  Expected location (decomp): vram[0xC000 + 0xFC*32 = 0xDF80] (charBase=3 + tile 252)")
print(f"  Decomp loads 0x1C0=448 bytes (= 14 tiles)")

dialog_off = 0xDF80
dialog_size = 0x1C0
nz = sum(1 for b in vram[dialog_off:dialog_off + dialog_size] if b != 0)
print(f"  vram[0x{dialog_off:04x}..0x{dialog_off+dialog_size:04x}]: {nz}/{dialog_size} non-zero")

# Maybe at different charBase ? Let me check all charBases
print("\nAlt locations (= other charBases):")
for cb in range(4):
    off = cb * 0x4000 + 0xFC * 32
    if off + 448 > len(vram):
        continue
    nz = sum(1 for b in vram[off:off + 448] if b != 0)
    print(f"  charBase={cb} → vram[0x{off:04x}]: {nz}/448 non-zero")

# Also check if somewhere in 0x10000+ (OBJ region) — maybe loaded wrong
# Also dump first 64 bytes after each candidate
print("\nFull VRAM regions with > 100 non-zero bytes (256B chunks):")
for off in range(0, len(vram), 256):
    nz = sum(1 for b in vram[off:off+256] if b != 0)
    if nz > 100:
        print(f"  vram[0x{off:05x}]: {nz}/256")

# Palette 15 should have textbox colors
print("\nBG palette bank 15 (= decomp BG_PLTT_ID(15) for textbox):")
for i in range(16):
    c = pltt[15 * 32 + i * 2] | (pltt[15 * 32 + i * 2 + 1] << 8)
    r, g, b = c & 0x1F, (c >> 5) & 0x1F, (c >> 10) & 0x1F
    print(f"  pal[15][{i:2}] = 0x{c:04x}  RGB({r:2}, {g:2}, {b:2})")
