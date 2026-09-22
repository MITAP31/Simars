export type SessionPayload = {
  userId: string;
  username: string;
  role: string;
  exp: number; // Unix timestamp in seconds
  iat: number; // Unix timestamp in seconds
};

export const SESSION_COOKIE_NAME = "simars_session";

// Default expiration: 8 hours. Remember Me: 30 days.
export const SESSION_EXPIRY_DEFAULT = 8 * 60 * 60; // 8 hours in seconds
export const SESSION_EXPIRY_REMEMBER = 30 * 24 * 60 * 60; // 30 days in seconds

function getSecretBytes(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "simars_fallback_secret_for_local_development_only_change_in_prod";
  return new TextEncoder().encode(secret);
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let m = str.replace(/-/g, "+").replace(/_/g, "/");
  while (m.length % 4) m += "=";
  const binary = atob(m);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Membuat token sesi bertanda tangan HMAC-SHA256 (Web Crypto API)
 */
export async function signSession(
  data: { userId: string; username: string; role: string },
  maxAgeSeconds: number
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    userId: data.userId,
    username: data.username,
    role: data.role,
    iat: now,
    exp: now + maxAgeSeconds,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const headerEnc = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadEnc = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const dataToSign = `${headerEnc}.${payloadEnc}`;

  const key = await crypto.subtle.importKey(
    "raw",
    getSecretBytes() as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign) as unknown as BufferSource
  );

  const sigEnc = base64UrlEncode(signature);
  return `${dataToSign}.${sigEnc}`;
}

/**
 * Memverifikasi integritas, tanda tangan, dan expiration token sesi.
 * Mengembalikan SessionPayload jika valid, atau null jika invalid/expired/manipulasi.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [headerEnc, payloadEnc, sigEnc] = parts;
    const dataToVerify = `${headerEnc}.${payloadEnc}`;
    const signatureBytes = base64UrlDecode(sigEnc);

    const key = await crypto.subtle.importKey(
      "raw",
      getSecretBytes() as unknown as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      new TextEncoder().encode(dataToVerify) as unknown as BufferSource
    );

    if (!isValid) {
      return null; // Tanda tangan tidak cocok / token dimanipulasi
    }

    const payloadBytes = base64UrlDecode(payloadEnc);
    const payload: SessionPayload = JSON.parse(new TextDecoder().decode(payloadBytes));

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null; // Sesi kadaluarsa
    }

    if (!payload.userId || !payload.role) {
      return null; // Format data sesi tidak lengkap
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Opsi standar Cookie HttpOnly untuk sesi
 */
export function getCookieConfig(maxAgeSeconds: number) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
