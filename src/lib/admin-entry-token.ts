const TOKEN_LIFETIME_SECONDS = 5 * 60;

const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(n: number, b: number): number {
    return (n >>> b) | (n << (32 - b));
}

function rawSha256(data: Uint8Array): Uint8Array {
    let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
    let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;

    const byteLen = data.length;
    const bitLen = byteLen * 8;
    const padLen = (byteLen % 64 < 56) ? (56 - (byteLen % 64)) : (120 - (byteLen % 64));
    const totalLen = byteLen + padLen + 8;
    const padded = new Uint8Array(totalLen);
    padded.set(data);
    padded[byteLen] = 0x80;

    const view = new DataView(padded.buffer);
    view.setBigUint64(totalLen - 8, BigInt(bitLen), false);

    const W = new Uint32Array(64);

    for (let i = 0; i < totalLen; i += 64) {
        for (let t = 0; t < 16; t++) {
            W[t] = view.getUint32(i + t * 4, false);
        }
        for (let t = 16; t < 64; t++) {
            const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
            const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
            W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
        }

        let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;

        for (let t = 0; t < 64; t++) {
            const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
            const ch = (e & f) ^ ((~e) & g);
            const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
            const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) >>> 0;

            h = g; g = f; f = e; e = (d + temp1) >>> 0;
            d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
        }

        H0 = (H0 + a) >>> 0; H1 = (H1 + b) >>> 0; H2 = (H2 + c) >>> 0; H3 = (H3 + d) >>> 0;
        H4 = (H4 + e) >>> 0; H5 = (H5 + f) >>> 0; H6 = (H6 + g) >>> 0; H7 = (H7 + h) >>> 0;
    }

    const out = new Uint8Array(32);
    const outView = new DataView(out.buffer);
    outView.setUint32(0, H0, false); outView.setUint32(4, H1, false);
    outView.setUint32(8, H2, false); outView.setUint32(12, H3, false);
    outView.setUint32(16, H4, false); outView.setUint32(20, H5, false);
    outView.setUint32(24, H6, false); outView.setUint32(28, H7, false);
    return out;
}

function hmacSha256(keyStr: string, msgStr: string): Uint8Array {
    const keyBytes = new TextEncoder().encode(keyStr);
    const msgBytes = new TextEncoder().encode(msgStr);

    const kBlock = new Uint8Array(64);
    if (keyBytes.length > 64) {
        kBlock.set(rawSha256(keyBytes));
    } else {
        kBlock.set(keyBytes);
    }

    const oKeyPad = new Uint8Array(64);
    const iKeyPad = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
        oKeyPad[i] = kBlock[i] ^ 0x5c;
        iKeyPad[i] = kBlock[i] ^ 0x36;
    }

    const inner = new Uint8Array(64 + msgBytes.length);
    inner.set(iKeyPad);
    inner.set(msgBytes, 64);
    const innerHash = rawSha256(inner);

    const outer = new Uint8Array(64 + 32);
    outer.set(oKeyPad);
    outer.set(innerHash, 64);
    return rawSha256(outer);
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

function getEntrySecret(): string {
    const secret = process.env.ADMIN_ENTRY_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error(
            "ADMIN_ENTRY_SECRET must be configured and at least 32 characters long."
        );
    }
    return secret;
}

export async function createAdminEntryToken(): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
    const payload = String(expiresAt);
    const secret = getEntrySecret();
    const sigBytes = hmacSha256(secret, payload);
    const signature = toBase64Url(sigBytes);

    return `${payload}.${signature}`;
}

export async function verifyAdminEntryToken(
    token: string | undefined
): Promise<boolean> {
    if (!token || token.length > 256) {
        return false;
    }

    try {
        const parts = token.split(".");
        if (
            parts.length !== 2 ||
            !/^\d+$/.test(parts[0]) ||
            !/^[A-Za-z0-9_-]+$/.test(parts[1])
        ) {
            return false;
        }

        const expiresAt = Number(parts[0]);
        const now = Math.floor(Date.now() / 1000);

        if (
            !Number.isSafeInteger(expiresAt) ||
            expiresAt <= now ||
            expiresAt > now + TOKEN_LIFETIME_SECONDS
        ) {
            return false;
        }

        const secret = getEntrySecret();
        const expectedSigBytes = hmacSha256(secret, parts[0]);
        const expectedSignature = toBase64Url(expectedSigBytes);

        return constantTimeEqual(parts[1], expectedSignature);
    } catch {
        return false;
    }
}
