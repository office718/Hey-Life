// Dashboard passwords. scrypt, with a random salt stored next to the hash.
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const scryptAsync = (password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number }) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derived) => err ? reject(err) : resolve(derived as Buffer));
  });
const N = 16384;
const r = 8;
const p = 1;
const keyLen = 32;

export const MIN_PASSWORD_LENGTH = 8;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, keyLen, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const [scheme, n, rounds, parallel, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  try {
    const expected = Buffer.from(hash, "base64url");
    const actual = await scryptAsync(password, Buffer.from(salt, "base64url"), expected.length, {
      N: Number(n), r: Number(rounds), p: Number(parallel),
    });
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// Used when the login id does not exist, so the failure takes about as long as a real check.
let filler: Promise<string> | undefined;
export function fillerHash(): Promise<string> {
  filler ??= hashPassword("not-a-real-password");
  return filler;
}
