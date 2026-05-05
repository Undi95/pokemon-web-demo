#!/usr/bin/env python3
"""Diff VBA-M save state (.sgm) vs our runtime dump (.json from preview eval).

Useful when GDB stub doesn't cooperate — VBA-M save states are gzipped binary
dumps containing IRAM/PRAM/WRAM/VRAM/OAM/IOREGS in known offsets. We extract
our equivalent via window.debug.dumpState().

Usage :
  python diff-savestate.py path/to/savestate.sgm path/to/ours-dump.json
"""
import sys
import os
import json
import base64
import gzip
import struct


def u16(buf, off):
    return buf[off] | (buf[off + 1] << 8)


def find_pram_offset(decompressed):
    """Find where PRAM (palette RAM) starts in decompressed save state.
    Heuristic: PRAM bank 0 entry 0 is always 0x0000 (transparent), and typical
    Pokemon scenes have the dialog box gradient right after.

    More reliable: known structure from gba.cpp:CPUWriteState — header + IRAM(32KB) before PRAM.
    Using the empirically-verified offset from save state version 10."""
    # Search for a unique PRAM signature : Birch dialogue scene has bank 0 starting
    # with 0x0000 0x53FF 0x37FF 0x2F7B (= forest gradient).
    sig = bytes.fromhex('00 00 ff 53 ff 37 7b 2f f7 26 73 1e ef 19 6b 11')
    pos = decompressed.find(sig)
    return pos if pos >= 0 else None


def parse_savestate(path):
    """Parse VBA-M .sgm save state, extract memory regions."""
    with open(path, "rb") as f:
        compressed = f.read()
    if compressed[:2] == b"\x1f\x8b":
        data = gzip.decompress(compressed)
    else:
        data = compressed

    # Find PRAM via signature, then compute other offsets from known sizes.
    pram_off = find_pram_offset(data)
    if pram_off is None:
        raise RuntimeError("Could not locate PRAM in save state")

    PRAM_SIZE = 0x400
    WRAM_SIZE = 0x40000
    VRAM_SIZE = 0x18000
    OAM_SIZE = 0x400

    # Layout : header...IRAM(32KB)...PRAM(1KB)...WRAM(256KB)...VRAM(96KB)...OAM(1KB)...PIX...IOMEM(1KB)
    pram = data[pram_off:pram_off + PRAM_SIZE]
    wram_off = pram_off + PRAM_SIZE
    wram = data[wram_off:wram_off + WRAM_SIZE]
    vram_off = wram_off + WRAM_SIZE
    vram = data[vram_off:vram_off + VRAM_SIZE]
    oam_off = vram_off + VRAM_SIZE
    oam = data[oam_off:oam_off + OAM_SIZE]

    # IOMEM : find DISPCNT signature in remaining bytes
    after_oam = data[oam_off + OAM_SIZE:]
    # DISPCNT is first 2 bytes of IOMEM. Pokemon dialog scene uses 0x1340.
    # Look for known signature : 40 13 .. .. 0c 1e 03 07 (= DISPCNT, BG0CNT, BG1CNT)
    sig = bytes.fromhex('40 13')
    candidates = []
    idx = 0
    while True:
        p = after_oam.find(sig, idx)
        if p < 0:
            break
        # Verify with BG0CNT @ +8
        bg0cnt = after_oam[p + 8] | (after_oam[p + 9] << 8) if p + 10 <= len(after_oam) else 0
        bg1cnt = after_oam[p + 10] | (after_oam[p + 11] << 8) if p + 12 <= len(after_oam) else 0
        if bg0cnt == 0x1e0c and bg1cnt == 0x0703:
            candidates.append(p)
        idx = p + 1
    if candidates:
        ioregs_off_in_after = candidates[0]
        ioregs = after_oam[ioregs_off_in_after:ioregs_off_in_after + 0x60]
    else:
        # Fallback : use first 0x60 bytes after PIX (= unknown size, try 0x9700)
        ioregs = b"\x00" * 0x60

    return {
        "pram": pram,
        "wram": wram,
        "vram": vram,
        "oam": oam,
        "ioregs": ioregs,
    }


