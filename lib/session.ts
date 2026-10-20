export type SessionPayload = {
  userId: string;
  username: string;
  role: string;
  divisiId?: string | null;
  iat: number; // Unix timestamp in seconds (waktu login awal)
  exp: number; // Unix timestamp in seconds (absolute timeout: iat + 8 jam)
  lastActive: number; // Unix timestamp in seconds (waktu interaksi terakhir)
  sessionId: string; // ID unik sesi untuk lifecycle tracking & revocation
};

export const SESSION_COOKIE_NAME = "simars_session";

// Idle Timeout: 30 menit (1.800 detik)
export const SESSION_IDLE_TIMEOUT = 30 * 60;

// Absolute Session Timeout: Maksimal 8 jam (28.800 detik)
export const SESSION_ABSOLUTE_TIMEOUT = 8 * 60 * 60;

// Backwards compatibility constants
export const SESSION_EXPIRY_DEFAULT = SESSION_ABSOLUTE_TIMEOUT;
export const SESSION_EXPIRY_REMEMBER = SESSION_ABSOLUTE_TIMEOUT;

function getSecretBytes(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  const secretBytes = new TextEncoder().encode(secret ?? "");

  if (
    !secret ||
    secret.trim() !== secret ||
    secretBytes.byteLength < 32 ||
    secret === "simars_fallback_secret_for_local_development_only_change_in_prod" ||
    secret.startsWith("<")
  ) {
    throw new Error(
      "Konfigurasi autentikasi tidak valid. Atur AUTH_SECRET dengan nilai acak minimal 32 byte sebelum menjalankan aplikasi."
    );
  }

  return secretBytes;
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

// =========================================================================
// SESSION REVOCATION STORE (In-Memory, Edge & Node.js Compatible)
// =========================================================================

// Penyimpanan revocation in-memory: key -> exp timestamp
const revokedStore = new Map<string, number>();

/**
 * Mencatat pembatalan sesi (revocation) berdasarkan identifier sesi atau signature token
 */
export function revokeSessionId(idOrSignature: string, exp: number): void {
  revokedStore.set(idOrSignature, exp);
}

/**
 * Membatalkan sesi dari token yang diberikan (misalnya saat logout)
 */
export async function revokeSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [, payloadEnc, sigEnc] = parts;
    const payloadBytes = base64UrlDecode(payloadEnc);
    const payload: SessionPayload = JSON.parse(new TextDecoder().decode(payloadBytes));

    const exp = typeof payload.exp === "number"
      ? payload.exp
      : Math.floor(Date.now() / 1000) + SESSION_ABSOLUTE_TIMEOUT;

    if (payload.sessionId) {
      revokeSessionId(payload.sessionId, exp);
    }
    revokeSessionId(sigEnc, exp);
    return true;
  } catch {
    return false;
  }
}

/**
 * Memeriksa apakah sessionId atau signature token telah dibatalkan
 */
export function isSessionRevoked(sessionId: string | undefined, sigEnc: string): boolean {
  const now = Math.floor(Date.now() / 1000);

  if (sessionId && revokedStore.has(sessionId)) {
    const exp = revokedStore.get(sessionId)!;
    if (exp > now) return true;
    revokedStore.delete(sessionId);
  }

  if (sigEnc && revokedStore.has(sigEnc)) {
    const exp = revokedStore.get(sigEnc)!;
    if (exp > now) return true;
    revokedStore.delete(sigEnc);
  }

  return false;
}

// =========================================================================
// TOKEN GENERATION, REFRESH & VERIFICATION
// =========================================================================

/**
 * Membuat token sesi bertanda tangan HMAC-SHA256 (Web Crypto API)
 */
export async function signSession(
  data: {
    userId: string;
    username: string;
    role: string;
    divisiId?: string | null;
    iat?: number;
    exp?: number;
    lastActive?: number;
    sessionId?: string;
  },
  maxAgeSeconds?: number
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const iat = data.iat ?? now;
  const lastActive = data.lastActive ?? now;
  const effectiveMaxAge = maxAgeSeconds !== undefined
    ? maxAgeSeconds
    : SESSION_ABSOLUTE_TIMEOUT;
  const exp = data.exp ?? (iat + effectiveMaxAge);
  const sessionId = data.sessionId ?? crypto.randomUUID();

  const payload: SessionPayload = {
    userId: data.userId,
    username: data.username,
    role: data.role,
    divisiId: data.divisiId ?? null,
    iat,
    exp,
    lastActive,
    sessionId,
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
 * Memperbarui waktu lastActive sesi (sliding window) tanpa memundurkan batas exp absolut awal
 */
export async function refreshSessionToken(
  session: SessionPayload,
  currentTime?: number
): Promise<string> {
  const now = currentTime ?? Math.floor(Date.now() / 1000);
  return signSession({
    userId: session.userId,
    username: session.username,
    role: session.role,
    divisiId: session.divisiId ?? null,
    iat: session.iat,
    exp: session.exp,
    lastActive: now,
    sessionId: session.sessionId,
  });
}

/**
 * Memverifikasi integritas, tanda tangan, status revocation, absolute timeout, dan idle timeout token.
 * Mengembalikan SessionPayload jika valid, atau null jika invalid/expired/revoked/dimanipulasi.
 */
export async function verifySessionToken(
  token: string | undefined | null,
  options?: { currentTime?: number }
): Promise<SessionPayload | null> {
  // Validate configuration outside the token parsing catch so a missing or weak
  // secret is reported as a deployment configuration error, not an invalid session.
  getSecretBytes();

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

    if (!payload.userId || !payload.role || !payload.iat || !payload.exp) {
      return null; // Format data sesi tidak lengkap
    }

    // 1. Cek apakah sesi sudah di-logout / di-revoke
    if (isSessionRevoked(payload.sessionId, sigEnc)) {
      return null;
    }

    const now = options?.currentTime ?? Math.floor(Date.now() / 1000);

    // 2. Validasi Absolute Timeout (maksimal 8 jam dari login awal)
    if (now >= payload.exp) {
      return null; // Batas mutlak sesi berakhir
    }

    // 3. Validasi Idle Timeout (30 menit tanpa aktivitas)
    const lastActive = typeof payload.lastActive === "number" ? payload.lastActive : payload.iat;
    if (now - lastActive > SESSION_IDLE_TIMEOUT) {
      return null; // Sesi idle lebih dari 30 menit
    }

    // 4. Perlindungan anomali jam masa depan (clock skew > 60 detik)
    if (payload.iat > now + 60 || lastActive > now + 60) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Opsi standar Cookie HttpOnly untuk sesi SIMARS.
 * - Tanpa maxAgeSeconds: menghasilkan Browser Session Cookie (berakhir saat browser ditutup).
 * - maxAgeSeconds = 0: menghapus cookie seketika.
 */
export function getCookieConfig(maxAgeSeconds?: number) {
  const isProduction = process.env.NODE_ENV === "production";
  const config: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge?: number;
    expires?: Date;
  } = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };

  if (typeof maxAgeSeconds === "number") {
    config.maxAge = maxAgeSeconds;
    if (maxAgeSeconds === 0) {
      config.expires = new Date(0);
    }
  }

  return config;
}
