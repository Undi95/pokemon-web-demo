"""Find ALL non-zero VRAM regions to know what's where."""
import os
DIR = os.path.dirname(os.path.abspath(__file__))
vram = open(os.path.join(DIR, "vram.bin"), "rb").read()

# Find runs of non-zero bytes
print(f"VRAM total: {len(vram)} bytes")
print()
print("Non-zero regions (continuous chunks):")
in_region = False
start = 0
for i, b in enumerate(vram):
    if b != 0:
        if not in_region:
            start = i
            in_region = True
    else:
        if in_region:
            # Look ahead to see if zero is brief
            zeros_count = 0
            for j in range(i, min(i + 64, len(vram))):
                if vram[j] == 0:
                    zeros_count += 1
                else:
                    break
            if zeros_count < 64:
                continue  # gap is brief, keep going
            else:
                # End of region
                length = i - start
                if length >= 16:
                    print(f"  vram[0x{start:05x}..0x{i:05x}]  ({length} bytes)")
                in_region = False
if in_region:
    length = len(vram) - start
    print(f"  vram[0x{start:05x}..0x{len(vram):05x}]  ({length} bytes)")

# Specifically check critical landmarks
print()
print("Critical landmark counts (256B windows):")
for off in [0x0000, 0x600, 0xC00, 0x1000, 0x2000, 0x3000, 0x3800, 0x4000, 0x5000, 0x6000, 0x7000, 0x8000,
            0x9000, 0xA000, 0xB000, 0xC000, 0xD000, 0xE000, 0xF000, 0xF800, 0x10000, 0x12000, 0x14000, 0x16000]:
    end = min(off + 256, len(vram))
    nz = sum(1 for b in vram[off:end] if b != 0)
    if nz > 0:
        print(f"  vram[0x{off:05x}]  non-zero {nz}/{end-off}")

# Also dump tilemap entries at various screen bases
print()
print("BG screen base candidates (= u16 entries, first 32):")
for base in [0xF000, 0x3800, 0xC000, 0xB000, 0xE000]:
    if base + 64 > len(vram):
        continue
    entries = []
    for i in range(0, 64, 2):
        v = vram[base + i] | (vram[base + i + 1] << 8)
        entries.append(f"{v:04x}")
    print(f"  base[0x{base:05x}]: {' '.join(entries)}")
