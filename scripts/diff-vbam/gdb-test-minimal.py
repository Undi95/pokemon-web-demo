"""Minimal GDB RSP test for VBA-M stub. Just send '?' and see what happens.
Based on VBA-M source code analysis (gbaRemote.cpp:remoteStubMain) :
- Server does NOT send initial signal, just enters recv loop
- Client sends $cmd#csum, server replies $data#csum
- Each side sends + ACK after receiving a valid packet (= via remotePutPacket loop)
"""
import socket, sys, time

def chk(s):
    return sum(s.encode() if isinstance(s, str) else s) & 0xFF

def send_pkt(sock, cmd):
    pkt = f"${cmd}#{chk(cmd):02x}".encode()
    print(f"  → send: {pkt!r}")
    sock.sendall(pkt)

def recv_loop(sock, timeout=5.0, label=""):
    """Recv any data for `timeout` seconds, print everything."""
    sock.settimeout(timeout)
    buf = b""
    end = time.time() + timeout
    while time.time() < end:
        try:
            chunk = sock.recv(4096)
            if not chunk:
                print(f"  ← {label}: peer closed")
                break
            buf += chunk
            print(f"  ← {label}: recv {len(chunk)}B = {chunk[:80]!r}")
        except socket.timeout:
            if buf:
                break
            print(f"  ← {label}: timeout (no data)")
            break
    return buf

print("Connecting to 127.0.0.1:55555...")
s = socket.socket()
s.settimeout(5)
s.connect(("127.0.0.1", 55555))
print("Connected.")

# Critical : wait for VBA-M to exit ModalPause (= close 'Waiting for GDB' dialog),
# resume main loop, and enter remoteStubMain which will start recv'ing.
# Without this delay, our first command races with VBA-M startup → stub misses it.
print("Waiting 500ms for VBA-M to enter stub mode...")
time.sleep(0.5)

# Step 1 : drain any initial data (= might be initial $T05 signal or nothing)
print("\nStep 1: drain initial data (3s window)...")
initial = recv_loop(s, timeout=3.0, label="initial")
if b"$" in initial and b"#" in initial:
    s.sendall(b"+")
    print(f"  → ACKed initial packet")

# Step 2 : send '?' to ask halt reason
print("\nStep 2: send '?' (halt reason query)...")
send_pkt(s, "?")
reply = recv_loop(s, timeout=5.0, label="? reply")
if b"$" in reply and b"#" in reply:
    s.sendall(b"+")
    print(f"  → ACKed reply")

# Step 3 : send 'm5000000,40' (= read 64 bytes of palette)
print("\nStep 3: send 'm5000000,40' (read 64B PLTT)...")
send_pkt(s, "m5000000,40")
reply = recv_loop(s, timeout=5.0, label="m reply")
if b"$" in reply and b"#" in reply:
    s.sendall(b"+")

print("\nDone.")
s.close()
