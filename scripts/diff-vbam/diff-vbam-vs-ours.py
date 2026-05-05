#!/usr/bin/env python3
"""F tool : diff VBA-M ground truth vs our runtime state.

Usage :
  1. User pauses VBA-M wherever they want
  2. User enables Tools → GDB → Wait for connection on port 55555
  3. Run this script (no args needed)

What it does :
  1. Connects to GDB:55555 and dumps PLTT/IOREGS/OAM/VRAM (= 1 connection)
  2. Calls preview eval to get our runtime state via window.debug.dumpState()
  3. Side-by-side diff per region : registers / palette / OAM / VRAM
  4. Reports exact mismatches with byte offsets

Outputs to debug/vbam-diffs/<timestamp>/ :
  - vbam-{pltt,vram,oam,ioregs}.bin (= GDB dumps)
  - ours-{pltt,vram,oam,ioregs}.bin (= our runtime, decoded from base64)
  - report.txt (= human-readable diff)

Exit 0 if all regions match, 1 if differences found.
"""
import socket
import os
import sys
import time
import base64
import json
import urllib.request
import urllib.error
from datetime import datetime

# ─── Config ────────────────────────────────────────────────────────────────
HOST = "127.0.0.1"
GDB_PORT = 55555
PREVIEW_PORT = 5173  # Vite dev server (= our preview)
PROJECT_ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT_BASE = os.path.join(PROJECT_ROOT, "debug", "vbam-diffs")


# ─── GDB Remote Serial Protocol ────────────────────────────────────────────
def _checksum(data):
    return sum(data.encode() if isinstance(data, str) else data) & 0xFF


def _send_packet(sock, cmd):
    pkt = f"${cmd}#{_checksum(cmd):02x}"
    sock.sendall(pkt.encode())


def _get_packet(sock):
    """Wait for $...#XX packet. Send ACK on receipt. Returns payload."""
    buf = b""
    while True:
        chunk = sock.recv(8192)
        if not chunk:
            return None
        buf += chunk
        start = buf.find(b"$")
        if start < 0:
            continue
        end = buf.find(b"#", start + 1)
        if end >= 0 and len(buf) >= end + 3:
            payload = buf[start + 1:end].decode("latin-1")
            sock.sendall(b"+")
            return payload


def _read_mem(sock, addr, length, chunk=512):
    """Read GBA memory via RSP m<addr>,<len>. Returns bytes."""
    out = bytearray()
    pos = 0
    while pos < length:
        n = min(chunk, length - pos)
        _send_packet(sock, f"m{addr + pos:x},{n:x}")
        reply = _get_packet(sock)
        if reply is None or reply.startswith("E"):
            print(f"  ! read_mem error at offset {pos:#x}: {reply!r}")
            break
        try:
            out.extend(bytes.fromhex(reply))
        except ValueError as e:
            print(f"  ! bad hex at {pos:#x}: {e}")
            break
        pos += n
    return bytes(out)