def parse_ours_json(path):
    with open(path, "r") as f:
        data = json.load(f)
    if isinstance(data, str):
        data = json.loads(data)
    return {
        "pram": base64.b64decode(data["pltt"]),
        "vram": base64.b64decode(data["vram"]),
        "oam": base64.b64decode(data["oam"]),
        "ioregs": base64.b64decode(data["ioregs"]),
        "meta": {
            "callback2": data.get("callback2"),
            "frameCounter": data.get("frameCounter"),
            "taskCount": data.get("taskCount"),
        },
    }


def diff_ioregs(vbam, ours, report):
    REGS = [
        ("DISPCNT", 0x00), ("BG0CNT", 0x08), ("BG1CNT", 0x0A),
        ("BG2CNT", 0x0C), ("BG3CNT", 0x0E),
        ("BG0HOFS", 0x10), ("BG0VOFS", 0x12),
        ("BG1HOFS", 0x14), ("BG1VOFS", 0x16),
        ("BLDCNT", 0x50), ("BLDALPHA", 0x52), ("BLDY", 0x54),
    ]
    report.append("\n── IO REGISTERS ──────────────────────────────")
    diffs = 0
    for name, off in REGS:
        v = u16(vbam, off)
        o = u16(ours, off)
        if v == o:
            report.append(f"  ✓ {name:10} = 0x{v:04x}")
        else:
            report.append(f"  ✗ {name:10} VBA=0x{v:04x}  ours=0x{o:04x}")
            diffs += 1
    return diffs


def diff_palette(vbam, ours, report):
    report.append("\n── PALETTE ───────────────────────────────────")
    diffs = 0
    for area, base in [("BG", 0), ("OBJ", 0x200)]:
        for bank in range(16):
            mismatches = []
            for i in range(16):
                v = u16(vbam, base + bank * 32 + i * 2)
                o = u16(ours, base + bank * 32 + i * 2)
                if v != o:
                    mismatches.append((i, v, o))
            if mismatches:
                report.append(f"  ✗ {area} bank {bank:2}: {len(mismatches)} diff(s)")
                for i, v, o in mismatches[:3]:
                    report.append(f"     [{i:2}] VBA=0x{v:04x}  ours=0x{o:04x}")
                diffs += len(mismatches)
            else:
                non_zero = sum(1 for i in range(16) if u16(vbam, base + bank * 32 + i * 2) != 0)
                if non_zero > 1:
                    report.append(f"  ✓ {area} bank {bank:2}: 16/16 match  ({non_zero} non-zero)")
    return diffs


def diff_oam(vbam, ours, report):
    report.append("\n── OAM (visible sprites) ─────────────────────")
    diffs = 0
    for i in range(128):
        a0v = u16(vbam, i * 8); a1v = u16(vbam, i * 8 + 2); a2v = u16(vbam, i * 8 + 4)
        a0o = u16(ours, i * 8); a1o = u16(ours, i * 8 + 2); a2o = u16(ours, i * 8 + 4)
        if a0v == 0 and a1v == 0 and a2v == 0 and a0o == 0 and a1o == 0 and a2o == 0:
            continue
        is_hidden = lambda a: ((a >> 8) & 3) == 2 or ((a & 0xFF) >= 160 and not ((a >> 8) & 1))
        # Pokemon hidden = y >= 160 with affine off
        x_v, y_v = a1v & 0x1FF, a0v & 0xFF
        x_o, y_o = a1o & 0x1FF, a0o & 0xFF
        # Skip if both off-screen
        if (y_v >= 160 or x_v >= 240) and (y_o >= 160 or x_o >= 240):
            continue
        tile_v = a2v & 0x3FF; pal_v = (a2v >> 12) & 0xF
        tile_o = a2o & 0x3FF; pal_o = (a2o >> 12) & 0xF
        if a0v == a0o and a1v == a1o and a2v == a2o:
            report.append(f"  ✓ OAM[{i:3}] x={x_v:3} y={y_v:3} tile={tile_v:3} pal={pal_v}")
        else:
            report.append(f"  ✗ OAM[{i:3}] VBA=({x_v:3},{y_v:3}) tile={tile_v:3} pal={pal_v}  ours=({x_o:3},{y_o:3}) tile={tile_o:3} pal={pal_o}")
            diffs += 1
    return diffs


