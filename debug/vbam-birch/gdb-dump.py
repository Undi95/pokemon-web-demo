"""Dump VRAM/PLTT/OAM/IORegs from VBA-M via GDB Remote Serial Protocol on port 55555."""
import socket
import sys
import os
import time


def checksum(data):
    return sum(data.encode() if isinstance(data, str) else data) & 0xFF


def send_packet(sock, cmd):
    pkt = f"${cmd}#{checksum(cmd):02x}"
    sock.sendall(pkt.encode())


def recv_until(sock, terminator=b"#"):
    """Read bytes until terminator + 2 checksum chars."""
    buf = b""
    while True:
        chunk = sock.recv(4096)
        if not chunk:
            break
        buf += chunk
        # Find $...#XX pattern
        if b"#" in buf and len(buf.split(b"#", 1)[1]) >= 2:
            return buf
    return buf


def get_packet(sock):
    """Wait for and extract a $...#XX packet from the stream. Returns payload.
    Sends ACK to server after receiving the packet."""
    buf = b""
    while True:
        chunk = sock.recv(8192)
        if not chunk:
            break
        buf += chunk
        # Skip leading + (= ACK for our last command) and - (= NAK request resend)
        # Look for $...#XX
        start = buf.find(b"$")
        if start < 0:
            continue
        end = buf.find(b"#", start + 1)
        if end >= 0 and len(buf) >= end + 3:
            payload = buf[start + 1:end].decode("latin-1")
            # Send ACK
            sock.sendall(b"+")
            return payload
    return None


def read_mem(sock, addr, length, chunk=512):
    """Read memory in chunks (RSP m<addr>,<len>). Returns bytes."""
    out = bytearray()
    pos = 0
    while pos < length:
        n = min(chunk, length - pos)
        cmd = f"m{addr + pos:x},{n:x}"
        send_packet(sock, cmd)
        reply = get_packet(sock)
        if reply is None or reply.startswith("E"):
            print(f"  ERROR at offset {pos:#x}: {reply!r}")
            break
        # Reply is hex string, 2 chars per byte
        try:
            chunk_bytes = bytes.fromhex(reply)
        except ValueError as e:
            print(f"  bad hex at {pos:#x}: {reply[:40]!r}... ({e})")
            break
        out.extend(chunk_bytes)
        pos += len(chunk_bytes)
        if pos % 4096 == 0:
            print(f"  {pos}/{length} bytes...")
    return bytes(out)


def main():
    HOST = "127.0.0.1"
    PORT = 55555
    OUT_DIR = os.environ.get('VBAM_DUMP_DIR') or os.path.dirname(os.path.abspath(__file__))

    print(f"Connecting to {HOST}:{PORT}...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(10)
    sock.connect((HOST, PORT))
    print("Connected.")

    # Send pre-emptive ACK (= GDB protocol "client just connected, ready").
    sock.sendall(b"+")

    # Initial handshake — VBA-M GDB stub may send a stop reason on connect
    sock.settimeout(1)
    try:
        initial = sock.recv(4096)
        print(f"Initial: {initial[:80]!r}")
        # Ack any received packet
        if b"$" in initial and b"#" in initial:
            sock.sendall(b"+")
    except socket.timeout:
        print("(no initial packet)")
    sock.settimeout(10)

    # Skip qSupported handshake (= VBA-M doesn't respond reliably). Direct memory reads work.

    regions = [
        ("pltt.bin", 0x05000000, 0x400),
        ("ioregs.bin", 0x04000000, 0x60),
        ("oam.bin", 0x07000000, 0x400),
        ("vram.bin", 0x06000000, 0x18000),
    ]

    for fname, addr, length in regions:
        print(f"\nReading {fname} @ {addr:#x} ({length} bytes)...")
        data = read_mem(sock, addr, length, chunk=512)
        path = os.path.join(OUT_DIR, fname)
        with open(path, "wb") as f:
            f.write(data)
        print(f"  Wrote {len(data)} bytes to {path}")

    # Detach
    send_packet(sock, "D")
    try:
        get_packet(sock)
    except Exception:
        pass
    sock.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