def dump_vbam_via_gdb(out_dir):
    """Connect to VBA-M GDB stub on 55555 and dump 4 regions."""
    print(f"[gdb] Connecting to {HOST}:{GDB_PORT}...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(10)
    sock.connect((HOST, GDB_PORT))
    print(f"[gdb] Connected.")

    # No pre-emptive ACK — VBA-M sends $T05... stop signal first, we ACK that.
    # Try to read initial stop signal (= $T05thread:01;#XX)
    sock.settimeout(2)
    try:
        initial = sock.recv(4096)
        if b"$" in initial and b"#" in initial:
            sock.sendall(b"+")  # ack the stop signal
            print(f"[gdb] Initial: {initial[:60]!r} (ACKed)")
        else:
            print(f"[gdb] Initial: {initial[:60]!r} (no $...# pattern)")
    except socket.timeout:
        print(f"[gdb] (no initial packet — sending '?' to wake up stub)")
        # Some stubs need an explicit halt query to start responding
        _send_packet(sock, "?")
        try:
            reply = _get_packet(sock)
            print(f"[gdb] '?' reply: {reply!r}")
        except Exception as e:
            print(f"[gdb] '?' failed: {e}")
    sock.settimeout(15)

    regions = [
        ("pltt", 0x05000000, 0x400),
        ("ioregs", 0x04000000, 0x60),
        ("oam", 0x07000000, 0x400),
        ("vram", 0x06000000, 0x18000),
    ]
    results = {}
    for name, addr, length in regions:
        print(f"[gdb] Reading {name} @ {addr:#x} ({length} bytes)...")
        data = _read_mem(sock, addr, length)
        if len(data) != length:
            print(f"[gdb] ! short read {len(data)}/{length}")
        results[name] = data
        with open(os.path.join(out_dir, f"vbam-{name}.bin"), "wb") as f:
            f.write(data)

    try:
        _send_packet(sock, "D")  # Detach
    except Exception:
        pass
    sock.close()
    return results


# ─── Preview eval (= our runtime via Vite HMR / browser) ───────────────────
def dump_ours_via_preview(out_dir):
    """Eval window.debug.dumpState() in the preview browser context.

    Uses the Claude Preview MCP eval mechanism if available, else falls back
    to a local fetch (requires the preview to expose an HTTP eval endpoint —
    not currently set up; this is a placeholder for future use).

    For now, this expects the user to manually run the dumpState in their
    browser console, save the JSON to a file, and provide it via env var
    OURS_DUMP_JSON. If env var is missing, prints instructions.
    """
    json_path = os.environ.get("OURS_DUMP_JSON")
    if json_path and os.path.isfile(json_path):
        with open(json_path, "r") as f:
            data = json.load(f)
        # preview_eval saves "JSON.stringify(...)" which produces a JSON STRING.
        # Parse a second time if we got a string instead of an object.
        if isinstance(data, str):
            data = json.loads(data)
    else:
        # Auto-fetch via preview HTTP endpoint (= TODO if exposed).
        # For now, print instructions and exit.
        print()
        print("[preview] Cannot auto-dump from preview. Provide OURS_DUMP_JSON env var.")
        print("[preview] To get the dump JSON :")
        print("  1. Open browser console on http://localhost:5173")
        print("  2. Run: copy(JSON.stringify(window.debug.dumpState()))")
        print("  3. Paste into a file (e.g. ours-dump.json)")
        print("  4. Re-run this script with: OURS_DUMP_JSON=ours-dump.json python ...")
        sys.exit(2)

    # Decode base64 regions and write .bin files matching VBA-M filenames
    regions_b64 = {
        "pltt": data["pltt"],
        "ioregs": data["ioregs"],
        "oam": data["oam"],
        "vram": data["vram"],
    }
    results = {}
    for name, b64 in regions_b64.items():
        raw = base64.b64decode(b64)
        results[name] = raw
        with open(os.path.join(out_dir, f"ours-{name}.bin"), "wb") as f:
            f.write(raw)
    results["meta"] = {
        "callback2": data.get("callback2"),
        "frameCounter": data.get("frameCounter"),
        "taskCount": data.get("taskCount"),
    }
    return results


# ─── Diff helpers ──────────────────────────────────────────────────────────
def u16(buf, off):
    return buf[off] | (buf[off + 1] << 8)


def diff_ioregs(vbam, ours, report):
    """Compare key IO registers."""
    report.append("\n── IO REGISTERS ────────────────────────────────────────────")
    REGS = [
        ("DISPCNT",  0x00),
        ("BG0CNT",   0x08),
        ("BG1CNT",   0x0A),
        ("BG2CNT",   0x0C),
        ("BG3CNT",   0x0E),
        ("BG0HOFS",  0x10), ("BG0VOFS", 0x12),
        ("BG1HOFS",  0x14), ("BG1VOFS", 0x16),
        ("BLDCNT",   0x50),
        ("BLDALPHA", 0x52),
        ("BLDY",     0x54),
    ]
    diffs = 0
    for name, off in REGS:
        v = u16(vbam, off)
        o = u16(ours, off)
        if v == o:
            report.append(f"  ✓ {name:10} = 0x{v:04x}")
        else:
            report.append(f"  ✗ {name:10} VBA=0x{v:04x}  ours=0x{o:04x}  diff={v ^ o:04x}")
            diffs += 1
    return diffs


def decode_bgcnt(cnt):
    return {
        "prio": cnt & 3,
        "charBase": (cnt >> 2) & 3,
        "mapBase": (cnt >> 8) & 0x1F,
        "bpp8": (cnt >> 7) & 1,
        "size": (cnt >> 14) & 3,
    }


def diff_palette(vbam, ours, report):
    """Compare BG (banks 0-15) + OBJ (banks 0-15) palettes."""
    report.append("\n── PALETTE (BG banks 0-15) ─────────────────────────────────")
    diffs_bg = 0
    for bank in range(16):
        diff_entries = []
        for i in range(16):
            v = u16(vbam, bank * 32 + i * 2)
            o = u16(ours, bank * 32 + i * 2)
            if v != o:
                diff_entries.append((i, v, o))
        if diff_entries:
            report.append(f"  ✗ bank {bank:2}: {len(diff_entries)} diff(s)")
            for i, v, o in diff_entries[:4]:
                report.append(f"     [{i:2}] VBA=0x{v:04x}  ours=0x{o:04x}")
            if len(diff_entries) > 4:
                report.append(f"     ... +{len(diff_entries) - 4} more")
            diffs_bg += len(diff_entries)
        else:
            # Count non-zero entries to skip empty banks
            non_zero = sum(1 for i in range(16) if u16(vbam, bank * 32 + i * 2) != 0)
            if non_zero > 1:
                report.append(f"  ✓ bank {bank:2}: 16/16 match ({non_zero} non-zero)")

    report.append("\n── PALETTE (OBJ banks 0-15) ────────────────────────────────")
    diffs_obj = 0
    for bank in range(16):
        diff_entries = []
        for i in range(16):
            v = u16(vbam, 0x200 + bank * 32 + i * 2)
            o = u16(ours, 0x200 + bank * 32 + i * 2)
            if v != o:
                diff_entries.append((i, v, o))
        if diff_entries:
            report.append(f"  ✗ bank {bank:2}: {len(diff_entries)} diff(s)")
            for i, v, o in diff_entries[:4]:
                report.append(f"     [{i:2}] VBA=0x{v:04x}  ours=0x{o:04x}")
            diffs_obj += len(diff_entries)
        else:
            non_zero = sum(1 for i in range(16) if u16(vbam, 0x200 + bank * 32 + i * 2) != 0)
            if non_zero > 1:
                report.append(f"  ✓ bank {bank:2}: 16/16 match ({non_zero} non-zero)")
    return diffs_bg + diffs_obj


def diff_oam(vbam, ours, report):
    """Compare visible sprites."""
    report.append("\n── OAM (visible sprites) ───────────────────────────────────")
    diffs = 0
    for i in range(128):
        a0v = u16(vbam, i * 8); a1v = u16(vbam, i * 8 + 2); a2v = u16(vbam, i * 8 + 4)
        a0o = u16(ours, i * 8); a1o = u16(ours, i * 8 + 2); a2o = u16(ours, i * 8 + 4)
        # Skip if both zero (= unused slot)
        if a0v == 0 and a1v == 0 and a2v == 0 and a0o == 0 and a1o == 0 and a2o == 0:
            continue
        # Skip hidden sprites (= affineMode=2, bit 9 of attr0 set with affineMode bit 8 clear)
        is_hidden_v = ((a0v >> 8) & 3) == 2
        is_hidden_o = ((a0o >> 8) & 3) == 2
        if is_hidden_v and is_hidden_o:
            continue
        # Decode VBA-M version
        x_v = a1v & 0x1FF
        y_v = a0v & 0xFF
        tile_v = a2v & 0x3FF
        pal_v = (a2v >> 12) & 0xF
        x_o = a1o & 0x1FF
        y_o = a0o & 0xFF
        tile_o = a2o & 0x3FF
        pal_o = (a2o >> 12) & 0xF
        if a0v == a0o and a1v == a1o and a2v == a2o:
            report.append(f"  ✓ OAM[{i:3}] x={x_v} y={y_v} tile={tile_v} pal={pal_v}")
        else:
            report.append(f"  ✗ OAM[{i:3}] VBA=({x_v},{y_v}) tile={tile_v} pal={pal_v}  ours=({x_o},{y_o}) tile={tile_o} pal={pal_o}")
            diffs += 1
    return diffs


def diff_vram_regions(vbam, ours, vbam_ioregs, report):
    """Compare VRAM regions per BG layer (charBase + mapBase) and OBJ tiles."""
    report.append("\n── VRAM REGIONS ────────────────────────────────────────────")
    diffs = 0
    # Per BG: compare charBase tile data + mapBase tilemap
    for bg in range(4):
        cnt_off = 0x08 + bg * 2
        cntv = u16(vbam_ioregs, cnt_off)
        d = decode_bgcnt(cntv)
        if cntv == 0:
            continue
        char_off = d["charBase"] * 0x4000
        map_off = d["mapBase"] * 0x800
        # Compare char data first 256 bytes
        v_char = vbam[char_off:char_off + 256]
        o_char = ours[char_off:char_off + 256]
        char_diffs = sum(1 for j in range(256) if v_char[j] != o_char[j])
        # Compare full tilemap (= 2KB for screenSize=0)
        map_size = 0x800
        v_map = vbam[map_off:map_off + map_size]
        o_map = ours[map_off:map_off + map_size]
        map_diffs = sum(1 for j in range(map_size) if v_map[j] != o_map[j])
        verdict_char = "✓" if char_diffs == 0 else f"✗ {char_diffs}/256"
        verdict_map = "✓" if map_diffs == 0 else f"✗ {map_diffs}/{map_size}"
        report.append(f"  BG{bg} cnt=0x{cntv:04x} charBase={d['charBase']} (0x{char_off:05x}) [{verdict_char}]  mapBase={d['mapBase']} (0x{map_off:05x}) [{verdict_map}]")
        diffs += char_diffs + map_diffs
    # OBJ VRAM (= 0x10000+, first 4KB tile data)
    obj_diffs = sum(1 for j in range(0x10000, min(0x14000, len(vbam))) if vbam[j] != ours[j])
    verdict = "✓" if obj_diffs == 0 else f"✗ {obj_diffs}/16384"
    report.append(f"  OBJ VRAM[0x10000..0x14000] [{verdict}]")
    diffs += obj_diffs
    return diffs


# ─── Main ──────────────────────────────────────────────────────────────────
def main():
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_dir = os.path.join(OUT_BASE, ts)
    os.makedirs(out_dir, exist_ok=True)
    print(f"[diff] Output dir: {out_dir}\n")

    # Step 1 : VBA-M dump (= GDB).
    vbam = dump_vbam_via_gdb(out_dir)

    # Step 2 : Our runtime dump (= preview eval).
    ours = dump_ours_via_preview(out_dir)

    # Step 3 : Diff per region.
    report = []
    report.append("=" * 70)
    report.append(f"VBAM-vs-OURS DIFF REPORT — {ts}")
    report.append("=" * 70)
    if "meta" in ours:
        m = ours["meta"]
        report.append(f"Our runtime state : callback2={m.get('callback2')}  frame={m.get('frameCounter')}  tasks={m.get('taskCount')}")

    n_io = diff_ioregs(vbam["ioregs"], ours["ioregs"], report)
    n_pal = diff_palette(vbam["pltt"], ours["pltt"], report)
    n_oam = diff_oam(vbam["oam"], ours["oam"], report)
    n_vram = diff_vram_regions(vbam["vram"], ours["vram"], vbam["ioregs"], report)

    report.append("")
    report.append("─" * 70)
    report.append(f"SUMMARY : ioregs={n_io} pal={n_pal} oam={n_oam} vram={n_vram}")
    total = n_io + n_pal + n_oam + n_vram
    report.append(f"  → {'✅ all match' if total == 0 else f'❌ {total} differences total'}")
    report.append("─" * 70)

    text = "\n".join(report)
    with open(os.path.join(out_dir, "report.txt"), "w", encoding="utf-8") as f:
        f.write(text)
    print(text)
    print(f"\n[diff] Report saved : {os.path.join(out_dir, 'report.txt')}")
    sys.exit(0 if total == 0 else 1)


if __name__ == "__main__":
    main()