def diff_vram_regions(vbam, ours, ioregs_vbam, report):
    report.append("\n── VRAM REGIONS ──────────────────────────────")
    diffs = 0
    for bg in range(4):
        cnt = u16(ioregs_vbam, 0x08 + bg * 2)
        if cnt == 0:
            continue
        char_idx = (cnt >> 2) & 3
        map_idx = (cnt >> 8) & 0x1F
        char_off = char_idx * 0x4000
        map_off = map_idx * 0x800
        # Compare char data first 1KB
        v_char = vbam[char_off:char_off + 1024]
        o_char = ours[char_off:char_off + 1024]
        char_diff = sum(1 for j in range(min(1024, len(v_char), len(o_char))) if v_char[j] != o_char[j])
        v_map = vbam[map_off:map_off + 0x800]
        o_map = ours[map_off:map_off + 0x800]
        map_diff = sum(1 for j in range(min(0x800, len(v_map), len(o_map))) if v_map[j] != o_map[j])
        verdict_c = "✓" if char_diff == 0 else f"✗ {char_diff}/1024"
        verdict_m = "✓" if map_diff == 0 else f"✗ {map_diff}/2048"
        report.append(f"  BG{bg} cnt=0x{cnt:04x} charBase={char_idx} ({char_off:#x}) [{verdict_c}]  mapBase={map_idx} ({map_off:#x}) [{verdict_m}]")
        diffs += char_diff + map_diff
    # OBJ VRAM start
    obj_diff = sum(1 for j in range(0x10000, min(0x14000, len(vbam), len(ours))) if vbam[j] != ours[j])
    verdict = "✓" if obj_diff == 0 else f"✗ {obj_diff}/16384"
    report.append(f"  OBJ VRAM[0x10000..0x14000] [{verdict}]")
    diffs += obj_diff
    return diffs


def main():
    if len(sys.argv) < 3:
        print("Usage: diff-savestate.py <savestate.sgm> <ours-dump.json>")
        sys.exit(1)
    sgm_path = sys.argv[1]
    ours_path = sys.argv[2]

    print(f"Parsing VBA-M save state : {sgm_path}")
    vbam = parse_savestate(sgm_path)
    print(f"  pram={len(vbam['pram'])} vram={len(vbam['vram'])} oam={len(vbam['oam'])} ioregs={len(vbam['ioregs'])}")

    print(f"\nParsing our dump : {ours_path}")
    ours = parse_ours_json(ours_path)
    print(f"  pram={len(ours['pram'])} vram={len(ours['vram'])} oam={len(ours['oam'])} ioregs={len(ours['ioregs'])}")
    print(f"  meta : {ours['meta']}")

    report = ["=" * 60, f"DIFF VBA-M ({sgm_path}) vs OURS", "=" * 60]
    if "meta" in ours:
        m = ours["meta"]
        report.append(f"Our state : callback2={m.get('callback2')}  frame={m.get('frameCounter')}  tasks={m.get('taskCount')}")

    n_io = diff_ioregs(vbam["ioregs"], ours["ioregs"], report)
    n_pal = diff_palette(vbam["pram"], ours["pram"], report)
    n_oam = diff_oam(vbam["oam"], ours["oam"], report)
    n_vram = diff_vram_regions(vbam["vram"], ours["vram"], vbam["ioregs"], report)

    report.append("")
    report.append("─" * 60)
    report.append(f"SUMMARY : ioregs={n_io} pal={n_pal} oam={n_oam} vram={n_vram}")
    total = n_io + n_pal + n_oam + n_vram
    report.append(f"  → {'✅ all match' if total == 0 else f'❌ {total} differences total'}")
    report.append("─" * 60)

    print("\n".join(report))


if __name__ == "__main__":
    main()
