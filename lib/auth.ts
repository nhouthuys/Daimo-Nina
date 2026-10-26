/**
 * Single shared password for the whole team, gating every page behind
 * middleware.ts. No accounts, no database: the cookie just holds a hash of
 * APP_PASSWORD so middleware (Edge runtime) can verify it without a lookup.
 * Works in both Edge and Node runtimes (Web Crypto is available in both).
 */

export const AUTH_COOKIE_NAME = "daimo-nina-auth";

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** The cookie value a successful login sets. Null when APP_PASSWORD isn't configured (no gate). */
export async function expectedAuthToken(): Promise<string | null> {
  const password = process.env.APP_PASSWORD;
  if (!password) return null;
  return sha256Hex(password);
}
