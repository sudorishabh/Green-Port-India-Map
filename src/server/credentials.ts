// Shared by the API and the db scripts run with plain Node, so no "server-only"
// and no "@/" imports here.
import bcrypt from "bcryptjs";

const PASSWORD_SALT_ROUNDS = 10;

// Hash of a random, discarded password. Its cost ($10$) must match
// PASSWORD_SALT_ROUNDS so checking it takes as long as checking a real hash.
const UNKNOWN_USER_PASSWORD_HASH =
  "$2b$10$OD3maifmOPKYDVUl4K3t4eDMRFmupCIOm6GWIj9OkHITyekm9LtLW";

export function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

/**
 * Checks `password` against `passwordHash`. Without a hash (unknown email) it
 * still runs a full comparison and returns false, so response times don't
 * reveal which emails have accounts.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string | undefined,
) {
  const matches = await bcrypt.compare(
    password,
    passwordHash ?? UNKNOWN_USER_PASSWORD_HASH,
  );
  return matches && passwordHash !== undefined;
}

export function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}
