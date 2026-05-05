"""Analyze VBA-M ground truth dump : print key registers, palette, BG layout."""
import struct
import os

DIR = os.path.dirname(os.path.abspath(__file__))


def read(name):
    return open(os.path.join(DIR, name), "rb").read()


def u16(buf, off):
    return struct.unpack_from("<H", buf, off)[0]


def u8(buf, off):
    return buf[off]


def main():
    ioregs = read("ioregs.bin")
    pltt = read("pltt.bin")
    vram = read("vram.bin")
    oam = read("oam.bin")

    print("=" * 70)
    print("VBA-M GROUND TRUTH SNAPSHOT — Birch dialogue 'Bonjour! Désolé...'")
    print("=" * 70)

    # IO registers
    print("\n── IO REGISTERS ──────────────────────────────────────────")
    DISPCNT = u16(ioregs, 0x00)
    DISPSTAT = u16(ioregs, 0x04)
    BG0CNT = u16(ioregs, 0x08)
    BG1CNT = u16(ioregs, 0x0A)
    BG2CNT = u16(ioregs, 0x0C)
    BG3CNT = u16(ioregs, 0x0E)
    BG0HOFS = u16(ioregs, 0x10)
    BG0VOFS = u16(ioregs, 0x12)
    BG1HOFS = u16(ioregs, 0x14)
    BG1VOFS = u16(ioregs, 0x16)
    WIN0H = u16(ioregs, 0x40)
    WIN0V = u16(ioregs, 0x44)
    WININ = u16(ioregs, 0x48)
    WINOUT = u16(ioregs, 0x4A)
    BLDCNT = u16(ioregs, 0x50)
    BLDALPHA = u16(ioregs, 0x52)
    BLDY = u16(ioregs, 0x54)

    print(f"  DISPCNT  = 0x{DISPCNT:04x}  bgMode={DISPCNT & 7}  bgs_on={(DISPCNT >> 8) & 0xF}  obj_on={(DISPCNT >> 12) & 1}  win0/1={(DISPCNT >> 13) & 3}")
    for n, cnt in enumerate([BG0CNT, BG1CNT, BG2CNT, BG3CNT]):
        prio = cnt & 3
        charBase = (cnt >> 2) & 3
        mosaic = (cnt >> 6) & 1
        bpp = (cnt >> 7) & 1  # 0=4bpp, 1=8bpp
        mapBase = (cnt >> 8) & 0x1F
        wrap = (cnt >> 13) & 1
        sz = (cnt >> 14) & 3
        print(f"  BG{n}CNT  = 0x{cnt:04x}  prio={prio}  charBase={charBase} ({charBase * 0x4000:#x})  mapBase={mapBase} ({mapBase * 0x800:#x})  bpp={'8' if bpp else '4'}  size={sz}")
    print(f"  BG0 ofs  = ({BG0HOFS}, {BG0VOFS})")
    print(f"  BG1 ofs  = ({BG1HOFS}, {BG1VOFS})")
    print(f"  WIN0H/V  = 0x{WIN0H:04x} / 0x{WIN0V:04x}")
    print(f"  WININ    = 0x{WININ:04x}  WINOUT = 0x{WINOUT:04x}")
    print(f"  BLDCNT   = 0x{BLDCNT:04x}  BLDALPHA = 0x{BLDALPHA:04x}  BLDY = 0x{BLDY:04x}")

    # Palette (16 banks of 16 colors, BG then OBJ)
    print("\n── PALETTE (BG palette banks 0-15, 16 colors each) ──────────")
    for bank in range(16):
        colors = []
        for i in range(16):
            c = u16(pltt, bank * 32 + i * 2)
            r = c & 0x1F
            g = (c >> 5) & 0x1F
            b = (c >> 10) & 0x1F
            colors.append(f"{r:2}/{g:2}/{b:2}")
        print(f"  BG bank {bank:2}: " + " ".join(c for c in colors[:8]) + " | " + " ".join(c for c in colors[8:]))

    print("\n── PALETTE (OBJ palette banks 0-15) ─────────────────────────")
    for bank in range(16):
        colors = []
        for i in range(16):
            c = u16(pltt, 0x200 + bank * 32 + i * 2)
            if c == 0:
                colors.append("--")
            else:
                r = c & 0x1F
                g = (c >> 5) & 0x1F
                b = (c >> 10) & 0x1F
                colors.append(f"{r:2}/{g:2}/{b:2}")
        # Skip empty banks
        non_empty = sum(1 for c in colors if c != "--")
        if non_empty > 1:  # skip bank with only entry 0 (which is just transparent)
            print(f"  OBJ bank {bank:2}: " + " ".join(c for c in colors[:8]) + " | " + " ".join(c for c in colors[8:]))

    # VRAM key offsets
    print("\n── VRAM USAGE (non-zero byte counts in 256-byte windows) ────")
    landmarks = [
        (0x0000, "BG charBase 0 (start of VRAM)"),
        (0x1000, "+4KB"),
        (0x2000, "+8KB"),
        (0x3000, "+12KB"),
        (0x3800, "BG screenBase 7"),
        (0x3C00, "+screen 7+512"),
        (0x4000, "BG charBase 1"),
        (0x6000, "BG screenBase 12"),
        (0x8000, "BG charBase 2"),
        (0xA000, "BG screenBase 20"),
        (0xC000, "BG charBase 3"),
        (0xE000, "BG screenBase 28"),
        (0xF000, "BG screenBase 30"),
        (0xF800, "BG screenBase 31"),
        (0x10000, "OBJ charBase 0 (16KB)"),
        (0x14000, "OBJ charBase 1 (20KB)"),
    ]
    for off, label in landmarks:
        end = min(off + 256, len(vram))
        if off >= len(vram):
            continue
        nz = sum(1 for b in vram[off:end] if b != 0)
        marker = " ★" if nz > 50 else ""
        print(f"  vram[0x{off:05x}] non-zero: {nz:3}/{end - off}  {label}{marker}")

    # OAM analysis (first few sprites)
    print("\n── OAM (first 16 sprites) ───────────────────────────────────")
    for i in range(16):
        attr0 = u16(oam, i * 8)
        attr1 = u16(oam, i * 8 + 2)
        attr2 = u16(oam, i * 8 + 4)
        if attr0 == 0 and attr1 == 0 and attr2 == 0:
            continue
        y = attr0 & 0xFF
        affine = (attr0 >> 8) & 3  # 0=normal, 1=affine, 2=hidden, 3=double
        objMode = (attr0 >> 10) & 3
        bpp = (attr0 >> 13) & 1
        shape = (attr0 >> 14) & 3
        x = attr1 & 0x1FF
        size = (attr1 >> 14) & 3
        tileId = attr2 & 0x3FF
        prio = (attr2 >> 10) & 3
        palBank = (attr2 >> 12) & 0xF
        print(f"  OAM[{i:2}] x={x:3} y={y:3}  shape={shape} size={size} affine={affine} mode={objMode} tile={tileId:3} prio={prio} pal={palBank}")


if __name__ == "__main__":
    main()
