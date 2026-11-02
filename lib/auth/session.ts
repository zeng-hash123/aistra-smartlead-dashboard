const SESSION_COOKIE_NAME = "sl_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  return process.env.SESSION_SECRET || process.env.DASHBOARD_PASSWORD || "fallback-secret-smartlead-dashboard-32";
}

function strToBuffer(str: string): ArrayBuffer {
  const enc = new TextEncoder().encode(str);
  return enc.buffer.slice(enc.byteOffset, enc.byteOffset + enc.byteLength) as ArrayBuffer;
}

function toBase64Url(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64url");
}

function fromBase64Url(str: string): string {
  return Buffer.from(str, "base64url").toString("utf8");
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    strToBuffer(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed session token: payload + '.' + signature using universal Web Crypto
 */
export async function createSessionToken(): Promise<string> {
  const secret = getSecret();
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payloadStr = JSON.stringify({ authenticated: true, exp: expiresAt });
  const payloadBuf = strToBuffer(payloadStr);
  const payloadBase64 = toBase64Url(payloadBuf);

  const key = await getHmacKey(secret);
  const signatureBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    strToBuffer(payloadBase64)
  );
  const signatureBase64 = toBase64Url(signatureBuf);

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies session token signature and expiry using universal Web Crypto
 */
export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadBase64, signatureBase64] = parts;

    const secret = getSecret();
    const key = await getHmacKey(secret);

    const sigNode = Buffer.from(signatureBase64, "base64url");
    const sigBuf = sigNode.buffer.slice(sigNode.byteOffset, sigNode.byteOffset + sigNode.byteLength) as ArrayBuffer;

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuf,
      strToBuffer(payloadBase64)
    );

    if (!isValid) return false;

    const decoded = JSON.parse(fromBase64Url(payloadBase64));
    if (!decoded.authenticated || !decoded.exp) return false;
    if (Date.now() > decoded.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_MS };
