const SALT = new Uint8Array([73,82,79,78,84,82,65,67,75,50,48,50,54,0,0,0]); // "IRONTRACK2026"
const IV_LEN = 12;

async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: SALT, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Encrypts plaintext with AES-256-GCM using PBKDF2 key derivation. Returns base64-encoded IV+ciphertext. */
export async function encrypt(plaintext: string, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const enc = new TextEncoder();
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  const combined = new Uint8Array(IV_LEN + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), IV_LEN);
  return btoa(String.fromCharCode(...combined));
}

/** Decrypts base64-encoded AES-256-GCM ciphertext using PBKDF2-derived key from passphrase. */
export async function decrypt(cipherB64: string, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase);
  const raw = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
  const iv = raw.slice(0, IV_LEN);
  const data = raw.slice(IV_LEN);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(plainBuf);
}
